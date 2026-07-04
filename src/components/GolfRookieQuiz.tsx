"use client";

import { useMemo, useState } from "react";

type Answer = {
  label: string;
  points: number;
  note: string;
};

type QuizQuestion = {
  prompt: string;
  maxPoints: number;
  answers: Answer[];
};

type ResultTier = {
  min: number;
  title: string;
  badge: string;
  headline: string;
  tease: string;
  cta: string;
  tone: string;
};

type GolfRookieQuizProps = {
  sharePath?: string;
  showStandaloneLink?: boolean;
};

const QUESTIONS: QuizQuestion[] = [
  {
    prompt: "티샷이 숲으로 갔고 공이 안 보입니다. 첫 반응은?",
    maxPoints: 17,
    answers: [
      {
        label: "잠정구 친다고 말하고 다시 친다",
        points: 17,
        note: "룰도 흐름도 챙기는 타입",
      },
      {
        label: "일단 하나 더 치고 조용히 지나간다",
        points: 8,
        note: "마음은 알겠지만 기록지가 울어요",
      },
      {
        label: "멀리건을 눈빛으로 요청한다",
        points: 6,
        note: "친구전에서는 통할 수도 있어요",
      },
      {
        label: "동반자에게 먼저 찾으러 가달라고 한다",
        points: 2,
        note: "카트 분위기가 잠깐 차가워집니다",
      },
    ],
  },
  {
    prompt: "그린 위에서 가장 조심해야 할 행동은?",
    maxPoints: 17,
    answers: [
      {
        label: "동반자 퍼팅 라인을 밟지 않는다",
        points: 17,
        note: "매너 점수는 이미 보기 플레이어",
      },
      {
        label: "공만 빨리 치면 된다",
        points: 7,
        note: "속도는 좋은데 섬세함이 필요해요",
      },
      {
        label: "퍼터로 그린을 콕콕 찍어본다",
        points: 3,
        note: "그린키퍼가 마음속으로 운다",
      },
      {
        label: "남의 볼마커를 살짝 옮겨본다",
        points: 1,
        note: "장난이어도 바로 단속 대상",
      },
    ],
  },
  {
    prompt: "벙커샷을 하고 나온 뒤 제일 자연스러운 마무리는?",
    maxPoints: 16,
    answers: [
      {
        label: "고무래로 발자국과 샷 자국을 정리한다",
        points: 16,
        note: "이 정도면 필드 매너는 합격",
      },
      {
        label: "내 발자국만 대충 덮는다",
        points: 9,
        note: "반은 맞고 반은 아쉬워요",
      },
      {
        label: "모래가 원래 그런 거라고 생각한다",
        points: 4,
        note: "다음 팀에게 작은 숙제를 남김",
      },
      {
        label: "벙커에 오래 있었으니 바로 탈출한다",
        points: 2,
        note: "마음은 탈출했지만 매너가 남았어요",
      },
    ],
  },
  {
    prompt: "필드에서 앞 팀과 간격이 벌어졌습니다. 가장 좋은 선택은?",
    maxPoints: 16,
    answers: [
      {
        label: "루틴을 줄이고 다음 샷 준비를 미리 한다",
        points: 16,
        note: "동반자가 편해지는 골프",
      },
      {
        label: "사진은 예쁘게 찍고 천천히 움직인다",
        points: 7,
        note: "인스타는 살고 경기 흐름은 살짝 흔들림",
      },
      {
        label: "내 차례가 올 때까지 클럽을 안 고른다",
        points: 4,
        note: "카트가 조용히 한숨 쉬는 순간",
      },
      {
        label: "앞 팀도 언젠가 느려질 거라 믿는다",
        points: 2,
        note: "희망은 좋지만 진행은 현실이에요",
      },
    ],
  },
  {
    prompt: "레슨 받을 때 가장 빨리 늘 가능성이 높은 준비물은?",
    maxPoints: 17,
    answers: [
      {
        label: "최근 스윙 영상과 자주 나는 미스 기록",
        points: 17,
        note: "프로가 바로 처방할 수 있어요",
      },
      {
        label: "새 장갑과 자신감",
        points: 9,
        note: "기분은 중요하지만 증거가 더 빨라요",
      },
      {
        label: "유튜브에서 본 레슨 12개",
        points: 6,
        note: "머릿속은 이미 투어 프로",
      },
      {
        label: "오늘은 감으로 해보겠다는 마음",
        points: 3,
        note: "감은 가끔 연습장을 탈출합니다",
      },
    ],
  },
  {
    prompt: "스코어를 줄이는 데 제일 먼저 체크할 숫자는?",
    maxPoints: 17,
    answers: [
      {
        label: "OB, 3퍼트, 어프로치 뒤땅 횟수",
        points: 17,
        note: "이미 원인 분석을 시작했네요",
      },
      {
        label: "드라이버 비거리",
        points: 8,
        note: "중요하지만 전부는 아니에요",
      },
      {
        label: "새 클럽 할인율",
        points: 5,
        note: "지갑은 줄고 스코어는 미정",
      },
      {
        label: "동반자 중 누가 더 많이 웃었는지",
        points: 3,
        note: "추억 점수는 만점입니다",
      },
    ],
  },
];

