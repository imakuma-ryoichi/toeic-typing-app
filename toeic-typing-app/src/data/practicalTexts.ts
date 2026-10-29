export type TypingGenre = "toeic" | "linux";
export type TypingTabMode = "func1" | "func2" | "func3" | "func4";

export interface PracticalSentence {
  text: string;
  translation: string;
}

export interface PracticalText {
  id: string;
  genre: TypingGenre;
  tabMode: TypingTabMode;
  title: string;
  category: string;
  description: string;
  sentences: PracticalSentence[];
}

export const PRACTICAL_TEXTS: PracticalText[] = [
  // ==========================================================================
  // TOEIC ジャンル - 機能1: 日本語（ローマ字ストリーム）
  // ==========================================================================
  {
    id: "toeic-f1-1",
    genre: "toeic",
    tabMode: "func1",
    title: "ビジネスメールの基本挨拶",
    category: "TOEIC / 日本語タイピング",
    description: "日常業務の連絡や資料送付で頻出する日本語フレーズ（ローマ字入力・揺れ対応）",
    sentences: [
      {
        text: "いつもおせわになっております。",
        translation: "いつもお世話になっております。",
      },
      {
        text: "ほんじつのかいぎのしりょうをてんぷいたします。",
        translation: "本日の会議の資料を添付いたします。",
      },
      {
        text: "ごかくにんのほどよろしくおねがいいたします。",
        translation: "ご確認のほどよろしくお願いいたします。",
      },
      {
        text: "ごへんしんをおまちしております。",
        translation: "ご返信をお待ちしております。",
      },
    ],
  },
  {
    id: "toeic-f1-2",
    genre: "toeic",
    tabMode: "func1",
    title: "プロジェクト進捗・スケジュール連絡",
    category: "TOEIC / 日本語タイピング",
    description: "プロジェクトの進行状況や日程調整に関する日本語フレーズ",
    sentences: [
      {
        text: "ぷろじぇくとはよていどおりにしんこうしております。",
        translation: "プロジェクトは予定通りに進行しております。",
      },
      {
        text: "らいげつのてんじかいにむけてじゅんびをすすめています。",
        translation: "来月の展示会に向けて準備を進めています。",
      },
      {
        text: "きんようびまでにさいしゅうほうこくしょをていしゅつします。",
        translation: "金曜日までに最終報告書を提出します。",
      },
    ],
  },
  {
    id: "toeic-f1-3",
    genre: "toeic",
    tabMode: "func1",
    title: "顧客対応・問い合わせ回答",
    category: "TOEIC / 日本語タイピング",
    description: "カスタマーサポートや発送案内に関する日本語フレーズ",
    sentences: [
      {
        text: "おといあわせいただきまことにありがとうございます。",
        translation: "お問い合わせいただき誠にありがとうございます。",
      },
      {
        text: "だいたいひんのはっそうてつづきをすすめております。",
        translation: "代替品の発送手続きを進めております。",
      },
      {
        text: "ふめいなてんがございましたらおしらせください。",
        translation: "不明な点がございましたらお知らせください。",
      },
    ],
  },

  // ==========================================================================
  // TOEIC ジャンル - 機能2: 単語 (Core Vocabulary)
  // ==========================================================================
  {
    id: "toeic-f2-1",
    genre: "toeic",
    tabMode: "func2",
    title: "会議・スケジュール頻出単語",
    category: "TOEIC / 単語",
    description: "日程調整や社内会議で頻出する重要ビジネス英単語",
    sentences: [
      { text: "schedule", translation: "schedule（予定・スケジュールを組む）" },
      { text: "postpone", translation: "postpone（延期する）" },
      { text: "confirm", translation: "confirm（確認する・確定する）" },
      { text: "agenda", translation: "agenda（議題・協議事項）" },
      { text: "attendee", translation: "attendee（出席者・参加者）" },
      { text: "mandatory", translation: "mandatory（義務的な・必須の）" },
      { text: "venue", translation: "venue（開催地・会場）" },
    ],
  },
  {
    id: "toeic-f2-2",
    genre: "toeic",
    tabMode: "func2",
    title: "契約・財務・業績頻出単語",
    category: "TOEIC / 単語",
    description: "見積もり・請求・四半期業績レポートで頻出する英単語",
    sentences: [
      { text: "contract", translation: "contract（契約・契約書）" },
      { text: "negotiation", translation: "negotiation（交渉・折衝）" },
      { text: "invoice", translation: "invoice（請求書・送り状）" },
      { text: "reimbursement", translation: "reimbursement（払い戻し・精算）" },
      { text: "estimate", translation: "estimate（見積もり・見積もる）" },
      { text: "quarterly", translation: "quarterly（四半期ごとの）" },
      { text: "revenue", translation: "revenue（収益・歳入）" },
    ],
  },
  {
    id: "toeic-f2-3",
    genre: "toeic",
    tabMode: "func2",
    title: "物流・顧客サポート頻出単語",
    category: "TOEIC / 単語",
    description: "商品の配送・在庫管理・問い合わせ対応に関する重要単語",
    sentences: [
      { text: "shipment", translation: "shipment（発送・出荷品）" },
      { text: "inventory", translation: "inventory（在庫・棚卸し）" },
      { text: "replacement", translation: "replacement（代替品・交換）" },
      { text: "warranty", translation: "warranty（保証・保証書）" },
      { text: "defective", translation: "defective（欠陥のある・不良の）" },
      { text: "warehouse", translation: "warehouse（倉庫・貯蔵所）" },
      { text: "inquiry", translation: "inquiry（問い合わせ・調査）" },
    ],
  },

  // ==========================================================================
  // TOEIC ジャンル - 機能3: 熟語 (Business Phrases)
  // ==========================================================================
  {
    id: "toeic-f3-1",
    genre: "toeic",
    tabMode: "func3",
    title: "ビジネスメール必須イディオム",
    category: "TOEIC / 熟語",
    description: "Eメールや公式文書で頻繁に使われる前置詞句・定型表現",
    sentences: [
      { text: "in charge of", translation: "〜を担当して・〜の責任者で" },
      { text: "look forward to", translation: "〜を楽しみに待つ" },
      { text: "as soon as possible", translation: "できるだけ早く" },
      { text: "in accordance with", translation: "〜に従って・〜に準拠して" },
      { text: "prior to", translation: "〜より前に・〜に先立って" },
      { text: "on behalf of", translation: "〜を代表して・〜に代わって" },
      { text: "take into account", translation: "〜を考慮に入れる" },
    ],
  },
  {
    id: "toeic-f3-2",
    genre: "toeic",
    tabMode: "func3",
    title: "進捗・契約・合意に関する熟語",
    category: "TOEIC / 熟語",
    description: "プロジェクト進行や取引条件の交渉で使われる熟語表現",
    sentences: [
      { text: "ahead of schedule", translation: "予定より早く・前倒しで" },
      { text: "reach an agreement", translation: "合意に達する" },
      { text: "be subject to", translation: "〜の対象となる・〜次第である" },
      { text: "comply with", translation: "（規則・法令などを）遵守する" },
      { text: "in the meantime", translation: "その間に・当面は" },
      { text: "keep track of", translation: "〜の動向を把握する・記録する" },
    ],
  },

  // ==========================================================================
  // TOEIC ジャンル - 機能4: 実践文 (Long Texts)
  // ==========================================================================
  {
    id: "text-1",
    genre: "toeic",
    tabMode: "func4",
    title: "顧客問い合わせ対応メール",
    category: "Customer Support / Email",
    description: "注文商品の配送確認と代替品発送に関する案内",
    sentences: [
      {
        text: "Dear Mr. Robinson,",
        translation: "ロビンソン様、",
      },
      {
        text: "Thank you for contacting our customer service department.",
        translation: "カスタマーサービス部門にお問い合わせいただきありがとうございます。",
      },
      {
        text: "We have received your inquiry regarding order number 8421.",
        translation: "注文番号8421に関するお問い合わせを受け付けいたしました。",
      },
      {
        text: "Our logistics team is currently processing the replacement items.",
        translation: "現在、物流チームにて代替品の発送手続きを進めております。",
      },
      {
        text: "You will receive another email once your package has shipped.",
        translation: "荷物が発送され次第、改めて確認のメールをお送りいたします。",
      },
      {
        text: "Please let us know if you need any further assistance.",
        translation: "他にご不明な点やお困りのことがございましたらお知らせください。",
      },
      {
        text: "Sincerely, Customer Relations Team",
        translation: "よろしくお願い申し上げます。カスタマーリレーションズチームより",
      },
    ],
  },
  {
    id: "text-2",
    genre: "toeic",
    tabMode: "func4",
    title: "社内オフィス改装の通知",
    category: "Internal Memo / Notice",
    description: "来週予定されている4階会議室のリノベーション工事連絡",
    sentences: [
      {
        text: "To all headquarters personnel,",
        translation: "本社従業員の皆様へ、",
      },
      {
        text: "The fourth floor conference rooms will undergo maintenance next week.",
        translation: "来週、4階の各会議室にてメンテナンス工事が実施されます。",
      },
      {
        text: "Please reserve the third floor meeting spaces for any client visits.",
        translation: "来客対応の際は、3階の会議スペースをご予約いただきますようお願いいたします。",
      },
      {
        text: "We expect normal operations to resume by Thursday morning.",
        translation: "木曜日の午前中には通常業務を再開できる見込みです。",
      },
      {
        text: "Thank you for your cooperation during this scheduled upgrade.",
        translation: "計画的な設備向上の期間中、皆様のご理解とご協力をお願い申し上げます。",
      },
    ],
  },
  {
    id: "text-3",
    genre: "toeic",
    tabMode: "func4",
    title: "業務提携に関する打診",
    category: "Business Proposal / Partnership",
    description: "展示会後のフォローアップとオンライン面談の提案",
    sentences: [
      {
        text: "Dear Ms. Davis,",
        translation: "デイビス様、",
      },
      {
        text: "It was a pleasure speaking with you at the Global Expo yesterday.",
        translation: "昨日のグローバルエキスポでお話しでき、大変光栄でした。",
      },
      {
        text: "Our team was very impressed by your innovative software solutions.",
        translation: "貴社の革新的なソフトウェアソリューションに大変感銘を受けました。",
      },
      {
        text: "We would like to propose a short video meeting to discuss collaboration.",
        translation: "業務提携の可能性を話し合うため、短いビデオ会議を提案したく存じます。",
      },
      {
        text: "Please let us know your availability for next Tuesday or Wednesday.",
        translation: "来週の火曜日または水曜日のご都合をお知らせいただけますでしょうか。",
      },
      {
        text: "Best regards, Kenji Sato",
        translation: "敬具 佐藤健司",
      },
    ],
  },
  {
    id: "text-4",
    genre: "toeic",
    tabMode: "func4",
    title: "四半期業績の社内報告",
    category: "Corporate Report / Financial",
    description: "好調なデジタル部門の売上と各チームへの感謝",
    sentences: [
      {
        text: "Our regional sales exceeded the quarterly revenue target by ten percent.",
        translation: "当地域の売上高は、今四半期の収益目標を10パーセント上回りました。",
      },
      {
        text: "This success is due to the rapid growth of our online consulting service.",
        translation: "この成功は、オンラインコンサルティングサービスの急速な成長によるものです。",
      },
      {
        text: "We sincerely appreciate everyone's hard work and commitment.",
        translation: "皆様の懸命な努力と献身に心より深く感謝申し上げます。",
      },
      {
        text: "A comprehensive financial report will be released tomorrow morning.",
        translation: "詳細な財務レポートは明日の朝に公開される予定です。",
      },
    ],
  },

  // ==========================================================================
  // Linux ジャンル - 機能1: 日本語（ローマ字ストリーム）
  // ==========================================================================
  {
    id: "linux-f1-1",
    genre: "linux",
    tabMode: "func1",
    title: "権限エラーと仮想環境のデバッグ",
    category: "Linux / 日本語タイピング",
    description: "uv・Python・Docker環境のトラブルシューティング解説（ローマ字入力・揺れ対応）",
    sentences: [
      {
        text: "でぃれくとりのしょゆうけんをちょうせいするひつようがあります。",
        translation: "ディレクトリの所有権を調整する必要があります。",
      },
      {
        text: "ぱっけーじめいのすぺるみすがげんいんでいぞんかいけつにしっぱいしました。",
        translation: "パッケージ名のスペルミスが原因で依存解決に失敗しました。",
      },
      {
        text: "かんきょうをpython3.11にこていしてさいこうちくします。",
        translation: "環境をPython 3.11に固定して再構築します。",
      },
    ],
  },
  {
    id: "linux-f1-2",
    genre: "linux",
    tabMode: "func1",
    title: "Dockerマウントロックの解除手順",
    category: "Linux / 日本語タイピング",
    description: "Device or resource busy エラー発生時のホスト側操作手順",
    sentences: [
      {
        text: "じっこうちゅうのこんてなないからまうんとぽいんとはさくじょできません。",
        translation: "実行中のコンテナ内からマウントポイントは削除できません。",
      },
      {
        text: "いったんこんてなをていしして、ほすとがわからあんぜんにさくじょします。",
        translation: "いったんコンテナを停止して、ホスト側から安全に削除します。",
      },
      {
        text: "いっぱんゆーざーとしてかそうかんきょうをしょきかしてください。",
        translation: "一般ユーザーとして仮想環境を初期化してください。",
      },
    ],
  },

  // ==========================================================================
  // Linux ジャンル - 機能2: 単語 (Tech & Debug Vocab)
  // ==========================================================================
  {
    id: "linux-f2-1",
    genre: "linux",
    tabMode: "func2",
    title: "Linux権限・ファイルシステム用語",
    category: "Linux / 単語",
    description: "source/uv.md に登場するOS権限・パス解決・マウント関連の英単語",
    sentences: [
      { text: "privileges", translation: "privileges（特権・権限）" },
      { text: "ownership", translation: "ownership（所有権）" },
      { text: "canonicalize", translation: "canonicalize（パスなどを正規化する）" },
      { text: "traverse", translation: "traverse（ディレクトリ等を走査・横断する）" },
      { text: "symlink", translation: "symlink（シンボリックリンク）" },
      { text: "permission", translation: "permission（アクセス許可・パーミッション）" },
      { text: "gateway", translation: "gateway（ゲートウェイ・接続口）" },
    ],
  },
  {
    id: "linux-f2-2",
    genre: "linux",
    tabMode: "func2",
    title: "パッケージ管理・SDK互換性用語",
    category: "Linux / 単語",
    description: "source/uv.md に登場する依存解決・バイナリ互換性関連の英単語",
    sentences: [
      { text: "dependencies", translation: "dependencies（依存関係・依存パッケージ）" },
      { text: "registry", translation: "registry（パッケージレジストリ）" },
      { text: "unsatisfiable", translation: "unsatisfiable（要件を満たせない・解決不能な）" },
      { text: "compatibility", translation: "compatibility（互換性）" },
      { text: "firmware", translation: "firmware（ファームウェア）" },
      { text: "calibration", translation: "calibration（キャリブレーション・較正）" },
      { text: "downgrading", translation: "downgrading（ダウングレードすること）" },
    ],
  },

  // ==========================================================================
  // Linux ジャンル - 機能3: 熟語 (Tech Phrases)
  // ==========================================================================
  {
    id: "linux-f3-1",
    genre: "linux",
    tabMode: "func3",
    title: "デバッグ・環境構築の頻出表現",
    category: "Linux / 熟語",
    description: "source/uv.md で使われている技術解説・トラブル解消の定型フレーズ",
    sentences: [
      { text: "root privileges", translation: "root権限（管理者特権）" },
      { text: "directory ownership", translation: "ディレクトリの所有権" },
      { text: "setup roadblocks", translation: "セットアップ上の障壁・詰まりポイント" },
      { text: "package registry", translation: "パッケージレジストリ" },
      { text: "pre-built binary wheels", translation: "事前ビルド済みのバイナリwheel" },
      { text: "compile manually from source", translation: "ソースから手動でコンパイルする" },
    ],
  },
  {
    id: "linux-f3-2",
    genre: "linux",
    tabMode: "func3",
    title: "Dockerマウント・ロック回避表現",
    category: "Linux / 熟語",
    description: "source/uv.md のコンテナ・マウントトラブル解消に関する英語表現",
    sentences: [
      { text: "Device or resource busy", translation: "デバイスまたはリソースがビジー状態です" },
      { text: "active storage mount point", translation: "アクティブなストレージマウントポイント" },
      { text: "bind-mounting a volume", translation: "ボリュームをバインドマウントすること" },
      { text: "move it out of the way", translation: "邪魔にならない場所へ退避させる" },
      { text: "drops the filesystem handles", translation: "ファイルシステムのハンドルを解放する" },
      { text: "without interference", translation: "干渉を受けることなく" },
    ],
  },

  // ==========================================================================
  // Linux ジャンル - 機能4: 実践文 (source/uv.md #1〜#6)
  // ※コマンド部分を除外し、英語の解説散文のみを抽出
  // ==========================================================================
  {
    id: "linux-uv-1",
    genre: "linux",
    tabMode: "func4",
    title: "#1 Root権限とパス正規化の仕組み",
    category: "source/uv.md #1 / Permissions",
    description: "sudo権限やディレクトリ所有権の調整が必要になる理由とユーザー権限の解説",
    sentences: [
      {
        text: "Glad to hear you got it sorted out!",
        translation: "無事に解決したようで何よりです！",
      },
      {
        text: "Running the tool with root privileges (sudo) or adjusting the directory ownership was exactly what it needed.",
        translation:
          "root権限（sudo）でツールを実行するか、ディレクトリの所有権を調整したのがまさに必要な対処でした。",
      },
      {
        text: "When a tool requires root authority to canonicalize a path, it is usually because it needs to traverse system-protected directories, access restricted configuration folders, or manage low-level system symlinks that standard users don't have permission to read.",
        translation:
          "ツールがパスを正規化するためにroot権限を必要とする場合、通常はシステム保護されたディレクトリの走査、制限された設定フォルダへのアクセス、または一般ユーザーに読み取り権限がない低レベルのシステムシンボリックリンクの管理が必要になるためです。",
      },
      {
        text: "Now that you have it running, are you hitting any other setup roadblocks, or do you need help configuring user-level permissions so you don't have to use sudo every time?",
        translation:
          "無事に動作したところで、他にセットアップ上の障壁はありますか？それとも毎回sudoを使わなくて済むようにユーザーレベルの権限設定をお手伝いしましょうか？",
      },
    ],
  },
  {
    id: "linux-uv-2",
    genre: "linux",
    tabMode: "func4",
    title: "#2 PyPIパッケージ名のスペルミスと依存解決エラー",
    category: "source/uv.md #2 / Package Resolution",
    description: "purealsense2 の誤記による依存解決失敗と pyrealsense2 の正しいパッケージ名",
    sentences: [
      {
        text: "Because purealsense2 was not found in the package registry and your project depends on purealsense2, we can conclude that your project's requirements are unsatisfiable.",
        translation:
          "パッケージレジストリにpurealsense2が見つからず、プロジェクトがpurealsense2に依存しているため、プロジェクトの要件を満たすことができないと結論付けられます。",
      },
      {
        text: "If you want to add the package regardless of the failed resolution, provide the frozen flag to skip locking and syncing.",
        translation:
          "もし依存解決の失敗にかかわらずパッケージを追加したい場合は、frozenフラグを指定してロックと同期をスキップしてください。",
      },
      {
        text: "The package registry cannot find your package because the library is misspelled as purealsense2.",
        translation:
          "ライブラリ名がpurealsense2とスペルミスされているため、パッケージレジストリがパッケージを見つけられません。",
      },
      {
        text: "The correct name for the official Intel RealSense Python wrapper on PyPI is pyrealsense2.",
        translation:
          "PyPIにおける公式Intel RealSense Pythonラッパーの正しい名称はpyrealsense2です。",
      },
    ],
  },
  {
    id: "linux-uv-3",
    genre: "linux",
    tabMode: "func4",
    title: "#3 RealSense T265とPython 3.11の互換性問題",
    category: "source/uv.md #3 / Python & SDK Compatibility",
    description: "Linux向けpyrealsense2のビルド済みwheel対応上限とT265のSDK固定理由",
    sentences: [
      {
        text: "Since you want to use the Intel RealSense T265 Tracking Camera, you are facing two major compatibility walls that are throwing this ModuleNotFoundError:",
        translation:
          "Intel RealSense T265トラッキングカメラを使用しようとしているため、このModuleNotFoundErrorを引き起こす2つの大きな互換性の壁に直面しています。",
      },
      {
        text: "The Python Version Issue: The uv add pyrealsense2 command executed in less than a millisecond because uv didn't actually download a package.",
        translation:
          "Pythonバージョンの問題：uvが実際にはパッケージをダウンロードしなかったため、uv add pyrealsense2コマンドは1ミリ秒未満で実行完了してしまいました。",
      },
      {
        text: "For Linux platforms, Intel only provides pre-built pyrealsense2 binary wheels for Python 3.7 up to 3.11.",
        translation:
          "Linuxプラットフォーム向けには、IntelはPython 3.7から3.11までの事前ビルド済みpyrealsense2バイナリwheelしか提供していません。",
      },
      {
        text: "If uv is running Python 3.12 or 3.13, it creates an empty dummy metadata resolution or fails completely, leaving your environment with nothing to import.",
        translation:
          "uvがPython 3.12や3.13で動作している場合、空のダミーメタデータ解決を作成するか完全に失敗し、環境にインポートできるものが何も残らなくなります。",
      },
      {
        text: "The T265 Lifecycle Issue: The T265 tracking camera relies on specific firmware and features (like wheel odometry and internal fisheye calibration) that were frozen in older versions of the SDK.",
        translation:
          "T265ライフサイクルの問題：T265トラッキングカメラは、古いバージョンのSDKで凍結された特定のファームウェアや機能（ホイールオドメトリや内部魚眼キャリブレーションなど）に依存しています。",
      },
      {
        text: "To get the T265 working flawlessly, you must pin your environment to Python 3.11.",
        translation:
          "T265を問題なく動作させるには、環境をPython 3.11に固定する必要があります。",
      },
      {
        text: "Follow these exact steps from your /workspace/sandbox/py directory to clear out the broken 3.12+ environment and build a working Python 3.11 setup:",
        translation:
          "/workspace/sandbox/pyディレクトリから以下の正確な手順に従って、壊れた3.12+環境を消去し、正常に動作するPython 3.11セットアップを構築してください。",
      },
    ],
  },
  {
    id: "linux-uv-4",
    genre: "linux",
    tabMode: "func4",
    title: "#4 Python 3.11へのダウングレードと非sudo実行",
    category: "source/uv.md #4 / Virtual Environment Setup",
    description: "ソースコンパイルを回避するPython 3.11利用とsudoを使わない環境操作",
    sentences: [
      {
        text: "Excellent decision.",
        translation: "素晴らしい判断です。",
      },
      {
        text: "Downgrading to Python 3.11 is the most reliable way to make pyrealsense2 work, as Intel's pre-built binary wheels directly support Python 3.11, avoiding the need to compile everything manually from source.",
        translation:
          "Intelの事前ビルド済みバイナリwheelがPython 3.11を直接サポートしているため、ソースからすべて手動でコンパイルする必要がなくなり、Python 3.11へのダウングレードがpyrealsense2を動かす最も確実な方法です。",
      },
      {
        text: "Since you are modifying the virtual environment setup, make sure you perform these steps without using sudo, while inside your project's root folder (/workspace/sandbox/py):",
        translation:
          "仮想環境のセットアップを変更するため、プロジェクトのルートフォルダ（/workspace/sandbox/py）内で、sudoを使わずにこれらの手順を実行してください。",
      },
    ],
  },
  {
    id: "linux-uv-5",
    genre: "linux",
    tabMode: "func4",
    title: "#5 DockerマウントとDevice or resource busyの対処",
    category: "source/uv.md #5 / Docker Bind-Mount Lock",
    description: "コンテナ内で .venv 削除時に Device or resource busy が出る理由と2つの解消法",
    sentences: [
      {
        text: "If you have killed all the Python processes and rm -rf .venv still throws a \"Device or resource busy\" error inside a Docker container, it means .venv is being used as an active storage mount point by Docker.",
        translation:
          "すべてのPythonプロセスを終了してもDockerコンテナ内でrm -rf .venvが「Device or resource busy」エラーを出す場合、.venvがDockerのアクティブなストレージマウントポイントとして使用されていることを意味します。",
      },
      {
        text: "Linux will absolutely block you from deleting a directory if Docker is actively bind-mounting a volume or a host folder directly into it.",
        translation:
          "Dockerがボリュームやホストフォルダをそのディレクトリに直接バインドマウントしている場合、Linuxはディレクトリの削除を完全にブロックします。",
      },
      {
        text: "You cannot fix this from inside the running container.",
        translation: "実行中のコンテナの内部からこれを修復することはできません。",
      },
      {
        text: "If you just want to get your work done immediately without restarting your Docker layout, rename the locked folder so uv can build a fresh environment next to it:",
        translation:
          "Docker構成を再起動せずに今すぐ作業を進めたい場合は、ロックされたフォルダの名前を変更して、uvがその隣に新しい環境を構築できるようにします。",
      },
      {
        text: "To permanently wipe the directory, you must step outside your Docker container terminal back into your host terminal:",
        translation:
          "ディレクトリを恒久的に消去するには、Dockerコンテナのターミナルから出てホスト側のターミナルに戻る必要があります。",
      },
      {
        text: "Check your configuration: Look at your docker-compose.yml or your docker run setup.",
        translation:
          "設定の確認：docker-compose.ymlまたはdocker runのセットアップを確認してください。",
      },
      {
        text: "You likely have a configuration rule mounting into or near your virtual environment.",
        translation:
          "仮想環境またはその近くにマウントする設定ルールが含まれている可能性が高いです。",
      },
      {
        text: "Once the container engine drops the filesystem handles, clear it out safely from your standard computer terminal:",
        translation:
          "コンテナエンジンがファイルシステムのハンドルを解放したら、標準のコンピュータ端末から安全に削除してください。",
      },
      {
        text: "Did renaming the folder allow you to bypass the lock and keep moving, or do you need help editing your Docker Volume configurations to prevent this from locking up in the future?",
        translation:
          "フォルダの名前変更でロックを回避して作業を続けられましたか？それとも今後ロックされないようにDockerボリューム設定を編集するお手伝いが必要ですか？",
      },
    ],
  },
  {
    id: "linux-uv-6",
    genre: "linux",
    tabMode: "func4",
    title: "#6 ホスト側からのマウントロック解除と再起動",
    category: "source/uv.md #6 / Host Unmount Action Plan",
    description: "mv も失敗する場合にコンテナを停止してホスト側から安全に .venv を消去する手順",
    sentences: [
      {
        text: "Maybe would be better to just exit Docker and edit it from the outside?",
        translation: "いったんDockerを終了して、外側から編集した方がよいでしょうか？",
      },
      {
        text: "Yes, exiting Docker and deleting it from the host machine is absolutely your best move here.",
        translation:
          "はい、Dockerを抜けてホストマシン側から削除するのが間違いなく最善の手です。",
      },
      {
        text: "When mv fails with Device or resource busy, it confirms that .venv is being used as a direct mount point in your Docker configuration (e.g., a volume or bind-mount).",
        translation:
          "mvがDevice or resource busyで失敗する場合、.venvがDocker設定で直接のマウントポイント（ボリュームやバインドマウントなど）として使用されていることが確定します。",
      },
      {
        text: "Linux will not allow you to delete or rename a directory while it is actively acting as a mount gateway.",
        translation:
          "ディレクトリがマウントゲートウェイとしてアクティブに機能している間、Linuxはその削除も名前変更も許可しません。",
      },
      {
        text: "If Docker is actively running, it keeps the mount locked.",
        translation: "Dockerが実行中である限り、マウントはロックされ続けます。",
      },
      {
        text: "Now that the container is down, the mount lock is broken.",
        translation: "コンテナが停止したことで、マウントのロックが解除されました。",
      },
      {
        text: "Start your container back up, hop inside, and initialize your environment cleanly as a normal user:",
        translation:
          "コンテナを再起動して中に入り、一般ユーザーとしてクリーンに環境を初期化してください。",
      },
      {
        text: "Once you are back inside the fresh container, let me know if uv add installs smoothly without hitting any more permission errors!",
        translation:
          "新しいコンテナに戻ったら、これ以上権限エラーに遭遇することなくuv addがスムーズにインストールできるか教えてください！",
      },
    ],
  },
];
