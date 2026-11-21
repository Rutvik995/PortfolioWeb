import * as THREE from 'three';
import Experience from './Experience.js';
import screenSync from './ScreenSync.js';
import { portfolioData } from '../data/portfolio.js';

export default class PcScreen {
    constructor(mesh) {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.time = this.experience.time;
        this.mesh = mesh;

        // Data
        this.projects = portfolioData.projects || [];
        this.activeTabIndex = 0;
        this.isExternalControl = false;

        // Motion preference
        this.prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Animation State
        this.state = 'TYPING'; // 'TYPING', 'TERMINAL', 'PAUSE'
        this.typedCharIndex = 0;
        this.lastTypeTime = 0;
        this.typeSpeed = 18; // ms per char
        this.cursorBlink = true;
        this.lastCursorBlinkTime = 0;
        this.scrollOffsetY = 0;

        // Terminal steps
        this.terminalLines = [];
        this.terminalStep = 0;
        this.terminalTimer = 0;

        // Canvas Setup (16:9 Ultrawide Aspect)
        this.width = 1024;
        this.height = 576;
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d');

        // Texture Setup
        this.texture = new THREE.CanvasTexture(this.canvas);
        this.texture.encoding = THREE.sRGBEncoding;
        this.texture.generateMipmaps = false;
        this.texture.minFilter = THREE.LinearFilter;
        this.texture.magFilter = THREE.LinearFilter;

        // Material & Mesh
        this.material = new THREE.MeshBasicMaterial({
            map: this.texture
        });

        if (this.mesh) {
            this.mesh.material = this.material;
        }

        // Offscreen & Visibility throttle
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

        // Listen for tab selection from ScrollController or Project Cards
        screenSync.on('tab:select', (data) => {
            if (typeof data.index === 'number') {
                this.setTab(data.index, true);
            }
        });
    }

    setTab(index, isManual = false) {
        if (index < 0 || index >= this.projects.length) return;
        this.activeTabIndex = index;
        this.isExternalControl = isManual;
        this.typedCharIndex = 0;
        this.scrollOffsetY = 0;
        this.terminalLines = [];
        this.terminalStep = 0;
        this.state = 'TYPING';
        this.render();
        screenSync.emit('tab:change', {
            tabName: this.projects[this.activeTabIndex].tabName,
            index: this.activeTabIndex
        });
    }

    update() {
        if (this.isPaused) return;

        const now = performance.now();
        const elapsed = now - this.lastFrameTime;
        if (elapsed < this.fpsInterval) return;
        this.lastFrameTime = now - (elapsed % this.fpsInterval);

        // Cursor blink toggle
        if (now - this.lastCursorBlinkTime > 450) {
            this.cursorBlink = !this.cursorBlink;
            this.lastCursorBlinkTime = now;
        }

        const project = this.projects[this.activeTabIndex];
        const fullSnippet = project.codeSnippet || '';

        // State Machine
        if (this.state === 'TYPING') {
            if (this.prefersReducedMotion) {
                this.typedCharIndex = fullSnippet.length;
                this.state = 'TERMINAL';
                this.terminalTimer = now;
            } else if (this.typedCharIndex < fullSnippet.length) {
                if (now - this.lastTypeTime > this.typeSpeed) {
                    // Type 1-2 characters per tick for smooth natural typing
                    const charsToAdd = Math.min(2, fullSnippet.length - this.typedCharIndex);
                    this.typedCharIndex += charsToAdd;
                    this.lastTypeTime = now;
                }
            } else {
                // Done typing code -> start terminal
                this.state = 'TERMINAL';
                this.terminalStep = 0;
                this.terminalTimer = now + 400;
            }
        } else if (this.state === 'TERMINAL') {
            if (now >= this.terminalTimer) {
                this.executeTerminalStep(now, project);
            }
        } else if (this.state === 'PAUSE') {
            if (now >= this.terminalTimer) {
                // Move to next tab
                const nextIndex = (this.activeTabIndex + 1) % this.projects.length;
                this.setTab(nextIndex, false);
            }
        }

        this.render();
    }

