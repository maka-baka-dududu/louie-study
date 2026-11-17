'use strict';

Object.assign(labels, {kanaChart:'五十音图', englishWords:'背单词', englishSentences:'每日句子'});
Object.assign(navGlyph, {kanaChart:'あ', englishWords:'Aa', englishSentences:'✎'});
projectTools.japanese = ['kanaChart'];
projectTools.english.push('englishWords', 'englishSentences');

const languageTrackAction = window.LouiePractice.trackAction;
window.LouiePractice.trackAction = id => {
  const mainAction = languageTrackAction(id);
  if (id === 'japanese') return '<button class="primary" data-page="kanaChart">五十音图</button>';
  if (id === 'english') return mainAction + '<button data-page="englishWords">背单词</button><button data-page="englishSentences">每日句子</button>';
  return mainAction;
};

function languageRecords() {
  return db.languages ??= {version:1, reviews:{cet6:{}, kaoyan:{}, ielts:{}}, sentences:[]};
}

function languageButton(text, action, pressed) {
  return `<button type="button" onclick="${action}" aria-pressed="${pressed}">${text}</button>`;
}

function speakLanguage(text, locale) {
  const synth = window.speechSynthesis;
  if (!synth || !window.SpeechSynthesisUtterance) return toast('当前浏览器不支持朗读。');
  const voice = synth.getVoices().find(item => item.lang.toLowerCase().startsWith(locale.slice(0,2)));
  if (!voice) return toast('暂时没有找到所需语音，可在设备上安装该语言的系统语音后重试。');
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = locale;
  speech.voice = voice;
  speech.rate = .86;
  speech.onerror = event => {
    if (!['canceled','interrupted'].includes(event.error)) toast('朗读失败，请检查设备语音设置。');
  };
  synth.cancel();
  synth.speak(speech);
}

const kanaGroups = {
  basic: [
    ['あいうえお','a i u e o'], ['かきくけこ','ka ki ku ke ko'], ['さしすせそ','sa shi su se so'],
    ['たちつてと','ta chi tsu te to'], ['なにぬねの','na ni nu ne no'], ['はひふへほ','ha hi fu he ho'],
    ['まみむめも','ma mi mu me mo'], ['や・ゆ・よ','ya - yu - yo'], ['らりるれろ','ra ri ru re ro'],
    ['わ・・・を','wa - - - wo'], ['ん','n']
  ],
  voiced: [
    ['がぎぐげご','ga gi gu ge go'], ['ざじずぜぞ','za ji zu ze zo'], ['だぢづでど','da ji zu de do'],
    ['ばびぶべぼ','ba bi bu be bo'], ['ぱぴぷぺぽ','pa pi pu pe po']
  ],
  contracted: [
    ['き','kya kyu kyo'], ['し','sha shu sho'], ['ち','cha chu cho'], ['に','nya nyu nyo'],
    ['ひ','hya hyu hyo'], ['み','mya myu myo'], ['り','rya ryu ryo'], ['ぎ','gya gyu gyo'],
    ['じ','ja ju jo'], ['び','bya byu byo'], ['ぴ','pya pyu pyo']
  ]
};
const kanaLabels = {basic:'清音', voiced:'浊音与半浊音', contracted:'拗音', quiz:'认读练习'};
let kanaGroup = 'basic', kanaScript = 'hira', kanaShowRomaji = true, kanaQuiz = null, kanaQuizReveal = false;

function kanaRows(group) {
  return kanaGroups[group].map(([text, sounds]) => sounds.split(' ').map((sound, index) => {
    const kana = group === 'contracted' ? text + 'ゃゅょ'[index] : text[index];
    return sound === '-' ? null : [kana, sound];
  }));
}

function displayKana(text) {
  if (kanaScript === 'hira') return text;
  return Array.from(text, char => String.fromCodePoint(char.codePointAt(0) + 0x60)).join('');
}

function keepLanguageFocus(selector) {
  render();
  $(selector)?.focus();
}

function chooseKana(group) {
  if (!Object.hasOwn(kanaLabels, group)) return;
  kanaGroup = group;
  if (group === 'quiz' && !kanaQuiz) return nextKanaQuiz();
  keepLanguageFocus('.kana-group [aria-pressed="true"]');
}

function selectKanaScript(script) {
  kanaScript = script === 'kata' ? 'kata' : 'hira';
  keepLanguageFocus('.kana-script [aria-pressed="true"]');
}

