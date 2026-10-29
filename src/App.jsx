import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import HelpModal from "./components/HelpModal.jsx";
import Icon from "./components/Icon.jsx";
import Dashboard from "./modules/Dashboard.jsx";
import ModulePage from "./modules/ModulePage.jsx";
import { rp, fmtQty, fmtDelta, fmtJam, fmtJamKerja, fmtPersen } from "./lib/format.js";
import {
  PRODUCTS_DEFAULT as PRODUCTS,
  MATERIALS_DEFAULT,
  DEFAULTS,
  LABA_KEMARIN,
  DAILY,
  WEEKLY,
  ORDERS as ORDERS_DEFAULT,
  STOCK_LOGS_DEFAULT,
  solveMILP,
  predictCoverage,
  loadLocal,
  saveLocal,
} from "./lib/solver.js";

const PRODUCT_CHOICES = [
  { name: "Roti Manis", tint: "#FDE8E8" },
  { name: "Roti Tawar", tint: "#EAF1FE" },
  { name: "Roti Kering (Bagelan)", tint: "#FEF3E2" },
  { name: "Snack Box Kampus", tint: "#E7F6EE" },
];

export default function App() {
  const [page, setPage] = useState("Dashboard");
  const [params, setParams] = useState(() => loadLocal("tefa-params", DEFAULTS));
  const [materials, setMaterials] = useState(() => loadLocal("tefa-materials", MATERIALS_DEFAULT));
  const [logs, setLogs] = useState(() => loadLocal("tefa-logs", STOCK_LOGS_DEFAULT));
  const [orders, setOrders] = useState(() => loadLocal("tefa-orders", ORDERS_DEFAULT));
  const [mode, setMode] = useState("harian");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => saveLocal("tefa-params", params), [params]);
  useEffect(() => saveLocal("tefa-materials", materials), [materials]);
  useEffect(() => saveLocal("tefa-logs", logs), [logs]);
  useEffect(() => saveLocal("tefa-orders", orders), [orders]);

  const res = useMemo(() => solveMILP(params, materials, PRODUCTS), [params, materials]);
  const coverage = res.coverage || predictCoverage(materials, res.usage || {}, res.remain || {});
  const lowStockCount = materials.filter((m) => {
    const c = coverage[m.id];
    if (!c) return false;
    return c.status === "Kritis" || c.status === "Habis";
  }).length;
  const stockValue = materials.reduce((s, m) => s + (m.stock || 0) * (m.price || 0), 0);

  const set = (k) => (e) => setParams((p) => ({ ...p, [k]: Number(e.target.value) }));
  const notify = (message, type = "success") => setToast({ message, type });
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const reset = () => {
    setParams(DEFAULTS);
    setMaterials(MATERIALS_DEFAULT);
    setLogs(STOCK_LOGS_DEFAULT);
    setOrders(ORDERS_DEFAULT);
    notify("Parameter, stok gudang, dan pesanan dikembalikan ke awal.");
  };

  const addStockLog = ({ materialId, type, qty, note }) => {
    const q = Number(qty);
    if (!materialId || !(q > 0)) {
      notify("Pilih bahan dan isi jumlah lebih dari nol.", "error");
      return false;
    }
    const mat = materials.find((m) => m.id === materialId);
    if (!mat) return false;
    let delta = 0;
    if (type === "Masuk") delta = q;
    else if (type === "Keluar") delta = 0 - q;
    if (type === "Keluar" && mat.stock - q < 0 - 1e-9) {
      notify("Stok belum cukup untuk pengeluaran sebesar itu.", "error");
      return false;
    }
    const today = new Date().toISOString().slice(0, 10);
    const id = "LOG" + String(Date.now()).slice(0 - 6);
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === materialId ? { ...m, stock: Math.max(0, Math.round((m.stock + delta) * 100) / 100) } : m
      )
    );
    setLogs((prev) =>
      [
        {
          id,
          date: today,
          materialId,
          type,
          qty: q,
          note: note || (type === "Masuk" ? "Pembelian atau restock" : "Pemakaian produksi"),
        },
        ...prev,
      ].slice(0, 100)
    );
    notify(`${type} ${mat.name} ${fmtQty(q)} ${mat.unit} tercatat.`);
    return true;
  };

  const setStockDirect = (materialId, newStock) => {
    const v = Number(newStock);
    if (!(v >= 0)) {
      notify("Stok minimal nol.", "error");
      return;
    }
    const mat = materials.find((m) => m.id === materialId);
    setMaterials((prev) =>
      prev.map((m) => (m.id === materialId ? { ...m, stock: Math.round(v * 100) / 100 } : m))
    );
    const today = new Date().toISOString().slice(0, 10);
    setLogs((prev) =>
      [
        {
          id: "LOG" + String(Date.now()).slice(0 - 6),
          date: today,
          materialId,
          type: "Penyesuaian",
          qty: v,
          note: `Stok diset manual dari ${fmtQty(mat ? mat.stock : 0)} menjadi ${fmtQty(v)}`,
        },
        ...prev,
      ].slice(0, 100)
    );
    notify(`Stok ${mat ? mat.name : materialId} diperbarui.`);
  };

  const addOrder = ({ product, qty, kind, deadline, note }) => {
    const jumlah = Number(qty);
    if (!product || !(jumlah > 0)) {
      notify("Pilih produk dan isi jumlah lebih dari nol.", "error");
      return false;
    }
    const choice = PRODUCT_CHOICES.find((p) => p.name === product) || PRODUCT_CHOICES[0];
    const isKhusus = kind === "Khusus";
    const nextNum = orders.length + 1;
    const id = "ORD-" + String(nextNum).padStart(3, "0") + "-" + String(Date.now()).slice(0 - 4);
    const baru = {
      id,
      act: choice.name,
      emoji: "",
      tint: choice.tint,
      sub: isKhusus ? "Pesanan Khusus" : "Produksi Rutin",
      deadline: deadline || "Segera",
      qty: jumlah,
      status: "Menunggu",
      st: "wait",
      note: note || "",
    };
    setOrders((prev) => [baru, ...prev].slice(0, 100));
    notify(`Pesanan ${choice.name} ${jumlah} unit tercatat.`);
    return true;
  };

  const goParams = () => {
    setPage("Dashboard");
    setTimeout(() => {
      const el = document.getElementById("parameter");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 60);
  };
  const goGudang = () => setPage("Bahan Baku");

  const chartData = useMemo(() => {
    const base = mode === "harian" ? DAILY : WEEKLY;
    const live =
      mode === "harian"
        ? { label: "Min", title: "Minggu, 18 Okt 2026, hasil optimasi", laba: res.profit, pendapatan: res.revenue }
        : { label: "P4", title: "Minggu keempat, berjalan live", laba: res.profit, pendapatan: res.revenue };
    return [...base, live];
  }, [mode, res]);

  const totalUnit = res.x1 + res.x2 + res.x3;
  const deltaStr = fmtDelta(res.profit, LABA_KEMARIN);
  const modalPct = Math.round((res.used.modal / params.modal) * 100);

  const tiles = [
    {
      icon: "bread",
      tint: "#FDE8E8",
      name: "Roti Manis",
      qty: res.x1,
      sub: "Margin " + rp(PRODUCTS[0].margin) + " per unit",
      st: params.orderMin > 0 ? ["warn", "Pesanan Khusus"] : ["ok", "Rutin"],
    },
    {
      icon: "bread",
      tint: "#EAF1FE",
      name: "Roti Tawar",
      qty: res.x2,
      sub: "Margin " + rp(PRODUCTS[1].margin) + " per unit",
      st: ["ok", "Rutin"],
    },
    {
      icon: "cookie",
      tint: "#FEF3E2",
      name: "Roti Kering Bagelan",
      qty: res.x3,
      sub: "Margin " + rp(PRODUCTS[2].margin) + " per unit",
      st: ["ok", "Rutin"],
    },
    {
      icon: "coins",
      tint: "#E7F6EE",
      name: "Sisa Modal",
      val: rp(params.modal - res.used.modal),
      sub: "Kas belum teralokasi",
      st: ["ok", "Optimal"],
    },
  ];

  const SLIDERS = [
    { k: "modal", label: "Modal Bahan Baku", min: 250000, max: 2000000, step: 50000, fmt: rp },
    { k: "ovenJam", label: "Kapasitas Oven", min: 2, max: 12, step: 0.5, fmt: fmtJam },
    { k: "mixerJam", label: "Kapasitas Mixer", min: 1, max: 8, step: 0.5, fmt: fmtJam },
    { k: "sdmJam", label: "Kapasitas SDM", min: 4, max: 24, step: 1, fmt: fmtJamKerja },
    { k: "orderMin", label: "Pesanan Khusus Roti Manis", min: 0, max: 250, step: 5, fmt: (v) => `${v} unit minimum` },
  ];

  const barRow = (label, used, cap, isModal) => {
    const pct = Math.min(100, (used / cap) * 100);
    return (
      <div className="brow" key={label}>
        <div className="btop">
          <span>{label}</span>
          <em>
            {isModal
              ? `${rp(used)} dari ${rp(cap)}, ${fmtPersen(pct)}`
              : `${Math.round(used)} dari ${cap} menit, ${fmtPersen(pct)}`}
          </em>
        </div>
        <div className="track">
          <div className={"fill" + (!isModal && pct > 85 ? " warn" : "")} style={{ width: pct + "%" }} />
        </div>
      </div>
    );
  };

  const notifCount = 1 + lowStockCount + (res.status !== "Optimal" ? 1 : 0);

  return (
    <div className="shell">
      <Sidebar page={page} setPage={setPage} goParams={goParams} lowStockCount={lowStockCount} />
      <main className="main">
        <Topbar
          page={page}
          notify={notify}
          notificationsOpen={notificationsOpen}
          setNotificationsOpen={setNotificationsOpen}
          setHelpOpen={setHelpOpen}
          setPage={setPage}
          notifCount={notifCount}
          notificationProps={{ res, lowStockCount, materials, coverage }}
          materials={materials}
          orders={orders}
          onAddLog={addStockLog}
          onAddOrder={addOrder}
        />
        {page !== "Dashboard" ? (
          <ModulePage
            page={page}
            res={res}
            setPage={setPage}
            materials={materials}
            logs={logs}
            orders={orders}
            coverage={coverage}
            stockValue={stockValue}
            onAddLog={addStockLog}
            onSetStock={setStockDirect}
            onAddOrder={addOrder}
          />
        ) : (
          <Dashboard
            params={params}
            set={set}
            reset={reset}
            goParams={goParams}
            goGudang={goGudang}
            res={res}
            coverage={coverage}
            materials={materials}
            orders={orders}
            lowStockCount={lowStockCount}
            stockValue={stockValue}
            chartData={chartData}
            mode={mode}
            setMode={setMode}
            tiles={tiles}
            SLIDERS={SLIDERS}
            barRow={barRow}
            totalUnit={totalUnit}
            deltaStr={deltaStr}
            modalPct={modalPct}
            onAddLog={addStockLog}
            onAddOrder={addOrder}
          />
        )}
      </main>
      {helpOpen && (
        <HelpModal
          onClose={() => setHelpOpen(false)}
          onNavigate={(target) => {
            setHelpOpen(false);
            setPage(target);
          }}
        />
      )}
      {toast && (
        <div className={"toast " + toast.type} role="status">
          <Icon name={toast.type === "error" ? "help" : "check"} size={16} />
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} aria-label="Tutup notifikasi">×</button>
        </div>
      )}
    </div>
  );
}
