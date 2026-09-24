import React, { useState } from 'react';
import { FiSend, FiCheckCircle } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';

const FormView = ({ board, addItem, updateItem }) => {
  const [formData, setFormData] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) return;
    
    const firstGroupId = board.groups[0]?.id;
    if (firstGroupId) {
      const newItemId = addItem(firstGroupId, formData.title);
      // Wait for React to process, then update the rest of the fields
      setTimeout(() => {
        const itemKeys = Object.keys(formData);
        itemKeys.forEach(key => {
          if (key !== 'title') {
            updateItem(firstGroupId, newItemId, key, formData[key]);
          }
        });
      }, 100);

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({});
      }, 3000);
    }
  };

  if (submitted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2rem' }}>
        <FiCheckCircle size={64} color="var(--success-color, #00c875)" style={{ marginBottom: '1rem' }} />
        <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>Thank you!</h2>
        <p style={{ color: 'var(--text-muted)' }}>Your response has been submitted successfully.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem', height: '100%', overflowY: 'auto' }}>
      <div style={{ 
        width: '100%', maxWidth: '600px', 
        background: 'rgba(29, 30, 47, 0.4)', 
        backdropFilter: 'blur(24px)', 
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '2rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        height: 'fit-content'
      }}>
        <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem', textAlign: 'center' }}>{board.title} Form</h2>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2rem' }}>Fill out the details below to add a new item.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: 'var(--text-main)', fontWeight: 500 }}>Item Name *</label>
            <input 
              type="text" 
              required
              placeholder="Enter item name..."
              value={formData.title || ''}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              style={{
                padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', 
                background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', outline: 'none'
              }}
            />
          </div>

          {board.columns.map(col => {
            if (col.type === 'timeline') return null;
            return (
              <div key={col.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: 'var(--text-main)', fontWeight: 500 }}>{col.title}</label>
                
                {col.type === 'status' ? (
                  <select 
                    value={formData[col.id] || ''}
                    onChange={(e) => setFormData({...formData, [col.id]: e.target.value})}
                    style={{
                      padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', 
                      background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', outline: 'none'
                    }}
                  >
                    <option value="">Select option...</option>
                    {(col.options || []).map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                ) : col.type === 'date' ? (
                  <input 
                    type="date"
                    value={formData[col.id] || ''}
                    onChange={(e) => setFormData({...formData, [col.id]: e.target.value})}
                    style={{
                      padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', 
                      background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', outline: 'none'
                    }}
                  />
                ) : col.type === 'number' ? (
                  <input 
                    type="number"
                    value={formData[col.id] || ''}
                    onChange={(e) => setFormData({...formData, [col.id]: e.target.value})}
                    style={{
                      padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', 
                      background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', outline: 'none'
                    }}
                  />
                ) : (
                  <input 
                    type="text"
                    value={formData[col.id] || ''}
                    onChange={(e) => setFormData({...formData, [col.id]: e.target.value})}
                    style={{
                      padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', 
                      background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', outline: 'none'
                    }}
                  />
                )}
              </div>
            );
          })}

          <button 
            type="submit"
            className="btn-primary" 
            style={{ padding: '1rem', marginTop: '1rem', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
          >
            <FiSend /> Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormView;
