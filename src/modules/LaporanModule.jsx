import React from "react";
import Icon from "../components/Icon.jsx";
import { rp } from "../lib/format.js";

export default function LaporanModule({ res, stockValue }) {
  const margin = res.revenue > 0 ? Math.round((res.profit / res.revenue) * 100) : 0;
  return (
    <>
      <div className="module-grid four">
        <div className="card metric-card"><div className="metric-label">Pendapatan</div><div className="metric-value">{rp(res.revenue)}</div><div className="metric-note">Estimasi harian</div></div>
        <div className="card metric-card"><div className="metric-label">Laba bersih</div><div className="metric-value">{rp(res.profit)}</div><div className="metric-note trend-up">Naik dari kemarin</div></div>
        <div className="card metric-card"><div className="metric-label">Margin rata-rata</div><div className="metric-value">{margin}%</div><div className="metric-note">Setelah biaya bahan</div></div>
        <div className="card metric-card">
          <div className="metric-label">Bottleneck</div>
          <div className="metric-value" style={{ fontSize: 18 }}>{res.bottleneck}</div>
          <div className="metric-note">{res.bottleneckPct}% utilisasi • Nilai gudang {rp(stockValue || 0)}</div>
        </div>
      </div>
      <div className="module-grid two">
        <div className="card">
          <div className="module-card-title">
            <div><h3>Ringkasan performa periode</h3><p>Perbandingan hasil aktual dan proyeksi.</p></div>
            <button className="pill">Oktober 2026 <Icon name="chevD" size={13} /></button>
          </div>
          <div className="progress-item"><div className="progress-label"><span>Target pendapatan</span><span>78%</span></div><div className="track"><div className="fill" style={{ width: "78%" }} /></div></div>
          <div className="progress-item"><div className="progress-label"><span>Target laba</span><span>86%</span></div><div className="track"><div className="fill" style={{ width: "86%" }} /></div></div>
          <div className="progress-item"><div className="progress-label"><span>Ketepatan deadline</span><span>100%</span></div><div className="track"><div className="fill" style={{ width: "100%" }} /></div></div>
        </div>
        <div className="card">
          <div className="module-card-title">
            <div><h3>Export tersedia</h3><p>Dokumen siap untuk evaluasi guru dan manajer.</p></div>
          </div>
          <div className="module-list">
            {["Laporan produksi harian", "Rekap bahan baku", "Analitik laba dan kapasitas"].map((x) => (
              <div className="module-list-row" key={x}>
                <div className="row-icon"><Icon name="doc" size={16} /></div>
                <div className="row-main"><strong>{x}</strong><span>PDF, diperbarui barusan</span></div>
                <button className="pill"><Icon name="download" size={13} /> Unduh</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
