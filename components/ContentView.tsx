
import React from 'react';
import type { CurriculumPart, CurriculumTopic, RelatedTopicLink } from '../types';
import { ModuleAssistant } from './ModuleAssistant';

interface ContentViewProps {
  topic: CurriculumPart | CurriculumTopic;
  onSelectTopic: (partTitle: string, topicTitle: string) => void;
  onAddTaskToBoard: (task: { title: string; description: string }) => void;
}

const isCurriculumPart = (topic: any): topic is CurriculumPart => {
  return 'description' in topic;
};

export const ContentView: React.FC<ContentViewProps> = ({ topic, onSelectTopic, onAddTaskToBoard }) => {
  if (isCurriculumPart(topic)) {
    return (
      <div className="prose prose-invert max-w-none prose-h2:text-rh-accent prose-h2:border-b prose-h2:border-rh-light-gray prose-h2:pb-2 prose-strong:text-rh-red prose-a:text-rh-accent hover:prose-a:text-rh-red">
        <h1 className="text-4xl font-extrabold text-white mb-4">{topic.title}</h1>
        <p className="text-lg leading-relaxed">{topic.description}</p>
        {topic.objectiveMapping && (
            <>
                <h2 className="mt-8">Objective Mapping</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-rh-light-gray bg-rh-medium-gray rounded-lg">
                        <thead className="bg-rh-light-gray">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Official Objective Category</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Covered in Curriculum Module(s)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-rh-light-gray">
                            {topic.objectiveMapping.map((item, index) => (
                                <tr key={index} className="hover:bg-rh-light-gray/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-rh-text">{item.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-rh-text">{item.module}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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
        <div>{topic.content}</div>
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
