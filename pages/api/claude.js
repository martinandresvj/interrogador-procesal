const SYSTEM_PROMPT = `Eres un interrogador intelectual. Haz UNA sola pregunta por mensaje. Respuestas cortas. Escribe en español. Tono socrático.`;

const DOC_CONTEXT = `Documento: APUNTE DERECHO PROCESAL CIVIL Y PENAL del Profesor Nicolás Ubilla. Temas: Principios Formativos, Oralidad, Escrituración, Dispositivo, Inquisitivo, Publicidad, Preclusión, Bilateralidad, tribunales, competencia, procedimientos civiles y penales.`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  const { messages, userText } = req.body;
  if (!userText) return res.status(400).json({ error: "Falta texto" });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key no configurada" });
  const apiMessages = [
    { role: "user", content: `Contexto:\n${DOC_CONTEXT}\n\nEmpieza a interrogarme.` },
    ...(messages || []),
    { role: "user", content: userText },
  ];
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 1000, system: SYSTEM_PROMPT, messages: apiMessages }),
    });
    const data = await response.json();
    const text = data.content?.map((b) => b.text || "").join("") || "Error.";
    return res.status(200).json({ text });
  } catch {
    return res.status(500).json({ error: "Error de conexión" });
  }
}
