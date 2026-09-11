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

describe('<AppShell/> badge and account menu', () => {
  it('renders no badge and keeps the sidebar profile block when neither is given', () => {
    render(
      <AppShell navItems={navItems} homeHref="/dashboard" userName="Ada Admin" onSignOut={vi.fn()}>
        <p>content</p>
      </AppShell>,
    );

    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    // The sidebar's own profile block — not just the header trigger — carries the full name.
    expect(screen.getAllByText('Ada Admin')).toHaveLength(1);
  });

  it('shows the badge next to the wordmark when given', () => {
    render(
      <AppShell navItems={navItems} homeHref="/dashboard" onSignOut={vi.fn()} badge="Admin">
        <p>content</p>
      </AppShell>,
    );

    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('moves the profile into a header menu with profile/security links and sign-out, removing it from the sidebar', async () => {
    const onSignOut = vi.fn();
    render(
      <AppShell
        navItems={navItems}
        homeHref="/dashboard"
        userName="Ada Admin"
        userEmail="ada@rakuxon.com"
        onSignOut={onSignOut}
        accountMenu={{ profileHref: '/dashboard/settings/profile', securityHref: '/dashboard/settings/security' }}
      >
        <p>content</p>
      </AppShell>,
    );

    // Only the header trigger carries the name now — the sidebar's own block is gone.
    expect(screen.getAllByText('Ada Admin')).toHaveLength(1);

    await userEvent.click(screen.getByLabelText('Account menu for Ada Admin'));
    expect(screen.getByRole('link', { name: 'Profile settings' })).toHaveAttribute('href', '/dashboard/settings/profile');
    expect(screen.getByRole('link', { name: 'Security' })).toHaveAttribute('href', '/dashboard/settings/security');

    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(onSignOut).toHaveBeenCalled();
  });
});
