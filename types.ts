import React from 'react';

export interface RelatedTopicLink {
  part: string;
  topic: string;
}

export interface InteractiveTableContent {
  type: 'interactiveTable';
  headers: string[];
  rows: (string | React.ReactNode)[][];
  fileName: string;
}

export interface CurriculumTopic {
  title: string;
  content: string | React.ReactNode | InteractiveTableContent;
  related?: RelatedTopicLink[];
}

export interface CurriculumPart {
  title: string;
  description: string;
  modules?: CurriculumTopic[];
  labs?: CurriculumTopic[];
  objectiveMapping?: {
    category: string;
    module: string;
  }[];
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  sources?: any[];
}

export type TaskStatus = 'todo' | 'inprogress' | 'done';

export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  tags?: string[];
  color: string;
}

export interface KanbanColumn {
  id: TaskStatus;
  title:string;
  tasks: KanbanTask[];
}

export interface BoardState {
  todo: KanbanColumn;
  inprogress: KanbanColumn;
  done: KanbanColumn;
}