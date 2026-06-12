import { NextResponse, type NextRequest } from "next/server";
import {
  activityOutcomeEnum,
  activityTypeEnum,
  createActivitySchema,
} from "@/lib/schemas/activity";
import { createActivity, listActivities } from "@/lib/repositories/activities";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId") ?? undefined;
    const salesAgentId = searchParams.get("salesAgentId") ?? undefined;
    const from = searchParams.get("from") ?? undefined;
    const to = searchParams.get("to") ?? undefined;
    const q = searchParams.get("q") ?? undefined;
    const pendingNextAction =
      searchParams.get("pendingNextAction") === "true";
    const page = parseInt(searchParams.get("page") ?? "1", 10) || 1;
    const pageSize = parseInt(searchParams.get("pageSize") ?? "20", 10) || 20;

    const filter: Parameters<typeof listActivities>[0] = {
      clientId,
      salesAgentId,
      from,
      to,
      q,
      pendingNextAction,
      page,
      pageSize,
    };

    const rawType = searchParams.get("type");
    if (rawType) {
      const parsed = activityTypeEnum.safeParse(rawType);
      if (!parsed.success) {
        return NextResponse.json({ error: "type inválido" }, { status: 400 });
      }
      filter.type = parsed.data;
    }
    const rawOutcome = searchParams.get("outcome");
    if (rawOutcome) {
      const parsed = activityOutcomeEnum.safeParse(rawOutcome);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "outcome inválido" },
          { status: 400 }
        );
      }
      filter.outcome = parsed.data;
    }

    const result = await listActivities(filter);
    return NextResponse.json(result);
  } catch (err) {
    console.error("GET /api/activities", err);
    return NextResponse.json(
      { error: "Error al listar actividades" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createActivitySchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const detail = firstIssue
        ? `${firstIssue.path.join(".") || "campo"}: ${firstIssue.message}`
        : "Datos inválidos";
      return NextResponse.json(
        { error: detail, issues: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const activity = await createActivity(parsed.data);
    return NextResponse.json(activity, { status: 201 });
  } catch (err) {
    console.error("POST /api/activities", err);
    return NextResponse.json(
      { error: "Error al crear la actividad" },
      { status: 500 }
    );
  }
}