function toggleKanaRomaji() {
  kanaShowRomaji = !kanaShowRomaji;
  keepLanguageFocus('#kanaRomaji');
}

function nextKanaQuiz() {
  const choices = kanaRows('basic').flat().filter(item => item && item[0] !== kanaQuiz?.[0]);
  kanaQuiz = choices[Math.floor(Math.random() * choices.length)];
  kanaQuizReveal = false;
  keepLanguageFocus('#kanaQuizAnswer');
}

function revealKanaQuiz() {
  kanaQuizReveal = true;
  keepLanguageFocus('#kanaQuizNext');
}

function kanaChartView() {
  const controls = `<div class="language-toolbar">
    <div class="actions language-tabs kana-script" aria-label="假名类型">
      ${languageButton('平假名',"selectKanaScript('hira')",kanaScript === 'hira')}
      ${languageButton('片假名',"selectKanaScript('kata')",kanaScript === 'kata')}
    </div>
    ${kanaGroup === 'quiz' ? '' : `<button id="kanaRomaji" type="button" aria-pressed="${kanaShowRomaji}" onclick="toggleKanaRomaji()">罗马音 ${kanaShowRomaji?'开':'关'}</button>`}
  </div>
  <div class="actions language-tabs kana-group" aria-label="发音分类">
    ${Object.entries(kanaLabels).map(([key,name]) => languageButton(name,`chooseKana('${key}')`,key === kanaGroup)).join('')}
  </div>`;
  const title = '<div class="pagehead"><h1>五十音图</h1></div>';
  if (kanaGroup === 'quiz' && kanaQuiz) {
    const [symbol, sound] = kanaQuiz;
    return title + controls + `<section class="card language-flash">
      <p class="muted">先读出假名，再核对罗马音。</p>
      <div class="kana-quiz-symbol">${displayKana(symbol)}</div>
      ${kanaQuizReveal ? `<p class="language-answer">${sound} <button onclick="speakLanguage('${symbol}','ja-JP')">听发音</button></p>`
        : '<button id="kanaQuizAnswer" class="primary" onclick="revealKanaQuiz()">显示读音</button>'}
      <button id="kanaQuizNext" onclick="nextKanaQuiz()">换一个</button>
    </section>`;
  }
  const rows = kanaRows(kanaGroup);
  return title + controls + `<section class="card kana-panel">
    <p class="muted">点击假名听发音。${kanaGroup === 'basic' ? '「を」写作 wo，作助词时通常读 o。' : ''}</p>
    <div class="kana-chart ${kanaGroup === 'contracted' ? 'kana-chart-three' : ''}">
      ${rows.flatMap(row => row.length === 1 ? [...row,null,null,null,null] : row).map(item => {
        if (!item) return '<span class="kana-empty" aria-hidden="true"></span>';
        const [symbol, sound] = item;
        return `<button class="kana-cell" type="button" onclick="speakLanguage('${symbol}','ja-JP')" aria-label="${displayKana(symbol)}${kanaShowRomaji?' '+sound:''}，播放发音">
          <b>${displayKana(symbol)}</b>${kanaShowRomaji?`<small>${sound}</small>`:''}</button>`;
      }).join('')}
    </div>
    <p class="language-source"><a href="https://classroomresources.sydney.jpf.go.jp/resources/hiragana-katakana-game/" target="_blank" rel="noopener noreferrer">日本国际交流基金假名练习 ↗</a></p>
  </section>`;
}

const wordBooks = {cet6:'六级', kaoyan:'考研', ielts:'雅思'};
const wordReviewIntervals = [1,3,7,14,30];
let wordData = null, wordDataStatus = '', wordBook = 'cet6', wordMode = 'review';
let wordQueue = [], wordSeen = 0, wordRevealed = false, wordTerm = '', wordLimit = 30;

async function loadWordBooks() {
  if (wordData || wordDataStatus === 'loading') return;
  wordDataStatus = 'loading';
  render();
  try {
    const response = await fetch('language-vocab.json');
    if (!response.ok) throw Error('词库未能加载');
    const data = await response.json();
    if (!Object.keys(wordBooks).every(key => Array.isArray(data[key]) && data[key].length)) throw Error('词库格式不正确');
    wordData = data;
    wordDataStatus = '';
  } catch (_) {
    wordDataStatus = 'error';
  }
  if (page === 'englishWords') render();
}

