import * as THREE from 'three'

import Experience from './Experience.js'
import vertexShader from './shaders/baked/vertex.glsl'
import fragmentShader from './shaders/baked/fragment.glsl'

export default class CoffeeSteam
{
    constructor()
    {
        this.experience = new Experience()
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.time = this.experience.time

        // Debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder({
                title: 'baked',
                expanded: true
            })
        }

        this.setModel()
    }

    setModel()
    {
        this.model = {}
        
        this.model.mesh = this.resources.items.roomModel.scene.children[0]

        this.model.bakedDayTexture = this.resources.items.bakedDayTexture
        this.model.bakedDayTexture.encoding = THREE.sRGBEncoding
        this.model.bakedDayTexture.flipY = false

        this.model.bakedNightTexture = this.resources.items.bakedNightTexture
        this.model.bakedNightTexture.encoding = THREE.sRGBEncoding
        this.model.bakedNightTexture.flipY = false

        this.model.bakedNeutralTexture = this.resources.items.bakedNeutralTexture
        this.model.bakedNeutralTexture.encoding = THREE.sRGBEncoding
        this.model.bakedNeutralTexture.flipY = false

        this.model.lightMapTexture = this.resources.items.lightMapTexture
        this.model.lightMapTexture.flipY = false

        this.colors = {}
        this.colors.tv = '#ff115e'
        this.colors.desk = '#ff6700'
        this.colors.pc = '#0082ff'

        this.model.material = new THREE.ShaderMaterial({
            uniforms:
            {
                uBakedDayTexture: { value: this.model.bakedDayTexture },
                uBakedNightTexture: { value: this.model.bakedNightTexture },
                uBakedNeutralTexture: { value: this.model.bakedNeutralTexture },
                uLightMapTexture: { value: this.model.lightMapTexture },

                uNightMix: { value: 1 },
                uNeutralMix: { value: 0 },

                uLightTvColor: { value: new THREE.Color(this.colors.tv) },
                uLightTvStrength: { value: 1.47 },

                uLightDeskColor: { value: new THREE.Color(this.colors.desk) },
                uLightDeskStrength: { value: 1.9 },

                uLightPcColor: { value: new THREE.Color(this.colors.pc) },
                uLightPcStrength: { value: 1.4 }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        })

        this.model.mesh.traverse((_child) =>
        {
            if(_child instanceof THREE.Mesh)
            {
                _child.material = this.model.material
            }
        })

        // Cleanly remove microphone, boom arm, key light rig, and camera
        const geometry = this.model.mesh?.geometry
        if(geometry && geometry.index)
        {
            const oldIndices = geometry.index.array
            const totalTriangles = oldIndices.length / 3

            // Triangle ranges corresponding to the mic, boom arm, key light mount, and camera
            const removalRanges = [
                [39875, 2664],
                [46124, 864],
                [47020, 612],
                [47872, 1076],
                [49006, 34],
                [103922, 5]
            ]

            let removedCount = 0
            for(let r = 0; r < removalRanges.length; r++)
            {
                removedCount += removalRanges[r][1]
            }

            const newIndices = new Uint32Array((totalTriangles - removedCount) * 3)
            let writeIdx = 0

            for(let t = 0; t < totalTriangles; t++)
            {
                let isRemoved = false
                for(let r = 0; r < removalRanges.length; r++)
                {
                    const start = removalRanges[r][0]
                    const len = removalRanges[r][1]
                    if(t >= start && t < start + len)
                    {
                        isRemoved = true
                        break
                    }
                }

                if(!isRemoved)
                {
                    newIndices[writeIdx++] = oldIndices[t * 3]
                    newIndices[writeIdx++] = oldIndices[t * 3 + 1]
                    newIndices[writeIdx++] = oldIndices[t * 3 + 2]
                }
            }

            geometry.setIndex(new THREE.BufferAttribute(newIndices, 1))
        }

        this.scene.add(this.model.mesh)
        
        // Debug
        if(this.debug)
        {
            this.debugFolder
                .addInput(
                    this.model.material.uniforms.uNightMix,
                    'value',
                    { label: 'uNightMix', min: 0, max: 1 }
                )

            this.debugFolder
                .addInput(
                    this.model.material.uniforms.uNeutralMix,
                    'value',
                    { label: 'uNeutralMix', min: 0, max: 1 }
                )

            this.debugFolder
                .addInput(
                    this.colors,
                    'tv',
                    { view: 'color' }
                )
                .on('change', () =>
                {
                    this.model.material.uniforms.uLightTvColor.value.set(this.colors.tv)
                })

            this.debugFolder
                .addInput(
                    this.model.material.uniforms.uLightTvStrength,
                    'value',
                    { label: 'uLightTvStrength', min: 0, max: 3 }
                )

            this.debugFolder
                .addInput(
                    this.colors,
                    'desk',
                    { view: 'color' }
                )
                .on('change', () =>
                {
                    this.model.material.uniforms.uLightDeskColor.value.set(this.colors.desk)
                })

            this.debugFolder
                .addInput(
                    this.model.material.uniforms.uLightDeskStrength,
                    'value',
                    { label: 'uLightDeskStrength', min: 0, max: 3 }
                )

            this.debugFolder
                .addInput(
                    this.colors,
                    'pc',
                    { view: 'color' }
                )
                .on('change', () =>
                {
                    this.model.material.uniforms.uLightPcColor.value.set(this.colors.pc)
                })

            this.debugFolder
                .addInput(
                    this.model.material.uniforms.uLightPcStrength,
                    'value',
                    { label: 'uLightPcStrength', min: 0, max: 3 }
                )
        }
    }
}