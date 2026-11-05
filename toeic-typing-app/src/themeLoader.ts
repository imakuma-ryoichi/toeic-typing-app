/**
 * config/theme.yaml からテーマ設定・文字色・フォントを読み込み、
 * CSSカスタムプロパティ（CSS変数）としてDOMに動的注入するモジュール
 */
import rawConfig from "@config/theme.yaml";

export interface ThemeColors {
  ui: {
    bgApp: string;
    bgCard: string;
    borderSubtle: string;
    textPrimary: string;
    textMuted: string;
  };
  ribbon: {
    border: string;
    hover: string;
    activeBg: string;
  };
  typing: {
    caret: string;
    targetBg: string;
    correct: string;
    onceMissed: string;
    incorrect: string;
  };
  spaces: {
    markerColor: string;
    missedBg: string;
    missedBorder: string;
    incorrectBg: string;
    incorrectColor: string;
  };
  charts?: {
    wpm: string;
    firstTryAccuracy: string;
    normalAccuracy: string;
  };
}

export interface AppThemeConfig {
  typography: {
    fonts: {
      sans: string;
      mono: string;
    };
    typing: {
      fontSize: string;
      letterSpacing: string;
      minWidth: string;
      spaceMinWidth: string;
    };
  };
  themes: {
    light: ThemeColors;
    slate: ThemeColors;
    [themeName: string]: ThemeColors;
  };
}

export const themeConfig = rawConfig as AppThemeConfig;

/**
 * テーマ設定オブジェクトを CSS 変数ブロック文字列に変換
 */
function buildThemeCss(config: AppThemeConfig): string {
  const { typography, themes } = config;
  const light = themes.light;
  const slate = themes.slate;

  let css = `
/* ==========================================================================
   Generated automatically from config/theme.yaml
   ========================================================================== */

:root {
  /* Typography */
  --font-sans: ${typography.fonts.sans};
  --font-mono: ${typography.fonts.mono};
  --typing-char-font-size: ${typography.typing.fontSize};
  --typing-char-letter-spacing: ${typography.typing.letterSpacing};
  --typing-char-min-width: ${typography.typing.minWidth};
  --typing-space-min-width: ${typography.typing.spaceMinWidth};

  /* Light Theme (Paper) */
  --bg-app: ${light.ui.bgApp};
  --bg-card: ${light.ui.bgCard};
  --border-subtle: ${light.ui.borderSubtle};
  --text-primary: ${light.ui.textPrimary};
  --text-muted: ${light.ui.textMuted};

  --ribbon-border: ${light.ribbon.border};
  --ribbon-hover: ${light.ribbon.hover};
  --ribbon-active-bg: ${light.ribbon.activeBg};

  --char-caret: ${light.typing.caret};
  --char-target-bg: ${light.typing.targetBg};
  --char-correct: ${light.typing.correct};
  --char-once-missed: ${light.typing.onceMissed};
  --char-incorrect: ${light.typing.incorrect};

  --char-space-marker-color: ${light.spaces.markerColor || light.typing.caret};
  --char-space-missed-bg: ${light.spaces.missedBg};
  --char-space-missed-border: ${light.spaces.missedBorder};
  --char-space-incorrect-bg: ${light.spaces.incorrectBg};
  --char-space-incorrect-color: ${light.spaces.incorrectColor};

  /* Charts */
  --chart-wpm: ${light.charts?.wpm || light.typing.caret};
  --chart-first-try: ${light.charts?.firstTryAccuracy || "#F97316"};
  --chart-normal-acc: ${light.charts?.normalAccuracy || "#10B981"};
}
`;

  if (slate) {
    css += `
[data-theme="slate"] {
  /* Slate Theme (Dark) */
  --bg-app: ${slate.ui.bgApp};
  --bg-card: ${slate.ui.bgCard};
  --border-subtle: ${slate.ui.borderSubtle};
  --text-primary: ${slate.ui.textPrimary};
  --text-muted: ${slate.ui.textMuted};

  --ribbon-border: ${slate.ribbon.border};
  --ribbon-hover: ${slate.ribbon.hover};
  --ribbon-active-bg: ${slate.ribbon.activeBg};

  --char-caret: ${slate.typing.caret};
  --char-target-bg: ${slate.typing.targetBg};
  --char-correct: ${slate.typing.correct};
  --char-once-missed: ${slate.typing.onceMissed};
  --char-incorrect: ${slate.typing.incorrect};

  --char-space-marker-color: ${slate.spaces.markerColor || slate.typing.caret};
  --char-space-missed-bg: ${slate.spaces.missedBg};
  --char-space-missed-border: ${slate.spaces.missedBorder};
  --char-space-incorrect-bg: ${slate.spaces.incorrectBg};
  --char-space-incorrect-color: ${slate.spaces.incorrectColor};

  /* Charts */
  --chart-wpm: ${slate.charts?.wpm || slate.typing.caret};
  --chart-first-try: ${slate.charts?.firstTryAccuracy || "#F97316"};
  --chart-normal-acc: ${slate.charts?.normalAccuracy || "#10B981"};
}
`;
  }

  return css;
}

const STYLE_TAG_ID = "app-theme-yaml-vars";

/**
 * DOM にスタイルタグを挿入・更新
 */
export function applyThemeConfig(config: AppThemeConfig = themeConfig): void {
  if (typeof document === "undefined") return;

  let styleTag = document.getElementById(STYLE_TAG_ID) as HTMLStyleElement | null;
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = STYLE_TAG_ID;
    document.head.appendChild(styleTag);
  }

  styleTag.textContent = buildThemeCss(config);
}

// 初期化（モジュール読み込み時に自動適用）
applyThemeConfig(themeConfig);

// Vite HMR 対応
if (import.meta.hot) {
  import.meta.hot.accept("@config/theme.yaml", (newModule) => {
    if (newModule && newModule.default) {
      applyThemeConfig(newModule.default as AppThemeConfig);
    }
  });
}
