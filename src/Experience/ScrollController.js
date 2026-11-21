import Experience from './Experience.js'
import screenSync from './ScreenSync.js'
import { portfolioData } from '../data/portfolio.js'

export default class ScrollController {
    constructor() {
        this.experience = new Experience()
        this.camera = this.experience.camera
        this.navigation = this.experience.navigation

        this.currentActiveSection = 'hero'
        this.sections = ['hero', 'projects', 'experience', 'skills', 'about', 'contact']

        this.initSectionObserver()
        this.initProjectCardsObserver()
        this.initNavLinks()
        this.initInteractiveButtons()
    }

    initSectionObserver() {
        // IntersectionObserver for major portfolio sections
        const isMobile = window.innerWidth < 1024
        const threshold = isMobile ? 0.25 : 0.4

        const observerOptions = {
            root: null,
            rootMargin: isMobile ? '-10% 0px -40% 0px' : '-15% 0px -30% 0px',
            threshold: threshold
        }

        this.sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id
                    if (sectionId && sectionId !== this.currentActiveSection) {
                        this.onSectionChange(sectionId)
                    }
                }
            })
        }, observerOptions)

        this.sections.forEach((id) => {
            const el = document.getElementById(id)
            if (el) {
                this.sectionObserver.observe(el)
            }
        })
    }

    onSectionChange(sectionId) {
        this.currentActiveSection = sectionId

        // Move 3D camera to matching viewpoint
        if (this.experience.navigation) {
            this.experience.navigation.goToSection(sectionId, 1.5)
        }

        // Update active class on header nav links
        const navLinks = document.querySelectorAll('header nav a, .mobile-nav a')
        navLinks.forEach((link) => {
            const href = link.getAttribute('href')
            if (href === `#${sectionId}`) {
                link.classList.add('active')
            } else {
                link.classList.remove('active')
            }
        })
    }

    initProjectCardsObserver() {
        // Observe individual project cards in the projects section
        const projectCards = document.querySelectorAll('.project-card')
        if (!projectCards.length) return

        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                    const tabIndex = parseInt(entry.target.dataset.projectIndex, 10)
                    if (!isNaN(tabIndex)) {
                        screenSync.emit('tab:select', { index: tabIndex })
                    }
                }
            })
        }, {
            threshold: 0.5
        })

        projectCards.forEach((card) => {
            cardObserver.observe(card)
        })
    }

    initNavLinks() {
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener('click', (e) => {
                const targetId = anchor.getAttribute('href').substring(1)
                const targetEl = document.getElementById(targetId)

                if (targetEl) {
                    e.preventDefault()

                    // Transition 3D room camera immediately
                    if (this.experience.navigation) {
                        this.experience.navigation.goToSection(targetId, 1.6)
                    }

                    targetEl.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    })

                    // Update URL hash without jumping
                    history.pushState(null, null, `#${targetId}`)
                }
            })
        })
    }

    initInteractiveButtons() {
        // "Focus in 3D Screen" buttons on project cards
        document.querySelectorAll('.btn-focus-screen').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault()
                const tabIndex = parseInt(btn.dataset.projectIndex, 10)
                if (!isNaN(tabIndex)) {
                    screenSync.emit('tab:select', { index: tabIndex })
                }
                if (this.experience.navigation) {
                    this.experience.navigation.goToSection('projects', 1.2)
                }
            })
        })
    }

    destroy() {
        if (this.sectionObserver) {
            this.sectionObserver.disconnect()
        }
    }
}
