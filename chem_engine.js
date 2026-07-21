// chem_engine.js
// 動的化学反応エンジン + IUPAC日本語命名
// 提供する公開API (window.ChemEngine):
//   nameJa(smiles)                        → 日本語名（文字列 or null）
//   computeProducts(smiles, reactionId)   → [{smiles, nameJa, formula}]
//   canApply(smiles, reactionId)          → boolean
//   getFormula(smiles)                    → 分子式文字列 or null
//
// 動的分子は window.dynMolecules (Map: canonSmiles → {id,nameJa,formula,smiles}) に格納

"use strict";

window.dynMolecules = window.dynMolecules || {};

window.ChemEngine = (() => {

  // ── RDKit インスタンス取得 ───────────────────────────────────────────────
  const RDK = () => window.__rdkit;

  // ── 置換基定義 ────────────────────────────────────────────────────────────
  // smarts: ベンゼン環炭素 [c:1] の後ろに付ける部分構造 SMARTS
  // dir: 配向性  op=オルト/パラ配向  m=メタ配向
  // pri: 命名優先度（小さいほど高優先度）
  const SUB_DEF = [
    { id:'N2+',     smarts:'[N+]#N',                nameJa:'ジアゾニウム', dir:'m',  pri:0,  alpha:'diazonium', skipTemplate:true },
    { id:'NO2',     smarts:'[N+](=O)[O-]',         nameJa:'ニトロ',       dir:'m',  pri:1,  alpha:'nitro'      },
    { id:'SO3H',    smarts:'S(=O)(=O)O',           nameJa:'スルホ',       dir:'m',  pri:2,  alpha:'sulfo'      },
    { id:'CN',      smarts:'C#N',                   nameJa:'シアノ',       dir:'m',  pri:3,  alpha:'cyano'      },
    { id:'COOH',    smarts:'C(=O)O',               nameJa:'カルボキシ',   dir:'m',  pri:4,  alpha:'carboxy'    },
    { id:'CHO',     smarts:'[CH]=O',               nameJa:'ホルミル',     dir:'m',  pri:5,  alpha:'formyl'     },
    { id:'COR',     smarts:'C(=O)C',               nameJa:'アシル',       dir:'m',  pri:6,  alpha:'acyl'       },
    { id:'COAr',    smarts:'C(=O)c2ccccc2',        nameJa:'フェニルカルボニル', dir:'m', pri:6, alpha:'phenylcarbonyl', skipTemplate:true },
    { id:'OH',      smarts:'[OH]',                 nameJa:'ヒドロキシ',   dir:'op', pri:7,  alpha:'hydroxy'    },
    { id:'NH2',     smarts:'[NH2]',                nameJa:'アミノ',       dir:'op', pri:8,  alpha:'amino'      },
    { id:'NHCOCH3', smarts:'NC(=O)C',              nameJa:'アセトアミド', dir:'op', pri:9,  alpha:'acetamido'  },
    { id:'Br',      smarts:'Br',                   nameJa:'ブロモ',       dir:'op', pri:10, alpha:'bromo'      },
    { id:'Cl',      smarts:'Cl',                   nameJa:'クロロ',       dir:'op', pri:11, alpha:'chloro'     },
    { id:'F',       smarts:'F',                    nameJa:'フルオロ',     dir:'op', pri:12, alpha:'fluoro'     },
    { id:'I',       smarts:'I',                    nameJa:'ヨード',       dir:'op', pri:13, alpha:'iodo'       },
    { id:'CH3',     smarts:'[CH3]',                nameJa:'メチル',       dir:'op', pri:14, alpha:'methyl'     },
    { id:'C2H5',    smarts:'[CH2][CH3]',           nameJa:'エチル',       dir:'op', pri:15, alpha:'ethyl'      },
    { id:'nPr',     smarts:'[CH2][CH2][CH3]',      nameJa:'n-プロピル',   dir:'op', pri:16, alpha:'npropyl'    },
    { id:'iPr',     smarts:'[CH]([CH3])[CH3]',     nameJa:'イソプロピル', dir:'op', pri:17, alpha:'isopropyl'  },
    { id:'tBu',     smarts:'[C]([CH3])([CH3])[CH3]', nameJa:'tert-ブチル', dir:'op', pri:18, alpha:'tbutyl'   },
    { id:'ALKYL',   smarts:'[CH2][CH2][CH2][CH3]',      nameJa:'n-ブチル',    dir:'op', pri:19, alpha:'nbutyl'     },
    { id:'CH2Ph',   smarts:'[CH2]c2ccccc2',             nameJa:'ベンジル',     dir:'op', pri:20, alpha:'benzyl'     },
    { id:'secBu',   smarts:'[CH]([CH3])[CH2][CH3]',     nameJa:'sec-ブチル',  dir:'op', pri:21, alpha:'secbutyl'   },
    { id:'tAmyl',   smarts:'[C]([CH3])([CH3])[CH2][CH3]', nameJa:'tert-アミル', dir:'op', pri:22, alpha:'tamyl'    },
  ];
  const SUB_MAP = Object.fromEntries(SUB_DEF.map(s => [s.id, s]));

  // 置換基 ID → ベンゼン環への接続 SMILES（EAS 直接構築フォールバック用）
  const SUB_SMILES_MAP = {
    'NO2':      '[N+](=O)[O-]',
    'SO3H':     'S(=O)(=O)O',
    'CN':       'C#N',
    'COOH':     'C(=O)O',
    'CHO':      '[CH]=O',
    'COR':      'C(=O)C',
    'COAr':     'C(=O)c2ccccc2',
    'OH':       'O',
    'NH2':      'N',
    'NHCOCH3':  'NC(=O)C',
    'Br':       'Br',
    'Cl':       'Cl',
    'F':        'F',
    'I':        'I',
    'CH3':      'C',
    'C2H5':     'CC',
    'nPr':      'CCC',
    'iPr':      'C(C)C',
    'tBu':      'C(C)(C)C',
    'ALKYL':    'CCCC',
    'CH2Ph':    'Cc2ccccc2',
    'secBu':    'C(C)CC',   // sec-ブチル: ring-CH(CH3)(CH2CH3)
    'tAmyl':    'C(C)(C)CC', // tert-アミル: ring-C(CH3)2(CH2CH3)
  };

  // EAS 反応 ID → 追加される置換基 ID（単分子反応のみ）
  const EAS_NEW_SUB = {
    ar_bromination:  'Br',
    ar_chlorination: 'Cl',
    ar_nitration:    'NO2',
    ar_sulfonation:  'SO3H',
  };

  // ── 反応 SMARTS テンプレート ─────────────────────────────────────────────
  const RXN_SMARTS = {
    // 芳香族求電子置換
    ar_bromination:   '[cH:1]>>[c:1]Br',
    ar_chlorination:  '[cH:1]>>[c:1]Cl',
    ar_nitration:     '[cH:1]>>[c:1][N+](=O)[O-]',
    ar_sulfonation:   '[cH:1]>>[c:1]S(=O)(=O)O',
    // アルケン付加
    alk_h2_add:       '[C:1]=[C:2]>>[C:1][C:2]',
    alk_br2_add:      '[C:1]=[C:2]>>[C:1](Br)[C:2]Br',
    alk_hbr_add:      '[CH2:1]=[C:2]>>[CH3:1][C:2]Br',
    alk_hcl_add:      '[CH2:1]=[C:2]>>[CH3:1][C:2]Cl',
    alk_h2o_add:      '[CH2:1]=[C:2]>>[CH3:1][C:2]O',
    alk_kmno4:           '[C:1]=[C:2]>>[C:1](O)[C:2]O',   // ②ジオール（冷希・中性/塩基）
    alk_kmno4_acid:      '[C:1]=[C:2]>>[C:1]=O.[C:2]=O', // ①酸化開裂（酸性・加熱）中間体
    alk_ozonolysis_red:  '[C:1]=[C:2]>>[C:1]=O.[C:2]=O', // オゾン分解①（Zn/H₂O 還元的）
    alk_ozonolysis_ox:   '[C:1]=[C:2]>>[C:1]=O.[C:2]=O', // オゾン分解②（H₂O₂ 酸化的）
    alk_wacker:          '[CH2:1]=[CH2:2]>>[CH3:1][CH:2]=O', // ワッカー法：エチレン→アセトアルデヒド
    // アルキン付加
    aly_h2_partial:   '[C:1]#[C:2]>>[C:1]=[C:2]',
    aly_h2_full:      '[C:1]#[C:2]>>[C:1][C:2]',  // 三重結合→単結合。H数は価数から補完（末端アルキンも正しくCH₃に）
    aly_br2_add:      '[C:1]#[C:2]>>[C:1](Br)=[C:2]Br',
    // アルデヒド・ケトン
    ald_oxidize:      '[CX3H1:1]=O>>[C:1](=O)O',
    ald_reduce:       '[CX3:1]=O>>[C:1]O',
    ald_cu_formaldehyde: '[CH3:1][OH]>>[CH2:1]=O',  // メタノール→ホルムアルデヒド
    alc_k2cr2o7_ald: '[CX4H2:1][OH]>>[CX3H1:1]=O', // 1級アルコール→アルデヒド（K₂Cr₂O₇/AgNO₃触媒）
    ald_acetic_acid: '[CH3:1][CH:2]=O>>[CH3:1][C:2](=O)O', // アセトアルデヒド→酢酸
    aca_decarb_naoh:  '[#6:1][C](=O)[O-]>>[#6:1]',  // RCOONa + NaOH → RH + Na₂CO₃
    // アミン
    ami_acetyl:       '[c:1][NH2]>>[c:1]NC(=O)C',
    ami_hcl:          '[c:1][NH2]>>[c:1][NH3+]',
    ami_diazo:        '[c:1][NH2]>>[c:1][N+]#N',
    // アルカン（末端CH₃を塩素化・臭素化）
    aka_chlorinate:   '[CX4H3:1]>>[C:1]Cl',
    aka_brominate:    '[CX4H3:1]>>[C:1]Br',
    // 芳香族（新規）
    ar_nitro_reduce:      '[c:1][N+](=O)[O-]>>[c:1]N',
    ar_benzyl_chloride:   '[c:1][CH3:2]>>[c:1][CH2:2]Cl',
    phe_naoh:             '[c:1][OH:2]>>[c:1][O-:2]',
    // 芳香族スルホン酸の中和 → スルホン酸ナトリウム塩
    ar_sulfo_na:          '[c:1][S:2](=O)(=O)[OH]>>[c:1][S:2](=O)(=O)[O-]',
    // アルカリ融解（Ar-SO3Na → Ar-ONa）
    ar_alkali_fusion:     '[c:1][S](=O)(=O)[O-]>>[c:1][O-]',
    // クロロベンゼンの加水分解（Ar-Cl → Ar-O⁻Na）
    ar_cl_hydrolysis:     '[c:1][Cl]>>[c:1][O-]',
    // アルコール/フェノールのナトリウム塩 → 遊離
    alc_free_from_na:     '[#6:1][O-]>>[#6:1][OH]',
    // アルコール（新規）
    alc_hbr:              '[CX4:1][OH]>>[CX4:1]Br',
    alc_hcl:              '[CX4:1][OH]>>[CX4:1]Cl',
    alc_dehydrate:        '[C:1][C:2][OH]>>[C:1]=[C:2]',
    alc_ether:            '[CX4:1][OH]>>[CX4:1]O[CX4:1]',  // 実際には二分子→特殊処理
    // エステル（新規）
    est_hydrolysis:       '[C:1](=O)O[C:2]>>[C:1](=O)O',
    est_saponify:         '[C:1](=O)O[C:2]>>[C:1](=O)O',
    // アミド加水分解 → 専用関数に移行
    // ハロゲン化アルキル（新規）
    hal_naoh_sub:         '[C:1][Br,Cl,I]>>[C:1]O',
    hal_koh_elim:         '[C!H0:1][C:2][Cl,Br,I]>>[C:1]=[C:2]',  // 専用関数 computeHalKohElim で処理（末端側選択）
    // 油脂（新規）
    fat_saponify:         '[C:1](=O)O[C:2]>>[C:1](=O)O',
    fat_hydrolysis:       '[C:1](=O)O[C:2]>>[C:1](=O)O',
    fat_hardening:        '[CH:1]=[CH:2]>>[CH2:1][CH2:2]',
    // アルキン（新規）
    aly_na_acetylide:     '[C:1]#[CH:2]>>[C:1]#[C:2][Na]',
    aly_ag_acetylide:     '[C:1]#[CH:2]>>[C:1]#[C:2][Ag]',
    // グリニャール試薬（生成・加水分解）
    grignard_form:        '[#6:1][Br]>>[#6:1][Mg]Br',
    grignard_h2o:         '[#6:1][Mg][Br,Cl]>>[#6:1]',
    // 芳香族追加（A）
    ar_desulfonation:     '[c:1]S(=O)(=O)O>>[cH:1]',
    diazo_water:          '[c:1][N+]#N>>[c:1]O',
    phe_ether_form:       '[c:1][O-:2]>>[c:1][O:2]C',
    cumene_oxidize:       '[c:1][CH:2](C)C>>[c:1][C:2](C)(C)OO',
    cyclo_dehydro:        '[CH2:1][CH2:2]>>[CH:1]=[CH:2]',
    // ハロゲン化アルキル追加（B）
    hal_nh3:              '[C:1][Br,Cl,I]>>[C:1]N',
    // カルボン酸塩遊離（D）
    salt_free:            '[C:1](=O)[O-]>>[C:1](=O)O',
    // アルコール（追加）
    alc_oxidize:          '[CX4H2:1][OH]>>[CX3H1:1]=O',   // 第1級→アルデヒド（特殊処理あり）
    // 芳香族（追加）
    ar_h2_add:     '[c:1]1[c:2][c:3][c:4][c:5][c:6]1>>[C:1]1[C:2][C:3][C:4][C:5][C:6]1',
    phe_free:             '[c:1][O-]>>[c:1]O',
    // カルボン酸（追加）
    aca_acyl_chloride:    '[C:1](=O)[OH]>>[C:1](=O)Cl',
    aca_decarboxylate:    '[CX4:1]C(=O)[OH]>>[CX4:1]',
    aca_naoh:             '[C:1](=O)[OH]>>[C:1](=O)[O-]',
    aca_na:               '[C:1](=O)[OH]>>[C:1](=O)[O-]',
    aca_nahco3:           '[C:1](=O)[OH]>>[C:1](=O)[O-]',  // 検出反応としても動作
    // アルコール（追加）
    alc_na:               '[CX4:1][OH]>>[CX4:1][O-]',
    // アミン
    ami_naoh_free:        '[c:1][NH3+]>>[c:1][NH2]',
    ami_couple:           '[c:1][N+]#N>>[c:1]N=N',   // 実際はカップリング先が必要、特殊処理
    // エーテル
    eth_hi_cleavage:      '[CX4:1]O[CX4:2]>>[CX4:1]I.[CX4:2]O',
    eth_form:             '[CX4:1][OH]>>[CX4:1]O[CX4:1]',  // 分子間脱水（alc_etherと同等）
  };

  // 各反応の適用可能性チェック用 SMARTS
  const APPLY_CHECK = {
    ar_bromination: '[cH]', ar_chlorination: '[cH]',
    ar_nitration: '[cH]',   ar_sulfonation: '[cH]',
    ar_side_oxidize: '[c][CH2,CH3]',
    ar_kmno4_oxidize: '[c][CX4]',
    alk_h2_add: 'C=C', alk_br2_add: 'C=C', alk_hbr_add: 'C=C',
    alk_hcl_add: '[CH2]=C', alk_h2o_add: '[CH2]=C',
    alk_kmno4: 'C=C', alk_kmno4_acid: 'C=C',
    alk_ozonolysis_red: 'C=C', alk_ozonolysis_ox: 'C=C',
    alk_wacker: '[CH2]=[CH2]',
    aly_h2_partial: 'C#C', aly_h2_full: 'C#C', aly_br2_add: 'C#C',
    aly_hbr_add: 'C#C', aly_hcl_add: 'C#C', aly_hcn_add: 'C#C',
    aly_h2o_add: 'C#C',
    ald_oxidize: '[CX3H1]=O', ald_reduce: 'C=O',
    ald_cu_formaldehyde: '[CH3][OH]',
    alc_k2cr2o7_ald: '[CX4H2][OH]',  // 1級アルコールのみ
    ald_acetic_acid: '[CH3][CH]=O',  // アセトアルデヒドのみ
    ald_cannizzaro:  '[CX3H1,CX3H2]=O',  // 全アルデヒド（α-H 判定は関数内）
    est_nitro:       '[OH][CX4][CX4]([OH])[CX4][OH]',  // グリセリン骨格（連続3C各にOH）
    lactone_form:    '[C](=O)[OH]',     // COOH を持つ（関数内で OH との距離を精密判定）
    lactone_open:    '[C](=O)1O[#6]',   // 環状エステル（ラクトン環を含む）
    hcl_weak_acid_free: '[O-]',          // Na 塩（アルコキシド or カルボキシレート）
    aca_decarb_naoh:  '[C](=O)[O-]',
    ami_acetyl: '[c][NH2]', ami_hcl: '[c][NH2]',
    ami_diazo: '[c][NH2]',
    aka_chlorinate: '[CX4H3]', aka_brominate: '[CX4H3]',
    ar_nitro_reduce:    '[c][N+](=O)[O-]',
    ar_benzyl_chloride: '[c][CH3]',
    phe_naoh:           '[c][OH]',
    ar_sulfo_na:        '[c]S(=O)(=O)O',
    ar_alkali_fusion:   '[c]S(=O)(=O)[O-]',
    ar_cl_hydrolysis:   '[c][Cl]',
    alc_free_from_na:   '[#6][O-]',
    alc_hbr:            '[CX4][OH]',
    alc_hcl:            '[CX4][OH]',
    est_hydrolysis:     '[C](=O)OC',
    est_saponify:       '[C](=O)OC',
    ami2_hydrolysis_acid: '[CX3](=O)[NX3]',
    ami2_hydrolysis_base: '[CX3](=O)[NX3]',
    hal_naoh_sub:       '[C][Br,Cl,I]',
    hal_koh_elim:       '[C!H0][C][Cl,Br,I]',
    fat_saponify:       '[C](=O)OC',
    fat_hydrolysis:     '[C](=O)OC',
    fat_hardening:      '[CH]=[CH]',
    aly_na_acetylide:   'C#[CH]',
    aly_ag_acetylide:   'C#[CH]',
    ar_desulfonation:   '[c]S(=O)(=O)O',
    diazo_water:        '[c][N+]#N',
    phe_ether_form:     '[c][O-]',
    cumene_oxidize:     '[c]C(C)C',
    cyclo_dehydro:      'C1CCCCC1',
    hal_nh3:            '[C][Br,Cl,I]',
    salt_free:          '[C](=O)[O-]',
    sac_hydrolysis:     'OC1OCC(O)C(O)C1O',
    grignard_form:      '[#6][Br]',
    grignard_h2o:       '[#6][Mg]',
    // 追加
    alc_dehydrate:      '[CX4][OH]',
    alc_ether:          '[CX4][OH]',
    alc_oxidize:        '[CX4][OH]',
    alc_na:             '[CX4][OH]',
    ar_h2_add:          'c1ccccc1',
    phe_free:           '[c][O-]',
    aca_acyl_chloride:  '[C](=O)[OH]',
    aca_decarboxylate:  '[CX4]C(=O)[OH]',
    aca_naoh:           '[C](=O)[OH]',
    aca_na:             '[C](=O)[OH]',
    aca_nahco3:         '[C](=O)[OH]',
    aca_anhydride_inter:'[C](=O)[OH]',
    aca_anhydride_intra:'[C](=O)[OH]',
    aca_calcium_salt:   '[C](=O)[OH]',
    aca_ca_ketonize:   '[C](=O)[O-].[Ca+2]',
    aca_triglyceride:  '[C](=O)[OH]',
    gly_saponify:      '[CX4H2]([OX2]C(=O))[CX4H1]([OX2]C(=O))[CX4H2][OX2]C(=O)',
    // 専用関数：APPLY_CHECK がないと canApply が false を返すので必須
    cumene_cleave:      '[c]C(C)(C)OO',
    phe_kolbe:          '[c][O-]',
    formic_dehydrate:   'OC=O',
    // ヨードホルム反応（CH₃CO- or CH₃CHOH- で、隣が H or C のみ）
    det_iodoform:       '[CH3][#6]~[#8]',
    cac2_water:         '[C-]#[C-]',
    // V₂O₅ による芳香族酸無水物生成（無置換芳香族のみ、関数内で厳密判定）
    ar_v2o5_anhydride:'c1ccccc1',
    // 芳香族側鎖塩素化（ベンゼン環にアルキル基がある場合のみ）
    ar_sidechain_cl:  '[c][CX4]',
    // アルキン二分子重合（アセチレン→ビニルアセチレン）
    aly_dimerize:       '[CH]#[CH]',
    // アルキン三量化（アセチレン→ベンゼン）
    aly_trimerize:      'C#C',
    // エーテル反応
    eth_hi_cleavage:    '[CX4]O[CX4]',
    eth_williamson:     '[c,CX4][O-]',
    eth_form:           '[CX4][OH]',
    // アミン反応
    ami_naoh_free:      '[NH3+]',
    ami_couple:         '[c][N+]#N',
    // Sandmeyer / Schiemann / 加水分解 / 脱アミノ：すべて ArN₂⁺ から始まる
    ami_sandmeyer:      '[c][N+]#N',
    // アミノ酸
    aa_zwitterion:      '[CX4][NH2]',
    // 説明型反応（APPLY_CHECK のみ。runInformational でテキストを返す）
    aka_cracking:       '[CX4][CX4]',
    ald_aldol:          '[CX4H2][CX3H1]=O',
    sac_oxidize:        '[CX3H1]=O',
    sac_fermentation:   'OC1OCC(O)C(O)C1O',
    poly_sac_hydrolysis:'OC1OCC(O)C(O)C1O',
    cell_acetylate:     'OC1OCC(O)C(O)C1O',
    cell_nitrate:       'OC1OCC(O)C(O)C1O',
    viscose_process:    'OC1OCC(O)C(O)C1O',
    aa_peptide_bond:    '[CX4][NH2]',
    prot_hydrolysis_acid:   '[C](=O)[NH]',
    prot_hydrolysis_enzyme: '[C](=O)[NH]',
    prot_denature:          '[C](=O)[NH]',
    add_polymerize:         'C=C',
    add_polymerize_diene:   'C=CC=C',
    saponify_pva:           '[C](=O)OC',
    acetalize_pva:          '[CX4][OH]',
    cond_polyamide:         '[NH2]',
    ring_open_polymerize:   '[N][C](=O)',
    cond_polyester:         '[C](=O)[OH]',
    cond_phenol_formaldehyde:'[c][OH]',
    cond_urea_formaldehyde:  '[NH2][C](=O)[NH2]',
    cond_melamine_formaldehyde: 'c1nc(N)nc(N)n1',
    // 検出反応（SMARTS による適用可否チェック）
    det_schiff:         '[CX3H1]=O',
    det_fehling:        '[CX3H1]=O',
    det_silver:         '[CX3H1]=O',
    det_fecl3:          '[c][OH]',
    det_br2:            'C=C',
    det_kmno4_cold:     'C=C',
    det_ninhydrin:      '[CX4][NH2]',
    det_iodine_starch:  'OC1OCC(O)C(O)C1O',
    det_biuret:         '[C](=O)[NH]',
    det_xanthoprotein:  '[c]CC([NH2])',
    det_lead_sulfide:   '[SX2H]',
    det_term_alkyne_ag: 'C#[CH]',
    det_term_alkyne_cu: 'C#[CH]',
  };

  // ── 二分子反応テーブル ──────────────────────────────────────────────────────

  // 反応カテゴリ ID → BIMOL エントリ名リスト（1 つの rxId に複数のエントリを持てる）
  const RXN_ID_TO_BIMOL = {
    ar_fc_alkyl:       ['ar_fc_alkyl_hal'],      // 塩化アルキルのみ（AlCl₃触媒）
    ar_fc_acyl:        ['ar_fc_acyl_cl', 'ar_fc_acyl_co2'],
    alc_esterify:      ['alc_esterify'],
    aca_esterify:      ['aca_esterify', 'aca_esterify_phe'],
    aca_amide:         ['aca_amide'],
    acyl_cl_alc:       ['acyl_cl_alc', 'acyl_cl_phe'],
    acyl_cl_amine:     ['acyl_cl_amine'],
    // グリニャール試薬の反応（R1 = RMgX, R2 = carbonyl/CO2）
    grignard_add_ald:  ['grignard_b_ald'],   // RMgX + RCHO → 第2級アルコール
    grignard_add_form: ['grignard_b_fald'],  // RMgX + HCHO → 第1級アルコール
    grignard_add_ket:  ['grignard_b_ket'],   // RMgX + ketone → 第3級アルコール
    grignard_co2:      ['grignard_b_co2'],   // RMgX + CO₂ → カルボン酸
    // ウルツ-フィッティッヒ（R1 = ArX, R2 = RX）
    wurtz_fittig:      ['wurtz_fittig_b'],
    // 酸無水物反応（R1 = 酸無水物）
    anhydride_alc:     ['anhydride_alc_b', 'anhydride_phe_b'],
    anhydride_amine:   ['anhydride_amine_b'],
    // 分子間脱水（エーテル生成）: R1-OH + R2-OH → R1-O-R2。共反応物に他経路の
    // アルコールを選べば混合エーテル（非対称エーテル）も合成できる。
    alc_ether:         ['alc_ether_b'],
    eth_form:          ['alc_ether_b'],
    // 分子間脱水（酸無水物生成）: R1COOH + R2COOH → 酸無水物。混合酸無水物も可。
    aca_anhydride_inter: ['aca_anhyd_inter_b'],
    // ウィリアムソンエーテル合成（R1 = アルコキシドまたはフェノキシド）
    eth_williamson:    ['eth_williamson_alc', 'eth_williamson_phe'],
    // トリグリセリド合成（R1=グリセリン、R2=カルボン酸）
    gly_triglyceride:  ['gly_triglyceride_b'],
    // 酸無水物のモノエステル化（R1=酸無水物 or 環状無水物、R2=アルコール）
    anh_monoester:     ['anh_monoester_b'],
    // 酸無水物のジエステル化（R1=酸無水物 or モノエステル、R2=アルコール）
    anh_diester:       ['anh_diester_b'],
    // ウィリアムソン（R1=アルコキシド、R2=ハロゲン化アルキル）— アルコールカテゴリ用
    alc_williamson:    ['alc_williamson_b'],
    // ウィリアムソン（R1=ヨウ化アルキル、R2=アルコキシド/フェノキシド）— ハロゲン化アルキルカテゴリ用
    hal_williamson:    ['hal_williamson_alc', 'hal_williamson_phe'],
    // アゾカップリング（R1 = ジアゾニウム塩）
    // 配向性を考慮し、共反応物の活性化基（OH / NH2 / NMe2）の para 位（または
    // 2-ナフトールの場合は同環の C1=ortho 位）を求電子置換する。
    // 順序: より特異性の高いパターンを先に試す（ナフトール → フェノール、NMe2 → NH2）。
    ami_couple:        ['ami_couple_naphthol2', 'ami_couple_naphthol1', 'ami_couple_phe', 'ami_couple_dimethylaniline', 'ami_couple_aniline'],
    // Sandmeyer / Schiemann / 加水分解 / H₃PO₂ 脱アミノ（R1 = ArN₂⁺）
    // 共反応物により生成物が異なる:
    //   CuCl/CuBr/CuCN → ArCl/ArBr/ArCN（古典 Sandmeyer）
    //   NaI            → ArI（加熱）
    //   NaBF₄          → ArF（Balz-Schiemann）
    //   Cu₂O+Cu(NO₃)₂+H₂O 混合試薬 → ArOH（3成分が揃って1つの反応条件として機能）
    //   H₃PO₂          → ArH（還元的脱アミノ）
    ami_sandmeyer:     ['ami_sandmeyer_cucl', 'ami_sandmeyer_cubr', 'ami_sandmeyer_cucn', 'ami_sandmeyer_nai', 'ami_sandmeyer_nabf4', 'ami_sandmeyer_hydroxylate', 'ami_sandmeyer_h3po2'],
    // グリニャール反応（出発物質=カルボニル、共反応物=RMgX）
    ald_grignard:      ['ald_grignard_b'],
    ket_grignard:      ['ket_grignard_b'],
    form_grignard:     ['form_grignard_b'],
    est_grignard:      ['est_grignard_b'],   // 特殊処理（computeEsterGrignard）
    // 酸無水物 → エステル（エステルカテゴリ用、副生成物あり）
    est_from_anhydride:['est_anhydride_alc_b'],
    // 酸無水物 → アミド（アミドカテゴリ用、副生成物あり）
    ami_from_anhydride:['ami_anhydride_amine_b'],
    // アルケン + カルボン酸（立体選択的付加）
    alk_acid_add:      ['alk_acid_add_b'],
    // アルキン + カルボン酸（ビニルエステル合成）
    aly_acid_add:      ['aly_acid_add_b'],
  };

  // 二分子反応 SMARTS（reactant1.reactant2>>product）
  const BIMOL_RXN_SMARTS = {
    ar_fc_alkyl_hal:  '[cH:1].[CX4:2][Cl]>>[c:1][C:2]',
    ar_fc_acyl_cl:    '[cH:1].[C:2](=O)[Cl]>>[c:1][C:2](=O)',
    ar_fc_acyl_co2:   '[cH:1].[O:2]=[C:3]=[O:4]>>[c:1][C:3](=[O:2])[OH]',  // ArH + CO₂ → Ar-COOH
    alc_esterify:     '[CX4:1][OH:3].[C:2](=O)[OH]>>[C:2](=O)[O:3][C:1]',
    aca_esterify:     '[C:1](=O)[OH].[CX4:2][OH:3]>>[C:1](=O)[O:3][C:2]',
    aca_amide:        '[C:1](=O)[OH].[NH2:2]>>[C:1](=O)[N:2]',
    acyl_cl_alc:      '[C:1](=O)Cl.[CX4:2][OH:3]>>[C:1](=O)[O:3][C:2]',
    acyl_cl_phe:      '[C:1](=O)Cl.[c:2][OH:3]>>[C:1](=O)[O:3][c:2]',
    acyl_cl_amine:    '[C:1](=O)Cl.[NH2:2]>>[C:1](=O)[N:2]',
    aca_esterify_phe: '[C:1](=O)[OH].[c:2][OH:3]>>[C:1](=O)[O:3][c:2]',
    // 分子間脱水: 2分子のアルコール → エーテル（H₂O 脱離）
    alc_ether_b:      '[CX4:1][OH].[CX4:2][OH]>>[CX4:1]O[CX4:2]',
    // 分子間脱水: 2分子のカルボン酸 → 酸無水物（H₂O 脱離）
    aca_anhyd_inter_b:'[C:1](=O)[OH].[C:2](=O)[OH]>>[C:1](=O)O[C:2](=O)',
    // グリニャール反応（RMgBr が R1）
    // RCHO（アルデヒド、H1=CHO）→ 第2級アルコール
    grignard_b_ald:   '[#6:1][Mg][Br,Cl].[CX3H1:2]=O>>[#6:1][C:2]O',
    // HCHO（ホルムアルデヒド）→ 第1級アルコール
    grignard_b_fald:  '[#6:1][Mg][Br,Cl].[CH2:2]=O>>[#6:1][C:2]O',
    // ケトン → 第3級アルコール（H0 の炭素カルボニル）
    grignard_b_ket:   '[#6:1][Mg][Br,Cl].[CX3H0:2](=O)[#6]>>[#6:1][C:2]O',
    // CO₂ → カルボン酸
    grignard_b_co2:   '[#6:1][Mg][Br,Cl].[O:2]=[C:3]=O>>[#6:1][C:3](=O)O',
    // ウルツ-フィッティッヒ（ArX + RX → Ar-R）
    wurtz_fittig_b:   '[c:1][Br,Cl].[CX4:2][Cl,Br]>>[c:1][C:2]',
    // 酸無水物 + アルコール → エステル + カルボン酸
    anhydride_alc_b:  '[C:1](=O)O[C:2](=O).[CX4:3][OH:4]>>[C:1](=O)[O:4][C:3]',
    // 酸無水物 + フェノール → フェニルエステル + カルボン酸
    anhydride_phe_b:  '[C:1](=O)O[C:2](=O).[c:3][OH:4]>>[C:1](=O)[O:4][c:3]',
    // 酸無水物 + アミン → アミド + カルボン酸
    anhydride_amine_b:'[C:1](=O)O[C:2](=O).[NH2:3]>>[C:1](=O)[N:3]',
    // ウィリアムソンエーテル合成: アルコキシド + ハロゲン化アルキル
    eth_williamson_alc:'[CX4:1][O-].[CX4:2][Br,Cl,I]>>[CX4:1]O[CX4:2]',
    // ウィリアムソンエーテル合成: フェノキシド + ハロゲン化アルキル
    eth_williamson_phe:'[c:1][O-].[CX4:2][Br,Cl,I]>>[c:1]O[CX4:2]',
    // トリグリセリド合成（特殊処理、ダミー SMARTS）
    gly_triglyceride_b:'[OH][CX4][CX4]([OH])[CX4][OH].[C](=O)[OH]>>[*]',
    // 酸無水物モノエステル化（特殊処理、ダミー SMARTS）
    anh_monoester_b:   '[C](=O)O[C](=O).[CX4][OH]>>[*]',
    // 酸無水物ジエステル化（特殊処理、ダミー SMARTS）
    anh_diester_b:     '[C](=O)O[C](=O).[CX4][OH]>>[*]',
    // ウィリアムソン（R1=アルコキシド、R2=ヨウ化アルキル）
    alc_williamson_b: '[CX4:1][O-].[CX4:2][I]>>[CX4:1]O[CX4:2]',
    // ウィリアムソン（R1=ヨウ化アルキル、R2=アルコキシド/フェノキシド）
    hal_williamson_alc:'[CX4:1][I].[CX4:2][O-]>>[CX4:1]O[CX4:2]',
    hal_williamson_phe:'[CX4:1][I].[c:2][O-]>>[CX4:1]O[c:2]',
    // ─── アゾカップリング（電子環状求電子置換 / 配向性を反映） ───────────────
    // ArN2+ は弱い求電子試薬であり、強い活性化基（-OH, -NH2, -NR2）を持つ
    // 芳香環のみと反応する。OH / NH2 / NR2 はオルト・パラ配向であり、
    // 立体的・電子的理由でパラ位が主生成物となる（フェノール、アニリン）。
    // 2-ナフトールでは同一環内オルト位（C1）が最反応点で、Sudan I 型を与える。
    //
    // 旧 SMARTS は活性化基ごと置換していたが、これは化学的に誤り。
    // 正しくは「OH / NH2 / NR2 を保持して、その para 位（or 2-naphthol の C1）の
    // 芳香族 H を –N=N–Ar で置換する」。
    //
    // フェノール: OH を保持し、para 位（[cH:3]）の H を N=N-Ar で置換
    ami_couple_phe:   '[c:10][N+]#N.[OH:1][c:2]1[cH][cH][cH:3][cH][cH]1>>[OH:1][c:2]1[cH][cH][c:3](N=N[c:10])[cH][cH]1',
    // 2-ナフトール（β-ナフトール）: OH (C2 位) を保持し、同環 C1 位（オルト）に置換
    // → Sudan I 型 (1-アリールアゾ-2-ナフトール)
    ami_couple_naphthol2:'[c:10][N+]#N.[OH:1][c:2]1[cH][cH]c2[cH][cH][cH][cH]c2[cH:3]1>>[OH:1][c:2]1[cH][cH]c2[cH][cH][cH][cH]c2[c:3]1N=N[c:10]',
    // 1-ナフトール（α-ナフトール）: OH (C1 位) を保持し、同環 C4 (para 等価) または C2 (ortho)
    // に置換。ここでは C2（オルト、同環）を主生成物として扱う
    ami_couple_naphthol1:'[c:10][N+]#N.[OH:1][c:2]1[cH:3][cH][cH][c]2[cH][cH][cH][cH][c]12>>[OH:1][c:2]1[c:3](N=N[c:10])[cH][cH][c]2[cH][cH][cH][cH][c]12',
    // アニリン: NH2 を保持し、para 位の H を N=N-Ar で置換
    ami_couple_aniline:'[c:10][N+]#N.[NH2:1][c:2]1[cH][cH][cH:3][cH][cH]1>>[NH2:1][c:2]1[cH][cH][c:3](N=N[c:10])[cH][cH]1',
    // N,N-ジメチルアニリン: NMe2 を保持し、para 位の H を N=N-Ar で置換
    // → メチルオレンジ等のアゾ染料原料
    ami_couple_dimethylaniline:'[c:10][N+]#N.[NX3:1]([CH3])([CH3])[c:2]1[cH][cH][cH:3][cH][cH]1>>[N:1]([CH3])([CH3])[c:2]1[cH][cH][c:3](N=N[c:10])[cH][cH]1',
    // ─── Sandmeyer 反応群: ArN₂⁺ → ArX (X = Cl/Br/CN/I/F/OH/H) ───────────────
    // 共反応物により導入される基が変わる。N₂ は脱離（出力 SMILES からは省略）。
    // CuCl: Sandmeyer 反応 → ArCl（一電子移動 SET 機構、Ar• ラジカル経由）
    ami_sandmeyer_cucl: '[c:1][N+]#N.[Cu]Cl>>[c:1]Cl',
    // CuBr: Sandmeyer 反応 → ArBr
    ami_sandmeyer_cubr: '[c:1][N+]#N.[Cu]Br>>[c:1]Br',
    // CuCN: Sandmeyer 反応 → ArCN
    ami_sandmeyer_cucn: '[c:1][N+]#N.[Cu]C#N>>[c:1]C#N',
    // NaI: 加熱による直接ヨウ素化 → ArI（Cu 触媒不要）
    ami_sandmeyer_nai:  '[c:1][N+]#N.[I-]>>[c:1]I',
    // NaBF₄: Balz-Schiemann 反応（ArN₂BF₄ を加熱） → ArF + BF₃ + N₂
    ami_sandmeyer_nabf4:'[c:1][N+]#N.F[B-](F)(F)F>>[c:1]F',
    // Cu₂O + Cu(NO₃)₂ + H₂O 混合試薬: 3成分すべてが揃った系での銅触媒加水分解 → ArOH
    // 反応条件として3成分は不可分（Cu₂O 単独や Cu(NO₃)₂ 単独では進行しない）。
    // SMARTS では混合試薬の特徴的な部分構造（[Cu]O[Cu] = Cu₂O フラグメント）を検出して
    // 反応をトリガーする。
    ami_sandmeyer_hydroxylate: '[c:1][N+]#N.[Cu]O[Cu]>>[c:1]O',
    // H₃PO₂: 次亜リン酸による還元的脱アミノ → ArH（位置を H で置換）
    ami_sandmeyer_h3po2:'[c:1][N+]#N.O[PH2]=O>>[cH:1]',
    // グリニャール反応（R1=カルボニル化合物、R2=RMgX）
    ald_grignard_b:    '[CX3H1:1]=O.[#6:2][Mg][Br,Cl]>>[C:1]([OH])[#6:2]',     // ald→2°alc
    ket_grignard_b:    '[CX3H0:1](=O).[#6:2][Mg][Br,Cl]>>[C:1]([OH])[#6:2]',   // ket→3°alc
    form_grignard_b:   '[CH2:1]=O.[#6:2][Mg][Br,Cl]>>[C:1]([OH])[#6:2]',        // HCHO→1°alc
    est_grignard_b:    '[C:1](=O)O[#6].[#6:2][Mg][Br,Cl]>>[C:1]([OH])[#6:2]',   // ester（暫定、特殊処理で上書き）
    // 酸無水物 + アルコール → エステル + カルボン酸（マルチフラグメント生成物）
    est_anhydride_alc_b:'[C:1](=O)O[C:2](=O).[CX4:3][OH:4]>>[C:1](=O)[O:4][C:3].[C:2](=O)O',
    // 酸無水物 + アミン → アミド + カルボン酸（マルチフラグメント生成物）
    ami_anhydride_amine_b:'[C:1](=O)O[C:2](=O).[NH2:3]>>[C:1](=O)[N:3].[C:2](=O)O',
    // アルケン + カルボン酸 → エステル（立体障害の小さい末端炭素にOCOR付加）
    alk_acid_add_b:    '[CH2:1]=[C:2].[C:3](=O)[OH]>>[C:3](=O)O[CH2:1][C:2]',
    // アルキン + カルボン酸 → ビニルエステル（立体障害の小さい末端炭素にOCOR付加）
    aly_acid_add_b:    '[C:1]#[CH:2].[C:3](=O)[OH]>>[C:1]=[C:2]O[C:3]=O',
  };

  // 主反応物（R1）が BIMOL 反応に必要な部分構造
  const BIMOL_REACT1_CHECK = {
    ar_fc_alkyl_hal:  '[cH]',
    ar_fc_acyl_cl:    '[cH]',
    ar_fc_acyl_co2:   '[cH]',
    alc_esterify:     '[CX4][OH]',
    aca_esterify:     '[C](=O)[OH]',
    aca_amide:        '[C](=O)[OH]',
    acyl_cl_alc:      '[C](=O)Cl',
    acyl_cl_phe:      '[C](=O)Cl',
    acyl_cl_amine:    '[C](=O)Cl',
    aca_esterify_phe: '[C](=O)[OH]',
    // 分子間脱水（エーテル生成）: R1 = アルコール
    alc_ether_b:      '[CX4][OH]',
    // 分子間脱水（酸無水物生成）: R1 = カルボン酸
    aca_anhyd_inter_b:'[C](=O)[OH]',
    grignard_b_ald:   '[#6][Mg]',
    grignard_b_fald:  '[#6][Mg]',
    grignard_b_ket:   '[#6][Mg]',
    grignard_b_co2:   '[#6][Mg]',
    wurtz_fittig_b:   '[c][Br,Cl]',
    // 酸無水物（R1 = 酸無水物）
    anhydride_alc_b:  '[C](=O)O[C](=O)',
    anhydride_phe_b:  '[C](=O)O[C](=O)',
    anhydride_amine_b:'[C](=O)O[C](=O)',
    // ウィリアムソン
    eth_williamson_alc:'[CX4][O-]',
    eth_williamson_phe:'[c][O-]',
    // トリグリセリド合成（R1=グリセリン）
    gly_triglyceride_b:'[OH][CX4][CX4]([OH])[CX4][OH]',
    // 酸無水物モノエステル化（R1=酸無水物）
    anh_monoester_b:   '[C](=O)O[C](=O)',
    // 酸無水物ジエステル化（R1=酸無水物 or モノエステル）
    anh_diester_b:     '[$([C](=O)O[C](=O)),$([C](=O)[OH])]',
    // ウィリアムソン（R1=アルコキシド）
    alc_williamson_b: '[CX4][O-]',
    // ウィリアムソン（R1=ヨウ化アルキル）
    hal_williamson_alc:'[CX4][I]',
    hal_williamson_phe:'[CX4][I]',
    // アゾカップリング（R1 = 芳香族ジアゾニウム塩 — すべての変種で共通）
    ami_couple_phe:           '[c][N+]#N',
    ami_couple_naphthol2:     '[c][N+]#N',
    ami_couple_naphthol1:     '[c][N+]#N',
    ami_couple_aniline:       '[c][N+]#N',
    ami_couple_dimethylaniline:'[c][N+]#N',
    // Sandmeyer 反応群（R1 = 芳香族ジアゾニウム塩 — すべての変種で共通）
    ami_sandmeyer_cucl:        '[c][N+]#N',
    ami_sandmeyer_cubr:        '[c][N+]#N',
    ami_sandmeyer_cucn:        '[c][N+]#N',
    ami_sandmeyer_nai:         '[c][N+]#N',
    ami_sandmeyer_nabf4:       '[c][N+]#N',
    ami_sandmeyer_hydroxylate: '[c][N+]#N',
    ami_sandmeyer_h3po2:       '[c][N+]#N',
    // グリニャール反応（R1 = カルボニル化合物）
    ald_grignard_b:    '[CX3H1]=O',
    ket_grignard_b:    '[#6]C(=O)[#6]',
    form_grignard_b:   '[CH2]=O',
    est_grignard_b:    '[C](=O)O[#6]',
    // 酸無水物 + アルコール（R1 = 酸無水物）
    est_anhydride_alc_b:'[C](=O)O[C](=O)',
    // 酸無水物 + アミン（R1 = 酸無水物）
    ami_anhydride_amine_b:'[C](=O)O[C](=O)',
    // アルケン + カルボン酸（R1 = アルケン）
    alk_acid_add_b:   '[CH2]=[C]',
    // アルキン + カルボン酸（R1 = アルキン）
    aly_acid_add_b:   'C#C',
  };

  // ── ペイロード抽出設定 ─────────────────────────────────────────────────────
  // 二分子 run_reactants が失敗した場合のフォールバック。
  // R2 から「付加基 SMILES」を抽出し、[r1Pattern]>>[productPrefix]{payload} という
  // 単分子 SMARTS を動的に構築して R1 に適用する。
  const PAYLOAD_EXTRACT_CONFIG = {
    // F-C アルキル化: R2=アルキルハライド → アルキル基を R1 の [cH] に付加
    ar_fc_alkyl_hal: {
      extractSmarts: '[CX4:1][Cl,Br,I]>>[CX4:1]',
      r1Pattern:     '[cH:1]',
      productPrefix: '[c:1]',
    },
    // F-C アシル化: R2=酸塩化物 → R基を取り出し [c:1]C(=O){R} を構築
    ar_fc_acyl_cl: {
      extractSmarts: '[CX4,c:1][C](=O)[Cl,Br]>>[CX4,c:1]',
      r1Pattern:     '[cH:1]',
      productPrefix: '[c:1]C(=O)',
    },
    // カルボン酸エステル化 (R1=酸, R2=アルコール)
    aca_esterify: {
      extractSmarts: '[CX4:1][OH]>>[CX4:1]',
      r1Pattern:     '[C:1](=O)[OH]',
      productPrefix: '[C:1](=O)O',
    },
    // カルボン酸 + フェノールのエステル化
    aca_esterify_phe: {
      extractSmarts: '[c:1][OH]>>[c:1]',
      r1Pattern:     '[C:1](=O)[OH]',
      productPrefix: '[C:1](=O)O',
    },
    // アルコール + カルボン酸のエステル化 (R1=アルコール, R2=酸)
    alc_esterify: {
      extractSmarts: '[CX4,c:1][C](=O)[OH]>>[CX4,c:1]',
      r1Pattern:     '[CX4:1][OH]',
      productPrefix: '[CX4:1]OC(=O)',
    },
    // カルボン酸アミド化 (R1=酸, R2=アミン)
    aca_amide: {
      extractSmarts: '[CX4,c:1][NH2]>>[CX4,c:1]',
      r1Pattern:     '[C:1](=O)[OH]',
      productPrefix: '[C:1](=O)N',
    },
    // 酸塩化物 + アルコール → エステル
    acyl_cl_alc: {
      extractSmarts: '[CX4:1][OH]>>[CX4:1]',
      r1Pattern:     '[C:1](=O)[Cl]',
      productPrefix: '[C:1](=O)O',
    },
    // 酸塩化物 + フェノール → フェニルエステル
    acyl_cl_phe: {
      extractSmarts: '[c:1][OH]>>[c:1]',
      r1Pattern:     '[C:1](=O)[Cl]',
      productPrefix: '[C:1](=O)O',
    },
    // 酸塩化物 + アミン → アミド
    acyl_cl_amine: {
      extractSmarts: '[CX4,c:1][NH2]>>[CX4,c:1]',
      r1Pattern:     '[C:1](=O)[Cl]',
      productPrefix: '[C:1](=O)N',
    },
    // ウルツ-フィッティッヒ: R1=ArX, R2=アルキルハライド
    wurtz_fittig_b: {
      extractSmarts: '[CX4:1][Cl,Br]>>[CX4:1]',
      r1Pattern:     '[c:1][Cl,Br]',
      productPrefix: '[c:1]',
    },
    // アルケン + カルボン酸: R2=RCOOH → R基を取り出し、末端CH₂にOC(=O)R を付加
    alk_acid_add_b: {
      extractSmarts: '[CX4,c:1][C](=O)[OH]>>[CX4,c:1]',
      r1Pattern:     '[CH2:1]=[C:2]',
      productPrefix: '[C:2][CH2:1]OC(=O)',
    },
    // アルキン + カルボン酸: R2=RCOOH → R基を取り出し、末端CHにOC(=O)R を付加
    aly_acid_add_b: {
      extractSmarts: '[CX4,c:1][C](=O)[OH]>>[CX4,c:1]',
      r1Pattern:     '[C:1]#[CH:2]',
      productPrefix: '[C:1]=[C:2]OC(=O)',
    },
  };

  // 共反応物（R2）に必要な官能基 SMARTS リスト
  const CO_REACT_FG_SMARTS = {
    ar_fc_alkyl_hal:  ['[CX4][Cl]'],
    ar_fc_acyl_cl:    ['[C](=O)[Cl]'],
    ar_fc_acyl_co2:   ['O=C=O'],
    alc_esterify:     ['[C](=O)[OH]'],
    aca_esterify:     ['[CX4][OH]', '[OH]c'],
    aca_amide:        ['[NH2]', '[NH2]c'],
    acyl_cl_alc:      ['[CX4][OH]'],
    acyl_cl_phe:      ['[OH]c'],
    acyl_cl_amine:    ['[NH2]', '[NH2]c'],
    aca_esterify_phe: ['[OH]c'],
    // 分子間脱水（エーテル生成）: 共反応物はアルコール（他経路のアルコールも可）
    alc_ether_b:      ['[CX4][OH]'],
    // 分子間脱水（酸無水物生成）: 共反応物はカルボン酸
    aca_anhyd_inter_b:['[C](=O)[OH]'],
    // グリニャール試薬の共反応物
    grignard_b_ald:   ['[CX3H1]=O'],           // アルデヒド（CHO）
    grignard_b_fald:  ['[CH2]=O'],             // ホルムアルデヒドのみ
    grignard_b_ket:   ['[CX3H0](=O)[CX4]'],   // ケトン（C=O に隣接C×2）
    grignard_b_co2:   ['O=C=O'],               // CO₂のみ
    // ウルツ-フィッティッヒの共反応物（塩化アルキル）
    wurtz_fittig_b:   ['[CX4][Cl]', '[CX4][Br]'],
    // 酸無水物の共反応物
    anhydride_alc_b:  ['[CX4][OH]'],
    anhydride_phe_b:  ['[OH]c'],
    anhydride_amine_b:['[NH2]', '[NH2]c'],
    // ウィリアムソン: 共反応物はハロゲン化アルキル
    eth_williamson_alc:['[CX4][Cl]', '[CX4][Br]', '[CX4][I]'],
    eth_williamson_phe:['[CX4][Cl]', '[CX4][Br]', '[CX4][I]'],
    // トリグリセリド: 共反応物はカルボン酸
    gly_triglyceride_b:['[C](=O)[OH]'],
    // 酸無水物モノ/ジエステル化: 共反応物はアルコール
    anh_monoester_b:   ['[CX4][OH]', '[c][OH]'],
    anh_diester_b:     ['[CX4][OH]', '[c][OH]'],
    // ウィリアムソン: R1=アルコキシド → 共反応物はヨウ化アルキル
    alc_williamson_b: ['[CX4][I]'],
    // ウィリアムソン: R1=ヨウ化アルキル → 共反応物はアルコキシド/フェノキシド
    hal_williamson_alc:['[CX4][O-]'],
    hal_williamson_phe:['[c][O-]'],
    // アゾカップリング: 共反応物の SMARTS は反応 SMARTS の左辺と整合させる必要がある
    // （para-CH を要求するため、unsubstituted phenol/aniline と β-naphthol/α-naphthol のみ反応）
    // フェノール: para-CH を持つ phenol
    ami_couple_phe:           ['[OH][c]1[cH][cH][cH][cH][cH]1'],
    // 2-ナフトール（β-ナフトール）: 同環 C1 が CH（unsubstituted）
    ami_couple_naphthol2:     ['[OH][c]1[cH][cH]c2[cH][cH][cH][cH]c2[cH]1'],
    // 1-ナフトール（α-ナフトール）: 同環 C2 が CH
    ami_couple_naphthol1:     ['[OH][c]1[cH][cH][cH][c]2[cH][cH][cH][cH][c]12'],
    // アニリン: para-CH を持つ aniline
    ami_couple_aniline:       ['[NH2][c]1[cH][cH][cH][cH][cH]1'],
    // N,N-ジメチルアニリン: para-CH を持つ NMe2-Ar
    ami_couple_dimethylaniline:['[NX3]([CH3])([CH3])[c]1[cH][cH][cH][cH][cH]1'],
    // ── Sandmeyer 反応群: 共反応物の選別 ────────────────────────────────────
    // 注意: ヒドロキシ化は Cu₂O + Cu(NO₃)₂ + H₂O の3成分混合試薬を1つの反応条件
    // として扱う。混合試薬の特徴部分 [Cu]O[Cu] を検出に用いるが、これは Cu₂O 単独で
    // も成立してしまう。そのため labMolecules 側で Cu₂O や Cu(NO₃)₂ を単体登録せず、
    // 混合試薬のみを登録することで「3成分セットでしか反応しない」UX を実現する。
    ami_sandmeyer_cucl:        ['[Cu]Cl'],
    ami_sandmeyer_cubr:        ['[Cu]Br'],
    ami_sandmeyer_cucn:        ['[Cu]C#N'],
    ami_sandmeyer_nai:         ['[I-]'],
    ami_sandmeyer_nabf4:       ['F[B-](F)(F)F'],
    ami_sandmeyer_hydroxylate: ['[Cu]O[Cu]'],
    ami_sandmeyer_h3po2:       ['[PH2]=O', '[PH2](=O)O'],
    // グリニャール反応: 共反応物はグリニャール試薬
    ald_grignard_b:    ['[#6][Mg]'],
    ket_grignard_b:    ['[#6][Mg]'],
    form_grignard_b:   ['[#6][Mg]'],
    est_grignard_b:    ['[#6][Mg]'],
    // 酸無水物 + アルコール: 共反応物はアルコール
    est_anhydride_alc_b:['[CX4][OH]', '[c][OH]'],
    // 酸無水物 + アミン: 共反応物はアミン
    ami_anhydride_amine_b:['[NH2]', '[NH2]c'],
    // アルケン + カルボン酸: 共反応物はカルボン酸
    alk_acid_add_b:   ['[C](=O)[OH]'],
    // アルキン + カルボン酸: 共反応物はカルボン酸
    aly_acid_add_b:   ['[C](=O)[OH]'],
  };

  // ── ユーティリティ ───────────────────────────────────────────────────────

  function canonSmiles(smiles) {
    const rdk = RDK();
    if (!rdk || !smiles) return smiles;
    let mol;
    try {
      mol = rdk.get_mol(smiles);
      if (!mol) return smiles;
      const s = mol.get_smiles();
      mol.delete();
      return s || smiles;
    } catch (_) {
      if (mol) try { mol.delete(); } catch (_2) {}
      return smiles;
    }
  }

  // canonSmiles の失敗時 null 版（SMILES が無効な場合 null を返す）
  function tryCanonSmiles(smiles) {
    const rdk = RDK();
    if (!rdk || !smiles) return null;
    let mol;
    try {
      mol = rdk.get_mol(smiles);
      if (!mol) return null;
      const s = mol.get_smiles();
      mol.delete();
      return s || null;
    } catch (_) {
      if (mol) try { mol.delete(); } catch (_2) {}
      return null;
    }
  }

  function hasSubstruct(smiles, smarts) {
    const rdk = RDK();
    if (!rdk) return false;
    let mol, pat;
    try {
      mol = rdk.get_mol(smiles);
      if (!mol) return false;
      pat = rdk.get_qmol(smarts);
      if (!pat) { mol.delete(); return false; }
      const m = mol.get_substruct_match(pat);
      mol.delete(); pat.delete();
      return !!m && m !== '{}';
    } catch (_) {
      if (mol) try { mol.delete(); } catch (_2) {}
      if (pat) try { pat.delete(); } catch (_2) {}
      return false;
    }
  }

  // 全マッチ取得（get_substruct_matches が使えればそれを使う）
  function getAllMatches(smiles, smarts) {
    const rdk = RDK();
    if (!rdk) return [];
    let mol, pat;
    try {
      mol = rdk.get_mol(smiles);
      if (!mol) return [];
      pat = rdk.get_qmol(smarts);
      if (!pat) { mol.delete(); return []; }

      let raw;
      if (typeof mol.get_substruct_matches === 'function') {
        raw = mol.get_substruct_matches(pat);
      } else {
        const single = mol.get_substruct_match(pat);
        raw = (single && single !== '{}') ? '[' + single + ']' : '[]';
      }
      mol.delete(); pat.delete();

      if (!raw || raw === '{}' || raw === '[]') return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return parsed.atoms ? [parsed] : [];
      if (parsed.length === 0) return [];
      // 各要素が match object ({atoms:[...]}) か配列かを判定
      if (typeof parsed[0] === 'object' && !Array.isArray(parsed[0]) && parsed[0].atoms) {
        return parsed;
      }
      // 数値の配列の配列の場合
      return parsed.map(m => ({ atoms: Array.isArray(m) ? m : [m] }));
    } catch (e) {
      if (mol) try { mol.delete(); } catch (_2) {}
      if (pat) try { pat.delete(); } catch (_2) {}
      return [];
    }
  }

  // ── WASM オブジェクト安全解放 ──────────────────────────────────────────────
  function _del(obj) {
    if (obj && typeof obj.delete === 'function') try { obj.delete(); } catch (_) {}
  }

  // ── MolList / JSMolListList をイテレートするヘルパー ────────────────────────
  // RDKit.js の MolList は .size() / .at(i) でアクセス
  // JSMolListList（run_reactants 戻り値）は .size() / .get(i)
  function _iterList(v, callback) {
    if (!v) return;
    if (Array.isArray(v)) { v.forEach(callback); return; }
    const n = typeof v.size === 'function' ? v.size() : 0;
    for (let i = 0; i < n; i++) {
      // .get() がある場合はそれ、なければ .at()
      const item = typeof v.get === 'function' ? v.get(i)
                 : typeof v.at  === 'function' ? v.at(i)
                 : undefined;
      if (item) callback(item);
    }
  }

  // ── JS配列 → RDKit MolList 変換 ───────────────────────────────────────────
  function _makeMolList(rdk, mols) {
    const ml = new rdk.MolList();
    for (const m of mols) ml.append(m);
    return ml;
  }

  // 反応 SMARTS を適用してプロダクト SMILES の配列を返す
  function applyRxnSmarts(reactantSmiles, rxnSmarts) {
    const rdk = RDK();
    if (!rdk || typeof rdk.get_rxn !== 'function') return [];
    let rxn, mol, ml;
    try {
      rxn = rdk.get_rxn(rxnSmarts);
      if (!rxn) return [];
      mol = rdk.get_mol(reactantSmiles);
      if (!mol) { _del(rxn); return []; }

      // run_reactants には MolList を渡す（JS配列は不可）
      ml = _makeMolList(rdk, [mol]);
      const productSets = rxn.run_reactants(ml);
      _del(ml); _del(mol); _del(rxn);
      ml = null; mol = null; rxn = null;

      const seen = new Set();
      const results = [];
      _iterList(productSets, (products) => {
        _iterList(products, (p) => {
          try {
            const smi = p.get_smiles();
            _del(p);
            if (smi && !seen.has(smi)) { seen.add(smi); results.push(smi); }
          } catch (_) { _del(p); }
        });
      });
      _del(productSets);
      return results;
    } catch (e) {
      console.warn('ChemEngine.applyRxnSmarts:', e);
      _del(ml); _del(mol); _del(rxn);
      return [];
    }
  }

  // ── 二分子反応 SMARTS 適用 ──────────────────────────────────────────────────

  function applyRxnSmartsBimol(r1Smiles, r2Smiles, rxnSmarts) {
    const rdk = RDK();
    if (!rdk || typeof rdk.get_rxn !== 'function') return [];
    let rxn, mol1, mol2, ml;
    try {
      rxn = rdk.get_rxn(rxnSmarts);
      if (!rxn) return [];
      mol1 = rdk.get_mol(r1Smiles);
      mol2 = rdk.get_mol(r2Smiles);
      if (!mol1 || !mol2) {
        _del(mol1); _del(mol2); _del(rxn); return [];
      }

      ml = _makeMolList(rdk, [mol1, mol2]);
      const productSets = rxn.run_reactants(ml);
      _del(ml); _del(mol1); _del(mol2); _del(rxn);
      ml = null; mol1 = null; mol2 = null; rxn = null;

      const seen = new Set();
      const results = [];
      _iterList(productSets, (products) => {
        _iterList(products, (p) => {
          try {
            const smi = p.get_smiles();
            _del(p);
            if (smi && !seen.has(smi)) { seen.add(smi); results.push(smi); }
          } catch (_) { _del(p); }
        });
      });
      _del(productSets);
      return results;
    } catch (e) {
      console.warn('ChemEngine.applyRxnSmartsBimol:', e);
      _del(ml); _del(mol1); _del(mol2); _del(rxn);
      return [];
    }
  }

  // 主反応物が BIMOL 反応に適用可能か
  function canApplyBimol(r1Smiles, rxId) {
    if (!r1Smiles) return false;
    const bimolIds = RXN_ID_TO_BIMOL[rxId] || [];
    return bimolIds.some(bid => {
      const check = BIMOL_REACT1_CHECK[bid];
      return check && hasSubstruct(r1Smiles, check);
    });
  }

  // rxId に対応する共反応物 SMARTS リストを返す
  function getCoReactantSmarts(rxId) {
    const bimolIds = RXN_ID_TO_BIMOL[rxId] || [];
    return [...new Set(bimolIds.flatMap(bid => CO_REACT_FG_SMARTS[bid] || []))];
  }

  // labMolecules + dynMolecules から共反応物候補を探す
  function findCoReactants(rxId) {
    const bimolIds = RXN_ID_TO_BIMOL[rxId] || [];
    if (bimolIds.length === 0) return [];
    const allMols = {
      ...(typeof labMolecules !== 'undefined' ? labMolecules : {}),
      ...(window.dynMolecules || {}),
    };
    const result = [];
    const seen = new Set();
    for (const [molId, mol] of Object.entries(allMols)) {
      if (!mol.smiles || seen.has(molId)) continue;
      const matches = bimolIds.some(bid =>
        (CO_REACT_FG_SMARTS[bid] || []).some(s => hasSubstruct(mol.smiles, s))
      );
      if (matches) {
        seen.add(molId);
        result.push({ molId, nameJa: mol.nameJa || molId, formula: mol.formula || '' });
      }
    }
    return result;
  }

  // 二分子反応プロダクトを計算して登録
  function computeProductsBimol(r1Smiles, r2Smiles, rxId) {
    const rdk = RDK();
    if (!rdk) return [];
    const bimolIds = RXN_ID_TO_BIMOL[rxId] || [];
    const r1can = canonSmiles(r1Smiles);
    const r2can = canonSmiles(r2Smiles);
    if (!r1can || !r2can) return [];

    for (const bid of bimolIds) {
      const coSmarts = CO_REACT_FG_SMARTS[bid] || [];
      if (!coSmarts.some(s => hasSubstruct(r2can, s))) continue;
      const r1check = BIMOL_REACT1_CHECK[bid];
      if (r1check && !hasSubstruct(r1can, r1check)) continue;

      const rxnSmarts = BIMOL_RXN_SMARTS[bid];
      if (!rxnSmarts) continue;

      // EAS 系は位置選択性スコアで最良プロダクトを選択
      // F-C アルキル化: カルボカチオン転位を考慮して実際に導入される基を決定
      let fcRearranged = false;
      let newSubId;
      if (bid === 'ar_fc_alkyl_hal') {
        const resolved = resolveFCAlkylCation(r2can);
        newSubId = resolved.subId;
        fcRearranged = resolved.rearranged;
      } else {
        newSubId = bid === 'ar_fc_acyl_cl' ? 'COR'
                 : bid === 'ar_fc_acyl_co2' ? 'COOH'
                 : null;
      }

      // F-C アルキル化: カルボカチオン転位を常に反映するため、SMARTS 直接反応をスキップし
      // buildEASCandidates を優先（SMARTS は転位を考慮しないため）
      let rawProducts = [];
      if (bid !== 'ar_fc_alkyl_hal') {
        rawProducts = applyRxnSmartsBimol(r1can, r2can, rxnSmarts);
        // フォールバック①: ペイロード抽出 + 単分子SMARTS
        if (rawProducts.length === 0) {
          rawProducts = computeProductsPayload(r1can, r2can, bid);
        }
      }
      // フォールバック②（F-C アルキル化では常にここ）: EAS 直接 SMILES 構築
      if (rawProducts.length === 0 && (bid === 'ar_fc_alkyl_hal' || bid === 'ar_fc_acyl_cl' || bid === 'ar_fc_acyl_co2')) {
        let newSubSmiles = null;
        if (bid === 'ar_fc_alkyl_hal') {
          // resolveFCAlkylCation が決定した転位後の基の SMILES を使用
          newSubSmiles = newSubId ? (SUB_SMILES_MAP[newSubId] ?? null) : null;
        } else if (bid === 'ar_fc_acyl_cl') {
          const pa = applyRxnSmarts(r2can, '[CX4,c:1][C](=O)[Cl,Br]>>[CX4,c:1]');
          // pa[0] が芳香環 SMILES（例: c1ccccc1）の場合、テンプレートリング1と衝突するため
          // renumberRings でリング番号を2以降に振り直す
          if (pa[0]) newSubSmiles = `C(=O)${renumberRings(pa[0], 2)}`;
        } else if (bid === 'ar_fc_acyl_co2') {
          // CO₂ → カルボキシル基 -COOH を導入
          newSubSmiles = 'C(=O)O';
        }
        if (newSubSmiles) rawProducts = buildEASCandidates(r1can, newSubSmiles);
      }
      if (rawProducts.length === 0) continue;

      const unique = [...new Set(rawProducts)];

      let chosen;
      if (newSubId) {
        const best = pickBestProduct(unique, r1can, newSubId);
        chosen = best ? [best] : [unique[0]];
      } else {
        chosen = [unique[0]];
      }

      // 選ばれなかった全生成物を副生成物として収集
      const byProductSmiles = unique.filter(s => !chosen.includes(s));

      return chosen.map(smi => {
        const molId = registerDynMol(smi);
        const byProdResults = byProductSmiles
          .map(bs => { const id = registerDynMol(bs); return id ? { smiles: bs, molId: id, nameJa: nameJa(bs) ?? bs, formula: getFormula(bs) ?? '' } : null; })
          .filter(Boolean);
        return {
          smiles: smi,
          molId,
          nameJa: nameJa(smi) ?? smi,
          formula: getFormula(smi) ?? '',
          rearranged: fcRearranged,
          byProducts: byProdResults,
        };
      }).filter(r => r.smiles && r.molId);
    }
    return [];
  }

  // ── ペイロード抽出 + 単分子SMARTS（bimol フォールバック） ──────────────────
  // run_reactants([mol1, mol2]) が RDKit.js WASM で信頼できないため、
  // R2 から付加基 SMILES を抽出し、R1 への単分子 SMARTS を動的に構築する。
  function computeProductsPayload(r1Smiles, r2Smiles, bid) {
    const cfg = PAYLOAD_EXTRACT_CONFIG[bid];
    if (!cfg) return [];
    const rdk = RDK();
    if (!rdk) return [];

    // Step 1: R2 からペイロード SMILES を抽出
    const payloadArr = applyRxnSmarts(r2Smiles, cfg.extractSmarts);
    if (!payloadArr || payloadArr.length === 0) return [];
    const payloadSmiles = payloadArr[0];
    if (!payloadSmiles) return [];

    // Step 2: 動的 SMARTS を組み立て ([r1Pattern]>>[productPrefix]{payloadSmiles})
    // ペイロードが芳香環を含む場合（例: benzoyl chloride から c1ccccc1 が抽出される）、
    // テンプレートリング番号 1 と衝突しないよう renumberRings で 2 以降に振り直す。
    const safePayload = renumberRings(payloadSmiles, 2);
    const dynSmarts = `${cfg.r1Pattern}>>${cfg.productPrefix}${safePayload}`;

    // Step 3: R1 に適用
    try {
      return applyRxnSmarts(r1Smiles, dynSmarts);
    } catch (_) {
      return [];
    }
  }

  // ── F-C アルキル化: カルボカチオン転位の解決 ──────────────────────────────
  //
  // F-C アルキル化では AlCl₃ がアルキルハライドからカルボカチオンを生成する。
  // 1° カチオンは不安定なため 1,2-H 転位や 1,2-Me 転位で安定なカチオンに変わる。
  //
  // 安定性: 3° > 2° > 1°（メチル）
  //
  // 例:
  //   n-PrCl  (1° 一次) → iPr (二次, 1,2-H転位)
  //   iBuCl   (1° 一次) → tBu (三次, 1,2-H転位)
  //   nBuCl   (1° 一次) → secBu (二次, 1,2-H転位)
  //   iPrCl   (2° 二次) → iPr (転位なし)
  //   tBuCl   (3° 三次) → tBu (転位なし)
  //   EtCl    (1° 一次) → C2H5（β 炭素が1°→有用な転位なし）
  //   BnCl    (共鳴安定) → CH2Ph（転位なし）
  //
  // returns { subId: string, rearranged: boolean }
  function resolveFCAlkylCation(r2can) {
    // ベンジルハライド: ベンジルカチオンは共鳴安定 → 転位なし
    if (hasSubstruct(r2can, 'c1ccccc1[CH2][Cl,Br,I]')) {
      return { subId: 'CH2Ph', rearranged: false };
    }

    // ── 1° ハライド（β 炭素の安定性に応じて転位）──────────────────────────

    // ネオペンチルハライド: (CH₃)₃C–CH₂–X
    //   β 炭素 = 4級 C(CH₃)₃ → 1,2-Me 転位 → (CH₃)₂C⁺–CH₂CH₃（3°, tert-アミル）
    //   原理: CH₃ が β→α に移動 → (CH₃)₂C⁺–CH₂CH₃
    //   生成物: 2-メチル-2-フェニルブタン（PhC(CH₃)₂CH₂CH₃）
    if (hasSubstruct(r2can, '[CX4;H2]([CX4;H0]([CH3])([CH3])[CH3])[Cl,Br,I]')) {
      return { subId: 'tAmyl', rearranged: true };
    }

    // イソブチルハライド: (CH₃)₂CH–CH₂–X
    //   β 炭素 = 3° → 1,2-H 転位 → tBu カチオン（3°）
    if (hasSubstruct(r2can, '[CX4;H2]([CX4;H1]([CH3])[CH3])[Cl,Br,I]')) {
      return { subId: 'tBu', rearranged: true };
    }

    // n-ブチルハライド: CH₃–CH₂–CH₂–CH₂–X
    //   β 炭素 = 2°（β にさらに CH₂CH₃ が続く） → 1,2-H 転位 → sec-Bu カチオン（2°）
    if (hasSubstruct(r2can, '[CX4;H2]([CX4;H2][CX4;H2][CH3])[Cl,Br,I]')) {
      return { subId: 'secBu', rearranged: true };
    }

    // n-プロピルハライド: CH₃–CH₂–CH₂–X
    //   β 炭素 = 2°（β に CH₃ が続く） → 1,2-H 転位 → iPr カチオン（2°）
    if (hasSubstruct(r2can, '[CX4;H2]([CX4;H2][CH3])[Cl,Br,I]')) {
      return { subId: 'iPr', rearranged: true };
    }

    // ── 3° ハライド（最安定、転位不要）───────────────────────────────────

    // tert-ブチルハライド: (CH₃)₃C–X
    if (hasSubstruct(r2can, '[CX4;H0]([CH3])([CH3])([CH3])[Cl,Br,I]')) {
      return { subId: 'tBu', rearranged: false };
    }
    // その他の 3° ハライド（汎用）
    if (hasSubstruct(r2can, '[CX4;H0]([CX4])([CX4])([CX4])[Cl,Br,I]')) {
      return { subId: 'tBu', rearranged: false };
    }

    // ── 2° ハライド（そのまま 2° カチオン、通常転位なし）─────────────────

    // sec-ブチルハライド: CH₃–CH(X)–CH₂–CH₃
    if (hasSubstruct(r2can, '[CX4;H1]([CH3])([CH2][CH3])[Cl,Br,I]')) {
      return { subId: 'secBu', rearranged: false };
    }
    // イソプロピルハライド: (CH₃)₂CH–X
    if (hasSubstruct(r2can, '[CX4;H1]([CH3])([CH3])[Cl,Br,I]')) {
      return { subId: 'iPr', rearranged: false };
    }
    // その他の 2° ハライド（汎用）
    if (hasSubstruct(r2can, '[CX4;H1]([CX4])([CX4])[Cl,Br,I]')) {
      return { subId: 'iPr', rearranged: false };
    }

    // ── 1° ハライド（β 炭素が 1° → 有用な転位なし）──────────────────────

    // エチルハライド: CH₃–CH₂–X（β が 1°: CH₃ → H 転位で 1° メチルカチオン → 不利）
    if (hasSubstruct(r2can, '[CX4;H2]([CH3])[Cl,Br,I]')) {
      return { subId: 'C2H5', rearranged: false };
    }
    // メチルハライド: CH₃–X
    if (hasSubstruct(r2can, '[CH3][Cl,Br,I]')) {
      return { subId: 'CH3', rearranged: false };
    }

    return { subId: 'CH3', rearranged: false }; // フォールバック
  }

  // ── SMILES リング番号の振り直し ───────────────────────────────────────────
  // テンプレート c1...cc1 (リング1) との衝突を防ぐため、フラグメント内の
  // リング番号を startRing 以降に置き換える。ブラケット [] 内の数字は除外。
  function renumberRings(smilesFragment, startRing) {
    startRing = startRing || 2;
    const ringMap = {};
    let nextRing = startRing;
    let inBracket = 0;
    let result = '';
    for (let i = 0; i < smilesFragment.length; i++) {
      const ch = smilesFragment[i];
      if (ch === '[') { inBracket++; result += ch; continue; }
      if (ch === ']') { inBracket--; result += ch; continue; }
      if (inBracket === 0 && ch >= '0' && ch <= '9') {
        if (!(ch in ringMap)) ringMap[ch] = nextRing++;
        result += ringMap[ch];
      } else {
        result += ch;
      }
    }
    return result;
  }

  // ── EAS 直接 SMILES 構築（SMARTS 反応が失敗した場合のフォールバック） ──────

  // ベンゼン誘導体に新置換基を導入した o/m/p 候補 SMILES を直接構築する。
  // 単置換ベンゼン → 3種（o,m,p）、無置換ベンゼン → 1種、その他 → []
  // newSubSmiles: 新たに導入するグループの SMILES 断片（例: 'CC', '[N+](=O)[O-]'）
  //
  // ※ 既存置換基はブランチ記法 c1(${xSmarts})... で表記する。
  //   先頭原子がリング炭素と結合するため、
  //   NO2([N+](=O)[O-]) や SO3H(S(=O)(=O)O) も末尾 O ではなく N/S が正しく結合する。
  // ※ skipTemplate:true の置換基（COAr等）はテンプレート構築に使えない。
  function buildEASCandidates(r1Smiles, newSubSmiles) {
    if (!newSubSmiles) return [];
    const subs = detectRingSubstituents(r1Smiles);
    // テンプレート構築に使える置換基のみ絞り込む（skipTemplate フラグ除外）
    const usableSubs = subs.filter(s => !s.def.skipTemplate);
    // 新置換基 Z: リング番号を2以降に正規化（テンプレートのリング1と衝突防止）
    const Z = renumberRings(newSubSmiles, 2);

    // 無置換ベンゼン or usable置換基なし
    if (usableSubs.length === 0) {
      if (subs.length === 0) {
        // 完全無置換ベンゼン: 全位置等価 → 1種
        const s = tryCanonSmiles(`c1ccc(${Z})cc1`);
        return s ? [s] : [];
      }
      // skipTemplate のみ（COAr等）→ applyRxnSmarts に委ねる
      return [];
    }

    // 単置換ベンゼン（usable 1種の置換基 × 1個）
    if (usableSubs.length === 1 && usableSubs[0].count === 1) {
      // SUB_DEF の smarts をブランチ SMILES として使用
      // ブランチ記法なら先頭原子がリング炭素に結合するので NO2/SO3H も正しく接続される
      const X = renumberRings(usableSubs[0].def.smarts, 2);
      const templates = [
        `c1(${X})ccc(${Z})cc1`,  // para (1,4)
        `c1(${X})cc(${Z})ccc1`,  // meta (1,3)
        `c1(${X})c(${Z})cccc1`,  // ortho (1,2)
      ];
      return [...new Set(templates.map(t => tryCanonSmiles(t)).filter(Boolean))];
    }

    // 同じ置換基 ×2（ジ置換ベンゼン）
    if (usableSubs.length === 1 && usableSubs[0].count === 2) {
      const X = renumberRings(usableSubs[0].def.smarts, 2);
      const relPos = detectPos2(r1Smiles, usableSubs[0].def.smarts, usableSubs[0].def.smarts);
      let templates = [];
      if (relPos === 'o') {
        // 1,2-ジX: Z の候補位置 3,4,5,6（対称性より3≡6, 4≡5）
        templates = [
          `c1(${X})c(${X})c(${Z})ccc1`,   // pos 3
          `c1(${X})c(${X})cc(${Z})cc1`,   // pos 4
        ];
      } else if (relPos === 'm') {
        // 1,3-ジX: 対称性より pos 2, 4(≡6), 5 の3種
        templates = [
          `c1(${X})c(${Z})c(${X})ccc1`,   // pos 2（X間）
          `c1(${X})cc(${X})c(${Z})cc1`,   // pos 4
          `c1(${X})cc(${X})cc(${Z})c1`,   // pos 5
        ];
      } else if (relPos === 'p') {
        // 1,4-ジX: 対称性より pos 2(≡3≡5≡6)の1種
        templates = [
          `c1(${X})c(${Z})cc(${X})cc1`,   // pos 2
        ];
      } else {
        // 位置不明: 全パターン試行
        templates = [
          `c1(${X})c(${X})c(${Z})ccc1`,
          `c1(${X})c(${X})cc(${Z})cc1`,
          `c1(${X})c(${Z})c(${X})ccc1`,
          `c1(${X})cc(${X})c(${Z})cc1`,
          `c1(${X})cc(${X})cc(${Z})c1`,
          `c1(${X})c(${Z})cc(${X})cc1`,
        ];
      }
      return [...new Set(templates.map(t => tryCanonSmiles(t)).filter(Boolean))];
    }

    // 2種の異なる置換基（各1個）
    if (usableSubs.length >= 2 && usableSubs[0].count === 1 && usableSubs[1].count === 1) {
      const X = renumberRings(usableSubs[0].def.smarts, 2);
      const Y = renumberRings(usableSubs[1].def.smarts, 2);
      const relPos = detectPos2(r1Smiles, usableSubs[0].def.smarts, usableSubs[1].def.smarts);
      let templates = [];
      if (relPos === 'o') {
        // X:1, Y:2（隣接）: Z の候補位置 3,4,5,6
        templates = [
          `c1(${X})c(${Y})c(${Z})ccc1`,  // pos 3 (Y の隣)
          `c1(${X})c(${Y})cc(${Z})cc1`,  // pos 4
          `c1(${X})c(${Y})ccc(${Z})c1`,  // pos 5
          `c1(${Z})c(${X})c(${Y})ccc1`,  // pos 6 (X の反対側)
        ];
      } else if (relPos === 'm') {
        // X:1, Y:3（1個置き）: Z の候補位置 2,4,5,6
        templates = [
          `c1(${X})c(${Z})c(${Y})ccc1`,  // pos 2 (XY間)
          `c1(${X})cc(${Y})c(${Z})cc1`,  // pos 4 (Y 隣)
          `c1(${X})cc(${Y})cc(${Z})c1`,  // pos 5
          `c1(${Z})c(${X})cc(${Y})cc1`,  // pos 6 (X 隣)
        ];
      } else if (relPos === 'p') {
        // X:1, Y:4（パラ）: Z の候補位置 2(=6), 3(=5) の2種
        templates = [
          `c1(${X})c(${Z})cc(${Y})cc1`,  // pos 2 (X の隣, Y のメタ)
          `c1(${X})cc(${Z})c(${Y})cc1`,  // pos 3 (X のメタ, Y の隣)
        ];
      } else {
        // 位置不明: 全パターン試行
        templates = [
          `c1(${X})c(${Y})c(${Z})ccc1`,
          `c1(${X})c(${Y})cc(${Z})cc1`,
          `c1(${X})c(${Y})ccc(${Z})c1`,
          `c1(${Z})c(${X})c(${Y})ccc1`,
          `c1(${X})c(${Z})c(${Y})ccc1`,
          `c1(${X})cc(${Y})c(${Z})cc1`,
          `c1(${X})cc(${Y})cc(${Z})c1`,
          `c1(${Z})c(${X})cc(${Y})cc1`,
          `c1(${X})c(${Z})cc(${Y})cc1`,
          `c1(${X})cc(${Z})c(${Y})cc1`,
        ];
      }
      return [...new Set(templates.map(t => tryCanonSmiles(t)).filter(Boolean))];
    }

    // それ以外（3種以上の置換基等）: 対応なし
    return [];
  }

  // ── ベンゼン置換基の検出 ─────────────────────────────────────────────────

  // ベンゼン環上の置換基を検出してカウントを返す
  // [{def: SUB_DEF entry, count: number}] (priが小さい順でソート)
  //
  // 「橋渡し型」官能基（ジフェニルメタンの CH₂、ベンゾフェノンの C=O 等）は
  // 両端の環炭素からそれぞれマッチするため、置換基の第1原子（atoms[1]）の
  // インデックスで重複排除して正しいカウントを算出する。
  function detectRingSubstituents(smiles) {
    const result = [];
    for (const def of SUB_DEF) {
      const matches = getAllMatches(smiles, `[c:1]${def.smarts}`);
      if (matches.length === 0) continue;

      // atoms[0] = リング炭素 [c:1], atoms[1] = 置換基の第1原子
      // 同一の第1原子インデックスを持つマッチを1個と数える（橋渡し重複除去）
      const seenFirstAtom = new Set();
      let uniqueCount = 0;
      for (const match of matches) {
        const atoms = (match && match.atoms) ? match.atoms
          : (Array.isArray(match) ? match : []);
        if (atoms.length < 2) { uniqueCount++; continue; }
        const key = String(atoms[1]);
        if (!seenFirstAtom.has(key)) {
          seenFirstAtom.add(key);
          uniqueCount++;
        }
      }
      if (uniqueCount > 0) result.push({ def, count: uniqueCount });
    }
    return result.sort((a, b) => a.def.pri - b.def.pri);
  }

  // 2置換ベンゼン上での2つの置換基の相対位置を返す ('o'|'m'|'p'|null)
  // s1, s2: 置換基 SMARTS 文字列（例: 'Br', '[N+](=O)[O-]'）
  //
  // ブランチ記法 c1(s1)...c(s2)... を使うことで、NO2([N+](=O)[O-]) や
  // SO3H(S(=O)(=O)O) 等も先頭原子（N,S）がリング炭素と正しく結合する。
  function detectPos2(smiles, s1, s2) {
    if (hasSubstruct(smiles, `c1(${s1})ccc(${s2})cc1`) ||
        hasSubstruct(smiles, `c1(${s2})ccc(${s1})cc1`)) return 'p';
    if (hasSubstruct(smiles, `c1(${s1})cc(${s2})ccc1`) ||
        hasSubstruct(smiles, `c1(${s2})cc(${s1})ccc1`)) return 'm';
    if (hasSubstruct(smiles, `c1(${s1})c(${s2})cccc1`) ||
        hasSubstruct(smiles, `c1(${s2})c(${s1})cccc1`)) return 'o';
    return null;
  }

  // ── 命名: グリニャール試薬 ──────────────────────────────────────────────────

  function nameGrignard(smiles) {
    // フェニルマグネシウムブロミド
    if (hasSubstruct(smiles, 'c1ccccc1[Mg]') || hasSubstruct(smiles, '[Mg]c1ccccc1')) {
      return 'フェニルマグネシウムブロミド（PhMgBr）';
    }
    // ベンジルマグネシウムクロリド
    if (hasSubstruct(smiles, 'c1ccccc1C[Mg]') || hasSubstruct(smiles, '[Mg]Cc1ccccc1')) {
      return 'ベンジルマグネシウムクロリド（BnMgCl）';
    }
    // アルキルグリニャール: 炭素数で判断
    const can = canonSmiles(smiles);
    if (can) {
      const cCount = (can.match(/[Cc]/g) || []).filter(c => c === 'C' || c === 'c').length;
      const prefixes = ['', 'メチル', 'エチル', 'プロピル', 'ブチル', 'ペンチル'];
      const prefix = prefixes[cCount] || `C${cCount}`;
      const halide = hasSubstruct(smiles, '[Mg]Cl') ? 'クロリド' : 'ブロミド';
      return `${prefix}マグネシウム${halide}（${prefix.replace('ル','')}-MgX）`;
    }
    const formula = getFormula(smiles);
    return formula ? `グリニャール試薬（${formula}）` : 'グリニャール試薬';
  }

  // ── 命名: ベンゼン誘導体 ─────────────────────────────────────────────────

  const POS_PREFIX_2 = { o: 'o-', m: 'm-', p: 'p-' };
  const POS_NUM_2    = { o: '1,2-', m: '1,3-', p: '1,4-' };
  const N_PREFIX     = ['', '', 'ジ', 'トリ', 'テトラ', 'ペンタ'];

  // 1置換ベンゼンの慣用名・IUPAC 親化合物名
  const BENZENE_MONO_TRIVIAL = {
    'N2+':  'ベンゼンジアゾニウム',
    'COOH': '安息香酸',
    'SO3H': 'ベンゼンスルホン酸',
    'CHO':  'ベンズアルデヒド',
    'OH':   'フェノール',
    'NH2':  'アニリン',
    'CH3':  'トルエン',
  };

  // 2置換ベンゼン命名における親化合物（IUPAC PCG 優先順位：高→低）
  // IUPAC 2013: o/m/p は廃止し数値ロカントで統一（3-ニトロ安息香酸 / 3-ニトロトルエン）
  const PCG_PARENT_PRIORITY = [
    { id: 'COOH', name: '安息香酸',        type: 'acid'     },
    { id: 'SO3H', name: 'ベンゼンスルホン酸', type: 'acid'  },
    { id: 'CHO',  name: 'ベンズアルデヒド', type: 'acid'    },
    { id: 'COAr', name: 'ベンゾフェノン',   type: 'acid'    },
    { id: 'COR',  name: 'アセトフェノン',   type: 'acid'    },
    { id: 'OH',   name: 'フェノール',       type: 'retained' },
    { id: 'NH2',  name: 'アニリン',         type: 'retained' },
    { id: 'CH3',  name: 'トルエン',         type: 'retained' },
  ];

  // 相対位置 o/m/p → 「他方の位置番号」（親が位置1のとき）
  const POS_OTHER_NUM = { o: 2, m: 3, p: 4 };

  function nameBenzene(smiles) {
    const subs = detectRingSubstituents(smiles);
    const total = subs.reduce((n, s) => n + s.count, 0);

    if (total === 0) return 'ベンゼン';

    // ── 1置換 ──────────────────────────────────────────────────────────────
    if (total === 1) {
      const trivial = BENZENE_MONO_TRIVIAL[subs[0].def.id];
      if (trivial) return trivial;
      return subs[0].def.nameJa + 'ベンゼン';
    }

    // ── 2置換 ──────────────────────────────────────────────────────────────
    if (total === 2) {
      if (subs.length === 1) {
        // 同じ置換基 ×2
        const { def } = subs[0];
        const pos = detectPos2(smiles, def.smarts, def.smarts);
        return (POS_NUM_2[pos] || '') + 'ジ' + def.nameJa + 'ベンゼン';
      } else {
        // 異種2置換 ─ IUPAC 命名
        const [a, b] = [subs[0].def, subs[1].def];
        const pos = detectPos2(smiles, a.smarts, b.smarts);

        // (1) PCG 親化合物チェック（優先度順に両方を検索）
        const subIds = new Set([a.id, b.id]);
        for (const pcg of PCG_PARENT_PRIORITY) {
          if (!subIds.has(pcg.id)) continue;
          const otherDef = a.id === pcg.id ? b : a;
          // IUPAC 2013: o/m/p を廃し数値ロカントに統一（P-14.3.1）
          const posNum = POS_OTHER_NUM[pos] || '';
          return `${posNum}-${otherDef.nameJa}${pcg.name}`;
        }

        // (2) PCG なし: IUPAC アルファベット順
        // alpha 昇順の方が位置 1 を取る
        const [first, second] = (a.alpha || a.id) <= (b.alpha || b.id) ? [a, b] : [b, a];
        const posNum = POS_OTHER_NUM[pos] || '';
        return `1-${first.nameJa}-${posNum}-${second.nameJa}ベンゼン`;
      }
    }

    // ── 3置換 ──────────────────────────────────────────────────────────────
    if (total === 3) {
      if (subs.length === 1) {
        // 同じ置換基 ×3（ブランチ記法）
        const t = subs[0].def.smarts;
        const n = subs[0].def.nameJa;
        if (hasSubstruct(smiles, `c1(${t})c(${t})c(${t})ccc1`)) return '1,2,3-トリ' + n + 'ベンゼン';
        if (hasSubstruct(smiles, `c1(${t})c(${t})cc(${t})cc1`) ||
            hasSubstruct(smiles, `c1(${t})cc(${t})c(${t})cc1`)) return '1,2,4-トリ' + n + 'ベンゼン';
        if (hasSubstruct(smiles, `c1(${t})cc(${t})cc(${t})c1`)) return '1,3,5-トリ' + n + 'ベンゼン';
        return 'トリ' + n + 'ベンゼン';
      }
      // 混合3置換: PCG 親があれば親名を基準に命名
      const subIds3 = subs.map(s => s.def.id);
      for (const pcg of PCG_PARENT_PRIORITY) {
        const pcgSub = subs.find(s => s.def.id === pcg.id && s.count === 1);
        if (!pcgSub) continue;
        const others = subs.filter(s => s.def.id !== pcg.id);
        // 各置換基の位置を検出して番号付き名称を構築
        const parts = [];
        for (const o of others) {
          const oPos = detectPos2(smiles, pcgSub.def.smarts, o.def.smarts);
          const posNum = POS_OTHER_NUM[oPos] || '?';
          const cnt = o.count > 1 ? (N_PREFIX[o.count] || '') : '';
          parts.push(`${posNum}-${cnt}${o.def.nameJa}`);
        }
        parts.sort((a, b) => (parseInt(a, 10) || 0) - (parseInt(b, 10) || 0));
        return parts.join('-') + pcg.name;
      }
      // PCG なし: 置換基名を羅列
      const names3 = subs.map(s => (s.count > 1 ? (N_PREFIX[s.count] || '') + s.def.nameJa : s.def.nameJa)).join('-');
      return names3 + 'ベンゼン';
    }

    // ── 4置換以上 ──────────────────────────────────────────────────────────
    if (total === 4 && subs.length === 1) {
      return 'テトラ' + subs[0].def.nameJa + 'ベンゼン';
    }

    // 多置換: 置換基名を羅列
    const names = subs.map(s => (s.count > 1 ? (N_PREFIX[s.count] || '') + s.def.nameJa : s.def.nameJa)).join('-');
    return names + 'ベンゼン';
  }

  // ── 命名: 脂肪族化合物 ─────────────────────────────────────────────────────

  // 炭素鎖プレフィックス（IUPAC）
  const CHAIN_PREFIX_JA = ['', 'メタ', 'エタ', 'プロパ', 'ブタ', 'ペンタ', 'ヘキサ', 'ヘプタ', 'オクタ', 'ノナ', 'デカ'];

  // Canonical SMILES 中の脂肪族炭素数を数える
  // 'C' = 脂肪族炭素, 'Cl' = 塩素（スキップ）
  function countAliphC(can) {
    let n = 0;
    for (let i = 0; i < can.length; i++) {
      if (can[i] === 'C') {
        if (can[i + 1] === 'l') { i++; continue; } // Cl = 塩素
        n++;
      }
    }
    return n;
  }

  // 系統名パターンテーブル（canonSmiles で突合）
  const ALIC_NAMED = [
    // ── 無機・小分子 ──
    ['O',            '水（H₂O）'],
    ['OO',           '過酸化水素（H₂O₂）'],
    ['N',            'アンモニア（NH₃）'],
    ['C(=O)=O',      '二酸化炭素（CO₂）'],
    ['[C-]#[O+]',    '一酸化炭素（CO）'],
    ['[C]#[O]',      '一酸化炭素（CO）'],
    ['C=O',          'ホルムアルデヒド（メタナール）'],
    // ── アルカン ──
    ['C',            'メタン'],
    ['CC',           'エタン'],
    ['CCC',          'プロパン'],
    ['CCCC',         'n-ブタン'],
    ['CC(C)C',       'イソブタン（2-メチルプロパン）'],
    ['CCCCC',        'n-ペンタン'],
    ['CC(C)CC',      'イソペンタン（2-メチルブタン）'],
    ['CC(C)(C)C',    'ネオペンタン（2,2-ジメチルプロパン）'],
    ['CCCCCC',       'n-ヘキサン'],
    ['CCCCCCC',      'n-ヘプタン'],
    ['CCCCCCCC',     'n-オクタン'],
    // ── シクロアルカン ──
    ['C1CC1',        'シクロプロパン'],
    ['C1CCC1',       'シクロブタン'],
    ['C1CCCC1',      'シクロペンタン'],
    ['C1CCCCC1',     'シクロヘキサン'],
    ['C1=CCCCC1',    'シクロヘキセン'],
    ['OC1CCCCC1',    'シクロヘキサノール'],
    ['CC1CCCCC1',    'メチルシクロヘキサン'],
    ['CCC1CCCCC1',   'エチルシクロヘキサン'],
    ['CC(C)C1CCCCC1','イソプロピルシクロヘキサン'],
    // ── アルケン ──
    ['C=C',          'エチレン（エテン）'],
    ['C=CC',         'プロペン（プロピレン）'],
    ['C=CCC',        '1-ブテン'],
    ['CC=CC',        '2-ブテン'],
    ['C=C(C)C',      'イソブテン（2-メチルプロペン）'],
    ['C=CCCC',       '1-ペンテン'],
    ['CC=CCC',       '2-ペンテン'],
    // ── アルキン ──
    ['C#C',          'アセチレン（エチン）'],
    ['C#CC',         'プロピン'],
    ['C#CCC',        '1-ブチン'],
    ['CC#CC',        '2-ブチン'],
    // ── カルボン酸塩（アニオン）──
    ['CC([O-])=O',   '酢酸イオン（アセタート）'],
    ['C([O-])=O',    'ギ酸イオン（ホルマート）'],
    ['CCC([O-])=O',  'プロパン酸イオン'],
    ['CCCC([O-])=O', 'ブタン酸イオン'],
    // ── アルコール ──
    ['CO',           'メタノール'],
    ['CCO',          'エタノール'],
    ['CCCO',         'プロパン-1-オール（1-プロパノール）'],
    ['CC(O)C',       'プロパン-2-オール（イソプロパノール）'],
    ['CCCCO',        'ブタン-1-オール（1-ブタノール）'],
    ['CC(O)CC',      'ブタン-2-オール'],
    ['CC(C)CO',      '2-メチルプロパン-1-オール（イソブタノール）'],
    ['CC(C)(O)C',    '2-メチルプロパン-2-オール（tert-ブタノール）'],
    ['CCCCCO',       'ペンタン-1-オール'],
    ['CC(O)CCC',     'ペンタン-2-オール'],
    ['CCC(O)CC',     'ペンタン-3-オール'],
    ['CCCCCCO',      'ヘキサン-1-オール'],
    ['OCCO',         'エチレングリコール（エタン-1,2-ジオール）'],
    ['OCC(O)CO',     'グリセリン（プロパン-1,2,3-トリオール）'],
    // ── アルデヒド ──
    ['CC=O',         'アセトアルデヒド（エタナール）'],
    ['CCC=O',        'プロパナール'],
    ['CCCC=O',       'ブタナール'],
    ['CC(C)C=O',     '2-メチルプロパナール（イソブタナール）'],
    // ── ケトン ──
    ['CC(C)=O',      'アセトン（プロパン-2-オン）'],
    ['CCC(C)=O',     'メチルエチルケトン（ブタン-2-オン）'],
    ['CCCC(C)=O',    'メチルプロピルケトン（ペンタン-2-オン）'],
    ['CCC(CC)=O',    'ジエチルケトン（ペンタン-3-オン）'],
    // ── カルボン酸 ──
    ['C(O)=O',       'ギ酸（メタン酸）'],
    ['CC(O)=O',      '酢酸（エタン酸）'],
    ['CCC(O)=O',     'プロパン酸（プロピオン酸）'],
    ['CCCC(O)=O',    'ブタン酸（酪酸）'],
    ['CC(C)C(O)=O',  '2-メチルプロパン酸（イソ酪酸）'],
    ['CCCCC(O)=O',   'ペンタン酸（吉草酸）'],
    ['CCCCCC(O)=O',  'ヘキサン酸（カプロン酸）'],
    ['OC(=O)C=C',    'アクリル酸（プロペン酸）'],
    ['OC(=O)CC(O)=O','マロン酸（プロパン二酸）'],
    ['OC(=O)CCC(O)=O','コハク酸（ブタン二酸）'],
    // ── エステル ──
    ['COC(C)=O',     '酢酸メチル'],
    ['CCOC(C)=O',    '酢酸エチル'],
    ['CCCOC(C)=O',   '酢酸プロピル'],
    ['CCCCOC(C)=O',  '酢酸ブチル'],
    ['COC(CC)=O',    'プロパン酸メチル（プロピオン酸メチル）'],
    ['CCOC(CC)=O',   'プロパン酸エチル（プロピオン酸エチル）'],
    ['COC(CCC)=O',   'ブタン酸メチル（酪酸メチル）'],
    // ── 酸塩化物 ──
    ['CC(=O)Cl',         '塩化アセチル（塩化エタノイル）'],
    ['CCC(=O)Cl',        '塩化プロピオニル（塩化プロパノイル）'],
    ['CCCC(=O)Cl',       '塩化ブチリル（塩化ブタノイル）'],
    // ── ハロゲン化アルキル ──
    ['CCl',              'クロロメタン（塩化メチル）'],
    ['CBr',              'ブロモメタン（臭化メチル）'],
    ['CI',               'ヨードメタン（ヨウ化メチル）'],
    ['ClCCl',            'ジクロロメタン（塩化メチレン）'],
    ['ClC(Cl)Cl',        'クロロホルム（トリクロロメタン）'],
    ['ClC(Cl)(Cl)Cl',    '四塩化炭素（テトラクロロメタン）'],
    ['BrCBr',            'ジブロモメタン'],
    ['BrC(Br)Br',        'トリブロモメタン（ブロモホルム）'],
    ['BrC(Br)(Br)Br',    '四臭化炭素'],
    // エタン系 多段階塩素化
    ['CCCl',             'クロロエタン（塩化エチル）'],
    ['CCBr',             'ブロモエタン（臭化エチル）'],
    ['CCI',              'ヨードエタン（ヨウ化エチル）'],
    ['ClCCCl',           '1,2-ジクロロエタン'],
    ['ClCC(Cl)Cl',       '1,1,2-トリクロロエタン'],
    ['ClC(Cl)C(Cl)Cl',   '1,1,2,2-テトラクロロエタン'],
    ['ClC(Cl)(Cl)C(Cl)Cl',  '1,1,1,2,2-ペンタクロロエタン'],
    ['ClC(Cl)(Cl)C(Cl)(Cl)Cl','ヘキサクロロエタン（パークロロエタン）'],
    ['BrCCBr',           '1,2-ジブロモエタン（エチレンブロミド）'],
    ['BrCC(Br)Br',       '1,1,2-トリブロモエタン'],
    // プロパン系 多段階塩素化
    ['CCCCl',            '1-クロロプロパン'],
    ['CC(Cl)C',          '2-クロロプロパン（塩化イソプロピル）'],
    ['ClCCCCl',          '1,3-ジクロロプロパン'],
    ['ClCC(Cl)CCl',      '1,2,3-トリクロロプロパン'],
    ['ClC(Cl)C(Cl)CCl',  '1,1,2,3-テトラクロロプロパン'],
    ['ClC(Cl)C(Cl)C(Cl)Cl','1,1,2,3,3-ペンタクロロプロパン'],
    // ブタン系
    ['CCCBr',            '1-ブロモプロパン（臭化n-プロピル）'],
    ['CC(Br)C',          '2-ブロモプロパン（臭化イソプロピル）'],
    ['CCCCBr',           '1-ブロモブタン'],
    ['CC(Br)CC',         '2-ブロモブタン'],
    ['CCCCCl',           '1-クロロブタン'],
    ['CCC(Cl)C',         '2-クロロブタン'],
    ['ClCCCCCl',         '1,4-ジクロロブタン'],
    ['ClCC(C)(C)Cl',     '1,2-ジクロロ-2-メチルプロパン'],
    // ── アミン ──
    ['CN',           'メチルアミン'],
    ['CCN',          'エチルアミン'],
    ['CCCN',         'n-プロピルアミン'],
    ['CC(N)C',       'イソプロピルアミン'],
    ['CCCCN',        'n-ブチルアミン'],
    ['CNC',          'ジメチルアミン'],
    ['CN(C)C',       'トリメチルアミン'],
    ['CCNCC',        'ジエチルアミン'],
    // ── アミド ──
    ['NC=O',         'ホルムアミド（メタンアミド）'],
    ['CC(N)=O',      'アセトアミド（エタンアミド）'],
    ['CCC(N)=O',     'プロパンアミド'],
    ['CCCC(N)=O',    'ブタンアミド'],
    // ── エーテル ──
    ['COC',          'ジメチルエーテル（メトキシメタン）'],
    ['CCOCC',        'ジエチルエーテル（エトキシエタン）'],
    ['CCOC',         'メトキシエタン（メチルエチルエーテル）'],
    // ── 脂肪酸（高分子） ──
    ['CCCCCCCCCCCCCCCC(O)=O',   'パルミチン酸（C16）'],
    ['CCCCCCCCCCCCCCCCCC(O)=O', 'ステアリン酸（C18）'],
  ];

  // 系統名パターンテーブルを canonical SMILES でキャッシュ
  let _alicCache = null;
  function _getAlicCache() {
    if (_alicCache) return _alicCache;
    _alicCache = new Map();
    for (const [pSmi, name] of ALIC_NAMED) {
      try {
        const c = canonSmiles(pSmi);
        if (c) _alicCache.set(c, name);
      } catch (_) {}
    }
    return _alicCache;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // [共通] RDKit-JSON 重原子グラフ（V2方式）
  function _molGraph(smiles) {
    const rdk = RDK(); if (!rdk || !smiles) return null;
    let mol;
    try {
      mol = rdk.get_mol(smiles); if (!mol) return null;
      const js = mol.get_json(); mol.delete(); mol = null;
      const j = JSON.parse(js); const md = j.molecules && j.molecules[0]; if (!md) return null;
      const aDef = (j.defaults && j.defaults.atom) || {}, bDef = (j.defaults && j.defaults.bond) || {};
      const defZ = aDef.z !== undefined ? aDef.z : 6, defHs = aDef.impHs !== undefined ? aDef.impHs : 0;
      const defBo = bDef.bo !== undefined ? bDef.bo : 1;
      const atoms = (md.atoms || []).map(a => ({ z: a.z !== undefined ? a.z : defZ, impHs: a.impHs !== undefined ? a.impHs : defHs }));
      const adj = atoms.map(() => []);
      for (const b of (md.bonds || [])) {
        const i = b.atoms[0], k = b.atoms[1], bo = b.bo !== undefined ? b.bo : defBo;
        adj[i].push({ to: k, bo }); adj[k].push({ to: i, bo });
      }
      return { atoms, adj };
    } catch (_) { if (mol) try { mol.delete(); } catch (e) {} return null; }
  }
  function _isRingGraph(g) {
    const N = g.atoms.length; if (!N) return false;
    let edges = 0; for (const a of g.adj) edges += a.length; edges /= 2;
    const seen = new Array(N).fill(false); let comp = 0;
    for (let i = 0; i < N; i++) { if (seen[i]) continue; comp++; const st = [i]; seen[i] = true;
      while (st.length) { const u = st.pop(); for (const e of g.adj[u]) if (!seen[e.to]) { seen[e.to] = true; st.push(e.to); } } }
    return edges > N - comp;
  }
  function _longestCarbonChain(g) {
    const isC = i => g.atoms[i].z === 6;
    const cnb = i => g.adj[i].filter(e => isC(e.to)).map(e => e.to);
    const carbons = []; for (let i = 0; i < g.atoms.length; i++) if (isC(i)) carbons.push(i);
    if (!carbons.length) return [];
    const bfsFar = src => { const prev = new Map(), seen = new Set([src]); let q = [src], far = src;
      while (q.length) { const nq = []; for (const u of q) for (const v of cnb(u)) if (!seen.has(v)) { seen.add(v); prev.set(v, u); nq.push(v); far = v; } q = nq; } return { far, prev }; };
    const a = bfsFar(carbons[0]).far; const { far: b, prev } = bfsFar(a);
    const path = []; let cur = b; while (cur !== undefined) { path.push(cur); cur = prev.get(cur); } return path;
  }
  function _locantsInChain(chain, cIdx) {
    const L = chain.length; const posOf = i => chain.indexOf(i);
    const fwd = cIdx.map(i => posOf(i) + 1).sort((x, y) => x - y);
    const rev = cIdx.map(i => L - posOf(i)).sort((x, y) => x - y);
    for (let k = 0; k < fwd.length; k++) if (fwd[k] !== rev[k]) return fwd[k] < rev[k] ? fwd : rev;
    return fwd;
  }
  function _hydroxylCarbons(g) { const cs = [];
    for (let i = 0; i < g.atoms.length; i++) { const a = g.atoms[i];
      if (a.z === 8 && a.impHs >= 1) for (const e of g.adj[i]) if (e.bo === 1 && g.atoms[e.to].z === 6) cs.push(e.to); } return cs; }
  function _carbonylCarbons(g) { const ket = [], ald = [];
    for (let i = 0; i < g.atoms.length; i++) { if (g.atoms[i].z !== 6) continue;
      if (!g.adj[i].some(e => e.bo === 2 && g.atoms[e.to].z === 8)) continue;
      // カルボニル炭素の他の結合先が C/H のみのときだけ ケトン/アルデヒド。
      // O(=酸/エステル)・N(=アミド)・ハロ(=酸ハロ) が付く C=O は上位クラス → 除外
      const others = g.adj[i].filter(e => !(e.bo === 2 && g.atoms[e.to].z === 8));
      if (others.some(e => { const z = g.atoms[e.to].z; return z !== 6 && z !== 1; })) continue;
      const cN = g.adj[i].filter(e => g.atoms[e.to].z === 6).length; if (cN >= 2) ket.push(i); else ald.push(i); }
    return { ket, ald }; }
  const _PARENT_JA = ['', 'メタン','エタン','プロパン','ブタン','ペンタン','ヘキサン','ヘプタン','オクタン','ノナン','デカン'];
  const _MULTI_JA  = { 2:'ジ', 3:'トリ', 4:'テトラ', 5:'ペンタ', 6:'ヘキサ' };
  const carbonDegree = (g, ci) => g.adj[ci].filter(e => g.atoms[e.to].z === 6).length;

  // 分岐(直鎖アルキル)の炭素数（分岐内分岐は -1）
  function _branchSize(g, start, from) {
    const cnb = i => g.adj[i].filter(e => g.atoms[e.to].z === 6).map(e => e.to);
    let cnt = 0, prev = from, cur = start;
    while (true) { cnt++; const nxt = cnb(cur).filter(x => x !== prev);
      if (nxt.length === 0) break; if (nxt.length > 1) return -1; prev = cur; cur = nxt[0]; }
    return cnt;
  }
  // カルボン酸の主鎖命名（単一COOH・非環, COOH=C1, 分岐/ハロ/不飽和対応, P-65）
  function _nameCarboxylicAcidGraph(g) {
    const cooh = [];
    for (let i = 0; i < g.atoms.length; i++) {
      if (g.atoms[i].z !== 6) continue;
      const dblO = g.adj[i].some(e => e.bo === 2 && g.atoms[e.to].z === 8);
      const ohO  = g.adj[i].some(e => e.bo === 1 && g.atoms[e.to].z === 8 && g.atoms[e.to].impHs >= 1);
      if (dblO && ohO) cooh.push(i);
    }
    if (cooh.length !== 1) return null;
    const c1 = cooh[0];
    const isC = i => g.atoms[i].z === 6;
    const cnb = i => g.adj[i].filter(e => isC(e.to)).map(e => e.to);
    if (cnb(c1).length > 1) return null;                    // COOH炭素は末端のはず
    const bondOrder = (i, j) => { for (const e of g.adj[i]) if (e.to === j) return e.bo; return 1; };
    // c1 起点で最長炭素パス
    const prev = new Map(), seen = new Set([c1]); let q = [c1], far = c1;
    while (q.length) { const nq = []; for (const u of q) for (const v of cnb(u)) if (!seen.has(v)) { seen.add(v); prev.set(v, u); nq.push(v); far = v; } q = nq; }
    const chain = []; let cur = far; while (cur !== undefined) { chain.push(cur); cur = prev.get(cur); }
    chain.reverse();                                        // c1..far（c1=位置1）
    const n = chain.length; if (n < 1 || n > 10) return null;
    const posOf = {}; chain.forEach((ai, k) => posOf[ai] = k + 1);
    const ene = [], yne = [];
    for (let k = 0; k + 1 < chain.length; k++) { const o = bondOrder(chain[k], chain[k + 1]); if (o === 2) ene.push(k + 1); else if (o === 3) yne.push(k + 1); }
    const subs = [];
    for (const ai of chain) for (const e of g.adj[ai]) {
      const w = g.atoms[e.to];
      if (w.z === 6 && posOf[e.to]) continue;               // 主鎖内結合
      if (w.z === 6) { const sz = _branchSize(g, e.to, ai); if (sz < 0 || sz > 6) return null; subs.push({ loc: posOf[ai], ja: V1_ALKYL_JA[sz], en: V1_ALKYL_EN[sz] }); }
      else if (V1_HALO[w.z]) subs.push({ loc: posOf[ai], ja: V1_HALO[w.z].ja, en: V1_HALO[w.z].en });
      else if (w.z === 8) {                                 // 酸素: COOH は除外、他は ヒドロキシ/オキソ
        if (ai === c1) continue;                            // COOH の =O / -OH
        if (e.bo === 2) subs.push({ loc: posOf[ai], ja: 'オキソ', en: 'oxo' });
        else if (w.impHs >= 1) subs.push({ loc: posOf[ai], ja: 'ヒドロキシ', en: 'hydroxy' });
        else return null;                                   // エーテル等 → 対象外
      }
      else if (w.z === 7) {                                 // 窒素: 一級アミノのみ接頭辞化
        if (e.bo === 1 && w.impHs >= 1) subs.push({ loc: posOf[ai], ja: 'アミノ', en: 'amino' });
        else return null;                                   // アミド/ニトリル等 → 対象外
      }
      else if (w.z === 1) { /* H */ }
      else return null;                                     // その他ヘテロ → 対象外
    }
    let acidWord;
    if (!ene.length && !yne.length) acidWord = V1_ALKANE_STEM[n] + 'ン酸';
    else { let s = V1_ALKANE_STEM[n];
      if (ene.length) s += '-' + ene.join(',') + '-' + (V1_MULT[ene.length] || '') + 'エン';
      if (yne.length) s += '-' + yne.join(',') + '-' + (V1_MULT[yne.length] || '') + 'イン';
      acidWord = s + '酸'; }
    const groups = {}; for (const s of subs) (groups[s.en] || (groups[s.en] = { ja: s.ja, locs: [] })).locs.push(s.loc);
    const keys = Object.keys(groups).sort();
    const tokens = keys.map(k => { const gp = groups[k]; gp.locs.sort((x, y) => x - y); return gp.locs.join(',') + '-' + (V1_MULT[gp.locs.length] || '') + gp.ja; });
    return tokens.join('-') + acidWord;   // 接頭辞は母体に直結（3-メチルブタン酸）
  }

  // アシル鎖命名: c1(=カルボニル/ニトリル炭素, 末端)を C1 とする主鎖の
  // {接頭辞, 母体語幹, 炭素数} を返す。酸/エステル/アミド/ニトリル/酸ハロで共用。
  function _acylChain(g, c1) {
    const isC = i => g.atoms[i].z === 6;
    const cnb = i => g.adj[i].filter(e => isC(e.to)).map(e => e.to);
    if (cnb(c1).length !== 1) return null;                 // アシル炭素は炭素隣接1(末端)
    const bondOrder = (i, j) => { for (const e of g.adj[i]) if (e.to === j) return e.bo; return 1; };
    const prev = new Map(), seen = new Set([c1]); let q = [c1], far = c1;
    while (q.length) { const nq = []; for (const u of q) for (const v of cnb(u)) if (!seen.has(v)) { seen.add(v); prev.set(v, u); nq.push(v); far = v; } q = nq; }
    const chain = []; let cur = far; while (cur !== undefined) { chain.push(cur); cur = prev.get(cur); }
    chain.reverse();                                        // c1..far（c1=位置1）
    const n = chain.length; if (n < 1 || n > 10) return null;
    const posOf = {}; chain.forEach((ai, k) => posOf[ai] = k + 1);
    const ene = [], yne = [];
    for (let k = 0; k + 1 < chain.length; k++) { const o = bondOrder(chain[k], chain[k + 1]); if (o === 2) ene.push(k + 1); else if (o === 3) yne.push(k + 1); }
    const subs = [], oxo = [], hydroxy = [];
    for (const ai of chain) { const p = posOf[ai];
      for (const e of g.adj[ai]) { const w = g.atoms[e.to];
        if (w.z === 6 && posOf[e.to]) continue;
        if (ai === c1 && !isC(e.to)) continue;             // c1 のクラス基(=O,O,N,ハロ)はスキップ
        if (w.z === 6) { const sz = _branchSize(g, e.to, ai); if (sz < 0 || sz > 6) return null; subs.push({ loc: p, ja: V1_ALKYL_JA[sz], en: V1_ALKYL_EN[sz] }); }
        else if (V1_HALO[w.z]) subs.push({ loc: p, ja: V1_HALO[w.z].ja, en: V1_HALO[w.z].en });
        else if (w.z === 7) { if (e.bo === 1 && w.impHs >= 1) subs.push({ loc: p, ja: 'アミノ', en: 'amino' }); else return null; }
        else if (w.z === 8) { if (e.bo === 2) oxo.push(p); else if (w.impHs >= 1) hydroxy.push(p); else return null; }
        else if (w.z === 1) { /* H */ }
        else return null;
      }
    }
    let base = V1_ALKANE_STEM[n];
    if (ene.length || yne.length) { if (ene.length) base += '-' + ene.join(',') + '-' + (V1_MULT[ene.length] || '') + 'エン'; if (yne.length) base += '-' + yne.join(',') + '-' + (V1_MULT[yne.length] || '') + 'イン'; }
    else base += 'ン';
    const groups = {}; for (const s of subs) (groups[s.en] || (groups[s.en] = { ja: s.ja, locs: [] })).locs.push(s.loc);
    if (oxo.length) groups['oxo'] = { ja: 'オキソ', locs: oxo };
    if (hydroxy.length) groups['hydroxy'] = { ja: 'ヒドロキシ', locs: hydroxy };
    const keys = Object.keys(groups).sort();
    const prefix = keys.map(k => { const gp = groups[k]; gp.locs.sort((x, y) => x - y); return gp.locs.join(',') + '-' + (V1_MULT[gp.locs.length] || '') + gp.ja; }).join('-');
    return { prefix, base, n };
  }
  // アルキル基名（エステルのアルコキシ部等）: 直鎖＋一般的分岐(iso/sec/tert)
  function _alkylGroupName(g, start, from) {
    const sz = _branchSize(g, start, from);
    if (sz >= 1 && sz <= 8) return V1_ALKYL_JA[sz] || null;         // 直鎖
    const cC = i => g.adj[i].filter(e => g.atoms[e.to].z === 6 && e.to !== from).map(e => e.to);
    const isMe = c => g.adj[c].filter(e => g.atoms[e.to].z === 6).length === 1;
    const nb = cC(start);
    if (nb.length === 2 && nb.every(isMe)) return 'イソプロピル';
    if (nb.length === 3 && nb.every(isMe)) return 'tert-ブチル';
    if (nb.length === 2) { const s = nb.map(c => _branchSize(g, c, start)).sort((a, b) => a - b); if (s[0] === 1 && s[1] === 2) return 'sec-ブチル'; }
    if (nb.length === 1) { const cc = cC(nb[0]).filter(x => x !== start); if (cc.length === 2 && cc.every(isMe)) return 'イソブチル'; }
    return null;
  }
  // 指定種のアシル炭素 index を返す（kind: 'amide'|'nitrile'|'acylhalide'|'acid'|'ester'）
  function _findAcylCarbon(g, kind) {
    for (let i = 0; i < g.atoms.length; i++) {
      if (g.atoms[i].z !== 6) continue;
      const dblO = g.adj[i].some(e => e.bo === 2 && g.atoms[e.to].z === 8);
      if (kind === 'nitrile') { if (g.adj[i].some(e => e.bo === 3 && g.atoms[e.to].z === 7)) return i; continue; }
      if (!dblO) continue;
      if (kind === 'amide'      && g.adj[i].some(e => e.bo === 1 && g.atoms[e.to].z === 7 && g.atoms[e.to].impHs >= 2)) return i;
      if (kind === 'acylhalide' && g.adj[i].some(e => e.bo === 1 && [9,17,35,53].includes(g.atoms[e.to].z))) return i;
      if (kind === 'ester'      && g.adj[i].some(e => e.bo === 1 && g.atoms[e.to].z === 8 && g.atoms[e.to].impHs === 0 && g.adj[e.to].some(x => x.to !== i && g.atoms[x.to].z === 6))) return i;
    }
    return -1;
  }

  // 汎用: 非環アルデヒド/ケトン/アルコール（分岐・多官能・不飽和対応, P-41/P-44/P-14.4）
  // 主特性基 -al > -one > -ol。COOH/エステル/アミド等の上位基があれば null（上位で処理）。
  function _nameOxoAlcoholGraph(g) {
    const isC = i => g.atoms[i].z === 6;
    const cAdj = {}; for (let i = 0; i < g.atoms.length; i++) if (isC(i)) cAdj[i] = [];
    for (let i = 0; i < g.atoms.length; i++) if (isC(i)) for (const e of g.adj[i]) if (isC(e.to)) cAdj[i].push(e.to);
    const bondOrder = (i, j) => { for (const e of g.adj[i]) if (e.to === j) return e.bo; return 1; };
    const aldC = [], ketC = [], olC = [];
    for (let i = 0; i < g.atoms.length; i++) {
      if (isC(i)) {
        const dblO = g.adj[i].some(e => e.bo === 2 && g.atoms[e.to].z === 8);
        if (dblO) {
          const others = g.adj[i].filter(e => !(e.bo === 2 && g.atoms[e.to].z === 8));
          if (others.some(e => { const z = g.atoms[e.to].z; return z !== 6 && z !== 1; })) return null; // 酸/エステル/アミド → 上位
          (g.adj[i].filter(e => isC(e.to)).length >= 2 ? ketC : aldC).push(i);
        }
        const ohB = g.adj[i].find(e => e.bo === 1 && g.atoms[e.to].z === 8 && g.atoms[e.to].impHs >= 1);
        if (ohB) olC.push(i);
      } else if (g.atoms[i].z === 16 || g.atoms[i].z === 15) return null;
    }
    let suffixType, principal;
    if (aldC.length) { suffixType = 'al'; principal = aldC; }
    else if (ketC.length) { suffixType = 'one'; principal = ketC; }
    else if (olC.length) { suffixType = 'ol'; principal = olC; }
    else return null;
    const carbons = []; for (let i = 0; i < g.atoms.length; i++) if (isC(i)) carbons.push(i);
    if (carbons.length > 12) return null;
    const path2 = (u, v) => { const prev = {}; prev[u] = -1; const q = [u], seen = new Set([u]);
      while (q.length) { const x = q.shift(); if (x === v) break; for (const w of cAdj[x]) if (!seen.has(w)) { seen.add(w); prev[w] = x; q.push(w); } }
      if (prev[v] === undefined) return null; const p = []; let x = v; while (x !== -1) { p.push(x); x = prev[x]; } return p.reverse(); };
    const leaves = carbons.filter(i => cAdj[i].length <= 1); const ends = leaves.length >= 2 ? leaves : carbons;
    const principalSet = new Set(principal);
    let best = null;
    for (let i = 0; i < ends.length; i++) for (let j = i; j < ends.length; j++) {
      const p = ends[i] === ends[j] ? [ends[i]] : path2(ends[i], ends[j]); if (!p) continue;
      const nprin = p.filter(a => principalSet.has(a)).length;
      if (!best || nprin > best.nprin || (nprin === best.nprin && p.length > best.len)) best = { path: p, len: p.length, nprin };
    }
    if (!best || best.nprin < principal.length) return null; // 全ての主特性基が主鎖に載らない → 対象外
    const chain = best.path, n = chain.length;
    // 番号付け: 主特性基(接尾辞)の位置集合を最小化（fpd）
    const analyze = order => {
      const posOf = {}; order.forEach((ai, k) => posOf[ai] = k + 1);
      const sufLoc = principal.map(a => posOf[a]).sort((x, y) => x - y);
      return { posOf, sufLoc, order };
    };
    const fwd = analyze(chain), rev = analyze(chain.slice().reverse());
    const cmp = (x, y) => { for (let i = 0; i < Math.min(x.length, y.length); i++) if (x[i] !== y[i]) return x[i] - y[i]; return 0; };
    const pick = cmp(fwd.sufLoc, rev.sufLoc) <= 0 ? fwd : rev;
    const posOf = pick.posOf;
    // 不飽和・接頭辞収集
    const ene = [], yne = [];
    for (let k = 0; k + 1 < pick.order.length; k++) { const o = bondOrder(pick.order[k], pick.order[k + 1]); if (o === 2) ene.push(k + 1); else if (o === 3) yne.push(k + 1); }
    const subs = []; const oxo = [], hydroxy = [];
    for (const ai of pick.order) {
      const p = posOf[ai];
      const dblO = g.adj[ai].some(e => e.bo === 2 && g.atoms[e.to].z === 8);
      const ohHere = g.adj[ai].some(e => e.bo === 1 && g.atoms[e.to].z === 8 && g.atoms[e.to].impHs >= 1);
      if (dblO && !principalSet.has(ai)) oxo.push(p);
      if (ohHere && !(suffixType === 'ol' && principalSet.has(ai))) hydroxy.push(p);
      for (const e of g.adj[ai]) { const w = g.atoms[e.to];
        if (w.z === 6 && posOf[e.to]) continue;
        if (w.z === 6) { const sz = _branchSize(g, e.to, ai); if (sz < 0 || sz > 6) return null; subs.push({ loc: p, ja: V1_ALKYL_JA[sz], en: V1_ALKYL_EN[sz] }); }
        else if (V1_HALO[w.z]) subs.push({ loc: p, ja: V1_HALO[w.z].ja, en: V1_HALO[w.z].en });
        else if (w.z === 7) { if (e.bo === 1 && w.impHs >= 1) subs.push({ loc: p, ja: 'アミノ', en: 'amino' }); else return null; }
        else if (w.z === 8) { /* O は上で処理 */ }
        else if (w.z === 1) { /* H */ }
        else return null;
      }
    }
    // 母体語幹: 不飽和があれば エン/イン、なければ 'ン'
    let base = V1_ALKANE_STEM[n];
    if (ene.length || yne.length) {
      if (ene.length) base += '-' + ene.join(',') + '-' + (V1_MULT[ene.length] || '') + 'エン';
      if (yne.length) base += '-' + yne.join(',') + '-' + (V1_MULT[yne.length] || '') + 'イン';
    } else { base += 'ン'; }
    const sufLoc = principal.map(a => posOf[a]).sort((x, y) => x - y);
    let parentCore;
    if (suffixType === 'al') {
      // アルデヒドは末端 → ロカント省略。単一は 'ンアール'→'ナール' 融合、複数は 'ジアール'
      parentCore = principal.length >= 2 ? base + 'ジアール' : (base + 'アール').replace('ンアール', 'ナール');
    } else if (suffixType === 'one') {
      parentCore = base + (principal.length >= 2 ? `-${sufLoc.join(',')}-ジオン` : `-${sufLoc[0]}-オン`);
    } else {
      parentCore = base + (principal.length >= 2 ? `-${sufLoc.join(',')}-${(V1_MULT[principal.length] || '')}オール` : `-${sufLoc[0]}-オール`);
    }
    // 接頭辞（オキソ/ヒドロキシ含む）をアルファベット順に
    const groups = {};
    for (const s of subs) (groups[s.en] || (groups[s.en] = { ja: s.ja, locs: [] })).locs.push(s.loc);
    if (oxo.length) groups['oxo'] = { ja: 'オキソ', locs: oxo };
    if (hydroxy.length) groups['hydroxy'] = { ja: 'ヒドロキシ', locs: hydroxy };
    const keys = Object.keys(groups).sort();
    const tokens = keys.map(k => { const gp = groups[k]; gp.locs.sort((x, y) => x - y); return gp.locs.join(',') + '-' + (V1_MULT[gp.locs.length] || '') + gp.ja; });
    return tokens.join('-') + parentCore;
  }

  // 炭素環（シクロアルカン/シクロアルカノン/オール/カルボン酸）単環・無置換〜1官能
  const CYCLO_STEM = { 3:'シクロプロパ',4:'シクロブタ',5:'シクロペンタ',6:'シクロヘキサ',7:'シクロヘプタ',8:'シクロオクタ' };
  function _nameCarbocycle(g) {
    const N = g.atoms.length; if (!N) return null;
    // 反復リーフ除去で環原子を求める
    const removed = new Array(N).fill(false); let changed = true;
    while (changed) { changed = false;
      for (let i = 0; i < N; i++) { if (removed[i]) continue;
        let d = 0; for (const e of g.adj[i]) if (!removed[e.to]) d++;
        if (d <= 1) { removed[i] = true; changed = true; } } }
    const ring = []; for (let i = 0; i < N; i++) if (!removed[i]) ring.push(i);
    if (ring.length < 3 || ring.length > 8) return null;
    if (ring.some(i => g.atoms[i].z !== 6)) return null;      // 複素環は対象外
    const ringSet = new Set(ring);
    const size = ring.length; const stem = CYCLO_STEM[size]; if (!stem) return null;
    // 環の巡回順を得る
    const radj = {}; for (const ri of ring) radj[ri] = g.adj[ri].filter(e => ringSet.has(e.to)).map(e => e.to);
    const cyc = [ring[0]]; let prev = -1, curr = ring[0];
    while (cyc.length < size) { const nx = radj[curr].find(x => x !== prev); if (nx === undefined) break; cyc.push(nx); prev = curr; curr = nx; }
    if (cyc.length !== size) return null;                     // 単環でない
    // 各環炭素の官能基・置換基
    const fnAt = {}, subAt = {}; let fnType = null;
    for (const ri of ring) for (const e of g.adj[ri]) {
      if (ringSet.has(e.to)) continue;
      const w = g.atoms[e.to];
      if (w.z === 8 && e.bo === 2) { fnAt[ri] = 'one'; if (fnType && fnType !== 'one') return null; fnType = 'one'; }
      else if (w.z === 8 && e.bo === 1 && w.impHs >= 1) { fnAt[ri] = 'ol'; if (fnType && fnType !== 'ol') return null; fnType = 'ol'; }
      else if (w.z === 6) {
        const isCOOH = g.adj[e.to].some(x => x.bo === 2 && g.atoms[x.to].z === 8) && g.adj[e.to].some(x => x.bo === 1 && g.atoms[x.to].z === 8 && g.atoms[x.to].impHs >= 1);
        if (isCOOH) { fnAt[ri] = 'acid'; if (fnType && fnType !== 'acid') return null; fnType = 'acid'; }
        else { const sz = _branchSize(g, e.to, ri); if (sz < 0 || sz > 6) return null; (subAt[ri] = subAt[ri] || []).push({ ja: V1_ALKYL_JA[sz], en: V1_ALKYL_EN[sz] }); }
      } else if (V1_HALO[w.z]) { (subAt[ri] = subAt[ri] || []).push({ ja: V1_HALO[w.z].ja, en: V1_HALO[w.z].en }); }
      else if (w.z === 1) { /* H */ }
      else return null;                                        // N 等 → 対象外
    }
    const fnCarbons = Object.keys(fnAt).map(Number);
    if (fnType && fnCarbons.length > 1) return null;           // 環内に主特性基が複数 → 対象外
    // 番号付け: 主特性基=位置1、置換基集合が最小(fpd)になる向き・起点を選ぶ
    const posMap = (start, dir) => { const m = {}; for (let k = 0; k < size; k++) { const j = ((start + dir * k) % size + size) % size; m[cyc[j]] = k + 1; } return m; };
    const cands = [];
    for (let s = 0; s < size; s++) for (const dir of [1, -1]) {
      const m = posMap(s, dir);
      if (fnType && m[fnCarbons[0]] !== 1) continue;
      const locs = []; const byEn = {};
      for (const ri of ring) if (subAt[ri]) for (const su of subAt[ri]) { locs.push(m[ri]); (byEn[su.en] || (byEn[su.en] = [])).push(m[ri]); }
      locs.sort((a, b) => a - b);
      const ens = Object.keys(byEn).sort();
      const tie = ens.length ? Math.min(...byEn[ens[0]]) : 0;    // アルファベット順先の置換基の最小ロカント
      cands.push({ m, locs, tie });
    }
    if (!cands.length) return null;
    cands.sort((a, b) => {
      for (let i = 0; i < Math.min(a.locs.length, b.locs.length); i++) if (a.locs[i] !== b.locs[i]) return a.locs[i] - b.locs[i];
      if (a.locs.length !== b.locs.length) return a.locs.length - b.locs.length;
      return a.tie - b.tie;                                       // 同点は P-14.5.2 タイブレーク
    });
    const pick = cands[0].m;
    // 接頭辞（置換基, アルファベット順）
    const totalSubs = ring.reduce((a, ri) => a + (subAt[ri] ? subAt[ri].length : 0), 0);
    const omitLoc = !fnType && totalSubs === 1;               // 無官能・単一置換はロカント省略
    const groups = {};
    for (const ri of ring) if (subAt[ri]) for (const su of subAt[ri]) (groups[su.en] || (groups[su.en] = { ja: su.ja, locs: [] })).locs.push(pick[ri]);
    const keys = Object.keys(groups).sort();
    const prefix = keys.map(k => { const gp = groups[k]; gp.locs.sort((x, y) => x - y);
      return (omitLoc ? '' : gp.locs.join(',') + '-') + (V1_MULT[gp.locs.length] || '') + gp.ja; }).join('-');
    // 接尾辞
    if (fnType === 'one') return prefix + stem + 'ノン';       // 4-メチルシクロヘキサノン
    if (fnType === 'ol')  return prefix + stem + 'ノール';
    if (fnType === 'acid') return prefix + stem + 'ンカルボン酸';
    return prefix + stem + 'ン';                               // メチルシクロヘキサン
  }

  // ══════════════════════════════════════════════════════════════════════════
  // [V1] 非環式 炭化水素・ハロゲン化物・ニトロ化合物の系統命名
  const V1_ALKANE_STEM = ['', 'メタ','エタ','プロパ','ブタ','ペンタ','ヘキサ','ヘプタ','オクタ','ノナ','デカ','ウンデカ','ドデカ'];
  const V1_ENE_WORD = [null,null,'エテン','プロペン','ブテン','ペンテン','ヘキセン','ヘプテン','オクテン','ノネン','デセン','ウンデセン','ドデセン'];
  const V1_YNE_WORD = [null,null,'エチン','プロピン','ブチン','ペンチン','ヘキシン','ヘプチン','オクチン','ノニン','デシン','ウンデシン','ドデシン'];
  const V1_MULT = {1:'',2:'ジ',3:'トリ',4:'テトラ',5:'ペンタ',6:'ヘキサ',7:'ヘプタ',8:'オクタ',9:'ノナ',10:'デカ'};
  const V1_ALKYL_JA = ['','メチル','エチル','プロピル','ブチル','ペンチル','ヘキシル','ヘプチル','オクチル','ノニル','デシル'];
  const V1_ALKYL_EN = ['','methyl','ethyl','propyl','butyl','pentyl','hexyl','heptyl','octyl','nonyl','decyl'];
  const V1_HALO = { 9:{ja:'フルオロ',en:'fluoro'}, 17:{ja:'クロロ',en:'chloro'}, 35:{ja:'ブロモ',en:'bromo'}, 53:{ja:'ヨード',en:'iodo'} };
  function v1IsNitroN(a, A){ if(a.z!==7) return false; let o=0; for(const nb of a.nbr) if(A[nb.to].z===8) o++; return o===2; }
  function v1BranchSize(A,cAdj,start,from){ let cnt=0, prev=from, cur=start;
    while(true){ cnt++; const nxt=cAdj[cur].filter(x=>x!==prev); if(nxt.length===0) break; if(nxt.length>1) return -1; prev=cur; cur=nxt[0]; } return cnt; }
  function v1ChooseNumbering(fwd, rev){
    const cmp=(x,y)=>{ const L=Math.min(x.length,y.length); for(let i=0;i<L;i++){ if(x[i]!==y[i]) return x[i]-y[i]; } return x.length-y.length; };
    const cand=[fwd,rev].filter(Boolean); if(cand.length===1) return cand[0];
    const un=o=>o.ene.concat(o.yne).sort((a,b)=>a-b);
    let c=cmp(un(fwd),un(rev)); if(c!==0) return c<0?fwd:rev;
    c=cmp(fwd.ene,rev.ene); if(c!==0) return c<0?fwd:rev;
    const sl=o=>o.subs.map(s=>s.loc).sort((a,b)=>a-b);
    c=cmp(sl(fwd),sl(rev)); if(c!==0) return c<0?fwd:rev;
    const firstEn=o=>o.subs.slice().sort((a,b)=>a.en<b.en?-1:a.en>b.en?1:0)[0];
    const fa=firstEn(fwd), ra=firstEn(rev); if(fa&&ra){ if(fa.loc!==ra.loc) return fa.loc<ra.loc?fwd:rev; } return fwd;
  }
  function v1Assemble(n, a){
    const nd=a.ene.length, nt=a.yne.length; const omitUns=(n<=3); let parent, parentHasLocant=false;
    if(nd+nt===0){ parent = V1_ALKANE_STEM[n] + 'ン'; }
    else if(nt===0 && nd===1){ parent=(omitUns?'':a.ene[0]+'-')+V1_ENE_WORD[n]; parentHasLocant=!omitUns; }
    else if(nd===0 && nt===1){ parent=(omitUns?'':a.yne[0]+'-')+V1_YNE_WORD[n]; parentHasLocant=!omitUns; }
    else { let s=V1_ALKANE_STEM[n];
      if(nd>0){ s+='-'+a.ene.join(',')+'-'+V1_MULT[nd]+'エン'; parentHasLocant=true; }
      if(nt>0){ s+='-'+a.yne.join(',')+'-'+V1_MULT[nt]+'イン'; if(nd===0) parentHasLocant=true; }
      parent=s; }
    const groups={}; for(const s of a.subs){ (groups[s.en]||(groups[s.en]={ja:s.ja,en:s.en,locs:[]})).locs.push(s.loc); }
    const keys=Object.keys(groups).sort();
    const totalSubs=a.subs.length; const omitSubLoc=(n===1)||(n===2 && totalSubs===1);
    const tokens=[];
    for(const k of keys){ const gp=groups[k]; gp.locs.sort((x,y)=>x-y); const mult=V1_MULT[gp.locs.length]||'';
      tokens.push((omitSubLoc?'':gp.locs.join(',')+'-')+mult+gp.ja); }
    let name=tokens.join('-');
    if(name && parentHasLocant) name+='-'+parent; else name+=parent; return name;
  }
  function nameAcyclicV1(smiles){
    const g=_molGraph(smiles); if(!g) return null;
    const A=g.atoms.map((a,i)=>({idx:i,z:a.z,impHs:a.impHs,nbr:g.adj[i].map(e=>({to:e.to,order:e.bo}))}));
    if(_isRingGraph(g)) return null;
    for(const a of A){
      if(a.z===8){ const ok=a.nbr.some(nb=>v1IsNitroN(A[nb.to],A)); if(!ok) return null; }
      if(a.z===7 && !v1IsNitroN(a,A)) return null;
      if(a.z===16||a.z===15||a.z===34) return null;
    }
    const cIdx=A.filter(a=>a.z===6).map(a=>a.idx); if(cIdx.length===0) return null;
    const cAdj={}; for(const i of cIdx) cAdj[i]=[];
    for(let i=0;i<A.length;i++) for(const nb of A[i].nbr){ if(A[i].z===6 && A[nb.to].z===6) cAdj[i].push(nb.to); }
    const bondOrder=(i,j)=>{ for(const nb of A[i].nbr) if(nb.to===j) return nb.order; return 1; };
    const v1Path=(u,v)=>{ const prev={}; prev[u]=-1; const q=[u]; const seen=new Set([u]);
      while(q.length){ const x=q.shift(); if(x===v) break; for(const w of cAdj[x]) if(!seen.has(w)){seen.add(w); prev[w]=x; q.push(w);} }
      if(prev[v]===undefined) return null; const p=[]; let x=v; while(x!==-1){p.push(x); x=prev[x];} return p.reverse(); };
    const leaves=cIdx.filter(i=>cAdj[i].length<=1); const endsC=leaves.length>=2?leaves:cIdx;
    let best=null; const scoreChain=(p)=>{ let uns=0; for(let k=0;k+1<p.length;k++){ const o=bondOrder(p[k],p[k+1]); if(o===2||o===3) uns++; } return uns; };
    for(let i=0;i<endsC.length;i++) for(let j=i;j<endsC.length;j++){
      const p=(endsC[i]===endsC[j])?[endsC[i]]:v1Path(endsC[i],endsC[j]); if(!p) continue;
      const cand={path:p,len:p.length,uns:scoreChain(p)};
      if(!best||cand.len>best.len||(cand.len===best.len&&cand.uns>best.uns)) best=cand; }
    if(!best) return null; const chain=best.path; const n=chain.length; if(n>12) return null;
    function analyze(order){ const posOf={}; order.forEach((ai,k)=>posOf[ai]=k+1); const ene=[],yne=[],subs=[];
      for(let k=0;k+1<order.length;k++){ const o=bondOrder(order[k],order[k+1]); if(o===2) ene.push(k+1); else if(o===3) yne.push(k+1); }
      for(const ai of order){ for(const nb of A[ai].nbr){ const w=A[nb.to];
        if(w.z===6 && posOf[nb.to]) continue;
        if(w.z===6){ const sz=v1BranchSize(A,cAdj,nb.to,ai); if(sz<0||sz>10) return null; subs.push({loc:posOf[ai],ja:V1_ALKYL_JA[sz],en:V1_ALKYL_EN[sz]}); }
        else if(V1_HALO[w.z]){ subs.push({loc:posOf[ai],ja:V1_HALO[w.z].ja,en:V1_HALO[w.z].en}); }
        else if(v1IsNitroN(w,A)){ subs.push({loc:posOf[ai],ja:'ニトロ',en:'nitro'}); }
        else if(w.z===8){} else if(w.z===1){} else return null; } }
      return {ene:ene.sort((a,b)=>a-b),yne:yne.sort((a,b)=>a-b),subs}; }
    const fwd=analyze(chain), rev=analyze(chain.slice().reverse());
    if(!fwd&&!rev) return null; const pick=v1ChooseNumbering(fwd||rev, rev||fwd); if(!pick) return null;
    return v1Assemble(n, pick);
  }

  // ── [V3] エステル命名補助: アシル部=酸名 / アルコキシ部=アルキル名 (P-65.6) ──
  const ESTER_ACYL = [
    ['[CX3H1](=O)O[#6]',                   'ギ酸'],
    ['[CH3][CX3](=O)O[#6]',                '酢酸'],
    ['[CH3][CH2][CX3](=O)O[#6]',           'プロパン酸'],
    ['[CH3][CH2][CH2][CX3](=O)O[#6]',      'ブタン酸'],
    ['[CH3][CH2][CH2][CH2][CX3](=O)O[#6]', 'ペンタン酸'],
  ];
  const ESTER_ALKYL = [
    ['[CX3](=O)O[CH3]',                    'メチル'],
    ['[CX3](=O)O[CH2][CH3]',               'エチル'],
    ['[CX3](=O)O[CH1]([CH3])[CH3]',        'イソプロピル'],
    ['[CX3](=O)O[CH2][CH2][CH3]',          'プロピル'],
    ['[CX3](=O)O[CX4]([CH3])([CH3])[CH3]', 'tert-ブチル'],
    ['[CX3](=O)O[CH1]([CH3])[CH2][CH3]',   'sec-ブチル'],
    ['[CX3](=O)O[CH2][CH1]([CH3])[CH3]',   'イソブチル'],
    ['[CX3](=O)O[CH2][CH2][CH2][CH3]',     'ブチル'],
    ['[CX3](=O)O[CH]=[CH2]',               'ビニル'],
  ];
  function esterNameJa(can) {
    let acid = null, alkyl = null;
    for (const [sm, nm] of ESTER_ACYL)  { if (hasSubstruct(can, sm)) { acid  = nm; break; } }
    for (const [sm, nm] of ESTER_ALKYL) { if (hasSubstruct(can, sm)) { alkyl = nm; break; } }
    return (acid && alkyl) ? acid + alkyl : null;   // 日本語語順: 酸 → アルキル
  }

  function nameAliphatic(smiles) {
    const can = canonSmiles(smiles);
    if (!can) return null;

    // ① パターンテーブル直引き
    const cache = _getAlicCache();
    if (cache.has(can)) return cache.get(can);

    // ② 官能基検出 + 炭素数による系統名
    const noArom = !can.includes('c');
    const n = countAliphC(can);
    const pfx = (n >= 1 && n <= 10) ? CHAIN_PREFIX_JA[n] : null;

    // ── 炭素環（シクロアルカン/-ノン/-ノール/-カルボン酸）を最優先で判定 ──
    // 非環前提の下記ブロックより先に処理（環を鎖と誤認させない）
    if (noArom && can.includes('1')) {
      const gc = _molGraph(can);
      if (gc && _isRingGraph(gc)) { const cyc = _nameCarbocycle(gc); if (cyc) return cyc; }
    }

    // [V3] 酸系: 優先順位順（P-41）カルボン酸→酸無水物→エステル→酸ハロゲン化物→アミド→ニトリル
    // ── カルボン酸 (-COOH) P-65 ── ※炭酸は除外
    if (noArom && hasSubstruct(can, '[CX3](=O)[OH]') && !hasSubstruct(can, 'OC(=O)O')) {
      const nCOOH = getAllMatches(can, '[CX3](=O)[OH]').length;
      if (nCOOH >= 2) {
        const DIOIC = {2:'シュウ酸（エタン二酸）',3:'マロン酸（プロパン二酸）',
                       4:'コハク酸（ブタン二酸）',5:'グルタル酸（ペンタン二酸）',6:'アジピン酸（ヘキサン二酸）'};
        if (nCOOH === 2) return DIOIC[n] || (pfx ? pfx + 'ン二酸' : `C${n}二酸`);
        return `C${n}ポリカルボン酸`;
      }
      // グラフベース: 分岐/不飽和/ハロ置換の主鎖命名（COOH=C1, P-44/P-65）
      const gA = _molGraph(can);
      if (gA && !_isRingGraph(gA)) {
        const an = _nameCarboxylicAcidGraph(gA);
        if (an === 'メタン酸') return 'ギ酸（メタン酸）';
        if (an === 'エタン酸') return '酢酸（エタン酸）';
        if (an) return an;
      }
      if (n === 1) return 'ギ酸（メタン酸）';
      if (n === 2) return '酢酸（エタン酸）';
      if (pfx) return pfx + 'ン酸';
      return `C${n}カルボン酸`;
    }

    // ── 酸無水物 (-CO-O-CO-) P-66.6 → 無水…酸 ── ※エステルより先に判定
    if (noArom && hasSubstruct(can, '[CX3](=O)O[CX3]=O')) {
      if (hasSubstruct(can, '[CH3][CX3](=O)O[CX3](=O)[CH3]'))           return '無水酢酸';
      if (hasSubstruct(can, '[CH3][CH2][CX3](=O)O[CX3](=O)[CH2][CH3]')) return '無水プロパン酸';
      if (hasSubstruct(can, 'O=C1CCC(=O)O1'))                          return '無水コハク酸';
      if (hasSubstruct(can, 'O=C1C=CC(=O)O1'))                         return '無水マレイン酸';
      return '酸無水物';
    }

    // ── エステル (-CO-O-R, COOH/無水物なし) P-65.6 → 「酸→アルキル」 ──
    if (noArom && hasSubstruct(can, '[CX3](=O)O[#6]') && !hasSubstruct(can, '[OH]')) {
      const en = esterNameJa(can);
      if (en) return en;
      const ge = _molGraph(can);                            // グラフ: 分岐アシル対応
      if (ge && !_isRingGraph(ge)) {
        const c = _findAcylCarbon(ge, 'ester');
        if (c >= 0) {
          const ac = _acylChain(ge, c);
          let esterO = -1; for (const e of ge.adj[c]) if (e.bo === 1 && ge.atoms[e.to].z === 8 && ge.atoms[e.to].impHs === 0) esterO = e.to;
          let rC = -1; if (esterO >= 0) for (const e of ge.adj[esterO]) if (e.to !== c && ge.atoms[e.to].z === 6) rC = e.to;
          const alkyl = rC >= 0 ? _alkylGroupName(ge, rC, esterO) : null;
          if (ac && alkyl) return ac.prefix + ac.base + '酸' + alkyl;
        }
      }
      if (pfx) return pfx + 'ン酸エステル';
    }

    // ── 酸ハロゲン化物 (-CO-X) P-66.4 → ハロゲン化…オイル ──
    if (noArom && hasSubstruct(can, '[CX3](=O)[F,Cl,Br,I]')) {
      const halJa = hasSubstruct(can, '[CX3](=O)Cl') ? '塩化'
                  : hasSubstruct(can, '[CX3](=O)Br') ? '臭化'
                  : hasSubstruct(can, '[CX3](=O)I')  ? 'ヨウ化'
                  : hasSubstruct(can, '[CX3](=O)F')  ? 'フッ化' : '塩化';
      if (n === 2) return halJa + 'アセチル（' + halJa + 'エタノイル）';
      const gh = _molGraph(can);                            // グラフ: 分岐対応
      if (gh && !_isRingGraph(gh)) { const c = _findAcylCarbon(gh, 'acylhalide'); if (c >= 0) { const ac = _acylChain(gh, c); if (ac) return halJa + ac.prefix + (ac.base + 'オイル').replace('ンオイル', 'ノイル'); } }
      if (pfx)     return halJa + pfx + 'ノイル';
      return halJa + `C${n}アシル`;
    }

    // ── アミド (-CO-NH2, 一級・無置換) P-66.1 → …アミド ──
    if (noArom && hasSubstruct(can, '[CX3](=O)[NH2]')) {
      if (n === 1) return 'ホルムアミド（メタンアミド）';
      if (n === 2) return 'アセトアミド（エタンアミド）';
      const gm = _molGraph(can);                            // グラフ: 分岐対応
      if (gm && !_isRingGraph(gm)) { const c = _findAcylCarbon(gm, 'amide'); if (c >= 0) { const ac = _acylChain(gm, c); if (ac) return ac.prefix + ac.base + 'アミド'; } }
      if (pfx) return pfx + 'ンアミド';
    }

    // ── ニトリル (-C#N) P-66.5 → …ニトリル （ニトリル炭素も鎖に含む） ──
    if (noArom && hasSubstruct(can, '[CX2]#[NX1]')) {
      if (n === 1) return 'シアン化水素';
      if (n === 2) return 'アセトニトリル（エタンニトリル）';
      const gn = _molGraph(can);                            // グラフ: 分岐対応
      if (gn && !_isRingGraph(gn)) { const c = _findAcylCarbon(gn, 'nitrile'); if (c >= 0) { const ac = _acylChain(gn, c); if (ac) return ac.prefix + ac.base + 'ニトリル'; } }
      if (pfx) return pfx + 'ンニトリル';
    }

    // ── [V2] 含酸素（アルデヒド>ケトン>アルコール, P-41）グラフベース命名 ──
    // 直鎖・単官能（酸素のみ）でのみ正確。分岐や他ヘテロ(N/S/ハロ)があると
    // 置換基を取りこぼすため、その場合は素通し（→分子式フォールバック）。
    if (noArom && !hasSubstruct(can, '[F,Cl,Br,I]') && !hasSubstruct(can, '[#7]') && !hasSubstruct(can, '[#16]')) {
      const g = _molGraph(can);
      const _chainLen = g ? _longestCarbonChain(g).length : 0;
      if (g && !_isRingGraph(g) && _chainLen === n) {
        const { ket, ald } = _carbonylCarbons(g);
        const oh = _hydroxylCarbons(g);
        // 単一官能タイプのみここで処理（多官能=アルデヒド+ケトン+OH共存は汎用命名器へ委譲）
        const nType = (ald.length ? 1 : 0) + (ket.length ? 1 : 0) + (oh.length ? 1 : 0);
        if (nType === 1) {
          const chain = _longestCarbonChain(g); const parent = _PARENT_JA[n] || `C${n}`;
          // アルデヒド (-al)
          if (ald.length) {
            if (n === 1 && ald.length === 1) return 'ホルムアルデヒド（メタナール）';
            if (n === 2 && ald.length === 1) return 'アセトアルデヒド（エタナール）';
            if (ald.length >= 2) return parent + 'ジアール';
            return (parent + 'アール').replace('ンアール', 'ナール');   // プロパン+アール→プロパナール
          }
          // ケトン (-one)
          if (ket.length) {
            const Lk = _locantsInChain(chain, ket);
            if (n === 3 && ket.length === 1) return 'アセトン（プロパン-2-オン）';
            return parent + (ket.length >= 2 ? `-${Lk.join(',')}-ジオン` : `-${Lk[0]}-オン`);
          }
          // アルコール (-ol)
          const L = _locantsInChain(chain, oh);
          if (oh.length === 1) {
            if (n === 1) return 'メタノール';
            if (n === 2) return 'エタノール';
            const deg = carbonDegree(g, oh[0]); const degJa = deg >= 3 ? '（第3級）' : deg === 2 ? '（第2級）' : '（第1級）';
            return `${parent}-${L[0]}-オール${degJa}`;
          }
          return `${parent}-${L.join(',')}-${(_MULTI_JA[oh.length] || `(${oh.length})`)}オール`;
        }
      }
    }

    // ── 汎用: 分岐/多官能/不飽和のアルデヒド・ケトン・アルコール（非環）──
    if (noArom && (hasSubstruct(can, '[CX3]=O') || hasSubstruct(can, '[OX2H]'))
        && !hasSubstruct(can, '[#16]')) {
      const g2 = _molGraph(can);
      if (g2 && !_isRingGraph(g2)) { const nm = _nameOxoAlcoholGraph(g2); if (nm) return nm; }
    }

    // ── チオール (-SH, OH・C=O なし) P-63.1.5 → …チオール ──
    if (noArom && hasSubstruct(can, '[CX4][SH]')
        && !hasSubstruct(can, 'C=O') && !hasSubstruct(can, '[OH]')) {
      if (pfx) return pfx + 'ンチオール';
    }

    // ── スルフィド (R-S-R', 常に接頭辞クラス → 官能種類名) ──
    if (noArom && hasSubstruct(can, '[CX4]S[CX4]')
        && !hasSubstruct(can, '[SH]') && !hasSubstruct(can, 'C=O') && !hasSubstruct(can, '[OH]')) {
      if (hasSubstruct(can, '[CH3]S[CH3]'))            return 'ジメチルスルフィド';
      if (hasSubstruct(can, '[CH3][CH2]S[CH2][CH3]')) return 'ジエチルスルフィド';
      return 'スルフィド';
    }

    // アミン (-NH2, 一級, C=O・OH なし) P-62 → …アミン
    if (noArom && hasSubstruct(can, '[CX4][NH2]')
        && !hasSubstruct(can, 'C=O') && !hasSubstruct(can, '[OH]')) {
      if (n === 1) return 'メチルアミン（メタンアミン）';
      if (n === 2) return 'エチルアミン（エタンアミン）';
      if (n >= 3 && pfx) return pfx + 'ン-1-アミン';   // 末端一級: propan-1-amine 型
      if (pfx) return pfx + 'ンアミン';
    }

    // ── [V2] エーテル (C-O-C, OH/C=O なし) → alkoxyalkane / ジアルキルエーテル ──
    if (noArom && hasSubstruct(can, '[CX4]O[CX4]') && !hasSubstruct(can, '[OH]') && !hasSubstruct(can, 'C=O')) {
      const g = _molGraph(can);
      if (g && !_isRingGraph(g)) {
        let etherO = -1;
        for (let i = 0; i < g.atoms.length; i++) { const a = g.atoms[i];
          if (a.z === 8 && a.impHs === 0) { const cs = g.adj[i].filter(e => e.bo === 1 && g.atoms[e.to].z === 6); if (cs.length === 2) { etherO = i; break; } } }
        if (etherO >= 0) {
          const nbr = g.adj[etherO].filter(e => g.atoms[e.to].z === 6).map(e => e.to);
          const countSide = start => { const seen = new Set([etherO, start]); let q = [start], c = 0;
            while (q.length) { const nq = []; for (const u of q) { if (g.atoms[u].z === 6) c++;
              for (const e of g.adj[u]) if (!seen.has(e.to) && g.atoms[e.to].z === 6) { seen.add(e.to); nq.push(e.to); } } q = nq; } return c; };
          const s1 = countSide(nbr[0]), s2 = countSide(nbr[1]);
          const AK = ['','メチル','エチル','プロピル','ブチル','ペンチル','ヘキシル','ヘプチル','オクチル'];
          const AO = ['','メトキシ','エトキシ','プロポキシ','ブトキシ','ペンチルオキシ','ヘキシルオキシ','ヘプチルオキシ','オクチルオキシ'];
          const big = Math.max(s1, s2), sml = Math.min(s1, s2);
          if (s1 === s2 && AK[s1]) return `ジ${AK[s1]}エーテル（${AO[sml]}${_PARENT_JA[big]}）`;
          if (AO[sml] && _PARENT_JA[big]) return `${AO[sml]}${_PARENT_JA[big]}（${AK[sml]}${AK[big]}エーテル）`;
        }
      }
      if (pfx) return pfx + 'エーテル';
    }

    // ── [V1] 炭化水素・ハロゲン化物・ニトロ化合物（分岐対応・最長鎖・fpdロカント）──
    if (noArom) {
      try { const v1 = nameAcyclicV1(can); if (v1) return v1; } catch (_) {}
    }

    return null;
  }

  // ── 分子式の計算 ──────────────────────────────────────────────────────────

  const ATOMIC_SYM = { 1:'H',5:'B',6:'C',7:'N',8:'O',9:'F',15:'P',16:'S',17:'Cl',35:'Br',53:'I',14:'Si' };
  const SUB_DIGITS = '₀₁₂₃₄₅₆₇₈₉';

  function toSubDigits(n) {
    return String(n).split('').map(d => SUB_DIGITS[parseInt(d)] || d).join('');
  }

  function getFormula(smiles) {
    const rdk = RDK();
    if (!rdk || !smiles) return null;
    let mol;
    try {
      mol = rdk.get_mol(smiles);
      if (!mol) return null;
      const jsonStr = mol.get_json();
      mol.delete();
      if (!jsonStr) return null;
      const json = JSON.parse(jsonStr);
      const molData = json.molecules?.[0];
      if (!molData) return null;

      const atomDef = json.defaults?.atom || {};
      const defZ = atomDef.z !== undefined ? atomDef.z : 6;
      const defImpHs = atomDef.impHs !== undefined ? atomDef.impHs : 0;

      const counts = {};
      for (const atom of (molData.atoms || [])) {
        const z = atom.z !== undefined ? atom.z : defZ;
        const impHs = atom.impHs !== undefined ? atom.impHs : defImpHs;
        const sym = ATOMIC_SYM[z] || `[${z}]`;
        counts[sym] = (counts[sym] || 0) + 1;
        if (impHs > 0) counts['H'] = (counts['H'] || 0) + impHs;
      }

      let formula = '';
      if (counts['C']) { formula += 'C' + (counts['C'] > 1 ? toSubDigits(counts['C']) : ''); delete counts['C']; }
      if (counts['H']) { formula += 'H' + (counts['H'] > 1 ? toSubDigits(counts['H']) : ''); delete counts['H']; }
      for (const sym of Object.keys(counts).sort()) {
        formula += sym + (counts[sym] > 1 ? toSubDigits(counts[sym]) : '');
      }
      return formula || null;
    } catch (e) {
      if (mol) try { mol.delete(); } catch (_) {}
      return null;
    }
  }

  // ── メイン命名関数 ─────────────────────────────────────────────────────────

  // 芳香族パターンテーブル（nameBenzene が扱えない多環・特殊系）
  const AROM_NAMED = [
    ['c1ccc2ccccc2c1',           'ナフタレン'],
    ['C(=C)c1ccccc1',            'スチレン（ビニルベンゼン）'],
    ['OC(=O)c1ccccc1',           '安息香酸'],
    ['COC(=O)c1ccccc1',          '安息香酸メチル'],
    ['CCOC(=O)c1ccccc1',         '安息香酸エチル'],
    ['CC(=O)Oc1ccccc1',          '酢酸フェニル'],
    ['CC(=O)Oc1ccc(O)cc1',       '酢酸p-クレゾール'],
    ['OC(=O)c1ccc(O)cc1',        '4-ヒドロキシ安息香酸'],
    ['Nc1ccccc1C(O)=O',          'アントラニル酸（2-アミノ安息香酸）'],
    ['c1ccc(cc1)c1ccccc1',       'ビフェニル'],
    ['Cc1ccccc1C',               '1,2-ジメチルベンゼン（o-キシレン）'],
    ['Cc1cccc(C)c1',             '1,3-ジメチルベンゼン（m-キシレン）'],
    ['Cc1ccc(C)cc1',             '1,4-ジメチルベンゼン（p-キシレン）'],
    ['C(c1ccccc1)c1ccccc1',      'ジフェニルメタン'],
    ['C(c1ccccc1)(c1ccccc1)c1ccccc1', 'トリフェニルメタン'],
    ['c1ccc(N=Nc2ccccc2)cc1',    'アゾベンゼン'],
    ['OC(=O)c1ccccc1C(O)=O',     'フタル酸（ベンゼン-1,2-ジカルボン酸）'],
    ['OC(=O)c1cccc(C(O)=O)c1',   'イソフタル酸（ベンゼン-1,3-ジカルボン酸）'],
    ['OC(=O)c1ccc(C(O)=O)cc1',   'テレフタル酸（ベンゼン-1,4-ジカルボン酸）'],
    ['CC(=O)c1ccccc1',           'アセトフェノン'],
    ['O=Cc1ccccc1',              'ベンズアルデヒド'],
    ['OCC=Cc1ccccc1',            '桂皮アルコール'],
    ['OC(=O)C=Cc1ccccc1',        '桂皮酸（trans-）'],
    ['[N+](=O)([O-])c1ccccc1',   'ニトロベンゼン'],
    ['Nc1ccccc1',                'アニリン'],
    ['Oc1ccccc1',                'フェノール'],
    ['Clc1ccccc1',               'クロロベンゼン'],
    ['Brc1ccccc1',               'ブロモベンゼン'],
    ['Cc1ccccc1',                'トルエン'],
    ['c1ccccc1',                 'ベンゼン'],
    ['CCc1ccccc1',               'エチルベンゼン'],
    ['CC(C)c1ccccc1',            'イソプロピルベンゼン（クメン）'],
    ['CCCc1ccccc1',              'n-プロピルベンゼン'],
    ['OCc1ccccc1',               'ベンジルアルコール'],
    ['ClCc1ccccc1',              '塩化ベンジル'],
    ['BrCc1ccccc1',              '臭化ベンジル'],
    ['NCc1ccccc1',               'ベンジルアミン'],
    ['OC(=O)Cc1ccccc1',          'フェニル酢酸'],
    ['Sc1ccccc1',                'チオフェノール'],
    ['Cc1ccc(O)cc1',             '4-メチルフェノール（p-クレゾール）'],
    ['Cc1ccc(N)cc1',             '4-メチルアニリン（p-トルイジン）'],
    ['Nc1ccc(N)cc1',             'ベンゼン-1,4-ジアミン（p-フェニレンジアミン）'],
    ['Oc1ccc(O)cc1',             'ベンゼン-1,4-ジオール（ヒドロキノン）'],
    ['Oc1cccc(O)c1',             'ベンゼン-1,3-ジオール（レゾルシノール）'],
    ['Oc1ccccc1O',               'ベンゼン-1,2-ジオール（カテコール）'],
    ['Oc1ccc(O)c(O)c1',          'ベンゼン-1,2,4-トリオール'],
    ['Oc1cc(O)cc(O)c1',          'ベンゼン-1,3,5-トリオール（フロログルシノール）'],
    ['Oc1cccc(O)c1O',            'ベンゼン-1,2,3-トリオール（ピロガロール）'],
    ['[N+](=O)([O-])c1ccc(N)cc1','4-ニトロアニリン'],
    ['[N+](=O)([O-])c1ccccc1O',  '2-ニトロフェノール'],
    ['[N+](=O)([O-])c1ccc(O)cc1','4-ニトロフェノール'],
    // ジアゾニウム塩（RDKit canonical SMILES の候補を複数登録）
    ['N#[N+]c1ccccc1',           'ベンゼンジアゾニウム塩'],
    ['[N+]#Nc1ccccc1',           'ベンゼンジアゾニウム塩'],
    ['c1ccc([N+]#N)cc1',         'ベンゼンジアゾニウム塩'],
    // アニリン塩酸塩
    ['[NH3+]c1ccccc1',           '塩酸アニリン（アニリン塩酸塩）'],
    // アゾ化合物（フェノール系 — para 配向 主生成物）
    ['Oc1ccc(/N=N/c2ccccc2)cc1', '4-ヒドロキシアゾベンゼン（4-フェニルアゾフェノール）'],
    ['Oc1ccc(N=Nc2ccccc2)cc1',   '4-ヒドロキシアゾベンゼン（4-フェニルアゾフェノール）'],
    // アゾ化合物（2-ナフトール系 — C1 配向 主生成物 / Sudan I 型）
    ['Oc1ccc2ccccc2c1/N=N/c1ccccc1', '1-フェニルアゾ-2-ナフトール（Sudan I）'],
    ['Oc1ccc2ccccc2c1N=Nc1ccccc1',   '1-フェニルアゾ-2-ナフトール（Sudan I）'],
    // アゾ化合物（1-ナフトール系 — 同環 C2 ortho 配向）
    ['Oc1cccc2ccccc12N=Nc1ccccc1',   '2-フェニルアゾ-1-ナフトール'],
    ['Oc1c(/N=N/c2ccccc2)ccc2ccccc12','2-フェニルアゾ-1-ナフトール'],
    // アゾ化合物（アニリン系 — para 配向 主生成物）
    ['Nc1ccc(/N=N/c2ccccc2)cc1', '4-アミノアゾベンゼン（4-フェニルアゾアニリン）'],
    ['Nc1ccc(N=Nc2ccccc2)cc1',   '4-アミノアゾベンゼン（4-フェニルアゾアニリン）'],
    // アゾ化合物（N,N-ジメチルアニリン系 — para 配向 / メチルオレンジの基本骨格）
    ['CN(C)c1ccc(/N=N/c2ccccc2)cc1', '4-(ジメチルアミノ)アゾベンゼン（4-フェニルアゾ-N,N-ジメチルアニリン）'],
    ['CN(C)c1ccc(N=Nc2ccccc2)cc1',   '4-(ジメチルアミノ)アゾベンゼン（4-フェニルアゾ-N,N-ジメチルアニリン）'],
    // クメンヒドロペルオキシド
    ['CC(C)(OO)c1ccccc1',        'クメンヒドロペルオキシド'],
  ];

  let _aromCache = null;
  function _getAromCache() {
    if (_aromCache) return _aromCache;
    _aromCache = new Map();
    for (const [pSmi, name] of AROM_NAMED) {
      try { const c = canonSmiles(pSmi); if (c) _aromCache.set(c, name); } catch (_) {}
    }
    return _aromCache;
  }

  // ── アゾ化合物（Ar-N=N-Ar'）の命名 ──────────────────────────────────────
  // N=N で結ばれた2つの芳香環を検出し、それぞれの置換基から命名する。
  // 配向性を反映した部分構造（OH/NH2/NMe2 から見た N=N の位置）を最初に
  // 検出して、p-/o-/m- や 1- などの位置指定付き名称を返す。
  function nameAzoCompound(can) {
    if (!hasSubstruct(can, '[c]N=N[c]')) return null;

    // ── (A) 配向性検出: 活性化基と N=N の相対位置から命名 ─────────────────
    // ベンゼン環 + 活性化基（OH / NH2 / NMe2）+ N=N-Ph の規則的パターン
    const oriented = _nameAzoByOrientation(can);
    if (oriented) return oriented;

    // ── (B) フォールバック: N=N で切断して両側の芳香族を命名 ──────────────
    const frags = applyRxnSmarts(can, '[c:1]/N=N/[c:2]>>[cH:1].[cH:2]');
    const unified = frags.length > 0 ? frags : applyRxnSmarts(can, '[c:1]N=N[c:2]>>[cH:1].[cH:2]');
    if (unified.length === 0) return null;

    const uniqFrags = [...new Set(unified)];

    // 対称アゾ（両側同じ）
    if (uniqFrags.length === 1) {
      const f = uniqFrags[0];
      const n = nameBenzene(f);
      if (n === 'ベンゼン') return 'アゾベンゼン';
      if (n === 'フェノール') return '4,4\'-ジヒドロキシアゾベンゼン';
      if (n === 'アニリン')   return '4,4\'-ジアミノアゾベンゼン';
      return `ビス(${n.replace('ベンゼン','')}フェニル)ジアゼン`;
    }

    // 非対称アゾ（両側異なる）
    const n1 = nameBenzene(uniqFrags[0]);
    const n2 = nameBenzene(uniqFrags[1]);

    // 一方が無置換ベンゼン → 置換基付きの名称を主にして"アゾベンゼン"化
    if (n1 === 'ベンゼン') return _azoFromPlain(n2);
    if (n2 === 'ベンゼン') return _azoFromPlain(n1);

    // 両側に置換基がある → 名称を併記
    return `${n1}-アゾ-${n2}`;
  }

  // 配向性（Ar の活性化基に対する N=N の位置）から命名する
  // 「p-ヒドロキシアゾベンゼン」「1-フェニルアゾ-2-ナフトール」等を返す
  function _nameAzoByOrientation(can) {
    // ── 2-ナフトール + N=N-Ph (C1 オルト) → 1-フェニルアゾ-2-ナフトール ──
    // SMARTS: 2-naphthol 骨格で C1 が N=N-Ar に置換されている
    if (hasSubstruct(can, '[OH][c]1[cH][cH]c2[cH][cH][cH][cH]c2[c]1[N]=[N][c]1[cH][cH][cH][cH][cH]1') ||
        hasSubstruct(can, '[OH][c]1[cH][cH]c2[cH][cH][cH][cH]c2[c]1/[N]=[N]/[c]1[cH][cH][cH][cH][cH]1')) {
      return '1-フェニルアゾ-2-ナフトール（Sudan I）';
    }
    // ── 1-ナフトール + N=N-Ph (C2 オルト) → 2-フェニルアゾ-1-ナフトール ──
    if (hasSubstruct(can, '[OH][c]1[c]([N]=[N][c]2[cH][cH][cH][cH][cH]2)[cH][cH][c]2[cH][cH][cH][cH][c]12')) {
      return '2-フェニルアゾ-1-ナフトール';
    }

    // ── 単環ベンゼン上の配向性 ─────────────────────────────────────────────
    // [活性化基][c]:[cH]:[cH]:[c]([N]=[N][Ar]):[cH]:[cH] = para
    // [活性化基][c]:[cH]:[cH]:[cH]:[c]([N]=[N][Ar]):[cH] = meta
    // [活性化基][c]:[c]([N]=[N][Ar]):[cH]:[cH]:[cH]:[cH] = ortho
    const orientations = [
      { sub: '[OH]',           prefix: 'p',    word: 'ヒドロキシ',         altPara: 'フェノール' },
      { sub: '[NH2]',          prefix: 'p',    word: 'アミノ',             altPara: 'アニリン' },
      { sub: '[NX3]([CH3])[CH3]', prefix:'p',  word: '(ジメチルアミノ)',   altPara: 'N,N-ジメチルアニリン' },
      { sub: '[OCH3]',         prefix: 'p',    word: 'メトキシ',           altPara: 'アニソール' },
      { sub: 'C(=O)[OH]',      prefix: 'p',    word: 'カルボキシ',         altPara: '安息香酸' },
    ];

    for (const o of orientations) {
      // para: 活性化基と N=N が 1,4 関係
      const pPattern = `${o.sub}[c]1[cH][cH][c]([N]=[N][c]2[cH][cH][cH][cH][cH]2)[cH][cH]1`;
      if (hasSubstruct(can, pPattern)) {
        const sysName = `4-(フェニルジアゼニル)${o.altPara}`;
        return `p-${o.word}アゾベンゼン（${sysName}）`;
      }
      // meta: 1,3 関係
      const mPattern = `${o.sub}[c]1[cH][cH][cH][c]([N]=[N][c]2[cH][cH][cH][cH][cH]2)[cH]1`;
      if (hasSubstruct(can, mPattern)) {
        return `m-${o.word}アゾベンゼン（3-(フェニルジアゼニル)${o.altPara}）`;
      }
      // ortho: 1,2 関係
      const oPattern = `${o.sub}[c]1[c]([N]=[N][c]2[cH][cH][cH][cH][cH]2)[cH][cH][cH][cH]1`;
      if (hasSubstruct(can, oPattern)) {
        return `o-${o.word}アゾベンゼン（2-(フェニルジアゼニル)${o.altPara}）`;
      }
    }

    return null;
  }

  // 置換基付きの一側を"アゾベンゼン"化して命名（位置情報なしのフォールバック）
  function _azoFromPlain(otherName) {
    // フェノール系 → ヒドロキシアゾベンゼン
    if (otherName === 'フェノール') return 'ヒドロキシアゾベンゼン';
    if (otherName === 'アニリン')   return 'アミノアゾベンゼン';
    if (otherName === '安息香酸')   return 'カルボキシアゾベンゼン';
    if (otherName === 'トルエン')   return 'メチルアゾベンゼン';
    // 位置番号付き (例: 2-ヒドロキシ...) はそのまま接頭辞として使う
    if (/^\d+-/.test(otherName)) {
      // "2-ヒドロキシフェノール" のような場合は置換基部分だけ抽出は複雑なので素朴に結合
      return `${otherName.replace(/ベンゼン$/, '')}アゾベンゼン`;
    }
    // p-/o-/m- 接頭辞付き
    if (/^[opm]-/.test(otherName)) {
      return `${otherName.replace(/ベンゼン$/, '').replace(/フェノール$/, 'ヒドロキシ').replace(/アニリン$/, 'アミノ')}アゾベンゼン`;
    }
    return `(${otherName})系アゾベンゼン`;
  }

  // ── 芳香族複素環の保留名（IUPAC 2013 P-25 / HW命名）canonical SMILES 直引き ──
  const HETEROCYCLE_NAMED = [
    ['c1ccncc1',      'ピリジン'],
    ['c1ccncn1',      'ピリミジン'],
    ['c1cnccn1',      'ピラジン'],
    ['c1ccnnc1',      'ピリダジン'],
    ['c1cncn1',       'イミダゾール'],
    ['c1ccnn1',       'ピラゾール'],
    ['c1ccoc1',       'フラン'],
    ['c1ccsc1',       'チオフェン'],
    ['c1cc[nH]c1',    'ピロール'],
    ['c1ccc2ccccc2c1','ナフタレン'],
    ['c1ccc2[nH]ccc2c1', '1H-インドール（インドール）'],
    ['c1ccc2ncccc2c1','キノリン'],
    ['c1ccc2cnccc2c1','イソキノリン'],
    // 置換ピリジン（頻出）
    ['Cc1ccccn1',     '2-メチルピリジン（2-ピコリン）'],
    ['Cc1cccnc1',     '3-メチルピリジン（3-ピコリン）'],
    ['Cc1ccncc1',     '4-メチルピリジン（4-ピコリン）'],
    ['OC(=O)c1cccnc1','ピリジン-3-カルボン酸（ニコチン酸）'],
  ];
  let _hetCache = null;
  function _getHetCache() {
    if (_hetCache) return _hetCache;
    _hetCache = new Map();
    for (const [pSmi, name] of HETEROCYCLE_NAMED) {
      const c = tryCanonSmiles(pSmi);
      if (c) _hetCache.set(c, name);
    }
    return _hetCache;
  }
  function nameHeterocycle(can) {
    const cache = _getHetCache();
    return cache.has(can) ? cache.get(can) : null;
  }

  function nameJa(smiles) {
    if (!smiles) return null;
    const rdk = RDK();
    if (!rdk) return null;

    // ── 多フラグメント SMILES（酸化開裂生成物等） ──
    // 例: "CC(=O)O.O=C=O" → "酢酸 + 二酸化炭素"
    if (smiles.includes('.')) {
      const frags = smiles.split('.');
      // 重複フラグメントをカウント
      const countMap = new Map();
      for (const f of frags) {
        const fc = (tryCanonSmiles(f) ?? f);
        countMap.set(fc, (countMap.get(fc) ?? 0) + 1);
      }
      const seen = new Set();
      const parts = [];
      for (const f of frags) {
        const fc = tryCanonSmiles(f) ?? f;
        if (seen.has(fc)) continue;
        seen.add(fc);
        const n = nameJa(fc) ?? fc;
        const cnt = countMap.get(fc) ?? 1;
        parts.push(cnt > 1 ? `${cnt}×${n}` : n);
      }
      return parts.join(' + ');
    }

    let can;
    try { can = canonSmiles(smiles); } catch (_) { can = smiles; }
    if (!can) return null;

    // ── 多フラグメント canonical SMILES (RDKit が . を保持する場合) ──
    if (can.includes('.')) {
      return nameJa(can); // 再帰で上のブランチに回す
    }

    // 分子図鑑(app.js の molecules)の登録名を最優先で参照
    // canonical SMILES → displayName マップは prerenderSmiles で構築される
    if (window.__dictNameBySmiles && window.__dictNameBySmiles[can]) {
      return window.__dictNameBySmiles[can];
    }

    // 既知の labMolecules を次に参照
    if (typeof labMolecules !== 'undefined') {
      for (const mol of Object.values(labMolecules)) {
        try {
          if (mol.smiles && canonSmiles(mol.smiles) === can) return mol.nameJa;
        } catch (_) {}
      }
    }

    // dynMolecules に既にキャッシュされているか
    if (window.dynMolecules?.[can]?.nameJa) return window.dynMolecules[can].nameJa;

    // グリニャール試薬（Mg を含む）
    if (can.includes('[Mg]') || can.includes('Mg')) {
      return nameGrignard(can);
    }

    // 芳香族パターンテーブル直引き（nameBenzene より先に照合）
    const aromCache = _getAromCache();
    if (aromCache.has(can)) return aromCache.get(can);

    // アゾ化合物（Ar-N=N-Ar'）— nameBenzene より先に検出
    if (hasSubstruct(can, '[c]N=N[c]')) {
      const azoName = nameAzoCompound(can);
      if (azoName) return azoName;
    }

    // ベンゼン誘導体（パターン未登録のものは nameBenzene で系統名生成）
    if (hasSubstruct(can, 'c1ccccc1')) {
      return nameBenzene(can);
    }

    // 芳香族複素環（ピリジン・フラン等の保留名）
    const hetName = nameHeterocycle(can);
    if (hetName) return hetName;

    // 脂肪族
    const aliphName = nameAliphatic(can);
    if (aliphName) return aliphName;

    // フォールバック: 分子式
    return getFormula(can);
  }

  // ── 位置選択性: EAS の最適プロダクト選択 ────────────────────────────────

  function scoreProductForRegio(productSmiles, reactantSmiles, newSubId) {
    const newDef = SUB_MAP[newSubId];
    if (!newDef) return 0;

    const existSubs = detectRingSubstituents(reactantSmiles);
    if (existSubs.length === 0) return 5; // 無置換: 全位置等価 → 中スコア

    let score = 0;
    for (const { def: exDef } of existSubs) {
      const pos = detectPos2(productSmiles, newDef.smarts, exDef.smarts);
      if (exDef.dir === 'op') {
        if (pos === 'p') score += 10;
        else if (pos === 'o') score += 5;
        else score += 1; // meta は不利
      } else { // meta director
        if (pos === 'm') score += 10;
        else score += 1;
      }
    }
    return score;
  }

  function pickBestProduct(products, reactantSmiles, newSubId) {
    if (products.length <= 1) return products[0] ?? null;
    const scored = products.map(smi => ({
      smi,
      score: scoreProductForRegio(smi, reactantSmiles, newSubId),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored[0].smi;
  }

  // ── 動的プロダクトを dynMolecules に登録して ID を返す ────────────────────

  function registerDynMol(smiles) {
    const can = canonSmiles(smiles);
    if (!can) return null;

    // 既に labMolecules にあればその ID を返す
    if (typeof labMolecules !== 'undefined') {
      for (const [id, mol] of Object.entries(labMolecules)) {
        try { if (mol.smiles && canonSmiles(mol.smiles) === can) return id; } catch (_) {}
      }
    }
    // 既に dynMolecules にあればそのキーを返す
    if (window.dynMolecules[can]) return can;

    const name = nameJa(can) ?? can;
    const formula = getFormula(can) ?? '';
    window.dynMolecules[can] = { id: can, nameJa: name, formula, smiles: can };

    // SVG を即時生成して moleculeSVGs にキャッシュ
    if (typeof moleculeSVGs === 'undefined') window.moleculeSVGs = {};
    const rdk = RDK();
    if (rdk && !moleculeSVGs[can]) {
      try {
        // イオン性SMILES（.区切り）は主フラグメントだけ描画
        let displaySmiles = can;
        if (can.includes('.')) {
          const frags = can.split('.');
          displaySmiles = frags.sort((a, b) => {
            const aC = /[cC]/.test(a) ? 1 : 0;
            const bC = /[cC]/.test(b) ? 1 : 0;
            if (bC !== aC) return bC - aC;
            return b.length - a.length;
          })[0];
        }
        const drawOpts = window.__rdkitDrawOpts
          || JSON.stringify({ width: 300, height: 220, bondLineWidth: 1.5, addStereoAnnotation: false });
        const svgMol = rdk.get_mol(displaySmiles);
        if (svgMol) {
          let svg = svgMol.get_svg_with_highlights(drawOpts);
          svgMol.delete();
          if (svg && svg.length > 100) {
            svg = svg
              .replace(/\s+width="[^"]*"/, '')
              .replace(/\s+height="[^"]*"/, '')
              .replace('<svg ', '<svg style="width:100%;height:100%;" ');
            moleculeSVGs[can] = svg;
          }
        }
      } catch (_) {}
    }

    return can;
  }

  // ── 置換基スワップ反応（ベンゼン環上の置換基 A → B の置換） ─────────────────
  //
  // applyRxnSmarts が失敗した場合（RDKit.js WASM の制限）のフォールバック。
  // ニトロ基還元（NO2→NH2）やジアゾ化（NH2→N2+）などの芳香族置換基変換に使用。
  //
  // 既存の detectRingSubstituents + detectPos2 を活用して、置換基の位置情報を
  // 保ったまま "from" 置換基を "to" 置換基に置き換えた SMILES を直接構築する。

  // reactionId → { fromId: SUB_DEF id, toSmiles: 新置換基 SMILES (null=置換基削除) }
  const SUB_SWAP_FALLBACK = {
    ar_nitro_reduce:   { fromId: 'NO2',  toSmiles: 'N'         },  // NO2 → NH2
    ami_acetyl:        { fromId: 'NH2',  toSmiles: 'NC(=O)C'   },  // NH2 → NHCOCH3
    ami_hcl:           { fromId: 'NH2',  toSmiles: '[NH3+]'    },  // NH2 → NH3+
    ami_diazo:         { fromId: 'NH2',  toSmiles: '[N+]#N'    },  // NH2 → N2+
    phe_naoh:          { fromId: 'OH',   toSmiles: '[O-]'      },  // OH → O-
    ar_nitro_reduce_2: { fromId: 'NO2',  toSmiles: 'N'         },  // (重複対応)
    ar_desulfonation:  { fromId: 'SO3H', toSmiles: null         },  // SO3H 除去
  };

  function buildSubSwapCandidates(smiles, fromId, toSmiles) {
    const fromDef = SUB_MAP[fromId];
    if (!fromDef) return [];
    const allSubs = detectRingSubstituents(smiles);
    const fromEntry = allSubs.find(s => s.def.id === fromId);
    if (!fromEntry) return [];

    // 他の置換基（from 以外）
    const otherSubs = allSubs.filter(s => s.def.id !== fromId);

    // toSmiles が null → 置換基を取り除く（脱置換）
    const Z = toSmiles !== null ? renumberRings(toSmiles, 2) : null;

    // 他置換基なし（from のみ）
    if (otherSubs.length === 0) {
      if (fromEntry.count === 1) {
        if (Z === null) {
          // 置換基を削除 → ベンゼンに戻る
          const s = tryCanonSmiles('c1ccccc1');
          return s ? [s] : [];
        }
        // from → to の置き換え（位置は任意：全パラ相当）
        const s = tryCanonSmiles(`c1ccc(${Z})cc1`);
        return s ? [s] : [];
      }
      if (fromEntry.count === 2) {
        // ジ置換（from ×2）: 位置を維持して両方を置き換え
        const relPos = detectPos2(smiles, fromDef.smarts, fromDef.smarts);
        if (Z === null) {
          const s = tryCanonSmiles('c1ccccc1');
          return s ? [s] : [];
        }
        let t;
        if (relPos === 'o')      t = `c1(${Z})c(${Z})cccc1`;
        else if (relPos === 'm') t = `c1(${Z})cc(${Z})ccc1`;
        else if (relPos === 'p') t = `c1(${Z})ccc(${Z})cc1`;
        else                     t = `c1(${Z})ccc(${Z})cc1`;
        const s = tryCanonSmiles(t);
        return s ? [s] : [];
      }
    }

    // 他置換基あり（各1個）+ from 1個
    if (otherSubs.length === 1 && otherSubs[0].count === 1 && fromEntry.count === 1) {
      const X = renumberRings(otherSubs[0].def.smarts, 2);
      const relPos = detectPos2(smiles, otherSubs[0].def.smarts, fromDef.smarts);
      if (Z === null) {
        // from を削除 → 単置換ベンゼン (X のみ)
        const s = tryCanonSmiles(`c1ccc(${X})cc1`);
        return s ? [s] : [];
      }
      // X と Z の位置は relPos と同じ（from があった位置に Z が入る）
      let templates;
      if (relPos === 'p')      templates = [`c1(${X})ccc(${Z})cc1`];
      else if (relPos === 'm') templates = [`c1(${X})cc(${Z})ccc1`];
      else if (relPos === 'o') templates = [`c1(${X})c(${Z})cccc1`];
      else                     templates = [`c1(${X})ccc(${Z})cc1`, `c1(${X})cc(${Z})ccc1`, `c1(${X})c(${Z})cccc1`];
      return [...new Set(templates.map(t => tryCanonSmiles(t)).filter(Boolean))];
    }

    // 他置換基 2 種（各1個）+ from 1個（3置換体）
    if (otherSubs.length >= 2 && fromEntry.count === 1) {
      // 他の2置換基間の相対位置と、from の各置換基との位置を検出して再構築
      const X = renumberRings(otherSubs[0].def.smarts, 2);
      const Y = renumberRings(otherSubs[1].def.smarts, 2);
      const posXY = detectPos2(smiles, otherSubs[0].def.smarts, otherSubs[1].def.smarts);
      const posXF = detectPos2(smiles, otherSubs[0].def.smarts, fromDef.smarts);

      if (Z === null) {
        // from を除いた2置換体
        const Zf = null;
        let t;
        if (posXY === 'p')      t = `c1(${X})ccc(${Y})cc1`;
        else if (posXY === 'm') t = `c1(${X})cc(${Y})ccc1`;
        else if (posXY === 'o') t = `c1(${X})c(${Y})cccc1`;
        else                    t = `c1(${X})ccc(${Y})cc1`;
        const s = tryCanonSmiles(t);
        return s ? [s] : [];
      }

      // 3置換体の再構築: X=1 固定として Y・Z の位置を posXY・posXF から決定
      const numXY = posXY === 'o' ? 2 : posXY === 'm' ? 3 : posXY === 'p' ? 4 : null;
      const numXF = posXF === 'o' ? 2 : posXF === 'm' ? 3 : posXF === 'p' ? 4 : null;
      if (numXY && numXF) {
        // c1(X)...(Y at numXY)...(Z at numXF)...cc1 を構築
        const positions = [1, 2, 3, 4, 5, 6];
        const subsAt = { 1: X };
        subsAt[numXY] = Y;
        subsAt[numXF] = Z;
        // 6員環テンプレート
        const ring = [1,2,3,4,5,6].map(p => subsAt[p] ? `(${subsAt[p]})` : '');
        const t = `c1${ring[0]}c${ring[1]}c${ring[2]}c${ring[3]}c${ring[4]}c${ring[5]}1`;
        const s = tryCanonSmiles(t);
        return s ? [s] : [];
      }
    }

    return [];
  }

  // ── アルケン KMnO4 酸化開裂（酸性・加熱条件） ────────────────────────────────
  //
  // ルール:
  //   C=C を開裂して各炭素に =O を付ける
  //   → 得られた中間体を炭素上のH数で処理:
  //       H=2 (H₂C=O, ホルムアルデヒド) → CO₂（ギ酸は酸性KMnO₄でさらに酸化）
  //       H=1 (RCHO, アルデヒド)         → RCOOH（カルボン酸）
  //       H=0 (R₂C=O, ケトン)           → R₂C=O（安定、それ以上酸化されない）
  //   環状アルケンでは開裂後1つの鎖状化合物になり、両端の CHO が COOH に。
  //   複数の C=C がある場合は最初の結合のみ処理（1等量）。

  function computeAlkeneKMnO4Acid(smiles) {
    const rdk = RDK();
    if (!rdk) return { main: null, byProducts: [] };
    const can = canonSmiles(smiles);
    if (!can || !hasSubstruct(can, 'C=C')) return { main: null, byProducts: [] };

    // Step 1: C=C を開裂して各炭素に C=O を付ける
    // 環状アルケンは1フラグメント（鎖状ジアルデヒド/ジケトン）、非環状は2フラグメント
    const cleavedRaw = applyRxnSmarts(can, '[C:1]=[C:2]>>[C:1]=O.[C:2]=O');
    if (!cleavedRaw || cleavedRaw.length === 0) return { main: null, byProducts: [] };

    // 各開裂結果を処理（通常は1種だが複数の C=C がある分子で複数出る場合を考慮）
    const allResults = [];
    for (const rawProd of [...new Set(cleavedRaw)]) {
      const fragments = rawProd.split('.');
      const processedFrags = [];
      let valid = true;

      for (const frag of fragments) {
        const fc = tryCanonSmiles(frag);
        if (!fc) { valid = false; break; }

        // ホルムアルデヒド (H₂C=O) → CO₂
        if (fc === 'C=O' || hasSubstruct(fc, '[CX3H2]=O')) {
          processedFrags.push('O=C=O');
          continue;
        }

        // アルデヒド (RCHO, R≠H) → カルボン酸 (RCOOH)
        if (hasSubstruct(fc, '[CX3H1]=O')) {
          let processed = fc;
          // ジアルデヒド（環状アルケン開裂後）は複数回繰り返す
          for (let iter = 0; iter < 5; iter++) {
            if (!hasSubstruct(processed, '[CX3H1]=O')) break;
            const oxRes = applyRxnSmarts(processed, '[CX3H1:1]=O>>[C:1](=O)O');
            if (!oxRes || oxRes.length === 0) break;
            processed = tryCanonSmiles(oxRes[0]) ?? processed;
          }
          processedFrags.push(processed);
          continue;
        }

        // ケトン → 安定
        processedFrags.push(fc);
      }

      if (!valid || processedFrags.length === 0) continue;
      allResults.push(processedFrags.join('.'));
    }

    if (allResults.length === 0) return { main: null, byProducts: [] };
    return { main: allResults[0], byProducts: allResults.slice(1) };
  }

  // ── オゾン分解（Ozonolysis） ──────────────────────────────────────────────────
  //
  // 共通ステップ: C=C → 各炭素に =O を付与（H数は RDKit が自動保持）
  //   H=2 → ホルムアルデヒド（H₂C=O）
  //   H=1 → アルデヒド（RCHO）
  //   H=0 → ケトン（R₂C=O）
  //
  // ①還元的後処理（Zn/H₂O）: アルデヒドもケトンもそのまま生成
  // ②酸化的後処理（H₂O₂）  : アルデヒド → カルボン酸（ホルムアルデヒド → ギ酸）

  function _ozonolysisCleavage(smiles) {
    // 共通: C=C 開裂→ 各炭素に C=O
    const can = canonSmiles(smiles);
    if (!can || !hasSubstruct(can, 'C=C')) return [];
    const raw = applyRxnSmarts(can, '[C:1]=[C:2]>>[C:1]=O.[C:2]=O');
    return [...new Set(raw || [])];
  }

  // ①還元的（Zn/H₂O）: aldehyde/ketone をそのまま返す
  function computeOzonolysisReductive(smiles) {
    const cleavedAll = _ozonolysisCleavage(smiles);
    if (cleavedAll.length === 0) return { main: null, byProducts: [] };
    // フラグメントの canonical SMILES を整理
    const normalized = cleavedAll.map(s => {
      const frags = s.split('.');
      return frags.map(f => tryCanonSmiles(f) ?? f).join('.');
    });
    return { main: normalized[0], byProducts: normalized.slice(1) };
  }

  // ②酸化的（H₂O₂）: アルデヒド→カルボン酸、ホルムアルデヒド→ギ酸
  function computeOzonolysisOxidative(smiles) {
    const cleavedAll = _ozonolysisCleavage(smiles);
    if (cleavedAll.length === 0) return { main: null, byProducts: [] };

    const allResults = [];
    for (const rawProd of cleavedAll) {
      const fragments = rawProd.split('.');
      const processedFrags = [];
      let valid = true;

      for (const frag of fragments) {
        const fc = tryCanonSmiles(frag);
        if (!fc) { valid = false; break; }

        // ホルムアルデヒド（H₂C=O）→ ギ酸（HCOOH = OC=O）
        if (hasSubstruct(fc, '[CX3H2]=O')) {
          processedFrags.push('OC=O');
          continue;
        }
        // アルデヒド（RCHO）→ カルボン酸（RCOOH）
        if (hasSubstruct(fc, '[CX3H1]=O')) {
          let processed = fc;
          for (let iter = 0; iter < 5; iter++) {
            if (!hasSubstruct(processed, '[CX3H1]=O')) break;
            const oxRes = applyRxnSmarts(processed, '[CX3H1:1]=O>>[C:1](=O)O');
            if (!oxRes || oxRes.length === 0) break;
            processed = tryCanonSmiles(oxRes[0]) ?? processed;
          }
          processedFrags.push(processed);
          continue;
        }
        // ケトン（R₂C=O）→ 安定（そのまま）
        processedFrags.push(fc);
      }

      if (!valid || processedFrags.length === 0) continue;
      allResults.push(processedFrags.join('.'));
    }

    if (allResults.length === 0) return { main: null, byProducts: [] };
    return { main: allResults[0], byProducts: allResults.slice(1) };
  }

  // ── アルカン多段階ハロゲン化 ─────────────────────────────────────────────────
  //
  // 優先順位: (ハロゲン数 昇順, H数 降順)
  //   → 最端炭素（CH3, H=3）から始まり両末端を交互に埋め、
  //     全末端が1置換されたら内側へ進み、全炭素が1置換されたら2置換目へ。
  //   最大3置換まで（CX3 = CCl3 等、4番目の結合は炭素鎖へ）。
  //   メタンのみ最大4置換（CH4 → CCl4）。

  // ─────────────────────────────────────────────────────────────────────────
  // 「実験室」モード反応物判定の基本方針：
  //   反応物の適用可否は分子全体の分類（アルカン／芳香族など）ではなく、
  //   「特徴的な部分構造（官能基）」が SMARTS パターンで検出されるかで判定する。
  //
  //   例：トルエン C₆H₅–CH₃ は芳香環と sp³ メチル基の両方を持つため、
  //       芳香族の反応（ニトロ化・スルホン化など）と同時に
  //       アルカンのラジカル置換（–CH₃ → –CH₂Cl）も両方適用可能となる。
  //
  //   同様に、ベンジルアルコール（芳香+アルコール）、
  //         サリチル酸（芳香+カルボン酸+フェノール）、
  //         クメンヒドロペルオキシド（芳香+ペルオキシド）など、
  //   複数の官能基を併せ持つ分子は、**それぞれの官能基の SMARTS が一致すれば
  //   その分類のすべての反応が候補となる**（特定の分子IDを列挙しない）。
  // ─────────────────────────────────────────────────────────────────────────
  function isAlkaneOrHaloalkane(smiles) {
    if (!smiles) return false;
    // 法則：sp³ C–H が一つでもあればラジカル置換の対象となり得る。
    // 芳香環・ヘテロ原子・不飽和結合の併存は除外条件にしない。
    return hasSubstruct(smiles, '[CX4;!H0]');
  }

  function computeAlkaneHaloProd(smiles, halogen) {
    const rdk = RDK();
    if (!rdk) return [];

    const can = canonSmiles(smiles);
    if (!can) return [];

    if (!isAlkaneOrHaloalkane(can)) return [];

    // ── Step 1: 各sp3 C 原子のインデックスと現在のH数を収集 ──
    const atomInfo = new Map(); // atomIdx → { h, x }
    for (const h of [4, 3, 2, 1, 0]) {
      const ms = getAllMatches(can, `[CX4;H${h}:1]`);
      for (const m of ms) {
        const atoms = m && m.atoms ? m.atoms : (Array.isArray(m) ? m : []);
        if (atoms.length >= 1 && !atomInfo.has(atoms[0])) {
          atomInfo.set(atoms[0], { h, x: 0 });
        }
      }
    }
    if (atomInfo.size === 0) return [];

    // ── Step 2: 各炭素に付いているハロゲン数をカウント ──
    const halMs = getAllMatches(can, '[CX4:1][Cl,Br,F,I]');
    for (const m of halMs) {
      const atoms = m && m.atoms ? m.atoms : (Array.isArray(m) ? m : []);
      if (atoms.length >= 1 && atomInfo.has(atoms[0])) {
        atomInfo.get(atoms[0]).x += 1;
      }
    }

    // ── Step 3: 優先度最高の炭素を決定 (xCount昇順, hCount降順) ──
    let minX = Infinity, maxH = -1;
    for (const [, info] of atomInfo) {
      if (info.h <= 0) continue;  // 置換可能なHがない炭素は除外
      if (info.x < minX || (info.x === minX && info.h > maxH)) {
        minX = info.x;
        maxH = info.h;
      }
    }
    if (minX === Infinity) return []; // 全て置換済み

    // ── Step 4: 対象炭素への反応 SMARTS を構築 ──
    const hal = halogen; // 'Cl' or 'Br'
    let rxnSmarts;

    if (minX === 0) {
      // ハロゲン未置換の炭素（H=maxH かつ隣接ハロゲンなし）
      // 再帰 SMARTS で「ハロゲン隣接なし」を保証
      rxnSmarts = `[CX4;H${maxH};!$([CX4;H${maxH}][Cl,Br,F,I]):1]>>[C:1]${hal}`;
    } else {
      // minX 回置換済みの炭素（H=maxH が残っている）
      // minX>0 の場合、H=maxH かつ x=0 の炭素は既に存在しないため
      // [CX4;H${maxH}] は確実に x>=minX の炭素のみを指す
      rxnSmarts = `[CX4;H${maxH}:1]>>[C:1]${hal}`;
    }

    const results = applyRxnSmarts(can, rxnSmarts);
    if (results.length === 0) return { main: null, byProducts: [] };
    const mainSmi = [...new Set(results)][0];

    // ── Step 5: 副生成物 = 主生成物以外の全ハロゲン化位置 ──
    // 全 h=4..1 に SMARTS を適用し、主生成物以外を収集
    const allBySet = new Set();
    for (const h of [4, 3, 2, 1]) {
      const bpResults = applyRxnSmarts(can, `[CX4;H${h}:1]>>[C:1]${hal}`);
      for (const s of bpResults) {
        if (s && s !== mainSmi) allBySet.add(s);
      }
    }
    return { main: mainSmi, byProducts: [...allBySet] };
  }

  // ── 検出反応ルール ───────────────────────────────────────────────────────

  // 検出反応: SMARTS で適用可否を判定し、観察結果テキストを返す
  // multiCheck: いずれか1つが一致すれば陽性
  const DETECTION_RULES = {
    det_schiff: {
      check: '[CX3H1]=O',
      positiveText: 'シッフ試薬が赤色に呈色する（陽性）。アルデヒドの検出。ケトンでは呈色しない。',
      negativeText: 'シッフ試薬による呈色なし（陰性）。アルデヒド構造がないか、ケトンのため反応しない。',
    },
    det_fehling: {
      check: '[CX3H1]=O',
      positiveText: '赤色沈殿（Cu₂O）が生成する（陽性）。還元性アルデヒドの検出。',
      negativeText: 'フェーリング反応陰性（アルデヒド構造がない）。',
    },
    det_silver: {
      check: '[CX3H1]=O',
      positiveText: '試験管内壁に銀鏡が形成される（銀鏡反応陽性）。アルデヒドの検出。',
      negativeText: '銀鏡反応陰性（アルデヒド構造がない）。',
    },
    det_fecl3: {
      check: '[c][OH]',
      positiveText: '紫色に呈色する（FeCl₃呈色陽性）。フェノール性水酸基の検出。',
      negativeText: 'FeCl₃呈色陰性（フェノール性水酸基がない）。',
    },
    det_br2: {
      multiCheck: ['C=C', 'C#C', '[c][OH]'],
      positiveText: '臭素水の赤褐色が脱色または白色沈殿が生成（陽性）。二重/三重結合・フェノール性OHの検出。',
      negativeText: '臭素水と反応しない（脱色なし）。',
    },
    det_kmno4_cold: {
      multiCheck: ['C=C', 'C#C', '[CX3H1]=O'],
      positiveText: '過マンガン酸カリウムの赤紫色が脱色する（陽性）。不飽和結合・アルデヒドの検出。',
      negativeText: '冷希KMnO₄と反応しない（脱色なし）。',
    },
    det_ninhydrin: {
      check: '[CX4][NH2]',
      positiveText: 'ルヘマン紫（紫色）が生成する（ニンヒドリン反応陽性）。アミノ酸の検出。',
      negativeText: 'ニンヒドリン反応陰性（α-アミノ酸構造がない）。',
    },
    det_iodine_starch: {
      check: 'OC1OCC(O)C(O)C1O',
      positiveText: '青紫色に呈色する（ヨウ素デンプン反応陽性）。デンプン（アミロース）の検出。',
      negativeText: 'ヨウ素デンプン反応陰性。',
    },
    det_biuret: {
      check: '[C](=O)[NH][C](=O)',
      positiveText: '赤紫色に呈色する（ビウレット反応陽性）。タンパク質・ペプチドの検出。',
      negativeText: 'ビウレット反応陰性（ペプチド結合が足りない）。',
    },
    det_xanthoprotein: {
      check: '[c]C[C;!a]',
      positiveText: '黄色～オレンジ色に呈色する（キサントプロテイン反応陽性）。芳香族アミノ酸の検出。',
      negativeText: 'キサントプロテイン反応陰性。',
    },
    det_lead_sulfide: {
      check: '[S]',
      positiveText: '酢酸鉛紙が黒変する（硫黄検出陽性）。S含有アミノ酸（システイン等）の検出。',
      negativeText: '硫黄検出陰性（S含有アミノ酸がない）。',
    },
    det_term_alkyne_ag: {
      check: 'C#[CH]',
      positiveText: '白色沈殿（AgC≡CAg, 銀アセチリド）が生成する（陽性）。末端アルキン（−C≡CH）の検出。',
      negativeText: '沈殿が生成しない（末端三重結合がない）。',
    },
    det_term_alkyne_cu: {
      check: 'C#[CH]',
      positiveText: '赤色沈殿（CuC≡CCu, 銅(I)アセチリド）が生成する（陽性）。末端アルキン（−C≡CH）の検出。',
      negativeText: '沈殿が生成しない（末端三重結合がない）。',
    },
  };

  // 検出反応かどうか判定
  function isDetectionReaction(rxId) {
    return Object.prototype.hasOwnProperty.call(DETECTION_RULES, rxId);
  }

  // 検出反応を実行して結果テキストを返す
  // { positive: boolean, text: string }
  function runDetection(smiles, rxId) {
    const rule = DETECTION_RULES[rxId];
    if (!rule) return null;
    const can = canonSmiles(smiles) || smiles;
    let positive = false;
    if (rule.check) {
      positive = hasSubstruct(can, rule.check);
    } else if (rule.multiCheck) {
      positive = rule.multiCheck.some(s => hasSubstruct(can, s));
    }
    return { positive, text: positive ? rule.positiveText : rule.negativeText };
  }

  // ── 説明型反応（ポリマー・生体系など SMILES 生成不可の反応） ──────────────
  // 検出反応に類似した仕組み: 適用可否チェック + 説明テキスト返却
  // { positive: boolean, text: string } を返す
  const INFORMATIONAL_RULES = {
    // ── アルカン ──────────────────────────────────────────────────────────
    aka_cracking: {
      check: '[CX4;H0,H1,H2,H3][CX4]',
      positiveText: 'C–C 結合が熱で切断されてより短鎖のアルカンとアルケンが生成する（熱分解・クラッキング）。',
      negativeText: 'この分子にはクラッキング可能な C–C 結合がありません。',
    },
    // ── アルデヒド縮合 ─────────────────────────────────────────────────
    ald_aldol: {
      check: '[CX4H2][CX3H1]=O',  // α-H をもつアルデヒド
      positiveText: 'α-H をもつアルデヒドが希塩基下で縮合し、β-ヒドロキシアルデヒド（アルドール）が生成する。',
      negativeText: 'α-H がないためアルドール縮合は進みません。',
    },
    // ── 糖類 ──────────────────────────────────────────────────────────
    sac_oxidize: {
      check: '[CX3H1]=O',   // アルデヒド基（還元糖）
      positiveText: 'アルデヒド基（還元末端）が酸化されてカルボン酸（グルコン酸等）が生成する。',
      negativeText: 'アルデヒド基をもたないため酸化されにくい（ケトース等）。',
    },
    sac_fermentation: {
      check: 'OC1OCC(O)C(O)C1O',  // 六炭糖構造
      positiveText: 'グルコース（またはフルクトース）が酵母のチマーゼにより分解され、エタノール（2mol）と CO₂（2mol）が生成する（アルコール発酵）。',
      negativeText: 'この分子は直接アルコール発酵の基質になりません。',
    },
    poly_sac_hydrolysis: {
      check: 'OC1OCC(O)C(O)C1O',
      positiveText: 'デンプンまたはセルロースが加水分解されて最終的にグルコース（単糖）が生成する。',
      negativeText: 'この分子は多糖の加水分解基質に該当しません。',
    },
    cell_acetylate: {
      check: 'OC1OCC(O)C(O)C1O',
      positiveText: 'セルロースの −OH 基が無水酢酸でエステル化されてジ・トリアセタートになる（アセテート繊維の原料）。',
      negativeText: 'セルロース構造が検出されません。',
    },
    cell_nitrate: {
      check: 'OC1OCC(O)C(O)C1O',
      positiveText: 'セルロースの −OH が −ONO₂ に置換されてニトロセルロースが生成する（綿火薬・セルロイドの原料）。',
      negativeText: 'セルロース構造が検出されません。',
    },
    viscose_process: {
      check: 'OC1OCC(O)C(O)C1O',
      positiveText: 'セルロースを CS₂ + NaOH でキサントゲン酸塩にし、希 H₂SO₄ 中で再生紡糸してビスコースレーヨン（再生セルロース繊維）が得られる。',
      negativeText: 'セルロース構造が検出されません。',
    },
    // ── タンパク質・アミノ酸 ──────────────────────────────────────────
    aa_peptide_bond: {
      check: '[CX4][NH2]',
      positiveText: 'α-アミノ基（−NH₂）とカルボキシル基（−COOH）が脱水縮合してペプチド結合（−CO−NH−）が形成され、水1分子が脱離する。',
      negativeText: 'α-アミノ基が検出されません。',
    },
    aa_zwitterion: {
      check: '[CX4][NH2]',
      positiveText: 'α-アミノ酸は −NH₃⁺ と −COO⁻ をもつ双性イオン（ツビッターイオン）として溶液中に存在する。等電点では電気的に中性。',
      negativeText: 'α-アミノ酸構造が検出されません。',
    },
    prot_hydrolysis_acid: {
      check: '[C](=O)[NH]',
      positiveText: 'ペプチド結合（−CO−NH−）が酸触媒下で加水分解されてα-アミノ酸の混合物が生成する。',
      negativeText: 'ペプチド結合が検出されません。',
    },
    prot_hydrolysis_enzyme: {
      check: '[C](=O)[NH]',
      positiveText: 'プロテアーゼが特定のペプチド結合を選択的に切断し、オリゴペプチドやアミノ酸が生成する。',
      negativeText: 'ペプチド結合が検出されません。',
    },
    prot_denature: {
      check: '[C](=O)[NH]',
      positiveText: 'タンパク質の高次構造（水素結合・疎水性相互作用・ジスルフィド結合等）が崩壊し、機能を失う（変性）。一次構造（共有結合）は変化しない。',
      negativeText: 'タンパク質（ペプチド結合）構造が検出されません。',
    },
    // ── 付加重合 ──────────────────────────────────────────────────────
    add_polymerize: {
      check: 'C=C',
      positiveText: 'C=C 二重結合が連鎖的に付加重合してポリマーが生成する（付加重合）。モノマーとポリマーの組成式は同じ。',
      negativeText: 'C=C 二重結合をもちません。',
    },
    add_polymerize_diene: {
      check: 'C=CC=C',
      positiveText: '共役ジエン（C=C−C=C）が 1,4-付加重合して、二重結合を主鎖に残すポリマーが生成する（合成ゴムの基本）。',
      negativeText: '共役ジエン構造が検出されません。',
    },
    saponify_pva: {
      check: '[C](=O)OC',
      positiveText: 'ポリ酢酸ビニルのエステル基が NaOH でけん化（加水分解）されてポリビニルアルコール（PVA）が生成する。',
      negativeText: 'エステル基が検出されません。',
    },
    acetalize_pva: {
      check: '[CX4][OH]',
      positiveText: 'ポリビニルアルコール（PVA）の水酸基がホルムアルデヒドでアセタール化（−O−CH₂−O−）されてビニロンが生成する。耐水性が向上する。',
      negativeText: '水酸基が検出されません。',
    },
    // ── 縮合重合・開環重合 ─────────────────────────────────────────
    cond_polyamide: {
      check: '[NH2]',
      positiveText: 'ジアミン（−NH₂）とジカルボン酸（−COOH）が脱水縮合し、アミド結合（−CO−NH−）が連続して形成されポリアミド（ナイロン等）が生成する。',
      negativeText: 'アミノ基が検出されません。',
    },
    ring_open_polymerize: {
      check: '[N][C](=O)',  // ラクタム（環状アミド）
      positiveText: '環状アミド（ラクタム）のC−N結合が開環重合してポリアミド（ナイロン6等）が生成する。水が脱離しない点が縮合重合と異なる。',
      negativeText: 'ラクタム（環状アミド）構造が検出されません。',
    },
    cond_polyester: {
      check: '[C](=O)[OH]',
      positiveText: 'ジオール（−OH）とジカルボン酸（−COOH）が脱水縮合し、エステル結合（−COO−）が連続形成されてポリエステル（PET等）が生成する。',
      negativeText: 'カルボキシル基が検出されません。',
    },
    cond_phenol_formaldehyde: {
      check: '[c][OH]',
      positiveText: 'フェノールのベンゼン環とホルムアルデヒドが縮合・架橋してフェノール樹脂（ベークライト）が生成する。熱硬化性樹脂の代表。',
      negativeText: 'フェノール性 OH が検出されません。',
    },
    cond_urea_formaldehyde: {
      check: '[NH2][C](=O)[NH2]',
      positiveText: '尿素の −NH₂ とホルムアルデヒドが縮合しメチレン架橋を形成してユリア樹脂が生成する。',
      negativeText: '尿素構造が検出されません。',
    },
    cond_melamine_formaldehyde: {
      check: 'c1nc(N)nc(N)n1',   // トリアジン環（メラミン）
      positiveText: 'メラミンの −NH₂ とホルムアルデヒドが縮合して高密度の三次元網目構造（メラミン樹脂）が生成する。',
      negativeText: 'メラミン（トリアジン）構造が検出されません。',
    },
    // ── エーテル特殊 ──────────────────────────────────────────────
    eth_form: {
      check: '[CX4][OH]',
      positiveText: 'アルコール2分子が濃 H₂SO₄ / 130°C で分子間脱水してエーテルが生成する。',
      negativeText: 'アルコール性 OH が検出されません。',
    },
  };

  function isInformationalReaction(rxId) {
    return Object.prototype.hasOwnProperty.call(INFORMATIONAL_RULES, rxId);
  }

  function runInformational(smiles, rxId) {
    const rule = INFORMATIONAL_RULES[rxId];
    if (!rule) return null;
    const can = canonSmiles(smiles) || smiles;
    let positive = false;
    if (rule.check) {
      positive = hasSubstruct(can, rule.check);
    } else if (rule.multiCheck) {
      positive = rule.multiCheck.some(s => hasSubstruct(can, s));
    }
    return { positive, text: positive ? rule.positiveText : rule.negativeText };
  }

  // ── アルコール酸化 ─────────────────────────────────────────────────────────
  function computeAlcOxidize(smiles) {
    const can = canonSmiles(smiles);
    if (!can || !hasSubstruct(can, '[CX4][OH]')) return { main: null, byProducts: [] };
    // 第1級アルコール(R-CH₂OH) → カルボン酸(R-COOH)
    if (hasSubstruct(can, '[CX4H2][OH]')) {
      const p = applyRxnSmarts(can, '[CX4H2:1][OH]>>[C:1](=O)O');
      if (p.length > 0) return { main: p[0], byProducts: [] };
    }
    // 第2級アルコール(R₂CHOH) → ケトン(R₂C=O)
    if (hasSubstruct(can, '[CX4H1][OH]')) {
      const p = applyRxnSmarts(can, '[CX4H1:1][OH]>>[C:1]=O');
      if (p.length > 0) return { main: p[0], byProducts: [] };
    }
    // 第3級アルコール(R₃COH) → 酸化されにくい（メッセージのみ）
    if (hasSubstruct(can, '[CX4H0][OH]')) {
      return { main: null, byProducts: [], message: '3級アルコールのため酸化されにくい。K₂Cr₂O₇/H₂SO₄ では反応が進みません。' };
    }
    return { main: null, byProducts: [] };
  }

  // ── アルコール脱水（分子内/アルケン生成） ─────────────────────────────────
  function computeAlcDehydrate(smiles) {
    const can = canonSmiles(smiles);
    if (!can || !hasSubstruct(can, '[CX4][OH]')) return { main: null, byProducts: [] };
    // β-脱離: C-C-OH → C=C
    const p = applyRxnSmarts(can, '[C:1][C:2][OH]>>[C:1]=[C:2]');
    if (p.length > 0) {
      const unique = [...new Set(p)];
      return { main: unique[0], byProducts: unique.slice(1) };
    }
    return { main: null, byProducts: [] };
  }

  // ── ハロゲン化アルキル：エタノール性KOHによるE2脱離 ─────────────────────
  // ほとんどのハロゲン化アルキル（β水素をもつもの）で進行する。ハロゲンの付いた
  // 炭素（α）と、隣接してH をもつ炭素（β）との間に C=C 二重結合が生成し、
  // ハロゲンと β-H が脱離する（+ KX + H₂O）。
  // β炭素が複数ある場合は「末端の方の炭素」＝置換の少ないアルケン
  // （C=C 上の水素数が最多）を主生成物とする。
  function _alkeneHCount(smiles) {
    const g = _molGraph(smiles);
    if (!g) return -1;
    let h = 0;
    for (let i = 0; i < g.atoms.length; i++) {
      if (g.atoms[i].z !== 6) continue;
      for (const e of g.adj[i]) {
        if (e.bo === 2 && e.to > i && g.atoms[e.to].z === 6) {
          h += (g.atoms[i].impHs || 0) + (g.atoms[e.to].impHs || 0);
        }
      }
    }
    return h;
  }
  function computeHalKohElim(smiles) {
    const can = canonSmiles(smiles);
    if (!can || !hasSubstruct(can, '[C!H0][C][Cl,Br,I]')) return { main: null, byProducts: [] };
    // β-脱離: (β炭素:H保有)-(α炭素:ハロゲン) → C=C
    const cands = [...new Set(applyRxnSmarts(can, '[C!H0:1][C:2][Cl,Br,I]>>[C:1]=[C:2]'))];
    if (!cands.length) return { main: null, byProducts: [] };
    // 末端側（C=C 上の水素が最多＝最も置換が少ない）を主生成物に選ぶ
    let main = cands[0], best = _alkeneHCount(cands[0]);
    for (let k = 1; k < cands.length; k++) {
      const sc = _alkeneHCount(cands[k]);
      if (sc > best) { best = sc; main = cands[k]; }
    }
    return { main, byProducts: [] };
  }

  // ── アルコール分子間脱水（エーテル生成） ─────────────────────────────────
  function computeAlcEther(smiles) {
    const can = canonSmiles(smiles);
    if (!can || !hasSubstruct(can, '[CX4][OH]')) return { main: null, byProducts: [] };
    // 2分子のアルコールが反応 → 対称エーテル
    const results = applyRxnSmartsBimol(can, can, '[CX4:1][OH].[CX4:2][OH]>>[CX4:1]O[CX4:2]');
    if (results.length > 0) {
      const unique = [...new Set(results)];
      return { main: unique[0], byProducts: unique.slice(1) };
    }
    return { main: null, byProducts: [] };
  }

  // ── 芳香族水素付加（ベンゼン→シクロヘキサン系） ───────────────────────────
  function computeArH2Add(smiles) {
    const can = canonSmiles(smiles);
    if (!can || !hasSubstruct(can, 'c1ccccc1')) return { main: null, byProducts: [] };
    // 芳香環の全C を sp3 に変換
    const p = applyRxnSmarts(can, '[c:1]1[c:2][c:3][c:4][c:5][c:6]1>>[C:1]1[C:2][C:3][C:4][C:5][C:6]1');
    if (p.length > 0) return { main: p[0], byProducts: [] };
    return { main: null, byProducts: [] };
  }

  // ── 芳香族側鎖酸化（→安息香酸誘導体） ───────────────────────────────────
  function computeArSideOxidize(smiles) {
    const can = canonSmiles(smiles);
    if (!can) return { main: null, byProducts: [] };
    // SUB_SWAP を使って既存のアルキル置換基を C(=O)O に置き換え
    const alkylIds = ['CH3', 'C2H5', 'nPr', 'iPr', 'tBu', 'ALKYL', 'secBu'];
    for (const fromId of alkylIds) {
      const cands = buildSubSwapCandidates(can, fromId, 'C(=O)O');
      if (cands.length > 0) {
        const unique = [...new Set(cands)];
        return { main: unique[0], byProducts: unique.slice(1) };
      }
    }
    // フォールバック: SMARTS
    const p = applyRxnSmarts(can, '[c:1][CH3:2]>>[c:1]C(=O)O');
    if (p.length > 0) return { main: p[0], byProducts: [] };
    return { main: null, byProducts: [] };
  }

  // ── KMnO₄/H₂SO₄ による芳香族側鎖酸化 → 安息香酸 + 副生成物 ────────────
  // ルール:
  //   Ar-CH₃ または Ar-CH₂CH₃ → Ar-COOH + CO₂（副）
  //   Ar-CH₂-R（R ≥ 2C） → Ar-COOH + R-CHO（副、R = β-C以降）
  function computeArKMnO4Oxidize(smiles) {
    const can = canonSmiles(smiles);
    if (!can) return { main: null, byProducts: [] };
    // ベンゼン環上にアルキル側鎖があるか
    if (!hasSubstruct(can, '[c][CX4]')) return { main: null, byProducts: [] };

    // 主生成物: Ar-COOH（CH₃ と CH₂-R を両方試行）
    let mainSmi = null;
    // 優先①: Ar-CH₂-R（2C以上の側鎖）
    if (hasSubstruct(can, '[c][CH2][#6]')) {
      const p = applyRxnSmarts(can, '[c:1][CH2][#6]>>[c:1]C(=O)O');
      if (p.length > 0) mainSmi = p[0];
    }
    // 優先②: Ar-CH₃
    if (!mainSmi && hasSubstruct(can, '[c][CH3]')) {
      const p = applyRxnSmarts(can, '[c:1][CH3]>>[c:1]C(=O)O');
      if (p.length > 0) mainSmi = p[0];
    }
    if (!mainSmi) return { main: null, byProducts: [] };

    // 副生成物の決定
    const byProducts = [];
    // 3C以上の側鎖（[c][CH2][#6][#6] マッチ）→ R-CHO
    if (hasSubstruct(can, '[c][CH2][#6][#6]')) {
      const aldP = applyRxnSmarts(can, '[c][CH2][#6:1]>>O=C[#6:1]');
      if (aldP.length > 0) {
        const ald = tryCanonSmiles(aldP[0]);
        if (ald) byProducts.push(ald);
      }
    } else {
      // 1C または 2C 側鎖（CH₃ または CH₂CH₃）→ CO₂
      const co2 = tryCanonSmiles('O=C=O');
      if (co2) byProducts.push(co2);
    }

    return { main: mainSmi, byProducts };
  }

  // ── クメンヒドロペルオキシド分解（クメン法②） ────────────────────────────
  function computeCumeneCleavage(smiles) {
    const can = canonSmiles(smiles);
    if (!can) return { main: null, byProducts: [] };
    // [c]C(C)(C)OO → [c]OH （フェノール）+ CC(C)=O（アセトン）
    const p = applyRxnSmarts(can, '[c:1][C](C)(C)OO>>[c:1]O');
    if (p.length > 0) {
      // 副生成物としてアセトンを登録
      const acetoneSmi = tryCanonSmiles('CC(C)=O');
      return { main: p[0], byProducts: acetoneSmi ? [acetoneSmi] : [] };
    }
    // フォールバック: SUB_SWAP で hydroperoxide → OH
    const cands = buildSubSwapCandidates(can, 'iPr', 'O');
    if (cands.length > 0) {
      const acetoneSmi = tryCanonSmiles('CC(C)=O');
      return { main: cands[0], byProducts: acetoneSmi ? [acetoneSmi] : [] };
    }
    return { main: null, byProducts: [] };
  }

  // ── コルベ・シュミット反応（ナトリウムフェノキシド→サリチル酸） ───────────
  function computePheKolbe(smiles) {
    const can = canonSmiles(smiles);
    if (!can || !hasSubstruct(can, '[c][O-]')) return { main: null, byProducts: [] };
    // [c][O-] → [c]O （フェノール部）に C(=O)O を ortho 付加
    // まず O- → OH にして o-carboxyl を付加
    const phenolCands = buildSubSwapCandidates(can, 'OH', 'O');
    // または O- → OH → carboxyl-phenol
    // 簡略: SUB_SWAP で O- を OCC に（サリチル酸）
    // 直接 SMARTS でオルト位にカルボキシル付加を試みる
    const p = applyRxnSmarts(can, '[c:1]([O-:2])[cH:3]>>[c:1]([OH:2])[c:3]C(=O)O');
    if (p.length > 0) return { main: p[0], byProducts: [] };
    // フォールバック: 安息香酸誘導体として返す（salicylic acid lookup）
    // PhONa → salicylic acid
    if (hasSubstruct(can, '[O-]c1ccccc1') || can === tryCanonSmiles('[Na+].[O-]c1ccccc1') || can === tryCanonSmiles('[O-]c1ccccc1')) {
      const sali = tryCanonSmiles('OC(=O)c1ccccc1O');
      if (sali) return { main: sali, byProducts: [] };
    }
    return { main: null, byProducts: [] };
  }

  // ── ギ酸脱水（→CO生成） ─────────────────────────────────────────────────
  function computeFormicDehydrate(smiles) {
    const can = canonSmiles(smiles);
    if (!can || !hasSubstruct(can, 'OC=O')) return { main: null, byProducts: [] };
    // HCOOH → CO + H2O
    const coSmi = tryCanonSmiles('[C-]#[O+]');
    if (coSmi) return { main: coSmi, byProducts: [] };
    return { main: null, byProducts: [] };
  }

  // ── 炭化カルシウム+水→アセチレン ──────────────────────────────────────────
  function computeCaC2Water(smiles) {
    if (!hasSubstruct(smiles, '[Ca+2]') && !smiles.includes('[Ca') && !hasSubstruct(smiles, '[C-]#[C-]')) {
      return { main: null, byProducts: [] };
    }
    const c2h2 = tryCanonSmiles('C#C');
    if (c2h2) return { main: c2h2, byProducts: [] };
    return { main: null, byProducts: [] };
  }

  // ── アルキン＋付加基（立体選択的：置換基の小さい炭素に基が付く） ─────────
  // group: 'Br', 'Cl', 'C#N' など（SMARTS 末尾に追加される文字列）
  function computeAlyGroupAdd(smiles, group) {
    const can = canonSmiles(smiles);
    if (!can || !hasSubstruct(can, 'C#C')) return { main: null, byProducts: [] };

    // 末端アルキン R-C≡CH: 基は末端（置換基が小さい）炭素に付く
    if (hasSubstruct(can, 'C#[CH]')) {
      const p = applyRxnSmarts(can, `[C:1]#[CH:2]>>[C:1]=[C:2]${group}`);
      if (p.length > 0) {
        const unique = [...new Set(p)];
        return { main: unique[0], byProducts: unique.slice(1) };
      }
    }

    // 内部アルキン R-C≡C-R': どちらにも付加しうる（対称なら同一）
    const p2 = applyRxnSmarts(can, `[C:1]#[C:2]>>[C:1]=[C:2]${group}`);
    if (p2.length > 0) {
      const unique = [...new Set(p2)];
      return { main: unique[0], byProducts: unique.slice(1) };
    }

    return { main: null, byProducts: [] };
  }

  // ── アルキン＋水付加（マルコフニコフ則：主生成物＝ケトン、副生成物＝アルデヒド） ──
  function computeAlyH2OAdd(smiles) {
    const can = canonSmiles(smiles);
    if (!can || !hasSubstruct(can, 'C#C')) return { main: null, byProducts: [] };

    // アセチレン HC≡CH → アセトアルデヒド（対称なので1種のみ）
    const acetylene = tryCanonSmiles('C#C');
    if (can === acetylene) {
      const ald = tryCanonSmiles('CC=O');
      if (ald) return { main: ald, byProducts: [] };
      return { main: null, byProducts: [] };
    }

    // 末端アルキン R-C≡CH（R≠H）
    if (hasSubstruct(can, 'C#[CH]')) {
      // マルコフニコフ（主生成物）: OH が内側 C → エノール → ケトン R-CO-CH₃
      const mainP = applyRxnSmarts(can, '[C;H0:1]#[CH:2]>>[C:1](=O)[C:2]');
      // 反マルコフニコフ（副生成物）: OH が末端 C → エノール → アルデヒド R-CH₂-CHO
      const byP   = applyRxnSmarts(can, '[C;H0:1]#[CH:2]>>[C:1][CH:2]=O');

      const mainUnique = [...new Set(mainP)];
      const byUnique   = [...new Set(byP)].filter(s => !mainUnique.includes(s));

      if (mainUnique.length > 0) {
        return { main: mainUnique[0], byProducts: byUnique };
      }
    }

    // 内部アルキン R-C≡C-R' → ケトン（どちらかの C に =O）
    const pInt = applyRxnSmarts(can, '[C:1]#[C:2]>>[C:1](=O)[C:2]');
    if (pInt.length > 0) {
      const unique = [...new Set(pInt)];
      return { main: unique[0], byProducts: unique.slice(1) };
    }

    return { main: null, byProducts: [] };
  }

  // ── 芳香族側鎖塩素化（ラジカル反応）─────────────────────────────────────
  // ルール: ベンゼン環のアルキル側鎖を優先度順にCl置換
  //  Phase 1: Cl を持たない C を優先（3° benz > 3° non > 2° benz > 2° non > 1° benz > 1° non）
  //  Phase 2: 全 C が Cl を持つ場合、残り H を次々と Cl 置換（同じ優先順位）
  function computeArSideChainCl(smiles) {
    const can = canonSmiles(smiles);
    if (!can || !hasSubstruct(can, '[c][CX4]')) return { main: null, byProducts: [] };

    // SMARTS 注: 述語 `;!$(...)` は map 番号 `:1` の前に書く必要あり
    const priorities = [
      // ── Phase 1: Cl を持たない C を優先（3° → 2° → 1°、各階層で benz 優先）
      '[c:9][CX4H1;!$([CX4][Cl]):1]>>[c:9][C:1]Cl',      // 3° benzylic, no Cl
      '[CX4H1;!$([CX4][Cl]):1]>>[C:1]Cl',                 // 3° non-benzylic, no Cl
      '[c:9][CX4H2;!$([CX4][Cl]):1]>>[c:9][C:1]Cl',      // 2° benzylic, no Cl
      '[CX4H2;!$([CX4][Cl]):1]>>[C:1]Cl',                 // 2° non-benzylic, no Cl
      '[c:9][CX4H3;!$([CX4][Cl]):1]>>[c:9][C:1]Cl',      // 1° benzylic, no Cl
      '[CX4H3;!$([CX4][Cl]):1]>>[C:1]Cl',                 // 1° non-benzylic, no Cl
      // ── Phase 2: 全 C に Cl あり → 残り H を Cl 置換（Cl の有無を問わず）
      '[c:9][CX4H1:1]>>[c:9][C:1]Cl',
      '[CX4H1:1]>>[C:1]Cl',
      '[c:9][CX4H2:1]>>[c:9][C:1]Cl',
      '[CX4H2:1]>>[C:1]Cl',
      '[c:9][CX4H3:1]>>[c:9][C:1]Cl',
      '[CX4H3:1]>>[C:1]Cl',
    ];

    for (const sm of priorities) {
      const p = applyRxnSmarts(can, sm);
      if (p.length > 0) {
        const unique = [...new Set(p)];
        return { main: unique[0], byProducts: unique.slice(1) };
      }
    }
    return { main: null, byProducts: [] };
  }

  // ── V₂O₅ による芳香族の酸無水物生成 ──────────────────────────────────
  // 無置換芳香族の端のベンゼン環を -CO-O-CO- 酸無水物に変換
  //   ベンゼン → 無水マレイン酸
  //   ナフタレン → 無水フタル酸
  //   アントラセン → 2,3-ナフタレンジカルボン酸無水物
  function computeArV2O5Anhydride(smiles) {
    const can = canonSmiles(smiles);
    if (!can) return { main: null, byProducts: [] };

    // 無置換の条件: 環炭素（芳香族 or sp2）以外の重原子を持たない、全芳香族炭素が [cH] or 環融合炭素のみ
    // →「芳香族のみで構成され、芳香環外の重原子がない」= 分子式が C₄ₙH₂ₙ₊₂ 型、または単純に特定分子に一致
    const benzene    = tryCanonSmiles('c1ccccc1');
    const naphtha    = tryCanonSmiles('c1ccc2ccccc2c1');
    const anthra     = tryCanonSmiles('c1ccc2cc3ccccc3cc2c1');

    if (can === benzene) {
      const p = tryCanonSmiles('O=C1OC(=O)C=C1');
      if (p) return { main: p, byProducts: [] };
    }
    if (can === naphtha) {
      const p = tryCanonSmiles('O=C1OC(=O)c2ccccc21');
      if (p) return { main: p, byProducts: [] };
    }
    if (can === anthra) {
      const p = tryCanonSmiles('O=C1OC(=O)c2cc3ccccc3cc21');
      if (p) return { main: p, byProducts: [] };
    }
    return { main: null, byProducts: [] };
  }

  // ── アセチレン二分子重合（→ビニルアセチレン） ──────────────────────────────
  function computeAlyDimerize(smiles) {
    const can = canonSmiles(smiles);
    if (!can) return { main: null, byProducts: [] };
    // アセチレン (HC≡CH) のみ適用
    const acetylene = tryCanonSmiles('C#C');
    if (can !== acetylene) return { main: null, byProducts: [] };
    // 2 HC≡CH → CH₂=CH−C≡CH（ビニルアセチレン）
    const va = tryCanonSmiles('C=CC#C');
    if (va) return { main: va, byProducts: [] };
    return { main: null, byProducts: [] };
  }

  // ── アルキン三量化（R-C≡CH → 1,3,5- / 1,2,4-R₃-ベンゼン） ────────────────
  function computeAlyTrimerize(smiles) {
    const can = canonSmiles(smiles);
    if (!can || !hasSubstruct(can, 'C#C')) return { main: null, byProducts: [] };

    // (A) アセチレン HC≡CH → ベンゼン（対称、1種のみ）
    const acetylene = tryCanonSmiles('C#C');
    if (can === acetylene) {
      const benzene = tryCanonSmiles('c1ccccc1');
      if (benzene) return { main: benzene, byProducts: [] };
      return { main: null, byProducts: [] };
    }

    // (B) 末端アルキン R-C≡CH → 1,3,5-R₃-ベンゼン（主）+ 1,2,4-R₃-ベンゼン（副）
    if (!hasSubstruct(can, 'C#[CH]')) return { main: null, byProducts: [] };

    // R 部分を抽出: [#6:1][C]#[CH] → [#6:1] で R を取り出す
    const rFrags = applyRxnSmarts(can, '[#6:1][C]#[CH]>>[#6:1]');
    if (!rFrags || rFrags.length === 0) return { main: null, byProducts: [] };
    const rSmiles = rFrags[0];

    // R にリング番号があるとベンゼン環 (ring 1) と衝突するため振り直す
    const safeR = renumberRings(rSmiles, 2);

    // 1,3,5-三置換ベンゼン（主生成物、熱力学的に有利）
    // 最初の R は括弧なし（SMILES の起点として直接結合）
    const smi135 = tryCanonSmiles(`${safeR}c1cc(${safeR})cc(${safeR})c1`);
    // 1,2,4-三置換ベンゼン（副生成物）
    const smi124 = tryCanonSmiles(`${safeR}c1ccc(${safeR})c(${safeR})c1`);

    if (!smi135 && !smi124) return { main: null, byProducts: [] };

    const main = smi135 || smi124;
    const byProds = [];
    if (smi135 && smi124 && smi135 !== smi124) byProds.push(smi124);

    return { main, byProducts: byProds };
  }

  // ── 分子内の酸無水物生成（環状酸無水物：五員環 or 六員環） ─────────────────
  // ルール: 2つの-COOH基が五員環または六員環を形成できる距離にあれば反応する。
  //   - 芳香環オルト位（c-c 隣接）→ 五員環 ✓（メタ/パラは SMARTS が自動的に除外）
  //   - 鎖中 C=C（シス体のみ）→ 五員環 ✓（トランス体は幾何学的に不可）
  //   - 鎖中 C-C 2原子間隔 → 五員環 ✓
  //   - 鎖中 C-C 3原子間隔 → 六員環 ✓
  //   - 4原子以上離れている → 七員環以上でひずみ大のため不可（SMARTS が自動的に除外）
  function computeIntraAnhydride(smiles) {
    const can = canonSmiles(smiles);
    if (!can || !hasSubstruct(can, '[C](=O)[OH]')) return { main: null, byProducts: [] };

    // ① 芳香族オルト位 → 五員環（c-c 隣接 COOH のみマッチ、メタ/パラは自動除外）
    const pAr = applyRxnSmarts(can,
      '[OH][C:1](=O)[c:3][c:4]([C:2](=O)[OH])>>[c:3]1[C:1](=O)O[C:2](=O)[c:4]1');
    if (pAr.length > 0) return { main: pAr[0], byProducts: [] };

    // ② 五員環 C=C（トランス体は幾何学的に環化不可 → /C=C/ を含む場合除外）
    if (hasSubstruct(can, '[OH]C(=O)C=CC(=O)[OH]')) {
      if (can.includes('/C=C/') || can.includes('\\C=C\\')) {
        return { main: null, byProducts: [],
          message: 'トランス形(E体)のため分子内脱水による環化は進みません。' };
      }
      const pDbl = applyRxnSmarts(can,
        '[OH][C:1](=O)[C:3]=[C:4][C:2](=O)[OH]>>[C:1]1(=O)O[C:2](=O)[C:4]=[C:3]1');
      if (pDbl.length > 0) return { main: pDbl[0], byProducts: [] };
    }

    // ③ 五員環 C-C 単結合（2原子間隔）
    const pSgl = applyRxnSmarts(can,
      '[OH][C:1](=O)[#6:3]-[#6:4][C:2](=O)[OH]>>[C:3]1[C:1](=O)O[C:2](=O)[C:4]1');
    if (pSgl.length > 0) return { main: pSgl[0], byProducts: [] };

    // ④ 六員環（3原子間隔）
    const pGlut = applyRxnSmarts(can,
      '[OH][C:1](=O)[#6:3]-[#6:4]-[#6:5][C:2](=O)[OH]>>[C:3]1[C:1](=O)O[C:2](=O)[C:5][C:4]1');
    if (pGlut.length > 0) return { main: pGlut[0], byProducts: [] };

    return { main: null, byProducts: [] };
  }

  // ── 分子間の酸無水物生成（R-CO-O-CO-R） ──────────────────────────────────
  function computeInterAnhydride(smiles) {
    const can = canonSmiles(smiles);
    if (!can || !hasSubstruct(can, '[C](=O)[OH]')) return { main: null, byProducts: [] };

    // 分子内酸無水物も可能かチェック
    const intra = computeIntraAnhydride(can);

    // 分子間酸無水物: 同一分子2つから (RCO)₂O を生成
    const interProd = applyRxnSmartsBimol(can, can,
      '[C:1](=O)[OH].[C:2](=O)[OH]>>[C:1](=O)O[C:2](=O)');
    const interUnique = [...new Set(interProd)];

    if (intra.main) {
      // 分子内が可能 → 主=分子内、副=分子間
      const byProds = interUnique.length > 0 ? [interUnique[0]] : [];
      return { main: intra.main, byProducts: byProds };
    }

    // 分子内が不可 → 分子間のみ
    if (interUnique.length > 0) {
      return { main: interUnique[0], byProducts: interUnique.slice(1) };
    }
    // メッセージがある場合（トランス形等）はそのまま返す
    if (intra.message) return intra;
    return { main: null, byProducts: [] };
  }

  // ── カルシウム塩生成（RCOOH + Ca(OH)₂ → (RCOO)₂Ca） ────────────────────
  // ルール: COOH → COO⁻ に変換し Ca²⁺ と結合
  //   - 分子内酸無水物が形成可能なジカルボン酸 → 同一分子内の2つのCOO⁻がCaにキレート配位
  //   - それ以外 → 2分子の RCOO⁻ + Ca²⁺（通常の塩）
  function computeCalciumSalt(smiles) {
    const can = canonSmiles(smiles);
    if (!can || !hasSubstruct(can, '[C](=O)[OH]')) return { main: null, byProducts: [] };

    const deprotSmarts = '[C:1](=O)[OH]>>[C:1](=O)[O-]';

    // 分子内酸無水物が可能か → キレート塩
    const intra = computeIntraAnhydride(can);
    if (intra.main) {
      // 全 COOH → COO⁻ に変換（繰り返し適用）
      let result = can;
      for (let i = 0; i < 10; i++) {
        if (!hasSubstruct(result, '[C](=O)[OH]')) break;
        const p = applyRxnSmarts(result, deprotSmarts);
        if (p.length === 0) break;
        result = p[0];
      }
      const salt = tryCanonSmiles(result + '.[Ca+2]');
      if (salt) return { main: salt, byProducts: [] };
    }

    // 通常の塩: (RCOO)₂Ca
    const carboxylate = applyRxnSmarts(can, deprotSmarts);
    if (carboxylate.length === 0) return { main: null, byProducts: [] };
    const rcoo = carboxylate[0];
    const salt = tryCanonSmiles(rcoo + '.' + rcoo + '.[Ca+2]');
    if (salt) return { main: salt, byProducts: [] };

    return { main: null, byProducts: [] };
  }

  // ── カルシウム塩の乾留（→ケトン生成） ────────────────────────────────────
  // ルール: (RCOO)₂Ca を加熱 → R-CO-R（ケトン）+ CaCO₃
  //   - 2つの RCOO⁻ フラグメント + Ca²⁺ → ケトン
  //   - キレート型（同一分子に2つのCOO⁻）は反応しない
  function computeCalciumKetonize(smiles) {
    const can = canonSmiles(smiles);
    if (!can) return { main: null, byProducts: [] };
    if (!hasSubstruct(can, '[Ca+2]') || !hasSubstruct(can, '[C](=O)[O-]'))
      return { main: null, byProducts: [] };

    // フラグメントに分割してカルボキシレートを識別
    const fragments = can.split('.');
    const carboxFrags = fragments.filter(f => hasSubstruct(f, '[C](=O)[O-]'));

    // キレート型: 1フラグメントに2つ以上のCOO⁻ → 反応しない
    if (carboxFrags.length === 1) {
      const matches = getAllMatches(carboxFrags[0], '[C](=O)[O-]');
      if (matches.length >= 2) {
        return { main: null, byProducts: [],
          message: 'キレート型カルシウム塩（分子内ジカルボン酸由来）のため乾留によるケトン生成は進みません。' };
      }
    }

    // 2つの RCOO⁻ フラグメントが必要
    if (carboxFrags.length < 2) return { main: null, byProducts: [] };

    // 各フラグメントから R 基を抽出
    const r1 = applyRxnSmarts(carboxFrags[0], '[#6:1][C](=O)[O-]>>[#6:1]');
    const r2 = applyRxnSmarts(carboxFrags[1], '[#6:1][C](=O)[O-]>>[#6:1]');
    if (r1.length === 0 || r2.length === 0) return { main: null, byProducts: [] };

    // ケトン R₁-CO-R₂ を構築
    const safeR2 = renumberRings(r2[0], 2);
    const ketoneSmi = tryCanonSmiles(r1[0] + 'C(=O)' + safeR2);
    if (ketoneSmi) return { main: ketoneSmi, byProducts: [] };

    return { main: null, byProducts: [] };
  }

  // ── ラクトン生成（分子内脱水エステル化、5 or 6員環）────────────────────
  // ルール: 分子内に -COOH と -OH があり、脱水で5 or 6員環ラクトンを形成
  function computeLactoneForm(smiles) {
    const can = canonSmiles(smiles);
    if (!can) return { main: null, byProducts: [] };
    if (!hasSubstruct(can, '[C](=O)[OH]') || !hasSubstruct(can, '[OH]'))
      return { main: null, byProducts: [] };

    // トランス体（/C=C/）は反応しない
    if (can.includes('/C=C/') || can.includes('\\C=C\\')) {
      return { main: null, byProducts: [],
        message: 'トランス形(E体)のため環化は進みません。' };
    }

    // 芳香族: ortho-OH + CH=CH-COOH → クマリン型（6員環ラクトン fused to benzene）
    const arLac = applyRxnSmarts(can,
      '[OH:7][c:8][c:9][C:4]=[C:3][C:1](=O)[OH]>>[c:8]1[c:9][C:4]=[C:3][C:1](=O)[O:7]1');
    if (arLac.length > 0) return { main: arLac[0], byProducts: [] };

    // 芳香族: ortho-OH + C-COOH 直接（5員環）
    const arLac5 = applyRxnSmarts(can,
      '[OH:7][c:8][c:9]([C:1](=O)[OH])>>[c:8]1[O:7][C:1](=O)[c:9]1');
    if (arLac5.length > 0) return { main: arLac5[0], byProducts: [] };

    // 脂肪族 5員環 γ-ラクトン: HOOC-C-C-C-OH (3原子間隔)
    const aLac5 = applyRxnSmarts(can,
      '[OH][C:1](=O)[#6:3][#6:4][#6:5][OH:6]>>[C:3]1[C:1](=O)[O:6][C:5][C:4]1');
    if (aLac5.length > 0) {
      const unique = [...new Set(aLac5)];
      return { main: unique[0], byProducts: unique.slice(1) };
    }

    // 脂肪族 5員環 C=C含む
    const aLac5d = applyRxnSmarts(can,
      '[OH][C:1](=O)[#6:3]=[#6:4][#6:5][OH:6]>>[C:3]1=[C:4][C:5][O:6][C:1]1=O');
    if (aLac5d.length > 0) return { main: aLac5d[0], byProducts: [] };

    // 脂肪族 6員環 δ-ラクトン: HOOC-C-C-C-C-OH (4原子間隔)
    const aLac6 = applyRxnSmarts(can,
      '[OH][C:1](=O)[#6:3][#6:4][#6:5][#6:7][OH:6]>>[O:6]1[C:1](=O)[C:3][C:4][C:5][C:7]1');
    if (aLac6.length > 0) {
      const unique = [...new Set(aLac6)];
      return { main: unique[0], byProducts: unique.slice(1) };
    }

    return { main: null, byProducts: [] };
  }

  // ── ラクトン開環（NaOH加水分解 → ヒドロキシ酸Na塩）─────────────────────
  function computeLactoneOpen(smiles) {
    const can = canonSmiles(smiles);
    if (!can) return { main: null, byProducts: [] };
    // 芳香族ラクトンは適用外
    if (hasSubstruct(can, 'c1ccccc1')) return { main: null, byProducts: [] };

    // 5員環ラクトン開環
    const open5 = applyRxnSmarts(can,
      '[C:1](=O)1O[#6:5][#6:4][#6:3]1>>[C:1](=O)([O-])[C:3][C:4][C:5][OH]');
    if (open5.length > 0) return { main: open5[0], byProducts: [] };

    // 6員環ラクトン開環
    const open6 = applyRxnSmarts(can,
      '[C:1](=O)1O[#6:7][#6:5][#6:4][#6:3]1>>[C:1](=O)([O-])[C:3][C:4][C:5][C:7][OH]');
    if (open6.length > 0) return { main: open6[0], byProducts: [] };

    return { main: null, byProducts: [] };
  }

  // ── 弱酸の遊離（HCl で -O⁻→-OH, -COO⁻→-COOH を全て変換）──────────────
  function computeWeakAcidFree(smiles) {
    const can = canonSmiles(smiles);
    if (!can) return { main: null, byProducts: [] };
    if (!hasSubstruct(can, '[O-]')) return { main: null, byProducts: [] };

    let result = can;
    // -COO⁻ → -COOH（繰り返し）
    for (let i = 0; i < 20; i++) {
      if (!hasSubstruct(result, '[C](=O)[O-]')) break;
      const p = applyRxnSmarts(result, '[C:1](=O)[O-]>>[C:1](=O)O');
      if (p.length === 0) break;
      result = p[0];
    }
    // -O⁻ → -OH（繰り返し）
    for (let i = 0; i < 20; i++) {
      if (!hasSubstruct(result, '[#6][O-]')) break;
      const p = applyRxnSmarts(result, '[#6:1][O-]>>[#6:1][OH]');
      if (p.length === 0) break;
      result = p[0];
    }

    if (result === can) return { main: null, byProducts: [] };
    return { main: result, byProducts: [] };
  }

  // ── 環状酸無水物のテンプレート（モノエステル/ジエステル化用）─────────
  // 環状酸無水物は SMARTS で開環すると `.` で分割されてベンゼン環が複製される問題がある。
  // 対策として既知の環状酸無水物のテンプレートを用意し、R を埋め込んで生成物を構築する。
  const CYCLIC_ANH_TEMPLATES = [
    // フタル酸無水物
    { check: 'O=C1OC(=O)c2ccccc21',         monoTpl: 'OC(=O)c1ccccc1C(=O)O%R%',         diTpl: '%R%OC(=O)c1ccccc1C(=O)O%R%' },
    // 無水コハク酸
    { check: 'O=C1CCC(=O)O1',                monoTpl: 'OC(=O)CCC(=O)O%R%',                diTpl: '%R%OC(=O)CCC(=O)O%R%' },
    // 無水マレイン酸
    { check: 'O=C1C=CC(=O)O1',               monoTpl: 'OC(=O)C=CC(=O)O%R%',               diTpl: '%R%OC(=O)C=CC(=O)O%R%' },
    // 無水グルタル酸
    { check: 'O=C1CCCC(=O)O1',               monoTpl: 'OC(=O)CCCC(=O)O%R%',               diTpl: '%R%OC(=O)CCCC(=O)O%R%' },
    // 2,3-ナフタレンジカルボン酸無水物
    { check: 'O=C1OC(=O)c2cc3ccccc3cc21',    monoTpl: 'OC(=O)c1cc2ccccc2cc1C(=O)O%R%',    diTpl: '%R%OC(=O)c1cc2ccccc2cc1C(=O)O%R%' },
  ];

  // アルコール SMILES から R 部分を抽出（脂肪族または芳香族）
  function _extractAlcoholR(alcSmi) {
    const can = canonSmiles(alcSmi);
    if (!can) return null;
    let r = applyRxnSmarts(can, '[CX4:1][OH]>>[CX4:1]');
    if (r && r.length > 0) return r[0];
    r = applyRxnSmarts(can, '[c:1][OH]>>[c:1]');
    if (r && r.length > 0) return r[0];
    return null;
  }

  // 酸無水物のモノエステル化: 環状無水物 + ROH → モノエステル（COOH と COOR を持つ単一分子）
  function computeAnhMonoester(anhSmi, alcSmi) {
    const anh = canonSmiles(anhSmi);
    if (!anh) return [];
    const r = _extractAlcoholR(alcSmi);
    if (!r) return [];
    const safeR = renumberRings(r, 2);
    // 既知の環状酸無水物テンプレートと照合
    for (const tpl of CYCLIC_ANH_TEMPLATES) {
      const checkCan = tryCanonSmiles(tpl.check);
      if (anh === checkCan) {
        const productSmi = tryCanonSmiles(tpl.monoTpl.replace(/%R%/g, safeR));
        if (productSmi) {
          const molId = registerDynMol(productSmi);
          if (molId) return [{ smiles: productSmi, molId, nameJa: nameJa(productSmi) ?? productSmi, formula: getFormula(productSmi) ?? '', byProducts: [] }];
        }
      }
    }
    return [];
  }

  // 酸無水物のジエステル化:
  //  - 反応物が環状無水物 → ジエステル（テンプレート使用）
  //  - 反応物がモノエステル（-COOH 残存）→ 残りの COOH を ROH でエステル化
  function computeAnhDiester(reactSmi, alcSmi) {
    const react = canonSmiles(reactSmi);
    if (!react) return [];
    const r = _extractAlcoholR(alcSmi);
    if (!r) return [];
    const safeR = renumberRings(r, 2);

    // ① 環状酸無水物テンプレート照合
    for (const tpl of CYCLIC_ANH_TEMPLATES) {
      const checkCan = tryCanonSmiles(tpl.check);
      if (react === checkCan) {
        const productSmi = tryCanonSmiles(tpl.diTpl.replace(/%R%/g, safeR));
        if (productSmi) {
          const molId = registerDynMol(productSmi);
          if (molId) return [{ smiles: productSmi, molId, nameJa: nameJa(productSmi) ?? productSmi, formula: getFormula(productSmi) ?? '', byProducts: [] }];
        }
      }
    }

    // ② モノエステル等で -COOH が残っている場合 → COOH を全てエステル化
    if (hasSubstruct(react, '[C](=O)[OH]')) {
      let result = react;
      for (let i = 0; i < 5; i++) {
        if (!hasSubstruct(result, '[C](=O)[OH]')) break;
        const p = applyRxnSmarts(result, `[C:1](=O)[OH]>>[C:1](=O)O${safeR}`);
        if (p.length === 0) break;
        result = p[0];
      }
      if (result !== react) {
        const productSmi = tryCanonSmiles(result);
        if (productSmi) {
          const molId = registerDynMol(productSmi);
          if (molId) return [{ smiles: productSmi, molId, nameJa: nameJa(productSmi) ?? productSmi, formula: getFormula(productSmi) ?? '', byProducts: [] }];
        }
      }
    }
    return [];
  }

  // ── トリグリセリド合成（グリセリン骨格の3つのOH全てをRCOOエステル化）──
  // ルール: グリセリン骨格を持つ分子の全OHを -OCOR で置換
  function buildTriglyceride(glycerolSmiles, acidSmiles) {
    const glyCan = canonSmiles(glycerolSmiles);
    const acidCan = canonSmiles(acidSmiles);
    if (!glyCan || !acidCan) return null;
    // グリセリン骨格チェック
    if (!hasSubstruct(glyCan, '[OH][CX4][CX4]([OH])[CX4][OH]')) return null;
    // R 抽出（RCOOH → R）
    const rArr = applyRxnSmarts(acidCan, '[#6:1][C](=O)[OH]>>[#6:1]');
    if (!rArr || rArr.length === 0) return null;
    const R = renumberRings(rArr[0], 2);
    // 全 CX4-OH を -OCOR に繰り返し置換
    let result = glyCan;
    for (let i = 0; i < 10; i++) {
      if (!hasSubstruct(result, '[CX4][OH]')) break;
      const p = applyRxnSmarts(result, `[CX4:1][OH]>>[CX4:1]OC(=O)${R}`);
      if (p.length === 0) break;
      result = p[0];
    }
    return tryCanonSmiles(result);
  }

  // グリセリン側から（R1=グリセリン、R2=カルボン酸）
  function computeGlyTriglyceride(glyceroSmiles, acidSmiles) {
    const product = buildTriglyceride(glyceroSmiles, acidSmiles);
    if (!product) return [];
    const mainMolId = registerDynMol(product);
    if (!mainMolId) return [];
    return [{ smiles: product, molId: mainMolId, nameJa: nameJa(product) ?? product, formula: getFormula(product) ?? '', byProducts: [] }];
  }

  // カルボン酸側から（R1=カルボン酸、グリセリンは固定）
  function computeAcaTriglyceride(acidSmiles) {
    const product = buildTriglyceride('OCC(O)CO', acidSmiles);
    if (!product) return { main: null, byProducts: [] };
    return { main: product, byProducts: [] };
  }

  // ── トリグリセリドのけん化（KOH）─────────────────────────────────────
  // ルール: トリグリセリド + 3 KOH → 3 R-COO⁻K⁺ + グリセリン
  // 主生成物: カルボン酸カリウム塩、副生成物: グリセリン
  function computeTriSaponify(smiles) {
    const can = canonSmiles(smiles);
    if (!can) return { main: null, byProducts: [] };
    // トリグリセリド骨格: グリセリン3カ所全てがエステル化
    if (!hasSubstruct(can, '[CX4H2]([OX2]C(=O))[CX4H1]([OX2]C(=O))[CX4H2][OX2]C(=O)'))
      return { main: null, byProducts: [] };

    // 各エステル結合から R-COO⁻ を抽出
    const acidSalts = applyRxnSmarts(can, '[#6:1][C:2](=O)O[CX4]>>[#6:1][C:2](=O)[O-]');
    if (acidSalts.length === 0) return { main: null, byProducts: [] };

    // 重複除去しつつ K+ を付加
    const unique = [...new Set(acidSalts)];
    const potassiumSalts = unique
      .map(s => tryCanonSmiles(`${s}.[K+]`))
      .filter(Boolean);
    if (potassiumSalts.length === 0) return { main: null, byProducts: [] };

    // グリセリン（副生成物）
    const glycerol = tryCanonSmiles('OCC(O)CO');

    // 主: 最初のカルボン酸K塩、副: 残りのK塩 + グリセリン
    const main = potassiumSalts[0];
    const byProducts = potassiumSalts.slice(1);
    if (glycerol) byProducts.push(glycerol);

    return { main, byProducts };
  }

  // ── エステル＋グリニャール試薬 → 3級アルコール＋アルコール ─────────────
  // R1-COO-R2 + 2 RMgX → R1-C(OH)(R)(R) + R2-OH
  function computeEsterGrignard(esterSmiles, grignardSmiles) {
    const ester = canonSmiles(esterSmiles);
    const grig  = canonSmiles(grignardSmiles);
    if (!ester || !grig) return [];

    // R1 抽出（エステルのアシル側）
    const r1Arr = applyRxnSmarts(ester, '[#6:1][C](=O)O[#6]>>[#6:1]');
    // R2 抽出（エステルのアルコキシ側）
    const r2Arr = applyRxnSmarts(ester, '[#6][C](=O)O[#6:1]>>[#6:1]');
    // R 抽出（グリニャール試薬）
    const rArr  = applyRxnSmarts(grig,  '[#6:1][Mg][Br,Cl]>>[#6:1]');

    if (r1Arr.length === 0 || r2Arr.length === 0 || rArr.length === 0) return [];

    const r1 = r1Arr[0];
    const r2 = r2Arr[0];
    const r  = rArr[0];

    // 3級アルコール構築: R1-C(OH)(R)(R)
    const safeR1 = renumberRings(r1, 2);
    const safeR  = renumberRings(r, 4);  // R1 がリングを持つ可能性があるため 4 から
    const safeR2nd = renumberRings(r, 6); // 2つ目の R
    const tertAlcohol = tryCanonSmiles(`${safeR1}C(O)(${safeR})${safeR2nd}`);

    // 副生成物: R2-OH
    const safeR2 = renumberRings(r2, 8);
    const alcohol = tryCanonSmiles(`${safeR2}O`);

    if (!tertAlcohol) return [];

    const mainMolId = registerDynMol(tertAlcohol);
    if (!mainMolId) return [];
    const byProdResults = [];
    if (alcohol) {
      const byId = registerDynMol(alcohol);
      if (byId) byProdResults.push({ smiles: alcohol, molId: byId, nameJa: nameJa(alcohol) ?? alcohol, formula: getFormula(alcohol) ?? '' });
    }
    return [{ smiles: tertAlcohol, molId: mainMolId, nameJa: nameJa(tertAlcohol) ?? tertAlcohol, formula: getFormula(tertAlcohol) ?? '', byProducts: byProdResults }];
  }

  // ── 混酸ニトロ化（グリセリン骨格の全OH → ONO₂）─────────────────────────
  // ルール: 連続3炭素上にOHが3つある構造（グリセリン骨格）の全OHを-O-NO₂に変換
  function computeNitroEster(smiles) {
    const can = canonSmiles(smiles);
    if (!can) return { main: null, byProducts: [] };
    // グリセリン骨格チェック: [OH]C-C([OH])-C[OH] (連続3C各にOH)
    if (!hasSubstruct(can, '[OH][CX4][CX4]([OH])[CX4][OH]'))
      return { main: null, byProducts: [] };
    // 全 [CX4][OH] → [CX4]O[N+](=O)[O-] に繰り返し変換
    let result = can;
    for (let i = 0; i < 10; i++) {
      if (!hasSubstruct(result, '[CX4][OH]')) break;
      const p = applyRxnSmarts(result, '[CX4:1][OH]>>[CX4:1]O[N+](=O)[O-]');
      if (p.length === 0) break;
      result = p[0];
    }
    if (result === can) return { main: null, byProducts: [] };
    return { main: result, byProducts: [] };
  }

  // ── アミド塩基性加水分解 R1-CO-NHR2 + NaOH → R1-COONa + R2-NH2 ─────────
  function computeAmideHydrolBase(smiles) {
    const can = canonSmiles(smiles);
    if (!can || !hasSubstruct(can, '[CX3](=O)[NX3]')) return { main: null, byProducts: [] };

    // ① 置換アミド R1-CO-NH-R2 → R1-COO⁻（主）+ R2-NH2（副）
    if (hasSubstruct(can, '[C](=O)[NH][#6]')) {
      const mainP = applyRxnSmarts(can, '[C:1](=O)[NH][#6]>>[C:1](=O)[O-]');
      const byP   = applyRxnSmarts(can, '[C](=O)[NH:2][#6:3]>>[NH2:2][#6:3]');
      if (mainP.length > 0) {
        const byProds = byP.length > 0 ? [byP[0]] : [];
        return { main: mainP[0], byProducts: byProds };
      }
    }
    // ② 単純アミド R-CO-NH2 → R-COO⁻（NH3 は気体で逸散）
    if (hasSubstruct(can, '[C](=O)[NH2]')) {
      const p = applyRxnSmarts(can, '[C:1](=O)[NH2]>>[C:1](=O)[O-]');
      if (p.length > 0) return { main: p[0], byProducts: [] };
    }
    return { main: null, byProducts: [] };
  }

  // ── アミド酸性加水分解 R1-CO-NHR2 + H₂O/H⁺ → R1-COOH + R2-NH3⁺ ───────
  function computeAmideHydrolAcid(smiles) {
    const can = canonSmiles(smiles);
    if (!can || !hasSubstruct(can, '[CX3](=O)[NX3]')) return { main: null, byProducts: [] };

    // ① 置換アミド R1-CO-NH-R2 → R1-COOH（主）+ R2-NH3⁺（副）
    if (hasSubstruct(can, '[C](=O)[NH][#6]')) {
      const mainP = applyRxnSmarts(can, '[C:1](=O)[NH][#6]>>[C:1](=O)O');
      const byP   = applyRxnSmarts(can, '[C](=O)[NH:2][#6:3]>>[NH3+:2][#6:3]');
      if (mainP.length > 0) {
        const byProds = byP.length > 0 ? [byP[0]] : [];
        return { main: mainP[0], byProducts: byProds };
      }
    }
    // ② 単純アミド R-CO-NH2 → R-COOH（NH4⁺ は省略）
    if (hasSubstruct(can, '[C](=O)[NH2]')) {
      const p = applyRxnSmarts(can, '[C:1](=O)[NH2]>>[C:1](=O)O');
      if (p.length > 0) return { main: p[0], byProducts: [] };
    }
    return { main: null, byProducts: [] };
  }

  // ── アルコール + Na金属 → アルコキシド + H₂ ──────────────────────────────
  function computeAlcNa(smiles) {
    const can = canonSmiles(smiles);
    if (!can || !hasSubstruct(can, '[CX4][OH]')) return { main: null, byProducts: [] };
    const p = applyRxnSmarts(can, '[CX4:1][OH]>>[CX4:1][O-]');
    if (p.length > 0) return { main: p[0], byProducts: [] };
    return { main: null, byProducts: [] };
  }

  // ── カニッツァロ反応（α水素を持たないアルデヒド）──────────────────────
  // ルール: 2 RCHO + NaOH → RCOO⁻Na⁺（主）+ R-CH₂OH（副）
  // 適用条件: α水素を持たないアルデヒド
  //   ① ホルムアルデヒド HCHO（α-C なし）
  //   ② 芳香族アルデヒド Ar-CHO（α-C が芳香環）
  //   ③ α-C が4級炭素（H=0）のアルデヒド（例: ピバルアルデヒド）
  function computeCannizzaro(smiles) {
    const can = canonSmiles(smiles);
    if (!can) return { main: null, byProducts: [] };

    // α水素なしアルデヒドの判定
    const isFormaldehyde    = hasSubstruct(can, '[CX3H2]=O');
    const isAromaticAld     = hasSubstruct(can, '[c][CX3H1]=O');
    const isAlphaQuaternary = hasSubstruct(can, '[CX4H0][CX3H1]=O');
    if (!isFormaldehyde && !isAromaticAld && !isAlphaQuaternary)
      return { main: null, byProducts: [] };

    // 主生成物: R-COO⁻
    // 副生成物: R-CH₂OH
    let saltSmarts, alcSmarts;
    if (isFormaldehyde) {
      saltSmarts = '[CX3H2:1]=O>>[C:1](=O)[O-]';
      alcSmarts  = '[CX3H2:1]=O>>[CH3:1][OH]';
    } else {
      saltSmarts = '[CX3H1:1]=O>>[C:1](=O)[O-]';
      alcSmarts  = '[CX3H1:1]=O>>[CH2:1][OH]';
    }
    const saltP = applyRxnSmarts(can, saltSmarts);
    const alcP  = applyRxnSmarts(can, alcSmarts);
    if (saltP.length === 0) return { main: null, byProducts: [] };

    const byProducts = alcP.length > 0 ? [alcP[0]] : [];
    return { main: saltP[0], byProducts };
  }

  // ── ヨードホルム反応（CH₃CO-R / CH₃CH(OH)-R → R-COO⁻ + CHI₃） ─────────
  function computeIodoform(smiles) {
    const can = canonSmiles(smiles);
    if (!can) return { main: null, byProducts: [] };

    // 候補 SMARTS（優先順: ケトン/アルデヒド → アルコール）
    // R は H (#1 implicit) または C (#6) のみ。O/N 隣接は不可。
    const cases = [
      // CH₃CHO型（R=H, アルデヒド）
      { check: '[CH3][CX3H1]=O',            smarts: '[CH3][CX3H1:1]=O>>[C:1](=O)[O-]' },
      // CH₃CO-C型（R=C, ケトン）
      { check: '[CH3][CX3H0](=O)[#6]',      smarts: '[CH3][CX3H0:1](=O)[#6:2]>>[#6:2][C:1](=O)[O-]' },
      // CH₃CH₂OH型（R=H, 1級アルコール）
      { check: '[CH3][CX4H2][OH]',           smarts: '[CH3][CX4H2:1][OH]>>[CH:1](=O)[O-]' },
      // CH₃CHOH-C型（R=C, 2級アルコール）
      { check: '[CH3][CX4H1]([OH])[#6]',     smarts: '[CH3][CX4H1:1]([OH])[#6:2]>>[#6:2][C:1](=O)[O-]' },
    ];

    for (const c of cases) {
      if (!hasSubstruct(can, c.check)) continue;
      const p = applyRxnSmarts(can, c.smarts);
      if (p.length > 0) {
        const unique = [...new Set(p)];
        return { main: unique[0], byProducts: unique.slice(1) };
      }
    }

    return { main: null, byProducts: [] };
  }

  // ── アミン塩 + NaOH → 遊離アミン ────────────────────────────────────────
  function computeAmiNaohFree(smiles) {
    const can = canonSmiles(smiles);
    if (!can || !hasSubstruct(can, '[NH3+]')) return { main: null, byProducts: [] };
    // ArNH3+ → ArNH2
    const p = applyRxnSmarts(can, '[c:1][NH3+]>>[c:1][NH2]');
    if (p.length > 0) return { main: p[0], byProducts: [] };
    // 脂肪族アミン塩
    const p2 = applyRxnSmarts(can, '[CX4:1][NH3+]>>[CX4:1][NH2]');
    if (p2.length > 0) return { main: p2[0], byProducts: [] };
    return { main: null, byProducts: [] };
  }

  // ── プロダクト計算（メイン） ─────────────────────────────────────────────

  function computeProducts(reactantSmiles, reactionId, coReactantSmiles) {
    // エステル＋グリニャール試薬: 特殊処理（2当量の R 付加 + R2-OH 副生成物）
    if (coReactantSmiles && reactionId === 'est_grignard') {
      return computeEsterGrignard(reactantSmiles, coReactantSmiles);
    }
    // グリセリン + カルボン酸 → トリグリセリド
    if (coReactantSmiles && reactionId === 'gly_triglyceride') {
      return computeGlyTriglyceride(reactantSmiles, coReactantSmiles);
    }
    // 酸無水物のモノエステル化
    if (coReactantSmiles && reactionId === 'anh_monoester') {
      return computeAnhMonoester(reactantSmiles, coReactantSmiles);
    }
    // 酸無水物のジエステル化
    if (coReactantSmiles && reactionId === 'anh_diester') {
      return computeAnhDiester(reactantSmiles, coReactantSmiles);
    }
    // 共反応物が指定された場合は二分子反応に委譲
    if (coReactantSmiles) {
      return computeProductsBimol(reactantSmiles, coReactantSmiles, reactionId);
    }

    const rdk = RDK();
    if (!rdk) return [];

    // ── オゾン分解①②（専用ルーティング） ───────────────────────────────────────
    if (reactionId === 'alk_ozonolysis_red' || reactionId === 'alk_ozonolysis_ox') {
      const can0 = canonSmiles(reactantSmiles);
      if (!can0) return [];
      const { main, byProducts } = reactionId === 'alk_ozonolysis_red'
        ? computeOzonolysisReductive(can0)
        : computeOzonolysisOxidative(can0);
      if (!main) return [];
      const mainMolId = registerDynMol(main);
      if (!mainMolId) return [];
      const byProdResults = byProducts
        .map(smi => { const id = registerDynMol(smi); return id ? { smiles: smi, molId: id, nameJa: nameJa(smi) ?? smi, formula: getFormula(smi) ?? '' } : null; })
        .filter(Boolean);
      return [{ smiles: main, molId: mainMolId, nameJa: nameJa(main) ?? main, formula: getFormula(main) ?? '', byProducts: byProdResults }];
    }

    // ── KMnO₄ 酸化開裂（酸性・加熱） ─────────────────────────────────────────
    if (reactionId === 'alk_kmno4_acid') {
      const can0 = canonSmiles(reactantSmiles);
      if (!can0) return [];
      const { main, byProducts } = computeAlkeneKMnO4Acid(can0);
      if (!main) return [];
      const mainMolId = registerDynMol(main);
      if (!mainMolId) return [];
      const byProdResults = byProducts
        .map(smi => { const id = registerDynMol(smi); return id ? { smiles: smi, molId: id, nameJa: nameJa(smi) ?? smi, formula: getFormula(smi) ?? '' } : null; })
        .filter(Boolean);
      return [{ smiles: main, molId: mainMolId, nameJa: nameJa(main) ?? main, formula: getFormula(main) ?? '', byProducts: byProdResults }];
    }

    // ── アルカン多段階ハロゲン化（専用ルーティング） ──────────────────────────
    if (reactionId === 'aka_chlorinate' || reactionId === 'aka_brominate') {
      const halogen = reactionId === 'aka_chlorinate' ? 'Cl' : 'Br';
      const can0 = canonSmiles(reactantSmiles);
      if (!can0) return [];
      const { main, byProducts } = computeAlkaneHaloProd(can0, halogen);
      if (!main) return [];
      const mainMolId = registerDynMol(main);
      if (!mainMolId) return [];
      const byProdResults = byProducts
        .map(smi => { const id = registerDynMol(smi); return id ? { smiles: smi, molId: id, nameJa: nameJa(smi) ?? smi, formula: getFormula(smi) ?? '' } : null; })
        .filter(Boolean);
      return [{ smiles: main, molId: mainMolId, nameJa: nameJa(main) ?? main, formula: getFormula(main) ?? '', byProducts: byProdResults }];
    }

    // ── 専用関数が必要な反応のルーティング ──────────────────────────────────
    const _specialFns = {
      alc_oxidize:       computeAlcOxidize,
      alc_dehydrate:     computeAlcDehydrate,
      hal_koh_elim:      computeHalKohElim,
      alc_ether:         computeAlcEther,
      alc_na:            computeAlcNa,
      ar_h2_add:         computeArH2Add,
      ar_side_oxidize:   computeArSideOxidize,
      ar_kmno4_oxidize:  computeArKMnO4Oxidize,
      cumene_cleave:     computeCumeneCleavage,
      phe_kolbe:         computePheKolbe,
      formic_dehydrate:  computeFormicDehydrate,
      cac2_water:        computeCaC2Water,
      ar_v2o5_anhydride: computeArV2O5Anhydride,
      ar_sidechain_cl:   computeArSideChainCl,
      aly_dimerize:      computeAlyDimerize,
      aly_trimerize:     computeAlyTrimerize,
      aly_hbr_add:       (smi) => computeAlyGroupAdd(smi, 'Br'),
      aly_hcl_add:       (smi) => computeAlyGroupAdd(smi, 'Cl'),
      aly_hcn_add:       (smi) => computeAlyGroupAdd(smi, 'C#N'),
      aly_h2o_add:       computeAlyH2OAdd,
      aca_anhydride_intra: computeIntraAnhydride,
      aca_anhydride_inter: computeInterAnhydride,
      aca_calcium_salt:    computeCalciumSalt,
      aca_ca_ketonize:     computeCalciumKetonize,
      aca_triglyceride:    computeAcaTriglyceride,
      gly_saponify:        computeTriSaponify,
      est_nitro:           computeNitroEster,
      lactone_form:        computeLactoneForm,
      lactone_open:        computeLactoneOpen,
      hcl_weak_acid_free:  computeWeakAcidFree,
      ami2_hydrolysis_base: computeAmideHydrolBase,
      ami2_hydrolysis_acid: computeAmideHydrolAcid,
      ami_naoh_free:     computeAmiNaohFree,
      det_iodoform:      computeIodoform,
      ald_cannizzaro:    computeCannizzaro,
    };
    if (_specialFns[reactionId]) {
      const result = _specialFns[reactionId](reactantSmiles);
      const { main, byProducts, message } = result;
      // メッセージのみ（3級アルコール酸化など）→ message を結果に含めて返す
      if (!main && message) return [{ message }];
      if (!main) return [];
      const mainMolId = registerDynMol(main);
      if (!mainMolId) return [];
      const byProdResults = (byProducts ?? [])
        .map(smi => { const id = registerDynMol(smi); return id ? { smiles: smi, molId: id, nameJa: nameJa(smi) ?? smi, formula: getFormula(smi) ?? '' } : null; })
        .filter(Boolean);
      return [{ smiles: main, molId: mainMolId, nameJa: nameJa(main) ?? main, formula: getFormula(main) ?? '', byProducts: byProdResults }];
    }

    // ── 検出反応は computeProducts では扱わない（runDetection を使用） ──────
    if (isDetectionReaction(reactionId)) return [];

    // ── 説明型反応は computeProducts では扱わない（runInformational を使用） ──
    if (isInformationalReaction(reactionId)) return [];

    const rxSmarts = RXN_SMARTS[reactionId];
    if (!rxSmarts) return [];

    const can = canonSmiles(reactantSmiles);
    if (!can) return [];

    let rawProducts = applyRxnSmarts(can, rxSmarts);

    // EAS は位置選択性で最良プロダクト1つに絞る
    const newSubId = EAS_NEW_SUB[reactionId];

    // フォールバック①: EAS 反応で SMARTS が失敗した場合は直接 SMILES 構築
    // （置換ベンゼンへの適用時に RDKit の sanitization が失敗するケースに対応）
    if (rawProducts.length === 0 && newSubId) {
      const newSubSmi = SUB_SMILES_MAP[newSubId];
      if (newSubSmi) rawProducts = buildEASCandidates(can, newSubSmi);
    }
    // フォールバック②: 芳香族置換基スワップ反応（ar_nitro_reduce, ami_diazo 等）
    // applyRxnSmarts が RDKit.js WASM の制限で失敗する場合に直接 SMILES を構築する
    if (rawProducts.length === 0 && hasSubstruct(can, 'c1ccccc1')) {
      const swapCfg = SUB_SWAP_FALLBACK[reactionId];
      if (swapCfg) {
        rawProducts = buildSubSwapCandidates(can, swapCfg.fromId, swapCfg.toSmiles);
      }
    }
    if (rawProducts.length === 0) return [];

    // 重複除去
    const unique = [...new Set(rawProducts)];
    let chosen, byProductSmiles;
    if (newSubId) {
      const best = pickBestProduct(unique, can, newSubId);
      chosen = best ? [best] : [unique[0]];
      // EAS 副生成物: 選ばれなかったすべての候補（重複なし）
      byProductSmiles = unique.filter(s => s !== chosen[0]);
    } else {
      // 1等量反応: 生成物は1種のみ
      chosen = unique.length > 0 ? [unique[0]] : [];
      byProductSmiles = [];
    }

    return chosen.map(smi => {
      const molId = registerDynMol(smi);
      const byProdResults = byProductSmiles
        .map(bs => { const id = registerDynMol(bs); return id ? { smiles: bs, molId: id, nameJa: nameJa(bs) ?? bs, formula: getFormula(bs) ?? '' } : null; })
        .filter(Boolean);
      return {
        smiles: smi,
        molId,
        nameJa: nameJa(smi) ?? smi,
        formula: getFormula(smi) ?? '',
        byProducts: byProdResults,
      };
    }).filter(r => r.smiles && r.molId);
  }

  // ── 適用可否チェック ─────────────────────────────────────────────────────

  // ベンゼン環上に同一の置換基が3個ある場合のブロック用 SMARTS 集合
  // 環状 1,2,3 / 1,2,4 / 1,3,5 の全パターンをカバー
  function _hasThreeSameGroupOnRing(smiles, group) {
    const patterns = [
      `c1(${group})c(${group})c(${group})ccc1`,   // 1,2,3
      `c1(${group})c(${group})cc(${group})cc1`,   // 1,2,4
      `c1(${group})cc(${group})cc(${group})c1`,   // 1,3,5
    ];
    return patterns.some(p => hasSubstruct(smiles, p));
  }

  function canApply(reactantSmiles, reactionId) {
    const rdk = RDK();
    if (!rdk) return false;

    // ニトロ化: 既にベンゼン環上にNO₂が3つあれば適用不可
    if (reactionId === 'ar_nitration') {
      if (_hasThreeSameGroupOnRing(reactantSmiles, '[N+](=O)[O-]')) return false;
    }
    // スルホン化: 既にベンゼン環上にSO₃Hが3つあれば適用不可
    if (reactionId === 'ar_sulfonation') {
      if (_hasThreeSameGroupOnRing(reactantSmiles, 'S(=O)(=O)O')) return false;
    }

    // アルカン多段階ハロゲン化: 純粋なアルカン/ハロアルカンかどうかを精密チェック
    if (reactionId === 'aka_chlorinate' || reactionId === 'aka_brominate') {
      return isAlkaneOrHaloalkane(reactantSmiles);
    }

    // 検出反応: APPLY_CHECK で構造チェック（RXN_SMARTS は不要）
    if (isDetectionReaction(reactionId)) {
      const check = APPLY_CHECK[reactionId];
      if (!check) return false;
      return hasSubstruct(reactantSmiles, check);
    }

    // 説明型反応: APPLY_CHECK で構造チェック（RXN_SMARTS は不要）
    if (isInformationalReaction(reactionId)) {
      const check = APPLY_CHECK[reactionId];
      if (!check) return false;
      return hasSubstruct(reactantSmiles, check);
    }

    // 専用関数を持つ反応も APPLY_CHECK のみで可否判定
    const _specialIds = new Set([
      'alc_oxidize', 'alc_dehydrate', 'hal_koh_elim', 'alc_ether', 'alc_na',
      'ar_h2_add', 'ar_side_oxidize', 'ar_kmno4_oxidize',
      'cumene_cleave', 'phe_kolbe', 'formic_dehydrate', 'cac2_water',
      'ar_v2o5_anhydride', 'ar_sidechain_cl', 'aly_dimerize', 'aly_trimerize',
      'aly_hbr_add', 'aly_hcl_add', 'aly_hcn_add', 'aly_h2o_add',
      'aca_anhydride_intra', 'aca_anhydride_inter', 'aca_calcium_salt', 'aca_ca_ketonize',
      'aca_triglyceride', 'gly_saponify', 'ald_cannizzaro',
      'est_nitro', 'lactone_form', 'lactone_open', 'hcl_weak_acid_free',
      'ami2_hydrolysis_base', 'ami2_hydrolysis_acid',
      'ami_naoh_free', 'det_iodoform',
    ]);
    if (_specialIds.has(reactionId)) {
      const check = APPLY_CHECK[reactionId];
      if (!check) return false;
      return hasSubstruct(reactantSmiles, check);
    }

    // SMARTS テンプレートが定義されている反応のみ動的対応
    if (!RXN_SMARTS[reactionId]) return false;

    const check = APPLY_CHECK[reactionId];
    if (!check) return false;
    return hasSubstruct(reactantSmiles, check);
  }

  // ── 実際にプロダクト計算してキャッシュする精密チェック ───────────────────

  const _applyCache = new Map();

  // 実際に computeProducts を試みて結果をキャッシュ（false positive を除去）
  function canApplyFull(reactantSmiles, reactionId) {
    if (!reactantSmiles) return false;
    const key = `${reactantSmiles}||${reactionId}`;
    if (_applyCache.has(key)) return _applyCache.get(key);
    // まず高速 SMARTS チェックで除外
    if (!canApply(reactantSmiles, reactionId)) {
      _applyCache.set(key, false);
      return false;
    }
    // 実際にプロダクト生成を試みる
    const products = computeProducts(reactantSmiles, reactionId);
    const ok = products.length > 0;
    _applyCache.set(key, ok);
    return ok;
  }

  function clearProductCache() {
    _applyCache.clear();
  }

  // ── EAS 反応マップ（電子効果による各位置の反応性） ──────────────────────────
  // 返り値: null（芳香環なし）または
  //   { subs: [{nameJa, dir, count}], positions: [{label, score, isIpso}] }
  //   positions: 6要素、hexのトップから時計回り（index 0=top, 1, 2, ...5）
  //   score > 0: 有利（EDGのo/p、またはEWGのm）
  //   score < 0: 不利
  //   score = 0: 無置換ベンゼン（中性）
  //   isIpso: その位置に置換基が付いている

  function getEasActivationMap(smiles) {
    const rdk = RDK();
    if (!rdk) return null;
    if (!hasSubstruct(smiles, 'c1ccccc1')) return null;

    const can = canonSmiles(smiles);
    if (!can) return null;

    let mol = null, ringPat = null;
    try {
      mol = rdk.get_mol(can);
      if (!mol) return null;

      // ベンゼン環の原子インデックス（SMARTS順＝環の隣接順）を取得
      ringPat = rdk.get_qmol('c1ccccc1');
      if (!ringPat) { mol.delete(); return null; }
      const ringMatchRaw = mol.get_substruct_match(ringPat);
      ringPat.delete(); ringPat = null;
      if (!ringMatchRaw || ringMatchRaw === '{}') { mol.delete(); return null; }

      const ringAtoms = JSON.parse(ringMatchRaw).atoms; // [i0,i1,i2,i3,i4,i5] 環順
      if (!ringAtoms || ringAtoms.length !== 6) { mol.delete(); return null; }

      // 各環位置のスコアと置換基有無
      const scores = new Array(6).fill(0);      // 環順インデックスでのスコア
      const isIpso  = new Array(6).fill(false); // 置換基ありフラグ

      const subs = detectRingSubstituents(can);

      for (const { def } of subs) {
        let subPat = null;
        try {
          subPat = rdk.get_qmol(`[c:1]${def.smarts}`);
          if (!subPat) continue;
          const subMatchRaw = mol.get_substruct_match(subPat);
          subPat.delete(); subPat = null;
          if (!subMatchRaw || subMatchRaw === '{}') continue;

          const ipsoAtomIdx = JSON.parse(subMatchRaw).atoms[0];
          const ipsoPos = ringAtoms.indexOf(ipsoAtomIdx);
          if (ipsoPos === -1) continue;

          isIpso[ipsoPos] = true;

          for (let i = 0; i < 6; i++) {
            if (i === ipsoPos) continue;
            const dist = Math.min(
              Math.abs(i - ipsoPos),
              6 - Math.abs(i - ipsoPos)
            );
            // dist 1=ortho, 2=meta, 3=para
            if (def.dir === 'op') {
              if (dist === 1 || dist === 3) scores[i] += 2;
              else scores[i] -= 1; // meta は不利
            } else { // meta director (EWG)
              if (dist === 2) scores[i] += 1; // meta は相対的に有利（でも全体は不活性化）
              else scores[i] -= 2; // ortho/para は不利
            }
          }
        } catch (_) {
          if (subPat) try { subPat.delete(); } catch (_2) {}
        }
      }

      mol.delete();

      // EWG が存在する場合は全体を不活性化されていることを示すオフセット
      const hasEwg = subs.some(s => s.def.dir === 'm');
      const hasEdg = subs.some(s => s.def.dir === 'op');

      return {
        subs: subs.map(s => ({ nameJa: s.def.nameJa, dir: s.def.dir, count: s.count })),
        hasEwg,
        hasEdg,
        positions: ringAtoms.map((_, i) => ({
          score: scores[i],
          isIpso: isIpso[i],
        })),
      };
    } catch (e) {
      if (mol) try { mol.delete(); } catch (_) {}
      if (ringPat) try { ringPat.delete(); } catch (_) {}
      return null;
    }
  }

  // ── 公開 API ─────────────────────────────────────────────────────────────
  return {
    nameJa, computeProducts, canApply, canApplyFull, clearProductCache,
    getFormula, registerDynMol,
    canApplyBimol, getCoReactantSmarts, findCoReactants,
    getEasActivationMap,
    isDetectionReaction, runDetection,
    isInformationalReaction, runInformational,
  };

})();
