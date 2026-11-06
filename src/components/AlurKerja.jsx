import React from "react";

const FLOW = {
  utama: [
    ["Atur modal", "Isi modal bulanan, lihat bahan & laba", "Perencanaan Modal"],
    ["Cek frekuensi", "Produksi 1x atau 2x seminggu?", "Frekuensi Produksi"],
    ["Setujui rencana", "Rencana jadi perintah kerja", "Perencanaan Modal"],
    ["Setujui bahan", "Periksa pengajuan beli bahan", "Pengajuan Bahan"],
    ["Pantau hasil", "Stok jadi, terjual, terbuang", "Stok Barang Jadi"],
  ],
  produksi: [
    ["Lihat perintah", "Apa yang diproduksi hari ini", "Rencana Produksi"],
    ["Catat hasil", "Isi jumlah roti yang jadi", "Rencana Produksi"],
    ["Catat penjualan", "Isi jumlah roti yang laku", "Stok Barang Jadi"],
    ["Bahan kurang?", "Ajukan pembelian bahan", "Pengajuan Bahan"],
  ],
  kasir: [
    ["Catat penjualan", "Isi jumlah roti yang laku hari ini", "Stok Barang Jadi"],
    ["Terima pesanan", "Catat pesanan pelanggan baru", "Pesanan"],
    ["Cek stok jadi", "Lihat roti siap jual dan kedaluwarsa", "Stok Barang Jadi"],
    ["Lihat bahan", "Pantau ketersediaan bahan baku", "Bahan Baku"],
  ],
};

export default function AlurKerja({ roleId, go }) {
  const steps = FLOW[roleId] || FLOW.produksi;
  return (
    <div className="alur">
      {steps.map((s, i) => (
        <button type="button" key={i} className="alur-step" onClick={() => go(s[2])}>
          <span className="alur-num">{i + 1}</span>
          <span><b>{s[0]}</b><small>{s[1]}</small></span>
        </button>
      ))}
    </div>
  );
}
