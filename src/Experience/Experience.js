import * as THREE from 'three'
import { Pane } from 'tweakpane'

import Time from './Utils/Time.js'
import Sizes from './Utils/Sizes.js'
import Stats from './Utils/Stats.js'

import Resources from './Resources.js'
import Renderer from './Renderer.js'
import Camera from './Camera.js'
import World from './World.js'
import Navigation from './Navigation.js'
import ScrollController from './ScrollController.js'

import assets from './assets.js'

export default class Experience
{
    static instance

    constructor(_options = {})
    {
        if(Experience.instance)
        {
            return Experience.instance
        }
        Experience.instance = this

        // Options
        this.targetElement = _options.targetElement

        if(!this.targetElement)
        {
            console.warn('Missing \'targetElement\' property')
            return
        }

        this.time = new Time()
        this.sizes = new Sizes()
        this.setConfig()
        this.setStats()
        this.setDebug()
        this.setScene()
        this.setCamera()
        this.setRenderer()
        this.setResources()
        this.setWorld()
        this.setNavigation()
        this.setScrollController()
        
        this.sizes.on('resize', () =>
        {
            this.resize()
        })

        // Reveal canvas when resources finish loading
        this.resources.on('end', () =>
        {
            if (this.targetElement)
            {
                this.targetElement.classList.add('ready')
            }
            const fallback = document.querySelector('.room-fallback-poster')
            if (fallback)
            {
                fallback.classList.add('hidden')
            }
        })

        this.update()
    }

    setConfig()
    {
        this.config = {}
    
        // Pixel ratio (cap at 2.0 desktop, 1.5 mobile)
        const isMobile = window.innerWidth < 1024
        this.config.pixelRatio = Math.min(Math.max(window.devicePixelRatio, 1), isMobile ? 1.5 : 2)

        // Width and height from target container
        const boundings = this.targetElement.getBoundingClientRect()
        this.config.width = boundings.width || (isMobile ? window.innerWidth : window.innerWidth * 0.42)
        this.config.height = boundings.height || (isMobile ? window.innerHeight * 0.32 : window.innerHeight)
        this.config.smallestSide = Math.min(this.config.width, this.config.height)
        this.config.largestSide = Math.max(this.config.width, this.config.height)
        
        // Debug
        this.config.debug = window.location.hash === '#debug'
    }

    setStats()
    {
        if(this.config.debug)
        {
            this.stats = new Stats(true)
        }
    }

    setDebug()
    {
        if(this.config.debug)
        {
            this.debug = new Pane()
            this.debug.containerElem_.style.width = '320px'
        }
    }
    
    setScene()
    {
        this.scene = new THREE.Scene()
    }

    setCamera()
    {
        this.camera = new Camera()
    }

    setRenderer()
    {
        this.renderer = new Renderer({ rendererInstance: this.rendererInstance })
        this.targetElement.appendChild(this.renderer.instance.domElement)
    }

    setResources()
    {
        this.resources = new Resources(assets)
    }

    setWorld()
    {
        this.world = new World()
    }

    setNavigation()
    {
        this.navigation = new Navigation()
    }

    setScrollController()
    {
        this.scrollController = new ScrollController()
    }

    update()
    {
        if(document.hidden)
        {
            window.requestAnimationFrame(() =>
            {
                this.update()
            })
            return
        }

        if(this.stats)
            this.stats.update()
        
        this.camera.update()
        
        if(this.renderer)
            this.renderer.update()

        if(this.world)
            this.world.update()

        if(this.navigation)
            this.navigation.update()

        window.requestAnimationFrame(() =>
        {
            this.update()
        })
    }

    resize()
    {
        // Config
        const isMobile = window.innerWidth < 1024
        this.config.pixelRatio = Math.min(Math.max(window.devicePixelRatio, 1), isMobile ? 1.5 : 2)

        const boundings = this.targetElement.getBoundingClientRect()
        this.config.width = boundings.width
        this.config.height = boundings.height
        this.config.smallestSide = Math.min(this.config.width, this.config.height)
        this.config.largestSide = Math.max(this.config.width, this.config.height)

        if(this.camera)
            this.camera.resize()

        if(this.renderer)
            this.renderer.resize()

        if(this.world)
            this.world.resize()
    }

    destroy()
    {
        if(this.world)
            this.world.destroy()

        if(this.navigation)
            this.navigation.destroy()

        if(this.scrollController)
            this.scrollController.destroy()
    }
}
