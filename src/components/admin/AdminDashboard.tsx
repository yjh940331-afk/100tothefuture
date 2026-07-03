"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type {
  Booking,
  BookingStatus,
  Instructor,
  InstructorApplication,
  LessonRequest,
  LessonRequestStatus,
  ReviewSummary,
} from "@/lib/types";
import { Stars } from "@/components/Stars";
import {
  ProfileImageCropper,
  type ImageCropPresetId,
} from "@/components/admin/ProfileImageCropper";

type Tab = "requests" | "bookings" | "reviews" | "applications" | "instructors";
type BookingFilter = "all" | BookingStatus;
type ImageUploadTarget = "profile_image" | "gallery";
type ImageCropRequest = {
  file: File;
  target: ImageUploadTarget;
  initialPreset: ImageCropPresetId;
};

const lessonRequestStatusLabels: Record<LessonRequestStatus, string> = {
  open: "신규",
  contacted: "연락 완료",
  quoted: "견적 제안",
  closed: "종료",
  canceled: "취소",
};

const lessonRequestStatuses: LessonRequestStatus[] = [
  "open",
  "contacted",
  "quoted",
  "closed",
  "canceled",
];

const bookingStatusLabels: Record<BookingStatus, string> = {
  requested: "요청",
  confirmed: "확정",
  completed: "완료",
  canceled: "취소",
  rejected: "거절",
  no_show: "노쇼",
};

const reviewStatusLabels: Record<string, string> = {
  pending: "승인 대기",
  visible: "노출 중",
  hidden: "숨김",
  reported: "신고됨",
};

const bookingStatuses: BookingStatus[] = [
  "requested",
  "confirmed",
  "completed",
  "canceled",
  "rejected",
  "no_show",
];

type InstructorFormState = {
  id?: string;
  slug: string;
  display_name: string;
  profile_image: string;
  gallery: string;
  bio: string;
  about: string;
  region: string;
  lesson_places: string;
  specialties: string;
  career_years: string;
  career_history: string;
  lesson_style: string;
  gender: "male" | "female";
  price_from: string;
  response_time: string;
  badges: string;
  is_featured: boolean;
  is_active: boolean;
  verification_status: "pending" | "verified" | "rejected";
};

const emptyInstructorForm: InstructorFormState = {
  slug: "",
  display_name: "",
  profile_image: "",
  gallery: "",
  bio: "",
  about: "",
  region: "",
  lesson_places: "",
  specialties: "",
  career_years: "0",
  career_history: "",
  lesson_style: "",
  gender: "male",
  price_from: "0",
  response_time: "",
  badges: "",
  is_featured: false,
  is_active: true,
  verification_status: "pending",
};

