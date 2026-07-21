// reactions.js
// 「実験室」モード用 反応データ定義
// グローバル変数として公開:
//   labMolecules       … 実験室で扱う全分子の登録簿
//   reactionCategories … 反応カテゴリ（2階層メニュー用）
//
// 反応の適用可否・生成物の計算は chem_engine.js の ChemEngine が担当する。
// 各反応は SMARTS ルールと専用関数で法則性から動的に計算され、
// 生成物名称は IUPAC 命名規則に基づいて自動生成される。

/* global */

// ─────────────────────────────────────────────────────────────────────────────
// 分子登録簿
// 既存の moleculeSVGs / moleculeSMILES で管理されている分子も含め、
// 実験室モードで使う分子の「名前・分子式・SMILES」を一元管理する。
// SVG描画は Phase2-3 で RDKit.js を利用してオンデマンドレンダリングする。
// ─────────────────────────────────────────────────────────────────────────────
const labMolecules = {

  // ── 芳香族 ──────────────────────────────────────────────────────────────
  benzene:              { id:"benzene",              nameJa:"ベンゼン",            formula:"C₆H₆",        smiles:"c1ccccc1" },
  toluene:              { id:"toluene",              nameJa:"トルエン",            formula:"C₇H₈",        smiles:"Cc1ccccc1" },
  ethylbenzene:         { id:"ethylbenzene",         nameJa:"エチルベンゼン",      formula:"C₈H₁₀",       smiles:"CCc1ccccc1" },
  cumene:               { id:"cumene",               nameJa:"クメン（イソプロピルベンゼン）", formula:"C₉H₁₂", smiles:"CC(C)c1ccccc1" },
  cumene_hydroperoxide: { id:"cumene_hydroperoxide",  nameJa:"クメンヒドロペルオキシド",     formula:"C₉H₁₂O₂", smiles:"CC(C)(OO)c1ccccc1" },
  styrene:              { id:"styrene",              nameJa:"スチレン",            formula:"C₈H₈",        smiles:"C=Cc1ccccc1" },
  phenol:               { id:"phenol",               nameJa:"フェノール",          formula:"C₆H₅OH",      smiles:"Oc1ccccc1" },
  aniline:              { id:"aniline",              nameJa:"アニリン",            formula:"C₆H₅NH₂",     smiles:"Nc1ccccc1" },
  anisole:              { id:"anisole",              nameJa:"アニソール",          formula:"C₇H₈O",       smiles:"COc1ccccc1" },
  nitrobenzene:         { id:"nitrobenzene",         nameJa:"ニトロベンゼン",      formula:"C₆H₅NO₂",     smiles:"O=[N+]([O-])c1ccccc1" },
  chlorobenzene:        { id:"chlorobenzene",        nameJa:"クロロベンゼン",      formula:"C₆H₅Cl",      smiles:"Clc1ccccc1" },
  bromobenzene:         { id:"bromobenzene",         nameJa:"ブロモベンゼン",      formula:"C₆H₅Br",      smiles:"Brc1ccccc1" },
  benzenesulfonic_acid: { id:"benzenesulfonic_acid", nameJa:"ベンゼンスルホン酸",  formula:"C₆H₅SO₃H",    smiles:"OS(=O)(=O)c1ccccc1" },
  benzaldehyde:         { id:"benzaldehyde",         nameJa:"ベンズアルデヒド",    formula:"C₇H₆O",       smiles:"O=Cc1ccccc1" },
  benzyl_alcohol:       { id:"benzyl_alcohol",       nameJa:"ベンジルアルコール",  formula:"C₇H₈O",       smiles:"OCc1ccccc1" },
  acetophenone:         { id:"acetophenone",         nameJa:"アセトフェノン",      formula:"C₈H₈O",       smiles:"CC(=O)c1ccccc1" },
  benzoic_acid:         { id:"benzoic_acid",         nameJa:"安息香酸",            formula:"C₇H₆O₂",      smiles:"OC(=O)c1ccccc1" },
  methyl_benzoate:      { id:"methyl_benzoate",      nameJa:"安息香酸メチル",      formula:"C₈H₈O₂",      smiles:"COC(=O)c1ccccc1" },
  ethyl_benzoate:       { id:"ethyl_benzoate",       nameJa:"安息香酸エチル",      formula:"C₉H₁₀O₂",     smiles:"CCOC(=O)c1ccccc1" },
  benzamide:            { id:"benzamide",            nameJa:"ベンズアミド",        formula:"C₇H₇NO",      smiles:"NC(=O)c1ccccc1" },
  salicylic_acid:       { id:"salicylic_acid",       nameJa:"サリチル酸",          formula:"C₇H₆O₃",      smiles:"OC(=O)c1ccccc1O" },
  methyl_salicylate:    { id:"methyl_salicylate",    nameJa:"サリチル酸メチル",    formula:"C₈H₈O₃",      smiles:"COC(=O)c1ccccc1O" },
  aspirin:              { id:"aspirin",              nameJa:"アスピリン",          formula:"C₉H₈O₄",      smiles:"CC(=O)Oc1ccccc1C(=O)O" },
  phthalic_acid:        { id:"phthalic_acid",        nameJa:"フタル酸（o-）",      formula:"C₈H₆O₄",     smiles:"OC(=O)c1ccccc1C(=O)O" },
  phthalic_anhydride:   { id:"phthalic_anhydride",   nameJa:"無水フタル酸",        formula:"C₈H₄O₃",     smiles:"O=C1OC(=O)c2ccccc21" },
  isophthalic_acid:     { id:"isophthalic_acid",     nameJa:"イソフタル酸（m-）",  formula:"C₈H₆O₄",     smiles:"OC(=O)c1cccc(C(=O)O)c1" },
  terephthalic_acid:    { id:"terephthalic_acid",    nameJa:"テレフタル酸（p-）",  formula:"C₈H₆O₄",     smiles:"OC(=O)c1ccc(C(=O)O)cc1" },
  acetanilide:          { id:"acetanilide",          nameJa:"アセトアニリド",      formula:"C₈H₉NO",      smiles:"CC(=O)Nc1ccccc1" },
  o_xylene:             { id:"o_xylene",             nameJa:"o-キシレン",          formula:"C₈H₁₀",       smiles:"Cc1ccccc1C" },
  m_xylene:             { id:"m_xylene",             nameJa:"m-キシレン",          formula:"C₈H₁₀",       smiles:"Cc1cccc(C)c1" },
  p_xylene:             { id:"p_xylene",             nameJa:"p-キシレン",          formula:"C₈H₁₀",       smiles:"Cc1ccc(C)cc1" },
  naphthalene:          { id:"naphthalene",          nameJa:"ナフタレン",          formula:"C₁₀H₈",       smiles:"c1ccc2ccccc2c1" },
  phenanthrene:         { id:"phenanthrene",         nameJa:"フェナントレン",      formula:"C₁₄H₁₀",     smiles:"c1ccc2ccc3ccccc3c2c1" },
  acetaminophen:        { id:"acetaminophen",        nameJa:"アセトアミノフェン",  formula:"C₈H₉NO₂",    smiles:"CC(=O)Nc1ccc(O)cc1" },
  bromotoluene:         { id:"bromotoluene",         nameJa:"ブロモトルエン（p-体主）", formula:"C₇H₇Br", smiles:"Cc1ccc(Br)cc1" },
  nitrotoluene:         { id:"nitrotoluene",         nameJa:"ニトロトルエン（o-体主）", formula:"C₇H₇NO₂", smiles:"Cc1ccccc1[N+](=O)[O-]" },
  cyclohexane:          { id:"cyclohexane",          nameJa:"シクロヘキサン",      formula:"C₆H₁₂",       smiles:"C1CCCCC1" },
  cresol:               { id:"cresol",               nameJa:"クレゾール",          formula:"C₇H₈O",       smiles:"Cc1ccccc1O" },
  hydroquinone:         { id:"hydroquinone",         nameJa:"ヒドロキノン",        formula:"C₆H₆O₂",     smiles:"Oc1ccc(O)cc1" },
  benzoquinone:         { id:"benzoquinone",         nameJa:"キノン（p-ベンゾキノン）", formula:"C₆H₄O₂", smiles:"O=C1C=CC(=O)C=C1" },
  naphthol:             { id:"naphthol",             nameJa:"ナフトール（β-体）",  formula:"C₁₀H₈O",     smiles:"Oc1ccc2ccccc2c1" },
  cubane:               { id:"cubane",               nameJa:"キュバン",            formula:"C₈H₈",       smiles:"C12C3C4C1C5C2C3C45" },
  biphenyl:             { id:"biphenyl",             nameJa:"ビフェニル",          formula:"C₁₂H₁₀",    smiles:"c1ccc(-c2ccccc2)cc1" },
  binolR:               { id:"binolR",               nameJa:"(R)-BINOL",          formula:"C₂₀H₁₄O₂",  smiles:"Oc1ccc2ccccc2c1-c1c(O)ccc2ccccc12" },
  binolS:               { id:"binolS",               nameJa:"(S)-BINOL",          formula:"C₂₀H₁₄O₂",  smiles:"Oc1ccc2ccccc2c1-c1c(O)ccc2ccccc12" },
  biphenylDiolR:        { id:"biphenylDiolR",        nameJa:"(R)-6,6'-ジエチル-2,2'-ビフェニルジオール", formula:"C₁₆H₁₈O₂", smiles:"CCc1ccc(O)c(-c2c(O)ccc(CC)c2)c1" },
  biphenylDiolS:        { id:"biphenylDiolS",        nameJa:"(S)-6,6'-ジエチル-2,2'-ビフェニルジオール", formula:"C₁₆H₁₈O₂", smiles:"CCc1ccc(O)c(-c2c(O)ccc(CC)c2)c1" },
  dinitrobenzene:       { id:"dinitrobenzene",       nameJa:"ジニトロベンゼン",    formula:"C₆H₄(NO₂)₂", smiles:"O=[N+]([O-])c1cccc([N+](=O)[O-])c1" },
  sodium_phenoxide:     { id:"sodium_phenoxide",     nameJa:"ナトリウムフェノキシド", formula:"C₆H₅ONa",  smiles:"[Na+].[O-]c1ccccc1" },
  benzyl_chloride:      { id:"benzyl_chloride",      nameJa:"塩化ベンジル",          formula:"C₇H₇Cl",   smiles:"ClCc1ccccc1" },
  tribromophenol:       { id:"tribromophenol",       nameJa:"2,4,6-トリブロモフェノール", formula:"C₆H₂Br₃OH", smiles:"Oc1c(Br)cc(Br)cc1Br" },
  tribromoaniline:      { id:"tribromoaniline",      nameJa:"2,4,6-トリブロモアニリン",  formula:"C₆H₂Br₃NH₂", smiles:"Nc1c(Br)cc(Br)cc1Br" },

  // ── アルカン ────────────────────────────────────────────────────────────
  methane:   { id:"methane",   nameJa:"メタン",   formula:"CH₄",     smiles:"C" },
  ethane:    { id:"ethane",    nameJa:"エタン",   formula:"C₂H₆",    smiles:"CC" },
  propane:   { id:"propane",   nameJa:"プロパン", formula:"C₃H₈",    smiles:"CCC" },
  butane:    { id:"butane",    nameJa:"ブタン",   formula:"C₄H₁₀",   smiles:"CCCC" },
  isobutane: { id:"isobutane", nameJa:"イソブタン", formula:"C₄H₁₀", smiles:"CC(C)C" },

  // ── アルケン ────────────────────────────────────────────────────────────
  ethene:   { id:"ethene",   nameJa:"エテン（エチレン）",   formula:"C₂H₄",  smiles:"C=C" },
  propene:  { id:"propene",  nameJa:"プロペン（プロピレン）", formula:"C₃H₆", smiles:"C=CC" },
  butene_1: { id:"butene_1", nameJa:"1-ブテン",             formula:"C₄H₈",  smiles:"C=CCC" },
  butene_2: { id:"butene_2", nameJa:"2-ブテン",             formula:"C₄H₈",  smiles:"CC=CC" },

  // ── アルキン ────────────────────────────────────────────────────────────
  ethyne:           { id:"ethyne",           nameJa:"エチン（アセチレン）", formula:"C₂H₂",  smiles:"C#C" },
  propyne:          { id:"propyne",          nameJa:"プロピン",            formula:"C₃H₄",  smiles:"CC#C" },
  sodium_acetylide: { id:"sodium_acetylide", nameJa:"アセチリドナトリウム", formula:"C₂HNa", smiles:"[Na]C#C" },
  silver_acetylide: { id:"silver_acetylide", nameJa:"アセチリド銀",         formula:"C₂Ag₂", smiles:"[Ag]C#C[Ag]" },
  calcium_carbide:  { id:"calcium_carbide",  nameJa:"炭化カルシウム（カーバイド）", formula:"CaC₂", smiles:"[Ca+2].[C-]#[C-]" },

  // ── ハロゲン化物（反応生成物） ──────────────────────────────────────────
  bromoethane:       { id:"bromoethane",       nameJa:"ブロモエタン（臭化エチル）", formula:"C₂H₅Br", smiles:"CCBr" },
  ethylene_dibromide:{ id:"ethylene_dibromide", nameJa:"1,2-ジブロモエタン",       formula:"C₂H₄Br₂", smiles:"BrCCBr" },
  "2_bromopropane":    { id:"2_bromopropane",    nameJa:"2-ブロモプロパン",          formula:"C₃H₇Br",  smiles:"CC(Br)C" },
  "1_2_dibromopropane":{ id:"1_2_dibromopropane", nameJa:"1,2-ジブロモプロパン",    formula:"C₃H₆Br₂", smiles:"BrCC(Br)C" },
  vinyl_chloride:    { id:"vinyl_chloride",    nameJa:"塩化ビニル",               formula:"C₂H₃Cl",  smiles:"C=CCl" },
  vinyl_bromide:     { id:"vinyl_bromide",     nameJa:"ブロモエチレン（臭化ビニル）", formula:"C₂H₃Br",  smiles:"C=CBr" },
  dibromoethylene:   { id:"dibromoethylene",   nameJa:"1,2-ジブロモエチレン",        formula:"C₂H₂Br₂", smiles:"BrC=CBr" },
  chloromethane:        { id:"chloromethane",        nameJa:"クロロメタン（塩化メチル）",              formula:"CH₃Cl",    smiles:"CCl" },
  bromomethane:         { id:"bromomethane",         nameJa:"ブロモメタン（臭化メチル）",              formula:"CH₃Br",    smiles:"CBr" },
  chloroethane:         { id:"chloroethane",         nameJa:"クロロエタン（塩化エチル）",              formula:"C₂H₅Cl",   smiles:"CCCl" },
  iodoethane:           { id:"iodoethane",           nameJa:"ヨードエタン（ヨウ化エチル）",            formula:"C₂H₅I",    smiles:"CCI" },
  chloropropane_1:      { id:"chloropropane_1",      nameJa:"1-クロロプロパン（塩化n-プロピル）",      formula:"C₃H₇Cl",   smiles:"CCCCl" },
  chloropropane_2:      { id:"chloropropane_2",      nameJa:"2-クロロプロパン（塩化イソプロピル）",    formula:"C₃H₇Cl",   smiles:"CC(Cl)C" },
  allyl_chloride:       { id:"allyl_chloride",       nameJa:"塩化アリル（3-クロロ-1-プロペン）",       formula:"C₃H₅Cl",   smiles:"C=CCCl" },
  isobutyl_chloride:    { id:"isobutyl_chloride",    nameJa:"塩化イソブチル（1-クロロ-2-メチルプロパン）", formula:"C₄H₉Cl", smiles:"CC(C)CCl" },
  tert_butyl_chloride:  { id:"tert_butyl_chloride",  nameJa:"塩化tert-ブチル（2-クロロ-2-メチルプロパン）", formula:"C₄H₉Cl", smiles:"CC(C)(C)Cl" },
  propionyl_chloride:   { id:"propionyl_chloride",   nameJa:"塩化プロピオニル（プロピオニルクロリド）",  formula:"C₃H₅ClO",  smiles:"CCC(=O)Cl" },
  acryloyl_chloride:    { id:"acryloyl_chloride",    nameJa:"塩化アクリロイル（アクリロイルクロリド）",  formula:"C₃H₃ClO",  smiles:"C=CC(=O)Cl" },

  // ── アルコール ──────────────────────────────────────────────────────────
  methanol:        { id:"methanol",        nameJa:"メタノール",          formula:"CH₃OH",      smiles:"CO" },
  ethanol:         { id:"ethanol",         nameJa:"エタノール",          formula:"C₂H₅OH",     smiles:"CCO" },
  propanol_1:      { id:"propanol_1",      nameJa:"1-プロパノール",      formula:"C₃H₇OH",     smiles:"CCCO" },
  propanol_2:      { id:"propanol_2",      nameJa:"2-プロパノール",      formula:"C₃H₇OH",     smiles:"CC(O)C" },
  butanol_1:       { id:"butanol_1",       nameJa:"1-ブタノール",        formula:"C₄H₉OH",     smiles:"CCCCO" },
  butanol_2:       { id:"butanol_2",       nameJa:"2-ブタノール",        formula:"C₄H₉OH",     smiles:"CCC(O)C" },
  tert_butanol:    { id:"tert_butanol",    nameJa:"tert-ブタノール",     formula:"C₄H₉OH",     smiles:"CC(C)(C)O" },
  ethylene_glycol: { id:"ethylene_glycol", nameJa:"エチレングリコール",  formula:"C₂H₆O₂",     smiles:"OCCO" },
  glycerol:        { id:"glycerol",        nameJa:"グリセリン",          formula:"C₃H₈O₃",     smiles:"OCC(O)CO" },
  cyclohexanol:    { id:"cyclohexanol",    nameJa:"シクロヘキサノール",  formula:"C₆H₁₁OH",    smiles:"OC1CCCCC1" },

  // ── エーテル ────────────────────────────────────────────────────────────
  dimethyl_ether: { id:"dimethyl_ether", nameJa:"ジメチルエーテル", formula:"C₂H₆O", smiles:"COC" },
  diethyl_ether:  { id:"diethyl_ether",  nameJa:"ジエチルエーテル", formula:"C₄H₁₀O", smiles:"CCOCC" },

  // ── アルデヒド ──────────────────────────────────────────────────────────
  formaldehyde:    { id:"formaldehyde",    nameJa:"ホルムアルデヒド",  formula:"HCHO",    smiles:"C=O" },
  acetaldehyde:    { id:"acetaldehyde",    nameJa:"アセトアルデヒド",  formula:"CH₃CHO",  smiles:"CC=O" },
  propionaldehyde: { id:"propionaldehyde", nameJa:"プロピオンアルデヒド", formula:"C₃H₆O", smiles:"CCC=O" },
  butyraldehyde:   { id:"butyraldehyde",   nameJa:"ブチルアルデヒド",  formula:"C₄H₈O",  smiles:"CCCC=O" },
  aldol:           { id:"aldol",           nameJa:"アルドール（3-ヒドロキシブタナール）", formula:"C₄H₈O₂", smiles:"CC(O)CC=O" },

  // ── ケトン ──────────────────────────────────────────────────────────────
  acetone:       { id:"acetone",       nameJa:"アセトン",       formula:"C₃H₆O",  smiles:"CC(C)=O" },
  butanone_2:    { id:"butanone_2",    nameJa:"メチルエチルケトン（2-ブタノン）", formula:"C₄H₈O", smiles:"CCC(C)=O" },
  cyclohexanone: { id:"cyclohexanone", nameJa:"シクロヘキサノン", formula:"C₆H₁₀O", smiles:"O=C1CCCCC1" },

  // ── カルボン酸 ──────────────────────────────────────────────────────────
  formic_acid:    { id:"formic_acid",    nameJa:"ギ酸",         formula:"HCOOH",    smiles:"OC=O" },
  acetic_acid:    { id:"acetic_acid",    nameJa:"酢酸",         formula:"CH₃COOH",  smiles:"CC(O)=O" },
  propionic_acid: { id:"propionic_acid", nameJa:"プロピオン酸", formula:"C₃H₆O₂",  smiles:"CCC(O)=O" },
  butyric_acid:   { id:"butyric_acid",   nameJa:"酪酸",         formula:"C₄H₈O₂",  smiles:"CCCC(O)=O" },
  lactic_acid:    { id:"lactic_acid",    nameJa:"乳酸",         formula:"C₃H₆O₃",  smiles:"CC(O)C(O)=O" },
  oxalic_acid:    { id:"oxalic_acid",    nameJa:"シュウ酸",     formula:"C₂H₂O₄",  smiles:"OC(=O)C(O)=O" },
  malic_acid:     { id:"malic_acid",     nameJa:"リンゴ酸",     formula:"C₄H₆O₅",  smiles:"OC(CC(=O)O)C(=O)O" },
  tartaric_acid:  { id:"tartaric_acid",  nameJa:"酒石酸",       formula:"C₄H₆O₆",  smiles:"OC(C(O)C(=O)O)C(=O)O" },
  citric_acid:    { id:"citric_acid",    nameJa:"クエン酸",     formula:"C₆H₈O₇",  smiles:"OC(CC(=O)O)(CC(=O)O)C(=O)O" },

  // ── エステル ────────────────────────────────────────────────────────────
  methyl_acetate:    { id:"methyl_acetate",    nameJa:"酢酸メチル",       formula:"C₃H₆O₂",  smiles:"COC(C)=O" },
  ethyl_acetate:     { id:"ethyl_acetate",     nameJa:"酢酸エチル",       formula:"C₄H₈O₂",  smiles:"CCOC(C)=O" },
  methyl_propionate: { id:"methyl_propionate", nameJa:"プロピオン酸メチル", formula:"C₄H₈O₂", smiles:"COC(=O)CC" },
  ethyl_butyrate:    { id:"ethyl_butyrate",    nameJa:"酪酸エチル",       formula:"C₆H₁₂O₂", smiles:"CCOC(=O)CCC" },

  // ── カルボン酸誘導体 ─────────────────────────────────────────────────────
  acetyl_chloride:   { id:"acetyl_chloride",   nameJa:"塩化アセチル",     formula:"C₂H₃ClO",  smiles:"CC(=O)Cl" },
  acetic_anhydride:  { id:"acetic_anhydride",  nameJa:"無水酢酸",         formula:"C₄H₆O₃",   smiles:"CC(=O)OC(C)=O" },
  benzoyl_chloride:  { id:"benzoyl_chloride",  nameJa:"塩化ベンゾイル",   formula:"C₇H₅ClO",  smiles:"ClC(=O)c1ccccc1" },
  benzophenone:      { id:"benzophenone",      nameJa:"ベンゾフェノン",   formula:"C₁₃H₁₀O",  smiles:"O=C(c1ccccc1)c1ccccc1" },
  propiophenone:     { id:"propiophenone",     nameJa:"プロピオフェノン（フェニルエチルケトン）", formula:"C₉H₁₀O", smiles:"CCC(=O)c1ccccc1" },
  diphenylmethane:   { id:"diphenylmethane",   nameJa:"ジフェニルメタン",  formula:"C₁₃H₁₂",   smiles:"C(c1ccccc1)c1ccccc1" },
  triphenylmethane:  { id:"triphenylmethane",  nameJa:"トリフェニルメタン", formula:"C₁₉H₁₆",  smiles:"C(c1ccccc1)(c1ccccc1)c1ccccc1" },

  // ── カルボン酸塩 ─────────────────────────────────────────────────────────
  sodium_acetate:    { id:"sodium_acetate",    nameJa:"酢酸ナトリウム",     formula:"CH₃COONa",  smiles:"CC([O-])=O.[Na+]" },
  sodium_formate:    { id:"sodium_formate",    nameJa:"ギ酸ナトリウム",     formula:"HCOONa",    smiles:"[Na+].[O-]C=O" },
  sodium_benzoate:   { id:"sodium_benzoate",   nameJa:"安息香酸ナトリウム", formula:"C₇H₅O₂Na",  smiles:"[Na+].[O-]C(=O)c1ccccc1" },

  // ── ジカルボン酸 ─────────────────────────────────────────────────────────
  maleic_acid:        { id:"maleic_acid",        nameJa:"マレイン酸（シス型）", formula:"C₄H₄O₄",  smiles:"OC(=O)/C=C\\C(=O)O" },
  fumaric_acid:       { id:"fumaric_acid",        nameJa:"フマル酸（トランス型）", formula:"C₄H₄O₄",  smiles:"OC(=O)/C=C/C(=O)O" },
  maleic_anhydride:   { id:"maleic_anhydride",    nameJa:"無水マレイン酸",     formula:"C₄H₂O₃",  smiles:"O=C1OC(=O)C=C1" },
  succinic_acid:      { id:"succinic_acid",       nameJa:"コハク酸",           formula:"C₄H₆O₄",  smiles:"OC(=O)CCC(O)=O" },
  succinic_anhydride: { id:"succinic_anhydride",  nameJa:"無水コハク酸",       formula:"C₄H₄O₃",  smiles:"O=C1CCC(=O)O1" },
  carbon_monoxide:    { id:"carbon_monoxide",     nameJa:"一酸化炭素",         formula:"CO",       smiles:"[C-]#[O+]" },
  carbon_dioxide:     { id:"carbon_dioxide",     nameJa:"二酸化炭素",         formula:"CO₂",      smiles:"O=C=O" },

  // ── グリニャール試薬 ─────────────────────────────────────────────────────
  methyl_mgbr:   { id:"methyl_mgbr",   nameJa:"メチルマグネシウムブロミド（MeMgBr）",   formula:"CH₃MgBr",  smiles:"C[Mg]Br" },
  ethyl_mgbr:    { id:"ethyl_mgbr",    nameJa:"エチルマグネシウムブロミド（EtMgBr）",   formula:"C₂H₅MgBr", smiles:"CC[Mg]Br" },
  propyl_mgbr:   { id:"propyl_mgbr",   nameJa:"プロピルマグネシウムブロミド（PrMgBr）",  formula:"C₃H₇MgBr", smiles:"CCC[Mg]Br" },
  phenyl_mgbr:   { id:"phenyl_mgbr",   nameJa:"フェニルマグネシウムブロミド（PhMgBr）",  formula:"C₆H₅MgBr", smiles:"Br[Mg]c1ccccc1" },
  benzyl_mgcl:   { id:"benzyl_mgcl",   nameJa:"ベンジルマグネシウムクロリド（BnMgCl）",  formula:"C₇H₇MgCl", smiles:"Cl[Mg]Cc1ccccc1" },

  // ── 脂肪酸・油脂 ─────────────────────────────────────────────────────────
  palmitic_acid: { id:"palmitic_acid", nameJa:"パルミチン酸（C16）",   formula:"C₁₆H₃₂O₂", smiles:"CCCCCCCCCCCCCCCC(O)=O" },
  stearic_acid:  { id:"stearic_acid",  nameJa:"ステアリン酸（C18）",   formula:"C₁₈H₃₆O₂", smiles:"CCCCCCCCCCCCCCCCCC(O)=O" },
  oleic_acid:    { id:"oleic_acid",    nameJa:"オレイン酸（C18:1）",   formula:"C₁₈H₃₄O₂", smiles:"CCCCCCCC/C=C\\CCCCCCCC(O)=O" },
  triacetin:     { id:"triacetin",     nameJa:"トリアセチン（油脂モデル）", formula:"C₉H₁₄O₆", smiles:"CC(=O)OCC(OC(C)=O)COC(C)=O" },

  // ── アミン ──────────────────────────────────────────────────────────────
  methylamine:   { id:"methylamine",   nameJa:"メチルアミン",   formula:"CH₅N",   smiles:"CN" },
  ethylamine:    { id:"ethylamine",    nameJa:"エチルアミン",   formula:"C₂H₇N",  smiles:"CCN" },
  dimethylamine: { id:"dimethylamine", nameJa:"ジメチルアミン", formula:"C₂H₇N",  smiles:"CNC" },

  // ── アミン誘導体 ─────────────────────────────────────────────────────────
  aniline_hcl:      { id:"aniline_hcl",      nameJa:"塩酸アニリン",              formula:"C₆H₈NCl",     smiles:"[NH3+]c1ccccc1" },
  benzenediazonium: { id:"benzenediazonium",  nameJa:"ベンゼンジアゾニウム塩",    formula:"C₆H₅N₂⁺Cl⁻", smiles:"N#[N+]c1ccccc1" },
  azo_compound:     { id:"azo_compound",      nameJa:"p-ヒドロキシアゾベンゼン（4-フェニルアゾフェノール）", formula:"C₁₂H₁₀N₂O", smiles:"Oc1ccc(/N=N/c2ccccc2)cc1" },

  // ── Sandmeyer / Schiemann / 脱アミノ反応用 無機試薬 ──────────────────────
  // 芳香族ジアゾニウム塩 ArN₂⁺ の置換反応に必要な共反応物
  copperI_chloride:        { id:"copperI_chloride",        nameJa:"塩化銅(I)（CuCl）",                formula:"CuCl",     smiles:"[Cu]Cl" },
  copperI_bromide:         { id:"copperI_bromide",         nameJa:"臭化銅(I)（CuBr）",                formula:"CuBr",     smiles:"[Cu]Br" },
  copperI_cyanide:         { id:"copperI_cyanide",         nameJa:"シアン化銅(I)（CuCN）",            formula:"CuCN",     smiles:"[Cu]C#N" },
  sodium_iodide:           { id:"sodium_iodide",           nameJa:"ヨウ化ナトリウム（NaI）",          formula:"NaI",      smiles:"[Na+].[I-]" },
  sodium_tetrafluoroborate:{ id:"sodium_tetrafluoroborate",nameJa:"ホウフッ化ナトリウム（NaBF₄）",   formula:"NaBF₄",    smiles:"[Na+].F[B-](F)(F)F" },
  // ArOH 生成用の混合試薬（Cu₂O + Cu(NO₃)₂ + H₂O は3成分まとめて1つの反応条件）
  // 個別の Cu₂O や Cu(NO₃)₂ は単独では Sandmeyer 加水分解を起こせない（活性化されない）
  sandmeyer_hydroxylation_mix: {
    id:      "sandmeyer_hydroxylation_mix",
    nameJa:  "Cu₂O + Cu(NO₃)₂ + H₂O（ヒドロキシ化用混合試薬）",
    formula: "Cu₂O · Cu(NO₃)₂ · H₂O",
    smiles:  "[Cu]O[Cu].[Cu+2].[O-][N+]([O-])=O.[O-][N+]([O-])=O.O",
  },
  hypophosphorous_acid:    { id:"hypophosphorous_acid",    nameJa:"次亜リン酸（H₃PO₂、ホスフィン酸）", formula:"H₃PO₂",    smiles:"O[PH2]=O" },

  // ── アミド ──────────────────────────────────────────────────────────────
  acetamide: { id:"acetamide", nameJa:"アセトアミド", formula:"C₂H₅NO", smiles:"CC(N)=O" },

  // ── アミノ酸 ────────────────────────────────────────────────────────────
  glycine: { id:"glycine", nameJa:"グリシン", formula:"C₂H₅NO₂", smiles:"NCC(O)=O" },
  alanine: { id:"alanine", nameJa:"アラニン", formula:"C₃H₇NO₂", smiles:"CC(N)C(O)=O" },

  // ── 糖類 ────────────────────────────────────────────────────────────────
  glucose:      { id:"glucose",      nameJa:"グルコース",   formula:"C₆H₁₂O₆",    smiles:"OC[C@H]1OC(O)[C@H](O)[C@@H](O)[C@@H]1O" },
  fructose:     { id:"fructose",     nameJa:"フルクトース", formula:"C₆H₁₂O₆",    smiles:"OC[C@@]1(O)OC[C@@H](O)[C@H]1O" },
  sucrose:      { id:"sucrose",      nameJa:"スクロース",   formula:"C₁₂H₂₂O₁₁",  smiles:"OC[C@H]1O[C@@](CO)(O[C@@H]2O[C@H](CO)[C@@H](O)[C@H](O)[C@H]2O)[C@@H](O)[C@H]1O" },
  maltose:      { id:"maltose",      nameJa:"マルトース",   formula:"C₁₂H₂₂O₁₁",  smiles:"OC[C@H]1O[C@@H](O[C@H]2[C@H](O)[C@@H](O)[C@H](O)O[C@@H]2CO)[C@H](O)[C@@H](O)[C@@H]1O" },
  starch_mol:   { id:"starch_mol",   nameJa:"デンプン",     formula:"(C₆H₁₀O₅)n", smiles:"OC[C@H]1O[C@@H](O[C@H]2[C@H](O)[C@@H](O)[C@H](O)O[C@@H]2CO)[C@H](O)[C@@H](O)[C@@H]1O" },
  cellulose_mol:{ id:"cellulose_mol",nameJa:"セルロース",   formula:"(C₆H₁₀O₅)n", smiles:"OC[C@H]1O[C@H](O[C@@H]2[C@@H](O)[C@H](O)[C@@H](O)O[C@H]2CO)[C@@H](O)[C@H](O)[C@@H]1O" },
  gluconic_acid:{ id:"gluconic_acid",nameJa:"グルコン酸",   formula:"C₆H₁₂O₇",    smiles:"OCC(O)C(O)C(O)C(O)C(O)=O" },

  // ── ジエン・特殊アルケン ─────────────────────────────────────────────────
  acrylonitrile: { id:"acrylonitrile", nameJa:"アクリロニトリル", formula:"C₃H₃N",  smiles:"C=CC#N" },
  vinyl_acetate: { id:"vinyl_acetate", nameJa:"酢酸ビニル",       formula:"C₄H₆O₂", smiles:"CC(=O)OC=C" },
  butadiene:     { id:"butadiene",     nameJa:"1,3-ブタジエン",   formula:"C₄H₆",   smiles:"C=CC=C" },
  isoprene:      { id:"isoprene",      nameJa:"イソプレン",        formula:"C₅H₈",   smiles:"C=C(C)C=C" },
  chloroprene:   { id:"chloroprene",   nameJa:"クロロプレン",      formula:"C₄H₅Cl", smiles:"ClC(=C)C=C" },

  // ── アミノ酸（追加）─────────────────────────────────────────────────────
  tyrosine:      { id:"tyrosine",      nameJa:"チロシン（Tyr）",         formula:"C₉H₁₁NO₃",   smiles:"NC(Cc1ccc(O)cc1)C(O)=O" },
  phenylalanine: { id:"phenylalanine", nameJa:"フェニルアラニン（Phe）",  formula:"C₉H₁₁NO₂",   smiles:"NC(Cc1ccccc1)C(O)=O" },
  cysteine:      { id:"cysteine",      nameJa:"システイン（Cys）",        formula:"C₃H₇NO₂S",   smiles:"NC(CS)C(O)=O" },
  glutamic_acid: { id:"glutamic_acid", nameJa:"グルタミン酸（Glu）",      formula:"C₅H₉NO₄",    smiles:"NC(CCC(O)=O)C(O)=O" },
  lysine_aa:     { id:"lysine_aa",     nameJa:"リシン（Lys）",            formula:"C₆H₁₄N₂O₂",  smiles:"NCCCCC(N)C(O)=O" },
  tryptophan:    { id:"tryptophan",    nameJa:"トリプトファン（Trp）",    formula:"C₁₁H₁₂N₂O₂", smiles:"NC(Cc1c[nH]c2ccccc12)C(O)=O" },

  // ── 高分子モノマー ───────────────────────────────────────────────────────
  caprolactam:           { id:"caprolactam",           nameJa:"ε-カプロラクタム",       formula:"C₆H₁₁NO",  smiles:"O=C1CCCCCN1" },
  hexamethylene_diamine: { id:"hexamethylene_diamine", nameJa:"ヘキサメチレンジアミン", formula:"C₆H₁₆N₂",  smiles:"NCCCCCCN" },
  adipic_acid:           { id:"adipic_acid",           nameJa:"アジピン酸",             formula:"C₆H₁₀O₄",  smiles:"OC(=O)CCCCC(O)=O" },
  urea:                  { id:"urea",                  nameJa:"尿素",                   formula:"CH₄N₂O",   smiles:"NC(N)=O" },
  melamine:              { id:"melamine",              nameJa:"メラミン",               formula:"C₃H₆N₆",   smiles:"Nc1nc(N)nc(N)n1" },

  // ── 合成高分子（繰り返し単位で代表表現）─────────────────────────────────
  polyethylene:      { id:"polyethylene",      nameJa:"ポリエチレン（PE）",                     formula:"(−CH₂CH₂−)n",               smiles:"CCCCCC" },
  polypropylene:     { id:"polypropylene",     nameJa:"ポリプロピレン（PP）",                   formula:"(−CH₂CH(CH₃)−)n",           smiles:"CCC(C)CCC(C)C" },
  polystyrene:       { id:"polystyrene",       nameJa:"ポリスチレン（PS）",                     formula:"(−CH₂CH(C₆H₅)−)n",          smiles:"CCc1ccccc1" },
  polyvinylchloride: { id:"polyvinylchloride", nameJa:"ポリ塩化ビニル（PVC）",                 formula:"(−CH₂CHCl−)n",              smiles:"CCC(Cl)CCCl" },
  polyacrylonitrile: { id:"polyacrylonitrile", nameJa:"ポリアクリロニトリル（アクリル繊維）",  formula:"(−CH₂CH(CN)−)n",            smiles:"CCC#N" },
  polyvinyl_acetate: { id:"polyvinyl_acetate", nameJa:"ポリ酢酸ビニル（PVAc）",                formula:"(−CH₂CH(OOCCH₃)−)n",       smiles:"CCOC(C)=O" },
  polyvinyl_alcohol: { id:"polyvinyl_alcohol", nameJa:"ポリビニルアルコール（PVA）",            formula:"(−CH₂CH(OH)−)n",            smiles:"CCCO" },
  vinylon:           { id:"vinylon",           nameJa:"ビニロン（合成繊維）",                  formula:"(−CH₂CH(OH)−)n（一部アセタール化）", smiles:"CCCO" },
  nylon66:           { id:"nylon66",           nameJa:"ナイロン6,6",                         formula:"[−NH(CH₂)₆NHCO(CH₂)₄CO−]n", smiles:"NCCCCCCNC(=O)CCCCC(=O)O" },
  nylon6:            { id:"nylon6",            nameJa:"ナイロン6",                           formula:"[−NH(CH₂)₅CO−]n",            smiles:"NCCCCCC(=O)O" },
  pet_polymer:       { id:"pet_polymer",       nameJa:"PET（ポリエチレンテレフタラート）",      formula:"[−OCH₂CH₂OOC−C₆H₄−CO−]n",  smiles:"OCCOC(=O)c1ccc(C(=O)O)cc1" },
  phenol_resin:      { id:"phenol_resin",      nameJa:"フェノール樹脂（ベークライト）",         formula:"(C₇H₆O)n",                  smiles:"Oc1ccccc1CO" },
  urea_resin:        { id:"urea_resin",        nameJa:"ユリア樹脂",                           formula:"(CH₄N₂O·CH₂O)n",            smiles:"NC(N)=O" },
  melamine_resin:    { id:"melamine_resin",    nameJa:"メラミン樹脂",                         formula:"(C₃H₆N₆·3CH₂O)n",           smiles:"Nc1nc(N)nc(N)n1" },
  polybutadiene:     { id:"polybutadiene",     nameJa:"ポリブタジエン（合成ゴム）",            formula:"(−CH₂CH=CHCH₂−)n",          smiles:"C=CCC=C" },
  sbr:               { id:"sbr",              nameJa:"SBR（スチレンブタジエンゴム）",         formula:"(C₄H₆·C₈H₈)n",             smiles:"C=CC=C" },
  neoprene:          { id:"neoprene",          nameJa:"ネオプレン（クロロプレンゴム）",         formula:"(C₄H₅Cl)n",                 smiles:"ClC(=C)C=C" },
  polyisoprene:      { id:"polyisoprene",      nameJa:"ポリイソプレン（合成天然ゴム）",        formula:"(C₅H₈)n",                   smiles:"C(/C=C\\CC)=C" },
  cellulose_acetate: { id:"cellulose_acetate", nameJa:"アセテート繊維（セルロースアセタート）",formula:"(C₆H₇O₂(OOCCH₃)₂₋₃)n",    smiles:"CC(=O)OC1OC(CO)C(OC(C)=O)C1OC(C)=O" },
  nitrocellulose:    { id:"nitrocellulose",    nameJa:"ニトロセルロース（硝化綿）",            formula:"(C₆H₇O₂(ONO₂)₃)n",         smiles:"O=[N+]([O-])OCC1OC(CO[N+](=O)[O-])C(O[N+](=O)[O-])C1O" },
};


