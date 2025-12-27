import { useState, useCallback, useMemo, useEffect } from 'react';
import { Note, Folder, Tag, Person, Bullet, TagColor } from '@/types';
import { notesApi, foldersApi, tagsApi, peopleApi } from '@/lib/api';

// Helper to transform API response to frontend types
const transformNote = (apiNote: any): Note => ({
  id: apiNote._id || apiNote.id,
  title: apiNote.title,
  folderId: apiNote.folderId?._id || apiNote.folderId || null,
  color: apiNote.color,
  isPinned: apiNote.isPinned,
  createdAt: new Date(apiNote.createdAt),
  updatedAt: new Date(apiNote.updatedAt),
  bullets: (apiNote.bullets || []).map((b: any) => ({
    id: b._id || b.id,
    content: b.content || '',
    type: b.type || 'bullet',
    checked: b.checked || false,
    tags: (b.tags || []).map((t: any) => ({
      id: t._id || t.id,
      name: t.name,
      color: t.color,
      createdAt: new Date(t.createdAt),
    })),
    mentions: (b.mentions || []).map((p: any) => ({
      id: p._id || p.id,
      name: p.name,
      avatar: p.avatar,
      createdAt: new Date(p.createdAt),
    })),
    indent: b.indent || 0,
    noteId: apiNote._id || apiNote.id,
    createdAt: new Date(b.createdAt),
    updatedAt: new Date(b.updatedAt),
  })),
});

const transformFolder = (apiFolder: any): Folder => ({
  id: apiFolder._id || apiFolder.id,
  name: apiFolder.name,
  icon: apiFolder.icon,
  parentId: apiFolder.parentId?._id || apiFolder.parentId || null,
  isExpanded: apiFolder.isExpanded ?? true,
  createdAt: new Date(apiFolder.createdAt),
  updatedAt: new Date(apiFolder.updatedAt),
});

const transformTag = (apiTag: any): Tag => ({
  id: apiTag._id || apiTag.id,
  name: apiTag.name,
  color: apiTag.color,
  createdAt: new Date(apiTag.createdAt),
});

const transformPerson = (apiPerson: any): Person => ({
  id: apiPerson._id || apiPerson.id,
  name: apiPerson.name,
  avatar: apiPerson.avatar,
  createdAt: new Date(apiPerson.createdAt),
});

