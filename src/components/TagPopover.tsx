import { useState, useEffect, useRef } from 'react';
import { Tag, TagColor } from '@/types';
import { cn } from '@/lib/utils';
import { Plus, Check } from 'lucide-react';

interface TagPopoverProps {
  tags: Tag[];
  searchQuery: string;
  onSelect: (tag: Tag) => void;
  onCreate: (name: string, color: TagColor) => Tag;
  onClose: () => void;
}

const tagColors: { color: TagColor; label: string; className: string }[] = [
  { color: 'red', label: 'Red', className: 'bg-tag-red' },
  { color: 'orange', label: 'Orange', className: 'bg-tag-orange' },
  { color: 'yellow', label: 'Yellow', className: 'bg-tag-yellow' },
  { color: 'green', label: 'Green', className: 'bg-tag-green' },
  { color: 'blue', label: 'Blue', className: 'bg-tag-blue' },
  { color: 'purple', label: 'Purple', className: 'bg-tag-purple' },
  { color: 'pink', label: 'Pink', className: 'bg-tag-pink' },
  { color: 'gray', label: 'Gray', className: 'bg-tag-gray' },
];

export function TagPopover({
  tags,
  searchQuery,
  onSelect,
  onCreate,
  onClose,
}: TagPopoverProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState<TagColor>('blue');
  const popoverRef = useRef<HTMLDivElement>(null);

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showCreateOption =
    searchQuery.length > 0 &&
    !filteredTags.some((t) => t.name.toLowerCase() === searchQuery.toLowerCase());

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
          Math.min(prev + 1, filteredTags.length - (showCreateOption ? 0 : 1))
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (showColorPicker) {
          const newTag = onCreate(searchQuery, selectedColor);
          onSelect(newTag);
        } else if (selectedIndex === filteredTags.length && showCreateOption) {
          setShowColorPicker(true);
        } else if (filteredTags[selectedIndex]) {
          onSelect(filteredTags[selectedIndex]);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [filteredTags, selectedIndex, showCreateOption, onClose, onSelect, onCreate, searchQuery, selectedColor, showColorPicker]);

  const handleCreateWithColor = (color: TagColor) => {
    const newTag = onCreate(searchQuery, color);
    onSelect(newTag);
  };

  return (
    <div
      ref={popoverRef}
      className="absolute left-0 top-full mt-1 z-50 w-56 bg-popover border border-border rounded-lg shadow-soft-lg animate-slide-down overflow-hidden"
    >
      {showColorPicker ? (
        <div className="p-2">
          <p className="text-xs text-muted-foreground mb-2 px-2">
            Choose color for "#{searchQuery}"
          </p>
          <div className="grid grid-cols-4 gap-1">
            {tagColors.map(({ color, label, className }) => (
              <button
                key={color}
                onClick={() => handleCreateWithColor(color)}
                className={cn(
                  'w-full aspect-square rounded-md transition-smooth',
                  className,
                  selectedColor === color && 'ring-2 ring-ring ring-offset-2'
                )}
                title={label}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="py-1 max-h-48 overflow-y-auto">
          {filteredTags.length === 0 && !showCreateOption ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">No tags found</p>
          ) : (
            <>
              {filteredTags.map((tag, index) => (
                <button
                  key={tag.id}
                  onClick={() => onSelect(tag)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-smooth',
                    selectedIndex === index
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  <span
                    className={cn(
                      'w-3 h-3 rounded-full',
                      `bg-tag-${tag.color}`
                    )}
                  />
                  <span>#{tag.name}</span>
                </button>
              ))}

              {showCreateOption && (
                <button
                  onClick={() => setShowColorPicker(true)}
                  onMouseEnter={() => setSelectedIndex(filteredTags.length)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-smooth border-t border-border',
                    selectedIndex === filteredTags.length
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  <Plus className="h-4 w-4" />
                  <span>Create "#{searchQuery}"</span>
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
