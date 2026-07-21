// Haworth投影式SVGを手書き格納（RDKitレンダリングより優先される）
// prerenderSmiles() が `if (moleculeSVGs[id]) continue;` でスキップするため
// これらのキーが設定されている分子はRDKit描画されない

const moleculeSVGs = (() => {
  const FONT = 'font-family="Arial,sans-serif"';

  function svg(w, h, body) {
    return `<svg style="width:100%;height:100%;" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  }

  // テキスト: anchor 'm'=middle, 'e'=end, 's'=start
  function tx(x, y, a, fs, text) {
    const anch = a === 'm' ? 'middle' : a === 'e' ? 'end' : 'start';
    return `<text x="${x}" y="${y}" text-anchor="${anch}" font-size="${fs}" ${FONT} fill="#111">${text}</text>`;
  }

  // 線分
  function ln(x1, y1, x2, y2, sw) {
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#111" stroke-width="${sw || 1.8}" stroke-linecap="round"/>`;
  }

  // 環の辺を描画。boldIdx の辺のみ太線（前面）
  function ring(pts, boldIdx) {
    let s = '';
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      s += ln(a.x, a.y, b.x, b.y, i === boldIdx ? 4 : 1.8);
    }
    return s;
  }

  // 置換基: (x,y) から上（up）・下（dn）に線＋ラベルを描く
  function sub(x, y, up, dn, sl, fs) {
    sl = sl || 26; fs = fs || 12;
    let s = '';
    if (up) { s += ln(x, y, x, y - sl) + tx(x, y - sl - 4, 'm', fs, up); }
    if (dn) { s += ln(x, y, x, y + sl) + tx(x, y + sl + 13, 'm', fs, dn); }
    return s;
  }

  // ═══════════════════════════════════════════════════════════════════
  // β-D-グルコース（ピラノース・6員環 Haworth 投影式）
  //
  // 環頂点順 [C5, O, C1, C2, C3, C4]:
  //   C5(93,70) ── O(180,70) ← 上辺（水平）
  //   O(180,70) ─╮ C1(215,116)  ← 右上斜め
  //   C1 ─╮ C2(196,163)         ← 右辺
  //   C2(196,163) ══ C3(89,163)  ← 前面（太線・boldIdx=3）
  //   C3 ─╯ C4(60,116)          ← 左辺
  //   C4 ─╯ C5(93,70)           ← 左上斜め
  //
  // β-D-グルコース OH 配置:
  //   C1-OH ↑(β), C2-OH ↓, C3-OH ↑, C4-OH ↓, C5-CH₂OH ↑左斜め
  // ═══════════════════════════════════════════════════════════════════
  const glucoseSvg = (() => {
    const pts = [
      {x:  93, y:  70},  // C5
      {x: 180, y:  70},  // O
      {x: 215, y: 116},  // C1
      {x: 196, y: 163},  // C2
      {x:  89, y: 163},  // C3
      {x:  60, y: 116},  // C4
    ];
    const [C5, O, C1, C2, C3, C4] = pts;
    return svg(290, 238,
      ring(pts, 3) +
      sub(C1.x, C1.y, 'OH', 'H')  +   // C1: β-OH ↑
      sub(C2.x, C2.y, 'H',  'OH') +   // C2: OH ↓
      sub(C3.x, C3.y, 'OH', 'H')  +   // C3: OH ↑
      sub(C4.x, C4.y, 'H',  'OH') +   // C4: OH ↓
      // C5: CH₂OH を左斜め上に伸ばす（環内側と被らないよう）
      ln(C5.x, C5.y, C5.x - 14, C5.y - 32) +
      tx(C5.x - 17, C5.y - 36, 'e', 12, 'CH₂OH') +
      // O ラベル
      tx(O.x + 1, O.y - 6, 'm', 12, 'O') +
      // タイトル
      tx(140, 228, 'm', 11, 'β-D-グルコース')
    );
  })();

  // ═══════════════════════════════════════════════════════════════════
  // β-D-フルクトース（フラノース・5員環 Haworth 投影式）
  //
  // 正五角形（中心 140,120、半径 56）を時計回り 90° スタートで配置:
  //   O(140,64), C2(193,103), C3(173,165), C4(107,165), C5(87,103)
  // 前面（太線）: C3→C4（boldIdx=2）
  //
  // β-D-フルクトフラノース OH 配置:
  //   C2: CH₂OH(C1)↑, β-OH ↓（β = C2-OH と C5の CH₂OH が同面）
  //   C3: H ↑, OH ↓
  //   C4: H ↑, OH ↓
  //   C5: H ↑, CH₂OH(C6) ↓
  // ═══════════════════════════════════════════════════════════════════
  const fructoseSvg = (() => {
    const angs = [90, 18, -54, -126, 162].map(d => d * Math.PI / 180);
    const pts = angs.map(a => ({
      x: Math.round(140 + 56 * Math.cos(a)),
      y: Math.round(120 - 56 * Math.sin(a)),
    }));
    const [O, C2, C3, C4, C5] = pts;
    // O(140,64), C2(193,103), C3(173,165), C4(107,165), C5(87,103)
    return svg(290, 238,
      ring(pts, 2) +
      sub(C2.x, C2.y, 'CH₂OH', 'OH') +  // C2: CH₂OH(C1)↑, β-OH↓
      sub(C3.x, C3.y, 'H',     'OH') +  // C3: H↑, OH↓
      sub(C4.x, C4.y, 'H',     'OH') +  // C4: H↑, OH↓
      sub(C5.x, C5.y, 'H',  'CH₂OH') +  // C5: H↑, CH₂OH(C6)↓
      tx(O.x + 1, O.y - 6, 'm', 12, 'O') +
      tx(140, 228, 'm', 11, 'β-D-フルクトース')
    );
  })();

  // ═══════════════════════════════════════════════════════════════════
  // スクロース（α-D-グルコピラノース α1↔2β-D-フルクトフラノース）
  //
  // 左: グルコース（scale=0.78）
  // 右: フルクトース左右反転（FC2 が左＝グルコース側に来る）
  //     反転角度 [90, 162, 234, 306, 18]°, 中心(268,104), R=44
  //     → FO(268,60), FC2(226,90), FC3(242,140), FC4(294,140), FC5(310,90)
  //
  // グリコシド結合: GC1 ─O─ FC2
  // GC1: Hのみ（OH が橋に置換）
  // FC2: CH₂OH(C1)↑のみ（OH が橋に置換）
  // ═══════════════════════════════════════════════════════════════════
  const sucroseSvg = (() => {
    const sc = 0.78;
    const gRaw = [
      {x:  93, y:  70},
      {x: 180, y:  70},
      {x: 215, y: 116},
      {x: 196, y: 163},
      {x:  89, y: 163},
      {x:  60, y: 116},
    ];
    const gpts = gRaw.map(p => ({
      x: Math.round(p.x * sc + 5),
      y: Math.round(p.y * sc + 14),
    }));
    const [GC5, GO, GC1, GC2, GC3, GC4] = gpts;
    // GC5(78,69), GO(145,69), GC1(173,104), GC2(158,141), GC3(74,141), GC4(52,104)

    // フルクトース: 左右反転して FC2 を左側（グルコース方向）に配置
    const fangs = [90, 162, 234, 306, 18].map(d => d * Math.PI / 180);
    const fpts = fangs.map(a => ({
      x: Math.round(268 + 44 * Math.cos(a)),
      y: Math.round(104 - 44 * Math.sin(a)),
    }));
    const [FO, FC2, FC3, FC4, FC5] = fpts;
    // FO(268,60), FC2(226,90), FC3(242,140), FC4(294,140), FC5(310,90)

    const SL = 22, FS = 11;
    const bx = Math.round((GC1.x + FC2.x) / 2);
    const by = Math.round((GC1.y + FC2.y) / 2) - 8;

    return svg(385, 215,
      ring(gpts, 3) +
      ring(fpts, 2) +
      // グリコシド結合線
      ln(GC1.x, GC1.y, FC2.x, FC2.y) +
      // グルコース置換基
      sub(GC1.x, GC1.y, 'H',   null,  SL, FS) +  // C1: H↑のみ（橋）
      sub(GC2.x, GC2.y, 'H',   'OH',  SL, FS) +
      sub(GC3.x, GC3.y, 'OH',  'H',   SL, FS) +
      sub(GC4.x, GC4.y, 'H',   'OH',  SL, FS) +
      ln(GC5.x, GC5.y, GC5.x - 10, GC5.y - 24) +
      tx(GC5.x - 12, GC5.y - 28, 'e', FS, 'CH₂OH') +
      // フルクトース置換基
      sub(FC2.x, FC2.y, 'CH₂OH', null,    SL, FS) +  // C2: CH₂OH↑のみ（橋）
      sub(FC3.x, FC3.y, 'H',     'OH',    SL, FS) +
      sub(FC4.x, FC4.y, 'H',     'OH',    SL, FS) +
      sub(FC5.x, FC5.y, 'H',     'CH₂OH', SL, FS) +
      // O ラベル
      tx(GO.x,  GO.y  - 5, 'm', FS, 'O') +
      tx(FO.x,  FO.y  - 5, 'm', FS, 'O') +
      tx(bx, by, 'm', FS, 'O') +
      tx(193, 208, 'm', 10, 'スクロース (α1↔2β)')
    );
  })();

  // ═══════════════════════════════════════════════════════════════════
  // マルトース（α-D-グルコピラノース α1→4 D-グルコピラノース）
  //
  // 左右ともグルコース（scale=0.78）を配置し水平ブリッジで結合
  //   g1 (ox=8,  oy=12): 非還元端（α）
  //   g2 (ox=190,oy=12): 還元端（β として表示）
  // グリコシド結合: G1C1 ─O─ G2C4（ともに y=103 → 水平ブリッジ）
  // G1C1: H↑のみ（OH が橋に置換）
  // G2C4: H↓のみ（OH が橋に置換）
  // ═══════════════════════════════════════════════════════════════════
  const maltoseSvg = (() => {
    const sc = 0.78;
    const raw = [
      {x:  93, y:  70},
      {x: 180, y:  70},
      {x: 215, y: 116},
      {x: 196, y: 163},
      {x:  89, y: 163},
      {x:  60, y: 116},
    ];
    function mk(ox, oy) {
      return raw.map(p => ({
        x: Math.round(p.x * sc + ox),
        y: Math.round(p.y * sc + oy),
      }));
    }
    const g1 = mk(8,   12);
    const g2 = mk(190, 12);
    const [G1C5, G1O, G1C1, G1C2, G1C3, G1C4] = g1;
    const [G2C5, G2O, G2C1, G2C2, G2C3, G2C4] = g2;
    // g1: C5(80,67),O(148,67),C1(176,103),C2(161,139),C3(77,139),C4(55,103)
    // g2: C5(263,67),O(330,67),C1(358,103),C2(343,139),C3(259,139),C4(237,103)

    const SL = 22, FS = 11;
    const bx = Math.round((G1C1.x + G2C4.x) / 2);
    const by = Math.round((G1C1.y + G2C4.y) / 2) - 8;

    return svg(408, 213,
      ring(g1, 3) +
      ring(g2, 3) +
      // グリコシド結合線（水平）
      ln(G1C1.x, G1C1.y, G2C4.x, G2C4.y) +
      // 左グルコース（α 非還元端）
      sub(G1C1.x, G1C1.y, 'H',   null,  SL, FS) +  // C1: H↑のみ（橋）
      sub(G1C2.x, G1C2.y, 'H',   'OH',  SL, FS) +
      sub(G1C3.x, G1C3.y, 'OH',  'H',   SL, FS) +
      sub(G1C4.x, G1C4.y, 'H',   'OH',  SL, FS) +
      ln(G1C5.x, G1C5.y, G1C5.x - 10, G1C5.y - 24) +
      tx(G1C5.x - 12, G1C5.y - 28, 'e', FS, 'CH₂OH') +
      // 右グルコース（β 還元端）
      sub(G2C1.x, G2C1.y, 'OH',  'H',   SL, FS) +  // C1: β-OH↑
      sub(G2C2.x, G2C2.y, 'H',   'OH',  SL, FS) +
      sub(G2C3.x, G2C3.y, 'OH',  'H',   SL, FS) +
      sub(G2C4.x, G2C4.y, null,  'H',   SL, FS) +  // C4: H↓のみ（橋）
      ln(G2C5.x, G2C5.y, G2C5.x + 10, G2C5.y - 24) +
      tx(G2C5.x + 12, G2C5.y - 28, 's', FS, 'CH₂OH') +
      // O ラベル
      tx(G1O.x, G1O.y - 5, 'm', FS, 'O') +
      tx(G2O.x, G2O.y - 5, 'm', FS, 'O') +
      tx(bx, by, 'm', FS, 'O') +
      tx(200, 206, 'm', 10, 'マルトース (α1→4)')
    );
  })();

  return {
    glucose:  glucoseSvg,
    fructose: fructoseSvg,
    sucrose:  sucroseSvg,
    maltose:  maltoseSvg,
  };
})();
