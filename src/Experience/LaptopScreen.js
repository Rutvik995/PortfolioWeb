import * as THREE from 'three';
import Experience from './Experience.js';
import screenSync from './ScreenSync.js';

const QUICK_CHIPS = [
    { label: '🤖 Projects', q: 'Tell me about Cortex Multi-Agent Platform and your featured projects.' },
    { label: '💼 Experience', q: 'What is your professional work experience?' },
    { label: '🛠️ Skills', q: 'What is your technical skill stack?' },
    { label: '☀️ Solar AI', q: 'Explain the Solar Power Agentic Analytics System.' },
    { label: '🎓 Education', q: 'What is your education background?' },
    { label: '📬 Contact', q: 'How can I contact or hire Rutvik?' }
];

const BODY_FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
const MONO_FONT = '"JetBrains Mono", Consolas, "Courier New", monospace';

/**
 * LaptopScreen — interactive AI chat canvas rendered directly on the 3D MacBook screen.
 * Supports live typed text + caret directly in the MacBook input bar, clickable topic chips
 * and Send button via Three.js UV raycasting, rich-text formatting (**bold**, `code`, bullets,
 * headings), top-anchored layout, and smooth wheel / button scrolling through full Q&A history.
 */
export default class LaptopScreen {
    constructor(mesh) {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.time = this.experience.time;
        this.mesh = mesh;

        this.prefersReducedMotion =
            window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        this.width = 1280;
        this.height = 800;
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d');

        // Desktop wallpaper shown before entering chat
        this.wallpaper = new Image();
        this.wallpaperLoaded = false;
        this.wallpaper.onload = () => {
            this.wallpaperLoaded = true;
            this.markDirty();
        };
        this.wallpaper.onerror = () => {};
        this.wallpaper.src = '/assets/laptopWallpaper.jpg';

        // Three.js CanvasTexture
        this.texture = new THREE.CanvasTexture(this.canvas);
        this.texture.encoding = THREE.sRGBEncoding;
        this.texture.generateMipmaps = false;
        this.texture.minFilter = THREE.LinearFilter;
        this.texture.magFilter = THREE.LinearFilter;

        this.material = new THREE.MeshBasicMaterial({
            map: this.texture,
            side: THREE.DoubleSide,
            toneMapped: false
        });

        if (this.mesh) {
            this.mesh.material = this.material;
            this.scene.add(this.mesh);
        }

        // Chat state
        this.isChatOpen = false;
        this.isThinking = false;
        this.messages = [
            {
                role: 'assistant',
                text: "Hi! I'm **Rutvik AI**. Ask me anything below about Rutvik's **AI projects**, **work experience**, **technical skills**, **education**, or how to **contact** him."
            }
        ];

        // Live input bar state synced with hidden DOM input for OS/IME/mobile typing
        this.inputText = '';
        this.isInputFocused = false;
        this.cursorBlink = true;
        this.lastBlinkTime = performance.now();

        // Scroll state: 0 = newest bottom visible; positive = pixels scrolled UP to older Q&A
        this.chatScrollOffset = 0;
        this._maxScroll = 0;
        this._prevTotalH = 0;

        // Typewriter reveal for newest assistant reply
        this.displayedCharIndex = this.messages[0].text.length;
        this.lastTypeTime = 0;
        this.typeSpeed = 12;

        // Interactive hitboxes in canvas coordinates (updated each render)
        this.hitTargets = {
            input: null,
            send: null,
            scrollUp: null,
            scrollDown: null,
            latestPill: null,
            windowBox: null,
            chips: []
        };
        this.hoverId = null;

        // Render throttling & dirty flag
        this.isPaused = false;
        this.lastFrameTime = 0;
        this.targetFps = 30;
        this.fpsInterval = 1000 / this.targetFps;
        this.needsRender = true;
        this.lastClockText = '';

        this._initEvents();
        this.render();
    }

    markDirty() {
        this.needsRender = true;
    }

