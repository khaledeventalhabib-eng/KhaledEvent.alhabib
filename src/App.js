import React, { useState } from "react";
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
  Timer,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Target,
  Printer,
} from "lucide-react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ReferenceLine,
} from "recharts";

export default function KPIDashboard() {
  const TARGET_RESPONSE = 5;

  const [rows, setRows] = useState([
    {
      id: 1,
      date: "2025-01",
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
      response: 6.5,
    },
    {
      id: 2,
      date: "2025-02",
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
      response: 5.2,
    },
    {
      id: 3,
      date: "2025-03",
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
      response: 4.8,
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
    response: "",
  });

  const num = (v) => parseFloat(v) || 0;
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
    }
  );

  const transferRate = totals.patients
    ? ((totals.transferred / totals.patients) * 100).toFixed(1)
    : 0;
  const avgPerEvent = totals.events
    ? Math.round(totals.patients / totals.events)
    : 0;

  const respValues = rows.map((r) => num(r.response)).filter((v) => v > 0);
  const avgResponse = respValues.length
    ? (respValues.reduce((s, v) => s + v, 0) / respValues.length).toFixed(1)
    : 0;
  const minResponse = respValues.length
    ? Math.min(...respValues).toFixed(1)
    : 0;
  const maxResponse = respValues.length
    ? Math.max(...respValues).toFixed(1)
    : 0;
  const metTarget = respValues.filter((v) => v <= TARGET_RESPONSE).length;
  const complianceRate = respValues.length
    ? Math.round((metTarget / respValues.length) * 100)
    : 0;
  const isOverTarget = num(avgResponse) > TARGET_RESPONSE;

  const fastestRow = rows.reduce(
    (best, r) =>
      num(r.response) > 0 && (!best || num(r.response) < num(best.response))
        ? r
        : best,
    null
  );
  const slowestRow = rows.reduce(
    (worst, r) =>
      num(r.response) > 0 && (!worst || num(r.response) > num(worst.response))
        ? r
        : worst,
    null
  );

  const respColor =
    avgResponse <= 5
      ? "bg-emerald-500"
      : avgResponse <= 8
      ? "bg-amber-500"
      : "bg-red-600";
  const respLabel =
    avgResponse <= 5
      ? "Excellent"
      : avgResponse <= 8
      ? "Acceptable"
      : "Needs Improvement";

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
      response: "",
    });
  };
  const delRow = (id) => setRows(rows.filter((r) => r.id !== id));

  const exportCSV = () => {
    const headers = [
      "Month",
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
      "Response",
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
        r.response,
      ].join(",")
    );
    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kpi-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // === طباعة PDF ===
  const printPDF = () => {
    window.print();
  };

  const kpis = [
    {
      label: "Events",
      value: totals.events,
      icon: Activity,
      color: "bg-emerald-500",
      tKey: "events",
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

  const chartData = rows.map((r) => ({
    name: r.date,
    Patients: num(r.patients),
    Transferred: num(r.transferred),
    "Response (min)": num(r.response),
  }));
  const staffData = [
    { name: "Paramedics", value: totals.paramedics },
    { name: "Nurses", value: totals.nurses },
    { name: "Doctors", value: totals.doctors },
  ];
  const COLORS = ["#14b8a6", "#f43f5e", "#3b82f6"];

  const inputs = [
    { k: "date", p: "Month (2025-04)", t: "text" },
    { k: "event", p: "Event Name", t: "text" },
    { k: "events", p: "Events", t: "number" },
    { k: "paramedics", p: "Paramedics", t: "number" },
    { k: "nurses", p: "Nurses", t: "number" },
    { k: "doctors", p: "Doctors", t: "number" },
    { k: "ambulances", p: "Ambulances", t: "number" },
    { k: "golf", p: "Golf Carts", t: "number" },
    { k: "clinics", p: "Clinics", t: "number" },
    { k: "patients", p: "Patients", t: "number" },
    { k: "transferred", p: "Transferred", t: "number" },
    { k: "response", p: "Response (min)", t: "number" },
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

  const today = new Date().toLocaleDateString("en-GB");

  return (
    <div id="report" className="min-h-screen bg-slate-50 p-4 font-sans">
      {/* === أنماط الطباعة === */}
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
              {avgResponse}
              <span className="text-sm">min</span>
            </div>
            <div className="text-xs text-red-100">Avg Response Time</div>
          </div>
          <div className="flex flex-col gap-2 no-print">
            <button
              onClick={printPDF}
              className="bg-white text-red-600 rounded-xl px-4 py-2 flex items-center gap-2 font-medium hover:bg-red-50 transition"
            >
              <Printer className="w-4 h-4" /> Print PDF
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

      {/* تنبيه زمن الاستجابة */}
      {isOverTarget ? (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-6 flex items-center gap-3 avoid-break">
          <div className="bg-red-600 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="text-white w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-red-700">
              ⚠️ Response Time Above Target!
            </div>
            <div className="text-sm text-red-600">
              Average response time is {avgResponse} min — exceeds the{" "}
              {TARGET_RESPONSE} min target. Action recommended.
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4 mb-6 flex items-center gap-3 avoid-break">
          <div className="bg-emerald-500 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle className="text-white w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-emerald-700">
              ✅ Response Time On Target!
            </div>
            <div className="text-sm text-emerald-600">
              Average response time is {avgResponse} min — within the{" "}
              {TARGET_RESPONSE} min target. Great work!
            </div>
          </div>
        </div>
      )}

      {/* لوحة زمن الاستجابة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 avoid-break">
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-emerald-500 print-shadow">
          <div className="flex items-center gap-2 mb-1">
            <ArrowDown className="text-emerald-500 w-4 h-4" />
            <span className="text-xs text-slate-500">Fastest Response</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {minResponse}{" "}
            <span className="text-sm font-normal text-slate-400">min</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {fastestRow ? `${fastestRow.date} · ${fastestRow.event}` : "—"}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-red-500 print-shadow">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUp className="text-red-500 w-4 h-4" />
            <span className="text-xs text-slate-500">Slowest Response</span>
          </div>
          <div className="text-2xl font-bold text-red-600">
            {maxResponse}{" "}
            <span className="text-sm font-normal text-slate-400">min</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {slowestRow ? `${slowestRow.date} · ${slowestRow.event}` : "—"}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500 print-shadow">
          <div className="flex items-center gap-2 mb-1">
            <Timer className="text-purple-500 w-4 h-4" />
            <span className="text-xs text-slate-500">Average Response</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {avgResponse}{" "}
            <span className="text-sm font-normal text-slate-400">min</span>
          </div>
          <div
            className={`text-xs font-medium mt-1 ${
              avgResponse <= 5
                ? "text-emerald-600"
                : avgResponse <= 8
                ? "text-amber-600"
                : "text-red-600"
            }`}
          >
            {respLabel}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500 print-shadow">
          <div className="flex items-center gap-2 mb-1">
            <Target className="text-blue-500 w-4 h-4" />
            <span className="text-xs text-slate-500">Target Compliance</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {complianceRate}%
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
            <div
              className={`h-2 rounded-full ${
                complianceRate >= 70
                  ? "bg-emerald-500"
                  : complianceRate >= 40
                  ? "bg-amber-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${complianceRate}%` }}
            ></div>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {metTarget} of {respValues.length} months met target
          </div>
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
            Patients, Transfers & Response Time
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
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="Response (min)"
                stroke="#7c3aed"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <ReferenceLine
                yAxisId="right"
                y={TARGET_RESPONSE}
                stroke="#10b981"
                strokeDasharray="5 5"
                label={{
                  value: "Target 5min",
                  fontSize: 10,
                  fill: "#10b981",
                  position: "insideTopRight",
                }}
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
                "Month",
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
                "Response (min)",
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
                <td
                  className={`px-3 py-2 text-center font-medium ${
                    num(r.response) <= 5
                      ? "text-emerald-600"
                      : num(r.response) <= 8
                      ? "text-amber-600"
                      : "text-red-600"
                  }`}
                >
                  {r.response}
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
                Total / Avg
              </td>
              <td className="px-3 py-3 text-center">{totals.events}</td>
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
              <td className="px-3 py-3 text-center text-purple-600">
                {avgResponse}
              </td>
              <td className="no-print"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
