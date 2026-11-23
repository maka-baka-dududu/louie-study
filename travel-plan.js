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
  广州: [23.13, 113.26, '中国'], 迪拜: [25.20, 55.27, '阿联酋'], 阿布扎比: [24.45, 54.38, '阿联酋'],
  马斯喀特: [23.59, 58.41, '阿曼'], 瓦迪沙卜: [22.84, 59.25, '阿曼'], 多哈: [25.29, 51.53, '卡塔尔'],
  利雅得: [24.71, 46.68, '沙特阿拉伯'], 德拉伊耶: [24.73, 46.58, '沙特阿拉伯'], 安曼: [31.95, 35.93, '约旦'],
  死海: [31.72, 35.58, '约旦'], 佩特拉: [30.33, 35.44, '约旦'], 瓦迪拉姆: [29.57, 35.42, '约旦'],
  开罗: [30.04, 31.24, '埃及'], 吉萨: [29.98, 31.13, '埃及'], 卢克索: [25.69, 32.64, '埃及'], 亚历山大: [31.20, 29.92, '埃及'],
  第比利斯: [41.72, 44.79, '格鲁吉亚'], 卡兹别克: [42.66, 44.64, '格鲁吉亚'], 西格纳吉: [41.62, 45.92, '格鲁吉亚'],
  伊斯坦布尔: [41.01, 28.98, '土耳其'], 维也纳: [48.21, 16.37, '奥地利'], 萨尔茨堡: [47.80, 13.05, '奥地利'],
  哈尔施塔特: [47.56, 13.65, '奥地利'], 布拉迪斯拉发: [48.15, 17.11, '斯洛伐克'], 布达佩斯: [47.50, 19.04, '匈牙利'],
  克拉科夫: [50.06, 19.94, '波兰'], 华沙: [52.23, 21.01, '波兰'], 布拉格: [50.08, 14.44, '捷克'],
  阿姆斯特丹: [52.37, 4.90, '荷兰'], 海牙: [52.08, 4.31, '荷兰'], 鹿特丹: [51.92, 4.48, '荷兰'],
  布鲁塞尔: [50.85, 4.35, '比利时'], 布鲁日: [51.21, 3.22, '比利时'], 卢森堡: [49.61, 6.13, '卢森堡'],
  巴黎: [48.86, 2.35, '法国'], 马德里: [40.42, -3.70, '西班牙'], 巴塞罗那: [41.39, 2.17, '西班牙']
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
    templateKey: 'original', title: '亚欧非大环线', start: '2027-06-05',
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
  return !!(plan && str(plan.title, 80) && plan.title.trim() && (plan.start === '' || window.LouieTravelModel.date(plan.start)) &&
    Array.isArray(plan.budget) && plan.budget.length === tripBudgetLabels.length &&
    plan.budget.every(n => Number.isInteger(n) && n >= 0 && n <= 1000000) &&
    Array.isArray(plan.stages) && plan.stages.length >= 1 && plan.stages.length <= 12 &&
    plan.stages.every(name => str(name, 80) && name.trim()) &&
    Array.isArray(plan.days) && plan.days.length <= 180 && plan.days.every(d =>
      d && window.LouieTravelModel.id(d.id) && Number.isInteger(d.group) && d.group >= 0 && d.group < plan.stages.length &&
      str(d.title, 100) && d.title.trim() && str(d.activity, 1600) && str(d.lodging, 160) &&
      Object.hasOwn(tripModes, d.mode) && Array.isArray(d.points) && d.points.length <= 12 && d.points.every(point)) &&
    new Set(plan.days.map(d => d.id)).size === plan.days.length &&
    plan.days.every((d, i) => !i || plan.days[i - 1].group <= d.group));
}

Object.assign(tripCoordinates, {
  乌鲁木齐:[43.83,87.62,'中国'], 伊宁:[43.91,81.28,'中国'], 阿拉木图:[43.24,76.95,'哈萨克斯坦'],
  塔什干:[41.30,69.24,'乌兹别克斯坦'], 撒马尔罕:[39.65,66.96,'乌兹别克斯坦'],
  布哈拉:[39.77,64.42,'乌兹别克斯坦'], 巴统:[41.65,41.64,'格鲁吉亚'],
  索非亚:[42.70,23.32,'保加利亚'], 贝尔格莱德:[44.82,20.46,'塞尔维亚'],
  萨拉热窝:[43.86,18.41,'波黑'], 雅典:[37.98,23.73,'希腊']
});

