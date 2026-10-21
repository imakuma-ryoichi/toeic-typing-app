import { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";

interface WordItem {
  id: number;
  word: string;
  meaning: string;
  partOfSpeech: string;
  example: string;
}

const SAMPLE_WORDS: WordItem[] = [
  {
    id: 1,
    word: "schedule",
    meaning: "日程、予定",
    partOfSpeech: "n./v.",
    example: "The project is running on schedule.",
  },
  {
    id: 2,
    word: "negotiate",
    meaning: "交渉する、取り決める",
    partOfSpeech: "v.",
    example: "We need to negotiate a new contract with the supplier.",
  },
  {
    id: 3,
    word: "presentation",
    meaning: "発表、プレゼンテーション",
    partOfSpeech: "n.",
    example: "Her presentation impressed the executive board.",
  },
  {
    id: 4,
    word: "budget",
    meaning: "予算、経費",
    partOfSpeech: "n.",
    example: "The department stayed well within its annual budget.",
  },
  {
    id: 5,
    word: "strategy",
    meaning: "戦略、方策",
    partOfSpeech: "n.",
    example: "A clear strategy is essential for market growth.",
  },
];

type Theme = "light" | "slate";

function App() {
  const [theme, setTheme] = useState<Theme>("light");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [typedChars, setTypedChars] = useState<string[]>([]);
  const [isFlashing, setIsFlashing] = useState(false);
  const [correctKeyCount, setCorrectKeyCount] = useState(0);
  const [totalKeyCount, setTotalKeyCount] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const flashTimeoutRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentItem = SAMPLE_WORDS[currentWordIndex % SAMPLE_WORDS.length];
  const targetWord = currentItem.word;

  // テーマ属性を document.documentElement / コンテナに適用
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const triggerMissFlash = useCallback(() => {
    setIsFlashing(true);
    if (flashTimeoutRef.current) {
      window.clearTimeout(flashTimeoutRef.current);
    }
    flashTimeoutRef.current = window.setTimeout(() => {
      setIsFlashing(false);
    }, 150);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // ショートカットキー除外
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (!startTime) {
        setStartTime(Date.now());
      }

      if (e.key === "Backspace") {
        e.preventDefault();
        setTypedChars((prev) => prev.slice(0, -1));
        return;
      }

      if (e.key === "Tab" || e.key === "Escape") {
        e.preventDefault();
        // リセット / 単語スキップ
        setTypedChars([]);
        setCurrentWordIndex((prev) => (prev + 1) % SAMPLE_WORDS.length);
        return;
      }

      // 1文字の英数字・記号のみ受付
      if (e.key.length === 1) {
        e.preventDefault();
        const nextIndex = typedChars.length;
        if (nextIndex >= targetWord.length) {
          return;
        }

        const expectedChar = targetWord[nextIndex];
        const isMatch = e.key === expectedChar;

        setTotalKeyCount((prev) => prev + 1);
        if (isMatch) {
          setCorrectKeyCount((prev) => prev + 1);
        } else {
          triggerMissFlash();
        }

        const nextTyped = [...typedChars, e.key];
        setTypedChars(nextTyped);

        // 単語完了判定
        if (nextTyped.length === targetWord.length) {
          const isAllCorrect = nextTyped.every(
            (char, idx) => char === targetWord[idx]
          );
          if (isAllCorrect) {
            setTimeout(() => {
              setTypedChars([]);
              setCurrentWordIndex((prev) => (prev + 1) % SAMPLE_WORDS.length);
            }, 120);
          }
        }
      }
    },
    [startTime, typedChars, targetWord, triggerMissFlash]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const accuracy =
    totalKeyCount > 0
      ? Math.round((correctKeyCount / totalKeyCount) * 100)
      : 100;

  const wpm =
    startTime && correctKeyCount > 0
      ? Math.round(
          correctKeyCount / 5 / Math.max((Date.now() - startTime) / 60000, 0.01)
        )
      : 0;

  return (
    <div
      ref={containerRef}
      className={`app-container ${isFlashing ? "flash-miss" : ""}`}
      data-theme={theme}
    >
      <header className="app-header">
        <div className="brand-title">
          <span>TOEIC Typing</span>
          <span className="brand-badge">Core Vocab</span>
        </div>

        <div className="header-controls">
          <div className="theme-switch-group">
            <button
              type="button"
              className={`theme-btn ${theme === "light" ? "active" : ""}`}
              onClick={() => setTheme("light")}
            >
              Light
            </button>
            <button
              type="button"
              className={`theme-btn ${theme === "slate" ? "active" : ""}`}
              onClick={() => setTheme("slate")}
            >
              Slate
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-label">Accuracy</span>
            <span className="stat-value">{accuracy}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">WPM</span>
            <span className="stat-value">{wpm}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Word</span>
            <span className="stat-value">
              {currentWordIndex + 1}/{SAMPLE_WORDS.length}
            </span>
          </div>
        </div>

        <div className={`typing-box ${isFlashing ? "box-flashing" : ""}`}>
          <div className="word-meta">
            <span className="word-category">{currentItem.partOfSpeech}</span>
            <span className="word-meaning">{currentItem.meaning}</span>
          </div>

          <div className="typing-line">
            {targetWord.split("").map((expectedChar, idx) => {
              const isTyped = idx < typedChars.length;
              const inputChar = typedChars[idx];
              const isCaret = idx === typedChars.length;

              let statusClass = "char-untyped";
              if (isTyped) {
                statusClass =
                  inputChar === expectedChar
                    ? "char-correct"
                    : "char-incorrect";
              }

              return (
                <span
                  key={idx}
                  className={`typing-char ${statusClass}`}
                >
                  {expectedChar}
                  {isCaret && <span className="caret-indicator" />}
                </span>
              );
            })}
            {typedChars.length >= targetWord.length && (
              <span className="trailing-caret" />
            )}
          </div>

          <p className="example-sentence">{currentItem.example}</p>
        </div>
      </main>

      <footer className="app-footer">
        <div className="key-hint">
          <kbd>Backspace</kbd> 訂正
        </div>
        <div className="key-hint">
          <kbd>Tab</kbd> スキップ
        </div>
        <div className="key-hint">
          そのままキーボードで入力
        </div>
      </footer>
    </div>
  );
}

export default App;
