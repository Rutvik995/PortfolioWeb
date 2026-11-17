export interface Note {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  summary: string;
  content: string;
}

export const notes: Note[] = [
  {
    slug: "why-my-agent-invented-tool-names",
    title: "Why my agent invented tool names, and what fixed it",
    date: "November 2024",
    readTime: "4 min read",
    summary:
      "Free-form system prompts invite hallucinated tool schemas. Here is how switching from string matching to Pydantic router validation and explicit reflection loops eliminated invalid calls.",
    content: `When building early prototypes of Cortex, our multi-agent platform, we encountered a frustrating failure mode: the orchestrator agent would invent plausible-sounding tool names.

If a user asked for an equity price, instead of selecting our registered \`fetch_stock_quote(symbol)\` tool, the model would confidently emit a call to \`get_market_equity_price_v2(ticker=...)\`. Because the model understood the underlying intent, it assumed the tool must exist.

### The Problem with Prompt-Based Enforcement
Originally, we attempted to fix this in the prompt:
> *"You have access only to the tools listed below. Do NOT make up any other tool names."*

This reduced the frequency from ~28% of runs to around 15%, but it remained fundamentally fragile. When task decomposition grew complex—such as coordinating four domain tools across three sub-goals—the model's attention diluted, and hallucinated tool names returned.

### The Fix: Pydantic Validation & Reflection Loops
The solution was not more prompt adjectives, but deterministic compiler-like validation at the LangGraph node boundary:

1. **Strict Structured Output Schemas**: We migrated the routing node from free-text extraction to OpenAI/Groq JSON-mode structured outputs bound strictly to an enum of registered tool identifiers:
\`\`\`python
class ToolSelection(BaseModel):
    tool_name: Literal["fetch_stock_quote", "query_sql_db", "vector_search", "web_scrape"]
    arguments: dict[str, Any]
\`\`\`

2. **The Reflection Error Tripwire**: If an agent attempts an unregistered invocation, execution does *not* crash silently or fall back to an apology. Instead, LangGraph immediately directs the state along a conditional edge to a **Reflection Node**.

3. **Feeding Compiler Errors Back to the LLM**: The reflection node writes an explicit compiler diagnostic back into the state:
\`\`\`json
{
  "status": "error",
  "detail": "Tool 'get_market_equity_price_v2' is not registered. Available tools: ['fetch_stock_quote', ...]. Re-select from the approved enum."
}
\`\`\`

When the router runs on its next iteration, it sees the exact validation error and corrects itself on the second attempt over 97% of the time.

**The takeaway**: Treat LLM tool calling like a typed compiler. Never trust string parsing when a strict schema validator and an explicit feedback loop can catch errors deterministically.`,
  },
  {
    slug: "four-tier-memory-without-blowing-context",
    title: "Four-tier memory without blowing the context window",
    date: "December 2024",
    readTime: "5 min read",
    summary:
      "Naively appending raw conversation turns into vector search produces retrieval noise. Here is how we structured Cortex's tiered memory from verbatim turns down to a permanent verified facts store.",
    content: `The most common way developers handle agent memory is naive vectorization: every single user prompt and agent response is embedded and saved into Pinecone or Chroma. Whenever a new question arrives, the system queries top-k cosine similarity.

In production, this degrades rapidly:
- Old constraints override newer ones (e.g. "Actually, change the target to Q4" retrieved alongside "Focus strictly on Q1").
- Intermediate tool outputs (like 200 rows of raw JSON from an SQL query) bloat the embedding index with low-signal tokens.
- Costs explode as context windows fill with redundant conversational fluff.

### The Four-Tier Architecture
To solve this in Cortex, we designed a tiered memory digestion engine inspired by biological sleep consolidation:

\`\`\`
[ Tier 1: Active Session ]  --> Raw verbatim messages (last 8-12 turns)
            |
            v  (Periodic digestion pass)
[ Tier 2: Weekly Digest ]   --> Structured JSON of active project goals & decisions
            |
            v  (Consolidation pass)
[ Tier 3: Semantic Archive] --> Vectorized high-level milestones
            |
            v  (User confirmation / extraction)
[ Tier 4: Permanent Facts ] --> Hard key-value facts store (e.g. user constraints)
\`\`\`

#### Tier 1: Verbatim History
The active conversation window retains the last 8 to 12 turns verbatim. This ensures immediate conversational pronouns ("it", "that one", "the second row") resolve correctly.

#### Tier 2: Weekly Digest
When a goal session exceeds 15 turns, a lightweight background summarizer aggregates the turns into a structured digest: key decisions made, tools executed, and open action items. The raw turns are archived out of the active prompt.

#### Tier 3: Semantic Archive
Long-term historical goals are embedded as semantic summaries rather than raw dialogue. When an agent needs background on a project from three weeks ago, it retrieves a clean 200-word executive summary rather than 80 disconnected chat turns.

#### Tier 4: The Permanent Facts Store
Certain information must never be subject to probabilistic retrieval: API endpoints, preferred formatting styles, tenant isolation IDs, and persistent financial baselines. These live in an explicit PostgreSQL key-value store, queried by deterministic lookup rather than similarity search.

**The result**: Cortex runs sessions with dozens of iterative steps while keeping active context tokens under 2,500, preserving both model reasoning fidelity and API budget.`,
  },
  {
    slug: "testing-non-deterministic-agent-dags",
    title: "Testing non-deterministic agent DAGs in production",
    date: "January 2025",
    readTime: "5 min read",
    summary:
      "You cannot unit-test an agent with live API calls without burning money and introducing flakiness. Here is how golden response recordings and AST SQL checks enabled a 232-test regression suite.",
    content: `Unit testing deterministic software is straightforward: input $A$ produces output $B$. But how do you write a test suite for an agentic system like our Solar Power Plant Analysis Agent, where models can rephrase SQL queries or choose slightly different intermediate reasoning steps?

If you hit live LLM endpoints during CI/CD, your builds become slow, costly, and subject to third-party API rate limits. If you mock the entire LLM with static return values, you test nothing of the agent's actual reasoning robustness.

### 1. Recorded Golden Cassettes (VCR for Agents)
We record production interaction traces using deterministic replay cassettes. During recording, all external LLM completions and database responses are saved as version-controlled JSON fixtures.

During CI test runs:
- If a pull request modifies system prompts or graph topology, the test harness verifies that the LangGraph StateGraph still traverses the correct conditional edges.
- If the agent branches unexpectedly, the test flags a regression before code reaches production.

### 2. AST Verification for Generated SQL
Instead of testing whether the generated SQL string matches a fixed string character-for-character, we parse the generated query into an Abstract Syntax Tree (AST):
- We verify that all required aggregations (e.g. \`SUM(ac_power)\`, \`AVG(ambient_temp)\`) are present.
- We assert that necessary \`WHERE\` clauses constraining dates and inverter IDs are strictly enforced.
- We mathematically prove no destructive operations (\`DROP\`, \`DELETE\`, \`UPDATE\`) exist in the parsed tree.

### 3. Numerical Tolerance on Inverter Financial Metrics
For the solar diagnostics agent, we compiled a golden evaluation dataset spanning 5 physical utility plants and 113 days of telemetry. The test suite verifies that synthesized daily yield forecasts stay within a $\pm 1.5\%$ variance of verified engineering calculations.

Today, this 232-test suite runs in under 12 seconds in CI without making a single live network call to an LLM provider.`,
  },
];
