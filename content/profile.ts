export interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  location: string;
  mode: "On-site" | "Remote" | "Hybrid";
  bullets: string[];
  skillsLine: string;
}

export interface Profile {
  name: string;
  role: string;
  location: string;
  availability: string;
  email: string;
  github: string;
  githubRepos: string;
  linkedin: string;
  resumeUrl: string;
  showPhoto: boolean; // Config flag: off by default per strict NO IMAGES rule
  bio: string[];
  principles: {
    number: string;
    title: string;
    body: string;
  }[];
  experiences: ExperienceItem[];
  stackGroups: {
    category: string;
    qualifier: string;
    items: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    year: string;
    note: string;
  };
  certifications: string[];
  dryWit: {
    currently: string;
    footerNote: string;
    notfoundQuote: string;
  };
}

export const profile: Profile = {
  name: "Rutvik Bhanderi",
  role: "AI Systems Engineer",
  location: "Rajkot, India",
  availability: "Open to AI/ML engineering roles (remote or on-site) and select freelance projects.",
  email: "rutvik.professional@gmail.com",
  github: "https://github.com/Rutvik995",
  githubRepos: "https://github.com/Rutvik995?tab=repositories",
  linkedin: "https://www.linkedin.com/in/rutvikbhanderi",
  resumeUrl: "/resume.pdf", // [[FILL: replace with your actual resume path or link]]
  showPhoto: false, // Strict NO IMAGES rule: false by default
  bio: [
    "I'm an AI systems engineer based in Rajkot, India. I specialize in taking autonomous multi-agent systems out of research notebooks and engineering the databases, state machines, APIs, and interfaces required to make them operate reliably in production.",
    "My focus centers on compound AI architectures: building deterministic multi-step pipelines with LangGraph, designing tiered memory compaction engines that preserve context windows, and isolating tenant execution via compound state keys.",
    "When I'm not debugging non-deterministic agent DAG loops or profiling PostgreSQL indexes, I'm usually studying distributed systems papers or reading about renewable energy grid analytics.",
  ],
  principles: [
    {
      number: "01",
      title: "Isolate state per user and goal",
      body: "Sessions must be partitioned with compound keys (tenant_id, user_id, goal_id). An agent working on inventory analysis must never leak context or poison memory in another active goal.",
    },
    {
      number: "02",
      title: "Verify tool outputs before synthesizing",
      body: "Never feed raw tool outputs directly back to the user without schema validation and safety checks. If a database query fails or returns empty rows, the agent must acknowledge the ground truth instead of hallucinating plausible filler.",
    },
    {
      number: "03",
      title: "Make failure explicit instead of silently falling back",
      body: "When an agent reaches an unresolvable ambiguity or exceeds its reasoning step budget, it must halt and request human clarification with exact context, rather than guessing blindly.",
    },
    {
      number: "04",
      title: "Test with recorded golden datasets",
      body: "Agentic systems cannot be validated by manual chatting. Every critical prompt, conditional edge, and tool call is tested against version-controlled golden traces and AST-verified query assertions.",
    },
  ],
  experiences: [
    {
      role: "Artificial Intelligence Engineer (Internship)",
      company: "Innovation Intellect Pvt Ltd",
      period: "Apr 2026 – Jun 2026",
      location: "Bhuj, Gujarat",
      mode: "On-site",
      bullets: [
        "Built autonomous multi-agent systems for real-time data analysis and workflow automation, connecting IoT systems directly to natural-language interfaces.",
        "Engineered natural-language IoT control pipelines enabling operators to command industrial hardware and trigger live telemetry operations in both English and Hindi.",
        "Formulated predictive analytics models to forecast operational trends, coupled with dynamic data visualizations that transform live sensor telemetry into actionable operator decisions.",
        "Constructed knowledge-base querying systems for automated root-cause troubleshooting and operational decision support.",
      ],
      skillsLine: "Agentic AI development, data analysis, NLP, IoT interfaces, predictive modeling [[FILL: additional LinkedIn skills]]",
    },
    {
      role: "Android Developer (Internship)",
      company: "Shreesoftech",
      period: "Dec 2025 – Feb 2026",
      location: "Bhuj, Gujarat",
      mode: "Remote",
      bullets: [
        "Developed native Android client features with Kotlin, implementing reactive UI state flows and RESTful endpoint synchronization.",
        "Collaborated on mobile architecture, offline-first data caching, and asynchronous background services for enterprise field applications.",
        "[[FILL: 2-3 additional sentences on what you built at Shreesoftech from LinkedIn]]",
      ],
      skillsLine: "Android, Kotlin, Mobile Architecture, REST APIs, SQLite / Room [[FILL]]",
    },
  ],
  stackGroups: [
    {
      category: "Orchestration & Agent Engines",
      qualifier: "StateGraph state machines, structured multi-agent coordination, tool harnesses",
      items: ["LangGraph", "LangChain", "StateGraph", "Pydantic Schemas", "Tool Calling"],
    },
    {
      category: "Data, Databases & Storage",
      qualifier: "Relational persistence, time-series indexing, vector stores, caching",
      items: ["PostgreSQL", "psycopg2", "Redis", "Pinecone", "ChromaDB", "Pandas", "Power BI"],
    },
    {
      category: "Models & Reasoning Providers",
      qualifier: "Inference pipelines, open models, local and cloud LLM endpoints",
      items: ["OpenAI API", "Groq LPU (Llama 3)", "Google Gemini API", "PyTorch", "TensorFlow / Keras (LSTM)"],
    },
    {
      category: "Product & Infrastructure",
      qualifier: "Production APIs, full-stack web and mobile interfaces, deployment containers",
      items: ["FastAPI", "Next.js", "React", "TypeScript", "Tailwind CSS", "Android / Kotlin", "Docker", "Git"],
    },
  ],
  education: {
    degree: "MSc in Data Science",
    institution: "Academic Graduate Program",
    year: "2022 — 2024",
    note: "Specialized in high-dimensional statistical modeling, time-series forecasting, and relational database systems. [[ASK RUTVIK: display or omit]]",
  },
  certifications: [
    "Deep Learning Specialization (DeepLearning.AI) [[CONFIRM]]",
    "PostgreSQL Database Administration & High Availability [[CONFIRM]]",
    "LangChain & LangGraph Production Systems Certification [[CONFIRM]]",
  ],
  dryWit: {
    currently: "Currently: hardening Cortex, a multi-tenant agent platform, before launch.",
    footerNote: "Typeset with care. No LLM was harmed in the formatting of these 1px rules.",
    notfoundQuote: "404: The requested node does not exist in the state machine. Perhaps it was pruned by garbage collection.",
  },
};
