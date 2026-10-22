import { useState, useEffect, useCallback, useRef } from "react";
import { PRACTICAL_TEXTS, PracticalSentence } from "../data/practicalTexts";
import "./LongTextTyping.css";

interface LongTextTypingProps {
  isActive: boolean;
}

// 単語単位に分割して途中の改行を防ぐヘルパー
function getWordTokens(text: string): { word: string; startIndex: number }[] {
  const tokens: { word: string; startIndex: number }[] = [];
  const regex = /(\S+\s*|\s+)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    tokens.push({
      word: match[0],
      startIndex: match.index,
    });
  }
  return tokens;
}

export function LongTextTyping({ isActive }: LongTextTypingProps) {
  const [selectedTextIdx, setSelectedTextIdx] = useState<number>(0);
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>("");
  const [exitingLine, setExitingLine] = useState<PracticalSentence | null>(null);
  const [isAdvancing, setIsAdvancing] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // 打鍵メトリクス・状態管理
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [keystrokes, setKeystrokes] = useState<number>(0);
  const [mistakes, setMistakes] = useState<number>(0);
  const [hasErrorFlash, setHasErrorFlash] = useState<boolean>(false);

  const errorTimeoutRef = useRef<number | null>(null);
  const advanceTimeoutRef = useRef<number | null>(null);

  const currentText = PRACTICAL_TEXTS[selectedTextIdx] || PRACTICAL_TEXTS[0];
  const sentences = currentText.sentences;
  const activeLine = sentences[currentLineIndex];
  const upcomingLine = sentences[currentLineIndex + 1];

  // リセット処理
  const resetSession = useCallback(() => {
    setCurrentLineIndex(0);
    setUserInput("");
    setExitingLine(null);
    setIsAdvancing(false);
    setIsCompleted(false);
    setStartTime(null);
    setEndTime(null);
    setKeystrokes(0);
    setMistakes(0);
    setHasErrorFlash(false);
  }, []);

  // 実践文切り替えハンドラ
  const handleSelectText = (idx: number) => {
    setSelectedTextIdx(idx);
    resetSession();
  };

  // 次の実践文へ
  const handleNextText = () => {
    const nextIdx = (selectedTextIdx + 1) % PRACTICAL_TEXTS.length;
    setSelectedTextIdx(nextIdx);
    resetSession();
  };

  // キー入力イベントハンドラ
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

      // 完了画面でのショートカット
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

      // Escキーで最初からやり直し
      if (e.key === "Escape") {
        e.preventDefault();
        resetSession();
        return;
      }

      // Backspaceキー処理（単語一括削除・1文字削除）
      if (e.key === "Backspace") {
        e.preventDefault();
        setUserInput((prev) => {
          if (!prev) return "";
          if (e.ctrlKey || e.metaKey || e.altKey) {
            // Ctrl/Alt/Meta + Backspace: 末尾の空白と直前の単語を一括削除
            const trimmed = prev.replace(/\s+$/, "");
            const lastSpaceIdx = trimmed.lastIndexOf(" ");
            return lastSpaceIdx === -1 ? "" : trimmed.slice(0, lastSpaceIdx + 1);
          }
          return prev.slice(0, -1);
        });
        return;
      }

      // 修飾キー付きや制御文字は無視
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      // 通常の1文字キー入力
      if (e.key.length === 1) {
        if (e.key === " ") {
          e.preventDefault(); // スペース押下時の画面スクロールを防止
        }

        // 打鍵開始時刻を記録
        setStartTime((prev) => (prev === null ? Date.now() : prev));

        if (!activeLine) return;
        const targetText = activeLine.text;
        const currentLength = userInput.length;

        // 文字数超過の入力は受け付けない（Backspaceで修正を促す）
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

        // =================================================================
        // 「一行完ぺきに打てたら消えて下に表示されていた文が上に上がって次の文が下にまた表示される」
        // =================================================================
        if (nextInput === targetText) {
          // 該当行が完全に一致して完答
          const isLastLine = currentLineIndex + 1 >= sentences.length;

          if (isLastLine) {
            // 全文クリア
            setEndTime(Date.now());
            setIsCompleted(true);
          } else {
            // 完了した行を上に消えるアニメーション対象にセット
            setExitingLine(activeLine);
            setIsAdvancing(true);

            // 即座に次の行へ移行し、次の打鍵を即座に受け付け可能にする
            setCurrentLineIndex((prev) => prev + 1);
            setUserInput("");

            if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
            advanceTimeoutRef.current = window.setTimeout(() => {
              setExitingLine(null);
              setIsAdvancing(false);
            }, 240);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    };
  }, [
    isActive,
    isCompleted,
    activeLine,
    currentLineIndex,
    userInput,
    sentences,
    resetSession,
    handleNextText,
  ]);

  // 成績メトリクス計算
  const durationSec = Math.max(1, ((endTime || Date.now()) - (startTime || Date.now())) / 1000);
  const durationMin = durationSec / 60;
  const wpm = startTime ? Math.round((keystrokes / 5) / durationMin) : 0;
  const accuracy = keystrokes > 0 ? Math.max(0, Math.round(((keystrokes - mistakes) / keystrokes) * 100)) : 100;

  // 進捗率（行単位）
  const progressPercent = Math.round(((currentLineIndex) / sentences.length) * 100);

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
                {i + 1}. {t.title} ({t.sentences.length}行)
              </option>
            ))}
          </select>
        </div>

        <div className="longtext-meta-center">
          <span className="progress-pill">
            行 {Math.min(currentLineIndex + 1, sentences.length)} / {sentences.length}
          </span>
          <div className="mini-progress-track">
            <div
              className="mini-progress-fill"
              style={{ width: `${isCompleted ? 100 : progressPercent}%` }}
            />
          </div>
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
      <div className={`typing-stage-card ${hasErrorFlash ? "mistake-flash" : ""}`}>
        {isCompleted ? (
          /* ==========================================================
             実践文完了画面
             ========================================================== */
          <div className="completion-container">
            <div className="completion-icon">🎉</div>
            <div className="completion-header">
              <h2>実践文クリア！</h2>
              <p>{currentText.title} のすべての文を正確に入力完了しました。</p>
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
             2行表示タイピングステージ（上が現在行、下が次行プレビュー）
             一行打てたら上が消え、下が上に上がり、次が下に出現
             ========================================================== */
          <div className="lines-display-window">
            {/* 1. 消えていく行（打鍵完了直後の一瞬のみ表示） */}
            {exitingLine && (
              <div className="text-line-slot active-slot slot-exiting-up">
                <div className="line-meta-header">
                  <span className="line-badge active-badge">完了</span>
                  <span className="line-japanese-trans">{exitingLine.translation}</span>
                </div>
                <div className="line-english-row">
                  <span className="char-correct">{exitingLine.text}</span>
                </div>
              </div>
            )}

            {/* 2. 上段（現在入力中の行：Active） */}
            {activeLine && (
              <div
                className={`text-line-slot active-slot ${isAdvancing ? "slot-promoted-up" : ""}`}
              >
                <div className="line-meta-header">
                  <span className="line-badge active-badge">入力行</span>
                  <span className="line-japanese-trans">{activeLine.translation}</span>
                </div>

                <div className="line-english-row" aria-label={activeLine.text}>
                  {getWordTokens(activeLine.text).map((token) => (
                    <span key={token.startIndex} className="typing-word">
                      {token.word.split("").map((char, charOffset) => {
                        const index = token.startIndex + charOffset;
                        let charState = "char-untyped";
                        if (index < userInput.length) {
                          charState =
                            userInput[index] === char ? "char-correct" : "char-incorrect";
                        }
                        const isCaretHere = index === userInput.length;

                        return (
                          <span
                            key={index}
                            className={`typing-char ${charState} ${char === " " ? "char-space" : ""}`}
                          >
                            {isCaretHere && <span className="char-caret" />}
                            {char}
                          </span>
                        );
                      })}
                    </span>
                  ))}
                  {/* 行末にカーソルがある場合 */}
                  {userInput.length === activeLine.text.length && (
                    <span className="char-caret caret-trailing" />
                  )}
                </div>
              </div>
            )}

            {/* 3. 下段（次に控える行：Preview） */}
            <div
              className={`text-line-slot preview-slot ${isAdvancing ? "slot-appearing-down" : ""}`}
            >
              {upcomingLine ? (
                <>
                  <div className="line-meta-header">
                    <span className="line-badge preview-badge">次の行</span>
                    <span className="line-japanese-trans">{upcomingLine.translation}</span>
                  </div>
                  <div className="line-english-row">
                    {upcomingLine.text}
                  </div>
                </>
              ) : (
                <div className="preview-end-marker">
                  — この行で実践文は終了です —
                </div>
              )}
            </div>
          </div>
        )}

        {/* 下部操作案内ヒント */}
        <div className="stage-footer-hints">
          <div className="hint-keys">
            <span>キーボードでそのまま打鍵</span>
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
