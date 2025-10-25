
import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { CloseIcon, TargetIcon, LoadingSpinner, BrainIcon } from './icons/Icons';

interface ObjectiveAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    category: string;
    moduleTitle: string;
    moduleContent: string;
  } | null;
}

export const ObjectiveAssistantModal: React.FC<ObjectiveAssistantModalProps> = ({ isOpen, onClose, data }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when modal is closed or data changes
    if (!isOpen) {
      setResponse(null);
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);
  
  // Re-run highlight.js when response content changes
  useEffect(() => {
    if (response) {
      if ((window as any).hljs) {
          document.querySelectorAll('pre code').forEach((block) => {
              (window as any).hljs.highlightElement(block);
          });
      }
    }
  }, [response]);

  const handleGenerate = async () => {
    if (!data) return;

    setIsLoading(true);
    setResponse(null);
    setError(null);

    try {
      const result = await geminiService.generateObjectiveTasks(
        data.category,
        data.moduleTitle,
        data.moduleContent
      );
      setResponse(result);
    } catch (err) {
      console.error('Error generating objective tasks:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
    const renderMarkdown = (text: string) => {
        let processedText = text;
        
        const codeBlocks: string[] = [];
        processedText = processedText.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            const placeholder = `__CODEBLOCK_${codeBlocks.length}__`;
            const language = lang || 'plaintext';
            const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            codeBlocks.push(`<pre class="bg-rh-dark-gray p-4 rounded-md"><code class="language-${language}">${escapedCode.trim()}</code></pre>`);
            return placeholder;
        });
        
        processedText = processedText.replace(/^> \[!(note|tip|info|example|warning)\]- \*\*(.*?)\*\*\n?((?:> .*\n?)*)/gm, (match, type, title, content) => {
            const calloutClass = `callout-${type}`;
            const cleanedContent = content.replace(/^> /gm, '').replace(/^>/gm, '');
            return `<div class="not-prose callout ${calloutClass}"><strong class="callout-title">${title}</strong><div>${cleanedContent.replace(/\n/g, '<br />')}</div></div>`;
        });
        
        processedText = processedText.replace(/\n/g, '<br />');

        processedText = processedText.replace(/__CODEBLOCK_(\d+)__/g, (match, index) => {
            return codeBlocks[parseInt(index, 10)] || '';
        });

        return { __html: processedText };
    };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-rh-medium-gray rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b border-rh-light-gray">
          <div className="flex items-center gap-3">
            <TargetIcon className="text-rh-accent" />
            <h2 className="text-xl font-bold text-white">Objective Assistant</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-rh-dark-gray/50">
            <CloseIcon />
          </button>
        </header>
        <main className="p-6 flex-1 overflow-y-auto">
          <div className="bg-rh-dark-gray p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-400">Learning Objective:</p>
            <p className="font-semibold text-rh-text">{data?.category}</p>
            <p className="text-sm text-gray-400 mt-2">Module Context:</p>
            <p className="font-semibold text-rh-text">{data?.moduleTitle}</p>
          </div>

          {!response && !isLoading && (
            <div className="text-center">
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="mt-4 inline-flex items-center justify-center px-6 py-3 bg-rh-accent text-white rounded-md hover:bg-rh-accent/80 disabled:bg-rh-light-gray"
              >
                 <BrainIcon /> <span className="ml-2">Generate Practice Tasks</span>
              </button>
            </div>
          )}
          
          {isLoading && <div className="flex justify-center p-8"><LoadingSpinner /></div>}
          {error && <p className="text-red-400 text-center">{error}</p>}

          {response && (
             <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={renderMarkdown(response)} />
          )}
        </main>
      </div>
    </div>
  );
};