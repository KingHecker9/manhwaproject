'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, Star, BookOpen, ChevronRight } from 'lucide-react';
import { DAYS_OF_WEEK } from '../lib/series-metadata';
import ManhwaCard from './ManhwaCard';

export default function DailySchedule({ seriesList = [] }) {
  // Get today's day name in English (Monday, Tuesday, ...)
  const todayName = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  }, []);

  const [selectedDay, setSelectedDay] = useState(todayName);

  // Group series by their release day
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
        map['Monday'].push(s);
      }
    });

    return map;
  }, [seriesList]);

  const activeSeries = seriesByDay[selectedDay] || [];

  return (
    <section id="schedule" className="my-14 scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
            <Calendar className="w-4 h-4" strokeWidth={2} />
            <span>Weekly Release Calendar</span>
          </div>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
            Daily Release Schedule
          </h2>
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          Follow series releasing on your favorite days
        </p>
      </div>

      {/* Monday - Sunday Day Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
        {DAYS_OF_WEEK.map((day) => {
          const isSelected = selectedDay === day;
          const isToday = todayName === day;
          const count = seriesByDay[day]?.length || 0;

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              type="button"
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/25 scale-102'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)]'
              }`}
            >
              <span>{day.slice(0, 3)}</span>
              {isToday && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400'
                  }`}
                >
                  Today
                </span>
              )}
              {count > 0 && (
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
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
      <div className="mt-6">
        {activeSeries.length === 0 ? (
          <div className="py-16 px-4 text-center rounded-3xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-card)]/50">
            <Clock className="w-10 h-10 mx-auto text-indigo-400/50 mb-3" strokeWidth={1.5} />
            <h3 className="text-sm font-semibold text-[var(--text-main)]">
              No series scheduled for {selectedDay} yet
            </h3>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto mt-1">
              Check out other days in the calendar to discover fresh weekly updates!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {activeSeries.map((series) => (
              <ManhwaCard key={series.id} series={series} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
