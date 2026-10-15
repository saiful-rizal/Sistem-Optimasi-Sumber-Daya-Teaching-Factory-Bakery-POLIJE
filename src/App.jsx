import React, { useState, useMemo } from "react";
import staticData from "./data/tefa-data.json";

/* ================= IKON ================= */
const ICONS = {
  grid:<g><rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/></g>,
  trend:<g><path d="M3 17l5.5-5.5 3.5 3.5L21 7"/><path d="M15 7h6v6"/></g>,
  box:<g><path d="M21 8.2 12 3 3 8.2v7.6L12 21l9-5.2V8.2z"/><path d="M3 8.2l9 5.2 9-5.2"/><path d="M12 13.4V21"/></g>,
  receipt:<g><path d="M6 3h12v18l-2.4-1.6L13.2 21l-2.4-1.6L8.4 21 6 19.4V3z"/><path d="M9.5 8h5M9.5 12h5"/></g>,
  doc:<g><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M10 12h5M10 16h5"/></g>,
  layers:<g><path d="M12 3 3 8l9 5 9-5-9-5z"/><path d="M3 13l9 5 9-5"/></g>,
  gear:<g><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"/></g>,
  help:<g><circle cx="12" cy="12" r="9"/><path d="M9.6 9.2a2.5 2.5 0 1 1 3.6 2.3c-.8.4-1.2 1-1.2 1.9"/><path d="M12 16.8h.01"/></g>,
  logout:<g><path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3"/><path d="M16 17l5-5-5-5"/><path d="M21 12H10"/></g>,
  search:<g><circle cx="11" cy="11" r="7"/><path d="M20.5 20.5 16.6 16.6"/></g>,
  bell:<g><path d="M18 9a6 6 0 1 0-12 0c0 6-2.5 7-2.5 7h17S18 15 18 9z"/><path d="M10.3 20a2 2 0 0 0 3.4 0"/></g>,
  mail:<g><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 7.5 8.5 6 8.5-6"/></g>,
  chevD:<path d="m6 9 6 6 6-6"/>,
  chevUD:<g><path d="m8 9 4-4 4 4"/><path d="m8 15 4 4 4-4"/></g>,
  arrowR:<g><path d="M4.5 12h15"/><path d="m13.5 6 6 6-6 6"/></g>,
  filter:<path d="M3.5 5h17l-6.8 8v5.5l-3.4-1.8V13L3.5 5z"/>,
  refresh:<g><path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 3.5V9H15"/></g>,
  download:<g><path d="M12 15V3.5"/><path d="m7.5 10.5 4.5 4.5 4.5-4.5"/><path d="M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17"/></g>,
  wallet:<g><rect x="2.8" y="6" width="18.4" height="13" rx="3"/><path d="M2.8 10.5h18.4"/><circle cx="17" cy="14.7" r="1.1" fill="currentColor" stroke="none"/></g>,
  coins:<g><circle cx="9" cy="9" r="5.5"/><path d="M14.2 8.6a5.5 5.5 0 1 1-5.6 6.8"/></g>,
  bread:<g><path d="M4 11.5c0-3.8 3.6-6.5 8-6.5s8 2.7 8 6.5v5.2A2.3 2.3 0 0 1 17.7 19H6.3A2.3 2.3 0 0 1 4 16.7v-5.2z"/><path d="M8 11c.3-1.6 1.4-2.5 3-3M13 11c.3-1.6 1.4-2.5 3-3"/></g>,
  cookie:<g><circle cx="12" cy="12" r="8.5"/><circle cx="8.5" cy="9" r="1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="9.5" r="1" fill="currentColor" stroke="none"/><circle cx="13" cy="15" r="1" fill="currentColor" stroke="none"/><circle cx="8.5" cy="14.5" r="1" fill="currentColor" stroke="none"/></g>,
  target:<g><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/></g>,
  dots:<g fill="currentColor" stroke="none"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></g>,
  dotsV:<g fill="currentColor" stroke="none"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></g>,
};
const Icon = ({name,size=18,style}) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
       strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={style}>{ICONS[name]}</svg>
);

const { products: PRODUCTS, materials: MATERIALS, defaults: DEFAULTS, labaKemarin: LABA_KEMARIN, daily: DAILY, weekly: WEEKLY, orders: ORDERS } = staticData;