export function AdminDashboard({
  lessonRequests,
  bookings,
  reviews,
  applications,
  instructors,
  demo,
}: {
  lessonRequests: LessonRequest[];
  bookings: Booking[];
  reviews: (ReviewSummary & { instructor_name?: string })[];
  applications: InstructorApplication[];
  instructors: Instructor[];
  demo: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("requests");
  const [bookingFilter, setBookingFilter] = useState<BookingFilter>("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [requestMemos, setRequestMemos] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      lessonRequests.map((request) => [request.id, request.admin_memo ?? ""]),
    ),
  );
  const [bookingMemos, setBookingMemos] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      bookings.map((booking) => [booking.id, booking.admin_memo ?? ""]),
    ),
  );
  const [reviewReplies, setReviewReplies] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        reviews.map((review) => [review.id, review.instructor_reply ?? ""]),
      ),
  );
  const [applicationMemos, setApplicationMemos] = useState<
    Record<string, string>
  >(() =>
    Object.fromEntries(
      applications.map((application) => [
        application.id,
        application.admin_memo ?? "",
      ]),
    ),
  );
  const [instructorForm, setInstructorForm] =
    useState<InstructorFormState | null>(null);
  const [imageCropRequest, setImageCropRequest] =
    useState<ImageCropRequest | null>(null);

  const filteredBookings = useMemo(
    () =>
      bookingFilter === "all"
        ? bookings
        : bookings.filter((booking) => booking.status === bookingFilter),
    [bookingFilter, bookings],
  );

  async function postAdminAction(
    payload: Record<string, unknown>,
    busyKey: string,
  ) {
    setBusy(busyKey);
    setMessage("");
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res
        .json()
        .catch(() => ({ ok: false, error: "응답을 확인하지 못했습니다." }));
      if (!data.ok) {
        setMessage(data.error || "처리하지 못했습니다.");
        return;
      }
      setMessage("저장되었습니다.");
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.refresh();
  }

  async function submitInstructor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!instructorForm) return;
    setBusy("instructor-save");
    setMessage("");
    const res = await fetch("/api/admin/instructors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...instructorForm,
        career_years: Number(instructorForm.career_years || 0),
        price_from: Number(instructorForm.price_from || 0),
      }),
    });
    const data = await res
      .json()
      .catch(() => ({ ok: false, error: "응답을 확인하지 못했습니다." }));
    setBusy(null);
    if (!data.ok) {
      setMessage(data.error || "프로 정보를 저장하지 못했습니다.");
      return;
    }
    setInstructorForm(null);
    setMessage("프로 정보가 저장되었습니다.");
    router.refresh();
  }

  function updateInstructorForm<K extends keyof InstructorFormState>(
    key: K,
    value: InstructorFormState[K],
  ) {
    setInstructorForm((current) =>
      current ? { ...current, [key]: value } : current,
    );
  }

  function getUploadSlug() {
    const slug = instructorForm?.slug.trim();
    if (!slug) {
      setMessage("사진 업로드 전에 슬러그를 먼저 입력해주세요.");
      return null;
    }
    return slug;
  }

  async function uploadInstructorImageFile(
    file: File,
    target: ImageUploadTarget,
    options: { cropped?: boolean } = {},
  ) {
    const slug = getUploadSlug();
    if (!slug) return false;

    const busyKey =
      target === "profile_image"
        ? "instructor-profile-upload"
        : "instructor-gallery-upload";
    setBusy(busyKey);
    setMessage("");

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("slug", slug);
      body.append("kind", target === "gallery" ? "gallery" : "profile");
      if (options.cropped) body.append("cropped", "true");

      const res = await fetch("/api/admin/uploads", {
        method: "POST",
        body,
      });
      const data = await res
        .json()
        .catch(() => ({ ok: false, error: "응답을 확인하지 못했습니다." }));

      if (!data.ok || !data.url) {
        setMessage(data.error || "사진을 업로드하지 못했습니다.");
        return false;
      }

      setInstructorForm((current) => {
        if (!current) return current;
        if (target === "profile_image") {
          return { ...current, profile_image: data.url };
        }
        return {
          ...current,
          gallery: appendImageUrl(current.gallery, data.url),
        };
      });
      setMessage(
        "사진을 업로드했습니다. 프로 저장을 누르면 사이트에 반영됩니다.",
      );
      return true;
    } catch {
      setMessage("사진을 업로드하지 못했습니다. 네트워크 상태를 확인해주세요.");
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function uploadInstructorImage(
    event: ChangeEvent<HTMLInputElement>,
    target: ImageUploadTarget,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !instructorForm || !getUploadSlug()) return;

    if (target === "profile_image") {
      setImageCropRequest({ file, target, initialPreset: "profile" });
      setMessage("프로필 사진에서 얼굴 위치를 맞춘 뒤 업로드해주세요.");
      return;
    }

    setImageCropRequest({
      file,
      target,
      initialPreset:
        imageUrlList(instructorForm.gallery).length === 0
          ? "galleryCover"
          : "galleryPhoto",
    });
    setMessage("갤러리 사진의 표시 영역을 맞춘 뒤 업로드해주세요.");
  }

  async function confirmImageCrop(file: File) {
    if (!imageCropRequest) return false;
    const uploaded = await uploadInstructorImageFile(
      file,
      imageCropRequest.target,
      { cropped: true },
    );
    if (uploaded) setImageCropRequest(null);
    return uploaded;
  }

  const openRequests = lessonRequests.filter(
    (request) => request.status === "open",
  ).length;
  const pendingReviews = reviews.filter(
    (review) => review.status === "pending",
  ).length;
  const pendingApplications = applications.filter(
    (application) => application.status === "submitted",
  ).length;
  const newBookings = bookings.filter(
    (booking) => booking.status === "requested",
  ).length;

  return (
    <div className="container-page py-10">
      {imageCropRequest && (
        <ProfileImageCropper
          file={imageCropRequest.file}
          uploading={
            busy ===
            (imageCropRequest.target === "profile_image"
              ? "instructor-profile-upload"
              : "instructor-gallery-upload")
          }
          mode={
            imageCropRequest.target === "profile_image" ? "profile" : "gallery"
          }
          initialPreset={imageCropRequest.initialPreset}
          onCancel={() => setImageCropRequest(null)}
          onConfirm={confirmImageCrop}
        />
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-gold-600">Operations</p>
          <h1 className="text-3xl font-black text-fairway-900">관리자</h1>
        </div>
        <button
          onClick={logout}
          className="text-sm font-semibold text-fairway-500 hover:text-fairway-700"
        >
          로그아웃
        </button>
      </div>

      {demo && (
        <p className="mt-4 rounded-lg bg-gold-100 p-3 text-sm text-gold-900">
          데모 모드입니다. Supabase를 연결하면 실제 예약, 견적 요청, 후기, 프로
          정보가 저장됩니다.
        </p>
      )}
      {message && (
        <p
          className="mt-4 rounded-lg bg-fairway-50 p-3 text-sm font-semibold text-fairway-700"
          aria-live="polite"
        >
          {message}
        </p>
      )}

      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-fairway-100">
        <TabBtn active={tab === "requests"} onClick={() => setTab("requests")}>
          견적 요청 {openRequests > 0 && <Count n={openRequests} />}
        </TabBtn>
        <TabBtn active={tab === "bookings"} onClick={() => setTab("bookings")}>
          예약 관리 {newBookings > 0 && <Count n={newBookings} />}
        </TabBtn>
        <TabBtn active={tab === "reviews"} onClick={() => setTab("reviews")}>
          후기 승인 {pendingReviews > 0 && <Count n={pendingReviews} />}
        </TabBtn>
        <TabBtn
          active={tab === "applications"}
          onClick={() => setTab("applications")}
        >
          프로 신청{" "}
          {pendingApplications > 0 && <Count n={pendingApplications} />}
        </TabBtn>
        <TabBtn
          active={tab === "instructors"}
          onClick={() => setTab("instructors")}
        >
          프로 관리
        </TabBtn>
      </div>

      <div className="mt-6">
        {tab === "requests" && (
          <section>
            <div className="mb-4 grid gap-3 rounded-lg border border-fairway-100 bg-white p-4 sm:grid-cols-4">
              <MiniMetric label="신규 요청" value={String(openRequests)} />
              <MiniMetric
                label="진행 중"
                value={String(
                  lessonRequests.filter((r) =>
                    ["contacted", "quoted"].includes(r.status),
                  ).length,
                )}
              />
              <MiniMetric
                label="종료"
                value={String(
                  lessonRequests.filter((r) => r.status === "closed").length,
                )}
              />
              <MiniMetric label="전체" value={String(lessonRequests.length)} />
            </div>
            <Panel
              empty={lessonRequests.length === 0}
              emptyText="아직 접수된 견적 요청이 없습니다."
            >
              {lessonRequests.map((request) => (
                <div key={request.id} className="card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg font-black text-fairway-900">
                          {request.customer_name}
                        </span>
                        <StatusPill
                          label={lessonRequestStatusLabels[request.status]}
                          status={request.status}
                        />
                        {request.quote_count ? (
                          <StatusPill
                            label={`견적 ${request.quote_count}개`}
                            status="visible"
                          />
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm font-semibold text-fairway-600">
                        {request.customer_phone}
                      </p>
                    </div>
                    <div className="text-right text-xs text-fairway-400">
                      {new Date(request.created_at).toLocaleString("ko-KR")}
                    </div>
                  </div>

                  <dl className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                    <Info label="지역" value={request.region} />
                    <Info label="목표" value={listText(request.goals)} />
                    <Info
                      label="장소"
                      value={listText(request.lesson_places)}
                    />
                    <Info
                      label="현재 실력"
                      value={request.skill_level || "-"}
                    />
                    <Info
                      label="평균 스코어"
                      value={request.score_range || "-"}
                    />
                    <Info
                      label="가능 요일/시간"
                      value={
                        [
                          listText(request.preferred_days),
                          request.preferred_time_slot,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "-"
                      }
                    />
                    <Info
                      label="예산"
                      value={moneyRange(request.budget_min, request.budget_max)}
                    />
                    <Info
                      label="희망 상품"
                      value={request.package_preference || "-"}
                    />
                    <Info
                      label="프로 성별"
                      value={genderPreferenceLabel(
                        request.instructor_gender_preference,
                      )}
                    />
                  </dl>

                  {request.memo && (
                    <div className="mt-4 rounded-lg bg-fairway-50 p-3 text-sm text-fairway-700">
                      <b>고객 요청</b>
                      <p className="mt-1 leading-6">{request.memo}</p>
                    </div>
                  )}

                  <label className="mt-4 block">
                    <span className="label">운영 메모</span>
                    <textarea
                      className="input min-h-[88px]"
                      value={requestMemos[request.id] ?? ""}
                      onChange={(event) =>
                        setRequestMemos((current) => ({
                          ...current,
                          [request.id]: event.target.value,
                        }))
                      }
                      placeholder="통화 결과, 후보 프로, 견적 안내 내용을 적어두세요."
                    />
                  </label>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {lessonRequestStatuses.map((status) => (
                      <ActionBtn
                        key={status}
                        onClick={() =>
                          postAdminAction(
                            { type: "lesson_request", id: request.id, status },
                            request.id + status,
                          )
                        }
                        busy={busy === request.id + status}
                        active={request.status === status}
                      >
                        {lessonRequestStatusLabels[status]}
                      </ActionBtn>
                    ))}
                    <ActionBtn
                      onClick={() =>
                        postAdminAction(
                          {
                            type: "lesson_request",
                            id: request.id,
                            admin_memo: requestMemos[request.id] ?? "",
                          },
                          request.id + "memo",
                        )
                      }
                      busy={busy === request.id + "memo"}
                      active={false}
                    >
                      메모 저장
                    </ActionBtn>
                  </div>
                </div>
              ))}
            </Panel>
          </section>
        )}

        {tab === "bookings" && (
          <section>
            <div className="mb-4 flex flex-wrap gap-2">
              <FilterBtn
                active={bookingFilter === "all"}
                onClick={() => setBookingFilter("all")}
              >
                전체 {bookings.length}
              </FilterBtn>
              {bookingStatuses.map((status) => (
                <FilterBtn
                  key={status}
                  active={bookingFilter === status}
                  onClick={() => setBookingFilter(status)}
                >
                  {bookingStatusLabels[status]}{" "}
                  {
                    bookings.filter((booking) => booking.status === status)
                      .length
                  }
                </FilterBtn>
              ))}
            </div>
            <Panel
              empty={filteredBookings.length === 0}
              emptyText="조건에 맞는 예약이 없습니다."
            >
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg font-black text-fairway-900">
                          {booking.student_name}
                        </span>
                        <StatusPill
                          label={
                            bookingStatusLabels[booking.status] ??
                            booking.status
                          }
                          status={booking.status}
                        />
                      </div>
                      <p className="mt-1 text-sm font-semibold text-fairway-600">
                        {booking.student_phone}
                      </p>
                    </div>
                    <div className="text-right text-xs text-fairway-400">
                      {new Date(booking.created_at).toLocaleString("ko-KR")}
                    </div>
                  </div>

                  <dl className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                    <Info
                      label="프로"
                      value={booking.instructor_name ?? booking.instructor_id}
                    />
                    <Info
                      label="희망 일정"
                      value={
                        [booking.preferred_date, booking.preferred_time]
                          .filter(Boolean)
                          .join(" ") || "-"
                      }
                    />
                    <Info label="상품" value={booking.package_title ?? "-"} />
                    <Info label="지역" value={booking.region ?? "-"} />
                    <Info
                      label="결제 상태"
                      value={booking.payment_status ?? "none"}
                    />
                    <Info
                      label="예상 금액"
                      value={
                        booking.price
                          ? `${booking.price.toLocaleString("ko-KR")}원`
                          : "-"
                      }
                    />
                  </dl>

                  {booking.goal && (
                    <div className="mt-4 rounded-lg bg-fairway-50 p-3 text-sm text-fairway-700">
                      <b>고민/목표/연락</b>
                      <p className="mt-1 leading-6">{booking.goal}</p>
                    </div>
                  )}
                  {booking.student_memo && (
                    <div className="mt-3 rounded-lg bg-white p-3 text-sm text-fairway-600 ring-1 ring-fairway-100">
                      <b>수강생 메모</b>
                      <p className="mt-1 leading-6">{booking.student_memo}</p>
                    </div>
                  )}

                  <label className="mt-4 block">
                    <span className="label">운영 메모</span>
                    <textarea
                      className="input min-h-[88px]"
                      value={bookingMemos[booking.id] ?? ""}
                      onChange={(event) =>
                        setBookingMemos((current) => ({
                          ...current,
                          [booking.id]: event.target.value,
                        }))
                      }
                      placeholder="통화 결과, 확정 안내, 특이사항을 남겨두세요."
                    />
                  </label>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {(
                      [
                        "confirmed",
                        "completed",
                        "canceled",
                        "rejected",
                        "no_show",
                      ] as const
                    ).map((status) => (
                      <ActionBtn
                        key={status}
                        onClick={() =>
                          postAdminAction(
                            { type: "booking", id: booking.id, status },
                            booking.id + status,
                          )
                        }
                        busy={busy === booking.id + status}
                        active={booking.status === status}
                      >
                        {bookingStatusLabels[status]}
                      </ActionBtn>
                    ))}
                    <ActionBtn
                      onClick={() =>
                        postAdminAction(
                          {
                            type: "booking_details",
                            id: booking.id,
                            admin_memo: bookingMemos[booking.id] ?? "",
                          },
                          booking.id + "memo",
                        )
                      }
                      busy={busy === booking.id + "memo"}
                      active={false}
                    >
                      메모 저장
                    </ActionBtn>
                  </div>
                </div>
              ))}
            </Panel>
          </section>
        )}

        {tab === "reviews" && (
          <Panel
            empty={reviews.length === 0}
            emptyText="아직 등록된 후기가 없습니다."
          >
            {reviews.map((review) => (
              <div key={review.id} className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-fairway-900">
                      {review.student_name_masked}
                    </span>
                    <Stars value={review.rating_total} size={14} />
                    {review.instructor_name && (
                      <span className="text-sm text-fairway-500">
                        · {review.instructor_name}
                      </span>
                    )}
                  </div>
                  <StatusPill
                    label={reviewStatusLabels[review.status] ?? review.status}
                    status={review.status}
                  />
                </div>
                <p className="mt-3 text-sm leading-6 text-fairway-700">
                  {review.content}
                </p>
                <label className="mt-4 block">
                  <span className="label">프로 답변</span>
                  <textarea
                    className="input min-h-[80px]"
                    value={reviewReplies[review.id] ?? ""}
                    onChange={(event) =>
                      setReviewReplies((current) => ({
                        ...current,
                        [review.id]: event.target.value,
                      }))
                    }
                    placeholder="후기 하단에 노출될 답변을 입력하세요."
                  />
                </label>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <ActionBtn
                    onClick={() =>
                      postAdminAction(
                        { type: "review", id: review.id, status: "visible" },
                        review.id + "visible",
                      )
                    }
                    busy={busy === review.id + "visible"}
                    active={review.status === "visible"}
                  >
                    승인
                  </ActionBtn>
                  <ActionBtn
                    onClick={() =>
                      postAdminAction(
                        { type: "review", id: review.id, status: "hidden" },
                        review.id + "hidden",
                      )
                    }
                    busy={busy === review.id + "hidden"}
                    active={review.status === "hidden"}
                  >
                    숨김
                  </ActionBtn>
                  <ActionBtn
                    onClick={() =>
                      postAdminAction(
                        { type: "review", id: review.id, status: "pending" },
                        review.id + "pending",
                      )
                    }
                    busy={busy === review.id + "pending"}
                    active={review.status === "pending"}
                  >
                    대기
                  </ActionBtn>
                  <ActionBtn
                    onClick={() =>
                      postAdminAction(
                        {
                          type: "review_reply",
                          id: review.id,
                          instructor_reply: reviewReplies[review.id] ?? "",
                        },
                        review.id + "reply",
                      )
                    }
                    busy={busy === review.id + "reply"}
                    active={false}
                  >
                    답변 저장
                  </ActionBtn>
                </div>
              </div>
            ))}
          </Panel>
        )}

        {tab === "applications" && (
          <section>
            <div className="mb-4 grid gap-3 rounded-lg border border-fairway-100 bg-white p-4 sm:grid-cols-3">
              <MiniMetric
                label="승인 대기"
                value={String(pendingApplications)}
              />
              <MiniMetric
                label="승인 완료"
                value={String(
                  applications.filter((item) => item.status === "approved")
                    .length,
                )}
              />
              <MiniMetric label="전체" value={String(applications.length)} />
            </div>
            <Panel
              empty={applications.length === 0}
              emptyText="아직 접수된 프로 신청이 없습니다."
            >
              {applications.map((application) => (
                <div key={application.id} className="card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg font-black text-fairway-900">
                          {application.display_name}
                        </span>
                        <StatusPill
                          label={applicationStatusLabel(application.status)}
                          status={application.status}
                        />
                      </div>
                      <p className="mt-1 text-sm font-semibold text-fairway-600">
                        {application.profile_name ||
                          application.profile_nickname ||
                          "회원"}{" "}
                        · {application.phone || application.profile_phone}
                      </p>
                    </div>
                    <div className="text-right text-xs text-fairway-400">
                      {new Date(application.created_at).toLocaleString("ko-KR")}
                    </div>
                  </div>

                  <dl className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                    <Info label="활동 지역" value={application.region} />
                    <Info
                      label="전문 분야"
                      value={listText(application.specialties)}
                    />
                    <Info
                      label="레슨 장소"
                      value={listText(application.lesson_places)}
                    />
                    <Info
                      label="경력"
                      value={`${application.career_years || 0}년`}
                    />
                    <Info
                      label="연결 프로"
                      value={application.instructor_id ?? "-"}
                    />
                    <Info
                      label="증빙"
                      value={
                        application.proof_urls.length > 0
                          ? `${application.proof_urls.length}개`
                          : "-"
                      }
                    />
                  </dl>

                  {(application.bio || application.about) && (
                    <div className="mt-4 rounded-lg bg-fairway-50 p-3 text-sm text-fairway-700">
                      {application.bio && (
                        <p>
                          <b>한 줄 소개</b> {application.bio}
                        </p>
                      )}
                      {application.about && (
                        <p className="mt-2 whitespace-pre-line leading-6">
                          <b>상세 소개</b>
                          <br />
                          {application.about}
                        </p>
                      )}
                    </div>
                  )}

                  {application.proof_urls.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {application.proof_urls.map((url) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-fairway-200 px-3 py-1.5 text-xs font-bold text-fairway-700 hover:bg-fairway-50"
                        >
                          증빙 보기
                        </a>
                      ))}
                    </div>
                  )}

                  <label className="mt-4 block">
                    <span className="label">심사 메모</span>
                    <textarea
                      className="input min-h-[88px]"
                      value={applicationMemos[application.id] ?? ""}
                      onChange={(event) =>
                        setApplicationMemos((current) => ({
                          ...current,
                          [application.id]: event.target.value,
                        }))
                      }
                      placeholder="확인한 자격, 통화 내용, 반려 사유를 적어두세요."
                    />
                  </label>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <ActionBtn
                      onClick={() =>
                        postAdminAction(
                          {
                            type: "instructor_application",
                            id: application.id,
                            status: "approved",
                            admin_memo: applicationMemos[application.id] ?? "",
                          },
                          application.id + "approved",
                        )
                      }
                      busy={busy === application.id + "approved"}
                      active={application.status === "approved"}
                    >
                      승인
                    </ActionBtn>
                    <ActionBtn
                      onClick={() =>
                        postAdminAction(
                          {
                            type: "instructor_application",
                            id: application.id,
                            status: "rejected",
                            admin_memo: applicationMemos[application.id] ?? "",
                          },
                          application.id + "rejected",
                        )
                      }
                      busy={busy === application.id + "rejected"}
                      active={application.status === "rejected"}
                    >
                      반려
                    </ActionBtn>
                    <ActionBtn
                      onClick={() =>
                        postAdminAction(
                          {
                            type: "instructor_application",
                            id: application.id,
                            status: "submitted",
                            admin_memo: applicationMemos[application.id] ?? "",
                          },
                          application.id + "submitted",
                        )
                      }
                      busy={busy === application.id + "submitted"}
                      active={application.status === "submitted"}
                    >
                      대기
                    </ActionBtn>
                  </div>
                </div>
              ))}
            </Panel>
          </section>
        )}

        {tab === "instructors" && (
          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-fairway-500">
                프로 등록, 기본 정보 수정, 노출/추천/검증 상태를 한 화면에서
                관리합니다.
              </p>
              <button
                onClick={() => setInstructorForm(emptyInstructorForm)}
                className="btn-primary"
              >
                프로 추가
              </button>
            </div>

            {instructorForm && (
              <form
                onSubmit={submitInstructor}
                className="mb-5 rounded-lg border border-fairway-100 bg-white p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-black text-fairway-900">
                    {instructorForm.id ? "프로 수정" : "프로 추가"}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setInstructorForm(null)}
                    className="text-sm font-semibold text-fairway-500"
                  >
                    닫기
                  </button>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <TextInput
                    label="프로명 *"
                    value={instructorForm.display_name}
                    onChange={(value) =>
                      updateInstructorForm("display_name", value)
                    }
                  />
                  <TextInput
                    label="슬러그 *"
                    value={instructorForm.slug}
                    onChange={(value) => updateInstructorForm("slug", value)}
                    placeholder="kim-pro"
                  />
                  <TextInput
                    label="지역 *"
                    value={instructorForm.region}
                    onChange={(value) => updateInstructorForm("region", value)}
                  />
                  <TextInput
                    label="최소가"
                    type="number"
                    value={instructorForm.price_from}
                    onChange={(value) =>
                      updateInstructorForm("price_from", value)
                    }
                  />
                  <TextInput
                    label="경력 연차"
                    type="number"
                    value={instructorForm.career_years}
                    onChange={(value) =>
                      updateInstructorForm("career_years", value)
                    }
                  />
                  <TextInput
                    label="응답 시간"
                    value={instructorForm.response_time}
                    onChange={(value) =>
                      updateInstructorForm("response_time", value)
                    }
                    placeholder="평균 1시간 이내"
                  />
                  <ImageUrlField
                    label="프로필 이미지 URL"
                    value={instructorForm.profile_image}
                    onChange={(value) =>
                      updateInstructorForm("profile_image", value)
                    }
                    onUpload={(event) =>
                      uploadInstructorImage(event, "profile_image")
                    }
                    uploading={busy === "instructor-profile-upload"}
                    uploadLabel="프로필 사진 업로드"
                  />
                  <ImageUrlField
                    label="갤러리 URL"
                    value={instructorForm.gallery}
                    onChange={(value) => updateInstructorForm("gallery", value)}
                    onUpload={(event) =>
                      uploadInstructorImage(event, "gallery")
                    }
                    uploading={busy === "instructor-gallery-upload"}
                    uploadLabel="갤러리 사진 추가"
                    multiple
                    placeholder="쉼표 또는 줄바꿈으로 구분"
                  />
                  <TextInput
                    label="전문 분야"
                    value={instructorForm.specialties}
                    onChange={(value) =>
                      updateInstructorForm("specialties", value)
                    }
                    placeholder="입문, 드라이버, 숏게임"
                  />
                  <TextInput
                    label="레슨 장소"
                    value={instructorForm.lesson_places}
                    onChange={(value) =>
                      updateInstructorForm("lesson_places", value)
                    }
                    placeholder="실내연습장, 스크린골프"
                  />
                  <TextInput
                    label="뱃지"
                    value={instructorForm.badges}
                    onChange={(value) => updateInstructorForm("badges", value)}
                    placeholder="profile_verified, fast_response"
                  />
                  <label>
                    <span className="label">성별</span>
                    <select
                      className="input"
                      value={instructorForm.gender}
                      onChange={(event) =>
                        updateInstructorForm(
                          "gender",
                          event.target.value as "male" | "female",
                        )
                      }
                    >
                      <option value="male">남성</option>
                      <option value="female">여성</option>
                    </select>
                  </label>
                  <label>
                    <span className="label">검증 상태</span>
                    <select
                      className="input"
                      value={instructorForm.verification_status}
                      onChange={(event) =>
                        updateInstructorForm(
                          "verification_status",
                          event.target.value as
                            "pending" | "verified" | "rejected",
                        )
                      }
                    >
                      <option value="pending">대기</option>
                      <option value="verified">검증 완료</option>
                      <option value="rejected">반려</option>
                    </select>
                  </label>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <TextArea
                    label="목록 소개"
                    value={instructorForm.bio}
                    onChange={(value) => updateInstructorForm("bio", value)}
                  />
                  <TextArea
                    label="상세 소개"
                    value={instructorForm.about}
                    onChange={(value) => updateInstructorForm("about", value)}
                  />
                  <TextArea
                    label="경력"
                    value={instructorForm.career_history}
                    onChange={(value) =>
                      updateInstructorForm("career_history", value)
                    }
                    placeholder="줄바꿈으로 구분"
                  />
                  <TextArea
                    label="레슨 스타일"
                    value={instructorForm.lesson_style}
                    onChange={(value) =>
                      updateInstructorForm("lesson_style", value)
                    }
                    placeholder="줄바꿈으로 구분"
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-4">
                  <Check
                    label="추천 프로"
                    checked={instructorForm.is_featured}
                    onChange={(checked) =>
                      updateInstructorForm("is_featured", checked)
                    }
                  />
                  <Check
                    label="노출 활성"
                    checked={instructorForm.is_active}
                    onChange={(checked) =>
                      updateInstructorForm("is_active", checked)
                    }
                  />
                </div>
                <div className="mt-5 flex justify-end">
                  <button
                    type="submit"
                    disabled={busy === "instructor-save"}
                    className="btn-primary"
                  >
                    {busy === "instructor-save" ? "저장 중..." : "프로 저장"}
                  </button>
                </div>
              </form>
            )}

            <Panel
              empty={instructors.length === 0}
              emptyText="등록된 프로가 없습니다."
            >
              {instructors.map((instructor) => (
                <div
                  key={instructor.id}
                  className="card flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-fairway-900">
                        {instructor.display_name}
                      </span>
                      <StatusPill
                        label={
                          instructor.verification_status === "verified"
                            ? "검증 완료"
                            : "검증 대기"
                        }
                        status={instructor.verification_status}
                      />
                      {!instructor.is_active && (
                        <StatusPill label="비활성" status="hidden" />
                      )}
                      {instructor.is_featured && (
                        <StatusPill label="추천" status="visible" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-fairway-500">
                      {instructor.region} ·{" "}
                      {instructor.specialties.join(", ") || "전문 분야 미입력"}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setInstructorForm(formFromInstructor(instructor))
                    }
                    className="rounded-lg border border-fairway-200 px-3 py-2 text-sm font-bold text-fairway-700 hover:bg-fairway-50"
                  >
                    수정
                  </button>
                </div>
              ))}
            </Panel>
          </section>
        )}
      </div>
    </div>
  );
}

