'use strict';

const tripTemplateStages = [
  {
    title: '海湾四国',
    days: [
      ['广州 → 迪拜', '抵达后入住，第一晚提前订。', '迪拜 Bur Dubai 地铁站附近'],
      ['迪拜', '早上逛 Al Fahidi 老城、乘渡船去集市。午后室内休息，傍晚去市中心。', '迪拜'],
      ['迪拜 → 阿布扎比', '城际巴士转场，下午晚些看谢赫扎耶德大清真寺。', '阿布扎比'],
      ['阿布扎比 → 马斯喀特', '飞马斯喀特，傍晚走穆特拉海滨和集市。', '马斯喀特穆特拉'],
      ['马斯喀特', '上午看苏丹卡布斯大清真寺，傍晚逛老城和海滨。', '马斯喀特'],
      ['瓦迪沙卜一日游', '视天气和体力拼团出行。太热就改去山区或留在市区。', '马斯喀特'],
      ['马斯喀特 → 多哈', '飞多哈，晚上逛瓦其夫集市。', '多哈集市或地铁附近'],
      ['多哈', '伊斯兰艺术博物馆和海滨步道。', '多哈'],
      ['多哈 → 利雅得', '飞利雅得，傍晚看马斯马克堡和老城。', '利雅得'],
      ['利雅得', '半天去德拉伊耶，半天休息、补给。', '利雅得']
    ]
  },
  {
    title: '约旦与埃及',
    days: [
      ['利雅得 → 安曼', '飞安曼。航班合适的话下午去城堡山。', '安曼市中心或 Jabal Amman'],
      ['安曼 → 死海 → 佩特拉', '拼车或约接送，中途停死海。', '瓦迪穆萨，靠佩特拉入口'],
      ['佩特拉', '开门就进，走蛇道和宝库。天气和体力允许再上修道院。', '瓦迪穆萨'],
      ['佩特拉 → 瓦迪拉姆', '坐吉普车进沙漠。确认接送、吉普车、晚餐和早餐是否包含在团费里。', '瓦迪拉姆营地'],
      ['瓦迪拉姆 → 安曼', '白天回安曼，给次日国际航班留余量。', '安曼'],
      ['安曼 → 开罗', '飞开罗，入住后吃饭休息。', '开罗 Downtown 或吉萨'],
      ['吉萨', '早上看金字塔和狮身人面像，下午看大埃及博物馆。', '开罗'],
      ['开罗 → 卢克索', '按班次比飞机和火车，到得早就去卡纳克神庙。', '卢克索东岸'],
      ['卢克索 → 开罗', '早上逛帝王谷和哈特谢普苏特神庙，下午或晚上回开罗。', '开罗'],
      ['亚历山大一日游', '从开罗往返，逛图书馆和海滨。如卢克索回程推迟，将这天留作转场。', '开罗']
    ]
  },
  {
    title: '格鲁吉亚与土耳其',
    days: [
      ['开罗 → 第比利斯', '优先看联程，整天留给飞行和转机。', '第比利斯自由广场附近'],
      ['卡兹别克', '拼车往返，去圣三一教堂看山景。天气不好就和明天对调。', '第比利斯'],
      ['西格纳吉', '当天往返。想休息可留在第比利斯逛老城、坐缆车。', '第比利斯'],
      ['第比利斯 → 伊斯坦布尔', '飞伊斯坦布尔，傍晚沿海边散步。', '伊斯坦布尔 Sirkeci'],
      ['伊斯坦布尔', '上午看圣索菲亚大教堂和蓝色清真寺，下午坐公共渡轮去卡德柯伊。', '伊斯坦布尔'],
      ['伊斯坦布尔 → 维也纳', '飞维也纳进入申根区，视到达时间散步逛老城。', '维也纳中央站或地铁沿线']
    ]
  },
  {
    title: '奥地利、斯洛伐克、匈牙利、波兰与捷克',
    days: [
      ['维也纳', '美泉宫和老城各半天。也可用博物馆替换美泉宫。', '维也纳'],
      ['维也纳 → 萨尔茨堡', '上午坐火车，下午逛老城和米拉贝尔花园。', '萨尔茨堡'],
      ['哈尔施塔特一日游', '从萨尔茨堡往返，提前查好巴士或火车接渡轮的末班回程。', '萨尔茨堡'],
      ['萨尔茨堡 → 布拉迪斯拉发', '铁路转场，下午逛老城和城堡。', '布拉迪斯拉发'],
      ['布拉迪斯拉发 → 布达佩斯', '坐火车，晚上看多瑙河和国会大厦夜景。', '布达佩斯佩斯一侧'],
      ['布达佩斯', '上午去渔人堡和布达城堡区，下午选温泉或咖啡馆。', '布达佩斯'],
      ['布达佩斯', '留时间休息、洗衣补给，逛中央市场和犹太区。', '布达佩斯'],
      ['布达佩斯 → 克拉科夫', '比较火车和长途巴士，整天留给转场。', '克拉科夫'],
      ['克拉科夫', '中央广场、瓦维尔城堡、卡齐米日街区。', '克拉科夫'],
      ['克拉科夫 → 华沙', '上午坐火车，下午逛老城。', '华沙中央站附近'],
      ['华沙 → 布拉格', '比较铁路与含行李、机场交通的航班总价。', '布拉格'],
      ['布拉格', '早上走查理大桥，接城堡区，傍晚回老城广场。', '布拉格'],
      ['布拉格机动日', '小城、河边、咖啡馆，或用来接住前几天的延误。', '布拉格']
    ]
  },
  {
    title: '荷兰、比利时、卢森堡与法国',
    days: [
      ['布拉格 → 阿姆斯特丹', '比较廉航和铁路。抵达后只安排运河散步。', '中央站或 Sloterdijk 附近'],
      ['阿姆斯特丹', '逛运河、约旦区和街市。', '阿姆斯特丹'],
      ['阿姆斯特丹博物馆', '荷兰国立博物馆和梵高博物馆选一个，提前看预约。', '阿姆斯特丹'],
      ['海牙 → 鹿特丹', '经海牙去鹿特丹看中央市场和立体方块屋，晚上回住宿地。', '阿姆斯特丹'],
      ['阿姆斯特丹 → 布鲁塞尔', '铁路转场，下午去大广场。', '布鲁塞尔'],
      ['布鲁塞尔或布鲁日', '在布鲁塞尔慢逛，或加一个布鲁日当天往返。', '布鲁塞尔'],
      ['布鲁塞尔 → 卢森堡', '坐火车，下午逛老城和峡谷步道。', '卢森堡火车站附近'],
      ['卢森堡 → 巴黎', '坐火车，傍晚走塞纳河。', '巴黎地铁沿线'],
      ['巴黎', '卢浮宫、杜乐丽花园，按开放日及预约时间调整。', '巴黎'],
      ['巴黎', '铁塔、塞纳河和蒙马特，按体力选片区。', '巴黎'],
      ['巴黎机动日', '奥赛、凡尔赛、逛街三选一。', '巴黎']
    ]
  },
  {
    title: '西班牙与返程',
    days: [
      ['巴黎 → 马德里', '按原帖顺序先去马德里。比较含行李的航班价，晚上逛太阳门和主广场。', '马德里'],
      ['马德里', '上午去王宫或丽池公园，午后去普拉多博物馆。', '马德里'],
      ['马德里 → 巴塞罗那', '搭高铁，下午逛哥特区。', 'Sants 车站或扩展区'],
      ['巴塞罗那', '预约圣家堂，下午在高迪住宅和海边中选一个。', '巴塞罗那'],
      ['巴塞罗那 → 广州', '按下午或夜间航班预留。若马德里回程更合适，可交换西班牙两站。', '航班上'],
      ['抵达广州', '具体到达时间以实际联程为准。', '广州']
    ]
  }
];

