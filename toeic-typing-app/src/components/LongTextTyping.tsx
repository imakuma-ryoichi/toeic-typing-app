import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  PRACTICAL_TEXTS,
  TypingGenre,
  TypingTabMode,
} from "../data/practicalTexts";
import { resolveLongestValid, resolveRomaji, defaultRomaji } from "../utils/romaji";
import "./LongTextTyping.css";

export interface UserGoals {
  firstTryAccuracy: number;
  normalAccuracy: number;
  wpm: number;
}

export interface SessionRecord {
  id: string;
  timestamp: string;
  genre: TypingGenre;
  tabMode: TypingTabMode;
  modeLabel: string;
  title: string;
  firstTryAccuracy: number;
  normalAccuracy: number;
  wpm: number;
  keystrokes: number;
  mistakes: number;
}

interface LongTextTypingProps {
  isActive: boolean;
  genre?: TypingGenre;
  tabMode?: TypingTabMode;
  goals?: UserGoals;
  sessions?: SessionRecord[];
  onSessionComplete?: (record: SessionRecord) => void;
}

function getRandomTextIndex(length: number, previousIndex?: number): number {
  if (length <= 1) return 0;

  let nextIndex = Math.floor(Math.random() * length);
  while (nextIndex === previousIndex) {
    nextIndex = Math.floor(Math.random() * length);
  }
  return nextIndex;
}

const DEFAULT_GOALS: UserGoals = {
  firstTryAccuracy: 90,
  normalAccuracy: 95,
  wpm: 60,
};

const TAB_MODE_LABELS: Record<
  TypingTabMode,
  { modeTag: string }
> = {
  func1: { modeTag: "機能1 (日本語)" },
  func2: { modeTag: "機能2 (単語)" },
  func3: { modeTag: "機能3 (熟語)" },
  func4: { modeTag: "機能4 (実践文)" },
};