// Default "All Notes" folder for UI
const allNotesFolder: Folder = {
  id: 'all',
  name: 'All Notes',
  icon: '📝',
  parentId: null,
  isExpanded: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export function useNotes() {
  const [folders, setFolders] = useState<Folder[]>([allNotesFolder]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>('all');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<Tag | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [notesData, foldersData, tagsData, peopleData] = await Promise.all([
          notesApi.getAll(),
          foldersApi.getAll(),
          tagsApi.getAll(),
          peopleApi.getAll(),
        ]);

        setNotes(notesData.map(transformNote));
        setFolders([allNotesFolder, ...foldersData.map(transformFolder)]);
        setTags(tagsData.map(transformTag));
        setPeople(peopleData.map(transformPerson));

        // Select first note if available
        if (notesData.length > 0) {
          setSelectedNoteId(notesData[0]._id || notesData[0].id);
        }
      } catch (err: any) {
        console.error('Failed to fetch data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get notes for selected folder
  const filteredNotes = useMemo(() => {
    let result = notes;

    // Filter by folder
    if (selectedFolderId && selectedFolderId !== 'all') {
      result = result.filter((note) => note.folderId === selectedFolderId);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.bullets.some((b) => b.content.toLowerCase().includes(query))
      );
    }

    // Filter by tag
    if (filterTag) {
      result = result.filter((note) =>
        note.bullets.some((b) => b.tags.some((t) => t.id === filterTag.id))
      );
    }

    // Sort: pinned first, then by updated date
    return result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
  }, [notes, selectedFolderId, searchQuery, filterTag]);

  // Get bullets matching filter tag (for tag view)
  const filteredBullets = useMemo(() => {
    if (!filterTag) return [];
    return notes.flatMap((note) =>
      note.bullets
        .filter((b) => b.tags.some((t) => t.id === filterTag.id))
        .map((b) => ({ ...b, noteId: note.id, noteTitle: note.title || 'Untitled' }))
    );
  }, [notes, filterTag]);

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedNoteId) || null,
    [notes, selectedNoteId]
  );

  // Create note
  const createNote = useCallback(async (folderId: string | null = null) => {
    try {
      const targetFolderId = folderId || (selectedFolderId === 'all' ? null : selectedFolderId);
      const apiNote = await notesApi.create({
        title: '',
        folderId: targetFolderId,
      });
      const newNote = transformNote(apiNote);
      setNotes((prev) => [newNote, ...prev]);
      setSelectedNoteId(newNote.id);
      return newNote;
    } catch (err: any) {
      console.error('Failed to create note:', err);
      throw err;
    }
  }, [selectedFolderId]);

  // Update note
  const updateNote = useCallback(async (noteId: string, updates: Partial<Note>) => {
    try {
      // Optimistic update
      setNotes((prev) =>
        prev.map((note) =>
          note.id === noteId
            ? { ...note, ...updates, updatedAt: new Date() }
            : note
        )
      );
      
      // API call
      await notesApi.update(noteId, updates);
    } catch (err: any) {
      console.error('Failed to update note:', err);
      // Revert on error - refetch
      const apiNote = await notesApi.getOne(noteId);
      setNotes((prev) =>
        prev.map((note) => (note.id === noteId ? transformNote(apiNote) : note))
      );
    }
  }, []);

  // Delete note
  const deleteNote = useCallback(async (noteId: string) => {
    try {
      await notesApi.delete(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      if (selectedNoteId === noteId) {
        setSelectedNoteId(null);
      }
    } catch (err: any) {
      console.error('Failed to delete note:', err);
    }
  }, [selectedNoteId]);

  // Toggle pin
  const togglePin = useCallback(async (noteId: string) => {
    try {
      const apiNote = await notesApi.togglePin(noteId);
      const updatedNote = transformNote(apiNote);
      setNotes((prev) =>
        prev.map((note) => (note.id === noteId ? updatedNote : note))
      );
    } catch (err: any) {
      console.error('Failed to toggle pin:', err);
    }
  }, []);

  // Create folder
  const createFolder = useCallback(async (name: string, parentId: string | null = null) => {
    try {
      const apiFolder = await foldersApi.create({ name, parentId: parentId || undefined });
      const newFolder = transformFolder(apiFolder);
      setFolders((prev) => [...prev, newFolder]);
      return newFolder;
    } catch (err: any) {
      console.error('Failed to create folder:', err);
      throw err;
    }
  }, []);

  // Update folder
  const updateFolder = useCallback(async (folderId: string, updates: Partial<Folder>) => {
    try {
      await foldersApi.update(folderId, updates);
      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === folderId
            ? { ...folder, ...updates, updatedAt: new Date() }
            : folder
        )
      );
    } catch (err: any) {
      console.error('Failed to update folder:', err);
    }
  }, []);

  // Delete folder
  const deleteFolder = useCallback(async (folderId: string) => {
    try {
      await foldersApi.delete(folderId);
      // Move notes to root locally
      setNotes((prev) =>
        prev.map((note) =>
          note.folderId === folderId ? { ...note, folderId: null } : note
        )
      );
      setFolders((prev) => prev.filter((f) => f.id !== folderId));
      if (selectedFolderId === folderId) {
        setSelectedFolderId('all');
      }
    } catch (err: any) {
      console.error('Failed to delete folder:', err);
    }
  }, [selectedFolderId]);

  // Add bullet to note
  const addBullet = useCallback(
    async (noteId: string, afterBulletId?: string, type: 'checkbox' | 'bullet' = 'bullet') => {
      // Create optimistic bullet with temporary ID
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const optimisticBullet: Bullet = {
        id: tempId,
        content: '',
        type,
        checked: false,
        tags: [],
        mentions: [],
        indent: 0,
        noteId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Optimistically add bullet to UI immediately
      setNotes((prev) =>
        prev.map((note) => {
          if (note.id !== noteId) return note;
          
          const bullets = [...note.bullets];
          if (afterBulletId) {
            const afterIndex = bullets.findIndex((b) => b.id === afterBulletId);
            if (afterIndex !== -1) {
              // Copy indent from previous bullet
              optimisticBullet.indent = bullets[afterIndex].indent;
              bullets.splice(afterIndex + 1, 0, optimisticBullet);
            } else {
              bullets.push(optimisticBullet);
            }
          } else {
            bullets.push(optimisticBullet);
          }
          
          return { ...note, bullets, updatedAt: new Date() };
        })
      );

      // Make API call in background - don't await, just fire and update ID when done
      notesApi.addBullet(noteId, { afterBulletId, type })
        .then((apiNote) => {
          const updatedNote = transformNote(apiNote);
          // Find the new bullet from server response
          const newBullet = updatedNote.bullets.find((b) => 
            b.content === '' && !b.id.startsWith('temp-')
          ) || updatedNote.bullets[updatedNote.bullets.length - 1];
          
          // Only update the temp ID to real ID, preserve all other user changes
          setNotes((prev) =>
            prev.map((note) => {
              if (note.id !== noteId) return note;
              return {
                ...note,
                bullets: note.bullets.map((b) => 
                  b.id === tempId ? { ...b, id: newBullet.id } : b
                ),
              };
            })
          );
        })
        .catch((err) => {
          console.error('Failed to add bullet:', err);
          // Remove optimistic bullet on error
          setNotes((prev) =>
            prev.map((note) => {
              if (note.id !== noteId) return note;
              return {
                ...note,
                bullets: note.bullets.filter((b) => b.id !== tempId),
              };
            })
          );
        });

      return optimisticBullet;
    },
    []
  );

  // Update bullet
  const updateBullet = useCallback(async (noteId: string, bulletId: string, updates: Partial<Bullet>) => {
    try {
      // Optimistic update for responsiveness
      setNotes((prev) =>
        prev.map((note) => {
          if (note.id !== noteId) return note;
          return {
            ...note,
            bullets: note.bullets.map((b) =>
              b.id === bulletId ? { ...b, ...updates, updatedAt: new Date() } : b
            ),
            updatedAt: new Date(),
          };
        })
      );

      // Prepare update data - convert tags/mentions to IDs for API
      const apiUpdates: any = { ...updates };
      if (updates.tags) {
        apiUpdates.tags = updates.tags.map((t) => t.id);
      }
      if (updates.mentions) {
        apiUpdates.mentions = updates.mentions.map((p) => p.id);
      }

      await notesApi.updateBullet(noteId, bulletId, apiUpdates);
    } catch (err: any) {
      console.error('Failed to update bullet:', err);
    }
  }, []);

  // Delete bullet
  const deleteBullet = useCallback(async (noteId: string, bulletId: string) => {
    // Store the bullet for potential restoration on error
    let deletedBullet: Bullet | undefined;
    let deletedIndex: number = -1;

    // Optimistically remove bullet immediately
    setNotes((prev) =>
      prev.map((note) => {
        if (note.id !== noteId) return note;
        deletedIndex = note.bullets.findIndex((b) => b.id === bulletId);
        deletedBullet = note.bullets[deletedIndex];
        return {
          ...note,
          bullets: note.bullets.filter((b) => b.id !== bulletId),
          updatedAt: new Date(),
        };
      })
    );

    // Don't send API request for temp bullets (not yet saved)
    if (bulletId.startsWith('temp-')) {
      return;
    }

    // Make API call in background
    notesApi.deleteBullet(noteId, bulletId).catch((err) => {
      console.error('Failed to delete bullet:', err);
      // Restore the bullet on error
      if (deletedBullet && deletedIndex !== -1) {
        setNotes((prev) =>
          prev.map((note) => {
            if (note.id !== noteId) return note;
            const bullets = [...note.bullets];
            bullets.splice(deletedIndex, 0, deletedBullet!);
            return { ...note, bullets };
          })
        );
      }
    });
  }, []);

  // Create tag
  const createTag = useCallback(async (name: string, color: TagColor) => {
    try {
      const apiTag = await tagsApi.create({ name, color });
      const newTag = transformTag(apiTag);
      setTags((prev) => [...prev, newTag]);
      return newTag;
    } catch (err: any) {
      console.error('Failed to create tag:', err);
      throw err;
    }
  }, []);

  // Create person
  const createPerson = useCallback(async (name: string) => {
    try {
      const apiPerson = await peopleApi.create({ name });
      const newPerson = transformPerson(apiPerson);
      setPeople((prev) => [...prev, newPerson]);
      return newPerson;
    } catch (err: any) {
      console.error('Failed to create person:', err);
      throw err;
    }
  }, []);

  return {
    // State
    folders,
    notes: filteredNotes,
    allNotes: notes,
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

    // Actions
    setSelectedFolderId,
    setSelectedNoteId,
    setSearchQuery,
    setFilterTag,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    createFolder,
    updateFolder,
    deleteFolder,
    addBullet,
    updateBullet,
    deleteBullet,
    createTag,
    createPerson,
  };
}
