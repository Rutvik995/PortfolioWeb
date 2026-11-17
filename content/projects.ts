export interface Project {
  slug: string;
  title: string;
  tagline: string;
  year: string;
  category: "Agentic AI" | "Data & Analytics" | "Full-Stack & Mobile";
  role: string;
  featured: boolean;
  repoUrl?: string;
  liveUrl?: string;
  demoUrl?: string;
  summary: string;
  stack: string[];
  systemFlow: string; // Plain-text mono representation of the execution pipeline
  // Deep case-study fields
  problem?: string;
  whatIBuilt?: string;
  architectureNotes?: string[];
  keyDecisions?: {
    decision: string;
    reasoning: string;
    tradeoff: string;
  }[];
  whatBrokeAndFix?: {
    issue: string;
    rootCause: string;
    resolution: string;
  }[];
  codeExcerpt?: {
    filename: string;
    language: string;
    code: string;
    annotation: string;
  };
  knownLimitations?: string[];
  metricsOrScope?: string;
}

export const projects: Project[] = [
  {
    slug: "cortex",
    title: "Cortex",
    tagline: "Autonomous multi-agent platform with tiered memory and multi-tenant isolation",
    year: "2025",
    category: "Agentic AI",
    role: "Architect & Lead Engineer",
    featured: true,
    repoUrl: "https://github.com/Rutvik995",
    summary:
      "A 10-node LangGraph autonomous agent platform engineered to execute multi-step user goals. Features dynamic tool creation, 4-tier memory digestion, and strict tenant isolation via compound namespace keys.",
    systemFlow:
      "request → goal_ingest → namespace_key → decompose → router (JSON) → tool_harness → validator → reflection → digest_store → stream_egress",
    stack: [
      "Python",
      "LangGraph",
      "LangChain",
      "FastAPI",
      "PostgreSQL",
      "React",
      "WebSocket",
    ],
    metricsOrScope: "10-node StateGraph · 4-tier memory engine · Multi-goal isolation",
    problem:
      "Most single-prompt LLM wrappers fail whenever a goal requires more than three sequential steps: they hallucinate tool schemas, lose track of intermediate state in long contexts, and cannot isolate memory across multiple parallel user goals. Additionally, standard agent frameworks combine agent checkpoint state with application business data, creating database deadlocks and making historical execution inspection messy.",
    whatIBuilt:
      "Designed and implemented Cortex (formerly Deep Agent), an autonomous platform based on LangGraph. Cortex decomposes incoming user objectives into a DAG of sub-tasks. It uses a dynamic tool harness that allows agents to synthesize specialized Python tools during runtime, sandboxes execution, and enforces multi-tenant goal boundaries. I separated the volatile LangGraph checkpointer storage from UI-facing customer tables, exposing a streaming WebSocket feed for real-time thought-token tracking.",
    architectureNotes: [
      "10-Node StateGraph: Ingestion → Context Retrieval → Plan Decomposition → Dynamic Router → Tool Execution Harness → Schema Validator → Reflection & Critique → Memory Compaction → Response Synthesizer → Stream Egress.",
      "Compound Namespace Keys: Sessions are partitioned by (tenant_id, user_id, goal_id). An agent cannot read or poison the state memory of another active goal.",
      "4-Tier Memory Architecture: (1) Verbatim message history for the active session, (2) Weekly rolling summaries, (3) Monthly semantic archive digests, and (4) Permanent verified facts store.",
      "Dual-Storage State Separation: Redis / checkpointer handles high-frequency StateGraph step checkpoints; PostgreSQL handles durable user accounts, goals, and chat transcripts.",
    ],
    keyDecisions: [
      {
        decision: "Structured JSON Output over Raw String Parsing for Tool Routing",
        reasoning:
          "Early iterations relied on prompt instructions for tool calling, which led to frequent regex extraction errors when models emitted conversational preambles.",
        tradeoff:
          "Slightly higher prompt token count per call due to strict schema definitions, but router failure dropped from ~18% to near zero.",
      },
      {
        decision: "Hierarchical Memory Compaction instead of a Single Vector Search",
        reasoning:
          "Throwing all raw conversation turns into a vector database leads to retrieval noise, where outdated user constraints override newer instructions.",
        tradeoff:
          "Requires a periodic background summarization pass that consumes small model tokens, but keeps the prompt context compact and chronologically accurate.",
      },
      {
        decision: "Separation of LangGraph Checkpointer from User-Facing API Tables",
        reasoning:
          "The LangGraph checkpointer emits heavy serialized payloads at every node step. Querying this directly from a web frontend caused sluggish REST latency.",
        tradeoff:
          "Requires an explicit egress node that writes clean, sanitized JSON events into the PostgreSQL chat tables.",
      },
    ],
    whatBrokeAndFix: [
      {
        issue: "Agent hallucinated non-existent tools and parameters during complex goal decomposition.",
        rootCause:
          "The system prompt listed all tools in free-form markdown, causing the LLM to invent plausible-sounding function names when uncertain.",
        resolution:
          "Enforced Pydantic schema validation at the router node. If the LLM produces a tool name not in the registry, the router immediately trips a reflection error node that feeds the validation failure back to the model before execution.",
      },
      {
        issue: "Circular dependency deadlock between Reflection and Router nodes.",
        rootCause:
          "A failing tool output caused the critique node to return to the router without decrementing a step budget, generating an infinite retry loop.",
        resolution:
          "Added an explicit iteration_depth counter to the StateGraph state. If depth exceeds 5, the execution branch routes to an explicit failure node requesting user intervention.",
      },
    ],
    codeExcerpt: {
      filename: "cortex/orchestration/state.py",
      language: "python",
      code: `class AgentState(TypedDict):
    tenant_id: str
    user_id: str
    goal_id: str
    active_plan: list[SubGoal]
    current_step_index: int
    iteration_depth: Annotated[int, operator.add]
    intermediate_tool_outputs: Annotated[list[ToolOutput], operator.add]
    error_tripwire: Optional[str]
    is_terminal: bool`,
      annotation:
        "The core StateGraph contract: compound keys ensure isolation, while iteration_depth trips an emergency circuit-breaker if reflection loops exceed 5 iterations.",
    },
    knownLimitations: [
      "Dynamic tool synthesis currently runs in a restricted subprocess rather than a microVM (e.g. Firecracker or gVisor); hardened sandboxing is in progress.",
      "Parallel DAG branch execution is currently bounded by the single-threaded WebSocket event loop.",
      "Long-running tasks over 15 minutes require a distributed job queue rather than keeping the WebSocket connection open.",
    ],
  },
  {
    slug: "solar-agent",
    title: "Solar Power Plant Analysis Agent",
    tagline: "Hierarchical telemetry diagnostics across plant, block, and inverter layers",
    year: "2025",
    category: "Agentic AI",
    role: "ML Engineer & Agent Architect",
    featured: true,
    repoUrl: "https://github.com/Rutvik995",
    summary:
      "Autonomous agent pipeline analysing solar generation across a 3-tier hierarchy: finds under-performing or faulted inverters, explains anomalies, and answers operator queries in plain English.",
    systemFlow:
      "telemetry_stream → scada_ingest → solar_hierarchy_tree → irradiation_correlator → inverter_anomaly_detector → ast_sql_guard → response_synthesizer",
    stack: [
      "Python",
      "LangGraph",
      "PostgreSQL",
      "FastAPI",
      "React (Vite)",
      "Groq-hosted open model",
      "Pandas",
    ],
    metricsOrScope: "5 utility-scale plants · 113 days of telemetry · 13k+ sensor rows · 232-test regression suite",
    problem:
      "Utility-scale solar farms produce thousands of continuous telemetry data points (DC/AC power, irradiation, ambient temperature, module temperature). Operations teams struggle to cross-correlate environmental irradiation with individual inverter degradation, often missing localized string outages and inverter efficiency drift until monthly utility reconciliations.",
    whatIBuilt:
      "Constructed a multi-agent diagnostic system orchestrating 4 specialized analytical agents and an SQL validator. The system ingests SCADA telemetry, maps the plant → block → inverter hierarchy, computes weather-adjusted theoretical yield against actual output, detects degradation patterns, and synthesizes root-cause summaries. Backed by a full 232-test suite including golden SQL verification, and a React dashboard featuring heatmaps, inverter leaderboards, and interactive 'Ask AI' dialogs for any specific asset.",
    architectureNotes: [
      "Hierarchy-Aware State: StateGraph models plants as trees (Plant → Array Blocks → Inverter Strings).",
      "Specialist Agent Suite: (1) Telemetry Ingestion Agent, (2) Irradiation Correlation Agent, (3) Anomaly & Fault Classifier, (4) Inverter Leaderboard Ranker, and (5) Response Synthesizer.",
      "SQL Guard Layer: Queries generated by LLMs are parsed with an AST parser to disallow destructive statements (DROP, UPDATE, INSERT) and ensure mandatory date range bounds.",
      "Golden SQL Testing: 232 automated test assertions comparing generated SQL logic against known ground-truth financial and yield calculations.",
    ],
    keyDecisions: [
      {
        decision: "SQL Generation against Normalized PostgreSQL rather than In-Memory Pandas for Telemetry",
        reasoning:
          "Loading 13k+ multi-sensor rows into memory for each agent call exhausted container RAM and was slow.",
        tradeoff:
          "Requires strict AST validation to prevent bad SQL, but allows sub-second query aggregation using PostgreSQL time-bucket indexes.",
      },
      {
        decision: "Groq-Hosted Llama-3 Models for Low-Latency Telemetry Q&A",
        reasoning:
          "Operators require interactive response times when diagnosing field alerts during generation hours.",
        tradeoff:
          "Open models require tighter system prompts and one-shot examples compared to GPT-4o, but reduce inference latency by ~70%.",
      },
    ],
    whatBrokeAndFix: [
      {
        issue: "Inverter degradation false positives on cloudy mornings.",
        rootCause:
          "The threshold calculation compared inverter output directly against peak rated capacity rather than solar pyranometer irradiation ratios.",
        resolution:
          "Added an environmental normalization stage: inverters are benchmarked strictly against neighboring inverters within the same physical block receiving identical ambient irradiation.",
      },
    ],
    codeExcerpt: {
      filename: "solar_agent/security/sql_guard.py",
      language: "python",
      code: `def validate_generated_query(sql_text: str) -> None:
    parsed = sqlglot.parse_one(sql_text, read="postgres")
    forbidden = {exp.Drop, exp.Delete, exp.Insert, exp.Update, exp.Truncate}
    if any(parsed.find_all(forbidden)):
        raise DisallowedOperationError("Mutating SQL statements are prohibited.")
    where_clause = parsed.find(exp.Where)
    if not where_clause or "date" not in str(where_clause).lower():
        raise MissingBoundsError("Queries must contain explicit date range predicates.")`,
      annotation:
        "The AST SQL guard parses generated SQL before execution: destructive operators trip immediate exceptions, and unbounded queries without date predicates are rejected.",
    },
    knownLimitations: [
      "Telemetry ingestion currently polls at 15-minute resolution; real-time 1-second inverter fault waveform analysis is planned for v2.",
      "Weather forecast integration relies on open APIs rather than dedicated on-site sky-facing camera models.",
    ],
  },
  {
    slug: "nl-to-sql",
    title: "Natural-Language-to-SQL Data Analyst",
    tagline: "Conversational query synthesis over star-schemas and complex JSON-blob databases",
    year: "2024",
    category: "Agentic AI",
    role: "Full-Stack AI Engineer",
    featured: true,
    repoUrl: "https://github.com/Rutvik995/DataAnalysis_Multi-Agentic-System",
    summary:
      "Enterprise database interrogation system that converts business questions into verified SQL queries, generates charts, and requests clarification when business metrics are ambiguous.",
    systemFlow:
      "user_prompt → catalog_inspector → ambiguity_detector → sql_planner → ast_explain_validator → db_executor → chart_synthesizer",
    stack: [
      "Python",
      "LangChain",
      "FastAPI",
      "PostgreSQL",
      "Chart.js",
      "React",
      "OpenAI API",
    ],
    metricsOrScope: "Star-schema sales DW + JSON invoice database · Zero schema hallucination",
    problem:
      "Business stakeholders constantly queue requests to data engineers for basic analytical reports. Traditional text-to-SQL tools fail when schemas contain ambiguous table names, denormalized JSON columns, or when user questions omit vital filters (e.g. 'What were sales last quarter?' without specifying gross vs. net revenue).",
    whatIBuilt:
      "Engineered an interactive conversational analytics pipeline demonstrated across two distinct production databases: (1) an analytical sales data warehouse with a star schema (fact_sales + date, product, customer, employee, and region dimensions), and (2) an export enterprise database containing nested invoice JSON payloads. The system inspects DB catalogs, generates candidate SQL, validates syntax against dry-run EXPLAIN plans, renders auto-selected charts, and asks explicit clarifying questions when user intent lacks critical parameters.",
    architectureNotes: [
      "Catalog Introspection: Extracts table structures, foreign keys, column comments, and sample categorical values.",
      "Ambiguity Detection Node: If a prompt has multiple valid business definitions, the agent halts execution and returns a structured clarification question.",
      "Dry-run EXPLAIN Validation: All queries execute with EXPLAIN before running against the database to catch syntax errors and prohibit unindexed table scans.",
      "Dual Schema Adaptability: Successfully handles both strict 3NF/star-schemas and PostgreSQL jsonb document querying.",
    ],
    keyDecisions: [
      {
        decision: "Ask for Clarification instead of Guessing Default Filters",
        reasoning:
          "Guessing business metrics leads to silent discrepancies in executive decision-making.",
        tradeoff:
          "Adds an extra conversational turn for under-specified queries, but guarantees 100% data reliability.",
      },
    ],
    whatBrokeAndFix: [
      {
        issue: "JSONB query synthesis failed on nested invoice line items.",
        rootCause:
          "Standard LLM SQL prompts generate relational joins that break when querying jsonb_array_elements.",
        resolution:
          "Constructed targeted few-shot examples for PostgreSQL JSON accessor operators (->, ->>, #>>) and lateral joins.",
      },
    ],
    codeExcerpt: {
      filename: "analyst/graph/clarification.py",
      language: "python",
      code: `class QueryAmbiguityCheck(BaseModel):
    is_ambiguous: bool = Field(description="True if business terms have multiple definitions")
    missing_parameters: list[str] = Field(description="List of unstated filters like date range or currency")
    clarification_question: Optional[str] = Field(description="Question to present to user if ambiguous")
    suggested_interpretations: list[str]`,
      annotation:
        "Ambiguity detector: prevents the agent from guessing whether 'sales' means gross invoiced or net collected.",
    },
    knownLimitations: [
      "Currently optimized for PostgreSQL; cross-database syntax dialect switching (e.g. Snowflake/BigQuery) requires additional dialect mapping.",
    ],
  },
  {
    slug: "arvex-stock",
    title: "ARVEX Stock Analysis",
    tagline: "Algorithmic swing-trading research tool for NSE and BSE equities",
    year: "2024",
    category: "Data & Analytics",
    role: "ML Engineer",
    featured: false,
    repoUrl: "https://github.com/Rutvik995/STOCK-ALGO",
    summary:
      "Quantitative trading scanner for Indian markets: features multi-indicator RSI screening, LSTM directional price forecasts, and automated portfolio risk scoring.",
    systemFlow:
      "market_feed → technical_scanner (RSI/MACD) → sequence_normalizer → lstm_forecast_engine → drift_boundary_evaluator → portfolio_risk_ui",
    stack: [
      "Python",
      "TensorFlow / Keras (LSTM)",
      "Pandas",
      "NumPy",
      "React",
      "FastAPI",
      "yFinance",
    ],
    metricsOrScope: "NSE/BSE equities · Multi-timeframe indicators · Rebuilt from Dash to React",
    problem:
      "Retail traders often suffer from fragmented workflows: technical indicator analysis is disconnected from statistical predictive models, and most predictive tools fail to communicate the statistical uncertainty of machine learning forecasts.",
    whatIBuilt:
      "Built ARVEX (originally Stock Algo), an analytical research portal for Indian equities. The platform scans NSE/BSE tickers for RSI momentum divergences and moving average crossovers, feeding historical time series into an LSTM recurrent neural network. Includes an honest methodological disclaimer highlighting that LSTM models suffer from autoregressive drift over multi-week horizons, positioning the model strictly as a short-horizon momentum indicator rather than an oracle.",
    architectureNotes: [
      "Technical Scanner: Real-time calculation of RSI (14), MACD, Bollinger Bands, and Exponential Moving Averages.",
      "LSTM Model Pipeline: Min-Max normalized sliding window sequences predicting 3-to-5 day directional probability bounds.",
      "Frontend Migration: Rebuilt from an initial monolithic Plotly Dash prototype into a decoupled FastAPI backend with a fast React frontend.",
    ],
    knownLimitations: [
      "Autoregressive drift: Forecast accuracy degrades significantly beyond a 5-day horizon.",
      "High intraday volatility during quarterly earnings announcements is not modeled by historical price action alone.",
    ],
  },
  {
    slug: "aquaserve",
    title: "AquaServe",
    tagline: "Logistics, route optimization, and subscription mobile platform for water distribution",
    year: "2024",
    category: "Full-Stack & Mobile",
    role: "Mobile & Backend Developer",
    featured: false,
    repoUrl: "https://github.com/Rutvik995/Aquaserve",
    summary:
      "A logistics system managing on-demand water canister dispatch, recurring subscriber deliveries, driver turn-by-turn routing, and customer billing ledgers.",
    systemFlow:
      "customer_order → dispatch_optimizer → ward_clusterer → driver_turn_by_turn → offline_dropoff_logger → ledger_settlement",
    stack: [
      "Android / Kotlin",
      "Node.js",
      "Express",
      "PostgreSQL",
      "Google Maps SDK",
      "REST API",
    ],
    metricsOrScope: "Live GPS driver dispatch · Recurring jar subscriptions · Real-time order lifecycle",
    problem:
      "Local water canister distribution networks in tier-2 Indian cities depend on paper registers, leading to lost deliveries, inefficient delivery driving routes, uncollected cash receivables, and high churn among recurring monthly subscribers.",
    whatIBuilt:
      "Developed AquaServe, an integrated mobile and backend platform tailored for water distribution operations. Features a customer app for scheduled jar reorders and weekly subscriptions, a delivery driver portal with real-time GPS tracking and route waypoints, and an administrative dashboard to manage dispatch schedules, bottle deposits, and customer ledger balances.",
    architectureNotes: [
      "Real-time Driver Dispatch: Route grouping algorithm that clusters delivery stops within geographic wards.",
      "Subscription State Machine: Daily cron engine generating fulfillment manifests for recurring subscribers.",
      "Offline-first Delivery Confirmation: Drivers can record canister drop-offs even in basements or areas with patchy cellular connectivity.",
    ],
    knownLimitations: [
      "Automated card payment gateway integration is currently in testing; cash and UPI QR remains the primary settlement method.",
    ],
  },
  {
    slug: "invoice-webapp",
    title: "Invoice Web App",
    tagline: "Full-stack invoicing, GST calculations, and client receivable tracking",
    year: "2024",
    category: "Full-Stack & Mobile",
    role: "Full-Stack Developer",
    featured: false,
    repoUrl: "https://github.com/Rutvik995",
    summary:
      "Financial workflow platform featuring dynamic tax/discount calculations, client ledger management, PDF invoice generation, and automated revenue tracking.",
    systemFlow:
      "line_items_input → tax_calculator (GST/CGST/SGST) → ledger_entry_creator → pdf_vector_renderer → document_archive_store",
    stack: [
      "React",
      "Next.js",
      "TypeScript",
      "Node.js",
      "PostgreSQL",
      "Tailwind CSS",
    ],
    metricsOrScope: "Instant PDF rendering · Dynamic tax engines · Client status ledger",
    problem:
      "Small consulting and export businesses frequently struggle with overly complicated accounting software that requires extensive training and lacks clean PDF export customization.",
    whatIBuilt:
      "Designed and deployed a full-stack invoicing application that simplifies billing workflows. Provides customizable templates, dynamic multi-tier tax computations (including Indian GST CGST/SGST/IGST breakdown), PDF rendering, payment status tracking (Paid, Pending, Overdue), and a monthly receivables dashboard.",
    architectureNotes: [
      "Headless PDF Generation: Client-side vector PDF generation paired with server-side document archiving.",
      "Client Ledger: Comprehensive ledger tracking total invoiced, payments logged, and outstanding balances.",
    ],
  },
  {
    slug: "power-bi-dashboards",
    title: "Power BI Enterprise Dashboards",
    tagline: "Executive KPI reports and multi-channel revenue analytics",
    year: "2023",
    category: "Data & Analytics",
    role: "Data Analyst & BI Developer",
    featured: false,
    repoUrl: "https://github.com/Rutvik995/Power-BI-Dashboards",
    summary:
      "Collection of production business intelligence dashboards featuring advanced DAX modeling, star-schema warehousing, and executive revenue trend forecasting.",
    systemFlow:
      "erp_extracts → power_query_etl → star_schema_model → dax_vectorized_measures → dynamic_executive_visuals",
    stack: [
      "Power BI",
      "DAX",
      "Power Query (M)",
      "SQL Server",
      "Excel Data Modeling",
    ],
    metricsOrScope: "Multi-dimensional DAX metrics · Star-schema models · Automated refresh",
    problem:
      "Executives often receive static spreadsheet dumps that obscure regional performance trends, customer attrition rates, and gross margin leakages.",
    whatIBuilt:
      "Built a suite of interactive dashboards modeling multi-channel sales performance, inventory turnover, and profitability. Leveraged advanced DAX measures (time intelligence, moving averages, and dynamic cohort segmentation) with clean, accessible visual hierarchies.",
    architectureNotes: [
      "Dimensional Modeling: Star schema with conformed dimensions for dates, geographies, products, and sales reps.",
      "Optimized DAX Measures: Replaced row-by-row iterators with vectorized calculate filters for instantaneous slicing.",
    ],
  },
  {
    slug: "travel-ai-agent",
    title: "Travel AI Agent",
    tagline: "Constraint-driven multi-day itinerary planner and budget optimizer",
    year: "2024",
    category: "Agentic AI",
    role: "AI Engineer",
    featured: false,
    repoUrl: "https://github.com/Rutvik995/Travel_AI_Agent",
    summary:
      "Autonomous travel planning agent that synthesizes personalized day-by-day itineraries based on user timeframes, activity preferences, budget ceilings, and geographic routing.",
    systemFlow:
      "user_constraints → geographic_clusterer → places_api_validator → budget_iteration_loop → formatted_itinerary_egress",
    stack: [
      "Python",
      "LangChain",
      "FastAPI",
      "Streamlit",
      "OpenAI API",
      "Google Places API",
    ],
    metricsOrScope: "Multi-day itineraries · Budget constraint adherence · Geographic clustering",
    problem:
      "Planning multi-day travel requires cross-referencing activity hours, geographical distances between attractions, and strict budget allocations—a process where general-purpose LLMs hallucinate impossible travel itineraries.",
    whatIBuilt:
      "Created an agentic workflow that structures user travel constraints, calls geospatial APIs to cluster attractions by proximity to minimize transit time, and validates activity costs against a target budget before generating a finalized schedule.",
    architectureNotes: [
      "Geographic Waypoint Clustering: Prevents back-and-forth transit by clustering daily stops in the same district.",
      "Iterative Budget Validator: Loops through suggested attractions and substitutes costly venues if the running total exceeds user limits.",
    ],
  },
];
