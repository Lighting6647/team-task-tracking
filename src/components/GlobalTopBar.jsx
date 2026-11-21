import React from 'react';
import {
  FiSearch,
  FiInbox,
  FiUserPlus,
  FiCloud,
  FiSun,
  FiMoon,
  FiZap,
} from 'react-icons/fi';
import NotificationCenter from './NotificationCenter';

const GlobalTopBar = ({
  theme,
  onToggleTheme,
  notifications = [],
  onMarkAllNotificationsRead,
  onOpenGlobalSearch,
  onOpenInbox,
  onOpenWorkspaceOverview,
  onOpenAuth,
  onOpenCloudSync,
  onToggleAiCopilot,
  currentUser,
  syncStatus = 'local',
}) => {
  const syncColor =
    syncStatus === 'synced'
      ? '#00c875'
      : syncStatus === 'syncing'
        ? '#0073ea'
        : syncStatus === 'error'
          ? '#e2445c'
          : 'var(--text-muted)';

  return (
    <header className="global-top-bar" role="banner" aria-label="Global navigation bar">
      {/* Left: Brand Logo */}
      <div className="global-top-bar-left">
        <button
          type="button"
          className="global-brand-btn"
          onClick={onOpenWorkspaceOverview}
          title="กลับไปยัง Workspace Overview"
        >
          <span className="global-brand-mark" aria-hidden="true">
            <span style={{ backgroundColor: '#ff3d57' }} />
            <span style={{ backgroundColor: '#ffcb00' }} />
            <span style={{ backgroundColor: '#00ca72' }} />
          </span>
          <span className="global-brand-text">LightBeam OS</span>
        </button>
      </div>

      {/* Center: Search Everything Pill (Ctrl+K) */}
      <div className="global-top-bar-center">
        <button
          type="button"
          className="global-search-pill"
          onClick={onOpenGlobalSearch}
          aria-label="Search everything"
        >
          <FiSearch size={15} />
          <span className="global-search-placeholder">Search for anything...</span>
          <span className="global-search-kbd">Ctrl K</span>
        </button>
      </div>

      {/* Right: Tools & User Avatar */}
      <div className="global-top-bar-right">
        <NotificationCenter
          notifications={notifications}
          onMarkAllRead={onMarkAllNotificationsRead}
        />

        <button
          type="button"
          className="global-icon-btn"
          onClick={onOpenInbox}
          title="Update feed (Inbox)"
          aria-label="Open Update feed"
        >
          <FiInbox size={17} />
        </button>

        <button
          type="button"
          className="global-icon-btn"
          onClick={onOpenAuth}
          title="เชิญสมาชิก & จัดการสิทธิ์ (Invite & Permissions)"
          aria-label="Invite members and permissions"
        >
          <FiUserPlus size={17} />
        </button>

        <button
          type="button"
          className="global-icon-btn"
          onClick={onOpenCloudSync}
          title={`Cloud Sync (${syncStatus})`}
          aria-label="Open Cloud Sync"
          style={{ position: 'relative' }}
        >
          <FiCloud size={17} color={syncColor} />
        </button>

        <button
          type="button"
          className="global-icon-btn"
          onClick={onToggleAiCopilot}
          title="AI Sidekick / Copilot"
          aria-label="Toggle AI Copilot"
        >
          <FiZap size={17} color="#0073ea" />
        </button>

        <button
          type="button"
          className="global-icon-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'สลับเป็น Light Mode' : 'สลับเป็น Dark Mode'}
          aria-label="Toggle Light and Dark theme"
        >
          {theme === 'dark' ? <FiSun size={17} color="#fdab3d" /> : <FiMoon size={17} color="#676879" />}
        </button>

        <button
          type="button"
          className="global-avatar-btn"
          onClick={onOpenAuth}
          title={`${currentUser?.name || 'User'} (${currentUser?.role || 'Owner'})`}
          aria-label="User menu"
        >
          {(currentUser?.name || 'U').charAt(0).toUpperCase()}
        </button>
      </div>
    </header>
  );
};

export default GlobalTopBar;
