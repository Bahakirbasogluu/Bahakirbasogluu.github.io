// Everything the page says about the work, in one place.
const GH = "https://github.com/Bahakirbasogluu/";

export const NOW = [
  "News-watch agent live since August 2026",
  "Third semester of Sektör Kampüste",
  "ISMSIT 2026 paper accepted",
  "Eight open repositories, all tested in CI",
];

export const CASES = [
  {
    name: "Nexent Bank",
    sector: "Banking",
    figure: "92%",
    caption: "of 4,373 candidate articles filtered out by the news-watch agent in its measured week, with no scheduled hour missed",
    parts: [
      ["KYC onboarding assistant", "Proposes each answer of the eligibility workbook with its evidence; the relationship manager confirms batch by batch. Replaces a process of 2 to 3 weeks per client."],
      ["Credit risk platform", "Analysts, a researcher, a synthesizer and a reviewer exchange results through typed ports, with four-eyes approval as a human interrupt."],
      ["News-watch agent", "Live since August 2026. One deduplicated digest an hour, or nothing. Exposed to Copilot Studio as an MCP server."],
    ],
    stack: ["Microsoft Agent Framework", "Azure AI Foundry", "LangGraph", "MCP", "Postgres checkpoints"],
    open: ["workbook-review-agent", "agent-workflow-orchestrator", "news-watch-agent"],
  },
  {
    name: "Enerjisa",
    sector: "Energy",
    figure: "26",
    caption: "document types, from notary and legal fees to customs documents, insurance policies and utility bills",
    parts: [["Document-processing service", "Each document goes through OCR, classification, structured extraction, validation and mapping to SAP-ready records. The accounting team reviews output instead of keying in data."]],
    stack: ["OCR", "Classification", "Structured extraction", "Validation", "SAP mapping"],
    open: ["document-extraction-pipeline"],
  },
  {
    name: "CEVA Logistics",
    sector: "Logistics",
    figure: "110–120k",
    caption: "trip documents a month through 19 extraction templates, each with its own Pydantic schema",
    parts: [
      ["E-mail-to-order agent", "Reads free-form shipment requests, extracts the order fields, identifies the customer, follows up on missing details and relays the quote. The work of one full-time coordinator, about 8 hours a day."],
      ["Trip-document OCR pipeline", "Runs on Azure AI Document Intelligence and Azure OpenAI."],
      ["WhatsApp agents", "LangGraph state machines: one collects a shipment request, the other routes customer-service requests to step-by-step sub-agents."],
    ],
    stack: ["Azure AI Document Intelligence", "Azure OpenAI", "Pydantic", "LangGraph"],
    open: ["email-to-order-agent", "document-extraction-pipeline"],
  },
  {
    name: "SASA Polyester",
    sector: "Manufacturing",
    figure: "Ask.",
    caption: "a WhatsApp agent that answers business questions in natural language",
    parts: [["WhatsApp agent over Power BI", "Queries Power BI directly, so people get reporting figures without opening a dashboard."]],
    stack: ["WhatsApp", "Power BI"],
    open: [],
  },
  {
    name: "Flormar",
    sector: "Cosmetics",
    figure: "12",
    caption: "SharePoint sources behind one knowledge assistant on Copilot Studio",
    parts: [["Knowledge assistant", "Routes each question to the right source, answers from the current version of a document and hands sensitive topics to HR."]],
    stack: ["Copilot Studio", "SharePoint"],
    open: [],
  },
  {
    name: "A hospital group",
    sector: "Healthcare",
    figure: "PoC",
    caption: "a permission-aware RAG assistant for the intranet",
    parts: [["Proof of concept", "Access groups on every chunk and a security filter on every query, so the model only receives documents the signed-in user may see."]],
    stack: ["RAG", "Access control"],
    open: ["permission-aware-rag"],
  },
  {
    name: "Kansai Altan",
    sector: "Paints",
    figure: "3",
    caption: "internal business applications moved to containers",
    parts: [["Containers and standards", "Containerised for Azure App Service with GitHub Actions, together with the engineering standards the three applications share."]],
    stack: ["Containers", "Azure App Service", "GitHub Actions"],
    open: [],
  },
  {
    name: "PEAKUP",
    sector: "Internal platform",
    figure: "3",
    caption: "sector packs on one case-agent platform: banking, logistics and pharma",
    parts: [["Case-agent platform", "Generalises the credit risk work: versioned agents and workflows, gated MCP tool connections and golden-case evaluations."]],
    stack: ["Versioned workflows", "MCP tool gating", "Golden-case evaluation"],
    open: ["agent-workflow-orchestrator"],
  },
  {
    name: "ZF Friedrichshafen",
    sector: "Automotive",
    figure: "98–99%",
    caption: "accuracy on live production data, held through continuous retraining",
    parts: [["Anomaly detection for manufacturing quality", "SHAP and LIME layers show engineers why a part was flagged. Delivered while at NTT DATA Business Solutions."]],
    stack: ["Anomaly detection", "SHAP", "LIME"],
    open: [],
  },
];

export const PROGRAMMES = [
  ["AI 101", "All employees, half or full day", "From the history of AI to transformer architectures: how generative AI works and where it fails, prompt engineering, responsible use, department scenarios."],
  ["Microsoft 365 Copilot", "Business departments", "Copilot in daily work by department: finance, HR, sales, operations, legal, IT."],
  ["Copilot Studio", "Power users and IT", "Designing, grounding and publishing agents; hands-on labs with test questions and a prompt-injection demo."],
  ["Azure AI Foundry", "Developers and data teams", "Building and deploying models and agents on Azure AI Foundry."],
  ["GitHub Copilot", "Developers", "AI-assisted development and vibe coding, from prompt to working application."],
];

