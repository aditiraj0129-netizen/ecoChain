import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded GoogleGenAI Client to avoid crashes if API key is not ready during start phase
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required to run AI features. Please provide it in the Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// 1. Endpoint to generate a fully modeled ESG supply chain lifecycle brief for any product description
app.post("/api/gemini/generate-lifecycle", async (req, res) => {
  try {
    const { productDescription } = req.body;
    if (!productDescription || typeof productDescription !== 'string') {
      res.status(400).json({ error: "productDescription string is required" });
      return;
    }

    const ai = getGeminiClient();

    const systemPrompt = `
      You are an expert Sustainability Consultant and ESG Life Cycle Assessment (LCA) lead auditor.
      Your task is to model a highly detailed and realistic supply chain lifecycle assessment (LCA) brief for the requested product.
      In your modeling, you must map out a realistic 6-stage supply chain spanning the globe, representing locations with highly relevant raw resources or manufacturing hub profiles (e.g. Copper extraction in Chile, assembly in Hanoi/Hsinchu, packaging in Gothenburg, trucking details).
      Analyze Scope 1, Scope 2, and especially Scope 3 emissions representing raw material sourcing, processing, transportation modes (sea cargo, rail, cargo air, diesel trucking), and packaging options.
      All calculations should assume a mock production volume of exactly 50,000 finished units.
      Return the calculations in a perfectly formed, complete, and syntactically valid JSON matching the requested schema. Ensure data is rich, technical, and contains zero placeholders.
    `;

    const userPrompt = `Model a full life cycle ESG assessment and supply chain nodes map of exactly 50,000 batches for this product: "${productDescription}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productName: { type: Type.STRING },
            rawMaterialSourcing: { type: Type.STRING },
            manufacturingProcess: { type: Type.STRING },
            estimatedTotalCarbon: { type: Type.NUMBER, description: "Total lifecycle CO2 equivalent in metric tons (MT CO2e) for 50,000 units." },
            estimatedTotalWater: { type: Type.NUMBER, description: "Total lifecycle water usage in Liters for 50,000 units." },
            circularityScore: { type: Type.INTEGER, description: "Overall product circularity index from 0 (completely linear) to 100 (fully circular circular economy)." },
            redFlags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 3-4 specific sustainability vulnerabilities, carbon hot-spots, or human-rights risks discovered in this supply chain."
            },
            industryBenchmarkCompare: { type: Type.NUMBER, description: "Percentage comparison to conventional alternative. Negative means cleaner, e.g. -20% carbon savings." },
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "unique identifier stage slug (e.g., sourcing, processing, assembly, manufacturing, logistics, delivery)" },
                  name: { type: Type.STRING, description: "Specific technical name (e.g., Titanium Ore Mining, Atacama Lithium Evaporation, Ocean Bulk Shipping, Recycled Cardboard Board Press)" },
                  stageName: { 
                    type: Type.STRING, 
                    description: "Set to EXACTLY one of: 'Sourcing', 'Refining & Processing', 'Component Assembly', 'Primary Manufacturing', 'Global Logistics', 'Last-Mile Delivery'"
                  },
                  location: { type: Type.STRING, description: "Sourcing or transit location (e.g. 'Salar de Atacama, Chile', 'Hsinchu Science Park, Taiwan', 'Rotterdam Port, Netherlands')" },
                  description: { type: Type.STRING, description: "1-2 sentence description of technical operations taking place at this node." },
                  carbonIntensity: { type: Type.NUMBER, description: "Estimated kg CO2e environmental loading per unique finished unit produced." },
                  carbonAbsolute: { type: Type.NUMBER, description: "Total carbon impact at this node in Metric Tons CO2e for the whole batch of 50,000." },
                  waterUsageValue: { type: Type.NUMBER, description: "Liters of fresh water consumed or contaminated per unit at this stage." },
                  riskFactor: { type: Type.INTEGER, description: "A composite ESG risk score from 1 (pristine) to 100 (high geopolitical, carbon, or extraction stress)." },
                  riskNotes: { type: Type.STRING, description: "Explanation of risk (water shortages, grid coal-dependence, transit disruption risk)." },
                  materialsUsed: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  energySource: { type: Type.STRING, description: "Energy system power at node (e.g., Coal-heavy grid, Solar tracking array, Heavy fuel oil, Geothermal heat)." },
                  alternativeGreenOption: {
                    type: Type.OBJECT,
                    properties: {
                      material: { type: Type.STRING, description: "Pre-modeled carbon mitigation material or alternative logistics route (e.g. Recycled aircraft-grade scrap alloy)" },
                      transport: { type: Type.STRING, description: "Lower carbon freight e.g. Electrified rail network" },
                      notes: { type: Type.STRING, description: "Actionable strategic transition roadmap step" },
                      savingsPercentage: { type: Type.NUMBER, description: "Estimated carbon reduction percentage possible if this option is chosen (e.g. 45)" }
                    },
                    required: ["material", "transport", "notes", "savingsPercentage"]
                  }
                },
                required: [
                  "id", "name", "stageName", "location", "description", 
                  "carbonIntensity", "carbonAbsolute", "waterUsageValue", 
                  "riskFactor", "riskNotes", "materialsUsed", "energySource", 
                  "alternativeGreenOption"
                ]
              }
            }
          },
          required: [
            "productName", "rawMaterialSourcing", "manufacturingProcess", 
            "estimatedTotalCarbon", "estimatedTotalWater", "circularityScore", 
            "redFlags", "industryBenchmarkCompare", "nodes"
          ]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response body received from Gemini LLM");
    }

    // Return the parsed JSON
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("ESG Lifecycle generation failed:", error);
    res.status(500).json({ error: error.message || "Failed to generate supply chain LCA structure." });
  }
});

// 2. Chatbot auditor assistant endpoint
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, currentBrief, settings, history } = req.body;
    if (!message) {
      res.status(400).json({ error: "message is required in the body" });
      return;
    }

    const ai = getGeminiClient();

    const systemInstruction = `
      You are the EcoChain AI Auditor, a world-class AI Sustainability & Circular Supply Chain consultant.
      You are auditing a product named: ${currentBrief?.productName || "an unnamed custom product"}.
      The product's basic brief is: Sourcing - ${currentBrief?.rawMaterialSourcing || "Not generated yet"}, Process - ${currentBrief?.manufacturingProcess || "Not generated yet"}.
      It has a current total base carbon loading of ${currentBrief?.estimatedTotalCarbon || 0} MT CO2e and a circularity index of ${currentBrief?.circularityScore || 0}%.
      
      The user is running "What-If" Life Cycle Assessment (LCA) sandbox simulations with these settings:
      - Sourcing Batch Size: ${settings?.batchSize || 50000} items
      - Primary Fabric/Material: ${settings?.materialType || "Standard Choice"}
      - Global Logistics Transport: ${settings?.logisticTransit || "Standard Choice"}
      - Production Plant Energy Grid: ${settings?.factoryEnergy || "Standard Choice"}
      - Primary Packaging Concept: ${settings?.packaging || "Standard Choice"}
      - Disposal / End of Life: ${settings?.endOfLife || "Standard Choice"}

      Your goals:
      1. Provide highly professional, mathematically backed, actionable responses explaining where carbon footprints can be mitigated.
      2. Answer queries scientifically using Scope 3 methodologies (GHG Protocol guidelines, DEFRA multipliers, and Life Cycle Assessment standards).
      3. Compare options (e.g., explain the real carbon value of Recycled PET over Virgin Polyester, or explain how electric rail fleets crush air-freight carbon outputs).
      4. Avoid boilerplate or generic fluff. Keep responses compact, authoritative, engaging, and professional. Speak like a senior supply chain leader.
    `;

    // Construct history parts if exists, else a simpler request. Keep prompts structured.
    let contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      });
    }
    
    // Add current user request
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("AI ESG Chat failed:", error);
    res.status(500).json({ error: error.message || "Audit assistant encountered an error." });
  }
});

// 3. Setup static serving and Vite HMR replacement
async function runServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with active Vite routing...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production assets from client bundle...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EcoChain AI server listening securely on port ${PORT}`);
  });
}

runServer().catch((err) => {
  console.error("Critical server boot failure:", err);
});
