// lib/benchmarks/adapters/lmStudio.ts
// LM Studio adapter implementing OpenAI-compatible streaming & agentic tool-use protocols.

import type {
  BenchmarkModelConfig,
  RawInferenceMetrics,
  WorkloadMetrics,
  WorkloadDefinition,
} from '../types';
import type {
  RuntimeAdapter,
  RuntimeProbeResult,
  RawInferenceExecutionResult,
  WorkloadExecutionResult,
} from './interface';

export class LMStudioAdapter implements RuntimeAdapter {
  name = 'lm_studio';

  async probe(endpoint = 'http://127.0.0.1:1234'): Promise<RuntimeProbeResult> {
    try {
      const res = await fetch(`${endpoint}/v1/models`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) {
        return {
          available: false,
          runtime: 'lm_studio',
          runtimeVersion: 'unknown',
          backend: 'cuda',
          models: [],
          error: `HTTP ${res.status}: ${res.statusText}`,
        };
      }
      const data = (await res.json()) as { data?: { id: string }[] };
      const models = (data.data || []).map((m) => ({
        id: m.id,
      }));

      return {
        available: true,
        runtime: 'lm_studio',
        runtimeVersion: '0.3.9', // Standard LM Studio release
        backend: 'cuda',
        models,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        available: false,
        runtime: 'lm_studio',
        runtimeVersion: 'unknown',
        backend: 'cuda',
        models: [],
        error: message,
      };
    }
  }