function xinjiangTravelPlan() {
  const sections = [
    ['新疆与中亚', ['乌鲁木齐','伊宁','阿拉木图','阿拉木图','塔什干','撒马尔罕','撒马尔罕','布哈拉']],
    ['高加索', ['第比利斯','第比利斯','卡兹别克','第比利斯','巴统']],
    ['土耳其', ['伊斯坦布尔','伊斯坦布尔','伊斯坦布尔']],
    ['巴尔干', ['索非亚','索非亚','贝尔格莱德','贝尔格莱德','萨拉热窝','萨拉热窝','雅典','雅典']],
    ['埃及', ['开罗','吉萨','开罗','卢克索','卢克索','开罗']],
    ['海湾与返疆', ['马斯喀特','马斯喀特','迪拜','迪拜','乌鲁木齐']]
  ];
  let previous = '';
  let number = 0;
  return {templateKey:'xinjiang', title:'新疆出发 · 亚欧非环线（不去西欧）', start:'',
    budget:[0,0,0,0,0], stages:sections.map(([name])=>name),
    days:sections.flatMap(([,cities],group)=>cities.map(city=>{
      const moving = previous && previous !== city;
      const names = moving ? [previous,city] : [city];
      const day = {id:'xinjiang-day-'+(++number), group, title:moving?previous+' → '+city:city,
        mode:moving?'rest':'visit', lodging:city,
        activity:moving?'转场预留日；交通方式、口岸或联程、签证和所需时间待核实，可拆成多天。':'市区游览或休息，景点和停留时长按兴趣调整。',
        points:names.map(name=>({name,lat:tripCoordinates[name][0],lng:tripCoordinates[name][1]}))};
      previous=city;
      return day;
    }))};
}

const tripDefault = defaultTravelPlan();
let tripGroup = 'all', tripMode = 'all', tripSelected = '', tripSaving = false, tripActiveId = '';
function validTravelPlans(value) {
  if (value?.version !== 2) return validTravelPlan(value);
  return Array.isArray(value.plans) && value.plans.length >= 1 && value.plans.length <= 20 &&
    value.plans.every(plan=>window.LouieTravelModel.id(plan.id) && validTravelPlan(plan)) &&
    new Set(value.plans.map(plan=>plan.id)).size === value.plans.length &&
    value.plans.some(plan=>plan.id===value.activeId);
}
function getTravelPlans() {
  if (db.travelPlan?.version === 2) return db.travelPlan;
  return {version:2, activeId:'original-plan', plans:[
    {...(db.travelPlan ?? tripDefault),id:'original-plan'},
    {...xinjiangTravelPlan(),id:'xinjiang-plan'}
  ]};
}
const getTravelPlan = () => {
  const collection = getTravelPlans();
  return collection.plans.find(plan=>plan.id===(tripActiveId || collection.activeId)) ?? collection.plans[0];
};
const tripMoney = n => '¥' + n.toLocaleString('zh-CN');

async function switchTravelPlan(id) {
  if (tripSaving) return;
  const collection = getTravelPlans();
  if (!collection.plans.some(plan=>plan.id===id)) return;
  if (!window.LouiePublicSite) {
    tripSaving=true;
    try { await travelCommit(null,{...collection,activeId:id}); }
    catch(error) {tripSaving=false;toast('切换未保存：'+error.message);refreshTripPlanner();return;}
    finally {tripSaving=false;}
  }
  tripActiveId=id;
  tripGroup='all';tripMode='all';tripSelected='';
  refreshTripPlanner({focus:true});
  $('#tripList').scrollTop=0;
}
function openNewTravelPlan() {
  if (window.LouiePublicSite || tripSaving) return;
  if (getTravelPlans().plans.length>=20) return toast('最多保存 20 份旅行计划。');
  show(`<h2>新建旅行计划</h2><form id="newTripForm" class="trip-form">
    <label>计划名称<input name="title" required maxlength="80" placeholder="给这条路线起个名字"></label>
    <label>从哪里开始<select name="source"><option value="blank">空白计划</option>
      <option value="copy">复制当前计划</option><option value="xinjiang">新疆出发 · 不去西欧</option></select></label>
    <button type="submit" class="primary">创建计划</button></form>`);
  $('#newTripForm').onsubmit=async event=>{
    event.preventDefault();
    const form=event.currentTarget,fields=new FormData(form),source=fields.get('source');
    const plan=source==='copy'?JSON.parse(JSON.stringify(getTravelPlan())):source==='xinjiang'?xinjiangTravelPlan():
      {templateKey:'custom',start:'',budget:[0,0,0,0,0],stages:['路线安排'],days:[]};
    const id=uid();
    const next={...plan,id,title:fields.get('title').trim()};
    const collection=getTravelPlans();
    await saveTripCollection({...collection,activeId:id,plans:[...collection.plans,next]},form.querySelector('[type=submit]'),()=>{
      tripActiveId=id;tripGroup='all';tripMode='all';tripSelected='';
    });
  };
}

