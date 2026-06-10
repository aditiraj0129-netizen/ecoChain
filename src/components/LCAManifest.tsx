import React, { useMemo } from 'react';
import { Sliders, Activity, Info, BarChart3, TrendingDown, DollarSign, RotateCcw, HelpCircle } from 'lucide-react';
import { ProductESGBrief, SandboxSettings, LCAEvaluationResult } from '../types';

interface LCAManifestProps {
  currentBrief: ProductESGBrief | null;
  settings: SandboxSettings;
  onChangeSettings: (settings: SandboxSettings) => void;
}

export default function LCAManifest({
  currentBrief,
  settings,
  onChangeSettings,
}: LCAManifestProps) {

  // Multiplier database matching standard eco-inventory databases (e.g. EcoInvent / DEFRA)
  const multipliers = useMemo(() => ({
    materials: {
      virgin_pet: { co2: 1.0, water: 1.0, circularity: 10, cost: 1.10 },
      recycled_pet: { co2: 0.35, water: 0.4, circularity: 70, cost: 1.45 },
      biodegradable_polymer: { co2: 0.50, water: 0.9, circularity: 90, cost: 1.80 },
      organic_cotton: { co2: 0.25, water: 0.3, circularity: 85, cost: 1.60 },
      recycled_aluminum: { co2: 0.12, water: 0.15, circularity: 95, cost: 2.10 },
      sustainable_wood: { co2: 0.08, water: 0.1, circularity: 100, cost: 1.20 },
    },
    transit: {
      air_freight: { co2: 7.2, cost: 4.50 },
      cargo_vessel: { co2: 0.25, cost: 0.45 },
      railway: { co2: 0.15, cost: 0.70 },
      diesel_truck: { co2: 1.4, cost: 1.15 },
      electric_truck: { co2: 0.35, cost: 1.55 },
    },
    energy: {
      coal_power: { co2: 2.1, water: 1.5, cost: 0.8 },
      gas_turbine: { co2: 1.1, water: 0.8, cost: 1.1 },
      grid_mix: { co2: 0.8, water: 0.5, cost: 1.3 },
      onsite_solar_wind: { co2: 0.05, water: 0.05, cost: 1.7 },
    },
    packaging: {
      plastic_polybag: { co2: 1.0, water: 1.0, circularity: 5, cost: 0.15 },
      recycled_cardboard: { co2: 0.3, water: 0.4, circularity: 80, cost: 0.35 },
      mycelium_bio_packaging: { co2: 0.05, water: 0.1, circularity: 100, cost: 0.65 },
      zero_packaging: { co2: 0.0, water: 0.0, circularity: 100, cost: 0.0 },
    },
    endOfLife: {
      landfill_waste: { co2: 0.9, water: 0.5, circularity: 0, cost: 0.10 },
      waste_incineration: { co2: 1.3, water: 0.1, circularity: 5, cost: 0.15 },
      take_back_recycling: { co2: 0.15, water: 0.2, circularity: 90, cost: 0.80 },
      industrial_composting: { co2: 0.05, water: 0.05, circularity: 95, cost: 0.50 },
    }
  }), []);

  // Sandbox simulation mathematical engine
  const evaluation: LCAEvaluationResult = useMemo(() => {
    if (!currentBrief) {
      return {
        carbonTotal: 0,
        waterTotal: 0,
        circularityIndex: 0,
        productionCost: 0,
        esgRating: 'F',
      };
    }

    // Isolate absolute volumes from generative nodes model representation
    const baseNodeCarbon = {
      sourcing: currentBrief.nodes.find(n => n.id.includes('source') || n.stageName === 'Sourcing')?.carbonAbsolute || 120,
      processing: currentBrief.nodes.find(n => n.id.includes('process') || n.stageName === 'Refining & Processing')?.carbonAbsolute || 180,
      assembly: currentBrief.nodes.find(n => n.id.includes('assembly') || n.stageName === 'Component Assembly')?.carbonAbsolute || 90,
      manufacturing: currentBrief.nodes.find(n => n.id.includes('manufact') || n.stageName === 'Primary Manufacturing')?.carbonAbsolute || 240,
      logistics: currentBrief.nodes.find(n => n.id.includes('logist') || n.stageName === 'Global Logistics')?.carbonAbsolute || 140,
      delivery: currentBrief.nodes.find(n => n.id.includes('deliver') || n.stageName === 'Last-Mile Delivery')?.carbonAbsolute || 60,
    };

    const baseWater = currentBrief.estimatedTotalWater || 1500000;
    const itemsScale = settings.batchSize / 50000;

    // Calculate Materials Stage Carbon
    const nodeSourcingCarbon = baseNodeCarbon.sourcing * multipliers.materials[settings.materialType].co2 * itemsScale;
    
    // Calculate Processing & Power Grid Stage Carbon
    const nodeProcessingCarbon = baseNodeCarbon.processing * multipliers.energy[settings.factoryEnergy].co2 * itemsScale;
    const nodeManufacturingCarbon = baseNodeCarbon.manufacturing * multipliers.energy[settings.factoryEnergy].co2 * itemsScale;
    const nodeAssemblyCarbon = baseNodeCarbon.assembly * multipliers.energy[settings.factoryEnergy].co2 * itemsScale;

    // Calculate Transportation Carbon (Scope 3 Logistics)
    const nodeLogisticsCarbon = baseNodeCarbon.logistics * multipliers.transit[settings.logisticTransit].co2 * itemsScale;
    const nodeDeliveryCarbon = baseNodeCarbon.delivery * multipliers.transit[settings.logisticTransit].co2 * itemsScale;

    // Packaging and disposal carbon additions
    const packagingCarbon = (settings.batchSize * 0.01) * multipliers.packaging[settings.packaging].co2;
    const disposalCarbon = (settings.batchSize * 0.008) * multipliers.endOfLife[settings.endOfLife].co2;

    const totalCarbon = nodeSourcingCarbon + nodeProcessingCarbon + nodeManufacturingCarbon + nodeAssemblyCarbon + nodeLogisticsCarbon + nodeDeliveryCarbon + packagingCarbon + disposalCarbon;

    // Water calculations
    const materialWaterMod = multipliers.materials[settings.materialType].water;
    const energyWaterMod = multipliers.energy[settings.factoryEnergy].water;
    const packingWaterMod = multipliers.packaging[settings.packaging].water;
    const totalWater = baseWater * ((materialWaterMod + energyWaterMod + packingWaterMod) / 3) * itemsScale;

    // Circularity Index scoring formula
    const matCirc = multipliers.materials[settings.materialType].circularity;
    const packCirc = multipliers.packaging[settings.packaging].circularity;
    const eolCirc = multipliers.endOfLife[settings.endOfLife].circularity;
    const circularityIndex = Math.round((matCirc * 0.5) + (packCirc * 0.15) + (eolCirc * 0.35));

    // Dynamic cost modeling
    const baseUnitCost = 14.50;
    const materialCostAdd = multipliers.materials[settings.materialType].cost;
    const energyCostAdd = multipliers.energy[settings.factoryEnergy].cost;
    const logisticsCostAdd = multipliers.transit[settings.logisticTransit].cost;
    const packagingCostAdd = multipliers.packaging[settings.packaging].cost;
    const disposalCostAdd = multipliers.endOfLife[settings.endOfLife].cost;

    const aggregateCostPerUnit = baseUnitCost + materialCostAdd + energyCostAdd + logisticsCostAdd + packagingCostAdd + disposalCostAdd;
    const productionCost = aggregateCostPerUnit * settings.batchSize;

    // Assign Composite ESG Rating
    let esgRating: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'B';
    const relativeImpactScore = (totalCarbon / itemsScale) / currentBrief.estimatedTotalCarbon;

    if (relativeImpactScore < 0.30 && circularityIndex > 85) esgRating = 'A+';
    else if (relativeImpactScore < 0.50 && circularityIndex > 70) esgRating = 'A';
    else if (relativeImpactScore < 0.85 && circularityIndex > 50) esgRating = 'B';
    else if (relativeImpactScore < 1.20 && circularityIndex > 30) esgRating = 'C';
    else if (relativeImpactScore < 1.60) esgRating = 'D';
    else esgRating = 'F';

    return {
      carbonTotal: Math.round(totalCarbon),
      waterTotal: Math.round(totalWater),
      circularityIndex,
      productionCost: Math.round(productionCost),
      esgRating,
    };
  }, [currentBrief, settings, multipliers]);

  const benchmarkCarbon = useMemo(() => {
    if (!currentBrief) return 0;
    const itemsScale = settings.batchSize / 50000;
    return Math.round(currentBrief.estimatedTotalCarbon * itemsScale);
  }, [currentBrief, settings.batchSize]);

  const benchmarkGreenAlternativeCarbon = useMemo(() => {
    if (!currentBrief) return 0;
    const itemsScale = settings.batchSize / 50000;
    // Cumulative AI green savings is around 45% based on nodes config
    return Math.round(currentBrief.estimatedTotalCarbon * 0.55 * itemsScale);
  }, [currentBrief, settings.batchSize]);

  // Reset sliders to default conventional line
  const handleReset = () => {
    onChangeSettings({
      batchSize: 50000,
      materialType: 'virgin_pet',
      logisticTransit: 'diesel_truck',
      factoryEnergy: 'coal_power',
      packaging: 'plastic_polybag',
      endOfLife: 'landfill_waste',
    });
  };

  const updateSetting = (key: keyof SandboxSettings, value: any) => {
    onChangeSettings({
      ...settings,
      [key]: value
    });
  };

  // Safe division guard
  const carbonSavingsPercentage = useMemo(() => {
    if (benchmarkCarbon === 0) return 0;
    const savings = ((benchmarkCarbon - evaluation.carbonTotal) / benchmarkCarbon) * 100;
    return Math.round(savings);
  }, [benchmarkCarbon, evaluation.carbonTotal]);

  return (
    <div className="space-y-6">
      {/* Simulation Bento Metros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border-2 border-[#141414] rounded-none p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono tracking-wider uppercase text-slate-500 font-bold">DYNAMIC CARBON IMPACT</span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border ${
              carbonSavingsPercentage > 0 ? 'bg-emerald-100 text-emerald-900 border-emerald-600' : 'bg-red-100 text-red-900 border-red-600'
            }`}>
              {carbonSavingsPercentage > 0 ? `-${carbonSavingsPercentage}%` : `+${Math.abs(carbonSavingsPercentage)}%`}
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold font-mono tracking-tight text-[#141414]">
              {evaluation.carbonTotal.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal font-sans">MT CO₂e</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <TrendingDown className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              Scope 1, 2, 3 cumulative total
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border-2 border-[#141414] rounded-none p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono tracking-wider uppercase text-slate-500 font-bold">CIRCULARITY INDEX</span>
            <span className="text-[10px] font-mono text-cyan-900 bg-cyan-100 border border-cyan-500 px-2 py-0.5 font-bold">
              Recycling Loop
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold font-mono tracking-tight text-[#141414]">
              {evaluation.circularityIndex}%
            </div>
            {/* Simple circularity progress bar */}
            <div className="w-full bg-[#e4e3e0] h-1.5 rounded-none mt-2 overflow-hidden border border-[#141414]/30">
              <div 
                className="bg-cyan-600 h-full transition-all duration-300"
                style={{ width: `${evaluation.circularityIndex}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border-2 border-[#141414] rounded-none p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono tracking-wider uppercase text-slate-500 font-bold">ESTIMATED WATER FOOTPRINT</span>
            <span className="text-[10px] font-mono text-blue-900 bg-blue-100 border border-blue-500 px-2 py-0.5 font-bold">
              Aqueous Cost
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold font-mono tracking-tight text-[#141414]">
              {evaluation.waterTotal.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal font-sans">Liters</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-sans">Consumptive processing footprint</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border-2 border-[#141414] rounded-none p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono tracking-wider uppercase text-slate-500 font-bold">GLOBAL ESG RATING</span>
            <span className="text-[10px] font-mono text-emerald-900 bg-emerald-100 border border-emerald-500 px-2 py-0.5 font-bold">
              Scope Grader
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <div className="text-4xl font-extrabold font-mono tracking-tight text-emerald-700">
              {evaluation.esgRating}
            </div>
            <div className="text-[11px] text-slate-500 font-mono font-bold">
              Unit: ${(evaluation.productionCost / settings.batchSize).toFixed(2)}
            </div>
          </div>
          {/* Subtle background ESG water seal */}
          <div className="absolute right-[-10px] bottom-[-20px] text-8xl font-black text-slate-950/40 select-none font-mono">
            {evaluation.esgRating[0]}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Control Board */}
        <div className="lg:col-span-7 bg-white border-2 border-[#141414] rounded-none p-5 space-y-5">
          <div className="flex items-center justify-between border-b-2 border-[#141414] pb-3">
            <div className="flex items-center gap-1.5">
              <Sliders className="h-4.5 w-4.5 text-[#141414]" />
              <h3 className="text-sm font-bold text-[#141414] tracking-tight font-sans">Scope 1, 2, 3 Material Sandbox</h3>
            </div>
            <button
              onClick={handleReset}
              className="text-[11px] font-mono text-[#141414]/70 hover:text-emerald-700 flex items-center gap-1 cursor-pointer transition font-bold"
            >
              <RotateCcw className="h-3 w-3" /> Reset Baseline
            </button>
          </div>

          <div className="space-y-4">
            {/* Batch Size Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="text-[#141414]/80 font-bold uppercase tracking-wider font-mono text-[10px] flex items-center gap-1">
                  1. Production Batch Volume
                  <HelpCircle className="h-3 w-3 text-slate-500" title="Total annual items produced" />
                </label>
                <span className="font-mono text-emerald-800 font-bold text-xs">{settings.batchSize.toLocaleString()} Units</span>
              </div>
              <input
                type="range"
                min="10000"
                max="200000"
                step="5000"
                value={settings.batchSize}
                onChange={(e) => updateSetting('batchSize', parseInt(e.target.value))}
                className="w-full h-1.5 bg-[#e4e3e0] rounded-none appearance-none cursor-pointer accent-[#141414] border border-[#141414]"
              />
            </div>

            {/* Sourcing dropdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-[#141414]/80 font-bold uppercase tracking-wider font-mono block">2. Primary Material Choice</label>
                <select
                  value={settings.materialType}
                  onChange={(e) => updateSetting('materialType', e.target.value)}
                  className="w-full bg-white border-2 border-[#141414] text-[#141414] rounded-none p-2 text-xs focus:ring-1 focus:ring-[#141414] focus:outline-none font-mono"
                >
                  <option value="virgin_pet">Virgin Polyester / Plastics (Standard)</option>
                  <option value="recycled_pet">Recycled PET (Eco)</option>
                  <option value="biodegradable_polymer">Mycelium Bio-polymer (Ultra Clean)</option>
                  <option value="organic_cotton">Organic Local Cotton (Renewable)</option>
                  <option value="recycled_aluminum">Recycled Aerospace Aluminum (Low Energy)</option>
                  <option value="sustainable_wood">Certified Sustainable Softwood (Sequest)</option>
                </select>
              </div>

              {/* Transit System */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-[#141414]/80 font-bold uppercase tracking-wider font-mono block">3. Primary Freight Method</label>
                <select
                  value={settings.logisticTransit}
                  onChange={(e) => updateSetting('logisticTransit', e.target.value)}
                  className="w-full bg-white border-2 border-[#141414] text-[#141414] rounded-none p-2 text-xs focus:ring-1 focus:ring-[#141414] focus:outline-none font-mono"
                >
                  <option value="diesel_truck">Diesel Commercial Trucking (Baseline)</option>
                  <option value="air_freight">Air Freight (Fastest, Extreme Carbon)</option>
                  <option value="cargo_vessel">Diesel Ocean Cargo Vessel (Slow, Efficient)</option>
                  <option value="railway">Electric Railway Freight (Clean, Continental)</option>
                  <option value="electric_truck">Electrified Local Grid Trucking (Ultra Clean)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Plant Energy */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-[#141414]/80 font-bold uppercase tracking-wider font-mono block">4. Sourcing Factory Grid Mix</label>
                <select
                  value={settings.factoryEnergy}
                  onChange={(e) => updateSetting('factoryEnergy', e.target.value)}
                  className="w-full bg-white border-2 border-[#141414] text-[#141414] rounded-none p-2 text-xs focus:ring-1 focus:ring-[#141414] focus:outline-none font-mono"
                >
                  <option value="coal_power">Coal Dominant Thermal Power (High GHG)</option>
                  <option value="gas_turbine">Natural Gas Turbine Plant (Moderate)</option>
                  <option value="grid_mix">Standard Public Grid Mix (Regional)</option>
                  <option value="onsite_solar_wind">100% On-Site Solar & Wind (Carbon Neutral)</option>
                </select>
              </div>

              {/* Product Packaging */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-[#141414]/80 font-bold uppercase tracking-wider font-mono block">5. Protective Packaging Concept</label>
                <select
                  value={settings.packaging}
                  onChange={(e) => updateSetting('packaging', e.target.value)}
                  className="w-full bg-white border-2 border-[#141414] text-[#141414] rounded-none p-2 text-xs focus:ring-1 focus:ring-[#141414] focus:outline-none font-mono"
                >
                  <option value="plastic_polybag">Single-use PP Plastic Wrap (Baseline)</option>
                  <option value="recycled_cardboard">Unbleached Recycled Cardboard (Sustainable)</option>
                  <option value="mycelium_bio_packaging">Mushrooms Mycelium bio-caps (Compostable)</option>
                  <option value="zero_packaging">Zerolink Minimalist Loose Pack (Zero Waste)</option>
                </select>
              </div>
            </div>

            {/* Disposal end of life */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-[#141414]/80 font-bold uppercase tracking-wider font-mono block">6. Post-Consumer End of Life Scenario</label>
              <select
                value={settings.endOfLife}
                onChange={(e) => updateSetting('endOfLife', e.target.value)}
                className="w-full bg-white border-2 border-[#141414] text-[#141414] rounded-none p-2 text-xs focus:ring-1 focus:ring-[#141414] focus:outline-none font-mono"
              >
                <option value="landfill_waste">Unregulated City Landfill Dump (Methane Source)</option>
                <option value="waste_incineration">Standard Waste Incineration (Energy Recovery)</option>
                <option value="take_back_recycling">Corporate Take-Back Closed Loop (Chemical Recycle)</option>
                <option value="industrial_composting">Industrial Scale Biodegradable Composting (Nutrient Loop)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Interactive SVG LCA Chart */}
        <div className="lg:col-span-5 bg-white border-2 border-[#141414] rounded-none p-5 flex flex flex-col justify-between">
          <div className="flex items-center gap-1.5 border-b-2 border-[#141414] pb-3">
            <BarChart3 className="h-4.5 w-4.5 text-[#141414]" />
            <h3 className="text-sm font-bold text-[#141414] tracking-tight font-sans">Scope 3 Carbon Multi-Scenario Chart</h3>
          </div>

          {currentBrief ? (
            <div className="mt-4 flex-1 flex flex-col justify-between">
              {/* Clean interactive custom SVG Bar chart */}
              <div className="relative h-44 w-full bg-[#e4e3e0]/30 rounded-none p-3 border-2 border-[#141414] flex items-end justify-around pb-6 pt-8">
                {/* Visual Y-Axis values */}
                <div className="absolute left-2.5 top-2.5 flex flex-col justify-between h-32 text-[9px] font-mono text-[#141414]/70 font-bold">
                  <span>MAX MT CO₂e: {Math.max(benchmarkCarbon, evaluation.carbonTotal, benchmarkGreenAlternativeCarbon).toLocaleString()}</span>
                  <span>MIN MT CO₂e: 0</span>
                </div>

                {/* Bar 1: Conventional Benchmark */}
                <div className="flex flex-col items-center group relative w-12 h-full justify-end">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-[#141414] border border-[#141414] text-[10px] font-mono text-white px-2 py-0.5 rounded-none shadow z-10 whitespace-nowrap transition-all duration-150">
                    {benchmarkCarbon.toLocaleString()} MT
                  </div>
                  <div 
                    className="w-full bg-[#141414]/40 group-hover:bg-[#141414]/65 rounded-none transition-all duration-300 border border-[#141414]" 
                    style={{ height: `${(benchmarkCarbon / Math.max(benchmarkCarbon, evaluation.carbonTotal, 1)) * 100}%` }}
                  />
                  <span className="absolute top-full mt-1.5 text-[9px] font-mono text-slate-600 text-center uppercase tracking-tighter truncate w-14 font-bold">
                    Benchmark
                  </span>
                </div>

                {/* Bar 2: Active Sandbox configuration */}
                <div className="flex flex-col items-center group relative w-12 h-full justify-end">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-1 opacity-100 bg-emerald-100 border border-emerald-600 text-[10px] font-mono text-emerald-900 px-2 py-0.5 rounded-none shadow-none z-10 whitespace-nowrap transition-all duration-150 font-bold">
                    {evaluation.carbonTotal.toLocaleString()} MT
                  </div>
                  <div 
                    className="w-full bg-emerald-600 hover:bg-emerald-500 rounded-none transition-all duration-300 border border-[#141414]" 
                    style={{ height: `${(evaluation.carbonTotal / Math.max(benchmarkCarbon, evaluation.carbonTotal, 1)) * 100}%` }}
                  />
                  <span className="absolute top-full mt-1.5 text-[9px] font-mono text-emerald-800 text-center font-black uppercase tracking-tighter truncate w-14">
                    Sandbox
                  </span>
                </div>

                {/* Bar 3: Fully Optimized Alternative */}
                <div className="flex flex-col items-center group relative w-12 h-full justify-end">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-cyan-900 text-white text-[10px] font-mono px-2 py-0.5 rounded-none shadow-none z-10 whitespace-nowrap transition-all duration-150">
                    {benchmarkGreenAlternativeCarbon.toLocaleString()} MT
                  </div>
                  <div 
                    className="w-full bg-cyan-600 hover:bg-cyan-500 rounded-none transition-all duration-300 border border-[#141414]" 
                    style={{ height: `${(benchmarkGreenAlternativeCarbon / Math.max(benchmarkCarbon, evaluation.carbonTotal, 1)) * 100}%` }}
                  />
                  <span className="absolute top-full mt-1.5 text-[9px] font-mono text-cyan-800 text-center uppercase tracking-tighter truncate w-14 font-bold">
                    Opt-ESG
                  </span>
                </div>
              </div>

              {/* Environmental statistics analysis comment */}
              <div className="mt-4 bg-[#e4e3e0]/20 border border-[#141414] rounded-none p-3 text-xs space-y-2">
                <div className="flex items-start gap-1.5 font-mono text-[#141414] text-[11px] font-bold">
                  <Info className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>
                    Your active sandbox is achieving a{' '}
                    <strong className="text-emerald-800 underline decoration-2">{carbonSavingsPercentage}% drop</strong> in Scope 3 greenhouse gas equivalents against base layout.
                  </span>
                </div>
                <div className="text-[10px] text-slate-600 leading-relaxed font-sans font-medium">
                  The primary driver is your combination of <strong className="text-[#141414] capitalize">{settings.materialType.replace('_', ' ')}</strong> materials and <strong className="text-[#141414] capitalize">{settings.factoryEnergy.replace('_', ' ')}</strong> configurations.
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8 flex flex-col justify-center items-center text-center py-10">
              <Activity className="h-8 w-8 text-slate-700 animate-pulse mb-2" />
              <span className="text-xs text-slate-500 font-mono">Benchmark sandbox ready</span>
              <p className="text-[10px] text-slate-450 mt-1 max-w-xs">
                Calculations and multi-scenario footprint curves populate instantly once a product is modeled.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
