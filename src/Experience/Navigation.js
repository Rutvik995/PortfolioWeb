import * as THREE from 'three'
import Experience from './Experience.js'
import normalizeWheel from 'normalize-wheel'
import gsap from 'gsap'
import { portfolioData } from '../data/portfolio.js'

export default class Navigation {
    constructor() {
        this.experience = new Experience()
        this.targetElement = this.experience.targetElement
        this.camera = this.experience.camera
        this.config = this.experience.config
        this.time = this.experience.time

        // Motion preference
        this.prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

        // State tracking
        this.isUserInteracting = false
        this.isTransitioning = false
        this.lastInteractionTime = performance.now()
        this.currentSectionName = 'hero'
        this.currentTween = null

        this.setView()
        this.initDebugHUD()
        this.initResizeObserver()
    }

    getFramingForSection(sectionName) {
        const aspect = (this.config.width && this.config.height) ? (this.config.width / this.config.height) : (window.innerWidth / window.innerHeight)
        const fov = this.camera.fov || 30
        return portfolioData.computeCameraFraming(sectionName, aspect, fov)
    }

    setView() {
        this.view = {}

        // Initial Overview computed framing
        const initialFraming = this.getFramingForSection('hero')
        this.currentSectionTarget = initialFraming

        const initialLook = new THREE.Vector3(...initialFraming.look)
        const initialPos = new THREE.Vector3(...initialFraming.pos)
        const initialOffset = initialPos.clone().sub(initialLook)
        const initialSpherical = new THREE.Spherical().setFromVector3(initialOffset)

        this.view.spherical = {}
        this.view.spherical.value = initialSpherical.clone()
        this.view.spherical.smoothed = initialSpherical.clone()
        this.view.spherical.smoothing = 0.008
        this.view.spherical.limits = {
            radius: { min: 1.5, max: 13.5 },
            phi: { min: Math.PI * 0.12, max: Math.PI * 0.44 },
            theta: { min: -0.6, max: 1.6 }
        }

        this.view.target = {}
        this.view.target.value = initialLook.clone()
        this.view.target.smoothed = initialLook.clone()
        this.view.target.smoothing = 0.008
        this.view.target.limits = {
            x: { min: -15, max: 15 },
            y: { min: -5, max: 15 },
            z: { min: -15, max: 15 }
        }

        this.view.drag = {}
        this.view.drag.delta = { x: 0, y: 0 }
        this.view.drag.previous = { x: 0, y: 0 }
        this.view.drag.sensitivity = 1.0
        this.view.drag.alternative = false

        this.view.zoom = {}
        this.view.zoom.sensitivity = 0.008
        this.view.zoom.delta = 0

        /**
         * Interaction Handlers
         */
        this.view.down = (_x, _y) => {
            if (this.currentTween) {
                this.currentTween.kill()
                this.currentTween = null
            }
            this.isTransitioning = false
            this.isUserInteracting = true
            this.lastInteractionTime = performance.now()
            this.dismissHint()

            this.view.drag.previous.x = _x
            this.view.drag.previous.y = _y
        }

        this.view.move = (_x, _y) => {
            this.isUserInteracting = true
            this.lastInteractionTime = performance.now()
            this.dismissHint()

            this.view.drag.delta.x += _x - this.view.drag.previous.x
            this.view.drag.delta.y += _y - this.view.drag.previous.y

            this.view.drag.previous.x = _x
            this.view.drag.previous.y = _y
        }

        this.view.up = () => {
            this.isUserInteracting = false
            this.lastInteractionTime = performance.now()
        }

        this.view.zoomIn = (_delta) => {
            if (this.currentTween) {
                this.currentTween.kill()
                this.currentTween = null
            }
            this.isTransitioning = false
            this.isUserInteracting = true
            this.lastInteractionTime = performance.now()
            this.dismissHint()

            this.view.zoom.delta += _delta
            setTimeout(() => {
                this.isUserInteracting = false
                this.lastInteractionTime = performance.now()
            }, 300)
        }

        /**
         * Mouse events
         */
        this.view.onMouseDown = (_event) => {
            _event.preventDefault()
            this.view.drag.alternative = _event.button === 2 || _event.button === 1 || _event.ctrlKey || _event.shiftKey
            this.view.down(_event.clientX, _event.clientY)

            window.addEventListener('mouseup', this.view.onMouseUp)
            window.addEventListener('mousemove', this.view.onMouseMove)
        }

        this.view.onMouseMove = (_event) => {
            _event.preventDefault()
            this.view.move(_event.clientX, _event.clientY)
        }

        this.view.onMouseUp = (_event) => {
            _event.preventDefault()
            this.view.up()
            window.removeEventListener('mouseup', this.view.onMouseUp)
            window.removeEventListener('mousemove', this.view.onMouseMove)
        }

        this.targetElement.addEventListener('mousedown', this.view.onMouseDown)

        /**
         * Touch events
         */
        this.view.onTouchStart = (_event) => {
            this.view.drag.alternative = _event.touches.length > 1
            this.view.down(_event.touches[0].clientX, _event.touches[0].clientY)

            window.addEventListener('touchend', this.view.onTouchEnd)
            window.addEventListener('touchmove', this.view.onTouchMove, { passive: false })
        }

        this.view.onTouchMove = (_event) => {
            if (_event.cancelable) _event.preventDefault()
            this.view.move(_event.touches[0].clientX, _event.touches[0].clientY)
        }

        this.view.onTouchEnd = (_event) => {
            this.view.up()
            window.removeEventListener('touchend', this.view.onTouchEnd)
            window.removeEventListener('touchmove', this.view.onTouchMove)
        }

        this.targetElement.addEventListener('touchstart', this.view.onTouchStart, { passive: false })

        /**
         * Context menu
         */
        this.view.onContextMenu = (_event) => {
            _event.preventDefault()
        }
        this.targetElement.addEventListener('contextmenu', this.view.onContextMenu)

        /**
         * Wheel
         */
        this.view.onWheel = (_event) => {
            _event.preventDefault()
            const normalized = normalizeWheel(_event)
            this.view.zoomIn(normalized.pixelY)
        }
        this.targetElement.addEventListener('wheel', this.view.onWheel, { passive: false })
    }

