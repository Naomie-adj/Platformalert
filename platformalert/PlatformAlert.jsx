import { useState, useEffect } from "react";

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Sony WH-1000XM5",
    url: "https://www.amazon.fr/dp/B09XS7JWHH",
    site: "Amazon",
    targetPrice: 280,
    currentPrice: 320,
    history: [380, 360, 345, 330, 320, 315, 320],
    image: "🎧",
    alert: false,
  },
  {
    id: 2,
    name: "iPhone 15 Pro 128GB",
    url: "https://www.fnac.com/iphone15pro",
    site: "Fnac",
    targetPrice: 950,
    currentPrice: 949,
    history: [1199, 1099, 1050, 999, 980, 960, 949],
    image: "📱",
    alert: true,
  },
  {
    id: 3,
    name: "MacBook Air M3",
    url: "https://www.amazon.fr/dp/macbookairm3",
    site: "Amazon",
    targetPrice: 1100,
    currentPrice: 1149,
    history: [1299, 1250, 1200, 1180, 1160, 1149, 1149],
    image: "💻",
    alert: false,
  },
];

const DAYS = ["J-6", "J-5", "J-4", "J-3", "J-2", "J-1", "Auj."];

function Sparkline({ data, color = "#00f5a0" }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 120, h = 40;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 8) - 4;
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / range) * (h - 8) - 4;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i === data.length - 1 ? 4 : 2}
            fill={color}
          />
        );
      })}
    </svg>
  );
}

