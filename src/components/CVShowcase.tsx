import React, { useState } from 'react';
import { Briefcase, Copy, Check, Terminal, Cpu, Database, Award, ShieldAlert } from 'lucide-react';

export default function CVShowcase() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeTrack, setActiveTrack] = useState<'swe' | 'ml' | 'esg'>('swe');

  const resumeBullets = {
    swe: [
      {
        title: "Full-Stack TypeScript Architecture",
        desc: "Engineered a high-performance full-stack TypeScript environment utilizing React 19, Node.js/Express, and Vite, using esbuild for optimal production bundles and seamless asset routing."
      },
      {
        title: "Secure API & Secret Management",
        desc: "Architected a secure server-side API proxy boundary utilizing Google GenAI SDK, preserving external credentials on the server to prevent standard browser-level leaks and cross-origin security issues."
      },
      {
        title: "Dynamic Mathematical Simulation Engine",
        desc: "Built a real-time Scope 3 Life Cycle Assessment (LCA) simulation model processing dynamic material, transit, and electrical grid coefficients with clean local state caching."
      }
    ],
    ml: [
      {
        title: "Structured JSON Pipeline Orchestration",
        desc: "Developed strict schema-enforced AI pipelines to cleanly parse unstructured product descriptions into verified JSON schemas, translating complex logistics nodes into hierarchical state trees."
      },
      {
        title: "Context-Aware Agent Conversations",
        desc: "Configured a conversational audit agent utilizing multi-turn session states, allowing users to query environmental metrics, material alternatives, and compliance boundaries on the fly."
      },
      {
        title: "Heuristic Green-Sourcing Recommender",
        desc: "Programmed a taxonomy resolution system matching supply chain stages with optimal low-GHG alternatives and calculating mitigation percentages in real time."
      }
    ],
    esg: [
      {
        title: "Scope 3 Lifecycle Emissions Tracking",
        desc: "Integrated strict greenhouse gas (GHG) calculations covering Scope 1, 2, and 3 factors across multiple manufacturing stages, processing raw materials extraction to post-consumer end of life."
      },
      {
        title: "Composite Sourcing Risk Calculations",
        desc: "Formulated a multi-variable scoring pipeline grading production nodes on environmental tension, grid coal dependency, and circularity indicators (1-100 scale)."
      },
      {
        title: "Product Circularity Scoring Algorithm",
        desc: "Developed a comprehensive evaluation index mapping packaging recyclability, raw renewability, and take-back loop scenarios to assign deterministic overall grades."
      }
    ]
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div id="cv-showcase" className="bg-white border-2 border-[#141414] rounded-none p-6 shadow-none overflow-hidden relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#141414] pb-5 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-600 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-700"></span>
            </span>
            <span className="text-[10px] font-mono font-bold text-[#141414]/85 tracking-widest uppercase">TECHNICAL SPECIFICATIONS BRIEF</span>
          </div>
          <h2 className="text-xl font-bold text-[#141414] flex items-center gap-2 tracking-tight font-sans uppercase">
            <Award className="h-5 w-5 text-[#141414]" />
            EcoChain Technical System Architecture
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl font-sans">
            EcoChain is a production-level enterprise carbon-modeling platform. The system operates with absolute separation of concerns, secure server-side boundary proxies, and deterministic physical simulators.
          </p>
        </div>

        {/* Track selection buttons */}
        <div className="flex bg-[#e4e3e0]/50 p-1 rounded-none border-2 border-[#141414]">
          <button
            onClick={() => setActiveTrack('swe')}
            className={`px-3 py-1.5 rounded-none text-xs font-mono transition-all duration-150 ${
              activeTrack === 'swe' ? 'bg-[#141414] text-white font-bold shadow-none' : 'text-[#141414]/70 hover:text-black font-semibold'
            }`}
          >
            Systems Architecture
          </button>
          <button
            onClick={() => setActiveTrack('ml')}
            className={`px-3 py-1.5 rounded-none text-xs font-mono transition-all duration-150 ${
              activeTrack === 'ml' ? 'bg-[#141414] text-white font-bold shadow-none' : 'text-[#141414]/70 hover:text-black font-semibold'
            }`}
          >
            Intelligent Sourcing
          </button>
          <button
            onClick={() => setActiveTrack('esg')}
            className={`px-3 py-1.5 rounded-none text-xs font-mono transition-all duration-150 ${
              activeTrack === 'esg' ? 'bg-[#141414] text-white font-bold shadow-none' : 'text-[#141414]/70 hover:text-black font-semibold'
            }`}
          >
            Mathematical Engine
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bullets lists */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 font-mono">
            <Briefcase className="h-3.5 w-3.5 text-[#141414]" />
            Core Engineered System Protocols
          </h3>
          
          <div className="flex flex-col gap-3">
            {resumeBullets[activeTrack].map((bullet, idx) => (
              <div key={idx} className="group relative bg-[#e4e3e0]/15 border border-[#141414]/40 hover:border-[#141414] p-4 rounded-none transition-all duration-150">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950 font-sans uppercase tracking-tight">{bullet.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1.5 font-sans">{bullet.desc}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(`• ${bullet.desc}`, idx)}
                    className="p-1.5 rounded-none bg-white border border-[#141414] text-slate-700 hover:bg-[#141414] hover:text-white transition cursor-pointer"
                    title="Copy technical specifications text"
                  >
                    {copiedIndex === idx ? <Check className="h-3 w-3 text-emerald-700" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Architecture Deep Dive */}
        <div className="lg:col-span-5 bg-[#e4e3e0]/30 border border-[#141414] rounded-none p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5 font-mono">
              <Terminal className="h-3.5 w-3.5 text-[#141414]" />
              Software Architecture Pillars
            </h3>
            
            <div className="space-y-3 font-mono text-[#141414]">
              <div className="flex items-start gap-2.5 text-xs">
                <div className="p-1 rounded-none bg-slate-950/25 text-[#141414] mt-0.5 border border-[#141414]">
                  <ShieldAlert className="h-3 w-3" />
                </div>
                <div>
                  <span className="text-[#141414] font-bold block text-[11px]">1. Server Proxy Boundary Pattern</span>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-sans leading-tight">
                    Ensures absolute safety of secrets and third party connection profiles. Keeps external APIs safely bound strictly to Node.js routing.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs">
                <div className="p-1 rounded-none bg-slate-950/25 text-[#141414] mt-0.5 border border-[#141414]">
                  <Cpu className="h-3 w-3" />
                </div>
                <div>
                  <span className="text-[#141414] font-bold block text-[11px]">2. Structured GenAI Schema Enforcement</span>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-sans leading-tight">
                    Strict schema validation converting unstructured supplier descriptions into robust deterministic data structures for exact simulation tracking.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs">
                <div className="p-1 rounded-none bg-slate-950/25 text-[#141414] mt-0.5 border border-[#141414]">
                  <Database className="h-3 w-3" />
                </div>
                <div>
                  <span className="text-[#141414] font-bold block text-[11px]">3. Multi-Faceted LCA Mathematical Solver</span>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-sans leading-tight">
                    Runs real-time multi-stage Scope 1/2/3 LCA formula simulations locally based on dynamic variables (e.g. transportation fuel & power plant energy grids).
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#141414] pt-3 mt-4 flex items-center justify-between text-[11px] text-slate-650 font-mono">
            <span>Tech: React 19 • Express • TypeScript • Tailwind 4</span>
            <span className="text-emerald-800 font-bold">100% Production Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