/* ================= SOLVER MILP (mendukung pesanan khusus X1 >= Dmin) ================= */
function solveMILP(p){
  const [A,B,C] = PRODUCTS;
  const modal=p.modal, oven=p.ovenJam*60, mixer=p.mixerJam*60, sdm=p.sdmJam*60;
  const caps = {modal,oven,mixer,sdm};
  const usage={}, remain={};
  MATERIALS.forEach(m=>{usage[m.id]=0; remain[m.id]=m.stock;});
  const zero = {status:'Infeasible',x1:0,x2:0,x3:0,profit:0,revenue:0,
                used:{modal:0,oven:0,mixer:0,sdm:0},usage,remain,caps};
  const capA = Math.min(A.dmax, Math.floor(oven/A.oven), Math.floor(mixer/A.mixer), Math.floor(sdm/A.sdm));
  if(p.orderMin > capA) return zero;                 // pesanan khusus tidak feasible
  let best = null;
  for(let x1=p.orderMin; x1<=capA; x1++){
    const rm=modal-x1*A.hpp, ro=oven-x1*A.oven, rx=mixer-x1*A.mixer, rs=sdm-x1*A.sdm;
    if(rm<0||ro<0||rx<0||rs<0) break;
    const capB = Math.min(B.dmax, Math.floor(rm/B.hpp), Math.floor(ro/B.oven),
                          Math.floor(rx/B.mixer), Math.floor(rs/B.sdm));
    for(let x2=0; x2<=capB; x2++){
      const m2 = rm - x2*B.hpp;
      const x3 = Math.max(0, Math.min(C.dmax, Math.floor(m2/C.hpp),
        Math.floor((ro-x2*B.oven)/C.oven), Math.floor((rx-x2*B.mixer)/C.mixer),
        Math.floor((rs-x2*B.sdm)/C.sdm)));
      const profit = x1*A.margin + x2*B.margin + x3*C.margin;
      if(!best || profit>best.profit) best = {x1,x2,x3,profit};
    }
  }
  if(!best) return zero;
  const xs=[best.x1,best.x2,best.x3];
  const used = {
    modal: xs.reduce((s,x,i)=>s+x*PRODUCTS[i].hpp,0),
    oven:  xs.reduce((s,x,i)=>s+x*PRODUCTS[i].oven,0),
    mixer: xs.reduce((s,x,i)=>s+x*PRODUCTS[i].mixer,0),
    sdm:   xs.reduce((s,x,i)=>s+x*PRODUCTS[i].sdm,0),
  };
  MATERIALS.forEach(m=>{
    usage[m.id]  = xs.reduce((s,x,i)=>s + x*(PRODUCTS[i].bom[m.id]||0),0);
    remain[m.id] = m.stock - usage[m.id];
  });
  return {status:'Optimal',x1:best.x1,x2:best.x2,x3:best.x3,profit:best.profit,
          revenue: xs.reduce((s,x,i)=>s+x*PRODUCTS[i].price,0), used,usage,remain,caps};
}

/* ================= UTIL ================= */
const rp = n => 'Rp ' + Math.round(n).toLocaleString('id-ID');
const fmtAxis = v => v===0 ? '0' : v>=1e6 ? (v/1e6).toFixed(1).replace('.0','').replace('.',',')+'jt' : Math.round(v/1e3)+'rb';
const fmtQty = v => v.toFixed(1).replace('.',',');
const niceMax = v => { const s = v>=1.5e6?5e5 : v>=8e5?2e5 : 1e5; return Math.ceil(v/s)*s; };

/* ================= KOMPONEN ================= */
function Sidebar({page,setPage,goParams}){
  const groups = [
    {label:'Menu Utama',items:[
      {id:'Dashboard',icon:'grid'},
      {id:'Optimasi',icon:'target',badge:'MILP'},
      {id:'Bahan Baku',icon:'box',badge:'5'},
      {id:'Pesanan',icon:'receipt',badge:'2'},
    ]},
    {label:'Fitur',items:[
      {id:'Peramalan',icon:'trend'},
      {id:'Penjadwalan',icon:'layers'},
      {id:'Laporan',icon:'doc'},
    ]},
    {label:'Umum',items:[
      {id:'Pengaturan',icon:'gear'},
      {id:'Bantuan',icon:'help'},
      {id:'Keluar',icon:'logout'},
    ]},
  ];
  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-badge"><Icon name="layers" size={21}/></div>
        <div><div className="logo-name">TEFA Bakery</div><div className="logo-sub">PDSS &bull; Politeknik X</div></div>
      </div>
      <div className="search"><Icon name="search" size={15}/><input placeholder="Search"/><kbd>Ctrl K</kbd></div>
      {groups.map(g=>(
        <div key={g.label}>
          <div className="nav-label">{g.label}</div>
          {g.items.map(it=>(
            <div key={it.id} className={'nav'+(page===it.id?' active':'')} onClick={()=>setPage(it.id)}>
              <Icon name={it.icon} size={17}/>{it.id}
              {it.badge && <span className="nav-badge">{it.badge}</span>}
            </div>
          ))}
        </div>
      ))}
      <div className="promo">
        <h4>Solver Engine</h4>
        <p>Optimasi MILP &amp; peramalan permintaan untuk keputusan produksi yang terukur.</p>
        <div className="promo-actions">
          <button className="btn-mini green" onClick={goParams}>Coba Solver</button>
          <button className="btn-mini ghost">Dokumen</button>
        </div>
      </div>
    </aside>
  );
}

