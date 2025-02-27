import React, { useState, useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

export interface EditorProps {
  documentId: string;
  initialContent?: string;
  readOnly?: boolean;
  onChange?: (content: string) => void;
  userName?: string;
  userColor?: string;
}

export const Editor: React.FC<EditorProps> = ({
  documentId,
  initialContent = '',
  readOnly = false,
  onChange,
  userName = 'Anonymous',
  userColor = '#' + Math.floor(Math.random() * 16777215).toString(16),
}) => {
  // Create a Yjs document
  const [ydoc] = useState(() => new Y.Doc());
  
  // Set up the collaboration provider
  const [provider] = useState(() => {
    // For production, you would use a Hocuspocus server
    // return new HocuspocusProvider({
    //   url: 'wss://your-hocuspocus-server.com',
    //   name: documentId,
    //   document: ydoc,
    // });
    
    // For development, we use WebRTC
    return new WebrtcProvider(`doc-editor-${documentId}`, ydoc, {
      signaling: ['wss://signaling.yjs.dev'],
    });
  });

  // Set up the editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider,
        user: {
          name: userName,
          color: userColor,
        },
      }),
    ],
    content: initialContent,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
  });

  // Clean up when the component unmounts
  useEffect(() => {
    return () => {
      provider.destroy();
      ydoc.destroy();
    };
  }, [provider, ydoc]);

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="editor-container">
      <EditorContent editor={editor} />
    </div>
  );
};

export default Editor;