export const SEMESTERS = [
  ["Autumn 2025", "Kocaeli Health and Technology"],
  ["Spring 2026", "Okan · Süleyman Demirel"],
  ["Autumn 2026", "Kocaeli Health and Technology · Atatürk"],
];

export const TRAINED = ["Eczacıbaşı", "KPMG", "TAV", "MetLife", "Nexent Bank", "CEVA", "Hedef Filo", "Centurion", "Petroyağ", "Brisa"];

export const TRAIL = [
  { when: "2025 — now", role: "AI Engineer", at: "PEAKUP", now: true, text: "Agentic systems for enterprise clients, from scoping to production and handover. PEAKUP is Türkiye's first and only Microsoft Frontier Partner." },
  { when: "2025 — now", role: "Adjunct Instructor", at: "Sektör Kampüste", now: true, text: "Cloud Computing and Artificial Intelligence Technologies, taught online on behalf of PEAKUP: syllabus and exam design, lectures, student projects and grading." },
  { when: "2025", role: "AI Engineer", at: "ONO Teknoloji", text: "LLM-based chatbots and assistants, and the software around them." },
  { when: "2024 — 2025", role: "Data Scientist", at: "NTT DATA Business Solutions", text: "Anomaly detection at ZF. Document translation and chatbot solutions on Azure AI for Mercedes-Benz Türk, Pegasus and KoçZer. LLM chatbot and agent proofs of concept for BMW and Nobel." },
  { when: "2021 — 2023", role: "Internships", at: "Selvi Technology · Bekaert · Turkish Aerospace", text: "At Selvi, text recognition modules in production code and GUI front-ends for client ML models. Alongside, the Microsoft student programme of 2022 to 2023." },
];

export const FACTS = [
  {
    title: "Education",
    rows: [
      ["MSc Computer Engineering", "Istanbul Technical University · 2025 to January 2027, expected"],
      ["BSc Artificial Intelligence Engineering", "Hacettepe University · 2019 to 2024"],
    ],
  },
  {
    title: "Certifications",
    rows: [
      ["Microsoft Certified: Azure AI Engineer Associate", "Microsoft · October 2025"],
      ["Sektör Kampüste certificate", "Ministry of Industry and Technology · September 2025"],
    ],
  },
  {
    title: "Writing and speaking",
    rows: [
      ["Articles on applied AI and agentic systems", "Medium", "https://medium.com/@bahakirbashov"],
      ["PEAKUP Teknoloji Konuşmaları", "Podcast guest, on multi-agent systems in enterprise workflows"],
    ],
  },
  {
    title: "Languages",
    rows: [["Turkish · English · German", "Native · professional · A2"]],
  },
];

export const TOOLBOX = [
  ["Agents and orchestration", ["LangGraph", "Microsoft Agent Framework", "Copilot Studio", "Azure AI Foundry", "Azure OpenAI", "MCP servers and tool gating", "Human-in-the-loop review", "RAG with access control", "Golden-case evaluation"]],
  ["ML and cloud", ["PyTorch", "scikit-learn", "Hugging Face", "nnU-Net", "Azure AI Document Intelligence", "SHAP and LIME", "Azure Functions", "Azure Machine Learning", "Azure DevOps", "Docker", "FastAPI"]],
];

export const TAGS = ["LangGraph", "MCP", "RAG", "Human in the loop", "Evaluation", "Pydantic", "Azure OpenAI"];

export const REPOS = [
  { name: "agent-workflow-orchestrator", line: "Multi-agent workflows as data.", kind: "LangGraph", tests: 38, tags: ["LangGraph", "Human in the loop", "Evaluation", "Pydantic", "Azure OpenAI"] },
  { name: "news-watch-agent", line: "One deduplicated digest, hourly.", kind: "Agent / MCP", tests: 38, tags: ["MCP", "Pydantic", "Azure OpenAI"] },
  { name: "workbook-review-agent", line: "It proposes. A person confirms.", kind: "Human in the loop", tests: 25, tags: ["Human in the loop", "Pydantic", "Azure OpenAI"] },
  { name: "permission-aware-rag", line: "Answers only what you may read.", kind: "RAG", tests: 19, tags: ["RAG", "Evaluation", "Azure OpenAI"] },
  { name: "email-to-order-agent", line: "From free text to a quote.", kind: "Workflow", tests: 35, tags: ["Human in the loop", "Pydantic", "Azure OpenAI"] },
  { name: "erp-mcp-server", line: "Guarded writes for agents.", kind: "MCP", tests: 16, tags: ["MCP", "Human in the loop", "Pydantic"] },
  { name: "document-extraction-pipeline", line: "Schema in, record out.", kind: "Pipeline", tests: 29, tags: ["Pydantic", "Evaluation", "Azure OpenAI"] },
  { name: "lesion-level-eval", line: "Detection by lesion size.", kind: "Evaluation", tests: 20, tags: ["Evaluation"] },
].map((repo) => ({ ...repo, url: GH + repo.name }));

export const EARLIER = [
  ["Fraud-Detection", "One-class detectors and score ensembles on credit card and Medicare data.", GH + "Fraud-Detection"],
  ["Fraud-Detection-GT", "The graph-based companion: centrality, spectral methods and GNNs.", GH + "Fraud-Detection-GT"],
  ["IMPBA", "Image inpainting with two U-Net variants.", GH + "IMPBA"],
  ["docgen_data", "Turkish and English technical-support dialogue dataset, 341 samples.", GH + "docgen_data"],
  ["smart-fridge", "Graduation project: produce freshness from visible spoilage. Team project.", "https://github.com/canatess/smart-fridge"],
];

export const repoUrl = (name) => GH + name;
