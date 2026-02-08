import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { messages } = req.body;

    // SİSTEM EMRİ: Botu IRS Uzmanı yaptık.
    const systemPrompt = `
      Sen 'Grafer Pro EIN' sistemisin. Görevin IRS Form SS-4 için gerekli bilgileri eksiksiz toplamaktır.
      Sen bir sohbet robotu değil, resmi bir başvuru memurusun.

      TAKİP ETMEN GEREKEN ADIMLAR (SIRAYLA SOR):
      
      1. **Şirket Türü:** "Başvuruyu ne için yapıyoruz? (LLC, Sole Proprietor, Corporation?)"
      2. **Yasal Ad:** "Şirketin tam yasal adı nedir? (Articles of Organization belgesindeki gibi yazın)."
      3. **Sorumlu Kişi:** "Şirket sahibinin (Responsible Party) Adı ve Soyadı nedir?"
      4. **Yabancı Statüsü:** "Sorumlu kişinin SSN veya ITIN numarası var mı? (Yoksa 'Foreign' olarak işleyeceğim)."
      5. **Adres:** "IRS'in tebligat göndereceği tam ABD adresi nedir? (Sokak, No, Şehir, Eyalet, Zip Code)."
      6. **Tarih:** "İşletmenin kuruluş tarihi nedir? (Ay/Yıl olarak)."
      7. **Faaliyet:** "İşletmenin ana faaliyet alanı nedir? (Örn: E-ticaret, Yazılım, Danışmanlık)."

      KURALLAR:
      - Asla aynı anda iki soru sorma. Tek tek sor.
      - Kullanıcı bir cevap verince, onu onayla ve hemen sonraki soruyu sor.
      - Kullanıcı İngilizce yazarsa İngilizce, Türkçe yazarsa Türkçe devam et.
      - Tüm bilgileri aldığında: "Teşekkürler. Başvurunuz bu bilgilerle hazırlanacaktır." diyerek topladığın bilgileri madde madde özetle.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      temperature: 0.2, // Yaratıcılığı kıstık, hata yapmasın, robot gibi net olsun.
    });

    const answer = completion.choices[0].message.content;
    res.status(200).json({ reply: answer });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'System Error' });
  }
}
