import type { BookingStatus } from "./types";

type NotificationPayload = {
  type: string;
  title: string;
  text: string;
  content: string;
  data: Record<string, unknown>;
};

async function postAdminNotification(payload: NotificationPayload) {
  const webhookUrl = process.env.ADMIN_NOTIFICATION_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Admin notification failed", error);
  }
}

export async function notifyBookingCreated(input: {
  id: string;
  instructor_id: string;
  student_name: string;
  student_phone: string;
  preferred_date?: string | null;
  preferred_time?: string | null;
  region?: string | null;
  goal?: string | null;
}) {
  const schedule = [input.preferred_date, input.preferred_time].filter(Boolean).join(" ");
  const title = "새 예약 요청";
  const text = `${input.student_name}님 예약 요청${schedule ? ` (${schedule})` : ""}`;
  await postAdminNotification({
    type: "booking.created",
    title,
    text,
    content: text,
    data: input,
  });
}

export async function notifyBookingStatusChanged(input: {
  id: string;
  status: BookingStatus | string;
}) {
  const title = "예약 상태 변경";
  const text = `예약 ${input.id} 상태가 ${input.status}(으)로 변경되었습니다.`;
  await postAdminNotification({
    type: "booking.status_changed",
    title,
    text,
    content: text,
    data: input,
  });
}

