# axe-webdriverjs-test

Automated accessibility testing example using **Selenium WebDriver**, **Mocha**, **Chai**, and **@axe-core/webdriverjs** against the Deque University Mars demo page.

The project includes:
- **Navigation test**: Verifies that the main navigation (`.main-nav`) is present and displayed.
- **Accessibility test**: Runs an axe-core accessibility scan on `https://dequeuniversity.com/demo/mars`, logs the raw results, and asserts that there are no critical violations.

## Running the tests

From the project root:

```bash
npm test
```

This will:
- Start Chrome via Selenium WebDriver.
- Load the Mars demo page.
- Execute the two Mocha test cases.

## Note on axe-core output verbosity

The raw axe-core results logged to the console are **very verbose** and include detailed information about every violation, node, and rule. This is intentional for debugging, but:

- In real-world projects, you will typically **summarize** these results (for example, by counting violations by impact level or listing only rule IDs and URLs), or
- Pipe them to a reporter/dashboard instead of logging the full JSON payload.

If you’d like, this project can be extended to **summarize the axe results** (e.g., a concise table of violations by impact, or a short pass/fail report) rather than printing the complete JSON.

