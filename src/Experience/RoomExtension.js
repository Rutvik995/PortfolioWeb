import * as THREE from 'three'
import Experience from './Experience.js'

export default class RoomExtension {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.time = this.experience.time

        this.group = new THREE.Group()
        this.group.name = 'roomExtension'

        this.setFloorExtension()
        this.setWallExtensions()
        this.setArchitecturalDetails()
        this.setAtmosphericDome()

        this.scene.add(this.group)
    }

    setFloorExtension() {
        // Extended floor covering the entire ground plane beyond the room boundary
        const floorGeo = new THREE.PlaneGeometry(80, 80)
        floorGeo.rotateX(-Math.PI * 0.5)

        // Custom shader material matching the warm wooden room floor with ambient falloff
        const floorMat = new THREE.ShaderMaterial({
            uniforms: {
                uRoomFloorColor: { value: new THREE.Color('#221712') },
                uOuterFloorColor: { value: new THREE.Color('#0d0a08') },
                uTvLightColor: { value: new THREE.Color('#ff115e') },
                uDeskLightColor: { value: new THREE.Color('#ff6700') }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPos = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPos.xyz;
                    gl_Position = projectionMatrix * viewMatrix * worldPos;
                }
            `,
            fragmentShader: `
                uniform vec3 uRoomFloorColor;
                uniform vec3 uOuterFloorColor;
                uniform vec3 uTvLightColor;
                uniform vec3 uDeskLightColor;
                varying vec3 vWorldPosition;

                void main() {
                    float dist = length(vWorldPosition.xz - vec2(0.5, -0.5));
                    float blend = smoothstep(3.5, 18.0, dist);
                    vec3 col = mix(uRoomFloorColor, uOuterFloorColor, blend);

                    // Soft TV light bounce on the right side floor
                    float tvBounce = smoothstep(10.0, 1.0, length(vWorldPosition.xz - vec2(4.2, 1.8))) * 0.28;
                    col += uTvLightColor * tvBounce;

                    // Soft desk light bounce near center-back floor
                    float deskBounce = smoothstep(8.0, 1.0, length(vWorldPosition.xz - vec2(0.3, -3.5))) * 0.22;
                    col += uDeskLightColor * deskBounce;

                    gl_FragColor = vec4(col, 1.0);
                }
            `
        })

        this.floor = new THREE.Mesh(floorGeo, floorMat)
        this.floor.position.y = -0.005
        this.group.add(this.floor)
    }

    setWallExtensions() {
        // Left Interior Wall Extension (continues behind and to the left of the bookshelf)
        const leftWallGeo = new THREE.PlaneGeometry(16, 8)
        leftWallGeo.rotateY(Math.PI * 0.5) // Faces towards +X into the room

        const wallMat = new THREE.ShaderMaterial({
            uniforms: {
                uWallBase: { value: new THREE.Color('#dfd2c8') },
                uWallShadow: { value: new THREE.Color('#2a1e18') },
                uDeskGlow: { value: new THREE.Color('#ff6700') }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    vec4 worldPos = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPos.xyz;
                    gl_Position = projectionMatrix * viewMatrix * worldPos;
                }
            `,
            fragmentShader: `
                uniform vec3 uWallBase;
                uniform vec3 uWallShadow;
                uniform vec3 uDeskGlow;
                varying vec3 vWorldPosition;
                varying vec2 vUv;

                void main() {
                    // Vertical gradient (warm shadow near floor)
                    float vFactor = smoothstep(0.0, 4.5, vWorldPosition.y);
                    vec3 col = mix(uWallShadow, uWallBase, vFactor);

                    // Ambient glow from desk strip behind bookshelf
                    float deskLight = smoothstep(8.0, 0.5, length(vWorldPosition.yz - vec2(2.5, -3.5))) * 0.35;
                    col += uDeskGlow * deskLight;

                    // Edge vignetting to merge softly
                    float edgeBlend = smoothstep(7.0, 3.0, abs(vWorldPosition.z - (-0.5)));
                    gl_FragColor = vec4(col * edgeBlend, 1.0);
                }
            `
        })

        this.leftWall = new THREE.Mesh(leftWallGeo, wallMat)
        this.leftWall.position.set(-4.16, 3.0, -0.5)
        this.group.add(this.leftWall)

        // Architectural Skirting / Baseboard along left wall
        const baseboardGeo = new THREE.BoxGeometry(0.08, 0.22, 16)
        const baseboardMat = new THREE.MeshBasicMaterial({ color: 0x1f1612 })
        const baseboard = new THREE.Mesh(baseboardGeo, baseboardMat)
        baseboard.position.set(-4.14, 0.11, -0.5)
        this.group.add(baseboard)

        // Back Wall Extension (continues left behind the bookshelf)
        const backWallGeo = new THREE.PlaneGeometry(12, 8)
        const backWall = new THREE.Mesh(backWallGeo, wallMat)
        backWall.position.set(-8.5, 3.0, -4.86)
        this.group.add(backWall)
    }

    setArchitecturalDetails() {
        // 1. Sleek Framed Artwork on the extended left wall (covers the empty void)
        const frameGeo = new THREE.BoxGeometry(0.04, 2.4, 1.8)
        const frameMat = new THREE.MeshBasicMaterial({ color: 0x18181b })
        const frame = new THREE.Mesh(frameGeo, frameMat)
        frame.position.set(-4.13, 3.2, 1.6)
        this.group.add(frame)

        // Canvas inside frame with generative geometric art
        const canvas = document.createElement('canvas')
        canvas.width = 512
        canvas.height = 680
        const ctx = canvas.getContext('2d')

        // Dark modern art design
        ctx.fillStyle = '#0f172a'
        ctx.fillRect(0, 0, 512, 680)

        // Geometric gradients
        const grad = ctx.createLinearGradient(60, 80, 440, 580)
        grad.addColorStop(0, '#38bdf8')
        grad.addColorStop(0.5, '#c084fc')
        grad.addColorStop(1, '#ff115e')

        ctx.strokeStyle = grad
        ctx.lineWidth = 6
        ctx.beginPath()
        ctx.arc(256, 300, 150, 0, Math.PI * 2)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(140, 450)
        ctx.lineTo(372, 450)
        ctx.lineTo(256, 180)
        ctx.closePath()
        ctx.stroke()

        ctx.font = '700 22px monospace'
        ctx.fillStyle = '#94a3b8'
        ctx.textAlign = 'center'
        ctx.fillText('COMPOUND AI ARCHITECTURE', 256, 560)
        ctx.font = '500 16px monospace'
        ctx.fillStyle = '#38bdf8'
        ctx.fillText('AUTONOMOUS AGENTS • 2026', 256, 595)

        const canvasTexture = new THREE.CanvasTexture(canvas)
        canvasTexture.encoding = THREE.sRGBEncoding

        const artGeo = new THREE.PlaneGeometry(1.7, 2.3)
        artGeo.rotateY(Math.PI * 0.5)
        const artMat = new THREE.MeshBasicMaterial({ map: canvasTexture, toneMapped: false })
        const art = new THREE.Mesh(artGeo, artMat)
        art.position.set(-4.10, 3.2, 1.6)
        this.group.add(art)

        // 2. Warm Architectural Light Column in the left corner
        const lightColumnGeo = new THREE.CylinderGeometry(0.04, 0.04, 4.8, 16)
        const lightColumnMat = new THREE.MeshBasicMaterial({ color: 0xffaa55, toneMapped: false })
        const lightColumn = new THREE.Mesh(lightColumnGeo, lightColumnMat)
        lightColumn.position.set(-4.12, 2.4, -4.75)
        this.group.add(lightColumn)

        // Soft glow halo plane behind light column
        const glowGeo = new THREE.PlaneGeometry(1.4, 5.2)
        glowGeo.rotateY(Math.PI * 0.5)
        const glowMat = new THREE.ShaderMaterial({
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            uniforms: {
                uGlowColor: { value: new THREE.Color('#ff8833') }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 uGlowColor;
                varying vec2 vUv;
                void main() {
                    float h = 1.0 - abs(vUv.y - 0.5) * 2.0;
                    float w = 1.0 - abs(vUv.x - 0.5) * 2.0;
                    float intensity = pow(w, 2.5) * pow(h, 1.5) * 0.55;
                    gl_FragColor = vec4(uGlowColor * intensity, intensity);
                }
            `
        })
        const glow = new THREE.Mesh(glowGeo, glowMat)
        glow.position.set(-4.11, 2.4, -4.75)
        this.group.add(glow)
    }

    setAtmosphericDome() {
        // Enclosing 360-degree environment dome that wraps the entire studio in room-coherent warm lighting
        const domeGeo = new THREE.SphereGeometry(45, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.5)
        domeGeo.scale(1, 0.75, 1)

        const domeMat = new THREE.ShaderMaterial({
            side: THREE.BackSide,
            depthWrite: false,
            uniforms: {
                uTopColor: { value: new THREE.Color('#070913') },
                uTvGlow: { value: new THREE.Color('#240816') },
                uDeskGlow: { value: new THREE.Color('#1c0f08') },
                uAmbientGlow: { value: new THREE.Color('#0e0c14') }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPos = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPos.xyz;
                    gl_Position = projectionMatrix * viewMatrix * worldPos;
                }
            `,
            fragmentShader: `
                uniform vec3 uTopColor;
                uniform vec3 uTvGlow;
                uniform vec3 uDeskGlow;
                uniform vec3 uAmbientGlow;
                varying vec3 vWorldPosition;

                void main() {
                    float yFactor = clamp(vWorldPosition.y / 28.0, 0.0, 1.0);
                    
                    // Directional azimuthal influence from room light sources
                    float xDir = vWorldPosition.x / 45.0; // Positive = TV side (right)
                    float zDir = vWorldPosition.z / 45.0; // Negative = Desk side (back)

                    vec3 horizon = uAmbientGlow;
                    if (xDir > 0.0) {
                        horizon = mix(horizon, uTvGlow, smoothstep(0.0, 0.8, xDir));
                    }
                    if (zDir < 0.0) {
                        horizon = mix(horizon, uDeskGlow, smoothstep(0.0, 0.8, -zDir));
                    }

                    vec3 finalColor = mix(horizon, uTopColor, pow(yFactor, 0.7));
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `
        })

        this.dome = new THREE.Mesh(domeGeo, domeMat)
        this.dome.position.set(0, -0.2, 0)
        this.group.add(this.dome)
    }

    update() {
        // Extension is statically and efficiently rendered
    }

    destroy() {
        if (this.group) {
            this.scene.remove(this.group)
        }
    }
}