const tripModes = {
  flight: { label: '飞行', color: '#a991ff', dash: [5, 5] },
  rail: { label: '铁路', color: '#55dec7', dash: [] },
  road: { label: '公路', color: '#f1ba6c', dash: [] },
  visit: { label: '游览', color: '#79baff', dash: [2, 4] },
  rest: { label: '机动', color: '#b6bdca', dash: [2, 4] }
};
const tripBudgetLabels = ['大交通与行李', '住宿', '吃饭与市内交通', '签证、保险、门票与当地团', '旅途备用金'];
const tripCoordinates = {
  广州: [23.13, 113.26], 迪拜: [25.20, 55.27], 阿布扎比: [24.45, 54.38],
  马斯喀特: [23.59, 58.41], 瓦迪沙卜: [22.84, 59.25], 多哈: [25.29, 51.53],
  利雅得: [24.71, 46.68], 德拉伊耶: [24.73, 46.58], 安曼: [31.95, 35.93],
  死海: [31.72, 35.58], 佩特拉: [30.33, 35.44], 瓦迪拉姆: [29.57, 35.42],
  开罗: [30.04, 31.24], 吉萨: [29.98, 31.13], 卢克索: [25.69, 32.64], 亚历山大: [31.20, 29.92],
  第比利斯: [41.72, 44.79], 卡兹别克: [42.66, 44.64], 西格纳吉: [41.62, 45.92],
  伊斯坦布尔: [41.01, 28.98], 维也纳: [48.21, 16.37], 萨尔茨堡: [47.80, 13.05],
  哈尔施塔特: [47.56, 13.65], 布拉迪斯拉发: [48.15, 17.11], 布达佩斯: [47.50, 19.04],
  克拉科夫: [50.06, 19.94], 华沙: [52.23, 21.01], 布拉格: [50.08, 14.44],
  阿姆斯特丹: [52.37, 4.90], 海牙: [52.08, 4.31], 鹿特丹: [51.92, 4.48],
  布鲁塞尔: [50.85, 4.35], 布鲁日: [51.21, 3.22], 卢森堡: [49.61, 6.13],
  巴黎: [48.86, 2.35], 马德里: [40.42, -3.70], 巴塞罗那: [41.39, 2.17]
};
const tripTemplateRoutes = [
  '广州/迪拜','迪拜','迪拜/阿布扎比','阿布扎比/马斯喀特','马斯喀特','马斯喀特/瓦迪沙卜/马斯喀特',
  '马斯喀特/多哈','多哈','多哈/利雅得','利雅得/德拉伊耶/利雅得',
  '利雅得/安曼','安曼/死海/佩特拉','佩特拉','佩特拉/瓦迪拉姆','瓦迪拉姆/安曼',
  '安曼/开罗','开罗/吉萨/开罗','开罗/卢克索','卢克索/开罗','开罗/亚历山大/开罗',
  '开罗/第比利斯','第比利斯/卡兹别克/第比利斯','第比利斯/西格纳吉/第比利斯',
  '第比利斯/伊斯坦布尔','伊斯坦布尔','伊斯坦布尔/维也纳',
  '维也纳','维也纳/萨尔茨堡','萨尔茨堡/哈尔施塔特/萨尔茨堡','萨尔茨堡/维也纳/布拉迪斯拉发',
  '布拉迪斯拉发/布达佩斯','布达佩斯','布达佩斯','布达佩斯/克拉科夫','克拉科夫','克拉科夫/华沙','华沙/布拉格','布拉格','布拉格',
  '布拉格/阿姆斯特丹','阿姆斯特丹','阿姆斯特丹','阿姆斯特丹/海牙/鹿特丹/阿姆斯特丹',
  '阿姆斯特丹/布鲁塞尔','布鲁塞尔','布鲁塞尔/卢森堡','卢森堡/巴黎','巴黎','巴黎','巴黎',
  '巴黎/马德里','马德里','马德里/巴塞罗那','巴塞罗那','巴塞罗那/广州','广州'
];
const tripFlightDays = new Set([1,4,7,9,11,16,21,24,26,40,51,55]);
const tripRailDays = new Set([18,19,28,29,30,31,34,36,37,43,44,46,47,53]);
const tripRoadDays = new Set([3,6,12,14,15,20,22,23]);
const tripRestDays = new Set([33,39,50,56]);

