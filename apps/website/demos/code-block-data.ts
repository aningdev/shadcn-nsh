// The code the code-block page shows, shared by the demo and its reference page so both draw the
// same text. Demo content: it does not ship in the registry.

/** A snippet with a title: a route handler. */
export const route = `import { streamText } from "ai";

export async function POST(request: Request) {
  const { messages } = await request.json();
  const result = streamText({ model: "claude-sonnet-5-5", messages });
  return result.toTextStreamResponse();
}`;

/** A tool's output: a test run. */
export const output = `$ bun test packages/ui
bun test v1.3.0

packages/ui/code-block.test.ts:
✓ copies the value [2.10ms]
✓ numbers lines from startLine [0.41ms]

 2 pass
 0 fail
Ran 2 tests across 1 file. [12.00ms]`;

/** A failed build's log. */
export const failure = `error: Cannot find module "./theme" from "src/app.tsx"
    at resolve (src/app.tsx:3:23)
    at build (scripts/build.ts:41:9)
Build failed with 1 error`;
