import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import HelpModal from "./components/HelpModal.jsx";
import Icon from "./components/Icon.jsx";
import Dashboard from "./modules/Dashboard.jsx";
import DashboardProduksi from "./modules/DashboardProduksi.jsx";
import Login from "./components/Login.jsx";
import ModulePage from "./modules/ModulePage.jsx";
import { rp, fmtQty, fmtDelta, fmtJam, fmtJamKerja, fmtPersen } from "./lib/format.js";
import { DEFAULT_ROLE, ROLES, getRole, can } from "./lib/roles.js";
import { planMonthly, dayNameID } from "./lib/planner.js";
import { overview, localYmd, batchInfo, shelfOf } from "./lib/stokjadi.js";
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
  const [session, setSession] = useState(() => loadLocal("tefa-session", null));
  const roleId = session && ROLES[session.role] ? session.role : DEFAULT_ROLE;
  const [params, setParams] = useState(() => ({ ...DEFAULTS, ...loadLocal("tefa-params", {}) }));
  const [products, setProducts] = useState(() => loadLocal("tefa-products", PRODUCTS));
  const [materials, setMaterials] = useState(() => loadLocal("tefa-materials", MATERIALS_DEFAULT));
  const [logs, setLogs] = useState(() => loadLocal("tefa-logs", STOCK_LOGS_DEFAULT));
  const [orders, setOrders] = useState(() => loadLocal("tefa-orders", ORDERS_DEFAULT));
  const [approved, setApproved] = useState(() => loadLocal("tefa-approved", null));
  const [realisasi, setRealisasi] = useState(() => loadLocal("tefa-realisasi", []));
  const [requests, setRequests] = useState(() => loadLocal("tefa-requests", []));
  const [batches, setBatches] = useState(() => loadLocal("tefa-batches", []));
  const [sales, setSales] = useState(() => loadLocal("tefa-sales", []));
  const [waste, setWaste] = useState(() => loadLocal("tefa-waste", []));
  const [audit, setAudit] = useState(() => loadLocal("tefa-audit", []));
  const [mode, setMode] = useState("harian");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => saveLocal("tefa-params", params), [params]);
  useEffect(() => saveLocal("tefa-materials", materials), [materials]);
  useEffect(() => saveLocal("tefa-logs", logs), [logs]);
  useEffect(() => saveLocal("tefa-orders", orders), [orders]);
  useEffect(() => saveLocal("tefa-products", products), [products]);
  useEffect(() => saveLocal("tefa-approved", approved), [approved]);
  useEffect(() => saveLocal("tefa-realisasi", realisasi), [realisasi]);
  useEffect(() => saveLocal("tefa-requests", requests), [requests]);
  useEffect(() => saveLocal("tefa-audit", audit), [audit]);
  useEffect(() => saveLocal("tefa-batches", batches), [batches]);
  useEffect(() => saveLocal("tefa-sales", sales), [sales]);
  useEffect(() => saveLocal("tefa-waste", waste), [waste]);
  useEffect(() => saveLocal("tefa-session", session), [session]);

  const res = useMemo(() => solveMILP(params, materials, products), [params, materials, products]);
  const stokJadi = useMemo(() => overview({ products, batches, sales, approved }), [products, batches, sales, approved]);
  const demandCaps = useMemo(() => {
    const o = {};
    products.forEach((p) => {
      const c = stokJadi[p.id];
      o[p.id] = c && c.avg.real ? { name: p.name, real: true, cap: Math.max(1, Math.min(p.dmax, Math.ceil(c.avg.value * Math.min(3.5, shelfOf(p))))) } : null;
    });
    return o;
  }, [products, stokJadi]);
  const planProducts = useMemo(() => (params.useDemand ? products.map((p) => (demandCaps[p.id] ? { ...p, dmax: demandCaps[p.id].cap } : p)) : products), [products, params.useDemand, demandCaps]);
  const plan = useMemo(() => planMonthly(params, planProducts, materials), [params, planProducts, materials]);
  const coverage = res.coverage || predictCoverage(materials, res.usage || {}, res.remain || {});
  const lowStockCount = materials.filter((m) => {
    const c = coverage[m.id];
    if (!c) return false;
    return c.status === "Kritis" || c.status === "Habis";
  }).length;
  const stockValue = materials.reduce((s, m) => s + (m.stock || 0) * (m.price || 0), 0);

  const notify = (message, type = "success") => setToast({ message, type });
  const role = getRole(roleId);
  const who = session ? session.name : "-";
  const logAudit = (action, detail = "", denied = false) =>
    setAudit((prev) =>
      [{ id: "AUD" + Date.now() + Math.floor(Math.random() * 99), ts: new Date().toISOString(), user: who, role: role.label, action, detail, denied }, ...prev].slice(0, 200)
    );
  const guard = (perm, msg) => {
    if (can(roleId, perm)) return true;
    notify(msg || "Anda tidak memiliki izin untuk tindakan ini.", "error");
    logAudit("Akses ditolak", perm, true);
    return false;
  };
  const setParam = (k, v) => {
    if (!guard("plan.simulate", "Parameter hanya dapat diubah Admin Utama.")) return;
    setParams((p) => ({ ...p, [k]: v }));
  };
  const set = (k) => (e) => setParam(k, Number(e.target.value));
  const navigate = (target) => {
    if (!role.pages.includes(target)) {
      notify(`Menu ${target} tidak tersedia untuk ${role.label}.`, "error");
      logAudit("Akses ditolak", "Menu " + target, true);
      return;
    }
    setPage(target);
  };
  const login = (u) => {
    setSession({ username: u.username, role: u.role, name: u.name });
    setPage("Dashboard");
    setAudit((prev) => [{ id: "AUD" + Date.now(), ts: new Date().toISOString(), user: u.name, role: ROLES[u.role].label, action: "Login", detail: u.username, denied: false }, ...prev].slice(0, 200));
  };
  const logout = () => {
    logAudit("Logout", session ? session.username : "");
    setSession(null);
    setPage("Dashboard");
  };
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const reset = () => {
    if (!guard("settings.manage", "Reset data hanya untuk Admin Utama.")) return;
    logAudit("Reset data", "Semua data dikembalikan ke awal");
    setProducts(PRODUCTS);
    setApproved(null);
    setRealisasi([]);
    setBatches([]);
    setSales([]);
    setWaste([]);
    setRequests([]);
    setParams(DEFAULTS);
    setMaterials(MATERIALS_DEFAULT);
    setLogs(STOCK_LOGS_DEFAULT);
    setOrders(ORDERS_DEFAULT);
    notify("Parameter, stok gudang, dan pesanan dikembalikan ke awal.");
  };

  const applyStock = ({ materialId, type, qty, note }) => {
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

  const addStockLog = (p) => {
    if (p.type === "Masuk" && !guard("stock.in", "Barang masuk langsung hanya untuk Admin Utama. Gunakan menu Pengajuan Bahan.")) return false;
    if (p.type === "Keluar" && !guard("stock.out")) return false;
    const ok = applyStock(p);
    if (ok) logAudit("Stok " + p.type, `${p.materialId} ${p.qty}`);
    return ok;
  };

  const setStockDirect = (materialId, newStock) => {
    if (!guard("stock.adjust", "Koreksi stok hanya untuk Admin Utama.")) return;
    logAudit("Koreksi stok", `${materialId} → ${newStock}`);
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

  const addOrder = ({ product, qty, kind, deadline, note, paymentMethod = "Tunai", recordingMethod = "Manual" }) => {
    if (!guard("order.create")) return false;
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
      act: product,
      emoji: "",
      tint: choice.tint,
      sub: isKhusus ? "Pesanan Khusus" : "Produksi Rutin",
      deadline: deadline || "Segera",
      qty: jumlah,
      status: "Menunggu",
      st: "wait",
      note: note || "",
      paymentMethod,
      recordingMethod,
    };
    setOrders((prev) => [baru, ...prev].slice(0, 100));
    notify(`Pesanan ${choice.name} ${jumlah} unit tercatat.`);
    return true;
  };

  // ---------- Perencanaan ----------
  const approvePlan = () => {
    if (!guard("plan.approve", "Hanya Admin Utama yang dapat menyetujui rencana.")) return;
    if (plan.status !== "Optimal") return notify("Rencana belum layak, perbaiki input terlebih dahulu.", "error");
    setApproved({ status: "approved", approvedAt: new Date().toISOString(), approvedBy: who, snapshot: plan });
    logAudit("Rencana disetujui", `Modal ${plan.modal} • laba ${Math.round(plan.monthly.profit)}`);
    notify("Rencana bulanan disetujui dan diterbitkan ke Admin Produksi.");
  };
  const revokePlan = () => {
    if (!guard("plan.approve")) return;
    setApproved(null);
    logAudit("Rencana ditarik", "");
    notify("Rencana ditarik kembali menjadi draft.");
  };

  // ---------- Realisasi produksi ----------
  const reportProduction = ({ x1, x2, x3, reject, note, deduct }) => {
    if (!guard("production.report")) return false;
    if (x1 + x2 + x3 <= 0) {
      notify("Isi minimal satu jumlah produksi.", "error");
      return false;
    }
    const xs = [x1, x2, x3];
    const usage = {};
    materials.forEach((m) => {
      usage[m.id] = Math.round(xs.reduce((s, x, i) => s + x * ((products[i] && products[i].bom[m.id]) || 0), 0) * 100) / 100;
    });
    if (deduct) {
      const kurang = materials.filter((m) => usage[m.id] > m.stock + 1e-9);
      if (kurang.length) {
        notify("Stok tidak cukup untuk: " + kurang.map((m) => m.name).join(", ") + ". Ajukan pembelian dahulu.", "error");
        return false;
      }
      const today = new Date().toISOString().slice(0, 10);
      setMaterials((prev) => prev.map((m) => ({ ...m, stock: Math.max(0, Math.round((m.stock - usage[m.id]) * 100) / 100) })));
      setLogs((prev) => [
        ...materials.filter((m) => usage[m.id] > 0).map((m, i) => ({ id: "LOG" + String(Date.now()).slice(-5) + i, date: today, materialId: m.id, type: "Keluar", qty: usage[m.id], note: "Pemakaian produksi (otomatis dari realisasi)" })),
        ...prev,
      ].slice(0, 100));
    }
    const d = new Date();
    setRealisasi((prev) => [{ id: "REAL" + Date.now(), date: d.toISOString().slice(0, 10), day: dayNameID(d), x1, x2, x3, reject, note, by: who }, ...prev].slice(0, 200));
    setBatches((prev) => [...xs.map((x, i) => ({ id: "B" + Date.now() + i, productId: products[i].id, date: localYmd(), qty: x, remaining: x })).filter((b) => b.qty > 0), ...prev].slice(0, 300));
    logAudit("Realisasi produksi", `Manis ${x1}, Tawar ${x2}, Kering ${x3}`);
    notify("Realisasi produksi tersimpan." + (deduct ? " Stok bahan dikurangi." : ""));
    return true;
  };

  // ---------- Penjualan & stok barang jadi ----------
  const recordSale = ({ productId, qty }) => {
    if (!guard("sales.record")) return false;
    const q = Math.floor(Number(qty));
    const p = products.find((x) => x.id === productId);
    if (!p || !(q > 0)) {
      notify("Pilih produk dan isi jumlah terjual.", "error");
      return false;
    }
    const today = localYmd();
    const usable = batches.filter((b) => b.productId === productId && b.remaining > 0 && !batchInfo(b, p, today).expired).sort((a, b) => a.date.localeCompare(b.date));
    const avail = usable.reduce((s, b) => s + b.remaining, 0);
    if (q > avail) {
      notify(`Stok siap jual ${p.name} hanya ${avail} pcs. Catat hasil produksi dulu bila belum.`, "error");
      return false;
    }
    let need = q;
    const upd = {};
    usable.forEach((b) => {
      if (need <= 0) return;
      const t = Math.min(b.remaining, need);
      upd[b.id] = b.remaining - t;
      need -= t;
    });
    setBatches((prev) => prev.map((b) => (upd[b.id] !== undefined ? { ...b, remaining: upd[b.id] } : b)));
    setSales((prev) => [{ id: "SAL" + Date.now(), date: today, productId, qty: q, by: who }, ...prev].slice(0, 500));
    logAudit("Penjualan", `${p.name} ${q}`);
    notify(`Penjualan ${q} pcs ${p.name} tercatat.`);
    return true;
  };
  const discardExpired = () => {
    if (!guard("sales.record")) return;
    const today = localYmd();
    const exp = batches.filter((b) => b.remaining > 0 && batchInfo(b, products.find((p) => p.id === b.productId), today).expired);
    if (!exp.length) return notify("Tidak ada roti kedaluwarsa.", "error");
    setWaste((prev) => [...exp.map((b) => ({ id: "WST" + Date.now() + b.id, date: today, productId: b.productId, qty: b.remaining, by: who })), ...prev].slice(0, 300));
    setBatches((prev) => prev.map((b) => (exp.some((e) => e.id === b.id) ? { ...b, remaining: 0 } : b)));
    logAudit("Roti dibuang", exp.reduce((s, b) => s + b.remaining, 0) + " pcs");
    notify("Roti kedaluwarsa dicatat sudah dibuang.");
  };

  // ---------- Pengajuan pembelian ----------
  const createRequest = ({ materialId, qty, reason }) => {
    if (!guard("request.create")) return false;
    const q = Number(qty);
    if (!materialId || !(q > 0)) {
      notify("Pilih bahan dan isi jumlah lebih dari nol.", "error");
      return false;
    }
    setRequests((prev) => [{ id: "REQ" + String(Date.now()).slice(-6), date: new Date().toISOString().slice(0, 10), by: who, materialId, qty: q, reason: reason || "-", status: "Menunggu" }, ...prev]);
    logAudit("Pengajuan bahan", `${materialId} ${q}`);
    notify("Pengajuan dikirim ke Admin Utama.");
    return true;
  };
  const decideRequest = (id, ok) => {
    if (!guard("request.approve", "Hanya Admin Utama yang dapat menyetujui pengajuan.")) return;
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: ok ? "Disetujui" : "Ditolak", decidedBy: who } : r)));
    logAudit(ok ? "Pengajuan disetujui" : "Pengajuan ditolak", id);
  };
  const receiveRequest = (id) => {
    if (!guard("request.receive")) return;
    const r = requests.find((x) => x.id === id);
    if (!r || r.status !== "Disetujui") return notify("Hanya pengajuan yang disetujui yang dapat diterima.", "error");
    if (applyStock({ materialId: r.materialId, type: "Masuk", qty: r.qty, note: "Penerimaan pengajuan " + id })) {
      setRequests((prev) => prev.map((x) => (x.id === id ? { ...x, status: "Diterima" } : x)));
      logAudit("Penerimaan bahan", `${id} ${r.materialId} ${r.qty}`);
    }
  };

  // ---------- Pengelolaan bahan baku ----------
  const addMaterial = (f) => {
    if (!guard("material.manage", "Pengelolaan bahan baku hanya untuk Admin Utama.")) return false;
    const name = String(f.name || "").trim();
    if (!name || !(Number(f.price) >= 0) || f.price === "") {
      notify("Isi nama bahan dan harga satuan.", "error");
      return false;
    }
    if (materials.some((m) => m.name.toLowerCase() === name.toLowerCase())) {
      notify("Bahan dengan nama itu sudah ada.", "error");
      return false;
    }
    const n = materials.reduce((mx, m) => Math.max(mx, parseInt(String(m.id).replace(/\D/g, ""), 10) || 0), 0) + 1;
    const id = "RM" + String(n).padStart(3, "0");
    const stock = Math.max(0, Number(f.stock) || 0);
    setMaterials((prev) => [...prev, { id, name, unit: f.unit || "kg", stock, price: Number(f.price), minStock: Number(f.minStock) || 0, shelfDays: Number(f.shelfDays) || 90 }]);
    if (stock > 0) setLogs((prev) => [{ id: "LOG" + String(Date.now()).slice(-6), date: new Date().toISOString().slice(0, 10), materialId: id, type: "Masuk", qty: stock, note: "Stok awal bahan baru" }, ...prev].slice(0, 100));
    logAudit("Tambah bahan", `${id} ${name}`);
    notify(`Bahan ${name} ditambahkan. Atur takarannya di Produk & Resep.`);
    return true;
  };
  const editMaterial = (id, d) => {
    if (!guard("material.manage")) return false;
    const name = String(d.name || "").trim();
    if (!name) {
      notify("Nama bahan tidak boleh kosong.", "error");
      return false;
    }
    setMaterials((prev) => prev.map((m) => (m.id === id ? { ...m, name, unit: d.unit, price: Number(d.price) || 0, minStock: Number(d.minStock) || 0, shelfDays: Number(d.shelfDays) || 0 } : m)));
    logAudit("Ubah bahan", `${id} ${name}`);
    notify("Data bahan diperbarui.");
    return true;
  };
  const deleteMaterial = (id) => {
    if (!guard("material.manage")) return;
    const pakai = products.filter((p) => (p.bom[id] || 0) > 0).map((p) => p.name);
    if (pakai.length) {
      notify("Bahan masih dipakai di resep " + pakai.join(", ") + ". Kosongkan di Produk & Resep dahulu.", "error");
      return;
    }
    const m = materials.find((x) => x.id === id);
    setMaterials((prev) => prev.filter((x) => x.id !== id));
    setProducts((prev) => prev.map((p) => { const bom = { ...p.bom }; delete bom[id]; return { ...p, bom }; }));
    logAudit("Hapus bahan", `${id} ${m ? m.name : ""}`);
    notify("Bahan dihapus.");
  };

  // ---------- Master data ----------
  const updateProduct = (id, k, v) => {
    if (!guard("master.edit", "Master data hanya dapat diubah Admin Utama.")) return;
    setProducts((prev) => prev.map((p) => (p.id === id ? (() => { const n = { ...p, [k]: v }; n.margin = n.price - n.hpp; return n; })() : p)));
    logAudit("Ubah produk", `${id}.${k} = ${v}`);
  };
  const updateBom = (pid, mid, v) => {
    if (!guard("master.edit")) return;
    setProducts((prev) => prev.map((p) => (p.id === pid ? { ...p, bom: { ...p.bom, [mid]: v } } : p)));
    logAudit("Ubah resep", `${pid}/${mid} = ${v}`);
  };
  const updateMaterial = (id, k, v) => {
    if (!guard("master.edit")) return;
    setMaterials((prev) => prev.map((m) => (m.id === id ? { ...m, [k]: v } : m)));
    logAudit("Ubah bahan", `${id}.${k} = ${v}`);
  };

  const goParams = () => {
    navigate("Dashboard");
    setTimeout(() => {
      const el = document.getElementById("parameter");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 60);
  };
  const goGudang = () => navigate("Bahan Baku");

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
      sub: "Margin " + rp(products[0].margin) + " per unit",
      st: params.orderMin > 0 ? ["warn", "Pesanan Khusus"] : ["ok", "Rutin"],
    },
    {
      icon: "bread",
      tint: "#EAF1FE",
      name: "Roti Tawar",
      qty: res.x2,
      sub: "Margin " + rp(products[1].margin) + " per unit",
      st: ["ok", "Rutin"],
    },
    {
      icon: "cookie",
      tint: "#FEF3E2",
      name: "Roti Kering Bagelan",
      qty: res.x3,
      sub: "Margin " + rp(products[2].margin) + " per unit",
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

  const canFinance = can(roleId, "finance.view");
  const badges = {
    "Pengajuan Bahan": requests.filter((r) => r.status === (roleId === "utama" ? "Menunggu" : "Disetujui")).length || null,
    Pesanan: orders.filter((o) => o.status !== "Selesai").length ? orders.filter((o) => o.status !== "Selesai").length + " aktif" : null,
    Optimasi: "MILP",
  };
  const notifCount = 1 + lowStockCount + (res.status !== "Optimal" ? 1 : 0);

  if (!session) return <Login onLogin={login} />;

  return (
    <div className="shell">
      <Sidebar page={page} setPage={navigate} goParams={goParams} lowStockCount={lowStockCount} allowedPages={role.pages} role={role} badges={badges} />
      <main className="main">
        <Topbar
          page={page}
          notify={notify}
          notificationsOpen={notificationsOpen}
          setNotificationsOpen={setNotificationsOpen}
          setHelpOpen={setHelpOpen}
          setPage={navigate}
          notifCount={notifCount}
          notificationProps={{ res, lowStockCount, materials, coverage }}
          materials={materials}
          orders={orders}
          onAddLog={addStockLog}
          onAddOrder={addOrder}
          role={role}
          user={session}
          onLogout={logout}
          canIn={can(roleId, "stock.in")}
        />
        {page === "Dashboard" && roleId === "produksi" ? (
          <DashboardProduksi
            stokJadi={stokJadi} approved={approved} materials={materials} coverage={coverage} orders={orders} requests={requests}
            realisasi={realisasi} go={navigate} onAddLog={addStockLog} onAddOrder={addOrder}
          />
        ) : page === "Dashboard" && roleId === "kasir" ? (
          <Dashboard
            params={params} set={set} reset={reset} goParams={goParams} goGudang={goGudang}
            res={res} coverage={coverage} materials={materials} orders={orders}
            lowStockCount={lowStockCount} stockValue={stockValue} chartData={chartData}
            mode={mode} setMode={setMode} tiles={tiles} SLIDERS={SLIDERS}
            barRow={barRow} totalUnit={totalUnit} deltaStr={deltaStr} modalPct={modalPct}
            onAddLog={addStockLog} onAddOrder={addOrder}
            canResetData={can(roleId, "settings.manage")}
            canManageSettings={can(roleId, "plan.simulate")}
            plan={plan} approved={approved} go={navigate} roleId={roleId}
            kasirView={true}
            sales={sales} stokJadi={stokJadi} products={products} onSale={recordSale}
          />
        ) : page !== "Dashboard" ? (
          <ModulePage
            page={page}
            res={res}
            setPage={navigate}
            materials={materials}
            logs={logs}
            orders={orders}
            coverage={coverage}
            stockValue={stockValue}
            onAddLog={addStockLog}
            onSetStock={setStockDirect}
            onAddOrder={addOrder}
            roleId={roleId}
            role={role}
            canFinance={canFinance}
            plan={plan}
            params={params}
            setParam={setParam}
            products={products}
            approved={approved}
            onApprove={approvePlan}
            onRevoke={revokePlan}
            realisasi={realisasi}
            onReport={reportProduction}
            requests={requests}
            onCreateRequest={createRequest}
            onDecideRequest={decideRequest}
            onReceiveRequest={receiveRequest}
            onProduct={updateProduct}
            onBom={updateBom}
            onAddMaterial={addMaterial}
            onEditMaterial={editMaterial}
            onDeleteMaterial={deleteMaterial}
            audit={audit}
            onLogout={logout}
            stokJadi={stokJadi}
            sales={sales}
            waste={waste}
            onSale={recordSale}
            onDiscard={discardExpired}
            demandCaps={demandCaps}
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
            canResetData={can(roleId, "settings.manage")}
            canManageSettings={can(roleId, "plan.simulate")}
            plan={plan}
            approved={approved}
            go={navigate}
            roleId={roleId}
          />
        )}
      </main>
      {helpOpen && (
        <HelpModal
          onClose={() => setHelpOpen(false)}
          onNavigate={(target) => {
            setHelpOpen(false);
            navigate(target);
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
