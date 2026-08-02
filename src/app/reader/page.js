import { getChapter, getSeries } from '../../lib/chapters';
import ReaderView from './ReaderView';

export default async function ReaderPage({ searchParams }) {
  const params = await searchParams;
  const seriesId = params.series;
  const chapterNumber = params.chapter;

  const series = getSeries(seriesId);
  const chapter = getChapter(seriesId, chapterNumber);

  if (!series || !chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p className="text-sm text-neutral-400">Chapter not found.</p>
      </div>
    );
  }

  return <ReaderView seriesId={seriesId} seriesTitle={series.title} chapter={chapter} />;
}