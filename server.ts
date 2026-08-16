import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser middleware
  app.use(express.json({ limit: "25mb" }));

  // Shared Gemini client initializer with mandatory User-Agent
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY || "";
    return new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      system: "macOS 10.13.6 High Sierra AI Studio Core",
      nodeVersion: "16.20.2",
      npmVersion: "8.19.4",
      geminiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Cloud Gemini Chat Endpoint
  app.post("/api/chat", async (req, res) => {
    const startTime = Date.now();
    try {
      const {
        prompt,
        messages = [],
        model = "gemini-3.7-flash",
        systemPrompt = "You are a macOS High Sierra AI Assistant.",
        temperature = 0.7,
        topP = 0.9,
        imageAttachment,
      } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.status(400).json({
          error:
            "Gemini API key is not configured. Please add your GEMINI_API_KEY in the Settings > Secrets panel. Alternatively, you can select a local model (such as Llama 3 8B, DeepSeek R1, or Qwen 2.5) to run locally with High Sierra Metal 2 GPU acceleration.",
          isApiKeyError: true,
        });
      }

      const ai = getGeminiClient();

      // Normalize model ID
      let targetModel = model || "gemini-3.7-flash";
      if (targetModel.includes("3.6")) {
        targetModel = "gemini-3.7-flash";
      }

      // Format parts if image attachment exists or multi-turn history exists
      let contents: any;
      if (messages && messages.length > 0) {
        const historyParts = messages.map((m: any) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content || "" }],
        }));

        if (imageAttachment && imageAttachment.dataUrl) {
          const matches = imageAttachment.dataUrl.match(/^data:(.+);base64,(.+)$/);
          const mimeType = matches ? matches[1] : "image/jpeg";
          const base64Data = matches ? matches[2] : imageAttachment.dataUrl;

          historyParts.push({
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
              { text: prompt },
            ],
          });
        } else {
          historyParts.push({
            role: "user",
            parts: [{ text: prompt }],
          });
        }
        contents = historyParts;
      } else if (imageAttachment && imageAttachment.dataUrl) {
        const matches = imageAttachment.dataUrl.match(/^data:(.+);base64,(.+)$/);
        const mimeType = matches ? matches[1] : "image/jpeg";
        const base64Data = matches ? matches[2] : imageAttachment.dataUrl;

        contents = {
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
            { text: prompt },
          ],
        };
      } else {
        contents = prompt;
      }

      // Generate content with Gemini
      const response = await ai.models.generateContent({
        model: targetModel,
        contents,
        config: {
          systemInstruction: systemPrompt,
          temperature: Number(temperature),
          topP: Number(topP),
        },
      });

      const text = response.text || "No output generated.";
      const durationSec = Math.max((Date.now() - startTime) / 1000, 0.1);
      const estimatedTokens = Math.ceil(text.length / 3.8);
      const speedTokPerSec = Math.round(estimatedTokens / durationSec);

      return res.json({
        text,
        tokensUsed: estimatedTokens,
        speedTokPerSec,
        model: targetModel,
        durationMs: Math.round(durationSec * 1000),
      });
    } catch (err: any) {
      console.error("Gemini API error:", err);
      const errorMsg = err?.message || String(err);
      const isKeyInvalid =
        errorMsg.includes("API key not valid") ||
        errorMsg.includes("API_KEY_INVALID") ||
        errorMsg.includes("400") ||
        errorMsg.includes("API key");

      if (isKeyInvalid) {
        return res.status(400).json({
          error:
            "Gemini API key is invalid or unauthorized. Please verify your GEMINI_API_KEY in the Settings > Secrets panel. You can also select local models (Llama 3, DeepSeek R1, Qwen 2.5) to run offline without an API key.",
          isApiKeyError: true,
        });
      }

      return res.status(500).json({
        error: errorMsg || "Failed to process chat request via Gemini API",
      });
    }
  });

  // Local Ollama / LM Studio Proxy & Fallback Simulation Endpoint
  app.post("/api/local-chat", async (req, res) => {
    const startTime = Date.now();
    const {
      prompt,
      model = "llama3:8b",
      localServerUrl = "http://localhost:11434",
      simulationMode = true,
      systemPrompt,
      vramOffloadPercent = 85,
      cpuThreads = 8,
    } = req.body;

    // Try real HTTP request to local server first if accessible
    try {
      const isOllama = localServerUrl.includes("11434");
      const targetEndpoint = isOllama
        ? `${localServerUrl.replace(/\/$/, "")}/api/generate`
        : `${localServerUrl.replace(/\/$/, "")}/v1/chat/completions`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500); // quick fail to fallback if not running

      const payload = isOllama
        ? {
            model,
            prompt: systemPrompt ? `${systemPrompt}\n\nUser: ${prompt}` : prompt,
            stream: false,
          }
        : {
            model,
            messages: [
              ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
              { role: "user", content: prompt },
            ],
          };

      const resp = await fetch(targetEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (resp.ok) {
        const data = await resp.json();
        let text = "";
        if (isOllama) {
          text = data.response || "";
        } else {
          text = data.choices?.[0]?.message?.content || "";
        }

        const durationSec = Math.max((Date.now() - startTime) / 1000, 0.1);
        const estimatedTokens = Math.ceil(text.length / 3.8);
        const speedTokPerSec = Math.round(estimatedTokens / durationSec);

        return res.json({
          text,
          tokensUsed: estimatedTokens,
          speedTokPerSec,
          model,
          isRealLocalServer: true,
        });
      }
    } catch (_err) {
      // Local server wasn't reached or timed out -> fallback to simulated Metal 2 local LLM if enabled
    }

    if (simulationMode) {
      // Generate authentic high-quality local LLM simulated response
      const durationSec = 0.8 + Math.random() * 0.6;
      let text = "";

      if (model.includes("deepseek") || prompt.toLowerCase().includes("think") || prompt.toLowerCase().includes("reason")) {
        text = `<think>
1. Analyzing user query: "${prompt.slice(0, 80)}"
2. Allocating ${vramOffloadPercent}% VRAM layers to High Sierra Metal 2 GPU (Radeon Pro 560).
3. Distributing remaining compute across ${cpuThreads} Intel Core i7 threads.
4. Synthesizing chain-of-thought reasoning steps for local inference.
</think>

[Local Metal 2 Acceleration Active | Model: ${model}]

Here is the solution to your request:

Based on local GGUF matrix computations on macOS 10.13 High Sierra, here is the breakdown:

- **Local Execution Node**: localhost (Metal 2 GPU Pipeline)
- **Quantization Level**: Q4_K_M
- **Status**: Completed without cloud transmission.

\`\`\`bash
# Local Metal 2 APFS Benchmark
metal2-cli --vram-check --model ${model}
echo "Local LLM Inference Completed!"
\`\`\`

If you'd like me to run further computations or write additional scripts, let me know!`;
      } else if (prompt.toLowerCase().includes("code") || prompt.toLowerCase().includes("script") || prompt.toLowerCase().includes("terminal") || prompt.toLowerCase().includes("python") || prompt.toLowerCase().includes("js")) {
        text = `Here is the requested code synthesized locally using ${model} via Metal 2 GPU acceleration:

\`\`\`javascript
// High Sierra Local Compute Demo (Node.js 16.20.2 & Chrome 115+)
function computeMetalAcceleration(vramPercent, threads) {
  const metal2Layers = Math.round((vramPercent / 100) * 32);
  console.log(\`[Metal 2 Engine] Offloaded \${metal2Layers}/32 layers to Radeon Pro VRAM.\`);
  console.log(\`[CPU Core] Active threads: \${threads}.\`);
  return { status: "ACTIVE_METAL_2", throughputTokPerSec: 42.5 };
}

computeMetalAcceleration(${vramOffloadPercent}, ${cpuThreads});
\`\`\`

You can preview and run script outputs directly in the **HighSierra Terminal Shell** drawer!`;
      } else {
        text = `[Local Inference Output - ${model} via Metal 2 GPU]

Hello! I am running completely locally on your macOS 10.13 High Sierra system via Metal 2 offloading (${vramOffloadPercent}% GPU VRAM, ${cpuThreads} CPU threads).

Your prompt was processed locally:
> "${prompt}"

No data was transmitted over the cloud. You have full offline access, prompt parameter tuning, and APFS local storage persistence!`;
      }

      const estimatedTokens = Math.ceil(text.length / 3.8);
      const speedTokPerSec = Math.round(28 + Math.random() * 15);

      return res.json({
        text,
        tokensUsed: estimatedTokens,
        speedTokPerSec,
        model,
        isRealLocalServer: false,
        simulatedMetal2: true,
      });
    }

    return res.status(503).json({
      error: `Could not connect to local server at ${localServerUrl}. Make sure Ollama or LM Studio is running, or enable 'Simulation Mode' in System Preferences to test offline local models.`,
    });
  });

  // Vite middleware for development vs Static file server for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[High Sierra AI Studio] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
