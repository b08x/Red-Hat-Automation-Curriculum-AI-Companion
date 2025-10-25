
import React, { useState } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { BoardState, KanbanTask, TaskStatus } from '../types';
import { geminiService } from '../services/geminiService';
import { BrainIcon, LoadingSpinner } from './icons/Icons';

const STICKY_COLORS_HEX = ['#FEF9C3', '#D1FAE5', '#DBEAFE', '#FCE7F3', '#F3E8FF', '#FFEDD5'];

const initialBoardState: BoardState = {
  todo: {
    id: 'todo',
    title: 'To Do',
    tasks: [
      { id: '1', title: 'Set up project repository', description: 'Initialize git repo and push to GitHub.', status: 'todo', tags: ['setup', 'git'], color: STICKY_COLORS_HEX[0] },
      { id: '2', title: 'Develop initial UI mockups', description: 'Create wireframes for the main views of the application.', status: 'todo', tags: ['design', 'ui'], color: STICKY_COLORS_HEX[1] },
    ],
  },
  inprogress: {
    id: 'inprogress',
    title: 'In Progress',
    tasks: [
      { id: '3', title: 'Implement sidebar navigation', description: 'Build the collapsible sidebar component.', status: 'inprogress', tags: ['feature', 'react'], color: STICKY_COLORS_HEX[2] },
    ],
  },
  done: {
    id: 'done',
    title: 'Done',
    tasks: [
        { id: '4', title: 'Configure Tailwind CSS', description: 'Set up custom theme colors and fonts.', status: 'done', tags: ['setup', 'css'], color: STICKY_COLORS_HEX[3] },
    ],
  },
};

export const KanbanBoard: React.FC = () => {
  const [board, setBoard] = useState<BoardState>(initialBoardState);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddTask = (status: TaskStatus) => {
    const title = prompt("Enter task title:");
    if (title) {
      const newTask: KanbanTask = {
        id: Date.now().toString(),
        title,
        description: '',
        status,
        tags: [],
        color: STICKY_COLORS_HEX[Math.floor(Math.random() * STICKY_COLORS_HEX.length)],
      };
      setBoard(prevBoard => ({
        ...prevBoard,
        [status]: {
          ...prevBoard[status],
          tasks: [...prevBoard[status].tasks, newTask],
        },
      }));
    }
  };

  const handleUpdateTask = (updatedTask: KanbanTask) => {
    const status = updatedTask.status;
    setBoard(prevBoard => ({
      ...prevBoard,
      [status]: {
        ...prevBoard[status],
        tasks: prevBoard[status].tasks.map(task =>
          task.id === updatedTask.id ? updatedTask : task
        ),
      },
    }));
  };
  
  const handleDeleteTask = (taskId: string) => {
      if (window.confirm("Are you sure you want to delete this task?")) {
          setBoard(prevBoard => {
            const newState = (Object.keys(prevBoard) as TaskStatus[]).reduce((acc, status) => {
              acc[status] = {
                ...prevBoard[status],
                tasks: prevBoard[status].tasks.filter(task => task.id !== taskId),
              };
              return acc;
            }, {} as BoardState);
            return newState;
          });
      }
  };


  const handleDrop = (taskId: string, newStatus: TaskStatus) => {
    let taskToMove: KanbanTask | undefined;
    let oldStatus: TaskStatus | undefined;

    for (const statusKey in board) {
        const status = statusKey as TaskStatus;
        const foundTask = board[status].tasks.find(t => t.id === taskId);
        if (foundTask) {
            taskToMove = { ...foundTask, status: newStatus };
            oldStatus = status;
            break;
        }
    }

    if (taskToMove && oldStatus && oldStatus !== newStatus) {
        setBoard(prevBoard => ({
          ...prevBoard,
          [oldStatus as TaskStatus]: {
            ...prevBoard[oldStatus as TaskStatus],
            tasks: prevBoard[oldStatus as TaskStatus].tasks.filter(t => t.id !== taskId),
          },
          [newStatus]: {
            ...prevBoard[newStatus],
            tasks: [...prevBoard[newStatus].tasks, taskToMove!],
          }
      }));
    }
  };
  
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
                    onDrop={handleDrop}
                    onAddTask={() => handleAddTask(status)}
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={handleDeleteTask}
                />
            ))}
        </div>
    </div>
  );
};
