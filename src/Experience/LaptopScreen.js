import * as THREE from 'three';
import Experience from './Experience.js';
import screenSync from './ScreenSync.js';

/**
 * LaptopScreen — renders the MacBook display as a full 3D canvas texture.
 *
 * Layout (always visible on the laptop):
 *   ┌─────────────────────────────────────────┐
 *   │  macOS Menu Bar (28px)                  │
 *   ├─────────────────────────────────────────┤
 *   │  Wallpaper / Idle Card  OR              │
 *   │  Chat Message Scroll Area (fills space) │
 *   │  ...scrolls upward as replies come in.. │
 *   ├─────────────────────────────────────────┤
 *   │  Bottom Input Bar Mockup  (40px)        │
 *   └─────────────────────────────────────────┘
 *
 * The bottom input bar is cosmetic only — real input comes from the
 * floating HTML #laptop-chat-bar overlay. That overlay's submit fires
 * screenSync 'chat:message' events which update this canvas.
 */
export default class LaptopScreen {
    constructor(mesh) {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.time = this.experience.time;
        this.mesh = mesh;

        // Motion preference
        this.prefersReducedMotion =
            window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Canvas — high-res for crisp text on the 3D mesh
        this.width = 1280;
        this.height = 720;
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d');

        // Wallpaper
        this.wallpaper = new Image();
        this.wallpaperLoaded = false;
        this.wallpaper.onload = () => {
            this.wallpaperLoaded = true;
            this.render();
        };
        this.wallpaper.onerror = () => {
            console.warn('laptopWallpaper.jpg failed to load — using dark fallback.');
        };
        this.wallpaper.src = '/assets/laptopWallpaper.jpg';

        // Three.js texture → material → mesh
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

        // ── Chat State ────────────────────────────────────────────────────────
        this.isChatOpen = false;
        this.isThinking = false;

        // Full message history (kept, never truncated — renders only visible slice)
        this.messages = [
            {
                role: 'assistant',
                text: "Hi! I'm Rutvik's AI — ask me anything about his projects, skills, experience, or how to reach him."
            }
        ];

        // Manual scroll: user can "scroll up" via the overlay scroll wheel or touch
        // scrollTop = 0 means view is at the bottom (newest message visible)
        // scrollTop > 0 means user has scrolled up by that many pixels
        this.chatScrollTop = 0;

        // Typing animation for the latest assistant reply
        this.displayedCharIndex = 0;
        this.lastTypeTime = 0;
        this.typeSpeed = 12; // ms per char

        // FPS throttle
        this.isPaused = false;
        this.lastFrameTime = 0;
        this.targetFps = 30;
        this.fpsInterval = 1000 / this.targetFps;

        this.initEventListeners();
        this.render();
    }

    // ── Event Listeners ────────────────────────────────────────────────────────
    initEventListeners() {
        document.addEventListener('visibilitychange', () => {
            this.isPaused = document.hidden;
        });

        screenSync.on('chat:open', () => {
            this.isChatOpen = true;
            this.chatScrollTop = 0; // snap to bottom on open
            this.render();
        });

        screenSync.on('chat:message', (data) => {
            this.isChatOpen = true;
            if (data.role === 'user') {
                this.messages.push({ role: 'user', text: data.content });
                this.isThinking = true;
                this.chatScrollTop = 0; // scroll to bottom for new user msg
            } else if (data.role === 'assistant') {
                this.isThinking = false;
                this.messages.push({ role: 'assistant', text: data.content });
                this.displayedCharIndex = 0;
                this.chatScrollTop = 0; // scroll to bottom when reply arrives
            }
            this.render();
        });

        screenSync.on('chat:close', () => {
            this.isChatOpen = false;
            this.render();
        });

        // Scroll wheel on the 3D canvas element — allow reading older messages
        const expEl = document.querySelector('.experience');
        if (expEl) {
            expEl.addEventListener('wheel', (e) => {
                if (this.isChatOpen) {
                    // scrollTop increases = scroll up (read older)
                    this.chatScrollTop = Math.max(0, this.chatScrollTop + e.deltaY * 0.5);
                    this.render();
                }
            }, { passive: true });
        }
    }

