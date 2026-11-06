import React, { useState } from "react";
import Icon from "../components/Icon.jsx";
import { rp, fmtQty } from "../lib/format.js";

const UNITS = ["kg", "gr", "liter", "ml", "pcs", "butir", "pak"];
const EMPTY = { name: "", unit: "kg", price: "", stock: "", minStock: "", shelfDays: "" };

export default function PengelolaanBahanModule({ materials, products, onAdd, onEdit, onDelete, canFinance = true }) {
  const [f, setF] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [draft, setDraft] = useState({});
  const [q, setQ] = useState("");
  const usedBy = (id) => products.filter((p) => (p.bom[id] || 0) > 0).map((p) => p.name);
  const list = materials.filter((m) => !q || (m.name + m.id).toLowerCase().includes(q.toLowerCase()));
  const low = materials.filter((m) => m.stock < (m.minStock || 0)).length;
  const value = materials.reduce((s, m) => s + m.stock * (m.price || 0), 0);

  const submit = (e) => {
    e.preventDefault();
    if (onAdd(f)) setF(EMPTY);
  };
  const startEdit = (m) => { setEditId(m.id); setDraft({ name: m.name, unit: m.unit, price: m.price, minStock: m.minStock, shelfDays: m.shelfDays }); };
  const save = () => { if (onEdit(editId, draft)) setEditId(null); };
  const d = (k) => (e) => setDraft((x) => ({ ...x, [k]: e.target.value }));
  const u = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  return (
    <>
      <div className="module-grid four">
        <div className="card metric-card"><div className="metric-label">Jenis bahan baku</div><div className="metric-value">{materials.length}</div><div className="metric-note">terdaftar di sistem</div></div>
        <div className="card metric-card"><div className="metric-label">Di bawah stok minimum</div><div className="metric-value" style={low ? { color: "var(--red)" } : null}>{low}</div><div className="metric-note">perlu restock</div></div>
        <div className="card metric-card"><div className="metric-label">Nilai persediaan</div><div className="metric-value">{canFinance ? rp(value) : "—"}</div><div className="metric-note">stok × harga satuan</div></div>
        <div className="card metric-card"><div className="metric-label">Dipakai di resep</div><div className="metric-value">{materials.filter((m) => usedBy(m.id).length).length}</div><div className="metric-note">bahan terhubung ke produk</div></div>
      </div>

      <div className="card">
        <div className="module-card-title"><div><h3>Tambah bahan baku baru</h3><p>Setelah ditambah, atur takaran per produk di menu Produk &amp; Resep agar ikut dihitung perencana.</p></div></div>
        <form onSubmit={submit} className="plan-row3" style={{ gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }}>
          <div className="gudang-form"><div><label>Nama bahan</label><input value={f.name} onChange={u("name")} placeholder="Contoh Susu Bubuk" required /></div></div>
          <div className="gudang-form"><div><label>Satuan</label><select value={f.unit} onChange={u("unit")}>{UNITS.map((x) => <option key={x}>{x}</option>)}</select></div></div>
          <div className="gudang-form"><div><label>Harga per satuan (Rp)</label><input type="number" min="0" value={f.price} onChange={u("price")} required /></div></div>
          <div className="gudang-form"><div><label>Stok awal</label><input type="number" min="0" step="0.1" value={f.stock} onChange={u("stock")} placeholder="0" /></div></div>
          <div className="gudang-form"><div><label>Stok minimum</label><input type="number" min="0" step="0.1" value={f.minStock} onChange={u("minStock")} placeholder="0" /></div></div>
          <div className="gudang-form"><div><label>Masa simpan (hari)</label><input type="number" min="1" value={f.shelfDays} onChange={u("shelfDays")} placeholder="90" /></div></div>
          <div><button className="primary-btn"><Icon name="plus" size={14} /> Tambah bahan</button></div>
        </form>
      </div>

      <div className="card">
        <div className="module-card-title">
          <div><h3>Daftar bahan baku</h3><p>Ubah data bahan atau hapus bahan yang tidak lagi dipakai.</p></div>
          <div className="search" style={{ width: 220 }}><Icon name="search" size={14} /><input placeholder="Cari bahan" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        </div>
        <div className="data-table-wrap"><table className="data-table">
          <thead><tr><th>Kode</th><th>Nama bahan</th><th>Satuan</th><th>Harga</th><th>Stok</th><th>Stok min.</th><th>Masa simpan</th><th>Dipakai di</th><th>Aksi</th></tr></thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan={9} style={{ textAlign: "center", color: "var(--faint)" }}>Tidak ada bahan.</td></tr>}
            {list.map((m) => {
              const ed = editId === m.id;
              const used = usedBy(m.id);
              return (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>{ed ? <input className="table-input" value={draft.name} onChange={d("name")} /> : <b>{m.name}</b>}</td>
                  <td>{ed ? <select className="table-input" value={draft.unit} onChange={d("unit")}>{UNITS.map((x) => <option key={x}>{x}</option>)}</select> : m.unit}</td>
                  <td>{ed ? <input className="table-input" type="number" value={draft.price} onChange={d("price")} /> : (canFinance ? rp(m.price) : "—")}</td>
                  <td style={m.stock < (m.minStock || 0) ? { color: "var(--red)", fontWeight: 700 } : null}>{fmtQty(m.stock)} {m.unit}</td>
                  <td>{ed ? <input className="table-input" type="number" value={draft.minStock} onChange={d("minStock")} /> : fmtQty(m.minStock || 0)}</td>
                  <td>{ed ? <input className="table-input" type="number" value={draft.shelfDays} onChange={d("shelfDays")} /> : (m.shelfDays || "—") + " hari"}</td>
                  <td>{used.length ? used.join(", ") : <span style={{ color: "var(--faint)" }}>belum dipakai</span>}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {ed ? (<><button className="primary-btn" onClick={save}>Simpan</button> <button className="icon-act" onClick={() => setEditId(null)}>Batal</button></>) : (<>
                      <button className="icon-act" onClick={() => startEdit(m)}><Icon name="edit" size={13} /> Ubah</button>{" "}
                      <button className="icon-act danger" onClick={() => { if (window.confirm(`Hapus bahan ${m.name}?`)) onDelete(m.id); }}><Icon name="trash" size={13} /> Hapus</button>
                    </>)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
        <div className="formula">Stok tidak diubah di sini. Tambah stok lewat <b>Barang Masuk</b>, kurangi lewat <b>Distribusi Bahan</b>, koreksi lewat <b>Stok Bahan Baku</b>. Bahan yang masih dipakai di resep tidak bisa dihapus.</div>
      </div>
    </>
  );
}