    executeTerminalStep(now, project) {
        const steps = [
            {
                delay: 500,
                line: `$ python run_agent.py --target=${project.tabName}`,
                color: '#38bdf8',
                emit: () => screenSync.emit('run:start', { tabName: project.tabName, title: project.title })
            },
            {
                delay: 600,
                line: `[ROUTER] StateGraph supervisor initialized -> dispatching workers`,
                color: '#94a3b8',
                emit: () => screenSync.emit('node:active', { name: 'supervisor', status: 'Decomposing task' })
            },
            {
                delay: 650,
                line: `[WORKER] supervisor -> researcher [tool_harness: active]`,
                color: '#c084fc',
                emit: () => screenSync.emit('node:active', { name: 'researcher', status: 'Context retrieved' })
            },
            {
                delay: 650,
                line: `[WORKER] researcher -> analyst [payload: 4 records verified]`,
                color: '#fb923c',
                emit: () => screenSync.emit('node:active', { name: 'analyst', status: 'Synthesizing output' })
            },
            {
                delay: 650,
                line: `[VALIDATOR] analyst -> tool_worker -> verifier [PASS ✓]`,
                color: '#34d399',
                emit: () => screenSync.emit('node:active', { name: 'verifier', status: 'Contract verified' })
            },
            {
                delay: 700,
                line: `✓ Execution cycle completed (1.82s) [Memory: 42MB | Exit: 0]`,
                color: '#10b981',
                emit: () => screenSync.emit('run:complete', { duration: '1.82s' })
            }
        ];

        if (this.terminalStep < steps.length) {
            const step = steps[this.terminalStep];
            this.terminalLines.push({ text: step.line, color: step.color });
            if (step.emit) step.emit();
            this.terminalStep++;
            this.terminalTimer = now + step.delay;
        } else {
            // All terminal steps done -> Pause before next tab
            this.state = 'PAUSE';
            this.terminalTimer = now + 2800;
        }
    }

