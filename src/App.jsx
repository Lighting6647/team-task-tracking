import { 
  FiMoreHorizontal, FiSearch, FiFilter, FiArrowDown, FiEyeOff, FiUsers, 
  FiSettings, FiMenu, FiSun, FiMoon, FiUpload, FiX, FiCopy, FiPrinter, FiLayers, FiPlus, FiCoffee 
} from 'react-icons/fi';
import React, { useState, useEffect, useRef, useMemo, Suspense, lazy } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from './components/Sidebar';
import TableView from './components/TableView';
import KanbanView from './components/KanbanView';
import FormView from './components/FormView';
import TaskDrawer from './components/TaskDrawer';
import MyWorkView from './components/MyWorkView';
import AiNotetakerView from './components/AiNotetakerView';
import AiCopilot from './components/AiCopilot';
import NotificationCenter from './components/NotificationCenter';
import IntegrationsModal from './components/IntegrationsModal';
import AutomationsModal from './components/AutomationsModal';
import MobileBottomNav from './components/MobileBottomNav';
import GlobalSearchModal from './components/GlobalSearchModal';
import InboxView from './components/InboxView';
import TemplateCenterModal from './components/TemplateCenterModal';
import TrashArchiveView from './components/TrashArchiveView';
import PrimaryIconRail from './components/PrimaryIconRail';
import GlobalTopBar from './components/GlobalTopBar';
import CloudSyncModal from './components/CloudSyncModal';
import AuthPermissionsModal from './components/AuthPermissionsModal';
import { ViewSkeleton, ViewErrorBoundary } from './components/ViewFallback';
import { DEFAULT_WORKSPACES } from './utils/workspaceTemplates';
import { loadCurrentUser, saveCurrentUser, getPermissions } from './utils/authPermissions';
import {
  loadCloudConfig,
  saveCloudConfig,
  isCloudConfigured,
  pushStateToCloud,
  pullStateFromCloud,
  getLastSyncTime,
} from './utils/cloudSync';

// Code Splitting: heavy views are loaded on demand (recharts, rich text, timeline, calendar)
const DashboardView = lazy(() => import('./components/DashboardView'));
const DocumentView = lazy(() => import('./components/DocumentView'));
const GanttView = lazy(() => import('./components/GanttView'));
const CalendarView = lazy(() => import('./components/CalendarView'));
const PresentationView = lazy(() => import('./components/PresentationView'));
const WorkspaceOverview = lazy(() => import('./components/WorkspaceOverview'));
import {
  createActivityEntry,
  loadAutomations,
  loadNotifications,
  runCreateAutomations,
  runUpdateAutomations,
  saveAutomations,
  saveNotifications
} from './utils/automationEngine';
import './index.css';

const INITIAL_STATUS_OPTIONS = [
  { id: 'empty', label: '', color: '#c4c4c4' },
  { id: 'working', label: 'Working on it', color: '#fdab3d' },
  { id: 'done', label: 'Done', color: '#00c875' },
  { id: 'stuck', label: 'Stuck', color: '#e2445c' }
];



const TEAM_OPTIONS = [
  { id: 'dev', label: 'Development', color: '#579bfc' },
  { id: 'design', label: 'Design', color: '#c455de' },
  { id: 'marketing', label: 'Marketing', color: '#00c875' },
  { id: 'finance', label: 'Finance', color: '#fdab3d' }
];

const STATUS_OPTIONS = [
  { id: 'done', label: 'Done', color: '#00c875' },
  { id: 'working', label: 'Working on it', color: '#fdab3d' },
  { id: 'stuck', label: 'Stuck', color: '#e2445c' },
  { id: 'empty', label: '', color: '#c4c4c4' }
];

const DEFAULT_COLUMNS = [
  { id: 'owner', title: 'Owner', type: 'person', width: 120 },
  { id: 'status', title: 'Status', type: 'status', width: 140, options: STATUS_OPTIONS },
  { id: 'date', title: 'Due Date', type: 'date', width: 140 },
  { id: 'department', title: 'Department', type: 'status', width: 140, options: TEAM_OPTIONS },
];

