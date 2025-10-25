
import React, { useState } from 'react';
import type { Curriculum } from '../data/curriculumData';
import { ChevronRightIcon } from './icons/Icons';

interface SidebarProps {
  data: Curriculum[];
  onSelect: (topic: any) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ data, onSelect, isOpen, setIsOpen }) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (title: string) => {
    setOpenSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const handleSelect = (topic: any) => {
    onSelect(topic);
    if(window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <aside className={`fixed top-0 left-0 h-full bg-rh-medium-gray text-white transition-all duration-300 ease-in-out z-20 ${isOpen ? 'w-80' : 'w-16'}`}>
      <div className="flex flex-col h-full">
        <div className={`flex items-center justify-between p-4 border-b border-rh-light-gray ${isOpen ? '' : 'justify-center'}`}>
          {isOpen && <h2 className="text-xl font-bold text-rh-red">Curriculum</h2>}
          <button onClick={() => setIsOpen(!isOpen)} className="p-1 rounded-full hover:bg-rh-light-gray">
            <ChevronRightIcon className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          <ul>
            {data.map((part, index) => (
              <li key={index} className="mb-2">
                <button onClick={() => toggleSection(part.title)} className="w-full flex justify-between items-center text-left p-2 rounded hover:bg-rh-light-gray">
                  {isOpen && <span className="font-semibold">{part.title}</span>}
                  {isOpen && <ChevronRightIcon className={`transition-transform ${openSections[part.title] ? 'rotate-90' : ''}`} />}
                  {!isOpen && <span className="text-lg">P{index+1}</span>}
                </button>
                {isOpen && openSections[part.title] && (
                  <ul className="pl-4 mt-1">
                    <li className="mb-1">
                      <button onClick={() => handleSelect(part)} className="w-full text-left p-2 rounded hover:bg-rh-light-gray/50 text-sm">Overview</button>
                    </li>
                    {part.modules?.map((module, modIndex) => (
                      <li key={modIndex} className="mb-1">
                        <button onClick={() => handleSelect(module)} className="w-full text-left p-2 rounded hover:bg-rh-light-gray/50 text-sm">{module.title}</button>
                      </li>
                    ))}
                    {part.labs?.map((lab, labIndex) => (
                      <li key={labIndex} className="mb-1">
                        <button onClick={() => handleSelect(lab)} className="w-full text-left p-2 rounded hover:bg-rh-light-gray/50 text-sm font-bold text-rh-accent">{lab.title}</button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};
