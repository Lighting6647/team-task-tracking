import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('Work OS Architecture Upgrade (Workspace, Global Search, Inbox, Templates, Trash)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('opens Workspace Overview from Sidebar and switches tabs', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Workspace overview'));

    expect(screen.getByText('Recents')).toBeTruthy();
    expect(screen.getByText(/Content \(/)).toBeTruthy();
    expect(screen.getByText(/Collaborators \(/)).toBeTruthy();
    expect(screen.getAllByText('Start with a template').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByText(/Collaborators \(/));
    expect(screen.getByText('Ohm Saehae')).toBeTruthy();
  });

  it('opens Global Search Modal via Ctrl+K and searches items across boards', () => {
    render(<App />);
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });

    const searchInput = screen.getByPlaceholderText(/Search for anything/i);
    expect(searchInput).toBeTruthy();

    fireEvent.change(searchInput, { target: { value: 'Payment' } });
    expect(screen.getByText('เชื่อมต่อ Payment Gateway')).toBeTruthy();
  });

  it('opens Update Feed (Inbox) view and filters tabs', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Update feed'));
    expect(screen.getByText('Update Feed (Inbox)')).toBeTruthy();
    expect(screen.getByText('I was mentioned')).toBeTruthy();
    expect(screen.getByText(/Bookmarked/)).toBeTruthy();
  });

  it('creates a new board from Template Center in 1 click', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Workspace overview'));
    const templateBtns = screen.getAllByText('Start with a template');
    fireEvent.click(templateBtns[0]);

    expect(screen.getByText('Template Center')).toBeTruthy();
    const useButtons = screen.getAllByText('ใช้เทมเพลตนี้');
    fireEvent.click(useButtons[1]); // Sales CRM Pipeline

    expect(screen.getByDisplayValue('Sales CRM Pipeline')).toBeTruthy();
  });

  it('opens Trash & Archive view from More menu', () => {
    render(<App />);
    fireEvent.click(screen.getByText('More'));
    fireEvent.click(screen.getByText('Trash & Archive'));

    expect(screen.getByText('Recycle Bin (ถังขยะ)')).toBeTruthy();
    expect(screen.getByText(/Archive \(0\)/)).toBeTruthy();
  });
});
