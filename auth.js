/* ============================================================
   有機化学クイズ — 認証ユーティリティ（Phase 1）
   ------------------------------------------------------------
   ID 仕様:
     [学年1-3][組1-9][番号01-99][イニシャル A-Z]   例: 2315H, 3105N
     デモプレイ用: 0000D（ログ非保存）
   ID 正規化:
     全角数字/英字 → 半角、小文字 → 大文字、前後空白除去
   PIN 仕様:
     6桁数字。SHA-256 ハッシュで保存（生PINは保持しない）。
     ローカルのみ保存なので暗号学的強度ではなく「ぱっと見られても判らない」程度。
   ============================================================ */
(function (global) {
  'use strict';

  // ── 文字種正規化 ────────────────────────────────
  // 全角数字/英字 → 半角、その他はそのまま
  function toAscii(input) {
    if (typeof input !== 'string') return '';
    let out = '';
    for (let i = 0; i < input.length; i++) {
      const code = input.charCodeAt(i);
      if (code >= 0xFF10 && code <= 0xFF19)      out += String.fromCharCode(code - 0xFF10 + 0x30); // ０-９
      else if (code >= 0xFF21 && code <= 0xFF3A) out += String.fromCharCode(code - 0xFF21 + 0x41); // Ａ-Ｚ
      else if (code >= 0xFF41 && code <= 0xFF5A) out += String.fromCharCode(code - 0xFF41 + 0x61); // ａ-ｚ
      else                                       out += input[i];
    }
    return out;
  }

  // ── ID ────────────────────────────────────────
  // 生徒 ID はイニシャル任意（4桁の出席番号のみでも可）。例: 3101 / 3101A
  const STUDENT_ID_PATTERN = /^[1-3][1-9]\d{2}[A-Z]?$/;
  const TEACHER_ID_PATTERN = /^9\d{3}[A-Z]$/;
  const DEMO_ID = '0000D';

  function normalizeId(input) {
    if (typeof input !== 'string') return '';
    return toAscii(input).trim().toUpperCase();
  }
  function isValidStudentIdFormat(id) {
    return typeof id === 'string' && STUDENT_ID_PATTERN.test(id);
  }
  function isValidTeacherIdFormat(id) {
    return typeof id === 'string' && TEACHER_ID_PATTERN.test(id);
  }
  function isValidIdFormat(id) {
    if (typeof id !== 'string') return false;
    if (id === DEMO_ID) return true;
    return STUDENT_ID_PATTERN.test(id) || TEACHER_ID_PATTERN.test(id);
  }
  function isDemoId(id) {
    return id === DEMO_ID;
  }
  function detectRole(id) {
    if (id === DEMO_ID) return 'demo';
    if (TEACHER_ID_PATTERN.test(id)) return 'teacher';
    if (STUDENT_ID_PATTERN.test(id)) return 'student';
    return null;
  }
  function parseId(id) {
    if (id === DEMO_ID) {
      return { grade: 0, classNo: 0, number: 0, initial: 'D', role: 'demo' };
    }
    if (TEACHER_ID_PATTERN.test(id)) {
      return {
        grade: 9, classNo: Number(id[1]),
        number: Number(id.slice(2, 4)),
        initial: id[4], role: 'teacher',
      };
    }
    if (!STUDENT_ID_PATTERN.test(id)) return null;
    return {
      grade: Number(id[0]),
      classNo: Number(id[1]),
      number: Number(id.slice(2, 4)),
      initial: id[4] || '', role: 'student',
    };
  }
  function makeId(grade, classNo, number, initial) {
    const g = String(grade);
    const c = String(classNo);
    const n = String(number).padStart(2, '0');
    const i = toAscii(String(initial || '')).trim().toUpperCase();
    return `${g}${c}${n}${i}`;
  }

  // ── PIN ───────────────────────────────────────
  const PIN_PATTERN = /^\d{6}$/;
  function normalizePin(input) {
    return toAscii(typeof input === 'string' ? input : '').trim();
  }
  function isValidPinFormat(input) {
    return PIN_PATTERN.test(normalizePin(input));
  }
  async function hashPin(pin) {
    const norm = normalizePin(pin);
    const buf = new TextEncoder().encode(norm);
    const digest = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(digest))
      .map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // 一定時間比較（タイミング攻撃対策。学校用途では厳密には不要だがマナーとして）
  function constantTimeEqual(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    if (a.length !== b.length) return false;
    let r = 0;
    for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return r === 0;
  }

  global.OrgQuizAuth = {
    toAscii,
    normalizeId,
    isValidIdFormat, isValidStudentIdFormat, isValidTeacherIdFormat,
    isDemoId, detectRole, parseId, makeId, DEMO_ID,
    normalizePin, isValidPinFormat, hashPin, constantTimeEqual,
  };
})(window);
