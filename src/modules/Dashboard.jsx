import React from "react";
import Icon from "../components/Icon.jsx";
import ChartCard from "../components/ChartCard.jsx";
import OrdersCard from "../components/OrdersCard.jsx";
import QuickAdd from "../components/QuickAdd.jsx";
import { rp, fmtQty } from "../lib/format.js";
import { stockStatusClass } from "../lib/solver.js";

export default function Dashboard({
  params,
  set,
  reset,
  goParams,
  goGudang,
  res,
  coverage,
  materials,
  orders,
  lowStockCount,
  stockValue,
  chartData,
  mode,
  setMode,
  tiles,
  SLIDERS,
  barRow,
  totalUnit,
  deltaStr,
  modalPct,
  onAddLog,
  onAddOrder,
}) {
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Overview</h1>
          <div className="sub">Ringkasan optimalisasi produksi hari ini. Solver MILP berjalan otomatis.</div>
        </div>
        <div className="head-actions">
          <QuickAdd materials={materials} onAddLog={onAddLog} onAddOrder={onAddOrder} preset="semua" />
          <button className="pill">Hari Ini <Icon name="chevD" size={14} /></button>
          <button className="pill" onClick={reset}><Icon name="refresh" size={14} /> Reset Data</button>
        </div>
      </div>

      <section className="stat-grid">
        <div className="card stat green">
          <div className="stat-top">
            <div className="stat-ico"><Icon name="coins" size={19} /></div>
            <div>
              <div className="stat-title">Estimasi Laba Optimal</div>
              <div className="stat-sub">Hasil solver MILP, 18 Okt 2026</div>
            </div>
            <button className="dots-btn"><Icon name="dotsV" size={16} /></button>
          </div>
          <div className="stat-val">{rp(res.profit)}<span className="badge">{deltaStr}</span></div>
          <div className="stat-foot"><span>Lihat Rincian</span><span className="foot-arrow"><Icon name="arrowR" size={13} /></span></div>
        </div>
        <div className="card stat">
          <div className="stat-top">
            <div className="stat-ico"><Icon name="wallet" size={19} /></div>
            <div>
              <div className="stat-title">Modal Bahan Baku</div>
              <div className="stat-sub">Kas harian untuk belanja bahan</div>
            </div>
            <button className="dots-btn"><Icon name="dotsV" size={16} /></button>
          </div>
          <div className="stat-val">{rp(params.modal)}<span className="badge">{modalPct} persen terpakai</span></div>
          <div className="stat-foot" onClick={goParams}><span>Atur Alokasi</span><span className="foot-arrow"><Icon name="arrowR" size={13} /></span></div>
        </div>
        <div className="card stat">
          <div className="stat-top">
            <div className="stat-ico"><Icon name="box" size={19} /></div>
            <div>
              <div className="stat-title">Rekomendasi Produksi</div>
              <div className="stat-sub">Total unit optimal, 3 varian. Bottleneck {res.bottleneck || "belum ada"}</div>
            </div>
            <button className="dots-btn"><Icon name="dotsV" size={16} /></button>
          </div>
          <div className="stat-val">
            {totalUnit.toLocaleString("id-ID")} <small>unit</small>
            <span className="badge">{lowStockCount > 0 ? `${lowStockCount} bahan kritis` : "Stok aman"}</span>
          </div>
          <div className="stat-foot" onClick={goGudang}><span>Nilai gudang {rp(stockValue)}</span><span className="foot-arrow"><Icon name="arrowR" size={13} /></span></div>
        </div>
      </section>

      <section className="row reco">
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Rekomendasi Produksi</h3>
              <div className="sub">Kombinasi optimal X1, X2, X3 dengan MILP sadar stok gudang</div>
            </div>
            <div className="right">
              <span className={"chip-status " + (res.status === "Optimal" ? "ok" : "err")}>
                <span className="dot"></span>Solver {res.status}
              </span>
              <button className="dots-btn"><Icon name="dotsV" size={16} /></button>
            </div>
          </div>
          <div className="tile-grid">
            {tiles.map((t, i) => (
              <div className="tile" key={i}>
                <div className="tile-top">
                  <div className="tile-ico" style={{ background: t.tint }}><Icon name={t.icon} size={16} /></div>
                  <div className="tile-name">{t.name}</div>
                  <button className="dots-btn"><Icon name="dotsV" size={15} /></button>
                </div>
                {t.val ? (
                  <div className="tile-val">{t.val}</div>
                ) : (
                  <div className="tile-val">{t.qty.toLocaleString("id-ID")} <small>unit</small></div>
                )}
                <div className="tile-sub">{t.sub}</div>
                <span className={"tile-status " + t.st[0]}>{t.st[1]}</span>
              </div>
            ))}
          </div>
          {res.stockConstrained && res.status === "Optimal" && (
            <div className="infeasible" style={{ background: "var(--amber-soft)", color: "var(--amber)" }}>
              Stok membatasi optimasi. Bottleneck {res.bottleneck} {res.bottleneckPct} persen. Tambah stok di menu Gudang untuk menaikkan laba.
            </div>
          )}
          {res.status !== "Optimal" && (
            <div className="infeasible">{res.reason || "Batasan belum dapat dipenuhi. Turunkan pesanan khusus minimum atau tambah modal dan kapasitas."}</div>
          )}
        </div>
        <ChartCard data={chartData} mode={mode} setMode={setMode} />
      </section>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-head">
          <div>
            <h3>Prediksi Stok Gudang berbasis data aktual</h3>
            <div className="sub">Daya tahan dihitung dari sisa dibagi kebutuhan harian rencana optimal. Saran beli untuk 7 hari ke depan.</div>
          </div>
          <div className="right">
            <span className={"chip-status " + (lowStockCount > 0 ? "warn" : "ok")}>
              <span className="dot"></span>{lowStockCount > 0 ? `${lowStockCount} perlu restock` : "Semua aman"}
            </span>
            <button className="pill" onClick={goGudang}>Buka Gudang <Icon name="arrowR" size={13} /></button>
          </div>
        </div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th>Bahan</th><th>Sisa</th><th>Butuh per hari</th><th>Daya tahan</th><th>Status</th><th>Saran beli 7 hari</th></tr></thead>
            <tbody>
              {materials.map((m) => {
                const c = coverage[m.id] || { need: 0, left: m.stock, daysLabel: "Belum terpakai", suggest7: 0, status: "Aman" };
                return (
                  <tr key={m.id}>
                    <td><b>{m.name}</b><small style={{ display: "block", color: "var(--muted)", marginTop: 3 }}>{m.id} Rp {Number(m.price || 0).toLocaleString("id-ID")} per {m.unit}</small></td>
                    <td><b>{fmtQty(c.left)} {m.unit}</b></td>
                    <td>{fmtQty(c.need)} {m.unit}</td>
                    <td><b>{c.daysLabel}</b> hari</td>
                    <td><span className={"st " + stockStatusClass(c.status)}><span className="dot"></span>{c.status}</span></td>
                    <td>
                      {c.suggest7 > 0.05 ? (
                        <b>{fmtQty(Math.ceil(c.suggest7 * 10) / 10)} {m.unit}</b>
                      ) : (
                        <span style={{ color: "var(--faint)" }}>Cukup</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="formula">
          <b>Logika prediksi.</b> Solver MILP memakai kendala stok gudang sesuai dokumen PDF. Setiap pencatatan Gudang masuk atau keluar langsung mengubah batas atas produksi dan prediksi di dashboard ini.
        </div>
      </div>

      <section className="row param" id="parameter">
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Parameter dan Simulasi</h3>
              <div className="sub">Ubah batasan harian. Solver menghitung ulang secara real time.</div>
            </div>
            <div className="right"><span className="chip-status ok"><span className="dot"></span>Live</span></div>
          </div>
          <div className="sliders">
            {SLIDERS.map((s, i) => (
              <div className="srow" key={s.k} style={i === SLIDERS.length - 1 ? { gridColumn: "1 / -1" } : null}>
                <div className="srow-top"><label>{s.label}</label><span className="sval">{s.fmt(params[s.k])}</span></div>
                <input
                  type="range" min={s.min} max={s.max} step={s.step} value={params[s.k]} onChange={set(s.k)}
                  style={{ "--fill": ((params[s.k] - s.min) / (s.max - s.min)) * 100 + "%" }}
                />
              </div>
            ))}
          </div>
          <div className="formula">
            <b>Fungsi objektif dokumen PDF.</b> Maksimalkan laba dari Roti Manis, Roti Tawar, dan Bagelan
            dengan batas modal, batas oven, batas SDM, batas stok gudang, serta batas pesanan minimum dan maksimum.
          </div>
        </div>
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Efisiensi Sumber Daya</h3>
              <div className="sub">Beban kapasitas dan sisa live dari Gudang</div>
            </div>
            <div className="right"><button className="pill" onClick={goGudang}>Kelola Stok</button></div>
          </div>
          <div className="bars">
            {barRow("Modal Bahan Baku", res.used.modal, params.modal, true)}
            {barRow("Kapasitas Oven", res.used.oven, res.caps.oven)}
            {barRow("Kapasitas Mixer", res.used.mixer, res.caps.mixer)}
            {barRow("Kapasitas SDM", res.used.sdm, res.caps.sdm)}
          </div>
          <div className="divider"></div>
          <div className="btop">
            <span style={{ fontWeight: 700 }}>Sisa live Gudang setelah rencana</span>
            <em>Bottleneck {res.bottleneck} {res.bottleneckPct} persen</em>
          </div>
          <div className="chips2">
            {materials.map((m) => {
              const awal = m.stock + (res.usage[m.id] || 0);
              const left = Math.max(0, res.remain[m.id] ?? m.stock);
              const p2 = awal > 0 ? (left / awal) * 100 : 100;
              const c = coverage[m.id];
              return (
                <div className="chip" key={m.id}>
                  <div className="cname">
                    <span>{m.name}</span>
                    <em>{fmtQty(left)} {m.unit}, {c ? c.daysLabel : "belum ada"} hari</em>
                  </div>
                  <div className="ctrack">
                    <div
                      className="cfill"
                      style={{
                        width: Math.min(100, Math.max(0, p2)) + "%",
                        background: c && (c.status === "Kritis" || c.status === "Habis") ? "#DC2626" : p2 < 25 ? "#F59E0B" : "var(--green)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <OrdersCard orders={orders} materials={materials} onAddLog={onAddLog} onAddOrder={onAddOrder} />
    </>
  );
}
