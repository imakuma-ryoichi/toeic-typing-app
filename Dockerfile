FROM rust:latest

# フォーマット、静的解析、爆速テストランナー(nextest)を導入
RUN rustup component add rustfmt clippy && \
  curl -LsSf https://get.nexte.st/latest/linux | tar zxf - -C /usr/local/bin

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
  apt-get install -y nodejs

# TauriとSQLiteの依存パッケージ ＋ clangとmoldを追加
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
  clang \
  mold \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
