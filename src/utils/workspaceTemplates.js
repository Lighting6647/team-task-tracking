import { v4 as uuidv4 } from 'uuid';

export const DEFAULT_WORKSPACES = [
  {
    id: 'ws-main',
    name: 'Main workspace',
    description: 'พื้นที่ทำงานหลักสำหรับบริหารจัดการโปรเจกต์ ทีมงาน และติดตามงานทั้งหมด',
    color: '#0073ea',
    type: 'open',
    members: [
      { id: 'u1', name: 'Ohm Saehae', email: 'lighting6647@gmail.com', role: 'Owner' },
      { id: 'u2', name: 'Dev Team', email: 'dev@lightbeam.local', role: 'Member' },
      { id: 'u3', name: 'Design Team', email: 'design@lightbeam.local', role: 'Member' },
      { id: 'u4', name: 'Finance', email: 'finance@lightbeam.local', role: 'Member' },
    ],
  },
];

export const BOARD_TEMPLATES = [
  {
    id: 'tpl-project-sprint',
    name: 'Project Management & Sprint',
    category: 'Project Management',
    description: 'บริหารโปรเจกต์ แบ่ง Sprint ติดตาม Owner, Status, Priority และ Due Date',
    color: '#0073ea',
    badge: 'Popular',
    buildBoard: (workspaceId) => ({
      id: `board-${uuidv4()}`,
      workspaceId,
      title: 'Project Management & Sprint',
      type: 'grid',
      color: '#0073ea',
      parentId: null,
      columns: [
        { id: 'owner', title: 'Owner', type: 'person', width: 130 },
        {
          id: 'status',
          title: 'Status',
          type: 'status',
          width: 140,
          options: [
            { id: 'done', label: 'Done', color: '#00c875' },
            { id: 'working', label: 'Working on it', color: '#fdab3d' },
            { id: 'stuck', label: 'Stuck', color: '#e2445c' },
            { id: 'empty', label: '', color: '#c4c4c4' },
          ],
        },
        {
          id: 'priority',
          title: 'Priority',
          type: 'status',
          width: 130,
          options: [
            { id: 'critical', label: 'Critical', color: '#333333' },
            { id: 'high', label: 'High', color: '#e2445c' },
            { id: 'medium', label: 'Medium', color: '#fdab3d' },
            { id: 'low', label: 'Low', color: '#579bfc' },
          ],
        },
        { id: 'date', title: 'Due Date', type: 'date', width: 140 },
        { id: 'budget', title: 'Est. Hours', type: 'number', width: 110 },
      ],
      groups: [
        {
          id: `g-${uuidv4()}`,
          title: 'Planning & Discovery',
          color: '#579bfc',
          items: [
            { id: `i-${uuidv4()}`, title: 'กำหนดขอบเขตงาน (Scope & Requirements)', owner: 'Ohm Saehae', status: 'done', priority: 'high', date: '2026-11-25', budget: 8 },
            { id: `i-${uuidv4()}`, title: 'ออกแบบสถาปัตยกรรมระบบ & UI Wireframe', owner: 'Design Team', status: 'working', priority: 'high', date: '2026-11-28', budget: 16 },
          ],
        },
        {
          id: `g-${uuidv4()}`,
          title: 'Active Sprint',
          color: '#00c875',
          items: [
            { id: `i-${uuidv4()}`, title: 'พัฒนา Core Feature และเชื่อมต่อ API', owner: 'Dev Team', status: 'working', priority: 'critical', date: '2026-12-05', budget: 24 },
            { id: `i-${uuidv4()}`, title: 'ทดสอบ QA & Deploy ขึ้น Production', owner: 'Dev Team', status: 'empty', priority: 'medium', date: '2026-12-10', budget: 12 },
          ],
        },
      ],
    }),
  },
  {
    id: 'tpl-sales-crm',
    name: 'Sales CRM & Deal Pipeline',
    category: 'Sales & CRM',
    description: 'ติดตามลีด ลูกค้าเป้าหมาย มูลค่าดีล และสถานะการปิดการขาย',
    color: '#00c875',
    badge: 'CRM',
    buildBoard: (workspaceId) => ({
      id: `board-${uuidv4()}`,
      workspaceId,
      title: 'Sales CRM Pipeline',
      type: 'grid',
      color: '#00c875',
      parentId: null,
      columns: [
        { id: 'owner', title: 'Sales Rep', type: 'person', width: 130 },
        {
          id: 'status',
          title: 'Stage',
          type: 'status',
          width: 150,
          options: [
            { id: 'won', label: 'Closed Won', color: '#00c875' },
            { id: 'proposal', label: 'Proposal Sent', color: '#579bfc' },
            { id: 'negotiation', label: 'Negotiation', color: '#fdab3d' },
            { id: 'lost', label: 'Closed Lost', color: '#e2445c' },
          ],
        },
        { id: 'dealValue', title: 'Deal Value (฿)', type: 'number', width: 140 },
        { id: 'date', title: 'Close Date', type: 'date', width: 140 },
      ],
      groups: [
        {
          id: `g-${uuidv4()}`,
          title: 'Active Leads',
          color: '#00c875',
          items: [
            { id: `i-${uuidv4()}`, title: 'บริษัท สยามเทค จำกัด — แพ็กเกจ Enterprise', owner: 'Ohm Saehae', status: 'negotiation', dealValue: 185000, date: '2026-11-30' },
            { id: `i-${uuidv4()}`, title: 'คลินิกเฟิร์น — ระบบจัดการสาขา', owner: 'Ohm Saehae', status: 'proposal', dealValue: 95000, date: '2026-12-04' },
          ],
        },
        {
          id: `g-${uuidv4()}`,
          title: 'Closed Deals',
          color: '#579bfc',
          items: [
            { id: `i-${uuidv4()}`, title: 'หจก. แสงทองค้าส่ง — ระบบ POS + Inventory', owner: 'Ohm Saehae', status: 'won', dealValue: 120000, date: '2026-11-15' },
          ],
        },
      ],
    }),
  },
  {
    id: 'tpl-marketing-calendar',
    name: 'Marketing & Content Calendar',
    category: 'Marketing',
    description: 'วางแผนคอนเทนต์ แคมเปญโฆษณา ช่องทางโพสต์ และงบประมาณ',
    color: '#c455de',
    badge: 'Creative',
    buildBoard: (workspaceId) => ({
      id: `board-${uuidv4()}`,
      workspaceId,
      title: 'Marketing Content Calendar',
      type: 'grid',
      color: '#c455de',
      parentId: null,
      columns: [
        { id: 'owner', title: 'Creator', type: 'person', width: 130 },
        {
          id: 'status',
          title: 'Status',
          type: 'status',
          width: 140,
          options: [
            { id: 'published', label: 'Published', color: '#00c875' },
            { id: 'review', label: 'In Review', color: '#fdab3d' },
            { id: 'draft', label: 'Drafting', color: '#579bfc' },
            { id: 'empty', label: 'Idea', color: '#c4c4c4' },
          ],
        },
        {
          id: 'channel',
          title: 'Channel',
          type: 'status',
          width: 130,
          options: [
            { id: 'fb', label: 'Facebook / IG', color: '#579bfc' },
            { id: 'tiktok', label: 'TikTok', color: '#333333' },
            { id: 'line', label: 'LINE OA', color: '#00c875' },
          ],
        },
        { id: 'date', title: 'Publish Date', type: 'date', width: 140 },
        { id: 'adBudget', title: 'Ad Budget (฿)', type: 'number', width: 130 },
      ],
      groups: [
        {
          id: `g-${uuidv4()}`,
          title: 'แคมเปญเดือนนี้',
          color: '#c455de',
          items: [
            { id: `i-${uuidv4()}`, title: 'คลิปสั้นเปิดตัวฟีเจอร์ AI Automation', owner: 'Design Team', status: 'review', channel: 'tiktok', date: '2026-11-26', adBudget: 15000 },
            { id: `i-${uuidv4()}`, title: 'บรอดแคสต์โปรโมชันปลายปีลูกค้าเก่า', owner: 'Marketing', status: 'draft', channel: 'line', date: '2026-12-01', adBudget: 5000 },
          ],
        },
      ],
    }),
  },
  {
    id: 'tpl-it-support',
    name: 'IT Support & Ticket Desk',
    category: 'IT & Operations',
    description: 'รับแจ้งซ่อม ปัญหาเซิร์ฟเวอร์ อุปกรณ์สำนักงาน พร้อมระดับความเร่งด่วน SLA',
    color: '#fdab3d',
    badge: 'Service',
    buildBoard: (workspaceId) => ({
      id: `board-${uuidv4()}`,
      workspaceId,
      title: 'IT Support & Ticket Desk',
      type: 'grid',
      color: '#fdab3d',
      parentId: null,
      columns: [
        { id: 'owner', title: 'IT Assignee', type: 'person', width: 130 },
        {
          id: 'status',
          title: 'Ticket Status',
          type: 'status',
          width: 140,
          options: [
            { id: 'resolved', label: 'Resolved', color: '#00c875' },
            { id: 'working', label: 'Investigating', color: '#fdab3d' },
            { id: 'stuck', label: 'Escalated', color: '#e2445c' },
            { id: 'empty', label: 'New', color: '#579bfc' },
          ],
        },
        { id: 'date', title: 'SLA Target', type: 'date', width: 140 },
      ],
      groups: [
        {
          id: `g-${uuidv4()}`,
          title: 'Open Tickets',
          color: '#e2445c',
          items: [
            { id: `i-${uuidv4()}`, title: 'อัปเดตสิทธิ์ VPN พนักงานใหม่สาขา 2', owner: 'Dev Team', status: 'working', date: '2026-11-22' },
            { id: `i-${uuidv4()}`, title: 'ตรวจสอบ Backup ฐานข้อมูลรายวัน', owner: 'Ohm Saehae', status: 'resolved', date: '2026-11-21' },
          ],
        },
      ],
    }),
  },
  {
    id: 'tpl-budget-ops',
    name: 'Operations & Budget Tracker',
    category: 'Finance & Ops',
    description: 'ติดตามงบประมาณ ค่าใช้จ่ายรายเดือน และสถานะการอนุมัติจ่าย',
    color: '#e2445c',
    badge: 'Finance',
    buildBoard: (workspaceId) => ({
      id: `board-${uuidv4()}`,
      workspaceId,
      title: 'Operations & Budget Tracker',
      type: 'grid',
      color: '#e2445c',
      parentId: null,
      columns: [
        { id: 'owner', title: 'Requester', type: 'person', width: 130 },
        {
          id: 'status',
          title: 'Approval',
          type: 'status',
          width: 140,
          options: [
            { id: 'approved', label: 'Approved', color: '#00c875' },
            { id: 'pending', label: 'Pending', color: '#fdab3d' },
            { id: 'rejected', label: 'Rejected', color: '#e2445c' },
          ],
        },
        { id: 'amount', title: 'Amount (฿)', type: 'number', width: 130 },
        { id: 'date', title: 'Payment Date', type: 'date', width: 140 },
      ],
      groups: [
        {
          id: `g-${uuidv4()}`,
          title: 'Monthly Expenses',
          color: '#fdab3d',
          items: [
            { id: `i-${uuidv4()}`, title: 'ค่า Cloud Hosting & Database (Vercel / AWS)', owner: 'Finance', status: 'approved', amount: 8500, date: '2026-11-28' },
            { id: `i-${uuidv4()}`, title: 'ค่าซอฟต์แวร์ลิขสิทธิ์ทีมพัฒนา', owner: 'Ohm Saehae', status: 'pending', amount: 12400, date: '2026-12-01' },
          ],
        },
      ],
    }),
  },
];
