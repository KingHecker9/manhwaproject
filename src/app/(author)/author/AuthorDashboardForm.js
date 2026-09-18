'use client';

import { useState } from 'react';
import { Sparkles, UploadCloud, FileText, Image as ImageIcon } from 'lucide-react';

export default function AuthorDashboardForm({ existingSeries = [] }) {
  const [selectedSeriesSlug, setSelectedSeriesSlug] = useState(
    existingSeries.length > 0 ? existingSeries[0].slug : '__new__'
  );
  const [newSeriesName, setNewSeriesName] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterNum, setChapterNum] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const isNewSeries = selectedSeriesSlug === '__new__';

  const uploadToR2 = async (key, blob, contentType) => {
    const res = await fetch('/api/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, contentType }),
    });
    const { signedUrl, error } = await res.json();
    if (error) throw new Error(`Failed to get upload URL: ${error}`);

    const uploadRes = await fetch(signedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: blob,
    });
    if (!uploadRes.ok) throw new Error(`R2 upload failed: ${uploadRes.status}`);

    return key;
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!pdfFile) return alert('Please select a PDF file for this chapter.');

    const seriesName = isNewSeries
      ? newSeriesName
      : existingSeries.find((s) => s.slug === selectedSeriesSlug)?.title;

    if (!seriesName) return alert('Please enter or select a series.');

    setUploading(true);

    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

      const slug = seriesName.toLowerCase().trim().replace(/\s+/g, '-');

      setStatusMessage('Reading PDF...');
      const pdfBytes = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;

      const pageKeys = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        setStatusMessage(`Rendering page ${i} of ${pdf.numPages}...`);

        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        await page.render({ canvasContext: ctx, viewport }).promise;

        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, 'image/jpeg', 0.75)
        );

        const pageKey = `temp-pages/${slug}-ch${chapterNum}-${Date.now()}-page${i}.jpg`;

        setStatusMessage(`Uploading page ${i} of ${pdf.numPages}...`);
        await uploadToR2(pageKey, blob, 'image/jpeg');

        pageKeys.push(pageKey);
      }

      let coverKey = null;
      if (isNewSeries && coverFile) {
        setStatusMessage('Uploading cover...');
        const coverExt = coverFile.name.split('.').pop();
        coverKey = `covers/${slug}.${coverExt}`;
        await uploadToR2(coverKey, coverFile, coverFile.type);
      }

      setStatusMessage('Finalizing chapter...');

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          series: seriesName,
          chapter: chapterNum,
          title: chapterTitle,
          pageKeys,
          coverKey,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setStatusMessage(`Chapter ${chapterNum} uploaded successfully (${data.pageCount} pages)`);
        setChapterTitle('');
        setChapterNum('');
        setPdfFile(null);
        setCoverFile(null);
      } else {
        setStatusMessage(`Upload failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const inputClasses =
    "w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500 transition-colors";
  const labelClasses = "block text-xs font-semibold text-[var(--text-main)] mb-1.5";

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-8 sm:p-10 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Creator Studio</span>
          </div>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
            Author Portal
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
            Upload new chapters directly to the platform.
          </p>
        </div>

        <form onSubmit={handleUpload} className="space-y-4 pt-2">
          <div>
            <label className={labelClasses}>Series</label>
            <select
              value={selectedSeriesSlug}
              onChange={(e) => setSelectedSeriesSlug(e.target.value)}
              className={inputClasses}
            >
              {existingSeries.map((s) => (
                <option key={s.slug} value={s.slug}>{s.title}</option>
              ))}
              <option value="__new__">+ Add new series</option>
            </select>
          </div>

          {isNewSeries && (
            <div>
              <label className={labelClasses}>New Series Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Shadow Monarch"
                value={newSeriesName}
                onChange={(e) => setNewSeriesName(e.target.value)}
                className={inputClasses}
              />
            </div>
          )}

          <div>
            <label className={labelClasses}>Chapter Number</label>
            <input
              type="number"
              required
              placeholder="e.g. 5"
              value={chapterNum}
              onChange={(e) => setChapterNum(e.target.value)}
              className={inputClasses}
            />
          </div>

          <div>
            <label className={labelClasses}>Chapter Title</label>
            <input
              type="text"
              required
              placeholder="e.g. The Return"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              className={inputClasses}
            />
          </div>

          <div>
            <label className={labelClasses}>Chapter PDF</label>
            <label className="flex items-center gap-3 w-full bg-[var(--bg-surface)] border border-dashed border-[var(--border-strong)] rounded-xl px-4 py-3.5 cursor-pointer hover:border-indigo-500 transition-colors">
              <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="text-xs text-[var(--text-secondary)] truncate">
                {pdfFile ? pdfFile.name : "Choose a PDF file..."}
              </span>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>

          {isNewSeries && (
            <div>
              <label className={labelClasses}>Series Cover (optional)</label>
              <label className="flex items-center gap-3 w-full bg-[var(--bg-surface)] border border-dashed border-[var(--border-strong)] rounded-xl px-4 py-3.5 cursor-pointer hover:border-indigo-500 transition-colors">
                <ImageIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="text-xs text-[var(--text-secondary)] truncate">
                  {coverFile ? coverFile.name : "Choose a cover image..."}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-[var(--bg-surface-hover)] disabled:text-[var(--text-muted)] text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{uploading ? 'Processing Upload...' : 'Publish Chapter'}</span>
          </button>

          {statusMessage && (
            <p className="text-xs text-center text-[var(--text-secondary)] border-t border-[var(--border-subtle)] pt-4">
              {statusMessage}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}