    render() {
        const ctx = this.ctx;
        const W = this.width;
        const H = this.height;
        const project = this.projects[this.activeTabIndex] || {};

        // 1. Overall Dark Background
        ctx.fillStyle = '#06080e';
        ctx.fillRect(0, 0, W, H);

        // 2. Top Window Chrome / Bar (y: 0 to 42)
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, W, 42);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 42, W, 0);

        // Window Control Dots (macOS/VS Code style)
        const dotY = 21;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.arc(20, dotY, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath(); ctx.arc(36, dotY, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#10b981';
        ctx.beginPath(); ctx.arc(52, dotY, 5, 0, Math.PI * 2); ctx.fill();

        // Project / Editor Tabs
        let tabX = 80;
        this.projects.forEach((p, idx) => {
            const isActive = idx === this.activeTabIndex;
            const tabWidth = 180;
            const tabHeight = 42;

            if (isActive) {
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(tabX, 0, tabWidth, tabHeight);
                // Active cyan highlight line at bottom of tab
                ctx.fillStyle = '#38bdf8';
                ctx.fillRect(tabX, tabHeight - 2, tabWidth, 2);
            } else {
                ctx.fillStyle = 'transparent';
                ctx.fillRect(tabX, 0, tabWidth, tabHeight);
            }

            // Tab divider
            ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
            ctx.fillRect(tabX + tabWidth - 1, 10, 1, 22);

            // Tab python icon
            ctx.fillStyle = isActive ? '#38bdf8' : '#64748b';
            ctx.font = 'bold 12px monospace';
            ctx.fillText('py', tabX + 14, 26);

            // Tab label
            ctx.font = isActive ? '600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' : '400 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
            ctx.fillStyle = isActive ? '#ffffff' : '#94a3b8';
            ctx.fillText(p.tabName || `tab_${idx}.py`, tabX + 36, 26);

            tabX += tabWidth;
        });

        // Breadcrumb in top right
        ctx.font = '500 12px monospace';
        ctx.fillStyle = '#475569';
        ctx.textAlign = 'right';
        ctx.fillText('workspace > agent_cluster > production', W - 20, 26);
        ctx.textAlign = 'left';

        // 3. Left Explorer Strip (x: 0 to 110, y: 43 to 552)
        const explorerW = 115;
        ctx.fillStyle = '#070a12';
        ctx.fillRect(0, 43, explorerW, H - 43 - 24);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.strokeRect(explorerW, 43, 0, H - 43 - 24);

        ctx.font = '700 10px monospace';
        ctx.fillStyle = '#64748b';
        ctx.fillText('EXPLORER', 14, 66);

        ctx.font = '600 12px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('▼ AGENTS', 14, 92);

        const explorerFiles = ['cortex.py', 'solar.py', 'sales.py', 'iot.py'];
        explorerFiles.forEach((file, fIdx) => {
            const isFActive = fIdx === this.activeTabIndex;
            const fY = 116 + fIdx * 24;

            if (isFActive) {
                ctx.fillStyle = 'rgba(56, 189, 248, 0.1)';
                ctx.fillRect(0, fY - 15, explorerW, 22);
            }

            ctx.fillStyle = isFActive ? '#38bdf8' : '#64748b';
            ctx.font = '11px monospace';
            ctx.fillText(`• ${file}`, 20, fY);
        });

        ctx.font = '600 12px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('▼ GRAPHS', 14, 235);
        ctx.fillStyle = '#64748b';
        ctx.font = '11px monospace';
        ctx.fillText('• state.py', 20, 258);
        ctx.fillText('• router.py', 20, 282);

        // 4. Editor Area (x: 115 to W, y: 43 to 400)
        const editorTop = 43;
        const editorBottom = 405;
        const editorHeight = editorBottom - editorTop;
        const editorLeft = explorerW;
        const editorWidth = W - editorLeft;

        ctx.fillStyle = '#060911';
        ctx.fillRect(editorLeft, editorTop, editorWidth, editorHeight);

        // Line Numbers background gutter
        const gutterWidth = 45;
        ctx.fillStyle = '#080c16';
        ctx.fillRect(editorLeft, editorTop, gutterWidth, editorHeight);

        // Clip to editor view
        ctx.save();
        ctx.beginPath();
        ctx.rect(editorLeft, editorTop, editorWidth, editorHeight);
        ctx.clip();

        // Calculate visible typed text
        const snippet = project.codeSnippet || '';
        const currentTyped = snippet.substring(0, this.typedCharIndex);
        const lines = currentTyped.split('\n');

        const lineHeight = 24;
        const totalCodeLines = snippet.split('\n').length;
        const maxVisibleLines = Math.floor(editorHeight / lineHeight) - 1;

        // Auto-scroll when typing exceeds visible area
        if (lines.length > maxVisibleLines) {
            this.scrollOffsetY = (lines.length - maxVisibleLines) * lineHeight;
        } else {
            this.scrollOffsetY = 0;
        }

        const startY = editorTop + 24 - this.scrollOffsetY;

        // Draw line numbers & code
        lines.forEach((lineText, lIdx) => {
            const lineY = startY + lIdx * lineHeight;

            // Only draw if within bounds
            if (lineY >= editorTop - 10 && lineY <= editorBottom + 20) {
                // Line Number
                ctx.font = '500 13px monospace';
                ctx.fillStyle = lIdx === lines.length - 1 ? '#38bdf8' : '#475569';
                ctx.textAlign = 'right';
                ctx.fillText((lIdx + 1).toString(), editorLeft + gutterWidth - 10, lineY);
                ctx.textAlign = 'left';

                // Code Syntax Highlighted Tokens
                this.renderSyntaxLine(ctx, lineText, editorLeft + gutterWidth + 14, lineY);

                // Cursor on the active typing line
                if (lIdx === lines.length - 1 && this.state === 'TYPING' && this.cursorBlink) {
                    const lineWidth = ctx.measureText(lineText).width;
                    ctx.fillStyle = '#38bdf8';
                    ctx.fillRect(editorLeft + gutterWidth + 14 + lineWidth + 2, lineY - 14, 8, 18);
                }
            }
        });

        ctx.restore();

        // 5. Terminal Panel (x: 115 to W, y: 405 to 552)
        const termTop = 405;
        const termHeight = 552 - termTop;
        ctx.fillStyle = '#030509';
        ctx.fillRect(editorLeft, termTop, editorWidth, termHeight);

        // Terminal separator bar
        ctx.fillStyle = '#0d131f';
        ctx.fillRect(editorLeft, termTop, editorWidth, 26);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.strokeRect(editorLeft, termTop, editorWidth, 0);

        // Terminal tabs
        ctx.font = '700 11px monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('TERMINAL', editorLeft + 18, termTop + 17);
        ctx.fillStyle = '#64748b';
        ctx.fillText('PROBLEMS', editorLeft + 95, termTop + 17);
        ctx.fillText('OUTPUT', editorLeft + 175, termTop + 17);
        ctx.fillText('DEBUG CONSOLE', editorLeft + 245, termTop + 17);

        // Terminal bash indicator
        ctx.font = '600 11px monospace';
        ctx.fillStyle = '#34d399';
        ctx.textAlign = 'right';
        ctx.fillText('bash (venv)', W - 18, termTop + 17);
        ctx.textAlign = 'left';

        // Terminal Lines
        ctx.save();
        ctx.beginPath();
        ctx.rect(editorLeft, termTop + 26, editorWidth, termHeight - 26);
        ctx.clip();

        const termLineH = 20;
        const termStartY = termTop + 48;
        this.terminalLines.forEach((tLine, idx) => {
            const tY = termStartY + idx * termLineH;
            ctx.font = '500 13px monospace';
            ctx.fillStyle = tLine.color || '#e2e8f0';
            ctx.fillText(tLine.text, editorLeft + 18, tY);
        });

        // Blinking terminal cursor
        if (this.state === 'TERMINAL' && this.cursorBlink) {
            const nextTY = termStartY + this.terminalLines.length * termLineH;
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(editorLeft + 18, nextTY - 13, 8, 15);
        }

        ctx.restore();

        // 6. Bottom Status Bar (y: 552 to 576)
        ctx.fillStyle = '#0a0f1d';
        ctx.fillRect(0, 552, W, 24);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.strokeRect(0, 552, W, 0);

        ctx.font = '500 11px monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('⚡ main*', 14, 568);

        ctx.fillStyle = '#64748b';
        ctx.fillText('0 errors, 0 warnings', 75, 568);
        ctx.fillText('LangGraph v0.2.14', 210, 568);
        ctx.fillText('UTF-8', 345, 568);
        ctx.fillText('Python 3.11.8 (64-bit)', 415, 568);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#34d399';
        ctx.fillText('Compound AI Pipeline: NOMINAL', W - 18, 568);
        ctx.textAlign = 'left';

        // Notify Three.js to upload updated canvas texture
        this.texture.needsUpdate = true;
    }

    renderSyntaxLine(ctx, lineText, startX, startY) {
        ctx.font = 'bold 15px "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace';

        if (lineText.trim().startsWith('#')) {
            ctx.fillStyle = '#64748b';
            ctx.fillText(lineText, startX, startY);
            return;
        }

        const regex = /("""[\s\S]*?"""|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|@\w+|\b(?:def|class|from|import|return|async|await|if|else|elif|in|and|or|not|is|with|as|for|while)\b|\b(?:StateGraph|TypedDict|Annotated|END|torch|StreamClient|BaseModel|Field|ChatOpenAI|int|str|list|dict|float|bool|True|False|None|\d+(?:\.\d+)?)\b|[a-zA-Z_]\w*|[^\s\w]+|\s+)/g;

        let match;
        let currentX = startX;

        while ((match = regex.exec(lineText)) !== null) {
            const token = match[0];
            let color = '#e2e8f0';

            if (token.startsWith('"') || token.startsWith("'")) {
                color = '#c084fc'; // Magenta strings / docstrings
            } else if (token.startsWith('@')) {
                color = '#d8b4fe'; // Lavender decorators
            } else if (/^(def|class|from|import|return|async|await|if|else|elif|in|and|or|not|is|with|as|for|while)$/.test(token)) {
                color = '#38bdf8'; // Cyan keywords
            } else if (/^(StateGraph|TypedDict|Annotated|END|torch|StreamClient|BaseModel|Field|ChatOpenAI|int|str|list|dict|float|bool|True|False|None|\d+(\.\d+)?)$/.test(token)) {
                color = '#fb923c'; // Soft orange types & numbers
            }

            ctx.fillStyle = color;
            ctx.fillText(token, currentX, startY);
            currentX += ctx.measureText(token).width;
        }
    }

    destroy() {
        if (this.material) this.material.dispose();
        if (this.texture) this.texture.dispose();
    }
}