const INITIAL_BOARDS = [
  {
    id: 'folder-dashboard',
    title: 'แดชบอร์ด (Dashboard)',
    type: 'folder',
    parentId: null
  },
  {
    id: 'board-dashboard-1',
    title: 'ภาพรวมโปรเจกต์',
    type: 'dashboard',
    parentId: 'folder-dashboard',
    widgets: [
      {
        id: 'w1',
        title: 'สถานะงานในโปรเจกต์ (Status)',
        type: 'pie',
        sourceBoardId: 'board-passapp-1',
        groupByColumnId: 'status'
      },
      {
        id: 'w2',
        title: 'งานแยกตามแผนก (Department)',
        type: 'bar',
        sourceBoardId: 'board-passapp-1',
        groupByColumnId: 'department'
      },
      {
        id: 'w3',
        title: 'จำนวนงานทั้งหมด',
        type: 'number',
        sourceBoardId: 'board-passapp-1',
        groupByColumnId: 'status'
      }
    ]
  },
  {
    id: 'folder-passapp',
    title: 'Pass App',
    type: 'folder',
    parentId: null
  },
  {
    id: 'board-passapp-1',
    title: 'แผนการพัฒนา Pass App',
    type: 'grid',
    color: '#00c875',
    parentId: 'folder-passapp',
    columns: DEFAULT_COLUMNS,
    groups: [
      {
        id: 'g1', title: 'Sprint 1: Core Features', color: '#579bfc',
        items: [
          { id: 'i1', title: 'ระบบ Login & Authentication', owner: 'Dev Team', status: 'done', date: '2026-10-01', department: 'dev' },
          { id: 'i2', title: 'ออกแบบ UI/UX หน้า Home', owner: 'Design Team', status: 'done', date: '2026-10-05', department: 'design' }
        ]
      },
      {
        id: 'g2', title: 'Sprint 2: Payment Integration', color: '#fdab3d',
        items: [
          { id: 'i3', title: 'เชื่อมต่อ Payment Gateway', owner: 'Backend', status: 'working', date: '2026-10-15', department: 'dev' }
        ]
      }
    ]
  },
  {
    id: 'doc-passapp-proposal',
    title: '📄 เอกสารข้อเสนอโครงการ Pass App (Proposal)',
    type: 'doc',
    parentId: 'folder-passapp',
    content: `<h1>📄 เอกสารข้อเสนอโครงการระบบ Pass App (Project Proposal)</h1>
<p><strong>วันที่เปิดโครงการ:</strong> 1 ตุลาคม 2026 | <strong>ผู้เสนอโครงการ:</strong> ทีมพัฒนาซอฟต์แวร์</p>
<hr/>
<h2>1. วัตถุประสงค์ของโครงการ (Objectives)</h2>
<p>เพื่อพัฒนาแอปพลิเคชัน <strong>Pass App</strong> สำหรับการบริหารจัดการสิทธิ์และการผ่านเข้าออกพื้นที่ขององค์กรอย่างมีประสิทธิภาพ ปลอดภัย และสามารถติดตามสถานะงานได้ในรูปแบบ Real-time</p>

<h2>2. ขอบเขตการทำงาน (Scope of Work)</h2>
<ul>
  <li><strong>ระบบ Authentication & Role Access:</strong> รองรับการเข้าสู่ระบบผ่าน SSO และการกำหนดสิทธิ์ตามแผนก</li>
  <li><strong>ระบบชำระเงิน (Payment Gateway Integration):</strong> เชื่อมต่อกับธนาคารชั้นนำสำหรับการชำระค่าบริการผ่าน QR Code / Credit Card</li>
  <li><strong>การรองรับระบบปฏิบัติการ iOS & Android:</strong> ดีไซน์ UI/UX ที่ทันสมัยตามมาตรฐานองค์กร</li>
</ul>

<h2>3. แผนการดำเนินงานและไทม์ไลน์ (Timeline)</h2>
<blockquote style="background: rgba(87, 155, 252, 0.1); padding: 10px; border-left: 4px solid #579bfc;">
  <p><strong>Sprint 1:</strong> ออกแบบ UI/UX และระบบ Login (กำหนดเสร็จ 5 ต.ค. 2026)</p>
  <p><strong>Sprint 2:</strong> เชื่อมต่อ Payment Gateway และทดสอบระบบความปลอดภัย (กำหนดเสร็จ 15 ต.ค. 2026)</p>
</blockquote>

<h2>4. งบประมาณและการอนุมัติ (Budget & Approval)</h2>
<p>งบประมาณรวมทั้งสิ้น <u>250,000 บาท</u> (รวมค่าบริการ Cloud Server AWS และการรับประกันหลังส่งมอบ 1 ปี)</p>`
  },
  {
    id: 'folder-ios',
    title: 'IOS,Asset',
    type: 'folder',
    parentId: null
  },
  {
    id: 'board-ios-1',
    title: 'จัดการ Asset ของ iOS',
    type: 'grid',
    color: '#c455de',
    parentId: 'folder-ios',
    columns: DEFAULT_COLUMNS,
    groups: [
      {
        id: 'g3', title: 'App Icons & Splash Screens', color: '#c455de',
        items: [
          { id: 'i4', title: 'Export App Icons ทุกขนาด', owner: 'Design Team', status: 'done', date: '2026-09-30', department: 'design' }
        ]
      }
    ]
  },
  {
    id: 'folder-acc',
    title: 'บัญชี (Accounting)',
    type: 'folder',
    parentId: null
  },
  {
    id: 'board-acc-1',
    title: 'ติดตามรายรับ-รายจ่าย',
    type: 'grid',
    color: '#e2445c',
    parentId: 'folder-acc',
    columns: DEFAULT_COLUMNS,
    groups: [
      {
        id: 'g4', title: 'ค่าใช้จ่ายเดือนตุลาคม', color: '#e2445c',
        items: [
          { id: 'i5', title: 'ค่า Server AWS', owner: 'Finance', status: 'working', date: '2026-10-05', department: 'finance' },
          { id: 'i6', title: 'เงินเดือนพนักงาน', owner: 'HR', status: 'empty', date: '2026-10-25', department: 'finance' }
        ]
      }
    ]
  }
];
const GROUP_COLORS = ['var(--group-color-1)', 'var(--group-color-2)', 'var(--group-color-3)', 'var(--group-color-4)', 'var(--accent-blue)', 'var(--accent-purple)'];
const App = () => {
  const [boards, setBoards] = useState(() => {
    const saved = localStorage.getItem('monday_boards_v7');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map(b => {
          if (b.type === 'grid') {
            const cols = b.columns || DEFAULT_COLUMNS;
            // Migrate status columns to have options
            const migratedCols = cols.map(c => 
              c.type === 'status' && !c.options ? { ...c, options: INITIAL_STATUS_OPTIONS } : c
            );
            return { ...b, columns: migratedCols };
          }
          if (b.type === 'dashboard' && !b.widgets) {
            return { ...b, widgets: [] };
          }
          return b;
        });
      } catch {
        return JSON.parse(JSON.stringify(INITIAL_BOARDS));
      }
    }
    return JSON.parse(JSON.stringify(INITIAL_BOARDS));
  });

  const [activeBoardId, setActiveBoardId] = useState('board-passapp-1');
  const [activeSpecialView, setActiveSpecialView] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('tracking_theme_v1') || 'light';
    } catch {
      return 'light';
    }
  });
  const [integrationsOpen, setIntegrationsOpen] = useState(false);
  const [automationsOpen, setAutomationsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth > 1024 : false
  );
  const [isAiCopilotOpen, setIsAiCopilotOpen] = useState(false);
  const [automationRecipes, setAutomationRecipes] = useState(loadAutomations);
  const [notifications, setNotifications] = useState(loadNotifications);
  const [workspaces, setWorkspaces] = useState(() => {
    try {
      const saved = localStorage.getItem('tracking_workspaces_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_WORKSPACES;
  });
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('ws-main');
  const [recentBoardIds, setRecentBoardIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tracking_recent_boards_v1') || '["board-passapp-1"]');
    } catch {
      return ['board-passapp-1'];
    }
  });
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(loadCurrentUser);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const permissions = useMemo(() => getPermissions(currentUser?.role), [currentUser]);
  const fileInputRef = React.useRef(null);

  const handleUpdateUser = (nextUser) => {
    setCurrentUser(nextUser);
    saveCurrentUser(nextUser);
  };

  const handleUpdateMemberRole = (wsId, memberId, nextRole) => {
    if (!permissions.canManagePermissions) return;
    setWorkspaces((prev) =>
      prev.map((w) =>
        w.id === wsId
          ? { ...w, members: (w.members || []).map((m) => (m.id === memberId ? { ...m, role: nextRole } : m)) }
          : w
      )
    );
  };

  useEffect(() => {
    try {
      localStorage.setItem('tracking_workspaces_v1', JSON.stringify(workspaces));
    } catch {}
  }, [workspaces]);

  useEffect(() => {
    try {
      localStorage.setItem('tracking_recent_boards_v1', JSON.stringify(recentBoardIds));
    } catch {}
  }, [recentBoardIds]);

  useEffect(() => {
    const onGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setGlobalSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onGlobalKeyDown);
    return () => window.removeEventListener('keydown', onGlobalKeyDown);
  }, []);

  const trackRecentBoard = (id) => {
    if (!id) return;
    setRecentBoardIds((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, 10));
  };

  const activeWorkspace = useMemo(
    () => workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0],
    [workspaces, activeWorkspaceId]
  );

  const visibleWorkspaceBoards = useMemo(
    () =>
      boards.filter(
        (b) => !b.isDeleted && !b.isArchived && (b.workspaceId || 'ws-main') === activeWorkspaceId
      ),
    [boards, activeWorkspaceId]
  );

  const trashCount = useMemo(() => boards.filter((b) => b.isDeleted).length, [boards]);

  // ===== Primary Icon Rail: collapsible workspace sidebar (desktop) =====
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('tracking_sidebar_collapsed_v1') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('tracking_sidebar_collapsed_v1', String(isSidebarCollapsed));
    } catch {}
  }, [isSidebarCollapsed]);

  // ===== Cloud Sync (Supabase / PostgreSQL REST API) =====
  const [cloudConfig, setCloudConfig] = useState(loadCloudConfig);
  const [cloudSyncOpen, setCloudSyncOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState(() => (isCloudConfigured(loadCloudConfig()) ? 'syncing' : 'local'));
  const [syncError, setSyncError] = useState('');
  const [lastSyncedAt, setLastSyncedAt] = useState(getLastSyncTime);
  const skipNextPushRef = useRef(false);
  const lastRemoteUpdateRef = useRef(null);
  const cloudReadyRef = useRef(false);

  const applyRemotePayload = (payload, updatedAt) => {
    if (!payload || typeof payload !== 'object') return false;
    skipNextPushRef.current = true;
    if (Array.isArray(payload.boards) && payload.boards.length > 0) setBoards(payload.boards);
    if (Array.isArray(payload.workspaces) && payload.workspaces.length > 0) setWorkspaces(payload.workspaces);
    if (Array.isArray(payload.automationRecipes)) setAutomationRecipes(payload.automationRecipes);
    lastRemoteUpdateRef.current = updatedAt || new Date().toISOString();
    setLastSyncedAt(lastRemoteUpdateRef.current);
    return true;
  };

  const handlePullNow = async (configOverride) => {
    const cfg = configOverride || cloudConfig;
    if (!isCloudConfigured(cfg)) {
      setSyncStatus('local');
      return;
    }
    setSyncStatus('syncing');
    setSyncError('');
    try {
      const res = await pullStateFromCloud(cfg);
      if (res.payload) applyRemotePayload(res.payload, res.updatedAt);
      setSyncStatus('synced');
    } catch (err) {
      setSyncStatus('error');
      setSyncError(err.message || 'ไม่สามารถดึงข้อมูลจาก Cloud ได้');
    } finally {
      cloudReadyRef.current = true;
    }
  };

  const handlePushNow = async (configOverride) => {
    const cfg = configOverride || cloudConfig;
    if (!isCloudConfigured(cfg)) {
      setSyncStatus('local');
      return;
    }
    setSyncStatus('syncing');
    setSyncError('');
    try {
      const res = await pushStateToCloud(cfg, {
        version: 1,
        boards,
        workspaces,
        automationRecipes,
      });
      if (res.updatedAt) {
        lastRemoteUpdateRef.current = res.updatedAt;
        setLastSyncedAt(res.updatedAt);
      }
      setSyncStatus('synced');
    } catch (err) {
      setSyncStatus('error');
      setSyncError(err.message || 'ไม่สามารถส่งข้อมูลขึ้น Cloud ได้');
    }
  };

  const handleSaveCloudConfig = async (nextConfig) => {
    setCloudConfig(nextConfig);
    saveCloudConfig(nextConfig);
    if (isCloudConfigured(nextConfig)) {
      await handlePullNow(nextConfig);
    } else {
      setSyncStatus('local');
      setSyncError('');
    }
  };

  // Initial pull on load
  useEffect(() => {
    if (isCloudConfigured(cloudConfig)) {
      handlePullNow();
    } else {
      cloudReadyRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced auto-push when data changes
  useEffect(() => {
    if (!cloudReadyRef.current) return;
    if (!isCloudConfigured(cloudConfig) || !cloudConfig.autoSync) return;
    if (skipNextPushRef.current) {
      skipNextPushRef.current = false;
      return;
    }
    const timer = setTimeout(() => {
      handlePushNow();
    }, 1200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boards, workspaces, automationRecipes, cloudConfig]);

  // Near real-time polling: pull remote changes from other devices every 15s
  useEffect(() => {
    if (!isCloudConfigured(cloudConfig) || !cloudConfig.autoSync) return;
    const interval = setInterval(async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      try {
        const res = await pullStateFromCloud(cloudConfig);
        if (
          res.payload &&
          res.updatedAt &&
          (!lastRemoteUpdateRef.current || new Date(res.updatedAt) > new Date(lastRemoteUpdateRef.current))
        ) {
          applyRemotePayload(res.payload, res.updatedAt);
        }
        setSyncStatus('synced');
        setSyncError('');
      } catch (err) {
        setSyncStatus('error');
        setSyncError(err.message || 'การเชื่อมต่อ Cloud ขัดข้อง');
      }
    }, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloudConfig]);

  useEffect(() => {
    saveAutomations(automationRecipes);
  }, [automationRecipes]);

  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  const handleToggleAutomation = (id) => {
    setAutomationRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));
  };

  const handleDeleteAutomation = (id) => {
    setAutomationRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddAutomation = (newRule) => {
    setAutomationRecipes((prev) => [...prev, newRule]);
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'light') {
      root.style.setProperty('--bg-main', '#f6f7fb');
      root.style.setProperty('--bg-glass', 'rgba(255, 255, 255, 0.95)');
      root.style.setProperty('--bg-panel', '#ffffff');
      root.style.setProperty('--text-main', '#181b34');
      root.style.setProperty('--text-muted', '#5a607f');
      root.style.setProperty('--border-color', '#dbe0ea');
    } else {
      root.style.setProperty('--bg-main', '#0f111a');
      root.style.setProperty('--bg-glass', 'rgba(29, 30, 47, 0.85)');
      root.style.setProperty('--bg-panel', '#1d1e2f');
      root.style.setProperty('--text-main', '#ffffff');
      root.style.setProperty('--text-muted', '#aab0c8');
      root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.12)');
    }
  }, [theme]);
  
  
  

  useEffect(() => {
    localStorage.setItem('monday_boards_v7', JSON.stringify(boards));
    if (boards.length > 0 && !boards.find(b => b.id === activeBoardId)) {
      setActiveBoardId(boards[0].id);
    }
  }, [boards, activeBoardId]);

  useEffect(() => {
    setActiveItemContext(null);
  }, [activeBoardId]);

  // Automations
  useEffect(() => {
    let hasChanges = false;
    const automatedBoards = boards.map(board => {
      if (board.type !== 'grid') return board;
      let boardChanged = false;
      
      const dateCol = (board.columns || []).find(c => c.type === 'timeline');
      const statusCol = (board.columns || []).find(c => c.type === 'status');
      
      if (!dateCol || !statusCol) return board;

      let newOptions = statusCol.options || [];
      if (!newOptions.find(o => o.id === 'overdue')) {
        newOptions = [...newOptions, { id: 'overdue', label: 'Overdue', color: '#5e5e5e' }];
        boardChanged = true;
      }

      const today = new Date();
      today.setHours(0,0,0,0);

      const newGroups = board.groups.map(g => {
        let groupChanged = false;
        const newItems = g.items.map(item => {
          const dateVal = item[dateCol.id];
          if (!dateVal) return item;
          
          const endDateStr = dateVal.end;
          if (!endDateStr) return item;

          const endDate = new Date(endDateStr);
          endDate.setHours(0,0,0,0);
          const currentStatus = item[statusCol.id];

          // Only change to overdue if it is not 'done' and not already 'overdue'
          if (endDate < today && currentStatus !== 'done' && currentStatus !== 'overdue') {
            groupChanged = true;
            return { ...item, [statusCol.id]: 'overdue' };
          }
          return item;
        });

        if (groupChanged) boardChanged = true;
        return groupChanged ? { ...g, items: newItems } : g;
      });

      if (boardChanged) {
        hasChanges = true;
        const newCols = board.columns.map(c => c.id === statusCol.id ? { ...c, options: newOptions } : c);
        return { ...board, columns: newCols, groups: newGroups };
      }
      return board;
    });

    if (hasChanges) {
      setBoards(automatedBoards);
    }
  }, [boards]);


  // View States for Top Actions
  const [viewType, setViewType] = useState('table'); // 'table' | 'kanban' | 'gantt' | 'form' | 'presentation'
  const [activeItemContext, setActiveItemContext] = useState(null); // { groupId, itemId }
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false);
  const [stayAwake, setStayAwake] = useState(() => {
    try {
      const saved = localStorage.getItem('lightbeam_stay_awake');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('lightbeam_stay_awake', JSON.stringify(stayAwake));
    } catch {}
  }, [stayAwake]);

  // Screen Wake Lock & Tab Sleep Management (Prevents screen & device from sleeping)
  useEffect(() => {
    let sentinel = null;
    let isActive = true;

    async function requestLock() {
      if (!stayAwake && viewType !== 'presentation') return;
      if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
        try {
          sentinel = await navigator.wakeLock.request('screen');
        } catch {
          // Wake lock unavailable or denied
        }
      }
    }

    requestLock();

    const handleVisibilityAndFocus = () => {
      if (document.visibilityState === 'visible' && isActive) {
        requestLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityAndFocus);
    window.addEventListener('focus', handleVisibilityAndFocus);

    return () => {
      isActive = false;
      document.removeEventListener('visibilitychange', handleVisibilityAndFocus);
      window.removeEventListener('focus', handleVisibilityAndFocus);
      if (sentinel) {
        sentinel.release().catch(() => {});
      }
    };
  }, [stayAwake, viewType]);

  // Periodic Client-Side Keep-Alive Heartbeat (Prevents cloud hosting like Render from sleeping)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isLocal = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1');
    if (isLocal) return;

    const interval = setInterval(() => {
      fetch(`${window.location.origin}/favicon.svg`, { method: 'HEAD', cache: 'no-store' }).catch(() => {});
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
  
  const [personFilter, setPersonFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortConfig, setSortConfig] = useState(null);
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [groupBy, setGroupBy] = useState('default');
  const [activeToolbarPopover, setActiveToolbarPopover] = useState(null); // 'person' | 'filter' | 'sort' | 'hide' | 'more'
  const [isSearchingToolbar, setIsSearchingToolbar] = useState(false);
  const toolbarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target)) {
        setActiveToolbarPopover(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeBoard = boards.find(b => b.id === activeBoardId);

  const uniquePersons = useMemo(() => {
    if (!activeBoard || activeBoard.type !== 'grid') return [];
    const set = new Set();
    (activeBoard.groups || []).forEach(g => {
      (g.items || []).forEach(item => {
        if (item.owner) set.add(item.owner);
        if (item.person) set.add(item.person);
      });
    });
    if (set.size === 0) {
      return ['Somchai (Admin)', 'Dev Team', 'Design Team'];
    }
    return Array.from(set);
  }, [activeBoard]);

  // Data Transformation
  const getProcessedGroups = () => {
    if (!activeBoard || activeBoard.type !== 'grid') return [];
    
    let processedGroups = JSON.parse(JSON.stringify(activeBoard.groups));

    // 1. Filter by Search Query
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase().trim();
      processedGroups = processedGroups.map(g => ({
        ...g,
        items: g.items.filter(item => 
          (item.title && item.title.toLowerCase().includes(lowerQuery)) ||
          (item.owner && item.owner.toLowerCase().includes(lowerQuery)) ||
          (item.person && item.person.toLowerCase().includes(lowerQuery)) ||
          (item.department && item.department.toLowerCase().includes(lowerQuery))
        )
      }));
    }

    // 2. Filter by Person
    if (personFilter) {
      processedGroups = processedGroups.map(g => ({
        ...g,
        items: g.items.filter(item => item.owner === personFilter || item.person === personFilter)
      }));
    }

    // 3. Filter by Status
    if (statusFilter !== '') {
      processedGroups = processedGroups.map(g => ({
        ...g,
        items: g.items.filter(item => item.status === statusFilter)
      }));
    }

    // 4. Sort Items within groups
    if (sortConfig) {
      processedGroups = processedGroups.map(g => ({
        ...g,
        items: g.items.sort((a, b) => {
          const valA = a[sortConfig.key];
          const valB = b[sortConfig.key];

          const normalize = (v) => {
            if (v === undefined || v === null) return '';
            if (typeof v === 'boolean') return v ? 1 : 0;
            if (typeof v === 'object') {
              if (v.start) return new Date(v.start).getTime();
              return '';
            }
            return v;
          };

          const nA = normalize(valA);
          const nB = normalize(valB);

          if (sortConfig.key === 'title') {
            return sortConfig.direction === 'asc' ? String(nA).localeCompare(String(nB)) : String(nB).localeCompare(String(nA));
          } 

          if (typeof nA === 'number' || typeof nB === 'number' || (!isNaN(nA) && !isNaN(nB) && nA !== '' && nB !== '')) {
            const numA = Number(nA) || 0;
            const numB = Number(nB) || 0;
            return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
          }

          const strA = String(nA).toLowerCase();
          const strB = String(nB).toLowerCase();
          return sortConfig.direction === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
        })
      }));
    }

    // 5. Group By Status
    if (groupBy === 'status') {
      const allItems = processedGroups.flatMap(g => g.items);
      const statusCol = activeBoard.columns?.find(c => c.type === 'status');
      const currentStatusOptions = statusCol ? statusCol.options : INITIAL_STATUS_OPTIONS;
      const statusGroupsMap = {};
      
      currentStatusOptions.forEach(opt => {
        statusGroupsMap[opt.id] = {
          id: `virtual-group-${opt.id}`,
          title: opt.label || 'Empty Status',
          color: opt.color,
          items: [],
          isVirtual: true
        };
      });

      allItems.forEach(item => {
        const sId = item.status || 'empty';
        if (statusGroupsMap[sId]) {
          statusGroupsMap[sId].items.push(item);
        }
      });

      processedGroups = Object.values(statusGroupsMap).filter(g => g.items.length > 0);
    }

    return processedGroups;
  };

  const handleDuplicateBoard = (boardId) => {
    const srcBoard = boards.find(b => b.id === boardId);
    if (!srcBoard) return;
    const duplicatedBoard = JSON.parse(JSON.stringify(srcBoard));
    duplicatedBoard.id = uuidv4();
    duplicatedBoard.title = `${srcBoard.title} (คัดลอก)`;
    if (duplicatedBoard.groups) {
      duplicatedBoard.groups = duplicatedBoard.groups.map(g => ({
        ...g,
        id: uuidv4(),
        items: (g.items || []).map(item => ({
          ...item,
          id: uuidv4(),
          subitems: (item.subitems || []).map(s => ({ ...s, id: uuidv4() }))
        }))
      }));
    }
    setBoards(prev => [...prev, duplicatedBoard]);
    setActiveBoardId(duplicatedBoard.id);
  };

  // Board Actions
  const handleAddBoard = (type = 'grid', parentId = null) => {
    const newBoard = {
      id: uuidv4(),
      workspaceId: activeWorkspaceId,
      title: type === 'grid' ? 'New Board' : type === 'dashboard' ? 'New Dashboard' : type === 'doc' ? 'New Document' : 'New Folder',
      type: type,
      parentId: parentId,
      color: type === 'grid' ? 'var(--accent-blue)' : type === 'doc' ? 'var(--accent-purple)' : 'var(--text-muted)',
      columns: type === 'grid' ? DEFAULT_COLUMNS : undefined,
      widgets: type === 'dashboard' ? [] : undefined,
      content: type === 'doc' ? '' : undefined,
      groups: type === 'grid' ? [
        {
          id: uuidv4(),
          title: 'New Group',
          color: GROUP_COLORS[Math.floor(Math.random() * GROUP_COLORS.length)],
          items: []
        }
      ] : []
    };
    setBoards([...boards, newBoard]);
    setActiveSpecialView(null);
    setActiveBoardId(newBoard.id);
    trackRecentBoard(newBoard.id);
  };

  const handleUseTemplate = (template) => {
    if (!template || typeof template.buildBoard !== 'function') return;
    const built = template.buildBoard(activeWorkspaceId);
    setBoards((prev) => [...prev, built]);
    setActiveSpecialView(null);
    setActiveBoardId(built.id);
    trackRecentBoard(built.id);
  };

  const handleAddWorkspace = (name) => {
    const colors = ['#0073ea', '#00c875', '#fdab3d', '#c455de', '#e2445c'];
    const newWs = {
      id: `ws-${uuidv4().slice(0, 8)}`,
      name,
      description: '',
      color: colors[workspaces.length % colors.length],
      type: 'open',
      members: [{ id: `m-${uuidv4().slice(0, 6)}`, name: 'Ohm Saehae', email: 'lighting6647@gmail.com', role: 'Owner' }],
    };
    setWorkspaces((prev) => [...prev, newWs]);
    setActiveWorkspaceId(newWs.id);
    setActiveSpecialView('workspace-overview');
  };

  const handleUpdateWorkspace = (wsId, patch) => {
    setWorkspaces((prev) => prev.map((w) => (w.id === wsId ? { ...w, ...patch } : w)));
  };

  const handleAddWorkspaceMember = (wsId, member) => {
    setWorkspaces((prev) =>
      prev.map((w) =>
        w.id === wsId
          ? { ...w, members: [...(w.members || []), { id: `m-${uuidv4().slice(0, 6)}`, ...member }] }
          : w
      )
    );
  };

  const handleUpdateDashboard = (boardId, widgets) => {
    setBoards(boards.map(b => b.id === boardId ? { ...b, widgets } : b));
  };

  const handleUpdateDocument = (boardId, content) => {
    setBoards(boards.map(b => b.id === boardId ? { ...b, content } : b));
  };

  const handleExportExcel = () => {
    if (!activeBoard || activeBoard.type !== 'grid') return;
    let csv = [];
    const cols = activeBoard.columns || DEFAULT_COLUMNS;
    const headers = ['Group', 'Item', ...cols.map(c => c.title)];
    csv.push(headers.map(h => `"${h}"`).join(','));

    (activeBoard.groups || []).forEach(g => {
      (g.items || []).forEach(item => {
        const row = [
          g.title,
          item.title || '',
          ...cols.map(c => {
            const val = item[c.id];
            if (typeof val === 'object' && val !== null) return JSON.stringify(val);
            return val !== undefined && val !== null ? String(val) : '';
          })
        ];
        csv.push(row.map(r => `"${r.replace(/"/g, '""')}"`).join(','));
      });
    });

    const blob = new Blob(['\uFEFF' + csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${activeBoard.title || 'board'}_excel.csv`;
    link.click();
  };

  const handleImportCSV = (csvText) => {
    if (!activeBoard || activeBoard.type !== 'grid') return;
    const lines = csvText.split('\n').filter(l => l.trim().length > 0);
    if (lines.length < 2) return;

    const newItems = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.replace(/^"|"$/g, '').trim());
      if (parts.length >= 2) {
        newItems.push({
          id: uuidv4(),
          title: parts[1] || `Imported Item ${i}`,
          status: parts[2] ? parts[2].toLowerCase() : 'working',
          owner: parts[3] || 'Imported User'
        });
      }
    }

    if (newItems.length > 0 && activeBoard.groups.length > 0) {
      const firstGroupId = activeBoard.groups[0].id;
      const updatedGroups = activeBoard.groups.map(g => {
        if (g.id === firstGroupId) {
          return { ...g, items: [...g.items, ...newItems] };
        }
        return g;
      });
      updateActiveBoardGroups(updatedGroups);
      alert(`นำเข้าข้อมูลจาก Excel / CSV เรียบร้อยแล้ว ${newItems.length} รายการ!`);
    }
  };

  const handleImportFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      handleImportCSV(evt.target.result);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleAddColumn = (boardId, columnType, columnTitle) => {
    setBoards(boards.map(b => {
      if (b.id !== boardId) return b;
      
      const newColId = `${columnType}_${uuidv4().substring(0,6)}`;
      const newColumn = {
        id: newColId,
        title: columnTitle,
        type: columnType,
        width: columnType === 'text' ? 250 : columnType === 'timeline' ? 220 : 150,
        options: columnType === 'status' ? INITIAL_STATUS_OPTIONS : undefined
      };

      return {
        ...b,
        columns: [...(b.columns || DEFAULT_COLUMNS), newColumn]
      };
    }));
  };

  const handleRenameColumn = (boardId, colId, newTitle) => {
    setBoards(boards.map(b => {
      if (b.id !== boardId) return b;
      return {
        ...b,
        columns: (b.columns || DEFAULT_COLUMNS).map(c => 
          c.id === colId ? { ...c, title: newTitle } : c
        )
      };
    }));
  };

  const handleUpdateColumnWidth = (boardId, colId, newWidth) => {
    setBoards(boards.map(b => {
      if (b.id !== boardId) return b;
      return {
        ...b,
        columns: (b.columns || DEFAULT_COLUMNS).map(c => 
          c.id === colId ? { ...c, width: newWidth } : c
        )
      };
    }));
  };

  const handleReorderColumns = (boardId, sourceId, targetId) => {
    if (sourceId === targetId) return;
    setBoards(boards.map(b => {
      if (b.id !== boardId) return b;
      const cols = [...(b.columns || DEFAULT_COLUMNS)];
      const sourceIndex = cols.findIndex(c => c.id === sourceId);
      const targetIndex = cols.findIndex(c => c.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1) return b;

      const [movedCol] = cols.splice(sourceIndex, 1);
      cols.splice(targetIndex, 0, movedCol);

      return { ...b, columns: cols };
    }));
  };

  const handleUpdateColumnOptions = (boardId, colId, newOptions) => {
    setBoards(boards.map(b => {
      if (b.id !== boardId) return b;
      return {
        ...b,
        columns: (b.columns || DEFAULT_COLUMNS).map(c => 
          c.id === colId ? { ...c, options: newOptions } : c
        )
      };
    }));
  };

  const handleDeleteColumn = (boardId, colId) => {
    setBoards(boards.map(b => {
      if (b.id !== boardId) return b;
      return {
        ...b,
        columns: (b.columns || DEFAULT_COLUMNS).filter(c => c.id !== colId)
      };
    }));
  };

  const handleDeleteBoard = (boardId) => {
    setBoards((prev) => prev.map((b) => (b.id === boardId ? { ...b, isDeleted: true } : b)));
    if (activeBoardId === boardId) {
      const next = visibleWorkspaceBoards.find((b) => b.id !== boardId && b.type !== 'folder');
      if (next) setActiveBoardId(next.id);
      else setActiveSpecialView('workspace-overview');
    }
  };

  const handleArchiveBoard = (boardId) => {
    setBoards((prev) => prev.map((b) => (b.id === boardId ? { ...b, isArchived: true } : b)));
    if (activeBoardId === boardId) {
      const next = visibleWorkspaceBoards.find((b) => b.id !== boardId && b.type !== 'folder');
      if (next) setActiveBoardId(next.id);
      else setActiveSpecialView('workspace-overview');
    }
  };

  const handleRestoreBoard = (boardId) => {
    setBoards((prev) => prev.map((b) => (b.id === boardId ? { ...b, isDeleted: false } : b)));
  };

  const handleUnarchiveBoard = (boardId) => {
    setBoards((prev) => prev.map((b) => (b.id === boardId ? { ...b, isArchived: false } : b)));
  };

  const handlePermanentDeleteBoard = (boardId) => {
    setBoards((prev) => prev.filter((b) => b.id !== boardId));
  };

  const handleUpdateBoardTitle = (title) => {
    if (!activeBoard) return;
    setBoards(boards.map(b => b.id === activeBoardId ? { ...b, title } : b));
  };

  const handleRenameBoard = (boardId, newTitle) => {
    setBoards(boards.map(b => b.id === boardId ? { ...b, title: newTitle } : b));
  };

  const handleMoveBoard = (boardId, targetParentId) => {
    setBoards(boards.map(b => b.id === boardId ? { ...b, parentId: targetParentId } : b));
  };

  // Group Actions (scoped to active board)
  const handleReorderItem = (sourceGroupId, sourceItemId, targetGroupId, targetItemId) => {
    if (!activeBoard) return;
    if (sourceGroupId === targetGroupId && sourceItemId === targetItemId) return;

    const newGroups = JSON.parse(JSON.stringify(activeBoard.groups));
    const sourceGroup = newGroups.find(g => g.id === sourceGroupId);
    const targetGroup = newGroups.find(g => g.id === targetGroupId);
    if (!sourceGroup || !targetGroup) return;
    const sourceItemIndex = sourceGroup.items.findIndex(i => i.id === sourceItemId);
    if (sourceItemIndex === -1) return;
    const [movedItem] = sourceGroup.items.splice(sourceItemIndex, 1);
    if (targetItemId) {
      const targetItemIndex = targetGroup.items.findIndex(i => i.id === targetItemId);
      targetGroup.items.splice(targetItemIndex, 0, movedItem);
    } else {
      targetGroup.items.push(movedItem);
    }
    updateActiveBoardGroups(newGroups);
  };

  const updateActiveBoardGroups = (newGroups) => {
    setBoards(boards.map(b => b.id === activeBoardId ? { ...b, groups: newGroups } : b));
  };

  const getActiveTask = () => {
    if (!activeItemContext) return null;
    const targetBoardId = activeItemContext.boardId || activeBoardId;
    const targetBoard = boards.find(b => b.id === targetBoardId);
    if (!targetBoard || targetBoard.type !== 'grid') return null;
    const group = (targetBoard.groups || []).find(g => g.id === activeItemContext.groupId);
    const inGroup = group ? (group.items || []).find(i => i.id === activeItemContext.itemId) : null;
    if (inGroup) return inGroup;
    for (const g of targetBoard.groups || []) {
      const found = (g.items || []).find(i => i.id === activeItemContext.itemId);
      if (found) return found;
    }
    return null;
  };

  const handleUpdateActiveTaskContext = (field, value) => {
    if (activeItemContext) {
      handleUpdateItem(activeItemContext.groupId, activeItemContext.itemId, field, value, null, activeItemContext.boardId);
    }
  };

  const handleUpdateItem = (groupId, itemId, field, value, parentId = null, targetBoardId = null) => {
    const bId = targetBoardId || activeBoardId;
    const targetBoard = boards.find((b) => b.id === bId && b.type === 'grid');
    let generatedNotifications = [];

    if (targetBoard && !parentId) {
      const currentBoardWithChange = {
        ...targetBoard,
        groups: (targetBoard.groups || []).map((g) =>
          g.id === groupId
            ? {
                ...g,
                items: (g.items || []).map((item) => (item.id === itemId ? { ...item, [field]: value } : item))
              }
            : g
        )
      };
      const autoRes = runUpdateAutomations({
        board: currentBoardWithChange,
        itemId,
        field,
        value,
        recipes: automationRecipes
      });
      generatedNotifications = autoRes.notifications;
    }

    setBoards((prevBoards) =>
      prevBoards.map((b) => {
        if (b.id !== bId || b.type !== 'grid') return b;
        const shouldTrackActivity = !parentId && field !== 'updates' && field !== 'activityLog';
        const updatedGroups = (b.groups || []).map((g) => {
          if (g.id !== groupId) return g;
          return {
            ...g,
            items: (g.items || []).map((item) => {
              if (parentId) {
                if (item.id === parentId) {
                  return {
                    ...item,
                    subitems: (item.subitems || []).map((sub) =>
                      sub.id === itemId ? { ...sub, [field]: value } : sub
                    )
                  };
                }
                return item;
              }
              if (item.id !== itemId) return item;
              const prevVal = item[field];
              const nextLog =
                shouldTrackActivity && prevVal !== value
                  ? [
                      createActivityEntry({
                        action: `อัปเดตฟิลด์ ${field}`,
                        field,
                        from: typeof prevVal === 'object' ? JSON.stringify(prevVal) : prevVal,
                        to: typeof value === 'object' ? JSON.stringify(value) : value
                      }),
                      ...(item.activityLog || [])
                    ].slice(0, 40)
                  : item.activityLog;
              return {
                ...item,
                [field]: value,
                ...(nextLog ? { activityLog: nextLog } : {})
              };
            })
          };
        });

        if (parentId) return { ...b, groups: updatedGroups };
        const autoApplied = runUpdateAutomations({
          board: { ...b, groups: updatedGroups },
          itemId,
          field,
          value,
          recipes: automationRecipes
        });
        return { ...b, groups: autoApplied.groups };
      })
    );

    if (generatedNotifications.length > 0) {
      setNotifications((prev) => [...generatedNotifications, ...prev].slice(0, 30));
    }
  };

  const handleAddItem = (groupId, title, extraFields = {}, targetBoardId = null) => {
    const bId = targetBoardId || activeBoardId;
    const newItemId = uuidv4();
    const targetBoard = boards.find((b) => b.id === bId && b.type === 'grid');
    const baseItem = {
      id: newItemId,
      title,
      ...extraFields,
      activityLog: [
        createActivityEntry({
          action: `สร้างรายการงาน "${title}"`,
          field: 'title',
          from: '',
          to: title
        })
      ]
    };
    const autoCreated = runCreateAutomations({
      board: targetBoard,
      item: baseItem,
      recipes: automationRecipes
    });

    setBoards((prevBoards) =>
      prevBoards.map((b) => {
        if (b.id !== bId || b.type !== 'grid') return b;
        const newGroups = (b.groups || []).map((g) => {
          if (g.id === groupId) {
            return {
              ...g,
              items: [...g.items, autoCreated.item]
            };
          }
          return g;
        });
        return { ...b, groups: newGroups };
      })
    );

    if (autoCreated.notifications.length > 0) {
      setNotifications((prev) => [...autoCreated.notifications, ...prev].slice(0, 30));
    }
    return newItemId;
  };

  const handleAddSubitem = (groupId, parentId, title) => {
    if (!activeBoard) return;
    const newGroups = activeBoard.groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          items: g.items.map(item => {
            if (item.id === parentId) {
              return {
                ...item,
                subitems: [...(item.subitems || []), { id: uuidv4(), title }]
              };
            }
            return item;
          })
        };
      }
      return g;
    });
    updateActiveBoardGroups(newGroups);
  };

  const handleDeleteItem = (groupId, itemId, parentId = null) => {
    if (!activeBoard) return;
    const newGroups = activeBoard.groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          items: parentId 
            ? g.items.map(item => item.id === parentId 
                ? { ...item, subitems: (item.subitems || []).filter(sub => sub.id !== itemId) } 
                : item)
            : g.items.filter(item => item.id !== itemId)
        };
      }
      return g;
    });
    updateActiveBoardGroups(newGroups);
  };

  const handleAddGroup = () => {
    if (!activeBoard) return;
    const newGroup = {
      id: uuidv4(),
      title: 'New Group',
      color: GROUP_COLORS[activeBoard.groups.length % GROUP_COLORS.length],
      items: []
    };
    updateActiveBoardGroups([...activeBoard.groups, newGroup]);
  };

  const handleDeleteGroup = (groupId) => {
    if (!activeBoard) return;
    if (window.confirm('Are you sure you want to delete this group and all its items?')) {
      const newGroups = activeBoard.groups.filter(g => g.id !== groupId);
      updateActiveBoardGroups(newGroups);
    }
  };

  const handleRenameGroup = (groupId, newTitle) => {
    if (!activeBoard) return;
    const newGroups = activeBoard.groups.map(g => 
      g.id === groupId ? { ...g, title: newTitle } : g
    );
    updateActiveBoardGroups(newGroups);
  };

  return (
    <div className="work-os-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', height: '100dvh', maxHeight: '100dvh', backgroundColor: 'var(--bg-shell)' }}>
      {/* WCAG 2.4.1 Skip to Main Content Link */}
      <a href="#main-board-content" className="skip-to-content">
        ข้ามไปยังเนื้อหาหลัก (Skip to main content)
      </a>

      {/* Desktop Global Top Bar (monday.com 3-zone header) */}
      <GlobalTopBar
        theme={theme}
        onToggleTheme={() => {
          const next = theme === 'dark' ? 'light' : 'dark';
          setTheme(next);
          try { localStorage.setItem('tracking_theme_v1', next); } catch {}
        }}
        notifications={notifications}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onOpenGlobalSearch={() => setGlobalSearchOpen(true)}
        onOpenInbox={() => setActiveSpecialView('inbox')}
        onOpenWorkspaceOverview={() => setActiveSpecialView('workspace-overview')}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenCloudSync={() => setCloudSyncOpen(true)}
        onToggleAiCopilot={() => setIsAiCopilotOpen((prev) => !prev)}
        currentUser={currentUser}
        syncStatus={syncStatus}
      />

      {/* Screen Reader Live Status Region */}
      <div 
        role="status" 
        aria-live="polite" 
        className="sr-only" 
        style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}
      >
        {activeSpecialView === 'my-work' ? 'เปิดมุมมอง My Work' : activeSpecialView === 'ai-notetaker' ? 'เปิดมุมมอง AI Notetaker' : `เปิดบอร์ด ${activeBoard?.title || ''}`}
      </div>

      {/* Mobile & Tablet App Bar (Visible on screens <= 1024px: iPhone, iPad, smartphone) */}
      <header className="mobile-top-bar">
        <div className="mobile-top-bar-left">
          <button 
            type="button"
            className="mobile-hamburger-btn" 
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open navigation menu"
            title="เปิดเมนูนำทาง (Sidebar)"
          >
            <FiMenu size={22} aria-hidden="true" />
          </button>
          <div className="mobile-app-branding">
            <span className="mobile-app-name">LightBeam OS</span>
            <span className="mobile-view-name">
              {activeSpecialView === 'my-work' 
                ? '📋 My Work' 
                : activeSpecialView === 'ai-notetaker' 
                  ? '🎙️ AI Notetaker' 
                  : (activeBoard?.title || 'บอร์ดงาน')}
            </span>
          </div>
        </div>
        <div className="mobile-top-bar-right">
          <NotificationCenter boards={boards} />
          <button 
            type="button"
            onClick={() => setStayAwake(!stayAwake)}
            className={`mobile-theme-btn ${stayAwake ? 'active-filter-btn' : ''}`}
            title={stayAwake ? 'ระบบป้องกันหน้าจอดับ: เปิดใช้งานอยู่ (Screen will stay awake)' : 'เปิดระบบป้องกันหน้าจอดับ (Keep screen awake)'}
            aria-label={stayAwake ? 'ปิดระบบป้องกันหน้าจอดับ' : 'เปิดระบบป้องกันหน้าจอดับ'}
          >
            <FiCoffee color={stayAwake ? '#00c875' : 'var(--text-muted)'} size={17} aria-hidden="true" />
          </button>
          <button 
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
            className="mobile-theme-btn"
            title={theme === 'dark' ? 'สลับเป็น Light Mode' : 'สลับเป็น Dark Mode'}
            aria-label={theme === 'dark' ? 'สลับเป็น Light Mode' : 'สลับเป็น Dark Mode'}
          >
            {theme === 'dark' ? <FiSun color="#fdab3d" size={17} aria-hidden="true" /> : <FiMoon color="#579bfc" size={17} aria-hidden="true" />}
          </button>
        </div>
      </header>

      <div className="app-container" style={{ flex: 1, display: 'flex', overflow: 'hidden', height: '100%', minHeight: 0, position: 'relative' }}>
        {/* Backdrop overlay for mobile & tablet drawer */}
        {isSidebarOpen && (
          <div 
            className="sidebar-backdrop" 
            onClick={() => setIsSidebarOpen(false)} 
            aria-label="Close menu backdrop"
          />
        )}

        <PrimaryIconRail
          activeSpecialView={activeSpecialView}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebarCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          onSelectHome={() => {
            setActiveSpecialView(null);
            const target = visibleWorkspaceBoards.find((b) => b.id === activeBoardId) || visibleWorkspaceBoards.find((b) => b.type === 'grid');
            if (target) setActiveBoardId(target.id);
          }}
          onSelectSpecialView={(view) => setActiveSpecialView(view)}
          onOpenTemplates={() => setTemplateModalOpen(true)}
          onOpenGlobalSearch={() => setGlobalSearchOpen(true)}
          onOpenCloudSync={() => setCloudSyncOpen(true)}
          onOpenAuth={() => setAuthModalOpen(true)}
          currentUser={currentUser}
          syncStatus={syncStatus}
          trashCount={trashCount}
        />

        <Sidebar 
          collapsed={isSidebarCollapsed}
          boards={visibleWorkspaceBoards}
          activeBoardId={activeBoardId}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onSelectBoard={(id) => {
            setActiveSpecialView(null);
            setActiveBoardId(id);
            trackRecentBoard(id);
          }}
          activeSpecialView={activeSpecialView}
          onSelectSpecialView={(view) => setActiveSpecialView(view)}
          onAddBoard={handleAddBoard}
          onDeleteBoard={handleDeleteBoard}
          onArchiveBoard={handleArchiveBoard}
          onRenameBoard={handleRenameBoard}
          onMoveBoard={handleMoveBoard}
          onDuplicateBoard={handleDuplicateBoard}
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          onSelectWorkspace={(wsId) => {
            setActiveWorkspaceId(wsId);
            setActiveSpecialView('workspace-overview');
          }}
          onAddWorkspace={handleAddWorkspace}
          onOpenGlobalSearch={() => setGlobalSearchOpen(true)}
          onOpenTemplates={() => setTemplateModalOpen(true)}
          trashCount={trashCount}
          onResetToBlank={() => {
            const blankBoard = {
              id: 'board-1',
              workspaceId: activeWorkspaceId,
              title: 'New Board',
              type: 'grid',
              color: '#0085ff',
              columns: DEFAULT_COLUMNS,
              groups: [
                {
                  id: 'g1',
                  title: 'Group 1',
                  color: '#579bfc',
                  items: []
                }
              ]
            };
            setBoards([blankBoard]);
            setActiveBoardId('board-1');
            setActiveSpecialView(null);
          }}
        />
        
        <main id="main-board-content" role="main" tabIndex={-1} className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)', overflow: 'hidden' }}>
          {permissions.isReadOnly && (
            <div
              role="note"
              style={{
                padding: '0.4rem 1rem',
                backgroundColor: 'rgba(253, 171, 61, 0.16)',
                borderBottom: '1px solid rgba(253, 171, 61, 0.4)',
                color: '#fdab3d',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>โหมดดูอย่างเดียว (Viewer — Read-only) — คุณสามารถดูและค้นหาได้ แต่ไม่สามารถแก้ไขบอร์ดได้</span>
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                style={{ background: 'none', border: '1px solid #fdab3d', color: '#fdab3d', borderRadius: '6px', padding: '2px 8px', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                เปลี่ยนสิทธิ์
              </button>
            </div>
          )}
          <ViewErrorBoundary>
          <Suspense fallback={<ViewSkeleton />}>
          {activeSpecialView === 'workspace-overview' ? (
            <WorkspaceOverview
              workspace={activeWorkspace}
              boards={visibleWorkspaceBoards}
              recentBoardIds={recentBoardIds}
              onSelectBoard={(id) => {
                setActiveSpecialView(null);
                setActiveBoardId(id);
                trackRecentBoard(id);
              }}
              onAddBoard={handleAddBoard}
              onOpenTemplates={() => setTemplateModalOpen(true)}
              onUpdateWorkspace={handleUpdateWorkspace}
              onAddMember={handleAddWorkspaceMember}
              currentUser={currentUser}
              onUpdateMemberRole={handleUpdateMemberRole}
            />
          ) : activeSpecialView === 'inbox' ? (
            <InboxView
              boards={boards}
              notifications={notifications}
              onSelectBoard={(id) => {
                setActiveSpecialView(null);
                setActiveBoardId(id);
                trackRecentBoard(id);
              }}
              onOpenItem={(groupId, itemId, boardId) => {
                setTaskDrawerOpen(true);
                setActiveItemContext({ groupId, itemId, boardId });
              }}
            />
          ) : activeSpecialView === 'trash-archive' ? (
            <TrashArchiveView
              boards={boards}
              onRestoreBoard={handleRestoreBoard}
              onPermanentDeleteBoard={handlePermanentDeleteBoard}
              onUnarchiveBoard={handleUnarchiveBoard}
            />
          ) : activeSpecialView === 'my-work' ? (
            <MyWorkView 
              boards={boards}
              onSelectBoard={(id) => {
                setActiveSpecialView(null);
                setActiveBoardId(id);
              }}
              onOpenItem={(groupId, itemId, boardId) => {
                setTaskDrawerOpen(true);
                setActiveItemContext({ groupId, itemId, boardId });
              }}
              updateItem={handleUpdateItem}
            />
          ) : activeSpecialView === 'ai-notetaker' ? (
            <AiNotetakerView 
              boards={boards}
              onAddTask={(groupId, title, extraFields, boardId) => handleAddItem(groupId, title, extraFields, boardId)}
            />
          ) : activeBoard ? (
            <>
              {/* Board Header */}
              <div className="board-header">
                <div className="board-title-row">
                  <div className="board-title-left" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: 0 }}>
                    <button 
                      type="button"
                      className="header-hamburger-btn" 
                      onClick={() => setIsSidebarOpen(prev => !prev)}
                      aria-label="Toggle navigation menu"
                      title="เปิด/ปิด แถบเมนูด้านข้าง"
                    >
                      <FiMenu size={20} />
                    </button>
                    <div className="board-title" style={{ flex: 1, minWidth: 0 }}>
                      <input 
                        type="text" 
                        value={activeBoard.title}
                        onChange={(e) => handleUpdateBoardTitle(e.target.value)}
                        className="inline-input board-title-input"
                      />
                    </div>
                  </div>
                  <div className="board-header-actions">
                    <NotificationCenter notifications={notifications} onMarkAllRead={handleMarkAllNotificationsRead} />
                    <button 
                      type="button" 
                      onClick={() => setStayAwake(!stayAwake)} 
                      className={`theme-toggle-btn ${stayAwake ? 'active-filter-btn' : ''}`}
                      title={stayAwake ? 'ระบบป้องกันหน้าจอดับ: เปิดใช้งานอยู่ (Screen will stay awake)' : 'เปิดระบบป้องกันหน้าจอดับ (Keep screen awake)'}
                      aria-label={stayAwake ? 'ปิดระบบป้องกันหน้าจอดับ' : 'เปิดระบบป้องกันหน้าจอดับ'}
                    >
                      <FiCoffee color={stayAwake ? '#00c875' : 'var(--text-muted)'} size={14} />
                      <span className="theme-toggle-label">{stayAwake ? 'Stay Awake ✓' : 'Stay Awake'}</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
                      className="theme-toggle-btn"
                      title="สลับธีม สว่าง / มืด"
                    >
                      {theme === 'dark' ? <FiSun color="#fdab3d" size={14} /> : <FiMoon color="#579bfc" size={14} />}
                      <span className="theme-toggle-label">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                    <div 
                      onClick={() => setIntegrationsOpen(true)}
                      className="header-action-badge"
                      title="เปิดศูนย์เชื่อมต่อระบบภายนอก (Integrations)"
                    >
                      <FiSettings size={14} />
                      <span className="action-badge-label">Integrate</span>
                    </div>
                    <div 
                      onClick={() => setAutomationsOpen(true)}
                      className="header-action-badge"
                      style={{ color: automationsOpen ? '#a259ff' : 'inherit' }}
                      title="เปิดศูนย์ทำงานอัตโนมัติ (Automations)"
                    >
                      <FiSettings size={14} color="#a259ff" />
                      <span className="action-badge-label">Automate</span>
                    </div>
                  </div>
                </div>
                
                {/* Board Tabs */}
                {activeBoard.type === 'grid' && (
                  <nav className="board-tabs" role="tablist" aria-label="Board view options">
                    <button type="button" role="tab" aria-selected={viewType === 'table'} className={`board-tab ${viewType === 'table' ? 'active' : ''}`} onClick={() => setViewType('table')}>Main table</button>
                    <button type="button" role="tab" aria-selected={viewType === 'kanban'} className={`board-tab ${viewType === 'kanban' ? 'active' : ''}`} onClick={() => setViewType('kanban')}>Kanban</button>
                    <button type="button" role="tab" aria-selected={viewType === 'gantt'} className={`board-tab ${viewType === 'gantt' ? 'active' : ''}`} onClick={() => setViewType('gantt')}>Timeline</button>
                    <button type="button" role="tab" aria-selected={viewType === 'calendar'} className={`board-tab ${viewType === 'calendar' ? 'active' : ''}`} onClick={() => setViewType('calendar')}>Calendar</button>
                    <button type="button" role="tab" aria-selected={viewType === 'form'} className={`board-tab ${viewType === 'form' ? 'active' : ''}`} onClick={() => setViewType('form')}>Form</button>
                    <button type="button" role="tab" aria-selected={viewType === 'presentation'} className={`board-tab ${viewType === 'presentation' ? 'active' : ''}`} onClick={() => setViewType('presentation')}>Presentation 🖥️</button>
                  </nav>
                )}
              </div>

              {/* Board Toolbar with Complete Interactive Functions */}
              {activeBoard.type === 'grid' && (
                <div className="board-toolbar" role="toolbar" aria-label="Board actions" ref={toolbarRef}>
                  <button type="button" className="btn-primary" aria-label="เพิ่มรายการงานใหม่ (New Item)" onClick={() => {
                    const firstGroup = activeBoard.groups[0];
                    if (firstGroup) handleAddItem(firstGroup.id, 'New Item');
                  }}>
                    New Item <FiArrowDown style={{ marginLeft: '4px' }} aria-hidden="true" />
                  </button>

                  {/* Search Input / Button */}
                  {isSearchingToolbar ? (
                    <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-panel)', padding: '0 0.5rem', borderRadius: '6px', border: '1px solid var(--accent-blue)', height: '36px' }}>
                      <FiSearch size={14} color="var(--text-muted)" />
                      <input 
                        autoFocus
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search items, owner, dept..."
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', padding: '0.35rem 0.5rem', outline: 'none', fontSize: '0.85rem' }}
                      />
                      {searchQuery && (
                        <button type="button" onClick={() => setSearchQuery('')} style={{ color: 'var(--text-muted)', padding: '2px', cursor: 'pointer' }} title="ล้างคำค้นหา">
                          <FiX size={14} />
                        </button>
                      )}
                      <button type="button" onClick={() => { setIsSearchingToolbar(false); setSearchQuery(''); }} style={{ color: 'var(--text-muted)', marginLeft: '4px', cursor: 'pointer', fontSize: '0.78rem' }}>
                        Close
                      </button>
                    </div>
                  ) : (
                    <button 
                      type="button" 
                      className={`toolbar-btn ${searchQuery ? 'active-filter-btn' : ''}`} 
                      onClick={() => setIsSearchingToolbar(true)}
                      aria-label="ค้นหารายการ"
                    >
                      <FiSearch aria-hidden="true" /> {searchQuery ? `"${searchQuery}"` : 'Search'}
                    </button>
                  )}

                  {/* Person Filter */}
                  <div style={{ position: 'relative' }}>
                    <button 
                      type="button" 
                      className={`toolbar-btn ${personFilter ? 'active-filter-btn' : ''}`} 
                      onClick={() => setActiveToolbarPopover(activeToolbarPopover === 'person' ? null : 'person')}
                      aria-label="กรองตามผู้รับผิดชอบ"
                    >
                      <FiUsers aria-hidden="true" /> {personFilter ? `Person: ${personFilter}` : 'Person'}
                    </button>
                    {activeToolbarPopover === 'person' && (
                      <div className="action-popover" style={{ minWidth: '180px' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.78rem', padding: '0.25rem 0.5rem', color: 'var(--text-muted)' }}>Filter by Person</div>
                        <div className="popover-option" onClick={() => { setPersonFilter(''); setActiveToolbarPopover(null); }}>
                          {personFilter === '' ? '✓ ' : ''} All People
                        </div>
                        {uniquePersons.map(person => (
                          <div key={person} className="popover-option" onClick={() => { setPersonFilter(person); setActiveToolbarPopover(null); }}>
                            {personFilter === person ? '✓ ' : ''} 👤 {person}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Status Filter */}
                  <div style={{ position: 'relative' }}>
                    <button 
                      type="button" 
                      className={`toolbar-btn ${statusFilter ? 'active-filter-btn' : ''}`} 
                      onClick={() => setActiveToolbarPopover(activeToolbarPopover === 'filter' ? null : 'filter')}
                      aria-label="ตัวกรองเงื่อนไข"
                    >
                      <FiFilter aria-hidden="true" /> {statusFilter ? `Status: ${statusFilter}` : 'Filter'}
                    </button>
                    {activeToolbarPopover === 'filter' && (
                      <div className="action-popover" style={{ minWidth: '200px' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.78rem', padding: '0.25rem 0.5rem', color: 'var(--text-muted)' }}>Filter by Status</div>
                        <div className="popover-option" onClick={() => { setStatusFilter(''); setActiveToolbarPopover(null); }}>
                          {statusFilter === '' ? '✓ ' : ''} All Statuses
                        </div>
                        {(activeBoard.columns?.find(c => c.type === 'status')?.options || INITIAL_STATUS_OPTIONS).map(opt => (
                          <div key={opt.id} className="popover-option" onClick={() => { setStatusFilter(opt.id); setActiveToolbarPopover(null); }}>
                            {statusFilter === opt.id ? '✓ ' : ''}
                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: opt.color, display: 'inline-block', marginRight: '6px' }} />
                            {opt.label || 'Empty'}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Sort */}
                  <div style={{ position: 'relative' }}>
                    <button 
                      type="button" 
                      className={`toolbar-btn ${sortConfig ? 'active-filter-btn' : ''}`} 
                      onClick={() => setActiveToolbarPopover(activeToolbarPopover === 'sort' ? null : 'sort')}
                      aria-label="จัดเรียงลำดับ"
                    >
                      <FiArrowDown aria-hidden="true" /> {sortConfig ? `Sorted` : 'Sort'}
                    </button>
                    {activeToolbarPopover === 'sort' && (
                      <div className="action-popover" style={{ minWidth: '200px' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.78rem', padding: '0.25rem 0.5rem', color: 'var(--text-muted)' }}>Sort Items</div>
                        <div className="popover-option" onClick={() => { setSortConfig(null); setActiveToolbarPopover(null); }}>
                          {sortConfig === null ? '✓ ' : ''} Default Order
                        </div>
                        <div className="popover-option" onClick={() => { setSortConfig({ key: 'title', direction: 'asc' }); setActiveToolbarPopover(null); }}>
                          {sortConfig?.key === 'title' && sortConfig.direction === 'asc' ? '✓ ' : ''} Name (A to Z)
                        </div>
                        <div className="popover-option" onClick={() => { setSortConfig({ key: 'title', direction: 'desc' }); setActiveToolbarPopover(null); }}>
                          {sortConfig?.key === 'title' && sortConfig.direction === 'desc' ? '✓ ' : ''} Name (Z to A)
                        </div>
                        {(activeBoard.columns || []).map(col => (
                          <div key={`sort-${col.id}`} className="popover-option" onClick={() => { setSortConfig({ key: col.id, direction: 'asc' }); setActiveToolbarPopover(null); }}>
                            {sortConfig?.key === col.id ? '✓ ' : ''} By {col.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Hide Columns */}
                  <div style={{ position: 'relative' }}>
                    <button 
                      type="button" 
                      className={`toolbar-btn ${hiddenColumns.length > 0 ? 'active-filter-btn' : ''}`} 
                      onClick={() => setActiveToolbarPopover(activeToolbarPopover === 'hide' ? null : 'hide')}
                      aria-label="ซ่อนคอลัมน์"
                    >
                      <FiEyeOff aria-hidden="true" /> {hiddenColumns.length > 0 ? `Hidden (${hiddenColumns.length})` : 'Hide'}
                    </button>
                    {activeToolbarPopover === 'hide' && (
                      <div className="action-popover" style={{ minWidth: '200px' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.78rem', padding: '0.25rem 0.5rem', color: 'var(--text-muted)' }}>Toggle Column Visibility</div>
                        {(activeBoard.columns || []).map(col => {
                          const isHidden = hiddenColumns.includes(col.id);
                          return (
                            <div 
                              key={`hide-${col.id}`} 
                              className="popover-option" 
                              onClick={() => {
                                if (isHidden) {
                                  setHiddenColumns(hiddenColumns.filter(id => id !== col.id));
                                } else {
                                  setHiddenColumns([...hiddenColumns, col.id]);
                                }
                              }}
                            >
                              <input type="checkbox" checked={!isHidden} readOnly style={{ pointerEvents: 'none', marginRight: '6px' }} />
                              {col.title}
                            </div>
                          );
                        })}
                        {hiddenColumns.length > 0 && (
                          <div 
                            className="popover-option" 
                            style={{ borderTop: '1px solid var(--border-color)', marginTop: '4px', color: 'var(--accent-blue)' }}
                            onClick={() => setHiddenColumns([])}
                          >
                            Show all columns
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Export & Import */}
                  <button type="button" className="toolbar-btn" onClick={handleExportExcel} aria-label="ส่งออก Excel" style={{ color: '#00c875', borderColor: 'rgba(0, 200, 117, 0.4)' }}>
                    📊 Export Excel
                  </button>
                  <button type="button" className="toolbar-btn" onClick={() => fileInputRef.current?.click()} aria-label="นำเข้าไฟล์ Excel หรือ CSV" style={{ color: '#579bfc', borderColor: 'rgba(87, 155, 252, 0.4)' }}>
                    <FiUpload style={{ marginRight: '4px' }} aria-hidden="true" /> Import Excel / CSV
                  </button>
                  <input type="file" ref={fileInputRef} accept=".csv" onChange={handleImportFileChange} style={{ display: 'none' }} aria-label="เลือกไฟล์ CSV สำหรับนำเข้า" />

                  {/* More Options */}
                  <div style={{ position: 'relative' }}>
                    <button 
                      type="button" 
                      className={`toolbar-btn ${groupBy !== 'default' ? 'active-filter-btn' : ''}`} 
                      onClick={() => setActiveToolbarPopover(activeToolbarPopover === 'more' ? null : 'more')}
                      aria-label="ตัวเลือกเพิ่มเติม"
                    >
                      <FiMoreHorizontal aria-hidden="true" />
                    </button>
                    {activeToolbarPopover === 'more' && (
                      <div className="action-popover" style={{ minWidth: '220px', right: 0, left: 'auto' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.78rem', padding: '0.25rem 0.5rem', color: 'var(--text-muted)' }}>Board Settings</div>
                        <div className="popover-option" onClick={() => { setGroupBy(groupBy === 'status' ? 'default' : 'status'); setActiveToolbarPopover(null); }}>
                          <FiLayers /> {groupBy === 'status' ? '✓ จัดกลุ่มตามสถานะ' : 'จัดกลุ่มตามสถานะ (Group by Status)'}
                        </div>
                        <div className="popover-option" onClick={() => { handleDuplicateBoard(activeBoard.id); setActiveToolbarPopover(null); }}>
                          <FiCopy color="#fdab3d" /> คัดลอกบอร์ด (Duplicate Board)
                        </div>
                        <div className="popover-option" onClick={() => { handleAddGroup(); setActiveToolbarPopover(null); }}>
                          <FiPlus color="#00c875" /> เพิ่มกลุ่มงานใหม่ (Add Group)
                        </div>
                        <div className="popover-option" onClick={() => { window.print(); setActiveToolbarPopover(null); }}>
                          <FiPrinter color="#579bfc" /> พิมพ์ / ส่งออก PDF (Print)
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* View Content */}
              <div className="board-container">
                {activeBoard.type === 'grid' && viewType === 'table' && (
                  <TableView 
                    board={activeBoard} 
                    boardId={activeBoard.id}
                    columns={activeBoard.columns}
                    groups={getProcessedGroups()}
                    updateItem={handleUpdateItem}
                    addItem={handleAddItem}
                    addSubitem={handleAddSubitem}
                    deleteItem={handleDeleteItem}
                    addGroup={handleAddGroup}
                    deleteGroup={handleDeleteGroup}
                    renameGroup={handleRenameGroup}
                    addColumn={handleAddColumn}
                    renameColumn={handleRenameColumn}
                    deleteColumn={handleDeleteColumn}
                    updateColumnOptions={handleUpdateColumnOptions}
                    updateColumnWidth={handleUpdateColumnWidth}
                    reorderColumns={handleReorderColumns}
                    reorderItem={handleReorderItem}
                    hiddenColumns={hiddenColumns}
                    onOpenItem={(groupId, itemId) => {
                      setTaskDrawerOpen(true);
                      setActiveItemContext({ groupId, itemId });
                    }}
                    searchQuery={searchQuery}
                    isGroupedByStatus={groupBy === 'status'}
                    allBoards={boards}
                  />
                )}
                {activeBoard.type === 'grid' && viewType === 'kanban' && <KanbanView board={activeBoard} updateItem={handleUpdateItem} addItem={handleAddItem} onOpenItem={(groupId, itemId) => { setTaskDrawerOpen(true); setActiveItemContext({ groupId, itemId }); }} />}
                {activeBoard.type === 'grid' && viewType === 'gantt' && <Suspense fallback={<ViewSkeleton label="กำลังโหลด Timeline..." />}><GanttView board={activeBoard} updateItem={handleUpdateItem} onOpenItem={(groupId, itemId) => { setTaskDrawerOpen(true); setActiveItemContext({ groupId, itemId }); }} /></Suspense>}
                {activeBoard.type === 'grid' && viewType === 'calendar' && <Suspense fallback={<ViewSkeleton label="กำลังโหลดปฏิทิน..." />}><CalendarView board={activeBoard} updateItem={handleUpdateItem} addItem={handleAddItem} readOnly={permissions.isReadOnly} onOpenItem={(groupId, itemId) => { setTaskDrawerOpen(true); setActiveItemContext({ groupId, itemId }); }} /></Suspense>}
                {activeBoard.type === 'grid' && viewType === 'form' && <FormView board={activeBoard} addItem={handleAddItem} updateItem={handleUpdateItem} />}
                {activeBoard.type === 'grid' && viewType === 'presentation' && <Suspense fallback={<ViewSkeleton label="กำลังโหลด Presentation..." />}><PresentationView board={activeBoard} /></Suspense>}
                {activeBoard.type === 'doc' && <Suspense fallback={<ViewSkeleton label="กำลังโหลดเอกสาร..." />}><DocumentView board={activeBoard} updateDocument={handleUpdateDocument} onClose={() => {
                  const firstGrid = boards.find(b => b.type === 'grid');
                  if (firstGrid) setActiveBoardId(firstGrid.id);
                }} /></Suspense>}
                {activeBoard.type === 'dashboard' && (
                  <Suspense fallback={<ViewSkeleton label="กำลังโหลดแดชบอร์ด..." />}>
                  <DashboardView 
                    board={activeBoard} 
                    allBoards={boards} 
                    updateDashboard={handleUpdateDashboard} 
                  />
                  </Suspense>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
              Select a board to view
            </div>
          )}
          </Suspense>
          </ViewErrorBoundary>
        </main>
      </div>

      <TaskDrawer 
        isOpen={taskDrawerOpen} 
        onClose={() => setTaskDrawerOpen(false)} 
        task={getActiveTask()} 
        onUpdate={handleUpdateActiveTaskContext} 
      />

      <AiCopilot 
        activeBoard={activeBoard} 
        boards={boards} 
        isOpen={isAiCopilotOpen}
        onToggleOpen={setIsAiCopilotOpen}
        onAddItem={(taskTitle) => {
          if (activeBoard && activeBoard.groups && activeBoard.groups.length > 0) {
            handleAddItem(activeBoard.groups[0].id, taskTitle);
          }
        }} 
        onAddDocument={(docTitle, content) => {
          const newDoc = {
            id: uuidv4(),
            title: docTitle || 'New Document',
            type: 'doc',
            color: 'var(--accent-purple)',
            content: content || ''
          };
          setBoards(prev => [...prev, newDoc]);
          setActiveBoardId(newDoc.id);
        }} 
      />

      <IntegrationsModal 
        isOpen={integrationsOpen} 
        onClose={() => setIntegrationsOpen(false)} 
      />

      <AutomationsModal 
        isOpen={automationsOpen} 
        onClose={() => setAutomationsOpen(false)}
        recipes={automationRecipes}
        onToggleRecipe={handleToggleAutomation}
        onDeleteRecipe={handleDeleteAutomation}
        onAddRecipe={handleAddAutomation}
      />

      <GlobalSearchModal
        isOpen={globalSearchOpen}
        onClose={() => setGlobalSearchOpen(false)}
        boards={boards}
        recentBoardIds={recentBoardIds}
        onSelectBoard={(id) => {
          setActiveSpecialView(null);
          setActiveBoardId(id);
          trackRecentBoard(id);
        }}
        onOpenItem={(groupId, itemId, boardId) => {
          setTaskDrawerOpen(true);
          setActiveItemContext({ groupId, itemId, boardId });
        }}
      />

      <TemplateCenterModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onUseTemplate={handleUseTemplate}
      />

      {cloudSyncOpen && (
        <CloudSyncModal
          isOpen={cloudSyncOpen}
          onClose={() => setCloudSyncOpen(false)}
          config={cloudConfig}
          syncStatus={syncStatus}
          syncError={syncError}
          lastSyncedAt={lastSyncedAt}
          onSaveConfig={handleSaveCloudConfig}
          onPushNow={() => handlePushNow()}
          onPullNow={() => handlePullNow()}
        />
      )}

      {authModalOpen && (
        <AuthPermissionsModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          currentUser={currentUser}
          workspace={activeWorkspace}
          cloudConfig={cloudConfig}
          onUpdateUser={handleUpdateUser}
          onUpdateMemberRole={handleUpdateMemberRole}
        />
      )}

      <MobileBottomNav 
        activeBoard={activeBoard}
        viewType={viewType}
        onSelectView={setViewType}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onQuickAdd={() => {
          if (activeBoard && activeBoard.groups && activeBoard.groups.length > 0) {
            handleAddItem(activeBoard.groups[0].id, 'New Item');
          }
        }}
        onToggleAi={() => setIsAiCopilotOpen(prev => !prev)}
        isAiOpen={isAiCopilotOpen}
        activeSpecialView={activeSpecialView}
        onSelectSpecialView={setActiveSpecialView}
      />
    </div>
  );
}

export default App;
