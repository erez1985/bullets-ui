import { useState, useRef, useEffect, KeyboardEvent, useCallback } from 'react';
import { Bullet, Tag, Person, TagColor } from '@/types';
import { cn } from '@/lib/utils';
import { Check, Circle, GripVertical, X, Bold, Italic, Underline } from 'lucide-react';
import { TagPopover } from './TagPopover';
import { MentionPopover } from './MentionPopover';

interface BulletItemProps {
  bullet: Bullet;
  tags: Tag[];
  people: Person[];
  onUpdate: (updates: Partial<Bullet>) => void;
  onDelete: () => void;
  onAddBullet: (type: 'checkbox' | 'bullet') => void;
  onCreateTag: (name: string, color: TagColor) => Promise<Tag>;
  onCreatePerson: (name: string) => Promise<Person>;
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
  const [showFormatToolbar, setShowFormatToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const inputRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Show format toolbar on mouseup after selection
  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !inputRef.current?.contains(selection.anchorNode)) {
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = inputRef.current.getBoundingClientRect();

    setToolbarPosition({
      top: rect.top - containerRect.top - 40,
      left: rect.left - containerRect.left + rect.width / 2,
    });
    setShowFormatToolbar(true);
  }, []);

  // Hide toolbar when clicking outside
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      // Don't hide if clicking the toolbar itself
      if (toolbarRef.current?.contains(e.target as Node)) {
        return;
      }
      // Hide toolbar if clicking outside the current input
      if (!inputRef.current?.contains(e.target as Node)) {
        setShowFormatToolbar(false);
      }
    };

    const handleKeyDown = () => {
      // Hide toolbar when starting to type
      setShowFormatToolbar(false);
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Format text helper
  const formatText = (command: string) => {
    document.execCommand(command, false);
    inputRef.current?.focus();
  };

  const tagColorClasses: Record<string, string> = {
    red: 'bg-tag-red/20 text-tag-red border-tag-red',
    orange: 'bg-tag-orange/20 text-tag-orange border-tag-orange',
    yellow: 'bg-tag-yellow/10 text-tag-yellow border-tag-yellow',
    green: 'bg-tag-green/10 text-tag-green border-tag-green',
    blue: 'bg-tag-blue/20 text-tag-blue border-tag-blue',
    purple: 'bg-tag-purple/10 text-tag-purple border-tag-purple',
    pink: 'bg-tag-pink/10 text-tag-pink border-tag-pink',
    gray: 'bg-tag-gray/10 text-tag-gray border-tag-gray',
  };

  // Track if this is the first render
  const isFirstRenderRef = useRef(true);
  const prevIdRef = useRef(bullet.id);
  
  // Sync content from props on mount and when switching to a different bullet
  useEffect(() => {
    // Always sync on first render
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      setContent(bullet.content);
      if (inputRef.current) {
        inputRef.current.innerHTML = bullet.content;
      }
      return;
    }
    
    // Only sync if this is a different bullet (not just an ID change from temp to real)
    const isSameBullet = prevIdRef.current === bullet.id || 
                         (prevIdRef.current.startsWith('temp-') && !bullet.id.startsWith('temp-'));
    prevIdRef.current = bullet.id;
    
    if (!isSameBullet) {
      setContent(bullet.content);
      if (inputRef.current) {
        inputRef.current.innerHTML = bullet.content;
      }
    }
  }, [bullet.id, bullet.content]);

  // Auto-focus newly created bullets (those with temp- IDs)
  useEffect(() => {
    if (bullet.id.startsWith('temp-') && inputRef.current) {
      inputRef.current.focus();
    }
  }, [bullet.id]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // Rich text formatting shortcuts
    if (e.metaKey || e.ctrlKey) {
      if (e.key === 'b') {
        e.preventDefault();
        formatText('bold');
        return;
      }
      if (e.key === 'i') {
        e.preventDefault();
        formatText('italic');
        return;
      }
      if (e.key === 'u') {
        e.preventDefault();
        formatText('underline');
        return;
      }
    }

    // Cmd/Ctrl + Backspace - delete entire bullet
    if (e.key === 'Backspace' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      const currentWrapper = inputRef.current?.closest('[data-bullet-id]');
      const prevWrapper = currentWrapper?.previousElementSibling;
      const prevInput = prevWrapper?.querySelector('[contenteditable="true"]') as HTMLElement;
      onDelete();
      if (prevInput) {
        requestAnimationFrame(() => prevInput.focus());
      }
      return;
    }
    
    // Don't create new bullet if tag or mention popover is open
    if (e.key === 'Enter' && !e.shiftKey && !showTagPopover && !showMentionPopover) {
      e.preventDefault();
      onAddBullet(bullet.type);
      // New bullet will auto-focus itself via useEffect (temp- ID detection)
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
    } else if (e.key === 'ArrowUp') {
      // Move to previous bullet
      const currentWrapper = inputRef.current?.closest('[data-bullet-id]');
      const prevWrapper = currentWrapper?.previousElementSibling;
      const prevInput = prevWrapper?.querySelector('[contenteditable="true"]') as HTMLElement;
      if (prevInput) {
        e.preventDefault();
        prevInput.focus();
        // Move cursor to end of previous bullet
        const range = document.createRange();
        const sel = window.getSelection();
        if (sel) {
          range.selectNodeContents(prevInput);
          range.collapse(false);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    } else if (e.key === 'ArrowDown') {
      // Move to next bullet
      const currentWrapper = inputRef.current?.closest('[data-bullet-id]');
      const nextWrapper = currentWrapper?.nextElementSibling;
      const nextInput = nextWrapper?.querySelector('[contenteditable="true"]') as HTMLElement;
      if (nextInput) {
        e.preventDefault();
        nextInput.focus();
        // Move cursor to start of next bullet
        const range = document.createRange();
        const sel = window.getSelection();
        if (sel) {
          range.selectNodeContents(nextInput);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }
  };

  const handleInput = () => {
    const html = inputRef.current?.innerHTML || '';
    const text = inputRef.current?.textContent || '';
    setContent(html);
    onUpdate({ content: html });

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

  const handleRowClick = (e: React.MouseEvent) => {
    // Focus the input if clicking on empty space in the row
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[contenteditable]') || target.closest('.tag-pill') || target.closest('.mention')) {
      return;
    }
    inputRef.current?.focus();
    // Move cursor to end
    const range = document.createRange();
    const sel = window.getSelection();
    if (inputRef.current && sel) {
      range.selectNodeContents(inputRef.current);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

  return (
    <div
      data-bullet-id={bullet.id}
      className={cn(
        'group flex items-center gap-1.5 py-0.5 px-1.5 rounded hover:bg-muted/50 cursor-text',
        bullet.checked && 'opacity-60'
      )}
      style={{ paddingLeft: `${bullet.indent * 20 + 6}px` }}
      onClick={handleRowClick}
    >
      {/* Drag handle */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
      </div>

      {/* Checkbox/Bullet */}
      <button
        onClick={toggleCheckbox}
        onDoubleClick={toggleType}
        className="flex-shrink-0"
        title="Click to toggle, double-click to change type"
      >
        {bullet.type === 'checkbox' ? (
          <div
            className={cn(
              'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-smooth',
              bullet.checked
                ? 'bg-primary border-primary'
                : 'border-muted-foreground/40 hover:border-primary'
            )}
          >
            {bullet.checked && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
          </div>
        ) : (
          <Circle className="h-1.5 w-1.5 fill-muted-foreground text-muted-foreground" />
        )}
      </button>

      {/* Content area */}
      <div className="flex-1 min-w-0 relative">
        {/* Floating Format Toolbar */}
        {showFormatToolbar && (
          <div
            ref={toolbarRef}
            className="absolute z-50 flex items-center gap-0.5 bg-popover border border-border rounded-lg shadow-lg p-1 animate-scale-in"
            style={{
              top: toolbarPosition.top,
              left: toolbarPosition.left,
              transform: 'translateX(-50%)',
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <button
              onClick={() => formatText('bold')}
              className="p-1.5 rounded hover:bg-accent transition-colors"
              title="Bold (⌘B)"
            >
              <Bold className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => formatText('italic')}
              className="p-1.5 rounded hover:bg-accent transition-colors"
              title="Italic (⌘I)"
            >
              <Italic className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => formatText('underline')}
              className="p-1.5 rounded hover:bg-accent transition-colors"
              title="Underline (⌘U)"
            >
              <Underline className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1">
          {/* Editable content */}
          <span
            ref={inputRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onMouseUp={handleMouseUp}
            className={cn(
              'outline-none text-foreground text-sm min-w-[50px]',
              bullet.checked && 'line-through text-muted-foreground'
            )}
            data-placeholder="Type something..."
          />

          {/* Mentions - inline after text */}
          {bullet.mentions.map((person) => (
            <span
              key={person.id}
              className="mention animate-scale-in text-xs"
            >
              @{person.name}
              <button
                onClick={() => handleRemoveMention(person.id)}
                className="ml-0.5 hover:text-primary/80"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}

          {/* Tags - inline after text */}
          {bullet.tags.map((tag) => (
            <span
              key={tag.id}
              className={cn(
                'tag-pill border animate-scale-in text-xs',
                tagColorClasses[tag.color]
              )}
            >
              #{tag.name}
              <button
                onClick={() => handleRemoveTag(tag.id)}
                className="ml-0.5 hover:text-foreground"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>

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
