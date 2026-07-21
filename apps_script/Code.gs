/**
 * 有機化学クイズ — 生徒ログ受信用 Google Apps Script
 * ------------------------------------------------------------
 * 使い方は「ログ集約_設定手順.md」を参照。
 * 手順の要点:
 *   1. 集約用の Google スプレッドシートを1つ作る
 *   2. 拡張機能 → Apps Script を開き、このコードを全部貼り付ける
 *   3. (任意) 下の SECRET を、アプリ側 sync_config.js の secret と同じ文字列にする
 *   4. デプロイ → 新しいデプロイ → 種類「ウェブアプリ」
 *      ・次のユーザーとして実行: 自分
 *      ・アクセスできるユーザー: 全員
 *   5. 発行された URL を sync_config.js の url に貼る
 *
 * 生徒端末から送られてくるのは出席番号・操作ログのみ（氏名は含まない）。
 * "events"（操作イベント）と "sessions"（利用セッション要約）の2シートに追記される。
 */

// スパム防止の合言葉。アプリ側 sync_config.js の secret と一致させる（空文字なら照合しない）。
var SECRET = '';

var EVENT_COLS   = ['t', 'studentId', 'sessionId', 'kind', 'mode', 'qid', 'label', 'given', 'correct', 'ms', 'extra', 'uid'];
var SESSION_COLS = ['studentId', 'sessionId', 'startedAt', 'endedAt', 'durationMs', 'autoEnded', 'uid'];

// ブラウザで URL を開いたときの疎通確認用
function doGet(e) {
  return ContentService
    .createTextOutput('OrgQuizLog receiver OK. Send logs via POST.')
    .setMimeType(ContentService.MimeType.TEXT);
}

// アプリからのログ受信
function doPost(e) {
  var out = { ok: false, added: 0 };
  try {
    var data = JSON.parse(e.postData.contents);
    if (SECRET && data.secret !== SECRET) {
      out.error = 'bad secret';
      return json(out);
    }
    var rows = data.rows || [];
    var cache = CacheService.getScriptCache();

    // 追記は複数生徒が同時に来ても壊れないよう排他ロックで直列化
    var lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var evSheet = getSheet(ss, 'events', EVENT_COLS);
      var seSheet = getSheet(ss, 'sessions', SESSION_COLS);
      var evBuf = [], seBuf = [];

      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        if (r.uid) {
          if (cache.get(r.uid)) continue;   // 6時間以内に受信済みの重複はスキップ
          cache.put(r.uid, '1', 21600);
        }
        if (r.type === 'session') {
          seBuf.push(SESSION_COLS.map(function (c) { return r[c] == null ? '' : r[c]; }));
        } else {
          evBuf.push(EVENT_COLS.map(function (c) { return r[c] == null ? '' : r[c]; }));
        }
      }
      if (evBuf.length) {
        evSheet.getRange(evSheet.getLastRow() + 1, 1, evBuf.length, EVENT_COLS.length).setValues(evBuf);
      }
      if (seBuf.length) {
        seSheet.getRange(seSheet.getLastRow() + 1, 1, seBuf.length, SESSION_COLS.length).setValues(seBuf);
      }
      out.ok = true;
      out.added = evBuf.length + seBuf.length;
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    out.error = String(err);
  }
  return json(out);
}

function getSheet(ss, name, cols) {
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, cols.length).setValues([cols]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
