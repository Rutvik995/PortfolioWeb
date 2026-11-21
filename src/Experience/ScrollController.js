import Experience from './Experience.js'
import screenSync from './ScreenSync.js'
import { portfolioData } from '../data/portfolio.js'
import * as THREE from 'three'

export default class ScrollController {
    constructor() {
        this.experience = new Experience()
        this.camera = this.experience.camera
        this.navigation = this.experience.navigation
        this.world = this.experience.world
        this.targetElement = this.experience.targetElement

        this.currentZone = 'overview'
        this.currentProjectIndex = 0
        this.isCardOpen = false

        // Raycasting
        this.raycaster = new THREE.Raycaster()
        this.mouse = new THREE.Vector2(-999, -999)
        this.mouseDownPos = { x: 0, y: 0 }
        this.hoveredZone = null

        this.initDOM()
        this.initHUDDock()
        this.initHeaderNav()
        this.initContextCard()
        this.initRaycasting()
        this.initKeyboardControls()
    }

    initDOM() {
        this.dock = document.getElementById('hud-dock')
        this.contextCard = document.getElementById('context-card')
        this.cardBody = document.getElementById('card-glass-body')
        this.cardTitle = document.getElementById('card-zone-title')
        this.cardBadge = document.getElementById('card-zone-badge')
        this.reopenBtn = document.getElementById('btn-reopen-card')
        this.reopenLabel = document.getElementById('reopen-card-label')
    }

    initHUDDock() {
        if (!this.dock) return

        this.dock.addEventListener('click', (e) => {
            const btn = e.target.closest('.dock-item')
            if (!btn) return
            const zone = btn.dataset.zone
            if (zone) {
                // If clicking currently active zone, toggle card open/close
                if (zone === this.currentZone && this.currentZone !== 'overview') {
                    if (this.isCardOpen) {
                        this.closeContextCard()
                    } else {
                        this.openContextCard(zone)
                    }
                } else {
                    this.goToZone(zone, true)
                }
            }
        })
    }

