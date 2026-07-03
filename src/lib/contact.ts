export const CONTACT_METHODS = [
  { value: "phone", label: "전화" },
  { value: "sms", label: "문자" },
  { value: "kakao", label: "카카오톡" },
  { value: "open_kakao", label: "오픈카톡" },
] as const;

export type ContactMethod = (typeof CONTACT_METHODS)[number]["value"];

export function contactMethodLabel(value: string) {
  return (
    CONTACT_METHODS.find((method) => method.value === value)?.label ||
    CONTACT_METHODS[1].label
  );
}

export function contactMemo(method: string, detail?: string) {
  const label = contactMethodLabel(method);
  const cleanDetail = detail?.trim();
  return cleanDetail
    ? `연락 희망: ${label} (${cleanDetail})`
    : `연락 희망: ${label}`;
}