function formFromInstructor(instructor: Instructor): InstructorFormState {
  return {
    id: instructor.id,
    slug: instructor.slug,
    display_name: instructor.display_name,
    profile_image: instructor.profile_image ?? "",
    gallery: instructor.gallery.join("\n"),
    bio: instructor.bio ?? "",
    about: instructor.about ?? "",
    region: instructor.region,
    lesson_places: instructor.lesson_places.join(", "),
    specialties: instructor.specialties.join(", "),
    career_years: String(instructor.career_years ?? 0),
    career_history: instructor.career_history.join("\n"),
    lesson_style: instructor.lesson_style.join("\n"),
    gender: instructor.gender,
    price_from: String(instructor.price_from ?? 0),
    response_time: instructor.response_time ?? "",
    badges: instructor.badges.join(", "),
    is_featured: instructor.is_featured,
    is_active: instructor.is_active,
    verification_status: instructor.verification_status,
  };
}

function imageUrlList(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function appendImageUrl(value: string, url: string) {
  const urls = imageUrlList(value);
  if (!urls.includes(url)) urls.push(url);
  return urls.join("\n");
}

function listText(values?: string[] | null) {
  return values?.length ? values.join(", ") : "-";
}

function moneyRange(min?: number | null, max?: number | null) {
  if (min && max)
    return `${min.toLocaleString("ko-KR")}~${max.toLocaleString("ko-KR")}원`;
  if (min) return `${min.toLocaleString("ko-KR")}원 이상`;
  if (max) return `${max.toLocaleString("ko-KR")}원 이하`;
  return "-";
}

function genderPreferenceLabel(value?: string | null) {
  if (value === "male") return "남성 프로";
  if (value === "female") return "여성 프로";
  return "상관없음";
}

function applicationStatusLabel(status: string) {
  if (status === "approved") return "승인 완료";
  if (status === "rejected") return "반려";
  return "승인 대기";
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-bold transition-colors ${
        active
          ? "border-fairway-700 text-fairway-900"
          : "border-transparent text-fairway-400 hover:text-fairway-600"
      }`}
    >
      {children}
    </button>
  );
}

function FilterBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${
        active
          ? "border-fairway-700 bg-fairway-700 text-white"
          : "border-fairway-200 bg-white text-fairway-600 hover:bg-fairway-50"
      }`}
    >
      {children}
    </button>
  );
}