function tripDate(start, offset) {
  if (!start) return '日期待定';
  const date = new Date(start + 'T00:00:00Z');
  date.setUTCDate(date.getUTCDate() + offset);
  return (date.getUTCMonth() + 1) + ' 月 ' + date.getUTCDate() + ' 日';
}

function filteredTripDays(plan = getTravelPlan()) {
  return plan.days.map((day, index) => ({...day, index})).filter(day =>
    (tripGroup === 'all' || day.group === tripGroup) && (tripMode === 'all' || day.mode === tripMode));
}

function tripStageSummary(plan) {
  const stages = plan.stages.map((name,group) => ({name, group, days:[]}));
  plan.days.forEach((day,index) => stages[day.group].days.push({...day, index}));
  return stages.filter(stage => stage.days.length).map(stage => {
    const stops = [...new Set(stage.days.flatMap(day =>
      (day.points.length > 1 ? day.points.slice(1) : day.points).map(point => point.name)))];
    const highlights = stops.length <= 4 ? stops :
      [stops[0], stops[Math.round((stops.length-1)/3)], stops[Math.round((stops.length-1)*2/3)], stops.at(-1)];
    return {...stage, start:stage.days[0].index, end:stage.days.at(-1).index, stops, highlights};
  });
}

function tripCountryCount(plan) {
  const countries = new Set();
  for (const {name,lat,lng} of plan.days.flatMap(day=>day.points)) {
    const point = tripCoordinates[name];
    if (!point || point[0] !== lat || point[1] !== lng) return null;
    if (point[2] !== '中国') countries.add(point[2]);
  }
  return countries.size;
}

function showTripScope(group) {
  tripGroup = group;
  tripMode = 'all';
  tripSelected = '';
  refreshTripPlanner({focus:true});
  $('#tripList').scrollTop = 0;
}

const tripMapColors = ['#b34024','#087462','#3159ac','#873d8b','#986500','#007592'];

