const CONFIG_KEY = 'tracking_cloud_sync_config_v1';
const LAST_SYNC_KEY = 'tracking_cloud_last_sync_v1';

export const SUPABASE_SQL_SCHEMA = `-- รันคำสั่งนี้ใน Supabase SQL Editor เพื่อสร้างตารางซิงค์ข้อมูลข้ามเครื่อง
create table if not exists public.tracking_state (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.tracking_state enable row level security;

create policy "Allow public read/write for tracking_state"
  on public.tracking_state
  for all
  using (true)
  with check (true);
`;

export function loadCloudConfig() {
  const envUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : '';
  const envKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : '';
  const envApi = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_CLOUD_SYNC_API_URL : '';

  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        provider: parsed.provider || (envUrl ? 'supabase' : envApi ? 'custom' : 'local'),
        supabaseUrl: parsed.supabaseUrl || envUrl || '',
        supabaseAnonKey: parsed.supabaseAnonKey || envKey || '',
        customApiUrl: parsed.customApiUrl || envApi || '',
        workspaceKey: parsed.workspaceKey || 'default-team',
        autoSync: parsed.autoSync !== false,
      };
    }
  } catch {
    // Fallback to env/default
  }

  return {
    provider: envUrl ? 'supabase' : envApi ? 'custom' : 'local',
    supabaseUrl: envUrl || '',
    supabaseAnonKey: envKey || '',
    customApiUrl: envApi || '',
    workspaceKey: 'default-team',
    autoSync: true,
  };
}

export function saveCloudConfig(config) {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch {
    // ignore storage quota errors
  }
}

export function getLastSyncTime() {
  try {
    return localStorage.getItem(LAST_SYNC_KEY) || null;
  } catch {
    return null;
  }
}

function setLastSyncTime(iso) {
  try {
    localStorage.setItem(LAST_SYNC_KEY, iso);
  } catch {
    // ignore
  }
}

export function isCloudConfigured(config) {
  if (!config || config.provider === 'local') return false;
  if (config.provider === 'supabase') {
    return Boolean(config.supabaseUrl?.trim() && config.supabaseAnonKey?.trim());
  }
  if (config.provider === 'custom') {
    return Boolean(config.customApiUrl?.trim());
  }
  return false;
}

export async function pushStateToCloud(config, statePayload) {
  if (!isCloudConfigured(config)) {
    return { ok: false, skipped: true, reason: 'Local mode' };
  }

  const nowIso = new Date().toISOString();
  const key = encodeURIComponent(config.workspaceKey || 'default-team');

  if (config.provider === 'supabase') {
    const base = config.supabaseUrl.replace(/\/+$/, '');
    const res = await fetch(`${base}/rest/v1/tracking_state?on_conflict=id`, {
      method: 'POST',
      headers: {
        apikey: config.supabaseAnonKey,
        Authorization: `Bearer ${config.supabaseAnonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({
        id: config.workspaceKey || 'default-team',
        payload: statePayload,
        updated_at: nowIso,
      }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`Supabase sync failed (${res.status}): ${txt || res.statusText}`);
    }
    setLastSyncTime(nowIso);
    return { ok: true, updatedAt: nowIso };
  }

  // Custom PostgreSQL REST API
  const base = config.customApiUrl.replace(/\/+$/, '');
  const res = await fetch(`${base}?key=${key}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: config.workspaceKey || 'default-team',
      payload: statePayload,
      updated_at: nowIso,
    }),
  });

  if (!res.ok) {
    throw new Error(`API sync failed (${res.status}): ${res.statusText}`);
  }
  setLastSyncTime(nowIso);
  return { ok: true, updatedAt: nowIso };
}

export async function pullStateFromCloud(config) {
  if (!isCloudConfigured(config)) {
    return { ok: false, skipped: true, payload: null };
  }

  const key = encodeURIComponent(config.workspaceKey || 'default-team');

  if (config.provider === 'supabase') {
    const base = config.supabaseUrl.replace(/\/+$/, '');
    const res = await fetch(
      `${base}/rest/v1/tracking_state?id=eq.${key}&select=payload,updated_at`,
      {
        method: 'GET',
        headers: {
          apikey: config.supabaseAnonKey,
          Authorization: `Bearer ${config.supabaseAnonKey}`,
          Accept: 'application/json',
        },
      }
    );

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`Supabase pull failed (${res.status}): ${txt || res.statusText}`);
    }
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      return { ok: true, payload: null, updatedAt: null };
    }
    setLastSyncTime(rows[0].updated_at || new Date().toISOString());
    return { ok: true, payload: rows[0].payload || null, updatedAt: rows[0].updated_at };
  }

  // Custom PostgreSQL REST API
  const base = config.customApiUrl.replace(/\/+$/, '');
  const res = await fetch(`${base}?key=${key}`, { method: 'GET' });
  if (!res.ok) {
    throw new Error(`API pull failed (${res.status}): ${res.statusText}`);
  }
  const data = await res.json();
  const payload = data?.payload || null;
  const updatedAt = data?.updated_at || new Date().toISOString();
  if (payload) setLastSyncTime(updatedAt);
  return { ok: true, payload, updatedAt };
}
