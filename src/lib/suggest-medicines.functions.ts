import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  query: z.string().trim().min(1).max(60),
});

export const suggestMedicines = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<string[]> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const tool = {
      type: "function",
      function: {
        name: "return_suggestions",
        description: "Return recommended medicine name suggestions",
        parameters: {
          type: "object",
          additionalProperties: false,
          properties: {
            suggestions: {
              type: "array",
              items: { type: "string" },
              description: "Up to 6 medicine names (brand or generic) matching the partial query",
            },
          },
          required: ["suggestions"],
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
          {
            role: "system",
            content:
              "You suggest real medicine names (brand or generic, worldwide including South Asia) based on a partial user query. Return 4-6 concise names only, most relevant first. No descriptions.",
          },
          { role: "user", content: `Partial: "${data.query}". Suggest matching medicines.` },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "return_suggestions" } },
      }),
    });

    if (!res.ok) return [];
    const json = await res.json();
    const call = json?.choices?.[0]?.message?.tool_calls?.[0];
    if (!call?.function?.arguments) return [];
    try {
      const parsed = JSON.parse(call.function.arguments);
      const arr = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
      return arr.filter((s: unknown): s is string => typeof s === "string").slice(0, 6);
    } catch {
      return [];
    }
  });
