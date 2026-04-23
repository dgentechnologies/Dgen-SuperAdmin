import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/verify-session';
import { websiteDb } from '@/lib/firebase/admin-website';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

// ── helpers ────────────────────────────────────────────────

function unsanitizeKey(key: string): string {
  // Firestore map keys cannot contain '/', so '/' is stored as '|'
  return key.replace(/\|/g, '/');
}

function buildDateKeys(days: number): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    // Format as YYYY-MM-DD
    keys.push(d.toISOString().split('T')[0]);
  }
  return keys;
}

// ── route ─────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  const rangeParam = req.nextUrl.searchParams.get('range') ?? '30';
  const days = rangeParam === '365' ? 365 : rangeParam === '7' ? 7 : 30;

  try {
    const db = websiteDb();

    // ── siteAnalytics – daily aggregate docs ─────────────
    const dateKeys = buildDateKeys(days);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    // Try both known collection name conventions
    const ANALYTICS_COLLECTIONS = ['siteAnalytics', 'analytics', 'pageAnalytics'] as const;
    const PAGE_VIEW_COLLECTIONS = ['pageViews', 'page-views', 'views'] as const;

    let dailyDocs: Array<{ date: string; views: number; visitors: number; countries: Record<string, number>; pages: Record<string, number> }> = [];

    for (const colName of ANALYTICS_COLLECTIONS) {
      try {
        const snaps = await Promise.all(
          dateKeys.map((key) => db.collection(colName).doc(key).get())
        );

        const found = snaps.filter((s) => s.exists);
        if (found.length > 0) {
          dailyDocs = found.map((s) => {
            const d = s.data() as Record<string, unknown>;
            return {
              date: s.id,
              views: typeof d.views === 'number' ? d.views : typeof d.pageViews === 'number' ? d.pageViews : 0,
              visitors: typeof d.visitors === 'number' ? d.visitors : typeof d.uniqueVisitors === 'number' ? d.uniqueVisitors : 0,
              countries: (typeof d.countries === 'object' && d.countries !== null ? d.countries : {}) as Record<string, number>,
              pages: (typeof d.pages === 'object' && d.pages !== null ? d.pages : {}) as Record<string, number>,
            };
          });
          break;
        }
      } catch {
        // try next collection
      }
    }

    // ── pageViews – recent raw events ────────────────────
    type RecentVisitor = { page: string; country: string; referrer: string; ts: unknown };
    let recentVisitors: RecentVisitor[] = [];

    for (const colName of PAGE_VIEW_COLLECTIONS) {
      try {
        let snap;
        try {
          snap = await db
            .collection(colName)
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get();
        } catch {
          snap = await db.collection(colName).limit(50).get();
        }

        if (!snap.empty) {
          recentVisitors = snap.docs.map((doc) => {
            const d = doc.data() as Record<string, unknown>;
            return {
              page: typeof d.page === 'string' ? unsanitizeKey(d.page) : typeof d.path === 'string' ? d.path : '/',
              country: typeof d.country === 'string' ? d.country : 'Unknown',
              referrer: typeof d.referrer === 'string' ? d.referrer : '',
              ts: d.timestamp ?? d.createdAt ?? null,
            };
          });
          break;
        }
      } catch {
        // try next
      }
    }

    // ── aggregations ─────────────────────────────────────
    const totalViews = dailyDocs.reduce((sum, d) => sum + d.views, 0);
    const totalVisitors = dailyDocs.reduce((sum, d) => sum + d.visitors, 0);

    // Merge country maps
    const countriesMap: Record<string, number> = {};
    for (const day of dailyDocs) {
      for (const [rawKey, count] of Object.entries(day.countries)) {
        const key = unsanitizeKey(rawKey);
        countriesMap[key] = (countriesMap[key] ?? 0) + (typeof count === 'number' ? count : 0);
      }
    }

    // Merge pages maps
    const pagesMap: Record<string, number> = {};
    for (const day of dailyDocs) {
      for (const [rawKey, count] of Object.entries(day.pages)) {
        const key = unsanitizeKey(rawKey);
        pagesMap[key] = (pagesMap[key] ?? 0) + (typeof count === 'number' ? count : 0);
      }
    }

    const topCountries = Object.entries(countriesMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([country, views]) => ({ country, views }));

    const topPages = Object.entries(pagesMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([page, views]) => ({ page, views }));

    const trend = dailyDocs.map((d) => ({ date: d.date, views: d.views, visitors: d.visitors }));

    return apiSuccess({
      range: days,
      totalViews,
      totalVisitors,
      topCountries,
      topPages,
      trend,
      recentVisitors,
    });
  } catch (err) {
    console.error('[website/analytics]', err);
    return apiError('Internal server error', 500);
  }
}
