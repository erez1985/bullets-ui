import { useState, useCallback, useMemo } from 'react';
import { Note, Folder, Tag, Person, Bullet, TagColor } from '@/types';

const generateId = () => Math.random().toString(36).substring(2, 15);

const defaultTags: Tag[] = [
  { id: '1', name: 'work', color: 'blue', createdAt: new Date() },
  { id: '2', name: 'personal', color: 'green', createdAt: new Date() },
  { id: '3', name: 'urgent', color: 'red', createdAt: new Date() },
  { id: '4', name: 'ideas', color: 'purple', createdAt: new Date() },
  { id: '5', name: 'restaurants', color: 'orange', createdAt: new Date() },
];

const defaultPeople: Person[] = [
  { id: '1', name: 'John Smith', createdAt: new Date() },
  { id: '2', name: 'Sarah Connor', createdAt: new Date() },
  { id: '3', name: 'Alex Johnson', createdAt: new Date() },
];

const defaultFolders: Folder[] = [
  { id: 'all', name: 'All Notes', icon: '📝', parentId: null, isExpanded: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'work', name: 'Work', icon: '💼', parentId: null, isExpanded: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'personal', name: 'Personal', icon: '🏠', parentId: null, isExpanded: true, createdAt: new Date(), updatedAt: new Date() },
];

