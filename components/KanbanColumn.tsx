
import React from 'react';
import { KanbanCard } from './KanbanCard';
import { KanbanColumn as KanbanColumnType, KanbanTask, TaskStatus } from '../types';
import { DownloadIcon } from './icons/Icons';

interface InteractiveTableProps {
    headers: string[];
    rows: (string | React.ReactNode)[][];
    fileName: string;
}

const getCellText = (cell: string | React.ReactNode): string => {
    if (typeof cell === 'string') return cell;
    if (typeof cell === 'number' || typeof cell === 'boolean') return String(cell);
    if (!cell) return '';

    if (React.isValidElement(cell)) {
        const { children } = cell.props;
        if (children) {
            if (Array.isArray(children)) {
                return children.map(getCellText).join('');
            }
            return getCellText(children);
        }
    }
    return '';
}

export const InteractiveTable: React.FC<InteractiveTableProps> = ({ headers, rows, fileName }) => {
    const exportToCsv = () => {
        const headerRow = headers.join(',');
        const bodyRows = rows.map(row => 
            row.map(cell => {
                const text = getCellText(cell).trim();
                const escaped = ('' + text).replace(/"/g, '""');
                return `"${escaped}"`;
            }).join(',')
        ).join('\n');
        
        const csvString = `${headerRow}\n${bodyRows}`;
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-rh-medium-gray rounded-lg shadow-lg overflow-hidden not-prose">
            <div className="p-4 flex justify-end">
                <button 
                    onClick={exportToCsv}
                    className="flex items-center gap-2 px-3 py-1 bg-rh-accent text-white rounded-md hover:bg-rh-accent/80 text-sm"
                >
                    <DownloadIcon />
                    <span>Export CSV</span>
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-rh-light-gray">
                    <thead className="bg-rh-red/20">
                        <tr>
                            {headers.map(header => (
                                <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-bold text-rh-red uppercase tracking-wider">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-rh-light-gray">
                        {rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-rh-light-gray/50 transition-colors">
                                {row.map((cell, cellIndex) => (
                                    <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-rh-text">{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


interface KanbanColumnProps {
  column: KanbanColumnType;
  onDrop: (taskId: string, newStatus: TaskStatus) => void;
  onAddTask: () => void;
  onUpdateTask: (task: KanbanTask) => void;
  onDeleteTask: (taskId: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, onDrop, onAddTask, onUpdateTask, onDeleteTask }) => {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    onDrop(taskId, column.id);
  };

  return (
    <div 
      className="bg-rh-medium-gray rounded-lg p-4 flex flex-col h-full"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-white">{column.title} <span className="text-sm font-normal text-gray-400">{column.tasks.length}</span></h3>
        <button onClick={onAddTask} className="text-2xl text-gray-400 hover:text-white">+</button>
      </div>
      <div className="space-y-4 overflow-y-auto flex-grow min-h-[200px]">
        {column.tasks.map(task => (
          <KanbanCard 
            key={task.id} 
            task={task} 
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </div>
    </div>
  );
};