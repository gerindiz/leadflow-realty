'use client';

import { useState } from 'react';

interface Props {
  title: string;
  subtitle?: string;
}

export default function DashboardHeader({ title, subtitle }: Props) {
  const [search, setSearch] = useState('');

  return (
    <header className="h-16 px-6 flex items-center justify-between border-b border-slate-200 bg-white shrink-0">
      <div>
        <h1 className="text-base font-semibold text-slate-900 leading-none">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar leads..."
            className="pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 w-52 transition-all"
          />
        </div>

        <button className="relative p-2 rounded-xl hover:bg-slate-50 text-slate-500 transition-colors border border-slate-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
        </button>

        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:bg-emerald-600 transition-colors shadow-sm">
          A
        </div>
      </div>
    </header>
  );
}
