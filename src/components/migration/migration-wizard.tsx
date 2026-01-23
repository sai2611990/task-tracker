'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { WizardState, MigrationSourceType, JiraConfig, ParsedData, FieldMapping, JiraProject } from '@/types/migration';
import { SourceSelect } from './steps/source-select';
import { JiraConnect } from './steps/jira-connect';
import { FileUpload } from './steps/file-upload';
import { DataPreview } from './steps/data-preview';
import { FieldMappingStep } from './steps/field-mapping';
import { ReviewImport } from './steps/review-import';

const STEPS = ['Source', 'Connect', 'Preview', 'Mapping', 'Import'];

export function MigrationWizard() {
  const [state, setState] = useState<WizardState>({
    step: 0,
    sourceType: null,
    jiraConfig: null,
    fileData: null,
    selectedProjects: [],
    selectedIssues: [],
    fieldMappings: [],
    jobId: null,
  });

  const [jiraProjects, setJiraProjects] = useState<JiraProject[]>([]);
  const [jiraIssues, setJiraIssues] = useState<Record<string, unknown>[]>([]);
  const [jiraFields, setJiraFields] = useState<string[]>([]);

  const progress = ((state.step + 1) / STEPS.length) * 100;

  const canGoNext = () => {
    switch (state.step) {
      case 0: return state.sourceType !== null;
      case 1: return state.sourceType === 'jira-api' ? jiraProjects.length > 0 : state.fileData !== null;
      case 2: return state.sourceType === 'jira-api' ? jiraIssues.length > 0 : (state.fileData?.rows?.length ?? 0) > 0;
      case 3: return state.fieldMappings.length > 0;
      default: return true;
    }
  };

  const handleNext = () => {
    if (state.step < STEPS.length - 1 && canGoNext()) {
      setState((s) => ({ ...s, step: s.step + 1 }));
    }
  };

  const handleBack = () => {
    if (state.step > 0) {
      setState((s) => ({ ...s, step: s.step - 1 }));
    }
  };

  const handleSourceSelect = (type: MigrationSourceType) => {
    setState((s) => ({ ...s, sourceType: type }));
  };

  const handleJiraConnect = (config: JiraConfig, projects: JiraProject[]) => {
    setState((s) => ({ ...s, jiraConfig: config }));
    setJiraProjects(projects);
  };

  const handleFileUpload = (data: ParsedData) => {
    setState((s) => ({ ...s, fileData: data }));
  };

  const handleJiraFetch = (issues: Record<string, unknown>[], fields: string[]) => {
    setJiraIssues(issues);
    setJiraFields(fields);
  };

  const handleMappingChange = (mappings: FieldMapping[]) => {
    setState((s) => ({ ...s, fieldMappings: mappings }));
  };

  const getFields = () => {
    if (state.sourceType === 'jira-api') return jiraFields;
    return state.fileData?.fields || [];
  };

  const getData = () => {
    if (state.sourceType === 'jira-api') return jiraIssues;
    return state.fileData?.rows || [];
  };

  const renderStep = () => {
    switch (state.step) {
      case 0:
        return <SourceSelect selected={state.sourceType} onSelect={handleSourceSelect} />;
      case 1:
        return state.sourceType === 'jira-api' ? (
          <JiraConnect onConnect={handleJiraConnect} />
        ) : (
          <FileUpload onUpload={handleFileUpload} />
        );
      case 2:
        return (
          <DataPreview
            sourceType={state.sourceType!}
            jiraConfig={state.jiraConfig}
            projects={jiraProjects}
            fileData={state.fileData}
            onFetch={handleJiraFetch}
          />
        );
      case 3:
        return (
          <FieldMappingStep
            sourceFields={getFields()}
            onMappingChange={handleMappingChange}
            initialMappings={state.fieldMappings}
          />
        );
      case 4:
        return (
          <ReviewImport
            data={getData()}
            mappings={state.fieldMappings}
            sourceType={state.sourceType!}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Data Migration Wizard</span>
          <span className="text-sm font-normal text-muted-foreground">
            Step {state.step + 1} of {STEPS.length}: {STEPS[state.step]}
          </span>
        </CardTitle>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        {renderStep()}

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleBack} disabled={state.step === 0}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          {state.step < STEPS.length - 1 && (
            <Button onClick={handleNext} disabled={!canGoNext()}>
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
