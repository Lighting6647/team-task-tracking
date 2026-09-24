import React, { useState, useEffect, useRef } from 'react';
import { FiSave, FiFileText, FiCheck, FiRefreshCw, FiX } from 'react-icons/fi';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const DocumentView = ({ board, updateDocument, onClose }) => {
  const [content, setContent] = useState(board.content || '');
  const [saveStatus, setSaveStatus] = useState('');
  const timeoutRef = useRef(null);
  const isFirstRender = useRef(true);

  // Load content when switching boards
  useEffect(() => {
    setContent(board.content || '');
    isFirstRender.current = true;
  }, [board.id]);

  // Auto-save logic
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    setSaveStatus('Saving...');
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      try {
        updateDocument(board.id, content);
        setSaveStatus('Saved!');
        setTimeout(() => setSaveStatus(''), 2000);
      } catch (error) {
        setSaveStatus('Error saving');
        console.error(error);
      }
    }, 1500); // Debounce 1.5s
    
    return () => clearTimeout(timeoutRef.current);
  }, [content, board.id]);

  const handleManualSave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    try {
      updateDocument(board.id, content);
      setSaveStatus('Saved!');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      setSaveStatus('Error saving');
      console.error(error);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ]
  };

  return (
    <div className="document-view-container" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: 'var(--text-main)' }}>
          <FiFileText color="var(--accent-purple)" /> Document Editor
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button 
            className="btn-outline" 
            onClick={onClose}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              color: 'var(--text-muted)'
            }}
          >
            <FiX /> Close
          </button>
          <button 
            className="btn-primary" 
            onClick={handleManualSave}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              background: saveStatus === 'Saved!' ? 'var(--success-color, #00c875)' : '',
              transition: 'background 0.3s'
            }}
          >
            {saveStatus === 'Saving...' ? <FiRefreshCw className="spin" /> : saveStatus === 'Saved!' ? <FiCheck /> : <FiSave />} 
            {saveStatus === 'Saving...' ? 'Saving...' : saveStatus === 'Saved!' ? 'Saved ✓' : 'Save'}
          </button>
        </div>
      </div>
      
      <div style={{ 
        flex: 1, 
        background: 'rgba(29, 30, 47, 0.4)', 
        backdropFilter: 'blur(24px)', 
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <style>
          {`
            .ql-toolbar.ql-snow {
              border: none !important;
              border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
              padding: 12px !important;
            }
            .ql-container.ql-snow {
              border: none !important;
              flex: 1;
              font-family: inherit;
              font-size: 1rem;
              color: var(--text-main);
              overflow-y: auto;
            }
            .ql-editor {
              padding: 2rem !important;
              min-height: 100%;
            }
            .ql-snow .ql-stroke {
              stroke: var(--text-muted);
            }
            .ql-snow .ql-fill, .ql-snow .ql-stroke.ql-fill {
              fill: var(--text-muted);
            }
            .ql-snow .ql-picker {
              color: var(--text-muted);
            }
            .ql-snow.ql-toolbar button:hover .ql-stroke, .ql-snow .ql-toolbar button:hover .ql-stroke, .ql-snow.ql-toolbar button:focus .ql-stroke, .ql-snow .ql-toolbar button:focus .ql-stroke, .ql-snow.ql-toolbar button.ql-active .ql-stroke, .ql-snow .ql-toolbar button.ql-active .ql-stroke, .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke, .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke, .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke, .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke, .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke, .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke, .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke, .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke, .ql-snow.ql-toolbar button:hover .ql-stroke-miter, .ql-snow .ql-toolbar button:hover .ql-stroke-miter, .ql-snow.ql-toolbar button:focus .ql-stroke-miter, .ql-snow .ql-toolbar button:focus .ql-stroke-miter, .ql-snow.ql-toolbar button.ql-active .ql-stroke-miter, .ql-snow .ql-toolbar button.ql-active .ql-stroke-miter, .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke-miter, .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke-miter, .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter, .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter, .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke-miter, .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke-miter, .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter, .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter {
              stroke: var(--accent-blue);
            }
            .ql-snow.ql-toolbar button:hover .ql-fill, .ql-snow .ql-toolbar button:hover .ql-fill, .ql-snow.ql-toolbar button:focus .ql-fill, .ql-snow .ql-toolbar button:focus .ql-fill, .ql-snow.ql-toolbar button.ql-active .ql-fill, .ql-snow .ql-toolbar button.ql-active .ql-fill, .ql-snow.ql-toolbar .ql-picker-label:hover .ql-fill, .ql-snow .ql-toolbar .ql-picker-label:hover .ql-fill, .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-fill, .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-fill, .ql-snow.ql-toolbar .ql-picker-item:hover .ql-fill, .ql-snow .ql-toolbar .ql-picker-item:hover .ql-fill, .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-fill, .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-fill, .ql-snow.ql-toolbar button:hover .ql-stroke.ql-fill, .ql-snow .ql-toolbar button:hover .ql-stroke.ql-fill, .ql-snow.ql-toolbar button:focus .ql-stroke.ql-fill, .ql-snow .ql-toolbar button:focus .ql-stroke.ql-fill, .ql-snow.ql-toolbar button.ql-active .ql-stroke.ql-fill, .ql-snow .ql-toolbar button.ql-active .ql-stroke.ql-fill, .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke.ql-fill, .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke.ql-fill, .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke.ql-fill, .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke.ql-fill, .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke.ql-fill, .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke.ql-fill, .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke.ql-fill, .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke.ql-fill {
              fill: var(--accent-blue);
            }
            .ql-snow .ql-picker.ql-expanded .ql-picker-label {
              border-color: rgba(255,255,255,0.1);
            }
            .ql-snow .ql-picker-options {
              background-color: var(--bg-glass);
              border-color: rgba(255,255,255,0.1);
              backdrop-filter: blur(16px);
            }
            .ql-editor.ql-blank::before {
              color: rgba(255,255,255,0.3) !important;
              font-style: normal;
            }
          `}
        </style>
        <ReactQuill 
          theme="snow" 
          value={content} 
          onChange={setContent} 
          modules={modules}
          placeholder="Start typing your document here... (Rich Text supported)"
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        />
      </div>
    </div>
  );
};

export default DocumentView;