// ─────────────────────────────────────────────────────────────────────────────
// 反応カテゴリ（2階層メニュー）
// ─────────────────────────────────────────────────────────────────────────────
const reactionCategories = [

  // ─── 芳香族 ───────────────────────────────────────────────────────────────
  {
    id: "aromatic",
    label: "芳香族",
    reactions: [
      {
        id: "ar_bromination",
        label: "臭素化",
        conditions: "Br₂ / FeBr₃",
        coReactantCategory: null,
        description: "ベンゼン環の水素がBrに置換される求電子置換反応。",
      },
      {
        id: "ar_chlorination",
        label: "塩素化（核置換）",
        conditions: "Cl₂ / FeCl₃（鉄粉または塩化鉄）",
        coReactantCategory: null,
        description: "ベンゼン環の水素がClに置換される求電子置換反応（核置換）。複数回適用すると置換基の配向性（o/p配向、m配向）と立体障害を考慮してClが導入される。",
      },
      {
        id: "ar_sidechain_cl",
        label: "塩素化（側鎖置換）",
        conditions: "Cl₂ / 光（UV）・加熱（ラジカル反応）",
        coReactantCategory: null,
        description: "ベンゼン環に直結したアルキル基の水素がClに置換される（側鎖置換、ラジカル反応）。ラジカル安定性は 3° > 2° > 1° なので、最も置換度の高い位置（特にベンジル位）に優先的にClが入る。多段階適用の場合、2回目以降はまだClが付いていない炭素が優先され、全炭素にClが付いた後は残りのHが次々とClに置換される。",
      },
      {
        id: "ar_nitration",
        label: "ニトロ化",
        conditions: "濃HNO₃ / 濃H₂SO₄",
        coReactantCategory: null,
        description: "ニトロ基（–NO₂）が導入される。混酸中でニトロニウムイオン（NO₂⁺）が生成。",
      },
      {
        id: "ar_sulfonation",
        label: "スルホン化",
        conditions: "濃H₂SO₄（加熱）または発煙H₂SO₄",
        coReactantCategory: null,
        description: "スルホン基（–SO₃H）が導入される可逆反応。",
      },
      {
        id: "ar_fc_alkyl",
        label: "フリーデル・クラフツ アルキル化",
        conditions: "RCl / AlCl₃（ルイス酸触媒）",
        coReactantCategory: null,
        description: "塩化アルキル（RCl）＋AlCl₃でカルボカチオンを生成してベンゼン環に導入。共反応物（塩化アルキル）を選択。",
      },
      {
        id: "ar_side_oxidize",
        label: "側鎖酸化",
        conditions: "KMnO₄ / 加熱",
        coReactantCategory: null,
        description: "ベンゼン環に直結した側鎖（アルキル基）が酸化されて安息香酸になる。",
      },
      {
        id: "ar_kmno4_oxidize",
        label: "KMnO₄による酸化",
        conditions: "KMnO₄ / H₂SO₄（硫酸酸性）/ 加熱",
        coReactantCategory: null,
        description: "ベンゼン環に直結したアルキル側鎖がKMnO₄/硫酸酸性下で酸化され安息香酸（Ar−COOH）を生成する。側鎖が−CH₃または−CH₂CH₃の場合はCO₂が副生成物、−CH₂−R（3C以上）の場合はR−CHO（アルデヒド）が副生成物として生成する。",
      },
      {
        id: "ar_h2_add",
        label: "水素付加（還元）",
        conditions: "H₂ / Ni, 高温高圧",
        coReactantCategory: null,
        description: "ベンゼン環に3モルのH₂が付加してシクロヘキサンになる。",
      },
      {
        id: "ar_nitro_reduce",
        label: "ニトロ基還元（→アミノ基）",
        conditions: "Fe + 塩酸（またはSn + HCl）",
        coReactantCategory: null,
        description: "–NO₂ が –NH₂ に還元される。ニトロベンゼン→アニリン。酸性条件下で還元剤（Fe等）が電子を供与。",
      },
      {
        id: "ar_fc_acyl",
        label: "フリーデル・クラフツ アシル化",
        conditions: "塩化アシル（RCOCl）/ AlCl₃",
        coReactantCategory: null,
        description: "塩化アシル（RCOCl）＋AlCl₃でアシル基（–COR）をベンゼン環に導入。アルキル化と異なり転位なし。共反応物（塩化アシル）を選択。",
      },
      {
        id: "ar_benzyl_chloride",
        label: "側鎖塩素化（光照射）",
        conditions: "Cl₂ / 光（UV）",
        coReactantCategory: null,
        description: "トルエンの側鎖（–CH₃）がラジカル反応でClに置換されて塩化ベンジル（C₆H₅CH₂Cl）が生成する。",
      },
      {
        id: "phe_naoh",
        label: "NaOHとの反応（フェノールの酸性）",
        conditions: "NaOH水溶液",
        coReactantCategory: null,
        description: "フェノールは弱酸性（pKa≈10）でNaOHと中和してナトリウムフェノキシドと水が生成する。",
      },
      {
        id: "ar_sulfo_na",
        label: "スルホン基の中和",
        conditions: "NaOH水溶液",
        coReactantCategory: null,
        description: "Ar−SO₃H + NaOH → Ar−SO₃⁻Na⁺ + H₂O。芳香族スルホン酸のスルホ基（−SO₃H）が中和されてスルホン酸ナトリウム塩が生成する。",
      },
      {
        id: "ar_alkali_fusion",
        label: "アルカリ融解",
        conditions: "固体NaOH / 290〜350°C",
        coReactantCategory: null,
        description: "Ar−SO₃⁻Na⁺ + NaOH → Ar−O⁻Na⁺ + Na₂SO₃。芳香族スルホン酸ナトリウム塩を固体NaOHと加熱融解するとスルホン酸基の位置がヒドロキシ基のナトリウム塩（ナトリウムフェノキシド）に置き換わる。フェノールの工業的製法の一段階。",
      },
      {
        id: "ar_cl_hydrolysis",
        label: "クロロベンゼンの加水分解",
        conditions: "NaOH水溶液 / 高温高圧",
        coReactantCategory: null,
        description: "Ar−Cl + 2 NaOH → Ar−O⁻Na⁺ + NaCl + H₂O。芳香族ハロゲン化物（クロロベンゼン等）を高温高圧下で NaOH 水溶液と反応させるとナトリウムフェノキシドが生成する。フェノールの工業的製法（ダウ法）の中間段階。",
      },
      {
        id: "phe_kolbe",
        label: "コルベ・シュミット反応",
        conditions: "CO₂ / 加圧（5気圧程度）, 加熱",
        coReactantCategory: null,
        description: "ナトリウムフェノキシドにCO₂を加圧下で作用させてサリチル酸ナトリウムが生成→酸性化でサリチル酸が得られる。",
      },
      {
        id: "ar_desulfonation",
        label: "脱スルホン化（スルホン化の逆反応）",
        conditions: "熱水（100°C以上）/ 蒸気蒸留",
        coReactantCategory: null,
        description: "ベンゼンスルホン酸 + H₂O → ベンゼン + H₂SO₄。スルホン化が可逆反応であることを示す重要反応。",
      },
      {
        id: "diazo_water",
        label: "ジアゾニウム塩の加水分解（→フェノール）",
        conditions: "H₂O / 加熱（5°C以上）",
        coReactantCategory: null,
        description: "ジアゾニウム塩を温水で加水分解するとフェノールとN₂が生成する。アニリン→フェノールの重要ルート。",
      },
      {
        id: "phe_ether_form",
        label: "ナトリウムフェノキシド＋ハロゲン化アルキル",
        conditions: "CH₃Br（またはCH₃I）/ なし",
        coReactantCategory: null,
        description: "C₆H₅ONa + CH₃Br → C₆H₅OCH₃（アニソール）+ NaBr。ウィリアムソンエーテル合成によるアリールエーテル生成。",
      },
      {
        id: "cumene_oxidize",
        label: "クメン法①：クメンの酸化",
        conditions: "O₂（空気酸化）/ 触媒",
        coReactantCategory: null,
        description: "クメン（イソプロピルベンゼン）+ O₂ → クメンヒドロペルオキシド（CHP）。工業的フェノール製造の第1段。",
      },
      {
        id: "cumene_cleave",
        label: "クメン法②：クメンヒドロペルオキシドの分解",
        conditions: "希H₂SO₄",
        coReactantCategory: null,
        description: "CHP + H₂SO₄ → フェノール + アセトン。フェノールとアセトンが等モルで生成する工業反応（クメン法）。",
      },
      {
        id: "cyclo_dehydro",
        label: "脱水素（→ベンゼン）",
        conditions: "Pt（またはCr₂O₃）/ 300°C",
        coReactantCategory: null,
        description: "シクロヘキサン → ベンゼン + 3H₂↑。脱水素反応。ar_h2_add（ベンゼン→シクロヘキサン）の逆反応。",
      },
      {
        id: "ar_v2o5_anhydride",
        label: "V₂O₅の酸無水物生成",
        conditions: "O₂ / V₂O₅（酸化バナジウム触媒）/ 450〜500°C",
        coReactantCategory: null,
        description: "ベンゼン環に置換基が付いていない芳香族（ベンゼン、ナフタレン、アントラセン等）を V₂O₅ 触媒下で O₂ と反応させて端のベンゼン環を酸無水物に変換する。例: ベンゼン→無水マレイン酸、ナフタレン→無水フタル酸、アントラセン→2,3-ナフタレンジカルボン酸無水物。",
      },
      {
        id: "lactone_form",
        label: "ラクトンの生成（分子内脱水エステル化）",
        conditions: "酸性条件 / 加熱",
        coReactantCategory: null,
        description: "ベンゼン環のオルト位に−OHと−COOH含有置換基がある芳香族で、分子内脱水により5員環または6員環の環状エステル（ラクトン）が生成する。例: シス-クマリン酸→クマリン。トランス体は反応しない。",
      },
    ],
  },

  // ─── 二重結合（アルケン・アルキン） ────────────────────────────────────
  {
    id: "alkene",
    label: "二重結合",
    reactions: [
      {
        id: "alk_h2_add",
        label: "水素付加",
        conditions: "H₂ / Pt（またはNi）",
        coReactantCategory: null,
        description: "C=CまたはC≡Cに水素が付加してアルカン（またはアルケン）になる。",
      },
      {
        id: "alk_hbr_add",
        label: "HBr付加",
        conditions: "HBr",
        coReactantCategory: null,
        description: "C=CにHBrが付加。不斉アルケンではマルコフニコフ則に従う。",
      },
      {
        id: "alk_hcl_add",
        label: "HCl付加",
        conditions: "HCl",
        coReactantCategory: null,
        description: "C=CにHClが付加。アセチレン＋HClで塩化ビニルが生成（重要）。",
      },
      {
        id: "alk_br2_add",
        label: "臭素付加",
        conditions: "Br₂（四塩化炭素中）",
        coReactantCategory: null,
        description: "C=Cに臭素が付加。ジブロミドが生成。臭素の脱色が目印。",
      },
      {
        id: "alk_h2o_add",
        label: "水付加（水和）",
        conditions: "H₂O / H₂SO₄（触媒）",
        coReactantCategory: null,
        description: "C=CにH₂Oが付加してアルコールになる。不斉では主にマルコフニコフ側に付加。",
      },
      {
        id: "alk_ozonolysis_red",
        label: "オゾン分解①（還元的後処理）",
        conditions: "① O₃ / 低温 → ② Zn / H₂O",
        coReactantCategory: null,
        description: "C=Cをオゾン(O₃)で開裂後、Zn/H₂Oで還元的に後処理。二重結合のC上にHがあればアルデヒド、なければケトンが生成する。",
      },
      {
        id: "alk_ozonolysis_ox",
        label: "オゾン分解②（酸化的後処理）",
        conditions: "① O₃ / 低温 → ② H₂O₂",
        coReactantCategory: null,
        description: "C=Cをオゾン(O₃)で開裂後、H₂O₂で酸化的に後処理。ケトンはそのまま、アルデヒドはさらに酸化されてカルボン酸になる（ホルムアルデヒド→ギ酸）。",
      },
      {
        id: "alk_kmno4_acid",
        label: "KMnO₄の酸化①（酸化開裂）",
        conditions: "KMnO₄ / H₂SO₄ 酸性・加熱",
        coReactantCategory: null,
        description: "C=Cが酸化開裂される。各炭素は酸化されてケトン・カルボン酸・CO₂になる。" +
          "R₂C=（H無し）→ ケトン、RHC=（H1個）→ カルボン酸、H₂C=（H2個）→ CO₂（ギ酸はさらに酸化）。",
      },
      {
        id: "alk_kmno4",
        label: "KMnO₄の酸化②（ジオール）",
        conditions: "冷希KMnO₄ / 中性または塩基性・低温",
        coReactantCategory: null,
        description: "C=Cが酸化されてジオール（グリコール）が生成。二重結合は切れず両炭素にOH付加。KMnO₄が脱色。",
      },
      {
        id: "alk_acid_add",
        label: "カルボン酸の付加（エステル合成）",
        conditions: "H⁺（BF₃等ルイス酸）触媒",
        coReactantCategory: "carboxylic_acid",
        description: "アルケンにカルボン酸が付加してエステルが生成する。立体障害の大きい炭素（置換度が高い方）にHが、立体障害の小さい炭素（末端CH₂側）にエステル基（–OCOR）が付く。共反応物（カルボン酸）を選択。",
      },
      {
        id: "alk_wacker",
        label: "ヘキスト・ワッカー法（アセトアルデヒドの工業的製法）",
        conditions: "PdCl₂ / CuCl₂（触媒）/ O₂",
        coReactantCategory: null,
        description: "エチレン（CH₂=CH₂）+ H₂O → アセトアルデヒド（CH₃CHO）。PdCl₂が酸化剤、CuCl₂がPd⁰を再酸化してPd²⁺に戻し、O₂がCuClを再酸化する触媒サイクル。エチレン専用の工業反応。",
      },
    ],
  },

  // ─── アルコール ───────────────────────────────────────────────────────────
  {
    id: "alcohol",
    label: "アルコール",
    reactions: [
      {
        id: "alc_oxidize",
        label: "酸化",
        conditions: "K₂Cr₂O₇ / H₂SO₄（またはKMnO₄）",
        coReactantCategory: null,
        description: "第1級アルコール（R−CH₂OH）→ カルボン酸（R−COOH）。第2級アルコール（R₂CHOH）→ ケトン（R₂C=O）。第3級アルコール（R₃COH）は酸化されにくい。",
      },
      {
        id: "alc_esterify",
        label: "フィッシャーエステル合成",
        conditions: "カルボン酸 / 濃H₂SO₄（触媒）/ 加熱",
        coReactantCategory: "carboxylic_acid",
        description: "アルコール＋カルボン酸→エステル＋水。共反応物（カルボン酸）を選択。",
      },
      {
        id: "alc_dehydrate",
        label: "分子内脱水（アルケン生成）",
        conditions: "濃H₂SO₄ / 170°C",
        coReactantCategory: null,
        description: "アルコール1分子内で隣接するCからH、OHからOHが脱離してC=C二重結合が形成される（分子内脱水）。",
      },
      {
        id: "alc_ether",
        label: "分子間脱水（エーテル生成）",
        conditions: "濃H₂SO₄ / 130°C",
        coReactantCategory: null,
        description: "アルコール2分子のOH基同士が脱水縮合してエーテル（R−O−R）が生成する（分子間脱水）。170°C（分子内脱水）との温度条件の違いが重要。",
      },
      {
        id: "alc_na",
        label: "ナトリウムとの反応（検出・合成）",
        conditions: "Na（金属）",
        coReactantCategory: null,
        description: "2R−OH + 2Na → 2R−ONa + H₂↑。アルコールのOH基がNaと反応してナトリウムアルコキシド（R−O⁻Na⁺）が生成し、水素ガス（H₂）が発生する。H₂の気泡発生はアルコールの検出法としても利用される。",
      },
      {
        id: "alc_hbr",
        label: "HBrによるハロゲン化",
        conditions: "HBr（またはNaBr + H₂SO₄）",
        coReactantCategory: null,
        description: "アルコールのOHがBrに置換されてブロモアルカンが生成する。ROH + HBr → RBr + H₂O。",
      },
      {
        id: "alc_hcl",
        label: "HClによるハロゲン化",
        conditions: "濃塩酸（またはZnCl₂触媒）",
        coReactantCategory: null,
        description: "アルコールのOHがClに置換されてクロロアルカンが生成する。ROH + HCl → RCl + H₂O。",
      },
      {
        id: "alc_williamson",
        label: "ウィリアムソンエーテル合成",
        conditions: "ヨウ化アルキル（R'I）",
        coReactantCategory: null,
        description: "R−O⁻Na⁺ + R'−I → R−O−R'（エーテル）+ NaI。ナトリウムアルコキシドにヨウ化アルキルを作用させて対称・非対称エーテルを合成する。共反応物（ヨウ化アルキル）を選択。",
      },
      {
        id: "alc_k2cr2o7_ald",
        label: "K₂Cr₂O₇の酸化によるアルデヒド（検出）",
        conditions: "K₂Cr₂O₇ / H₂SO₄ / AgNO₃（触媒）",
        coReactantCategory: null,
        description: "1級アルコールのみに適用。R−CH₂OH → R−CHO（アルデヒド）。K₂Cr₂O₇がCr₂(SO₄)₃に還元され、溶液がオレンジ色から緑色に変化する。アルデヒドの生成と色変化が1級アルコールの検出に利用される。",
      },
      {
        id: "est_nitro",
        label: "混酸のニトロ化（硝酸エステル生成）",
        conditions: "濃HNO₃ + 濃H₂SO₄（混酸）/ 低温",
        coReactantCategory: null,
        description: "グリセリン骨格（連続3炭素上に各−OH）を持つ分子の全−OH基が−O−NO₂に変換される。例: グリセリン → ニトログリセリン。爆薬・ダイナマイトの原料。",
      },
      {
        id: "alc_free_from_na",
        label: "ナトリウム塩の弱酸遊離反応",
        conditions: "HCl（希塩酸）",
        coReactantCategory: null,
        description: "R−O⁻Na⁺ + HCl → R−OH + NaCl。アルコキシドやフェノキシドなどのヒドロキシ基のナトリウム塩に強酸（塩酸）を加えると、弱酸であるアルコールまたはフェノールが遊離する。",
      },
    ],
  },

  // ─── カルボン酸 ───────────────────────────────────────────────────────────
  {
    id: "carboxylic_acid",
    label: "カルボン酸",
    reactions: [
      {
        id: "aca_esterify",
        label: "フィッシャーエステル合成",
        conditions: "アルコール / 濃H₂SO₄（触媒）/ 加熱",
        coReactantCategory: "alcohol",
        description: "カルボン酸＋アルコール→エステル＋水。共反応物（アルコール）を選択。",
      },
      {
        id: "aca_amide",
        label: "アミド化（アミンとの反応）",
        conditions: "アミン / 加熱（または塩化アシル経由）",
        coReactantCategory: "amine",
        description: "カルボン酸＋アミン→アミド＋水。共反応物（アミン）を選択。",
      },
      {
        id: "aca_acyl_chloride",
        label: "塩化アシル生成",
        conditions: "SOCl₂（または PCl₅）",
        coReactantCategory: null,
        description: "カルボン酸にSOCl₂等を作用させると塩化アシル（アシルクロリド）が生成する。アシル化反応の重要中間体。",
      },
      {
        id: "aca_anhydride_inter",
        label: "分子間の酸無水物生成",
        conditions: "P₂O₅ / 加熱",
        coReactantCategory: null,
        description: "カルボン酸2分子が脱水縮合して分子間の酸無水物（R−CO−O−CO−R）が生成する。分子内脱水も可能な分子では分子内酸無水物が主生成物となる。",
      },
      {
        id: "aca_decarboxylate",
        label: "脱炭酸（ソーダ石灰）",
        conditions: "NaOH + CaO（ソーダ石灰）/ 加熱",
        coReactantCategory: null,
        description: "カルボン酸（ナトリウム塩）をソーダ石灰で加熱するとCO₂が脱離してアルカンが生成する。",
      },
      {
        id: "aca_naoh",
        label: "NaOHによる中和",
        conditions: "NaOH水溶液",
        coReactantCategory: null,
        description: "カルボン酸 + NaOH → カルボン酸ナトリウム + H₂O。酸塩基中和反応。",
      },
      {
        id: "aca_na",
        label: "金属Naとの反応（検出法）",
        conditions: "Na（金属）",
        coReactantCategory: null,
        description: "2R−COOH + 2Na → 2R−COONa + H₂↑。カルボン酸のナトリウム塩が生成し、水素ガスが発生する。アルコールより激しく反応（pKaが小さいため）。H₂発生はカルボン酸の検出にも利用される。",
      },
      {
        id: "aca_nahco3",
        label: "NaHCO₃との反応（検出法）",
        conditions: "NaHCO₃水溶液",
        coReactantCategory: null,
        description: "R−COOH + NaHCO₃ → R−COONa + H₂O + CO₂↑。カルボン酸のナトリウム塩が生成し、CO₂の気泡が発生する。フェノール（pKa≈10）はNaHCO₃と反応しないため、カルボン酸との識別に利用される。",
      },
      {
        id: "acyl_cl_alc",
        label: "塩化アシル＋アルコール（エステル生成）",
        conditions: "なし（または室温）",
        coReactantCategory: "alcohol",
        description: "塩化アシル＋アルコール → エステル＋HCl。エステル化反応より速く進む。共反応物（アルコール）を選択。",
      },
      {
        id: "acyl_cl_amine",
        label: "塩化アシル＋アミン（アミド生成）",
        conditions: "なし（または冷却）",
        coReactantCategory: "amine",
        description: "塩化アシル＋アミン → アミド＋HCl。アセトアニリド等の合成に利用。共反応物（アミン）を選択。",
      },
      {
        id: "anhydride_alc",
        label: "酸無水物＋アルコール（エステル生成）",
        conditions: "なし（または弱加熱）",
        coReactantCategory: "alcohol",
        description: "酸無水物＋アルコール → エステル＋カルボン酸。アスピリン合成で重要。共反応物（アルコール）を選択。",
      },
      {
        id: "anhydride_amine",
        label: "酸無水物＋アミン（アミド生成）",
        conditions: "なし（または弱加熱）",
        coReactantCategory: "amine",
        description: "酸無水物＋アミン → アミド＋カルボン酸。アセトアニリド合成の工業的手法。共反応物（アミン）を選択。",
      },
      {
        id: "anh_monoester",
        label: "酸無水物のモノエステル化",
        conditions: "アルコール / 穏やかな加熱",
        coReactantCategory: "alcohol",
        description: "環状酸無水物にアルコールを穏やかに加熱して反応させると環状構造が開環してモノエステル（−COOR と −COOH を持つ単一分子）が生成する。例: 無水フタル酸＋メタノール → フタル酸モノメチル。共反応物（アルコール）を選択。",
      },
      {
        id: "anh_diester",
        label: "酸無水物のジエステル化",
        conditions: "アルコール / 濃H₂SO₄（触媒）/ 加熱",
        coReactantCategory: "alcohol",
        description: "環状酸無水物または「酸無水物のモノエステル化」で得られた中間体にアルコールを硫酸触媒下で加熱すると、両方のカルボキシ基がエステル化されてジエステルが生成する。例: 無水フタル酸＋メタノール → フタル酸ジメチル。共反応物（アルコール）を選択。",
      },
      {
        id: "aca_anhydride_intra",
        label: "分子内の酸無水物生成（環状）",
        conditions: "加熱",
        coReactantCategory: null,
        description: "ジカルボン酸の隣接する2つの−COOH基が分子内脱水して環状酸無水物（五員環または六員環）が生成する。シス体（マレイン酸→無水マレイン酸）やオルト体（フタル酸→無水フタル酸）で反応する。トランス体やメタ・パラ体は反応しない。",
      },
      {
        id: "formic_dehydrate",
        label: "ギ酸の脱水（CO発生）",
        conditions: "濃H₂SO₄（脱水）/ 加熱",
        coReactantCategory: null,
        description: "ギ酸（HCOOH）を濃硫酸で脱水するとCO（一酸化炭素）と水が生成する。COの発生源として重要。",
      },
      {
        id: "salt_free",
        label: "カルボン酸塩＋強酸 → カルボン酸遊離",
        conditions: "HCl（希塩酸）",
        coReactantCategory: null,
        description: "RCOONa + HCl → RCOOH + NaCl。強酸を加えると弱酸（カルボン酸）が遊離する。酸塩基平衡の基本原理。",
      },
      {
        id: "aca_calcium_salt",
        label: "カルシウム塩生成",
        conditions: "Ca(OH)₂",
        coReactantCategory: null,
        description: "2R−COOH + Ca(OH)₂ → (RCOO)₂Ca + 2H₂O。カルボン酸がCa(OH)₂と中和してカルシウム塩が生成する。隣接するCOOH基を持つジカルボン酸ではCa²⁺がキレート配位した環状塩が生成する。",
      },
      {
        id: "aca_ca_ketonize",
        label: "ケトン生成（カルシウム塩の乾留）",
        conditions: "加熱（乾留）",
        coReactantCategory: null,
        description: "(RCOO)₂Ca → R−CO−R（ケトン）+ CaCO₃。カルボン酸のカルシウム塩を加熱するとケトンと炭酸カルシウムが生成する。ただし分子内キレート型のカルシウム塩（ジカルボン酸由来）は反応しない。",
      },
      {
        id: "aca_triglyceride",
        label: "トリグリセリド合成（グリセリンとの反応）",
        conditions: "グリセリン / 濃H₂SO₄（触媒）/ 加熱",
        coReactantCategory: null,
        description: "3 R−COOH + グリセリン → トリグリセリド（油脂の主成分）+ 3 H₂O。グリセリンの3つの−OHがすべてカルボン酸とエステル化する。グリセリンが共反応物として固定される。",
      },
      {
        id: "aca_decarb_naoh",
        label: "アルカンの生成（脱炭酸）",
        conditions: "NaOH（固体）/ 加熱",
        coReactantCategory: null,
        description: "R−COONa + NaOH → R−H + Na₂CO₃。カルボン酸のナトリウム塩をNaOH（固）と加熱すると、COONa基がHに置き換わりアルカンが生成する。炭素数が1つ減る反応。",
      },
      {
        id: "phe_free",
        label: "ナトリウムフェノキシド＋CO₂水溶液 → フェノール遊離",
        conditions: "CO₂ / 水",
        coReactantCategory: null,
        description: "C₆H₅ONa + CO₂ + H₂O → C₆H₅OH + NaHCO₃。フェノール（pKa≈10）はH₂CO₃（pKa₁≈6.4）より弱酸のため遊離する。酸の強さの序列の学習に重要。",
      },
    ],
  },

  // ─── アミド ───────────────────────────────────────────────────────────────
  {
    id: "amide",
    label: "アミド",
    reactions: [
      {
        id: "ami2_hydrolysis_acid",
        label: "酸性加水分解",
        conditions: "希H₂SO₄（またはHCl）/ 加熱",
        coReactantCategory: null,
        description: "R₁−CO−NHR₂ + H₂O → R₁−COOH + R₂−NH₃⁺。アミド結合が酸触媒下で加水分解されてカルボン酸（主生成物）とアミン塩（副生成物）が生成する。",
      },
      {
        id: "ami2_hydrolysis_base",
        label: "塩基性加水分解",
        conditions: "NaOH水溶液 / 加熱",
        coReactantCategory: null,
        description: "R₁−CO−NHR₂ + NaOH → R₁−COONa + R₂−NH₂。アミド結合が塩基下で加水分解されてカルボン酸ナトリウム塩（主生成物）と遊離アミン（副生成物）が生成する。",
      },
      {
        id: "ami_from_anhydride",
        label: "酸無水物からのアミド合成",
        conditions: "なし（または弱加熱）",
        coReactantCategory: "amine",
        description: "R₁−CO−O−CO−R₂ + R₃−NH₂ → R₁−CO−NHR₃（アミド）+ R₂−COOH（カルボン酸）。酸無水物にアミンを作用させてアミドを合成する。非対称酸無水物では2種のアミドが生成しうる。共反応物（アミン）を選択。",
      },
    ],
  },

  // ─── グリセリン ───────────────────────────────────────────────────────────
  {
    id: "glycerol",
    label: "グリセリン",
    reactions: [
      {
        id: "est_nitro",
        label: "混酸のニトロ化（硝酸エステル生成）",
        conditions: "濃HNO₃ + 濃H₂SO₄（混酸）/ 低温",
        coReactantCategory: null,
        description: "グリセリン骨格（連続3炭素上に各−OH）を持つ分子の全−OH基が−O−NO₂に変換される。例: グリセリン → ニトログリセリン。爆薬・ダイナマイトの原料。",
      },
      {
        id: "gly_triglyceride",
        label: "トリグリセリド合成",
        conditions: "カルボン酸 / 濃H₂SO₄（触媒）/ 加熱",
        coReactantCategory: "carboxylic_acid",
        description: "グリセリン + 3 R−COOH → トリグリセリド（油脂の主成分）+ 3 H₂O。グリセリンの3つの−OHがすべてカルボン酸とエステル化し、(H₂C−OCO−R)(HC−OCO−R)(H₂C−OCO−R)の構造が生成する。共反応物（カルボン酸）を選択。",
      },
      {
        id: "gly_saponify",
        label: "けん化（トリグリセリドの加水分解）",
        conditions: "KOH水溶液 / 加熱",
        coReactantCategory: null,
        description: "トリグリセリド + 3 KOH → グリセリン + 3 R−COOK（カルボン酸カリウム塩）。油脂（トリグリセリド）を水酸化カリウムでけん化してグリセリンと脂肪酸カリウム塩（石けん）を生成する。主生成物はカルボン酸K塩、副生成物はグリセリン。",
      },
    ],
  },

  // ─── 油脂 ─────────────────────────────────────────────────────────────────
  {
    id: "fat_oil",
    label: "油脂",
    reactions: [
      {
        id: "fat_saponify",
        label: "けん化（NaOH）",
        conditions: "NaOH水溶液 / 加熱",
        coReactantCategory: null,
        description: "油脂（グリセリンのトリエステル）＋ 3NaOH → グリセリン＋脂肪酸ナトリウム（石鹸）。不可逆反応。",
      },
      {
        id: "fat_hydrolysis",
        label: "加水分解（酸性）",
        conditions: "H₂O / 希H₂SO₄ / 加熱",
        coReactantCategory: null,
        description: "油脂 + 3H₂O → グリセリン＋脂肪酸。可逆反応。消化の基本原理。",
      },
      {
        id: "fat_hardening",
        label: "水素付加（硬化）",
        conditions: "H₂ / Ni触媒 / 加熱",
        coReactantCategory: null,
        description: "不飽和脂肪酸（C=C）に水素付加して飽和脂肪酸になる。液体油→固体脂（マーガリン）。",
      },
    ],
  },

  // ─── エステル ─────────────────────────────────────────────────────────────
  {
    id: "ester",
    label: "エステル",
    reactions: [
      {
        id: "est_hydrolysis",
        label: "加水分解（酸性）",
        conditions: "H₂O / 希H₂SO₄（またはHCl）/ 加熱",
        coReactantCategory: null,
        description: "エステル + H₂O ⇌ カルボン酸 + アルコール。酸触媒下で可逆的に進む。",
      },
      {
        id: "est_saponify",
        label: "けん化（アルカリ加水分解）",
        conditions: "NaOH水溶液 / 加熱",
        coReactantCategory: null,
        description: "エステル + NaOH → カルボン酸塩 + アルコール。不可逆反応。油脂のけん化（石鹸製造）の基本原理。",
      },
      {
        id: "est_grignard",
        label: "グリニャール反応（→3級アルコール）",
        conditions: "RMgX / 乾燥エーテル → 希H₂SO₄ 加水分解",
        coReactantCategory: null,
        description: "R₁−COO−R₂ + 2RMgX → R₁−C(OH)(R)₂（3級アルコール）+ R₂−OH。エステルにグリニャール試薬が2当量付加し、3級アルコールとアルコールが生成する。共反応物（グリニャール試薬）を選択。",
      },
      {
        id: "est_from_anhydride",
        label: "酸無水物からのエステル合成",
        conditions: "なし（または弱加熱）",
        coReactantCategory: "alcohol",
        description: "R₁−CO−O−CO−R₂ + R₃−OH → R₁−COO−R₃（エステル）+ R₂−COOH（カルボン酸）。酸無水物にアルコールを作用させてエステルを合成する。非対称酸無水物では2種のエステルが生成しうる。共反応物（アルコール）を選択。",
      },
    ],
  },

  // ─── アルデヒド・ケトン ───────────────────────────────────────────────────
  {
    id: "aldehyde_ketone",
    label: "アルデヒド・ケトン",
    reactions: [
      {
        id: "ald_reduce",
        label: "還元",
        conditions: "H₂ / Ni（またはNaBH₄）",
        coReactantCategory: null,
        description: "アルデヒド→第1級アルコール、ケトン→第2級アルコール。",
      },
      {
        id: "ald_oxidize",
        label: "酸化（アルデヒドのみ）",
        conditions: "K₂Cr₂O₇ / H₂SO₄",
        coReactantCategory: null,
        description: "アルデヒド→カルボン酸。ケトンは酸化されない（強制条件を除く）。",
      },
      {
        id: "ald_cu_formaldehyde",
        label: "銅を用いたホルムアルデヒド生成（メタノールのみ）",
        conditions: "Cu（触媒）/ 加熱",
        coReactantCategory: null,
        description: "2CH₃OH + O₂ → 2HCHO + 2H₂O。メタノールを銅触媒下で酸素と反応させてホルムアルデヒドを生成する。メタノール専用の工業反応。",
      },
      {
        id: "ald_acetic_acid",
        label: "酢酸の工業的製法（アセトアルデヒドのみ）",
        conditions: "O₂ / 酢酸マンガン(II)（Mn(CH₃COO)₂、触媒）",
        coReactantCategory: null,
        description: "2CH₃CHO + O₂ → 2CH₃COOH。アセトアルデヒドを酢酸マンガン(II)触媒下で酸素と反応させて酢酸を生成する。アセトアルデヒド専用の工業反応。",
      },
      {
        id: "ald_aldol",
        label: "アルドール縮合",
        conditions: "NaOH（希・低温）",
        coReactantCategory: null,
        description: "アルデヒドが希塩基触媒下で縮合し、β-ヒドロキシアルデヒド（アルドール）が生成する。",
      },
      {
        id: "ald_cannizzaro",
        label: "カニッツァロ反応",
        conditions: "NaOH水溶液 / 加熱",
        coReactantCategory: null,
        description: "α水素を持たないアルデヒド2分子が塩基下で不均化し、1分子はカルボン酸ナトリウム塩（R−COONa、主生成物）に、1分子はアルコール（R−CH₂OH、副生成物）に変化する。例: ホルムアルデヒド、ベンズアルデヒド、ピバルアルデヒドなど。α水素を持つアルデヒド（アセトアルデヒド、プロパナール等）では進行しない。",
      },
      {
        id: "ald_grignard",
        label: "グリニャール反応（アルデヒド→2級アルコール）",
        conditions: "RMgX / 乾燥エーテル → 希H₂SO₄ 加水分解",
        coReactantCategory: null,
        description: "R₁−CHO + RMgX → R₁−CH(OH)−R（2級アルコール）。アルデヒドにグリニャール試薬が付加してC−C結合が形成され、加水分解後に2級アルコールが得られる。共反応物（グリニャール試薬）を選択。",
      },
      {
        id: "ket_grignard",
        label: "グリニャール反応（ケトン→3級アルコール）",
        conditions: "RMgX / 乾燥エーテル → 希H₂SO₄ 加水分解",
        coReactantCategory: null,
        description: "R₁−CO−R₂ + RMgX → R₁−C(OH)(R)−R₂（3級アルコール）。ケトンにグリニャール試薬が付加してC−C結合が形成される。共反応物（グリニャール試薬）を選択。",
      },
      {
        id: "form_grignard",
        label: "グリニャール反応（ホルムアルデヒド→1級アルコール）",
        conditions: "RMgX / 乾燥エーテル → 希H₂SO₄ 加水分解",
        coReactantCategory: null,
        description: "HCHO + RMgX → R−CH₂OH（1級アルコール）。ホルムアルデヒドにグリニャール試薬が付加して炭素数を1つ増やした1級アルコールが得られる。共反応物（グリニャール試薬）を選択。",
      },
      {
        id: "det_schiff",
        label: "シッフ試薬（検出法）",
        conditions: "シッフ試薬（フクシンの亜硫酸脱色液）",
        coReactantCategory: null,
        description: "アルデヒドでシッフ試薬が赤色（赤紫色）に呈色する（陽性）。ケトンでは呈色しない。アルデヒドとケトンの区別に利用される。",
      },
      {
        id: "det_fehling",
        label: "フェーリング反応（検出法）",
        conditions: "フェーリング液 / 加熱",
        coReactantCategory: null,
        description: "アルデヒド（還元性糖を含む）で赤色沈殿（Cu₂O）が生成する。ケトンは不可。",
      },
      {
        id: "det_silver",
        label: "銀鏡反応（検出法）",
        conditions: "アンモニア性AgNO₃水溶液 / 加熱",
        coReactantCategory: null,
        description: "アルデヒドが酸化されてカルボン酸になり、試験管内面に銀鏡が形成される。",
      },
      {
        id: "det_iodoform",
        label: "ヨードホルム反応（検出・合成）",
        conditions: "I₂ / NaOH水溶液 / 加熱",
        coReactantCategory: null,
        description: "CH₃CO–R または CH₃CH(OH)–R 構造（Rは H または C）にI₂/NaOH/加熱で反応。特異臭をもつ黄色沈殿のヨードホルム（CHI₃）が生成し、カルボン酸のナトリウム塩（R–COONa）が得られる。Rが O や N の場合は反応しない。",
      },
    ],
  },

  // ─── 三重結合（アルキン） ─────────────────────────────────────────────────
  {
    id: "alkyne",
    label: "三重結合",
    reactions: [
      {
        id: "aly_h2_partial",
        label: "部分水素付加（→アルケン）",
        conditions: "H₂ / Lindlar触媒（Pd-CaCO₃）",
        coReactantCategory: null,
        description: "C≡Cに1モルのH₂が付加してC=Cになる。Lindlar触媒でシス体が得られる。",
      },
      {
        id: "aly_h2_full",
        label: "完全水素付加（→アルカン）",
        conditions: "H₂（過剰）/ Ni（または Pt）, 加熱",
        coReactantCategory: null,
        description: "C≡Cに2モルのH₂が付加してアルカンになる。",
      },
      {
        id: "aly_h2o_add",
        label: "水付加（水和）",
        conditions: "H₂O / H₂SO₄ + HgSO₄（触媒）",
        coReactantCategory: null,
        description: "C≡CにH₂Oが付加。マルコフニコフ則に従いOHが置換度の高い炭素に付く。エノールを経て互変異性する。末端アルキンでは主生成物＝ケトン、副生成物＝アルデヒド。アセチレンではアセトアルデヒドのみ生成。",
      },
      {
        id: "aly_hbr_add",
        label: "HBr付加",
        conditions: "HBr / Zn²⁺ または Hg²⁺塩（触媒）",
        coReactantCategory: null,
        description: "C≡CにHBrが1モル付加。立体障害を考慮し、置換基の小さい方の炭素にBrが付く。末端アルキンでは末端炭素にBrが付く。",
      },
      {
        id: "aly_hcl_add",
        label: "HCl付加",
        conditions: "HCl / Zn²⁺ または Hg²⁺塩（触媒）",
        coReactantCategory: null,
        description: "C≡CにHClが1モル付加。立体障害を考慮し、置換基の小さい方の炭素にClが付く。末端アルキンでは末端炭素にClが付く。",
      },
      {
        id: "aly_acid_add",
        label: "カルボン酸付加（ビニルエステル合成）",
        conditions: "Zn²⁺ または Hg²⁺塩（触媒）",
        coReactantCategory: "carboxylic_acid",
        description: "C≡Cにカルボン酸が付加してビニルエステルが生成する。立体障害の大きい炭素にHが、立体障害の小さい（末端）炭素にエステル基（–OCOR）が付く。共反応物（カルボン酸）を選択。",
      },
      {
        id: "aly_hcn_add",
        label: "ニトリル基付加（HCN付加）",
        conditions: "HCN / Zn²⁺ または Hg²⁺塩（触媒）",
        coReactantCategory: null,
        description: "C≡CにHCNが付加。立体障害の大きい炭素にHが、立体障害の小さい（末端）炭素にニトリル基（–C≡N）のC側が付く。アクリロニトリル誘導体の合成に利用。",
      },
      {
        id: "aly_br2_add",
        label: "臭素付加（1段目）",
        conditions: "Br₂（四塩化炭素中）",
        coReactantCategory: null,
        description: "C≡CにBr₂が1モル付加して1,2-ジブロモアルケンが生成する。臭素水の脱色反応。",
      },
      {
        id: "aly_na_acetylide",
        label: "ナトリウムアセチリド生成",
        conditions: "Na（金属）",
        coReactantCategory: null,
        description: "末端アルキン（≡C–H）の酸性水素がNaと反応してアセチリドナトリウムと水素ガスが生成。アルキンの酸性（pKa≈25）を示す重要反応。",
      },
      {
        id: "aly_ag_acetylide",
        label: "アセチリド銀生成（検出）",
        conditions: "アンモニア性AgNO₃水溶液",
        coReactantCategory: null,
        description: "末端アルキン（≡C–H）がアンモニア性硝酸銀溶液と反応して白色沈殿（アセチリド銀）が生成する。末端三重結合の検出反応。",
      },
      {
        id: "aly_dimerize",
        label: "二分子重合（アセチレンのみ）",
        conditions: "CuCl₂（Cu²⁺触媒）/ NH₄Cl",
        coReactantCategory: null,
        description: "アセチレン2分子がCu²⁺触媒下で重合してビニルアセチレン（CH₂=CH−C≡CH）が生成する。クロロプレンゴムの原料合成に利用。アセチレン専用反応。",
      },
      {
        id: "aly_trimerize",
        label: "三分子重合反応（ベンゼン環生成）",
        conditions: "Fe（触媒）/ 加熱",
        coReactantCategory: null,
        description: "R−C≡CH が3分子環化三量化してベンゼン環が生成する。アセチレンではベンゼン、R−C≡CH では 1,3,5-R₃-ベンゼン（主生成物）と 1,2,4-R₃-ベンゼン（副生成物）が生成する。",
      },
    ],
  },

  // ─── 炭化カルシウム（カーバイド） ─────────────────────────────────────────
  {
    id: "carbide",
    label: "炭化カルシウム",
    reactions: [
      {
        id: "cac2_water",
        label: "炭化カルシウム＋水 → アセチレン",
        conditions: "H₂O（室温）",
        coReactantCategory: null,
        description: "CaC₂ + 2H₂O → HC≡CH↑ + Ca(OH)₂。アセチレンの工業的製造法。カーバイドランプにも利用された。",
      },
    ],
  },

  // ─── グリニャール試薬 ─────────────────────────────────────────────────────
  {
    id: "grignard",
    label: "グリニャール試薬",
    reactions: [
      {
        id: "grignard_add_ald",
        label: "アルデヒドへの付加（→第2級アルコール）",
        conditions: "RCHO / 乾燥エーテル → 次いで希H₂SO₄加水分解",
        coReactantCategory: null,
        description: "RMgX + R'CHO → R–CH(OH)–R'。C–C結合形成。共反応物（アルデヒド）を選択。",
      },
      {
        id: "grignard_add_form",
        label: "ホルムアルデヒドへの付加（→第1級アルコール）",
        conditions: "HCHO / 乾燥エーテル → 次いで希H₂SO₄加水分解",
        coReactantCategory: null,
        description: "RMgX + HCHO → R–CH₂OH。炭素数を1つ増やして第1級アルコールを合成。共反応物（ホルムアルデヒド）を選択。",
      },
      {
        id: "grignard_add_ket",
        label: "ケトンへの付加（→第3級アルコール）",
        conditions: "R'COR'' / 乾燥エーテル → 次いで希H₂SO₄加水分解",
        coReactantCategory: null,
        description: "RMgX + R'COR'' → R–C(OH)(R')(R'')。C–C結合形成。共反応物（ケトン）を選択。",
      },
      {
        id: "grignard_co2",
        label: "CO₂への付加（→カルボン酸）",
        conditions: "CO₂（ドライアイス）/ 乾燥エーテル → 希H₂SO₄加水分解",
        coReactantCategory: null,
        description: "RMgX + CO₂ → R–COOMgX → R–COOH（加水分解後）。炭素数を1つ増やしてカルボン酸を合成。共反応物（CO₂）を選択。",
      },
      {
        id: "grignard_h2o",
        label: "加水分解（プロトン分解）",
        conditions: "H₂O（または希酸）",
        coReactantCategory: null,
        description: "RMgX + H₂O → R–H + Mg(OH)X。グリニャール試薬はプロトン性溶媒で即座に分解し、元の炭化水素を生成。",
      },
    ],
  },

  // ─── ハロゲン化アルキル ───────────────────────────────────────────────────
  {
    id: "haloalkane",
    label: "ハロゲン化アルキル",
    reactions: [
      {
        id: "hal_naoh_sub",
        label: "NaOH水溶液（求核置換）",
        conditions: "NaOH水溶液 / 加熱",
        coReactantCategory: null,
        description: "ハロゲン化アルキル + NaOH(aq) → アルコール + NaX。SN反応。水性KOHでも可。",
      },
      {
        id: "hal_koh_elim",
        label: "KOHアルコール性（脱離）",
        conditions: "KOH / エタノール / 加熱",
        coReactantCategory: null,
        description: "ハロゲン化アルキル + KOH(EtOH) → アルケン + KX + H₂O。E2脱離。水性KOH（置換）との条件の違いが重要。",
      },
      {
        id: "hal_nh3",
        label: "アンモニアとの反応（アミン合成）",
        conditions: "NH₃（過剰）/ 加圧",
        coReactantCategory: null,
        description: "RX + NH₃ → RNH₂ + HX。アルキルアミンの合成。過剰NH₃で第1級アミンを得る。",
      },
      {
        id: "grignard_form",
        label: "グリニャール試薬の生成",
        conditions: "Mg / 乾燥ジエチルエーテル（無水）",
        coReactantCategory: null,
        description: "RX + Mg → RMgX（グリニャール試薬）。乾燥エーテル中でMgがC–X結合に挿入。強力な求核剤・強塩基。水分・酸素に厳禁。",
      },
      {
        id: "wurtz_fittig",
        label: "ウルツ-フィッティッヒ反応",
        conditions: "Na（金属）/ 乾燥エーテル",
        coReactantCategory: null,
        description: "ArX + RX + 2Na → Ar–R + 2NaX。芳香族ハロゲン化物と塩化アルキルをNaで還元的カップリング。アルキルアレーンの合成に利用。共反応物（塩化アルキル）を選択。",
      },
      {
        id: "hal_williamson",
        label: "ウィリアムソンエーテル合成",
        conditions: "ナトリウムアルコキシド（またはフェノキシド）",
        coReactantCategory: null,
        description: "R−I + R'−O⁻Na⁺ → R−O−R'（エーテル）+ NaI。ヨウ化アルキルにナトリウムアルコキシド（またはフェノキシド）を作用させてエーテルを合成する。共反応物（アルコキシド/フェノキシド）を選択。",
      },
    ],
  },

  // ─── アルカン ─────────────────────────────────────────────────────────────
  {
    id: "alkane",
    label: "アルカン",
    reactions: [
      {
        id: "aka_chlorinate",
        label: "塩素化（光照射）",
        conditions: "Cl₂ / 光（UV）",
        coReactantCategory: null,
        description: "ラジカル連鎖反応。アルカンの水素が塩素に置換されクロロアルカンが生成する。",
      },
      {
        id: "aka_brominate",
        label: "臭素化（光照射）",
        conditions: "Br₂ / 光（UV）",
        coReactantCategory: null,
        description: "ラジカル連鎖反応。アルカンの水素が臭素に置換されブロモアルカンが生成する。塩素化より遅く選択的。",
      },
      {
        id: "aka_cracking",
        label: "熱分解（クラッキング）",
        conditions: "高温（500°C以上）/ 触媒",
        coReactantCategory: null,
        description: "C–C結合が熱によって切断され、より短鎖のアルカンとアルケンが生成する。",
      },
      {
        id: "lactone_form",
        label: "ラクトンの生成（分子内脱水エステル化）",
        conditions: "酸性条件（H₂SO₄）/ 加熱",
        coReactantCategory: null,
        description: "分子内に−OHと−COOHがあり、脱水で5員環（γ-ラクトン）または6員環（δ-ラクトン）の環状エステルが生成する反応。例: 4-ヒドロキシブタン酸 → γ-ブチロラクトン。",
      },
      {
        id: "lactone_open",
        label: "ラクトンの開環反応",
        conditions: "NaOH水溶液 / 加熱",
        coReactantCategory: null,
        description: "環状ラクトンを NaOH で加水分解すると、エステル結合が切れてヒドロキシ基（−OH）とカルボン酸ナトリウム塩（−COONa）になる。芳香族ラクトンには適用されない。",
      },
      {
        id: "hcl_weak_acid_free",
        label: "塩酸の弱酸の遊離",
        conditions: "HCl（希塩酸）",
        coReactantCategory: null,
        description: "R−COO⁻Na⁺ → R−COOH、R−O⁻Na⁺ → R−OH。分子内の全ての−COO⁻や−O⁻が一度に遊離酸（−COOH / −OH）に変換され、NaClが析出する。",
      },
    ],
  },

  // ─── エーテル ─────────────────────────────────────────────────────────────
  {
    id: "ether",
    label: "エーテル",
    reactions: [
      {
        id: "eth_hi_cleavage",
        label: "HI（またはHBr）による開裂",
        conditions: "HI（または濃HBr）/ 加熱",
        coReactantCategory: null,
        description: "エーテルの C–O 結合がハロゲン化水素で切断され、アルコールとハロゲン化アルキルが生成する。",
      },
      {
        id: "eth_form",
        label: "アルコールからのエーテル生成",
        conditions: "濃H₂SO₄ / 130°C",
        coReactantCategory: null,
        description: "アルコール2分子が分子間脱水してエーテルが生成する（アルコールの alc_ether と対応）。",
      },
      {
        id: "eth_williamson",
        label: "ウィリアムソンエーテル合成",
        conditions: "ナトリウムアルコキシド（またはフェノキシド）+ ハロゲン化アルキル",
        coReactantCategory: null,
        description: "RONa + R'X → ROR' + NaX。対称・非対称エーテルを合成できる汎用法。フェノキシドとの反応でアニソール等が得られる。",
      },
    ],
  },

  // ─── アミン ───────────────────────────────────────────────────────────────
  {
    id: "amine",
    label: "アミン",
    reactions: [
      {
        id: "ami_hcl",
        label: "HCl塩形成",
        conditions: "HCl（塩酸）",
        coReactantCategory: null,
        description: "アミンは塩基性を示し、塩酸と中和してアンモニウム塩を生成する。",
      },
      {
        id: "ami_naoh_free",
        label: "NaOHによるアミン遊離",
        conditions: "NaOH水溶液",
        coReactantCategory: null,
        description: "アミン塩（塩酸塩など）+ NaOH → アミン + NaCl + H₂O。塩から遊離させる。アニリン塩酸塩→アニリンの重要反応。",
      },
      {
        id: "ami_acetyl",
        label: "アセチル化",
        conditions: "無水酢酸（または塩化アセチル）",
        coReactantCategory: null,
        description: "アミノ基（–NH₂）が無水酢酸とアシル化反応しアミドが生成する。",
      },
      {
        id: "ami_diazo",
        label: "ジアゾ化",
        conditions: "NaNO₂ + HCl / 0〜5°C",
        coReactantCategory: null,
        description: "芳香族第1級アミンを低温で亜硝酸と反応させるとジアゾニウム塩が生成する。",
      },
      {
        id: "ami_couple",
        label: "アゾカップリング（ジアゾカップリング）",
        conditions: "フェノール / β-ナフトール / アニリン類 / NaOH",
        coReactantCategory: null,
        description: "芳香族ジアゾニウム塩 ArN₂⁺ が活性化された芳香環（フェノール・アニリン・N,N-ジメチルアニリン・β-ナフトール等）の H を求電子置換してアゾ染料を与える。OH/NH₂/NR₂ はオルト・パラ配向のため、立体的に空いている para 位が主生成物（β-ナフトールでは同環 C1=オルト位）。活性化基自体は保持され、フェノール+ベンゼンジアゾニウム塩 → p-ヒドロキシアゾベンゼン、β-ナフトール+ベンゼンジアゾニウム塩 → 1-フェニルアゾ-2-ナフトール（Sudan I）など。",
      },
      {
        id: "ami_sandmeyer",
        label: "ザンドマイヤー反応（Sandmeyer 反応・関連置換反応）",
        conditions: "CuCl / CuBr / CuCN（古典 Sandmeyer）／ NaI（加熱）／ NaBF₄（Balz-Schiemann）／ Cu₂O+Cu(NO₃)₂+H₂O 混合試薬（3成分まとめて1つの条件）／ H₃PO₂（脱アミノ）",
        coReactantCategory: null,
        description: "芳香族ジアゾニウム塩 ArN₂⁺ の置換反応群。共反応物により導入される基が変わる：CuCl→Cl、CuBr→Br、CuCN→CN（古典 Sandmeyer、SET 機構で Ar•ラジカル経由）。NaI→I（加熱による直接置換、Cu 不要）。NaBF₄→F（Balz-Schiemann、ArN₂BF₄ を加熱）。Cu₂O + Cu(NO₃)₂ + H₂O は3成分まとめて1つの反応条件であり、これが揃うと→OH（銅触媒加水分解）。H₃PO₂（次亜リン酸）→H（還元的脱アミノ、Ar•ラジカル + H 受容）。すべて N₂ を放出する。",
      },
    ],
  },

  // ─── 検出反応 ─────────────────────────────────────────────────────────────
  {
    id: "detection",
    label: "検出反応",
    reactions: [
      {
        id: "det_schiff",
        label: "シッフ試薬",
        conditions: "シッフ試薬（フクシンの亜硫酸脱色液）",
        coReactantCategory: null,
        description: "アルデヒドでシッフ試薬が赤色（赤紫色）に呈色する（陽性）。ケトンでは呈色しない。アルデヒドとケトンの区別に利用される。",
      },
      {
        id: "det_fehling",
        label: "フェーリング反応",
        conditions: "フェーリング液 / 加熱",
        coReactantCategory: null,
        description: "アルデヒド（還元性糖を含む）で赤色沈殿（Cu₂O）が生成する。ケトンは不可。",
      },
      {
        id: "det_silver",
        label: "銀鏡反応（トーレンス試薬）",
        conditions: "アンモニア性AgNO₃水溶液 / 加熱",
        coReactantCategory: null,
        description: "アルデヒドが酸化されてカルボン酸になり、試験管内面に銀鏡が形成される。",
      },
      {
        id: "det_iodoform",
        label: "ヨードホルム反応（検出・合成）",
        conditions: "I₂ / NaOH水溶液 / 加熱",
        coReactantCategory: null,
        description: "CH₃CO–R または CH₃CH(OH)–R 構造（Rは H または C）にI₂/NaOH/加熱で反応。特異臭をもつ黄色沈殿のヨードホルム（CHI₃）が生成し、カルボン酸のナトリウム塩（R–COONa）が得られる。Rが O や N の場合は反応しない。",
      },
      {
        id: "det_fecl3",
        label: "FeCl₃水溶液との反応",
        conditions: "FeCl₃水溶液",
        coReactantCategory: null,
        description: "フェノール性水酸基を持つ化合物で特有の呈色（多くは紫色）が起こる。",
      },
      {
        id: "det_br2",
        label: "臭素水との反応（脱色・白色沈殿）",
        conditions: "Br₂水溶液",
        coReactantCategory: null,
        description: "アルケン・アルキン → 臭素付加で脱色。フェノール類 → トリブロモ体の白色沈殿。ベンゼン・アルカン（FeBr₃なし）→ 不反応。脱色するかどうかが判別の鍵。",
      },
      {
        id: "det_kmno4_cold",
        label: "冷希KMnO₄水溶液との反応（脱色）",
        conditions: "KMnO₄水溶液（冷・希）",
        coReactantCategory: null,
        description: "アルケン・アルキン → 酸化されKMnO₄が脱色（褐色沈殿MnO₂も）。アルデヒド・ギ酸 → 還元性で脱色。ベンゼン・アルカン → 不反応（脱色しない）。",
      },
      {
        id: "det_ninhydrin",
        label: "ニンヒドリン反応",
        conditions: "ニンヒドリン水溶液 / 加熱",
        coReactantCategory: null,
        description: "α-アミノ酸（–CH(NH₂)–COOH）でルヘマン紫（紫色）が生成する。アミノ酸・タンパク質の検出に使われる。",
      },
      {
        id: "det_iodine_starch",
        label: "ヨウ素デンプン反応",
        conditions: "ヨウ素液（I₂/KI水溶液）",
        coReactantCategory: null,
        description: "デンプン（アミロース）のらせん構造にI₃⁻が取り込まれて青紫色に呈色する。加熱すると退色し、冷却すると再呈色（可逆）。デンプンの検出・定性試験として最重要。",
      },
      {
        id: "det_biuret",
        label: "ビウレット反応",
        conditions: "NaOH水溶液 + 少量CuSO₄水溶液",
        coReactantCategory: null,
        description: "3残基以上のペプチド結合（−CO−NH−）を持つ化合物でCu²⁺が配位して赤紫色に呈色する。タンパク質の検出に使われる。ジペプチドは陰性または淡呈色。",
      },
      {
        id: "det_xanthoprotein",
        label: "キサントプロテイン反応",
        conditions: "濃HNO₃ / 加熱 → NaOHで塩基性化",
        coReactantCategory: null,
        description: "ベンゼン環を含むアミノ酸（チロシン・フェニルアラニン・トリプトファン）でニトロ化が起こり黄色に呈色する。NaOH添加でオレンジ色に変化。タンパク質中の芳香族アミノ酸の検出。",
      },
      {
        id: "det_lead_sulfide",
        label: "硫黄検出反応（酢酸鉛紙法）",
        conditions: "NaOH水溶液 / 加熱 → 酢酸鉛紙に接触",
        coReactantCategory: null,
        description: "S含有アミノ酸（システイン・メチオニン）を強塩基で加熱するとS²⁻が生成し、酢酸鉛紙（Pb(CH₃COO)₂）が黒色のPbSに変色する。タンパク質中のS含有アミノ酸の検出。",
      },
      {
        id: "aca_nahco3",
        label: "NaHCO₃との反応（検出法）",
        conditions: "NaHCO₃水溶液",
        coReactantCategory: null,
        description: "R−COOH + NaHCO₃ → R−COONa + H₂O + CO₂↑。カルボン酸のナトリウム塩が生成し、CO₂の気泡が発生する。フェノール（pKa≈10）はNaHCO₃と反応しないため、カルボン酸との識別に利用される。",
      },
      {
        id: "det_term_alkyne_ag",
        label: "−C≡CH検出①（銀アセチリド生成）",
        conditions: "アンモニア性AgNO₃水溶液",
        coReactantCategory: null,
        description: "末端アルキン（−C≡CH）がアンモニア性硝酸銀(I)溶液と反応し、白色沈殿の銀アセチリド（AgC≡CAg）が生成する。末端三重結合の検出法①。",
      },
      {
        id: "det_term_alkyne_cu",
        label: "−C≡CH検出②（銅(I)アセチリド生成）",
        conditions: "アンモニア性CuCl水溶液",
        coReactantCategory: null,
        description: "末端アルキン（−C≡CH）がアンモニア性塩化銅(I)溶液と反応し、赤色沈殿の銅(I)アセチリド（CuC≡CCu）が生成する。末端三重結合の検出法②。",
      },
    ],
  },

  // ─── 糖類 ─────────────────────────────────────────────────────────────────
  {
    id: "saccharide",
    label: "糖類",
    reactions: [
      {
        id: "sac_hydrolysis",
        label: "二糖の加水分解",
        conditions: "希H₂SO₄（または酵素）/ 加熱",
        coReactantCategory: null,
        description: "二糖 + H₂O → 単糖×2。スクロース → グルコース+フルクトース（非還元糖→還元糖）。マルトース → グルコース×2。",
      },
      {
        id: "sac_oxidize",
        label: "グルコースの酸化（グルクロン酸生成）",
        conditions: "酸化剤（希硝酸など）",
        coReactantCategory: null,
        description: "グルコースのアルデヒド基が酸化されてカルボン酸になる。還元糖の酸化反応。",
      },
      {
        id: "sac_fermentation",
        label: "アルコール発酵",
        conditions: "チマーゼ（酵母酵素）/ 37°C前後 / 嫌気的",
        coReactantCategory: null,
        description: "C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂。グルコース・フルクトースが酵母のチマーゼにより分解されてエタノールと二酸化炭素になる。酒・燃料エタノールの製造基盤。",
      },
      {
        id: "poly_sac_hydrolysis",
        label: "多糖の加水分解",
        conditions: "希H₂SO₄（または酵素）/ 加熱",
        coReactantCategory: null,
        description: "デンプン → アミラーゼ → マルトース → マルターゼ → グルコース。セルロース → 希H₂SO₄（またはセルラーゼ）→ グルコース。どちらも最終産物はグルコース。",
      },
      {
        id: "cell_acetylate",
        label: "セルロースのアセチル化（アセテート繊維製造）",
        conditions: "無水酢酸 / 濃H₂SO₄（触媒）",
        coReactantCategory: null,
        description: "セルロースの水酸基（−OH）が無水酢酸でエステル化されてセルロースジ・トリアセタートになる。絹様の光沢をもつアセテート繊維の原料。",
      },
      {
        id: "cell_nitrate",
        label: "セルロースの硝酸エステル化（ニトロセルロース製造）",
        conditions: "濃HNO₃ + 濃H₂SO₄（混酸）",
        coReactantCategory: null,
        description: "セルロースの−OHが−ONO₂に置換されてニトロセルロースが生成する。置換度により火薬（トリニトロ：綿火薬）や塗料・フィルム（ジニトロ：セルロイド）に使い分ける。",
      },
      {
        id: "viscose_process",
        label: "ビスコース法（レーヨン製造）",
        conditions: "CS₂ + NaOH → 希H₂SO₄中で紡糸（再生）",
        coReactantCategory: null,
        description: "セルロース + CS₂ + NaOH → セルロースキサントゲン酸ナトリウム（粘性ビスコース液）→ 希H₂SO₄水中で紡糸・再生 → ビスコースレーヨン（再生セルロース）。",
      },
    ],
  },

  // ─── タンパク質・アミノ酸 ────────────────────────────────────────────────
  {
    id: "protein_aa",
    label: "タンパク質・アミノ酸",
    reactions: [
      {
        id: "aa_peptide_bond",
        label: "ペプチド結合形成（縮合）",
        conditions: "加熱脱水 / 生体内ではリボソーム",
        coReactantCategory: null,
        description: "α-アミノ酸の−COOHと別のアミノ酸の−NH₂が脱水縮合してアミド結合（−CO−NH−, ペプチド結合）が形成される。H₂Oが1分子脱離する。ポリペプチド・タンパク質の一次構造の形成。",
      },
      {
        id: "prot_hydrolysis_acid",
        label: "タンパク質の酸加水分解",
        conditions: "希H₂SO₄（または6M HCl）/ 加熱",
        coReactantCategory: null,
        description: "タンパク質のペプチド結合がすべて加水分解されてα-アミノ酸の混合物になる。アミノ酸分析の前処理として使われる。",
      },
      {
        id: "prot_hydrolysis_enzyme",
        label: "タンパク質の酵素加水分解",
        conditions: "プロテアーゼ（ペプシン・トリプシン等）",
        coReactantCategory: null,
        description: "特定のアミノ酸配列でペプチド結合を選択的に切断する。胃・小腸でのタンパク質消化はこの方法。酸加水分解とは異なり温和な条件で進む。",
      },
      {
        id: "prot_denature",
        label: "タンパク質の変性",
        conditions: "熱・強酸・強塩基・有機溶媒・重金属塩",
        coReactantCategory: null,
        description: "高次構造（二次〜四次構造）が崩れて本来の機能を失う。アミノ酸の一次配列（共有結合）は変化しない。卵の熱変性・消毒用エタノールによる殺菌は変性を利用している。一般に不可逆的。",
      },
      {
        id: "aa_zwitterion",
        label: "アミノ酸の両性・等電点",
        conditions: "pH調整（酸・塩基の添加）",
        coReactantCategory: null,
        description: "α-アミノ酸は−NH₃⁺と−COO⁻を同時にもつ双性イオン（ツビッターイオン）として存在する。等電点（pI）では正負が均衡し電気泳動で移動しない。酸性溶液では陽イオン、塩基性では陰イオンになる。",
      },
    ],
  },

  // ─── 付加重合 ────────────────────────────────────────────────────────────
  {
    id: "polymer_addition",
    label: "付加重合",
    reactions: [
      {
        id: "add_polymerize",
        label: "付加重合（ビニル系モノマー）",
        conditions: "触媒（過酸化物・Ziegler-Natta等）/ 加熱・加圧",
        coReactantCategory: null,
        description: "C=C二重結合が開いてnモルのモノマーが連結する。モノマーとポリマーの組成式は等しい（原子損失なし）。代表例：エチレン→PE、プロピレン→PP、塩化ビニル→PVC、スチレン→PS、アクリロニトリル→アクリル繊維。",
      },
      {
        id: "add_polymerize_diene",
        label: "ジエンの付加重合（1,4-付加、合成ゴム）",
        conditions: "触媒（Ziegler-Natta等）/ 加熱",
        coReactantCategory: null,
        description: "共役ジエン（C=C−C=C）の1,4-付加重合で、炭素鎖に二重結合が残ったポリマーが生成する。シス体がゴム弾性を示す。例：ブタジエン→ポリブタジエン、イソプレン→ポリイソプレン、クロロプレン→ネオプレン。",
      },
      {
        id: "saponify_pva",
        label: "ポリ酢酸ビニルのけん化（PVA合成）",
        conditions: "NaOH水溶液（または希H₂SO₄）/ 加熱",
        coReactantCategory: null,
        description: "ポリ酢酸ビニル(PVAc) + NaOH → ポリビニルアルコール(PVA) + CH₃COONa。エステル基が加水分解されて水酸基になる。ビニロン製造の第一段階。",
      },
      {
        id: "acetalize_pva",
        label: "PVAのアセタール化（ビニロン合成）",
        conditions: "ホルムアルデヒド / 酸触媒",
        coReactantCategory: null,
        description: "ポリビニルアルコール(PVA)の一部の−OHをホルムアルデヒドでアセタール化（−O−CH₂−O−）→ビニロン。耐水性が向上し合成繊維として使用される。",
      },
    ],
  },

  // ─── 縮合重合・開環重合 ───────────────────────────────────────────────────
  {
    id: "polymer_condensation",
    label: "縮合重合・開環重合",
    reactions: [
      {
        id: "cond_polyamide",
        label: "ポリアミド合成（ジアミン＋ジカルボン酸）",
        conditions: "加熱 / 脱水縮合",
        coReactantCategory: null,
        description: "ジアミンの−NH₂とジカルボン酸の−COOHがアミド結合（−CO−NH−）を形成しながら連結する。H₂Oが脱離する縮合重合。例：ヘキサメチレンジアミン＋アジピン酸→ナイロン6,6。",
      },
      {
        id: "ring_open_polymerize",
        label: "開環重合（ラクタム→ポリアミド）",
        conditions: "酸・塩基触媒 / 加熱",
        coReactantCategory: null,
        description: "環状アミド（ラクタム）のC−N結合が開環して次々と連結する重合。ε-カプロラクタム→ナイロン6（ポリカプロアミド）。縮合重合と異なりH₂Oが脱離しない。",
      },
      {
        id: "cond_polyester",
        label: "ポリエステル合成（ジオール＋ジカルボン酸）",
        conditions: "加熱 / 脱水縮合",
        coReactantCategory: null,
        description: "ジオールの−OHとジカルボン酸の−COOHがエステル結合（−COO−）を形成しながら連結する縮合重合。H₂Oが脱離する。例：エチレングリコール＋テレフタル酸→PET（ポリエステル繊維・ペットボトル）。",
      },
      {
        id: "cond_phenol_formaldehyde",
        label: "フェノール樹脂合成（フェノール＋ホルムアルデヒド）",
        conditions: "酸または塩基触媒 / 加熱・加圧",
        coReactantCategory: null,
        description: "フェノールのベンゼン環とホルムアルデヒドが縮合・架橋して三次元ネットワーク構造の熱硬化性樹脂が生成する。世界初の合成プラスチック（ベークライト）。H₂Oが脱離する。",
      },
      {
        id: "cond_urea_formaldehyde",
        label: "ユリア樹脂合成（尿素＋ホルムアルデヒド）",
        conditions: "酸触媒 / 加熱",
        coReactantCategory: null,
        description: "尿素の−NH₂基とホルムアルデヒドが縮合してメチレン架橋が形成される熱硬化性樹脂。接着剤・食器（白色で着色しやすい）に使われる。",
      },
      {
        id: "cond_melamine_formaldehyde",
        label: "メラミン樹脂合成（メラミン＋ホルムアルデヒド）",
        conditions: "触媒 / 加熱",
        coReactantCategory: null,
        description: "メラミンの6つの−NH₂基とホルムアルデヒドが縮合して高密度の三次元網目構造が形成される。ユリア樹脂より耐熱性・硬度が高い。食器・ホワイトボード等。",
      },
    ],
  },
];