import type { Metadata } from "next";
import { isAdminAuthed, adminPassword } from "@/lib/admin-auth";
import {
  adminListBookings,
  adminListReviews,
  adminListInstructors,
  isDbConfigured,
} from "@/lib/data";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "관리자",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const authed = await isAdminAuthed();

  if (!authed) {
    return <AdminLogin configured={Boolean(adminPassword())} />;
  }

  const [bookings, reviews, instructors] = await Promise.all([
    adminListBookings(),
    adminListReviews(),
    adminListInstructors(),
  ]);

  return (
    <AdminDashboard
      bookings={bookings}
      reviews={reviews as any}
      instructors={instructors}
      demo={!isDbConfigured()}
    />
  );
}
