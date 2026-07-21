// ============================================================
// IUPAC命名法 4択クイズ データ(100題)
// ============================================================
// 【スキーマ】
//   id         : 問題ID(分野略号+連番)
//   category   : フィルター用分野
//                "alkane" | "alkene" | "alkyne" | "alcohol" | "aldehyde"
//                | "ketone" | "carboxylic_acid" | "ester" | "ether"
//   type       : 出題形式
//                "struct_to_name" 構造式→IUPAC名
//                "name_to_struct" IUPAC名→構造式
//                "cond_to_name"   示性式→IUPAC名
//                "name_to_cond"   IUPAC名→示性式
//   question   : 問題文
//   prompt     : 提示する構造式/示性式/名称(\n を含む場合は <pre> 等で等幅表示推奨)
//   choices    : 選択肢4つ(文字列)
//   answer     : 正解のインデックス(0〜3)
//   explanation: 解説(引っかけポイント)
//   difficulty : 1(基本)〜3(発展)
//
// 【命名の方針】
//  ・日本の教科書で標準的なカタカナ名・旧ロカント表記(例: 2-ブタノール)を使用
//  ・「IUPAC名(体系名)」を問う問題では、慣用名(酢酸・アセトンなど)は不正解扱い
//  ・誤答はすべて「実際に生徒がやりがちなミス」に対応(解説参照)
// ============================================================

