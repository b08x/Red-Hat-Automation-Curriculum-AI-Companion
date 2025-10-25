
import React from 'react';

export const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  />
);

export const ChatIcon = () => <Icon><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></Icon>;
export const SendIcon = () => <Icon><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></Icon>;
export const CloseIcon = () => <Icon><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Icon>;
export const MicIcon = () => <Icon><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></Icon>;
export const BrainIcon = () => <Icon><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v1.13a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5V4.5A2.5 2.5 0 0 1 17.5 2h.5a2.5 2.5 0 0 1 2.5 2.5v15A2.5 2.5 0 0 1 18 22h-1a2.5 2.5 0 0 1-2.5-2.5v-1.13a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 0-.5.5V19.5A2.5 2.5 0 0 1 9 22H8a2.5 2.5 0 0 1-2.5-2.5v-15A2.5 2.5 0 0 1 8 2h1.5Z" /><path d="M12 7.3V10" /><path d="M12 15v1.7" /><path d="M14.5 9.5v3" /><path d="m9.5 9.5 2.5 2.5" /><path d="m14.5 12.5-2.5 2.5" /></Icon>;
export const SearchIcon = () => <Icon><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></Icon>;
export const StopIcon = () => <Icon><rect x="6" y="6" width="12" height="12" /></Icon>;
export const VideoIcon = () => <Icon><path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2" ry="2"/></Icon>;
export const BookOpenIcon = () => <Icon><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></Icon>;
export const ColumnsIcon = () => <Icon><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="12" y1="3" x2="12" y2="21" /></Icon>;
export const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path d="m9 18 6-6-6-6" /></Icon>;
export const PencilIcon = () => <Icon width="16" height="16"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></Icon>;
export const TrashIcon = () => <Icon width="16" height="16"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6m4-6v6" /></Icon>;
export const LoadingSpinner = () => (
    <div className="flex items-center space-x-2">
      <div className="w-2 h-2 rounded-full bg-rh-accent animate-pulse"></div>
      <div className="w-2 h-2 rounded-full bg-rh-accent animate-pulse [animation-delay:0.2s]"></div>
      <div className="w-2 h-2 rounded-full bg-rh-accent animate-pulse [animation-delay:0.4s]"></div>
    </div>
);