function reviewableWords(book) {
  const reviews = languageRecords().reviews[book];
  const due = [], fresh = [], date = today();
  for (const entry of wordData[book]) {
    const word = entry[0];
    const review = Object.hasOwn(reviews, word) ? reviews[word] : null;
    if (!review) fresh.push(entry);
    else if (review.due <= date) due.push(entry);
  }
  return {due, fresh};
}

function chooseWordBook(book) {
  if (!Object.hasOwn(wordBooks,book)) return;
  wordBook = book;
  wordQueue = [];
  wordSeen = 0;
  wordRevealed = false;
  wordTerm = '';
  wordLimit = 30;
  keepLanguageFocus('.word-books [aria-pressed="true"]');
}

function chooseWordMode(mode) {
  wordMode = mode === 'list' ? 'list' : 'review';
  keepLanguageFocus('.word-modes [aria-pressed="true"]');
}

function startWordReview() {
  const {due, fresh} = reviewableWords(wordBook);
  wordQueue = due.concat(fresh).slice(0,20);
  wordSeen = 0;
  wordRevealed = false;
  keepLanguageFocus('#wordReveal');
}

function revealWord() {
  wordRevealed = true;
  keepLanguageFocus('#wordAgain');
}

let languageWriting = false;
async function gradeWord(remembered) {
  const entry = wordQueue[0];
  if (!entry || !wordRevealed || languageWriting) return;
  const book = wordBook, reviews = languageRecords().reviews[book], word = entry[0];
  const previous = Object.hasOwn(reviews,word) ? reviews[word] : null;
  const level = remembered ? Math.min(wordReviewIntervals.length,(previous?.level || 0) + 1) : 0;
  const review = {level, due:plusDay(remembered ? wordReviewIntervals[level-1] : 0)};
  reviews[word] = review;
  languageWriting = true;
  let saved;
  try { saved = await save(); } finally { languageWriting = false; }
  if (!saved) {
    if (previous) reviews[word] = previous;
    else delete reviews[word];
    return;
  }
  if (book !== wordBook || wordQueue[0] !== entry) return;
  wordQueue.shift();
  wordSeen++;
  wordRevealed = false;
  if (page === 'englishWords') keepLanguageFocus(wordQueue.length ? '#wordReveal' : '#wordStart');
}

function wordList() {
  const query = wordTerm.trim().toLowerCase();
  const visible = wordData[wordBook].filter(([word, , meaning]) => !query || word.includes(query) || meaning.includes(query));
  return visible.slice(0,wordLimit).map(([word, phonetic, meaning]) => `<div class="language-list-row">
    <strong>${esc(word)}</strong> ${phonetic?`<small>/${esc(phonetic)}/</small>`:''}<p>${esc(meaning)}</p>
  </div>`).join('') + (visible.length > wordLimit ? '<button id="moreWords" onclick="moreWords()">显示更多</button>' : '') +
    (visible.length ? '' : '<p class="muted">没有符合条件的单词。</p>');
}

function searchWordBook(term) {
  wordTerm = term;
  wordLimit = 30;
  $('#wordList').innerHTML = wordList();
}

function moreWords() {
  wordLimit += 30;
  $('#wordList').innerHTML = wordList();
  $('#moreWords')?.focus();
}

