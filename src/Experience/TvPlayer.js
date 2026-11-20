import * as THREE from 'three'
import Experience from './Experience.js'

export const PLAYLIST = [
    {
        id: 'midnight-city',
        title: 'Midnight City',
        artist: 'M83',
        description: 'Energetic, cinematic synth-pop that pairs well with dark-mode room lighting',
        audioSrc: '/assets/music/midnight-city.m4a',
        artworkSrc: '/assets/music/midnight-city.jpg',
        accentColor: '#a855f7',
        lightColor: '#ff115e'
    },
    {
        id: 'gooey',
        title: 'Gooey',
        artist: 'Glass Animals',
        description: 'Laid-back, rhythmic, and distinctly creative',
        audioSrc: '/assets/music/gooey.m4a',
        artworkSrc: '/assets/music/gooey.jpg',
        accentColor: '#10b981',
        lightColor: '#059669'
    },
    {
        id: 'tadow',
        title: 'Tadow',
        artist: 'Masego & FKJ',
        description: 'Smooth, effortless groove that makes the room feel warm and lived-in',
        audioSrc: '/assets/music/tadow.m4a',
        artworkSrc: '/assets/music/tadow.jpg',
        accentColor: '#f59e0b',
        lightColor: '#d97706'
    },
    {
        id: 'redbone',
        title: 'Redbone',
        artist: 'Childish Gambino',
        description: 'Chill, warm bassline that matches cozy lamp/monitor lighting',
        audioSrc: '/assets/music/redbone.m4a',
        artworkSrc: '/assets/music/redbone.jpg',
        accentColor: '#ef4444',
        lightColor: '#dc2626'
    },
    {
        id: 'breathe',
        title: 'Breathe',
        artist: 'Télépopmusik',
        description: 'Classic, airy downtempo English vocals that feel futuristic yet relaxed',
        audioSrc: '/assets/music/breathe.m4a',
        artworkSrc: '/assets/music/breathe.jpg',
        accentColor: '#06b6d4',
        lightColor: '#0891b2'
    }
]

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
        this.isPlaying = false
        this.volume = 0.85
        this.isHovered = false
        this.hoverZone = null
        this.progress = 0

        this.preloadArtworks()
        this.setAudio()
        this.setCanvas()
        this.setModel()
        this.setRaycaster()
        this.setDOMControls()

        // Expose to window for external controls
        window.tvPlayer = this
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
        this.audio.src = this.playlist[this.currentIndex].audioSrc

        this.audio.addEventListener('ended', () =>
        {
            this.nextTrack()
        })

        this.audio.addEventListener('timeupdate', () =>
        {
            if(this.audio.duration)
            {
                this.progress = this.audio.currentTime / this.audio.duration
            }
        })
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

        // Exact TV screen placement on the TV stand
        this.model.group.position.x = 4.195
        this.model.group.position.y = 2.72
        this.model.group.position.z = 1.63

        // TV screen plane: 16:9 widescreen ratio
        this.model.geometry = new THREE.PlaneGeometry(2.68, 1.52)
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

            // UV to Canvas coordinates
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
        // Prev button (cx: 630, cy: 530, r: 35)
        if(Math.hypot(x - 630, y - 530) < 45) return 'prev'

        // Play/Pause button (cx: 740, cy: 530, r: 50)
        if(Math.hypot(x - 740, y - 530) < 55) return 'playpause'

        // Next button (cx: 850, cy: 530, r: 35)
        if(Math.hypot(x - 850, y - 530) < 45) return 'next'

        // Volume slider bar (x: 550 to 860, y: 610 to 655)
        if(x >= 540 && x <= 870 && y >= 610 && y <= 655) return 'volume'

        // Poster area (x: 70 to 450, y: 110 to 490)
        if(x >= 70 && x <= 450 && y >= 110 && y <= 490) return 'poster'

        return 'tv'
    }

    handleClick(e)
    {
        // Check if click was on external DOM controls
        if(e.target.closest('#tv-music-player')) return

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
            const newVol = Math.max(0, Math.min(1, (cx - 560) / 280))
            this.setVolume(newVol)
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
            this.audio.play().then(() => {
                this.isPlaying = true
            }).catch(err => {
                console.warn('Playback error / Autoplay blocked:', err)
            })
        }

        this.syncBacklight()
        this.updateDOMPlayer()
    }

    playTrack(index)
    {
        this.currentIndex = (index + this.playlist.length) % this.playlist.length
        const track = this.playlist[this.currentIndex]

        this.audio.src = track.audioSrc
        this.progress = 0

        this.initAudioContext()
        if(this.audioCtx && this.audioCtx.state === 'suspended')
        {
            this.audioCtx.resume()
        }

        this.audio.play().then(() => {
            this.isPlaying = true
        }).catch(e => {
            console.warn('Play error:', e)
        })

        this.syncBacklight()
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
        // Smoothly match room TV backlight to the track's theme color
        if(this.world && this.world.baked && this.world.baked.model && this.world.baked.model.material)
        {
            const track = this.playlist[this.currentIndex]
            const targetColor = new THREE.Color(track.lightColor)
            this.world.baked.model.material.uniforms.uLightTvColor.value = targetColor
            this.world.baked.model.material.uniforms.uLightTvStrength.value = this.isPlaying ? 2.2 : 1.3
        }
    }

    renderCanvas()
    {
        const ctx = this.ctx
        const W = this.canvas.width
        const H = this.canvas.height
        const track = this.playlist[this.currentIndex]

        // 1. Background gradient
        const bgGrad = ctx.createLinearGradient(0, 0, W, H)
        bgGrad.addColorStop(0, '#0c0d12')
        bgGrad.addColorStop(0.5, '#141722')
        bgGrad.addColorStop(1, '#090a0e')
        ctx.fillStyle = bgGrad
        ctx.fillRect(0, 0, W, H)

        // 2. Ambient Accent Glow behind Artwork
        const radialGlow = ctx.createRadialGradient(260, 300, 40, 260, 300, 380)
        radialGlow.addColorStop(0, track.accentColor + (this.isPlaying ? '44' : '22'))
        radialGlow.addColorStop(1, 'transparent')
        ctx.fillStyle = radialGlow
        ctx.fillRect(0, 0, 700, H)

        // 3. Top Header Bar
        ctx.font = '700 18px "Roboto", monospace'
        ctx.fillStyle = '#64748b'
        ctx.fillText('RUTVIK LIVING ROOM • TV SOUNDSYSTEM', 70, 60)

        // Status pill
        ctx.fillStyle = this.isPlaying ? '#10b981' : '#64748b'
        ctx.beginPath()
        ctx.arc(1140, 54, 6, 0, Math.PI * 2)
        ctx.fill()

        ctx.font = '600 16px sans-serif'
        ctx.fillStyle = this.isPlaying ? '#34d399' : '#94a3b8'
        ctx.fillText(this.isPlaying ? 'NOW PLAYING' : 'PAUSED', 1155, 60)

        ctx.font = '600 16px monospace'
        ctx.fillStyle = '#64748b'
        ctx.fillText(`0${this.currentIndex + 1} / 0${this.playlist.length}`, 1040, 60)

        // 4. Album Artwork Poster
        const posterX = 70
        const posterY = 100
        const posterSize = 390
        const radius = 24

        // Poster shadow
        ctx.save()
        ctx.shadowColor = track.accentColor + '55'
        ctx.shadowBlur = this.isPlaying ? 40 : 20
        ctx.shadowOffsetY = 12

        // Rounded clip for artwork
        ctx.beginPath()
        ctx.moveTo(posterX + radius, posterY)
        ctx.lineTo(posterX + posterSize - radius, posterY)
        ctx.quadraticCurveTo(posterX + posterSize, posterY, posterX + posterSize, posterY + radius)
        ctx.lineTo(posterX + posterSize, posterY + posterSize - radius)
        ctx.quadraticCurveTo(posterX + posterSize, posterY + posterSize, posterX + posterSize - radius, posterY + posterSize)
        ctx.lineTo(posterX + radius, posterY + posterSize)
        ctx.quadraticCurveTo(posterX, posterY + posterSize, posterX, posterY + posterSize - radius)
        ctx.lineTo(posterX, posterY + radius)
        ctx.quadraticCurveTo(posterX, posterY, posterX + radius, posterY)
        ctx.closePath()
        ctx.clip()

        const img = this.artworkImages[track.id]
        if(img && img.complete && img.naturalWidth !== 0)
        {
            ctx.drawImage(img, posterX, posterY, posterSize, posterSize)
        }
        else
        {
            // Fallback gradient if loading
            const fallbackGrad = ctx.createLinearGradient(posterX, posterY, posterX + posterSize, posterY + posterSize)
            fallbackGrad.addColorStop(0, track.accentColor)
            fallbackGrad.addColorStop(1, '#1e1e2f')
            ctx.fillStyle = fallbackGrad
            ctx.fillRect(posterX, posterY, posterSize, posterSize)
        }
        ctx.restore()

        // Subtle glass reflection on the poster
        const refGrad = ctx.createLinearGradient(posterX, posterY, posterX, posterY + posterSize * 0.4)
        refGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)')
        refGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
        ctx.fillStyle = refGrad
        ctx.fillRect(posterX, posterY, posterSize, posterSize * 0.4)

        // Poster border
        ctx.strokeStyle = this.hoverZone === 'poster' ? '#ffffff' : 'rgba(255, 255, 255, 0.12)'
        ctx.lineWidth = 3
        ctx.stroke()

        // Play overlay on poster if paused
        if(!this.isPlaying)
        {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'
            ctx.fillRect(posterX, posterY, posterSize, posterSize)

            ctx.fillStyle = track.accentColor
            ctx.beginPath()
            ctx.arc(posterX + posterSize / 2, posterY + posterSize / 2, 44, 0, Math.PI * 2)
            ctx.fill()

            ctx.fillStyle = '#ffffff'
            ctx.beginPath()
            ctx.moveTo(posterX + posterSize / 2 - 10, posterY + posterSize / 2 - 18)
            ctx.lineTo(posterX + posterSize / 2 + 18, posterY + posterSize / 2)
            ctx.lineTo(posterX + posterSize / 2 - 10, posterY + posterSize / 2 + 18)
            ctx.closePath()
            ctx.fill()

            ctx.font = '600 16px sans-serif'
            ctx.fillStyle = '#ffffff'
            ctx.textAlign = 'center'
            ctx.fillText('CLICK TV TO PLAY', posterX + posterSize / 2, posterY + posterSize / 2 + 65)
            ctx.textAlign = 'start'
        }

        // 5. Track Information (Right Column)
        const infoX = 510

        // Genre Pill
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
        ctx.beginPath()
        ctx.roundRect(infoX, 108, 175, 32, 16)
        ctx.fill()
        ctx.font = '600 13px sans-serif'
        ctx.fillStyle = track.accentColor
        ctx.fillText('HOT TRACK • VIBE', infoX + 18, 129)

        // Song Title
        ctx.font = '800 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        ctx.fillStyle = '#ffffff'
        ctx.fillText(track.title, infoX, 185)

        // Artist Name
        ctx.font = '700 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        ctx.fillStyle = track.accentColor
        ctx.fillText(track.artist, infoX, 226)

        // Description / Vibe
        ctx.font = '400 18px "Roboto", sans-serif'
        ctx.fillStyle = '#94a3b8'
        ctx.fillText(track.description, infoX, 264)

        // 6. Audio Reactive Equalizer Bars
        let freqValues = []
        if(this.analyser && this.isPlaying)
        {
            this.analyser.getByteFrequencyData(this.dataArray)
            freqValues = Array.from(this.dataArray).slice(0, 24)
        }
        else
        {
            // Ambient idle wave
            const t = this.time.elapsed * 0.003
            freqValues = Array.from({ length: 24 }, (_, i) =>
                this.isPlaying ? (Math.sin(t + i * 0.4) * 0.5 + 0.5) * 180 + 30 : 15
            )
        }

        const barStartX = infoX
        const barY = 370
        const barW = 18
        const barGap = 9

        for(let i = 0; i < 24; i++)
        {
            const val = (freqValues[i] || 10) / 255
            const barH = Math.max(6, val * 65)
            const bx = barStartX + i * (barW + barGap)

            const barGrad = ctx.createLinearGradient(bx, barY, bx, barY - barH)
            barGrad.addColorStop(0, track.accentColor + 'aa')
            barGrad.addColorStop(1, '#ffffff')

            ctx.fillStyle = barGrad
            ctx.beginPath()
            ctx.roundRect(bx, barY - barH, barW, barH, 4)
            ctx.fill()
        }

        // 7. Timeline Progress Bar
        const barWTotal = 660
        const progY = 412
        const progH = 6

        // Background line
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'
        ctx.beginPath()
        ctx.roundRect(infoX, progY, barWTotal, progH, 3)
        ctx.fill()

        // Active line
        const activeW = Math.max(8, barWTotal * this.progress)
        const progGrad = ctx.createLinearGradient(infoX, progY, infoX + activeW, progY)
        progGrad.addColorStop(0, track.accentColor)
        progGrad.addColorStop(1, '#ffffff')
        ctx.fillStyle = progGrad
        ctx.beginPath()
        ctx.roundRect(infoX, progY, activeW, progH, 3)
        ctx.fill()

        // Progress Knob
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(infoX + activeW, progY + progH / 2, 7, 0, Math.PI * 2)
        ctx.fill()

        // Time labels
        const curSec = Math.floor(this.audio.currentTime || 0)
        const durSec = Math.floor(this.audio.duration || 30)
        const formatTime = (s) => `0:${s < 10 ? '0' : ''}${s}`
        ctx.font = '500 14px monospace'
        ctx.fillStyle = '#64748b'
        ctx.fillText(formatTime(curSec), infoX, progY + 26)
        ctx.fillText(formatTime(durSec), infoX + barWTotal - 35, progY + 26)

        // 8. Control Buttons Row
        // Prev button (cx: 630, cy: 515, r: 32)
        const isPrevHover = this.hoverZone === 'prev'
        ctx.fillStyle = isPrevHover ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)'
        ctx.beginPath()
        ctx.arc(630, 515, 32, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = isPrevHover ? '#ffffff' : '#cbd5e1'
        // Draw Prev Icon (|<)
        ctx.fillRect(618, 503, 3, 24)
        ctx.beginPath()
        ctx.moveTo(638, 503)
        ctx.lineTo(625, 515)
        ctx.lineTo(638, 527)
        ctx.closePath()
        ctx.fill()

        // Play/Pause button (cx: 740, cy: 515, r: 42)
        const isPlayHover = this.hoverZone === 'playpause'
        ctx.fillStyle = track.accentColor
        ctx.save()
        ctx.shadowColor = track.accentColor
        ctx.shadowBlur = isPlayHover ? 30 : 15
        ctx.beginPath()
        ctx.arc(740, 515, 42, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        ctx.fillStyle = '#ffffff'
        if(this.isPlaying)
        {
            // Pause bars
            ctx.fillRect(730, 499, 7, 32)
            ctx.fillRect(743, 499, 7, 32)
        }
        else
        {
            // Play triangle
            ctx.beginPath()
            ctx.moveTo(733, 497)
            ctx.lineTo(755, 515)
            ctx.lineTo(733, 533)
            ctx.closePath()
            ctx.fill()
        }

        // Next button (cx: 850, cy: 515, r: 32)
        const isNextHover = this.hoverZone === 'next'
        ctx.fillStyle = isNextHover ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)'
        ctx.beginPath()
        ctx.arc(850, 515, 32, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = isNextHover ? '#ffffff' : '#cbd5e1'
        // Draw Next Icon (>|)
        ctx.fillRect(860, 503, 3, 24)
        ctx.beginPath()
        ctx.moveTo(842, 503)
        ctx.lineTo(855, 515)
        ctx.lineTo(842, 527)
        ctx.closePath()
        ctx.fill()

        // 9. Volume Control Bar
        const volX = infoX + 50
        const volY = 612
        const volW = 280
        const volH = 8

        // Speaker icon
        ctx.fillStyle = '#94a3b8'
        ctx.font = '20px sans-serif'
        ctx.fillText('🔊', infoX + 10, volY + 10)

        // Volume bar background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'
        ctx.beginPath()
        ctx.roundRect(volX, volY, volW, volH, 4)
        ctx.fill()

        // Active volume bar
        const volActiveW = volW * this.volume
        ctx.fillStyle = track.accentColor
        ctx.beginPath()
        ctx.roundRect(volX, volY, volActiveW, volH, 4)
        ctx.fill()

        // Volume knob
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(volX + volActiveW, volY + volH / 2, 7, 0, Math.PI * 2)
        ctx.fill()

        // Volume percentage
        ctx.font = '600 15px monospace'
        ctx.fillStyle = '#cbd5e1'
        ctx.fillText(`${Math.round(this.volume * 100)}%`, volX + volW + 20, volY + 9)

        // Interactive instruction pill
        ctx.font = '500 14px "Roboto", sans-serif'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
        ctx.fillText('💡 Click TV to Play • Use controls to switch songs & adjust volume', infoX, 670)

        // Texture needs update
        this.texture.needsUpdate = true
    }

    setDOMControls()
    {
        // Add floating sleek TV remote bar in bottom right for ultra-convenient control
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
                <div class="tv-badge">TV SYNC</div>
            </div>
        `
    }

    update()
    {
        // Redraw TV screen canvas each frame
        this.renderCanvas()

        // Subtle audio reactive TV backlight pulse when music is playing
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
