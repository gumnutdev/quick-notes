import { NextRequest, NextResponse } from "next/server";
import { noteOperations } from "@/lib/database";
import { Note } from "@/types/Note";

// GET /api/notes/[id] - Get a specific note
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("Fetching note by ID:", id);
    const note = await noteOperations.getNoteById(id);
    console.log("Retrieved note:", note ? "Found" : "Not found");

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error("Error fetching note:", error);
    return NextResponse.json(
      { error: "Failed to fetch note" },
      { status: 500 }
    );
  }
}

// PUT /api/notes/[id] - Update a specific note
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const note: Note = await request.json();

    // Ensure the ID matches the URL parameter
    if (note.id !== id) {
      return NextResponse.json({ error: "Note ID mismatch" }, { status: 400 });
    }

    // Ensure dates are Date objects
    if (typeof note.createdDate === "string") {
      note.createdDate = new Date(note.createdDate);
    }
    if (typeof note.modifiedDate === "string") {
      note.modifiedDate = new Date(note.modifiedDate);
    }

    noteOperations.saveNote(note);

    return NextResponse.json({
      success: true,
      message: "Note updated successfully",
      note,
    });
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}

// DELETE /api/notes/[id] - Delete a specific note
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if note exists
    const existingNote = noteOperations.getNoteById(id);
    if (!existingNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    noteOperations.deleteNote(id);

    return NextResponse.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