function defaultTravelPlan() {
  let index = 0;
  return {
    title: '亚欧非大环线', start: '2027-06-05',
    budget: [15000, 9000, 7000, 5000, 4000],
    stages: tripTemplateStages.map(stage => stage.title),
    days: tripTemplateStages.flatMap((stage, group) => stage.days.map(([title, activity, lodging]) => {
      const id = ++index;
      const mode = tripFlightDays.has(id) ? 'flight' : tripRailDays.has(id) ? 'rail' :
        tripRoadDays.has(id) ? 'road' : tripRestDays.has(id) ? 'rest' : 'visit';
      const points = tripTemplateRoutes[id - 1].split('/').map(name => {
        const [lat, lng] = tripCoordinates[name];
        return { name, lat, lng };
      });
      return {id: 'day-' + id, group, title, activity, lodging, mode, points};
    }))
  };
}

function validTravelPlan(plan) {
  const str = (value, max) => typeof value === 'string' && value.length <= max;
  const point = p => p && str(p.name, 80) && p.name.trim() && Number.isFinite(p.lat) && Math.abs(p.lat) <= 90 &&
    Number.isFinite(p.lng) && Math.abs(p.lng) <= 180;
  return !!(plan && str(plan.title, 80) && plan.title.trim() && window.LouieTravelModel.date(plan.start) &&
    Array.isArray(plan.budget) && plan.budget.length === tripBudgetLabels.length &&
    plan.budget.every(n => Number.isInteger(n) && n >= 0 && n <= 1000000) &&
    Array.isArray(plan.stages) && plan.stages.length === tripTemplateStages.length &&
    plan.stages.every(name => str(name, 80) && name.trim()) &&
    Array.isArray(plan.days) && plan.days.length <= 180 && plan.days.every(d =>
      d && window.LouieTravelModel.id(d.id) && Number.isInteger(d.group) && d.group >= 0 && d.group < plan.stages.length &&
      str(d.title, 100) && d.title.trim() && str(d.activity, 1600) && str(d.lodging, 160) &&
      Object.hasOwn(tripModes, d.mode) && Array.isArray(d.points) && d.points.length <= 12 && d.points.every(point)) &&
    new Set(plan.days.map(d => d.id)).size === plan.days.length &&
    plan.days.every((d, i) => !i || plan.days[i - 1].group <= d.group));
}

