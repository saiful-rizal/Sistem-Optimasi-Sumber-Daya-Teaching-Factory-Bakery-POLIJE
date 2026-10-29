import React from "react";
import Icon from "../components/Icon.jsx";
import OptimasiModule from "./OptimasiModule.jsx";
import GudangModule from "./GudangModule.jsx";
import PesananModule from "./PesananModule.jsx";
import PeramalanModule from "./PeramalanModule.jsx";
import PenjadwalanModule from "./PenjadwalanModule.jsx";
import LaporanModule from "./LaporanModule.jsx";
import PengaturanModule from "./PengaturanModule.jsx";
import BantuanModule from "./BantuanModule.jsx";

const TITLES = {
  Optimasi: ["Optimasi Produksi", "MILP sadar stok. Memaksimalkan laba dengan kendala modal, oven, mixer, SDM, stok gudang, dan batas pesanan."],
  "Bahan Baku": ["Gudang Bahan Baku", "Pencatatan stok masuk dan keluar plus prediksi ketahanan dan saran restock."],
  Pesanan: ["Pesanan Pelanggan", "Kelola pesanan rutin dan pesanan khusus."],
  Peramalan: ["Peramalan Permintaan", "Forecast kebutuhan bahan dan daya tahan stok berbasis rencana optimal."],
  Penjadwalan: ["Penjadwalan Produksi", "Susun urutan produksi berdasarkan deadline dan kapasitas."],
  Laporan: ["Laporan dan Analitik", "Rangkum hasil produksi, sumber daya, pendapatan, dan laba."],
  Pengaturan: ["Pengaturan Sistem", "Kelola parameter operasional dan notifikasi."],
  Bantuan: ["Pusat Bantuan", "Pelajari alur penggunaan sistem dan cara membaca rekomendasi."],
  Keluar: ["Keluar dari Sistem", "Pastikan pekerjaan sudah tersimpan sebelum mengakhiri sesi."],
};

export default function ModulePage(props) {
  const { page, res, setPage, materials, logs, orders, coverage, stockValue, onAddLog, onSetStock, onAddOrder } = props;
  const go = (id) => setPage(id);
  const [title, description] = TITLES[page] || [page, ""];

  if (page === "Keluar") {
    return (
      <div className="module-page">
        <div className="card" style={{ maxWidth: 560, margin: "70px auto", textAlign: "center" }}>
          <div className="ph-ico"><Icon name="logout" size={26} /></div>
          <h2 style={{ fontSize: 18 }}>Akhiri sesi Manajer Produksi</h2>
          <p style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.6, margin: "8px auto 20px" }}>
            Data simulasi saat ini tetap tersimpan di halaman ini.
          </p>
          <div className="module-actions" style={{ justifyContent: "center" }}>
            <button className="pill" onClick={() => go("Dashboard")}>Kembali ke Dashboard</button>
            <button className="primary-btn" onClick={() => go("Dashboard")}><Icon name="logout" size={15} /> Konfirmasi Keluar</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="module-page">
      <div className="module-intro">
        <div><h1>{title}</h1><p>{description}</p></div>
        <div className="module-actions">
          <button className="pill"><Icon name="refresh" size={14} /> Segarkan</button>
          <button className="primary-btn" onClick={() => window.print()}><Icon name="download" size={14} /> Export</button>
        </div>
      </div>
      {page === "Optimasi" && <OptimasiModule res={res} go={go} materials={materials} coverage={coverage} />}
      {page === "Bahan Baku" && (
        <GudangModule
          res={res}
          materials={materials}
          logs={logs}
          coverage={coverage}
          stockValue={stockValue}
          onAddLog={onAddLog}
          onAddOrder={onAddOrder}
          onSetStock={onSetStock}
        />
      )}
      {page === "Pesanan" && (
        <PesananModule go={go} orders={orders} materials={materials} onAddOrder={onAddOrder} onAddLog={onAddLog} />
      )}
      {page === "Peramalan" && <PeramalanModule res={res} materials={materials} coverage={coverage} />}
      {page === "Penjadwalan" && <PenjadwalanModule />}
      {page === "Laporan" && <LaporanModule res={res} materials={materials} coverage={coverage} stockValue={stockValue} />}
      {page === "Pengaturan" && <PengaturanModule />}
      {page === "Bantuan" && <BantuanModule />}
    </div>
  );
}
