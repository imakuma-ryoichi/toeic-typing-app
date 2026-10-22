import { useState, useEffect } from "react";
import "./App.css";

type FunctionTabId = "func1" | "func2" | "func3" | "func4" | "func5";

interface TabItemInfo {
  id: FunctionTabId;
  label: string;
  subLabel: string;
  category: string;
  displayMain: string;
  meaning: string;
  example: string;
}

const TABS_CONFIG: TabItemInfo[] = [
  {
    id: "func1",
    label: "機能1",
    subLabel: "日本語",
    category: "日本語 / Core Vocab",
    displayMain: "ここが表示画面",
    meaning: "ここに単語の意味や品詞が表示されます",
    example: "The project is running on schedule.（ここに例文が表示されます）",
  },
  {
    id: "func2",
    label: "機能2",
    subLabel: "単語",
    category: "単語 / Business Phrases",
    displayMain: "ここが表示画面",
    meaning: "ここにイディオム・定型表現の意味が表示されます",
    example: "We look forward to working with you.（ここに例文が表示されます）",
  },
  {
    id: "func3",
    label: "機能3",
    subLabel: "熟語",
    category: "熟語 / Business Phrases",
    displayMain: "ここが表示画面",
    meaning: "ここに短文の日本語訳が表示されます",
    example: "Please find the attached invoice for your confirmation.",
  },
  {
    id: "func4",
    label: "機能4",
    subLabel: "実践文",
    category: "実践文 / Long Texts",
    displayMain: "ここが表示画面",
    meaning: "ここに実践文・Eメール全体の翻訳が表示されます",
    example: "Thank you for contacting customer support. We will respond within 24 hours.",
  },
  {
    id: "func5",
    label: "機能5",
    subLabel: "記録",
    category: "記録 / 統計 & グラフ",
    displayMain: "",
    meaning: "",
    example: "",
  },
];

type Theme = "light" | "slate";

