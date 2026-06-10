import { NextResponse } from "next/server";
import { analyzePlan } from "@/lib/engine";
import type { RetirementPlan } from "@/domain/types";

/**
 * POST /api/analyze
 * Body: a RetirementPlan (optionally with { _runs, _seed } analysis options).
 * Returns the full AnalysisResult.
 *
 * The financial engine is pure and runs server-side here, but could equally run
 * in a server action, a worker, or the client.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RetirementPlan & {
      _runs?: number;
      _seed?: number;
    };
    const result = analyzePlan(body, {
      monteCarloRuns: body._runs ?? 1000,
      monteCarloSeed: body._seed,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid plan" },
      { status: 400 },
    );
  }
}
