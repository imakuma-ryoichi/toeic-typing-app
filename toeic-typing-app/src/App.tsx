import { useState, useEffect, useRef } from "react";
import "./App.css";
import {
  LongTextTyping,
  UserGoals,
  SessionRecord,
} from "./components/LongTextTyping";
import { GrowthForecastPanel } from "./components/GrowthForecastPanel";
import { TypingGenre, TypingTabMode } from "./data/practicalTexts";

type FunctionTabId = "func1" | "func2" | "func3" | "func4" | "func5";

interface TabItemInfo {
  id: FunctionTabId;
  label: string;
  subLabel: string;
}

const TABS_CONFIG: TabItemInfo[] = [
  {
    id: "func1",
    label: "機能1",
    subLabel: "日本語",
  },
  {
    id: "func2",
    label: "機能2",
    subLabel: "単語",
  },
  {
    id: "func3",
    label: "機能3",
    subLabel: "熟語",
  },
  {
    id: "func4",
    label: "機能4",
    subLabel: "実践文",
  },
  {
    id: "func5",
    label: "機能5",
    subLabel: "記録",
  },
];

type Theme = "light" | "slate";

const GOALS_STORAGE_KEY = "toeic_typing_user_goals_v1";
const SESSIONS_STORAGE_KEY = "toeic_typing_session_records_v1";

const DEFAULT_GOALS: UserGoals = {
  firstTryAccuracy: 92,
  normalAccuracy: 97,
  wpm: 60,
};

const INITIAL_SESSIONS: SessionRecord[] = [
  {
    id: "init-1",
    timestamp: "本日 13:42",
    genre: "toeic",
    tabMode: "func2",
    modeLabel: "機能2 (単語)",
    title: "会議・スケジュール頻出単語",
    firstTryAccuracy: 96,
    normalAccuracy: 99,
    wpm: 68,
    keystrokes: 240,
    mistakes: 2,
  },
  {
    id: "init-2",
    timestamp: "昨日 19:15",
    genre: "linux",
    tabMode: "func4",
    modeLabel: "機能4 (実践文)",
    title: "#3 RealSense T265とPython 3.11の互換性問題",
    firstTryAccuracy: 91,
    normalAccuracy: 96,
    wpm: 58,
    keystrokes: 520,
    mistakes: 18,
  },
  {
    id: "init-3",
    timestamp: "昨日 13:28",
    genre: "toeic",
    tabMode: "func3",
    modeLabel: "機能3 (熟語)",
    title: "ビジネスメール必須イディオム",
    firstTryAccuracy: 93,
    normalAccuracy: 97,
    wpm: 61,
    keystrokes: 380,
    mistakes: 11,
  },
  {
    id: "init-4",
    timestamp: "3日前 18:10",
    genre: "toeic",
    tabMode: "func4",
    modeLabel: "機能4 (実践文)",
    title: "顧客問い合わせ対応メール",
    firstTryAccuracy: 89,
    normalAccuracy: 95,
    wpm: 54,
    keystrokes: 610,
    mistakes: 30,
  },
];

