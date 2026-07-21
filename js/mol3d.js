/* ============================================================
 * mol3d.js — 3D 分子構造の取得と表示
 *
 * 設計方針：
 *   ・ブラウザ完結（runtime のネットアクセス不要）
 *   ・座標源は事前計算済み JSON（data/mol3d_precomputed.json）
 *     ビルド時に PubChem 3D-SDF（MMFF94 で前計算済み、Chem3D 同等品質）から取得
 *   ・PubChem に登録がない少数の分子は自作モジュールで生成して JSON に焼き込み
 *   ・3Dmol.js で描画（教育用 UI に最適化、BSD ライセンス）
 *
 * 公開 API（window.Mol3D 名前空間に exposure）：
 *   initMol3D()                       precomputed JSON を読み込んで初期化
 *   getMol3D(key)                     key（分子レジストリの ID）から SDF を返す
 *   getMol3DBySmiles(smiles)          SMILES から SDF を引く（正規化マッチ）
 *   render3D(elementId, sdf, style)   3Dmol.js でコンテナに描画
 *   isMol3DReady()                    初期化済みかどうか
 *
 * ライセンス：本ファイル自体は同プロジェクトに準拠。依存ライブラリは BSD/MIT。
 * ============================================================ */

(function (global) {
  "use strict";

  // ----------------------------------------------------------------
  // 内部状態
  // ----------------------------------------------------------------

  /** 事前計算済みデータ。{ molecules: { key: { smiles, sdf, source, metadata } }, version } */
  let _precomputed = null;
  let _initPromise = null;

  /** localStorage キャッシュ用プレフィックス（ホットリロード時の高速化のみで、座標源ではない） */
  const LS_PREFIX = "mol3d_v2_";

  /** 描画スタイルマップ（3Dmol.js の style オブジェクト） */
  const STYLE_MAP = {
    stick: {
      stick: { radius: 0.15 },
      sphere: { scale: 0.25 },
    },
    ballstick: {
      stick: { radius: 0.10 },
      sphere: { scale: 0.30 },
    },
    spacefill: {
      sphere: {},
    },
    wireframe: {
      line: {},
    },
  };

  // ----------------------------------------------------------------
  // 初期化：事前計算 JSON を読み込む
  // ----------------------------------------------------------------

  /**
   * 事前計算済み 3D データを読み込む。
   * 複数回呼んでも安全（同じ Promise を返す）。
   *
   * @returns {Promise<{molecules: object, version: string}>}
   */
  async function initMol3D() {
    if (_precomputed) return _precomputed;
    if (_initPromise) return _initPromise;

    _initPromise = (async () => {
      try {
        const resp = await fetch("data/mol3d_precomputed.json");
        if (!resp.ok) throw new Error(`fetch failed: ${resp.status}`);
        const data = await resp.json();
        if (!data || !data.molecules) throw new Error("invalid JSON shape");
        _precomputed = data;
        const count = Object.keys(data.molecules).length;
        console.log(
          `[mol3d] precomputed JSON loaded: ${count} molecules ` +
          `(version=${data.version ?? "unknown"}, built=${data.builtAt ?? "?"})`,
        );
        return data;
      } catch (e) {
        console.warn("[mol3d] failed to load precomputed JSON:", e.message);
        _precomputed = { molecules: {}, version: "empty" };
        return _precomputed;
      }
    })();
    return _initPromise;
  }

  /** 初期化完了済みかどうかを返す。 */
  function isMol3DReady() {
    return _precomputed !== null;
  }

  /**
   * 分子 ID のキー候補リストを生成する（命名規則の違いを吸収）。
   *
   * 分子図鑑モード (app.js) は camelCase ID を使用：aceticAcid, butanol1, etc.
   * moleculeSMILES.js (JSON のキー) は snake_case：acetic_acid, butanol_1, etc.
   *
   * 両方の形式で検索を試みる。
   *
   * @param {string} key
   * @returns {string[]}  候補キー配列
   */
  function keyCandidates(key) {
    const out = [key];
    // camelCase → snake_case：大文字の前と数字の前に _ を挿入し小文字化
    const toSnake = key
      .replace(/([a-z])([A-Z])/g, "$1_$2")
      .replace(/([a-z])([0-9])/g, "$1_$2")
      .toLowerCase();
    if (toSnake !== key) out.push(toSnake);
    // snake_case → camelCase：_の後の文字を大文字化、_と数字の_を削除
    const toCamel = key.replace(/_([a-z0-9])/g, (_, ch) => ch.toUpperCase());
    if (toCamel !== key && !out.includes(toCamel)) out.push(toCamel);
    return out;
  }

  /**
   * 指定 key が 3D 表示に対応しているかを同期的に判定する。
   * 注意：initMol3D() の完了前は常に false を返すため、起動時に initMol3D を
   * 呼んでおくこと。
   *
   * @param {string} key  分子レジストリの ID
   * @returns {boolean}
   */
  function isSupported(key) {
    if (!_precomputed) return false;
    for (const cand of keyCandidates(key)) {
      if (_precomputed.molecules[cand] !== undefined) return true;
    }
    return false;
  }

  // ----------------------------------------------------------------
  // 取得：key（分子レジストリ ID）→ SDF
  // ----------------------------------------------------------------

  /**
   * 分子 key から 3D 構造（V2000 Molfile / SDF 文字列）を返す。
   *
   * @param {string} key  分子レジストリの ID（例: "methane", "benzene", "binolR"）
   * @returns {Promise<{sdf: string, source: string, smiles?: string}|null>}
   *          見つからなければ null
   */
  async function getMol3D(key) {
    const data = await initMol3D();
    for (const cand of keyCandidates(key)) {
      const entry = data.molecules[cand];
      if (entry) {
        return {
          sdf: entry.sdf,
          source: entry.source ?? "precomputed",
          smiles: entry.smiles,
          metadata: entry.metadata ?? null,
        };
      }
    }
    return null;
  }

  /**
   * SMILES（正規化前提）から 3D 構造を引く。同じ SMILES で複数 key が
   * 登録されていれば最初に見つかったものを返す。
   *
   * @param {string} smiles
   * @returns {Promise<{sdf: string, source: string, key?: string}|null>}
   */
  async function getMol3DBySmiles(smiles) {
    const data = await initMol3D();
    const target = normalizeSmiles(smiles);
    for (const [key, entry] of Object.entries(data.molecules)) {
      if (normalizeSmiles(entry.smiles) === target) {
        return {
          sdf: entry.sdf,
          source: entry.source ?? "precomputed",
          key,
        };
      }
    }
    return null;
  }

  /** SMILES の前後空白除去・連続空白を1つに正規化 */
  function normalizeSmiles(s) {
    return (s ?? "").trim().replace(/\s+/g, "");
  }

  // ----------------------------------------------------------------
  // 描画：3Dmol.js でコンテナに表示
  // ----------------------------------------------------------------

  /**
   * 3Dmol.js でコンテナ要素に分子を描画する。
   *
   * @param {string|HTMLElement} containerOrId  要素 ID（"#" 不要）または DOM 要素
   * @param {string} sdf                        V2000 Molfile / SDF 文字列
   * @param {Object} [options]
   *   @param {string} [options.style="ballstick"]   "stick" | "ballstick" | "spacefill" | "wireframe"
   *   @param {string} [options.background="white"]  背景色
   *   @param {boolean} [options.spin=false]         自動回転
   * @returns {Object} 3Dmol viewer インスタンス（dispose 用に保持）
   */
  function render3D(containerOrId, sdf, options = {}) {
    if (typeof $3Dmol === "undefined") {
      throw new Error("3Dmol.js が読み込まれていません");
    }
    const container = typeof containerOrId === "string"
      ? document.getElementById(containerOrId)
      : containerOrId;
    if (!container) throw new Error(`コンテナが見つかりません: ${containerOrId}`);

    const style = options.style || "ballstick";
    const styleObj = STYLE_MAP[style] || STYLE_MAP.ballstick;
    const background = options.background || "white";
    const spin = options.spin === true;

    // 既存の viewer があれば削除（再描画用）
    container.innerHTML = "";

    const viewer = $3Dmol.createViewer(container, {
      backgroundColor: background,
      antialias: true,
    });
    viewer.addModel(sdf, "sdf");
    viewer.setStyle({}, styleObj);
    viewer.zoomTo();
    viewer.render();
    if (spin) viewer.spin(true);
    return viewer;
  }

  /**
   * 表示中の viewer を解放する。3Dmol.js は明示的な dispose() を持たないため、
   * コンテナの innerHTML を空にして GPU リソース解放を促す。
   *
   * @param {Object} viewer  render3D の戻り値
   */
  function disposeViewer(viewer) {
    try {
      if (viewer && typeof viewer.removeAllModels === "function") {
        viewer.removeAllModels();
      }
      if (viewer && viewer.container) {
        viewer.container.innerHTML = "";
      }
    } catch (e) {
      console.warn("[mol3d] disposeViewer failed:", e);
    }
  }

  // ----------------------------------------------------------------
  // 公開
  // ----------------------------------------------------------------

  global.Mol3D = {
    initMol3D,
    isMol3DReady,
    isSupported,
    getMol3D,
    getMol3DBySmiles,
    render3D,
    disposeViewer,
    /** 描画スタイルのキー一覧（UI 用） */
    STYLES: Object.keys(STYLE_MAP),
  };
})(typeof window !== "undefined" ? window : globalThis);