const tripDefault = defaultTravelPlan();
let tripGroup = 'all', tripMode = 'all', tripSelected = 'day-1', tripSaving = false;
const getTravelPlan = () => db.travelPlan ?? tripDefault;
const tripMoney = n => '¥' + n.toLocaleString('zh-CN');

function tripDate(start, offset) {
  const date = new Date(start + 'T00:00:00Z');
  date.setUTCDate(date.getUTCDate() + offset);
  return (date.getUTCMonth() + 1) + ' 月 ' + date.getUTCDate() + ' 日';
}

function filteredTripDays(plan = getTravelPlan()) {
  return plan.days.map((day, index) => ({...day, index})).filter(day =>
    (tripGroup === 'all' || day.group === tripGroup) && (tripMode === 'all' || day.mode === tripMode));
}

function sendTripMap(focus = false) {
  if (page !== 'travelPlan' || !travelIsReady) return;
  const days = filteredTripDays().filter(day => day.points.length).map(day => ({
    id: day.id, mode: day.mode, points: day.points, ...tripModes[day.mode]
  }));
  sendTravel({kind: 'plan-route', days, selected: tripSelected, focus});
}

function renderTravelPlan() {
  $('#view').innerHTML = `
    <article class="trip-plan" id="tripPlanner">
      <header class="trip-header">
        <div><h1 id="tripTitle"></h1><p id="tripSubtitle" class="muted"></p></div>
        <div class="trip-actions"><button type="button" id="tripSettings">计划与预算</button>
          <button type="button" class="primary" id="tripAdd">＋ 新增一天</button></div>
      </header>
      <div class="trip-filters">
        <label>行程分段 <select id="tripGroup"></select></label>
        <div id="tripModes" class="trip-modes" role="group" aria-label="按活动类型筛选"></div>
      </div>
      <div class="trip-layout">
        <section class="trip-map-card" aria-label="旅行星球路线">
          <div class="trip-map-wrap"><p id="travelFrameLoading" class="travel-frame-loading">正在加载路线地图…</p></div>
          <div class="trip-map-caption"><span>拖动地球，或点城市和日程定位。路线为示意。</span>
            <div class="trip-map-actions">
              <button type="button" id="tripZoomOut" aria-label="缩小地图">−</button>
              <button type="button" id="tripZoomIn" aria-label="放大地图">＋</button>
              <button type="button" id="tripOverview">全段视角</button>
            </div></div>
          <div id="tripDetail" class="trip-detail" aria-live="polite"></div>
        </section>
        <section class="trip-list-panel" aria-label="每日行程">
          <div class="trip-list-heading"><h2>每日行程</h2><span id="tripCount" class="muted"></span></div>
          <div id="tripList" class="trip-list"></div>
        </section>
      </div>
      <details class="trip-card trip-booking">
        <summary>预订提示与资料</summary>
        <ul>
          <li>先核广州往返、海湾短途、开罗到第比利斯与伊斯坦布尔到维也纳的含行李总价。</li>
          <li>先订首晚、瓦迪拉姆营地和接送，以及 7 月阿姆斯特丹、巴黎、巴塞罗那合预算的可取消房。</li>
          <li>申根住宿证明覆盖整个停留期。买不可退款的票前，复核各国入境规定和领事提醒。</li>
        </ul>
        <p class="trip-links"><a href="https://xhslink.com/o/2WTjkhTMUdn" target="_blank" rel="noopener noreferrer">路线原帖</a>
        <a href="https://home-affairs.ec.europa.eu/document/download/99f6ef02-bd70-4c1e-bc35-b780bea8c9da_en" target="_blank" rel="noopener noreferrer">申根材料清单</a>
        <a href="https://cs.mfa.gov.cn/aqtx/" target="_blank" rel="noopener noreferrer">领事提醒</a></p>
      </details>
    </article>`;
  $('#tripSettings').onclick = openTripSettings;
  $('#tripAdd').onclick = () => openTripDay();
  for (const [id, direction] of [['tripZoomOut', -1], ['tripZoomIn', 1]]) {
    $('#' + id).onclick = () => {
      if (travelIsReady) sendTravel({kind:'plan-zoom', direction});
    };
  }
  $('#tripOverview').onclick = () => { tripSelected = ''; refreshTripPlanner({focus: true}); };
  $('#tripGroup').onchange = e => {
    tripGroup = e.target.value === 'all' ? 'all' : Number(e.target.value);
    tripSelected = '';
    refreshTripPlanner({focus: true});
  };
  $('#tripModes').onclick = e => {
    const button = e.target.closest('[data-mode]');
    if (!button) return;
    tripMode = button.dataset.mode;
    if (!filteredTripDays().some(d => d.id === tripSelected)) tripSelected = '';
    refreshTripPlanner();
    $('#tripModes').querySelector('[aria-pressed=true]')?.focus();
  };
  $('#tripList').onclick = e => {
    const button = e.target.closest('[data-day]');
    if (button) selectTripDay(button.dataset.day, true);
  };
  refreshTripPlanner();
  mountTravelFrame($('.trip-map-wrap'), 'plan');
}

