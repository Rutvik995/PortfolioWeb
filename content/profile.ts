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
  bio: string[];
  principles: {
    number: string;
    title: string;
    body: string;
  }[];
  stackGroups: {
    category: string;
    qualifier: string;
    items: string[];
  }[];
  timeline: {
    year: string;
    role: string;
    organization: string;
    description: string;
    isEducation?: boolean;
  }[];
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
      items: ["FastAPI", "Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js", "Docker", "Git"],
    },
  ],
  timeline: [
    {
      year: "2024 — Present",
      role: "Lead Agentic AI Architect & Builder",
      organization: "Independent Systems Engineering",
      description:
        "Architecting Cortex, a 10-node autonomous LangGraph agent platform featuring tiered memory digestion and compound tenant isolation. Consulting on enterprise NL-to-SQL data pipelines and custom agent harnesses.",
    },
    {
      year: "2024 — 2025",
      role: "ML & Diagnostics Engineer",
      organization: "Solar Generation Telemetry Project",
      description:
        "Developed hierarchical plant → block → inverter diagnostic pipeline covering 5 utility-scale solar farms across 113 days of SCADA data. Built golden SQL test suites and automated degradation detection.",
    },
    {
      year: "2023 — 2024",
      role: "Full-Stack & Mobile Developer",
      organization: "Logistics & Invoicing Applications",
      description:
        "Engineered AquaServe water delivery subscription and driver GPS routing platform. Developed Invoice Web App with automated GST tax calculation and dynamic client ledger tracking.",
    },
    {
      year: "2022 — 2024",
      role: "MSc in Data Science",
      organization: "Academic Degree",
      description:
        "Specialized in high-dimensional statistical modeling, deep learning architectures, time-series forecasting, and relational database systems.",
      isEducation: true,
    },
  ],
  dryWit: {
    currently: "Currently: hardening Cortex, a multi-tenant agent platform, before launch.",
    footerNote: "Typeset with care. No LLM was harmed in the formatting of these 1px rules.",
    notfoundQuote: "404: The requested node does not exist in the state machine. Perhaps it was pruned by garbage collection.",
  },
};