const RESULT_TIERS: ResultTier[] = [
  {
    min: 92,
    title: "싱글 냄새 나는 고수",
    badge: "초보 놀리는 쪽",
    headline: "100점 만점에 거의 프로 지망생",
    tease: "초보라고 말하면 동반자가 믿지 않습니다.",
    cta: "상급 레슨으로 디테일만 다듬기",
    tone: "bg-fairway-900 text-white",
  },
  {
    min: 80,
    title: "잘 치는 척이 아니라 진짜 잘함",
    badge: "80점대 실력자",
    headline: "룰, 매너, 연습 포인트가 꽤 탄탄해요",
    tease: "친구들 앞에서 오늘은 살짝 자랑해도 됩니다.",
    cta: "약점만 골라 레슨 받기",
    tone: "bg-fairway-700 text-white",
  },
  {
    min: 60,
    title: "골린이 졸업반",
    badge: "초보 탈출 직전",
    headline: "초보 티는 나지만 이미 방향은 잡혔어요",
    tease: "놀림은 받지만 반박할 근거도 조금 있습니다.",
    cta: "100타 탈출 루틴 만들기",
    tone: "bg-gold-400 text-fairway-950",
  },
  {
    min: 40,
    title: "귀여운 초보",
    badge: "필드 보호 관찰",
    headline: "기본 매너와 상황 판단부터 잡으면 빨라요",
    tease: "카트에서 제일 많이 이름 불릴 가능성이 높습니다.",
    cta: "처음부터 편하게 배우기",
    tone: "bg-gold-200 text-fairway-950",
  },
  {
    min: 0,
    title: "찐 골린이 인증",
    badge: "오늘부터 1일",
    headline: "아직은 스윙보다 생존 매너가 먼저예요",
    tease: "친구들이 놀리기 전에 먼저 공유하면 선제공격입니다.",
    cta: "초보 전용 레슨 찾기",
    tone: "bg-white text-fairway-950",
  },
];

