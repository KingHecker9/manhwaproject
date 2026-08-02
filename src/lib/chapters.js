import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'chapters.json');

export function readChaptersDb() {
  if (!fs.existsSync(DATA_FILE)) return {};
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return raw ? JSON.parse(raw) : {};
}

export function getAllSeries() {
  const db = readChaptersDb();
  return Object.entries(db).map(([id, data]) => {
    const sortedChapters = [...(data.chapters || [])].sort((a, b) => a.number - b.number);
    const latest = sortedChapters[sortedChapters.length - 1];
    return {
      id,
      title: data.title,
      chapterCount: sortedChapters.length,
      cover: latest?.pages?.[0] || null, // use the first page of the newest chapter as a stand-in cover
    };
  });
}

export function getSeries(id) {
  const db = readChaptersDb();
  const entry = db[id];
  if (!entry) return null;
  return {
    id,
    title: entry.title,
    chapters: [...entry.chapters].sort((a, b) => a.number - b.number),
  };
}

export function getChapter(seriesId, chapterNumber) {
  const series = getSeries(seriesId);
  if (!series) return null;
  return series.chapters.find((c) => String(c.number) === String(chapterNumber)) || null;
}