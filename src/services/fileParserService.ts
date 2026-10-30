/**
 * File Parser Service — Tier 2 Feature
 * Handles PDF and DOCX file intake, extracting text content
 * for governance review through the standard BrandGuard pipeline.
 */

// ─── PDF Parsing via pdf.js ─────────────────────────────────────────────────
export async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');

  // Set worker source to bundled worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    pageTexts.push(pageText);
  }

  return pageTexts.join('\n\n');
}

// ─── DOCX Parsing via mammoth ───────────────────────────────────────────────
export async function extractTextFromDOCX(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

// ─── Plain Text Files ───────────────────────────────────────────────────────
export async function extractTextFromTXT(file: File): Promise<string> {
  return await file.text();
}

// ─── Unified parser dispatcher ──────────────────────────────────────────────
export type SupportedFileType = 'pdf' | 'docx' | 'txt' | 'unsupported';

export function detectFileType(file: File): SupportedFileType {
  const name = file.name.toLowerCase();
  const mime = file.type.toLowerCase();

  if (name.endsWith('.pdf') || mime === 'application/pdf') return 'pdf';
  if (
    name.endsWith('.docx') ||
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )
    return 'docx';
  if (name.endsWith('.txt') || mime.startsWith('text/')) return 'txt';
  return 'unsupported';
}

export async function parseFile(file: File): Promise<{ text: string; pageCount?: number; wordCount: number }> {
  const fileType = detectFileType(file);

  let text = '';

  switch (fileType) {
    case 'pdf':
      text = await extractTextFromPDF(file);
      break;
    case 'docx':
      text = await extractTextFromDOCX(file);
      break;
    case 'txt':
      text = await extractTextFromTXT(file);
      break;
    default:
      throw new Error(`Unsupported file type: ${file.name}. Supported formats: PDF, DOCX, TXT.`);
  }

  const wordCount = text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  return { text, wordCount };
}

