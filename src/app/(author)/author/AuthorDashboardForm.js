'use client';

import { useState } from 'react';
import { supabaseClient } from '../../../lib/supabase-client';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
export default function AuthorDashboardForm() {
  const [seriesName, setSeriesName] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterNum, setChapterNum] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!pdfFile) return alert('Please select a PDF file for this chapter.');

    setUploading(true);

    try {
      const slug = seriesName.toLowerCase().trim().replace(/\s+/g, '-');

      // 1. Load the PDF in-browser
      setStatusMessage('Reading PDF...');
      const pdfBytes = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;

      // 2. Render each page to canvas, convert to JPEG, upload to Storage
      const pageUrls = [];

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

        const pagePath = `temp-pages/${slug}-ch${chapterNum}-${Date.now()}-page${i}.jpg`;

        const { error: pageUploadError } = await supabaseClient.storage
          .from('manhwa-pages')
          .upload(pagePath, blob, { contentType: 'image/jpeg' });

        if (pageUploadError) throw new Error(`Page ${i} upload failed: ${pageUploadError.message}`);

        pageUrls.push(pagePath);
      }

      // 3. Tell the server the pages are ready — it just creates DB rows now
      setStatusMessage('Finalizing chapter...');

      const formData = new FormData();
      formData.append('series', seriesName);
      formData.append('chapter', chapterNum);
      formData.append('title', chapterTitle);
      formData.append('pagePaths', JSON.stringify(pageUrls));
      if (coverFile) formData.append('cover', coverFile);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        setStatusMessage(`Chapter ${chapterNum} uploaded successfully (${data.pageCount} pages)`);
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

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 border-b border-neutral-800 pb-4">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-indigo-400 mb-2">
            Creator Studio
          </p>
          <h1 className="text-2xl font-bold text-white">Author Portal</h1>
          <p className="text-xs text-neutral-500 mt-1">Upload new chapters directly to the platform.</p>
        </header>

        <form onSubmit={handleUpload} className="bg-neutral-900 border border-neutral-800 p-6 space-y-5">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-neutral-400 mb-1.5">
              Series Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Shadow Monarch"
              value={seriesName}
              onChange={(e) => setSeriesName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-white p-2.5 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-neutral-400 mb-1.5">
              Chapter Number
            </label>
            <input
              type="number"
              required
              placeholder="e.g. 5"
              value={chapterNum}
              onChange={(e) => setChapterNum(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-white p-2.5 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-neutral-400 mb-1.5">
              Chapter Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. The Return"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-white p-2.5 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-neutral-400 mb-1.5">
              Chapter PDF
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfFile(e.target.files[0])}
              className="w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:bg-indigo-600 file:text-white file:cursor-pointer cursor-pointer"
            />
            {pdfFile && <span className="text-xs text-neutral-500 mt-1 block">{pdfFile.name} selected</span>}
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-neutral-400 mb-1.5">
              Series Cover (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files[0])}
              className="w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:bg-indigo-600 file:text-white file:cursor-pointer cursor-pointer"
            />
            {coverFile && <span className="text-xs text-neutral-500 mt-1 block">{coverFile.name} selected</span>}
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500 font-semibold text-sm transition text-white"
          >
            {uploading ? 'Processing Upload...' : 'Publish Chapter'}
          </button>

          {statusMessage && (
            <p className="text-xs text-center text-neutral-400 border-t border-neutral-800 pt-4">
              {statusMessage}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}