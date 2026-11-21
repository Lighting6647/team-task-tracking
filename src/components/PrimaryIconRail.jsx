import React from 'react';
import {
  FiLayers,
  FiHome,
  FiCheckSquare,
  FiInbox,
  FiVideo,
  FiCopy,
  FiSearch,
  FiTrash2,
  FiCloud,
  FiChevronsLeft,
  FiChevronsRight,
} from 'react-icons/fi';

const PrimaryIconRail = ({
  activeSpecialView,
  isSidebarCollapsed,
  onToggleSidebarCollapse,
  onSelectHome,
  onSelectSpecialView,
  onOpenTemplates,
  onOpenGlobalSearch,
  onOpenCloudSync,
  syncStatus = 'local',
  trashCount = 0,
}) => {
  const navItems = [
    {
      id: 'workspace-overview',
      label: 'Workspace',
      icon: <FiLayers size={18} />,
      active: activeSpecialView === 'workspace-overview',
      onClick: () => onSelectSpecialView('workspace-overview'),
    },
    {
      id: 'home',
      label: 'Boards',
      icon: <FiHome size={18} />,
      active: !activeSpecialView,
      onClick: onSelectHome,
    },
    {
      id: 'my-work',
      label: 'My Work',
      icon: <FiCheckSquare size={18} />,
      active: activeSpecialView === 'my-work',
      onClick: () => onSelectSpecialView('my-work'),
    },
    {
      id: 'inbox',
      label: 'Inbox',
      icon: <FiInbox size={18} />,
      active: activeSpecialView === 'inbox',
      onClick: () => onSelectSpecialView('inbox'),
    },
    {
      id: 'ai-notetaker',
      label: 'Notetaker',
      icon: <FiVideo size={18} />,
      active: activeSpecialView === 'ai-notetaker',
      onClick: () => onSelectSpecialView('ai-notetaker'),
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: <FiCopy size={18} />,
      active: false,
      onClick: onOpenTemplates,
    },
  ];

  const syncDotColor =
    syncStatus === 'synced'
      ? '#00c875'
      : syncStatus === 'syncing'
        ? '#0073ea'
        : syncStatus === 'error'
          ? '#e2445c'
          : '#94a3b8';

  return (
    <nav className="primary-icon-rail" aria-label="Primary Icon Rail">
      <div className="primary-icon-rail-top">
        <button
          type="button"
          className="rail-btn"
          onClick={onOpenGlobalSearch}
          title="Search everything (Ctrl+K)"
          aria-label="Global Search"
        >
          <FiSearch size={18} />
          <span className="rail-label">Search</span>
        </button>

        <div className="rail-divider" />

        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`rail-btn ${item.active ? 'active' : ''}`}
            onClick={item.onClick}
            title={item.label}
            aria-label={item.label}
          >
            {item.icon}
            <span className="rail-label">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="primary-icon-rail-bottom">
        <button
          type="button"
          className={`rail-btn ${activeSpecialView === 'trash-archive' ? 'active' : ''}`}
          onClick={() => onSelectSpecialView('trash-archive')}
          title="Trash & Archive"
          aria-label="Trash and Archive"
          style={{ position: 'relative' }}
        >
          <FiTrash2 size={17} />
          <span className="rail-label">Trash</span>
          {trashCount > 0 && <span className="rail-badge">{trashCount}</span>}
        </button>

        <button
          type="button"
          className="rail-btn"
          onClick={onOpenCloudSync}
          title={`Cloud Sync (${syncStatus})`}
          aria-label="Cloud Sync Settings"
          style={{ position: 'relative' }}
        >
          <FiCloud size={17} color={syncDotColor} />
          <span className="rail-label">Sync</span>
          <span
            style={{
              position: 'absolute',
              top: '7px',
              right: '11px',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: syncDotColor,
            }}
          />
        </button>

        <button
          type="button"
          className="rail-btn"
          onClick={onToggleSidebarCollapse}
          title={isSidebarCollapsed ? 'ขยายแถบ Workspace' : 'ย่อแถบ Workspace'}
          aria-label={isSidebarCollapsed ? 'Expand workspace sidebar' : 'Collapse workspace sidebar'}
        >
          {isSidebarCollapsed ? <FiChevronsRight size={18} /> : <FiChevronsLeft size={18} />}
          <span className="rail-label">{isSidebarCollapsed ? 'Open' : 'Hide'}</span>
        </button>
      </div>
    </nav>
  );
};

export default PrimaryIconRail;
