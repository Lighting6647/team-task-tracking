import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import { evaluateFormula, formatDuration, getElapsedSeconds } from '../utils/formulaEngine';
import { getPermissions } from '../utils/authPermissions';
import { buildBoardFromDelimited } from '../utils/boardImporter';
import TableView from '../components/TableView';

describe('Advance Features: Calendar View, Formula & Time Tracking, Login & Permissions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('switches to Calendar View and renders scheduled board items', async () => {
    render(<App />);
    const calTab = screen.getByRole('tab', { name: /Calendar/i });
    fireEvent.click(calTab);
    expect(calTab.getAttribute('aria-selected')).toBe('true');

    expect(await screen.findByText(/วันนี้ \(Today\)/i)).toBeTruthy();
    expect(screen.getByText('ระบบ Login & Authentication')).toBeTruthy();
  });

  it('evaluates safe formulas and formats time tracking durations accurately', () => {
    const item = { budget: 1000, qty: 3, rate: 500 };
    const cols = [
      { id: 'budget', title: 'Budget' },
      { id: 'qty', title: 'Qty' },
      { id: 'rate', title: 'Rate' },
    ];
    expect(evaluateFormula('{budget} * 1.07', item, cols)).toBe('1,070');
    expect(evaluateFormula('SUM({qty}, 7) * {rate}', item, cols)).toBe('5,000');
    expect(evaluateFormula('ROUND(10 / 3, 2)', item, cols)).toBe('3.33');
    expect(evaluateFormula('invalid_js()', item, cols)).toBe('ERR');

    expect(formatDuration(3661)).toBe('01:01:01');
    expect(getElapsedSeconds({ seconds: 120, runningSince: 10000 }, 15000)).toBe(125);
  });

  it('enforces role permissions and displays Viewer read-only banner when switched to Viewer', () => {
    expect(getPermissions('Owner').canManagePermissions).toBe(true);
    expect(getPermissions('Member').canEditBoards).toBe(true);
    expect(getPermissions('Member').canManagePermissions).toBe(false);
    expect(getPermissions('Viewer').isReadOnly).toBe(true);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'User Login and Permissions' }));
    expect(screen.getByText('User Login & Workspace Permissions')).toBeTruthy();

    const roleSelect = screen.getByDisplayValue(/Owner — สิทธิ์เต็ม/);
    fireEvent.change(roleSelect, { target: { value: 'Viewer' } });
    fireEvent.click(screen.getByText('บันทึกบัญชี & สิทธิ์'));

    expect(screen.getByText(/โหมดดูอย่างเดียว \(Viewer — Read-only\)/)).toBeTruthy();
  });

  it('renders unlocked Permissions tab inside Workspace Overview', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Workspace' }));
    const permTab = await screen.findByText('Permissions');
    fireEvent.click(permTab);
    expect(screen.getByText(/สิทธิ์ของคุณปัจจุบัน:/)).toBeTruthy();
  });

  it('parses CSV/Excel tables with automatic column type inference and creates a board', () => {
    const csv = `Task,Owner,Status,Budget,Due Date
Build API,Dev Team,Done,50000,2026-11-30
Design UI,Design Team,Working on it,30000,05/12/2569`;
    const board = buildBoardFromDelimited({ boardTitle: 'Q4 Plan', rawText: csv, workspaceId: 'ws-main' });

    expect(board.title).toBe('Q4 Plan');
    expect(board.columns.map((c) => c.type)).toEqual(['person', 'status', 'number', 'date']);
    expect(board.groups[0].items.length).toBe(2);
    expect(board.groups[0].items[0].col_3_budget).toBe(50000);
    expect(board.groups[0].items[1].col_4_due_date).toBe('2026-12-05');
  });

  it('imports CSV via ImportBoardModal directly into the app', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Workspace' }));
    fireEvent.click(await screen.findByText('Import CSV / Excel'));
    expect(screen.getByText('Import Excel / CSV เป็น Board อัตโนมัติ')).toBeTruthy();

    fireEvent.click(screen.getByText(/ใส่ข้อมูลตัวอย่าง/));
    fireEvent.click(screen.getByText(/สร้าง Board ทันที \(3 รายการ\)/));
    expect(await screen.findByDisplayValue('แผนงานเปิดตัวสินค้า (Imported)')).toBeTruthy();
  });

  it('renders Group Summary Footer with Status Battery Bar, Number SUM, and Total Time Tracking', () => {
    const mockBoard = {
      id: 'b-sum',
      columns: [
        { id: 'status', title: 'Status', type: 'status', options: [{ id: 'done', label: 'Done', color: '#00c875' }, { id: 'working', label: 'Working', color: '#fdab3d' }] },
        { id: 'budget', title: 'Budget', type: 'number' },
        { id: 'timer', title: 'Time', type: 'time_tracking' },
      ],
      groups: [
        {
          id: 'g1',
          title: 'Sprint A',
          color: '#0073ea',
          items: [
            { id: 'i1', title: 'Task 1', status: 'done', budget: 1500, timer: { seconds: 3600, runningSince: null } },
            { id: 'i2', title: 'Task 2', status: 'working', budget: 2500, timer: { seconds: 1800, runningSince: null } },
          ],
        },
      ],
    };

    render(<TableView board={mockBoard} updateItem={() => {}} deleteItem={() => {}} />);
    expect(screen.getByLabelText('Status battery summary')).toBeTruthy();
    expect(screen.getByText('50% Done')).toBeTruthy();
    expect(screen.getByText('Σ 4,000')).toBeTruthy();
    expect(screen.getByText('⏱ 01:30:00')).toBeTruthy();
  });
});
