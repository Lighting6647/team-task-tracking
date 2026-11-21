import { v4 as uuidv4 } from 'uuid';

export const AUTOMATIONS_STORAGE_KEY = 'lightbeam_automations_v1';
export const NOTIFICATIONS_STORAGE_KEY = 'lightbeam_notifications_v1';

export const DEFAULT_AUTOMATION_RECIPES = [
  {
    id: 'r1',
    triggerType: 'status_is',
    trigger: 'เมื่อสถานะเปลี่ยนเป็น',
    triggerValue: 'done',
    triggerVal: 'Done (เสร็จสิ้น)',
    actionType: 'move_to_group',
    action: 'ย้ายงานไปยังกลุ่มงาน',
    actionValue: 'Completed Tasks',
    actionVal: 'Completed Tasks',
    active: true
  },
  {
    id: 'r2',
    triggerType: 'status_is',
    trigger: 'เมื่อสถานะเปลี่ยนเป็น',
    triggerValue: 'stuck',
    triggerVal: 'Stuck (ติดขัด)',
    actionType: 'notify',
    action: 'ส่งการแจ้งเตือนไปยัง',
    actionValue: 'ผู้จัดการโปรเจกต์',
    actionVal: 'ผู้จัดการโปรเจกต์',
    active: true
  },
  {
    id: 'r3',
    triggerType: 'item_created',
    trigger: 'เมื่อสร้างงานใหม่ขึ้นในบอร์ด',
    triggerValue: '*',
    triggerVal: 'ทุกรายการ',
    actionType: 'set_department',
    action: 'กำหนดแผนกเริ่มต้นเป็น',
    actionValue: 'dev',
    actionVal: 'ฝ่ายพัฒนาซอฟต์แวร์ (dev)',
    active: true
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'n1',
    title: '⏰ เตือนกำหนดส่งงาน',
    desc: 'งาน "ระบบ Login & Authentication" ในบอร์ด Pass App ถึงกำหนดส่งวันนี้',
    time: '10 นาทีที่แล้ว',
    type: 'warning',
    read: false
  },
  {
    id: 'n2',
    title: '📋 มอบหมายงานใหม่',
    desc: 'คุณได้รับการมอบหมายงาน "ออกแบบ UI/UX หน้า Home" โดย Dev Team',
    time: '1 ชั่วโมงที่แล้ว',
    type: 'info',
    read: false
  },
  {
    id: 'n3',
    title: '📄 อัปเดตเอกสาร MS Word',
    desc: 'เอกสาร "ข้อเสนอโครงการ Pass App" ได้รับการแก้ไขล่าสุดโดยผู้ดูแลระบบ',
    time: '3 ชั่วโมงที่แล้ว',
    type: 'success',
    read: false
  }
];

export function loadAutomations() {
  try {
    const raw = localStorage.getItem(AUTOMATIONS_STORAGE_KEY);
    if (!raw) return DEFAULT_AUTOMATION_RECIPES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_AUTOMATION_RECIPES;
  } catch {
    return DEFAULT_AUTOMATION_RECIPES;
  }
}

export function saveAutomations(recipes) {
  try {
    localStorage.setItem(AUTOMATIONS_STORAGE_KEY, JSON.stringify(recipes));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadNotifications() {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) return INITIAL_NOTIFICATIONS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_NOTIFICATIONS;
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

export function saveNotifications(items) {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(items.slice(0, 30)));
  } catch {
    // Ignore storage quota errors
  }
}

export function createActivityEntry({ action, field = null, from = '', to = '', actor = 'คุณไลท์' }) {
  return {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    actor,
    action,
    field,
    from: from === undefined || from === null ? '' : String(from),
    to: to === undefined || to === null ? '' : String(to)
  };
}

/**
 * ประเมินกฎอัตโนมัติเมื่ออัปเดตฟิลด์ของรายการงาน
 * คืน { groups, notifications } ที่อัปเดตแล้ว
 */
