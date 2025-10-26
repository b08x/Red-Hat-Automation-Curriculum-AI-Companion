import React from 'react';
import type { CurriculumPart, CurriculumTopic, RelatedTopicLink, InteractiveTableContent } from '../types';
import { ModuleAssistant } from './ModuleAssistant';
import { TargetIcon } from './icons/Icons';
import { InteractiveTable } from './KanbanColumn';

interface ContentViewProps {
  topic: CurriculumPart | CurriculumTopic;
  onSelectTopic: (partTitle: string, topicTitle: string) => void;
  onAddTaskToBoard: (task: { title: string; description: string }) => void;
  onOpenObjectiveModal: (data: { category: string; moduleTitle: string; moduleContent: any; }) => void;
}

const isCurriculumPart = (topic: any): topic is CurriculumPart => {
  return 'description' in topic;
};

export const ContentView: React.FC<ContentViewProps> = ({ topic, onSelectTopic, onAddTaskToBoard, onOpenObjectiveModal }) => {
  if (isCurriculumPart(topic)) {
    
    const handleIterateClick = (objectiveItem: { category: string; module: string; }) => {
        const targetModule = topic.modules?.find(m => m.title === objectiveItem.module);
        if (targetModule) {
            const content = typeof targetModule.content === 'string' ? targetModule.content : 'This module contains complex, non-text content.';
            onOpenObjectiveModal({
                category: objectiveItem.category,
                moduleTitle: objectiveItem.module,
                moduleContent: content,
            });
        } else {
            alert(`Could not find content for module: ${objectiveItem.module}`);
        }
    };

    return (
      <div className="prose prose-invert max-w-none prose-h2:text-rh-accent prose-h2:border-b prose-h2:border-rh-light-gray prose-h2:pb-2 prose-strong:text-rh-red prose-a:text-rh-accent hover:prose-a:text-rh-red">
        <h1 className="text-4xl font-extrabold text-white mb-4">{topic.title}</h1>
        <p className="text-lg leading-relaxed">{topic.description}</p>
        {topic.objectiveMapping && (
            <>
                <h2 className="mt-8">Objective Mapping</h2>
                <InteractiveTable
                    headers={["Official Objective Category", "Covered in Curriculum Module(s)", "Interactive Task"]}
                    rows={topic.objectiveMapping.map(item => [
                        item.category,
                        item.module,
                        <button 
                            onClick={() => handleIterateClick(item)}
                            className="flex items-center gap-2 text-rh-accent hover:text-rh-red transition-colors"
                            title={`Generate practice tasks for: ${item.category}`}
                            >
                            <TargetIcon />
                            <span>Iterate</span>
                        </button>
                    ])}
                    fileName={`${topic.title}-objectives.csv`}
                />
            </>
        )}
      </div>
    );
  }

  // CurriculumTopic
  return (
    <>
      <div className="prose prose-invert max-w-none prose-h1:text-rh-red prose-h2:text-rh-accent prose-h2:border-b prose-h2:border-rh-light-gray prose-h2:pb-2 prose-strong:text-white prose-a:text-rh-accent hover:prose-a:text-rh-red">
        <h1 className="text-4xl font-extrabold text-white mb-4">{topic.title}</h1>
        <div>
          {topic.content && typeof topic.content === 'object' && 'type' in topic.content && (topic.content as InteractiveTableContent).type === 'interactiveTable'
              ? <InteractiveTable {...topic.content as InteractiveTableContent} />
              : topic.content as React.ReactNode
          }
        </div>
        {topic.related && topic.related.length > 0 && (
          <div className="mt-12 pt-6 border-t border-rh-light-gray">
            <h2 className="text-2xl font-bold text-rh-accent mb-4">Related Concepts</h2>
            <div className="flex flex-wrap gap-4">
              {topic.related.map((link, index) => (
                <button
                  key={index}
                  onClick={() => onSelectTopic(link.part, link.topic)}
                  className="bg-rh-light-gray hover:bg-rh-red text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  {link.topic}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-12 pt-8 border-t-2 border-dashed border-rh-light-gray">
        <ModuleAssistant topic={topic as CurriculumTopic} onAddTaskToBoard={onAddTaskToBoard} />
      </div>
    </>
  );
};