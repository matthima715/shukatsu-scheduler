(() => {
const TYPES = [
  {k:"es",l:"ES締切"},{k:"test",l:"Webテスト"},{k:"setsu",l:"説明会"},{k:"men",l:"面接"},
  {k:"gd",l:"GD"},{k:"intern",l:"インターン"},{k:"naitei",l:"内定承諾期限"},{k:"other",l:"その他"}];
const TYPE = Object.fromEntries(TYPES.map(t=>[t.k,t]));
const STAGES = ["気になる","エントリー済","ES提出済","Webテスト","一次面接","二次面接","最終面接","内定","お見送り"];
const WD = ["日","月","火","水","木","金","土"];

const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const rid = () => Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4);
const pad = n => String(n).padStart(2,"0");
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parse = s => { const [y,m,d] = s.split("-").map(Number); return new Date(y,m-1,d); };
const today = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
const diffDays = s => Math.round((parse(s) - today())/86400000);
const addDays = (n) => { const d = today(); d.setDate(d.getDate()+n); return ymd(d); };
const fmtMD = s => { const d = parse(s); return `${d.getMonth()+1}/${d.getDate()}（${WD[d.getDay()]}）`; };
const leftLabel = (n) => n===0 ? "今日" : n===1 ? "明日" : n>0 ? `あと${n}日` : `${-n}日前`;

let state = { companies: [], mode: "loading", sample: false };
let view = "agenda";
let calMonth = (() => { const d = today(); return new Date(d.getFullYear(), d.getMonth(), 1); })();
let typeFilter = new Set();
let store = null; // {save(c), remove(id)}

try { const v = localStorage.getItem("shk.view"); if (v) view = v; } catch {}

/* ---------- sample data (relative to today) ---------- */
function sampleData(){
  const ev = (type,day,time,title,place,done=false)=>({id:rid(),type,date:addDays(day),time,title,place,done});
  return [
    {id:"s1",name:"北斗ソフトウェア",industry:"IT / エンジニア職",priority:3,stage:"一次面接",url:"",login:"",note:"ガクチカは研究室のデータ整理の話で。逆質問を3つ用意。",
      events:[ev("es",-9,"23:59","本選考ES","マイページ",true),ev("test",-4,"23:59","玉手箱","自宅受験",true),ev("men",3,"14:00","一次面接","オンライン（Zoom）")]},
    {id:"s2",name:"みなと海運",industry:"物流 / 総合職",priority:2,stage:"ES提出済",url:"",login:"",note:"",
      events:[ev("es",-2,"12:00","本選考ES","",true),ev("test",1,"23:59","SPI","テストセンター予約済")]},
    {id:"s3",name:"青葉フードサービス",industry:"食品 / 企画職",priority:2,stage:"エントリー済",url:"",login:"",note:"",
      events:[ev("setsu",0,"18:00","会社説明会","オンライン"),ev("es",6,"23:59","本選考ES","設問3つ・各400字")]},
    {id:"s4",name:"東雲フィナンシャル",industry:"金融 / 総合職",priority:3,stage:"最終面接",url:"",login:"",note:"",
      events:[ev("men",9,"10:30","最終面接","本社 15F・スーツ")]},
    {id:"s5",name:"若葉コンサルティング",industry:"コンサル",priority:1,stage:"気になる",url:"",login:"",note:"",
      events:[ev("intern",15,"","冬インターン応募締切","")]},
    {id:"s6",name:"白樺化学",industry:"メーカー / 研究職",priority:3,stage:"内定",url:"",login:"",note:"",
      events:[ev("naitei",12,"17:00","内定承諾の回答期限","人事へメール")]},
    {id:"s7",name:"湊町メディア",industry:"広告",priority:1,stage:"お見送り",url:"",login:"",note:"",events:[]},
  ];
}

/* ---------- persistence ---------- */
function localStore(){
  const KEY="shk.companies";
  let list=[];
  try { list = JSON.parse(localStorage.getItem(KEY)||"[]"); } catch {}
  const write=()=>{ try{ localStorage.setItem(KEY, JSON.stringify(state.companies)); }catch{} };
  return {
    initial: list,
    async save(c){ const i=state.companies.findIndex(x=>x.id===c.id); if(i>=0) state.companies[i]=c; else state.companies.push(c); write(); render(); },
    async remove(id){ state.companies = state.companies.filter(x=>x.id!==id); write(); render(); },
  };
}

async function boot(){
  render();
  let db=null, uid=null;
  try {
    if (window.claude?.use) {
      [db] = await Promise.all([window.claude.use("db")]);
      const user = await window.claude.use("user");
      uid = user ? await user.id() : null;
    }
  } catch {}
  if (db && uid) {
    const col = db.collection("data/users/"+uid);
    let writable = true;
    store = {
      async save(c){ try { await col.doc(c.id).set(JSON.parse(JSON.stringify(c))); } catch(e){ toast(e?.code==="quota_exceeded"?"保存容量の上限です。古い企業を削除してください":"保存できませんでした。もう一度お試しください"); throw e; } },
      async remove(id){ try { await col.doc(id).delete(); } catch(e){ toast("削除できませんでした"); } },
    };
    col.onSnapshot(snap => {
      const list = snap.docs.map(d => ({...d.data(), id:d.id}));
      state.mode="db";
      if (list.length) { state.companies = list; state.sample=false; }
      else { state.companies = sampleData(); state.sample=true; }
      render();
    }, () => { fallbackLocal(); });
  } else fallbackLocal();
}
function fallbackLocal(){
  const ls = localStore(); store = ls; state.mode="local";
  if (ls.initial.length){ state.companies = ls.initial; state.sample=false; }
  else { state.companies = sampleData(); state.sample=true; }
  render();
}
async function persist(c){
  if (state.sample) await clearSample();
  await store.save(c);
}
async function clearSample(){
  state.sample=false; state.companies=[];
}
$("#keepSample").onclick = async () => {
  const list = state.companies.slice();
  state.sample=false; state.companies=[];
  for (const c of list) await store.save(c);
  toast("サンプルを保存しました。自由に書き換えてください");
};

/* ---------- derived ---------- */
function allEvents(){
  const out=[];
  for (const c of state.companies) for (const e of (c.events||[])) out.push({...e, co:c});
  out.sort((a,b)=> (a.date+(a.time||"99:99")).localeCompare(b.date+(b.time||"99:99")));
  return out;
}

/* ---------- render ---------- */
function render(){
  const t = today();
  $("#todayLbl").textContent = `${t.getFullYear()}.${pad(t.getMonth()+1)}.${pad(t.getDate())} ${WD[t.getDay()]}曜日`;
  $("#sampleBanner").hidden = !state.sample;
  $("#localBanner").hidden = !(state.mode==="local");
  for (const v of ["agenda","calendar","board"]) {
    $("#view-"+v).hidden = v!==view;
    $("#tab-"+v).setAttribute("aria-selected", v===view);
  }
  renderSummary(); renderFilters(); renderAgenda(); renderCal(); renderBoard();
}

function renderSummary(){
  const evs = allEvents().filter(e=>!e.done);
  const deadlines = evs.filter(e=>["es","test","naitei","intern"].includes(e.type) && diffDays(e.date)>=0);
  const nx = deadlines[0];
  const week = evs.filter(e=>{const n=diffDays(e.date); return n>=0 && n<7;}).length;
  const overdue = evs.filter(e=>diffDays(e.date)<0).length;
  const active = state.companies.filter(c=>!["気になる","内定","お見送り"].includes(c.stage)).length;
  const offers = state.companies.filter(c=>c.stage==="内定").length;
  $("#summary").innerHTML = `
    <div class="sum next"><span class="lbl">次の締切</span>
      ${nx ? `<span class="val">${leftLabel(diffDays(nx.date))}<small class="mono">${fmtMD(nx.date)} ${esc(nx.time||"")}</small></span>
      <span class="sub">${esc(nx.co.name)}・${esc(TYPE[nx.type]?.l)}</span>` : `<span class="val" style="color:var(--muted)">なし</span><span class="sub">締切の予定はまだありません</span>`}</div>
    <div class="sum"><span class="lbl">7日以内の予定</span><span class="val mono">${week}<small>件</small></span><span class="sub">${overdue?`未完了の期限切れ ${overdue}件`:"期限切れなし"}</span></div>
    <div class="sum"><span class="lbl">選考中</span><span class="val mono">${active}<small>社</small></span><span class="sub">登録 ${state.companies.length}社</span></div>
    <div class="sum"><span class="lbl">内定</span><span class="val mono">${offers}<small>社</small></span><span class="sub">&nbsp;</span></div>`;
}

function renderFilters(){
  $("#typeFilters").innerHTML = `<span class="note">絞り込み</span>` + TYPES.map(t=>`<button type="button" class="chipbtn" data-type="${t.k}" aria-pressed="${typeFilter.has(t.k)}">${t.l}</button>`).join("");
}

function evRow(e){
  const n = diffDays(e.date);
  const cls = e.done ? "past" : n<=2 ? "hot" : n<0 ? "hot" : "";
  return `<div class="row ${e.done?"done":""}">
    <input type="checkbox" class="chk" aria-label="完了" data-done="${e.co.id}|${e.id}" ${e.done?"checked":""}>
    <div class="when"><span class="d">${fmtMD(e.date)}</span><span class="t">${esc(e.time||"終日")}</span></div>
    <div class="main">
      <div class="ttl"><span class="chip ty-${e.type}">${esc(TYPE[e.type]?.l||"その他")}</span>
        <button type="button" class="co" data-co="${e.co.id}">${esc(e.co.name)}</button>
        ${e.title?`<span>${esc(e.title)}</span>`:""}</div>
      <div class="sub">${e.place?esc(e.place)+"　":""}<button type="button" class="rowedit" data-ev="${e.co.id}|${e.id}">編集</button></div>
    </div>
    <div class="left ${cls}">${e.done?"完了":leftLabel(n)}</div>
  </div>`;
}

function renderAgenda(){
  let evs = allEvents();
  if (typeFilter.size) evs = evs.filter(e=>typeFilter.has(e.type));
  if (!state.companies.length && !state.sample) {
    $("#agenda").innerHTML = `<div class="empty">まだ予定がありません。<br>「＋ 企業を追加」で志望企業を登録し、「＋ 予定を追加」でES締切や面接日を入れましょう。</div>`;
    return;
  }
  const groups = [
    {k:"overdue",l:"期限切れ・未完了",f:e=>!e.done && diffDays(e.date)<0},
    {k:"today",l:"今日",f:e=>diffDays(e.date)===0},
    {k:"tomorrow",l:"明日",f:e=>diffDays(e.date)===1},
    {k:"week",l:"7日以内",f:e=>{const n=diffDays(e.date);return n>=2&&n<7;}},
    {k:"later",l:"それ以降",f:e=>diffDays(e.date)>=7},
    {k:"past",l:"終わった予定",f:e=>e.done && diffDays(e.date)<0},
  ];
  const html = groups.map(g=>{
    const items = evs.filter(g.f);
    if (!items.length) return "";
    const list = g.k==="past" ? items.reverse().slice(0,10) : items;
    return `<div class="group ${g.k}"><h2>${g.l}<span class="count">${items.length}</span></h2><div class="list">${list.map(evRow).join("")}</div></div>`;
  }).join("");
  $("#agenda").innerHTML = html || `<div class="empty">条件に合う予定はありません。</div>`;
}

function renderCal(){
  const y = calMonth.getFullYear(), m = calMonth.getMonth();
  $("#ymLbl").innerHTML = `<span class="mono">${y}</span>年 <span class="mono">${m+1}</span>月`;
  const start = new Date(y,m,1); start.setDate(1-start.getDay());
  const end = new Date(y,m+1,0); const days = Math.ceil((end - start)/86400000 + 1); const total = Math.ceil(days/7)*7;
  const byDate = {};
  for (const e of allEvents()) (byDate[e.date] ||= []).push(e);
  const tStr = ymd(today());
  let h = WD.map((w,i)=>`<div class="dow ${i===0?"sun":i===6?"sat":""}">${w}</div>`).join("");
  for (let i=0;i<total;i++){
    const d = new Date(start); d.setDate(start.getDate()+i);
    const s = ymd(d), evs = byDate[s]||[];
    const cls = [d.getMonth()!==m?"out":"", d.getDay()===0?"sun":d.getDay()===6?"sat":"", s===tStr?"today":""].join(" ");
    const shown = evs.slice(0,3);
    h += `<div class="cell ${cls}" data-date="${s}"><span class="num">${d.getDate()}</span><div class="cevs">${
      shown.map(e=>`<button type="button" class="cev ty-${e.type} ${e.done?"done":""}" data-ev="${e.co.id}|${e.id}" title="${esc(e.co.name+" "+(TYPE[e.type]?.l||""))}">${esc((e.time?e.time+" ":"")+e.co.name)}</button>`).join("")
    }</div>${evs.length>3?`<span class="more">+${evs.length-3}件</span>`:""}</div>`;
  }
  $("#cal").innerHTML = h;
  $("#legend").innerHTML = TYPES.map(t=>`<span class="chip ty-${t.k}">${t.l}</span>`).join("");
}

function renderBoard(){
  $("#board").innerHTML = STAGES.map(st=>{
    const cs = state.companies.filter(c=>c.stage===st).sort((a,b)=>(b.priority||0)-(a.priority||0));
    return `<div class="col ${st==="お見送り"?"ng":""}"><h3>${st}<span class="mono">${cs.length}</span></h3>${
      cs.map(c=>{
        const nx = (c.events||[]).filter(e=>!e.done && diffDays(e.date)>=0).sort((a,b)=>a.date.localeCompare(b.date))[0];
        return `<button type="button" class="card" data-co="${c.id}">
          <span class="nm"><span>${esc(c.name)}</span><span class="stars" aria-label="志望度${c.priority}">${"★".repeat(c.priority||1)}</span></span>
          ${c.industry?`<span class="ind">${esc(c.industry)}</span>`:""}
          ${nx?`<span class="nx"><span class="chip ty-${nx.type}">${esc(TYPE[nx.type]?.l)}</span><span class="mono">${fmtMD(nx.date)}</span><span class="note">${leftLabel(diffDays(nx.date))}</span></span>`:""}
        </button>`;}).join("")
    }</div>`;
  }).join("");
}

/* ---------- interactions ---------- */
document.addEventListener("click", e=>{
  const tab = e.target.closest(".tab");
  if (tab){ view = tab.dataset.view; try{localStorage.setItem("shk.view",view);}catch{} render(); return; }
  const tf = e.target.closest("[data-type]");
  if (tf){ const k=tf.dataset.type; typeFilter.has(k)?typeFilter.delete(k):typeFilter.add(k); renderFilters(); renderAgenda(); return; }
  const evb = e.target.closest("[data-ev]");
  if (evb){ const [c,id]=evb.dataset.ev.split("|"); openEv(c,id); return; }
  const cob = e.target.closest("[data-co]");
  if (cob){ openCo(cob.dataset.co); return; }
  const cell = e.target.closest(".cell");
  if (cell && !e.target.closest(".cev")){ openEv(null,null,cell.dataset.date); return; }
  if (e.target.matches("[data-close]")) e.target.closest("dialog").close();
});
document.addEventListener("change", async e=>{
  if (!e.target.matches("[data-done]")) return;
  const [cid,eid] = e.target.dataset.done.split("|");
  const c = structuredClone(state.companies.find(x=>x.id===cid)); if(!c) return;
  const ev = c.events.find(x=>x.id===eid); ev.done = e.target.checked;
  await persist(c);
});
$("#prevM").onclick=()=>{calMonth=new Date(calMonth.getFullYear(),calMonth.getMonth()-1,1);renderCal();};
$("#nextM").onclick=()=>{calMonth=new Date(calMonth.getFullYear(),calMonth.getMonth()+1,1);renderCal();};
$("#thisM").onclick=()=>{const d=today();calMonth=new Date(d.getFullYear(),d.getMonth(),1);renderCal();};
$("#addCoBtn").onclick=()=>openCo(null);
$("#addEvBtn").onclick=()=>openEv(null,null);

function armDelete(btn, fn){
  btn.classList.remove("armed"); btn.textContent="削除";
  btn.onclick=()=>{ if(btn.classList.contains("armed")) fn(); else { btn.classList.add("armed"); btn.textContent="本当に削除する"; } };
}

/* company dialog */
$("#coStage").innerHTML = STAGES.map(s=>`<option>${s}</option>`).join("");
let editingCo=null;
function openCo(id){
  const c = id ? state.companies.find(x=>x.id===id) : null;
  editingCo = c ? c.id : null;
  $("#coDlgTtl").textContent = c ? c.name : "企業を追加";
  $("#coName").value = c?.name||""; $("#coInd").value=c?.industry||""; $("#coPri").value=String(c?.priority||2);
  $("#coStage").value=c?.stage||"気になる"; $("#coLogin").value=c?.login||""; $("#coUrl").value=c?.url||""; $("#coNote").value=c?.note||"";
  const evs = (c?.events||[]).slice().sort((a,b)=>a.date.localeCompare(b.date));
  $("#coEvents").innerHTML = c ? `<div class="field"><label>この企業の予定</label>${
    evs.map(e=>`<div class="coev"><span class="mono">${fmtMD(e.date)}</span><span class="chip ty-${e.type}">${esc(TYPE[e.type]?.l)}</span><span>${esc(e.title||"")}</span>${e.done?'<span class="note">完了</span>':""}<button type="button" class="rowedit" data-ev="${c.id}|${e.id}">編集</button></div>`).join("") || '<span class="note">まだ予定はありません</span>'
  }<div><button type="button" class="btn" id="coAddEv" style="margin-top:6px">＋ この企業に予定を追加</button></div></div>
  ${c.url?`<div class="linkrow">マイページ：<a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.url)}</a></div>`:""}` : "";
  const ab = $("#coAddEv"); if (ab) ab.onclick = ()=>{ $("#coDlg").close(); openEv(c.id,null); };
  $("#coDel").hidden = !c;
  armDelete($("#coDel"), async ()=>{ $("#coDlg").close(); if(state.sample){ state.companies=state.companies.filter(x=>x.id!==c.id); render(); return; } await store.remove(c.id); toast("削除しました"); });
  if (!$("#coDlg").open) $("#coDlg").showModal();
}
$("#coForm").addEventListener("submit", async e=>{
  e.preventDefault();
  const old = editingCo ? state.companies.find(x=>x.id===editingCo) : null;
  const url = $("#coUrl").value.trim();
  const c = {
    id: old?.id || rid(), name: $("#coName").value.trim(), industry: $("#coInd").value.trim(),
    priority: Number($("#coPri").value), stage: $("#coStage").value, login: $("#coLogin").value.trim(),
    url: /^https?:\/\//i.test(url) ? url : "", note: $("#coNote").value, events: structuredClone(old?.events||[]),
    createdAt: old?.createdAt || Date.now(),
  };
  if (!c.name) return;
  $("#coDlg").close();
  try { await persist(c); toast("保存しました"); } catch {}
});

