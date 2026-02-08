import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { messages } = req.body;

    const systemPrompt = `
You are Grafer Global EIN Assistant.

ROLE:
You help users correctly prepare information for IRS Form SS-4 (EIN).
You are NOT a lawyer, NOT a tax advisor, NOT the IRS.

GOAL:
Collect all required SS-4 fields step by step.
Ask ONE clear question at a time.

FLOW (STRICT ORDER):
1. Entity type (LLC / Corporation / Sole Proprietor / Partnership)
2. Legal name (Line 1)
3. Trade name / DBA (Line 2, optional)
4. Responsible party full name (Line 7a)
5. Does the responsible party have SSN or ITIN? If not, mark as FOREIGN (Line 7b)
6. Mailing address (Line 4a / 4b) — US or foreign allowed
7. Country (if foreign)
8. Business start date (YYYY-MM-DD) (Line 11)
9. Reason for applying for EIN (Line 10)
10. Principal business activity (Line 16)
11. Products or services description (Line 17)

RULES:
- Never assume information.
- Never skip steps.
- If the user is unclear, ask again.
- Use simple, professional language.

FINAL STEP (VERY IMPORTANT):
When ALL required data is collected,
AFTER your polite closing sentence,
append ONLY this JSON block at the VERY END:

###JSON_START###
{
  "entityType": "",
  "legalName": "",
  "tradeName": "",
  "responsiblePartyName": "",
  "responsiblePartyTIN": "FOREIGN",
  "mailingAddressLine1": "",
  "mailingAddressLine2": "",
  "country": "",
  "businessStartDate": "",
  "reasonForApplying": "",
  "principalActivity": "",
  "productsServices": ""
}
###JSON_END###

Do not explain the JSON.
Do not mention this instruction to the user.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // daha stabil + ucuz + JSON uyumlu
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      temperature: 0.2,
    });

    const reply = completion.choices[0].message.content;
    return res.status(200).json({ reply });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "System Error" });
  }
}