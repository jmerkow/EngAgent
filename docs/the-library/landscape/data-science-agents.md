# Data Science Agents

> A landscape survey of AI agent systems designed for data science workflows — from exploratory analysis through model building, scientific reasoning, and deployment. Covers production research systems, cloud platform integrations, and frontier scientific discovery agents.
>
> **Key concepts:** data science lifecycle, automated ML pipelines, case-based reasoning, tree-search optimization, multi-agent scientific discovery, agentic data analysis, trust and safety gaps

## Overview

AI agents for data science have progressed rapidly but remain strongest in early pipeline stages — EDA, data cleaning, visualization, and model building — while deployment, monitoring, and governance remain underserved [1]. A comprehensive survey (Rahman et al., October 2025) mapped 45 data science agent systems across six lifecycle stages: business understanding and data acquisition, exploratory analysis and visualization, feature engineering, model building and selection, interpretation and explanation, and deployment and monitoring [1]. Over 90% of surveyed systems lack explicit trust and safety mechanisms [1].

This doc captures the landscape as of early 2026. The field is moving fast — treat specific capability claims as point-in-time snapshots.

## Production Systems

Four systems illustrate the range of approaches:

**DS-Agent** (ICML 2024) combines LLM agents with case-based reasoning drawn from Kaggle competition knowledge [2]. It structures an automatic iteration pipeline that capitalizes on expert solutions. With GPT-4, DS-Agent achieves a 100% success rate in its development stage and a 36% improvement in one-pass rate across alternative LLMs in its deployment stage, at costs of $0.13–$1.60 per run [2]. Code is open-sourced [2].

**AIDE** (Weco AI, February 2025) frames ML engineering as a code optimization problem, using LLM-guided tree search in the space of potential solutions [3]. Each Python script becomes a node in a solution tree; LLM-generated patches spawn children, and metric feedback prunes the search. On OpenAI's MLE-Bench (75 Kaggle competitions), AIDE's tree search wins 4x more medals than the best linear agent [3]. The open-source `aideml` package supports any LLM backend including local models [3].

**DeepAnalyze-8B** (October 2025) is the first agentic LLM designed specifically for autonomous data science — completing the end-to-end pipeline from raw data to analyst-grade research reports [4]. A curriculum-based training paradigm emulates how human data scientists learn, enabling the model to progressively acquire capabilities in real-world environments. At only 8B parameters, DeepAnalyze outperforms workflow-based agents built on frontier proprietary LLMs [4]. Model, code, and training data are open-sourced [4].

**LAMBDA** (July 2024) is an open-source, code-free multi-agent system where a programmer agent generates code from user instructions and domain knowledge, while an inspector agent debugs it [5]. A Knowledge Integration Mechanism allows flexible integration of external models and algorithms for customized analysis [5]. LAMBDA targets accessibility — users from non-technical backgrounds can perform data analysis through natural language [5].

| System | Approach | Pipeline Coverage | Key Differentiator |
|---|---|---|---|
| DS-Agent | CBR + LLM iteration | Model building, deployment | Case-based reasoning from Kaggle knowledge [2] |
| AIDE | LLM tree search | ML engineering end-to-end | Solution tree with metric-guided pruning [3] |
| DeepAnalyze-8B | Curriculum-trained agentic LLM | Data → research reports | Small model outperforming larger workflow agents [4] |
| LAMBDA | Multi-agent (programmer + inspector) | Data analysis, visualization | Code-free natural language interface [5] |

The survey identifies a common pattern: most systems emphasize exploratory analysis, visualization, and modeling while neglecting business understanding, deployment, and monitoring [1]. Multimodal reasoning and tool orchestration remain unresolved challenges across the field [1].

## Cloud Platform Agents

Major cloud platforms now embed data science agents into their existing environments:

