import type { ReactNode } from "react";

type IconProps = { children: ReactNode; size?: number; className?: string };

function Icon({ children, size = 20, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

const icons = {
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  contacts: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
  company: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 21V9h6v12M7 6h.01M12 6h.01M17 6h.01"/></>,
  deals: <><path d="M20 7h-4V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"/><path d="M8 7h8M2 12h20M10 12v2h4v-2"/></>,
  task: <><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>,
  chart: <><path d="M3 3v18h18"/><path d="m7 16 4-5 4 3 5-7"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.55V21h-4v-.08a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3v-4h.08a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3h4v.08a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.55 1H21v4h-.08a1.7 1.7 0 0 0-1.52 1Z"/></>,
};

const navigation = [
  ["Dashboard", icons.dashboard], ["Contacts", icons.contacts], ["Companies", icons.company],
  ["Deals", icons.deals], ["Tasks", icons.task], ["Reports", icons.chart],
] as const;

const metrics = [
  { label: "Total revenue", value: "$124,500", change: "+12.5%", note: "vs. last month", tone: "green" },
  { label: "Active deals", value: "48", change: "+8.2%", note: "vs. last month", tone: "blue" },
  { label: "New contacts", value: "126", change: "+5.4%", note: "vs. last month", tone: "violet" },
  { label: "Conversion rate", value: "24.8%", change: "+2.1%", note: "vs. last month", tone: "amber" },
];

const activities = [
  { initials: "AS", color: "blue", name: "Alex Smith", action: "moved", subject: "Acme Corp", detail: "to Negotiation", time: "12 min ago" },
  { initials: "JD", color: "violet", name: "Jamie Davis", action: "added a new contact", subject: "Maria Chen", detail: "at Lumon Inc.", time: "34 min ago" },
  { initials: "RK", color: "orange", name: "Robert King", action: "completed task", subject: "Follow up with Northstar", detail: "", time: "1 hr ago" },
  { initials: "AS", color: "blue", name: "Alex Smith", action: "won deal", subject: "Globex renewal", detail: "$18,500", time: "2 hrs ago" },
];

export default function Home() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">E</span><span>Eric<span className="brand-accent">CRM</span></span></div>
        <nav className="nav" aria-label="Main navigation">
          <p className="nav-label">Workspace</p>
          {navigation.map(([label, icon], index) => (
            <a href={index === 0 ? "#overview" : `#${label.toLowerCase()}`} className={`nav-item ${index === 0 ? "active" : ""}`} key={label}>
              <Icon>{icon}</Icon><span>{label}</span>{label === "Tasks" && <span className="nav-count">6</span>}
            </a>
          ))}
          <p className="nav-label lower">Manage</p>
          <a href="#settings" className="nav-item"><Icon>{icons.settings}</Icon><span>Settings</span></a>
        </nav>
        <div className="upgrade-card">
          <div className="sparkle">✦</div><strong>Unlock more insights</strong>
          <p>Upgrade your plan to access advanced reports.</p><button type="button">View plans</button>
        </div>
        <div className="profile"><span className="avatar avatar-photo">ED</span><span><strong>Eric Davis</strong><small>Admin</small></span><button aria-label="Open profile menu">•••</button></div>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark">E</span><b>EricCRM</b></div>
          <label className="search"><Icon size={18}><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></Icon><input placeholder="Search contacts, companies, deals..." aria-label="Search"/><kbd>⌘ K</kbd></label>
          <div className="top-actions"><button className="icon-btn" aria-label="Notifications"><Icon><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></Icon><i /></button><button className="help-btn"><Icon size={18}><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.7 2.7 0 1 1 3.3 2.6c-.8.3-.8 1.4-.8 1.4M12 17h.01"/></Icon>Help center</button></div>
        </header>

        <div className="content">
          <section className="welcome"><div><p className="eyebrow">Tuesday, September 23</p><h1>Good morning, Eric <span>👋</span></h1><p>Here&apos;s what&apos;s happening with your business today.</p></div><button className="primary-btn"><Icon size={18}><path d="M12 5v14M5 12h14"/></Icon>Add new deal</button></section>

          <section className="metrics" aria-label="Performance overview">
            {metrics.map((metric) => <article className="metric-card" key={metric.label}><div className={`metric-icon ${metric.tone}`}><Icon>{metric.label === "Total revenue" ? <><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></> : metric.label === "Active deals" ? icons.deals : metric.label === "New contacts" ? icons.contacts : icons.chart}</Icon></div><p>{metric.label}</p><h2>{metric.value}</h2><div><span className="trend">↗ {metric.change}</span><small>{metric.note}</small></div></article>)}
          </section>

          <div className="dashboard-grid">
            <section className="panel pipeline-panel"><div className="panel-head"><div><h3>Sales pipeline</h3><p>Deal value by stage</p></div><button className="select-btn">This month <span>⌄</span></button></div>
              <div className="pipeline-total"><strong>$486,200</strong><span><b>↗ 10.4%</b> vs. last month</span></div>
              <div className="chart-area"><div className="axis"><span>$150k</span><span>$100k</span><span>$50k</span><span>$0</span></div><div className="bars">
                {[{n:"Lead",v:"$92k",h:62,c:"light"},{n:"Qualified",v:"$128k",h:84,c:"mid"},{n:"Proposal",v:"$76k",h:51,c:"light"},{n:"Negotiation",v:"$142k",h:94,c:"dark"},{n:"Closed",v:"$48k",h:32,c:"light"}].map(bar=><div className="bar-wrap" key={bar.n}><div className="bar-value">{bar.v}</div><div className={`bar ${bar.c}`} style={{height:`${bar.h}%`}}/><span>{bar.n}</span></div>)}
              </div></div>
            </section>

            <section className="panel activity-panel"><div className="panel-head"><div><h3>Recent activity</h3><p>Latest updates from your team</p></div><a href="#activity">View all</a></div><div className="activity-list">
              {activities.map((item, index)=><div className="activity" key={item.time}><div className={`avatar ${item.color}`}>{item.initials}</div><div className="activity-copy"><p><strong>{item.name}</strong> {item.action} <b>{item.subject}</b>{item.detail && <> <span>{item.detail}</span></>}</p><small>{item.time}</small></div><span className={`activity-dot ${index === 3 ? "success" : ""}`}/></div>)}
            </div></section>
          </div>

          <section className="panel tasks-panel"><div className="panel-head"><div><h3>Today&apos;s tasks</h3><p>Stay on top of your priorities</p></div><a href="#tasks">View all tasks <span>→</span></a></div><div className="task-row"><button className="checkbox" aria-label="Mark task complete"/><div><strong>Prepare proposal for Acme Corp</strong><p><span className="tag high">High priority</span><span>Due at 11:00 AM</span></p></div><span className="assignee">AS</span><button className="more" aria-label="Task options">•••</button></div><div className="task-row"><button className="checkbox" aria-label="Mark task complete"/><div><strong>Follow up with Sarah at Northstar</strong><p><span className="tag medium">Medium</span><span>Due at 2:30 PM</span></p></div><span className="assignee purple">JD</span><button className="more" aria-label="Task options">•••</button></div></section>
        </div>
      </main>
    </div>
  );
}
