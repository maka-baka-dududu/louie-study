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
const kanaLabels = {basic:'清音', voiced:'浊音与半浊音', contracted:'拗音', quiz:'认读练习', dictation:'默写'};
let kanaGroup = 'basic', kanaScript = 'both', kanaShowRomaji = true, kanaQuiz = null, kanaQuizReveal = false;
let kanaDictation = null, kanaDictationScope = 'basic', kanaDictationKata = false, kanaDictationFeedback = '';

function kanaRows(group) {
  return kanaGroups[group].map(([text, sounds]) => sounds.split(' ').map((sound, index) => {
    const kana = group === 'contracted' ? text + 'ゃゅょ'[index] : text[index];
    return sound === '-' ? null : [kana, sound];
  }));
}

function katakanaFor(text) {
  return Array.from(text, char => String.fromCodePoint(char.codePointAt(0) + 0x60)).join('');
}

function displayKana(text) {
  if (kanaScript === 'both') return text + ' · ' + katakanaFor(text);
  return kanaScript === 'kata' ? katakanaFor(text) : text;
}

function keepLanguageFocus(selector) {
  render();
  $(selector)?.focus();
}

function chooseKana(group) {
  if (!Object.hasOwn(kanaLabels, group)) return;
  kanaGroup = group;
  if (group === 'quiz' && !kanaQuiz) return nextKanaQuiz();
  if (group === 'dictation' && !kanaDictation) return nextKanaDictation();
  keepLanguageFocus('.kana-group [aria-pressed="true"]');
}

