#!/usr/bin/env bash
# ==============================================================================
# GitHub Actions セルフホストランナー セットアップ (Fedora 向け)
#
# 家の PC (Fedora) で実行してください。sudo 権限と `gh auth login` 済みが前提です。
#   $ gh auth login
#   $ bash scripts/setup-self-hosted-runner.sh
#
# 実行内容:
#   1. Docker CE のインストールと起動 (backend ジョブの `container:` 実行に必須)
#   2. ランナー専用ユーザー (既定: gha-runner) の作成
#   3. actions/runner の最新版を /opt/actions-runner に展開
#   4. リポジトリへラベル `mypc` 付きで登録し、systemd サービスとして常駐
# ==============================================================================
set -euo pipefail

REPO="${REPO:-imakuma-ryoichi/toeic-typing-app}"
RUNNER_USER="${RUNNER_USER:-gha-runner}"
RUNNER_DIR="${RUNNER_DIR:-/opt/actions-runner}"
RUNNER_NAME="${RUNNER_NAME:-$(hostname)}"
RUNNER_LABELS="${RUNNER_LABELS:-mypc}"

log() { printf '\033[36m==> %s\033[0m\n' "$*"; }

command -v gh >/dev/null || { echo "gh が必要です: sudo dnf install -y gh && gh auth login"; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "gh auth login を先に実行してください"; exit 1; }

# ------------------------------------------------------------------------------
# 1. Docker CE
# ------------------------------------------------------------------------------
if ! command -v docker >/dev/null || docker --version 2>/dev/null | grep -qi podman; then
  log "Docker CE をインストール"
  sudo dnf -y install dnf-plugins-core
  # dnf5 (Fedora 41+) と dnf4 の両方に対応
  sudo dnf config-manager addrepo --from-repofile=https://download.docker.com/linux/fedora/docker-ce.repo 2>/dev/null \
    || sudo dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo
  sudo dnf -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin
fi
sudo systemctl enable --now docker

# ------------------------------------------------------------------------------
# 2. ランナー専用ユーザー
# ------------------------------------------------------------------------------
if ! id "$RUNNER_USER" >/dev/null 2>&1; then
  log "ユーザー $RUNNER_USER を作成"
  sudo useradd --create-home --shell /bin/bash "$RUNNER_USER"
fi
sudo usermod -aG docker "$RUNNER_USER"

# ------------------------------------------------------------------------------
# 3. actions/runner のダウンロード
# ------------------------------------------------------------------------------
case "$(uname -m)" in
  x86_64) ARCH=x64 ;;
  aarch64) ARCH=arm64 ;;
  *) echo "未対応のアーキテクチャ: $(uname -m)"; exit 1 ;;
esac

if [ ! -x "$RUNNER_DIR/config.sh" ]; then
  VERSION="$(gh api repos/actions/runner/releases/latest --jq .tag_name | sed 's/^v//')"
  log "actions/runner v$VERSION を $RUNNER_DIR に展開"
  TMP="$(mktemp)"
  curl -fsSL -o "$TMP" "https://github.com/actions/runner/releases/download/v${VERSION}/actions-runner-linux-${ARCH}-${VERSION}.tar.gz"
  sudo mkdir -p "$RUNNER_DIR"
  sudo tar xzf "$TMP" -C "$RUNNER_DIR"
  rm -f "$TMP"
  sudo chown -R "$RUNNER_USER:$RUNNER_USER" "$RUNNER_DIR"
  sudo "$RUNNER_DIR/bin/installdependencies.sh"
fi
# SELinux: systemd から実行できるようにラベルを整える
command -v restorecon >/dev/null && sudo restorecon -R "$RUNNER_DIR" || true

# ------------------------------------------------------------------------------
# 4. 登録とサービス化
# ------------------------------------------------------------------------------
if [ ! -f "$RUNNER_DIR/.runner" ]; then
  log "ランナーを $REPO に登録 (name=$RUNNER_NAME, labels=$RUNNER_LABELS)"
  TOKEN="$(gh api -X POST "repos/$REPO/actions/runners/registration-token" --jq .token)"
  sudo -u "$RUNNER_USER" bash -c "cd '$RUNNER_DIR' && ./config.sh --unattended \
    --url 'https://github.com/$REPO' --token '$TOKEN' \
    --name '$RUNNER_NAME' --labels '$RUNNER_LABELS' --work _work --replace"
fi

log "systemd サービスとして起動"
cd "$RUNNER_DIR"
sudo ./svc.sh status >/dev/null 2>&1 && sudo ./svc.sh status | grep -q 'active (running)' || {
  sudo ./svc.sh install "$RUNNER_USER" || true
  sudo ./svc.sh start
}
sudo ./svc.sh status | head -n 5

cat <<EOF

完了しました。最後に GitHub 側で以下を設定してください:
  gh variable set USE_SELF_HOSTED --body true --repo $REPO
  (PC を止めるときは: gh variable set USE_SELF_HOSTED --body false --repo $REPO)
EOF
