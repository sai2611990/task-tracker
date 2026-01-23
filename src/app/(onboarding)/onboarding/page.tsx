'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Building2, Users, CheckCircle } from 'lucide-react';

const STEPS = ['Organization', 'First Company', 'Complete'];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSetupOrg = async () => {
    if (!orgName.trim()) {
      setError('Organization name is required');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Get user's organization
      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (membership) {
        // Update organization name
        await supabase
          .from('organizations')
          .update({ name: orgName })
          .eq('id', membership.organization_id);
      }

      setStep(1);
    } catch (err) {
      setError('Failed to update organization');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompany = async () => {
    if (!companyName.trim()) {
      setError('Company name is required');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Get user's organization
      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (membership) {
        // Create first company
        await supabase.from('companies').insert({
          name: companyName,
          industry: companyIndustry || 'Technology',
          organization_id: membership.organization_id,
        });

        // Mark onboarding complete
        await supabase
          .from('profiles')
          .update({ onboarding_complete: true })
          .eq('id', user.id);
      }

      setStep(2);
    } catch (err) {
      setError('Failed to create company');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    router.push('/timeline');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
            T
          </div>
          <CardTitle>Welcome to TaskTracker</CardTitle>
          <CardDescription>
            Let's set up your workspace in a few simple steps
          </CardDescription>
          <div className="flex justify-center gap-2 mt-4">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={`h-2 w-16 rounded-full ${
                  i <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Building2 className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">Name your organization</p>
                  <p className="text-sm text-muted-foreground">
                    This is your workspace where you'll manage all your companies
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  placeholder="e.g., Acme Holdings, My Ventures"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button onClick={handleSetupOrg} disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continue
              </Button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">Add your first company</p>
                  <p className="text-sm text-muted-foreground">
                    You can add more companies later from the dashboard
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="e.g., NovaCube, Tech Solutions"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry (optional)</Label>
                <Input
                  id="industry"
                  placeholder="e.g., Technology, Finance, Healthcare"
                  value={companyIndustry}
                  onChange={(e) => setCompanyIndustry(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button onClick={handleAddCompany} disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Company
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-lg">You're all set!</p>
                <p className="text-muted-foreground">
                  Your workspace is ready. Start managing your tasks and teams.
                </p>
              </div>
              <Button onClick={handleComplete} className="w-full">
                Go to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
