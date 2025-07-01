import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Note } from "@/types/Note";

// API functions
const api = {
  // Get all notes
  getAllNotes: async (): Promise<Note[]> => {
    const response = await fetch("/api/notes");
    if (!response.ok) {
      throw new Error("Failed to fetch notes");
    }
    const notes = await response.json();
    // Convert date strings back to Date objects
    return notes.map((note: any) => ({
      ...note,
      createdDate: new Date(note.createdDate),
      modifiedDate: new Date(note.modifiedDate),
    }));
  },

  // Get a specific note
  getNote: async (id: string): Promise<Note> => {
    const response = await fetch(`/api/notes/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch note");
    }
    const note = await response.json();
    return {
      ...note,
      createdDate: new Date(note.createdDate),
      modifiedDate: new Date(note.modifiedDate),
    };
  },

  // Save a note (create or update)
  saveNote: async (
    note: Note
  ): Promise<{ success: boolean; message: string; note: Note }> => {
    const response = await fetch("/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(note),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to save note");
    }

    return response.json();
  },

  // Update a note
  updateNote: async (
    note: Note
  ): Promise<{ success: boolean; message: string; note: Note }> => {
    const response = await fetch(`/api/notes/${note.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(note),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update note");
    }

    return response.json();
  },

  // Delete a note
  deleteNote: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`/api/notes/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete note");
    }

    return response.json();
  },
};

// React Query hooks
export function useNotes() {
  return useQuery({
    queryKey: ["notes"],
    queryFn: api.getAllNotes,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: "always", // Always refetch when component mounts
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 1000,
  });
}

export function useNote(id: string) {
  return useQuery({
    queryKey: ["note", id],
    queryFn: () => api.getNote(id),
    enabled: !!id,
  });
}

export function useSaveNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.saveNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.updateNote,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["note", data.note.id] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}
