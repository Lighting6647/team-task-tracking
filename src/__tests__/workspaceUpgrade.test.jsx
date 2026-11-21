import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import { isCloudConfigured, pushStateToCloud, pullStateFromCloud } from '../utils/cloudSync';

describe('Work OS Architecture Upgrade (Workspace, Global Search, Inbox, Templates, Trash)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('opens Workspace Overview (lazy loaded) from Sidebar and switches tabs', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Workspace overview'));

    expect(await screen.findByText('Recents')).toBeTruthy();
    expect(screen.getByText(/Content \(/)).toBeTruthy();
    expect(screen.getByText(/Collaborators \(/)).toBeTruthy();

    fireEvent.click(screen.getByText(/Collaborators \(/));
    expect(screen.getByText('Ohm Saehae')).toBeTruthy();
  });

  it('opens Global Search Modal via Ctrl+K and searches items across boards', () => {
    render(<App />);
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });

    const searchInput = screen.getByPlaceholderText(/Search for anything/i);
    fireEvent.change(searchInput, { target: { value: 'Payment' } });
    expect(screen.getByText('เชื่อมต่อ Payment Gateway')).toBeTruthy();
  });

  it('opens Update Feed (Inbox) view and filters tabs', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Update feed'));
    expect(screen.getByText('Update Feed (Inbox)')).toBeTruthy();
    expect(screen.getByText('I was mentioned')).toBeTruthy();
  });

  it('creates a new board from Template Center in 1 click', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Workspace overview'));
    const templateBtns = await screen.findAllByText('Start with a template');
    fireEvent.click(templateBtns[0]);

    expect(screen.getByText('Template Center')).toBeTruthy();
    fireEvent.click(screen.getAllByText('ใช้เทมเพลตนี้')[1]); // Sales CRM Pipeline
    expect(await screen.findByDisplayValue('Sales CRM Pipeline')).toBeTruthy();
  });

  it('opens Trash & Archive view from More menu', () => {
    render(<App />);
    fireEvent.click(screen.getByText('More'));
    fireEvent.click(screen.getByText('Trash & Archive'));
    expect(screen.getByText('Recycle Bin (ถังขยะ)')).toBeTruthy();
  });
});

describe('Primary Icon Rail', () => {
  beforeEach(() => localStorage.clear());

  it('switches views in one click and collapses the workspace sidebar', async () => {
    render(<App />);
    const rail = screen.getByRole('navigation', { name: 'Primary Icon Rail' });
    expect(rail).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Inbox' }));
    expect(screen.getByText('Update Feed (Inbox)')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Workspace' }));
    expect(await screen.findByText('Recents')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Collapse workspace sidebar' }));
    expect(screen.getByRole('complementary', { name: 'Main Navigation' }).className).toContain('collapsed');
    expect(localStorage.getItem('tracking_sidebar_collapsed_v1')).toBe('true');
  });

  it('opens Cloud Sync settings from the rail', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Cloud Sync Settings' }));
    expect(screen.getByText('Cloud Sync (Supabase / PostgreSQL API)')).toBeTruthy();
    expect(screen.getByText('Local Storage Only')).toBeTruthy();
  });
});

describe('Cloud Sync service', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  const supabaseCfg = {
    provider: 'supabase',
    supabaseUrl: 'https://demo.supabase.co/',
    supabaseAnonKey: 'anon-key',
    customApiUrl: '',
    workspaceKey: 'light-team',
    autoSync: true,
  };

  it('detects configuration correctly', () => {
    expect(isCloudConfigured({ provider: 'local' })).toBe(false);
    expect(isCloudConfigured({ ...supabaseCfg, supabaseAnonKey: '' })).toBe(false);
    expect(isCloudConfigured(supabaseCfg)).toBe(true);
    expect(isCloudConfigured({ provider: 'custom', customApiUrl: 'https://api.local/sync' })).toBe(true);
  });

  it('skips network calls in local mode', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const res = await pushStateToCloud({ provider: 'local' }, { boards: [] });
    expect(res.skipped).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('upserts to Supabase REST with merge-duplicates header', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, text: async () => '' });
    const res = await pushStateToCloud(supabaseCfg, { boards: [{ id: 'b1' }] });

    expect(res.ok).toBe(true);
    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://demo.supabase.co/rest/v1/tracking_state?on_conflict=id');
    expect(opts.method).toBe('POST');
    expect(opts.headers.Prefer).toContain('merge-duplicates');
    expect(JSON.parse(opts.body).id).toBe('light-team');
  });

  it('pulls payload from Supabase and surfaces HTTP errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => [{ payload: { boards: [{ id: 'remote' }] }, updated_at: '2026-11-21T06:00:00Z' }],
    });
    const res = await pullStateFromCloud(supabaseCfg);
    expect(res.payload.boards[0].id).toBe('remote');

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({ ok: false, status: 401, statusText: 'Unauthorized', text: async () => 'invalid key' });
    await expect(pullStateFromCloud(supabaseCfg)).rejects.toThrow(/401/);
  });
});
