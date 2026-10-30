# typing-app

フロントエンドに React + Vite + TypeScript、デスクトップ基盤に Tauri v2 (Rust) を採用したタイピング学習アプリケーションです。

---

## 1. セットアップと起動方法

プロジェクトルート（一番上のディレクトリ）から `./setup.sh` と `just` を使用して、簡単に環境構築とアプリ起動が行えます。

### ① 初回環境構築（依存ツールの自動導入）

リポジトリルートで以下のコマンドを実行すると、動作に必要なツール（Rust/Cargo, Node.js, pnpm, just, および Tauri 動作に必要な OS パッケージ）の有無を自動チェックし、不足しているものだけをインストールします。

```bash
./setup.sh
```

※すでにインストール済みのツールは自動的にスキップされます。

---

### ② アプリの起動・操作 (just)

環境構築後は、すべてリポジトリルートから `just` コマンドで操作できます。

#### Web ブラウザ版で起動（軽量・高速なフロントエンド開発）
デスクトップアプリを立ち上げずに、ブラウザ上で UI やタイピングロジックを確認できます。
```bash
just dev
```
起動後、ターミナルに表示される URL（通常は `http://localhost:1420/`）にブラウザでアクセスします。

#### デスクトップアプリ版で起動 (Tauri)
Rust バックエンドを含めたネイティブデスクトップウィンドウとして起動します。
```bash
just dev-desktop
```
※ `just dev-tauri` でも同様に起動できます。

---

### ③ 主な just コマンド一覧

リポジトリルートで `just` を実行すると、利用可能なコマンド一覧が表示されます。

| コマンド | 説明 |
|---|---|
| `just` | 利用可能なコマンド一覧と説明を表示（デフォルト） |
| `just setup` | 動作に必要な依存ツール（Rust, Node.js, pnpm, just 等）を一括導入 |
| `just doctor` | 必要な開発ツールのインストール状況を診断・表示 |
| `just install` | アプリの依存パッケージをインストール（`pnpm install`） |
| `just dev` | Webブラウザ向けにローカル開発サーバーを起動（`pnpm dev`） |
| `just dev-desktop` | デスクトップアプリとしてローカル開発起動（`pnpm tauri dev`） |
| `just build` | Webフロントエンドをビルド（`tsc && vite build`） |
| `just build-tauri` | Tauri デスクトップアプリをビルド（`pnpm tauri build --no-bundle`） |
| `just build-all` | フロントエンドと Tauri の両方を一括ビルド |
| `just clean` | ビルド成果物（`dist/`, `target/`）や `node_modules` のクリーンアップ |

---

## 2. オフライン環境での利用について

### オフライン時のフォントの挙動とローカル同梱手順
現在 `toeic-typing-app/index.html` にて Google Fonts (`https://fonts.googleapis.com/...`) を読み込む指定があります。

- **未対応時の挙動**:
  - インターネット未接続の環境では Google Fonts へのリクエストがタイムアウトまたはスキップされ、OS のシステム標準等幅フォント（Courier, monospace など）に自動的にフォールバックされます。
  - アプリの起動やタイピング機能自体が停止・エラーになることはありませんが、フォントの字形や文字幅の見た目が変わる可能性があります。

- **完全オフライン対応の手順（フォントのローカル同梱）**:
  オフライン環境でも同一のフォント（JetBrains Mono, Fira Code, Noto Sans JP など）を確実に表示させたい場合は、以下の手順でローカルアセットとして同梱します。

  1. **フォントファイルの配置**:
     `.woff2` や `.ttf` などのフォントファイルを `toeic-typing-app/public/fonts/` ディレクトリに保存します。
     ```text
     toeic-typing-app/
     └── public/
         └── fonts/
             ├── JetBrainsMono-Regular.woff2
             └── NotoSansJP-Regular.woff2
     ```
  2. **CSSでの `@font-face` 定義**:
     `toeic-typing-app/src/App.css` または専用の CSS にフォント定義を記述します。
     ```css
     @font-face {
       font-family: 'JetBrains Mono';
       src: url('/fonts/JetBrainsMono-Regular.woff2') format('woff2');
       font-weight: 400;
       font-style: normal;
       font-display: swap;
     }
     ```
  3. **`index.html` からの外部CDNリンク削除**:
     `toeic-typing-app/index.html` 内の `<link rel="preconnect" ...>` および Google Fonts の `<link href="https://fonts.googleapis.com/..." ...>` の行を削除します。

