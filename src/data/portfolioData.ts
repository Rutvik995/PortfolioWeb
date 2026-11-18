// ─────────────────────────────────────────────────────────────────────────────
// Portfolio Data — Rutvik Bhanderi
// AI/ML Engineer & Multi-Agent Systems Architect
// ─────────────────────────────────────────────────────────────────────────────

export const personalInfo = {
  name: 'Rutvik Bhanderi',
  title: 'AI/ML Engineer & Multi-Agent Systems Architect',
  bio: 'Building production-grade AI agents that plan, reason, and execute autonomously.',
  github: 'https://github.com/Rutvik995',
  linkedin: 'https://www.linkedin.com/in/rutvikbhanderi',
  email: 'rutvik.professional@gmail.com',
  location: 'Rajkot, India',
  status: 'Available for Work',
}

export const kineticSubtitles = [
  'Multi-Agent Orchestration',
  'LLM Pipelines',
  'Predictive Analytics',
  'Full-Stack AI',
  'LangGraph Systems',
  'RAG Architectures',
]

export interface Project {
  id: string
  name: string
  description: string
  tech: string[]
  github?: string
}

export const featuredProjects: Project[] = [
  {
    id: 'terrahive',
    name: 'TerraHive — Multi-Agent AI Orchestration Platform',
    description:
      'Multi-user, multi-goal AI agent platform built from scratch using Python, LangGraph, and structured Orchestrator, Worker, Synthesis, and Gatekeeper agent workflows. Agents collaborate autonomously to decompose complex goals, delegate execution, synthesize outputs, and validate results before returning structured responses.',
    tech: ['Python', 'LangGraph', 'Multi-Agent Systems', 'Pydantic', 'FastAPI', 'PostgreSQL', 'TypeScript', 'React'],
    github: 'https://github.com/Rutvik995',
  },
  {
    id: 'solar-agent',
    name: 'Solar Power Plant Analytics & Forecasting Engine',
    description:
      'Multi-agent diagnostic and predictive analytics pipeline built with LangGraph, Python, Pydantic, and PostgreSQL. Ingests daily telemetry across multi-acre solar plants to diagnose low generation, identify underperforming inverters, and forecast output with time-series modeling.',
    tech: ['LangGraph', 'Python', 'Pydantic', 'PostgreSQL', 'Predictive Analytics', 'Time-Series ML'],
    github: 'https://github.com/Rutvik995',
  },
  {
    id: 'export-engine',
    name: 'Automated Commercial Export & Packing Engine',
    description:
      'High-precision Python web system generating synchronized commercial export invoices and automated multi-vehicle weight-validated packing lists. Handles complex regulatory export document generation with strict validation and real-time weight distribution across vehicles.',
    tech: ['Python', 'FastAPI', 'PostgreSQL', 'PDF Generation', 'React', 'TypeScript'],
    github: 'https://github.com/Rutvik995',
  },
]

export const navItems = [
  { label: 'Overview', href: '#' },
  { label: 'AI/ML Projects', href: '#projects' },
  { label: 'Tech Stack', href: '#stack' },
  { label: 'GitHub', href: 'https://github.com/Rutvik995' },
  { label: 'Contact', href: '#contact' },
]

export const techStackCategories = [
  {
    name: 'AI/ML',
    skills: ['Python', 'LangGraph', 'Multi-Agent Systems', 'LLMs & Prompt Engineering', 'Pydantic', 'RAG', 'Vector Databases'],
  },
  {
    name: 'Backend',
    skills: ['PostgreSQL', 'FastAPI', 'Flask', 'Node.js', 'REST APIs', 'WebSockets'],
  },
  {
    name: 'Frontend',
    skills: ['TypeScript', 'React', 'Vite', 'Three.js', 'Tailwind CSS', 'React Native'],
  },
  {
    name: 'Tools',
    skills: ['Git', 'GitHub', 'Docker', 'Vercel', 'Linux'],
  },
]

export interface GitHubRepo {
  id: number
  name: string
  description: string | null
  language: string | null
  stargazers_count: number
  html_url: string
}

export const fallbackRepos: GitHubRepo[] = [
  {
    id: 1,
    name: 'TerraHive',
    description: 'Multi-Agent AI Orchestration Platform using LangGraph',
    language: 'Python',
    stargazers_count: 0,
    html_url: 'https://github.com/Rutvik995',
  },
  {
    id: 2,
    name: 'solar-analytics-agent',
    description: 'Multi-agent solar power plant diagnostic & forecasting engine',
    language: 'Python',
    stargazers_count: 0,
    html_url: 'https://github.com/Rutvik995',
  },
  {
    id: 3,
    name: 'export-packing-engine',
    description: 'Automated commercial export invoice & packing list generator',
    language: 'Python',
    stargazers_count: 0,
    html_url: 'https://github.com/Rutvik995',
  },
  {
    id: 4,
    name: 'PortfolioWeb',
    description: '3D interactive portfolio — night room scene built with React Three Fiber',
    language: 'TypeScript',
    stargazers_count: 0,
    html_url: 'https://github.com/Rutvik995/PortfolioWeb',
  },
  {
    id: 5,
    name: 'nl-to-sql-analyst',
    description: 'Natural language to SQL analytics agent with LLM + PostgreSQL',
    language: 'Python',
    stargazers_count: 0,
    html_url: 'https://github.com/Rutvik995',
  },
]
