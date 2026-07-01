-- Notification tables for existing Supabase projects.
-- Run this once in Supabase SQL Editor.

create table if not exists notification_logs (
  id                  uuid primary key default gen_random_uuid(),
  event_type          text not null,
  channel             text not null check (channel in ('webhook','sms','push')),
  recipient_type      text not null check (recipient_type in ('admin','customer','pro')),
  recipient_user_id   uuid,
  recipient_phone     text,
  title               text not null default '',
  content             text not null default '',
  status              text not null check (status in ('skipped','sent','failed')),
  provider            text,
  provider_message_id text,
  error_message       text,
  payload             jsonb not null default '{}',
  created_at          timestamptz not null default now()
);

create table if not exists app_push_tokens (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid,
  phone        text,
  platform     text not null check (platform in ('ios','android','web')),
  token        text not null unique,
  is_active    boolean not null default true,
  last_seen_at timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

create index if not exists idx_notification_logs_booking
  on notification_logs ((payload->>'id'), event_type, created_at desc);

create index if not exists idx_app_push_tokens_phone
  on app_push_tokens (phone, is_active);

alter table notification_logs enable row level security;
alter table app_push_tokens enable row level security;

