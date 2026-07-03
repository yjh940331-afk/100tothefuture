import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginPanel } from "@/components/LoginPanel";

export const metadata: Metadata = {
  title: "로그인",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPanel />
    </Suspense>
  );
}