export function LongTextTyping({
  isActive,
  genre = "toeic",
  tabMode = "func4",
  goals = DEFAULT_GOALS,
  sessions = [],
  onSessionComplete,
}: LongTextTypingProps) {
  const [selectedTextIdx, setSelectedTextIdx] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>("");
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // 打鍵メトリクス
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [keystrokes, setKeystrokes] = useState<number>(0);
  const [mistakes, setMistakes] = useState<number>(0);
  const [hasErrorFlash, setHasErrorFlash] = useState<boolean>(false);

  // 1回でもミスした文字インデックスの記録（オレンジ文字表示 & 一発精度算出用）
  const [missedIndices, setMissedIndices] = useState<Set<number>>(new Set());

  // DOM参照（スクロール計算用）
  const containerRef = useRef<HTMLDivElement>(null);
  const activeCharRef = useRef<HTMLSpanElement>(null);
  const [scrollTranslateX, setScrollTranslateX] = useState<number>(0);
  const errorTimeoutRef = useRef<number | null>(null);

  // 現在のジャンル・タブに対応するテキスト一覧を抽出
  const filteredTexts = useMemo(() => {
    const matched = PRACTICAL_TEXTS.filter(
      (t) => t.genre === genre && t.tabMode === tabMode
    );
    return matched.length > 0 ? matched : PRACTICAL_TEXTS;
  }, [genre, tabMode]);

  const currentText = filteredTexts[selectedTextIdx] || filteredTexts[0];
  const sentences = currentText.sentences;
  const tabMeta = TAB_MODE_LABELS[tabMode];

  // 機能1（日本語）はかな文字列をローマ字の揺れ込みで判定する
  const isJapanese = tabMode === "func1";
  // 日本語は文同士をスペースで区切らない。英語（単語・熟語・実践文）は1つの半角スペースで区切る
  const sentenceSeparator = isJapanese ? "" : " ";

  // 連続モード用：文セグメント情報（各文の開始・終了位置をマッピング）
  // ※日本語の場合は「かな文字位置」、英語の場合は「入力文字位置」
  const sentenceSegments = useMemo(() => {
    let offset = 0;
    return sentences.map((s, idx) => {
      const start = offset;
      const end = start + s.text.length;
      offset = end + sentenceSeparator.length;
      return {
        ...s,
        start,
        end,
        index: idx,
      };
    });
  }, [sentences, sentenceSeparator]);

  // 現在のタイピング対象となる元テキスト（日本語ならかな）の決定
  const fullContinuousText = useMemo(() => {
    return sentences.map((s) => s.text).join(sentenceSeparator);
  }, [sentences, sentenceSeparator]);

  const sourceText = fullContinuousText;

  // 日本語：入力済み文字列に合わせてローマ字表記を動的に解決
  const romajiState = useMemo(() => {
    if (!isJapanese) return null;
    return resolveLongestValid(sourceText, userInput);
  }, [isJapanese, sourceText, userInput]);

  // 実際に打鍵するテキスト（日本語は動的ローマ字、英語はそのまま）
  const targetText = romajiState ? romajiState.romaji : sourceText;

  const totalTargetChars = useMemo(() => {
    if (isJapanese) {
      return sentences.reduce((sum, s) => sum + defaultRomaji(s.text).length, 0);
    }
    return sentences.reduce((sum, s) => sum + s.text.length, 0);
  }, [isJapanese, sentences]);

  // 現在対応する日本語訳の決定
  const { currentDisplayTranslation, currentDisplayKana } =
    useMemo(() => {
      const pos = romajiState ? romajiState.consumedKana : userInput.length;
      const seg =
        sentenceSegments.find((s) =>
          isJapanese ? pos >= s.start && pos < s.end : pos >= s.start && pos <= s.end
        ) || sentenceSegments[sentenceSegments.length - 1];
      return {
        currentDisplayTranslation: seg ? seg.translation : "",
        currentDisplayKana: seg ? seg.text : "",
      };
    }, [
      sentences,
      sentenceSegments,
      userInput.length,
      romajiState,
      isJapanese,
    ]);

  // リセット処理
  const resetSession = useCallback(() => {
    setUserInput("");
    setIsCompleted(false);
    setStartTime(null);
    setEndTime(null);
    setKeystrokes(0);
    setMistakes(0);
    setMissedIndices(new Set());
    setHasErrorFlash(false);
    setScrollTranslateX(0);
  }, []);

  // ジャンルやタブが切り替わったら、対象範囲からランダムに選んでリセット
  useEffect(() => {
    setSelectedTextIdx((previousIndex) =>
      getRandomTextIndex(filteredTexts.length, previousIndex)
    );
    resetSession();
  }, [genre, tabMode, filteredTexts.length, resetSession]);

  // 次のテキストへランダムに移動
  const handleNextText = useCallback(() => {
    const nextIdx = getRandomTextIndex(filteredTexts.length, selectedTextIdx);
    setSelectedTextIdx(nextIdx);
    resetSession();
  }, [selectedTextIdx, filteredTexts.length, resetSession]);

  // 1文字打つごとにテキスト位置をスライドさせ、右から生えてくる計算
  useEffect(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    // 打鍵カーソルの固定位置（コンテナ左から約 28% の位置）
    const fixedCursorX = Math.max(120, Math.min(260, containerWidth * 0.28));

    if (activeCharRef.current) {
      const charLeft = activeCharRef.current.offsetLeft;
      // カーソル文字が常に fixedCursorX に来るようにトラックを左にずらす
      const targetTranslate = fixedCursorX - charLeft;
      setScrollTranslateX(targetTranslate);
    } else if (userInput.length === 0) {
      // 開始時は先頭文字が fixedCursorX に位置する
      setScrollTranslateX(fixedCursorX);
    }
  }, [userInput, targetText]);

  // キーボードイベントハンドラ
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // フォーム入力中やIME変換中はスキップ
      if (
        e.isComposing ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLSelectElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // 完了画面での操作
      if (isCompleted) {
        if (e.key === "Enter") {
          e.preventDefault();
          handleNextText();
        } else if (e.key === "Escape") {
          e.preventDefault();
          resetSession();
        }
        return;
      }

      // Escキーでやり直し
      if (e.key === "Escape") {
        e.preventDefault();
        resetSession();
        return;
      }

      // Backspaceキー処理（1文字削除 / Ctrl等で単語一括削除）
      if (e.key === "Backspace") {
        e.preventDefault();
        setUserInput((prev) => {
          if (!prev) return "";
          if (e.ctrlKey || e.metaKey || e.altKey) {
            const trimmed = prev.replace(/\s+$/, "");
            const lastSpaceIdx = trimmed.lastIndexOf(" ");
            return lastSpaceIdx === -1 ? "" : trimmed.slice(0, lastSpaceIdx + 1);
          }
          return prev.slice(0, -1);
        });
        return;
      }

      // 修飾キー単体や制御キーは無視
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      // 通常の1文字キー入力
      if (e.key.length === 1) {
        if (e.key === " ") {
          e.preventDefault(); // スクロール防止
        }

        const now = Date.now();
        const effectiveStartTime = startTime === null ? now : startTime;
        if (startTime === null) {
          setStartTime(now);
        }

        const currentLength = userInput.length;
        if (currentLength >= targetText.length) {
          return;
        }

        const expectedChar = targetText[currentLength];

        // 日本語（機能1）と英語（機能2〜4）の正誤判定
        let isCorrectKey = false;
        let isFinished = false;
        let nextInput = userInput + e.key;

        if (isJapanese) {
          const testInput = userInput + e.key;
          const resolved = resolveRomaji(sourceText, testInput);
          isCorrectKey = resolved.valid;
          nextInput = testInput;
          isFinished =
            resolved.valid &&
            resolved.romaji === testInput &&
            resolved.consumedKana >= sourceText.length;
        } else {
          isCorrectKey = e.key === expectedChar;
          // 英語は打鍵した文字でそのまま1文字進み、文字数到達で完了
          isFinished = nextInput.length === targetText.length;
        }

        const nextKeystrokes = keystrokes + 1;
        setKeystrokes(nextKeystrokes);

        let updatedMissedIndices = missedIndices;
        let nextMistakes = mistakes;

        if (!isCorrectKey) {
          // タイプミス発生：
          // 1. ミスカウント増加
          // 2. この文字インデックスをミス履歴（オレンジ・一発精度判定用）に追加
          // 3. 赤フラッシュアニメーション起動
          // ※間違えたキーでもそのまま次の文字に進む
          nextMistakes = mistakes + 1;
          setMistakes(nextMistakes);
          updatedMissedIndices = new Set(missedIndices);
          updatedMissedIndices.add(currentLength);
          setMissedIndices(updatedMissedIndices);

          setHasErrorFlash(true);
          if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
          errorTimeoutRef.current = window.setTimeout(() => {
            setHasErrorFlash(false);
          }, 240);
        }

        // 間違えたキーでもそのまま入力して次へ進める
        setUserInput(nextInput);

        // 完答チェック（最後まで文字数を打ち切ったときに完了）
        if (isFinished) {
          const finalizeCompletion = (totalUniqueMissed: number) => {
            const finishNow = Date.now();
            setEndTime(finishNow);
            setIsCompleted(true);

            if (onSessionComplete) {
              const durSec = Math.max(1, (finishNow - effectiveStartTime) / 1000);
              const calcWpm = Math.round(nextKeystrokes / 5 / (durSec / 60));
              const calcNormalAcc =
                nextKeystrokes > 0
                  ? Math.max(
                      0,
                      Math.round(
                        ((nextKeystrokes - nextMistakes) / nextKeystrokes) * 100
                      )
                    )
                  : 100;
              const calcFirstTryAcc =
                totalTargetChars > 0
                  ? Math.max(
                      0,
                      Math.round(
                        ((totalTargetChars - totalUniqueMissed) /
                          totalTargetChars) *
                          100
                      )
                    )
                  : 100;

              onSessionComplete({
                id: `${Date.now()}`,
                timestamp: "たった今",
                genre,
                tabMode,
                modeLabel: tabMeta.modeTag,
                title: currentText.title,
                firstTryAccuracy: calcFirstTryAcc,
                normalAccuracy: calcNormalAcc,
                wpm: calcWpm,
                keystrokes: nextKeystrokes,
                mistakes: nextMistakes,
              });
            }
          };

          finalizeCompletion(updatedMissedIndices.size);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, [
    isActive,
    isCompleted,
    targetText,
    sourceText,
    isJapanese,
    romajiState,
    userInput,
    startTime,
    keystrokes,
    mistakes,
    missedIndices,
    totalTargetChars,
    genre,
    tabMode,
    tabMeta.modeTag,
    currentText.title,
    onSessionComplete,
    resetSession,
    handleNextText,
  ]);

  // 成績計算（一発精度 & 普通の精度 & WPM）
  const durationSec = Math.max(
    1,
    ((endTime || Date.now()) - (startTime || Date.now())) / 1000
  );
  const durationMin = durationSec / 60;
  const wpm = startTime ? Math.round(keystrokes / 5 / durationMin) : 0;

  // 普通の精度（総打鍵に対する正解打鍵率）
  const normalAccuracy =
    keystrokes > 0
      ? Math.max(0, Math.round(((keystrokes - mistakes) / keystrokes) * 100))
      : 100;

  // 一発精度（全ターゲット文字数のうち、1回もミスしなかった文字の割合）
  const totalUniqueMissedChars = missedIndices.size;
  const firstTryAccuracy =
    totalTargetChars > 0
      ? Math.max(
          0,
          Math.round(
            ((totalTargetChars - totalUniqueMissedChars) / totalTargetChars) *
              100
          )
        )
      : 100;

  // 結果画面用の WPM 推移データ（同じ機能の過去セッション + 今回の完了セッション）
  const completionWpmHistory = useMemo(() => {
    const matched = sessions.filter((s) => s.tabMode === tabMode);
    const sorted = [...matched].reverse();
    const pastSubset = sorted.slice(-7);
    const items = pastSubset.map((s, i) => ({
      label: `#${i + 1}`,
      wpm: s.wpm,
      isCurrent: false,
    }));
    items.push({
      label: "今回",
      wpm: wpm,
      isCurrent: true,
    });
    return items;
  }, [sessions, tabMode, wpm]);

  // WPM 推移グラフ SVG 座標計算
  const chartWidth = 640;
  const chartHeight = 150;
  const padLeft = 44;
  const padRight = 36;
  const padTop = 22;
  const padBottom = 26;
  const plotW = chartWidth - padLeft - padRight;
  const plotH = chartHeight - padTop - padBottom;

  const wpmVals = completionWpmHistory.map((d) => d.wpm);
  const minWpm = Math.max(0, Math.min(goals.wpm - 15, ...wpmVals) - 5);
  const maxWpm = Math.max(goals.wpm + 15, ...wpmVals) + 5;
  const rangeWpm = Math.max(10, maxWpm - minWpm);

  const getChartX = (idx: number) => {
    if (completionWpmHistory.length <= 1) return padLeft + plotW / 2;
    return padLeft + (idx / (completionWpmHistory.length - 1)) * plotW;
  };

  const getChartY = (val: number) => {
    const clamped = Math.max(minWpm, Math.min(maxWpm, val));
    return padTop + plotH - ((clamped - minWpm) / rangeWpm) * plotH;
  };

  const goalY = getChartY(goals.wpm);
  const chartPoints = completionWpmHistory.map((d, i) => ({
    x: getChartX(i),
    y: getChartY(d.wpm),
    wpm: d.wpm,
    label: d.label,
    isCurrent: d.isCurrent,
  }));

  const chartPathD = chartPoints
    .map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
    .join(" ");

  const chartAreaD =
    chartPoints.length > 0
      ? `${chartPathD} L ${chartPoints[chartPoints.length - 1].x.toFixed(1)} ${(
          padTop + plotH
        ).toFixed(1)} L ${chartPoints[0].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`
      : "";

  return (
    <div className={`longtext-container tab-mode-${tabMode}`}>
      {/* メインタイピングステージ（目線の位置に合わせて上部に配置） */}
      <div
        className={`typing-stage-card single-line-stage ${
          hasErrorFlash ? "mistake-flash" : ""
        }`}
      >
        {isCompleted ? (
          /* ==========================================================
             完了画面（左上に「結果」、上部にWPM推移グラフ、下部にメトリクス）
             ========================================================== */
          <div className="completion-container">
            {/* 左上に「結果」とだけ記述 */}
            <div className="completion-top-header">
              <h2 className="completion-title">結果</h2>
            </div>

            {/* 上部：WPM の推移グラフ */}
            <div className="completion-chart-wrapper">
              <div className="completion-chart-header">
                <span className="completion-chart-sub">
                  WPM 打鍵速度の推移（{tabMeta.modeTag}）
                </span>
                <span className="completion-chart-legend">
                  <span className="legend-dot current-dot" /> 今回: {wpm} WPM
                  <span className="legend-line goal-line" /> 目標: {goals.wpm} WPM
                </span>
              </div>

              <div className="completion-svg-box">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="completion-trend-svg"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    <linearGradient
                      id="compWpmGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="var(--char-caret)"
                        stopOpacity="0.22"
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--char-caret)"
                        stopOpacity="0.0"
                      />
                    </linearGradient>
                  </defs>

                  {/* Y軸 目標ライン（破線） */}
                  <line
                    x1={padLeft}
                    y1={goalY}
                    x2={chartWidth - padRight}
                    y2={goalY}
                    stroke="#ea580c"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    opacity="0.8"
                  />
                  <text
                    x={chartWidth - padRight + 4}
                    y={goalY + 3}
                    className="svg-goal-label"
                    fill="#ea580c"
                  >
                    目標 {goals.wpm}
                  </text>

                  {/* エリア塗りつぶし */}
                  {chartAreaD && (
                    <path d={chartAreaD} fill="url(#compWpmGrad)" />
                  )}

                  {/* 実績折れ線 */}
                  <path
                    d={chartPathD}
                    fill="none"
                    stroke="var(--char-caret)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* データポイント */}
                  {chartPoints.map((pt, i) => (
                    <g key={`pt-${i}`}>
                      {pt.isCurrent && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="8"
                          fill="var(--char-caret)"
                          opacity="0.25"
                        />
                      )}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={pt.isCurrent ? 5.5 : 3.8}
                        fill={
                          pt.isCurrent
                            ? "var(--char-caret)"
                            : "var(--bg-card)"
                        }
                        stroke="var(--char-caret)"
                        strokeWidth="2"
                      />
                      {/* ポイント上部のWPM数値 */}
                      <text
                        x={pt.x}
                        y={pt.y - 8}
                        textAnchor="middle"
                        className={`svg-wpm-label ${
                          pt.isCurrent ? "is-current-wpm" : ""
                        }`}
                      >
                        {pt.wpm}
                      </text>
                      {/* X軸ラベル */}
                      <text
                        x={pt.x}
                        y={chartHeight - 6}
                        textAnchor="middle"
                        className={`svg-session-label ${
                          pt.isCurrent ? "is-current-session" : ""
                        }`}
                      >
                        {pt.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            <div className="completion-metrics-grid">
              <div className="completion-metric-card">
                <span className="comp-metric-label">一発精度 (First-Try)</span>
                <span className="comp-metric-val highlight-acc">
                  {firstTryAccuracy}%
                </span>
                <span
                  className={`comp-goal-badge ${
                    firstTryAccuracy >= goals.firstTryAccuracy
                      ? "goal-pass"
                      : "goal-miss"
                  }`}
                >
                  目標 {goals.firstTryAccuracy}%{" "}
                  {firstTryAccuracy >= goals.firstTryAccuracy ? "達成 ✓" : "未達"}
                </span>
              </div>

              <div className="completion-metric-card">
                <span className="comp-metric-label">普通の精度 (Accuracy)</span>
                <span className="comp-metric-val">{normalAccuracy}%</span>
                <span
                  className={`comp-goal-badge ${
                    normalAccuracy >= goals.normalAccuracy
                      ? "goal-pass"
                      : "goal-miss"
                  }`}
                >
                  目標 {goals.normalAccuracy}%{" "}
                  {normalAccuracy >= goals.normalAccuracy ? "達成 ✓" : "未達"}
                </span>
              </div>

              <div className="completion-metric-card">
                <span className="comp-metric-label">速度 (WPM)</span>
                <span className="comp-metric-val">{wpm}</span>
                <span
                  className={`comp-goal-badge ${
                    wpm >= goals.wpm ? "goal-pass" : "goal-miss"
                  }`}
                >
                  目標 {goals.wpm} WPM {wpm >= goals.wpm ? "達成 ✓" : "未達"}
                </span>
              </div>

              <div className="completion-metric-card">
                <span className="comp-metric-label">打鍵 / ミス内訳</span>
                <span className="comp-metric-val">
                  {keystrokes} <small>/ {mistakes}</small>
                </span>
                <span className="comp-goal-badge neutral">
                  一発ミス箇所: {totalUniqueMissedChars}文字
                </span>
              </div>
            </div>

            <div className="completion-actions">
              <button
                type="button"
                className="btn-secondary-action"
                onClick={resetSession}
              >
                もう一度挑戦 (Esc)
              </button>
              <button
                type="button"
                className="btn-primary-action"
                onClick={handleNextText}
              >
                次のセットへ (Enter) →
              </button>
            </div>
          </div>
        ) : (
          /* ==========================================================
             1行だけ・右からどんどん生えてくるストリームタイピングUI
             ========================================================== */
          <div className="single-stream-window">
            {/* 上部：現在対応する日本語訳・意味表示 */}
            <div className="stream-translation-banner">
              <span className="translation-badge">
                {tabMode === "func2" || tabMode === "func3" ? "意味" : "日本語"}
              </span>
              <span className="translation-text">
                {currentDisplayTranslation || "..."}
                {isJapanese && currentDisplayKana && (
                  <span className="translation-kana">{currentDisplayKana}</span>
                )}
              </span>
            </div>

            {/* 中央：1行のみの横スクロールタイピングレーン */}
            <div className="stream-conveyor-viewport" ref={containerRef}>
              {/* 固定ターゲットガイド（打鍵ポイントの目印） */}
              <div className="fixed-target-guide" />

              {/* スクロールする1行の文字列トラック */}
              <div
                className="stream-text-track"
                style={{
                  transform: `translateX(${scrollTranslateX}px)`,
                }}
              >
                {targetText.split("").map((char, index) => {
                  const isCurrent = index === userInput.length;
                  const wasOnceMissed = missedIndices.has(index);

                  // 未入力状態（Backspaceで戻して消した状態を含む）は黒（char-untyped）
                  let charState = "char-untyped";
                  let isOrange = false;

                  if (index < userInput.length) {
                    const isCharMatch = userInput[index] === char;
                    if (isCharMatch) {
                      // 正しく入力された文字：過去にミスした履歴があればオレンジ、一発なら緑
                      charState = "char-correct";
                      isOrange = wasOnceMissed;
                    } else {
                      // 間違えた文字：たとえ過去にミスした文字（オレンジ）であっても、現在ミス中なので赤！
                      charState = "char-incorrect";
                      isOrange = false;
                    }
                  }

                  return (
                    <span
                      key={index}
                      ref={isCurrent ? activeCharRef : null}
                      className={`typing-char ${charState} ${
                        isOrange ? "char-once-missed" : ""
                      } ${char === " " ? "char-space" : ""} ${
                        isCurrent ? "char-active-target" : ""
                      }`}
                    >
                      {isCurrent && <span className="target-char-caret" />}
                      {char}
                    </span>
                  );
                })}
                {/* 末尾まで打鍵したときのカーソル */}
                {userInput.length === targetText.length && (
                  <span
                    ref={activeCharRef}
                    className="typing-char char-trailing-end"
                  >
                    <span className="target-char-caret" />
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 最下部にはやり直し操作だけを表示 */}
      <div className="longtext-top-bar longtext-bottom-bar">
        <div className="longtext-top-actions">
          <button
            type="button"
            className="btn-secondary-action"
            onClick={resetSession}
            title="最初からやり直す (Esc)"
          >
            ↻ 最初から
          </button>
        </div>
      </div>
    </div>
  );
}