    initResizeObserver() {
        if (window.ResizeObserver && this.targetElement) {
            this.resizeObserver = new ResizeObserver(() => {
                this.recomputeFraming()
            })
            this.resizeObserver.observe(this.targetElement)
        }
        window.addEventListener('resize', () => {
            this.recomputeFraming()
        })
    }

    recomputeFraming() {
        if (this.currentSectionName && !this.isUserInteracting) {
            const framing = this.getFramingForSection(this.currentSectionName)
            this.currentSectionTarget = framing
            this.goToTarget(framing, 0.4, 'power1.out')
        }
    }

    dismissHint() {
        const hint = document.querySelector('.room-hint')
        if (hint && !hint.classList.contains('fade-out')) {
            hint.classList.add('fade-out')
        }
    }

    goToSection(sectionName, duration = 1.5) {
        this.currentSectionName = sectionName
        const framing = this.getFramingForSection(sectionName)
        this.currentSectionTarget = framing
        this.goToTarget(framing, duration)
    }

    goToTarget(target, duration = 1.5, ease = 'power2.inOut') {
        const targetLook = new THREE.Vector3(target.look[0], target.look[1], target.look[2])
        const targetPos = new THREE.Vector3(target.pos[0], target.pos[1], target.pos[2])
        const offset = targetPos.clone().sub(targetLook)
        const targetSpherical = new THREE.Spherical().setFromVector3(offset)

        // Shortest arc rotation for theta
        let diffTheta = targetSpherical.theta - this.view.spherical.value.theta
        while (diffTheta > Math.PI) diffTheta -= 2 * Math.PI
        while (diffTheta < -Math.PI) diffTheta += 2 * Math.PI
        const destTheta = this.view.spherical.value.theta + diffTheta

        if (this.prefersReducedMotion || duration === 0) {
            this.view.target.value.copy(targetLook)
            this.view.target.smoothed.copy(targetLook)
            this.view.spherical.value.radius = targetSpherical.radius
            this.view.spherical.value.phi = targetSpherical.phi
            this.view.spherical.value.theta = destTheta
            this.view.spherical.smoothed.radius = targetSpherical.radius
            this.view.spherical.smoothed.phi = targetSpherical.phi
            this.view.spherical.smoothed.theta = destTheta
            return
        }

        if (this.currentTween) {
            this.currentTween.kill()
        }

        this.isTransitioning = true

        const animObj = {
            tx: this.view.target.value.x,
            ty: this.view.target.value.y,
            tz: this.view.target.value.z,
            radius: this.view.spherical.value.radius,
            phi: this.view.spherical.value.phi,
            theta: this.view.spherical.value.theta
        }

        this.currentTween = gsap.to(animObj, {
            tx: targetLook.x,
            ty: targetLook.y,
            tz: targetLook.z,
            radius: targetSpherical.radius,
            phi: targetSpherical.phi,
            theta: destTheta,
            duration: duration,
            ease: ease,
            onUpdate: () => {
                this.view.target.value.set(animObj.tx, animObj.ty, animObj.tz)
                this.view.target.smoothed.set(animObj.tx, animObj.ty, animObj.tz)
                this.view.spherical.value.radius = animObj.radius
                this.view.spherical.value.phi = animObj.phi
                this.view.spherical.value.theta = animObj.theta
                this.view.spherical.smoothed.radius = animObj.radius
                this.view.spherical.smoothed.phi = animObj.phi
                this.view.spherical.smoothed.theta = animObj.theta
            },
            onComplete: () => {
                this.isTransitioning = false
                this.currentTween = null
            }
        })
    }

