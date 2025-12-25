import { useState } from 'react';
import { Folder, Tag } from '@/types';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Search, 
  FolderIcon,
  Settings,
  Trash2,
  MoreHorizontal,
  Tag as TagIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SidebarProps {
  folders: Folder[];
  tags: Tag[];
  selectedFolderId: string | null;
  filterTag: Tag | null;
  searchQuery: string;
  onSelectFolder: (id: string) => void;
  onSelectTag: (tag: Tag | null) => void;
  onSearchChange: (query: string) => void;
  onCreateFolder: () => void;
  onDeleteFolder: (id: string) => void;
  onCreateNote: () => void;
}

export function Sidebar({
  folders,
  tags,
  selectedFolderId,
  filterTag,
  searchQuery,
  onSelectFolder,
  onSelectTag,
  onSearchChange,
  onCreateFolder,
  onDeleteFolder,
  onCreateNote,
}: SidebarProps) {
  const [isTagsExpanded, setIsTagsExpanded] = useState(true);

  const tagColorClasses: Record<string, string> = {
    red: 'bg-tag-red/20 text-tag-red',
    orange: 'bg-tag-orange/20 text-tag-orange',
    yellow: 'bg-tag-yellow/20 text-tag-yellow',
    green: 'bg-tag-green/20 text-tag-green',
    blue: 'bg-tag-blue/20 text-tag-blue',
    purple: 'bg-tag-purple/20 text-tag-purple',
    pink: 'bg-tag-pink/20 text-tag-pink',
    gray: 'bg-tag-gray/20 text-tag-gray',
  };

  return (
    <aside className="w-64 h-screen flex flex-col bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
        <h1 className="font-semibold text-sidebar-foreground text-lg">Notes</h1>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes..."
            className="pl-9 h-9 bg-sidebar-accent border-none focus-visible:ring-1 focus-visible:ring-sidebar-ring"
          />
        </div>
      </div>

      {/* Create Note Button */}
      <div className="px-3 pb-2">
        <Button
          onClick={onCreateNote}
          className="w-full justify-start gap-2 bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Note
        </Button>
      </div>

      {/* Folders */}
      <div className="flex-1 overflow-y-auto px-2">
        <div className="space-y-1 py-2">
          {folders.map((folder) => (
            <div key={folder.id} className="group">
              <button
                onClick={() => {
                  onSelectFolder(folder.id);
                  onSelectTag(null);
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-smooth',
                  selectedFolderId === folder.id && !filterTag
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <span className="text-base">{folder.icon || '📁'}</span>
                <span className="flex-1 text-left truncate">{folder.name}</span>
                
                {folder.id !== 'all' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={() => onDeleteFolder(folder.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </button>
            </div>
          ))}

          {/* Add Folder */}
          <button
            onClick={onCreateFolder}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent/50 transition-smooth"
          >
            <FolderIcon className="h-4 w-4" />
            <span>Add Folder</span>
            <Plus className="h-3.5 w-3.5 ml-auto" />
          </button>
        </div>

        {/* Tags Section */}
        <div className="py-2 border-t border-sidebar-border mt-2">
          <button
            onClick={() => setIsTagsExpanded(!isTagsExpanded)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-sidebar-foreground"
          >
            {isTagsExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <TagIcon className="h-4 w-4" />
            <span>Tags</span>
          </button>

          {isTagsExpanded && (
            <div className="space-y-1 mt-1">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => {
                    onSelectTag(filterTag?.id === tag.id ? null : tag);
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-smooth ml-2',
                    filterTag?.id === tag.id
                      ? 'bg-sidebar-accent font-medium'
                      : 'hover:bg-sidebar-accent/50'
                  )}
                >
                  <span
                    className={cn(
                      'tag-pill text-xs',
                      tagColorClasses[tag.color]
                    )}
                  >
                    #{tag.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground text-center">
          {filterTag ? `Filtering by #${filterTag.name}` : 'All notes'}
        </p>
      </div>
    </aside>
  );
}
