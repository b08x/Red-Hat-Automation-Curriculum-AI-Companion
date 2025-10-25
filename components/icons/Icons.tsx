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
export const DatabaseIcon = () => <Icon><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></Icon>;
export const UploadIcon = () => <Icon><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></Icon>;
export const LightbulbIcon = () => <Icon><path d="M15.09 16.5c.34-.59.51-1.26.51-1.97C15.6 12.03 14 11 12 11s-3.6 1.03-3.6 3.53c0 .71.17 1.38.51 1.97" /><path d="M12 2a7 7 0 0 0-7 7c0 2.35 1.25 4.37 3.09 5.5" /><path d="M8.5 17a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 0-.5.5v1Z" /><path d="M12 21.5a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h0a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5Z" /></Icon>;
export const CheckSquareIcon = () => <Icon><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></Icon>;
export const TargetIcon = () => <Icon><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></Icon>;
export const DownloadIcon = () => <Icon width="16" height="16"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></Icon>;
export const InfoIcon = () => <Icon><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></Icon>;
export const NoteIcon = () => <Icon><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></Icon>;
export const WarningIcon = () => <Icon><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></Icon>;
export const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path d="m6 9 6 6 6-6"/></Icon>;

export const LoadingSpinner = () => (
    <div className="flex items-center space-x-2">
      <div className="w-2 h-2 rounded-full bg-rh-accent animate-pulse"></div>
      <div className="w-2 h-2 rounded-full bg-rh-accent animate-pulse [animation-delay:0.2s]"></div>
      <div className="w-2 h-2 rounded-full bg-rh-accent animate-pulse [animation-delay:0.4s]"></div>
    </div>
);