'use client';

import { useState } from 'react';

export default function AuthorDashboardForm() {
  const [seriesName, setSeriesName] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterNum, setChapterNum] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!pdfFile) return alert('Please select a PDF file for this chapter.');

    setUploading(true);
    setStatusMessage('Uploading and converting chapter pages...');

    const formData = new FormData();
    formData.append('series', seriesName);
    formData.append('chapter', chapterNum);
    formData.append('title', chapterTitle);
    formData.append('pdf', pdfFile);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        setStatusMessage(`Chapter ${chapterNum} uploaded successfully (${data.pageCount} pages)`);
        setPdfFile(null);
      } else {
        setStatusMessage(`Upload failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      setStatusMessage('Error submitting the PDF.');
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