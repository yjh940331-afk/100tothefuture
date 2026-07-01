import type { BookingStatus } from "./types";
import { getSupabaseAdmin } from "./supabase";
import { SITE_URL } from "./site";

type NotificationChannel = "webhook" | "sms" | "push";
type RecipientType = "admin" | "customer" | "pro";

type NotificationPayload = {
  eventType: string;
  channel: NotificationChannel;
  recipientType: RecipientType;
  recipientPhone?: string | null;
  title: string;
  content: string;
  data: Record<string, unknown>;
};

function normalizePhone(value?: string | null): string {
  return (value ?? "").replace(/\D/g, "");
}

function isSmsEnabled() {
  return (
    process.env.SMS_NOTIFICATIONS_ENABLED === "true" &&
    Boolean(process.env.SOLAPI_API_KEY) &&
    Boolean(process.env.SOLAPI_API_SECRET) &&
    Boolean(process.env.SOLAPI_SENDER)
  );
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacSha256Hex(secret: string, message: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return bytesToHex(new Uint8Array(signature));
}

function randomSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

async function logNotification(
  payload: NotificationPayload,
  status: "skipped" | "sent" | "failed",
  extra: { provider?: string; providerMessageId?: string | null; error?: string | null } = {},
) {
  const sb = getSupabaseAdmin();
  if (!sb) return;

  try {
    await sb.from("notification_logs").insert({
      event_type: payload.eventType,
      channel: payload.channel,
      recipient_type: payload.recipientType,
      recipient_phone: payload.recipientPhone ? normalizePhone(payload.recipientPhone) : null,
      title: payload.title,
      content: payload.content,
      status,
      provider: extra.provider ?? null,
      provider_message_id: extra.providerMessageId ?? null,
      error_message: extra.error ?? null,
      payload: payload.data,
    });
  } catch (error) {
    console.error("Notification log failed", error);
  }
}

async function sendWebhook(payload: NotificationPayload) {
  const webhookUrl = process.env.ADMIN_NOTIFICATION_WEBHOOK_URL;
  if (!webhookUrl) {
    await logNotification(payload, "skipped", { provider: "webhook" });
    return;
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: payload.eventType,
        title: payload.title,
        text: payload.content,
        content: payload.content,
        data: payload.data,
      }),
    });
    if (!res.ok) throw new Error(`Webhook failed with ${res.status}`);
    await logNotification(payload, "sent", { provider: "webhook" });
  } catch (error) {
    await logNotification(payload, "failed", {
      provider: "webhook",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function sendSolapiSms(payload: NotificationPayload) {
  const to = normalizePhone(payload.recipientPhone);
  const from = normalizePhone(process.env.SOLAPI_SENDER);
  const apiKey = process.env.SOLAPI_API_KEY;
  const apiSecret = process.env.SOLAPI_API_SECRET;

  if (!to || !from || !apiKey || !apiSecret || !isSmsEnabled()) {
    await logNotification(payload, "skipped", { provider: "solapi" });
    return;
  }

  const date = new Date().toISOString();
  const salt = randomSalt();
  const signature = await hmacSha256Hex(apiSecret, date + salt);

  try {
    const res = await fetch("https://api.solapi.com/messages/v4/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`,
      },
      body: JSON.stringify({
        message: {
          to,
          from,
          text: payload.content,
          type: payload.content.length > 45 ? "LMS" : "SMS",
        },
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.errorMessage || data?.message || `Solapi failed with ${res.status}`);
    await logNotification(payload, "sent", {
      provider: "solapi",
      providerMessageId: data?.messageId ?? data?.groupId ?? null,
    });
  } catch (error) {
    await logNotification(payload, "failed", {
      provider: "solapi",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function sendNotification(payload: NotificationPayload) {
  if (payload.channel === "webhook") {
    await sendWebhook(payload);
    return;
  }
  if (payload.channel === "sms") {
    await sendSolapiSms(payload);
    return;
  }
  await logNotification(payload, "skipped", { provider: "push" });
}

function bookingScheduleText(input: { preferred_date?: string | null; preferred_time?: string | null }) {
  return [input.preferred_date, input.preferred_time].filter(Boolean).join(" ");
}

export async function notifyBookingCreated(input: {
  id: string;
  instructor_id: string;
  instructor_name?: string | null;
  student_name: string;
  student_phone: string;
  preferred_date?: string | null;
  preferred_time?: string | null;
  region?: string | null;
  goal?: string | null;
}) {
  const schedule = bookingScheduleText(input);
  const bookingUrl = `${SITE_URL}/bookings`;
  const customerText = `[100 to the Future] 예약 요청이 접수되었습니다. 예약번호: ${input.id}${
    schedule ? ` / 희망: ${schedule}` : ""
  }. 조회/취소: ${bookingUrl}`;
  const adminText = `[예약 요청] ${input.student_name} ${input.student_phone}${
    input.instructor_name ? ` / ${input.instructor_name}` : ""
  }${schedule ? ` / ${schedule}` : ""}`;

  await Promise.all([
    sendNotification({
      eventType: "booking.created",
      channel: "sms",
      recipientType: "customer",
      recipientPhone: input.student_phone,
      title: "예약 요청 접수",
      content: customerText,
      data: input,
    }),
    sendNotification({
      eventType: "booking.created",
      channel: "webhook",
      recipientType: "admin",
      title: "새 예약 요청",
      content: adminText,
      data: input,
    }),
    process.env.ADMIN_NOTIFICATION_PHONE
      ? sendNotification({
          eventType: "booking.created",
          channel: "sms",
          recipientType: "admin",
          recipientPhone: process.env.ADMIN_NOTIFICATION_PHONE,
          title: "새 예약 요청",
          content: adminText,
          data: input,
        })
      : Promise.resolve(),
  ]);
}

export async function notifyBookingStatusChanged(input: {
  id: string;
  status: BookingStatus | string;
  student_name?: string | null;
  student_phone?: string | null;
  instructor_name?: string | null;
  preferred_date?: string | null;
  preferred_time?: string | null;
}) {
  const statusLabels: Record<string, string> = {
    requested: "요청됨",
    confirmed: "확정",
    completed: "완료",
    canceled: "취소",
    rejected: "거절",
    no_show: "노쇼",
  };
  const label = statusLabels[input.status] ?? input.status;
  const schedule = bookingScheduleText(input);
  const bookingUrl = `${SITE_URL}/bookings`;
  const customerText = `[100 to the Future] 예약 상태가 '${label}'(으)로 변경되었습니다.${
    schedule ? ` 일정: ${schedule}.` : ""
  } 예약번호: ${input.id} / 조회: ${bookingUrl}`;
  const adminText = `[예약 상태 변경] ${input.id} -> ${label}${
    input.student_name ? ` / ${input.student_name}` : ""
  }`;

  await Promise.all([
    input.student_phone
      ? sendNotification({
          eventType: "booking.status_changed",
          channel: "sms",
          recipientType: "customer",
          recipientPhone: input.student_phone,
          title: "예약 상태 변경",
          content: customerText,
          data: input,
        })
      : Promise.resolve(),
    sendNotification({
      eventType: "booking.status_changed",
      channel: "webhook",
      recipientType: "admin",
      title: "예약 상태 변경",
      content: adminText,
      data: input,
    }),
  ]);
}

