import { useState } from 'react';
import { useNotes } from '@/hooks/useNotes';
import { Sidebar } from '@/components/Sidebar';
import { NotesList } from '@/components/NotesList';
import { NoteEditor } from '@/components/NoteEditor';
import { EmptyState } from '@/components/EmptyState';
import { FilteredBulletsView } from '@/components/FilteredBulletsView';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const {
    folders,
    notes,
    tags,
    people,
    selectedFolderId,
    selectedNoteId,
    selectedNote,
    searchQuery,
    filterTag,
    filteredBullets,
    isLoading,
    error,
    setSelectedFolderId,
    setSelectedNoteId,
    setSearchQuery,
    setFilterTag,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    createFolder,
    deleteFolder,
    addBullet,
    updateBullet,
    deleteBullet,
    createTag,
    createPerson,
  } = useNotes();

  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      try {
        await createFolder(newFolderName.trim());
        setNewFolderName('');
        setShowNewFolderDialog(false);
        toast.success('Folder created');
      } catch {
        toast.error('Failed to create folder');
      }
    }
  };

  const handleCreateNote = async () => {
    try {
      await createNote();
      toast.success('Note created');
    } catch {
      toast.error('Failed to create note');
    }
  };

  const handleDeleteNote = async () => {
    if (selectedNoteId) {
      try {
        await deleteNote(selectedNoteId);
        toast.success('Note deleted');
      } catch {
        toast.error('Failed to delete note');
      }
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      await deleteFolder(folderId);
      toast.success('Folder deleted');
    } catch {
      toast.error('Failed to delete folder');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading notes...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 max-w-md text-center px-4">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-xl font-semibold text-foreground">Connection Error</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-xs text-muted-foreground">
            Make sure the backend server is running at{' '}
            <code className="bg-muted px-1 py-0.5 rounded">http://localhost:3001</code>
          </p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* Sidebar */}
        <Sidebar
          folders={folders}
          tags={tags}
          selectedFolderId={selectedFolderId}
          filterTag={filterTag}
          searchQuery={searchQuery}
          onSelectFolder={setSelectedFolderId}
          onSelectTag={setFilterTag}
          onSearchChange={setSearchQuery}
          onCreateFolder={() => setShowNewFolderDialog(true)}
          onDeleteFolder={handleDeleteFolder}
          onCreateNote={handleCreateNote}
        />

        {/* Notes List */}
        <NotesList
          notes={notes}
          selectedNoteId={selectedNoteId}
          filterTag={filterTag}
          onSelectNote={setSelectedNoteId}
          onDeleteNote={deleteNote}
          onTogglePin={togglePin}
        />

        {/* Main Content */}
        {filterTag ? (
          <FilteredBulletsView
            tag={filterTag}
            bullets={filteredBullets}
            onClearFilter={() => setFilterTag(null)}
            onSelectNote={setSelectedNoteId}
          />
        ) : selectedNote ? (
          <NoteEditor
            note={selectedNote}
            tags={tags}
            people={people}
            onUpdateNote={(updates) => updateNote(selectedNote.id, updates)}
            onDeleteNote={handleDeleteNote}
            onTogglePin={() => togglePin(selectedNote.id)}
            onAddBullet={(afterBulletId, type) =>
              addBullet(selectedNote.id, afterBulletId, type)
            }
            onUpdateBullet={(bulletId, updates) =>
              updateBullet(selectedNote.id, bulletId, updates)
            }
            onDeleteBullet={(bulletId) =>
              deleteBullet(selectedNote.id, bulletId)
            }
            onCreateTag={createTag}
            onCreatePerson={createPerson}
          />
        ) : (
          <EmptyState onCreateNote={handleCreateNote} />
        )}
      </div>

      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateFolder();
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewFolderDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster position="bottom-right" />
    </>
  );
};

export default Index;
