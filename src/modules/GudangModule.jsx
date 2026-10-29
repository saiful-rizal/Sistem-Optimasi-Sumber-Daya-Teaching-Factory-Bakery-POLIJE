import React, { useState } from "react";
import Icon from "../components/Icon.jsx";
import QuickAdd from "../components/QuickAdd.jsx";
import { rp, fmtQty } from "../lib/format.js";
import { stockStatusClass } from "../lib/solver.js";

export default function GudangModule({ res, materials, logs, coverage, stockValue, onAddLog, onAddOrder, onSetStock }) {
  const [form, setForm] = useState({ materialId: materials[0] ? materials[0].id : "", type: "Masuk", qty: "", note: "" });
  const [editId, setEditId] = useState(null);
  const [editVal, setEditVal] = useState("");
  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    if (onAddLog({ materialId: form.materialId, type: form.type, qty: form.qty, note: form.note })) {
      setForm((f) => ({ ...f, qty: "", note: "" }));
    }
  };
  const matName = (id) => (materials.find((m) => m.id === id) || { name: id }).name;
  const matUnit = (id) => (materials.find((m) => m.id === id) || { unit: "" }).unit;
  return (
    <>
      <div className="module-grid four">
        <div className="card metric-card"><div className="metric-label">Nilai persediaan</div><div className="metric-value">{rp(stockValue)}</div><div className="metric-note">{materials.length} jenis bahan (harga PDF)</div></div>
        <div className="card metric-card">
          <div className="metric-label">Bahan kritis/habis</div>
          <div className="metric-value">
            {materials.filter((m) => { const c = coverage[m.id]; return c && (c.status === "Kritis" || c.status === "Habis"); }).length}
          </div>
          <div className="metric-note">Di bawah stok minimum</div>
        </div>
        <div className="card metric-card"><div className="metric-label">Bottleneck solver</div><div className="metric-value" style={{ fontSize: 18 }}>{res.bottleneck}</div><div className="metric-note">{res.bottleneckPct}% utilisasi</div></div>
        <div className="card metric-card"><div className="metric-label">Mutasi tercatat</div><div className="metric-value">{logs.length}</div><div className="metric-note">Riwayat gudang</div></div>
      </div>
      <div className="card">
        <div className="module-card-title">
          <div><h3>Tambah Cepat Gudang</h3><p>Pilih Barang Masuk untuk tambah stok, Barang Keluar untuk pakai stok. Satu formulir, satu daftar pilihan.</p></div>
          <QuickAdd materials={materials} onAddLog={onAddLog} onAddOrder={onAddOrder} preset="gudang" />
        </div>
      </div>
      <div className="module-grid two">
        <div className="card">
          <div className="module-card-title">
            <div><h3>Pencatatan Gudang</h3><p>Formulir lengkap dengan satu daftar pilihan arah barang.</p></div>
            <span className="chip-status ok"><span className="dot"></span>Live ke Dashboard</span>
          </div>
          <form onSubmit={submit} className="gudang-form">
            <div className="g-row">
              <label>Pilih Bahan</label>
              <select value={form.materialId} onChange={upd("materialId")}>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} — sisa {fmtQty(m.stock)} {m.unit}</option>
                ))}
              </select>
            </div>
            <div className="g-row2">
              <div>
                <label>Arah Barang, satu pilihan</label>
                <select value={form.type} onChange={upd("type")}>
                  <option value="Masuk">Barang Masuk, stok bertambah</option>
                  <option value="Keluar">Barang Keluar, stok berkurang</option>
                </select>
              </div>
              <div>
                <label>Jumlah</label>
                <input type="number" min="0" step="0.1" placeholder="Contoh 5" value={form.qty} onChange={upd("qty")} required />
              </div>
            </div>
            <p style={{ fontSize: 11.5, color: "var(--muted)", lineHeight: 1.5 }}>
              {form.type === "Masuk"
                ? "Masuk dipakai saat pembelian, retur, atau koreksi tambah."
                : "Keluar dipakai saat pemakaian produksi, barang rusak, atau susut."}
            </p>
            <div className="g-row">
              <label>Keterangan</label>
              <input
                placeholder={form.type === "Masuk" ? "Contoh beli ke supplier" : "Contoh dipakai produksi"}
                value={form.note}
                onChange={upd("note")}
              />
            </div>
            <button className="primary-btn" type="submit" style={{ width: "100%", justifyContent: "center" }}>Simpan Pencatatan</button>
          </form>
          <div className="formula">
            <b>Aturan mudah:</b> Masuk berarti stok bertambah. Keluar berarti stok berkurang. Stok tidak boleh minus, sistem otomatis menolak jika kurang.
          </div>
        </div>
        <div className="card">
          <div className="module-card-title">
            <div><h3>Prediksi ketahanan &amp; saran beli</h3><p>Dihitung dari rencana optimal hari ini (kebutuhan/hari).</p></div>
          </div>
          <div className="module-list">
            {materials.map((m) => {
              const c = coverage[m.id] || { need: 0, left: m.stock, daysLabel: "—", suggest7: 0, status: "Aman" };
              return (
                <div className="module-list-row" key={m.id}>
                  <div
                    className="row-icon"
                    style={{ background: c.status === "Aman" ? "var(--green-soft)" : c.status === "Waspada" ? "var(--blue-soft)" : "var(--amber-soft)" }}
                  >
                    {m.id.replace("RM", "")}
                  </div>
                  <div className="row-main">
                    <strong>{m.name} — {fmtQty(c.left)} {m.unit}</strong>
                    <span>
                      Butuh {fmtQty(c.need)}/{m.unit}/hari • tahan {c.daysLabel} hari • saran 7hr:{" "}
                      {c.suggest7 > 0.05 ? fmtQty(Math.ceil(c.suggest7 * 10) / 10) + " " + m.unit : "cukup"}
                    </span>
                  </div>
                  <div className="row-end">
                    <span className={"st " + stockStatusClass(c.status)}><span className="dot"></span>{c.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="card">
        <div className="module-card-title">
          <div><h3>Stok &amp; kebutuhan produksi</h3><p>Klik nilai stok untuk koreksi manual (stock opname). Harga sesuai PDF.</p></div>
          <button className="primary-btn" onClick={() => window.print()}><Icon name="download" size={14} /> Daftar Belanja</button>
        </div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th>Bahan</th><th>Harga (PDF)</th><th>Stok gudang</th><th>Kebutuhan</th><th>Sisa rencana</th><th>Daya tahan</th><th>Status</th></tr></thead>
            <tbody>
              {materials.map((m) => {
                const c = coverage[m.id] || { need: 0, left: m.stock, daysLabel: "—", suggest7: 0, status: "Aman" };
                const need = res.usage[m.id] || 0;
                const left = res.remain[m.id] ?? m.stock;
                return (
                  <tr key={m.id}>
                    <td><b>{m.name}</b><small style={{ display: "block", color: "var(--muted)", marginTop: 3 }}>{m.id} • min {fmtQty(m.minStock || 0)} {m.unit}</small></td>
                    <td>Rp {Number(m.price || 0).toLocaleString("id-ID")}/{m.unit}</td>
                    <td>
                      {editId === m.id ? (
                        <span style={{ display: "flex", gap: 6 }}>
                          <input
                            type="number" min="0" step="0.1" value={editVal} onChange={(e) => setEditVal(e.target.value)}
                            style={{ width: 80, padding: "6px 8px", border: "1px solid var(--line)", borderRadius: 8 }}
                          />
                          <button className="pill" onClick={() => { onSetStock(m.id, editVal); setEditId(null); }}>OK</button>
                        </span>
                      ) : (
                        <button className="text-btn" style={{ fontWeight: 700 }} title="Klik untuk koreksi" onClick={() => { setEditId(m.id); setEditVal(m.stock); }}>
                          {fmtQty(m.stock)} {m.unit} ✎
                        </button>
                      )}
                    </td>
                    <td>{fmtQty(need)} {m.unit}</td>
                    <td><b>{fmtQty(Math.max(0, left))} {m.unit}</b></td>
                    <td>{c.daysLabel} hari</td>
                    <td><span className={"st " + stockStatusClass(c.status)}><span className="dot"></span>{c.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <div className="module-card-title">
          <div><h3>Riwayat mutasi gudang</h3><p>{logs.length} transaksi terakhir — audit stok.</p></div>
        </div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th>Tanggal</th><th>Bahan</th><th>Jenis</th><th>Jumlah</th><th>Keterangan</th></tr></thead>
            <tbody>
              {logs.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--faint)" }}>Belum ada mutasi.</td></tr>
              )}
              {logs.map((l) => (
                <tr key={l.id}>
                  <td>{l.date}</td>
                  <td><b>{matName(l.materialId)}</b><small style={{ display: "block", color: "var(--muted)" }}>{l.materialId} • {l.id}</small></td>
                  <td><span className={"st " + (l.type === "Masuk" ? "done" : l.type === "Keluar" ? "wait" : "process")}><span className="dot"></span>{l.type}</span></td>
                  <td><b>{l.type === "Penyesuaian" ? "→ " : l.type === "Keluar" ? "−" : "+"}{fmtQty(l.qty)} {matUnit(l.materialId)}</b></td>
                  <td>{l.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
