
import React from 'react';
import { KanbanCard } from './KanbanCard';
import { KanbanColumn as KanbanColumnType, KanbanTask, TaskStatus } from '../types';

interface KanbanColumnProps {
  column: KanbanColumnType;
  onDrop: (taskId: string, newStatus: TaskStatus) => void;
  onAddTask: () => void;
  onUpdateTask: (task: KanbanTask) => void;
  onDeleteTask: (taskId: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, onDrop, onAddTask, onUpdateTask, onDeleteTask }) => {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    onDrop(taskId, column.id);
  };

  return (
    <div 
      className="bg-rh-medium-gray rounded-lg p-4 flex flex-col h-full"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-white">{column.title} <span className="text-sm font-normal text-gray-400">{column.tasks.length}</span></h3>
        <button onClick={onAddTask} className="text-2xl text-gray-400 hover:text-white">+</button>
      </div>
      <div className="space-y-4 overflow-y-auto flex-grow min-h-[200px]">
        {column.tasks.map(task => (
          <KanbanCard 
            key={task.id} 
            task={task} 
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </div>
    </div>
  );
};