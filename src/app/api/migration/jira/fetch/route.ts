import { NextRequest, NextResponse } from 'next/server';
import { Version3Client } from 'jira.js';
import { JiraIssue } from '@/types/migration';

export async function POST(request: NextRequest) {
  try {
    const { domain, email, apiToken, projectKeys, maxResults = 100 } = await request.json();

    if (!domain || !email || !apiToken) {
      return NextResponse.json(
        { error: 'Missing Jira credentials' },
        { status: 400 }
      );
    }

    const client = new Version3Client({
      host: `https://${domain}`,
      authentication: {
        basic: { email, apiToken },
      },
    });

    const jql = projectKeys?.length
      ? `project IN (${projectKeys.join(',')}) ORDER BY created DESC`
      : 'ORDER BY created DESC';

    const searchResult = await client.issueSearch.searchForIssuesUsingJql({
      jql,
      maxResults,
      fields: [
        'summary', 'description', 'status', 'priority',
        'assignee', 'duedate', 'created', 'updated',
        'issuetype', 'labels', 'components', 'project'
      ],
    });

    const issues: JiraIssue[] = (searchResult.issues || []).map((issue) => ({
      id: issue.id,
      key: issue.key,
      summary: issue.fields?.summary || '',
      description: issue.fields?.description?.toString() || '',
      status: issue.fields?.status?.name || '',
      priority: issue.fields?.priority?.name || '',
      assignee: issue.fields?.assignee?.displayName || '',
      dueDate: issue.fields?.duedate || '',
      created: issue.fields?.created || '',
      updated: issue.fields?.updated || '',
      issueType: issue.fields?.issuetype?.name || '',
      labels: issue.fields?.labels || [],
      components: issue.fields?.components?.map((c: { name?: string }) => c.name || '') || [],
      project: issue.fields?.project?.key || '',
    }));

    const fields = [
      'key', 'summary', 'description', 'status', 'priority',
      'assignee', 'dueDate', 'created', 'issueType', 'labels', 'components', 'project'
    ];

    return NextResponse.json({
      success: true,
      issues,
      fields,
      total: searchResult.total || issues.length,
    });
  } catch (error) {
    console.error('Jira fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Jira data' },
      { status: 500 }
    );
  }
}
