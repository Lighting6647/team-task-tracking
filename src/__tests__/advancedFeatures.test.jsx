import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import { evaluateFormula, formatDuration, getElapsedSeconds } from '../utils/formulaEngine';
import { getPermissions } from '../utils/authPermissions';

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
});
