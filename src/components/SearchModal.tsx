import { useState, useEffect, useRef, useMemo } from 'react';
import { Note } from '@/types';
import { cn } from '@/lib/utils';
import { Search, FileText, X } from 'lucide-react';
import { format } from 'date-fns';

interface SearchModalProps {
  isOpen: boolean;
  notes: Note[];
  onClose: () => void;
  onSelectNote: (noteId: string) => void;
}

interface SearchResult {
  note: Note;
  matchedContent: string;
  matchType: 'title' | 'content';
}

export function SearchModal({
  isOpen,
  notes,
  onClose,
  onSelectNote,
}: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Search results
  const results = useMemo((): SearchResult[] => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    notes.forEach((note) => {
      // Search in title
      if (note.title.toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          note,
          matchedContent: note.title,
          matchType: 'title',
        });
        return;
      }

      // Search in bullets
      for (const bullet of note.bullets) {
        if (bullet.content.toLowerCase().includes(lowerQuery)) {
          searchResults.push({
            note,
            matchedContent: bullet.content,
            matchType: 'content',
          });
          return;
        }
      }
    });

    return searchResults.slice(0, 10); // Limit to 10 results
  }, [query, notes]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results.length]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      onSelectNote(results[selectedIndex].note.id);
      onClose();
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);
    
    if (index === -1) return text;
    
    return (
      <>
        {text.slice(0, index)}
        <span className="bg-primary/30 text-primary font-medium">
          {text.slice(index, index + query.length)}
        </span>
        {text.slice(index + query.length)}
      </>
    );
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-slide-down"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search notes..."
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={resultsRef} className="max-h-[50vh] overflow-y-auto">
          {query && results.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <p className="text-sm">No results found for "{query}"</p>
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={result.note.id}
                  onClick={() => {
                    onSelectNote(result.note.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    'w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors',
                    selectedIndex === index
                      ? 'bg-accent'
                      : 'hover:bg-muted/50'
                  )}
                >
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {result.matchType === 'title'
                        ? highlightMatch(result.note.title || 'Untitled', query)
                        : result.note.title || 'Untitled'}
                    </p>
                    {result.matchType === 'content' && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {highlightMatch(result.matchedContent, query)}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                      {format(result.note.updatedAt, 'MMM d, yyyy')}
                    </p>
                  </div>
                  {selectedIndex === index && (
                    <kbd className="hidden sm:inline-flex h-5 items-center rounded border bg-muted px-1.5 text-[10px] text-muted-foreground">
                      ↵
                    </kbd>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-6 text-center text-muted-foreground">
              <p className="text-sm">Type to search notes...</p>
              <p className="text-xs mt-1">
                Search by title or content
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {results.length > 0 && (
          <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="inline-flex h-4 items-center rounded border bg-muted px-1">↑</kbd>
              <kbd className="inline-flex h-4 items-center rounded border bg-muted px-1">↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="inline-flex h-4 items-center rounded border bg-muted px-1">↵</kbd>
              to open
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