function Count({ n }: { n: number }) {
  return (
    <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
      {n}
    </span>
  );
}

function Panel({
  empty,
  emptyText,
  children,
}: {
  empty: boolean;
  emptyText: string;
  children: React.ReactNode;
}) {
  if (empty)
    return (
      <div className="card p-12 text-center text-fairway-500">{emptyText}</div>
    );
  return <div className="space-y-3">{children}</div>;
}

function ActionBtn({
  onClick,
  busy,
  active,
  children,
}: {
  onClick: () => void;
  busy: boolean;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
        active
          ? "border-fairway-600 bg-fairway-700 text-white"
          : "border-fairway-200 text-fairway-700 hover:bg-fairway-50"
      }`}
    >
      {busy ? "..." : children}
    </button>
  );
}

function StatusPill({ label, status }: { label: string; status: string }) {
  const tone =
    status === "confirmed" ||
    status === "visible" ||
    status === "verified" ||
    status === "approved" ||
    status === "completed" ||
    status === "quoted" ||
    status === "closed"
      ? "bg-fairway-100 text-fairway-800"
      : status === "requested" ||
          status === "pending" ||
          status === "submitted" ||
          status === "open" ||
          status === "contacted"
        ? "bg-gold-100 text-gold-800"
        : "bg-rose-50 text-rose-600";
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${tone}`}>
      {label}
    </span>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-white p-3 ring-1 ring-fairway-100">
      <dt className="text-xs font-bold text-fairway-400">{label}</dt>
      <dd className="mt-1 font-semibold text-fairway-800">{value}</dd>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold text-fairway-400">{label}</p>
      <p className="mt-1 text-2xl font-black text-fairway-900">{value}</p>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label>
      <span className="label">{label}</span>
      <input
        className="input"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function ImageUrlField({
  label,
  value,
  onChange,
  onUpload,
  uploading,
  uploadLabel,
  multiple = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  uploadLabel: string;
  multiple?: boolean;
  placeholder?: string;
}) {
  const urls = imageUrlList(value).slice(0, multiple ? 4 : 1);

  return (
    <div>
      <span className="label">{label}</span>
      {multiple ? (
        <textarea
          className="input min-h-[92px]"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          className="input"
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}

      {urls.length > 0 && (
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {urls.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative aspect-square overflow-hidden rounded-lg bg-fairway-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`${label} 미리보기 ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="relative inline-flex">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={uploading}
            onChange={onUpload}
            className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
          />
          <span className="rounded-lg border border-fairway-200 bg-white px-3 py-1.5 text-xs font-bold text-fairway-700 shadow-sm">
            {uploading ? "업로드 중..." : uploadLabel}
          </span>
        </span>
        <span className="text-xs text-fairway-400">
          R2 저장 · JPG, PNG, WebP · 25MB 이하
        </span>
      </div>
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label>
      <span className="label">{label}</span>
      <textarea
        className="input min-h-[100px]"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm font-bold text-fairway-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-fairway-300 text-fairway-700"
      />
      {label}
    </label>
  );
}
