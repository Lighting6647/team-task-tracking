import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Change local storage key to force reset data
code = code.replace("localStorage.getItem('monday_boards_v1')", "localStorage.getItem('monday_boards_v2')")
code = code.replace("localStorage.setItem('monday_boards_v1'", "localStorage.setItem('monday_boards_v2'")

# Define the exact template data matching the screenshot
exact_data = """const TEAM_OPTIONS = [
  { id: 'finance', label: 'Finance', color: '#579bfc' },
  { id: 'sales', label: 'Sales', color: '#c455de' },
  { id: 'partners', label: 'Partners', color: '#00c875' }
];
const SITE_OPTIONS = [
  { id: 'denver', label: 'Denver', color: '#579bfc' },
  { id: 'florida', label: 'Florida', color: '#fdab3d' }
];
const COMPUTER_TYPE_OPTIONS = [
  { id: 'pc', label: 'PC', color: '#c455de' },
  { id: 'mac', label: 'Mac', color: '#00c875' }
];
const DONE_WORKING_OPTIONS = [
  { id: 'done', label: 'Done', color: '#00c875' },
  { id: 'working', label: 'Working on it', color: '#fdab3d' },
  { id: 'empty', label: '', color: '#c4c4c4' }
];

const DEFAULT_COLUMNS = [
  { id: 'person1', title: 'IT owner', type: 'person', width: 100 },
  { id: 'person2', title: 'Responsible...', type: 'person', width: 100 },
  { id: 'date1', title: 'Start date', type: 'date', width: 120 },
  { id: 'team', title: 'Team', type: 'status', width: 100, options: TEAM_OPTIONS },
  { id: 'site', title: 'Site', type: 'status', width: 100, options: SITE_OPTIONS },
  { id: 'comp_type', title: 'Computer t...', type: 'status', width: 120, options: COMPUTER_TYPE_OPTIONS },
  { id: 'comp_setup', title: 'Computer se...', type: 'status', width: 120, options: DONE_WORKING_OPTIONS },
  { id: 'google', title: 'Google acco...', type: 'status', width: 120, options: DONE_WORKING_OPTIONS },
  { id: 'zoom', title: 'Zoom acco...', type: 'status', width: 120, options: DONE_WORKING_OPTIONS },
  { id: 'o365', title: '365 account', type: 'status', width: 120, options: DONE_WORKING_OPTIONS },
  { id: 'setup_desk', title: 'Setup desk mon...', type: 'status', width: 140, options: DONE_WORKING_OPTIONS },
  { id: 'setup_ent', title: 'Setup entrance t...', type: 'status', width: 140, options: DONE_WORKING_OPTIONS },
  { id: 'email', title: 'Email', type: 'text', width: 150 },
];

const INITIAL_BOARDS = [
  {
    id: 'folder-1',
    title: 'IT management',
    type: 'folder',
    parentId: null
  },
  {
    id: 'board-1',
    title: 'IT Onboarding',
    type: 'grid',
    color: 'var(--accent-blue)',
    parentId: 'folder-1',
    columns: DEFAULT_COLUMNS,
    groups: [
      {
        id: 'group-1',
        title: 'More information about this template:',
        color: '#e2445c',
        items: [
          { id: 'i1', title: 'Hi there! 👋 Click here fo...', status: 'empty', person1: '', person2: '', date1: '', team: 'empty', site: 'empty', comp_type: 'empty', comp_setup: 'empty', google: 'empty', zoom: 'empty', o365: 'empty', setup_desk: 'empty', setup_ent: 'empty', email: '' }
        ]
      },
      {
        id: 'group-2',
        title: 'New Hires - June',
        color: '#579bfc',
        items: [
          { id: 'i2', title: 'Employee name 3', status: 'empty', person1: '', person2: '', date1: '2020-06-23', team: 'finance', site: 'denver', comp_type: 'pc', comp_setup: 'working', google: 'empty', zoom: 'empty', o365: 'empty', setup_desk: 'empty', setup_ent: 'empty', email: '' },
          { id: 'i3', title: 'Employee name 5', status: 'empty', person1: '', person2: '', date1: '2020-06-19', team: 'sales', site: 'denver', comp_type: 'pc', comp_setup: 'done', google: 'done', zoom: 'working', o365: 'working', setup_desk: 'done', setup_ent: 'done', email: '' }
        ]
      },
      {
        id: 'group-3',
        title: 'New Hires - May',
        color: '#c455de',
        items: [
          { id: 'i4', title: 'Employee name 4', status: 'empty', person1: '', person2: '', date1: '2020-05-15', team: 'partners', site: 'florida', comp_type: 'mac', comp_setup: 'done', google: 'done', zoom: 'done', o365: 'done', setup_desk: 'done', setup_ent: 'done', email: 'mdislmann@me.c...' }
        ]
      }
    ]
  },
  {
    id: 'board-2',
    title: 'Inventory management',
    type: 'grid',
    parentId: 'folder-1',
    columns: DEFAULT_COLUMNS,
    groups: []
  },
  {
    id: 'board-3',
    title: 'Procurement process',
    type: 'grid',
    parentId: 'folder-1',
    columns: DEFAULT_COLUMNS,
    groups: []
  }
];
"""

# Replace DEFAULT_COLUMNS and INITIAL_BOARDS
code = re.sub(r'const DEFAULT_COLUMNS = \[.*?\];', '', code, flags=re.DOTALL)
code = re.sub(r'const INITIAL_BOARDS = \[.*?\];\n', exact_data, code, flags=re.DOTALL)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
