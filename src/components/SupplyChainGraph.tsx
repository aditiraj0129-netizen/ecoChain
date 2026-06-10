import React from 'react';
import { Leaf, MapPin, AlertTriangle, ArrowRight, Zap, Droplets, Sparkles, CheckCircle2 } from 'lucide-react';
import { SupplyChainNode } from '../types';

interface SupplyChainGraphProps {
  nodes: SupplyChainNode[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  onApplyGreenAlternative: (nodeId: string) => void;
}

export default function SupplyChainGraph({
  nodes,
  selectedNodeId,
  onSelectNode,
  onApplyGreenAlternative,
}: SupplyChainGraphProps) {
  if (nodes.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center">
        <MapPin className="h-10 w-10 text-slate-500 animate-bounce mb-3" />
        <h3 className="text-sm font-semibold text-white">No supply chain model active</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Please input a product description above to generate a fully calculated Scope 3 supply chain map from the AI.
        </p>
      </div>
    );
  }

  // Helper to color nodes based on composite ESG risk factor
  const getRiskColor = (risk: number) => {
    if (risk < 30) return { bg: 'bg-emerald-100/80', border: 'border-emerald-600', text: 'text-emerald-900', bar: 'bg-emerald-600' };
    if (risk < 60) return { bg: 'bg-amber-100/80', border: 'border-amber-600', text: 'text-amber-900', bar: 'bg-amber-600' };
    if (risk < 85) return { bg: 'bg-orange-100/80', border: 'border-orange-600', text: 'text-orange-900', bar: 'bg-orange-600' };
    return { bg: 'bg-red-100/80', border: 'border-red-600', text: 'text-red-900', bar: 'bg-red-600' };
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 1. Left Pipeline List */}
      <div className="lg:col-span-6 flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">AI-Generated Scope 3 Logistics Path</h3>
          <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 border border-emerald-600/30 px-2 py-0.5 rounded-none font-bold">
            {nodes.length} Stages Mapped
          </span>
        </div>

