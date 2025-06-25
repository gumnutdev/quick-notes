import { NextRequest, NextResponse } from "next/server";
import { noteOperations } from "@/lib/database";
import { Note } from "@/types/Note";

// GET /api/notes - Get all notes
export async function GET() {
  try {
    console.log("Fetching all notes...");
    const notes = await noteOperations.getAllNotes();
    console.log("Retrieved notes:", notes.length);
    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

// POST /api/notes - Create or update a note
export async function POST(request: NextRequest) {
  try {
    const note: Note = await request.json();

    // Validate required fields
    if (!note.id || !note.title) {
      return NextResponse.json(
        { error: "Note ID and title are required" },
        { status: 400 }
      );
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
      message: "Note saved successfully",
      note,
    });
  } catch (error) {
    console.error("Error saving note:", error);
    return NextResponse.json({ error: "Failed to save note" }, { status: 500 });
  }
}
