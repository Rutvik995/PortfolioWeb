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

        // Canvas Setup (16:10 Laptop Aspect)
        this.width = 768;
        this.height = 480;
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

        // Graph Architecture Definition
        this.nodes = {
            supervisor: {
                id: 'supervisor',
                name: 'SUPERVISOR',
                subtitle: 'Task Orchestrator',
                x: 384,
                y: 84,
                w: 168,
                h: 48,
                active: false,
                color: '#38bdf8',
                status: 'IDLE'
            },
            researcher: {
                id: 'researcher',
                name: 'RESEARCHER',
                subtitle: 'Vector Retrieval',
                x: 104,
                y: 220,
                w: 124,
                h: 46,
                active: false,
                color: '#c084fc',
                status: 'IDLE'
            },
            analyst: {
                id: 'analyst',
                name: 'ANALYST',
                subtitle: 'Data Synthesis',
                x: 274,
                y: 220,
                w: 124,
                h: 46,
                active: false,
                color: '#fb923c',
                status: 'IDLE'
            },
            tool_worker: {
                id: 'tool_worker',
                name: 'TOOL RUNNER',
                subtitle: 'API Execution',
                x: 444,
                y: 220,
                w: 124,
                h: 46,
                active: false,
                color: '#38bdf8',
                status: 'IDLE'
            },
            verifier: {
                id: 'verifier',
                name: 'VERIFIER',
                subtitle: 'Schema Check',
                x: 614,
                y: 220,
                w: 124,
                h: 46,
                active: false,
                color: '#34d399',
                status: 'IDLE'
            }
        };

        // Edge Connections from Supervisor to Workers
        this.edges = [
            { from: 'supervisor', to: 'researcher' },
            { from: 'supervisor', to: 'analyst' },
            { from: 'supervisor', to: 'tool_worker' },
            { from: 'supervisor', to: 'verifier' }
        ];

        // Particles moving along edges
        this.particles = [];
        this.edges.forEach((edge, eIdx) => {
            for (let i = 0; i < 3; i++) {
                this.particles.push({
                    edgeIndex: eIdx,
                    t: (i / 3) + Math.random() * 0.2,
                    speed: 0.004 + Math.random() * 0.003
                });
            }
        });

        // Telemetry Mini Log
        this.logs = [
            { time: 'INIT', text: 'StateGraph daemon listening on loopback', status: 'OK' }
        ];

        // Offscreen & Visibility throttle
        this.isPaused = false;
        this.lastFrameTime = 0;
        this.targetFps = 30;
        this.fpsInterval = 1000 / this.targetFps;

        this.initSyncListeners();
        this.render();
    }

    initSyncListeners() {
        document.addEventListener('visibilitychange', () => {
            this.isPaused = document.hidden;
        });

        // 1. Run start event
        screenSync.on('run:start', (data) => {
            this.addLog(`RUN`, `Task initiated: ${data.tabName || 'agent_job'}`);
            this.setAllNodesIdle();
            this.setNodeActive('supervisor', 'ROUTING');
        });

        // 2. Active node step event
        screenSync.on('node:active', (data) => {
            const nodeKey = data.name;
            this.setNodeActive(nodeKey, data.status || 'ACTIVE');
            this.addLog(nodeKey.toUpperCase().slice(0, 4), `${data.status || 'Step processing'}`);
        });

        // 3. Run complete event
        screenSync.on('run:complete', (data) => {
            this.addLog('DONE', `Run verified in ${data.duration || '1.8s'} — Exit 0`);
            // Show verification success on verifier node
            if (this.nodes.verifier) {
                this.nodes.verifier.status = 'VERIFIED';
            }
            setTimeout(() => {
                this.setAllNodesIdle();
            }, 1800);
        });

        // 4. Tab change event
        screenSync.on('tab:change', (data) => {
            this.addLog('DAG', `Switched context: ${data.tabName}`);
        });
    }

    setAllNodesIdle() {
        Object.values(this.nodes).forEach(n => {
            n.active = false;
            n.status = 'IDLE';
        });
    }

    setNodeActive(name, status = 'ACTIVE') {
        const node = this.nodes[name];
        if (node) {
            // Keep supervisor lit or light up current
            if (name !== 'supervisor') {
                if (this.nodes.supervisor) this.nodes.supervisor.active = true;
            }
            node.active = true;
            node.status = status;
        }
    }

    addLog(tag, text) {
        const d = new Date();
        const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
        this.logs.unshift({ time: timeStr, tag, text });
        if (this.logs.length > 5) {
            this.logs.pop();
        }
    }

    update() {
        if (this.isPaused) return;

        const now = performance.now();
        const elapsed = now - this.lastFrameTime;
        if (elapsed < this.fpsInterval) return;
        this.lastFrameTime = now - (elapsed % this.fpsInterval);

        // Update particle positions
        if (!this.prefersReducedMotion) {
            this.particles.forEach(p => {
                const edge = this.edges[p.edgeIndex];
                const targetNode = this.nodes[edge.to];
                // Particle moves faster if target node is active
                const currentSpeed = targetNode.active ? p.speed * 2.8 : p.speed;
                p.t = (p.t + currentSpeed) % 1.0;
            });
        }

        this.render();
    }

    render() {
        const ctx = this.ctx;
        const W = this.width;
        const H = this.height;

        // 1. Sleek Background with Subtle Cyber Grid
        ctx.fillStyle = '#060912';
        ctx.fillRect(0, 0, W, H);

        // Subtle background grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
        ctx.lineWidth = 1;
        const gridSize = 32;
        for (let x = 0; x < W; x += gridSize) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        for (let y = 0; y < H; y += gridSize) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }

        // 2. Header Bar (y: 0 to 42)
        ctx.fillStyle = '#0a0f1d';
        ctx.fillRect(0, 0, W, 42);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.strokeRect(0, 42, W, 0);

        ctx.font = '700 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText('MULTI-AGENT GRAPH ARCHITECTURE', 22, 26);

        // Header status indicator
        ctx.fillStyle = '#10b981';
        ctx.beginPath(); ctx.arc(W - 130, 21, 5, 0, Math.PI * 2); ctx.fill();
        ctx.font = '600 11px monospace';
        ctx.fillStyle = '#34d399';
        ctx.fillText('STATE_DAG: LIVE', W - 118, 25);

        // 3. Draw Connecting Edges
        const sup = this.nodes.supervisor;
        const supBottomX = sup.x;
        const supBottomY = sup.y + sup.h / 2;

        this.edges.forEach((edge, eIdx) => {
            const worker = this.nodes[edge.to];
            const workerTopX = worker.x;
            const workerTopY = worker.y - worker.h / 2;

            const isEdgeActive = worker.active;

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(supBottomX, supBottomY);
            // Cubic bezier curve
            const controlY1 = supBottomY + 40;
            const controlY2 = workerTopY - 40;
            ctx.bezierCurveTo(supBottomX, controlY1, workerTopX, controlY2, workerTopX, workerTopY);

            if (isEdgeActive) {
                ctx.strokeStyle = worker.color;
                ctx.lineWidth = 3;
                ctx.shadowColor = worker.color;
                ctx.shadowBlur = 12;
            } else {
                ctx.strokeStyle = 'rgba(100, 116, 139, 0.35)';
                ctx.lineWidth = 1.5;
            }
            ctx.stroke();
            ctx.restore();

            // Draw traveling particles on this edge
            if (!this.prefersReducedMotion) {
                this.particles.filter(p => p.edgeIndex === eIdx).forEach(p => {
                    const pt = this.getBezierPoint(
                        supBottomX, supBottomY,
                        supBottomX, controlY1,
                        workerTopX, controlY2,
                        workerTopX, workerTopY,
                        p.t
                    );

                    ctx.save();
                    ctx.fillStyle = isEdgeActive ? '#ffffff' : worker.color;
                    ctx.shadowColor = worker.color;
                    ctx.shadowBlur = isEdgeActive ? 14 : 6;
                    ctx.beginPath();
                    ctx.arc(pt.x, pt.y, isEdgeActive ? 3.5 : 2.2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                });
            }
        });

        // 4. Draw Graph Nodes
        Object.values(this.nodes).forEach(node => {
            const nodeLeft = node.x - node.w / 2;
            const nodeTop = node.y - node.h / 2;
            const isActive = node.active;

            ctx.save();

            // Node Glow when active
            if (isActive) {
                ctx.shadowColor = node.color;
                ctx.shadowBlur = 20;
            }

            // Node Background Fill
            ctx.fillStyle = isActive ? 'rgba(15, 23, 42, 0.95)' : 'rgba(11, 15, 25, 0.85)';
            ctx.beginPath();
            ctx.roundRect(nodeLeft, nodeTop, node.w, node.h, 8);
            ctx.fill();

            // Node Border
            ctx.strokeStyle = isActive ? node.color : 'rgba(255, 255, 255, 0.12)';
            ctx.lineWidth = isActive ? 2 : 1;
            ctx.stroke();
            ctx.restore();

            // Node Name
            ctx.font = 'bold 12px monospace';
            ctx.fillStyle = isActive ? '#ffffff' : '#cbd5e1';
            ctx.textAlign = 'center';
            ctx.fillText(node.name, node.x, node.y - 4);

            // Node Subtitle / Role
            ctx.font = '500 10px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
            ctx.fillStyle = isActive ? node.color : '#64748b';
            ctx.fillText(node.subtitle, node.x, node.y + 12);

            // Status Badge on top-right of node
            if (isActive) {
                ctx.font = 'bold 9px monospace';
                ctx.fillStyle = node.color;
                ctx.fillText(node.status, node.x, node.y - node.h / 2 - 5);
            }

            ctx.textAlign = 'left';
        });

        // 5. Bottom Live Telemetry Log Area (y: 310 to 470)
        const logTop = 310;
        const logHeight = H - logTop - 12;
        const logW = W - 32;

        ctx.fillStyle = '#070b14';
        ctx.beginPath();
        ctx.roundRect(16, logTop, logW, logHeight, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Log Header Bar
        ctx.fillStyle = '#0d1322';
        ctx.beginPath();
        ctx.roundRect(16, logTop, logW, 26, [8, 8, 0, 0]);
        ctx.fill();

        ctx.font = '700 10px monospace';
        ctx.fillStyle = '#64748b';
        ctx.fillText('RUNTIME EXECUTION TELEMETRY', 28, logTop + 17);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('SYNC: PC_TERMINAL ⟷ GRAPH', W - 28, logTop + 17);
        ctx.textAlign = 'left';

        // Log lines
        const logStartY = logTop + 46;
        const logLineH = 22;

        this.logs.slice(0, 5).forEach((entry, idx) => {
            const entryY = logStartY + idx * logLineH;

            // Timestamp
            ctx.font = '500 11px monospace';
            ctx.fillStyle = '#475569';
            ctx.fillText(entry.time, 28, entryY);

            // Tag badge
            ctx.fillStyle = '#38bdf8';
            ctx.fillText(`[${entry.tag || 'SYS'}]`, 92, entryY);

            // Log text
            ctx.fillStyle = '#e2e8f0';
            ctx.fillText(entry.text, 150, entryY);
        });

        // Notify Three.js to upload updated canvas texture
        this.texture.needsUpdate = true;
    }

    getBezierPoint(x0, y0, x1, y1, x2, y2, x3, y3, t) {
        const cx = 3 * (x1 - x0);
        const bx = 3 * (x2 - x1) - cx;
        const ax = x3 - x0 - cx - bx;

        const cy = 3 * (y1 - y0);
        const by = 3 * (y2 - y1) - cy;
        const ay = y3 - y0 - cy - by;

        const tSquared = t * t;
        const tCubed = tSquared * t;

        return {
            x: (ax * tCubed) + (bx * tSquared) + (cx * t) + x0,
            y: (ay * tCubed) + (by * tSquared) + (cy * t) + y0
        };
    }

    destroy() {
        if (this.material) this.material.dispose();
        if (this.texture) this.texture.dispose();
    }
}
