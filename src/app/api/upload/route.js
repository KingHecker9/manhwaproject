import { NextResponse } from 'next/server';
import { pdfToPng } from 'pdf-to-png-converter';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'chapters.json');
const UPLOADS_ROOT = path.join(process.cwd(), 'public', 'uploads');

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function readDb() {
  if (!fs.existsSync(DATA_FILE)) return {};
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return raw ? JSON.parse(raw) : {};
}

function writeDb(db) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const seriesName = formData.get('series');
    const chapterNum = formData.get('chapter');
    const chapterTitle = formData.get('title');
    const pdfFile = formData.get('pdf');

    if (!seriesName || !chapterNum || !pdfFile) {
      return NextResponse.json({ success: false, error: 'Missing required fields.' }, { status: 400 });
    }

    const seriesId = slugify(seriesName);
    const chapterDir = path.join(UPLOADS_ROOT, seriesId, String(chapterNum));
    fs.mkdirSync(chapterDir, { recursive: true });

    // Convert the uploaded PDF (as a buffer) into one PNG per page
    const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());
    const pngPages = await pdfToPng(pdfBuffer, {
      viewportScale: 2.0, // higher = sharper pages, bigger files
    });

    const pageUrls = [];
    pngPages.forEach((png, idx) => {
      const pageNumber = idx + 1;
      const filename = `page-${pageNumber}.png`;
      const filePath = path.join(chapterDir, filename);

      // Different versions of this library expose the image bytes under
      // slightly different property names — this covers both.
      const buffer = png.content || png.buffer;
      fs.writeFileSync(filePath, buffer);

      pageUrls.push(`/uploads/${seriesId}/${chapterNum}/${filename}`);
    });

    // Update the JSON "database"
    const db = readDb();
    if (!db[seriesId]) {
      db[seriesId] = { title: seriesName, chapters: [] };
    }

    const existingIdx = db[seriesId].chapters.findIndex(
      (c) => String(c.number) === String(chapterNum)
    );
    const chapterEntry = {
      number: Number(chapterNum),
      title: chapterTitle || `Chapter ${chapterNum}`,
      pages: pageUrls,
      uploadedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      db[seriesId].chapters[existingIdx] = chapterEntry; // overwrite if re-uploading same chapter
    } else {
      db[seriesId].chapters.push(chapterEntry);
    }

    writeDb(db);

    return NextResponse.json({
      success: true,
      message: 'Chapter uploaded and converted successfully',
      pageCount: pageUrls.length,
      seriesId,
    });
  } catch (error) {
    console.error('[UPLOAD ERROR]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}