    _initEvents() {
        document.addEventListener('visibilitychange', () => {
            this.isPaused = document.hidden;
        });

        screenSync.on('chat:open', () => {
            this.isChatOpen = true;
            this.chatScrollOffset = 0;
            this.cursorBlink = true;
            this.lastBlinkTime = performance.now();
            this.markDirty();
            this.render();
        });

        screenSync.on('chat:close', () => {
            this.isChatOpen = false;
            this.hoverId = null;
            this.markDirty();
            this.render();
        });

        screenSync.on('chat:input-change', (data) => {
            if (!data) return;
            const nextText = typeof data.value === 'string' ? data.value : this.inputText;
            const nextFocus = typeof data.focused === 'boolean' ? data.focused : this.isInputFocused;
            if (nextText !== this.inputText || nextFocus !== this.isInputFocused) {
                this.inputText = nextText;
                this.isInputFocused = nextFocus;
                this.cursorBlink = true;
                this.lastBlinkTime = performance.now();
                this.markDirty();
                this.render();
            }
        });

        screenSync.on('chat:message', (data) => {
            if (!data) return;
            this.isChatOpen = true;
            if (data.role === 'user') {
                this.messages.push({ role: 'user', text: data.content });
                this.isThinking = true;
                this.chatScrollOffset = 0;
            } else if (data.role === 'assistant') {
                this.isThinking = false;
                this.messages.push({ role: 'assistant', text: data.content });
                this.displayedCharIndex = this.prefersReducedMotion ? data.content.length : 0;
                this.chatScrollOffset = 0;
                this.lastTypeTime = performance.now();
            }
            this.markDirty();
            this.render();
        });

        // Scroll past questions & answers with mouse wheel over WebGL canvas
        const expEl = document.querySelector('.experience');
        if (expEl) {
            expEl.addEventListener('wheel', (e) => {
                if (!this.isChatOpen) return;
                const sc = this.experience.scrollController;
                const nav = this.experience.navigation;
                const activeOnLaptop =
                    nav?.currentSectionName === 'experience' ||
                    nav?.currentSectionName === 'macScreen' ||
                    sc?.hoveredZone === 'experience';

                if (activeOnLaptop && this._maxScroll > 0) {
                    // Wheel UP (negative deltaY) -> increase offset (show older messages above)
                    // Wheel DOWN (positive deltaY) -> decrease offset (return toward latest)
                    const nextOffset = THREE.MathUtils.clamp(
                        this.chatScrollOffset - e.deltaY * 0.7,
                        0,
                        this._maxScroll
                    );
                    if (nextOffset !== this.chatScrollOffset) {
                        this.chatScrollOffset = nextOffset;
                        this.markDirty();
                        this.render();
                    }
                }
            }, { passive: true });
        }
    }

    /** Convert Three.js mesh UV (origin bottom-left) to Canvas coordinates (origin top-left). */
    uvToCanvas(uv) {
        if (!uv) return null;
        return {
            x: uv.x * this.width,
            y: (1 - uv.y) * this.height
        };
    }

    _inRect(pt, rect) {
        return !!(rect && pt && pt.x >= rect.x && pt.x <= rect.x + rect.w && pt.y >= rect.y && pt.y <= rect.y + rect.h);
    }

    _hitTest(pt) {
        if (!this.isChatOpen || !pt) return null;
        if (this._inRect(pt, this.hitTargets.send)) return 'send';
        if (this._inRect(pt, this.hitTargets.input)) return 'input';
        if (this._inRect(pt, this.hitTargets.scrollUp)) return 'scroll-up';
        if (this._inRect(pt, this.hitTargets.scrollDown)) return 'scroll-down';
        if (this._inRect(pt, this.hitTargets.latestPill)) return 'latest-pill';
        for (let i = 0; i < this.hitTargets.chips.length; i++) {
            if (this._inRect(pt, this.hitTargets.chips[i])) {
                return `chip:${i}`;
            }
        }
        return null;
    }

    /** Returns desired CSS cursor and updates subtle hover highlight when moving across laptop screen. */
    getHoverCursor(uv) {
        if (!this.isChatOpen) return 'pointer';
        const pt = this.uvToCanvas(uv);
        const hit = this._hitTest(pt);
        if (hit !== this.hoverId) {
            this.hoverId = hit;
            this.markDirty();
        }
        if (hit === 'input') return 'text';
        if (hit) return 'pointer';
        return 'default';
    }

    clearHover() {
        if (this.hoverId !== null) {
            this.hoverId = null;
            this.markDirty();
        }
    }

    /** Handles a click inside the 3D laptop display; returns next action hint for ScrollController. */
    handleCanvasClick(uv) {
        if (!this.isChatOpen) return 'open';
        const pt = this.uvToCanvas(uv);
        const hit = this._hitTest(pt);

        if (hit === 'input') {
            return 'focus-input';
        }
        if (hit === 'send') {
            screenSync.emit('chat:submit');
            return 'focus-input';
        }
        if (hit && hit.startsWith('chip:')) {
            const idx = parseInt(hit.slice(5), 10);
            const chip = QUICK_CHIPS[idx];
            if (chip && !this.isThinking) {
                screenSync.emit('chat:send', { text: chip.q });
            }
            return 'focus-input';
        }
        if (hit === 'scroll-up') {
            this.scrollBy(220);
            return 'scrolled';
        }
        if (hit === 'scroll-down') {
            this.scrollBy(-220);
            return 'scrolled';
        }
        if (hit === 'latest-pill') {
            this.chatScrollOffset = 0;
            this.markDirty();
            this.render();
            return 'scrolled';
        }
        if (this._inRect(pt, this.hitTargets.windowBox)) {
            return 'focus-input';
        }
        return 'focus-input';
    }

    scrollBy(deltaUpPx) {
        if (this._maxScroll <= 0) return;
        const next = THREE.MathUtils.clamp(this.chatScrollOffset + deltaUpPx, 0, this._maxScroll);
        if (next !== this.chatScrollOffset) {
            this.chatScrollOffset = next;
            this.markDirty();
            this.render();
        }
    }

