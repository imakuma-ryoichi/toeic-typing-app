.DEFAULT_GOAL := help
.PHONY: help setup setup-rust setup-node setup-pnpm setup-just setup-sys install doctor

SHELL := /bin/bash
# 直前にインストールされたツールも即座に検知できるよう PATH を明示
export PATH := $(HOME)/.cargo/bin:$(HOME)/.local/bin:/usr/local/bin:$(PATH)

help: ## 利用可能なコマンド一覧を表示
	@echo "利用可能なコマンド:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

setup: setup-sys setup-rust setup-node setup-pnpm setup-just install ## 不足している依存関係をすべて検出して自動インストール
	@echo ""
	@echo "=== セットアップ完了 ==="
	@echo "必要な開発ツールが揃いました。"
	@echo "今後はリポジトリルートから just コマンドで起動できます："
	@echo "  Web版起動          : just dev"
	@echo "  デスクトップ版起動 : just dev-desktop"

setup-sys: ## Linux (Debian/Ubuntu) 向け Tauri 実行に必要なOSパッケージを確認・未導入のみ案内/導入
	@echo ">>> [1/5] OSシステムパッケージの確認..."
	@if command -v apt-get >/dev/null 2>&1; then \
		PKGS="build-essential curl wget file libwebkit2gtk-4.1-dev libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev libsqlite3-dev"; \
		MISSING=""; \
		for pkg in $$PKGS; do \
			if ! dpkg -s "$$pkg" >/dev/null 2>&1; then \
				MISSING="$$MISSING $$pkg"; \
			fi; \
		done; \
		if [ -n "$$MISSING" ]; then \
			if [ "$$(id -u)" -eq 0 ]; then \
				echo "未インストールのOSパッケージを導入します:$$MISSING"; \
				apt-get update && apt-get install -y $$MISSING; \
			elif sudo -n true 2>/dev/null; then \
				echo "sudo でOSパッケージを導入します:$$MISSING"; \
				sudo apt-get update && sudo apt-get install -y $$MISSING; \
			else \
				echo "  [案内] 以下のTauri動作用OSパッケージが未導入です:$$MISSING"; \
				echo "  必要に応じて以下のコマンドを実行してください:"; \
				echo "    sudo apt-get update && sudo apt-get install -y$$MISSING"; \
			fi; \
		else \
			echo "  [OK] 必要なOSパッケージはすべて導入済みです。"; \
		fi; \
	else \
		echo "  [SKIP] apt-get が見つかりませんでした (Debian/Ubuntu 以外のOSでは各OSのTauri要件をご確認ください)。"; \
	fi

setup-rust: ## Rust / Cargo の確認（未導入の場合のみ rustup を実行）
	@echo ">>> [2/5] Rust / Cargo の確認..."
	@if ! command -v cargo >/dev/null 2>&1; then \
		echo "  [未検出] rustup から Rust/Cargo をインストールします..."; \
		curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y; \
		if [ -f "$$HOME/.cargo/env" ]; then source "$$HOME/.cargo/env"; fi; \
	else \
		echo "  [OK] Cargo は既に導入済みです: $$(cargo --version)"; \
	fi

setup-node: ## Node.js の確認（未導入の場合のみ Node.js v20 LTS をインストール）
	@echo ">>> [3/5] Node.js の確認..."
	@if ! command -v node >/dev/null 2>&1; then \
		echo "  [未検出] Node.js (v20 LTS) をインストールします..."; \
		if [ "$$(id -u)" -eq 0 ] || sudo -n true 2>/dev/null; then \
			SUDO=""; \
			if [ "$$(id -u)" -ne 0 ]; then SUDO="sudo"; fi; \
			curl -fsSL https://deb.nodesource.com/setup_20.x | $$SUDO bash - && \
			$$SUDO apt-get install -y nodejs; \
		else \
			echo "  [案内] Node.js のインストールには管理者権限が必要です。以下を実行してください:"; \
			echo "    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash - && sudo apt-get install -y nodejs"; \
		fi; \
	else \
		echo "  [OK] Node.js は既に導入済みです: $$(node --version)"; \
	fi

setup-pnpm: ## pnpm の確認（未導入の場合のみインストール）
	@echo ">>> [4/5] pnpm の確認..."
	@if ! command -v pnpm >/dev/null 2>&1; then \
		echo "  [未検出] pnpm をインストールします..."; \
		if command -v corepack >/dev/null 2>&1; then \
			corepack enable && corepack prepare pnpm@latest --activate; \
		elif command -v npm >/dev/null 2>&1; then \
			npm install -g pnpm; \
		else \
			curl -fsSL https://get.pnpm.io/install.sh | sh -; \
		fi; \
	else \
		echo "  [OK] pnpm は既に導入済みです: $$(pnpm --version)"; \
	fi

setup-just: ## just の確認（未導入の場合のみインストール）
	@echo ">>> [5/5] just コマンドランナーの確認..."
	@if ! command -v just >/dev/null 2>&1; then \
		echo "  [未検出] just をインストールします..."; \
		DEST_DIR="/usr/local/bin"; \
		if [ ! -w "$$DEST_DIR" ] && [ "$$(id -u)" -ne 0 ]; then \
			DEST_DIR="$$HOME/.cargo/bin"; \
			mkdir -p "$$DEST_DIR"; \
		fi; \
		curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to "$$DEST_DIR"; \
	else \
		echo "  [OK] just は既に導入済みです: $$(just --version)"; \
	fi

install: ## アプリのフロントエンド依存パッケージ (pnpm install) の確認・導入
	@echo ">>> アプリ依存パッケージの確認 (pnpm install)..."
	@if [ -d "toeic-typing-app/node_modules" ]; then \
		echo "  [OK] node_modules は導入済みです。"; \
	else \
		echo "  [未検出] pnpm install を実行します..."; \
		if command -v just >/dev/null 2>&1; then \
			just install; \
		else \
			cd toeic-typing-app && pnpm install; \
		fi; \
	fi

doctor: ## 必要なツール (cargo, node, pnpm, just) の導入状況を一覧表示
	@echo "=== 依存ツールの導入状況チェック ==="
	@for tool in cargo node pnpm just; do \
		if command -v $$tool >/dev/null 2>&1; then \
			printf "  \033[32m[OK]\033[0m %-8s : %s\n" "$$tool" "$$($$tool --version 2>&1 | head -n 1)"; \
		else \
			printf "  \033[31m[NG]\033[0m %-8s : 未インストール (make setup で導入可能)\n" "$$tool"; \
		fi; \
	done