function MiniChart({ data, targetPrice }) {
  const min = Math.min(...data, targetPrice) - 20;
  const max = Math.max(...data, targetPrice) + 20;
  const range = max - min;
  const w = 280, h = 120;
  const pts = data.map((v, i) => {
    const x = 32 + (i / (data.length - 1)) * (w - 40);
    const y = h - 16 - ((v - min) / range) * (h - 32);
    return { x, y, v };
  });
  const targetY = h - 16 - ((targetPrice - min) / range) * (h - 32);
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaD = pathD + ` L${pts[pts.length - 1].x},${h - 16} L${pts[0].x},${h - 16} Z`;

  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00f5a0" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#00f5a0" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const y = 16 + t * (h - 32);
        const val = Math.round(max - t * range);
        return (
          <g key={i}>
            <line x1={32} y1={y} x2={w - 8} y2={y} stroke="#ffffff10" strokeWidth="1" />
            <text x={28} y={y + 4} fill="#ffffff40" fontSize="9" textAnchor="end">{val}€</text>
          </g>
        );
      })}
      {/* Target price line */}
      <line x1={32} y1={targetY} x2={w - 8} y2={targetY} stroke="#f59e0b" strokeWidth="1" strokeDasharray="4,3" />
      <text x={w - 6} y={targetY + 4} fill="#f59e0b" fontSize="9" textAnchor="start">Cible</text>
      {/* Area */}
      <path d={areaD} fill="url(#areaGrad)" />
      {/* Line */}
      <path d={pathD} fill="none" stroke="#00f5a0" strokeWidth="2" strokeLinejoin="round" />
      {/* Points + labels */}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={i === pts.length - 1 ? 5 : 3} fill="#00f5a0" />
          <text x={p.x} y={p.y - 8} fill="#ffffff80" fontSize="8" textAnchor="middle">
            {DAYS[i]}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function PlatformAlert() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [form, setForm] = useState({ name: "", url: "", site: "Amazon", targetPrice: "", image: "🛍️" });
  const [submitted, setSubmitted] = useState(false);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 8000);
    return () => clearInterval(interval);
  }, []);

  // Simulate price fluctuation
  useEffect(() => {
    if (tick === 0) return;
    setProducts(prev => prev.map(p => {
      const delta = Math.round((Math.random() - 0.5) * 10);
      const newPrice = Math.max(p.currentPrice + delta, 1);
      const wasAlert = p.alert;
      const nowAlert = newPrice <= p.targetPrice;
      if (!wasAlert && nowAlert) {
        setToast(`🎉 Alerte prix ! ${p.name} est à ${newPrice}€`);
        setTimeout(() => setToast(null), 4000);
      }
      return {
        ...p,
        currentPrice: newPrice,
        alert: nowAlert,
        history: [...p.history.slice(1), newPrice],
      };
    }));
  }, [tick]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.url || !form.targetPrice) return;
    const newProduct = {
      id: Date.now(),
      name: form.name,
      url: form.url,
      site: form.site,
      targetPrice: parseFloat(form.targetPrice),
      currentPrice: parseFloat(form.targetPrice) * (1 + Math.random() * 0.3 + 0.05),
      history: Array.from({ length: 7 }, (_, i) =>
        parseFloat(form.targetPrice) * (1 + (7 - i) * 0.03 + Math.random() * 0.02)
      ).map(v => Math.round(v)),
      image: form.image,
      alert: false,
    };
    setProducts(prev => [newProduct, ...prev]);
    setSubmitted(true);
    setToast(`✅ ${form.name} ajouté à la surveillance !`);
    setTimeout(() => { setToast(null); setSubmitted(false); setActiveTab("dashboard"); }, 2000);
    setForm({ name: "", url: "", site: "Amazon", targetPrice: "", image: "🛍️" });
  };

  const alertCount = products.filter(p => p.alert).length;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0e1a",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      color: "#e2e8f0",
      padding: "0",
    }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: "linear-gradient(135deg, #00f5a0, #00d4aa)",
          color: "#0a0e1a", padding: "12px 20px", borderRadius: "12px",
          fontWeight: 700, fontSize: "14px", boxShadow: "0 8px 32px #00f5a040",
          animation: "slideIn 0.3s ease",
        }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        borderBottom: "1px solid #ffffff10",
        padding: "0 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: "64px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: 36, height: 36, borderRadius: "10px",
            background: "linear-gradient(135deg, #00f5a0, #00d4aa)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "18px",
          }}>📊</div>
          <span style={{ fontWeight: 800, fontSize: "18px", letterSpacing: "-0.5px" }}>
            Platform<span style={{ color: "#00f5a0" }}>Alert</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {[
            { id: "dashboard", label: "📋 Dashboard" },
            { id: "add", label: "➕ Ajouter" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: "8px 16px", borderRadius: "8px", border: "none",
              cursor: "pointer", fontSize: "13px", fontWeight: 600,
              background: activeTab === tab.id ? "linear-gradient(135deg, #00f5a0, #00d4aa)" : "transparent",
              color: activeTab === tab.id ? "#0a0e1a" : "#94a3b8",
              transition: "all 0.2s",
            }}>
              {tab.label}
            </button>
          ))}
        </div>
        {alertCount > 0 && (
          <div style={{
            background: "linear-gradient(135deg, #f59e0b, #ef4444)",
            borderRadius: "20px", padding: "4px 12px",
            fontSize: "12px", fontWeight: 700, color: "white",
          }}>
            🔔 {alertCount} alerte{alertCount > 1 ? "s" : ""}
          </div>
        )}
      </div>

      <div style={{ padding: "32px", maxWidth: "1100px", margin: "0 auto" }}>

        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <div>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
              {[
                { label: "Produits suivis", value: products.length, icon: "📦", color: "#00f5a0" },
                { label: "Alertes actives", value: alertCount, icon: "🔔", color: "#f59e0b" },
                { label: "Économies potentielles", value: `${products.reduce((acc, p) => acc + Math.max(0, p.currentPrice - p.targetPrice), 0).toFixed(0)}€`, icon: "💰", color: "#818cf8" },
              ].map((stat, i) => (
                <div key={i} style={{
                  background: "linear-gradient(135deg, #1e293b, #0f172a)",
                  border: "1px solid #ffffff10", borderRadius: "16px",
                  padding: "20px 24px", display: "flex", alignItems: "center", gap: "16px",
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: "12px", fontSize: "22px",
                    background: `${stat.color}15`, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{stat.icon}</div>
                  <div>
                    <div style={{ fontSize: "24px", fontWeight: 800, color: stat.color }}>{stat.value}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Products list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {products.map(p => {
                const pct = Math.round(((p.currentPrice - p.targetPrice) / p.targetPrice) * 100);
                const isBelow = p.currentPrice <= p.targetPrice;
                return (
                  <div key={p.id}
                    onClick={() => setSelected(selected?.id === p.id ? null : p)}
                    style={{
                      background: "linear-gradient(135deg, #1e293b, #0f172a)",
                      border: `1px solid ${p.alert ? "#f59e0b40" : "#ffffff10"}`,
                      borderRadius: "16px", padding: "20px 24px",
                      cursor: "pointer", transition: "all 0.2s",
                      boxShadow: p.alert ? "0 0 20px #f59e0b20" : "none",
                    }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: "12px", fontSize: "24px",
                        background: "#ffffff08", display: "flex", alignItems: "center", justifyContent: "center",
                      }}>{p.image}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <span style={{ fontWeight: 700, fontSize: "15px" }}>{p.name}</span>
                          <span style={{
                            fontSize: "10px", padding: "2px 8px", borderRadius: "20px",
                            background: "#ffffff10", color: "#94a3b8",
                          }}>{p.site}</span>
                          {p.alert && (
                            <span style={{
                              fontSize: "10px", padding: "2px 8px", borderRadius: "20px",
                              background: "#f59e0b20", color: "#f59e0b", fontWeight: 700,
                            }}>🎯 PRIX ATTEINT</span>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          <span style={{ fontSize: "22px", fontWeight: 800, color: isBelow ? "#00f5a0" : "#e2e8f0" }}>
                            {p.currentPrice.toFixed(0)}€
                          </span>
                          <span style={{ fontSize: "12px", color: "#64748b" }}>
                            cible : {p.targetPrice}€
                          </span>
                          <span style={{
                            fontSize: "12px", fontWeight: 700,
                            color: isBelow ? "#00f5a0" : "#f87171",
                          }}>
                            {isBelow ? "▼" : "▲"} {Math.abs(pct)}%
                          </span>
                        </div>
                      </div>
                      <Sparkline data={p.history} color={isBelow ? "#00f5a0" : "#f87171"} />
                      <div style={{ color: "#475569", fontSize: "18px" }}>
                        {selected?.id === p.id ? "▲" : "▼"}
                      </div>
                    </div>

                    {/* Expanded chart */}
                    {selected?.id === p.id && (
                      <div style={{
                        marginTop: "24px", paddingTop: "24px",
                        borderTop: "1px solid #ffffff10",
                        display: "flex", gap: "32px", alignItems: "flex-start",
                      }}>
                        <div>
                          <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
                            Historique des prix (7 jours)
                          </div>
                          <MiniChart data={p.history} targetPrice={p.targetPrice} />
                        </div>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                          <div style={{ background: "#ffffff05", borderRadius: "12px", padding: "16px" }}>
                            <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>Prix le plus bas</div>
                            <div style={{ fontWeight: 700, color: "#00f5a0" }}>{Math.min(...p.history)}€</div>
                          </div>
                          <div style={{ background: "#ffffff05", borderRadius: "12px", padding: "16px" }}>
                            <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>Prix le plus haut</div>
                            <div style={{ fontWeight: 700, color: "#f87171" }}>{Math.max(...p.history)}€</div>
                          </div>
                          <div style={{ background: "#ffffff05", borderRadius: "12px", padding: "16px" }}>
                            <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>Économie potentielle</div>
                            <div style={{ fontWeight: 700, color: "#818cf8" }}>
                              {Math.max(0, p.currentPrice - p.targetPrice).toFixed(0)}€
                            </div>
                          </div>
                          <a href={p.url} target="_blank" rel="noreferrer" style={{
                            display: "block", textAlign: "center",
                            background: "linear-gradient(135deg, #00f5a0, #00d4aa)",
                            color: "#0a0e1a", padding: "10px", borderRadius: "10px",
                            fontWeight: 700, fontSize: "13px", textDecoration: "none",
                          }}>
                            Voir le produit →
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ADD PRODUCT TAB */}
        {activeTab === "add" && (
          <div style={{ maxWidth: "560px", margin: "0 auto" }}>
            <div style={{
              background: "linear-gradient(135deg, #1e293b, #0f172a)",
              border: "1px solid #ffffff10", borderRadius: "20px", padding: "32px",
            }}>
              <h2 style={{ fontWeight: 800, fontSize: "20px", marginBottom: "8px" }}>
                Surveiller un produit
              </h2>
              <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "28px" }}>
                Entrez l'URL du produit et votre prix cible. Vous serez alerté dès que le prix baisse.
              </p>

              {submitted ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
                  <div style={{ fontWeight: 700, color: "#00f5a0" }}>Produit ajouté !</div>
                  <div style={{ color: "#64748b", fontSize: "13px" }}>Redirection vers le dashboard...</div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Emoji picker */}
                  <div>
                    <label style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px", display: "block" }}>ICÔNE</label>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {["🛍️", "📱", "💻", "🎧", "📷", "⌚", "🎮", "📺", "🏠", "👟"].map(emoji => (
                        <button key={emoji} type="button"
                          onClick={() => setForm(f => ({ ...f, image: emoji }))}
                          style={{
                            width: 40, height: 40, borderRadius: "10px", fontSize: "20px",
                            border: form.image === emoji ? "2px solid #00f5a0" : "1px solid #ffffff15",
                            background: form.image === emoji ? "#00f5a020" : "transparent",
                            cursor: "pointer",
                          }}>{emoji}</button>
                      ))}
                    </div>
                  </div>

                  {[
                    { label: "NOM DU PRODUIT", key: "name", placeholder: "Sony WH-1000XM5", type: "text" },
                    { label: "URL DU PRODUIT", key: "url", placeholder: "https://www.amazon.fr/dp/...", type: "url" },
                    { label: "PRIX CIBLE (€)", key: "targetPrice", placeholder: "280", type: "number" },
                  ].map(field => (
                    <div key={field.key}>
                      <label style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px", display: "block", letterSpacing: "0.5px" }}>
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={form[field.key]}
                        onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                        style={{
                          width: "100%", padding: "12px 16px", borderRadius: "10px",
                          background: "#0f172a", border: "1px solid #ffffff15",
                          color: "#e2e8f0", fontSize: "14px", outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  ))}

                  <div>
                    <label style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px", display: "block", letterSpacing: "0.5px" }}>
                      SITE
                    </label>
                    <select
                      value={form.site}
                      onChange={e => setForm(f => ({ ...f, site: e.target.value }))}
                      style={{
                        width: "100%", padding: "12px 16px", borderRadius: "10px",
                        background: "#0f172a", border: "1px solid #ffffff15",
                        color: "#e2e8f0", fontSize: "14px", outline: "none",
                      }}
                    >
                      <option>Amazon</option>
                      <option>Fnac</option>
                      <option>Cdiscount</option>
                      <option>Autre</option>
                    </select>
                  </div>

                  <button type="submit" style={{
                    marginTop: "8px", padding: "14px", borderRadius: "12px", border: "none",
                    background: "linear-gradient(135deg, #00f5a0, #00d4aa)",
                    color: "#0a0e1a", fontWeight: 800, fontSize: "15px", cursor: "pointer",
                    letterSpacing: "-0.3px",
                  }}>
                    Activer la surveillance →
                  </button>
                </form>
              )}
            </div>

            {/* Info box */}
            <div style={{
              marginTop: "16px", background: "#1e293b",
              border: "1px solid #ffffff10", borderRadius: "12px", padding: "16px 20px",
              display: "flex", gap: "12px", alignItems: "flex-start",
            }}>
              <span style={{ fontSize: "20px" }}>ℹ️</span>
              <div style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.6 }}>
                PlatformAlert scrape le prix toutes les <strong style={{ color: "#94a3b8" }}>30 minutes</strong>.
                Vous recevrez un email dès que le prix atteint votre cible.
                Historique conservé sur <strong style={{ color: "#94a3b8" }}>6 mois</strong>.
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        * { box-sizing: border-box; }
        input:focus { border-color: #00f5a0 !important; box-shadow: 0 0 0 3px #00f5a020; }
      `}</style>
    </div>
  );
}
