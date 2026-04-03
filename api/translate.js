export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: "No text provided" });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: `You are a translator between English and Dhivehi.
  Translate the user's English text into Dhivehi, written in romanized script (Latin alphabet), following the same romanization conventions used in the Fareesha Abdulla / Michael O'Shea English-Dhivehi dictionary (2005).
  Return only the translated text. No explanations, no notes, no alternatives.`,
              },
            ],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: text.trim() }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      return res
        .status(500)
        .json({ error: err.error?.message || "Gemini API error" });
    }

    const data = await response.json();
    const translation = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return res.status(200).json({ translation });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
