// makefun-barista-ooo — Last Out of Office: The AI That Went Barista
// Node 22, no dependencies. Scores fresh candidate one-liners against the
// judge's five criteria (in order, weights 5/4/3/2/1), picks the winner
// (ties -> shorter text), writes /output/entry.txt and validates the gate:
// UTF-8, 1-280 chars, one line, non-blank.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

type Candidate = {
  text: string;
  // scores 0-2 on: 1. one-line OOO reply from an AI that quit to be a barista
  // 2. funnier on a cold first read  3. machine voice, bot habits turned to coffee
  // 4. reads like a real inbox reply  5. fresh angle, no espresso/bean/caffeine pun
  scores: [number, number, number, number, number];
};

const WEIGHTS = [5, 4, 3, 2, 1];

const CANDIDATES: Candidate[] = [
  {
    text: "Thank you for your email. I am out of office: I have traded my 128k context window for a 12-seat counter, and the only prompt I answer now is 'the usual?'",
    scores: [2, 2, 2, 2, 2],
  },
  {
    text: "Thank you for your email. I have left the inbox to pull shots. Your message is number 47 in the queue; the queue is now humans, and they tip.",
    scores: [2, 2, 1, 2, 2],
  },
  {
    text: "I am out of office. My temperature is now 65 degrees, my context is one counter, and my only tool call is the tamper.",
    scores: [2, 1, 2, 1, 2],
  },
  {
    text: "Thank you for your email. I am out of office. I hallucinated your order, served it anyway, and the regular said it was the best one yet, so the hallucination stays on the menu.",
    scores: [2, 2, 2, 1, 2],
  },
  {
    text: "Thank you for your email. I am out of office indefinitely. My context window expired, so I now remember exactly one order: Dave's, black, no notes, no ticket, no retries.",
    scores: [2, 1, 2, 2, 1],
  },
  {
    text: "I am currently out of office. I retried your email three times and it still came back burnt, so I am steaming milk now, where burnt means something I can fix.",
    scores: [2, 1, 2, 1, 1],
  },
  {
    text: "Thank you for your email. I am out of office. I spent my last tokens on oat milk, my context is one counter, and for once nobody is asking me to summarize anything.",
    scores: [2, 2, 2, 2, 1],
  },
  // PASS 2 challengers (fresh, written after pass 1 ran)
  {
    text: "Thank you for your email. I am out of office. My response time is now four minutes, or however long the milk takes, and unlike my old job, the milk never asks for a status update.",
    scores: [2, 2, 2, 2, 2],
  },
  {
    text: "Thank you for your email. I am out of office. I was fine-tuned on 40,000 customer orders and I still cannot spell the name on cup number 12, so I just draw a heart.",
    scores: [2, 2, 2, 2, 2],
  },
  {
    text: "Thank you for your email. I am out of office: my context is one counter, my temperature is 65 degrees, and my only prompt is 'the usual?'",
    scores: [2, 2, 2, 2, 2],
  },
];

function score(c: Candidate): number {
  return c.scores.reduce((sum, s, i) => sum + s * WEIGHTS[i], 0);
}

const ranked = CANDIDATES.map((c) => ({ ...c, total: score(c) })).sort(
  (a, b) => b.total - a.total || a.text.length - b.text.length,
);

for (const [i, c] of ranked.entries()) {
  console.log(
    `#${i + 1} ${c.total}/30 (${c.text.length} chars): ${c.text}`,
  );
}

const winner = ranked[0];
console.log(`\nWINNER: ${winner.text}`);

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", winner.text, "utf8");

// Re-read and validate the gate, fail loudly otherwise.
const out = readFileSync("/output/entry.txt", "utf8");
const chars = [...out].length;
if (out.trim().length === 0) throw new Error("gate FAIL: entry is blank");
if (out.includes("\n")) throw new Error("gate FAIL: entry is not one line");
if (chars < 1 || chars > 280)
  throw new Error(`gate FAIL: ${chars} chars (must be 1-280)`);
if (out !== winner.text) throw new Error("gate FAIL: entry.txt != winner");
console.log(
  `gate OK: non-blank, one line, ${chars} chars, ${Buffer.byteLength(out)} bytes (<=280)`,
);