function englishWordView() {
  const head = '<div class="pagehead"><h1>背单词</h1></div>';
  if (!wordData) return head + `<section class="card"><p>${wordDataStatus === 'error' ? '词库加载失败。' : '正在加载词库…'}</p>
    ${wordDataStatus === 'error' ? '<button onclick="loadWordBooks()">重试</button>' : ''}</section>`;
  const tabs = `<div class="language-toolbar">
    <div class="actions language-tabs word-books" aria-label="词汇书">${Object.entries(wordBooks).map(([key,name]) =>
      languageButton(name,`chooseWordBook('${key}')`,key === wordBook)).join('')}</div>
    <div class="actions language-tabs word-modes" aria-label="背单词模式">
      ${languageButton('背诵',"chooseWordMode('review')",wordMode === 'review')}
      ${languageButton('查词',"chooseWordMode('list')",wordMode === 'list')}
    </div>
  </div>`;
  if (wordMode === 'list') {
    return head + tabs + `<section class="card language-card">
      <label>搜索单词或中文释义<input type="search" maxlength="100" value="${esc(wordTerm)}" oninput="searchWordBook(this.value)"></label>
      <div id="wordList">${wordList()}</div>
    </section>`;
  }
  const entry = wordQueue[0];
  if (!entry) {
    const {due, fresh} = reviewableWords(wordBook);
    return head + tabs + `<section class="card language-flash">
      <h2>${wordBooks[wordBook]}词汇</h2>
      ${wordSeen ? `<p>这组已练习 ${wordSeen} 个词。</p>` : ''}
      <p class="muted">全书 ${wordData[wordBook].length} 词 · 到期 ${due.length} · 新词 ${fresh.length}</p>
      <button class="primary" id="wordStart" onclick="startWordReview()" ${due.length + fresh.length ? '' : 'disabled'}>${wordSeen?'继续下一组':'开始学习'}</button>
      <p class="language-source"><a href="https://github.com/skywind3000/ECDICT" target="_blank" rel="noopener noreferrer">ECDICT 词库 ↗</a></p>
    </section>`;
  }
  const [word, phonetic, meaning] = entry;
  return head + tabs + `<section class="card language-flash">
    <small class="muted">这组第 ${wordSeen+1} / ${wordSeen+wordQueue.length} 个</small>
    <div class="word-term">${esc(word)}</div>
    ${phonetic ? `<p class="muted">/${esc(phonetic)}/</p>` : ''}
    ${wordRevealed ? `<p class="language-answer">${esc(meaning)}</p><div class="actions">
      <button id="wordAgain" onclick="gradeWord(false)">还要练</button><button class="primary" onclick="gradeWord(true)">记住了</button>
    </div>` : '<button id="wordReveal" class="primary" onclick="revealWord()">显示释义</button>'}
  </section>`;
}

let sentenceDateFilter = 'all', sentenceQuery = '', sentenceLimit = 30;

function sentenceList() {
  const query = sentenceQuery.trim().toLowerCase();
  const records = languageRecords().sentences.filter(item =>
    (sentenceDateFilter === 'all' || item.date === sentenceDateFilter) &&
    (!query || [item.text,item.translation,item.note].some(value => value.toLowerCase().includes(query)))
  ).sort((a,b) => b.date.localeCompare(a.date) || b.created - a.created);
  return records.slice(0,sentenceLimit).map(item => `<article class="card sentence-card">
    <time datetime="${item.date}">${item.date}</time><h2>${esc(item.text)}</h2>
    ${item.translation ? `<p>${esc(item.translation)}</p>` : ''}
    ${item.note ? `<p class="muted">${esc(item.note)}</p>` : ''}
    <button type="button" onclick="sentenceForm('${item.id}')">编辑</button>
  </article>`).join('') + (records.length > sentenceLimit ? '<button id="sentenceMore" onclick="moreSentences()">显示更多</button>' : '') +
    (!records.length ? '<section class="card empty">这里还没有句子。把今天学到的一句记下来。</section>' : '');
}

function englishSentencesView() {
  const dates = new Set([today(),...languageRecords().sentences.map(item => item.date)]);
  return `<div class="pagehead"><h1>每日句子</h1><button class="primary" onclick="sentenceForm()">＋ 记一句</button></div>
    <div class="language-toolbar sentence-filters">
      <select aria-label="按日期查看句子" onchange="filterSentences(this.value)">
        <option value="all">全部日期</option>
        ${[...dates].sort().reverse().map(date=>`<option value="${date}" ${date===sentenceDateFilter?'selected':''}>${date===today()?'今天 · ':''}${date}</option>`).join('')}
      </select>
      <input type="search" aria-label="搜索句子" placeholder="搜索原句、翻译和笔记" maxlength="100" value="${esc(sentenceQuery)}" oninput="searchSentences(this.value)">
    </div>
    <div id="sentenceList" class="language-card">${sentenceList()}</div>`;
}

function filterSentences(date) {
  sentenceDateFilter = scheduleDate(date) ? date : 'all';
  sentenceLimit = 30;
  $('#sentenceList').innerHTML = sentenceList();
}

function searchSentences(query) {
  sentenceQuery = query;
  sentenceLimit = 30;
  $('#sentenceList').innerHTML = sentenceList();
}

function moreSentences() {
  sentenceLimit += 30;
  $('#sentenceList').innerHTML = sentenceList();
  $('#sentenceMore')?.focus();
}

