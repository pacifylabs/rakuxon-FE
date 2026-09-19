import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { ThemeProvider, ToastProvider } from '@rakuxon/ui';
import { AdminAuthProvider } from '@/lib/admin-auth';
import AdminsPage from './page';
import RolesPage from './roles/page';

const role = {
  id: 'role-1',
  name: 'Customer Support',
  description: 'Student support',
  permissions: ['tenants.view'],
  adminCount: 2,
};
const permissions = [
  { key: 'tenants.view', description: 'View partners' },
  { key: 'admins.manage', description: 'Manage admins' },
];
const json = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
const fetchMock = vi.fn();
const renderPage = (ui: React.ReactElement) =>
  render(
    <ThemeProvider>
      <ToastProvider>
        <AdminAuthProvider baseUrl="https://api.test">{ui}</AdminAuthProvider>
      </ToastProvider>
    </ThemeProvider>,
  );
function signIn(keys = ['admins.manage']) {
  window.sessionStorage.setItem(
    'rakuxon.admin.session',
    JSON.stringify({
      accessToken: 'a',
      refreshToken: 'r',
      expiresAt: Date.now() + 900_000,
      admin: { id: 'a1', email: 'a@test.com', firstName: 'A', lastName: 'B', permissions: keys },
    }),
  );
}
beforeEach(() => {
  window.sessionStorage.clear();
  signIn();
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
    if (init?.method === 'POST')
      return json({
        id: 'new',
        ...JSON.parse(String(init.body)),
        permissions: role.permissions,
        role,
        status: 'active',
      });
    if (url.endsWith('/account/permissions'))
      return json(
        JSON.parse(window.sessionStorage.getItem('rakuxon.admin.session')!).admin.permissions,
      );
    if (url.endsWith('/roles')) return json([role]);
    if (url.endsWith('/permissions')) return json(permissions);
    return json({ items: [] });
  });
});
afterEach(() => vi.unstubAllGlobals());

describe('admin role management', () => {
  it('creates a role with a reusable permission set', async () => {
    const user = userEvent.setup();
    renderPage(<RolesPage />);
    await user.click(await screen.findByRole('button', { name: 'New role' }));
    await user.type(screen.getByLabelText('Role name'), 'Catalogue Editor');
    await user.click(screen.getByRole('checkbox', { name: /tenants.view/ }));
    await user.click(screen.getByRole('button', { name: 'Save role' }));
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.test/v1/admin/admins/roles',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            name: 'Catalogue Editor',
            description: '',
            permissionKeys: ['tenants.view'],
            isSuccessManagerPool: false,
          }),
        }),
      ),
    );
  });
  it('flags a role as the success manager pool for automatic case assignment', async () => {
    const user = userEvent.setup();
    renderPage(<RolesPage />);
    await user.click(await screen.findByRole('button', { name: 'New role' }));
    await user.type(screen.getByLabelText('Role name'), 'Success Managers');
    await user.click(screen.getByRole('switch', { name: 'Success manager pool' }));
    await user.click(screen.getByRole('button', { name: 'Save role' }));
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.test/v1/admin/admins/roles',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            name: 'Success Managers',
            description: '',
            permissionKeys: [],
            isSuccessManagerPool: true,
          }),
        }),
      ),
    );
  });

  it('assigns a single role when creating an admin without individual checkboxes', async () => {
    const user = userEvent.setup();
    renderPage(<AdminsPage />);
    await user.click(await screen.findByRole('button', { name: 'New admin' }));
    await user.type(screen.getByLabelText('First name'), 'Ada');
    await user.type(screen.getByLabelText('Last name'), 'Lovelace');
    await user.type(screen.getByLabelText('Email address'), 'ada@test.com');
    await user.type(screen.getByLabelText('Temporary password'), 'temporary-password');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Role' }), 'role-1');
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Create admin' }));
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.test/v1/admin/admins',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'ada@test.com',
            firstName: 'Ada',
            lastName: 'Lovelace',
            password: 'temporary-password',
            roleId: 'role-1',
          }),
        }),
      ),
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
  it('shows the affected admin count and prevents deleting an assigned role', async () => {
    const user = userEvent.setup();
    renderPage(<RolesPage />);
    expect(await screen.findByRole('button', { name: 'Delete' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Edit role' }));
    expect(
      screen.getByText('Changes apply immediately to all 2 admins assigned to this role.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /tenants.view/ })).toBeChecked();
  });
  it('refreshes page access when a signed-in admin returns after their role changes', async () => {
    renderPage(<RolesPage />);
    await screen.findByRole('button', { name: 'New role' });
    fetchMock.mockImplementation(async () => json([]));
    window.dispatchEvent(new Event('focus'));
    expect(
      await screen.findByText('Your account does not have permission to manage roles.'),
    ).toBeInTheDocument();
  });

  it('does not fetch role data for admins without management access', async () => {
    signIn([]);
    renderPage(<RolesPage />);
    expect(
      await screen.findByText('Your account does not have permission to manage roles.'),
    ).toBeInTheDocument();
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/admins/roles'))).toBe(false);
  });
});
