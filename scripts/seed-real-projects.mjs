#!/usr/bin/env node
/**
 * Seed real E2/Engineering Square projects into TaskTracker
 * Uses Supabase admin client (service role) to bypass RLS
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://zlgxekqrlgblgsquvvek.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_FS7xO1kdSmHDGe8qUPSk-w_55kphQwW',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ──────────────────────────────────────────────
// STEP 1: Get org ID
// ──────────────────────────────────────────────
async function getOrgId() {
  const { data } = await supabase.from('organizations').select('id, name').limit(1).single();
  if (!data) throw new Error('No organization found. Please sign in to the app first.');
  console.log(`  Org: ${data.name} (${data.id})`);
  return data.id;
}

// ──────────────────────────────────────────────
// STEP 2: Upsert companies
// ──────────────────────────────────────────────
const COMPANIES = [
  { name: 'Engineering Square', industry: 'Technology / Software Consulting', color: '#3B82F6' },
  { name: 'NovaCube', industry: 'Smart Workspaces / Hardware', color: '#CFFF4B' },
  { name: 'E2 Operations', industry: 'Business Operations / Finance', color: '#F59E0B' },
];

async function seedCompanies(orgId) {
  const companyIds = {};
  for (const co of COMPANIES) {
    // Check if exists
    const { data: existing } = await supabase
      .from('companies')
      .select('id')
      .eq('name', co.name)
      .eq('organization_id', orgId)
      .maybeSingle();

    if (existing) {
      companyIds[co.name] = existing.id;
      console.log(`  Company exists: ${co.name} (${existing.id})`);
    } else {
      const { data, error } = await supabase
        .from('companies')
        .insert({ ...co, organization_id: orgId })
        .select('id')
        .single();
      if (error) throw error;
      companyIds[co.name] = data.id;
      console.log(`  Created company: ${co.name} (${data.id})`);
    }
  }
  return companyIds;
}

// ──────────────────────────────────────────────
// STEP 3: Upsert departments
// ──────────────────────────────────────────────
const DEPARTMENTS = {
  'Engineering Square': [
    { name: 'Engineering', color: '#6366F1' },
    { name: 'Product', color: '#8B5CF6' },
    { name: 'DevOps / Infrastructure', color: '#EC4899' },
    { name: 'Sales & BD', color: '#10B981' },
    { name: 'HR', color: '#F97316' },
    { name: 'Finance & Accounting', color: '#EAB308' },
  ],
  'NovaCube': [
    { name: 'Product & Design', color: '#CFFF4B' },
    { name: 'Hardware Engineering', color: '#22D3EE' },
    { name: 'Software Engineering', color: '#6366F1' },
    { name: 'Operations & Deployment', color: '#F97316' },
    { name: 'Sales & Partnerships', color: '#10B981' },
    { name: 'Finance', color: '#EAB308' },
  ],
  'E2 Operations': [
    { name: 'Banking & Treasury', color: '#3B82F6' },
    { name: 'Tax & Compliance', color: '#EF4444' },
    { name: 'Subscriptions & Vendors', color: '#F59E0B' },
    { name: 'Payroll (Justworks)', color: '#8B5CF6' },
    { name: 'Insurance', color: '#6B7280' },
  ],
};

async function seedDepartments(companyIds, orgId) {
  const deptIds = {};
  for (const [companyName, depts] of Object.entries(DEPARTMENTS)) {
    const companyId = companyIds[companyName];
    if (!companyId) continue;
    for (const dept of depts) {
      const key = `${companyName}::${dept.name}`;
      const { data: existing } = await supabase
        .from('departments')
        .select('id')
        .eq('name', dept.name)
        .eq('company_id', companyId)
        .maybeSingle();

      if (existing) {
        deptIds[key] = existing.id;
      } else {
        const { data, error } = await supabase
          .from('departments')
          .insert({ ...dept, company_id: companyId, organization_id: orgId })
          .select('id')
          .single();
        if (error) throw error;
        deptIds[key] = data.id;
      }
    }
    console.log(`  Departments for ${companyName}: ${depts.length} ready`);
  }
  return deptIds;
}

// ──────────────────────────────────────────────
// STEP 4: Create projects with full details
// ──────────────────────────────────────────────
function getProjects(companyIds, deptIds) {
  return [
    // ─── Engineering Square Projects ───
    {
      name: 'Adaptive Software Platform',
      description: 'AI-native OS that seeds into one business process and grows to replace 50+ SaaS tools. Seed → Root → Tree architecture. Next.js 15 + React 19 + TypeScript + Tailwind + Drizzle/PostgreSQL. Two-tier UI: business users (clean SaaS) vs IT admins (Interstellar/TARS cinematic). Located at ~/Desktop/AI_Strategy_Research/franchise-platform/',
      company_id: companyIds['Engineering Square'],
      department_id: deptIds['Engineering Square::Engineering'],
      status: 'active',
      start_date: '2025-06-01',
      end_date: '2026-12-31',
    },
    {
      name: 'Korber WMS',
      description: 'Warehouse Management System built for Korber. React + Node.js + PostgreSQL. Modules: Dashboard, Inventory, Receiving, Picking (5 methods), Shipping. Located at ~/Desktop/korber-wms/. Run: cd client && npm run dev → http://localhost:3000',
      company_id: companyIds['Engineering Square'],
      department_id: deptIds['Engineering Square::Engineering'],
      status: 'completed',
      start_date: '2024-01-01',
      end_date: '2024-12-31',
    },
    {
      name: 'GS Quant Strategy — REVERT-α',
      description: 'Quantitative trading strategy: statistical mean reversion on US mid-cap equities ($1B–$20B) with regime-adaptive filtering. Capital: $50K starting, scalable to ~$500K. Signal: Composite NMRS = Z-score (50%) + RSI(2) (30%) + Volume spike (20%). Regime filter: SMA 50/200 + VIX gating. Holding: 2–10 days. Target: 18–25% CAGR, Sharpe 1.0–1.5. Tech: Python + Interactive Brokers API + Polygon.io/yfinance. Status: strategy memo complete, needs backtesting engine.',
      company_id: companyIds['Engineering Square'],
      department_id: deptIds['Engineering Square::Product'],
      status: 'planning',
      start_date: '2026-02-01',
      end_date: '2026-06-30',
    },
    {
      name: 'AWS → Hetzner Migration',
      description: 'Migrate all infrastructure from AWS to Hetzner dedicated server (AMD Ryzen 9 7950X3D, 192GB RAM, 3x 1.92TB NVMe). Stack: Caddy + Docker + PostgreSQL + Cloudflare + Prometheus/Grafana. Savings: ~$1,300-1,400/mo (~$16K/year). Runbook + 10 config files at ~/Desktop/E2/hetzner-migration/. Research complete.',
      company_id: companyIds['Engineering Square'],
      department_id: deptIds['Engineering Square::DevOps / Infrastructure'],
      status: 'planning',
      start_date: '2026-01-15',
      end_date: '2026-04-30',
    },
    {
      name: 'Task Tracker Pro',
      description: 'Multi-company task management system for CEO managing multiple companies. Timeline-focused with weekly/monthly views. Next.js + Supabase + Tailwind + shadcn/ui. Features: department targets, checkpoints, AI assistant, Jira/CSV import. Located at ~/projects/task-tracker/',
      company_id: companyIds['Engineering Square'],
      department_id: deptIds['Engineering Square::Engineering'],
      status: 'active',
      start_date: '2026-01-01',
      end_date: '2026-06-30',
    },

    // ─── NovaCube Projects ───
    {
      name: 'NovaCube Website',
      description: 'Marketing website for NovaCube intelligent meeting studios. Next.js + Turbopack + React + Tailwind. Dark theme with green accent (#CFFF4B). Heavy scroll animations, aurora backgrounds. Currently on AWS EC2 (44.222.213.170:5173) — needs migration to Hetzner with proper production setup. Pages: Explore, Platform, Locations, Blog, Partners, About, Contact.',
      company_id: companyIds['NovaCube'],
      department_id: deptIds['NovaCube::Software Engineering'],
      status: 'active',
      start_date: '2025-10-01',
      end_date: '2026-06-30',
    },
    {
      name: 'NovaCube Pod v2.0 Hardware',
      description: 'Second generation soundproof workspace pods. 7 pods deployed in 7 malls in 7 states (currently inactive due to hardware issues). Building v2.0 with improved acoustics, ventilation, and smart tech integration.',
      company_id: companyIds['NovaCube'],
      department_id: deptIds['NovaCube::Hardware Engineering'],
      status: 'active',
      start_date: '2026-01-01',
      end_date: '2026-09-30',
    },
    {
      name: 'NovaCube Business Planning',
      description: 'Pitch decks, financial models, investor materials for NovaCube. 7-entity structure. On-demand office pod rental network. Files at ~/Desktop/novacube/.',
      company_id: companyIds['NovaCube'],
      department_id: deptIds['NovaCube::Finance'],
      status: 'active',
      start_date: '2025-06-01',
      end_date: '2026-12-31',
    },

    // ─── E2 Operations Projects ───
    {
      name: 'Bank Transaction Analysis',
      description: 'Analysis of 14 bank accounts (3 Amex, 5 BofA, 6 Chase incl. 1 checking). Python scripts + interactive HTML dashboard. Jan 2025 — Feb 2026. Total CC spend: $457K. Found ~$2,768/mo ($33K/yr) in killable subscriptions. Overlap alerts: AI tools (OpenAI+Claude+Cursor), design tools (Adobe+Figma+Canva). Interest charges: $3,052 wasted. Files at ~/Desktop/E2 SBA/banking-analysis/',
      company_id: companyIds['E2 Operations'],
      department_id: deptIds['E2 Operations::Banking & Treasury'],
      status: 'active',
      start_date: '2026-02-26',
      end_date: '2026-03-31',
    },
    {
      name: 'Subscription Cleanup (Kill List)',
      description: 'Cancel/downgrade unnecessary recurring charges identified in bank analysis. Key targets: Cursor double-billing (~$3,500/yr savings), Figma double-billing (~$420/yr), OpenAI if migrated to Claude (~$670/yr), Salesforce AppExchange (~$12K/yr). Total killable: ~$33K/year. Also: pay down CC balances to eliminate $3,052/yr in interest, set up autopay to stop $1,965 in fees.',
      company_id: companyIds['E2 Operations'],
      department_id: deptIds['E2 Operations::Subscriptions & Vendors'],
      status: 'active',
      start_date: '2026-02-26',
      end_date: '2026-03-15',
    },
    {
      name: 'SBA Loan Documentation',
      description: 'SBA loan filing and documentation. Bank statements, tax returns, financial records. Working with banker on submission. Files at ~/Desktop/E2 SBA/',
      company_id: companyIds['E2 Operations'],
      department_id: deptIds['E2 Operations::Banking & Treasury'],
      status: 'active',
      start_date: '2025-12-01',
      end_date: '2026-04-30',
    },
    {
      name: 'Tax Filing 2025',
      description: 'Annual tax filing for Engineering Square entities. Files at ~/Desktop/E2 SBA/tax filing 2025/',
      company_id: companyIds['E2 Operations'],
      department_id: deptIds['E2 Operations::Tax & Compliance'],
      status: 'active',
      start_date: '2026-01-01',
      end_date: '2026-04-15',
    },
  ];
}

async function seedProjects(projects) {
  let created = 0, skipped = 0;
  for (const proj of projects) {
    const { data: existing } = await supabase
      .from('projects')
      .select('id')
      .eq('name', proj.name)
      .eq('company_id', proj.company_id)
      .maybeSingle();

    if (existing) {
      // Update existing
      await supabase.from('projects').update(proj).eq('id', existing.id);
      console.log(`  Updated: ${proj.name}`);
      skipped++;
    } else {
      const { error } = await supabase.from('projects').insert(proj);
      if (error) { console.error(`  ERROR: ${proj.name}:`, error.message); continue; }
      console.log(`  Created: ${proj.name}`);
      created++;
    }
  }
  console.log(`  Projects: ${created} created, ${skipped} updated`);
}

// ──────────────────────────────────────────────
// STEP 5: Create key tasks for each project
// ──────────────────────────────────────────────
async function seedTasks(companyIds) {
  // Get project IDs
  const { data: projects } = await supabase.from('projects').select('id, name, company_id');
  const projMap = {};
  for (const p of projects) projMap[p.name] = p.id;

  const tasks = [
    // Adaptive Software
    { title: 'Complete franchise portal MVP', project_id: projMap['Adaptive Software Platform'], status: 'in_progress', priority: 'high', due_date: '2026-04-30', is_checkpoint: true },
    { title: 'Build IT admin control center (TARS UI)', project_id: projMap['Adaptive Software Platform'], status: 'todo', priority: 'high', due_date: '2026-05-31' },
    { title: 'Implement Observer + Guardian agents', project_id: projMap['Adaptive Software Platform'], status: 'todo', priority: 'medium', due_date: '2026-06-30' },
    { title: 'App template marketplace (CRM, HRMS, etc.)', project_id: projMap['Adaptive Software Platform'], status: 'planning', priority: 'medium', due_date: '2026-08-31' },

    // GS Quant
    { title: 'Build backtesting engine (Python)', project_id: projMap['GS Quant Strategy — REVERT-α'], status: 'todo', priority: 'high', due_date: '2026-03-15' },
    { title: 'Historical data pipeline (Polygon.io)', project_id: projMap['GS Quant Strategy — REVERT-α'], status: 'todo', priority: 'high', due_date: '2026-03-01' },
    { title: 'Paper trading with Interactive Brokers', project_id: projMap['GS Quant Strategy — REVERT-α'], status: 'todo', priority: 'medium', due_date: '2026-04-15' },
    { title: 'Go live with $50K capital', project_id: projMap['GS Quant Strategy — REVERT-α'], status: 'todo', priority: 'urgent', due_date: '2026-06-01', is_checkpoint: true },

    // Hetzner Migration
    { title: 'Provision Hetzner server & base setup', project_id: projMap['AWS → Hetzner Migration'], status: 'todo', priority: 'high', due_date: '2026-03-01' },
    { title: 'Setup Docker + Caddy + PostgreSQL', project_id: projMap['AWS → Hetzner Migration'], status: 'todo', priority: 'high', due_date: '2026-03-15' },
    { title: 'Migrate NovaCube website from AWS', project_id: projMap['AWS → Hetzner Migration'], status: 'todo', priority: 'medium', due_date: '2026-03-31' },
    { title: 'Setup monitoring (Prometheus + Grafana)', project_id: projMap['AWS → Hetzner Migration'], status: 'todo', priority: 'medium', due_date: '2026-04-15' },
    { title: 'Decommission AWS instances', project_id: projMap['AWS → Hetzner Migration'], status: 'todo', priority: 'low', due_date: '2026-04-30', is_checkpoint: true },

    // Subscription Cleanup
    { title: 'Cancel Salesforce AppExchange ($12K/yr)', project_id: projMap['Subscription Cleanup (Kill List)'], status: 'todo', priority: 'urgent', due_date: '2026-03-01' },
    { title: 'Fix Cursor double-billing ($3,500/yr)', project_id: projMap['Subscription Cleanup (Kill List)'], status: 'todo', priority: 'urgent', due_date: '2026-03-01' },
    { title: 'Fix Figma double-billing ($420/yr)', project_id: projMap['Subscription Cleanup (Kill List)'], status: 'todo', priority: 'high', due_date: '2026-03-01' },
    { title: 'Evaluate OpenAI vs Claude — cancel one ($670/yr)', project_id: projMap['Subscription Cleanup (Kill List)'], status: 'todo', priority: 'high', due_date: '2026-03-05' },
    { title: 'Audit Atlassian seats ($5,795/yr)', project_id: projMap['Subscription Cleanup (Kill List)'], status: 'todo', priority: 'medium', due_date: '2026-03-10' },
    { title: 'Set up autopay on all CCs (stop $1,965 fees)', project_id: projMap['Subscription Cleanup (Kill List)'], status: 'todo', priority: 'high', due_date: '2026-03-05' },
    { title: 'Pay down CC balances (stop $3,052 interest)', project_id: projMap['Subscription Cleanup (Kill List)'], status: 'todo', priority: 'high', due_date: '2026-03-15' },

    // NovaCube Website
    { title: 'Migrate from AWS EC2 to Hetzner', project_id: projMap['NovaCube Website'], status: 'todo', priority: 'high', due_date: '2026-03-31' },
    { title: 'Setup novacube.io domain + SSL via Caddy', project_id: projMap['NovaCube Website'], status: 'todo', priority: 'high', due_date: '2026-03-31' },
    { title: 'Production build (stop running dev server)', project_id: projMap['NovaCube Website'], status: 'todo', priority: 'medium', due_date: '2026-03-15' },

    // NovaCube Pod v2.0
    { title: 'v2.0 design finalization', project_id: projMap['NovaCube Pod v2.0 Hardware'], status: 'in_progress', priority: 'high', due_date: '2026-04-30' },
    { title: 'Ventilation & HVAC redesign', project_id: projMap['NovaCube Pod v2.0 Hardware'], status: 'todo', priority: 'urgent', due_date: '2026-05-31' },
    { title: 'First v2.0 prototype build', project_id: projMap['NovaCube Pod v2.0 Hardware'], status: 'todo', priority: 'high', due_date: '2026-07-31', is_checkpoint: true },

    // Bank Transaction Analysis
    { title: 'Audit Amazon spending — split business vs personal', project_id: projMap['Bank Transaction Analysis'], status: 'todo', priority: 'medium', due_date: '2026-03-15' },
    { title: 'Verify Justworks headcount matches payroll', project_id: projMap['Bank Transaction Analysis'], status: 'todo', priority: 'medium', due_date: '2026-03-10' },
    { title: 'Review ICICI/Axis Bank wire transfers ($418K)', project_id: projMap['Bank Transaction Analysis'], status: 'todo', priority: 'high', due_date: '2026-03-10' },

    // Tax Filing
    { title: 'Gather all W-2s and 1099s', project_id: projMap['Tax Filing 2025'], status: 'in_progress', priority: 'high', due_date: '2026-03-01' },
    { title: 'File federal & state returns', project_id: projMap['Tax Filing 2025'], status: 'todo', priority: 'urgent', due_date: '2026-04-15', is_checkpoint: true },
  ];

  // Filter out tasks with no project_id (project didn't exist)
  const validTasks = tasks.filter(t => t.project_id);

  let created = 0;
  for (const task of validTasks) {
    const { data: existing } = await supabase
      .from('tasks')
      .select('id')
      .eq('title', task.title)
      .eq('project_id', task.project_id)
      .maybeSingle();

    if (!existing) {
      const { error } = await supabase.from('tasks').insert(task);
      if (error) { console.error(`  Task ERROR: ${task.title}:`, error.message); continue; }
      created++;
    }
  }
  console.log(`  Tasks: ${created} created (${validTasks.length - created} already existed)`);
}

// ──────────────────────────────────────────────
// RUN
// ──────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  Seeding Real Projects into TaskTracker');
  console.log('═══════════════════════════════════════════════\n');

  const orgId = await getOrgId();

  console.log('\n[1/4] Companies...');
  const companyIds = await seedCompanies(orgId);

  console.log('\n[2/4] Departments...');
  const deptIds = await seedDepartments(companyIds, orgId);

  console.log('\n[3/4] Projects...');
  const projects = getProjects(companyIds, deptIds);
  await seedProjects(projects);

  console.log('\n[4/4] Tasks...');
  await seedTasks(companyIds);

  console.log('\n═══════════════════════════════════════════════');
  console.log('  Done! Refresh http://localhost:3000');
  console.log('═══════════════════════════════════════════════');
}

main().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
