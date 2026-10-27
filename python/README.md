# Waterfall Phone Finder API — Python examples

Use public LinkedIn profile URLs to find phone numbers with Requests or async HTTPX.
Each standalone file shows all the HTTP calls in one place.

## Setup

Use Python 3.12 or newer. From this `python` folder:

```sh
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
export DATABLIST_API_KEY='your-personal-api-key'
```

Create your key on the [Datablist API page](https://app.datablist.com/account/api).
Calls use credits; see the current
[credit cost and limits](https://platform.datablist.com/docs/enrichments/tools/waterfall-phone-finder#credits-and-limits)
and [pricing](https://www.datablist.com/pricing).

## Run an example

**Synchronous, using Requests:**

```sh
python sync_requests.py
```

**Asynchronous, using HTTPX:**

```sh
python async_httpx.py
```

Both scripts submit a background task, poll every three seconds, and read all
result pages. Requests uses blocking calls. HTTPX uses `await` and `asyncio.sleep`.

## Customize the example

Edit `profile_urls` and `settings` at the bottom of either file. The default
settings accept cached results up to 30 days old:

```python
settings = {"cacheAge": "30"}
```

Use `"0"` for a fresh lookup. `"61"` and `"183"` are also supported cache ages.
Keep the value as a string. To use your own provider key, replace the default
settings with the commented custom settings block in the script.

See the root README for a [complete custom-provider request and result](../README.md#custom-provider-example-and-all-output-fields).

Use standard public LinkedIn profile URLs, such as
`https://www.linkedin.com/in/example-person/`. Sales Navigator URLs are not supported.

## Results and limits

Each script prints full results, including `inputId`, `status`, `outputs`,
`creditsUsed`, and `error`. Match results to submitted profiles through `inputId`.

The production outputs are `phoneNumber`, `phoneNumberCountry`, and the
conditional `finderProvider`. See [all output fields](../README.md#custom-provider-example-and-all-output-fields)
for a complete JSON response and the settings that enable the provider field.

Each run submits one task of up to 10,000 inputs, within the API's request-size
limits. These examples do not batch larger lists.

## When something fails

HTTP errors raise the library's normal exception. A failed or stopped task
raises an exception with its task ID. A completed task can still have individual
errors or no result; check each result's `status` and `error`.

If you stop a script, the task continues on the server. List your
[tasks](https://platform.datablist.com/docs/enrichments/tasks) to check its status
before creating another task.
