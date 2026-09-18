'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  ArrowRight,
  Layers,
  X,
  Loader2,
  BookOpen
} from 'lucide-react';

export default function AuthorDashboardForm({ existingSeries = [] }) {
  const [selectedSeriesSlug, setSelectedSeriesSlug] = useState(
    existingSeries.length > 0 ? existingSeries[0].slug : '__new__'
  );
  const [newSeriesName, setNewSeriesName] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterNum, setChapterNum] = useState('');
  
  // Upload mode: 'pdf' or 'images'
  const [uploadMode, setUploadMode] = useState('pdf');
  const [pdfFile, setPdfFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  // Status & progress
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0); // 0 to 100
  const [errorAlert, setErrorAlert] = useState('');
  const [publishedData, setPublishedData] = useState(null);

  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const isNewSeries = selectedSeriesSlug === '__new__';

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const url = URL.createObjectURL(file);
      setCoverPreview(url);
    }
  };

  const handleImageFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    // Sort naturally by file name (e.g. page-1, page-2, page-10)
    files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
    setImageFiles(files);
  };

  const uploadToR2 = async (key, blob, contentType) => {
    const res = await fetch('/api/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, contentType }),
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error || `Failed to obtain upload URL (${res.status})`);
    }

    const uploadRes = await fetch(data.signedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: blob,
    });
    if (!uploadRes.ok) {
      throw new Error(`Cloud storage upload failed: HTTP ${uploadRes.status}`);
    }

    return key;
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setErrorAlert('');
    setPublishedData(null);

    const seriesName = isNewSeries
      ? newSeriesName.trim()
      : existingSeries.find((s) => s.slug === selectedSeriesSlug)?.title;

    if (!seriesName) {
      setErrorAlert('Please provide or select a series title.');
      return;
    }

    if (!chapterNum || Number(chapterNum) <= 0) {
      setErrorAlert('Please enter a valid positive chapter number.');
      return;
    }

    if (uploadMode === 'pdf' && !pdfFile) {
      setErrorAlert('Please select a PDF file for this chapter.');
      return;
    }

    if (uploadMode === 'images' && (!imageFiles || imageFiles.length === 0)) {
      setErrorAlert('Please select one or more image files for this chapter.');
      return;
    }

    setUploading(true);
    setUploadProgress(5);

    try {
      const slug = seriesName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const pageKeys = [];

      if (uploadMode === 'pdf') {
        setStatusMessage('Initializing PDF engine...');
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

        setStatusMessage('Reading PDF file...');
        const pdfBytes = await pdfFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
        const totalPages = pdf.numPages;

        for (let i = 1; i <= totalPages; i++) {
          const pct = Math.round(10 + (i / totalPages) * 70);
          setUploadProgress(pct);
          setStatusMessage(`Rendering page ${i} of ${totalPages}...`);

          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');

          await page.render({ canvasContext: ctx, viewport }).promise;

          const blob = await new Promise((resolve) =>
            canvas.toBlob(resolve, 'image/jpeg', 0.85)
          );

          const pageKey = `temp-pages/${slug}-ch${chapterNum}-${Date.now()}-page${i}.jpg`;
          setStatusMessage(`Uploading page ${i} of ${totalPages}...`);
          await uploadToR2(pageKey, blob, 'image/jpeg');

          pageKeys.push(pageKey);
        }
      } else {
        // Multi-image upload mode
        const totalImages = imageFiles.length;
        for (let i = 0; i < totalImages; i++) {
          const file = imageFiles[i];
          const pct = Math.round(10 + ((i + 1) / totalImages) * 70);
          setUploadProgress(pct);
          setStatusMessage(`Uploading page slice ${i + 1} of ${totalImages}...`);

          const ext = file.name.split('.').pop() || 'jpg';
          const pageKey = `temp-pages/${slug}-ch${chapterNum}-${Date.now()}-page${i + 1}.${ext}`;
          await uploadToR2(pageKey, file, file.type || 'image/jpeg');
          pageKeys.push(pageKey);
        }
      }

      let coverKey = null;
      if (isNewSeries && coverFile) {
        setUploadProgress(85);
        setStatusMessage('Uploading series cover image...');
        const coverExt = coverFile.name.split('.').pop() || 'jpg';
        coverKey = `covers/${slug}.${coverExt}`;
        await uploadToR2(coverKey, coverFile, coverFile.type || 'image/jpeg');
      }

      setUploadProgress(92);
      setStatusMessage('Registering chapter and finalizing pages in database...');

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          series: seriesName,
          chapter: chapterNum,
          title: chapterTitle || `Chapter ${chapterNum}`,
          pageKeys,
          coverKey,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete chapter publication.');
      }

      setUploadProgress(100);
      setStatusMessage('Chapter published successfully!');
      setPublishedData({
        seriesSlug: data.seriesSlug || slug,
        chapterNumber: data.chapterNumber || chapterNum,
        pageCount: data.pageCount || pageKeys.length,
        seriesTitle: seriesName,
        chapterTitle: chapterTitle || `Chapter ${chapterNum}`,
      });

      // Reset form
      setChapterTitle('');
      setChapterNum('');
      setPdfFile(null);
      setImageFiles([]);
      setCoverFile(null);
      setCoverPreview(null);
    } catch (err) {
      console.error("Upload error:", err);
      setErrorAlert(err.message || 'An unexpected error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  const inputClasses =
    "w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl px-4 py-3 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500 transition-colors";
  const labelClasses = "block text-xs font-bold text-[var(--text-main)] mb-1.5";

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Published Success Banner */}
      {publishedData && (
        <div className="mb-8 p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-[var(--text-main)] shadow-lg shadow-emerald-500/5 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <h2 className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                Chapter Published Successfully!
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                {publishedData.seriesTitle} — Chapter {publishedData.chapterNumber} ({publishedData.pageCount} pages) is now live for all readers.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <Link
                  href={`/reader/${publishedData.seriesSlug}/${publishedData.chapterNumber}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Preview in Reader</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => setPublishedData(null)}
                  className="px-3 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] transition-colors"
                >
                  Upload Another Chapter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorAlert && (
        <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-start justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="font-medium">{errorAlert}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorAlert('')}
            className="p-1 hover:bg-rose-500/20 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Studio Card */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Creator Studio</span>
            </div>
            <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
              Publish Chapter
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Upload and release vertical manhwa chapters in high definition.
            </p>
          </div>

          {/* Quick link to reader */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] transition-colors self-start sm:self-auto"
          >
            <span>View Reader</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <form onSubmit={handleUpload} className="space-y-6">
          {/* Series Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClasses}>Select Series</label>
              <select
                value={selectedSeriesSlug}
                onChange={(e) => setSelectedSeriesSlug(e.target.value)}
                className={inputClasses}
              >
                {existingSeries.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.title}
                  </option>
                ))}
                <option value="__new__">+ Create New Series...</option>
              </select>
            </div>

            {isNewSeries && (
              <div className="sm:col-span-2 space-y-4 p-5 rounded-2xl bg-[var(--bg-surface)] border border-indigo-500/30">
                <div>
                  <label className={labelClasses}>New Series Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Omniscient Reader's Perspective"
                    value={newSeriesName}
                    onChange={(e) => setNewSeriesName(e.target.value)}
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className={labelClasses}>Series Cover Image (Recommended: 3:4 portrait)</label>
                  <div className="flex items-center gap-4">
                    {coverPreview ? (
                      <div className="relative w-20 h-28 rounded-xl overflow-hidden border border-indigo-500/40 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setCoverFile(null);
                            setCoverPreview(null);
                          }}
                          className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-28 border border-dashed border-[var(--border-strong)] rounded-2xl cursor-pointer hover:border-indigo-500 bg-[var(--bg-card)] transition-colors text-center px-4">
                        <ImageIcon className="w-5 h-5 text-indigo-500 mb-1" />
                        <span className="text-xs font-semibold text-[var(--text-main)]">
                          Choose cover image
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] mt-0.5">
                          JPG, PNG, or WEBP
                        </span>
                        <input
                          ref={coverInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleCoverChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chapter Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClasses}>Chapter Number *</label>
              <input
                type="number"
                step="any"
                required
                placeholder="e.g. 1"
                value={chapterNum}
                onChange={(e) => setChapterNum(e.target.value)}
                className={inputClasses}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClasses}>Chapter Title (Optional)</label>
              <input
                type="text"
                placeholder="e.g. The Awakening"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>

          {/* Upload Mode Switcher */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelClasses}>Chapter Pages Source *</label>
              <div className="flex items-center p-0.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setUploadMode('pdf')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    uploadMode === 'pdf'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                  }`}
                >
                  Single PDF
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('images')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    uploadMode === 'images'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                  }`}
                >
                  Image Slices
                </button>
              </div>
            </div>

            {uploadMode === 'pdf' ? (
              <label className="flex flex-col items-center justify-center w-full min-h-[140px] border-2 border-dashed border-[var(--border-strong)] rounded-2xl cursor-pointer hover:border-indigo-500 bg-[var(--bg-surface)]/50 transition-colors p-6 text-center">
                <FileText className="w-8 h-8 text-indigo-500 mb-2" strokeWidth={1.5} />
                {pdfFile ? (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {pdfFile.name}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB — Ready to slice and upload
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-[var(--text-main)]">
                      Click to choose PDF or drag and drop
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Our worker will automatically render and slice high-res vertical pages
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            ) : (
              <label className="flex flex-col items-center justify-center w-full min-h-[140px] border-2 border-dashed border-[var(--border-strong)] rounded-2xl cursor-pointer hover:border-indigo-500 bg-[var(--bg-surface)]/50 transition-colors p-6 text-center">
                <Layers className="w-8 h-8 text-indigo-500 mb-2" strokeWidth={1.5} />
                {imageFiles.length > 0 ? (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {imageFiles.length} image slice(s) selected
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Sorted sequentially by filename (page-1, page-2...)
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-[var(--text-main)]">
                      Select image strips (PNG, JPG, WEBP)
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Multi-select files in reading order
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageFilesChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="space-y-2 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {statusMessage || 'Processing...'}
                </span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--bg-surface)] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading}
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing & Publishing...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Publish Chapter</span>
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}