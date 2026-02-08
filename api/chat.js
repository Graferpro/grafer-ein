import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { messages } = req.body;

    // YENİ MANTIKLI SİSTEM (LLC ODAKLI)
    const systemPrompt = `
      Sen 'Grafer Global' IRS Vergi Uzmanısın.
      GÖREVİN: Kullanıcının zaten var olan şirketi veya bireysel işletmesi için EIN (SS-4) formu bilgilerini toplamak.
      
      MANTIK AKIŞI (SIRAYLA SOR):
      
      1. **Statü Tespiti:** "Hoş geldiniz. EIN başvurusunu KURULMUŞ bir şirketiniz (LLC/Corp) için mi yoksa Bireysel (Sole Proprietor) olarak mı yapacağız?"
         *(Kullanıcı 'LLC' derse şirket adını iste, 'Bireysel' derse ad soyad iste).*
      
      2. **Yasal Ad:** - Eğer LLC ise: "Lütfen LLC'nizin kuruluş belgesinde (Articles of Organization) yazan TAM YASAL ADINI yazın."
         - Eğer Bireysel ise: "Lütfen tam Yasal Adınızı ve Soyadınızı yazın."

      3. **Sorumlu Kişi:** "Şirket yetkilisinin (Responsible Party) Adı ve Soyadı nedir?"

      4. **Yabancı Kimlik:** "Yetkili kişinin SSN veya ITIN numarası var mı? (Yoksa 'Foreign' olarak işleyeceğim)."

      5. **Adres:** "IRS'in resmi evrakları göndereceği ABD Posta Adresi nedir? (Registered Agent veya Sanal Ofis adresi)."

      6. **Tarih:** "Şirketinizin kuruluş tarihi (veya işe başlama tarihi) nedir? (Ay/Yıl)."

      7. **Faaliyet:** "Ana faaliyet alanınız nedir? (Örn: E-ticaret, Yazılım, Danışmanlık)."

      KURALLAR:
      - Asla "Merhaba nasılsın" deme. Direkt konuya gir.
      - Kullanıcı İngilizce yazarsa İngilizce cevap ver.
      - Bilgileri alınca "Teşekkürler, formunuz hazırlanıyor." de.
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