function refreshTripPlanner({focus = false} = {}) {
  const plan = getTravelPlan();
  const days = filteredTripDays(plan);
  const active = days.find(d => d.id === tripSelected);
  const budget = plan.budget.reduce((sum, value) => sum + value, 0);
  $('#tripTitle').textContent = plan.title;
  $('#tripSubtitle').textContent = '拟于 ' + plan.start.slice(0, 4) + ' 年 ' + tripDate(plan.start, 0) + '出发 · ' +
    plan.days.length + ' 天 · 预算 ' + tripMoney(budget);
  const group = $('#tripGroup');
  group.innerHTML = '<option value="all">全程</option>' +
    plan.stages.map((name, i) => `<option value="${i}">${esc(name)}</option>`).join('');
  group.value = tripGroup;
  $('#tripModes').innerHTML = [['all', {label: '全部'}], ...Object.entries(tripModes)].map(([key, mode]) =>
    `<button type="button" data-mode="${key}" aria-pressed="${tripMode === key}">${mode.color ?
      `<i style="--trip-color:${mode.color}" aria-hidden="true"></i>` : ''}${mode.label}</button>`).join('');
  $('#tripCount').textContent = days.length + ' 天';
  $('#tripList').innerHTML = days.length ? days.map(day => {
    const mode = tripModes[day.mode];
    return `<button type="button" class="trip-day-button" data-day="${day.id}" aria-pressed="${day.id === tripSelected}" style="--trip-color:${mode.color}">
      <span class="trip-day-number">D${day.index + 1}</span><span><strong>${esc(day.title)}</strong><small>${tripDate(plan.start, day.index)}</small></span>
      <span class="trip-tag">${mode.label}</span></button>`;
  }).join('') : '<p class="muted trip-no-results">这个筛选范围内没有日程。</p>';
  const detail = $('#tripDetail');
  detail.innerHTML = active ? `<div class="trip-detail-head"><h2>${esc(active.title)}</h2><button type="button" id="tripEditDay">编辑这一天</button></div>
    <p>${esc(active.activity || '暂无安排。')}</p>
    <p class="muted">住宿 · ${esc(active.lodging || '待定')}</p>
    <p class="trip-stop-line">${active.points.length ? active.points.map(p => esc(p.name)).join(' → ') : '尚未设置地图地点'}</p>
    ` : '<p class="muted">点击某一天，查看当天安排、住宿和地图路线。</p>';
  if (active) $('#tripEditDay').onclick = () => openTripDay(active.id);
  sendTripMap(focus);
}

