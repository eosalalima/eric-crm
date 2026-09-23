"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

type IconProps = { children: ReactNode; size?: number; className?: string };
type Stage = { id: number; name: string; probability: number; color: string };

function Icon({ children, size = 20, className }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>;
}

const icons = {
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  contacts: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
  company: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 21V9h6v12M7 6h.01M12 6h.01M17 6h.01"/></>,
  deals: <><path d="M20 7h-4V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"/><path d="M8 7h8M2 12h20"/></>,
  funnel: <><path d="M3 5h18l-7 8v5l-4 2v-7Z"/></>,
  task: <><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>,
  chart: <><path d="M3 3v18h18"/><path d="m7 16 4-5 4 3 5-7"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l-2.8 2.8A1.7 1.7 0 0 0 15 19.4 1.7 1.7 0 0 0 14 21h-4a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-2.8-2.8A1.7 1.7 0 0 0 4.6 15 1.7 1.7 0 0 0 3 14v-4a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l2.8-2.8A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3h4a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l2.8 2.8A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.6 1v4a1.7 1.7 0 0 0-1.6 1Z"/></>,
};

const nav = [["Dashboard", icons.dashboard], ["Contacts", icons.contacts], ["Companies", icons.company], ["Deals", icons.deals], ["Funnels", icons.funnel], ["Tasks", icons.task], ["Reports", icons.chart]] as const;
const initialStages: Stage[] = [
  { id: 1, name: "New lead", probability: 10, color: "#82a8d8" },
  { id: 2, name: "Qualified", probability: 30, color: "#7c91d2" },
  { id: 3, name: "Demo booked", probability: 50, color: "#9b7bc0" },
  { id: 4, name: "Proposal sent", probability: 70, color: "#d08b6d" },
  { id: 5, name: "Negotiation", probability: 85, color: "#d29a54" },
  { id: 6, name: "Closed won", probability: 100, color: "#3c8c70" },
];

