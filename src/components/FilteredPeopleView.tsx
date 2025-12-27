import { Tag, Person } from '@/types';
import { cn } from '@/lib/utils';
import { ArrowLeft, Check, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilteredBullet {
  id: string;
  content: string;
  type: 'checkbox' | 'bullet';
  checked: boolean;
  noteId: string;
  noteTitle: string;
  tags: Tag[];
  mentions: Person[];
}

interface FilteredPeopleViewProps {
  person: Person;
  bullets: FilteredBullet[];
  onClearFilter: () => void;
  onSelectNote: (noteId: string) => void;
  onToggleBullet: (noteId: string, bulletId: string, checked: boolean) => void;
}

const tagColorClasses: Record<string, string> = {
  red: 'bg-tag-red/20 text-tag-red border-tag-red/30',
  orange: 'bg-tag-orange/20 text-tag-orange border-tag-orange/30',
  yellow: 'bg-tag-yellow/20 text-tag-yellow border-tag-yellow/30',
  green: 'bg-tag-green/20 text-tag-green border-tag-green/30',
  blue: 'bg-tag-blue/20 text-tag-blue border-tag-blue/30',
  purple: 'bg-tag-purple/20 text-tag-purple border-tag-purple/30',
  pink: 'bg-tag-pink/20 text-tag-pink border-tag-pink/30',
  gray: 'bg-tag-gray/20 text-tag-gray border-tag-gray/30',
};

export function FilteredPeopleView({
  person,
  bullets,
  onClearFilter,
  onSelectNote,
  onToggleBullet,
}: FilteredPeopleViewProps) {
  return (
    <div className="flex-1 h-screen flex flex-col bg-card overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-2 px-4 py-2 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClearFilter}
          className="h-6 w-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-primary font-medium text-sm">
            @{person.name}
          </span>
          <span className="text-muted-foreground text-xs">
            {bullets.length} item{bullets.length !== 1 ? 's' : ''}
          </span>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto paper-texture">
        <div className="max-w-3xl px-4 py-4">
          <h1 className="text-lg font-semibold text-foreground mb-3">
            All items assigned to @{person.name}
          </h1>

          {bullets.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No items found assigned to this person.
            </p>
          ) : (
            <div className="space-y-2">
              {bullets.map((bullet) => (
                <div
                  key={bullet.id}
                  onClick={() => {
                    onSelectNote(bullet.noteId);
                    onClearFilter();
                  }}
                  className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border hover:shadow-soft hover:bg-accent/50 transition-smooth cursor-pointer"
                >
                  {/* Checkbox/Bullet */}
                  <div className="flex-shrink-0">
                    {bullet.type === 'checkbox' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBullet(bullet.noteId, bullet.id, !bullet.checked);
                        }}
                        className={cn(
                          'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-smooth',
                          bullet.checked
                            ? 'bg-primary border-primary'
                            : 'border-muted-foreground/40 hover:border-primary'
                        )}
                      >
                        {bullet.checked && (
                          <Check className="h-2.5 w-2.5 text-primary-foreground" />
                        )}
                      </button>
                    ) : (
                      <Circle className="h-1.5 w-1.5 fill-muted-foreground text-muted-foreground" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-foreground text-sm',
                        bullet.checked && 'line-through text-muted-foreground'
                      )}
                    >
                      {bullet.content || 'Empty item'}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      From: {bullet.noteTitle}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-0.5">
                    {bullet.tags.map((t) => (
                      <span
                        key={t.id}
                        className={cn(
                          'tag-pill border',
                          tagColorClasses[t.color]
                        )}
                      >
                        #{t.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