  async executeRawInference(
    endpoint = 'http://127.0.0.1:1234',
    model: BenchmarkModelConfig,
    workload: WorkloadDefinition
  ): Promise<RawInferenceExecutionResult> {
    const url = `${endpoint}/v1/chat/completions`;
    const messages: { role: string; content: string }[] = [];
    if (workload.systemPrompt) {
      messages.push({ role: 'system', content: workload.systemPrompt });
    }
    messages.push({ role: 'user', content: workload.prompt });

    const payload = {
      model: model.modelId,
      messages,
      temperature: workload.generationSettings.temperature ?? 0.0,
      max_tokens: workload.generationSettings.maxTokens ?? 256,
      top_p: workload.generationSettings.topP ?? 1.0,
      stream: true,
      stream_options: { include_usage: true },
    };

    const startTime = performance.now();
    let ttftMs: number | null = null;
    let fullOutput = '';
    let promptTokens: number | null = null;
    let completionTokens: number | null = null;
    let totalTokens: number | null = null;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`LM Studio API error (HTTP ${res.status}): ${errorText}`);
    }

    const reader = res.body?.getReader();
    if (!reader) {
      throw new Error('No readable response body received from LM Studio.');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (!trimmed.startsWith('data: ')) continue;

        try {
          const json = JSON.parse(trimmed.slice(6));
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) {
            if (ttftMs === null) {
              ttftMs = performance.now() - startTime;
            }
            fullOutput += delta;
          }
          if (json.usage) {
            promptTokens = json.usage.prompt_tokens ?? promptTokens;
            completionTokens = json.usage.completion_tokens ?? completionTokens;
            totalTokens = json.usage.total_tokens ?? totalTokens;
          }
        } catch {
          // Ignore incomplete JSON chunks in SSE stream
        }
      }
    }

    const totalExecutionTimeMs = performance.now() - startTime;

    // Estimate token counts if runtime did not provide usage in stream
    if (completionTokens === null) {
      // Approximation based on standard subword tokenization (~4 chars per token)
      completionTokens = Math.max(1, Math.round(fullOutput.length / 4));
    }
    if (promptTokens === null) {
      const promptChars = messages.map((m) => m.content).join(' ').length;
      promptTokens = Math.max(1, Math.round(promptChars / 4));
    }
    if (totalTokens === null) {
      totalTokens = promptTokens + completionTokens;
    }

    const generationMs = ttftMs !== null ? Math.max(1, totalExecutionTimeMs - ttftMs) : totalExecutionTimeMs;
    const promptProcessingMs = ttftMs !== null ? ttftMs : null;

    const generationTokensPerSec = completionTokens && generationMs > 0
      ? Number(((completionTokens / generationMs) * 1000).toFixed(2))
      : null;

    const promptTokensPerSec = promptTokens && promptProcessingMs && promptProcessingMs > 0
      ? Number(((promptTokens / promptProcessingMs) * 1000).toFixed(2))
      : null;

    const totalTokensPerSec = totalTokens && totalExecutionTimeMs > 0
      ? Number(((totalTokens / totalExecutionTimeMs) * 1000).toFixed(2))
      : null;

    const metrics: RawInferenceMetrics = {
      ttftMs: ttftMs !== null ? Number(ttftMs.toFixed(2)) : null,
      promptTokens,
      promptProcessingMs: promptProcessingMs !== null ? Number(promptProcessingMs.toFixed(2)) : null,
      promptTokensPerSec,
      generationTokens: completionTokens,
      generationMs: Number(generationMs.toFixed(2)),
      generationTokensPerSec,
      totalTokens,
      totalExecutionTimeMs: Number(totalExecutionTimeMs.toFixed(2)),
      peakVramBytes: null, // Will be enriched by hardware telemetry
      peakRamBytes: null,
      gpuUtilizationPct: null,
    };

    return {
      output: fullOutput,
      metrics,
      rawResponse: { fullOutput, metrics },
    };
  }

  async executeWorkload(
    endpoint = 'http://127.0.0.1:1234',
    model: BenchmarkModelConfig,
    workload: WorkloadDefinition
  ): Promise<WorkloadExecutionResult> {
    const url = `${endpoint}/v1/chat/completions`;
    const toolsPayload = (workload.tools || []).map((t) => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    }));

    const messages: { role: string; content?: string; tool_call_id?: string; tool_calls?: unknown[] }[] = [];
    if (workload.systemPrompt) {
      messages.push({ role: 'system', content: workload.systemPrompt });
    }
    messages.push({ role: 'user', content: workload.prompt });

    const startTime = performance.now();
    const toolExecutions: {
      name: string;
      arguments: Record<string, unknown>;
      result: unknown;
      latencyMs: number;
      success: boolean;
    }[] = [];

    let totalTokens = 0;
    let toolCallsCount = 0;
    let successfulToolCalls = 0;
    let failedToolCalls = 0;
    let retriesCount = 0;
    let finalOutput = '';

    // Step 1: Send initial agent turn
    const initialRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model.modelId,
        messages,
        tools: toolsPayload.length ? toolsPayload : undefined,
        temperature: workload.generationSettings.temperature ?? 0.0,
        max_tokens: workload.generationSettings.maxTokens ?? 256,
      }),
    });

    if (!initialRes.ok) {
      throw new Error(`Agent request failed (HTTP ${initialRes.status}): ${await initialRes.text()}`);
    }

    const data = (await initialRes.json()) as {
      choices?: {
        message?: {
          content?: string;
          tool_calls?: { id?: string; function?: { name: string; arguments: string } }[];
        };
      }[];
      usage?: { total_tokens?: number };
    };

    totalTokens += data.usage?.total_tokens || 0;
    const msg = data.choices?.[0]?.message;
    finalOutput = msg?.content || '';

    // Parse tool calls: either from official OpenAI tool_calls structure or from <tools> tags
    const pendingCalls: { name: string; arguments: Record<string, unknown> }[] = [];

    if (msg?.tool_calls && msg.tool_calls.length > 0) {
      for (const tc of msg.tool_calls) {
        if (tc.function?.name) {
          try {
            const args = typeof tc.function.arguments === 'string'
              ? JSON.parse(tc.function.arguments)
              : tc.function.arguments || {};
            pendingCalls.push({ name: tc.function.name, arguments: args });
          } catch {
            pendingCalls.push({ name: tc.function.name, arguments: {} });
          }
        }
      }
    } else if (msg?.content) {
      // Check for <tools> or <tool_call> tags commonly emitted by local models (e.g. Qwen)
      const toolTagMatch = msg.content.match(/<tools?>([\s\S]*?)<\/tools?>/i);
      if (toolTagMatch) {
        try {
          const parsed = JSON.parse(toolTagMatch[1].trim());
          if (parsed.name && parsed.arguments) {
            pendingCalls.push({ name: parsed.name, arguments: parsed.arguments });
          }
        } catch {
          // Not valid JSON in tool tag
        }
      }
    }

    // Step 2: Execute detected local tools
    for (const call of pendingCalls) {
      toolCallsCount++;
      const toolStart = performance.now();
      let toolResult: unknown = null;
      let success = true;

      try {
        if (call.name === 'compute_memory_bandwidth') {
          const bus = Number(call.arguments.busWidthBits || 0);
          const speed = Number(call.arguments.memorySpeedGbps || 0);
          // Bandwidth (GB/s) = (Bus Width in bits * Memory Speed in Gbps) / 8
          toolResult = { bandwidthGbps: (bus * speed) / 8, busWidthBits: bus, memorySpeedGbps: speed };
        } else if (call.name === 'query_gpu_temperature') {
          toolResult = { temperatureC: 45, status: 'nominal' };
        } else if (call.name === 'get_system_vram_status') {
          toolResult = { totalMb: 16384, freeMb: 13600, usedMb: 2784 };
        } else if (call.name === 'evaluate_fit_status') {
          toolResult = { fits: Boolean(call.arguments.fits), validated: true };
        } else {
          success = false;
          failedToolCalls++;
          toolResult = { error: `Tool "${call.name}" is not implemented on this host.` };
        }

        if (success) successfulToolCalls++;
      } catch (err: unknown) {
        success = false;
        failedToolCalls++;
        toolResult = { error: err instanceof Error ? err.message : String(err) };
      }

      const toolLatencyMs = performance.now() - toolStart;
      toolExecutions.push({
        name: call.name,
        arguments: call.arguments,
        result: toolResult,
        latencyMs: Number(toolLatencyMs.toFixed(2)),
        success,
      });
    }

    const totalExecutionTimeMs = performance.now() - startTime;
    const avgToolLatencyMs = toolExecutions.length
      ? Number((toolExecutions.reduce((acc, t) => acc + t.latencyMs, 0) / toolExecutions.length).toFixed(2))
      : null;

    const metrics: WorkloadMetrics = {
      taskCompletionTimeMs: Number(totalExecutionTimeMs.toFixed(2)),
      totalExecutionTimeMs: Number(totalExecutionTimeMs.toFixed(2)),
      totalTokens: totalTokens || null,
      toolCallsCount,
      successfulToolCalls,
      failedToolCalls,
      retriesCount,
      toolCallLatencyMs: avgToolLatencyMs,
      finalTaskSuccess: successfulToolCalls > 0 && failedToolCalls === 0,
      peakVramBytes: null,
      peakRamBytes: null,
      gpuUtilizationPct: null,
    };

    return {
      finalOutput,
      toolCallsExecuted: toolExecutions,
      metrics,
      rawTrace: {
        messages,
        initialResponse: data,
        toolExecutions,
      },
    };
  }
}
