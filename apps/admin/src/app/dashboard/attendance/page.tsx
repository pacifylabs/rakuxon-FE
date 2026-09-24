'use client';

import { Clock } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import {
  Button,
  ConfirmDialog,
  DataTable,
  EmptyState,
  FormField,
  IconBubble,
  Pagination,
  StatusBadge,
  formatTime,
} from '@rakuxon/ui';
import type { DataTableColumn } from '@rakuxon/ui';
import type { AttendanceRecord } from '@rakuxon/contract';

import { useAdminApiClient, useAdminAuth } from '@/lib/admin-auth';

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString(undefined, { timeZone: 'UTC' });
}

function errorMessage(caught: unknown, fallback: string): string {
  return caught instanceof ApiError || caught instanceof NetworkError ? caught.message : fallback;
}

function ClockWidget({ onChange }: { onChange: () => void }) {
  const client = useAdminApiClient();
  const [today, setToday] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<'clock-in' | 'clock-out' | null>(null);

  useEffect(() => {
    let cancelled = false;
    client
      .getTodayAttendance()
      .then((result) => {
        if (!cancelled) setToday(result.record);
      })
      .catch((caught) => {
        if (!cancelled) setError(errorMessage(caught, 'Could not load your attendance.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [client]);

  async function handleConfirm() {
    const action = confirming;
    if (!action) return;
    setPending(true);
    setError(null);
    try {
      setToday(action === 'clock-in' ? await client.clockIn() : await client.clockOut());
      onChange();
      setConfirming(null);
    } catch (caught) {
      setError(
        errorMessage(
          caught,
          action === 'clock-in'
            ? 'Could not clock you in. Please try again.'
            : 'Could not clock you out. Please try again.',
        ),
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-6">
      <IconBubble icon={Clock} tone="accent" size="lg" />

      <div className="min-w-0">
        {loading ? (
          <p className="text-base text-text-muted">Loading…</p>
        ) : today?.clockOutAt ? (
          <>
            <p className="font-heading text-lg font-semibold text-text">Done for today</p>
            <p className="text-sm text-text-muted">
              In {formatTime(today.clockInAt)} · out {formatTime(today.clockOutAt)}
            </p>
          </>
        ) : today ? (
          <>
            <p className="font-heading text-lg font-semibold text-text">Clocked in</p>
            <p className="text-sm text-text-muted">Since {formatTime(today.clockInAt)}</p>
          </>
        ) : (
          <>
            <p className="font-heading text-lg font-semibold text-text">Not clocked in yet</p>
            <p className="text-sm text-text-muted">Clock in to start today&rsquo;s record.</p>
          </>
        )}
      </div>

      {!loading && !today?.clockOutAt && (
        <Button
          variant="primary"
          size="lg"
          onClick={() => setConfirming(today ? 'clock-out' : 'clock-in')}
          disabled={pending}
        >
          {today ? 'Clock out' : 'Clock in'}
        </Button>
      )}

      {error && (
        <p role="alert" className="w-full text-sm text-danger">
          {error}
        </p>
      )}

      <ConfirmDialog
        open={confirming !== null}
        onOpenChange={(open) => !open && setConfirming(null)}
        title={confirming === 'clock-in' ? 'Clock in for today?' : 'Clock out for today?'}
        description={
          confirming === 'clock-in'
            ? "This starts today's attendance record with the current time."
            : "This ends today's attendance record with the current time. You can't clock out again today."
        }
        confirmLabel={confirming === 'clock-in' ? 'Clock in' : 'Clock out'}
        confirming={pending}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

function attendanceColumns(showAdmin: boolean): DataTableColumn<AttendanceRecord>[] {
  const columns: DataTableColumn<AttendanceRecord>[] = [];
  if (showAdmin) {
    columns.push({
      header: 'Admin',
      cell: (row) => <span className="text-text">{row.adminName}</span>,
    });
  }
  columns.push(
    { header: 'Date', cell: (row) => <span className="text-text">{formatDate(row.date)}</span> },
    {
      header: 'Clock in',
      cell: (row) => <span className="text-text-muted">{formatTime(row.clockInAt)}</span>,
    },
    {
      header: 'Clock out',
      cell: (row) =>
        row.clockOutAt ? (
          <span className="text-text-muted">{formatTime(row.clockOutAt)}</span>
        ) : (
          <StatusBadge tone="neutral">Still clocked in</StatusBadge>
        ),
    },
  );
  return columns;
}

function MyHistory({ refreshKey }: { refreshKey: number }) {
  const client = useAdminApiClient();
  const [items, setItems] = useState<AttendanceRecord[] | null>(null);
  const [pageInfo, setPageInfo] = useState({ page: 1, pageCount: 1 });
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    client
      .listMyAttendance({ page })
      .then((result) => {
        if (cancelled) return;
        setItems(result.items);
        setPageInfo({ page: result.page, pageCount: result.pageCount });
        setError(null);
      })
      .catch((caught) => {
        if (!cancelled) setError(errorMessage(caught, 'Could not load your attendance history.'));
      });
    return () => {
      cancelled = true;
    };
  }, [client, page, refreshKey]);

  return (
    <div>
      <h2 className="font-heading text-lg font-semibold text-text">My attendance</h2>

      {error && (
        <p role="alert" className="mt-4 text-base text-danger">
          {error}
        </p>
      )}

      {!items && !error && (
        <p role="status" className="mt-4 text-base text-text-muted">
          Loading…
        </p>
      )}

      {items && (
        <div className="mt-6">
          <DataTable
            columns={attendanceColumns(false)}
            rows={items}
            getRowKey={(row) => row.id}
            emptyState={
              <EmptyState
                icon={Clock}
                title="No attendance yet"
                description="Clock in above to start your record."
              />
            }
          />
          <Pagination page={pageInfo.page} pageCount={pageInfo.pageCount} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}

function TeamLog({ refreshKey }: { refreshKey: number }) {
  const client = useAdminApiClient();
  const [items, setItems] = useState<AttendanceRecord[] | null>(null);
  const [pageInfo, setPageInfo] = useState({ page: 1, pageCount: 1 });
  const [page, setPage] = useState(1);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await client.listAttendance({
        from: from || undefined,
        to: to || undefined,
        page,
      });
      setItems(result.items);
      setPageInfo({ page: result.page, pageCount: result.pageCount });
      setError(null);
    } catch (caught) {
      setError(errorMessage(caught, 'Could not load the team attendance log.'));
    }
  }, [client, from, to, page, refreshKey]);

  useEffect(() => {
    setItems(null);
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [from, to]);

  return (
    <section>
      <h2 className="font-heading text-lg font-semibold text-text">Team log</h2>

      <div className="mt-4 flex flex-wrap gap-4 sm:max-w-md">
        <FormField
          label="From"
          name="from"
          type="date"
          defaultValue={from}
          onChange={(event) => setFrom(event.target.value)}
        />
        <FormField
          label="To"
          name="to"
          type="date"
          defaultValue={to}
          onChange={(event) => setTo(event.target.value)}
        />
      </div>

      {error && (
        <p role="alert" className="mt-6 text-base text-danger">
          {error}
        </p>
      )}

      {!items && !error && (
        <p role="status" className="mt-6 text-base text-text-muted">
          Loading…
        </p>
      )}

      {items && (
        <div className="mt-6">
          <DataTable
            columns={attendanceColumns(true)}
            rows={items}
            getRowKey={(row) => row.id}
            emptyState={
              <EmptyState
                icon={Clock}
                title="Nothing in range"
                description="No one clocked in for the selected dates."
              />
            }
          />
          <Pagination page={pageInfo.page} pageCount={pageInfo.pageCount} onPageChange={setPage} />
        </div>
      )}
    </section>
  );
}

export default function AttendancePage() {
  const { hasPermission } = useAdminAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <section aria-labelledby="attendance-heading">
      <h1 id="attendance-heading" className="font-heading text-3xl font-bold text-text">
        Attendance
      </h1>
      <p className="mt-2 max-w-prose text-base text-text-muted">
        Clock in when you start for the day and clock out when you&rsquo;re done.
      </p>

      <div className="mt-8">
        <ClockWidget onChange={() => setRefreshKey((key) => key + 1)} />
      </div>

      <div className="mt-12">
        <MyHistory refreshKey={refreshKey} />
      </div>

      {hasPermission('attendance.view') && (
        <div className="mt-12">
          <TeamLog refreshKey={refreshKey} />
        </div>
      )}
    </section>
  );
}
