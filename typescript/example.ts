/**
 * Find phone numbers from LinkedIn URLs with async/await and built-in fetch.
 *
 * Submit public profile URLs, wait for the background task, and read every result
 * page. Polling pauses for three seconds between status checks.
 *
 * Set DATABLIST_API_KEY, then run from the repository root:
 * npx tsx typescript/example.ts
 * Or with Node.js 24.3 or newer: node typescript/example.ts
 *
 * Edit profileUrls and settings at the bottom. The default accepts cached results
 * up to 30 days old. A commented block shows a custom provider sequence.
 * Results include phoneNumber, phoneNumberCountry, and, for custom sequences,
 * finderProvider. Complete result objects are printed as JSON.
 * Sales Navigator URLs are not supported. One task accepts up to 10,000 inputs.
 * Calls use account credits.
 */

/** Submit one task, wait for it to finish, and return its results. */
async function findPhoneNumbers(
  profileUrls: string[],
  apiKey: string,
  settings: object,
): Promise<object[]> {
  const tasksUrl = "https://api.datablist.com/v1/enrichments/tasks";
  const headers = {
    "X-API-Key": apiKey,
    "Content-Type": "application/json",
  };
  const inputs = profileUrls.map((profileUrl, index) => {
    return {
      inputId: `row-${index + 1}`,
      data: { profileUrl },
    };
  });

  // 1. Submit the inputs.
  const payload = {
    enrichmentId: "waterfall-phone-finder",
    uniqueId: crypto.randomUUID(),
    settings,
    inputs,
  };
  let response = await fetch(tasksUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  let task = await response.json();
  const taskId = task["@id"];
  const taskUrl = `${tasksUrl}/${taskId}`;

  // 2. Wait for the background task to finish.
  while (!["completed", "failed", "stopped"].includes(task.status)) {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 3000);
    });
    response = await fetch(taskUrl, { headers });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    task = await response.json();
  }

  if (task.status !== "completed") {
    throw new Error(`Task ${taskId} ${task.status}`);
  }

  // 3. Read every result page, until nextCursor is null.
  const results: object[] = [];
  const params = new URLSearchParams({ limit: "100" });
  while (true) {
    response = await fetch(`${taskUrl}/results?${params}`, { headers });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const page = await response.json();
    results.push(...page.results);
    if (page.nextCursor === null) {
      break;
    }
    params.set("cursor", page.nextCursor);
  }

  return results;
}

const apiKey = process.env.DATABLIST_API_KEY ?? "";
// Use Datablist's default waterfall and accept cached results up to 30 days old.
const settings = { cacheAge: "30" };

// To use your own provider key, replace the settings above with this block.
// const settings = {
//   cacheAge: "30",
//   useCustomAPIKeys: true,
//   customSequence: [
//     { provider: "enrow", apiKey: "your-provider-api-key" },
//   ],
// };

const profileUrls = [
  "https://www.linkedin.com/in/satyanadella/",
  "https://www.linkedin.com/in/reidhoffman/",
];

const results = await findPhoneNumbers(profileUrls, apiKey, settings);
console.log(JSON.stringify(results, null, 2));
