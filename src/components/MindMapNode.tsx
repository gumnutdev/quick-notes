
import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Note } from '@/types/Note';
import { formatDistanceToNow } from 'date-fns';
import { Circle, AlertCircle, CheckCircle } from 'lucide-react';

interface MindMapNodeProps {
  data: {
    note: Note;
    isActive: boolean;
    onSelect: () => void;
  };
}

const priorityColors = {
  low: 'border-green-400',
  medium: 'border-yellow-400',
  high: 'border-red-400'
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

export const MindMapNode = memo(({ data }: MindMapNodeProps) => {
  const { note, isActive, onSelect } = data;
  const StatusIcon = statusIcons[note.status];

  return (
    <div 
      className={`relative bg-slate-800 rounded-lg border-2 p-4 min-w-[200px] max-w-[250px] cursor-pointer transition-all ${
        isActive 
          ? 'border-purple-500 shadow-lg shadow-purple-500/25' 
          : `${priorityColors[note.priority]} hover:shadow-lg`
      }`}
      onClick={onSelect}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-purple-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-purple-500 border-2 border-white"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-purple-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-purple-500 border-2 border-white"
      />

      <div className="space-y-2">
        <h3 className="font-semibold text-white text-sm line-clamp-2">
          {note.title}
        </h3>
        
        <p className="text-xs text-slate-300 line-clamp-3">
          {note.content || 'No content'}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <StatusIcon className={`w-3 h-3 ${statusColors[note.status]}`} />
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
        
        {note.linkedNotes.length > 0 && (
          <div className="text-xs text-slate-400">
            {note.linkedNotes.length} link{note.linkedNotes.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
});

MindMapNode.displayName = 'MindMapNode';
