import * as THREE from 'three';
import Experience from './Experience.js';
import screenSync from './ScreenSync.js';

export default class LaptopScreen {
    constructor(mesh) {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.time = this.experience.time;
        this.mesh = mesh;

        // Motion preference
        this.prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Canvas Setup (16:9 matching wallpaper)
        this.width = 1024;
        this.height = 576;
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d');

        // Wallpaper Image Setup
        this.wallpaper = new Image();
        this.wallpaperLoaded = false;
        this.wallpaper.onload = () => {
            this.wallpaperLoaded = true;
            this.render();
        };
        this.wallpaper.onerror = () => {
            console.warn('Failed to load laptopWallpaper.jpg, using dark theme fallback.');
        };
        this.wallpaper.src = '/assets/laptopWallpaper.jpg';

        // Texture Setup
        this.texture = new THREE.CanvasTexture(this.canvas);
        this.texture.encoding = THREE.sRGBEncoding;
        this.texture.generateMipmaps = false;
        this.texture.minFilter = THREE.LinearFilter;
        this.texture.magFilter = THREE.LinearFilter;

        // Material & Mesh
        this.material = new THREE.MeshBasicMaterial({
            map: this.texture,
            side: THREE.DoubleSide
        });

        if (this.mesh) {
            this.mesh.material = this.material;
            this.scene.add(this.mesh);
        }

        // Chat State
        this.isChatOpen = false;
        this.isThinking = false;
        this.messages = [
            {
                role: 'assistant',
                text: "Hi! I'm Rutvik's AI agent. Ask me about his projects, multi-agent AI systems, experience, skills, or how to contact him!"
            }
        ];

        // Typing animation for latest assistant message
        this.displayedCharIndex = 0;
        this.lastTypeTime = 0;
        this.typeSpeed = 15; // ms per char

        // Throttle & FPS
        this.isPaused = false;
        this.lastFrameTime = 0;
        this.targetFps = 30;
        this.fpsInterval = 1000 / this.targetFps;

        this.initEventListeners();
        this.render();
    }

    initEventListeners() {
        document.addEventListener('visibilitychange', () => {
            this.isPaused = document.hidden;
        });

        // Open chat screen event
        screenSync.on('chat:open', () => {
            this.isChatOpen = true;
            this.render();
        });

        // New chat message event (User or Assistant)
        screenSync.on('chat:message', (data) => {
            this.isChatOpen = true;
            if (data.role === 'user') {
                this.messages.push({
                    role: 'user',
                    text: data.content
                });
                this.isThinking = true;
            } else if (data.role === 'assistant') {
                this.isThinking = false;
                this.messages.push({
                    role: 'assistant',
                    text: data.content
                });
                this.displayedCharIndex = 0;
            }
            this.render();
        });

        // Close chat screen event
        screenSync.on('chat:close', () => {
            this.isChatOpen = false;
            this.render();
        });
    }

    openChat() {
        this.isChatOpen = true;
        this.render();
    }

    closeChat() {
        this.isChatOpen = false;
        this.render();
    }

    update() {
        if (this.isPaused) return;

        const now = performance.now();
        const elapsed = now - this.lastFrameTime;
        if (elapsed < this.fpsInterval) return;
        this.lastFrameTime = now - (elapsed % this.fpsInterval);

        // Typing animation for the latest assistant message
        if (this.messages.length > 0) {
            const lastMsg = this.messages[this.messages.length - 1];
            if (lastMsg.role === 'assistant') {
                if (this.displayedCharIndex < lastMsg.text.length) {
                    if (now - this.lastTypeTime > this.typeSpeed) {
                        this.displayedCharIndex += 3;
                        this.lastTypeTime = now;
                    }
                }
            }
        }

        this.render();
    }

    render() {
        const ctx = this.ctx;
        const W = this.width;
        const H = this.height;

        // 1. Draw Spider-Man Desktop Wallpaper
        if (this.wallpaperLoaded) {
            ctx.drawImage(this.wallpaper, 0, 0, W, H);
        } else {
            const grad = ctx.createLinearGradient(0, 0, W, H);
            grad.addColorStop(0, '#120b12');
            grad.addColorStop(1, '#050406');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);
        }

        // 2. macOS Top Menu Bar
        this.renderMenuBar(ctx, W);

        // 3. Render either Idle Prompt or Active Chat Window
        if (!this.isChatOpen) {
            this.renderIdlePrompt(ctx);
        } else {
            this.renderChatWindow(ctx, W, H);
        }

