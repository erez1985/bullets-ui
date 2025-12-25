export type TagColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'gray';

export interface Tag {
  id: string;
  name: string;
  color: TagColor;
  createdAt: Date;
}

export interface Person {
  id: string;
  name: string;
  avatar?: string;
  createdAt: Date;
}

export interface Bullet {
  id: string;
  content: string;
  type: 'checkbox' | 'bullet';
  checked: boolean;
  tags: Tag[];
  mentions: Person[];
  indent: number;
  noteId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  title: string;
  bullets: Bullet[];
  folderId: string | null;
  color?: 'yellow' | 'green' | 'blue' | 'pink' | 'purple';
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Folder {
  id: string;
  name: string;
  icon?: string;
  parentId: string | null;
  isExpanded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppState {
  folders: Folder[];
  notes: Note[];
  tags: Tag[];
  people: Person[];
  selectedFolderId: string | null;
  selectedNoteId: string | null;
  searchQuery: string;
  filterTag: Tag | null;
}
