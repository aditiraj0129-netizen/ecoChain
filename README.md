# EcoChain: Enterprise Scope 3 Carbon Lifecycle (LCA) Simulation System

EcoChain is a production-ready, full-stack enterprise carbon-accounting and simulation system. It empowers supply chain managers, ESG analysts, and logistics engineers to map complex multi-stage supply chains, calculate live Scope 1, 2, and 3 emission factors using real-world mathematical models, and simulate the environmental impact of sustainable material or logistical transitions in real-time.

Designed and engineered with a **stark, high-density industrial wireframe layout**, EcoChain strictly isolates secret connections on the server, utilizes dynamic custom SVG visualizations, and provides an interactive conversational auditor to guide sensitivity analyses.

---

## 🏗️ Architectural Core

The application separates concerns cleanly into three primary technology tiers:

```
┌────────────────────────────────────────────────────────┐
│                      Client Tier                       │
│    (React 19 • Tailwind 4 • Space Grotesk Sans-Serif)  │
└──────────────────────────┬─────────────────────────────┘
                           │
             REST Protocol (Proxy Boundary)
                           │
┌──────────────────────────▼─────────────────────────────┐
│                      Server Tier                       │
│      (Node.js • Express • esbuild Bundled Entry)       │
├────────────────────────────────────────────────────────┤
│  • Local Math Solvers                                  │
│  • Secure API Host & Key Protection                    │
│  • Multi-turn Session Flow Control                     │
└────────────────────────────────────────────────────────┘
```

### 1. Secure Server-Side Proxy Boundary Pattern
To safeguard third-party API profiles and sensitive corporate parameters, **no external credentials ever leak to the browser bundle**. The client speaks exclusively to internal `/api` endpoints, routing all structured requests via a safe Express-based secure boundary in `server.ts`.

### 2. Multi-Stage LCA Mathematical Solver
EcoChain runs real-time deterministic simulation calculations on the server and client using the following variables:
* **Production Batch Volume:** Scales calculations globally.
* **Sourcing Material Coefficients:** Grades from premium virgin PET (unregulated carbon multipliers) to organic cotton or recycled seaweed fibers (low carbon profiles).
* **Freight Transit Vectors:** Multiplies mileage weight indexes by transit type factors (e.g., diesel trucking vs electrified cargo rail).
* **Electrical Sourcing Grid Mix:** Quantifies processing energy usage by grid efficiency multipliers (e.g., coal thermal generation vs clean photovoltaic solar/wind).
* **End of Life (EoL) Recyclability Index:** Deducts offset factors from municipal loops, composting bio-degradation, or take-back incentives.

### 3. Structured Data Validation Pipeline
Converts complex raw text user supplier inputs into strict, verified hierarchical structural states. The platform handles spelling errors, regional supply chains, and complex layouts to render clean, interactive pipeline nodes dynamically.

---

## 🛠️ Technology Stack

* **Frontend Framework:** `React 19`
* **Styling & Theme Engine:** `Tailwind CSS 4` (Custom High-Density, Swiss Bauhaus-inspired Wireframe Theme)
* **Icons:** `Lucide React`
* **Development Server & Asset Compiler:** `Vite`
* **Production Bundler:** `esbuild` (Compiles TypeScript server-side entries into unified, fast-loading `.cjs` payloads)
* **Backend Framework:** `Node.js` + `Express`
* **Language Runtime:** `TypeScript 5`

---

## ⚙️ Quick Start Installation

Follow these steps to launch EcoChain locally on your machine:

### 1. Clone the Repository & Install Dependencies
```bash
npm install
```

### 2. Configure Environmental Variables
Establish a `.env` file in the root directory:
```env
GEMINI_API_KEY="your_api_key_here"
```

### 3. Execute Development Environment
Launches the dual Express-Vite development server on port `3000`:
```bash
npm run dev
```

### 4. Build & Compile for Production
Compiles the React application into optimized static assets under `/dist` and bundles the Express server using esbuild into `dist/server.cjs`:
```bash
npm run build
```

### 5. Launch Production Server
```bash
npm start
```

---

## 📊 Feature Highlights

* **Interactive Logistics Pipeline:** Clickable, responsive stage-by-stage map visualization tracks carbon emissions independently.
* **Sandbox Material Simulator:** Six modular sliders configure real-time variables with zero-flicker re-renders.
* **Integrated Custom SVG Scenario Charting:** Automatically graphs standard baselines alongside current sandbox configurations and fully-optimized green targets.
* **Audit Assistant Portal:** Conduct continuous interactive carbon audits of the active supply chain parameters.