        // Notify Three.js to upload updated canvas texture
        this.texture.needsUpdate = true;
    }

    renderMenuBar(ctx, W) {
        const barH = 28;

        // Frosted macOS menu bar
        ctx.fillStyle = 'rgba(8, 10, 16, 0.72)';
        ctx.fillRect(0, 0, W, barH);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, barH);
        ctx.lineTo(W, barH);
        ctx.stroke();

        // Apple Logo & Menu Items
        ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('', 18, 18);

        ctx.font = '500 11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        const menus = ['Finder', 'File', 'Edit', 'View', 'Go', 'Window', 'Help'];
        let mX = 42;
        menus.forEach(m => {
            ctx.fillText(m, mX, 18);
            mX += ctx.measureText(m).width + 16;
        });

        // Right side indicators (Battery, Wi-Fi, Sound, Clock)
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.textAlign = 'right';
        ctx.fillText(`⚡ 100%   📶 Wi-Fi   🔊   ${timeStr}`, W - 18, 18);
        ctx.textAlign = 'left';
    }

    renderIdlePrompt(ctx) {
        // Floating glass card on the left/center
        const px = 70;
        const py = 120;
        const pw = 420;
        const ph = 240;

        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 8;

        ctx.fillStyle = 'rgba(10, 12, 20, 0.84)';
        ctx.beginPath();
        ctx.roundRect(px, py, pw, ph, 14);
        ctx.fill();
        ctx.restore();

        ctx.strokeStyle = 'rgba(224, 82, 156, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Top accent line
        ctx.fillStyle = '#e0529c';
        ctx.fillRect(px + 24, py, 70, 2.5);

        // Badge
        ctx.fillStyle = 'rgba(224, 82, 156, 0.18)';
        ctx.beginPath();
        ctx.roundRect(px + 24, py + 22, 160, 22, 11);
        ctx.fill();

        ctx.fillStyle = '#e0529c';
        ctx.beginPath();
        ctx.arc(px + 36, py + 33, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 11px monospace';
        ctx.fillText('RUTVIK AI CHATBOT', px + 46, py + 37);

        // Header
        ctx.font = '700 17px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Chat with Rutvik AI', px + 24, py + 76);

        // Description
        ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Ask anything about Rutvik\'s autonomous multi-agent', px + 24, py + 106);
        ctx.fillText('projects, internships, LangGraph stack, and availability.', px + 24, py + 126);
        ctx.fillText('Powered by Groq API (GPT-OSS-120B).', px + 24, py + 146);

        // Click to Open Action Pill
        ctx.fillStyle = 'rgba(224, 82, 156, 0.25)';
        ctx.beginPath();
        ctx.roundRect(px + 24, py + 172, 220, 36, 18);
        ctx.fill();
        ctx.strokeStyle = '#e0529c';
        ctx.stroke();

        ctx.font = '600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('💬 Click Laptop to Chat', px + 44, py + 195);
    }

    renderChatWindow(ctx, W, H) {
        // Positioned on the LEFT half (x: 36 to 560), keeping Spider-Man completely visible on the RIGHT!
        const winX = 36;
        const winY = 40;
        const winW = 520;
        const winH = 500;
        const radius = 12;

        // Window Drop Shadow
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 24;
        ctx.shadowOffsetY = 8;

        // Window Glass Background
        ctx.fillStyle = 'rgba(9, 11, 20, 0.92)';
        ctx.beginPath();
        ctx.roundRect(winX, winY, winW, winH, radius);
        ctx.fill();
        ctx.restore();

        // Window Border with soft pink/cyan neon highlight
        ctx.strokeStyle = 'rgba(224, 82, 156, 0.35)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 1. Header (Height: 44px)
        const headerH = 44;
        ctx.fillStyle = 'rgba(16, 20, 32, 0.88)';
        ctx.beginPath();
        ctx.roundRect(winX, winY, winW, headerH, [radius, radius, 0, 0]);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.moveTo(winX, winY + headerH);
        ctx.lineTo(winX + winW, winY + headerH);
        ctx.stroke();

        // Window control dots
        const dotY = winY + 22;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.arc(winX + 20, dotY, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath(); ctx.arc(winX + 36, dotY, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#10b981';
        ctx.beginPath(); ctx.arc(winX + 52, dotY, 5, 0, Math.PI * 2); ctx.fill();

        // Bot Avatar + Title
        ctx.fillStyle = '#e0529c';
        ctx.beginPath();
        ctx.arc(winX + 76, dotY, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('🤖', winX + 76, dotY + 4);
        ctx.textAlign = 'left';

        ctx.font = '700 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Rutvik AI Assistant', winX + 96, dotY - 2);

        ctx.font = '500 10px monospace';
        ctx.fillStyle = '#34d399';
        ctx.fillText('● Online • Groq gpt-oss-120b', winX + 96, dotY + 12);

        // 2. Chat Message List Area
        const msgAreaTop = winY + headerH + 10;
        const msgAreaHeight = winH - headerH - 55;

        ctx.save();
        ctx.beginPath();
        ctx.rect(winX + 10, msgAreaTop, winW - 20, msgAreaHeight);
        ctx.clip();

        // Calculate rendered bubbles from bottom up
        let currentY = msgAreaTop + 10;
        const maxBubbleWidth = 340;

        // Display the last 3-4 messages to fit the screen cleanly
        const recentMessages = this.messages.slice(-4);

        recentMessages.forEach((msg, mIdx) => {
            const isUser = msg.role === 'user';
            const isLastAssistant = !isUser && (mIdx === recentMessages.length - 1);

            let displayText = msg.text;
            if (isLastAssistant && this.displayedCharIndex < msg.text.length) {
                displayText = msg.text.substring(0, this.displayedCharIndex);
            }

            // Word wrap
            ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
            const wrappedLines = this.wrapText(ctx, displayText, maxBubbleWidth - 24);
            const bubbleHeight = Math.max(34, wrappedLines.length * 18 + 16);

            if (isUser) {
                // User Bubble (Right-aligned, Cyan/Blue gradient)
                const bx = winX + winW - maxBubbleWidth - 16;
                ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
                ctx.beginPath();
                ctx.roundRect(bx, currentY, maxBubbleWidth, bubbleHeight, 10);
                ctx.fill();
                ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
                ctx.stroke();

                ctx.fillStyle = '#e0f2fe';
                wrappedLines.forEach((l, lIdx) => {
                    ctx.fillText(l, bx + 12, currentY + 18 + lIdx * 18);
                });
            } else {
                // Assistant Bubble (Left-aligned, Dark glass with pink border)
                const bx = winX + 16;
                ctx.fillStyle = 'rgba(20, 26, 40, 0.85)';
                ctx.beginPath();
                ctx.roundRect(bx, currentY, maxBubbleWidth, bubbleHeight, 10);
                ctx.fill();
                ctx.strokeStyle = 'rgba(224, 82, 156, 0.35)';
                ctx.stroke();

                ctx.fillStyle = '#f1f5f9';
                wrappedLines.forEach((l, lIdx) => {
                    ctx.fillText(l, bx + 12, currentY + 18 + lIdx * 18);
                });
            }

            currentY += bubbleHeight + 10;
        });

        // 3. Thinking Indicator (if AI is waiting for response)
        if (this.isThinking) {
            const bx = winX + 16;
            ctx.fillStyle = 'rgba(20, 26, 40, 0.85)';
            ctx.beginPath();
            ctx.roundRect(bx, currentY, 180, 28, 8);
            ctx.fill();
            ctx.strokeStyle = 'rgba(224, 82, 156, 0.35)';
            ctx.stroke();

            ctx.font = 'italic 11px monospace';
            ctx.fillStyle = '#e0529c';
            ctx.fillText('⚡ Rutvik AI is reasoning...', bx + 12, currentY + 18);
        }

        ctx.restore();

        // 4. Bottom Input Bar Mockup on 3D Screen
        const barY = winY + winH - 40;
        ctx.fillStyle = 'rgba(15, 20, 32, 0.8)';
        ctx.beginPath();
        ctx.roundRect(winX + 16, barY, winW - 32, 30, 15);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.stroke();

        ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillText('Type question in card or click quick questions...', winX + 30, barY + 19);

        ctx.fillStyle = '#e0529c';
        ctx.beginPath();
        ctx.arc(winX + winW - 32, barY + 15, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('➤', winX + winW - 32, barY + 18);
        ctx.textAlign = 'left';
    }

    wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0] || '';

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + ' ' + word).width;
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }

    destroy() {
        if (this.mesh) this.scene.remove(this.mesh);
        if (this.material) this.material.dispose();
        if (this.texture) this.texture.dispose();
    }
}
