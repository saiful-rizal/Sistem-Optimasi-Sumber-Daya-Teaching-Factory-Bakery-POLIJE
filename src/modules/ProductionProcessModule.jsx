import React, { useState } from "react";
import Icon from "../components/Icon.jsx";
import { PRODUCTION_PROCESS, CAPACITY_RULES } from "../lib/roles.js";
import { fmtQty } from "../lib/format.js";

export default function ProductionProcessModule({ approved, products, materials, realisasi, onReport, go }) {
  const snap = approved && approved.status === "approved" ? approved.snapshot : null;
  const today = new Date().toISOString().slice(0, 10);
  const dayName = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][new Date().getDay()];
  const isFullCapacity = CAPACITY_RULES.fullCapacityDays.includes(dayName);
  const capacityKg = isFullCapacity ? CAPACITY_RULES.fullCapacityKg : `${CAPACITY_RULES.normalCapacityKgMin}-${CAPACITY_RULES.normalCapacityKgMax} kg`;

  const [processLogs, setProcessLogs] = useState(() => {
    try {
      const raw = localStorage.getItem("tefa-process-logs");
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  const saveLogs = (next) => {
    setProcessLogs(next);
    try { localStorage.setItem("tefa-process-logs", JSON.stringify(next)); } catch {}
  };

  const totalDuration = PRODUCTION_PROCESS.reduce((s, p) => s + p.durationMin, 0);

  const addProcessLog = (processId, notes, qty) => {
    const entry = {
      id: "PROC" + Date.now(),
      date: today,
      day: dayName,
      processId,
      processName: PRODUCTION_PROCESS.find((p) => p.id === processId)?.name || processId,
      durationMin: PRODUCTION_PROCESS.find((p) => p.id === processId)?.durationMin || 0,
      qty: Number(qty) || 0,
      notes: notes || "-",
      by: "Admin Produksi",
    };
    saveLogs([entry, ...processLogs].slice(0, 200));
  };

  const todayLogs = processLogs.filter((l) => l.date === today);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Proses Produksi</h1>
          <div className="sub">Lacak 8 tahap produksi roti: penimbangan → pencampuran → tempering → molding → proving → oven → pendinginan → packing.</div>
        </div>
        <div className="head-actions">
          <span className="chip-status ok"><span className="dot"></span>{dayName}: Kapasitas {capacityKg}</span>
        </div>
      </div>

      {/* Info kapasitas harian */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="module-card-title">
          <div>
            <h3>Kapasitas Produksi Hari Ini</h3>
            <p>{dayName} termasuk hari {isFullCapacity ? "kapasitas penuh" : "kapasitas normal"}. Full kapasitas 25 kg pada Senin & Kamis; 10-15 kg pada hari lainnya.</p>
          </div>
          <div className="right"><span className={"chip-status " + (isFullCapacity ? "ok" : "warn")}><span className="dot"></span>{isFullCapacity ? "Penuh 25 kg" : "Normal 10-15 kg"}</span></div>
        </div>
        <div className="formula">
          Total waktu proses per siklus: <b>{totalDuration} menit</b> ({Math.round(totalDuration / 60)} jam).
          {isFullCapacity ? "Produksi 25 kg adonan." : "Produksi 10-15 kg adonan."}
        </div>
      </div>

      {/* 8 tahap proses */}
      <div className="module-grid four" style={{ marginBottom: 16 }}>
        {PRODUCTION_PROCESS.map((step) => {
          const doneToday = todayLogs.some((l) => l.processId === step.id);
          return (
            <div className="card" key={step.id} style={{ border: doneToday ? "2px solid var(--green)" : "1px solid var(--line)" }}>
              <div className="module-card-title">
                <div>
                  <h3 style={{ fontSize: 14 }}>{step.order}. {step.name}</h3>
                  <div className="sub" style={{ fontSize: 11 }}>{step.durationMin} menit • {step.desc}</div>
                </div>
                <div className="right"><span className={"chip-status " + (doneToday ? "ok" : "wait")}><span className="dot"></span>{doneToday ? "Selesai" : "Belum"}</span></div>
              </div>
              <div style={{ padding: 12 }}>
                <form className="gudang-form" onSubmit={(e) => {
                  e.preventDefault();
                  const qtyEl = e.target.elements[0];
                  const notesEl = e.target.elements[1];
                  addProcessLog(step.id, notesEl.value, qtyEl.value);
                  e.target.reset();
                }} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div><label style={{ fontSize: 11.5, fontWeight: 600 }}>Jumlah (kg)</label><input type="number" min="0" step="0.1" placeholder="0" required /></div>
                  <div><label style={{ fontSize: 11.5, fontWeight: 600 }}>Catatan</label><input type="text" placeholder="mis. adonan siap, tanpa kendala" /></div>
                  <button className="primary-btn" style={{ width: "100%", justifyContent: "center" }}><Icon name="check" size={14} /> Catat {step.name}</button>
                </form>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rencana produksi yang disetujui */}
      {snap && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="module-card-title"><div><h3>Rencana Bulanan Disetujui</h3><p>Perintah kerja dari Admin Utama yang dapat Anda jalankan hari ini.</p></div></div>
          <div className="tile-grid">
            {[snap.x1, snap.x2, snap.x3].map((qty, i) => {
              const p = products[i];
              if (!p || qty <= 0) return null;
              return (
                <div className="card tile" key={p.id}>
                  <div className="tile-top">
                    <div className="tile-ico" style={{ background: p.tint || "#F4F6FA" }}><Icon name="bread" size={16} /></div>
                    <div className="tile-name">{p.name}</div>
                  </div>
                  <div className="tile-val">{qty}<small> unit</small></div>
                  <div className="tile-sub">Berat adonan {p.beratAdonan} g/unit</div>
                  <button className="primary-btn" style={{ width: "100%", marginTop: 8 }} onClick={() => go("Rencana Produksi")}><Icon name="arrowR" size={14} /> Input Realisasi</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Riwayat proses */}
      <div className="card">
        <div className="module-card-title"><div><h3>Riwayat Proses Produksi</h3></div></div>
        <div className="data-table-wrap"><table className="data-table" style={{ minWidth: 0 }}>
          <thead><tr><th>Tanggal</th><th>Hari</th><th>Tahap</th><th>Durasi</th><th>Jumlah (kg)</th><th>Catatan</th><th>Oleh</th></tr></thead>
          <tbody>{processLogs.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--faint)" }}>Belum ada catatan proses produksi.</td></tr>}
            {processLogs.slice(0, 20).map((l) => (<tr key={l.id}><td>{l.date}</td><td>{l.day}</td><td><b>{l.processName}</b></td><td>{l.durationMin} mnt</td><td>{fmtQty(l.qty)} kg</td><td>{l.notes}</td><td>{l.by}</td></tr>))}
          </tbody>
        </table></div>
      </div>
    </>
  );
}