    update() {
        if (this.isPaused) return;
        const now = performance.now();
        const elapsed = now - this.lastFrameTime;
        if (elapsed < this.fpsInterval) return;
        this.lastFrameTime = now - (elapsed % this.fpsInterval);

        // Advance typewriter reveal for the latest assistant message
        if (this.isChatOpen && this.messages.length > 0) {
            const last = this.messages[this.messages.length - 1];
            const fullLen = last.text.length;
            if (last.role === 'assistant' && this.displayedCharIndex < fullLen) {
                if (now - this.lastTypeTime >= this.typeSpeed) {
                    this.displayedCharIndex = Math.min(fullLen, this.displayedCharIndex + 8);
                    this.lastTypeTime = now;
                    this.needsRender = true;
                }
            }
        }

        // Blink input cursor or thinking pulse when chat is open
        if (this.isChatOpen && now - this.lastBlinkTime > 520) {
            this.cursorBlink = !this.cursorBlink;
            this.lastBlinkTime = now;
            if (this.isInputFocused || this.isThinking) {
                this.needsRender = true;
            }
        }

        // Refresh menu bar clock only when displayed minute changes
        const nowDate = new Date();
        const minuteStamp = `${nowDate.getHours()}:${nowDate.getMinutes()}`;
        if (minuteStamp !== this.lastClockText) {
            this.lastClockText = minuteStamp;
            this.needsRender = true;
        }

        if (this.needsRender) {
            this.needsRender = false;
            this.render();
        }
    }

    render() {
        const ctx = this.ctx;
        const W = this.width;
        const H = this.height;

        if (!this.isChatOpen && this.wallpaperLoaded) {
            ctx.drawImage(this.wallpaper, 0, 0, W, H);
        } else {
            ctx.fillStyle = '#070a12';
            ctx.fillRect(0, 0, W, H);
        }

        this._drawMenuBar(ctx, W);

        if (this.isChatOpen) {
            this._drawChatScreen(ctx, W, H);
        } else {
            this._drawIdleScreen(ctx, W, H);
        }

        this.texture.needsUpdate = true;
    }

