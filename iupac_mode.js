/* ============================================================
   有機化学クイズ — IUPAC命名法モード (iupac)
   ------------------------------------------------------------
   ・データ: iupac_quiz_data.js / _2.js / _3.js(計250題)を結合
   ・app.js には手を入れず、mode-card / mode-view のクラス規約に
     乗って動く独立モジュール(モード切替の表示制御は app.js の
     changeMode() が汎用処理してくれる)
   ・出題時に choices をシャッフルし、正解インデックスを追従させる
   ・ログ: window.OrgQuizLogger 経由(mode: "iupac",
     label: "IUPAC:分野名" — 教員モードの集計にそのまま乗る)
   ============================================================ */
(() => {
  "use strict";

  /* ---------- データ結合 ---------- */
  function getAllQuestions() {
    const parts = [];
    if (typeof IUPAC_QUIZ_DATA !== "undefined") parts.push(IUPAC_QUIZ_DATA);
    if (typeof IUPAC_QUIZ_DATA_2 !== "undefined") parts.push(IUPAC_QUIZ_DATA_2);
    if (typeof IUPAC_QUIZ_DATA_3 !== "undefined") parts.push(IUPAC_QUIZ_DATA_3);
    return [].concat(...parts);
  }

  const CATEGORIES = (typeof IUPAC_QUIZ_CATEGORIES !== "undefined") ? IUPAC_QUIZ_CATEGORIES : {};
  const TYPES = (typeof IUPAC_QUIZ_TYPES !== "undefined") ? IUPAC_QUIZ_TYPES : {};
  const DIFFICULTIES = { 1: "★ 基本", 2: "★★ 標準", 3: "★★★ 発展" };

  /* ---------- 状態 ---------- */
  const st = {
    started: false,
    startTime: null,
    timerId: null,
    questions: [],      // 今回のセッションの出題リスト(シャッフル済み選択肢を含む)
    index: 0,
    correctCount: 0,
    history: [],        // [{q, shuffledChoices, correctPos, selectedPos, correct, ms}]
    qShownAt: null,
  };

  const dom = {};

  function $(id) { return document.getElementById(id); }

  function cacheDom() {
    dom.card = document.querySelector('.mode-card[data-mode="iupac"]');
    dom.view = $("view-iupac");
    dom.catChecks = $("iupacCatChecks");
    dom.typeChecks = $("iupacTypeChecks");
    dom.diffChecks = $("iupacDiffChecks");
    dom.countSelect = $("iupacCountSelect");
    dom.poolInfo = $("iupacPoolInfo");
    dom.catAllBtn = $("iupacCatAllBtn");
    dom.catNoneBtn = $("iupacCatNoneBtn");
    dom.playArea = $("iupacPlayArea");
    dom.startBtn = $("iupacStartBtn");
    dom.timer = $("iupacTimer");
    dom.progress = $("iupacProgress");
    dom.promptQuestion = $("iupacQuestionText");
    dom.prompt = $("iupacPrompt");
    dom.choices = $("iupacChoices");
    dom.feedback = $("iupacFeedback");
    dom.feedbackMsg = $("iupacFeedbackMsg");
    dom.expl = $("iupacExpl");
    dom.nextBtn = $("iupacNextBtn");
    dom.result = $("iupacResult");
    dom.resultTime = $("iupacResultTime");
    dom.resultScore = $("iupacResultScore");
    dom.resultTable = $("iupacResultTable");
    dom.resetBtn = $("iupacResetBtn");
  }

  /* ---------- ユーティリティ ---------- */
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function escHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function isAscii(text) { return typeof text === "string" && text.indexOf("\n") !== -1; }

  // 示性式・分子式を「元素文字は同じ行・数字は正式な下付き」で描画するための HTML 化。
  // Unicode 下付き（₀-₉。環境により大きさ/ベースラインが不揃いになる）を <sub> に変換する。
  // 上付き（⁰-⁹⁺⁻。イオン電荷など）は <sup> に変換する。
  const _SUB = "₀₁₂₃₄₅₆₇₈₉", _SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻", _SUP_TO = "0123456789+-";
  function chemHtml(text) {
    let s = escHtml(text);
    s = s.replace(/[₀-₉]+/g, (m) =>
      "<sub>" + m.split("").map((c) => _SUB.indexOf(c)).join("") + "</sub>");
    s = s.replace(/[⁰-⁹⁺⁻]+/g, (m) =>
      "<sup>" + m.split("").map((c) => _SUP_TO[_SUP.indexOf(c)]).join("") + "</sup>");
    return s;
  }

  /* ----------------------------------------------------------
     選択肢シャッフル:
     元の choices の並びをシャッフルし、元の answer(正解の
     インデックス)がシャッフル後にどこへ移ったか(correctPos)
     を追従させる。
  ---------------------------------------------------------- */
  function buildShuffledQuestion(q) {
    const order = shuffle([0, 1, 2, 3]);              // 表示順: order[表示位置] = 元インデックス
    const shuffledChoices = order.map(i => q.choices[i]);
    const correctPos = order.indexOf(q.answer);        // 正解が移った表示位置
    return { q, shuffledChoices, correctPos, selectedPos: null, correct: null, ms: 0 };
  }

  /* ---------- 設定の保存/復元 (localStorage) ---------- */
  const LS_KEY = "orgquiz_iupac_settings_v1";

  function loadSavedSettings() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return null;
      const d = JSON.parse(raw);
      return (d && typeof d === "object") ? d : null;
    } catch (e) { return null; }
  }

  function saveSettings() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        cats: Array.from(getChecked(dom.catChecks)),
        types: Array.from(getChecked(dom.typeChecks)),
        diffs: Array.from(getChecked(dom.diffChecks)),
        count: dom.countSelect ? dom.countSelect.value : "10",
      }));
    } catch (e) { /* プライベートモード等で保存できない場合は無視 */ }
  }

  /* ---------- 設定UI ---------- */
  function buildCheckGroup(container, entries, name, savedList) {
    if (!container) return;
    container.innerHTML = "";
    entries.forEach(([value, labelText]) => {
      const label = document.createElement("label");
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.value = String(value);
      // 保存済み設定があればそれを復元、なければ全選択
      cb.checked = Array.isArray(savedList) ? savedList.includes(String(value)) : true;
      cb.dataset.group = name;
      cb.addEventListener("change", updatePoolInfo);
      label.appendChild(cb);
      label.appendChild(document.createTextNode(labelText));
      container.appendChild(label);
    });
  }

  function buildSettings() {
    const saved = loadSavedSettings();
    buildCheckGroup(dom.catChecks, Object.entries(CATEGORIES), "cat", saved ? saved.cats : null);
    buildCheckGroup(dom.typeChecks, Object.entries(TYPES), "type", saved ? saved.types : null);
    buildCheckGroup(dom.diffChecks, Object.entries(DIFFICULTIES), "diff", saved ? saved.diffs : null);
    if (saved && saved.count && dom.countSelect) {
      const valid = Array.from(dom.countSelect.options).some(o => o.value === saved.count);
      if (valid) dom.countSelect.value = saved.count;
    }
    updatePoolInfo();
  }

  function getChecked(container) {
    if (!container) return new Set();
    const set = new Set();
    container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      if (cb.checked) set.add(cb.value);
    });
    return set;
  }

  function setAllCats(checked) {
    if (!dom.catChecks) return;
    dom.catChecks.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = checked);
    updatePoolInfo();
  }

  function getFilteredPool() {
    const cats = getChecked(dom.catChecks);
    const types = getChecked(dom.typeChecks);
    const diffs = getChecked(dom.diffChecks);
    return getAllQuestions().filter(q =>
      cats.has(q.category) && types.has(q.type) && diffs.has(String(q.difficulty))
    );
  }

  function updatePoolInfo() {
    if (dom.poolInfo) {
      const n = getFilteredPool().length;
      dom.poolInfo.textContent = `対象: ${n} 題 / 全 ${getAllQuestions().length} 題`;
    }
    saveSettings();   // 設定変更のたびに保存(次回起動時に復元)
  }

  /* ---------- 画面初期化 ---------- */
  function initScreen() {
    stopTimer();
    st.started = false;
    if (dom.playArea) dom.playArea.hidden = false;
    if (dom.result) dom.result.hidden = true;
    if (dom.startBtn) dom.startBtn.hidden = false;
    if (dom.timer) dom.timer.hidden = true;
    if (dom.progress) dom.progress.textContent = "";
    if (dom.promptQuestion) dom.promptQuestion.textContent = "";
    if (dom.prompt) {
      dom.prompt.classList.remove("is-ascii");
      dom.prompt.textContent = "「スタート」を押すと問題が表示されます";
    }
    if (dom.choices) {
      dom.choices.innerHTML = `
        <button type="button" disabled>A</button>
        <button type="button" disabled>B</button>
        <button type="button" disabled>C</button>
        <button type="button" disabled>D</button>
      `;
    }
    hideFeedback();
    buildSettings();
  }

  function hideFeedback() {
    if (dom.feedback) dom.feedback.hidden = true;
    if (dom.feedback) dom.feedback.classList.remove("is-correct", "is-wrong");
  }

  /* ---------- タイマー ---------- */
  function startTimer() {
    stopTimer();
    st.startTime = Date.now();
    st.timerId = setInterval(() => {
      if (!dom.timer) return;
      const t = ((Date.now() - st.startTime) / 1000).toFixed(1);
      dom.timer.textContent = `Time: ${t} s`;
    }, 100);
  }

  function stopTimer() {
    if (st.timerId) { clearInterval(st.timerId); st.timerId = null; }
  }

  /* ---------- 出題フロー ---------- */
  function startQuiz() {
    const pool = getFilteredPool();
    if (pool.length === 0) {
      if (dom.prompt) dom.prompt.textContent = "出題範囲が空です。設定で分野・形式・難易度を選択してください。";
      return;
    }

    let count = dom.countSelect ? dom.countSelect.value : "10";
    count = (count === "all") ? pool.length : Math.min(parseInt(count, 10) || 10, pool.length);

    // 問題自体もシャッフルして重複なしで count 題選び、各問の選択肢をシャッフル
    st.questions = shuffle(pool).slice(0, count).map(buildShuffledQuestion);
    st.index = 0;
    st.correctCount = 0;
    st.history = [];
    st.started = true;

    if (dom.startBtn) dom.startBtn.hidden = true;
    if (dom.timer) dom.timer.hidden = false;
    if (dom.result) dom.result.hidden = true;
    if (dom.playArea) dom.playArea.hidden = false;

    startTimer();
    showQuestion();
  }

  function showQuestion() {
    const item = st.questions[st.index];
    if (!item) { finishQuiz(); return; }
    const q = item.q;
    st.qShownAt = Date.now();
    hideFeedback();

    if (dom.progress) {
      dom.progress.textContent = `問 ${st.index + 1} / ${st.questions.length}`;
    }
    if (dom.promptQuestion) dom.promptQuestion.textContent = q.question;
    if (dom.prompt) {
      const ascii = isAscii(q.prompt);
      dom.prompt.classList.toggle("is-ascii", ascii);
      // 複数行の構造式(ASCII)は等幅のまま。1行の示性式/分子式は下付きを正式化。
      if (ascii) dom.prompt.textContent = q.prompt;
      else dom.prompt.innerHTML = chemHtml(q.prompt);
    }

    if (window.OrgQuizLogger) {
      window.OrgQuizLogger.event("qShown", {
        mode: "iupac", qid: q.id,
        label: "IUPAC:" + (CATEGORIES[q.category] || q.category),
      });
    }

    if (!dom.choices) return;
    dom.choices.innerHTML = "";
    item.shuffledChoices.forEach((choiceText, pos) => {
      const btn = document.createElement("button");
      btn.type = "button";
      if (isAscii(choiceText)) { btn.classList.add("is-ascii"); btn.textContent = choiceText; }
      else btn.innerHTML = chemHtml(choiceText);
      btn.addEventListener("click", () => handleAnswer(pos));
      dom.choices.appendChild(btn);
    });
  }

  function handleAnswer(selectedPos) {
    const item = st.questions[st.index];
    if (!item || item.selectedPos !== null) return;   // 二重回答防止

    item.selectedPos = selectedPos;
    item.correct = (selectedPos === item.correctPos);
    item.ms = Date.now() - st.qShownAt;
    if (item.correct) st.correctCount++;
    st.history.push(item);

    // ボタンの色付け(正解=緑、選択した誤答=赤)+全ボタン無効化
    const btns = dom.choices ? Array.from(dom.choices.querySelectorAll("button")) : [];
    btns.forEach((b, pos) => {
      b.disabled = true;
      if (pos === item.correctPos) b.classList.add("correct");
      else if (pos === selectedPos) b.classList.add("wrong");
    });

    // フィードバック + 解説
    if (dom.feedback) {
      dom.feedback.hidden = false;
      dom.feedback.classList.toggle("is-correct", item.correct);
      dom.feedback.classList.toggle("is-wrong", !item.correct);
    }
    if (dom.feedbackMsg) {
      dom.feedbackMsg.textContent = item.correct
        ? "正解！"
        : `不正解… 正解は「${flat(item.shuffledChoices[item.correctPos])}」`;
    }
    if (dom.expl) dom.expl.textContent = item.q.explanation || "";
    if (dom.nextBtn) {
      dom.nextBtn.textContent = (st.index + 1 >= st.questions.length) ? "結果を見る" : "次の問題へ";
      dom.nextBtn.focus();
    }

    // ログ(教員モードの分野別正答率集計に乗る)
    if (window.OrgQuizLogger) {
      window.OrgQuizLogger.answer({
        mode: "iupac",
        qid: item.q.id,
        label: "IUPAC:" + (CATEGORIES[item.q.category] || item.q.category),
        given: flat(item.shuffledChoices[selectedPos]),
        correct: item.correct,
        ms: item.ms,
      });
    }
  }

  // 改行入り選択肢(構造式ASCII)を1行のラベルに潰す
  function flat(text) {
    return String(text == null ? "" : text).replace(/\s*\n\s*/g, " ").replace(/\s{2,}/g, " ").trim();
  }

  function nextStep() {
    if (!st.started) return;
    st.index++;
    if (st.index >= st.questions.length) finishQuiz();
    else showQuestion();
  }

  /* ---------- 結果 ---------- */
  function finishQuiz() {
    stopTimer();
    st.started = false;

    const totalTime = st.startTime ? ((Date.now() - st.startTime) / 1000).toFixed(1) : "0.0";

    if (dom.playArea) dom.playArea.hidden = true;
    if (dom.result) dom.result.hidden = false;
    if (dom.resultTime) dom.resultTime.textContent = `時間：${totalTime} 秒`;
    if (dom.resultScore) {
      dom.resultScore.textContent = `正解数：${st.correctCount} / ${st.history.length}`;
    }

    if (!dom.resultTable) return;
    dom.resultTable.innerHTML = "";
    const header = document.createElement("tr");
    header.innerHTML = "<th>#</th><th>分野</th><th>問題</th><th>あなたの解答</th><th>正解</th><th>正誤</th>";
    dom.resultTable.appendChild(header);

    st.history.forEach((item, idx) => {
      const q = item.q;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${idx + 1}</td>
        <td>${escHtml(CATEGORIES[q.category] || q.category)}</td>
        <td class="iupac-result-prompt">${chemHtml(flat(q.prompt))}</td>
        <td>${chemHtml(flat(item.shuffledChoices[item.selectedPos]))}</td>
        <td>${chemHtml(flat(item.shuffledChoices[item.correctPos]))}</td>
        <td>${item.correct ? "○" : "×"}</td>
      `;
      dom.resultTable.appendChild(row);

      const explRow = document.createElement("tr");
      explRow.className = "iupac-result-expl-row";
      explRow.innerHTML = `<td colspan="6" class="iupac-result-expl">💡 ${escHtml(q.explanation || "")}</td>`;
      dom.resultTable.appendChild(explRow);
    });
  }

  function resetQuiz() {
    stopTimer();
    st.questions = [];
    st.index = 0;
    st.correctCount = 0;
    st.history = [];
    initScreen();
  }

  /* ---------- イベント結線 ---------- */
  function bindEvents() {
    if (dom.startBtn) dom.startBtn.addEventListener("click", startQuiz);
    if (dom.nextBtn) dom.nextBtn.addEventListener("click", nextStep);
    if (dom.resetBtn) dom.resetBtn.addEventListener("click", resetQuiz);
    if (dom.catAllBtn) dom.catAllBtn.addEventListener("click", () => setAllCats(true));
    if (dom.catNoneBtn) dom.catNoneBtn.addEventListener("click", () => setAllCats(false));
    if (dom.countSelect) dom.countSelect.addEventListener("change", updatePoolInfo);

    // モードカードのクリックを監視:
    //  - 自モードに入ったら画面初期化
    //  - 他モードへ移ったらタイマー停止(app.js は本モードを知らないため)
    document.addEventListener("click", (ev) => {
      const card = ev.target.closest(".mode-card[data-mode]");
      if (!card) return;
      if (card.dataset.mode === "iupac") {
        initScreen();
      } else {
        stopTimer();
      }
    }, { capture: true });
  }

  function setup() {
    cacheDom();
    if (!dom.view) return;   // ビューが無いページでは何もしない
    bindEvents();
    initScreen();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup);
  } else {
    setup();
  }
})();
