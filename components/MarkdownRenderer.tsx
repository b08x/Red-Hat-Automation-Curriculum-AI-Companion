import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LightbulbIcon, NoteIcon, InfoIcon, BrainIcon, WarningIcon, ChevronDownIcon } from './icons/Icons';

interface MarkdownRendererProps {
  content: string;
}

// Helper to recursively extract raw text from a React node
const getReactNodeText = (node: React.ReactNode): string => {
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(getReactNodeText).join('');
    if (React.isValidElement(node) && node.props.children) {
        return getReactNodeText(node.props.children);
    }
    return '';
}

const CalloutIcon: React.FC<{type: string}> = ({ type }) => {
    switch (type) {
        case 'note': return <NoteIcon className="w-5 h-5" />;
        case 'tip': return <LightbulbIcon className="w-5 h-5" />;
        case 'info': return <InfoIcon className="w-5 h-5" />;
        case 'example': return <BrainIcon className="w-5 h-5" />;
        case 'warning': return <WarningIcon className="w-5 h-5" />;
        default: return null;
    }
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <ReactMarkdown
      children={content}
      remarkPlugins={[remarkGfm]}
      className="prose prose-invert max-w-none prose-h1:text-rh-red prose-h2:text-rh-accent prose-h2:border-b prose-h2:border-rh-light-gray prose-h2:pb-2 prose-strong:text-white prose-a:text-rh-accent hover:prose-a:text-rh-red prose-pre:bg-rh-dark-gray prose-code:text-rh-text"
      components={{
        blockquote: ({ node, children }) => {
          // Check the first paragraph of the blockquote for our custom syntax.
          const firstChild = React.Children.toArray(children).find(child => (child as any)?.type === 'p');
          if (firstChild) {
            const textContent = getReactNodeText(firstChild);
            const match = textContent.trim().match(/^\[!(note|tip|info|example|warning)\]-\s*\*\*(.*)\*\*/);

            if (match) {
              const type = match[1];
              const title = match[2];
              
              // Filter out the title paragraph from the children
              const contentChildren = React.Children.toArray(children).filter(c => c !== firstChild);

              return (
                <details className={`not-prose callout callout-${type}`} open>
                  <summary>
                    <CalloutIcon type={type} />
                    <span>{title}</span>
                    <ChevronDownIcon className="dropdown-chevron w-5 h-5" />
                  </summary>
                  <div className="callout-content">
                    {contentChildren}
                  </div>
                </details>
              );
            }
          }
          // Fallback for standard blockquotes
          return <blockquote className="border-l-4 border-rh-light-gray pl-4 italic">{children}</blockquote>;
        },
      }}
    />
  );
};