        <div className="flex flex-col gap-3.5 relative pl-4 border-l-2 border-slate-800 ml-3">
          {nodes.map((node, index) => {
            const isSelected = selectedNodeId === node.id || (selectedNodeId === null && index === 0);
            const rColors = getRiskColor(node.riskFactor);

            return (
              <div
                key={node.id}
                id={`node-${node.id}`}
                onClick={() => onSelectNode(node.id)}
                className={`group cursor-pointer rounded-none p-4 transition-all duration-150 relative border-2 ${
                  isSelected
                    ? 'bg-white border-[#141414] shadow-none'
                    : 'bg-white/45 border-slate-850 hover:border-[#141414] hover:bg-white'
                }`}
              >
                {/* Visual Connector Dot */}
                <div
                  className={`absolute -left-[22.5px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 transition-all ${
                    isSelected
                      ? 'bg-emerald-600 border-[#141414]'
                      : 'bg-[#e4e3e0] border-slate-850 group-hover:bg-[#141414]'
                  }`}
                />

                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] font-mono text-[#141414]/75 bg-slate-950/20 px-1.5 py-0.5 rounded-none uppercase font-bold">
                        Stage {index + 1}: {node.stageName}
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border ${rColors.border} ${rColors.bg} ${rColors.text}`}>
                        Risk {node.riskFactor}/100
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#141414] tracking-tight group-hover:text-emerald-700 transition font-sans">
                      {node.name}
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 font-sans">
                      <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                      {node.location}
                    </p>
                  </div>

                  {/* Absolute carbon metrics */}
                  <div className="text-right font-mono self-center shrink-0">
                    <span className="text-slate-400 text-[9px] uppercase tracking-wider font-bold block">Absolute Impact</span>
                    <span className="text-xs font-bold text-red-600 block">{node.carbonAbsolute} MT CO2e</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Right Node Analysis Panel */}
      <div className="lg:col-span-6 flex flex-col">
        {selectedNode && (
          <div className="bg-white border-2 border-[#141414] rounded-none p-5 flex flex-col h-full justify-between">
            {/* Header summary of selected node */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500">STAGE ANALYSIS SPECIFICATE</span>
                  <h3 className="text-base font-bold text-white tracking-tight">{selectedNode.name}</h3>
                </div>
                <div className="text-right font-mono shrink-0">
                  <span className="text-[10px] text-slate-400 block">{selectedNode.location}</span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-end">
                    <Zap className="h-3 w-3" /> {selectedNode.energySource}
                  </span>
                </div>
              </div>

              {/* Bio description */}
              <p className="text-xs text-slate-350 leading-relaxed bg-slate-900/40 p-3 rounded-lg border border-slate-800/60">
                {selectedNode.description}
              </p>

              {/* Grid indices */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-900/70 p-3 rounded-lg text-center border border-slate-800">
                  <div className="flex justify-center mb-1 text-red-400">
                    <Leaf className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase block">Carbon Intensity</span>
                  <strong className="text-xs font-mono text-white block mt-0.5">{selectedNode.carbonIntensity} <span className="text-[9px] text-slate-400 font-normal">kg/unit</span></strong>
                </div>

                <div className="bg-slate-900/70 p-3 rounded-lg text-center border border-slate-800">
                  <div className="flex justify-center mb-1 text-cyan-400">
                    <Droplets className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase block">Water Usage</span>
                  <strong className="text-xs font-mono text-white block mt-0.5">{selectedNode.waterUsageValue} <span className="text-[9px] text-slate-400 font-normal">L/unit</span></strong>
                </div>

                <div className="bg-slate-900/70 p-3 rounded-lg text-center border border-slate-800">
                  <div className="flex justify-center mb-1 text-orange-400">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase block">Risk Index</span>
                  <strong className="text-xs font-mono text-white block mt-0.5">{selectedNode.riskFactor}/100</strong>
                </div>
              </div>

              {/* Risk details / Red Flags */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Security & Environmental Vulnerability</span>
                <p className="text-xs text-slate-400 font-mono italic">
                  &ldquo;{selectedNode.riskNotes}&rdquo;
                </p>
              </div>

              {/* Raw Materials component lists */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Assigned Materials & Inputs</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.materialsUsed.map((m, i) => (
                    <span key={i} className="text-[10px] text-[#141414]/90 bg-slate-950/15 px-2 py-1 rounded-none font-mono border border-[#141414]">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Alternatve roadmap cards */}
            <div className="mt-5 border-t border-[#141414]/15 pt-4 space-y-3.5">
              <div className="flex justify-between items-center bg-emerald-50 px-3 py-2 border-2 border-emerald-600 rounded-none">
                <div className="flex items-center gap-1.5 text-xs text-emerald-900 font-bold">
                  <Sparkles className="h-4 w-4" />
                  AI Generative Green Mitigation Roadmap
                </div>
                <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-none">
                  -{selectedNode.alternativeGreenOption.savingsPercentage}% Carbon
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-slate-950/20 p-2 rounded-none border border-[#141414]">
                  <span className="text-[9px] text-[#141414]/65 font-bold uppercase">OPTIMAL MATERIAL</span>
                  <div className="text-[#141414] text-[11px] font-bold mt-0.5 truncate">{selectedNode.alternativeGreenOption.material}</div>
                </div>
                <div className="bg-slate-950/20 p-2 rounded-none border border-[#141414]">
                  <span className="text-[9px] text-[#141414]/65 font-bold uppercase">OPTIMAL TRANSIT</span>
                  <div className="text-[#141414] text-[11px] font-bold mt-0.5 truncate">{selectedNode.alternativeGreenOption.transport}</div>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed pl-1 font-sans">
                {selectedNode.alternativeGreenOption.notes}
              </p>

              <button
                onClick={() => onApplyGreenAlternative(selectedNode.id)}
                className="w-full mt-2 py-2.5 bg-[#141414] hover:bg-[#2c2c2c] active:bg-[#000000] text-[#e4e3e0] font-bold text-xs rounded-none transition-all duration-150 flex items-center justify-center gap-1.5 shadow-none cursor-pointer border border-[#141414]"
              >
                <CheckCircle2 className="h-4 w-4" />
                Apply Carbon Offsets to Sandbox Simulations
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