const IUPAC_QUIZ_DATA = [

  // ================= アルカン (12) =================
  {
    id: "ALK001", category: "alkane", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CH(CH₃)−CH₂−CH₃",
    choices: ["2-メチルブタン", "3-メチルブタン", "ペンタン", "2,2-ジメチルプロパン"],
    answer: 0,
    explanation: "最長鎖は炭素4つ(ブタン)。置換基に近い端から番号を付けるので2-メチル。逆端から数えた「3-メチルブタン」が定番の誤り。ペンタンは直鎖の異性体。",
    difficulty: 1
  },
  {
    id: "ALK002", category: "alkane", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−C(CH₃)₂−CH₃",
    choices: ["2,2-ジメチルブタン", "2,2-ジメチルプロパン", "ジメチルプロパン", "2-メチルブタン"],
    answer: 1,
    explanation: "最長鎖は炭素3つ(プロパン)で、C2にメチル基が2つ。同じ炭素に2つ付いていても位置番号は「2,2-」と2回書く。番号を省略した「ジメチルプロパン」は不完全な名前。",
    difficulty: 1
  },
  {
    id: "ALK003", category: "alkane", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CH(CH₃)−CH(CH₃)−CH₂−CH₃",
    choices: ["3,4-ジメチルペンタン", "2-エチル-3-メチルブタン", "2,3-ジメチルペンタン", "2,3-ジメチルヘキサン"],
    answer: 2,
    explanation: "最長鎖は5炭素(ペンタン)。置換基の位置番号が最小になる端から数えて2,3-ジメチル。逆端の「3,4-」や、短い鎖を主鎖に選んだ「2-エチル-3-メチルブタン」は誤り。",
    difficulty: 2
  },
  {
    id: "ALK004", category: "alkane", type: "name_to_struct",
    question: "「2,2-ジメチルブタン」の構造式はどれか。",
    prompt: "2,2-ジメチルブタン",
    choices: [
      "CH₃−CH(CH₃)−CH(CH₃)−CH₃",
      "CH₃−C(CH₃)₂−CH₃",
      "CH₃−C(CH₃)₂−CH₂−CH₃",
      "CH₃−CH(CH₃)−CH₂−CH₂−CH₃"
    ],
    answer: 2,
    explanation: "ブタン(C4)のC2にメチル基2つ。「CH₃−CH(CH₃)−CH(CH₃)−CH₃」は2,3-ジメチルブタン、「CH₃−C(CH₃)₂−CH₃」は2,2-ジメチルプロパン(C3主鎖)、「CH₃−CH(CH₃)−CH₂−CH₂−CH₃」は2-メチルペンタン。主鎖の炭素数を必ず確認する。",
    difficulty: 2
  },
  {
    id: "ALK005", category: "alkane", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃(CH₂)₃CH₃",
    choices: ["ブタン", "ペンタン", "ヘキサン", "2-メチルブタン"],
    answer: 1,
    explanation: "(CH₂)₃ の展開を含めて炭素は5個なのでペンタン。両端のCH₃を数え忘れて「ブタン」とするミスが多い。",
    difficulty: 1
  },
  {
    id: "ALK006", category: "alkane", type: "name_to_cond",
    question: "「2-メチルペンタン」の示性式はどれか。",
    prompt: "2-メチルペンタン",
    choices: [
      "CH₃CH₂CH(CH₃)CH₂CH₃",
      "CH₃CH(CH₃)CH₂CH₃",
      "CH₃CH(CH₃)CH₂CH₂CH₃",
      "CH₃C(CH₃)₂CH₂CH₃"
    ],
    answer: 2,
    explanation: "ペンタン(C5)のC2にメチル基。「CH₃CH₂CH(CH₃)CH₂CH₃」は3-メチルペンタン、「CH₃CH(CH₃)CH₂CH₃」は2-メチルブタン(主鎖C4)、「CH₃C(CH₃)₂CH₂CH₃」は2,2-ジメチルブタン。",
    difficulty: 1
  },
  {
    id: "ALK007", category: "alkane", type: "struct_to_name",
    question: "次の構造式(シクロヘキサン環に−CH₃が1つ)で表される化合物のIUPAC名はどれか。",
    prompt: "シクロヘキサン環−CH₃(環の炭素6+メチル基)",
    choices: ["シクロヘプタン", "メチルシクロヘキサン", "メチルシクロペンタン", "ヘプタン"],
    answer: 1,
    explanation: "環の炭素は6個で、メチル基は置換基。環と置換基の炭素を合算して「シクロヘプタン(C7の環)」としてしまうのが典型的な誤り。置換基が1つなら位置番号は不要。",
    difficulty: 1
  },
  {
    id: "ALK008", category: "alkane", type: "struct_to_name",
    question: "シクロペンタン環の隣り合う2つの炭素にメチル基が1つずつ付いた化合物のIUPAC名はどれか。",
    prompt: "シクロペンタン環(隣接位に CH₃ ×2)",
    choices: ["1,2-ジメチルシクロペンタン", "1,5-ジメチルシクロペンタン", "2,3-ジメチルシクロペンタン", "ジメチルシクロペンタン"],
    answer: 0,
    explanation: "環では位置番号の組が最小になるように番号を付けるので1,2-。逆回りに数えた「1,5-」や、1から始めない「2,3-」が引っかけ。異性体が複数あるため番号の省略も不可。",
    difficulty: 2
  },
  {
    id: "ALK009", category: "alkane", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃CH(CH₃)CH(CH₃)CH₃",
    choices: ["2,2-ジメチルブタン", "ヘキサン", "2,3-ジメチルブタン", "2,3-ジメチルペンタン"],
    answer: 2,
    explanation: "主鎖はC4(ブタン)でC2とC3にメチル基。全炭素数6から「ヘキサン」としたり、主鎖の長さを数え間違えるミスに注意。",
    difficulty: 1
  },
  {
    id: "ALK010", category: "alkane", type: "name_to_cond",
    question: "「3-エチルペンタン」の示性式はどれか。",
    prompt: "3-エチルペンタン",
    choices: [
      "CH₃CH₂CH(C₂H₅)CH₂CH₃",
      "CH₃CH(C₂H₅)CH₂CH₂CH₃",
      "CH₃CH₂CH(CH₃)CH₂CH₃",
      "CH₃CH₂C(C₂H₅)₂CH₂CH₃"
    ],
    answer: 0,
    explanation: "ペンタン(C5)のC3にエチル基。「CH₃CH(C₂H₅)CH₂CH₂CH₃」はC2にエチル基が付いた形だが、これは実際には最長鎖がヘキサンになるので「3-メチルヘキサン」であり、2-エチルペンタンという名前自体が誤り。",
    difficulty: 2
  },
  {
    id: "ALK011", category: "alkane", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CH(CH₃)−CH₂−CH(C₂H₅)−CH₂−CH₃",
    choices: ["3-エチル-5-メチルヘキサン", "2-メチル-4-エチルヘキサン", "4-エチル-2-メチルヘキサン", "4-エチル-2-メチルペンタン"],
    answer: 2,
    explanation: "最長鎖はC6。位置番号の組は{2,4}<{3,5}なのでメチルが2位・エチルが4位。列挙はアルファベット順(ethyl→methyl)なので「4-エチル-2-メチル」。番号は正しいが列挙順が逆の「2-メチル-4-エチルヘキサン」が引っかけ。",
    difficulty: 3
  },
  {
    id: "ALK012", category: "alkane", type: "name_to_struct",
    question: "「2,4-ジメチルペンタン」の構造式はどれか。",
    prompt: "2,4-ジメチルペンタン",
    choices: [
      "CH₃−CH(CH₃)−CH₂−CH(CH₃)−CH₃",
      "CH₃−CH(CH₃)−CH(CH₃)−CH₂−CH₃",
      "CH₃−C(CH₃)₂−CH₂−CH₂−CH₃",
      "CH₃−CH(CH₃)−CH₂−CH₂−CH(CH₃)−CH₃"
    ],
    answer: 0,
    explanation: "ペンタン(C5)のC2とC4にメチル基。「CH₃−CH(CH₃)−CH(CH₃)−CH₂−CH₃」は2,3-ジメチルペンタン、「CH₃−C(CH₃)₂−CH₂−CH₂−CH₃」は2,2-ジメチルペンタン、「CH₃−CH(CH₃)−CH₂−CH₂−CH(CH₃)−CH₃」は主鎖がC6(2,5-ジメチルヘキサン)。",
    difficulty: 1
  },

  // ================= アルケン (12) =================
  {
    id: "ALE001", category: "alkene", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₂=CH−CH₂−CH₃",
    choices: ["2-ブテン", "1-ブテン", "3-ブテン", "1-ブチン"],
    answer: 1,
    explanation: "二重結合に近い端から番号を付けるので1-ブテン。逆端から数えた「3-ブテン」は誤り。「〜イン」は三重結合の語尾。",
    difficulty: 1
  },
  {
    id: "ALE002", category: "alkene", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CH=CH−CH₂−CH₃",
    choices: ["3-ペンテン", "1-ペンテン", "2-ペンチン", "2-ペンテン"],
    answer: 3,
    explanation: "二重結合はC2−C3間。小さい方の番号で表すので2-ペンテン。C3側で読んだ「3-ペンテン」が定番の誤り。",
    difficulty: 1
  },
  {
    id: "ALE003", category: "alkene", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₂=C(CH₃)−CH₃",
    choices: ["2-メチルプロペン", "2-メチル-2-プロペン", "1-ブテン", "2-ブテン"],
    answer: 0,
    explanation: "主鎖はプロペン(二重結合は必ず1,2位なので番号省略可)、C2にメチル基。C4の直鎖と誤読した「ブテン」系や、二重結合の位置を2とした「2-メチル-2-プロペン」(構造的に不可能)が引っかけ。",
    difficulty: 2
  },
  {
    id: "ALE004", category: "alkene", type: "struct_to_name",
    question: "次の構造式で表される化合物の名称はどれか。",
    prompt: "CH₃      H\n   \\      /\n    C == C\n   /      \\\n  H      CH₃",
    choices: ["シス-2-ブテン", "トランス-2-ブテン", "トランス-1-ブテン", "2-メチルプロペン"],
    answer: 1,
    explanation: "2つのCH₃が二重結合をはさんで反対側にあるのでトランス形。同じ側ならシス形。1-ブテンにはシス・トランス異性体は存在しない(末端炭素にHが2つあるため)。",
    difficulty: 2
  },
  {
    id: "ALE005", category: "alkene", type: "name_to_struct",
    question: "「シス-2-ブテン」の構造式はどれか。",
    prompt: "シス-2-ブテン",
    choices: [
      "CH₃      H\n   \\      /\n    C == C\n   /      \\\n  H      CH₃",
      "CH₃     CH₃\n   \\      /\n    C == C\n   /      \\\n  H       H",
      "CH₂=CH−CH₂−CH₃",
      "CH₂=C(CH₃)−CH₃"
    ],
    answer: 1,
    explanation: "シス形は2つのCH₃が二重結合の同じ側にある構造。CH₃どうしが反対側にある構造はトランス形。シス/トランスの定義(同じ側/反対側)を逆に覚えていると引っかかる。",
    difficulty: 2
  },
  {
    id: "ALE006", category: "alkene", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₂=CH−CH=CH₂",
    choices: ["1,2-ブタジエン", "1,3-ブタジエン", "2-ブチン", "1,3-ブテン"],
    answer: 1,
    explanation: "二重結合が2つあるので語尾は「ジエン」、位置は1,3。二重結合の位置を数え間違えた「1,2-」や、二重結合2つを三重結合1つと混同した「2-ブチン」が引っかけ。",
    difficulty: 1
  },
  {
    id: "ALE007", category: "alkene", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₂=CHCH(CH₃)CH₃",
    choices: ["2-メチル-3-ブテン", "2-メチル-1-ブテン", "3-メチル-1-ブテン", "3-メチルブタン"],
    answer: 2,
    explanation: "二重結合に最小番号を与えるので二重結合側から数えて「3-メチル-1-ブテン」。置換基を優先して逆から数えた「2-メチル-3-ブテン」が最頻出の誤り。番号付けは置換基より二重結合が優先。",
    difficulty: 2
  },
  {
    id: "ALE008", category: "alkene", type: "name_to_cond",
    question: "「2-メチル-2-ブテン」の示性式はどれか。",
    prompt: "2-メチル-2-ブテン",
    choices: [
      "CH₂=C(CH₃)CH₂CH₃",
      "CH₃CH(CH₃)CH=CH₂",
      "(CH₃)₂C=C(CH₃)₂",
      "CH₃C(CH₃)=CHCH₃"
    ],
    answer: 3,
    explanation: "ブテン主鎖のC2に二重結合とメチル基。「CH₂=C(CH₃)CH₂CH₃」は2-メチル-1-ブテン、「CH₃CH(CH₃)CH=CH₂」は3-メチル-1-ブテン、「(CH₃)₂C=C(CH₃)₂」は2,3-ジメチル-2-ブテン(C6)。",
    difficulty: 2
  },
  {
    id: "ALE009", category: "alkene", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₂=CH−CH₂−CH(CH₃)−CH₃",
    choices: ["2-メチル-4-ペンテン", "4-メチル-1-ペンテン", "4-メチル-1-ブテン", "2-メチル-1-ペンテン"],
    answer: 1,
    explanation: "二重結合に最小番号を与えるので1-ペンテン、メチル基は4位。メチル基側から数えた「2-メチル-4-ペンテン」が引っかけ。主鎖はC5(ペンテン)であってブテンではない。",
    difficulty: 2
  },
  {
    id: "ALE010", category: "alkene", type: "name_to_struct",
    question: "「2,3-ジメチル-2-ブテン」の構造式はどれか。",
    prompt: "2,3-ジメチル-2-ブテン",
    choices: [
      "CH₃−C(CH₃)=C(CH₃)−CH₃",
      "CH₂=C(CH₃)−CH(CH₃)−CH₃",
      "CH₃−C(CH₃)=CH−CH₃",
      "CH₃−CH(CH₃)−CH(CH₃)−CH₃"
    ],
    answer: 0,
    explanation: "ブテン主鎖のC2=C3に二重結合、C2とC3にメチル基が1つずつ。「CH₂=C(CH₃)−CH(CH₃)−CH₃」は2,3-ジメチル-1-ブテン、「CH₃−C(CH₃)=CH−CH₃」は2-メチル-2-ブテン、「CH₃−CH(CH₃)−CH(CH₃)−CH₃」はアルカン(2,3-ジメチルブタン)。",
    difficulty: 2
  },
  {
    id: "ALE011", category: "alkene", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CH=CH−CH=CH−CH₃",
    choices: ["1,3-ヘキサジエン", "2,4-ヘキサジエン", "3,5-ヘキサジエン", "2,4-ヘキサジイン"],
    answer: 1,
    explanation: "二重結合はC2−C3とC4−C5にあるので2,4-ヘキサジエン。どちらの端から数えても2,4になる対称構造。「3,5-」は大きい側の番号を採用した誤り。「ジイン」は三重結合2つの語尾。",
    difficulty: 2
  },
  {
    id: "ALE012", category: "alkene", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名(体系名)はどれか。",
    prompt: "CH₂=C(CH₃)CH=CH₂",
    choices: ["イソプレン", "3-メチル-1,3-ブタジエン", "2-メチル-1,3-ブタジエン", "2-メチルブタジエン"],
    answer: 2,
    explanation: "「イソプレン」は慣用名であり体系名ではない。番号は位置の組が最小になるように付けるので2-メチル(3-メチルは逆端からの誤り)。二重結合の位置1,3も省略できない。",
    difficulty: 3
  },

  // ================= アルキン (10) =================
  {
    id: "ALY001", category: "alkyne", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "HC≡C−CH₃",
    choices: ["プロペン", "プロピン", "エチン", "2-プロピン"],
    answer: 1,
    explanation: "三重結合の語尾は「〜イン」。C3で三重結合は1,2位にしか置けないため位置番号は不要。「2-プロピン」という構造は存在しない。",
    difficulty: 1
  },
  {
    id: "ALY002", category: "alkyne", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−C≡C−CH₃",
    choices: ["3-ブチン", "1-ブチン", "2-ブチン", "2-ブテン"],
    answer: 2,
    explanation: "三重結合はC2−C3間で、小さい方の番号を採用して2-ブチン。「3-ブチン」は大きい側の番号を使った誤り。「ブテン」は二重結合の語尾。",
    difficulty: 1
  },
  {
    id: "ALY003", category: "alkyne", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "HC≡CCH₂CH₃",
    choices: ["1-ブチン", "3-ブチン", "2-ブチン", "1-ブテン"],
    answer: 0,
    explanation: "三重結合に近い端から番号を付けて1-ブチン。CH₃側から数えた「3-ブチン」が引っかけ。",
    difficulty: 1
  },
  {
    id: "ALY004", category: "alkyne", type: "name_to_cond",
    question: "「2-ペンチン」の示性式はどれか。",
    prompt: "2-ペンチン",
    choices: [
      "HC≡CCH₂CH₂CH₃",
      "CH₃C≡CCH₂CH₃",
      "CH₃CH=CHCH₂CH₃",
      "CH₃CH₂C≡CCH₂CH₃"
    ],
    answer: 1,
    explanation: "ペンチン(C5)のC2−C3間に三重結合。「HC≡CCH₂CH₂CH₃」は1-ペンチン、「CH₃CH=CHCH₂CH₃」は2-ペンテン(二重結合)、「CH₃CH₂C≡CCH₂CH₃」はC6(3-ヘキシン)。",
    difficulty: 1
  },
  {
    id: "ALY005", category: "alkyne", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "HC≡C−CH(CH₃)−CH₃",
    choices: ["2-メチル-3-ブチン", "3-メチル-1-ブチン", "3-メチル-1-ブテン", "2-メチル-1-ブチン"],
    answer: 1,
    explanation: "三重結合に最小番号を与えるので1-ブチン、メチル基は3位。メチル基側から数えた「2-メチル-3-ブチン」が引っかけ。「2-メチル-1-ブチン」は三重結合炭素(C2)にメチル基が付くことになり構造的に不可能。",
    difficulty: 2
  },
  {
    id: "ALY006", category: "alkyne", type: "name_to_struct",
    question: "「4-メチル-2-ペンチン」の構造式はどれか。",
    prompt: "4-メチル-2-ペンチン",
    choices: [
      "CH₃−C≡C−CH₂−CH₂−CH₃",
      "HC≡C−CH₂−CH(CH₃)−CH₃",
      "CH₃−C≡C−CH(CH₃)−CH₃",
      "CH₃−CH=CH−CH(CH₃)−CH₃"
    ],
    answer: 2,
    explanation: "ペンチン(C5)のC2−C3間に三重結合、C4にメチル基。「CH₃−C≡C−CH₂−CH₂−CH₃」は2-ヘキシン、「HC≡C−CH₂−CH(CH₃)−CH₃」は4-メチル-1-ペンチン、「CH₃−CH=CH−CH(CH₃)−CH₃」は4-メチル-2-ペンテン(二重結合)。",
    difficulty: 2
  },
  {
    id: "ALY007", category: "alkyne", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "HC≡C−CH₂−CH(CH₃)−CH₃",
    choices: ["4-メチル-1-ペンチン", "2-メチル-4-ペンチン", "4-メチルペンチン", "4-メチル-1-ペンテン"],
    answer: 0,
    explanation: "三重結合に最小番号を与えて1-ペンチン、メチル基は4位。「2-メチル-4-ペンチン」は逆端から数えた誤り。C5の1-ペンチンには2-ペンチンという異性体があるため位置番号の省略も不可。",
    difficulty: 2
  },
  {
    id: "ALY008", category: "alkyne", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃C≡C(CH₂)₃CH₃",
    choices: ["5-ヘプチン", "2-ヘプチン", "2-ヘプテン", "2-ヘキシン"],
    answer: 1,
    explanation: "C7で三重結合はC2−C3間。小さい方の番号を採用して2-ヘプチン。「5-ヘプチン」は逆端読み。(CH₂)₃の展開を忘れると炭素数を間違える。",
    difficulty: 1
  },
  {
    id: "ALY009", category: "alkyne", type: "name_to_cond",
    question: "「1-ヘキシン」の示性式はどれか。",
    prompt: "1-ヘキシン",
    choices: [
      "CH₃C≡C(CH₂)₂CH₃",
      "CH₂=CH(CH₂)₃CH₃",
      "HC≡C(CH₂)₂CH₃",
      "HC≡C(CH₂)₃CH₃"
    ],
    answer: 3,
    explanation: "ヘキシンはC6。末端(C1)に三重結合があるのでHC≡C−。「CH₃C≡C(CH₂)₂CH₃」は2-ヘキシン、「CH₂=CH(CH₂)₃CH₃」は1-ヘキセン、「HC≡C(CH₂)₂CH₃」はC5(1-ペンチン)。炭素数の数え間違いに注意。",
    difficulty: 1
  },
  {
    id: "ALY010", category: "alkyne", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃C≡CCH(CH₃)CH₃",
    choices: ["2-メチル-3-ペンチン", "4-メチル-2-ペンチン", "4-メチル-2-ペンテン", "2-メチル-2-ペンチン"],
    answer: 1,
    explanation: "三重結合の位置が最小になる端(CH₃側)から数えて三重結合2位・メチル基4位。置換基を優先して「2-メチル-3-ペンチン」とするのが典型的な誤り。番号付けは置換基より三重結合が優先。",
    difficulty: 2
  },

  // ================= アルコール (12) =================
  {
    id: "OL001", category: "alcohol", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CH(OH)−CH₃",
    choices: ["1-プロパノール", "2-プロパノール", "プロパナール", "2-プロパノン"],
    answer: 1,
    explanation: "OH基がC2に付いているので2-プロパノール。「プロパナール」(アルデヒド)、「プロパノン」(ケトン)と語尾が紛らわしいので注意。",
    difficulty: 1
  },
  {
    id: "OL002", category: "alcohol", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CH₂−CH(OH)−CH₃",
    choices: ["2-ブタノール", "3-ブタノール", "1-ブタノール", "2-ブタノン"],
    answer: 0,
    explanation: "OH基に近い端から番号を付けるので2-ブタノール。逆端から数えた「3-ブタノール」が定番の誤り。",
    difficulty: 1
  },
  {
    id: "OL003", category: "alcohol", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "(CH₃)₃C−OH",
    choices: ["2-メチル-1-プロパノール", "1,1-ジメチルエタノール", "2-メチル-2-プロパノール", "2-ブタノール"],
    answer: 2,
    explanation: "主鎖はOH基が付いた炭素を含む最長鎖のプロパン。C2にOHとメチル基があるので2-メチル-2-プロパノール(第三級アルコール)。「1,1-ジメチルエタノール」は主鎖の選び方が誤り。",
    difficulty: 2
  },
  {
    id: "OL004", category: "alcohol", type: "name_to_struct",
    question: "「2-メチル-1-ブタノール」の構造式はどれか。",
    prompt: "2-メチル-1-ブタノール",
    choices: [
      "CH₃−CH(CH₃)−CH₂−CH₂−OH",
      "CH₃−CH₂−CH(CH₃)−CH₂−OH",
      "CH₃−CH₂−C(CH₃)(OH)−CH₃",
      "(CH₃)₂CH−CH₂−OH"
    ],
    answer: 1,
    explanation: "ブタン主鎖のC1にOH、C2にメチル基。「CH₃−CH(CH₃)−CH₂−CH₂−OH」は3-メチル-1-ブタノール、「CH₃−CH₂−C(CH₃)(OH)−CH₃」は2-メチル-2-ブタノール、「(CH₃)₂CH−CH₂−OH」は2-メチル-1-プロパノール。OHの付いた炭素を1位として数える。",
    difficulty: 2
  },
  {
    id: "OL005", category: "alcohol", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "C₂H₅OH",
    choices: ["メタノール", "エタノール", "エタナール", "エタン"],
    answer: 1,
    explanation: "C2のアルコールなのでエタノール。語尾「-オール」がアルコール、「-アール」がアルデヒド。",
    difficulty: 1
  },
  {
    id: "OL006", category: "alcohol", type: "name_to_cond",
    question: "「1-プロパノール」の示性式はどれか。",
    prompt: "1-プロパノール",
    choices: [
      "CH₃CH(OH)CH₃",
      "CH₃CH₂CHO",
      "CH₃CH₂CH₂OH",
      "CH₃OCH₂CH₃"
    ],
    answer: 2,
    explanation: "C1にOHが付いた直鎖C3アルコール。「CH₃CH(OH)CH₃」は2-プロパノール、「CH₃OCH₂CH₃」はエチルメチルエーテル(1-プロパノールと同じ分子式C₃H₈Oの構造異性体)。エーテルとの異性体関係は頻出。",
    difficulty: 2
  },
  {
    id: "OL007", category: "alcohol", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CH(OH)−CH₂−CH₂−CH₃",
    choices: ["4-ペンタノール", "3-ペンタノール", "2-ペンタノール", "2-ペンタノン"],
    answer: 2,
    explanation: "OH基が最小番号になる端から数えて2-ペンタノール。逆端から数えた「4-ペンタノール」が引っかけ。",
    difficulty: 1
  },
  {
    id: "OL008", category: "alcohol", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "HOCH₂CH₂OH",
    choices: ["エタンジオール", "1,2-エタンジオール", "1,2-プロパンジオール", "エタノール"],
    answer: 1,
    explanation: "OH基2つの2価アルコールなので語尾は「ジオール」で、位置番号1,2を明記する(1,1-エタンジオールという異性体が存在し得るため省略不可)。慣用名はエチレングリコール。",
    difficulty: 2
  },
  {
    id: "OL009", category: "alcohol", type: "name_to_cond",
    question: "「1,2,3-プロパントリオール」の示性式はどれか。",
    prompt: "1,2,3-プロパントリオール",
    choices: [
      "HOCH₂CH(OH)CH₂OH",
      "HOCH₂CH₂CH₂OH",
      "CH₃CH(OH)CH₂OH",
      "HOCH₂CH(OH)CH(OH)CH₃"
    ],
    answer: 0,
    explanation: "C3の各炭素にOHが1つずつ。慣用名はグリセリン。「HOCH₂CH₂CH₂OH」は1,3-プロパンジオール、「CH₃CH(OH)CH₂OH」は1,2-プロパンジオール、「HOCH₂CH(OH)CH(OH)CH₃」はC4のトリオール。",
    difficulty: 1
  },
  {
    id: "OL010", category: "alcohol", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₂=CH−CH₂−CH₂−OH",
    choices: ["1-ブテン-4-オール", "3-ブテン-1-オール", "2-ブテン-1-オール", "3-ブタノール"],
    answer: 1,
    explanation: "OH基(主特性基)に最小番号を与えるのが優先なので、OH側から数えてOHが1位・二重結合が3位。二重結合を優先して数えた「1-ブテン-4-オール」が引っかけ。番号付けの優先順位はOH>二重結合>置換基。",
    difficulty: 3
  },
  {
    id: "OL011", category: "alcohol", type: "name_to_cond",
    question: "「シクロヘキサノール」の示性式はどれか。",
    prompt: "シクロヘキサノール",
    choices: [
      "C₆H₅OH",
      "C₆H₁₃OH",
      "C₆H₁₁OH",
      "C₆H₅CH₂OH"
    ],
    answer: 2,
    explanation: "シクロヘキサン環(C₆H₁₁−)にOH。C₆H₅OHはフェノール(ベンゼン環)、C₆H₁₃OHは鎖状のヘキサノール、C₆H₅CH₂OHはベンジルアルコール。環と鎖でHの数が2つ違う点に注意。",
    difficulty: 2
  },
  {
    id: "OL012", category: "alcohol", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃CH(OH)CH₂CH(CH₃)CH₃",
    choices: ["2-メチル-4-ペンタノール", "4-メチル-2-ペンタノール", "4-メチル-2-ペンタノン", "1,3-ジメチル-1-ブタノール"],
    answer: 1,
    explanation: "OH基が最小番号になる端から数えるので、OHが2位・メチル基が4位。メチル基側から数えた「2-メチル-4-ペンタノール」が最頻出の誤り。「1,3-ジメチル-1-ブタノール」は主鎖の選び方が誤っている。",
    difficulty: 2
  },

  // ================= アルデヒド (10) =================
  {
    id: "AL001", category: "aldehyde", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名(体系名)はどれか。",
    prompt: "HCHO",
    choices: ["メタノール", "メタナール", "エタナール", "ギ酸"],
    answer: 1,
    explanation: "C1のアルデヒドなのでメタナール(慣用名: ホルムアルデヒド)。語尾「-アール」がアルデヒド、「-オール」がアルコール。ギ酸はHCOOH。",
    difficulty: 1
  },
  {
    id: "AL002", category: "aldehyde", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CH₂−CHO",
    choices: ["プロパノール", "プロパノン", "プロパナール", "エタナール"],
    answer: 2,
    explanation: "C3のアルデヒドなのでプロパナール。「プロパノール」(アルコール)・「プロパノン」(ケトン)との語尾の聞き分け・書き分けが最重要ポイント。",
    difficulty: 1
  },
  {
    id: "AL003", category: "aldehyde", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CH(CH₃)−CH₂−CHO",
    choices: ["2-メチルブタナール", "3-メチルブタナール", "4-メチルブタナール", "3-メチルブタノール"],
    answer: 1,
    explanation: "CHOの炭素が必ず1位になるので、メチル基は3位。CHOから遠い側から数えた「2-メチル〜」は誤り。「4-メチルブタナール」はC4主鎖の4位にメチルが付くことになり、それは実際にはペンタナールなので名前として成立しない。",
    difficulty: 2
  },
  {
    id: "AL004", category: "aldehyde", type: "name_to_cond",
    question: "「ブタナール」の示性式はどれか。",
    prompt: "ブタナール",
    choices: [
      "CH₃CH₂COCH₃",
      "CH₃CH₂CH₂CHO",
      "CH₃CH₂CH₂CH₂OH",
      "CH₃CH₂CHO"
    ],
    answer: 1,
    explanation: "C4のアルデヒド。「CH₃CH₂COCH₃」のブタノン(ケトン)はブタナールと同じ分子式C₄H₈Oの構造異性体で、語感も似ているため最大の引っかけ。「CH₃CH₂CH₂CH₂OH」は1-ブタノール、「CH₃CH₂CHO」はプロパナール。",
    difficulty: 2
  },
  {
    id: "AL005", category: "aldehyde", type: "name_to_struct",
    question: "「2-メチルプロパナール」の構造式はどれか。",
    prompt: "2-メチルプロパナール",
    choices: [
      "(CH₃)₂CH−CHO",
      "CH₃−CH₂−CH₂−CHO",
      "(CH₃)₂CH−CH₂−OH",
      "CH₃−CO−CH₂−CH₃"
    ],
    answer: 0,
    explanation: "プロパナール主鎖(CHO=C1)のC2にメチル基。「CH₃−CH₂−CH₂−CHO」はブタナール(異性体)、「(CH₃)₂CH−CH₂−OH」は2-メチル-1-プロパノール、「CH₃−CO−CH₂−CH₃」はブタノン。",
    difficulty: 1
  },
  {
    id: "AL006", category: "aldehyde", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "OHC−CH₂−CHO",
    choices: ["プロパンジアール", "1,2-プロパンジアール", "プロパンジオール", "プロパナール"],
    answer: 0,
    explanation: "両末端にCHOがあるジアルデヒドで「プロパンジアール」。CHO基は必ず両末端(1,3位)にしか置けないため位置番号は不要。「ジオール」はOH基2つの意味で別物。",
    difficulty: 2
  },
  {
    id: "AL007", category: "aldehyde", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃CH₂CH(C₂H₅)CHO",
    choices: ["2-エチルブタナール", "ヘキサナール", "2-エチルブタノール", "2-メチルペンタナール"],
    answer: 0,
    explanation: "CHO炭素を含む最長鎖はC4(ブタナール)で、C2にエチル基。全炭素数6から直鎖の「ヘキサナール」とするのは主鎖と置換基の混同。この化合物はどの経路で数えても主鎖はC4になる。",
    difficulty: 2
  },
  {
    id: "AL008", category: "aldehyde", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CH(CH₃)−CH₂−CH₂−CHO",
    choices: ["2-メチルペンタナール", "4-メチルペンタナール", "4-メチルペンタノール", "3-メチルブタナール"],
    answer: 1,
    explanation: "CHOの炭素が必ず1位。メチル基はCHOから数えて4位。CHOと反対側から数えた「2-メチルペンタナール」が引っかけ。アルデヒドでは番号付けの向きに選択の余地はない。",
    difficulty: 2
  },
  {
    id: "AL009", category: "aldehyde", type: "name_to_cond",
    question: "「2-ブテナール」の示性式はどれか。",
    prompt: "2-ブテナール",
    choices: [
      "CH₂=CHCH₂CHO",
      "CH₃CH=CHCH₂OH",
      "CH₃CH₂CH₂CHO",
      "CH₃CH=CHCHO"
    ],
    answer: 3,
    explanation: "CHO=C1で、二重結合がC2−C3間にある不飽和アルデヒド。「CH₂=CHCH₂CHO」は3-ブテナール、「CH₃CH=CHCH₂OH」は2-ブテン-1-オール、「CH₃CH₂CH₂CHO」はブタナール。",
    difficulty: 2
  },
  {
    id: "AL010", category: "aldehyde", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名(体系名)はどれか。",
    prompt: "CH₃CHO",
    choices: ["エタナール", "メタナール", "エタノール", "アセトン"],
    answer: 0,
    explanation: "C2のアルデヒドなのでエタナール(慣用名: アセトアルデヒド)。エタノール(語尾-オール)との書き分け、アセトン(CH₃COCH₃)との区別が頻出。",
    difficulty: 1
  },

  // ================= ケトン (10) =================
  {
    id: "KE001", category: "ketone", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名(体系名)はどれか。",
    prompt: "CH₃COCH₃",
    choices: ["アセトン", "プロパナール", "プロパノン", "2-プロパノール"],
    answer: 2,
    explanation: "「アセトン」は慣用名であり体系名ではない。C3のケトンなのでプロパノン(C=Oは2位にしか置けないため位置番号は省略可)。",
    difficulty: 2
  },
  {
    id: "KE002", category: "ketone", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CO−CH₂−CH₃",
    choices: ["3-ブタノン", "2-ブタノン", "ブタナール", "2-ブタノール"],
    answer: 1,
    explanation: "C=Oに最小番号を与えるので2-ブタノン。逆端から数えた「3-ブタノン」は誤り(同じ化合物を指すが、小さい番号を採用するルールに反する)。",
    difficulty: 1
  },
  {
    id: "KE003", category: "ketone", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CO−CH₂−CH₂−CH₃",
    choices: ["4-ペンタノン", "3-ペンタノン", "2-ペンタノン", "ペンタナール"],
    answer: 2,
    explanation: "C=Oに最小番号を与えて2-ペンタノン。「4-ペンタノン」は逆端から数えた誤り。「3-ペンタノン」はC=Oが中央にある別の化合物。",
    difficulty: 1
  },
  {
    id: "KE004", category: "ketone", type: "name_to_cond",
    question: "「3-ペンタノン」の示性式はどれか。",
    prompt: "3-ペンタノン",
    choices: [
      "CH₃COCH₂CH₂CH₃",
      "CH₃CH₂COCH₂CH₃",
      "CH₃CH₂CH₂CH₂CHO",
      "CH₃COCH₂CH₃"
    ],
    answer: 1,
    explanation: "C5の3位(中央)にC=O。「CH₃COCH₂CH₂CH₃」は2-ペンタノン(異性体)、「CH₃CH₂CH₂CH₂CHO」はペンタナール(アルデヒド異性体)、「CH₃COCH₂CH₃」はブタノン(C4)。",
    difficulty: 1
  },
  {
    id: "KE005", category: "ketone", type: "name_to_struct",
    question: "「3-メチル-2-ブタノン」の構造式はどれか。",
    prompt: "3-メチル-2-ブタノン",
    choices: [
      "CH₃−CO−CH(CH₃)−CH₃",
      "CH₃−CO−CH₂−CH₂−CH₃",
      "CH₃−CH₂−CO−CH₂−CH₃",
      "CH₃−CO−C(CH₃)₃"
    ],
    answer: 0,
    explanation: "ブタノン主鎖(C=OがC2)のC3にメチル基。「CH₃−CO−CH₂−CH₂−CH₃」は2-ペンタノン、「CH₃−CH₂−CO−CH₂−CH₃」は3-ペンタノン(いずれも同じ分子式C₅H₁₀Oの異性体)、「CH₃−CO−C(CH₃)₃」は3,3-ジメチル-2-ブタノン(C6)。",
    difficulty: 2
  },
  {
    id: "KE006", category: "ketone", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃COCH(CH₃)CH₃",
    choices: ["2-メチル-3-ブタノン", "3-メチル-2-ブタノン", "3-メチルブタナール", "2-メチル-2-ブタノン"],
    answer: 1,
    explanation: "C=Oに最小番号を与えるのでC=Oが2位・メチル基が3位。逆端から数えた「2-メチル-3-ブタノン」が定番の誤り。「2-メチル-2-ブタノン」はC2が5本結合になるため構造的に不可能。",
    difficulty: 2
  },
  {
    id: "KE007", category: "ketone", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃COCOCH₃",
    choices: ["2,3-ブタンジオン", "ブタンジオン", "1,2-ブタンジオン", "2,3-ブタンジオール"],
    answer: 0,
    explanation: "C=Oが2つあるジケトンで、位置は2,3。異性体が存在し得るため位置番号は省略できない。「ジオール」はOH基2つの意味で別物。",
    difficulty: 2
  },
  {
    id: "KE008", category: "ketone", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃COCH₂COCH₃",
    choices: ["1,3-ペンタンジオン", "2,4-ペンタンジオン", "アセチルアセトン", "2,4-ペンタンジオール"],
    answer: 1,
    explanation: "C5の2位と4位にC=Oがあるジケトン。端の炭素から数え間違えた「1,3-」が引っかけ。「アセチルアセトン」は慣用名で体系名ではない。",
    difficulty: 2
  },
  {
    id: "KE009", category: "ketone", type: "name_to_cond",
    question: "「4-メチル-2-ペンタノン」の示性式はどれか。",
    prompt: "4-メチル-2-ペンタノン",
    choices: [
      "CH₃COCH₂CH(CH₃)₂",
      "CH₃COCH(CH₃)CH₂CH₃",
      "CH₃COCH₂CH₂CH₂CH₃",
      "(CH₃)₂CHCH₂CH₂CHO"
    ],
    answer: 0,
    explanation: "ペンタノン主鎖(C=OがC2)のC4にメチル基。「CH₃COCH(CH₃)CH₂CH₃」は3-メチル-2-ペンタノン、「CH₃COCH₂CH₂CH₂CH₃」は2-ヘキサノン、「(CH₃)₂CHCH₂CH₂CHO」はアルデヒド(4-メチルペンタナール)。",
    difficulty: 2
  },
  {
    id: "KE010", category: "ketone", type: "struct_to_name",
    question: "シクロヘキサン環の1つの炭素がC=Oになっている化合物のIUPAC名はどれか。",
    prompt: "シクロヘキサン環(環内にC=Oを1つ含む)",
    choices: ["シクロヘキサノール", "シクロヘキサノン", "シクロペンタノン", "ヘキサナール"],
    answer: 1,
    explanation: "六員環の環内ケトンはシクロヘキサノン(ナイロン66の原料として頻出)。語尾「-ノン」がケトン、「-ノール」がアルコール。環の炭素数(6)も確認する。",
    difficulty: 1
  },

  // ================= カルボン酸 (12) =================
  {
    id: "CA001", category: "carboxylic_acid", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名(体系名)はどれか。",
    prompt: "HCOOH",
    choices: ["メタン酸", "ギ酸", "エタン酸", "メタナール"],
    answer: 0,
    explanation: "C1のカルボン酸なので体系名はメタン酸。「ギ酸」は慣用名。COOHの炭素も主鎖の炭素数に数える点に注意。",
    difficulty: 1
  },
  {
    id: "CA002", category: "carboxylic_acid", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名(体系名)はどれか。",
    prompt: "CH₃COOH",
    choices: ["酢酸", "メタン酸", "エタン酸", "エタナール"],
    answer: 2,
    explanation: "C2のカルボン酸なので体系名はエタン酸。「酢酸」は慣用名(IUPACでも許容されるが体系名ではない)。CH₃の1炭素だけ見て「メタン酸」とする誤りに注意。",
    difficulty: 1
  },
  {
    id: "CA003", category: "carboxylic_acid", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名(体系名)はどれか。",
    prompt: "CH₃−CH₂−CH₂−COOH",
    choices: ["プロパン酸", "ブタン酸", "ブタナール", "酪酸"],
    answer: 1,
    explanation: "COOHの炭素を含めてC4なのでブタン酸。「酪酸」は慣用名。COOHの炭素を数え忘れて「プロパン酸」とするのが典型的な誤り。",
    difficulty: 1
  },
  {
    id: "CA004", category: "carboxylic_acid", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CH(CH₃)−COOH",
    choices: ["2-メチルブタン酸", "2-メチルプロパン酸", "2-メチルプロパナール", "3-メチルプロパン酸"],
    answer: 1,
    explanation: "COOHの炭素が必ず1位で、主鎖はC3(プロパン酸)、メチル基は2位。「3-メチルプロパン酸」は存在しない名前(C3主鎖の3位は末端CH₃)。主鎖の炭素数の数え間違いにも注意。",
    difficulty: 2
  },
  {
    id: "CA005", category: "carboxylic_acid", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CH(CH₃)−CH₂−COOH",
    choices: ["2-メチルブタン酸", "3-メチルブタン酸", "ペンタン酸", "3-メチルブタナール"],
    answer: 1,
    explanation: "COOHの炭素が1位なので、メチル基は3位。COOHから遠い端から数えた「2-メチルブタン酸」が引っかけ。全炭素数5から「ペンタン酸」とするのは主鎖と置換基の混同。",
    difficulty: 2
  },
  {
    id: "CA006", category: "carboxylic_acid", type: "name_to_cond",
    question: "「プロパン酸」の示性式はどれか。",
    prompt: "プロパン酸",
    choices: [
      "CH₃COOH",
      "CH₃CH₂CHO",
      "HCOOC₂H₅",
      "CH₃CH₂COOH"
    ],
    answer: 3,
    explanation: "COOH炭素を含めてC3。「HCOOC₂H₅」はギ酸エチルで、プロパン酸と同じ分子式C₃H₆O₂の構造異性体(示性式問題での定番の引っかけ)。",
    difficulty: 2
  },
  {
    id: "CA007", category: "carboxylic_acid", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名(体系名)はどれか。",
    prompt: "HOOC−COOH",
    choices: ["シュウ酸", "エタン二酸", "プロパン二酸", "エタン酸"],
    answer: 1,
    explanation: "COOHが2つ直結した最小のジカルボン酸で、炭素は合計2つなのでエタン二酸。「シュウ酸」は慣用名。COOH炭素2つを主鎖に数えることがポイント。",
    difficulty: 2
  },
  {
    id: "CA008", category: "carboxylic_acid", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名(体系名)はどれか。",
    prompt: "HOOC−CH₂−COOH",
    choices: ["プロパン二酸", "マロン酸", "エタン二酸", "ブタン二酸"],
    answer: 0,
    explanation: "COOH炭素2つ+中央のCH₂でC3なのでプロパン二酸。「マロン酸」は慣用名。両端のCOOH炭素の数え忘れに注意。",
    difficulty: 2
  },
  {
    id: "CA009", category: "carboxylic_acid", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "(CH₃)₃CCOOH",
    choices: ["2,2-ジメチルプロパン酸", "3,3-ジメチルプロパン酸", "2,2-ジメチルブタン酸", "2,2-ジメチルプロパナール"],
    answer: 0,
    explanation: "COOH=C1を含む主鎖はC3(プロパン酸)で、C2にメチル基2つ。「3,3-」の位置はプロパン酸の末端炭素なので成立しない名前。語尾「-アール」はアルデヒド。",
    difficulty: 2
  },
  {
    id: "CA010", category: "carboxylic_acid", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名(体系名)はどれか。",
    prompt: "CH₂=CH−COOH",
    choices: ["プロパン酸", "アクリル酸", "プロピン酸", "プロペン酸"],
    answer: 3,
    explanation: "C3で二重結合をもつ不飽和カルボン酸なのでプロペン酸(2-プロペン酸)。「アクリル酸」は慣用名。「プロピン酸」は三重結合の場合の語尾。",
    difficulty: 2
  },
  {
    id: "CA011", category: "carboxylic_acid", type: "name_to_cond",
    question: "「ブタン二酸」の示性式はどれか。",
    prompt: "ブタン二酸",
    choices: [
      "HOOC(CH₂)₂COOH",
      "HOOCCH₂COOH",
      "HOOC(CH₂)₃COOH",
      "CH₃CH₂CH₂COOH"
    ],
    answer: 0,
    explanation: "C4のジカルボン酸(慣用名: コハク酸)。両端のCOOH炭素も炭素数に含めるので中央のCH₂は2つ。「HOOCCH₂COOH」はプロパン二酸、「HOOC(CH₂)₃COOH」はペンタン二酸、「CH₃CH₂CH₂COOH」はブタン酸(モノカルボン酸)。",
    difficulty: 2
  },
  {
    id: "CA012", category: "carboxylic_acid", type: "cond_to_name",
    question: "次の示性式で表される化合物の名称はどれか。",
    prompt: "C₆H₅COOH",
    choices: ["フェノール", "安息香酸", "ベンズアルデヒド", "サリチル酸"],
    answer: 1,
    explanation: "ベンゼン環にCOOHが直結した芳香族カルボン酸で安息香酸(IUPACでも保存名)。フェノールはC₆H₅OH、ベンズアルデヒドはC₆H₅CHO、サリチル酸はOHとCOOHの両方をもつ。",
    difficulty: 1
  },

  // ================= エステル (12) =================
  {
    id: "ES001", category: "ester", type: "cond_to_name",
    question: "次の示性式で表される化合物の名称はどれか。",
    prompt: "CH₃COOC₂H₅",
    choices: ["プロパン酸メチル", "酢酸エチル", "ギ酸プロピル", "酢酸メチル"],
    answer: 1,
    explanation: "CH₃CO−が酢酸由来のアシル基、−OC₂H₅がエタノール由来。「プロパン酸メチル」「ギ酸プロピル」はいずれも同じ分子式C₄H₈O₂の異性体エステルで、C−O結合の切れ目を読み違えると引っかかる。",
    difficulty: 2
  },
  {
    id: "ES002", category: "ester", type: "cond_to_name",
    question: "次の示性式で表される化合物の名称はどれか。",
    prompt: "CH₃CH₂CH₂COOCH₃",
    choices: ["酢酸プロピル", "ブタン酸メチル", "プロパン酸エチル", "ペンタン酸メチル"],
    answer: 1,
    explanation: "C₃H₇CO−はブタン酸(C4)由来のアシル基、−OCH₃がメタノール由来。「酢酸プロピル」「プロパン酸エチル」は同じ分子式C₅H₁₀O₂の異性体。アシル側の炭素数(COの炭素を含む)を正確に数える。",
    difficulty: 2
  },
  {
    id: "ES003", category: "ester", type: "name_to_cond",
    question: "「酢酸メチル」の示性式はどれか。",
    prompt: "酢酸メチル",
    choices: [
      "HCOOC₂H₅",
      "CH₃COOC₂H₅",
      "CH₃COOCH₃",
      "C₂H₅COOCH₃"
    ],
    answer: 2,
    explanation: "酢酸(CH₃COOH)のOHをOCH₃に置き換えた構造。「HCOOC₂H₅」のギ酸エチルは酢酸メチルと同じ分子式C₃H₆O₂の異性体で定番の引っかけ。「C₂H₅COOCH₃」はプロパン酸メチル。",
    difficulty: 2
  },
  {
    id: "ES004", category: "ester", type: "name_to_cond",
    question: "「ギ酸エチル」の示性式はどれか。",
    prompt: "ギ酸エチル",
    choices: [
      "HCOOC₂H₅",
      "CH₃COOCH₃",
      "C₂H₅COOH",
      "HCOOCH₃"
    ],
    answer: 0,
    explanation: "ギ酸(HCOOH)由来のHCO−とエタノール由来の−OC₂H₅。「CH₃COOCH₃」の酢酸メチルと「C₂H₅COOH」のプロパン酸はいずれも同じ分子式C₃H₆O₂の異性体。「HCOOCH₃」はギ酸メチル。",
    difficulty: 2
  },
  {
    id: "ES005", category: "ester", type: "struct_to_name",
    question: "次の構造式で表される化合物の名称はどれか。",
    prompt: "CH₃−CO−O−CH₂−CH₂−CH₃",
    choices: ["プロパン酸エチル", "酢酸プロピル", "ブタン酸メチル", "プロパン酸プロピル"],
    answer: 1,
    explanation: "C=O側(CH₃CO−)が酢酸由来、O側(−OC₃H₇)が1-プロパノール由来なので酢酸プロピル。「プロパン酸エチル」「ブタン酸メチル」は同じ分子式C₅H₁₀O₂の異性体。−CO−O−の左右どちらが酸由来かを正確に読む。",
    difficulty: 2
  },
  {
    id: "ES006", category: "ester", type: "name_to_struct",
    question: "「プロパン酸エチル」の構造式はどれか。",
    prompt: "プロパン酸エチル",
    choices: [
      "CH₃−CO−O−CH₂−CH₂−CH₃",
      "CH₃−CH₂−CO−O−CH₂−CH₃",
      "CH₃−CH₂−CH₂−CO−O−CH₃",
      "CH₃−CO−O−CH₂−CH₃"
    ],
    answer: 1,
    explanation: "プロパン酸由来のC₂H₅CO−とエタノール由来の−OC₂H₅。「CH₃−CO−O−CH₂−CH₂−CH₃」は酢酸プロピル、「CH₃−CH₂−CH₂−CO−O−CH₃」はブタン酸メチル(いずれも異性体)、「CH₃−CO−O−CH₂−CH₃」は酢酸エチル。日本語名は「酸+アルコールの基」の順で、構造のC=O側が酸由来。",
    difficulty: 2
  },
  {
    id: "ES007", category: "ester", type: "cond_to_name",
    question: "次の示性式で表される化合物の名称はどれか。",
    prompt: "HCOOCH₃",
    choices: ["酢酸メチル", "ギ酸メチル", "ギ酸エチル", "酢酸エチル"],
    answer: 1,
    explanation: "HCO−はギ酸由来、−OCH₃はメタノール由来なのでギ酸メチル。HCOOのHを見落として酢酸系と誤読しやすい。",
    difficulty: 1
  },
  {
    id: "ES008", category: "ester", type: "name_to_cond",
    question: "「ブタン酸エチル」の示性式はどれか。",
    prompt: "ブタン酸エチル",
    choices: [
      "CH₃COO(CH₂)₃CH₃",
      "CH₃CH₂COOCH₂CH₂CH₃",
      "CH₃CH₂CH₂COOC₂H₅",
      "CH₃(CH₂)₃COOCH₃"
    ],
    answer: 2,
    explanation: "ブタン酸(C4)由来のC₃H₇CO−とエタノール由来の−OC₂H₅。「CH₃COO(CH₂)₃CH₃」は酢酸ブチル、「CH₃CH₂COOCH₂CH₂CH₃」はプロパン酸プロピル(いずれも同じ分子式C₆H₁₂O₂の異性体)、「CH₃(CH₂)₃COOCH₃」はペンタン酸メチル。",
    difficulty: 2
  },
  {
    id: "ES009", category: "ester", type: "cond_to_name",
    question: "次の示性式で表される化合物の名称はどれか。",
    prompt: "C₆H₄(OH)COOCH₃(ベンゼン環のオルト位にOH)",
    choices: ["アセチルサリチル酸", "安息香酸メチル", "サリチル酸メチル", "サリチル酸エチル"],
    answer: 2,
    explanation: "サリチル酸のCOOHがメチルエステル化された構造(消炎剤)。OHがアセチル化された「アセチルサリチル酸」(アスピリン)との区別が最頻出。どちらの官能基がエステル化されているかを見る。",
    difficulty: 2
  },
  {
    id: "ES010", category: "ester", type: "cond_to_name",
    question: "次の示性式で表される化合物の名称はどれか。",
    prompt: "C₆H₄(OCOCH₃)COOH(ベンゼン環のオルト位で、COOHは遊離)",
    choices: ["サリチル酸メチル", "アセチルサリチル酸", "安息香酸メチル", "酢酸フェニル"],
    answer: 1,
    explanation: "サリチル酸のOHが酢酸でアセチル化された構造(アスピリン)。COOHが残っている点がサリチル酸メチルとの違い。−OCOCH₃(OH側がエステル化)と−COOCH₃(COOH側がエステル化)の読み分けがポイント。",
    difficulty: 3
  },
  {
    id: "ES011", category: "ester", type: "name_to_cond",
    question: "「酢酸ビニル」の示性式はどれか。",
    prompt: "酢酸ビニル",
    choices: [
      "CH₂=CHCOOCH₃",
      "CH₃COOCH=CH₂",
      "CH₃COOC₂H₅",
      "C₂H₅COOCH=CH₂"
    ],
    answer: 1,
    explanation: "酢酸由来のCH₃CO−とビニル基(CH₂=CH−)のエステル。「CH₂=CHCOOCH₃」はアクリル酸メチル(同じ分子式C₄H₆O₂の異性体)で、酸側とアルコール側を逆にした定番の引っかけ。",
    difficulty: 3
  },
  {
    id: "ES012", category: "ester", type: "struct_to_name",
    question: "次の構造式で表される化合物の名称はどれか。",
    prompt: "CH₃−O−CO−CH₂−CH₃",
    choices: ["酢酸エチル", "プロパン酸メチル", "プロパン酸エチル", "ギ酸プロピル"],
    answer: 1,
    explanation: "左から書かれているが、C=Oをもつのは右側のC₂H₅CO−(プロパン酸由来)で、CH₃O−がアルコール由来。「CH₃−O−CO−」を「CH₃−CO−O−」と読み違えて酢酸エチルとするのが最大の引っかけ。エステル結合の向きに注意。",
    difficulty: 3
  },

  // ================= エーテル (10) =================
  {
    id: "ET001", category: "ether", type: "cond_to_name",
    question: "次の示性式で表される化合物の名称はどれか。",
    prompt: "CH₃OCH₃",
    choices: ["エタノール", "ジメチルエーテル", "ジエチルエーテル", "メタノール"],
    answer: 1,
    explanation: "同じ基(メチル)2つがOをはさむ対称エーテル。エタノール(C₂H₅OH)は同じ分子式C₂H₆Oの構造異性体で、異性体問題での定番の対。",
    difficulty: 1
  },
  {
    id: "ET002", category: "ether", type: "cond_to_name",
    question: "次の示性式で表される化合物の名称はどれか。",
    prompt: "C₂H₅OC₂H₅",
    choices: ["ジメチルエーテル", "エチルメチルエーテル", "1-ブタノール", "ジエチルエーテル"],
    answer: 3,
    explanation: "エチル基2つの対称エーテル(単に「エーテル」と呼ばれる麻酔剤)。1-ブタノールは同じ分子式C₄H₁₀Oの構造異性体。",
    difficulty: 1
  },
  {
    id: "ET003", category: "ether", type: "cond_to_name",
    question: "次の示性式で表される化合物の名称はどれか。",
    prompt: "CH₃OC₂H₅",
    choices: ["エチルメチルエーテル", "ジエチルエーテル", "ジメチルエーテル", "1-プロパノール"],
    answer: 0,
    explanation: "Oをはさんでメチル基とエチル基が1つずつ結合した非対称エーテル。左右の基が異なるので「ジメチル」「ジエチル」ではない。1-プロパノールは同じ分子式C₃H₈Oの構造異性体。",
    difficulty: 2
  },
  {
    id: "ET004", category: "ether", type: "struct_to_name",
    question: "次の構造式で表される化合物の名称はどれか。",
    prompt: "CH₃−O−CH₂−CH₂−CH₃",
    choices: ["メチルプロピルエーテル", "イソプロピルメチルエーテル", "エチルメチルエーテル", "1-ブタノール"],
    answer: 0,
    explanation: "メチル基と直鎖プロピル基のエーテル。枝分かれした「イソプロピル」との区別、左右の炭素数の読み取りがポイント。1-ブタノールは同じ分子式C₄H₁₀Oの構造異性体。",
    difficulty: 1
  },
  {
    id: "ET005", category: "ether", type: "name_to_cond",
    question: "「エチルイソプロピルエーテル」の示性式はどれか。",
    prompt: "エチルイソプロピルエーテル",
    choices: [
      "C₂H₅OCH(CH₃)₂",
      "C₂H₅OCH₂CH₂CH₃",
      "(CH₃)₂CHOCH(CH₃)₂",
      "C₂H₅OC₂H₅"
    ],
    answer: 0,
    explanation: "エチル基とイソプロピル基((CH₃)₂CH−)のエーテル。「C₂H₅OCH₂CH₂CH₃」は直鎖のエチルプロピルエーテル、「(CH₃)₂CHOCH(CH₃)₂」はジイソプロピルエーテル、「C₂H₅OC₂H₅」はジエチルエーテル。",
    difficulty: 2
  },
  {
    id: "ET006", category: "ether", type: "name_to_struct",
    question: "「ジエチルエーテル」の構造式はどれか。",
    prompt: "ジエチルエーテル",
    choices: [
      "CH₃−O−CH₂−CH₂−CH₃",
      "CH₃−CH₂−O−CH₂−CH₃",
      "CH₃−CH₂−O−CH₃",
      "CH₃−CH₂−CH₂−CH₂−OH"
    ],
    answer: 1,
    explanation: "エチル基(C₂H₅−)2つがOをはさむ構造。「CH₃−O−CH₂−CH₂−CH₃」はメチルプロピルエーテル(同じ分子式C₄H₁₀Oの異性体)、「CH₃−CH₂−O−CH₃」はエチルメチルエーテル、「CH₃−CH₂−CH₂−CH₂−OH」は1-ブタノール(異性体)。",
    difficulty: 1
  },
  {
    id: "ET007", category: "ether", type: "cond_to_name",
    question: "次の示性式で表される化合物の名称はどれか。",
    prompt: "C₆H₅CH₂OCH₂C₆H₅",
    choices: ["ジフェニルエーテル", "ジベンジルエーテル", "ベンジルアルコール", "エチルフェニルエーテル"],
    answer: 1,
    explanation: "ベンジル基(C₆H₅CH₂−)2つがOをはさんだ対称エーテル。CH₂を介さず環が直接Oに付くジフェニルエーテル(C₆H₅OC₆H₅)との区別が最大のポイント。",
    difficulty: 2
  },
  {
    id: "ET008", category: "ether", type: "cond_to_name",
    question: "次の示性式で表される化合物の名称はどれか。",
    prompt: "C₆H₅OCH₃",
    choices: ["ベンジルメチルエーテル", "フェノール", "メチルフェニルエーテル", "ベンジルアルコール"],
    answer: 2,
    explanation: "ベンゼン環(フェニル基)が直接Oに結合したエーテル。CH₂を介する「ベンジルメチルエーテル」(C₆H₅CH₂OCH₃)との区別がポイント。フェノールはC₆H₅OHでエーテルではない。",
    difficulty: 2
  },
  {
    id: "ET009", category: "ether", type: "cond_to_name",
    question: "次の示性式で表される化合物の名称はどれか。",
    prompt: "CH₃OCH(CH₃)₂",
    choices: ["メチルプロピルエーテル", "イソプロピルメチルエーテル", "エチルメチルエーテル", "ジエチルエーテル"],
    answer: 1,
    explanation: "CH(CH₃)₂はイソプロピル基(枝分かれあり)。直鎖のプロピル基と読み違えた「メチルプロピルエーテル」が引っかけ。基の枝分かれの有無まで正確に読み取ること。",
    difficulty: 2
  },
  {
    id: "ET010", category: "ether", type: "name_to_cond",
    question: "「ジプロピルエーテル」の示性式はどれか。",
    prompt: "ジプロピルエーテル",
    choices: [
      "(CH₃)₂CHOCH(CH₃)₂",
      "CH₃CH₂CH₂OCH₂CH₃",
      "CH₃CH₂CH₂OCH₂CH₂CH₃",
      "CH₃CH₂CH₂OH"
    ],
    answer: 2,
    explanation: "直鎖プロピル基2つがOをはさむ構造。「(CH₃)₂CHOCH(CH₃)₂」はジイソプロピルエーテル(「プロピル」と「イソプロピル」は別の基)、「CH₃CH₂CH₂OCH₂CH₃」はエチルプロピルエーテル、「CH₃CH₂CH₂OH」は1-プロパノール。",
    difficulty: 2
  }

];

// フィルター用の定数(プログラム側で利用)
const IUPAC_QUIZ_CATEGORIES = {
  alkane:          "アルカン",
  alkene:          "アルケン",
  alkyne:          "アルキン",
  alcohol:         "アルコール",
  aldehyde:        "アルデヒド",
  ketone:          "ケトン",
  carboxylic_acid: "カルボン酸",
  ester:           "エステル",
  ether:           "エーテル"
};

const IUPAC_QUIZ_TYPES = {
  struct_to_name: "構造式 → IUPAC名",
  name_to_struct: "IUPAC名 → 構造式",
  cond_to_name:   "示性式 → IUPAC名",
  name_to_cond:   "IUPAC名 → 示性式"
};
