
import { Note } from '@/types/Note';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Circle, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NoteCardProps {
  note: Note;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}

const priorityColors = {
  low: 'text-green-400',
  medium: 'text-yellow-400',
  high: 'text-red-400'
};

const statusIcons = {
  draft: Circle,
  'in-progress': AlertCircle,
  complete: CheckCircle
};

const statusColors = {
  draft: 'text-slate-400',
  'in-progress': 'text-blue-400',
  complete: 'text-green-400'
};

const moodEmojis = ['😢', '😟', '😐', '🙂', '😊', '😃', '😄', '😆', '🤩', '🥳'];

export const NoteCard = ({ note, isActive, onClick, onDelete }: NoteCardProps) => {
  const StatusIcon = statusIcons[note.status];
  
  return (
    <div 
      className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
        isActive 
          ? 'bg-purple-600/20 border border-purple-500/50' 
          : 'bg-slate-700/30 hover:bg-slate-700/50 border border-transparent'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white truncate text-sm">
            {note.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            {note.content || 'No content'}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6 text-slate-400 hover:text-red-400"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
      
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center space-x-2">
          <StatusIcon className={`w-3 h-3 ${statusColors[note.status]}`} />
          <span className={`text-xs ${priorityColors[note.priority]}`}>
            {note.priority}
          </span>
          <span className="text-xs">
            {moodEmojis[note.mood - 1]}
          </span>
        </div>
        <span className="text-xs text-slate-400">
          {formatDistanceToNow(new Date(note.modifiedDate), { addSuffix: true })}
        </span>
      </div>
      
      {note.category && (
        <div className="mt-2">
          <span className="inline-block px-2 py-1 text-xs bg-purple-600/20 text-purple-300 rounded">
            {note.category}
          </span>
        </div>
      )}
    </div>
  );
};