function selectKanaScript(script) {
  if (!['both','hira','kata'].includes(script)) return;
  kanaScript = script;
  kanaDictationFeedback = '';
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

function nextKanaDictation() {
  const choices = kanaRows(kanaDictationScope).flat().filter(item => item && item[0] !== kanaDictation?.[0]);
  if (kanaDictation) kanaDictationKata = !kanaDictationKata;
  kanaDictation = choices[Math.floor(Math.random() * choices.length)];
  kanaDictationFeedback = '';
  keepLanguageFocus('#kanaWritten');
}

function selectKanaDictationScope(scope) {
  if (!Object.hasOwn(kanaGroups, scope)) return;
  kanaDictationScope = scope;
  kanaDictation = null;
  nextKanaDictation();
}

function kanaDictationAnswer() {
  const symbol = kanaDictation[0];
  return kanaScript === 'kata' || (kanaScript === 'both' && kanaDictationKata) ? katakanaFor(symbol) : symbol;
}

function checkKanaDictation(event) {
  event.preventDefault();
  if (kanaDictationFeedback) return;
  const written = event.currentTarget.elements.written.value.normalize('NFKC').trim();
  if (!written) return;
  kanaDictationFeedback = written === kanaDictationAnswer() ? 'correct' : 'wrong';
  keepLanguageFocus('#kanaDictationNext');
}

function kanaDictationView() {
  const [symbol, sound] = kanaDictation;
  const answer = kanaDictationAnswer();
  const scriptName = answer === symbol ? '平假名' : '片假名';
  const rowHint = ['じ','ず'].includes(symbol) ? 'Z 行' : ['ぢ','づ'].includes(symbol) ? 'D 行' : '';
  return `<section class="card language-flash">
    <div class="actions language-tabs" aria-label="默写范围">
      ${Object.keys(kanaGroups).map(scope => languageButton(kanaLabels[scope],`selectKanaDictationScope('${scope}')`,scope === kanaDictationScope)).join('')}
    </div>
    <h2>默写${scriptName}</h2>
    ${kanaShowRomaji ? `<div class="kana-quiz-symbol" lang="ja-Latn">${sound}</div>` : ''}
    ${rowHint ? `<p class="muted">${rowHint}</p>` : !kanaShowRomaji && symbol === 'を' ? '<p class="muted">本题是读作 o 的助词。</p>' : ''}
    <button type="button" onclick="speakLanguage('${symbol}','ja-JP')">听发音</button>
    ${kanaDictationFeedback ? `<p class="language-answer" role="status">${kanaDictationFeedback === 'correct' ? '写对了' : '正确写法是'} <strong lang="ja">${answer}</strong></p>
      <div class="actions">
        ${kanaDictationFeedback === 'wrong' ? `<button type="button" onclick="kanaDictationFeedback='';keepLanguageFocus('#kanaWritten')">再写一次</button>` : ''}
        <button type="button" class="primary" id="kanaDictationNext" onclick="nextKanaDictation()">下一题</button>
      </div>` : `<form class="language-recall-form" onsubmit="checkKanaDictation(event)">
      <label for="kanaWritten">用日语输入法写出${scriptName}</label>
      <input id="kanaWritten" name="written" lang="ja" required maxlength="8" autocomplete="off" spellcheck="false" enterkeyhint="done">
      <button type="submit" class="primary">检查</button>
    </form>`}
  </section>`;
}

function kanaChartView() {
  const controls = `<div class="language-toolbar">
    <div class="actions language-tabs kana-script" aria-label="假名类型">
      ${languageButton('平片对照',"selectKanaScript('both')",kanaScript === 'both')}
      ${languageButton('平假名',"selectKanaScript('hira')",kanaScript === 'hira')}
      ${languageButton('片假名',"selectKanaScript('kata')",kanaScript === 'kata')}
    </div>
    ${kanaGroup === 'quiz' ? '' : `<button id="kanaRomaji" type="button" aria-pressed="${kanaShowRomaji}" onclick="toggleKanaRomaji()">罗马音 ${kanaShowRomaji?'开':'关'}</button>`}
  </div>
  <div class="actions language-tabs kana-group" aria-label="发音分类">
    ${Object.entries(kanaLabels).map(([key,name]) => languageButton(name,`chooseKana('${key}')`,key === kanaGroup)).join('')}
  </div>`;
  const title = '<div class="pagehead"><h1>五十音图</h1></div>';
  if (kanaGroup === 'dictation') return title + controls + kanaDictationView();
  if (kanaGroup === 'quiz' && kanaQuiz) {
    const [symbol, sound] = kanaQuiz;
    return title + controls + `<section class="card language-flash">
      <p class="muted">先读出假名，再核对罗马音。</p>
      <div class="kana-quiz-symbol" lang="ja">${displayKana(symbol)}</div>
      ${kanaQuizReveal ? `<p class="language-answer">${sound} <button onclick="speakLanguage('${symbol}','ja-JP')">听发音</button></p>`
        : '<button id="kanaQuizAnswer" class="primary" onclick="revealKanaQuiz()">显示读音</button>'}
      <button id="kanaQuizNext" onclick="nextKanaQuiz()">换一个</button>
    </section>`;
  }
  const rows = kanaRows(kanaGroup);
  return title + controls + `<section class="card kana-panel">
    <p class="muted">${kanaScript === 'both' ? '每格左边是平假名，右边是片假名。' : ''}点击假名听发音。${kanaGroup === 'basic' ? '「を」写作 wo，作助词时通常读 o。' : ''}</p>
    <div class="kana-chart ${kanaGroup === 'contracted' ? 'kana-chart-three' : ''}">
      ${rows.flatMap(row => row.length === 1 ? [...row,null,null,null,null] : row).map(item => {
        if (!item) return '<span class="kana-empty" aria-hidden="true"></span>';
        const [symbol, sound] = item;
        return `<button class="kana-cell" type="button" onclick="speakLanguage('${symbol}','ja-JP')" aria-label="${displayKana(symbol)}${kanaShowRomaji?' '+sound:''}，播放发音">
          <b lang="ja" class="${kanaScript === 'both' ? 'kana-pair' : ''}">${displayKana(symbol)}</b>${kanaShowRomaji?`<small>${sound}</small>`:''}</button>`;
      }).join('')}
    </div>
    <p class="language-source"><a href="https://classroomresources.sydney.jpf.go.jp/resources/hiragana-katakana-game/" target="_blank" rel="noopener noreferrer">日本国际交流基金假名练习 ↗</a></p>
  </section>`;
}

const wordBooks = {cet6:'六级', kaoyan:'考研', ielts:'雅思'};
const wordReviewIntervals = [1,3,7,14,30];
const wordMasteryLevel = 3;
const defaultWordGoal = 20;
const maxWordGoal = 200;
let wordData = null, wordDataStatus = '', wordBook = 'cet6', wordMode = 'review';
let wordQueue = [], wordSeen = 0, wordTesting = false, wordFeedback = null;
let wordTerm = '', wordLimit = 30, wordFilter = 'all';

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

function wordReview(book, word) {
  const reviews = languageRecords().reviews[book];
  return Object.hasOwn(reviews,word) ? reviews[word] : null;
}

function wordRecallLevel(review) {
  return review?.lastCorrect ? review.level : 0;
}

function wordIsCut(book, word) {
  return Object.hasOwn(languageRecords().wordPlans?.[book]?.cut || {}, word);
}

function wordPracticedOn(review) {
  return review?.practicedOn ?? (review?.lastCorrect === null ? review.due : review?.lastCorrect);
}

function dailyWordTask(book) {
  const goal = languageRecords().wordPlans?.[book]?.goal ?? defaultWordGoal;
  const date = today();
  const done = Object.values(languageRecords().reviews[book]).filter(review => wordPracticedOn(review) === date).length;
  return {goal, done};
}

function reviewableWords(book) {
  const due = [], fresh = [], retry = [], date = today();
  for (const entry of wordData[book]) {
    const [word] = entry;
    if (wordIsCut(book,word)) continue;
    const review = wordReview(book, word);
    if (!review) fresh.push(entry);
    else if (!wordRecallLevel(review) || review.due <= date) {
      (wordPracticedOn(review) === date ? retry : due).push(entry);
    }
  }
  return {due, fresh, retry};
}

function chooseWordBook(book) {
  if (!Object.hasOwn(wordBooks,book) || book === wordBook) return;
  wordBook = book;
  wordQueue = [];
  wordSeen = 0;
  wordTesting = false;
  wordFeedback = null;
  wordTerm = '';
  wordLimit = 30;
  keepLanguageFocus('.word-books [aria-pressed="true"]');
}

function chooseWordMode(mode) {
  wordMode = mode === 'list' ? 'list' : 'review';
  keepLanguageFocus('.word-modes [aria-pressed="true"]');
}

function startWordReview() {
  const {due, fresh, retry} = reviewableWords(wordBook);
  const {goal, done} = dailyWordTask(wordBook);
  const remaining = Math.max(0,goal-done);
  const pending = due.concat(fresh);
  wordQueue = remaining && pending.length
    ? pending.slice(0,Math.min(remaining,20))
    : due.concat(retry,fresh).slice(0,20);
  wordSeen = 0;
  nextWordPrompt();
}

function stopWordReview() {
  if (languageWriting) return;
  wordQueue = [];
  nextWordPrompt();
}

function nextWordPrompt(focus = true) {
  const entry = wordQueue[0];
  wordTesting = Boolean(entry && wordReview(wordBook,entry[0]));
  wordFeedback = null;
  if (focus) keepLanguageFocus(entry ? (wordTesting ? '#wordSpelling' : '#wordSpellStart') : '#wordStart');
}

function startWordSpelling() {
  wordTesting = true;
  keepLanguageFocus('#wordSpelling');
}

function advanceWord() {
  if (!wordFeedback) return;
  wordQueue.shift();
  wordSeen++;
  nextWordPrompt();
}

function scheduleWordRecall(previous, correct) {
  const date = today();
  if (!correct) return {level:0, due:date, lastCorrect:null};
  const level = wordRecallLevel(previous);
  if (level && (previous.lastCorrect >= date || previous.due > date)) return previous;
  const nextLevel = Math.min(wordReviewIntervals.length,level + 1);
  return {level:nextLevel, due:plusDay(wordReviewIntervals[nextLevel-1]), lastCorrect:date};
}

function checkWordSpelling(event) {
  event.preventDefault();
  const spelling = event.currentTarget.elements.spelling.value.normalize('NFKC').trim().toLowerCase()
    .replace(/[‘’]/g,"'").replace(/\s+/g,' ');
  if (spelling) void gradeWord(spelling === wordQueue[0]?.[0]);
}

let languageWriting = false;
async function saveWordRecord(record, key, value) {
  if (languageWriting) return false;
  const hadKey = Object.hasOwn(record,key);
  const previous = hadKey ? record[key] : undefined;
  if (value === undefined) delete record[key];
  else record[key] = value;
  languageWriting = true;
  let saved;
  try { saved = await save(); }
  finally {
    languageWriting = false;
    if (!saved) {
      if (hadKey) record[key] = previous;
      else delete record[key];
    }
  }
  return Boolean(saved);
}

function wordPlan(book) {
  const plans = languageRecords().wordPlans ??= {};
  return plans[book] ??= {};
}

async function saveDailyWordGoal(event) {
  event.preventDefault();
  const input = event.currentTarget.elements.goal;
  const goal = input.valueAsNumber, book = wordBook;
  if (!Number.isInteger(goal) || goal < 1 || goal > maxWordGoal || languageWriting) return;
  if (await saveWordRecord(wordPlan(book),'goal',goal) && page === 'englishWords' && wordBook === book) {
    keepLanguageFocus('#wordStart');
  }
}

async function toggleWordCut(word) {
  if (languageWriting || !wordData[wordBook].some(([entry]) => entry === word)) return;
  const book = wordBook, cut = wordIsCut(book,word);
  const exclusions = wordPlan(book).cut ??= {};
  if (!await saveWordRecord(exclusions,word,cut ? undefined : true)) return;
  if (book !== wordBook) return;
  if (!cut && wordQueue[0]?.[0] === word) {
    wordQueue.shift();
    if (wordFeedback) wordSeen++;
    const inReview = page === 'englishWords' && wordMode === 'review';
    nextWordPrompt(inReview);
    if (inReview) return;
  } else {
    if (!cut) wordQueue = wordQueue.filter(([entry]) => entry !== word);
  }
  if (page === 'englishWords') {
    render();
    const button = [...document.querySelectorAll('#wordList [data-word]')].find(item => item.dataset.word === word);
    (button || $('.word-filters [aria-pressed="true"]'))?.focus({preventScroll:true});
  }
}

async function gradeWord(correct) {
  const entry = wordQueue[0];
  if (!entry || !wordTesting || wordFeedback || languageWriting) return;
  const book = wordBook, queue = wordQueue, reviews = languageRecords().reviews[book], word = entry[0];
  if (wordIsCut(book,word)) return;
  const review = {...scheduleWordRecall(wordReview(book,word), correct), practicedOn:today()};
  if (!await saveWordRecord(reviews,word,review)) return;
  if (queue !== wordQueue) return;
  wordFeedback = {correct, review};
  if (page === 'englishWords' && wordMode === 'review') keepLanguageFocus('#wordNext');
}

function wordStatus(word) {
  if (wordIsCut(wordBook,word)) return 'cut';
  const review = wordReview(wordBook,word);
  if (wordRecallLevel(review) >= wordMasteryLevel) return 'mastered';
  return review ? 'learning' : 'new';
}

function selectWordFilter(filter) {
  wordFilter = filter;
  wordLimit = 30;
  keepLanguageFocus('.word-filters [aria-pressed="true"]');
}

function wordList() {
  const query = wordTerm.trim().toLowerCase();
  const visible = wordData[wordBook].filter(([word, , meaning]) => {
    const status = wordStatus(word);
    return (wordFilter === 'all' || status === wordFilter || (wordFilter === 'unmastered' && (status === 'new' || status === 'learning'))) &&
      (!query || word.includes(query) || meaning.includes(query));
  });
  const statusLabels = {mastered:'已背会', learning:'学习中', new:'未学', cut:'已斩掉'};
  return visible.slice(0,wordLimit).map(([word, phonetic, meaning]) => {
    const review = wordReview(wordBook,word), status = wordStatus(word);
    const nextDue = status !== 'cut' && wordRecallLevel(review) ? ` · ${review.due <= today() ? '待复习' : review.due + ' 复习'}` : '';
    return `<div class="language-list-row">
      <div class="word-list-heading"><span><strong lang="en">${esc(word)}</strong> ${phonetic?`<small>/${esc(phonetic)}/</small>`:''}</span>
        <small class="word-status" data-status="${status}">${statusLabels[status]}${nextDue}</small></div>
      <div class="word-list-heading"><p>${esc(meaning)}</p>
        <button type="button" data-word="${esc(word)}" onclick="toggleWordCut(this.dataset.word)" aria-label="${status === 'cut' ? '恢复' : '斩掉'} ${esc(word)}">${status === 'cut' ? '恢复复习' : '斩掉'}</button></div>
    </div>`;
  }).join('') + (visible.length > wordLimit ? '<button id="moreWords" onclick="moreWords()">显示更多</button>' : '') +
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
      ${languageButton('词表',"chooseWordMode('list')",wordMode === 'list')}
    </div>
  </div>`;
  if (wordMode === 'list') {
    const total = wordData[wordBook].length;
    let mastered = 0, cut = 0;
    for (const [word] of wordData[wordBook]) {
      const status = wordStatus(word);
      if (status === 'mastered') mastered++;
      if (status === 'cut') cut++;
    }
    return head + tabs + `<section class="card language-card">
      <div class="actions language-tabs word-filters" aria-label="掌握状态">
        ${languageButton('全部 ' + total,"selectWordFilter('all')",wordFilter === 'all')}
        ${languageButton('已背会 ' + mastered,"selectWordFilter('mastered')",wordFilter === 'mastered')}
        ${languageButton('未背会 ' + (total-mastered-cut),"selectWordFilter('unmastered')",wordFilter === 'unmastered')}
        ${languageButton('已斩掉 ' + cut,"selectWordFilter('cut')",wordFilter === 'cut')}
      </div>
      <label>搜索单词或中文释义<input type="search" maxlength="100" value="${esc(wordTerm)}" oninput="searchWordBook(this.value)"></label>
      <div id="wordList">${wordList()}</div>
    </section>`;
  }
  const {goal,done} = dailyWordTask(wordBook);
  const taskProgress = `今日 ${done} / ${goal} 词`;
  const entry = wordQueue[0];
  if (!entry) {
    const {due, fresh, retry} = reviewableWords(wordBook);
    const hasPending = due.length + fresh.length > 0;
    const startLabel = hasPending ? (done >= goal ? '继续加练' : done ? '继续今日任务' : '开始今日任务') : '巩固错词';
    return head + tabs + `<section class="card language-flash">
      <h2>${taskProgress}${done >= goal ? ' · 已完成' : ''}</h2>
      <progress class="word-progress" aria-label="今日任务进度" value="${Math.min(done,goal)}" max="${goal}"></progress>
      <p class="muted">到期复习 ${due.length} · 待学新词 ${fresh.length}${retry.length ? ' · 今日错词 ' + retry.length : ''}</p>
      ${hasPending || retry.length ? `<button class="primary" id="wordStart" onclick="startWordReview()">${startLabel}</button>` : '<p class="muted">今天没有待练单词。</p>'}
      <form class="word-goal-form" onsubmit="saveDailyWordGoal(event)">
        <label for="wordGoal">每日目标（新词＋复习）</label>
        <input id="wordGoal" type="number" name="goal" min="1" max="${maxWordGoal}" value="${goal}" required inputmode="numeric">
        <button type="submit">保存目标</button>
      </form>
      <p class="language-source"><a href="https://github.com/skywind3000/ECDICT" target="_blank" rel="noopener noreferrer">ECDICT 词库 ↗</a></p>
    </section>`;
  }
  const [word, phonetic, meaning] = entry;
  let exercise;
  if (wordFeedback) {
    const level = wordRecallLevel(wordFeedback.review);
    const result = !wordFeedback.correct ? '再练一次' : level >= wordMasteryLevel ? '拼对了 · 已背会' : `拼对了 · ${level} / ${wordMasteryLevel} 次`;
    exercise = `<p role="status">${result}</p>
      <div class="word-term" lang="en">${esc(word)}</div>
      ${phonetic ? `<p class="muted">/${esc(phonetic)}/</p>` : ''}
      ${wordFeedback.correct ? `<p class="muted">下次复习 ${wordFeedback.review.due}</p>` : ''}
      <button id="wordNext" class="primary" onclick="advanceWord()">下一个</button>`;
  } else if (wordTesting) {
    exercise = `<form class="language-recall-form" onsubmit="checkWordSpelling(event)">
      <label for="wordSpelling">根据释义默写单词 · ${word.length} 个字符</label>
      <input id="wordSpelling" name="spelling" lang="en" required maxlength="70" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" enterkeyhint="done">
      <div class="actions"><button type="button" onclick="gradeWord(false)">想不起来</button><button class="primary" type="submit">检查拼写</button></div>
    </form>`;
  } else {
    exercise = `<div class="word-term" lang="en">${esc(word)}</div>
      ${phonetic ? `<p class="muted">/${esc(phonetic)}/</p>` : ''}
      <button id="wordSpellStart" class="primary" onclick="startWordSpelling()">开始默写</button>`;
  }
  return head + tabs + `<section class="card language-flash">
    <small class="muted">${taskProgress} · 本组 ${wordSeen+1} / ${wordSeen+wordQueue.length}</small>
    <p class="language-answer">${esc(meaning)}</p>
    ${exercise}
    <div class="actions word-session-actions">
      <button type="button" data-word="${esc(word)}" onclick="toggleWordCut(this.dataset.word)">斩掉此词</button>
      <button type="button" onclick="stopWordReview()">结束本组</button>
    </div>
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
  const record = value => value && typeof value === 'object' && !Array.isArray(value);
  const validWord = word => /^[a-z][a-z' -]{0,69}$/.test(word);
  if (state.wordPlans !== undefined && (!record(state.wordPlans) || !Object.entries(state.wordPlans).every(([book,plan]) =>
    Object.hasOwn(wordBooks,book) && record(plan) &&
    (plan.goal === undefined || (Number.isInteger(plan.goal) && plan.goal >= 1 && plan.goal <= maxWordGoal)) &&
    (plan.cut === undefined || (record(plan.cut) && Object.keys(plan.cut).length <= 15000 &&
      Object.entries(plan.cut).every(([word,cut]) => validWord(word) && cut === true)))))) return false;
  return Object.keys(wordBooks).every(book => {
    const reviews = state.reviews[book];
    if (!reviews || typeof reviews !== 'object' || Array.isArray(reviews)) return false;
    const entries = Object.entries(reviews);
    return entries.length <= 15000 && entries.every(([word, item]) => validWord(word) && item &&
      Number.isInteger(item.level) && item.level >= 0 && item.level <= wordReviewIntervals.length && scheduleDate(item.due) &&
      (item.practicedOn === undefined || scheduleDate(item.practicedOn)) &&
      (item.lastCorrect === undefined || (item.lastCorrect === null ? item.level === 0 :
        item.level > 0 && scheduleDate(item.lastCorrect) && item.lastCorrect < item.due)));
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
    wordTesting = false;
    wordFeedback = null;
    wordSeen = 0;
    sentenceDateFilter = 'all';
    sentenceQuery = '';
  }
};

window.LouieLanguageReady = true;