/* event dialog */
$("#evType").innerHTML = TYPES.map(t=>`<option value="${t.k}">${t.l}</option>`).join("");
let editingEv=null;
function openEv(cid, eid, date){
  if ($("#coDlg").open) $("#coDlg").close();
  const c = cid ? state.companies.find(x=>x.id===cid) : null;
  const ev = c && eid ? c.events.find(x=>x.id===eid) : null;
  editingEv = ev ? {cid, eid} : null;
  const cos = state.companies.slice().sort((a,b)=>a.name.localeCompare(b.name,"ja"));
  $("#evCo").innerHTML = cos.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join("");
  $("#evCoNote").hidden = cos.length>0;
  $("#evCo").value = cid || cos[0]?.id || "";
  $("#evCo").disabled = !!ev;
  $("#evDlgTtl").textContent = ev ? "予定を編集" : "予定を追加";
  $("#evType").value = ev?.type||"es"; $("#evTitle").value=ev?.title||"";
  $("#evDate").value = ev?.date || date || ymd(today()); $("#evTime").value=ev?.time||"";
  $("#evPlace").value = ev?.place||""; $("#evDone").checked=!!ev?.done;
  $("#evDel").hidden = !ev;
  armDelete($("#evDel"), async ()=>{
    $("#evDlg").close();
    const cc = structuredClone(c); cc.events = cc.events.filter(x=>x.id!==eid);
    await persist(cc); toast("削除しました");
  });
  $("#evDlg").showModal();
}
$("#evForm").addEventListener("submit", async e=>{
  e.preventDefault();
  const cid = editingEv?.cid || $("#evCo").value;
  const base = state.companies.find(x=>x.id===cid);
  if (!base) { toast("先に企業を登録してください"); return; }
  const c = structuredClone(base); c.events ||= [];
  const ev = {id: editingEv?.eid || rid(), type: $("#evType").value, title: $("#evTitle").value.trim(),
    date: $("#evDate").value, time: $("#evTime").value, place: $("#evPlace").value.trim(), done: $("#evDone").checked};
  if (!ev.date) return;
  const i = c.events.findIndex(x=>x.id===ev.id);
  if (i>=0) c.events[i]=ev; else c.events.push(ev);
  $("#evDlg").close();
  try { await persist(c); toast("保存しました"); } catch {}
});

let tt;
function toast(msg){ const el=$("#toast"); el.textContent=msg; el.hidden=false; clearTimeout(tt); tt=setTimeout(()=>el.hidden=true,2200); }

boot();
})();
