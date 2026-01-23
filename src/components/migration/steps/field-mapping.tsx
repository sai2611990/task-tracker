'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles } from 'lucide-react';
import { FieldMapping, JIRA_FIELD_MAPPINGS, TARGET_TABLES } from '@/types/migration';

interface FieldMappingStepProps {
  sourceFields: string[];
  onMappingChange: (mappings: FieldMapping[]) => void;
  initialMappings: FieldMapping[];
}

const allTargetFields = Object.entries(TARGET_TABLES).flatMap(([table, fields]) =>
  fields.map((field) => ({ table, field, label: `${table}.${field}` }))
);

function autoMap(sourceField: string): { target: string; table: string; confidence: number } | null {
  const lower = sourceField.toLowerCase();

  const jiraMapping = JIRA_FIELD_MAPPINGS[lower];
  if (jiraMapping) {
    return { target: jiraMapping.target, table: jiraMapping.table, confidence: 100 };
  }

  for (const [table, fields] of Object.entries(TARGET_TABLES)) {
    const exact = fields.find((f) => f.toLowerCase() === lower);
    if (exact) return { target: exact, table, confidence: 95 };
  }

  const aliases: Record<string, { target: string; table: string }> = {
    'name': { target: 'title', table: 'timeline_tasks' },
    'title': { target: 'title', table: 'timeline_tasks' },
    'desc': { target: 'description', table: 'timeline_tasks' },
    'due': { target: 'due_date', table: 'timeline_tasks' },
    'deadline': { target: 'due_date', table: 'timeline_tasks' },
    'owner': { target: 'assigned_to', table: 'timeline_tasks' },
    'team': { target: 'department_id', table: 'timeline_tasks' },
  };

  if (aliases[lower]) {
    return { ...aliases[lower], confidence: 80 };
  }

  return null;
}

export function FieldMappingStep({ sourceFields, onMappingChange, initialMappings }: FieldMappingStepProps) {
  const [mappings, setMappings] = useState<FieldMapping[]>(initialMappings);

  useEffect(() => {
    if (initialMappings.length === 0 && sourceFields.length > 0) {
      const autoMappings: FieldMapping[] = [];
      for (const field of sourceFields) {
        const mapped = autoMap(field);
        if (mapped) {
          autoMappings.push({
            sourceField: field,
            targetField: mapped.target,
            targetTable: mapped.table,
            transformation: 'none',
            confidence: mapped.confidence,
          });
        }
      }
      setMappings(autoMappings);
      onMappingChange(autoMappings);
    }
  }, [sourceFields, initialMappings.length, onMappingChange]);

  const updateMapping = (sourceField: string, targetValue: string) => {
    const [table, field] = targetValue.split('.');
    const newMappings = [...mappings];
    const idx = newMappings.findIndex((m) => m.sourceField === sourceField);

    if (targetValue === 'skip') {
      if (idx >= 0) newMappings.splice(idx, 1);
    } else if (idx >= 0) {
      newMappings[idx] = { ...newMappings[idx], targetTable: table, targetField: field };
    } else {
      newMappings.push({
        sourceField,
        targetField: field,
        targetTable: table,
        transformation: 'none',
      });
    }

    setMappings(newMappings);
    onMappingChange(newMappings);
  };

  const getMapping = (sourceField: string) => {
    const m = mappings.find((m) => m.sourceField === sourceField);
    return m ? `${m.targetTable}.${m.targetField}` : '';
  };

  const getConfidence = (sourceField: string) => {
    return mappings.find((m) => m.sourceField === sourceField)?.confidence;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-yellow-500" />
        <p className="text-sm text-muted-foreground">
          Auto-mapped {mappings.length} of {sourceFields.length} fields. Adjust as needed.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex justify-between">
            <span>Source Field</span>
            <span>Target Field</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-80 overflow-y-auto">
          {sourceFields.map((field) => {
            const confidence = getConfidence(field);
            return (
              <div key={field} className="flex items-center gap-4">
                <div className="flex-1 flex items-center gap-2">
                  <span className="font-mono text-sm">{field}</span>
                  {confidence && (
                    <Badge variant={confidence >= 90 ? 'default' : 'secondary'} className="text-xs">
                      {confidence}%
                    </Badge>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <Select value={getMapping(field) || 'skip'} onValueChange={(v) => updateMapping(field, v)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Skip field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skip">Skip field</SelectItem>
                    {allTargetFields.map((t) => (
                      <SelectItem key={t.label} value={t.label}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        {mappings.length} fields will be imported.
      </p>
    </div>
  );
}
