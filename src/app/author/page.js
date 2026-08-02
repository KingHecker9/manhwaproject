'use client';

import { useState } from 'react';

export default function AuthorDashboard() {
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
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setStatusMessage(`✅ Chapter ${chapterNum} uploaded successfully! (${data.pageCount} pages)`);
        setPdfFile(null);
      } else {
        setStatusMessage(`❌ Upload failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      setStatusMessage('❌ Error submitting the PDF.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <header className="mb-8 border-b border-neutral-800 pb-4">
        <h1 className="text-2xl font-bold text-blue-400">Author Portal</h1>
        <p className="text-xs text-neutral-400">Upload new chapters directly to the platform.</p>
      </header>

      <form onSubmit={handleUpload} className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl space-y-5">
        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1">Series Title</label>
          <input
            type="text"
            required
            placeholder="e.g. Shadow Monarch"
            value={seriesName}
            onChange={(e) => setSeriesName(e.target.value)}
            className="w-full bg-slate-100 text-black border border-slate-300 rounded p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1">Chapter Number</label>
          <input
            type="number"
            required
            placeholder="e.g. 5"
            value={chapterNum}
            onChange={(e) => setChapterNum(e.target.value)}
            className="w-full bg-slate-100 text-black border border-slate-300 rounded p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1">Chapter Title</label>
          <input
            type="text"
            required
            placeholder="e.g. The Return"
            value={chapterTitle}
            onChange={(e) => setChapterTitle(e.target.value)}
            className="w-full bg-slate-100 text-black border border-slate-300 rounded p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1">Chapter PDF</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setPdfFile(e.target.files[0])}
            className="w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:bg-blue-600 file:text-white"
          />
          {pdfFile && <span className="text-xs text-neutral-400">{pdfFile.name} selected</span>}
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-700 rounded font-semibold text-sm transition text-white"
        >
          {uploading ? 'Processing Upload...' : 'Publish Chapter'}
        </button>

        {statusMessage && <p className="text-xs text-center mt-2 text-neutral-300">{statusMessage}</p>}
      </form>
    </main>
  );
}