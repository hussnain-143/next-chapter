'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchLessons } from '../../lib/api';
import { Search, BookOpen, ExternalLink, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function SearchPage() {
  const [query, setQuery] = useState('');

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['searchLessons', query],
    queryFn: () => searchLessons(query),
    enabled: query.trim().length > 1,
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="space-y-2 select-none">
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          Global Text Search <Search className="w-5.5 h-5.5 text-primary" />
        </h2>
        <p className="text-sm text-muted-foreground">Full-text search inside all your compiled study guides and notes.</p>
      </div>

      {/* Input box */}
      <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
        <Search className="w-5 h-5 text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder="Type keywords, concepts, code snippets, or notes titles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 text-sm bg-transparent border-0 focus:outline-none text-foreground placeholder-muted-foreground"
        />
      </div>

      {/* Search results list */}
      <div className="space-y-4">
        {query.trim().length <= 1 ? (
          <p className="text-xs text-muted-foreground italic text-center py-12">Type at least 2 characters to search notes content...</p>
        ) : isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-accent/20 rounded-xl"></div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center text-xs text-muted-foreground italic">
            No search matches found for &quot;{query}&quot;. Try typing different keywords!
          </div>
        ) : (
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">
              Found {results.length} Matches
            </span>
            {results.map((lesson) => (
              <div
                key={lesson._id}
                className="glass-card rounded-2xl p-5 hover:translate-y-[-1px] hover:shadow-sm transition-all duration-200 flex justify-between items-start gap-6"
              >
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 uppercase font-mono tracking-wider">
                      {lesson.difficulty}
                    </span>
                    <span className="text-[10px] text-muted-foreground">Lesson node</span>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground truncate">{lesson.title}</h4>
                  
                  {/* Sneak peek / snippet of summary/notes */}
                  {lesson.notes && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {lesson.notes}
                    </p>
                  )}
                </div>

                <Link
                  href={`/subjects/${lesson.subjectId}/${lesson.chapterId}/${lesson._id}`}
                  className="p-2.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent/40 transition shrink-0 flex items-center justify-center"
                  title="Open Lesson Node"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
