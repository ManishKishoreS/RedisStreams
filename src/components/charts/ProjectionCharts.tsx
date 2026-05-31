"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  AnalysisResult,
  AssetAllocation,
  YearProjection,
} from "@/domain/types";

const fmt = (v: number) =>
  new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(v);

const PALETTE = ["#0ea5e9", "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

/** Corpus growth & depletion across the whole life of the plan. */
export function CorpusChart({ rows }: { rows: YearProjection[] }) {
  const data = rows.map((r) => ({ age: r.age, corpus: Math.round(r.endingCorpus) }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="corpus" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.6} />
            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="age" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={fmt} tick={{ fontSize: 12 }} width={48} />
        <Tooltip formatter={(v: number) => fmt(v)} labelFormatter={(l) => `Age ${l}`} />
        <Area type="monotone" dataKey="corpus" stroke="#0284c7" fill="url(#corpus)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Inflation-adjusted expenses vs withdrawals in retirement. */
export function ExpenseWithdrawalChart({ rows }: { rows: YearProjection[] }) {
  const data = rows
    .filter((r) => r.phase === "retirement")
    .map((r) => ({
      age: r.age,
      expenses: Math.round(r.expenses),
      withdrawals: Math.round(r.withdrawals),
      income: Math.round(r.otherIncome),
    }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="age" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={fmt} tick={{ fontSize: 12 }} width={48} />
        <Tooltip formatter={(v: number) => fmt(v)} labelFormatter={(l) => `Age ${l}`} />
        <Legend />
        <Line type="monotone" dataKey="expenses" stroke="#ef4444" dot={false} name="Expenses" />
        <Line type="monotone" dataKey="withdrawals" stroke="#0ea5e9" dot={false} name="Withdrawals" />
        <Line type="monotone" dataKey="income" stroke="#10b981" dot={false} name="Pension income" />
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Asset allocation donut. */
export function AllocationChart({ allocation }: { allocation: AssetAllocation }) {
  const data = [
    { name: "Stocks", value: allocation.stocks },
    { name: "Bonds", value: allocation.bonds },
    { name: "Cash", value: allocation.cash },
    { name: "Property", value: allocation.property },
    { name: "Alternatives", value: allocation.alternatives },
  ].filter((d) => d.value > 0);
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v: number) => `${(v * 100).toFixed(0)}%`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

/** Monte Carlo terminal-balance distribution. */
export function MonteCarloChart({ result }: { result: AnalysisResult["monteCarlo"] }) {
  const data = result.histogram.map((h) => ({ bucket: fmt(h.bucket), count: h.count }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="bucket" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 12 }} width={36} />
        <Tooltip />
        <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Scenario comparison: ending corpus per scenario over time. */
export function ScenarioChart({
  scenarios,
}: {
  scenarios: AnalysisResult["scenarioProjections"];
}) {
  // Align all scenarios on age.
  const ages = scenarios[0]?.result.rows.map((r) => r.age) ?? [];
  const data = ages.map((age, idx) => {
    const point: Record<string, number> = { age };
    for (const s of scenarios) {
      point[s.scenario.label] = Math.round(s.result.rows[idx]?.endingCorpus ?? 0);
    }
    return point;
  });
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="age" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={fmt} tick={{ fontSize: 12 }} width={48} />
        <Tooltip formatter={(v: number) => fmt(v)} labelFormatter={(l) => `Age ${l}`} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {scenarios.map((s, i) => (
          <Line
            key={s.scenario.label}
            type="monotone"
            dataKey={s.scenario.label}
            stroke={PALETTE[i % PALETTE.length]}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
