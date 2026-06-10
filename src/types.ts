export interface AlternativeGreenOption {
  material: string;
  transport: string;
  notes: string;
  savingsPercentage: number;
}

export interface SupplyChainNode {
  id: string;
  name: string;
  stageName: 'Sourcing' | 'Refining & Processing' | 'Component Assembly' | 'Primary Manufacturing' | 'Global Logistics' | 'Last-Mile Delivery';
  location: string;
  description: string;
  carbonIntensity: number; // kg CO2e per unit of input
  carbonAbsolute: number;  // total MT CO2e for the volume
  waterUsageValue: number; // Liters per unit
  riskFactor: number;      // 1 to 100 environmental/supply-chain risk
  riskNotes: string;
  materialsUsed: string[];
  energySource: string;
  alternativeGreenOption: AlternativeGreenOption;
}

export interface ProductESGBrief {
  productName: string;
  rawMaterialSourcing: string;
  manufacturingProcess: string;
  estimatedTotalCarbon: number; // In metric tons CO2e
  estimatedTotalWater: number;  // In Liters
  circularityScore: number;     // 0-100
  nodes: SupplyChainNode[];
  redFlags: string[];
  industryBenchmarkCompare: number; // percentage (-50 means 50% cleaner than industry average, +20 means worse)
}

export interface SandboxSettings {
  batchSize: number;
  materialType: 'virgin_pet' | 'recycled_pet' | 'biodegradable_polymer' | 'organic_cotton' | 'recycled_aluminum' | 'sustainable_wood';
  logisticTransit: 'air_freight' | 'cargo_vessel' | 'electric_truck' | 'diesel_truck' | 'railway';
  factoryEnergy: 'coal_power' | 'gas_turbine' | 'grid_mix' | 'onsite_solar_wind';
  packaging: 'plastic_polybag' | 'recycled_cardboard' | 'mycelium_bio_packaging' | 'zero_packaging';
  endOfLife: 'landfill_waste' | 'waste_incineration' | 'take_back_recycling' | 'industrial_composting';
}

export interface LCAEvaluationResult {
  carbonTotal: number;      // Metric tons CO2e
  waterTotal: number;       // Liters
  circularityIndex: number; // Percentage
  productionCost: number;   // USD
  esgRating: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
