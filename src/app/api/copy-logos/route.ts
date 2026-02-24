import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const src = path.join(process.cwd(), 'src', 'app', 'logo');
    const projects = [
      '../jannahflow-compro',
      '../jannahflow-landing',
      '../jannahflow-license'
    ];

    projects.forEach(project => {
      const dest = path.join(process.cwd(), project, 'logo');
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      const files = fs.readdirSync(src);
      files.forEach(file => {
        fs.copyFileSync(path.join(src, file), path.join(dest, file));
      });
    });

    return NextResponse.json({ success: true, message: 'Logos copied successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
