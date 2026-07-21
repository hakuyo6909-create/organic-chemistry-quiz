/* =============================================================
   構造決定問題モード (structure_mode.js)
   STRUCTURE_PROBLEM データは structure_problems.js で定義
============================================================= */
(function () {
  'use strict';

  // {phrase, insight}[] — buildProblemHtml() 実行時に構築
  const _keyPhrases = [];
  // qid → ヒント表示済み数
  const _hintIndex = {};
  // qid → 解答表示済みフラグ
  const _answerShown = {};
  // イベントリスナー重複追加を防ぐフラグ
  let _listenersAdded = false;

  /* ────────────────────────────────────────────
     初期化（changeMode("structure") から呼ばれる）
  ──────────────────────────────────────────── */
  function spInit() {
    const bodyEl = document.getElementById('spProblemBody');
    const listEl = document.getElementById('spQuestionsList');
    if (!bodyEl || !listEl) return;

    // 状態リセット
    _keyPhrases.length = 0;
    Object.keys(_hintIndex).forEach(k => delete _hintIndex[k]);
    Object.keys(_answerShown).forEach(k => delete _answerShown[k]);

    // 問題テキスト描画
    bodyEl.innerHTML = buildProblemHtml(STRUCTURE_PROBLEM.experimentText);

    // 設問カード描画
    listEl.innerHTML = '';
    STRUCTURE_PROBLEM.questions.forEach(q => {
      _hintIndex[q.id] = 0;
      _answerShown[q.id] = false;
      listEl.appendChild(buildQuestionCard(q));
    });

    // イベントリスナーは初回のみ追加（innerHTML 再描画後も bodyEl/listEl 自体は同一要素）
    if (_listenersAdded) return;
    _listenersAdded = true;

    // クリッカブルキーフレーズ（イベント委譲）
    bodyEl.addEventListener('click', e => {
      const kp = e.target.closest('.sp-key');
      if (!kp) return;
      const idx = parseInt(kp.dataset.key, 10);
      if (isNaN(idx) || !_keyPhrases[idx]) return;
      const { phrase, insight } = _keyPhrases[idx];
      spShowInsight(phrase, insight);
    });

    // ヒント / 解答ボタン（イベント委譲）
    listEl.addEventListener('click', e => {
      const hintBtn   = e.target.closest('.sp-hint-btn');
      const answerBtn = e.target.closest('.sp-answer-btn');
      if (hintBtn)   spShowNextHint(parseInt(hintBtn.dataset.qid, 10));
      if (answerBtn) spShowAnswer(parseInt(answerBtn.dataset.qid, 10));
    });

    // ポップアップを閉じる
    const closeBtn = document.getElementById('spPopupClose');
    const overlay  = document.getElementById('spPopupOverlay');
    if (closeBtn) closeBtn.addEventListener('click', spHideInsight);
    if (overlay)  overlay.addEventListener('click', e => {
      if (e.target === overlay) spHideInsight();
    });
  }

  /* ────────────────────────────────────────────
     問題テキスト HTML 生成
     {フレーズ|解説} → クリッカブルspan
  ──────────────────────────────────────────── */
  function buildProblemHtml(rawHtml) {
    _keyPhrases.length = 0;
    return rawHtml.replace(/\{([^|{}]+)\|([^{}]+)\}/g, (_, phrase, insight) => {
      const idx = _keyPhrases.length;
      _keyPhrases.push({ phrase, insight });
      return `<span class="sp-key" data-key="${idx}">${phrase}</span>`;
    });
  }

  /* ────────────────────────────────────────────
     設問カード DOM 構築
  ──────────────────────────────────────────── */
  function buildQuestionCard(q) {
    const card = document.createElement('div');
    card.className = 'sp-q-card';
    card.id = `spQCard-${q.id}`;
    card.innerHTML = `
      <div class="sp-q-head">
        <div class="sp-q-num">問${q.id}</div>
        <div class="sp-q-text">${escHtml(q.text)}</div>
      </div>
      <div class="sp-q-body">
        <textarea class="sp-q-input" placeholder="解答を入力…" rows="2"></textarea>
        <div class="sp-q-actions">
          <button class="sp-hint-btn" data-qid="${q.id}" type="button">💡 ヒント (0/${q.hints.length})</button>
          <button class="sp-answer-btn" data-qid="${q.id}" type="button">解答を見る</button>
        </div>
        <div class="sp-hint-box" id="spHint-${q.id}" hidden></div>
        <div class="sp-answer-box" id="spAnswer-${q.id}" hidden></div>
      </div>`;
    return card;
  }

  /* ────────────────────────────────────────────
     ヒント段階表示
  ──────────────────────────────────────────── */
  function spShowNextHint(qid) {
    const q = STRUCTURE_PROBLEM.questions.find(x => x.id === qid);
    if (!q) return;
    const box = document.getElementById(`spHint-${qid}`);
    if (!box || _hintIndex[qid] >= q.hints.length) return;

    _hintIndex[qid]++;
    box.hidden = false;
    box.textContent = q.hints.slice(0, _hintIndex[qid]).join('\n\n──\n\n');

    const btn = document.querySelector(`.sp-hint-btn[data-qid="${qid}"]`);
    if (!btn) return;
    if (_hintIndex[qid] >= q.hints.length) {
      btn.textContent = '💡 ヒント（全て表示済み）';
      btn.disabled = true;
    } else {
      btn.textContent = `💡 ヒント (${_hintIndex[qid]}/${q.hints.length})`;
    }
  }

  /* ────────────────────────────────────────────
     解答表示
  ──────────────────────────────────────────── */
  function spShowAnswer(qid) {
    const q = STRUCTURE_PROBLEM.questions.find(x => x.id === qid);
    if (!q) return;
    const box = document.getElementById(`spAnswer-${qid}`);
    if (!box) return;
    box.hidden = false;
    box.textContent = q.answer;

    const btn = document.querySelector(`.sp-answer-btn[data-qid="${qid}"]`);
    if (btn) btn.hidden = true;
  }

  /* ────────────────────────────────────────────
     インサイトポップアップ
     ※ display: flex は CSS クラス .is-visible で制御
       （hidden 属性は display:flex に上書きされるため使用しない）
  ──────────────────────────────────────────── */
  function spShowInsight(phrase, insight) {
    const phraseEl  = document.getElementById('spPopupPhrase');
    const insightEl = document.getElementById('spPopupInsight');
    const overlay   = document.getElementById('spPopupOverlay');
    if (!phraseEl || !insightEl || !overlay) return;
    phraseEl.textContent  = phrase;
    insightEl.textContent = insight;
    overlay.classList.add('is-visible');
  }

  function spHideInsight() {
    const overlay = document.getElementById('spPopupOverlay');
    if (overlay) overlay.classList.remove('is-visible');
  }

  /* ────────────────────────────────────────────
     ユーティリティ
  ──────────────────────────────────────────── */
  function escHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── 公開 ── */
  window.spInit = spInit;
})();
