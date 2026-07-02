"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.ok) router.refresh();
    else setError(data.error || "로그인 실패");
  }

  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center py-16">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4 p-8">
        <h1 className="text-xl font-black text-fairway-900">관리자 로그인</h1>
        {!configured && (
          <p className="rounded-lg bg-gold-100 p-3 text-sm text-gold-900">
            아직 <code>ADMIN_PASSWORD</code> 환경변수가 설정되지 않았습니다.
            배포 환경변수에 추가한 뒤 로그인하세요.
          </p>
        )}
        <div>
          <label className="label">비밀번호</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "확인 중..." : "로그인"}
        </button>
      </form>
    </div>
  );
}
