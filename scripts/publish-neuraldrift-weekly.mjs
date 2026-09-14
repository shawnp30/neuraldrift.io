#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import {
  buildBroadcastDryRun,
  createKitBroadcastDraft,
  getPublisherSecret,
  validateNewsletterBroadcastInput,
} from '../lib/newsletter/broadcasts.ts';

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    file: { type: 'string' },
    'dry-run': { type: 'boolean', default: false },
    'create-draft': { type: 'boolean', default: false },
    help: { type: 'boolean', default: false },
  },
  allowPositionals: false,
});

if (values.help || (!values.file && !values['dry-run'] && !values['create-draft'])) {
  console.log(`NeuralDrift Weekly Broadcast Publisher\n\nUsage:\n  npm run newsletter:broadcast -- --file ./content/newsletters/2026-W38.json --dry-run\n  npm run newsletter:broadcast -- --file ./content/newsletters/2026-W38.json --create-draft\n\nEnvironment:\n  KIT_API_KEY\n  NEURALDRIFT_PUBLISHER_SECRET\n`);
  process.exit(values.help ? 0 : 1);
}

if (!values.file) {
  console.error('A --file path is required.');
  process.exit(1);
}

const raw = readFileSync(values.file, 'utf8');
const parsed = JSON.parse(raw);
const issue = validateNewsletterBroadcastInput(parsed);
const secret = getPublisherSecret();

if (!secret) {
  console.error('NEURALDRIFT_PUBLISHER_SECRET is not configured.');
  process.exit(1);
}

if (values['dry-run']) {
  const result = buildBroadcastDryRun(issue);
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

if (values['create-draft']) {
  const result = await createKitBroadcastDraft(issue);
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

console.error('Choose one of --dry-run or --create-draft.');
process.exit(1);
