
import React, { useState } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { BoardState, KanbanTask, TaskStatus } from '../types';
import { geminiService } from '../services/geminiService';
import { BrainIcon, LoadingSpinner } from './icons/Icons';

const STICKY_COLORS_HEX = ['#FEF9C3', '#D1FAE5', '#DBEAFE', '#FCE7F3', '#F3E8FF', '#FFEDD5'];

interface KanbanBoardProps {
  board: BoardState;
  setBoard: React.Dispatch<React.SetStateAction<BoardState>>;
  onDrop: (taskId: string, newStatus: TaskStatus) => void;
  onAddTask: (status: TaskStatus) => void;
  onUpdateTask: (task: KanbanTask) => void;
  onDeleteTask: (taskId: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ board, setBoard, onDrop, onAddTask, onUpdateTask, onDeleteTask }) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGenerateTasks = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const generatedTasks = await geminiService.generateKanbanTasks(aiPrompt);
      const newTasks: KanbanTask[] = generatedTasks.map((task, index) => ({
        ...task,
        id: `ai-${Date.now()}-${index}`,
        status: 'todo',
        tags: ['ai-generated'],
        color: STICKY_COLORS_HEX[Math.floor(Math.random() * STICKY_COLORS_HEX.length)],
      }));
      setBoard(prevBoard => ({
        ...prevBoard,
        todo: {
          ...prevBoard.todo,
          tasks: [...prevBoard.todo.tasks, ...newTasks]
        }
      }));
      setAiPrompt('');
    } catch (error) {
      console.error("Failed to generate tasks:", error);
      alert("There was an error generating tasks. Please check the console.");
    } finally {
      setIsGenerating(false);
    }
  };


  return (
    <div className="p-4 sm:p-0">
        <div className="bg-rh-medium-gray p-4 rounded-lg shadow-lg mb-6">
            <h2 className="text-xl font-bold text-rh-accent mb-2">Generate Tasks with AI</h2>
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
                <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleGenerateTasks()}
                    placeholder="e.g., 'Create a user authentication feature'"
                    className="flex-grow bg-rh-dark-gray border border-rh-light-gray rounded-md p-2 focus:ring-rh-accent focus:border-rh-accent"
                    disabled={isGenerating}
                />
                <button
                    onClick={handleGenerateTasks}
                    disabled={isGenerating}
                    className="flex items-center justify-center px-4 py-2 bg-rh-accent text-white rounded-md hover:bg-rh-accent/80 disabled:bg-rh-light-gray"
                >
                    {isGenerating ? <LoadingSpinner/> : <><BrainIcon /> <span className="ml-2">Generate</span></>}
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(Object.keys(board) as TaskStatus[]).map(status => (
                <KanbanColumn
                    key={status}
                    column={board[status]}
                    onDrop={onDrop}
                    onAddTask={() => onAddTask(status)}
                    onUpdateTask={onUpdateTask}
                    onDeleteTask={onDeleteTask}
                />
            ))}
        </div>
    </div>
  );
};
