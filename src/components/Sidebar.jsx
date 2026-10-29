import React from "react";
import Icon from "./Icon.jsx";

export default function Sidebar({ page, setPage, goParams, lowStockCount }) {
  const groups = [
    {
      label: "Menu Utama",
      items: [
        { id: "Dashboard", icon: "grid" },
        { id: "Optimasi", icon: "target", badge: "MILP" },
        { id: "Bahan Baku", icon: "box", badge: lowStockCount > 0 ? `${lowStockCount} perlu cek` : "5 bahan" },
        { id: "Pesanan", icon: "receipt", badge: "2 aktif" },
      ],
    },
    {
      label: "Fitur",
      items: [
        { id: "Peramalan", icon: "trend" },
        { id: "Penjadwalan", icon: "layers" },
        { id: "Laporan", icon: "doc" },
      ],
    },
    {
      label: "Umum",
      items: [
        { id: "Pengaturan", icon: "gear" },
        { id: "Bantuan", icon: "help" },
        { id: "Keluar", icon: "logout" },
      ],
    },
  ];
  return (
    <aside className="sidebar">
      <div className="logo">
        <div>
          <div className="logo-name">TEFA Bakery</div>
          <div className="logo-sub">Politeknik Negeri Jember</div>
        </div>
      </div>
      <div className="search">
        <Icon name="search" size={15} />
        <input placeholder="Cari menu" />
        <kbd>Ctrl K</kbd>
      </div>
      {groups.map((g) => (
        <div key={g.label}>
          <div className="nav-label">{g.label}</div>
          {g.items.map((it) => (
            <div
              key={it.id}
              className={"nav" + (page === it.id ? " active" : "")}
              onClick={() => setPage(it.id)}
            >
              <Icon name={it.icon} size={17} />
              {it.id}
              {it.badge && <span className="nav-badge">{it.badge}</span>}
            </div>
          ))}
        </div>
      ))}
      <div className="promo">
        <h4>Solver Engine</h4>
        <p>Optimasi MILP dan peramalan permintaan untuk keputusan produksi yang terukur.</p>
        <div className="promo-actions">
          <button className="btn-mini green" onClick={goParams}>Coba Solver</button>
          <button className="btn-mini ghost">Dokumen</button>
        </div>
      </div>
    </aside>
  );
}