    initHeaderNav() {
        // Brand home button -> Overview
        const brandBtn = document.getElementById('btn-brand-home')
        if (brandBtn) {
            brandBtn.addEventListener('click', () => {
                this.goToZone('overview', false)
            })
        }

        // Header nav links
        const navItems = document.querySelectorAll('.site-header .nav-item, #btn-header-contact')
        navItems.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault()
                const zone = btn.dataset.zone
                if (zone) {
                    this.goToZone(zone, true)
                }
            })
        })
    }

    initContextCard() {
        const closeBtn = document.getElementById('btn-card-close')
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeContextCard()
            })
        }

        if (this.reopenBtn) {
            this.reopenBtn.addEventListener('click', () => {
                this.openContextCard(this.currentZone)
            })
        }
    }

    goToZone(zoneName, openCard = true) {
        // Map alias if needed
        const targetKey = zoneName === 'overview' ? 'hero' : zoneName
        this.currentZone = zoneName

        // Move 3D camera
        if (this.navigation) {
            this.navigation.goToSection(targetKey, 1.4)
            this.navigation.dismissHint()
        }

        // Update Dock active states
        if (this.dock) {
            const dockButtons = this.dock.querySelectorAll('.dock-item')
            dockButtons.forEach((btn) => {
                if (btn.dataset.zone === zoneName) {
                    btn.classList.add('active')
                } else {
                    btn.classList.remove('active')
                }
            })
        }

        // Update Header nav active states
        const headerNavButtons = document.querySelectorAll('.site-header .nav-item')
        headerNavButtons.forEach((btn) => {
            if (btn.dataset.zone === zoneName) {
                btn.classList.add('active')
            } else {
                btn.classList.remove('active')
            }
        })

        // Manage contextual card
        if (zoneName === 'overview') {
            this.closeContextCard()
            if (this.reopenBtn) {
                this.reopenBtn.classList.add('hidden')
            }
        } else if (openCard) {
            this.openContextCard(zoneName)
        } else {
            this.updateReopenButtonLabel(zoneName)
        }
    }

    updateReopenButtonLabel(zoneName) {
        if (!this.reopenBtn || !this.reopenLabel) return
        const labels = {
            projects: 'View Projects',
            experience: 'View Experience',
            skills: 'View Skills',
            about: 'About Rutvik',
            contact: 'Get in Touch'
        }
        this.reopenLabel.textContent = labels[zoneName] || 'View Info'
        this.reopenBtn.classList.remove('hidden')
    }

    openContextCard(zoneName) {
        if (!this.contextCard || !this.cardBody) return

        this.isCardOpen = true
        this.contextCard.classList.remove('hidden')
        this.contextCard.setAttribute('aria-hidden', 'false')

        if (this.reopenBtn) {
            this.reopenBtn.classList.add('hidden')
        }

        // Render template for the zone
        this.renderCardContent(zoneName)
    }

    closeContextCard() {
        if (!this.contextCard) return
        this.isCardOpen = false
        this.contextCard.classList.add('hidden')
        this.contextCard.setAttribute('aria-hidden', 'true')

        if (this.currentZone !== 'overview') {
            this.updateReopenButtonLabel(this.currentZone)
        }
    }

    renderCardContent(zoneName) {
        switch (zoneName) {
            case 'projects':
                this.renderProjectsView()
                break
            case 'experience':
                this.renderExperienceView()
                break
            case 'skills':
                this.renderSkillsView()
                break
            case 'about':
                this.renderAboutView()
                break
            case 'contact':
                this.renderContactView()
                break
            default:
                break
        }
    }

    renderProjectsView() {
        if (this.cardBadge) this.cardBadge.textContent = 'SYSTEM / 01'
        if (this.cardTitle) this.cardTitle.textContent = 'Selected Projects'

        const projects = portfolioData.projects
        const activeProject = projects[this.currentProjectIndex] || projects[0]

        // Tabs HTML
        const tabsHtml = projects.map((p, idx) => `
            <button class="project-tab-pill ${idx === this.currentProjectIndex ? 'active' : ''}" data-project-idx="${idx}">
                <span class="tab-dot"></span>
                <span class="tab-title">${p.title.split('—')[0].trim()}</span>
            </button>
        `).join('')

        this.cardBody.innerHTML = `
            <div class="projects-tabs-bar">
                ${tabsHtml}
            </div>

            <div class="active-project-pane">
                <div class="project-header-row">
                    <span class="project-tab-badge">file: ${activeProject.tabName}</span>
                    <span class="live-indicator"><span class="live-pulse"></span> Screen Synced</span>
                </div>

                <h3 class="pane-project-title">${activeProject.title}</h3>

                <div class="problem-box">
                    <span class="box-label">ENGINEERING PROBLEM</span>
                    <p class="problem-text">${activeProject.problem}</p>
                </div>

                <p class="pane-project-desc">${activeProject.description}</p>

                <div class="card-stack">
                    ${activeProject.stack.map(s => `<span class="stack-tag">${s}</span>`).join('')}
                </div>

                <div class="card-actions-row">
                    <button class="btn-inspect-3d" id="btn-inspect-project" data-project-idx="${this.currentProjectIndex}">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                        <span>Run on 3D Monitor</span>
                    </button>
                    <a href="${activeProject.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn-external-link">
                        <span>GitHub</span>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
                    </a>
                </div>
            </div>
        `

        // Add Tab Click Listeners
        const tabBtns = this.cardBody.querySelectorAll('.project-tab-pill')
        tabBtns.forEach((btn) => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.projectIdx, 10)
                if (!isNaN(idx) && idx !== this.currentProjectIndex) {
                    this.currentProjectIndex = idx
                    screenSync.emit('tab:select', { index: idx })
                    this.renderProjectsView()
                }
            })
        })

        // Add Inspect Button Listener
        const inspectBtn = this.cardBody.querySelector('#btn-inspect-project')
        if (inspectBtn) {
            inspectBtn.addEventListener('click', () => {
                screenSync.emit('tab:select', { index: this.currentProjectIndex })
                if (this.navigation) {
                    this.navigation.goToSection('projects', 1.2)
                }
            })
        }
    }

    renderExperienceView() {
        if (this.cardBadge) this.cardBadge.textContent = 'SYSTEM / 02'
        if (this.cardTitle) this.cardTitle.textContent = 'Track Record'

        const experiences = portfolioData.experiences

        const expHtml = experiences.map((exp, idx) => `
            <div class="exp-card-item">
                <div class="exp-header">
                    <div>
                        <h4 class="exp-role">${exp.role}</h4>
                        <div class="exp-company">${exp.company}</div>
                    </div>
                    <div class="exp-meta">
                        <span class="period-pill">${exp.period}</span>
                        <span class="location-pill">${exp.location} • ${exp.mode}</span>
                    </div>
                </div>
                <ul class="exp-bullets">
                    ${exp.highlights.map(h => `<li>${h}</li>`).join('')}
                </ul>
                <div class="exp-tags">
                    ${exp.skills.map(s => `<span class="tag-chip">${s}</span>`).join('')}
                </div>
            </div>
        `).join('')

        this.cardBody.innerHTML = `
            <div class="experience-list-pane">
                <div class="pane-hint-box">
                    <span class="pane-hint-icon">⚡</span>
                    <span>The MacBook on the riser is rendering the live multi-agent DAG orchestration.</span>
                </div>
                ${expHtml}
            </div>
        `
    }

    renderSkillsView() {
        if (this.cardBadge) this.cardBadge.textContent = 'SYSTEM / 03'
        if (this.cardTitle) this.cardTitle.textContent = 'Toolkit & Stack'

        const groups = portfolioData.skillsGrouped

        const groupsHtml = groups.map((g) => `
            <div class="skill-category-box">
                <div class="skill-cat-title">${g.category}</div>
                <p class="skill-cat-desc">${g.description}</p>
                <div class="skill-cat-chips">
                    ${g.skills.map(s => `<span class="chip-item">${s}</span>`).join('')}
                </div>
            </div>
        `).join('')

        this.cardBody.innerHTML = `
            <div class="skills-list-pane">
                ${groupsHtml}
            </div>
        `
    }

    renderAboutView() {
        if (this.cardBadge) this.cardBadge.textContent = 'SYSTEM / 04'
        if (this.cardTitle) this.cardTitle.textContent = 'Perspective & Focus'

        const paragraphs = portfolioData.about.bio

        this.cardBody.innerHTML = `
            <div class="about-pane">
                ${paragraphs.map(p => `<p class="about-p">${p}</p>`).join('')}

                <div class="principles-box">
                    <span class="principles-title">CORE ENGINEERING PRINCIPLES</span>
                    <div class="principle-item">
                        <span class="p-num">01</span>
                        <div>
                            <span class="p-title">Deterministic Over Stochastic</span>
                            <span class="p-desc">Constrain LLM outputs with strict schemas and conditional routing.</span>
                        </div>
                    </div>
                    <div class="principle-item">
                        <span class="p-num">02</span>
                        <div>
                            <span class="p-title">Tenant State Isolation</span>
                            <span class="p-desc">Never bleed global state across multi-agent workspace boundaries.</span>
                        </div>
                    </div>
                    <div class="principle-item">
                        <span class="p-num">03</span>
                        <div>
                            <span class="p-title">Observable Telemetry</span>
                            <span class="p-desc">Every step, tool call, and token metric verified in real time.</span>
                        </div>
                    </div>
                </div>
            </div>
        `
    }

    renderContactView() {
        if (this.cardBadge) this.cardBadge.textContent = 'SYSTEM / 05'
        if (this.cardTitle) this.cardTitle.textContent = "Let's Connect"

        const contact = portfolioData.contact

        this.cardBody.innerHTML = `
            <div class="contact-pane">
                <p class="contact-desc">${contact.subheading}</p>

                <div class="contact-cards-column">
                    <a href="mailto:${contact.email}" class="contact-row-card">
                        <div class="contact-row-icon">✉️</div>
                        <div class="contact-row-info">
                            <span class="contact-row-label">EMAIL DIRECT</span>
                            <span class="contact-row-val">${contact.email}</span>
                        </div>
                        <span class="contact-row-arrow">↗</span>
                    </a>

                    <a href="${contact.github}" target="_blank" rel="noopener noreferrer" class="contact-row-card">
                        <div class="contact-row-icon">🐙</div>
                        <div class="contact-row-info">
                            <span class="contact-row-label">GITHUB</span>
                            <span class="contact-row-val">github.com/${contact.githubUsername}</span>
                        </div>
                        <span class="contact-row-arrow">↗</span>
                    </a>

                    <a href="${contact.linkedin}" target="_blank" rel="noopener noreferrer" class="contact-row-card">
                        <div class="contact-row-icon">💼</div>
                        <div class="contact-row-info">
                            <span class="contact-row-label">LINKEDIN</span>
                            <span class="contact-row-val">linkedin.com/in/${contact.linkedinUsername}</span>
                        </div>
                        <span class="contact-row-arrow">↗</span>
                    </a>
                </div>

                <div class="contact-footer-note">
                    <span>📍 Based in ${contact.location} • Open to Remote & On-site AI/ML Roles</span>
                </div>
            </div>
        `
    }

    initRaycasting() {
        window.addEventListener('pointermove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
            this.checkSpatialHover(e)
        })

        window.addEventListener('pointerdown', (e) => {
            this.mouseDownPos.x = e.clientX
            this.mouseDownPos.y = e.clientY
        })

        window.addEventListener('pointerup', (e) => {
            const dist = Math.hypot(e.clientX - this.mouseDownPos.x, e.clientY - this.mouseDownPos.y)
            if (dist < 6) {
                this.handleSpatialClick(e)
            }
        })

        window.addEventListener('dblclick', () => {
            this.goToZone('overview', false)
        })
    }

    checkSpatialHover(e) {
        if (!this.camera || !this.camera.modes?.default?.instance) return

        this.raycaster.setFromCamera(this.mouse, this.camera.modes.default.instance)

        const interactiveMeshes = []
        if (this.world?.pcScreen?.mesh) interactiveMeshes.push({ mesh: this.world.pcScreen.mesh, zone: 'projects' })
        if (this.world?.macScreen?.mesh) interactiveMeshes.push({ mesh: this.world.macScreen.mesh, zone: 'experience' })
        if (this.world?.baked?.model?.mesh) interactiveMeshes.push({ mesh: this.world.baked.model.mesh, zone: 'baked' })

        const meshesOnly = interactiveMeshes.map(m => m.mesh)
        const intersects = this.raycaster.intersectObjects(meshesOnly, true)

        let detectedZone = null

        if (intersects.length > 0) {
            const hit = intersects[0]
            const pt = hit.point

            if (this.world?.pcScreen?.mesh && hit.object === this.world.pcScreen.mesh) {
                detectedZone = 'projects'
            } else if (this.world?.macScreen?.mesh && hit.object === this.world.macScreen.mesh) {
                detectedZone = 'experience'
            } else if (pt.x < -1.8 && pt.z < 0 && pt.y > 0.5) {
                detectedZone = 'skills'
            } else if (pt.x >= -1.2 && pt.x <= 1.4 && pt.z < -3.0 && pt.y > 2.0) {
                detectedZone = 'projects'
            } else if (pt.x > 1.4 && pt.x <= 3.2 && pt.z < -3.0 && pt.y > 2.0) {
                detectedZone = 'experience'
            } else if (pt.x >= -1.5 && pt.x <= 2.5 && pt.z >= -4.0 && pt.z <= -1.0 && pt.y < 2.5) {
                detectedZone = 'about'
            } else if (pt.x >= 0.0 && pt.x <= 3.0 && pt.z >= 0.0 && pt.z <= 2.5) {
                detectedZone = 'contact'
            }
        }

        this.hoveredZone = detectedZone

        // Update cursor style only (no text tooltip)
        if (detectedZone) {
            document.body.style.cursor = 'pointer'
        } else {
            document.body.style.cursor = 'default'
        }
    }

    handleSpatialClick(e) {
        // Prevent click when clicking on HTML overlay UI elements
        if (e.target.closest('#hud-dock, #context-card, #tv-music-player, .site-header, .btn-reopen-card')) {
            return
        }

        if (this.hoveredZone) {
            this.goToZone(this.hoveredZone, true)
        }
    }

    initKeyboardControls() {
        window.addEventListener('keydown', (e) => {
            // Do not capture if typing in an input/textarea
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

            if (e.key === 'Escape') {
                this.closeContextCard()
            } else if (e.key === '1') {
                this.goToZone('overview', false)
            } else if (e.key === '2') {
                this.goToZone('projects', true)
            } else if (e.key === '3') {
                this.goToZone('experience', true)
            } else if (e.key === '4') {
                this.goToZone('skills', true)
            } else if (e.key === '5') {
                this.goToZone('about', true)
            } else if (e.key === '6') {
                this.goToZone('contact', true)
            } else if (e.key === ' ' && !e.repeat) {
                // Space bar toggles TV music player
                e.preventDefault()
                if (window.tvPlayer) {
                    window.tvPlayer.togglePlay()
                }
            }
        })
    }

    destroy() {
        // Clean up listeners
    }
}
