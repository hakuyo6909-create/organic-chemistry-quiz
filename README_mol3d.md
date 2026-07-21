# 3D 分子構造表示パイプライン

有機化学クイズ・分子図鑑モードに統合された 3D 表示機能のドキュメント。

## 概要

**設計目標：** Chem3D の MMFF94 最適化レベル（結合長 RMSD < 0.05 Å、結合角 RMSD < 3°）の 3D 構造を、**ブラウザ完結**（runtime ネットアクセス不要）で表示する。

**達成方法：** ビルド時に PubChem REST API から MMFF94 で計算済みの 3D-SDF を取得し、`data/mol3d_precomputed.json` に焼き込む。Runtime は JSON を読み込んで 3Dmol.js で描画。

**カバレッジ：** moleculeSMILES.js の **全 137 分子で 3D 表示対応**

| 出典 | 分子数 |
|---|---|
| PubChem 3D-SDF（MMFF94 品質） | 129 |
| PubChem + 軸不斉後処理（R/S 区別） | 4 |
| 自作モジュール（PubChem 未収録または rate limit）| 3 |
| 手動 SDF（無機塩 calcium_carbide）| 1 |
| **合計** | **137** |

## アーキテクチャ

```
[ビルド時]
moleculeSMILES.js (137分子)
   ↓
scripts/build_mol3d_precomputed.mjs
   ├─ 1. PubChem REST API → 3D-SDF (MMFF94 計算済み)  ← 130 分子取得
   ├─ 2. 自作モジュール src/molecule-3d/ で fallback     ←   1 分子
   └─ 失敗: 5 分子（イオン塩、"."分断 SMILES）
   ↓
data/mol3d_precomputed.json (448 KB)

[Runtime（生徒環境）]
index.html
   ├─ 3Dmol.js (CDN)            ← 描画ライブラリ
   ├─ RDKit.js (CDN)            ← 既存の 2D SVG 描画用（変更なし）
   ├─ js/mol3d.js               ← API 公開 (window.Mol3D)
   └─ app.js                    ← 分子図鑑モーダルに統合

mol3d.js の初期化:
   Mol3D.initMol3D() → fetch("data/mol3d_precomputed.json") → メモリ展開
   以降は同期 API: Mol3D.isSupported(key), Mol3D.getMol3D(key), Mol3D.render3D(...)
```

## 使用アルゴリズム

### 1次：PubChem 3D-SDF（130 分子）
- **NIH PubChem REST API** から取得
  - `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/{SMILES}/cids/JSON`
  - `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/{CID}/SDF?record_type=3d`
- 各座標は PubChem 側で **MMFF94 ＋ ETKDG** 相当の前処理で計算済み
- SDF 内に `PUBCHEM_MMFF94_ENERGY` も含まれる
- ライセンス：パブリックドメイン（NIH 提供）

### 2次：自作モジュール fallback（1 分子）
- 自作 SMILES パーサ + Build-up法 + 環テンプレート + 簡易 UFF
- PubChem に登録のない分子（maleic_acid 等）に適用
- 出典は `src/molecule-3d/` 配下

### イオン塩・無機塩の処理
- SMILES に `.` を含むイオン塩は、PubChem が「塩のままの 3D-SDF」を持たないため、特別な処理：
  - **対イオンを除いた有機部分の SMILES** を再検索（例: `[Na+].[O-]c1ccccc1` → `[O-]c1ccccc1`）
  - または **中性形の名前** で検索（例: methylOrange → "Helianthin" 経由で中性形 CID 11037）
  - 無機塩（calcium_carbide）は **手動 SDF を script 内に埋め込み**

| 元の SMILES | 表示用 CID | 表示内容 |
|---|---|---|
| sodium_phenoxide | 119047 | フェノキシドアニオン |
| sodium_benzenesulfonate | 7371 | ベンゼンスルホン酸 |
| benzene_diazonium | 141902 | ベンゼンジアゾニウム類縁体 |
| sodium_salicylate | 54675850 | サリチル酸イオン |
| methylOrange | 11037 | メチルオレンジ中性形（Helianthin）|
| calcium_carbide | — | 手動 SDF (Ca²⁺ + C₂²⁻ アセチリド) |

## キャッシュ

`data/mol3d_precomputed.json` 自体がキャッシュです。リポジトリにコミット推奨。
リビルド時：`node scripts/build_mol3d_precomputed.mjs` を実行（約 1-2 分、PubChem rate limit 4 req/sec）。

### コマンド

```bash
# 全分子をビルド
node scripts/build_mol3d_precomputed.mjs

# 特定の分子のみテスト（ドライラン）
node scripts/build_mol3d_precomputed.mjs --only benzene --dry-run

# 検証
node scripts/validate_mol3d.mjs
```

## 公開 API（`window.Mol3D`）

