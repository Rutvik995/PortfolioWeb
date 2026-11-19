# 🌌 Rutvik Bhanderi — Cinematic 3D Night Developer Room Portfolio

An interactive, photorealistic-stylized 3D hero section built with **Next.js (App Router)**, **TypeScript**, **Three.js**, **React Three Fiber (R3F)**, **Drei**, **Postprocessing**, and **Tailwind CSS**.

---

## 🏗️ Tech Stack

- **Framework:** Next.js 15+ (App Router) + TypeScript
- **3D Engine:** Three.js `r187+`, `@react-three/fiber` (v9), `@react-three/drei` (v10)
- **Postprocessing:** `@react-three/postprocessing` (Selective Bloom, Vignette, ACES Filmic ToneMapping, Film Grain)
- **Animation & Controls:** Procedural `useFrame` physics & skeletal rig loops, mouse parallax, and scroll-driven zoom
- **Styling:** Tailwind CSS v4
- **Deployment:** Vercel ready (static route generation & dynamic SSR-safe canvas loading)

---

## 📁 Project Architecture & Folder Structure

```
portfolio-web/
├── public/
│   ├── models/
│   │   ├── character.glb         <-- 3D Rigged Developer Avatar (PBR, Long Hair, Hoodie)
│   │   └── model.glb             <-- Fallback avatar asset
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── globals.css           <-- Dark theme base & custom scrollbar
│   │   ├── layout.tsx            <-- Metadata & root HTML structure
│   │   └── page.tsx              <-- Dynamic lazy-loaded Canvas & scroll progress tracker
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── HeroScene.tsx     <-- WebGL Canvas, CameraRig, Stars, Suspense loader
│   │   │   ├── Room.tsx          <-- 2-Wall isometric cutaway, beveled slab, oak floor
│   │   │   ├── Character.tsx     <-- Humanoid GLB loader, seated pose, typing & breathing
│   │   │   ├── DeskArea.tsx      <-- L-shaped walnut desk, dual code/graph screens, chair, cables
│   │   │   ├── DeskLamp.tsx      <-- Anglepoise brass lamp, warm 2800K light cone, toggle
│   │   │   ├── CoffeeSteam.tsx   <-- Hot coffee mug with continuous rising wavy steam particles
│   │   │   ├── WindowCity.tsx    <-- Window, red pleated tied curtains, radiator, night skyline
│   │   │   ├── WorkWall.tsx      <-- Real-time clock (new Date()), quote poster, bookshelf
│   │   │   ├── Lighting.tsx      <-- Deep blue moonlight, hemisphere fill, bounce lights
│   │   │   └── PostProcessingEffects.tsx <-- Bloom, Vignette, ToneMapping, Noise
│   │   └── ui/
│   │       └── HeroUI.tsx        <-- Navbar, 3D hotspots, interactive portfolio section modals
│   └── config/
│       └── portfolio.config.ts   <-- Central configuration for texts, quotes, code, camera & lights
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## ⚙️ Central Configuration File (`src/config/portfolio.config.ts`)

All user-facing texts, motivational quotes, code editor snippets, and camera presets can be tuned in one place:

```typescript
export const portfolioConfig = {
  developer: {
    name: "Rutvik Bhanderi",
    role: "Full Stack & AI Engineer",
    tagline: "Architecting intelligent systems, distributed apps & immersive WebGL experiences.",
    status: "Available for high-impact opportunities",
    socials: { ... }
  },
  quotePoster: {
    quote: "Simplicity is prerequisite for reliability.",
    author: "Edsger W. Dijkstra",
    subtext: "System Architecture & Engineering Excellence"
  },
  screenCode: {
    filename: "intelligence_engine.ts",
    lines: [ ... ]
  },
  camera: {
    initialPosition: [5.8, 4.4, 6.2],
    initialTarget: [0.3, 1.2, 0.2],
    zoomInTarget: [-0.15, 1.25, 0.75],
    fov: 38
  },
  lighting: { ... }
};
```

---

## 🧍 Rigged 3D Character (`/public/models/character.glb`)

### Where to Place the File:
Place your rigged `.glb` model at:
```
public/models/character.glb
```

### Bone & Node Naming Specification:
The skeletal rig in `Character.tsx` automatically binds to any humanoid character with standard Mixamo / Avaturn / ReadyPlayerMe bone hierarchies:
- **Head & Neck:** `Head`, `Neck` (driven with micro-rotations and monitor glancing)
- **Spine & Chest:** `Spine`, `Spine1`, `Spine2` (driven with natural breathing expansion)
- **Arms & Forearms:** `LeftArm`, `RightArm`, `LeftForeArm`, `RightForeArm`
- **Hands:** `LeftHand`, `RightHand` (driven with alternating 14 Hz typing keypresses)
- **Legs:** `LeftUpLeg`, `RightUpLeg`, `LeftLeg`, `RightLeg` (configured in a natural 90° seated desk pose)

### Automatic Material Optimization:
- **Upper Body / Clothing:** Automatically tuned to rich matte brown knitwear (`#452b1b`, roughness `0.92`, metalness `0.0`)
- **Skin:** Enhanced with soft PBR subsurface feel (roughness `0.54`, metalness `0.02`)
- **Face & Hair:** Receives soft cyan light reflection from the code monitors and warm golden rim light from the desk lamp

---

## 💡 Lighting & Material Tuning Guide

1. **Desk Lamp Key Light (`DeskLamp.tsx`):**
   - Color: `#ffaa3b` (2800K warm amber)
   - Emissive Intensity: `5.5`
   - PointLight: `intensity={4.8}`, `distance={5.5}`
   - SpotLight: `intensity={6.2}`, `angle={0.65}`, casts crisp soft shadow on keyboard and desk surface.
   - Click the lamp in 3D to toggle the light on/off interactively.

2. **Monitors Screen Glow (`DeskArea.tsx`):**
   - Primary Code Screen: `emissive="#38bdf8"`, `emissiveIntensity={1.3}`
   - Secondary Graph Screen: `emissive="#38bdf8"`, `emissiveIntensity={1.1}`
   - Soft forward PointLight: `intensity={1.8}`, colors the developer's face.

3. **Moonlight Through Window (`Lighting.tsx`):**
   - Directional light from `[-6.5, 5.2, -4.5]` with color `#82a4ff` and `intensity={2.2}`.
   - Casts long, atmospheric diagonal moonlit shadows across the oak floor and desk.

---

## 🚀 Run & Deployment Instructions

### 1. Local Development
```bash
# Navigate to the project directory
cd portfolio-web

# Install dependencies (if not already installed)
npm install

# Start the Next.js development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Production Build
```bash
npm run build
npm run start
```

### 3. Vercel Deployment
1. Push your repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com/new), select your repository.
3. If `portfolio-web` is in a subfolder, set the **Root Directory** to `portfolio-web`.
4. Click **Deploy**. Vercel will automatically detect Next.js App Router and deploy at the edge.