    _drawMenuBar(ctx, W) {
        const H = 32;
        ctx.fillStyle = 'rgba(10, 12, 20, 0.94)';
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.10)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, H);
        ctx.lineTo(W, H);
        ctx.stroke();

        ctx.font = `600 13px ${BODY_FONT}`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.90)';
        const menus = ['◆', 'Finder', 'File', 'Edit', 'View', 'Go', 'Window', 'Help'];
        let x = 18;
        menus.forEach((m) => {
            ctx.fillText(m, x, 21);
            x += ctx.measureText(m).width + 18;
        });

        const now = new Date();
        const t = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const d = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
        ctx.font = `500 13px ${MONO_FONT}`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
        ctx.textAlign = 'right';
        ctx.fillText(`⚡ 100%   📶   ${d}   ${t}`, W - 18, 21);
        ctx.textAlign = 'left';
    }

    _drawIdleScreen(ctx, W, H) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
        ctx.fillRect(0, 32, W, H - 32);

        const cx = W / 2;
        const cy = H / 2;
        const pw = 560;
        const ph = 290;
        const px = cx - pw / 2;
        const py = cy - ph / 2;

        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
        ctx.shadowBlur = 32;
        ctx.shadowOffsetY = 12;
        ctx.fillStyle = 'rgba(10, 13, 24, 0.90)';
        ctx.beginPath();
        ctx.roundRect(px, py, pw, ph, 18);
        ctx.fill();
        ctx.restore();

        ctx.strokeStyle = 'rgba(224, 82, 156, 0.48)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#e0529c';
        ctx.fillRect(px + 28, py, 96, 3);

        ctx.fillStyle = 'rgba(224, 82, 156, 0.18)';
        ctx.beginPath();
        ctx.roundRect(px + 28, py + 24, 210, 28, 14);
        ctx.fill();
        ctx.fillStyle = '#e0529c';
        ctx.beginPath();
        ctx.arc(px + 44, py + 38, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = `700 13px ${MONO_FONT}`;
        ctx.fillStyle = '#e0529c';
        ctx.fillText('RUTVIK AI ASSISTANT', px + 58, py + 43);

        ctx.font = `700 26px ${BODY_FONT}`;
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Chat with Rutvik AI', px + 28, py + 104);

        ctx.font = `400 17px ${BODY_FONT}`;
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText("Ask about Rutvik's projects, skills, work experience,", px + 28, py + 142);
        ctx.fillText('education, and contact info — right here on the laptop.', px + 28, py + 168);

        ctx.fillStyle = 'rgba(224, 82, 156, 0.24)';
        ctx.beginPath();
        ctx.roundRect(px + 28, py + 210, 285, 48, 24);
        ctx.fill();
        ctx.strokeStyle = '#e0529c';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.font = `600 17px ${BODY_FONT}`;
        ctx.fillStyle = '#ffffff';
        ctx.fillText('💬  Click Laptop to Chat', px + 56, py + 240);
    }

    _drawChatScreen(ctx, W, H) {
        const MENU_H = 32;
        const PAD = 18;
        const HDR_H = 60;
        const CHIPS_H = 44;
        const FOOT_H = 72;

        const winX = PAD;
        const winY = MENU_H + 8;
        const winW = W - PAD * 2;
        const winH = H - winY - 14;
        this.hitTargets.windowBox = { x: winX, y: winY, w: winW, h: winH };

        // Outer glass window
        ctx.fillStyle = 'rgba(9, 13, 24, 0.98)';
        ctx.beginPath();
        ctx.roundRect(winX, winY, winW, winH, 16);
        ctx.fill();
        ctx.strokeStyle = 'rgba(224, 82, 156, 0.36)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // ── Header ──────────────────────────────────────────────────────────
        ctx.fillStyle = 'rgba(15, 20, 36, 1.0)';
        ctx.beginPath();
        ctx.roundRect(winX, winY, winW, HDR_H, [16, 16, 0, 0]);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(winX, winY + HDR_H);
        ctx.lineTo(winX + winW, winY + HDR_H);
        ctx.stroke();

        const dotY = winY + HDR_H / 2;
        [[winX + 26, '#ef4444'], [winX + 48, '#f59e0b'], [winX + 70, '#10b981']].forEach(([dx, c]) => {
            ctx.fillStyle = c;
            ctx.beginPath();
            ctx.arc(dx, dotY, 7, 0, Math.PI * 2);
            ctx.fill();
        });

        // Avatar badge
        ctx.fillStyle = '#e0529c';
        ctx.beginPath();
        ctx.arc(winX + 108, dotY, 17, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = `18px ${BODY_FONT}`;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('🤖', winX + 108, dotY + 6);
        ctx.textAlign = 'left';

        ctx.font = `700 20px ${BODY_FONT}`;
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Rutvik AI Assistant', winX + 136, dotY - 2);
        ctx.font = `500 13px ${MONO_FONT}`;
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Projects  •  Experience  •  Skills  •  Education  •  Contact', winX + 136, dotY + 17);

        // ── Message Viewport Layout ─────────────────────────────────────────
        const footY = winY + winH - FOOT_H;
        const chipsY = footY - CHIPS_H;
        const msgTop = winY + HDR_H + 4;
        const msgBot = chipsY - 4;
        const msgH = msgBot - msgTop;

        // Render and measure all message blocks
        const items = this._buildItems(ctx, winW);
        const padV = 16;
        let totalH = padV;
        items.forEach((it) => {
            totalH += it.h + 16;
        });
        if (this.isThinking) {
            totalH += 56 + 16;
        }
        totalH += padV;

        // Keep reading anchor steady if new content grows while user is scrolled up reading older Q&A
        if (this.chatScrollOffset > 0 && this._prevTotalH > 0 && totalH > this._prevTotalH) {
            this.chatScrollOffset += totalH - this._prevTotalH;
        }
        this._prevTotalH = totalH;

        const maxScroll = Math.max(0, totalH - msgH);
        this._maxScroll = maxScroll;
        this.chatScrollOffset = THREE.MathUtils.clamp(this.chatScrollOffset, 0, maxScroll);

        // Header scroll buttons (placed after maxScroll is known so enabled/disabled state renders accurately)
        this._drawHeaderScrollControls(ctx, winX, winW, dotY, maxScroll);

        // Top-anchored when content fits; bottom-pinned by default when scrollable (scroll UP increases offset)
        const drawStartY = totalH <= msgH ? msgTop : msgTop - (maxScroll - this.chatScrollOffset);

        ctx.save();
        ctx.beginPath();
        ctx.rect(winX + 4, msgTop, winW - 8, msgH);
        ctx.clip();

        let curY = drawStartY + padV;
        const rightMargin = maxScroll > 0 ? 28 : 20;

        items.forEach((item) => {
            const by = curY;
            curY += item.h + 16;

            if (by + item.h < msgTop || by > msgBot) return;

            const bx = item.isUser
                ? winX + winW - rightMargin - item.boxW
                : winX + 20;

            if (item.isUser) {
                const grad = ctx.createLinearGradient(bx, by, bx + item.boxW, by + item.h);
                grad.addColorStop(0, 'rgba(30, 88, 138, 0.92)');
                grad.addColorStop(1, 'rgba(17, 56, 98, 0.96)');
                ctx.fillStyle = grad;
            } else {
                ctx.fillStyle = 'rgba(18, 25, 44, 0.97)';
            }

            ctx.beginPath();
            ctx.roundRect(bx, by, item.boxW, item.h, 14);
            ctx.fill();

            ctx.strokeStyle = item.isUser ? 'rgba(56, 189, 248, 0.55)' : 'rgba(224, 82, 156, 0.42)';
            ctx.lineWidth = 1.25;
            ctx.stroke();

            // Sender badge
            ctx.font = `700 13px ${MONO_FONT}`;
            ctx.fillStyle = item.isUser ? '#38bdf8' : '#e0529c';
            ctx.fillText(item.isUser ? '▶  YOU' : '🤖  RUTVIK AI', bx + 20, by + 24);

            // Rich formatted lines
            let lineY = by + 54;
            item.lines.forEach((row) => {
                if (row.type === 'spacer') {
                    lineY += 12;
                    return;
                }
                if (lineY > msgTop - 30 && lineY < msgBot + 30) {
                    this._drawRichRow(ctx, row, bx + 20, lineY, item.isUser);
                }
                lineY += row.height;
            });
        });

        // Thinking indicator below newest message
        if (this.isThinking) {
            const tbx = winX + 20;
            const tby = curY;
            if (tby < msgBot) {
                const dots = '.'.repeat(1 + (Math.floor(performance.now() / 320) % 3));
                ctx.fillStyle = 'rgba(18, 25, 44, 0.96)';
                ctx.beginPath();
                ctx.roundRect(tbx, tby, 340, 52, 14);
                ctx.fill();
                ctx.strokeStyle = 'rgba(224, 82, 156, 0.45)';
                ctx.lineWidth = 1.25;
                ctx.stroke();
                ctx.font = `600 18px ${BODY_FONT}`;
                ctx.fillStyle = '#f472b6';
                ctx.fillText(`⚡ Rutvik AI is thinking${dots}`, tbx + 20, tby + 33);
            }
        }

        // Scrollbar & "Jump to latest" pill
        this.hitTargets.latestPill = null;
        if (maxScroll > 0) {
            const trackX = winX + winW - 15;
            const trackY = msgTop + 8;
            const trackH = msgH - 16;
            const thumbH = Math.max(44, trackH * (msgH / totalH));
            const scrollPct = this.chatScrollOffset / maxScroll;
            const thumbY = trackY + (trackH - thumbH) * (1 - scrollPct);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.beginPath();
            ctx.roundRect(trackX, trackY, 7, trackH, 4);
            ctx.fill();

            ctx.fillStyle = this.chatScrollOffset > 5 ? 'rgba(224, 82, 156, 0.85)' : 'rgba(255, 255, 255, 0.30)';
            ctx.beginPath();
            ctx.roundRect(trackX, thumbY, 7, thumbH, 4);
            ctx.fill();

            if (this.chatScrollOffset > 35) {
                const pw = 236;
                const ph = 34;
                const px = winX + (winW - pw) / 2;
                const py = msgBot - ph - 8;
                const isHover = this.hoverId === 'latest-pill';
                this.hitTargets.latestPill = { x: px, y: py, w: pw, h: ph };

                ctx.fillStyle = isHover ? 'rgba(224, 82, 156, 0.92)' : 'rgba(15, 23, 42, 0.94)';
                ctx.beginPath();
                ctx.roundRect(px, py, pw, ph, 17);
                ctx.fill();
                ctx.strokeStyle = isHover ? '#ffffff' : 'rgba(56, 189, 248, 0.65)';
                ctx.lineWidth = 1.25;
                ctx.stroke();

                ctx.font = `600 14px ${BODY_FONT}`;
                ctx.fillStyle = isHover ? '#ffffff' : '#7dd3fc';
                ctx.textAlign = 'center';
                ctx.fillText('↓ Jump to latest message', px + pw / 2, py + 22);
                ctx.textAlign = 'left';
            }
        }

        ctx.restore();

        // ── Quick-Ask Chips Row (Clickable Inside Screen) ───────────────────
        this._drawChipsRow(ctx, winX, winW, chipsY, CHIPS_H);

        // ── Interactive Footer Input + Send Button ──────────────────────────
        this._drawInputFooter(ctx, winX, winW, footY, FOOT_H);
    }

    _drawHeaderScrollControls(ctx, winX, winW, dotY, maxScroll) {
        const canUp = maxScroll > 0 && this.chatScrollOffset < maxScroll - 2;
        const canDown = maxScroll > 0 && this.chatScrollOffset > 2;

        const btnW = 92;
        const btnH = 34;
        const btnY = dotY - btnH / 2;
        const downX = winX + winW - 18 - btnW;
        const upX = downX - 10 - btnW;

        this.hitTargets.scrollUp = canUp ? { x: upX, y: btnY, w: btnW, h: btnH } : null;
        this.hitTargets.scrollDown = canDown ? { x: downX, y: btnY, w: btnW, h: btnH } : null;

        [
            { x: upX, label: '▲ Older', enabled: canUp, hover: this.hoverId === 'scroll-up' },
            { x: downX, label: '▼ Newer', enabled: canDown, hover: this.hoverId === 'scroll-down' }
        ].forEach((b) => {
            ctx.fillStyle = b.hover
                ? 'rgba(224, 82, 156, 0.28)'
                : b.enabled
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(255, 255, 255, 0.03)';
            ctx.beginPath();
            ctx.roundRect(b.x, btnY, btnW, btnH, 10);
            ctx.fill();

            ctx.strokeStyle = b.hover
                ? '#e0529c'
                : b.enabled
                    ? 'rgba(255, 255, 255, 0.18)'
                    : 'rgba(255, 255, 255, 0.06)';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.font = `600 13px ${BODY_FONT}`;
            ctx.fillStyle = b.enabled ? '#f8fafc' : 'rgba(255, 255, 255, 0.25)';
            ctx.textAlign = 'center';
            ctx.fillText(b.label, b.x + btnW / 2, btnY + 22);
            ctx.textAlign = 'left';
        });
    }

    _drawChipsRow(ctx, winX, winW, chipsY, chipsH) {
        ctx.fillStyle = 'rgba(11, 15, 28, 0.96)';
        ctx.fillRect(winX + 1, chipsY, winW - 2, chipsH);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(winX, chipsY);
        ctx.lineTo(winX + winW, chipsY);
        ctx.stroke();

        ctx.font = `600 15px ${BODY_FONT}`;
        const gap = 10;
        const padX = 28;
        const chipWidths = QUICK_CHIPS.map((c) => Math.ceil(ctx.measureText(c.label).width) + padX);
        const totalRowW = chipWidths.reduce((a, b) => a + b, 0) + gap * (QUICK_CHIPS.length - 1);

        let cx = winX + Math.max(18, (winW - totalRowW) / 2);
        const cy = chipsY + 6;
        const ch = 32;

        this.hitTargets.chips = [];
        QUICK_CHIPS.forEach((chip, idx) => {
            const cw = chipWidths[idx];
            const isHover = this.hoverId === `chip:${idx}`;
            const rect = { x: cx, y: cy, w: cw, h: ch };
            this.hitTargets.chips.push(rect);

            ctx.fillStyle = isHover ? 'rgba(224, 82, 156, 0.28)' : 'rgba(255, 255, 255, 0.06)';
            ctx.beginPath();
            ctx.roundRect(cx, cy, cw, ch, 16);
            ctx.fill();

            ctx.strokeStyle = isHover ? '#e0529c' : 'rgba(224, 82, 156, 0.36)';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.font = `600 15px ${BODY_FONT}`;
            ctx.fillStyle = isHover ? '#ffffff' : '#e2e8f0';
            ctx.textAlign = 'center';
            ctx.fillText(chip.label, cx + cw / 2, cy + 21);
            ctx.textAlign = 'left';

            cx += cw + gap;
        });
    }

    _drawInputFooter(ctx, winX, winW, footY, footH) {
        ctx.fillStyle = 'rgba(13, 18, 34, 0.99)';
        ctx.beginPath();
        ctx.roundRect(winX, footY, winW, footH, [0, 0, 16, 16]);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.10)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(winX, footY);
        ctx.lineTo(winX + winW, footY);
        ctx.stroke();

        const sendW = 138;
        const pillH = 48;
        const pillY = footY + (footH - pillH) / 2;
        const pillX = winX + 18;
        const pillW = winW - 36 - sendW - 14;
        const sendX = pillX + pillW + 14;

        this.hitTargets.input = { x: pillX, y: pillY, w: pillW, h: pillH };
        this.hitTargets.send = { x: sendX, y: pillY, w: sendW, h: pillH };

        // Input box background + focus glow
        ctx.save();
        if (this.isInputFocused) {
            ctx.shadowColor = 'rgba(224, 82, 156, 0.40)';
            ctx.shadowBlur = 14;
        }
        ctx.fillStyle = this.isInputFocused ? 'rgba(22, 29, 52, 0.95)' : 'rgba(255, 255, 255, 0.07)';
        ctx.beginPath();
        ctx.roundRect(pillX, pillY, pillW, pillH, 24);
        ctx.fill();
        ctx.restore();

        ctx.strokeStyle = this.isInputFocused
            ? '#e0529c'
            : this.hoverId === 'input'
                ? 'rgba(224, 82, 156, 0.72)'
                : 'rgba(224, 82, 156, 0.42)';
        ctx.lineWidth = this.isInputFocused ? 2 : 1.5;
        ctx.stroke();

        // Live typed text or placeholder + blinking caret inside input box
        const innerLeft = pillX + 24;
        const innerMaxW = pillW - 44;
        const textBaselineY = pillY + 31;

        ctx.save();
        ctx.beginPath();
        ctx.rect(innerLeft - 2, pillY + 2, innerMaxW + 4, pillH - 4);
        ctx.clip();

        ctx.font = `500 20px ${BODY_FONT}`;
        if (this.inputText.length > 0) {
            ctx.fillStyle = '#ffffff';
            const fullW = ctx.measureText(this.inputText).width;
            const drawX = fullW > innerMaxW - 8 ? innerLeft + (innerMaxW - 8 - fullW) : innerLeft;
            ctx.fillText(this.inputText, drawX, textBaselineY);

            if (this.isInputFocused && this.cursorBlink) {
                ctx.fillStyle = '#e0529c';
                ctx.fillRect(drawX + fullW + 3, pillY + 12, 2.5, 24);
            }
        } else {
            if (this.isInputFocused && this.cursorBlink) {
                ctx.fillStyle = '#e0529c';
                ctx.fillRect(innerLeft, pillY + 12, 2.5, 24);
            }
            ctx.fillStyle = this.isInputFocused ? 'rgba(255, 255, 255, 0.48)' : 'rgba(255, 255, 255, 0.40)';
            const placeholder = this.isInputFocused
                ? 'Type your question & press Enter...'
                : 'Click here to write your question...';
            ctx.fillText(placeholder, innerLeft + 10, textBaselineY);
        }
        ctx.restore();

        // Send button
        const sendHovered = this.hoverId === 'send';
        const sendGrad = ctx.createLinearGradient(sendX, pillY, sendX + sendW, pillY + pillH);
        sendGrad.addColorStop(0, sendHovered ? '#f472b6' : '#e0529c');
        sendGrad.addColorStop(1, sendHovered ? '#e879f9' : '#c026d3');
        ctx.fillStyle = sendGrad;
        ctx.beginPath();
        ctx.roundRect(sendX, pillY, sendW, pillH, 24);
        ctx.fill();

        if (sendHovered) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        ctx.font = `700 18px ${BODY_FONT}`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(this.isThinking ? 'Wait...' : 'Send ➤', sendX + sendW / 2, pillY + 30);
        ctx.textAlign = 'left';
    }

    // ── Rich Text Parsing & Measurement ─────────────────────────────────────
    _buildItems(ctx, winW) {
        const items = [];
        const maxUserW = Math.min(820, winW - 140);
        const maxAssistantW = Math.min(1040, winW - 88);

        this.messages.forEach((msg, idx) => {
            const isUser = msg.role === 'user';
            const isLastAI = !isUser && idx === this.messages.length - 1;

            let rawText = msg.text || '';
            if (isLastAI && this.displayedCharIndex < rawText.length) {
                rawText = rawText.substring(0, this.displayedCharIndex);
            }

            const maxBubbleW = isUser ? maxUserW : maxAssistantW;
            const minBubbleW = isUser ? 260 : 420;
            const { rows, maxLineWidth } = this._layoutRichMessage(ctx, rawText, maxBubbleW - 44);

            const boxW = Math.max(minBubbleW, Math.min(maxBubbleW, Math.ceil(maxLineWidth) + 46));
            let contentH = 0;
            rows.forEach((r) => {
                contentH += r.type === 'spacer' ? 12 : r.height;
            });

            // Header badge baseline + message rows + bottom padding
            const h = 38 + Math.max(28, contentH) + 18;
            items.push({ isUser, lines: rows, boxW, h });
        });

        return items;
    }

    _layoutRichMessage(ctx, rawText, maxW) {
        const cleaned = (rawText || '')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/?[^>]+(>|$)/g, '');

        const rawLines = cleaned.split('\n');
        const rows = [];
        let maxLineWidth = 0;

        for (let i = 0; i < rawLines.length; i++) {
            const trimmed = rawLines[i].trim();

            if (!trimmed) {
                if (rows.length > 0 && rows[rows.length - 1].type !== 'spacer') {
                    rows.push({ type: 'spacer', height: 12 });
                }
                continue;
            }

            // Skip markdown table divider rows and normalize any pipe table row cleanly
            if (/^\|[-:\s|]+\|$/.test(trimmed)) continue;

            let kind = 'para';
            let marker = '';
            let body = trimmed;

            if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
                const cells = trimmed.split('|').map((c) => c.trim()).filter(Boolean);
                body = cells.length >= 2 ? `**${cells[0]}:** ${cells.slice(1).join(' • ')}` : (cells[0] || '');
                kind = 'bullet';
                marker = '•';
            } else {
                const hMatch = trimmed.match(/^#{1,6}\s+(.*)$/);
                const bMatch = trimmed.match(/^(?:[-*•])\s+(.*)$/);
                const nMatch = trimmed.match(/^(\d+[.)])\s+(.*)$/);

                if (hMatch) {
                    kind = 'heading';
                    body = hMatch[1];
                } else if (bMatch) {
                    kind = 'bullet';
                    marker = '•';
                    body = bMatch[1];
                } else if (nMatch) {
                    kind = 'bullet';
                    marker = nMatch[1];
                    body = nMatch[2];
                }
            }

            const indentX = kind === 'bullet' ? 24 : 0;
            const availW = Math.max(120, maxW - indentX);
            const runs = this._parseInlineRuns(body);
            const wrappedLines = this._wrapStyledRuns(ctx, runs, availW, kind === 'heading');

            wrappedLines.forEach((segments, lineIdx) => {
                const w = segments.reduce((sum, seg) => sum + seg.width, 0) + indentX;
                if (w > maxLineWidth) maxLineWidth = w;

                rows.push({
                    type: kind,
                    marker: lineIdx === 0 ? marker : '',
                    indentX,
                    segments,
                    height: kind === 'heading' ? 32 : 28
                });
            });
        }

        while (rows.length > 0 && rows[rows.length - 1].type === 'spacer') {
            rows.pop();
        }

        if (rows.length === 0) {
            rows.push({ type: 'para', marker: '', indentX: 0, segments: [], height: 28 });
        }

        return { rows, maxLineWidth };
    }

    _parseInlineRuns(str) {
        const cleanLinks = str.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
        const runs = [];
        const pattern = /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*]+\*)/g;
        let lastIdx = 0;
        let m;

        while ((m = pattern.exec(cleanLinks)) !== null) {
            if (m.index > lastIdx) {
                runs.push({ text: cleanLinks.slice(lastIdx, m.index), style: 'normal' });
            }
            const token = m[0];
            if (token.startsWith('**') || token.startsWith('__')) {
                runs.push({ text: token.slice(2, -2), style: 'bold' });
            } else if (token.startsWith('`')) {
                runs.push({ text: token.slice(1, -1), style: 'code' });
            } else if (token.startsWith('*')) {
                runs.push({ text: token.slice(1, -1), style: 'bold' });
            }
            lastIdx = pattern.lastIndex;
        }

        if (lastIdx < cleanLinks.length) {
            runs.push({ text: cleanLinks.slice(lastIdx), style: 'normal' });
        }
        return runs;
    }

    _setStyleFont(ctx, style, isHeading) {
        if (isHeading) {
            ctx.font = `700 21px ${BODY_FONT}`;
            return;
        }
        if (style === 'bold') {
            ctx.font = `700 20px ${BODY_FONT}`;
        } else if (style === 'code') {
            ctx.font = `600 18px ${MONO_FONT}`;
        } else {
            ctx.font = `400 20px ${BODY_FONT}`;
        }
    }

    _wrapStyledRuns(ctx, runs, maxW, isHeading) {
        // Tokenize into words & whitespace while preserving style
        const tokens = [];
        runs.forEach((run) => {
            const parts = run.text.split(/(\s+)/);
            parts.forEach((part) => {
                if (part.length > 0) {
                    tokens.push({ text: part, style: run.style, isSpace: /^\s+$/.test(part) });
                }
            });
        });

        const lines = [];
        let curLine = [];
        let curW = 0;

        tokens.forEach((tok) => {
            if (tok.isSpace && curLine.length === 0) return;

            this._setStyleFont(ctx, tok.style, isHeading);
            const w = ctx.measureText(tok.text).width;

            // Break overlong unspaced tokens (URLs, emails, paths) cleanly at character boundary
            if (!tok.isSpace && w > maxW) {
                if (curLine.length > 0) {
                    while (curLine.length > 0 && curLine[curLine.length - 1].isSpace) curLine.pop();
                    lines.push(curLine);
                    curLine = [];
                    curW = 0;
                }
                let chunk = '';
                for (let ci = 0; ci < tok.text.length; ci++) {
                    const nextChunk = chunk + tok.text[ci];
                    if (ctx.measureText(nextChunk).width > maxW && chunk.length > 0) {
                        const cw = ctx.measureText(chunk).width;
                        lines.push([{ text: chunk, style: tok.style, isSpace: false, width: cw }]);
                        chunk = tok.text[ci];
                    } else {
                        chunk = nextChunk;
                    }
                }
                if (chunk.length > 0) {
                    curW = ctx.measureText(chunk).width;
                    curLine.push({ text: chunk, style: tok.style, isSpace: false, width: curW });
                }
                return;
            }

            if (!tok.isSpace && curW + w > maxW && curLine.length > 0) {
                while (curLine.length > 0 && curLine[curLine.length - 1].isSpace) {
                    curLine.pop();
                }
                lines.push(curLine);
                curLine = [];
                curW = 0;
            }

            if (tok.isSpace && curLine.length === 0) return;
            curLine.push({ text: tok.text, style: tok.style, isSpace: tok.isSpace, width: w });
            curW += w;
        });

        while (curLine.length > 0 && curLine[curLine.length - 1].isSpace) {
            curLine.pop();
        }
        if (curLine.length > 0 || lines.length === 0) {
            lines.push(curLine);
        }

        return lines;
    }

    _drawRichRow(ctx, row, startX, baselineY, isUser) {
        const isHeading = row.type === 'heading';
        if (row.marker) {
            ctx.font = `700 20px ${BODY_FONT}`;
            ctx.fillStyle = row.marker === '•' ? '#e0529c' : '#38bdf8';
            ctx.fillText(row.marker, startX, baselineY);
        }

        let x = startX + row.indentX;
        row.segments.forEach((seg) => {
            if (!seg.text) return;
            if (seg.style === 'code' && !isHeading) {
                ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';
                ctx.beginPath();
                ctx.roundRect(x - 2, baselineY - 19, seg.width + 4, 24, 5);
                ctx.fill();
            }
            this._setStyleFont(ctx, seg.style, isHeading);
            if (isHeading) {
                ctx.fillStyle = '#f9a8d4';
            } else if (seg.style === 'code') {
                ctx.fillStyle = '#38bdf8';
            } else if (seg.style === 'bold') {
                ctx.fillStyle = '#ffffff';
            } else {
                ctx.fillStyle = isUser ? '#e0f2fe' : '#e2e8f0';
            }
            ctx.fillText(seg.text, x, baselineY);
            x += seg.width;
        });
    }

    destroy() {
        if (this.mesh) this.scene.remove(this.mesh);
        if (this.material) this.material.dispose();
        if (this.texture) this.texture.dispose();
    }
}
