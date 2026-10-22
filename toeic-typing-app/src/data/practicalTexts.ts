export interface PracticalSentence {
  text: string;
  translation: string;
}

export interface PracticalText {
  id: string;
  title: string;
  category: string;
  description: string;
  sentences: PracticalSentence[];
}

export const PRACTICAL_TEXTS: PracticalText[] = [
  {
    id: "text-1",
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
];
