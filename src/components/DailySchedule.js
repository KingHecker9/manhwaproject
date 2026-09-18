'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { DAYS_OF_WEEK } from '../lib/series-metadata';
import ManhwaCard from './ManhwaCard';

export default function DailySchedule({ seriesList = [] }) {
  // Get today's day name in English (Monday, Tuesday, ...)
  const todayName = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  }, []);

  const [selectedDay, setSelectedDay] = useState(todayName);

  // Group series by their real release day
  const seriesByDay = useMemo(() => {
    const map = {};
    DAYS_OF_WEEK.forEach((day) => {
      map[day] = [];
    });

    seriesList.forEach((s) => {
      const day = s.releaseDay || 'Monday';
      if (map[day]) {
        map[day].push(s);
      } else {
        // If releaseDay isn't a recognized weekday, distribute or list under its assigned day
        map['Monday'].push(s);
      }
    });

    return map;
  }, [seriesList]);

  const activeSeries = seriesByDay[selectedDay] || [];

  return (
    <section id="schedule" className="my-10 sm:my-14 scroll-mt-20">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1 mb-5">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-cyan-400 mb-1">
            <Calendar className="w-3.5 h-3.5 text-violet-500" strokeWidth={2} />
            <span>Weekly Release Calendar</span>
          </div>
          <h2 className="font-serif-display text-xl sm:text-3xl font-bold text-[var(--text-main)]">
            Daily Release Schedule
          </h2>
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          Follow updates releasing on your favorite days
        </p>
      </div>

      {/* Monday - Sunday Day Tabs with touch horizontal scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
        {DAYS_OF_WEEK.map((day) => {
          const isSelected = selectedDay === day;
          const isToday = todayName === day;
          const count = seriesByDay[day]?.length || 0;

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              type="button"
              className={`relative flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 border cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-transparent shadow-md shadow-violet-600/30 scale-102'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)]'
              }`}
            >
              <span>{day.slice(0, 3)}</span>
              {isToday && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-violet-100 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400'
                  }`}
                >
                  Today
                </span>
              )}
              {count > 0 && (
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    isSelected
                      ? 'bg-white text-indigo-600 font-bold'
                      : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Series Grid for Selected Day */}
      <div key={`day-grid-${selectedDay}`} className="mt-5 animate-tab-switch">
        {activeSeries.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-3xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-card)]/50 space-y-2">
            <Clock className="w-8 h-8 mx-auto text-violet-400/50 mb-2" strokeWidth={1.5} />
            <h3 className="text-sm font-semibold text-[var(--text-main)]">
              No series scheduled for {selectedDay} yet
            </h3>
            <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">
              Check other days of the week or browse our full library below.
            </p>
            <div className="pt-2">
              <a
                href="#catalog"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-500 hover:text-indigo-400 hover:underline"
              >
                <span>Browse All Series</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {activeSeries.map((series) => (
              <ManhwaCard key={series.id} series={series} />
            ))}
          </div>
        )}
      </div>

    </section>
  );
}
