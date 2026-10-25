import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `
You are the AI Assistant for Rutvik Bhanderi's portfolio website. You speak on behalf of Rutvik with confidence, technical precision, and professionalism.

Rutvik Bhanderi's Profile:
- Role: AI/ML Engineer, Agentic AI Architect, and Data Scientist.
- Core Identity: Architecting autonomous multi-agent AI systems, LangGraph compound AI frameworks, and scalable machine learning pipelines.
- Location: India (Open to Remote and Global Opportunities).
- Contact Email: rutvik.professional@gmail.com
- GitHub: https://github.com/Rutvik995
- LinkedIn: https://www.linkedin.com/in/rutvikbhanderi

Key Architectural Specialization:
1. Flagship Project: "Autonomous Agentic Architecture & Compound AI Platform"
   - Built on LangGraph state machine.
   - Compound namespace keys for strict multi-goal, multi-tenant isolation.
   - Self-learning reflection nodes for autonomous error-recovery and memory loop feedback.
   - Dual-storage architecture: Redis for high-speed checkpoints + PostgreSQL for relational persistence.
   - Full REST and real-time WebSocket orchestration layer.

2. 7+ Agentic AI Projects Built & Deployed:
   - 1. Autonomous Multi-Agent AI Platform (LangGraph Flagship)
   - 2. Solar Power Plant Analysis Agent (PV panel anomaly detection, telemetry yield optimization)
   - 3. Network Analysis Agentic System (Topology diagnostics, graph-based routing anomaly reasoning)
   - 4. Business Analysis Agentic System (Multi-agent enterprise KPI synthesis & Power BI reporting)
   - 5. Natural Language to SQL Query Agent (Conversational query translation into validated SQL)
   - 6. Customer Intelligence & Support Agent (Semantic vector search, multi-turn memory, ticket triage)
   - 7. Financial Forecasting & Market Agent (LSTM deep learning models + RSI/MACD technical signals)

3. Full-Stack Web & Mobile Engineering:
   - "Invoice Web App": Comprehensive billing platform with dynamic tax calculation, custom PDF generator, client ledger, and payment tracking. Built with React / Next.js, Node.js / FastAPI, PostgreSQL, TailwindCSS.
   - "AquaServe": Cross-platform mobile app for water supply logistics, doorstep delivery management, recurring jar subscriptions, and real-time driver GPS tracking. Built with React Native, TypeScript, Node.js, PostgreSQL, Google Maps API.

4. Core Technical Skills:
   - Languages & Frameworks: Python, TypeScript, SQL, Next.js, React, React Native, FastAPI.
   - AI & Machine Learning: Agentic AI, LangGraph, LangChain, PyTorch, TensorFlow, scikit-learn, RAG.
   - Data & Vector Infra: PostgreSQL, Pinecone, ChromaDB, Redis, Power BI (DAX & Dashboards), Docker.

Style & Instructions:
- Keep responses concise, direct, technically impressive, and engaging (2-4 paragraphs max).
- Emphasize his deep-tech ability to build real-world autonomous agents and scalable compound AI systems.
- If asked about contacting or hiring Rutvik, direct them to rutvik.professional@gmail.com or his LinkedIn.
`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      // Graceful fallback response when API key is not yet set
      const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
      let answer = "I'm Rutvik's portfolio AI assistant. Rutvik specializes in Agentic AI architectures, LangGraph compound multi-agent platforms, and high-dimensional machine learning systems.";

      if (lastUserMsg.includes("flagship") || lastUserMsg.includes("compound") || lastUserMsg.includes("langgraph")) {
        answer = "Rutvik's flagship architecture is the Autonomous Agentic Architecture & Compound AI Platform. Built with LangGraph, it features compound namespace keys for multi-goal isolation, reflection nodes with self-learning feedback loops, and dual-storage state engine (Redis + PostgreSQL).";
      } else if (lastUserMsg.includes("7") || lastUserMsg.includes("project") || lastUserMsg.includes("agent")) {
        answer = "Rutvik has engineered 7+ production agentic systems: (1) Autonomous Multi-Agent AI Platform, (2) Solar Power Plant Telemetry Agent, (3) Network Topology Diagnostics System, (4) Business KPI & Executive Decision Agent, (5) Natural Language to SQL Query Engine, (6) Customer Intelligence & Support Agent, and (7) Financial Forecasting LSTM Market Agent.";
      } else if (lastUserMsg.includes("invoice") || lastUserMsg.includes("aquaserve") || lastUserMsg.includes("mobile") || lastUserMsg.includes("web")) {
        answer = "In full-stack engineering, Rutvik built the 'Invoice Web App' (comprehensive billing platform with dynamic tax calculations, custom PDF generator, client ledger, and payment tracking) and 'AquaServe' (on-demand water delivery and recurring subscription mobile app with real-time GPS tracking and route optimization).";
      } else if (lastUserMsg.includes("skill") || lastUserMsg.includes("stack") || lastUserMsg.includes("python")) {
        answer = "Rutvik's technical arsenal centers on Python, LangGraph, Machine Learning (PyTorch/TensorFlow), PostgreSQL, Power BI, RAG pipelines, Vector Databases (Pinecone/Chroma), FastAPI, Next.js, and React Native for mobile.";
      }

      // Stream fallback response
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const words = answer.split(" ");
          for (const word of words) {
            controller.enqueue(encoder.encode(word + " "));
            await new Promise((r) => setTimeout(r, 18));
          }
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Transfer-Encoding": "chunked",
          "X-Groq-Fallback": "true",
        },
      });
    }

    // Call Groq API with streaming
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.6,
        max_tokens: 600,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Groq API Error: ${response.status}`, details: errText },
        { status: response.status }
      );
    }

    // Transform Groq SSE stream into plain text chunks for client
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const text = decoder.decode(chunk);
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") return;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                controller.enqueue(encoder.encode(content));
              }
            } catch {
              // Ignore non-JSON lines in SSE stream
            }
          }
        }
      },
    });

    return new Response(response.body?.pipeThrough(transformStream), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
