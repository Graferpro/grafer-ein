import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { messages } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are 'Grafer Pro EIN'. You are an expert AI agent helping non-US residents get an EIN number. IMPORTANT RULE: Detect the user's language. If the user writes in English, reply in English. If the user writes in Turkish, reply in Turkish. Keep answers professional, short, and helpful."
        },
        ...messages
      ],
    });

    const answer = completion.choices[0].message.content;
    res.status(200).json({ reply: answer });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'AI Error' });
  }
}