export function GolfRookieQuiz({
  sharePath = "/quiz",
  showStandaloneLink = true,
}: GolfRookieQuizProps) {
  const [selected, setSelected] = useState<(number | null)[]>(() =>
    emptyAnswers(),
  );
  const [active, setActive] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [status, setStatus] = useState("");
  const answeredCount = selected.filter((item) => item !== null).length;
  const isComplete = answeredCount === QUESTIONS.length;
  const isResultVisible = showResult && isComplete;
  const activeQuestion = QUESTIONS[active];
  const activeAnswer = selected[active];
  const score = useMemo(() => calculateScore(selected), [selected]);
  const tier = resultTierFor(score);
  const progress = Math.round((answeredCount / QUESTIONS.length) * 100);

  function chooseAnswer(answerIndex: number) {
    setSelected((current) =>
      current.map((item, index) => (index === active ? answerIndex : item)),
    );
    setStatus("");
  }

  function move(delta: number) {
    setActive((index) =>
      Math.min(QUESTIONS.length - 1, Math.max(0, index + delta)),
    );
    setStatus("");
  }

  function continueQuiz() {
    if (active === QUESTIONS.length - 1) {
      setShowResult(true);
      setStatus("");
      return;
    }

    move(1);
  }

  function reset() {
    setSelected(emptyAnswers());
    setActive(0);
    setShowResult(false);
    setStatus("");
  }

  async function shareText() {
    const payload = buildSharePayload(score, tier, sharePath);

    if (navigator.share) {
      try {
        await navigator.share(payload);
        setStatus("공유창을 열었어요.");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          setStatus("공유를 취소했어요.");
          return;
        }
      }
    }

    await copyToClipboard(`${payload.text}\n${payload.url}`);
  }

  async function copyResult() {
    const payload = buildSharePayload(score, tier, sharePath);
    await copyToClipboard(`${payload.text}\n${payload.url}`);
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("결과 문구를 복사했어요.");
      return;
    } catch {
      if (fallbackCopy(text)) {
        setStatus("결과 문구를 복사했어요.");
        return;
      }

      setStatus("브라우저가 복사를 막았어요. 공유 멘트를 길게 눌러주세요.");
    }
  }

  async function shareImage() {
    try {
      const file = await createResultImage(score, tier);

      if (navigator.canShare?.({ files: [file] }) && navigator.share) {
        await navigator.share({
          title: "골린이 판독기 결과",
          text: `${tier.title} ${score}점`,
          files: [file],
        });
        setStatus("결과 이미지를 공유했어요.");
        return;
      }

      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setStatus("결과 이미지를 저장했어요.");
    } catch {
      setStatus("이미지 생성이 잠깐 막혔어요. 문구 공유를 사용해주세요.");
    }
  }

  return (
    <section
      data-testid="golf-rookie-quiz"
      className="border-y border-fairway-100 bg-cream"
    >
      <div className="container-page py-4 sm:py-7">
        <div className="overflow-hidden rounded-lg border border-fairway-100 bg-white shadow-card lg:grid lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="bg-fairway-950 p-3 text-white sm:p-5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-gold-300 px-2 py-0.5 text-[10px] font-black uppercase text-fairway-950">
                Share Quiz
              </span>
              <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-black text-fairway-100">
                6문항
              </span>
            </div>
            <h2 className="mt-2 text-base font-black leading-tight sm:text-xl">
              골린이 판독기
            </h2>
            <p className="mt-1 max-w-xl text-[12px] leading-5 text-fairway-100">
              친구 점수 내고 바로 공유하기.
            </p>
            {showStandaloneLink && (
              <a
                href="/quiz"
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-black text-gold-200 hover:underline"
              >
                퀴즈 페이지만 보기
                <ArrowRightIcon />
              </a>
            )}
            <div className="mt-2 grid grid-cols-3 gap-1.5 lg:grid-cols-1">
              <QuizStat label="90+" value="고수" />
              <QuizStat label="80+" value="자랑" />
              <QuizStat label="60+" value="졸업반" />
            </div>
          </div>

          {!isResultVisible ? (
            <div className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-fairway-50 px-2.5 py-1 text-[11px] font-black text-fairway-800">
                  {active + 1}/{QUESTIONS.length}
                </span>
                <span className="text-[11px] font-bold text-fairway-500">
                  {progress}% 완료
                </span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-fairway-100">
                <div
                  className="h-full rounded-full bg-gold-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <h3 className="mt-2.5 text-[15px] font-black leading-tight text-fairway-950 sm:text-lg">
                {activeQuestion.prompt}
              </h3>
              <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                {activeQuestion.answers.map((answer, answerIndex) => {
                  const picked = activeAnswer === answerIndex;

                  return (
                    <button
                      key={answer.label}
                      type="button"
                      onClick={() => chooseAnswer(answerIndex)}
                      aria-pressed={picked}
                      className={`min-h-[50px] rounded-md border px-2 py-1.5 text-left transition sm:px-2.5 sm:py-2 ${
                        picked
                          ? "border-fairway-700 bg-fairway-900 text-white shadow-card"
                          : "border-fairway-100 bg-white text-fairway-900 hover:border-fairway-300 hover:bg-fairway-50"
                      }`}
                    >
                      <span className="line-clamp-2 text-[11px] font-black leading-4 sm:line-clamp-1 sm:text-[13px] sm:leading-5">
                        {answer.label}
                      </span>
                      <span
                        className={`hidden text-[10px] leading-4 sm:line-clamp-1 ${
                          picked ? "text-fairway-100" : "text-fairway-500"
                        }`}
                      >
                        {answer.note}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => move(-1)}
                  disabled={active === 0}
                  className="btn-outline min-h-9 min-w-[86px] py-1.5 disabled:opacity-40"
                >
                  <ArrowLeftIcon />
                  이전
                </button>
                <button
                  type="button"
                  onClick={continueQuiz}
                  disabled={activeAnswer === null}
                  className="btn-primary min-h-9 min-w-[98px] py-1.5 disabled:opacity-40"
                >
                  {active === QUESTIONS.length - 1 ? "결과 보기" : "다음"}
                  <ArrowRightIcon />
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-0 lg:grid-cols-[0.82fr_1.18fr]">
              <div className={`p-4 sm:p-5 ${tier.tone}`}>
                <p className="text-[12px] font-black opacity-80">
                  골린이 판독 결과
                </p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-black leading-none sm:text-6xl">
                      {score}
                    </span>
                    <span className="pb-1 text-lg font-black">점</span>
                  </div>
                  <ResultMascot score={score} />
                </div>
                <p className="mt-2 inline-flex rounded-full bg-white/18 px-2.5 py-1 text-[11px] font-black ring-1 ring-current/10">
                  {tier.badge}
                </p>
                <h3 className="mt-3 text-lg font-black leading-tight sm:text-xl">
                  {tier.title}
                </h3>
                <p className="mt-1 text-[12px] leading-5 opacity-85 sm:text-[13px]">
                  {tier.headline}
                </p>
              </div>

              <div className="p-3 sm:p-4">
                <p className="text-[12px] font-black text-gold-700">
                  공유 멘트
                </p>
                <p className="mt-1 text-base font-black leading-tight text-fairway-950 sm:text-lg">
                  {tier.tease}
                </p>
                <div className="mt-3 select-text rounded-lg border border-fairway-100 bg-cream p-2.5">
                  <p className="text-[12px] font-bold leading-5 text-fairway-800 sm:text-[13px]">
                    나는 골린이 판독기 {score}점, {tier.title}.
                    <br />
                    너도 해보고 나한테 스코어카드 제출해.
                  </p>
                </div>
                <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={shareText}
                    className="btn-primary min-h-9 py-1.5"
                  >
                    <ShareIcon />
                    카톡·인스타 공유
                  </button>
                  <button
                    type="button"
                    onClick={shareImage}
                    className="btn-gold min-h-9 py-1.5"
                  >
                    <ImageIcon />
                    이미지로 공유
                  </button>
                  <button
                    type="button"
                    onClick={copyResult}
                    className="btn-outline min-h-9 py-1.5"
                  >
                    <CopyIcon />
                    문구 복사
                  </button>
                  <button
                    type="button"
                    onClick={reset}
                    className="btn-outline min-h-9 py-1.5"
                  >
                    <RefreshIcon />
                    다시 하기
                  </button>
                </div>
                <a
                  href={`/request?goal=${encodeURIComponent(tier.cta)}`}
                  className="mt-2.5 flex min-h-9 items-center justify-center rounded-lg bg-fairway-50 px-4 py-1.5 text-[12px] font-black text-fairway-800 transition hover:bg-fairway-100 sm:text-[13px]"
                >
                  {tier.cta}
                </a>
                {status && (
                  <p className="mt-3 text-[12px] font-bold text-fairway-500">
                    {status}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function emptyAnswers() {
  return QUESTIONS.map(() => null);
}

function calculateScore(selected: (number | null)[]): number {
  let total = 0;

  selected.forEach((answerIndex, questionIndex) => {
    if (answerIndex === null) return;
    total += QUESTIONS[questionIndex].answers[answerIndex].points;
  });

  return total;
}

function resultTierFor(score: number) {
  return RESULT_TIERS.find((tier) => score >= tier.min) ?? RESULT_TIERS.at(-1)!;
}

function buildSharePayload(score: number, tier: ResultTier, sharePath: string) {
  const url =
    typeof window === "undefined"
      ? "https://100tothefuture.com/quiz"
      : new URL(sharePath, window.location.origin).toString();

  return {
    title: "골린이 판독기 결과",
    text: `나는 골린이 판독기 ${score}점, ${tier.title}. ${tier.tease} 너도 해보고 나한테 스코어카드 제출해.`,
    url,
  };
}

function fallbackCopy(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}

async function createResultImage(score: number, tier: ResultTier) {
  const canvas = document.createElement("canvas");
  const width = 1080;
  const height = 1350;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Canvas context is unavailable");

  ctx.fillStyle = "#faf8f3";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#0c1e15";
  ctx.fillRect(0, 0, width, 260);
  ctx.fillStyle = "#d4a94e";
  ctx.fillRect(0, 252, width, 12);
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 46px Pretendard, sans-serif";
  ctx.fillText("100 to the future", 72, 112);
  ctx.font = "800 32px Pretendard, sans-serif";
  ctx.fillStyle = "#dfbf72";
  ctx.fillText("골린이 판독기", 72, 168);

  ctx.fillStyle = "#ffffff";
  roundRect(ctx, 72, 332, 936, 780, 28);
  ctx.fill();
  ctx.strokeStyle = "#dcecdf";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "#183526";
  ctx.font = "900 150px Pretendard, sans-serif";
  ctx.fillText(String(score), 96, 518);
  ctx.font = "900 52px Pretendard, sans-serif";
  ctx.fillText("점", 322, 512);
  drawCanvasMascot(ctx, 725, 416, 1.15, mascotLabelFor(score));

  ctx.fillStyle = "#d4a94e";
  roundRect(ctx, 96, 568, 330, 58, 29);
  ctx.fill();
  ctx.fillStyle = "#0c1e15";
  ctx.font = "900 28px Pretendard, sans-serif";
  ctx.fillText(tier.badge, 126, 606);

  ctx.fillStyle = "#0c1e15";
  ctx.font = "900 58px Pretendard, sans-serif";
  wrapText(ctx, tier.title, 96, 720, 828, 70);
  ctx.fillStyle = "#2a6540";
  ctx.font = "700 34px Pretendard, sans-serif";
  wrapText(ctx, tier.headline, 96, 900, 828, 48);
  ctx.fillStyle = "#784b2e";
  ctx.font = "800 32px Pretendard, sans-serif";
  wrapText(ctx, tier.tease, 96, 1012, 828, 44);

  ctx.fillStyle = "#183526";
  roundRect(ctx, 72, 1174, 936, 92, 22);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 30px Pretendard, sans-serif";
  ctx.fillText("너도 해보고 스코어카드 제출해", 112, 1232);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((created) => {
      if (created) resolve(created);
      else reject(new Error("Image generation failed"));
    }, "image/png");
  });

  return new File([blob], `golf-rookie-score-${score}.png`, {
    type: "image/png",
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  let offsetY = 0;

  words.forEach((word, index) => {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, y + offsetY);
      line = word;
      offsetY += lineHeight;
    } else {
      line = testLine;
    }

    if (index === words.length - 1) {
      ctx.fillText(line, x, y + offsetY);
    }
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function QuizStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-fairway-200 bg-white/80 px-3 py-2 shadow-sm">
      <p className="text-[11px] font-black text-gold-700">{label}</p>
      <p className="mt-0.5 truncate text-[12px] font-black text-fairway-900">
        {value}
      </p>
    </div>
  );
}

function ResultMascot({ score }: { score: number }) {
  const label = mascotLabelFor(score);

  return (
    <svg
      viewBox="0 0 128 118"
      className="h-20 w-24 shrink-0 drop-shadow-[0_8px_16px_rgba(12,30,21,0.18)] sm:h-24 sm:w-28"
      aria-hidden
    >
      <path
        d="M68 14h41c8 0 14 6 14 14v20c0 8-6 14-14 14H88l-13 13v-13h-7c-8 0-14-6-14-14V28c0-8 6-14 14-14z"
        fill="#fff8e8"
        stroke="#d4a94e"
        strokeWidth="3"
      />
      <text
        x="89"
        y="43"
        textAnchor="middle"
        fontSize="14"
        fontWeight="900"
        fill="#183526"
      >
        {label}
      </text>
      <path
        d="M33 24c-8 8-11 19-9 32 3 19 19 34 39 34s36-15 39-34c2-13-1-24-9-32-11 6-21 9-30 9s-19-3-30-9z"
        fill="#fffaf0"
        stroke="#183526"
        strokeWidth="3"
      />
      <path
        d="M34 23c9-11 47-11 58 0-10 7-20 11-29 11s-19-4-29-11z"
        fill="#d4a94e"
        stroke="#183526"
        strokeWidth="3"
      />
      <path
        d="M45 54c2 2 5 2 7 0M74 54c2 2 5 2 7 0"
        stroke="#183526"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M56 68c4 4 12 4 16 0"
        stroke="#183526"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="43" cy="64" r="5" fill="#f1a9a0" opacity="0.85" />
      <circle cx="85" cy="64" r="5" fill="#f1a9a0" opacity="0.85" />
      <path
        d="M21 82l-8 24M15 104h26"
        stroke="#183526"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle
        cx="44"
        cy="105"
        r="4"
        fill="#fffaf0"
        stroke="#183526"
        strokeWidth="3"
      />
    </svg>
  );
}

function mascotLabelFor(score: number) {
  if (score >= 92) return "인정";
  if (score >= 80) return "오?";
  if (score >= 60) return "졸업?";
  if (score >= 40) return "연습!";
  return "골린!";
}

function drawCanvasMascot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  label: string,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = "#fff8e8";
  roundRect(ctx, 2, 0, 132, 62, 18);
  ctx.fill();
  ctx.strokeStyle = "#d4a94e";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = "#183526";
  ctx.font = "900 30px Pretendard, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label, 68, 41);

  ctx.beginPath();
  ctx.arc(58, 132, 54, 0, Math.PI * 2);
  ctx.fillStyle = "#fffaf0";
  ctx.fill();
  ctx.strokeStyle = "#183526";
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(14, 92);
  ctx.quadraticCurveTo(58, 55, 102, 92);
  ctx.quadraticCurveTo(58, 113, 14, 92);
  ctx.fillStyle = "#d4a94e";
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "#183526";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(34, 130);
  ctx.lineTo(43, 130);
  ctx.moveTo(76, 130);
  ctx.lineTo(85, 130);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(48, 150);
  ctx.quadraticCurveTo(58, 160, 70, 150);
  ctx.stroke();

  ctx.fillStyle = "#f1a9a0";
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.arc(30, 146, 9, 0, Math.PI * 2);
  ctx.arc(88, 146, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();
}

function ArrowLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
      <path d="M16 6l-4-4-4 4" />
      <path d="M12 2v14" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="M20 16l-4.5-4.5L8 19" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="8" y="8" width="11" height="11" rx="2" />
      <path d="M5 15H4a1 1 0 0 1-1-1V5a2 2 0 0 1 2-2h9a1 1 0 0 1 1 1v1" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 12a8 8 0 1 1-2.3-5.6" />
      <path d="M20 4v6h-6" />
    </svg>
  );
}
