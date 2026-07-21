/* ============================================================
   有機化学クイズ — 分子図鑑 拡張データ
   ------------------------------------------------------------
   各分子について以下の充実版フィールドを保持:
     - synthesisRoutes[]    反応式付き合成法（実験室モード風）
     - downstream[]         有名な下流合成連鎖
     - detectionReactions[] 検出反応（陽性＋検出として常用される陰性）
     - isomers{}            異性体（structural/geometric/optical/conformers）
     - stereochemistry      立体化学の解説文
   このオブジェクトは app.js 内の molecules dict に Object.assign でマージされる。
   既存の majorSyntheses / detectionTests / 配列型 isomers は破壊しない。
   ============================================================ */
(function (global) {
  'use strict';

  global.OrgQuizMoleculeEnrichment = {

    benzene: {
      synthesisRoutes: [
        {
          id: "benzene_acetylene_trimerization",
          name: "アセチレンの三量化（Berthelot 反応）",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "アセチレン", formula: "C₂H₂", molKey: "ethyne", count: 3 }],
            coReagents: [],
            catalyst: "鉄（赤熱した鉄管）または活性炭",
            conditions: "約 500 °C、加熱した鉄管を通す",
            products: [{ name: "ベンゼン", formula: "C₆H₆", molKey: "benzene" }],
            byProducts: []
          },
          shortNote: "アセチレン3分子が赤熱鉄管を通る際に環化三量化してベンゼンを与える。",
          detail: "1866年に Berthelot により報告された古典反応。3 C₂H₂ → C₆H₆ で量論的にきれいに進む。\n\n工業合成にはほとんど使われない（収率が低く副反応が多い）が、高校化学では「アセチレンからベンゼン」の代表反応として頻出。触媒に活性炭や鉄管を用いる例が知られる。",
          sources: ["Wikipedia: ベンゼン", "高校化学 各社教科書"]
        },
        {
          id: "benzene_decarboxylation",
          name: "安息香酸ナトリウムの脱炭酸",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "安息香酸ナトリウム", formula: "C₆H₅COONa", molKey: "sodiumBenzoate" }],
            coReagents: [{ name: "水酸化ナトリウム", formula: "NaOH", molKey: "sodiumHydroxide" }],
            catalyst: "ソーダ石灰（CaO+NaOH）",
            conditions: "強熱（乾留）",
            products: [{ name: "ベンゼン", formula: "C₆H₆", molKey: "benzene" }],
            byProducts: [{ name: "炭酸ナトリウム", formula: "Na₂CO₃", molKey: "sodiumCarbonate" }]
          },
          shortNote: "安息香酸ナトリウムをソーダ石灰とともに加熱すると脱炭酸してベンゼンが得られる。",
          detail: "C₆H₅COONa + NaOH → C₆H₆ + Na₂CO₃\n\nソーダ石灰（CaO+NaOH の混合物）を用いることで NaOH の融解・潮解を抑え、固体反応として実施できる。高校化学でカルボン酸塩の脱炭酸の代表例として教えられる。脂肪酸塩でも同様（酢酸ナトリウム→メタン）。実用合成というより教科書上の反応。",
          sources: ["Wikipedia: 脱炭酸", "高校化学 各社教科書"]
        },
        {
          id: "benzene_petroleum_reforming",
          name: "石油の接触改質（工業的）",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "シクロヘキサン", formula: "C₆H₁₂", molKey: "cyclohexane" }],
            coReagents: [],
            catalyst: "Pt/Al₂O₃ など",
            conditions: "約 500 °C、数気圧",
            products: [{ name: "ベンゼン", formula: "C₆H₆", molKey: "benzene" }],
            byProducts: [{ name: "水素", formula: "H₂", molKey: "hydrogen", count: 3 }]
          },
          shortNote: "ナフサ留分中のシクロヘキサン等を脱水素・芳香族化してベンゼンを得る。BTX 留分の主要供給法。",
          detail: "工業的にはベンゼンの大半が石油の接触改質（catalytic reforming）で得られる。\n\nシクロヘキサン → ベンゼン + 3 H₂（脱水素芳香族化）。同時にトルエン・キシレンも得られ、これらをまとめて BTX 留分と呼ぶ。別経路として石炭の乾留（コークス製造）の副産物コールタールからの分留もあるが、現代では石油由来が主流。",
          sources: ["Wikipedia: ベンゼン", "Wikipedia: 接触改質"]
        }
      ],
      downstream: [
        {
          name: "ニトロ化→還元によるアニリン合成",
          leadsTo: ["nitrobenzene", "aniline"],
          shortNote: "濃硝酸＋濃硫酸でニトロベンゼン、続いて Sn/HCl 還元でアニリン。"
        },
        {
          name: "クメン法によるフェノールとアセトンの併産",
          leadsTo: ["cumene", "cumeneHydroperoxide", "phenol", "acetone"],
          shortNote: "ベンゼン+プロペン→クメン→空気酸化→酸転位でフェノール+アセトン。"
        },
        {
          name: "エチルベンゼン経由のスチレン/ポリスチレン",
          leadsTo: ["ethylbenzene", "styrene", "polystyrene"],
          shortNote: "ベンゼン+エチレン→エチルベンゼン→脱水素でスチレン、重合でポリスチレン。"
        }
      ],
      detectionReactions: [
        {
          reagent: "Br₂ 水",
          result: "negative",
          observation: "脱色しない",
          significance: "アルケン・アルキン的に反応する不飽和結合がないことを示す（共鳴安定化のため付加が起こらない）",
          commonlyUsed: true,
          detail: "アルケン・アルキンは Br₂ 水を即座に脱色するが、ベンゼンは芳香族安定化のため付加反応が起こらず、Br₂ 水の褐色が残る。脂肪族不飽和の有無を判別する標準的な方法。"
        },
        {
          reagent: "KMnO₄（冷・希）",
          result: "negative",
          observation: "赤紫色が脱色しない",
          significance: "酸化されやすい不飽和結合や活性なベンジル位 C-H がないことを示す",
          commonlyUsed: true,
          detail: "ベンゼン環自体は KMnO₄ では酸化されない。一方、ベンゼン環に側鎖アルキル基が付くと熱した KMnO₄ でベンジル位が酸化されカルボン酸になる（トルエン→安息香酸）。ベンゼンの陰性結果はこの判別の対照として重要。"
        },
        {
          reagent: "Br₂ + FeBr₃（または Fe）",
          result: "positive",
          observation: "HBr 発生、ブロモベンゼン生成",
          significance: "芳香族求電子置換反応（ハロゲン化）が起こる",
          commonlyUsed: false,
          detail: "C₆H₆ + Br₂ → C₆H₅Br + HBr。ベンゼン環の特徴的な反応様式は付加ではなく置換である点でアルケンと対比される。"
        }
      ],
      isomersDetail: {
        structural: [],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "正六角形の平面分子。すべての炭素・水素が等価で、不斉炭素もシス・トランス異性も存在しない。"
    },

    toluene: {
      synthesisRoutes: [
        {
          id: "toluene_petroleum_reforming",
          name: "石油の接触改質（工業的）",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "メチルシクロヘキサン", formula: "C₇H₁₄", molKey: "methylcyclohexane" }],
            coReagents: [],
            catalyst: "Pt/Al₂O₃ など",
            conditions: "約 500 °C、数気圧",
            products: [{ name: "トルエン", formula: "C₇H₈", molKey: "toluene" }],
            byProducts: [{ name: "水素", formula: "H₂", molKey: "hydrogen", count: 3 }]
          },
          shortNote: "ナフサ留分のメチルシクロヘキサン等を脱水素芳香族化して得る。BTX 留分の主成分の一つ。",
          detail: "工業的にはベンゼン・キシレンとともに石油の接触改質で大量生産される（BTX 留分の T）。\n\nメチルシクロヘキサン → トルエン + 3 H₂。ガソリンのオクタン価向上剤としても重要で、トルエン需要の多くはこの用途。化学原料としてはニトロ化（→TNT）、酸化（→安息香酸）の出発物質として頻出。",
          sources: ["Wikipedia: トルエン", "Wikipedia: 接触改質"]
        },
        {
          id: "toluene_friedel_crafts",
          name: "ベンゼンの Friedel–Crafts メチル化",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "ベンゼン", formula: "C₆H₆", molKey: "benzene" }],
            coReagents: [{ name: "クロロメタン", formula: "CH₃Cl", molKey: "chloromethane" }],
            catalyst: "AlCl₃（無水）",
            conditions: "室温〜加熱",
            products: [{ name: "トルエン", formula: "C₇H₈", molKey: "toluene" }],
            byProducts: [{ name: "塩化水素", formula: "HCl", molKey: "hydrogenChloride" }]
          },
          shortNote: "ベンゼンに AlCl₃ 触媒下でハロゲン化アルキルを反応させる芳香族求電子置換の代表例。",
          detail: "Friedel–Crafts アルキル化の典型例。\n\n機構: AlCl₃ が CH₃Cl を活性化して CH₃⁺ 様カチオンを発生させ、ベンゼン環を求電子置換する。副反応として多置換化（ジ・トリメチルベンゼン）が起こりやすく、収率制御が難しい。実工業ではほぼ用いられないが、学部レベルでは芳香族求電子置換の入門として頻出。",
          sources: ["Wikipedia: フリーデル・クラフツ反応", "Solomons Organic Chemistry §15"]
        }
      ],
      downstream: [
        {
          name: "段階的ニトロ化による TNT 合成",
          leadsTo: ["mononitroToluene", "dinitroToluene", "tnt"],
          shortNote: "濃硝酸＋濃硫酸で段階的にニトロ化、3段階目でトリニトロトルエン（TNT）を得る。"
        },
        {
          name: "側鎖酸化による安息香酸",
          leadsTo: ["benzoicAcid"],
          shortNote: "熱濃 KMnO₄ でメチル基がカルボキシル基に酸化され、安息香酸が得られる。"
        },
        {
          name: "側鎖ハロゲン化によるベンジル誘導体",
          leadsTo: ["benzylAlcohol", "benzaldehyde", "benzoicAcid"],
          shortNote: "光照射下で Cl₂/Br₂ と反応し塩化ベンジル等を経由、加水分解・酸化でベンジル系化合物群へ。"
        }
      ],
      detectionReactions: [
        {
          reagent: "KMnO₄（熱・酸性または中性）",
          result: "positive",
          observation: "赤紫色が脱色し、安息香酸が析出",
          significance: "ベンゼン環に酸化されうる側鎖アルキル基（ベンジル位 C-H）があることを示す",
          commonlyUsed: true,
          detail: "メチル基などのベンジル位 C-H は加熱した KMnO₄ によってカルボキシル基まで酸化される（C₆H₅CH₃ → C₆H₅COOH）。tert-ブチルベンゼンのようにベンジル位 H が無い場合は酸化されない点も対比される頻出問題。"
        },
        {
          reagent: "Br₂（光照射、無触媒）",
          result: "positive",
          observation: "側鎖の H が Br に置換、HBr 発生",
          significance: "側鎖反応（ラジカル機構）の進行を示す",
          commonlyUsed: true,
          detail: "光照射下ではラジカル機構でベンジル位の H が引き抜かれ、ブロモメチルベンゼン（臭化ベンジル）が生成する。FeBr₃ 触媒下では逆に環の置換が起こる（→ o-/p-ブロモトルエン）。条件で生成物が変わる代表例。"
        },
        {
          reagent: "Br₂ 水",
          result: "negative",
          observation: "脱色しない",
          significance: "脂肪族不飽和結合がないことを示す（芳香族環は反応しない）",
          commonlyUsed: true,
          detail: "ベンゼンと同様、芳香族安定化により Br₂ 水とは反応しない。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "norbornadiene", note: "同じ C₇H₈ の構造異性体（脂肪族二環）。高校範囲外。" },
          { molKey: "cycloheptatriene", note: "同じ C₇H₈ の構造異性体（7員環トリエン）。高校範囲外。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "メチル基が一つだけ付いた一置換ベンゼン。位置異性も不斉炭素も存在しない。"
    },

    naphthalene: {
      synthesisRoutes: [
        {
          id: "naphthalene_coal_tar",
          name: "コールタールからの分留（工業的）",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "コールタール（中油留分）", formula: "—", molKey: null }],
            coReagents: [],
            catalyst: "",
            conditions: "分留・冷却晶析（170〜230 °C 留分）",
            products: [{ name: "ナフタレン", formula: "C₁₀H₈", molKey: "naphthalene" }],
            byProducts: []
          },
          shortNote: "石炭の乾留で得られるコールタールの中油留分から分留・晶析して得る。",
          detail: "ナフタレンの伝統的な工業的供給源はコールタール（石炭乾留の副産物）である。\n\nコールタール中に約 10% 含まれ、中油留分から冷却晶析で分離される。近年は石油由来の留分（重質改質油）からも生産される。防虫剤として古くから使われてきたが、近年は p-ジクロロベンゼン等への置き換えが進んでいる。",
          sources: ["Wikipedia: ナフタレン", "Wikipedia: コールタール"]
        }
      ],
      downstream: [
        {
          name: "酸化による無水フタル酸合成",
          leadsTo: ["phthalicAnhydride", "phthalicAcid"],
          shortNote: "V₂O₅ 触媒、空気酸化で無水フタル酸を与える（工業的に重要な経路）。"
        },
        {
          name: "ナフトール類への変換",
          leadsTo: ["naphthol"],
          shortNote: "スルホン化→アルカリ融解で 2-ナフトール。染料・香料中間体として重要。"
        }
      ],
      detectionReactions: [
        {
          reagent: "Br₂ 水",
          result: "negative",
          observation: "脱色しない",
          significance: "脂肪族不飽和ではなく芳香族であることを示す",
          commonlyUsed: false,
          detail: "ベンゼン同様、芳香族安定化のため付加反応は起こらない。ただし反応性はベンゼンより高く、FeBr₃ 触媒下では容易にモノブロモ置換体（主として 1-位）を与える。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "azulene", note: "同じ C₁₀H₈ の構造異性体（5員＋7員の縮環芳香族、青色）。大学初級レベル。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "二環縮合の平面分子。全原子が同一平面上にあり、不斉炭素や立体異性は存在しない。"
    },

    anthracene: {
      synthesisRoutes: [
        {
          id: "anthracene_coal_tar",
          name: "コールタールからの分留（工業的）",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "コールタール（アントラセン油留分）", formula: "—", molKey: null }],
            coReagents: [],
            catalyst: "",
            conditions: "高沸点留分（300〜400 °C）の分留・再結晶",
            products: [{ name: "アントラセン", formula: "C₁₄H₁₀", molKey: "anthracene" }],
            byProducts: [{ name: "フェナントレン（同伴）", formula: "C₁₄H₁₀", molKey: "phenanthrene" }]
          },
          shortNote: "コールタールの高沸点留分（アントラセン油）から分留・再結晶して得られる。フェナントレンと同伴。",
          detail: "アントラセンはコールタールのアントラセン油留分（沸点 300〜400 °C）の主成分。\n\n同じ C₁₄H₁₀ のフェナントレンと混在するため、再結晶で分離する。工業的にはアントラキノン（染料アリザリンの前駆体、パルプ漂白触媒）の原料として重要。",
          sources: ["Wikipedia: アントラセン", "Wikipedia: コールタール"]
        }
      ],
      downstream: [
        {
          name: "酸化によるアントラキノン合成",
          leadsTo: [],
          shortNote: "中央環の 9,10 位が酸化され 9,10-アントラキノンを与える。アリザリンなど染料の中間体。"
        },
        {
          name: "9,10 位での Diels–Alder 反応",
          leadsTo: [],
          shortNote: "中央環がジエンとして働き、無水マレイン酸と容易に付加体を形成する。"
        }
      ],
      detectionReactions: [
        {
          reagent: "紫外線照射",
          result: "positive",
          observation: "青紫色の蛍光を発する",
          significance: "縮合多環芳香族に特徴的な蛍光性",
          commonlyUsed: false,
          detail: "アントラセンは強い蛍光を示す代表例で、有機蛍光体研究の基本物質。高校化学では扱わないが、大学初級で芳香族の電子状態の例として登場することがある。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "phenanthrene", note: "同じ C₁₄H₁₀ の構造異性体。直線縮合（アントラセン）vs 折れ曲がり縮合（フェナントレン）。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "三環直線縮合の平面分子。不斉炭素や立体異性は存在しない。"
    },

    phenanthrene: {
      synthesisRoutes: [
        {
          id: "phenanthrene_coal_tar",
          name: "コールタールからの分留（工業的）",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "コールタール（アントラセン油留分）", formula: "—", molKey: null }],
            coReagents: [],
            catalyst: "",
            conditions: "高沸点留分の分留・晶析",
            products: [{ name: "フェナントレン", formula: "C₁₄H₁₀", molKey: "phenanthrene" }],
            byProducts: [{ name: "アントラセン（同伴）", formula: "C₁₄H₁₀", molKey: "anthracene" }]
          },
          shortNote: "コールタールの高沸点留分から分留・晶析して得る。アントラセンと共存し、再結晶で分離。",
          detail: "アントラセンと同じ C₁₄H₁₀ の異性体で、コールタールのアントラセン油留分にアントラセンと共存する。\n\n三環の縮合様式が折れ曲がり型（angular）である点でアントラセンと区別される。ステロイド骨格（ゴナン）の基本構造を含むため、生化学・天然物化学の基礎構造として重要。",
          sources: ["Wikipedia: フェナントレン", "Wikipedia: コールタール"]
        }
      ],
      downstream: [
        {
          name: "9,10 位の酸化によるフェナントレンキノン",
          leadsTo: [],
          shortNote: "中央環の 9,10 位が酸化され 9,10-フェナントレンキノンを与える。"
        }
      ],
      detectionReactions: [],
      isomersDetail: {
        structural: [
          { molKey: "anthracene", note: "同じ C₁₄H₁₀ の構造異性体。三環の縮合様式が直線（アントラセン）か折れ曲がり（フェナントレン）かで区別される。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "三環折れ曲がり縮合の概ね平面分子。不斉炭素や立体異性は存在しないが、4位と5位の H が立体障害的に近接するため、わずかにねじれる傾向がある。"
    },

    // ── バッチ 2: 多環/特殊芳香族 ──────────────────────────

    biphenyl: {
      synthesisRoutes: [
        {
          id: "biphenyl_benzene_pyrolysis",
          name: "ベンゼンの熱二量化（工業的）",
          type: "industrial",
          famous: false,
          equation: {
            reactants: [{ name: "ベンゼン", formula: "C₆H₆", molKey: "benzene", count: 2 }],
            coReagents: [],
            catalyst: "",
            conditions: "約 700〜800 °C、気相熱分解",
            products: [{ name: "ビフェニル", formula: "C₁₂H₁₀", molKey: "biphenyl" }],
            byProducts: [{ name: "水素", formula: "H₂", molKey: "hydrogen" }]
          },
          shortNote: "ベンゼン2分子を高温で熱分解的にカップリングしてビフェニルを得る。",
          detail: "2 C₆H₆ → C₆H₅-C₆H₅ + H₂\n\n工業的にはベンゼンの高温熱処理で副生する形で得られる。コールタールにも少量含まれる。主用途は熱媒体（ジフェニルエーテルとの共晶混合物 Dowtherm A）。",
          sources: ["Wikipedia: ビフェニル"]
        },
        {
          id: "biphenyl_ullmann",
          name: "Ullmann 反応（古典的合成）",
          type: "historical",
          famous: true,
          equation: {
            reactants: [{ name: "ヨードベンゼン", formula: "C₆H₅I", molKey: "iodobenzene", count: 2 }],
            coReagents: [{ name: "銅", formula: "Cu", molKey: "copper", count: 2 }],
            catalyst: "",
            conditions: "200〜300 °C、加熱",
            products: [{ name: "ビフェニル", formula: "C₁₂H₁₀", molKey: "biphenyl" }],
            byProducts: [{ name: "ヨウ化銅(I)", formula: "CuI", molKey: "copperIodide", count: 2 }]
          },
          shortNote: "ヨードベンゼンを銅粉とともに加熱し、2分子をカップリングさせるビアリール合成の古典反応。",
          detail: "2 C₆H₅I + 2 Cu → C₆H₅-C₆H₅ + 2 CuI\n\n1901年に F. Ullmann により報告。現代では Pd 触媒クロスカップリング（鈴木・宮浦反応など）に置き換えられているが、ビアリール（biaryl）合成の歴史的原型として有機化学の教科書に登場する。",
          sources: ["Wikipedia: ウルマン反応"]
        }
      ],
      downstream: [
        {
          name: "酸化的カップリング/水酸化による BINOL 類縁体",
          leadsTo: ["biphenylDiolR", "biphenylDiolS"],
          shortNote: "ヒドロキシ化により 4,4'-, 2,2'-ビフェニルジオールを与え、軸不斉キラル分子の母核となる。"
        },
        {
          name: "液晶材料（4,4'-二置換体）",
          leadsTo: [],
          shortNote: "4-シアノ-4'-アルキルビフェニル（5CB など）は古典的な液晶分子。"
        }
      ],
      detectionReactions: [
        {
          reagent: "Br₂ 水",
          result: "negative",
          observation: "脱色しない",
          significance: "脂肪族不飽和ではなく芳香族であることを示す",
          commonlyUsed: false,
          detail: "ベンゼン同様、芳香族安定化のため付加反応は起こらない。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "acenaphthylene", note: "同じ C₁₂H₁₀ の構造異性体（縮合多環）。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "オルト位が無置換のビフェニル本体は両環の自由回転が可能で光学活性をもたない。" },
        conformers: [
          { name: "ねじれ型（〜44°）", stability: "気相・液相での平衡構造。両ベンゼン環の π 共役と o-H 同士の立体反発の妥協点。" },
          { name: "平面型", stability: "結晶中ではほぼ平面に近い。気相では不安定。" }
        ]
      },
      stereochemistryDetail: "ビフェニル本体には不斉炭素はないが、オルト位に大きな置換基を 4 個導入すると両環の回転が阻害され、軸不斉（atropisomerism）による光学活性が現れる。BINOL や 6,6'-ジニトロ-2,2'-ジフェン酸はその代表例。"
    },

    styrene: {
      synthesisRoutes: [
        {
          id: "styrene_ethylbenzene_dehydrogenation",
          name: "エチルベンゼンの脱水素（工業的）",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "エチルベンゼン", formula: "C₆H₅C₂H₅", molKey: "ethylbenzene" }],
            coReagents: [],
            catalyst: "Fe₂O₃–K₂O 系（鉄カリウム酸化物）",
            conditions: "600〜650 °C、減圧、水蒸気希釈",
            products: [{ name: "スチレン", formula: "C₈H₈", molKey: "styrene" }],
            byProducts: [{ name: "水素", formula: "H₂", molKey: "hydrogen" }]
          },
          shortNote: "エチルベンゼンを高温で脱水素してスチレンを得る。世界のスチレン生産の約 85% を占める基本工程。",
          detail: "C₆H₅-C₂H₅ → C₆H₅-CH=CH₂ + H₂\n\n鉄系触媒上で高温脱水素する平衡反応。水蒸気希釈で平衡を生成側に寄せ、コーキングも抑制する。工業的に圧倒的主流の合成法。ポリスチレン・ABS・SBR など多様な高分子の出発物質となる最重要モノマーの一つ。",
          sources: ["Wikipedia: スチレン", "Wikipedia: エチルベンゼン"]
        }
      ],
      downstream: [
        {
          name: "ラジカル重合によるポリスチレン",
          leadsTo: ["polystyrene"],
          shortNote: "過酸化物開始剤等によるラジカル付加重合で透明な熱可塑性樹脂となる。"
        },
        {
          name: "ブタジエンとの共重合（SBR）",
          leadsTo: [],
          shortNote: "1,3-ブタジエンとの乳化共重合でスチレンブタジエンゴム（合成ゴムの代表）。"
        },
        {
          name: "アクリロニトリル・ブタジエンとの共重合（ABS）",
          leadsTo: [],
          shortNote: "ABS 樹脂の構成モノマーの一つ。家電・自動車部品。"
        }
      ],
      detectionReactions: [
        {
          reagent: "Br₂ 水",
          result: "positive",
          observation: "褐色が即座に脱色",
          significance: "側鎖の C=C（ビニル基）の存在を示す",
          commonlyUsed: true,
          detail: "ベンゼン環は反応しないが、側鎖のビニル基（CH=CH₂）に Br₂ が付加し、1,2-ジブロモ-1-フェニルエタンを与える。芳香族環＋アルケンの両方をもつ分子の典型例として、ベンゼン/トルエンとの判別問題で頻出。"
        },
        {
          reagent: "KMnO₄（冷・希）",
          result: "positive",
          observation: "赤紫色が脱色（MnO₂ の褐色が生じる）",
          significance: "酸化されやすい C=C があることを示す",
          commonlyUsed: true,
          detail: "冷希 KMnO₄ でビニル基がジオール化（さらに過剰だと開裂してベンズアルデヒド/安息香酸へ）。芳香族環は影響を受けない。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "cyclooctatetraene", note: "同じ C₈H₈ の構造異性体（8員環テトラエン、非平面）。" },
          { molKey: "cubane", note: "同じ C₈H₈ の構造異性体（立方体構造、極度の歪み）。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "末端ビニル基（=CH₂）であるため C=C にシス・トランス異性は存在しない。ビニル基はベンゼン環と共役し、ほぼ平面構造をとる。"
    },

    ethylbenzene: {
      synthesisRoutes: [
        {
          id: "ethylbenzene_friedel_crafts",
          name: "ベンゼンとエチレンの Friedel–Crafts アルキル化（工業的）",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "ベンゼン", formula: "C₆H₆", molKey: "benzene" }],
            coReagents: [{ name: "エチレン", formula: "C₂H₄", molKey: "ethene" }],
            catalyst: "AlCl₃（古典）またはゼオライト（ZSM-5 など、現代）",
            conditions: "AlCl₃ 法: 液相 ~150 °C／ゼオライト法: 気相 400〜450 °C",
            products: [{ name: "エチルベンゼン", formula: "C₈H₁₀", molKey: "ethylbenzene" }],
            byProducts: []
          },
          shortNote: "ベンゼンにエチレンを付加させるアルキル化。世界のエチルベンゼン生産のほぼ全量がこの経路。",
          detail: "C₆H₆ + CH₂=CH₂ → C₆H₅-C₂H₅\n\n古典法は AlCl₃ 触媒（Friedel–Crafts）、近年は固体酸であるゼオライト触媒に置き換わりつつある。製品の大半はスチレンへの脱水素に直行する（→ ポリスチレン原料）。",
          sources: ["Wikipedia: エチルベンゼン", "Wikipedia: フリーデル・クラフツ反応"]
        }
      ],
      downstream: [
        {
          name: "脱水素によるスチレン合成",
          leadsTo: ["styrene", "polystyrene"],
          shortNote: "Fe₂O₃-K₂O 触媒で 600 °C 付近にて脱水素しスチレン → ポリスチレン原料へ。"
        }
      ],
      detectionReactions: [
        {
          reagent: "KMnO₄（熱・酸性または中性）",
          result: "positive",
          observation: "赤紫色が脱色し、安息香酸が析出",
          significance: "ベンジル位 C-H をもつ側鎖アルキル基の存在を示す",
          commonlyUsed: true,
          detail: "側鎖のエチル基はベンジル位 C-H を経由して安息香酸まで酸化される（C₆H₅-C₂H₅ → C₆H₅COOH）。トルエンと同じ生成物が得られる点が出題ポイント。"
        },
        {
          reagent: "Br₂ 水",
          result: "negative",
          observation: "脱色しない",
          significance: "C=C が存在しないことを示す（スチレンとの判別に有用）",
          commonlyUsed: true,
          detail: "スチレンとの判別で頻出。エチルベンゼン（C-C 単結合のみ）は Br₂ 水を脱色しないが、構造の似たスチレン（C=C あり）は瞬時に脱色する。"
        },
        {
          reagent: "Br₂（光照射、無触媒）",
          result: "positive",
          observation: "ベンジル位の H が Br に置換、HBr 発生",
          significance: "ベンジル位ラジカル反応の進行を示す",
          commonlyUsed: false,
          detail: "光照射下では選択的にベンジル位 C-H が引き抜かれ、(1-ブロモエチル)ベンゼンが主生成物となる。FeBr₃ 触媒下では逆に芳香環が置換される。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "oXylene", note: "同じ C₈H₁₀ の構造異性体。1,2-ジメチルベンゼン。" },
          { molKey: "mXylene", note: "同じ C₈H₁₀ の構造異性体。1,3-ジメチルベンゼン。" },
          { molKey: "pXylene", note: "同じ C₈H₁₀ の構造異性体。1,4-ジメチルベンゼン。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "C₈H₁₀ 芳香族異性体のうち唯一の一置換ベンゼン（残り 3 つは二置換ベンゼン＝キシレン異性体）。不斉炭素なし。"
    },

    cumene: {
      synthesisRoutes: [
        {
          id: "cumene_industrial",
          name: "ベンゼンとプロペンの Friedel–Crafts アルキル化（工業的・クメン法の入口）",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "ベンゼン", formula: "C₆H₆", molKey: "benzene" }],
            coReagents: [{ name: "プロペン", formula: "C₃H₆", molKey: "propene" }],
            catalyst: "リン酸（H₃PO₄ 担持触媒）または AlCl₃、現代はゼオライト",
            conditions: "200〜250 °C、加圧",
            products: [{ name: "クメン", formula: "C₉H₁₂", molKey: "cumene" }],
            byProducts: []
          },
          shortNote: "ベンゼンとプロペンから一段で得られる Markovnikov 配向のアルキル化生成物。クメン法の起点。",
          detail: "C₆H₆ + CH₂=CH-CH₃ → C₆H₅-CH(CH₃)₂\n\nプロペンへのプロトン付加は Markovnikov 則に従って 2 級カルボカチオンを与え、これがベンゼンを求電子置換するためイソプロピル基が選択的に導入される（n-プロピルではない）。生成したクメンの大半はそのままクメン法（Hock プロセス）でフェノール+アセトンに変換される。",
          sources: ["Wikipedia: クメン法", "Solomons Organic Chemistry §16"]
        }
      ],
      downstream: [
        {
          name: "クメン法によるフェノール+アセトンの併産",
          leadsTo: ["cumeneHydroperoxide", "phenol", "acetone"],
          shortNote: "クメンを酸素で自動酸化→クメンヒドロペルオキシド→酸触媒転位でフェノール+アセトン。世界のフェノール生産の主流。"
        }
      ],
      detectionReactions: [
        {
          reagent: "酸素（自動酸化）",
          result: "positive",
          observation: "クメンヒドロペルオキシド（CHP）が生成",
          significance: "3級ベンジル位 C-H が空気酸化を受けやすいことを示す（クメン法の本質）",
          commonlyUsed: false,
          detail: "クメンの 3 級ベンジル位 C-H は弱く（ベンジル位＋3級効果）、室温〜100 °C 程度の空気酸化でヒドロペルオキシドを与える。これがクメン法（Hock プロセス）の核心反応。"
        },
        {
          reagent: "KMnO₄（熱・酸性または中性）",
          result: "positive",
          observation: "赤紫色が脱色し、安息香酸が析出",
          significance: "ベンジル位 C-H が酸化される",
          commonlyUsed: true,
          detail: "イソプロピル基はベンジル位 H をもつため、熱濃 KMnO₄ で側鎖が切断・酸化され安息香酸となる。トルエン・エチルベンゼンと同じ生成物。"
        },
        {
          reagent: "Br₂ 水",
          result: "negative",
          observation: "脱色しない",
          significance: "C=C が存在しないことを示す",
          commonlyUsed: true,
          detail: "プロペンを取り込んでいるが付加した時点で飽和しているため、Br₂ 水とは反応しない。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "nPropylbenzene", note: "同じ C₉H₁₂ の構造異性体（直鎖プロピル基）。" },
          { molKey: "mesitylene", note: "1,3,5-トリメチルベンゼン。同じ C₉H₁₂ の対称な構造異性体。" },
          { molKey: "ethyltoluene", note: "o-/m-/p-エチルトルエンも C₉H₁₂ の構造異性体。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "中央のベンジル位炭素は CH₃ を 2 つもつため不斉炭素ではない。" },
        conformers: []
      },
      stereochemistryDetail: "中央のベンジル位 C は 2 つのメチル基で対称化されており不斉炭素ではない。光学活性なし。"
    },

    cubane: {
      synthesisRoutes: [
        {
          id: "cubane_eaton_cole",
          name: "Eaton–Cole 合成（多段階・歴史的）",
          type: "historical",
          famous: false,
          equation: {
            reactants: [{ name: "2-ブロモシクロペンタジエノン（in situ）", formula: "C₅H₃BrO", molKey: null }],
            coReagents: [],
            catalyst: "",
            conditions: "Diels–Alder 二量化 → 光 [2+2] 環化 → Favorskii 転位（×2）→ 脱炭酸 など多段階",
            products: [{ name: "キュバン", formula: "C₈H₈", molKey: "cubane" }],
            byProducts: []
          },
          shortNote: "1964 年 Eaton と Cole によって達成された多段階全合成。単段反応式では表せない。",
          detail: "P. Eaton & T. Cole, J. Am. Chem. Soc. 1964 にて初めて合成された立方体型分子。\n\n主な工程: ブロモシクロペンタジエノン誘導体の Diels–Alder 二量化 → 光化学 [2+2] 環化 → Favorskii 転位による環縮小（×2）→ 脱炭酸。全 6〜10 段階に及ぶ高度な合成で、有機合成史の金字塔として知られる。\n\n注: 工程の細部は文献で異なる記載あり。「多段階合成」程度の粒度で扱うのが安全。高校範囲外。大学有機化学・大学院レベルで紹介される。",
          sources: ["Wikipedia: キュバン", "Eaton, P. E.; Cole, T. W. J. Am. Chem. Soc. 1964, 86, 3157."]
        }
      ],
      downstream: [
        {
          name: "オクタニトロキュバン（高エネルギー化合物）",
          leadsTo: [],
          shortNote: "8 つの H をすべて NO₂ に置換した octanitrocubane (ONC) は高密度爆薬として研究された。"
        },
        {
          name: "キュバンカルボン酸誘導体（医薬中間体）",
          leadsTo: [],
          shortNote: "ベンゼン環の生体等価体（bioisostere）として薬剤候補骨格に使われる例がある。"
        }
      ],
      detectionReactions: [],
      isomersDetail: {
        structural: [
          { molKey: "styrene", note: "同じ C₈H₈ の構造異性体（ビニルベンゼン）。" },
          { molKey: "cyclooctatetraene", note: "同じ C₈H₈ の構造異性体（8員環テトラエン、非平面）。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "高い対称性（Oh 群）のため光学活性なし。" },
        conformers: []
      },
      stereochemistryDetail: "立方体（Oh 対称性）の高度に歪んだ分子。すべての炭素・水素がそれぞれ等価で、不斉炭素も立体異性も存在しない。C-C-C 結合角が約 90° と sp³ の理想角 109.5° から大きく外れているため、内部に大きなひずみエネルギー（約 660 kJ/mol）を蓄える。"
    },

    // ── バッチ 3: フェノール類・キノン類 ─────────────────────

    phenol: {
      synthesisRoutes: [
        {
          id: "phenol_cumene_process",
          name: "クメン法（Hock プロセス、工業的）",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "クメン", formula: "C₉H₁₂", molKey: "cumene" }],
            coReagents: [{ name: "酸素", formula: "O₂", molKey: "oxygen" }],
            catalyst: "希硫酸（H₂SO₄、転位段階）",
            conditions: "(1) 80〜130 °C で空気酸化 → クメンヒドロペルオキシド (2) 希硫酸触媒で酸転位",
            products: [
              { name: "フェノール", formula: "C₆H₅OH", molKey: "phenol" },
              { name: "アセトン", formula: "CH₃COCH₃", molKey: "acetone" }
            ],
            byProducts: []
          },
          shortNote: "クメンを空気酸化してヒドロペルオキシドを作り、酸触媒で転位させてフェノールとアセトンを併産。世界のフェノール生産の主流。",
          detail: "クメン法（Hock プロセス、1944 年確立）は世界のフェノール生産のおよそ 9 割を占める基本工程。\n\n第1段: クメンの 3 級ベンジル位 C-H が空気酸化を受けてクメンヒドロペルオキシド（CHP）を生成。第2段: 希硫酸触媒で CHP が転位し、O–O 結合切断と Ph 基の 1,2-移動を経てフェノール+アセトンを 1:1 モル比で与える。ベンゼン+プロペン → クメン → フェノール+アセトン と 1分子から 2 有用物質が得られるのが特徴。",
          sources: ["Wikipedia: クメン法", "Solomons Organic Chemistry §16.5"]
        },
        {
          id: "phenol_alkali_fusion",
          name: "ベンゼンスルホン酸ナトリウムのアルカリ融解",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "ベンゼンスルホン酸ナトリウム", formula: "C₆H₅SO₃Na", molKey: "sodiumBenzenesulfonate" }],
            coReagents: [
              { name: "水酸化ナトリウム（固体）", formula: "NaOH", molKey: "sodiumHydroxide" },
              { name: "塩酸（中和）", formula: "HCl", molKey: "hydrogenChloride" }
            ],
            catalyst: "",
            conditions: "(1) NaOH と固体融解 約 300 °C → ナトリウムフェノキシド (2) HCl 等で酸性化",
            products: [{ name: "フェノール", formula: "C₆H₅OH", molKey: "phenol" }],
            byProducts: [
              { name: "亜硫酸ナトリウム", formula: "Na₂SO₃", molKey: "sodiumSulfite" },
              { name: "塩化ナトリウム", formula: "NaCl", molKey: "sodiumChloride" }
            ]
          },
          shortNote: "ベンゼンスルホン酸ナトリウムを固体 NaOH と高温融解→酸処理でフェノールを得る古典法。",
          detail: "高校化学頻出の古典的合成。\n\nC₆H₅SO₃Na + 2 NaOH → C₆H₅ONa + Na₂SO₃ + H₂O（アルカリ融解）\nC₆H₅ONa + HCl → C₆H₅OH + NaCl（酸処理）\n\n経路全体: ベンゼン → スルホン化（濃硫酸）→ Na 塩化 → アルカリ融解 → 酸性化、で 4 ステップ。",
          sources: ["Wikipedia: フェノール", "高校化学 各社教科書"]
        },
        {
          id: "phenol_diazonium_hydrolysis",
          name: "ベンゼンジアゾニウム塩の加水分解",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "塩化ベンゼンジアゾニウム", formula: "C₆H₅N₂Cl", molKey: "benzeneDiazonium" }],
            coReagents: [{ name: "水", formula: "H₂O", molKey: "water" }],
            catalyst: "",
            conditions: "温水（〜60 °C 以上に加温）",
            products: [{ name: "フェノール", formula: "C₆H₅OH", molKey: "phenol" }],
            byProducts: [
              { name: "窒素", formula: "N₂", molKey: "nitrogen" },
              { name: "塩化水素", formula: "HCl", molKey: "hydrogenChloride" }
            ]
          },
          shortNote: "アニリンから作ったベンゼンジアゾニウム塩を加温して加水分解、N₂ を放出してフェノールを得る。",
          detail: "C₆H₅N₂Cl + H₂O → C₆H₅OH + N₂↑ + HCl\n\nアニリンを 0〜5 °C で NaNO₂/HCl と反応させジアゾニウム塩を作り（ジアゾ化）、これを温水中で加熱すると N₂ を発泡しながらフェノールが生じる。室温保存では氷冷必須（温度を上げると目的反応が進行）。高校化学では「アニリン→フェノール」経路として頻出。",
          sources: ["Wikipedia: ジアゾ化合物", "高校化学 各社教科書"]
        }
      ],
      downstream: [
        {
          name: "Kolbe–Schmitt 反応によるサリチル酸合成",
          leadsTo: ["sodiumPhenoxide", "salicylicAcid"],
          shortNote: "ナトリウムフェノキシドに高圧 CO₂ を反応させ、酸処理でサリチル酸を得る。"
        },
        {
          name: "ジアゾカップリングによる p-ヒドロキシアゾベンゼン",
          leadsTo: ["pHydroxyAzobenzene"],
          shortNote: "塩基性下でベンゼンジアゾニウム塩と反応し、橙赤色のアゾ染料を与える。"
        },
        {
          name: "ホルムアルデヒドとの縮合（フェノール樹脂・ベークライト）",
          leadsTo: ["formaldehyde"],
          shortNote: "酸または塩基触媒下でホルムアルデヒドと縮合し、世界初の合成樹脂であるベークライトを与える。"
        }
      ],
      detectionReactions: [
        {
          reagent: "FeCl₃ 水溶液",
          result: "positive",
          observation: "紫〜青紫色に呈色",
          significance: "フェノール性 OH の存在を示す代表反応",
          commonlyUsed: true,
          detail: "Fe³⁺ がフェノラート酸素と配位錯体（Fe(OAr)₆ 型）を形成して呈色する。フェノール類・エノール・サリチル酸誘導体などフェノール性 OH 全般を検出。最も有名なフェノールの呈色試験。"
        },
        {
          reagent: "Br₂ 水",
          result: "positive",
          observation: "白色沈殿（2,4,6-トリブロモフェノール）が生成、Br₂ 水も脱色",
          significance: "OH 基により強く活性化されたベンゼン環の存在を示す",
          commonlyUsed: true,
          detail: "OH 基は強力な o,p- 配向・活性化基のため、触媒なしの Br₂ 水でも 3 置換が一気に進む。生成物 2,4,6-トリブロモフェノール（mp 96 °C）は水に難溶で白色沈殿となる。"
        },
        {
          reagent: "Na（金属ナトリウム）",
          result: "positive",
          observation: "H₂ を発生",
          significance: "活性水素（OH）の存在",
          commonlyUsed: true,
          detail: "2 C₆H₅OH + 2 Na → 2 C₆H₅ONa + H₂↑。アルコール類と共通の反応で、活性 H の検出に用いる。"
        },
        {
          reagent: "NaHCO₃ 水溶液",
          result: "negative",
          observation: "CO₂ を発生しない（反応しない）",
          significance: "カルボン酸ではないことを示す（フェノール pKa ≈ 10 は炭酸 pKa₁ ≈ 6.4 より弱酸）",
          commonlyUsed: true,
          detail: "高校化学頻出の判別法: カルボン酸 vs フェノール。\n\nカルボン酸（pKa ~5）: NaHCO₃ と反応して CO₂ 発生\nフェノール（pKa ~10）: NaHCO₃ とは反応せず\n\nただしフェノールは NaOH には溶ける（→ ナトリウムフェノキシド）。NaOH に溶け、NaHCO₃ には溶けないでフェノール性と判定する。"
        }
      ],
      isomersDetail: {
        structural: [],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "ベンゼン環＋ヒドロキシ基の平面分子。不斉炭素はなく、立体異性も存在しない。"
    },

    cresol: {
      synthesisRoutes: [
        {
          id: "cresol_coal_tar",
          name: "コールタールからの分留（工業的・伝統法）",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "コールタール（軽油〜中油留分）", formula: "—", molKey: null }],
            coReagents: [],
            catalyst: "",
            conditions: "アルカリ抽出と分留（170〜220 °C 留分）",
            products: [{ name: "クレゾール（o/m/p の混合物）", formula: "C₇H₈O", molKey: "cresol" }],
            byProducts: []
          },
          shortNote: "コールタールからアルカリ抽出と分留で得られる。3 異性体の混合物（クレゾール油）として産出。",
          detail: "クレゾールの伝統的供給源はコールタール（石炭乾留の副産物）。\n\n軽油〜中油留分にフェノール類とともに含まれ、NaOH 水溶液で抽出した後、酸性化・分留して回収する。沸点が近い o-（191 °C）/m-（203 °C）/p-（202 °C）の分離は容易でなく、混合物のまま消毒剤などに使われることも多い（クレゾール石けん液）。",
          sources: ["Wikipedia: クレゾール", "Wikipedia: コールタール"]
        },
        {
          id: "cresol_toluene_sulfonation",
          name: "トルエンのスルホン化→アルカリ融解",
          type: "lab",
          famous: false,
          equation: {
            reactants: [{ name: "トルエンスルホン酸ナトリウム", formula: "CH₃C₆H₄SO₃Na", molKey: null }],
            coReagents: [
              { name: "水酸化ナトリウム（固体）", formula: "NaOH", molKey: "sodiumHydroxide" },
              { name: "塩酸（中和）", formula: "HCl", molKey: "hydrogenChloride" }
            ],
            catalyst: "",
            conditions: "NaOH と高温融解（約 300 °C）→ 酸性化",
            products: [{ name: "クレゾール", formula: "C₇H₈O", molKey: "cresol" }],
            byProducts: [
              { name: "亜硫酸ナトリウム", formula: "Na₂SO₃", molKey: "sodiumSulfite" },
              { name: "塩化ナトリウム", formula: "NaCl", molKey: "sodiumChloride" }
            ]
          },
          shortNote: "トルエンをスルホン化→Na 塩化→アルカリ融解→酸性化でクレゾールを得る。フェノール合成と同型。",
          detail: "ベンゼン→フェノールのアルカリ融解法をトルエンに適用したもの。\n\nトルエンのスルホン化は p- 位（→ p-トルエンスルホン酸）が優先するため、最終的に p-クレゾールが主に得られる。機構と装置が同じため、フェノール合成法の応用例として教科書的に紹介される。",
          sources: ["Wikipedia: クレゾール"]
        }
      ],
      downstream: [
        {
          name: "BHT（ジブチルヒドロキシトルエン）など酸化防止剤",
          leadsTo: [],
          shortNote: "p-クレゾールに t-ブチル基を導入して BHT を合成。食品・燃料の酸化防止剤として広く使用。"
        },
        {
          name: "クレゾール樹脂・消毒剤",
          leadsTo: [],
          shortNote: "ホルムアルデヒドとの縮合でクレゾール樹脂、石けん液との混合で消毒剤クレゾール石けん液。"
        }
      ],
      detectionReactions: [
        {
          reagent: "FeCl₃ 水溶液",
          result: "positive",
          observation: "青紫〜紫色に呈色（異性体により色調がやや異なる）",
          significance: "フェノール性 OH の存在",
          commonlyUsed: true,
          detail: "フェノールと同じ呈色機構。3 異性体それぞれが呈色する。"
        },
        {
          reagent: "Br₂ 水",
          result: "positive",
          observation: "白色沈殿（トリブロモクレゾール）",
          significance: "OH で活性化された芳香環の存在",
          commonlyUsed: true,
          detail: "メチル基と OH 基はいずれも o,p- 配向・活性化基のため、Br₂ 水で容易に多置換が進む。"
        },
        {
          reagent: "NaHCO₃ 水溶液",
          result: "negative",
          observation: "CO₂ を発生しない",
          significance: "カルボン酸ではない（フェノール性）ことを示す",
          commonlyUsed: true,
          detail: "フェノール同様、NaHCO₃ では脱プロトン化されない。NaOH には溶ける。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "benzylAlcohol", note: "同じ C₇H₈O の構造異性体（脂肪族 OH なのでフェノール性ではない）。" },
          { molKey: "anisole", note: "同じ C₇H₈O の構造異性体（メチルエーテル、OH なし）。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "位置異性体が 3 つ: o-クレゾール（2-メチルフェノール）, m-クレゾール（3-メチルフェノール）, p-クレゾール（4-メチルフェノール）。いずれも平面構造で不斉炭素はない。"
    },

    naphthol: {
      synthesisRoutes: [
        {
          id: "naphthol2_alkali_fusion",
          name: "ナフタレンのスルホン化→アルカリ融解（2-ナフトール、工業的）",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "2-ナフタレンスルホン酸ナトリウム", formula: "C₁₀H₇SO₃Na", molKey: null }],
            coReagents: [
              { name: "水酸化ナトリウム（固体）", formula: "NaOH", molKey: "sodiumHydroxide" },
              { name: "塩酸（中和）", formula: "HCl", molKey: "hydrogenChloride" }
            ],
            catalyst: "",
            conditions: "NaOH と高温融解（約 300 °C）→ 酸性化",
            products: [{ name: "2-ナフトール（β-ナフトール）", formula: "C₁₀H₈O", molKey: "naphthol" }],
            byProducts: [
              { name: "亜硫酸ナトリウム", formula: "Na₂SO₃", molKey: "sodiumSulfite" },
              { name: "塩化ナトリウム", formula: "NaCl", molKey: "sodiumChloride" }
            ]
          },
          shortNote: "ナフタレンを高温（〜160 °C）でスルホン化→Na 塩化→アルカリ融解→酸性化で 2-ナフトールを得る。",
          detail: "2-ナフトール（β-ナフトール）の代表的工業合成。フェノールのアルカリ融解法とまったく同じ流れ。\n\nナフタレンのスルホン化は温度依存:\n  低温（〜80 °C）→ 1-スルホン酸（速度支配、α）\n  高温（〜160 °C）→ 2-スルホン酸（熱力学支配、β）\n\n高温条件で 2 体を得てからアルカリ融解することで 2-ナフトールが選択的に得られる。染料中間体として極めて重要（アゾ染料のカップリング相手）。",
          sources: ["Wikipedia: ナフトール", "Wikipedia: ナフタレンスルホン酸"]
        }
      ],
      downstream: [
        {
          name: "ジアゾカップリングによるアゾ染料合成",
          leadsTo: ["sudan1", "pHydroxyAzobenzene"],
          shortNote: "塩基性下でアリールジアゾニウム塩と反応し、橙赤色のアゾ染料を与える（スーダン I など）。"
        }
      ],
      detectionReactions: [
        {
          reagent: "FeCl₃ 水溶液",
          result: "positive",
          observation: "1-ナフトール: 紫色／2-ナフトール: 緑色〜青緑色",
          significance: "フェノール性 OH の存在を示すうえ、1-/2- 異性体の判別にも使える",
          commonlyUsed: true,
          detail: "FeCl₃ 呈色で異性体判別が可能な数少ない例。"
        },
        {
          reagent: "Br₂ 水",
          result: "positive",
          observation: "白色沈殿（ジ・トリブロモナフトール）",
          significance: "OH で活性化された芳香環",
          commonlyUsed: true,
          detail: "フェノール同様、強い活性化のため触媒なしで多置換が進む。"
        },
        {
          reagent: "ベンゼンジアゾニウム塩（弱塩基性下）",
          result: "positive",
          observation: "橙赤色のアゾ染料が析出",
          significance: "フェノール性 OH＋活性化された芳香環による求電子的ジアゾカップリングが進行することを示す",
          commonlyUsed: true,
          detail: "2-ナフトールはジアゾカップリングが特に進みやすく、染料合成の標準カップリング成分（カップラー）。生成物の鮮やかな色で検出される。"
        },
        {
          reagent: "NaHCO₃ 水溶液",
          result: "negative",
          observation: "CO₂ を発生しない",
          significance: "カルボン酸ではない（フェノール性）",
          commonlyUsed: true,
          detail: "ナフトールの pKa は 9〜10 程度でフェノールに近い。NaHCO₃ とは反応しないが NaOH には溶ける。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "naphthol", note: "1-ナフトール（α）と 2-ナフトール（β）の 2 種類の位置異性体が存在する。1- は OH が peri 位の H と立体的に近い。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "縮合二環＋OH の平面構造で、不斉炭素や立体異性は存在しない。1-ナフトールは融点 96 °C、2-ナフトールは融点 122 °C と区別がつく。"
    },

    hydroquinone: {
      synthesisRoutes: [
        {
          id: "hydroquinone_benzoquinone_reduction",
          name: "p-ベンゾキノンの還元",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "p-ベンゾキノン", formula: "C₆H₄O₂", molKey: "benzoquinone" }],
            coReagents: [{ name: "還元剤（SO₂、Na₂S₂O₄、H₂ など）", formula: "—", molKey: null }],
            catalyst: "",
            conditions: "水中、室温〜温和な加熱",
            products: [{ name: "ヒドロキノン", formula: "C₆H₆O₂", molKey: "hydroquinone" }],
            byProducts: []
          },
          shortNote: "p-ベンゾキノンを 2 電子・2 プロトン還元するとヒドロキノンが得られる。両者は可逆な酸化還元対。",
          detail: "Q + 2 H⁺ + 2 e⁻ ⇌ QH₂（Q = ベンゾキノン、QH₂ = ヒドロキノン）\n\n教科書では亜ジチオン酸ナトリウム（Na₂S₂O₄）や亜硫酸（SO₂）による還元として紹介される。逆反応（ヒドロキノン→ベンゾキノン）は穏やかな酸化剤（Ag⁺、Fe³⁺、CrO₃ など）で容易に進む。この可逆な 2 電子レドックス系は生体電子伝達系（ユビキノン/ユビキノール）の基本構造。",
          sources: ["Wikipedia: ヒドロキノン", "Wikipedia: p-ベンゾキノン"]
        },
        {
          id: "hydroquinone_phenol_h2o2",
          name: "フェノールの過酸化水素ヒドロキシ化（工業的）",
          type: "industrial",
          famous: false,
          equation: {
            reactants: [{ name: "フェノール", formula: "C₆H₅OH", molKey: "phenol" }],
            coReagents: [{ name: "過酸化水素", formula: "H₂O₂", molKey: null }],
            catalyst: "鉄塩・チタンシリカライト（TS-1）など",
            conditions: "水溶液、酸性、60〜80 °C",
            products: [
              { name: "ヒドロキノン", formula: "C₆H₆O₂", molKey: "hydroquinone" },
              { name: "カテコール（同伴）", formula: "C₆H₆O₂", molKey: null }
            ],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "フェノールを H₂O₂ でヒドロキシ化し、p- 体（ヒドロキノン）と o- 体（カテコール）を併産。",
          detail: "現代の工業的なヒドロキノン合成の主流の一つ。\n\nフェノール + H₂O₂ → ヒドロキノン + カテコール（o-体）\n\n触媒の選択により p/o 比を調整。TS-1（チタンシリカライト）は p-選択性が高い。副生するカテコールも香料・農薬中間体として有用。",
          sources: ["Wikipedia: ヒドロキノン"]
        }
      ],
      downstream: [
        {
          name: "酸化による p-ベンゾキノン",
          leadsTo: ["benzoquinone"],
          shortNote: "穏やかな酸化剤（Ag₂O、Fe³⁺、CrO₃ 等）で容易に p-ベンゾキノンに戻る。"
        },
        {
          name: "写真現像剤（古典）",
          leadsTo: [],
          shortNote: "AgBr → Ag の還元剤として古典的写真現像液の主成分の一つに使われた。"
        }
      ],
      detectionReactions: [
        {
          reagent: "FeCl₃ 水溶液",
          result: "positive",
          observation: "緑色〜暗緑色に呈色（やがて酸化されて褐色化）",
          significance: "フェノール性 OH の存在＋強い還元性",
          commonlyUsed: true,
          detail: "フェノール性 OH をもつため呈色するが、Fe³⁺ により酸化されて p-ベンゾキノンに変化するので色は時間とともに変化する。"
        },
        {
          reagent: "Tollens 試薬（アンモニア性 AgNO₃）",
          result: "positive",
          observation: "銀鏡（または黒色 Ag）が生成",
          significance: "強い還元性を示す（アルデヒドではないがフェノール類で陽性となる例外的存在）",
          commonlyUsed: false,
          detail: "ヒドロキノンは強い還元剤（標準電極電位低い）であり、Ag⁺ を Ag に還元できる。アルデヒドの陽性と紛らわしいので、構造決定問題では他の試験と組み合わせて判定する。"
        },
        {
          reagent: "NaHCO₃ 水溶液",
          result: "negative",
          observation: "CO₂ を発生しない",
          significance: "カルボン酸ではない（フェノール性）",
          commonlyUsed: true,
          detail: "pKa₁ ≈ 9.85 でフェノールよりわずかに酸性が強い程度。NaHCO₃ では反応しない。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "カテコール（1,2-ベンゼンジオール、o-体）" },
          { molKey: null, note: "レゾルシノール（1,3-ベンゼンジオール、m-体）" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "ベンゼン環の 1,4-位に OH をもつ平面・対称分子。不斉炭素や立体異性は存在しない。"
    },

    benzoquinone: {
      synthesisRoutes: [
        {
          id: "benzoquinone_hydroquinone_oxidation",
          name: "ヒドロキノンの酸化",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "ヒドロキノン", formula: "C₆H₆O₂", molKey: "hydroquinone" }],
            coReagents: [{ name: "酸化剤（Ag₂O、Na₂Cr₂O₇/H₂SO₄、Fe³⁺ など）", formula: "—", molKey: null }],
            catalyst: "",
            conditions: "水〜希酸中、室温〜短時間加熱",
            products: [{ name: "p-ベンゾキノン", formula: "C₆H₄O₂", molKey: "benzoquinone" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "ヒドロキノンを 2 電子酸化して p-ベンゾキノンを得る。両者は可逆な酸化還元対。",
          detail: "QH₂ → Q + 2 H⁺ + 2 e⁻\n\n穏やかな酸化剤で容易に進む。生成物 p-ベンゾキノンは特徴的な黄色針状結晶（昇華しやすい）。ヒドロキノン⇌ベンゾキノンの可逆性は、生体電子伝達系（ユビキノン/ユビキノール）と並行する基本反応として重要。",
          sources: ["Wikipedia: p-ベンゾキノン"]
        },
        {
          id: "benzoquinone_aniline_oxidation",
          name: "アニリンの酸化（工業的）",
          type: "industrial",
          famous: false,
          equation: {
            reactants: [{ name: "アニリン", formula: "C₆H₅NH₂", molKey: "aniline" }],
            coReagents: [{ name: "二酸化マンガン", formula: "MnO₂", molKey: null }],
            catalyst: "",
            conditions: "希硫酸中、加熱",
            products: [{ name: "p-ベンゾキノン", formula: "C₆H₄O₂", molKey: "benzoquinone" }],
            byProducts: []
          },
          shortNote: "アニリンを希硫酸中で MnO₂ 酸化して p-ベンゾキノンを得る古典的工業法。",
          detail: "古くから知られる工業合成。\n\nアニリンの NH₂ が酸化されて O に置き換わる過程と捉えられる。副生する Mn 塩や副反応物の処理が必要なため、近年は別経路（ヒドロキノンの脱水素酸化など）が主流。",
          sources: ["Wikipedia: p-ベンゾキノン"]
        }
      ],
      downstream: [
        {
          name: "還元によるヒドロキノン",
          leadsTo: ["hydroquinone"],
          shortNote: "Na₂S₂O₄、SO₂、H₂ 等で還元するとヒドロキノンに戻る。"
        },
        {
          name: "Diels–Alder 反応のジエノフィル",
          leadsTo: [],
          shortNote: "強力な電子受容性のため、シクロペンタジエン等のジエンと容易に [4+2] 付加体を形成。"
        }
      ],
      detectionReactions: [
        {
          reagent: "視認（黄色結晶）",
          result: "positive",
          observation: "鮮黄色の昇華しやすい固体",
          significance: "p-ベンゾキノン特有の色",
          commonlyUsed: false,
          detail: "ヒドロキノン（無色）とは見た目で容易に判別できる。"
        },
        {
          reagent: "還元剤（Na₂S₂O₄、SO₂ など）",
          result: "positive",
          observation: "黄色が消失し無色のヒドロキノンが生成",
          significance: "酸化剤として機能することを示す",
          commonlyUsed: false,
          detail: "可逆な 2 電子・2 プロトン還元を受ける。色変化が分かりやすい。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "o-ベンゾキノン（1,2-ベンゾキノン、暗赤色、より不安定）。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "1,4-位に C=O をもつ非芳香族の環状ジエンジオン。平面分子で対称性が高く、不斉炭素や立体異性は存在しない。芳香族性は失われており、ベンゼン環ではなくシクロヘキサジエン誘導体として扱う。"
    },

    // ── バッチ 4: サリチル酸系 ─────────────────────────────

    salicylicAcid: {
      synthesisRoutes: [
        {
          id: "salicylic_kolbe_schmitt",
          name: "Kolbe–Schmitt 反応(工業的)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "ナトリウムフェノキシド", formula: "C₆H₅ONa", molKey: "sodiumPhenoxide" }],
            coReagents: [
              { name: "二酸化炭素", formula: "CO₂", molKey: "carbonDioxide" },
              { name: "塩酸(中和)", formula: "HCl", molKey: "hydrogenChloride" }
            ],
            catalyst: "",
            conditions: "(1) CO₂ 高圧(4〜7 気圧)、約 125 °C で反応 → サリチル酸ナトリウム (2) HCl 等で酸性化",
            products: [{ name: "サリチル酸", formula: "HOC₆H₄COOH", molKey: "salicylicAcid" }],
            byProducts: [{ name: "塩化ナトリウム", formula: "NaCl", molKey: "sodiumChloride" }]
          },
          shortNote: "ナトリウムフェノキシドに高圧 CO₂ を反応させ、酸性化してサリチル酸を得る。",
          detail: "C₆H₅ONa + CO₂ → o-HOC₆H₄COONa(高圧加熱)\no-HOC₆H₄COONa + HCl → o-HOC₆H₄COOH + NaCl\n\n1860 年代に Kolbe、改良が Schmitt によって行われた古典的反応。フェノキシドが CO₂ をオルト位で求電子的にカルボキシル化するのが特徴で、p- 体は副生に留まる(カリウム塩・高温では p-ヒドロキシ安息香酸が主生成物に切り替わる)。工業的にはアスピリン・サリチル酸メチル・染料中間体の出発物質。",
          sources: ["Wikipedia: コルベ・シュミット反応", "高校化学 各社教科書"]
        }
      ],
      downstream: [
        {
          name: "アセチル化によるアスピリン合成",
          leadsTo: ["aspirin"],
          shortNote: "無水酢酸でフェノール性 OH をアセチル化して解熱鎮痛薬アスピリンを得る。"
        },
        {
          name: "メタノールとのエステル化によるサリチル酸メチル",
          leadsTo: ["methylSalicylate"],
          shortNote: "濃硫酸触媒下でメタノールと加熱しサリチル酸メチル(湿布の香り)を得る。"
        },
        {
          name: "中和によるサリチル酸ナトリウム",
          leadsTo: ["sodiumSalicylate"],
          shortNote: "NaOH や NaHCO₃ でカルボキシル基を中和し、水溶性のナトリウム塩を得る。"
        }
      ],
      detectionReactions: [
        {
          reagent: "FeCl₃ 水溶液",
          result: "positive",
          observation: "赤紫色〜濃紫色に呈色",
          significance: "フェノール性 OH の存在を示す",
          commonlyUsed: true,
          detail: "サリチル酸は分子内にカルボン酸とフェノール性 OH の両方をもち、FeCl₃ ではフェノール性 OH に由来する呈色を示す。アスピリン(フェノール性 OH がアセチル化されている)は呈色しないため、両者の判別に使われる。"
        },
        {
          reagent: "NaHCO₃ 水溶液",
          result: "positive",
          observation: "CO₂ を発泡しながら溶解",
          significance: "カルボン酸の存在を示す",
          commonlyUsed: true,
          detail: "カルボン酸(pKa ≈ 3、フェノールより強酸)として NaHCO₃ と反応し CO₂ を放出する。フェノール性 OH 単独では反応しないため、FeCl₃ 陽性＋NaHCO₃ 陽性でフェノール性 OH とカルボン酸の共存を確認できる。"
        },
        {
          reagent: "Br₂ 水",
          result: "positive",
          observation: "白色沈殿(多臭素化物)",
          significance: "OH で活性化された芳香環",
          commonlyUsed: false,
          detail: "OH 基による活性化のため Br₂ 水と容易に反応し、3,5-ジブロモサリチル酸〜トリブロモ体まで進む。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "3-ヒドロキシ安息香酸(m-体)" },
          { molKey: null, note: "4-ヒドロキシ安息香酸(p-体、防腐剤パラベンの母酸)" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "OH と COOH が o-位にあるため分子内水素結合を形成し、平面構造で安定化する。これにより融点(159 °C)や酸性度(pKa₁ ≈ 3.0、安息香酸より強酸)が同族の m-/p- 体と異なる。不斉炭素はない。"
    },

    sodiumPhenoxide: {
      synthesisRoutes: [
        {
          id: "sodiumPhenoxide_phenol_naoh",
          name: "フェノールと NaOH の中和",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "フェノール", formula: "C₆H₅OH", molKey: "phenol" }],
            coReagents: [{ name: "水酸化ナトリウム", formula: "NaOH", molKey: "sodiumHydroxide" }],
            catalyst: "",
            conditions: "水溶液、室温",
            products: [{ name: "ナトリウムフェノキシド", formula: "C₆H₅ONa", molKey: "sodiumPhenoxide" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "フェノールは弱酸として NaOH に溶け、ナトリウムフェノキシドの水溶液を与える。",
          detail: "C₆H₅OH + NaOH → C₆H₅ONa + H₂O\n\nフェノール(pKa ≈ 10)は強塩基 NaOH に溶ける弱酸。水溶液は無色透明〜淡褐色。空気中で徐々に酸化される。有機混合物の酸-塩基抽出で「水層に移すフェノール類」を分離するのに使う基本反応。",
          sources: ["Wikipedia: フェノール", "高校化学 各社教科書"]
        },
        {
          id: "sodiumPhenoxide_alkali_fusion",
          name: "ベンゼンスルホン酸ナトリウムのアルカリ融解",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "ベンゼンスルホン酸ナトリウム", formula: "C₆H₅SO₃Na", molKey: "sodiumBenzenesulfonate" }],
            coReagents: [{ name: "水酸化ナトリウム(固体)", formula: "NaOH", molKey: "sodiumHydroxide" }],
            catalyst: "",
            conditions: "固体融解、約 300 °C",
            products: [{ name: "ナトリウムフェノキシド", formula: "C₆H₅ONa", molKey: "sodiumPhenoxide" }],
            byProducts: [
              { name: "亜硫酸ナトリウム", formula: "Na₂SO₃", molKey: "sodiumSulfite" },
              { name: "水", formula: "H₂O", molKey: "water" }
            ]
          },
          shortNote: "ベンゼンスルホン酸ナトリウムを固体 NaOH と高温融解するとナトリウムフェノキシドが得られる。",
          detail: "C₆H₅SO₃Na + 2 NaOH → C₆H₅ONa + Na₂SO₃ + H₂O\n\n高校化学頻出のフェノール製法の中間段階。このまま酸性化(HCl または希 H₂SO₄)でフェノールが得られる。ベンゼン → ベンゼンスルホン酸 → Na 塩 → アルカリ融解 → ナトリウムフェノキシド の流れ。",
          sources: ["Wikipedia: フェノール", "高校化学 各社教科書"]
        }
      ],
      downstream: [
        {
          name: "Kolbe–Schmitt 反応によるサリチル酸ナトリウム",
          leadsTo: ["sodiumSalicylate", "salicylicAcid"],
          shortNote: "高圧 CO₂ を反応させ、サリチル酸ナトリウム→酸性化でサリチル酸へ。"
        },
        {
          name: "ジアゾカップリングによる p-ヒドロキシアゾベンゼン",
          leadsTo: ["pHydroxyAzobenzene"],
          shortNote: "塩基性下のフェノキシドにベンゼンジアゾニウム塩がカップリングし、橙赤色のアゾ染料を与える。"
        },
        {
          name: "酸性化によるフェノール再生",
          leadsTo: ["phenol"],
          shortNote: "HCl・H₂SO₄・CO₂(炭酸)など弱〜強酸でフェノールが遊離する。"
        }
      ],
      detectionReactions: [
        {
          reagent: "CO₂ 通気(弱酸による弱塩基塩の置換)",
          result: "positive",
          observation: "フェノールが遊離して白濁・分離(油状)",
          significance: "フェノキシドは炭酸の第1段階より弱塩基なので押し出される",
          commonlyUsed: true,
          detail: "C₆H₅ONa + H₂O + CO₂ → C₆H₅OH + NaHCO₃\n\nフェノール pKa ≈ 10 vs 炭酸 pKa₁ ≈ 6.4 → 炭酸の方が強酸 → フェノキシドはプロトン化されてフェノールが遊離する。\n\nカルボン酸塩との対比: カルボン酸(pKa ≈ 5)はナトリウム塩から CO₂ では押し出されない。この差が「カルボン酸 vs フェノール」分離の原理。"
        },
        {
          reagent: "塩酸・希硫酸",
          result: "positive",
          observation: "フェノールが遊離して油状で分離",
          significance: "強酸はフェノキシドを完全にプロトン化",
          commonlyUsed: true,
          detail: "C₆H₅ONa + HCl → C₆H₅OH + NaCl。酸-塩基抽出でフェノールを取り出す標準操作。"
        }
      ],
      isomersDetail: {
        structural: [],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "イオン性塩。フェノキシドアニオン C₆H₅O⁻ は平面分子で、負電荷は O だけでなく芳香環のオルト・パラ位にも非局在化する(共鳴)。不斉炭素なし。"
    },

    sodiumSalicylate: {
      synthesisRoutes: [
        {
          id: "sodiumSalicylate_kolbe_schmitt",
          name: "Kolbe–Schmitt 反応の直接生成物",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "ナトリウムフェノキシド", formula: "C₆H₅ONa", molKey: "sodiumPhenoxide" }],
            coReagents: [{ name: "二酸化炭素", formula: "CO₂", molKey: "carbonDioxide" }],
            catalyst: "",
            conditions: "CO₂ 高圧(4〜7 気圧)、約 125 °C",
            products: [{ name: "サリチル酸ナトリウム", formula: "HOC₆H₄COONa", molKey: "sodiumSalicylate" }],
            byProducts: []
          },
          shortNote: "ナトリウムフェノキシドに高圧 CO₂ を反応させると、酸性化前にサリチル酸ナトリウムが得られる。",
          detail: "C₆H₅ONa + CO₂ → o-HOC₆H₄COONa\n\nKolbe–Schmitt 反応の第1段の直接生成物で、酸性化で初めてサリチル酸となる。カルボキシル基側だけが Na 塩、フェノール性 OH はそのまま残る点に注意(pKa の差で選択的に Na 塩になる)。",
          sources: ["Wikipedia: コルベ・シュミット反応", "高校化学 各社教科書"]
        },
        {
          id: "sodiumSalicylate_neutralization",
          name: "サリチル酸の中和",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "サリチル酸", formula: "HOC₆H₄COOH", molKey: "salicylicAcid" }],
            coReagents: [{ name: "炭酸水素ナトリウム", formula: "NaHCO₃", molKey: null }],
            catalyst: "",
            conditions: "水溶液、室温",
            products: [{ name: "サリチル酸ナトリウム", formula: "HOC₆H₄COONa", molKey: "sodiumSalicylate" }],
            byProducts: [
              { name: "水", formula: "H₂O", molKey: "water" },
              { name: "二酸化炭素", formula: "CO₂", molKey: "carbonDioxide" }
            ]
          },
          shortNote: "サリチル酸を NaHCO₃ と反応させると、CO₂ を発泡しながらサリチル酸ナトリウムが得られる。",
          detail: "HOC₆H₄COOH + NaHCO₃ → HOC₆H₄COONa + H₂O + CO₂↑\n\nカルボン酸(pKa ≈ 3)は NaHCO₃ と容易に反応するが、フェノール性 OH(pKa ≈ 13)は反応しない。このためカルボキシル基だけが Na 塩となり、フェノール性 OH は残る(FeCl₃ で呈色する)。",
          sources: ["Wikipedia: サリチル酸", "高校化学 各社教科書"]
        }
      ],
      downstream: [
        {
          name: "酸性化によるサリチル酸再生",
          leadsTo: ["salicylicAcid"],
          shortNote: "強酸(HCl, H₂SO₄)でカルボン酸が遊離してサリチル酸が析出する。"
        }
      ],
      detectionReactions: [
        {
          reagent: "FeCl₃ 水溶液",
          result: "positive",
          observation: "赤紫色〜濃紫色に呈色",
          significance: "フェノール性 OH がそのまま残っていることを示す",
          commonlyUsed: true,
          detail: "Na 塩化されたのは COOH 側のみで、フェノール性 OH はフリー。よって FeCl₃ で呈色する。サリチル酸との判別は不要(両者ともに陽性)だが、アスピリン(陰性)との対比が高校化学の頻出問題。"
        },
        {
          reagent: "塩酸(強酸)",
          result: "positive",
          observation: "サリチル酸の白色結晶が析出",
          significance: "カルボキシラート塩であることを示す",
          commonlyUsed: true,
          detail: "HOC₆H₄COONa + HCl → HOC₆H₄COOH↓ + NaCl。Na 塩は水に可溶だがサリチル酸自体は冷水に難溶のため、酸性化で析出する。"
        }
      ],
      isomersDetail: {
        structural: [],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "サリチル酸のカルボキシル基だけがナトリウム塩化された化合物。平面分子で不斉炭素なし。フェノール性 OH と COO⁻ の分子内水素結合は弱まる(COO⁻ がもう H をもたないため)。"
    },

    methylSalicylate: {
      synthesisRoutes: [
        {
          id: "methylSalicylate_esterification",
          name: "サリチル酸とメタノールのエステル化(Fischer エステル化)",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "サリチル酸", formula: "HOC₆H₄COOH", molKey: "salicylicAcid" }],
            coReagents: [{ name: "メタノール", formula: "CH₃OH", molKey: "methanol" }],
            catalyst: "濃硫酸",
            conditions: "加熱還流",
            products: [{ name: "サリチル酸メチル", formula: "HOC₆H₄COOCH₃", molKey: "methylSalicylate" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "サリチル酸のカルボキシル基をメタノールでエステル化。湿布薬の特徴的な香り。",
          detail: "HOC₆H₄COOH + CH₃OH ⇌ HOC₆H₄COOCH₃ + H₂O(濃硫酸触媒、加熱)\n\n典型的な Fischer エステル化。可逆反応のため、メタノールを過剰に用いるか水を除去して平衡を生成側に寄せる。フェノール性 OH は反応条件下では反応しない(カルボキシル基側だけがエステル化される)。生成物は冬緑油(wintergreen oil)の主成分で、湿布薬・サロメチールとして知られる甘く清涼な香りをもつ。",
          sources: ["Wikipedia: サリチル酸メチル", "高校化学 各社教科書"]
        }
      ],
      downstream: [
        {
          name: "加水分解によるサリチル酸",
          leadsTo: ["salicylicAcid", "methanol"],
          shortNote: "酸または塩基触媒の加水分解でサリチル酸とメタノールに戻る。"
        }
      ],
      detectionReactions: [
        {
          reagent: "FeCl₃ 水溶液",
          result: "positive",
          observation: "赤紫色〜濃紫色に呈色",
          significance: "フェノール性 OH がそのまま残っていることを示す(COOH のみエステル化された証拠)",
          commonlyUsed: true,
          detail: "アスピリンが FeCl₃ で呈色しないのと対照的に、サリチル酸メチルはフェノール性 OH 側を保持しているため呈色する。「アスピリン vs サリチル酸メチル」の判別で頻出。"
        },
        {
          reagent: "NaHCO₃ 水溶液",
          result: "negative",
          observation: "CO₂ を発生しない",
          significance: "カルボキシル基がエステル化されている(自由な COOH なし)ことを示す",
          commonlyUsed: true,
          detail: "カルボン酸ではなくエステルなので NaHCO₃ とは反応しない。サリチル酸(陽性)との判別ポイント。"
        },
        {
          reagent: "嗅覚(特徴的な香り)",
          result: "positive",
          observation: "湿布薬・サロメチールの清涼で甘い香り",
          significance: "サリチル酸メチル特有",
          commonlyUsed: false,
          detail: "化学検出ではないが、教科書・実験書で「香りで識別」される代表的なエステル。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "3-/4- 位の異性体(m-/p-ヒドロキシ安息香酸メチル、防腐剤メチルパラベンの母体)。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "OH と COOCH₃ が o-位にあり、サリチル酸と同様の分子内水素結合を形成する。融点が低く(−9 °C)室温で液体。不斉炭素なし。"
    },

    aspirin: {
      synthesisRoutes: [
        {
          id: "aspirin_acetylation",
          name: "サリチル酸の無水酢酸によるアセチル化",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "サリチル酸", formula: "HOC₆H₄COOH", molKey: "salicylicAcid" }],
            coReagents: [{ name: "無水酢酸", formula: "(CH₃CO)₂O", molKey: "aceticAnhydride" }],
            catalyst: "濃硫酸(または濃リン酸)",
            conditions: "加温(80〜90 °C 程度)",
            products: [{ name: "アスピリン", formula: "CH₃COOC₆H₄COOH", molKey: "aspirin" }],
            byProducts: [{ name: "酢酸", formula: "CH₃COOH", molKey: "aceticAcid" }]
          },
          shortNote: "サリチル酸のフェノール性 OH を無水酢酸でアセチル化(エステル化)してアスピリンを得る。",
          detail: "HOC₆H₄COOH + (CH₃CO)₂O → CH₃COO-C₆H₄-COOH + CH₃COOH\n\n濃硫酸が触媒。1897 年、Bayer 社の Felix Hoffmann が安定な解熱鎮痛薬として工業化(「アスピリン」は同社の商標が普通名詞化したもの)。フェノール性 OH 側だけがアセチル化され、カルボキシル基はそのまま残る。反応剤として無水酢酸を用いるのは、酢酸を使うより水が副生しないため平衡が生成側に寄り収率が高いから。",
          sources: ["Wikipedia: アスピリン", "高校化学 各社教科書"]
        }
      ],
      downstream: [
        {
          name: "加水分解によるサリチル酸の再生",
          leadsTo: ["salicylicAcid", "aceticAcid"],
          shortNote: "胃や腸の弱塩基性条件下、または希酸/塩基でアセチル基が外れてサリチル酸(活性本体)と酢酸に分解する。"
        }
      ],
      detectionReactions: [
        {
          reagent: "FeCl₃ 水溶液",
          result: "negative",
          observation: "呈色しない",
          significance: "フェノール性 OH がアセチル化されて消失していることを示す",
          commonlyUsed: true,
          detail: "サリチル酸(陽性)vs アスピリン(陰性)の判別として高校化学頻出。\n\nサリチル酸は OH があるため紫呈色\nアスピリンは OH がアセチル化されてエステルになっているため呈色しない\n\n古いアスピリンが加水分解しているかは、FeCl₃ で呈色するかどうかで簡易判定できる(呈色する＝サリチル酸が遊離している)。"
        },
        {
          reagent: "NaHCO₃ 水溶液",
          result: "positive",
          observation: "CO₂ を発泡しながら溶解",
          significance: "カルボキシル基が残っている(エステル化されていない)ことを示す",
          commonlyUsed: true,
          detail: "アスピリンの分子内には遊離のカルボン酸 COOH があるため、NaHCO₃ と反応して CO₂ を放出する(pKa ≈ 3.5)。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "3-/4- 位のアセトキシ安息香酸(医薬活性は失われる)" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "オルト位にアセチルオキシ基とカルボキシル基をもつ平面分子。不斉炭素はなく光学異性も存在しない。プロドラッグ的な性格をもち、体内で加水分解されて活性本体のサリチル酸に変換される。"
    },

    // ── バッチ 5: 芳香族 N・ニトロ化合物 ① ─────────────────

    aniline: {
      synthesisRoutes: [
        {
          id: "aniline_nitrobenzene_reduction_sn",
          name: "ニトロベンゼンの Sn/HCl 還元",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "ニトロベンゼン", formula: "C₆H₅NO₂", molKey: "nitrobenzene" }],
            coReagents: [
              { name: "スズ", formula: "Sn", molKey: "tin" },
              { name: "塩酸(濃)", formula: "HCl", molKey: "hydrogenChloride" },
              { name: "水酸化ナトリウム(遊離化)", formula: "NaOH", molKey: "sodiumHydroxide" }
            ],
            catalyst: "",
            conditions: "(1) Sn/HCl で加熱還元 → アニリン塩酸塩 (2) NaOH で塩基性化してアニリンを遊離",
            products: [{ name: "アニリン", formula: "C₆H₅NH₂", molKey: "aniline" }],
            byProducts: [
              { name: "塩化スズ(IV)", formula: "SnCl₄", molKey: null },
              { name: "水", formula: "H₂O", molKey: "water" }
            ]
          },
          shortNote: "ニトロベンゼンを Sn と濃塩酸で還元し、NaOH でアニリンを遊離させる古典的合成。",
          detail: "C₆H₅NO₂ + 6 [H] → C₆H₅NH₂ + 2 H₂O\n\nSn/HCl で発生期の水素 [H] により NO₂ が NH₂ まで還元される(−2 → −3 価)。還元直後はアニリン塩酸塩(C₆H₅NH₃Cl)として水層に溶けており、NaOH 添加で遊離アニリンが油状で分離する(アミンの塩抽出の原理)。工業的には Fe/HCl や接触水素還元(H₂/Ni)が主流だが、教科書では Sn/HCl が最も有名。",
          sources: ["Wikipedia: アニリン", "高校化学 各社教科書"]
        },
        {
          id: "aniline_catalytic_hydrogenation",
          name: "ニトロベンゼンの接触水素還元(工業的)",
          type: "industrial",
          famous: false,
          equation: {
            reactants: [{ name: "ニトロベンゼン", formula: "C₆H₅NO₂", molKey: "nitrobenzene" }],
            coReagents: [{ name: "水素", formula: "H₂", molKey: "hydrogen" }],
            catalyst: "Ni、Pt、Cu などの金属触媒",
            conditions: "200〜300 °C、加圧",
            products: [{ name: "アニリン", formula: "C₆H₅NH₂", molKey: "aniline" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "ニトロベンゼンを金属触媒下で水素化還元してアニリンを得る現代の工業法。",
          detail: "C₆H₅NO₂ + 3 H₂ → C₆H₅NH₂ + 2 H₂O\n\n現代のアニリン工業生産はほぼこの経路。重金属廃液が出る Sn/HCl・Fe/HCl 法を置き換えた。アニリンの主用途は MDI(ジフェニルメタンジイソシアネート、ポリウレタン原料)合成。",
          sources: ["Wikipedia: アニリン"]
        }
      ],
      downstream: [
        {
          name: "ジアゾ化によるベンゼンジアゾニウム塩",
          leadsTo: ["benzeneDiazonium"],
          shortNote: "0〜5 °C の希塩酸中で NaNO₂ を作用させ、ベンゼンジアゾニウム塩を生成。アゾ染料合成の起点。"
        },
        {
          name: "無水酢酸によるアセトアニリドへのアセチル化",
          leadsTo: ["acetanilide"],
          shortNote: "無水酢酸でアミノ基をアセチル化、固体のアセトアニリドを得る(解熱鎮痛薬の歴史的母体)。"
        },
        {
          name: "ジアゾカップリング経由 p-ヒドロキシアゾベンゼン",
          leadsTo: ["pHydroxyAzobenzene"],
          shortNote: "ジアゾ化後、塩基性下のフェノキシドと p-カップリングして橙赤色のアゾ染料を与える。"
        }
      ],
      detectionReactions: [
        {
          reagent: "さらし粉水溶液(次亜塩素酸 Ca)",
          result: "positive",
          observation: "赤紫色 → 暗褐色 に変化",
          significance: "アニリン特有の呈色反応(芳香族 1 級アミンの検出)",
          commonlyUsed: true,
          detail: "アニリンが酸化されて種々の発色性化合物(キノン型)になるため。高校化学で最も有名なアニリン検出法。フェノールの FeCl₃(紫)と混同しやすいが、試薬・色調が違う。"
        },
        {
          reagent: "K₂Cr₂O₇(硫酸酸性)",
          result: "positive",
          observation: "黒色沈殿(アニリンブラック)",
          significance: "アニリンの強い酸化容易性を示す",
          commonlyUsed: true,
          detail: "硫酸酸性下で K₂Cr₂O₇ と酸化反応し、複雑な縮合体であるアニリンブラック(染料・染色剤)が生成する。歴史的には染色工業の重要染料。"
        },
        {
          reagent: "塩酸(希)",
          result: "positive",
          observation: "アニリン塩酸塩として水に溶ける",
          significance: "塩基性アミンであることを示す",
          commonlyUsed: true,
          detail: "C₆H₅NH₂ + HCl → C₆H₅NH₃Cl。アニリンはフェノールと逆で塩酸に溶け、NaOH には溶けない。酸-塩基抽出でフェノール類と分離する原理。"
        },
        {
          reagent: "NaHCO₃ 水溶液",
          result: "negative",
          observation: "反応しない(CO₂ 発生なし、溶けない)",
          significance: "酸性ではない(塩基性アミン)ことを示す",
          commonlyUsed: false,
          detail: "カルボン酸・フェノールとの判別の対照として使う。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "N-メチルアニリン、N,N-ジメチルアニリンは芳香族 2 級・3 級アミン(H 数が異なるため厳密には別の分子式)。" },
          { molKey: null, note: "トルイジン(メチルアニリン、CH₃-C₆H₄-NH₂)は同じ C₇H₉N の構造異性体(環上にメチル)。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "アミノ N は形式的に sp³ だが、孤立電子対が芳香環と π 共役するためほぼ平面に近い構造をとる。傘反転(窒素反転)も極めて速いため光学活性は観測されない。"
    },

    nitrobenzene: {
      synthesisRoutes: [
        {
          id: "nitrobenzene_nitration",
          name: "ベンゼンの混酸ニトロ化",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "ベンゼン", formula: "C₆H₆", molKey: "benzene" }],
            coReagents: [{ name: "硝酸(濃)", formula: "HNO₃", molKey: null }],
            catalyst: "硫酸(濃、混酸の一部)",
            conditions: "約 50〜60 °C、混酸(濃 HNO₃ + 濃 H₂SO₄)、温度上昇に注意(ジニトロ化を抑制)",
            products: [{ name: "ニトロベンゼン", formula: "C₆H₅NO₂", molKey: "nitrobenzene" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "ベンゼンを濃硝酸＋濃硫酸の混酸でニトロ化。芳香族求電子置換の代表例。",
          detail: "C₆H₆ + HNO₃ → C₆H₅NO₂ + H₂O(混酸、約 60 °C)\n\n濃硫酸が HNO₃ をプロトン化して活性種ニトロニウムイオン NO₂⁺ を生成、これが芳香族求電子置換でベンゼンと反応する。60 °C を超えるとジニトロベンゼンが生成しやすくなるため温度管理が重要。工業的にも実験室的にも芳香族ニトロ化の典型反応。アニリンの原料として最重要。",
          sources: ["Wikipedia: ニトロベンゼン", "高校化学 各社教科書"]
        }
      ],
      downstream: [
        {
          name: "Sn/HCl 還元によるアニリン",
          leadsTo: ["aniline"],
          shortNote: "Sn と濃塩酸で還元し、NaOH 処理でアニリンを遊離させる。アニリンの代表的合成経路。"
        },
        {
          name: "さらなるニトロ化によるジニトロベンゼン",
          leadsTo: ["dinitrobenzene"],
          shortNote: "より高温・濃混酸で 2 段目のニトロ化。NO₂ は m-配向のため 1,3-ジニトロベンゼンが主生成物。"
        }
      ],
      detectionReactions: [
        {
          reagent: "視認・嗅覚",
          result: "positive",
          observation: "淡黄色〜黄色の油状液体、アーモンドのような特徴的な香り",
          significance: "ニトロベンゼン特有",
          commonlyUsed: false,
          detail: "水より重い(密度約 1.20 g/mL)油状液体で、水に層分離する。香りで識別可能だが有毒(経皮吸収・血液毒性)のため臭いを嗅ぐ操作は推奨されない。"
        },
        {
          reagent: "Sn/HCl(還元)",
          result: "positive",
          observation: "アニリン(還元生成物)が得られ、さらし粉で赤紫呈色",
          significance: "ニトロ基の存在を還元生成物で確認",
          commonlyUsed: false,
          detail: "ニトロ化合物全般の検出には還元してアミンに変換し、アミン用試薬で確認する間接的な検出が用いられる。"
        }
      ],
      isomersDetail: {
        structural: [],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "平面分子。NO₂ 基は sp² で、N-O 結合は等価(共鳴により形式的二重結合が均等化)。不斉炭素や立体異性は存在しない。"
    },

    mononitroToluene: {
      synthesisRoutes: [
        {
          id: "mnt_toluene_nitration",
          name: "トルエンの混酸ニトロ化(1段目)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "トルエン", formula: "C₇H₈", molKey: "toluene" }],
            coReagents: [{ name: "硝酸(濃)", formula: "HNO₃", molKey: null }],
            catalyst: "硫酸(濃、混酸の一部)",
            conditions: "30〜50 °C、混酸(濃 HNO₃ + 濃 H₂SO₄)",
            products: [{ name: "モノニトロトルエン(o-/p- 主成分)", formula: "C₇H₇NO₂", molKey: "mononitroToluene" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "トルエンを混酸でニトロ化。メチル基の o,p-配向によりオルト体・パラ体が主生成物。",
          detail: "C₆H₅CH₃ + HNO₃ → CH₃-C₆H₄-NO₂ + H₂O\n\nメチル基は活性化＋ o,p-配向のため、生成比は概ね o-体 ≈ 60%、p-体 ≈ 35%、m-体 ≈ 5%。ベンゼンよりも反応性が高く、低温・希釈条件でも進む。単離した o-/p- 体は分留・冷却で分離(融点が大きく異なる)。TNT 合成の第 1 段。",
          sources: ["Wikipedia: ニトロトルエン", "高校化学 各社教科書"]
        }
      ],
      downstream: [
        {
          name: "さらなるニトロ化によるジニトロトルエン",
          leadsTo: ["dinitroToluene"],
          shortNote: "より厳しい条件で 2 段目のニトロ化、主に 2,4-DNT を与える。"
        },
        {
          name: "還元によるトルイジン(メチルアニリン)",
          leadsTo: [],
          shortNote: "Sn/HCl などで NO₂ を NH₂ に還元し、染料中間体トルイジンを得る。"
        }
      ],
      detectionReactions: [],
      isomersDetail: {
        structural: [
          { molKey: null, note: "o-ニトロトルエン(2-体、淡黄色油状、mp −10 °C)" },
          { molKey: null, note: "m-ニトロトルエン(3-体、油状、mp 16 °C)" },
          { molKey: null, note: "p-ニトロトルエン(4-体、淡黄色固体、mp 52 °C)" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "3 種の位置異性体(o-/m-/p-)が存在。いずれも平面分子で不斉炭素なし。融点・沸点で同定する。"
    },

    dinitroToluene: {
      synthesisRoutes: [
        {
          id: "dnt_mnt_nitration",
          name: "モノニトロトルエンのさらなるニトロ化(2段目)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "モノニトロトルエン", formula: "C₇H₇NO₂", molKey: "mononitroToluene" }],
            coReagents: [{ name: "硝酸(濃)", formula: "HNO₃", molKey: null }],
            catalyst: "硫酸(濃、混酸の一部)",
            conditions: "60〜80 °C、より濃い混酸",
            products: [{ name: "ジニトロトルエン(2,4-DNT 主成分)", formula: "C₇H₆N₂O₄", molKey: "dinitroToluene" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "モノニトロトルエンをより強い混酸でさらにニトロ化。2,4-DNT が主生成物。",
          detail: "CH₃-C₆H₄-NO₂ + HNO₃ → CH₃-C₆H₃(NO₂)₂ + H₂O\n\n既に環上にある NO₂ は m-配向・不活性化基だが、メチル基(o,p-配向・活性化)の効果と組み合わさり、結果として 2,4-DNT が主生成物となる。一段目のニトロ化より過酷な条件(高温・濃混酸)が必要。TNT 合成の第 2 段、およびポリウレタン原料 TDA(トルエンジアミン)の前駆体。",
          sources: ["Wikipedia: ジニトロトルエン"]
        }
      ],
      downstream: [
        {
          name: "TNT への 3 段目ニトロ化",
          leadsTo: ["tnt"],
          shortNote: "発煙硝酸＋発煙硫酸でさらにニトロ化、爆薬 2,4,6-トリニトロトルエンを得る。"
        },
        {
          name: "還元による TDA(トルエンジアミン)",
          leadsTo: [],
          shortNote: "水素化還元でトルエン-2,4-ジアミンを得る。MDI などポリウレタン原料の出発物質。"
        }
      ],
      detectionReactions: [],
      isomersDetail: {
        structural: [
          { molKey: null, note: "2,4-DNT(最も主要、mp 71 °C)" },
          { molKey: null, note: "2,6-DNT(次に多い副生成物、mp 66 °C)" },
          { molKey: null, note: "2,3-/3,4-/3,5-/2,5- など計 6 種の位置異性体が理論上存在するが、合成では主に 2,4- と 2,6- が得られる。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "計 6 種の位置異性体が存在しうるが、混酸ニトロ化では 2,4-DNT と 2,6-DNT がほぼすべてを占める。いずれも平面分子で不斉炭素なし。"
    },

    tnt: {
      synthesisRoutes: [
        {
          id: "tnt_dnt_nitration",
          name: "ジニトロトルエンの 3 段目ニトロ化",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "ジニトロトルエン(主に 2,4-DNT)", formula: "C₇H₆N₂O₄", molKey: "dinitroToluene" }],
            coReagents: [{ name: "硝酸(発煙硝酸)", formula: "HNO₃", molKey: null }],
            catalyst: "硫酸(発煙硫酸/オレウム)",
            conditions: "高温(80〜120 °C)、発煙硝酸＋発煙硫酸",
            products: [{ name: "2,4,6-トリニトロトルエン(TNT)", formula: "C₇H₅N₃O₆", molKey: "tnt" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "ジニトロトルエンを発煙混酸で 3 段目にニトロ化、爆薬 2,4,6-TNT を得る。",
          detail: "CH₃-C₆H₃(NO₂)₂ + HNO₃ → CH₃-C₆H₂(NO₂)₃ + H₂O\n\n環上にすでに 2 個の m-配向・不活性化基(NO₂)があるため、3 段目のニトロ化はかなり過酷な条件(発煙硝酸＋発煙硫酸、高温)が必要。メチル基の o,p-配向効果が残された反応点を選択し、結果として 2,4,6-トリニトロ体が選択的に得られる。黄色結晶(mp 80.4 °C)。衝撃や摩擦に対して比較的安定で、雷管なしでは爆発しないため軍事爆薬の標準として広く使われた。",
          sources: ["Wikipedia: トリニトロトルエン"]
        }
      ],
      downstream: [
        {
          name: "爆発分解(爆薬としての利用)",
          leadsTo: [],
          shortNote: "雷管による衝撃で急速分解、N₂・CO・CO₂・H₂O・C を放出して大量の気体と熱を発生。"
        }
      ],
      detectionReactions: [
        {
          reagent: "視認",
          result: "positive",
          observation: "淡黄色の針状結晶(mp 80.4 °C)",
          significance: "TNT 特有",
          commonlyUsed: false,
          detail: "光や熱に比較的安定、水に難溶、有機溶媒(アセトン・トルエン等)に可溶。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "理論上は 2,3,4-/2,3,5-/2,3,6-/2,4,5-/3,4,5- などのトリニトロトルエン異性体も存在するが、混酸ニトロ化では 2,4,6- 体がほぼ独占的に得られる。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "C₂ᵥ 対称の平面分子(メチル基の H 配座を平均すれば)。3 つの NO₂ と 1 つの CH₃ が対称配置で、不斉炭素も立体異性もない。NO₂ 基は環平面に対しほぼ共平面、若干ねじれる場合もある。"
    },

    // ── バッチ 6: 芳香族 N・ニトロ化合物 ② ─────────────────

    dinitrobenzene: {
      synthesisRoutes: [
        {
          id: "dnb_nitrobenzene_nitration",
          name: "ニトロベンゼンの 2 段目ニトロ化",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "ニトロベンゼン", formula: "C₆H₅NO₂", molKey: "nitrobenzene" }],
            coReagents: [{ name: "硝酸(濃〜発煙)", formula: "HNO₃", molKey: null }],
            catalyst: "硫酸(濃、混酸の一部)",
            conditions: "80〜100 °C、濃混酸",
            products: [{ name: "m-ジニトロベンゼン", formula: "C₆H₄(NO₂)₂", molKey: "dinitrobenzene" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "ニトロベンゼンを濃混酸でさらにニトロ化。NO₂ が m-配向のため 1,3-ジニトロベンゼンが主生成物。",
          detail: "C₆H₅NO₂ + HNO₃ → m-C₆H₄(NO₂)₂ + H₂O\n\n既存の NO₂ 基は強い不活性化＋ m-配向基。このためトルエンのニトロ化(メチル基が o,p-配向で 2,4-DNT を与える)と異なり、ベンゼンでは m-体が約 90% 以上を占める。反応は遅く、より高温・濃混酸が必要。染料中間体(m-フェニレンジアミンの前駆体)や爆薬として利用。",
          sources: ["Wikipedia: ジニトロベンゼン", "Solomons Organic Chemistry §15"]
        }
      ],
      downstream: [
        {
          name: "還元による m-フェニレンジアミン",
          leadsTo: [],
          shortNote: "Sn/HCl・Fe/HCl・H₂ 触媒還元等で 2 つの NO₂ を NH₂ に変換、染料中間体 m-フェニレンジアミンを得る。"
        }
      ],
      detectionReactions: [
        {
          reagent: "視認",
          result: "positive",
          observation: "淡黄色針状結晶(m-体: mp 90 °C)",
          significance: "ジニトロ芳香族特有",
          commonlyUsed: false,
          detail: "水に難溶、エタノール・ベンゼンに可溶。爆発性は TNT より低いが取扱注意。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "1,2-ジニトロベンゼン(o-体) mp 118 °C、混酸ニトロ化での副生成物" },
          { molKey: null, note: "1,3-ジニトロベンゼン(m-体) mp 90 °C、混酸ニトロ化の主生成物(〜90%)" },
          { molKey: null, note: "1,4-ジニトロベンゼン(p-体) mp 173 °C、副生成物" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "3 種の位置異性体が存在するが、ニトロ基の m-配向性により混酸ニトロ化では m-体が選択的に得られる。いずれも平面分子で不斉炭素なし。融点で同定可能(m: 90 °C / o: 118 °C / p: 173 °C)。"
    },

    acetanilide: {
      synthesisRoutes: [
        {
          id: "acetanilide_acetic_anhydride",
          name: "アニリンの無水酢酸によるアセチル化",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "アニリン", formula: "C₆H₅NH₂", molKey: "aniline" }],
            coReagents: [{ name: "無水酢酸", formula: "(CH₃CO)₂O", molKey: "aceticAnhydride" }],
            catalyst: "",
            conditions: "室温〜短時間加熱(発熱反応)",
            products: [{ name: "アセトアニリド", formula: "C₆H₅NHCOCH₃", molKey: "acetanilide" }],
            byProducts: [{ name: "酢酸", formula: "CH₃COOH", molKey: "aceticAcid" }]
          },
          shortNote: "アニリンの NH₂ を無水酢酸でアセチル化、白色針状結晶のアセトアニリドを得る。",
          detail: "C₆H₅NH₂ + (CH₃CO)₂O → C₆H₅NHCOCH₃ + CH₃COOH\n\nアセトアニリドは芳香族アミンのアセチル化の代表生成物。N が CO 基により電子吸引されるため塩基性が大きく低下し、塩酸に溶けにくくなる。19 世紀末〜20 世紀初頭に解熱鎮痛薬「アンチフェブリン」として用いられたが、毒性のため現在は薬用には使われない(メタボライトのアセトアミノフェンが代替)。",
          sources: ["Wikipedia: アセトアニリド", "高校化学 各社教科書"]
        }
      ],
      downstream: [
        {
          name: "加水分解によるアニリン再生",
          leadsTo: ["aniline", "aceticAcid"],
          shortNote: "希酸または希塩基で加熱加水分解しアニリンと酢酸に戻る。"
        },
        {
          name: "p-位の選択的置換による合成中間体利用",
          leadsTo: [],
          shortNote: "アセトアミド基はアミノ基より弱い活性化基となり、ニトロ化等で p-選択性が高まる(保護基としての役割)。"
        }
      ],
      detectionReactions: [
        {
          reagent: "塩酸(希)",
          result: "negative",
          observation: "溶けない(アニリンと違い塩酸塩を作らない)",
          significance: "アミドはアミンより塩基性が極めて弱いことを示す",
          commonlyUsed: true,
          detail: "アニリン(塩酸に溶ける)との対比で頻出。N の孤立電子対が C=O と非局在化するため、プロトン化されにくい。"
        },
        {
          reagent: "さらし粉水溶液",
          result: "negative",
          observation: "赤紫色の呈色なし",
          significance: "アニリン特有の呈色を示さない(NH₂ がアセチル化されているため)",
          commonlyUsed: false,
          detail: "「アニリン陽性 / アセトアニリド陰性」の対比は、アセチル化でアミンが「保護」されたことの証拠として高校化学で扱われる。"
        },
        {
          reagent: "視認",
          result: "positive",
          observation: "白色針状結晶(mp 114 °C)",
          significance: "アセトアニリド特有",
          commonlyUsed: false,
          detail: "水に難溶、熱水・エタノールに可溶。再結晶で精製しやすい固体。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "N-メチルベンズアミド(C₆H₅CONHCH₃)。同じ C₈H₉NO の構造異性体(位置交換)。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "アミド結合(C(=O)-N)は部分的二重結合性をもつためほぼ平面で、回転障壁が高い(〜80 kJ/mol)。シス・トランス異性は形式的にあり得るが、トランス型が圧倒的に安定で、観測上は単一構造。不斉炭素なし。"
    },

    acetaminophen: {
      synthesisRoutes: [
        {
          id: "acetaminophen_paminophenol_acetylation",
          name: "p-アミノフェノールの選択的アセチル化",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "p-アミノフェノール", formula: "HO-C₆H₄-NH₂", molKey: null }],
            coReagents: [{ name: "無水酢酸", formula: "(CH₃CO)₂O", molKey: "aceticAnhydride" }],
            catalyst: "",
            conditions: "水中、室温〜温和な加熱",
            products: [{ name: "アセトアミノフェン", formula: "HO-C₆H₄-NHCOCH₃", molKey: "acetaminophen" }],
            byProducts: [{ name: "酢酸", formula: "CH₃COOH", molKey: "aceticAcid" }]
          },
          shortNote: "p-アミノフェノールの NH₂ を無水酢酸で選択的アセチル化。OH 側はアセチル化されない。",
          detail: "HO-C₆H₄-NH₂ + (CH₃CO)₂O → HO-C₆H₄-NHCOCH₃ + CH₃COOH\n\nアミン NH₂ はフェノール OH より求核性が高いため、選択的にアセチル化される(p-アセトアミドフェノールが主生成物)。フェノール性 OH はそのまま残るため、FeCl₃ で呈色する。解熱鎮痛薬として極めて広く使用されている(タイレノール、カロナールなど)。アスピリンより胃障害が少ない一方、過剰摂取で重篤な肝障害を起こす。",
          sources: ["Wikipedia: アセトアミノフェン"]
        }
      ],
      downstream: [
        {
          name: "加水分解による p-アミノフェノール再生",
          leadsTo: [],
          shortNote: "希酸または希塩基の加水分解でアセチル基が外れ、p-アミノフェノールに戻る。体内代謝経路の一部でもある。"
        }
      ],
      detectionReactions: [
        {
          reagent: "FeCl₃ 水溶液",
          result: "positive",
          observation: "紫色〜青紫色に呈色",
          significance: "フェノール性 OH が残存していることを示す",
          commonlyUsed: true,
          detail: "アスピリンが FeCl₃ 陰性(OH がアセチル化)なのと対照的に、アセトアミノフェンは OH が残っているため陽性。アセチル化選択性を示す好例として教科書で扱われる。"
        },
        {
          reagent: "NaHCO₃ 水溶液",
          result: "negative",
          observation: "CO₂ を発生しない",
          significance: "カルボン酸ではない(フェノール性 OH＋アミドのみ)",
          commonlyUsed: true,
          detail: "アスピリン(COOH をもち陽性)との対比で頻出。"
        },
        {
          reagent: "塩酸(希)",
          result: "negative",
          observation: "溶けにくい",
          significance: "アミドの塩基性は弱く、塩酸塩を形成しない",
          commonlyUsed: false,
          detail: "アニリン陽性／アセトアミノフェン陰性。アセトアニリドと同様の挙動。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "o-/m- 異性体(薬効はない)" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "OH と NHCOCH₃ が p-位にある対称的な平面分子。不斉炭素なし。アミド結合はトランスが安定。"
    },

    benzeneDiazonium: {
      synthesisRoutes: [
        {
          id: "benzeneDiazonium_diazotization",
          name: "アニリンのジアゾ化",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "アニリン", formula: "C₆H₅NH₂", molKey: "aniline" }],
            coReagents: [
              { name: "亜硝酸ナトリウム", formula: "NaNO₂", molKey: "sodiumNitrite" },
              { name: "塩酸(希)", formula: "HCl", molKey: "hydrogenChloride" }
            ],
            catalyst: "",
            conditions: "0〜5 °C(氷水冷却必須)、塩酸過剰",
            products: [{ name: "塩化ベンゼンジアゾニウム", formula: "C₆H₅N₂Cl", molKey: "benzeneDiazonium" }],
            byProducts: [
              { name: "塩化ナトリウム", formula: "NaCl", molKey: "sodiumChloride" },
              { name: "水", formula: "H₂O", molKey: "water" }
            ]
          },
          shortNote: "アニリンを希塩酸中で NaNO₂ と低温反応させ、ベンゼンジアゾニウム塩を得る。",
          detail: "C₆H₅NH₂ + NaNO₂ + 2 HCl → C₆H₅N₂Cl + NaCl + 2 H₂O(0〜5 °C)\n\n反応中は NaNO₂ + HCl → HNO₂ で生じた亜硝酸が NH₂ を攻撃する機構(ニトロソアミン経由)。ジアゾニウム塩は極めて不安定で、温度が上がると(〜10 °C 以上) N₂ を発生してフェノールに分解する。通常は単離せず反応溶液中で発生させそのまま次の反応(カップリング・加水分解等)に進む。アゾ染料合成の出発点として歴史的・工業的に極めて重要。",
          sources: ["Wikipedia: ジアゾ化合物", "Wikipedia: ジアゾカップリング", "高校化学 各社教科書"]
        }
      ],
      downstream: [
        {
          name: "加水分解によるフェノール",
          leadsTo: ["phenol"],
          shortNote: "温水(〜60 °C 以上)で加熱すると N₂ を発生してフェノールが生成。"
        },
        {
          name: "ジアゾカップリングによる p-ヒドロキシアゾベンゼン",
          leadsTo: ["pHydroxyAzobenzene"],
          shortNote: "弱塩基性下のフェノキシドと p-カップリングして橙赤色アゾ染料を与える。"
        },
        {
          name: "ジアゾカップリングによる p-アミノアゾベンゼン",
          leadsTo: [],
          shortNote: "アニリンと弱酸性下でカップリングして黄色アゾ染料を与える。"
        }
      ],
      detectionReactions: [
        {
          reagent: "加温(温水)",
          result: "positive",
          observation: "N₂ を発泡しながらフェノールが生成(フェノール臭、FeCl₃ で呈色する溶液になる)",
          significance: "ジアゾニウム塩の不安定性を示す(最も特徴的な挙動)",
          commonlyUsed: true,
          detail: "C₆H₅N₂Cl + H₂O → C₆H₅OH + N₂↑ + HCl\n\nジアゾニウム塩を加温すると激しく N₂ を発生する。生成液は FeCl₃ で紫呈色(フェノール)するため、検出反応としても機能。"
        },
        {
          reagent: "フェノキシド(塩基性下)",
          result: "positive",
          observation: "橙赤色のアゾ染料が析出",
          significance: "ジアゾニウム塩の存在を強く示す(カップリング能の確認)",
          commonlyUsed: true,
          detail: "アゾ染料の鮮やかな色でジアゾニウム塩の生成が成功していることを確認できる。教科書実験で必ず行われる「ジアゾカップリングによる染料合成」の起点。"
        }
      ],
      isomersDetail: {
        structural: [],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "C₆H₅-N≡N⁺ で、ジアゾニウム部位は直線(C-N-N が約 180°)。芳香環と合わせて平面。5 °C 以上で分解する不安定塩で、固体での単離は通常行わない。"
    },

    pHydroxyAzobenzene: {
      synthesisRoutes: [
        {
          id: "pHA_diazo_coupling",
          name: "ジアゾカップリング(ベンゼンジアゾニウム＋ナトリウムフェノキシド)",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "塩化ベンゼンジアゾニウム", formula: "C₆H₅N₂Cl", molKey: "benzeneDiazonium" }],
            coReagents: [{ name: "ナトリウムフェノキシド", formula: "C₆H₅ONa", molKey: "sodiumPhenoxide" }],
            catalyst: "",
            conditions: "弱塩基性(pH 8〜10)、0〜5 °C",
            products: [{ name: "p-ヒドロキシアゾベンゼン", formula: "HO-C₆H₄-N=N-C₆H₅", molKey: "pHydroxyAzobenzene" }],
            byProducts: [{ name: "塩化ナトリウム", formula: "NaCl", molKey: "sodiumChloride" }]
          },
          shortNote: "ジアゾニウムカチオンがフェノキシドの p-位を求電子置換し、橙赤色のアゾ染料を生成。",
          detail: "C₆H₅N₂⁺ + C₆H₅O⁻ → C₆H₅-N=N-C₆H₄-OH(p-体)\n\nジアゾニウムカチオンは弱い求電子剤で、強く活性化された芳香環(フェノキシド)にしか反応しない。カップリングは通常 p-位で起こる(OH 基の o,p-配向、立体的に p-が有利)。pH が低すぎる(フェノールがフリー)と反応性が落ち、高すぎる(ジアゾニウムが分解)と暴走するため、弱塩基性が最適。鮮やかな橙赤色固体で、芳香族アゾ染料の典型例。",
          sources: ["Wikipedia: ジアゾカップリング", "Wikipedia: アゾ化合物", "高校化学 各社教科書"]
        }
      ],
      downstream: [
        {
          name: "Na₂S₂O₄ による還元的アゾ結合切断",
          leadsTo: ["aniline"],
          shortNote: "亜ジチオン酸ナトリウム等で N=N 結合を還元的に切断、アニリンと p-アミノフェノールに分解。"
        },
        {
          name: "酸塩基による色変化",
          leadsTo: [],
          shortNote: "OH 基の解離状態に応じて吸収波長が変化、簡易な pH 指示薬としても挙動する。"
        }
      ],
      detectionReactions: [
        {
          reagent: "視認",
          result: "positive",
          observation: "鮮やかな橙赤色の結晶(mp 152 °C)",
          significance: "アゾ染料特有の色",
          commonlyUsed: true,
          detail: "アゾ基(N=N)の π→π* 吸収と、p-OH からの電子供与による発色団系(D-π-A 系)が可視光領域に強い吸収を与える。アゾ染料の典型例。"
        },
        {
          reagent: "Na₂S₂O₄(還元剤)",
          result: "positive",
          observation: "橙赤色が消失(無色のアミン 2 種に分解)",
          significance: "アゾ基 N=N の還元的切断を示す",
          commonlyUsed: false,
          detail: "アゾ染料の構造解析の基本反応。HO-C₆H₄-N=N-C₆H₅ → HO-C₆H₄-NH₂ + H₂N-C₆H₅。生成したアミンは個別の試験(さらし粉、FeCl₃ 等)で同定できる。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "o-/m-ヒドロキシアゾベンゼン(カップリング反応では生成しにくい)" }
        ],
        geometric: [
          { type: "E/Z(trans/cis)", note: "アゾ基 N=N にトランス(E)/シス(Z)異性体が存在。室温では E 体が圧倒的に安定。紫外光照射で E→Z、可視光や加熱で Z→E に異性化する(フォトクロミズム)。アゾベンゼン類は分子スイッチの代表例。" }
        ],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "N=N 二重結合まわりにシス・トランス異性が存在する。E(トランス)体は平面に近く熱力学的に安定で室温での主構造、Z(シス)体は折れ曲がり構造で E より高エネルギー。紫外光(〜365 nm)で E→Z、可視光(〜450 nm)または熱で Z→E に異性化するフォトクロミック分子。アゾベンゼン本体や置換体は分子スイッチ・光応答性材料の母体として研究されている。"
    },

    // ── バッチ 8: 芳香族カルボニル②/フタル酸系 ─────────────
    // (バッチ 7: benzoicAcid 系は未追加)

    acetophenone: {
      synthesisRoutes: [
        {
          id: "acetophenone_friedel_crafts",
          name: "ベンゼンと塩化アセチルの Friedel–Crafts アシル化",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "ベンゼン", formula: "C₆H₆", molKey: "benzene" }],
            coReagents: [{ name: "塩化アセチル", formula: "CH₃COCl", molKey: "acetylChloride" }],
            catalyst: "AlCl₃(無水)",
            conditions: "無水条件、加熱(80〜100 °C)",
            products: [{ name: "アセトフェノン", formula: "C₆H₅COCH₃", molKey: "acetophenone" }],
            byProducts: [{ name: "塩化水素", formula: "HCl", molKey: "hydrogenChloride" }]
          },
          shortNote: "ベンゼンに AlCl₃ 触媒下で塩化アセチルを反応させる芳香族求電子置換(アシル化)。",
          detail: "C₆H₆ + CH₃COCl → C₆H₅COCH₃ + HCl(AlCl₃ 触媒)\n\nAlCl₃ が塩化アセチルを活性化し、アシリウムイオン CH₃CO⁺ を生成。これが芳香環を求電子置換。Friedel–Crafts アシル化はアルキル化(多置換しがち)と違い、1 段階で止まる(生成物の C=O 基が環を不活性化するため)。無水酢酸 (CH₃CO)₂O も同じ生成物を与える(副生物が酢酸になる)。",
          sources: ["Wikipedia: アセトフェノン", "Solomons Organic Chemistry §15"]
        }
      ],
      downstream: [
        {
          name: "還元による 1-フェニルエタノール",
          leadsTo: [],
          shortNote: "NaBH₄ や H₂/Ni でカルボニルを還元、2 級アルコール 1-フェニルエタノール(不斉中心をもつ)を与える。"
        },
        {
          name: "ハロホルム反応(CH₃-C(=O)- の切断)",
          leadsTo: ["benzoicAcid"],
          shortNote: "I₂/NaOH 等で CH₃ 側がハロホルム(CHI₃)として脱離、安息香酸(ナトリウム塩)を与える。"
        }
      ],
      detectionReactions: [
        {
          reagent: "ヨウ素＋水酸化ナトリウム(ヨードホルム反応)",
          result: "positive",
          observation: "淡黄色沈殿(CHI₃、ヨードホルム)と特徴的な医薬品様の香り",
          significance: "CH₃-C(=O)- 構造または CH₃-CH(OH)- 構造の存在を示す",
          commonlyUsed: true,
          detail: "CH₃-CO-Ar + 3 I₂ + 4 NaOH → CHI₃↓ + Ar-COONa + 3 NaI + 3 H₂O\n\nアセトン・アセトアルデヒド・エタノール・2-プロパノール等と並ぶヨードホルム反応陽性物質の代表。メチルケトン(CH₃-CO-R)または 2 級アルコール(CH₃-CH(OH)-R)特有の反応。アセトフェノンはメチルフェニルケトンとして典型的に陽性。"
        },
        {
          reagent: "Tollens 試薬・Fehling 試薬",
          result: "negative",
          observation: "銀鏡や赤色沈殿は生じない",
          significance: "ケトン(アルデヒドではない)であることを示す",
          commonlyUsed: true,
          detail: "ケトンはこれらの試薬で酸化されない。アルデヒド/ケトンの判別の基本。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "p-メチルベンズアルデヒド(4-CH₃-C₆H₄-CHO)。同じ C₈H₈O のアルデヒド異性体。" },
          { molKey: null, note: "フェニルアセトアルデヒド(C₆H₅-CH₂-CHO)。同じ C₈H₈O のアルデヒド異性体(ベンジル位)。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "ベンゼン環＋カルボニル基の平面分子。C=O が芳香環と共役して若干平面性をもつ。中央の sp² 炭素は左右が CH₃ と C₆H₅ だが二重結合 O も付くため不斉ではない。"
    },

    benzylAcetate: {
      synthesisRoutes: [
        {
          id: "benzylAcetate_esterification",
          name: "酢酸とベンジルアルコールのエステル化",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "酢酸", formula: "CH₃COOH", molKey: "aceticAcid" }],
            coReagents: [{ name: "ベンジルアルコール", formula: "C₆H₅CH₂OH", molKey: "benzylAlcohol" }],
            catalyst: "濃硫酸",
            conditions: "加熱還流",
            products: [{ name: "酢酸ベンジル", formula: "CH₃COOCH₂C₆H₅", molKey: "benzylAcetate" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "酢酸(カルボン酸)とベンジルアルコールの典型的 Fischer エステル化。ジャスミン様の香り。",
          detail: "CH₃COOH + C₆H₅CH₂OH ⇌ CH₃COOCH₂C₆H₅ + H₂O\n\n通常の Fischer エステル化。可逆反応のため、過剰のアルコール使用や水除去で平衡を生成側に寄せる。生成物はジャスミン・苺・梨様の甘い香りをもつ無色液体。香料として広く使われる(天然のジャスミン精油の主要成分)。",
          sources: ["Wikipedia: 酢酸ベンジル"]
        }
      ],
      downstream: [
        {
          name: "加水分解による酢酸とベンジルアルコール",
          leadsTo: ["aceticAcid", "benzylAlcohol"],
          shortNote: "酸または塩基触媒の加水分解で酢酸とベンジルアルコールに戻る。"
        }
      ],
      detectionReactions: [
        {
          reagent: "嗅覚(特徴的な香り)",
          result: "positive",
          observation: "ジャスミン・梨・苺様の甘い果実香",
          significance: "酢酸ベンジル特有",
          commonlyUsed: false,
          detail: "教科書実験で「香料エステルの代表」として紹介される。同様の果実エステル(酢酸エチル、酢酸イソアミル等)と区別が難しい場合もある。"
        },
        {
          reagent: "NaHCO₃ 水溶液",
          result: "negative",
          observation: "CO₂ を発生しない",
          significance: "カルボン酸ではない(エステル)",
          commonlyUsed: true,
          detail: "酢酸(陽性)との判別、エステル化の進行確認に使う。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "フェニル酢酸メチル(C₆H₅CH₂COOCH₃)。同じ C₉H₁₀O₂ の構造異性体。" },
          { molKey: null, note: "メチル安息香酸エチル類(CH₃-C₆H₄-COOC₂H₅)。同じ C₉H₁₀O₂ の位置異性体類。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "ベンゼン環＋エステル基の概ね平面に近い分子(CH₂ を介して柔軟)。不斉炭素なし。室温で液体(bp 213 °C)。"
    },

    anisole: {
      synthesisRoutes: [
        {
          id: "anisole_williamson",
          name: "Williamson エーテル合成(ナトリウムフェノキシド＋ハロゲン化メチル)",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "ナトリウムフェノキシド", formula: "C₆H₅ONa", molKey: "sodiumPhenoxide" }],
            coReagents: [{ name: "ヨードメタン(または臭化メチル)", formula: "CH₃I", molKey: "iodomethane" }],
            catalyst: "",
            conditions: "極性非プロトン溶媒(DMF、アセトン等)、室温〜温和な加熱",
            products: [{ name: "アニソール", formula: "C₆H₅OCH₃", molKey: "anisole" }],
            byProducts: [{ name: "ヨウ化ナトリウム", formula: "NaI", molKey: null }]
          },
          shortNote: "ナトリウムフェノキシドの O⁻ がハロゲン化メチルを SN2 攻撃してエーテル結合を作る。",
          detail: "C₆H₅O⁻Na⁺ + CH₃I → C₆H₅-O-CH₃ + NaI\n\nWilliamson エーテル合成の典型。フェノキシドが優れた求核剤として機能。工業的にはより安価なジメチル硫酸 (CH₃O)₂SO₂ を用いることも多い。アニソールは特徴的なアニス様の香り(アニス、フェンネル系)。",
          sources: ["Wikipedia: アニソール", "Solomons Organic Chemistry §11"]
        }
      ],
      downstream: [
        {
          name: "HBr 等による開裂でフェノール再生",
          leadsTo: ["phenol"],
          shortNote: "強酸(HBr、HI)で加熱、エーテル結合が切断されてフェノールとハロゲン化メチルを与える。"
        },
        {
          name: "p-位の選択的求電子置換",
          leadsTo: [],
          shortNote: "OCH₃ は強い o,p-配向・活性化基。ニトロ化やアシル化で容易に p-体(または o-体)が得られる。"
        }
      ],
      detectionReactions: [
        {
          reagent: "FeCl₃ 水溶液",
          result: "negative",
          observation: "呈色しない",
          significance: "フェノール性 OH ではないことを示す(メチルエーテル)",
          commonlyUsed: true,
          detail: "フェノール(陽性)との判別で重要。アニソールは O が CH₃ で塞がれているため、Fe³⁺ と配位錯体を作れない。"
        },
        {
          reagent: "Na(金属ナトリウム)",
          result: "negative",
          observation: "H₂ を発生しない",
          significance: "活性 H をもたないことを示す(OH なし)",
          commonlyUsed: true,
          detail: "ベンジルアルコール・フェノール・クレゾール(いずれも陽性)との判別ポイント。"
        },
        {
          reagent: "嗅覚",
          result: "positive",
          observation: "アニス・甘草様の香り",
          significance: "アニソール特有",
          commonlyUsed: false,
          detail: "天然にアニス(八角)の精油の構成成分。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "cresol", note: "クレゾール(CH₃-C₆H₄-OH、3 つの位置異性体)。同じ C₇H₈O のフェノール性異性体。" },
          { molKey: "benzylAlcohol", note: "ベンジルアルコール(C₆H₅CH₂OH)。同じ C₇H₈O の脂肪族アルコール異性体。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "C₇H₈O 異性体群の中で唯一のエーテル。OCH₃ 基はベンゼン環と概ね共平面(O の孤立電子対が芳香環と π 共役)。不斉炭素なし。"
    },

    phthalicAcid: {
      synthesisRoutes: [
        {
          id: "phthalic_anhydride_hydrolysis",
          name: "無水フタル酸の加水分解",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "無水フタル酸", formula: "C₈H₄O₃", molKey: "phthalicAnhydride" }],
            coReagents: [{ name: "水", formula: "H₂O", molKey: "water" }],
            catalyst: "",
            conditions: "温水中、加熱",
            products: [{ name: "フタル酸", formula: "C₆H₄(COOH)₂", molKey: "phthalicAcid" }],
            byProducts: []
          },
          shortNote: "無水フタル酸を温水で加水分解、2 つの COOH を再生してフタル酸を得る。",
          detail: "C₆H₄(CO)₂O + H₂O → C₆H₄(COOH)₂\n\n無水物の加水分解は容易。工業的には逆方向(フタル酸→無水フタル酸への脱水)が主流で、フタル酸自体を単離する場面は限定的。加熱(〜200 °C)で再び水を失い無水フタル酸に戻る可逆な脱水平衡が特徴。",
          sources: ["Wikipedia: フタル酸"]
        },
        {
          id: "phthalic_oxylene_oxidation",
          name: "o-キシレンの酸化(工業的、無水フタル酸経由)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "o-キシレン", formula: "C₆H₄(CH₃)₂", molKey: "oXylene" }],
            coReagents: [{ name: "酸素", formula: "O₂", molKey: "oxygen" }],
            catalyst: "V₂O₅(五酸化バナジウム)",
            conditions: "気相、約 350〜400 °C",
            products: [
              { name: "無水フタル酸", formula: "C₈H₄O₃", molKey: "phthalicAnhydride" },
              { name: "フタル酸(加水分解後)", formula: "C₆H₄(COOH)₂", molKey: "phthalicAcid" }
            ],
            byProducts: [
              { name: "水", formula: "H₂O", molKey: "water" },
              { name: "二酸化炭素", formula: "CO₂", molKey: "carbonDioxide" }
            ]
          },
          shortNote: "o-キシレンの 2 つのメチル基を V₂O₅ 触媒で空気酸化。直接無水フタル酸を経てフタル酸を得る。",
          detail: "C₆H₄(CH₃)₂ + 3 O₂ → C₆H₄(CO)₂O + 3 H₂O\n\nベンゼン環の o-位 2 メチル基が同時に酸化され、生成した 2 つの COOH が脱水して環状無水物となる(geometry 的に近接しているため)。1960 年代以降の主流で、ナフタレン酸化法を置き換えた。",
          sources: ["Wikipedia: 無水フタル酸"]
        }
      ],
      downstream: [
        {
          name: "脱水による無水フタル酸",
          leadsTo: ["phthalicAnhydride"],
          shortNote: "200 °C 以上で加熱すると分子内脱水で容易に無水フタル酸となる。"
        },
        {
          name: "アルコールとのエステル化(可塑剤)",
          leadsTo: ["dimethylPhthalate", "monomethylPhthalate"],
          shortNote: "メタノール・エタノール・2-エチルヘキサノール等とのエステル化、フタル酸エステル系可塑剤を与える。"
        }
      ],
      detectionReactions: [
        {
          reagent: "NaHCO₃ 水溶液",
          result: "positive",
          observation: "CO₂ を発泡しながら溶解",
          significance: "カルボン酸(しかもジカルボン酸)の存在",
          commonlyUsed: true,
          detail: "2 つの COOH をもつジカルボン酸。pKa₁ ≈ 2.9、pKa₂ ≈ 5.5 と最初の COOH は安息香酸より強酸(隣接 COOH の電子吸引効果)。"
        },
        {
          reagent: "加熱(200 °C 以上)",
          result: "positive",
          observation: "水を失って固化(無水フタル酸への変換)、特徴的な昇華も観察",
          significance: "o-位ジカルボン酸であることを示す",
          commonlyUsed: true,
          detail: "o-体特有の挙動: 2 つの COOH が空間的に近接しているため、加熱で容易に分子内脱水して 5 員環無水物を形成する。m-体(イソフタル酸)・p-体(テレフタル酸)はこの脱水を起こさないため、3 異性体の判別法として重要。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "イソフタル酸(m-ベンゼンジカルボン酸)。同じ C₈H₆O₄ の位置異性体。樹脂・塗料原料。" },
          { molKey: null, note: "テレフタル酸(p-ベンゼンジカルボン酸)。同じ C₈H₆O₄ の位置異性体。PET の原料として極めて重要。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "2 つの COOH が o-位にある平面分子で、近接により分子内水素結合を形成しやすい。加熱で容易に脱水して無水物へ変換する点が m-/p- 体との大きな違い。不斉炭素なし。"
    },

    phthalicAnhydride: {
      synthesisRoutes: [
        {
          id: "phthalicAnhydride_oxylene_oxidation",
          name: "o-キシレンの空気酸化(工業的、現代主流)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "o-キシレン", formula: "C₆H₄(CH₃)₂", molKey: "oXylene" }],
            coReagents: [{ name: "酸素", formula: "O₂", molKey: "oxygen" }],
            catalyst: "V₂O₅(五酸化バナジウム)",
            conditions: "気相、約 350〜400 °C",
            products: [{ name: "無水フタル酸", formula: "C₈H₄O₃", molKey: "phthalicAnhydride" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "o-キシレンの 2 つのメチル基を V₂O₅ 触媒で同時に酸化、無水フタル酸を直接生成。",
          detail: "C₆H₄(CH₃)₂ + 3 O₂ → C₆H₄(CO)₂O + 3 H₂O\n\n現代の無水フタル酸工業生産の主流。副生する CO₂・CO のロスを抑えるため触媒設計と温度管理が重要。可塑剤・染料・ポリエステル樹脂の主要中間体。",
          sources: ["Wikipedia: 無水フタル酸"]
        },
        {
          id: "phthalicAnhydride_naphthalene_oxidation",
          name: "ナフタレンの空気酸化(古典的工業法)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "ナフタレン", formula: "C₁₀H₈", molKey: "naphthalene" }],
            coReagents: [{ name: "酸素", formula: "O₂", molKey: "oxygen" }],
            catalyst: "V₂O₅(五酸化バナジウム)",
            conditions: "気相、約 350〜400 °C",
            products: [{ name: "無水フタル酸", formula: "C₈H₄O₃", molKey: "phthalicAnhydride" }],
            byProducts: [
              { name: "二酸化炭素", formula: "CO₂", molKey: "carbonDioxide" },
              { name: "水", formula: "H₂O", molKey: "water" }
            ]
          },
          shortNote: "ナフタレンの片方の環を V₂O₅ 触媒で酸化開裂、無水フタル酸を得る古典的工業法。",
          detail: "C₁₀H₈ + 9/2 O₂ → C₈H₄O₃ + 2 CO₂ + 2 H₂O\n\n1872 年から工業化された古い経路。炭素を 2 つ(→ CO₂)失うため原子効率が悪く、現代では o-キシレン経路に置き換わった。高校化学では「ナフタレンの工業的用途」として頻出(ナフタレン → 無水フタル酸)。",
          sources: ["Wikipedia: 無水フタル酸", "Wikipedia: ナフタレン"]
        }
      ],
      downstream: [
        {
          name: "加水分解によるフタル酸",
          leadsTo: ["phthalicAcid"],
          shortNote: "温水で加水分解しフタル酸に戻る(脱水との可逆平衡)。"
        },
        {
          name: "アルコールとのエステル化(可塑剤)",
          leadsTo: ["dimethylPhthalate", "monomethylPhthalate"],
          shortNote: "メタノール等と段階的にエステル化、モノエステル→ジエステル(可塑剤フタレート類)を与える。"
        },
        {
          name: "フェノールフタレインなど染料・指示薬の合成",
          leadsTo: ["phenolphthalein"],
          shortNote: "フェノール 2 分子と縮合させてフェノールフタレイン(pH 指示薬)を得る。"
        }
      ],
      detectionReactions: [
        {
          reagent: "視認",
          result: "positive",
          observation: "白色針状結晶(mp 131 °C)、加熱で容易に昇華",
          significance: "無水フタル酸特有",
          commonlyUsed: false,
          detail: "水に難溶だが、温水中で徐々に加水分解してフタル酸となる。"
        },
        {
          reagent: "水(加熱)",
          result: "positive",
          observation: "溶けてフタル酸の溶液となる(NaHCO₃ で発泡するようになる)",
          significance: "酸無水物であることを示す",
          commonlyUsed: false,
          detail: "酸無水物の典型的反応。アルコールと反応すればエステル、アンモニアと反応すれば酸アミドとなる。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "ホモフタル酸無水物・3-ヒドロキシフタリドなど形式的異性体は存在するが、芳香族 5 員環酸無水物としては無水フタル酸が代表。m-/p- 体は構造上 5 員環酸無水物を作れないため対応する無水物が存在しない。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "ベンゼン環に縮合した 5 員環酸無水物(ビシクロ平面分子)。m-/p-ベンゼンジカルボン酸(イソ・テレフタル酸)はこの 5 員環無水物を形成できない点が o-体(フタル酸)の構造的特徴を端的に示す。不斉炭素なし。"
    },

    // ── バッチ 9: キシレン異性体/芳香族ハロゲン化物 ──────────

    oXylene: {
      synthesisRoutes: [
        {
          id: "oxylene_petroleum_reforming",
          name: "石油の接触改質と BTX 分離(工業的)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "ナフサ(石油留分)", formula: "—", molKey: null }],
            coReagents: [],
            catalyst: "Pt/Al₂O₃ など",
            conditions: "約 500 °C、数気圧、その後分留・吸着分離",
            products: [{ name: "o-キシレン", formula: "C₈H₁₀", molKey: "oXylene" }],
            byProducts: [
              { name: "ベンゼン・トルエン", formula: "—", molKey: null },
              { name: "m-/p- キシレン", formula: "C₈H₁₀", molKey: null }
            ]
          },
          shortNote: "石油の接触改質で BTX 留分とともに得られ、分留・吸着分離で他のキシレン異性体から分離。",
          detail: "工業的供給源は石油の接触改質(BTX = ベンゼン・トルエン・キシレン)。\n\n3 つのキシレン異性体は沸点が近い(o: 144 °C、m: 139 °C、p: 138 °C)ため分留だけでは分離が難しいが、o-体は他より沸点がやや高く分留で取り出しやすい。p-体はモレキュラーシーブによる吸着分離、m-体は異性化平衡で増減させる。",
          sources: ["Wikipedia: キシレン", "Wikipedia: 接触改質"]
        }
      ],
      downstream: [
        {
          name: "酸化による無水フタル酸(およびフタル酸)",
          leadsTo: ["phthalicAnhydride", "phthalicAcid"],
          shortNote: "V₂O₅ 触媒の空気酸化で 2 つのメチル基が同時に酸化され、無水フタル酸を直接生成(最重要用途)。"
        }
      ],
      detectionReactions: [
        {
          reagent: "KMnO₄(熱・酸性)→ 加熱(脱水)",
          result: "positive",
          observation: "フタル酸を経て、加熱でさらに水を失い無水フタル酸になる",
          significance: "o-体特有(隣接 COOH が脱水で 5 員環無水物形成)",
          commonlyUsed: true,
          detail: "3 つのキシレン異性体の判別で頻出:\n\no-体: KMnO₄ でフタル酸 → 加熱で脱水して無水フタル酸に変化(昇華も起こる)\nm-体: イソフタル酸(脱水しない)\np-体: テレフタル酸(脱水しない、昇華もせず難溶)"
        },
        {
          reagent: "Br₂ 水",
          result: "negative",
          observation: "脱色しない",
          significance: "脂肪族不飽和ではなく芳香族",
          commonlyUsed: false,
          detail: "ベンゼン同様、芳香族安定化のため Br₂ 水と付加反応しない。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "mXylene", note: "m-キシレン(1,3-体)。同じ C₈H₁₀ の位置異性体。" },
          { molKey: "pXylene", note: "p-キシレン(1,4-体)。同じ C₈H₁₀ の位置異性体。" },
          { molKey: "ethylbenzene", note: "エチルベンゼン(C₆H₅C₂H₅)。同じ C₈H₁₀ の構造異性体(一置換)。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "1,2-ジメチル平面分子。融点 −25 °C、沸点 144 °C で液体。隣接する 2 つのメチル基により酸化後にフタル酸→無水フタル酸の脱水が起こせる点が m-/p- 体と決定的に異なる。不斉炭素なし。"
    },

    mXylene: {
      synthesisRoutes: [
        {
          id: "mxylene_petroleum_reforming",
          name: "石油の接触改質と BTX 分離(工業的)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "ナフサ(石油留分)", formula: "—", molKey: null }],
            coReagents: [],
            catalyst: "Pt/Al₂O₃ など",
            conditions: "約 500 °C、数気圧、その後分留・吸着分離",
            products: [{ name: "m-キシレン", formula: "C₈H₁₀", molKey: "mXylene" }],
            byProducts: [{ name: "o-/p- キシレン", formula: "C₈H₁₀", molKey: null }]
          },
          shortNote: "BTX 留分から分離。3 異性体中で熱力学的に最も安定なため平衡含量が最大(〜50%)。",
          detail: "石油由来の混合キシレンには熱力学平衡に近い比率で m-体が約 50%、o-/p- 体がそれぞれ約 20〜25% 含まれる。\n\nm-体は需要が低いため、異性化触媒で p-体に変換して使うことも多い。直接用途はイソフタル酸の原料(樹脂・塗料)。",
          sources: ["Wikipedia: キシレン"]
        }
      ],
      downstream: [
        {
          name: "酸化によるイソフタル酸",
          leadsTo: [],
          shortNote: "Co/Mn 触媒の空気酸化(または KMnO₄)で 2 つのメチル基を酸化、イソフタル酸を得る。樹脂・塗料原料。"
        }
      ],
      detectionReactions: [
        {
          reagent: "KMnO₄(熱・酸性)→ 加熱",
          result: "positive",
          observation: "イソフタル酸が得られるが、加熱しても脱水(無水物形成)しない",
          significance: "m-体特有(COOH が離れているため 5 員環無水物を作れない)",
          commonlyUsed: true,
          detail: "3 つのキシレン異性体の判別で頻出:\n\no-体: フタル酸 → 加熱で無水フタル酸(脱水)\nm-体: イソフタル酸(脱水しない)\np-体: テレフタル酸(脱水しない、難溶・昇華せず)\n\nm-体は p-体と区別がつきにくいが、生成酸の溶解度・融点で識別する。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "oXylene", note: "o-キシレン(1,2-体)。同じ C₈H₁₀ の位置異性体。" },
          { molKey: "pXylene", note: "p-キシレン(1,4-体)。同じ C₈H₁₀ の位置異性体。" },
          { molKey: "ethylbenzene", note: "エチルベンゼン。同じ C₈H₁₀ の構造異性体。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "1,3-ジメチル平面分子。融点 −48 °C(3 異性体中で最も低い)、沸点 139 °C。3 異性体の中で熱力学的に最安定で、混合キシレンの平衡組成では m-体が約 50%。不斉炭素なし。"
    },

    pXylene: {
      synthesisRoutes: [
        {
          id: "pxylene_petroleum_reforming",
          name: "石油の接触改質＋分子ふるい吸着分離(工業的)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "ナフサ(石油留分)", formula: "—", molKey: null }],
            coReagents: [],
            catalyst: "Pt/Al₂O₃(改質)、ゼオライト(異性化・分離)",
            conditions: "改質 ~500 °C、その後分子ふるいによる選択吸着分離",
            products: [{ name: "p-キシレン", formula: "C₈H₁₀", molKey: "pXylene" }],
            byProducts: [{ name: "o-/m- キシレン", formula: "C₈H₁₀", molKey: null }]
          },
          shortNote: "BTX 留分から分子ふるい(ゼオライト)で選択的に吸着分離。需要が最も高いキシレン異性体。",
          detail: "p-体は他の 2 異性体と沸点がほぼ同じ(138 °C)で蒸留分離が困難なため、分子サイズの違いを利用したゼオライト吸着分離(UOP の Parex プロセス等)で工業的に取り出す。\n\nm-体を異性化触媒(モルデナイト等)で平衡的に p-体に変換し、再吸着分離するループで生産量を最大化する。PET(ポリエチレンテレフタラート)の原料として極めて重要。",
          sources: ["Wikipedia: キシレン", "Wikipedia: テレフタル酸"]
        }
      ],
      downstream: [
        {
          name: "酸化によるテレフタル酸(PET 原料)",
          leadsTo: ["pet"],
          shortNote: "Co/Mn/Br 触媒の空気酸化(Amoco 法)でテレフタル酸を生成、エチレングリコールと縮合重合して PET を与える。"
        }
      ],
      detectionReactions: [
        {
          reagent: "KMnO₄(熱・酸性)→ 加熱",
          result: "positive",
          observation: "テレフタル酸が得られる。加熱しても脱水せず、水・有機溶媒に難溶で昇華もしない",
          significance: "p-体特有(COOH が反対側にあり相互作用が起こらない)",
          commonlyUsed: true,
          detail: "3 つのキシレン異性体の判別で頻出:\n\no-体: フタル酸 → 無水フタル酸(脱水・昇華)\nm-体: イソフタル酸(脱水しない、エタノール可溶)\np-体: テレフタル酸(脱水しない、極めて難溶で昇華もせず)\n\n生成物の物理的性質(融点・溶解度・昇華性)で 3 異性体を識別できる。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "oXylene", note: "o-キシレン(1,2-体)" },
          { molKey: "mXylene", note: "m-キシレン(1,3-体)" },
          { molKey: "ethylbenzene", note: "エチルベンゼン" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "1,4-ジメチル平面分子。3 異性体中で唯一融点が高く(13 °C)、室温付近で固化する。これは対称性が高く結晶パッキングが密になるため。不斉炭素なし。"
    },

    chlorobenzene: {
      synthesisRoutes: [
        {
          id: "chlorobenzene_friedel_crafts_chlorination",
          name: "ベンゼンの塩素化(FeCl₃ 触媒)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "ベンゼン", formula: "C₆H₆", molKey: "benzene" }],
            coReagents: [{ name: "塩素", formula: "Cl₂", molKey: "chlorine" }],
            catalyst: "FeCl₃(または Fe)",
            conditions: "室温〜温和な加熱、無水",
            products: [{ name: "クロロベンゼン", formula: "C₆H₅Cl", molKey: "chlorobenzene" }],
            byProducts: [{ name: "塩化水素", formula: "HCl", molKey: "hydrogenChloride" }]
          },
          shortNote: "ベンゼンに FeCl₃ 触媒下で Cl₂ を反応させる芳香族求電子置換反応。",
          detail: "C₆H₆ + Cl₂ → C₆H₅Cl + HCl(FeCl₃ 触媒)\n\nFeCl₃ が Cl₂ を活性化し、Cl⁺ 様の求電子種を生じる。これがベンゼンを置換攻撃する。鉄粉を用いる場合は反応中に FeCl₃ が生成して触媒として働く。副反応で o-/p-ジクロロベンゼン(防虫剤の主成分)も生成する。",
          sources: ["Wikipedia: クロロベンゼン", "Solomons Organic Chemistry §15"]
        }
      ],
      downstream: [
        {
          name: "高温高圧の NaOH によるフェノール(Dow 法、古典)",
          leadsTo: ["phenol"],
          shortNote: "300 °C 以上、高圧の NaOH 水溶液で芳香族 C-Cl が加水分解しナトリウムフェノキシド経由でフェノールへ。現代では使われない歴史的工業法。"
        },
        {
          name: "DDT・農薬・染料中間体への変換",
          leadsTo: [],
          shortNote: "活性化された電子求引基(NO₂ 等)を入れて求核置換反応性を高め、各種の置換ベンゼン誘導体を合成。"
        }
      ],
      detectionReactions: [
        {
          reagent: "AgNO₃ 水溶液(室温)",
          result: "negative",
          observation: "AgCl の沈殿が生じない",
          significance: "芳香族 C-Cl であることを示す(脂肪族 C-Cl との判別)",
          commonlyUsed: true,
          detail: "脂肪族塩化物(CH₃Cl・C₂H₅Cl 等)との重要な判別法:\n\n脂肪族 C-Cl: 室温で AgNO₃ と反応し AgCl 白色沈殿(特に SN1 が進む 3 級ハロゲン化物では速い)\n芳香族 C-Cl(クロロベンゼン): C-Cl が芳香環と共役して結合が強く、室温の AgNO₃ では加水分解しない\n\nこれは芳香族ハロゲン化物の置換反応の不活性さを端的に示す重要な性質。"
        },
        {
          reagent: "視認・嗅覚",
          result: "positive",
          observation: "無色〜淡黄色油状液体(密度 1.11、bp 132 °C)、特徴的な芳香",
          significance: "クロロベンゼン特有",
          commonlyUsed: false,
          detail: "水より重い液体。水に難溶、ベンゼン等の有機溶媒に可溶。"
        }
      ],
      isomersDetail: {
        structural: [],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "ベンゼン環＋Cl の平面分子。Cl の孤立電子対が芳香環と π 共役するため、C-Cl 結合は脂肪族より短く強い(結合エネルギー約 96 kcal/mol、vs CH₃Cl の約 84 kcal/mol)。不斉炭素なし。"
    },

    bromobenzene: {
      synthesisRoutes: [
        {
          id: "bromobenzene_friedel_crafts_bromination",
          name: "ベンゼンの臭素化(FeBr₃ 触媒)",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "ベンゼン", formula: "C₆H₆", molKey: "benzene" }],
            coReagents: [{ name: "臭素", formula: "Br₂", molKey: "bromine" }],
            catalyst: "FeBr₃(または Fe)",
            conditions: "室温〜温和な加熱、無水",
            products: [{ name: "ブロモベンゼン", formula: "C₆H₅Br", molKey: "bromobenzene" }],
            byProducts: [{ name: "臭化水素", formula: "HBr", molKey: "hydrogenBromide" }]
          },
          shortNote: "ベンゼンに FeBr₃ 触媒下で Br₂ を反応させる芳香族求電子置換反応。",
          detail: "C₆H₆ + Br₂ → C₆H₅Br + HBr(FeBr₃ 触媒)\n\n機構はクロロベンゼン合成と同型。FeBr₃ が Br₂ を活性化して Br⁺ 様種を生じ、ベンゼンを求電子置換する。\n\n触媒の有無で生成物が決定的に変わる点が重要:\n  FeBr₃ 触媒下: 環の置換(→ ブロモベンゼン)\n  光照射下、無触媒: ベンゼンは反応しないが、トルエン等では側鎖ラジカル臭素化(→ 臭化ベンジル)",
          sources: ["Wikipedia: ブロモベンゼン", "Solomons Organic Chemistry §15"]
        }
      ],
      downstream: [
        {
          name: "Grignard 試薬(PhMgBr)の調製",
          leadsTo: [],
          shortNote: "金属 Mg(無水エーテル中)と反応してフェニルマグネシウムブロミド(Grignard 試薬)を与え、各種カルボニル化合物への付加に利用。"
        },
        {
          name: "鈴木–宮浦カップリング等のクロスカップリング",
          leadsTo: [],
          shortNote: "Pd 触媒下でアリールボロン酸とカップリングしてビアリールを与える。現代有機合成の基幹反応。"
        }
      ],
      detectionReactions: [
        {
          reagent: "AgNO₃ 水溶液(室温)",
          result: "negative",
          observation: "AgBr の沈殿が生じない",
          significance: "芳香族 C-Br であることを示す",
          commonlyUsed: true,
          detail: "クロロベンゼンと同じく、芳香族 C-Br は π 共役で安定化されているため、室温の AgNO₃ とは反応しない。脂肪族臭化物(C₂H₅Br など、SN1/SN2 で AgBr 沈殿)との判別に有用。"
        },
        {
          reagent: "視認",
          result: "positive",
          observation: "無色油状液体(密度 1.50、bp 156 °C)、ベンゼン様の香り",
          significance: "ブロモベンゼン特有",
          commonlyUsed: false,
          detail: "水より重い液体で、水に難溶、有機溶媒に可溶。"
        }
      ],
      isomersDetail: {
        structural: [],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "ベンゼン環＋Br の平面分子。クロロベンゼンと同様、C-Br 結合が芳香環と共役して脂肪族 C-Br より強い。不斉炭素なし。Grignard 試薬の出発物質として、有機合成で最も使われるアリールハライドの一つ。"
    },

    // ── バッチ 10: 芳香族スルホン酸/フタル酸エステル系 ──────

    benzenesulfonicAcid: {
      synthesisRoutes: [
        {
          id: "benzenesulfonic_sulfonation",
          name: "ベンゼンの濃硫酸によるスルホン化",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "ベンゼン", formula: "C₆H₆", molKey: "benzene" }],
            coReagents: [{ name: "硫酸(濃または発煙)", formula: "H₂SO₄", molKey: null }],
            catalyst: "",
            conditions: "加熱(80〜100 °C)、濃硫酸または発煙硫酸",
            products: [{ name: "ベンゼンスルホン酸", formula: "C₆H₅SO₃H", molKey: "benzenesulfonicAcid" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "ベンゼンを濃硫酸とともに加熱、芳香族求電子置換でスルホ基(−SO₃H)を導入する。",
          detail: "C₆H₆ + H₂SO₄ → C₆H₅SO₃H + H₂O\n\n濃硫酸中で SO₃ または HSO₃⁺ が発生し、ベンゼンを求電子置換する。ベンゼンのニトロ化と並ぶ芳香族求電子置換の代表反応。可逆反応で、希硫酸中での加熱や水蒸気による加熱でベンゼンに戻る(脱スルホン化)点も特徴。工業的にもこの経路で生産されるが、強酸性で取り扱い注意。",
          sources: ["Wikipedia: ベンゼンスルホン酸", "高校化学 各社教科書"]
        }
      ],
      downstream: [
        {
          name: "中和によるベンゼンスルホン酸ナトリウム",
          leadsTo: ["sodiumBenzenesulfonate"],
          shortNote: "NaOH または Na₂CO₃ で中和し、水溶性の Na 塩を得る(フェノール合成への中間体)。"
        },
        {
          name: "Na 塩経由フェノール合成(アルカリ融解)",
          leadsTo: ["sodiumBenzenesulfonate", "sodiumPhenoxide", "phenol"],
          shortNote: "Na 塩化→固体 NaOH と高温融解→酸性化でフェノールを得る古典的工業法。"
        }
      ],
      detectionReactions: [
        {
          reagent: "NaHCO₃ 水溶液",
          result: "positive",
          observation: "CO₂ を発泡しながら溶解",
          significance: "強酸(カルボン酸より強い)であることを示す",
          commonlyUsed: false,
          detail: "ベンゼンスルホン酸は pKa ≈ −2.5 と硫酸並みの強酸。NaHCO₃ で容易に脱プロトン化されて Na 塩となる。"
        },
        {
          reagent: "塩化バリウム水溶液",
          result: "negative",
          observation: "BaSO₄ の白色沈殿は生じない(硫酸イオンとの判別)",
          significance: "スルホン酸の S は加水分解しにくいことを示す(硫酸塩との区別)",
          commonlyUsed: false,
          detail: "C-S 結合が安定なため、室温では硫酸イオンを生じない。これにより硫酸(同じ pKa 域だが BaSO₄ を作る)と区別できる。"
        },
        {
          reagent: "水",
          result: "positive",
          observation: "水によく溶ける(強酸性水溶液)",
          significance: "強い親水性",
          commonlyUsed: false,
          detail: "−SO₃H 基は強い親水性をもつため、芳香族化合物では珍しく水溶性が高い。界面活性剤の親水基として広く利用される(ABS 洗剤など)。"
        }
      ],
      isomersDetail: {
        structural: [],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "ベンゼン環＋スルホ基の概ね平面分子。S は四面体(sp³)で 3 つの O と 1 つの C-Ar に結合(うち 2 つの S=O は二重結合性)。不斉炭素なし。"
    },

    sodiumBenzenesulfonate: {
      synthesisRoutes: [
        {
          id: "sodiumBenzenesulfonate_neutralization",
          name: "ベンゼンスルホン酸の中和",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "ベンゼンスルホン酸", formula: "C₆H₅SO₃H", molKey: "benzenesulfonicAcid" }],
            coReagents: [{ name: "水酸化ナトリウム", formula: "NaOH", molKey: "sodiumHydroxide" }],
            catalyst: "",
            conditions: "水溶液、室温",
            products: [{ name: "ベンゼンスルホン酸ナトリウム", formula: "C₆H₅SO₃Na", molKey: "sodiumBenzenesulfonate" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "ベンゼンスルホン酸を NaOH(または Na₂CO₃)で中和、水溶性の Na 塩を得る。",
          detail: "C₆H₅SO₃H + NaOH → C₆H₅SO₃Na + H₂O\n\n強酸 + 強塩基の単純中和。単離して固体として保存できる。アルカリ融解の出発物質となる。スルホン酸塩(−SO₃Na)は界面活性剤の親水基として中性洗剤の構成にも使われる(ドデシルベンゼンスルホン酸ナトリウム＝ABS)。",
          sources: ["Wikipedia: ベンゼンスルホン酸"]
        }
      ],
      downstream: [
        {
          name: "アルカリ融解によるナトリウムフェノキシド(→フェノール)",
          leadsTo: ["sodiumPhenoxide", "phenol"],
          shortNote: "固体 NaOH と高温(〜300 °C)で融解し、SO₃Na を ONa に置き換えてナトリウムフェノキシドを生成。酸性化でフェノール。"
        }
      ],
      detectionReactions: [
        {
          reagent: "強酸(HCl 等)",
          result: "positive",
          observation: "ベンゼンスルホン酸が遊離(しかし固体として析出はしない、水可溶)",
          significance: "強酸塩であることを示す",
          commonlyUsed: false,
          detail: "ベンゼンスルホン酸は強酸かつ水溶性のため、塩から酸を遊離させても沈殿せず、溶液のまま強酸性となる。"
        },
        {
          reagent: "視認",
          result: "positive",
          observation: "白色〜淡黄色の結晶性固体、水によく溶ける",
          significance: "イオン性塩特有",
          commonlyUsed: false,
          detail: "高校化学ではフェノール合成の中間体として頻出。単独で扱われることは少ない。"
        }
      ],
      isomersDetail: {
        structural: [],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "ベンゼンスルホン酸の Na 塩。アニオン C₆H₅SO₃⁻ は対称性が高く、3 つの S-O 結合は等価(共鳴により形式的二重結合が均等化)。不斉炭素なし。"
    },

    cumeneHydroperoxide: {
      synthesisRoutes: [
        {
          id: "chp_cumene_autoxidation",
          name: "クメンの空気酸化(自動酸化)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "クメン", formula: "C₉H₁₂", molKey: "cumene" }],
            coReagents: [{ name: "酸素", formula: "O₂", molKey: "oxygen" }],
            catalyst: "(無触媒のラジカル連鎖反応／弱塩基で促進)",
            conditions: "80〜130 °C、空気または酸素加圧、ラジカル連鎖機構",
            products: [{ name: "クメンヒドロペルオキシド", formula: "C₆H₅C(CH₃)₂OOH", molKey: "cumeneHydroperoxide" }],
            byProducts: []
          },
          shortNote: "クメンの 3 級ベンジル位 C-H が空気酸化されてヒドロペルオキシドが生成、クメン法の第 1 段。",
          detail: "C₆H₅CH(CH₃)₂ + O₂ → C₆H₅C(CH₃)₂OOH\n\nラジカル連鎖機構で進行する自動酸化(autoxidation)。3 級ベンジル位 C-H が選択的に攻撃される理由はベンジル位ラジカル安定化(共鳴)と 3 級炭素の超共役安定化。一段で 30〜40% まで濃縮し、次の酸転位段に送る。爆発性のため濃度・温度管理が極めて重要。",
          sources: ["Wikipedia: クメンヒドロペルオキシド", "Wikipedia: クメン法"]
        }
      ],
      downstream: [
        {
          name: "酸触媒転位によるフェノール+アセトン(クメン法の核)",
          leadsTo: ["phenol", "acetone"],
          shortNote: "希硫酸触媒下で O-O 結合切断＋Ph 基の 1,2-移動が起こり、フェノールとアセトンを 1:1 で生成。"
        }
      ],
      detectionReactions: [
        {
          reagent: "ヨウ化カリウム水溶液(KI/H⁺)",
          result: "positive",
          observation: "ヨウ素(I₂、褐色)が遊離、デンプンを加えると青紫呈色",
          significance: "過酸化物(−O−O− 結合)の存在を示す",
          commonlyUsed: true,
          detail: "過酸化物全般の検出反応: R-O-O-H + 2 I⁻ + 2 H⁺ → R-OH + I₂ + H₂O。\n\nエーテル類の劣化(過酸化物生成)チェックにも使われる重要な検出法。"
        },
        {
          reagent: "希硫酸(加熱)",
          result: "positive",
          observation: "フェノール臭 + アセトン臭が発生(FeCl₃ で紫呈色する液となる)",
          significance: "Hock 転位による分解を示す",
          commonlyUsed: false,
          detail: "クメン法の核心反応の確認。生成物はフェノール(FeCl₃ 陽性)とアセトン(ヨードホルム陽性)で同定可能。"
        }
      ],
      isomersDetail: {
        structural: [],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "中央 C は CH₃ を 2 つ持つため不斉ではない。" },
        conformers: []
      },
      stereochemistryDetail: "中央の sp³ 炭素は CH₃ × 2 + C₆H₅ + OOH の置換で不斉ではない。−O−O−H 部位は一般に弱い結合(〜35 kcal/mol、C-C の半分以下)で熱・衝撃・金属イオンに敏感。爆発性のため取扱いは希釈状態が必須。"
    },

    dimethylPhthalate: {
      synthesisRoutes: [
        {
          id: "dmp_phthalic_anhydride_methanol",
          name: "無水フタル酸とメタノールの 2 段エステル化",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "無水フタル酸", formula: "C₈H₄O₃", molKey: "phthalicAnhydride" }],
            coReagents: [{ name: "メタノール(過剰)", formula: "CH₃OH", molKey: "methanol" }],
            catalyst: "濃硫酸",
            conditions: "加熱還流、メタノール過剰",
            products: [{ name: "フタル酸ジメチル", formula: "C₆H₄(COOCH₃)₂", molKey: "dimethylPhthalate" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "無水フタル酸→モノメチルエステル→ジメチルエステルの 2 段エステル化を一つの工程で進める。",
          detail: "(1) C₆H₄(CO)₂O + CH₃OH → モノメチル体(無触媒で進行)\n(2) モノメチル体 + CH₃OH ⇌ ジメチル体 + H₂O(濃硫酸触媒、可逆)\n\n第 1 段は無水物の開環で速やか、第 2 段は通常のエステル化平衡。過剰のメタノールと水除去で第 2 段を生成側に押し進める。用途: 可塑剤、忌避剤(蚊・ダニよけ、DEET の前身として使用された)、香料溶剤。",
          sources: ["Wikipedia: フタル酸ジメチル"]
        }
      ],
      downstream: [
        {
          name: "加水分解によるフタル酸とメタノール",
          leadsTo: ["phthalicAcid", "methanol"],
          shortNote: "酸または塩基触媒の加水分解でフタル酸とメタノールに戻る。"
        }
      ],
      detectionReactions: [
        {
          reagent: "NaHCO₃ 水溶液",
          result: "negative",
          observation: "CO₂ を発生しない",
          significance: "遊離 COOH をもたない(完全エステル)ことを示す",
          commonlyUsed: true,
          detail: "フタル酸(陽性)・モノメチルフタル酸(陽性)との判別ポイント。両 COOH がエステル化された証拠。"
        },
        {
          reagent: "視認",
          result: "positive",
          observation: "無色の油状液体(mp 5 °C、bp 282 °C)、わずかに芳香",
          significance: "ジメチルフタル酸特有",
          commonlyUsed: false,
          detail: "水に難溶、有機溶媒に可溶。可塑剤・溶剤として広く流通。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "イソフタル酸ジメチル(m-体)、テレフタル酸ジメチル(p-体)。同じ C₁₀H₁₀O₄ の位置異性体。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "ベンゼン環＋2 つのエステル基の概ね平面分子(エステル基はやや回転自由)。不斉炭素なし。"
    },

    monomethylPhthalate: {
      synthesisRoutes: [
        {
          id: "mmp_anhydride_methanol",
          name: "無水フタル酸の片側だけ開環エステル化",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "無水フタル酸", formula: "C₈H₄O₃", molKey: "phthalicAnhydride" }],
            coReagents: [{ name: "メタノール(等量)", formula: "CH₃OH", molKey: "methanol" }],
            catalyst: "(無触媒で進行、または酸触媒少量)",
            conditions: "室温〜温和な加熱、メタノール等モル",
            products: [{ name: "フタル酸モノメチル", formula: "C₆H₄(COOCH₃)(COOH)", molKey: "monomethylPhthalate" }],
            byProducts: []
          },
          shortNote: "酸無水物の片側だけがメタノールで開環し、片側 COOH＋片側 COOMe の半エステルが得られる。",
          detail: "C₆H₄(CO)₂O + CH₃OH → o-HOOC-C₆H₄-COOCH₃\n\n酸無水物の選択的開環は容易(求核剤がそのまま COOH と COO−R に分かれる)。第 2 段のエステル化(COOH → COOCH₃)は酸触媒と高温が必要なので、温和な条件で止めればモノエステルで止まる。同じ手法で他のジカルボン酸無水物(無水マレイン酸など)からも半エステルが得られる。",
          sources: ["Wikipedia: フタル酸エステル"]
        }
      ],
      downstream: [
        {
          name: "さらなるエステル化によるフタル酸ジメチル",
          leadsTo: ["dimethylPhthalate"],
          shortNote: "残りの COOH をメタノール+酸触媒でエステル化、ジメチルエステルへ。"
        },
        {
          name: "脱水で無水フタル酸への戻り",
          leadsTo: ["phthalicAnhydride"],
          shortNote: "強加熱で COOH 側のメタノールが脱離する形で無水物に戻る経路もある(高校範囲外)。"
        }
      ],
      detectionReactions: [
        {
          reagent: "NaHCO₃ 水溶液",
          result: "positive",
          observation: "CO₂ を発泡しながら溶解",
          significance: "遊離 COOH が残っていることを示す",
          commonlyUsed: true,
          detail: "ジメチル体(陰性)との判別ポイント。「片側だけエステル化された」ことの直接的証拠。"
        },
        {
          reagent: "FeCl₃ 水溶液",
          result: "negative",
          observation: "呈色しない",
          significance: "フェノール性 OH ではない(カルボン酸の OH のみ)",
          commonlyUsed: false,
          detail: "サリチル酸(フェノール性 OH＋COOH)との判別。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "イソフタル酸モノメチル(m-体)、テレフタル酸モノメチル(p-体)。同じ C₉H₈O₄ の位置異性体。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "o-位の COOH と COOCH₃ が空間的に近接した平面分子。分子内水素結合を形成しうる(COOH の OH と COOCH₃ の C=O のあいだ)。不斉炭素なし。"
    },

    // ── バッチ 11: アルカン ────────────────────────────────

    methane: {
      synthesisRoutes: [
        {
          id: "methane_acetate_decarboxylation",
          name: "酢酸ナトリウムの脱炭酸(ソーダ石灰加熱)",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "酢酸ナトリウム", formula: "CH₃COONa", molKey: null }],
            coReagents: [{ name: "水酸化ナトリウム", formula: "NaOH", molKey: "sodiumHydroxide" }],
            catalyst: "ソーダ石灰(CaO + NaOH)",
            conditions: "強熱(乾留)",
            products: [{ name: "メタン", formula: "CH₄", molKey: "methane" }],
            byProducts: [{ name: "炭酸ナトリウム", formula: "Na₂CO₃", molKey: "sodiumCarbonate" }]
          },
          shortNote: "酢酸ナトリウムをソーダ石灰とともに強熱して脱炭酸、メタンを発生させる。",
          detail: "CH₃COONa + NaOH → CH₄↑ + Na₂CO₃\n\n高校化学で最も有名なメタンの実験室製法。安息香酸ナトリウム→ベンゼンと並ぶ脱炭酸の典型。ソーダ石灰(CaO+NaOH の混合物)は NaOH の潮解を防ぎ、固体として扱える。工業ではなく実験室用途(少量発生)に限られる。",
          sources: ["Wikipedia: メタン", "高校化学 各社教科書"]
        },
        {
          id: "methane_aluminum_carbide_hydrolysis",
          name: "炭化アルミニウムの加水分解",
          type: "lab",
          famous: false,
          equation: {
            reactants: [{ name: "炭化アルミニウム", formula: "Al₄C₃", molKey: null }],
            coReagents: [{ name: "水", formula: "H₂O", molKey: "water" }],
            catalyst: "",
            conditions: "室温〜温和な加熱",
            products: [{ name: "メタン", formula: "CH₄", molKey: "methane" }],
            byProducts: [{ name: "水酸化アルミニウム", formula: "Al(OH)₃", molKey: null }]
          },
          shortNote: "炭化アルミニウムを水で加水分解し、メタンを発生させる。",
          detail: "Al₄C₃ + 12 H₂O → 4 Al(OH)₃ + 3 CH₄↑\n\n炭化カルシウム(CaC₂ → アセチレン)と対比される反応。Al₄C₃ は CH₄ を、CaC₂ は C₂H₂(アセチレン)を与える点で炭素のメタニド型 vs アセチリド型の違いを示す。工業的供給源としては天然ガス(メタン約 80〜95%)が圧倒的。",
          sources: ["Wikipedia: メタン", "Wikipedia: 炭化アルミニウム"]
        }
      ],
      downstream: [
        {
          name: "燃焼(クリーンな発熱、CO₂ + H₂O)",
          leadsTo: [],
          shortNote: "CH₄ + 2 O₂ → CO₂ + 2 H₂O。発熱量が大きく、家庭・工業の主要燃料。"
        },
        {
          name: "水蒸気改質による合成ガス・水素",
          leadsTo: [],
          shortNote: "高温の Ni 触媒下で水蒸気と反応し、CO + 3 H₂(合成ガス)を生成。アンモニア・メタノールの工業原料。"
        },
        {
          name: "塩素化によるハロゲン化メタン類",
          leadsTo: [],
          shortNote: "光照射下で Cl₂ と段階的にラジカル置換、CH₃Cl → CH₂Cl₂ → CHCl₃(クロロホルム)→ CCl₄ を順次生成。"
        }
      ],
      detectionReactions: [
        {
          reagent: "燃焼(点火)",
          result: "positive",
          observation: "青白色の炎で完全燃焼、CO₂ + H₂O を生成",
          significance: "アルカン(飽和炭化水素)の典型的挙動",
          commonlyUsed: true,
          detail: "燃焼後の気体を石灰水(Ca(OH)₂ 水)に通すと白濁(CaCO₃ 生成)するため、CO₂ の生成が確認できる。"
        },
        {
          reagent: "Br₂ 水・KMnO₄(冷・希)",
          result: "negative",
          observation: "いずれも脱色しない",
          significance: "C=C・C≡C 等の不飽和結合がないことを示す",
          commonlyUsed: true,
          detail: "アルカンは飽和炭化水素のため、室温では Br₂ 水・KMnO₄ と反応しない。アルケン・アルキンとの判別で頻出。"
        }
      ],
      isomersDetail: {
        structural: [],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "正四面体型(Td 対称性)の sp³ 分子。すべての C-H が等価。不斉炭素なし。最も小さい炭化水素で、立体異性は存在しない。"
    },

    ethane: {
      synthesisRoutes: [
        {
          id: "ethane_ethene_hydrogenation",
          name: "エチレンの水素化(接触還元)",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "エチレン", formula: "C₂H₄", molKey: "ethene" }],
            coReagents: [{ name: "水素", formula: "H₂", molKey: "hydrogen" }],
            catalyst: "Ni、Pt、または Pd",
            conditions: "室温〜温和な加熱、加圧",
            products: [{ name: "エタン", formula: "C₂H₆", molKey: "ethane" }],
            byProducts: []
          },
          shortNote: "エチレンを金属触媒下で水素化、二重結合を飽和してエタンを得る。",
          detail: "C₂H₄ + H₂ → C₂H₆(Ni 触媒)\n\nアルケン水素化の典型例。芳香環は還元されない選択性をもつ。工業的にはエタンの主供給源は天然ガス(メタンに次ぐ成分、〜10%)。油脂の硬化(不飽和脂肪酸の水素化)と同じ機構。",
          sources: ["Wikipedia: エタン", "Solomons Organic Chemistry §8"]
        }
      ],
      downstream: [
        {
          name: "脱水素によるエチレン(工業的)",
          leadsTo: ["ethene"],
          shortNote: "850 °C 程度の熱分解(クラッキング)でエタンを脱水素、エチレンを大量生産。"
        },
        {
          name: "塩素化によるクロロエタン",
          leadsTo: [],
          shortNote: "光照射下で Cl₂ とラジカル置換、エチル化反応の中間体クロロエタンを与える。"
        }
      ],
      detectionReactions: [
        {
          reagent: "燃焼(点火)",
          result: "positive",
          observation: "炎を上げて完全燃焼、CO₂ + H₂O を生成",
          significance: "アルカン特有",
          commonlyUsed: false,
          detail: "メタンよりやや明るい炎。空気との混合比で爆発的に燃焼する。"
        },
        {
          reagent: "Br₂ 水・KMnO₄",
          result: "negative",
          observation: "脱色しない",
          significance: "飽和(不飽和結合なし)",
          commonlyUsed: true,
          detail: "メタン同様、アルカン全般の判別反応。"
        }
      ],
      isomersDetail: {
        structural: [],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: [
          { name: "ねじれ型(staggered, anti)", stability: "最も安定な配座。両 CH₃ の H が互いに 60° ずれる。" },
          { name: "重なり型(eclipsed)", stability: "ねじれ型より約 12 kJ/mol 高エネルギーで不安定。両 CH₃ の H が同じ方向を向く。" }
        ]
      },
      stereochemistryDetail: "C-C 単結合まわりの回転は自由だが、回転に伴ってねじれ型(staggered, 安定)と重なり型(eclipsed, 不安定)の配座が交互に現れる。室温では大部分が安定なねじれ型をとる。最も単純な配座異性の例として大学初級有機化学で扱われる。不斉炭素なし。"
    },

    propane: {
      synthesisRoutes: [
        {
          id: "propane_petroleum",
          name: "天然ガス・石油からの分離(工業的)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "天然ガス／石油精製ガス", formula: "—", molKey: null }],
            coReagents: [],
            catalyst: "",
            conditions: "深冷分離・分留",
            products: [{ name: "プロパン", formula: "C₃H₈", molKey: "propane" }],
            byProducts: [{ name: "ブタン・エタンなど", formula: "—", molKey: null }]
          },
          shortNote: "天然ガスや石油精製ガスからの分留・深冷分離で得る。LPG(液化石油ガス)の主成分。",
          detail: "プロパンの実用的供給はほぼ全てが天然ガス・石油精製副産物から。\n\nブタンと混合した形で LPG(液化石油ガス)として販売される(家庭用ガス、自動車用 LPG 燃料)。常温で気体(bp −42 °C)だが、わずかな加圧で液化するため貯蔵・輸送が容易。",
          sources: ["Wikipedia: プロパン"]
        },
        {
          id: "propane_propene_hydrogenation",
          name: "プロペンの水素化",
          type: "lab",
          famous: false,
          equation: {
            reactants: [{ name: "プロペン", formula: "C₃H₆", molKey: "propene" }],
            coReagents: [{ name: "水素", formula: "H₂", molKey: "hydrogen" }],
            catalyst: "Ni、Pt、または Pd",
            conditions: "室温〜温和な加熱、加圧",
            products: [{ name: "プロパン", formula: "C₃H₈", molKey: "propane" }],
            byProducts: []
          },
          shortNote: "プロペンの C=C を金属触媒下で水素化、プロパンを得る。",
          detail: "CH₃-CH=CH₂ + H₂ → CH₃-CH₂-CH₃\n\nアルケン水素化の典型。実験室合成というよりはアルケン→アルカンの変換例として扱われる。",
          sources: ["Wikipedia: プロパン"]
        }
      ],
      downstream: [
        {
          name: "燃焼(LPG 燃料)",
          leadsTo: [],
          shortNote: "C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O。家庭用ガス・自動車用 LPG 燃料の主反応。"
        },
        {
          name: "脱水素によるプロペン(工業的)",
          leadsTo: ["propene"],
          shortNote: "Cr₂O₃/Al₂O₃ 触媒下で 600 °C 程度に加熱、プロペンを大量生産(PDH 法)。"
        }
      ],
      detectionReactions: [
        {
          reagent: "燃焼",
          result: "positive",
          observation: "明るい炎で完全燃焼、CO₂ + H₂O を生成",
          significance: "アルカン特有",
          commonlyUsed: false,
          detail: "LPG の燃焼。空気との混合比により青色〜黄色の炎となる。"
        },
        {
          reagent: "Br₂ 水・KMnO₄",
          result: "negative",
          observation: "脱色しない",
          significance: "飽和炭化水素",
          commonlyUsed: true,
          detail: "アルカンの典型的判別反応。"
        }
      ],
      isomersDetail: {
        structural: [],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "C₃H₈ は構造異性体をもたない(直鎖か分岐かの選択肢がない最も小さい鎖の長さ)。中央炭素も sp³ で対称的に CH₃ を 2 つもつため不斉ではない。"
    },

    butane: {
      synthesisRoutes: [
        {
          id: "butane_petroleum",
          name: "天然ガス・石油からの分離(工業的)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "天然ガス／石油精製ガス", formula: "—", molKey: null }],
            coReagents: [],
            catalyst: "",
            conditions: "深冷分離・分留",
            products: [{ name: "n-ブタン", formula: "C₄H₁₀", molKey: "butane" }],
            byProducts: [{ name: "プロパン・イソブタンなど", formula: "—", molKey: null }]
          },
          shortNote: "天然ガスや石油精製ガスからの分留で得る。LPG・ライターガスの主成分の一つ。",
          detail: "工業供給はほぼすべて天然ガス・石油精製副産物から。\n\nプロパンと混合した LPG として、また単独でライター用充填ガスとして利用される。bp −0.5 °C で常温常圧では気体だが、わずかな加圧で液化。イソブタン(沸点 −12 °C)と分別蒸留で分離する。",
          sources: ["Wikipedia: ブタン"]
        },
        {
          id: "butane_butene_hydrogenation",
          name: "ブテンの水素化",
          type: "lab",
          famous: false,
          equation: {
            reactants: [{ name: "1-ブテンまたは 2-ブテン", formula: "C₄H₈", molKey: null }],
            coReagents: [{ name: "水素", formula: "H₂", molKey: "hydrogen" }],
            catalyst: "Ni、Pt、または Pd",
            conditions: "室温〜温和な加熱、加圧",
            products: [{ name: "n-ブタン", formula: "C₄H₁₀", molKey: "butane" }],
            byProducts: []
          },
          shortNote: "1-ブテンまたは 2-ブテンの C=C を水素化して n-ブタンを得る。",
          detail: "C₄H₈ + H₂ → C₄H₁₀(Ni 触媒)\n\nアルケン水素化の典型。1-ブテン・2-ブテン(cis, trans)のいずれからも n-ブタンが得られる。",
          sources: ["Wikipedia: ブタン"]
        }
      ],
      downstream: [
        {
          name: "燃焼(LPG・ライター燃料)",
          leadsTo: [],
          shortNote: "2 C₄H₁₀ + 13 O₂ → 8 CO₂ + 10 H₂O。LPG・ライターの主反応。"
        },
        {
          name: "脱水素による 1,3-ブタジエン(工業的)",
          leadsTo: [],
          shortNote: "Cr/Al 系触媒下で 2 段階の脱水素、合成ゴム原料の 1,3-ブタジエンを生産。"
        },
        {
          name: "異性化によるイソブタン",
          leadsTo: ["isobutane"],
          shortNote: "AlCl₃ 触媒下で n-ブタン → イソブタンの異性化。アルキレート(高オクタンガソリン)製造の一段。"
        }
      ],
      detectionReactions: [
        {
          reagent: "燃焼",
          result: "positive",
          observation: "明るい炎で完全燃焼、CO₂ + H₂O を生成",
          significance: "アルカン特有",
          commonlyUsed: false,
          detail: "ライターの炎が典型例。"
        },
        {
          reagent: "Br₂ 水・KMnO₄",
          result: "negative",
          observation: "脱色しない",
          significance: "飽和炭化水素",
          commonlyUsed: true,
          detail: "アルカンの判別反応。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "isobutane", note: "イソブタン(2-メチルプロパン、(CH₃)₃CH)。同じ C₄H₁₀ の構造異性体(分岐型)。アルカンで初めて構造異性が現れる例(C4 から)。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: [
          { name: "anti(C-C-C-C 二面角 180°)", stability: "最安定配座。両端のメチル基が最も離れて立体反発が最小。" },
          { name: "gauche(同 60°)", stability: "anti より約 4 kJ/mol 高い準安定配座。" },
          { name: "eclipsed", stability: "重なり型は最も不安定(〜20 kJ/mol 高い)。" }
        ]
      },
      stereochemistryDetail: "C₄H₁₀ はアルカンで初めて構造異性体(n-ブタン vs イソブタン)が現れる化合物として教科書的に重要。中央 C-C 結合まわりの配座異性も古典的問題(anti/gauche/eclipsed)。不斉炭素はない。"
    },

    isobutane: {
      synthesisRoutes: [
        {
          id: "isobutane_petroleum",
          name: "天然ガス・石油からの分離(工業的)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "天然ガス／石油精製ガス", formula: "—", molKey: null }],
            coReagents: [],
            catalyst: "",
            conditions: "深冷分離・分留",
            products: [{ name: "イソブタン", formula: "C₄H₁₀", molKey: "isobutane" }],
            byProducts: [{ name: "n-ブタン", formula: "C₄H₁₀", molKey: "butane" }]
          },
          shortNote: "天然ガスや石油精製ガスからの分留で得る。沸点が n-体(−0.5 °C)より低い(−12 °C)ため分離可能。",
          detail: "工業的には石油精製の異性化プロセス(n-体 → iso 体)または天然由来のまま分留して取り出す。\n\nイソブタンはアルキレーション(イソブタン＋アルケン → 分岐アルカン)の重要原料で、高オクタン価ガソリン基剤の合成に使われる。イソブテン(メチルプロペン)への脱水素経由で MTBE 原料にもなる。",
          sources: ["Wikipedia: イソブタン"]
        },
        {
          id: "isobutane_isomerization",
          name: "n-ブタンの異性化",
          type: "industrial",
          famous: false,
          equation: {
            reactants: [{ name: "n-ブタン", formula: "C₄H₁₀", molKey: "butane" }],
            coReagents: [],
            catalyst: "AlCl₃ + HCl、Pt/ゼオライトなど",
            conditions: "150〜200 °C",
            products: [{ name: "イソブタン", formula: "C₄H₁₀", molKey: "isobutane" }],
            byProducts: []
          },
          shortNote: "AlCl₃ 等の酸触媒下で n-ブタンを骨格異性化、分岐型のイソブタンへ変換。",
          detail: "CH₃CH₂CH₂CH₃ → (CH₃)₃CH\n\nカチオン重合中間体を経る骨格異性化(C⁺ の 1,2-メチル移動)。アルキレーションの原料として需要が高いため、n-体から積極的に変換する工程。",
          sources: ["Wikipedia: イソブタン"]
        }
      ],
      downstream: [
        {
          name: "脱水素によるイソブテン(→ MTBE 原料)",
          leadsTo: [],
          shortNote: "Pt 触媒下で脱水素、(CH₃)₂C=CH₂ を生成。メタノールと反応させて MTBE(高オクタン価ガソリン添加剤)に。"
        },
        {
          name: "アルキレーション(高オクタン価ガソリン)",
          leadsTo: [],
          shortNote: "イソブテン等のアルケンと酸触媒下でカップリング、分岐型 C₈ アルカン(イソオクタン類縁体)を生成。"
        }
      ],
      detectionReactions: [
        {
          reagent: "Br₂ 水・KMnO₄",
          result: "negative",
          observation: "脱色しない",
          significance: "飽和炭化水素",
          commonlyUsed: true,
          detail: "アルカン全般の判別反応。"
        },
        {
          reagent: "沸点測定",
          result: "positive",
          observation: "bp −12 °C(n-ブタンの bp −0.5 °C より低い)",
          significance: "n-ブタンとの構造異性体判別",
          commonlyUsed: false,
          detail: "分岐型アルカンは直鎖型より沸点が低い(分子間ファンデルワールス力が小さい)という一般則の典型例。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "butane", note: "n-ブタン(直鎖型)。同じ C₄H₁₀ の構造異性体(直鎖 vs 分岐)。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "中央 C は CH₃ を 3 つもつため不斉ではない。" },
        conformers: []
      },
      stereochemistryDetail: "中央 sp³ 炭素に CH₃ × 3 と H × 1 が結合した T 字型の対称構造。中央 C は 3 つの同じ CH₃ を持つため不斉ではない。アルカンの構造異性の最初の例(n-ブタン)として教科書頻出。"
    },

    // ── バッチ 12: アルケン ────────────────────────────────

    ethene: {
      synthesisRoutes: [
        {
          id: "ethene_ethanol_dehydration",
          name: "エタノールの脱水",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "エタノール", formula: "C₂H₅OH", molKey: "ethanol" }],
            coReagents: [],
            catalyst: "濃硫酸",
            conditions: "約 160〜180 °C(温度を上げすぎないこと)",
            products: [{ name: "エチレン", formula: "C₂H₄", molKey: "ethene" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "エタノールを濃硫酸とともに 160〜180 °C で加熱、分子内脱水でエチレンを発生させる。",
          detail: "C₂H₅OH → C₂H₄ + H₂O(濃硫酸触媒、160〜180 °C)\n\n温度依存で生成物が分かれる重要反応:\n  160〜180 °C: 分子内脱水でエチレン\n  130〜140 °C: 分子間脱水でジエチルエーテル(2 C₂H₅OH → C₂H₅OC₂H₅ + H₂O)\n\n副反応として H₂SO₄ による炭化(黒変)が起こりやすいので温度管理が重要。高校化学のアルケン合成で最も有名な反応。",
          sources: ["Wikipedia: エチレン", "高校化学 各社教科書"]
        },
        {
          id: "ethene_naphtha_cracking",
          name: "ナフサクラッキング(工業的)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "ナフサ(石油留分)", formula: "—", molKey: null }],
            coReagents: [{ name: "水蒸気(希釈)", formula: "H₂O", molKey: "water" }],
            catalyst: "(無触媒の熱分解)",
            conditions: "800〜850 °C、水蒸気希釈、滞留時間ミリ秒オーダー",
            products: [{ name: "エチレン", formula: "C₂H₄", molKey: "ethene" }],
            byProducts: [
              { name: "プロペン・1,3-ブタジエン・芳香族 BTX", formula: "—", molKey: null },
              { name: "水素・メタン", formula: "—", molKey: null }
            ]
          },
          shortNote: "ナフサを水蒸気で希釈して高温熱分解、エチレン・プロペン・ブタジエン等を併産。",
          detail: "現代の石油化学工業で最も基幹的なプロセス。世界のエチレン生産のほぼ全量がこの経路。\n\n急速加熱・急速冷却で熱力学平衡より動力学的選択性を稼ぐ。エチレン需要は他の石化原料を大きく上回り、国の化学工業規模はしばしば「エチレン生産能力」で測られる。",
          sources: ["Wikipedia: エチレン", "Wikipedia: スチームクラッキング"]
        }
      ],
      downstream: [
        {
          name: "付加重合によるポリエチレン",
          leadsTo: ["polyethylene"],
          shortNote: "高圧ラジカル重合(LDPE)または Ziegler–Natta／メタロセン触媒(HDPE/LLDPE)でポリエチレンを生成。"
        },
        {
          name: "塩化水素付加→ポリ塩化ビニル経由",
          leadsTo: ["polyvinylChloride"],
          shortNote: "Cl₂ 付加 → 1,2-ジクロロエタン → 熱分解で塩化ビニル → 重合でポリ塩化ビニル。"
        },
        {
          name: "水和によるエタノール(工業的)",
          leadsTo: ["ethanol"],
          shortNote: "リン酸触媒下で水和、エタノールを工業的に生産する経路(発酵法と並ぶ製法)。"
        },
        {
          name: "エチレングリコール(→ PET 原料)",
          leadsTo: ["ethyleneGlycol", "pet"],
          shortNote: "酸化でエチレンオキシド→水和でエチレングリコール。テレフタル酸とともに PET の主原料。"
        }
      ],
      detectionReactions: [
        {
          reagent: "Br₂ 水",
          result: "positive",
          observation: "褐色が即座に脱色",
          significance: "C=C 二重結合の存在を示す",
          commonlyUsed: true,
          detail: "CH₂=CH₂ + Br₂ → CH₂BrCH₂Br(1,2-ジブロモエタン)。\n\n不飽和炭化水素検出の最も標準的な反応。アルカンとの判別の基本。"
        },
        {
          reagent: "KMnO₄(冷・希)",
          result: "positive",
          observation: "赤紫色が脱色(MnO₂ の褐色生成)",
          significance: "酸化されやすい C=C の存在を示す",
          commonlyUsed: true,
          detail: "3 CH₂=CH₂ + 2 KMnO₄ + 4 H₂O → 3 HOCH₂CH₂OH + 2 MnO₂ + 2 KOH(Baeyer 試験)。\n\nC=C をジオール(エチレングリコール)に変換する穏やかな酸化。アルケン特有。"
        },
        {
          reagent: "燃焼",
          result: "positive",
          observation: "多量のすす(黒煙)を伴う燃焼",
          significance: "炭素含有率の高い不飽和化合物特有",
          commonlyUsed: false,
          detail: "アルカンより炭素比率が高いため、不完全燃焼でわずかにすすが出る(ただしエチレン自体は比較的清浄に燃える)。"
        }
      ],
      isomersDetail: {
        structural: [],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "完全に平面な分子(C=C が sp² のため)。両端 CH₂ の H は同じ環境で等価。シス・トランス異性は両端が同じ CH₂ のため成立しない。不斉炭素なし。"
    },

    propene: {
      synthesisRoutes: [
        {
          id: "propene_propanol_dehydration",
          name: "2-プロパノールの脱水",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "2-プロパノール", formula: "(CH₃)₂CHOH", molKey: "propanol2" }],
            coReagents: [],
            catalyst: "濃硫酸またはリン酸",
            conditions: "約 170〜180 °C",
            products: [{ name: "プロペン", formula: "C₃H₆", molKey: "propene" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "2-プロパノール(または 1-プロパノール)の脱水でプロペンを得る。",
          detail: "(CH₃)₂CHOH → CH₃-CH=CH₂ + H₂O\n\n2-プロパノールからは唯一プロペンが得られる。1-プロパノールでも同じプロペンが得られる(脱水の Saytzeff 則 / Hofmann 則は C3 では区別不要)。エタノール脱水と同様、温度・触媒選択が重要。",
          sources: ["Wikipedia: プロペン", "高校化学 各社教科書"]
        },
        {
          id: "propene_propane_dehydrogenation",
          name: "プロパンの脱水素(工業的、PDH 法)",
          type: "industrial",
          famous: false,
          equation: {
            reactants: [{ name: "プロパン", formula: "C₃H₈", molKey: "propane" }],
            coReagents: [],
            catalyst: "Cr₂O₃/Al₂O₃ または Pt 系触媒",
            conditions: "約 600 °C",
            products: [{ name: "プロペン", formula: "C₃H₆", molKey: "propene" }],
            byProducts: [{ name: "水素", formula: "H₂", molKey: "hydrogen" }]
          },
          shortNote: "プロパンを高温で脱水素してプロペンを得る、近年急成長の工業プロセス。",
          detail: "C₃H₈ → C₃H₆ + H₂\n\nシェールガス由来のプロパン余剰により急速に普及した経路(Propane Dehydrogenation, PDH)。従来はナフサクラッキングの副産物として供給されていたが、PDH によりプロペン専用生産が可能に。",
          sources: ["Wikipedia: プロペン"]
        }
      ],
      downstream: [
        {
          name: "付加重合によるポリプロピレン",
          leadsTo: ["polypropylene"],
          shortNote: "Ziegler–Natta／メタロセン触媒で立体規則的に重合、結晶性のポリプロピレンを生成。"
        },
        {
          name: "ベンゼン＋プロペン → クメン → クメン法",
          leadsTo: ["cumene", "cumeneHydroperoxide", "phenol", "acetone"],
          shortNote: "ベンゼンとの Friedel–Crafts でクメン、空気酸化＋酸転位でフェノール+アセトンを併産。"
        },
        {
          name: "Markovnikov 水和による 2-プロパノール",
          leadsTo: ["propanol2"],
          shortNote: "希硫酸触媒下で水和、Markovnikov 則に従い 2-プロパノール(イソプロパノール)を生成。"
        },
        {
          name: "プロピレンオキシド・アクリロニトリルへ",
          leadsTo: [],
          shortNote: "酸化でプロピレンオキシド、アンモ酸化でアクリロニトリル。前者はポリウレタン、後者は ABS・アクリル繊維原料。"
        }
      ],
      detectionReactions: [
        {
          reagent: "Br₂ 水",
          result: "positive",
          observation: "褐色が即座に脱色",
          significance: "C=C 二重結合の存在",
          commonlyUsed: true,
          detail: "1,2-ジブロモプロパンが生成。"
        },
        {
          reagent: "KMnO₄(冷・希)",
          result: "positive",
          observation: "赤紫色が脱色",
          significance: "C=C の存在",
          commonlyUsed: true,
          detail: "1,2-プロパンジオールが生成(Baeyer 試験)。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "シクロプロパン(C₃H₆ の環状異性体)。同じ分子式の構造異性体。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "末端ビニル基(CH=CH₂)であるため C=C にシス・トランス異性は存在しない。中央 C も sp² で不斉ではない。同じ分子式(C₃H₆)のシクロプロパンが構造異性体として存在。"
    },

    butene1: {
      synthesisRoutes: [
        {
          id: "butene1_butanol1_dehydration",
          name: "1-ブタノールの脱水",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "1-ブタノール", formula: "CH₃CH₂CH₂CH₂OH", molKey: "butanol1" }],
            coReagents: [],
            catalyst: "濃硫酸またはリン酸",
            conditions: "約 170〜180 °C",
            products: [{ name: "1-ブテン", formula: "CH₃CH₂CH=CH₂", molKey: "butene1" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "1-ブタノールを濃硫酸とともに加熱して分子内脱水。1-ブテンが主に得られるが、2-ブテンへの異性化が起きやすい。",
          detail: "CH₃CH₂CH₂CH₂OH → CH₃CH₂CH=CH₂ + H₂O\n\nE1 機構を経由するため、生成したカルボカチオン中間体から 2-ブテン(より置換度の高いアルケン)への異性化が起こりやすい点に注意。厳密な制御下なら 1-ブテンが主成分となるが、平衡では 2-ブテン優位。工業的にはナフサクラッキングや 2-ブテンの異性化で得る。",
          sources: ["Wikipedia: 1-ブテン", "高校化学 各社教科書"]
        }
      ],
      downstream: [
        {
          name: "Markovnikov 水和による 2-ブタノール",
          leadsTo: ["butanol2"],
          shortNote: "希硫酸触媒下で水和、Markovnikov 則に従い内側の C に OH が付き 2-ブタノールが主生成物。"
        },
        {
          name: "重合によるポリブテン",
          leadsTo: [],
          shortNote: "Ziegler 触媒等で重合、潤滑油・粘着剤の原料となるポリブテンを生成。"
        },
        {
          name: "2-ブテンへの異性化(酸触媒)",
          leadsTo: ["butene2"],
          shortNote: "酸触媒下で C=C が移動し、より置換度の高い 2-ブテンへ異性化(熱力学的安定)。"
        }
      ],
      detectionReactions: [
        {
          reagent: "Br₂ 水",
          result: "positive",
          observation: "褐色が即座に脱色",
          significance: "C=C 二重結合",
          commonlyUsed: true,
          detail: "1,2-ジブロモブタンが生成。"
        },
        {
          reagent: "KMnO₄(冷・希)",
          result: "positive",
          observation: "赤紫色が脱色",
          significance: "C=C の存在",
          commonlyUsed: true,
          detail: "1,2-ブタンジオールが生成(Baeyer 試験)。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "butene2", note: "2-ブテン(C=C が内側)。同じ C₄H₈ の位置異性体。" },
          { molKey: null, note: "イソブテン(2-メチルプロペン、(CH₃)₂C=CH₂)。同じ C₄H₈ の構造異性体(分岐型)。" },
          { molKey: null, note: "シクロブタン、メチルシクロプロパン。同じ C₄H₈ の環状異性体。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "末端 C=C(CH=CH₂)であるため、シス・トランス異性は存在しない。同じ分子式 C₄H₈ には、位置異性体 2-ブテン(cis/trans あり)、構造異性体イソブテン、環状異性体シクロブタン・メチルシクロプロパンが存在し、異性体の数の例として教科書頻出。"
    },

    butene2: {
      synthesisRoutes: [
        {
          id: "butene2_butanol2_dehydration",
          name: "2-ブタノールの脱水",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "2-ブタノール", formula: "CH₃CH(OH)CH₂CH₃", molKey: "butanol2" }],
            coReagents: [],
            catalyst: "濃硫酸またはリン酸",
            conditions: "約 170〜180 °C",
            products: [{ name: "2-ブテン(cis + trans 混合)", formula: "CH₃CH=CHCH₃", molKey: "butene2" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "2-ブタノールの分子内脱水。Saytzeff 則により内側の C=C をもつ 2-ブテンが主生成物。",
          detail: "CH₃CH(OH)CH₂CH₃ → CH₃CH=CHCH₃ + H₂O\n\nSaytzeff(ザイツェフ)則: アルコールの脱水ではより置換度の高い(より内側の)アルケンが優先する。2-ブタノールからは 2-ブテンが主、1-ブテンは副生成物。生成した 2-ブテンは cis 体と trans 体の混合となり、熱力学的に安定な trans 体がやや多い。",
          sources: ["Wikipedia: 2-ブテン", "Solomons Organic Chemistry §7"]
        }
      ],
      downstream: [
        {
          name: "Markovnikov 水和による 2-ブタノール再生",
          leadsTo: ["butanol2"],
          shortNote: "希硫酸触媒下で水和、対称性により Markovnikov 則の影響なく 2-ブタノールに戻る。"
        },
        {
          name: "Br₂ 付加による 2,3-ジブロモブタン",
          leadsTo: [],
          shortNote: "シス体・トランス体で生成物の立体が異なる(シス体→meso、トランス体→ラセミ)立体特異的反応の好例。"
        }
      ],
      detectionReactions: [
        {
          reagent: "Br₂ 水",
          result: "positive",
          observation: "褐色が即座に脱色",
          significance: "C=C 二重結合の存在",
          commonlyUsed: true,
          detail: "anti 付加で 2,3-ジブロモブタンを生成。出発物の cis/trans により生成物の立体(meso vs ラセミ)が変わる。"
        },
        {
          reagent: "KMnO₄(冷・希)",
          result: "positive",
          observation: "赤紫色が脱色",
          significance: "C=C の存在",
          commonlyUsed: true,
          detail: "syn 付加で 2,3-ブタンジオールを生成。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "butene1", note: "1-ブテン(末端 C=C)。同じ C₄H₈ の位置異性体。" },
          { molKey: null, note: "イソブテン(2-メチルプロペン)。同じ C₄H₈ の構造異性体(分岐型)。" }
        ],
        geometric: [
          { type: "cis-trans(Z/E)", note: "cis-2-ブテン(Z 体、bp 4 °C、CH₃ が同じ側)と trans-2-ブテン(E 体、bp 1 °C、CH₃ が反対側)の 2 種。高校化学のシス・トランス異性体の代表例として最も有名。" }
        ],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "シス・トランス異性体(cis/trans = Z/E)が存在する代表例。\n\ncis-2-ブテン(Z 体): 2 つの CH₃ が C=C の同じ側、bp 4 °C、mp −139 °C\ntrans-2-ブテン(E 体): 2 つの CH₃ が反対側、bp 1 °C、mp −106 °C(より対称的でパッキング良好)\n\n両者は別々の物質として単離可能で、互変異性化には光や触媒が必要。高校化学で最初に学ぶ立体異性として教科書頻出。"
    },

    // ── バッチ 7: 芳香族カルボニル① (遅れて追記) ──────────

    benzoicAcid: {
      synthesisRoutes: [
        {
          id: "benzoic_toluene_kmno4",
          name: "トルエンの KMnO₄ 酸化",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "トルエン", formula: "C₆H₅CH₃", molKey: "toluene" }],
            coReagents: [{ name: "過マンガン酸カリウム", formula: "KMnO₄", molKey: null }],
            catalyst: "",
            conditions: "硫酸酸性または中性、加熱(還流)",
            products: [{ name: "安息香酸", formula: "C₆H₅COOH", molKey: "benzoicAcid" }],
            byProducts: [
              { name: "二酸化マンガン", formula: "MnO₂", molKey: null },
              { name: "水", formula: "H₂O", molKey: "water" }
            ]
          },
          shortNote: "トルエンの側鎖メチル基を熱濃 KMnO₄ で完全酸化、カルボン酸まで進める。",
          detail: "C₆H₅CH₃ + 2 [O] → C₆H₅COOH + H₂O(KMnO₄ 加熱)\n\nベンジル位の C-H が連続的に酸化され、最終的にカルボキシル基まで進む。メチル基以外のアルキル基(エチル、イソプロピルなど)でも、ベンジル位 H があれば側鎖がすべて切断され安息香酸となる点が高校化学の頻出ポイント。t-ブチルベンゼン(ベンジル位 H なし)は同条件で酸化されない。",
          sources: ["Wikipedia: 安息香酸", "高校化学 各社教科書"]
        },
        {
          id: "benzoic_toluene_air_oxidation",
          name: "トルエンの空気酸化(工業的)",
          type: "industrial",
          famous: false,
          equation: {
            reactants: [{ name: "トルエン", formula: "C₆H₅CH₃", molKey: "toluene" }],
            coReagents: [{ name: "酸素", formula: "O₂", molKey: "oxygen" }],
            catalyst: "ナフテン酸コバルト・マンガン塩",
            conditions: "液相、150〜170 °C、加圧",
            products: [{ name: "安息香酸", formula: "C₆H₅COOH", molKey: "benzoicAcid" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "コバルト・マンガン塩触媒下でトルエンを空気酸化。世界の安息香酸生産の主流。",
          detail: "C₆H₅CH₃ + 3/2 O₂ → C₆H₅COOH + H₂O\n\nベンジル位 C-H のラジカル自動酸化を金属塩が促進する。カプロラクタムやフェノールの中間体としても利用される。食品保存料(安息香酸ナトリウム)の主原料。",
          sources: ["Wikipedia: 安息香酸"]
        }
      ],
      downstream: [
        {
          name: "メタノールとのエステル化による安息香酸メチル",
          leadsTo: ["methylBenzoate"],
          shortNote: "濃硫酸触媒下でメタノールとフィッシャーエステル化、安息香酸メチルを得る。"
        },
        {
          name: "アンモニアとの反応によるベンズアミド",
          leadsTo: ["benzamide"],
          shortNote: "塩化ベンゾイル経由(または高温脱水)でアンモニアと反応し、ベンズアミドを得る。"
        },
        {
          name: "中和による安息香酸ナトリウム(食品保存料)",
          leadsTo: [],
          shortNote: "NaOH または NaHCO₃ で中和し、水溶性の安息香酸ナトリウムを得る。清涼飲料水の防腐剤。"
        }
      ],
      detectionReactions: [
        {
          reagent: "NaHCO₃ 水溶液",
          result: "positive",
          observation: "CO₂ を発泡しながら溶解",
          significance: "カルボン酸であることを示す(pKa ≈ 4.2)",
          commonlyUsed: true,
          detail: "カルボン酸検出の標準反応。フェノール(陰性)との判別で頻出。"
        },
        {
          reagent: "FeCl₃ 水溶液",
          result: "negative",
          observation: "紫色には呈色しない(薄橙色程度)",
          significance: "フェノール性 OH ではないことを示す",
          commonlyUsed: true,
          detail: "サリチル酸(フェノール性 OH をもち FeCl₃ で紫呈色)との判別ポイント。安息香酸は OH をもたないため紫呈色を与えない。"
        },
        {
          reagent: "視認",
          result: "positive",
          observation: "白色針状結晶(mp 122 °C)、加熱で容易に昇華",
          significance: "安息香酸特有",
          commonlyUsed: false,
          detail: "水に難溶(冷水)、熱水に可溶。再結晶で精製しやすい。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "ヒドロキシ安息香酸(サリチル酸など)は OH を加えた異なる分子(C₇H₆O₃)。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "ベンゼン環＋カルボキシル基の平面分子。固体中ではカルボン酸特有の二量体(環状水素結合)を形成する。不斉炭素なし。"
    },

    methylBenzoate: {
      synthesisRoutes: [
        {
          id: "methylBenzoate_esterification",
          name: "安息香酸とメタノールのエステル化(Fischer エステル化)",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "安息香酸", formula: "C₆H₅COOH", molKey: "benzoicAcid" }],
            coReagents: [{ name: "メタノール", formula: "CH₃OH", molKey: "methanol" }],
            catalyst: "濃硫酸",
            conditions: "加熱還流",
            products: [{ name: "安息香酸メチル", formula: "C₆H₅COOCH₃", molKey: "methylBenzoate" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "安息香酸のカルボキシル基をメタノールでエステル化、特徴的な甘い香りのエステルを得る。",
          detail: "C₆H₅COOH + CH₃OH ⇌ C₆H₅COOCH₃ + H₂O(濃硫酸触媒、加熱)\n\n典型的な Fischer エステル化。可逆反応のため、メタノールを過剰に使うか水を除去して平衡を生成側に寄せる。生成物は無色透明の液体(mp −12 °C、bp 199 °C)で、果実様の甘い香り。香料の構成成分として知られる。",
          sources: ["Wikipedia: 安息香酸メチル", "高校化学 各社教科書"]
        }
      ],
      downstream: [
        {
          name: "加水分解による安息香酸再生",
          leadsTo: ["benzoicAcid", "methanol"],
          shortNote: "酸または塩基触媒の加水分解で安息香酸とメタノールに戻る。"
        }
      ],
      detectionReactions: [
        {
          reagent: "NaHCO₃ 水溶液",
          result: "negative",
          observation: "CO₂ を発生しない",
          significance: "カルボン酸ではない(エステル化されている)ことを示す",
          commonlyUsed: true,
          detail: "安息香酸(陽性)とのエステル化反応の進行確認に使う。"
        },
        {
          reagent: "嗅覚(特徴的な香り)",
          result: "positive",
          observation: "果実様の甘い香り",
          significance: "エステル特有の香り",
          commonlyUsed: false,
          detail: "化学検出ではないが、エステル化反応の確認として教科書実験で言及される。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "p-/m-/o-トルアルデヒド(CH₃-C₆H₄-CHO)は同じ C₈H₈O だが分子式が異なる(O の数)。" },
          { molKey: null, note: "C₈H₈O₂ の異性体は限定的(芳香族系では他に例少)。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "ベンゼン環＋エステル基の概ね平面分子。不斉炭素なし。室温で液体。"
    },

    benzamide: {
      synthesisRoutes: [
        {
          id: "benzamide_benzoyl_chloride_nh3",
          name: "塩化ベンゾイルとアンモニアの反応",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "塩化ベンゾイル", formula: "C₆H₅COCl", molKey: "benzoylChloride" }],
            coReagents: [{ name: "アンモニア", formula: "NH₃", molKey: "ammonia" }],
            catalyst: "",
            conditions: "氷冷下、過剰のアンモニア水を加える",
            products: [{ name: "ベンズアミド", formula: "C₆H₅CONH₂", molKey: "benzamide" }],
            byProducts: [{ name: "塩化アンモニウム", formula: "NH₄Cl", molKey: null }]
          },
          shortNote: "塩化ベンゾイル(酸塩化物)にアンモニアを作用させてベンズアミドを得る。",
          detail: "C₆H₅COCl + 2 NH₃ → C₆H₅CONH₂ + NH₄Cl\n\n酸塩化物は反応性が高く、アンモニアと室温で容易に反応する(発熱)。アミド合成の標準的手法。安息香酸の塩化チオニル(SOCl₂)処理で塩化ベンゾイルを作り、続けてアンモニアと反応させる 2 段法が一般的。安息香酸 + NH₃ を直接高温脱水しても得られるが、収率は劣る。",
          sources: ["Wikipedia: ベンズアミド", "Solomons Organic Chemistry §17"]
        },
        {
          id: "benzamide_benzonitrile_hydrolysis",
          name: "ベンゾニトリルの部分加水分解",
          type: "lab",
          famous: false,
          equation: {
            reactants: [{ name: "ベンゾニトリル", formula: "C₆H₅CN", molKey: "benzonitrile" }],
            coReagents: [{ name: "水", formula: "H₂O", molKey: "water" }],
            catalyst: "希酸または希塩基(H₂O₂/NaOH 系が温和)",
            conditions: "加熱、温和な条件で停止(過剰加水分解は安息香酸まで進む)",
            products: [{ name: "ベンズアミド", formula: "C₆H₅CONH₂", molKey: "benzamide" }],
            byProducts: []
          },
          shortNote: "ベンゾニトリル(C-N 三重結合)に水を 1 分子付加、アミドで反応を止める。",
          detail: "C₆H₅CN + H₂O → C₆H₅CONH₂\n\nニトリル → アミド → カルボン酸 の段階加水分解の中間で停止する反応。完全加水分解で安息香酸 + NH₃ になる。過酸化水素＋アルカリで温和に行うとアミド止まりにしやすい。",
          sources: ["Wikipedia: ベンズアミド"]
        }
      ],
      downstream: [
        {
          name: "加水分解による安息香酸",
          leadsTo: ["benzoicAcid"],
          shortNote: "希酸または希塩基で長時間加熱、アミド結合を加水分解して安息香酸とアンモニアに戻る。"
        },
        {
          name: "脱水によるベンゾニトリル",
          leadsTo: [],
          shortNote: "P₂O₅ や SOCl₂ 等の脱水剤と加熱、CONH₂ を CN に変換しベンゾニトリルを得る。"
        }
      ],
      detectionReactions: [
        {
          reagent: "視認",
          result: "positive",
          observation: "白色結晶(mp 130 °C)",
          significance: "ベンズアミド特有",
          commonlyUsed: false,
          detail: "水に難溶、熱水・エタノールに可溶。"
        },
        {
          reagent: "塩酸(希)",
          result: "negative",
          observation: "溶けない",
          significance: "アミドはアミンと違いほぼ中性(極めて弱塩基性)",
          commonlyUsed: false,
          detail: "アニリン(陽性)との対比。N の孤立電子対が C=O に非局在化するためプロトン化されにくい。"
        },
        {
          reagent: "NaOH 水溶液(加熱)",
          result: "positive",
          observation: "アンモニア臭(NH₃ ガス)が発生、安息香酸ナトリウムが生成",
          significance: "アミド結合の加水分解を示す",
          commonlyUsed: true,
          detail: "C₆H₅CONH₂ + NaOH → C₆H₅COONa + NH₃↑\n\nアミドの典型的検出反応。発生した NH₃ を湿った赤色リトマス紙の青変で確認できる。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "N-メチルベンズアミド類縁の異性体(H 数で分子式が異なる)。同じ C₇H₇NO の構造異性体は限定的。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "アミド結合(C(=O)-N)は部分的二重結合性をもつためほぼ平面で、回転障壁が高い(〜80 kJ/mol)。シス・トランス異性は形式的にあり得るが、トランス型が圧倒的に安定で、観測上は単一構造。不斉炭素なし。"
    },

    benzylAlcohol: {
      synthesisRoutes: [
        {
          id: "benzylAlcohol_benzaldehyde_reduction",
          name: "ベンズアルデヒドの還元",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "ベンズアルデヒド", formula: "C₆H₅CHO", molKey: "benzaldehyde" }],
            coReagents: [{ name: "還元剤(NaBH₄、LiAlH₄、H₂/Ni など)", formula: "—", molKey: null }],
            catalyst: "",
            conditions: "NaBH₄ ならエタノール中・室温／H₂/Ni なら加圧加熱",
            products: [{ name: "ベンジルアルコール", formula: "C₆H₅CH₂OH", molKey: "benzylAlcohol" }],
            byProducts: []
          },
          shortNote: "ベンズアルデヒドの C=O を還元して 1 級アルコールを得る、最も標準的な経路。",
          detail: "C₆H₅CHO + 2 [H] → C₆H₅CH₂OH\n\nNaBH₄ は穏やか・選択的な還元剤で、芳香環は還元せずカルボニルだけを還元する。LiAlH₄ は強力でカルボン酸・エステルまで還元可能。工業的には触媒水素化(H₂/Ni)を用いる。",
          sources: ["Wikipedia: ベンジルアルコール", "Solomons Organic Chemistry §12"]
        },
        {
          id: "benzylAlcohol_benzylChloride_hydrolysis",
          name: "塩化ベンジルの加水分解",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "塩化ベンジル", formula: "C₆H₅CH₂Cl", molKey: "benzylChloride" }],
            coReagents: [{ name: "水酸化ナトリウム水溶液", formula: "NaOH", molKey: "sodiumHydroxide" }],
            catalyst: "",
            conditions: "水中、加熱還流",
            products: [{ name: "ベンジルアルコール", formula: "C₆H₅CH₂OH", molKey: "benzylAlcohol" }],
            byProducts: [{ name: "塩化ナトリウム", formula: "NaCl", molKey: "sodiumChloride" }]
          },
          shortNote: "光照射下でトルエンを Cl₂ と反応させて塩化ベンジルを作り、加水分解でベンジルアルコールへ。",
          detail: "C₆H₅CH₂Cl + NaOH → C₆H₅CH₂OH + NaCl\n\n上流の経路: トルエン + Cl₂(光照射、無触媒)→ 塩化ベンジル → 加水分解。ベンジル位カチオンが安定なため加水分解は容易(SN1 的進行)。「トルエン → ベンジルアルコール → ベンズアルデヒド → 安息香酸」の酸化段階を制御する経路の入口として高校化学で扱われる。",
          sources: ["Wikipedia: ベンジルアルコール", "高校化学 各社教科書"]
        }
      ],
      downstream: [
        {
          name: "酸化によるベンズアルデヒド・安息香酸",
          leadsTo: ["benzaldehyde", "benzoicAcid"],
          shortNote: "PCC・MnO₂ 等で穏やかに酸化するとベンズアルデヒド、KMnO₄ 等で完全酸化すると安息香酸。"
        },
        {
          name: "酢酸とのエステル化による酢酸ベンジル",
          leadsTo: ["benzylAcetate"],
          shortNote: "酢酸との Fischer エステル化、果実様の香りをもつ酢酸ベンジルを与える。"
        }
      ],
      detectionReactions: [
        {
          reagent: "Na(金属ナトリウム)",
          result: "positive",
          observation: "H₂ を発生",
          significance: "活性水素(脂肪族 OH)の存在",
          commonlyUsed: true,
          detail: "2 C₆H₅CH₂OH + 2 Na → 2 C₆H₅CH₂ONa + H₂↑。アルコールの活性 H 検出の基本反応。"
        },
        {
          reagent: "FeCl₃ 水溶液",
          result: "negative",
          observation: "呈色しない",
          significance: "フェノール性 OH ではない(脂肪族 OH)",
          commonlyUsed: true,
          detail: "クレゾール(C₇H₈O、FeCl₃ 陽性)との判別で頻出。同じ分子式でもベンジルアルコールはフェノール性ではないため呈色しない。"
        },
        {
          reagent: "NaHCO₃ 水溶液",
          result: "negative",
          observation: "CO₂ を発生しない",
          significance: "酸性ではない",
          commonlyUsed: false,
          detail: "脂肪族アルコールなのでカルボン酸ともフェノールとも違う。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "anisole", note: "アニソール(C₆H₅OCH₃)。同じ C₇H₈O の構造異性体(メチルエーテル)。" },
          { molKey: "cresol", note: "クレゾール(CH₃-C₆H₄-OH、3 つの位置異性体)。同じ C₇H₈O のフェノール性異性体。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "C₆H₅-CH₂-OH の典型的な 1 級アルコール。CH₂ はベンゼン環平面に対して回転自由。不斉炭素なし。"
    },

    benzaldehyde: {
      synthesisRoutes: [
        {
          id: "benzaldehyde_benzalChloride_hydrolysis",
          name: "ベンザルクロリド(塩化ベンザル)の加水分解",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "ベンザルクロリド", formula: "C₆H₅CHCl₂", molKey: null }],
            coReagents: [{ name: "水", formula: "H₂O", molKey: "water" }],
            catalyst: "炭酸ナトリウムまたは石灰乳(弱塩基)",
            conditions: "加熱、弱塩基性",
            products: [{ name: "ベンズアルデヒド", formula: "C₆H₅CHO", molKey: "benzaldehyde" }],
            byProducts: [{ name: "塩化水素", formula: "HCl", molKey: "hydrogenChloride" }]
          },
          shortNote: "光照射下でトルエンを Cl₂ と段階的に反応させてベンザルクロリドを作り、加水分解。",
          detail: "C₆H₅CHCl₂ + H₂O → C₆H₅CHO + 2 HCl\n\n上流: C₆H₅CH₃ + 2 Cl₂(光照射、無触媒)→ C₆H₅CHCl₂(ベンジル位の H が 2 つ Cl に置換)。gem-ジクロリドの加水分解は不安定なジオール(CH(OH)₂)を経て自発的に脱水、アルデヒドを与える。トルエンからの工業的ベンズアルデヒド合成経路の一つ。",
          sources: ["Wikipedia: ベンズアルデヒド"]
        },
        {
          id: "benzaldehyde_toluene_partial_oxidation",
          name: "トルエンの部分酸化",
          type: "industrial",
          famous: false,
          equation: {
            reactants: [{ name: "トルエン", formula: "C₆H₅CH₃", molKey: "toluene" }],
            coReagents: [{ name: "酸素", formula: "O₂", molKey: "oxygen" }],
            catalyst: "MnO₂、CrO₂Cl₂、または金属塩触媒(コバルト系)",
            conditions: "穏やかな酸化条件、温度・時間で過酸化を抑制",
            products: [{ name: "ベンズアルデヒド", formula: "C₆H₅CHO", molKey: "benzaldehyde" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "トルエンを穏やかに酸化してアルデヒドで止める部分酸化法。安息香酸まで進めない条件選択が鍵。",
          detail: "C₆H₅CH₃ + [O] → C₆H₅CHO + H₂O\n\nKMnO₄ のような強い酸化剤を用いると安息香酸まで一気に進むため、選択的酸化は条件設定が重要。工業的には CrO₂Cl₂(Étard 反応)や Mn 系触媒の空気酸化が用いられる。",
          sources: ["Wikipedia: ベンズアルデヒド"]
        }
      ],
      downstream: [
        {
          name: "酸化による安息香酸",
          leadsTo: ["benzoicAcid"],
          shortNote: "空気酸化や KMnO₄・Tollens 反応により容易に安息香酸まで酸化される。"
        },
        {
          name: "還元によるベンジルアルコール",
          leadsTo: ["benzylAlcohol"],
          shortNote: "NaBH₄ や H₂/Ni でカルボニルを還元、ベンジルアルコールへ。"
        },
        {
          name: "Cannizzaro 反応(不均化)",
          leadsTo: ["benzylAlcohol", "benzoicAcid"],
          shortNote: "α-H を持たないため、濃 NaOH 中で 2 分子が不均化しベンジルアルコール＋安息香酸ナトリウムを与える。"
        }
      ],
      detectionReactions: [
        {
          reagent: "Tollens 試薬(アンモニア性 AgNO₃)",
          result: "positive",
          observation: "銀鏡反応(容器内壁に銀が析出)",
          significance: "アルデヒド基の存在を示す",
          commonlyUsed: true,
          detail: "C₆H₅CHO + 2 Ag(NH₃)₂OH → C₆H₅COONH₄ + 2 Ag↓ + 3 NH₃ + H₂O\n\nアルデヒド全般が陽性となる。芳香族・脂肪族ともに反応する。"
        },
        {
          reagent: "Fehling 試薬(青色 Cu²⁺ 錯体)",
          result: "negative",
          observation: "赤色沈殿(Cu₂O)が生じない(青色のまま)",
          significance: "芳香族アルデヒド特有の挙動。脂肪族アルデヒド(陽性)との判別に重要",
          commonlyUsed: true,
          detail: "高校化学頻出: 「アルデヒドだが Fehling 陰性」→ 芳香族アルデヒド(ベンズアルデヒド)と判定。\n\n脂肪族アルデヒド(ホルムアルデヒド・アセトアルデヒド等): Tollens 陽性、Fehling 陽性\n芳香族アルデヒド(ベンズアルデヒド): Tollens 陽性、Fehling 陰性\n\nFehling は弱い酸化剤で、芳香族アルデヒドの不活性なカルボニルを酸化できないため。"
        },
        {
          reagent: "嗅覚",
          result: "positive",
          observation: "苦扁桃(アーモンド)の特徴的な香り",
          significance: "ベンズアルデヒド特有",
          commonlyUsed: false,
          detail: "梅・アンズ・桃の種子に含まれる青酸配糖体アミグダリンの分解で生じる芳香成分。香料用にも利用される。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "クレゾール+CO 形式の異性体や、トロポン(cycloheptatrienone)など。実用的には少ない。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "ベンゼン環＋アルデヒド基の平面分子で、CHO 部位はほぼ環と共平面(弱い p 共役)。不斉炭素なし。空気中で徐々に自動酸化されて安息香酸となる(保管時は遮光・冷暗所)。"
    },

    // ── バッチ 13: アルキン ────────────────────────────────

    ethyne: {
      synthesisRoutes: [
        {
          id: "ethyne_calcium_carbide_hydrolysis",
          name: "炭化カルシウムの加水分解",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "炭化カルシウム", formula: "CaC₂", molKey: "calciumCarbide" }],
            coReagents: [{ name: "水", formula: "H₂O", molKey: "water" }],
            catalyst: "",
            conditions: "室温",
            products: [{ name: "アセチレン", formula: "C₂H₂", molKey: "ethyne" }],
            byProducts: [{ name: "水酸化カルシウム", formula: "Ca(OH)₂", molKey: null }]
          },
          shortNote: "炭化カルシウム(CaC₂)に水を加えるとアセチレンが激しく発生する。",
          detail: "CaC₂ + 2 H₂O → C₂H₂↑ + Ca(OH)₂\n\nアセチレンの実験室製法として最も有名(高校化学頻出)。CaC₂ はカーバイドランプの燃料として歴史的に使われた(水を滴下しアセチレンを発生→燃焼)。反応は速やかで発熱を伴うため、水を少量ずつ滴下する。\n\n対照: 炭化アルミニウム Al₄C₃ + 水 → メタン(カーバイドの種類で生成炭化水素が変わる点が頻出)。",
          sources: ["Wikipedia: アセチレン", "高校化学 各社教科書"]
        },
        {
          id: "ethyne_methane_pyrolysis",
          name: "メタンの熱分解(工業的)",
          type: "industrial",
          famous: false,
          equation: {
            reactants: [{ name: "メタン", formula: "CH₄", molKey: "methane" }],
            coReagents: [],
            catalyst: "(無触媒の熱分解または部分酸化)",
            conditions: "1500 °C 以上、ミリ秒オーダーの急速加熱・冷却",
            products: [{ name: "アセチレン", formula: "C₂H₂", molKey: "ethyne" }],
            byProducts: [{ name: "水素", formula: "H₂", molKey: "hydrogen" }]
          },
          shortNote: "メタンを高温で熱分解(または部分酸化)してアセチレンを得る現代の工業法。",
          detail: "2 CH₄ → C₂H₂ + 3 H₂(1500 °C 以上)\n\n熱力学的にはアセチレンは高温で安定(自由エネルギー逆転)なため、超高温＋急冷で取り出す。古くはカーバイド法が工業の中心だったが、エネルギーコストの観点から徐々に石油化学経路(エチレンクラッキング副産物)に置き換わっている。",
          sources: ["Wikipedia: アセチレン"]
        }
      ],
      downstream: [
        {
          name: "水和によるアセトアルデヒド(Kucherov 反応)",
          leadsTo: ["acetaldehyde"],
          shortNote: "硫酸水銀(II) 触媒下で水和、エノールを経てアセトアルデヒドを与える。"
        },
        {
          name: "HCl 付加→塩化ビニル→ポリ塩化ビニル",
          leadsTo: ["polyvinylChloride"],
          shortNote: "HgCl₂ 触媒下で HCl 付加、CH₂=CHCl(塩化ビニル)を与え、重合で PVC を生成。"
        },
        {
          name: "酢酸付加→酢酸ビニル→ポリ酢酸ビニル",
          leadsTo: [],
          shortNote: "Zn(OAc)₂ 触媒下で酢酸付加、CH₃COOCH=CH₂(酢酸ビニル)を与え、重合してポリ酢酸ビニルへ。"
        },
        {
          name: "三量化によるベンゼン(Berthelot 反応)",
          leadsTo: ["benzene"],
          shortNote: "赤熱鉄管中で 3 分子が環化三量化、ベンゼンを生成。"
        },
        {
          name: "二量化によるビニルアセチレン(→ クロロプレン)",
          leadsTo: ["vinylAcetylene"],
          shortNote: "CuCl 触媒下で 2 分子が結合、CH≡C-CH=CH₂ を生成。HCl 付加でクロロプレン → 合成ゴム原料へ。"
        }
      ],
      detectionReactions: [
        {
          reagent: "アンモニア性硝酸銀水溶液([Ag(NH₃)₂]⁺)",
          result: "positive",
          observation: "白色沈殿(銀アセチリド Ag-C≡C-Ag)",
          significance: "末端アルキン(≡C-H)の存在を示す",
          commonlyUsed: true,
          detail: "HC≡CH + 2 [Ag(NH₃)₂]⁺ → AgC≡CAg↓ + 2 NH₃ + 2 NH₄⁺\n\nアルキン末端の C-H は弱酸性(pKa ≈ 25)で、銀イオンと反応してアセチリド塩を作る。末端アルキン(HC≡C-)特有の反応で、内部アルキン(2-ブチン等)は陰性。「末端 vs 内部」の判別に必須。生成物は乾燥状態で衝撃に敏感で爆発するため、生成後速やかに希酸で分解する。"
        },
        {
          reagent: "アンモニア性塩化銅(I) 水溶液([Cu(NH₃)₂]⁺)",
          result: "positive",
          observation: "赤褐色沈殿(銅アセチリド Cu-C≡C-Cu)",
          significance: "末端アルキンの存在を示す",
          commonlyUsed: true,
          detail: "Ag アセチリドと並ぶ末端アルキン特有の反応。Cu は Ag より入手しやすいので教科書実験でよく使われる。"
        },
        {
          reagent: "Br₂ 水",
          result: "positive",
          observation: "褐色が即座に脱色、最終的に 1,1,2,2-テトラブロモエタン",
          significance: "C≡C 三重結合(2 段付加)の存在",
          commonlyUsed: true,
          detail: "HC≡CH + 2 Br₂ → CHBr₂-CHBr₂。アルケンが 1 当量しか付加しないのに対し、アルキンは 2 当量付加できる点が特徴。"
        },
        {
          reagent: "KMnO₄(冷・希)",
          result: "positive",
          observation: "赤紫色が脱色",
          significance: "C≡C の存在",
          commonlyUsed: true,
          detail: "アルキンも酸化されシュウ酸まで進む。"
        }
      ],
      isomersDetail: {
        structural: [],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "直線分子(H-C≡C-H、C は sp 混成)。すべての原子が一直線上にある。シス・トランス異性も不斉炭素も存在しない。最も単純なアルキン。"
    },

    propyne: {
      synthesisRoutes: [
        {
          id: "propyne_dihalide_dehydrohalogenation",
          name: "1,2-ジブロモプロパンの脱臭化水素",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "1,2-ジブロモプロパン", formula: "CH₃CHBrCH₂Br", molKey: null }],
            coReagents: [{ name: "水酸化ナトリウム(アルコール溶液、または NaNH₂)", formula: "NaOH", molKey: "sodiumHydroxide" }],
            catalyst: "",
            conditions: "アルコール中、加熱(強塩基条件で 2 段脱離)",
            products: [{ name: "プロピン", formula: "CH₃-C≡CH", molKey: "propyne" }],
            byProducts: [
              { name: "臭化ナトリウム", formula: "NaBr", molKey: null },
              { name: "水", formula: "H₂O", molKey: "water" }
            ]
          },
          shortNote: "ビシナルジハロゲン化物から 2 分子の HBr を連続脱離してアルキンを生成。",
          detail: "CH₃CHBrCH₂Br + 2 NaOH → CH₃-C≡CH + 2 NaBr + 2 H₂O\n\n2 段の E2 脱離。1 段目でビニルブロミド、2 段目でアルキン。第 2 段は塩基が強い必要があり、KOH/エタノール や NaNH₂ が用いられる。上流: プロペン + Br₂ → 1,2-ジブロモプロパンが用意できれば、プロペン → プロピン の変換が可能。",
          sources: ["Wikipedia: プロピン", "Solomons Organic Chemistry §7"]
        }
      ],
      downstream: [
        {
          name: "Markovnikov 水和によるアセトン",
          leadsTo: ["acetone"],
          shortNote: "Hg²⁺ 触媒下で水和、Markovnikov 則に従いエノールを経てアセトンを生成。"
        },
        {
          name: "メタクリル酸メチル(→ PMMA)への利用",
          leadsTo: [],
          shortNote: "プロピン+CO+メタノールのカルボニル化(Reppe 系)でメタクリル酸メチルを合成、PMMA(アクリル樹脂)原料へ。"
        }
      ],
      detectionReactions: [
        {
          reagent: "アンモニア性硝酸銀水溶液",
          result: "positive",
          observation: "白色沈殿(銀プロピニリド)",
          significance: "末端アルキン(≡C-H)の存在",
          commonlyUsed: true,
          detail: "末端の C-H が弱酸性で Ag⁺ と反応する。アセチレン同様、末端アルキン判定の標準試薬。"
        },
        {
          reagent: "Br₂ 水",
          result: "positive",
          observation: "脱色し、最終的に 1,1,2,2-テトラブロモプロパン",
          significance: "C≡C 三重結合",
          commonlyUsed: true,
          detail: "アルキンの典型的検出反応。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "アレン(プロパジエン、CH₂=C=CH₂)。同じ C₃H₄ の構造異性体。累積 C=C をもつ独特な構造。" },
          { molKey: null, note: "シクロプロペン(C₃H₄ の環状不飽和異性体)。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "C≡C 周辺は直線(sp)、CH₃ 側は四面体(sp³)。不斉炭素なし。同じ C₃H₄ のアレン(H₂C=C=CH₂)は累積二重結合の例として大学初級で取り上げられる(直交した π 平面をもち、置換されると軸不斉が生じうる)。"
    },

    butyne1: {
      synthesisRoutes: [
        {
          id: "butyne1_acetylide_alkylation",
          name: "アセチリドのアルキル化",
          type: "lab",
          famous: false,
          equation: {
            reactants: [{ name: "アセチレン", formula: "C₂H₂", molKey: "ethyne" }],
            coReagents: [
              { name: "ナトリウムアミド", formula: "NaNH₂", molKey: null },
              { name: "ヨードエタン", formula: "C₂H₅I", molKey: null }
            ],
            catalyst: "",
            conditions: "液体アンモニア中(−33 °C)または DMF/THF 中",
            products: [{ name: "1-ブチン", formula: "CH₃CH₂-C≡CH", molKey: "butyne1" }],
            byProducts: [
              { name: "ヨウ化ナトリウム", formula: "NaI", molKey: null },
              { name: "アンモニア", formula: "NH₃", molKey: "ammonia" }
            ]
          },
          shortNote: "アセチリドアニオンがハロゲン化アルキルを SN2 攻撃して鎖を伸ばす、アルキン伸長の基本反応。",
          detail: "HC≡CH + NaNH₂ → HC≡C-Na + NH₃(脱プロトン化)\nHC≡C-Na + C₂H₅I → HC≡C-C₂H₅ + NaI(SN2 アルキル化)\n\n末端アルキン C-H の弱酸性(pKa ≈ 25)を利用してアセチリドアニオンを生成し、ハロゲン化アルキルでアルキル化する。鎖を伸ばしたアルキン合成の汎用法。",
          sources: ["Wikipedia: 1-ブチン", "Solomons Organic Chemistry §7"]
        }
      ],
      downstream: [
        {
          name: "Markovnikov 水和による 2-ブタノン",
          leadsTo: ["butanone2"],
          shortNote: "Hg²⁺ 触媒下で水和、エノールを経て 2-ブタノンを生成。"
        },
        {
          name: "2-ブチンへの異性化(強塩基触媒)",
          leadsTo: [],
          shortNote: "強塩基下で C≡C が内側に移動し、より安定な 2-ブチンへ異性化(熱力学的に有利)。"
        }
      ],
      detectionReactions: [
        {
          reagent: "アンモニア性硝酸銀水溶液",
          result: "positive",
          observation: "白色沈殿",
          significance: "末端アルキンであることを示す",
          commonlyUsed: true,
          detail: "1-ブチン(陽性)vs 2-ブチン(陰性)の判別で頻出。同じ C₄H₆ でも、末端 C-H の有無で AgNO₃ 反応性が決定的に異なる。"
        },
        {
          reagent: "Br₂ 水",
          result: "positive",
          observation: "脱色、2 当量で 1,1,2,2-テトラブロモブタン",
          significance: "C≡C 三重結合",
          commonlyUsed: true,
          detail: "アルキンの典型的検出反応。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "2-ブチン(CH₃-C≡C-CH₃、内部アルキン)。同じ C₄H₆ の位置異性体。AgNO₃ で陰性となる点で 1-ブチンと区別される。" },
          { molKey: null, note: "1,3-ブタジエン(CH₂=CH-CH=CH₂)。同じ C₄H₆ のジエン異性体。" },
          { molKey: null, note: "1,2-ブタジエン(CH₃-CH=C=CH₂、メチルアレン)。同じ C₄H₆ のアレン型異性体。" },
          { molKey: null, note: "シクロブテン、メチレンシクロプロパン。同じ C₄H₆ の環状異性体。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "末端 C≡C をもつ直線型アルキン。不斉炭素なし。同じ C₄H₆ に多数の異性体(位置・構造・環状)が存在するため、構造決定問題で末端アルキン特有の検出反応(AgNO₃)が決定的役割を果たす。"
    },

    vinylAcetylene: {
      synthesisRoutes: [
        {
          id: "vinylAcetylene_dimerization",
          name: "アセチレンの二量化",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "アセチレン", formula: "C₂H₂", molKey: "ethyne", count: 2 }],
            coReagents: [],
            catalyst: "塩化銅(I)・塩化アンモニウム水溶液(Nieuwland 触媒)",
            conditions: "弱酸性、温和な加熱",
            products: [{ name: "ビニルアセチレン", formula: "CH≡C-CH=CH₂", molKey: "vinylAcetylene" }],
            byProducts: []
          },
          shortNote: "アセチレンを CuCl 触媒下で二量化、合成ゴム(クロロプレン)原料のビニルアセチレンを得る。",
          detail: "2 HC≡CH → CH≡C-CH=CH₂(CuCl/NH₄Cl 触媒)\n\n1931 年に Nieuwland と Carothers らが工業化した古典反応。副生するジビニルアセチレン(HC≡C-CH=CH-CH=CH₂ のさらなる二量化体)の制御が技術的鍵。続く HCl 付加でクロロプレン(CH₂=CCl-CH=CH₂)が得られ、これを重合してネオプレンゴム(ポリクロロプレン)を製造。",
          sources: ["Wikipedia: ビニルアセチレン", "Wikipedia: クロロプレン"]
        }
      ],
      downstream: [
        {
          name: "HCl 付加によるクロロプレン(→ポリクロロプレン)",
          leadsTo: [],
          shortNote: "塩化第一銅触媒下で HCl が C≡C に Markovnikov 付加し、CH₂=CCl-CH=CH₂(クロロプレン)を与える。重合でネオプレンゴム(耐油性合成ゴム)。"
        }
      ],
      detectionReactions: [
        {
          reagent: "アンモニア性硝酸銀水溶液",
          result: "positive",
          observation: "白色沈殿",
          significance: "末端アルキンの存在を示す",
          commonlyUsed: false,
          detail: "末端 C-H をもつため銀アセチリドを与える。同分子内の C=C は反応に関与しない。"
        },
        {
          reagent: "Br₂ 水",
          result: "positive",
          observation: "多量の Br₂ を消費して脱色",
          significance: "C≡C と C=C の両方の存在を示す",
          commonlyUsed: false,
          detail: "1 分子に C≡C(2 当量分)と C=C(1 当量分)があるため、合計 3 当量の Br₂ を吸収できる。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "1,3-ブタジエン(CH₂=CH-CH=CH₂)。同じ C₄H₆ の構造異性体(共役ジエン、合成ゴム原料)。" },
          { molKey: "butyne1", note: "1-ブチン(HC≡C-CH₂CH₃)。同じ C₄H₆ の構造異性体。" },
          { molKey: null, note: "2-ブチン(CH₃-C≡C-CH₃)。同じ C₄H₆ の内部アルキン異性体。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "1 分子内に三重結合と二重結合の両方をもつ稀な共役エンイン(ene-yne)。C≡C 部分は直線(sp)、C=C 部分は平面(sp²)で、両者は共役する。クロロプレンを経て合成ゴム(ネオプレン)の原料として教科書的に重要。不斉炭素なし。"
    },

    // ── バッチ 14: アルコール① ────────────────────────────

    methanol: {
      synthesisRoutes: [
        {
          id: "methanol_syngas",
          name: "合成ガスからの工業的合成",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "一酸化炭素", formula: "CO", molKey: null }],
            coReagents: [{ name: "水素", formula: "H₂", molKey: "hydrogen", count: 2 }],
            catalyst: "Cu/ZnO/Al₂O₃(現代の主流触媒)",
            conditions: "約 250〜300 °C、50〜100 気圧",
            products: [{ name: "メタノール", formula: "CH₃OH", molKey: "methanol" }],
            byProducts: []
          },
          shortNote: "CO と H₂(合成ガス)から触媒下で直接メタノールを合成。世界のメタノール生産の主流。",
          detail: "CO + 2 H₂ → CH₃OH(Cu/ZnO/Al₂O₃ 触媒)\n\n合成ガスは天然ガス(メタン)の水蒸気改質または部分酸化で生産される(CH₄ + H₂O → CO + 3 H₂)。1923 年に BASF が ZnO/Cr₂O₃ 触媒で工業化、1960 年代に Cu/ZnO 系の低圧法に切り替わった。現代では巨大規模で生産され、ホルムアルデヒド・酢酸・MTBE 等の出発物質として石油化学工業の基幹原料。",
          sources: ["Wikipedia: メタノール"]
        }
      ],
      downstream: [
        {
          name: "酸化によるホルムアルデヒド",
          leadsTo: ["formaldehyde"],
          shortNote: "Ag または Fe-Mo 触媒下で空気酸化、ホルムアルデヒドを生成。フェノール樹脂や尿素樹脂の原料。"
        },
        {
          name: "Monsanto 法による酢酸合成",
          leadsTo: ["aceticAcid"],
          shortNote: "Rh 錯体触媒下で CO とカルボニル化、酢酸を生成。世界の酢酸生産の主流。"
        },
        {
          name: "MTBE(高オクタン価ガソリン添加剤)",
          leadsTo: ["mtbe"],
          shortNote: "イソブテンと反応して MTBE を生成。"
        }
      ],
      detectionReactions: [
        {
          reagent: "ヨウ素＋水酸化ナトリウム(ヨードホルム反応)",
          result: "negative",
          observation: "ヨードホルム(CHI₃)の沈殿が生じない",
          significance: "CH₃-CH(OH)- 構造をもたないことを示す",
          commonlyUsed: true,
          detail: "メタノール(陰性)vs エタノール(陽性)の判別として高校化学で頻出。\n\nメタノール: CH₃-OH のみで CH₃-CH(OH)- がないため陰性\nエタノール: CH₃-CH₂-OH = CH₃-CH(OH)-H で陽性\n\nNa 試験では両者とも陽性となり判別できないため、ヨードホルム反応が決定的。"
        },
        {
          reagent: "Na(金属ナトリウム)",
          result: "positive",
          observation: "H₂ を発生",
          significance: "活性水素(OH)の存在",
          commonlyUsed: true,
          detail: "2 CH₃OH + 2 Na → 2 CH₃ONa + H₂↑。アルコール全般の検出反応。"
        },
        {
          reagent: "酸化(K₂Cr₂O₇/H₂SO₄)",
          result: "positive",
          observation: "ホルムアルデヒドを経て蟻酸まで酸化",
          significance: "1 級アルコールであることを示す",
          commonlyUsed: false,
          detail: "1 級アルコールは段階的に酸化される: メタノール → ホルムアルデヒド → 蟻酸。生成したホルムアルデヒドは Tollens・Fehling 陽性。"
        }
      ],
      isomersDetail: {
        structural: [],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "最も単純なアルコール。不斉炭素なし。室温で液体(bp 64.7 °C)、水と任意の比で混合する。急性毒性が高く、誤飲で失明・死亡(ホルムアルデヒドへの代謝による)。エタノールとの誤飲事故防止に注意。"
    },

    ethanol: {
      synthesisRoutes: [
        {
          id: "ethanol_ethene_hydration",
          name: "エチレンの水和(工業的)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "エチレン", formula: "C₂H₄", molKey: "ethene" }],
            coReagents: [{ name: "水", formula: "H₂O", molKey: "water" }],
            catalyst: "リン酸(H₃PO₄)担持触媒",
            conditions: "約 300 °C、60〜70 気圧",
            products: [{ name: "エタノール", formula: "C₂H₅OH", molKey: "ethanol" }],
            byProducts: []
          },
          shortNote: "エチレンに水を直接付加してエタノールを得る現代の工業法。",
          detail: "C₂H₄ + H₂O → C₂H₅OH(リン酸触媒)\n\n古くは硫酸経由(間接水和、エチル硫酸を加水分解)が使われたが、現代は直接水和が主流。工業エタノール(燃料・溶剤・原料)のほぼ全てがこの経路または発酵法で製造される。",
          sources: ["Wikipedia: エタノール"]
        },
        {
          id: "ethanol_fermentation",
          name: "糖の発酵(古典・酒類)",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "グルコース", formula: "C₆H₁₂O₆", molKey: "glucose" }],
            coReagents: [],
            catalyst: "酵母(Saccharomyces cerevisiae)の酵素群",
            conditions: "30 °C 程度、嫌気、pH 4〜6",
            products: [{ name: "エタノール", formula: "C₂H₅OH", molKey: "ethanol", count: 2 }],
            byProducts: [{ name: "二酸化炭素", formula: "CO₂", molKey: "carbonDioxide", count: 2 }]
          },
          shortNote: "ブドウ糖を酵母でアルコール発酵させてエタノールを得る、古来からの製法。",
          detail: "C₆H₁₂O₆ → 2 C₂H₅OH + 2 CO₂(酵母)\n\n酒類(ビール・ワイン・日本酒等)の製造原理。糖は酵母により段階的に分解されエタノールと CO₂ になる。燃料用バイオエタノール(ブラジルのサトウキビ、米国のトウモロコシ)も同じ経路。高校化学では糖の発酵反応として頻出。",
          sources: ["Wikipedia: エタノール", "高校化学 各社教科書"]
        }
      ],
      downstream: [
        {
          name: "脱水によるエチレン(160〜180 °C)",
          leadsTo: ["ethene"],
          shortNote: "濃硫酸触媒下で 160〜180 °C に加熱、分子内脱水でエチレンを得る。"
        },
        {
          name: "脱水によるジエチルエーテル(130〜140 °C)",
          leadsTo: ["diethylEther"],
          shortNote: "濃硫酸触媒下で 130〜140 °C で加熱、分子間脱水でジエチルエーテルを得る。"
        },
        {
          name: "酸化によるアセトアルデヒド・酢酸",
          leadsTo: ["acetaldehyde", "aceticAcid"],
          shortNote: "K₂Cr₂O₇/H₂SO₄ 等で穏やかに酸化するとアセトアルデヒド、さらに酸化で酢酸へ。"
        },
        {
          name: "酢酸とのエステル化(酢酸エチル)",
          leadsTo: ["ethylAcetate"],
          shortNote: "酢酸とのフィッシャーエステル化、果実様の香りの酢酸エチルへ。"
        }
      ],
      detectionReactions: [
        {
          reagent: "ヨウ素＋水酸化ナトリウム(ヨードホルム反応)",
          result: "positive",
          observation: "淡黄色沈殿(CHI₃、ヨードホルム)と特徴的な医薬品様の香り",
          significance: "CH₃-CH(OH)- 構造の存在を示す",
          commonlyUsed: true,
          detail: "C₂H₅OH + 4 I₂ + 6 NaOH → CHI₃↓ + HCOONa + 5 NaI + 5 H₂O\n\nエタノールはまずアセトアルデヒドに酸化され、CH₃-C(=O)- 構造をもつためヨードホルム反応陽性。メタノール(陰性)との判別で必須。"
        },
        {
          reagent: "Na(金属ナトリウム)",
          result: "positive",
          observation: "H₂ を発生",
          significance: "活性水素(OH)の存在",
          commonlyUsed: true,
          detail: "2 C₂H₅OH + 2 Na → 2 C₂H₅ONa + H₂↑。アルコール全般の検出。"
        },
        {
          reagent: "K₂Cr₂O₇(硫酸酸性、加熱)",
          result: "positive",
          observation: "赤橙色 → 緑色(Cr³⁺)に変化、酢酸生成",
          significance: "1 級アルコールとして段階酸化を受ける",
          commonlyUsed: true,
          detail: "C₂H₅OH → CH₃CHO → CH₃COOH の 2 段階酸化。呼気アルコール検査の原理(運転免許の飲酒検査でかつて使われた)。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "dimethylEther", note: "ジメチルエーテル(CH₃-O-CH₃)。同じ C₂H₆O の構造異性体(エーテル)。OH をもたず、Na と反応しない・水と分離するなど性質が大きく異なる。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "C₂H₅-OH の最も基本的な 1 級アルコール。不斉炭素なし。同じ C₂H₆O のジメチルエーテルとの構造異性体ペアは、官能基の違いで物性が大きく異なる教科書的例(bp: エタノール 78 °C vs ジメチルエーテル −24 °C)。"
    },

    propanol1: {
      synthesisRoutes: [
        {
          id: "propanol1_oxo_process",
          name: "ヒドロホルミル化(オキソ法)→ 還元(工業的)",
          type: "industrial",
          famous: false,
          equation: {
            reactants: [{ name: "エチレン", formula: "C₂H₄", molKey: "ethene" }],
            coReagents: [
              { name: "一酸化炭素", formula: "CO", molKey: null },
              { name: "水素", formula: "H₂", molKey: "hydrogen" }
            ],
            catalyst: "コバルトまたはロジウムカルボニル錯体",
            conditions: "(1) ヒドロホルミル化 100〜200 °C、加圧 → プロパナール (2) H₂/Ni 還元",
            products: [{ name: "1-プロパノール", formula: "CH₃CH₂CH₂OH", molKey: "propanol1" }],
            byProducts: []
          },
          shortNote: "エチレン+CO+H₂ でプロパナールを生成(オキソ法)、続けて水素化還元で 1-プロパノールへ。",
          detail: "(1) C₂H₄ + CO + H₂ → CH₃CH₂CHO(ヒドロホルミル化)\n(2) CH₃CH₂CHO + H₂ → CH₃CH₂CH₂OH(接触水素化)\n\nアルケンのヒドロホルミル化はオキソ法と呼ばれ、Roelen が 1938 年に発見。高炭素アルコールの工業合成における重要な経路。",
          sources: ["Wikipedia: 1-プロパノール", "Wikipedia: ヒドロホルミル化"]
        },
        {
          id: "propanol1_propanal_reduction",
          name: "プロパナールの還元",
          type: "lab",
          famous: false,
          equation: {
            reactants: [{ name: "プロパナール", formula: "CH₃CH₂CHO", molKey: "propionaldehyde" }],
            coReagents: [{ name: "還元剤(NaBH₄ など)", formula: "—", molKey: null }],
            catalyst: "",
            conditions: "エタノール中、室温",
            products: [{ name: "1-プロパノール", formula: "CH₃CH₂CH₂OH", molKey: "propanol1" }],
            byProducts: []
          },
          shortNote: "プロパナール(プロピオンアルデヒド)の C=O を NaBH₄ で還元、1 級アルコールへ。",
          detail: "CH₃CH₂CHO + 2 [H] → CH₃CH₂CH₂OH\n\n1 級アルデヒドの還元で対応する 1 級アルコールが得られる典型例。",
          sources: ["Wikipedia: 1-プロパノール"]
        }
      ],
      downstream: [
        {
          name: "酸化によるプロピオン酸",
          leadsTo: ["propionaldehyde", "propionicAcid"],
          shortNote: "K₂Cr₂O₇/H₂SO₄ で段階酸化、プロパナール経由でプロピオン酸へ。"
        },
        {
          name: "脱水によるプロペン",
          leadsTo: ["propene"],
          shortNote: "濃硫酸触媒下で 170 °C 程度、分子内脱水でプロペンを生成。"
        }
      ],
      detectionReactions: [
        {
          reagent: "ヨウ素＋水酸化ナトリウム(ヨードホルム反応)",
          result: "negative",
          observation: "ヨードホルムの沈殿が生じない",
          significance: "CH₃-CH(OH)- 構造をもたないことを示す",
          commonlyUsed: true,
          detail: "1-プロパノール(陰性)vs 2-プロパノール(陽性)の判別で頻出。OH の付く位置で結果が劇的に異なる。"
        },
        {
          reagent: "Na(金属ナトリウム)",
          result: "positive",
          observation: "H₂ を発生",
          significance: "活性水素(OH)",
          commonlyUsed: true,
          detail: "アルコール全般の検出。"
        },
        {
          reagent: "K₂Cr₂O₇(硫酸酸性、加熱)",
          result: "positive",
          observation: "赤橙→緑色に変化、最終的にプロピオン酸",
          significance: "1 級アルコールとして 2 段階酸化を受ける",
          commonlyUsed: true,
          detail: "1-プロパノール → プロパナール → プロピオン酸。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "propanol2", note: "2-プロパノール(イソプロパノール、(CH₃)₂CHOH)。同じ C₃H₈O の位置異性体。ヨードホルム反応で判別可能。" },
          { molKey: "methylEthylEther", note: "メチルエチルエーテル(CH₃-O-C₂H₅)。同じ C₃H₈O の構造異性体(エーテル)。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "末端 CH₂-OH の 1 級アルコール。不斉炭素なし。同じ C₃H₈O の異性体(2-プロパノール、メチルエチルエーテル)と性質が異なる教科書的例。"
    },

    propanol2: {
      synthesisRoutes: [
        {
          id: "propanol2_propene_hydration",
          name: "プロペンの Markovnikov 水和(工業的)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "プロペン", formula: "C₃H₆", molKey: "propene" }],
            coReagents: [{ name: "水", formula: "H₂O", molKey: "water" }],
            catalyst: "希硫酸またはリン酸(直接水和では H₃PO₄ 担持触媒)",
            conditions: "希硫酸法: 70 °C / 直接水和: 200 °C、20〜25 気圧",
            products: [{ name: "2-プロパノール", formula: "(CH₃)₂CHOH", molKey: "propanol2" }],
            byProducts: []
          },
          shortNote: "プロペンに水を Markovnikov 則に従って付加、2 級アルコール 2-プロパノールを得る。",
          detail: "CH₃-CH=CH₂ + H₂O → (CH₃)₂CHOH\n\nMarkovnikov 則: H⁺ がより多くの H をもつ C(末端 CH₂)に付き、OH が中央 C(内側、より置換度の高い C)に付く。1920 年に最初に工業的に合成された有機化学品(最初の石油化学品)。用途: 消毒用エタノールの代替・工業溶剤・アセトン原料。",
          sources: ["Wikipedia: 2-プロパノール", "高校化学 各社教科書"]
        }
      ],
      downstream: [
        {
          name: "酸化によるアセトン",
          leadsTo: ["acetone"],
          shortNote: "K₂Cr₂O₇/H₂SO₄ や CrO₃ で酸化、2 級アルコール特有のケトン(アセトン)を生成。"
        },
        {
          name: "脱水によるプロペン",
          leadsTo: ["propene"],
          shortNote: "濃硫酸触媒下で 170 °C 程度、分子内脱水でプロペンを再生。"
        }
      ],
      detectionReactions: [
        {
          reagent: "ヨウ素＋水酸化ナトリウム(ヨードホルム反応)",
          result: "positive",
          observation: "淡黄色沈殿(CHI₃、ヨードホルム)",
          significance: "CH₃-CH(OH)- 構造の存在を示す",
          commonlyUsed: true,
          detail: "(CH₃)₂CHOH = CH₃-CH(OH)-CH₃ で、CH₃-CH(OH)- 構造をもつため陽性。\n\nヨードホルム反応で陽性となるアルコール:\n  エタノール(CH₃-CH₂-OH)\n  2-プロパノール\n  2-ブタノール(一般に CH₃-CH(OH)-R の構造)\n\n1-プロパノール(陰性)との判別の決め手。"
        },
        {
          reagent: "Na(金属ナトリウム)",
          result: "positive",
          observation: "H₂ を発生",
          significance: "活性水素(OH)",
          commonlyUsed: true,
          detail: "アルコール全般の検出。"
        },
        {
          reagent: "K₂Cr₂O₇(硫酸酸性、加熱)",
          result: "positive",
          observation: "赤橙→緑色に変化、アセトン生成(カルボン酸まで進まない)",
          significance: "2 級アルコールであることを示す",
          commonlyUsed: true,
          detail: "2 級アルコールは酸化されてケトン(アセトン)まで進み、さらに酸化されない(C-C 結合切断が必要なため)。生成物が Tollens・Fehling 陰性でアルデヒドでないことを確認できる。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "propanol1", note: "1-プロパノール(CH₃CH₂CH₂OH)。同じ C₃H₈O の位置異性体。" },
          { molKey: "methylEthylEther", note: "メチルエチルエーテル(CH₃-O-C₂H₅)。同じ C₃H₈O の構造異性体(エーテル)。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "中央 C は CH₃ を 2 つもつため不斉ではない。" },
        conformers: []
      },
      stereochemistryDetail: "中央 sp³ 炭素は CH₃ × 2 + OH + H で対称化されており不斉炭素ではない。2 級アルコールだが光学活性をもたない。アセトンと Markovnikov 水和の経路で結ばれた最も親しみやすい 2 級アルコール。"
    },

    butanol1: {
      synthesisRoutes: [
        {
          id: "butanol1_oxo_process",
          name: "ヒドロホルミル化(オキソ法)→ 還元(工業的)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "プロペン", formula: "C₃H₆", molKey: "propene" }],
            coReagents: [
              { name: "一酸化炭素", formula: "CO", molKey: null },
              { name: "水素", formula: "H₂", molKey: "hydrogen" }
            ],
            catalyst: "ロジウム(またはコバルト)カルボニル錯体",
            conditions: "(1) ヒドロホルミル化 100〜120 °C、加圧 → ブチルアルデヒド (2) H₂/Ni 還元",
            products: [{ name: "1-ブタノール", formula: "CH₃(CH₂)₃OH", molKey: "butanol1" }],
            byProducts: [{ name: "イソブチルアルデヒド(→ イソブタノール)", formula: "(CH₃)₂CHCHO", molKey: null }]
          },
          shortNote: "プロペン+CO+H₂ でブチルアルデヒドを生成、続けて水素化還元で 1-ブタノールへ。",
          detail: "(1) C₃H₆ + CO + H₂ → CH₃CH₂CH₂CHO(ヒドロホルミル化)\n(2) CH₃CH₂CH₂CHO + H₂ → CH₃CH₂CH₂CH₂OH\n\n工業的な 1-ブタノール製造の主流。Rh 触媒では n/iso 比を 9 以上に高められる(直鎖選択性が高い)。現代の触媒設計の重要な成功例。",
          sources: ["Wikipedia: 1-ブタノール", "Wikipedia: ヒドロホルミル化"]
        },
        {
          id: "butanol1_abe_fermentation",
          name: "ABE 発酵(アセトン-ブタノール-エタノール発酵)",
          type: "lab",
          famous: false,
          equation: {
            reactants: [{ name: "デンプン・糖類", formula: "—", molKey: null }],
            coReagents: [],
            catalyst: "Clostridium acetobutylicum(嫌気性細菌)",
            conditions: "30〜37 °C、嫌気",
            products: [{ name: "1-ブタノール", formula: "CH₃(CH₂)₃OH", molKey: "butanol1" }],
            byProducts: [
              { name: "アセトン", formula: "CH₃COCH₃", molKey: "acetone" },
              { name: "エタノール", formula: "C₂H₅OH", molKey: "ethanol" },
              { name: "二酸化炭素", formula: "CO₂", molKey: "carbonDioxide" }
            ]
          },
          shortNote: "Clostridium 属細菌が糖を嫌気発酵し、ブタノール・アセトン・エタノールを比 6:3:1 で生産する古典的工業法。",
          detail: "20 世紀初頭、第一次大戦中の TNT 増産や合成ゴム原料アセトン需要に応えて Weizmann が工業化(イスラエル建国の父の一人としても有名)。\n\n第二次大戦後は石油化学経路(オキソ法)に置き換えられたが、近年バイオエタノールに次ぐバイオブタノールとして再評価。",
          sources: ["Wikipedia: 1-ブタノール", "Wikipedia: ABE 発酵"]
        }
      ],
      downstream: [
        {
          name: "酸化によるブチルアルデヒド・酪酸",
          leadsTo: ["butyraldehyde", "butyricAcid"],
          shortNote: "K₂Cr₂O₇/H₂SO₄ で段階酸化、ブチルアルデヒド経由で酪酸(ヤギ脂のような臭い)へ。"
        },
        {
          name: "脱水による 1-ブテン(→ 2-ブテン異性化)",
          leadsTo: ["butene1", "butene2"],
          shortNote: "濃硫酸触媒下で脱水、初め 1-ブテンが生成するが酸触媒下で 2-ブテンへ異性化しやすい。"
        },
        {
          name: "酢酸との Fischer エステル化(酢酸ブチル)",
          leadsTo: [],
          shortNote: "酢酸とのエステル化で塗料・接着剤の溶剤として広く使われる酢酸ブチルを与える。"
        }
      ],
      detectionReactions: [
        {
          reagent: "ヨウ素＋水酸化ナトリウム(ヨードホルム反応)",
          result: "negative",
          observation: "ヨードホルムの沈殿が生じない",
          significance: "CH₃-CH(OH)- 構造をもたない",
          commonlyUsed: true,
          detail: "2-ブタノール(陽性)との判別で頻出。1-ブタノールの末端 OH 構造ではヨードホルム反応は起こらない。"
        },
        {
          reagent: "Na",
          result: "positive",
          observation: "H₂ を発生",
          significance: "OH の存在",
          commonlyUsed: true,
          detail: "アルコール全般。"
        },
        {
          reagent: "K₂Cr₂O₇(硫酸酸性、加熱)",
          result: "positive",
          observation: "赤橙→緑色、酪酸まで酸化",
          significance: "1 級アルコールとして 2 段階酸化",
          commonlyUsed: true,
          detail: "1-ブタノール → ブチルアルデヒド → 酪酸。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "butanol2", note: "2-ブタノール(CH₃CH(OH)C₂H₅、2 級アルコール)。同じ C₄H₁₀O の位置異性体。不斉炭素をもち光学異性が現れる。" },
          { molKey: "tertButanol", note: "tert-ブタノール((CH₃)₃COH、3 級アルコール)。同じ C₄H₁₀O の構造異性体。酸化されない。" },
          { molKey: null, note: "イソブタノール(2-メチル-1-プロパノール、(CH₃)₂CHCH₂OH)。同じ C₄H₁₀O の分岐型 1 級アルコール。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "末端 CH₂-OH の 1 級アルコール。不斉炭素なし。C₄H₁₀O のアルコール 4 異性体(n-, sec-, iso-, tert-)は高校化学の構造異性問題の頻出セット。OH の位置・分岐パターンで反応性が大きく変わる教科書的例。"
    },

    // ── バッチ 15: アルコール②/グリコール/エーテル① ──────

    butanol2: {
      synthesisRoutes: [
        {
          id: "butanol2_butene_hydration",
          name: "ブテンの Markovnikov 水和(工業的)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "1-ブテンまたは 2-ブテン", formula: "C₄H₈", molKey: "butene1" }],
            coReagents: [{ name: "水", formula: "H₂O", molKey: "water" }],
            catalyst: "硫酸(間接水和)またはリン酸(直接水和)",
            conditions: "酸性、加圧、80〜200 °C",
            products: [{ name: "2-ブタノール(ラセミ体)", formula: "CH₃CH(OH)CH₂CH₃", molKey: "butanol2" }],
            byProducts: []
          },
          shortNote: "ブテンに水を Markovnikov 則に従って付加、2 級アルコール 2-ブタノールを得る。",
          detail: "CH₃CH=CHCH₃ + H₂O → CH₃CH(OH)CH₂CH₃(2-ブテンから)\nCH₃CH₂CH=CH₂ + H₂O → CH₃CH(OH)CH₂CH₃(1-ブテンから、Markovnikov 則で内側 C に OH)\n\nいずれの異性体ブテンからも 2-ブタノールが得られる(カチオン中間体が共通)。工業的には 2-ブタノンの前駆体として重要。カチオン中間体経由のため、新たに生成する不斉炭素はラセミ体となる。",
          sources: ["Wikipedia: 2-ブタノール"]
        },
        {
          id: "butanol2_butanone_reduction",
          name: "2-ブタノンの還元",
          type: "lab",
          famous: false,
          equation: {
            reactants: [{ name: "2-ブタノン", formula: "CH₃COCH₂CH₃", molKey: "butanone2" }],
            coReagents: [{ name: "還元剤(NaBH₄ など)", formula: "—", molKey: null }],
            catalyst: "",
            conditions: "エタノール中、室温",
            products: [{ name: "2-ブタノール(ラセミ体)", formula: "CH₃CH(OH)C₂H₅", molKey: "butanol2" }],
            byProducts: []
          },
          shortNote: "2-ブタノンの C=O を NaBH₄ で還元、2 級アルコール 2-ブタノールへ。生成物はラセミ体。",
          detail: "CH₃COCH₂CH₃ + 2 [H] → CH₃CH(OH)CH₂CH₃\n\nケトンの還元で対応する 2 級アルコールが得られる典型例。カルボニル C は両面から等確率で攻撃されるため、生成する不斉炭素は (R)/(S) ラセミ体となる。",
          sources: ["Wikipedia: 2-ブタノール"]
        }
      ],
      downstream: [
        {
          name: "酸化による 2-ブタノン",
          leadsTo: ["butanone2"],
          shortNote: "K₂Cr₂O₇/H₂SO₄ で酸化、2 級アルコール特有のケトンを生成(カルボン酸まで進まない)。"
        },
        {
          name: "脱水による 2-ブテン(主)",
          leadsTo: ["butene2", "butene1"],
          shortNote: "濃硫酸触媒下で脱水、Saytzeff 則に従い 2-ブテンが主、1-ブテンが副として生成。"
        }
      ],
      detectionReactions: [
        {
          reagent: "ヨウ素＋水酸化ナトリウム(ヨードホルム反応)",
          result: "positive",
          observation: "淡黄色沈殿(CHI₃)",
          significance: "CH₃-CH(OH)- 構造の存在を示す",
          commonlyUsed: true,
          detail: "CH₃-CH(OH)-C₂H₅ は CH₃-CH(OH)- 構造をもつため陽性。1-ブタノール(陰性)・tert-ブタノール(陰性)との判別に有効。"
        },
        {
          reagent: "K₂Cr₂O₇(硫酸酸性、加熱)",
          result: "positive",
          observation: "赤橙 → 緑色(Cr³⁺)、生成物 2-ブタノンは Tollens・Fehling 陰性",
          significance: "2 級アルコールとして酸化される(ケトン止まり)",
          commonlyUsed: true,
          detail: "「酸化される(K₂Cr₂O₇ で色変化)が生成物がアルデヒドではない(Tollens/Fehling 陰性)」→ 2 級アルコールと判定。tert-ブタノール(酸化されない)との判別の決め手。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "butanol1", note: "1-ブタノール(CH₃(CH₂)₃OH、1 級)。同じ C₄H₁₀O の位置異性体。" },
          { molKey: "tertButanol", note: "tert-ブタノール((CH₃)₃COH、3 級)。同じ C₄H₁₀O の構造異性体。" },
          { molKey: null, note: "イソブタノール((CH₃)₂CHCH₂OH、分岐型 1 級)。同じ C₄H₁₀O の構造異性体。" },
          { molKey: "diethylEther", note: "ジエチルエーテル(C₂H₅OC₂H₅)。同じ C₄H₁₀O の構造異性体(エーテル)。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: true, rs: "(R)/(S) のエナンチオマー対", note: "中央炭素 C2 は CH₃, OH, H, C₂H₅ の 4 つすべて異なる置換基をもつため不斉炭素。(R)-2-ブタノールと (S)-2-ブタノールの 1 対のエナンチオマーが存在し、合成では通常ラセミ体として得られる。" },
        conformers: []
      },
      stereochemistryDetail: "C₄H₁₀O のアルコール 4 異性体の中で唯一の不斉炭素含有体(中央 C に 4 種の異なる置換基)。光学異性体 (R)-/(S)- が存在し、化学的性質はほぼ同一だが旋光度が逆向き。生体内では (R)/(S) が異なる代謝を受けることがある。"
    },

    tertButanol: {
      synthesisRoutes: [
        {
          id: "tertButanol_isobutene_hydration",
          name: "イソブテンの Markovnikov 水和",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "イソブテン(2-メチルプロペン)", formula: "(CH₃)₂C=CH₂", molKey: null }],
            coReagents: [{ name: "水", formula: "H₂O", molKey: "water" }],
            catalyst: "希硫酸または酸性イオン交換樹脂",
            conditions: "穏和な酸性、室温〜80 °C",
            products: [{ name: "tert-ブタノール", formula: "(CH₃)₃COH", molKey: "tertButanol" }],
            byProducts: []
          },
          shortNote: "イソブテンに水を Markovnikov 則に従って付加、3 級アルコール tert-ブタノールを得る。",
          detail: "(CH₃)₂C=CH₂ + H₂O → (CH₃)₃COH\n\nMarkovnikov 則: H⁺ がより多くの H をもつ末端 CH₂ に付き、OH が 3 級カルボカチオンが生成する内側の C に付く。3 級カチオンは特に安定(超共役 9 個分)なため、付加は非常に速やか・選択的。イソブテンは MTBE(高オクタン価ガソリン添加剤)の原料でもあり、tert-ブタノールはその脱離体として議論される。",
          sources: ["Wikipedia: tert-ブタノール"]
        }
      ],
      downstream: [
        {
          name: "脱水によるイソブテン",
          leadsTo: [],
          shortNote: "希硫酸触媒下で容易に脱水、3 級カチオン経由でイソブテンを再生する。"
        },
        {
          name: "MTBE(メチル t-ブチルエーテル)",
          leadsTo: ["mtbe"],
          shortNote: "メタノール存在下でイソブテンを酸触媒水和すると tert-ブタノール経由で MTBE が生成(実用的にはイソブテン+メタノール直接で MTBE を作る)。"
        }
      ],
      detectionReactions: [
        {
          reagent: "K₂Cr₂O₇(硫酸酸性、加熱)",
          result: "negative",
          observation: "色変化なし(赤橙のまま、酸化されない)",
          significance: "3 級アルコールであることを示す",
          commonlyUsed: true,
          detail: "1 級・2 級アルコール(陽性)vs 3 級アルコール(陰性)の決定的判別法。\n\n3 級アルコールは OH 結合炭素に H をもたないため、通常の酸化条件(カルボニル化のために C-H と C-OH の H を 1 つずつ外す)では酸化されない。"
        },
        {
          reagent: "ヨウ素＋水酸化ナトリウム(ヨードホルム反応)",
          result: "negative",
          observation: "ヨードホルムの沈殿が生じない",
          significance: "CH₃-CH(OH)- 構造をもたないことを示す",
          commonlyUsed: true,
          detail: "(CH₃)₃C-OH の中央 C には H がないため CH₃-CH(OH)- の形にならず、ヨードホルム反応陰性。"
        },
        {
          reagent: "Na(金属ナトリウム)",
          result: "positive",
          observation: "H₂ を発生(ただし 1 級・2 級より遅い)",
          significance: "活性水素(OH)の存在",
          commonlyUsed: true,
          detail: "アルコール OH は 3 級でも Na と反応する。立体障害のため反応速度はやや遅い。"
        },
        {
          reagent: "Lucas 試薬(ZnCl₂/HCl)",
          result: "positive",
          observation: "直ちに白濁(塩化アルキルが生成して二相分離)",
          significance: "3 級アルコール特有の急速な反応性",
          commonlyUsed: false,
          detail: "Lucas 反応の反応速度はアルコールの級数を反映: 3 級 ≪ 2 級 ≪ 1 級 で速い。3 級は数秒で白濁、2 級は数分、1 級は加熱が必要。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "butanol1", note: "1-ブタノール(直鎖 1 級)。同じ C₄H₁₀O の構造異性体。" },
          { molKey: "butanol2", note: "2-ブタノール(2 級、不斉炭素あり)。同じ C₄H₁₀O の構造異性体。" },
          { molKey: null, note: "イソブタノール(分岐型 1 級)。同じ C₄H₁₀O の構造異性体。" },
          { molKey: "diethylEther", note: "ジエチルエーテル(エーテル)。同じ C₄H₁₀O の構造異性体。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "中央 C は CH₃ を 3 つもつため不斉ではない。" },
        conformers: []
      },
      stereochemistryDetail: "中央 sp³ 炭素は CH₃ × 3 + OH で T 字型の対称構造。不斉ではないため光学異性なし。唯一の 3 級ブタノールとして「酸化されないアルコール」の代表例。融点 25 °C と高く、室温付近で固化する珍しい液体アルコール。"
    },

    ethyleneGlycol: {
      synthesisRoutes: [
        {
          id: "ethyleneGlycol_ethylene_oxide_hydrolysis",
          name: "エチレンオキシドの加水分解(工業的)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "エチレンオキシド", formula: "C₂H₄O", molKey: null }],
            coReagents: [{ name: "水(過剰)", formula: "H₂O", molKey: "water" }],
            catalyst: "希硫酸(または無触媒で高温)",
            conditions: "60〜90 °C、過剰水で多置換抑制",
            products: [{ name: "エチレングリコール", formula: "HOCH₂CH₂OH", molKey: "ethyleneGlycol" }],
            byProducts: [{ name: "ジエチレン・トリエチレングリコール(副生)", formula: "—", molKey: null }]
          },
          shortNote: "エチレンオキシドの 3 員環を水で開環、隣接ジオールであるエチレングリコールを得る。",
          detail: "C₂H₄O + H₂O → HOCH₂CH₂OH\n\nエチレンオキシド(エポキシド)は反応性が高く、水で容易に開環する。上流: エチレン + O₂ → エチレンオキシド(Ag 触媒、空気酸化)。過剰の水を用いてエチレングリコールが生成物の二度目の攻撃を受けにくくする(→ 高分子量グリコールの生成を抑制)。PET の主原料(テレフタル酸とともに)として極めて重要。",
          sources: ["Wikipedia: エチレングリコール"]
        }
      ],
      downstream: [
        {
          name: "テレフタル酸との重縮合による PET",
          leadsTo: ["pet"],
          shortNote: "テレフタル酸(または DMT)と高温で縮合、ペットボトル・繊維用 PET を生成。"
        },
        {
          name: "不凍液(自動車冷却液)",
          leadsTo: [],
          shortNote: "水に任意比で混和し、混合液の凝固点を大きく下げるため自動車・冷却装置の不凍液として広く使われる。"
        },
        {
          name: "ニトロ化(爆薬グリコールジナイトレート)",
          leadsTo: [],
          shortNote: "硝酸＋硫酸でジニトラート(爆薬)を生成。ニトログリセリンと併用される。"
        }
      ],
      detectionReactions: [
        {
          reagent: "Na(金属ナトリウム)",
          result: "positive",
          observation: "H₂ を激しく発生(2 当量分)",
          significance: "2 つの OH の存在を示す(多価アルコール)",
          commonlyUsed: true,
          detail: "HOCH₂CH₂OH + 2 Na → NaOCH₂CH₂ONa + H₂↑\n\n単価アルコール(1 当量の H₂)と異なり、ジオールでは 2 当量分の H₂ を発生する。"
        },
        {
          reagent: "過ヨウ素酸(HIO₄、Malaprade 反応)",
          result: "positive",
          observation: "C-C 結合切断、ホルムアルデヒド 2 分子が生成",
          significance: "ビシナルジオール(隣接ジオール)特有の反応",
          commonlyUsed: false,
          detail: "HOCH₂CH₂OH + HIO₄ → 2 HCHO + HIO₃ + H₂O\n\n隣接 OH をもつジオール特有の酸化開裂。糖化学では多用される(C2 位の解析)。1,3-ジオール等では起きない。"
        },
        {
          reagent: "Cu(OH)₂ + NaOH",
          result: "positive",
          observation: "深青色(青紫色)の銅錯体を形成し溶解",
          significance: "多価アルコール特有(隣接 OH と Cu²⁺ のキレート)",
          commonlyUsed: true,
          detail: "多価アルコール(エチレングリコール、グリセリン、糖類)の検出反応。単価アルコール(メタノール、エタノール等)は呈色しないため、多価 vs 単価の判別で頻出。"
        }
      ],
      isomersDetail: {
        structural: [],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "両端に OH をもつ対称的な 2 価アルコール。不斉炭素なし。水に任意比で混和する(水素結合網に組み込まれる)、低い凝固点降下作用、無毒の代替不凍液(プロピレングリコール)と並び重要な工業ジオール。"
    },

    glycerol: {
      synthesisRoutes: [
        {
          id: "glycerol_fat_saponification",
          name: "油脂のけん化(鹸化)の副産物",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "油脂(トリグリセリド)", formula: "(RCOO)₃C₃H₅", molKey: null }],
            coReagents: [{ name: "水酸化ナトリウム", formula: "NaOH", molKey: "sodiumHydroxide", count: 3 }],
            catalyst: "",
            conditions: "加熱(80〜100 °C)",
            products: [{ name: "グリセリン", formula: "HOCH₂CH(OH)CH₂OH", molKey: "glycerol" }],
            byProducts: [{ name: "脂肪酸ナトリウム(石けん)", formula: "RCOONa", molKey: null, count: 3 }]
          },
          shortNote: "油脂を NaOH でけん化(加水分解)すると石けんとともにグリセリンが副生する。",
          detail: "(RCOO)₃C₃H₅ + 3 NaOH → 3 RCOONa + HOCH₂CH(OH)CH₂OH\n\n油脂は脂肪酸とグリセリンのトリエステル(トリグリセリド)。塩基で加水分解すると 3 つのエステル結合がすべて切断され、石けん(脂肪酸 Na 塩)3 分子とグリセリン 1 分子が得られる。高校化学で油脂のけん化と並んで頻出。工業的にはバイオディーゼル製造(油脂 + メタノール → 脂肪酸メチル + グリセリン)の副産物としても大量に得られる。",
          sources: ["Wikipedia: グリセリン", "高校化学 各社教科書"]
        },
        {
          id: "glycerol_propene_oxidation",
          name: "プロペンの段階酸化(工業・現代)",
          type: "industrial",
          famous: false,
          equation: {
            reactants: [{ name: "プロペン", formula: "C₃H₆", molKey: "propene" }],
            coReagents: [{ name: "酸素・水", formula: "O₂/H₂O", molKey: null }],
            catalyst: "段階毎に異なる金属酸化物触媒",
            conditions: "プロペン → アクロレイン → アリルアルコール → グリセリンの多段階",
            products: [{ name: "グリセリン", formula: "C₃H₈O₃", molKey: "glycerol" }],
            byProducts: []
          },
          shortNote: "プロペンを多段酸化してグリセリンに変換する石油化学経路。",
          detail: "けん化副産物供給では足りない時期に開発された経路。アクロレイン、アリルアルコールを経由する。\n\n近年はバイオディーゼル副産物供給が過剰のため、合成経路の重要性は低下。",
          sources: ["Wikipedia: グリセリン"]
        }
      ],
      downstream: [
        {
          name: "ニトロ化によるニトログリセリン(爆薬・狭心症薬)",
          leadsTo: [],
          shortNote: "濃硝酸＋濃硫酸の混酸でトリニトラート化、ダイナマイト主成分や狭心症治療薬を生成。"
        },
        {
          name: "アクロレインへの脱水(生分解性原料)",
          leadsTo: [],
          shortNote: "酸触媒下で脱水するとアクロレイン(α,β-不飽和アルデヒド)を生成、樹脂・医薬品中間体へ。"
        },
        {
          name: "化粧品・食品の保湿剤・添加物",
          leadsTo: [],
          shortNote: "強い吸湿性を活かして保湿剤、甘味料、食品添加物として広く利用。無毒。"
        }
      ],
      detectionReactions: [
        {
          reagent: "Cu(OH)₂ + NaOH",
          result: "positive",
          observation: "深い青紫色(青藍色)の銅錯体",
          significance: "多価アルコール(隣接 OH × 複数)の存在を示す",
          commonlyUsed: true,
          detail: "エチレングリコール・糖類と並ぶ多価アルコール検出の標準反応。3 つの OH のうち隣接する 2 つが Cu²⁺ にキレート配位して呈色。単価アルコールは呈色しないため判別に有用。"
        },
        {
          reagent: "Na(金属ナトリウム)",
          result: "positive",
          observation: "H₂ を激しく発生(3 当量分)",
          significance: "3 つの OH の存在を示す",
          commonlyUsed: true,
          detail: "アルコール OH 1 つにつき H 1/2 当量の H₂ を生じるため、3 価アルコールは単価より格段に多くの H₂ を発生する。"
        },
        {
          reagent: "過ヨウ素酸(HIO₄、Malaprade 反応)",
          result: "positive",
          observation: "C-C 結合 2 箇所で切断、ホルムアルデヒド 2 分子＋蟻酸 1 分子が生成",
          significance: "連続するビシナルジオール特有の挙動",
          commonlyUsed: false,
          detail: "HOCH₂-CH(OH)-CH₂OH + 2 HIO₄ → 2 HCHO + HCOOH + 2 HIO₃ + H₂O\n\n糖化学・天然物分析で多用される。"
        },
        {
          reagent: "嗅覚・触覚",
          result: "positive",
          observation: "無色・粘性の高い液体、わずかに甘い味",
          significance: "グリセリン特有",
          commonlyUsed: false,
          detail: "高校化学では「べたつく無色の液体」として記述される。粘性は水素結合の多さに起因。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "1,1,2-プロパントリオール などは不安定(gem-ジオール構造を含む)。実用的にはグリセリン以外の安定な C₃H₈O₃ 異性体は少ない。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "中央 C は HOCH₂ を 2 つもつため不斉ではない(同一置換基が 2 つ)。" },
        conformers: []
      },
      stereochemistryDetail: "中央 sp³ 炭素は H, OH, CH₂OH, CH₂OH で対称化され不斉炭素ではない。光学活性なし。3 つの OH の水素結合により高粘性・高沸点・吸湿性をもつ。油脂けん化の副産物として教科書頻出。"
    },

    diethylEther: {
      synthesisRoutes: [
        {
          id: "diethylEther_ethanol_dehydration",
          name: "エタノールの分子間脱水",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "エタノール", formula: "C₂H₅OH", molKey: "ethanol", count: 2 }],
            coReagents: [],
            catalyst: "濃硫酸",
            conditions: "約 130〜140 °C(160 °C 以上だとエチレンになる)",
            products: [{ name: "ジエチルエーテル", formula: "C₂H₅OC₂H₅", molKey: "diethylEther" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "エタノール 2 分子から水 1 分子が脱離する分子間脱水でジエチルエーテルを得る。",
          detail: "2 C₂H₅OH → C₂H₅OC₂H₅ + H₂O(濃硫酸触媒、130〜140 °C)\n\n温度依存でエタノールの脱水は 2 通りに分かれる:\n  130〜140 °C: 分子間脱水でジエチルエーテル\n  160〜180 °C: 分子内脱水でエチレン\n\n高校化学で頻出の「温度で生成物が変わる」反応の代表例。",
          sources: ["Wikipedia: ジエチルエーテル", "高校化学 各社教科書"]
        },
        {
          id: "diethylEther_williamson",
          name: "Williamson エーテル合成",
          type: "lab",
          famous: false,
          equation: {
            reactants: [{ name: "ナトリウムエトキシド", formula: "C₂H₅ONa", molKey: null }],
            coReagents: [{ name: "ヨウ化エチル", formula: "C₂H₅I", molKey: null }],
            catalyst: "",
            conditions: "エタノール中、加温",
            products: [{ name: "ジエチルエーテル", formula: "C₂H₅OC₂H₅", molKey: "diethylEther" }],
            byProducts: [{ name: "ヨウ化ナトリウム", formula: "NaI", molKey: null }]
          },
          shortNote: "アルコキシドが C₂H₅I を SN2 攻撃してエーテル結合を作る、対称・非対称エーテル合成の汎用法。",
          detail: "C₂H₅O⁻Na⁺ + C₂H₅I → C₂H₅OC₂H₅ + NaI\n\n同種・異種アルコキシドとハロゲン化アルキルを組み合わせれば任意のエーテルが作れる。工業的には脱水法より制御しやすい。",
          sources: ["Wikipedia: ジエチルエーテル", "Solomons Organic Chemistry §11"]
        }
      ],
      downstream: [
        {
          name: "Grignard 反応の溶媒",
          leadsTo: [],
          shortNote: "Mg と RX の反応に必須の無水・無極性溶媒として古典的に用いられる(O が Mg に弱配位し RMgX を安定化)。"
        },
        {
          name: "麻酔薬(歴史的)",
          leadsTo: [],
          shortNote: "1846 年に W. Morton が外科麻酔として導入、19〜20 世紀初頭に広く使用された。引火性が高く現代では使われない。"
        }
      ],
      detectionReactions: [
        {
          reagent: "Na(金属ナトリウム)",
          result: "negative",
          observation: "H₂ を発生しない(反応しない)",
          significance: "OH をもたないことを示す(エーテルの判別)",
          commonlyUsed: true,
          detail: "1-ブタノールなどアルコール(陽性)vs ジエチルエーテルなどエーテル(陰性)の決定的判別。同じ C₄H₁₀O でも、活性 H の有無で Na 反応性が劇的に異なる。"
        },
        {
          reagent: "ヨウ化カリウム水溶液(KI/H⁺、過酸化物検出)",
          result: "positive",
          observation: "古いジエチルエーテルではヨウ素が遊離(過酸化物が生成しているサイン)",
          significance: "保存中に生じる過酸化物を検出",
          commonlyUsed: false,
          detail: "ジエチルエーテルは光・空気存在下で α-位の C-H が酸化されヒドロペルオキシドを生じる。これは爆発性のため、長期保存品の蒸発時にしばしば爆発事故を起こす。\n\n蒸留前に必ず KI/デンプン試験で過酸化物の有無を確認するのが実験室の鉄則。"
        },
        {
          reagent: "嗅覚",
          result: "positive",
          observation: "特徴的な甘く心地よい揮発性の香り",
          significance: "ジエチルエーテル特有",
          commonlyUsed: false,
          detail: "bp 35 °C で揮発性が極めて高く、容易に蒸発・引火する。麻酔作用があるため吸入注意。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "butanol1", note: "1-ブタノール(直鎖 1 級アルコール)。同じ C₄H₁₀O の構造異性体。" },
          { molKey: "butanol2", note: "2-ブタノール(2 級アルコール、不斉炭素あり)。同じ C₄H₁₀O の構造異性体。" },
          { molKey: "tertButanol", note: "tert-ブタノール(3 級アルコール)。同じ C₄H₁₀O の構造異性体。" },
          { molKey: null, note: "イソブタノール、メチルプロピルエーテル、メチルイソプロピルエーテル等も C₄H₁₀O の異性体。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "C₄H₁₀O のエーテル代表。アルコール 4 異性体(n-/sec-/iso-/tert-)と並ぶ官能基異性体で、Na 試薬での判別が決定的。OH をもたないため水素結合が弱く、bp 35 °C と顕著に低い(同じ C₄H₁₀O のブタノール類は bp 80〜120 °C)。不斉炭素なし。"
    },

    // ── バッチ 16: エーテル② ──────────────────────────────

    dimethylEther: {
      synthesisRoutes: [
        {
          id: "dimethylEther_methanol_dehydration",
          name: "メタノールの分子間脱水(工業的)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "メタノール", formula: "CH₃OH", molKey: "methanol", count: 2 }],
            coReagents: [],
            catalyst: "γ-Al₂O₃ やゼオライトなど固体酸",
            conditions: "200〜400 °C、加圧",
            products: [{ name: "ジメチルエーテル", formula: "CH₃OCH₃", molKey: "dimethylEther" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "メタノール 2 分子の分子間脱水。Al₂O₃ 等の固体酸触媒が広く使われる。",
          detail: "2 CH₃OH → CH₃OCH₃ + H₂O\n\n平衡反応で温度・触媒選択により制御。工業的には合成ガス(CO+H₂)からメタノール経由でこの反応を続けて DME を製造する一連のプロセスが発展(合成ガス→DME 直接法もある)。用途は LPG 代替燃料、エアロゾル噴射剤(スプレー缶)、化学原料。",
          sources: ["Wikipedia: ジメチルエーテル"]
        }
      ],
      downstream: [
        {
          name: "燃料・噴射剤としての利用",
          leadsTo: [],
          shortNote: "LPG(プロパン・ブタン)に近い物性をもつクリーン燃料、フロン代替の噴射剤として広く使用。"
        }
      ],
      detectionReactions: [
        {
          reagent: "Na(金属ナトリウム)",
          result: "negative",
          observation: "H₂ を発生しない",
          significance: "OH をもたないことを示す(エーテル)",
          commonlyUsed: true,
          detail: "エタノール(陽性)vs ジメチルエーテル(陰性)の判別として高校化学で頻出。同じ C₂H₆O だが OH の有無が決定的。"
        },
        {
          reagent: "沸点測定",
          result: "positive",
          observation: "bp −24 °C(室温で気体)",
          significance: "エタノール(bp 78 °C)と劇的に異なる",
          commonlyUsed: false,
          detail: "OH をもたないため水素結合が形成されず、同じ分子量のアルコールに比べて沸点が 100 °C 近く低い。\n\nこれは「水素結合の有無で物性が劇的に変わる」教科書的な例。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "ethanol", note: "エタノール(C₂H₅OH)。同じ C₂H₆O の官能基異性体(アルコール)。bp 78 °C で DME(−24 °C)と劇的に異なる。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "最も単純なエーテルで、O を介して 2 つの CH₃ が対称に結合した平面三原子骨格(C-O-C 角 約 111°)。エタノールとの構造異性体は、官能基異性で物性が大きく異なる教科書頻出例。不斉炭素なし。"
    },

    methylEthylEther: {
      synthesisRoutes: [
        {
          id: "methylEthylEther_williamson",
          name: "Williamson エーテル合成",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "ナトリウムエトキシド", formula: "C₂H₅ONa", molKey: null }],
            coReagents: [{ name: "ヨードメタン", formula: "CH₃I", molKey: "iodomethane" }],
            catalyst: "",
            conditions: "エーテルまたは DMF 中、室温〜温和な加熱",
            products: [{ name: "メチルエチルエーテル", formula: "CH₃OC₂H₅", molKey: "methylEthylEther" }],
            byProducts: [{ name: "ヨウ化ナトリウム", formula: "NaI", molKey: null }]
          },
          shortNote: "アルコキシドとハロゲン化メチルを SN2 反応で結合させる、非対称エーテル合成の典型法。",
          detail: "C₂H₅O⁻Na⁺ + CH₃I → C₂H₅OCH₃ + NaI\n\n非対称エーテルを作るには Williamson 合成が標準的。どちらの組合せ(C₂H₅O⁻ + CH₃I か CH₃O⁻ + C₂H₅I)でも同じ生成物が得られるが、より立体障害の小さい RX を使う方が SN2 が速い。メチルエチルエーテルは工業利用が限定的(試薬・溶剤として)。",
          sources: ["Wikipedia: メチルエチルエーテル"]
        }
      ],
      downstream: [
        {
          name: "強酸(HBr, HI)による開裂",
          leadsTo: [],
          shortNote: "HBr/HI で C-O 結合が切断され、ハロゲン化アルキル＋アルコールを与える。"
        }
      ],
      detectionReactions: [
        {
          reagent: "Na(金属ナトリウム)",
          result: "negative",
          observation: "H₂ を発生しない",
          significance: "OH をもたない(エーテル)",
          commonlyUsed: true,
          detail: "1-プロパノール・2-プロパノール(陽性)vs メチルエチルエーテル(陰性)の判別で頻出。同じ C₃H₈O の異性体間で Na 反応性が決定的に異なる。"
        },
        {
          reagent: "沸点測定",
          result: "positive",
          observation: "bp 7 °C(プロパノール類より大幅に低い)",
          significance: "水素結合の不在を示す",
          commonlyUsed: false,
          detail: "1-プロパノール(bp 97 °C)・2-プロパノール(bp 82 °C)と比べて 80〜90 °C 低い。OH をもたないため。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "propanol1", note: "1-プロパノール。同じ C₃H₈O の官能基異性体(1 級アルコール)。" },
          { molKey: "propanol2", note: "2-プロパノール。同じ C₃H₈O の官能基異性体(2 級アルコール)。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "C₃H₈O 異性体の中で唯一のエーテル。3 つの異性体(1-プロパノール、2-プロパノール、メチルエチルエーテル)は構造異性として高校化学頻出。Na 試験・ヨードホルム反応・酸化挙動で順次判別できる古典問題のセット。不斉炭素なし。"
    },

    mtbe: {
      synthesisRoutes: [
        {
          id: "mtbe_isobutene_methanol",
          name: "イソブテンとメタノールの酸触媒付加(工業的)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "イソブテン(2-メチルプロペン)", formula: "(CH₃)₂C=CH₂", molKey: null }],
            coReagents: [{ name: "メタノール", formula: "CH₃OH", molKey: "methanol" }],
            catalyst: "酸性陽イオン交換樹脂(Amberlyst 等)",
            conditions: "60〜80 °C、加圧、液相",
            products: [{ name: "MTBE", formula: "(CH₃)₃COCH₃", molKey: "mtbe" }],
            byProducts: []
          },
          shortNote: "イソブテンの C=C にメタノールを Markovnikov 則で付加、3 級カチオンを経て MTBE を生成。",
          detail: "(CH₃)₂C=CH₂ + CH₃OH → (CH₃)₃COCH₃(酸触媒)\n\nMarkovnikov 則: H⁺ がより多くの H をもつ末端 CH₂ に付き、CH₃O⁻ が 3 級カチオン側(内側 C)に付く。3 級カチオンは特に安定なため、付加は速やか・選択的。1980〜90 年代に高オクタン価ガソリン添加剤(オクタン価 110、反ノッキング剤)として急成長したが、地下水汚染問題で米国は 2000 年代以降使用制限。日本では普及しなかった。",
          sources: ["Wikipedia: MTBE"]
        }
      ],
      downstream: [
        {
          name: "ガソリン添加剤(反ノッキング剤)",
          leadsTo: [],
          shortNote: "オクタン価向上剤として無鉛ガソリン中に 5〜15% 配合された(鉛系反ノッキング剤の代替)。"
        }
      ],
      detectionReactions: [
        {
          reagent: "Na(金属ナトリウム)",
          result: "negative",
          observation: "H₂ を発生しない",
          significance: "OH をもたない(エーテル)",
          commonlyUsed: false,
          detail: "MTBE はエーテルなので Na と反応しない。同じ分子式(C₅H₁₂O)のアミルアルコール類との判別ポイント。"
        },
        {
          reagent: "嗅覚",
          result: "positive",
          observation: "特徴的な甘いガソリン様の香り(極めて低い嗅覚閾値)",
          significance: "MTBE 特有",
          commonlyUsed: false,
          detail: "嗅覚閾値が低く(〜15 ppb)、ごく微量でも気づきやすい。地下水中の MTBE 汚染が「水道水の異臭」として最初に検知された経緯がある。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "n-/sec-/iso-/tert-アミルアルコール(C₅H₁₂O のアルコール群)。" },
          { molKey: null, note: "ジエチルメチルエーテル等のエーテル異性体。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "tert-ブチル C は CH₃ を 3 つもつため不斉ではない。" },
        conformers: []
      },
      stereochemistryDetail: "tert-ブチル基((CH₃)₃C-)の対称性のため、tert-ブチル側の C は不斉ではない。光学活性なし。ガソリン添加剤として大量生産されたことで知られるが、難分解性ゆえの環境汚染問題で社会的議論を呼んだ化学物質。"
    },

    // ── バッチ 17: アルデヒド+アセトン ───────────────────────

    formaldehyde: {
      synthesisRoutes: [
        {
          id: "formaldehyde_methanol_oxidation",
          name: "メタノールの空気酸化(工業的)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "メタノール", formula: "CH₃OH", molKey: "methanol" }],
            coReagents: [{ name: "酸素", formula: "O₂", molKey: "oxygen" }],
            catalyst: "Ag(銀触媒)または Fe-Mo 系酸化物",
            conditions: "Ag 法: 500〜650 °C／Fe-Mo 法: 250〜400 °C",
            products: [{ name: "ホルムアルデヒド", formula: "HCHO", molKey: "formaldehyde" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "メタノールを Ag または Fe-Mo 触媒下で空気酸化、ホルムアルデヒドを得る世界的工業法。",
          detail: "CH₃OH + 1/2 O₂ → HCHO + H₂O\n\n古典的には Ag 触媒の高温法(部分酸化＋脱水素の組合せ)、現代では Fe-Mo 触媒が主流。生成物は気体(bp −19 °C)で、通常 37% 水溶液(ホルマリン)として流通する。フェノール樹脂・尿素樹脂・メラミン樹脂など合成樹脂工業の主要原料。",
          sources: ["Wikipedia: ホルムアルデヒド"]
        }
      ],
      downstream: [
        {
          name: "フェノール樹脂(ベークライト)の合成",
          leadsTo: ["phenol"],
          shortNote: "酸または塩基触媒下でフェノールと縮合、世界初の合成樹脂であるフェノール樹脂を与える。"
        },
        {
          name: "尿素樹脂・メラミン樹脂",
          leadsTo: [],
          shortNote: "尿素やメラミンと縮合、接着剤・食器・化粧合板などの熱硬化性樹脂を生成。"
        },
        {
          name: "防腐剤・標本固定液(ホルマリン)",
          leadsTo: [],
          shortNote: "37% 水溶液(ホルマリン)はタンパク質を架橋固定する作用があり、生物標本の保存に利用される。"
        }
      ],
      detectionReactions: [
        {
          reagent: "Tollens 試薬(アンモニア性 AgNO₃)",
          result: "positive",
          observation: "強い銀鏡反応(容器壁に金属銀が析出)",
          significance: "アルデヒド基の存在を示す",
          commonlyUsed: true,
          detail: "HCHO + 2 [Ag(NH₃)₂]⁺ → HCOO⁻NH₄⁺ + 2 Ag↓ + 3 NH₃ + H₂O\n\nさらに HCOOH(蟻酸)まで酸化が進み、最終的に CO₂ まで進むことも。HCHO は最も強い還元性を示すアルデヒド。"
        },
        {
          reagent: "Fehling 試薬(青色 Cu²⁺ 錯体)",
          result: "positive",
          observation: "赤色沈殿(Cu₂O)",
          significance: "アルデヒドの還元性",
          commonlyUsed: true,
          detail: "HCHO + 2 Cu²⁺ + 5 OH⁻ → HCOO⁻ + Cu₂O↓ + 3 H₂O\n\n脂肪族アルデヒドの典型的な検出反応。芳香族アルデヒド(ベンズアルデヒド)は陰性である点と対比。"
        },
        {
          reagent: "シッフ試薬(フクシン亜硫酸)",
          result: "positive",
          observation: "赤紫色(マゼンタ)に呈色",
          significance: "アルデヒド全般の感度の高い検出",
          commonlyUsed: false,
          detail: "ロイコフクシンの SO₂ 付加体がアルデヒドと反応して元のフクシンの赤紫色を回復する。アルデヒド検出の高感度試験。"
        },
        {
          reagent: "ヨードホルム反応",
          result: "negative",
          observation: "ヨードホルムが生じない",
          significance: "CH₃-CO- 構造をもたないことを示す",
          commonlyUsed: false,
          detail: "HCHO は最小のアルデヒドで CH₃ をもたないため、ヨードホルム反応は陰性。アセトアルデヒド(陽性)との判別に有用。"
        }
      ],
      isomersDetail: {
        structural: [],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "最も単純なアルデヒド(H-CHO)。3 原子骨格 H-C(=O)-H の平面構造。不斉炭素なし。常温で気体だが容易に三量化(パラホルムアルデヒド)・メタノール水溶液の形(ホルマリン)で扱われる。"
    },

    acetaldehyde: {
      synthesisRoutes: [
        {
          id: "acetaldehyde_wacker_process",
          name: "Wacker 法(エチレンの水和酸化、工業的)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "エチレン", formula: "C₂H₄", molKey: "ethene", count: 2 }],
            coReagents: [{ name: "酸素", formula: "O₂", molKey: "oxygen" }],
            catalyst: "PdCl₂ / CuCl₂(パラジウム-銅触媒系)",
            conditions: "100〜130 °C、3〜10 気圧、水溶液中",
            products: [{ name: "アセトアルデヒド", formula: "CH₃CHO", molKey: "acetaldehyde", count: 2 }],
            byProducts: []
          },
          shortNote: "エチレンを Pd 触媒下で水と酸素により直接酸化、アセトアルデヒドを得る現代の工業法。",
          detail: "2 C₂H₄ + O₂ → 2 CH₃CHO(PdCl₂/CuCl₂ 触媒)\n\n1959 年にドイツの Wacker-Chemie が開発。Pd²⁺ がエチレンに水を付加し、生成した Pd-アルキルが β-脱離してアセトアルデヒドを与える機構。Pd は Cu によって再酸化され、Cu(I) は O₂ で再酸化されるサイクル。古典的なアセチレン水和(Kucherov 反応、HgSO₄ 触媒)を置き換えた経路。",
          sources: ["Wikipedia: アセトアルデヒド", "Wikipedia: ワッカー法"]
        },
        {
          id: "acetaldehyde_acetylene_hydration",
          name: "アセチレンの水和(Kucherov 反応、古典)",
          type: "historical",
          famous: true,
          equation: {
            reactants: [{ name: "アセチレン", formula: "C₂H₂", molKey: "ethyne" }],
            coReagents: [{ name: "水", formula: "H₂O", molKey: "water" }],
            catalyst: "硫酸水銀(II)(HgSO₄)",
            conditions: "希硫酸水溶液、60〜80 °C",
            products: [{ name: "アセトアルデヒド", formula: "CH₃CHO", molKey: "acetaldehyde" }],
            byProducts: []
          },
          shortNote: "アセチレンを HgSO₄ 触媒下で水和、エノールを経てアセトアルデヒドを得る古典反応。",
          detail: "HC≡CH + H₂O → CH₃CHO(HgSO₄ 触媒)\n\n中間にビニルアルコール(エノール)が生成し、互変異性によりアセトアルデヒドに転換する。1881 年に Kucherov によって報告。20 世紀前半まで工業法としても使われたが、水銀触媒の有害性(水俣病の原因物質メチル水銀の生成)で 1960 年代以降は Wacker 法に置き換わった。高校化学では今でも代表反応として頻出。",
          sources: ["Wikipedia: アセトアルデヒド", "高校化学 各社教科書"]
        },
        {
          id: "acetaldehyde_ethanol_oxidation",
          name: "エタノールの酸化",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "エタノール", formula: "C₂H₅OH", molKey: "ethanol" }],
            coReagents: [{ name: "酸化剤(K₂Cr₂O₇/H₂SO₄ など)", formula: "—", molKey: null }],
            catalyst: "",
            conditions: "穏やかに加熱、過酸化を抑える条件で停止",
            products: [{ name: "アセトアルデヒド", formula: "CH₃CHO", molKey: "acetaldehyde" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "エタノールの 1 級アルコールを K₂Cr₂O₇ 等で穏やかに酸化、アルデヒドで止める。",
          detail: "C₂H₅OH + [O] → CH₃CHO + H₂O\n\n過剰の酸化剤や長時間反応では酢酸まで進む。体内ではアルコール脱水素酵素(ADH)によって同じ酸化が起こる(飲酒後のアセトアルデヒドが「悪酔い」の原因物質)。",
          sources: ["Wikipedia: アセトアルデヒド", "高校化学 各社教科書"]
        }
      ],
      downstream: [
        {
          name: "酸化による酢酸",
          leadsTo: ["aceticAcid"],
          shortNote: "空気酸化や KMnO₄ 等でさらに酸化、酢酸を得る(昔は工業酢酸の主経路)。"
        },
        {
          name: "還元によるエタノール",
          leadsTo: ["ethanol"],
          shortNote: "NaBH₄ や H₂/Ni でカルボニルを還元、エタノールに戻る。"
        },
        {
          name: "アルドール縮合・3 量化",
          leadsTo: [],
          shortNote: "塩基触媒下で自己アルドールしクロトンアルデヒド、酸下では 3 量化してパラアルデヒド。"
        }
      ],
      detectionReactions: [
        {
          reagent: "Tollens 試薬",
          result: "positive",
          observation: "銀鏡反応",
          significance: "アルデヒド基",
          commonlyUsed: true,
          detail: "脂肪族アルデヒド全般の標準反応。"
        },
        {
          reagent: "Fehling 試薬",
          result: "positive",
          observation: "赤色沈殿(Cu₂O)",
          significance: "脂肪族アルデヒドの還元性",
          commonlyUsed: true,
          detail: "ベンズアルデヒド(陰性)との対比で頻出。脂肪族アルデヒドは Fehling 陽性。"
        },
        {
          reagent: "ヨードホルム反応",
          result: "positive",
          observation: "淡黄色沈殿(CHI₃)",
          significance: "CH₃-CO- 構造の存在",
          commonlyUsed: true,
          detail: "CH₃CHO + 3 I₂ + 4 NaOH → CHI₃↓ + HCOONa + 3 NaI + 3 H₂O\n\nCH₃-C(=O)-H で CH₃-CO- 構造をもつため陽性。ホルムアルデヒド(陰性)・プロピオンアルデヒド(陰性)との判別に有用。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "エチレンオキシド(C₂H₄O、3 員環エポキシド)。同じ C₂H₄O の構造異性体(環状エーテル)。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "C-C-O の単純な平面分子。不斉炭素なし。飲酒時に肝臓で生成する物質で、頭痛・顔の紅潮(フラッシング反応)の主原因。アジア人の約半数が ALDH2 の遺伝的不活性で代謝が遅く、飲酒に弱い。"
    },

    propionaldehyde: {
      synthesisRoutes: [
        {
          id: "propionaldehyde_oxo_process",
          name: "ヒドロホルミル化(オキソ法)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "エチレン", formula: "C₂H₄", molKey: "ethene" }],
            coReagents: [
              { name: "一酸化炭素", formula: "CO", molKey: null },
              { name: "水素", formula: "H₂", molKey: "hydrogen" }
            ],
            catalyst: "コバルトまたはロジウムカルボニル錯体",
            conditions: "100〜200 °C、加圧",
            products: [{ name: "プロピオンアルデヒド", formula: "CH₃CH₂CHO", molKey: "propionaldehyde" }],
            byProducts: []
          },
          shortNote: "エチレン+CO+H₂ を金属触媒下で反応させ、炭素を 1 個増やしたアルデヒドを得る。",
          detail: "C₂H₄ + CO + H₂ → CH₃CH₂CHO\n\nアルケンのヒドロホルミル化(オキソ法)はアルデヒド合成の基幹工業反応。末端アルケンからは直鎖型のアルデヒド(CHO が末端 C に付く)が主に得られる(触媒設計次第)。",
          sources: ["Wikipedia: プロピオンアルデヒド", "Wikipedia: ヒドロホルミル化"]
        }
      ],
      downstream: [
        {
          name: "酸化によるプロピオン酸",
          leadsTo: ["propionicAcid"],
          shortNote: "空気酸化または KMnO₄ 等でカルボン酸まで酸化。"
        },
        {
          name: "還元による 1-プロパノール",
          leadsTo: ["propanol1"],
          shortNote: "NaBH₄ や H₂/Ni で還元、1-プロパノールへ。"
        }
      ],
      detectionReactions: [
        {
          reagent: "Tollens 試薬",
          result: "positive",
          observation: "銀鏡",
          significance: "アルデヒド基",
          commonlyUsed: true,
          detail: "脂肪族アルデヒドの標準反応。"
        },
        {
          reagent: "Fehling 試薬",
          result: "positive",
          observation: "赤色沈殿",
          significance: "脂肪族アルデヒド",
          commonlyUsed: true,
          detail: "ベンズアルデヒド(陰性)との対比で重要。"
        },
        {
          reagent: "ヨードホルム反応",
          result: "negative",
          observation: "ヨードホルムの沈殿が生じない",
          significance: "CH₃-CO- 構造をもたない(CH₃ と CO の間に CH₂ がある)",
          commonlyUsed: true,
          detail: "アセトアルデヒド(陽性)との判別で頻出。CH₃CH₂-CHO は CH₃ と CO が直接結合していないため陰性。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "acetone", note: "アセトン(CH₃COCH₃)。同じ C₃H₆O の官能基異性体(ケトン)。ヨードホルム反応で判別可能: アセトン陽性 / プロピオンアルデヒド陰性、Tollens 反応はその逆: アセトン陰性 / プロピオンアルデヒド陽性。" },
          { molKey: null, note: "アリルアルコール(CH₂=CHCH₂OH)、プロピレンオキシド(環状エポキシド)、メチルビニルエーテル(CH₃OCH=CH₂)も C₃H₆O の構造異性体。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "末端 CHO の単純な脂肪族アルデヒド。不斉炭素なし。C₃H₆O 異性体ペアのアセトンとの対比は、Tollens / Fehling / ヨードホルム反応の組合せで判別する古典問題の好例。"
    },

    butyraldehyde: {
      synthesisRoutes: [
        {
          id: "butyraldehyde_oxo_process",
          name: "プロペンのヒドロホルミル化(オキソ法、工業的)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "プロペン", formula: "C₃H₆", molKey: "propene" }],
            coReagents: [
              { name: "一酸化炭素", formula: "CO", molKey: null },
              { name: "水素", formula: "H₂", molKey: "hydrogen" }
            ],
            catalyst: "ロジウム(またはコバルト)カルボニル錯体",
            conditions: "100〜120 °C、加圧",
            products: [{ name: "n-ブチルアルデヒド", formula: "CH₃CH₂CH₂CHO", molKey: "butyraldehyde" }],
            byProducts: [{ name: "イソブチルアルデヒド", formula: "(CH₃)₂CHCHO", molKey: null }]
          },
          shortNote: "プロペン+CO+H₂ のヒドロホルミル化で n-ブチルアルデヒド主生成、イソブチルアルデヒドが副生。",
          detail: "(1) CH₃CH=CH₂ + CO + H₂ → CH₃CH₂CH₂CHO(n、主)+ (CH₃)₂CHCHO(iso、副)\n\nRh 触媒の現代法では n/iso 比 9:1 以上を達成。n-ブチルアルデヒドは 2-エチルヘキサノール(DOP 可塑剤)の出発物質として極めて重要。",
          sources: ["Wikipedia: ブチルアルデヒド", "Wikipedia: ヒドロホルミル化"]
        }
      ],
      downstream: [
        {
          name: "酸化による酪酸",
          leadsTo: ["butyricAcid"],
          shortNote: "空気酸化または KMnO₄ 等で酪酸まで酸化。"
        },
        {
          name: "還元による 1-ブタノール",
          leadsTo: ["butanol1"],
          shortNote: "NaBH₄ や H₂/Ni で還元、1-ブタノールへ。"
        },
        {
          name: "アルドール縮合 → 2-エチルヘキサノール(可塑剤原料)",
          leadsTo: [],
          shortNote: "塩基触媒下でアルドール縮合 → 脱水 → 還元の 3 段階で 2-エチルヘキサノールを生成。フタル酸エステル系可塑剤(DOP/DEHP)の主要アルコール源。"
        }
      ],
      detectionReactions: [
        {
          reagent: "Tollens 試薬",
          result: "positive",
          observation: "銀鏡",
          significance: "アルデヒド基",
          commonlyUsed: true,
          detail: "脂肪族アルデヒドの標準反応。"
        },
        {
          reagent: "Fehling 試薬",
          result: "positive",
          observation: "赤色沈殿",
          significance: "脂肪族アルデヒド",
          commonlyUsed: true,
          detail: "脂肪族アルデヒド全般。"
        },
        {
          reagent: "ヨードホルム反応",
          result: "negative",
          observation: "ヨードホルムは生じない",
          significance: "CH₃-CO- 構造をもたない",
          commonlyUsed: false,
          detail: "末端の CH₃ と CHO の間に 2 つの CH₂ があるため陰性。"
        },
        {
          reagent: "嗅覚",
          result: "positive",
          observation: "強い刺激臭・腐敗様の不快臭",
          significance: "ブチルアルデヒド特有",
          commonlyUsed: false,
          detail: "C4 アルデヒド付近から「腐敗臭」が強くなる傾向にある。酪酸(バターの腐敗臭)の前駆体。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "イソブチルアルデヒド((CH₃)₂CHCHO、2-メチルプロパナール)。同じ C₄H₈O の構造異性体(分岐型アルデヒド)。" },
          { molKey: "butanone2", note: "2-ブタノン(CH₃COC₂H₅)。同じ C₄H₈O の官能基異性体(ケトン)。" },
          { molKey: null, note: "メチルビニルケトン、テトラヒドロフラン、メチレンオキセタン等も C₄H₈O の構造異性体。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "直鎖 C4 アルデヒドで不斉炭素なし。同じ C₄H₈O のイソブチルアルデヒド・2-ブタノンと並び、構造決定問題で頻出のトリオ。Tollens／Fehling／ヨードホルム／酸化挙動で順次判別する。"
    },

    acetone: {
      synthesisRoutes: [
        {
          id: "acetone_cumene_process",
          name: "クメン法の併産物(工業的、最重要)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "クメン", formula: "C₉H₁₂", molKey: "cumene" }],
            coReagents: [{ name: "酸素", formula: "O₂", molKey: "oxygen" }],
            catalyst: "希硫酸(転位段階)",
            conditions: "(1) 80〜130 °C で空気酸化 (2) 希硫酸触媒で酸転位",
            products: [
              { name: "アセトン", formula: "CH₃COCH₃", molKey: "acetone" },
              { name: "フェノール", formula: "C₆H₅OH", molKey: "phenol" }
            ],
            byProducts: []
          },
          shortNote: "クメンの空気酸化＋酸転位(クメン法)でフェノールと等モルのアセトンが併産される。",
          detail: "クメン → クメンヒドロペルオキシド → フェノール+アセトン\n\nフェノール工業生産の主流であり、同時に世界のアセトン生産の主要供給源。フェノールとアセトンが 1:1 モル比で生まれるため、両者の需要バランスが重要な経済要素。",
          sources: ["Wikipedia: アセトン", "Wikipedia: クメン法"]
        },
        {
          id: "acetone_isopropanol_oxidation",
          name: "2-プロパノールの酸化",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "2-プロパノール", formula: "(CH₃)₂CHOH", molKey: "propanol2" }],
            coReagents: [{ name: "酸化剤(K₂Cr₂O₇/H₂SO₄、CrO₃ など)", formula: "—", molKey: null }],
            catalyst: "",
            conditions: "加熱",
            products: [{ name: "アセトン", formula: "CH₃COCH₃", molKey: "acetone" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "2 級アルコールである 2-プロパノールを酸化、ケトン(アセトン)で止まる。",
          detail: "(CH₃)₂CHOH + [O] → CH₃COCH₃ + H₂O\n\n2 級アルコールの酸化はケトンで止まる(カルボン酸まで進まない)。高校化学の「アルコールの級数→酸化生成物」の典型例。",
          sources: ["Wikipedia: アセトン", "高校化学 各社教科書"]
        },
        {
          id: "acetone_calcium_acetate_pyrolysis",
          name: "酢酸カルシウムの乾留(古典)",
          type: "historical",
          famous: false,
          equation: {
            reactants: [{ name: "酢酸カルシウム", formula: "(CH₃COO)₂Ca", molKey: null }],
            coReagents: [],
            catalyst: "",
            conditions: "強熱(乾留、約 500 °C)",
            products: [{ name: "アセトン", formula: "CH₃COCH₃", molKey: "acetone" }],
            byProducts: [{ name: "炭酸カルシウム", formula: "CaCO₃", molKey: null }]
          },
          shortNote: "酢酸カルシウムを乾留すると脱炭酸的に分解し、アセトンが得られる古典法。",
          detail: "(CH₃COO)₂Ca → CH₃COCH₃ + CaCO₃\n\n19 世紀〜20 世紀初頭の主要工業法(クメン法・ABE 発酵に置き換わった)。安息香酸ナトリウム→ベンゼン と並ぶカルボン酸塩の脱炭酸/脱二酸化炭素の例として教科書で言及。",
          sources: ["Wikipedia: アセトン"]
        }
      ],
      downstream: [
        {
          name: "ビスフェノール A 経由のポリカーボネート",
          leadsTo: ["phenol"],
          shortNote: "アセトン+2 フェノール → ビスフェノール A → ポリカーボネート樹脂・エポキシ樹脂原料。"
        },
        {
          name: "メタクリル酸メチル(→ PMMA)",
          leadsTo: [],
          shortNote: "アセトン → アセトンシアノヒドリン → メタクリル酸メチルでアクリル樹脂(PMMA)原料。"
        },
        {
          name: "還元による 2-プロパノール",
          leadsTo: ["propanol2"],
          shortNote: "NaBH₄ や H₂/Ni でカルボニルを還元、2-プロパノールへ。"
        }
      ],
      detectionReactions: [
        {
          reagent: "ヨウ素＋水酸化ナトリウム(ヨードホルム反応)",
          result: "positive",
          observation: "淡黄色沈殿(CHI₃)",
          significance: "CH₃-CO- 構造の存在を示す",
          commonlyUsed: true,
          detail: "CH₃COCH₃ + 3 I₂ + 4 NaOH → CHI₃↓ + CH₃COONa + 3 NaI + 3 H₂O\n\nメチルケトンの典型例。アセトン・アセトアルデヒド・エタノール・2-プロパノール等が陽性。"
        },
        {
          reagent: "Tollens 試薬・Fehling 試薬",
          result: "negative",
          observation: "銀鏡や赤色沈殿は生じない",
          significance: "ケトン(アルデヒドではない)であることを示す",
          commonlyUsed: true,
          detail: "プロピオンアルデヒド(陽性)vs アセトン(陰性)の判別で頻出。同じ C₃H₆O だがカルボニル基の位置で結果が劇的に異なる。"
        },
        {
          reagent: "嗅覚",
          result: "positive",
          observation: "特徴的な甘く揮発性の高い香り",
          significance: "アセトン特有",
          commonlyUsed: false,
          detail: "マニキュアの除光液、塗料溶剤として身近な香り。揮発性が高く(bp 56 °C)、可燃性。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "propionaldehyde", note: "プロピオンアルデヒド(CH₃CH₂CHO)。同じ C₃H₆O の官能基異性体(アルデヒド)。Tollens・Fehling・ヨードホルム反応の組合せで判別。" },
          { molKey: null, note: "アリルアルコール、プロピレンオキシド、メチルビニルエーテル等も C₃H₆O の構造異性体。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "中央 C は CH₃ を 2 つもつため不斉ではない。" },
        conformers: []
      },
      stereochemistryDetail: "対称な中央 C に CH₃ を 2 つもつ最も単純な対称ケトン。不斉炭素なし。水と任意の比で混和、多くの有機溶媒と混和、揮発性が高いため汎用溶媒として化学実験室の必需品。糖尿病ケトアシドーシスでは呼気から検出される(ケトン体の一種)。"
    },

    // ── バッチ 18: ケトン ──────────────────────────────────

    butanone2: {
      synthesisRoutes: [
        {
          id: "butanone2_butanol2_oxidation",
          name: "2-ブタノールの酸化",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "2-ブタノール", formula: "CH₃CH(OH)C₂H₅", molKey: "butanol2" }],
            coReagents: [{ name: "酸化剤(K₂Cr₂O₇/H₂SO₄ など)", formula: "—", molKey: null }],
            catalyst: "",
            conditions: "加熱(還流)",
            products: [{ name: "2-ブタノン", formula: "CH₃COC₂H₅", molKey: "butanone2" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "2 級アルコールである 2-ブタノールを酸化、ケトンで止める。",
          detail: "CH₃CH(OH)CH₂CH₃ + [O] → CH₃COCH₂CH₃ + H₂O\n\n2 級アルコールの典型的な酸化生成物がケトン。カルボン酸まで進まない。工業的には 2-ブタノールの脱水素法(Cu 触媒、200〜400 °C)も使われる。",
          sources: ["Wikipedia: 2-ブタノン", "高校化学 各社教科書"]
        },
        {
          id: "butanone2_butene_wacker",
          name: "n-ブテンの Wacker 型酸化(工業的)",
          type: "industrial",
          famous: false,
          equation: {
            reactants: [{ name: "1-ブテンまたは 2-ブテン", formula: "C₄H₈", molKey: "butene1" }],
            coReagents: [{ name: "酸素", formula: "O₂", molKey: "oxygen" }],
            catalyst: "PdCl₂ / CuCl₂ 系",
            conditions: "100〜130 °C、加圧",
            products: [{ name: "2-ブタノン", formula: "CH₃COC₂H₅", molKey: "butanone2" }],
            byProducts: []
          },
          shortNote: "ブテンを Pd/Cu 触媒下で酸化、2-ブタノンを得る。エチレン→アセトアルデヒドの Wacker 法の変種。",
          detail: "C₄H₈ + 1/2 O₂ → CH₃COC₂H₅\n\nMarkovnikov 則的に水が C2 位に付加し、酸化されてカルボニルになる経路。Pd 系触媒の選択性で内側酸化が優先する。",
          sources: ["Wikipedia: 2-ブタノン"]
        }
      ],
      downstream: [
        {
          name: "還元による 2-ブタノール",
          leadsTo: ["butanol2"],
          shortNote: "NaBH₄ や H₂/Ni でカルボニルを還元、2-ブタノール(ラセミ体)に戻る。"
        },
        {
          name: "溶剤(塗料・接着剤・印刷インキ)",
          leadsTo: [],
          shortNote: "アセトンと並ぶ汎用ケトン溶剤。多くの樹脂・塗料を溶解、揮発性が適度。"
        }
      ],
      detectionReactions: [
        {
          reagent: "ヨウ素＋水酸化ナトリウム(ヨードホルム反応)",
          result: "positive",
          observation: "淡黄色沈殿(CHI₃)",
          significance: "CH₃-CO- 構造の存在",
          commonlyUsed: true,
          detail: "CH₃-CO-C₂H₅ は CH₃-CO- 構造をもつため陽性。\n\n判別: 同じ C₄H₈O の 3-メチル化ケトンや n-ブチルアルデヒドはどうか:\n  2-ブタノン: CH₃CO-C₂H₅ → 陽性\n  ブチルアルデヒド・イソブチルアルデヒド: CH₂-CHO → 陰性(CH₃ と CO の間に CH₂ がある)"
        },
        {
          reagent: "Tollens 試薬・Fehling 試薬",
          result: "negative",
          observation: "銀鏡や赤色沈殿は生じない",
          significance: "ケトン(アルデヒドではない)",
          commonlyUsed: true,
          detail: "ブチルアルデヒド類(陽性)vs 2-ブタノン(陰性)の判別に有効。同じ C₄H₈O でもカルボニルの位置で結果が劇的に異なる。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "butyraldehyde", note: "n-ブチルアルデヒド(CH₃CH₂CH₂CHO)。同じ C₄H₈O の官能基異性体(直鎖アルデヒド)。" },
          { molKey: null, note: "イソブチルアルデヒド((CH₃)₂CHCHO)。同じ C₄H₈O の構造異性体(分岐アルデヒド)。" },
          { molKey: null, note: "テトラヒドロフラン、メチルビニルケトン、シクロブタノール等も C₄H₈O の構造異性体。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "中央 sp² 炭素は C=O＋CH₃＋C₂H₅ で不斉ではない(C=O 結合が二重結合なので 4 種の置換基という条件を満たさない)。最も単純な非対称メチルケトン。アセトンと並ぶ汎用溶剤。"
    },

    pentanone2: {
      synthesisRoutes: [
        {
          id: "pentanone2_pentanol2_oxidation",
          name: "2-ペンタノールの酸化",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "2-ペンタノール", formula: "CH₃CH(OH)CH₂CH₂CH₃", molKey: null }],
            coReagents: [{ name: "酸化剤(K₂Cr₂O₇/H₂SO₄ など)", formula: "—", molKey: null }],
            catalyst: "",
            conditions: "加熱(還流)",
            products: [{ name: "2-ペンタノン", formula: "CH₃COCH₂CH₂CH₃", molKey: "pentanone2" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "2 級アルコールである 2-ペンタノールを酸化、メチルケトン構造の 2-ペンタノンを得る。",
          detail: "CH₃CH(OH)CH₂CH₂CH₃ + [O] → CH₃COCH₂CH₂CH₃ + H₂O\n\n2 級アルコール → ケトンの典型的酸化。工業的には少量だが、香料・溶剤として用いられる。",
          sources: ["Wikipedia: 2-ペンタノン"]
        }
      ],
      downstream: [
        {
          name: "還元による 2-ペンタノール",
          leadsTo: [],
          shortNote: "NaBH₄ や H₂/Ni でカルボニルを還元、2-ペンタノール(不斉炭素を生じるためラセミ体)に戻る。"
        }
      ],
      detectionReactions: [
        {
          reagent: "ヨウ素＋水酸化ナトリウム(ヨードホルム反応)",
          result: "positive",
          observation: "淡黄色沈殿(CHI₃)",
          significance: "CH₃-CO- 構造の存在を示す",
          commonlyUsed: true,
          detail: "3-ペンタノン(CH₃CH₂COCH₂CH₃、陰性)との判別で頻出。同じ C₅H₁₀O のペンタノン位置異性体だが、CH₃ が CO に直接結合しているか否かで結果が異なる:\n  2-ペンタノン: CH₃-CO-C₃H₇ → 陽性\n  3-ペンタノン: C₂H₅-CO-C₂H₅ → 陰性"
        },
        {
          reagent: "Tollens 試薬・Fehling 試薬",
          result: "negative",
          observation: "銀鏡や赤色沈殿は生じない",
          significance: "ケトン",
          commonlyUsed: true,
          detail: "ケトン全般の挙動。アルデヒドとの判別。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "3-ペンタノン(C₂H₅-CO-C₂H₅、対称ケトン、ヨードホルム陰性)。同じ C₅H₁₀O の位置異性体。判別の代表例。" },
          { molKey: null, note: "n-ペンタナール、2-メチルブタナール、3-メチルブタナール(イソバレルアルデヒド)など複数のアルデヒド異性体。" },
          { molKey: null, note: "テトラヒドロピラン、メチルテトラヒドロフラン等の環状エーテル異性体。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "C₅H₁₀O の鎖状ケトンの代表。不斉炭素なし。3-ペンタノンとの位置異性体ペアは「ヨードホルム反応で判別する」典型的構造決定問題。"
    },

    cyclohexanone: {
      synthesisRoutes: [
        {
          id: "cyclohexanone_cyclohexane_oxidation",
          name: "シクロヘキサンの空気酸化(KA-oil 法、工業的)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "シクロヘキサン", formula: "C₆H₁₂", molKey: "cyclohexane" }],
            coReagents: [{ name: "酸素", formula: "O₂", molKey: "oxygen" }],
            catalyst: "ナフテン酸コバルト・マンガン",
            conditions: "120〜180 °C、8〜15 気圧、低転化率(5%程度)で過酸化抑制",
            products: [
              { name: "シクロヘキサノン", formula: "C₆H₁₀O", molKey: "cyclohexanone" },
              { name: "シクロヘキサノール", formula: "C₆H₁₁OH", molKey: null }
            ],
            byProducts: [{ name: "水・酸副生成物", formula: "—", molKey: null }]
          },
          shortNote: "シクロヘキサンを空気酸化してシクロヘキサノールとシクロヘキサノンの混合物(KA 油)を得る。",
          detail: "KA-oil(Ketone-Alcohol oil)は、シクロヘキサノン(K)とシクロヘキサノール(A)の混合物。\n\n工業的にはこれをさらに脱水素してシクロヘキサノン主成分にし、ナイロン 6・ナイロン 66 の主原料として供給する。上流: ベンゼン → シクロヘキサン(H₂/Ni 還元)。",
          sources: ["Wikipedia: シクロヘキサノン", "Wikipedia: ナイロン"]
        },
        {
          id: "cyclohexanone_cyclohexanol_dehydrogenation",
          name: "シクロヘキサノールの脱水素(工業的)",
          type: "industrial",
          famous: false,
          equation: {
            reactants: [{ name: "シクロヘキサノール", formula: "C₆H₁₁OH", molKey: null }],
            coReagents: [],
            catalyst: "Cu 系触媒",
            conditions: "200〜400 °C、気相",
            products: [{ name: "シクロヘキサノン", formula: "C₆H₁₀O", molKey: "cyclohexanone" }],
            byProducts: [{ name: "水素", formula: "H₂", molKey: "hydrogen" }]
          },
          shortNote: "Cu 触媒下でシクロヘキサノールを脱水素、シクロヘキサノンを得る。",
          detail: "C₆H₁₁OH → C₆H₁₀O + H₂\n\n2 級アルコールの脱水素酸化の典型例。上流のフェノール水素化(フェノール→シクロヘキサノール)と組み合わせると、フェノール → シクロヘキサノン → ε-カプロラクタム → ナイロン 6 の経路となり、フェノール法ナイロン 6 製造の中核を成す。",
          sources: ["Wikipedia: シクロヘキサノン"]
        }
      ],
      downstream: [
        {
          name: "オキシム化→Beckmann 転位による ε-カプロラクタム(→ナイロン 6)",
          leadsTo: [],
          shortNote: "ヒドロキシルアミンでオキシム化後、濃硫酸で Beckmann 転位して 7 員環ラクタムへ。開環重合でナイロン 6。"
        },
        {
          name: "酸化分解によるアジピン酸(→ナイロン 66)",
          leadsTo: [],
          shortNote: "硝酸または空気酸化(V/Cu 触媒)で環が酸化的に切断され、アジピン酸を生成。ヘキサメチレンジアミンと縮合してナイロン 66 へ。"
        },
        {
          name: "還元によるシクロヘキサノール",
          leadsTo: [],
          shortNote: "NaBH₄ や H₂/Ni で還元、シクロヘキサノールに戻る(不斉炭素はないため光学異性体は生じない)。"
        }
      ],
      detectionReactions: [
        {
          reagent: "ヨウ素＋水酸化ナトリウム(ヨードホルム反応)",
          result: "negative",
          observation: "ヨードホルムは生じない",
          significance: "CH₃-CO- 構造をもたない(環状ケトンで CH₃ がカルボニルに直結していない)",
          commonlyUsed: true,
          detail: "シクロヘキサノンはカルボニル C の両隣が CH₂ で、CH₃ が直結していない。アセトン・2-ブタノン等のメチルケトン(陽性)との対比例。"
        },
        {
          reagent: "Tollens 試薬・Fehling 試薬",
          result: "negative",
          observation: "銀鏡や赤色沈殿は生じない",
          significance: "ケトン",
          commonlyUsed: true,
          detail: "ケトン全般の挙動。"
        },
        {
          reagent: "嗅覚",
          result: "positive",
          observation: "ペパーミント様または刺激的なケトン臭",
          significance: "シクロヘキサノン特有",
          commonlyUsed: false,
          detail: "工業塗料・接着剤の溶剤として身近な香り。bp 156 °C で揮発性は中程度。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "シクロペンチル基をもつアルデヒド類縁体や、開鎖型 C6 ケトン(2-ヘキサノン、3-ヘキサノン)も同じ C₆H₁₀O の構造異性体。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: [
          { name: "椅子型(chair)", stability: "最安定配座。シクロヘキサノンの主構造。C=O が sp² のため環は完全な椅子ではなく、わずかにフラットになる。" },
          { name: "舟型(boat)", stability: "椅子型より約 27 kJ/mol 高エネルギーで不安定。" }
        ]
      },
      stereochemistryDetail: "シクロヘキサン環の椅子型を骨格にもつ環状ケトン。C=O が sp² のため環は完全な椅子ではなくやや扁平。ナイロン 6・ナイロン 66 の共通中間体として工業的に最重要なケトンの一つ。不斉炭素なし。"
    },

    // ── バッチ 19: カルボン酸 ─────────────────────────────

    formicAcid: {
      synthesisRoutes: [
        {
          id: "formicAcid_co_naoh",
          name: "一酸化炭素と水酸化ナトリウムからの工業合成",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "一酸化炭素", formula: "CO", molKey: null }],
            coReagents: [
              { name: "水酸化ナトリウム", formula: "NaOH", molKey: "sodiumHydroxide" },
              { name: "希硫酸(酸性化)", formula: "H₂SO₄", molKey: null }
            ],
            catalyst: "",
            conditions: "(1) NaOH 水溶液、約 130 °C、6〜8 気圧 → ギ酸ナトリウム (2) 希 H₂SO₄ で酸性化",
            products: [{ name: "ギ酸", formula: "HCOOH", molKey: "formicAcid" }],
            byProducts: [{ name: "硫酸ナトリウム水素塩", formula: "NaHSO₄", molKey: null }]
          },
          shortNote: "CO を加圧下で NaOH に吸収させてギ酸ナトリウムとし、酸処理でギ酸を遊離させる。",
          detail: "(1) CO + NaOH → HCOONa\n(2) 2 HCOONa + H₂SO₄ → 2 HCOOH + Na₂SO₄\n\n古くからの工業合成法。現代ではメタノールカルボニル化(CH₃OH + CO → HCOOCH₃)→加水分解 によるルートも併用される。ギ酸の用途は革なめし、抗菌剤、家畜飼料の保存。",
          sources: ["Wikipedia: ギ酸"]
        }
      ],
      downstream: [
        {
          name: "脱水によるカルボニル発生(実験室での CO 源)",
          leadsTo: [],
          shortNote: "濃硫酸で脱水すると HCOOH → CO + H₂O となり、純粋な一酸化炭素を発生させられる。"
        },
        {
          name: "金属表面処理・革なめし",
          leadsTo: [],
          shortNote: "穏やかな酸として、皮革のなめし・染色助剤・繊維助剤に広く利用。"
        }
      ],
      detectionReactions: [
        {
          reagent: "Tollens 試薬(アンモニア性 AgNO₃)",
          result: "positive",
          observation: "銀鏡反応",
          significance: "ギ酸はアルデヒド基を含む唯一のカルボン酸であることを示す",
          commonlyUsed: true,
          detail: "HCOOH の構造 H-C(=O)-OH は分子内に H-CHO(アルデヒド)部分を含むため、還元性をもち Tollens 反応陽性となる。\n\n他のカルボン酸(酢酸・プロピオン酸など)は Tollens 陰性であり、ギ酸特有の挙動として高校化学で頻出。"
        },
        {
          reagent: "Fehling 試薬",
          result: "positive",
          observation: "赤色沈殿(Cu₂O)",
          significance: "アルデヒド基の還元性",
          commonlyUsed: true,
          detail: "Tollens と同じく、ギ酸特有の還元性を示す。他のカルボン酸との判別で決定的。"
        },
        {
          reagent: "NaHCO₃ 水溶液",
          result: "positive",
          observation: "CO₂ を発泡しながら溶解",
          significance: "カルボン酸であることを示す(pKa ≈ 3.75)",
          commonlyUsed: true,
          detail: "カルボン酸全般の標準反応。ギ酸はカルボン酸の中でも比較的強酸(酢酸 pKa 4.76 より強い)。"
        },
        {
          reagent: "濃硫酸(脱水)",
          result: "positive",
          observation: "CO ガスが発生",
          significance: "ギ酸特有の脱水反応",
          commonlyUsed: false,
          detail: "HCOOH → CO + H₂O(濃硫酸触媒、加熱)。\n\n他のカルボン酸では起こらない反応で、実験室で CO を発生させる際に利用される。"
        }
      ],
      isomersDetail: {
        structural: [],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "最も小さいカルボン酸で、構造的にカルボン酸＋アルデヒドの両方の性質をもつユニークな化合物。平面分子で不斉炭素なし。アリ・ハチの毒成分(語源は formica = アリ)として知られる。"
    },

    aceticAcid: {
      synthesisRoutes: [
        {
          id: "aceticAcid_monsanto",
          name: "Monsanto/Cativa 法(メタノールのカルボニル化、工業的・現代主流)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "メタノール", formula: "CH₃OH", molKey: "methanol" }],
            coReagents: [{ name: "一酸化炭素", formula: "CO", molKey: null }],
            catalyst: "ロジウム錯体(Monsanto)またはイリジウム錯体(Cativa)+ ヨウ化メチル助触媒",
            conditions: "150〜200 °C、30〜60 気圧",
            products: [{ name: "酢酸", formula: "CH₃COOH", molKey: "aceticAcid" }],
            byProducts: []
          },
          shortNote: "メタノールに一酸化炭素を Rh/Ir 触媒下で挿入、酢酸を直接合成。世界の酢酸生産の主流。",
          detail: "CH₃OH + CO → CH₃COOH\n\n1970 年に Monsanto が Rh 触媒で工業化、1995 年に BP(旧 Cativa 法)が Ir 触媒で改良。原子経済性 100% の理想的反応で、世界の酢酸生産の 70% 以上がこの経路。現代では合成ガス(CO + H₂ from natural gas)由来のメタノールから酢酸まで一気通貫で生産可能。",
          sources: ["Wikipedia: 酢酸", "Wikipedia: モンサント法"]
        },
        {
          id: "aceticAcid_acetaldehyde_oxidation",
          name: "アセトアルデヒドの酸化",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "アセトアルデヒド", formula: "CH₃CHO", molKey: "acetaldehyde" }],
            coReagents: [{ name: "酸素", formula: "O₂", molKey: "oxygen" }],
            catalyst: "Mn(II) または Co(II) 塩",
            conditions: "60〜80 °C、空気または酸素加圧",
            products: [{ name: "酢酸", formula: "CH₃COOH", molKey: "aceticAcid" }],
            byProducts: []
          },
          shortNote: "アセトアルデヒドを Mn 塩触媒下で空気酸化、酢酸を得る。Monsanto 法以前の主流工業法。",
          detail: "CH₃CHO + 1/2 O₂ → CH₃COOH\n\nアセトアルデヒドの工業的供給が Wacker 法から Monsanto 法に移行するに伴い、酢酸製造もメタノールカルボニル化に置き換えられた。教科書ではエタノール → アセトアルデヒド → 酢酸 の段階酸化として頻出。",
          sources: ["Wikipedia: 酢酸"]
        },
        {
          id: "aceticAcid_fermentation",
          name: "酢酸発酵(食品工業)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "エタノール", formula: "C₂H₅OH", molKey: "ethanol" }],
            coReagents: [{ name: "酸素", formula: "O₂", molKey: "oxygen" }],
            catalyst: "酢酸菌(Acetobacter)の酵素群",
            conditions: "20〜30 °C、好気性、希エタノール水溶液",
            products: [{ name: "酢酸", formula: "CH₃COOH", molKey: "aceticAcid" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "エタノールを酢酸菌で好気発酵させて酢を製造する古来の方法。",
          detail: "C₂H₅OH + O₂ → CH₃COOH + H₂O\n\nワイン・酒類が空気で「酸っぱくなる」現象の正体。食酢(米酢・ワインビネガー・モルトビネガー)の製造原理。工業酢酸ではなく食品用に用いられる。",
          sources: ["Wikipedia: 酢酸"]
        }
      ],
      downstream: [
        {
          name: "酢酸エチル(フィッシャーエステル化)",
          leadsTo: ["ethylAcetate"],
          shortNote: "エタノールと濃硫酸触媒下で加熱、果実様の香りの溶剤エステル酢酸エチルへ。"
        },
        {
          name: "無水酢酸",
          leadsTo: [],
          shortNote: "酢酸を脱水(または工業的にはケテン経由)して無水酢酸を生成。アスピリン・酢酸セルロースの原料。"
        },
        {
          name: "酢酸ビニル → ポリ酢酸ビニル",
          leadsTo: [],
          shortNote: "アセチレンと反応するか、エチレン+酢酸+O₂(Wacker 系)で酢酸ビニル、重合してポリ酢酸ビニル(接着剤・チューインガム基材)。"
        }
      ],
      detectionReactions: [
        {
          reagent: "NaHCO₃ 水溶液",
          result: "positive",
          observation: "CO₂ を発泡しながら溶解",
          significance: "カルボン酸であることを示す(pKa ≈ 4.76)",
          commonlyUsed: true,
          detail: "カルボン酸全般の標準反応。フェノール(陰性)との判別で頻出。"
        },
        {
          reagent: "Tollens・Fehling 試薬",
          result: "negative",
          observation: "銀鏡や赤色沈殿は生じない",
          significance: "アルデヒドではないことを示す(ギ酸との判別)",
          commonlyUsed: true,
          detail: "ギ酸(陽性)vs 酢酸(陰性)の判別の決め手。酢酸は分子内にアルデヒド構造を含まないため還元性なし。"
        },
        {
          reagent: "嗅覚",
          result: "positive",
          observation: "酢の刺激的な香り",
          significance: "酢酸特有",
          commonlyUsed: false,
          detail: "純品(氷酢酸)は刺激臭が強く、希釈液は食酢の香り。bp 118 °C で揮発性は低め、mp 16.6 °C で冬期は凍る(「氷酢酸」の名の由来)。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "ギ酸メチル(HCOOCH₃)。同じ C₂H₄O₂ の構造異性体(エステル)。" },
          { molKey: null, note: "グリコールアルデヒド(HOCH₂CHO)。同じ C₂H₄O₂ の異性体だがやや不安定。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "最も身近なカルボン酸で、食酢の主成分。カルボン酸の代表として多くの反応の出発物質となる。固体・液体ともに二量体(環状水素結合)を作る。不斉炭素なし。"
    },

    propionicAcid: {
      synthesisRoutes: [
        {
          id: "propionicAcid_reppe",
          name: "エチレンのヒドロカルボニル化(Reppe 反応、工業的)",
          type: "industrial",
          famous: false,
          equation: {
            reactants: [{ name: "エチレン", formula: "C₂H₄", molKey: "ethene" }],
            coReagents: [
              { name: "一酸化炭素", formula: "CO", molKey: null },
              { name: "水", formula: "H₂O", molKey: "water" }
            ],
            catalyst: "Ni(CO)₄ または Ni 触媒、現代は Rh 触媒",
            conditions: "200〜300 °C、加圧",
            products: [{ name: "プロピオン酸", formula: "CH₃CH₂COOH", molKey: "propionicAcid" }],
            byProducts: []
          },
          shortNote: "エチレン+CO+水を金属カルボニル触媒下で反応、プロピオン酸を直接得る。",
          detail: "C₂H₄ + CO + H₂O → CH₃CH₂COOH\n\nReppe 化学(W. Reppe による高圧アセチレン・オレフィン化学体系)の代表反応。工業的に有用な脂肪酸合成法だが、需要規模で酢酸より小さい。",
          sources: ["Wikipedia: プロピオン酸"]
        },
        {
          id: "propionicAcid_propanal_oxidation",
          name: "プロパナールの酸化",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "プロパナール", formula: "CH₃CH₂CHO", molKey: "propionaldehyde" }],
            coReagents: [{ name: "酸化剤(KMnO₄ や K₂Cr₂O₇ など)", formula: "—", molKey: null }],
            catalyst: "",
            conditions: "酸性または中性、加熱",
            products: [{ name: "プロピオン酸", formula: "CH₃CH₂COOH", molKey: "propionicAcid" }],
            byProducts: []
          },
          shortNote: "プロパナールの酸化でプロピオン酸を得る。アルデヒド→カルボン酸の典型例。",
          detail: "CH₃CH₂CHO + [O] → CH₃CH₂COOH\n\n同様に 1-プロパノール → プロパナール → プロピオン酸 の 2 段酸化でも得られる。",
          sources: ["Wikipedia: プロピオン酸"]
        }
      ],
      downstream: [
        {
          name: "食品保存料(プロピオン酸塩)",
          leadsTo: [],
          shortNote: "Ca・Na・K 塩はパン・チーズのカビ発生防止剤として広く食品添加物として使用される。"
        },
        {
          name: "プロピオン酸エステル(果実香)",
          leadsTo: ["methylPropionate"],
          shortNote: "メタノール・エタノール等とエステル化、果実様の香りをもつエステルを与える。"
        }
      ],
      detectionReactions: [
        {
          reagent: "NaHCO₃ 水溶液",
          result: "positive",
          observation: "CO₂ を発泡しながら溶解",
          significance: "カルボン酸(pKa ≈ 4.87)",
          commonlyUsed: true,
          detail: "カルボン酸全般。"
        },
        {
          reagent: "Tollens・Fehling 試薬",
          result: "negative",
          observation: "銀鏡や赤色沈殿は生じない",
          significance: "アルデヒドではない",
          commonlyUsed: false,
          detail: "ギ酸(陽性)との判別ポイント。"
        },
        {
          reagent: "嗅覚",
          result: "positive",
          observation: "酢酸より強い刺激的な脂肪酸臭",
          significance: "プロピオン酸特有",
          commonlyUsed: false,
          detail: "甘酸っぱい刺激臭。汗・チーズ風味の構成成分。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "methylAcetate", note: "酢酸メチル(CH₃COOCH₃)。同じ C₃H₆O₂ の構造異性体(エステル)。" },
          { molKey: null, note: "ギ酸エチル(HCOOC₂H₅)。同じ C₃H₆O₂ の構造異性体(エステル)。" },
          { molKey: null, note: "ヒドロキシアセトン(HOCH₂COCH₃)等のヒドロキシケトン異性体も C₃H₆O₂。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "C3 直鎖カルボン酸。不斉炭素なし。酢酸メチル・ギ酸エチルとの 3 つ巴の構造異性体は構造決定問題で頻出。"
    },

    butyricAcid: {
      synthesisRoutes: [
        {
          id: "butyricAcid_butanal_oxidation",
          name: "ブチルアルデヒドの酸化",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "ブチルアルデヒド", formula: "CH₃CH₂CH₂CHO", molKey: "butyraldehyde" }],
            coReagents: [{ name: "酸素", formula: "O₂", molKey: "oxygen" }],
            catalyst: "Mn・Co 塩などの金属塩",
            conditions: "60〜80 °C、液相",
            products: [{ name: "酪酸", formula: "CH₃CH₂CH₂COOH", molKey: "butyricAcid" }],
            byProducts: []
          },
          shortNote: "オキソ法由来のブチルアルデヒドを空気酸化して酪酸を得る工業的経路。",
          detail: "CH₃CH₂CH₂CHO + 1/2 O₂ → CH₃CH₂CH₂COOH\n\n上流: プロペン + CO + H₂ → ブチルアルデヒド(Rh 触媒オキソ法)。工業的にはこの 2 段経路が主流。",
          sources: ["Wikipedia: 酪酸"]
        },
        {
          id: "butyricAcid_fermentation",
          name: "酪酸発酵(Clostridium butyricum)",
          type: "lab",
          famous: false,
          equation: {
            reactants: [{ name: "デンプン・糖類", formula: "—", molKey: null }],
            coReagents: [],
            catalyst: "Clostridium butyricum(嫌気性細菌)",
            conditions: "30〜37 °C、嫌気",
            products: [{ name: "酪酸", formula: "CH₃CH₂CH₂COOH", molKey: "butyricAcid" }],
            byProducts: [
              { name: "二酸化炭素", formula: "CO₂", molKey: "carbonDioxide" },
              { name: "水素", formula: "H₂", molKey: "hydrogen" }
            ]
          },
          shortNote: "嫌気性細菌が糖を発酵して酪酸を生成する古典的経路。",
          detail: "腸内発酵でも生じ、ヒトの腸内細菌叢から短鎖脂肪酸(酪酸・酢酸・プロピオン酸)が日常的に産生される。\n\n古いバターのにおいは酪酸の遊離による。工業的供給は前述のブチルアルデヒド酸化が主流。",
          sources: ["Wikipedia: 酪酸"]
        }
      ],
      downstream: [
        {
          name: "エステル化(酪酸エチル・酪酸メチル、果実香)",
          leadsTo: ["ethylButyrate", "methylButyrate"],
          shortNote: "アルコールとのエステル化で果実エステル類を生成(パイナップル・アンズ・リンゴ様の香り)。香料として広く使われる。"
        }
      ],
      detectionReactions: [
        {
          reagent: "NaHCO₃ 水溶液",
          result: "positive",
          observation: "CO₂ を発泡しながら溶解",
          significance: "カルボン酸(pKa ≈ 4.83)",
          commonlyUsed: true,
          detail: "カルボン酸全般。"
        },
        {
          reagent: "嗅覚",
          result: "positive",
          observation: "腐ったバター・汗・ヤギ脂のような強烈な悪臭",
          significance: "酪酸特有",
          commonlyUsed: true,
          detail: "C4〜C6 の中鎖脂肪酸は特に悪臭が強い。「酪酸 = ヤギ脂・腐敗バター」は教科書でも記述される特徴的な物性。\n\n銀杏(イチョウ)の実の悪臭の主因(酪酸＋ヘキサン酸)。嘔吐物・古い汗の臭いの構成成分。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "イソ酪酸((CH₃)₂CHCOOH、2-メチルプロパン酸)。同じ C₄H₈O₂ の構造異性体。" },
          { molKey: "ethylAcetate", note: "酢酸エチル(CH₃COOC₂H₅)。同じ C₄H₈O₂ のエステル異性体。" },
          { molKey: "methylPropionate", note: "プロピオン酸メチル(C₂H₅COOCH₃)。同じ C₄H₈O₂ のエステル異性体。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "C4 直鎖カルボン酸。不斉炭素なし。同じ C₄H₈O₂ のエステル類(酢酸エチル・プロピオン酸メチル・蟻酸プロピル)と並ぶ官能基異性体ペアとして教科書頻出。"
    },

    oxalicAcid: {
      synthesisRoutes: [
        {
          id: "oxalicAcid_sodium_formate",
          name: "ギ酸ナトリウムの脱水素縮合(工業的)",
          type: "industrial",
          famous: false,
          equation: {
            reactants: [{ name: "ギ酸ナトリウム", formula: "HCOONa", molKey: null, count: 2 }],
            coReagents: [{ name: "硫酸(酸性化)", formula: "H₂SO₄", molKey: null }],
            catalyst: "",
            conditions: "(1) 360〜400 °C で加熱(脱水素縮合)→ シュウ酸ナトリウム (2) H₂SO₄ で酸性化",
            products: [{ name: "シュウ酸", formula: "(COOH)₂", molKey: "oxalicAcid" }],
            byProducts: [
              { name: "水素", formula: "H₂", molKey: "hydrogen" },
              { name: "硫酸ナトリウム", formula: "Na₂SO₄", molKey: null }
            ]
          },
          shortNote: "ギ酸ナトリウムを高温で脱水素縮合してシュウ酸ナトリウムとし、酸処理でシュウ酸を遊離。",
          detail: "(1) 2 HCOONa → (COONa)₂ + H₂(脱水素縮合)\n(2) (COONa)₂ + H₂SO₄ → (COOH)₂ + Na₂SO₄\n\n古典的な工業合成。現代では炭水化物の硝酸酸化(→ シュウ酸)も並行して使われる。シュウ酸の用途は漂白剤、染色助剤、革なめし、希土類抽出。",
          sources: ["Wikipedia: シュウ酸"]
        },
        {
          id: "oxalicAcid_ethyleneglycol_oxidation",
          name: "エチレングリコールの硝酸酸化",
          type: "industrial",
          famous: false,
          equation: {
            reactants: [{ name: "エチレングリコール", formula: "HOCH₂CH₂OH", molKey: "ethyleneGlycol" }],
            coReagents: [{ name: "硝酸", formula: "HNO₃", molKey: null }],
            catalyst: "V₂O₅ 等",
            conditions: "60〜80 °C、希硝酸",
            products: [{ name: "シュウ酸", formula: "(COOH)₂", molKey: "oxalicAcid" }],
            byProducts: [{ name: "窒素酸化物", formula: "NOₓ", molKey: null }]
          },
          shortNote: "エチレングリコールの両端 OH を硝酸で COOH まで酸化、シュウ酸を得る。",
          detail: "HOCH₂CH₂OH → (COOH)₂\n\n1 級アルコール 2 つを完全酸化する工業法。多数の中間体(グリコール酸、グリオキシル酸等)を経由するが、最終的にシュウ酸が得られる。",
          sources: ["Wikipedia: シュウ酸"]
        }
      ],
      downstream: [
        {
          name: "KMnO₄ 滴定の標準試薬",
          leadsTo: [],
          shortNote: "希硫酸中で KMnO₄ を還元する標準的な還元剤。KMnO₄ の濃度標定に使われる古典的容量分析。"
        },
        {
          name: "Ca 塩(CaC₂O₄)",
          leadsTo: [],
          shortNote: "Ca 塩は水に難溶で、腎結石の主成分として医学的に重要。ホウレンソウ等の野菜の渋み成分でもある。"
        },
        {
          name: "脱炭酸→ギ酸→CO₂",
          leadsTo: ["formicAcid"],
          shortNote: "強加熱や濃硫酸下で段階的に脱炭酸し、ギ酸を経て CO₂ と CO に分解。"
        }
      ],
      detectionReactions: [
        {
          reagent: "NaHCO₃ 水溶液",
          result: "positive",
          observation: "CO₂ を激しく発泡(2 段階分の H⁺)",
          significance: "ジカルボン酸(しかも強酸)であることを示す",
          commonlyUsed: true,
          detail: "シュウ酸は最も強いカルボン酸の一つ(pKa₁ ≈ 1.27、pKa₂ ≈ 4.27)。NaHCO₃ と速やかに反応する。"
        },
        {
          reagent: "KMnO₄(硫酸酸性、加熱)",
          result: "positive",
          observation: "赤紫色が脱色(Mn(II) になる)、CO₂ ガス発生",
          significance: "強い還元性を示す",
          commonlyUsed: true,
          detail: "5 (COOH)₂ + 2 KMnO₄ + 3 H₂SO₄ → 10 CO₂↑ + 2 MnSO₄ + K₂SO₄ + 8 H₂O\n\nKMnO₄ を 2 電子×2 = 4 電子で還元。反応速度は Mn(II) の自己触媒作用で加速されるため、最初はゆっくり、後半で急激に脱色する特徴的な挙動。"
        },
        {
          reagent: "Ca²⁺ 水溶液(CaCl₂ など)",
          result: "positive",
          observation: "白色沈殿(CaC₂O₄・H₂O)",
          significance: "シュウ酸イオンの検出",
          commonlyUsed: false,
          detail: "シュウ酸カルシウムは水・希酸に難溶。腎結石の主成分(ヒトの代謝で生じるシュウ酸が Ca と結合)。"
        }
      ],
      isomersDetail: {
        structural: [],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "最も小さいジカルボン酸で、2 つの COOH が直接結合した平面分子。不斉炭素なし。\n\n強酸性(pKa₁ が低い)は両端 COOH が互いに電子吸引するため。ホウレンソウ等の野菜(特に葉物)に含まれ、Ca 塩(結石)として体外排出される。"
    },

    // ── バッチ 20: エステル① ─────────────────────────────

    ethylAcetate: {
      synthesisRoutes: [
        {
          id: "ethylAcetate_esterification",
          name: "酢酸とエタノールの Fischer エステル化",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "酢酸", formula: "CH₃COOH", molKey: "aceticAcid" }],
            coReagents: [{ name: "エタノール", formula: "C₂H₅OH", molKey: "ethanol" }],
            catalyst: "濃硫酸",
            conditions: "加熱還流",
            products: [{ name: "酢酸エチル", formula: "CH₃COOC₂H₅", molKey: "ethylAcetate" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "酢酸とエタノールを濃硫酸触媒下で加熱、エステル化により果実様の香りの酢酸エチルを得る。",
          detail: "CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O\n\nFischer エステル化の最も典型的な例。可逆反応のため、エタノール過剰または水除去で平衡を生成側に寄せる。機構: プロトン化されたカルボン酸 C=OH⁺ にアルコール O が求核攻撃 → 四面体中間体 → 水脱離 → エステル。工業的には酢酸エチルは溶剤・接着剤・印刷インキ等に大量使用。",
          sources: ["Wikipedia: 酢酸エチル", "高校化学 各社教科書"]
        }
      ],
      downstream: [
        {
          name: "加水分解による酢酸とエタノール",
          leadsTo: ["aceticAcid", "ethanol"],
          shortNote: "酸または塩基触媒の加水分解で酢酸とエタノールに戻る。塩基条件は不可逆(けん化)。"
        },
        {
          name: "塗料・接着剤・マニキュア除光液の溶剤",
          leadsTo: [],
          shortNote: "極性が中程度で揮発性が適度なため、多くの樹脂を溶解する汎用エステル溶剤として大量に使われる。"
        }
      ],
      detectionReactions: [
        {
          reagent: "NaHCO₃ 水溶液",
          result: "negative",
          observation: "CO₂ を発生しない",
          significance: "遊離 COOH をもたない(エステル化されている)",
          commonlyUsed: true,
          detail: "酢酸(陽性)vs 酢酸エチル(陰性)の判別。エステル化反応の進行確認に使う。"
        },
        {
          reagent: "嗅覚",
          result: "positive",
          observation: "果実様(リンゴ・洋梨様)の甘い香り",
          significance: "酢酸エチル特有",
          commonlyUsed: false,
          detail: "教科書実験では「エステル化の確認」として香りで判定する。マニキュア除光液の主成分の一つ。"
        },
        {
          reagent: "NaOH(けん化)",
          result: "positive",
          observation: "加熱で酢酸ナトリウムとエタノールに加水分解",
          significance: "エステルであることを示す",
          commonlyUsed: false,
          detail: "CH₃COOC₂H₅ + NaOH → CH₃COONa + C₂H₅OH(不可逆けん化)。\n\n生成したエタノールはヨードホルム反応陽性、酢酸 Na は中性で識別可能。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "butyricAcid", note: "酪酸(CH₃CH₂CH₂COOH)。同じ C₄H₈O₂ の官能基異性体(カルボン酸、NaHCO₃ 陽性)。" },
          { molKey: null, note: "イソ酪酸((CH₃)₂CHCOOH)。同じ C₄H₈O₂ のカルボン酸異性体。" },
          { molKey: "methylPropionate", note: "プロピオン酸メチル(C₂H₅COOCH₃)。同じ C₄H₈O₂ のエステル異性体。" },
          { molKey: null, note: "蟻酸プロピル(HCOOC₃H₇)。同じ C₄H₈O₂ のエステル異性体。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "C₄H₈O₂ のエステル代表。同じ分子式のカルボン酸(酪酸・イソ酪酸)・エステル(プロピオン酸メチル・蟻酸プロピル)と並ぶ官能基/位置異性体群は、構造決定問題で頻出。NaHCO₃ 反応で官能基を識別。"
    },

    methylAcetate: {
      synthesisRoutes: [
        {
          id: "methylAcetate_esterification",
          name: "酢酸とメタノールの Fischer エステル化",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "酢酸", formula: "CH₃COOH", molKey: "aceticAcid" }],
            coReagents: [{ name: "メタノール", formula: "CH₃OH", molKey: "methanol" }],
            catalyst: "濃硫酸",
            conditions: "加熱還流",
            products: [{ name: "酢酸メチル", formula: "CH₃COOCH₃", molKey: "methylAcetate" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "酢酸とメタノールを濃硫酸触媒下で加熱、最も小さい酢酸エステルを得る。",
          detail: "CH₃COOH + CH₃OH ⇌ CH₃COOCH₃ + H₂O\n\n最も小さい酢酸エステル。bp 57 °C の揮発性液体。工業的には Eastman Chemical 社が酢酸の代替原料として大規模合成(→ Eastman 酢酸法では酢酸メチルから無水酢酸を作り、CO カルボニル化で酢酸を再生する経路)。",
          sources: ["Wikipedia: 酢酸メチル"]
        }
      ],
      downstream: [
        {
          name: "加水分解による酢酸とメタノール",
          leadsTo: ["aceticAcid", "methanol"],
          shortNote: "酸または塩基触媒の加水分解で酢酸とメタノールに戻る。"
        }
      ],
      detectionReactions: [
        {
          reagent: "NaHCO₃ 水溶液",
          result: "negative",
          observation: "CO₂ を発生しない",
          significance: "遊離 COOH をもたない(エステル)",
          commonlyUsed: true,
          detail: "プロピオン酸(陽性、同じ C₃H₆O₂)との判別ポイント。"
        },
        {
          reagent: "嗅覚",
          result: "positive",
          observation: "甘くフルーティな香り",
          significance: "酢酸メチル特有",
          commonlyUsed: false,
          detail: "リンゴ・パイナップル様の香り。模型用接着剤の溶剤としても使われる。"
        },
        {
          reagent: "NaOH(けん化)",
          result: "positive",
          observation: "酢酸ナトリウムとメタノールに加水分解",
          significance: "エステル",
          commonlyUsed: false,
          detail: "けん化生成物のメタノールはヨードホルム陰性、エタノールから来た酢酸エチル(陽性)と判別できる。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "propionicAcid", note: "プロピオン酸(CH₃CH₂COOH)。同じ C₃H₆O₂ の官能基異性体(カルボン酸、NaHCO₃ 陽性)。" },
          { molKey: null, note: "ギ酸エチル(HCOOC₂H₅)。同じ C₃H₆O₂ のエステル異性体(けん化でギ酸+エタノール、Tollens 陽性のギ酸を与える)。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "最も小さい酢酸エステル。同じ C₃H₆O₂ のギ酸エチルとの対比は、けん化生成物のギ酸が Tollens 陽性となることで判別できる教科書的問題。"
    },

    propylAcetate: {
      synthesisRoutes: [
        {
          id: "propylAcetate_esterification",
          name: "酢酸と 1-プロパノールの Fischer エステル化",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "酢酸", formula: "CH₃COOH", molKey: "aceticAcid" }],
            coReagents: [{ name: "1-プロパノール", formula: "CH₃CH₂CH₂OH", molKey: "propanol1" }],
            catalyst: "濃硫酸",
            conditions: "加熱還流",
            products: [{ name: "酢酸プロピル", formula: "CH₃COOCH₂CH₂CH₃", molKey: "propylAcetate" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "酢酸と 1-プロパノールのエステル化、梨・洋梨様の果実香をもつエステルを得る。",
          detail: "CH₃COOH + CH₃CH₂CH₂OH ⇌ CH₃COOC₃H₇ + H₂O\n\n梨・洋梨様の特徴的な香りで、合成果実フレーバーや化粧品香料に利用。塗料・印刷インキの中極性溶剤としても使われる。",
          sources: ["Wikipedia: 酢酸プロピル"]
        }
      ],
      downstream: [
        {
          name: "加水分解による酢酸と 1-プロパノール",
          leadsTo: ["aceticAcid", "propanol1"],
          shortNote: "酸または塩基触媒の加水分解で酢酸と 1-プロパノールに戻る。"
        }
      ],
      detectionReactions: [
        {
          reagent: "NaHCO₃ 水溶液",
          result: "negative",
          observation: "CO₂ を発生しない",
          significance: "エステル(COOH なし)",
          commonlyUsed: true,
          detail: "カルボン酸(陽性)との判別。"
        },
        {
          reagent: "嗅覚",
          result: "positive",
          observation: "梨・洋梨様の果実香",
          significance: "酢酸プロピル特有",
          commonlyUsed: false,
          detail: "梨・アンズ様の合成香料として広く使われる。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "酢酸イソプロピル(CH₃COOCH(CH₃)₂)。同じ C₅H₁₀O₂ の構造異性体(イソプロピル基)。" },
          { molKey: "methylButyrate", note: "酪酸メチル(CH₃CH₂CH₂COOCH₃)。同じ C₅H₁₀O₂ のエステル異性体。" },
          { molKey: null, note: "プロピオン酸エチル(C₂H₅COOC₂H₅)、蟻酸ブチル(HCOOC₄H₉)など多数のエステル異性体。" },
          { molKey: null, note: "n-/iso-/sec-/tert-ペンタン酸(バレリン酸類)等の C₅H₁₀O₂ カルボン酸異性体。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "C₅H₁₀O₂ のエステル代表の一つ。多数の構造異性体が存在し、香りで識別することが多い(梨様 = 酢酸プロピル、リンゴ様 = 酪酸メチル等)。不斉炭素なし。"
    },

    isoamylAcetate: {
      synthesisRoutes: [
        {
          id: "isoamylAcetate_esterification",
          name: "酢酸とイソアミルアルコールの Fischer エステル化",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "酢酸", formula: "CH₃COOH", molKey: "aceticAcid" }],
            coReagents: [{ name: "イソアミルアルコール(3-メチル-1-ブタノール)", formula: "(CH₃)₂CHCH₂CH₂OH", molKey: null }],
            catalyst: "濃硫酸",
            conditions: "加熱還流",
            products: [{ name: "酢酸イソアミル", formula: "CH₃COOCH₂CH₂CH(CH₃)₂", molKey: "isoamylAcetate" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "酢酸とイソアミルアルコールのエステル化、強烈なバナナ香をもつエステルを得る。",
          detail: "CH₃COOH + (CH₃)₂CHCH₂CH₂OH ⇌ CH₃COOCH₂CH₂CH(CH₃)₂ + H₂O\n\n「バナナエッセンス」として食品香料・人工フルーツフレーバーの代表。ハチミツのような甘い果実香で、教科書実験の「香りの強いエステル合成」として頻出。ミツバチの警報フェロモンの構成成分でもあり、巣を脅かす者を攻撃する合図となる。",
          sources: ["Wikipedia: 酢酸イソアミル", "高校化学 各社教科書"]
        }
      ],
      downstream: [
        {
          name: "加水分解による酢酸とイソアミルアルコール",
          leadsTo: ["aceticAcid"],
          shortNote: "酸または塩基触媒の加水分解で原料に戻る。"
        },
        {
          name: "食品香料・化粧品香料",
          leadsTo: [],
          shortNote: "「バナナエッセンス」「梨エッセンス」として人工フルーツフレーバー・キャンディ・ガム等に幅広く使用。"
        }
      ],
      detectionReactions: [
        {
          reagent: "嗅覚",
          result: "positive",
          observation: "強烈なバナナ・洋梨様の甘い香り",
          significance: "酢酸イソアミル特有",
          commonlyUsed: true,
          detail: "「化学のバナナの香り」として教科書実験の代表例。少量でも極めて強い香りで、エステル合成の確認に最適な化合物。"
        },
        {
          reagent: "NaHCO₃ 水溶液",
          result: "negative",
          observation: "CO₂ を発生しない",
          significance: "エステル",
          commonlyUsed: false,
          detail: "エステル全般。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "酢酸 n-アミル(CH₃COOCH₂CH₂CH₂CH₂CH₃)、酢酸 sec-アミル など。同じ C₇H₁₄O₂ の構造異性体。香りが微妙に異なる。" },
          { molKey: null, note: "酪酸プロピル、プロピオン酸ブチル など多数の C₇H₁₄O₂ エステル異性体。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "イソアミル(3-メチルブチル)基をもつエステル。不斉炭素なし。バナナ香として最もよく知られた合成香料エステルの一つ。多くの果実・蜂蜜の天然成分でもある。"
    },

    methylPropionate: {
      synthesisRoutes: [
        {
          id: "methylPropionate_esterification",
          name: "プロピオン酸とメタノールの Fischer エステル化",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "プロピオン酸", formula: "C₂H₅COOH", molKey: "propionicAcid" }],
            coReagents: [{ name: "メタノール", formula: "CH₃OH", molKey: "methanol" }],
            catalyst: "濃硫酸",
            conditions: "加熱還流",
            products: [{ name: "プロピオン酸メチル", formula: "C₂H₅COOCH₃", molKey: "methylPropionate" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "プロピオン酸とメタノールのエステル化、ラム酒・パイナップル様の香りのエステルを得る。",
          detail: "C₂H₅COOH + CH₃OH ⇌ C₂H₅COOCH₃ + H₂O\n\nbp 80 °C の揮発性液体で、ラム酒・パイナップル様の甘い香り。香料、塗料溶剤として用いられる。教科書では同じ C₄H₈O₂ 分子式のエステル/カルボン酸群(酢酸エチル・酪酸・蟻酸プロピル等)の構造異性体問題で頻出。",
          sources: ["Wikipedia: プロピオン酸メチル"]
        }
      ],
      downstream: [
        {
          name: "加水分解によるプロピオン酸とメタノール",
          leadsTo: ["propionicAcid", "methanol"],
          shortNote: "酸または塩基触媒の加水分解でプロピオン酸とメタノールに戻る。"
        }
      ],
      detectionReactions: [
        {
          reagent: "NaHCO₃ 水溶液",
          result: "negative",
          observation: "CO₂ を発生しない",
          significance: "エステル",
          commonlyUsed: true,
          detail: "酪酸(陽性、同じ C₄H₈O₂ のカルボン酸異性体)との判別ポイント。"
        },
        {
          reagent: "NaOH(けん化)",
          result: "positive",
          observation: "プロピオン酸ナトリウムとメタノールに加水分解",
          significance: "けん化生成物のアルコールとカルボン酸で構造を確定できる",
          commonlyUsed: true,
          detail: "けん化で得られるアルコール(メタノール)はヨードホルム陰性、酢酸エチル(けん化でエタノール → ヨードホルム陽性)との判別ポイント。\n\n同じ C₄H₈O₂ のエステル異性体間でも、けん化生成物のアルコールの種類で識別できる。"
        },
        {
          reagent: "嗅覚",
          result: "positive",
          observation: "ラム酒・パイナップル様の甘い香り",
          significance: "プロピオン酸メチル特有",
          commonlyUsed: false,
          detail: "甘く果実的な香り。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "ethylAcetate", note: "酢酸エチル(CH₃COOC₂H₅)。同じ C₄H₈O₂ のエステル異性体(けん化生成物が異なる)。" },
          { molKey: null, note: "蟻酸プロピル(HCOOC₃H₇)。同じ C₄H₈O₂ のエステル異性体(けん化でギ酸が出るため Tollens 陽性)。" },
          { molKey: "butyricAcid", note: "酪酸(CH₃CH₂CH₂COOH)。同じ C₄H₈O₂ のカルボン酸異性体(NaHCO₃ 陽性)。" },
          { molKey: null, note: "イソ酪酸((CH₃)₂CHCOOH)。同じ C₄H₈O₂ のカルボン酸異性体。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "C₄H₈O₂ 異性体群の中の一つのエステル。けん化生成物(アルコール側がメタノール、カルボン酸側がプロピオン酸)で 4 つの C₄H₈O₂ エステル異性体(酢酸エチル・プロピオン酸メチル・蟻酸プロピル・蟻酸イソプロピル)を識別する古典問題で頻出。不斉炭素なし。"
    },

    // ── バッチ 21: エステル② ─────────────────────────────

    methylButyrate: {
      synthesisRoutes: [
        {
          id: "methylButyrate_esterification",
          name: "酪酸とメタノールの Fischer エステル化",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "酪酸", formula: "CH₃CH₂CH₂COOH", molKey: "butyricAcid" }],
            coReagents: [{ name: "メタノール", formula: "CH₃OH", molKey: "methanol" }],
            catalyst: "濃硫酸",
            conditions: "加熱還流",
            products: [{ name: "酪酸メチル", formula: "CH₃CH₂CH₂COOCH₃", molKey: "methylButyrate" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "酪酸とメタノールのエステル化、リンゴ様の果実香をもつエステルを得る。",
          detail: "CH₃CH₂CH₂COOH + CH₃OH ⇌ CH₃CH₂CH₂COOCH₃ + H₂O\n\n強烈な悪臭をもつ酪酸が、エステル化で甘いリンゴ様の香りに大きく変わる対比的な例。パイナップル・リンゴの香り成分として天然にも存在し、合成果実フレーバーに広く利用。bp 102 °C の揮発性液体。",
          sources: ["Wikipedia: 酪酸メチル"]
        }
      ],
      downstream: [
        {
          name: "加水分解による酪酸とメタノール",
          leadsTo: ["butyricAcid", "methanol"],
          shortNote: "酸または塩基触媒の加水分解で酪酸とメタノールに戻る。"
        },
        {
          name: "食品香料・化粧品",
          leadsTo: [],
          shortNote: "リンゴ・パイナップル等の合成フルーツフレーバー、菓子類の香料として使用。"
        }
      ],
      detectionReactions: [
        {
          reagent: "NaHCO₃ 水溶液",
          result: "negative",
          observation: "CO₂ を発生しない",
          significance: "エステル(COOH なし)",
          commonlyUsed: true,
          detail: "酪酸(陽性)vs 酪酸メチル(陰性)の判別。「臭いカルボン酸が香りの良いエステルになる」対比例として教科書頻出。"
        },
        {
          reagent: "嗅覚",
          result: "positive",
          observation: "リンゴ・パイナップル様の甘い香り",
          significance: "酪酸メチル特有",
          commonlyUsed: false,
          detail: "原料の酪酸(腐敗バター臭)とは正反対の魅力的な香り。エステル化反応の劇的な変化を示す代表例。"
        },
        {
          reagent: "NaOH(けん化)",
          result: "positive",
          observation: "酪酸ナトリウム(強い腐敗臭の基)とメタノールに加水分解",
          significance: "エステル",
          commonlyUsed: false,
          detail: "けん化で原料の悪臭が戻ってくるため、エステル/カルボン酸の関係を香りで体感できる教科書的実験。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "propylAcetate", note: "酢酸プロピル(CH₃COOC₃H₇)。同じ C₅H₁₀O₂ のエステル異性体(けん化で酢酸+1-プロパノール)。" },
          { molKey: null, note: "酢酸イソプロピル、プロピオン酸エチル、蟻酸ブチル など同じ C₅H₁₀O₂ のエステル異性体。" },
          { molKey: null, note: "n-/iso-/sec-/tert-ペンタン酸(バレリン酸類)等の C₅H₁₀O₂ カルボン酸異性体。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "C₅H₁₀O₂ のエステル異性体の一つ。けん化生成物のアルコール(メタノール)とカルボン酸(酪酸)で 4 つの C₅H₁₀O₂ エステル異性体を識別できる構造決定問題で出題される。不斉炭素なし。"
    },

    ethylButyrate: {
      synthesisRoutes: [
        {
          id: "ethylButyrate_esterification",
          name: "酪酸とエタノールの Fischer エステル化",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "酪酸", formula: "CH₃CH₂CH₂COOH", molKey: "butyricAcid" }],
            coReagents: [{ name: "エタノール", formula: "C₂H₅OH", molKey: "ethanol" }],
            catalyst: "濃硫酸",
            conditions: "加熱還流",
            products: [{ name: "酪酸エチル", formula: "CH₃CH₂CH₂COOC₂H₅", molKey: "ethylButyrate" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "酪酸とエタノールのエステル化、パイナップル・アンズ様の濃厚な果実香をもつエステルを得る。",
          detail: "CH₃CH₂CH₂COOH + C₂H₅OH ⇌ CH₃CH₂CH₂COOC₂H₅ + H₂O\n\n「パイナップルエッセンス」として食品香料に使用される代表的エステル。天然にもパイナップル・アンズ・苺等の果実に含まれる重要香気成分。bp 121 °C の揮発性液体で、酢酸イソアミル(バナナ香)と並ぶ「教科書実験の香り強いエステル」の双璧。",
          sources: ["Wikipedia: 酪酸エチル", "高校化学 各社教科書"]
        }
      ],
      downstream: [
        {
          name: "加水分解による酪酸とエタノール",
          leadsTo: ["butyricAcid", "ethanol"],
          shortNote: "酸または塩基触媒の加水分解で酪酸とエタノールに戻る。"
        },
        {
          name: "食品香料・化粧品",
          leadsTo: [],
          shortNote: "パイナップル・アンズ・苺の合成フルーツフレーバー、ジュース・菓子・酒類の香料として広く使用。"
        }
      ],
      detectionReactions: [
        {
          reagent: "嗅覚",
          result: "positive",
          observation: "強いパイナップル・アンズ様の甘い果実香",
          significance: "酪酸エチル特有",
          commonlyUsed: true,
          detail: "「パイナップルの香り」として教科書実験の代表例。酢酸イソアミル(バナナ)と並ぶ強い香りのエステルで、エステル合成の確認に最適。"
        },
        {
          reagent: "NaHCO₃ 水溶液",
          result: "negative",
          observation: "CO₂ を発生しない",
          significance: "エステル",
          commonlyUsed: true,
          detail: "エステル全般。"
        },
        {
          reagent: "NaOH(けん化)",
          result: "positive",
          observation: "酪酸ナトリウム(腐敗臭)とエタノール(ヨードホルム陽性)に加水分解",
          significance: "酪酸メチルとの判別にけん化生成物が使える",
          commonlyUsed: false,
          detail: "けん化生成エタノールはヨードホルム陽性(酪酸メチルから来るメタノールは陰性)。けん化生成物の挙動でエステル間の判別可能。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "プロピオン酸プロピル(C₂H₅COOC₃H₇)、酢酸ブチル(CH₃COOC₄H₉)、蟻酸ペンチル(HCOOC₅H₁₁)など同じ C₆H₁₂O₂ のエステル異性体多数。" },
          { molKey: null, note: "n-ヘキサン酸(カプロン酸)、各種メチル分岐ペンタン酸など C₆H₁₂O₂ カルボン酸異性体。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "C₆H₁₂O₂ のエステル異性体の一つ。多数の構造異性体が存在するが、けん化生成物の組合せ(酪酸 + エタノール)で同定できる。不斉炭素なし。香りで識別できる「パイナップルエステル」として最もよく知られる合成エステルの一つ。"
    },

    // ── バッチ 22: アミン+アミド ──────────────────────────

    methylamine: {
      synthesisRoutes: [
        {
          id: "methylamine_methanol_ammonia",
          name: "メタノールとアンモニアの反応(工業的)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "メタノール", formula: "CH₃OH", molKey: "methanol" }],
            coReagents: [{ name: "アンモニア", formula: "NH₃", molKey: "ammonia" }],
            catalyst: "Al₂O₃/SiO₂ 等の固体酸触媒",
            conditions: "350〜500 °C、加圧、気相",
            products: [{ name: "メチルアミン", formula: "CH₃NH₂", molKey: "methylamine" }],
            byProducts: [
              { name: "ジメチルアミン", formula: "(CH₃)₂NH", molKey: "dimethylamine" },
              { name: "トリメチルアミン", formula: "(CH₃)₃N", molKey: "trimethylamine" },
              { name: "水", formula: "H₂O", molKey: "water" }
            ]
          },
          shortNote: "メタノールとアンモニアを固体酸触媒下で反応、3 種のメチルアミン類が併産される。",
          detail: "CH₃OH + NH₃ → CH₃NH₂ + H₂O(モノ)\n2 CH₃OH + NH₃ → (CH₃)₂NH + 2 H₂O(ジ)\n3 CH₃OH + NH₃ → (CH₃)₃N + 3 H₂O(トリ)\n\nアンモニアの 3 個の H が順次メチル化される段階反応で、生成物 1〜3 体は熱力学平衡に従って共存する。製品 1 体の比率は反応条件(NH₃/CH₃OH 比、温度)で制御し、3 種を分留分離。工業的にメチルアミン類の主要供給法。",
          sources: ["Wikipedia: メチルアミン"]
        }
      ],
      downstream: [
        {
          name: "医薬品・農薬中間体",
          leadsTo: [],
          shortNote: "カフェイン、エフェドリン類、殺虫剤カルバリル等の合成に出発物質として使用。"
        },
        {
          name: "界面活性剤・染料",
          leadsTo: [],
          shortNote: "メチル化アミン誘導体は界面活性剤・染料中間体として広く利用。"
        }
      ],
      detectionReactions: [
        {
          reagent: "湿った赤色リトマス紙",
          result: "positive",
          observation: "青変する",
          significance: "塩基性(弱塩基)であることを示す",
          commonlyUsed: true,
          detail: "メチルアミンの pKb ≈ 3.36(共役酸の pKa ≈ 10.6)でアンモニア(pKb ≈ 4.75)より塩基性がやや強い。アルキル基の電子供与効果により N の塩基性が高まる。"
        },
        {
          reagent: "HCl(気体・水溶液)",
          result: "positive",
          observation: "白煙(塩化メチルアンモニウムの微結晶)",
          significance: "塩基性アミンであることを示す",
          commonlyUsed: true,
          detail: "CH₃NH₂ + HCl → CH₃NH₃Cl\n\n気体同士で出会うと白煙となるアンモニア類の典型反応。アニリン・脂肪族アミン全般に共通。"
        },
        {
          reagent: "嗅覚",
          result: "positive",
          observation: "強いアンモニア様＋魚臭の刺激臭",
          significance: "メチルアミン特有",
          commonlyUsed: false,
          detail: "腐魚臭の主原因物質の一つ。気体(bp −6 °C)で常温では気体だが、水溶液(モノメチルアミン水溶液)として流通。"
        }
      ],
      isomersDetail: {
        structural: [],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "最も小さい第一級アミン。N は sp³ で 4 つの位置(CH₃、H、H、孤立電子対)をもつが、孤立電子対と 2 つの H により非対称ではない(傘反転で平均化される)。不斉炭素なし。"
    },

    ethylamine: {
      synthesisRoutes: [
        {
          id: "ethylamine_ethanol_ammonia",
          name: "エタノールとアンモニアの反応(工業的)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "エタノール", formula: "C₂H₅OH", molKey: "ethanol" }],
            coReagents: [{ name: "アンモニア", formula: "NH₃", molKey: "ammonia" }],
            catalyst: "Al₂O₃/SiO₂ 等の固体酸触媒",
            conditions: "150〜250 °C、加圧、気相",
            products: [{ name: "エチルアミン", formula: "C₂H₅NH₂", molKey: "ethylamine" }],
            byProducts: [
              { name: "ジエチルアミン・トリエチルアミン", formula: "—", molKey: null },
              { name: "水", formula: "H₂O", molKey: "water" }
            ]
          },
          shortNote: "エタノールとアンモニアを固体酸触媒下で反応、エチル化アミン類が併産される。",
          detail: "C₂H₅OH + NH₃ → C₂H₅NH₂ + H₂O\n\nメチルアミンと同様、3 種のエチルアミン(モノ・ジ・トリ)が併産される段階反応。条件で 1 体比率を制御し、分留分離。",
          sources: ["Wikipedia: エチルアミン"]
        },
        {
          id: "ethylamine_acetonitrile_reduction",
          name: "アセトニトリルの還元",
          type: "lab",
          famous: false,
          equation: {
            reactants: [{ name: "アセトニトリル", formula: "CH₃CN", molKey: null }],
            coReagents: [{ name: "水素", formula: "H₂", molKey: "hydrogen", count: 2 }],
            catalyst: "Ni、Pt、または Pd",
            conditions: "加圧、加熱",
            products: [{ name: "エチルアミン", formula: "C₂H₅NH₂", molKey: "ethylamine" }],
            byProducts: []
          },
          shortNote: "アセトニトリル(CN 三重結合)を金属触媒下で水素化還元、エチルアミンを得る。",
          detail: "CH₃CN + 2 H₂ → C₂H₅NH₂\n\nニトリルの水素化は対応する 1 級アミンを与える典型例。ナイロン合成の中間体としても重要な経路。",
          sources: ["Wikipedia: エチルアミン"]
        }
      ],
      downstream: [
        {
          name: "農薬・医薬品中間体",
          leadsTo: [],
          shortNote: "除草剤アトラジン、医薬品(チオフィリン等)の合成中間体。"
        }
      ],
      detectionReactions: [
        {
          reagent: "湿った赤色リトマス紙",
          result: "positive",
          observation: "青変する",
          significance: "塩基性アミン",
          commonlyUsed: true,
          detail: "pKa(共役酸)≈ 10.8 でメチルアミンと近い塩基性。"
        },
        {
          reagent: "HCl 気体",
          result: "positive",
          observation: "白煙(エチルアンモニウム塩)",
          significance: "塩基性アミン",
          commonlyUsed: true,
          detail: "C₂H₅NH₂ + HCl → C₂H₅NH₃Cl。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "dimethylamine", note: "ジメチルアミン((CH₃)₂NH、2 級アミン)。同じ C₂H₇N の構造異性体(級数の異なるアミン)。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "1 級アミンの代表例。不斉炭素なし。同じ C₂H₇N のジメチルアミン(2 級)との構造異性は、アミンの級数を識別する例として教科書頻出。"
    },

    dimethylamine: {
      synthesisRoutes: [
        {
          id: "dimethylamine_methanol_ammonia",
          name: "メタノールとアンモニアの反応(工業的・主流体)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "メタノール", formula: "CH₃OH", molKey: "methanol", count: 2 }],
            coReagents: [{ name: "アンモニア", formula: "NH₃", molKey: "ammonia" }],
            catalyst: "Al₂O₃/SiO₂",
            conditions: "350〜500 °C、メタノール過剰",
            products: [{ name: "ジメチルアミン", formula: "(CH₃)₂NH", molKey: "dimethylamine" }],
            byProducts: [
              { name: "モノメチルアミン・トリメチルアミン", formula: "—", molKey: null },
              { name: "水", formula: "H₂O", molKey: "water" }
            ]
          },
          shortNote: "メタノール+アンモニア反応の 2 体(ジメチル化)生成物。3 種混合物から分留分離する。",
          detail: "2 CH₃OH + NH₃ → (CH₃)₂NH + 2 H₂O\n\nメチルアミン類製造の段階反応で 1〜3 体が同時生成。ジメチルアミンはジメチルホルムアミド(DMF)原料として最も需要が大きい。",
          sources: ["Wikipedia: ジメチルアミン"]
        }
      ],
      downstream: [
        {
          name: "DMF(ジメチルホルムアミド)合成",
          leadsTo: [],
          shortNote: "蟻酸とのアミド化、または CO とのカルボニル化で DMF(極性非プロトン溶媒の代表)へ。"
        },
        {
          name: "界面活性剤・洗浄剤・農薬",
          leadsTo: [],
          shortNote: "アルキルジメチルアンモニウム塩は陽イオン界面活性剤(柔軟剤・殺菌剤)として広く使用。"
        }
      ],
      detectionReactions: [
        {
          reagent: "湿った赤色リトマス紙",
          result: "positive",
          observation: "青変する",
          significance: "塩基性アミン(pKa 共役酸 ≈ 10.7)",
          commonlyUsed: true,
          detail: "1 級・2 級・3 級アミンは水中ではほぼ同じ強さの塩基(pKa 10〜11)として振る舞う。"
        },
        {
          reagent: "HCl",
          result: "positive",
          observation: "白煙(ジメチルアンモニウム塩)",
          significance: "塩基性",
          commonlyUsed: true,
          detail: "(CH₃)₂NH + HCl → (CH₃)₂NH₂Cl。"
        },
        {
          reagent: "嗅覚",
          result: "positive",
          observation: "強い魚臭・腐敗臭",
          significance: "ジメチルアミン特有",
          commonlyUsed: false,
          detail: "腐敗した魚介類で生成し、海産物の鮮度の指標として使われる。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "ethylamine", note: "エチルアミン(C₂H₅NH₂、1 級アミン)。同じ C₂H₇N の構造異性体(級数の異なるアミン)。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "最も小さい 2 級アミン。N に CH₃ × 2 と H が結合。エチルアミン(1 級、同じ C₂H₇N)との構造異性は、アミンの級数判別問題で頻出。不斉炭素なし。"
    },

    trimethylamine: {
      synthesisRoutes: [
        {
          id: "trimethylamine_methanol_ammonia",
          name: "メタノールとアンモニアの反応(工業的・3 体)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "メタノール", formula: "CH₃OH", molKey: "methanol", count: 3 }],
            coReagents: [{ name: "アンモニア", formula: "NH₃", molKey: "ammonia" }],
            catalyst: "Al₂O₃/SiO₂",
            conditions: "350〜500 °C、メタノール大過剰",
            products: [{ name: "トリメチルアミン", formula: "(CH₃)₃N", molKey: "trimethylamine" }],
            byProducts: [
              { name: "モノ・ジメチルアミン", formula: "—", molKey: null },
              { name: "水", formula: "H₂O", molKey: "water" }
            ]
          },
          shortNote: "メタノール+アンモニア反応の 3 体(トリメチル化)生成物。3 種混合物から分留分離する。",
          detail: "3 CH₃OH + NH₃ → (CH₃)₃N + 3 H₂O\n\nメタノール過剰条件で 3 体比率を増やせる。",
          sources: ["Wikipedia: トリメチルアミン"]
        }
      ],
      downstream: [
        {
          name: "コリン・ベタイン類の合成",
          leadsTo: [],
          shortNote: "エチレンオキシドと反応してコリン(神経伝達物質・卵黄レシチンの構成成分)を生成。"
        },
        {
          name: "第 4 級アンモニウム塩(陽イオン界面活性剤)",
          leadsTo: [],
          shortNote: "長鎖アルキルハライドと反応して第 4 級アンモニウム塩、消毒剤・柔軟剤として広く利用。"
        }
      ],
      detectionReactions: [
        {
          reagent: "湿った赤色リトマス紙",
          result: "positive",
          observation: "青変する",
          significance: "塩基性アミン",
          commonlyUsed: true,
          detail: "pKa 共役酸 ≈ 9.8 で 1 級・2 級アミンよりわずかに弱塩基(立体障害によって水和が弱まる)。"
        },
        {
          reagent: "嗅覚",
          result: "positive",
          observation: "強烈な腐敗魚臭",
          significance: "トリメチルアミン特有",
          commonlyUsed: true,
          detail: "腐敗魚臭の最大原因物質。新鮮な魚類のトリメチルアミンオキシド(TMAO)が、死後にバクテリアの還元作用で TMA に変化することで臭うようになる。魚の鮮度の指標として食品科学で重要。"
        },
        {
          reagent: "HCl",
          result: "positive",
          observation: "白煙(トリメチルアンモニウム塩)",
          significance: "塩基性",
          commonlyUsed: true,
          detail: "(CH₃)₃N + HCl → (CH₃)₃NHCl。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "n-プロピルアミン(C₃H₇NH₂、1 級)、イソプロピルアミン、メチルエチルアミン(2 級)。同じ C₃H₉N の構造異性体。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "最も小さい 3 級アミン。N に CH₃ × 3 が結合。アンモニアと似た三角錐構造で、N の傘反転が速い。不斉炭素なし。魚臭症(魚臭症候群、TMA 代謝異常)の原因物質としても医学的に知られる。"
    },

    acetamide: {
      synthesisRoutes: [
        {
          id: "acetamide_acetic_ammonia_dehydration",
          name: "酢酸とアンモニアの脱水(高温脱水)",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "酢酸", formula: "CH₃COOH", molKey: "aceticAcid" }],
            coReagents: [{ name: "アンモニア", formula: "NH₃", molKey: "ammonia" }],
            catalyst: "",
            conditions: "(1) NH₃ 中和で酢酸アンモニウム (2) 加熱(200 °C 程度)で脱水",
            products: [{ name: "アセトアミド", formula: "CH₃CONH₂", molKey: "acetamide" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "酢酸アンモニウムを高温で脱水、アセトアミドを得る古典的合成法。",
          detail: "(1) CH₃COOH + NH₃ → CH₃COONH₄\n(2) CH₃COONH₄ → CH₃CONH₂ + H₂O(加熱)\n\n酸とアミンの直接縮合は通常難しいが、酢酸アンモニウムから加熱で脱水するとアミドが得られる。工業的には塩化アセチル＋NH₃ や無水酢酸＋NH₃ の方が温和な条件で収率良く合成可能。",
          sources: ["Wikipedia: アセトアミド"]
        }
      ],
      downstream: [
        {
          name: "ホフマン分解によるメチルアミン",
          leadsTo: ["methylamine"],
          shortNote: "Br₂/NaOH で炭素を 1 つ減らした 1 級アミンを生成、CH₃CONH₂ → CH₃NH₂。"
        },
        {
          name: "加水分解による酢酸とアンモニア",
          leadsTo: ["aceticAcid"],
          shortNote: "希酸または希塩基で加水分解、酢酸とアンモニア(または酢酸塩+NH₃)に戻る。"
        },
        {
          name: "脱水によるアセトニトリル",
          leadsTo: [],
          shortNote: "P₂O₅ 等の脱水剤と加熱、CONH₂ → CN への脱水でアセトニトリルを得る。"
        }
      ],
      detectionReactions: [
        {
          reagent: "NaOH 水溶液(加熱)",
          result: "positive",
          observation: "アンモニア臭(NH₃ ガス)が発生",
          significance: "アミド結合の加水分解を示す",
          commonlyUsed: true,
          detail: "CH₃CONH₂ + NaOH → CH₃COONa + NH₃↑\n\nアミドの典型的検出反応。発生 NH₃ は湿った赤色リトマス紙を青変させる。"
        },
        {
          reagent: "塩酸(希)",
          result: "negative",
          observation: "溶けない",
          significance: "アミドはアミンと違いほぼ中性(極めて弱い塩基性)",
          commonlyUsed: false,
          detail: "メチルアミン(陽性、塩酸塩を作る)とアセトアミド(陰性)の判別ポイント。N の孤立電子対が C=O と共役するため塩基性が失われる。"
        },
        {
          reagent: "視認",
          result: "positive",
          observation: "白色結晶(mp 82 °C、わずかに吸湿性)",
          significance: "アセトアミド特有",
          commonlyUsed: false,
          detail: "水・エタノールに可溶、純粋なアセトアミドはほぼ無臭だが、酢酸不純物のため酢の刺激臭がすることがある。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "N-メチルホルムアミド(HCON(H)CH₃)。同じ C₂H₅NO の構造異性体(メチル位置が違うアミド)。" },
          { molKey: null, note: "アセトアルデヒドオキシム、グリコールニトリル等も C₂H₅NO 異性体(実用的には少ない)。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "最も小さいアミド(カルボキサミド)。アミド結合は部分二重結合性によりほぼ平面で、N-H と C=O は同一平面上にある。不斉炭素なし。アミド全般の代表的性質(塩基性低下・けん化で NH₃ 放出)の教科書例。"
    },

    // ── バッチ 24: 二糖+デンプン ──────────────────────────
    // (バッチ 23: アミノ酸+単糖 は未追加)

    sucrose: {
      synthesisRoutes: [
        {
          id: "sucrose_plant_extraction",
          name: "サトウキビ・サトウダイコンからの抽出(工業)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "サトウキビ汁またはビート汁", formula: "—", molKey: null }],
            coReagents: [],
            catalyst: "",
            conditions: "圧搾・抽出・清澄化・濃縮・結晶化",
            products: [{ name: "スクロース", formula: "C₁₂H₂₂O₁₁", molKey: "sucrose" }],
            byProducts: [{ name: "糖蜜(モラセス)", formula: "—", molKey: null }]
          },
          shortNote: "サトウキビまたはサトウダイコンから圧搾・結晶化して得る世界最大の精製糖。",
          detail: "植物の光合成産物として葉でつくられ、各組織に輸送される糖類。\n\n工業的精製: 圧搾汁 → 石灰処理(清澄化)→ 濾過 → 真空濃縮 → 結晶化 → 遠心分離\n\nα-D-グルコースと β-D-フルクトースが C1-C2 のグリコシド結合で連結(このため両単糖のアノマー炭素が結合に使われ、遊離アノマー OH がなく非還元糖となる)。",
          sources: ["Wikipedia: スクロース", "高校化学 各社教科書"]
        }
      ],
      downstream: [
        {
          name: "加水分解(インバート糖)",
          leadsTo: ["glucose", "fructose"],
          shortNote: "希酸またはインベルターゼ(酵素)でグリコシド結合を切断、グルコース＋フルクトース(転化糖)を等モルで得る。"
        },
        {
          name: "発酵によるエタノール",
          leadsTo: ["ethanol"],
          shortNote: "酵母が分泌するインベルターゼで加水分解された後、グルコース・フルクトースがエタノールに発酵される。蒸留酒(ラム等)の原料。"
        }
      ],
      detectionReactions: [
        {
          reagent: "Fehling 試薬",
          result: "negative",
          observation: "赤色沈殿が生じない(青色のまま)",
          significance: "非還元糖であることを示す(唯一の主要な非還元二糖)",
          commonlyUsed: true,
          detail: "「Fehling 陰性の二糖 = スクロース」は高校化学で最も有名な糖の判別。\n\nグルコースの C1 とフルクトースの C2 が両方のアノマー炭素で結合しているため、両糖とも鎖状型に開かず還元性を示さない。マルトース・ラクトース等(陽性)との決定的違い。"
        },
        {
          reagent: "Tollens 試薬",
          result: "negative",
          observation: "銀鏡反応を示さない",
          significance: "非還元糖",
          commonlyUsed: true,
          detail: "Fehling と同じ理由で陰性。"
        },
        {
          reagent: "希酸で加水分解 → Fehling",
          result: "positive",
          observation: "加水分解後は Fehling 陽性(生成したグルコース・フルクトースが還元性を示す)",
          significance: "二糖の構造を間接的に確認",
          commonlyUsed: true,
          detail: "スクロースを希酸で加熱加水分解後、生成糖は両方とも還元糖となる。「加水分解前 陰性 → 加水分解後 陽性」で「もとは非還元糖(スクロース)」と判定できる。"
        },
        {
          reagent: "旋光度測定(加水分解前後)",
          result: "positive",
          observation: "スクロース水溶液(+66.5°、右旋)→ 加水分解後(−20°、左旋)への「転化」",
          significance: "「転化糖(インバートシュガー)」の名の由来",
          commonlyUsed: false,
          detail: "加水分解でグルコース(+52.7°)+フルクトース(−92°)の混合物となり、強い左旋性のフルクトースが優位で全体が左旋になる。歴史的な「転化(インバート)」の語源。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "maltose", note: "マルトース(同じ C₁₂H₂₂O₁₁、α-1,4 グリコシド結合の還元性二糖)。" },
          { molKey: "lactose", note: "ラクトース(同じ C₁₂H₂₂O₁₁、β-1,4 結合)。" },
          { molKey: "cellobiose", note: "セロビオース(同じ C₁₂H₂₂O₁₁、β-1,4 結合)。" },
          { molKey: null, note: "トレハロース(α,α-1,1 結合、非還元糖の例外的例)。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: true, rs: "多数の不斉炭素(グルコース 4 個＋フルクトース 3 個)", note: "両単糖の不斉炭素のすべてが保たれ、複雑な立体構造をとる。" },
        conformers: []
      },
      stereochemistryDetail: "唯一の主要な非還元二糖として教科書頻出。\n\nグルコース C1(α-アノマー OH)+ フルクトース C2(β-アノマー OH)の両方が結合に使われている。このためいかなる単糖もアノマー OH が遊離せず、変旋光も還元性も示さない。加水分解後は両単糖とも還元糖として陽性となる「条件付き還元糖」。"
    },

    maltose: {
      synthesisRoutes: [
        {
          id: "maltose_starch_partial_hydrolysis",
          name: "デンプンの部分加水分解(β-アミラーゼ作用)",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "デンプン", formula: "(C₆H₁₀O₅)ₙ", molKey: "starch" }],
            coReagents: [{ name: "水", formula: "H₂O", molKey: "water" }],
            catalyst: "β-アミラーゼ(麦芽中)または希酸",
            conditions: "60〜70 °C、酵素的または弱酸性",
            products: [{ name: "マルトース", formula: "C₁₂H₂₂O₁₁", molKey: "maltose" }],
            byProducts: []
          },
          shortNote: "デンプンを β-アミラーゼで部分加水分解、二糖単位で切断してマルトースを得る。",
          detail: "(C₆H₁₀O₅)ₙ + n/2 H₂O → n/2 C₁₂H₂₂O₁₁\n\n麦芽(発芽した大麦)に含まれる β-アミラーゼが、デンプン非還元末端からマルトース単位で切断する。水あめ(麦芽糖シロップ)の主成分。ビール醸造のマッシング工程でも生成される。2 つの α-D-グルコースが α-1,4 グリコシド結合で連結した還元性二糖。",
          sources: ["Wikipedia: マルトース", "高校化学 各社教科書"]
        }
      ],
      downstream: [
        {
          name: "完全加水分解によるグルコース",
          leadsTo: ["glucose"],
          shortNote: "希酸またはマルターゼ(酵素)でグリコシド結合を切断、グルコース 2 分子を得る。"
        },
        {
          name: "発酵によるエタノール",
          leadsTo: ["ethanol"],
          shortNote: "酵母が分泌するマルターゼで加水分解されたあと、グルコースがエタノール発酵される。ビール醸造の基本反応。"
        }
      ],
      detectionReactions: [
        {
          reagent: "Fehling 試薬",
          result: "positive",
          observation: "赤色沈殿(Cu₂O)",
          significance: "還元性二糖",
          commonlyUsed: true,
          detail: "片方のグルコース単位の C1 アノマー OH が遊離しているため、鎖状型アルデヒドに開いて還元性を示す。マルトース・ラクトース・セロビオースは陽性、スクロースは陰性。"
        },
        {
          reagent: "Tollens 試薬",
          result: "positive",
          observation: "銀鏡反応",
          significance: "還元性二糖",
          commonlyUsed: true,
          detail: "Fehling と同じ機構。"
        },
        {
          reagent: "希酸加水分解",
          result: "positive",
          observation: "グルコースのみが得られる(フルクトース・ガラクトースは検出されない)",
          significance: "マルトースの構成糖を確認",
          commonlyUsed: true,
          detail: "ラクトース(→ ガラクトース＋グルコース)との判別ポイント。加水分解後の単糖を Tollens・Cu(OH)₂ 等で同定する。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "cellobiose", note: "セロビオース(同じ C₁₂H₂₂O₁₁、β-1,4 結合)。立体配置のみマルトースと異なる。" },
          { molKey: "sucrose", note: "スクロース(非還元糖)。" },
          { molKey: "lactose", note: "ラクトース。" },
          { molKey: null, note: "イソマルトース(α-1,6 結合)、トレハロース(α,α-1,1 結合)等。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: true, rs: "多数の不斉炭素", note: "2 つのグルコース単位の不斉炭素＋アノマー C1 も α/β の異性。水中では α/β 平衡。" },
        conformers: []
      },
      stereochemistryDetail: "α-1,4 グリコシド結合の二糖。デンプン由来の還元二糖として、ビール・甘味料の中で身近。\n\n片方の C1 アノマー OH が遊離しているため、α/β アノマー間で変旋光を示し、還元性糖として振る舞う。同じ C₁₂H₂₂O₁₁ のセロビオースとは結合の立体(α vs β)のみが違う。"
    },

    cellobiose: {
      synthesisRoutes: [
        {
          id: "cellobiose_cellulose_partial_hydrolysis",
          name: "セルロースの部分加水分解",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "セルロース", formula: "(C₆H₁₀O₅)ₙ", molKey: "cellulose" }],
            coReagents: [{ name: "水", formula: "H₂O", molKey: "water" }],
            catalyst: "セルラーゼ(酵素)または希酸",
            conditions: "酵素的または穏やかな酸条件",
            products: [{ name: "セロビオース", formula: "C₁₂H₂₂O₁₁", molKey: "cellobiose" }],
            byProducts: []
          },
          shortNote: "セルロースを部分加水分解、二糖単位で切断してセロビオースを得る。",
          detail: "(C₆H₁₀O₅)ₙ + n/2 H₂O → n/2 C₁₂H₂₂O₁₁\n\nセルロースの主鎖を β-1,4 結合を保ったまま二糖単位で切断したもの。2 つの β-D-グルコースが β-1,4 結合した還元性二糖。マルトースとは結合の立体配置(α vs β)が違うだけだが、ヒトのマルターゼでは分解できず、セロビアーゼ(細菌・キノコの酵素)が必要。これがセルロース消化困難性の起源。",
          sources: ["Wikipedia: セロビオース"]
        }
      ],
      downstream: [
        {
          name: "完全加水分解によるグルコース",
          leadsTo: ["glucose"],
          shortNote: "セロビアーゼまたは希酸で完全加水分解、β-D-グルコース 2 分子を得る。"
        }
      ],
      detectionReactions: [
        {
          reagent: "Fehling 試薬",
          result: "positive",
          observation: "赤色沈殿(Cu₂O)",
          significance: "還元性二糖",
          commonlyUsed: true,
          detail: "片方のグルコース単位の C1 が遊離(α/β 平衡)のため還元糖。マルトースと同じ機構で陽性。"
        },
        {
          reagent: "Tollens 試薬",
          result: "positive",
          observation: "銀鏡反応",
          significance: "還元性二糖",
          commonlyUsed: true,
          detail: "Fehling と同じ。"
        },
        {
          reagent: "希酸加水分解",
          result: "positive",
          observation: "グルコースのみが得られる",
          significance: "セロビオースの構成糖",
          commonlyUsed: true,
          detail: "マルトースと同じくグルコース 2 分子に分解されるため、加水分解単糖だけからはマルトースと区別できない。結合の立体(β vs α)の違いを酵素や旋光度で識別する。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "maltose", note: "マルトース(同じ C₁₂H₂₂O₁₁、α-1,4 結合)。結合の立体だけが違う。" },
          { molKey: "lactose", note: "ラクトース(β-1,4 結合だがガラクトース+グルコース)。" },
          { molKey: "sucrose", note: "スクロース(非還元糖)。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: true, rs: "多数の不斉炭素", note: "C1 アノマー OH の α/β 平衡を含む。" },
        conformers: []
      },
      stereochemistryDetail: "β-1,4 グリコシド結合でセルロース由来。\n\nマルトースと結合立体だけが異なる「立体異性体」関係。β 結合はヒトの α-グルコシダーゼでは加水分解できないため、セルロースが食物繊維として消化されない原因となる。"
    },

    lactose: {
      synthesisRoutes: [
        {
          id: "lactose_milk_biosynthesis",
          name: "乳腺での生合成(牛乳・人乳から抽出)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [
              { name: "UDP-ガラクトース", formula: "—", molKey: null },
              { name: "グルコース", formula: "C₆H₁₂O₆", molKey: "glucose" }
            ],
            coReagents: [],
            catalyst: "ラクトース合成酵素(乳腺特異的)",
            conditions: "哺乳類乳腺、生体内",
            products: [{ name: "ラクトース", formula: "C₁₂H₂₂O₁₁", molKey: "lactose" }],
            byProducts: [{ name: "UDP", formula: "—", molKey: null }]
          },
          shortNote: "哺乳類の乳腺で UDP-ガラクトースとグルコースから生合成。ホエー(乳清)から精製。",
          detail: "ラクトースは哺乳類特有の糖で、牛乳に約 4.7%、人乳に約 7% 含まれる。\n\n工業的にはチーズ製造の副産物のホエー(乳清)から濃縮・結晶化して回収。β-D-ガラクトース＋α/β-D-グルコースが β-1,4 グリコシド結合で連結した還元性二糖。",
          sources: ["Wikipedia: ラクトース"]
        }
      ],
      downstream: [
        {
          name: "加水分解によるガラクトース＋グルコース",
          leadsTo: ["galactose", "glucose"],
          shortNote: "希酸またはラクターゼで加水分解、ガラクトースとグルコースを得る。乳糖不耐症はこの酵素活性低下が原因。"
        }
      ],
      detectionReactions: [
        {
          reagent: "Fehling 試薬",
          result: "positive",
          observation: "赤色沈殿(Cu₂O)",
          significance: "還元性二糖",
          commonlyUsed: true,
          detail: "グルコース側の C1 が遊離のため還元糖。"
        },
        {
          reagent: "Tollens 試薬",
          result: "positive",
          observation: "銀鏡反応",
          significance: "還元性二糖",
          commonlyUsed: true,
          detail: "Fehling と同じ機構。"
        },
        {
          reagent: "希酸加水分解 → ムコ酸試験",
          result: "positive",
          observation: "加水分解後にガラクトースの検出(ムコ酸結晶)",
          significance: "ラクトースとマルトースの判別",
          commonlyUsed: false,
          detail: "加水分解後に得られる単糖の組合せ:\n  マルトース → 2 グルコース(ムコ酸試験陰性)\n  ラクトース → ガラクトース + グルコース(ムコ酸試験で結晶析出、陽性)\n\nこの「加水分解→ガラクトース検出」がラクトース特有。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "maltose", note: "マルトース(同じ C₁₂H₂₂O₁₁、α-1,4 グルコース+グルコース)。" },
          { molKey: "cellobiose", note: "セロビオース(同じ C₁₂H₂₂O₁₁、β-1,4 グルコース+グルコース)。" },
          { molKey: "sucrose", note: "スクロース(非還元糖)。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: true, rs: "多数の不斉炭素", note: "ガラクトースの C4 配置(グルコースのエピマー)が反映される。" },
        conformers: []
      },
      stereochemistryDetail: "ガラクトース＋グルコースの二糖。哺乳類の母乳特有の糖。\n\n乳糖不耐症: 成人期にラクターゼ活性が低下する遺伝形質(東アジア人で多い)。\nガラクトース血症: 乳糖代謝経路の酵素欠損による先天性代謝異常。\n新生児栄養・医学的に最も重要な糖類の一つ。"
    },

    starch: {
      synthesisRoutes: [
        {
          id: "starch_photosynthesis",
          name: "植物の光合成・アミロプラストでの合成",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [
              { name: "二酸化炭素", formula: "CO₂", molKey: "carbonDioxide" },
              { name: "水", formula: "H₂O", molKey: "water" }
            ],
            coReagents: [],
            catalyst: "葉緑体・光合成酵素群、ADP-グルコース デンプン合成酵素",
            conditions: "光(クロロフィル)、植物体内",
            products: [{ name: "デンプン", formula: "(C₆H₁₀O₅)ₙ", molKey: "starch" }],
            byProducts: [{ name: "酸素", formula: "O₂", molKey: "oxygen" }]
          },
          shortNote: "植物の光合成で CO₂ と水からグルコースを作り、α-1,4 結合で重合してデンプンとして蓄える。",
          detail: "n CO₂ + n H₂O → (C₆H₁₀O₅)ₙ + n O₂(総合反応)\n\n直接の合成は ADP-グルコース → デンプン合成酵素。アミロース(α-1,4 直鎖)とアミロペクチン(α-1,4 主鎖＋α-1,6 分岐、約 20〜30 単位ごとに分岐)の混合物(通常アミロース 20〜30%、アミロペクチン 70〜80%)。米・小麦・トウモロコシ・じゃがいも等の主要炭水化物源。",
          sources: ["Wikipedia: デンプン", "高校化学 各社教科書"]
        }
      ],
      downstream: [
        {
          name: "酸/酵素による段階加水分解(デキストリン → マルトース → グルコース)",
          leadsTo: ["maltose", "glucose"],
          shortNote: "α-アミラーゼで主鎖をランダム切断(デキストリン)、β-アミラーゼで二糖単位切断(マルトース)、グルコアミラーゼで完全分解(グルコース)。"
        },
        {
          name: "発酵によるエタノール(アルコール発酵)",
          leadsTo: ["ethanol"],
          shortNote: "酵母が分泌する酵素で加水分解後、グルコースをエタノール発酵。日本酒・ウィスキー・ビールの原理。"
        }
      ],
      detectionReactions: [
        {
          reagent: "ヨウ素溶液(I₂/KI、ヨウ素デンプン反応)",
          result: "positive",
          observation: "アミロース部分は青紫色、アミロペクチン部分は赤紫色に呈色",
          significance: "デンプン特有の決定的検出反応",
          commonlyUsed: true,
          detail: "デンプンの代表的検出反応。\n\nアミロース(直鎖)はらせん(ヘリックス)構造をとり、その内部にヨウ素分子 I₂(または I₃⁻)が包接されて電子遷移エネルギーが可視光域となり呈色する。アミロペクチンの分岐部分は短いらせんしか作らないため呈色が弱く赤紫色になる。加熱するとらせんがほどけて色が消失し、冷却で再現する可逆呈色。"
        },
        {
          reagent: "Fehling 試薬",
          result: "negative",
          observation: "赤色沈殿が生じない",
          significance: "非還元性(鎖が長く、末端の還元基の比率が極めて低い)",
          commonlyUsed: true,
          detail: "理論上は鎖の還元末端(一端だけ)が還元性を示すが、分子量が大きいため還元末端の比率が極小で、実用的には陰性として扱う。\n\n加水分解で生じるマルトース・グルコースは陽性となる。"
        },
        {
          reagent: "希酸加水分解 → Fehling",
          result: "positive",
          observation: "加水分解後の生成物(マルトース・グルコース)が Fehling 陽性",
          significance: "デンプンの還元性糖前駆体",
          commonlyUsed: true,
          detail: "「ヨウ素陽性 → 加水分解 → Fehling 陽性」で「もとはデンプン」と判定できる教科書頻出の流れ。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "cellulose", note: "セルロース(同じ (C₆H₁₀O₅)ₙ だが β-1,4 結合)。立体配置のみがデンプンと違う巨大なペア。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: true, rs: "多数の不斉炭素(各グルコース単位に複数)", note: "全グルコース単位の不斉炭素が保たれている。" },
        conformers: [
          { name: "アミロース(らせん)", stability: "α-1,4 結合により右巻きらせん(1 回転 6 グルコース単位)を取りやすい。ヨウ素を包接する内部空間をもつ。" },
          { name: "アミロペクチン(分岐網目)", stability: "α-1,4 主鎖＋α-1,6 分岐の網目構造。水に部分的に溶ける(糊化)。" }
        ]
      },
      stereochemistryDetail: "α-1,4 結合のグルコース重合体で、植物のエネルギー貯蔵物質。\n\n同じ (C₆H₁₀O₅)ₙ のセルロース(β-1,4 結合)と立体だけが違うが、性質は劇的に異なる:\n  デンプン: らせん構造、水に部分可溶、ヒトが消化可能\n  セルロース: 直線繊維状、水に不溶、ヒトが消化不可\n\n結合の立体(α vs β)が生物学的機能を決める典型例として高校生物・化学で頻出。"
    },

    // ── バッチ 23: アミノ酸+単糖 (遅れて追記) ─────────────

    glycine: {
      synthesisRoutes: [
        {
          id: "glycine_chloroacetic_ammonia",
          name: "クロロ酢酸とアンモニアの反応",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "クロロ酢酸", formula: "ClCH₂COOH", molKey: null }],
            coReagents: [{ name: "アンモニア(過剰)", formula: "NH₃", molKey: "ammonia", count: 2 }],
            catalyst: "",
            conditions: "水溶液、加熱(55〜80 °C)、アンモニア大過剰",
            products: [{ name: "グリシン", formula: "H₂NCH₂COOH", molKey: "glycine" }],
            byProducts: [{ name: "塩化アンモニウム", formula: "NH₄Cl", molKey: null }]
          },
          shortNote: "クロロ酢酸の Cl をアンモニアで置換、グリシンを得る最も基本的な合成法。",
          detail: "ClCH₂COOH + 2 NH₃ → H₂NCH₂COOH + NH₄Cl\n\nアンモニアの SN2 攻撃で Cl が置換される。アンモニア大過剰で、生成したグリシンがさらにアルキル化されるのを抑える。工業的にはこの経路または Strecker 合成(HCHO + NH₃ + HCN)で量産される。",
          sources: ["Wikipedia: グリシン"]
        }
      ],
      downstream: [
        {
          name: "ペプチド結合形成(タンパク質)",
          leadsTo: [],
          shortNote: "他のアミノ酸とアミド結合(ペプチド結合)を形成、タンパク質を構成。コラーゲン中に特に多い。"
        },
        {
          name: "クレアチン・グルタチオン等の生合成原料",
          leadsTo: [],
          shortNote: "生体内でクレアチン(筋肉のエネルギー貯蔵物質)・グルタチオン(抗酸化分子)・ポルフィリン(ヘムの母骨格)の合成に使われる。"
        }
      ],
      detectionReactions: [
        {
          reagent: "ニンヒドリン試薬",
          result: "positive",
          observation: "青紫色(ルーエマン紫)に呈色",
          significance: "α-アミノ酸の存在を示す",
          commonlyUsed: true,
          detail: "α-アミノ酸検出の標準反応。アミノ酸を含むペプチド・タンパク質も陽性となる。\n\nグリシンは特に呈色が強く、検出反応のモデルとして使われる。プロリン(α-N が 2 級アミン)のみ橙黄色に呈色(例外)。"
        },
        {
          reagent: "等電点測定",
          result: "positive",
          observation: "等電点 pH ≈ 5.97 で双性イオン濃度が最大",
          significance: "両性電解質(COO⁻/NH₃⁺ の同時保持)",
          commonlyUsed: false,
          detail: "中性付近の水溶液では ⁺H₃N-CH₂-COO⁻(双性イオン、ツビッターイオン)として存在。\n\n酸性(pH < pI): ⁺H₃N-CH₂-COOH(陽イオン)\n等電点: ⁺H₃N-CH₂-COO⁻(双性イオン、正味電荷ゼロ)\n塩基性(pH > pI): H₂N-CH₂-COO⁻(陰イオン)"
        },
        {
          reagent: "酸・塩基両方に溶解",
          result: "positive",
          observation: "塩酸にも NaOH にも溶ける",
          significance: "両性化合物(カルボン酸＋アミン)",
          commonlyUsed: true,
          detail: "中性付近の水にも一定量溶ける。COOH(NaHCO₃ 陽性)と NH₂(HCl で塩を作る)の両官能基をもつ。"
        }
      ],
      isomersDetail: {
        structural: [],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "α 炭素は H × 2、COOH、NH₂ で 2 つの H をもつため不斉ではない。" },
        conformers: []
      },
      stereochemistryDetail: "α 炭素が不斉ではない唯一の α-アミノ酸(残り 19 種の天然 α-アミノ酸はすべて不斉炭素をもち L 型)。\n\nα 炭素: H、H、COOH、NH₂ → 同一置換基(H)が 2 つあるため不斉中心ではない。このため光学異性体をもたず、D/L の区別がない。"
    },

    alanine: {
      synthesisRoutes: [
        {
          id: "alanine_strecker",
          name: "Strecker 合成",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "アセトアルデヒド", formula: "CH₃CHO", molKey: "acetaldehyde" }],
            coReagents: [
              { name: "アンモニア", formula: "NH₃", molKey: "ammonia" },
              { name: "シアン化水素", formula: "HCN", molKey: null },
              { name: "水(加水分解)", formula: "H₂O", molKey: "water" }
            ],
            catalyst: "希酸または希塩基",
            conditions: "(1) アセトアルデヒドに NH₃ と HCN を作用させてアミノニトリル (2) 酸 or 塩基で加水分解",
            products: [{ name: "アラニン(ラセミ体)", formula: "CH₃CH(NH₂)COOH", molKey: "alanine" }],
            byProducts: []
          },
          shortNote: "アルデヒドに NH₃ と HCN を付加してアミノニトリルを作り、加水分解で α-アミノ酸を得る汎用法。",
          detail: "(1) CH₃CHO + NH₃ + HCN → CH₃CH(NH₂)CN(アミノニトリル)\n(2) CH₃CH(NH₂)CN + 2 H₂O → CH₃CH(NH₂)COOH + NH₃(加水分解)\n\n1850 年に A. Strecker が報告した古典反応。α-アミノ酸合成の汎用法として現代でも有用。不斉炭素を生成するため、ラセミ体として得られる。",
          sources: ["Wikipedia: アラニン", "Wikipedia: ストレッカー合成"]
        }
      ],
      downstream: [
        {
          name: "ペプチド結合形成(タンパク質)",
          leadsTo: [],
          shortNote: "ペプチド結合でタンパク質を構成。多くのタンパク質に頻出するアミノ酸。"
        }
      ],
      detectionReactions: [
        {
          reagent: "ニンヒドリン試薬",
          result: "positive",
          observation: "青紫色に呈色",
          significance: "α-アミノ酸の存在",
          commonlyUsed: true,
          detail: "α-アミノ酸全般の標準検出反応。"
        },
        {
          reagent: "等電点測定",
          result: "positive",
          observation: "等電点 pH ≈ 6.0",
          significance: "中性付近で双性イオン",
          commonlyUsed: false,
          detail: "グリシンと近い等電点。R 基が CH₃ で中性のため。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "β-アラニン(H₂N-CH₂-CH₂-COOH)。同じ C₃H₇NO₂ の構造異性体(NH₂ と COOH が離れている)。α でないためタンパク質に含まれない(パントテン酸の構成成分)。" },
          { molKey: null, note: "サルコシン(CH₃-NH-CH₂-COOH、N-メチルグリシン)。同じ C₃H₇NO₂ の構造異性体。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: true, rs: "(R)/(S) のエナンチオマー対、生体内ではほぼ L 型(S 型)", note: "α 炭素は CH₃、H、COOH、NH₂ の 4 種異なる置換基をもつため不斉炭素。L-アラニン(S 体)が天然・タンパク質構成型、D-アラニン(R 体)は細菌の細胞壁ペプチドグリカン等に存在。" },
        conformers: []
      },
      stereochemistryDetail: "最も単純な不斉アミノ酸。\n\nL-アラニン(S 体): タンパク質構成型、天然に普通\nD-アラニン(R 体): 細菌細胞壁(ペプチドグリカン)に存在、抗生物質ペニシリンの標的部位\n\nL/D の区別はα-アミノ酸の立体化学の典型例として高校化学・大学初級で扱われる。グリシン以外の α-アミノ酸はすべて L/D の区別をもつ。"
    },

    glucose: {
      synthesisRoutes: [
        {
          id: "glucose_starch_hydrolysis",
          name: "デンプンの加水分解",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "デンプン", formula: "(C₆H₁₀O₅)ₙ", molKey: "starch" }],
            coReagents: [{ name: "水", formula: "H₂O", molKey: "water" }],
            catalyst: "酸(希 HCl)または酵素(アミラーゼ・グルコアミラーゼ)",
            conditions: "酸法: 加熱／酵素法: 60 °C 前後",
            products: [{ name: "グルコース", formula: "C₆H₁₂O₆", molKey: "glucose" }],
            byProducts: []
          },
          shortNote: "デンプンの α-グリコシド結合を加水分解、グルコースを得る工業的・生化学的経路。",
          detail: "(C₆H₁₀O₅)ₙ + n H₂O → n C₆H₁₂O₆\n\n工業的にはトウモロコシデンプン→液化(α-アミラーゼ)→糖化(グルコアミラーゼ)の 2 段酵素法が主流。中間体としてマルトース・デキストリンを経る。食品工業(清涼飲料水・菓子)、発酵工業(バイオエタノール)の基幹原料。",
          sources: ["Wikipedia: グルコース", "高校化学 各社教科書"]
        }
      ],
      downstream: [
        {
          name: "アルコール発酵によるエタノール",
          leadsTo: ["ethanol"],
          shortNote: "酵母(Saccharomyces cerevisiae)の作用で C₆H₁₂O₆ → 2 C₂H₅OH + 2 CO₂。酒類・バイオ燃料の基本反応。"
        },
        {
          name: "還元によるソルビトール",
          leadsTo: [],
          shortNote: "H₂/Ni 等で還元、6 価アルコールのソルビトール(甘味料・保湿剤)を生成。"
        },
        {
          name: "酸化によるグルコン酸",
          leadsTo: [],
          shortNote: "Br₂ 水や酵素で C1 のアルデヒド基を酸化、グルコン酸を得る。"
        }
      ],
      detectionReactions: [
        {
          reagent: "Fehling 試薬",
          result: "positive",
          observation: "赤色沈殿(Cu₂O)",
          significance: "還元性糖(鎖状型のアルデヒド基をもつ)",
          commonlyUsed: true,
          detail: "水溶液中のグルコースは鎖状型(アルデヒド型)と環状型(ピラノース型)の平衡にあり、わずか 0.02% の鎖状アルデヒド型が次々と酸化されて Fehling と反応する。\n\n還元糖: グルコース、フルクトース、マルトース、ラクトース 等。"
        },
        {
          reagent: "Tollens 試薬",
          result: "positive",
          observation: "銀鏡反応",
          significance: "還元性糖",
          commonlyUsed: true,
          detail: "Fehling と同じく鎖状型アルデヒドの還元性で陽性。"
        },
        {
          reagent: "Cu(OH)₂ + NaOH(青色 → 加熱)",
          result: "positive",
          observation: "冷たいうちは深青色錯体(多価アルコール)、加熱で赤色沈殿(還元性)",
          significance: "多価アルコール＋還元性糖",
          commonlyUsed: true,
          detail: "「冷時は青、熱時は赤」の二段階観察は還元糖検出の古典実験。グルコースの環状型・鎖状型の両方の性質を同時に示す。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "fructose", note: "フルクトース(C₆H₁₂O₆、ケトース)。グルコース(アルドース)と同じ分子式の官能基異性体。" },
          { molKey: "galactose", note: "ガラクトース(C₆H₁₂O₆、C4 エピマー)。アルドヘキソースで C4 位の立体配置がグルコースと逆。" },
          { molKey: null, note: "マンノース(C2 エピマー)、その他の D-アルドヘキソース 7 種が異性体。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: true, rs: "C2, C3, C4, C5 の 4 つの不斉炭素(環状型では C1 も)", note: "4 つの不斉炭素(鎖状型)。立体異性体の総数は 2⁴ = 16 個(8 種類が D 系列、8 種類が L 系列)。天然のグルコースは D 型で C5 が R 配置。" },
        conformers: [
          { name: "α-D-グルコピラノース", stability: "環状 6 員環(椅子型)、C1 の OH が軸方向(アキシアル)。平衡比約 36%。" },
          { name: "β-D-グルコピラノース", stability: "環状 6 員環、C1 の OH が赤道方向(エクアトリアル)。平衡比約 64%(より安定)。" },
          { name: "鎖状型(オープン)", stability: "アルデヒド型、平衡比 0.02% 程度。極めて少量だが還元性糖としての反応性を担う。" }
        ]
      },
      stereochemistryDetail: "最も重要な天然糖で、生体エネルギー代謝の中心物質。\n\n立体: 4 つの不斉炭素、α/β アノマー、D/L 系列\n水溶液中で α-D-グルコピラノース ⇌ 鎖状型 ⇌ β-D-グルコピラノース の平衡(変旋光: 結晶 α/β から平衡まで旋光度が変化する現象)\n\n高校化学では「鎖状型のアルデヒドが還元性を担う」点が頻出。"
    },

    fructose: {
      synthesisRoutes: [
        {
          id: "fructose_sucrose_hydrolysis",
          name: "スクロース(ショ糖)の加水分解",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "スクロース", formula: "C₁₂H₂₂O₁₁", molKey: "sucrose" }],
            coReagents: [{ name: "水", formula: "H₂O", molKey: "water" }],
            catalyst: "希酸またはインベルターゼ(酵素)",
            conditions: "穏やかな加熱、酸性または酵素的",
            products: [
              { name: "フルクトース", formula: "C₆H₁₂O₆", molKey: "fructose" },
              { name: "グルコース", formula: "C₆H₁₂O₆", molKey: "glucose" }
            ],
            byProducts: []
          },
          shortNote: "スクロースを加水分解、グルコースとフルクトースを等モルで得る(転化糖)。",
          detail: "C₁₂H₂₂O₁₁ + H₂O → C₆H₁₂O₆(グルコース)+ C₆H₁₂O₆(フルクトース)\n\n生成物の混合物(転化糖、インバートシュガー)はスクロースより甘く、結晶化しにくいため菓子・蜂蜜の主成分として広く使われる。工業的には高フルクトースコーンシロップ(HFCS)として、グルコースをグルコース異性化酵素でフルクトースに変換して製造。",
          sources: ["Wikipedia: フルクトース"]
        }
      ],
      downstream: [
        {
          name: "アルコール発酵によるエタノール",
          leadsTo: ["ethanol"],
          shortNote: "酵母によりグルコースと同様にエタノール+CO₂ に発酵される。"
        },
        {
          name: "ソルビトール・マンニトールへの還元",
          leadsTo: [],
          shortNote: "C2 のケトン基が還元され、立体的に C2 の OH 方向で 2 種の生成物(ソルビトール、マンニトール)を与える。"
        }
      ],
      detectionReactions: [
        {
          reagent: "Fehling 試薬",
          result: "positive",
          observation: "赤色沈殿(Cu₂O)",
          significance: "ケトースだが還元性糖として陽性",
          commonlyUsed: true,
          detail: "「ケトースなのに還元性糖」は高校化学の重要ポイント。\n\nフルクトースは本来ケトンで還元性をもたないはずだが、アルカリ条件下で異性化(Lobry de Bruyn-van Ekenstein 転位)してアルドース型(グルコース・マンノース)に変化、その鎖状アルデヒドが還元剤として働く。"
        },
        {
          reagent: "Tollens 試薬",
          result: "positive",
          observation: "銀鏡反応",
          significance: "上記と同じく異性化経由の還元性",
          commonlyUsed: true,
          detail: "Tollens はアルカリ性のため、フルクトースの異性化が起こり陽性となる。"
        },
        {
          reagent: "Cu(OH)₂ + NaOH",
          result: "positive",
          observation: "冷時深青色、加熱で赤色沈殿",
          significance: "多価アルコール＋還元性",
          commonlyUsed: true,
          detail: "グルコースと同じ挙動。"
        },
        {
          reagent: "嗅覚・味覚",
          result: "positive",
          observation: "極めて強い甘味(スクロースの約 1.7 倍)",
          significance: "フルクトース特有",
          commonlyUsed: false,
          detail: "天然の糖類で最も甘い。蜂蜜・果物の甘味の主成分。低温で甘味が増す性質があるため、冷たい飲料の甘味料として有利。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "glucose", note: "グルコース(C₆H₁₂O₆、アルドース)。同じ分子式の官能基異性体。CHO 位置(C1 vs C2)が異なる。" },
          { molKey: "galactose", note: "ガラクトース(アルドース)。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: true, rs: "C3, C4, C5 の 3 つの不斉炭素", note: "3 つの不斉炭素(鎖状型)。天然のフルクトースは D 型。" },
        conformers: [
          { name: "α-D-フルクトピラノース", stability: "結晶状態の主構造。" },
          { name: "β-D-フルクトピラノース", stability: "水中の主構造(〜70%)。最も安定。" },
          { name: "α-/β-D-フルクトフラノース", stability: "5 員環型。スクロース等の二糖中で見られる構造。少量存在。" },
          { name: "鎖状型(オープン)", stability: "ケトン型、平衡比は極めて少量。" }
        ]
      },
      stereochemistryDetail: "最も甘い天然糖で、果物・蜂蜜の甘味成分。\n\n立体: 3 つの不斉炭素、α/β アノマー、5 員環(フラノース)/ 6 員環(ピラノース)の両方の環状形が存在\n水中ではほとんどが β-フラノースまたは β-ピラノース\nスクロース中ではフラノース型として結合。"
    },

    galactose: {
      synthesisRoutes: [
        {
          id: "galactose_lactose_hydrolysis",
          name: "ラクトース(乳糖)の加水分解",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "ラクトース", formula: "C₁₂H₂₂O₁₁", molKey: "lactose" }],
            coReagents: [{ name: "水", formula: "H₂O", molKey: "water" }],
            catalyst: "希酸またはラクターゼ(酵素)",
            conditions: "穏やかな加熱、酸性または酵素的",
            products: [
              { name: "ガラクトース", formula: "C₆H₁₂O₆", molKey: "galactose" },
              { name: "グルコース", formula: "C₆H₁₂O₆", molKey: "glucose" }
            ],
            byProducts: []
          },
          shortNote: "ラクトースを加水分解、ガラクトースとグルコースを等モルで得る。乳糖不耐症の機構と関連。",
          detail: "C₁₂H₂₂O₁₁(ラクトース)+ H₂O → C₆H₁₂O₆(ガラクトース)+ C₆H₁₂O₆(グルコース)\n\n乳糖(ラクトース)は牛乳中の主要糖類。体内ではラクターゼ(小腸の酵素)で加水分解されるが、成人になるとこの酵素活性が低下する人がいる(乳糖不耐症)。工業的にはラクターゼ処理で乳糖を分解した「ラクトースフリー牛乳」が市販されている。",
          sources: ["Wikipedia: ガラクトース"]
        }
      ],
      downstream: [
        {
          name: "Leloir 経路によるグルコース 1-リン酸",
          leadsTo: [],
          shortNote: "体内では UDP-ガラクトース経由でグルコース 1-リン酸に変換され、解糖系に入る。"
        },
        {
          name: "ラクトース合成",
          leadsTo: ["lactose"],
          shortNote: "乳腺で UDP-ガラクトース + グルコース → ラクトース(乳腺特異的合成)。"
        }
      ],
      detectionReactions: [
        {
          reagent: "Fehling 試薬",
          result: "positive",
          observation: "赤色沈殿(Cu₂O)",
          significance: "還元性糖(鎖状型アルドース)",
          commonlyUsed: true,
          detail: "グルコース・マンノースと同じ機構で還元性。"
        },
        {
          reagent: "Tollens 試薬",
          result: "positive",
          observation: "銀鏡反応",
          significance: "還元性糖",
          commonlyUsed: true,
          detail: "Fehling と同じく鎖状アルデヒドの還元性。"
        },
        {
          reagent: "ムコ酸試験(HNO₃ 酸化)",
          result: "positive",
          observation: "ムコ酸(不溶性結晶)が析出",
          significance: "ガラクトース特有(グルコースは類似のサッカリン酸を生じるが溶解性異なる)",
          commonlyUsed: false,
          detail: "ガラクトースを硝酸で酸化すると両端 COOH のムコ酸(meso 体)が生成、結晶化する。グルコースから得られるグルカル酸とは異なる性質。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "glucose", note: "グルコース(C4 エピマー)。C4 位の立体配置のみがガラクトースと異なる。" },
          { molKey: "fructose", note: "フルクトース(C₆H₁₂O₆ のケトース異性体)。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: true, rs: "C2, C3, C4, C5 の 4 つの不斉炭素", note: "グルコースの C4 エピマー: C4 の OH の向きだけが逆(他は同じ)。D-ガラクトースが天然型。" },
        conformers: [
          { name: "α-D-ガラクトピラノース", stability: "C1-OH が軸方向、平衡比約 30%。" },
          { name: "β-D-ガラクトピラノース", stability: "C1-OH が赤道方向、平衡比約 64%(より安定)。" },
          { name: "鎖状型", stability: "ごく微量、還元性糖として働く。" }
        ]
      },
      stereochemistryDetail: "グルコースの C4 エピマーで、立体化学が C4 だけ異なる唯一の違い。\n\nラクトース(乳糖)の構成糖として乳製品から摂取。ガラクトース血症(galactosemia)は Leloir 経路の酵素欠損による先天性代謝異常で、新生児スクリーニング対象。高校化学では「ラクトースの加水分解で得られる糖」「グルコースのエピマー」として登場。"
    },

    cellulose: {
      synthesisRoutes: [
        {
          id: "cellulose_plant_biosynthesis",
          name: "植物・細菌による生合成(天然由来)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "UDP-グルコース", formula: "—", molKey: null }],
            coReagents: [],
            catalyst: "セルロース合成酵素(細胞膜の酵素複合体)",
            conditions: "植物細胞壁、または酢酸菌等の細菌で生合成",
            products: [{ name: "セルロース", formula: "(C₆H₁₀O₅)ₙ", molKey: "cellulose" }],
            byProducts: [{ name: "UDP", formula: "—", molKey: null }]
          },
          shortNote: "植物の細胞壁の主成分として光合成産物から生合成される地球上最大量の有機高分子。",
          detail: "**(UDP-Glc)ₙ → (C₆H₁₀O₅)ₙ + n UDP**\n\n- 地球上で最も大量に存在する有機高分子(年間 10¹¹ トン規模で生合成)。\n- 植物では木材・綿・パルプ等から、細菌では酢酸菌(バクテリアセルロース、ナタデココ)から得られる。\n- 工業的には木材パルプ(クラフト法、亜硫酸法)で大量精製。",
          sources: ["Wikipedia: セルロース", "高校化学 各社教科書"]
        }
      ],
      downstream: [
        {
          name: "ニトロセルロース(爆薬・無煙火薬)",
          leadsTo: [],
          shortNote: "濃硝酸＋濃硫酸(混酸)で OH をニトロエステル化、ニトロセルロース(綿火薬・コロジオン)を生成。"
        },
        {
          name: "アセチルセルロース(フィルム・繊維)",
          leadsTo: [],
          shortNote: "無水酢酸で OH をアセチル化、アセチルセルロース(写真フィルム・アセテート繊維・タバコフィルター)を生成。"
        },
        {
          name: "ビスコース → レーヨン・セロハン",
          leadsTo: [],
          shortNote: "NaOH と CS₂ で処理してビスコースを得て、紡糸→再生でレーヨン繊維、または製膜→再生でセロハンへ。"
        },
        {
          name: "加水分解によるグルコース(バイオエタノール原料)",
          leadsTo: ["cellobiose", "glucose"],
          shortNote: "セルラーゼまたは希酸で加水分解、セロビオース経由でグルコースを生成。バイオエタノール原料として研究中。"
        }
      ],
      detectionReactions: [
        {
          reagent: "ヨウ素溶液(I₂/KI)",
          result: "negative",
          observation: "**呈色しない**(褐色のまま)",
          significance: "**らせん構造をとらない**ことを示す(デンプンとの決定的判別)",
          commonlyUsed: true,
          detail: "**デンプン(陽性、青紫色)vs セルロース(陰性)の決定的判別**。\n\nβ-1,4 結合のため鎖が直線的に伸びて**らせんを作れず**、ヨウ素を包接できないため呈色しない。デンプン(α-1,4 結合でらせん)との立体配置の違いが性質の劇的な差を生む典型例。"
        },
        {
          reagent: "Fehling 試薬",
          result: "negative",
          observation: "赤色沈殿が生じない",
          significance: "高分子のため還元末端の比率が極めて低い",
          commonlyUsed: false,
          detail: "末端 OH の一方が遊離 OH だが、分子量が大きいため還元性を示さない。加水分解後はグルコースが陽性となる。"
        },
        {
          reagent: "希酸加水分解 → Fehling",
          result: "positive",
          observation: "加水分解後の生成物(セロビオース・グルコース)が Fehling 陽性",
          significance: "**セルロースの構成糖**を確認",
          commonlyUsed: true,
          detail: "「ヨウ素陰性 → 加水分解 → Fehling 陽性 → 単糖はグルコースのみ」で「もとはセルロース」と判定できる。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "starch", note: "**デンプン(同じ (C₆H₁₀O₅)ₙ だが α-1,4 結合)**。立体配置のみが違う代表的なペア。性質は劇的に異なる(らせん vs 直線、可溶 vs 不溶、消化可 vs 不可)。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: true, rs: "多数の不斉炭素", note: "全グルコース単位の不斉炭素が保たれている。" },
        conformers: [
          { name: "直線状繊維", stability: "β-1,4 結合の立体的制約により、**鎖が直線的に伸び**、隣接鎖と水素結合で束ねられて結晶性ミクロフィブリルを形成。" }
        ]
      },
      stereochemistryDetail: "**β-1,4 結合のグルコース重合体**で、地球上最大量の有機高分子。\n\n- デンプン(α-1,4)と立体だけが違うが、らせん vs 直線、可溶 vs 不溶、ヒト消化可能 vs 不可能 と性質が劇的に異なる。\n- **結合の立体配置が機能を決める**生物学・化学の象徴的な例。"
    },

    naturalRubber: {
      synthesisRoutes: [
        {
          id: "naturalRubber_latex_extraction",
          name: "パラゴムノキ(Hevea brasiliensis)のラテックスからの採集",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "イソプレン(イソペンテニル二リン酸経由)", formula: "C₅H₈", molKey: null }],
            coReagents: [],
            catalyst: "ゴム木の生合成酵素",
            conditions: "パラゴムノキの幹に切れ目を入れてラテックス(白い乳液)を採取、酸(蟻酸)で凝固",
            products: [{ name: "天然ゴム(cis-1,4-ポリイソプレン)", formula: "(C₅H₈)ₙ", molKey: "naturalRubber" }],
            byProducts: []
          },
          shortNote: "ゴムノキのラテックスを採集し、蟻酸等で凝固させて生ゴムを得る。",
          detail: "**(C₅H₈)ₙ の cis-1,4-ポリイソプレン**\n\n- イソプレン(2-メチル-1,3-ブタジエン)が **cis-1,4 結合**で重合した直鎖高分子。\n- 鎖が屈曲しやすく弾性をもつ(trans 体は**グッタペルカ**で硬く弾性が劣る、立体異性で性質が劇的に変化)。\n- ラテックスは pH 7 で安定だが、蟻酸等で pH 5 に下げると凝固する。",
          sources: ["Wikipedia: 天然ゴム", "高校化学 各社教科書"]
        }
      ],
      downstream: [
        {
          name: "加硫(硫黄架橋)による弾性ゴム",
          leadsTo: [],
          shortNote: "硫黄を約 5% 加えて加熱、ポリイソプレン鎖を C-S-S-C 結合で架橋し弾性と機械強度を高める(タイヤ用ゴム)。"
        },
        {
          name: "エボナイト(大量硫黄架橋)",
          leadsTo: [],
          shortNote: "30% 程度の大量の硫黄を加硫すると硬質プラスチック様のエボナイトとなり、電気絶縁体・万年筆軸・楽器マウスピース等に。"
        }
      ],
      detectionReactions: [
        {
          reagent: "Br₂ 水",
          result: "positive",
          observation: "**脱色する**",
          significance: "**C=C 二重結合の存在**(不飽和高分子)",
          commonlyUsed: true,
          detail: "イソプレン単位 1 つあたり 1 つの C=C をもつため、Br₂ 水を脱色する。\n\n- これにより**飽和高分子(ポリエチレン等、陰性)と不飽和高分子(天然ゴム、ブタジエンゴム等、陽性)の判別**ができる。"
        },
        {
          reagent: "弾性試験(引張り)",
          result: "positive",
          observation: "**強い弾性**(引き伸ばして手を放すと縮む)",
          significance: "天然ゴム特有",
          commonlyUsed: false,
          detail: "cis-1,4 結合のため屈曲鎖が無秩序に絡まり、引き伸ばすと整列、放すとエントロピーで戻る(**エントロピー弾性**)。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "**グッタペルカ(trans-1,4-ポリイソプレン)**。同じイソプレン単位の重合体だが、すべて trans 型のため硬く弾性が乏しい。歴史的に海底電線の絶縁材として使われた。" }
        ],
        geometric: [
          { type: "cis-1,4 vs trans-1,4", note: "**cis 体(天然ゴム、弾性)vs trans 体(グッタペルカ、硬質)**。同じイソプレン重合体だが C=C の幾何異性で物性が劇的に異なる。" }
        ],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "**イソプレン単位の cis-1,4 結合**による弾性高分子。\n\n- 立体異性体グッタペルカ(trans 体)と物性が劇的に異なる。\n- 加硫により C=C のいくつかを S 原子で架橋することで弾性が増加する。"
    },

    polyethylene: {
      synthesisRoutes: [
        {
          id: "polyethylene_high_pressure",
          name: "エチレンの高圧ラジカル重合(LDPE)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "エチレン", formula: "C₂H₄", molKey: "ethene" }],
            coReagents: [],
            catalyst: "ラジカル開始剤(過酸化物 O₂ など)",
            conditions: "1000〜3000 気圧、200〜300 °C",
            products: [{ name: "低密度ポリエチレン(LDPE)", formula: "(C₂H₄)ₙ", molKey: "polyethylene" }],
            byProducts: []
          },
          shortNote: "エチレンを高圧ラジカル開始下で重合、枝分かれの多い柔らかい低密度ポリエチレンを得る。",
          detail: "**n CH₂=CH₂ → -(CH₂-CH₂)ₙ-**(ラジカル機構)\n\n- 1933 年に ICI 社が偶然発見した古典法。生成物は**枝分かれが多く結晶化度が低い LDPE**(低密度 PE)。\n- 透明性が高く柔軟。食品ラップ、ポリ袋、ボトル等。",
          sources: ["Wikipedia: ポリエチレン", "高校化学 各社教科書"]
        },
        {
          id: "polyethylene_ziegler_natta",
          name: "Ziegler–Natta 重合(HDPE、低圧法)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "エチレン", formula: "C₂H₄", molKey: "ethene" }],
            coReagents: [],
            catalyst: "TiCl₄ + Al(C₂H₅)₃ などの遷移金属触媒",
            conditions: "数気圧、50〜80 °C",
            products: [{ name: "高密度ポリエチレン(HDPE)", formula: "(C₂H₄)ₙ", molKey: "polyethylene" }],
            byProducts: []
          },
          shortNote: "Ziegler–Natta 触媒で穏和な条件で重合、直鎖の高密度ポリエチレンを得る。",
          detail: "1953 年に K. Ziegler が発見した低圧重合法(1963 年ノーベル化学賞)。\n\n- 触媒の選択により**直鎖性が高く結晶化度の高い HDPE**(高密度 PE)が得られる。\n- HDPE は硬く強靭で、容器・パイプ・ロープ・人工股関節等に。\n- LDPE と HDPE の物性の違いは**枝分かれの有無**による結晶化度の差。",
          sources: ["Wikipedia: ポリエチレン", "Wikipedia: Ziegler-Natta 触媒"]
        }
      ],
      downstream: [
        {
          name: "包装容器・フィルム(生活素材)",
          leadsTo: [],
          shortNote: "ポリ袋・食品包装フィルム・ボトル・タッパー等、最も身近なプラスチック。世界の合成樹脂生産量で最大。"
        }
      ],
      detectionReactions: [
        {
          reagent: "Br₂ 水",
          result: "negative",
          observation: "**脱色しない**",
          significance: "**飽和高分子**(C=C を含まない)",
          commonlyUsed: true,
          detail: "付加重合で C=C はすべて消費されているため、生成物に C=C は残らない。**天然ゴム・ポリブタジエン等の不飽和高分子(陽性)との判別**。"
        },
        {
          reagent: "燃焼",
          result: "positive",
          observation: "**黄色の炎で完全燃焼、燃え滓は出ない**",
          significance: "炭化水素のみで構成",
          commonlyUsed: false,
          detail: "他原子(Cl、N、O 等)を含まないため、燃焼産物は CO₂ と H₂O のみ。すす(不完全燃焼)は出るが灰は残らない。"
        }
      ],
      isomersDetail: {
        structural: [],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "**最も単純な高分子**で、-(CH₂-CH₂)ₙ- の繰り返し単位。\n\n- LDPE: 枝分かれ多、結晶化度低、柔軟・透明\n- HDPE: 直鎖性高、結晶化度高、硬く強靭・不透明\n- LLDPE: 短い枝分かれが規則的、両者の中間特性\n\n世界の合成樹脂生産量で最大(年 1 億トン超)。"
    },

    polypropylene: {
      synthesisRoutes: [
        {
          id: "polypropylene_ziegler_natta",
          name: "プロペンの Ziegler–Natta 重合(工業的)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "プロペン", formula: "C₃H₆", molKey: "propene" }],
            coReagents: [],
            catalyst: "改良型 Ziegler–Natta(MgCl₂ 担持 TiCl₄ + AlR₃)またはメタロセン",
            conditions: "数気圧、50〜80 °C",
            products: [{ name: "ポリプロピレン(アイソタクチック)", formula: "(C₃H₆)ₙ", molKey: "polypropylene" }],
            byProducts: []
          },
          shortNote: "プロペンを Ziegler–Natta 触媒下で立体規則的に重合、結晶性の高いアイソタクチック PP を得る。",
          detail: "**n CH₃-CH=CH₂ → -(CH(CH₃)-CH₂)ₙ-**\n\n- 1954 年に G. Natta が発見した**立体規則性重合**の代表。\n- アイソタクチック(全 CH₃ が同じ側)/ シンジオタクチック(CH₃ が交互)/ アタクチック(ランダム)の 3 種類が作り分けられる。\n- アイソタクチック PP は結晶化して融点 165 °C、剛性が高く、家庭用容器・自動車部品・繊維(カーペット・PP ロープ)に。",
          sources: ["Wikipedia: ポリプロピレン", "Wikipedia: Ziegler-Natta 触媒"]
        }
      ],
      downstream: [
        {
          name: "包装容器・繊維・自動車部品",
          leadsTo: [],
          shortNote: "電子レンジ対応容器・コップ・ヨーグルトカップ・PP 繊維(カーペット・自動車内装)等。"
        }
      ],
      detectionReactions: [
        {
          reagent: "Br₂ 水",
          result: "negative",
          observation: "脱色しない",
          significance: "**飽和高分子**",
          commonlyUsed: true,
          detail: "PE と同じく、付加重合で C=C は消費されている。"
        },
        {
          reagent: "燃焼",
          result: "positive",
          observation: "黄色の炎で燃焼、燃え滓なし",
          significance: "炭化水素のみ",
          commonlyUsed: false,
          detail: "炭化水素のみで構成、燃焼産物は CO₂ と H₂O。"
        }
      ],
      isomersDetail: {
        structural: [],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "繰り返し単位中の C は CH₃ が付くため不斉だが、立体規則性(タクティシティ)として捉えられる(個々の中心は不斉でも、全体としては光学不活性なメソ・アタクチック等の構造を取る)。" },
        conformers: [
          { name: "アイソタクチック", stability: "**全 CH₃ が同じ側**に並ぶ規則構造。結晶化しやすく、商用 PP の主要型。" },
          { name: "シンジオタクチック", stability: "CH₃ が交互に左右に並ぶ。やはり結晶化可能。メタロセン触媒で合成。" },
          { name: "アタクチック", stability: "CH₃ がランダム。非結晶性のゴム状物質。商用価値は低い。" }
        ]
      },
      stereochemistryDetail: "**立体規則性高分子の代表例**。\n\n- 同じ繰り返し単位でも、側鎖 CH₃ の並び方(タクティシティ)で物性が劇的に異なる。\n- アイソタクチック PP は世界の合成樹脂生産量でポリエチレンに次ぐ第 2 位(年 7 千万トン超)。\n- Ziegler/Natta が立体規則性重合を実現した功績で 1963 年ノーベル化学賞。"
    },

    polyvinylChloride: {
      synthesisRoutes: [
        {
          id: "pvc_vinyl_chloride_polymerization",
          name: "塩化ビニルのラジカル付加重合",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "塩化ビニル", formula: "CH₂=CHCl", molKey: null }],
            coReagents: [],
            catalyst: "ラジカル開始剤(過酸化ベンゾイル、AIBN 等)",
            conditions: "懸濁重合または乳化重合、50〜70 °C",
            products: [{ name: "ポリ塩化ビニル", formula: "(C₂H₃Cl)ₙ", molKey: "polyvinylChloride" }],
            byProducts: []
          },
          shortNote: "塩化ビニルをラジカル開始剤下で付加重合、ポリ塩化ビニルを得る。",
          detail: "**n CH₂=CHCl → -(CH₂-CHCl)ₙ-**\n\n- 上流の塩化ビニルは:\n  - **古典**: アセチレン + HCl(HgCl₂ 触媒)→ CH₂=CHCl\n  - **現代**: エチレン + Cl₂ → 1,2-ジクロロエタン → 熱分解 → CH₂=CHCl + HCl\n- 用途: 配管(給水・排水)、電線被覆、塩ビパイプ、合成皮革(ビニルレザー)、塩ビ床材等。\n- 硬さは可塑剤(フタル酸エステル等)の添加量で調整。",
          sources: ["Wikipedia: ポリ塩化ビニル", "高校化学 各社教科書"]
        }
      ],
      downstream: [
        {
          name: "配管材料(給水管・排水管・ダクト)",
          leadsTo: [],
          shortNote: "難燃性・耐食性・耐薬品性に優れ、建築用配管として広く使用。"
        },
        {
          name: "合成皮革・床材",
          leadsTo: [],
          shortNote: "可塑剤を多く加えた軟質 PVC は合成皮革(バッグ・椅子)、ビニルクロス、塩ビ床材等に。"
        }
      ],
      detectionReactions: [
        {
          reagent: "Br₂ 水",
          result: "negative",
          observation: "脱色しない",
          significance: "飽和高分子",
          commonlyUsed: true,
          detail: "付加重合で C=C は消費されている。"
        },
        {
          reagent: "燃焼(Beilstein 試験)",
          result: "positive",
          observation: "**銅線を炎にかざすと青緑色の炎色反応**(CuCl 生成)",
          significance: "**塩素を含む**ことを示す",
          commonlyUsed: true,
          detail: "**Beilstein 試験**: 銅線を試料につけて炎に入れると、含ハロゲン化合物では銅とハロゲンから揮発性 CuX が生成し**青緑色**に呈色する。PVC・ハロゲン化炭化水素全般の検出。PE・PP(陰性)との判別ポイント。"
        },
        {
          reagent: "燃焼",
          result: "positive",
          observation: "**塩化水素ガスの発生**、刺激臭・白煙",
          significance: "塩素含有を示す",
          commonlyUsed: false,
          detail: "燃焼で HCl ガスが発生、湿った青色リトマス紙を赤変させる。PVC 焼却処理が問題視される理由でもある(ダイオキシン懸念)。"
        }
      ],
      isomersDetail: {
        structural: [],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "**塩素含有高分子の代表**で、世界の合成樹脂生産量第 3 位(PE・PP に次ぐ)。\n\n- 通常は**アタクチック**(Cl がランダム)構造で非晶質。\n- 可塑剤(フタル酸ジオクチル DOP/DEHP 等)の添加量で硬軟を調整できる。\n- 燃焼時の HCl 発生・ダイオキシン懸念のため近年は代替材料への置換も進む。"
    },

    polystyrene: {
      synthesisRoutes: [
        {
          id: "polystyrene_radical_polymerization",
          name: "スチレンの付加重合(ラジカル)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "スチレン", formula: "C₆H₅CH=CH₂", molKey: "styrene" }],
            coReagents: [],
            catalyst: "ラジカル開始剤(過酸化ベンゾイル、AIBN 等)",
            conditions: "塊状重合または懸濁重合、60〜90 °C",
            products: [{ name: "ポリスチレン", formula: "(C₈H₈)ₙ", molKey: "polystyrene" }],
            byProducts: []
          },
          shortNote: "スチレンの C=C をラジカル開始下で付加重合、透明な熱可塑性樹脂ポリスチレンを得る。",
          detail: "**n C₆H₅CH=CH₂ → -(CH(C₆H₅)-CH₂)ₙ-**\n\n- ラジカル機構による付加重合。\n- 通常は**アタクチック**(フェニル基がランダム)で非結晶質、無色透明。Ziegler–Natta やメタロセン触媒では立体規則的に重合可能。\n- 発泡剤と共に膨らませた**発泡スチロール(EPS)**は緩衝材・断熱材として大量に使用される。",
          sources: ["Wikipedia: ポリスチレン", "高校化学 各社教科書"]
        }
      ],
      downstream: [
        {
          name: "発泡スチロール・包装材・容器",
          leadsTo: [],
          shortNote: "ペンタン等の発泡剤と加熱して膨らませた発泡スチロール(EPS)は緩衝材・断熱材。固体のままでは透明容器・玩具・使い捨て食器など。"
        },
        {
          name: "ABS・SBR 等の共重合体",
          leadsTo: [],
          shortNote: "アクリロニトリル＋ブタジエンとの三元共重合で ABS 樹脂(家電・自動車)、ブタジエンとの共重合で SBR(合成ゴム)。"
        }
      ],
      detectionReactions: [
        {
          reagent: "燃焼",
          result: "positive",
          observation: "**多量の黒煙(すす)を伴う燃焼、甘いガス臭**",
          significance: "**芳香環をもつ高分子**であることを示す",
          commonlyUsed: true,
          detail: "ベンゼン環の高い炭素比率で不完全燃焼するため**強い黒煙**が出る。PE・PP(黒煙わずか)と区別される視覚的特徴。\n\n- 甘いガス臭は分解で発生するスチレンモノマー由来。"
        },
        {
          reagent: "Br₂ 水",
          result: "negative",
          observation: "脱色しない",
          significance: "**飽和した側鎖構造**(C=C 消費済み)",
          commonlyUsed: true,
          detail: "重合で C=C は消費。芳香環は Br₂ 水と反応しないため陰性。"
        }
      ],
      isomersDetail: {
        structural: [],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "繰り返し単位の C は不斉だが、立体規則性として扱う。" },
        conformers: [
          { name: "アタクチック", stability: "**通常の商用 PS**。フェニル基がランダム配置で非結晶、透明。" },
          { name: "シンジオタクチック", stability: "フェニル基が交互配置、結晶性で耐熱性向上(mp 270 °C)。メタロセン触媒で製造可能。" },
          { name: "アイソタクチック", stability: "フェニル基が同方向、結晶性だが結晶化が遅い。" }
        ]
      },
      stereochemistryDetail: "**最も身近な透明プラスチック**で、世界の合成樹脂生産量第 4 位。\n\n- 通常はアタクチックで非結晶質・透明。\n- 衝撃に弱い(ガラス転移点 100 °C で硬く脆い)。共重合(ABS、SBR)で性質を改善する。"
    },

    nylon66: {
      synthesisRoutes: [
        {
          id: "nylon66_condensation",
          name: "アジピン酸とヘキサメチレンジアミンの縮合重合",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "アジピン酸", formula: "HOOC(CH₂)₄COOH", molKey: null }],
            coReagents: [{ name: "ヘキサメチレンジアミン", formula: "H₂N(CH₂)₆NH₂", molKey: null }],
            catalyst: "",
            conditions: "(1) 等モル混合でナイロン塩を形成 (2) 加熱(〜270 °C)で脱水縮合",
            products: [{ name: "ナイロン 66", formula: "[-NH(CH₂)₆NHCO(CH₂)₄CO-]ₙ", molKey: "nylon66" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "ジカルボン酸とジアミンの脱水縮合でアミド結合(ペプチド結合)を形成、ナイロン 66 を得る。",
          detail: "**n HOOC(CH₂)₄COOH + n H₂N(CH₂)₆NH₂ → [-NH(CH₂)₆NHCO(CH₂)₄CO-]ₙ + 2n H₂O**\n\n- 1935 年に DuPont 社の W.H. Carothers が発明した**世界初の合成繊維**。\n- 「66」は**両モノマーが各 6 個の C をもつ**ことから。\n- 強度・耐久性・弾性に優れ、ストッキング・繊維・釣り糸・ギアなどに使用。",
          sources: ["Wikipedia: ナイロン", "高校化学 各社教科書"]
        }
      ],
      downstream: [
        {
          name: "繊維(ストッキング・衣料)",
          leadsTo: [],
          shortNote: "強度・耐摩耗性に優れた合成繊維として、ストッキング・スポーツウェア・釣り糸・ロープ等に。"
        },
        {
          name: "エンジニアリングプラスチック(機械部品)",
          leadsTo: [],
          shortNote: "ガラス繊維強化したナイロンは耐熱性・機械強度に優れ、自動車部品・ギア・電気部品等の構造材料に。"
        }
      ],
      detectionReactions: [
        {
          reagent: "NaOH 水溶液(加熱、けん化)",
          result: "positive",
          observation: "**アンモニア臭の発生(NH₃)**、加水分解",
          significance: "**アミド結合**の存在",
          commonlyUsed: true,
          detail: "アミド結合の塩基加水分解。発生 NH₃ は湿った赤色リトマス紙を青変。タンパク質・他のナイロン類・ベンズアミドと同様の挙動。"
        },
        {
          reagent: "酸加水分解 → モノマー検出",
          result: "positive",
          observation: "**アジピン酸とヘキサメチレンジアミンが得られる**",
          significance: "ナイロン 66 の組成確認",
          commonlyUsed: false,
          detail: "酸または塩基で完全加水分解後、得られたモノマーで構造を確定。ナイロン 6(カプロラクタム由来)とはモノマーが異なる。"
        },
        {
          reagent: "燃焼",
          result: "positive",
          observation: "**毛髪のような香り(焼くと髪/タンパクの臭い)**、灰白色の燃焼残渣",
          significance: "**ポリアミド**であることを示す",
          commonlyUsed: false,
          detail: "タンパク質(ペプチド結合をもつポリアミド)の燃焼と同じ香り。アミド系高分子に共通する特徴。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "**ナイロン 6**([-NH(CH₂)₅CO-]ₙ、ε-カプロラクタムの開環重合)。同じくポリアミドだが、6 個 C のラクタム由来で構造が異なる。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "**Carothers が 1935 年に発明した世界初の合成繊維**。\n\n- 「66」: ヘキサメチレンジアミン 6 個 C＋アジピン酸 6 個 C\n- ナイロン 6(ε-カプロラクタム由来)と並ぶ二大ポリアミド\n- アミド結合の水素結合で結晶化、強度・弾性が高い"
    },

    pet: {
      synthesisRoutes: [
        {
          id: "pet_condensation",
          name: "テレフタル酸とエチレングリコールの縮合重合",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "テレフタル酸", formula: "p-HOOC-C₆H₄-COOH", molKey: null }],
            coReagents: [{ name: "エチレングリコール", formula: "HOCH₂CH₂OH", molKey: "ethyleneGlycol" }],
            catalyst: "アンチモン・チタン・ゲルマニウム触媒",
            conditions: "(1) エステル化 220〜250 °C (2) 重縮合 280〜290 °C、真空",
            products: [{ name: "PET", formula: "[-O-CH₂CH₂-O-CO-C₆H₄-CO-]ₙ", molKey: "pet" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "テレフタル酸とエチレングリコールのエステル縮合重合で、ペットボトル・ポリエステル繊維の主原料 PET を得る。",
          detail: "**n HOOC-C₆H₄-COOH + n HOCH₂CH₂OH → [-O-CO-C₆H₄-CO-O-CH₂CH₂-]ₙ + 2n H₂O**\n\n- 工業的には**テレフタル酸(または DMT、テレフタル酸ジメチル)とエチレングリコール**から 2 段階のエステル化＋重縮合で製造。\n- **ペットボトル(飲料容器)、ポリエステル繊維(テトロン)、写真・X 線フィルム**等に大量使用。\n- 結晶化制御で透明(ボトル)または不透明(繊維)に調整。",
          sources: ["Wikipedia: ポリエチレンテレフタラート", "高校化学 各社教科書"]
        }
      ],
      downstream: [
        {
          name: "ペットボトル(飲料容器)",
          leadsTo: [],
          shortNote: "射出延伸ブロー成形で透明ボトル化、世界の飲料容器の主流。リサイクル容易なプラスチックとして注目。"
        },
        {
          name: "ポリエステル繊維(テトロン)",
          leadsTo: [],
          shortNote: "紡糸して繊維化、衣料・カーペット・産業資材に大量使用。世界の合成繊維生産量で最大。"
        }
      ],
      detectionReactions: [
        {
          reagent: "NaOH 水溶液(加熱、けん化)",
          result: "positive",
          observation: "**テレフタル酸ナトリウム＋エチレングリコール**に加水分解",
          significance: "**エステル結合**の存在",
          commonlyUsed: true,
          detail: "エステル結合の塩基加水分解(けん化)。けん化後の生成物でテレフタル酸・エチレングリコールが確認できる。"
        },
        {
          reagent: "燃焼",
          result: "positive",
          observation: "**黒煙(すす)を伴う燃焼**、芳香族特有の臭い",
          significance: "芳香族高分子",
          commonlyUsed: false,
          detail: "テレフタル酸由来のベンゼン環で不完全燃焼が起こり、すすが出る。"
        },
        {
          reagent: "Br₂ 水",
          result: "negative",
          observation: "脱色しない",
          significance: "芳香族環(脂肪族不飽和なし)",
          commonlyUsed: false,
          detail: "ベンゼン環は付加反応せず、エステル結合も C=C を含まないため。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "イソフタル酸由来のポリエステル(イソフタル酸 + エチレングリコール)。テレフタル酸の m-体異性体で性質が異なる。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "**世界で最も大量に生産される合成繊維／プラスチック**。\n\n- ポリエステル繊維生産量は綿を超え、繊維で最大シェア。\n- ペットボトルとして食品工業を支える。\n- リサイクル性に優れ、回収 PET から繊維・新ボトルへの再生が確立されている。"
    },

    calciumCarbide: {
      synthesisRoutes: [
        {
          id: "calciumCarbide_arc_furnace",
          name: "酸化カルシウムとコークスの電気炉加熱",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "酸化カルシウム(生石灰)", formula: "CaO", molKey: null }],
            coReagents: [{ name: "コークス(炭素)", formula: "C", molKey: null }],
            catalyst: "",
            conditions: "アーク炉、約 2000 °C",
            products: [{ name: "炭化カルシウム", formula: "CaC₂", molKey: "calciumCarbide" }],
            byProducts: [{ name: "一酸化炭素", formula: "CO", molKey: null }]
          },
          shortNote: "生石灰とコークスを電気炉で約 2000 °C に加熱、炭化カルシウム(カーバイド)を得る。",
          detail: "**CaO + 3 C → CaC₂ + CO**(電気炉、約 2000 °C)\n\n- 1888 年に T.L. Willson が発見、大規模なアーク炉で工業生産される。\n- 大量の電力消費でかつてはアセチレン化学(石炭・石灰由来)の基盤を支え、特にドイツの戦時化学工業を支えた。\n- 現代では石油化学(エチレンクラッキング)に主役を譲ったが、地域によっては今もアセチレン供給源として現役。",
          sources: ["Wikipedia: 炭化カルシウム", "高校化学 各社教科書"]
        }
      ],
      downstream: [
        {
          name: "加水分解によるアセチレン",
          leadsTo: ["ethyne"],
          shortNote: "水を加えると激しく反応し、アセチレンと水酸化カルシウムを生成。**カーバイドランプ**の原理。"
        },
        {
          name: "石灰窒素(カルシウムシアナミド、肥料)",
          leadsTo: [],
          shortNote: "CaC₂ + N₂ → CaCN₂ + C(1000 °C、Frank-Caro 法)。窒素肥料の原料として歴史的に重要。"
        }
      ],
      detectionReactions: [
        {
          reagent: "水",
          result: "positive",
          observation: "**激しい反応**でアセチレンガスが発生、ニンニク様の臭い、発熱",
          significance: "**カーバイド型炭化物**の特性",
          commonlyUsed: true,
          detail: "**CaC₂ + 2 H₂O → Ca(OH)₂ + C₂H₂↑**\n\n- 高校化学のアセチレン製法として最も有名。\n- 発生気体は臭素水を脱色(アセチレンの C≡C で陽性)。\n- 古い炭鉱では**カーバイドランプ**として使われ、水を滴下しアセチレンを燃焼させて照明としていた。"
        },
        {
          reagent: "視認",
          result: "positive",
          observation: "**灰色の硬い固体**(純品は無色透明、市販品は不純物で灰〜黒色)",
          significance: "炭化カルシウム特有",
          commonlyUsed: false,
          detail: "結晶構造は岩塩型に類似で、Ca²⁺ と C₂²⁻(アセチリドアニオン)からなるイオン性化合物。"
        }
      ],
      isomersDetail: {
        structural: [],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "**有機化合物ではないが**、有機化学にとってアセチレン供給源として極めて重要なイオン性化合物。\n\n- 結晶中で **Ca²⁺** と **C≡C²⁻**(アセチリドアニオン)から構成。\n- 加水分解で C₂H₂ を放出する反応性は、Al₄C₃(→ メタン)と並ぶ「カーバイド型炭化物の二大ペア」として教科書頻出。"
    },

    lacticAcid: {
      synthesisRoutes: [
        {
          id: "lacticAcid_fermentation",
          name: "乳酸発酵(工業・食品)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "グルコース", formula: "C₆H₁₂O₆", molKey: "glucose" }],
            coReagents: [],
            catalyst: "乳酸菌(Lactobacillus 属等)",
            conditions: "嫌気、30〜45 °C、中性〜弱酸性",
            products: [{ name: "乳酸(L-型または D-型、菌種依存)", formula: "CH₃CH(OH)COOH", molKey: "lacticAcid" }],
            byProducts: []
          },
          shortNote: "乳酸菌がグルコースを嫌気的に分解、乳酸を生成。ヨーグルト・チーズ製造の基本反応。",
          detail: "**C₆H₁₂O₆ → 2 CH₃CH(OH)COOH**\n\n- 乳酸菌(Lactobacillus・Lactococcus 等)によるホモ乳酸発酵。グルコースをピルビン酸経由で乳酸に還元。\n- 工業的にはトウモロコシデンプンを原料とした発酵法で大量生産(**ポリ乳酸 PLA 原料**)。\n- 菌種により**L-体(哺乳類筋肉と同じ天然型)**または**D-体**を選択的に生成可能。",
          sources: ["Wikipedia: 乳酸", "高校化学 各社教科書"]
        }
      ],
      downstream: [
        {
          name: "ポリ乳酸(PLA、生分解性プラスチック)",
          leadsTo: [],
          shortNote: "ラクチド(環状ジエステル)経由で開環重合、生分解性プラスチック PLA を生成。トウモロコシ由来のバイオプラスチック。"
        },
        {
          name: "食品酸味料・乳酸塩",
          leadsTo: [],
          shortNote: "ヨーグルト・漬物の酸味、食品保存料。乳酸 Ca・Na 塩は食品添加物として広く利用。"
        }
      ],
      detectionReactions: [
        {
          reagent: "NaHCO₃ 水溶液",
          result: "positive",
          observation: "CO₂ を発泡しながら溶解",
          significance: "**カルボン酸**(pKa ≈ 3.86)",
          commonlyUsed: true,
          detail: "α 位の OH の電子吸引効果で、酢酸(pKa 4.76)より強い酸性。"
        },
        {
          reagent: "Na(金属ナトリウム)",
          result: "positive",
          observation: "H₂ を発生(OH と COOH の両方から)",
          significance: "**活性 H が 2 つ**(OH 1 + COOH 1)",
          commonlyUsed: false,
          detail: "通常のアルコールやカルボン酸 1 つの場合より多くの H₂ を発生する。"
        },
        {
          reagent: "光学旋光",
          result: "positive",
          observation: "**旋光性をもつ**(L 体は左旋 [α]D = −2.5°)",
          significance: "**不斉炭素の存在**",
          commonlyUsed: false,
          detail: "α 位炭素 C2 が CH₃、H、OH、COOH の 4 種異なる置換基をもつため不斉。L/D の光学異性体ペアが存在。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "β-ヒドロキシプロピオン酸(HOCH₂CH₂COOH)。同じ C₃H₆O₃ の構造異性体(OH 位置が違う)。" },
          { molKey: null, note: "グリセルアルデヒド(HOCH₂-CH(OH)-CHO)。同じ C₃H₆O₃ の構造異性体(最小のアルドース)。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: true, rs: "(R)/(S) ペア。**L-(+)-乳酸(S 体)が哺乳類筋肉の天然型**、D-(−)-乳酸は乳酸菌の一部や合成原料に。", note: "α 炭素は CH₃, H, OH, COOH の 4 種異なる置換基をもつ不斉炭素。" },
        conformers: []
      },
      stereochemistryDetail: "**最も単純な不斉カルボン酸**。\n\n- L-(+)-乳酸: 哺乳類筋肉の代謝中間体(疲労物質の代表)。ヨーグルト・大半の乳酸菌が生産する天然型。\n- D-(−)-乳酸: 一部の乳酸菌が生産、ある種のチーズに含まれる。\n- **乳酸を実験室合成(Strecker 等)するとラセミ体**となるが、発酵では菌種により光学純度の高い乳酸を得られる。"
    },

    malicAcid: {
      synthesisRoutes: [
        {
          id: "malicAcid_maleic_hydration",
          name: "マレイン酸の水和(工業的)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "マレイン酸(または無水マレイン酸)", formula: "HOOC-CH=CH-COOH", molKey: "maleicAcid" }],
            coReagents: [{ name: "水", formula: "H₂O", molKey: "water" }],
            catalyst: "硫酸または触媒水和",
            conditions: "加圧、加熱(200 °C 程度)",
            products: [{ name: "DL-リンゴ酸(ラセミ体)", formula: "HOOC-CH(OH)-CH₂-COOH", molKey: "malicAcid" }],
            byProducts: []
          },
          shortNote: "マレイン酸(または無水マレイン酸)に水を付加してリンゴ酸を得る工業的経路。",
          detail: "**HOOC-CH=CH-COOH + H₂O → HOOC-CH(OH)-CH₂-COOH**\n\n- マレイン酸の C=C に水を付加(Markovnikov 的な位置に OH)してリンゴ酸を得る。\n- 工業的にはマレイン酸無水物(→ マレイン酸)を出発点として生産される。\n- 化学合成ではラセミ体(DL-)となる。L 体は発酵法や酵素処理で得る。\n- 天然のリンゴ・青リンゴ・ブドウ等の果実に含まれる(果実の酸味の主要素)。",
          sources: ["Wikipedia: リンゴ酸"]
        }
      ],
      downstream: [
        {
          name: "クエン酸回路の中間体",
          leadsTo: [],
          shortNote: "生体内ではクエン酸回路の中間体(フマル酸→リンゴ酸→オキサロ酢酸)として代謝中枢に位置する。"
        },
        {
          name: "食品酸味料・口腔ケア",
          leadsTo: [],
          shortNote: "清涼飲料水・菓子の酸味料、リンゴ風味の付与に利用。pH 調整剤として食品工業で広く使われる。"
        }
      ],
      detectionReactions: [
        {
          reagent: "NaHCO₃ 水溶液",
          result: "positive",
          observation: "CO₂ を発泡しながら溶解",
          significance: "**ジカルボン酸**(pKa1 ≈ 3.40、pKa2 ≈ 5.11)",
          commonlyUsed: true,
          detail: "2 つの COOH をもつジカルボン酸。"
        },
        {
          reagent: "光学旋光",
          result: "positive",
          observation: "**L 体は左旋([α]D = −2.3°)**",
          significance: "不斉炭素の存在",
          commonlyUsed: false,
          detail: "α 炭素が不斉。L-(−)-リンゴ酸が生体内の天然型・果実中の主要型。化学合成ではラセミ体となる。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "tartaricAcid", note: "酒石酸(HOOC-CH(OH)-CH(OH)-COOH)。OH が 2 つの C₄H₆O₅ で関連だが分子式異なる。" },
          { molKey: null, note: "コハク酸(HOOC-CH₂-CH₂-COOH)。OH を除いた構造で関連。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: true, rs: "(R)/(S) ペア。**L-(−)-リンゴ酸(S 体)が天然型**、果実・生体内の主要型。", note: "α 炭素(C2)が COOH、OH、H、CH₂COOH の 4 種で不斉。" },
        conformers: []
      },
      stereochemistryDetail: "**1 つの不斉炭素**をもつジカルボン酸＋ヒドロキシ酸。\n\n- L-(−) 体: 果実・生体内の天然型\n- D-(+) 体: 合成原料・人工型\n- DL ラセミ体: 化学合成で得られる\n\nクエン酸回路の中間体として生命体のエネルギー代謝に必須。"
    },

    tartaricAcid: {
      synthesisRoutes: [
        {
          id: "tartaricAcid_wine_byproduct",
          name: "ワイン製造の副産物(酒石)からの抽出",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "ワイン樽の沈殿(酒石、酒石酸水素カリウム)", formula: "KHC₄H₄O₆", molKey: null }],
            coReagents: [{ name: "硫酸または塩酸", formula: "H₂SO₄", molKey: null }],
            catalyst: "",
            conditions: "水溶液、酸で遊離",
            products: [{ name: "L-(+)-酒石酸", formula: "HOOC-CH(OH)-CH(OH)-COOH", molKey: "tartaricAcid" }],
            byProducts: [{ name: "K 塩", formula: "—", molKey: null }]
          },
          shortNote: "ワイン醸造時に生じる結晶(酒石)から酸処理で抽出、天然 L-(+)-酒石酸を得る。",
          detail: "ブドウ果汁中に含まれる酒石酸が、発酵・熟成中に**酒石酸水素カリウム**として樽底に沈殿(**酒石**)。これを集めて酸性化することで L-(+)-酒石酸が得られる。\n\n- 天然はほぼ全て L-(+) 体。化学合成では他の立体異性体も得られる。\n- 食品(ベーキングパウダー、ワイン補酸)、医薬品(味付け)、染色等に利用。",
          sources: ["Wikipedia: 酒石酸"]
        }
      ],
      downstream: [
        {
          name: "Fehling 試薬の構成成分",
          leadsTo: [],
          shortNote: "Cu²⁺ をキレート化して水酸化物として沈殿させずに溶解状態に保つ役割。Fehling 反応試薬の必須成分。"
        },
        {
          name: "ベーキングパウダー・ワイン補酸",
          leadsTo: [],
          shortNote: "酒石酸水素 K(クリーム・オブ・タータル)は重曹と混ぜてベーキングパウダーの主成分。ワインの酸度調整にも。"
        }
      ],
      detectionReactions: [
        {
          reagent: "NaHCO₃ 水溶液",
          result: "positive",
          observation: "CO₂ を発泡しながら溶解",
          significance: "**ジカルボン酸**(pKa1 ≈ 3.04、pKa2 ≈ 4.37)",
          commonlyUsed: true,
          detail: "2 つの COOH をもつジカルボン酸で、隣接 OH の電子吸引効果でリンゴ酸より少し強い酸性。"
        },
        {
          reagent: "Cu(OH)₂ + NaOH",
          result: "positive",
          observation: "**深青色(青藍色)の銅錯体**",
          significance: "**隣接ジオール**の存在",
          commonlyUsed: true,
          detail: "隣接する 2 つの OH が Cu²⁺ にキレート配位して呈色(多価アルコール検出)。Fehling 試薬の作用機構そのもの。"
        },
        {
          reagent: "光学旋光",
          result: "positive",
          observation: "**L-(+) 体は右旋([α]D = +12°)、D-(−) 体は左旋、meso 体は不旋光**",
          significance: "**複数の立体異性体**",
          commonlyUsed: false,
          detail: "立体異性体ペア＋ meso 体で 3 種類の立体異性体が存在。Pasteur のラセミ体結晶分離の歴史的舞台。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "コハク酸(HOOC-CH₂-CH₂-COOH)。OH を除いた骨格。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: true, rs: "**2 つの不斉炭素 C2, C3 で 3 つの立体異性体**", note: "**L-(+) 体、D-(−) 体、meso 体**の 3 種類。L-(+)-酒石酸が天然のワイン由来型。**meso-酒石酸は (2R,3S) で内部対称面をもち光学不活性**(分子の半分が他の半分の鏡像で打ち消す)。" },
        conformers: []
      },
      stereochemistryDetail: "**meso 体をもつ立体異性体の歴史的代表例**。\n\n- 2 つの不斉炭素 C2, C3 → 立体異性体は最大 2² = 4 だが、対称性のため実際は **3 種類**(L-(+)、D-(−)、meso)\n- **meso-酒石酸**: (2R,3S)(= (2S,3R))、内部に対称面、不旋光\n- **Pasteur のラセミ体結晶分離(1848)**: 酒石酸ラセミ体結晶を顕微鏡下でピンセットで L/D に分離した有名な実験は、**立体化学の幕開け**として化学史で重要"
    },

    citricAcid: {
      synthesisRoutes: [
        {
          id: "citricAcid_aspergillus_fermentation",
          name: "コウジカビ(Aspergillus niger)による発酵(工業的)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "糖蜜・グルコース", formula: "—", molKey: null }],
            coReagents: [],
            catalyst: "Aspergillus niger(黒コウジカビ)",
            conditions: "好気、25〜30 °C、pH 2〜3(クエン酸蓄積のため酸性条件)",
            products: [{ name: "クエン酸", formula: "C₆H₈O₇", molKey: "citricAcid" }],
            byProducts: []
          },
          shortNote: "Aspergillus niger を用いた発酵法で糖からクエン酸を生産。世界の工業クエン酸生産の主流。",
          detail: "1920 年代に確立された**世界初の工業発酵プロセス**の一つ。\n\n- かつてはレモン等の柑橘から抽出していたが、コウジカビ発酵により大規模・低コスト生産が可能に。\n- 黒コウジカビは酸性条件下で活発に増殖し、クエン酸回路の酵素活性を一時的に偏らせて大量にクエン酸を蓄積する。\n- 現代の年間世界生産は約 200 万トンで、食品工業・洗剤・医薬品の基幹原料。",
          sources: ["Wikipedia: クエン酸"]
        }
      ],
      downstream: [
        {
          name: "クエン酸回路(生体エネルギー代謝の中枢)",
          leadsTo: [],
          shortNote: "好気生物のエネルギー代謝中枢(TCA 回路、Krebs 回路)の出発物質。アセチル CoA との縮合で開始。"
        },
        {
          name: "食品酸味料・清涼飲料水",
          leadsTo: [],
          shortNote: "ジュース・炭酸飲料・キャンディの酸味料として広く使用。クエン酸 Na は pH 調整剤・血液抗凝固剤(採血保存液)にも。"
        },
        {
          name: "金属イオンキレート剤",
          leadsTo: [],
          shortNote: "3 つの COOH が金属イオンを錯体化、洗剤・水質調整・配管洗浄等にキレート剤として利用。"
        }
      ],
      detectionReactions: [
        {
          reagent: "NaHCO₃ 水溶液",
          result: "positive",
          observation: "**CO₂ を激しく発泡**しながら溶解(3 段階分)",
          significance: "**トリカルボン酸**(3 つの COOH)",
          commonlyUsed: true,
          detail: "pKa1 ≈ 3.13、pKa2 ≈ 4.76、pKa3 ≈ 6.39 の段階解離。COOH 3 つ分の H⁺ で NaHCO₃ と反応する。"
        },
        {
          reagent: "FeCl₃ 水溶液",
          result: "positive",
          observation: "黄色〜淡褐色の Fe-クエン酸錯体",
          significance: "**金属キレート能**",
          commonlyUsed: false,
          detail: "クエン酸は鉄を強くキレート化することで知られ、医薬品(鉄分補給)や工業(鉄汚れ除去)に利用。"
        },
        {
          reagent: "光学旋光",
          result: "negative",
          observation: "**旋光性を示さない**(光学不活性)",
          significance: "**不斉炭素なし**",
          commonlyUsed: false,
          detail: "中央 sp³ 炭素 C3 は OH、COOH、CH₂COOH、CH₂COOH の置換だが、**CH₂COOH が 2 つ同じ**ため不斉中心にならない(pro-chiral 中心)。3 つの COOH をもつ大きな分子ながら光学活性をもたない教科書的例。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "**イソクエン酸**(HOOC-CH(OH)-CH(COOH)-CH₂-COOH)。同じ C₆H₈O₇ の構造異性体。生体内ではクエン酸回路で中間体として現れる。" },
          { molKey: null, note: "アコニット酸(HOOC-CH=C(COOH)-CH₂-COOH)は脱水生成物(C₆H₆O₆)で異性体ではない。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "中央 C は CH₂COOH を 2 つ持つため**不斉ではない**(pro-chiral)。光学活性なし。" },
        conformers: []
      },
      stereochemistryDetail: "**3 つの COOH をもつトリカルボン酸**だが、**対称性のため光学不活性**。\n\n- 中央 C は OH、COOH、CH₂COOH × 2 で対称化されており、不斉炭素ではない。\n- ただし生体内の酵素は左右の CH₂COOH 基を区別できる(**pro-chirality**)ので、生化学的にはイソクエン酸への変換に区別が現れる。\n- 食品・生化学の最重要有機酸の一つ。"
    },

    maleicAcid: {
      synthesisRoutes: [
        {
          id: "maleicAcid_anhydride_hydrolysis",
          name: "無水マレイン酸の加水分解",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "無水マレイン酸", formula: "C₄H₂O₃", molKey: "maleicAnhydride" }],
            coReagents: [{ name: "水", formula: "H₂O", molKey: "water" }],
            catalyst: "",
            conditions: "水中、室温〜温和な加熱",
            products: [{ name: "マレイン酸", formula: "cis-HOOC-CH=CH-COOH", molKey: "maleicAcid" }],
            byProducts: []
          },
          shortNote: "無水マレイン酸を温水で加水分解、cis-2-ブテンジ酸であるマレイン酸を得る。",
          detail: "**C₄H₂O₃ + H₂O → cis-HOOC-CH=CH-COOH**\n\n- 無水物の加水分解は容易に進む。\n- 工業的にはマレイン酸より無水マレイン酸(無水物)の方が需要が大きく、マレイン酸を単離する場面は限定的。\n- 加熱(150 °C)で再び水を失って無水物に戻る**可逆な脱水平衡**が特徴(cis 体だからこそ可能)。",
          sources: ["Wikipedia: マレイン酸", "Wikipedia: 無水マレイン酸"]
        }
      ],
      downstream: [
        {
          name: "水和によるリンゴ酸",
          leadsTo: ["malicAcid"],
          shortNote: "C=C に水を付加してリンゴ酸を生成。工業的なリンゴ酸製造の主経路。"
        },
        {
          name: "フマル酸への異性化",
          leadsTo: [],
          shortNote: "紫外光照射や臭素・酸触媒下で C=C が異性化、より安定な trans 体(フマル酸)に変換される。"
        },
        {
          name: "脱水による無水マレイン酸",
          leadsTo: ["maleicAnhydride"],
          shortNote: "150 °C 程度に加熱すると分子内脱水で 5 員環無水物(無水マレイン酸)に戻る。"
        }
      ],
      detectionReactions: [
        {
          reagent: "Br₂ 水",
          result: "positive",
          observation: "**褐色が脱色**",
          significance: "**C=C 二重結合**の存在",
          commonlyUsed: true,
          detail: "C=C に Br₂ が付加し 2,3-ジブロモコハク酸を生成。アルケン特有の反応。"
        },
        {
          reagent: "NaHCO₃ 水溶液",
          result: "positive",
          observation: "**CO₂ を発泡**しながら溶解",
          significance: "**ジカルボン酸**(pKa1 ≈ 1.90、pKa2 ≈ 6.07)",
          commonlyUsed: true,
          detail: "2 つの COOH をもつ強酸性ジカルボン酸。pKa1 が低いのは cis-COOH 同士が水素結合して片方の COOH のプロトンが脱離しやすいため。"
        },
        {
          reagent: "加熱(150 °C 以上)",
          result: "positive",
          observation: "**水を失って無水マレイン酸(環状無水物)に変化**",
          significance: "**cis 体特有**の挙動",
          commonlyUsed: true,
          detail: "**マレイン酸(cis、陽性)vs フマル酸(trans、陰性)の決定的判別**。\n\n- マレイン酸: 2 つの COOH が同じ側にあり**分子内脱水で 5 員環無水物**を作れる\n- フマル酸: 2 つの COOH が反対側にあり**分子内脱水できない**(無水フマル酸は存在しない)"
        },
        {
          reagent: "融点測定",
          result: "positive",
          observation: "**mp 130 °C**(フマル酸は 287 °C)",
          significance: "シス・トランス異性体の判別",
          commonlyUsed: false,
          detail: "cis 体は分子内水素結合のため結晶パッキングが弱く融点が低い。trans 体は分子間水素結合の強い結晶で融点が高い。"
        }
      ],
      isomersDetail: {
        structural: [],
        geometric: [
          { type: "cis-trans (Z/E)", note: "**マレイン酸(cis、Z 体)と フマル酸(trans、E 体)はシス・トランス異性体**。マレイン酸が cis(2 つの COOH が同じ側)、フマル酸が trans(反対側)。**高校化学のシス・トランス異性の代表ペア**。" }
        ],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "**フマル酸とのシス・トランス異性体ペア**として高校化学の頻出例。\n\n- マレイン酸(cis、不安定): mp 130 °C、加熱で脱水→無水マレイン酸、分子内 H 結合可\n- フマル酸(trans、安定): mp 287 °C、加熱で脱水しない、生体クエン酸回路の中間体(天然型)\n\n物性・反応性の劇的な違いは、**幾何異性が物性を決める**典型例として教科書頻出。"
    },

    maleicAnhydride: {
      synthesisRoutes: [
        {
          id: "maleicAnhydride_butane_oxidation",
          name: "n-ブタンの空気酸化(工業的・現代主流)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "n-ブタン", formula: "C₄H₁₀", molKey: "butane" }],
            coReagents: [{ name: "酸素", formula: "O₂", molKey: "oxygen" }],
            catalyst: "V/P/O(バナジウム-リン酸化物)系触媒",
            conditions: "気相、380〜440 °C",
            products: [{ name: "無水マレイン酸", formula: "C₄H₂O₃", molKey: "maleicAnhydride" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "n-ブタンの空気酸化で 4 個の C を維持したまま 6 個の H を 3 個の O に置換、無水マレイン酸を生成。",
          detail: "**C₄H₁₀ + 7/2 O₂ → C₄H₂O₃ + 4 H₂O**(V/P/O 触媒)\n\n- 1970 年代以降、ベンゼン経路から置き換わった現代の主流法。\n- 1 段で 8 個の H を抜き取りつつ 3 個の O を導入する**極めて選択性の高い触媒反応**。\n- 原料の n-ブタンは LPG・天然ガス由来で安価、原子効率がよい。",
          sources: ["Wikipedia: 無水マレイン酸"]
        },
        {
          id: "maleicAnhydride_benzene_oxidation",
          name: "ベンゼンの空気酸化(古典的工業法)",
          type: "historical",
          famous: true,
          equation: {
            reactants: [{ name: "ベンゼン", formula: "C₆H₆", molKey: "benzene" }],
            coReagents: [{ name: "酸素", formula: "O₂", molKey: "oxygen" }],
            catalyst: "V₂O₅(五酸化バナジウム)",
            conditions: "気相、350〜400 °C",
            products: [{ name: "無水マレイン酸", formula: "C₄H₂O₃", molKey: "maleicAnhydride" }],
            byProducts: [
              { name: "二酸化炭素", formula: "CO₂", molKey: "carbonDioxide" },
              { name: "水", formula: "H₂O", molKey: "water" }
            ]
          },
          shortNote: "ベンゼンを V₂O₅ 触媒で気相酸化、炭素 2 個を CO₂ として失いつつ無水マレイン酸を得る古典的経路。",
          detail: "**C₆H₆ + 9/2 O₂ → C₄H₂O₃ + 2 CO₂ + 2 H₂O**(V₂O₅ 触媒)\n\n- 1928 年から工業化された古い経路。\n- 炭素を 2 個(→ CO₂)失うため原子効率が悪く、現代では n-ブタン経路に置き換わった。\n- 同じく V₂O₅ 触媒で類似経路(ナフタレン→無水フタル酸)と対比される。",
          sources: ["Wikipedia: 無水マレイン酸"]
        }
      ],
      downstream: [
        {
          name: "不飽和ポリエステル樹脂(FRP の母体)",
          leadsTo: [],
          shortNote: "プロピレングリコール等とのエステル縮合で**不飽和ポリエステル樹脂**を生成。スチレンと架橋して FRP(繊維強化プラスチック)の基盤に。"
        },
        {
          name: "加水分解によるマレイン酸",
          leadsTo: ["maleicAcid"],
          shortNote: "温水で加水分解しマレイン酸へ。"
        },
        {
          name: "水和(→リンゴ酸、酒石酸経由)",
          leadsTo: ["malicAcid"],
          shortNote: "マレイン酸経由で水和してリンゴ酸、さらに二重水和で酒石酸へ(工業的食品酸合成)。"
        },
        {
          name: "Diels–Alder 反応のジエノフィル",
          leadsTo: [],
          shortNote: "強い電子求引性(C=O × 2 + C=C)のため、多くのジエンと容易に [4+2] 付加。**Diels–Alder の最も使われるジエノフィル**。"
        }
      ],
      detectionReactions: [
        {
          reagent: "Br₂ 水",
          result: "positive",
          observation: "**脱色**",
          significance: "C=C 二重結合の存在",
          commonlyUsed: true,
          detail: "C=C に Br₂ が付加してジブロモコハク酸無水物を生成。アルケン特有の反応。"
        },
        {
          reagent: "水(加水分解)",
          result: "positive",
          observation: "**マレイン酸の溶液となる**(NaHCO₃ で発泡するようになる)",
          significance: "**酸無水物**であることを示す",
          commonlyUsed: false,
          detail: "酸無水物の典型的反応。アルコールとはエステル、アンモニアとはアミドを生成する反応性。"
        },
        {
          reagent: "視認",
          result: "positive",
          observation: "**白色針状結晶**(mp 53 °C)、容易に昇華",
          significance: "無水マレイン酸特有",
          commonlyUsed: false,
          detail: "水・有機溶媒に可溶、空気中で徐々に加水分解。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "理論上**無水フマル酸**(trans 体の環状無水物)は存在しない(trans の 2 つの COOH は環を作れない)。**cis 体のみが分子内脱水できる**点が高校化学の頻出論点。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "**cis 体(マレイン酸)特有の 5 員環無水物**。\n\n- trans 体(フマル酸)は構造上 5 員環を作れないため**無水フマル酸は存在しない**。\n- これは**シス・トランス異性が物性・反応性を決める**最も劇的な例の一つ。\n- 無水フタル酸(o-ベンゼンジカルボン酸の無水物)と並ぶ「環状酸無水物の代表ペア」として工業有機化学で重要。"
    },

    sudan1: {
      synthesisRoutes: [
        {
          id: "sudan1_diazo_coupling",
          name: "ベンゼンジアゾニウム塩と 2-ナフトールのジアゾカップリング",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "塩化ベンゼンジアゾニウム", formula: "C₆H₅N₂Cl", molKey: "benzeneDiazonium" }],
            coReagents: [{ name: "2-ナフトール(β-ナフトール)", formula: "C₁₀H₈O", molKey: "naphthol" }],
            catalyst: "",
            conditions: "弱塩基性(pH 8〜10)、0〜5 °C",
            products: [{ name: "スーダン I", formula: "C₆H₅-N=N-C₁₀H₆-OH", molKey: "sudan1" }],
            byProducts: [{ name: "塩化ナトリウム", formula: "NaCl", molKey: "sodiumChloride" }]
          },
          shortNote: "ジアゾニウム塩が 2-ナフトールの 1 位を求電子置換、橙赤色アゾ染料スーダン I を生成。",
          detail: "**C₆H₅N₂⁺ + 2-ナフトール → 1-フェニルアゾ-2-ナフトール**\n\n- 2-ナフトールの 1 位は OH の o-/p- 配向で最も活性化されており、ジアゾニウム塩の求電子攻撃を受ける。\n- 鮮やかな**赤橙色**の油溶性染料。\n- かつて食品着色料として使われたが、**発がん性疑いのため現在は食品用途禁止**。工業染料・教育用試薬として現存。",
          sources: ["Wikipedia: スーダン I", "Wikipedia: ジアゾカップリング"]
        }
      ],
      downstream: [
        {
          name: "油性染色・工業着色剤",
          leadsTo: [],
          shortNote: "油溶性に優れ、ワックス・プラスチック・蝋燭等の油性物質の着色に使用。"
        },
        {
          name: "Na₂S₂O₄ による還元的アゾ結合切断",
          leadsTo: ["aniline"],
          shortNote: "亜ジチオン酸 Na 等で N=N 結合を還元的に切断、アニリンと 1-アミノ-2-ナフトールに分解。アゾ染料の構造解析の基本反応。"
        }
      ],
      detectionReactions: [
        {
          reagent: "視認",
          result: "positive",
          observation: "**鮮やかな橙赤色の結晶**(mp 131 °C)",
          significance: "アゾ染料特有",
          commonlyUsed: true,
          detail: "アゾ基(N=N)と 2 つの芳香環(一方に OH)からなる発色団系(D-π-A 系)が可視光に強く吸収。橙赤色は λmax ≈ 480 nm。"
        },
        {
          reagent: "Na₂S₂O₄(還元剤)",
          result: "positive",
          observation: "**橙赤色が消失**(無色のアミン 2 種に分解)",
          significance: "**アゾ基 N=N の還元的切断**を示す",
          commonlyUsed: false,
          detail: "p-ヒドロキシアゾベンゼンと同じく、アゾ染料の特徴的反応。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "Sudan II, III, IV など他のアゾ染料は構造上の類縁体(カップリング相手や置換基が異なる)。" }
        ],
        geometric: [
          { type: "E/Z (trans/cis)", note: "アゾ基 N=N のシス・トランス異性体が存在しうるが、室温では E 体が圧倒的に安定。光照射で一時的に Z 体に異性化可能(フォトクロミック)。" }
        ],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "アゾ染料の代表例。N=N 二重結合に**E/Z 異性**が形式的に存在(室温では E 体)。\n\n- 油溶性で鮮やかな橙赤色を呈する。\n- p-ヒドロキシアゾベンゼンの構造拡張(フェニル → ナフチル)で色調が深色シフトしている。"
    },

    methylOrange: {
      synthesisRoutes: [
        {
          id: "methylOrange_diazo_coupling",
          name: "ジアゾカップリング(スルファニル酸 + N,N-ジメチルアニリン)",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "スルファニル酸(p-アミノベンゼンスルホン酸)のジアゾニウム塩", formula: "—", molKey: null }],
            coReagents: [{ name: "N,N-ジメチルアニリン", formula: "(CH₃)₂N-C₆H₅", molKey: null }],
            catalyst: "",
            conditions: "弱酸性〜中性、0〜5 °C",
            products: [{ name: "メチルオレンジ", formula: "C₁₄H₁₄N₃SO₃Na", molKey: "methylOrange" }],
            byProducts: []
          },
          shortNote: "スルファニル酸をジアゾ化し N,N-ジメチルアニリンとカップリング、橙色アゾ染料メチルオレンジを得る。",
          detail: "**(1) スルファニル酸 + NaNO₂ + HCl → ジアゾニウム塩**\n**(2) ジアゾニウム塩 + (CH₃)₂N-C₆H₅ → メチルオレンジ**(弱酸性〜中性カップリング)\n\n- アニリン側(カップラー)は N,N-ジメチル基により p- 位が活性化されており、p-カップリング体が選択的に得られる。\n- スルホ基(SO₃Na)が水溶性を与え、**pH 指示薬として広く使われる**。",
          sources: ["Wikipedia: メチルオレンジ"]
        }
      ],
      downstream: [
        {
          name: "酸塩基滴定の pH 指示薬",
          leadsTo: [],
          shortNote: "強酸-強塩基滴定や、弱塩基-強酸滴定で変色を視覚的に確認する標準指示薬。"
        }
      ],
      detectionReactions: [
        {
          reagent: "pH 試験(酸塩基滴定)",
          result: "positive",
          observation: "**pH 3.1 以下: 赤色／pH 4.4 以上: 黄色**(変色域 pH 3.1〜4.4)",
          significance: "**pH 指示薬**としての挙動",
          commonlyUsed: true,
          detail: "**塩基性で黄、酸性で赤**に変色する代表的な指示薬。\n\n- 変色は分子構造の変化による: 酸性下ではキノイド型(赤)、塩基性下ではアゾ型(黄)に。\n- 強塩基-強酸滴定(NaOH + HCl)の終点付近で急峻に色が変化するため、滴定指示薬として使われる。\n- フェノールフタレイン(変色域 pH 8〜10)と対の指示薬。"
        },
        {
          reagent: "視認(中性付近)",
          result: "positive",
          observation: "**橙色の結晶／粉末**",
          significance: "メチルオレンジ特有",
          commonlyUsed: false,
          detail: "中性水溶液(pH 6〜7)では赤と黄の中間で橙色。pH によって連続的に変化する。"
        }
      ],
      isomersDetail: {
        structural: [],
        geometric: [
          { type: "E/Z(trans/cis)", note: "アゾ基 N=N に幾何異性が形式的に存在。室温では E 体が圧倒的に安定。" }
        ],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "**pH 指示薬の代表例**。\n\n- 酸性下では中央 N=N の片側がプロトン化され、キノイド型構造(赤)になる。\n- 塩基性下では中性アゾ型構造(黄)に戻る。\n- この**プロトン化/脱プロトン化に伴う共鳴構造の変化**が色の変化の本質。フェノールフタレインと並ぶ酸塩基滴定の標準指示薬。"
    },

    phenolphthalein: {
      synthesisRoutes: [
        {
          id: "phenolphthalein_phthalic_phenol",
          name: "無水フタル酸とフェノールの縮合",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "無水フタル酸", formula: "C₈H₄O₃", molKey: "phthalicAnhydride" }],
            coReagents: [{ name: "フェノール(2 当量)", formula: "C₆H₅OH", molKey: "phenol" }],
            catalyst: "濃硫酸または ZnCl₂",
            conditions: "120〜130 °C、加熱",
            products: [{ name: "フェノールフタレイン", formula: "C₂₀H₁₄O₄", molKey: "phenolphthalein" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "無水フタル酸とフェノール 2 分子を酸触媒下で縮合、フェノールフタレインを得る。",
          detail: "**C₈H₄O₃ + 2 C₆H₅OH → C₂₀H₁₄O₄ + H₂O**\n\n- 1871 年に A. von Baeyer が初めて合成。\n- フタル酸のカルボニル C にフェノールの p-位が 2 つ求電子置換し、続いてラクトン環が形成される。\n- 中性〜酸性で**無色のラクトン型**、塩基性で**赤紫色のキノイド型(開環構造)**となる pH 指示薬。",
          sources: ["Wikipedia: フェノールフタレイン"]
        }
      ],
      downstream: [
        {
          name: "酸塩基滴定の pH 指示薬",
          leadsTo: [],
          shortNote: "中和滴定の最も標準的な指示薬の一つ。塩基性での明瞭な赤紫呈色で滴定終点を視認できる。"
        },
        {
          name: "コンクリート中性化試験",
          leadsTo: [],
          shortNote: "コンクリートに噴霧して赤紫呈色しない部分が「中性化」(CO₂ で塩基性が失われた)と判定。建築物の劣化診断に使用。"
        }
      ],
      detectionReactions: [
        {
          reagent: "pH 試験(酸塩基滴定)",
          result: "positive",
          observation: "**pH 8.0 以下: 無色／pH 10.0 以上: 赤紫色**(変色域 pH 8.0〜10.0)",
          significance: "**pH 指示薬**としての挙動",
          commonlyUsed: true,
          detail: "**酸性・中性で無色、塩基性で赤紫色**に変色する代表的な指示薬。\n\n- 機構: 塩基性下で OH が脱プロトン化されラクトン環が開環、共役系が伸長してキノイド型(赤紫)になる。\n- 強塩基-強酸滴定(NaOH + HCl)や弱酸-強塩基滴定(CH₃COOH + NaOH)の終点指示薬として最重要。\n- pH 13 以上の超強塩基では再び無色になる(さらなる脱プロトン化)。"
        },
        {
          reagent: "視認(中性)",
          result: "positive",
          observation: "**白色〜薄黄色の結晶**",
          significance: "フェノールフタレイン特有",
          commonlyUsed: false,
          detail: "結晶では無色だが、不純物等でやや黄味がかる。エタノール水溶液として市販される。"
        }
      ],
      isomersDetail: {
        structural: [],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: [
          { name: "ラクトン型(無色)", stability: "**酸性・中性で安定**。フタリド(5 員環ラクトン)構造、芳香環が孤立し共役系が短い。" },
          { name: "キノイド型(赤紫)", stability: "**塩基性で安定**。ラクトン環が開いて 2 つのフェノキシド+キノイド構造になり、共役系が大きく伸長。" }
        ]
      },
      stereochemistryDetail: "**pH に応じて環の開閉で色が変化する**特殊な指示薬。\n\n- 中性: 閉じたラクトン型(無色)\n- 塩基性: 開いたキノイド型(赤紫)\n- メチルオレンジ(変色域 pH 3〜4)と対をなす、酸塩基滴定の二大標準指示薬。"
    },

    methylRed: {
      synthesisRoutes: [
        {
          id: "methylRed_diazo_coupling",
          name: "アントラニル酸誘導体由来ジアゾ＋ N,N-ジメチルアニリンのカップリング",
          type: "lab",
          famous: false,
          equation: {
            reactants: [{ name: "o-アミノ安息香酸(アントラニル酸)のジアゾニウム塩", formula: "—", molKey: null }],
            coReagents: [{ name: "N,N-ジメチルアニリン", formula: "(CH₃)₂N-C₆H₅", molKey: null }],
            catalyst: "",
            conditions: "弱酸性、0〜5 °C",
            products: [{ name: "メチルレッド", formula: "C₁₅H₁₅N₃O₂", molKey: "methylRed" }],
            byProducts: []
          },
          shortNote: "アントラニル酸をジアゾ化し N,N-ジメチルアニリンとカップリング、赤色アゾ染料を得る。",
          detail: "**メチルオレンジと類似の構造**(SO₃Na の代わりに COOH をもつ)。\n\n- 末端官能基が SO₃Na → COOH に変わることで pKa が変化(COOH の方が弱酸 → 共役塩基への変換が pH の高い側で起こる)し、変色域が変化する。\n- メチルオレンジ(pH 3.1〜4.4)よりわずかに高い pH 4.4〜6.2 で変色。",
          sources: ["Wikipedia: メチルレッド"]
        }
      ],
      downstream: [
        {
          name: "酸塩基滴定の pH 指示薬",
          leadsTo: [],
          shortNote: "弱塩基-強酸滴定の終点指示薬として最適(変色域がアンモニア緩衝域に近い)。微生物の代謝産物検出(メチルレッド試験、IMViC)にも使用。"
        }
      ],
      detectionReactions: [
        {
          reagent: "pH 試験",
          result: "positive",
          observation: "**pH 4.4 以下: 赤色／pH 6.2 以上: 黄色**(変色域 pH 4.4〜6.2)",
          significance: "**pH 指示薬**としての挙動",
          commonlyUsed: true,
          detail: "**メチルオレンジとほぼ同じ機構**(プロトン化キノイド型 赤 ⇌ 中性アゾ型 黄)だが、SO₃Na→COOH の置き換えで変色域がやや塩基性側にシフトしている。\n\n- 弱塩基(NH₃ 等)の強酸滴定の終点指示薬として優れる。"
        }
      ],
      isomersDetail: {
        structural: [],
        geometric: [
          { type: "E/Z(trans/cis)", note: "アゾ基 N=N の幾何異性。室温では E 体が安定。" }
        ],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "メチルオレンジと同系統のアゾ系 pH 指示薬。\n\n- 末端官能基(COOH vs SO₃Na)の違いで変色域が変わる。\n- メチルオレンジ(pH 3〜4)、メチルレッド(pH 4〜6)、フェノールフタレイン(pH 8〜10)と段階的に変色域の異なる指示薬を使い分けるのが酸塩基滴定の基本。"
    },

    indigo: {
      synthesisRoutes: [
        {
          id: "indigo_heumann",
          name: "Heumann 合成(工業的)",
          type: "industrial",
          famous: true,
          equation: {
            reactants: [{ name: "N-フェニルグリシン", formula: "C₆H₅-NH-CH₂-COOH", molKey: null }],
            coReagents: [
              { name: "強塩基(NaOH/NaNH₂/KOH の融解物)", formula: "—", molKey: null },
              { name: "酸素(最終酸化)", formula: "O₂", molKey: "oxygen" }
            ],
            catalyst: "",
            conditions: "(1) アルカリ融解 200〜300 °C → インドキシル (2) 空気酸化",
            products: [{ name: "インジゴ", formula: "C₁₆H₁₀N₂O₂", molKey: "indigo" }],
            byProducts: [{ name: "水", formula: "H₂O", molKey: "water" }]
          },
          shortNote: "N-フェニルグリシンをアルカリ融解でインドキシルに変換、空気酸化で藍色のインジゴを得る。",
          detail: "**(1) C₆H₅-NH-CH₂-COOH(NaOH 融解、300 °C)→ インドキシル**(環化＋脱炭酸)\n**(2) 2 インドキシル + O₂ → インジゴ + 2 H₂O**(空気酸化、二量化)\n\n- 1897 年に K. Heumann が工業化した方法(BASF)。\n- 古来は**藍(タデ藍、Indigofera 属)の発酵抽出**で得ていたが、Heumann 合成の確立で合成品が天然染料に置き換わった歴史的な化学工業の成功例。\n- ジーンズ(デニム)の青色染色の主役。",
          sources: ["Wikipedia: インジゴ", "Wikipedia: 藍染め"]
        }
      ],
      downstream: [
        {
          name: "藍染め(建て染め)",
          leadsTo: [],
          shortNote: "**還元 → 可溶性ロイコ体(無色〜黄色)→ 繊維に浸み込ませる → 空気酸化で発色(青)**の建て染めサイクルで繊維を染色。ジーンズ・伝統的な藍染め製品。"
        }
      ],
      detectionReactions: [
        {
          reagent: "視認",
          result: "positive",
          observation: "**深い藍色(青)の結晶／粉末**、難溶",
          significance: "インジゴ特有の発色",
          commonlyUsed: true,
          detail: "中央 C=C の両側に C=O・N-H を持つ**クロス共役系**が可視光全領域に強く吸収し、藍青色を呈する。"
        },
        {
          reagent: "Na₂S₂O₄(亜ジチオン酸ナトリウム、還元)",
          result: "positive",
          observation: "**藍色が消失し、可溶性のロイコ体(淡黄色)に変化**",
          significance: "**還元での可溶化(建て染めの原理)**",
          commonlyUsed: false,
          detail: "中央 C=C と 2 つの C=O が還元され、ロイコ-インジゴ(無色のヒドロキシ体)となる。これは水溶性アルカリ塩で繊維に吸着する。\n\nその後、空気酸化で繊維上に元のインジゴが再現され青色を呈する。**「建て染め」**のサイクルの本質。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "**インジルビン**(同じ C₁₆H₁₀N₂O₂、結合パターンが異なる赤色異性体)。タデ藍中に少量含まれる。" }
        ],
        geometric: [
          { type: "trans/cis (E/Z)", note: "中央 C=C は通常 trans 体で結晶化、共平面性が高く強い色を呈する。" }
        ],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: []
      },
      stereochemistryDetail: "**世界最古の染料の一つ**で、青色染料の代表。\n\n- 古代エジプト・古代インド以来、植物(タデ藍・インディゴ)から発酵で得ていた。\n- Heumann 合成(1897)で工業合成可能となり、現代のジーンズ青色はほぼ全て合成インジゴ。\n- 中央 C=C と 4 つの C=O/N-H のクロス共役で深色化、難溶のため**還元-酸化サイクル(建て染め)**で繊維に染着させる伝統的な染色法が現代も使われる。"
    },

    btb: {
      synthesisRoutes: [
        {
          id: "btb_thymol_sulfonation_bromination",
          name: "チモールスルホンフタレインの臭素化",
          type: "lab",
          famous: false,
          equation: {
            reactants: [{ name: "チモールスルホンフタレイン", formula: "—", molKey: null }],
            coReagents: [{ name: "臭素", formula: "Br₂", molKey: "bromine" }],
            catalyst: "",
            conditions: "氷酢酸中、室温",
            products: [{ name: "ブロモチモールブルー", formula: "C₂₇H₂₈Br₂O₅S", molKey: "btb" }],
            byProducts: [{ name: "臭化水素", formula: "HBr", molKey: "hydrogenBromide" }]
          },
          shortNote: "チモールスルホンフタレイン(チモール 2 分子と無水サルチノ酸との縮合体)に Br₂ を作用させて臭素化、BTB を得る。",
          detail: "上流: チモール(2-イソプロピル-5-メチルフェノール)2 分子と o-スルホ安息香酸無水物の縮合でチモールスルホンフタレインを作り、これを Br₂ で臭素化して**ジブロモ体**となる。\n\n- 1923 年に H. A. Lubs と W. M. Clark により pH 指示薬として導入。\n- フェノールフタレインのスルホン誘導体型に Br を導入した構造で、変色域が中性付近に調整されている。",
          sources: ["Wikipedia: ブロモチモールブルー"]
        }
      ],
      downstream: [
        {
          name: "水質試験・プール水試験",
          leadsTo: [],
          shortNote: "中性付近の pH を判定する最も身近な指示薬。学校のプール水・水槽水・飲料水の pH 簡易測定に使用。"
        },
        {
          name: "微生物の発酵試験",
          leadsTo: [],
          shortNote: "微生物が糖を分解して酸を産生すると黄色変、菌の発酵能を判定する培地(OF 培地等)の指示薬として使用。"
        }
      ],
      detectionReactions: [
        {
          reagent: "pH 試験",
          result: "positive",
          observation: "**pH 6.0 以下: 黄色／pH 7.6 以上: 青色／中間: 緑色**(変色域 pH 6.0〜7.6)",
          significance: "**中性付近の pH 指示薬**",
          commonlyUsed: true,
          detail: "**酸性で黄、中性で緑、塩基性で青**に変化する **3 色変化指示薬**。\n\n- 機構: フェノール OH の脱プロトン化に伴う共役系の変化で吸収波長が変化。\n- 変色域が中性付近(pH 6〜7.6)にあるため、**ヒト体液や水道水・水槽水の pH 判定**に最適。\n- 中学校・高校理科実験で最頻出の指示薬。CO₂ を吹き込むと青→緑→黄に段階的に変色する(CO₂ が水に溶けて H₂CO₃ となる)デモが定番。"
        },
        {
          reagent: "視認(中性付近)",
          result: "positive",
          observation: "**緑色の水溶液**(中性、pH ≈ 7)",
          significance: "BTB 特有",
          commonlyUsed: false,
          detail: "結晶は赤褐色だが、水溶液(特に中性付近)では緑色〜青緑色。「中性 = 緑」のイメージは BTB の中間色から。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: null, note: "ブロモクレゾールパープル、ブロモフェノールブルー、ブロモクレゾールグリーン等の関連スルホンフタレイン系指示薬。臭素・メチル基の位置や置換数で変色域が変わる。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: null, note: "" },
        conformers: [
          { name: "ラクトン型(黄色、酸性)", stability: "**酸性条件**で安定。5 員環スルホンラクトンが閉じた構造で、共役系が短く可視光吸収は青〜黄領域。" },
          { name: "キノイド型(青色、塩基性)", stability: "**塩基性条件**で安定。フェノール OH が脱プロトン化されてラクトン環が開き、伸長した共役系が長波長を吸収して青色に。" }
        ]
      },
      stereochemistryDetail: "**中性付近で変色する代表的な pH 指示薬**で、メチルオレンジ(酸性域)・メチルレッド(弱酸域)・フェノールフタレイン(塩基性域)と並ぶ標準指示薬群の中で**中性域**を担当する。\n\n- 酸性: 黄(pH < 6.0)\n- 中性: 緑(pH 6.0〜7.6)\n- 塩基性: 青(pH > 7.6)\n\n3 色変化の視認しやすさから、**理科教育の象徴的な化学試薬**として最も身近な指示薬の一つ。"
    },

    binolR: {
      synthesisRoutes: [
        {
          id: "binolR_naphthol_coupling_resolution",
          name: "2-ナフトールの酸化的カップリング＋光学分割",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "2-ナフトール", formula: "C₁₀H₈O", molKey: "naphthol" }],
            coReagents: [{ name: "Cu(II) 触媒・酸化剤(FeCl₃・空気など)", formula: "—", molKey: null }],
            catalyst: "CuCl(OH)・TMEDA、または Fe 系酸化剤",
            conditions: "(1) 酸化的カップリング(CHCl₃ 中、80 °C 等)→ ラセミ BINOL (2) ジアステレオマー塩法または酵素法で光学分割",
            products: [{ name: "(R)-BINOL", formula: "C₂₀H₁₄O₂", molKey: "binolR" }],
            byProducts: [{ name: "(S)-BINOL(同時生成、後で分離)", formula: "C₂₀H₁₄O₂", molKey: "binolS" }]
          },
          shortNote: "2 分子の 2-ナフトールを酸化的に C-C カップリングしてラセミ BINOL を作り、光学分割で (R) 体を得る。",
          detail: "**(1) 2 × 2-ナフトール → (±)-BINOL**(酸化的カップリング)\n**(2) (±)-BINOL → (R)-BINOL + (S)-BINOL**(光学分割)\n\n- 2-ナフトールの 1 位は OH の o-/p- 配向で活性化されており、Cu 等の酸化触媒で 1,1' カップリングが起こる。\n- 生成物はラセミ体だが、回転障壁が極めて高く(〜160 kJ/mol)室温で**安定なエナンチオマー**として単離可能。\n- 光学分割法: シンコニジン等のキラルアミンとのジアステレオマー塩、または酵素的分割。\n- **野依良治のノーベル賞研究(2001 年)**でも BINOL 系不斉触媒が中心的役割を果たした。",
          sources: ["Wikipedia: BINOL", "Wikipedia: 軸不斉"]
        }
      ],
      downstream: [
        {
          name: "不斉触媒(BINAP・BINOL-Ti 等)",
          leadsTo: [],
          shortNote: "OH をリン置換した BINAP(野依触媒)、Ti と錯体化した BINOL-Ti などとして不斉合成の触媒に。多くのキラル医薬品合成の鍵。"
        },
        {
          name: "不斉認識・キラルセンサー",
          leadsTo: [],
          shortNote: "ホスト化合物として光学活性ゲストを認識、キラルセンサー・不斉認識材料に応用。"
        }
      ],
      detectionReactions: [
        {
          reagent: "FeCl₃ 水溶液",
          result: "positive",
          observation: "**紫色〜緑色に呈色**",
          significance: "**フェノール性 OH** の存在",
          commonlyUsed: false,
          detail: "ナフトール由来の OH 基が Fe³⁺ と錯体化して呈色。"
        },
        {
          reagent: "光学旋光(旋光計)",
          result: "positive",
          observation: "**右旋([α]D = +35° 程度、CHCl₃ 中)**",
          significance: "**(R) 体特有の絶対立体配置**",
          commonlyUsed: true,
          detail: "(R)-BINOL は右旋(dextrorotatory)。鏡像体 (S)-BINOL とは符号が逆で大きさは同じ。\n\n光学純度(ee, 鏡像体過剰)は旋光度の比較やキラル HPLC で評価される。"
        },
        {
          reagent: "キラル HPLC",
          result: "positive",
          observation: "**(R)-BINOL と (S)-BINOL が異なる保持時間で溶出**",
          significance: "**エナンチオマーの分離**",
          commonlyUsed: false,
          detail: "セルロース系・アミロース系キラルカラム(Chiralcel/Chiralpak)で 2 つのピークに分離。光学純度の標準的な測定法。"
        }
      ],
      isomersDetail: {
        structural: [],
        geometric: [],
        optical: { hasChiralCenter: false, rs: "(R) 軸不斉", note: "**通常の不斉炭素はないが、2 つのナフタレン環の C1-C1' 結合まわりの回転が立体的に妨げられて軸不斉(atropisomerism)が生じる**。回転障壁が高い(〜160 kJ/mol)ため、(R) 体と (S) 体は室温で別個の安定分子として単離可能。" },
        conformers: []
      },
      stereochemistryDetail: "**軸不斉(atropisomerism)の代表例**で、不斉炭素を持たない光学活性化合物。\n\n- 2 つの 2-ナフトールが C1-C1' で結合した分子で、両ナフタレン環は**互いに約 80〜90° ねじれた配座**を取る。\n- 8 位 H 同士の立体反発で**回転が完全に止まる**ため、ねじれの方向(右巻き／左巻き)の選択が永久的に固定され、エナンチオマーが生じる。\n- (R)-BINOL: 軸方向で見て R 配向\n- (S)-BINOL: 鏡像\n\n野依良治の不斉水素化触媒(BINAP)の母骨格として 2001 年ノーベル化学賞の核心。"
    },

    binolS: {
      synthesisRoutes: [
        {
          id: "binolS_naphthol_coupling_resolution",
          name: "2-ナフトールの酸化的カップリング＋光学分割",
          type: "lab",
          famous: true,
          equation: {
            reactants: [{ name: "2-ナフトール", formula: "C₁₀H₈O", molKey: "naphthol" }],
            coReagents: [{ name: "Cu(II) 触媒・酸化剤", formula: "—", molKey: null }],
            catalyst: "CuCl(OH)・TMEDA、または Fe 系酸化剤",
            conditions: "(1) 酸化的カップリング → ラセミ BINOL (2) 光学分割(ジアステレオマー塩法等)",
            products: [{ name: "(S)-BINOL", formula: "C₂₀H₁₄O₂", molKey: "binolS" }],
            byProducts: [{ name: "(R)-BINOL(同時生成、分離)", formula: "C₂₀H₁₄O₂", molKey: "binolR" }]
          },
          shortNote: "2-ナフトールの酸化的カップリングで得たラセミ BINOL を光学分割して (S) 体を得る。",
          detail: "**(R)-BINOL と同じ経路で同時に生成**し、光学分割で (S) 体だけを単離する。\n\n- 光学分割法は (R) 体と同じ(キラルアミン・酵素・キラルクロマト等)。\n- (R)-BINOL と (S)-BINOL は**鏡像体**で化学的性質はほぼ同一だが、不斉触媒として使うと**生成物の立体配置が逆**になる。",
          sources: ["Wikipedia: BINOL"]
        }
      ],
      downstream: [
        {
          name: "不斉触媒((S)-BINAP・(S)-BINOL-Ti 等)",
          leadsTo: [],
          shortNote: "(S) 体は (R) 体と鏡像の立体選択性をもち、目的に応じて (R)/(S) を使い分ける。不斉合成医薬品の鍵試薬。"
        }
      ],
      detectionReactions: [
        {
          reagent: "FeCl₃ 水溶液",
          result: "positive",
          observation: "紫色〜緑色に呈色",
          significance: "フェノール性 OH",
          commonlyUsed: false,
          detail: "(R) 体と同じ機構(化学的性質はラセミ体と区別不可能)。"
        },
        {
          reagent: "光学旋光",
          result: "positive",
          observation: "**左旋([α]D = −35° 程度、CHCl₃ 中)**",
          significance: "**(S) 体特有の絶対立体配置**",
          commonlyUsed: true,
          detail: "(R) 体と符号が逆で大きさは同じ。これにより**光学純度(ee)と絶対配置**が同時に確認できる。"
        },
        {
          reagent: "キラル HPLC",
          result: "positive",
          observation: "**(R) 体と異なる保持時間で溶出**",
          significance: "エナンチオマーの分離",
          commonlyUsed: false,
          detail: "(R) 体と (S) 体はキラル固定相で異なる強さに保持されるため分離可能。"
        }
      ],
      isomersDetail: {
        structural: [],
        geometric: [],
        optical: { hasChiralCenter: false, rs: "(S) 軸不斉", note: "**(R)-BINOL の鏡像体**。化学的性質は同一だが、空間配置だけが鏡像の関係(旋光度の符号、不斉触媒としての立体選択性が逆)。" },
        conformers: []
      },
      stereochemistryDetail: "**(R)-BINOL の鏡像エナンチオマー**で、軸不斉の左右の選択肢のもう一方。\n\n- 化学反応の結果も鏡像となるため、(R) を使うか (S) を使うかで**生成物の絶対立体配置を反転**できる。\n- 不斉医薬品合成では「望ましい鏡像異性体」を生成するために (R)/(S) を選択的に使用する。"
    },

    biphenylDiolR: {
      synthesisRoutes: [
        {
          id: "biphenyldiolR_coupling_resolution",
          name: "2-ヒドロキシビフェニル誘導体のカップリング＋光学分割",
          type: "lab",
          famous: false,
          equation: {
            reactants: [{ name: "フェノール誘導体(または 2-アミノビフェノール由来)", formula: "—", molKey: null }],
            coReagents: [{ name: "酸化的カップリング剤、続いて光学分割剤", formula: "—", molKey: null }],
            catalyst: "Cu 系・V 系酸化触媒",
            conditions: "(1) 酸化的フェノールカップリング → ラセミ体 (2) 光学分割",
            products: [{ name: "(R)-2,2'-ビフェニルジオール", formula: "C₁₂H₁₀O₂", molKey: "biphenylDiolR" }],
            byProducts: [{ name: "(S) 体(同時生成、分離)", formula: "C₁₂H₁₀O₂", molKey: "biphenylDiolS" }]
          },
          shortNote: "フェノール類の酸化的カップリングでラセミ 2,2'-ビフェニルジオールを得て、光学分割で (R) 体を単離。",
          detail: "**BINOL のベンゼン環版**で、2 つのフェノールが 2,2' 位(OH と OH が隣接する位置)で C-C 結合した構造。\n\n- 工業合成・大規模利用は BINOL に比べて限定的だが、**回転障壁が BINOL より小さい**(〜80 kJ/mol 程度)ため、低温で扱う必要がある。\n- 上流のフェノール酸化的カップリングは Cu/アミン系の触媒等で実施可能だが、BINOL ほど選択性が高くない。",
          sources: ["Wikipedia: ビフェニルジオール", "Wikipedia: 軸不斉"],
          uncertain: true,
          note: "「ビフェニルジオール」と一般に呼ばれる化合物は OH 位置(2,2'-/3,3'-/4,4'-)が複数あり、軸不斉が現れるのは主に**オルト位(2,2'-)に大きな置換基をもつ**もの。OH のみでは室温で回転可能なため、より厳密には**ジニトロ・ジカルボキシ等のオルト置換**が必要。ここでは仮に立体的に固定された (R)/(S) 体として記述する。"
        }
      ],
      downstream: [
        {
          name: "BINOL の類縁体としての不斉触媒利用",
          leadsTo: [],
          shortNote: "BINOL より小さい立体的要求が必要な不斉反応で代替的に使用される。一般的には BINOL の方が広く使われる。"
        }
      ],
      detectionReactions: [
        {
          reagent: "FeCl₃ 水溶液",
          result: "positive",
          observation: "紫色〜青紫色に呈色",
          significance: "**フェノール性 OH** の存在",
          commonlyUsed: false,
          detail: "ビフェニルの 2,2'-OH がフェノール性 OH として Fe³⁺ と配位錯体を形成、呈色。"
        },
        {
          reagent: "光学旋光(旋光計)",
          result: "positive",
          observation: "**右旋((R) 体に特徴的)**",
          significance: "(R) 体の絶対立体配置",
          commonlyUsed: false,
          detail: "旋光度の値は具体的にはオルト位の置換基によって変動する。光学純度測定に使用可能。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "biphenyl", note: "母骨格のビフェニル(C₁₂H₁₀)。OH を加えた構造。" },
          { molKey: null, note: "3,3'-/4,4'-ビフェニルジオール。OH 位置が異なる構造異性体(軸不斉なし)。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: "(R) 軸不斉(オルト位置換基が立体的に大きい場合に固定)", note: "**BINOL より回転障壁が低い**ため、室温では (R)/(S) の互変が起こることがある。立体安定なエナンチオマーを得るにはオルト位(3,3'-)にさらに置換基を入れる必要がある場合が多い。" },
        conformers: []
      },
      stereochemistryDetail: "**BINOL のフェニル版(ベンゼン環ベース)**で、より小さい軸不斉骨格。\n\n- 2 つのベンゼン環は 2,2'-OH 同士の立体反発でねじれる。\n- ナフタレン版(BINOL)と異なり、ベンゼン環単独では peri 位 H がないため**回転障壁が低く**、室温でラセミ化することもある。\n- 軸不斉として安定に単離するには、オルト位に追加の立体的に大きな置換基(NO₂、COOH 等)が必要となることが多い。"
    },

    biphenylDiolS: {
      synthesisRoutes: [
        {
          id: "biphenyldiolS_coupling_resolution",
          name: "酸化的カップリング＋光学分割",
          type: "lab",
          famous: false,
          equation: {
            reactants: [{ name: "フェノール誘導体", formula: "—", molKey: null }],
            coReagents: [{ name: "酸化的カップリング剤、光学分割剤", formula: "—", molKey: null }],
            catalyst: "Cu 系・V 系酸化触媒",
            conditions: "酸化的カップリング → 光学分割",
            products: [{ name: "(S)-2,2'-ビフェニルジオール", formula: "C₁₂H₁₀O₂", molKey: "biphenylDiolS" }],
            byProducts: [{ name: "(R) 体", formula: "C₁₂H₁₀O₂", molKey: "biphenylDiolR" }]
          },
          shortNote: "(R) 体と同じ経路で同時に生成、光学分割で (S) 体を得る。",
          detail: "**(R) 体と鏡像対のエナンチオマー**。同じ合成・分割法で両エナンチオマーが得られる。\n\n- BINOL ほど立体安定でない場合があるため、扱いに注意。",
          sources: ["Wikipedia: ビフェニルジオール"],
          uncertain: true,
          note: "BINOL に比べて研究例・工業利用例が限定的。"
        }
      ],
      downstream: [
        {
          name: "BINOL 類縁体としての不斉触媒利用",
          leadsTo: [],
          shortNote: "(R) 体と鏡像の立体選択性をもつ。"
        }
      ],
      detectionReactions: [
        {
          reagent: "FeCl₃ 水溶液",
          result: "positive",
          observation: "紫色〜青紫色",
          significance: "フェノール性 OH",
          commonlyUsed: false,
          detail: "(R) 体と同じ。"
        },
        {
          reagent: "光学旋光",
          result: "positive",
          observation: "**左旋((S) 体)**",
          significance: "(S) 体の絶対立体配置",
          commonlyUsed: false,
          detail: "(R) 体と符号が逆で大きさは同じ。"
        }
      ],
      isomersDetail: {
        structural: [
          { molKey: "biphenyl", note: "母骨格のビフェニル。" }
        ],
        geometric: [],
        optical: { hasChiralCenter: false, rs: "(S) 軸不斉", note: "**(R) 体の鏡像**。化学的性質は同一だが立体配置が鏡像、不斉反応では生成物の立体配置が逆になる。" },
        conformers: []
      },
      stereochemistryDetail: "**(R) 体の鏡像エナンチオマー**。\n\n- BINOL のベンゼン環版なので、ナフタレン版(BINOL)より回転障壁が低い。\n- 安定な軸不斉として扱うには、オルト位への追加置換基(NO₂ 等)が必要となることが多い。\n- 軸不斉化合物の最も単純な例として、立体化学の教育的役割をもつ。"
    }

  };
})(window);
