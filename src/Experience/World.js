import * as THREE from 'three'
import Experience from './Experience.js'
import Baked from './Baked.js'
import GoogleLeds from './GoogleLeds.js'
import LoupedeckButtons from './LoupedeckButtons.js'
import CoffeeSteam from './CoffeeSteam.js'
import TopChair from './TopChair.js'
import TvPlayer from './TvPlayer.js'
import PcScreen from './PcScreen.js'
import LaptopScreen from './LaptopScreen.js'
import RoomExtension from './RoomExtension.js'

export default class World {
    constructor(_options) {
        this.experience = new Experience()
        this.config = this.experience.config
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        this.resources.on('groupEnd', (_group) => {
            if (_group.name === 'base') {
                this.setBaked()
                this.setRoomExtension()
                this.setGoogleLeds()
                this.setLoupedeckButtons()
                this.setCoffeeSteam()
                this.setTopChair()
                this.setTvPlayer()
                this.setScreens()
            }
        })
    }

    setBaked() {
        this.baked = new Baked()
    }

    setRoomExtension() {
        this.roomExtension = new RoomExtension()
    }

    setGoogleLeds() {
        this.googleLeds = new GoogleLeds()
    }

    setLoupedeckButtons() {
        this.loupedeckButtons = new LoupedeckButtons()
    }

    setCoffeeSteam() {
        this.coffeeSteam = new CoffeeSteam()
    }

    setTopChair() {
        this.topChair = new TopChair()
    }

    setTvPlayer() {
        this.tvPlayer = new TvPlayer()
    }

    setScreens() {
        this.pcScreen = new PcScreen(
            this.resources.items.pcScreenModel.scene.children[0]
        )
        this.macScreen = new LaptopScreen(
            this.resources.items.macScreenModel.scene.children[0]
        )
    }

    resize() {
    }

    update() {
        if (this.googleLeds)
            this.googleLeds.update()

        if (this.loupedeckButtons)
            this.loupedeckButtons.update()

        if (this.coffeeSteam)
            this.coffeeSteam.update()

        if (this.topChair)
            this.topChair.update()

        if (this.tvPlayer)
            this.tvPlayer.update()

        if (this.pcScreen)
            this.pcScreen.update()

        if (this.macScreen)
            this.macScreen.update()
    }

    destroy() {
        if (this.roomExtension)
            this.roomExtension.destroy()

        if (this.pcScreen)
            this.pcScreen.destroy()

        if (this.macScreen)
            this.macScreen.destroy()
    }
}
