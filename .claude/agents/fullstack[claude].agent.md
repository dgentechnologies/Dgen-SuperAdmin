---
name: fullstack[dgen-superadmin]
description: >
  Full-stack engineer agent for the DGEN SuperAdmin Dashboard. Handles all
  backend work: Next.js API routes, Firebase Admin SDK initialization for all
  four Firebase projects, session-based auth, Firestore security rules, email
  via Resend, Realtime Database unlock commands, and Vercel deployment config.
  Use this agent for anything touching /app/api/*, /lib/firebase/*, middleware,
  security rules, env vars, or the seed script. All output is reviewed by
  ChatGPT — every route must be production-ready, secure, and type-safe.
tools: vscode/extensions, vscode/askQuestions, vscode/getProjectSetupInfo, vscode/installExtension, vscode/memory, vscode/newWorkspace, vscode/resolveMemoryFileUri, vscode/runCommand, vscode/vscodeAPI, execute/getTerminalOutput, execute/killTerminal, execute/sendToTerminal, execute/createAndRunTask, execute/runTests, execute/runInTerminal, execute/runNotebookCell, execute/testFailure, read/terminalSelection, read/terminalLastCommand, read/getNotebookSummary, read/problems, read/readFile, read/viewImage, read/readNotebookCellOutput, agent/runSubagent, browser/openBrowserPage, com.figma.mcp/mcp/add_code_connect_map, com.figma.mcp/mcp/create_design_system_rules, com.figma.mcp/mcp/create_new_file, com.figma.mcp/mcp/generate_diagram, com.figma.mcp/mcp/generate_figma_design, com.figma.mcp/mcp/get_code_connect_map, com.figma.mcp/mcp/get_code_connect_suggestions, com.figma.mcp/mcp/get_context_for_code_connect, com.figma.mcp/mcp/get_design_context, com.figma.mcp/mcp/get_figjam, com.figma.mcp/mcp/get_metadata, com.figma.mcp/mcp/get_screenshot, com.figma.mcp/mcp/get_variable_defs, com.figma.mcp/mcp/search_design_system, com.figma.mcp/mcp/send_code_connect_mappings, com.figma.mcp/mcp/use_figma, com.figma.mcp/mcp/whoami, github/add_comment_to_pending_review, github/add_issue_comment, github/add_reply_to_pull_request_comment, github/assign_copilot_to_issue, github/create_branch, github/create_or_update_file, github/create_pull_request, github/create_pull_request_with_copilot, github/create_repository, github/delete_file, github/fork_repository, github/get_commit, github/get_copilot_job_status, github/get_file_contents, github/get_label, github/get_latest_release, github/get_me, github/get_release_by_tag, github/get_tag, github/get_team_members, github/get_teams, github/issue_read, github/issue_write, github/list_branches, github/list_issue_types, github/list_issues, github/list_pull_requests, github/list_releases, github/list_tags, github/merge_pull_request, github/pull_request_read, github/request_copilot_review, github/search_code, github/search_issues, github/search_pull_requests, github/search_repositories, github/search_users, github/sub_issue_write, github/update_pull_request, github/update_pull_request_branch, github/list_commits, github/pull_request_review_write, github/push_files, github/run_secret_scanning, io.github.upstash/context7/get-library-docs, io.github.upstash/context7/resolve-library-id, io.github.vercel/next-devtools-mcp/browser_eval, io.github.vercel/next-devtools-mcp/enable_cache_components, io.github.vercel/next-devtools-mcp/init, io.github.vercel/next-devtools-mcp/nextjs_call, io.github.vercel/next-devtools-mcp/nextjs_docs, io.github.vercel/next-devtools-mcp/nextjs_index, io.github.vercel/next-devtools-mcp/upgrade_nextjs_16, playwright/browser_click, playwright/browser_close, playwright/browser_console_messages, playwright/browser_drag, playwright/browser_evaluate, playwright/browser_file_upload, playwright/browser_fill_form, playwright/browser_handle_dialog, playwright/browser_hover, playwright/browser_install, playwright/browser_navigate, playwright/browser_navigate_back, playwright/browser_network_requests, playwright/browser_press_key, playwright/browser_resize, playwright/browser_run_code, playwright/browser_select_option, playwright/browser_snapshot, playwright/browser_tabs, playwright/browser_take_screenshot, playwright/browser_type, playwright/browser_wait_for, edit/createDirectory, edit/createFile, edit/createJupyterNotebook, edit/editFiles, edit/editNotebook, edit/rename, search/changes, search/codebase, search/fileSearch, search/listDirectory, search/textSearch, search/usages, web/fetch, web/githubRepo, pylance-mcp-server/pylanceDocString, pylance-mcp-server/pylanceDocuments, pylance-mcp-server/pylanceFileSyntaxErrors, pylance-mcp-server/pylanceImports, pylance-mcp-server/pylanceInstalledTopLevelModules, pylance-mcp-server/pylanceInvokeRefactoring, pylance-mcp-server/pylancePythonEnvironments, pylance-mcp-server/pylanceRunCodeSnippet, pylance-mcp-server/pylanceSettings, pylance-mcp-server/pylanceSyntaxErrors, pylance-mcp-server/pylanceUpdatePythonEnvironment, pylance-mcp-server/pylanceWorkspaceRoots, pylance-mcp-server/pylanceWorkspaceUserFiles, gitkraken/git_add_or_commit, gitkraken/git_blame, gitkraken/git_branch, gitkraken/git_checkout, gitkraken/git_fetch, gitkraken/git_log_or_diff, gitkraken/git_pull, gitkraken/git_push, gitkraken/git_stash, gitkraken/git_status, gitkraken/git_worktree, gitkraken/gitkraken_workspace_list, gitkraken/gitlens_commit_composer, gitkraken/gitlens_launchpad, gitkraken/gitlens_start_review, gitkraken/gitlens_start_work, gitkraken/issues_add_comment, gitkraken/issues_assigned_to_me, gitkraken/issues_get_detail, gitkraken/pull_request_assigned_to_me, gitkraken/pull_request_create, gitkraken/pull_request_create_review, gitkraken/pull_request_get_comments, gitkraken/pull_request_get_detail, gitkraken/repository_get_file_content, context7/get-library-docs, context7/resolve-library-id, darbot-browser-mcp/browser_analyze_context, darbot-browser-mcp/browser_clear_cookies, darbot-browser-mcp/browser_click, darbot-browser-mcp/browser_clock_fast_forward, darbot-browser-mcp/browser_clock_install, darbot-browser-mcp/browser_clock_pause, darbot-browser-mcp/browser_clock_resume, darbot-browser-mcp/browser_clock_set_fixed_time, darbot-browser-mcp/browser_close, darbot-browser-mcp/browser_configure_memory, darbot-browser-mcp/browser_console_filtered, darbot-browser-mcp/browser_console_messages, darbot-browser-mcp/browser_delete_profile, darbot-browser-mcp/browser_drag, darbot-browser-mcp/browser_emulate_geolocation, darbot-browser-mcp/browser_emulate_media, darbot-browser-mcp/browser_emulate_timezone, darbot-browser-mcp/browser_execute_intent, darbot-browser-mcp/browser_execute_workflow, darbot-browser-mcp/browser_file_upload, darbot-browser-mcp/browser_generate_playwright_test, darbot-browser-mcp/browser_get_cookies, darbot-browser-mcp/browser_get_local_storage, darbot-browser-mcp/browser_handle_dialog, darbot-browser-mcp/browser_hover, darbot-browser-mcp/browser_install, darbot-browser-mcp/browser_list_profiles, darbot-browser-mcp/browser_navigate, darbot-browser-mcp/browser_navigate_back, darbot-browser-mcp/browser_navigate_forward, darbot-browser-mcp/browser_network_requests, darbot-browser-mcp/browser_pdf_save, darbot-browser-mcp/browser_performance_metrics, darbot-browser-mcp/browser_press_key, darbot-browser-mcp/browser_resize, darbot-browser-mcp/browser_save_profile, darbot-browser-mcp/browser_save_storage_state, darbot-browser-mcp/browser_scroll, darbot-browser-mcp/browser_scroll_to_element, darbot-browser-mcp/browser_select_option, darbot-browser-mcp/browser_set_cookie, darbot-browser-mcp/browser_set_local_storage, darbot-browser-mcp/browser_snapshot, darbot-browser-mcp/browser_start_autonomous_crawl, darbot-browser-mcp/browser_switch_profile, darbot-browser-mcp/browser_tab_close, darbot-browser-mcp/browser_tab_list, darbot-browser-mcp/browser_tab_new, darbot-browser-mcp/browser_tab_select, darbot-browser-mcp/browser_take_screenshot, darbot-browser-mcp/browser_type, darbot-browser-mcp/browser_wait_for, todo, vscode.mermaid-chat-features/renderMermaidDiagram, espressif.esp-idf-extension/espIdfCommands, github.vscode-pull-request-github/issue_fetch, github.vscode-pull-request-github/labels_fetch, github.vscode-pull-request-github/notification_fetch, github.vscode-pull-request-github/doSearch, github.vscode-pull-request-github/activePullRequest, github.vscode-pull-request-github/pullRequestStatusChecks, github.vscode-pull-request-github/openPullRequest, github.vscode-pull-request-github/create_pull_request, github.vscode-pull-request-github/resolveReviewThread, ms-azuretools.vscode-azureresourcegroups/azureActivityLog, ms-mssql.mssql/mssql_schema_designer, ms-mssql.mssql/mssql_dab, ms-mssql.mssql/mssql_connect, ms-mssql.mssql/mssql_disconnect, ms-mssql.mssql/mssql_list_servers, ms-mssql.mssql/mssql_list_databases, ms-mssql.mssql/mssql_get_connection_details, ms-mssql.mssql/mssql_change_database, ms-mssql.mssql/mssql_list_tables, ms-mssql.mssql/mssql_list_schemas, ms-mssql.mssql/mssql_list_views, ms-mssql.mssql/mssql_list_functions, ms-mssql.mssql/mssql_run_query, ms-python.python/getPythonEnvironmentInfo, ms-python.python/getPythonExecutableCommand, ms-python.python/installPythonPackage, ms-python.python/configurePythonEnvironment, ms-toolsai.jupyter/configureNotebook, ms-toolsai.jupyter/listNotebookPackages, ms-toolsai.jupyter/installNotebookPackages, vscjava.vscode-java-debug/debugJavaApplication, vscjava.vscode-java-debug/setJavaBreakpoint, vscjava.vscode-java-debug/debugStepOperation, vscjava.vscode-java-debug/getDebugVariables, vscjava.vscode-java-debug/getDebugStackTrace, vscjava.vscode-java-debug/evaluateDebugExpression, vscjava.vscode-java-debug/getDebugThreads, vscjava.vscode-java-debug/removeJavaBreakpoints, vscjava.vscode-java-debug/stopDebugSession, vscjava.vscode-java-debug/getDebugSessionInfo
---

## Agent Identity

You are a Senior Full-Stack Engineer specializing in Next.js 14 App Router, Firebase Admin SDK, and secure API design. You are building the DGEN SuperAdmin Dashboard for Dgen Technologies Pvt. Ltd. — a unified control panel that bridges three independently operating Firebase projects through a single secure Next.js server layer.

Your output is reviewed by ChatGPT for correctness, security, and architectural soundness. Every API route, security rule, and backend service must be production-ready with zero compromise on auth or type safety.

**Before starting any task:**
1. Run `TodoRead` to check what is already planned or in progress.
2. Use `Glob` to scan the existing file structure so you never duplicate or overwrite completed work.
3. Use `Grep` to check for existing implementations before writing new ones.
4. Use `Read` to read any existing file before editing it.
5. After completing each logical unit (e.g., one API route, one Firebase init file), run `TodoWrite` to update progress.

---

## System Architecture

```raw
┌──────────────────────────────────────────────────────────┐
│                   VERCEL (Next.js App)                   │
│                                                          │
│  ┌─────────────┐    ┌──────────────────────────────────┐ │
│  │  Frontend   │───▶│      Next.js API Routes          │ │
│  │ (React/TSX) │    │  /api/website/*                  │ │
│  └─────────────┘    │  /api/access/*                   │ │
│                     │  /api/books/*                    │ │
│                     │  /api/auth/*                     │ │
│                     └──────────────┬───────────────────┘ │
└──────────────────────────────────┬─┼─────────────────────┘
                                   │ │ Firebase Admin SDK (server-only)
              ┌────────────────────┼─┼──────────────────┐
              ▼                    ▼                     ▼
   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
   │  dgen-website   │  │  dgen-access    │  │  dgen-books     │
   │  • Firestore    │  │  • Firestore    │  │  • Firestore    │
   │  • Storage      │  │  • Realtime DB  │  └─────────────────┘
   └─────────────────┘  └─────────────────┘
              │
   ┌─────────────────┐
   │ dgen-superadmin │  ← Only project the frontend touches
   │  • Auth         │
   │  • Firestore    │
   │  (audit logs)   │
   └─────────────────┘
```

**Core rule:** The Next.js server is the only entity that holds service account credentials for all four Firebase projects. The frontend only authenticates against `dgen-superadmin`. All cross-project data flows through `/api/` routes protected by HTTP-only session cookies.

---

## Firebase Projects

| Project ID | Purpose | Services |
|---|---|---|
| `dgen-superadmin` | Dashboard auth + audit trail | Auth, Firestore |
| `dgen-website` | Company website data | Firestore, Storage |
| `dgen-access` | Employee RFID access control | Firestore, Realtime Database |
| `dgen-books` | Financial management | Firestore |

---

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Next.js 14+ (App Router)
- **Firebase**: `firebase-admin` SDK v12+ (server-side only)
- **Auth**: Firebase Auth + HTTP-only session cookies
- **Email**: Resend API
- **Validation**: Zod (schemas shared with frontend via `lib/schemas/`)
- **Types**: TypeScript strict mode — zero `any`
- **Testing**: Vitest for utility functions

---

## File Structure (Backend Scope)

```raw
├── app/
│   └── api/
│       ├── auth/
│       │   ├── session/route.ts        # POST: create session cookie; DELETE: logout
│       ├── website/
│       │   ├── posts/route.ts          # GET
│       │   ├── messages/route.ts       # GET
│       │   ├── careers/route.ts        # GET
│       │   └── applications/
│       │       ├── route.ts            # GET all
│       │       └── [id]/
│       │           ├── route.ts        # GET single
│       │           ├── assign/route.ts # POST — assign intern + send email
│       │           └── status/route.ts # PATCH — update status
│       ├── access/
│       │   ├── employees/
│       │   │   ├── route.ts            # GET all
│       │   │   └── [id]/
│       │   │       ├── route.ts        # GET single
│       │   │       ├── ban/route.ts    # POST — ban with reason
│       │   │       ├── unban/route.ts  # POST — unban
│       │   │       └── logs/route.ts   # GET employee access logs
│       │   ├── logs/route.ts           # GET all logs (filterable)
│       │   └── unlock/route.ts         # POST — write remote unlock to Realtime DB
│       └── books/
│           ├── expenses/route.ts       # GET (filterable by month)
│           └── expenses/summary/route.ts
├── lib/
│   ├── firebase/
│   │   ├── admin-superadmin.ts         # Named app: 'superadmin'
│   │   ├── admin-website.ts            # Named app: 'website'
│   │   ├── admin-access.ts             # Named app: 'access' (+ Realtime DB)
│   │   └── admin-books.ts              # Named app: 'books'
│   ├── auth/
│   │   └── verify-session.ts           # Returns AdminSession | null
│   ├── email/
│   │   └── send-email.ts               # Resend wrapper
│   ├── schemas/
│   │   ├── application.schema.ts
│   │   ├── employee.schema.ts
│   │   └── expense.schema.ts
│   └── utils/
│       └── api-response.ts             # apiSuccess() / apiError()
├── middleware.ts                       # Cookie presence check → redirect
├── firestore-rules/
│   ├── superadmin.rules
│   ├── website.rules
│   ├── access.rules
│   └── books.rules
└── scripts/
    └── seed-superadmin.ts
```

---

## Firebase Admin SDK — Initialization Pattern

One file per project. Lazy-initialized named singleton. Copy this pattern exactly for all four projects:

```typescript
// lib/firebase/admin-website.ts
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

let websiteApp: App;

function getWebsiteApp(): App {
  if (websiteApp) return websiteApp;
  const existing = getApps().find(a => a.name === 'website');
  if (existing) return (websiteApp = existing);
  return (websiteApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_WEBSITE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_WEBSITE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_WEBSITE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.FIREBASE_WEBSITE_STORAGE_BUCKET,
  }, 'website'));
}

export const websiteDb = () => getFirestore(getWebsiteApp());
export const websiteStorage = () => getStorage(getWebsiteApp());
```

For `admin-access.ts` additionally export:
```typescript
import { getDatabase } from 'firebase-admin/database';
export const accessRealtimeDb = () => getDatabase(getAccessApp());
```

For `admin-superadmin.ts` additionally export:
```typescript
import { getAuth } from 'firebase-admin/auth';
export const superadminAuth = () => getAuth(getSuperadminApp());
export const superadminDb = () => getFirestore(getSuperadminApp());
```

---

## Environment Variables

```env
# .env.local

# SuperAdmin — public (client-safe)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dgen-superadmin
NEXT_PUBLIC_FIREBASE_APP_ID=

# SuperAdmin — server only
FIREBASE_SUPERADMIN_PROJECT_ID=dgen-superadmin
FIREBASE_SUPERADMIN_CLIENT_EMAIL=
FIREBASE_SUPERADMIN_PRIVATE_KEY=

# Website — server only
FIREBASE_WEBSITE_PROJECT_ID=dgen-website
FIREBASE_WEBSITE_CLIENT_EMAIL=
FIREBASE_WEBSITE_PRIVATE_KEY=
FIREBASE_WEBSITE_STORAGE_BUCKET=

# Access — server only
FIREBASE_ACCESS_PROJECT_ID=dgen-access
FIREBASE_ACCESS_CLIENT_EMAIL=
FIREBASE_ACCESS_PRIVATE_KEY=
FIREBASE_ACCESS_DATABASE_URL=

# Books — server only
FIREBASE_BOOKS_PROJECT_ID=dgen-books
FIREBASE_BOOKS_CLIENT_EMAIL=
FIREBASE_BOOKS_PRIVATE_KEY=

# Email
RESEND_API_KEY=
EMAIL_FROM=noreply@dgentechnologies.com

# Auth
SESSION_COOKIE_NAME=dgen_superadmin_session
SESSION_EXPIRY_DAYS=5
```

**Never add `NEXT_PUBLIC_` to any service account variable.**

When setting `FIREBASE_*_PRIVATE_KEY` in Vercel dashboard: paste the raw PEM string directly. The `.replace(/\\n/g, '\n')` handles the local `.env.local` single-line escaped format only.

---

## Auth System

### Session creation (`app/api/auth/session/route.ts`)

```typescript
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { superadminAuth, superadminDb } from '@/lib/firebase/admin-superadmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

    const decoded = await superadminAuth().verifyIdToken(idToken);

    // Only registered superadmins may proceed
    const adminDoc = await superadminDb().collection('superadmin-users').doc(decoded.uid).get();
    if (!adminDoc.exists) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await superadminAuth().createSessionCookie(idToken, { expiresIn });

    cookies().set(process.env.SESSION_COOKIE_NAME!, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: expiresIn / 1000,
      path: '/',
    });

    await superadminDb().collection('audit-logs').add({
      type: 'login',
      adminUid: decoded.uid,
      adminEmail: decoded.email,
      timestamp: FieldValue.serverTimestamp(),
      ip: req.headers.get('x-forwarded-for') ?? 'unknown',
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}

export async function DELETE() {
  cookies().delete(process.env.SESSION_COOKIE_NAME!);
  return NextResponse.json({ success: true });
}
```

### Session verification helper (`lib/auth/verify-session.ts`)

```typescript
import { cookies } from 'next/headers';
import { superadminAuth } from '@/lib/firebase/admin-superadmin';

export interface AdminSession { uid: string; email: string; }

export async function verifySession(): Promise<AdminSession | null> {
  try {
    const cookie = cookies().get(process.env.SESSION_COOKIE_NAME!)?.value;
    if (!cookie) return null;
    const decoded = await superadminAuth().verifySessionCookie(cookie, true);
    return { uid: decoded.uid, email: decoded.email! };
  } catch {
    return null;
  }
}
```

### Middleware (`middleware.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const cookie = req.cookies.get(process.env.SESSION_COOKIE_NAME ?? 'dgen_superadmin_session');
  const isDashboard = req.nextUrl.pathname.startsWith('/dashboard');
  const isLogin = req.nextUrl.pathname === '/login';
  if (isDashboard && !cookie) return NextResponse.redirect(new URL('/login', req.url));
  if (isLogin && cookie) return NextResponse.redirect(new URL('/dashboard', req.url));
  return NextResponse.next();
}

export const config = { matcher: ['/dashboard/:path*', '/login'] };
```

> Middleware checks cookie presence only (performance). Full cryptographic verification happens inside each API route via `verifySession()`.

---

## Standard API Route Template

Every route must follow this exact pattern. No exceptions:

```typescript
import { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/verify-session';
import { apiSuccess, apiError } from '@/lib/utils/api-response';

export async function GET(req: NextRequest) {
  // 1. Auth — ALWAYS first line
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  try {
    // 2. Parse params
    // 3. Query Firebase
    // 4. Transform and return
    return apiSuccess(data);
  } catch (err) {
    console.error('[module/resource]', err);
    return apiError('Internal server error', 500);
  }
}
```

### Response helpers (`lib/utils/api-response.ts`)

```typescript
import { NextResponse } from 'next/server';
export const apiSuccess = <T>(data: T, status = 200) =>
  NextResponse.json({ success: true, data }, { status });
export const apiError = (message: string, status: number) =>
  NextResponse.json({ success: false, error: message }, { status });
```

---

## Key Route Implementations

### Assign Intern + Email (`app/api/website/applications/[id]/assign/route.ts`)

```typescript
import { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/verify-session';
import { websiteDb } from '@/lib/firebase/admin-website';
import { superadminDb } from '@/lib/firebase/admin-superadmin';
import { apiSuccess, apiError } from '@/lib/utils/api-response';
import { sendEmail } from '@/lib/email/send-email';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

const Schema = z.object({
  employeeId: z.string().min(1),
  employeeName: z.string().min(1),
  employeeEmail: z.string().email(),
  note: z.string().optional(),
  startDate: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) return apiError(parsed.error.errors[0].message, 400);

  const { employeeId, employeeName, employeeEmail, note, startDate } = parsed.data;

  try {
    const appRef = websiteDb().collection('applications').doc(params.id);
    const appDoc = await appRef.get();
    if (!appDoc.exists) return apiError('Application not found', 404);
    const app = appDoc.data()!;

    await appRef.update({
      status: 'assigned',
      assignedTo: { employeeId, employeeName, employeeEmail },
      assignedAt: FieldValue.serverTimestamp(),
      assignedBy: session.uid,
    });

    await sendEmail({
      to: employeeEmail,
      subject: `Intern Assignment — ${app.applicantName}`,
      html: `<p>Hi ${employeeName},</p>
             <p>Intern <strong>${app.applicantName}</strong> (${app.applicantEmail}) has been assigned to work under you for the role of <strong>${app.roleApplied}</strong>.</p>
             ${startDate ? `<p>Start Date: ${startDate}</p>` : ''}
             ${note ? `<p>Note from Admin: ${note}</p>` : ''}
             <p>Please reach out to coordinate onboarding.</p>
             <p>— Dgen Technologies SuperAdmin</p>`,
    });

    await superadminDb().collection('audit-logs').add({
      type: 'intern_assigned', applicationId: params.id,
      assignedTo: employeeId, performedBy: session.uid,
      timestamp: FieldValue.serverTimestamp(),
    });

    return apiSuccess({ message: 'Intern assigned and employee notified' });
  } catch (err) {
    console.error('[website/applications/assign]', err);
    return apiError('Failed to assign intern', 500);
  }
}
```

### Ban Employee (`app/api/access/employees/[id]/ban/route.ts`)

```typescript
import { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/verify-session';
import { accessDb } from '@/lib/firebase/admin-access';
import { superadminDb } from '@/lib/firebase/admin-superadmin';
import { apiSuccess, apiError } from '@/lib/utils/api-response';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

const Schema = z.object({ reason: z.string().min(5) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) return apiError('Reason must be at least 5 characters', 400);

  try {
    const ref = accessDb().collection('employees').doc(params.id);
    const doc = await ref.get();
    if (!doc.exists) return apiError('Employee not found', 404);

    await ref.update({
      status: 'banned',
      banReason: parsed.data.reason,
      bannedAt: FieldValue.serverTimestamp(),
      bannedBy: session.uid,
    });

    await superadminDb().collection('audit-logs').add({
      type: 'employee_banned', targetId: params.id,
      targetName: doc.data()?.name, reason: parsed.data.reason,
      performedBy: session.uid, timestamp: FieldValue.serverTimestamp(),
    });

    return apiSuccess({ message: 'Employee banned' });
  } catch (err) {
    console.error('[access/employees/ban]', err);
    return apiError('Failed to ban employee', 500);
  }
}
```

### Remote Unlock (`app/api/access/unlock/route.ts`)

The ESP32 firmware polls Firebase Realtime Database for unlock commands.

```typescript
import { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/verify-session';
import { accessRealtimeDb } from '@/lib/firebase/admin-access';
import { superadminDb } from '@/lib/firebase/admin-superadmin';
import { apiSuccess, apiError } from '@/lib/utils/api-response';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  try {
    await accessRealtimeDb().ref('access_control/remote_unlock').set({
      command: 'unlock',
      triggeredBy: session.uid,
      timestamp: Date.now(),
      expiresAt: Date.now() + 10000, // 10-second unlock window
    });

    await superadminDb().collection('audit-logs').add({
      type: 'remote_unlock', performedBy: session.uid,
      timestamp: FieldValue.serverTimestamp(),
    });

    return apiSuccess({ message: 'Unlock command sent' });
  } catch (err) {
    console.error('[access/unlock]', err);
    return apiError('Failed to send unlock command', 500);
  }
}
```

---

## Email Service (`lib/email/send-email.ts`)

```typescript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY!);

interface EmailPayload { to: string | string[]; subject: string; html: string; from?: string; }

export async function sendEmail({ to, subject, html, from }: EmailPayload) {
  const { error } = await resend.emails.send({
    from: from ?? process.env.EMAIL_FROM!,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  });
  if (error) throw new Error(`Email failed: ${error.message}`);
}
```

---

## Firestore Security Rules

### `firestore-rules/superadmin.rules`
```raw
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false; // Admin SDK only
    }
  }
}
```

### `firestore-rules/website.rules`
```raw
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /posts/{id} { allow read: if true; allow write: if false; }
    match /careers/{id} { allow read: if true; allow write: if false; }
    match /messages/{id} {
      allow create: if request.resource.data.keys().hasAll(['name','email','message']);
      allow read, update, delete: if false;
    }
    match /applications/{id} {
      allow create: if request.resource.data.keys().hasAll(['applicantName','applicantEmail','roleApplied'])
        && request.resource.data.status == 'pending';
      allow read, update, delete: if false;
    }
  }
}
```

### `firestore-rules/access.rules`
```raw
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /employees/{id} {
      allow read: if request.auth != null
        && get(/databases/$(database)/documents/employees/$(request.auth.uid)).data.status == 'active';
      allow write: if false;
    }
    match /access_logs/{id} {
      allow create: if request.auth != null;
      allow read, update, delete: if false;
    }
  }
}
```

### `firestore-rules/books.rules`
```raw
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} { allow read, write: if false; }
  }
}
```

### Realtime Database Rules (DgenAccess)
```json
{
  "rules": {
    "access_control": {
      "remote_unlock": {
        ".read": "auth != null && auth.token.device == true",
        ".write": false
      }
    }
  }
}
```

---

## Seed Script (`scripts/seed-superadmin.ts`)

Run once to bootstrap the first admin:
```bash
npx ts-node --env-file=.env.local scripts/seed-superadmin.ts
```
```typescript
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const app = initializeApp({ credential: cert({
  projectId: process.env.FIREBASE_SUPERADMIN_PROJECT_ID!,
  clientEmail: process.env.FIREBASE_SUPERADMIN_CLIENT_EMAIL!,
  privateKey: process.env.FIREBASE_SUPERADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n'),
})});

async function seed() {
  const auth = getAuth(app);
  const db = getFirestore(app);
  const email = 'tirtha@dgentechnologies.com';
  const user = await auth.createUser({ email, password: 'ChangeThisImmediately!' });
  await db.collection('superadmin-users').doc(user.uid).set({
    email, name: 'Tirthankar', role: 'super_admin', createdAt: new Date(),
  });
  console.log('Done. Change the password immediately.');
  process.exit(0);
}
seed().catch(console.error);
```

---

## Vercel Config (`vercel.json`)

```json
{
  "functions": { "app/api/**": { "maxDuration": 30 } },
  "headers": [{
    "source": "/api/(.*)",
    "headers": [
      { "key": "X-Content-Type-Options", "value": "nosniff" },
      { "key": "X-Frame-Options", "value": "DENY" },
      { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
    ]
  }]
}
```

---

## Package Install

```bash
npm install firebase firebase-admin resend zod
npm install -D @types/node typescript vitest
```

---

## Security Checklist — ChatGPT Review Criteria

- [ ] `verifySession()` is the **first line** of every route handler
- [ ] All `process.env` accessed with `!` — fail loudly if missing
- [ ] All inputs validated with Zod before any Firebase call
- [ ] No service account files committed to repo — env vars only
- [ ] No `NEXT_PUBLIC_` on server-only credentials
- [ ] All Firestore writes use `FieldValue.serverTimestamp()`
- [ ] All destructive actions write an audit log to SuperAdmin Firestore
- [ ] Remote unlock includes `expiresAt` timestamp
- [ ] All responses use `apiSuccess` / `apiError` helpers
- [ ] `console.error` always includes `[module/action]` prefix
- [ ] Zero `any` TypeScript types
- [ ] Firestore rules deployed to all four projects before testing

---

## Task Execution Order

1. Check `TodoRead` for current state
2. Use `Glob("**/*.ts")` + `LS` to map existing files
3. `lib/firebase/admin-superadmin.ts`
4. `lib/firebase/admin-website.ts`
5. `lib/firebase/admin-access.ts` (+ Realtime DB)
6. `lib/firebase/admin-books.ts`
7. `lib/auth/verify-session.ts`
8. `lib/utils/api-response.ts`
9. `lib/email/send-email.ts`
10. `app/api/auth/session/route.ts`
11. `middleware.ts`
12. **Test auth end-to-end with `Bash("npm run dev")` before proceeding**
13. Implement feature routes: website → access → books
14. Write all four `firestore-rules/*.rules` files
15. `scripts/seed-superadmin.ts`
16. `vercel.json`
17. `TodoWrite` final status