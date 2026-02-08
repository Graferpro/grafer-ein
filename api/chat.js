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
          content: "Senin adın 'Grafer Pro EIN Asistanı'. Sen yabancılar (Non-US Residents) için IRS SS-4 formunu doldurmaya yardımcı olan profesyonel bir asistansın. Kullanıcıya her zaman Türkçe yanıt ver ama form için gerekli bilgileri (Ad, Adres vb.) net bir şekilde iste. Kısa ve güven verici konuş."
        },
        ...messages
      ],
    });

    const answer = completion.choices[0].message.content;
    res.status(200).json({ reply: answer });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Yapay zeka şu an meşgul.' });
  }
}
