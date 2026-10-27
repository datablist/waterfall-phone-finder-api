# Waterfall Phone Finder API

Find phone numbers from public LinkedIn profile URLs with the
[Datablist](https://www.datablist.com/) Waterfall Phone Finder API.

Add missing phone numbers to your prospect lists and CRM contacts. The waterfall
tries several lookup services to find a number and returns it in international
format, along with its country code when available.

[View the API schema](https://api.datablist.com/v1/enrichments/waterfall-phone-finder).

## Cost

**500 credits per phone number found** with the default waterfall.

**No result, no charge.** If no phone number is found, the lookup costs **0 credits**.
Accepted cached results are also free.

If you use your own provider keys, provider usage is billed separately.

Costs are in Datablist credits. Each result reports its actual `creditsUsed`.
See the [API cost and limits](https://platform.datablist.com/docs/enrichments/tools/waterfall-phone-finder#credits-and-limits)
and [credit pack pricing](https://www.datablist.com/pricing) for current rates.

## Get started

Choose [Python](python/README.md) or [TypeScript](typescript/README.md).
Create a [Personal API Key](https://app.datablist.com/account/api), then run an
example from the repository root.

**Python:**

```sh
cd python
python -m pip install -r requirements.txt
export DATABLIST_API_KEY='your-personal-api-key'
python sync_requests.py
```

**TypeScript:**

```sh
export DATABLIST_API_KEY='your-personal-api-key'
npx tsx typescript/example.ts
```

With Node.js 24.3 or newer, you can also run `node typescript/example.ts` directly.
Run each command block from the repository root.

## Input and output

Send public LinkedIn profile URLs to
`POST https://api.datablist.com/v1/enrichments/tasks`, with your key in the
`X-API-Key` header:

```json
{
  "enrichmentId": "waterfall-phone-finder",
  "uniqueId": "waterfall-phone-finder-example-001",
  "settings": {
    "cacheAge": "30"
  },
  "inputs": [
    {
      "inputId": "row-1",
      "data": {
        "profileUrl": "https://www.linkedin.com/in/example-person/"
      }
    }
  ]
}
```

Use a new `uniqueId` for each new task. Give each profile its own `inputId` to
match it to its result, including when URLs repeat. Use public profile URLs;
Sales Navigator URLs are not supported.

The API returns `202 Accepted` with a task ID in `@id`. Check the task status,
then retrieve its results. Here is a default-workflow result (sample data):

```json
{
  "taskId": "00000000000040008000000000000001",
  "results": [
    {
      "inputId": "row-1",
      "status": "success",
      "outputs": {
        "phoneNumber": "+12025550123",
        "phoneNumberCountry": "US"
      },
      "creditsUsed": "500",
      "error": null
    }
  ],
  "nextCursor": null
}
```

`phoneNumber` uses international format with a country prefix.
`phoneNumberCountry` is a two-letter country code, such as `US` or `FR`.
The complete output list also includes `finderProvider` for custom sequences,
shown below.

## Cache settings

`cacheAge` sets the maximum age of a cached result. Send it as a string:

- `"30"`: up to 30 days old, the default.
- `"61"`: up to 61 days old.
- `"183"`: up to 183 days old.
- `"0"`: request a fresh lookup.

The examples explicitly use `"cacheAge": "30"`.

## Custom provider example and all output fields

To use your own provider key, enable `useCustomAPIKeys` and supply a
`customSequence`. This complete request uses `enrow`, one of the supported
providers. Replace the sample provider key with yours:

```json
{
  "enrichmentId": "waterfall-phone-finder",
  "uniqueId": "waterfall-phone-finder-custom-001",
  "settings": {
    "cacheAge": "30",
    "useCustomAPIKeys": true,
    "customSequence": [
      {
        "provider": "enrow",
        "apiKey": "your-provider-api-key"
      }
    ]
  },
  "inputs": [
    {
      "inputId": "row-1",
      "data": {
        "profileUrl": "https://www.linkedin.com/in/example-person/"
      }
    }
  ]
}
```

This response shows **all three production output fields**, including the
conditional `finderProvider` (sample data and credit amount):

```json
{
  "taskId": "00000000000040008000000000000002",
  "results": [
    {
      "inputId": "row-1",
      "status": "success",
      "outputs": {
        "phoneNumber": "+12025550123",
        "phoneNumberCountry": "US",
        "finderProvider": "enrow"
      },
      "creditsUsed": "0",
      "error": null
    }
  ],
  "nextCursor": null
}
```

| Output | Meaning |
| --- | --- |
| `phoneNumber` | The phone number in international format. |
| `phoneNumberCountry` | The phone number's two-letter country code. |
| `finderProvider` | The service that found the number; available with `useCustomAPIKeys: true`. |

Custom provider usage and Datablist credits are separate. Read `creditsUsed`
for the Datablist amount charged. See the [API settings](https://platform.datablist.com/docs/enrichments/tools/waterfall-phone-finder#settings) for
supported providers. Each script has a commented custom settings block at the
bottom; replace the default settings to try it.

## Try with cURL

Set your key, then submit a profile:

```sh
export DATABLIST_API_KEY='your-personal-api-key'

curl --request POST 'https://api.datablist.com/v1/enrichments/tasks' \
  --header "X-API-Key: $DATABLIST_API_KEY" \
  --header 'Content-Type: application/json' \
  --data '{
  "enrichmentId": "waterfall-phone-finder",
  "uniqueId": "waterfall-phone-finder-curl-001",
  "settings": {
    "cacheAge": "30"
  },
  "inputs": [
    {
      "inputId": "row-1",
      "data": {
        "profileUrl": "https://www.linkedin.com/in/example-person/"
      }
    }
  ]
}'
```

Copy the returned `@id` into `TASK_ID`. Use a new `uniqueId` for a new task.

```sh
TASK_ID='paste-returned-task-id'

curl "https://api.datablist.com/v1/enrichments/tasks/$TASK_ID" \
  --header "X-API-Key: $DATABLIST_API_KEY"
```

Repeat the status command every few seconds until `status` is `completed`,
`failed`, or `stopped`. Then retrieve the results:

```sh
curl "https://api.datablist.com/v1/enrichments/tasks/$TASK_ID/results" \
  --header "X-API-Key: $DATABLIST_API_KEY"
```

If `nextCursor` is not `null`, pass it as `cursor` to fetch the next page.
The Python and TypeScript examples read every page for you.

## Code examples

| Example | What it shows |
| --- | --- |
| [Synchronous Requests](python/sync_requests.py) | Use blocking HTTP calls to find phone numbers. |
| [Asynchronous HTTPX](python/async_httpx.py) | Use `async` and `await` for the same API workflow. |
| [TypeScript](typescript/example.ts) | Use async/await, built-in `fetch`, and no imports. |

Each script is self-contained: submit profiles, wait for the background task,
and read the results. Both Python clients use asynchronous backend tasks;
Requests blocks while HTTPX uses `await`. Full result objects are printed,
including statuses, credits used, and errors.

Each run submits one task of up to 10,000 inputs, within the API's request-size
limits. These examples do not batch larger lists.

## Documentation

- [Waterfall Phone Finder API](https://platform.datablist.com/docs/enrichments/tools/waterfall-phone-finder)
- [Enrichments API quickstart](https://platform.datablist.com/docs/enrichments/quickstart)
- [Task lifecycle](https://platform.datablist.com/docs/enrichments/tasks)

## Other Datablist API examples

- [Company Name to Domain API](https://github.com/datablist/company-name-to-domain-api): find company websites from names.
- [Company Name Cleaner API](https://github.com/datablist/company-name-cleaner-api): clean and standardize company names.
- [LinkedIn Profile Finder API](https://github.com/datablist/linkedin-profile-finder-api): find profiles from names and company keywords.
- [LinkedIn Profile Scraper API](https://github.com/datablist/linkedin-profile-scraper-api): retrieve profile details from LinkedIn URLs.
- [LinkedIn Company Scraper API](https://github.com/datablist/linkedin-company-scraper-api): retrieve company details from LinkedIn company pages.
- [Impressum Scraper API](https://github.com/datablist/impressum-scraper-api): extract business details from website Impressum pages.
- [Waterfall Email Finder API](https://github.com/datablist/waterfall-email-finder-api): find work emails from names and companies or LinkedIn URLs.
