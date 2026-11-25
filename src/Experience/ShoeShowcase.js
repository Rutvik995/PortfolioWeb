import * as THREE from 'three'

/**
 * ShoeShowcase — builds the 2x2 crystal-glass sneaker display cabinet on the front wall
 * containing 4 distinct custom-sculpted 3D sneaker pairs (Nike AJ1 High UNC, AJ1 Low
 * Travis Scott Olive, Converse Chuck 70 High, and Nike Blazer Mid '77 Vintage).
 * All outer glass panels use a Fresnel shader with depthWrite=false so every 3D shoe
 * remains cleanly visible from all 4 sides and from behind the room walls.
 */
export default class ShoeShowcase {
    constructor(parentGroup) {
        this.parentGroup = parentGroup
        this.group = new THREE.Group()
        this.group.name = 'shoeShowcase'

        // Position centered in open floor area along the 4th (front) wall at Z=4.72
        this.group.position.set(0.70, 0.0, 4.18)

        this._setupLightingRig()
        this._buildCupboard()
        this._populateSneakers()

        this.parentGroup.add(this.group)
    }

    /**
     * Baked.js & RoomExtension use custom ShaderMaterials / MeshBasicMaterials and add zero
     * Three.js lights. Adding balanced local lights affects ONLY the MeshStandardMaterial shoes
     * and metal frame without altering any baked room shaders.
     */
    _setupLightingRig() {
        const hemi = new THREE.HemisphereLight(0xfff7ed, 0x3b2a22, 1.45)
        this.group.add(hemi)

        const topFill = new THREE.DirectionalLight(0xfff2e6, 1.15)
        topFill.position.set(1.2, 4.5, -2.5)
        this.group.add(topFill)

        const backFill = new THREE.DirectionalLight(0xdbeafe, 0.90)
        backFill.position.set(-1.5, 3.0, 3.5)
        this.group.add(backFill)
    }

