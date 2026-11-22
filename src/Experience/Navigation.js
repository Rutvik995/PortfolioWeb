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

        // Room interior bounding box & obstacle geometry for collision prevention
        this.roomTargetBounds = {
            x: { min: -3.2, max: 3.8 },
            y: { min: 0.4, max: 2.8 },
            z: { min: -3.8, max: 3.0 }
        }

        this.roomCameraBounds = {
            min: new THREE.Vector3(-6.0, 0.35, -6.0),
            max: new THREE.Vector3(25.0, 20.0, 30.0)
        }

        // Window frame obstacle box (window on right wall with neon strip & bars)
        this.windowObstacleBox = new THREE.Box3(
            new THREE.Vector3(3.3, 0.7, -1.7),
            new THREE.Vector3(4.3, 3.3, 1.4)
        )

        this.setView()
        this.initKeyboardNavigation()
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

        this.overviewRadius = initialSpherical.radius

        this.view.spherical = {}
        this.view.spherical.value = initialSpherical.clone()
        this.view.spherical.smoothed = initialSpherical.clone()
        this.view.spherical.smoothing = 0.009
        this.view.spherical.limits = {
            radius: { min: 0.6, max: Math.max(22.0, initialSpherical.radius + 4.0) },
            phi: { min: Math.PI * 0.08, max: Math.PI * 0.48 },
            theta: { min: -Math.PI * 0.95, max: Math.PI * 0.95 }
        }

        this.view.target = {}
        this.view.target.value = initialLook.clone()
        this.view.target.smoothed = initialLook.clone()
        this.view.target.smoothing = 0.009
        this.view.target.limits = this.roomTargetBounds

        this.view.drag = {}
        this.view.drag.delta = { x: 0, y: 0 }
        this.view.drag.previous = { x: 0, y: 0 }
        this.view.drag.orbitSensitivity = 1.0
        this.view.drag.panSensitivity = 1.0
        this.view.drag.alternative = false

        // Touch tracking
        this.touchState = {
            count: 0,
            prevMidX: 0,
            prevMidY: 0,
            prevDist: 0
        }

        this.view.zoom = {}
        this.view.zoom.delta = 0

        /**
         * Interaction Handlers
         */
        this.view.down = (_x, _y, isAlternative = false) => {
            if (this.currentTween) {
                this.currentTween.kill()
                this.currentTween = null
            }
            this.isTransitioning = false
            this.isUserInteracting = true
            this.lastInteractionTime = performance.now()
            this.dismissHint()

            this.view.drag.alternative = isAlternative
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

            // Smooth distance-scaled zoom step
            const currentR = this.view.spherical.smoothed.radius
            const zoomSpeed = 0.0022 * Math.max(0.4, currentR / 5.5)
            this.view.spherical.value.radius += _delta * zoomSpeed
            this.view.spherical.value.radius = THREE.MathUtils.clamp(
                this.view.spherical.value.radius,
                this.view.spherical.limits.radius.min,
                this.view.spherical.limits.radius.max
            )

            setTimeout(() => {
                this.isUserInteracting = false
                this.lastInteractionTime = performance.now()
            }, 300)
        }

        /**
         * Mouse events:
         * Left-drag: Orbit
         * Right-drag, Middle-drag, or Shift/Ctrl-drag: Pan
         */
        this.view.onMouseDown = (_event) => {
            _event.preventDefault()
            const isPan = _event.button === 2 || _event.button === 1 || _event.shiftKey || _event.ctrlKey
            this.view.down(_event.clientX, _event.clientY, isPan)

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
         * Touch events:
         * 1 finger = Orbit
         * 2 fingers = Pan (midpoint movement) + Zoom (pinch distance)
         */
        this.view.onTouchStart = (_event) => {
            if (_event.cancelable) _event.preventDefault()
            if (this.currentTween) {
                this.currentTween.kill()
                this.currentTween = null
            }
            this.isTransitioning = false
            this.isUserInteracting = true
            this.dismissHint()

            if (_event.touches.length === 1) {
                this.touchState.count = 1
                this.view.down(_event.touches[0].clientX, _event.touches[0].clientY, false)
            } else if (_event.touches.length >= 2) {
                this.touchState.count = 2
                const t0 = _event.touches[0]
                const t1 = _event.touches[1]
                this.touchState.prevMidX = (t0.clientX + t1.clientX) / 2
                this.touchState.prevMidY = (t0.clientY + t1.clientY) / 2
                this.touchState.prevDist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY)
                this.view.down(this.touchState.prevMidX, this.touchState.prevMidY, true)
            }

            window.addEventListener('touchend', this.view.onTouchEnd)
            window.addEventListener('touchmove', this.view.onTouchMove, { passive: false })
        }

        this.view.onTouchMove = (_event) => {
            if (_event.cancelable) _event.preventDefault()
            this.isUserInteracting = true
            this.dismissHint()

            if (_event.touches.length === 1) {
                this.view.move(_event.touches[0].clientX, _event.touches[0].clientY)
            } else if (_event.touches.length >= 2) {
                const t0 = _event.touches[0]
                const t1 = _event.touches[1]
                const midX = (t0.clientX + t1.clientX) / 2
                const midY = (t0.clientY + t1.clientY) / 2
                const dist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY)

                // Midpoint pan delta
                const dMidX = midX - this.touchState.prevMidX
                const dMidY = midY - this.touchState.prevMidY

                this.view.drag.alternative = true
                this.view.drag.delta.x += dMidX
                this.view.drag.delta.y += dMidY

                // Pinch zoom delta
                const dDist = dist - this.touchState.prevDist
                if (Math.abs(dDist) > 1) {
                    this.view.zoomIn(-dDist * 3.5)
                }

                this.touchState.prevMidX = midX
                this.touchState.prevMidY = midY
                this.touchState.prevDist = dist
            }
        }

        this.view.onTouchEnd = (_event) => {
            if (_event.touches.length === 0) {
                this.view.up()
                this.touchState.count = 0
                window.removeEventListener('touchend', this.view.onTouchEnd)
                window.removeEventListener('touchmove', this.view.onTouchMove)
            } else if (_event.touches.length === 1) {
                this.touchState.count = 1
                this.view.down(_event.touches[0].clientX, _event.touches[0].clientY, false)
            }
        }

        this.targetElement.addEventListener('touchstart', this.view.onTouchStart, { passive: false })

        /**
         * Context menu prevent
         */
        this.view.onContextMenu = (_event) => {
            _event.preventDefault()
        }
        this.targetElement.addEventListener('contextmenu', this.view.onContextMenu)

        /**
         * Mouse wheel zoom
         */
        this.view.onWheel = (_event) => {
            _event.preventDefault()
            const normalized = normalizeWheel(_event)
            this.view.zoomIn(normalized.pixelY)
        }
        this.targetElement.addEventListener('wheel', this.view.onWheel, { passive: false })
    }

    initKeyboardNavigation() {
        this.onKeyDown = (e) => {
            // Ignore when typing inside input or textarea or button has focus
            const activeTag = document.activeElement ? document.activeElement.tagName : ''
            if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return

            const cam = this.camera.modes.default.instance
            const right = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion)
            const up = new THREE.Vector3(0, 1, 0).applyQuaternion(cam.quaternion)
            const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion)
            forward.y = 0
            if (forward.lengthSq() > 0.001) forward.normalize()

            const currentR = this.view.spherical.smoothed.radius
            const panSpeed = 0.12 * Math.max(0.4, currentR / 5.5)

            let handled = false

            if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
                this.dismissHint()
                this.view.target.value.addScaledVector(forward, panSpeed)
                handled = true
            } else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
                this.dismissHint()
                this.view.target.value.addScaledVector(forward, -panSpeed)
                handled = true
            } else if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
                this.dismissHint()
                this.view.target.value.addScaledVector(right, -panSpeed)
                handled = true
            } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
                this.dismissHint()
                this.view.target.value.addScaledVector(right, panSpeed)
                handled = true
            } else if (e.key === 'q' || e.key === 'Q') {
                this.dismissHint()
                this.view.target.value.y -= panSpeed
                handled = true
            } else if (e.key === 'e' || e.key === 'E') {
                this.dismissHint()
                this.view.target.value.y += panSpeed
                handled = true
            } else if (e.key === '+' || e.key === '=') {
                this.dismissHint()
                this.view.zoomIn(-80)
                handled = true
            } else if (e.key === '-' || e.key === '_') {
                this.dismissHint()
                this.view.zoomIn(80)
                handled = true
            }

            if (handled) {
                // Clamp target immediately
                this.clampTargetToBounds()
            }
        }

        window.addEventListener('keydown', this.onKeyDown)
    }

    clampTargetToBounds() {
        this.view.target.value.x = THREE.MathUtils.clamp(
            this.view.target.value.x,
            this.roomTargetBounds.x.min,
            this.roomTargetBounds.x.max
        )
        this.view.target.value.y = THREE.MathUtils.clamp(
            this.view.target.value.y,
            this.roomTargetBounds.y.min,
            this.roomTargetBounds.y.max
        )
        this.view.target.value.z = THREE.MathUtils.clamp(
            this.view.target.value.z,
            this.roomTargetBounds.z.min,
            this.roomTargetBounds.z.max
        )
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

    goToSection(sectionName, duration = 1.2) {
        this.currentSectionName = sectionName
        const framing = this.getFramingForSection(sectionName)
        this.currentSectionTarget = framing
        this.goToTarget(framing, duration)
    }

    resetToOverview() {
        this.goToSection('hero', 1.2)
    }

    goToTarget(target, duration = 1.2, ease = 'power2.out') {
        const targetLook = new THREE.Vector3(target.look[0], target.look[1], target.look[2])
        const targetPos = new THREE.Vector3(target.pos[0], target.pos[1], target.pos[2])

        const cam = this.camera.modes.default.instance
        const startPos = cam.position.clone()
        const startLook = this.view.target.smoothed.clone()

        if (this.prefersReducedMotion || duration === 0) {
            cam.position.copy(targetPos)
            cam.lookAt(targetLook)
            this.view.target.value.copy(targetLook)
            this.view.target.smoothed.copy(targetLook)

            const offset = targetPos.clone().sub(targetLook)
            this.view.spherical.value.setFromVector3(offset)
            this.view.spherical.smoothed.setFromVector3(offset)
            this.isTransitioning = false
            return
        }

        if (this.currentTween) {
            this.currentTween.kill()
            this.currentTween = null
        }

        this.isTransitioning = true

        const anim = { t: 0 }

        this.currentTween = gsap.to(anim, {
            t: 1,
            duration: duration,
            ease: ease,
            onUpdate: () => {
                // Ultra-smooth direct 3D vector interpolation without spherical coordinate distortion
                const curPos = startPos.clone().lerp(targetPos, anim.t)
                const curLook = startLook.clone().lerp(targetLook, anim.t)

                cam.position.copy(curPos)
                cam.lookAt(curLook)

                this.view.target.value.copy(curLook)
                this.view.target.smoothed.copy(curLook)
            },
            onComplete: () => {
                cam.position.copy(targetPos)
                cam.lookAt(targetLook)

                this.view.target.value.copy(targetLook)
                this.view.target.smoothed.copy(targetLook)

                const finalOffset = targetPos.clone().sub(targetLook)
                this.view.spherical.value.setFromVector3(finalOffset)
                this.view.spherical.smoothed.setFromVector3(finalOffset)

                this.isTransitioning = false
                this.currentTween = null
            }
        })
    }

    update() {
        // While camera is gliding into a zone, let the cinematic tween own the camera
        if (this.isTransitioning) {
            return
        }

        const currentRadius = this.view.spherical.smoothed.radius

        // Apply drag input
        if (this.view.drag.alternative) {
            // PAN: Move focus point sideways/up/down in camera screen space
            const camQuat = this.camera.modes.default.instance.quaternion
            const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camQuat)
            const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camQuat)

            // Pan speed scales smoothly with current distance
            const panFactor = (currentRadius * 0.0016) * this.view.drag.panSensitivity

            this.view.target.value.addScaledVector(right, -this.view.drag.delta.x * panFactor)
            this.view.target.value.addScaledVector(up, this.view.drag.delta.y * panFactor)

            // Clamp focus point to room interior bounding box
            this.clampTargetToBounds()
        } else {
            // ORBIT: Rotate around current focus point, scaled by distance
            const orbitFactor = Math.max(0.4, Math.min(1.4, currentRadius / 7.0)) * this.view.drag.orbitSensitivity
            this.view.spherical.value.theta -= (this.view.drag.delta.x * orbitFactor) / this.config.smallestSide
            this.view.spherical.value.phi -= (this.view.drag.delta.y * orbitFactor) / this.config.smallestSide
        }

        // Reset per-frame deltas
        this.view.drag.delta.x = 0
        this.view.drag.delta.y = 0

        // Clamp spherical angles
        this.view.spherical.value.phi = THREE.MathUtils.clamp(
            this.view.spherical.value.phi,
            this.view.spherical.limits.phi.min,
            this.view.spherical.limits.phi.max
        )

        this.view.spherical.value.theta = THREE.MathUtils.clamp(
            this.view.spherical.value.theta,
            this.view.spherical.limits.theta.min,
            this.view.spherical.limits.theta.max
        )

        // Smoothing (when not driven by transition tween)
        if (!this.isTransitioning) {
            const dt = Math.min(this.time.delta, 50)
            this.view.spherical.smoothed.radius += (this.view.spherical.value.radius - this.view.spherical.smoothed.radius) * this.view.spherical.smoothing * dt
            this.view.spherical.smoothed.phi += (this.view.spherical.value.phi - this.view.spherical.smoothed.phi) * this.view.spherical.smoothing * dt
            this.view.spherical.smoothed.theta += (this.view.spherical.value.theta - this.view.spherical.smoothed.theta) * this.view.spherical.smoothing * dt

            this.view.target.smoothed.x += (this.view.target.value.x - this.view.target.smoothed.x) * this.view.target.smoothing * dt
            this.view.target.smoothed.y += (this.view.target.value.y - this.view.target.smoothed.y) * this.view.target.smoothing * dt
            this.view.target.smoothed.z += (this.view.target.value.z - this.view.target.smoothed.z) * this.view.target.smoothing * dt
        }

        // Reconstruct position from spherical offset + target
        const viewPosition = new THREE.Vector3()
        viewPosition.setFromSpherical(this.view.spherical.smoothed)
        viewPosition.add(this.view.target.smoothed)

        // Collision Check & Clamping against walls & window frame
        const focusPt = this.view.target.smoothed
        const toCam = viewPosition.clone().sub(focusPt)
        let camDist = toCam.length()
        const camDir = camDist > 0.001 ? toCam.clone().normalize() : new THREE.Vector3(0, 0, 1)

        // 1. Room perimeter box clamping
        const clampedPos = viewPosition.clone().clamp(this.roomCameraBounds.min, this.roomCameraBounds.max)
        if (clampedPos.distanceToSquared(viewPosition) > 0.0001) {
            viewPosition.copy(clampedPos)
            camDist = viewPosition.distanceTo(focusPt)
        }

        // 2. Window frame obstacle collision (pull camera forward toward target if inside window obstacle)
        if (this.windowObstacleBox.containsPoint(viewPosition)) {
            let iterations = 0
            while (this.windowObstacleBox.containsPoint(viewPosition) && camDist > 0.6 && iterations < 30) {
                viewPosition.addScaledVector(camDir, -0.08)
                camDist = viewPosition.distanceTo(focusPt)
                iterations++
            }
            // Add safety margin
            viewPosition.addScaledVector(camDir, -0.12)
            camDist = viewPosition.distanceTo(focusPt)

            // Keep radius in sync so zoom doesn't freeze or get sticky
            this.view.spherical.value.radius = Math.max(0.6, camDist)
            this.view.spherical.smoothed.radius = Math.max(0.6, camDist)
        }

        this.camera.modes.default.instance.position.copy(viewPosition)
        this.camera.modes.default.instance.lookAt(this.view.target.smoothed)
    }

    destroy() {
        if (this.currentTween) {
            this.currentTween.kill()
        }
        if (this.resizeObserver) {
            this.resizeObserver.disconnect()
        }
        if (this.onKeyDown) {
            window.removeEventListener('keydown', this.onKeyDown)
        }
    }
}
