import { Tag } from '@/types';
import { cn } from '@/lib/utils';
import { ArrowLeft, Check, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilteredBullet {
  id: string;
  content: string;
  type: 'checkbox' | 'bullet';
  checked: boolean;
  noteTitle: string;
  tags: Tag[];
}

interface FilteredBulletsViewProps {
  tag: Tag;
  bullets: FilteredBullet[];
  onClearFilter: () => void;
  onSelectNote: (noteId: string) => void;
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

export function FilteredBulletsView({
  tag,
  bullets,
  onClearFilter,
}: FilteredBulletsViewProps) {
  return (
    <div className="flex-1 h-screen flex flex-col bg-card overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-4 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClearFilter}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'tag-pill border text-sm',
              tagColorClasses[tag.color]
            )}
          >
            #{tag.name}
          </span>
          <span className="text-muted-foreground">
            {bullets.length} item{bullets.length !== 1 ? 's' : ''}
          </span>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto paper-texture">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-semibold text-foreground mb-6">
            All items tagged #{tag.name}
          </h1>

          {bullets.length === 0 ? (
            <p className="text-muted-foreground">
              No items found with this tag.
            </p>
          ) : (
            <div className="space-y-4">
              {bullets.map((bullet) => (
                <div
                  key={bullet.id}
                  className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border hover:shadow-soft transition-smooth"
                >
                  {/* Checkbox/Bullet */}
                  <div className="flex-shrink-0 mt-0.5">
                    {bullet.type === 'checkbox' ? (
                      <div
                        className={cn(
                          'w-4 h-4 rounded-md border-2 flex items-center justify-center',
                          bullet.checked
                            ? 'bg-primary border-primary'
                            : 'border-muted-foreground/40'
                        )}
                      >
                        {bullet.checked && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                    ) : (
                      <Circle className="h-2 w-2 fill-muted-foreground text-muted-foreground mt-1.5" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-foreground',
                        bullet.checked && 'line-through text-muted-foreground'
                      )}
                    >
                      {bullet.content || 'Empty item'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      From: {bullet.noteTitle}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {bullet.tags.map((t) => (
                      <span
                        key={t.id}
                        className={cn(
                          'tag-pill border text-xs',
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
