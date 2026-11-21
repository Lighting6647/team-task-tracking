import React from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

export const ViewSkeleton = ({ label = 'กำลังโหลดมุมมอง...' }) => (
  <div
    role="status"
    aria-label={label}
    style={{
      flex: 1,
      padding: '1.75rem 2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      backgroundColor: 'var(--bg-main)',
    }}
  >
    <div style={{ height: '28px', width: '240px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', opacity: 0.7 }} />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
      {[1, 2, 3].map((n) => (
        <div key={n} style={{ height: '110px', borderRadius: '10px', backgroundColor: 'var(--bg-secondary)', opacity: 0.55 }} />
      ))}
    </div>
    <div style={{ height: '220px', borderRadius: '10px', backgroundColor: 'var(--bg-secondary)', opacity: 0.45 }} />
  </div>
);

export class ViewErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || 'เกิดข้อผิดพลาดในการแสดงผล' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--text-primary)',
            gap: '0.75rem',
          }}
        >
          <FiAlertTriangle size={34} color="#fdab3d" />
          <strong style={{ fontSize: '1rem' }}>ไม่สามารถโหลดหน้านี้ได้ชั่วคราว</strong>
          <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>{this.state.errorMessage}</span>
          <button
            type="button"
            className="btn-primary"
            onClick={() => this.setState({ hasError: false, errorMessage: '' })}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.9rem', borderRadius: '8px' }}
          >
            <FiRefreshCw size={14} /> ลองใหม่อีกครั้ง
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
