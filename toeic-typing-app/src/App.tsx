import { useState, useEffect } from "react";
import "./App.css";
import { LongTextTyping } from "./components/LongTextTyping";

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
  const [analyticsSubView, setAnalyticsSubView] = useState<"summary" | "detail">("summary");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleTabClick = (tabId: FunctionTabId) => {
    setActiveTab(tabId);
    if (tabId === "func5") {
      setAnalyticsSubView("summary");
    }
  };

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
                onClick={() => handleTabClick(tab.id)}
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
      <main className={`main-content ${activeTab === "func4" ? "main-content-wide" : ""}`}>
        {activeTab === "func5" ? (
          analyticsSubView === "detail" ? (
            /* ==========================================================
               機能5：詳細記録 & 成績画面（画面切り替え表示）
               ========================================================== */
            <div className="analytics-detail-page">
              {/* ナビゲーション・戻るバー */}
              <div className="detail-page-header">
                <button
                  type="button"
                  className="back-btn"
                  onClick={() => setAnalyticsSubView("summary")}
                >
                  ← 記録サマリーに戻る
                </button>
                <div className="detail-status-pill">
                  <span className="status-dot-pulse" />
                  リアルタイム打鍵ログ蓄積中
                </div>
              </div>

              <div className="analytics-detail-title-block">
                <h2>機能5：詳細記録 & 成績</h2>
                <p>キーストローク分析、苦手キーの傾向、およびセッション詳細履歴の閲覧・設定ができます。</p>
              </div>

              {/* 苦手キー・誤打率分析 */}
              <section className="detail-panel">
                <div className="panel-title-row">
                  <h3>苦手キー・誤打率分析 (ミス率 TOP 4)</h3>
                  <span className="panel-hint">打鍵ミスの発生頻度が高いキーと傾向</span>
                </div>

                <div className="weak-keys-grid-expanded">
                  <div className="weak-key-card-expanded">
                    <div className="key-header">
                      <span className="key-char">B</span>
                      <span className="key-miss-rate">ミス率 6.8%</span>
                    </div>
                    <div className="key-desc">
                      <strong>人差し指の到達ミス</strong>
                      <p>V/Nキーからの運指でホームポジションから離れやすい傾向があります。</p>
                    </div>
                  </div>

                  <div className="weak-key-card-expanded">
                    <div className="key-header">
                      <span className="key-char">P</span>
                      <span className="key-miss-rate">ミス率 5.4%</span>
                    </div>
                    <div className="key-desc">
                      <strong>右小指の上段伸ばし</strong>
                      <p>O/P間の距離移動で右手全体の軸が右上にブレています。</p>
                    </div>
                  </div>

                  <div className="weak-key-card-expanded">
                    <div className="key-header">
                      <span className="key-char">C</span>
                      <span className="key-miss-rate">ミス率 4.9%</span>
                    </div>
                    <div className="key-desc">
                      <strong>左手中指の内側曲げ</strong>
                      <p>Dからの引き込みで薬指(X)との誤打が散見されます。</p>
                    </div>
                  </div>

                  <div className="weak-key-card-expanded">
                    <div className="key-header">
                      <span className="key-char">X</span>
                      <span className="key-miss-rate">ミス率 4.1%</span>
                    </div>
                    <div className="key-desc">
                      <strong>左手薬指の下段引き</strong>
                      <p>S段からの下降時に人差し指側の巻き込みが起きています。</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* パフォーマンス詳細メトリクス */}
              <section className="detail-panel">
                <div className="panel-title-row">
                  <h3>パフォーマンス詳細メトリクス</h3>
                  <span className="panel-hint">入力の安定性とリズムの計測結果</span>
                </div>

                <div className="detail-metrics-grid">
                  <div className="metric-box">
                    <span className="metric-title">打鍵の一貫性 (Consistency)</span>
                    <span className="metric-value highlight">84.2%</span>
                    <span className="metric-sub">各キー間の入力インターバル標準偏差から算出</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-title">修正打鍵数 (Corrections)</span>
                    <span className="metric-value">38 <small>回</small></span>
                    <span className="metric-sub">Backspace / 打ち直しキー入力総数</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-title">最高打鍵速度 (Peak WPM)</span>
                    <span className="metric-value">78 <small>WPM</small></span>
                    <span className="metric-sub">瞬間最大打鍵速度</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-title">平均打鍵間隔 (Interval)</span>
                    <span className="metric-value">192 <small>ms</small></span>
                    <span className="metric-sub">キーストローク間の平均所要ミリ秒</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-title">累積エラー数 (Total Errors)</span>
                    <span className="metric-value error">24 <small>回</small></span>
                    <span className="metric-sub">直近セッションの未修正・修正ミス合算</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-title">入力効率スコア (Efficiency)</span>
                    <span className="metric-value success">91.8%</span>
                    <span className="metric-sub">無駄な打鍵の少なさを示す指数</span>
                  </div>
                </div>
              </section>

              {/* セッション詳細ログ */}
              <section className="detail-panel">
                <div className="panel-title-row">
                  <h3>セッション詳細履歴ログ</h3>
                  <span className="panel-hint">各セッションごとの打鍵成績</span>
                </div>

                <div className="detail-table-wrapper">
                  <table className="detail-table">
                    <thead>
                      <tr>
                        <th>日時</th>
                        <th>モード / カテゴリ</th>
                        <th>判定精度</th>
                        <th>WPM</th>
                        <th>打鍵数 / ミス</th>
                        <th>ステータス</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>本日 13:42</td>
                        <td><span className="type-tag">機能1 (単語)</span> TOEIC Core Vocab #14</td>
                        <td className="highlight-cell">99%</td>
                        <td>68</td>
                        <td>240 / 2</td>
                        <td><span className="badge-done">完了</span></td>
                      </tr>
                      <tr>
                        <td>昨日 13:28</td>
                        <td><span className="type-tag">機能2 (熟語)</span> Business Phrases #8</td>
                        <td className="highlight-cell">97%</td>
                        <td>61</td>
                        <td>380 / 11</td>
                        <td><span className="badge-done">完了</span></td>
                      </tr>
                      <tr>
                        <td>3日前 12:55</td>
                        <td><span className="type-tag">機能3 (短文)</span> Part 5 Sentences #3</td>
                        <td className="highlight-cell">95%</td>
                        <td>54</td>
                        <td>420 / 21</td>
                        <td><span className="badge-done">完了</span></td>
                      </tr>
                      <tr>
                        <td>4日前 18:10</td>
                        <td><span className="type-tag">機能4 (実践文)</span> Email & Logistics #1</td>
                        <td className="highlight-cell">94%</td>
                        <td>51</td>
                        <td>610 / 36</td>
                        <td><span className="badge-done">完了</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* 詳細データ設定・管理 */}
              <section className="detail-panel">
                <div className="panel-title-row">
                  <h3>詳細データ設定・管理</h3>
                  <span className="panel-hint">ログのエクスポートおよびデータ管理</span>
                </div>

                <div className="detail-action-row">
                  <button
                    type="button"
                    className="action-btn-secondary"
                    onClick={() => alert("CSVエクスポート機能はフェーズ3で実装予定です。")}
                  >
                    📊 成績データをCSV形式で出力
                  </button>
                  <button
                    type="button"
                    className="action-btn-secondary"
                    onClick={() => alert("生ログJSON出力機能はフェーズ3で実装予定です。")}
                  >
                    💾 生キーストロークログ (JSON) 出力
                  </button>
                  <button
                    type="button"
                    className="action-btn-secondary danger"
                    onClick={() => {
                      if (window.confirm("打鍵履歴ログをクリアしますか？")) {
                        alert("ログリセット機能はフェーズ3で実装予定です。");
                      }
                    }}
                  >
                    🗑️ 記録ログのクリア
                  </button>
                </div>
              </section>
            </div>
          ) : (
            /* ==========================================================
               機能5：記録サマリー（統計 & グラフ）画面
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

                {/* 成績右下の案内リンク（詳細画面へ画面切り替え） */}
                <div className="analytics-history-footer">
                  <button
                    type="button"
                    className="analytics-detail-link"
                    onClick={() => setAnalyticsSubView("detail")}
                  >
                    &gt;&gt; 詳細な記録・成績
                  </button>
                </div>
              </div>
            </div>
          )
        ) : activeTab === "func4" ? (
          /* ==========================================================
             機能4：実践文（2行スライドタイピング画面）
             長文が二行表示され、一行完ぺきに打てたら消えて下が上に上がり、
             次の文が下に表示される
             ========================================================== */
          <LongTextTyping isActive={activeTab === "func4"} />
        ) : (
          /* ==========================================================
             機能1〜3：タイピング表示画面
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