    // ── Update loop (called every frame by World.js) ───────────────────────────
    update() {
        if (this.isPaused) return;

        const now = performance.now();
        const elapsed = now - this.lastFrameTime;
        if (elapsed < this.fpsInterval) return;
        this.lastFrameTime = now - (elapsed % this.fpsInterval);

        // Typewriter animation for latest assistant message
        if (this.messages.length > 0) {
            const lastMsg = this.messages[this.messages.length - 1];
            if (lastMsg.role === 'assistant' && this.displayedCharIndex < lastMsg.text.length) {
                if (now - this.lastTypeTime > this.typeSpeed) {
                    this.displayedCharIndex += 4;
                    this.lastTypeTime = now;
                    this.render();
                    return;
                }
            }
        }

        this.render();
    }

    // ── Main render ────────────────────────────────────────────────────────────
    render() {
        const ctx = this.ctx;
        const W = this.width;
        const H = this.height;

        // 1. Wallpaper or fallback
        if (this.wallpaperLoaded) {
            ctx.drawImage(this.wallpaper, 0, 0, W, H);
        } else {
            const grad = ctx.createLinearGradient(0, 0, W, H);
            grad.addColorStop(0, '#0d0612');
            grad.addColorStop(1, '#050309');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);
        }

        // 2. macOS-style menu bar (always on top)
        this.renderMenuBar(ctx, W);

        // 3. If chat is open → full-screen chat; otherwise idle card
        if (this.isChatOpen) {
            this.renderChatScreen(ctx, W, H);
        } else {
            this.renderIdleScreen(ctx, W, H);
        }