**Google Cloud's Data Science Agent** (Preview) uses Gemini in Colab Enterprise and BigQuery to provide interactive data science assistance [6]. It covers the full pipeline within a notebook: data exploration, cleaning, wrangling, visualization, feature engineering, model training (pandas, BigQuery DataFrames, PySpark), model optimization, evaluation, and inference [6]. Users interact via natural language prompts in a chat panel, and the agent generates code that can be accepted, run, or modified in-place [6]. Currently limited to CSV files and BigQuery tables as data sources [6].

**Microsoft Fabric Copilot** provides AI-enhanced tooling for data science and data engineering workloads within the Fabric platform [7]. In notebooks, Copilot offers a chat panel, code generation, code completion, error fixing, and data analysis capabilities [7]. The broader Fabric AI ecosystem includes Data Agents (custom natural-language interfaces to data), AI Functions for data transformation, and AI Services [7]. Copilot is powered by Azure OpenAI and requires Fabric capacity (F2 or higher) [7].

**NVIDIA** provides GPU-accelerated data science infrastructure through the RAPIDS ecosystem (cuML, cuDF) and NIM microservices, though a specific packaged "data science agent" product was not verified at time of writing. NVIDIA's acceleration libraries are commonly used as the compute backend for agent systems that need high-throughput ML operations.

**JetBrains** has been integrating AI assistance into its data science tooling (DataSpell, PyCharm). Specific "AI Data Wrangler Agent" capabilities were reported in the survey literature [1] but could not be independently confirmed at the time of writing.

## Scientific Reasoning Agents

At the frontier, agents are moving beyond data analysis into hypothesis generation and experimental design:

**Google's AI Co-Scientist** (February 2025) is a multi-agent system built on Gemini 2.0 designed to function as a virtual scientific collaborator [8]. It uses specialized agents — Generation, Reflection, Ranking, Evolution, Proximity, and Meta-review — inspired by the scientific method itself [8]. These agents use self-play-based scientific debate for hypothesis generation, ranking tournaments for comparison, and an evolution process for quality improvement [8]. On 15 open research goals curated by domain experts, the system outperformed other SOTA agentic and reasoning models using scaled test-time compute [8]. Crucially, predictions have been validated through real-world laboratory experiments: novel drug repurposing candidates for acute myeloid leukemia, epigenetic targets for liver fibrosis, and independent recapitulation of a gene transfer mechanism in antimicrobial resistance [8].

**FutureHouse** (platform launched May 2025) provides specialized scientific agents: Crow for literature search and synthesis, Falcon for deep literature reviews with access to databases like OpenTargets, Owl for answering "has anyone done X before?", and Phoenix for chemistry experiment planning [9]. These agents have been benchmarked with better precision than PhD-level researchers in head-to-head literature search tasks [9].

**Robin** (May 2025) is FutureHouse's multi-agent system that orchestrates Crow, Falcon, and Finch (data analysis agent) to automate the key intellectual steps of the entire scientific process [10]. Robin produced its first AI-generated discovery: identifying ripasudil as a novel therapeutic candidate for dry age-related macular degeneration [10]. All hypotheses, experiment choices, data analyses, and main-text figures were generated autonomously — human researchers executed only the physical experiments [10]. The entire process from concept to paper submission took 2.5 months [10].

## Practical Patterns

When using general-purpose coding agents (Claude, Copilot, etc.) for data science work, several patterns emerge from practitioner experience:

**Iterative notebook workflows.** Data science is inherently exploratory. Rather than specifying a complete analysis upfront, break work into small iterations: load data → examine shape and types → identify quality issues → clean → visualize distributions → model. Each step should be verified before proceeding. Agents that run code and inspect outputs in a tight loop perform significantly better than those that try to generate complete analyses in one pass.

**Domain context matters more than in software engineering.** For data science tasks, agents need domain-specific context: what the columns mean, what constitutes a reasonable value range, what the business question is, which metrics matter. Creating a project-level context file with dataset documentation, analysis conventions, preferred libraries (e.g., polars vs. pandas), and output format expectations substantially improves agent performance on data tasks.

