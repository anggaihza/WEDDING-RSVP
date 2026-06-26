import { isDashboardAuthenticated } from "@/lib/dashboard-session";
import {
  applyDashboardFilters,
  getDashboardRsvpRows,
  parseDashboardFilters,
  rowsToCsv,
} from "@/lib/dashboard";

export async function GET(request: Request) {
  if (!(await isDashboardAuthenticated())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const filters = parseDashboardFilters(url.searchParams);
  const { rows, error } = await getDashboardRsvpRows();

  if (error) {
    return new Response(error, { status: 500 });
  }

  const csv = rowsToCsv(applyDashboardFilters(rows, filters));
  const filename = `wedding-rsvp-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
