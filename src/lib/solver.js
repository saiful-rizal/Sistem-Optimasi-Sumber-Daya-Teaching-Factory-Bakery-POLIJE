import staticData from "../data/tefa-data.json";

export const PRODUCTS_DEFAULT = staticData.products;
export const MATERIALS_DEFAULT = staticData.materials;
export const DEFAULTS = staticData.defaults;
export const LABA_KEMARIN = staticData.labaKemarin;
export const DAILY = staticData.daily;
export const WEEKLY = staticData.weekly;
export const ORDERS = staticData.orders;
export const STOCK_LOGS_DEFAULT = staticData.stockLogs || [];

export function maxByStock(stockMap, bom, dmax) {
  let cap = dmax;
  Object.keys(bom || {}).forEach((mid) => {
    const need = bom[mid] || 0;
    if (need > 0) cap = Math.min(cap, Math.floor((stockMap[mid] ?? 0) / need));
  });
  return Math.max(0, cap);
}

export function predictCoverage(materials, usage, remain) {
  const out = {};
  materials.forEach((m) => {
    const need = usage[m.id] || 0;
    const left = Math.max(0, remain[m.id] ?? m.stock);
    const days = need > 1e-9 ? left / need : 99;
    const cappedDays = Math.min(99, days);
    const need7 = need * 7;
    const suggest7 = Math.max(0, need7 - left);
    const status =
      left <= 0
        ? "Habis"
        : left < (m.minStock || 0)
          ? "Kritis"
          : need > 0 && cappedDays < 3
            ? "Menipis"
            : left < (m.minStock || 0) * 2
              ? "Waspada"
              : "Aman";
    out[m.id] = {
      need,
      left,
      days: cappedDays,
      daysLabel:
        need > 1e-9
          ? cappedDays >= 99
            ? "99 lebih"
            : cappedDays.toFixed(1).replace(".", ",")
          : "Belum terpakai",
      suggest7,
      status,
    };
  });
  return out;
}

