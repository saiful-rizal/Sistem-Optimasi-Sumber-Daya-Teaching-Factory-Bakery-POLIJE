import React from "react";
import AlurKerja from "../components/AlurKerja.jsx";
import Icon from "../components/Icon.jsx";
import QuickAdd from "../components/QuickAdd.jsx";
import OrdersCard from "../components/OrdersCard.jsx";
import { fmtQty } from "../lib/format.js";
import { dayNameID } from "../lib/planner.js";
import { stockStatusClass } from "../lib/solver.js";

export default function DashboardProduksi({ stokJadi, approved, materials, coverage, orders, requests, realisasi, go, onAddLog, onAddOrder }) {
  const snap = approved && approved.status === "approved" ? approved.snapshot : null;
  const today = dayNameID();
  const group = today === "Senin" || today === "Kamis" ? "roti" : today === "Selasa" || today === "Jumat" ? "kering" : null;
  const items = snap && group ? snap.days.find((d) => d.group === group).items : [];
  const kritis = materials.filter((m) => ["Kritis", "Habis"].includes((coverage[m.id] || {}).status));
  const menunggu = requests.filter((r) => r.status === "Menunggu").length;
  const siapTerima = requests.filter((r) => r.status === "Disetujui").length;
  return (
    <>
      <div className="page-head"><div><h1>Dashboard Produksi</h1><div className="sub">{today}: {group === "roti" ? "hari produksi roti manis & tawar" : group === "kering" ? "hari produksi roti kering" : "bukan hari produksi"}</div></div>
        <div className="head-actions"><QuickAdd materials={materials} onAddLog={onAddLog} onAddOrder={onAddOrder} preset="semua" canIn={false} /></div></div>
      <AlurKerja roleId="produksi" go={go} />
      <div className="module-grid four">
        <div className="card metric-card"><div className="metric-label">Rencana bulanan</div><div className="metric-value" style={{ fontSize: 18 }}>{snap ? "Disetujui" : "Belum ada"}</div><div className="metric-note"><button className="text-btn" onClick={() => go("Rencana Produksi")}>Buka rencana</button></div></div>
        <div className="card metric-card"><div className="metric-label">Bahan kritis</div><div className="metric-value">{kritis.length}</div><div className="metric-note">{kritis.map((m) => m.name).join(", ") || "Semua aman"}</div></div>
        <div className="card metric-card"><div className="metric-label">Pengajuan</div><div className="metric-value">{menunggu}</div><div className="metric-note">{siapTerima} siap dicatat diterima</div></div>
        <div className="card metric-card"><div className="metric-label">Roti jadi siap jual</div><div className="metric-value">{Object.values(stokJadi).reduce((s, c) => s + c.fresh, 0)}</div><div className="metric-note"><button className="text-btn" onClick={() => go("Stok Barang Jadi")}>{Object.values(stokJadi).reduce((s, c) => s + c.expiredQty, 0)} pcs kedaluwarsa</button></div></div>
      </div>
      <div className="module-grid two">
        <div className="card"><div className="module-card-title"><div><h3>Perintah kerja hari ini</h3></div><button className="primary-btn" onClick={() => go("Rencana Produksi")}>Input realisasi <Icon name="arrowR" size={14} /></button></div>
          {items.length === 0 ? <div className="formula" style={{ marginTop: 0 }}>{snap ? "Tidak ada jadwal produksi hari ini." : "Menunggu persetujuan rencana dari Admin Utama."}</div>
            : <div className="module-list">{items.map((it) => (<div className="module-list-row" key={it.pid}><div className="row-icon"><Icon name="bread" size={16} /></div><div className="row-main"><strong>Produksi {it.qty} {it.name}</strong></div></div>))}</div>}
        </div>
        <div className="card"><div className="module-card-title"><div><h3>Stok bahan</h3></div><button className="pill" onClick={() => go("Bahan Baku")}>Detail</button></div>
          <div className="data-table-wrap"><table className="data-table" style={{ minWidth: 0 }}><tbody>{materials.map((m) => { const c = coverage[m.id] || { status: "Aman" }; return (<tr key={m.id}><td><b>{m.name}</b></td><td>{fmtQty(m.stock)} {m.unit}</td><td><span className={"st " + stockStatusClass(c.status)}><span className="dot"></span>{c.status}</span></td></tr>); })}</tbody></table></div></div>
      </div>
      <OrdersCard orders={orders} materials={materials} onAddLog={onAddLog} onAddOrder={onAddOrder} />
    </>
  );
}
