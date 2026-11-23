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

        // Motion preference
        this.prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Display & Animation State
        this.isCodeRunning = false; // Starts on desktop wallpaper mode; runs on "Run on 3D Monitor"
        this.state = 'TYPING'; // 'TYPING', 'TERMINAL', 'PAUSE'
        this.typedCharIndex = 0;
        this.lastTypeTime = 0;
        this.typeSpeed = 16; // ms per char
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

        // Wallpaper Image Setup
        this.wallpaper = new Image();
        this.wallpaperLoaded = false;
        this.wallpaper.onload = () => {
            this.wallpaperLoaded = true;
            this.render();
        };
        this.wallpaper.onerror = () => {
            console.warn('Failed to load pcWallpaper.jpg, using dark theme fallback.');
        };
        this.wallpaper.src = '/assets/pcWallpaper.jpg';

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

        // Listen for "Run on 3D Monitor" or project selection
        screenSync.on('run:code', (data) => {
            const idx = (data && typeof data.index === 'number') ? data.index : this.activeTabIndex;
            this.startCodeRun(idx);
        });

        screenSync.on('tab:select', (data) => {
            if (typeof data.index === 'number') {
                this.setTab(data.index);
            }
        });
    }

    startCodeRun(index = null) {
        if (index !== null && index >= 0 && index < this.projects.length) {
            this.activeTabIndex = index;
        }
        this.isCodeRunning = true;
        this.typedCharIndex = 0;
        this.scrollOffsetY = 0;
        this.terminalLines = [];
        this.terminalStep = 0;
        this.state = 'TYPING';
        this.lastTypeTime = performance.now();
        this.render();

        const p = this.projects[this.activeTabIndex] || {};
        screenSync.emit('run:start', { tabName: p.tabName, title: p.title });
    }

    stopCodeRun() {
        this.isCodeRunning = false;
        this.render();
    }

    setTab(index) {
        if (index < 0 || index >= this.projects.length) return;
        this.activeTabIndex = index;
        if (this.isCodeRunning) {
            this.startCodeRun(index);
        } else {
            this.render();
        }
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

        if (this.isCodeRunning) {
            const project = this.projects[this.activeTabIndex] || {};
            const snippet = this.getSnippetForProject(project);

            // State Machine for Code Typing Loop
            if (this.state === 'TYPING') {
                if (this.prefersReducedMotion) {
                    this.typedCharIndex = snippet.length;
                    this.state = 'TERMINAL';
                    this.terminalTimer = now;
                } else if (this.typedCharIndex < snippet.length) {
                    if (now - this.lastTypeTime > this.typeSpeed) {
                        const charsToAdd = Math.min(2, snippet.length - this.typedCharIndex);
                        this.typedCharIndex += charsToAdd;
                        this.lastTypeTime = now;
                    }
                } else {
                    // Finished typing code -> start terminal execution
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
                    // Loop to next project snippet or repeat in infinite loop
                    const nextIndex = (this.activeTabIndex + 1) % this.projects.length;
                    this.startCodeRun(nextIndex);
                }
            }
        }

        this.render();
    }

    getSnippetForProject(project) {
        // High-impact, clean ~12-14 lines of code per project that fit the editor window
        if (project.id === 'cortex' || this.activeTabIndex === 0) {
            return `from langgraph.graph import StateGraph, END
from cortex.agent import Supervisor, ToolHarness

# Autonomous multi-agent state graph
graph = StateGraph(AgentState)
graph.add_node("supervisor", Supervisor.route)
graph.add_node("researcher", ToolHarness.retrieve)
graph.add_node("validator", Schema.verify)

graph.add_edge("supervisor", "researcher")
graph.add_edge("researcher", "validator")
graph.add_edge("validator", END)

app = graph.compile()
response = app.invoke({"task": "optimize_pipeline"})`;
        } else if (project.id === 'solar-fault' || this.activeTabIndex === 1) {
            return `import torch
from timescaledb import StreamClient

# Telemetry anomaly classification agent
detector = torch.jit.load("models/solar_ensemble.pt")
client = StreamClient(timeout_ms=50)

async def monitor_inverter(string_id: str):
    raw_v, raw_i = await client.read(string_id)
    tensor_in = torch.tensor([[raw_v, raw_i]])
    score = detector(tensor_in).item()
    if score > 0.85:
        await dispatch_drone(string=string_id, fault="DIODE_DEGRADE")`;
        } else if (project.id === 'sales-orchestrator' || this.activeTabIndex === 2) {
            return `from langchain.agents import AgentExecutor
from vectorstore import ChromaStore

# 5-Agent crawl & synthesis orchestrator
kb = ChromaStore.connect("registry_embeddings")
crawler = DomainCrawler(headless=True)

async def synthesize_brief(domain: str):
    signals = await crawler.extract_signals(domain)
    context = kb.query(signals.tech_stack, top_k=5)
    return await AgentExecutor.draft(signals, context)`;
        } else {
            return `from paho.mqtt import client as mqtt_client
from whisper import parse_voice_command

# Natural language to register write bridge
mqtt = mqtt_client.Client("edge_bridge")
mqtt.connect("broker.local", 1883)

def execute_override(instruction: str):
    cmd = parse_voice_command(instruction)
    topic = f"factory/cell_3/{cmd.device_id}/control"
    mqtt.publish(topic, cmd.to_binary(), qos=2)
    return {"status": "ACKNOWLEDGED", "id": cmd.device_id}`;
        }
    }

    executeTerminalStep(now, project) {
        const steps = [
            {
                delay: 450,
                line: `$ python ${project.tabName || 'agent_job.py'} --execute`,
                color: '#38bdf8',
                emit: () => screenSync.emit('run:start', { tabName: project.tabName })
            },
            {
                delay: 500,
                line: `[ROUTER] StateGraph supervisor initialized -> dispatching workers`,
                color: '#94a3b8',
                emit: () => screenSync.emit('node:active', { name: 'supervisor', status: 'Decomposing task' })
            },
            {
                delay: 550,
                line: `[WORKER] supervisor -> researcher [tool_harness: active]`,
                color: '#c084fc',
                emit: () => screenSync.emit('node:active', { name: 'researcher', status: 'Context retrieved' })
            },
            {
                delay: 550,
                line: `[VALIDATOR] researcher -> validator [PASS ✓]`,
                color: '#34d399',
                emit: () => screenSync.emit('node:active', { name: 'verifier', status: 'Contract verified' })
            },
            {
                delay: 600,
                line: `✓ Execution cycle completed [Memory: 42MB | Exit: 0]`,
                color: '#10b981',
                emit: () => screenSync.emit('run:complete', { duration: '1.42s' })
            }
        ];

        if (this.terminalStep < steps.length) {
            const step = steps[this.terminalStep];
            this.terminalLines.push({ text: step.line, color: step.color });
            if (step.emit) step.emit();
            this.terminalStep++;
            this.terminalTimer = now + step.delay;
        } else {
            // Completed all terminal steps -> Pause for 3s before looping
            this.state = 'PAUSE';
            this.terminalTimer = now + 3000;
        }
    }

    render() {
        const ctx = this.ctx;
        const W = this.width;
        const H = this.height;

        // 1. Draw Batman & Catwoman Desktop Wallpaper
        if (this.wallpaperLoaded) {
            ctx.drawImage(this.wallpaper, 0, 0, W, H);
        } else {
            // Elegant dark gradient fallback while image loads
            const grad = ctx.createLinearGradient(0, 0, W, H);
            grad.addColorStop(0, '#10131c');
            grad.addColorStop(1, '#05070a');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);
        }

        // 2. Draw Desktop OS Elements (Taskbar, Clock, Desktop Icons)
        this.renderDesktopTaskbar(ctx, W, H);

        // 3. If Code is NOT Running -> Show Desktop Icons & Floating Prompt
        if (!this.isCodeRunning) {
            this.renderDesktopIcons(ctx);
            this.renderDesktopPrompt(ctx);
        } else {
            // 4. If Code IS Running -> Draw Floating Code Window on Left (Batman & Catwoman visible on Right!)
            this.renderCodeWindow(ctx, W, H);
        }

        // Notify Three.js to upload updated canvas texture
        this.texture.needsUpdate = true;
    }

    renderDesktopTaskbar(ctx, W, H) {
        const barH = 32;
        const barY = H - barH;

        // Translucent frosted glass taskbar
        ctx.fillStyle = 'rgba(8, 11, 18, 0.78)';
        ctx.fillRect(0, barY, W, barH);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, barY);
        ctx.lineTo(W, barY);
        ctx.stroke();

        // Start / OS Logo (Stylized cyan diamond)
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(22, barY + 9);
        ctx.lineTo(30, barY + 16);
        ctx.lineTo(22, barY + 23);
        ctx.lineTo(14, barY + 16);
        ctx.closePath();
        ctx.fill();

        // Search pill
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.roundRect(42, barY + 6, 120, 20, 4);
        ctx.fill();
        ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fillText('Type to search...', 52, barY + 20);

        // Pinned App Icons (Terminal, Code, Browser, Files)
        const apps = [
            { icon: '>_', label: 'term', active: this.isCodeRunning },
            { icon: '{}', label: 'code', active: this.isCodeRunning },
            { icon: '🌐', label: 'web', active: false },
            { icon: '📁', label: 'files', active: false }
        ];

        let appX = 180;
        apps.forEach((app) => {
            if (app.active) {
                ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
                ctx.beginPath();
                ctx.roundRect(appX - 4, barY + 4, 28, 24, 4);
                ctx.fill();
                // Active cyan dot at bottom
                ctx.fillStyle = '#38bdf8';
                ctx.beginPath();
                ctx.arc(appX + 10, barY + 29, 2, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.font = 'bold 12px monospace';
            ctx.fillStyle = app.active ? '#38bdf8' : 'rgba(255, 255, 255, 0.7)';
            ctx.fillText(app.icon, appX, barY + 21);
            appX += 34;
        });

        // System Tray (Right Side: Wi-Fi, Volume, Live Clock)
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const dateStr = now.toLocaleDateString([], { month: 'short', day: 'numeric' });

        ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.textAlign = 'right';
        ctx.fillText(`⚡ 100%   📶 Wi-Fi   🔊   ${timeStr}   ${dateStr}`, W - 18, barY + 20);
        ctx.textAlign = 'left';
    }

    renderDesktopIcons(ctx) {
        const icons = [
            { name: 'agent_loop.py', icon: '🐍', x: 30, y: 35 },
            { name: 'terminal.sh', icon: '💻', x: 30, y: 115 },
            { name: 'portfolio.ai', icon: '🧠', x: 30, y: 195 }
        ];

        icons.forEach(ic => {
            // Icon container hover effect
            ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
            ctx.beginPath();
            ctx.roundRect(ic.x - 6, ic.y - 6, 74, 68, 6);
            ctx.fill();

            // Emoji icon
            ctx.font = '28px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(ic.icon, ic.x + 31, ic.y + 30);

            // Label
            ctx.font = '500 11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 4;
            ctx.fillText(ic.name, ic.x + 31, ic.y + 54);
            ctx.shadowBlur = 0;
            ctx.textAlign = 'left';
        });
    }

    renderDesktopPrompt(ctx) {
        // Floating stylish glass prompt on the left/center
        const px = 140;
        const py = 70;
        const pw = 360;
        const ph = 150;

        ctx.fillStyle = 'rgba(10, 14, 24, 0.82)';
        ctx.beginPath();
        ctx.roundRect(px, py, pw, ph, 12);
        ctx.fill();

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Glow accent bar
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(px + 20, py, 60, 2);

        // Header
        ctx.font = '700 14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('⚡ Autonomous AI Workstation', px + 20, py + 34);

        // Subtitle
        ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Desktop ready. Click "Run on 3D Monitor" to', px + 20, py + 62);
        ctx.fillText('compile and execute the multi-agent code loop.', px + 20, py + 82);

        // Interactive Pill button
        ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.beginPath();
        ctx.roundRect(px + 20, py + 102, 195, 30, 15);
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.stroke();

        ctx.font = '600 12px monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('▶ RUN ON 3D MONITOR', px + 35, py + 122);
    }

    renderCodeWindow(ctx, W, H) {
        // Positioned on the LEFT half (x: 36 to 586), keeping Batman & Catwoman fully visible on the RIGHT!
        const winX = 36;
        const winY = 24;
        const winW = 550;
        const winH = 495;
        const radius = 10;

        const project = this.projects[this.activeTabIndex] || {};

        // Window Drop Shadow
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 24;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 8;

        // Window Background (Deep semi-transparent glass)
        ctx.fillStyle = 'rgba(8, 12, 22, 0.92)';
        ctx.beginPath();
        ctx.roundRect(winX, winY, winW, winH, radius);
        ctx.fill();
        ctx.restore();

        // Window Border
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 1. Window Header (Height: 38px)
        const headerH = 38;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        ctx.roundRect(winX, winY, winW, headerH, [radius, radius, 0, 0]);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.moveTo(winX, winY + headerH);
        ctx.lineTo(winX + winW, winY + headerH);
        ctx.stroke();

        // macOS Window Control Dots
        const dotY = winY + 19;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.arc(winX + 20, dotY, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath(); ctx.arc(winX + 36, dotY, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#10b981';
        ctx.beginPath(); ctx.arc(winX + 52, dotY, 5, 0, Math.PI * 2); ctx.fill();

        // Window Title
        ctx.font = '600 13px monospace';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(`${project.tabName || 'agent_supervisor.py'} — Python 3.11`, winX + 75, winY + 24);

        // Running Pulse Pill (Right of header)
        ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
        ctx.beginPath();
        ctx.roundRect(winX + winW - 105, winY + 9, 88, 20, 10);
        ctx.fill();

        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(winX + winW - 93, winY + 19, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 10px monospace';
        ctx.fillText('LOOPING', winX + winW - 83, winY + 23);

        // 2. Code Area (Height: 310px)
        const editorTop = winY + headerH;
        const editorHeight = 310;
        const gutterW = 38;

        // Line numbers gutter
        ctx.fillStyle = 'rgba(5, 8, 15, 0.6)';
        ctx.fillRect(winX, editorTop, gutterW, editorHeight);

        // Clip to editor
        ctx.save();
        ctx.beginPath();
        ctx.rect(winX, editorTop, winW, editorHeight);
        ctx.clip();

        const fullSnippet = this.getSnippetForProject(project);
        const currentTyped = fullSnippet.substring(0, this.typedCharIndex);
        const lines = currentTyped.split('\n');
        const lineHeight = 21;
        const codeStartX = winX + gutterW + 12;

        lines.forEach((lineText, lIdx) => {
            const lineY = editorTop + 20 + lIdx * lineHeight;

            // Line number
            ctx.font = '500 12px monospace';
            ctx.fillStyle = lIdx === lines.length - 1 ? '#38bdf8' : '#475569';
            ctx.textAlign = 'right';
            ctx.fillText((lIdx + 1).toString(), winX + gutterW - 8, lineY);
            ctx.textAlign = 'left';

            // Syntax highlighted line
            this.renderSyntaxLine(ctx, lineText, codeStartX, lineY);

            // Blinking cursor on active line
            if (lIdx === lines.length - 1 && this.state === 'TYPING' && this.cursorBlink) {
                const lineWidth = ctx.measureText(lineText).width;
                ctx.fillStyle = '#38bdf8';
                ctx.fillRect(codeStartX + lineWidth + 2, lineY - 13, 7, 16);
            }
        });

        ctx.restore();

        // 3. Mini Integrated Terminal (Height: 147px)
        const termTop = editorTop + editorHeight;
        const termH = winH - (headerH + editorHeight);

        // Terminal background
        ctx.fillStyle = 'rgba(3, 6, 12, 0.95)';
        ctx.beginPath();
        ctx.roundRect(winX, termTop, winW, termH, [0, 0, radius, radius]);
        ctx.fill();

        // Terminal header divider
        ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
        ctx.fillRect(winX, termTop, winW, 22);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.moveTo(winX, termTop);
        ctx.lineTo(winX + winW, termTop);
        ctx.stroke();

        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('TERMINAL (bash)', winX + 14, termTop + 15);

        ctx.font = '500 10px monospace';
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'right';
        ctx.fillText('active loop', winX + winW - 14, termTop + 15);
        ctx.textAlign = 'left';

        // Terminal lines
        ctx.save();
        ctx.beginPath();
        ctx.rect(winX, termTop + 22, winW, termH - 22);
        ctx.clip();

        const termLineH = 19;
        const termStartY = termTop + 40;
        this.terminalLines.forEach((tLine, idx) => {
            const tY = termStartY + idx * termLineH;
            ctx.font = '500 12px monospace';
            ctx.fillStyle = tLine.color || '#e2e8f0';
            ctx.fillText(tLine.text, winX + 14, tY);
        });

        if (this.state === 'TERMINAL' && this.cursorBlink) {
            const nextTY = termStartY + this.terminalLines.length * termLineH;
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(winX + 14, nextTY - 11, 7, 13);
        }

        ctx.restore();
    }

    renderSyntaxLine(ctx, lineText, startX, startY) {
        ctx.font = 'bold 13px "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace';

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
                color = '#c084fc'; // Purple strings
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
        if (this.mesh) this.scene.remove(this.mesh);
        if (this.material) this.material.dispose();
        if (this.texture) this.texture.dispose();
    }
}