function sentenceForm(id) {
  const records = languageRecords().sentences;
  const existing = id ? records.find(item => item.id === id) : null;
  if (id && !existing) return;
  const item = existing || {id:uid(), date:today(), text:'', translation:'', note:'', created:Date.now()};
  show(`<h2>${existing?'编辑句子':'记一句'}</h2><form id="sentenceEditor">
    <label>学习日期<input name="date" type="date" required value="${item.date}"></label>
    <label>英语原句<textarea name="text" required maxlength="1000">${esc(item.text)}</textarea></label>
    <label>中文释义（可选）<input name="translation" maxlength="600" value="${esc(item.translation)}"></label>
    <label>用法或笔记（可选）<textarea name="note" maxlength="1000">${esc(item.note)}</textarea></label>
    <div class="actions"><button class="primary">保存句子</button>
    ${existing?`<button type="button" onclick="deleteLanguageSentence('${item.id}')">删除句子</button>`:''}</div>
  </form>`);
  $('#sentenceEditor').onsubmit = async event => {
    event.preventDefault();
    if (languageWriting) return;
    const fields = new FormData(event.target);
    const next = {...item, date:fields.get('date'), text:String(fields.get('text') || '').trim(),
      translation:String(fields.get('translation') || '').trim(), note:String(fields.get('note') || '').trim()};
    if (!scheduleDate(next.date) || !next.text) return toast('请填写日期和英语原句。');
    const index = records.findIndex(record => record.id === item.id);
    if (index < 0 && records.length >= 10000) return toast('句子数量已达上限，请先整理或备份。');
    const previous = records[index];
    if (index < 0) records.push(next);
    else records[index] = next;
    languageWriting = true;
    try {
      if (!await save()) {
        if (index < 0) records.splice(records.indexOf(next),1);
        else records[index] = previous;
        return;
      }
      sentenceDateFilter = next.date;
      sentenceQuery = '';
      sentenceLimit = 30;
      closeModal();
      render();
    } finally { languageWriting = false; }
  };
}

async function deleteLanguageSentence(id) {
  const records = languageRecords().sentences, index = records.findIndex(item => item.id === id);
  if (index < 0 || languageWriting || !confirm('删除这条句子？')) return;
  const [removed] = records.splice(index,1);
  languageWriting = true;
  try {
    if (!await save()) { records.splice(index,0,removed); return; }
    if (!records.some(item => item.date === sentenceDateFilter)) sentenceDateFilter = 'all';
    closeModal();
    render();
  } finally { languageWriting = false; }
}

const languageViews = {kanaChart:kanaChartView, englishWords:englishWordView, englishSentences:englishSentencesView};
const renderBeforeLanguages = render;
render = function () {
  const target = page;
  if (!Object.hasOwn(languageViews,target)) return renderBeforeLanguages();
  page = 'track';
  renderBeforeLanguages();
  page = target;
  $('#view').innerHTML = languageViews[target]();
  renderPersonalNav();
  renderNavigationContext();
  if (target === 'englishWords' && !wordData && !wordDataStatus) void loadWordBooks();
};

const validateBeforeLanguages = validData;
validData = function (data) {
  if (!validateBeforeLanguages(data)) return false;
  const state = data.languages;
  if (state === undefined) return true;
  if (!state || state.version !== 1 || !state.reviews || !Array.isArray(state.sentences) || state.sentences.length > 10000) return false;
  const text = (value,max) => typeof value === 'string' && value.length <= max;
  return Object.keys(wordBooks).every(book => {
    const reviews = state.reviews[book];
    if (!reviews || typeof reviews !== 'object' || Array.isArray(reviews)) return false;
    const entries = Object.entries(reviews);
    return entries.length <= 15000 && entries.every(([word, item]) => /^[a-z][a-z' -]{0,69}$/.test(word) && item &&
      Number.isInteger(item.level) && item.level >= 0 && item.level <= wordReviewIntervals.length && scheduleDate(item.due));
  }) && state.sentences.every(item => item && /^[a-zA-Z0-9-]{1,100}$/.test(item.id) &&
    scheduleDate(item.date) && text(item.text,1000) && item.text.trim().length > 0 && text(item.translation,600) &&
    text(item.note,1000) && Number.isFinite(item.created)) &&
    new Set(state.sentences.map(item => item.id)).size === state.sentences.length;
};

const importBeforeLanguages = importData;
importData = async function (file) {
  const previous = db;
  await importBeforeLanguages(file);
  if (db !== previous) {
    wordQueue = [];
    wordRevealed = false;
    wordSeen = 0;
    sentenceDateFilter = 'all';
    sentenceQuery = '';
  }
};

window.LouieLanguageReady = true;
