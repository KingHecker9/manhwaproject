'use client';

import { useState, useRef, useEffect } from 'react';
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
  BookOpen,
  Trash2,
  Eye,
  Calendar,
  BarChart3,
  ExternalLink,
  ChevronRight,
  Clock,
  Radio,
  Send,
  Bell,
} from 'lucide-react';
import { DAYS_OF_WEEK } from '@/lib/series-metadata';

export default function AuthorDashboardForm({ existingSeries = [] }) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'manage' | 'broadcast' | 'analytics'
  const [seriesList, setSeriesList] = useState(existingSeries);
  const [selectedSeriesSlug, setSelectedSeriesSlug] = useState(
    existingSeries.length > 0 ? existingSeries[0].slug : '__new__'
  );
  const [newSeriesName, setNewSeriesName] = useState('');
  const [releaseDay, setReleaseDay] = useState('Monday');
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorAlert, setErrorAlert] = useState('');
  const [publishedData, setPublishedData] = useState(null);

  // Chapter management state
  const [selectedManageSeries, setSelectedManageSeries] = useState(
    existingSeries.length > 0 ? existingSeries[0].id : null
  );
  const [manageReleaseDay, setManageReleaseDay] = useState('Monday');
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState('');
  const [deletingChapterId, setDeletingChapterId] = useState(null);

  // Author broadcast notification state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSeriesSlug, setBroadcastSeriesSlug] = useState(
    existingSeries.length > 0 ? existingSeries[0].slug : ''
  );
  const [broadcastType, setBroadcastType] = useState('announcement');
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState('');
  const [broadcastError, setBroadcastError] = useState('');
  const [pastBroadcasts, setPastBroadcasts] = useState([]);

  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const isNewSeries = selectedSeriesSlug === '__new__';

  // Fetch full author series data (with chapters & view counts)
  const refreshAuthorData = async () => {
    try {
      const res = await fetch('/api/author/series');
      const data = await res.json();
      if (data.series) {
        setSeriesList(data.series);
        if (!selectedManageSeries && data.series.length > 0) {
          setSelectedManageSeries(data.series[0].id);
        }
      }
    } catch {
      // Non-fatal
    }
  };

  useEffect(() => {
    refreshAuthorData();
  }, []);

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
      : seriesList.find((s) => s.slug === selectedSeriesSlug)?.title;

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
        setStatusMessage('Initializing PDF worker engine...');
        const pdfjsLib = await import('pdfjs-dist');
        // Bulletproof worker setup: CDN fallback prevents 404
        try {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '6.3.289'}/build/pdf.worker.min.mjs`;
        } catch {
          pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        }

        setStatusMessage('Reading PDF pages...');
        const pdfBytes = await pdfFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
        const totalPages = pdf.numPages;

        if (totalPages === 0) {
          throw new Error('The selected PDF has 0 pages.');
        }

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
          setStatusMessage(`Uploading image strip ${i + 1} of ${totalImages}...`);

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
      setStatusMessage('Saving chapter in database...');

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          series: seriesName,
          chapter: chapterNum,
          title: chapterTitle || `Chapter ${chapterNum}`,
          pageKeys,
          coverKey,
          releaseDay,
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

      // Refresh author series list
      refreshAuthorData();

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

  const handleDeleteChapter = async (chapterId, chapterNumber, seriesTitle) => {
    if (!confirm(`Are you sure you want to delete Chapter ${chapterNumber} of "${seriesTitle}"? This will remove all its pages.`)) {
      return;
    }

    setDeletingChapterId(chapterId);
    try {
      const res = await fetch(`/api/author/chapter?chapterId=${chapterId}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(`Failed to delete chapter: ${data.error || 'Unknown error'}`);
        return;
      }

      // Refresh list
      await refreshAuthorData();
    } catch (err) {
      alert(`Delete chapter error: ${err.message}`);
    } finally {
      setDeletingChapterId(null);
    }
  };

  const inputClasses =
    "w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl px-4 py-3 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500 transition-colors";
  const labelClasses = "block text-xs font-bold text-[var(--text-main)] mb-1.5";

  // Compute analytics
  const totalChaptersCount = seriesList.reduce((acc, s) => acc + (s.chapterCount || s.chapters?.length || 0), 0);
  const totalReadsCount = seriesList.reduce((acc, s) => acc + (s.viewsCount || 0), 0);
  const activeManageSeriesObj = seriesList.find((s) => s.id === selectedManageSeries) || seriesList[0];

  useEffect(() => {
    if (activeManageSeriesObj?.release_day) {
      setManageReleaseDay(activeManageSeriesObj.release_day);
    }
  }, [selectedManageSeries, activeManageSeriesObj]);

  useEffect(() => {
    if (!broadcastSeriesSlug && seriesList.length > 0) {
      setBroadcastSeriesSlug(seriesList[0].slug);
    }
  }, [seriesList, broadcastSeriesSlug]);

  const handleUpdateReleaseDay = async () => {
    if (!selectedManageSeries) return;
    setSavingSchedule(true);
    setScheduleSuccess('');
    try {
      const res = await fetch('/api/author/series', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seriesId: selectedManageSeries,
          releaseDay: manageReleaseDay,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to update schedule');
      }
      setScheduleSuccess(`Release schedule updated to ${manageReleaseDay}!`);
      setTimeout(() => setScheduleSuccess(''), 3500);
      await refreshAuthorData();
    } catch (err) {
      alert(`Update schedule error: ${err.message}`);
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      setBroadcastError('Please provide both an announcement title and message.');
      return;
    }
    setBroadcastSending(true);
    setBroadcastError('');
    setBroadcastSuccess('');
    try {
      const selectedSeriesObj = seriesList.find((s) => s.slug === broadcastSeriesSlug);
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: broadcastTitle.trim(),
          message: broadcastMessage.trim(),
          seriesTitle: selectedSeriesObj?.title || null,
          link: selectedSeriesObj?.slug ? `/series/${selectedSeriesObj.slug}` : '/#latest',
          type: broadcastType,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to broadcast announcement');
      }
      setBroadcastSuccess('Announcement broadcasted live to all reader navigation bars!');
      if (data.notification) {
        setPastBroadcasts((prev) => [data.notification, ...prev]);
      }
      setBroadcastTitle('');
      setBroadcastMessage('');
      setTimeout(() => setBroadcastSuccess(''), 4500);
    } catch (err) {
      setBroadcastError(err.message || 'Error broadcasting announcement.');
    } finally {
      setBroadcastSending(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 pb-28">
      {/* Studio Header Card */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Creator Studio</span>
            </div>
            <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
              Author Management
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Publish new chapters, organize your manhwa catalog, and track reader engagement.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] transition-colors"
            >
              <span>Reader View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Quick Author Metric Badges */}
        <div className="grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-[var(--border-subtle)]">
          <div className="p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center">
            <p className="text-lg sm:text-xl font-bold text-[var(--text-main)]">{seriesList.length}</p>
            <p className="text-[10px] sm:text-xs text-[var(--text-secondary)]">Published Series</p>
          </div>
          <div className="p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center">
            <p className="text-lg sm:text-xl font-bold text-[var(--text-main)]">{totalChaptersCount}</p>
            <p className="text-[10px] sm:text-xs text-[var(--text-secondary)]">Chapters Live</p>
          </div>
          <div className="p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center">
            <p className="text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-400">{totalReadsCount}</p>
            <p className="text-[10px] sm:text-xs text-[var(--text-secondary)]">Total Reads</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] mb-6 pb-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'upload'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Chapter</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('manage')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'manage'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Series & Chapters ({seriesList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('broadcast')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'broadcast'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Announcements & Alerts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'analytics'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics</span>
        </button>
      </div>

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

      {/* TAB 1: UPLOAD CHAPTER */}
      {activeTab === 'upload' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 sm:p-10 shadow-xs space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-main)]">Release New Chapter</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Select an existing series or create a new one, then upload your chapter file.
            </p>
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
                  {seriesList.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.title} ({s.chapterCount || s.chapters?.length || 0} chapters)
                    </option>
                  ))}
                  <option value="__new__">+ Create New Series...</option>
                </select>
              </div>

              {/* Weekly Release Day Selector */}
              <div className="sm:col-span-2">
                <label className={labelClasses}>Weekly Release Day</label>
                <select
                  value={releaseDay}
                  onChange={(e) => setReleaseDay(e.target.value)}
                  className={inputClasses}
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d} value={d}>
                      {d} Release (Weekly Calendar)
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[var(--text-muted)] mt-1">
                  Sets the day this series is highlighted on the reader homepage weekly release schedule.
                </p>
              </div>

              {isNewSeries && (
                <div className="sm:col-span-2 space-y-4 p-5 rounded-2xl bg-[var(--bg-surface)] border border-indigo-500/30">
                  <div>
                    <label className={labelClasses}>New Series Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Solo Leveling"
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
      )}

      {/* TAB 2: SERIES & CHAPTERS MANAGEMENT */}
      {activeTab === 'manage' && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
          {seriesList.length === 0 ? (
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-12 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-indigo-500 mx-auto" />
              <h3 className="text-sm font-bold text-[var(--text-main)]">No Series Published Yet</h3>
              <p className="text-xs text-[var(--text-secondary)]">Use the Upload tab to create your first series and chapter.</p>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
              >
                Upload Chapter
              </button>
            </div>
          ) : (
            <>
              {/* Series Picker Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {seriesList.map((s) => {
                  const isSelected = activeManageSeriesObj?.id === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedManageSeries(s.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                        isSelected
                          ? 'bg-indigo-50/10 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20'
                          : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-indigo-500/30'
                      }`}
                    >
                      <div className="w-12 h-16 rounded-xl bg-[var(--bg-surface)] overflow-hidden shrink-0 border border-[var(--border-subtle)] relative">
                        {s.cover_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.cover_url} alt={s.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-[var(--text-muted)] font-bold">
                            📖
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[var(--text-main)] truncate">{s.title}</p>
                        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                          {s.chapterCount || s.chapters?.length || 0} chapters • {s.viewsCount || 0} reads • {s.release_day || 'Monday'}s
                        </p>
                        <div className="flex items-center gap-2 pt-1 text-[10px] text-indigo-500 font-semibold">
                          <span>Manage Chapters</span>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Series Chapters List */}
              {activeManageSeriesObj && (
                <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-4">
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-main)]">
                        Chapters for {activeManageSeriesObj.title}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {activeManageSeriesObj.chapters?.length || 0} chapters uploaded
                      </p>
                    </div>
                    <Link
                      href={`/series/${activeManageSeriesObj.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-400 font-semibold self-start sm:self-auto"
                    >
                      <span>View Series Public Page</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Weekly Release Schedule Setting for Author */}
                  <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        <h4 className="text-xs font-bold text-[var(--text-main)]">Weekly Release Day</h4>
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        Controls which day of the week this series appears on the platform schedule calendar.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <select
                        value={manageReleaseDay}
                        onChange={(e) => setManageReleaseDay(e.target.value)}
                        className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-indigo-500"
                      >
                        {DAYS_OF_WEEK.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleUpdateReleaseDay}
                        disabled={savingSchedule}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                      >
                        {savingSchedule ? 'Saving...' : 'Update Schedule'}
                      </button>
                    </div>
                  </div>

                  {scheduleSuccess && (
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{scheduleSuccess}</span>
                    </div>
                  )}

                  {(!activeManageSeriesObj.chapters || activeManageSeriesObj.chapters.length === 0) ? (
                    <p className="text-xs text-[var(--text-muted)] py-6 text-center">No chapters found for this series.</p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {activeManageSeriesObj.chapters
                        .slice()
                        .sort((a, b) => Number(b.chapter_number) - Number(a.chapter_number))
                        .map((ch) => (
                          <div
                            key={ch.id}
                            className="flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] gap-3"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs text-[var(--text-main)]">
                                  Ch. {ch.chapter_number}
                                </span>
                                {ch.title && (
                                  <span className="text-xs text-[var(--text-secondary)] truncate">
                                    — {ch.title}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-[var(--text-muted)] mt-0.5 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{ch.created_at ? new Date(ch.created_at).toLocaleDateString() : 'Published'}</span>
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <Link
                                href={`/reader/${activeManageSeriesObj.slug}/${ch.chapter_number}`}
                                className="px-3 py-1.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[11px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors"
                              >
                                Read
                              </Link>
                              <button
                                type="button"
                                disabled={deletingChapterId === ch.id}
                                onClick={() => handleDeleteChapter(ch.id, ch.chapter_number, activeManageSeriesObj.title)}
                                className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-colors disabled:opacity-50"
                                title="Delete Chapter"
                              >
                                {deletingChapterId === ch.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB 3: AUTHOR ANNOUNCEMENTS & BROADCASTS */}
      {activeTab === 'broadcast' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 sm:p-10 shadow-xs space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div>
            <div className="flex items-center gap-2 text-indigo-500 mb-1">
              <Radio className="w-4 h-4 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">Reader Broadcast System</span>
            </div>
            <h2 className="text-lg font-bold text-[var(--text-main)]">Send Announcement to Readers</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Broadcast direct release alerts, chapter delays, or milestones directly into the reader navigation bar.
            </p>
          </div>

          {broadcastSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{broadcastSuccess}</span>
            </div>
          )}

          {broadcastError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{broadcastError}</span>
            </div>
          )}

          <form onSubmit={handleSendBroadcast} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Associated Series</label>
                <select
                  value={broadcastSeriesSlug}
                  onChange={(e) => setBroadcastSeriesSlug(e.target.value)}
                  className={inputClasses}
                >
                  {seriesList.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.title}
                    </option>
                  ))}
                  <option value="">General Platform Announcement</option>
                </select>
              </div>

              <div>
                <label className={labelClasses}>Announcement Category</label>
                <select
                  value={broadcastType}
                  onChange={(e) => setBroadcastType(e.target.value)}
                  className={inputClasses}
                >
                  <option value="chapter">Fresh Chapter Alert</option>
                  <option value="announcement">Important Notice / Hiatus</option>
                  <option value="milestone">Celebration / Milestone</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelClasses}>Notification Title *</label>
                <span className={`text-[10px] font-mono ${broadcastTitle.length > 55 ? 'text-amber-500 font-bold' : 'text-[var(--text-muted)]'}`}>
                  {broadcastTitle.length}/60
                </span>
              </div>
              <input
                type="text"
                required
                maxLength={60}
                placeholder="e.g. Chapter 45 Out Now / Special Break Notice"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                className={inputClasses}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelClasses}>Notification Message *</label>
                <span className={`text-[10px] font-mono ${broadcastMessage.length > 185 ? 'text-amber-500 font-bold' : 'text-[var(--text-muted)]'}`}>
                  {broadcastMessage.length}/200
                </span>
              </div>
              <textarea
                required
                rows={3}
                maxLength={200}
                placeholder="e.g. The climactic battle begins! Read with full color vertical scrolling on Lumina Comics."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className={`${inputClasses} resize-none`}
              />
            </div>

            {/* Live Reader Preview Box */}
            <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span className="font-semibold uppercase tracking-wider">Live Reader Preview (Notifications Bell)</span>
                <span className="text-[10px] text-indigo-500 font-mono">Realtime Preview</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-indigo-500/20 shadow-xs flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-cyan-400 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[var(--text-main)] truncate">
                      {broadcastTitle || 'Your Announcement Title'}
                    </h4>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">Just now</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 line-clamp-2">
                    {broadcastMessage || 'Your message will appear here for all readers on the platform.'}
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-cyan-400">
                    By Verified Author
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={broadcastSending}
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-violet-600/25 transition-all cursor-pointer"
            >
              {broadcastSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Broadcasting to Readers...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Broadcast to Readers Now</span>
                </>
              )}
            </button>
          </form>

          {/* Past Broadcasts */}
          {pastBroadcasts.length > 0 && (
            <div className="pt-6 border-t border-[var(--border-subtle)] space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Recent Broadcasts Sent
              </h3>
              <div className="space-y-2">
                {pastBroadcasts.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[var(--text-main)] truncate">{b.title}</p>
                      <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">{b.message}</p>
                    </div>
                    <span className="text-[10px] text-emerald-500 font-bold shrink-0">Live</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CREATOR ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div>
            <h2 className="text-base font-bold text-[var(--text-main)]">Realtime Studio Analytics</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Live engagement data collected directly from reader sessions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {seriesList.map((s) => (
              <div
                key={s.id}
                className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[var(--text-main)] truncate max-w-[200px]">{s.title}</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    Live
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-subtle)] text-xs">
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] block">Total Reads</span>
                    <strong className="text-base font-bold text-[var(--text-main)]">{s.viewsCount || 0}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] block">Chapters Published</span>
                    <strong className="text-base font-bold text-[var(--text-main)]">{s.chapterCount || s.chapters?.length || 0}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}