function selectTripDay(id, fromList = false) {
  if (!filteredTripDays().some(day => day.id === id)) return;
  tripSelected = id;
  refreshTripPlanner({focus: true});
  const button = $('#tripList').querySelector('[aria-pressed=true]');
  if (fromList) button?.focus({preventScroll: true});
  if (button && !fromList) {
    const list = $('#tripList');
    const offset = button.getBoundingClientRect().top - list.getBoundingClientRect().top;
    if (offset < 0 || offset + button.offsetHeight > list.clientHeight) list.scrollTop += offset;
  }
}

async function saveTripPlan(next, button, applySelection) {
  if (tripSaving) return;
  if (!validTravelPlan(next)) { toast('请检查标题、日期、地点或预算填写。'); return; }
  tripSaving = true;
  button.disabled = true;
  try {
    await travelCommit(null, next);
    applySelection?.();
    closeModal();
    refreshTripPlanner({focus: true});
    toast('旅行计划已保存');
  } catch (error) {
    toast('计划未保存：' + error.message);
  } finally {
    tripSaving = false;
    button.disabled = false;
  }
}

function openTripSettings() {
  const plan = getTravelPlan();
  show(`<h2>计划与预算</h2><form id="tripSettingsForm" class="trip-form">
    <label>计划名称<input name="title" required maxlength="80" value="${esc(plan.title)}"></label>
    <label>出发日期<input type="date" name="start" required max="9998-12-31" value="${plan.start}"></label>
    <details><summary>修改分段名称</summary>${plan.stages.map((name, i) =>
      `<label>第 ${i + 1} 段<input name="stage${i}" maxlength="80" required value="${esc(name)}"></label>`).join('')}</details>
    <div class="formgrid">${tripBudgetLabels.map((label, i) =>
      `<label>${label}（元）<input type="number" name="money${i}" value="${plan.budget[i]}" required min="0" max="1000000"></label>`).join('')}</div>
    <p class="muted">修改保存在当前设备，并随整站备份导出。</p>
    <button type="submit" class="primary">保存计划设置</button>
  </form>`);
  $('#tripSettingsForm').onsubmit = e => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    saveTripPlan({...plan, title: data.get('title').trim(), start: data.get('start'),
      budget: tripBudgetLabels.map((_, i) => Number(data.get('money' + i))),
      stages: plan.stages.map((_, i) => data.get('stage' + i).trim())}, form.querySelector('[type=submit]'));
  };
}

function parseTripPoints(value, known) {
  const lines = value.split('\n').map(line => line.trim()).filter(Boolean);
  if (lines.length > 12) throw Error('每天最多设置 12 个地图地点。');
  return lines.map(line => {
    if (known.has(line)) return known.get(line);
    const match = /^([^|]+)\|\s*(-?\d+(?:\.\d+)?)\s*[,，]\s*(-?\d+(?:\.\d+)?)$/.exec(line);
    if (match && match[1].trim().length <= 80 && Math.abs(+match[2]) <= 90 && Math.abs(+match[3]) <= 180) {
      return {name: match[1].trim(), lat: +match[2], lng: +match[3]};
    }
    throw Error('地图地点“' + line.slice(0, 40) + '”需要填写有效坐标。');
  });
}

