import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { messages } = req.body;

    const systemPrompt = `
      Sen 'Grafer Global' IRS Vergi Uzmanısın.
      GÖREVİN: Kullanıcının zaten var olan şirketi veya bireysel işletmesi için EIN (SS-4) formu bilgilerini toplamak.
      
      MANTIK AKIŞI (SIRAYLA SOR):
      1. Statü Tespiti (LLC mi Bireysel mi?)
      2. Yasal Ad (Legal Name)
      3. Sorumlu Kişi (Responsible Party)
      4. Yabancı Kimlik (SSN yoksa 'Foreign')
      5. Adres (ABD Adresi)
      6. Tarih (Kuruluş Tarihi)
      7. Faaliyet (Ne iş yapıyor?)

      !!! KRİTİK FİNAL ADIMI !!!
      Tüm 7 bilgiyi eksiksiz aldığında, cevabının EN SONUNA (kullanıcıya veda ettikten sonra) şu gizli kodu ekle.
      Bu kodu sadece en sonda ekle:

      ###JSON_START###
      {
        "legalName": "Buraya Yasal Ad",
        "tradeName": "",
        "executorName": "Buraya Sorumlu Kişi",
        "address": "Buraya Adres",
        "cityStateZip": "Buraya Şehir Eyalet Zip",
        "date": "Buraya Tarih",
        "county": "Foreign"
      }
      ###JSON_END###
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      temperature: 0.2, 
    });

    const answer = completion.choices[0].message.content;
    res.status(200).json({ reply: answer });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'System Error' });
  }
}
