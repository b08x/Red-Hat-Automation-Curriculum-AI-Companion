
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ContentView } from './components/ContentView';
import { ChatWidget } from './components/ChatWidget';
import { VideoAnalyzer } from './components/VideoAnalyzer';
import { KanbanBoard } from './components/KanbanBoard';
import { Curriculum, curriculumData } from './data/curriculumData';
import { BrainIcon, VideoIcon, BookOpenIcon, ColumnsIcon } from './components/icons/Icons';
import { CurriculumPart, CurriculumTopic } from './types';

export type View = 'curriculum' | 'video-analyzer' | 'kanban';

const App: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<any>(curriculumData[0]);
  const [activeView, setActiveView] = useState<View>('curriculum');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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


  const renderView = () => {
    switch(activeView) {
      case 'video-analyzer':
        return <VideoAnalyzer />;
      case 'kanban':
        return <KanbanBoard />;
      case 'curriculum':
      default:
        return <ContentView topic={selectedTopic} onSelectTopic={handleSelectTopic} />;
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
                </nav>
            </header>
            {renderView()}
        </div>
      </main>
      <ChatWidget curriculum={curriculumData as Curriculum[]} />
    </div>
  );
};

export default App;