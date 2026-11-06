import React from "react";
import { rp } from "../lib/format.js";
import { shelfOf } from "../lib/stokjadi.js";

const numInp = { width: 84, padding: "6px 8px", border: "1px solid var(--line)", borderRadius: 8 };

export default function MasterDataModule({ products, materials, onProduct, onBom }) {
  return (
    <>
      <div className="card">
        <div className="module-card-title"><div><h3>Produk: harga jual, HPP, dan permintaan maksimum</h3><p>Margin = harga jual − HPP, dihitung otomatis. Perubahan langsung dipakai solver.</p></div></div>
        <div className="data-table-wrap"><table className="data-table">
          <thead><tr><th>Produk</th><th>Harga jual</th><th>HPP</th><th>Margin</th><th>Oven (mnt)</th><th>Mixer (mnt)</th><th>SDM (mnt)</th><th>Dmax/siklus</th><th>Tahan (hari)</th></tr></thead>
          <tbody>{products.map((p) => (<tr key={p.id}><td><b>{p.name}</b><small style={{ display: "block", color: "var(--muted)" }}>{p.id}</small></td>
            {["price", "hpp", null, "oven", "mixer", "sdm", "dmax", "shelfDays"].map((k, i) => k ? <td key={i}><input type="number" min="0" style={numInp} value={k === "shelfDays" ? shelfOf(p) : p[k]} onChange={(e) => onProduct(p.id, k, Number(e.target.value))} /></td> : <td key={i}><b>{rp(p.margin)}</b></td>)}</tr>))}</tbody>
        </table></div>
      </div>
      <div className="card">
        <div className="module-card-title"><div><h3>Resep (BOM): bahan per 1 unit produk</h3><p>Dasar perhitungan kebutuhan bahan baku bulanan.</p></div></div>
        <div className="data-table-wrap"><table className="data-table">
          <thead><tr><th>Bahan</th>{products.map((p) => <th key={p.id}>{p.name}</th>)}</tr></thead>
          <tbody>{materials.map((m) => (<tr key={m.id}><td><b>{m.name}</b> <small>({m.unit})</small></td>{products.map((p) => (<td key={p.id}><input type="number" min="0" step="0.001" style={numInp} value={p.bom[m.id] || 0} onChange={(e) => onBom(p.id, m.id, Number(e.target.value))} /></td>))}</tr>))}</tbody>
        </table></div>
      </div>
    </>
  );
}
