/**
 * Portfolio Configuration File
 * ─────────────────────────────────────────────────────────────────────────────
 * Central configuration for editable portfolio texts, motivational quotes,
 * links, code displays, and 3D camera presets.
 */

export interface PortfolioConfig {
  developer: {
    name: string;
    role: string;
    tagline: string;
    avatarUrl: string;
    status: string;
    socials: {
      github: string;
      linkedin: string;
      twitter: string;
      email: string;
    };
  };
  quotePoster: {
    quote: string;
    author: string;
    subtext: string;
  };
  screenCode: {
    filename: string;
    lines: Array<{
      tokens: Array<{ text: string; color: string }>;
    }>;
  };
  sections: Array<{
    id: string;
    title: string;
    subtitle: string;
    description: string;
    tags: string[];
    link?: string;
  }>;
  camera: {
    initialPosition: [number, number, number];
    initialTarget: [number, number, number];
    zoomInTarget: [number, number, number];
    fov: number;
  };
  lighting: {
    ambientColor: string;
    ambientIntensity: number;
    moonlightColor: string;
    moonlightIntensity: number;
    deskLampColor: string;
    deskLampIntensity: number;
  };
}

export const portfolioConfig: PortfolioConfig = {
  developer: {
    name: "Rutvik Bhanderi",
    role: "Full Stack & AI Engineer",
    tagline: "Architecting intelligent systems, distributed apps & immersive WebGL experiences.",
    avatarUrl: "/models/character.glb",
    status: "Available for high-impact opportunities",
    socials: {
      github: "https://github.com/Rutvik995",
      linkedin: "https://linkedin.com/in/rutvik-bhanderi",
      twitter: "https://x.com/rutvik_dev",
      email: "mailto:rutvik.professional@gmail.com",
    },
  },

  quotePoster: {
    quote: "Simplicity is prerequisite for reliability.",
    author: "Edsger W. Dijkstra",
    subtext: "System Architecture & Engineering Excellence",
  },

  screenCode: {
    filename: "intelligence_engine.ts",
    lines: [
      {
        tokens: [
          { text: "import ", color: "#c792ea" },
          { text: "{ Agent, VectorDB } ", color: "#ffcb6b" },
          { text: "from ", color: "#c792ea" },
          { text: "'@cortex/ai'", color: "#c3e88d" },
          { text: ";", color: "#89ddff" },
        ],
      },
      {
        tokens: [
          { text: "import ", color: "#c792ea" },
          { text: "* as Three ", color: "#ffcb6b" },
          { text: "from ", color: "#c792ea" },
          { text: "'three'", color: "#c3e88d" },
          { text: ";", color: "#89ddff" },
        ],
      },
      { tokens: [{ text: "", color: "#ffffff" }] },
      {
        tokens: [
          { text: "export class ", color: "#c792ea" },
          { text: "RutvikPortfolio ", color: "#82aaff" },
          { text: "{", color: "#89ddff" },
        ],
      },
      {
        tokens: [
          { text: "  public readonly ", color: "#c792ea" },
          { text: "stack ", color: "#eeffff" },
          { text: "= [", color: "#89ddff" },
          { text: "'Next.js', 'PyTorch', 'R3F'", color: "#c3e88d" },
          { text: "];", color: "#89ddff" },
        ],
      },
      {
        tokens: [
          { text: "  async ", color: "#c792ea" },
          { text: "compileAutonomousCore", color: "#82aaff" },
          { text: "(): ", color: "#89ddff" },
          { text: "Promise<Engine> ", color: "#ffcb6b" },
          { text: "{", color: "#89ddff" },
        ],
      },
      {
        tokens: [
          { text: "    const ", color: "#c792ea" },
          { text: "agent ", color: "#eeffff" },
          { text: "= new Agent({ memory: 'vector', stream: true });", color: "#89ddff" },
        ],
      },
      {
        tokens: [
          { text: "    return await ", color: "#c792ea" },
          { text: "agent.optimizeLatentSpace();", color: "#82aaff" },
        ],
      },
      {
        tokens: [{ text: "  }", color: "#89ddff" }],
      },
      {
        tokens: [{ text: "}", color: "#89ddff" }],
      },
    ],
  },

  sections: [
    {
      id: "about",
      title: "About Me",
      subtitle: "Full Stack & AI/ML Specialist",
      description:
        "Building production-grade distributed full stack web platforms, real-time 3D web applications, and fine-tuned AI neural pipelines with a relentless focus on performance and craft.",
      tags: ["TypeScript", "Next.js", "Python", "PyTorch", "WebGL / Three.js", "Docker"],
      link: "#about",
    },
    {
      id: "projects",
      title: "Featured Projects",
      subtitle: "Autonomous Agents & High-Performance Web",
      description:
        "Engineered Cortex AI multi-agent workspace, deep neural leaf disease classifier with 98.4% validation accuracy, and interactive 3D WebGL digital twins.",
      tags: ["Cortex AI", "Vision ML", "3D Room Diorama", "Vector DB"],
      link: "#projects",
    },
    {
      id: "experience",
      title: "Experience & Craft",
      subtitle: "Production Engineering & Architecture",
      description:
        "Over 3 years designing modern scalable architectures, optimizing GPU render loops, reducing bundle sizes, and shipping reliable client-facing products.",
      tags: ["Distributed Systems", "GPU Shaders", "Clean Architecture", "CI/CD"],
      link: "#experience",
    },
    {
      id: "contact",
      title: "Get In Touch",
      subtitle: "Collaborations & Inquiries",
      description:
        "Interested in building something groundbreaking together? Open for full-time roles, strategic consulting, and ambitious creative engineering ventures.",
      tags: ["rutvik.professional@gmail.com", "GitHub: @Rutvik995"],
      link: "#contact",
    },
  ],

  camera: {
    initialPosition: [5.8, 4.4, 6.2],
    initialTarget: [0.3, 1.2, 0.2],
    zoomInTarget: [-0.15, 1.25, 0.75],
    fov: 38,
  },

  lighting: {
    ambientColor: "#0a1329",
    ambientIntensity: 0.85,
    moonlightColor: "#82a4ff",
    moonlightIntensity: 2.2,
    deskLampColor: "#ffaa3b",
    deskLampIntensity: 4.8,
  },
};
