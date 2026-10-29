import { useState, useMemo } from "react";
import { SessionRecord, UserGoals } from "./LongTextTyping";
import {
  inferGrowthForecast,
  PredictionMetric,
} from "../utils/growthPrediction";

interface GrowthForecastPanelProps {
  sessions: SessionRecord[];
  goals: UserGoals;
}

const METRIC_META: Record<
  PredictionMetric,
  { label: string; unit: string; color: string }
> = {
  wpm: {
    label: "速度 (WPM)",
    unit: "WPM",
    color: "var(--char-caret)",
  },
  firstTryAccuracy: {
    label: "一発精度",
    unit: "%",
    color: "#F97316",
  },
  normalAccuracy: {
    label: "普通の精度",
    unit: "%",
    color: "#10B981",
  },
};

export function GrowthForecastPanel({
  sessions,
  goals,
}: GrowthForecastPanelProps) {
  const [selectedMetric, setSelectedMetric] =
    useState<PredictionMetric>("wpm");
  const [customBlendPct, setCustomBlendPct] = useState<number | null>(null);

  const forecast = useMemo(() => {
    const customWeight =
      customBlendPct !== null ? customBlendPct / 100 : null;
    return inferGrowthForecast(
      sessions,
      goals,
      selectedMetric,
      10,
      customWeight
    );
  }, [sessions, goals, selectedMetric, customBlendPct]);

  const meta = METRIC_META[selectedMetric];
  const points = forecast.points;

  // SVG 座標系計算
  const svgWidth = 680;
  const svgHeight = 230;
  const padLeft = 44;
  const padRight = 24;
  const padTop = 22;
  const padBottom = 34;
  const plotW = svgWidth - padLeft - padRight;
  const plotH = svgHeight - padTop - padBottom;

  // Y軸スケールの決定
  const allValues: number[] = [forecast.goalValue];
  points.forEach((p) => {
    if (p.actual !== undefined) allValues.push(p.actual);
    allValues.push(
      p.generalModel,
      p.personalTrend,
      p.hybridPrediction,
      p.upperBand,
      p.lowerBand
    );
  });

  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  const yMin =
    selectedMetric === "wpm"
      ? Math.max(10, Math.floor((rawMin - 6) / 5) * 5)
      : Math.max(50, Math.floor((rawMin - 3) / 2) * 2);
  const yMax =
    selectedMetric === "wpm"
      ? Math.ceil((rawMax + 6) / 5) * 5
      : Math.min(100, Math.ceil((rawMax + 2) / 2) * 2);
  const yRange = Math.max(4, yMax - yMin);

  const getX = (idx: number) => {
    if (points.length <= 1) return padLeft;
    return padLeft + (idx / (points.length - 1)) * plotW;
  };

  const getY = (val: number) => {
    const clamped = Math.max(yMin, Math.min(yMax, val));
    return padTop + plotH - ((clamped - yMin) / yRange) * plotH;
  };

  // 現在地点（最後のactualポイント）のインデックス
  const lastActualIdx = points.reduce(
    (acc, p, i) => (p.actual !== undefined ? i : acc),
    0
  );

  // パス文字列生成ヘルパー
  const buildPolylinePath = (
    items: { x: number; y: number }[]
  ): string => {
    if (items.length === 0) return "";
    return items
      .map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
      .join(" ");
  };

  // 1. 実績ライン（過去〜現在）
  const actualCoords = points
    .map((p, i) =>
      p.actual !== undefined ? { x: getX(i), y: getY(p.actual), val: p.actual } : null
    )
    .filter((v): v is { x: number; y: number; val: number } => v !== null);

  // 2. 未来予測領域（現在〜+10回）
  const futureIndices = points
    .map((_, i) => i)
    .filter((i) => i >= lastActualIdx);

  const generalFutureCoords = futureIndices.map((i) => ({
    x: getX(i),
    y: getY(points[i].generalModel),
  }));

  const personalFutureCoords = futureIndices.map((i) => ({
    x: getX(i),
    y: getY(points[i].personalTrend),
  }));

  const hybridFutureCoords = futureIndices.map((i) => ({
    x: getX(i),
    y: getY(points[i].hybridPrediction),
  }));

  // 信頼区間ポリゴン（上限→下限逆順）
  const confidenceAreaPath = useMemo(() => {
    if (futureIndices.length < 2) return "";
    const upperPts = futureIndices.map(
      (i) => `${getX(i).toFixed(1)},${getY(points[i].upperBand).toFixed(1)}`
    );
    const lowerPts = [...futureIndices]
      .reverse()
      .map(
        (i) => `${getX(i).toFixed(1)},${getY(points[i].lowerBand).toFixed(1)}`
      );
    return `M ${upperPts.join(" L ")} L ${lowerPts.join(" L ")} Z`;
  }, [futureIndices, points]);

  const goalY = getY(forecast.goalValue);
  const nowDividerX = getX(lastActualIdx);

  const yTicks = [
    yMax,
    Math.round((yMax + yMin) / 2),
    yMin,
  ];

  const activePersonalPct = Math.round(forecast.personalWeight * 100);
  const activeGeneralPct = 100 - activePersonalPct;

  return (
    <div className="analytics-chart-box growth-forecast-box">
      {/* ヘッダー：タイトル ＆ メトリクス切替タブ */}
      <div className="forecast-top-row">
        <div>
          <div className="forecast-title-line">
            <h3>成長予想曲線 & 目標到達推論（一般的データ × 自己データ）</h3>
            <span className="forecast-ai-badge">ベイズ統合推論</span>
          </div>
          <span className="chart-subtitle">
            一般的なタイピング習得曲線とあなたの直近{sessions.length}
            セッションの成長率を掛け合わせて将来の伸びを推論します
          </span>
        </div>

        <div className="forecast-metric-tabs">
          {(["wpm", "firstTryAccuracy", "normalAccuracy"] as PredictionMetric[]).map(
            (m) => (
              <button
                key={m}
                type="button"
                className={`forecast-metric-btn ${
                  selectedMetric === m ? "is-active" : ""
                }`}
                onClick={() => setSelectedMetric(m)}
              >
                {METRIC_META[m].label}
              </button>
            )
          )}
        </div>
      </div>

      {/* ブレンド比率コントロールバー */}
      <div className="forecast-blend-bar">
        <div className="blend-info">
          <span className="blend-label">推論データ重み付け:</span>
          <span className="blend-ratio-pill">
            一般的データ <strong>{activeGeneralPct}%</strong> × 自己成長データ{" "}
            <strong>{activePersonalPct}%</strong>
          </span>
          {customBlendPct === null ? (
            <span className="blend-mode-tag">
              自動（履歴数に応じて最適化）
            </span>
          ) : (
            <button
              type="button"
              className="blend-reset-btn"
              onClick={() => setCustomBlendPct(null)}
            >
              自動比率に戻す
            </button>
          )}
        </div>

        <div className="blend-slider-group">
          <span className="slider-side-label">一般重視</span>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={activePersonalPct}
            onChange={(e) => setCustomBlendPct(Number(e.target.value))}
            className="blend-range-slider"
            title="一般的データと自己成長データのブレンド比率を調整"
          />
          <span className="slider-side-label">自己重視</span>
        </div>
      </div>

      {/* 凡例 */}
      <div className="forecast-legend-row">
        <span className="legend-item">
          <span
            className="legend-line-sample solid"
            style={{ backgroundColor: meta.color }}
          />
          過去実績
        </span>
        <span className="legend-item">
          <span
            className="legend-line-sample hybrid"
            style={{ backgroundColor: meta.color }}
          />
          <strong>統合推論曲線（一般×自己）</strong>
        </span>
        <span className="legend-item">
          <span className="legend-line-sample general" />
          一般的成長曲線（平均モデル）
        </span>
        <span className="legend-item">
          <span className="legend-line-sample personal" />
          自己トレンド単体
        </span>
        <span className="legend-item">
          <span className="legend-line-sample goal" />
          目標ライン ({forecast.goalValue}
          {meta.unit})
        </span>
      </div>

      {/* SVG 成長予想曲線グラフ */}
      <div className="chart-visual-wrapper forecast-svg-wrapper">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="chart-svg forecast-svg"
        >
          {/* 横グリッド線 & Y軸ラベル */}
          {yTicks.map((tick, i) => {
            const y = getY(tick);
            return (
              <g key={i}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={svgWidth - padRight}
                  y2={y}
                  stroke="var(--border-subtle)"
                  strokeDasharray="3 3"
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="svg-axis-text"
                >
                  {tick}
                  {selectedMetric === "wpm" ? "" : "%"}
                </text>
              </g>
            );
          })}

          {/* 未来推論エリアの背景ハイライト */}
          <rect
            x={nowDividerX}
            y={padTop}
            width={Math.max(0, svgWidth - padRight - nowDividerX)}
            height={plotH}
            fill="var(--ribbon-hover)"
            opacity="0.55"
          />

          {/* 現在地点の境界縦線 */}
          <line
            x1={nowDividerX}
            y1={padTop}
            x2={nowDividerX}
            y2={padTop + plotH}
            stroke="var(--text-muted)"
            strokeWidth="1.2"
            strokeDasharray="4 3"
            opacity="0.6"
          />
          <text
            x={nowDividerX + 6}
            y={padTop + 13}
            className="svg-zone-label"
          >
            現在 → 将来推論 (+10セッション)
          </text>

          {/* 目標値水平ライン */}
          <line
            x1={padLeft}
            y1={goalY}
            x2={svgWidth - padRight}
            y2={goalY}
            stroke="#EF4444"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            opacity="0.8"
          />
          <text
            x={svgWidth - padRight - 4}
            y={Math.max(padTop + 12, goalY - 5)}
            textAnchor="end"
            className="svg-goal-label"
          >
            目標 {forecast.goalValue}
            {meta.unit}
          </text>

          {/* 推論90%信頼区間バンド */}
          {confidenceAreaPath && (
            <path
              d={confidenceAreaPath}
              fill={meta.color}
              opacity="0.13"
            />
          )}

          {/* 1. 一般的データによる標準成長曲線（破線） */}
          <path
            d={buildPolylinePath(generalFutureCoords)}
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="2"
            strokeDasharray="5 4"
            opacity="0.75"
          />

          {/* 2. 自己トレンド単体曲線（点線） */}
          <path
            d={buildPolylinePath(personalFutureCoords)}
            fill="none"
            stroke={meta.color}
            strokeWidth="1.6"
            strokeDasharray="2 4"
            opacity="0.65"
          />

          {/* 3. 統合推論曲線（一般的データ × 自己成長データ：太線） */}
          <path
            d={buildPolylinePath(hybridFutureCoords)}
            fill="none"
            stroke={meta.color}
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* 4. 過去実績ライン（実線） */}
          <path
            d={buildPolylinePath(actualCoords)}
            fill="none"
            stroke={meta.color}
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* 過去実績ドット */}
          {actualCoords.map((pt, i) => (
            <circle
              key={`act-${i}`}
              cx={pt.x}
              cy={pt.y}
              r={i === actualCoords.length - 1 ? 5 : 3.8}
              fill={meta.color}
            />
          ))}

          {/* 未来推論ポイントのドット（+5回, +10回） */}
          {futureIndices
            .filter((idx) => {
              const step = idx - lastActualIdx;
              return step === 5 || step === 10;
            })
            .map((idx) => {
              const cx = getX(idx);
              const cy = getY(points[idx].hybridPrediction);
              return (
                <g key={`fut-${idx}`}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r="4.5"
                    fill="var(--bg-card)"
                    stroke={meta.color}
                    strokeWidth="2.5"
                  />
                  <text
                    x={cx}
                    y={Math.max(padTop + 12, cy - 8)}
                    textAnchor="middle"
                    className="svg-point-val"
                  >
                    {points[idx].hybridPrediction}
                    {selectedMetric === "wpm" ? "" : "%"}
                  </text>
                </g>
              );
            })}

          {/* X軸ラベル */}
          {points.map((pt, i) => {
            const isPastEnd = i === lastActualIdx;
            const isStep5 = i - lastActualIdx === 5;
            const isStep10 = i === points.length - 1;
            const isStart = i === 0;
            if (!isStart && !isPastEnd && !isStep5 && !isStep10) return null;

            return (
              <text
                key={`xl-${i}`}
                x={getX(i)}
                y={svgHeight - 8}
                textAnchor="middle"
                className={`svg-axis-text ${isPastEnd ? "is-now" : ""}`}
              >
                {isPastEnd ? "現在" : pt.label}
              </text>
            );
          })}
        </svg>
      </div>

      {/* 推論インサイト 3カード */}
      <div className="forecast-insights-grid">
        <div className="forecast-insight-card">
          <span className="insight-label">
            目標（{forecast.goalValue}
            {meta.unit}）到達予測
          </span>
          <span className="insight-main-val">
            {forecast.isGoalAlreadyMet
              ? "目標達成済み 🎉"
              : forecast.estimatedSessionsToGoal !== null
              ? `あと約 ${forecast.estimatedSessionsToGoal} セッション`
              : "長期継続で到達圏内"}
          </span>
          <span className="insight-sub">
            {forecast.isGoalAlreadyMet
              ? `現在推定値 ${forecast.currentValue}${meta.unit}（目標クリア）`
              : forecast.generalSessionsToGoal !== null
              ? `一般的データ単独予測では 約 ${forecast.generalSessionsToGoal} セッション`
              : "目標値を段階的に設定すると予測精度が向上します"}
          </span>
        </div>

        <div className="forecast-insight-card">
          <span className="insight-label">+10セッション後の推論到達値</span>
          <span className="insight-main-val highlight">
            {forecast.projectedPlus10} <small>{meta.unit}</small>
          </span>
          <span className="insight-sub">
            現在 {forecast.currentValue}
            {meta.unit} から{" "}
            {forecast.projectedPlus10 >= forecast.currentValue ? "+" : ""}
            {Math.round((forecast.projectedPlus10 - forecast.currentValue) * 10) /
              10}
            {meta.unit} の成長見込み
          </span>
        </div>

        <div className="forecast-insight-card">
          <span className="insight-label">あなたの成長速度（一般平均比）</span>
          <span className="insight-main-val">
            {forecast.paceRatioVsGeneral.toFixed(2)} <small>倍</small>
          </span>
          <span className="insight-sub">
            {forecast.paceRatioVsGeneral >= 1.05
              ? "一般的な学習曲線より速いペースで上達しています"
              : forecast.paceRatioVsGeneral >= 0.9
              ? "一般的な標準学習曲線とほぼ同等の堅実なペースです"
              : "基礎定着フェーズです。継続で急上昇が見込めます"}
          </span>
        </div>
      </div>
    </div>
  );
}
