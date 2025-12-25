import { Note, Tag } from '@/types';
import { cn } from '@/lib/utils';
import { Pin, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface NotesListProps {
  notes: Note[];
  selectedNoteId: string | null;
  filterTag: Tag | null;
  onSelectNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
}

export function NotesList({
  notes,
  selectedNoteId,
  filterTag,
  onSelectNote,
  onDeleteNote,
  onTogglePin,
}: NotesListProps) {
  const noteColorClasses: Record<string, string> = {
    yellow: 'bg-note-yellow',
    green: 'bg-note-green',
    blue: 'bg-note-blue',
    pink: 'bg-note-pink',
    purple: 'bg-note-purple',
  };

  const getPreview = (note: Note) => {
    const firstBullet = note.bullets[0];
    if (!firstBullet) return 'Empty note';
    return firstBullet.content || 'Empty note';
  };

  return (
    <div className="w-72 h-screen flex flex-col bg-card border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="font-medium text-foreground">
          {filterTag ? (
            <span className="flex items-center gap-2">
              Filtered by <span className="text-primary">#{filterTag.name}</span>
            </span>
          ) : (
            `${notes.length} Notes`
          )}
        </h2>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p className="text-sm">No notes yet</p>
            <p className="text-xs mt-1">Create your first note!</p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              onClick={() => onSelectNote(note.id)}
              className={cn(
                'group relative p-3 rounded-xl cursor-pointer transition-smooth note-card-hover',
                note.color ? noteColorClasses[note.color] : 'bg-muted/50',
                selectedNoteId === note.id
                  ? 'ring-2 ring-primary shadow-soft'
                  : 'hover:shadow-soft'
              )}
            >
              {/* Pin indicator */}
              {note.isPinned && (
                <Pin className="absolute top-2 right-2 h-3.5 w-3.5 text-primary fill-primary" />
              )}

              {/* Title */}
              <h3 className="font-medium text-foreground truncate pr-6">
                {note.title}
              </h3>

              {/* Preview */}
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {getPreview(note)}
              </p>

              {/* Date */}
              <p className="text-xs text-muted-foreground mt-2">
                {format(note.updatedAt, 'MMM d, yyyy')}
              </p>

              {/* Tags preview */}
              {note.bullets.some((b) => b.tags.length > 0) && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {Array.from(
                    new Set(
                      note.bullets.flatMap((b) => b.tags.map((t) => t.name))
                    )
                  )
                    .slice(0, 3)
                    .map((tagName) => (
                      <span
                        key={tagName}
                        className="text-xs px-1.5 py-0.5 rounded bg-foreground/10 text-foreground/70"
                      >
                        #{tagName}
                      </span>
                    ))}
                </div>
              )}

              {/* Actions */}
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => onTogglePin(note.id)}>
                      <Pin className="h-4 w-4 mr-2" />
                      {note.isPinned ? 'Unpin' : 'Pin'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteNote(note.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
