import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from '../App';

describe('LightBeam OS - Complete Feature & Navigation Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders application branding and header controls', () => {
    render(<App />);
    expect(screen.getAllByText(/LightBeam OS/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('toolbar', { name: /Board actions/i })).toBeDefined();
    expect(screen.getByRole('tablist', { name: /Board view options/i })).toBeDefined();
  });

  it('toggles theme between dark and light mode', () => {
    render(<App />);
    const themeBtn = screen.getByTitle(/สลับธีม สว่าง \/ มืด/i);
    expect(themeBtn).toBeDefined();
    
    // Initial theme is dark
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    // Click to toggle to light
    fireEvent.click(themeBtn);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    // Click to toggle back to dark
    fireEvent.click(themeBtn);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('navigates through all Sidebar special views: My Work, AI Notetaker, and Home', () => {
    render(<App />);
    
    // 1. My Work
    const myWorkMenu = screen.getByText('My work');
    fireEvent.click(myWorkMenu);
    expect(screen.getAllByText(/📋 My Work/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/งานทั้งหมด/i).length).toBeGreaterThan(0);

    // 2. AI Notetaker
    const notetakerMenu = screen.getByText('AI Notetaker');
    fireEvent.click(notetakerMenu);
    expect(screen.getByText(/AI Meeting Notetaker & Task Extractor/i)).toBeDefined();

    // 3. Home (back to main grid)
    const homeMenu = screen.getByText('Home');
    fireEvent.click(homeMenu);
    expect(screen.getByRole('tablist', { name: /Board view options/i })).toBeDefined();
  });

  it('switches between all 5 Board View tabs: Table, Kanban, Timeline, Form, Presentation', () => {
    render(<App />);

    // 1. Kanban View
    const kanbanTab = screen.getByRole('tab', { name: /Kanban/i });
    fireEvent.click(kanbanTab);
    expect(kanbanTab.getAttribute('aria-selected')).toBe('true');

    // 2. Timeline View
    const timelineTab = screen.getByRole('tab', { name: /Timeline/i });
    fireEvent.click(timelineTab);
    expect(timelineTab.getAttribute('aria-selected')).toBe('true');

    // 3. Form View
    const formTab = screen.getByRole('tab', { name: /Form/i });
    fireEvent.click(formTab);
    expect(formTab.getAttribute('aria-selected')).toBe('true');
    expect(screen.getAllByText(/Form/i).length).toBeGreaterThan(0);

    // 4. Presentation View
    const presentationTab = screen.getByRole('tab', { name: /Presentation/i });
    fireEvent.click(presentationTab);
    expect(presentationTab.getAttribute('aria-selected')).toBe('true');
    expect(screen.getAllByText(/PowerPoint Mode/i).length).toBeGreaterThan(0);

    // 5. Back to Main Table
    const tableTab = screen.getByRole('tab', { name: /Main table/i });
    fireEvent.click(tableTab);
    expect(tableTab.getAttribute('aria-selected')).toBe('true');
  });

  it('tests Toolbar New Item function', () => {
    render(<App />);
    const newItemBtn = screen.getByRole('button', { name: /เพิ่มรายการงานใหม่/i });
    expect(newItemBtn).toBeDefined();
    fireEvent.click(newItemBtn);
    
    // Should have added a "New Item"
    expect(screen.getAllByText('New Item').length).toBeGreaterThan(0);
  });

  it('tests Toolbar Search function in real time', () => {
    render(<App />);
    const searchBtn = screen.getByRole('button', { name: /ค้นหารายการ/i });
    fireEvent.click(searchBtn);

    // Search input appears
    const searchInput = screen.getByPlaceholderText(/Search items, owner, dept/i);
    expect(searchInput).toBeDefined();

    // Type query
    fireEvent.change(searchInput, { target: { value: 'Authentication' } });
    expect(searchInput.value).toBe('Authentication');

    // Close search
    const closeBtn = screen.getByText(/Close/i);
    fireEvent.click(closeBtn);
  });

  it('tests Toolbar Person filter popover', () => {
    const { container } = render(<App />);
    const personBtn = screen.getByRole('button', { name: /กรองตามผู้รับผิดชอบ/i });
    fireEvent.click(personBtn);

    expect(screen.getByText(/Filter by Person/i)).toBeDefined();
    const allPeopleOption = container.querySelector('.popover-option');
    expect(allPeopleOption).toBeDefined();
    fireEvent.click(allPeopleOption);
  });

  it('tests Toolbar Status filter popover', () => {
    const { container } = render(<App />);
    const filterBtn = screen.getByRole('button', { name: /ตัวกรองเงื่อนไข/i });
    fireEvent.click(filterBtn);

    expect(screen.getByText(/Filter by Status/i)).toBeDefined();
    const options = container.querySelectorAll('.popover-option');
    expect(options.length).toBeGreaterThan(0);
    // Click second option
    fireEvent.click(options[1]);
  });

  it('tests Toolbar Sort popover', () => {
    render(<App />);
    const sortBtn = screen.getByRole('button', { name: /จัดเรียงลำดับ/i });
    fireEvent.click(sortBtn);

    expect(screen.getByText(/Sort Items/i)).toBeDefined();
    expect(screen.getByText(/Default Order/i)).toBeDefined();
    expect(screen.getByText(/Name \(A to Z\)/i)).toBeDefined();

    // Click A-Z sort
    fireEvent.click(screen.getByText(/Name \(A to Z\)/i));
  });

  it('tests Toolbar Hide Columns popover', () => {
    render(<App />);
    const hideBtn = screen.getByRole('button', { name: /ซ่อนคอลัมน์/i });
    fireEvent.click(hideBtn);

    expect(screen.getByText(/Toggle Column Visibility/i)).toBeDefined();
  });

  it('tests Toolbar More options: Group by status and Duplicate board', () => {
    render(<App />);
    const moreBtn = screen.getByRole('button', { name: /ตัวเลือกเพิ่มเติม/i });
    fireEvent.click(moreBtn);

    expect(screen.getByText(/Board Settings/i)).toBeDefined();
    expect(screen.getByText(/จัดกลุ่มตามสถานะ/i)).toBeDefined();
    expect(screen.getByText(/คัดลอกบอร์ด/i)).toBeDefined();

    // Click Duplicate board
    fireEvent.click(screen.getByText(/คัดลอกบอร์ด/i));
    expect(screen.getAllByDisplayValue(/คัดลอก/i).length).toBeGreaterThan(0);
  });

  it('tests Notification Center popover', () => {
    render(<App />);
    const notifBtns = screen.getAllByTitle(/การแจ้งเตือน \(Notifications\)/i);
    fireEvent.click(notifBtns[0]);

    expect(screen.getByText(/ศูนย์การแจ้งเตือน \(Notifications\)/i)).toBeDefined();
    expect(screen.getByText(/เตือนกำหนดส่งงาน/i)).toBeDefined();
  });

  it('tests Integrations Modal open and Escape key close', () => {
    render(<App />);
    const integrateBadge = screen.getByTitle(/เปิดศูนย์เชื่อมต่อระบบภายนอก/i);
    fireEvent.click(integrateBadge);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeDefined();
    expect(dialog.textContent).toContain('Integrations');

    // Press Escape to close
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('tests Automations Modal open and close button', () => {
    render(<App />);
    const automateBadge = screen.getByTitle(/เปิดศูนย์ทำงานอัตโนมัติ/i);
    fireEvent.click(automateBadge);

    expect(screen.getByRole('dialog', { name: /ระบบทำงานอัตโนมัติ/i })).toBeDefined();

    // Close button
    const closeBtn = screen.getByLabelText(/ปิดหน้าต่าง Automations/i);
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('dialog', { name: /ระบบทำงานอัตโนมัติ/i })).toBeNull();
  });

  it('tests AI Copilot assistant interactions', async () => {
    render(<App />);
    const copilotTrigger = screen.getByText(/AI Copilot Assistant/i);
    fireEvent.click(copilotTrigger);

    // Chat panel opened
    expect(screen.getByPlaceholderText(/ถาม AI ให้สรุปงาน หรือร่างเอกสาร/i)).toBeDefined();

    // Click Quick Action Chip: สรุปภาพรวม
    const summaryChip = screen.getByText(/📊 สรุปภาพรวม/i);
    fireEvent.click(summaryChip);

    await waitFor(() => {
      expect(screen.getByText(/สรุปภาพรวมบอร์ด/i)).toBeDefined();
    }, { timeout: 2000 });
  });

  it('tests Task Drawer opening, updates, and tabs', () => {
    render(<App />);
    
    // Find open task details button
    const openTaskBtns = screen.getAllByTitle(/Open task details/i);
    expect(openTaskBtns.length).toBeGreaterThan(0);
    fireEvent.click(openTaskBtns[0]);

    // Drawer should open
    const drawer = screen.getByRole('dialog');
    expect(drawer).toBeDefined();

    // Switch to Description tab
    const descTab = screen.getByRole('tab', { name: /Description/i });
    fireEvent.click(descTab);
    expect(descTab.getAttribute('aria-selected')).toBe('true');

    // Close drawer
    const closeDrawerBtn = screen.getByLabelText(/ปิดหน้ารายละเอียดงาน/i);
    fireEvent.click(closeDrawerBtn);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('tests Navigation to Document Board and rich text view mode', () => {
    render(<App />);

    // Find Document Board in Sidebar
    const docItem = screen.getByText(/เอกสารข้อเสนอโครงการ Pass App/i);
    fireEvent.click(docItem);

    // Document header elements appear
    expect(screen.getAllByText(/Word/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/บันทึก/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/พิมพ์ \/ PDF/i)).toBeDefined();
  });

  it('tests Navigation to Dashboard Board and summary charts', () => {
    render(<App />);

    // Find Dashboard in Sidebar
    const dashboardItem = screen.getByText(/ภาพรวมโปรเจกต์/i);
    fireEvent.click(dashboardItem);

    // Dashboard widgets render
    expect(screen.getByText(/สถานะงานในโปรเจกต์/i)).toBeDefined();
    expect(screen.getByText(/AI Widget Creator/i)).toBeDefined();
  });

  it('tests Form View submission adds new item into the board', () => {
    render(<App />);

    // Switch to Form tab
    const formTab = screen.getByRole('tab', { name: /Form/i });
    fireEvent.click(formTab);

    // Fill form input
    const nameInput = screen.getByPlaceholderText(/Enter item name/i);
    fireEvent.change(nameInput, { target: { value: 'Feature Request: OAuth 2.0' } });

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Submit/i });
    fireEvent.click(submitBtn);

    // Confirmation message shown
    expect(screen.getByText(/Thank you!/i)).toBeDefined();
    expect(screen.getByText(/Your response has been submitted successfully/i)).toBeDefined();

    // Switch back to Main table
    const tableTab = screen.getByRole('tab', { name: /Main table/i });
    fireEvent.click(tableTab);

    // Verify item is in table
    expect(screen.getByDisplayValue('Feature Request: OAuth 2.0')).toBeDefined();
  });

  it('tests AI Notetaker task extraction and batch import to board', () => {
    render(<App />);

    // Navigate to AI Notetaker
    const notetakerMenu = screen.getByText('AI Notetaker');
    fireEvent.click(notetakerMenu);

    // Click Extract Action Items
    const extractBtn = screen.getByText(/สกัด Action Items ด้วย AI/i);
    fireEvent.click(extractBtn);

    // Click Import All to Board
    const importAllBtn = screen.getByText(/นำเข้าสู่บอร์ด/i);
    fireEvent.click(importAllBtn);

    // Verify success banner
    expect(screen.getByText(/บันทึกเข้าบอร์ดแล้ว/i)).toBeDefined();
  });

  it('tests My Work status filtering', () => {
    render(<App />);

    // Navigate to My Work
    const myWorkMenu = screen.getByText('My work');
    fireEvent.click(myWorkMenu);

    // Click "กำลังทำ" filter button
    const workingFilterBtn = screen.getByRole('button', { name: 'กำลังทำ' });
    fireEvent.click(workingFilterBtn);

    // Click "เสร็จสิ้น" filter button
    const doneFilterBtn = screen.getByRole('button', { name: 'เสร็จสิ้น' });
    fireEvent.click(doneFilterBtn);

    // Click "ทั้งหมด" filter button
    const allFilterBtn = screen.getByRole('button', { name: 'ทั้งหมด' });
    fireEvent.click(allFilterBtn);
    expect(screen.getAllByText(/Pass App ›/i).length).toBeGreaterThan(0);
  });

  it('tests Stay Awake screen wake lock toggle and presentation badge', async () => {
    render(<App />);

    // Toggle Stay Awake button in header
    const stayAwakeBtns = screen.getAllByRole('button', { name: /ระบบป้องกันหน้าจอดับ/i });
    expect(stayAwakeBtns.length).toBeGreaterThan(0);
    fireEvent.click(stayAwakeBtns[0]);

    // Click again to turn back on
    fireEvent.click(stayAwakeBtns[0]);

    // Switch to Presentation view
    const presentationTab = screen.getByRole('tab', { name: /Presentation/i });
    fireEvent.click(presentationTab);

    // Verify stay awake badge is visible in presentation mode
    await waitFor(() => {
      expect(screen.getByText(/จอเปิดตลอด \(Stay Awake\)|โหมดนำเสนอ/i)).toBeDefined();
    });
  });
});
