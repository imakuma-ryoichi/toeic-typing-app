import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { PRACTICAL_TEXTS } from "../data/practicalTexts";
import "./LongTextTyping.css";

interface LongTextTypingProps {
  isActive: boolean;
}

export type BreakMode = "continuous" | "sentence";

export function LongTextTyping({ isActive }: LongTextTypingProps) {
  const [selectedTextIdx, setSelectedTextIdx] = useState<number>(0);
  const [breakMode, setBreakMode] = useState<BreakMode>("continuous"); // 基本「改行なし（連続）」
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>("");
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // 打鍵メトリクス
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [keystrokes, setKeystrokes] = useState<number>(0);
  const [mistakes, setMistakes] = useState<number>(0);
  const [hasErrorFlash, setHasErrorFlash] = useState<boolean>(false);

  // DOM参照（スクロール計算用）
  const containerRef = useRef<HTMLDivElement>(null);
  const activeCharRef = useRef<HTMLSpanElement>(null);
  const [scrollTranslateX, setScrollTranslateX] = useState<number>(0);
  const errorTimeoutRef = useRef<number | null>(null);

  const currentText = PRACTICAL_TEXTS[selectedTextIdx] || PRACTICAL_TEXTS[0];
  const sentences = currentText.sentences;

  // 連続モード用：文セグメント情報（各文の開始・終了位置をマッピング）
  const sentenceSegments = useMemo(() => {
    let offset = 0;
    return sentences.map((s, idx) => {
      const start = offset;
      const end = start + s.text.length;
      offset = end + 1; // 文同士の区切りスペース分
      return {
        ...s,
        start,
        end,
        index: idx,
      };
    });
  }, [sentences]);

  // 現在のタイピング対象となるテキスト全体の決定
  const fullContinuousText = useMemo(() => {
    return sentences.map((s) => s.text).join(" ");
  }, [sentences]);

  const targetText =
    breakMode === "continuous"
      ? fullContinuousText
      : sentences[currentSentenceIdx]?.text || "";

  // 現在対応する日本語訳と文番号の決定
  const { currentDisplayTranslation, activeSentenceNumber, totalSentenceCount } = useMemo(() => {
    const total = sentences.length;
    if (breakMode === "continuous") {
      const pos = userInput.length;
      const seg =
        sentenceSegments.find((s) => pos >= s.start && pos <= s.end) ||
        sentenceSegments[sentenceSegments.length - 1];
      return {
        currentDisplayTranslation: seg ? seg.translation : "",
        activeSentenceNumber: seg ? seg.index + 1 : 1,
        totalSentenceCount: total,
      };
    } else {
      const sentence = sentences[currentSentenceIdx];
      return {
        currentDisplayTranslation: sentence ? sentence.translation : "",
        activeSentenceNumber: currentSentenceIdx + 1,
        totalSentenceCount: total,
      };
    }
  }, [breakMode, sentences, sentenceSegments, userInput.length, currentSentenceIdx]);

  // リセット処理
  const resetSession = useCallback(() => {
    setCurrentSentenceIdx(0);
    setUserInput("");
    setIsCompleted(false);
    setStartTime(null);
    setEndTime(null);
    setKeystrokes(0);
    setMistakes(0);
    setHasErrorFlash(false);
    setScrollTranslateX(0);
  }, []);

  // 実践文切り替えハンドラ
  const handleSelectText = (idx: number) => {
    setSelectedTextIdx(idx);
    resetSession();
  };

  // 改行オプション切り替え
  const handleToggleBreakMode = (mode: BreakMode) => {
    if (mode === breakMode) return;
    setBreakMode(mode);
    resetSession();
  };

  // 次の実践文へ
  const handleNextText = () => {
    const nextIdx = (selectedTextIdx + 1) % PRACTICAL_TEXTS.length;
    setSelectedTextIdx(nextIdx);
    resetSession();
  };

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
  }, [userInput, targetText, breakMode]);

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

        // 打鍵開始時刻
        setStartTime((prev) => (prev === null ? Date.now() : prev));

        const currentLength = userInput.length;
        if (currentLength >= targetText.length) {
          return;
        }

        const expectedChar = targetText[currentLength];
        const isCorrectKey = e.key === expectedChar;

        setKeystrokes((prev) => prev + 1);

        if (!isCorrectKey) {
          setMistakes((prev) => prev + 1);
          setHasErrorFlash(true);
          if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
          errorTimeoutRef.current = window.setTimeout(() => {
            setHasErrorFlash(false);
          }, 240);
        }

        const nextInput = userInput + e.key;
        setUserInput(nextInput);

        // 完答チェック
        if (nextInput === targetText) {
          if (breakMode === "continuous") {
            // 連続モード：全文章完走
            setEndTime(Date.now());
            setIsCompleted(true);
          } else {
            // 改行あり（文ごと）モード
            const isLastSentence = currentSentenceIdx + 1 >= sentences.length;
            if (isLastSentence) {
              setEndTime(Date.now());
              setIsCompleted(true);
            } else {
              // 次の文へスライド
              setCurrentSentenceIdx((prev) => prev + 1);
              setUserInput("");
            }
          }
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
    userInput,
    breakMode,
    currentSentenceIdx,
    sentences.length,
    resetSession,
    handleNextText,
  ]);

  // 成績計算
  const durationSec = Math.max(1, ((endTime || Date.now()) - (startTime || Date.now())) / 1000);
  const durationMin = durationSec / 60;
  const wpm = startTime ? Math.round(keystrokes / 5 / durationMin) : 0;
  const accuracy =
    keystrokes > 0 ? Math.max(0, Math.round(((keystrokes - mistakes) / keystrokes) * 100)) : 100;

  // 進捗率
  const progressPercent =
    targetText.length > 0 ? Math.round((userInput.length / targetText.length) * 100) : 0;

  return (
    <div className="longtext-container">
      {/* 上部操作バー */}
      <div className="longtext-top-bar">
        <div className="text-selector-group">
          <label htmlFor="text-select" className="text-select-label">
            実践文:
          </label>
          <select
            id="text-select"
            className="text-select-dropdown"
            value={selectedTextIdx}
            onChange={(e) => handleSelectText(Number(e.target.value))}
          >
            {PRACTICAL_TEXTS.map((t, i) => (
              <option key={t.id} value={i}>
                {i + 1}. {t.title} ({t.sentences.length}文)
              </option>
            ))}
          </select>
        </div>

        {/* 改行オプション（基本：改行なし） */}
        <div className="break-mode-group">
          <span className="mode-label">改行設定:</span>
          <div className="mode-toggle-pill">
            <button
              type="button"
              className={`mode-btn ${breakMode === "continuous" ? "is-active" : ""}`}
              onClick={() => handleToggleBreakMode("continuous")}
              title="長文全体を1本の帯にして途切れず右から流します（基本）"
            >
              なし（連続）
            </button>
            <button
              type="button"
              className={`mode-btn ${breakMode === "sentence" ? "is-active" : ""}`}
              onClick={() => handleToggleBreakMode("sentence")}
              title="1文ごとに区切って入力します"
            >
              あり（文ごと）
            </button>
          </div>
        </div>

        <div className="longtext-meta-center">
          <span className="progress-pill">
            文 {activeSentenceNumber} / {totalSentenceCount}
          </span>
          <div className="mini-progress-track" title={`進捗: ${progressPercent}%`}>
            <div
              className="mini-progress-fill"
              style={{ width: `${isCompleted ? 100 : progressPercent}%` }}
            />
          </div>
          <span className="progress-pct-label">
            {isCompleted ? 100 : progressPercent}%
          </span>
        </div>

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

      {/* メインタイピングステージ */}
      <div className={`typing-stage-card single-line-stage ${hasErrorFlash ? "mistake-flash" : ""}`}>
        {isCompleted ? (
          /* ==========================================================
             実践文完了画面
             ========================================================== */
          <div className="completion-container">
            <div className="completion-icon">🎉</div>
            <div className="completion-header">
              <h2>実践文クリア！</h2>
              <p>{currentText.title} のすべての英文を入力完了しました。</p>
            </div>

            <div className="completion-metrics-grid">
              <div className="completion-metric-card">
                <span className="comp-metric-label">精度 (Accuracy)</span>
                <span className="comp-metric-val highlight-acc">{accuracy}%</span>
              </div>
              <div className="completion-metric-card">
                <span className="comp-metric-label">速度 (WPM)</span>
                <span className="comp-metric-val">{wpm}</span>
              </div>
              <div className="completion-metric-card">
                <span className="comp-metric-label">総打鍵数</span>
                <span className="comp-metric-val">{keystrokes}</span>
              </div>
              <div className="completion-metric-card">
                <span className="comp-metric-label">ミス数</span>
                <span className="comp-metric-val">{mistakes}</span>
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
                次の実践文へ (Enter) →
              </button>
            </div>
          </div>
        ) : (
          /* ==========================================================
             1行だけ・右からどんどん生えてくるストリームタイピングUI
             ========================================================== */
          <div className="single-stream-window">
            {/* 上部：現在対応する日本語訳表示（プレビューは廃止） */}
            <div className="stream-translation-banner">
              <span className="translation-badge">日本語訳</span>
              <span className="translation-text">
                {currentDisplayTranslation || "..."}
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
                  let charState = "char-untyped";
                  if (index < userInput.length) {
                    charState =
                      userInput[index] === char ? "char-correct" : "char-incorrect";
                  }

                  return (
                    <span
                      key={index}
                      ref={isCurrent ? activeCharRef : null}
                      className={`typing-char ${charState} ${char === " " ? "char-space" : ""} ${
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

            {/* リアルタイム打鍵メトリクスバー */}
            <div className="stream-live-metrics">
              <div className="metric-chip">
                <span className="chip-label">速度</span>
                <span className="chip-value">{wpm} WPM</span>
              </div>
              <div className="metric-chip">
                <span className="chip-label">精度</span>
                <span className="chip-value">{accuracy}%</span>
              </div>
              <div className="metric-chip">
                <span className="chip-label">打鍵</span>
                <span className="chip-value">
                  {userInput.length} / {targetText.length}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 下部操作案内ヒント */}
        <div className="stage-footer-hints">
          <div className="hint-keys">
            <span>そのままキー入力</span>
            <span>•</span>
            <span className="kbd-badge">Backspace</span> 1文字戻る
            <span>•</span>
            <span className="kbd-badge">Ctrl + Backspace</span> 単語戻る
          </div>
          <div className="hint-keys">
            <span className="kbd-badge">Esc</span> 最初から
          </div>
        </div>
      </div>
    </div>
  );
}