    getDistanceFromSectionTarget() {
        if (!this.currentSectionTarget) return 0
        const targetLook = new THREE.Vector3(
            this.currentSectionTarget.look[0],
            this.currentSectionTarget.look[1],
            this.currentSectionTarget.look[2]
        )
        const targetPos = new THREE.Vector3(
            this.currentSectionTarget.pos[0],
            this.currentSectionTarget.pos[1],
            this.currentSectionTarget.pos[2]
        )
        const offset = targetPos.clone().sub(targetLook)
        const targetSpherical = new THREE.Spherical().setFromVector3(offset)

        const dRadius = Math.abs(this.view.spherical.value.radius - targetSpherical.radius)
        const dPhi = Math.abs(this.view.spherical.value.phi - targetSpherical.phi)
        let dTheta = Math.abs(this.view.spherical.value.theta - targetSpherical.theta)
        while (dTheta > Math.PI) dTheta -= 2 * Math.PI
        dTheta = Math.abs(dTheta)

        return dRadius + dPhi + dTheta
    }

    initDebugHUD() {
        this.hud = document.createElement('div')
        this.hud.id = 'camera-debug-hud'
        this.hud.style.cssText = `
            position: fixed;
            top: 74px;
            right: 20px;
            background: rgba(3, 7, 18, 0.94);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            border: 1px solid rgba(56, 189, 248, 0.4);
            border-radius: 8px;
            padding: 12px 16px;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 11px;
            color: #f8fafc;
            z-index: 9999;
            pointer-events: none;
            display: none;
            box-shadow: 0 10px 30px rgba(0,0,0,0.7);
            line-height: 1.6;
        `
        document.body.appendChild(this.hud)

        window.addEventListener('keydown', (e) => {
            if (e.key === 'd' || e.key === 'D') {
                if (this.hud) {
                    const isVisible = this.hud.style.display === 'block'
                    this.hud.style.display = isVisible ? 'none' : 'block'
                }
            } else if (e.key === 'p' || e.key === 'P') {
                this.logCurrentTarget()
            }
        })
    }

    updateDebugHUD() {
        if (!this.hud || this.hud.style.display !== 'block') return

        const camPos = this.camera.modes.default.instance.position
        const target = this.view.target.smoothed
        const dist = camPos.distanceTo(target)
        const aspect = (this.config.width / (this.config.height || 1)).toFixed(3)

        this.hud.innerHTML = `
            <div style="color: #38bdf8; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px; margin-bottom: 6px;">
                🎥 CAMERA FRAMING HUD (Press D to toggle, P to log)
            </div>
            <div>Target: <span style="color:#c084fc; font-weight:bold">${this.currentSectionName}</span></div>
            <div>Pos: [${camPos.x.toFixed(2)}, ${camPos.y.toFixed(2)}, ${camPos.z.toFixed(2)}]</div>
            <div>Look: [${target.x.toFixed(2)}, ${target.y.toFixed(2)}, ${target.z.toFixed(2)}]</div>
            <div>Dist: <span style="color:#34d399">${dist.toFixed(2)}m</span> | FOV: ${this.camera.fov || 30}°</div>
            <div>Panel: ${Math.round(this.config.width)}x${Math.round(this.config.height)} (aspect: ${aspect})</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Wall Clamped: inside [-4.8..12, 0.5..10, -4.8..11]</div>
        `
    }

    logCurrentTarget() {
        const camPos = this.camera.modes.default.instance.position
        const target = this.view.target.smoothed
        const dist = camPos.distanceTo(target)
        const data = {
            section: this.currentSectionName,
            look: [parseFloat(target.x.toFixed(3)), parseFloat(target.y.toFixed(3)), parseFloat(target.z.toFixed(3))],
            pos: [parseFloat(camPos.x.toFixed(3)), parseFloat(camPos.y.toFixed(3)), parseFloat(camPos.z.toFixed(3))],
            dist: parseFloat(dist.toFixed(2)),
            aspect: parseFloat((this.config.width / (this.config.height || 1)).toFixed(3))
        }
        console.log('📸 [CAMERA FRAMING LOG]:', JSON.stringify(data, null, 2))
        if (this.hud) {
            this.hud.style.display = 'block'
        }
    }