function showFullTripMap() {
  const plan = getTravelPlan(), stages = tripStageSummary(plan);
  const days = plan.days.filter(day=>day.points.length).map(day=>({
    id:day.id,mode:day.mode,points:day.points,...tripModes[day.mode],color:tripMapColors[day.group%tripMapColors.length]
  }));
  show(`<section class="trip-full-map">
    <h2>全程地图</h2><p class="muted">${esc(plan.title)} · ${plan.days.length} 天</p>
    ${days.length ? `<div class="trip-full-frame"><span id="tripFullLoading" class="trip-full-loading" role="status">正在展开地图…</span></div>
      <div class="actions trip-full-controls"><span class="muted">拖动平移 · 双指或滚轮缩放</span><button id="tripFullOut" aria-label="缩小全程地图">−</button><button id="tripFullIn" aria-label="放大全程地图">＋</button><button id="tripFullReset">查看全程</button></div>
      <div class="trip-full-legend" aria-label="路线分段">${stages.map(stage=>`<div><i style="--stage-color:${tripMapColors[stage.group%tripMapColors.length]}"></i><span><strong>${esc(stage.name)}</strong><small>${esc(stage.highlights.join(' · '))}</small></span></div>`).join('')}</div>`
      : '<p class="muted">行程还没有地图地点。</p>'}
  </section>`);
  if(!days.length)return;
  const frame=document.createElement('iframe'),nonce=uid(),modal=$('#modal');
  frame.title='全程二维路线地图';frame.sandbox='allow-scripts';frame.referrerPolicy='no-referrer';
  frame.src='travel-assets/frame.html?view=plan&readonly=1&v=journal-fast#'+nonce;
  const send=message=>frame.contentWindow?.postMessage({channel:'louie-travel',nonce,...message},'*');
  const fit=()=>send({kind:'plan-route',days,selected:'',overviewStops:[...new Set(days.flatMap(day=>day.points.map(p=>p.name)))],focus:true,mapView:'flat'});
  let ready=false,closed=false;
  const receive=async event=>{
    const m=event.data;
    if(closed||event.source!==frame.contentWindow||event.origin!=='null'||m?.channel!=='louie-travel'||m.nonce!==nonce)return;
    if(m.kind==='ready'){ready=true;$('#tripFullLoading')?.remove();fit();return}
    if(m.kind==='plan-select'&&days.some(day=>day.id===m.id)){send({kind:'plan-route',days,selected:m.id,overviewStops:[],focus:true,mapView:'flat'});return}
    if(m.kind!=='request'||typeof m.id!=='string'||m.id.length>100)return;
    // This secondary map can read existing records but cannot write or remove them.
    try{
      if(!(m.op==='read-store'||m.op==='api'&&m.data?.path==='/api/entries'&&(!m.data.options?.method||m.data.options.method==='GET')))throw Error('全程地图仅供查看。');
      const result=await travelBridge(m.op,m.data||{});
      if(!closed)send({kind:'response',id:m.id,result});
    }catch(error){if(!closed)send({kind:'response',id:m.id,error:String(error.message||error).slice(0,300)})}
  };
  window.addEventListener('message',receive);
  modal.addEventListener('close',()=>{closed=true;window.removeEventListener('message',receive);frame.remove()},{once:true});
  for(const [id,direction] of [['tripFullOut',-1],['tripFullIn',1]])$('#'+id).onclick=()=>{if(ready)send({kind:'plan-zoom',direction})};
  $('#tripFullReset').onclick=()=>{if(ready)fit()};
  $('.trip-full-frame').append(frame);
}

function updateTripOverview(plan, stages) {
  $('#tripStages').innerHTML = stages.length ? stages.map(({name,group,days,start,end,stops,highlights}) => {
    const dayRange = start === end ? 'D' + (start+1) : 'D' + (start+1) + '–D' + (end+1);
    return `<button type="button" class="trip-stage-button" data-group="${group}" aria-pressed="${tripGroup === group}">
      <span class="trip-stage-days">${dayRange} <span>${days.length} 天</span></span>
      <strong>${esc(name)}</strong>
      <small>${tripDate(plan.start,start)}${!plan.start || start === end ? '' : '–' + tripDate(plan.start,end)}</small>
      ${stops.length ? `<span class="trip-stage-stops" title="${esc(stops.join(' → '))}">
        ${esc(highlights.join(' · '))}${stops.length > highlights.length ? ' 等 ' + stops.length + ' 站' : ''}
      </span>` : ''}
    </button>`;
  }).join('') : '<p class="muted">添加第一天后，路线分段会显示在这里。</p>';
}

function sendTripMap(focus = false) {
  if (page !== 'travelPlan' || !travelIsReady) return;
  const days = filteredTripDays().filter(day => day.points.length).map(day => ({
    id: day.id, mode: day.mode, points: day.points, ...tripModes[day.mode]
  }));
  const plan = getTravelPlan();
  const stages = tripStageSummary(plan);
  const overviewStops = tripGroup === 'all'
    ? [plan.days.find(day=>day.points.length)?.points[0]?.name,
        ...stages.map(stage=>stage.highlights[0]), stages.at(-1)?.highlights.at(-1)]
    : stages.find(stage=>stage.group === tripGroup)?.highlights || [];
  sendTravel({kind:'plan-route', days, selected:tripSelected, overviewStops:overviewStops.filter(Boolean), focus});
}

