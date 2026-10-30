/*
 * Hilbert Hotel engine
 * --------------------
 * A tiny engine for Obra-Dinn-style deduction games set in a hotel with a
 * room for every positive integer. All content lives in game.js and is handed
 * to the engine through HOTEL.define({...}). See README.md for the data format.
 */
(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Built-in UI strings. Games may override any of these via `ui: { en, ja }`.
  // ---------------------------------------------------------------------------
  const UI = {
    en: {
      goTo: 'Go to room',
      go: 'Go',
      placeholder: 'any positive integer',
      notebook: 'Notebook',
      register: 'Register',
      notes: 'Notes',
      noNotes: 'Nothing written down yet.',
      name: 'Guest',
      wish: 'Wish',
      room: 'Room',
      unknown: '—',
      wishMany: t => `Several wishes contain “${t}”. Type more of it, or pick one from the list.`,
      wishNone: t => `No wish contains “${t}”.`,
      wishClear: 'Remove this wish',
      confirmed: 'Confirmed',
      roomTitle: n => `Room ${n}`,
      floorTitle: f => `Floor ${f}`,
      recent: 'Recent',
      invalid: 'Room numbers are positive integers: 1, 2, 3, …',
      startGame: 'Start Game',
      chooseLanguage: 'Choose language',
      langLocked: 'The language is fixed for this game. Start a new game to change it.',
      textSize: 'Text size',
      yourName: 'your name',
      resume: 'Continue',
      newGame: 'New game',
      prologueLog: 'Read the prologue',
      resetConfirm: 'Erase all progress and start over?',
      continue: 'Continue',
      confirmToast: k => `${k} deductions confirmed.`,
      close: 'Close',
      memory: 'Memory Device',
      noScenes: 'nothing to see',
      debugMemory: 'Dbg: Memory',
      present: 'Back to the present',
      hour: h => `${pad2(h)}:00`,
      hourShort: h => pad2(h),
      span: h => `${pad2(h)}:00–${pad2(h + 1)}:00`,
      pastTitle: t => `Yesterday, ${t}`,
      pastEmpty: 'The room as it was then. Nothing here concerns the register.',
      badTime: (a, b) => `The Memory Device only reaches the hours from ${pad2(a)}:00 to ${pad2(b)}:00 of yesterday.`,
      inventory: 'Inventory',
      noItems: 'You aren\'t carrying anything.',
      inventoryBack: '‹ Inventory',
      addedToInventory: 'Added to Inventory',
      hints: 'Hints',
      noHints: 'No hints yet.',
      hintIntro: 'Ask about a guest by name or wish.',
      hintLocked: 'Some hints only appear once you have made more progress or read other hints.',
      hintBy: 'Ask by',
      hintByName: 'Name',
      hintByWish: 'Wish',
      hintNamePlaceholder: "Guest's name",
      hintPickWish: 'Choose a wish',
      hintAsk: 'Ask',
      hintShow: 'Show hint',
      hintsLocked: n => n === 1
        ? '1 more hint here is locked until you have made more progress.'
        : `${n} more hints here are locked until you have made more progress.`,
      hintBehind: n => n === 1
        ? '1 more hint follows from this one, once you have made more progress.'
        : `${n} more hints follow from this one, once you have made more progress.`,
      hintNone: 'No hints for now. Look around some more and come back later.',
      hintUnknown: 'No guest by that name.',
      hintConfirmed: 'This guest is already confirmed in the register.',
      hintGeneral: 'General',
      namesList: 'Guest list',
      wishesList: 'Wishes',
      namePlaceholder: 'name',
      bigRoom: 'For a room above 999,999,999, you may write 0.',
      rowRef: n => `row ${n}`,
      leftover: 'Not written yet',
      leftoverNone: 'Every name and wish is written down.',
      leftoverNames: 'Names',
      leftoverWishes: 'Wishes',
      gridOpen: 'Elimination grid',
      gridHelp: 'How it works',
      gridWidth: 'Width',
      gridHeight: 'Height',
      gridText: 'Text',
      gridFit: 'Fit',
      gridTitle: 'Elimination grid',
      gridIntro: 'Click a square to mark it: ✗ (not this wish), ? (maybe), ✓ (this wish). A ✓ crosses out the rest of its row and column for you. The grid is only your own working: it doesn\'t change the register.',
      gridShowConfirmed: 'Show confirmed guests',
      gridClear: 'Clear marks',
      gridClearConfirm: 'Erase every mark in the grid?',
      gridDone: 'Every guest on the Guest List is confirmed.',
      gridCell: (guest, wish) => `${guest}: ${wish}`,
      gridIntroHours: 'The guests are grouped by their hours on the Check-in List. Give a wish a range of hours (or a single hour), and everyone not listed in that range is crossed out of its row.',
      gridFrom: wish => `From: ${wish}`,
      gridTo: wish => `To: ${wish}`,
      gotPaper: t => `Received: ${t}`,
      learned: name => `New skill: ${name}`,
      obtained: name => `Obtained: ${name}`,
      walkTo: 'Go to',
      otherFloor: where => `The warp device fails to warp you to ${where}.`,
      tooHigh: 'You cannot enter a room above 999,999,999.',
      liftName: i => `Elevator ${i}`,
      useLift: 'Use Elevator',
      liftPast: 'Back to the present to use the elevator.',
      liftEntered: name => `You entered the ${name}.`,
      noteAdd: 'Add note',
      notePlaceholder: 'Write something down…',
      clip: '+ Notebook',
      clipped: 'Added to the notebook.',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      deleteConfirm: 'Delete this note?',
      pageTitle: i => `Page ${i}`,
      newPage: '+ Page',
      deletePage: 'Delete page',
      deletePageConfirm: 'Delete this page and the notes you wrote on it?',
      fates: 'See everyone\'s fate',
      fatesShort: 'Fates',
      fatesTitle: 'Everyone\'s fate',
      fatesSort: 'Sort',
      fatesByName: 'A–Z',
      fatesByRoom: 'By room',
      fatesShowAll: 'Show all fates',
      fatesHideAll: 'Hide all fates',
      fateShow: 'Show fate',
      fateHide: 'Hide fate',
      back: 'Back',
      reset: 'Start over',
      saveMenu: 'Save',
      menu: 'Menu',
      saveLoad: 'Save / Load…',
      saveSlot: n => `Slot ${n}`,
      slotEmpty: 'Empty',
      slotInfo: (name, k, when) => `${name || '—'} · ${k} confirmed · ${when}`,
      saveHere: 'Save',
      loadHere: 'Load',
      overwriteConfirm: n => `Save over Slot ${n}?`,
      loadConfirm: 'Load this save? The game you are playing now will be replaced.',
      saved: n => `Saved to Slot ${n}.`,
      saveFailed: 'Could not save: this browser is not letting the game store data.',
      loaded: 'Save loaded.',
      exportSave: 'Export to file',
      importSave: 'Import from file',
      exported: 'Saved to a file.',
      importBad: 'That file is not a save from this game.',
      autosave: 'Autosave',
      autosaveOn: 'The game saves itself after every move.',
      autosaveOff: 'Autosave is off: progress is only kept when you save. Reopening the page continues from your last save or load.',
      hide: 'Hide',
      clickToContinue: 'Click to continue',
    },
    ja: {
      goTo: '部屋へ移動',
      go: '移動',
      placeholder: '正整数',
      notebook: '手帳',
      register: '宿帳',
      notes: 'メモ',
      noNotes: 'まだ何も書き留めていない。',
      name: '宿泊客',
      wish: '願い',
      room: '部屋',
      unknown: '—',
      wishMany: t => `「${t}」を含む願いが複数あります。もう少し入力するか、一覧から選んでください。`,
      wishNone: t => `「${t}」を含む願いはありません。`,
      wishClear: 'この願いを消す',
      confirmed: '確定',
      roomTitle: n => `${n}号室`,
      floorTitle: f => `${f}階`,
      recent: '最近',
      invalid: '部屋番号は正整数です（1, 2, 3, …）。',
      startGame: 'ゲームを始める',
      chooseLanguage: '言語を選ぶ',
      langLocked: 'このゲームの言語は固定されています。変更するには最初から始めてください。',
      textSize: 'フォントサイズ',
      yourName: 'あなたの名前',
      resume: '続きから',
      newGame: '最初から',
      prologueLog: 'プロローグを読み返す',
      resetConfirm: 'すべての進行状況を消去して最初からやり直しますか？',
      continue: '続ける',
      confirmToast: k => `${k}件の推理が確定した。`,
      close: '閉じる',
      memory: '記憶装置',
      noScenes: '見るものはない',
      debugMemory: 'Dbg: 記憶装置',
      present: '現在に戻る',
      hour: h => `${h}時`,
      hourShort: h => `${h}時`,
      span: h => `${h}時〜${h + 1}時`,
      pastTitle: t => `昨日 ${t} の様子`,
      pastEmpty: 'その時の部屋の姿。宿帳に関わるものは何もない。',
      badTime: (a, b) => `記憶装置で見られるのは、昨日の${a}時台から${b}時台までです。`,
      inventory: '持ち物',
      noItems: '何も持っていない。',
      inventoryBack: '‹ 持ち物',
      addedToInventory: '持ち物に追加',
      hints: 'ヒント',
      noHints: 'ヒントはまだない。',
      hintIntro: '宿泊客の名前か願いから、その人についてのヒントが見られる。',
      hintLocked: 'ヒントの中には、調査を進めたり、他のヒントを見たりしないと現れないものもある。',
      hintBy: '調べ方',
      hintByName: '名前',
      hintByWish: '願い',
      hintNamePlaceholder: '宿泊客の名前',
      hintPickWish: '願いを選ぶ',
      hintAsk: '調べる',
      hintShow: 'ヒントを見る',
      hintsLocked: n => `ここには、調査を進めないと見られないヒントがあと${n}件ある。`,
      hintBehind: n => `調査を進めると、このヒントに続くヒントがあと${n}件現れる。`,
      hintNone: '今見られるヒントはない。もう少し調べてから、また来よう。',
      hintUnknown: 'その名前の宿泊客は見つからない。',
      hintConfirmed: 'この宿泊客はすでに宿帳で確定している。',
      hintGeneral: '全般',
      namesList: '宿泊客名簿',
      wishesList: '願いの一覧',
      namePlaceholder: '名前',
      bigRoom: '999,999,999より大きい部屋番号は 0 と書いてもよい。',
      rowRef: n => `${n}行目`,
      leftover: '未記入',
      leftoverNone: 'すべての名前と願いを書き込んだ。',
      leftoverNames: '名前',
      leftoverWishes: '願い',
      gridOpen: '消去法の表',
      gridHelp: '使い方',
      gridWidth: '横',
      gridHeight: '縦',
      gridText: '文字',
      gridFit: '画面に合わせる',
      gridTitle: '消去法の表',
      gridIntro: 'マスをクリックすると印がつく：✗（この願いではない）、?（もしかして）、✓（この願い）。✓をつけると、同じ行と列の残りのマスには自動で✗がつく。この表は自分用のメモで、宿帳には影響しない。',
      gridShowConfirmed: '確定した宿泊客も表示',
      gridClear: '印を消す',
      gridClearConfirm: '表の印をすべて消しますか？',
      gridDone: '宿泊客名簿の全員が確定した。',
      gridCell: (guest, wish) => `${guest}：${wish}`,
      gridIntroHours: '宿泊客はチェックイン一覧の時刻ごとにまとめてある。願いに時刻の範囲（または一つの時刻）をつけると、その範囲の一覧にいない人は、その行で自動的に✗になる。',
      gridFrom: wish => `開始：${wish}`,
      gridTo: wish => `終了：${wish}`,
      gotPaper: t => `受け取った：${t}`,
      learned: name => `新しいスキル：${name}`,
      obtained: name => `入手した：${name}`,
      walkTo: '移動先',
      otherFloor: where => `ワープ装置は${where}へのワープに失敗した。`,
      tooHigh: '999,999,999より大きい番号の部屋には入れない。',
      liftName: i => `${i}号機`,
      useLift: 'エレベーターに乗る',
      liftPast: 'エレベーターは現在に戻ってから使える。',
      liftEntered: name => `${name}に乗った。`,
      noteAdd: 'メモを追加',
      notePlaceholder: 'メモを書く…',
      clip: '＋ 手帳へ',
      clipped: '手帳に書き留めた。',
      edit: '編集',
      save: '保存',
      cancel: 'キャンセル',
      delete: '削除',
      deleteConfirm: 'このメモを削除しますか？',
      pageTitle: i => `${i}ページ`,
      newPage: '＋ ページ',
      deletePage: 'ページを削除',
      deletePageConfirm: 'このページと、そこに書いたメモを削除しますか？',
      fates: 'みんなの結末を見る',
      fatesShort: '結末',
      fatesTitle: 'みんなの結末',
      fatesSort: '並べ替え',
      fatesByName: '名前順',
      fatesByRoom: '部屋番号順',
      fatesShowAll: 'すべての結末を表示',
      fatesHideAll: 'すべての結末を隠す',
      fateShow: '結末を見る',
      fateHide: '結末を隠す',
      back: '戻る',
      reset: '最初からやり直す',
      saveMenu: 'セーブ',
      menu: 'メニュー',
      saveLoad: 'セーブ／ロード…',
      saveSlot: n => `スロット${n}`,
      slotEmpty: '空き',
      slotInfo: (name, k, when) => `${name || '—'}・${k}人確定・${when}`,
      saveHere: 'セーブ',
      loadHere: 'ロード',
      overwriteConfirm: n => `スロット${n}に上書きしますか？`,
      loadConfirm: 'このデータをロードしますか？ 今プレイ中のゲームは置き換えられます。',
      saved: n => `スロット${n}にセーブしました。`,
      saveFailed: 'セーブできませんでした。このブラウザではデータを保存できません。',
      loaded: 'ロードしました。',
      exportSave: 'ファイルに書き出す',
      importSave: 'ファイルから読み込む',
      exported: 'ファイルに書き出しました。',
      importBad: 'このゲームのセーブデータではありません。',
      autosave: 'オートセーブ',
      autosaveOn: '一手ごとに自動でセーブされます。',
      autosaveOff: 'オートセーブはオフです。セーブしたときだけ進行状況が保存されます。ページを開き直すと、最後にセーブまたはロードしたところから再開します。',
      hide: '閉じる',
      clickToContinue: 'クリックして続ける',
    },
  };

  const LANGS = ['en', 'ja'];
  const LANG_NAMES = { en: 'English', ja: '日本語' };

  // Rooms above 999,999,999 may be written in the register as 0.
  const HUGE = 999999999n;
  // The longest name the player may give in the prologue.
  const MAX_NAME = 32;

  let game = null;   // the definition passed to HOTEL.define
  let state = null;  // mutable, saved to localStorage
  let ui = null;     // merged UI strings
  let memory = null; // game.memory with defaults: { from, to, except, empty }
  const $ = sel => document.querySelector(sel);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  // Normalise any room reference (number, bigint, string with full-width
  // digits/commas/spaces) into a canonical decimal string, or null.
  function normRoom(x) {
    if (x === null || x === undefined) return null;
    let str = String(x)
      .replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
      .replace(/[\s,_，、]/g, '');
    if (!/^\d+$/.test(str)) return null;
    str = str.replace(/^0+/, '');
    return str === '' ? '0' : str;
  }

  // Named places (Floor 0's lobby, dining room, …) are referred to by id.
  // Returns a place id or a canonical room number, or null.
  function normPlace(x) {
    if (typeof x === 'string' && placeById[x]) return x;
    return normRoom(x);
  }

  function roomLabel(room) {
    return placeById[room] ? L(placeById[room].name) : ui.roomTitle(room);
  }

  // ---------------------------------------------------------------------------
  // Time (the Memory Device: a room's scenes from one hour of the previous day,
  // between memory.from and memory.to)
  // ---------------------------------------------------------------------------
  const pad2 = v => String(v).padStart(2, '0');

  const inMemory = h => h >= memory.from && h <= memory.to;

  // Whether the Memory Device works in a room (every room but memory.except).
  function remembers(room) {
    return !memory.except.includes(room);
  }

  // Normalise an hour of yesterday to 0–23, or null. Accepts 2, '02', '14:00',
  // '14:30' (that hour), '2pm', '2 a.m.', '14時', '午後2時' and full-width digits.
  function normHour(x) {
    if (x === null || x === undefined) return null;
    let str = String(x)
      .replace(/[０-９：]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
      .toLowerCase().replace(/[\s.]/g, '');
    let pm = null;
    str = str.replace(/^(午前|午後)/, (m, p) => { pm = p === '午後'; return ''; })
      .replace(/(am|pm)$/, m => { pm = m === 'pm'; return ''; });
    const m = str.match(/^(\d{1,2})(?:[:時](\d{2})?分?)?$/);
    if (!m || +(m[2] || 0) > 59) return null;
    const h = +m[1];
    if (pm === null) return h <= 23 ? h : null;
    return h <= 12 ? h % 12 + (pm ? 12 : 0) : null;
  }

  // A place the player can be: a room, optionally at an hour in the past.
  function viewKey(room, at) { return at === null || at === undefined ? room : room + '@' + at; }

  // The keys of a `scenes` table that cover hour h: the hour itself first,
  // then every range like '9-17' that includes it, in the order written.
  function hourKeys(table, h) {
    const keys = Object.keys(table);
    return keys.filter(k => !k.includes('-') && +k === h).concat(keys.filter(k => {
      const [a, b] = k.split('-').map(Number);
      return k.includes('-') && h >= a && h <= b;
    }));
  }

  // A scene is text, or { title, text, dialogue, onEnter, when }.
  function asScene(e) {
    if (e === undefined || e === null) return {};
    if (typeof e === 'object' && ['title', 'text', 'dialogue', 'onEnter', 'when'].some(k => k in e)) return e;
    return { text: e };
  }

  // Typed names are matched loosely, ignoring case, accents, spaces and
  // punctuation, but only in the language the game is played in.
  function nameKey(str) {
    // Lowercase first: some capitals (e.g. "İ") lowercase to a letter plus a mark.
    // After NFKD (which also widens half-width katakana), katakana becomes
    // hiragana, so a name typed in either matches the other.
    return String(str || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
      .replace(/[ァ-ヶ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60))
      .replace(/[\s\p{P}\p{S}]/gu, '');
  }

  // Every guest a typed name could mean. Usually one, but the player may have
  // given themselves a guest's name, and then that name means either of them:
  // the wish and room on the row tell which (no two guests share a room).
  function charsForName(str) {
    const k = nameKey(str);
    if (!k) return [];
    const out = [];
    const id = (nameIndex[state.lang] || {})[k];
    if (id) out.push(charById[id]);
    const me = game.characters.find(c => c.player);
    if (me && k === nameKey(state.player)) out.push(me);
    return out;
  }

  // A guest's name in the current language. The guest marked `player: true`
  // is the player, whose name is whatever they gave in the prologue.
  function charName(c) {
    return c.player ? state.player || '' : L(c.name);
  }

  // Whether a register room is right: exact, or 0 for a room above 999,999,999.
  function roomMatches(typed, room) {
    const r = normRoom(typed), want = normRoom(room);
    return r !== null && (r === want || (r === '0' && BigInt(want) > HUGE));
  }

  // Resolve a localisable value: string | {en, ja} | function(s) -> either.
  function L(value, s) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'function') return L(value(s || ctx()), s);
    if (typeof value === 'object' && !Array.isArray(value)) {
      return value[state.lang] !== undefined ? value[state.lang] : (value.en !== undefined ? value.en : '');
    }
    return String(value);
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // {n} current room, {floor} current floor, {room:id} a guest's room,
  // {name:id} a guest's name, {wish:id} a wish's text, {flag:key} a stored value,
  // {at} the hour being viewed in the past, {player} the player's name.
  function template(str, s) {
    return str.replace(/\{(\w+)(?::([\w-]+))?\}/g, (m, key, arg) => {
      if (key === 'player') return state.player || '';
      if (key === 'n') return placeById[s.room] ? L(placeById[s.room].name) : s.room;
      if (key === 'at') return s.past ? ui.hour(s.at) : '';
      if (key === 'floor') return String(floorOf(s.room));
      if (key === 'room' && arg && charById[arg]) return normRoom(charById[arg].room);
      if (key === 'name' && arg && charById[arg]) return charName(charById[arg]);
      if (key === 'wish' && arg && wishById[arg]) return L(wishById[arg]);
      if (key === 'flag' && arg) return String(state.flags[arg] !== undefined ? state.flags[arg] : '');
      return m;
    });
  }

  // Minimal markup: blank line = new paragraph, newline = <br>,
  // **bold**, *italic*, ~~struck~~, %%grayed out%%.
  function renderMarkup(str, s) {
    return template(str, s)
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(Boolean)
      .map(p => '<p>' + escapeHtml(p)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/~~(.+?)~~/g, '<s>$1</s>')
        .replace(/%%(.+?)%%/g, '<span class="dim">$1</span>')
        .replace(/\n/g, '<br>') + '</p>')
      .join('');
  }

  function floorOf(room) {
    if (placeById[room]) return placeById[room].floor || 0;
    const n = BigInt(room);
    if (game.floors && typeof game.floors.of === 'function') return game.floors.of(n);
    return room.length; // default: one floor per digit count
  }

  // Whether a floor has numbered rooms (Floor 0 holds only named places by default).
  function hasNumberedRooms(f) {
    if (game.floors && typeof game.floors.numbered === 'function') return !!game.floors.numbered(f);
    return f !== 0;
  }

  function floorLabel(f, s) {
    return game.floors && game.floors.name ? L(game.floors.name(f, s), s) : ui.floorTitle(f);
  }

  // Deterministic pseudo-random generator seeded by a string (for procedural rooms).
  function seeded(seedStr) {
    let h = 2166136261;
    for (let i = 0; i < seedStr.length; i++) { h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619); }
    return function () {
      h += 0x6D2B79F5;
      let t = h;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function isPrime(nb) {
    const n = BigInt(nb);
    if (n < 2n) return false;
    if (n < 4n) return true;
    if (n % 2n === 0n || n % 3n === 0n) return false;
    if (n > 10n ** 12n) return null; // unknown: too large to check cheaply
    for (let i = 5n; i * i <= n; i += 6n) if (n % i === 0n || n % (i + 2n) === 0n) return false;
    return true;
  }

  // Integer square root by Newton's method (exact for any BigInt size).
  function isqrt(n) {
    if (n < 2n) return n;
    let x = 1n << BigInt((n.toString(2).length >> 1) + 1);
    for (;;) {
      const y = (x + n / x) >> 1n;
      if (y >= x) return x;
      x = y;
    }
  }

  function isSquare(nb) {
    const n = BigInt(nb);
    if (n < 0n) return false;
    const r = isqrt(n);
    return r * r === n;
  }

  function isPowerOf(nb, base) {
    let n = BigInt(nb); const b = BigInt(base);
    if (n < 1n) return false;
    while (n % b === 0n) n /= b;
    return n === 1n;
  }

  // ---------------------------------------------------------------------------
  // State & persistence
  // ---------------------------------------------------------------------------
  function freshState() {
    return {
      lang: state ? state.lang : (navigator.language || '').startsWith('ja') ? 'ja' : 'en',
      started: false,
      step: 0,        // the prologue step being shown, or null once it's over
      player: '',     // the name the player gave in the prologue
      nbHidden: false, // the notebook is hidden (wide screens); a new game starts with it open
      room: null,
      at: null,       // hour of yesterday being viewed (memory.from–memory.to), or null for the present
      visits: {},     // room (or "room@hour") -> count
      skills: {},     // skillId -> true
      flags: {},      // arbitrary author-defined values
      entries: [],    // register rows { name, wish, room, cid } (cid once confirmed)
      confirmed: {},  // charId -> true
      papers: startPapers(), // paperId -> true
      notes: [],      // game notes { id, text, page }; player notes { uid, user, text, page, quote?, from?, at? }
      notePages: [{ uid: 'p1', title: '' }],
      notePage: 'p1', // the page of notes that is open
      history: [],    // recent rooms, newest first
      taken: {},      // "dialogue/node/choiceIndex" -> true once picked (for `once` choices, and choices shown in order)
      hintsSeen: {},  // hint id -> true once the player has shown it
      hintsClosed: {}, // hint id -> true when the player has folded a shown hint away
      grid: {},       // "charId|wishId" -> 'x', '?' or 'v': the player's marks in the elimination grid
      gridHours: {},  // wishId -> [from, to]: the range of hours the player has tagged it with in the grid
      ended: false,
    };
  }

  function saveKey() { return 'hilbert-hotel:' + (game.id || 'game'); }

  // Autosave is on unless the player turns it off in the Save menu; kept in
  // this browser as a preference rather than in the save. With it off, the
  // game is only written when the player saves or loads, and reopening the
  // page continues from there.
  const AUTOSAVE_KEY = 'hilbert-hotel:autosave';
  let autosave = (() => {
    try { return localStorage.getItem(AUTOSAVE_KEY) !== 'false'; } catch (e) { return true; }
  })();
  let unsaved = false;  // changes not written yet (autosave off)

  // Writes the game where reopening the page will find it.
  function writeSave() {
    unsaved = false;
    try { localStorage.setItem(saveKey(), JSON.stringify(state)); } catch (e) { /* storage unavailable */ }
  }

  function save() {
    if (autosave) writeSave();
    else unsaved = true;
  }

  function setAutosave(on) {
    autosave = on;
    try { localStorage.setItem(AUTOSAVE_KEY, String(on)); } catch (e) { /* storage unavailable */ }
    if (on) writeSave();
  }

  // Save slots: { savedAt, state } under the save key plus ':slot1', ':slot2', …
  const SLOTS = 3;
  function slotKey(n) { return saveKey() + ':slot' + n; }

  function readSlot(n) {
    try {
      const data = JSON.parse(localStorage.getItem(slotKey(n)));
      return data && data.state && typeof data.state === 'object' ? data : null;
    } catch (e) { return null; }
  }

  function saveToSlot(n) {
    try { localStorage.setItem(slotKey(n), JSON.stringify({ savedAt: Date.now(), state })); }
    catch (e) { toast(ui.saveFailed); return; }
    writeSave();
    toast(ui.saved(n));
  }

  // The save as a .json file: { game, savedAt, state }.
  function exportSave() {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
    const data = JSON.stringify({ game: game.id || 'game', savedAt: now.getTime(), state });
    const a = el('a');
    a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    a.download = `hilbert-hotel-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    writeSave();
    toast(ui.exported);
  }

  function importSave(file) {
    file.text().then(text => {
      let data = null;
      try { data = JSON.parse(text); } catch (e) { /* not JSON */ }
      const saved = data && data.state;
      if (!saved || typeof saved !== 'object' || typeof saved.confirmed !== 'object' || (data.game && data.game !== (game.id || 'game'))) {
        alert(ui.importBad);
        return;
      }
      if (confirm(ui.loadConfirm)) loadState(saved);
    });
  }

  // Replaces the game being played with a saved one, and picks it up where
  // it was left.
  function loadState(saved) {
    state = upgrade(saved);
    writeSave();
    resetView();
    toast(ui.loaded);
    if (state.started) runPrologue();
    else renderHome();
  }

  function load() {
    try {
      const raw = localStorage.getItem(saveKey());
      if (raw) return upgrade(JSON.parse(raw));
    } catch (e) { /* storage unavailable or corrupt */ }
    return null;
  }

  // Bring older saves up to date: past times used to be dates, then any hour
  // (the 'history' skill, now the Memory Device), the register used to list
  // every guest by name, there was no prologue, notes were on a single page,
  // and items were described in the notes rather than the Inventory.
  function upgrade(saved) {
    const s = Object.assign(freshState(), saved);
    if (s.skills.history) {
      delete s.skills.history;
      s.skills.memory = true;
      s.notes = s.notes.filter(n => n.id !== 'skill:history');
    }
    Object.entries(game.skills || {}).forEach(([id, sk]) => {
      if (sk.item) s.notes = s.notes.filter(n => n.id !== 'skill:' + id);
    });
    if (!('step' in saved)) s.step = saved.started ? null : 0;
    // Papers held from the start that were added to the game after this save.
    papers().forEach(p => { if (p.start !== false && !(p.id in s.papers)) s.papers[p.id] = true; });
    if (!Array.isArray(s.notePages) || !s.notePages.length) s.notePages = [{ uid: 'p1', title: '' }];
    const pages = s.notePages.map(p => p.uid);
    if (!pages.includes(s.notePage)) s.notePage = pages[0];
    s.notes.forEach(n => { if (!pages.includes(n.page)) n.page = pages[0]; });
    if (typeof s.at !== 'number' || !inMemory(s.at) || (s.room && !remembers(s.room))) s.at = null;
    s.history = s.history.filter(k => {
      const m = k.match(/@(\d{1,2})$/);
      return !k.includes('@') || (m && inMemory(+m[1]) && remembers(k.split('@')[0]));
    });
    if (saved.guesses && !saved.entries) {
      s.entries = game.characters.filter(c => saved.guesses[c.id]).map(c => {
        const g = saved.guesses[c.id];
        const name = c.name && typeof c.name === 'object' ? c.name[s.lang] || c.name.en : String(c.name);
        return { name, wish: g.wish, room: g.room, cid: s.confirmed[c.id] ? c.id : undefined };
      });
      delete s.guesses;
    }
    return s;
  }

  // The object handed to every content function. `at` looks at the room at
  // another hour than the one being viewed.
  function ctx(at = state.at) {
    const room = state.room || normPlace(game.startRoom || 1);
    const place = !!placeById[room];
    return {
      lang: state.lang,
      player: state.player || '',             // the name the player gave
      room,                                   // canonical string, or a place id
      place: place ? room : null,             // place id when in a named place
      n: place ? null : BigInt(room),         // exact BigInt
      num: place ? NaN : Number(room),        // convenient, may lose precision
      floor: floorOf(room),
      at,                                     // hour of yesterday (memory.from–memory.to), or null
      past: at !== null,
      firstVisit: (state.visits[viewKey(room, at)] || 0) <= 1,
      flag: k => !!state.flags[k],
      get: k => state.flags[k],
      set: (k, v) => { state.flags[k] = v === undefined ? true : v; },
      unset: k => { delete state.flags[k]; },
      knows: id => !!state.skills[id],
      learn: id => learn(id),
      visits: r => state.visits[r === undefined ? viewKey(room, at) : normPlace(r)] || 0,
      visited: r => (state.visits[normPlace(r)] || 0) > 0,
      confirmed: id => !!state.confirmed[id],
      confirmedCount: () => Object.keys(state.confirmed).length,
      // A line of a paper listing guests or wishes, marked by the register.
      markGuest: (id, text) => markLine(L(text), !!state.confirmed[id], registerUse().guests[id]),
      markWish: (id, text) => markWishLine(L(text), confirmedWishes().has(id), registerUse().wishes[id]),
      guess: id => {
        const e = state.entries.find(e => e && (e.cid === id || charsForName(e.name).includes(charById[id])));
        return e ? { name: e.name, wish: e.wish, room: e.room } : {};
      },
      note: (text, id) => addNote(text, id),
      hasNote: id => state.notes.some(n => n.id === id),
      toast: text => toast(L(text)),                // a short notification
      give: id => give(id),
      hasPaper: id => !!state.papers[id],
      roomOf: id => charById[id] ? normRoom(charById[id].room) : null,
      util: HOTEL.util,
    };
  }

  // ---------------------------------------------------------------------------
  // Validation (runs once at define time; prints authoring mistakes)
  // ---------------------------------------------------------------------------
  let charById = {};
  let wishById = {};
  let placeById = Object.create(null);
  let nameIndex = {}; // lang -> nameKey -> charId

  // Each language accepts its own version of every name. A plain-text name or
  // alias counts in every language; { en, ja } counts in its own (a missing
  // language falls back to English, as the name is shown).
  function indexNames() {
    nameIndex = {};
    LANGS.forEach(l => { nameIndex[l] = Object.create(null); });
    game.characters.forEach(c => {
      [c.name].concat(c.aliases || []).forEach(n => {
        LANGS.forEach(l => {
          const str = n && typeof n === 'object' ? (n[l] !== undefined ? n[l] : n.en) : n;
          const k = typeof str === 'string' ? nameKey(str) : '';
          if (!k) return;
          const seen = nameIndex[l][k];
          if (seen && seen !== c.id) console.warn('[hotel]', `characters "${seen}" and "${c.id}" share the name "${str}"`);
          else nameIndex[l][k] = c.id;
        });
      });
    });
  }

  function validate() {
    const warn = (...a) => console.warn('[hotel]', ...a);
    (game.places || []).forEach(p => {
      if (!p.id || normRoom(p.id) !== null || /[@\s]/.test(p.id)) warn('place ids must be words without "@" or spaces, not numbers', p);
    });
    if (game.elevators && typeof game.elevators.landing !== 'function') warn('elevators.landing(floor) must say where each floor\'s elevators open');
    const rooms = {};
    game.characters.forEach(c => {
      if (!c.id) warn('character without id', c);
      if (!wishById[c.wish]) warn(`character "${c.id}" has unknown wish "${c.wish}"`);
      const r = normRoom(c.room);
      if (!r || r === '0') warn(`character "${c.id}" has invalid room`, c.room);
      if (rooms[r]) warn(`characters "${rooms[r]}" and "${c.id}" share room ${r}`);
      rooms[r] = c.id;
    });
    (game.rooms || []).forEach((rule, i) => {
      const ids = [].concat(rule.match).filter(m => typeof m === 'string' && m[0] === '@');
      ids.forEach(m => { if (!charById[m.slice(1)]) warn(`rooms[${i}] references unknown character ${m}`); });
      if (typeof rule.dialogue === 'string' && !(game.dialogues || {})[rule.dialogue]) warn(`rooms[${i}] references unknown dialogue "${rule.dialogue}"`);
      if (rule.at !== undefined) warn(`rooms[${i}] uses "at", which is no longer supported: give the rule a "scenes" table of hours instead`);
      if (rule.past !== undefined) warn(`rooms[${i}] uses "past", which is now "scenes": hours ${memory.from}–${memory.to}, each with a list of scenes`);
      const unseen = [].concat(rule.match).map(normPlace).filter(r => r !== null && !remembers(r));
      if (rule.scenes && unseen.length) warn(`rooms[${i}] has scenes, but the Memory Device doesn't work in ${unseen.join(', ')} (memory.except)`);
      Object.entries(rule.scenes || {}).forEach(([key, list]) => {
        const m = key.match(/^(\d{1,2})(?:-(\d{1,2}))?$/);
        const a = m && +m[1], b = m && +(m[2] || m[1]);
        if (!m || !inMemory(a) || !inMemory(b) || b < a) {
          warn(`rooms[${i}].scenes has invalid hour "${key}" (use ${memory.from}–${memory.to} or a range like "9-17")`);
        }
        [].concat(list).forEach(e => {
          const d = asScene(e).dialogue;
          if (typeof d === 'string' && !game.dialogues[d]) warn(`rooms[${i}].scenes["${key}"] references unknown dialogue "${d}"`);
        });
      });
    });
    if (game.history) warn('"history" is now "memory": { from, to, except, empty }');
    if (Array.isArray(game.hints)) {
      const keys = game.hints.map(hintKey);
      game.hints.forEach((h, i) => {
        if (h.guest !== undefined && !charById[h.guest]) warn(`hints[${i}] is about unknown guest "${h.guest}"`);
        if (h.wish !== undefined && !wishById[h.wish]) warn(`hints[${i}] is about unknown wish "${h.wish}"`);
        if (h.guest && h.wish) warn(`hints[${i}] has both a guest and a wish: give it one, for the way of asking it answers`);
        if (!h.question) warn(`hints[${i}] has no question`);
        if (h.via) warn(`hints[${i}] has "via", which is no longer used: a hint with a guest is shown when asked by name, one with a wish when asked by wish`);
        if (keys.indexOf(keys[i]) !== i) warn(`hints[${i}] has the same id as an earlier hint: "${keys[i]}"`);
        [].concat(h.needs || []).forEach(n => {
          const m = String(n).replace(/^!/, '').match(/^(?:(paper|flag|skill|confirmed|hint):(.+)|([^@]+)(?:@(\d{1,2}))?)$/);
          if (!m || (m[3] !== undefined && normPlace(m[3]) === null)) warn(`hints[${i}] has a need it can't read: "${n}"`);
          else if (m[1] === 'hint' && (!keys.includes(m[2]) || m[2] === keys[i])) warn(`hints[${i}] needs a hint that isn't in the list (or itself): "${n}"`);
        });
      });
    }
    memory.except.forEach(p => { if (p === null) warn('memory.except lists something that is neither a place id nor a room number'); });
    papers().forEach(p => {
      if (!p.id) warn('paper without id', p);
      else if (p.text === undefined && p.id !== 'names' && p.id !== 'wishes') warn(`paper "${p.id}" has no text`);
    });
    if (game.intro) warn('"intro" is no longer shown: the game opens with the home screen and then the "prologue"');
    (game.prologue || []).forEach((st, i) => {
      if (st.give && !papers().some(p => p.id === st.give)) warn(`prologue[${i}] gives unknown paper "${st.give}"`);
      if (st.read && !papers().some(p => p.id === st.read)) warn(`prologue[${i}] reads unknown paper "${st.read}"`);
      if (st.ask !== undefined && st.ask !== 'name') warn(`prologue[${i}] asks for "${st.ask}", but only ask: 'name' is supported`);
    });
    game.characters.forEach(c => {
      if (typeof c.name === 'function') warn(`character "${c.id}" needs a plain name, so the player can type it`);
      if (!c.player && !c.name) warn(`character "${c.id}" has no name`);
    });
    if (game.characters.filter(c => c.player).length > 1) warn('only one character can be the player (player: true)');
    Object.entries(game.dialogues || {}).forEach(([id, d]) => {
      if (typeof d.start === 'string' && !d.nodes[d.start]) warn(`dialogue "${id}" start node "${d.start}" missing`);
      Object.entries(d.nodes).forEach(([nid, node]) => {
        const nexts = [node.next].concat((node.choices || []).map(c => c.next));
        nexts.forEach(nx => { if (typeof nx === 'string' && !d.nodes[nx]) warn(`dialogue "${id}" node "${nid}" -> missing "${nx}"`); });
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Room resolution
  // ---------------------------------------------------------------------------
  function matches(rule, room, s) {
    const one = m => {
      if (placeById[room]) return m === room; // places match only by their id
      if (typeof m === 'function') return !!m(BigInt(room), s);
      if (typeof m === 'string' && m[0] === '@') return charById[m.slice(1)] && normRoom(charById[m.slice(1)].room) === room;
      if (m && typeof m === 'object' && !Array.isArray(m)) {
        const n = BigInt(room);
        if (m.from !== undefined && n < BigInt(m.from)) return false;
        if (m.to !== undefined && n > BigInt(m.to)) return false;
        return true;
      }
      return normRoom(m) === room;
    };
    if (rule.match === undefined) return false;
    const ok = Array.isArray(rule.match) ? rule.match.some(one) : one(rule.match);
    return ok && (!rule.when || !!rule.when(s));
  }

  function rulesFor(room, s) {
    const out = [];
    for (const rule of game.rooms || []) {
      if (matches(rule, room, s)) {
        out.push(rule);
        if (rule.final) break;
      }
    }
    return out;
  }

  // What a room shows. In the present, its matching rules. In the past, the
  // scenes each matching rule lists for that hour, rule by rule.
  function piecesFor(room, s, at = state.at) {
    const rules = rulesFor(room, s);
    if (at === null) return rules;
    return rules.flatMap(r => hourKeys(r.scenes || {}, at)
      .flatMap(k => [].concat(r.scenes[k]).map(asScene))
      .filter(sc => !sc.when || sc.when(s)));
  }

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  // `when` (optional) is an hour of yesterday; leave it empty for the present.
  // Rooms the Memory Device doesn't work in always open in the present.
  // Without `ride`, the player walks and can only reach places on the current floor.
  // `ride` lets the player cross floors. An elevator passes { car, to } so the
  // next room opens with what happened inside the car.
  function goTo(input, when, ride) {
    const room = normPlace(input);
    const err = $('#go-error');
    // Room 0, negative numbers and anything else that isn't a positive integer.
    if (room === null || room === '0') { err.textContent = ui.invalid; return; }
    if (!ride && state.room && floorOf(room) !== floorOf(state.room)) {
      err.textContent = ui.otherFloor(roomLabel(room));
      return;
    }
    let at = null;
    if (when !== undefined && when !== null && String(when).trim() !== '' && remembers(room)) {
      at = normHour(when);
      if (at === null || !inMemory(at)) { err.textContent = ui.badTime(memory.from, memory.to); return; }
    }
    err.textContent = '';
    lastRide = typeof ride === 'object' ? ride : null;
    state.room = room;
    state.at = at;
    const key = viewKey(room, at);
    state.visits[key] = (state.visits[key] || 0) + 1;
    state.history = [key].concat(state.history.filter(r => r !== key)).slice(0, 8);
    const s = ctx();
    piecesFor(room, s).forEach(p => { if (p.onEnter) p.onEnter(s); });
    renderRoom(true);
    save();
  }

  function renderRoom(animate) {
    const room = state.room;
    if (!room) return;
    const s = ctx();
    const pieces = piecesFor(room, s);
    const view = $('#room-body');
    view.innerHTML = '';
    // A new room (or hour) starts at the top; redrawing in place keeps the scroll.
    if (animate) view.scrollTop = 0;
    view.classList.toggle('animate', !!animate);
    staggerIndex = 0;

    // Room titles come from the room's rules, in the present and the past alike.
    const titled = rulesFor(room, s).find(r => r.title);
    $('#room-number').textContent = roomLabel(room);
    $('#room-floor').textContent = floorLabel(floorOf(room), s);
    $('#room-name').textContent = titled ? L(titled.title, s) : '';
    $('#room-time').textContent = s.past ? ui.pastTitle(ui.span(state.at)) : '';
    document.body.classList.toggle('past', s.past);

    if (lastRide) {
      const ride = el('div', 'lift-ride', renderRide(lastRide, s));
      view.appendChild(ride);
      stagger(ride);
    }

    if (s.past) renderScenes(pieces, view, s);
    else {
      let html = pieces.filter(r => r.text).map(r => renderMarkup(L(r.text, s), s)).join('');
      if (!html && !s.place && game.emptyRoom) html = renderMarkup(L(game.emptyRoom(s), s), s);
      const textBlock = el('div', 'room-text', html);
      view.appendChild(textBlock);
      stagger(textBlock);
      const dlgRule = pieces.find(r => r.dialogue);
      if (dlgRule) startDialogue(dlgRule.dialogue, view, s);
    }

    // The elevators only run in the present, not in a scene from the Memory Device.
    $('#lift-button').hidden = !atElevators(room);
    $('#lift-button').disabled = s.past;
    $('#lift-button').title = s.past ? ui.liftPast : '';
    renderRecent();
    renderNav();
    renderMemory();
    $('#go-input').value = '';
  }

  // In the past, each scene is its own block: an optional heading, its text,
  // then its dialogue. An hour with no scenes shows memory.empty.
  function renderScenes(scenes, view, s) {
    if (!scenes.some(sc => sc.text || sc.dialogue)) {
      const empty = el('div', 'room-text', renderMarkup(L(memory.empty, s), s));
      view.appendChild(empty);
      stagger(empty);
      return;
    }
    scenes.forEach(sc => {
      const box = el('section', 'scene');
      view.appendChild(box);
      if (sc.title) {
        const h = el('h3', 'scene-title', escapeHtml(L(sc.title, s)));
        box.appendChild(h);
        stagger(h);
      }
      if (sc.text) {
        const textBlock = el('div', 'room-text', renderMarkup(L(sc.text, s), s));
        box.appendChild(textBlock);
        stagger(textBlock);
      }
      if (sc.dialogue) startDialogue(sc.dialogue, box, s);
    });
  }

  function startDialogue(dialogue, parent, s) {
    const id = typeof dialogue === 'function' ? dialogue(s) : dialogue;
    if (!id || !game.dialogues[id]) return;
    const log = el('div', 'dialogue');
    parent.appendChild(log);
    const d = game.dialogues[id];
    const start = typeof d.start === 'function' ? d.start(s) : d.start;
    if (start) showNode(id, start, log, viewKey(state.room, state.at));
  }

  // ---------------------------------------------------------------------------
  // The Memory Device: once the player has the 'memory' skill, every room but
  // memory.except shows one button per hour. The player stays in the room and
  // can come back to the present (and its conversations) at any time; walking
  // on keeps the hour, so they can follow one moment from room to room.
  // Hours with no scenes in the room are grayed out.
  // ---------------------------------------------------------------------------
  function hasScenes(room, h) {
    return piecesFor(room, ctx(h), h).some(sc => sc.text || sc.dialogue);
  }

  function renderMemory() {
    const bar = $('#memory');
    bar.hidden = !state.skills.memory || !state.room || !remembers(state.room);
    if (bar.hidden) return;
    $('#memory-label').textContent = skillName('memory');
    const hours = $('#hours');
    hours.innerHTML = '';
    for (let h = memory.from; h <= memory.to; h++) {
      const quiet = h !== state.at && !hasScenes(state.room, h);
      const b = el('button', 'hour' + (h === state.at ? ' current' : '') + (quiet ? ' quiet' : ''), escapeHtml(ui.hourShort(h)));
      b.type = 'button';
      b.disabled = quiet;
      b.title = quiet ? `${ui.span(h)} · ${ui.noScenes}` : ui.span(h);
      b.setAttribute('aria-pressed', String(h === state.at));
      b.addEventListener('click', () => goTo(state.room, h));
      hours.appendChild(b);
    }
    $('#present-button').hidden = state.at === null;
    // On a phone the hours are one row to swipe along: keep the chosen one in view.
    const cur = hours.querySelector('.current');
    if (cur) hours.scrollLeft = cur.offsetLeft - hours.offsetLeft - (hours.clientWidth - cur.offsetWidth) / 2;
  }

  // ---------------------------------------------------------------------------
  // Floors: walking within a floor, and elevators between floors
  // ---------------------------------------------------------------------------

  // On a floor of named places, show them as buttons instead of the number field.
  function renderNav() {
    const nav = $('#places');
    nav.innerHTML = '';
    if (!state.room) return;
    const f = floorOf(state.room);
    const numbered = hasNumberedRooms(f);
    (game.places || []).filter(p => (p.floor || 0) === f).forEach(p => {
      const b = el('button', 'place' + (p.id === state.room ? ' current' : ''), escapeHtml(L(p.name)));
      b.type = 'button';
      b.addEventListener('click', () => goTo(p.id, state.at));
      nav.appendChild(b);
    });
    $('#go-label').textContent = numbered ? ui.goTo : ui.walkTo;
    $('#go-row').hidden = !numbered;
  }

  function atElevators(room) {
    return !!game.elevators && [].concat(game.elevators.at || []).some(a => normPlace(a) === room);
  }

  // The player doesn't pick a car: the Use Elevator button beside the floor
  // label boards whichever car `board` chooses and rides straight to the
  // floor `to` gives.
  let lastRide = null;
  function rideElevator() {
    const cfg = game.elevators;
    const s = ctx();
    if (s.past) return;
    const car = cfg.board ? cfg.board(s) : Math.floor(Math.random() * (cfg.cars || [{}, {}, {}]).length);
    const to = cfg.to ? cfg.to(s) : (s.floor === 0 ? 1 : 0);
    goTo(cfg.landing(to, s), state.at, { car, to });
  }

  // What the player saw inside the car, shown above the room they arrive in.
  function renderRide(ride, s) {
    const cfg = game.elevators;
    const name = L(((cfg.cars || [])[ride.car] || {}).name, s) || ui.liftName(ride.car + 1);
    return renderMarkup(ui.liftEntered(name), s) + (cfg.inside ? renderMarkup(L(cfg.inside(s, ride.to), s), s) : '');
  }

  // Give paragraphs an increasing animation delay so they fade in one by one.
  let staggerIndex = 0;
  function stagger(...elements) {
    if (!$('#room-body').classList.contains('animate')) return;
    elements.forEach(e => {
      const parts = e.matches('.room-text') ? e.querySelectorAll('p') : [e];
      parts.forEach(p => { p.style.animationDelay = (staggerIndex++ * 0.18) + 's'; });
    });
  }

  function showNode(dlgId, nodeId, log, view) {
    if (viewKey(state.room, state.at) !== view) return; // player moved on
    const d = game.dialogues[dlgId];
    const node = d.nodes[nodeId];
    if (!node) return;
    const s = ctx();
    if (node.do) node.do(s);

    const added = [];
    const text = L(node.text, s);
    // With `byLine` (on the dialogue, or on a node to override it), the
    // node's paragraphs appear one at a time, each after a click.
    const byLine = node.byLine !== undefined ? !!node.byLine : !!d.byLine;
    const paras = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    let speech = null;
    if (paras.length) {
      const line = el('div', 'line');
      const speaker = L(node.speaker !== undefined ? node.speaker : d.speaker, s);
      if (speaker) line.appendChild(el('div', 'speaker', escapeHtml(speaker)));
      speech = el('div', 'speech', renderMarkup(byLine ? paras[0] : text, s));
      line.appendChild(speech);
      log.appendChild(line);
      added.push(line);
    }

    if (byLine && paras.length > 1) {
      let shown = 1;
      const more = el('div', 'choices');
      const b = el('button', 'choice more', escapeHtml(ui.continue));
      b.type = 'button';
      b.addEventListener('click', () => {
        speech.insertAdjacentHTML('beforeend', renderMarkup(paras[shown++], s));
        speech.lastElementChild.classList.add('reveal');
        staggerIndex = 0;
        if (shown === paras.length) { more.remove(); finish([]); }
        else log.appendChild(more); // keep the button below the newest line
        speech.lastElementChild.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      });
      more.appendChild(b);
      log.appendChild(more);
      added.push(more);
      stagger(...added);
      return;
    }
    finish(added);

    // The choices, Continue, or end mark that follow the node's text.
    function finish(added) {
      const box = el('div', 'choices');
      let choices = (node.choices || [])
        .map((c, i) => ({ c, key: `${dlgId}/${nodeId}/${i}` }))
        .filter(({ c, key }) => (!c.when || c.when(s)) && !(c.once && state.taken[key]));
      // Choices open up in order: only the first one not yet picked is shown
      // (with every one already picked), so the conversation reads as written.
      // Turn this off with `inOrder: false` on the dialogue or the node; on a
      // choice, it is always shown and never holds back the ones after it.
      const inOrder = node.inOrder !== undefined ? !!node.inOrder : d.inOrder !== false;
      if (inOrder) {
        const free = ({ c }) => c.inOrder === false;
        const unread = choices.findIndex(ch => !free(ch) && !state.taken[ch.key]);
        choices = choices.filter((ch, i) => free(ch) || unread < 0 || i <= unread || state.taken[ch.key]);
      }

      const advance = (label, next, effect, key, isChoice) => {
        const b = el('button', key && state.taken[key] ? 'choice taken' : 'choice', escapeHtml(label));
        b.addEventListener('click', () => {
          box.remove();
          staggerIndex = 0;
          if (isChoice) log.appendChild(el('div', 'line player', renderMarkup('— ' + label, s)));
          if (key) state.taken[key] = true;
          if (effect) effect(ctx());
          const nx = typeof next === 'function' ? next(ctx()) : next;
          if (nx) showNode(dlgId, nx, log, view);
          else log.appendChild(el('div', 'line end', '<span>◆</span>'));
          renderNotebook();
          save();
          log.lastElementChild && log.lastElementChild.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        });
        box.appendChild(b);
      };

      if (choices.length) {
        choices.forEach(({ c, key }) => advance(L(c.text, s), c.next, c.do, key, true));
      } else if (node.next) {
        const nx = typeof node.next === 'function' ? node.next(s) : node.next;
        // A next node that is only a menu (no text) is shown straight away.
        if (d.nodes[nx] && !L(d.nodes[nx].text, s)) {
          stagger(...added);
          return showNode(dlgId, nx, log, view);
        }
        advance(ui.continue, nx, null, null, false);
      } else {
        const end = el('div', 'line end', '<span>◆</span>');
        log.appendChild(end);
        added.push(end);
      }
      if (box.children.length) { log.appendChild(box); added.push(box); }
      stagger(...added);
      renderNotebook();
      save();
    }
  }

  function renderRecent() {
    const wrap = $('#recent');
    wrap.innerHTML = '';
    if (!state.history.length) return;
    wrap.appendChild(el('span', 'recent-label', escapeHtml(ui.recent)));
    const here = viewKey(state.room, state.at);
    const floor = floorOf(state.room);
    state.history.forEach(key => {
      const [r, at] = key.split('@');
      const name = placeById[r] ? L(placeById[r].name) : r;
      const when = at === undefined ? '' : ' · ' + ui.hour(+at);
      const b = el('button', 'recent-room' + (when ? ' past' : '') + (key === here ? ' current' : ''), escapeHtml(name + when));
      b.title = roomLabel(r) + when;
      // Rooms on other floors are only reachable by elevator.
      b.disabled = floorOf(r) !== floor;
      b.addEventListener('click', () => goTo(r, at));
      wrap.appendChild(b);
    });
  }

  // ---------------------------------------------------------------------------
  // Skills: abilities the player learns through the story, via s.learn(id)
  // ---------------------------------------------------------------------------
  // A skill with `item: true` (like the Memory Device) is announced as
  // something obtained rather than learned, and kept in the Inventory with its
  // text; any other skill's text goes in the Notes.
  function learn(id) {
    if (state.skills[id]) return;
    state.skills[id] = true;
    const skill = (game.skills || {})[id] || {};
    const name = skillName(id);
    toast(skill.item ? ui.obtained(name) : ui.learned(name));
    chime();
    if (skill.item) { ping('inventory'); renderInventory(); }
    else if (skill.text) addNote(skill.text, 'skill:' + id);
    renderMemory();
    renderDebug();
  }

  function skillName(id) {
    return L(((game.skills || {})[id] || {}).name) || (id === 'memory' ? ui.memory : id);
  }

  // ---------------------------------------------------------------------------
  // Notebook: the inventory, the deduction register, notes, and hints
  // ---------------------------------------------------------------------------
  const newUid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  function addNote(text, id) {
    if (id && state.notes.some(n => n.id === id)) return;
    state.notes.push({ id: id || null, text, page: state.notePage });
    ping('notes');
  }

  function ping(tabName) {
    const tab = $('#tab-' + tabName);
    if (tab && !tab.classList.contains('active')) tab.classList.add('ping');
  }

  // Papers the player carries. 'names' and 'wishes' list the guests and the
  // wishes (alphabetically) unless given their own text.
  function papers() {
    return game.papers || [{ id: 'names' }, { id: 'wishes' }];
  }

  function startPapers() {
    const held = {};
    papers().forEach(p => { if (p.start !== false) held[p.id] = true; });
    return held;
  }

  function paperTitle(p) {
    return L(p.title) || (p.id === 'names' ? ui.namesList : p.id === 'wishes' ? ui.wishesList : p.id);
  }

  function paperText(p, s) {
    if (p.text !== undefined) return L(p.text, s);
    // The player doesn't know they are a guest, so they aren't on the list.
    const list = p.id === 'names' ? game.characters.filter(c => !c.player).map(c => s.markGuest(c.id, c.name))
      : p.id === 'wishes' ? wishOrder.map(w => s.markWish(w.id, w)) : [];
    return list.map(x => `• ${x}`).join('\n');
  }

  // Where the register stands on each guest and wish, for the papers and the
  // register's reminders. It only reflects what the player wrote: whether an
  // unconfirmed row is right is never shown.
  function isLocked(i) {
    const g = state.entries[i];
    return !!(g && g.cid && charById[g.cid]);
  }

  // Confirmed rows are shown first; the rest keep their order below them.
  // Rows are numbered by where they appear, not where they're stored.
  function registerOrder() {
    return [...Array(game.characters.length).keys()].sort((a, b) => isLocked(b) - isLocked(a) || a - b);
  }

  // The unconfirmed rows (by their shown number) each guest and wish is written on.
  function registerUse() {
    const guests = {}, wishes = {};
    const add = (map, id, row) => (map[id] = map[id] || []).push(row);
    registerOrder().forEach((i, pos) => {
      const e = state.entries[i];
      if (!e || isLocked(i)) return;
      charsForName(e.name).forEach(c => add(guests, c.id, pos + 1));
      if (e.wish) add(wishes, e.wish, pos + 1);
    });
    return { guests, wishes };
  }

  function confirmedWishes() {
    return new Set(Object.keys(state.confirmed).map(id => charById[id] && charById[id].wish));
  }

  // A line of the Guest List or the List of Wishes: struck through once
  // confirmed, otherwise followed by the rows it's written on.
  function markLine(text, confirmed, rows) {
    if (confirmed) return `~~${text}~~`;
    return rows && rows.length ? `${text} — ${rows.map(ui.rowRef).join(', ')}` : text;
  }

  // A line of the List of Wishes: struck through once confirmed, grayed out
  // once written on any row.
  function markWishLine(text, confirmed, rows) {
    if (confirmed) return `~~${text}~~`;
    return rows && rows.length ? `%%${text}%%` : text;
  }

  // Hand the player a paper with { start: false } during the story.
  function give(id) {
    const p = papers().find(p => p.id === id);
    if (!p || state.papers[id]) return;
    state.papers[id] = true;
    toast(ui.gotPaper(paperTitle(p)));
    ping('inventory');
    renderInventory();
    renderDebug();
  }

  // The Inventory lists what the player carries: papers, then items (skills
  // with `item: true`). Picking one shows what it says.
  let openItem = null; // key of the item being read, or null for the list

  function inventory(s) {
    const items = papers().filter(p => state.papers[p.id])
      .map(p => ({ key: 'paper:' + p.id, title: paperTitle(p), text: () => paperText(p, s) }));
    Object.entries(game.skills || {}).forEach(([id, sk]) => {
      if (sk.item && state.skills[id]) items.push({ key: 'skill:' + id, title: skillName(id), text: () => L(sk.text, s) });
    });
    return items;
  }

  function renderInventory() {
    const panel = $('#inventory');
    const s = ctx();
    const items = inventory(s);
    const open = items.find(it => it.key === openItem);
    const button = (cls, label, onClick) => {
      const b = el('button', cls, escapeHtml(label));
      b.type = 'button';
      b.addEventListener('click', onClick);
      return b;
    };
    panel.innerHTML = '';
    if (open) {
      panel.appendChild(button('inv-back', ui.inventoryBack, () => { openItem = null; renderInventory(); }));
      const box = el('section', 'paper');
      box.appendChild(el('h3', 'paper-title', escapeHtml(open.title)));
      box.appendChild(el('div', 'paper-text', renderMarkup(open.text(), s)));
      panel.appendChild(box);
      return;
    }
    if (!items.length) { panel.appendChild(el('p', 'muted', escapeHtml(ui.noItems))); return; }
    const list = el('ul', 'inv-list');
    items.forEach(it => {
      const li = el('li');
      li.appendChild(button('inv-item', it.title, () => { openItem = it.key; renderInventory(); panel.scrollTop = 0; }));
      list.appendChild(li);
    });
    panel.appendChild(list);
  }

  // Notes the player writes or clips: { text } or { quote, from, at, text }.
  function addPlayerNote(fields) {
    state.notes.push(Object.assign({ id: null, uid: newUid(), user: true, text: '', page: state.notePage }, fields));
    ping('notes');
    save();
    renderNotes();
  }

  let editing = null;    // uid of the player note being edited
  let editDraft = '';
  let focusEdit = false; // focus the edit box on its next render
  let notesShown = '';   // what the notes list last rendered, to avoid needless rebuilds

  // Notes are kept on pages the player adds, names and deletes. New notes,
  // the hotel's included, go on the page that is open.
  function currentPage() {
    return state.notePages.find(p => p.uid === state.notePage) || state.notePages[0];
  }

  function pageTitle(p) {
    return p.title.trim() || ui.pageTitle(state.notePages.indexOf(p) + 1);
  }

  function openPage(uid) {
    state.notePage = uid;
    editing = null;
    save();
    renderNotes();
  }

  function renderPages() {
    const bar = $('#note-pages');
    bar.innerHTML = '';
    state.notePages.forEach(p => {
      const b = el('button', 'note-page' + (p.uid === state.notePage ? ' current' : ''));
      b.type = 'button';
      b.textContent = pageTitle(p);
      b.title = pageTitle(p);
      b.setAttribute('aria-pressed', String(p.uid === state.notePage));
      b.addEventListener('click', () => openPage(p.uid));
      bar.appendChild(b);
    });
    const add = el('button', 'note-page add', escapeHtml(ui.newPage));
    add.type = 'button';
    add.addEventListener('click', () => {
      const p = { uid: newUid(), title: '' };
      state.notePages.push(p);
      openPage(p.uid);
      $('#note-page-title').focus();
    });
    bar.appendChild(add);
    const page = currentPage();
    const title = $('#note-page-title');
    if (document.activeElement !== title) title.value = page.title;
    title.placeholder = ui.pageTitle(state.notePages.indexOf(page) + 1);
    $('#note-page-delete').disabled = state.notePages.length < 2;
  }

  // Deleting a page deletes the player's notes on it. The hotel's own notes
  // can't be lost, so they move to the page before it.
  function deletePage() {
    if (state.notePages.length < 2 || !confirm(ui.deletePageConfirm)) return;
    const i = state.notePages.indexOf(currentPage());
    const gone = state.notePages.splice(i, 1)[0].uid;
    const to = state.notePages[Math.max(0, i - 1)].uid;
    state.notes = state.notes.filter(n => n.page !== gone || !n.user);
    state.notes.forEach(n => { if (n.page === gone) n.page = to; });
    openPage(to);
  }

  function renderNotes() {
    const list = $('#notes-list');
    const shown = JSON.stringify([state.lang, editing, state.notes, state.notePage, state.notePages]);
    if (shown === notesShown) return;
    notesShown = shown;
    renderPages();
    const refocus = focusEdit || (document.activeElement && document.activeElement.classList.contains('note-edit'));
    focusEdit = false;
    list.innerHTML = '';
    const onPage = state.notes.filter(n => n.page === state.notePage);
    if (!onPage.length) list.appendChild(el('p', 'muted', escapeHtml(ui.noNotes)));
    const text = (cls, str) => { const e = el('div', cls); e.textContent = str; return e; };
    const button = (label, onClick) => { const b = el('button', '', escapeHtml(label)); b.type = 'button'; b.addEventListener('click', onClick); return b; };
    // Newest first, so fresh notes appear right under the box for writing them.
    onPage.slice().reverse().forEach(n => {
      if (!n.user) { list.appendChild(el('div', 'note', renderMarkup(L(n.text), ctx()))); return; }
      const box = el('div', 'note mine');
      if (n.quote) {
        box.appendChild(text('note-quote', n.quote));
        // Clips from older saves carry their time as a string.
        const at = n.at === null || n.at === undefined ? '' : ' · ' + (typeof n.at === 'number' ? ui.hour(n.at) : n.at);
        box.appendChild(text('note-from', roomLabel(n.from) + at));
      }
      const actions = el('div', 'note-actions');
      if (editing === n.uid) {
        const area = el('textarea', 'note-edit');
        area.rows = 3;
        area.value = editDraft;
        area.placeholder = ui.notePlaceholder;
        const commit = () => {
          editing = null;
          if (!editDraft.trim() && !n.quote) state.notes.splice(state.notes.indexOf(n), 1);
          else n.text = editDraft.trim();
          save();
          renderNotes();
        };
        const cancel = () => { editing = null; renderNotes(); };
        area.addEventListener('input', () => { editDraft = area.value; });
        area.addEventListener('keydown', e => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); commit(); }
          if (e.key === 'Escape') { e.stopPropagation(); cancel(); }
        });
        box.appendChild(area);
        actions.appendChild(button(ui.cancel, cancel));
        actions.appendChild(button(ui.save, commit));
        if (refocus) setTimeout(() => { area.focus(); area.setSelectionRange(area.value.length, area.value.length); });
      } else {
        if (n.text) box.appendChild(text('note-text', n.text));
        actions.appendChild(button(ui.edit, () => { editing = n.uid; editDraft = n.text || ''; focusEdit = true; renderNotes(); }));
        actions.appendChild(button(ui.delete, () => {
          if (!confirm(ui.deleteConfirm)) return;
          state.notes.splice(state.notes.indexOf(n), 1);
          save();
          renderNotes();
        }));
      }
      box.appendChild(actions);
      list.appendChild(box);
    });
  }

  // Selecting text in the room shows a button that clips it into the notebook.
  function initClipping() {
    const btn = $('#clip');
    let clip = null;
    const place = () => {
      const sel = window.getSelection();
      const body = $('#room-body');
      const quote = sel && !sel.isCollapsed ? sel.toString().replace(/[ \t]*\n\s*\n\s*/g, '\n\n').trim() : '';
      if (!quote || !body.contains(sel.anchorNode) || !body.contains(sel.focusNode) || !$('#modal').hidden) {
        btn.hidden = true;
        clip = null;
        return;
      }
      clip = { quote, from: state.room, at: state.at };
      const r = sel.getRangeAt(sel.rangeCount - 1).getBoundingClientRect();
      btn.hidden = false;
      // Below the selection, where it won't cover the browser's own selection menu.
      const top = r.bottom + 8 + btn.offsetHeight > window.innerHeight ? r.top - btn.offsetHeight - 8 : r.bottom + 8;
      const left = Math.min(Math.max(8, r.left + r.width / 2 - btn.offsetWidth / 2), window.innerWidth - btn.offsetWidth - 8);
      btn.style.top = Math.max(8, top) + 'px';
      btn.style.left = left + 'px';
    };
    let timer = null;
    document.addEventListener('selectionchange', () => { clearTimeout(timer); timer = setTimeout(place, 150); });
    $('#room-body').addEventListener('scroll', place);
    window.addEventListener('resize', place);
    btn.addEventListener('mousedown', e => e.preventDefault()); // keep the selection
    btn.addEventListener('click', () => {
      if (!clip) return;
      addPlayerNote(clip);
      window.getSelection().removeAllRanges();
      btn.hidden = true;
      toast(ui.clipped);
    });
  }

  // The guest a register row correctly describes, or null.
  function correctGuest(e) {
    if (!e) return null;
    return charsForName(e.name).find(c => e.wish === c.wish && roomMatches(e.room, c.room)) || null;
  }

  // Obra Dinn rule: correct-but-unconfirmed deductions are locked in only
  // once there are at least `confirmBatch` of them, in groups of that size.
  // A guest written on two rows counts once.
  function checkDeductions() {
    const batch = game.confirmBatch || 3;
    const pending = [];
    state.entries.forEach(e => {
      const c = e && !e.cid && correctGuest(e);
      if (c && !state.confirmed[c.id] && !pending.some(p => p.c === c)) pending.push({ e, c });
    });
    const k = Math.floor(pending.length / batch) * batch;
    if (!k) return;
    pending.slice(0, k).forEach(({ e, c }) => { state.confirmed[c.id] = true; e.cid = c.id; });
    toast(ui.confirmToast(k));
    chime();
    // `onConfirm(s)` lets the story react, e.g. hand over a paper after 9.
    if (game.onConfirm) game.onConfirm(ctx());
    renderNotebook();
    // Room text that depends on confirmations updates on the next visit, so
    // a conversation in progress is not interrupted.
    save();
    if (Object.keys(state.confirmed).length === game.characters.length && !state.ended) {
      state.ended = true;
      save();
      renderNotebook();
      const buttons = hasFates() ? [{ label: ui.fates, primary: true, action: showFates }, { label: ui.close }] : [{ label: ui.close }];
      setTimeout(() => showModal(L(game.ending), buttons), 1400);
    }
  }

  // ---------------------------------------------------------------------------
  // Fates: once the game is cleared, a screen tells what became of each guest
  // (each character's `fate`). The top bar keeps a button for it.
  // ---------------------------------------------------------------------------
  function hasFates() {
    return game.characters.some(c => c.fate);
  }

  // A grid of cards, one per guest, sorted by name or by room. Each fate is
  // hidden until the player opens it, so they can read them one at a time.
  let fatesSort = 'name';        // 'name' or 'room'
  const fatesOpen = new Set();   // ids of the guests whose fate is showing

  function showFates(keepScroll) {
    const s = ctx();
    const scroll = keepScroll === true ? $('#screen-body').scrollTop : 0;
    showScreen('fates');
    $('#screen-title').textContent = L((game.fates || {}).title, s) || ui.fatesTitle;
    const body = $('#screen-body');
    const intro = L((game.fates || {}).intro, s);
    if (intro) body.appendChild(el('div', 'fates-intro', renderMarkup(intro, s)));

    const list = game.characters.filter(c => c.fate);
    const allOpen = () => list.every(c => fatesOpen.has(c.id));

    // Sorting on the left, Show all / Hide all on the right.
    const bar = el('div', 'fates-bar');
    const sort = el('div', 'fates-sort');
    sort.appendChild(el('span', 'fates-label', escapeHtml(ui.fatesSort)));
    [['name', ui.fatesByName], ['room', ui.fatesByRoom]].forEach(([key, label]) => {
      const b = el('button', 'fates-sort-btn' + (fatesSort === key ? ' current' : ''), escapeHtml(label));
      b.type = 'button';
      b.setAttribute('aria-pressed', String(fatesSort === key));
      b.addEventListener('click', () => { fatesSort = key; showFates(true); });
      sort.appendChild(b);
    });
    bar.appendChild(sort);
    const all = el('button', 'fates-all', escapeHtml(allOpen() ? ui.fatesHideAll : ui.fatesShowAll));
    all.type = 'button';
    all.addEventListener('click', () => {
      const open = !allOpen();
      list.forEach(c => (open ? fatesOpen.add(c.id) : fatesOpen.delete(c.id)));
      showFates(true);
    });
    bar.appendChild(all);
    body.appendChild(bar);

    // A guest's optional `kana` (the reading of a Japanese name) sorts it in Japanese.
    const sortName = c => (state.lang === 'ja' && c.kana) || charName(c);
    const byName = (a, b) => sortName(a).localeCompare(sortName(b), state.lang);
    const byRoom = (a, b) => {
      const x = BigInt(normRoom(a.room)), y = BigInt(normRoom(b.room));
      return x < y ? -1 : x > y ? 1 : 0;
    };
    const grid = el('div', 'fate-grid');
    list.slice().sort(fatesSort === 'room' ? byRoom : byName).forEach(c => {
      const open = fatesOpen.has(c.id);
      const card = el('section', 'fate-card' + (open ? ' open' : ''));
      const roomText = c.roomLabel ? L(c.roomLabel) : ui.roomTitle(normRoom(c.room));
      card.appendChild(el('div', 'fate-room', escapeHtml(roomText)));
      card.appendChild(el('h3', 'fate-name', escapeHtml(charName(c))));
      card.appendChild(el('div', 'fate-wish', escapeHtml(L(wishById[c.wish]))));
      const text = el('div', 'fate-text', renderMarkup(L(c.fate, s), s));
      text.hidden = !open;
      const toggle = el('button', 'fate-toggle', escapeHtml(open ? ui.fateHide : ui.fateShow));
      toggle.type = 'button';
      toggle.setAttribute('aria-expanded', String(open));
      toggle.addEventListener('click', () => {
        const now = !fatesOpen.has(c.id);
        if (now) fatesOpen.add(c.id); else fatesOpen.delete(c.id);
        text.hidden = !now;
        card.classList.toggle('open', now);
        toggle.textContent = now ? ui.fateHide : ui.fateShow;
        toggle.setAttribute('aria-expanded', String(now));
        all.textContent = allOpen() ? ui.fatesHideAll : ui.fatesShowAll;
      });
      card.appendChild(toggle);
      card.appendChild(text);
      grid.appendChild(card);
    });
    body.appendChild(grid);
    screenButton(ui.back, true, () => { $('#screen').hidden = true; });
    body.scrollTop = scroll;
  }

  // Above the register: the names on the Guest List and the wishes that no
  // row mentions yet, folded away (with no counts: the Guest List is one name
  // short of the wishes, which the player shouldn't be told). Near the end,
  // when the last few guests are found by elimination, this is what's left.
  let leftoverOpen = false;

  function fillLeftover(box) {
    const use = registerUse();
    const taken = confirmedWishes();
    const sortName = c => (state.lang === 'ja' && c.kana) || charName(c);
    const names = game.characters.filter(c => !c.player && !state.confirmed[c.id] && !use.guests[c.id])
      .sort((a, b) => sortName(a).localeCompare(sortName(b), state.lang));
    const wishes = wishOrder.filter(w => !taken.has(w.id) && !use.wishes[w.id]);
    box.innerHTML = '';
    if (!names.length && !wishes.length) {
      box.appendChild(el('summary', null, escapeHtml(ui.leftoverNone)));
      box.classList.add('empty');
      return;
    }
    box.classList.remove('empty');
    box.appendChild(el('summary', null, escapeHtml(ui.leftover)));
    const cols = el('div', 'reg-left-cols');
    [[ui.leftoverNames, names.map(charName)], [ui.leftoverWishes, wishes.map(w => L(w))]].forEach(([title, items]) => {
      const col = el('div');
      col.appendChild(el('h4', null, escapeHtml(title)));
      col.appendChild(el('ul', null, items.map(x => `<li>${escapeHtml(x)}</li>`).join('')));
      cols.appendChild(col);
    });
    box.appendChild(cols);
  }

  // ---------------------------------------------------------------------------
  // Elimination grid: a page of the notebook for working out who made which
  // wish. Wishes run down the side, the guests on the Guest List across the
  // top. The player marks squares ✗, ? or ✓; the grid fills in only what
  // follows from one wish per guest (the rest of a ✓'s row and column, and
  // everything crossed by a confirmed guest). It never looks at the answers
  // of unconfirmed guests. The player isn't on the Guest List, so one wish
  // row ends up crossed out all the way along.
  //
  // With `grid: { hours: c => [...], label: h => text, when: s => … }`, the
  // guests are grouped by those hours (the Check-in List's, in the sample),
  // and each wish can be tagged with one of them: guests without that hour
  // are then crossed out of its row. Tagged wishes are listed first, by hour,
  // so each hour's wishes line up with its guests. `grid.tag: c => text`
  // adds a note after each guest's name (their gender, in the sample).
  // ---------------------------------------------------------------------------
  let gridConfirmed = false; // show the confirmed guests and their wishes too
  const GRID_NEXT = { '': 'x', x: '?', '?': 'v', v: '' };
  const GRID_MARK = { x: '✗', '?': '?', v: '✓' };

  // The grid's hours, or null when the game has none (or not yet).
  function gridTimes() {
    const cfg = game.grid;
    if (!cfg || typeof cfg.hours !== 'function' || (cfg.when && !cfg.when(ctx()))) return null;
    const of = c => [].concat(cfg.hours(c) ?? []).map(Number).filter(h => Number.isInteger(h)).sort((a, b) => a - b);
    const all = [...new Set(game.characters.filter(c => !c.player).flatMap(of))].sort((a, b) => a - b);
    const label = h => L(cfg.label ? cfg.label(h) : ui.hour(h));
    return { of, all, label };
  }

  function showGrid() {
    showScreen('grid');
    $('#screen-title').textContent = ui.gridTitle;
    const body = $('#screen-body');
    const times = gridTimes();
    // Everything above the grid fits on one line, to leave the grid the most
    // room: the title, How it works, the options, and Back.
    const bar = el('div', 'grid-bar');
    bar.appendChild(el('h2', 'grid-title', escapeHtml(ui.gridTitle)));
    // How it works is folded away once the player has marked something.
    const helpText = el('p', 'grid-help', escapeHtml(ui.gridIntro + (times ? ' ' + ui.gridIntroHours : '')));
    helpText.hidden = !!(Object.keys(state.grid).length || Object.keys(state.gridHours).length);
    const help = el('button', 'grid-help-button', escapeHtml(ui.gridHelp));
    help.type = 'button';
    help.setAttribute('aria-expanded', String(!helpText.hidden));
    help.addEventListener('click', () => {
      helpText.hidden = !helpText.hidden;
      help.setAttribute('aria-expanded', String(!helpText.hidden));
      fitGrid(wrap);
    });
    bar.appendChild(help);
    bar.appendChild(el('span', 'grid-spacer'));
    const toggle = el('label', 'grid-toggle');
    const box = el('input');
    box.type = 'checkbox';
    box.checked = gridConfirmed;
    box.addEventListener('change', () => { gridConfirmed = box.checked; fillGrid(wrap); });
    toggle.appendChild(box);
    toggle.appendChild(document.createTextNode(' ' + ui.gridShowConfirmed));
    bar.appendChild(toggle);
    const clear = el('button', 'grid-clear', escapeHtml(ui.gridClear));
    clear.type = 'button';
    clear.addEventListener('click', () => {
      if (!confirm(ui.gridClearConfirm)) return;
      state.grid = {};
      state.gridHours = {};
      save();
      fillGrid(wrap);
    });
    bar.appendChild(clear);
    // Width and Height: scale the columns and the rows from their fit to the
    // window (100%). Fit to window puts both back.
    const fit = el('button', 'grid-fit', escapeHtml(ui.gridFit));
    fit.type = 'button';
    // Text: scales the writing alone; the grid is fitted again around it.
    const sliders = [['w', ui.gridWidth], ['h', ui.gridHeight], ['t', ui.gridText]].map(([axis, label]) => {
      const zoom = el('label', 'grid-zoom');
      zoom.appendChild(document.createTextNode(label + ' '));
      const slider = el('input');
      slider.type = 'range';
      slider.min = axis === 't' ? 60 : 50; slider.max = 200; slider.step = 5;
      slider.value = gridZoom[axis];
      const shown = el('span', 'grid-zoom-value');
      const show = () => {
        slider.value = gridZoom[axis];
        shown.textContent = gridZoom[axis] + '%';
        fit.disabled = gridZoom.w === 100 && gridZoom.h === 100;
      };
      slider.addEventListener('input', () => {
        setGridZoom(Object.assign({}, gridZoom, { [axis]: Number(slider.value) }));
        show();
        fitGrid(wrap);
      });
      zoom.appendChild(slider);
      zoom.appendChild(shown);
      bar.appendChild(zoom);
      return show;
    });
    fit.addEventListener('click', () => {
      setGridZoom(Object.assign({}, gridZoom, { w: 100, h: 100 }));
      sliders.forEach(show => show());
      fitGrid(wrap);
    });
    sliders.forEach(show => show());
    bar.appendChild(fit);
    const back = el('button', 'primary grid-back', escapeHtml(ui.back));
    back.type = 'button';
    back.addEventListener('click', () => { $('#screen').hidden = true; });
    bar.appendChild(back);
    body.appendChild(bar);
    body.appendChild(helpText);

    const wrap = el('div', 'grid-wrap');
    body.appendChild(wrap);
    fillGrid(wrap);
    if (!gridResize) {
      gridResize = true;
      const refit = measure => {
        const w = $('#screen').hidden ? null : document.querySelector('.grid .grid-wrap');
        if (!w) return;
        if (measure) gridFit.key = '';
        fitGrid(w);
      };
      window.addEventListener('resize', () => refit(false));
      // Text measured before the web fonts arrive is the wrong size: measure again.
      if (document.fonts) document.fonts.addEventListener('loadingdone', () => refit(true));
    }
    if (document.fonts && document.fonts.status !== 'loaded') {
      document.fonts.ready.then(() => {
        gridFit.key = '';
        if (!$('#screen').hidden && wrap.isConnected) fitGrid(wrap);
      });
    }
  }

  // The grid is sized to the window. Rows get the largest height (from the
  // minimum to GRID_MAX pixels) at which the whole grid fits top to bottom,
  // then columns the largest width (up to GRID_COL_MAX) at which it fits side
  // to side, so a wide window gets wide columns rather than empty space.
  // Columns are never much narrower than rows are tall. Where even the
  // minimum doesn't fit, the grid scrolls. Fingers get bigger squares than a
  // mouse. The fit is kept while the window and the table's shape stay the
  // same, so marking a square doesn't measure again.
  //
  // The player's Width and Height sliders then scale the fitted columns and
  // rows (gridZoom, in percent, kept in this browser as a preference rather
  // than in the save; an older single number scales both).
  const GRID_MAX = 44, GRID_COL_MAX = 80;
  const gridMin = () => (window.matchMedia && matchMedia('(pointer: coarse)').matches ? 26 : 18);
  const GRID_ZOOM_KEY = 'hilbert-hotel:grid-zoom';
  let gridResize = false;
  let gridFit = { key: '', cw: 30, rh: 30 };
  let gridZoom = (() => {
    const ok = (z, min = 50) => (Number(z) >= min && Number(z) <= 200 ? Number(z) : 100);
    try {
      const raw = JSON.parse(localStorage.getItem(GRID_ZOOM_KEY));
      return typeof raw === 'number' ? { w: ok(raw), h: ok(raw), t: 100 }
        : { w: ok(raw && raw.w), h: ok(raw && raw.h), t: ok(raw && raw.t, 60) };
    } catch (e) { return { w: 100, h: 100, t: 100 }; }
  })();

  function setGridZoom(z) {
    gridZoom = z;
    try { localStorage.setItem(GRID_ZOOM_KEY, JSON.stringify(z)); } catch (e) { /* storage unavailable */ }
  }

  function fitGrid(wrap) {
    const table = wrap.querySelector('.grid-table');
    if (!table || !wrap.offsetWidth) return;
    // Inside the 1px border, whether or not scrollbars are showing now.
    const W = wrap.offsetWidth - 2, H = wrap.offsetHeight - 2;
    // The text size goes in first: it changes how much room the wishes and
    // names take, and so the fit.
    table.style.setProperty('--ts', gridZoom.t / 100);
    const key = [W, H, table.rows.length, table.rows[table.rows.length - 1].cells.length, state.lang, gridZoom.t].join(',');
    const size = (cw, rh) => {
      table.style.setProperty('--cw', cw + 'px');
      table.style.setProperty('--rh', rh + 'px');
      stickNames(table);
      return [table.offsetWidth, table.offsetHeight];
    };
    if (key !== gridFit.key) {
      const min = gridMin();
      const largest = (lo, hi, ok) => {
        let best = null;
        while (lo <= hi) {
          const mid = (lo + hi) >> 1;
          if (ok(mid)) { best = mid; lo = mid + 1; } else hi = mid - 1;
        }
        return best;
      };
      let rh = largest(min, GRID_MAX, r => size(min, r)[1] <= H) ?? min;
      const cw = largest(min, GRID_COL_MAX, c => size(c, rh)[0] <= W) ?? min;
      // Not much taller than wide: a narrow window gets shorter rows too.
      rh = Math.max(min, Math.min(rh, Math.round(cw * 1.25)));
      gridFit = { key, cw, rh };
    }
    const zw = gridZoom.w / 100, zh = gridZoom.h / 100;
    size(Math.round(gridFit.cw * zw), Math.round(gridFit.rh * zh));
  }

  // The names stick just below the row of hours, whose height follows the squares.
  function stickNames(table) {
    const rows = table.tHead ? table.tHead.rows : [];
    if (rows.length < 2) return;
    const top = rows[0].getBoundingClientRect().height + 'px';
    [...rows[1].cells].forEach(th => { th.style.top = top; });
  }

  // Rebuilds the table inside `wrap`, which keeps its scroll position.
  // `refocus` selects the control to focus afterwards.
  function fillGrid(wrap, refocus) {
    const taken = confirmedWishes();
    const times = gridTimes();
    const hoursOf = c => (times ? times.of(c) : []);
    // A wish's tag: the range of hours [from, to] the player gave it (a lone
    // hour in older saves), or null.
    const tagOf = w => {
      const t = state.gridHours[w.id];
      if (!times || t === undefined) return null;
      const [from, to] = [].concat(t).map(Number);
      return Number.isInteger(from) ? [from, Number.isInteger(to) && to >= from ? to : from] : null;
    };
    const sameTag = (a, b) => !!(a && b && a[0] === b[0] && a[1] === b[1]);
    const sortName = c => (state.lang === 'ja' && c.kana) || charName(c);
    // Guests with the same hours sit together, earliest first; no hours, last.
    const firstHour = c => (hoursOf(c).length ? hoursOf(c)[0] : Infinity);
    const group = c => hoursOf(c).join(',');
    const guests = game.characters.filter(c => !c.player && (gridConfirmed || !state.confirmed[c.id]))
      .sort((a, b) => firstHour(a) - firstHour(b) || group(a).localeCompare(group(b))
        || sortName(a).localeCompare(sortName(b), state.lang));
    // Tagged wishes first, by the start and then the end of their range.
    const tagKey = (w, k) => (tagOf(w) === null ? Infinity : tagOf(w)[k]);
    const wishes = wishOrder.filter(w => gridConfirmed || !taken.has(w.id))
      .map((w, i) => [w, i])
      .sort((a, b) => tagKey(a[0], 0) - tagKey(b[0], 0) || tagKey(a[0], 1) - tagKey(b[0], 1) || a[1] - b[1])
      .map(([w]) => w);
    wrap.innerHTML = '';
    if (!guests.length) { wrap.appendChild(el('p', 'muted', escapeHtml(ui.gridDone))); return; }

    const mark = (c, w) => state.grid[c.id + '|' + w.id] || '';
    const offHour = (c, tag) => tag !== null && !hoursOf(c).some(h => h >= tag[0] && h <= tag[1]);
    // The player's own ✓s in each row and column, to cross out the rest and
    // to flag two ✓s that can't both be right.
    const ticksByGuest = {}, ticksByWish = {};
    guests.forEach(c => wishes.forEach(w => {
      if (mark(c, w) !== 'v') return;
      ticksByGuest[c.id] = (ticksByGuest[c.id] || 0) + 1;
      ticksByWish[w.id] = (ticksByWish[w.id] || 0) + 1;
    }));
    // The first column of each group of hours gets a heavier rule.
    const starts = new Set(times ? guests.filter((c, ci) => ci === 0 || group(guests[ci - 1]) !== group(c)).map(c => c.id) : []);

    const table = el('table', 'grid-table' + (times ? ' timed' : ''));
    const thead = el('thead');
    const head = el('tr');
    const corner = el('th', 'grid-corner');
    if (times) {
      // A row of hours above the names.
      const hours = el('tr', 'grid-hours');
      corner.rowSpan = 2;
      hours.appendChild(corner);
      guests.forEach((c, ci) => {
        if (!starts.has(c.id)) return;
        let span = 1;
        while (ci + span < guests.length && !starts.has(guests[ci + span].id)) span++;
        const th = el('th', 'grid-hour grp-start', escapeHtml(hoursOf(c).map(times.label).join(', ') || ui.unknown));
        th.colSpan = span;
        hours.appendChild(th);
      });
      thead.appendChild(hours);
    } else head.appendChild(corner);
    const tagged = c => {
      const tag = game.grid && typeof game.grid.tag === 'function' ? L(game.grid.tag(c)) : '';
      return charName(c) + (tag ? (state.lang === 'ja' ? `（${tag}）` : ` (${tag})`) : '');
    };
    guests.forEach((c, ci) => {
      const th = el('th', 'grid-guest' + (state.confirmed[c.id] ? ' done' : '') + (starts.has(c.id) ? ' grp-start' : ''),
        `<span>${escapeHtml(tagged(c))}</span>`);
      th.dataset.c = ci;
      head.appendChild(th);
    });
    thead.appendChild(head);
    table.appendChild(thead);

    const tbody = el('tbody');
    wishes.forEach((w, ri) => {
      const tag = tagOf(w);
      // A rule under the last wish with each range.
      const last = tag !== null && (ri === wishes.length - 1 || !sameTag(tagOf(wishes[ri + 1]), tag));
      const tr = el('tr', last ? 'grp-end' : '');
      const th = el('th', 'grid-wish' + (taken.has(w.id) ? ' done' : ''));
      th.dataset.r = ri;
      const inner = th.appendChild(el('div', 'grid-wish-in'));
      if (times) {
        // From and to. "To" offers the hours from "from" on, and follows it
        // when "from" moves past it; a single hour is from = to.
        const range = el('span', 'grid-range');
        const pick = (end, label, hours, value, set) => {
          const sel = el('select', 'grid-tag');
          sel.dataset.w = w.id; sel.dataset.end = end;
          sel.setAttribute('aria-label', label);
          sel.appendChild(new Option(ui.unknown, ''));
          hours.forEach(h => sel.appendChild(new Option(times.label(h), h)));
          sel.value = value === null ? '' : String(value);
          sel.disabled = taken.has(w.id) || !hours.length;
          sel.addEventListener('change', () => {
            set(sel.value === '' ? null : Number(sel.value));
            save();
            fillGrid(wrap, `select[data-w="${w.id}"][data-end="${end}"]`);
          });
          range.appendChild(sel);
        };
        pick('from', ui.gridFrom(L(w)), times.all, tag && tag[0], h => {
          if (h === null) delete state.gridHours[w.id];
          else state.gridHours[w.id] = [h, tag && tag[1] >= h ? tag[1] : h];
        });
        range.appendChild(el('span', 'grid-range-dash', '–'));
        pick('to', ui.gridTo(L(w)), tag ? times.all.filter(h => h >= tag[0]) : [], tag && tag[1], h => {
          state.gridHours[w.id] = [tag[0], h === null ? tag[0] : h];
        });
        inner.appendChild(range);
      }
      inner.appendChild(el('span', null, escapeHtml(L(w))));
      tr.appendChild(th);
      guests.forEach((c, ci) => {
        const td = el('td', 'grid-cell' + (starts.has(c.id) ? ' grp-start' : ''));
        td.dataset.r = ri; td.dataset.c = ci;
        const solved = state.confirmed[c.id] && c.wish === w.id;
        const m = mark(c, w);
        let shown = m;
        if (solved) { td.classList.add('locked'); shown = 'v'; }
        else if (state.confirmed[c.id] || taken.has(w.id)) { td.classList.add('locked', 'auto'); shown = 'x'; }
        else if (!m && (ticksByGuest[c.id] || ticksByWish[w.id] || offHour(c, tag))) { td.classList.add('auto'); shown = 'x'; }
        // Two ✓s in a row or column, or a ✓ outside the wish's hour, can't be right.
        if (m === 'v' && !solved && (ticksByGuest[c.id] > 1 || ticksByWish[w.id] > 1 || offHour(c, tag))) td.classList.add('clash');
        if (shown) td.classList.add('m-' + (shown === '?' ? 'q' : shown));
        const label = ui.gridCell(charName(c), L(w));
        if (td.classList.contains('locked')) {
          td.textContent = GRID_MARK[shown];
          td.title = label;
        } else {
          const b = el('button', null, shown ? GRID_MARK[shown] : '');
          b.type = 'button';
          b.title = label;
          b.dataset.cell = c.id + '|' + w.id;
          b.setAttribute('aria-label', label + (shown ? ` — ${GRID_MARK[shown]}` : ''));
          b.addEventListener('click', () => {
            const next = GRID_NEXT[m];
            if (next) state.grid[c.id + '|' + w.id] = next;
            else delete state.grid[c.id + '|' + w.id];
            save();
            fillGrid(wrap, `button[data-cell="${c.id}|${w.id}"]`);
          });
          td.appendChild(b);
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    // Light up the row and column under the pointer or the keyboard focus.
    const light = target => {
      table.querySelectorAll('.hl').forEach(x => x.classList.remove('hl'));
      const cell = target && target.closest('td, th');
      if (!cell) return;
      if (cell.dataset.r !== undefined) table.querySelectorAll(`[data-r="${cell.dataset.r}"]`).forEach(x => x.classList.add('hl'));
      if (cell.dataset.c !== undefined) table.querySelectorAll(`[data-c="${cell.dataset.c}"]`).forEach(x => x.classList.add('hl'));
    };
    table.addEventListener('mouseover', e => light(e.target));
    table.addEventListener('focusin', e => light(e.target));
    table.addEventListener('mouseleave', () => light(null));
    wrap.appendChild(table);
    fitGrid(wrap);
    if (refocus) {
      const f = wrap.querySelector(refocus);
      if (f) f.focus();
    }
  }

  function renderNotebook() {
    const total = game.characters.length;
    const done = Object.keys(state.confirmed).length;
    $('#progress').textContent = `${ui.confirmed} ${done} / ${total}`;
    $('#nb-toggle-count').textContent = `${done}/${total}`;
    $('#fates-button').hidden = !state.ended || !hasFates();
    $('#tab-inventory').textContent = ui.inventory;
    $('#tab-register').textContent = ui.register;
    $('#tab-notes').textContent = ui.notes;
    $('#tab-hints').textContent = ui.hints;

    // Register: one row per guest, filled in any order. The player types a
    // name, picks a wish and types a room (0 for one above 999,999,999).
    const table = $('#register');
    const focused = document.activeElement && document.activeElement.dataset.row
      ? { row: document.activeElement.dataset.row, field: document.activeElement.dataset.field } : null;
    table.innerHTML = '';
    table.appendChild(el('p', 'reg-hint', escapeHtml(ui.bigRoom)));
    const gridButton = el('button', 'reg-grid-button', escapeHtml(ui.gridOpen));
    gridButton.type = 'button';
    gridButton.addEventListener('click', () => showGrid());
    table.appendChild(gridButton);
    const leftover = el('details', 'reg-left');
    leftover.open = leftoverOpen;
    leftover.addEventListener('toggle', () => { leftoverOpen = leftover.open; });
    table.appendChild(leftover);
    const head = el('div', 'reg-row reg-head');
    head.appendChild(el('span', 'reg-idx'));
    head.appendChild(el('span', 'reg-name', escapeHtml(ui.name)));
    head.appendChild(el('span', 'reg-wish', escapeHtml(ui.wish)));
    head.appendChild(el('span', 'reg-room', escapeHtml(ui.room)));
    table.appendChild(head);

    const update = (i, fields) => {
      state.entries[i] = Object.assign({}, state.entries[i], fields);
      save();
      checkDeductions();
      // The rows themselves aren't rebuilt (that would close a dropdown the
      // player is opening).
      fillLeftover(leftover);
      renderInventory();
    };
    // Wishes of confirmed guests are left out of the other rows' dropdowns:
    // each wish belongs to one guest, so they can't be anyone else's.
    const taken = confirmedWishes();

    registerOrder().forEach((i, pos) => {
      const g = state.entries[i] || {};
      const guest = g.cid ? charById[g.cid] : null;
      const locked = !!guest;
      const row = el('div', 'reg-row' + (locked ? ' locked' : ''));
      row.appendChild(el('span', 'reg-idx', locked ? `<span class="tick" aria-label="${escapeHtml(ui.confirmed)}">✓</span>` : String(pos + 1)));
      const field = (tag, cls, i, name, label) => {
        const f = el(tag, cls);
        f.dataset.row = i; f.dataset.field = name;
        f.setAttribute('aria-label', `${ui.register} ${pos + 1} — ${label}`);
        return f;
      };

      const name = field('input', 'reg-name', i, 'name', ui.name);
      name.spellcheck = false;
      name.value = locked ? charName(guest) : g.name || '';
      name.placeholder = ui.namePlaceholder;
      name.disabled = locked;
      name.addEventListener('change', () => {
        name.value = name.value.trim();
        update(i, { name: name.value || undefined });
      });
      name.addEventListener('keydown', e => { if (e.key === 'Enter') name.blur(); });
      row.appendChild(name);

      // The wish is typed, with the wishes suggested as a list, so any word of
      // one finds it. Focusing selects the wish, so typing replaces it; what's
      // left on Enter or leaving the box is taken as a whole wish, or a word of
      // exactly one wish. An empty box, or the × beside it, removes the wish.
      const cell = el('span', 'reg-wish-cell');
      const wish = field('input', 'reg-wish', i, 'wish', ui.wish);
      wish.spellcheck = false;
      wish.autocomplete = 'off';
      // A row keeps its own choice, even if that wish has since been confirmed elsewhere.
      const choices = wishOrder.filter(w => !taken.has(w.id) || w.id === g.wish);
      const list = el('datalist');
      list.id = 'reg-wishes-' + i;
      choices.forEach(w => list.appendChild(new Option(L(w))));
      wish.setAttribute('list', list.id);
      const clear = el('button', 'reg-wish-clear', '×');
      clear.type = 'button';
      clear.title = ui.wishClear;
      clear.setAttribute('aria-label', `${ui.register} ${pos + 1} — ${ui.wishClear}`);
      const wishText = id => (id && wishById[id] ? L(wishById[id]) : '');
      const norm = t => t.normalize('NFKC').toLowerCase().trim();
      const current = () => (state.entries[i] || {}).wish;
      const commit = id => {
        wish.value = wishText(id);
        clear.hidden = locked || !id;
        if ((id || undefined) !== current()) update(i, { wish: id || undefined });
      };
      // What the player typed: nothing, a whole wish, or a word of exactly one wish.
      const resolve = () => {
        const typed = norm(wish.value);
        if (!typed) return commit(undefined);
        const exact = choices.find(w => norm(L(w)) === typed);
        if (exact) return commit(exact.id);
        const found = choices.filter(w => norm(L(w)).includes(typed));
        if (found.length === 1) return commit(found[0].id);
        toast(found.length ? ui.wishMany(wish.value.trim()) : ui.wishNone(wish.value.trim()));
        commit(current());
      };
      wish.value = wishText(g.wish);
      wish.placeholder = ui.unknown;
      wish.disabled = locked;
      clear.hidden = locked || !g.wish;
      // The click that focuses the box would otherwise undo the selection.
      let selecting = false;
      wish.addEventListener('focus', () => { wish.select(); selecting = true; });
      wish.addEventListener('mouseup', e => { if (selecting) e.preventDefault(); selecting = false; });
      // Picking from the list fills in a whole wish: take it straight away.
      wish.addEventListener('input', () => {
        const typed = norm(wish.value);
        if (choices.some(w => norm(L(w)) === typed)) resolve();
      });
      wish.addEventListener('blur', resolve);
      wish.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); wish.blur(); }
        if (e.key === 'Escape') { wish.value = wishText(current()); wish.blur(); }
      });
      // Emptied and focused, so the whole list is ready for another wish.
      clear.addEventListener('mousedown', e => e.preventDefault());
      clear.addEventListener('click', () => { commit(undefined); wish.focus(); });
      cell.appendChild(wish);
      cell.appendChild(clear);
      cell.appendChild(list);
      row.appendChild(cell);

      const inp = field('input', 'reg-room', i, 'room', ui.room);
      inp.inputMode = 'numeric';
      inp.value = g.room || '';
      inp.disabled = locked;
      inp.placeholder = '?';
      inp.addEventListener('change', () => {
        inp.value = normRoom(inp.value) || '';
        update(i, { room: inp.value || undefined });
      });
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') inp.blur(); });
      row.appendChild(inp);
      table.appendChild(row);
    });
    fillLeftover(leftover);
    if (focused) {
      const f = table.querySelector(`[data-row="${focused.row}"][data-field="${focused.field}"]`);
      if (f && !f.disabled) f.focus();
    }

    renderInventory();
    renderNotes();
    renderHints();
  }

  // Hints. `hints` may be plain text, or a list of hints:
  //   { id, guest | wish, question, needs, when, text }
  // The player asks about a guest, by typing a name or picking a wish. Asking
  // by name shows the hints with that `guest`; asking by wish, the hints with
  // that `wish`. (Hints with neither are always listed, under "General".)
  // Each shows the question of every hint the player can see, in list order:
  // one whose `needs` are all met (progress, and 'hint:id' for each hint that
  // must have been shown first) and whose `when` holds. Its text stays hidden
  // behind Show hint until the player asks for it, and stays shown
  // afterwards. Once the guest a hint is about (the guest, or whoever made
  // the wish) is confirmed, it counts as seen for the hints that need it, so
  // the rest of that guest's hints open up for a look back.
  let hintQuery = null; // { via: 'name' | 'wish', value } once the player asks
  let hintVia = 'name';  // the way of asking picked in the form

  function hintKey(h, i) { return h.id || 'hint' + i; }
  let hintIndex = null; // hint key -> hint, built on first use
  function hintByKey(key) {
    if (!hintIndex) {
      hintIndex = {};
      if (Array.isArray(game.hints)) game.hints.forEach((h, i) => { hintIndex[hintKey(h, i)] = h; });
    }
    return hintIndex[key];
  }
  // The guest a hint is about, if any.
  function hintGuest(h) {
    if (h.guest) return charById[h.guest] || null;
    if (h.wish) return game.characters.find(c => c.wish === h.wish) || null;
    return null;
  }
  const hintDone = h => { const c = hintGuest(h); return !!(c && state.confirmed[c.id]); };

  // One of a hint's needs: 'room' or 'room@hour' visited (a place id or a room
  // number), 'paper:id', 'flag:key', 'skill:id', 'confirmed:charId' or
  // 'hint:id' (that hint shown, or its guest confirmed). A '!' in front means
  // the opposite.
  function hintNeed(need) {
    const not = need[0] === '!';
    const str = not ? need.slice(1) : need;
    const m = str.match(/^(paper|flag|skill|confirmed|hint):(.+)$/);
    let ok;
    if (m && m[1] === 'hint') {
      const h = hintByKey(m[2]);
      ok = !!state.hintsSeen[m[2]] || !!(h && hintDone(h));
    } else if (m) ok = !!{ paper: state.papers, flag: state.flags, skill: state.skills, confirmed: state.confirmed }[m[1]][m[2]];
    else {
      const [r, h] = str.split('@');
      const room = normPlace(r);
      ok = room !== null && (state.visits[viewKey(room, h === undefined ? null : +h)] || 0) > 0;
    }
    return ok !== not;
  }

  // The hints of `pick` (a hint → bool) the player can see now, with their keys.
  function hintsShown(pick) {
    const s = ctx();
    return game.hints.map((h, i) => Object.assign({ key: hintKey(h, i) }, h)).filter(pick)
      .filter(h => state.hintsSeen[h.key]
        || ([].concat(h.needs || []).every(hintNeed) && (!h.when || h.when(s))));
  }

  // How many hints that need hint `key` are still locked by something besides
  // other hints (a room to see, a paper, a flag...). Those held back only by
  // hints open up by reading, so they aren't counted.
  function hintsBehind(key) {
    return game.hints.filter((h, i) => [].concat(h.needs || []).includes('hint:' + key) && hintStuck(h, i)).length;
  }
  // Not shown yet, and held back by more than other hints. A hint whose '!'
  // need already fails is gone for good (rooms, papers, skills, confirmations
  // and hints seen never go back), so it isn't counted; flags can be unset.
  function hintStuck(h, i) {
    if (state.hintsSeen[hintKey(h, i)]) return false;
    if ([].concat(h.needs || []).some(n => n[0] === '!' && !/^!flag:/.test(n) && !hintNeed(n))) return false;
    const needs = [].concat(h.needs || []).filter(n => !/^hint:/.test(n));
    return !needs.every(hintNeed) || !!(h.when && !h.when(ctx()));
  }
  // How many hints of `pick` (a hint → bool) are locked in that way.
  function hintsLocked(pick) {
    return game.hints.filter((h, i) => pick(h) && hintStuck(h, i)).length;
  }
  function sayLocked(out, pick) {
    const n = hintsLocked(pick);
    if (n) out.appendChild(el('p', 'muted hint-locked-count', escapeHtml(ui.hintsLocked(n))));
  }

  // Questions, each with a Show hint button, or once shown, with its text
  // folded under the question: clicking the question hides or shows it.
  function hintItems(list) {
    const s = ctx();
    const box = el('ul', 'hint-list');
    list.forEach(h => {
      const item = el('li', 'hint-item');
      const question = renderMarkup(L(h.question, s) || L(h.question && h.question.en, s) || '', s);
      if (state.hintsSeen[h.key]) {
        item.classList.add('hint-seen');
        const fold = el('details');
        fold.open = !(state.hintsClosed && state.hintsClosed[h.key]);
        fold.addEventListener('toggle', () => {
          state.hintsClosed = state.hintsClosed || {};
          if (fold.open) delete state.hintsClosed[h.key]; else state.hintsClosed[h.key] = true;
          save();
        });
        fold.appendChild(el('summary', 'hint-q', question.replace(/<\/?p>/g, '')));
        const text = L(h.text, s) || L(h.text && h.text.en, s);
        fold.appendChild(el('div', 'paper-text hint-text', renderMarkup(text, s)));
        item.appendChild(fold);
      } else {
        item.appendChild(el('div', 'hint-q', question));
        const b = el('button', 'hint-more', escapeHtml(ui.hintShow));
        b.type = 'button';
        b.addEventListener('click', () => {
          state.hintsSeen[h.key] = true;
          save();
          renderHintResult();
        });
        item.appendChild(b);
      }
      const behind = hintsBehind(h.key);
      if (behind) item.appendChild(el('p', 'hint-behind', escapeHtml(ui.hintBehind(behind))));
      box.appendChild(item);
    });
    return box;
  }

  function renderHints() {
    const panel = $('#hints');
    if (!Array.isArray(game.hints)) {
      const text = L(game.hints);
      panel.innerHTML = text ? renderMarkup(text, ctx()) : '';
      if (!text) panel.appendChild(el('p', 'muted', escapeHtml(ui.noHints)));
      return;
    }
    // Built once, so a re-render doesn't lose what is being typed.
    if (!panel.querySelector('.hint-form')) {
      panel.innerHTML = '';
      panel.appendChild(el('p', 'reg-hint hint-intro'));
      panel.appendChild(el('p', 'reg-hint hint-locked'));
      const form = el('form', 'hint-form');
      form.autocomplete = 'off';
      form.innerHTML = '<select class="hint-via"></select>'
        + '<input class="hint-input" list="hint-names" spellcheck="false"><select class="hint-wish"></select>'
        + '<button type="submit"></button><datalist id="hint-names"></datalist>';
      const via = form.querySelector('.hint-via'), input = form.querySelector('.hint-input'), wish = form.querySelector('.hint-wish');
      const ask = () => {
        const value = hintVia === 'wish' ? wish.value : input.value.trim();
        hintQuery = value ? { via: hintVia, value } : null;
        renderHintResult();
      };
      form.addEventListener('submit', e => { e.preventDefault(); ask(); });
      via.addEventListener('change', () => {
        hintVia = via.value;
        input.value = '';
        wish.value = '';
        hintQuery = null;
        renderHints();
        (hintVia === 'wish' ? wish : input).focus();
      });
      wish.addEventListener('change', ask);
      panel.appendChild(form);
      panel.appendChild(el('div', 'hint-result'));
    }
    panel.querySelector('.hint-intro').textContent = ui.hintIntro;
    panel.querySelector('.hint-locked').textContent = ui.hintLocked;
    const via = panel.querySelector('.hint-via');
    via.setAttribute('aria-label', ui.hintBy);
    via.innerHTML = '';
    [['name', ui.hintByName], ['wish', ui.hintByWish]].forEach(([v, t]) => via.appendChild(new Option(t, v)));
    via.value = hintVia;

    const input = panel.querySelector('.hint-input');
    input.hidden = hintVia === 'wish';
    input.placeholder = ui.hintNamePlaceholder;
    input.setAttribute('aria-label', input.placeholder);
    // Suggest the names on the guest list.
    const names = panel.querySelector('#hint-names');
    names.innerHTML = '';
    if (hintVia === 'name' && state.papers.names) {
      game.characters.filter(c => !c.player).forEach(c => names.appendChild(new Option(L(c.name))));
    }

    const wish = panel.querySelector('.hint-wish');
    const picked = wish.value;
    wish.hidden = hintVia !== 'wish';
    wish.setAttribute('aria-label', ui.hintByWish);
    wish.innerHTML = '';
    wish.appendChild(new Option(ui.hintPickWish, ''));
    wishOrder.forEach(w => wish.appendChild(new Option(L(w), w.id)));
    wish.value = picked;

    panel.querySelector('.hint-form button').textContent = ui.hintAsk;
    renderHintResult();
  }

  function renderHintResult() {
    const out = $('#hints .hint-result');
    if (!out) return;
    out.innerHTML = '';
    const say = msg => out.appendChild(el('p', 'muted', escapeHtml(msg)));
    if (hintQuery) {
      let label, guest, pick;
      if (hintQuery.via === 'wish') {
        const w = wishById[hintQuery.value];
        if (w) {
          label = L(w);
          guest = game.characters.find(c => c.wish === w.id);
          pick = h => h.wish === w.id;
        }
      } else {
        guest = charsForName(hintQuery.value)[0];
        label = guest ? charName(guest) : hintQuery.value;
        pick = guest && (h => h.guest === guest.id);
      }
      if (label) {
        out.appendChild(el('h3', 'paper-title', escapeHtml(label)));
        if (!pick) say(ui.hintUnknown);
        else {
          if (guest && state.confirmed[guest.id]) say(ui.hintConfirmed);
          const list = hintsShown(pick);
          if (list.length) out.appendChild(hintItems(list));
          else say(ui.hintNone);
          sayLocked(out, pick);
        }
      }
    }
    // Hints about no one guest or wish are always listed.
    const general = hintsShown(h => !h.guest && !h.wish);
    if (general.length) {
      out.appendChild(el('h3', 'paper-title hint-general', escapeHtml(ui.hintGeneral)));
      out.appendChild(hintItems(general));
    }
    if (general.length) sayLocked(out, h => !h.guest && !h.wish);
  }

  // ---------------------------------------------------------------------------
  // Feedback: toast, chime, modal
  // ---------------------------------------------------------------------------
  // Toasts that arrive together (a confirmation and the paper it unlocks)
  // are shown one after another rather than over each other.
  const toasts = [];
  let toastTimer = null;
  function toast(msg) {
    toasts.push(msg);
    if (!toastTimer) nextToast();
  }

  function nextToast() {
    if (!toasts.length) { toastTimer = null; return; }
    const t = $('#toast');
    t.textContent = toasts.shift();
    t.classList.remove('show');
    void t.offsetWidth;
    t.classList.add('show');
    toastTimer = setTimeout(nextToast, 2000);
  }

  function chime() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ac = chime.ac || (chime.ac = new AC());
      [392, 523.25, 783.99].forEach((f, i) => {
        const o = ac.createOscillator(), g = ac.createGain();
        const t0 = ac.currentTime + i * 0.16;
        o.type = 'triangle';
        o.frequency.value = f;
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(0.12, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.2);
        o.connect(g).connect(ac.destination);
        o.start(t0); o.stop(t0 + 1.3);
      });
    } catch (e) { /* audio unavailable */ }
  }

  function showModal(text, buttons) {
    const m = $('#modal');
    $('#modal-title').textContent = L(game.title);
    $('#modal-body').innerHTML = renderMarkup(text, ctx());
    const bar = $('#modal-buttons');
    bar.innerHTML = '';
    buttons.forEach(b => {
      const btn = el('button', b.primary ? 'primary' : '', escapeHtml(b.label));
      btn.addEventListener('click', () => { m.hidden = true; if (b.action) b.action(); });
      bar.appendChild(btn);
    });
    m.hidden = false;
    const first = bar.querySelector('button');
    if (first) first.focus();
  }

  // ---------------------------------------------------------------------------
  // The home screen and the prologue, shown full-page before the game proper
  // ---------------------------------------------------------------------------
  function showScreen(kind) {
    stopReveal();
    $('#screen').hidden = false;
    $('#screen').className = 'screen ' + kind;
    $('#screen-title').textContent = L(game.title);
    $('#screen-body').innerHTML = '';
    $('#screen-actions').innerHTML = '';
  }

  function screenButton(label, primary, onClick) {
    const b = el('button', primary ? 'primary' : '', escapeHtml(label));
    b.type = 'button';
    b.addEventListener('click', onClick);
    $('#screen-actions').appendChild(b);
    return b;
  }

  // The size of the room text and dialogue, in percent, set as --text-scale;
  // kept in this browser as a preference rather than in the save. Set with a
  // slider on the home screen, or in the Aa button's popup in the top bar.
  const TEXT_SIZE_MIN = 80, TEXT_SIZE_MAX = 160;
  const TEXT_SIZE_KEY = 'hilbert-hotel:text-size';
  let textSize = (() => {
    try {
      let z = Number(JSON.parse(localStorage.getItem(TEXT_SIZE_KEY)));
      if (z > 0 && z < 2) z = Math.round(z * 100);  // an older scale, e.g. 1.15
      return z >= TEXT_SIZE_MIN && z <= TEXT_SIZE_MAX ? z : 100;
    } catch (e) { return 100; }
  })();

  function setTextSize(z) {
    textSize = z;
    document.documentElement.style.setProperty('--text-scale', String(z / 100));
    try { localStorage.setItem(TEXT_SIZE_KEY, JSON.stringify(z)); } catch (e) { /* storage unavailable */ }
  }

  // A labelled slider with the size shown beside it.
  function textSizeSlider() {
    const wrap = el('label', 'size-slider');
    wrap.appendChild(el('span', 'lang-label', escapeHtml(ui.textSize)));
    const slider = el('input');
    slider.type = 'range';
    slider.min = TEXT_SIZE_MIN; slider.max = TEXT_SIZE_MAX; slider.step = 5;
    slider.value = textSize;
    const shown = el('span', 'size-value', textSize + '%');
    slider.addEventListener('input', () => {
      setTextSize(Number(slider.value));
      shown.textContent = textSize + '%';
    });
    const row = el('span', 'size-row');
    row.appendChild(slider);
    row.appendChild(shown);
    wrap.appendChild(row);
    return wrap;
  }

  // A popup under a top-bar button, filled by `fill(pop)`; the button opens
  // and closes it, and a click elsewhere or Esc closes it too.
  function togglePopup(button, id, cls, fill) {
    const old = document.getElementById(id);
    if (old) { old.close(); return; }
    const pop = el('div', 'popup ' + cls);
    pop.id = id;
    fill(pop);
    document.body.appendChild(pop);
    const r = button.getBoundingClientRect();
    pop.style.top = (r.bottom + 6) + 'px';
    pop.style.right = Math.max(8, window.innerWidth - r.right) + 'px';
    // Slid back on-screen if hanging from a button away from the corner.
    if (pop.getBoundingClientRect().left < 8) pop.style.right = Math.max(8, window.innerWidth - pop.offsetWidth - 8) + 'px';
    const onEvent = e => {
      if (e.type === 'keydown' ? e.key !== 'Escape' : pop.contains(e.target) || button.contains(e.target)) return;
      pop.close();
    };
    pop.close = () => {
      pop.remove();
      document.removeEventListener('pointerdown', onEvent);
      document.removeEventListener('keydown', onEvent);
    };
    document.addEventListener('pointerdown', onEvent);
    document.addEventListener('keydown', onEvent);
    const first = pop.querySelector('input, button');
    if (first) first.focus();
  }

  // The Aa button's popup.
  function toggleTextSizePopup() {
    togglePopup($('#text-size'), 'size-popup', 'size-popup', pop => pop.appendChild(textSizeSlider()));
  }

  // The Save button's popup: the save slots, autosave, and saving to or
  // loading from a file. Opened from the phone menu, it hangs under ☰.
  function toggleSavePopup(anchor) {
    togglePopup(anchor instanceof Element ? anchor : $('#save-button'), 'save-popup', 'save-popup', fillSavePopup);
  }

  // The ☰ button, on phones only (see style.css): the top-bar buttons that
  // don't fit there (Prologue, Save, text size, Start over) as one menu.
  function toggleMenuPopup() {
    const menu = $('#menu-button');
    togglePopup(menu, 'menu-popup', 'menu-popup', pop => {
      const item = (label, onClick) => {
        const b = el('button', 'menu-item', escapeHtml(label));
        b.type = 'button';
        b.addEventListener('click', () => { pop.close(); onClick(); });
        pop.appendChild(b);
      };
      if (!$('#prologue-button').hidden) item(ui.prologueLog, showPrologueLog);
      item(ui.saveLoad, () => toggleSavePopup(menu));
      pop.appendChild(textSizeSlider());
      item(ui.reset, () => { if (confirm(ui.resetConfirm)) reset(); });
    });
  }

  function fillSavePopup(pop) {
    pop.innerHTML = '';
    const button = (label, onClick, disabled) => {
      const b = el('button', '', escapeHtml(label));
      b.type = 'button';
      b.disabled = !!disabled;
      b.addEventListener('click', onClick);
      return b;
    };
    const refill = () => { fillSavePopup(pop); };

    const slots = el('div', 'save-slots');
    for (let n = 1; n <= SLOTS; n++) {
      const data = readSlot(n);
      const row = el('div', 'save-slot');
      const info = el('div', 'save-slot-info');
      info.appendChild(el('span', 'save-slot-name', escapeHtml(ui.saveSlot(n))));
      const when = data && new Date(data.savedAt).toLocaleString(state.lang, { dateStyle: 'short', timeStyle: 'short' });
      info.appendChild(el('span', 'save-slot-detail', escapeHtml(data
        ? ui.slotInfo(data.state.player, Object.keys(data.state.confirmed || {}).length, when)
        : ui.slotEmpty)));
      row.appendChild(info);
      row.appendChild(button(ui.saveHere, () => {
        if (data && !confirm(ui.overwriteConfirm(n))) return;
        saveToSlot(n);
        refill();
      }));
      row.appendChild(button(ui.loadHere, () => {
        const fresh = readSlot(n);
        if (fresh && confirm(ui.loadConfirm)) loadState(fresh.state);
      }, !data));
      slots.appendChild(row);
    }
    pop.appendChild(slots);

    const files = el('div', 'save-files');
    files.appendChild(button(ui.exportSave, exportSave));
    const picker = el('input');
    picker.type = 'file';
    picker.accept = '.json,application/json';
    picker.hidden = true;
    picker.addEventListener('change', () => { if (picker.files[0]) importSave(picker.files[0]); picker.value = ''; });
    files.appendChild(picker);
    files.appendChild(button(ui.importSave, () => picker.click()));
    pop.appendChild(files);

    const auto = el('label', 'save-auto');
    const box = el('input');
    box.type = 'checkbox';
    box.checked = autosave;
    box.addEventListener('change', () => { setAutosave(box.checked); refill(); });
    auto.appendChild(box);
    auto.appendChild(document.createTextNode(' ' + ui.autosave));
    pop.appendChild(auto);
    pop.appendChild(el('p', 'save-auto-note', escapeHtml(autosave ? ui.autosaveOn : ui.autosaveOff)));
  }

  // The language is chosen here, before starting, and is fixed for that game.
  function renderHome() {
    showScreen('home');
    const body = $('#screen-body');
    body.appendChild(el('div', 'lang-label', escapeHtml(ui.chooseLanguage)));
    const row = el('div', 'lang-row');
    LANGS.forEach(l => {
      const b = el('button', 'lang' + (l === state.lang ? ' current' : ''), escapeHtml(LANG_NAMES[l]));
      b.type = 'button';
      b.lang = l;
      b.setAttribute('aria-pressed', String(l === state.lang));
      b.disabled = state.started && l !== state.lang;
      b.addEventListener('click', () => {
        if (state.started || l === state.lang) return;
        state.lang = l;
        save();
        applyLanguage();
        renderHome();
      });
      row.appendChild(b);
    });
    body.appendChild(row);
    if (state.started) body.appendChild(el('p', 'muted lang-locked', escapeHtml(ui.langLocked)));
    body.appendChild(textSizeSlider());
    // A short note under the language buttons (credits, disclaimers, …).
    if (game.homeNote) body.appendChild(el('div', 'home-note', renderMarkup(L(game.homeNote), ctx())));

    if (!state.started) {
      screenButton(ui.startGame, true, () => {
        state.started = true;
        state.step = prologue().length ? 0 : null;
        save();
        renderDebug();
        runPrologue();
      }).focus();
    } else {
      screenButton(ui.resume, true, runPrologue).focus();
      screenButton(ui.newGame, false, () => { if (confirm(ui.resetConfirm)) reset(); });
    }
  }

  // The prologue is a list of steps played once, in order:
  //   { speaker, text }          a line, with a Continue button
  //   { ask: 'name', text }      asks the player's name, kept as {player}
  //   { give: paperId, text }    hands over a paper, shown as an Inventory card
  //   { read: paperId, text }    shows a paper's whole text on the page
  // Any step may also have `do(s)`, run when it appears. The newest step's
  // paragraphs appear one at a time, each on a click (see revealInTurn).
  function prologue() { return game.prologue || []; }

  // The newest step's paragraphs (and any paper card) appear one at a time,
  // each on a click or Space/Enter, with a prompt at the bottom of the page
  // until the last. Then `done` runs, which shows the step's controls.
  let stopReveal = () => {};
  function revealInTurn(items, done) {
    stopReveal();
    let i = 0;
    items.forEach((e, k) => e.classList.toggle('pending', k > 0));
    const prompt = el('button', 'click-on', escapeHtml(ui.clickToContinue));
    prompt.type = 'button';
    const onClick = () => advance();
    const onKey = e => {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      e.preventDefault();
      advance();
    };
    // Listen from the next tick, so the click that opened this step doesn't skip it.
    const listen = setTimeout(() => {
      $('#screen').addEventListener('click', onClick);
      document.addEventListener('keydown', onKey);
    }, 0);
    stopReveal = () => {
      prompt.remove();
      clearTimeout(listen);
      $('#screen').removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
      stopReveal = () => {};
    };
    function advance() {
      i++;
      if (i < items.length) {
        items[i].classList.remove('pending');
        items[i].classList.add('reveal');
        items[i].scrollIntoView({ block: 'end' });
      }
      if (i >= items.length - 1) { stopReveal(); done(); }
    }
    if (items.length <= 1) { stopReveal(); done(); }
    else $('#screen-actions').appendChild(prompt);
  }

  function runPrologue() {
    const steps = prologue();
    if (state.step === null || state.step >= steps.length) return enterGame();
    showScreen('story');
    const body = $('#screen-body');
    const s = ctx();
    const cur = steps[state.step];
    if (cur.do) cur.do(s);

    // Earlier steps stay on the page, as in a conversation.
    steps.slice(0, state.step + 1).forEach((st, i) => {
      body.appendChild(prologueLine(st, s, i === state.step, i < state.step));
    });

    const next = () => { state.step++; save(); runPrologue(); };
    const fresh = body.lastElementChild;
    revealInTurn([...fresh.querySelectorAll('.speech > p, .item-card, .paper-sheet')], () => {
      // The paper's card is the last thing revealed: hand it over (and toast) now.
      if (cur.give) give(cur.give);
      showPrologueControls(cur, next);
      body.lastElementChild.scrollIntoView({ block: 'end' });
    });
    fresh.scrollIntoView({ block: 'end' });
  }

  // One prologue step as it appears on the page. `answered`: the step has
  // been passed, so an `ask: 'name'` step shows the name the player gave.
  function prologueLine(st, s, fresh, answered) {
    const line = el('div', 'line' + (fresh ? ' fresh' : ''));
    const speaker = L(st.speaker, s);
    if (speaker) line.appendChild(el('div', 'speaker', escapeHtml(speaker)));
    const text = L(st.text, s);
    if (text) line.appendChild(el('div', 'speech', renderMarkup(text, s)));
    const paper = st.give && papers().find(p => p.id === st.give);
    if (paper) {
      const card = el('div', 'item-card');
      card.appendChild(el('span', 'item-label', escapeHtml(ui.addedToInventory)));
      card.appendChild(el('strong', '', escapeHtml(paperTitle(paper))));
      line.appendChild(card);
    }
    const sheet = st.read && papers().find(p => p.id === st.read);
    if (sheet) {
      const box = el('div', 'paper-sheet');
      box.appendChild(el('div', 'paper-sheet-title', escapeHtml(paperTitle(sheet))));
      box.appendChild(el('div', 'paper-sheet-text', renderMarkup(L(sheet.text, s), s)));
      line.appendChild(box);
    }
    if (st.ask === 'name' && answered) {
      const said = el('div', 'line player');
      said.textContent = '— ' + state.player;
      line.appendChild(said);
    }
    return line;
  }

  // The whole prologue again, read-only, from the top bar once it's over.
  function showPrologueLog() {
    showScreen('story');
    const body = $('#screen-body');
    const s = ctx();
    prologue().forEach(st => body.appendChild(prologueLine(st, s, false, true)));
    screenButton(ui.back, true, enterGame).focus();
    body.scrollTop = 0;
  }

  // The Continue button, or the name form for an `ask: 'name'` step.
  function showPrologueControls(cur, next) {
    if (cur.ask === 'name') {
      const form = el('form', 'name-form');
      form.autocomplete = 'off';
      const input = el('input');
      input.maxLength = MAX_NAME;
      input.spellcheck = false;
      input.placeholder = ui.yourName;
      input.setAttribute('aria-label', ui.yourName);
      input.value = state.player;
      const ok = el('button', 'primary', escapeHtml(ui.continue));
      ok.type = 'submit';
      ok.disabled = !input.value.trim();
      input.addEventListener('input', () => { ok.disabled = !input.value.trim(); input.setCustomValidity(''); });
      form.addEventListener('submit', e => {
        e.preventDefault();
        // Markup characters would turn {player} into italics or worse.
        const name = input.value.replace(/[*~{}]/g, '').trim().slice(0, MAX_NAME);
        if (!name) return;
        // Any name is fine, even a guest's: the register tells the two apart
        // by wish and room (see charsForName).
        state.player = name;
        next();
      });
      form.appendChild(input);
      form.appendChild(ok);
      $('#screen-actions').appendChild(form);
      input.focus();
    } else {
      screenButton(ui.continue, true, next).focus();
    }
  }

  // Into the game proper: the start room, or wherever the player left off.
  function enterGame() {
    // Straight after the prologue, the notebook opens (also as a drawer on
    // small screens) so the player sees their papers and the register.
    const fromPrologue = state.step !== null;
    if (fromPrologue) { state.step = null; save(); }
    $('#screen').hidden = true;
    $('#prologue-button').hidden = !prologue().length;
    if (state.room) renderRoom(true);
    else goTo(game.startRoom || 1, null, true);
    renderNotebook();
    if (fromPrologue) showNotebook(true);
    // Rows written before a game update (new aliases, fixed answers, …) may
    // have become correct since: check them now, not only on the next edit.
    checkDeductions();
    $('#go-input').focus();
  }

  function reset() {
    state = freshState();
    writeSave();
    resetView();
    renderHome();
  }

  // Clears everything drawn for the previous game, after `state` is replaced.
  function resetView() {
    const pop = $('#save-popup');
    if (pop) pop.close();
    editing = null;
    openItem = null;
    notesShown = '';
    hintQuery = null;
    hintVia = 'name';
    $('#hints').innerHTML = '';
    applyLanguage();
    ['#room-body', '#room-number', '#room-floor', '#room-name', '#room-time', '#recent', '#places'].forEach(sel => { $(sel).innerHTML = ''; });
    document.body.classList.remove('past');
    $('#memory').hidden = true;
    $('#lift-button').hidden = true;
    $('#prologue-button').hidden = true;
  }

  // ---------------------------------------------------------------------------
  // Showing and hiding the notebook: a drawer on small screens, a column that
  // can be put away on wide ones
  // ---------------------------------------------------------------------------
  const narrow = () => window.matchMedia('(max-width: 820px)').matches;

  function showNotebook(show) {
    if (narrow()) document.body.classList.toggle('nb-open', show);
    else {
      state.nbHidden = !show;
      save();
    }
    renderNotebookShown();
  }

  function renderNotebookShown() {
    document.body.classList.toggle('nb-hidden', !!state.nbHidden);
    const shown = narrow() ? document.body.classList.contains('nb-open') : !state.nbHidden;
    $('#nb-toggle').setAttribute('aria-expanded', String(shown));
  }

  // ---------------------------------------------------------------------------
  // Debugging: a button that hands over the Memory Device straight away, plus
  // the game's own `debugActions`: [{ label, run(s), done(s) }], each a button
  // that runs `run` and hides once `done` returns true.
  // Shown when the game sets `debug: true` or the page is opened with ?debug.
  // ---------------------------------------------------------------------------
  const debugMode = () => !!game.debug || /[?&]debug\b/.test(location.search);

  function renderDebug() {
    const b = $('#debug-memory');
    b.textContent = ui.debugMemory;
    b.hidden = !debugMode() || !state.started || !!state.skills.memory;
    const box = $('#debug-actions');
    box.innerHTML = '';
    if (!debugMode() || !state.started) return;
    const s = ctx();
    (game.debugActions || []).filter(a => !a.done || !a.done(s)).forEach(a => {
      const btn = el('button', 'debug', escapeHtml(L(a.label, s)));
      btn.type = 'button';
      btn.addEventListener('click', () => { a.run(ctx()); renderNotebook(); renderDebug(); save(); });
      box.appendChild(btn);
    });
  }

  // ---------------------------------------------------------------------------
  // Language: picked on the home screen and fixed for the rest of the game
  // ---------------------------------------------------------------------------
  // The wishes in alphabetical order for the game's language, so the order of
  // the list and the dropdown never gives away the answer.
  let wishOrder = [];

  // A top-bar button with a long label and a short one for phones (see
  // style.css); the long one stays as its tooltip and accessible name.
  function topbarLabel(button, long, short) {
    button.innerHTML = `<span class="label-long">${escapeHtml(long)}</span><span class="label-short">${escapeHtml(short)}</span>`;
    button.title = long;
    button.setAttribute('aria-label', long);
  }

  function applyLanguage() {
    ui = Object.assign({}, UI[state.lang], (game.ui || {})[state.lang]);
    wishOrder = game.wishes.slice().sort((a, b) => L(a).localeCompare(L(b), state.lang));
    document.documentElement.lang = state.lang;
    document.title = L(game.title);
    $('#game-title').textContent = L(game.title);
    $('#prologue-button').textContent = ui.prologueLog;
    $('#go-label').textContent = ui.goTo;
    $('#go-button').textContent = ui.go;
    $('#go-input').placeholder = ui.placeholder;
    $('#nb-toggle-label').textContent = ui.notebook;
    $('#present-button').textContent = ui.present;
    $('#lift-button').textContent = ui.useLift;
    topbarLabel($('#fates-button'), ui.fates, ui.fatesShort);
    $('#go-error').textContent = '';
    $('#note-input').placeholder = ui.notePlaceholder;
    $('#note-add').textContent = ui.noteAdd;
    $('#note-page-delete').textContent = ui.deletePage;
    $('#clip').textContent = ui.clip;
    $('#save-button').textContent = ui.saveMenu;
    $('#menu-button').title = ui.menu;
    $('#menu-button').setAttribute('aria-label', ui.menu);
    $('#text-size').title = ui.textSize;
    $('#text-size').setAttribute('aria-label', ui.textSize);
    $('#reset').title = ui.reset;
    $('#reset').setAttribute('aria-label', ui.reset);
    $('#nb-close').title = ui.hide;
    $('#nb-close').setAttribute('aria-label', ui.hide);
    $('#notebook').setAttribute('aria-label', ui.notebook);
    renderNav();
    renderMemory();
    renderNotebook();
    renderNotebookShown();
    renderDebug();
    if (state.room && state.started) renderRoom(false);
  }

  // ---------------------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------------------
  function boot() {
    state = load() || freshState();
    applyLanguage();

    $('#go-form').addEventListener('submit', e => {
      e.preventDefault();
      if (!state.started) state.started = true;
      // Rooms above 999,999,999 can't be entered (the register's limit
      // too), so huge numbers never reach the page.
      const typed = $('#go-input').value.trim();
      const r = normRoom(typed);
      if (r !== null && /^\d+$/.test(r) && BigInt(r) > HUGE) {
        $('#go-error').textContent = ui.tooHigh;
        return;
      }
      // Walking keeps the hour the Memory Device is set to.
      goTo(typed, state.at);
    });
    $('#present-button').addEventListener('click', () => goTo(state.room));
    $('#lift-button').addEventListener('click', rideElevator);
    $('#nb-toggle').addEventListener('click', () => {
      showNotebook(narrow() ? !document.body.classList.contains('nb-open') : !!state.nbHidden);
    });
    $('#nb-close').addEventListener('click', () => showNotebook(false));
    window.addEventListener('resize', renderNotebookShown);
    $('#reset').addEventListener('click', () => { if (confirm(ui.resetConfirm)) reset(); });
    $('#text-size').addEventListener('click', toggleTextSizePopup);
    setTextSize(textSize);
    $('#save-button').addEventListener('click', toggleSavePopup);
    $('#menu-button').addEventListener('click', toggleMenuPopup);
    // With autosave off, the browser asks before leaving with unsaved progress.
    window.addEventListener('beforeunload', e => {
      if (!autosave && unsaved && state.started) { e.preventDefault(); e.returnValue = ''; }
    });
    $('#debug-memory').addEventListener('click', () => { learn('memory'); renderNotebook(); save(); });
    $('#fates-button').addEventListener('click', showFates);
    $('#prologue-button').addEventListener('click', showPrologueLog);
    // The notebook's tabs, plus Hints, whose button sits apart in the top
    // bar's far corner so it isn't clicked by mistake. It opens the notebook
    // on the hints, and a second click goes back to the tab before.
    let lastTab = 'inventory';
    const showTab = tab => {
      if (tab !== 'hints') lastTab = tab;
      document.querySelectorAll('.tab, #tab-hints').forEach(t => {
        t.classList.toggle('active', t.id === 'tab-' + tab);
        t.setAttribute(t.id === 'tab-hints' ? 'aria-pressed' : 'aria-selected', String(t.id === 'tab-' + tab));
      });
      document.querySelectorAll('.tab-panel').forEach(p => { p.hidden = p.id !== tab; });
      $('#tab-' + tab).classList.remove('ping');
    };
    ['inventory', 'register', 'notes'].forEach(tab => {
      $('#tab-' + tab).addEventListener('click', () => showTab(tab));
    });
    $('#tab-hints').addEventListener('click', () => {
      const shown = narrow() ? document.body.classList.contains('nb-open') : !state.nbHidden;
      if (shown && !$('#hints').hidden) { showTab(lastTab); return; }
      showTab('hints');
      if (!shown) showNotebook(true);
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && document.body.classList.contains('nb-open')) showNotebook(false);
    });
    $('#note-page-title').addEventListener('input', e => {
      const page = currentPage();
      page.title = e.target.value;
      const chip = $('#note-pages .note-page.current');
      if (chip) chip.textContent = chip.title = pageTitle(page);
      save();
    });
    $('#note-page-title').addEventListener('change', e => { e.target.value = currentPage().title = e.target.value.trim(); save(); });
    $('#note-page-title').addEventListener('keydown', e => { if (e.key === 'Enter') e.target.blur(); });
    $('#note-page-delete').addEventListener('click', deletePage);
    $('#note-form').addEventListener('submit', e => {
      e.preventDefault();
      const input = $('#note-input');
      if (!input.value.trim()) return;
      addPlayerNote({ text: input.value.trim() });
      input.value = '';
    });
    $('#note-input').addEventListener('keydown', e => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); $('#note-form').requestSubmit(); }
    });
    initClipping();

    if (/[?&]debug\b/.test(location.search)) {
      console.table(game.characters.map(c => ({ id: c.id, name: c.player ? '(the player)' : L(c.name), wish: c.wish, room: normRoom(c.room) })));
    }
    renderHome();
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  const HOTEL = window.HOTEL = {
    define(def) {
      game = def;
      game.rooms = game.rooms || [];
      game.dialogues = game.dialogues || {};
      charById = {}; wishById = {}; placeById = Object.create(null);
      game.characters.forEach(c => { charById[c.id] = c; });
      indexNames();
      (game.places || []).forEach(p => { placeById[p.id] = p; });
      memory = Object.assign({ from: 7, to: 23, empty: () => ui.pastEmpty }, game.memory);
      memory.except = [].concat(memory.except || []).map(normPlace);
      game.wishes.forEach(w => { wishById[w.id] = w; });
      // Hints whose English question starts with [DRAFT] are still being
      // written (scenes.html marks them the same way), so players never see
      // them. Debug mode keeps them, to try them out.
      const isDraft = h => /^\s*\[DRAFT\]/i.test(h && h.question ? (h.question.en ?? (typeof h.question === 'string' ? h.question : '')) : '');
      if (Array.isArray(game.hints) && !debugMode()) game.hints = game.hints.filter(h => !isDraft(h));
      validate();
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
      else boot();
    },
    util: { normRoom, normHour, isPrime, isSquare, isPowerOf, seeded, pick: (rnd, arr) => arr[Math.floor(rnd() * arr.length)] },
    debug: {
      get state() { return state; },
      // Writes the guest's answer on their row, or on the first empty one.
      solve(id) {
        const c = charById[id];
        if (!c || state.confirmed[id]) return;
        // A row already right for someone else (same name, other guest) is kept.
        let i = state.entries.findIndex(e => e && !e.cid && !correctGuest(e) && charsForName(e.name).includes(c));
        if (i < 0) { i = 0; while (state.entries[i] && state.entries[i].name) i++; }
        if (i >= game.characters.length) return;
        state.entries[i] = { name: charName(c), wish: c.wish, room: normRoom(c.room) };
        renderNotebook(); checkDeductions(); save();
      },
      solveAll() { game.characters.forEach(c => HOTEL.debug.solve(c.id)); },
      learn(id) { learn(id); renderNotebook(); save(); },
      give(id) { give(id); save(); },
      go(room, hour) { goTo(room, hour, true); }, // ignores floors, elevators and whether the player has the Memory Device
    },
  };
})();
