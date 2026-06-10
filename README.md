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

## 🎨 Frontend Architecture & Wireframe Layout

EcoChain implements a custom **High-Density Swiss Industrial Wireframe Theme** created purely with modern Tailwind CSS v4 variables, designed specifically to communicate rigorous, professional engineering.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                SYSTEM HEADER                                 │
│  [E] EcoChain                     [NODE: localhost:3000]    [SYSTEM SPECS]   │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                     1. GENERATIVE LCA MODEL INPUT                      │  │
│  │   [ Describe physical product...                                   ]   │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────┐ ┌──────────────────────────────┐  │
│  │        2. TWIN SIMULATOR SLIDERS       │ │ 3. DYNAMIC METRIC CHARTS     │  │
│  │   - Batch Volume: [========O       ]   │ │   MAX MT CO2e ──┐            │  │
│  │   - Primary Material: (Recycled)       │ │                 │            │  │
│  │   - Freight Method: (Diesel Truck)     │ │   Sandbox ──────┼──┐         │  │
│  │   - Factory Grid Mix: (Solar-Hydro)    │ │                 │  │  Opt-ESG│  │
│  │   - End of Life Loop: (Incinerate)     │ │                 └──┴─────┘   │  │
│  │   [Reset Baseline]                     │ │   [Benchmark]  Sandbox  Opt  │  │
│  └────────────────────────────────────────┘ └──────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────┐ ┌──────────────────────────────┐  │
│  │        4. LOGISTICS PATH LIST          │ │ 5. DETAILED SEGMENT ANALYSIS │  │
│  │   • Stage 1: Extraction  [Risk 25/100] │ │   Sourcing Location: Asia    │  │
│  │   • Stage 2: Processing  [Risk 52/100] │ │   Materials Used: PET, Glass │  │
│  │   • Stage 3: Transit     [Risk 80/100] │ │   Off-set Roadmap: Re-route  │  │
│  └────────────────────────────────────────┘ └──────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────┐ ┌──────────────────────────────┐  │
│  │        6. CONVERSATIONAL AUDITOR       │ │ 7. ARCHITECTURE PROTOCOLS    │  │
│  │   [Auditor]: How can we offset coal?   │ │   - Server Proxy Boundary    │  │
│  │   [User]: Input dynamic query here...  │ │   - GenAI Schema Validation  │  │
│  └────────────────────────────────────────┘ └──────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Module Breakdown

#### `App.tsx`
The primary application orchestrator. Coordinates application configurations, triggers generative pipeline requests to the server API, manages loading states during modeling runs, and provides preset physical options (e.g. Bamboo Smart Watch, Organic Coffee, Bio-Degradable Shoes).

#### `LCAManifest.tsx` (Component 2 & 3)
* **Digital Twin Simulator:** Contains stateful sliders for production scaling, material modifiers, packaging alternatives, logistics vectors, and end-of-life options.
* **Custom Interactive SVG Graphing:** A mathematical graphing viewport comparing the active sandbox emissions profile, the conventional heavy-carbon benchmark, and the fully optimized option.

#### `SupplyChainGraph.tsx` (Component 4 & 5)
* **Logistics Timeline:** Renders a step-by-step graphical node-link path mapping the source, transit, manufacturing, packaging, retail, and end-of-life cycles.
* **Stage Risk Profiling:** Identifies hotspots (scoring composite risks from 1 to 100) using diagnostic warning lights.
* **Granular Stage Auditor:** Opens detailed metrics including specific materials, regional power grid dependencies, absolute carbon tonnage (MT CO2e), and green suggestions.

#### `ESGAuditChat.tsx` (Component 6)
An interactive conversational terminal that tracks the state of the active supply chain configuration and allows users to query compliance boundaries, coal-grid dependencies, or take-back lifecycles.

#### `CVShowcase.tsx` (Component 7)
Houses detailed technical architecture protocols split across categories like Systems Architecture, Intelligent Sourcing, and Mathematical Solvers, illustrating the robust design patterns used throughout the codebase.

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
