import { useState, useEffect, useCallback } from 'react';
import { useNotes } from '@/hooks/useNotes';
import { Sidebar } from '@/components/Sidebar';
import { NotesList } from '@/components/NotesList';
import { NoteEditor } from '@/components/NoteEditor';
import { EmptyState } from '@/components/EmptyState';
import { FilteredBulletsView } from '@/components/FilteredBulletsView';
import { FilteredPeopleView } from '@/components/FilteredPeopleView';
import { SearchModal } from '@/components/SearchModal';
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
    allNotes,
    tags,
    people,
    selectedFolderId,
    selectedNoteId,
    selectedNote,
    searchQuery,
    filterTag,
    filterPerson,
    filteredBullets,
    filteredBulletsByPerson,
    isLoading,
    error,
    setSelectedFolderId,
    setSelectedNoteId,
    setSearchQuery,
    setFilterTag,
    setFilterPerson,
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
    deleteTag,
    createPerson,
    deletePerson,
  } = useNotes();

  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);

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

  // Global keyboard shortcuts
  const handleGlobalKeyDown = useCallback((e: KeyboardEvent) => {
    // Cmd/Ctrl + K - Create new note
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      createNote().then(() => {
        toast.success('Note created');
      }).catch(() => {
        toast.error('Failed to create note');
      });
    }
    // Cmd/Ctrl + Shift + F - Open search modal
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'f') {
      e.preventDefault();
      setShowSearchModal(true);
    }
    // Escape - Exit filter mode
    if (e.key === 'Escape' && !showSearchModal) {
      if (filterTag) {
        setFilterTag(null);
      }
      if (filterPerson) {
        setFilterPerson(null);
      }
    }
  }, [createNote, filterTag, filterPerson, showSearchModal, setFilterTag, setFilterPerson]);

  useEffect(() => {
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [handleGlobalKeyDown]);

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
          people={people}
          selectedFolderId={selectedFolderId}
          filterTag={filterTag}
          filterPerson={filterPerson}
          searchQuery={searchQuery}
          onSelectFolder={setSelectedFolderId}
          onSelectTag={setFilterTag}
          onSelectPerson={setFilterPerson}
          onSearchChange={setSearchQuery}
          onCreateFolder={() => setShowNewFolderDialog(true)}
          onDeleteFolder={handleDeleteFolder}
          onDeleteTag={deleteTag}
          onDeletePerson={deletePerson}
          onCreateNote={handleCreateNote}
          onMoveNoteToFolder={(noteId, folderId) => updateNote(noteId, { folderId })}
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
            onToggleBullet={(noteId, bulletId, checked) => 
              updateBullet(noteId, bulletId, { checked })
            }
          />
        ) : filterPerson ? (
          <FilteredPeopleView
            person={filterPerson}
            bullets={filteredBulletsByPerson}
            onClearFilter={() => setFilterPerson(null)}
            onSelectNote={setSelectedNoteId}
            onToggleBullet={(noteId, bulletId, checked) => 
              updateBullet(noteId, bulletId, { checked })
            }
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

      {/* Search Modal */}
      <SearchModal
        isOpen={showSearchModal}
        notes={allNotes}
        onClose={() => setShowSearchModal(false)}
        onSelectNote={(noteId) => {
          setSelectedNoteId(noteId);
          setFilterTag(null);
          setFilterPerson(null);
        }}
      />

      <Toaster position="bottom-right" />
    </>
  );
};

export default Index;
