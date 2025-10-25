
import React, { useState, useEffect } from 'react';
import type { CurriculumTopic } from '../types';
import { geminiService } from '../services/geminiService';
import { BrainIcon, LightbulbIcon, CheckSquareIcon, LoadingSpinner } from './icons/Icons';

interface ModuleAssistantProps {
  topic: CurriculumTopic;
  onAddTaskToBoard: (task: { title: string; description: string }) => void;
}

type AssistantAction = 'explain' | 'brainstorm' | 'tasks';

type Task = {
  title: string;
  description: string;
};

export const ModuleAssistant: React.FC<ModuleAssistantProps> = ({ topic, onAddTaskToBoard }) => {
  const [activeAction, setActiveAction] = useState<AssistantAction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | Task[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset when topic changes
  useEffect(() => {
    setActiveAction(null);
    setIsLoading(false);
    setResponse(null);
    setError(null);
  }, [topic]);

  // Re-run highlight.js after response is rendered.
  useEffect(() => {
    if (response && typeof response === 'string') {
        if ((window as any).hljs) {
            document.querySelectorAll('pre code').forEach((block) => {
                (window as any).hljs.highlightElement(block);
            });
        }
    }
  }, [response]);

  const handleActionClick = async (action: AssistantAction) => {
    // If the same action is clicked again, reset
    if (action === activeAction) {
        setActiveAction(null);
        setResponse(null);
        return;
    }

    setActiveAction(action);
    setIsLoading(true);
    setResponse(null);
    setError(null);

    try {
      let result;
      // The content can be a string or a React node. We need to handle the React node case.
      const contentAsString = typeof topic.content === 'string' ? topic.content : 'This module contains complex, non-text content.';
      
      if (action === 'tasks') {
        result = await geminiService.generateStudyTasksForModule(topic.title, contentAsString);
      } else {
        result = await geminiService.getModuleAssistantTextResponse(topic.title, contentAsString, action);
      }
      setResponse(result);
    } catch (err) {
      console.error(`Error with assistant action '${action}':`, err);
      setError('Sorry, an error occurred while fetching the response.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderResponse = () => {
    if (isLoading) {
      return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
    }
    if (error) {
      return <p className="text-red-400">{error}</p>;
    }
    if (!response) {
      return <p className="text-gray-400 text-center italic">Select an action above to get started.</p>;
    }
    if (typeof response === 'string') {
        const renderMarkdown = (text: string) => {
            let processedText = text;

            // 1. Placeholder for code blocks to protect them.
            const codeBlocks: { [key: string]: string } = {};
            let codeBlockId = 0;
            processedText = processedText.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
                const placeholder = `__CODEBLOCK_${codeBlockId++}__`;
                const language = lang || 'plaintext';
                const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                codeBlocks[placeholder] = `<pre><code class="language-${language}">${escapedCode.trim()}</code></pre>`;
                return placeholder;
            });

            // 2. Handle callouts
            processedText = processedText.replace(/^> \[!(note|tip|info|example|warning)\]- \*\*(.*?)\*\*\n?((?:^> .*\n?)*)/gm, (match, type, title, content) => {
                const calloutClass = `callout-${type}`;
                const cleanedContent = content.replace(/^> ?/gm, '');
                
                const innerHtml = cleanedContent.trim()
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/`([^`]+)`/g, '<code>$1</code>')
                    .replace(/\n/g, '<br />');

                return `<div class="not-prose callout ${calloutClass}"><strong class="callout-title">${title}</strong><div>${innerHtml}</div></div>`;
            });

            // 3. Process remaining content block by block
            const blocks = processedText.trim().split(/\n\s*\n/);
            processedText = blocks.map(block => {
                if (Object.keys(codeBlocks).some(key => block.trim() === key)) {
                    return block;
                }
                
                // Process lists
                if (block.match(/^\s*(\*|-|\d+\.)/)) {
                    const lines = block.split('\n');
                    const listItems = lines.map(line => `<li>${line.replace(/^\s*(\*|-|\d+\.)\s*/, '')}</li>`).join('');
                    const listType = (block.trim().startsWith('*') || block.trim().startsWith('-')) ? 'ul' : 'ol';
                    return `<${listType}>${listItems}</${listType}>`;
                }
                
                // Process paragraphs
                if (block) {
                     return `<p>${block}</p>`;
                }
                return '';
            }).join('');

            // 4. Process inline styling and line breaks within paragraphs
            processedText = processedText
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/`([^`]+)`/g, '<code>$1</code>')
              .replace(/<p>(.*?)<\/p>/g, (match, content) => `<p>${content.replace(/\n/g, '<br />')}</p>`);

            // 5. Restore code blocks
            for (const key in codeBlocks) {
                processedText = processedText.replace(key, codeBlocks[key]);
            }
            
            return processedText;
        };

      return <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(response) }} />;
    }
    if (Array.isArray(response)) {
      return (
        <div className="space-y-3">
            <h4 className="font-semibold text-lg text-rh-accent">Generated Tasks:</h4>
            {response.map((task, index) => (
                <div key={index} className="p-3 bg-rh-dark-gray/50 rounded-lg flex justify-between items-start gap-4">
                    <div>
                        <p className="font-bold text-rh-text">{task.title}</p>
                        <p className="text-sm text-gray-400">{task.description}</p>
                    </div>
                    <button 
                        onClick={() => onAddTaskToBoard(task)}
                        className="bg-rh-accent text-white px-3 py-1 rounded-md text-sm whitespace-nowrap hover:bg-rh-accent/80 flex-shrink-0"
                    >
                        Add to Board
                    </button>
                </div>
            ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-rh-medium-gray p-6 rounded-lg shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <BrainIcon className="text-rh-red w-8 h-8"/>
        <h2 className="text-2xl font-bold text-white">Module Assistant</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <button onClick={() => handleActionClick('explain')} className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-md transition-all ${activeAction === 'explain' ? 'bg-rh-red text-white scale-105' : 'bg-rh-light-gray hover:bg-rh-red/80'}`}>
          <LightbulbIcon />
          <span>Explain Concept</span>
        </button>
        <button onClick={() => handleActionClick('brainstorm')} className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-md transition-all ${activeAction === 'brainstorm' ? 'bg-rh-red text-white scale-105' : 'bg-rh-light-gray hover:bg-rh-red/80'}`}>
          <BrainIcon />
          <span>Best Practices</span>
        </button>
        <button onClick={() => handleActionClick('tasks')} className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-md transition-all ${activeAction === 'tasks' ? 'bg-rh-red text-white scale-105' : 'bg-rh-light-gray hover:bg-rh-red/80'}`}>
          <CheckSquareIcon />
          <span>Generate Tasks</span>
        </button>
      </div>
      <div className="bg-rh-dark-gray p-4 rounded-md min-h-[150px]">
        {renderResponse()}
      </div>
    </div>
  );
};