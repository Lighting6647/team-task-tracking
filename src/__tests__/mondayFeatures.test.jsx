import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from '../App';
import {
  classifyTaskSchedule,
  DEFAULT_AUTOMATION_RECIPES,
  runCreateAutomations,
  runUpdateAutomations
} from '../utils/automationEngine';

describe('Monday.com Architecture Features in Tracking Light', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('executes status_is -> move_to_group automation and emits notification', () => {
    const board = {
      id: 'b1',
      title: 'Test Board',
      type: 'grid',
      groups: [
        {
          id: 'g1',
          title: 'Sprint 1',
          color: '#579bfc',
          items: [{ id: 'i1', title: 'Build API', status: 'done', activityLog: [] }]
        }
      ]
    };

    const result = runUpdateAutomations({
      board,
      itemId: 'i1',
      field: 'status',
      value: 'done',
      recipes: DEFAULT_AUTOMATION_RECIPES
    });

    expect(result.groups).toHaveLength(2);
    expect(result.groups[0].items).toHaveLength(0);
    expect(result.groups[1].title).toBe('Completed Tasks');
    expect(result.groups[1].items[0].id).toBe('i1');
    expect(result.groups[1].items[0].activityLog[0].actor).toBe('Automation');
    expect(result.notifications).toHaveLength(1);
    expect(result.notifications[0].desc).toContain('Completed Tasks');
  });

  it('executes item_created automation to set default department', () => {
    const board = { id: 'b1', title: 'Test Board', type: 'grid', groups: [] };
    const result = runCreateAutomations({
      board,
      item: { id: 'i2', title: 'New Task', activityLog: [] },
      recipes: DEFAULT_AUTOMATION_RECIPES
    });

    expect(result.item.department).toBe('dev');
    expect(result.item.activityLog[0].field).toBe('department');
  });

  it('classifies tasks into overdue, today, this_week, later, no_date, and done buckets', () => {
    const refDate = new Date('2026-11-20T12:00:00');
    expect(classifyTaskSchedule({ status: 'done', date: '2026-11-01' }, refDate)).toBe('done');
    expect(classifyTaskSchedule({ status: 'working', date: '2026-11-18' }, refDate)).toBe('overdue');
    expect(classifyTaskSchedule({ status: 'working', date: '2026-11-20' }, refDate)).toBe('today');
    expect(classifyTaskSchedule({ status: 'working', date: '2026-11-24' }, refDate)).toBe('this_week');
    expect(classifyTaskSchedule({ status: 'working', date: '2026-12-15' }, refDate)).toBe('later');
    expect(classifyTaskSchedule({ status: 'working' }, refDate)).toBe('no_date');
  });

  it('renders group footer item counts and completion summary in TableView', () => {
    render(<App />);
    expect(screen.getAllByText(/รายการ$/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/% Done/).length).toBeGreaterThan(0);
  });

  it('displays schedule-grouped sections and toggle in MyWorkView', () => {
    render(<App />);
    fireEvent.click(screen.getByText('My work'));

    expect(screen.getByText(/จัดกลุ่มตามกำหนดส่ง/)).toBeDefined();
    expect(screen.getByText(/เสร็จแล้ว \(Done\)/)).toBeDefined();

    fireEvent.click(screen.getByText(/จัดกลุ่มตามกำหนดส่ง/));
    expect(screen.getByText(/รายการทั้งหมด/)).toBeDefined();
  });

  it('records and displays Activity Log inside TaskDrawer', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /เพิ่มรายการงานใหม่/i }));

    const newItemInputs = screen.getAllByDisplayValue('New Item');
    const newItemRow = newItemInputs[0].closest('tr');
    const detailBtn = newItemRow.querySelector('[title="Open task details"]');
    fireEvent.click(detailBtn);

    const activityTab = screen.getByRole('tab', { name: /Activity Log/i });
    fireEvent.click(activityTab);
    expect(activityTab.getAttribute('aria-selected')).toBe('true');
    expect(screen.getByText(/สร้างรายการงาน "New Item"/)).toBeDefined();
    expect(screen.getByText(/กำหนดแผนกเริ่มต้นเป็น "dev"/)).toBeDefined();
  });
});
