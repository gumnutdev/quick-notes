import { useCallback, useState, useEffect } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Note } from "@/types/Note";
import { MindMapNode } from "./MindMapNode";

interface MindMapViewProps {
  notes: Note[];
  onNoteUpdate: (note: Note) => void;
  onNoteSelect: (note: Note) => void;
  activeNote: Note | null;
}

const nodeTypes = {
  noteNode: MindMapNode,
};

export const MindMapView = ({
  notes,
  onNoteUpdate,
  onNoteSelect,
  activeNote,
}: MindMapViewProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Convert notes to nodes and create edges based on linkedNotes
  useEffect(() => {
    const initialNodes: Node[] = notes.map((note, index) => ({
      id: note.id,
      type: "noteNode",
      position: {
        x: (index % 4) * 300 + 100,
        y: Math.floor(index / 4) * 200 + 100,
      },
      data: {
        note,
        isActive: activeNote?.id === note.id,
        onSelect: () => onNoteSelect(note),
      },
    }));

    const initialEdges: Edge[] = [];
    notes.forEach((note) => {
      note.linkedNotes.forEach((linkedNoteId) => {
        // Only create edge if both notes exist
        const targetNote = notes.find((n) => n.id === linkedNoteId);
        if (targetNote) {
          initialEdges.push({
            id: `${note.id}-${linkedNoteId}`,
            source: note.id,
            target: linkedNoteId,
            type: "smoothstep",
            animated: true,
            style: { stroke: "#8b5cf6", strokeWidth: 2 },
          });
        }
      });
    });

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [notes, activeNote, onNoteSelect, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      // Create a new link between notes
      if (params.source && params.target) {
        const sourceNote = notes.find((n) => n.id === params.source);
        const targetNote = notes.find((n) => n.id === params.target);

        if (
          sourceNote &&
          targetNote &&
          !sourceNote.linkedNotes.includes(params.target)
        ) {
          const updatedNote = {
            ...sourceNote,
            linkedNotes: [...sourceNote.linkedNotes, params.target],
          };
          onNoteUpdate(updatedNote);
          // The edge will be created automatically when useEffect runs with updated notes
        }
      }
    },
    [notes, onNoteUpdate]
  );

  const onNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
    // Update node position - in a real app you might want to persist this
    console.log(`Node ${node.id} moved to position:`, node.position);
  }, []);

  return (
    <div className="w-full h-full bg-slate-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        className="bg-slate-900"
      >
        <Controls className="bg-slate-800 border-slate-600" />
        <MiniMap
          className="bg-slate-800 border-slate-600"
          nodeColor="#8b5cf6"
          maskColor="rgba(0, 0, 0, 0.2)"
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#475569"
        />
      </ReactFlow>
    </div>
  );
};