function openTripDay(id) {
  const plan = getTravelPlan();
  const index = plan.days.findIndex(day => day.id === id);
  const selectedGroup = plan.days.find(day => day.id === tripSelected)?.group;
  const day = plan.days[index] ?? {group: tripGroup === 'all' ? selectedGroup ?? 0 : tripGroup, title: '', activity: '', lodging: '', mode: 'visit', points: []};
  if (!id && plan.days.length >= 180) { toast('这份计划最多安排 180 天。'); return; }
  const known = new Map(Object.entries(tripCoordinates).map(([name, [lat, lng]]) => [name, {name, lat, lng}]));
  const routeText = day.points.map(point => {
    const original = known.get(point.name);
    return original?.lat === point.lat && original?.lng === point.lng ? point.name : `${point.name} | ${point.lat}, ${point.lng}`;
  }).join('\n');
  show(`<h2>${id ? '编辑 D' + (index + 1) : '新增一天'}</h2><form id="tripDayForm" class="trip-form">
    <label>当天标题<input name="title" required maxlength="100" value="${esc(day.title)}"></label>
    <div class="formgrid"><label>所属分段<select name="group">${plan.stages.map((name, i) =>
      `<option value="${i}"${i === day.group ? ' selected' : ''}>${esc(name)}</option>`).join('')}</select></label>
    <label>颜色类别<select name="mode">${Object.entries(tripModes).map(([key, mode]) =>
      `<option value="${key}"${key === day.mode ? ' selected' : ''}>${mode.label}</option>`).join('')}</select></label></div>
    <label>当天安排<textarea name="activity" rows="3" maxlength="1600">${esc(day.activity)}</textarea></label>
    <label>住宿<input name="lodging" maxlength="160" value="${esc(day.lodging)}"></label>
    <label>地图地点（每行一站）<textarea name="points" rows="3" maxlength="1800" aria-describedby="tripPointHelp">${esc(routeText)}</textarea></label>
    <p class="muted" id="tripPointHelp">已有地点直接填城市名。新地点填「名称 | 纬度, 经度」，地图会按填写顺序连线。</p>
    <div class="trip-add-city"><label>选用路线城市 <select name="city"><option value="">选择城市</option>${[...known.keys()].map(city =>
      `<option value="${esc(city)}">${esc(city)}</option>`).join('')}</select></label><button type="button" id="tripInsertCity">加入地点</button></div>
    <p class="trip-form-error" role="alert"></p>
    <div class="trip-actions">
      <button type="submit" class="primary">保存当天</button>
      ${id ? `<button type="button" data-shift="-1"${plan.days[index - 1]?.group !== day.group ? ' disabled' : ''}>上移一天</button>
      <button type="button" data-shift="1"${plan.days[index + 1]?.group !== day.group ? ' disabled' : ''}>下移一天</button>
      <button type="button" id="tripRemoveDay">删除当天</button>` : ''}
    </div>
  </form>`);
  const form = $('#tripDayForm');
  $('#tripInsertCity').onclick = () => {
    const city = form.elements.city.value;
    if (city) form.elements.points.value = [form.elements.points.value.trim(), city].filter(Boolean).join('\n');
  };
  form.onsubmit = e => {
    e.preventDefault();
    const data = new FormData(form);
    try {
      const updated = {id: id || uid(), group: Number(data.get('group')), title: data.get('title').trim(),
        mode: data.get('mode'), activity: data.get('activity').trim(), lodging: data.get('lodging').trim(),
        points: parseTripPoints(data.get('points'), known)};
      const days = [...plan.days];
      if (id && day.group === updated.group) days[index] = updated;
      else {
        if (id) days.splice(index, 1);
        const nextGroup = days.findIndex(d => d.group > updated.group);
        days.splice(nextGroup < 0 ? days.length : nextGroup, 0, updated);
      }
      saveTripPlan({...plan, days}, form.querySelector('[type=submit]'), () => {
        if (tripGroup !== 'all') tripGroup = updated.group;
        if (tripMode !== 'all') tripMode = updated.mode;
        tripSelected = updated.id;
      });
    } catch (error) {
      form.querySelector('.trip-form-error').textContent = error.message;
    }
  };
  form.querySelectorAll('[data-shift]').forEach(button => button.onclick = () => {
    const days = [...plan.days], other = index + Number(button.dataset.shift);
    [days[index], days[other]] = [days[other], days[index]];
    saveTripPlan({...plan, days}, button);
  });
  const remove = $('#tripRemoveDay');
  if (remove) remove.onclick = () => {
    if (confirm('删除这一天？后续日期会依次前移。')) {
      saveTripPlan({...plan, days: plan.days.filter(d => d.id !== id)}, remove, () => {
        tripSelected = '';
      });
    }
  };
}
window.LouieTravelPlanReady = true;
