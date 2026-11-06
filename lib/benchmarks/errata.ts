// lib/benchmarks/errata.ts
// Published corrections to recorded benchmark values. Evidence files are never rewritten: an erratum
// keeps the recorded value, states the defect and the correction method, and pages show both.

import errata from '@/data/benchmark-errata.json';
import type { BenchmarkRecord } from './types';

export interface Erratum {
  recordId: string;
  field: string;                 // Dotted path within the record
  recordedValue: unknown;
  correctedValue: unknown;
  correctedBasis: 'measured' | 'derived';
  issue: string;
  correctionMethod: string;
  recordedAt: string;
  invalidatesRecord?: boolean;  // The record does not implement what it names and is excluded from statistics
}

export const ERRATA = errata as Erratum[];

/** True when an erratum invalidates the whole record (kept visible, excluded from statistics). */
export function isInvalidated(recordId: string): boolean {
  return ERRATA.some((e) => e.recordId === recordId && e.invalidatesRecord);
}

export function errataFor(recordId: string): Erratum[] {
  return ERRATA.filter((e) => e.recordId === recordId);
}

export function readField(record: BenchmarkRecord, field: string): unknown {
  return field.split('.').reduce<unknown>((value, key) => (value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined), record);
}

/** The value to display for a field: the correction when an erratum exists, otherwise the record's own value. */
export function effectiveValue<T>(record: BenchmarkRecord, field: string): { value: T; erratum: Erratum | null } {
  const erratum = errataFor(record.id).find((e) => e.field === field) ?? null;
  return { value: (erratum ? erratum.correctedValue : readField(record, field)) as T, erratum };
}