    _createGlassMaterial() {
        return new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
            uniforms: {
                uTint: { value: new THREE.Color('#cceeff') },
                uRimColor: { value: new THREE.Color('#ffffff') }
            },
            vertexShader: `
                varying vec3 vNormalW;
                varying vec3 vViewDir;
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    vec4 worldPos = modelMatrix * vec4(position, 1.0);
                    vNormalW = normalize(mat3(modelMatrix) * normal);
                    vViewDir = normalize(cameraPosition - worldPos.xyz);
                    gl_Position = projectionMatrix * viewMatrix * worldPos;
                }
            `,
            fragmentShader: `
                uniform vec3 uTint;
                uniform vec3 uRimColor;
                varying vec3 vNormalW;
                varying vec3 vViewDir;
                varying vec2 vUv;

                void main() {
                    float ndotv = abs(dot(normalize(vNormalW), normalize(vViewDir)));
                    float fresnel = pow(1.0 - clamp(ndotv, 0.0, 1.0), 2.2);

                    // Crisp tempered glass perimeter edge highlight
                    float edgeX = smoothstep(0.46, 0.50, abs(vUv.x - 0.5));
                    float edgeY = smoothstep(0.46, 0.50, abs(vUv.y - 0.5));
                    float rim = max(edgeX, edgeY);

                    vec3 col = mix(uTint, uRimColor, fresnel * 0.65 + rim * 0.65);
                    float alpha = clamp(0.065 + fresnel * 0.22 + rim * 0.28, 0.06, 0.42);
                    gl_FragColor = vec4(col, alpha);
                }
            `
        })
    }

    _buildCupboard() {
        const W = 2.12
        const H = 1.92
        const D = 0.88
        const halfW = W / 2
        const halfD = D / 2

        const frameMat = new THREE.MeshStandardMaterial({
            color: 0x1a1d26,
            roughness: 0.35,
            metalness: 0.72
        })

        // Bottom plinth (slim so glass begins right above floor)
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(W, 0.06, D), frameMat)
        plinth.position.set(0, 0.03, 0)
        plinth.renderOrder = 1
        this.group.add(plinth)

        // Slim dark aluminum corner uprights (4 corners + subtle top/mid rail frames)
        const postGeo = new THREE.BoxGeometry(0.032, H, 0.032)
        const corners = [
            [-halfW + 0.016, -halfD + 0.016],
            [halfW - 0.016, -halfD + 0.016],
            [-halfW + 0.016, halfD - 0.016],
            [halfW - 0.016, halfD - 0.016]
        ]
        corners.forEach(([x, z]) => {
            const post = new THREE.Mesh(postGeo, frameMat)
            post.position.set(x, H / 2, z)
            post.renderOrder = 1
            this.group.add(post)
        })

        // Slim top/middle horizontal perimeter rails (front/back & left/right)
        const midY = 0.99
        const topY = H - 0.016
        const hBarXGeo = new THREE.BoxGeometry(W, 0.026, 0.026)
        const hBarZGeo = new THREE.BoxGeometry(0.026, 0.026, D)
        const vMidGeo = new THREE.BoxGeometry(0.022, H - 0.06, 0.022)

        ;[topY, midY].forEach((y) => {
            ;[-halfD + 0.014, halfD - 0.014].forEach((z) => {
                const bar = new THREE.Mesh(hBarXGeo, frameMat)
                bar.position.set(0, y, z)
                bar.renderOrder = 1
                this.group.add(bar)
            })
            ;[-halfW + 0.014, halfW - 0.014].forEach((x) => {
                const bar = new THREE.Mesh(hBarZGeo, frameMat)
                bar.position.set(x, y, 0)
                bar.renderOrder = 1
                this.group.add(bar)
            })
        })

        // Center front & back slim vertical mullions defining the 2x2 grid
        ;[-halfD + 0.014, halfD - 0.014].forEach((z) => {
            const mullion = new THREE.Mesh(vMidGeo, frameMat)
            mullion.position.set(0, H / 2 + 0.02, z)
            mullion.renderOrder = 1
            this.group.add(mullion)
        })

        // Center middle cross bar under middle glass shelf
        const centerCross = new THREE.Mesh(hBarZGeo, frameMat)
        centerCross.position.set(0, midY, 0)
        centerCross.renderOrder = 1
        this.group.add(centerCross)

        // Subtle showcase warm-white LED strips inside upper front lip of all 4 cubbies
        const ledMat = new THREE.MeshBasicMaterial({ color: 0xfff5e4, toneMapped: false })
        const ledGeo = new THREE.BoxGeometry(0.86, 0.016, 0.020)
        ;[-0.52, 0.52].forEach((cx) => {
            ;[H - 0.04, midY - 0.03].forEach((ly) => {
                const led = new THREE.Mesh(ledGeo, ledMat)
                led.position.set(cx, ly, -halfD + 0.05)
                led.renderOrder = 1
                this.group.add(led)
            })
        })

        // Matte display pedestals inside each cubby floor (shoes pop cleanly)
        const riserMat = new THREE.MeshStandardMaterial({ color: 0x262b38, roughness: 0.4, metalness: 0.25 })
        const riserGeo = new THREE.BoxGeometry(0.88, 0.026, 0.74)
        ;[-0.52, 0.52].forEach((cx) => {
            ;[0.072, midY + 0.016].forEach((ry) => {
                const riser = new THREE.Mesh(riserGeo, riserMat)
                riser.position.set(cx, ry, 0)
                riser.renderOrder = 1
                this.group.add(riser)
            })
        })

        // Tempered glass enclosure on ALL 4 sides + top + 2x2 middle shelf & vertical divider
        const glassMat = this._createGlassMaterial()
        const addGlass = (w, h, px, py, pz, ry = 0, rx = 0) => {
            const geo = new THREE.PlaneGeometry(w, h)
            const pane = new THREE.Mesh(geo, glassMat)
            pane.position.set(px, py, pz)
            pane.rotation.set(rx, ry, 0)
            pane.renderOrder = 4
            this.group.add(pane)
        }

        const innerH = H - 0.06
        const centerY = 0.06 + innerH / 2

        // Front & Back outer glass walls (faces -Z and +Z)
        addGlass(W - 0.04, innerH, 0, centerY, -halfD + 0.008, Math.PI, 0)
        addGlass(W - 0.04, innerH, 0, centerY, halfD - 0.008, 0, 0)

        // Left & Right outer glass walls
        addGlass(D - 0.04, innerH, -halfW + 0.008, centerY, 0, -Math.PI * 0.5, 0)
        addGlass(D - 0.04, innerH, halfW - 0.008, centerY, 0, Math.PI * 0.5, 0)

        // Center vertical 2x2 glass divider
        addGlass(D - 0.05, innerH, 0, centerY, 0, Math.PI * 0.5, 0)

        // Middle horizontal 2x2 glass shelf & top glass roof
        addGlass(W - 0.05, D - 0.05, 0, midY, 0, 0, -Math.PI * 0.5)
        addGlass(W - 0.04, D - 0.04, 0, H - 0.01, 0, 0, -Math.PI * 0.5)
    }

    _populateSneakers() {
        // Cubby coordinates: look toward +Z from room center (left on screen = +X? Wait: looking from inside room at frontWall (+Z),
        // LEFT on viewer screen is +X (+0.56), RIGHT on viewer screen is -X (-0.56)!)
        // Check: from inside room (X=0, Z=0) looking toward (X=0, Z=+4): camForward=+Z, camUp=+Y -> camRight = Forward x Up = -X!
        // So viewer LEFT = +X (+0.56), viewer RIGHT = -X (-0.56)!
        const specs = [
            {
                // Top-Left cubby: Nike Air Jordan 1 High "UNC" (University Blue & White)
                pos: [0.52, 1.02, 0.0],
                name: 'AJ1_High_UNC',
                style: 'jordan1high',
                collarHeight: 0.215,
                outsole: 0x26a9e0,
                midsole: 0xf8fafc,
                upperBase: 0xffffff,
                mudguard: 0x2bb3f3,
                eyestay: 0x2bb3f3,
                heel: 0x2bb3f3,
                collar: 0xffffff,
                collarFlap: 0x2bb3f3,
                swoosh: 0x26a9e0,
                tongue: 0xf8fafc,
                tongueTag: 0x2bb3f3,
                laces: 0xffffff,
                reverseSwoosh: false
            },
            {
                // Top-Right cubby: Nike AJ1 Low "Travis Scott Olive" (Charcoal / Sail / Olive Swoosh)
                pos: [-0.52, 1.02, 0.0],
                name: 'AJ1_Low_Travis_Olive',
                style: 'jordan1low',
                collarHeight: 0.132,
                outsole: 0x4e5637,
                midsole: 0xf1ead8,
                upperBase: 0x1d1a18,
                mudguard: 0xf6f3eb,
                eyestay: 0xf6f3eb,
                heel: 0xf6f3eb,
                collar: 0x1d1a18,
                collarFlap: null,
                swoosh: 0x626e45,
                tongue: 0x1d1a18,
                tongueTag: 0xdc2626,
                laces: 0xf6f3eb,
                reverseSwoosh: true
            },
            {
                // Bottom-Left cubby: Converse Chuck Taylor 70 High (Black / Cream / Red+Navy Stripe)
                pos: [0.52, 0.088, 0.0],
                name: 'Converse_Chuck70_High',
                style: 'converse',
                collarHeight: 0.232,
                outsole: 0xcab596,
                midsole: 0xf2ece0,
                upperBase: 0x18181c,
                mudguard: 0x18181c,
                eyestay: 0x18181c,
                heel: 0x18181c,
                collar: 0x18181c,
                collarFlap: null,
                swoosh: null,
                foxingTop: 0xdc2626,
                foxingBot: 0x1e3a8a,
                toeCap: 0xf4efe4,
                tongue: 0x18181c,
                tongueTag: 0xf2ece0,
                laces: 0xfafaf9,
                eyelets: 0xd4d4d8,
                hasAllStarPatch: true
            },
            {
                // Bottom-Right cubby: Nike Blazer Mid '77 Vintage (White / Black Swoosh / Grey Suede)
                pos: [-0.52, 0.088, 0.0],
                name: 'Nike_Blazer_Mid_77',
                style: 'blazer',
                collarHeight: 0.212,
                outsole: 0xb08b5f,
                midsole: 0xf3eee2,
                upperBase: 0xffffff,
                mudguard: 0xcbd5e1, // iconic grey suede forefoot accents
                eyestay: 0xffffff,
                heel: 0xffffff,
                collar: 0xffffff,
                collarFlap: null,
                swoosh: 0x111827,
                tongue: 0xf4efe2,
                tongueTag: 0xea580c,
                laces: 0xffffff,
                reverseSwoosh: false
            }
        ]

        specs.forEach((spec) => {
            const pair = this._buildSneakerPair(spec)
            pair.position.set(...spec.pos)
            this.group.add(pair)
        })
    }

    /**
     * Builds a matched Left + Right pair displayed at a slight dynamic collector angle inside
     * the cubby, angled toward the room (-Z) so Swoosh/side profiles and toe caps pop clearly.
     */
    _buildSneakerPair(spec) {
        const pair = new THREE.Group()
        pair.name = spec.name

        // Outer display shoe (angled so crisp outer side profile + toe box show to both room & rear)
        const leftShoe = this._buildSingleShoe(spec, false)
        leftShoe.position.set(0.145, 0, -0.05)
        leftShoe.rotation.y = Math.PI * 0.62
        pair.add(leftShoe)

        // Inner companion shoe staggered cleanly right beside it
        const rightShoe = this._buildSingleShoe(spec, true)
        rightShoe.position.set(-0.155, 0, 0.06)
        rightShoe.rotation.y = Math.PI * 0.56
        pair.add(rightShoe)

        return pair
    }

    _mat(color, roughness = 0.52, metalness = 0.05) {
        return new THREE.MeshStandardMaterial({ color, roughness, metalness })
    }

    /**
     * Sculpts one anatomical 3D sneaker (+X = toe tip, -X = heel, +Y = up, Z = width)
     * with real beveled ExtrudeGeometry soles, domed vamp, mudguard, contoured upper collar,
     * angled padded tongue, criss-cross 3D laces, eyelets, 3D Swooshes / All-Star patch.
     */
    _buildSingleShoe(spec, isRight) {
        const shoe = new THREE.Group()

        // Scale nicely (~0.56m long so each sneaker pair fills its glass cubby clearly and legibly)
        const S = 1.38
        shoe.scale.set(S, S, S)

        // Base sole footprint in X-Z plane (extruded up along +Y via rotateX(-PI/2))
        const footprint = this._createFootprintShape(isRight)

        // 1. Outsole
        const outsoleGeo = new THREE.ExtrudeGeometry(footprint, {
            depth: 0.015,
            bevelEnabled: true,
            bevelThickness: 0.003,
            bevelSize: 0.004,
            bevelSegments: 2
        })
        outsoleGeo.rotateX(-Math.PI / 2)
        const outsole = new THREE.Mesh(outsoleGeo, this._mat(spec.outsole, 0.78, 0.02))
        outsole.position.y = 0.003
        shoe.add(outsole)

        // 2. Midsole (cupsole or vulcanized tall Converse sole)
        const midDepth = spec.style === 'converse' ? 0.036 : 0.028
        const midsoleGeo = new THREE.ExtrudeGeometry(footprint, {
            depth: midDepth,
            bevelEnabled: true,
            bevelThickness: 0.003,
            bevelSize: 0.003,
            bevelSegments: 2
        })
        midsoleGeo.rotateX(-Math.PI / 2)
        const midsole = new THREE.Mesh(midsoleGeo, this._mat(spec.midsole, 0.48, 0.03))
        midsole.position.y = 0.018
        shoe.add(midsole)

        const deckY = 0.018 + midDepth

        // Converse iconic Red + Navy foxing stripes wrapping midsole + rounded rubber toe cap
        if (spec.style === 'converse') {
            ;[
                { y: deckY - 0.005, h: 0.0045, col: spec.foxingTop },
                { y: 0.024, h: 0.0045, col: spec.foxingBot }
            ].forEach((st) => {
                const fGeo = new THREE.ExtrudeGeometry(footprint, {
                    depth: st.h,
                    bevelEnabled: true,
                    bevelThickness: 0.001,
                    bevelSize: 0.0042,
                    bevelSegments: 1
                })
                fGeo.rotateX(-Math.PI / 2)
                const stripe = new THREE.Mesh(fGeo, this._mat(st.col, 0.4, 0.05))
                stripe.position.y = st.y
                shoe.add(stripe)
            })
        }

        // 3. Sculpted Upper Shell (side-profile ExtrudeGeometry in X-Y plane, centered in Z)
        const upperH = spec.collarHeight
        const upperProfile = new THREE.Shape()
        upperProfile.moveTo(-0.185, 0)
        upperProfile.quadraticCurveTo(-0.198, upperH * 0.45, -0.172, upperH * 0.94) // curved heel spine
        upperProfile.quadraticCurveTo(-0.125, upperH * 1.03, -0.065, upperH * 0.88) // padded ankle collar
        upperProfile.lineTo(0.035, upperH * 0.48) // eyestay slope down to midfoot
        upperProfile.quadraticCurveTo(0.115, 0.088, 0.205, 0.044) // smooth vamp to toe nose
        upperProfile.quadraticCurveTo(0.215, 0.015, 0.202, 0) // front toe tip
        upperProfile.closePath()

        const upperDepth = 0.096
        const upperGeo = new THREE.ExtrudeGeometry(upperProfile, {
            depth: upperDepth,
            bevelEnabled: true,
            bevelThickness: 0.022,
            bevelSize: 0.014,
            bevelSegments: 4
        })
        upperGeo.translate(0, 0, -upperDepth / 2)
        const upperMat = this._mat(spec.upperBase, spec.style === 'converse' ? 0.85 : 0.45, 0.04)
        const upperMesh = new THREE.Mesh(upperGeo, upperMat)
        upperMesh.position.y = deckY - 0.004
        shoe.add(upperMesh)

        // Soft rounded toe dome so forefoot curves organically
        const toeDomeGeo = new THREE.SphereGeometry(0.068, 20, 14)
        toeDomeGeo.scale(1.65, 0.62, 0.98)
        const toeColor = spec.style === 'converse' ? spec.toeCap : spec.upperBase
        const toeDome = new THREE.Mesh(toeDomeGeo, this._mat(toeColor, spec.style === 'converse' ? 0.35 : 0.48))
        toeDome.position.set(0.105, deckY + 0.024, 0)
        shoe.add(toeDome)

        // 4. Layered Leather / Suede Forefoot Mudguard & Heel Overlay
        if (spec.style === 'converse') {
            // Glossy cream rubber nose cap
            const capGeo = new THREE.SphereGeometry(0.066, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.55)
            capGeo.scale(1.15, 0.72, 1.02)
            capGeo.rotateZ(-Math.PI * 0.32)
            const toeCapMesh = new THREE.Mesh(capGeo, this._mat(spec.toeCap, 0.32, 0.04))
            toeCapMesh.position.set(0.145, deckY + 0.018, 0)
            shoe.add(toeCapMesh)
        } else {
            // Contrasting Mudguard strip wrapping toe perimeter (UNC blue / Travis Sail / Blazer grey suede)
            const mudGeo = new THREE.TorusGeometry(0.067, 0.016, 10, 24, Math.PI * 1.15)
            mudGeo.rotateX(Math.PI / 2)
            mudGeo.rotateY(-Math.PI * 0.57)
            mudGeo.scale(1.38, 1.0, 1.06)
            const mudMesh = new THREE.Mesh(
                mudGeo,
                this._mat(spec.mudguard, spec.style === 'blazer' ? 0.90 : 0.45)
            )
            mudMesh.position.set(0.118, deckY + 0.012, 0)
            shoe.add(mudMesh)

            // Blazer extra side suede forefoot patch (signature Blazer '77 detail)
            if (spec.style === 'blazer') {
                const patchGeo = new THREE.BoxGeometry(0.072, 0.026, 0.136)
                const sidePatch = new THREE.Mesh(patchGeo, this._mat(spec.mudguard, 0.92))
                sidePatch.position.set(0.068, deckY + 0.014, 0)
                shoe.add(sidePatch)
            }

            // Contrasting Heel Counter wrap (centered at -X heel = theta 1.5*PI)
            const heelCurveGeo = new THREE.CylinderGeometry(0.062, 0.068, upperH * 0.52, 18, 1, false, Math.PI * 1.05, Math.PI * 0.9)
            const heelMesh = new THREE.Mesh(heelCurveGeo, this._mat(spec.heel, 0.48))
            heelMesh.position.set(-0.128, deckY + upperH * 0.25, 0)
            shoe.add(heelMesh)

            // Eyestay strip along upper lace edge on both sides
            const eyeMat = this._mat(spec.eyestay, 0.48)
            const eyeLen = spec.isHigh || spec.collarHeight > 0.17 ? 0.165 : 0.125
            const eyeGeo = new THREE.BoxGeometry(eyeLen, 0.018, 0.018)
            ;[-0.044, 0.044].forEach((ez) => {
                const eyeBar = new THREE.Mesh(eyeGeo, eyeMat)
                eyeBar.position.set(-0.018, deckY + upperH * 0.58, ez)
                eyeBar.rotation.z = -0.58
                shoe.add(eyeBar)
            })
        }

        // AJ1 High Collar Flap Wings (e.g. UNC university blue top ankle collar)
        if (spec.collarFlap) {
            const flapGeo = new THREE.CylinderGeometry(0.062, 0.065, 0.062, 16, 1, false, Math.PI * 0.90, Math.PI * 1.20)
            const flap = new THREE.Mesh(flapGeo, this._mat(spec.collarFlap, 0.45))
            flap.position.set(-0.115, deckY + upperH * 0.78, 0)
            shoe.add(flap)
        }

        // Dark padded sockliner inside collar opening (visible looking from above!)
        const linerGeo = new THREE.CylinderGeometry(0.047, 0.045, 0.030, 16)
        linerGeo.scale(1.32, 1.0, 0.92)
        const linerColor = spec.style === 'converse' ? 0xe7e5e4 : spec.collar === 0xffffff ? 0x26a9e0 : 0x111318
        const liner = new THREE.Mesh(linerGeo, this._mat(spec.style === 'blazer' ? 0xf8fafc : linerColor, 0.85))
        liner.position.set(-0.110, deckY + upperH * 0.89, 0)
        shoe.add(liner)

        // 5. Padded Tongue + Contrasting Woven Brand Tag (+Z rot tilts top BACK toward ankle -X)
        const tongueLen = spec.collarHeight * 0.92
        const tongueGeo = new THREE.BoxGeometry(0.020, tongueLen, 0.064)
        const tongue = new THREE.Mesh(tongueGeo, this._mat(spec.tongue, 0.75))
        tongue.position.set(0.008, deckY + 0.052 + tongueLen * 0.44, 0)
        tongue.rotation.z = 0.48
        shoe.add(tongue)

        const tagGeo = new THREE.BoxGeometry(0.023, 0.026, 0.036)
        const tongueTag = new THREE.Mesh(tagGeo, this._mat(spec.tongueTag, 0.5))
        tongueTag.position.set(-0.028, deckY + 0.052 + tongueLen * 0.82, 0)
        tongueTag.rotation.z = 0.48
        shoe.add(tongueTag)

        // 6. Criss-Cross 3D Shoelaces + Top Loop Bow + Converse Eyelets
        const laceMat = this._mat(spec.laces, 0.65)
        const numLaces = spec.collarHeight > 0.18 ? 6 : 4
        const laceGeo = new THREE.CylinderGeometry(0.0055, 0.0055, 0.088, 8)
        laceGeo.rotateX(Math.PI / 2)

        for (let i = 0; i < numLaces; i++) {
            const t = i / Math.max(1, numLaces - 1)
            const lx = 0.048 - t * (spec.collarHeight > 0.18 ? 0.115 : 0.085)
            const ly = deckY + 0.072 + t * (spec.collarHeight > 0.18 ? 0.095 : 0.055)
            const rung = new THREE.Mesh(laceGeo, laceMat)
            rung.position.set(lx, ly, 0)
            rung.rotation.y = i % 2 === 0 ? 0.24 : -0.24
            shoe.add(rung)

            if (spec.eyelets) {
                const eMat = this._mat(spec.eyelets, 0.25, 0.85)
                const eGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.005, 10)
                eGeo.rotateX(Math.PI / 2)
                ;[-0.062, 0.062].forEach((ez) => {
                    const eyelet = new THREE.Mesh(eGeo, eMat)
                    eyelet.position.set(lx, ly - 0.006, ez)
                    shoe.add(eyelet)
                })
            }
        }

        // Cute tied lace bow loops at top of tongue
        const topLx = spec.collarHeight > 0.18 ? -0.055 : -0.025
        const topLy = deckY + (spec.collarHeight > 0.18 ? 0.172 : 0.130)
        const bowGeo = new THREE.TorusGeometry(0.017, 0.0042, 8, 16)
        ;[-0.016, 0.016].forEach((bz, bi) => {
            const loop = new THREE.Mesh(bowGeo, laceMat)
            loop.position.set(topLx, topLy, bz)
            loop.rotation.set(0.3, bi === 0 ? 0.55 : -0.55, 0.4)
            shoe.add(loop)
        })

        // 7. Signature Side Branding — Sculpted 3D Swooshes OR Converse All-Star Ankle Patch
        if (spec.swoosh) {
            const swooshMat = this._mat(spec.swoosh, 0.42, 0.06)
            const outerSideSign = isRight ? 1 : -1

            // Outer (lateral) Swoosh — reversed for Travis Scott Olive Low!
            const outerSwoosh = this._createSwooshMesh(swooshMat, !!spec.reverseSwoosh)
            outerSwoosh.position.set(spec.reverseSwoosh ? 0.015 : -0.025, deckY + 0.056, outerSideSign * 0.068)
            shoe.add(outerSwoosh)

            // Inner (medial) standard Swoosh so shoe looks authentic from BOTH sides!
            const innerSwoosh = this._createSwooshMesh(swooshMat, false)
            innerSwoosh.position.set(-0.025, deckY + 0.056, -outerSideSign * 0.068)
            shoe.add(innerSwoosh)
        }

        if (spec.hasAllStarPatch) {
            // Iconic circular Converse Chuck Taylor ★ badge + vertical white heel canvas tape
            const patchMat = this._createAllStarPatchMaterial()
            const patchGeo = new THREE.CircleGeometry(0.032, 24)
            const medialSign = isRight ? -1 : 1
            const patch = new THREE.Mesh(patchGeo, patchMat)
            patch.position.set(-0.105, deckY + 0.165, medialSign * 0.064)
            if (medialSign < 0) patch.rotation.y = Math.PI
            shoe.add(patch)

            // Vertical white contrast heel tape seam along back spine
            const tape = new THREE.Mesh(new THREE.BoxGeometry(0.012, upperH * 0.88, 0.024), this._mat(0xf5f5f4, 0.7))
            tape.position.set(-0.185, deckY + upperH * 0.45, 0)
            shoe.add(tape)
        }

        return shoe
    }

    /** Asymmetric anatomical sneaker outsole silhouette (wider ball, tapered arch, rounded heel). */
    _createFootprintShape(isRight) {
        const s = isRight ? -1 : 1
        const shape = new THREE.Shape()
        shape.moveTo(-0.190, 0)
        shape.bezierCurveTo(-0.190, 0.062 * s, -0.100, 0.066 * s, -0.030, 0.054 * s)
        shape.bezierCurveTo(0.045, 0.068 * s, 0.145, 0.074 * s, 0.205, 0.038 * s)
        shape.quadraticCurveTo(0.228, 0, 0.205, -0.038 * s)
        shape.bezierCurveTo(0.145, -0.072 * s, 0.045, -0.064 * s, -0.030, -0.052 * s)
        shape.bezierCurveTo(-0.100, -0.064 * s, -0.190, -0.060 * s, -0.190, 0)
        return shape
    }

    /** Custom 3D ExtrudeGeometry Nike Swoosh (supports iconic reversed Travis Scott orientation). */
    _createSwooshMesh(material, reversed = false) {
        const s = new THREE.Shape()
        if (!reversed) {
            // Standard Swoosh: hook front at +X, belly at midfoot, long sharp tail sweeping to heel (-X/+Y)
            s.moveTo(0.072, 0.022)
            s.quadraticCurveTo(0.036, 0.004, 0.022, -0.020)
            s.quadraticCurveTo(-0.032, -0.026, -0.098, 0.068)
            s.quadraticCurveTo(-0.036, -0.006, 0.018, -0.002)
            s.quadraticCurveTo(0.042, 0.010, 0.072, 0.022)
        } else {
            // Reversed oversized Travis Scott Swoosh: hook at heel (-X), sharp tail forward toward toe (+X/+Y)
            s.moveTo(-0.088, 0.018)
            s.quadraticCurveTo(-0.044, 0.000, -0.024, -0.026)
            s.quadraticCurveTo(0.040, -0.032, 0.106, 0.052)
            s.quadraticCurveTo(0.040, -0.010, -0.018, -0.006)
            s.quadraticCurveTo(-0.052, 0.006, -0.088, 0.018)
        }

        const geo = new THREE.ExtrudeGeometry(s, {
            depth: 0.009,
            bevelEnabled: true,
            bevelThickness: 0.002,
            bevelSize: 0.0015,
            bevelSegments: 2
        })
        geo.translate(0, 0, -0.0045)
        return new THREE.Mesh(geo, material)
    }

    _createAllStarPatchMaterial() {
        const canvas = document.createElement('canvas')
        canvas.width = 128
        canvas.height = 128
        const ctx = canvas.getContext('2d')

        ctx.fillStyle = '#f8f6f0'
        ctx.beginPath()
        ctx.arc(64, 64, 62, 0, Math.PI * 2)
        ctx.fill()

        ctx.strokeStyle = '#18181b'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.arc(64, 64, 54, 0, Math.PI * 2)
        ctx.stroke()

        // Classic center ★ star
        ctx.fillStyle = '#18181b'
        ctx.beginPath()
        for (let i = 0; i < 5; i++) {
            const outerAngle = (i * 2 * Math.PI) / 5 - Math.PI / 2
            const innerAngle = outerAngle + Math.PI / 5
            const ox = 64 + Math.cos(outerAngle) * 26
            const oy = 64 + Math.sin(outerAngle) * 26
            const ix = 64 + Math.cos(innerAngle) * 11
            const iy = 64 + Math.sin(innerAngle) * 11
            if (i === 0) ctx.moveTo(ox, oy)
            else ctx.lineTo(ox, oy)
            ctx.lineTo(ix, iy)
        }
        ctx.closePath()
        ctx.fill()

        const tex = new THREE.CanvasTexture(canvas)
        tex.encoding = THREE.sRGBEncoding
        return new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })
    }

    destroy() {
        if (this.group && this.parentGroup) {
            this.parentGroup.remove(this.group)
        }
    }
}
