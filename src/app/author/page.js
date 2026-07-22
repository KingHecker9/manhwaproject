'use client';

import { useState } from 'react';

export default function AuthorDashboard() {
  const [seriesName, setSeriesName] = useState('');
  const [chapterNum, setChapterNum] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!files.length) return alert('Please select chapter images to upload.');

    setUploading(true);
    setStatusMessage('Uploading and processing chapter...');

    const formData = new FormData();
    formData.append('series', seriesName);
    formData.append('chapter', chapterNum);
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage(`✅ Chapter ${chapterNum} uploaded successfully!`);
        setFiles([]);
      } else {
        setStatusMessage('❌ Upload failed.');
      }
    } catch (err) {
      setStatusMessage('❌ Error submitting files.');
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
            className="w-full bg-slate-100 text-black border border-slate-300 rounded p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-neutral-500"
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
            className="w-full bg-slate-100 text-black border border-slate-300 rounded p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-neutral-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1">Select Pages (PNG, JPG, WEBP)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setFiles(e.target.files)}
            className="w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
          />
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