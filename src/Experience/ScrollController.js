import Experience from './Experience.js'
import screenSync from './ScreenSync.js'
import chatService from './ChatService.js'
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

        // Chat state
        this.activeExpTab = 'chat'
        this.isAiThinking = false
        this.chatMessages = [
            {
                role: 'assistant',
                content: "Hi! I'm **Rutvik AI**. Ask me anything about Rutvik's autonomous multi-agent projects, tech stack, work experience, education, or how to contact him!"
            }
        ]

        // Raycasting
        this.raycaster = new THREE.Raycaster()
        this.mouse = new THREE.Vector2(-999, -999)
        this.mouseDownPos = { x: 0, y: 0 }
        this.hoveredZone = null
        this.hoveredMacUv = null

        this.initDOM()
        this.initHUDDock()
        this.initContextCard()
        this.initLaptopChatBar()
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
                if (zone === 'experience') {
                    this.goToZone('experience', false)
                    if (this.laptopChatInput) {
                        this.laptopChatInput.focus()
                    }
                } else if (zone === this.currentZone && this.currentZone !== 'overview') {
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

    initLaptopChatBar() {
        // Off-screen keyboard/IME proxy so visitors type directly onto the 3D laptop display
        // without an HTML bar covering the zoomed-in laptop screen.
        let bar = document.getElementById('laptop-chat-bar')
        if (!bar) {
            bar = document.createElement('div')
            bar.id = 'laptop-chat-bar'
            bar.className = 'laptop-chat-bar laptop-input-proxy hidden'
            bar.innerHTML = `
                <form id="laptop-chat-form" class="laptop-chat-form">
                    <input
                        type="text"
                        id="laptop-chat-input"
                        class="laptop-chat-input"
                        aria-label="Ask Rutvik AI a question"
                        placeholder="Ask Rutvik AI a question..."
                        autocomplete="off"
                    />
                </form>
            `
            document.body.appendChild(bar)
        }

        this.laptopChatBar = bar
        this.laptopChatInput = bar.querySelector('#laptop-chat-input')
        const form = bar.querySelector('#laptop-chat-form')

        const syncInputToScreen = () => {
            if (!this.laptopChatInput) return
            screenSync.emit('chat:input-change', {
                value: this.laptopChatInput.value,
                focused: document.activeElement === this.laptopChatInput
            })
        }

        const submitCurrentInput = () => {
            if (!this.laptopChatInput || this.isAiThinking) return
            const val = this.laptopChatInput.value.trim()
            if (val) {
                this.laptopChatInput.value = ''
                syncInputToScreen()
                this.handleUserChatMessage(val)
            }
        }

        if (form && this.laptopChatInput) {
            form.addEventListener('submit', (e) => {
                e.preventDefault()
                submitCurrentInput()
            })

            this.laptopChatInput.addEventListener('input', syncInputToScreen)
            this.laptopChatInput.addEventListener('focus', syncInputToScreen)
            this.laptopChatInput.addEventListener('blur', syncInputToScreen)
            this.laptopChatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    e.preventDefault()
                    this.goToZone('overview', false)
                }
            })
        }

        screenSync.on('chat:submit', () => {
            submitCurrentInput()
            this.focusLaptopInput()
        })

        screenSync.on('chat:send', (data) => {
            if (data?.text && !this.isAiThinking) {
                this.handleUserChatMessage(data.text)
            }
            this.focusLaptopInput()
        })
    }

    focusLaptopInput() {
        if (!this.laptopChatInput || this.currentZone !== 'experience') return
        try {
            this.laptopChatInput.focus({ preventScroll: true })
        } catch (err) {
            this.laptopChatInput.focus()
        }
        screenSync.emit('chat:input-change', {
            value: this.laptopChatInput.value || '',
            focused: document.activeElement === this.laptopChatInput
        })
    }

    showLaptopChatBar(show) {
        if (!this.laptopChatBar) return
        if (show) {
            this.laptopChatBar.classList.remove('hidden')
            this.focusLaptopInput()
            setTimeout(() => this.focusLaptopInput(), 120)
        } else {
            this.laptopChatBar.classList.add('hidden')
            if (this.laptopChatInput) {
                this.laptopChatInput.blur()
            }
            screenSync.emit('chat:input-change', {
                value: this.laptopChatInput ? this.laptopChatInput.value : '',
                focused: false
            })
        }
    }

    goToZone(zoneName, openCard = true) {
        // Map alias if needed
        const targetKey = zoneName === 'overview' ? 'hero' : zoneName
        this.currentZone = zoneName

        // Move 3D camera
        if (this.navigation) {
            this.navigation.goToSection(targetKey, 1.2)
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

        // Manage contextual card & floating laptop chat
        if (zoneName === 'overview') {
            this.closeContextCard()
            this.showLaptopChatBar(false)
            screenSync.emit('chat:close')
            if (this.reopenBtn) {
                this.reopenBtn.classList.add('hidden')
            }
        } else if (zoneName === 'experience') {
            // For laptop view, do NOT open the side context card.
            // The chat is displayed directly on the 3D laptop in the room!
            this.closeContextCard()
            if (this.reopenBtn) {
                this.reopenBtn.classList.add('hidden')
            }
            screenSync.emit('chat:open')
            this.showLaptopChatBar(true)
        } else {
            this.showLaptopChatBar(false)
            if (openCard) {
                this.openContextCard(zoneName)
            } else {
                this.updateReopenButtonLabel(zoneName)
            }
        }
    }

    updateReopenButtonLabel(zoneName) {
        if (!this.reopenBtn || !this.reopenLabel) return
        const labels = {
            projects: 'View Projects',
            experience: 'Chat with Rutvik AI',
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
                <span class="tab-title">${p.shortTitle || p.title.split('—')[0].trim()}</span>
            </button>
        `).join('')

        const hasExternalLive = activeProject.liveUrl && activeProject.liveUrl !== activeProject.githubUrl

        this.cardBody.innerHTML = `
            <div class="projects-tabs-bar">
                ${tabsHtml}
            </div>

            <div class="active-project-pane">
                <div class="project-header-row">
                    <span class="project-tab-badge">file: ${activeProject.tabName}</span>
                </div>

                <h3 class="pane-project-title">${activeProject.title}</h3>

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
                    ${hasExternalLive ? `
                    <a href="${activeProject.liveUrl}" target="_blank" rel="noopener noreferrer" class="btn-external-link">
                        <span>Live</span>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
                    </a>` : ''}
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
                screenSync.emit('run:code', { index: this.currentProjectIndex })
                screenSync.emit('tab:select', { index: this.currentProjectIndex })
                if (this.navigation) {
                    this.navigation.goToSection('projects', 1.2)
                }
            })
        }
    }

    renderExperienceView() {
        if (this.cardBadge) this.cardBadge.textContent = 'SYSTEM / 02'
        if (this.cardTitle) this.cardTitle.textContent = this.activeExpTab === 'chat' ? 'Chat with Rutvik AI' : 'Track Record'

        screenSync.emit('chat:open')

        if (this.activeExpTab === 'chat') {
            this.renderChatPane()
        } else {
            this.renderResumePane()
        }
    }

    renderChatPane() {
        if (!this.cardBody) return

        const quickQuestions = [
            "☀️ Tell me about Solar Power Plant Analysis",
            "💼 What is your work experience?",
            "⚡ What is your core tech stack?",
            "🤖 What public AI projects are on Rutvik's GitHub?",
            "📬 How can I contact or hire Rutvik?",
            "🎓 What is your education background?"
        ]

        const chipsHtml = quickQuestions.map(q => `
            <button class="quick-chip-btn" data-question="${q}">${q}</button>
        `).join('')

        this.cardBody.innerHTML = `
            <div class="chat-container-pane">
                <div class="chat-subtabs-row">
                    <button class="chat-subtab-btn active" id="tab-btn-chat">
                        <span>💬 Chat with Rutvik AI</span>
                    </button>
                    <button class="chat-subtab-btn" id="tab-btn-resume">
                        <span>📜 Track Record</span>
                    </button>
                </div>

                <div class="chat-quick-chips">
                    ${chipsHtml}
                </div>

                <div class="chat-messages-box" id="chat-messages-box">
                    ${this.renderMessageItemsHtml()}
                </div>

                <form class="chat-input-wrapper" id="chat-form">
                    <input 
                        type="text" 
                        class="chat-input-field" 
                        id="chat-input-field" 
                        placeholder="Ask about Rutvik's projects, stack, experience..." 
                        autocomplete="off"
                    />
                    <button type="submit" class="chat-send-btn" id="chat-send-btn">
                        <span>Send</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </button>
                </form>
            </div>
        `

        // Scroll to bottom
        this.scrollChatToBottom()

        // Attach listeners
        const tabResume = this.cardBody.querySelector('#tab-btn-resume')
        if (tabResume) {
            tabResume.addEventListener('click', () => {
                this.activeExpTab = 'resume'
                this.renderExperienceView()
            })
        }

        const chips = this.cardBody.querySelectorAll('.quick-chip-btn')
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                const q = chip.dataset.question.replace(/^[^a-zA-Z0-9]+/, '')
                this.handleUserChatMessage(q)
            })
        })

        const form = this.cardBody.querySelector('#chat-form')
        const input = this.cardBody.querySelector('#chat-input-field')
        if (form && input) {
            form.addEventListener('submit', (e) => {
                e.preventDefault()
                const val = input.value.trim()
                if (val) {
                    input.value = ''
                    this.handleUserChatMessage(val)
                }
            })
        }
    }

    async handleUserChatMessage(text) {
        if (!text || !text.trim()) return

        this.chatMessages.push({ role: 'user', content: text })
        screenSync.emit('chat:message', { role: 'user', content: text })

        this.isAiThinking = true
        this.updateChatMessagesDOM()

        try {
            const reply = await chatService.sendMessage(text)
            this.isAiThinking = false
            this.chatMessages.push({ role: 'assistant', content: reply })
            screenSync.emit('chat:message', { role: 'assistant', content: reply })
        } catch (err) {
            console.error('Chat error:', err)
            this.isAiThinking = false
            const errMsg = "I encountered an issue connecting to the AI assistant service. Please feel free to email Rutvik directly at rutvik.professional@gmail.com."
            this.chatMessages.push({ role: 'assistant', content: errMsg })
            screenSync.emit('chat:message', { role: 'assistant', content: errMsg })
        }

        this.updateChatMessagesDOM()
    }

    updateChatMessagesDOM() {
        const box = document.getElementById('chat-messages-box')
        if (box) {
            box.innerHTML = this.renderMessageItemsHtml()
            this.scrollChatToBottom()
        }
    }

    scrollChatToBottom() {
        const box = document.getElementById('chat-messages-box')
        if (box) {
            box.scrollTop = box.scrollHeight
        }
    }

    renderMessageItemsHtml() {
        let html = this.chatMessages.map(msg => {
            const isUser = msg.role === 'user'
            const formatted = this.formatMarkdown(msg.content)
            return `
                <div class="chat-msg ${isUser ? 'user' : 'assistant'}">
                    <div class="chat-bubble">
                        ${formatted}
                    </div>
                </div>
            `
        }).join('')

        if (this.isAiThinking) {
            html += `
                <div class="chat-msg assistant">
                    <div class="chat-thinking-indicator">
                        <span>⚡ Rutvik AI is reasoning</span>
                        <div class="chat-thinking-dots">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                </div>
            `
        }

        return html
    }

    formatMarkdown(text) {
        if (!text) return ''

        // Normalize raw HTML breaks
        let raw = text.replace(/<br\s*\/?>/gi, '\n')

        // Split into lines
        const lines = raw.split('\n')
        const output = []
        let inTable = false
        let tableHeaders = []
        let tableRows = []
        let inList = false
        let listType = 'ul' // 'ul' or 'ol'
        let listItems = []

        const flushList = () => {
            if (inList && listItems.length > 0) {
                const tag = listType
                output.push(`<${tag} class="chat-list">${listItems.map(li => `<li>${li}</li>`).join('')}</${tag}>`)
                listItems = []
                inList = false
            }
        }

        const flushTable = () => {
            if (inTable) {
                let html = '<div class="chat-table-wrapper"><table class="chat-table">'
                if (tableHeaders.length > 0) {
                    html += `<thead><tr>${tableHeaders.map(h => `<th>${h}</th>`).join('')}</tr></thead>`
                }
                if (tableRows.length > 0) {
                    html += `<tbody>${tableRows.map(row => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>`
                }
                html += '</table></div>'
                output.push(html)
                tableHeaders = []
                tableRows = []
                inTable = false
            }
        }

        const formatInline = (str) => {
            return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>')
                .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        }

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim()

            // 1. Check Table row
            if (/^\|.*\|$/.test(line)) {
                flushList()
                // Check if separator line e.g. |---|---|
                if (/^\|[-:\s|]+\|$/.test(line)) {
                    continue
                }
                const cells = line.split('|')
                    .slice(1, -1)
                    .map(c => formatInline(c.trim()))
                if (!inTable) {
                    inTable = true
                    tableHeaders = cells
                } else {
                    tableRows.push(cells)
                }
                continue
            } else {
                flushTable()
            }

            // 2. Check Bullet List (- or * or •)
            const bulletMatch = line.match(/^[-*•]\s+(.*)$/)
            if (bulletMatch) {
                flushTable()
                if (!inList || listType !== 'ul') {
                    flushList()
                    inList = true
                    listType = 'ul'
                }
                listItems.push(formatInline(bulletMatch[1]))
                continue
            }

            // 3. Check Numbered List (1. or 2.)
            const numMatch = line.match(/^\d+\.\s+(.*)$/)
            if (numMatch) {
                flushTable()
                if (!inList || listType !== 'ol') {
                    flushList()
                    inList = true
                    listType = 'ol'
                }
                listItems.push(formatInline(numMatch[1]))
                continue
            }

            // Not a list item: flush list
            flushList()

            // 4. Check Headers (#, ##, ###)
            const headerMatch = line.match(/^#{1,4}\s+(.*)$/)
            if (headerMatch) {
                output.push(`<h4 class="chat-h4">${formatInline(headerMatch[1])}</h4>`)
                continue
            }

            // 5. Normal text line / paragraph
            if (line.length > 0) {
                output.push(`<p>${formatInline(line)}</p>`)
            }
        }

        flushList()
        flushTable()

        return output.join('')
    }

    renderResumePane() {
        if (!this.cardBody) return

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
            <div class="chat-container-pane">
                <div class="chat-subtabs-row">
                    <button class="chat-subtab-btn" id="tab-btn-chat">
                        <span>💬 Chat with Rutvik AI</span>
                    </button>
                    <button class="chat-subtab-btn active" id="tab-btn-resume">
                        <span>📜 Track Record</span>
                    </button>
                </div>
                <div class="experience-list-pane">
                    <div class="pane-hint-box">
                        <span class="pane-hint-icon">⚡</span>
                        <span>The 3D MacBook displays the live Spider-Man wallpaper and interactive AI Chatbot.</span>
                    </div>
                    ${expHtml}
                </div>
            </div>
        `

        const tabChat = this.cardBody.querySelector('#tab-btn-chat')
        if (tabChat) {
            tabChat.addEventListener('click', () => {
                this.activeExpTab = 'chat'
                this.renderExperienceView()
            })
        }
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
            if (dist < 5) {
                this.handleSpatialClick(e)
            }
        })

        // Sync focus inside native click event so touch keyboards also open reliably when tapping the 3D laptop input
        if (this.targetElement) {
            this.targetElement.addEventListener('click', () => {
                if (this.currentZone === 'experience' && this.hoveredZone === 'experience') {
                    this.focusLaptopInput()
                }
            })
        }

        window.addEventListener('dblclick', (e) => {
            if (this.currentZone === 'experience' && this.hoveredZone === 'experience') {
                return
            }
            if (!e.target.closest('#hud-dock, #context-card, #tv-music-player, .btn-reopen-card, .bottom-bar-container')) {
                this.goToZone('overview', false)
            }
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
        let macHitUv = null

        if (intersects.length > 0) {
            const hit = intersects[0]
            const pt = hit.point

            if (this.world?.pcScreen?.mesh && hit.object === this.world.pcScreen.mesh) {
                detectedZone = 'projects'
            } else if (this.world?.macScreen?.mesh && hit.object === this.world.macScreen.mesh) {
                detectedZone = 'experience'
                macHitUv = hit.uv ? hit.uv.clone() : null
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
        this.hoveredMacUv = macHitUv

        // Update cursor style & live hover feedback on the 3D laptop UI
        if (detectedZone === 'experience' && macHitUv && this.world?.macScreen) {
            document.body.style.cursor = this.world.macScreen.getHoverCursor(macHitUv)
        } else {
            if (this.world?.macScreen) {
                this.world.macScreen.clearHover()
            }
            if (detectedZone) {
                document.body.style.cursor = 'pointer'
            } else {
                document.body.style.cursor = 'default'
            }
        }
    }

    handleSpatialClick(e) {
        // Prevent click when clicking on HTML overlay UI elements
        if (e.target.closest('#hud-dock, #context-card, #tv-music-player, .btn-reopen-card, .bottom-bar-container, #laptop-chat-bar')) {
            return
        }

        if (this.hoveredZone) {
            if (this.hoveredZone === 'projects') {
                screenSync.emit('run:code', { index: this.currentProjectIndex })
                this.goToZone('projects', true)
            } else if (this.hoveredZone === 'experience') {
                if (this.currentZone === 'experience' && this.world?.macScreen?.isChatOpen && this.hoveredMacUv) {
                    const action = this.world.macScreen.handleCanvasClick(this.hoveredMacUv)
                    if (action === 'focus-input') {
                        this.focusLaptopInput()
                    }
                } else {
                    screenSync.emit('chat:open')
                    this.goToZone('experience', false)
                    this.focusLaptopInput()
                }
            } else {
                this.goToZone(this.hoveredZone, true)
            }
        }
    }

    initKeyboardControls() {
        window.addEventListener('keydown', (e) => {
            // Do not capture if typing in an input/textarea
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

            if (e.key === 'Escape') {
                if (this.currentZone === 'experience') {
                    this.goToZone('overview', false)
                } else if (this.isCardOpen) {
                    this.closeContextCard()
                } else {
                    this.goToZone('overview', false)
                }
            } else if (e.key === '1') {
                this.goToZone('overview', false)
            } else if (e.key === '2') {
                this.goToZone('projects', true)
            } else if (e.key === '3') {
                this.goToZone('experience', false)
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