export default function Home() {
  const [stages, setStages] = useState(initialStages);
  const [selected, setSelected] = useState(3);
  const [saved, setSaved] = useState(false);
  const active = stages.find((stage) => stage.id === selected) ?? stages[0];

  function updateActive(patch: Partial<Stage>) {
    setStages((current) => current.map((stage) => stage.id === selected ? { ...stage, ...patch } : stage));
    setSaved(false);
  }

  function addStage() {
    const id = Math.max(...stages.map((stage) => stage.id), 0) + 1;
    const next = { id, name: "New stage", probability: 50, color: "#6f9a8a" };
    setStages([...stages.slice(0, -1), next, stages.at(-1)!]);
    setSelected(id);
    setSaved(false);
  }

  function removeStage() {
    if (stages.length <= 2) return;
    const index = stages.findIndex((stage) => stage.id === selected);
    const remaining = stages.filter((stage) => stage.id !== selected);
    setStages(remaining);
    setSelected(remaining[Math.max(0, index - 1)].id);
    setSaved(false);
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">E</span><span>Eric<span className="brand-accent">CRM</span></span></div>
      <nav className="nav" aria-label="Main navigation"><p className="nav-label">Workspace</p>
        {nav.map(([label, icon]) => <a href={`#${label.toLowerCase()}`} className={`nav-item ${label === "Funnels" ? "active" : ""}`} key={label}><Icon>{icon}</Icon><span>{label}</span>{label === "Tasks" && <span className="nav-count">6</span>}</a>)}
        <p className="nav-label lower">Manage</p><a href="#settings" className="nav-item"><Icon>{icons.settings}</Icon><span>Settings</span></a>
      </nav>
      <div className="workspace-switcher"><span className="avatar">ED</span><span><strong>Eric Davis</strong><small>Acme workspace</small></span><button aria-label="Open profile menu">•••</button></div>
    </aside>

    <main className="main-content" id="funnels">
      <header className="topbar"><div className="mobile-brand"><span className="brand-mark">E</span><b>EricCRM</b></div><div className="breadcrumbs"><span>Funnels</span><b>/</b><strong>Enterprise sales</strong></div><div className="top-actions"><button className="preview-btn"><Icon size={16}><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></Icon>Preview</button><button className="save-btn" onClick={() => setSaved(true)}>{saved ? "Saved ✓" : "Save changes"}</button></div></header>
      <div className="designer-wrap">
        <section className="designer-heading"><div><span className="status-pill"><i/> Live funnel</span><h1>Enterprise sales</h1><p>Design the journey your deals follow from first touch to close.</p></div><button className="more-button" aria-label="More funnel options">•••</button></section>

        <section className="summary-strip" aria-label="Funnel summary"><div><span>STAGES</span><strong>{stages.length}</strong></div><div><span>ACTIVE DEALS</span><strong>148</strong></div><div><span>PIPELINE VALUE</span><strong>$486,200</strong></div><div><span>WIN RATE</span><strong className="positive">24.8% <small>↗ 2.1%</small></strong></div></section>

        <div className="designer-grid">
          <section className="canvas-card">
            <div className="card-head"><div><h2>Funnel stages</h2><p>Select a stage to edit its details and rules.</p></div><div className="card-tools"><span>Auto-save off</span><button aria-label="Undo">↶</button><button aria-label="Redo">↷</button></div></div>
            <div className="stage-list">
              {stages.map((stage, index) => <button key={stage.id} className={`stage-row ${selected === stage.id ? "selected" : ""}`} onClick={() => setSelected(stage.id)}>
                <span className="drag-handle">⠿</span><span className="stage-number" style={{ background: stage.color }}>{index + 1}</span><span className="stage-copy"><strong>{stage.name}</strong><small>{stage.probability}% probability</small></span><span className="stage-deals"><strong>{[42, 31, 24, 19, 16, 16][index] ?? 0}</strong><small>deals</small></span><span className="stage-value"><strong>{["$84,200", "$96,400", "$72,800", "$108,500", "$76,300", "$48,000"][index] ?? "$0"}</strong><small>value</small></span><span className="row-chevron">›</span>
              </button>)}
            </div>
            <button className="add-stage" onClick={addStage}><span>+</span> Add stage</button>
          </section>

          <aside className="editor-card">
            <div className="editor-head"><div><span className="stage-swatch" style={{ background: active.color }}/><div><small>STAGE {stages.findIndex((s) => s.id === selected) + 1}</small><h2>{active.name}</h2></div></div><button aria-label="Close editor">×</button></div>
            <div className="form-section"><label>Stage name<input value={active.name} onChange={(event) => updateActive({ name: event.target.value })}/></label><label>Stage color<div className="color-control"><input type="color" value={active.color} onChange={(event) => updateActive({ color: event.target.value })}/><code>{active.color.toUpperCase()}</code><span>⌄</span></div></label></div>
            <div className="form-section"><div className="section-title"><span>Win probability</span><b>{active.probability}%</b></div><input className="range" type="range" min="0" max="100" value={active.probability} style={{ "--range": `${active.probability}%` } as CSSProperties} onChange={(event) => updateActive({ probability: Number(event.target.value) })}/><div className="range-labels"><span>0%</span><span>50%</span><span>100%</span></div><p className="help-copy">Used to calculate weighted pipeline value.</p></div>
            <div className="form-section"><div className="section-title"><span>Stage automation</span><button className="text-button">+ Add rule</button></div><div className="automation"><span className="automation-icon">↯</span><div><strong>When a deal enters this stage</strong><small>Send proposal follow-up after 3 days</small></div><button aria-label="Automation options">•••</button></div></div>
            <div className="editor-footer"><button className="delete-button" onClick={removeStage}><Icon size={16}><path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v5M14 11v5"/></Icon>Delete stage</button></div>
          </aside>
        </div>
      </div>
    </main>
  </div>;
}