        this.texture.needsUpdate = true;
    }

    // ── macOS menu bar ─────────────────────────────────────────────────────────
    renderMenuBar(ctx, W) {
        const barH = 28;

        ctx.fillStyle = 'rgba(8, 10, 16, 0.80)';
        ctx.fillRect(0, 0, W, barH);

        ctx.strokeStyle = 'rgba(255,255,255,0.10)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, barH);
        ctx.lineTo(W, barH);
        ctx.stroke();

        // Apple  + menu items
        ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('\uF8FF', 18, 18);

        ctx.font = '500 11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        const menus = ['Finder', 'File', 'Edit', 'View', 'Go', 'Window', 'Help'];
        let mX = 42;
        menus.forEach(m => {
            ctx.fillText(m, mX, 18);
            mX += ctx.measureText(m).width + 16;
        });

        // Right-side clock
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateStr = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

        ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.80)';
        ctx.textAlign = 'right';
        ctx.fillText(`⚡ 100%  \uD83D\uDCF6 Wi-Fi  ${dateStr}  ${timeStr}`, W - 14, 18);
        ctx.textAlign = 'left';
    }

    // ── Idle / wallpaper screen ────────────────────────────────────────────────
    renderIdleScreen(ctx, W, H) {
        // Dark overlay so the card is readable over the wallpaper
        ctx.fillStyle = 'rgba(0,0,0,0.30)';
        ctx.fillRect(0, 28, W, H - 28);

        const px = 80;
        const py = 120;
        const pw = 480;
        const ph = 260;

        // Card shadow
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.65)';
        ctx.shadowBlur = 28;
        ctx.shadowOffsetY = 10;

        ctx.fillStyle = 'rgba(10,12,22,0.86)';
        ctx.beginPath();
        ctx.roundRect(px, py, pw, ph, 16);
        ctx.fill();
        ctx.restore();

        // Card border
        ctx.strokeStyle = 'rgba(224,82,156,0.42)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Top accent line
        ctx.fillStyle = '#e0529c';
        ctx.fillRect(px + 24, py, 72, 2.5);

        // Badge
        ctx.fillStyle = 'rgba(224,82,156,0.18)';
        ctx.beginPath();
        ctx.roundRect(px + 24, py + 20, 170, 24, 12);
        ctx.fill();

        ctx.fillStyle = '#e0529c';
        ctx.beginPath();
        ctx.arc(px + 38, py + 32, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#e0529c';
        ctx.fillText('RUTVIK AI CHATBOT', px + 50, py + 37);

        // Title
        ctx.font = '700 20px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Chat with Rutvik AI', px + 24, py + 85);

        // Description
        ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText("Ask anything about Rutvik's autonomous multi-agent", px + 24, py + 118);
        ctx.fillText('projects, internships, LangGraph stack, and availability.', px + 24, py + 138);

        // CTA pill
        ctx.fillStyle = 'rgba(224,82,156,0.22)';
        ctx.beginPath();
        ctx.roundRect(px + 24, py + 180, 240, 40, 20);
        ctx.fill();
        ctx.strokeStyle = '#e0529c';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = '600 14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('💬  Click Rutvik AI to Chat', px + 48, py + 206);
    }

    // ── Full chat screen ────────────────────────────────────────────────────────
    renderChatScreen(ctx, W, H) {
        const MENU_H = 28;         // menu bar height
        const FOOTER_H = 50;       // bottom input bar
        const HEADER_H = 52;       // chat window header
        const PAD = 14;            // horizontal outer padding

        const totalH = H - MENU_H; // usable height below menu bar

        // Semi-transparent overlay so chat reads cleanly over wallpaper
        ctx.fillStyle = 'rgba(6,8,16,0.88)';
        ctx.fillRect(0, MENU_H, W, totalH);

        // ── Chat window frame ────────────────────────────────────────────────
        const winX = PAD;
        const winY = MENU_H + 8;
        const winW = W - PAD * 2;
        const winH = totalH - 16;

        // Shadow
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.75)';
        ctx.shadowBlur = 32;
        ctx.shadowOffsetY = 10;

        ctx.fillStyle = 'rgba(9,11,22,0.95)';
        ctx.beginPath();
        ctx.roundRect(winX, winY, winW, winH, 14);
        ctx.fill();
        ctx.restore();

        ctx.strokeStyle = 'rgba(224,82,156,0.32)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // ── Header ───────────────────────────────────────────────────────────
        ctx.fillStyle = 'rgba(14,18,34,0.95)';
        ctx.beginPath();
        ctx.roundRect(winX, winY, winW, HEADER_H, [14, 14, 0, 0]);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(winX, winY + HEADER_H);
        ctx.lineTo(winX + winW, winY + HEADER_H);
        ctx.stroke();

        // Window traffic-light dots
        const dotY = winY + HEADER_H / 2;
        [[winX + 22, '#ef4444'], [winX + 40, '#f59e0b'], [winX + 58, '#10b981']].forEach(([dx, col]) => {
            ctx.fillStyle = col;
            ctx.beginPath();
            ctx.arc(dx, dotY, 6, 0, Math.PI * 2);
            ctx.fill();
        });

        // Bot avatar
        ctx.fillStyle = '#e0529c';
        ctx.beginPath();
        ctx.arc(winX + 86, dotY, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('🤖', winX + 86, dotY + 5);
        ctx.textAlign = 'left';

        ctx.font = '700 14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Rutvik AI Assistant', winX + 108, dotY - 3);

        ctx.font = '500 11px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Agentic AI & LLM Systems', winX + 108, dotY + 13);

        // Live indicator dot
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(winX + winW - 24, dotY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#10b981';
        ctx.fillText('live', winX + winW - 16, dotY + 4);

        // ── Message area ──────────────────────────────────────────────────────
        const msgAreaTop = winY + HEADER_H;
        const msgAreaBot = winY + winH - FOOTER_H;
        const msgAreaH = msgAreaBot - msgAreaTop;

        ctx.save();
        ctx.beginPath();
        ctx.rect(winX + 1, msgAreaTop, winW - 2, msgAreaH);
        ctx.clip();

        // Build all rendered lines into an array of drawing items
        const MAX_BUBBLE_W = Math.min(winW - 100, 740);
        ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

        const items = this._buildMessageItems(ctx, MAX_BUBBLE_W);

        // Calculate total content height
        let totalContentH = 0;
        items.forEach(item => { totalContentH += item.h + 12; });
        if (this.isThinking) totalContentH += 42;

        // scrollTop = 0 → bottom of content visible
        // scrollTop = max → top of content visible
        const maxScroll = Math.max(0, totalContentH - msgAreaH + 20);
        // Clamp scroll
        this.chatScrollTop = Math.min(this.chatScrollTop, maxScroll);

        // Starting Y: draw from bottom minus total content plus scroll
        let startY = msgAreaBot - 10 - totalContentH + this.chatScrollTop;

        items.forEach(item => {
            const bx = item.isUser
                ? winX + winW - MAX_BUBBLE_W - 20
                : winX + 20;

            const by = startY;
            startY += item.h + 12;

            // Skip fully off-screen items for perf
            if (by + item.h < msgAreaTop || by > msgAreaBot) return;

            // Bubble background
            ctx.fillStyle = item.isUser
                ? 'rgba(56,189,248,0.18)'
                : 'rgba(20,26,42,0.92)';
            ctx.beginPath();
            ctx.roundRect(bx, by, MAX_BUBBLE_W, item.h, 12);
            ctx.fill();

            // Bubble border
            ctx.strokeStyle = item.isUser
                ? 'rgba(56,189,248,0.42)'
                : 'rgba(224,82,156,0.32)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Sender label
            ctx.font = 'bold 10px monospace';
            ctx.fillStyle = item.isUser ? '#38bdf8' : '#e0529c';
            ctx.fillText(item.isUser ? 'YOU' : 'RUTVIK AI', bx + 14, by + 16);

            // Message text lines
            ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
            ctx.fillStyle = item.isUser ? '#e0f2fe' : '#f1f5f9';
            item.lines.forEach((line, li) => {
                if (line !== '') {
                    ctx.fillText(line, bx + 14, by + 30 + li * 18);
                }
            });
        });

        // Thinking indicator
        if (this.isThinking) {
            const tby = startY;
            const tbx = winX + 20;
            ctx.fillStyle = 'rgba(20,26,42,0.9)';
            ctx.beginPath();
            ctx.roundRect(tbx, tby, 220, 36, 10);
            ctx.fill();
            ctx.strokeStyle = 'rgba(224,82,156,0.35)';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.font = 'italic 12px monospace';
            ctx.fillStyle = '#e0529c';
            ctx.fillText('⚡ Rutvik AI is reasoning...', tbx + 14, tby + 22);
        }

        ctx.restore();

        // ── Scroll indicator ─────────────────────────────────────────────────
        if (this.chatScrollTop > 10 && maxScroll > 0) {
            const scrollPct = this.chatScrollTop / maxScroll;
            // Small scrollbar track on the right edge
            const trackH = msgAreaH - 20;
            const thumbH = Math.max(32, trackH * (msgAreaH / totalContentH));
            const thumbY = msgAreaTop + 10 + (trackH - thumbH) * (1 - scrollPct);

            ctx.fillStyle = 'rgba(255,255,255,0.08)';
            ctx.beginPath();
            ctx.roundRect(winX + winW - 10, msgAreaTop + 10, 4, trackH, 2);
            ctx.fill();

            ctx.fillStyle = 'rgba(224,82,156,0.55)';
            ctx.beginPath();
            ctx.roundRect(winX + winW - 10, thumbY, 4, thumbH, 2);
            ctx.fill();

            // "↑ scroll up to see more" hint
            ctx.font = 'bold 11px monospace';
            ctx.fillStyle = 'rgba(224,82,156,0.7)';
            ctx.textAlign = 'right';
            ctx.fillText('↑ scroll to read older', winX + winW - 16, msgAreaTop + msgAreaH / 2);
            ctx.textAlign = 'left';
        }

        // ── Bottom input bar (cosmetic, real input is HTML overlay) ──────────
        const barY = winY + winH - FOOTER_H;
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.beginPath();
        ctx.moveTo(winX, barY);
        ctx.lineTo(winX + winW, barY);
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = 'rgba(14,18,34,0.90)';
        ctx.fillRect(winX, barY, winW, FOOTER_H);

        // Input pill
        ctx.fillStyle = 'rgba(255,255,255,0.07)';
        ctx.beginPath();
        ctx.roundRect(winX + 18, barY + 10, winW - 100, 30, 15);
        ctx.fill();
        ctx.strokeStyle = 'rgba(224,82,156,0.30)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillText('Ask Rutvik AI anything...', winX + 36, barY + 29);

        // Send button
        ctx.fillStyle = 'rgba(224,82,156,0.85)';
        ctx.beginPath();
        ctx.roundRect(winX + winW - 72, barY + 10, 58, 30, 15);
        ctx.fill();
        ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('Send ➤', winX + winW - 43, barY + 29);
        ctx.textAlign = 'left';
    }

    // ── Build message rendering items ─────────────────────────────────────────
    _buildMessageItems(ctx, maxBubbleW) {
        const items = [];
        ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

        this.messages.forEach((msg, idx) => {
            const isUser = msg.role === 'user';
            const isLast = idx === this.messages.length - 1;
            const isLastAssistant = !isUser && isLast;

            let cleanText = this._cleanText(msg.text);
            if (isLastAssistant && this.displayedCharIndex < cleanText.length) {
                cleanText = cleanText.substring(0, this.displayedCharIndex);
            }

            const lines = this._wrapText(ctx, cleanText, maxBubbleW - 28);
            const h = 36 + lines.length * 18; // 30px for label + padding, 18px per line
            items.push({ isUser, lines, h });
        });

        return items;
    }

    // ── Text helpers ─────────────────────────────────────────────────────────
    _cleanText(text) {
        if (!text) return '';
        let t = text
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/?[^>]+(>|$)/g, '');

        const lines = t.split('\n');
        const out = [];
        for (const raw of lines) {
            const line = raw.trim();
            if (/^\|[-:\s|]+\|$/.test(line)) continue; // MD table divider
            if (line.startsWith('|') && line.endsWith('|')) {
                const cells = line.split('|').map(c => c.trim()).filter(Boolean);
                out.push(cells.length === 2 ? `• ${cells[0]}: ${cells[1]}` : `• ${cells.join(' | ')}`);
                continue;
            }
            out.push(line.replace(/^#{1,6}\s+/, ''));
        }

        return out.join('\n')
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/__([^_]+)__/g, '$1')
            .replace(/_([^_]+)_/g, '$1')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    }

    _wrapText(ctx, text, maxW) {
        const paras = text.split('\n');
        const all = [];
        for (const raw of paras) {
            const para = raw.trim();
            if (!para) {
                if (all.length > 0 && all[all.length - 1] !== '') all.push('');
                continue;
            }
            const words = para.split(/\s+/);
            let cur = words[0] || '';
            for (let i = 1; i < words.length; i++) {
                const test = cur + ' ' + words[i];
                if (ctx.measureText(test).width <= maxW) {
                    cur = test;
                } else {
                    all.push(cur);
                    cur = words[i];
                }
            }
            if (cur) all.push(cur);
        }
        return all.length ? all : [''];
    }

    destroy() {
        if (this.mesh) this.scene.remove(this.mesh);
        if (this.material) this.material.dispose();
        if (this.texture) this.texture.dispose();
    }
}
