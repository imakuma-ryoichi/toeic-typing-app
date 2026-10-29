# Variables
app_dir := "toeic-typing-app"
tauri_dir := app_dir / "src-tauri"

# デフォルトターゲット: 利用可能なコマンド一覧を表示
default:
    @just --list

# ------------------------------------------------------------------------------
# 初期環境構築
# ------------------------------------------------------------------------------

# 動作に必要な依存関係（OSライブラリ, Rust/Cargo, Node.js, pnpm, just）を一括導入
setup:
    make setup

# 必要な依存ツール（cargo, just, node, pnpm）の導入状況を確認
doctor:
    make doctor

# ------------------------------------------------------------------------------
# 開発起動
# ------------------------------------------------------------------------------

# Webブラウザ向けにローカル開発サーバーを起動 (Vite)
dev:
    cd {{app_dir}} && pnpm dev

# デスクトップアプリとしてローカル開発起動 (Tauri)
dev-desktop:
    cd {{app_dir}} && pnpm tauri dev

alias dev-tauri := dev-desktop

# ------------------------------------------------------------------------------
# ビルド
# ------------------------------------------------------------------------------

# Webフロントエンドをビルド (tsc && vite build)
build:
    cd {{app_dir}} && pnpm build

# Tauri デスクトップアプリをビルド (--no-bundle)
build-tauri:
    cd {{app_dir}} && pnpm tauri build --no-bundle

# フロントエンドとTauri両方をビルド
build-all: build build-tauri

# ------------------------------------------------------------------------------
# 静的解析・テスト・CI検証
# ------------------------------------------------------------------------------

# 全ての静的解析 (TypeScript型チェック + Rust fmt & clippy)
lint: lint-ts lint-rust

# TypeScript の型チェック (tsc --noEmit)
lint-ts:
    cd {{app_dir}} && pnpm exec tsc --noEmit

# Rust コードのフォーマット検証と静的解析 (cargo fmt & clippy)
lint-rust:
    cd {{tauri_dir}} && cargo fmt -- --check
    cd {{tauri_dir}} && cargo clippy -- -D warnings

# Rust のユニットテスト実行 (cargo nextest)
test:
    cd {{tauri_dir}} && cargo nextest run --no-tests=pass

alias test-rust := test

# CI と同等の完全検証 (型チェック, fmt, clippy, テスト, ビルド)
check: lint test build-tauri

alias ci := check

# ------------------------------------------------------------------------------
# 依存関係
# ------------------------------------------------------------------------------

# 依存パッケージのインストール (pnpm install)
install:
    cd {{app_dir}} && pnpm install

# ------------------------------------------------------------------------------
# クリーンアップ
# ------------------------------------------------------------------------------

# ビルド成果物 (dist, target) や node_modules の削除
clean:
    rm -rf {{app_dir}}/node_modules
    rm -rf {{tauri_dir}}/target
    rm -rf {{app_dir}}/dist
