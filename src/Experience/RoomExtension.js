import * as THREE from 'three'
import Experience from './Experience.js'
import ShoeShowcase from './ShoeShowcase.js'

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
        this.setShoeShowcase()
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
        // Unified interior wall shader: ALL walls use THREE.FrontSide facing INWARD into the room.
        // That encloses the entire room with 4 walls when looking from inside, while any wall behind
        // the camera automatically becomes transparent so the room remains visible from all sides.
        const wallMat = new THREE.ShaderMaterial({
            side: THREE.FrontSide,
            uniforms: {
                uWallBase: { value: new THREE.Color('#dfd2c8') },
                uWallShadow: { value: new THREE.Color('#30221b') },
                uDeskGlow: { value: new THREE.Color('#ff6700') },
                uTvGlow: { value: new THREE.Color('#ff115e') }
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
                uniform vec3 uTvGlow;
                varying vec3 vWorldPosition;
                varying vec2 vUv;

                void main() {
                    // Warm plaster vertical gradient (rich studio shadow near floor)
                    float vFactor = smoothstep(0.0, 4.2, vWorldPosition.y);
                    vec3 col = mix(uWallShadow, uWallBase, vFactor);

                    // Soft corner ambient darkening where adjacent walls meet
                    float cornerDistX = min(abs(vWorldPosition.x - (-4.85)), abs(vWorldPosition.x - 4.50));
                    float cornerDistZ = min(abs(vWorldPosition.z - (-4.86)), abs(vWorldPosition.z - 4.72));
                    float cornerAO = mix(0.76, 1.0, smoothstep(0.0, 1.4, cornerDistX + cornerDistZ));
                    col *= cornerAO;

                    // Ambient warm glow from desk strip
                    float deskLight = smoothstep(8.5, 0.8, length(vWorldPosition - vec3(0.3, 2.5, -3.5))) * 0.28;
                    col += uDeskGlow * deskLight;

                    // Subtle cool/magenta TV ambient bounce near front-right
                    float tvLight = smoothstep(7.5, 0.8, length(vWorldPosition - vec3(4.1, 2.4, 1.8))) * 0.22;
                    col += uTvGlow * tvLight;

                    gl_FragColor = vec4(col, 1.0);
                }
            `
        })

        const wallH = 6.32
        const wallMidY = wallH / 2
        const zCenter = (-4.86 + 4.72) / 2 // -0.07
        const leftLen = 4.72 - (-4.86)     // 9.58
        const xCenter = (-4.85 + 4.52) / 2 // -0.165
        const frontLen = 4.52 - (-4.85)    // 9.37

        // 1. Left Interior Wall (X = -4.85, FrontSide facing +X inward)
        const leftWallGeo = new THREE.PlaneGeometry(leftLen, wallH)
        leftWallGeo.rotateY(Math.PI * 0.5)
        this.leftWall = new THREE.Mesh(leftWallGeo, wallMat)
        this.leftWall.position.set(-4.85, wallMidY, zCenter)
        this.group.add(this.leftWall)

        // 2. Front Interior Wall (4th wall closing the room at Z = 4.72, FrontSide facing -Z inward)
        const frontWallGeo = new THREE.PlaneGeometry(frontLen, wallH)
        frontWallGeo.rotateY(Math.PI)
        this.frontWall = new THREE.Mesh(frontWallGeo, wallMat)
        this.frontWall.position.set(xCenter, wallMidY, 4.72)
        this.group.add(this.frontWall)

        // 3. Corner seam closures (FrontSide facing inward so front-right & back-left corners stay seamless)
        const rightSeamGeo = new THREE.PlaneGeometry(0.30, wallH)
        rightSeamGeo.rotateY(-Math.PI * 0.5)
        const rightSeam = new THREE.Mesh(rightSeamGeo, wallMat)
        rightSeam.position.set(4.26, wallMidY, 4.58)
        this.group.add(rightSeam)

        const backSeamGeo = new THREE.PlaneGeometry(1.10, wallH)
        const backSeam = new THREE.Mesh(backSeamGeo, wallMat)
        backSeam.position.set(-4.35, wallMidY, -4.87)
        this.group.add(backSeam)

        // Single-sided architectural baseboards (FrontSide inward so they never block camera from outside)
        const trimMat = new THREE.MeshBasicMaterial({ color: 0x1f1612, side: THREE.FrontSide })

        const leftTrimGeo = new THREE.PlaneGeometry(leftLen, 0.22)
        leftTrimGeo.rotateY(Math.PI * 0.5)
        const leftTrim = new THREE.Mesh(leftTrimGeo, trimMat)
        leftTrim.position.set(-4.835, 0.11, zCenter)
        this.group.add(leftTrim)

        const frontTrimGeo = new THREE.PlaneGeometry(frontLen, 0.22)
        frontTrimGeo.rotateY(Math.PI)
        const frontTrim = new THREE.Mesh(frontTrimGeo, trimMat)
        frontTrim.position.set(xCenter, 0.11, 4.705)
        this.group.add(frontTrim)
    }

    setArchitecturalDetails() {
        // 1. Twin Matched Framed Posters side-by-side above the sofa on the left wall (elevated placement)
        const posterSpecs = [
            { z: 2.15, src: '/assets/posterSisyphus.jpg', name: 'posterSisyphus' },
            { z: 0.35, src: '/assets/posterMindset.jpg', name: 'posterMindset' }
        ]

        const frameW = 1.55
        const frameH = 2.10
        const artW = 1.45
        const artH = 2.00
        const posY = 3.65

        const frameMat = new THREE.MeshBasicMaterial({ color: 0x18181b })
        const hBarGeo = new THREE.BoxGeometry(0.04, 0.05, frameW)
        const vBarGeo = new THREE.BoxGeometry(0.04, frameH, 0.05)
        const artGeo = new THREE.PlaneGeometry(artW, artH)
        artGeo.rotateY(Math.PI * 0.5)

        posterSpecs.forEach(({ z, src, name }) => {
            // Hollow 4-bar frame so camera behind left wall still sees straight into room
            const frameGroup = new THREE.Group()
            frameGroup.name = `${name}Frame`
            const topBar = new THREE.Mesh(hBarGeo, frameMat)
            topBar.position.set(-4.82, posY + (frameH - 0.05) / 2, z)
            const botBar = new THREE.Mesh(hBarGeo, frameMat)
            botBar.position.set(-4.82, posY - (frameH - 0.05) / 2, z)
            const leftBar = new THREE.Mesh(vBarGeo, frameMat)
            leftBar.position.set(-4.82, posY, z + (frameW - 0.05) / 2)
            const rightBar = new THREE.Mesh(vBarGeo, frameMat)
            rightBar.position.set(-4.82, posY, z - (frameW - 0.05) / 2)
            frameGroup.add(topBar, botBar, leftBar, rightBar)
            this.group.add(frameGroup)

            // Contain-fit each poster onto an identical 512x704 matte black canvas so proportions stay crisp
            const canvas = document.createElement('canvas')
            canvas.width = 512
            canvas.height = 704
            const ctx = canvas.getContext('2d')
            ctx.fillStyle = '#000000'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            const texture = new THREE.CanvasTexture(canvas)
            texture.encoding = THREE.sRGBEncoding
            texture.generateMipmaps = false
            texture.minFilter = THREE.LinearFilter
            texture.magFilter = THREE.LinearFilter

            const img = new Image()
            img.onload = () => {
                ctx.fillStyle = '#000000'
                ctx.fillRect(0, 0, canvas.width, canvas.height)
                const padX = 24
                const padY = 28
                const maxW = canvas.width - padX * 2
                const maxH = canvas.height - padY * 2
                const scale = Math.min(maxW / img.width, maxH / img.height)
                const drawW = img.width * scale
                const drawH = img.height * scale
                const dx = (canvas.width - drawW) / 2
                const dy = (canvas.height - drawH) / 2
                ctx.drawImage(img, dx, dy, drawW, drawH)
                texture.needsUpdate = true
            }
            img.src = src

            // FrontSide facing +X inward into room (invisible when orbiting behind left wall)
            const artMat = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false, side: THREE.FrontSide })
            const art = new THREE.Mesh(artGeo, artMat)
            art.name = `${name}Art`
            art.position.set(-4.81, posY, z)
            this.group.add(art)
        })

        // 2. Warm Architectural Light Column in the left corner
        const lightColumnGeo = new THREE.CylinderGeometry(0.04, 0.04, 4.8, 16)
        const lightColumnMat = new THREE.MeshBasicMaterial({ color: 0xffaa55, toneMapped: false })
        const lightColumn = new THREE.Mesh(lightColumnGeo, lightColumnMat)
        lightColumn.position.set(-4.81, 2.4, -4.75)
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
        glow.position.set(-4.80, 2.4, -4.75)
        this.group.add(glow)
    }

    setShoeShowcase() {
        this.shoeShowcase = new ShoeShowcase(this.group)
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
        if (this.shoeShowcase) {
            this.shoeShowcase.destroy()
        }
        if (this.group) {
            this.scene.remove(this.group)
        }
    }
}
