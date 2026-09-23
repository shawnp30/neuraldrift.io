// lib/benchmarks/validators.ts
// Objective validation engine for the NeuralDrift Local AI Benchmark Framework.

import type { ValidationReport, WorkloadDefinition } from './types';

export function validateBenchmarkOutput(
  workload: WorkloadDefinition,
  rawOutput: string,
  extraContext?: {
    toolCalls?: { name: string; arguments: Record<string, unknown> }[];
  }
): ValidationReport {
  const expected = workload.expectedResult;
  const actualText = (rawOutput || '').trim();

  switch (expected.type) {
    case 'json_schema': {
      try {
        // Extract JSON from markdown block if present
        const jsonMatch = actualText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, actualText];
        const jsonStr = (jsonMatch[1] || actualText).trim();
        const parsed = JSON.parse(jsonStr);

        const expSchema = expected.value as {
          required?: string[];
          expectedValues?: Record<string, unknown>;
        };

        const errors: string[] = [];
        if (expSchema.required) {
          for (const reqKey of expSchema.required) {
            if (!(reqKey in parsed)) {
              errors.push(`Missing required JSON key: "${reqKey}"`);
            }
          }
        }

        if (expSchema.expectedValues) {
          for (const [key, val] of Object.entries(expSchema.expectedValues)) {
            if (parsed[key] !== val) {
              errors.push(`Key "${key}" expected value ${JSON.stringify(val)}, got ${JSON.stringify(parsed[key])}`);
            }
          }
        }

        return {
          passed: errors.length === 0,
          validator: 'json_schema',
          actualOutput: jsonStr,
          expectedOutput: expected.value,
          details: errors.length === 0 ? 'All required JSON keys and values matched.' : errors.join('; '),
          errors: errors.length ? errors : undefined,
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          passed: false,
          validator: 'json_schema',
          actualOutput: actualText,
          expectedOutput: expected.value,
          details: `Failed to parse JSON: ${message}`,
          errors: [`Malformed JSON: ${message}`],
        };
      }
    }

    case 'tool_call': {
      const expTool = expected.value as {
        toolName: string;
        arguments?: Record<string, unknown>;
      };

      const calls = extraContext?.toolCalls || [];
      if (!calls.length) {
        return {
          passed: false,
          validator: 'tool_call',
          actualOutput: actualText || 'No tool calls generated',
          expectedOutput: expected.value,
          details: `Expected tool call "${expTool.toolName}", but model did not invoke any tools.`,
          errors: ['No tool call detected in model response.'],
        };
      }

      const matchingCall = calls.find((c) => c.name === expTool.toolName);
      if (!matchingCall) {
        return {
          passed: false,
          validator: 'tool_call',
          actualOutput: JSON.stringify(calls),
          expectedOutput: expected.value,
          details: `Expected tool "${expTool.toolName}", but received calls to: ${calls.map((c) => c.name).join(', ')}`,
          errors: [`Tool name mismatch: ${calls.map((c) => c.name).join(', ')}`],
        };
      }

      const errors: string[] = [];
      if (expTool.arguments) {
        for (const [argKey, argVal] of Object.entries(expTool.arguments)) {
          if (matchingCall.arguments[argKey] !== argVal) {
            errors.push(`Tool argument "${argKey}" expected ${JSON.stringify(argVal)}, got ${JSON.stringify(matchingCall.arguments[argKey])}`);
          }
        }
      }

      return {
        passed: errors.length === 0,
        validator: 'tool_call',
        actualOutput: JSON.stringify(matchingCall),
        expectedOutput: expected.value,
        details: errors.length === 0 ? `Successfully verified tool call "${expTool.toolName}".` : errors.join('; '),
        errors: errors.length ? errors : undefined,
      };
    }

    case 'contains_all': {
      const tokens = expected.value as string[];
      const missing = tokens.filter((tok) => !actualText.toLowerCase().includes(tok.toLowerCase()));
      return {
        passed: missing.length === 0,
        validator: 'contains_all',
        actualOutput: actualText,
        expectedOutput: expected.value,
        details: missing.length === 0 ? 'All required factual tokens found.' : `Missing required tokens: ${missing.join(', ')}`,
        errors: missing.length ? [`Missing: ${missing.join(', ')}`] : undefined,
      };
    }

    case 'exact_string': {
      const expStr = String(expected.value).trim();
      const passed = actualText === expStr;
      return {
        passed,
        validator: 'exact_string',
        actualOutput: actualText,
        expectedOutput: expStr,
        details: passed ? 'Exact string match.' : 'Output did not match expected string exactly.',
      };
    }

    case 'regex': {
      const pattern = new RegExp(String(expected.value));
      const passed = pattern.test(actualText);
      return {
        passed,
        validator: 'regex',
        actualOutput: actualText,
        expectedOutput: String(expected.value),
        details: passed ? 'Output matched regular expression.' : 'Output failed regular expression check.',
      };
    }

    default:
      return {
        passed: true,
        validator: 'fallback_presence',
        actualOutput: actualText,
        expectedOutput: expected.value,
        details: 'Custom or unclassified validator passed by default with non-empty output.',
      };
  }
}
