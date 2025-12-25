import { useState, useEffect, useRef } from 'react';
import { Person } from '@/types';
import { cn } from '@/lib/utils';
import { Plus, User } from 'lucide-react';

interface MentionPopoverProps {
  people: Person[];
  searchQuery: string;
  onSelect: (person: Person) => void;
  onCreate: (name: string) => Person;
  onClose: () => void;
}

export function MentionPopover({
  people,
  searchQuery,
  onSelect,
  onCreate,
  onClose,
}: MentionPopoverProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const popoverRef = useRef<HTMLDivElement>(null);

  const filteredPeople = people.filter((person) =>
    person.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showCreateOption =
    searchQuery.length > 0 &&
    !filteredPeople.some((p) => p.name.toLowerCase() === searchQuery.toLowerCase());

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          Math.min(prev + 1, filteredPeople.length - (showCreateOption ? 0 : 1))
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex === filteredPeople.length && showCreateOption) {
          const newPerson = onCreate(searchQuery);
          onSelect(newPerson);
        } else if (filteredPeople[selectedIndex]) {
          onSelect(filteredPeople[selectedIndex]);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [filteredPeople, selectedIndex, showCreateOption, onClose, onSelect, onCreate, searchQuery]);

  return (
    <div
      ref={popoverRef}
      className="absolute left-0 top-full mt-1 z-50 w-56 bg-popover border border-border rounded-lg shadow-soft-lg animate-slide-down overflow-hidden"
    >
      <div className="py-1 max-h-48 overflow-y-auto">
        {filteredPeople.length === 0 && !showCreateOption ? (
          <p className="px-3 py-2 text-sm text-muted-foreground">No people found</p>
        ) : (
          <>
            {filteredPeople.map((person, index) => (
              <button
                key={person.id}
                onClick={() => onSelect(person)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-smooth',
                  selectedIndex === index
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-muted'
                )}
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  {person.avatar ? (
                    <img
                      src={person.avatar}
                      alt={person.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-3.5 w-3.5 text-primary" />
                  )}
                </div>
                <span>@{person.name}</span>
              </button>
            ))}

            {showCreateOption && (
              <button
                onClick={() => {
                  const newPerson = onCreate(searchQuery);
                  onSelect(newPerson);
                }}
                onMouseEnter={() => setSelectedIndex(filteredPeople.length)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-smooth border-t border-border',
                  selectedIndex === filteredPeople.length
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-muted'
                )}
              >
                <Plus className="h-4 w-4" />
                <span>Add "@{searchQuery}"</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
