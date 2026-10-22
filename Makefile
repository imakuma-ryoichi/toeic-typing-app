# Variables
APP_DIR   := toeic-typing-app
TAURI_DIR := $(APP_DIR)/src-tauri

.PHONY: dev help ci check lint-ts lint-rust test-rust build-tauri clean

# ------------------------------------------------------------------------------
# 開発起動 (デフォルトターゲット)
# ------------------------------------------------------------------------------
dev: ## デスクトップアプリとしてローカル開発起動
	cd $(APP_DIR) && pnpm tauri dev

# ------------------------------------------------------------------------------
# ヘルプ
# ------------------------------------------------------------------------------
help: ## 利用可能なコマンドの一覧と説明を表示
	@echo "Usage: make [target]"
	@echo ""
	@echo "Available targets:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# ------------------------------------------------------------------------------
# 一括検証 (CI 同等)
# ------------------------------------------------------------------------------
ci: lint-ts lint-rust test-rust build-tauri ## GitHub Actions CI と同等の完全検証 (型チェック, fmt, clippy, テスト, ビルド)

check: ci ## ci のエイリアス

# ------------------------------------------------------------------------------
# 個別検証・ビルド
# ------------------------------------------------------------------------------
lint-ts: ## TypeScript の型チェック (tsc --noEmit)
	cd $(APP_DIR) && pnpm exec tsc --noEmit

lint-rust: ## Rust コードのフォーマット検証 (cargo fmt) と静的解析 (cargo clippy)
	cd $(APP_DIR) && cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
	cd $(APP_DIR) && cargo clippy --manifest-path src-tauri/Cargo.toml

test-rust: ## Rust のユニットテスト実行 (cargo nextest)
	cd $(APP_DIR) && cargo nextest run --manifest-path src-tauri/Cargo.toml --no-tests=pass

build-tauri: ## Tauri アプリのビルド検証 (--no-bundle)
	cd $(APP_DIR) && pnpm tauri build --no-bundle

# ------------------------------------------------------------------------------
# クリーンアップ
# ------------------------------------------------------------------------------
clean: ## target ディレクトリや node_modules などのクリーンアップ
	rm -rf $(APP_DIR)/node_modules
	rm -rf $(TAURI_DIR)/target
	rm -rf $(APP_DIR)/dist
