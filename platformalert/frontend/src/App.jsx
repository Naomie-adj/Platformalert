import { useState, useEffect } from "react";

const MOCK_PRODUCTS = [
  { id:1, name:"Sony WH-1000XM5", url:"https://www.amazon.fr/dp/B09XS7JWHH", site:"Amazon", targetPrice:280, currentPrice:320, history:[380,360,345,330,320,315,320], image:"🎧", alert:false },
  { id:2, name:"iPhone 15 Pro 128GB", url:"https://www.fnac.com/iphone15pro", site:"Fnac", targetPrice:950, currentPrice:949, history:[1199,1099,1050,999,980,960,949], image:"📱", alert:true },
  { id:3, name:"MacBook Air M3", url:"https://www.amazon.fr/dp/macbookairm3", site:"Amazon", targetPrice:1100, currentPrice:1149, history:[1299,1250,1200,1180,1160,1149,1149], image:"💻", alert:false },
];

const DAYS = ["J-6","J-5","J-4","J-3","J-2","J-1","Auj."];

function Sparkline({ data, up }) {
  const min = Math.min(...data), max = Math.max(...data);
  const r = max - min || 1;
  const w = 100, h = 36;
  const pts = data.map((v,i) => `${(i/(data.length-1))*w},${h-((v-min)/r)*(h-8)-4}`);
  const color = up ? "#10b981" : "#ef4444";
  return (
    <svg width={w} height={h} style={{overflow:"visible"}}>
      <defs>
        <linearGradient id={"g"+up} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={`M${pts.join("L")} L${(data.length-1)/(data.length-1)*w},${h} L0,${h} Z`} fill={`url(#g${up})`}/>
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx={(data.length-1)/(data.length-1)*w} cy={h-((data[data.length-1]-min)/r)*(h-8)-4} r="3" fill={color}/>
    </svg>
  );
}

function Chart({ data, targetPrice }) {
  const [hover, setHover] = useState(null);
  const min = Math.min(...data, targetPrice)-30;
  const max = Math.max(...data, targetPrice)+30;
  const r = max-min;
  const w=300, h=140, pl=40, pb=20, pt=16;
  const iw=w-pl-8, ih=h-pb-pt;
  const px=(i)=>pl+(i/(data.length-1))*iw;
  const py=(v)=>pt+ih-((v-min)/r)*ih;
  const ty=py(targetPrice);
  const pathD=data.map((v,i)=>`${i===0?"M":"L"}${px(i)},${py(v)}`).join(" ");
  const areaD=pathD+` L${px(data.length-1)},${pt+ih} L${px(0)},${pt+ih} Z`;
  return (
    <svg width={w} height={h} style={{overflow:"visible"}}>
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {[0,0.33,0.66,1].map((t,i)=>{
        const y=pt+t*ih, val=Math.round(max-t*r);
        return <g key={i}>
          <line x1={pl} y1={y} x2={w-8} y2={y} stroke="#f1f5f9" strokeWidth="1"/>
          <text x={pl-6} y={y+4} fill="#94a3b8" fontSize="9" textAnchor="end">{val}€</text>
        </g>;
      })}
      {DAYS.map((d,i)=>(
        <text key={i} x={px(i)} y={h-4} fill="#94a3b8" fontSize="9" textAnchor="middle">{d}</text>
      ))}
      <line x1={pl} y1={ty} x2={w-8} y2={ty} stroke="#f59e0b" strokeWidth="1" strokeDasharray="5,3"/>
      <rect x={w-36} y={ty-9} width={34} height={14} rx="3" fill="#fef3c7"/>
      <text x={w-19} y={ty+1} fill="#92400e" fontSize="8" textAnchor="middle" fontWeight="600">cible</text>
      <path d={areaD} fill="url(#cg)"/>
      <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round"/>
      {data.map((v,i)=>(
        <g key={i} style={{cursor:"pointer"}} onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(null)}>
          <circle cx={px(i)} cy={py(v)} r={hover===i?5:3} fill={hover===i?"#4f46e5":"#6366f1"} stroke="white" strokeWidth="1.5"/>
          {hover===i && <>
            <rect x={px(i)-22} y={py(v)-26} width={44} height={18} rx="4" fill="#1e293b"/>
            <text x={px(i)} y={py(v)-13} fill="white" fontSize="10" textAnchor="middle" fontWeight="600">{v}€</text>
          </>}
        </g>
      ))}
    </svg>
  );
}

