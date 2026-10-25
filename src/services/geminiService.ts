import { Finding, BrandRule, ApprovedFactSource, TerminologyItem } from '../types';

export async function runContextualReviewWithAI(
  content: string,
  rules: BrandRule[],
  facts: ApprovedFactSource[],
  terminology: TerminologyItem[],
  market: string = 'US',
  channel: string = 'LinkedIn',
  apiKey?: string
): Promise<Finding[]> {
  const geminiKey = apiKey || (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY;

  if (geminiKey) {
    try {
      const activeFacts = facts.filter((f) => f.status === 'Active');
      const systemPrompt = `You are BrandGuard AI, a strict brand governance engine.
Your task is to analyze content against the company's approved knowledge base:
Rules: ${JSON.stringify(rules.map((r) => ({ id: r.id, name: r.name, severity: r.severity })))}
Active Approved Facts: ${JSON.stringify(activeFacts.map((f) => ({ id: f.id, fact: f.fact, source: f.sourceTitle, version: f.version })))}
Terminology: ${JSON.stringify(terminology.map((t) => ({ forbidden: t.forbidden, preferred: t.preferred })))}

Return ONLY a JSON array of findings with this exact shape:
[{
  "id": "AI-1",
  "ruleId": "RULE-xxx",
  "ruleName": "Rule Name",
  "severity": "Critical" | "High" | "Medium" | "Low",
  "confidence": 95,
  "origin": "AI-assisted",
  "targetText": "exact text from content",
  "reasoning": {
    "originalClaim": "summary of claim",
    "applicableRule": "rule title",
    "evidence": { "sourceId": "FACT-xxx", "sourceTitle": "...", "version": "..." } or null,
    "explanation": "Why this violates brand rules. If evidence missing, MUST include: Missing evidence is not proof the claim is false.",
    "suggestedCorrection": "minimal-change correction preserving intent"
  }
}]`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nReview this text for Channel: ${channel}, Market: ${market}:\n"""${content}"""` }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((item: any, idx: number) => {
              const start = content.indexOf(item.targetText);
              return {
                ...item,
                id: `AI-FIND-${Date.now()}-${idx + 1}`,
                startIndex: start >= 0 ? start : 0,
                endIndex: start >= 0 ? start + item.targetText.length : 0,
                origin: 'AI-assisted',
              };
            });
          }
        }
      }
    } catch (err) {
      console.warn('Gemini contextual API call fell back to local heuristic:', err);
    }
  }

  // Fallback: Return empty so deterministic findings are supplemented safely
  return [];
}
