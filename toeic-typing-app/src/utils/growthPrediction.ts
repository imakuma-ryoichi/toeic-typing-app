import { SessionRecord, UserGoals } from "../components/LongTextTyping";

export type PredictionMetric = "wpm" | "firstTryAccuracy" | "normalAccuracy";

export interface CurvePoint {
  sessionIndex: number; // 1..N (過去実績), N+1..N+F (未来予測)
  label: string;
  actual?: number; // 実績値（過去セッションのみ）
  generalModel: number; // 一般的データのみに基づく標準成長曲線
  personalTrend: number; // 自分自身の成長データのみの外挿曲線
  hybridPrediction: number; // 一般的データ × 自己成長データの統合推論曲線
  upperBand: number; // 推論90%信頼区間（上限）
  lowerBand: number; // 推論90%信頼区間（下限）
}

export interface MetricForecastResult {
  metric: PredictionMetric;
  currentValue: number;
  goalValue: number;
  isGoalAlreadyMet: boolean;
  /** 統合推論による目標到達までの予想残りセッション数（到達済なら0、到達困難ならnull） */
  estimatedSessionsToGoal: number | null;
  /** 一般的モデルのみの場合の目標到達までの予想残りセッション数 */
  generalSessionsToGoal: number | null;
  /** 一般的成長速度に対する自己成長速度の倍率（例: 1.25 = 一般より25%速い） */
  paceRatioVsGeneral: number;
  /** 自己データの重み比率 (0.0 ~ 1.0) */
  personalWeight: number;
  /** 一般的データの重み比率 (0.0 ~ 1.0) */
  generalWeight: number;
  /** 10セッション後の予想到達値（統合推論） */
  projectedPlus10: number;
  /** グラフ描画用データポイント列（過去 + 未来12セッション） */
  points: CurvePoint[];
}

interface MetricConfig {
  asymptote: number; // 理論上限値 (M_inf)
  minFloor: number;
  generalRateK: number; // 一般的学習率パラメータ k_general (1セッションあたり)
  defaultBaseline: number;
  bandBaseWidth: number;
}

const METRIC_CONFIGS: Record<PredictionMetric, MetricConfig> = {
  wpm: {
    asymptote: 120, // 熟練タイピストの上限漸近値
    minFloor: 15,
    generalRateK: 0.036, // 一般的なWPM成長係数
    defaultBaseline: 48,
    bandBaseWidth: 4.5,
  },
  firstTryAccuracy: {
    asymptote: 99.0, // 一発精度の漸近上限
    minFloor: 60,
    generalRateK: 0.048, // 一般的な一発精度改善係数
    defaultBaseline: 86,
    bandBaseWidth: 1.8,
  },
  normalAccuracy: {
    asymptote: 99.8, // 普通の精度の漸近上限
    minFloor: 70,
    generalRateK: 0.058, // 一般的な通常精度改善係数
    defaultBaseline: 93,
    bandBaseWidth: 1.2,
  },
};

/**
 * 漸近指数学習モデル: M(t) = M_inf - (M_inf - M_0) * exp(-k * t)
 */
function evaluateAsymptoticCurve(
  m0: number,
  mInf: number,
  k: number,
  t: number,
  minFloor: number
): number {
  const gap0 = Math.max(0.5, mInf - m0);
  const raw = mInf - gap0 * Math.exp(-k * t);
  return Math.max(minFloor, Math.min(mInf, raw));
}

/**
 * 過去セッションの時系列データから、ユーザー固有の学習率 k_personal を最小二乗推定する
 */
function estimatePersonalRateK(
  chronologicalValues: number[],
  config: MetricConfig
): number {
  const n = chronologicalValues.length;
  if (n < 2) {
    return config.generalRateK;
  }

  // 線形回帰で1セッションあたりの平均改善スロープ dy/dt を算出
  let sumT = 0;
  let sumY = 0;
  let sumTY = 0;
  let sumTT = 0;

  for (let i = 0; i < n; i++) {
    const t = i;
    const y = chronologicalValues[i];
    sumT += t;
    sumY += y;
    sumTY += t * y;
    sumTT += t * t;
  }

  const denom = n * sumTT - sumT * sumT;
  const slopePerSession =
    denom > 0 ? (n * sumTY - sumT * sumY) / denom : 0;

  const meanY = sumY / n;
  const remainingGap = Math.max(2.0, config.asymptote - meanY);

  // dM/dt = k * (M_inf - M) より k_personal = slope / remainingGap
  const rawK = slopePerSession / remainingGap;

  // 極端な外れ値（単発のミスやノイズ）で曲線が発散しないよう現実的な範囲にクランプ
  const minK = config.generalRateK * 0.25;
  const maxK = config.generalRateK * 2.8;
  return Math.max(minK, Math.min(maxK, rawK));
}

/**
 * 目標値 goal に到達するまでに必要な追加セッション数を逆算する
 */
function solveSessionsToGoal(
  currentVal: number,
  goalVal: number,
  mInf: number,
  rateK: number
): number | null {
  if (currentVal >= goalVal) return 0;
  if (goalVal >= mInf || rateK <= 0.0001) return null;

  const ratio = (mInf - currentVal) / (mInf - goalVal);
  if (ratio <= 1) return 0;

  const steps = Math.ceil(Math.log(ratio) / rateK);
  return steps > 200 ? null : Math.max(1, steps);
}

/**
 * 一般的データ（Prior）とユーザー自身の成長データ（Likelihood）を組み合わせて
 * 成長予想曲線と目標到達予測を推論する
 */
