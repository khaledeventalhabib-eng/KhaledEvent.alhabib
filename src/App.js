import React, { useState, useMemo } from "react";
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
  FileSpreadsheet,
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

export default function KPIDashboard() {
  const [rows, setRows] = useState([
    {
      id: 1,
      date: "2026-07-01",
      event: "Season Opening",
      events: 1,
      paramedics: 12,
      nurses: 18,
      doctors: 6,
      ambulances: 4,
      golf: 3,
      clinics: 5,
      patients: 240,
      transferred: 8,
      visitors: 12000,
    },
    {
      id: 2,
      date: "2026-08-01",
      event: "Fun Festival",
      events: 2,
      paramedics: 15,
      nurses: 22,
      doctors: 8,
      ambulances: 5,
      golf: 4,
      clinics: 6,
      patients: 310,
      transferred: 11,
      visitors: 18500,
    },
    {
      id: 3,
      date: "2026-09-01",
      event: "Season Closing",
      events: 3,
      paramedics: 20,
      nurses: 28,
      doctors: 10,
      ambulances: 6,
      golf: 5,
      clinics: 8,
      patients: 420,
      transferred: 15,
      visitors: 25000,
    },
    {
      id: 4,
      date: "2027-07-01",
      event: "Season 2027 Opening",
      events: 1,
      paramedics: 14,
      nurses: 20,
      doctors: 7,
      ambulances: 4,
      golf: 3,
      clinics: 5,
      patients: 260,
      transferred: 9,
      visitors: 13500,
    },
  ]);

  const [form, setForm] = useState({
    date: "",
    event: "",
    events: "",
    paramedics: "",
    nurses: "",
    doctors: "",
    ambulances: "",
    golf: "",
    clinics: "",
    patients: "",
    transferred: "",
    visitors: "",
  });

  const [period, setPeriod] = useState("monthly");
  const PERIODS = [
    { key: "daily", label: "Daily", ar: "يومي" },
    { key: "weekly", label: "Weekly", ar: "أسبوعي" },
    { key: "monthly", label: "Monthly", ar: "شهري" },
    { key: "yearly", label: "Yearly", ar: "سنوي" },
  ];

  const num = (v) => parseFloat(v) || 0;

  const getWeekKey = (d) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
    return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
  };

  const getPeriodKey = (dateStr, p) => {
    const parts = (dateStr || "").split("-");
    const year = parts[0] || "----";
    const month = parts[1] || "01";
    const day = parts[2] || "01";
    if (p === "yearly") return year;
    if (p === "monthly") return `${year}-${month}`;
    if (p === "daily") return `${year}-${month}-${day}`;
    if (p === "weekly") {
      const d = new Date(`${year}-${month}-${day}`);
      if (isNaN(d)) return `${year}-${month}`;
      return getWeekKey(d);
    }
    return dateStr;
  };

  const aggregated = useMemo(() => {
    const map = {};
    rows.forEach((r) => {
      const key = getPeriodKey(r.date, period);
      if (!map[key]) {
        map[key] = {
          period: key,
          events: 0,
          paramedics: 0,
          nurses: 0,
          doctors: 0,
          ambulances: 0,
          golf: 0,
          clinics: 0,
          patients: 0,
          transferred: 0,
          visitors: 0,
          count: 0,
        };
      }
      const g = map[key];
      g.events += num(r.events);
      g.paramedics += num(r.paramedics);
      g.nurses += num(r.nurses);
      g.doctors += num(r.doctors);
      g.ambulances += num(r.ambulances);
      g.golf += num(r.golf);
      g.clinics += num(r.clinics);
      g.patients += num(r.patients);
      g.transferred += num(r.transferred);
      g.visitors += num(r.visitors);
      g.count += 1;
    });
    return Object.values(map).sort((a, b) => a.period.localeCompare(b.period));
  }, [rows, period]);

  const totals = rows.reduce(
    (a, r) => ({
      events: a.events + num(r.events),
      paramedics: a.paramedics + num(r.paramedics),
      nurses: a.nurses + num(r.nurses),
      doctors: a.doctors + num(r.doctors),
      ambulances: a.ambulances + num(r.ambulances),
      golf: a.golf + num(r.golf),
      clinics: a.clinics + num(r.clinics),
      patients: a.patients + num(r.patients),
      transferred: a.transferred + num(r.transferred),
      visitors: a.visitors + num(r.visitors),
    }),
    {
      events: 0,
      paramedics: 0,
      nurses: 0,
      doctors: 0,
      ambulances: 0,
      golf: 0,
      clinics: 0,
      patients: 0,
      transferred: 0,
      visitors: 0,
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

  const addRow = () => {
    if (!form.date) return;
    setRows([...rows, { ...form, id: Date.now() }]);
    setForm({
      date: "",
      event: "",
      events: "",
      paramedics: "",
      nurses: "",
      doctors: "",
      ambulances: "",
      golf: "",
      clinics: "",
      patients: "",
      transferred: "",
      visitors: "",
    });
  };
  const delRow = (id) => setRows(rows.filter((r) => r.id !== id));

  const exportCSV = () => {
    const headers = [
      "Date",
      "Event",
      "Events",
      "Paramedics",
      "Nurses",
      "Doctors",
      "Ambulances",
      "Golf Carts",
      "Clinics",
      "Patients",
      "Transferred",
      "Visitors",
    ];
    const lines = rows.map((r) =>
      [
        r.date,
        r.event,
        r.events,
        r.paramedics,
        r.nurses,
        r.doctors,
        r.ambulances,
        r.golf,
        r.clinics,
        r.patients,
        r.transferred,
        r.visitors,
      ].join(",")
    );
    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kpi-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ===== تصدير Excel (.xls) بدون أي مكتبة =====
  const exportExcel = () => {
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
    let html =
      '<table border="1"><thead><tr style="background:#dc2626;color:#fff">';
    headers.forEach((h) => (html += `<th>${h}</th>`));
    html += "</tr></thead><tbody>";
    rows.forEach((r) => {
      html += `<tr>
        <td>${r.date}</td><td>${r.event}</td><td>${num(r.events)}</td>
        <td>${num(r.visitors)}</td><td>${num(r.paramedics)}</td><td>${num(
        r.nurses
      )}</td>
        <td>${num(r.doctors)}</td><td>${num(r.ambulances)}</td><td>${num(
        r.golf
      )}</td>
        <td>${num(r.clinics)}</td><td>${num(r.patients)}</td><td>${num(
        r.transferred
      )}</td>
      </tr>`;
    });
    html += `<tr style="background:#f1f5f9;font-weight:bold">
        <td>TOTAL</td><td></td><td>${totals.events}</td><td>${totals.visitors}</td>
        <td>${totals.paramedics}</td><td>${totals.nurses}</td><td>${totals.doctors}</td>
        <td>${totals.ambulances}</td><td>${totals.golf}</td><td>${totals.clinics}</td>
        <td>${totals.patients}</td><td>${totals.transferred}</td>
      </tr>`;
    html += "</tbody></table>";

    const blob = new Blob(
      [
        '\ufeff<html><head><meta charset="utf-8"></head><body>' +
          html +
          "</body></html>",
      ],
      { type: "application/vnd.ms-excel" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const dateStr = new Date().toISOString().split("T")[0];
    a.download = `KPI-Report-${dateStr}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printPDF = () => window.print();

  const kpis = [
    {
      label: "Events",
      value: totals.events,
      icon: Activity,
      color: "bg-emerald-500",
      tKey: "events",
    },
    {
      label: "Visitors",
      value: totals.visitors.toLocaleString(),
      icon: Eye,
      color: "bg-fuchsia-500",
      tKey: "visitors",
    },
    {
      label: "Paramedics",
      value: totals.paramedics,
      icon: Users,
      color: "bg-teal-500",
      tKey: "paramedics",
    },
    {
      label: "Nurses",
      value: totals.nurses,
      icon: Heart,
      color: "bg-rose-500",
      tKey: "nurses",
    },
    {
      label: "Doctors",
      value: totals.doctors,
      icon: Stethoscope,
      color: "bg-blue-500",
      tKey: "doctors",
    },
    {
      label: "Ambulances",
      value: totals.ambulances,
      icon: Truck,
      color: "bg-orange-500",
      tKey: "ambulances",
    },
    {
      label: "Golf Carts",
      value: totals.golf,
      icon: Car,
      color: "bg-amber-500",
      tKey: "golf",
    },
    {
      label: "Clinics",
      value: totals.clinics,
      icon: Building2,
      color: "bg-indigo-500",
      tKey: "clinics",
    },
    {
      label: "Patients",
      value: totals.patients,
      icon: UserPlus,
      color: "bg-cyan-600",
      tKey: "patients",
    },
    {
      label: "Transferred to Hospital",
      value: totals.transferred,
      icon: ArrowRightLeft,
      color: "bg-red-600",
      tKey: "transferred",
    },
  ];

  const chartData = aggregated.map((g) => ({
    name: g.period,
    Patients: g.patients,
    Transferred: g.transferred,
    Visitors: g.visitors,
  }));

  const staffData = [
    { name: "Paramedics", value: totals.paramedics },
    { name: "Nurses", value: totals.nurses },
    { name: "Doctors", value: totals.doctors },
  ];
  const COLORS = ["#14b8a6", "#f43f5e", "#3b82f6"];

  const inputs = [
    { k: "date", p: "Date (2026-07-01)", t: "text" },
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
      <span
        className={`flex items-center text-xs font-semibold ${
          up ? "text-emerald-600" : "text-red-500"
        }`}
      >
        {up ? (
          <TrendingUp className="w-3 h-3 mr-0.5" />
        ) : (
          <TrendingDown className="w-3 h-3 mr-0.5" />
        )}
        {Math.abs(v)}%
      </span>
    );
  };

  const periodLabel = PERIODS.find((p) => p.key === period)?.label + " Report";

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
      <div className="bg-gradient-to-r from-red-700 to-red-500 rounded-2xl p-6 mb-6 shadow-lg flex flex-wrap items-center gap-4 print-shadow">
        <div className="bg-white rounded-xl p-3 flex items-center justify-center">
          <Heart className="text-red-600 w-10 h-10" fill="currentColor" />
        </div>
        <div className="text-white">
          <h1 className="text-2xl font-bold">
            Dr. Sulaiman Al Habib Medical Group
          </h1>
          <p className="text-red-100 text-sm mt-1">
            KPI Dashboard — Jeddah Season Events
          </p>
          <p className="text-red-100 text-xs mt-1">Report Date: {today}</p>
        </div>
        <div className="ml-auto flex flex-wrap gap-3">
          <div className="text-white text-center bg-white/15 rounded-xl px-5 py-3">
            <div className="text-3xl font-bold">{transferRate}%</div>
            <div className="text-xs text-red-100">Hospital Transfer Rate</div>
          </div>
          <div className="text-white text-center bg-white/15 rounded-xl px-5 py-3">
            <div className="text-3xl font-bold">
              {totals.visitors.toLocaleString()}
            </div>
            <div className="text-xs text-red-100">Total Visitors</div>
          </div>
          <div className="flex flex-col gap-2 no-print">
            <button
              onClick={printPDF}
              className="bg-white text-red-600 rounded-xl px-4 py-2 flex items-center gap-2 font-medium hover:bg-red-50 transition"
            >
              <Printer className="w-4 h-4" /> Print PDF
            </button>
            <button
              onClick={exportExcel}
              className="bg-green-600 text-white rounded-xl px-4 py-2 flex items-center gap-2 font-medium hover:bg-green-700 transition"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export Excel
            </button>
            <button
              onClick={exportCSV}
              className="bg-red-800 text-white rounded-xl px-4 py-2 flex items-center gap-2 font-medium hover:bg-red-900 transition"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* أزرار الفترة */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6 avoid-break print-shadow">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <CalendarDays className="w-5 h-5 text-red-600" />
          <h3 className="font-bold text-slate-700 mr-2">Statistics Report</h3>
          <div className="flex flex-wrap gap-2 ml-auto no-print">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  period === p.key
                    ? "bg-red-600 text-white shadow"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {p.label} · {p.ar}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-slate-50 rounded-xl p-4 border-l-4 border-red-500">
            <div className="text-xs text-slate-500">
              Periods ({periodLabel})
            </div>
            <div className="text-2xl font-bold text-slate-800">
              {aggregated.length}
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border-l-4 border-fuchsia-500">
            <div className="text-xs text-slate-500">Total Visitors</div>
            <div className="text-2xl font-bold text-fuchsia-600">
              {totals.visitors.toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border-l-4 border-cyan-500">
            <div className="text-xs text-slate-500">Total Patients</div>
            <div className="text-2xl font-bold text-cyan-600">
              {totals.patients}
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border-l-4 border-emerald-500">
            <div className="text-xs text-slate-500">Avg Patients/Event</div>
            <div className="text-2xl font-bold text-emerald-600">
              {avgPerEvent}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                {[
                  periodLabel,
                  "Records",
                  "Visitors",
                  "Patients",
                  "Transferred",
                  "Events",
                  "Paramedics",
                  "Nurses",
                  "Doctors",
                ].map((h, i) => (
                  <th
                    key={i}
                    className="px-3 py-2 font-medium whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {aggregated.map((g, i) => (
                <tr
                  key={g.period}
                  className={i % 2 ? "bg-slate-50" : "bg-white"}
                >
                  <td className="px-3 py-2 font-medium whitespace-nowrap">
                    {g.period}
                  </td>
                  <td className="px-3 py-2 text-center">{g.count}</td>
                  <td className="px-3 py-2 text-center text-fuchsia-600 font-medium">
                    {g.visitors.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-center">{g.patients}</td>
                  <td className="px-3 py-2 text-center text-red-600 font-medium">
                    {g.transferred}
                  </td>
                  <td className="px-3 py-2 text-center">{g.events}</td>
                  <td className="px-3 py-2 text-center">{g.paramedics}</td>
                  <td className="px-3 py-2 text-center">{g.nurses}</td>
                  <td className="px-3 py-2 text-center">{g.doctors}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6 avoid-break">
        {kpis.map((k, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition print-shadow"
          >
            <div className="flex items-start justify-between">
              <div
                className={`${k.color} w-10 h-10 rounded-lg flex items-center justify-center mb-2`}
              >
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 avoid-break">
        <div className="bg-white rounded-xl p-4 shadow-sm print-shadow">
          <h3 className="font-bold text-slate-700 mb-3">
            Visitors, Patients & Transfers ({periodLabel})
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId="right"
                dataKey="Visitors"
                fill="#d946ef"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="left"
                dataKey="Patients"
                fill="#14b8a6"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="left"
                dataKey="Transferred"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm print-shadow">
          <h3 className="font-bold text-slate-700 mb-3">
            Medical Staff Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={staffData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
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
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
            />
          ))}
          <button
            onClick={addRow}
            className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-1 text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto avoid-break print-shadow">
        <table className="w-full text-sm text-left">
          <thead className="bg-red-600 text-white">
            <tr>
              {[
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
                "",
              ].map((h, i) => (
                <th key={i} className="px-3 py-3 font-medium whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} className={i % 2 ? "bg-slate-50" : "bg-white"}>
                <td className="px-3 py-2 whitespace-nowrap">{r.date}</td>
                <td className="px-3 py-2 whitespace-nowrap">{r.event}</td>
                <td className="px-3 py-2 text-center">{r.events}</td>
                <td className="px-3 py-2 text-center text-fuchsia-600 font-medium">
                  {num(r.visitors).toLocaleString()}
                </td>
                <td className="px-3 py-2 text-center">{r.paramedics}</td>
                <td className="px-3 py-2 text-center">{r.nurses}</td>
                <td className="px-3 py-2 text-center">{r.doctors}</td>
                <td className="px-3 py-2 text-center">{r.ambulances}</td>
                <td className="px-3 py-2 text-center">{r.golf}</td>
                <td className="px-3 py-2 text-center">{r.clinics}</td>
                <td className="px-3 py-2 text-center">{r.patients}</td>
                <td className="px-3 py-2 text-center text-red-600 font-medium">
                  {r.transferred}
                </td>
                <td className="px-3 py-2 text-center no-print">
                  <button
                    onClick={() => delRow(r.id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-100 font-bold">
            <tr>
              <td className="px-3 py-3" colSpan={2}>
                Total
              </td>
              <td className="px-3 py-3 text-center">{totals.events}</td>
              <td className="px-3 py-3 text-center text-fuchsia-600">
                {totals.visitors.toLocaleString()}
              </td>
              <td className="px-3 py-3 text-center">{totals.paramedics}</td>
              <td className="px-3 py-3 text-center">{totals.nurses}</td>
              <td className="px-3 py-3 text-center">{totals.doctors}</td>
              <td className="px-3 py-3 text-center">{totals.ambulances}</td>
              <td className="px-3 py-3 text-center">{totals.golf}</td>
              <td className="px-3 py-3 text-center">{totals.clinics}</td>
              <td className="px-3 py-3 text-center">{totals.patients}</td>
              <td className="px-3 py-3 text-center text-red-600">
                {totals.transferred}
              </td>
              <td className="no-print"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
