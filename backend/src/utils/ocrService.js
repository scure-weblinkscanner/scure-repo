import Tesseract from 'tesseract.js';

let worker = null;

export const initOCR = async () => {
  worker = await Tesseract.createWorker('eng');
  console.log('OCR worker ready');
};

export const extractTextFromImage = async (imagePath) => {
  if (!worker) await initOCR();
  const { data: { text } } = await worker.recognize(imagePath);
  return text;
};

export const extractURLsFromText = (text) => {
  // remove spaces that OCR inserts into URLs
  const cleaned = text.replace(/https?\s*:\s*\/\s*\/\s*/gi, 'https://');
  const urlRegex = /https?:\/\/[^\s]+/gi;
  const matches = cleaned.match(urlRegex);
  return matches ? matches : [];
};