import { format } from "date-fns";
import { Calendar as CalendarIcon, Link } from "lucide-react";
import {
  Select,
  SimpleSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
  value: number;
  onChange: (value: number) => void;
}

const moodEmojis = ["😢", "😟", "😐", "🙂", "😊", "😃", "😄", "😆", "🤩", "🥳"];

export const Mood = ({ value, onChange }: MoodProps) => {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-slate-300">Mood</Label>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-2xl">{moodEmojis[value - 1]}</span>
          <span className="text-sm text-slate-400">{value}/10</span>
        </div>
        <Slider
          value={[value]}
          onValueChange={(values) => onChange(values[0])}
          max={10}
          min={1}
          step={1}
          className="w-full"
        />
      </div>
    </div>
  );
};

interface PriorityProps {
  value: "low" | "medium" | "high";
  onChange: (value: "low" | "medium" | "high") => void;
}

export const Priority = ({ value, onChange }: PriorityProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-300">Priority</Label>
      <SimpleSelect
        value={value}
        onChange={(e) => onChange(e.target.value as "low" | "medium" | "high")}
        className="bg-slate-700/50 border-slate-600 text-white"
      >
        <option value="low">🟢 Low</option>
        <option value="medium">🟡 Medium</option>
        <option value="high">🔴 High</option>
      </SimpleSelect>
    </div>
  );
};

interface CategoryProps {
  value: string;
  onChange: (value: string) => void;
}

export const Category = ({ value, onChange }: CategoryProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-300">Category</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter category..."
        className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
      />
    </div>
  );
};

interface StatusProps {
  value: "draft" | "in-progress" | "complete";
  onChange: (value: "draft" | "in-progress" | "complete") => void;
}

export const Status = ({ value, onChange }: StatusProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-300">Status</Label>
      <SimpleSelect
        value={value}
        onChange={(e) =>
          onChange(e.target.value as "draft" | "in-progress" | "complete")
        }
        className="bg-slate-700/50 border-slate-600 text-white"
      >
        <option value="draft">📝 Draft</option>
        <option value="in-progress">🔄 In Progress</option>
        <option value="complete">✅ Complete</option>
      </SimpleSelect>
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