export function inferGrowthForecast(
  sessions: SessionRecord[],
  goals: UserGoals,
  metric: PredictionMetric,
  futureSteps = 10,
  customPersonalWeight?: number | null
): MetricForecastResult {
  const config = METRIC_CONFIGS[metric];

  // sessions は新しい順（降順）で格納されているため、古い順（時系列順）に並べ替える
  const chronological = [...sessions].reverse();
  const values = chronological.map((s) => s[metric]);
  const n = values.length;

  // 初期ベースライン（最初の2セッション平均またはデフォルト）
  const baseline0 =
    n > 0
      ? n >= 2
        ? (values[0] + values[1]) / 2
        : values[0]
      : config.defaultBaseline;

  // 現在の実力推定値（直近最大3セッションの重み付き移動平均）
  const currentValue =
    n === 0
      ? config.defaultBaseline
      : n === 1
      ? values[0]
      : n === 2
      ? Math.round((values[1] * 0.65 + values[0] * 0.35) * 10) / 10
      : Math.round(
          (values[n - 1] * 0.5 +
            values[n - 2] * 0.3 +
            values[n - 3] * 0.2) *
            10
        ) / 10;

  // 自己データからの学習率 k_personal 推定
  const personalK = estimatePersonalRateK(values, config);
  const generalK = config.generalRateK;

  // ベイズ信頼度重み: セッション数 n が増えるほど自己データの重みが増す (n / (n + tau))
  // ユーザーがスライダー等で明示指定した場合はその比率を使用
  const priorStrengthTau = 6;
  const autoPersonalWeight = Math.min(
    0.85,
    Math.max(0.15, n / (n + priorStrengthTau))
  );
  const personalWeight =
    customPersonalWeight !== undefined && customPersonalWeight !== null
      ? Math.max(0, Math.min(1, customPersonalWeight))
      : autoPersonalWeight;
  const generalWeight = 1 - personalWeight;

  // 統合推論の成長係数 k_hybrid
  const hybridK = generalWeight * generalK + personalWeight * personalK;
  const paceRatioVsGeneral =
    Math.round((hybridK / generalK) * 100) / 100;

  // グラフに表示する過去セッション（最大直近6件）＋ 未来セッション（futureSteps件）
  const recentWindow = Math.min(n, 6);
  const startIdx = Math.max(0, n - recentWindow);
  const points: CurvePoint[] = [];

  // 1. 過去セッション領域のプロット
  for (let i = startIdx; i < n; i++) {
    const stepFromStart = i;
    const actualVal = values[i];
    const genVal = evaluateAsymptoticCurve(
      baseline0,
      config.asymptote,
      generalK,
      stepFromStart,
      config.minFloor
    );
    const persVal = evaluateAsymptoticCurve(
      baseline0,
      config.asymptote,
      personalK,
      stepFromStart,
      config.minFloor
    );
    const hybVal =
      i === n - 1
        ? currentValue
        : evaluateAsymptoticCurve(
            baseline0,
            config.asymptote,
            hybridK,
            stepFromStart,
            config.minFloor
          );

    points.push({
      sessionIndex: i + 1,
      label: `#${i + 1}`,
      actual: actualVal,
      generalModel: Math.round(genVal * 10) / 10,
      personalTrend: Math.round(persVal * 10) / 10,
      hybridPrediction: Math.round(hybVal * 10) / 10,
      upperBand: Math.round(hybVal * 10) / 10,
      lowerBand: Math.round(hybVal * 10) / 10,
    });
  }

  // 2. 未来セッション領域（+1 〜 +futureSteps）の推論プロット
  // 現在値 currentValue を起点にして将来を推論
  for (let f = 1; f <= futureSteps; f++) {
    const genFuture = evaluateAsymptoticCurve(
      currentValue,
      config.asymptote,
      generalK,
      f,
      config.minFloor
    );
    const persFuture = evaluateAsymptoticCurve(
      currentValue,
      config.asymptote,
      personalK,
      f,
      config.minFloor
    );
    const hybFuture = evaluateAsymptoticCurve(
      currentValue,
      config.asymptote,
      hybridK,
      f,
      config.minFloor
    );

    // 先に行くほど不確実性バンドが √f に比例して広がる
    const spread = config.bandBaseWidth * Math.sqrt(f / 4);
    const upper = Math.min(config.asymptote, hybFuture + spread);
    const lower = Math.max(config.minFloor, hybFuture - spread);

    points.push({
      sessionIndex: n + f,
      label: `+${f}回`,
      generalModel: Math.round(genFuture * 10) / 10,
      personalTrend: Math.round(persFuture * 10) / 10,
      hybridPrediction: Math.round(hybFuture * 10) / 10,
      upperBand: Math.round(upper * 10) / 10,
      lowerBand: Math.round(lower * 10) / 10,
    });
  }

  const goalValue = goals[metric];
  const isGoalAlreadyMet = currentValue >= goalValue;
  const estimatedSessionsToGoal = solveSessionsToGoal(
    currentValue,
    goalValue,
    config.asymptote,
    hybridK
  );
  const generalSessionsToGoal = solveSessionsToGoal(
    currentValue,
    goalValue,
    config.asymptote,
    generalK
  );

  const projectedPlus10 = Math.round(
    evaluateAsymptoticCurve(
      currentValue,
      config.asymptote,
      hybridK,
      10,
      config.minFloor
    ) * 10
  ) / 10;

  return {
    metric,
    currentValue: Math.round(currentValue * 10) / 10,
    goalValue,
    isGoalAlreadyMet,
    estimatedSessionsToGoal,
    generalSessionsToGoal,
    paceRatioVsGeneral,
    personalWeight: Math.round(personalWeight * 100) / 100,
    generalWeight: Math.round(generalWeight * 100) / 100,
    projectedPlus10,
    points,
  };
}
