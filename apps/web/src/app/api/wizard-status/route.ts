import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

/**
 * Wizard de Socios — Shared Status & Answers Store
 * 
 * GET  → Returns { socios: { [id]: { done, step, answers, updatedAt } }, deadline, report, agreements }
 * POST → Saves a socio's status/answers: { socioId, step, answers }
 *        Or saves shared data: { type: 'deadline'|'report'|'agreement', value }
 */

const DATA_DIR = join(process.cwd(), '.data');
const FILE = join(DATA_DIR, 'wizard-socios.json');

interface WizardData {
  socios: Record<string, {
    done: boolean;
    step: string;
    answers: Record<string, any>;
    updatedAt: string;
  }>;
  deadline: number | null;
  report: string | null;
  agreements: Record<string, boolean>;
}

async function load(): Promise<WizardData> {
  try {
    const raw = await readFile(FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { socios: {}, deadline: null, report: null, agreements: {} };
  }
}

async function persist(data: WizardData) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  const data = await load();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const data = await load();

  // Save socio answers
  if (body.socioId && body.step) {
    data.socios[body.socioId] = {
      done: ['r3done', 'waiting', 'final'].includes(body.step),
      step: body.step,
      answers: body.answers || {},
      updatedAt: new Date().toISOString(),
    };
  }

  // Save deadline
  if (body.type === 'deadline' && typeof body.value === 'number') {
    data.deadline = body.value;
  }

  // Save report
  if (body.type === 'report' && typeof body.value === 'string') {
    data.report = body.value;
  }

  // Save agreement
  if (body.type === 'agreement' && body.socioId) {
    data.agreements[body.socioId] = !!body.value;
  }

  // Reset all
  if (body.type === 'reset') {
    data.socios = {};
    data.deadline = null;
    data.report = null;
    data.agreements = {};
  }

  await persist(data);
  return NextResponse.json({ ok: true, data });
}
