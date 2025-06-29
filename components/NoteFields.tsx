import { format } from "date-fns";
import { Calendar as CalendarIcon, Link } from "lucide-react";
import { GumnutData, GumnutText } from "@gumnutdev/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NoteLink } from "@/types/Note";

interface CalendarProps {
  createdDate: Date;
  modifiedDate: Date;
}

export const Calendar = ({ createdDate, modifiedDate }: CalendarProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-300">Dates</Label>
      <div className="space-y-2 text-sm">
        <div className="flex items-center space-x-2 text-slate-400">
          <CalendarIcon className="w-4 h-4" />
          <span>Created: {format(new Date(createdDate), "MMM dd, yyyy")}</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-400">
          <CalendarIcon className="w-4 h-4" />
          <span>
            Modified: {format(new Date(modifiedDate), "MMM dd, yyyy")}
          </span>
        </div>
      </div>
    </div>
  );
};

interface MoodProps {
  scope: any;
  name: string;
  value: number;
  onChange: (value: number) => void;
}

const moodEmojis = ["😢", "😟", "😐", "🙂", "😊", "😃", "😄", "😆", "🤩", "🥳"];

export const Mood = ({ scope, name, value, onChange }: MoodProps) => {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-slate-300">Mood</Label>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-2xl">
            {moodEmojis[scope.doc?.root().value("mood")?.contents() - 1]}
          </span>
          <span className="text-sm text-slate-400">
            {scope.doc?.root().value("mood")?.contents()}/10
          </span>
        </div>
        <GumnutData
          control={scope.control}
          name={name}
          render={({ field }) => (
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={field.value}
              onChange={(e) => {
                field.onChange(e);
                onChange(parseFloat(e.target.value));
              }}
              className="w-full"
            />
          )}
        />
      </div>
    </div>
  );
};

interface PriorityProps {
  scope: any;
  name: string;
  value: "low" | "medium" | "high";
  onChange: (value: "low" | "medium" | "high") => void;
}

export const Priority = ({ scope, name, value, onChange }: PriorityProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-300">Priority</Label>
      <GumnutData
        control={scope.control}
        name={name}
        render={({ field }) => (
          <Select
            value={field.value}
            onValueChange={(value: "low" | "medium" | "high") => {
              // Create synthetic event for GumnutData
              const syntheticEvent = {
                target: { value },
                currentTarget: { value },
                type: "change",
              } as unknown as React.ChangeEvent<Element>;

              field.onChange(syntheticEvent);
              onChange(value);
            }}
          >
            <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">🟢 Low</SelectItem>
              <SelectItem value="medium">🟡 Medium</SelectItem>
              <SelectItem value="high">🔴 High</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
    </div>
  );
};

interface CategoryProps {
  scope: any;
  name: string;
  value: string;
  onChange: (value: string) => void;
}

export const Category = ({ scope, name, value, onChange }: CategoryProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-300">Category</Label>
      <div>
        <GumnutText
          control={scope.control}
          name={name}
          placeholder="Enter category..."
          className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
          style={{
            backgroundColor: "rgb(51 65 85 / 0.5)", // bg-slate-700/50
            border: "1px solid rgb(71 85 105)", // border-slate-600
            borderRadius: "6px",
            color: "white",
            padding: "8px 12px",
            fontSize: "14px",
            outline: "none",
            width: "100%",
          }}
        />
      </div>
    </div>
  );
};

interface StatusProps {
  scope: any;
  name: string;
  value: "draft" | "in-progress" | "complete";
  onChange: (value: "draft" | "in-progress" | "complete") => void;
}

export const Status = ({ scope, name, value, onChange }: StatusProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-300">Status</Label>
      <GumnutData
        control={scope.control}
        name={name}
        render={({ field }) => (
          <Select
            value={field.value}
            onValueChange={(value: "draft" | "in-progress" | "complete") => {
              // Create synthetic event for GumnutData
              const syntheticEvent = {
                target: { value },
                currentTarget: { value },
                type: "change",
              } as unknown as React.ChangeEvent<Element>;

              field.onChange(syntheticEvent);
              onChange(value);
            }}
          >
            <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">📝 Draft</SelectItem>
              <SelectItem value="in-progress">🔄 In Progress</SelectItem>
              <SelectItem value="complete">✅ Complete</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
    </div>
  );
};

interface LinkedNotesProps {
  linkedNoteIds: string[];
  availableNotes: NoteLink[];
  onChange: (linkedNotes: string[]) => void;
}

export const LinkedNotes = ({
  linkedNoteIds,
  availableNotes,
  onChange,
}: LinkedNotesProps) => {
  const addLinkedNote = (noteId: string) => {
    if (!linkedNoteIds.includes(noteId)) {
      onChange([...linkedNoteIds, noteId]);
    }
  };

  const removeLinkedNote = (noteId: string) => {
    onChange(linkedNoteIds.filter((id) => id !== noteId));
  };

  const linkedNotes = linkedNoteIds
    .map((id) => availableNotes.find((note) => note.id === id))
    .filter(Boolean) as NoteLink[];

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-300">Linked Notes</Label>

      {linkedNotes.length > 0 && (
        <div className="space-y-1">
          {linkedNotes.map((note) => (
            <Badge
              key={note.id}
              variant="secondary"
              className="bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 cursor-pointer"
              onClick={() => removeLinkedNote(note.id)}
            >
              <Link className="w-3 h-3 mr-1" />
              {note.title}
              <span className="ml-1 text-purple-400">×</span>
            </Badge>
          ))}
        </div>
      )}

      <Select onValueChange={addLinkedNote}>
        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
          <SelectValue placeholder="Link a note..." />
        </SelectTrigger>
        <SelectContent>
          {availableNotes
            .filter((note) => !linkedNoteIds.includes(note.id))
            .map((note) => (
              <SelectItem key={note.id} value={note.id}>
                {note.title}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
};
