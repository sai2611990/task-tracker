'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, ExternalLink } from 'lucide-react';
import { JiraConfig, JiraProject } from '@/types/migration';

interface JiraConnectProps {
  onConnect: (config: JiraConfig, projects: JiraProject[]) => void;
}

export function JiraConnect({ onConnect }: JiraConnectProps) {
  const [domain, setDomain] = useState('');
  const [email, setEmail] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [projectCount, setProjectCount] = useState(0);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/migration/jira/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, email, apiToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Connection failed');
      }

      setConnected(true);
      setProjectCount(data.projects.length);
      onConnect({ domain, email, apiToken }, data.projects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="domain">Jira Domain</Label>
          <Input
            id="domain"
            placeholder="your-company.atlassian.net"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            disabled={connected}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={connected}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="apiToken">API Token</Label>
          <Input
            id="apiToken"
            type="password"
            placeholder="Your Jira API token"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            disabled={connected}
          />
          <a
            href="https://id.atlassian.com/manage-profile/security/api-tokens"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:underline inline-flex items-center gap-1"
          >
            Get API token <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {connected && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700">
            Connected! Found {projectCount} projects.
          </AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleConnect}
        disabled={!domain || !email || !apiToken || loading || connected}
        className="w-full"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {connected ? 'Connected' : 'Test Connection'}
      </Button>
    </div>
  );
}
