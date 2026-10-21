# 最新の安定版Rustを使用する
FROM rust:latest

# フォーマットと静的解析ツールをイメージに組み込んでおく
RUN rustup component add rustfmt clippy

# Node.js (v20) のインストール
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# TauriとSQLiteに必要なLinuxシステム依存パッケージ
RUN apt-get update && apt-get install -y \
    libwebkit2gtk-4.1-dev \
    build-essential \
    curl \
    wget \
    file \
    libxdo-dev \
    libssl-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
