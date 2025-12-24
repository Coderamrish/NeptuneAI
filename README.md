# 🌊 NeptuneAI

<div align="center">

### *Dive Deep. Ask Smart. Discover Oceans.*

**Transform complex oceanographic & maritime telemetry data into conversational, visual, and actionable insights with a modern RAG + Transformer stack.**

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Launch_Platform-0066FF?style=for-the-badge&labelColor=000000)](https://coderamrish-neptuneai-frontendapp-8luqnx.streamlit.app/)
[![Python](https://img.shields.io/badge/Python-3.9+-FFD43B?style=for-the-badge&logo=python&logoColor=blue)](https://www.python.org)
[![React](https://img.shields.io/badge/React-17.0+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![Streamlit](https://img.shields.io/badge/Streamlit-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white)](https://streamlit.io)
[![License](https://img.shields.io/badge/License-MIT-00C853?style=for-the-badge)](LICENSE)

![NeptuneAI Demo](https://raw.githubusercontent.com/Coderamrish/NeptuneAI/main/assets/demo.gif)

</div>

---

NeptuneAI brings together oceanography, geospatial analytics, and modern LLM-powered retrieval to let you "ask the ocean" — then visualize, export, and act on the answers. It merges ARGO float science, repository-sourced datasets, AIS/maritime telemetry, and live feeds into a single platform with:

- Transformer-powered natural language understanding
- RAG (Retrieval-Augmented Generation) to ground answers on real data
- Vector search (FAISS / Chroma) for scalable semantic retrieval
- Geospatial & maritime route visualization with safety & fail-safe features
- Real-time data ingestion & WebSocket streaming to frontends (React + Streamlit)

Contents
- Features
- Why NeptuneAI is different
- How it works (RAG + Transformer + Vector Search)
- Safety & Maritime Fail-Safes
- Architecture (diagram)
- Quick Start (local)
- Example usage & sample queries
- API & developer notes
- Roadmap
- Contributing & Support
- License & Credits

---

## ✨ Key Features — What Makes NeptuneAI Powerful

- Natural language queries over oceanographic and maritime data (Transformer + RAG)
- Grounded answers with citations to ARGO profiles, AIS traces, and repo-sourced datasets
- Vector-based semantic search using embeddings → FAISS/Chroma hybrid for scale
- Real-time telemetry ingestion (AIS) and WebSocket stream to UI clients
- Geospatial visualizations: global map, heatmaps, float & vessel tracks, route playback
- Maritime route analytics: ETA calculation, route similarity, historical playback
- Safety & fail-safes: geofencing, collision-risk detection, exclusion zones, alerting
- Model registry & experiment tracking primitives (versioning for pipelines/models)
- Offline/air-gapped analysis mode for sensitive data
- Export: CSV, Parquet, PNG charts, HTML reports, reproducibility manifests
- Multi-frontend: React SPA for production UI; Streamlit demos and admin tools

Status badges in this README map approximate readiness. See docs for exact status for each module.

---

## 🚀 Why NeptuneAI is different

- Grounded conversation: answers cite the data used (ARGO profile IDs, AIS timestamps, parquet files).
- Hybrid retrieval: combine fast vector recall (similar semantics) with precise DB queries (time-range, bounding boxes).
- Geospatial-first: all analytics keep location & depth as first-class citizens (not an afterthought).
- Safety-aware maritime features: built for real-world maritime contexts — alerts, ETAs, and route safety checks.
- Production-ready frontends: React for map-heavy interfaces + Streamlit for rapid demos and research UIs.

---

## 🧠 How it works — RAG + Transformer + Vector Search (high level)

1. Query understanding:
   - Transformer-based NLP (small custom transformer or LLM prompt) converts user queries into structured intents (e.g., "compare", "plot", "list vessels").
2. Retriever:
   - Query is embedded using HuggingFace/OpenAI embeddings.
   - Vector DB (FAISS / Chroma) returns top-k semantically relevant documents (ARGO profiles, extracted AIS segments, repo docs).
3. Grounding:
   - Retriever passes documents into RAG pipeline that uses an LLM (OpenAI/GPT or local LLaMA variant) to generate concise, evidence-backed responses.
4. Post-processing:
   - Numeric analysis, plotting, and geospatial computations executed by backend services (xarray, pandas, geopandas).
5. Delivery:
   - Visuals & interactive maps to frontends (React/Streamlit); downloadable artifacts and structured JSON results for programmatic access.

Mermaid overview (rendered on platforms that support mermaid):

```mermaid
graph TB
  User[User Query (NL)] --> Parser[Transformer / Intent Parser]
  Parser --> Retriever[Embedding -> Vector DB (FAISS/Chroma)]
  Retriever --> RAG[RAG Pipeline (LLM + Context)]
  RAG --> Stats[Numeric & Geospatial Analysis]
  Stats --> Frontend[React / Streamlit / API]
  Ingest[Ingestion Workers: ARGO/AIS/Repo] --> VectorDB
  Ingest --> DB[(Postgres / Timescale)]
  Ingest --> ObjectStore[(S3 / local)]
  Frontend -->|WebSocket| Live[Live Updates]
```

---

## 🛡️ Safety, Compliance & Maritime Fail-Safes (saFE)

NeptuneAI includes built-in maritime safety features we summarize as saFE (safety & fail-safes):

- Geofencing: define restricted zones and automatically flag vessels entering/exiting them.
- Collision risk scoring: pairwise ETA & CPA (Closest Point of Approach) estimates with risk levels.
- Route validation: check historical tracks vs. proposed routes for anomalies.
- Alerting & webhooks: configurable alerts (email/webhook) for safety events.
- Role-based access & token sessions: sensitive telemetry and PII access controlled by roles.
- Offline analysis mode: run the full stack without external LLM/APIs for secure environments.

---

## 📡 Real-time Pipeline & Ingestion

- Async ingestion workers pull telemetry (AIS-like CSVs or live feeds) and ARGO updates.
- Incoming records are preprocessed, geospatially indexed, batched, and pushed into:
  - Time-series DB (Postgres/Timescale) for efficient querying
  - Object store / parquet files for archival & reproducibility
  - Vector DB (FAISS / Chroma) for semantic retrieval
- Live feed: WebSocket / Socket.IO pushes datasets & alerts to connected frontends for real-time map updates.

---

## 🗺️ Geospatial & Maritime Capabilities

- Map layers: heatmaps (temp/salinity), vessel density, route heatmaps, bathymetry overlays
- Track playback: scrub through time to replay vessel tracks or float trajectories
- Spatial queries: bounding box, radius, polygon selection with fast tile-based loading
- Advanced filters: depth, time-range, vessel type, flag, speed range, data quality flags
- Route analytics: average speed, port calls detection, ETA & arrival uncertainty

---

## 🔧 Quick Start — Local Development

Prerequisites
```bash
Python 3.9+
Node.js 14+
PostgreSQL 12+ (TimescaleDB recommended)
git
```

Clone & bootstrap
```bash
git clone https://github.com/Coderamrish/NeptuneAI.git
cd NeptuneAI
```

Backend
```bash
python -m venv venv
source venv/bin/activate     # Windows: venv\Scripts\activate
pip install -r requirements.txt

# copy env and edit
cp .env.example .env
# set OPENAI_API_KEY, DATABASE_URL, WS_ENDPOINT, etc.

# initialize DB & ingest repo-sourced samples
python scripts/init_db.py
python scripts/ingest_repo_data.py   # ingests ARGO & AIS samples bundled in repo

# run backend (development)
uvicorn backend.main:app --reload --port 8000
```

Frontend (React)
```bash
cd frontend-react
npm install
npm start
# opens at http://localhost:3000 (default)
```

Streamlit demo (optional)
```bash
cd frontend
pip install -r frontend/requirements.txt
streamlit run app.py
```

Testing
```bash
pytest -q
```

---

## 🧩 Example usage & sample queries

Natural-language examples you can try in the demo UI:

- "Show temperature profile (0–1000m) for ARGO profile WMO:123456 for Jan 2023."
- "Compare mean salinity at 200m between Atlantic and Pacific in 2022."
- "Plot vessel tracks for container ships in the English Channel for the last 48 hours and flag any CPA < 0.5km."
- "Which floats reported temperature anomalies (> 2°C from climatology) in the Southern Ocean this year?"
- "Give me the top-5 semantically similar research notes to 'mixed layer depth variability' from the repo."

Programmatic example (Python)
```python
from neptuneai.client import NeptuneClient

client = NeptuneClient(api_url="http://localhost:8000", api_key="DEVKEY")
resp = client.query_nl("Show me shipping traffic density near Gibraltar for the last week")
# resp contains a structured answer, supporting docs, and visualization metadata
```

---

## 🧪 API & Developer Notes

- REST endpoints (FastAPI) for queries, ingestion control, models, and artifacts
- WebSocket endpoint for live telemetry and alerts (WS_ENDPOINT in .env)
- CLI helpers: scripts/ingest_repo_data.py, scripts/init_db.py, scripts/index_embeddings.py
- Embedding & vectorization:
  - Configurable via .env (OPENAI vs HuggingFace)
  - Vector DB options: FAISS (local), Chroma (persistence), or hybrid

Recommended config keys in .env:
```
OPENAI_API_KEY=
HUGGINGFACE_API_KEY=
DATABASE_URL=postgresql://user:pass@localhost:5432/neptuneai
VECTOR_BACKEND=faiss   # or chroma
WS_ENDPOINT=ws://localhost:8000/ws
```

---

## 📦 Deployment & Scaling

- Containerized: Dockerfiles for backend, frontend, ingestion workers
- Compose / Helm: examples in deploy/ (Postgres + MinIO + Vector DB + backend)
- Scale vector DB and time-series DB independently; use worker autoscaling for ingestion bursts
- LLM options:
  - Production: OpenAI or hosted LLaMA / Mistral behind a secure internal endpoint
  - Air-gapped: local LLM inference + local embeddings

---

## 🗺️ Roadmap (selected)

- Adaptive RAG: dynamic context windows & retrieval cost optimization
- Predictive models for routing and anomaly detection (LSTM/Transformer ensembles)
- Collaborative annotation & review workflows for scientists
- Federated ingestion: support multiple institutions with per-tenant data isolation
- Mobile client and push-notifications for safety alerts

---

## 🤝 Contributing

Contributions are welcome — from fixes to new ingestion connectors (e.g., additional AIS providers), new visualizations, or model improvements.

Steps:
1. Fork the repo
2. Create a feature branch
3. Add tests & documentation
4. Open a PR describing your change

Please follow the contributor guidelines in CONTRIBUTING.md if present.

---

## 📚 Credits & Acknowledgments

- ARGO Program — open oceanographic datasets
- AIS / Maritime telemetry providers (samples & format inspiration)
- HuggingFace, LangChain, OpenAI, FAISS, Chroma — for the ML building blocks
- Streamlit & React communities — for rapid prototyping & production UI patterns

---

## 📄 License

NeptuneAI is released under the MIT License. See LICENSE for details.

---

## 📬 Contact & Support

- Issues: https://github.com/Coderamrish/NeptuneAI/issues
- Email: tiwariambrish81@gmail.com
- Demo: https://coderamrish-neptuneai-frontendapp-8luqnx.streamlit.app/

---

Made with curiosity & care — for researchers, mariners, and ocean lovers. Dive deep safely.

