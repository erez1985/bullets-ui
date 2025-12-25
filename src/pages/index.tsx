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

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim());
      setNewFolderName('');
      setShowNewFolderDialog(false);
      toast.success('Folder created');
    }
  };

  const handleCreateNote = () => {
    const note = createNote();
    toast.success('Note created');
  };

  const handleDeleteNote = () => {
    if (selectedNoteId) {
      deleteNote(selectedNoteId);
      toast.success('Note deleted');
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    deleteFolder(folderId);
    toast.success('Folder deleted');
  };

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