    update() {
        const now = performance.now()

        // 4-second idle auto-return
        if (!this.isUserInteracting && !this.isTransitioning && this.currentSectionTarget) {
            if (now - this.lastInteractionTime > 4000) {
                const diff = this.getDistanceFromSectionTarget()
                if (diff > 0.08) {
                    this.goToTarget(this.currentSectionTarget, 1.4, 'power2.out')
                }
            }
        }

        // Apply drag input
        if (this.view.drag.alternative) {
            const up = new THREE.Vector3(0, 1, 0)
            const right = new THREE.Vector3(-1, 0, 0)

            up.applyQuaternion(this.camera.modes.default.instance.quaternion)
            right.applyQuaternion(this.camera.modes.default.instance.quaternion)

            up.multiplyScalar(this.view.drag.delta.y * 0.01)
            right.multiplyScalar(this.view.drag.delta.x * 0.01)

            this.view.target.value.add(up)
            this.view.target.value.add(right)
        } else {
            this.view.spherical.value.theta -= (this.view.drag.delta.x * this.view.drag.sensitivity) / this.config.smallestSide
            this.view.spherical.value.phi -= (this.view.drag.delta.y * this.view.drag.sensitivity) / this.config.smallestSide
        }

        // Apply zoom input
        this.view.spherical.value.radius += this.view.zoom.delta * this.view.zoom.sensitivity
        this.view.spherical.value.radius = Math.min(
            Math.max(this.view.spherical.value.radius, this.view.spherical.limits.radius.min),
            this.view.spherical.limits.radius.max
        )

        // Reset per-frame deltas
        this.view.drag.delta.x = 0
        this.view.drag.delta.y = 0
        this.view.zoom.delta = 0

        // Clamp spherical phi
        this.view.spherical.value.phi = Math.min(
            Math.max(this.view.spherical.value.phi, this.view.spherical.limits.phi.min),
            this.view.spherical.limits.phi.max
        )

        // Clamp spherical theta (keeps camera in front of room, preventing orbiting into exterior diorama void)
        if (isFinite(this.view.spherical.limits.theta.min)) {
            this.view.spherical.value.theta = Math.min(
                Math.max(this.view.spherical.value.theta, this.view.spherical.limits.theta.min),
                this.view.spherical.limits.theta.max
            )
        }

        // Smoothing (only when not driven directly by transition tween)
        if (!this.isTransitioning) {
            this.view.spherical.smoothed.radius += (this.view.spherical.value.radius - this.view.spherical.smoothed.radius) * this.view.spherical.smoothing * this.time.delta
            this.view.spherical.smoothed.phi += (this.view.spherical.value.phi - this.view.spherical.smoothed.phi) * this.view.spherical.smoothing * this.time.delta
            this.view.spherical.smoothed.theta += (this.view.spherical.value.theta - this.view.spherical.smoothed.theta) * this.view.spherical.smoothing * this.time.delta

            this.view.target.smoothed.x += (this.view.target.value.x - this.view.target.smoothed.x) * this.view.target.smoothing * this.time.delta
            this.view.target.smoothed.y += (this.view.target.value.y - this.view.target.smoothed.y) * this.view.target.smoothing * this.time.delta
            this.view.target.smoothed.z += (this.view.target.value.z - this.view.target.smoothed.z) * this.view.target.smoothing * this.time.delta
        }

        // Subtle idle orbit when on hero/overview section
        if (
            (this.currentSectionName === 'hero' || this.currentSectionName === 'overview') &&
            !this.isUserInteracting &&
            !this.isTransitioning &&
            !this.prefersReducedMotion
        ) {
            const idleWobble = Math.sin(this.time.elapsed * 0.0005) * 0.0003
            this.view.spherical.smoothed.theta += idleWobble
        }

        // Reconstruct position and update camera
        const viewPosition = new THREE.Vector3()
        viewPosition.setFromSpherical(this.view.spherical.smoothed)
        viewPosition.add(this.view.target.smoothed)

        // Wall & boundary safety clamping so camera never clips through walls or furniture
        viewPosition.x = Math.max(-4.8, Math.min(12.0, viewPosition.x))
        viewPosition.y = Math.max(0.5, Math.min(10.0, viewPosition.y))
        viewPosition.z = Math.max(-4.8, Math.min(11.0, viewPosition.z))

        this.camera.modes.default.instance.position.copy(viewPosition)
        this.camera.modes.default.instance.lookAt(this.view.target.smoothed)

        this.updateDebugHUD()
    }

    destroy() {
        if (this.currentTween) {
            this.currentTween.kill()
        }
        if (this.resizeObserver) {
            this.resizeObserver.disconnect()
        }
        if (this.hud && this.hud.parentElement) {
            this.hud.parentElement.removeChild(this.hud)
        }
    }
}
