# Waterfall Phone Finder API — TypeScript example

Use public LinkedIn profile URLs to find phone numbers with async/await and built-in
`fetch`. All HTTP calls are in [one standalone file](example.ts).

## Setup and run

From the repository root:

```sh
export DATABLIST_API_KEY='your-personal-api-key'
npx tsx typescript/example.ts
```

With Node.js 24.3 or newer, no runner package is needed:

```sh
node typescript/example.ts
```

From this `typescript` folder, use `npx tsx example.ts` or `node example.ts`.
Create your key on the [Datablist API page](https://app.datablist.com/account/api).
Calls use credits; see the current
[credit cost and limits](https://platform.datablist.com/docs/enrichments/tools/waterfall-phone-finder#credits-and-limits)
and [pricing](https://www.datablist.com/pricing).

## Customize the example

Edit `profileUrls` and `settings` at the bottom. The default settings accept
cached results up to 30 days old:

```typescript
const settings = { cacheAge: "30" };
```

Use `"0"` for a fresh lookup. `"61"` and `"183"` are also supported cache ages.
Keep the value as a string. To use your own provider key, replace the default
settings with the commented custom settings block in the script.

See the root README for a [complete custom-provider request and result](../README.md#custom-provider-example-and-all-output-fields).

Use standard public LinkedIn profile URLs, such as
`https://www.linkedin.com/in/example-person/`. Sales Navigator URLs are not supported.

## How it works

The script submits one task, polls every three seconds, and reads result pages
until `nextCursor` is `null`. It uses `fetch`, `crypto.randomUUID()`, and
`setTimeout`, with no imports. The example reads your key from the environment.

Each profile gets its own `inputId`, including repeated URLs. Full results are
printed as JSON, including statuses, outputs, credits used, and errors.

The production outputs are `phoneNumber`, `phoneNumberCountry`, and the
conditional `finderProvider`. See [all output fields](../README.md#custom-provider-example-and-all-output-fields)
for a complete JSON response and the settings that enable the provider field.

Each run submits one task of up to 10,000 inputs, within the API's request-size
limits. This example does not batch larger lists.

## When something fails

HTTP errors and network failures stop the script. A failed or stopped task
throws an error with its task ID. A completed task can still have individual
errors or no result; check each result's `status` and `error`.

If you stop the script, the task continues on the server. List your
[tasks](https://platform.datablist.com/docs/enrichments/tasks) to check its status
before creating another task.
