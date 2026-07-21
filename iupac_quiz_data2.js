// ============================================================
// IUPAC命名法 4択クイズ データ 第2弾(100題)
// ============================================================
// スキーマは iupac_quiz_data.js(第1弾)と共通。
// 第1弾と正解化合物が重複しないように作成。
// 両方読み込んで結合する場合:
//   const ALL_QUIZ = IUPAC_QUIZ_DATA.concat(IUPAC_QUIZ_DATA_2);
// ============================================================

const IUPAC_QUIZ_DATA_2 = [

  // ================= アルカン (12) =================
  {
    id: "ALK013", category: "alkane", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CH₂−CH(CH₃)−CH₂−CH₂−CH₃",
    choices: ["4-メチルヘキサン", "3-メチルヘキサン", "2-エチルペンタン", "3-メチルペンタン"],
    answer: 1,
    explanation: "最長鎖はC6(ヘキサン)。置換基が最小番号になる端から数えて3-メチル。逆端から数えた「4-メチルヘキサン」と、短い鎖を主鎖にした「2-エチルペンタン」(無効な名前)が引っかけ。",
    difficulty: 1
  },
  {
    id: "ALK014", category: "alkane", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−C(CH₃)₂−CH₂−CH₂−CH₃",
    choices: ["2,2-ジメチルペンタン", "4,4-ジメチルペンタン", "3,3-ジメチルペンタン", "2-ジメチルペンタン"],
    answer: 0,
    explanation: "ペンタン主鎖のC2にメチル基2つ。逆端から数えた「4,4-」が引っかけ。同一炭素上でも位置番号は「2,2-」と置換基の数だけ書く(「2-ジメチル」は不完全)。",
    difficulty: 1
  },
  {
    id: "ALK015", category: "alkane", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃CH₂CH(C₂H₅)CH₂CH₂CH₃",
    choices: ["3-メチルヘキサン", "4-エチルヘキサン", "3-エチルヘキサン", "3-エチルペンタン"],
    answer: 2,
    explanation: "エチル基を通る経路も含めて最長鎖はC6で、エチル基は3位。「4-エチル」は逆端からの番号付け。主鎖の炭素数を5と数えると「3-エチルペンタン」に引っかかる。",
    difficulty: 2
  },
  {
    id: "ALK016", category: "alkane", type: "name_to_cond",
    question: "「3,4-ジメチルヘキサン」の示性式はどれか。",
    prompt: "3,4-ジメチルヘキサン",
    choices: [
      "CH₃CH(CH₃)CH(CH₃)CH₂CH₂CH₃",
      "CH₃CH₂CH(CH₃)CH(CH₃)CH₂CH₃",
      "CH₃CH(CH₃)CH₂CH₂CH(CH₃)CH₃",
      "CH₃CH₂C(CH₃)₂CH₂CH₂CH₃"
    ],
    answer: 1,
    explanation: "ヘキサン(C6)のC3とC4にメチル基。「CH₃CH(CH₃)CH(CH₃)CH₂CH₂CH₃」は2,3-ジメチルヘキサン、「CH₃CH(CH₃)CH₂CH₂CH(CH₃)CH₃」は2,5-ジメチルヘキサン、「CH₃CH₂C(CH₃)₂CH₂CH₂CH₃」は3,3-ジメチルヘキサン。メチル基の位置を端から正確に数える。",
    difficulty: 2
  },
  {
    id: "ALK017", category: "alkane", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CHCl−CH₃",
    choices: ["1-クロロプロパン", "2-クロロプロパン", "クロロプロパン", "2-クロロブタン"],
    answer: 1,
    explanation: "プロパンのC2に塩素。1-クロロプロパンという異性体が存在するため位置番号は省略できない(「クロロプロパン」は不完全)。",
    difficulty: 1
  },
  {
    id: "ALK018", category: "alkane", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CH(CH₃)−CH₂−CH₂−Br",
    choices: ["4-ブロモ-2-メチルブタン", "2-メチル-4-ブロモブタン", "1-ブロモ-3-メチルブタン", "1-ブロモ-2-メチルブタン"],
    answer: 2,
    explanation: "位置番号の組が{1,3}になるBr側から番号を付ける({2,4}より小さい)。メチル基側から数えた「4-ブロモ-2-メチルブタン」が引っかけ。列挙はアルファベット順(bromo→methyl)。",
    difficulty: 2
  },
  {
    id: "ALK019", category: "alkane", type: "name_to_struct",
    question: "「2,2,4-トリメチルペンタン」の構造式はどれか。",
    prompt: "2,2,4-トリメチルペンタン",
    choices: [
      "CH₃−C(CH₃)₂−CH(CH₃)−CH₂−CH₃",
      "CH₃−C(CH₃)₂−CH₂−CH(CH₃)−CH₃",
      "CH₃−CH(CH₃)−CH₂−CH(CH₃)−CH₂−CH₃",
      "(CH₃)₃C−C(CH₃)₃"
    ],
    answer: 1,
    explanation: "ペンタン主鎖のC2に2つ・C4に1つのメチル基(ガソリンのオクタン価基準物質、イソオクタン)。「CH₃−C(CH₃)₂−CH(CH₃)−CH₂−CH₃」は2,2,3-トリメチルペンタン、「CH₃−CH(CH₃)−CH₂−CH(CH₃)−CH₂−CH₃」は2,4-ジメチルヘキサン、「(CH₃)₃C−C(CH₃)₃」は2,2,3,3-テトラメチルブタン。",
    difficulty: 2
  },
  {
    id: "ALK020", category: "alkane", type: "cond_to_name",
    question: "炭素4個が単結合のみで環をつくっている化合物(C₄H₈)のIUPAC名はどれか。",
    prompt: "C₄H₈(飽和の環状構造)",
    choices: ["ブタン", "シクロブタン", "2-ブテン", "シクロペンタン"],
    answer: 1,
    explanation: "C4の飽和環はシクロブタン。分子式C₄H₈はアルケンのブテンと同じ(環1つ=二重結合1つ分の不飽和度)なので、「2-ブテン」は分子式だけ見た引っかけ。",
    difficulty: 2
  },
  {
    id: "ALK021", category: "alkane", type: "struct_to_name",
    question: "シクロヘキサン環の同じ炭素にメチル基が2つ付いた化合物のIUPAC名はどれか。",
    prompt: "シクロヘキサン環(同一炭素に CH₃ ×2)",
    choices: ["1,2-ジメチルシクロヘキサン", "ジメチルシクロヘキサン", "1,1-ジメチルシクロヘキサン", "1,6-ジメチルシクロヘキサン"],
    answer: 2,
    explanation: "同一炭素に2つ付いている場合は「1,1-」。隣接位の「1,2-」との区別が必要なので番号は省略できない。「1,6-」は環を逆回りに数えた誤り(1,2-と同じ化合物を指すが番号が最小でない)。",
    difficulty: 2
  },
  {
    id: "ALK022", category: "alkane", type: "name_to_cond",
    question: "「3,3-ジエチルペンタン」の示性式はどれか。",
    prompt: "3,3-ジエチルペンタン",
    choices: [
      "CH₃CH₂CH(C₂H₅)CH₂CH₃",
      "CH₃CH₂C(C₂H₅)₂CH₂CH₃",
      "CH₃CH₂C(CH₃)₂CH₂CH₃",
      "CH₃CH₂C(C₂H₅)(CH₃)CH₂CH₃"
    ],
    answer: 1,
    explanation: "ペンタン主鎖のC3にエチル基2つ。「CH₃CH₂CH(C₂H₅)CH₂CH₃」は3-エチルペンタン(1つだけ)、「CH₃CH₂C(CH₃)₂CH₂CH₃」は3,3-ジメチルペンタン、「CH₃CH₂C(C₂H₅)(CH₃)CH₂CH₃」は3-エチル-3-メチルペンタン。「ジエチル」と「ジメチル」の読み分けに注意。",
    difficulty: 2
  },
  {
    id: "ALK023", category: "alkane", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CH(CH₃)−CH(CH₃)−CH₂−CH(CH₃)−CH₃",
    choices: ["2,4,5-トリメチルヘキサン", "2,3,5-トリメチルヘキサン", "トリメチルヘキサン", "2,3,5-トリメチルペンタン"],
    answer: 1,
    explanation: "両端から数えた位置番号の組は{2,3,5}と{2,4,5}。最初に差が出る箇所(2番目: 3<4)で小さい方を採用するので2,3,5-。合計や最後の数字で比べるのではなく「最初の相違点」で決めるのがポイント。",
    difficulty: 3
  },
  {
    id: "ALK024", category: "alkane", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃CH₂CH(CH₃)CH₂CH₃",
    choices: ["2-メチルペンタン", "3-メチルブタン", "3-メチルペンタン", "ヘキサン"],
    answer: 2,
    explanation: "ペンタン主鎖(C5)の中央C3にメチル基。どちらの端から数えても3位になる対称構造。全炭素数6から直鎖の「ヘキサン」とするのは主鎖と置換基の混同。",
    difficulty: 1
  },

  // ================= アルケン (12) =================
  {
    id: "ALE013", category: "alkene", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₂=CH−CH₂−CH₂−CH₃",
    choices: ["1-ペンテン", "4-ペンテン", "2-ペンテン", "1-ペンチン"],
    answer: 0,
    explanation: "二重結合に近い端から番号を付けて1-ペンテン。逆端から数えた「4-ペンテン」が定番の誤り。",
    difficulty: 1
  },
  {
    id: "ALE014", category: "alkene", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₂=C(CH₃)−CH₂−CH₃",
    choices: ["3-メチル-3-ブテン", "2-メチル-2-ブテン", "2-エチルプロペン", "2-メチル-1-ブテン"],
    answer: 3,
    explanation: "二重結合を含む最長鎖はC4(ブテン)。二重結合に最小番号を与えて1-ブテン、メチル基は2位。逆端から数えた「3-メチル-3-ブテン」、短い鎖を主鎖にした「2-エチルプロペン」(無効)が引っかけ。",
    difficulty: 2
  },
  {
    id: "ALE015", category: "alkene", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃CH=C(CH₃)CH₂CH₃",
    choices: ["3-メチル-3-ペンテン", "3-メチル-2-ペンテン", "2-メチル-2-ペンテン", "3-メチル-2-ペンチン"],
    answer: 1,
    explanation: "二重結合の位置が最小になる端から数えて二重結合2位・メチル基3位。逆端から数えると二重結合が3位になってしまう。「2-メチル-2-ペンテン」はメチル基の位置が異なる別の化合物。",
    difficulty: 2
  },
  {
    id: "ALE016", category: "alkene", type: "name_to_cond",
    question: "「4-メチル-2-ペンテン」の示性式はどれか。",
    prompt: "4-メチル-2-ペンテン",
    choices: [
      "CH₂=CHCH₂CH(CH₃)CH₃",
      "CH₃CH=CHCH₂CH₂CH₃",
      "CH₃CH=CHCH(CH₃)CH₃",
      "(CH₃)₂C=CHCH₂CH₃"
    ],
    answer: 2,
    explanation: "ペンテン主鎖のC2−C3間に二重結合、C4にメチル基。「CH₂=CHCH₂CH(CH₃)CH₃」は4-メチル-1-ペンテン、「CH₃CH=CHCH₂CH₂CH₃」は2-ヘキセン(主鎖C6)、「(CH₃)₂C=CHCH₂CH₃」は2-メチル-2-ペンテン。",
    difficulty: 2
  },
  {
    id: "ALE017", category: "alkene", type: "struct_to_name",
    question: "次の構造式で表される化合物の名称はどれか。",
    prompt: "CH₃      H\n   \\      /\n    C == C\n   /      \\\n  H      C₂H₅",
    choices: ["シス-2-ペンテン", "トランス-2-ペンテン", "トランス-3-ペンテン", "トランス-2-ブテン"],
    answer: 1,
    explanation: "主鎖はC5でCH₃側から数えて二重結合は2位。CH₃とC₂H₅が二重結合をはさんで反対側にあるのでトランス形。エチル基を見落としてブテンとしたり、番号を3位と数えるミスに注意。",
    difficulty: 2
  },
  {
    id: "ALE018", category: "alkene", type: "name_to_struct",
    question: "「トランス-3-ヘキセン」の構造式はどれか。",
    prompt: "トランス-3-ヘキセン",
    choices: [
      "C₂H₅      H\n    \\      /\n     C == C\n    /      \\\n   H      C₂H₅",
      "C₂H₅    C₂H₅\n    \\      /\n     C == C\n    /      \\\n   H       H",
      "CH₃CH=CHCH₂CH₂CH₃",
      "CH₂=CH−CH₂−CH₂−CH₂−CH₃"
    ],
    answer: 0,
    explanation: "C6の中央(C3−C4)に二重結合があり、両側のエチル基が反対側にあるのがトランス形。エチル基どうしが同じ側にある構造はシス形。「CH₃CH=CHCH₂CH₂CH₃」は2-ヘキセン、「CH₂=CH−CH₂−CH₂−CH₂−CH₃」は1-ヘキセン。",
    difficulty: 2
  },
  {
    id: "ALE019", category: "alkene", type: "struct_to_name",
    question: "シクロヘキセン環の二重結合炭素の一方にメチル基が付いた化合物のIUPAC名はどれか。",
    prompt: "シクロヘキセン環(二重結合炭素上に CH₃)",
    choices: ["2-メチルシクロヘキセン", "1-メチルシクロヘキセン", "3-メチルシクロヘキセン", "メチルシクロヘキサン"],
    answer: 1,
    explanation: "環の二重結合は必ずC1−C2とし、置換基が最小番号になるように向きを選ぶので、メチル基の付いた二重結合炭素がC1。「2-メチルシクロヘキセン」は番号の付け方として常に誤り(その場合はメチル側をC1にできる)。",
    difficulty: 3
  },
  {
    id: "ALE020", category: "alkene", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₂=CHCH₂CH=CH₂",
    choices: ["1,3-ペンタジエン", "1,4-ペンタジエン", "2,4-ペンタジエン", "1,4-ペンテン"],
    answer: 1,
    explanation: "二重結合はC1−C2とC4−C5にあり、どちらの端から数えても1,4。共役ジエンと勘違いした「1,3-」、逆端読みの「2,4-」が引っかけ。二重結合2つの語尾は「ジエン」。",
    difficulty: 2
  },
  {
    id: "ALE021", category: "alkene", type: "name_to_cond",
    question: "「2,3-ジメチル-1,3-ブタジエン」の示性式はどれか。",
    prompt: "2,3-ジメチル-1,3-ブタジエン",
    choices: [
      "CH₂=C(CH₃)C(CH₃)=CH₂",
      "CH₂=C(CH₃)CH=CH₂",
      "CH₃C(CH₃)=C(CH₃)CH₃",
      "CH₂=CHC(CH₃)₂CH=CH₂"
    ],
    answer: 0,
    explanation: "ブタジエン骨格(C1=C2−C3=C4)のC2とC3にメチル基。「CH₂=C(CH₃)CH=CH₂」は2-メチル-1,3-ブタジエン(イソプレン)、「CH₃C(CH₃)=C(CH₃)CH₃」は2,3-ジメチル-2-ブテン(二重結合1つ)、「CH₂=CHC(CH₃)₂CH=CH₂」は主鎖C5の別化合物。",
    difficulty: 2
  },
  {
    id: "ALE022", category: "alkene", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₂=C(CH₃)−CH(CH₃)−CH₃",
    choices: ["2,3-ジメチル-3-ブテン", "2,3-ジメチルブテン", "2,3-ジメチル-1-ブテン", "3,4-ジメチル-1-ブテン"],
    answer: 2,
    explanation: "二重結合に最小番号を与えて1-ブテン、メチル基はC2とC3。逆端から数えた「2,3-ジメチル-3-ブテン」が引っかけ。異性体が複数あるため二重結合の位置番号は省略不可。",
    difficulty: 2
  },
  {
    id: "ALE023", category: "alkene", type: "cond_to_name",
    question: "炭素6個の環に二重結合が1つある化合物(C₆H₁₀)のIUPAC名はどれか。",
    prompt: "C₆H₁₀(六員環+二重結合1つ)",
    choices: ["シクロヘキサン", "ベンゼン", "シクロヘキセン", "1-ヘキセン"],
    answer: 2,
    explanation: "六員環+二重結合1つはシクロヘキセン。シクロヘキサン(C₆H₁₂)は飽和、ベンゼン(C₆H₆)は二重結合3つ相当。1-ヘキセンはC₆H₁₂で鎖状。分子式の水素数から不飽和度を確認する。",
    difficulty: 1
  },
  {
    id: "ALE024", category: "alkene", type: "struct_to_name",
    question: "次の構造式で表される化合物の名称はどれか。",
    prompt: "C₂H₅    C₂H₅\n    \\      /\n     C == C\n    /      \\\n   H       H",
    choices: ["トランス-3-ヘキセン", "シス-3-ヘキセン", "シス-2-ヘキセン", "シス-3-ヘキシン"],
    answer: 1,
    explanation: "C6の中央(C3−C4)に二重結合があり、2つのエチル基が同じ側にあるのでシス形。反対側ならトランス形。主鎖の炭素数と二重結合の位置も併せて確認する。",
    difficulty: 2
  },

  // ================= アルキン (10) =================
  {
    id: "ALY011", category: "alkyne", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "HC≡C−CH₂−CH₂−CH₃",
    choices: ["4-ペンチン", "2-ペンチン", "1-ペンチン", "1-ペンテン"],
    answer: 2,
    explanation: "三重結合に近い端から番号を付けて1-ペンチン。逆端から数えた「4-ペンチン」が引っかけ。",
    difficulty: 1
  },
  {
    id: "ALY012", category: "alkyne", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CH₂−C≡C−CH₂−CH₃",
    choices: ["3-ヘキシン", "2-ヘキシン", "4-ヘキシン", "3-ヘキセン"],
    answer: 0,
    explanation: "C6の中央(C3−C4)に三重結合。どちらの端から数えても3位になる対称構造なので「4-ヘキシン」は誤り(小さい方の番号を採用)。",
    difficulty: 1
  },
  {
    id: "ALY013", category: "alkyne", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "HC≡CCH(CH₃)CH₂CH₃",
    choices: ["3-メチル-4-ペンチン", "3-メチル-1-ペンチン", "2-メチル-1-ペンチン", "3-メチル-1-ペンテン"],
    answer: 1,
    explanation: "三重結合に最小番号を与えて1-ペンチン、メチル基は3位。逆端から数えた「3-メチル-4-ペンチン」が引っかけ。「2-メチル-1-ペンチン」は三重結合炭素(sp炭素)に置換基が付く不可能な構造。",
    difficulty: 2
  },
  {
    id: "ALY014", category: "alkyne", type: "name_to_cond",
    question: "「2-ヘキシン」の示性式はどれか。",
    prompt: "2-ヘキシン",
    choices: [
      "HC≡C(CH₂)₃CH₃",
      "CH₃CH₂C≡CCH₂CH₃",
      "CH₃C≡C(CH₂)₂CH₃",
      "CH₃CH=CH(CH₂)₂CH₃"
    ],
    answer: 2,
    explanation: "ヘキシン(C6)のC2−C3間に三重結合。「HC≡C(CH₂)₃CH₃」は1-ヘキシン、「CH₃CH₂C≡CCH₂CH₃」は3-ヘキシン、「CH₃CH=CH(CH₂)₂CH₃」は2-ヘキセン(二重結合)。",
    difficulty: 1
  },
  {
    id: "ALY015", category: "alkyne", type: "name_to_struct",
    question: "「3,3-ジメチル-1-ブチン」の構造式はどれか。",
    prompt: "3,3-ジメチル-1-ブチン",
    choices: [
      "HC≡C−CH(CH₃)−CH₃",
      "CH₃−C≡C−C(CH₃)₃",
      "CH₂=CH−C(CH₃)₃",
      "HC≡C−C(CH₃)₃"
    ],
    answer: 3,
    explanation: "ブチン主鎖(三重結合1,2位)のC3にメチル基2つ。「HC≡C−CH(CH₃)−CH₃」は3-メチル-1-ブチン(1つだけ)、「CH₃−C≡C−C(CH₃)₃」は4,4-ジメチル-2-ペンチン(C7)、「CH₂=CH−C(CH₃)₃」はアルケン(3,3-ジメチル-1-ブテン)。",
    difficulty: 2
  },
  {
    id: "ALY016", category: "alkyne", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "HC≡C−C≡CH",
    choices: ["1,3-ブタジエン", "1,3-ブタジイン", "1,2-ブタジイン", "2-ブチン"],
    answer: 1,
    explanation: "三重結合2つの語尾は「ジイン」で位置は1,3。二重結合の「ジエン」との語尾の混同が最大の引っかけ。",
    difficulty: 2
  },
  {
    id: "ALY017", category: "alkyne", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−C≡C−CH₂−CH(CH₃)−CH₃",
    choices: ["2-メチル-4-ヘキシン", "5-メチル-2-ヘキシン", "5-メチル-3-ヘキシン", "5-メチル-2-ヘキセン"],
    answer: 1,
    explanation: "三重結合の位置が最小になる端(CH₃側)から数えて三重結合2位・メチル基5位。置換基に近い端から数えた「2-メチル-4-ヘキシン」が引っかけ。番号付けは置換基より三重結合が優先。",
    difficulty: 2
  },
  {
    id: "ALY018", category: "alkyne", type: "name_to_cond",
    question: "「1-ヘプチン」の示性式はどれか。",
    prompt: "1-ヘプチン",
    choices: [
      "CH₃C≡C(CH₂)₃CH₃",
      "HC≡C(CH₂)₄CH₃",
      "HC≡C(CH₂)₃CH₃",
      "CH₂=CH(CH₂)₄CH₃"
    ],
    answer: 1,
    explanation: "C7の末端(C1)に三重結合。「CH₃C≡C(CH₂)₃CH₃」は2-ヘプチン、「HC≡C(CH₂)₃CH₃」はC6の1-ヘキシン(炭素数ミス)、「CH₂=CH(CH₂)₄CH₃」は1-ヘプテン(二重結合)。",
    difficulty: 1
  },
  {
    id: "ALY019", category: "alkyne", type: "name_to_cond",
    question: "「4,4-ジメチル-2-ペンチン」の示性式はどれか。",
    prompt: "4,4-ジメチル-2-ペンチン",
    choices: [
      "CH₃C≡CC(CH₃)₃",
      "CH₃C≡CCH(CH₃)CH₃",
      "(CH₃)₃CC≡CH",
      "CH₃C≡CC(CH₃)₂CH₂CH₃"
    ],
    answer: 0,
    explanation: "ペンチン主鎖(三重結合2,3位)のC4にメチル基2つ → CH₃C≡CC(CH₃)₃。「CH₃C≡CCH(CH₃)CH₃」は4-メチル-2-ペンチン、「(CH₃)₃CC≡CH」は3,3-ジメチル-1-ブチン、「CH₃C≡CC(CH₃)₂CH₂CH₃」はC7の別化合物。",
    difficulty: 2
  },
  {
    id: "ALY020", category: "alkyne", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃CH₂C≡C(CH₂)₂CH₃",
    choices: ["4-ヘプチン", "3-ヘプチン", "3-ヘプテン", "3-ヘキシン"],
    answer: 1,
    explanation: "C7で三重結合はC3−C4間。小さい方の番号を採用して3-ヘプチン。「4-ヘプチン」は逆端読み。炭素数の数え間違い(ヘキシン)にも注意。",
    difficulty: 1
  },

  // ================= アルコール (12) =================
  {
    id: "OL013", category: "alcohol", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CH₂−CH₂−CH₂−OH",
    choices: ["1-ブタノール", "4-ブタノール", "ブタノール", "1-ブタナール"],
    answer: 0,
    explanation: "OH基に近い端から番号を付けて1-ブタノール。「4-ブタノール」は逆端読み。2-ブタノールという異性体があるため位置番号の省略も不可。",
    difficulty: 1
  },
  {
    id: "OL014", category: "alcohol", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−C(CH₃)(OH)−CH₂−CH₃",
    choices: ["3-メチル-3-ブタノール", "2-メチル-2-ブタノール", "2-メチル-2-プロパノール", "3-メチル-2-ブタノール"],
    answer: 1,
    explanation: "OH基が最小番号になる端から数えてOHとメチル基がともに2位。逆端から数えた「3-メチル-3-ブタノール」は番号最小則違反。主鎖はC4(ブタン)で、C3と数え間違えるとプロパノール系に引っかかる。",
    difficulty: 2
  },
  {
    id: "OL015", category: "alcohol", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃CH₂CH(OH)CH₂CH₃",
    choices: ["2-ペンタノール", "3-ペンタノール", "1-ペンタノール", "3-ペンタノン"],
    answer: 1,
    explanation: "C5の中央(C3)にOH。どちらの端から数えても3位の対称構造。「3-ペンタノン」はC=Oをもつケトンで語尾が異なる。",
    difficulty: 1
  },
  {
    id: "OL016", category: "alcohol", type: "name_to_cond",
    question: "「2-ヘキサノール」の示性式はどれか。",
    prompt: "2-ヘキサノール",
    choices: [
      "CH₃CH₂CH(OH)CH₂CH₂CH₃",
      "CH₃CH(OH)CH₂CH₂CH₃",
      "CH₃CH(OH)(CH₂)₃CH₃",
      "CH₃CO(CH₂)₃CH₃"
    ],
    answer: 2,
    explanation: "ヘキサン(C6)のC2にOH。「CH₃CH₂CH(OH)CH₂CH₂CH₃」は3-ヘキサノール、「CH₃CH(OH)CH₂CH₂CH₃」は2-ペンタノール(C5)、「CH₃CO(CH₂)₃CH₃」は2-ヘキサノン(ケトン)。主鎖の炭素数とOHの位置を両方確認する。",
    difficulty: 1
  },
  {
    id: "OL017", category: "alcohol", type: "name_to_struct",
    question: "「3-メチル-2-ブタノール」の構造式はどれか。",
    prompt: "3-メチル-2-ブタノール",
    choices: [
      "CH₃−CH(OH)−CH(CH₃)−CH₃",
      "CH₃−C(CH₃)(OH)−CH₂−CH₃",
      "CH₃−CH(OH)−CH₂−CH₂−CH₃",
      "(CH₃)₂CH−CH₂−CH₂−OH"
    ],
    answer: 0,
    explanation: "ブタン主鎖のC2にOH、C3にメチル基。「CH₃−C(CH₃)(OH)−CH₂−CH₃」は2-メチル-2-ブタノール、「CH₃−CH(OH)−CH₂−CH₂−CH₃」は2-ペンタノール、「(CH₃)₂CH−CH₂−CH₂−OH」は3-メチル-1-ブタノール。OHの位置とメチル基の位置を取り違えないこと。",
    difficulty: 2
  },
  {
    id: "OL018", category: "alcohol", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "HO−CH₂−CH₂−CH₂−OH",
    choices: ["1,2-プロパンジオール", "1,3-プロパンジオール", "プロパンジオール", "1,3-プロパンジアール"],
    answer: 1,
    explanation: "C3の両末端(1,3位)にOH。1,2-プロパンジオールという異性体があるため位置番号は省略不可。「ジアール」はアルデヒド2つの語尾で別物。",
    difficulty: 1
  },
  {
    id: "OL019", category: "alcohol", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃CH(OH)CH₂OH",
    choices: ["1,3-プロパンジオール", "2,3-プロパンジオール", "1,2-プロパンジオール", "1,2,3-プロパントリオール"],
    answer: 2,
    explanation: "OH基の位置番号の組が最小になるように数えて1,2-。逆端から数えた「2,3-」は番号最小則違反。OHは2つなので「トリオール」ではない。",
    difficulty: 2
  },
  {
    id: "OL020", category: "alcohol", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CH=CH−CH₂−OH",
    choices: ["2-ブテン-1-オール", "2-ブテン-4-オール", "3-ブテン-1-オール", "2-ブタノール"],
    answer: 0,
    explanation: "OH基(主特性基)に最小番号を与えるのが最優先なので、OH側から数えてOHが1位・二重結合が2位。二重結合を優先して数えた「2-ブテン-4-オール」型の誤りに注意。",
    difficulty: 2
  },
  {
    id: "OL021", category: "alcohol", type: "name_to_cond",
    question: "「2-プロペン-1-オール」の示性式はどれか。",
    prompt: "2-プロペン-1-オール",
    choices: [
      "CH₃CH=CHOH",
      "CH₂=CHCH₂OH",
      "CH₃CH₂CH₂OH",
      "CH₃CH₂CHO"
    ],
    answer: 1,
    explanation: "OHがC1、二重結合がC2−C3(慣用名: アリルアルコール)。「CH₃CH=CHOH」は1-プロペン-1-オール(OHが二重結合炭素上)、「CH₃CH₂CH₂OH」は飽和の1-プロパノール、「CH₃CH₂CHO」はプロパナール(同じ分子式C₃H₆Oの異性体)。",
    difficulty: 2
  },
  {
    id: "OL022", category: "alcohol", type: "cond_to_name",
    question: "次の示性式で表される化合物の名称はどれか。",
    prompt: "C₆H₅CH₂OH",
    choices: ["フェノール", "ベンジルアルコール", "o-クレゾール", "アニソール"],
    answer: 1,
    explanation: "OHがベンゼン環に直接ではなくCH₂を介して付いているのでアルコール(ベンジルアルコール)。環に直接OHが付くフェノール(C₆H₅OH)との区別が最重要。クレゾールはメチルフェノール、アニソールはエーテル。",
    difficulty: 2
  },
  {
    id: "OL023", category: "alcohol", type: "struct_to_name",
    question: "シクロペンタン環の1つの炭素にOHが付いた化合物のIUPAC名はどれか。",
    prompt: "シクロペンタン環−OH",
    choices: ["シクロペンタノン", "1-ペンタノール", "シクロペンタノール", "フェノール"],
    answer: 2,
    explanation: "五員環アルコールなのでシクロペンタノール(置換基1つなので位置番号不要)。「シクロペンタノン」はC=Oをもつケトン。鎖状の1-ペンタノールとはHの数が異なる。",
    difficulty: 1
  },
  {
    id: "OL024", category: "alcohol", type: "name_to_cond",
    question: "「2,3-ブタンジオール」の示性式はどれか。",
    prompt: "2,3-ブタンジオール",
    choices: [
      "CH₃CH(OH)CH₂CH₂OH",
      "HOCH₂CH₂CH₂CH₂OH",
      "CH₃COCH(OH)CH₃",
      "CH₃CH(OH)CH(OH)CH₃"
    ],
    answer: 3,
    explanation: "ブタン(C4)のC2とC3にOH。「CH₃CH(OH)CH₂CH₂OH」は1,3-ブタンジオール、「HOCH₂CH₂CH₂CH₂OH」は1,4-ブタンジオール、「CH₃COCH(OH)CH₃」はOHとC=O(ケトン)を1つずつもつ別の化合物。",
    difficulty: 1
  },

  // ================= アルデヒド (10) =================
  {
    id: "AL011", category: "aldehyde", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CH₂−CH₂−CH₂−CHO",
    choices: ["ブタナール", "ペンタノール", "ペンタナール", "2-ペンタノン"],
    answer: 2,
    explanation: "CHOの炭素も含めてC5なのでペンタナール。CHO炭素を数え忘れた「ブタナール」が定番の誤り。語尾「-ナール」(アルデヒド)と「-ノール」(アルコール)の混同にも注意。",
    difficulty: 1
  },
  {
    id: "AL012", category: "aldehyde", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CH₂−CH(CH₃)−CHO",
    choices: ["3-メチルブタナール", "2-メチルブタナール", "ペンタナール", "2-メチルブタノール"],
    answer: 1,
    explanation: "CHO炭素が必ず1位なので、メチル基は2位。CHOから遠い側から数えた「3-メチルブタナール」は誤り(それは別の化合物の正しい名前でもある点に注意)。全炭素数5でも直鎖ではないのでペンタナールではない。",
    difficulty: 2
  },
  {
    id: "AL013", category: "aldehyde", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "OHC(CH₂)₂CHO",
    choices: ["ブタンジオール", "ブタンジアール", "プロパンジアール", "ブタナール"],
    answer: 1,
    explanation: "両末端にCHOをもつC4のジアルデヒドでブタンジアール。CHO炭素2つを炭素数に含める。「ジオール」(OH×2)との語尾の区別が最大のポイント。",
    difficulty: 2
  },
  {
    id: "AL014", category: "aldehyde", type: "name_to_cond",
    question: "「ヘキサナール」の示性式はどれか。",
    prompt: "ヘキサナール",
    choices: [
      "CH₃(CH₂)₃CHO",
      "CH₃(CH₂)₄CH₂OH",
      "CH₃CO(CH₂)₃CH₃",
      "CH₃(CH₂)₄CHO"
    ],
    answer: 3,
    explanation: "CHO炭素を含めてC6。「CH₃(CH₂)₃CHO」はペンタナール(C5)、「CH₃(CH₂)₄CH₂OH」は1-ヘキサノール、「CH₃CO(CH₂)₃CH₃」は2-ヘキサノン(同じ分子式C₆H₁₂Oのケトン異性体)。",
    difficulty: 1
  },
  {
    id: "AL015", category: "aldehyde", type: "name_to_struct",
    question: "「3-メチルペンタナール」の構造式はどれか。",
    prompt: "3-メチルペンタナール",
    choices: [
      "CH₃−CH(CH₃)−CH₂−CH₂−CHO",
      "CH₃−CH₂−CH(CH₃)−CH₂−CHO",
      "CH₃−CH₂−CH₂−CH(CH₃)−CHO",
      "CH₃−CH₂−CH(CH₃)−CH₂−CH₂−OH"
    ],
    answer: 1,
    explanation: "CHO=C1として3位にメチル基。「CH₃−CH(CH₃)−CH₂−CH₂−CHO」は4-メチルペンタナール、「CH₃−CH₂−CH₂−CH(CH₃)−CHO」は2-メチルペンタナール、「CH₃−CH₂−CH(CH₃)−CH₂−CH₂−OH」はアルコール(3-メチル-1-ペンタノール)。CHO側から数えることが鉄則。",
    difficulty: 2
  },
  {
    id: "AL016", category: "aldehyde", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名(体系名)はどれか。",
    prompt: "CH₂=CH−CHO",
    choices: ["プロパナール", "アクロレイン", "プロペナール", "2-プロペン-1-オール"],
    answer: 2,
    explanation: "CHO=C1で二重結合がC2−C3にある不飽和アルデヒド。「アクロレイン」は慣用名。飽和の「プロパナール」、アルコールの「プロペノール」との区別に注意。",
    difficulty: 2
  },
  {
    id: "AL017", category: "aldehyde", type: "cond_to_name",
    question: "次の示性式で表される化合物の名称はどれか。",
    prompt: "C₆H₅CHO",
    choices: ["ベンジルアルコール", "安息香酸", "フェノール", "ベンズアルデヒド"],
    answer: 3,
    explanation: "ベンゼン環にCHOが直結した芳香族アルデヒド。酸化すると安息香酸(C₆H₅COOH)、還元するとベンジルアルコール(C₆H₅CH₂OH)になる関係も併せて覚える。",
    difficulty: 1
  },
  {
    id: "AL018", category: "aldehyde", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CH=CH−CH₂−CHO",
    choices: ["2-ペンテナール", "3-ペンテナール", "3-ペンテン-1-オール", "ペンタナール"],
    answer: 1,
    explanation: "CHOの炭素が必ず1位なので、二重結合はC3−C4間で3-ペンテナール。CHOと反対側から数えた「2-ペンテナール」が引っかけ。語尾「-オール」はアルコールで別物。",
    difficulty: 2
  },
  {
    id: "AL019", category: "aldehyde", type: "name_to_cond",
    question: "「2-メチル-2-ブテナール」の示性式はどれか。",
    prompt: "2-メチル-2-ブテナール",
    choices: [
      "CH₃CH=C(CH₃)CHO",
      "CH₃C(CH₃)=CHCHO",
      "CH₂=C(CH₃)CH₂CHO",
      "CH₃CH(CH₃)CH₂CHO"
    ],
    answer: 0,
    explanation: "CHO=C1、二重結合がC2−C3、メチル基がC2。「CH₃C(CH₃)=CHCHO」は3-メチル-2-ブテナール、「CH₂=C(CH₃)CH₂CHO」は3-メチル-3-ブテナール、「CH₃CH(CH₃)CH₂CHO」は飽和の3-メチルブタナール。番号がすべてCHO基準である点に注意。",
    difficulty: 3
  },
  {
    id: "AL020", category: "aldehyde", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "(CH₃)₃CCHO",
    choices: ["3,3-ジメチルプロパナール", "2,2-ジメチルプロパナール", "2,2-ジメチル-1-プロパノール", "2-メチルブタナール"],
    answer: 1,
    explanation: "CHO=C1で、C2にメチル基2つ。プロパナール主鎖(C3)で「3,3-」の位置は末端CH₃なので「3,3-ジメチルプロパナール」は成立しない名前。語尾-オールとの混同にも注意。",
    difficulty: 2
  },

  // ================= ケトン (10) =================
  {
    id: "KE011", category: "ketone", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CH₂−CO−CH₂−CH₂−CH₃",
    choices: ["4-ヘキサノン", "3-ヘキサノン", "2-ヘキサノン", "3-ヘキサノール"],
    answer: 1,
    explanation: "C=Oの位置番号が小さくなる端から数えて3-ヘキサノン(逆端からは4)。カルボニル基の左右の炭素数(2個と3個)を正確に数える。",
    difficulty: 1
  },
  {
    id: "KE012", category: "ketone", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃CO(CH₂)₃CH₃",
    choices: ["5-ヘキサノン", "2-ヘキサノン", "2-ペンタノン", "ヘキサナール"],
    answer: 1,
    explanation: "C=Oを含めてC6でC=Oは2位。逆端から数えた「5-ヘキサノン」が引っかけ。(CH₂)₃の展開を忘れると炭素数を間違える。",
    difficulty: 1
  },
  {
    id: "KE013", category: "ketone", type: "name_to_cond",
    question: "「2,5-ヘキサンジオン」の示性式はどれか。",
    prompt: "2,5-ヘキサンジオン",
    choices: [
      "CH₃COCH₂CH₂COCH₃",
      "CH₃COCH₂COCH₂CH₃",
      "CH₃COCOCH₂CH₂CH₃",
      "CH₃CH(OH)CH₂CH₂CH(OH)CH₃"
    ],
    answer: 0,
    explanation: "ヘキサン(C6)のC2とC5にC=O。「CH₃COCH₂COCH₂CH₃」は2,4-ヘキサンジオン、「CH₃COCOCH₂CH₂CH₃」は2,3-ヘキサンジオン、「CH₃CH(OH)CH₂CH₂CH(OH)CH₃」は2,5-ヘキサンジオール(アルコール)。",
    difficulty: 2
  },
  {
    id: "KE014", category: "ketone", type: "name_to_struct",
    question: "「シクロペンタノン」の構造として正しいものはどれか。",
    prompt: "シクロペンタノン",
    choices: [
      "五員環の1つの炭素がC=Oになった構造",
      "六員環の1つの炭素がC=Oになった構造",
      "五員環の1つの炭素にOHが付いた構造",
      "CH₃−CO−CH₂−CH₂−CH₃(鎖状)"
    ],
    answer: 0,
    explanation: "「シクロペンタ」=五員環、「-ノン」=ケトン(環内炭素がC=O)。六員環はシクロヘキサノン、OHならシクロペンタノール、鎖状のCH₃COC₃H₇は2-ペンタノン。",
    difficulty: 1
  },
  {
    id: "KE015", category: "ketone", type: "struct_to_name",
    question: "次の構造式で表される化合物の名称はどれか。",
    prompt: "C₆H₅−CO−CH₃(ベンゼン環−CO−CH₃)",
    choices: ["ベンズアルデヒド", "アセトフェノン", "安息香酸メチル", "ベンゾフェノン"],
    answer: 1,
    explanation: "ベンゼン環にアセチル基(CH₃CO−)が付いた芳香族ケトン(アセトフェノン)。ベンズアルデヒドはC₆H₅CHO、安息香酸メチルはエステル(C₆H₅COOCH₃)、ベンゾフェノンはC₆H₅COC₆H₅。",
    difficulty: 2
  },
  {
    id: "KE016", category: "ketone", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃CH₂COCH(CH₃)CH₃",
    choices: ["4-メチル-3-ペンタノン", "2-メチル-3-ペンタノン", "3-メチル-2-ペンタノン", "2-メチル-2-ペンタノン"],
    answer: 1,
    explanation: "C=Oはどちらの端から数えても3位(同点)。同点の場合は置換基が最小番号になる向きを選ぶので、メチル基が2位になる「2-メチル-3-ペンタノン」が正しい。「4-メチル-3-ペンタノン」はタイブレークの規則を知らないと選びがち。",
    difficulty: 3
  },
  {
    id: "KE017", category: "ketone", type: "name_to_cond",
    question: "「3,3-ジメチル-2-ブタノン」の示性式はどれか。",
    prompt: "3,3-ジメチル-2-ブタノン",
    choices: [
      "CH₃COCH(CH₃)CH₃",
      "CH₃COCH₂CH(CH₃)CH₃",
      "CH₃COC(CH₃)₃",
      "(CH₃)₃CCHO"
    ],
    answer: 2,
    explanation: "ブタノン主鎖(C=OがC2)のC3にメチル基2つ → CH₃COC(CH₃)₃。「CH₃COCH(CH₃)CH₃」は3-メチル-2-ブタノン(1つだけ)、「CH₃COCH₂CH(CH₃)CH₃」は4-メチル-2-ペンタノン、「(CH₃)₃CCHO」はアルデヒド(2,2-ジメチルプロパナール)。",
    difficulty: 2
  },
  {
    id: "KE018", category: "ketone", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CO−CH(CH₃)−CH₂−CH₃",
    choices: ["2-メチル-3-ペンタノン", "3-メチル-2-ペンタノン", "3-メチル-4-ペンタノン", "3-メチル-2-ペンタノール"],
    answer: 1,
    explanation: "C=Oに最小番号を与える端から数えてC=Oが2位・メチル基が3位。逆端から数えるとC=Oが4位になってしまう。「2-メチル-3-ペンタノン」はC=Oが中央にある別の化合物。",
    difficulty: 2
  },
  {
    id: "KE019", category: "ketone", type: "cond_to_name",
    question: "次の示性式で表される化合物の名称はどれか。",
    prompt: "C₆H₅COC₆H₅",
    choices: ["アセトフェノン", "ジフェニルエーテル", "ベンゾフェノン", "安息香酸フェニル"],
    answer: 2,
    explanation: "ベンゼン環2つがC=Oをはさんだ芳香族ケトン(ベンゾフェノン)。ジフェニルエーテルはC₆H₅OC₆H₅(Oのみ)で、COとOの読み分けがポイント。",
    difficulty: 2
  },
  {
    id: "KE020", category: "ketone", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CO−CH=CH₂",
    choices: ["1-ブテン-3-オン", "3-ブテン-2-オン", "3-ブテン-2-オール", "2-ブタノン"],
    answer: 1,
    explanation: "ケトン(主特性基)のC=Oに最小番号を与えるので、C=Oが2位・二重結合が3位(メチルビニルケトン)。二重結合を優先して数えた「1-ブテン-3-オン」が引っかけ。番号付けの優先順位はC=O>二重結合。",
    difficulty: 3
  },

  // ================= カルボン酸 (12) =================
  {
    id: "CA013", category: "carboxylic_acid", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃(CH₂)₃COOH",
    choices: ["ブタン酸", "ペンタン酸", "ヘキサン酸", "ペンタナール"],
    answer: 1,
    explanation: "COOHの炭素を含めてC5なのでペンタン酸。COOH炭素を数え忘れた「ブタン酸」が最頻出の誤り。",
    difficulty: 1
  },
  {
    id: "CA014", category: "carboxylic_acid", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CH₂−CH(CH₃)−COOH",
    choices: ["2-メチルブタン酸", "3-メチルブタン酸", "2-エチルプロパン酸", "2-メチルブタナール"],
    answer: 0,
    explanation: "COOH=C1なのでメチル基は2位。COOHから遠い側から数えた「3-メチルブタン酸」、短い鎖を主鎖にした「2-エチルプロパン酸」(無効名)が引っかけ。",
    difficulty: 2
  },
  {
    id: "CA015", category: "carboxylic_acid", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名(体系名)はどれか。",
    prompt: "CH₃(CH₂)₄COOH",
    choices: ["ペンタン酸", "ヘキサン酸", "カプロン酸", "ヘキサナール"],
    answer: 1,
    explanation: "COOH炭素を含めてC6なのでヘキサン酸。「カプロン酸」は慣用名。炭素数の数え間違いと慣用名の両方が引っかけ。",
    difficulty: 1
  },
  {
    id: "CA016", category: "carboxylic_acid", type: "name_to_cond",
    question: "「2-クロロプロパン酸」の示性式はどれか。",
    prompt: "2-クロロプロパン酸",
    choices: [
      "ClCH₂CH₂COOH",
      "CH₃CHClCOOH",
      "ClCH₂COOH",
      "CH₃CHClCH₂COOH"
    ],
    answer: 1,
    explanation: "COOH=C1として2位(隣の炭素)にCl。「ClCH₂CH₂COOH」は3-クロロプロパン酸、「ClCH₂COOH」はクロロ酢酸(C2)、「CH₃CHClCH₂COOH」は3-クロロブタン酸(C4)。",
    difficulty: 2
  },
  {
    id: "CA017", category: "carboxylic_acid", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "Cl−CH₂−CH₂−COOH",
    choices: ["1-クロロプロパン酸", "2-クロロプロパン酸", "3-クロロプロパン酸", "3-クロロプロパナール"],
    answer: 2,
    explanation: "COOHの炭素が必ず1位なので、Clは3位。Cl側から番号を付けた「1-クロロプロパン酸」は誤り(カルボン酸では番号付けの向きに選択の余地はない)。",
    difficulty: 2
  },
  {
    id: "CA018", category: "carboxylic_acid", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名(体系名)はどれか。",
    prompt: "HOOC(CH₂)₃COOH",
    choices: ["ブタン二酸", "ペンタン二酸", "グルタル酸", "プロパン二酸"],
    answer: 1,
    explanation: "両端のCOOH炭素2つ+中央のCH₂3つでC5なのでペンタン二酸。「グルタル酸」は慣用名。COOH炭素の数え忘れで「プロパン二酸」としないこと。",
    difficulty: 2
  },
  {
    id: "CA019", category: "carboxylic_acid", type: "name_to_cond",
    question: "「ヘキサン二酸」の示性式はどれか。",
    prompt: "ヘキサン二酸",
    choices: [
      "HOOC(CH₂)₃COOH",
      "HOOC(CH₂)₄COOH",
      "CH₃(CH₂)₄COOH",
      "HOOC(CH₂)₂COOH"
    ],
    answer: 1,
    explanation: "C6のジカルボン酸(慣用名: アジピン酸、ナイロン原料)。COOH炭素2つを含めるので中央のCH₂は4つ。「HOOC(CH₂)₃COOH」はペンタン二酸、「CH₃(CH₂)₄COOH」はヘキサン酸(モノカルボン酸)、「HOOC(CH₂)₂COOH」はブタン二酸。",
    difficulty: 2
  },
  {
    id: "CA020", category: "carboxylic_acid", type: "struct_to_name",
    question: "次の構造式で表される化合物(トランス形)の慣用名はどれか。",
    prompt: "HOOC       H\n     \\      /\n      C == C\n     /      \\\n    H      COOH",
    choices: ["マレイン酸", "フマル酸", "シュウ酸", "コハク酸"],
    answer: 1,
    explanation: "2つのCOOHが二重結合をはさんで反対側にあるトランス形がフマル酸、同じ側のシス形がマレイン酸。シス形のみ加熱で分子内脱水して酸無水物になる、という性質と対で問われる。",
    difficulty: 2
  },
  {
    id: "CA021", category: "carboxylic_acid", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CH=CH−COOH",
    choices: ["3-ブテン酸", "2-ブテン酸", "ブタン酸", "2-ブチン酸"],
    answer: 1,
    explanation: "COOHの炭素が必ず1位なので、二重結合はC2−C3間で2-ブテン酸(慣用名: クロトン酸)。COOHと反対側から数えた「3-ブテン酸」は誤り。「-ブチン酸」は三重結合の場合。",
    difficulty: 2
  },
  {
    id: "CA022", category: "carboxylic_acid", type: "name_to_cond",
    question: "「ヘプタン酸」の示性式はどれか。",
    prompt: "ヘプタン酸",
    choices: [
      "CH₃(CH₂)₄COOH",
      "CH₃(CH₂)₅COOH",
      "CH₃(CH₂)₆COOH",
      "CH₃(CH₂)₅CHO"
    ],
    answer: 1,
    explanation: "COOHの炭素を含めてC7。「CH₃(CH₂)₄COOH」はヘキサン酸(C6)、「CH₃(CH₂)₆COOH」はオクタン酸(C8)、「CH₃(CH₂)₅CHO」はヘプタナール(アルデヒド)。(CH₂)ₙの展開とCOOH炭素の数え方がポイント。",
    difficulty: 1
  },
  {
    id: "CA023", category: "carboxylic_acid", type: "cond_to_name",
    question: "ベンゼン環のパラ位(1,4位)にCH₃とCOOHが付いた化合物の名称はどれか。",
    prompt: "CH₃−C₆H₄−COOH(パラ位)",
    choices: ["安息香酸", "フェニル酢酸", "4-メチル安息香酸", "2-メチル安息香酸"],
    answer: 2,
    explanation: "安息香酸(COOHを1位とする)の4位にメチル基が付いた構造。パラ位=4位。オルト位なら2-メチル安息香酸。COOHが環に直結している点でフェニル酢酸(C₆H₅CH₂COOH)と異なる。",
    difficulty: 2
  },
  {
    id: "CA024", category: "carboxylic_acid", type: "cond_to_name",
    question: "次の示性式で表される化合物の名称はどれか。",
    prompt: "C₆H₅CH₂COOH",
    choices: ["安息香酸", "4-メチル安息香酸", "ベンジルアルコール", "フェニル酢酸"],
    answer: 3,
    explanation: "COOHがCH₂を介してベンゼン環に付いているのでフェニル酢酸(酢酸のH1つをフェニル基で置換した形)。環に直結する安息香酸(C₆H₅COOH)との構造の違いを正確に読む。",
    difficulty: 2
  },

  // ================= エステル (12) =================
  {
    id: "ES013", category: "ester", type: "cond_to_name",
    question: "次の示性式で表される化合物の名称はどれか。",
    prompt: "CH₃COO(CH₂)₃CH₃",
    choices: ["ブタン酸エチル", "酢酸ブチル", "プロパン酸プロピル", "ペンタン酸メチル"],
    answer: 1,
    explanation: "CH₃CO−が酢酸由来、−O(CH₂)₃CH₃が1-ブタノール由来なので酢酸ブチル。「ブタン酸エチル」「プロパン酸プロピル」は同じ分子式C₆H₁₂O₂の異性体で、エステル結合の切れ目を読み違えると引っかかる。",
    difficulty: 2
  },
  {
    id: "ES014", category: "ester", type: "cond_to_name",
    question: "次の示性式で表される化合物の名称はどれか。",
    prompt: "HCOOCH₂CH₂CH₃",
    choices: ["ギ酸プロピル", "酢酸エチル", "プロパン酸メチル", "ギ酸メチル"],
    answer: 0,
    explanation: "HCO−がギ酸由来、−OC₃H₇が1-プロパノール由来。「酢酸エチル」「プロパン酸メチル」は同じ分子式C₄H₈O₂の異性体。先頭のHを見落とすと酢酸系と誤読する。",
    difficulty: 2
  },
  {
    id: "ES015", category: "ester", type: "name_to_cond",
    question: "「酢酸イソアミル(酢酸3-メチルブチル)」の示性式はどれか。",
    prompt: "酢酸イソアミル(バナナの香り)",
    choices: [
      "CH₃COOCH₂CH₂CH(CH₃)₂",
      "(CH₃)₂CHCH₂COOCH₃",
      "CH₃COO(CH₂)₄CH₃",
      "CH₃COOCH(CH₃)CH₂CH₃"
    ],
    answer: 0,
    explanation: "酢酸とイソアミルアルコール((CH₃)₂CHCH₂CH₂OH)のエステル。「(CH₃)₂CHCH₂COOCH₃」は3-メチルブタン酸メチル(酸側とアルコール側が逆)、「CH₃COO(CH₂)₄CH₃」は酢酸ペンチル(直鎖)、「CH₃COOCH(CH₃)CH₂CH₃」は酢酸sec-ブチル。",
    difficulty: 2
  },
  {
    id: "ES016", category: "ester", type: "name_to_cond",
    question: "「安息香酸メチル」の示性式はどれか。",
    prompt: "安息香酸メチル",
    choices: [
      "CH₃COOC₆H₅",
      "C₆H₅COOCH₃",
      "C₆H₅CH₂COOCH₃",
      "C₆H₅COOC₂H₅"
    ],
    answer: 1,
    explanation: "安息香酸(C₆H₅COOH)のメチルエステル。「CH₃COOC₆H₅」は酢酸フェニルで、酸側とアルコール側が逆になった異性体(最大の引っかけ)。「C₆H₅CH₂COOCH₃」はフェニル酢酸メチル。",
    difficulty: 3
  },
  {
    id: "ES017", category: "ester", type: "cond_to_name",
    question: "次の示性式で表される化合物の名称はどれか。",
    prompt: "CH₃COOC₆H₅",
    choices: ["酢酸フェニル", "安息香酸メチル", "酢酸ベンジル", "サリチル酸メチル"],
    answer: 0,
    explanation: "CH₃CO−が酢酸由来で、フェノール(C₆H₅OH)とのエステルなので酢酸フェニル。「安息香酸メチル」(C₆H₅COOCH₃)は結合の向きが逆の異性体。ベンジル基(C₆H₅CH₂−)とフェニル基(C₆H₅−)の混同にも注意。",
    difficulty: 3
  },
  {
    id: "ES018", category: "ester", type: "name_to_cond",
    question: "「酢酸ベンジル」の示性式はどれか。",
    prompt: "酢酸ベンジル(ジャスミンの香り)",
    choices: [
      "CH₃COOC₆H₅",
      "C₆H₅COOCH₃",
      "CH₃COOCH₂C₆H₅",
      "C₆H₅CH₂COOCH₃"
    ],
    answer: 2,
    explanation: "酢酸とベンジルアルコール(C₆H₅CH₂OH)のエステル。ベンジル基はC₆H₅CH₂−(CH₂あり)、フェニル基はC₆H₅−(CH₂なし)。「CH₃COOC₆H₅」は酢酸フェニル、「C₆H₅CH₂COOCH₃」はフェニル酢酸メチル。",
    difficulty: 3
  },
  {
    id: "ES019", category: "ester", type: "struct_to_name",
    question: "次の構造式で表される化合物の名称はどれか。",
    prompt: "H−CO−O−CH(CH₃)−CH₃",
    choices: ["ギ酸プロピル", "ギ酸イソプロピル", "酢酸イソプロピル", "プロパン酸メチル"],
    answer: 1,
    explanation: "H−CO−がギ酸由来、−OCH(CH₃)₂は2-プロパノール由来のイソプロピル基。枝分かれを見落として直鎖の「ギ酸プロピル」とするのが引っかけ。",
    difficulty: 2
  },
  {
    id: "ES020", category: "ester", type: "struct_to_name",
    question: "次の構造式で表される化合物の名称はどれか。",
    prompt: "CH₃CH₂CH₂−O−CO−CH₂CH₃",
    choices: ["ブタン酸エチル", "酢酸ブチル", "プロパン酸プロピル", "プロパン酸エチル"],
    answer: 2,
    explanation: "C=Oをもつ右側のC₂H₅CO−がプロパン酸由来で、左のC₃H₇O−が1-プロパノール由来。「−O−CO−」の向きを「−CO−O−」と読み違えると酸とアルコールを逆に取ってしまう。ブタン酸エチル・酢酸ブチルは同じ分子式C₆H₁₂O₂の異性体。",
    difficulty: 3
  },
  {
    id: "ES021", category: "ester", type: "name_to_struct",
    question: "「ギ酸ブチル」の構造式はどれか。",
    prompt: "ギ酸ブチル",
    choices: [
      "H−CO−O−CH₂CH₂CH₂CH₃",
      "CH₃−CO−O−CH₂CH₂CH₃",
      "CH₃CH₂CH₂CH₂−CO−O−H",
      "H−CO−O−CH(CH₃)CH₂CH₃"
    ],
    answer: 0,
    explanation: "ギ酸(HCOOH)と1-ブタノールのエステル。「CH₃−CO−O−CH₂CH₂CH₃」は酢酸プロピル(同じ分子式C₅H₁₀O₂の異性体)、「CH₃CH₂CH₂CH₂−CO−O−H」はペンタン酸(エステルではなくカルボン酸)、「H−CO−O−CH(CH₃)CH₂CH₃」はギ酸sec-ブチル。",
    difficulty: 2
  },
  {
    id: "ES022", category: "ester", type: "cond_to_name",
    question: "次の示性式で表される化合物の名称はどれか。",
    prompt: "CH₃OOC−COOCH₃",
    choices: ["酢酸メチル", "シュウ酸ジメチル", "マロン酸ジメチル", "シュウ酸ジエチル"],
    answer: 1,
    explanation: "シュウ酸(HOOC−COOH)の両方のCOOHがメチルエステル化されたジエステル。「CH₃OOC−」は「−COOCH₃」を逆から書いた表記で、酢酸メチル(CH₃COOCH₃)と混同しやすい。マロン酸ジメチルは中央にCH₂が入る。",
    difficulty: 3
  },
  {
    id: "ES023", category: "ester", type: "cond_to_name",
    question: "次の示性式で表される化合物の名称はどれか。",
    prompt: "CH₂=CHCOOCH₃",
    choices: ["酢酸ビニル", "アクリル酸メチル", "メタクリル酸メチル", "プロパン酸メチル"],
    answer: 1,
    explanation: "CH₂=CHCO−がアクリル酸(プロペン酸)由来のアシル基。「酢酸ビニル」(CH₃COOCH=CH₂)は二重結合がアルコール側にある異性体で、どちら側に二重結合があるかの読み分けが最大のポイント。",
    difficulty: 3
  },
  {
    id: "ES024", category: "ester", type: "name_to_cond",
    question: "「メタクリル酸メチル」の示性式はどれか。",
    prompt: "メタクリル酸メチル(アクリル樹脂の原料)",
    choices: [
      "CH₂=CHCOOCH₃",
      "CH₃CH=CHCOOCH₃",
      "CH₂=C(CH₃)COOCH₃",
      "CH₂=C(CH₃)COOC₂H₅"
    ],
    answer: 2,
    explanation: "メタクリル酸はアクリル酸のα位(2位)にメチル基が付いた酸(2-メチルプロペン酸)。「CH₂=CHCOOCH₃」はアクリル酸メチル、「CH₃CH=CHCOOCH₃」はクロトン酸メチル(2-ブテン酸メチル)、「CH₂=C(CH₃)COOC₂H₅」はメタクリル酸エチル。",
    difficulty: 3
  },

  // ================= エーテル (10) =================
  {
    id: "ET011", category: "ether", type: "cond_to_name",
    question: "次の示性式で表される化合物の名称はどれか。",
    prompt: "CH₃CH₂OCH₂CH₂CH₃",
    choices: ["エチルプロピルエーテル", "エチルメチルエーテル", "ジエチルエーテル", "ジプロピルエーテル"],
    answer: 0,
    explanation: "Oの左右はエチル基(C2)と直鎖プロピル基(C3)。左右の炭素数を正確に数えないと、対称エーテルの「ジエチル」「ジプロピル」に引っかかる。",
    difficulty: 1
  },
  {
    id: "ET012", category: "ether", type: "name_to_cond",
    question: "「ブチルメチルエーテル」の示性式はどれか。",
    prompt: "ブチルメチルエーテル",
    choices: [
      "CH₃O(CH₂)₃CH₃",
      "C₂H₅OCH₂CH₂CH₃",
      "CH₃OC(CH₃)₃",
      "CH₃OCH₂CH₂CH₃"
    ],
    answer: 0,
    explanation: "メチル基(C1)と直鎖ブチル基(C4)のエーテル。「C₂H₅OCH₂CH₂CH₃」はエチルプロピルエーテル(同じ分子式C₅H₁₂Oの異性体)、「CH₃OC(CH₃)₃」は枝分かれしたブチル基をもつ別のエーテル、「CH₃OCH₂CH₂CH₃」はメチルプロピルエーテル(C4)。",
    difficulty: 2
  },
  {
    id: "ET013", category: "ether", type: "cond_to_name",
    question: "次の示性式で表される化合物の名称はどれか。",
    prompt: "(CH₃)₂CHOCH(CH₃)₂",
    choices: ["ジプロピルエーテル", "ジイソプロピルエーテル", "イソプロピルメチルエーテル", "ジエチルエーテル"],
    answer: 1,
    explanation: "枝分かれしたイソプロピル基((CH₃)₂CH−)2つの対称エーテル。直鎖プロピル基の「ジプロピルエーテル」とは異性体の関係で、枝分かれの有無の読み取りがポイント。",
    difficulty: 2
  },
  {
    id: "ET014", category: "ether", type: "struct_to_name",
    question: "次の構造式で表される化合物の名称はどれか。",
    prompt: "C₆H₅−CH₂−O−CH₃",
    choices: ["メチルフェニルエーテル", "ベンジルメチルエーテル", "エチルフェニルエーテル", "ベンジルアルコール"],
    answer: 1,
    explanation: "ベンゼン環がCH₂を介してOに結合しているのでベンジル基(C₆H₅CH₂−)のエーテル。環が直接Oに付く「メチルフェニルエーテル」(C₆H₅OCH₃)との区別が最大のポイント。",
    difficulty: 2
  },
  {
    id: "ET015", category: "ether", type: "cond_to_name",
    question: "次の示性式で表される化合物の名称はどれか。",
    prompt: "C₆H₅CH₂OC₂H₅",
    choices: ["エチルフェニルエーテル", "ベンジルエチルエーテル", "ベンジルメチルエーテル", "ジベンジルエーテル"],
    answer: 1,
    explanation: "ベンジル基(C₆H₅CH₂−)とエチル基のエーテル。環が直接Oに付く「エチルフェニルエーテル」(C₆H₅OC₂H₅)と混同しやすい。CH₂の有無を必ず確認する。",
    difficulty: 2
  },
  {
    id: "ET016", category: "ether", type: "cond_to_name",
    question: "次の示性式で表される化合物の名称はどれか。",
    prompt: "C₆H₅OC₆H₅",
    choices: ["ベンゾフェノン", "ジベンジルエーテル", "ジフェニルエーテル", "アニソール"],
    answer: 2,
    explanation: "ベンゼン環2つがOをはさんだ対称エーテル。ベンゾフェノン(C₆H₅COC₆H₅)はC=Oをもつケトンで、OとCOの読み分けが引っかけ。ジベンジルエーテルはC₆H₅CH₂OCH₂C₆H₅。",
    difficulty: 2
  },
  {
    id: "ET017", category: "ether", type: "name_to_cond",
    question: "「エチルフェニルエーテル」の示性式はどれか。",
    prompt: "エチルフェニルエーテル",
    choices: [
      "C₆H₅OC₂H₅",
      "C₆H₅CH₂OC₂H₅",
      "C₆H₅OCH₃",
      "C₆H₅C₂H₅"
    ],
    answer: 0,
    explanation: "フェニル基(C₆H₅−)がOに直結。「C₆H₅CH₂OC₂H₅」はベンジルエチルエーテル(CH₂を介する)、「C₆H₅OCH₃」はメチルフェニルエーテル(アニソール)、「C₆H₅C₂H₅」はエチルベンゼン(Oがなくエーテルではない)。",
    difficulty: 2
  },
  {
    id: "ET018", category: "ether", type: "name_to_cond",
    question: "分子式C₄H₁₀Oの構造異性体のうち、エーテルであるものの示性式はどれか。",
    prompt: "C₄H₁₀O",
    choices: [
      "CH₃CH₂CH₂CH₂OH",
      "CH₃CH(OH)CH₂CH₃",
      "C₂H₅OC₂H₅",
      "(CH₃)₃COH"
    ],
    answer: 2,
    explanation: "エーテルはC−O−C結合をもつ化合物(ジエチルエーテル)。他の3つはすべてヒドロキシ基をもつアルコール(1-ブタノール、2-ブタノール、2-メチル-2-プロパノール)。アルコールとエーテルの異性体関係は最頻出。",
    difficulty: 1
  },
  {
    id: "ET019", category: "ether", type: "name_to_cond",
    question: "分子式C₃H₈Oの構造異性体のうち、エーテルであるものの示性式はどれか。",
    prompt: "C₃H₈O",
    choices: [
      "CH₃CH₂CH₂OH",
      "CH₃OC₂H₅",
      "CH₃CH(OH)CH₃",
      "CH₃CH₂CHO"
    ],
    answer: 1,
    explanation: "C−O−C結合をもつのはエチルメチルエーテルのみ。1-プロパノールと2-プロパノールはアルコール。プロパナール(CH₃CH₂CHO)は分子式がC₃H₆Oで、そもそもC₃H₈Oの異性体ではない点も引っかけ。",
    difficulty: 2
  },
  {
    id: "ET020", category: "ether", type: "struct_to_name",
    question: "次の構造式で表される化合物の名称はどれか。",
    prompt: "C₆H₅−O−CH₂−CH₂−CH₃",
    choices: ["フェニルプロピルエーテル", "ベンジルエチルエーテル", "エチルフェニルエーテル", "ジフェニルエーテル"],
    answer: 0,
    explanation: "フェニル基が直接Oに結合し、相手は直鎖プロピル基。ベンジルエチルエーテル(C₆H₅CH₂OC₂H₅)は同じ分子式C₉H₁₂Oの異性体で、環とOの間のCH₂の有無で区別する。",
    difficulty: 2
  }

];
