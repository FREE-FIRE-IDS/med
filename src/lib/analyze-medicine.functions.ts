import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  medicine: z.string().trim().min(1).max(120),
  language: z.enum(["english", "urdu", "roman_urdu"]),
});

export type MedicineAnalysis = {
  generic_name: string;
  brand_names: string;
  drug_class: string;
  dose: string;
  forms: string;
  mechanism_of_action: string;
  indications: string;
  contraindications: string;
  side_effects: string;
  age_recommendation: string;
  uses: string;
  warning: string;
};

const langInstructions: Record<string, string> = {
  english: "Respond in clear professional English.",
  urdu: "Respond entirely in Urdu script (اردو). Every field value must be in Urdu.",
  roman_urdu:
    "Respond in Roman Urdu (Urdu written using English/Latin letters). Every field value must be in Roman Urdu.",
};

export const analyzeMedicine = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<MedicineAnalysis> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const system = `You are PHARM AI, a clinical pharmacology assistant. Given a medicine name (brand or generic), return a concise, accurate structured analysis for pharmacy students & practitioners. ${langInstructions[data.language]} Always include a short safety warning that this is educational info, not a substitute for a doctor.`;

    const tool = {
      type: "function",
      function: {
        name: "return_medicine_analysis",
        description: "Return structured medicine information",
        parameters: {
          type: "object",
          additionalProperties: false,
          properties: {
            generic_name: { type: "string" },
            brand_names: { type: "string", description: "Common brand names, comma separated" },
            drug_class: { type: "string", description: "Pharmacological class" },
            dose: { type: "string", description: "Typical strengths / doses (e.g. 25/50/75 mg)" },
            forms: { type: "string", description: "Available dosage forms (tablet, dispersible, injection...)" },
            mechanism_of_action: { type: "string" },
            indications: { type: "string" },
            contraindications: { type: "string" },
            side_effects: { type: "string" },
            age_recommendation: { type: "string", description: "Minimum age / age groups who can take it" },
            uses: { type: "string" },
            warning: { type: "string" },
          },
          required: [
            "generic_name",
            "brand_names",
            "drug_class",
            "dose",
            "forms",
            "mechanism_of_action",
            "indications",
            "contraindications",
            "side_effects",
            "age_recommendation",
            "uses",
            "warning",
          ],
        },
      },
    };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
      },
      body: JSON.stringify({
        model: "google/gemini-3.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: `Analyze this medicine: ${data.medicine}` },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "return_medicine_analysis" } },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429) throw new Error("Rate limit reached. Please try again shortly.");
      if (res.status === 402) throw new Error("AI credits exhausted. Please add credits to your workspace.");
      throw new Error(`AI error: ${res.status} ${text.slice(0, 200)}`);
    }

    const json = await res.json();
    const call = json?.choices?.[0]?.message?.tool_calls?.[0];
    if (!call?.function?.arguments) throw new Error("No analysis returned");
    return JSON.parse(call.function.arguments) as MedicineAnalysis;
  });
