import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  "https://zebpzfrsmwgiswoaxxel.supabase.co",
  "sb_publishable_Z0AltV4dRng56zuK4aZMfA_KrcsF9Ie"
);
import {
  Activity,
  Users,
  Heart,
  Stethoscope,
  Truck,
  Car,
  Building2,
  UserPlus,
  ArrowRightLeft,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  Printer,
  Eye,
  CalendarDays,
} from "lucide-react";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// ---------- Brand colors ----------
const RED = "#A3201E";
const RED_DEEP = "#711512";
const BEIGE = "#F4ECDD";
const BEIGE_DEEP = "#E9DBC1";

const num = (v) => parseFloat(v) || 0;

const emptyForm = {
  date: "",
  event: "",
  events: "",
  visitors: "",
  paramedics: "",
  nurses: "",
  doctors: "",
  ambulances: "",
  golf: "",
  clinics: "",
  patients: "",
  transferred: "",
};

// ---------- Period grouping helpers ----------
function getISOWeekKey(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return "unknown";
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum =
    1 +
    Math.round(
      ((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
    );
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

function periodKey(dateStr, mode) {
  if (!dateStr) return "unknown";
  if (mode === "daily") return dateStr;
  if (mode === "weekly") return getISOWeekKey(dateStr);
  if (mode === "monthly") return dateStr.slice(0, 7);
  if (mode === "yearly") return dateStr.slice(0, 4);
  return dateStr;
}

export default function KPIDashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [periodMode, setPeriodMode] = useState("monthly");

  // ---------- Fetch from Supabase ----------
  const fetchRows = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("events_kpi")
      .select("*")
      .order("date", { ascending: true });
    if (!error && data) setRows(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRows();
  }, []);

  // ---------- Totals ----------
  const totals = rows.reduce(
    (a, r) => ({
      events: a.events + num(r.events),
      visitors: a.visitors + num(r.visitors),
      paramedics: a.paramedics + num(r.paramedics),
      nurses: a.nurses + num(r.nurses),
      doctors: a.doctors + num(r.doctors),
      ambulances: a.ambulances + num(r.ambulances),
      golf: a.golf + num(r.golf),
      clinics: a.clinics + num(r.clinics),
      patients: a.patients + num(r.patients),
      transferred: a.transferred + num(r.transferred),
    }),
    {
      events: 0,
      visitors: 0,
      paramedics: 0,
      nurses: 0,
      doctors: 0,
      ambulances: 0,
      golf: 0,
      clinics: 0,
      patients: 0,
      transferred: 0,
    }
  );

  const transferRate = totals.patients
    ? ((totals.transferred / totals.patients) * 100).toFixed(1)
    : 0;
  const avgPerEvent = totals.events
    ? Math.round(totals.patients / totals.events)
    : 0;

  const trend = (key) => {
    if (rows.length < 2) return 0;
    const last = num(rows[rows.length - 1][key]);
    const prev = num(rows[rows.length - 2][key]);
    if (prev === 0) return 0;
    return (((last - prev) / prev) * 100).toFixed(0);
  };

  // ---------- Add / Delete (Supabase) ----------
  const addRow = async () => {
    if (!form.date) return;
    const payload = {
      date: form.date,
      event: form.event,
      events: num(form.events),
      visitors: num(form.visitors),
      paramedics: num(form.paramedics),
      nurses: num(form.nurses),
      doctors: num(form.doctors),
      ambulances: num(form.ambulances),
      golf: num(form.golf),
      clinics: num(form.clinics),
      patients: num(form.patients),
      transferred: num(form.transferred),
    };
    const { data, error } = await supabase
      .from("events_kpi")
      .insert(payload)
      .select();
    if (!error && data) {
      setRows([...rows, ...data].sort((a, b) => (a.date > b.date ? 1 : -1)));
      setForm(emptyForm);
    }
  };

  const delRow = async (id) => {
    const { error } = await supabase.from("events_kpi").delete().eq("id", id);
    if (!error) setRows(rows.filter((r) => r.id !== id));
  };

  // ---------- CSV Export ----------
  const exportCSV = () => {
    const headers = [
      "Date",
      "Event",
      "Events",
      "Visitors",
      "Paramedics",
      "Nurses",
      "Doctors",
      "Ambulances",
      "Golf Carts",
      "Clinics",
      "Patients",
      "Transferred",
    ];
    const lines = rows.map((r) =>
      [
        r.date,
        r.event,
        r.events,
        r.visitors,
        r.paramedics,
        r.nurses,
        r.doctors,
        r.ambulances,
        r.golf,
        r.clinics,
        r.patients,
        r.transferred,
      ].join(",")
    );
    const csv = [headers.join(","), ...lines].join("\n");
    // BOM prefix so Excel reads Arabic text correctly instead of garbled characters
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kpi-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---------- Styled Excel export (red & beige brand colors) ----------
  const exportExcel = () => {
    const cols = 12;
    const style = `
      body{font-family:Arial, sans-serif;}
      table{border-collapse:collapse; direction:rtl;}
      th{background:${RED}; color:#ffffff; padding:8px; text-align:center; font-weight:bold; border:1px solid ${RED_DEEP};}
      td{padding:6px 10px; text-align:center; border:1px solid ${BEIGE_DEEP};}
      .title{background:${RED_DEEP}; color:#ffffff; font-size:18px; font-weight:bold; padding:12px; text-align:center;}
      .subtitle{background:${BEIGE}; color:${RED_DEEP}; font-size:12px; padding:6px; text-align:center;}
      .even td{background:${BEIGE};}
      .odd td{background:#ffffff;}
      .totalrow td{background:${BEIGE_DEEP}; font-weight:bold;}
    `;
    let html = `<html><head><meta charset="UTF-8"><style>${style}</style></head><body>`;
    html += `<table>`;
    html += `<tr><td class="title" colspan="${cols}">مجموعة د. سليمان الحبيب — فعاليات جدة (Dr. Sulaiman Al Habib Group — Jeddah Events)</td></tr>`;
    html += `<tr><td class="subtitle" colspan="${cols}">Report Date: ${new Date().toLocaleDateString("en-GB")}</td></tr>`;
    html += `<tr><th>Date</th><th>Event</th><th>Events</th><th>Visitors</th><th>Paramedics</th><th>Nurses</th><th>Doctors</th><th>Ambulances</th><th>Golf Carts</th><th>Clinics</th><th>Patients</th><th>Transferred</th></tr>`;
    rows.forEach((r, i) => {
      html += `<tr class="${i % 2 ? "even" : "odd"}">
        <td>${r.date || ""}</td><td>${r.event || ""}</td><td>${r.events || 0}</td>
        <td>${num(r.visitors).toLocaleString()}</td><td>${r.paramedics || 0}</td><td>${r.nurses || 0}</td>
        <td>${r.doctors || 0}</td><td>${r.ambulances || 0}</td><td>${r.golf || 0}</td>
        <td>${r.clinics || 0}</td><td>${r.patients || 0}</td><td>${r.transferred || 0}</td>
      </tr>`;
    });
    html += `<tr class="totalrow">
      <td colspan="2">Total</td><td>${totals.events}</td><td>${totals.visitors.toLocaleString()}</td>
      <td>${totals.paramedics}</td><td>${totals.nurses}</td><td>${totals.doctors}</td>
      <td>${totals.ambulances}</td><td>${totals.golf}</td><td>${totals.clinics}</td>
      <td>${totals.patients}</td><td>${totals.transferred}</td>
    </tr>`;
    html += `</table></body></html>`;

    const blob = new Blob(["\uFEFF" + html], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jeddah-events-report.xls";
    a.click();
    URL.revokeObjectURL(url);
  };

  const printPDF = () => window.print();

  // ---------- KPI cards ----------
  const kpis = [
    { label: "Events", value: totals.events, icon: Activity, color: "bg-emerald-500", tKey: "events" },
    { label: "Visitors", value: totals.visitors.toLocaleString(), icon: Eye, color: `bg-[${RED}]`, tKey: "visitors" },
    { label: "Paramedics", value: totals.paramedics, icon: Users, color: "bg-teal-500", tKey: "paramedics" },
    { label: "Nurses", value: totals.nurses, icon: Heart, color: "bg-rose-500", tKey: "nurses" },
    { label: "Doctors", value: totals.doctors, icon: Stethoscope, color: "bg-blue-500", tKey: "doctors" },
    { label: "Ambulances", value: totals.ambulances, icon: Truck, color: "bg-orange-500", tKey: "ambulances" },
    { label: "Golf Carts", value: totals.golf, icon: Car, color: "bg-amber-500", tKey: "golf" },
    { label: "Clinics", value: totals.clinics, icon: Building2, color: "bg-indigo-500", tKey: "clinics" },
    { label: "Patients", value: totals.patients, icon: UserPlus, color: "bg-cyan-600", tKey: "patients" },
    { label: "Transferred to Hospital", value: totals.transferred, icon: ArrowRightLeft, color: `bg-[${RED}]`, tKey: "transferred" },
  ];

  const chartData = rows.map((r) => ({
    name: r.date,
    Visitors: num(r.visitors),
    Patients: num(r.patients),
    Transferred: num(r.transferred),
  }));
  const staffData = [
    { name: "Paramedics", value: totals.paramedics },
    { name: "Nurses", value: totals.nurses },
    { name: "Doctors", value: totals.doctors },
  ];
  const COLORS = ["#14b8a6", RED, "#3b82f6"];

  const inputs = [
    { k: "date", p: "Date", t: "date" },
    { k: "event", p: "Event Name", t: "text" },
    { k: "events", p: "Events", t: "number" },
    { k: "visitors", p: "Visitors", t: "number" },
    { k: "paramedics", p: "Paramedics", t: "number" },
    { k: "nurses", p: "Nurses", t: "number" },
    { k: "doctors", p: "Doctors", t: "number" },
    { k: "ambulances", p: "Ambulances", t: "number" },
    { k: "golf", p: "Golf Carts", t: "number" },
    { k: "clinics", p: "Clinics", t: "number" },
    { k: "patients", p: "Patients", t: "number" },
    { k: "transferred", p: "Transferred", t: "number" },
  ];

  const TrendBadge = ({ val }) => {
    const v = num(val);
    if (v === 0)
      return (
        <span className="flex items-center text-xs text-slate-400">
          <Minus className="w-3 h-3" />
        </span>
      );
    const up = v > 0;
    return (
      <span className={`flex items-center text-xs font-semibold ${up ? "text-emerald-600" : "text-red-500"}`}>
        {up ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
        {Math.abs(v)}%
      </span>
    );
  };

  // ---------- Statistics Report (Daily / Weekly / Monthly / Yearly) ----------
  const periodLabels = {
    daily: { en: "Daily", ar: "يومي" },
    weekly: { en: "Weekly", ar: "أسبوعي" },
    monthly: { en: "Monthly", ar: "شهري" },
    yearly: { en: "Yearly", ar: "سنوي" },
  };

  const groups = {};
  rows.forEach((r) => {
    const key = periodKey(r.date, periodMode);
    if (!groups[key]) {
      groups[key] = { key, records: 0, visitors: 0, patients: 0, transferred: 0 };
    }
    groups[key].records += 1;
    groups[key].visitors += num(r.visitors);
    groups[key].patients += num(r.patients);
    groups[key].transferred += num(r.transferred);
  });
  const groupList = Object.values(groups).sort((a, b) => (a.key > b.key ? 1 : -1));

  const today = new Date().toLocaleDateString("en-GB");

  return (
    <div id="report" className="min-h-screen bg-slate-50 p-4 font-sans">
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          #report { background: white !important; padding: 0 !important; }
          .print-shadow { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
          .avoid-break { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>

      {/* Header */}
      <div
        className="rounded-2xl p-6 mb-6 shadow-lg flex flex-wrap items-center gap-4 print-shadow"
        style={{ background: `linear-gradient(to right, ${RED_DEEP}, ${RED})` }}
      >
        <div className="bg-white rounded-xl p-3 flex items-center justify-center">
          <Heart className="w-10 h-10" style={{ color: RED }} fill="currentColor" />
        </div>
        <div className="text-white">
          <h1 className="text-2xl font-bold">Dr. Sulaiman Al Habib Medical Group</h1>
          <p className="text-sm mt-1" style={{ color: BEIGE }}>KPI Dashboard — Jeddah Season Events</p>
          <p className="text-xs mt-1" style={{ color: BEIGE }}>Report Date: {today}</p>
        </div>
        <div className="ml-auto flex flex-wrap gap-3">
          <div className="text-white text-center bg-white/15 rounded-xl px-5 py-3">
            <div className="text-3xl font-bold">{transferRate}%</div>
            <div className="text-xs" style={{ color: BEIGE }}>Hospital Transfer Rate</div>
          </div>
          <div className="text-white text-center bg-white/15 rounded-xl px-5 py-3">
            <div className="text-3xl font-bold">{totals.visitors.toLocaleString()}</div>
            <div className="text-xs" style={{ color: BEIGE }}>Total Visitors</div>
          </div>
          <div className="flex flex-col gap-2 no-print">
            <button
              onClick={printPDF}
              className="rounded-xl px-4 py-2 flex items-center gap-2 font-medium bg-white hover:bg-slate-50"
              style={{ color: RED }}
            >
              <Printer className="w-4 h-4" /> Print PDF
            </button>
            <button
              onClick={exportExcel}
              className="rounded-xl px-4 py-2 flex items-center gap-2 font-medium text-white"
              style={{ backgroundColor: RED_DEEP }}
            >
              <Download className="w-4 h-4" /> Export Excel
            </button>
            <button
              onClick={exportCSV}
              className="rounded-xl px-4 py-2 flex items-center gap-2 font-medium border"
              style={{ backgroundColor: "white", color: RED_DEEP, borderColor: RED_DEEP }}
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center text-slate-400 mb-4">Loading data...</div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6 avoid-break">
        {kpis.map((k, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition print-shadow">
            <div className="flex items-start justify-between">
              <div className={`${k.color.startsWith("bg-[") ? "" : k.color} w-10 h-10 rounded-lg flex items-center justify-center mb-2`}
                   style={k.color.startsWith("bg-[") ? { backgroundColor: RED } : {}}>
                <k.icon className="text-white w-5 h-5" />
              </div>
              <TrendBadge val={trend(k.tKey)} />
            </div>
            <div className="text-2xl font-bold text-slate-800">{k.value}</div>
            <div className="text-xs text-slate-500">{k.label}</div>
          </div>
        ))}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition print-shadow">
          <div className="bg-purple-500 w-10 h-10 rounded-lg flex items-center justify-center mb-2">
            <Users className="text-white w-5 h-5" />
          </div>
          <div className="text-2xl font-bold text-slate-800">{avgPerEvent}</div>
          <div className="text-xs text-slate-500">Avg Patients/Event</div>
        </div>
      </div>

      {/* Statistics Report */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6 avoid-break print-shadow">
        <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
          <CalendarDays className="w-4 h-4" style={{ color: RED }} /> Statistics Report
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 no-print">
          {Object.keys(periodLabels).map((mode) => (
            <button
              key={mode}
              onClick={() => setPeriodMode(mode)}
              className="rounded-xl px-4 py-3 font-medium text-sm transition"
              style={
                periodMode === mode
                  ? { backgroundColor: RED, color: "white" }
                  : { backgroundColor: BEIGE, color: RED_DEEP }
              }
            >
              {periodLabels[mode].en} · {periodLabels[mode].ar}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="rounded-xl p-4" style={{ backgroundColor: BEIGE, borderLeft: `4px solid ${RED}` }}>
            <div className="text-xs text-slate-500 mb-1">Periods ({periodLabels[periodMode].en} Report)</div>
            <div className="text-2xl font-bold" style={{ color: RED_DEEP }}>{groupList.length}</div>
          </div>
          <div className="rounded-xl p-4" style={{ backgroundColor: BEIGE, borderLeft: "4px solid #7c3aed" }}>
            <div className="text-xs text-slate-500 mb-1">Total Visitors</div>
            <div className="text-2xl font-bold text-purple-700">{totals.visitors.toLocaleString()}</div>
          </div>
          <div className="rounded-xl p-4" style={{ backgroundColor: BEIGE, borderLeft: "4px solid #0891b2" }}>
            <div className="text-xs text-slate-500 mb-1">Total Patients</div>
            <div className="text-2xl font-bold text-cyan-700">{totals.patients.toLocaleString()}</div>
          </div>
          <div className="rounded-xl p-4" style={{ backgroundColor: BEIGE, borderLeft: "4px solid #10b981" }}>
            <div className="text-xs text-slate-500 mb-1">Avg Patients/Event</div>
            <div className="text-2xl font-bold text-emerald-700">{avgPerEvent}</div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: BEIGE_DEEP }}>
          <table className="w-full text-sm text-left">
            <thead style={{ backgroundColor: RED }}>
              <tr className="text-white">
                <th className="px-3 py-3 font-medium">{periodLabels[periodMode].en} Report</th>
                <th className="px-3 py-3 font-medium text-center">Records</th>
                <th className="px-3 py-3 font-medium text-center">Visitors</th>
                <th className="px-3 py-3 font-medium text-center">Patients</th>
                <th className="px-3 py-3 font-medium text-center">Transferred</th>
              </tr>
            </thead>
            <tbody>
              {groupList.map((g, i) => (
                <tr key={g.key} style={{ backgroundColor: i % 2 ? BEIGE : "white" }}>
                  <td className="px-3 py-2 font-medium" style={{ color: RED_DEEP }}>{g.key}</td>
                  <td className="px-3 py-2 text-center">{g.records}</td>
                  <td className="px-3 py-2 text-center text-purple-700 font-semibold">{g.visitors.toLocaleString()}</td>
                  <td className="px-3 py-2 text-center">{g.patients.toLocaleString()}</td>
                  <td className="px-3 py-2 text-center text-red-600 font-medium">{g.transferred}</td>
                </tr>
              ))}
              {groupList.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-slate-400">No data yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 avoid-break">
        <div className="bg-white rounded-xl p-4 shadow-sm print-shadow">
          <h3 className="font-bold text-slate-700 mb-3">Visitors, Patients & Transfers</h3>
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="Patients" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="left" dataKey="Transferred" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="Visitors" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm print-shadow">
          <h3 className="font-bold text-slate-700 mb-3">Medical Staff Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={staffData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {staffData.map((e, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Add Form */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6 no-print">
        <h3 className="font-bold text-slate-700 mb-3">Add New Record</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {inputs.map((inp) => (
            <input
              key={inp.k}
              type={inp.t}
              step="0.1"
              placeholder={inp.p}
              value={form[inp.k]}
              onChange={(e) => setForm({ ...form, [inp.k]: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:outline-none"
              style={{ borderColor: BEIGE_DEEP }}
            />
          ))}
          <button
            onClick={addRow}
            className="rounded-lg px-4 py-2 flex items-center justify-center gap-1 text-sm font-medium text-white"
            style={{ backgroundColor: RED }}
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto avoid-break print-shadow">
        <table className="w-full text-sm text-left">
          <thead style={{ backgroundColor: RED }}>
            <tr className="text-white">
              {["Date", "Event", "Events", "Visitors", "Paramedics", "Nurses", "Doctors", "Ambulances", "Golf Carts", "Clinics", "Patients", "Transferred", ""].map((h, i) => (
                <th key={i} className="px-3 py-3 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} style={{ backgroundColor: i % 2 ? BEIGE : "white" }}>
                <td className="px-3 py-2 whitespace-nowrap">{r.date}</td>
                <td className="px-3 py-2 whitespace-nowrap">{r.event}</td>
                <td className="px-3 py-2 text-center">{r.events}</td>
                <td className="px-3 py-2 text-center text-purple-700 font-semibold">{num(r.visitors).toLocaleString()}</td>
                <td className="px-3 py-2 text-center">{r.paramedics}</td>
                <td className="px-3 py-2 text-center">{r.nurses}</td>
                <td className="px-3 py-2 text-center">{r.doctors}</td>
                <td className="px-3 py-2 text-center">{r.ambulances}</td>
                <td className="px-3 py-2 text-center">{r.golf}</td>
                <td className="px-3 py-2 text-center">{r.clinics}</td>
                <td className="px-3 py-2 text-center">{r.patients}</td>
                <td className="px-3 py-2 text-center text-red-600 font-medium">{r.transferred}</td>
                <td className="px-3 py-2 text-center no-print">
                  <button onClick={() => delRow(r.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot style={{ backgroundColor: BEIGE_DEEP }} className="font-bold">
            <tr>
              <td className="px-3 py-3" colSpan={2}>Total</td>
              <td className="px-3 py-3 text-center">{totals.events}</td>
              <td className="px-3 py-3 text-center text-purple-700">{totals.visitors.toLocaleString()}</td>
              <td className="px-3 py-3 text-center">{totals.paramedics}</td>
              <td className="px-3 py-3 text-center">{totals.nurses}</td>
              <td className="px-3 py-3 text-center">{totals.doctors}</td>
              <td className="px-3 py-3 text-center">{totals.ambulances}</td>
              <td className="px-3 py-3 text-center">{totals.golf}</td>
              <td className="px-3 py-3 text-center">{totals.clinics}</td>
              <td className="px-3 py-3 text-center">{totals.patients}</td>
              <td className="px-3 py-3 text-center text-red-600">{totals.transferred}</td>
              <td className="no-print"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
