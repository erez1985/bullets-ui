import { useState, useEffect } from 'react';
import { Note, Tag, Person, Bullet, TagColor } from '@/types';
import { BulletItem } from './BulletItem';
import { cn } from '@/lib/utils';
import { 
  MoreHorizontal, 
  Pin, 
  Trash2, 
  Palette,
  ListTodo,
  List,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface NoteEditorProps {
  note: Note;
  tags: Tag[];
  people: Person[];
  onUpdateNote: (updates: Partial<Note>) => void;
  onDeleteNote: () => void;
  onTogglePin: () => void;
  onAddBullet: (afterBulletId?: string, type?: 'checkbox' | 'bullet') => void;
  onUpdateBullet: (bulletId: string, updates: Partial<Bullet>) => void;
  onDeleteBullet: (bulletId: string) => void;
  onCreateTag: (name: string, color: TagColor) => Tag;
  onCreatePerson: (name: string) => Person;
}

const noteColors = [
  { id: 'yellow', label: 'Yellow', className: 'bg-note-yellow' },
  { id: 'green', label: 'Green', className: 'bg-note-green' },
  { id: 'blue', label: 'Blue', className: 'bg-note-blue' },
  { id: 'pink', label: 'Pink', className: 'bg-note-pink' },
  { id: 'purple', label: 'Purple', className: 'bg-note-purple' },
];

export function NoteEditor({
  note,
  tags,
  people,
  onUpdateNote,
  onDeleteNote,
  onTogglePin,
  onAddBullet,
  onUpdateBullet,
  onDeleteBullet,
  onCreateTag,
  onCreatePerson,
}: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);

  useEffect(() => {
    setTitle(note.title);
  }, [note.id, note.title]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    onUpdateNote({ title: e.target.value });
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Focus first bullet
      const firstBullet = document.querySelector('[contenteditable="true"]');
      if (firstBullet) {
        (firstBullet as HTMLElement).focus();
      }
    }
  };

  const noteColorClass = note.color
    ? noteColors.find((c) => c.id === note.color)?.className
    : '';

  return (
    <div className="flex-1 h-screen flex flex-col bg-card overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{format(note.updatedAt, 'MMM d, yyyy · h:mm a')}</span>
          {note.isPinned && (
            <span className="flex items-center gap-1 text-primary">
              <Pin className="h-3 w-3 fill-current" />
              Pinned
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Color picker */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Palette className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <p className="px-2 py-1.5 text-xs text-muted-foreground">Note Color</p>
              <div className="flex gap-1 px-2 pb-2">
                {noteColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => onUpdateNote({ color: color.id as Note['color'] })}
                    className={cn(
                      'w-6 h-6 rounded-full transition-smooth',
                      color.className,
                      note.color === color.id && 'ring-2 ring-ring ring-offset-2'
                    )}
                    title={color.label}
                  />
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* More actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onTogglePin}>
                <Pin className="h-4 w-4 mr-2" />
                {note.isPinned ? 'Unpin Note' : 'Pin Note'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddBullet(undefined, 'checkbox')}>
                <ListTodo className="h-4 w-4 mr-2" />
                Add Checkbox
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddBullet(undefined, 'bullet')}>
                <List className="h-4 w-4 mr-2" />
                Add Bullet
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={onDeleteNote}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Note
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Content */}
      <div 
        className={cn(
          'flex-1 overflow-y-auto paper-texture',
          noteColorClass
        )}
      >
        <div className="max-w-3xl px-4 py-4">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            onKeyDown={handleTitleKeyDown}
            placeholder="Note Title"
            className="w-full text-2xl font-semibold bg-transparent border-none outline-none placeholder:text-muted-foreground/50 mb-3"
          />

          {/* Bullets */}
          <div className="space-y-0">
            {note.bullets.map((bullet, index) => (
              <BulletItem
                key={`${note.id}-${index}`}
                bullet={bullet}
                tags={tags}
                people={people}
                onUpdate={(updates) => onUpdateBullet(bullet.id, updates)}
                onDelete={() => onDeleteBullet(bullet.id)}
                onAddBullet={(type) => onAddBullet(bullet.id, type)}
                onCreateTag={onCreateTag}
                onCreatePerson={onCreatePerson}
              />
            ))}
          </div>

          {/* Quick add buttons */}
          <div className="flex items-center gap-1 mt-4 pt-3 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddBullet(undefined, 'bullet')}
              className="text-muted-foreground hover:text-foreground h-7 text-xs"
            >
              <List className="h-3.5 w-3.5 mr-1.5" />
              Add bullet
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddBullet(undefined, 'checkbox')}
              className="text-muted-foreground hover:text-foreground h-7 text-xs"
            >
              <ListTodo className="h-3.5 w-3.5 mr-1.5" />
              Add checkbox
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
