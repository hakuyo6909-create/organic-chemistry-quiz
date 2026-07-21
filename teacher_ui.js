/* ============================================================
   有機化学クイズ — 教員モード UI（Phase 2）
   ------------------------------------------------------------
   現状の実装範囲:
     - タブ切替（roster / logs / stats / export — logs 以下は次フェーズ）
     - 名簿管理: 一覧・追加・編集・削除
     - CSV インポート/エクスポート（grade,class,number,name,initial）
   ============================================================ */
(function (global) {
  'use strict';

  const Auth = global.OrgQuizAuth;
  const DB   = global.OrgQuizDB;

  let el = {};
  let editingOriginalId = null;   // 編集モードのとき保持

  // ── 表示/非表示 ────────────────────────────────
  function show() {
    if (!el.teacherShell) return;
    el.teacherShell.hidden = false;
    document.body.classList.add('is-teacher-mode');
    refreshRoster();
  }
  function hide() {
    if (!el.teacherShell) return;
    el.teacherShell.hidden = true;
    document.body.classList.remove('is-teacher-mode');
  }

  // ── タブ切替 ───────────────────────────────────
  function switchTab(name) {
    document.querySelectorAll('.teacher-tab').forEach(b => {
      b.classList.toggle('is-active', b.dataset.tab === name);
    });
    document.querySelectorAll('.teacher-pane').forEach(p => {
      p.classList.toggle('is-active', p.dataset.pane === name);
    });
    // タブごとの初期化
    if (name === 'logs')   refreshLogs();
    if (name === 'stats')  refreshStats();
    if (name === 'export') refreshExportTab();
  }

  // ── 名簿一覧描画 ───────────────────────────────
  async function refreshRoster() {
    if (!el.rosterTbody) return;
    let list = [];
    try { list = await DB.listStudents(); } catch (e) { console.warn(e); }
    list.sort((a, b) => String(a.id).localeCompare(String(b.id)));
    el.rosterTbody.innerHTML = '';
    list.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="r-id">${escapeHtml(r.id)}</td>
        <td>${r.grade ?? ''}</td>
        <td>${r.class ?? ''}</td>
        <td>${r.number ?? ''}</td>
        <td>${escapeHtml(r.name || '')}</td>
        <td>${escapeHtml(r.initial || '')}</td>
        <td>${r.role === 'teacher' ? '🎓 教員' : '👤 生徒'}</td>
        <td>
          <button type="button" class="ghost-btn r-edit" data-id="${escapeAttr(r.id)}">編集</button>
          <button type="button" class="danger-btn r-del"  data-id="${escapeAttr(r.id)}">削除</button>
        </td>`;
      el.rosterTbody.appendChild(tr);
    });
    if (el.rosterCount) el.rosterCount.textContent = `${list.length} 件`;
    // 編集/削除ボタン
    el.rosterTbody.querySelectorAll('.r-edit').forEach(b => b.addEventListener('click', () => openEdit(b.dataset.id)));
    el.rosterTbody.querySelectorAll('.r-del').forEach(b  => b.addEventListener('click', () => deleteRow(b.dataset.id)));
  }

  // ── 追加/編集モーダル ──────────────────────────
  function openAdd(role) {
    editingOriginalId = null;
    el.rosterEditTitle.textContent = role === 'teacher' ? '教員を追加' : '生徒を追加';
    el.reRole.value = role;
    el.reGrade.value = role === 'teacher' ? 9 : 1;
    el.reClass.value = role === 'teacher' ? 0 : 1;
    el.reNumber.value = 1;
    el.reName.value = '';
    el.reInitial.value = '';
    el.rePin.value = '';
    el.rePinRow.hidden = (role !== 'teacher');
    el.reError.hidden = true;
    el.reOriginalId.value = '';
    updatePreview();
    el.rosterEditOverlay.hidden = false;
    setTimeout(() => el.reGrade.focus(), 50);
  }
  async function openEdit(id) {
    const rec = await DB.getStudent(id);
    if (!rec) return;
    editingOriginalId = id;
    el.rosterEditTitle.textContent = `編集: ${id}`;
    el.reRole.value = rec.role || 'student';
    el.reGrade.value = rec.grade ?? 1;
    el.reClass.value = rec.class ?? 1;
    el.reNumber.value = rec.number ?? 1;
    el.reName.value = rec.name || '';
    el.reInitial.value = rec.initial || '';
    el.rePin.value = '';
    el.rePinRow.hidden = (rec.role !== 'teacher');
    el.reError.hidden = true;
    el.reOriginalId.value = id;
    updatePreview();
    el.rosterEditOverlay.hidden = false;
    setTimeout(() => el.reName.focus(), 50);
  }
  function closeEdit() { el.rosterEditOverlay.hidden = true; }

  function updatePreview() {
    const g = Number(el.reGrade.value || 0);
    const c = Number(el.reClass.value || 0);
    const n = Number(el.reNumber.value || 0);
    const ini = Auth.toAscii(el.reInitial.value || '').trim().toUpperCase();
    if (!ini) { el.rePreview.textContent = '—'; return; }
    const id = `${g}${c}${String(n).padStart(2, '0')}${ini}`;
    el.rePreview.textContent = id;
  }

  function showReError(msg) { el.reError.textContent = msg; el.reError.hidden = false; }

  async function submitEdit() {
    el.reError.hidden = true;
    const role = el.reRole.value;
    const g = Number(el.reGrade.value || 0);
    const c = Number(el.reClass.value || 0);
    const n = Number(el.reNumber.value || 0);
    const name = (el.reName.value || '').trim();
    const ini = Auth.toAscii(el.reInitial.value || '').trim().toUpperCase();
    if (!name) { showReError('氏名を入力してください'); return; }
    if (!/^[A-Z]$/.test(ini)) { showReError('イニシャルは A-Z の1文字'); return; }
    if (n < 1 || n > 99) { showReError('番号は 1〜99'); return; }
    if (role === 'teacher') {
      if (g !== 9) { showReError('教員は学年 9 で登録してください'); return; }
    } else {
      if (g < 1 || g > 3) { showReError('生徒の学年は 1〜3'); return; }
      if (c < 1 || c > 9) { showReError('生徒の組は 1〜9'); return; }
    }
    const id = `${g}${c}${String(n).padStart(2, '0')}${ini}`;
    if (role === 'teacher' && !Auth.isValidTeacherIdFormat(id)) { showReError('教員IDが不正です'); return; }
    if (role === 'student' && !Auth.isValidStudentIdFormat(id)) { showReError('生徒IDが不正です'); return; }

    // 既存IDがあるか確認（編集中の自IDは除外）
    const dup = await DB.getStudent(id);
    if (dup && id !== editingOriginalId) {
      showReError(`${id} は既に登録されています`); return;
    }

    // PIN 処理（教員のみ）
    let pinHash = undefined;
    if (role === 'teacher') {
      const pinInput = el.rePin.value;
      if (pinInput) {
        if (!Auth.isValidPinFormat(pinInput)) { showReError('PIN は6桁の数字'); return; }
        pinHash = await Auth.hashPin(pinInput);
      } else if (editingOriginalId && dup) {
        pinHash = dup.pinHash;
      } else {
        showReError('教員には PIN（6桁）を設定してください'); return;
      }
    }

    // 旧IDから変わる場合は旧レコードを削除
    if (editingOriginalId && editingOriginalId !== id) {
      try { await DB.deleteStudent(editingOriginalId); } catch (_) {}
    }
    const record = {
      id, role,
      grade: g, class: c, number: n,
      name, initial: ini,
      updatedAt: new Date().toISOString(),
    };
    if (!editingOriginalId) record.createdAt = record.updatedAt;
    if (role === 'teacher') record.pinHash = pinHash;
    await DB.upsertStudent(record);
    closeEdit();
    refreshRoster();
  }

  async function deleteRow(id) {
    if (!confirm(`${id} を削除しますか？\n（プロファイル/ログは別途削除する必要があります）`)) return;
    await DB.deleteStudent(id);
    refreshRoster();
  }

  // ── CSV エクスポート ───────────────────────────
  async function exportCsv() {
    const list = await DB.listStudents();
    const lines = ['grade,class,number,name,initial'];
    list.filter(r => r.role !== 'teacher').forEach(r => {
      lines.push([
        r.grade, r.class, r.number,
        csvEscape(r.name || ''), csvEscape(r.initial || ''),
      ].join(','));
    });
    const blob = new Blob([lines.join('\r\n') + '\r\n'], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roster_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 0);
  }

  // ── CSV インポート ─────────────────────────────
  function importCsv() { if (el.rosterCsvFile) el.rosterCsvFile.click(); }
  async function onCsvFile(ev) {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    const text = await file.text();
    const rows = parseCsv(text);
    if (rows.length < 2) { alert('CSV が空、または不正です'); return; }
    const header = rows[0].map(s => (s || '').trim().toLowerCase());
    const idxGrade   = header.indexOf('grade');
    const idxClass   = header.indexOf('class');
    const idxNumber  = header.indexOf('number');
    const idxName    = header.indexOf('name');
    const idxInitial = header.indexOf('initial');
    if (idxGrade < 0 || idxClass < 0 || idxNumber < 0 || idxName < 0 || idxInitial < 0) {
      alert('CSV ヘッダが不正です（grade,class,number,name,initial が必要）');
      return;
    }
    let added = 0, skipped = 0;
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < 5) { skipped++; continue; }
      const g = Number(String(row[idxGrade]).trim());
      const c = Number(String(row[idxClass]).trim());
      const n = Number(String(row[idxNumber]).trim());
      const name = String(row[idxName] || '').trim();
      const ini = Auth.toAscii(String(row[idxInitial] || '')).trim().toUpperCase();
      if (!(g >= 1 && g <= 3) || !(c >= 1 && c <= 9) || !(n >= 1 && n <= 99) || !name || !/^[A-Z]$/.test(ini)) {
        skipped++; continue;
      }
      const id = `${g}${c}${String(n).padStart(2, '0')}${ini}`;
      if (!Auth.isValidStudentIdFormat(id)) { skipped++; continue; }
      try {
        await DB.upsertStudent({
          id, role: 'student', grade: g, class: c, number: n,
          name, initial: ini, createdAt: new Date().toISOString(),
        });
        added++;
      } catch (_) { skipped++; }
    }
    ev.target.value = '';
    alert(`取込結果: ${added} 件追加 / ${skipped} 件スキップ`);
    refreshRoster();
  }

  // 簡易 CSV パーサ（ダブルクォート対応）
  function parseCsv(text) {
    const rows = [];
    let row = [], cell = '', inQ = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (inQ) {
        if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (ch === '"') inQ = false;
        else cell += ch;
      } else {
        if (ch === '"') inQ = true;
        else if (ch === ',') { row.push(cell); cell = ''; }
        else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
        else if (ch === '\r') { /* skip */ }
        else cell += ch;
      }
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    return rows;
  }
  function csvEscape(s) {
    s = String(s);
    if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  }

  // ── HTML エスケープ ────────────────────────────
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }
  function escapeAttr(s) { return escapeHtml(s); }

  // ============================================================
  // ログ閲覧タブ
  // ============================================================
  function fmtDuration(ms) {
    if (!ms || ms < 0) ms = 0;
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    if (h > 0) return `${h}h ${m}m ${ss}s`;
    if (m > 0) return `${m}m ${ss}s`;
    return `${ss}s`;
  }
  function fmtDateTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
  function fmtTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    const pad = n => String(n).padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
  function dateInputToTs(value, endOfDay) {
    if (!value) return null;
    const d = new Date(value);
    if (isNaN(d)) return null;
    if (endOfDay) d.setHours(23, 59, 59, 999);
    return d.getTime();
  }

  async function populateStudentSelect(selectEl, includeAll) {
    if (!selectEl) return;
    const list = await DB.listStudents();
    list.sort((a, b) => String(a.id).localeCompare(String(b.id)));
    selectEl.innerHTML = '';
    if (includeAll) {
      const opt = document.createElement('option');
      opt.value = ''; opt.textContent = '全生徒';
      selectEl.appendChild(opt);
    }
    list.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r.id;
      opt.textContent = `${r.id} ${r.name || ''}${r.role === 'teacher' ? ' (教員)' : ''}`;
      selectEl.appendChild(opt);
    });
  }

  let _allSessionsCache = null;
  async function loadAllSessions(force) {
    if (_allSessionsCache && !force) return _allSessionsCache;
    _allSessionsCache = await DB.listAllSessions();
    return _allSessionsCache;
  }
  async function refreshLogs() {
    if (!el.logsTbody) return;
    await populateStudentSelect(el.logsFilterStudent, true);
    await renderLogsTable();
  }
  async function renderLogsTable() {
    const sessions = await loadAllSessions(true);
    const filter = {
      studentId: el.logsFilterStudent ? el.logsFilterStudent.value : '',
      mode:      el.logsFilterMode ? el.logsFilterMode.value : '',
      from:      dateInputToTs(el.logsFilterFrom && el.logsFilterFrom.value, false),
      to:        dateInputToTs(el.logsFilterTo && el.logsFilterTo.value, true),
    };
    const rosterMap = {};
    (await DB.listStudents()).forEach(r => { rosterMap[r.id] = r; });
    const filtered = sessions.filter(s => {
      if (filter.studentId && s.studentId !== filter.studentId) return false;
      const startMs = new Date(s.startedAt).getTime();
      if (filter.from && startMs < filter.from) return false;
      if (filter.to && startMs > filter.to) return false;
      return true;
    });
    // モードフィルタは events を読まないと厳密判定できないので、保存済み s.mode (なければ events から判定) を使う
    // まずは s.mode で簡易フィルタ。空 mode なら全モード扱い
    const list = filter.mode
      ? filtered.filter(s => s.mode === filter.mode || !s.mode)
      : filtered;
    list.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));

    // 各セッションの events を読んで正答数を計算（並列）
    const enriched = await Promise.all(list.slice(0, 500).map(async (s) => {
      let asked = 0, correct = 0, modesUsed = new Set();
      try {
        const evs = await DB.listEventsBySession(s.sessionId);
        evs.forEach(e => {
          if (e.kind === 'answer') { asked++; if (e.correct) correct++; }
          if (e.kind === 'modeEnter' && e.mode) modesUsed.add(e.mode);
        });
      } catch (_) {}
      return { s, asked, correct, modes: Array.from(modesUsed).join(',') };
    }));
    // モードフィルタを events 由来でも再判定（s.mode がからのとき）
    const finalList = filter.mode
      ? enriched.filter(x => x.modes.includes(filter.mode))
      : enriched;

    el.logsTbody.innerHTML = '';
    finalList.forEach(({ s, asked, correct, modes }) => {
      const tr = document.createElement('tr');
      const stu = rosterMap[s.studentId];
      const stuName = stu ? `${stu.id} ${stu.name || ''}` : s.studentId;
      const accuracy = asked ? Math.round(correct / asked * 100) + '%' : '—';
      const endedTag = s.endedAt
        ? (s.autoEnded ? '<span class="auto-end">⏱ アイドル終了</span>' : '<span class="manual-end">手動</span>')
        : '<span class="open-end">未終了</span>';
      tr.innerHTML = `
        <td>${escapeHtml(fmtDateTime(s.startedAt))}</td>
        <td>${escapeHtml(stuName)}</td>
        <td>${escapeHtml(fmtDuration(s.durationMs))}</td>
        <td>${escapeHtml(modes || '—')}</td>
        <td>${asked ? `${correct}/${asked}（${accuracy}）` : '—'}</td>
        <td>${endedTag}</td>
        <td><button type="button" class="ghost-btn logs-row-detail" data-sid="${escapeAttr(s.sessionId)}">詳細</button>
            <button type="button" class="danger-btn logs-row-del" data-sid="${escapeAttr(s.sessionId)}">削除</button></td>`;
      el.logsTbody.appendChild(tr);
    });
    if (el.logsCount) el.logsCount.textContent = `${finalList.length} セッション`;

    el.logsTbody.querySelectorAll('.logs-row-detail').forEach(b =>
      b.addEventListener('click', () => showSessionDetail(b.dataset.sid)));
    el.logsTbody.querySelectorAll('.logs-row-del').forEach(b =>
      b.addEventListener('click', () => deleteSession(b.dataset.sid)));
  }
  async function showSessionDetail(sid) {
    if (!el.logsDetail) return;
    const s = await DB.getSession(sid);
    if (!s) return;
    const evs = await DB.listEventsBySession(sid);
    evs.sort((a, b) => String(a.t).localeCompare(String(b.t)));
    el.logsDetailTitle.textContent = `セッション詳細: ${s.studentId} ${fmtDateTime(s.startedAt)}（${fmtDuration(s.durationMs)}）`;
    el.logsEventsTbody.innerHTML = '';
    evs.forEach(e => {
      const tr = document.createElement('tr');
      const payload = formatEventPayload(e);
      tr.innerHTML = `
        <td>${escapeHtml(fmtTime(e.t))}</td>
        <td><span class="ev-kind ev-${escapeAttr(e.kind)}">${escapeHtml(e.kind)}</span></td>
        <td>${payload}</td>`;
      el.logsEventsTbody.appendChild(tr);
    });
    el.logsDetail.hidden = false;
    el.logsDetail.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function hideSessionDetail() { if (el.logsDetail) el.logsDetail.hidden = true; }
  function formatEventPayload(e) {
    const skip = new Set(['eventId', 'sessionId', 'studentId', 't', 'kind']);
    const parts = [];
    for (const k in e) {
      if (skip.has(k)) continue;
      let v = e[k];
      if (typeof v === 'object') v = JSON.stringify(v);
      if (k === 'correct') v = v ? '✓' : '✗';
      parts.push(`<span class="ev-kv"><b>${escapeHtml(k)}</b>=${escapeHtml(String(v))}</span>`);
    }
    return parts.join(' ');
  }
  async function deleteSession(sid) {
    if (!confirm('このセッションのログを削除しますか？\n（累計プロファイルは変更されません）')) return;
    await DB.deleteEventsBySession(sid);
    await DB.deleteSession(sid);
    _allSessionsCache = null;
    renderLogsTable();
    hideSessionDetail();
  }

  // ============================================================
  // 集計タブ
  // ============================================================
  async function refreshStats() {
    const profiles = await DB.getAllProfilesCompat ? await DB.getAllProfilesCompat() : [];
    // listProfiles 相当が DB API にない → roster + getProfile の組合せ
    const list = await DB.listStudents();
    const profs = await Promise.all(list.map(async (s) => {
      const p = await DB.getProfile(s.id);
      return { student: s, profile: p };
    }));

    // ── 累計使用時間ランキング ──
    const ranking = profs
      .filter(x => x.profile && x.profile.totalUsageMs > 0 && x.student.role !== 'teacher')
      .sort((a, b) => (b.profile.totalUsageMs || 0) - (a.profile.totalUsageMs || 0));
    const rankBody = el.statsRankTable.querySelector('tbody');
    rankBody.innerHTML = '';
    ranking.forEach((x, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td class="r-id">${escapeHtml(x.student.id)}</td>
        <td>${escapeHtml(x.student.name || '')}</td>
        <td>${escapeHtml(fmtDuration(x.profile.totalUsageMs))}</td>
        <td>${x.profile.sessionCount || 0}</td>
        <td>${escapeHtml(fmtDateTime(x.profile.lastSeenAt))}</td>`;
      rankBody.appendChild(tr);
    });

    // ── ラベル別正答率（全生徒平均） ──
    const aggLabel = {};
    profs.forEach(x => {
      if (x.student.role === 'teacher') return;
      const bl = (x.profile && x.profile.byLabel) || {};
      for (const k in bl) {
        const cur = aggLabel[k] || (aggLabel[k] = { asked: 0, correct: 0 });
        cur.asked   += bl[k].asked   || 0;
        cur.correct += bl[k].correct || 0;
      }
    });
    const labelRows = Object.entries(aggLabel)
      .map(([k, v]) => ({ label: k, asked: v.asked, correct: v.correct, rate: v.asked ? v.correct / v.asked : 0 }))
      .sort((a, b) => b.asked - a.asked);
    const labelBody = el.statsLabelTable.querySelector('tbody');
    labelBody.innerHTML = '';
    labelRows.forEach(r => {
      const tr = document.createElement('tr');
      const pct = Math.round(r.rate * 100);
      const cls = r.rate >= 0.8 ? 'rate-good' : r.rate >= 0.5 ? 'rate-mid' : 'rate-bad';
      tr.innerHTML = `
        <td>${escapeHtml(r.label)}</td>
        <td>${r.asked}</td>
        <td>${r.correct}</td>
        <td class="${cls}">${pct}%</td>`;
      labelBody.appendChild(tr);
    });

    // ── 弱点ラベル ──
    const weakBody = el.statsWeakTable.querySelector('tbody');
    weakBody.innerHTML = '';
    const weak = labelRows.filter(r => r.asked >= 5 && r.rate < 0.5).sort((a, b) => a.rate - b.rate);
    weak.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(r.label)}</td>
        <td class="rate-bad">${Math.round(r.rate * 100)}%</td>
        <td>${r.asked}</td>`;
      weakBody.appendChild(tr);
    });
    if (!weak.length) {
      weakBody.innerHTML = '<tr><td colspan="3" class="muted">該当なし（全ラベルで 50% 以上、または出題が 5 問未満）</td></tr>';
    }

    // ── 分子図鑑 閲覧ランキング ──
    const aggDict = {};
    profs.forEach(x => {
      if (x.student.role === 'teacher') return;
      const dv = (x.profile && x.profile.dictViewCounts) || {};
      for (const k in dv) aggDict[k] = (aggDict[k] || 0) + dv[k];
    });
    const dictRows = Object.entries(aggDict).sort((a, b) => b[1] - a[1]).slice(0, 50);
    const dictBody = el.statsDictTable.querySelector('tbody');
    dictBody.innerHTML = '';
    dictRows.forEach(([name, count], i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${i + 1}</td><td>${escapeHtml(name)}</td><td>${count}</td>`;
      dictBody.appendChild(tr);
    });
    if (!dictRows.length) {
      dictBody.innerHTML = '<tr><td colspan="3" class="muted">分子図鑑の閲覧記録がまだありません</td></tr>';
    }
  }

  // ============================================================
  // エクスポート / 削除タブ
  // ============================================================
  async function refreshExportTab() {
    await populateStudentSelect(el.exportStudent, false);
    el.exportStudent.disabled = (el.exportTarget.value !== 'student');
  }
  function onExportTargetChange() {
    el.exportStudent.disabled = (el.exportTarget.value !== 'student');
  }
  function downloadFile(name, mime, content) {
    const blob = new Blob([content], { type: mime + ';charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 0);
  }

  async function exportRun() {
    const target = el.exportTarget.value;
    const fmt    = el.exportFormat.value;
    const sid    = (target === 'student') ? el.exportStudent.value : null;
    if (target === 'student' && !sid) { alert('生徒を選択してください'); return; }

    const rosterAll = await DB.listStudents();
    const sessionsAll = await DB.listAllSessions();
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');

    const filterSessions = sid
      ? sessionsAll.filter(s => s.studentId === sid)
      : sessionsAll;

    if (fmt === 'json') {
      const out = {
        exportedAt: new Date().toISOString(),
        scope: target,
        filter: { studentId: sid || null },
        roster: sid ? rosterAll.filter(r => r.id === sid) : rosterAll,
        profiles: [],
        sessions: [],
      };
      const ids = sid ? [sid] : Array.from(new Set(filterSessions.map(s => s.studentId)));
      for (const id of ids) {
        const p = await DB.getProfile(id);
        if (p) out.profiles.push(p);
      }
      for (const s of filterSessions) {
        const evs = await DB.listEventsBySession(s.sessionId);
        out.sessions.push({ ...s, events: evs });
      }
      downloadFile(`orgquiz_log_${sid || 'all'}_${stamp}.json`, 'application/json',
                   JSON.stringify(out, null, 2));
      return;
    }
    if (fmt === 'csv-summary') {
      const rosterMap = {};
      rosterAll.forEach(r => { rosterMap[r.id] = r; });
      const lines = ['sessionId,studentId,name,startedAt,endedAt,durationMs,autoEnded'];
      filterSessions.forEach(s => {
        const r = rosterMap[s.studentId] || {};
        lines.push([
          csvEscape(s.sessionId), csvEscape(s.studentId), csvEscape(r.name || ''),
          csvEscape(s.startedAt || ''), csvEscape(s.endedAt || ''),
          s.durationMs || 0, !!s.autoEnded,
        ].join(','));
      });
      downloadFile(`orgquiz_summary_${sid || 'all'}_${stamp}.csv`, 'text/csv', lines.join('\r\n') + '\r\n');
      return;
    }
    if (fmt === 'csv-events') {
      const lines = ['sessionId,studentId,t,kind,payload'];
      for (const s of filterSessions) {
        const evs = await DB.listEventsBySession(s.sessionId);
        evs.forEach(e => {
          const payload = {};
          for (const k in e) {
            if (!['eventId','sessionId','studentId','t','kind'].includes(k)) payload[k] = e[k];
          }
          lines.push([
            csvEscape(s.sessionId), csvEscape(e.studentId),
            csvEscape(e.t), csvEscape(e.kind),
            csvEscape(JSON.stringify(payload)),
          ].join(','));
        });
      }
      downloadFile(`orgquiz_events_${sid || 'all'}_${stamp}.csv`, 'text/csv', lines.join('\r\n') + '\r\n');
      return;
    }
    if (fmt === 'csv-profiles') {
      const lines = ['studentId,name,totalUsageMs,sessionCount,lastSeenAt,labelStats,dictViewCounts'];
      const ids = sid ? [sid] : rosterAll.filter(r => r.role !== 'teacher').map(r => r.id);
      const rosterMap = {};
      rosterAll.forEach(r => { rosterMap[r.id] = r; });
      for (const id of ids) {
        const p = await DB.getProfile(id);
        if (!p) continue;
        const r = rosterMap[id] || {};
        lines.push([
          csvEscape(id), csvEscape(r.name || ''),
          p.totalUsageMs || 0, p.sessionCount || 0,
          csvEscape(p.lastSeenAt || ''),
          csvEscape(JSON.stringify(p.byLabel || {})),
          csvEscape(JSON.stringify(p.dictViewCounts || {})),
        ].join(','));
      }
      downloadFile(`orgquiz_profiles_${sid || 'all'}_${stamp}.csv`, 'text/csv', lines.join('\r\n') + '\r\n');
      return;
    }
  }

  // ── 記録コードの取り込み（生徒→先生の回収）──
  function setImportMsg(msg, isErr) {
    if (!el.importCodeMsg) return;
    el.importCodeMsg.textContent = msg;
    el.importCodeMsg.style.color = isErr ? '#c0392b' : '#2c7a3f';
  }
  async function importLogCode() {
    if (!global.OrgQuizLogCode) { setImportMsg('取り込み機能が読み込まれていません', true); return; }
    const raw = (el.importCodeText.value || '').trim();
    if (!raw) { setImportMsg('コードを貼り付けてください', true); return; }
    if (el.importCodeBtn) el.importCodeBtn.disabled = true;
    setImportMsg('取り込み中…', false);
    try {
      const r = await global.OrgQuizLogCode.importCode(raw);
      _allSessionsCache = null;
      setImportMsg(`✅ 取り込み完了: ${r.studentId}（セッション ${r.sessions} 件 / イベント ${r.events} 件）`, false);
      el.importCodeText.value = '';
      await refreshRoster();
      if (typeof refreshLogs === 'function') refreshLogs();
    } catch (e) {
      setImportMsg('エラー: ' + (e && e.message), true);
    } finally {
      if (el.importCodeBtn) el.importCodeBtn.disabled = false;
    }
  }

  async function delStudentLogs() {
    const sid = prompt('全ログを削除する生徒の ID を入力してください（例: 2315H）。プロファイル/累計時間も初期化されます。');
    if (!sid) return;
    const norm = (global.OrgQuizAuth && global.OrgQuizAuth.normalizeId(sid)) || sid;
    const stu = await DB.getStudent(norm);
    if (!stu) { alert(`${norm} は名簿にいません`); return; }
    if (!confirm(`${norm} ${stu.name || ''} の全ログとプロファイルを削除します。よろしいですか？`)) return;
    const sessions = (await DB.listSessionsByStudent(norm)) || [];
    for (const s of sessions) {
      await DB.deleteEventsBySession(s.sessionId);
      await DB.deleteSession(s.sessionId);
    }
    await DB.deleteProfile(norm);
    _allSessionsCache = null;
    alert(`削除しました（${sessions.length} セッション）`);
    if (document.querySelector('.teacher-pane.is-active')?.dataset.pane === 'logs') refreshLogs();
  }
  async function delAllLogs() {
    if (!confirm('全生徒の全ログを削除します。\n名簿と累計プロファイルは保持されます。\nよろしいですか？')) return;
    if (!confirm('本当に削除しますか？（取り消し不可）')) return;
    await DB.clearStore ? null : null;
    // sessions と events を全消去
    await openClearStore('sessions');
    await openClearStore('events');
    _allSessionsCache = null;
    alert('全ログを削除しました');
  }
  async function wipeAll() {
    if (!confirm('⚠ 全データを初期化します。\n名簿・PIN・全ログ・全プロファイルが消去されます。\n本当に実行しますか？')) return;
    if (!confirm('もう一度確認します。\n本当に全データを削除しますか？（取り消し不可）')) return;
    await DB.wipeAll();
    _allSessionsCache = null;
    alert('全データを初期化しました。次回ログイン時に初期設定が必要になります。');
    if (global.OrgQuizSession && global.OrgQuizSession.logout) global.OrgQuizSession.logout();
  }

  async function openClearStore(storeName) {
    const db = await DB.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // ── 公開 API ───────────────────────────────────
  global.TeacherUI = { show, hide, refreshRoster };

  // ── 初期化 ─────────────────────────────────────
  function setup() {
    el = {
      teacherShell:   document.getElementById('teacherShell'),
      teacherCloseBtn:document.getElementById('teacherCloseBtn'),
      teacherTabs:    document.getElementById('teacherTabs'),
      rosterTbody:    document.getElementById('rosterTbody'),
      rosterCount:    document.getElementById('rosterCount'),
      rosterAddBtn:   document.getElementById('rosterAddBtn'),
      rosterAddTeacherBtn: document.getElementById('rosterAddTeacherBtn'),
      rosterImportCsvBtn:  document.getElementById('rosterImportCsvBtn'),
      rosterExportCsvBtn:  document.getElementById('rosterExportCsvBtn'),
      rosterCsvFile:  document.getElementById('rosterCsvFile'),

      rosterEditOverlay: document.getElementById('rosterEditOverlay'),
      rosterEditTitle:   document.getElementById('rosterEditTitle'),
      reOriginalId: document.getElementById('reOriginalId'),
      reRole:    document.getElementById('reRole'),
      reGrade:   document.getElementById('reGrade'),
      reClass:   document.getElementById('reClass'),
      reNumber:  document.getElementById('reNumber'),
      reName:    document.getElementById('reName'),
      reInitial: document.getElementById('reInitial'),
      rePreview: document.getElementById('rePreview'),
      rePinRow:  document.getElementById('rePinRow'),
      rePin:     document.getElementById('rePin'),
      reError:   document.getElementById('reError'),
      reCancelBtn: document.getElementById('reCancelBtn'),
      reSubmitBtn: document.getElementById('reSubmitBtn'),

      // logs
      logsFilterStudent: document.getElementById('logsFilterStudent'),
      logsFilterMode:    document.getElementById('logsFilterMode'),
      logsFilterFrom:    document.getElementById('logsFilterFrom'),
      logsFilterTo:      document.getElementById('logsFilterTo'),
      logsRefreshBtn:    document.getElementById('logsRefreshBtn'),
      logsCount:         document.getElementById('logsCount'),
      logsTbody:         document.getElementById('logsTbody'),
      logsDetail:        document.getElementById('logsDetail'),
      logsDetailTitle:   document.getElementById('logsDetailTitle'),
      logsDetailCloseBtn:document.getElementById('logsDetailCloseBtn'),
      logsEventsTbody:   document.getElementById('logsEventsTbody'),

      // stats
      statsRankTable:    document.getElementById('statsRankTable'),
      statsLabelTable:   document.getElementById('statsLabelTable'),
      statsWeakTable:    document.getElementById('statsWeakTable'),
      statsDictTable:    document.getElementById('statsDictTable'),
      statsRefreshBtn:   document.getElementById('statsRefreshBtn'),

      // export
      exportTarget:      document.getElementById('exportTarget'),
      exportStudent:     document.getElementById('exportStudent'),
      exportFormat:      document.getElementById('exportFormat'),
      exportRunBtn:      document.getElementById('exportRunBtn'),
      importCodeText:    document.getElementById('importCodeText'),
      importCodeBtn:     document.getElementById('importCodeBtn'),
      importCodeMsg:     document.getElementById('importCodeMsg'),
      delStudentLogsBtn: document.getElementById('delStudentLogsBtn'),
      delAllLogsBtn:     document.getElementById('delAllLogsBtn'),
      wipeAllBtn:        document.getElementById('wipeAllBtn'),
    };
    if (el.teacherCloseBtn) el.teacherCloseBtn.addEventListener('click', hide);
    if (el.teacherTabs) {
      el.teacherTabs.addEventListener('click', (ev) => {
        const t = ev.target.closest('.teacher-tab');
        if (!t || t.disabled) return;
        switchTab(t.dataset.tab);
      });
    }
    if (el.rosterAddBtn)        el.rosterAddBtn.addEventListener('click', () => openAdd('student'));
    if (el.rosterAddTeacherBtn) el.rosterAddTeacherBtn.addEventListener('click', () => openAdd('teacher'));
    if (el.rosterExportCsvBtn)  el.rosterExportCsvBtn.addEventListener('click', exportCsv);
    if (el.rosterImportCsvBtn)  el.rosterImportCsvBtn.addEventListener('click', importCsv);
    if (el.rosterCsvFile)       el.rosterCsvFile.addEventListener('change', onCsvFile);

    if (el.reCancelBtn) el.reCancelBtn.addEventListener('click', closeEdit);
    if (el.reSubmitBtn) el.reSubmitBtn.addEventListener('click', submitEdit);
    ['reGrade','reClass','reNumber','reInitial'].forEach(k => {
      if (el[k]) el[k].addEventListener('input', () => {
        if (k === 'reInitial') el.reInitial.value = Auth.toAscii(el.reInitial.value).trim().toUpperCase();
        updatePreview();
      });
    });

    // logs タブ
    if (el.logsRefreshBtn)     el.logsRefreshBtn.addEventListener('click', renderLogsTable);
    if (el.logsDetailCloseBtn) el.logsDetailCloseBtn.addEventListener('click', hideSessionDetail);

    // stats タブ
    if (el.statsRefreshBtn) el.statsRefreshBtn.addEventListener('click', refreshStats);

    // export タブ
    if (el.exportTarget)      el.exportTarget.addEventListener('change', onExportTargetChange);
    if (el.exportRunBtn)      el.exportRunBtn.addEventListener('click', exportRun);
    if (el.importCodeBtn)     el.importCodeBtn.addEventListener('click', importLogCode);
    if (el.delStudentLogsBtn) el.delStudentLogsBtn.addEventListener('click', delStudentLogs);
    if (el.delAllLogsBtn)     el.delAllLogsBtn.addEventListener('click', delAllLogs);
    if (el.wipeAllBtn)        el.wipeAllBtn.addEventListener('click', wipeAll);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})(window);