これにより、アプリの配布パッケージ内にフォントファイル自体が埋め込まれ、一切の外部通信なしで意図したフォントが描画されます。

---

## 3. 商標・権利表記およびライセンス (Licenses & Rights)

### 商標および免責事項 (Trademark Notice & Disclaimer)
- **TOEIC® 商標**:
  TOEIC is a registered trademark of Educational Testing Service (ETS) in the United States and other countries.
- **免責事項**:
  本アプリケーションおよび収録されている学習用コンテンツは、個人の英語学習・開発検証を目的とした非公式の独立プロジェクトであり、Educational Testing Service (ETS) による検討、公認、推奨、または承認を受けたものではありません。

---

### フォントの権利表記・ライセンス (Fonts)
本アプリケーションで指定・使用しているフォントは、各配布元のオープンソースライセンスに準拠しています。

| フォント名 | 権利者 / 配布元 | ライセンス | 概要・許諾条件 |
|---|---|---|---|
| **JetBrains Mono** | JetBrains s.r.o. | [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0) | 商用・非商用問わず無償利用、改変、再配布可能 |
| **Noto Sans JP** | Google LLC | [SIL Open Font License 1.1 (OFL)](https://openfontlicense.org/) | Webフォント/アプリ同梱を含め無償利用、バンドル可能 |
| **Fira Code** | Nikita Prokopov | [SIL Open Font License 1.1 (OFL)](https://openfontlicense.org/) | 等幅プログラミングフォントとしての無償利用・再配布可能 |

---

### 主要オープンソースソフトウェアのライセンス (Third-Party OSS)

本プロジェクトのビルドおよび実行には、以下のオープンソースライブラリ・フレームワークを利用しています。

| ソフトウェア / ライブラリ | 権利者 | ライセンス |
|---|---|---|
| **Tauri (v2)** | The Tauri Programme in The Commons Conservancy | MIT License / Apache License 2.0 |
| **React / React DOM** | Meta Platforms, Inc. and affiliates | MIT License |
| **Vite** | Yuxi (Evan) You & Vite Contributors | MIT License |
| **TypeScript** | Microsoft Corporation | Apache License 2.0 |

---

### 本プロジェクトのライセンス (License)

本リポジトリ内のソースコードは、[MIT License](https://opensource.org/licenses/MIT) の下で公開・提供されています。

## 免責事項 / Disclaimer

### 日本語
- **商標について**: TOEIC is a registered trademark of ETS. 本プロジェクトは個人が独自に開発した非公式の学習ツールであり、Educational Testing Service（ETS）および一般財団法人 国際ビジネスコミュニケーション協会（IIBC）による承認、後援、その他の提携関係はありません。
- **コンテンツの権利について**: 本リポジトリには、公式問題集や市販の参考書などの著作権を侵害するテキスト・音声データは一切含まれていません。学習用データは自作の例文、またはパブリックドメイン・オープンライセンスのデータのみを使用（またはユーザー自身によるインポートを想定）しています。
- **責任の制限**: 本ソフトウェアの利用によって生じた直接的・間接的な損害について、開発者は一切の責任を負いません。

---

### English
- **Trademark Notice**: TOEIC is a registered trademark of ETS. This project is an independent, unofficial study tool and is not endorsed, sponsored, or affiliated with Educational Testing Service (ETS) or IIBC.
- **Copyrighted Materials**: This repository does not contain any copyrighted materials, including questions, texts, or audio from official test materials or commercial textbooks. All practice contents are either original, public domain/open-licensed, or imported directly by the user.
- **Limitation of Liability**: The software is provided "as is", without warranty of any kind. The author shall not be held liable for any damages or issues arising from the use of this software.
