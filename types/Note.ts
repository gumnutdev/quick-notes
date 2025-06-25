
export interface Note {
  id: string;
  title: string;
  content: string;
  createdDate: Date;
  modifiedDate: Date;
  mood: number; // 1-10 scale
  priority: 'low' | 'medium' | 'high';
  category: string;
  status: 'draft' | 'in-progress' | 'complete';
  linkedNotes: string[]; // Array of note IDs
}

export interface NoteLink {
  id: string;
  title: string;
}
