import React, { useState } from 'react';
import { 
  Building2, Globe, Sparkles, MapPin, AlertCircle, FileSearch, HelpCircle, 
  ChevronRight, ArrowUpRight, CheckCircle2, RefreshCw, BarChart2, MessageSquare, Award
} from 'lucide-react';
import { ProductESGBrief, SandboxSettings, ChatMessage } from './types';
import SupplyChainGraph from './components/SupplyChainGraph';
import LCAManifest from './components/LCAManifest';
import ESGAuditChat from './components/ESGAuditChat';
import CVShowcase from './components/CVShowcase';

export default function App() {
  // Primary generative supply chain state
  const [productInput, setProductInput] = useState('');
  const [activeBrief, setActiveBrief] = useState<ProductESGBrief | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isLoadingBrief, setIsLoadingBrief] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active sandbox simulation settings
  const [sandboxSettings, setSandboxSettings] = useState<SandboxSettings>({
    batchSize: 50000,
    materialType: 'virgin_pet',
    logisticTransit: 'diesel_truck',
    factoryEnergy: 'coal_power',
    packaging: 'plastic_polybag',
    endOfLife: 'landfill_waste',
  });

  // ESG chat auditor state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isGeneratingChat, setIsGeneratingChat] = useState(false);

  // Preset triggers for demonstration
  const presets = [
    { title: "Modular Organic Cotton Headset", desc: "Eco-acoustics headset leveraging organic cotton cushions and locally recycled polymer components." },
    { title: "Recycled Titanium Road Bicycle", desc: "High-grade road frame manufactured from scrap aerospace alloys shipped across low-carbon train networks." },
    { title: "Algae-Polymer Bioregenerative Running Shoe", desc: "A performance running trainer using carbon-sequestering sea-algae biodegradable soles and minimal box packs." }
  ];

  // Call the server-side LLM supply chain decomposer endpoint
  const handleDecomposeProduct = async (description: string) => {
    if (!description.trim() || isLoadingBrief) return;
    setIsLoadingBrief(true);
    setErrorMessage(null);
    setSelectedNodeId(null);

    // Seed preset settings based on description hints
    const descLower = description.toLowerCase();
    const guessedMaterial = 
      descLower.includes('wood') ? 'sustainable_wood' :
      descLower.includes('aluminum') ? 'recycled_aluminum' :
      descLower.includes('titanium') ? 'recycled_aluminum' : // fallback close
      descLower.includes('cotton') ? 'organic_cotton' :
      descLower.includes('headset') ? 'organic_cotton' :
      descLower.includes('algae') ? 'biodegradable_polymer' : 'recycled_pet';

    try {
      const response = await fetch('/api/gemini/generate-lifecycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productDescription: description }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to analyze supply chain lifecycle.');
      }

      const data: ProductESGBrief = await response.json();
      setActiveBrief(data);
      if (data.nodes && data.nodes.length > 0) {
        setSelectedNodeId(data.nodes[0].id);
      }

      // Initialize simulator setup with realistic baseline targets
      setSandboxSettings({
        batchSize: 50000,
        materialType: guessedMaterial as any,
        logisticTransit: 'diesel_truck',
        factoryEnergy: 'gas_turbine',
        packaging: 'recycled_cardboard',
        endOfLife: 'take_back_recycling'
      });

      // Clear previous auditor chats when loading new products
      setChatHistory([]);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An unexpected error occurred during supply chain generation.');
    } finally {
      setIsLoadingBrief(false);
    }
  };

  // Trigger preset models directly
  const handleSelectPreset = (title: string, desc: string) => {
    setProductInput(title);
    handleDecomposeProduct(`${title}: ${desc}`);
  };

  // Dynamic application of node green alternatives suggestions in the sandbox
  const handleApplyNodeAlternativeSetting = (nodeId: string) => {
    if (!activeBrief) return;
    const node = activeBrief.nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Map alternative string keywords back to sandbox settings
    const optMaterial = node.alternativeGreenOption.material.toLowerCase();
    const optTransport = node.alternativeGreenOption.transport.toLowerCase();

    let resolvedMaterial = sandboxSettings.materialType;
    let resolvedTransit = sandboxSettings.logisticTransit;
    let resolvedEnergy = sandboxSettings.factoryEnergy;

    if (optMaterial.includes('wood') || optMaterial.includes('forest')) resolvedMaterial = 'sustainable_wood';
    else if (optMaterial.includes('aluminum') || optMaterial.includes('metal')) resolvedMaterial = 'recycled_aluminum';
    else if (optMaterial.includes('cotton') || optMaterial.includes('fabric')) resolvedMaterial = 'organic_cotton';
    else if (optMaterial.includes('polymer') || optMaterial.includes('bio') || optMaterial.includes('mycel')) resolvedMaterial = 'biodegradable_polymer';
    else resolvedMaterial = 'recycled_pet';

    if (optTransport.includes('rail') || optTransport.includes('train')) resolvedTransit = 'railway';
    else if (optTransport.includes('electric truck') || optTransport.includes('ev truck')) resolvedTransit = 'electric_truck';
    else if (optTransport.includes('ship') || optTransport.includes('sea') || optTransport.includes('barge')) resolvedTransit = 'cargo_vessel';
    else resolvedTransit = 'electric_truck';

    // Optimize energy automatically too
    resolvedEnergy = 'onsite_solar_wind';

    setSandboxSettings({
      ...sandboxSettings,
      materialType: resolvedMaterial,
      logisticTransit: resolvedTransit,
      factoryEnergy: resolvedEnergy,
    });
  };

  // Talk to the server-side ESG Chat Auditor
  const handleSendChatMessage = async (text: string) => {
    if (!text.trim() || isGeneratingChat) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
    setIsGeneratingChat(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          currentBrief: activeBrief,
          settings: sandboxSettings,
          history: updatedHistory
        }),
      });

      if (!response.ok) {
        throw new Error('Chatbot auditor failed to reply.');
      }

      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'assistant',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatHistory(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'assistant',
        text: `Error conducting audit: ${err.message || 'Audit connection lost.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setIsGeneratingChat(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e4e3e0] text-[#141414] flex flex-col font-sans selection:bg-[#141414] selection:text-white">
      {/* 1. Header Navigation */}
      <header className="border-b-2 border-[#141414] bg-[#ffffff] sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-none bg-[#141414] flex items-center justify-center font-bold text-white text-lg border border-[#141414]">
            E
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-[#141414] font-sans">EcoChain</span>
              <span className="text-[10px] font-mono font-bold text-emerald-900 bg-emerald-100 border border-emerald-500 px-2 py-0.5 rounded-none uppercase tracking-wider">Scope 3 Sandbox</span>
            </div>
            <p className="text-xs text-slate-600 tracking-tight font-sans font-medium">Enterprise Scope 3 Lifecycle (LCA) Simulation System</p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] font-bold">
          <span className="text-[#141414]/70 hidden sm:inline">Node: LocalHost:3000</span>
          <a 
            href="#cv-showcase" 
            className="flex items-center gap-1 px-3 py-1.5 bg-[#141414] hover:bg-[#2c2c2c] text-white border border-[#141414] rounded-none transition font-bold"
          >
            <Award className="h-3.5 w-3.5" /> System Specs
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-8 pb-16">
        
        {/* Real-world Problem & Solution Introduction banner */}
        <section className="bg-[#ffffff] border-2 border-[#141414] rounded-none p-6 relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-none">
          <div className="space-y-2 max-w-3xl">
            <h1 className="text-xl font-black text-[#141414] tracking-tight flex items-center gap-2 font-sans uppercase">
              <Sparkles className="h-6 w-6 text-[#141414] shrink-0" />
              Corporate Scope 3 Carbon Accounting Challenge
            </h1>
            <p className="text-xs sm:text-xs text-slate-600 leading-relaxed font-sans font-medium">
              Up to <strong className="text-emerald-900 underline decoration-2">90% of a company&rsquo;s carbon footprint</strong> resides in Scope 3 indirect emissions (downstream transit, mining extractions, packaging pipelines). Regulating these parameters is a high-demand technology challenge. This project leverages the <strong className="text-[#141414] font-bold">Google GenAI SDK</strong> to decompose products into granular, calculated supply chain stages, enabling real-time sandboxed Lifecycle Assessments (LCA) and conversational auditing.
            </p>
          </div>
          <div className="bg-[#e4e3e0]/30 p-4 rounded-none border border-[#141414] max-w-xs shrink-0 self-stretch flex flex-col justify-between">
            <span className="text-[9px] font-mono text-[#141414]/80 tracking-wider font-bold block mb-1">SYSTEM CONFIGURATION</span>
            <p className="text-xs text-slate-500 italic leading-relaxed font-medium">
              &ldquo;Combines dynamic supply chain stage modeling, multi-variable carbon mitigation formulas, and secure server-side isolation.&rdquo;
            </p>
          </div>
        </section>

        {/* 2. Product Input & Presets section */}
        <section className="space-y-4">
          <div className="bg-[#ffffff] border-2 border-[#141414] rounded-none p-5 shadow-none">
            <h2 className="text-xs font-bold text-[#141414] uppercase tracking-wider mb-3 font-mono">
              1. Initialize Generative Lifecycle Assessment (LCA) model
            </h2>

            <form 
              onSubmit={(e) => { e.preventDefault(); handleDecomposeProduct(productInput); }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="text"
                value={productInput}
                onChange={(e) => setProductInput(e.target.value)}
                placeholder="Describe a physical customer product (e.g. Smart Watch with bamboo casing, Seaweed athletic shirt, Aluminum coffee maker)..."
                className="flex-1 bg-white border-2 border-[#141414] focus:outline-none focus:ring-1 focus:ring-[#141414]/75 text-sm rounded-none px-4 py-3 text-[#141414] placeholder:text-slate-400 font-mono"
                disabled={isLoadingBrief}
              />
              <button
                type="submit"
                disabled={isLoadingBrief || !productInput.trim()}
                className="px-6 py-3 bg-[#141414] hover:bg-[#2c2c2c] active:bg-[#000000] disabled:opacity-50 text-white font-bold text-sm rounded-none transition-all duration-150 border border-[#141414] flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                {isLoadingBrief ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Auditing Lifecycle...
                  </>
                ) : (
                  <>
                    <FileSearch className="h-4 w-4 text-white" />
                    Model Supply Chain
                  </>
                )}
              </button>
            </form>

            {/* Presets suggestions */}
            <div className="mt-4 pt-4 border-t border-[#141414]/20">
              <span className="text-[9px] text-[#141414]/80 uppercase tracking-widest font-black block mb-2">
                Or load unique sandbox presets:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {presets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPreset(preset.title, preset.desc)}
                    disabled={isLoadingBrief}
                    className="text-left bg-white hover:bg-[#e4e3e0]/20 border border-[#141414] p-3 rounded-none transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                      <span>{preset.title}</span>
                      <ChevronRight className="h-3 w-3 text-[#141414]" />
                    </div>
                    <p className="text-[10.5px] text-slate-500 font-medium font-sans leading-normal mt-1 line-clamp-2">
                      {preset.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Feedback alerts */}
          {errorMessage && (
            <div className="bg-red-50 border-2 border-red-650 rounded-none p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-red-900">LCA Modeling Failed</h4>
                <p className="text-xs text-red-800 mt-1 leading-relaxed font-sans font-medium">
                  {errorMessage}
                </p>
                <div className="text-[11px] font-mono text-slate-600 mt-2 font-bold">
                  Tip: Please verify the internal system `GEMINI_API_KEY` configuration is active and has sufficient quota.
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 3. Empty State or Dashboard Grid */}
        {!activeBrief && !isLoadingBrief ? (
          <section className="bg-white border-2 border-[#141414] rounded-none p-8 text-center space-y-6 max-w-2xl mx-auto flex flex-col items-center">
            <Globe className="h-12 w-12 text-[#141414] animate-pulse" />
            <div className="space-y-2">
              <h2 className="text-sm font-black text-[#141414] uppercase tracking-wider font-mono">Continuous Lifecycle Simulation Sandbox Idle</h2>
              <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
                Describe a product or load one of the presets above to initialize the supply chain models. EcoChain will compile regional raw material sourcing, trace shipping routes, analyze power grid factors, and chart Scope 3 comparative reports dynamically.
              </p>
            </div>
            
            {/* Tiny architecture outline */}
            <div className="w-full bg-[#e4e3e0]/30 rounded-none p-4 text-left border border-[#141414] text-[11px] space-y-2 font-mono">
              <span className="text-slate-700 uppercase font-black text-[9px] block">Platform Integration Overview</span>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[#141414]/90 font-bold">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-800 shrink-0" /> Dynamic Schema Extraction
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-800 shrink-0" /> Secure Server API Proxy
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-800 shrink-0" /> Real-time LCA Formulas
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-800 shrink-0" /> TypeScript Compilation
                </div>
              </div>
            </div>
          </section>
        ) : isLoadingBrief ? (
          <section className="bg-white border-2 border-[#141414] rounded-none p-12 text-center flex flex-col items-center justify-center space-y-6 max-w-lg mx-auto shadow-none">
            <div className="relative">
              <Globe className="h-12 w-12 text-[#141414] animate-spin" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-[#141414] uppercase tracking-wider font-mono">Trace Sourcing & Processing Networks</h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs font-sans font-medium">
                The modeling engine is resolving material supplier indexes, calculating transit carbon, and configuring the active Scope 3 schemas.
              </p>
            </div>
            {/* Streaming simulation messages */}
            <div className="w-full bg-[#141414] px-3 py-2.5 rounded-none font-mono text-[10px] text-left text-slate-300">
              <span className="text-emerald-400 block animate-pulse">● VERIFYING INTERNAL SECURE_PROXY CONNECTION</span>
              <span className="block mt-1">✓ Instantiating structured mapping protocol...</span>
              <span className="block">✓ Quantifying lifecycle CO2 equivalents...</span>
            </div>
          </section>
        ) : (
          /* Active Interactive Dashboard Layout */
          <div className="space-y-8 animate-fade-in">
            {/* Header Product Card */}
            <div className="bg-white border-2 border-[#141414] rounded-none p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-none">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#141414]/80 font-bold block mb-0.5">ACTIVE PORTFOLIO TARGET</span>
                <h2 className="text-lg font-black text-[#141414] tracking-tight truncate max-w-md font-sans uppercase">{activeBrief?.productName}</h2>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-600 font-medium">
                  <span className="flex items-center gap-1 font-mono">
                    <Building2 className="h-3.5 w-3.5 text-slate-500" /> Sourcing: {activeBrief?.rawMaterialSourcing}
                  </span>
                  <span className="hidden sm:inline text-slate-400">|</span>
                  <span className="hidden sm:inline font-sans">{activeBrief?.manufacturingProcess}</span>
                </div>
              </div>

              {/* Red Flags / Risk Alert Indicator summary */}
              <div className="flex bg-red-50 border border-red-600 rounded-none p-3 max-w-md gap-2.5">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700">
                  <span className="font-bold text-red-900 block font-mono uppercase text-[10px] tracking-wider">Critical Carbon Hotspots</span>
                  <p className="text-[11px] leading-relaxed mt-0.5 font-sans font-medium">
                    {activeBrief?.redFlags[0] || 'Vulnerabilities detected in current supply sourcing lines.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Dashboard sections tab heading details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b-2 border-[#141414] pb-2 font-mono">
                <BarChart2 className="h-5 w-5 text-[#141414]" />
                <h3 className="text-xs font-black text-[#141414] uppercase tracking-wider font-sans">Scope 1, 2, & 3 Digital Twin Simulator</h3>
              </div>
              <LCAManifest 
                currentBrief={activeBrief}
                settings={sandboxSettings}
                onChangeSettings={setSandboxSettings}
              />
            </div>

            {/* Visual Logistics graph pipeline */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b-2 border-[#141414] pb-2 font-mono">
                <Globe className="h-5 w-5 text-[#141414]" />
                <h3 className="text-xs font-black text-[#141414] uppercase tracking-wider font-sans">Interactive Logistics Flow Analysis & Offsets</h3>
              </div>
              <SupplyChainGraph 
                nodes={activeBrief.nodes}
                selectedNodeId={selectedNodeId}
                onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
                onApplyGreenAlternative={handleApplyNodeAlternativeSetting}
              />
            </div>

            {/* AI Auditor Chat integration panel */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b-2 border-[#141414] pb-2 font-mono">
                <MessageSquare className="h-5 w-5 text-[#141414]" />
                <h3 className="text-xs font-black text-[#141414] uppercase tracking-wider font-sans">Interactive Scope 3 Carbon Audit Assistant</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                  <ESGAuditChat 
                    currentBrief={activeBrief}
                    settings={sandboxSettings}
                    chatHistory={chatHistory}
                    onSendMessage={handleSendChatMessage}
                    isSending={isGeneratingChat}
                  />
                </div>
                
                <div className="lg:col-span-4 bg-white border-2 border-[#141414] rounded-none p-5 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[9px] font-mono tracking-wider uppercase text-slate-650 font-bold block">Compliance Auditing Guidelines</span>
                    <h4 className="text-xs font-bold text-[#141414] font-mono uppercase">Auditing Architecture & Context</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
                      The Auditor Assistant retains multi-turn context corresponding to active slider sandbox parameters. When queries are submitted, it audits the simulated supply chain model against carbon compliance logic:
                    </p>
                    <ul className="text-xs text-slate-600 space-y-2 pl-4 list-decimal leading-relaxed font-sans font-medium">
                      <li>Evaluates coal-grid electrical dependencies vs. solar offsets.</li>
                      <li>Cross-references logistics shipping routes against standard carbon indexes (e.g. diesel trucking vs electrified railways).</li>
                      <li>Audits circularity percentages of recyclable packaging vs single-use PP polybags.</li>
                    </ul>
                  </div>

                  <div className="border-t border-[#141414]/20 pt-4 mt-4 text-[10px] text-slate-550 font-mono text-center font-bold">
                    Security: Server-Side Context Isolation Enabled
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. The Portfolio Panel (Resume Bullet Builder) */}
        <section id="portfolio-bullets" className="pt-8">
          <CVShowcase />
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[#141414] bg-[#ffffff] py-8 px-6 text-center text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
          <span>© 2026 EcoChain. Engineered & Developed by Aditi Raj.</span>
          <span className="flex items-center gap-1 text-[#141414] font-bold">
            Execution Engine: <span className="text-emerald-950 font-bold bg-[#e4e3e0] px-2 py-0.5 rounded-none border border-[#141414]">LLM-LCA-V1.2</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
