/* ==========================================================================
   romaji.ts - かな文字列に対する柔軟なローマ字入力判定エンジン
   - 「つ」= tu / tsu、「し」= si / shi / ci、「ち」= ti / chi などの揺れを許容
   - 「ん」= nn / xn / n'（次が母音・な行・や行以外なら n 単体も可）
   - 「っ」= 次の子音を重ねる / xtu / ltu / xtsu / ltsu
   - 拗音（きゃ 等）は kya / ki + xya のどちらでも入力可能
   ========================================================================== */

const KANA_TABLE: Record<string, string[]> = {
  あ: ["a"], い: ["i", "yi"], う: ["u", "wu", "whu"], え: ["e"], お: ["o"],
  か: ["ka", "ca"], き: ["ki"], く: ["ku", "cu", "qu"], け: ["ke"], こ: ["ko", "co"],
  さ: ["sa"], し: ["shi", "si", "ci"], す: ["su"], せ: ["se", "ce"], そ: ["so"],
  た: ["ta"], ち: ["chi", "ti"], つ: ["tsu", "tu"], て: ["te"], と: ["to"],
  な: ["na"], に: ["ni"], ぬ: ["nu"], ね: ["ne"], の: ["no"],
  は: ["ha"], ひ: ["hi"], ふ: ["fu", "hu"], へ: ["he"], ほ: ["ho"],
  ま: ["ma"], み: ["mi"], む: ["mu"], め: ["me"], も: ["mo"],
  や: ["ya"], ゆ: ["yu"], よ: ["yo"],
  ら: ["ra"], り: ["ri"], る: ["ru"], れ: ["re"], ろ: ["ro"],
  わ: ["wa"], を: ["wo"],
  が: ["ga"], ぎ: ["gi"], ぐ: ["gu"], げ: ["ge"], ご: ["go"],
  ざ: ["za"], じ: ["ji", "zi"], ず: ["zu"], ぜ: ["ze"], ぞ: ["zo"],
  だ: ["da"], ぢ: ["di"], づ: ["du"], で: ["de"], ど: ["do"],
  ば: ["ba"], び: ["bi"], ぶ: ["bu"], べ: ["be"], ぼ: ["bo"],
  ぱ: ["pa"], ぴ: ["pi"], ぷ: ["pu"], ぺ: ["pe"], ぽ: ["po"],
  ゔ: ["vu"],
  ぁ: ["xa", "la"], ぃ: ["xi", "li"], ぅ: ["xu", "lu"], ぇ: ["xe", "le"], ぉ: ["xo", "lo"],
  ゃ: ["xya", "lya"], ゅ: ["xyu", "lyu"], ょ: ["xyo", "lyo"],
  っ: ["xtu", "ltu", "xtsu", "ltsu"],
  ゎ: ["xwa", "lwa"],

  // 拗音・外来音
  きゃ: ["kya"], きぃ: ["kyi"], きゅ: ["kyu"], きぇ: ["kye"], きょ: ["kyo"],
  しゃ: ["sha", "sya"], しぃ: ["syi"], しゅ: ["shu", "syu"], しぇ: ["she", "sye"], しょ: ["sho", "syo"],
  ちゃ: ["cha", "tya", "cya"], ちぃ: ["tyi", "cyi"], ちゅ: ["chu", "tyu", "cyu"], ちぇ: ["che", "tye", "cye"], ちょ: ["cho", "tyo", "cyo"],
  にゃ: ["nya"], にぃ: ["nyi"], にゅ: ["nyu"], にぇ: ["nye"], にょ: ["nyo"],
  ひゃ: ["hya"], ひぃ: ["hyi"], ひゅ: ["hyu"], ひぇ: ["hye"], ひょ: ["hyo"],
  みゃ: ["mya"], みぃ: ["myi"], みゅ: ["myu"], みぇ: ["mye"], みょ: ["myo"],
  りゃ: ["rya"], りぃ: ["ryi"], りゅ: ["ryu"], りぇ: ["rye"], りょ: ["ryo"],
  ぎゃ: ["gya"], ぎぃ: ["gyi"], ぎゅ: ["gyu"], ぎぇ: ["gye"], ぎょ: ["gyo"],
  じゃ: ["ja", "zya", "jya"], じぃ: ["zyi", "jyi"], じゅ: ["ju", "zyu", "jyu"], じぇ: ["je", "zye", "jye"], じょ: ["jo", "zyo", "jyo"],
  ぢゃ: ["dya"], ぢぃ: ["dyi"], ぢゅ: ["dyu"], ぢぇ: ["dye"], ぢょ: ["dyo"],
  びゃ: ["bya"], びぃ: ["byi"], びゅ: ["byu"], びぇ: ["bye"], びょ: ["byo"],
  ぴゃ: ["pya"], ぴぃ: ["pyi"], ぴゅ: ["pyu"], ぴぇ: ["pye"], ぴょ: ["pyo"],
  ふぁ: ["fa"], ふぃ: ["fi"], ふぇ: ["fe"], ふぉ: ["fo"], ふゅ: ["fyu"],
  てぃ: ["thi"], てゅ: ["thu"], でぃ: ["dhi"], でゅ: ["dhu"],
  とぅ: ["twu"], どぅ: ["dwu"],
  うぃ: ["wi", "whi"], うぇ: ["we", "whe"], うぉ: ["who"],
  ゔぁ: ["va"], ゔぃ: ["vi"], ゔぇ: ["ve"], ゔぉ: ["vo"],
  つぁ: ["tsa"], つぃ: ["tsi"], つぇ: ["tse"], つぉ: ["tso"],

  // 記号
  ー: ["-"], "。": ["."], "、": [","], "？": ["?"], "！": ["!"], "　": [" "],
  "・": ["/"], "「": ["["], "」": ["]"],
};

