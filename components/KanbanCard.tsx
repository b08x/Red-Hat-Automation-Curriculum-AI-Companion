
import React, { useState } from 'react';
import { KanbanTask } from '../types';
import { PencilIcon, TrashIcon } from './icons/Icons';

interface KanbanCardProps {
  task: KanbanTask;
  onUpdateTask: (task: KanbanTask) => void;
  onDeleteTask: (taskId: string) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ task, onUpdateTask, onDeleteTask }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  const [editTags, setEditTags] = useState((task.tags || []).join(', '));

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // prevent dragging when editing text
    if ((e.target as HTMLElement).tagName.toLowerCase() === 'input' || (e.target as HTMLElement).tagName.toLowerCase() === 'textarea') {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('taskId', task.id);
  };

  const handleSave = () => {
    if (!editTitle.trim()) {
      alert("Title cannot be empty.");
      return;
    }
    const updatedTask: KanbanTask = {
      ...task,
      title: editTitle.trim(),
      description: editDescription.trim(),
      tags: editTags.split(',').map(tag => tag.trim()).filter(Boolean),
    };
    onUpdateTask(updatedTask);
    setIsEditing(false);
  };
  
  const startEditing = () => {
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditTags((task.tags || []).join(', '));
    setIsEditing(true);
  }

  if (isEditing) {
    return (
      <div style={{ backgroundColor: task.color }} className="p-4 rounded-md shadow-md text-gray-800 flex flex-col gap-2">
        <label className="text-xs font-bold">Title</label>
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="font-semibold bg-white/60 p-1 rounded-sm w-full focus:outline-rh-accent"
          autoFocus
        />
        <label className="text-xs font-bold mt-1">Description</label>
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          className="text-sm bg-white/60 p-1 rounded-sm w-full focus:outline-rh-accent"
          rows={3}
        />
        <label className="text-xs font-bold mt-1">Tags (comma-separated)</label>
        <input
          type="text"
          value={editTags}
          onChange={(e) => setEditTags(e.target.value)}
          placeholder="e.g. Module 1, UI, bug"
          className="text-xs bg-white/60 p-1 rounded-sm w-full focus:outline-rh-accent"
        />
        <div className="flex justify-end gap-2 mt-2">
          <button onClick={() => setIsEditing(false)} className="px-3 py-1 bg-rh-light-gray text-white rounded-md hover:bg-rh-medium-gray text-sm">Cancel</button>
          <button onClick={handleSave} className="px-3 py-1 bg-rh-accent text-white rounded-md hover:bg-rh-accent/80 text-sm">Save</button>
        </div>
      </div>
    );
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      style={{ backgroundColor: task.color }}
      className="group p-4 rounded-md shadow-md cursor-grab active:cursor-grabbing text-gray-800"
    >
      <div className="flex justify-between items-start">
        <h4 className="font-semibold break-words pr-2 flex-1">{task.title}</h4>
        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={startEditing} className="p-1 hover:bg-black/10 rounded-full"><PencilIcon /></button>
          <button onClick={() => onDeleteTask(task.id)} className="p-1 hover:bg-black/10 rounded-full"><TrashIcon /></button>
        </div>
      </div>
      {task.description && <p className="text-sm mt-1 break-words">{task.description}</p>}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {task.tags.map(tag => (
            <span key={tag} className="bg-rh-accent text-white text-xs font-semibold px-2 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
};
