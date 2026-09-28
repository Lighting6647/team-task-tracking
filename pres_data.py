import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Change local storage key to force reset data to the new presentation data
code = code.replace("localStorage.getItem('monday_boards_v2')", "localStorage.getItem('monday_boards_v3')")
code = code.replace("localStorage.setItem('monday_boards_v2'", "localStorage.setItem('monday_boards_v3'")

presentation_data = """const TEAM_OPTIONS = [
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
    widgets: []
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
"""

# Replace exact_data section with presentation_data
code = re.sub(r'const TEAM_OPTIONS = \[.*?(?=const App = \(\) => {)', presentation_data, code, flags=re.DOTALL)

# Make Pass App the default active board
code = code.replace("const [activeBoardId, setActiveBoardId] = useState('board-1');",
                    "const [activeBoardId, setActiveBoardId] = useState('board-passapp-1');")

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
