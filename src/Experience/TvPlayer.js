import * as THREE from 'three'
import Experience from './Experience.js'

export const PLAYLIST = [
    {
        id: 'midnight-city',
        title: 'Midnight City',
        artist: 'M83',
        description: 'Energetic, cinematic synth-pop that pairs well with dark-mode room lighting',
        audioSrc: '/assets/music/midnight-city.mp3',
        artworkSrc: '/assets/music/midnight-city.jpg',
        accentColor: '#a855f7',
        lightColor: '#ff115e'
    },
    {
        id: 'gooey',
        title: 'Gooey',
        artist: 'Glass Animals',
        description: 'Laid-back, rhythmic, and distinctly creative',
        audioSrc: '/assets/music/gooey.mp3',
        artworkSrc: '/assets/music/gooey.jpg',
        accentColor: '#10b981',
        lightColor: '#059669'
    },
    {
        id: 'tadow',
        title: 'Tadow',
        artist: 'Masego & FKJ',
        description: 'Smooth, effortless groove that makes the room feel warm and lived-in',
        audioSrc: '/assets/music/tadow.mp3',
        artworkSrc: '/assets/music/tadow.jpg',
        accentColor: '#f59e0b',
        lightColor: '#d97706'
    },
    {
        id: 'redbone',
        title: 'Redbone',
        artist: 'Childish Gambino',
        description: 'Chill, warm bassline that matches cozy lamp/monitor lighting',
        audioSrc: '/assets/music/redbone.mp3',
        artworkSrc: '/assets/music/redbone.jpg',
        accentColor: '#ef4444',
        lightColor: '#dc2626'
    },
    {
        id: 'breathe',
        title: 'Breathe',
        artist: 'Télépopmusik',
        description: 'Classic, airy downtempo English vocals that feel futuristic yet relaxed',
        audioSrc: '/assets/music/breathe.mp3',
        artworkSrc: '/assets/music/breathe.jpg',
        accentColor: '#06b6d4',
        lightColor: '#0891b2'
    }
]

export const TRACK_ACCENT_PALETTE = {
    'midnight-city': {
        accent: '#e0529c', // room magenta
        glow: 'rgba(224, 82, 156, 0.45)'
    },
    'gooey': {
        accent: '#10b981', // emerald green
        glow: 'rgba(16, 185, 129, 0.45)'
    },
    'tadow': {
        accent: '#f59e0b', // warm amber / gold
        glow: 'rgba(245, 158, 11, 0.45)'
    },
    'redbone': {
        accent: '#ef4444', // warm red / coral
        glow: 'rgba(239, 68, 68, 0.45)'
    },
    'breathe': {
        accent: '#06b6d4', // cyan / turquoise
        glow: 'rgba(6, 182, 212, 0.45)'
    },
    'day': {
        accent: '#ff6700', // warm daylight orange
        glow: 'rgba(255, 103, 0, 0.45)'
    },
    'default': {
        accent: '#e0529c',
        glow: 'rgba(224, 82, 156, 0.45)'
    }
}