export function solveMILP(p, materials = MATERIALS_DEFAULT, products = PRODUCTS_DEFAULT) {
  const [A, B, C] = products;
  const stockMap = {};
  materials.forEach((m) => {
    stockMap[m.id] = m.stock;
  });
  const modal = p.modal;
  const oven = p.ovenJam * 60;
  const mixer = p.mixerJam * 60;
  const sdm = p.sdmJam * 60;
  const caps = { modal, oven, mixer, sdm };
  const usage = {};
  const remain = {};
  materials.forEach((m) => {
    usage[m.id] = 0;
    remain[m.id] = m.stock;
  });
  const zero = (reason) => ({
    status: "Infeasible",
    reason,
    x1: 0,
    x2: 0,
    x3: 0,
    profit: 0,
    revenue: 0,
    used: { modal: 0, oven: 0, mixer: 0, sdm: 0 },
    usage,
    remain,
    caps,
    bottleneck: "Belum ada",
    bottleneckPct: 0,
    stockConstrained: false,
    coverage: {},
  });

  const feasibleA = (x) => {
    if (modal - x * A.hpp < -1e-9) return false;
    if (oven - x * A.oven < -1e-9 || mixer - x * A.mixer < -1e-9 || sdm - x * A.sdm < -1e-9) return false;
    for (const m of materials) {
      const need = (A.bom[m.id] || 0) * x;
      if (need - (stockMap[m.id] || 0) > 1e-9) return false;
    }
    return true;
  };

  const capA = Math.min(
    A.dmax,
    Math.floor(oven / A.oven),
    Math.floor(mixer / A.mixer),
    Math.floor(sdm / A.sdm),
    maxByStock(stockMap, A.bom, A.dmax)
  );

  if (p.orderMin > capA) {
    let cause = "Kapasitas atau modal belum cukup untuk pesanan khusus minimum.";
    const byStockOnly = maxByStock(stockMap, A.bom, 1e9);
    if (p.orderMin > byStockOnly)
      cause = "Stok gudang belum cukup untuk pesanan khusus minimum. Tambah stok lalu catat pembelian di menu Gudang.";
    return zero(cause);
  }
  if (!feasibleA(p.orderMin)) return zero("Pesanan minimum melebihi batas stok atau kapasitas.");

  let best = null;
  for (let x1 = p.orderMin; x1 <= capA; x1++) {
    const rm = modal - x1 * A.hpp;
    const ro = oven - x1 * A.oven;
    const rx = mixer - x1 * A.mixer;
    const rs = sdm - x1 * A.sdm;
    if (rm < 0 || ro < 0 || rx < 0 || rs < 0) break;
    const rem1 = {};
    let ok1 = true;
    for (const m of materials) {
      rem1[m.id] = (stockMap[m.id] || 0) - x1 * (A.bom[m.id] || 0);
      if (rem1[m.id] < -1e-9) {
        ok1 = false;
        break;
      }
    }
    if (!ok1) break;
    const capBstock = maxByStock(rem1, B.bom, B.dmax);
    const capB = Math.min(
      B.dmax,
      capBstock,
      Math.floor(rm / B.hpp),
      Math.floor(ro / B.oven),
      Math.floor(rx / B.mixer),
      Math.floor(rs / B.sdm)
    );
    for (let x2 = 0; x2 <= capB; x2++) {
      const m2 = rm - x2 * B.hpp;
      const ro2 = ro - x2 * B.oven;
      const rx2 = rx - x2 * B.mixer;
      const rs2 = rs - x2 * B.sdm;
      const rem2 = {};
      for (const m of materials) rem2[m.id] = rem1[m.id] - x2 * (B.bom[m.id] || 0);
      const x3 = Math.max(
        0,
        Math.min(
          C.dmax,
          maxByStock(rem2, C.bom, C.dmax),
          Math.floor(m2 / C.hpp),
          Math.floor(ro2 / C.oven),
          Math.floor(rx2 / C.mixer),
          Math.floor(rs2 / C.sdm)
        )
      );
      const profit = x1 * A.margin + x2 * B.margin + x3 * C.margin;
      if (!best || profit > best.profit) best = { x1, x2, x3, profit };
    }
  }
  if (!best) return zero("Belum ada kombinasi yang memenuhi semua batas.");

  const xs = [best.x1, best.x2, best.x3];
  const used = {
    modal: xs.reduce((s, x, i) => s + x * products[i].hpp, 0),
    oven: xs.reduce((s, x, i) => s + x * products[i].oven, 0),
    mixer: xs.reduce((s, x, i) => s + x * products[i].mixer, 0),
    sdm: xs.reduce((s, x, i) => s + x * products[i].sdm, 0),
  };
  materials.forEach((m) => {
    usage[m.id] = xs.reduce((s, x, i) => s + x * (products[i].bom[m.id] || 0), 0);
    remain[m.id] = (stockMap[m.id] || 0) - usage[m.id];
  });

  const utils = [
    { k: "Modal", v: used.modal / caps.modal },
    { k: "Oven", v: used.oven / caps.oven },
    { k: "Mixer", v: used.mixer / caps.mixer },
    { k: "SDM", v: used.sdm / caps.sdm },
  ];
  materials.forEach((m) => {
    const awal = stockMap[m.id] || 0;
    if (awal > 0) utils.push({ k: m.name, v: usage[m.id] / awal });
  });
  utils.sort((a, b) => b.v - a.v);
  const coverage = predictCoverage(materials, usage, remain);
  const stockConstrained =
    materials.some((m) => remain[m.id] < (m.minStock || 0)) ||
    (utils[0] && materials.some((m) => m.name === utils[0].k));

  return {
    status: "Optimal",
    x1: best.x1,
    x2: best.x2,
    x3: best.x3,
    profit: best.profit,
    revenue: xs.reduce((s, x, i) => s + x * products[i].price, 0),
    used,
    usage,
    remain,
    caps,
    bottleneck: utils[0] ? utils[0].k : "Belum ada",
    bottleneckPct: utils[0] ? Math.round(utils[0].v * 100) : 0,
    stockConstrained,
    coverage,
  };
}

export function stockStatusClass(s) {
  if (s === "Aman") return "done";
  if (s === "Waspada") return "process";
  return "wait";
}

export function loadLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

export function saveLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    /* abaikan */
  }
}
