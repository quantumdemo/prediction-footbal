'use client';

import { useState } from 'react';

interface MatchSearchProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export default function MatchSearch({ onSearch, isLoading }: MatchSearchProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mb-12">
      <div className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Man City vs Chelsea"
          className="w-full bg-card-bg border-2 border-border-custom rounded-2xl px-6 py-5 text-xl text-white placeholder-gray-500 focus:border-accent transition-all duration-300 pr-32"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-3 top-3 bottom-3 px-6 bg-accent text-background font-bold rounded-xl hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin"></span>
              Wait
            </span>
          ) : (
            'Predict'
          )}
        </button>
      </div>
      <p className="text-center text-gray-500 mt-4 text-sm">
        Enter two teams to analyze recent form, H2H, injuries, and more.
      </p>
    </form>
  );
}