export function runUpdateAutomations({ board, itemId, field, value, recipes }) {
  if (!board || board.type !== 'grid' || field !== 'status') {
    return { groups: board?.groups || [], notifications: [] };
  }

  const activeRecipes = (recipes || []).filter(
    (r) => r.active && r.triggerType === 'status_is' && r.triggerValue === value
  );
  if (activeRecipes.length === 0) {
    return { groups: board.groups || [], notifications: [] };
  }

  let nextGroups = (board.groups || []).map((g) => ({ ...g, items: [...(g.items || [])] }));
  const notifications = [];

  for (const recipe of activeRecipes) {
    const currentGroup = nextGroups.find((g) => g.items.some((i) => i.id === itemId));
    const currentItem = currentGroup?.items.find((i) => i.id === itemId);
    if (!currentItem) continue;

    if (recipe.actionType === 'move_to_group') {
      const targetTitle = recipe.actionValue || 'Completed Tasks';
      if (currentGroup.title.toLowerCase() === targetTitle.toLowerCase()) continue;

      let targetGroup = nextGroups.find((g) => g.title.toLowerCase() === targetTitle.toLowerCase());
      if (!targetGroup) {
        targetGroup = {
          id: uuidv4(),
          title: targetTitle,
          color: '#00c875',
          items: []
        };
        nextGroups.push(targetGroup);
      }

      currentGroup.items = currentGroup.items.filter((i) => i.id !== itemId);
      const logEntry = createActivityEntry({
        actor: 'Automation',
        action: `ย้ายจาก "${currentGroup.title}" ไปยัง "${targetGroup.title}"`,
        field: 'group',
        from: currentGroup.title,
        to: targetGroup.title
      });
      targetGroup.items.push({
        ...currentItem,
        activityLog: [logEntry, ...(currentItem.activityLog || [])].slice(0, 40)
      });

      notifications.push({
        id: uuidv4(),
        title: '⚡ Automation ทำงาน',
        desc: `ย้าย "${currentItem.title}" ไปยังกลุ่ม "${targetGroup.title}" แล้ว`,
        time: 'เมื่อสักครู่',
        type: 'success',
        read: false
      });
    } else if (recipe.actionType === 'set_department') {
      const dept = recipe.actionValue || 'dev';
      currentGroup.items = currentGroup.items.map((item) => {
        if (item.id !== itemId || item.department === dept) return item;
        const logEntry = createActivityEntry({
          actor: 'Automation',
          action: `กำหนดแผนกเป็น "${dept}"`,
          field: 'department',
          from: item.department || '-',
          to: dept
        });
        return {
          ...item,
          department: dept,
          activityLog: [logEntry, ...(item.activityLog || [])].slice(0, 40)
        };
      });
    } else if (recipe.actionType === 'notify') {
      notifications.push({
        id: uuidv4(),
        title: `⚡ แจ้งเตือน (${recipe.actionValue || 'ทีม'})`,
        desc: `งาน "${currentItem.title}" ในบอร์ด ${board.title} เปลี่ยนสถานะเป็น "${recipe.triggerVal}"`,
        time: 'เมื่อสักครู่',
        type: value === 'stuck' ? 'warning' : 'info',
        read: false
      });
    }
  }

  return { groups: nextGroups, notifications };
}

/**
 * ประเมินกฎอัตโนมัติเมื่อสร้างรายการงานใหม่
 */
export function runCreateAutomations({ board, item, recipes }) {
  const activeRecipes = (recipes || []).filter((r) => r.active && r.triggerType === 'item_created');
  let nextItem = { ...item };
  const notifications = [];

  for (const recipe of activeRecipes) {
    if (recipe.actionType === 'set_department' && !nextItem.department) {
      const dept = recipe.actionValue || 'dev';
      nextItem.department = dept;
      nextItem.activityLog = [
        createActivityEntry({
          actor: 'Automation',
          action: `กำหนดแผนกเริ่มต้นเป็น "${dept}"`,
          field: 'department',
          from: '-',
          to: dept
        }),
        ...(nextItem.activityLog || [])
      ];
    } else if (recipe.actionType === 'notify') {
      notifications.push({
        id: uuidv4(),
        title: `⚡ งานใหม่ (${recipe.actionValue || 'ทีม'})`,
        desc: `สร้างงาน "${nextItem.title}" ในบอร์ด ${board?.title || 'Board'}`,
        time: 'เมื่อสักครู่',
        type: 'info',
        read: false
      });
    }
  }

  return { item: nextItem, notifications };
}

/**
 * จัดหมวดหมู่กำหนดส่งงานสำหรับ My Work (Overdue / Today / This Week / Later / No Date / Done)
 */
export function classifyTaskSchedule(task, now = new Date()) {
  if (task.status === 'done') return 'done';
  const rawDate = task.date || task.timeline?.end || task.timeline?.start;
  if (!rawDate) return 'no_date';

  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return 'no_date';

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const due = new Date(parsed);
  due.setHours(0, 0, 0, 0);

  const diffDays = Math.round((due.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'today';
  if (diffDays <= 7) return 'this_week';
  return 'later';
}