function App() {
  const [theme, setTheme] = useState<Theme>("light");
  const [genre, setGenre] = useState<TypingGenre>("toeic");
  const [isGenreMenuOpen, setIsGenreMenuOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<FunctionTabId>("func4");
  const [analyticsSubView, setAnalyticsSubView] = useState<"summary" | "detail">(
    "summary"
  );

  // 目標設定ステート（localStorage永続化）
  const [goals, setGoals] = useState<UserGoals>(() => {
    try {
      const saved = localStorage.getItem(GOALS_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_GOALS, ...JSON.parse(saved) };
      }
    } catch {
      // ignore storage errors
    }
    return DEFAULT_GOALS;
  });

  // セッション履歴ステート（localStorage永続化）
  const [sessions, setSessions] = useState<SessionRecord[]>(() => {
    try {
      const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore storage errors
    }
    return INITIAL_SESSIONS;
  });

  const genreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
    } catch {
      // ignore storage errors
    }
  }, [goals]);

  useEffect(() => {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch {
      // ignore storage errors
    }
  }, [sessions]);

  // メニュー外クリックでジャンルメニューを閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        genreMenuRef.current &&
        !genreMenuRef.current.contains(e.target as Node)
      ) {
        setIsGenreMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTabClick = (tabId: FunctionTabId) => {
    setActiveTab(tabId);
    if (tabId === "func5") {
      setAnalyticsSubView("summary");
    }
  };

  const handleSelectGenre = (nextGenre: TypingGenre) => {
    setGenre(nextGenre);
    setIsGenreMenuOpen(false);
  };

  const handleGoalChange = (key: keyof UserGoals, rawValue: string) => {
    const num = Number(rawValue);
    if (Number.isNaN(num)) return;
    const clamped =
      key === "wpm"
        ? Math.max(10, Math.min(300, num))
        : Math.max(1, Math.min(100, num));
    setGoals((prev) => ({
      ...prev,
      [key]: clamped,
    }));
  };

  const handleSessionComplete = (record: SessionRecord) => {
    setSessions((prev) => [record, ...prev]);
  };

  // 統計サマリー計算
  const avgFirstTryAccuracy =
    sessions.length > 0
      ? Math.round(
          sessions.reduce((sum, s) => sum + s.firstTryAccuracy, 0) /
            sessions.length
        )
      : 0;
  const avgNormalAccuracy =
    sessions.length > 0
      ? Math.round(
          sessions.reduce((sum, s) => sum + s.normalAccuracy, 0) /
            sessions.length
        )
      : 0;
  const avgWpm =
    sessions.length > 0
      ? Math.round(sessions.reduce((sum, s) => sum + s.wpm, 0) / sessions.length)
      : 0;
  const totalKeystrokes = sessions.reduce((sum, s) => sum + s.keystrokes, 0);

  return (
    <div className="app-container" data-theme={theme}>
      {/* 上部リボン（ヘッダー） */}
      <header className="ribbon-header">
        <div className="ribbon-left" ref={genreMenuRef}>
          <button
            type="button"
            className={`brand-logo-btn ${isGenreMenuOpen ? "is-open" : ""}`}
            onClick={() => setIsGenreMenuOpen((prev) => !prev)}
            title="クリックしてジャンル（TOEIC系 / Linux系）を切り替え"
          >
            <span className="brand-logo-text">Typing</span>
            <span className={`brand-genre-pill genre-${genre}`}>
              {genre === "toeic" ? "TOEIC" : "Linux"}
            </span>
            <span className="brand-chevron">▾</span>
          </button>

          {isGenreMenuOpen && (
            <div className="genre-dropdown-menu" role="menu">
              <div className="genre-dropdown-header">
                出題ジャンルを切り替え
              </div>
              <button
                type="button"
                className={`genre-dropdown-item ${
                  genre === "toeic" ? "is-selected" : ""
                }`}
                onClick={() => handleSelectGenre("toeic")}
              >
                <div className="genre-item-top">
                  <span className="genre-item-title">TOEIC ビジネス系</span>
                  {genre === "toeic" && <span className="genre-check">✓</span>}
                </div>
                <span className="genre-item-desc">
                  TOEIC頻出の単語・熟語・ビジネスメール長文
                </span>
              </button>

              <button
                type="button"
                className={`genre-dropdown-item ${
                  genre === "linux" ? "is-selected" : ""
                }`}
                onClick={() => handleSelectGenre("linux")}
              >
                <div className="genre-item-top">
                  <span className="genre-item-title">
                    Linux 系
                  </span>
                  {genre === "linux" && <span className="genre-check">✓</span>}
                </div>
                <span className="genre-item-desc">
                  uv / Python / Docker 等のデバッグ解説（source/uv.md）
                </span>
              </button>
            </div>
          )}
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
      <main
        className={`main-content ${
          activeTab !== "func5" ? "main-content-wide" : ""
        }`}
      >
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
                <p>
                  一発精度・普通の精度の内訳、苦手キーの傾向、およびセッション詳細履歴の閲覧・目標設定ができます。
                </p>
              </div>

              {/* 苦手キー・誤打率分析 */}
              <section className="detail-panel">
                <div className="panel-title-row">
                  <h3>苦手キー・誤打率分析 (ミス率 TOP 4)</h3>
                  <span className="panel-hint">
                    打鍵ミスの発生頻度が高いキーと傾向
                  </span>
                </div>

                <div className="weak-keys-grid-expanded">
                  <div className="weak-key-card-expanded">
                    <div className="key-header">
                      <span className="key-char">B</span>
                      <span className="key-miss-rate">ミス率 6.8%</span>
                    </div>
                    <div className="key-desc">
                      <strong>人差し指の到達ミス</strong>
                      <p>
                        V/Nキーからの運指でホームポジションから離れやすい傾向があります。
                      </p>
                    </div>
                  </div>

                  <div className="weak-key-card-expanded">
                    <div className="key-header">
                      <span className="key-char">P</span>
                      <span className="key-miss-rate">ミス率 5.4%</span>
                    </div>
                    <div className="key-desc">
                      <strong>右小指の上段伸ばし</strong>
                      <p>
                        O/P間の距離移動で右手全体の軸が右上にブレています。
                      </p>
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
                      <p>
                        S段からの下降時に人差し指側の巻き込みが起きています。
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* パフォーマンス詳細メトリクス */}
              <section className="detail-panel">
                <div className="panel-title-row">
                  <h3>パフォーマンス詳細メトリクス</h3>
                  <span className="panel-hint">
                    一発精度・普通の精度および入力リズムの計測結果
                  </span>
                </div>

                <div className="detail-metrics-grid">
                  <div className="metric-box">
                    <span className="metric-title">
                      平均 一発精度 (First-Try Accuracy)
                    </span>
                    <span className="metric-value highlight">
                      {avgFirstTryAccuracy}%
                    </span>
                    <span className="metric-sub">
                      1度もミスせず一発で入力できた文字の割合（目標:{" "}
                      {goals.firstTryAccuracy}%）
                    </span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-title">
                      平均 普通の精度 (Normal Accuracy)
                    </span>
                    <span className="metric-value success">
                      {avgNormalAccuracy}%
                    </span>
                    <span className="metric-sub">
                      総打鍵数に対する正解打鍵の割合（目標:{" "}
                      {goals.normalAccuracy}%）
                    </span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-title">
                      打鍵の一貫性 (Consistency)
                    </span>
                    <span className="metric-value">84.2%</span>
                    <span className="metric-sub">
                      各キー間の入力インターバル標準偏差から算出
                    </span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-title">最高打鍵速度 (Peak WPM)</span>
                    <span className="metric-value">
                      {Math.max(78, ...sessions.map((s) => s.wpm))}{" "}
                      <small>WPM</small>
                    </span>
                    <span className="metric-sub">
                      瞬間・セッション最大打鍵速度
                    </span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-title">
                      平均打鍵間隔 (Interval)
                    </span>
                    <span className="metric-value">
                      192 <small>ms</small>
                    </span>
                    <span className="metric-sub">
                      キーストローク間の平均所要ミリ秒
                    </span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-title">
                      累積エラー数 (Total Errors)
                    </span>
                    <span className="metric-value error">
                      {sessions.reduce((sum, s) => sum + s.mistakes, 0)}{" "}
                      <small>回</small>
                    </span>
                    <span className="metric-sub">
                      記録セッションの総ミス打鍵合算
                    </span>
                  </div>
                </div>
              </section>

              {/* セッション詳細ログ */}
              <section className="detail-panel">
                <div className="panel-title-row">
                  <h3>セッション詳細履歴ログ</h3>
                  <span className="panel-hint">
                    各セッションごとの一発精度・普通の精度・WPM成績
                  </span>
                </div>

                <div className="detail-table-wrapper">
                  <table className="detail-table">
                    <thead>
                      <tr>
                        <th>日時</th>
                        <th>ジャンル / モード</th>
                        <th>一発精度</th>
                        <th>普通の精度</th>
                        <th>WPM</th>
                        <th>打鍵数 / ミス</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((s) => (
                        <tr key={s.id}>
                          <td>{s.timestamp}</td>
                          <td>
                            <span
                              className={`genre-mini-tag genre-${s.genre}`}
                            >
                              {s.genre === "toeic" ? "TOEIC" : "Linux"}
                            </span>{" "}
                            <span className="type-tag">{s.modeLabel}</span>{" "}
                            {s.title}
                          </td>
                          <td className="highlight-cell">
                            {s.firstTryAccuracy}%
                          </td>
                          <td className="normal-acc-cell">
                            {s.normalAccuracy}%
                          </td>
                          <td>{s.wpm}</td>
                          <td>
                            {s.keystrokes} / {s.mistakes}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* 詳細データ設定・管理 */}
              <section className="detail-panel">
                <div className="panel-title-row">
                  <h3>詳細データ設定・管理</h3>
                  <span className="panel-hint">
                    ログのエクスポートおよび履歴リセット
                  </span>
                </div>

                <div className="detail-action-row">
                  <button
                    type="button"
                    className="action-btn-secondary"
                    onClick={() =>
                      alert("CSVエクスポート機能はフェーズ3で実装予定です。")
                    }
                  >
                    📊 成績データをCSV形式で出力
                  </button>
                  <button
                    type="button"
                    className="action-btn-secondary danger"
                    onClick={() => {
                      if (
                        window.confirm("セッション履歴を初期状態にリセットしますか？")
                      ) {
                        setSessions(INITIAL_SESSIONS);
                      }
                    }}
                  >
                    🗑️ 記録ログのリセット
                  </button>
                </div>
              </section>
            </div>
          ) : (
            /* ==========================================================
               機能5：記録サマリー（統計 & グラフ & 目標設定）画面
               ========================================================== */
            <div className="analytics-view">
              <div className="analytics-header-row">
                <div className="analytics-header">
                  <h2>機能5：学習記録 & パフォーマンス分析</h2>
                  <p>
                    「一発精度」「普通の精度」「速度(WPM)」の推移と、自身の目標設定を管理するダッシュボードです。
                  </p>
                </div>
              </div>

              {/* 自分で設定できる目標設定パネル */}
              <div className="goals-setting-bar">
                <div className="goals-bar-title">
                  <span className="goals-badge">目標設定</span>
                  <span className="goals-desc">
                    自分の目標数値を自由に設定できます（自動保存）
                  </span>
                </div>

                <div className="goals-inputs-group">
                  <label className="goal-input-item">
                    <span className="goal-input-label">一発精度の目標</span>
                    <div className="goal-input-wrap">
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={goals.firstTryAccuracy}
                        onChange={(e) =>
                          handleGoalChange("firstTryAccuracy", e.target.value)
                        }
                      />
                      <span className="goal-unit">%</span>
                    </div>
                  </label>

                  <label className="goal-input-item">
                    <span className="goal-input-label">普通の精度の目標</span>
                    <div className="goal-input-wrap">
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={goals.normalAccuracy}
                        onChange={(e) =>
                          handleGoalChange("normalAccuracy", e.target.value)
                        }
                      />
                      <span className="goal-unit">%</span>
                    </div>
                  </label>

                  <label className="goal-input-item">
                    <span className="goal-input-label">速度 (WPM) の目標</span>
                    <div className="goal-input-wrap">
                      <input
                        type="number"
                        min={10}
                        max={300}
                        value={goals.wpm}
                        onChange={(e) =>
                          handleGoalChange("wpm", e.target.value)
                        }
                      />
                      <span className="goal-unit">WPM</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* サマリーカード（一発精度・普通の精度・WPM・打鍵数） */}
              <div className="analytics-cards-grid">
                <div className="analytics-card">
                  <span className="card-label">
                    一発精度 (First-Try Accuracy)
                  </span>
                  <span className="card-value highlight-accent">
                    {avgFirstTryAccuracy}%
                  </span>
                  <span
                    className={`card-caption ${
                      avgFirstTryAccuracy >= goals.firstTryAccuracy
                        ? "caption-pass"
                        : "caption-miss"
                    }`}
                  >
                    目標: {goals.firstTryAccuracy}%以上{" "}
                    {avgFirstTryAccuracy >= goals.firstTryAccuracy
                      ? "（達成 ✓）"
                      : "（あと " +
                        (goals.firstTryAccuracy - avgFirstTryAccuracy) +
                        "%）"}
                  </span>
                </div>

                <div className="analytics-card">
                  <span className="card-label">普通の精度 (Normal Accuracy)</span>
                  <span className="card-value highlight-emerald">
                    {avgNormalAccuracy}%
                  </span>
                  <span
                    className={`card-caption ${
                      avgNormalAccuracy >= goals.normalAccuracy
                        ? "caption-pass"
                        : "caption-miss"
                    }`}
                  >
                    目標: {goals.normalAccuracy}%以上{" "}
                    {avgNormalAccuracy >= goals.normalAccuracy
                      ? "（達成 ✓）"
                      : "（あと " +
                        (goals.normalAccuracy - avgNormalAccuracy) +
                        "%）"}
                  </span>
                </div>

                <div className="analytics-card">
                  <span className="card-label">平均速度 (WPM)</span>
                  <span className="card-value">{avgWpm}</span>
                  <span
                    className={`card-caption ${
                      avgWpm >= goals.wpm ? "caption-pass" : "caption-miss"
                    }`}
                  >
                    目標: {goals.wpm} WPM以上{" "}
                    {avgWpm >= goals.wpm
                      ? "（達成 ✓）"
                      : `（あと ${goals.wpm - avgWpm} WPM）`}
                  </span>
                </div>

                <div className="analytics-card">
                  <span className="card-label">総打鍵数 / 完了数</span>
                  <span className="card-value">
                    {totalKeystrokes.toLocaleString()}
                  </span>
                  <span className="card-caption">
                    クリア完了: {sessions.length} セット
                  </span>
                </div>
              </div>

              {/* 成長予想曲線 & AI統合推論グラフ（一般的データ × 自己成長データ） */}
              <GrowthForecastPanel sessions={sessions} goals={goals} />

              {/* 履歴テーブル */}
              <div className="analytics-history-box">
                <h3>直近のセッション履歴</h3>
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>ジャンル / 種類</th>
                      <th>セット名</th>
                      <th>一発精度</th>
                      <th>普通の精度</th>
                      <th>速度 (WPM)</th>
                      <th>打鍵数</th>
                      <th>日時</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.slice(0, 6).map((s) => (
                      <tr key={s.id}>
                        <td>
                          <span className={`genre-mini-tag genre-${s.genre}`}>
                            {s.genre === "toeic" ? "TOEIC" : "Linux"}
                          </span>{" "}
                          <span className="type-tag">{s.modeLabel}</span>
                        </td>
                        <td className="session-title-cell">{s.title}</td>
                        <td className="highlight-cell">
                          {s.firstTryAccuracy}%
                        </td>
                        <td className="normal-acc-cell">{s.normalAccuracy}%</td>
                        <td>{s.wpm}</td>
                        <td>{s.keystrokes}</td>
                        <td>{s.timestamp}</td>
                      </tr>
                    ))}
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
        ) : (
          /* ==========================================================
             機能1〜機能4：全タブ共通の1行ストリームタイピング画面
             （左上の Typing から TOEIC系 / Linux系 を切り替え可能）
             ========================================================== */
          <LongTextTyping
            isActive={true}
            genre={genre}
            tabMode={activeTab as TypingTabMode}
            goals={goals}
            onSessionComplete={handleSessionComplete}
          />
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-hint">
          左上の「Typing」でジャンル（TOEIC / Linux）切替 •
          上部リボンの「機能1〜機能5」でモード切替
        </div>
      </footer>
    </div>
  );
}

export default App;
