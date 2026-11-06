import React from "react";
import Icon from "./Icon.jsx";
import NotificationPanel from "./NotificationPanel.jsx";
import QuickAdd from "./QuickAdd.jsx";

export default function Topbar({
  page,
  notify,
  notificationsOpen,
  setNotificationsOpen,
  setHelpOpen,
  setPage,
  notifCount,
  notificationProps,
  materials,
  onAddLog,
  onAddOrder,
  role,
  user,
  onLogout,
  canIn,
}) {
  return (
    <header className="topbar">
      <button className="icon-btn"><Icon name="arrowR" size={15} style={{ transform: "scaleX(-1)" }} /></button>
      <button className="icon-btn"><Icon name="arrowR" size={15} /></button>
      <div className="crumbs"><span>TEFA Bakery</span><span className="sep">&rsaquo;</span><b>{page}</b></div>
      <div className="top-right">
        <button className="icon-btn" aria-label="Buka bantuan" onClick={() => setHelpOpen(true)}><Icon name="help" size={16} /></button>
        <button className="icon-btn" aria-label="Buka pesan" onClick={() => notify("Tidak ada pesan baru.")}><Icon name="mail" size={16} /></button>
        <div className="notification-wrap">
          <button className="icon-btn" aria-label="Buka notifikasi" onClick={() => setNotificationsOpen((v) => !v)}>
            <Icon name="bell" size={16} />
            <span className="notification-dot">{notifCount}</span>
          </button>
          {notificationsOpen && (
            <NotificationPanel
              onClose={() => setNotificationsOpen(false)}
              onAction={(target) => {
                setNotificationsOpen(false);
                setPage(target);
              }}
              {...notificationProps}
            />
          )}
        </div>
        <div className="user">
          <div className="avatar">{role.initials}</div>
          <div>
            <div className="user-name">{user.name}</div>
            <div className="role-select">{role.label}</div>
          </div>
          <button className="icon-btn" aria-label="Keluar" title="Keluar" onClick={onLogout}><Icon name="logout" size={15} /></button>
        </div>
        <QuickAdd materials={materials || []} onAddLog={onAddLog} onAddOrder={onAddOrder} preset="semua" canIn={canIn} />
        <button
          className="btn-export"
          onClick={() => {
            notify("Dialog cetak laporan dibuka.");
            window.print();
          }}
        >
          <Icon name="download" size={15} /> Export Laporan
        </button>
      </div>
    </header>
  );
}
