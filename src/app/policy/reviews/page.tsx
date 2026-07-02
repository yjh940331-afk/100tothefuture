import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";

export const metadata: Metadata = { title: "리뷰 운영정책" };

export default function ReviewPolicyPage() {
  return (
    <LegalLayout title="리뷰 운영정책" updated="2026-07-01">
      <p>
        100 to the Future는 신뢰할 수 있는 후기 문화를 위해 다음 원칙으로 리뷰를
        운영합니다.
      </p>

      <h2>1. 작성 자격</h2>
      <ul>
        <li>실제 레슨을 받은(예약 완료) 수강생만 후기를 작성할 수 있습니다.</li>
        <li>예약 완료 건당 후기 1개를 원칙으로 합니다.</li>
      </ul>

      <h2>2. 노출 및 관리</h2>
      <ul>
        <li>모든 후기는 운영자 확인 후 노출됩니다.</li>
        <li>부정적 후기라는 이유만으로 삭제하지 않습니다.</li>
        <li>욕설·비방, 개인정보 노출, 명예훼손·허위사실만 숨김 처리합니다.</li>
        <li>작성자 이름은 자동으로 마스킹(예: 김**)됩니다.</li>
        <li>레슨프로는 후기에 답글을 달 수 있습니다.</li>
      </ul>

      <h2>3. 신고 처리</h2>
      <p>부적절한 후기는 신고할 수 있으며, 운영자가 검토 후 조치합니다.</p>

      <h2>4. 혜택 제공 후기 표시</h2>
      <p>
        포인트·쿠폰 등 <b>대가·혜택을 받고 작성된 후기</b>는 「추천·보증 등에
        관한 표시·광고 심사지침」에 따라 그 사실을 명확히 표시합니다. 후기 조작
        및 부당한 표시·광고는 하지 않습니다.
      </p>
    </LegalLayout>
  );
}