const defaultNotes: Note[] = [
  {
    id: '1',
    title: 'Project Planning',
    folderId: 'work',
    color: 'yellow',
    isPinned: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    bullets: [
      {
        id: 'b1',
        content: 'Review quarterly goals',
        type: 'checkbox',
        checked: true,
        tags: [defaultTags[0]],
        mentions: [defaultPeople[0]],
        indent: 0,
        noteId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'b2',
        content: 'Schedule team meeting',
        type: 'checkbox',
        checked: false,
        tags: [defaultTags[0], defaultTags[2]],
        mentions: [],
        indent: 0,
        noteId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'b3',
        content: 'Prepare presentation slides',
        type: 'bullet',
        checked: false,
        tags: [],
        mentions: [defaultPeople[1]],
        indent: 1,
        noteId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  },
  {
    id: '2',
    title: 'Favorite Restaurants',
    folderId: 'personal',
    color: 'green',
    isPinned: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    bullets: [
      {
        id: 'b4',
        content: 'The Italian Place - amazing pasta',
        type: 'bullet',
        checked: false,
        tags: [defaultTags[4]],
        mentions: [],
        indent: 0,
        noteId: '2',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'b5',
        content: 'Sushi Garden - great omakase',
        type: 'bullet',
        checked: false,
        tags: [defaultTags[4]],
        mentions: [],
        indent: 0,
        noteId: '2',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  },
  {
    id: '3',
    title: 'Ideas for the Weekend',
    folderId: 'personal',
    color: 'blue',
    isPinned: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    bullets: [
      {
        id: 'b6',
        content: 'Visit the new art museum',
        type: 'checkbox',
        checked: false,
        tags: [defaultTags[3]],
        mentions: [defaultPeople[2]],
        indent: 0,
        noteId: '3',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  },
];

export function useNotes() {
  const [folders, setFolders] = useState<Folder[]>(defaultFolders);
  const [notes, setNotes] = useState<Note[]>(defaultNotes);
  const [tags, setTags] = useState<Tag[]>(defaultTags);
  const [people, setPeople] = useState<Person[]>(defaultPeople);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>('all');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<Tag | null>(null);

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
        .map((b) => ({ ...b, noteTitle: note.title }))
    );
  }, [notes, filterTag]);

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedNoteId) || null,
    [notes, selectedNoteId]
  );

  // Create note
  const createNote = useCallback((folderId: string | null = null) => {
    const newNote: Note = {
      id: generateId(),
      title: 'Untitled Note',
      folderId: folderId || selectedFolderId === 'all' ? null : selectedFolderId,
      isPinned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      bullets: [
        {
          id: generateId(),
          content: '',
          type: 'bullet',
          checked: false,
          tags: [],
          mentions: [],
          indent: 0,
          noteId: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    };
    newNote.bullets[0].noteId = newNote.id;
    setNotes((prev) => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
    return newNote;
  }, [selectedFolderId]);

  // Update note
  const updateNote = useCallback((noteId: string, updates: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === noteId
          ? { ...note, ...updates, updatedAt: new Date() }
          : note
      )
    );
  }, []);

  // Delete note
  const deleteNote = useCallback((noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    if (selectedNoteId === noteId) {
      setSelectedNoteId(null);
    }
  }, [selectedNoteId]);

  // Toggle pin
  const togglePin = useCallback((noteId: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === noteId ? { ...note, isPinned: !note.isPinned } : note
      )
    );
  }, []);

  // Create folder
  const createFolder = useCallback((name: string, parentId: string | null = null) => {
    const newFolder: Folder = {
      id: generateId(),
      name,
      parentId,
      isExpanded: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setFolders((prev) => [...prev, newFolder]);
    return newFolder;
  }, []);

  // Update folder
  const updateFolder = useCallback((folderId: string, updates: Partial<Folder>) => {
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === folderId
          ? { ...folder, ...updates, updatedAt: new Date() }
          : folder
      )
    );
  }, []);

  // Delete folder
  const deleteFolder = useCallback((folderId: string) => {
    // Move notes to root
    setNotes((prev) =>
      prev.map((note) =>
        note.folderId === folderId ? { ...note, folderId: null } : note
      )
    );
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    if (selectedFolderId === folderId) {
      setSelectedFolderId('all');
    }
  }, [selectedFolderId]);

  // Add bullet to note
  const addBullet = useCallback(
    (noteId: string, afterBulletId?: string, type: 'checkbox' | 'bullet' = 'bullet') => {
      const newBullet: Bullet = {
        id: generateId(),
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

      setNotes((prev) =>
        prev.map((note) => {
          if (note.id !== noteId) return note;

          const bullets = [...note.bullets];
          if (afterBulletId) {
            const index = bullets.findIndex((b) => b.id === afterBulletId);
            if (index !== -1) {
              newBullet.indent = bullets[index].indent;
              bullets.splice(index + 1, 0, newBullet);
            } else {
              bullets.push(newBullet);
            }
          } else {
            bullets.push(newBullet);
          }

          return { ...note, bullets, updatedAt: new Date() };
        })
      );

      return newBullet;
    },
    []
  );

  // Update bullet
  const updateBullet = useCallback((noteId: string, bulletId: string, updates: Partial<Bullet>) => {
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
  }, []);

  // Delete bullet
  const deleteBullet = useCallback((noteId: string, bulletId: string) => {
    setNotes((prev) =>
      prev.map((note) => {
        if (note.id !== noteId) return note;
        const bullets = note.bullets.filter((b) => b.id !== bulletId);
        // Ensure at least one bullet remains
        if (bullets.length === 0) {
          bullets.push({
            id: generateId(),
            content: '',
            type: 'bullet',
            checked: false,
            tags: [],
            mentions: [],
            indent: 0,
            noteId,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        return { ...note, bullets, updatedAt: new Date() };
      })
    );
  }, []);

  // Create tag
  const createTag = useCallback((name: string, color: TagColor) => {
    const newTag: Tag = {
      id: generateId(),
      name: name.toLowerCase().replace(/\s+/g, '-'),
      color,
      createdAt: new Date(),
    };
    setTags((prev) => [...prev, newTag]);
    return newTag;
  }, []);

  // Create person
  const createPerson = useCallback((name: string) => {
    const newPerson: Person = {
      id: generateId(),
      name,
      createdAt: new Date(),
    };
    setPeople((prev) => [...prev, newPerson]);
    return newPerson;
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
