// SMILES文字列辞書
// TCI / PubChem / IUPAC基準の標準SMILES
// SmilesDrawer.js による2D構造式自動描画に使用
//
// 表記規則:
//   芳香族  ... 小文字 (c1ccccc1 など)
//   立体    ... 高校レベルでは原則省略。糖類のみ @/@@ 付与
//   ポリマー ... 代表的な繰返し単位の短鎖フラグメント（括弧表記非対応）

/* global */
const moleculeSMILES = {

  // ── 芳香族 ───────────────────────────────────────────
  benzene:              "c1ccccc1",
  toluene:              "Cc1ccccc1",
  nitrobenzene:         "O=[N+]([O-])c1ccccc1",
  phenol:               "Oc1ccccc1",
  hydroquinone:         "Oc1ccc(O)cc1",
  benzoquinone:         "O=C1C=CC(=O)C=C1",
  naphthol:             "Oc1ccc2ccccc2c1",
  cubane:               "C12C3C4C1C5C2C3C45",
  biphenyl:             "c1ccc(-c2ccccc2)cc1",
  // ─── 軸不斉・鏡像異性体ペア ───
  // 2D 表示用のラセミ／代表 SMILES（分子図鑑では 1 カードで統合、3D で R/S 切替）
  binol:                "Oc1ccc2ccccc2c1-c1c(O)ccc2ccccc12",
  binolR:               "Oc1ccc2ccccc2c1-c1c(O)ccc2ccccc12",
  binolS:               "Oc1ccc2ccccc2c1-c1c(O)ccc2ccccc12",
  biphenylDiol:         "CCc1ccc(O)c(-c2c(O)ccc(CC)c2)c1",
  biphenylDiolR:        "CCc1ccc(O)c(-c2c(O)ccc(CC)c2)c1",
  biphenylDiolS:        "CCc1ccc(O)c(-c2c(O)ccc(CC)c2)c1",
  // 6,6'-ジニトロジフェン酸（2,2'-ジカルボキシ-6,6'-ジニトロビフェニル）
  // 1922 年 Christie & Kenner により初めて分割された歴史的アトロプ異性体
  carboxyNitroBiphenyl:  "OC(=O)c1cccc([N+](=O)[O-])c1-c1c(C(=O)O)cccc1[N+](=O)[O-]",
  carboxyNitroBiphenylR: "OC(=O)c1cccc([N+](=O)[O-])c1-c1c(C(=O)O)cccc1[N+](=O)[O-]",
  carboxyNitroBiphenylS: "OC(=O)c1cccc([N+](=O)[O-])c1-c1c(C(=O)O)cccc1[N+](=O)[O-]",
  // リモネン C₁₀H₁₆（モノテルペン、柑橘・松脂香気の代表）
  // (R)-(+)-リモネン = D-リモネン（オレンジ皮の香り）／ (S)-(−)-リモネン = L-リモネン（松脂・テレビン油の香り）
  // 2D 統合カードは (R) 体（D-リモネン、天然主流）を代表として表示
  limonene:             "CC(=C)[C@@H]1CCC(C)=CC1",
  limoneneR:            "CC(=C)[C@@H]1CCC(C)=CC1",
  limoneneS:            "CC(=C)[C@H]1CCC(C)=CC1",
  // サリドマイド C₁₃H₁₀N₂O₄（鎮静薬／催奇形薬の歴史的化合物）
  // (R)-サリドマイド = 鎮静作用、(S)-サリドマイド = 催奇形作用（生体内で速やかにラセミ化）
  // 2D 統合カードはアキラル骨格（α-C のステレオ未指定）を代表として表示
  thalidomide:          "O=C1CCC(N2C(=O)c3ccccc3C2=O)C(=O)N1",
  thalidomideR:         "O=C1CC[C@@H](N2C(=O)c3ccccc3C2=O)C(=O)N1",
  thalidomideS:         "O=C1CC[C@H](N2C(=O)c3ccccc3C2=O)C(=O)N1",
  // メントール C₁₀H₂₀O（ハッカ・ペパーミントの主成分、清涼感の原因物質）
  // (−)-メントール = (1R,2S,5R) 天然型 ／ (+)-メントール = (1S,2R,5S) 合成型
  // 2D 統合カードは天然型 (−)-menthol = (R) 体を代表として表示
  menthol:              "C[C@@H]1CC[C@H](C(C)C)[C@H](O)C1",
  mentholR:             "C[C@@H]1CC[C@H](C(C)C)[C@H](O)C1",
  mentholS:             "C[C@H]1CC[C@@H](C(C)C)[C@@H](O)C1",
  aniline:              "Nc1ccccc1",
  anisole:              "COc1ccccc1",
  benzyl_alcohol:       "OCc1ccccc1",
  benzaldehyde:         "O=Cc1ccccc1",
  acetophenone:         "CC(=O)c1ccccc1",
  acetanilide:          "CC(=O)Nc1ccccc1",
  benzoic_acid:         "OC(=O)c1ccccc1",
  salicylic_acid:       "OC(=O)c1ccccc1O",
  methyl_salicylate:    "COC(=O)c1ccccc1O",
  aspirin:              "CC(=O)Oc1ccccc1C(=O)O",
  methyl_benzoate:      "COC(=O)c1ccccc1",
  benzamide:            "NC(=O)c1ccccc1",
  o_xylene:             "Cc1ccccc1C",
  m_xylene:             "Cc1cccc(C)c1",
  p_xylene:             "Cc1ccc(C)cc1",
  ethylbenzene:         "CCc1ccccc1",
  naphthalene:          "c1ccc2ccccc2c1",
  phenanthrene:         "c1ccc2ccc3ccccc3c2c1",
  acetaminophen:        "CC(=O)Nc1ccc(O)cc1",
  anthracene:           "c1ccc2cc3ccccc3cc2c1",
  styrene:              "C=Cc1ccccc1",
  cresol:               "Cc1ccccc1O",
  chlorobenzene:        "Clc1ccccc1",
  bromobenzene:         "Brc1ccccc1",
  dinitrobenzene:       "O=[N+]([O-])c1cccc([N+](=O)[O-])c1",
  benzenesulfonic_acid: "OS(=O)(=O)c1ccccc1",
  sodium_phenoxide:     "[Na+].[O-]c1ccccc1",
  sodium_benzenesulfonate: "[Na+].[O-]S(=O)(=O)c1ccccc1",
  benzene_diazonium:    "N#[N+]c1ccccc1.[Cl-]",
  cumene:               "CC(C)c1ccccc1",
  cumene_hydroperoxide: "CC(C)(OO)c1ccccc1",
  sodium_salicylate:    "[Na+].[O-]C(=O)c1ccccc1O",
  p_hydroxy_azobenzene: "Oc1ccc(N=Nc2ccccc2)cc1",
  dimethyl_phthalate:   "COC(=O)c1ccccc1C(=O)OC",
  monomethyl_phthalate: "COC(=O)c1ccccc1C(=O)O",
  mononitro_toluene:    "Cc1ccc([N+](=O)[O-])cc1",
  dinitro_toluene:      "Cc1ccc([N+](=O)[O-])cc1[N+](=O)[O-]",
  tnt:                  "Cc1c([N+](=O)[O-])cc([N+](=O)[O-])cc1[N+](=O)[O-]",
  calcium_carbide:      "[Ca+2].[C-]#[C-]",
  vinyl_acetylene:      "C=CC#C",

  // ── アルカン ─────────────────────────────────────────
  methane:   "C",
  ethane:    "CC",
  propane:   "CCC",
  butane:    "CCCC",
  isobutane: "CC(C)C",

  // ── アルケン ─────────────────────────────────────────
  ethene:   "C=C",
  propene:  "C=CC",
  butene_1: "C=CCC",
  butene_2: "CC=CC",

  // ── アルキン ─────────────────────────────────────────
  ethyne:   "C#C",
  propyne:  "CC#C",
  butyne_1: "C#CCC",

  // ── アルコール ───────────────────────────────────────
  methanol:        "CO",
  ethanol:         "CCO",
  propanol_1:      "CCCO",
  propanol_2:      "CC(O)C",
  butanol_1:       "CCCCO",
  butanol_2:       "CCC(O)C",
  // 2-ブタノール R/S 鏡像異性体
  butanol2R:       "CC[C@H](C)O",
  butanol2S:       "CC[C@@H](C)O",
  tert_butanol:    "CC(C)(C)O",
  ethylene_glycol: "OCCO",
  glycerol:        "OCC(O)CO",

  // ── エーテル ─────────────────────────────────────────
  dimethyl_ether:     "COC",
  diethyl_ether:      "CCOCC",
  methyl_ethyl_ether: "CCOC",
  mtbe:               "CC(C)(C)OC",

  // ── アルデヒド ───────────────────────────────────────
  formaldehyde:    "C=O",
  acetaldehyde:    "CC=O",
  propionaldehyde: "CCC=O",
  butyraldehyde:   "CCCC=O",

  // ── ケトン ───────────────────────────────────────────
  acetone:       "CC(C)=O",
  butanone_2:    "CCC(C)=O",
  pentanone_2:   "CCCC(C)=O",
  cyclohexanone: "O=C1CCCCC1",

  // ── カルボン酸 ───────────────────────────────────────
  formic_acid:   "OC=O",
  acetic_acid:   "CC(O)=O",
  propionic_acid: "CCC(O)=O",
  butyric_acid:  "CCCC(O)=O",
  lactic_acid:   "CC(O)C(O)=O",
  oxalic_acid:   "OC(=O)C(O)=O",
  maleic_acid:      "OC(=O)/C=C\\C(=O)O",
  maleic_anhydride: "O=C1OC(=O)C=C1",
  phthalic_acid:    "OC(=O)c1ccccc1C(=O)O",
  phthalic_anhydride: "O=C1OC(=O)c2ccccc21",
  lactic_acid:      "CC(O)C(=O)O",
  // 乳酸 R/S 鏡像異性体
  // (S)-乳酸 = L-(+)-乳酸（哺乳類の解糖系、ヨーグルト等）／ (R)-乳酸 = D-(-)-乳酸（細菌発酵）
  lacticAcidR:      "C[C@@H](O)C(=O)O",
  lacticAcidS:      "C[C@H](O)C(=O)O",
  malic_acid:       "OC(CC(=O)O)C(=O)O",
  // リンゴ酸 R/S 鏡像異性体
  // (S)-リンゴ酸 = L-(-)-リンゴ酸（天然、リンゴ・ブドウに広く存在）／ (R)-リンゴ酸 = D-(+)-リンゴ酸
  malicAcidR:       "O=C(O)C[C@@H](O)C(=O)O",
  malicAcidS:       "O=C(O)C[C@H](O)C(=O)O",
  tartaric_acid:    "OC(C(O)C(=O)O)C(=O)O",
  // 酒石酸 立体異性体 3 種：L-(+)-(2R,3R)、D-(-)-(2S,3S)、meso-(2R,3S)
  // meso 体は分子内に擬対称面を持つため光学不活性（不斉炭素 2 個あるが鏡像体ではない）
  tartaricAcidRR:   "O=C(O)[C@H](O)[C@@H](O)C(=O)O",
  tartaricAcidSS:   "O=C(O)[C@@H](O)[C@H](O)C(=O)O",
  tartaricAcidMeso: "O=C(O)[C@H](O)[C@H](O)C(=O)O",
  citric_acid:      "OC(CC(=O)O)(CC(=O)O)C(=O)O",

  // ── エステル ─────────────────────────────────────────
  methyl_acetate:    "COC(C)=O",
  ethyl_acetate:     "CCOC(C)=O",
  methyl_propionate: "COC(=O)CC",
  ethyl_butyrate:    "CCOC(=O)CCC",

  // ── アミン ───────────────────────────────────────────
  methylamine:   "CN",
  ethylamine:    "CCN",
  dimethylamine: "CNC",
  trimethylamine: "CN(C)C",

  // ── アミド ───────────────────────────────────────────
  acetamide: "CC(N)=O",

  // ── アミノ酸 ─────────────────────────────────────────
  glycine:  "NCC(O)=O",
  alanine:  "CC(N)C(O)=O",

  // ── 糖類（Haworth / 環状SMILES, 立体化学付き） ────────
  // α-D-グルコピラノース
  glucose:  "C([C@@H]1[C@H]([C@@H]([C@H]([C@@H](O1)O)O)O)O)O",
  // β-D-ガラクトピラノース（C4 配置のみ glucose と異なる：C4-OH 軸方向）
  galactose:"C([C@@H]1[C@@H]([C@@H]([C@H]([C@@H](O1)O)O)O)O)O",
  // β-D-フルクトフラノース（5員環）
  fructose: "OC[C@@]1(O)OC[C@@H](O)[C@H]1O",
  // スクロース
  sucrose:  "OC[C@H]1O[C@@](CO)(O[C@@H]2O[C@H](CO)[C@@H](O)[C@H](O)[C@H]2O)[C@@H](O)[C@H]1O",
  // マルトース (α-1,4結合)
  maltose:  "OC[C@H]1O[C@@H](O[C@H]2[C@H](O)[C@@H](O)[C@H](O)O[C@@H]2CO)[C@H](O)[C@@H](O)[C@@H]1O",
  // セロビオース (β-1,4 結合 Glc-Glc、セルロースの繰り返し二糖)
  cellobiose:"OC[C@H]1O[C@@H](O[C@@H]2[C@H](O)[C@@H](O)[C@H](O)O[C@@H]2CO)[C@H](O)[C@@H](O)[C@@H]1O",
  // ラクトース (β-1,4 結合 Gal-Glc、乳糖)
  lactose:  "OC[C@H]1O[C@@H](O[C@@H]2[C@H](O)[C@@H](O)[C@@H](O)O[C@@H]2CO)[C@H](O)[C@@H](O)[C@@H]1O",

  // starch / cellulose / 高分子は手書きSVGを維持（SMILES省略）
  // 高分子のSMILESはオリゴマーにしかならないため、molecules_svg.js の
  // 手書きSVG（繰り返し単位 + brackets + subscript n）を使用する。

  // ── 実験室モード用 追加分子（反応生成物として登場） ────────────────────
  // 芳香族系
  cumene:               "CC(C)c1ccccc1",      // クメン（イソプロピルベンゼン）
  bromotoluene:         "Cc1ccc(Br)cc1",      // p-ブロモトルエン（主生成物）
  nitrotoluene:         "Cc1ccccc1[N+](=O)[O-]", // o-ニトロトルエン（主生成物）
  cyclohexane:          "C1CCCCC1",           // シクロヘキサン
  cyclohexanol:         "OC1CCCCC1",          // シクロヘキサノール
  ethyl_benzoate:       "CCOC(=O)c1ccccc1",   // 安息香酸エチル

  // ハロゲン化物（二重結合反応の生成物）
  bromoethane:          "CCBr",               // ブロモエタン（臭化エチル）
  ethylene_dibromide:   "BrCCBr",             // 1,2-ジブロモエタン
  "2_bromopropane":     "CC(Br)C",            // 2-ブロモプロパン
  "1_2_dibromopropane": "BrCC(Br)C",          // 1,2-ジブロモプロパン
  vinyl_chloride:       "C=CCl",              // 塩化ビニル（PVC原料）

  // ── 香料エステル ─────────────────────────────────────
  isoamylAcetate:       "CC(C)CCOC(C)=O",     // 酢酸イソペンチル（バナナ）
  benzylAcetate:        "CC(=O)OCc1ccccc1",   // 酢酸ベンジル（ジャスミン）
  propylAcetate:        "CCCOC(C)=O",         // 酢酸プロピル（ナシ）
  methylButyrate:       "CCCC(=O)OC",         // 酪酸メチル（リンゴ）
  octylAcetate:         "CCCCCCCCOC(C)=O",    // 酢酸オクチル（オレンジ）
  ethylFormate:         "CCOC=O",             // ギ酸エチル（ラズベリー・ラム）
  propylButyrate:       "CCCC(=O)OCCC",       // 酪酸プロピル（アプリコット）
  isoamylButyrate:      "CCCC(=O)OCCC(C)C",   // 酪酸イソアミル（洋ナシ）

  // ── 染料・pH指示薬 ────────────────────────────────────
  sudan1:               "Oc1ccc2ccccc2c1/N=N/c1ccccc1",  // オイルオレンジ（Sudan I、1-フェニルアゾ-2-ナフトール）
  methylOrange:         "CN(C)c1ccc(/N=N/c2ccc(S(=O)(=O)[O-])cc2)cc1.[Na+]",  // メチルオレンジ
  phenolphthalein:      "OC(=O)c1ccccc1C(c1ccc(O)cc1)c1ccc(O)cc1",  // フェノールフタレイン（中性ラクトン形）
  methylRed:            "CN(C)c1ccc(/N=N/c2ccccc2C(=O)O)cc1",  // メチルレッド
  indigo:               "C1(=O)/C(=C2\\NC3C=CC=CC=3C\\2=O)/NC2C=CC=CC1=2",  // インジゴ（藍）
  btb:                  "CC(C)c1cc(C2(c3ccccc3S(=O)(=O)O2)c2cc(Br)c(O)c(C(C)C)c2C)cc(Br)c1O",  // ブロモチモールブルー
};
