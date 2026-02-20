import { extractTextFromImage, extractURLsFromText } from '../utils/ocrService.js';
import fs from 'fs';

export const scanImageForURLs = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const imagePath = req.file.path;
    const text = await extractTextFromImage(imagePath);
    console.log('Extracted text:', text);
    const urls = extractURLsFromText(text);
    console.log('Found URLs:', urls);

    // clean up uploaded file after processing
    fs.unlinkSync(imagePath);

    res.status(200).json({ text, urls });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};