function App() {
  const [theme, setTheme] = useState<Theme>("light");
  const [activeTab, setActiveTab] = useState<FunctionTabId>("func1");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const currentTab = TABS_CONFIG.find((tab) => tab.id === activeTab) || TABS_CONFIG[0];

  return (
    <div className="app-container" data-theme={theme}>
      {/* 上部リボン（ヘッダー） */}
      <header className="ribbon-header">
        <div className="ribbon-left">
          <div className="brand-logo">Typing</div>
        </div>

        {/* 上部バーの機能タブナビゲーション */}
        <nav className="ribbon-nav" aria-label="機能ナビゲーション">
          {TABS_CONFIG.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`ribbon-tab-btn ${isActive ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="ribbon-tab-title">{tab.label}</span>
                <span className="ribbon-tab-sub">{tab.subLabel}</span>
              </button>
            );
          })}
        </nav>

        {/* テーマ切り替え */}
        <div className="ribbon-right">
          <div className="theme-toggle-group">
            <button
              type="button"
              className={`theme-pill ${theme === "light" ? "active" : ""}`}
              onClick={() => setTheme("light")}
            >
              Light
            </button>
            <button
              type="button"
              className={`theme-pill ${theme === "slate" ? "active" : ""}`}
              onClick={() => setTheme("slate")}
            >
              Slate
            </button>
          </div>
        </div>
      </header>

      {/* メイン画面 */}
      <main className="main-content">
        {activeTab === "func5" ? (
          /* ==========================================================
             機能5：記録（統計 & グラフ）画面
             ========================================================== */
          <div className="analytics-view">
            <div className="analytics-header">
              <h2>機能5：学習記録 & パフォーマンス分析</h2>
              <p>統計データと打鍵推移グラフを一元管理するダッシュボードです。</p>
            </div>

            {/* サマリーカード */}
            <div className="analytics-cards-grid">
              <div className="analytics-card">
                <span className="card-label">平均精度 (Accuracy)</span>
                <span className="card-value highlight-accent">98%</span>
                <span className="card-caption">目標: 95%以上</span>
              </div>
              <div className="analytics-card">
                <span className="card-label">平均速度 (WPM)</span>
                <span className="card-value">62</span>
                <span className="card-caption">Words Per Minute</span>
              </div>
              <div className="analytics-card">
                <span className="card-label">総打鍵数 (Keystrokes)</span>
                <span className="card-value">1,840</span>
                <span className="card-caption">累計キー入力</span>
              </div>
              <div className="analytics-card">
                <span className="card-label">完了アイテム数</span>
                <span className="card-value">42</span>
                <span className="card-caption">単語・文章クリア数</span>
              </div>
            </div>

            {/* 打鍵推移グラフ */}
            <div className="analytics-chart-box">
              <div className="chart-header">
                <div>
                  <h3>WPM & 正解率推移</h3>
                  <span className="chart-subtitle">直近セッションの成長グラフ</span>
                </div>
                <div className="chart-legend">
                  <span className="legend-item"><span className="legend-dot dot-wpm"></span> WPM</span>
                  <span className="legend-item"><span className="legend-dot dot-acc"></span> 精度 (%)</span>
                </div>
              </div>

              <div className="chart-visual-wrapper">
                <svg viewBox="0 0 600 180" className="chart-svg">
                  <line x1="30" y1="30" x2="580" y2="30" stroke="var(--border-subtle)" strokeDasharray="3 3" />
                  <line x1="30" y1="80" x2="580" y2="80" stroke="var(--border-subtle)" strokeDasharray="3 3" />
                  <line x1="30" y1="130" x2="580" y2="130" stroke="var(--border-subtle)" strokeDasharray="3 3" />
                  <line x1="30" y1="160" x2="580" y2="160" stroke="var(--border-subtle)" />

                  <path
                    d="M 50 140 Q 150 115, 240 90 T 400 65 T 560 45"
                    fill="none"
                    stroke="var(--char-caret)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 50 65 Q 150 55, 240 50 T 400 45 T 560 40"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                    strokeLinecap="round"
                  />

                  <circle cx="50" cy="140" r="4" fill="var(--char-caret)" />
                  <circle cx="240" cy="90" r="4" fill="var(--char-caret)" />
                  <circle cx="400" cy="65" r="4" fill="var(--char-caret)" />
                  <circle cx="560" cy="45" r="4" fill="var(--char-caret)" />

                  <circle cx="50" cy="65" r="4" fill="#10B981" />
                  <circle cx="240" cy="50" r="4" fill="#10B981" />
                  <circle cx="400" cy="45" r="4" fill="#10B981" />
                  <circle cx="560" cy="40" r="4" fill="#10B981" />
                </svg>
                <div className="chart-x-axis">
                  <span>セッション 1</span>
                  <span>セッション 2</span>
                  <span>セッション 3</span>
                  <span>最新</span>
                </div>
              </div>
            </div>

            {/* 履歴テーブル */}
            <div className="analytics-history-box">
              <h3>直近のセッション履歴</h3>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>種類</th>
                    <th>判定精度</th>
                    <th>速度 (WPM)</th>
                    <th>打鍵数</th>
                    <th>日時</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="type-tag">機能1 (単語)</span></td>
                    <td>99%</td>
                    <td>68</td>
                    <td>240</td>
                    <td>本日</td>
                  </tr>
                  <tr>
                    <td><span className="type-tag">機能2 (熟語)</span></td>
                    <td>97%</td>
                    <td>61</td>
                    <td>380</td>
                    <td>昨日</td>
                  </tr>
                  <tr>
                    <td><span className="type-tag">機能3 (短文)</span></td>
                    <td>95%</td>
                    <td>54</td>
                    <td>420</td>
                    <td>3日前</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ==========================================================
             機能1〜4：元のUIそのまま＋タイピング表示画面
             （タイピング判定はナシ、中央に「ここが表示画面」を表示）
             ========================================================== */
          <div className="typing-box">
            <div className="word-meta">
              <span className="word-category">{currentTab.category}</span>
              <span className="word-meaning">{currentTab.meaning}</span>
            </div>

            <div className="typing-line">
              <span className="typing-text-placeholder">
                {currentTab.displayMain}
              </span>
              <span className="trailing-caret" />
            </div>

            <p className="example-sentence">{currentTab.example}</p>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-hint">
          リボンの「機能1〜機能5」をクリックして画面を切り替えられます
        </div>
      </footer>
    </div>
  );
}

export default App;
