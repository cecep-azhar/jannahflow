import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export async function GET() {
  try {
    const { stdout, stderr } = await execAsync('npx drizzle-kit push', { cwd: process.cwd() });
    return NextResponse.json({ success: true, stdout, stderr });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