const N_FORBIDDEN_NEXT = new Set([
  "あ", "い", "う", "え", "お", "や", "ゆ", "よ",
  "な", "に", "ぬ", "ね", "の", "ん",
]);

const VOWELS_AND_N = new Set(["a", "i", "u", "e", "o", "n"]);

/** カタカナをひらがなに変換 */
export function toHiragana(input: string): string {
  return input.replace(/[\u30a1-\u30f6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

interface Chunk {
  len: number; // 消費するかな文字数
  patterns: string[];
}

/** かな位置 i で取り得る入力チャンク（長い順）を列挙 */
function candidatesAt(kana: string, i: number): Chunk[] {
  const result: Chunk[] = [];
  const ch = kana[i];

  if (ch === "っ") {
    // 次の子音を重ねるパターン
    const nextChunks = candidatesAt(kana, i + 1).filter((c) => c.len <= 2);
    for (const nc of nextChunks) {
      const doubled = nc.patterns
        .filter((p) => p.length > 0 && !VOWELS_AND_N.has(p[0]) && /[a-z]/.test(p[0]))
        .map((p) => p[0] + p);
      if (doubled.length > 0) {
        result.push({ len: 1 + nc.len, patterns: doubled });
      }
    }
    result.push({ len: 1, patterns: KANA_TABLE["っ"] });
    return result;
  }

  if (ch === "ん") {
    const patterns = ["nn", "xn", "n'"];
    const next = kana[i + 1];
    if (next !== undefined && !N_FORBIDDEN_NEXT.has(next) && /[\u3040-\u309f]/.test(next)) {
      patterns.splice(1, 0, "n");
    }
    result.push({ len: 1, patterns });
    return result;
  }

  const two = kana.slice(i, i + 2);
  if (two.length === 2 && KANA_TABLE[two]) {
    result.push({ len: 2, patterns: KANA_TABLE[two] });
  }
  if (KANA_TABLE[ch]) {
    result.push({ len: 1, patterns: KANA_TABLE[ch] });
  } else if (ch !== undefined) {
    // 英数字などはそのまま1打鍵
    result.push({ len: 1, patterns: [ch.toLowerCase()] });
  }
  return result;
}

/** 位置 i 以降のデフォルトのローマ字表記 */
function defaultRomajiFrom(kana: string, i: number): string {
  let out = "";
  let pos = i;
  while (pos < kana.length) {
    const cands = candidatesAt(kana, pos);
    if (cands.length === 0) break;
    out += cands[0].patterns[0];
    pos += cands[0].len;
  }
  return out;
}

export interface RomajiResolveResult {
  /** typed が有効なローマ字入力の接頭辞かどうか */
  valid: boolean;
  /** typed を起点にした、全体のローマ字表記（typed + 残りのガイド） */
  romaji: string;
  /** 完全に入力し終えたかな文字数 */
  consumedKana: number;
}

function resolveFrom(
  kana: string,
  i: number,
  typed: string,
  j: number
): { romaji: string; consumed: number } | null {
  if (j === typed.length) {
    return { romaji: defaultRomajiFrom(kana, i), consumed: i };
  }
  if (i >= kana.length) return null;

  const rest = typed.slice(j);
  const cands = candidatesAt(kana, i);

  // 1. 完全一致するパターンを優先して再帰
  for (const c of cands) {
    for (const p of c.patterns) {
      if (rest.startsWith(p)) {
        const sub = resolveFrom(kana, i + c.len, typed, j + p.length);
        if (sub) return { romaji: p + sub.romaji, consumed: sub.consumed };
      }
    }
  }
  // 2. 入力途中（部分一致）のパターン
  for (const c of cands) {
    for (const p of c.patterns) {
      if (p.startsWith(rest)) {
        return { romaji: p + defaultRomajiFrom(kana, i + c.len), consumed: i };
      }
    }
  }
  return null;
}

/** かな文字列 kana に対して、入力済み文字列 typed を解決する */
export function resolveRomaji(kana: string, typed: string): RomajiResolveResult {
  const hira = toHiragana(kana);
  const res = resolveFrom(hira, 0, typed, 0);
  if (res) {
    return { valid: true, romaji: res.romaji, consumedKana: res.consumed };
  }
  return { valid: false, romaji: defaultRomajiFrom(hira, 0), consumedKana: 0 };
}

/** typed のうち有効な最長接頭辞を求めて解決する */
export function resolveLongestValid(
  kana: string,
  typed: string
): RomajiResolveResult & { validLength: number } {
  for (let len = typed.length; len >= 0; len--) {
    const r = resolveRomaji(kana, typed.slice(0, len));
    if (r.valid) return { ...r, validLength: len };
  }
  return { ...resolveRomaji(kana, ""), validLength: 0 };
}

/** かな文字列のデフォルトローマ字 */
export function defaultRomaji(kana: string): string {
  return defaultRomajiFrom(toHiragana(kana), 0);
}