export default class TvPlayer
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.world = this.experience.world
        this.camera = this.experience.camera
        this.time = this.experience.time
        this.targetElement = this.experience.targetElement

        this.playlist = PLAYLIST
        this.currentIndex = 0
        this.isPlaying = true
        this.volume = 0.85
        this.isHovered = false
        this.hoverZone = null
        this.progress = 0
        this.hasUnlockedAudio = false

        this.preloadArtworks()
        this.setAudio()
        this.setCanvas()
        this.setModel()
        this.setRaycaster()
        this.setDOMControls()
        this.updateUIAccent()
        this.setupAutoplayAndMobileUnlock()

        // Expose to window for external controls
        window.tvPlayer = this
    }

    updateUIAccent()
    {
        const track = this.playlist[this.currentIndex]
        const palette = TRACK_ACCENT_PALETTE[track.id] || TRACK_ACCENT_PALETTE.default
        const root = document.documentElement
        if (root)
        {
            root.style.setProperty('--ui-accent', palette.accent)
            root.style.setProperty('--ui-accent-glow', palette.glow)
        }
    }

    preloadArtworks()
    {
        this.artworkImages = {}
        this.playlist.forEach((track) =>
        {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.src = track.artworkSrc
            this.artworkImages[track.id] = img
        })
    }

    setAudio()
    {
        this.audio = new Audio()
        this.audio.crossOrigin = 'anonymous'
        this.audio.preload = 'auto'
        this.audio.volume = this.volume
        this.audio.playsInline = true
        this.audio.setAttribute('playsinline', '')
        this.audio.setAttribute('webkit-playsinline', '')
        this.audio.src = this.playlist[this.currentIndex].audioSrc

        this.audio.addEventListener('ended', () =>
        {
            this.nextTrack()
        })

        this.audio.addEventListener('timeupdate', () =>
        {
            if(this.audio.duration && !isNaN(this.audio.duration))
            {
                this.progress = this.audio.currentTime / this.audio.duration
            }
        })

        this.audio.addEventListener('play', () =>
        {
            this.isPlaying = true
            this.syncBacklight()
            this.updateDOMPlayer()
            this.removeUnlockPrompt()
        })

        this.audio.addEventListener('pause', () =>
        {
            this.isPlaying = false
            this.syncBacklight()
            this.updateDOMPlayer()
        })
    }

    setupAutoplayAndMobileUnlock()
    {
        // 1. Attempt unmuted autoplay immediately on page load
        const startPromise = this.audio.play()
        if(startPromise !== undefined)
        {
            startPromise.then(() =>
            {
                this.hasUnlockedAudio = true
                this.isPlaying = true
                this.syncBacklight()
                this.updateDOMPlayer()
            }).catch(() =>
            {
                // Browser or mobile OS blocked unmuted autoplay before gesture
                this.isPlaying = false
                this.showUnlockPrompt()
            })
        }

        // 2. Global one-time unlock listener: The very first touch, click or keypress immediately starts playback
        const unlock = () =>
        {
            if(!this.hasUnlockedAudio)
            {
                this.hasUnlockedAudio = true
                this.initAudioContext()
                if(this.audioCtx && this.audioCtx.state === 'suspended')
                {
                    this.audioCtx.resume()
                }

                this.audio.play().then(() =>
                {
                    this.isPlaying = true
                    this.syncBacklight()
                    this.updateDOMPlayer()
                    this.removeUnlockPrompt()
                }).catch(e => console.warn('Unlock playback:', e))
            }

            // Remove listeners once executed
            ['touchstart', 'touchend', 'pointerdown', 'mousedown', 'keydown', 'click'].forEach(evt =>
            {
                window.removeEventListener(evt, unlock)
                document.removeEventListener(evt, unlock)
            })
        }

        ['touchstart', 'touchend', 'pointerdown', 'mousedown', 'keydown', 'click'].forEach(evt =>
        {
            window.addEventListener(evt, unlock, { passive: true })
            document.addEventListener(evt, unlock, { passive: true })
        })
    }

    showUnlockPrompt()
    {
        if(document.getElementById('tv-audio-unlock-prompt')) return

        const prompt = document.createElement('div')
        prompt.id = 'tv-audio-unlock-prompt'
        prompt.innerHTML = `<span>🎵 Tap anywhere to start soundtrack</span>`
        prompt.addEventListener('click', () =>
        {
            this.togglePlay()
            this.removeUnlockPrompt()
        })
        document.body.appendChild(prompt)
    }

    removeUnlockPrompt()
    {
        const prompt = document.getElementById('tv-audio-unlock-prompt')
        if(prompt)
        {
            prompt.style.opacity = '0'
            prompt.style.transform = 'translate(-50%, 20px)'
            setTimeout(() => prompt.remove(), 400)
        }
    }

    initAudioContext()
    {
        if(this.audioContextInitialized) return
        this.audioContextInitialized = true

        try
        {
            const AudioContext = window.AudioContext || window.webkitAudioContext
            this.audioCtx = new AudioContext()
            this.analyser = this.audioCtx.createAnalyser()
            this.analyser.fftSize = 64
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)

            const source = this.audioCtx.createMediaElementSource(this.audio)
            source.connect(this.analyser)
            this.analyser.connect(this.audioCtx.destination)
        }
        catch(e)
        {
            console.warn('Web Audio API analyser not supported or blocked:', e)
        }
    }

    setCanvas()
    {
        this.canvas = document.createElement('canvas')
        this.canvas.width = 1280
        this.canvas.height = 720
        this.ctx = this.canvas.getContext('2d')

        this.texture = new THREE.CanvasTexture(this.canvas)
        this.texture.encoding = THREE.sRGBEncoding
        this.texture.generateMipmaps = true
        this.texture.minFilter = THREE.LinearMipmapLinearFilter

        this.renderCanvas()
    }

    setModel()
    {
        this.model = {}
        this.model.group = new THREE.Group()

        // Full Screen 16:9 TV placement (calibrated to the physical TV screen frame)
        this.model.group.position.x = 4.19
        this.model.group.position.y = 2.665
        this.model.group.position.z = 1.820

        this.model.geometry = new THREE.PlaneGeometry(4.16, 2.34)
        this.model.geometry.rotateY(- Math.PI * 0.5)

        this.model.material = new THREE.MeshBasicMaterial({
            map: this.texture,
            toneMapped: false
        })

        this.model.mesh = new THREE.Mesh(this.model.geometry, this.model.material)
        this.model.group.add(this.model.mesh)
        this.scene.add(this.model.group)
    }

    setRaycaster()
    {
        this.raycaster = new THREE.Raycaster()
        this.mouse = new THREE.Vector2(-999, -999)
        this.mouseDownPos = { x: 0, y: 0 }

        window.addEventListener('mousemove', (e) =>
        {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
            this.mouse.y = - (e.clientY / window.innerHeight) * 2 + 1
            this.checkHover()
        })

        window.addEventListener('mousedown', (e) =>
        {
            this.mouseDownPos.x = e.clientX
            this.mouseDownPos.y = e.clientY
        })

        window.addEventListener('mouseup', (e) =>
        {
            const dist = Math.hypot(e.clientX - this.mouseDownPos.x, e.clientY - this.mouseDownPos.y)
            if(dist < 8)
            {
                this.handleClick(e)
            }
        })
    }

    getTVIntersection()
    {
        if(!this.camera || !this.camera.instance || !this.model.mesh) return null
        this.raycaster.setFromCamera(this.mouse, this.camera.instance)
        const intersects = this.raycaster.intersectObject(this.model.mesh)
        return intersects.length > 0 ? intersects[0] : null
    }

    checkHover()
    {
        const hit = this.getTVIntersection()
        if(hit && hit.uv)
        {
            this.isHovered = true
            document.body.style.cursor = 'pointer'

            const cx = hit.uv.x * 1280
            const cy = (1 - hit.uv.y) * 720
            this.hoverZone = this.getHitZone(cx, cy)
        }
        else
        {
            if(this.isHovered)
            {
                this.isHovered = false
                this.hoverZone = null
                document.body.style.cursor = 'default'
            }
        }
    }

    getHitZone(x, y)
    {
        // Timeline progress seek zone (x: 560 to 1220, y: 430 to 470)
        if(x >= 560 && x <= 1220 && y >= 430 && y <= 470) return 'timeline'

        // Poster area (x: 60 to 520, y: 130 to 590)
        if(x >= 60 && x <= 520 && y >= 130 && y <= 590) return 'poster'

        // Prev button (cx: 720, cy: 535, r: 40)
        if(Math.hypot(x - 720, y - 535) < 50) return 'prev'

        // Play/Pause button (cx: 830, cy: 535, r: 55)
        if(Math.hypot(x - 830, y - 535) < 60) return 'playpause'

        // Next button (cx: 940, cy: 535, r: 40)
        if(Math.hypot(x - 940, y - 535) < 50) return 'next'

        // Volume slider bar (x: 630 to 970, y: 610 to 650)
        if(x >= 630 && x <= 970 && y >= 610 && y <= 650) return 'volume'

        return 'tv'
    }

    handleClick(e)
    {
        if(e.target.closest('#tv-music-player') || e.target.closest('#tv-audio-unlock-prompt')) return

        const hit = this.getTVIntersection()
        if(!hit || !hit.uv) return

        const cx = hit.uv.x * 1280
        const cy = (1 - hit.uv.y) * 720
        const zone = this.getHitZone(cx, cy)

        if(zone === 'prev')
        {
            this.prevTrack()
        }
        else if(zone === 'next')
        {
            this.nextTrack()
        }
        else if(zone === 'playpause' || zone === 'poster' || zone === 'tv')
        {
            this.togglePlay()
        }
        else if(zone === 'volume')
        {
            const newVol = Math.max(0, Math.min(1, (cx - 640) / 320))
            this.setVolume(newVol)
        }
        else if(zone === 'timeline')
        {
            const ratio = Math.max(0, Math.min(1, (cx - 560) / 650))
            if(this.audio.duration)
            {
                this.audio.currentTime = ratio * this.audio.duration
            }
        }
    }

    togglePlay()
    {
        this.initAudioContext()
        if(this.audioCtx && this.audioCtx.state === 'suspended')
        {
            this.audioCtx.resume()
        }

        if(this.isPlaying)
        {
            this.audio.pause()
            this.isPlaying = false
        }
        else
        {
            this.audio.play().then(() =>
            {
                this.isPlaying = true
                this.hasUnlockedAudio = true
                this.removeUnlockPrompt()
            }).catch(err =>
            {
                console.warn('Playback error:', err)
            })
        }

        this.syncBacklight()
        this.updateUIAccent()
        this.updateDOMPlayer()
    }

    playTrack(index)
    {
        this.currentIndex = (index + this.playlist.length) % this.playlist.length
        const track = this.playlist[this.currentIndex]

        if(this.audio)
        {
            this.audio.pause()
        }
        this.audio.src = track.audioSrc
        this.progress = 0

        this.initAudioContext()
        if(this.audioCtx && this.audioCtx.state === 'suspended')
        {
            this.audioCtx.resume()
        }

        this.audio.play().then(() =>
        {
            this.isPlaying = true
            this.hasUnlockedAudio = true
            this.removeUnlockPrompt()
        }).catch(e =>
        {
            console.warn('Play error:', e)
        })

        this.syncBacklight()
        this.updateUIAccent()
        this.updateDOMPlayer()
    }

    nextTrack()
    {
        this.playTrack(this.currentIndex + 1)
    }

    prevTrack()
    {
        this.playTrack(this.currentIndex - 1)
    }

    setVolume(val)
    {
        this.volume = Math.max(0, Math.min(1, val))
        this.audio.volume = this.volume
        this.updateDOMPlayer()
    }

    syncBacklight()
    {
        if(this.world && this.world.baked && this.world.baked.model && this.world.baked.model.material)
        {
            const track = this.playlist[this.currentIndex]
            const targetColor = new THREE.Color(track.lightColor)
            this.world.baked.model.material.uniforms.uLightTvColor.value = targetColor
            this.world.baked.model.material.uniforms.uLightTvStrength.value = this.isPlaying ? 2.2 : 1.3
        }
    }

    formatTime(seconds)
    {
        if(isNaN(seconds) || seconds < 0) return '0:00'
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`
    }

    renderCanvas()
    {
        const ctx = this.ctx
        const W = this.canvas.width
        const H = this.canvas.height
        const track = this.playlist[this.currentIndex]

        // 1. Sleek deep background gradient
        const bgGrad = ctx.createLinearGradient(0, 0, W, H)
        bgGrad.addColorStop(0, '#0a0a0f')
        bgGrad.addColorStop(0.5, '#12141c')
        bgGrad.addColorStop(1, '#08080c')
        ctx.fillStyle = bgGrad
        ctx.fillRect(0, 0, W, H)

        // 2. Ambient Accent Glow behind Artwork
        const radialGlow = ctx.createRadialGradient(290, 360, 50, 290, 360, 480)
        radialGlow.addColorStop(0, track.accentColor + (this.isPlaying ? '55' : '28'))
        radialGlow.addColorStop(1, 'transparent')
        ctx.fillStyle = radialGlow
        ctx.fillRect(0, 0, 850, H)

        // 3. Top Header Bar
        ctx.font = '700 20px "Roboto", monospace'
        ctx.fillStyle = '#64748b'
        ctx.fillText('RUTVIK LIVING ROOM • TV SOUNDSYSTEM', 70, 68)

        // Status pill
        ctx.fillStyle = this.isPlaying ? '#10b981' : '#64748b'
        ctx.beginPath()
        ctx.arc(1140, 62, 7, 0, Math.PI * 2)
        ctx.fill()

        ctx.font = '700 16px sans-serif'
        ctx.fillStyle = this.isPlaying ? '#34d399' : '#94a3b8'
        ctx.fillText(this.isPlaying ? 'NOW PLAYING' : 'PAUSED', 1155, 68)

        ctx.font = '700 16px monospace'
        ctx.fillStyle = '#64748b'
        ctx.fillText(`0${this.currentIndex + 1} / 0${this.playlist.length}`, 1030, 68)

        // 4. Album Artwork Poster (Full size, edge-to-edge proportion)
        const posterX = 70
        const posterY = 130
        const posterSize = 440
        const radius = 26

        ctx.save()
        ctx.shadowColor = track.accentColor + (this.isPlaying ? '66' : '33')
        ctx.shadowBlur = this.isPlaying ? 45 : 22
        ctx.shadowOffsetY = 14

        ctx.beginPath()
        ctx.moveTo(posterX + radius, posterY)
        ctx.lineTo(posterX + posterSize - radius, posterY)
        ctx.quadraticCurveTo(posterX + posterSize, posterY, posterX + posterSize, posterY + radius)
        ctx.lineTo(posterX + posterSize, posterY + posterSize - radius)
        ctx.quadraticCurveTo(posterX + posterSize, posterY + posterSize, posterX + posterSize - radius, posterY + posterSize)
        ctx.lineTo(posterX + radius, posterY + posterSize)
        ctx.quadraticCurveTo(posterX, posterY + posterSize, posterX, posterY + posterSize - radius)
        ctx.lineTo(posterX, posterY + radius)
        ctx.quadraticCurveTo(posterX, posterY + radius, posterX + radius, posterY)
        ctx.closePath()
        ctx.clip()

        const img = this.artworkImages[track.id]
        if(img && img.complete && img.naturalWidth !== 0)
        {
            ctx.drawImage(img, posterX, posterY, posterSize, posterSize)
        }
        else
        {
            const fallbackGrad = ctx.createLinearGradient(posterX, posterY, posterX + posterSize, posterY + posterSize)
            fallbackGrad.addColorStop(0, track.accentColor)
            fallbackGrad.addColorStop(1, '#1e1e2f')
            ctx.fillStyle = fallbackGrad
            ctx.fillRect(posterX, posterY, posterSize, posterSize)
        }
        ctx.restore()

        // Subtle top glass reflection on poster
        const refGrad = ctx.createLinearGradient(posterX, posterY, posterX, posterY + posterSize * 0.4)
        refGrad.addColorStop(0, 'rgba(255, 255, 255, 0.16)')
        refGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
        ctx.fillStyle = refGrad
        ctx.fillRect(posterX, posterY, posterSize, posterSize * 0.4)

        // Poster border
        ctx.strokeStyle = this.hoverZone === 'poster' ? '#ffffff' : 'rgba(255, 255, 255, 0.15)'
        ctx.lineWidth = 3
        ctx.stroke()

        // Play overlay on poster if paused
        if(!this.isPlaying)
        {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'
            ctx.fillRect(posterX, posterY, posterSize, posterSize)

            ctx.fillStyle = track.accentColor
            ctx.beginPath()
            ctx.arc(posterX + posterSize / 2, posterY + posterSize / 2, 50, 0, Math.PI * 2)
            ctx.fill()

            ctx.fillStyle = '#ffffff'
            ctx.beginPath()
            ctx.moveTo(posterX + posterSize / 2 - 12, posterY + posterSize / 2 - 20)
            ctx.lineTo(posterX + posterSize / 2 + 20, posterY + posterSize / 2)
            ctx.lineTo(posterX + posterSize / 2 - 12, posterY + posterSize / 2 + 20)
            ctx.closePath()
            ctx.fill()

            ctx.font = '700 18px sans-serif'
            ctx.fillStyle = '#ffffff'
            ctx.textAlign = 'center'
            ctx.fillText('CLICK TV TO PLAY', posterX + posterSize / 2, posterY + posterSize / 2 + 75)
            ctx.textAlign = 'start'
        }

        // 5. Track Information (Right Column)
        const infoX = 560

        // Genre Pill
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
        ctx.beginPath()
        ctx.roundRect(infoX, 132, 195, 34, 17)
        ctx.fill()
        ctx.font = '700 14px sans-serif'
        ctx.fillStyle = track.accentColor
        ctx.fillText('FULL TRACK • VIBE', infoX + 20, 154)

        // Song Title
        ctx.font = '800 52px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        ctx.fillStyle = '#ffffff'
        ctx.fillText(track.title, infoX, 214)

        // Artist Name
        ctx.font = '700 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        ctx.fillStyle = track.accentColor
        ctx.fillText(track.artist, infoX, 258)

        // Description / Vibe
        ctx.font = '400 20px "Roboto", sans-serif'
        ctx.fillStyle = '#94a3b8'
        ctx.fillText(track.description, infoX, 300)

        // 6. Audio Reactive Equalizer Bars
        let freqValues = []
        if(this.analyser && this.isPlaying)
        {
            this.analyser.getByteFrequencyData(this.dataArray)
            freqValues = Array.from(this.dataArray).slice(0, 26)
        }
        else
        {
            const t = this.time.elapsed * 0.003
            freqValues = Array.from({ length: 26 }, (_, i) =>
                this.isPlaying ? (Math.sin(t + i * 0.4) * 0.5 + 0.5) * 190 + 35 : 18
            )
        }

        const barStartX = infoX
        const barY = 405
        const barW = 16
        const barGap = 9

        for(let i = 0; i < 26; i++)
        {
            const val = (freqValues[i] || 12) / 255
            const barH = Math.max(6, val * 75)
            const bx = barStartX + i * (barW + barGap)

            const barGrad = ctx.createLinearGradient(bx, barY, bx, barY - barH)
            barGrad.addColorStop(0, track.accentColor + 'aa')
            barGrad.addColorStop(1, '#ffffff')

            ctx.fillStyle = barGrad
            ctx.beginPath()
            ctx.roundRect(bx, barY - barH, barW, barH, 4)
            ctx.fill()
        }

        // 7. Timeline Progress Bar (Full Song Duration Support)
        const barWTotal = 650
        const progY = 445
        const progH = 7

        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'
        ctx.beginPath()
        ctx.roundRect(infoX, progY, barWTotal, progH, 4)
        ctx.fill()

        const activeW = Math.max(10, barWTotal * this.progress)
        const progGrad = ctx.createLinearGradient(infoX, progY, infoX + activeW, progY)
        progGrad.addColorStop(0, track.accentColor)
        progGrad.addColorStop(1, '#ffffff')
        ctx.fillStyle = progGrad
        ctx.beginPath()
        ctx.roundRect(infoX, progY, activeW, progH, 4)
        ctx.fill()

        // Progress Knob
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(infoX + activeW, progY + progH / 2, 8, 0, Math.PI * 2)
        ctx.fill()

        // Full song time labels
        const curSec = this.audio.currentTime || 0
        const durSec = this.audio.duration || 244
        ctx.font = '600 15px monospace'
        ctx.fillStyle = '#64748b'
        ctx.fillText(this.formatTime(curSec), infoX, progY + 28)
        ctx.fillText(this.formatTime(durSec), infoX + barWTotal - 42, progY + 28)

        // 8. Control Buttons Row
        // Prev button (cx: 720, cy: 535, r: 36)
        const isPrevHover = this.hoverZone === 'prev'
        ctx.fillStyle = isPrevHover ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.09)'
        ctx.beginPath()
        ctx.arc(720, 535, 36, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = isPrevHover ? '#ffffff' : '#cbd5e1'
        ctx.fillRect(706, 521, 4, 28)
        ctx.beginPath()
        ctx.moveTo(730, 521)
        ctx.lineTo(714, 535)
        ctx.lineTo(730, 549)
        ctx.closePath()
        ctx.fill()

        // Play/Pause button (cx: 830, cy: 535, r: 46)
        const isPlayHover = this.hoverZone === 'playpause'
        ctx.fillStyle = track.accentColor
        ctx.save()
        ctx.shadowColor = track.accentColor
        ctx.shadowBlur = isPlayHover ? 35 : 18
        ctx.beginPath()
        ctx.arc(830, 535, 46, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        ctx.fillStyle = '#ffffff'
        if(this.isPlaying)
        {
            ctx.fillRect(819, 517, 8, 36)
            ctx.fillRect(833, 517, 8, 36)
        }
        else
        {
            ctx.beginPath()
            ctx.moveTo(822, 515)
            ctx.lineTo(846, 535)
            ctx.lineTo(822, 555)
            ctx.closePath()
            ctx.fill()
        }

        // Next button (cx: 940, cy: 535, r: 36)
        const isNextHover = this.hoverZone === 'next'
        ctx.fillStyle = isNextHover ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.09)'
        ctx.beginPath()
        ctx.arc(940, 535, 36, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = isNextHover ? '#ffffff' : '#cbd5e1'
        ctx.fillRect(950, 521, 4, 28)
        ctx.beginPath()
        ctx.moveTo(930, 521)
        ctx.lineTo(946, 535)
        ctx.lineTo(930, 549)
        ctx.closePath()
        ctx.fill()

        // 9. Volume Control Bar
        const volX = 640
        const volY = 625
        const volW = 320
        const volH = 8

        ctx.fillStyle = '#94a3b8'
        ctx.font = '22px sans-serif'
        ctx.fillText('🔊', volX - 45, volY + 10)

        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'
        ctx.beginPath()
        ctx.roundRect(volX, volY, volW, volH, 4)
        ctx.fill()

        const volActiveW = volW * this.volume
        ctx.fillStyle = track.accentColor
        ctx.beginPath()
        ctx.roundRect(volX, volY, volActiveW, volH, 4)
        ctx.fill()

        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(volX + volActiveW, volY + volH / 2, 8, 0, Math.PI * 2)
        ctx.fill()

        ctx.font = '700 16px monospace'
        ctx.fillStyle = '#cbd5e1'
        ctx.fillText(`${Math.round(this.volume * 100)}%`, volX + volW + 20, volY + 9)

        ctx.font = '500 15px "Roboto", sans-serif'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'
        ctx.fillText('💡 Click TV screen to Play/Pause • Use controls to switch songs & adjust volume', infoX, 680)

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)'
        ctx.lineWidth = 4
        ctx.strokeRect(0, 0, W, H)

        this.texture.needsUpdate = true
    }

    setDOMControls()
    {
        let container = document.getElementById('tv-music-player')
        if(!container)
        {
            container = document.createElement('div')
            container.id = 'tv-music-player'
            document.body.appendChild(container)
        }

        this.updateDOMPlayer()
    }

    updateDOMPlayer()
    {
        const container = document.getElementById('tv-music-player')
        if(!container) return

        const track = this.playlist[this.currentIndex]

        container.innerHTML = `
            <div class="tv-player-pill" style="--accent: ${track.accentColor};">
                <div class="tv-player-art" onclick="window.tvPlayer.togglePlay()">
                    <img src="${track.artworkSrc}" alt="${track.title}" />
                    <div class="tv-art-overlay">${this.isPlaying ? '❚❚' : '▶'}</div>
                </div>
                <div class="tv-player-info" onclick="window.tvPlayer.togglePlay()">
                    <span class="tv-title">${track.title}</span>
                    <span class="tv-artist">${track.artist}</span>
                </div>
                <div class="tv-player-btns">
                    <button class="tv-btn" onclick="window.tvPlayer.prevTrack()" title="Previous Track">⏮</button>
                    <button class="tv-btn tv-btn-play" onclick="window.tvPlayer.togglePlay()" title="${this.isPlaying ? 'Pause' : 'Play'}">
                        ${this.isPlaying ? '❚❚' : '▶'}
                    </button>
                    <button class="tv-btn" onclick="window.tvPlayer.nextTrack()" title="Next Track">⏭</button>
                </div>
                <div class="tv-player-vol">
                    <span class="vol-icon">🔊</span>
                    <input type="range" min="0" max="1" step="0.01" value="${this.volume}"
                        oninput="window.tvPlayer.setVolume(this.value)"
                        title="Volume: ${Math.round(this.volume * 100)}%" />
                </div>
            </div>
        `
    }

    update()
    {
        // Throttle TV canvas redraws to ~20fps to prevent bus stalls during camera animations
        const now = performance.now()
        if (!this.lastTvFrameTime || (now - this.lastTvFrameTime) > 50)
        {
            this.renderCanvas()
            this.lastTvFrameTime = now
        }

        if(this.isPlaying && this.world && this.world.baked && this.world.baked.model && this.world.baked.model.material)
        {
            let bassValue = 1.0
            if(this.analyser && this.dataArray)
            {
                this.analyser.getByteFrequencyData(this.dataArray)
                const bass = (this.dataArray[0] + this.dataArray[1] + this.dataArray[2]) / 3
                bassValue = 1.2 + (bass / 255) * 1.0
            }
            else
            {
                bassValue = 1.4 + Math.sin(this.time.elapsed * 0.005) * 0.3
            }
            this.world.baked.model.material.uniforms.uLightTvStrength.value = bassValue
        }
    }
}