function renderTravelPlan() {
  $('#view').innerHTML = `
    <article class="trip-plan" id="tripPlanner">
      <div class="trip-toolbar">
        <div class="trip-plan-choice"><select id="tripPlanSelect" aria-label="选择旅行计划"></select>${window.LouiePublicSite?'':'<button type="button" id="tripNewQuick" title="新建旅行计划">＋ 新建</button>'}</div>
        <div class="trip-toolbar-actions">
          <details id="tripRouteMenu" class="trip-route-menu"><summary>路线筛选</summary>
            <div class="trip-route-popover">
              <div id="tripModes" class="trip-modes" role="group" aria-label="按活动类型筛选"></div>
              <div id="tripStages" class="trip-stages"></div>
              <details class="trip-booking"><summary>路线资料</summary><div id="tripBooking"></div></details>
            </div>
          </details>
          <button type="button" id="tripDaysToggle" aria-expanded="false" aria-controls="tripDaysPanel">每日行程</button>
          <button type="button" id="tripAll">全程地图</button>
        </div>
      </div>
      <div class="trip-layout">
        <section class="trip-map-card" aria-label="旅行星球路线">
          <div class="trip-map-wrap"><p id="travelFrameLoading" class="travel-frame-loading">正在加载地图，首次打开可能稍慢…</p></div>
          <div class="trip-map-caption"><div class="trip-map-actions">
              <button type="button" id="tripZoomOut" aria-label="缩小地图">−</button>
              <button type="button" id="tripZoomIn" aria-label="放大地图">＋</button>
              <button type="button" id="tripOverview">全段视角</button>
            </div></div>
        </section>
        <section id="tripDaysPanel" class="trip-list-panel" aria-label="每日行程" hidden>
          <div class="trip-list-heading"><h2>每日行程</h2><span id="tripCount" class="muted"></span><button type="button" id="tripDaysClose" aria-label="收起每日行程">×</button></div>
          ${window.LouiePublicSite ? '' : `<div class="trip-drawer-actions"><button type="button" id="tripSettings">计划与预算</button><button type="button" id="tripNew">新建计划</button><button type="button" class="primary" id="tripAdd">＋ 新增一天</button></div>`}
          <div id="tripDetail" class="trip-detail" aria-live="polite" hidden></div>
          <div id="tripList" class="trip-list"></div>
        </section>
      </div>
    </article>`;
  $('#tripPlanSelect').onchange = event => switchTravelPlan(event.target.value);
  if (!window.LouiePublicSite) {
    $('#tripNew').onclick = openNewTravelPlan;
    $('#tripNewQuick').onclick = openNewTravelPlan;
    $('#tripSettings').onclick = openTripSettings;
    $('#tripAdd').onclick = () => openTripDay();
  }
  for (const [id, direction] of [['tripZoomOut', -1], ['tripZoomIn', 1]]) {
    $('#' + id).onclick = () => {
      if (travelIsReady) sendTravel({kind:'plan-zoom', direction});
    };
  }
  $('#tripOverview').onclick = () => { tripSelected = '';tripGroup='all';tripMode='all';refreshTripPlanner({focus: true}); };
  $('#tripAll').onclick = showFullTripMap;
  $('#tripDaysToggle').onclick=()=>toggleTripDays($('#tripDaysPanel').hidden);
  $('#tripDaysClose').onclick=()=>{toggleTripDays(false);$('#tripDaysToggle').focus()};
  $('#tripPlanner').onkeydown=e=>{if(e.key==='Escape'&&!$('#tripDaysPanel').hidden){toggleTripDays(false);$('#tripDaysToggle').focus()}};
  $('#tripStages').onclick = e => {
    const button = e.target.closest('[data-group]');
    if (!button) return;
    showTripScope(Number(button.dataset.group));
    $('#tripRouteMenu').open=false;$('#tripRouteMenu').querySelector('summary').focus();
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
  const stages = tripStageSummary(plan);
  const dateRange = !plan.start ? '日期待定' : plan.start.slice(0,4) + ' 年 ' + tripDate(plan.start,0) +
    (plan.days.length > 1 ? '–' + tripDate(plan.start,plan.days.length-1) : '');
  $('#tripPlanSelect').innerHTML = getTravelPlans().plans.map(item=>
    `<option value="${esc(item.id)}" ${item.id===plan.id?'selected':''}>${esc(item.title)}</option>`).join('');
  $('#tripPlanSelect').disabled=tripSaving;
  const xinjiang=plan.templateKey==='xinjiang';
  $('#tripBooking').innerHTML=xinjiang?`<p>路线草案：新疆 → 中亚 → 高加索 → 土耳其 → 巴尔干 → 埃及 → 海湾 → 新疆，避开西欧。每天可编辑、增减或调整。</p>
    <p>转场均为待核实的连接示意，不代表已有直达交通；出发日期、预算、签证、口岸和航班尚未确定。</p>
    <p class="trip-links"><a href="https://kazakhstan.travel/en/regions/almaty" target="_blank" rel="noopener noreferrer">阿拉木图官方旅游资料</a>
      <a href="https://georgia.travel/cities-towns/tbilisi" target="_blank" rel="noopener noreferrer">第比利斯官方旅游资料</a>
      <a href="https://cs.mfa.gov.cn/aqtx/" target="_blank" rel="noopener noreferrer">领事提醒</a></p>`:
    plan.templateKey==='custom'?'<p>自定义路线。交通、签证和预订信息可记录在每天的安排里。</p>':
    `<p>保留原亚欧非路线。预订前核对各段交通、住宿和入境要求。</p><p class="trip-links">
      <a href="https://xhslink.com/o/2WTjkhTMUdn" target="_blank" rel="noopener noreferrer">原路线参考</a>
      <a href="https://cs.mfa.gov.cn/aqtx/" target="_blank" rel="noopener noreferrer">领事提醒</a></p>`;
  updateTripOverview(plan,stages);
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
  detail.innerHTML = active ? `<div class="trip-detail-head"><h2>${esc(active.title)}</h2>${window.LouiePublicSite ? '' : '<button type="button" id="tripEditDay">编辑这一天</button>'}</div>
    <p>${esc(active.activity || '暂无安排。')}</p>
    <p class="muted">住宿 · ${esc(active.lodging || '待定')}</p>
    <p class="trip-stop-line">${active.points.length ? active.points.map(p => esc(p.name)).join(' → ') : '尚未设置地图地点'}</p>
    ` : '';
  detail.hidden=!active;
  if (active && !window.LouiePublicSite) $('#tripEditDay').onclick = () => openTripDay(active.id);
  sendTripMap(focus);
}

function selectTripDay(id, fromList = false) {
  if (!filteredTripDays().some(day => day.id === id)) return;
  tripSelected = id;
  refreshTripPlanner({focus: true});
  toggleTripDays(true);
  const button = $('#tripList').querySelector('[aria-pressed=true]');
  if (fromList) button?.focus({preventScroll: true});
  if (button && !fromList) {
    const list = $('#tripList');
    const offset = button.getBoundingClientRect().top - list.getBoundingClientRect().top;
    if (offset < 0 || offset + button.offsetHeight > list.clientHeight) list.scrollTop += offset;
  }
}

async function saveTripPlan(next, button, applySelection) {
  if (!validTravelPlan(next)) return toast('请检查标题、日期、地点或预算填写。');
  const collection=getTravelPlans(),id=getTravelPlan().id;
  return saveTripCollection({...collection,activeId:id,plans:collection.plans.map(plan=>plan.id===id?{...next,id}:plan)},button,applySelection);
}
async function saveTripCollection(next, button, applySelection) {
  if (tripSaving) return;
  if (!validTravelPlans(next)) return toast('旅行计划格式有误，原记录未修改。');
  tripSaving=true;button.disabled=true;
  try {
    await travelCommit(null,next);
    applySelection?.();
    closeModal();
    toast('旅行计划已保存');
  } catch(error) {toast('计划未保存：'+error.message);}
  finally {tripSaving=false;button.disabled=false;refreshTripPlanner({focus:true});}
}

function openTripSettings() {
  const plan = getTravelPlan();
  show(`<h2>计划与预算</h2><form id="tripSettingsForm" class="trip-form">
    <label>计划名称<input name="title" required maxlength="80" value="${esc(plan.title)}"></label>
    <label>出发日期<input type="date" name="start" max="9998-12-31" value="${plan.start}"></label>
    <details><summary>修改分段名称</summary>${plan.stages.map((name, i) =>
      `<label>第 ${i + 1} 段<input name="stage${i}" maxlength="80" required value="${esc(name)}"></label>`).join('')}</details>
    <div class="formgrid">${tripBudgetLabels.map((label, i) =>
      `<label>${label}（元）<input type="number" name="money${i}" value="${plan.budget[i]}" required min="0" max="1000000"></label>`).join('')}</div>
    <p class="muted">留空日期表示尚未确定出发时间。</p>
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

function toggleTripDays(open){
  const panel=$('#tripDaysPanel'),button=$('#tripDaysToggle');
  if(!panel||!button)return;
  panel.hidden=!open;button.setAttribute('aria-expanded',String(open));
}