**Subagent architecture for parallel analysis.** Complex analyses benefit from decomposition — one subagent for data cleaning, another for feature engineering, a third for model comparison. This maps naturally to the data science lifecycle stages identified in the survey [1] and mirrors how LAMBDA splits work between programmer and inspector agents [5].

**Expect an investment period.** Agents don't perform reliably on data science tasks out of the box. Building up a library of examples, domain-specific prompts, and analysis templates — typically a week or more of upfront investment — is needed before agents deliver consistent quality. The payoff in ongoing productivity follows.

**Validation is non-negotiable.** Agent-generated analyses can produce plausible but incorrect results — wrong aggregations, misinterpreted joins, statistical errors that look reasonable at a glance. Every analytical output needs human review. This is the data science analogue of the testing-as-force-multiplier pattern in software engineering: statistical checks, sanity plots, and known-answer tests serve the same role as unit tests.

## References

- [1] [Rahman et al., "LLM-Based Data Science Agents: A Survey of Capabilities, Challenges, and Future Directions"](https://arxiv.org/abs/2510.04023) — October 2025, survey of 45 systems across 6 lifecycle stages (arXiv:2510.04023)
- [2] [Guo et al., "DS-Agent: Automated Data Science by Empowering Large Language Models with Case-Based Reasoning"](https://arxiv.org/abs/2402.17453) — ICML 2024, code at [github.com/guosyjlu/DS-Agent](https://github.com/guosyjlu/DS-Agent) (arXiv:2402.17453)
- [3] [Jiang et al., "AIDE: AI-Driven Exploration in the Space of Code"](https://arxiv.org/abs/2502.13138) — February 2025, code at [github.com/WecoAI/aideml](https://github.com/WecoAI/aideml) (arXiv:2502.13138)
- [4] [Zhang et al., "DeepAnalyze: Agentic Large Language Models for Autonomous Data Science"](https://arxiv.org/abs/2510.16872) — October 2025, code at [github.com/ruc-datalab/DeepAnalyze](https://github.com/ruc-datalab/DeepAnalyze), model at [HuggingFace](https://huggingface.co/RUC-DataLab/DeepAnalyze-8B) (arXiv:2510.16872)
- [5] [Sun et al., "LAMBDA: A Large Model Based Data Agent"](https://arxiv.org/abs/2407.17535) — July 2024, code at [github.com/AMA-CMFAI/LAMBDA](https://github.com/AMA-CMFAI/LAMBDA) (arXiv:2407.17535)
- [6] [Google Cloud, "Use the Data Science Agent"](https://docs.cloud.google.com/colab/docs/use-data-science-agent) — Colab Enterprise documentation, last updated March 2026
- [7] [Microsoft, "What is Copilot in Fabric?"](https://learn.microsoft.com/en-us/fabric/get-started/copilot-fabric-overview) — Microsoft Fabric documentation, last updated February 2026
- [8] [Gottweis & Natarajan, "Accelerating scientific breakthroughs with an AI co-scientist"](https://research.google/blog/accelerating-scientific-breakthroughs-with-an-ai-co-scientist/) — Google Research blog, February 2025, paper at [arXiv:2502.18864](https://arxiv.org/abs/2502.18864)
- [9] [FutureHouse, "FutureHouse Platform: Superintelligent AI Agents for Scientific Discovery"](https://www.futurehouse.org/research-announcements/launching-futurehouse-platform-ai-agents) — May 2025, platform at [platform.futurehouse.org](https://platform.futurehouse.org/)
- [10] [FutureHouse, "Demonstrating end-to-end scientific discovery with Robin"](https://www.futurehouse.org/research-announcements/demonstrating-end-to-end-scientific-discovery-with-robin-a-multi-agent-system) — May 2025, paper at [arXiv:2505.13400](https://arxiv.org/abs/2505.13400), code at [github.com/Future-House/robin](https://github.com/Future-House/robin)

## See Also

- [Delegation and Subagents](../patterns/delegation-and-subagents.md) — cross-framework delegation patterns used by multi-agent data science systems
- [Context and Persistence](../patterns/context-and-persistence.md) — how context management applies to iterative data science workflows
