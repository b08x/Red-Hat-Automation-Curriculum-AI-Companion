
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ContentView } from './components/ContentView';
import { ChatWidget } from './components/ChatWidget';
import { VideoAnalyzer } from './components/VideoAnalyzer';
import { KanbanBoard } from './components/KanbanBoard';
import { KnowledgeStore } from './components/KnowledgeStore';
import { ObjectiveAssistantModal } from './components/ObjectiveAssistantModal';
import { Curriculum, curriculumData } from './data/curriculumData';
import { BrainIcon, VideoIcon, BookOpenIcon, ColumnsIcon, DatabaseIcon } from './components/icons/Icons';
import { CurriculumPart, CurriculumTopic, BoardState, KanbanTask, TaskStatus } from './types';

export type View = 'curriculum' | 'video-analyzer' | 'kanban' | 'knowledge-store';

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


const App: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<any>(curriculumData[0]);
  const [activeView, setActiveView] = useState<View>('curriculum');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [board, setBoard] = useState<BoardState>(initialBoardState);
  const [objectiveModalState, setObjectiveModalState] = useState<{ isOpen: boolean; data: { category: string; moduleTitle: string; moduleContent: any; } | null }>({ isOpen: false, data: null });


  useEffect(() => {
    // Fix: Cast window to any to access hljs property which is loaded via script tag.
    if ((window as any).hljs) {
      (window as any).hljs.highlightAll();
    }
  }, [selectedTopic, activeView]);

  const handleSelectTopic = (partTitle: string, topicTitle: string) => {
    const part = curriculumData.find(p => p.title === partTitle);
    if (!part) return;

    let topic: CurriculumPart | CurriculumTopic | undefined;

    if (part.title === topicTitle) { // It's an overview
        topic = part;
    } else {
        topic = part.modules?.find(m => m.title === topicTitle) || part.labs?.find(l => l.title === topicTitle);
    }
    
    if (topic) {
        setSelectedTopic(topic);
        setActiveView('curriculum');
        // Scroll to top
        document.querySelector('main')?.scrollTo(0, 0);
    }
  };

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
    setBoard(prevBoard => {
        const newBoard = { ...prevBoard };
        let oldStatus: TaskStatus | undefined;

        // Find and remove the task from its original column
        for (const statusKey of Object.keys(newBoard) as TaskStatus[]) {
            const taskIndex = newBoard[statusKey].tasks.findIndex(t => t.id === updatedTask.id);
            if (taskIndex !== -1) {
                oldStatus = statusKey;
                newBoard[statusKey].tasks.splice(taskIndex, 1);
                break;
            }
        }

        // Add the updated task to its new column
        if (newBoard[updatedTask.status]) {
            newBoard[updatedTask.status].tasks.push(updatedTask);
        }

        return newBoard;
    });
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
  
  const handleAddTaskFromAssistant = (task: { title: string; description: string }) => {
    const newTask: KanbanTask = {
      id: Date.now().toString(),
      title: task.title,
      description: task.description,
      status: 'todo',
      tags: ['ai-generated', selectedTopic?.title],
      color: STICKY_COLORS_HEX[Math.floor(Math.random() * STICKY_COLORS_HEX.length)],
    };
    setBoard(prevBoard => ({
      ...prevBoard,
      todo: {
        ...prevBoard.todo,
        tasks: [...prevBoard.todo.tasks, newTask],
      },
    }));
    setActiveView('kanban');
  };
  
  const handleOpenObjectiveModal = (data: { category: string; moduleTitle: string; moduleContent: any; }) => {
    setObjectiveModalState({ isOpen: true, data });
  };

  const handleCloseObjectiveModal = () => {
    setObjectiveModalState({ isOpen: false, data: null });
  };


  const renderView = () => {
    switch(activeView) {
      case 'video-analyzer':
        return <VideoAnalyzer />;
      case 'kanban':
        return <KanbanBoard 
          board={board}
          setBoard={setBoard}
          onDrop={handleDrop}
          onAddTask={handleAddTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />;
      case 'knowledge-store':
        return <KnowledgeStore />;
      case 'curriculum':
      default:
        return <ContentView 
                  topic={selectedTopic} 
                  onSelectTopic={handleSelectTopic} 
                  onAddTaskToBoard={handleAddTaskFromAssistant}
                  onOpenObjectiveModal={handleOpenObjectiveModal} 
                />;
    }
  };

  return (
    <div className="flex h-screen bg-rh-dark-gray text-rh-text font-sans">
      <Sidebar
        data={curriculumData as Curriculum[]}
        onSelect={(topic) => {
          setSelectedTopic(topic);
          setActiveView('curriculum');
        }}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <main className={`flex-1 overflow-y-auto transition-all duration-300 ${isSidebarOpen ? 'ml-80' : 'ml-16'}`}>
        <div className="p-4 sm:p-6 lg:p-8">
            <header className="mb-8 p-4 bg-rh-medium-gray rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-rh-red">Red Hat Automation Curriculum AI Companion</h1>
                <p className="text-rh-accent mt-1">Your interactive guide to mastering Red Hat automation, powered by Gemini.</p>
                <nav className="mt-4 flex space-x-2 sm:space-x-4 flex-wrap">
                  <button onClick={() => setActiveView('curriculum')} className={`flex items-center space-x-2 px-3 py-2 rounded-md ${activeView === 'curriculum' ? 'bg-rh-red text-white' : 'bg-rh-light-gray hover:bg-rh-red/80'}`}>
                    <BookOpenIcon />
                    <span>Curriculum</span>
                  </button>
                  <button onClick={() => setActiveView('video-analyzer')} className={`flex items-center space-x-2 px-3 py-2 rounded-md ${activeView === 'video-analyzer' ? 'bg-rh-red text-white' : 'bg-rh-light-gray hover:bg-rh-red/80'}`}>
                    <VideoIcon />
                    <span>Video Lab</span>
                  </button>
                  <button onClick={() => setActiveView('kanban')} className={`flex items-center space-x-2 px-3 py-2 rounded-md ${activeView === 'kanban' ? 'bg-rh-red text-white' : 'bg-rh-light-gray hover:bg-rh-red/80'}`}>
                    <ColumnsIcon />
                    <span>Kanban Board</span>
                  </button>
                  <button onClick={() => setActiveView('knowledge-store')} className={`flex items-center space-x-2 px-3 py-2 rounded-md ${activeView === 'knowledge-store' ? 'bg-rh-red text-white' : 'bg-rh-light-gray hover:bg-rh-red/80'}`}>
                    <DatabaseIcon />
                    <span>Knowledge Store</span>
                  </button>
                </nav>
            </header>
            {renderView()}
        </div>
      </main>
      <ChatWidget curriculum={curriculumData as Curriculum[]} />
      <ObjectiveAssistantModal 
        isOpen={objectiveModalState.isOpen}
        onClose={handleCloseObjectiveModal}
        data={objectiveModalState.data}
      />
    </div>
  );
};

export default App;
