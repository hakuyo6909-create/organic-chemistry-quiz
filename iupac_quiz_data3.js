// ============================================================
// IUPAC命名法 4択クイズ データ 第3弾(50題)
// ============================================================
// スキーマは iupac_quiz_data.js(第1弾)と共通。
// 第1弾・第2弾と正解化合物が重複しないように作成。
// 高校化学の範囲内の表記のみを使用(E/Z・オキソ/ヒドロキシ接頭辞・
// 置換命名法のエーテル名・複素環名などは不使用)。
//
// 3ファイルをすべて読み込んで結合する場合:
//   const ALL_QUIZ = IUPAC_QUIZ_DATA
//     .concat(IUPAC_QUIZ_DATA_2)
//     .concat(IUPAC_QUIZ_DATA_3);   // 計250題
// ============================================================

const IUPAC_QUIZ_DATA_3 = [

  // ================= アルカン (6) =================
  {
    id: "ALK025", category: "alkane", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃(CH₂)₅CH₃",
    choices: ["ヘキサン", "ヘプタン", "オクタン", "ペンタン"],
    answer: 1,
    explanation: "(CH₂)₅の展開を含めて炭素は7個なのでヘプタン。両端のCH₃を数え忘れて「ペンタン」「ヘキサン」とするミスが多い。",
    difficulty: 1
  },
  {
    id: "ALK026", category: "alkane", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CH(CH₃)−CH₂−CH₂−CH₂−CH₃",
    choices: ["5-メチルヘキサン", "2-メチルペンタン", "2-メチルヘキサン", "ヘプタン"],
    answer: 2,
    explanation: "最長鎖はC6(ヘキサン)で、置換基に近い端から数えてメチル基は2位。逆端から数えた「5-メチルヘキサン」、全炭素数7から直鎖と誤認した「ヘプタン」が引っかけ。",
    difficulty: 1
  },
  {
    id: "ALK027", category: "alkane", type: "name_to_cond",
    question: "「2,5-ジメチルヘキサン」の示性式はどれか。",
    prompt: "2,5-ジメチルヘキサン",
    choices: [
      "CH₃CH(CH₃)CH₂CH₂CH(CH₃)CH₃",
      "CH₃CH(CH₃)CH(CH₃)CH₂CH₂CH₃",
      "CH₃CH(CH₃)CH₂CH(CH₃)CH₂CH₃",
      "CH₃C(CH₃)₂CH₂CH₂CH₂CH₃"
    ],
    answer: 0,
    explanation: "ヘキサン(C6)のC2とC5にメチル基がある対称的な構造。「CH₃CH(CH₃)CH(CH₃)CH₂CH₂CH₃」は2,3-ジメチルヘキサン、「CH₃CH(CH₃)CH₂CH(CH₃)CH₂CH₃」は2,4-ジメチルヘキサン、「CH₃C(CH₃)₂CH₂CH₂CH₂CH₃」は2,2-ジメチルヘキサン。",
    difficulty: 2
  },
  {
    id: "ALK028", category: "alkane", type: "struct_to_name",
    question: "シクロヘキサン環の1位と3位(1つおきの炭素)にメチル基が1つずつ付いた化合物のIUPAC名はどれか。",
    prompt: "シクロヘキサン環(1つおきの炭素に CH₃ ×2)",
    choices: ["1,5-ジメチルシクロヘキサン", "1,3-ジメチルシクロヘキサン", "2,4-ジメチルシクロヘキサン", "1,4-ジメチルシクロヘキサン"],
    answer: 1,
    explanation: "環では位置番号の組が最小になるように番号を付けるので1,3-。逆回りに数えた「1,5-」、1から始めない「2,4-」が引っかけ。「1,4-」は向かい合う位置にある別の化合物。",
    difficulty: 2
  },
  {
    id: "ALK029", category: "alkane", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃CHBrCH₂CH₃",
    choices: ["3-ブロモブタン", "1-ブロモブタン", "2-ブロモブタン", "2-ブロモプロパン"],
    answer: 2,
    explanation: "ブタン(C4)のC2に臭素。Br側と反対の端から数えた「3-ブロモブタン」は番号最小則違反。主鎖の炭素数の数え間違い(プロパン)にも注意。",
    difficulty: 1
  },
  {
    id: "ALK030", category: "alkane", type: "name_to_cond",
    question: "「2,2,3-トリメチルブタン」の示性式はどれか。",
    prompt: "2,2,3-トリメチルブタン",
    choices: [
      "CH₃C(CH₃)₂CH₂CH(CH₃)CH₃",
      "CH₃C(CH₃)₂CH(CH₃)CH₃",
      "(CH₃)₃CCH₂CH₃",
      "CH₃CH(CH₃)CH(CH₃)CH₃"
    ],
    answer: 1,
    explanation: "ブタン(C4)のC2にメチル基2つ・C3に1つ。「CH₃C(CH₃)₂CH₂CH(CH₃)CH₃」は2,2,4-トリメチルペンタン(主鎖C5)、「(CH₃)₃CCH₂CH₃」は2,2-ジメチルブタン、「CH₃CH(CH₃)CH(CH₃)CH₃」は2,3-ジメチルブタン。メチル基の数と位置を正確に対応させる。",
    difficulty: 2
  },

  // ================= アルケン (6) =================
  {
    id: "ALE025", category: "alkene", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CH=CH−CH₂−CH₂−CH₃",
    choices: ["2-ヘキセン", "4-ヘキセン", "3-ヘキセン", "2-ヘキシン"],
    answer: 0,
    explanation: "二重結合はC2−C3間で、小さい方の番号を採用して2-ヘキセン。逆端から数えた「4-ヘキセン」が引っかけ。「-ヘキシン」は三重結合の語尾。",
    difficulty: 1
  },
  {
    id: "ALE026", category: "alkene", type: "name_to_cond",
    question: "「1-ヘキセン」の示性式はどれか。",
    prompt: "1-ヘキセン",
    choices: [
      "CH₃CH=CH(CH₂)₂CH₃",
      "CH₂=CH(CH₂)₃CH₃",
      "CH₂=CH(CH₂)₂CH₃",
      "HC≡C(CH₂)₃CH₃"
    ],
    answer: 1,
    explanation: "C6の末端(C1−C2間)に二重結合。「CH₃CH=CH(CH₂)₂CH₃」は2-ヘキセン、「CH₂=CH(CH₂)₂CH₃」はC5の1-ペンテン(炭素数ミス)、「HC≡C(CH₂)₃CH₃」は1-ヘキシン(三重結合)。",
    difficulty: 1
  },
  {
    id: "ALE027", category: "alkene", type: "cond_to_name",
    question: "炭素5個の環に二重結合が1つある化合物(C₅H₈)のIUPAC名はどれか。",
    prompt: "C₅H₈(五員環+二重結合1つ)",
    choices: ["シクロペンタン", "シクロペンテン", "1-ペンテン", "シクロヘキセン"],
    answer: 1,
    explanation: "五員環+二重結合1つはシクロペンテン。飽和のシクロペンタンはC₅H₁₀、鎖状の1-ペンテンもC₅H₁₀で、分子式の水素数が異なる(環1つ+二重結合1つで不飽和度2)。",
    difficulty: 1
  },
  {
    id: "ALE028", category: "alkene", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CH=C(C₂H₅)−CH₂−CH₃",
    choices: ["3-エチル-3-ペンテン", "3-メチル-2-ヘキセン", "3-エチル-2-ペンテン", "3-エチル-1-ペンテン"],
    answer: 2,
    explanation: "二重結合を含む最長鎖はC5(ペンテン)で、二重結合はC2−C3間、C3にエチル基。「3-メチル-2-ヘキセン」は二重結合の両炭素を含まない鎖を主鎖に選んだ誤り(主鎖は必ず二重結合を含む)。",
    difficulty: 3
  },
  {
    id: "ALE029", category: "alkene", type: "struct_to_name",
    question: "次の構造式で表される化合物の名称はどれか。",
    prompt: "CH₃    C₃H₇\n   \\      /\n    C == C\n   /      \\\n  H       H",
    choices: ["トランス-2-ヘキセン", "シス-2-ヘキセン", "シス-3-ヘキセン", "シス-2-ペンテン"],
    answer: 1,
    explanation: "主鎖はC6で二重結合は2位。CH₃とC₃H₇(プロピル基)が同じ側にあるのでシス形。プロピル基の炭素数を見落とすと「シス-2-ペンテン」に、二重結合の位置を誤ると「シス-3-ヘキセン」に引っかかる。",
    difficulty: 2
  },
  {
    id: "ALE030", category: "alkene", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₂=CH−CH=CH−CH₃",
    choices: ["1,3-ペンタジエン", "2,4-ペンタジエン", "1,4-ペンタジエン", "1,3-ペンタジイン"],
    answer: 0,
    explanation: "二重結合はC1−C2とC3−C4。位置番号の組は{1,3}と{2,4}で、小さい{1,3}を採用する。逆端から数えた「2,4-ペンタジエン」が定番の誤り。「ジイン」は三重結合2つの語尾。",
    difficulty: 2
  },

  // ================= アルキン (5) =================
  {
    id: "ALY021", category: "alkyne", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名(体系名)はどれか。",
    prompt: "HC≡CH",
    choices: ["エテン", "エタン", "エチン", "プロピン"],
    answer: 2,
    explanation: "C2の三重結合化合物の体系名はエチン(慣用名: アセチレン)。語尾「-エン」(二重結合)、「-アン」(単結合のみ)との区別が基本。",
    difficulty: 1
  },
  {
    id: "ALY022", category: "alkyne", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "HC≡C−CH₂−CH(CH₃)−CH₂−CH₃",
    choices: ["3-メチル-5-ヘキシン", "4-メチル-1-ヘキシン", "4-メチル-1-ヘキセン", "4-メチル-2-ヘキシン"],
    answer: 1,
    explanation: "三重結合に最小番号を与えて1-ヘキシン、メチル基は4位。メチル基に近い端から数えた「3-メチル-5-ヘキシン」は番号付けの優先順位(三重結合>置換基)に反する。",
    difficulty: 2
  },
  {
    id: "ALY023", category: "alkyne", type: "name_to_cond",
    question: "「2-オクチン」の示性式はどれか。",
    prompt: "2-オクチン",
    choices: [
      "HC≡C(CH₂)₅CH₃",
      "CH₃C≡C(CH₂)₃CH₃",
      "CH₃C≡C(CH₂)₄CH₃",
      "CH₃CH=CH(CH₂)₄CH₃"
    ],
    answer: 2,
    explanation: "C8のC2−C3間に三重結合。「HC≡C(CH₂)₅CH₃」は1-オクチン、「CH₃C≡C(CH₂)₃CH₃」はC7の2-ヘプチン(炭素数ミス)、「CH₃CH=CH(CH₂)₄CH₃」は2-オクテン(二重結合)。",
    difficulty: 1
  },
  {
    id: "ALY024", category: "alkyne", type: "name_to_struct",
    question: "「2,5-ジメチル-3-ヘキシン」の構造式はどれか。",
    prompt: "2,5-ジメチル-3-ヘキシン",
    choices: [
      "(CH₃)₂CH−C≡C−CH(CH₃)₂",
      "CH₃CH₂−C≡C−CH₂CH₃",
      "(CH₃)₂CH−C≡C−CH₂CH₃",
      "(CH₃)₂CH−CH=CH−CH(CH₃)₂"
    ],
    answer: 0,
    explanation: "ヘキシン主鎖(三重結合3,4位)のC2とC5にメチル基がある対称構造。「CH₃CH₂−C≡C−CH₂CH₃」は3-ヘキシン(メチル基なし)、「(CH₃)₂CH−C≡C−CH₂CH₃」は2-メチル-3-ヘキシン(片側だけ)、「(CH₃)₂CH−CH=CH−CH(CH₃)₂」はアルケン(2,5-ジメチル-3-ヘキセン)。",
    difficulty: 2
  },
  {
    id: "ALY025", category: "alkyne", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "HC≡C−CH₂−CH₂−C≡CH",
    choices: ["1,5-ヘキサジエン", "2,5-ヘキサジイン", "1,5-ヘキサジイン", "1,3-ヘキサジイン"],
    answer: 2,
    explanation: "三重結合2つの語尾は「ジイン」で、位置はC1−C2とC5−C6なので1,5-。どちらの端から数えても1,5になる対称構造。「ジエン」(二重結合2つ)との語尾の混同が最大の引っかけ。",
    difficulty: 2
  },

  // ================= アルコール (6) =================
  {
    id: "OL025", category: "alcohol", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃OH",
    choices: ["メタナール", "メタノール", "エタノール", "メタン酸"],
    answer: 1,
    explanation: "C1のアルコールなのでメタノール。語尾「-オール」(アルコール)、「-アール」(アルデヒド)、「〜酸」(カルボン酸)の区別が基本。",
    difficulty: 1
  },
  {
    id: "OL026", category: "alcohol", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CH(CH₃)−CH₂−CH₂−OH",
    choices: ["2-メチル-4-ブタノール", "3-メチル-1-ブタノール", "2-メチル-1-ブタノール", "3-メチル-2-ブタノール"],
    answer: 1,
    explanation: "OH基に最小番号を与えるのでOHが1位・メチル基が3位。メチル基側から数えた「2-メチル-4-ブタノール」は番号最小則違反。「2-メチル-1-ブタノール」はメチル基の位置が異なる別の化合物。",
    difficulty: 2
  },
  {
    id: "OL027", category: "alcohol", type: "name_to_cond",
    question: "「1-ペンタノール」の示性式はどれか。",
    prompt: "1-ペンタノール",
    choices: [
      "CH₃(CH₂)₄OH",
      "CH₃CH(OH)CH₂CH₂CH₃",
      "CH₃(CH₂)₃OH",
      "CH₃(CH₂)₃CHO"
    ],
    answer: 0,
    explanation: "C5の末端(C1)にOH。「CH₃CH(OH)CH₂CH₂CH₃」は2-ペンタノール、「CH₃(CH₂)₃OH」はC4の1-ブタノール(炭素数ミス)、「CH₃(CH₂)₃CHO」はペンタナール(アルデヒド)。",
    difficulty: 1
  },
  {
    id: "OL028", category: "alcohol", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "HOCH₂CH₂CH₂CH₂OH",
    choices: ["1,3-ブタンジオール", "1,4-ブタンジオール", "ブタンジオール", "1,4-ブタンジアール"],
    answer: 1,
    explanation: "C4の両末端(1,4位)にOHをもつ2価アルコール。異性体(1,2-、1,3-、2,3-)があるため位置番号は省略できない。「ジアール」はアルデヒド2つの語尾で別物。",
    difficulty: 1
  },
  {
    id: "OL029", category: "alcohol", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CH₂−CH(OH)−CH₂−CH₂−CH₃",
    choices: ["4-ヘキサノール", "2-ヘキサノール", "3-ヘキサノール", "3-ヘキサノン"],
    answer: 2,
    explanation: "OH基の位置番号が小さくなる端から数えて3-ヘキサノール(逆端からは4)。OHの左右の炭素数(2個と3個)を正確に数える。「3-ヘキサノン」はケトンで語尾が異なる。",
    difficulty: 1
  },
  {
    id: "OL030", category: "alcohol", type: "name_to_struct",
    question: "「2-メチル-1-プロパノール」の構造式はどれか。",
    prompt: "2-メチル-1-プロパノール",
    choices: [
      "(CH₃)₃C−OH",
      "CH₃−CH₂−CH₂−CH₂−OH",
      "CH₃−CH(OH)−CH₂−CH₃",
      "(CH₃)₂CH−CH₂−OH"
    ],
    answer: 3,
    explanation: "プロパン主鎖のC1にOH、C2にメチル基(第一級アルコール)。「(CH₃)₃C−OH」は2-メチル-2-プロパノール(第三級)、「CH₃−CH₂−CH₂−CH₂−OH」は1-ブタノール、「CH₃−CH(OH)−CH₂−CH₃」は2-ブタノール(いずれも同じ分子式C₄H₁₀Oの異性体)。",
    difficulty: 2
  },

  // ================= アルデヒド (5) =================
  {
    id: "AL021", category: "aldehyde", type: "name_to_cond",
    question: "「ヘプタナール」の示性式はどれか。",
    prompt: "ヘプタナール",
    choices: [
      "CH₃(CH₂)₄CHO",
      "CH₃(CH₂)₅CHO",
      "CH₃(CH₂)₅CH₂OH",
      "CH₃CO(CH₂)₄CH₃"
    ],
    answer: 1,
    explanation: "CHOの炭素を含めてC7。「CH₃(CH₂)₄CHO」はC6のヘキサナール(炭素数ミス)、「CH₃(CH₂)₅CH₂OH」は1-ヘプタノール(アルコール)、「CH₃CO(CH₂)₄CH₃」は2-ヘプタノン(ケトン)。",
    difficulty: 1
  },
  {
    id: "AL022", category: "aldehyde", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CH(CH₃)−CH(CH₃)−CHO",
    choices: ["2,3-ジメチルブタナール", "3,4-ジメチルブタナール", "2,2-ジメチルブタナール", "2,3-ジメチルブタノール"],
    answer: 0,
    explanation: "CHO=C1として、メチル基はC2とC3。CHOと反対側から数えた「3,4-」型は誤り(アルデヒドでは番号の向きに選択の余地がない)。語尾「-オール」はアルコール。",
    difficulty: 2
  },
  {
    id: "AL023", category: "aldehyde", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "OHC−CHO",
    choices: ["エタンジオール", "エタン二酸", "エタンジアール", "メタナール"],
    answer: 2,
    explanation: "CHOが2つ直結した最小のジアルデヒドでエタンジアール(C2)。「エタンジオール」(OH×2)、「エタン二酸」(COOH×2)との語尾の区別が問われる。",
    difficulty: 2
  },
  {
    id: "AL024", category: "aldehyde", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "(CH₃)₃CCH₂CHO",
    choices: ["2,2-ジメチルブタナール", "3,3-ジメチルブタナール", "3,3-ジメチルブタノール", "2,2-ジメチルプロパナール"],
    answer: 1,
    explanation: "CHO=C1、CH₂=C2、C(CH₃)₃の中心炭素=C3なので、メチル基は3,3位。主鎖はC4(ブタナール)。C2に付いていると見誤った「2,2-」が引っかけ。",
    difficulty: 2
  },
  {
    id: "AL025", category: "aldehyde", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₂=CH−CH₂−CH₂−CHO",
    choices: ["1-ペンテナール", "2-ペンテナール", "4-ペンテナール", "4-ペンテン-1-オール"],
    answer: 2,
    explanation: "CHOの炭素が必ず1位なので、二重結合はC4−C5間で4-ペンテナール。「1-ペンテナール」はC1がCHOである以上二重結合を1位に置けないため成立しない名前。",
    difficulty: 2
  },

  // ================= ケトン (5) =================
  {
    id: "KE021", category: "ketone", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃CO(CH₂)₄CH₃",
    choices: ["6-ヘプタノン", "2-ヘプタノン", "3-ヘプタノン", "2-ヘキサノン"],
    answer: 1,
    explanation: "C=Oを含めてC7でC=Oは2位。逆端から数えた「6-ヘプタノン」は番号最小則違反。(CH₂)₄の展開を忘れると炭素数を間違える。",
    difficulty: 1
  },
  {
    id: "KE022", category: "ketone", type: "name_to_cond",
    question: "「4-ヘプタノン」の示性式はどれか。",
    prompt: "4-ヘプタノン",
    choices: [
      "CH₃CH₂COCH₂CH₂CH₂CH₃",
      "CH₃CH₂CH₂COCH₂CH₂CH₃",
      "CH₃CO(CH₂)₄CH₃",
      "CH₃CH₂CH₂CH(OH)CH₂CH₂CH₃"
    ],
    answer: 1,
    explanation: "C7の中央(C4)にC=Oがある対称ケトン。「CH₃CH₂COCH₂CH₂CH₂CH₃」は3-ヘプタノン、「CH₃CO(CH₂)₄CH₃」は2-ヘプタノン、「CH₃CH₂CH₂CH(OH)CH₂CH₂CH₃」は4-ヘプタノール(アルコール)。C=Oの左右の炭素数(3個ずつ)を確認する。",
    difficulty: 1
  },
  {
    id: "KE023", category: "ketone", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CO−CH₂−CO−CH₂−CH₃",
    choices: ["3,5-ヘキサンジオン", "2,4-ヘキサンジオン", "2,4-ペンタンジオン", "2,4-ヘキサンジオール"],
    answer: 1,
    explanation: "C6でC=Oは2位と4位。位置番号の組は{2,4}と{3,5}で小さい{2,4}を採用する。逆端から数えた「3,5-」が引っかけ。炭素数を5と数え間違えると「ペンタンジオン」になる。",
    difficulty: 2
  },
  {
    id: "KE024", category: "ketone", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃COCH₂C(CH₃)₃",
    choices: ["2,2-ジメチル-4-ペンタノン", "4,4-ジメチル-2-ペンタノン", "4-メチル-2-ペンタノン", "4,4-ジメチル-2-ペンタノール"],
    answer: 1,
    explanation: "C=Oに最小番号を与えるのでC=Oが2位、メチル基2つは4位。C(CH₃)₃側から数えた「2,2-ジメチル-4-ペンタノン」は番号付けの優先順位(C=O>置換基)に反する。",
    difficulty: 2
  },
  {
    id: "KE025", category: "ketone", type: "name_to_cond",
    question: "「2-オクタノン」の示性式はどれか。",
    prompt: "2-オクタノン",
    choices: [
      "CH₃CO(CH₂)₄CH₃",
      "CH₃CH₂CO(CH₂)₄CH₃",
      "CH₃CO(CH₂)₅CH₃",
      "CH₃(CH₂)₆CHO"
    ],
    answer: 2,
    explanation: "C8のC2にC=O。「CH₃CO(CH₂)₄CH₃」はC7の2-ヘプタノン(炭素数ミス)、「CH₃CH₂CO(CH₂)₄CH₃」は3-オクタノン、「CH₃(CH₂)₆CHO」はオクタナール(アルデヒド)。",
    difficulty: 1
  },

  // ================= カルボン酸 (6) =================
  {
    id: "CA025", category: "carboxylic_acid", type: "struct_to_name",
    question: "次の構造式で表される化合物(シス形)の慣用名はどれか。",
    prompt: "HOOC     COOH\n     \\      /\n      C == C\n     /      \\\n    H        H",
    choices: ["フマル酸", "マレイン酸", "シュウ酸", "マロン酸"],
    answer: 1,
    explanation: "2つのCOOHが二重結合の同じ側にあるシス形がマレイン酸(トランス形はフマル酸)。シス形のマレイン酸だけが加熱により分子内で脱水して酸無水物になる。",
    difficulty: 2
  },
  {
    id: "CA026", category: "carboxylic_acid", type: "name_to_cond",
    question: "「オクタン酸」の示性式はどれか。",
    prompt: "オクタン酸",
    choices: [
      "CH₃(CH₂)₅COOH",
      "CH₃(CH₂)₆COOH",
      "CH₃(CH₂)₇COOH",
      "CH₃(CH₂)₆CHO"
    ],
    answer: 1,
    explanation: "COOHの炭素を含めてC8。「CH₃(CH₂)₅COOH」はヘプタン酸(C7)、「CH₃(CH₂)₇COOH」はノナン酸(C9)、「CH₃(CH₂)₆CHO」はオクタナール(アルデヒド)。COOH炭素の数え方が全カルボン酸共通のポイント。",
    difficulty: 1
  },
  {
    id: "CA027", category: "carboxylic_acid", type: "struct_to_name",
    question: "次の構造式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃−CH(CH₃)−CH₂−CH₂−COOH",
    choices: ["2-メチルペンタン酸", "4-メチルペンタン酸", "ヘキサン酸", "4-メチルペンタナール"],
    answer: 1,
    explanation: "COOHの炭素が必ず1位なので、メチル基は4位。COOHと反対側から数えた「2-メチルペンタン酸」が引っかけ。全炭素数6でも枝分かれがあるので直鎖のヘキサン酸ではない。",
    difficulty: 2
  },
  {
    id: "CA028", category: "carboxylic_acid", type: "cond_to_name",
    question: "次の示性式で表される化合物のIUPAC名はどれか。",
    prompt: "CH₃CH₂CH(C₂H₅)COOH",
    choices: ["3-メチルペンタン酸", "2-エチルブタン酸", "ヘキサン酸", "2-エチルブタナール"],
    answer: 1,
    explanation: "COOH=C1を含む最長鎖はC4(ブタン酸)で、C2にエチル基。全炭素数6から直鎖の「ヘキサン酸」とするのは主鎖と置換基の混同。「3-メチルペンタン酸」はこの構造とは別の異性体。",
    difficulty: 3
  },
  {
    id: "CA029", category: "carboxylic_acid", type: "cond_to_name",
    question: "ベンゼン環のオルト位(1,2位)にCOOHが2つ付いた化合物の名称はどれか。",
    prompt: "C₆H₄(COOH)₂(オルト位)",
    choices: ["テレフタル酸", "フタル酸", "安息香酸", "サリチル酸"],
    answer: 1,
    explanation: "オルト位にCOOH2つをもつのがフタル酸(加熱で無水フタル酸になる)。パラ位ならテレフタル酸。COOHが1つの安息香酸、OHとCOOHをもつサリチル酸との区別も頻出。",
    difficulty: 2
  },
  {
    id: "CA030", category: "carboxylic_acid", type: "cond_to_name",
    question: "ベンゼン環のパラ位(1,4位)にCOOHが2つ付いた化合物の名称はどれか。",
    prompt: "C₆H₄(COOH)₂(パラ位)",
    choices: ["フタル酸", "サリチル酸", "テレフタル酸", "安息香酸"],
    answer: 2,
    explanation: "パラ位にCOOH2つをもつのがテレフタル酸(PET=ポリエチレンテレフタラートの原料)。オルト位のフタル酸との位置関係の区別が最大のポイント。",
    difficulty: 2
  },

  // ================= エステル (6) =================
  {
    id: "ES025", category: "ester", type: "cond_to_name",
    question: "次の示性式で表される化合物の名称はどれか。",
    prompt: "CH₃COOCH(CH₃)₂",
    choices: ["酢酸プロピル", "酢酸イソプロピル", "プロパン酸エチル", "ギ酸イソプロピル"],
    answer: 1,
    explanation: "CH₃CO−が酢酸由来で、−OCH(CH₃)₂は2-プロパノール由来のイソプロピル基。直鎖と読み違えた「酢酸プロピル」が引っかけ。「プロパン酸エチル」は同じ分子式C₅H₁₀O₂の異性体。",
    difficulty: 2
  },
  {
    id: "ES026", category: "ester", type: "name_to_cond",
    question: "「安息香酸エチル」の示性式はどれか。",
    prompt: "安息香酸エチル",
    choices: [
      "C₆H₅COOC₂H₅",
      "C₆H₅COOCH₃",
      "C₆H₅CH₂COOC₂H₅",
      "CH₃COOCH₂C₆H₅"
    ],
    answer: 0,
    explanation: "安息香酸(C₆H₅COOH)のエチルエステル。「C₆H₅COOCH₃」は安息香酸メチル、「C₆H₅CH₂COOC₂H₅」はフェニル酢酸エチル(CH₂が入る)、「CH₃COOCH₂C₆H₅」は酢酸ベンジル(酸側とアルコール側が逆)。",
    difficulty: 2
  },
  {
    id: "ES027", category: "ester", type: "name_to_cond",
    question: "「ペンタン酸メチル」の示性式はどれか。",
    prompt: "ペンタン酸メチル",
    choices: [
      "CH₃(CH₂)₂COOCH₃",
      "CH₃(CH₂)₃COOCH₃",
      "CH₃COO(CH₂)₃CH₃",
      "CH₃(CH₂)₃COOC₂H₅"
    ],
    answer: 1,
    explanation: "ペンタン酸(C5、COOH炭素を含む)のメチルエステル。「CH₃(CH₂)₂COOCH₃」はブタン酸メチル(酸側の炭素数ミス)、「CH₃COO(CH₂)₃CH₃」は酢酸ブチル(同じ分子式C₆H₁₂O₂の異性体)、「CH₃(CH₂)₃COOC₂H₅」はペンタン酸エチル。",
    difficulty: 2
  },
  {
    id: "ES028", category: "ester", type: "name_to_cond",
    question: "「サリチル酸エチル」の示性式はどれか。",
    prompt: "サリチル酸エチル",
    choices: [
      "C₆H₄(OH)COOC₂H₅",
      "C₆H₄(OH)COOCH₃",
      "C₆H₅COOC₂H₅",
      "C₆H₄(OCOCH₃)COOH"
    ],
    answer: 0,
    explanation: "サリチル酸(オルト位にOHとCOOH)のCOOH側がエチルエステル化された構造。「C₆H₄(OH)COOCH₃」はサリチル酸メチル、「C₆H₅COOC₂H₅」はOHのない安息香酸エチル、「C₆H₄(OCOCH₃)COOH」はアセチルサリチル酸。",
    difficulty: 2
  },
  {
    id: "ES029", category: "ester", type: "cond_to_name",
    question: "次の示性式で表される化合物の名称はどれか。",
    prompt: "C₂H₅COOCH(CH₃)₂",
    choices: ["プロパン酸プロピル", "プロパン酸イソプロピル", "ブタン酸エチル", "酢酸ブチル"],
    answer: 1,
    explanation: "C₂H₅CO−がプロパン酸由来、−OCH(CH₃)₂がイソプロピル基。直鎖と読み違えた「プロパン酸プロピル」、および同じ分子式C₆H₁₂O₂の異性体「ブタン酸エチル」「酢酸ブチル」が引っかけ。",
    difficulty: 2
  },
  {
    id: "ES030", category: "ester", type: "struct_to_name",
    question: "次の構造式で表される化合物の名称はどれか。",
    prompt: "C₆H₅−O−CO−CH₂−CH₃",
    choices: ["安息香酸エチル", "プロパン酸フェニル", "プロパン酸ベンジル", "酢酸フェニル"],
    answer: 1,
    explanation: "C=Oをもつ右側のC₂H₅CO−がプロパン酸由来で、C₆H₅O−はフェノール由来。「−O−CO−」の向きを読み違えて酸側とアルコール側を逆に取ると「安息香酸エチル」に引っかかる。ベンジル基(C₆H₅CH₂−)との区別にも注意。",
    difficulty: 3
  },

  // ================= エーテル (5) =================
  {
    id: "ET021", category: "ether", type: "name_to_cond",
    question: "「ブチルエチルエーテル」の示性式はどれか。",
    prompt: "ブチルエチルエーテル",
    choices: [
      "CH₃O(CH₂)₃CH₃",
      "C₂H₅OCH₂CH₂CH₃",
      "C₂H₅O(CH₂)₃CH₃",
      "C₂H₅OC₂H₅"
    ],
    answer: 2,
    explanation: "直鎖ブチル基(C4)とエチル基(C2)のエーテル。「CH₃O(CH₂)₃CH₃」はブチルメチルエーテル、「C₂H₅OCH₂CH₂CH₃」はエチルプロピルエーテル、「C₂H₅OC₂H₅」はジエチルエーテル。両側の基の炭素数を正確に対応させる。",
    difficulty: 1
  },
  {
    id: "ET022", category: "ether", type: "cond_to_name",
    question: "次の示性式で表される化合物の名称はどれか。",
    prompt: "CH₃(CH₂)₃O(CH₂)₃CH₃",
    choices: ["ジプロピルエーテル", "ジブチルエーテル", "ブチルメチルエーテル", "ジエチルエーテル"],
    answer: 1,
    explanation: "直鎖ブチル基(C4)2つがOをはさんだ対称エーテル。(CH₂)₃+CH₃で片側4炭素になることを正確に数える。片側だけ見て「ブチルメチルエーテル」としないこと。",
    difficulty: 1
  },
  {
    id: "ET023", category: "ether", type: "name_to_cond",
    question: "分子式C₅H₁₂Oの構造異性体のうち、エーテルであるものの示性式はどれか。",
    prompt: "C₅H₁₂O",
    choices: [
      "CH₃(CH₂)₄OH",
      "C₂H₅OCH₂CH₂CH₃",
      "CH₃CH(OH)CH₂CH₂CH₃",
      "(CH₃)₂CHCH₂CH₂OH"
    ],
    answer: 1,
    explanation: "C−O−C結合をもつのはエチルプロピルエーテルのみ。他の3つはOH基をもつアルコール(1-ペンタノール、2-ペンタノール、3-メチル-1-ブタノール)。同じ分子式でも官能基で分類できることがポイント。",
    difficulty: 1
  },
  {
    id: "ET024", category: "ether", type: "cond_to_name",
    question: "次の示性式で表される化合物の名称はどれか。",
    prompt: "(CH₃)₂CHOCH₂CH₂CH₃",
    choices: ["ジプロピルエーテル", "ジイソプロピルエーテル", "イソプロピルプロピルエーテル", "エチルプロピルエーテル"],
    answer: 2,
    explanation: "Oの左は枝分かれしたイソプロピル基、右は直鎖プロピル基。両方直鎖と見た「ジプロピルエーテル」、両方枝分かれと見た「ジイソプロピルエーテル」が引っかけ。左右の基を別々に確認する。",
    difficulty: 2
  },
  {
    id: "ET025", category: "ether", type: "struct_to_name",
    question: "次の構造式で表される化合物の名称はどれか。",
    prompt: "CH₃−O−CH₂−CH(CH₃)−CH₃",
    choices: ["ブチルメチルエーテル", "イソブチルメチルエーテル", "イソプロピルメチルエーテル", "エチルプロピルエーテル"],
    answer: 1,
    explanation: "−CH₂−CH(CH₃)−CH₃はイソブチル基((CH₃)₂CHCH₂−、C4)。直鎖のブチル基と読み違えた「ブチルメチルエーテル」、C3のイソプロピル基と混同した「イソプロピルメチルエーテル」が引っかけ。",
    difficulty: 2
  }

];
