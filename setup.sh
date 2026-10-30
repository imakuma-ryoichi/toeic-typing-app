#!/usr/bin/env bash
set -euo pipefail

# PATHの設定（直前に導入されたバイナリも検知可能にする）
export PATH="${HOME}/.cargo/bin:${HOME}/.local/bin:${HOME}/.local/share/pnpm:/usr/local/bin:${PATH}"

echo "=== 開発環境セットアップ開始 ==="

# 1. OSパッケージの確認 (Debian/Ubuntu)
echo ">>> [1/6] OSシステムパッケージの確認..."
if command -v apt-get >/dev/null 2>&1; then
    PKGS="build-essential curl wget file libwebkit2gtk-4.1-dev libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev libsqlite3-dev"
    MISSING=""
    for pkg in $PKGS; do
        if ! dpkg -s "$pkg" >/dev/null 2>&1; then
            MISSING="${MISSING} ${pkg}"
        fi
    done
    if [ -n "$MISSING" ]; then
        if [ "$(id -u)" -eq 0 ]; then
            echo "未インストールのOSパッケージを導入します:${MISSING}"
            apt-get update && apt-get install -y $MISSING
        elif sudo -n true 2>/dev/null; then
            echo "sudo でOSパッケージを導入します:${MISSING}"
            sudo apt-get update && sudo apt-get install -y $MISSING
        else
            echo "  [案内] 以下のOSパッケージが未導入です:${MISSING}"
            echo "  必要に応じて実行してください: sudo apt-get update && sudo apt-get install -y${MISSING}"
        fi
    else
        echo "  [OK] 必要なOSパッケージは導入済みです。"
    fi
else
    echo "  [SKIP] apt-get が見つかりませんでした。"
fi

# 2. Rust / Cargo
echo ">>> [2/6] Rust / Cargo の確認..."
if ! command -v cargo >/dev/null 2>&1; then
    echo "  [未検出] rustup から Rust/Cargo をインストールします..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    if [ -f "$HOME/.cargo/env" ]; then
        # shellcheck source=/dev/null
        source "$HOME/.cargo/env"
    fi
else
    echo "  [OK] Cargo は既に導入済みです: $(cargo --version)"
fi

# 3. Node.js
echo ">>> [3/6] Node.js の確認..."
if ! command -v node >/dev/null 2>&1; then
    echo "  [未検出] Node.js (v20 LTS) をインストールします..."
    if [ "$(id -u)" -eq 0 ] || sudo -n true 2>/dev/null; then
        SUDO=""
        if [ "$(id -u)" -ne 0 ]; then SUDO="sudo"; fi
        curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO bash -
        $SUDO apt-get install -y nodejs
    else
        echo "  [案内] Node.js のインストールには管理者権限が必要です。"
    fi
else
    echo "  [OK] Node.js は既に導入済みです: $(node --version)"
fi

# 4. pnpm
echo ">>> [4/6] pnpm の確認..."
if ! command -v pnpm >/dev/null 2>&1; then
    echo "  [未検出] pnpm をインストールします..."
    mkdir -p "$HOME/.local/bin"
    if command -v corepack >/dev/null 2>&1 && corepack enable --install-directory "$HOME/.local/bin" pnpm 2>/dev/null; then
        echo "  [OK] corepack を通じて pnpm を有効化しました。"
    elif command -v npm >/dev/null 2>&1 && [ "$(id -u)" -eq 0 ]; then
        npm install -g pnpm
    else
        curl -fsSL https://get.pnpm.io/install.sh | SHELL=bash sh -
    fi
else
    echo "  [OK] pnpm は既に導入済みです: $(pnpm --version)"
fi

# 5. just
echo ">>> [5/6] just の確認..."
if ! command -v just >/dev/null 2>&1; then
    echo "  [未検出] just をインストールします..."
    DEST_DIR="/usr/local/bin"
    if [ ! -w "$DEST_DIR" ] && [ "$(id -u)" -ne 0 ]; then
        DEST_DIR="$HOME/.cargo/bin"
        mkdir -p "$DEST_DIR"
    fi
    curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to "$DEST_DIR"
else
    echo "  [OK] just は既に導入済みです: $(just --version)"
fi

# 6. アプリフロントエンド依存 (pnpm install)
echo ">>> [6/6] アプリ依存パッケージの確認 (pnpm install)..."
if [ -d "toeic-typing-app/node_modules" ]; then
    echo "  [OK] node_modules は導入済みです。"
else
    echo "  [未検出] pnpm install を実行します..."
    (cd toeic-typing-app && pnpm install)
fi

echo ""
echo "=== セットアップ完了 ==="
echo "今後はリポジトリルートから以下のコマンドで起動できます:"
echo "  Web版起動          : just dev"
echo "  デスクトップ版起動 : just dev-desktop"
