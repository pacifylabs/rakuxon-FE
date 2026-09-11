import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LayoutGrid } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({ usePathname: () => '/dashboard' }));

import { AppShell } from './AppShell';

const navItems = [{ href: '/dashboard', label: 'Home', icon: LayoutGrid }];

describe('<AppShell/> notifications', () => {
  it('shows the default empty panel when no notifications prop is given', async () => {
    render(
      <AppShell navItems={navItems} homeHref="/dashboard" onSignOut={vi.fn()}>
        <p>content</p>
      </AppShell>,
    );

    await userEvent.click(screen.getByLabelText('Notifications'));
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument();
  });

  it('shows the default empty panel when the slot has zero items, not a blank list', async () => {
    render(
      <AppShell
        navItems={navItems}
        homeHref="/dashboard"
        onSignOut={vi.fn()}
        notifications={{ items: [], unreadCount: 0, onOpen: vi.fn() }}
      >
        <p>content</p>
      </AppShell>,
    );

    await userEvent.click(screen.getByLabelText('Notifications'));
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument();
  });

  it('lists real notifications and reports which one was opened', async () => {
    const onOpen = vi.fn();
    render(
      <AppShell
        navItems={navItems}
        homeHref="/dashboard"
        onSignOut={vi.fn()}
        notifications={{
          items: [
            { id: 'n1', title: 'Document rejected', body: 'Your identity was not accepted.', link: null, readAt: null },
          ],
          unreadCount: 1,
          onOpen,
        }}
      >
        <p>content</p>
      </AppShell>,
    );

    expect(screen.getByLabelText('Notifications (1 unread)')).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Notifications (1 unread)'));
    await userEvent.click(screen.getByText('Document rejected'));
    expect(onOpen).toHaveBeenCalledWith('n1');
  });
});
