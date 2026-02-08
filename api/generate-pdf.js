import { PDFDocument } from 'pdf-lib';
import { readFileSync } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Verileri Al
    const { legalName, address, cityStateZip, responsibleParty, date } = req.body;

    // 2. PDF'i Bul
    const pdfPath = path.join(process.cwd(), 'public', 'fss4.pdf');
    const existingPdfBytes = readFileSync(pdfPath);

    // 3. Doldur
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();

    // -- KUTU EŞLEŞTİRMELERİ --
    // Name (Line 1)
    const fName = form.getTextField('f1_1[0]'); 
    if (fName && legalName) fName.setText(legalName);

    // Address (Line 4a)
    const fAddr = form.getTextField('f1_4[0]');
    if (fAddr && address) fAddr.setText(address);

    // City/State (Line 4b)
    const fCity = form.getTextField('f1_5[0]');
    if (fCity && cityStateZip) fCity.setText(cityStateZip);

    // Responsible Party (Line 7a)
    const fResp = form.getTextField('f1_7[0]');
    if (fResp && responsibleParty) fResp.setText(responsibleParty);

    // Formu Kilitle ve Kaydet
    form.flatten();
    const pdfBytes = await pdfDoc.save();

    // Gönder
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=EIN_Form_SS4.pdf');
    res.send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'PDF Hatası' });
  }
}

