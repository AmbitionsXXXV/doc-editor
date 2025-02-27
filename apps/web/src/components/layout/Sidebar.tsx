import React from 'react';
import { Button } from '@doc-editor/ui';

interface Document {
  id: string;
  title: string;
}

interface SidebarProps {
  documents: Document[];
  activeDocumentId?: string;
  onDocumentSelect: (id: string) => void;
  onCreateDocument: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  documents,
  activeDocumentId,
  onDocumentSelect,
  onCreateDocument,
}) => {
  return (
    <div className="w-64 border-r border-gray-200 dark:border-gray-800 h-[calc(100vh-64px)] p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Documents</h2>
        <Button size="sm" onClick={onCreateDocument}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 mr-1"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New
        </Button>
      </div>
      <div className="space-y-1">
        {documents.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No documents yet. Create one to get started.
          </p>
        ) : (
          documents.map((doc) => (
            <button
              key={doc.id}
              className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                activeDocumentId === doc.id
                  ? 'bg-gray-100 dark:bg-gray-800 font-medium'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-900'
              }`}
              onClick={() => onDocumentSelect(doc.id)}
            >
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <line x1="10" y1="9" x2="8" y2="9" />
                </svg>
                {doc.title}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;