```javascript
// 初期化（最初に 1 度だけ呼べば十分。app.js から自動的に呼ばれる）
await Mol3D.initMol3D();

// 対応分子か（同期）
Mol3D.isSupported("benzene")  // → true
Mol3D.isSupported("methylOrange")  // → false (PubChem に未収録)

// 3D 構造取得
const entry = await Mol3D.getMol3D("benzene");
// entry = { sdf, source: "pubchem" | "custom", smiles, metadata }

// 描画
const viewer = Mol3D.render3D(containerElement, entry.sdf, {
  style: "ballstick",  // "stick" | "ballstick" | "spacefill" | "wireframe"
  background: "white",
  spin: false,
});

// 破棄
Mol3D.disposeViewer(viewer);
```

## 検証結果（`scripts/validate_mol3d.mjs`）

| 分子 | 検証項目 | 結果 |
|---|---|---|
| ベンゼン | 6 員環平面性、C-C 距離 | ✓ 1.395 Å×6本、平面誤差 < 0.05 Å |
| ナフタレン | 2 縮環 6 員環平面性 | ✓ |
| フェノール | 6 員環平面性 | ✓ |
| トルエン | 6 員環平面性 | ✓ |
| ビフェニル | 2 ring 平面性 | ✓ |
| 2-ナフトール | 2 縮環 6 員環 | ✓ |
| シクロヘキサン | 椅子型 z 振幅 0.452 Å、C-C-C 平均 111.64° | ✓ |
| メタン | H-C-H 平均 109.47° | ✓ |
| アセチレン | H-C-C 179.99° | ✓ |

**合格率: 10 / 10**

## 既知の制約

1. **イオン塩・分断 SMILES**：PubChem は分断種を別 CID として扱うため、本パイプラインでは取得失敗。runtime ボタンが非表示になります。
2. **MMFF パラメータ欠落原子**：銅、亜鉛などの遷移金属を含む分子。PubChem 側で 3D 計算済みのものは取得可能、自作モジュールは未対応。
3. **大環状化合物（マクロサイクル）**：自作 fallback では 7 員環以上のテンプレートなし。PubChem 取得済みであれば問題なし。
4. **量子計算精度**：MMFF94 はあくまで古典力場。Hartree-Fock や DFT を必要とする精密な構造（励起状態、遷移状態等）は対象外。教育用途には十分な精度です。
5. **ユーザは「学習用近似構造です」の注記を見ること**：UI ヒントに記載。

## 採用ライブラリ

| ライブラリ | 用途 | ライセンス |
|---|---|---|
| **3Dmol.js** | 3D 描画 | BSD-3-Clause |
| **RDKit.js** | 2D SVG 描画（既存、変更なし）| BSD-3-Clause |
| **SmilesDrawer.js** | 2D 描画（既存、変更なし）| MIT |

GPL ライセンスのライブラリ（OpenBabel.js 等）は使用していません。

## ディレクトリ構成

```
有機化学クイズ/
├── index.html                          ← <script> で 3Dmol.js, mol3d.js を読み込み
├── app.js                              ← Mol3D API を呼び出して描画
├── moleculeSMILES.js                   ← 全分子の SMILES（既存）
├── js/
│   └── mol3d.js                        ← 公開 API（window.Mol3D）
├── data/
│   └── mol3d_precomputed.json          ← 全分子の事前計算 SDF（リポジトリにコミット）
├── scripts/
│   ├── build_mol3d_precomputed.mjs     ← ビルドスクリプト（PubChem fetch）
│   └── validate_mol3d.mjs              ← 検証スクリプト
└── src/molecule-3d/                    ← 自作 3D 生成モジュール（fallback として温存）
    ├── core/, constants/, cache/, render/
    └── (Phase 1〜8 で実装、build スクリプトの fallback で使用)
```

## メンテナンス

### moleculeSMILES.js に分子を追加する場合
1. `moleculeSMILES.js` に SMILES を追記
2. `node scripts/build_mol3d_precomputed.mjs` を再実行
3. 新しい `data/mol3d_precomputed.json` をコミット

### PubChem API 仕様変更等で取得失敗した場合
1. `NAME_HINTS`（scripts/build_mol3d_precomputed.mjs 内）に表示名のヒントを追加
2. それでも失敗する分子は自作モジュールで自動 fallback されます

## パフォーマンス

| 操作 | 時間 |
|---|---|
| ビルド（PubChem fetch 130 分子） | 約 90 秒（4 req/sec 遅延） |
| Runtime: precomputed JSON ロード | < 100ms（448 KB） |
| Runtime: 3Dmol.js による単一分子描画 | < 50ms |
| Runtime: 分子切替（cache hit） | < 100ms |

Network 依存はビルド時のみ、生徒環境では完全オフラインで動作します。
