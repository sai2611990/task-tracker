import { NextRequest, NextResponse } from 'next/server';
import { Version3Client } from 'jira.js';

export async function POST(request: NextRequest) {
  try {
    const { domain, email, apiToken } = await request.json();

    if (!domain || !email || !apiToken) {
      return NextResponse.json(
        { error: 'Missing required fields: domain, email, apiToken' },
        { status: 400 }
      );
    }

    const client = new Version3Client({
      host: `https://${domain}`,
      authentication: {
        basic: { email, apiToken },
      },
    });

    const projects = await client.projects.searchProjects({ maxResults: 100 });

    const projectList = projects.values?.map((p) => ({
      id: p.id,
      key: p.key,
      name: p.name,
    })) || [];

    return NextResponse.json({
      success: true,
      message: 'Connected successfully',
      projects: projectList,
    });
  } catch (error) {
    console.error('Jira connection error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to Jira. Check your credentials.' },
      { status: 401 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