export default function App() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [tab, setTab] = useState("dashboard");
  const [form, setForm] = useState({name:"",email:"",url:"",site:"Amazon",targetPrice:"",image:"🛍️"});
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(()=>{
    const iv=setInterval(()=>setTick(t=>t+1),8000);
    return ()=>clearInterval(iv);
  },[]);

  useEffect(()=>{
    if(!tick) return;
    setProducts(prev=>prev.map(p=>{
      const delta=Math.round((Math.random()-.5)*12);
      const np=Math.max(p.currentPrice+delta,1);
      const alert=np<=p.targetPrice;
      if(!p.alert&&alert){ setToast(`Prix atteint : ${p.name} à ${np}€`); setTimeout(()=>setToast(null),4000); }
      return {...p,currentPrice:np,alert,history:[...p.history.slice(1),np]};
    }));
  },[tick]);

  const handleSubmit=(e)=>{
    e.preventDefault();
    if(!form.name||!form.url||!form.targetPrice) return;
    const tp=parseFloat(form.targetPrice);
    setProducts(prev=>[{
      id:Date.now(),name:form.name,url:form.url,site:form.site,
      targetPrice:tp,currentPrice:Math.round(tp*1.12),
      history:Array.from({length:7},(_,i)=>Math.round(tp*(1+(7-i)*0.025))),
      image:form.image,alert:false,
    },...prev]);
    setToast(`${form.name} ajouté à la surveillance`);
    setTimeout(()=>{ setToast(null); setTab("dashboard"); },2000);
    setForm({name:"",url:"",site:"Amazon",targetPrice:"",image:"🛍️"});
  };

  const alerts=products.filter(p=>p.alert).length;
  const savings=products.reduce((a,p)=>a+Math.max(0,p.currentPrice-p.targetPrice),0);

  return (
    <div style={{minHeight:"100vh",background:"#f8fafc",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",color:"#0f172a"}}>

      {/* Toast */}
      {toast&&(
        <div style={{position:"fixed",top:20,right:20,zIndex:9999,background:"#1e293b",color:"white",padding:"14px 20px",borderRadius:"12px",fontSize:"13px",fontWeight:500,boxShadow:"0 10px 40px rgba(0,0,0,0.15)",display:"flex",alignItems:"center",gap:"10px",maxWidth:"320px"}}>
          <span style={{fontSize:"18px"}}>✓</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div style={{background:"white",borderBottom:"1px solid #e2e8f0",padding:"0 40px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"60px",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <div style={{width:32,height:32,borderRadius:"8px",background:"#4f46e5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>📊</div>
          <span style={{fontWeight:700,fontSize:"16px",letterSpacing:"-0.3px"}}>PlatformAlert</span>
        </div>
        <nav style={{display:"flex",gap:"4px"}}>
          {[{id:"dashboard",label:"Dashboard"},{id:"add",label:"+ Ajouter"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"6px 16px",borderRadius:"8px",border:"none",cursor:"pointer",fontSize:"13px",fontWeight:500,background:tab===t.id?"#f1f0fe":"transparent",color:tab===t.id?"#4f46e5":"#64748b",transition:"all 0.15s"}}>
              {t.label}
            </button>
          ))}
        </nav>
        {alerts>0&&(
          <div style={{display:"flex",alignItems:"center",gap:"6px",background:"#fef2f2",border:"1px solid #fecaca",borderRadius:"20px",padding:"4px 12px"}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:"#ef4444",display:"inline-block"}}/>
            <span style={{fontSize:"12px",fontWeight:600,color:"#dc2626"}}>{alerts} alerte{alerts>1?"s":""}</span>
          </div>
        )}
      </div>

      <div style={{maxWidth:"1000px",margin:"0 auto",padding:"32px 40px"}}>

        {/* DASHBOARD */}
        {tab==="dashboard"&&(
          <>
            {/* Stats */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"16px",marginBottom:"28px"}}>
              {[
                {label:"Produits surveillés",value:products.length,sub:"actifs",color:"#4f46e5",bg:"#f1f0fe"},
                {label:"Alertes déclenchées",value:alerts,sub:"prix atteints",color:"#ef4444",bg:"#fef2f2"},
                {label:"Économies potentielles",value:savings.toFixed(0)+"€",sub:"au-dessus de la cible",color:"#10b981",bg:"#f0fdf4"},
              ].map((s,i)=>(
                <div key={i} style={{background:"white",border:"1px solid #e2e8f0",borderRadius:"12px",padding:"20px 24px"}}>
                  <div style={{fontSize:"12px",color:"#94a3b8",fontWeight:500,marginBottom:"8px",textTransform:"uppercase",letterSpacing:"0.5px"}}>{s.label}</div>
                  <div style={{fontSize:"28px",fontWeight:700,color:s.color,marginBottom:"4px"}}>{s.value}</div>
                  <div style={{fontSize:"12px",color:"#94a3b8"}}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Products */}
            <div style={{background:"white",border:"1px solid #e2e8f0",borderRadius:"16px",overflow:"hidden"}}>
              <div style={{padding:"20px 24px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontWeight:600,fontSize:"15px"}}>Produits suivis</span>
                <span style={{fontSize:"12px",color:"#94a3b8"}}>{products.length} produit{products.length>1?"s":""}</span>
              </div>
              {products.map((p,idx)=>{
                const isBelow=p.currentPrice<=p.targetPrice;
                const diff=p.currentPrice-p.targetPrice;
                const pct=Math.round((diff/p.targetPrice)*100);
                const isOpen=selected?.id===p.id;
                return (
                  <div key={p.id} style={{borderBottom:idx<products.length-1?"1px solid #f1f5f9":"none"}}>
                    <div onClick={()=>setSelected(isOpen?null:p)} style={{padding:"18px 24px",display:"flex",alignItems:"center",gap:"16px",cursor:"pointer",transition:"background 0.15s",background:isOpen?"#fafafa":"white"}}>
                      <div style={{width:44,height:44,borderRadius:"10px",background:"#f8fafc",border:"1px solid #e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px",flexShrink:0}}>{p.image}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}>
                          <span style={{fontWeight:600,fontSize:"14px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.name}</span>
                          <span style={{fontSize:"11px",padding:"2px 8px",borderRadius:"20px",background:"#f1f5f9",color:"#64748b",flexShrink:0}}>{p.site}</span>
                          {p.alert&&<span style={{fontSize:"11px",padding:"2px 8px",borderRadius:"20px",background:"#fef3c7",color:"#92400e",fontWeight:600,flexShrink:0}}>Prix atteint</span>}
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                          <span style={{fontSize:"20px",fontWeight:700,color:isBelow?"#10b981":"#0f172a"}}>{p.currentPrice.toFixed(0)}€</span>
                          <span style={{fontSize:"12px",color:"#94a3b8"}}>cible {p.targetPrice}€</span>
                          <span style={{fontSize:"12px",fontWeight:600,color:isBelow?"#10b981":"#ef4444",display:"flex",alignItems:"center",gap:"2px"}}>
                            {isBelow?"↓":"↑"} {Math.abs(pct)}%
                          </span>
                        </div>
                      </div>
                      <div style={{flexShrink:0}}><Sparkline data={p.history} up={isBelow}/></div>
                      <div style={{color:"#cbd5e1",fontSize:"12px",flexShrink:0}}>{isOpen?"▲":"▼"}</div>
                    </div>

                    {isOpen&&(
                      <div style={{padding:"20px 24px 24px",background:"#fafafa",borderTop:"1px solid #f1f5f9",display:"flex",gap:"32px",flexWrap:"wrap"}}>
                        <div>
                          <div style={{fontSize:"11px",color:"#94a3b8",marginBottom:"12px",textTransform:"uppercase",letterSpacing:"0.5px",fontWeight:500}}>Historique 7 jours</div>
                          <Chart data={p.history} targetPrice={p.targetPrice}/>
                        </div>
                        <div style={{display:"flex",flexDirection:"column",gap:"10px",minWidth:"160px"}}>
                          {[
                            {label:"Plus bas",value:Math.min(...p.history)+"€",color:"#10b981"},
                            {label:"Plus haut",value:Math.max(...p.history)+"€",color:"#ef4444"},
                            {label:"Écart actuel",value:(p.currentPrice>p.targetPrice?"+":"")+diff.toFixed(0)+"€",color:isBelow?"#10b981":"#ef4444"},
                          ].map((s,i)=>(
                            <div key={i} style={{background:"white",border:"1px solid #e2e8f0",borderRadius:"10px",padding:"12px 16px"}}>
                              <div style={{fontSize:"11px",color:"#94a3b8",marginBottom:"3px"}}>{s.label}</div>
                              <div style={{fontWeight:700,color:s.color,fontSize:"16px"}}>{s.value}</div>
                            </div>
                          ))}
                          <a href={p.url} target="_blank" rel="noreferrer" style={{display:"block",textAlign:"center",background:"#4f46e5",color:"white",padding:"10px 16px",borderRadius:"10px",fontWeight:600,fontSize:"13px",textDecoration:"none",marginTop:"4px"}}>
                            Voir sur {p.site} →
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ADD FORM */}
        {tab==="add"&&(
          <div style={{maxWidth:"520px",margin:"0 auto"}}>
            <div style={{marginBottom:"24px"}}>
              <h1 style={{fontWeight:700,fontSize:"22px",marginBottom:"6px"}}>Ajouter un produit</h1>
              <p style={{color:"#64748b",fontSize:"14px",margin:0}}>Recevez une alerte email dès que le prix baisse.</p>
            </div>
            <div style={{background:"white",border:"1px solid #e2e8f0",borderRadius:"16px",padding:"28px"}}>
              <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:"18px"}}>
                <div>
                  <label style={{fontSize:"12px",fontWeight:600,color:"#374151",marginBottom:"8px",display:"block",textTransform:"uppercase",letterSpacing:"0.5px"}}>Icône</label>
                  <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                    {["🛍️","📱","💻","🎧","📷","⌚","🎮","📺","🏠","👟"].map(e=>(
                      <button key={e} type="button" onClick={()=>setForm(f=>({...f,image:e}))} style={{width:38,height:38,borderRadius:"8px",fontSize:"18px",border:form.image===e?"2px solid #4f46e5":"1px solid #e2e8f0",background:form.image===e?"#f1f0fe":"white",cursor:"pointer",transition:"all 0.15s"}}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
                {[
                  {label:"Adresse email",key:"email",placeholder:"votre@email.com",type:"email"},
                  {label:"Nom du produit",key:"name",placeholder:"Ex: Sony WH-1000XM5",type:"text"},
                  {label:"URL du produit",key:"url",placeholder:"https://www.amazon.fr/dp/...",type:"url"},
                  {label:"Prix cible (€)",key:"targetPrice",placeholder:"280",type:"number"},
                ].map(f=>(
                  <div key={f.key}>
                    <label style={{fontSize:"12px",fontWeight:600,color:"#374151",marginBottom:"6px",display:"block",textTransform:"uppercase",letterSpacing:"0.5px"}}>{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e=>setForm(prev=>({...prev,[f.key]:e.target.value}))}
                      style={{width:"100%",padding:"10px 14px",borderRadius:"8px",border:"1px solid #e2e8f0",color:"#0f172a",fontSize:"14px",outline:"none",boxSizing:"border-box",transition:"border 0.15s"}}
                      onFocus={e=>e.target.style.borderColor="#4f46e5"}
                      onBlur={e=>e.target.style.borderColor="#e2e8f0"}
                    />
                  </div>
                ))}
                <div>
                  <label style={{fontSize:"12px",fontWeight:600,color:"#374151",marginBottom:"6px",display:"block",textTransform:"uppercase",letterSpacing:"0.5px"}}>Site</label>
                  <select value={form.site} onChange={e=>setForm(f=>({...f,site:e.target.value}))} style={{width:"100%",padding:"10px 14px",borderRadius:"8px",border:"1px solid #e2e8f0",color:"#0f172a",fontSize:"14px",outline:"none",background:"white"}}>
                    <option>Amazon</option><option>Fnac</option><option>Cdiscount</option><option>Autre</option>
                  </select>
                </div>
                <button type="submit" style={{marginTop:"4px",padding:"12px",borderRadius:"10px",border:"none",background:"#4f46e5",color:"white",fontWeight:600,fontSize:"14px",cursor:"pointer",transition:"background 0.15s"}}
                  onMouseEnter={e=>e.target.style.background="#4338ca"}
                  onMouseLeave={e=>e.target.style.background="#4f46e5"}
                >
                  Activer la surveillance
                </button>
              </form>
            </div>
            <div style={{marginTop:"14px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:"10px",padding:"14px 18px",display:"flex",gap:"10px",alignItems:"flex-start"}}>
              <span style={{color:"#4f46e5",fontSize:"16px",marginTop:"1px"}}>ℹ</span>
              <p style={{margin:0,fontSize:"12px",color:"#64748b",lineHeight:1.6}}>
                Scraping toutes les <strong style={{color:"#374151"}}>30 minutes</strong>. Email automatique dès que le prix atteint votre cible. Historique conservé sur <strong style={{color:"#374151"}}>6 mois</strong>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
