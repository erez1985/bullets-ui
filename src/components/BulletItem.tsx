import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Bullet, Tag, Person, TagColor } from '@/types';
import { cn } from '@/lib/utils';
import { Check, Circle, GripVertical, X } from 'lucide-react';
import { TagPopover } from './TagPopover';
import { MentionPopover } from './MentionPopover';

interface BulletItemProps {
  bullet: Bullet;
  tags: Tag[];
  people: Person[];
  onUpdate: (updates: Partial<Bullet>) => void;
  onDelete: () => void;
  onAddBullet: (type: 'checkbox' | 'bullet') => void;
  onCreateTag: (name: string, color: TagColor) => Tag;
  onCreatePerson: (name: string) => Person;
}

export function BulletItem({
  bullet,
  tags,
  people,
  onUpdate,
  onDelete,
  onAddBullet,
  onCreateTag,
  onCreatePerson,
}: BulletItemProps) {
  const [content, setContent] = useState(bullet.content);
  const [showTagPopover, setShowTagPopover] = useState(false);
  const [showMentionPopover, setShowMentionPopover] = useState(false);
  const [tagSearchPosition, setTagSearchPosition] = useState(0);
  const [mentionSearchPosition, setMentionSearchPosition] = useState(0);
  const inputRef = useRef<HTMLDivElement>(null);

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

  // Only sync content from props when bullet ID changes (not on every content change)
  useEffect(() => {
    setContent(bullet.content);
    if (inputRef.current) {
      inputRef.current.textContent = bullet.content;
    }
  }, [bullet.id]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // Don't create new bullet if tag or mention popover is open
    if (e.key === 'Enter' && !e.shiftKey && !showTagPopover && !showMentionPopover) {
      e.preventDefault();
      onAddBullet(bullet.type);
      // Focus the next bullet after React re-renders
      requestAnimationFrame(() => {
        const currentWrapper = inputRef.current?.closest('[data-bullet-id]');
        const nextWrapper = currentWrapper?.nextElementSibling;
        const nextInput = nextWrapper?.querySelector('[contenteditable="true"]') as HTMLElement;
        if (nextInput) {
          nextInput.focus();
        }
      });
    } else if (e.key === 'Backspace' && content === '' && bullet.tags.length === 0) {
      e.preventDefault();
      // Focus the previous bullet before deleting
      const currentWrapper = inputRef.current?.closest('[data-bullet-id]');
      const prevWrapper = currentWrapper?.previousElementSibling;
      const prevInput = prevWrapper?.querySelector('[contenteditable="true"]') as HTMLElement;
      onDelete();
      if (prevInput) {
        requestAnimationFrame(() => prevInput.focus());
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const newIndent = e.shiftKey 
        ? Math.max(0, bullet.indent - 1) 
        : Math.min(4, bullet.indent + 1);
      onUpdate({ indent: newIndent });
    }
  };

  const handleInput = () => {
    const text = inputRef.current?.textContent || '';
    setContent(text);
    onUpdate({ content: text });

    // Check for tag trigger
    const lastSlashIndex = text.lastIndexOf('/');
    if (lastSlashIndex !== -1 && lastSlashIndex === text.length - 1) {
      setTagSearchPosition(lastSlashIndex);
      setShowTagPopover(true);
      setShowMentionPopover(false);
    } else if (lastSlashIndex !== -1 && text.slice(lastSlashIndex).indexOf(' ') === -1) {
      setTagSearchPosition(lastSlashIndex);
      setShowTagPopover(true);
    } else {
      setShowTagPopover(false);
    }

    // Check for mention trigger
    const lastAtIndex = text.lastIndexOf('@');
    if (lastAtIndex !== -1 && lastAtIndex === text.length - 1) {
      setMentionSearchPosition(lastAtIndex);
      setShowMentionPopover(true);
      setShowTagPopover(false);
    } else if (lastAtIndex !== -1 && text.slice(lastAtIndex).indexOf(' ') === -1) {
      setMentionSearchPosition(lastAtIndex);
      setShowMentionPopover(true);
    } else {
      setShowMentionPopover(false);
    }
  };

  const handleSelectTag = (tag: Tag) => {
    // Remove the /search text and add the tag
    const newContent = content.slice(0, tagSearchPosition);
    setContent(newContent);
    if (inputRef.current) {
      inputRef.current.textContent = newContent;
    }
    onUpdate({ 
      content: newContent,
      tags: [...bullet.tags, tag] 
    });
    setShowTagPopover(false);
    inputRef.current?.focus();
  };

  const handleSelectMention = (person: Person) => {
    // Remove the @search text and add the mention
    const newContent = content.slice(0, mentionSearchPosition);
    setContent(newContent);
    if (inputRef.current) {
      inputRef.current.textContent = newContent;
    }
    onUpdate({ 
      content: newContent,
      mentions: [...bullet.mentions, person] 
    });
    setShowMentionPopover(false);
    inputRef.current?.focus();
  };

  const handleRemoveTag = (tagId: string) => {
    onUpdate({ tags: bullet.tags.filter((t) => t.id !== tagId) });
  };

  const handleRemoveMention = (personId: string) => {
    onUpdate({ mentions: bullet.mentions.filter((p) => p.id !== personId) });
  };

  const toggleCheckbox = () => {
    if (bullet.type === 'checkbox') {
      onUpdate({ checked: !bullet.checked });
    }
  };

  const toggleType = () => {
    onUpdate({ 
      type: bullet.type === 'checkbox' ? 'bullet' : 'checkbox',
      checked: false 
    });
  };

  const getSearchQuery = () => {
    if (showTagPopover) {
      return content.slice(tagSearchPosition + 1);
    }
    if (showMentionPopover) {
      return content.slice(mentionSearchPosition + 1);
    }
    return '';
  };

  return (
    <div
      data-bullet-id={bullet.id}
      className={cn(
        'group flex items-start gap-2 py-1.5 px-2 rounded-lg transition-smooth hover:bg-muted/50',
        bullet.checked && 'opacity-60'
      )}
      style={{ paddingLeft: `${bullet.indent * 24 + 8}px` }}
    >
      {/* Drag handle */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab pt-1">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Checkbox/Bullet */}
      <button
        onClick={toggleCheckbox}
        onDoubleClick={toggleType}
        className="flex-shrink-0 mt-1"
        title="Click to toggle, double-click to change type"
      >
        {bullet.type === 'checkbox' ? (
          <div
            className={cn(
              'w-4 h-4 rounded-md border-2 flex items-center justify-center transition-smooth',
              bullet.checked
                ? 'bg-primary border-primary'
                : 'border-muted-foreground/40 hover:border-primary'
            )}
          >
            {bullet.checked && <Check className="h-3 w-3 text-primary-foreground" />}
          </div>
        ) : (
          <Circle className="h-2 w-2 fill-muted-foreground text-muted-foreground mt-1.5" />
        )}
      </button>

      {/* Content area */}
      <div className="flex-1 min-w-0 relative">
        <span className="inline-flex flex-wrap items-center gap-1.5">
          {/* Editable content */}
          <span
            ref={inputRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            className={cn(
              'outline-none text-foreground min-w-[50px]',
              bullet.checked && 'line-through text-muted-foreground'
            )}
            data-placeholder="Type something..."
          />

          {/* Mentions - inline after text */}
          {bullet.mentions.map((person) => (
            <span
              key={person.id}
              className="mention animate-scale-in"
            >
              @{person.name}
              <button
                onClick={() => handleRemoveMention(person.id)}
                className="ml-1 hover:text-primary/80"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {/* Tags - inline after text */}
          {bullet.tags.map((tag) => (
            <span
              key={tag.id}
              className={cn(
                'tag-pill border animate-scale-in',
                tagColorClasses[tag.color]
              )}
            >
              #{tag.name}
              <button
                onClick={() => handleRemoveTag(tag.id)}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </span>

        {/* Tag Popover */}
        {showTagPopover && (
          <TagPopover
            tags={tags}
            searchQuery={getSearchQuery()}
            onSelect={handleSelectTag}
            onCreate={onCreateTag}
            onClose={() => setShowTagPopover(false)}
          />
        )}

        {/* Mention Popover */}
        {showMentionPopover && (
          <MentionPopover
            people={people}
            searchQuery={getSearchQuery()}
            onSelect={handleSelectMention}
            onCreate={onCreatePerson}
            onClose={() => setShowMentionPopover(false)}
          />
        )}
      </div>
    </div>
  );
}
