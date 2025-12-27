import { useState } from 'react';
import { Folder, Tag } from '@/types';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Search, 
  FolderIcon,
  Trash2,
  MoreHorizontal,
  Tag as TagIcon,
  LogOut,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
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

// User avatar component with error handling for rate-limited images
function UserAvatar({ name, avatar }: { name?: string; avatar?: string | null }) {
  const [imgError, setImgError] = useState(false);
  
  if (avatar && !imgError) {
    return (
      <img
        src={avatar}
        alt={name || 'User'}
        className="w-6 h-6 rounded-full"
        onError={() => setImgError(true)}
      />
    );
  }
  
  return (
    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
      {name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
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
  const { user, logout } = useAuth();

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
    <aside className="w-56 h-screen flex flex-col bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="px-3 py-2 flex items-center justify-between border-b border-sidebar-border">
        <h1 className="font-semibold text-sidebar-foreground text-sm">Notes</h1>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <Settings className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Search */}
      <div className="px-2 py-1.5">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes..."
            className="pl-7 h-7 text-xs bg-sidebar-accent border-none focus-visible:ring-1 focus-visible:ring-sidebar-ring"
          />
        </div>
      </div>

      {/* Create Note Button */}
      <div className="px-2 pb-1.5">
        <Button
          onClick={onCreateNote}
          className="w-full justify-start gap-1.5 bg-primary hover:bg-primary/90 h-7 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          New Note
        </Button>
      </div>

      {/* Folders */}
      <div className="flex-1 overflow-y-auto px-1.5">
        <div className="space-y-0.5 py-1">
          {folders.map((folder) => (
            <div key={folder.id} className="group">
              <button
                onClick={() => {
                  onSelectFolder(folder.id);
                  onSelectTag(null);
                }}
                className={cn(
                  'w-full flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-smooth',
                  selectedFolderId === folder.id && !filterTag
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <span className="text-sm">{folder.icon || '📁'}</span>
                <span className="flex-1 text-left truncate">{folder.name}</span>
                
                {folder.id !== 'all' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button variant="ghost" size="icon" className="h-5 w-5">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem
                        onClick={() => onDeleteFolder(folder.id)}
                        className="text-destructive focus:text-destructive text-xs"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
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
            className="w-full flex items-center gap-1.5 px-2 py-1 rounded text-xs text-muted-foreground hover:bg-sidebar-accent/50 transition-smooth"
          >
            <FolderIcon className="h-3.5 w-3.5" />
            <span>Add Folder</span>
            <Plus className="h-3 w-3 ml-auto" />
          </button>
        </div>

        {/* Tags Section */}
        <div className="py-1 border-t border-sidebar-border mt-1">
          <button
            onClick={() => setIsTagsExpanded(!isTagsExpanded)}
            className="w-full flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-sidebar-foreground"
          >
            {isTagsExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            <TagIcon className="h-3 w-3" />
            <span>Tags</span>
          </button>

          {isTagsExpanded && (
            <div className="space-y-0.5 mt-0.5">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => {
                    onSelectTag(filterTag?.id === tag.id ? null : tag);
                  }}
                  className={cn(
                    'w-full flex items-center gap-1.5 px-2 py-0.5 rounded text-xs transition-smooth ml-1.5',
                    filterTag?.id === tag.id
                      ? 'bg-sidebar-accent font-medium'
                      : 'hover:bg-sidebar-accent/50'
                  )}
                >
                  <span
                    className={cn(
                      'tag-pill text-[10px]',
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

      {/* Footer - User Menu */}
      <div className="px-2 py-2 border-t border-sidebar-border">
        <div className="flex items-center gap-2">
          <UserAvatar name={user?.name} avatar={user?.avatar} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">
              {user?.name}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={logout}
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
