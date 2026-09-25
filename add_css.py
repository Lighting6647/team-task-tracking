with open('src/index.css', 'a', encoding='utf-8') as f:
    f.write("""
/* Monday.com Specific Layout */
.top-navbar {
  height: 48px;
  background-color: #292A36;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  padding: 0 1rem;
  justify-content: space-between;
}
.board-header {
  padding: 1.5rem 2rem 0;
  background-color: var(--bg-main);
}
.board-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.board-title {
  font-size: 1.75rem;
  font-weight: 500;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.board-tabs {
  display: flex;
  gap: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}
.board-tab {
  padding: 0.5rem 0;
  color: var(--text-muted);
  cursor: pointer;
  position: relative;
  font-size: 0.9rem;
}
.board-tab.active {
  color: var(--text-main);
}
.board-tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--accent-blue);
}
.board-toolbar {
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: var(--bg-main);
}
.toolbar-btn {
  background: transparent;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
}
.toolbar-btn:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-main);
  box-shadow: none;
}
.btn-outline:hover {
  background: var(--bg-hover);
  border-color: var(--text-muted);
}

.group-header {
  color: var(--text-main);
}
.add-item-row td {
  border-bottom: 1px solid var(--border-color) !important;
}

.global-nav-icon {
  color: var(--text-muted);
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.global-nav-icon:hover {
  background-color: var(--bg-hover);
  color: var(--text-main);
}
""")
