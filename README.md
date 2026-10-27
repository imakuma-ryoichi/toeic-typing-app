# typing-app

フロントエンドに React + Vite + TypeScript、デスクトップ基盤に Tauri v2 (Rust) を採用しています。

---

## 開発フロー (justfile)

プロジェクトルート直下で [just](https://github.com/casey/just) を使用することで、最小限のキータッチでローカル起動や各種検証・ビルドを実行できます。

- **コマンド一覧の確認**: `just` または `just -l`
- **フロントエンドのビルド**: `just build`
- **Webローカル開発起動**: `just dev`
- **デスクトップアプリ起動**: `just dev-desktop`
- **コミット・プッシュ前のローカル検証**: `just ci` (または `just check`)

### 主なコマンド一覧

| コマンド | 説明 |
|---|---|
| `just` | 利用可能なコマンドの一覧と説明をターミナルに表示（デフォルト） |
| `just dev` | Webブラウザ向けに高速ローカル開発起動（`cd toeic-typing-app && pnpm dev`） |
| `just dev-desktop` | デスクトップアプリとしてローカル開発起動（`cd toeic-typing-app && pnpm tauri dev`） |
| `just build` | Webフロントエンドをビルド（`tsc && vite build`） |
| `just build-tauri` | Tauri アプリのビルド検証（`pnpm tauri build --no-bundle`） |
| `just build-all` | フロントエンドとTauri両方をビルド |
| `just lint` | TypeScript型チェック + Rust fmt & clippy を一括実行 |
| `just lint-ts` | TypeScript の型チェック（`tsc --noEmit`） |
| `just lint-rust` | Rust のコードフォーマット検証（`cargo fmt`）および静的解析（`cargo clippy`） |
| `just test` | Rust のユニットテスト実行（`cargo nextest run --no-tests=pass`） |
| `just ci` / `just check` | GitHub Actions CI と同等の完全検証を一括実行 |
| `just clean` | ビルド成果物（`target/`, `dist/`）や `node_modules` のクリーンアップ |

---

## 1. ローカルでの動作確認方法 (pnpm)

### 前提条件
- **Node.js**: v20以上推奨
- **pnpm**: v9以上推奨（`corepack enable && corepack prepare pnpm@latest --activate` などで導入可能）
- **Rust**: 最新の Stable toolchain（`rustup` 経由）
- **OS固有の依存パッケージ（Tauri実行時）**:
  - **Linux**: `libwebkit2gtk-4.1-dev`, `build-essential`, `curl`, `wget`, `file`, `libxdo-dev`, `libssl-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev` 等
  - **macOS / Windows**: 各OSの標準要件（詳細は [Tauri公式ドキュメント](https://v2.tauri.app/start/prerequisites/) を参照）

---

### 手順

アプリケーションのソースコードは `toeic-typing-app/` ディレクトリ配下にあります。まずは該当ディレクトリに移動します。

```bash
cd toeic-typing-app
```

#### ① 依存パッケージのインストール
```bash
pnpm install
```

#### ② ブラウザ上でのUI確認（軽量・高速なフロント開発）
デスクトップアプリを立ち上げずに、ブラウザ上でUIやタイピングロジックの動作を確認できます。
```bash
pnpm dev
```
起動後、ターミナルに表示されるURL（通常は `http://localhost:1420/`）にブラウザでアクセスします。

#### ③ Tauriデスクトップアプリとしての起動・確認
Rustバックエンドを含めたネイティブデスクトップウィンドウとして動作確認を行います。
```bash
pnpm tauri dev
```
初回起動時はRustクレートのコンパイルが行われるため数分かかりますが、以降はキャッシュにより高速に再ビルド・ホットリロードされます。

#### ④ 型チェックおよびビルドの検証
```bash
# TypeScriptの型チェック + フロントエンドビルド検証
pnpm build

# Tauriデスクトップアプリのビルド（インストーラ/実行可能バイナリの生成）
pnpm tauri build
```

---

## 2. CIにおけるビルド高速化 (Rustリンカー: mold)

GitHub ActionsのCI環境（`.github/workflows/ci.yml` および `Dockerfile`）では、Rustのビルド時間を大幅に短縮するために **高速リンカー `mold`**（および `clang`）を採用しています。

- **仕組み**:
  RustのLinux向けビルドではデフォルトの `ld` や `lld` よりも高速な `mold` をリンカーとして指定することで、特に依存関係が多いTauriアプリのリンク工程にかかる時間を大幅に削減しています。
- **CIでの導入**:
  ベースイメージ（Dockerfile）で `clang` と `mold` をインストールし、CIビルドを高速化しています。
- **ローカル（Linux環境）での利用**:
  Linux環境でローカルでも同様に `mold` を使用してビルドを高速化したい場合は、システムに `clang` と `mold` をインストールした上で、`src-tauri/.cargo/config.toml` に以下の設定を配置します：

  ```toml
  [target.x86_64-unknown-linux-gnu]
  linker = "clang"
  rustflags = ["-C", "link-arg=-fuse-ld=mold"]
  ```

---


### オフライン時のフォントの挙動とローカル同梱手順
現在 `toeic-typing-app/index.html` にて Google Fonts (`https://fonts.googleapis.com/...`) を読み込む指定があります。

- **未対応時の挙動**:
  - インターネット未接続の環境では Google Fonts へのリクエストがタイムアウトまたはスキップされ、OSのシステム標準等幅フォント（Courier, monospace など）に自動的にフォールバックされます。
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

これにより、アプリの配布パッケージ（インストーラ/バイナリ）内にフォントファイル自体が埋め込まれ、一切の外部通信なしで意図したフォントが描画されます。

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

