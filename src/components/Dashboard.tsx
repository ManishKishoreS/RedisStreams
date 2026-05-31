"use client";

import { useMemo, useState } from "react";
import { analyzePlan } from "@/lib/engine";
import { samplePlanUKtoPortugal, samplePlanIndiaToUAE } from "@/lib/sample-data";
import type { RetirementPlan, SwrStance } from "@/domain/types";
import { COUNTRY_PROFILES } from "@/lib/engine/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { formatMoney, formatPercent } from "@/lib/utils";
import {
  AllocationChart,
  CorpusChart,
  ExpenseWithdrawalChart,
  MonteCarloChart,
  ScenarioChart,
} from "@/components/charts/ProjectionCharts";

const SAMPLES: { id: string; label: string; plan: RetirementPlan }[] = [
  { id: "uk-pt", label: "UK → Portugal", plan: samplePlanUKtoPortugal },
  { id: "in-ae", label: "India → UAE", plan: samplePlanIndiaToUAE },
];

interface Overrides {
  inflation: number;
  expectedReturn: number;
  retirementAge: number;
  lifeExpectancy: number;
  swrStance: SwrStance;
}

function applyOverrides(plan: RetirementPlan, o: Overrides): RetirementPlan {
  return {
    ...plan,
    inflation: { ...plan.inflation, general: o.inflation },
    investment: { ...plan.investment, expectedReturn: o.expectedReturn, riskProfile: "custom" },
    goals: {
      ...plan.goals,
      targetRetirementAge: o.retirementAge,
      swrStance: o.swrStance,
      lifeExpectancyMode: "manual",
      manualLifeExpectancy: o.lifeExpectancy,
    },
  };
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="font-semibold text-sky-600">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-sky-600"
      />
    </div>
  );
}

export function Dashboard() {
  const [sampleId, setSampleId] = useState(SAMPLES[0].id);
  const basePlan = SAMPLES.find((s) => s.id === sampleId)!.plan;

  const [overrides, setOverrides] = useState<Overrides>({
    inflation: basePlan.inflation.general,
    expectedReturn: basePlan.investment.expectedReturn,
    retirementAge: basePlan.goals.targetRetirementAge ?? 60,
    lifeExpectancy: 90,
    swrStance: basePlan.goals.swrStance,
  });

  const plan = useMemo(() => applyOverrides(basePlan, overrides), [basePlan, overrides]);
  const result = useMemo(
    () => analyzePlan(plan, { monteCarloRuns: 1000, monteCarloSeed: 12345 }),
    [plan],
  );

  const currency = COUNTRY_PROFILES[basePlan.country.retirement].currency;
  const statusTone = result.status;

  const set = (patch: Partial<Overrides>) => setOverrides((o) => ({ ...o, ...patch }));

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">RetireWise Global</h1>
          <p className="text-sm text-slate-500">
            {plan.personal.firstName} {plan.personal.lastName} · Working in{" "}
            {COUNTRY_PROFILES[plan.country.working].name} · Retiring in{" "}
            {COUNTRY_PROFILES[plan.country.retirement].name}
          </p>
        </div>
        <select
          value={sampleId}
          onChange={(e) => setSampleId(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm"
        >
          {SAMPLES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </header>

      {/* Headline stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat
          label="Readiness score"
          value={`${result.readinessScore}/100`}
          tone={statusTone}
          sub={`Status: ${result.status.toUpperCase()}`}
        />
        <Stat
          label="Probability of success"
          value={formatPercent(result.monteCarlo.successProbability, 0)}
          sub={`${result.monteCarlo.runs.toLocaleString()} Monte Carlo runs`}
        />
        <Stat
          label="Retirement age"
          value={`${result.retirementAge}`}
          sub={`Earliest realistic: ${result.ages.earliest ?? "—"}`}
        />
        <Stat
          label="Years money lasts"
          value={`${result.yearsMoneyWillLast}`}
          sub={
            result.baseProjection.depletionAge
              ? `Depletes at age ${result.baseProjection.depletionAge}`
              : "Lasts through life expectancy"
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Required corpus" value={formatMoney(result.corpus.requiredCorpus, currency)} />
        <Stat label="Projected corpus" value={formatMoney(result.corpus.projectedCorpus, currency)} />
        <Stat
          label={result.corpus.shortfall > 0 ? "Shortfall" : "Surplus"}
          value={formatMoney(Math.abs(result.corpus.shortfall), currency)}
          tone={result.corpus.shortfall > 0 ? "red" : "green"}
        />
        <Stat
          label="Safe withdrawal rate"
          value={formatPercent(result.swr.recommended)}
          sub={`Band ${formatPercent(result.swr.conservative)}–${formatPercent(result.swr.aggressive)}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sensitivity sliders */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Sensitivity analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Slider
              label="Inflation"
              value={overrides.inflation}
              min={0.01}
              max={0.08}
              step={0.005}
              onChange={(v) => set({ inflation: v })}
              display={formatPercent(overrides.inflation)}
            />
            <Slider
              label="Expected return"
              value={overrides.expectedReturn}
              min={0.02}
              max={0.12}
              step={0.005}
              onChange={(v) => set({ expectedReturn: v })}
              display={formatPercent(overrides.expectedReturn)}
            />
            <Slider
              label="Retirement age"
              value={overrides.retirementAge}
              min={plan.personal.currentAge + 1}
              max={75}
              step={1}
              onChange={(v) => set({ retirementAge: v })}
              display={`${overrides.retirementAge}`}
            />
            <Slider
              label="Life expectancy"
              value={overrides.lifeExpectancy}
              min={75}
              max={105}
              step={1}
              onChange={(v) => set({ lifeExpectancy: v })}
              display={`${overrides.lifeExpectancy}`}
            />
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Withdrawal stance</span>
              <div className="flex gap-1">
                {(["conservative", "moderate", "aggressive"] as SwrStance[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => set({ swrStance: s })}
                    className={`flex-1 rounded-md border px-2 py-1 text-xs capitalize ${
                      overrides.swrStance === s
                        ? "border-sky-600 bg-sky-50 text-sky-700"
                        : "border-slate-200 text-slate-500"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Corpus chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Corpus growth &amp; depletion</CardTitle>
          </CardHeader>
          <CardContent>
            <CorpusChart rows={result.baseProjection.rows} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Inflation-adjusted expenses, withdrawals &amp; income</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseWithdrawalChart rows={result.baseProjection.rows} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Asset allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <AllocationChart allocation={plan.investment.allocation} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monte Carlo terminal-balance distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <MonteCarloChart result={result.monteCarlo} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Scenario stress tests</CardTitle>
          </CardHeader>
          <CardContent>
            <ScenarioChart scenarios={result.scenarioProjections} />
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>AI insights</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {result.insights.map((insight, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700">
                <span className="mt-0.5 text-sky-500">●</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <footer className="pb-8 pt-2 text-center text-xs text-slate-400">
        RetireWise Global · Illustrative modelling only — not financial advice. Tax figures are
        simplified defaults.
      </footer>
    </div>
  );
}
