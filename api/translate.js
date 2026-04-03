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
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: `You are a translator between English and Dhivehi.
  Translate the user's English text into Dhivehi, written in romanized script (Latin alphabet), following the same romanization conventions used in the Fareesha Abdulla / Michael O'Shea English-Dhivehi dictionary (2005).
  Return only the translated text. No explanations, no notes, no alternatives.`,
            },
            {
              role: "user",
              content: text.trim(),
            },
          ],
          temperature: 0.3,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      return res
        .status(500)
        .json({ error: err.error?.message || "Groq API error" });
    }

    const data = await response.json();
    const translation = data.choices?.[0]?.message?.content || "";
    return res.status(200).json({ translation });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