function ChartCard({data,mode,setMode}){
  const [hover,setHover] = useState(null);
  const n = data.length;
  const maxV = niceMax(Math.max(...data.map(d=>d.laba)));
  const active = hover==null ? n-1 : hover;
  const d = data[active];
  return (
    <div className="card">
      <div className="chart-head">
        <div>
          <div className="chart-label">Proyeksi Laba Bersih</div>
          <div className="chart-big">{rp(d.laba)}</div>
        </div>
        <div className="seg">
          <button className={mode==='harian'?'on':''} onClick={()=>setMode('harian')}>Harian</button>
          <button className={mode==='mingguan'?'on':''} onClick={()=>setMode('mingguan')}><span className="segdot"></span>Mingguan</button>
        </div>
      </div>
      <div className="plot">
        {[0,.25,.5,.75,1].map(t=>(
          <div key={t} className="gridline" style={{bottom:(t*100)+'%'}}>
            <span>{t===0?'0':fmtAxis(maxV*t)}</span>
          </div>
        ))}
        <div className="plot-cols">
          {data.map((dd,i)=>{
            const h = Math.max(2, dd.laba/maxV*100);
            const hot = i===active;
            const tipStyle = i===0 ? {left:6,transform:'none'}
                          : i===n-1 ? {right:6,left:'auto',transform:'none'} : {};
            return (
              <div key={i} className="col" onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(null)}>
                {hot &&
                  <div className="tip" style={{bottom:`calc(${h}% + 16px)`,...tipStyle}}>
                    <div className="t-title">{dd.title}</div>
                    <div className="t-row"><span>Pendapatan</span><b>{rp(dd.pendapatan)}</b></div>
                    <div className="t-row"><span>Laba Bersih</span><b>{rp(dd.laba)}</b></div>
                  </div>}
                <div className={'bar'+(hot?' hot':'')} style={{height:h+'%'}}></div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="xlabels">
        {data.map((dd,i)=><span key={i} style={i===active?{color:'#101828',fontWeight:700}:{}}>{dd.label}</span>)}
      </div>
    </div>
  );
}

function App(){
  const [page,setPage]   = useState('Dashboard');
  const [params,setParams] = useState(DEFAULTS);
  const [mode,setMode]   = useState('harian');
  const res   = useMemo(()=>solveMILP(params),[params]);
  const set   = k => e => setParams(p=>({...p,[k]:+e.target.value}));
  const reset = () => setParams(DEFAULTS);
  const goParams = () => { setPage('Dashboard'); setTimeout(()=>{
    const el=document.getElementById('parameter'); if(el) el.scrollIntoView({behavior:'smooth',block:'center'});
  },60); };

  const chartData = useMemo(()=>{
    const base = mode==='harian' ? DAILY : WEEKLY;
    const live = mode==='harian'
      ? {label:'Min', title:'Minggu, 18 Okt 2026 â€¢ hasil optimasi', laba:res.profit, pendapatan:res.revenue}
      : {label:'P4',  title:'Minggu ke-4 â€¢ berjalan (live)',        laba:res.profit, pendapatan:res.revenue};
    return [...base, live];
  },[mode,res]);

  const totalUnit = res.x1+res.x2+res.x3;
  const delta = (res.profit-LABA_KEMARIN)/LABA_KEMARIN*100;
  const deltaStr = (delta>=0?'â–² ':'â–¼ ') + Math.abs(delta).toFixed(1).replace('.',',') + '%';
  const modalPct = Math.round(res.used.modal/params.modal*100);

  const tiles = [
    {icon:'bread',tint:'#FDE8E8',name:'Roti Manis',qty:res.x1,sub:'Margin '+rp(PRODUCTS[0].margin)+' / unit',
     st: params.orderMin>0 ? ['warn','Pesanan Khusus'] : ['ok','Rutin']},
    {icon:'bread',tint:'#EAF1FE',name:'Roti Tawar',qty:res.x2,sub:'Margin '+rp(PRODUCTS[1].margin)+' / unit',st:['ok','Rutin']},
    {icon:'cookie',tint:'#FEF3E2',name:'Roti Kering (Bagelan)',qty:res.x3,sub:'Margin '+rp(PRODUCTS[2].margin)+' / unit',st:['ok','Rutin']},
    {icon:'coins',tint:'#E7F6EE',name:'Sisa Modal',val:rp(params.modal-res.used.modal),sub:'Kas belum teralokasi',st:['ok','Optimal']},
  ];

  const SLIDERS = [
    {k:'modal',   label:'Modal Bahan Baku',          min:250000,max:2000000,step:50000,fmt:rp},
    {k:'ovenJam', label:'Kapasitas Oven',            min:2, max:12, step:0.5, fmt:v=>v+' jam'},
    {k:'mixerJam',label:'Kapasitas Mixer',           min:1, max:8,  step:0.5, fmt:v=>v+' jam'},
    {k:'sdmJam',  label:'Kapasitas SDM',             min:4, max:24, step:1,   fmt:v=>v+' jam kerja'},
    {k:'orderMin',label:'Pesanan Khusus â€” Roti Manis',min:0, max:250,step:5,   fmt:v=>v+' unit (Dmin)'},
  ];

  const barRow = (label, used, cap, isModal) => {
    const pct = Math.min(100, used/cap*100);
    return (
      <div className="brow" key={label}>
        <div className="btop"><span>{label}</span>
          <em>{isModal ? rp(used)+' / '+rp(cap) : Math.round(used)+' / '+cap+' menit'} â€¢ {Math.round(pct)}%</em></div>
        <div className="track"><div className={'fill'+(!isModal&&pct>85?' warn':'')} style={{width:pct+'%'}}/></div>
      </div>
    );
  };

  return (
    <div className="shell">
      <Sidebar page={page} setPage={setPage} goParams={goParams}/>
      <main className="main">
        {/* ---- Topbar ---- */}
        <header className="topbar">
          <button className="icon-btn"><Icon name="arrowR" size={15} style={{transform:'scaleX(-1)'}}/></button>
          <button className="icon-btn"><Icon name="arrowR" size={15}/></button>
          <div className="crumbs"><span>TEFA Bakery</span><span className="sep">&rsaquo;</span><b>{page}</b></div>
          <div className="top-right">
            <button className="icon-btn"><Icon name="help" size={16}/></button>
            <button className="icon-btn"><Icon name="mail" size={16}/></button>
            <button className="icon-btn"><Icon name="bell" size={16}/></button>
            <div className="user">
              <div className="avatar">RP</div>
              <div><div className="user-name">Raka Pratama</div><div className="user-role">Manajer Produksi</div></div>
              <Icon name="chevUD" size={14} style={{color:'#98A2B3'}}/>
            </div>
            <button className="btn-export" onClick={()=>window.print()}>
              <Icon name="download" size={15}/> Export Laporan
            </button>
          </div>
        </header>

        {page!=='Dashboard' ? (
          <ModulePage page={page} res={res} setPage={setPage}/>
        ) : (
        <>
          {/* ---- Page head ---- */}
          <div className="page-head">
            <div>
              <h1>Overview</h1>
              <div className="sub">Ringkasan optimalisasi produksi hari ini â€” solver MILP berjalan otomatis.</div>
            </div>
            <div className="head-actions">
              <button className="pill">Hari Ini <Icon name="chevD" size={14}/></button>
              <button className="pill" onClick={reset}><Icon name="refresh" size={14}/> Reset Data</button>
            </div>
          </div>

          {/* ---- Stat cards ---- */}
          <section className="stat-grid">
            <div className="card stat green">
              <div className="stat-top">
                <div className="stat-ico"><Icon name="coins" size={19}/></div>
                <div><div className="stat-title">Estimasi Laba Optimal</div>
                     <div className="stat-sub">Hasil solver MILP â€¢ 18 Okt 2026</div></div>
                <button className="dots-btn"><Icon name="dotsV" size={16}/></button>
              </div>
              <div className="stat-val">{rp(res.profit)}<span className="badge">{deltaStr}</span></div>
              <div className="stat-foot"><span>Lihat Rincian</span>
                <span className="foot-arrow"><Icon name="arrowR" size={13}/></span></div>
            </div>
            <div className="card stat">
              <div className="stat-top">
                <div className="stat-ico"><Icon name="wallet" size={19}/></div>
                <div><div className="stat-title">Modal Bahan Baku</div>
                     <div className="stat-sub">Kas harian untuk belanja bahan</div></div>
                <button className="dots-btn"><Icon name="dotsV" size={16}/></button>
              </div>
              <div className="stat-val">{rp(params.modal)}<span className="badge">{modalPct}% terpakai</span></div>
              <div className="stat-foot" onClick={goParams}><span>Atur Alokasi</span>
                <span className="foot-arrow"><Icon name="arrowR" size={13}/></span></div>
            </div>
            <div className="card stat">
              <div className="stat-top">
                <div className="stat-ico"><Icon name="box" size={19}/></div>
                <div><div className="stat-title">Rekomendasi Produksi</div>
                     <div className="stat-sub">Total unit optimal â€¢ 3 varian</div></div>
                <button className="dots-btn"><Icon name="dotsV" size={16}/></button>
              </div>
              <div className="stat-val">{totalUnit.toLocaleString('id-ID')} <small>unit</small><span className="badge">â–² 4,7%</span></div>
              <div className="stat-foot"><span>Analisis Performa</span>
                <span className="foot-arrow"><Icon name="arrowR" size={13}/></span></div>
            </div>
          </section>

          {/* ---- Rekomendasi + Chart ---- */}
          <section className="row reco">
            <div className="card">
              <div className="card-head">
                <div><h3>Rekomendasi Produksi</h3>
                     <div className="sub">Kombinasi optimal Xâ‚, Xâ‚‚, Xâ‚ƒ â€¢ Mixed-Integer Linear Programming</div></div>
                <div className="right">
                  <span className={'chip-status '+(res.status==='Optimal'?'ok':'err')}>
                    <span className="dot"></span>Solver: {res.status}</span>
                  <button className="dots-btn"><Icon name="dotsV" size={16}/></button>
                </div>
              </div>
              <div className="tile-grid">
                {tiles.map((t,i)=>(
                  <div className="tile" key={i}>
                    <div className="tile-top">
                      <div className="tile-ico" style={{background:t.tint}}><Icon name={t.icon} size={16}/></div>
                      <div className="tile-name">{t.name}</div>
                      <button className="dots-btn"><Icon name="dotsV" size={15}/></button>
                    </div>
                    {t.val
                      ? <div className="tile-val">{t.val}</div>
                      : <div className="tile-val">{t.qty.toLocaleString('id-ID')} <small>unit</small></div>}
                    <div className="tile-sub">{t.sub}</div>
                    <span className={'tile-status '+t.st[0]}>{t.st[1]}</span>
                  </div>
                ))}
              </div>
              {res.status!=='Optimal' &&
                <div className="infeasible">âš  Batasan tidak dapat dipenuhi â€” turunkan pesanan khusus (Dmin) atau tambah modal/kapasitas.</div>}
            </div>
            <ChartCard data={chartData} mode={mode} setMode={setMode}/>
          </section>

          {/* ---- Parameter + Efisiensi ---- */}
          <section className="row param" id="parameter">
            <div className="card">
              <div className="card-head">
                <div><h3>Parameter &amp; Simulasi</h3>
                     <div className="sub">Ubah batasan harian â€” solver menghitung ulang secara real-time</div></div>
                <div className="right"><span className="chip-status ok"><span className="dot"></span>Live</span></div>
              </div>
              <div className="sliders">
                {SLIDERS.map((s,i)=>(
                  <div className="srow" key={s.k} style={i===SLIDERS.length-1?{gridColumn:'1 / -1'}:null}>
                    <div className="srow-top"><label>{s.label}</label><span className="sval">{s.fmt(params[s.k])}</span></div>
                    <input type="range" min={s.min} max={s.max} step={s.step} value={params[s.k]}
                           onChange={set(s.k)}
                           style={{'--fill':((params[s.k]-s.min)/(s.max-s.min)*100)+'%'}}/>
                  </div>
                ))}
              </div>
              <div className="formula">
                <b>Fungsi Objektif:</b> Max Z = 2.000Â·Xâ‚ + 6.000Â·Xâ‚‚ + 5.000Â·Xâ‚ƒ<br/>
                <b>Kendala:</b> 3.000Â·Xâ‚+9.000Â·Xâ‚‚+7.000Â·Xâ‚ƒ â‰¤ Modal &nbsp;â€¢&nbsp; 2Xâ‚+5Xâ‚‚+3Xâ‚ƒ â‰¤ Oven &nbsp;â€¢&nbsp;
                1Xâ‚+3Xâ‚‚+2Xâ‚ƒ â‰¤ SDM &nbsp;â€¢&nbsp; Dmin â‰¤ Xi â‰¤ Dmax &nbsp;â€¢&nbsp; Xi âˆˆ â„¤âº
              </div>
            </div>
            <div className="card">
              <div className="card-head">
                <div><h3>Efisiensi Sumber Daya</h3>
                     <div className="sub">Beban kapasitas &amp; estimasi sisa bahan baku</div></div>
                <div className="right"><button className="pill">Hari Ini <Icon name="chevD" size={13}/></button></div>
              </div>
              <div className="bars">
                {barRow('Modal Bahan Baku', res.used.modal, params.modal, true)}
                {barRow('Kapasitas Oven',   res.used.oven,  res.caps.oven)}
                {barRow('Kapasitas Mixer',  res.used.mixer, res.caps.mixer)}
                {barRow('Kapasitas SDM',    res.used.sdm,   res.caps.sdm)}
              </div>
              <div className="divider"></div>
              <div className="btop"><span style={{fontWeight:700}}>Sisa Bahan Baku (estimasi)</span></div>
              <div className="chips2">
                {MATERIALS.map(m=>{
                  const left = Math.max(0,res.remain[m.id]);
                  const p2 = left/m.stock*100;
                  return (
                    <div className="chip" key={m.id}>
                      <div className="cname"><span>{m.name}</span><em>{fmtQty(left)} {m.unit}</em></div>
                      <div className="ctrack">
                        <div className="cfill" style={{width:p2+'%', background:p2<20?'#F59E0B':'var(--green)'}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ---- Tabel pesanan ---- */}
          <OrdersCard/>
        </>
        )}
      </main>
    </div>
  );
}

function OrdersCard(){
  const [q,setQ] = useState('');
  const [sel,setSel] = useState(()=>new Set());
  const rows = ORDERS.filter(o=>(o.act+' '+o.id).toLowerCase().includes(q.toLowerCase()));
  const all = rows.length>0 && rows.every(o=>sel.has(o.id));
  const toggle = id => setSel(s=>{const n=new Set(s); n.has(id)?n.delete(id):n.add(id); return n;});
  const toggleAll = () => setSel(s=>{const n=new Set(s);
    all ? rows.forEach(o=>n.delete(o.id)) : rows.forEach(o=>n.add(o.id)); return n;});
  return (
    <div className="card" style={{marginTop:16}}>
      <div className="card-head">
        <div><h3>Pesanan &amp; Aktivitas Terbaru</h3>
             <div className="sub">Pesanan khusus otomatis menjadi constraint minimum (X â‰¥ Dmin) pada solver</div></div>
        <div className="right table-tools">
          <div className="tsearch"><Icon name="search" size={14}/>
            <input placeholder="Cari pesananâ€¦" value={q} onChange={e=>setQ(e.target.value)}/></div>
          <button className="pill">Filter <Icon name="filter" size={13}/></button>
        </div>
      </div>
      <table>
        <thead><tr>
          <th style={{width:36}}><input type="checkbox" className="cbx" checked={all} onChange={toggleAll}/></th>
          <th>Aktivitas</th><th>Order ID</th><th>Deadline</th><th>Jumlah</th><th>Status</th><th style={{width:40}}></th>
        </tr></thead>
        <tbody>
          {rows.map(o=>(
            <tr key={o.id}>
              <td><input type="checkbox" className="cbx" checked={sel.has(o.id)} onChange={()=>toggle(o.id)}/></td>
              <td><div className="act">
                <div className="act-ico" style={{background:o.tint}}><Icon name={o.act.includes('Kering')?'cookie':'bread'} size={15}/></div>
                <div><div className="act-name">{o.act}</div><div className="act-sub">{o.sub}</div></div>
              </div></td>
              <td style={{fontWeight:600}}>{o.id}</td>
              <td>{o.deadline}</td>
              <td style={{fontWeight:600}}>{o.qty} unit</td>
              <td><span className={'st '+o.st}><span className="dot"></span>{o.status}</span></td>
              <td><button className="dots-btn"><Icon name="dots" size={16}/></button></td>
            </tr>
          ))}
          {rows.length===0 && <tr><td colSpan={7} style={{textAlign:'center',color:'var(--faint)',padding:22}}>
            Tidak ada pesanan yang cocok.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function ModulePage({page,res,setPage}){
  const go = id => setPage(id);
  const titles = {
    Optimasi:['Optimasi Produksi','Tentukan kombinasi produksi paling menguntungkan berdasarkan modal, kapasitas, bahan baku, dan pesanan minimum.'],
    'Bahan Baku':['Bahan Baku','Pantau ketersediaan bahan, kebutuhan resep, dan rekomendasi pembelian sebelum produksi dimulai.'],
    Pesanan:['Pesanan Pelanggan','Kelola pesanan rutin maupun pesanan khusus yang menjadi batas minimum pada solver.'],
    Peramalan:['Peramalan Permintaan','Gunakan riwayat penjualan untuk membaca tren kebutuhan produksi pada periode berikutnya.'],
    Penjadwalan:['Penjadwalan Produksi','Susun urutan produksi berdasarkan deadline, kapasitas mesin, dan ketersediaan tenaga kerja.'],
    Laporan:['Laporan & Analitik','Rangkum hasil produksi, penggunaan sumber daya, pendapatan, dan laba untuk evaluasi TEFA.'],
    Pengaturan:['Pengaturan Sistem','Kelola parameter operasional, notifikasi, dan preferensi kerja sistem TEFA.'],
    Bantuan:['Pusat Bantuan','Pelajari alur penggunaan sistem dan cara membaca rekomendasi produksi.'],
    Keluar:['Keluar dari Sistem','Pastikan pekerjaan dan perubahan parameter sudah tersimpan sebelum mengakhiri sesi.']
  };
  const [title,description] = titles[page];
  if(page==='Keluar') return (
    <div className="module-page">
      <div className="card" style={{maxWidth:560,margin:'70px auto',textAlign:'center'}}>
        <div className="ph-ico"><Icon name="logout" size={26}/></div>
        <h2 style={{fontSize:18}}>Akhiri sesi Manajer Produksi?</h2>
        <p style={{fontSize:12.5,color:'var(--muted)',lineHeight:1.6,margin:'8px auto 20px'}}>Data simulasi saat ini tetap tersimpan di halaman ini. Anda dapat kembali ke dashboard tanpa kehilangan parameter.</p>
        <div className="module-actions" style={{justifyContent:'center'}}>
          <button className="pill" onClick={()=>go('Dashboard')}>Kembali ke Dashboard</button>
          <button className="primary-btn" onClick={()=>go('Dashboard')}><Icon name="logout" size={15}/> Konfirmasi Keluar</button>
        </div>
      </div>
    </div>
  );
  return (
    <div className="module-page">
      <div className="module-intro">
        <div><h1>{title}</h1><p>{description}</p></div>
        <div className="module-actions">
          <button className="pill"><Icon name="refresh" size={14}/> Segarkan</button>
          <button className="primary-btn" onClick={()=>window.print()}><Icon name="download" size={14}/> Export</button>
        </div>
      </div>
      {page==='Optimasi' && <OptimizationModule res={res} go={go}/>}
      {page==='Bahan Baku' && <MaterialsModule res={res}/>}
      {page==='Pesanan' && <OrdersModule go={go}/>}
      {page==='Peramalan' && <ForecastModule res={res}/>}
      {page==='Penjadwalan' && <ScheduleModule/>}
      {page==='Laporan' && <ReportsModule res={res}/>}
      {page==='Pengaturan' && <SettingsModule/>}
      {page==='Bantuan' && <HelpModule/>}
    </div>
  );
}

function OptimizationModule({res,go}){
  const rows=[['Roti Manis','Xâ‚',res.x1,'Rp 2.000','Pesanan minimum'],['Roti Tawar','Xâ‚‚',res.x2,'Rp 6.000','Margin tertinggi'],['Roti Kering (Bagelan)','Xâ‚ƒ',res.x3,'Rp 5.000','Kapasitas bahan']];
  return <><div className="module-grid four">
    <div className="card metric-card"><div className="metric-label">Status solver</div><div className="metric-value" style={{color:'var(--green-text)'}}>Optimal</div><div className="metric-note">Semua kendala terpenuhi</div></div>
    <div className="card metric-card"><div className="metric-label">Laba maksimum</div><div className="metric-value">{rp(res.profit)}</div><div className="metric-note">Dari {rp(res.revenue)} pendapatan</div></div>
    <div className="card metric-card"><div className="metric-label">Total produksi</div><div className="metric-value">{(res.x1+res.x2+res.x3).toLocaleString('id-ID')} <small>unit</small></div><div className="metric-note">3 varian produk</div></div>
    <div className="card metric-card"><div className="metric-label">Pesanan khusus</div><div className="metric-value">{res.x1} <small>unit</small></div><div className="metric-note">Roti Manis sebagai Dmin</div></div>
  </div><div className="module-grid two">
    <div className="card"><div className="module-card-title"><div><h3>Rekomendasi keputusan produksi</h3><p>Kuantitas optimal hasil Mixed-Integer Linear Programming.</p></div><span className="chip-status ok"><span className="dot"></span>Layak</span></div>
      <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Produk</th><th>Variabel</th><th>Jumlah</th><th>Margin/unit</th><th>Alasan</th></tr></thead><tbody>{rows.map(r=><tr key={r[0]}><td><b>{r[0]}</b></td><td>{r[1]}</td><td><b>{r[2]} unit</b></td><td>{r[3]}</td><td>{r[4]}</td></tr>)}</tbody></table></div>
    </div>
    <div className="card"><div className="module-card-title"><div><h3>Langkah berikutnya</h3><p>Jalankan keputusan secara berurutan.</p></div></div><div className="module-list">
      {['Validasi stok bahan baku','Tetapkan jadwal produksi','Konfirmasi pesanan pelanggan'].map((x,i)=><div className="module-list-row" key={x}><div className="row-icon">{i+1}</div><div className="row-main"><strong>{x}</strong><span>{i===0?'Pastikan kebutuhan resep tersedia':i===1?'Alokasikan oven, mixer, dan SDM':'Kirim waktu selesai ke pelanggan'}</span></div><button className="pill" onClick={()=>go(i===0?'Bahan Baku':i===1?'Penjadwalan':'Pesanan')}>Buka</button></div>)}
    </div></div>
  </div></>;
}

function MaterialsModule({res}){
  return <><div className="module-grid four">{MATERIALS.map(m=><div className="card metric-card" key={m.id}><div className="metric-label">{m.name}</div><div className="metric-value">{fmtQty(Math.max(0,res.remain[m.id]))} <small>{m.unit}</small></div><div className="metric-note">{res.usage[m.id].toFixed(1).replace('.',',')} {m.unit} dipakai hari ini</div></div>)}</div>
  <div className="card"><div className="module-card-title"><div><h3>Rekap kebutuhan bahan baku</h3><p>Estimasi sisa stok setelah rekomendasi produksi diterapkan.</p></div><button className="primary-btn"><Icon name="download" size={14}/> Daftar Belanja</button></div><div className="data-table-wrap"><table className="data-table"><thead><tr><th>Bahan</th><th>Stok awal</th><th>Kebutuhan</th><th>Sisa</th><th>Kondisi</th></tr></thead><tbody>{MATERIALS.map(m=>{const left=Math.max(0,res.remain[m.id]);const low=left/m.stock<.2;return <tr key={m.id}><td><b>{m.name}</b><small style={{display:'block',color:'var(--muted)',marginTop:3}}>{m.id}</small></td><td>{fmtQty(m.stock)} {m.unit}</td><td>{fmtQty(res.usage[m.id])} {m.unit}</td><td><b>{fmtQty(left)} {m.unit}</b></td><td><span className={'st '+(low?'wait':'done')}><span className="dot"></span>{low?'Perlu restock':'Aman'}</span></td></tr>})}</tbody></table></div></div></>;
}

function OrdersModule({go}){
  return <><div className="module-grid four"><div className="card metric-card"><div className="metric-label">Total pesanan</div><div className="metric-value">5</div><div className="metric-note">Periode berjalan</div></div><div className="card metric-card"><div className="metric-label">Perlu diproses</div><div className="metric-value">2</div><div className="metric-note">Prioritas hari ini</div></div><div className="card metric-card"><div className="metric-label">Selesai</div><div className="metric-value">3</div><div className="metric-note trend-up">60% completion rate</div></div><div className="card metric-card"><div className="metric-label">Unit terpesan</div><div className="metric-value">395</div><div className="metric-note">Semua produk</div></div></div><OrdersCard/><div style={{display:'flex',justifyContent:'flex-end',marginTop:12}}><button className="primary-btn" onClick={()=>go('Optimasi')}>Gunakan pesanan sebagai constraint <Icon name="arrowR" size={14}/></button></div></>;
}

function ForecastModule({res}){
  return <><div className="module-grid two"><div className="card"><div className="module-card-title"><div><h3>Proyeksi permintaan 7 hari</h3><p>Baseline dari histori penjualan dan pesanan aktif.</p></div><span className="chip-status ok"><span className="dot"></span>Confidence 86%</span></div><div className="module-list">{['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'].map((d,i)=><div className="module-list-row" key={d}><div className="row-main"><strong>{d}</strong><span>{i<5?'Hari sekolah':'Akhir pekan'}</span></div><div style={{width:'45%'}}><div className="track"><div className="fill" style={{width:(58+i*5)+'%'}}/></div></div><div className="row-end">{110+i*14}<small>unit</small></div></div>)}</div></div><div className="card"><div className="module-card-title"><div><h3>Sinyal permintaan</h3><p>Insight untuk keputusan produksi.</p></div></div><div className="help-card"><div className="row-icon">â†‘</div><div><b>Tren meningkat</b><p>Permintaan diperkirakan naik 12% pada Jumatâ€“Sabtu. Siapkan stok tepung dan ragi lebih awal.</p></div></div><div style={{height:10}}/><div className="help-card"><div className="row-icon">!</div><div><b>Perhatikan kapasitas</b><p>Oven menjadi sumber daya paling sibuk pada skenario saat ini.</p></div></div></div></div><div className="card"><div className="module-card-title"><div><h3>Rekomendasi pembaruan solver</h3><p>Forecast menjadi input untuk Dmax dan prioritas produksi.</p></div><button className="primary-btn">Terapkan ke Optimasi</button></div><div className="formula"><b>Output model:</b> Roti Manis {res.x1} unit â€¢ Roti Tawar {res.x2} unit â€¢ Bagelan {res.x3} unit</div></div></>;
}

function ScheduleModule(){
  const cells=[['07.00â€“09.00','Roti Manis','Roti Manis','Roti Tawar','Roti Tawar','Bagelan'],['09.00â€“11.00','Roti Tawar','Bagelan','Roti Manis','Bagelan','Roti Manis'],['13.00â€“15.00','Bagelan','Roti Manis','Roti Tawar','Roti Manis','Bagelan']];
  return <><div className="module-grid four"><div className="card metric-card"><div className="metric-label">Shift aktif</div><div className="metric-value">2</div><div className="metric-note">Pagi & siang</div></div><div className="card metric-card"><div className="metric-label">Beban oven</div><div className="metric-value">84%</div><div className="metric-note">Kapasitas tertinggi</div></div><div className="card metric-card"><div className="metric-label">Beban SDM</div><div className="metric-value">71%</div><div className="metric-note">16 jam tersedia</div></div><div className="card metric-card"><div className="metric-label">Deadline aman</div><div className="metric-value">5/5</div><div className="metric-note trend-up">Tidak ada keterlambatan</div></div></div><div className="card"><div className="module-card-title"><div><h3>Jadwal produksi mingguan</h3><p>Urutan dibuat dari deadline pesanan dan efisiensi kapasitas mesin.</p></div><span className="chip-status ok"><span className="dot"></span>Sinkron</span></div><div className="schedule-grid"><div className="schedule-cell head">Jam</div>{['Sen','Sel','Rab','Kam','Jum'].map(x=><div className="schedule-cell head" key={x}>{x}<small style={{display:'block',fontWeight:500,marginTop:3}}>18 Okt</small></div>)}{cells.map((r,i)=><React.Fragment key={r[0]}><div className="schedule-cell time">{r[0]}</div>{r.slice(1).map((x,j)=><div className={'schedule-cell schedule-block '+(x==='Roti Tawar'?'blue':x==='Bagelan'?'amber':'')} key={j}>{x}<small style={{display:'block',fontWeight:500,marginTop:5}}>{i===0?'Prioritas': 'Rutin'}</small></div>)}</React.Fragment>)}</div></div></>;
}

function ReportsModule({res}){
  return <><div className="module-grid four"><div className="card metric-card"><div className="metric-label">Pendapatan</div><div className="metric-value">{rp(res.revenue)}</div><div className="metric-note">Estimasi harian</div></div><div className="card metric-card"><div className="metric-label">Laba bersih</div><div className="metric-value">{rp(res.profit)}</div><div className="metric-note trend-up">Naik dari kemarin</div></div><div className="card metric-card"><div className="metric-label">Margin rata-rata</div><div className="metric-value">{Math.round(res.profit/res.revenue*100)}%</div><div className="metric-note">Setelah biaya bahan</div></div><div className="card metric-card"><div className="metric-label">Utilisasi kapasitas</div><div className="metric-value">84%</div><div className="metric-note">Oven sebagai bottleneck</div></div></div><div className="module-grid two"><div className="card"><div className="module-card-title"><div><h3>Ringkasan performa periode</h3><p>Perbandingan hasil aktual dan proyeksi.</p></div><button className="pill">Oktober 2026 <Icon name="chevD" size={13}/></button></div><div className="progress-item"><div className="progress-label"><span>Target pendapatan</span><span>78%</span></div><div className="track"><div className="fill" style={{width:'78%'}}/></div></div><div className="progress-item"><div className="progress-label"><span>Target laba</span><span>86%</span></div><div className="track"><div className="fill" style={{width:'86%'}}/></div></div><div className="progress-item"><div className="progress-label"><span>Ketepatan deadline</span><span>100%</span></div><div className="track"><div className="fill" style={{width:'100%'}}/></div></div></div><div className="card"><div className="module-card-title"><div><h3>Export tersedia</h3><p>Dokumen siap untuk evaluasi guru dan manajer.</p></div></div><div className="module-list">{['Laporan produksi harian','Rekap bahan baku','Analitik laba & kapasitas'].map(x=><div className="module-list-row" key={x}><div className="row-icon"><Icon name="doc" size={16}/></div><div className="row-main"><strong>{x}</strong><span>PDF â€¢ Diperbarui barusan</span></div><button className="pill"><Icon name="download" size={13}/> Unduh</button></div>)}</div></div></div></>;
}

function SettingsModule(){
  return <div className="module-grid two"><div className="card"><div className="module-card-title"><div><h3>Parameter operasional</h3><p>Nilai awal digunakan sebagai batasan solver harian.</p></div><button className="primary-btn">Simpan</button></div>{[['Modal bahan baku','Rp 750.000'],['Jam operasi oven','8 jam / hari'],['Jam operasi mixer','4 jam / hari'],['Tenaga kerja','16 jam / hari']].map(x=><div className="setting-row" key={x[0]}><div><strong>{x[0]}</strong><span>{x[1]}</span></div><button className="pill">Ubah</button></div>)}</div><div className="card"><div className="module-card-title"><div><h3>Preferensi notifikasi</h3><p>Atur kapan sistem memberi pengingat.</p></div></div>{['Deadline pesanan mendekat','Stok bahan di bawah minimum','Solver selesai menghitung'].map((x,i)=><div className="setting-row" key={x}><div><strong>{x}</strong><span>{i===0?'2 jam sebelum deadline':'Notifikasi di dashboard'}</span></div><button className="toggle on"><i/></button></div>)}</div></div>;
}

function HelpModule(){
  return <><div className="module-grid two"><div className="card"><div className="module-card-title"><div><h3>Alur kerja TEFA</h3><p>Ikuti urutan ini untuk hasil rekomendasi yang konsisten.</p></div></div><div className="module-list">{[['01','Masukkan pesanan','Pesanan khusus otomatis menjadi Dmin.'],['02','Cek bahan baku','Pastikan stok cukup untuk resep produk.'],['03','Jalankan optimasi','Solver memilih kombinasi laba maksimum.'],['04','Jadwalkan produksi','Bagi beban mesin dan SDM sesuai deadline.']].map(x=><div className="module-list-row" key={x[0]}><div className="row-icon">{x[0]}</div><div className="row-main"><strong>{x[1]}</strong><span>{x[2]}</span></div></div>)}</div></div><div className="card"><div className="module-card-title"><div><h3>Panduan membaca hasil</h3><p>Istilah penting dalam dashboard.</p></div></div>{[['Optimal','Semua kendala modal, mesin, SDM, dan pesanan terpenuhi.'],['Infeasible','Batasan tidak dapat dipenuhi; tambah kapasitas atau turunkan Dmin.'],['Utilisasi','Persentase kapasitas yang terpakai untuk rencana produksi.']].map(x=><div className="help-card" style={{marginBottom:10}} key={x[0]}><div><b>{x[0]}</b><p>{x[1]}</p></div></div>)}</div></div><div className="card"><div className="module-card-title"><div><h3>Butuh bantuan lebih lanjut?</h3><p>Hubungi pengelola sistem TEFA untuk koreksi data master atau parameter.</p></div><button className="primary-btn"><Icon name="mail" size={14}/> Hubungi admin</button></div></div></>;
}

export default App;

