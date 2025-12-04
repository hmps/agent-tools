---
name: playwright
description: Complete browser automation with Playwright. Auto-detects dev servers, writes clean test scripts to /tmp. Test pages, fill forms, take screenshots, check responsive design, validate UX, test login flows, check links, automate any browser task. Use when user wants to test websites, automate browser interactions, validate web functionality, or perform any browser-based testing.
---

**IMPORTANT - Path Resolution:**
Before executing any commands, get the skill directory by running:
```bash
agt get-dir
```
This outputs the agent-tools root directory. The playwright skill is located at `[dir]/skills/playwright`. Use this path for `$SKILL_DIR` in all commands below.

Example:
```bash
# Get the directory
agt get-dir
# Output: /Users/hmps/dev/hmps/agent-tools

# Use it in commands
cd /Users/hmps/dev/hmps/agent-tools/skills/playwright && node run.js /tmp/test.js
```

# Playwright Browser Automation

General-purpose browser automation skill. I'll write custom Playwright code for any automation task you request and execute it via the universal executor.

**CRITICAL WORKFLOW - Follow these steps in order:**

1. **Auto-detect dev servers** - For localhost testing, ALWAYS run server detection FIRST:
   ```bash
   cd $SKILL_DIR && node -e "require('./lib/helpers').detectDevServers().then(servers => console.log(JSON.stringify(servers)))"
   ```
   - If **1 server found**: Use it automatically, inform user
   - If **multiple servers found**: Ask user which one to test
   - If **no servers found**: Ask for URL or offer to help start dev server

2. **ALWAYS use `helpers.connectToChrome()`** - This is MANDATORY for browser automation:
   ```javascript
   const helpers = require('./lib/helpers');
   const { browser, page } = await helpers.connectToChrome();
   ```
   - Preserves cookies, sessions, and login state across runs
   - Auto-launches Chrome with debug profile if not running
   - **NEVER use `chromium.launch()` directly** - it creates a fresh browser without auth state

3. **Write scripts to /tmp** - NEVER write test files to skill directory; always use `/tmp/playwright-test-*.js`

4. **Use visible browser by default** - Always use `headless: false` unless user specifically requests headless mode

5. **Parameterize URLs** - Always make URLs configurable via environment variable or constant at top of script

## How It Works

1. You describe what you want to test/automate
2. I auto-detect running dev servers (or ask for URL if testing external site)
3. I write custom Playwright code in `/tmp/playwright-test-*.js` (won't clutter your project)
4. I execute it via: `cd $SKILL_DIR && node run.js /tmp/playwright-test-*.js`
5. Results displayed in real-time, browser window visible for debugging
6. Test files auto-cleaned from /tmp by your OS

## Setup (First Time)

```bash
cd $SKILL_DIR
npm run setup
```

This installs Playwright and Chromium browser. Only needed once.

## Browser Connection (MANDATORY)

### ALWAYS Use: `helpers.connectToChrome()`

**Every script MUST use `connectToChrome()` from helpers.** This connects to Chrome with the user's existing profile (cookies, sessions, login state).

```javascript
const helpers = require('./lib/helpers');

const { browser, page } = await helpers.connectToChrome();
// Cookies, sessions, and auth state are preserved!
await page.goto('http://localhost:3000/dashboard');
```

**Why this is required:**
- Preserves authentication - user stays logged in across automation runs
- Maintains cookies and localStorage - no need to re-authenticate
- Uses dedicated `~/playwright-agent` profile - isolated from user's main Chrome
- Auto-launches Chrome with debug port if not running

**How it works:**
- Connects to Chrome via CDP (Chrome DevTools Protocol) on port 9222
- If Chrome debug instance isn't running, it launches automatically
- Runs alongside your normal Chrome (separate instance)
- First time: user logs into apps in this Chrome window; sessions persist for all future runs

**Manual launch (if needed):**
```bash
open -na "Google Chrome" --args --remote-debugging-port=9222 --user-data-dir="$HOME/playwright-agent"
```

### DO NOT USE: `chromium.launch()`

**Never use `chromium.launch()` directly** - it creates a fresh browser without any auth state:

```javascript
// ❌ WRONG - Don't do this!
const { chromium } = require('playwright');
const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();
// No cookies, no sessions, user must log in every time

// ✅ CORRECT - Always do this!
const helpers = require('./lib/helpers');
const { browser, page } = await helpers.connectToChrome();
// Cookies and sessions preserved!
```

**Only exception:** When user explicitly requests a "fresh browser", "clean session", or "incognito mode".

## Execution Pattern

**Step 1: Detect dev servers (for localhost testing)**

```bash
cd $SKILL_DIR && node -e "require('./lib/helpers').detectDevServers().then(s => console.log(JSON.stringify(s)))"
```

**Step 2: Write test script to /tmp with URL parameter**

```javascript
// /tmp/playwright-test-page.js
const helpers = require('./lib/helpers');

// Parameterized URL (detected or user-provided)
const TARGET_URL = 'http://localhost:3001'; // <-- Auto-detected or from user

(async () => {
  const { browser, page } = await helpers.connectToChrome();

  await page.goto(TARGET_URL);
  console.log('Page loaded:', await page.title());

  await page.screenshot({ path: '/tmp/screenshot.png', fullPage: true });
  console.log('📸 Screenshot saved to /tmp/screenshot.png');

  await browser.close();
})();
```

**Step 3: Execute from skill directory**

```bash
cd $SKILL_DIR && node run.js /tmp/playwright-test-page.js
```

## Common Patterns

### Test a Page (Multiple Viewports)

```javascript
// /tmp/playwright-test-responsive.js
const helpers = require('./lib/helpers');

const TARGET_URL = 'http://localhost:3001'; // Auto-detected

(async () => {
  const { browser, page } = await helpers.connectToChrome();

  // Desktop test
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(TARGET_URL);
  console.log('Desktop - Title:', await page.title());
  await page.screenshot({ path: '/tmp/desktop.png', fullPage: true });

  // Mobile test
  await page.setViewportSize({ width: 375, height: 667 });
  await page.screenshot({ path: '/tmp/mobile.png', fullPage: true });

  await browser.close();
})();
```

### Access Authenticated Pages

```javascript
// /tmp/playwright-test-dashboard.js
const helpers = require('./lib/helpers');

const TARGET_URL = 'http://localhost:3001'; // Auto-detected

(async () => {
  // connectToChrome() preserves login sessions!
  const { browser, page } = await helpers.connectToChrome();

  // If user has logged in before, they're still logged in
  await page.goto(`${TARGET_URL}/dashboard`);
  console.log('Dashboard title:', await page.title());

  // No need to log in again - cookies and sessions are preserved
  await page.screenshot({ path: '/tmp/dashboard.png', fullPage: true });
  console.log('📸 Screenshot saved to /tmp/dashboard.png');
})();
```

### Fill and Submit Form

```javascript
// /tmp/playwright-test-form.js
const helpers = require('./lib/helpers');

const TARGET_URL = 'http://localhost:3001'; // Auto-detected

(async () => {
  const { browser, page } = await helpers.connectToChrome();

  await page.goto(`${TARGET_URL}/contact`);

  await page.fill('input[name="name"]', 'John Doe');
  await page.fill('input[name="email"]', 'john@example.com');
  await page.fill('textarea[name="message"]', 'Test message');
  await page.click('button[type="submit"]');

  // Verify submission
  await page.waitForSelector('.success-message');
  console.log('✅ Form submitted successfully');
})();
```

### Check for Broken Links

```javascript
// /tmp/playwright-test-links.js
const helpers = require('./lib/helpers');

const TARGET_URL = 'http://localhost:3000'; // Auto-detected

(async () => {
  const { browser, page } = await helpers.connectToChrome();

  await page.goto(TARGET_URL);

  const links = await page.locator('a[href^="http"]').all();
  const results = { working: 0, broken: [] };

  for (const link of links) {
    const href = await link.getAttribute('href');
    try {
      const response = await page.request.head(href);
      if (response.ok()) {
        results.working++;
      } else {
        results.broken.push({ url: href, status: response.status() });
      }
    } catch (e) {
      results.broken.push({ url: href, error: e.message });
    }
  }

  console.log(`✅ Working links: ${results.working}`);
  console.log(`❌ Broken links:`, results.broken);
})();
```

### Take Screenshot with Error Handling

```javascript
// /tmp/playwright-test-screenshot.js
const helpers = require('./lib/helpers');

const TARGET_URL = 'http://localhost:3000'; // Auto-detected

(async () => {
  const { browser, page } = await helpers.connectToChrome();

  try {
    await page.goto(TARGET_URL);

    await page.screenshot({
      path: '/tmp/screenshot.png',
      fullPage: true
    });

    console.log('📸 Screenshot saved to /tmp/screenshot.png');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
})();
```

### Test Responsive Design

```javascript
// /tmp/playwright-test-responsive-full.js
const helpers = require('./lib/helpers');

const TARGET_URL = 'http://localhost:3001'; // Auto-detected

(async () => {
  const { browser, page } = await helpers.connectToChrome();

  const viewports = [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 }
  ];

  for (const viewport of viewports) {
    console.log(`Testing ${viewport.name} (${viewport.width}x${viewport.height})`);

    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height
    });

    await page.goto(TARGET_URL);
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: `/tmp/${viewport.name.toLowerCase()}.png`,
      fullPage: true
    });
  }

  console.log('✅ All viewports tested');
})();
```

## Inline Execution (Simple Tasks)

For quick one-off tasks, you can execute code inline without creating files:

```bash
# Take a quick screenshot (still uses connectToChrome via helpers)
cd $SKILL_DIR && node run.js "
const { browser, page } = await helpers.connectToChrome();
await page.goto('http://localhost:3001');
await page.screenshot({ path: '/tmp/quick-screenshot.png', fullPage: true });
console.log('Screenshot saved');
"
```

**When to use inline vs files:**
- **Inline**: Quick one-off tasks (screenshot, check if element exists, get page title)
- **Files**: Complex tests, responsive design checks, anything user might want to re-run

## Available Helpers

Utility functions in `lib/helpers.js` - **ALWAYS import and use these**:

```javascript
const helpers = require('./lib/helpers');

// ⭐ PRIMARY: Connect to Chrome with preserved auth state (ALWAYS USE THIS)
const { browser, page } = await helpers.connectToChrome();

// Detect running dev servers (use before writing test code)
const servers = await helpers.detectDevServers();
console.log('Found servers:', servers);

// Safe click with retry
await helpers.safeClick(page, 'button.submit', { retries: 3 });

// Safe type with clear
await helpers.safeType(page, '#username', 'testuser');

// Take timestamped screenshot
await helpers.takeScreenshot(page, 'test-result');

// Handle cookie banners
await helpers.handleCookieBanner(page);

// Extract table data
const data = await helpers.extractTableData(page, 'table.results');
```

**Key helpers:**
- `connectToChrome()` - **REQUIRED** - connects to Chrome with cookies/sessions preserved
- `detectDevServers()` - finds running dev servers on common ports
- `safeClick()` / `safeType()` - reliable interactions with retry logic

See `lib/helpers.js` for full list.

## Advanced Usage

For comprehensive Playwright API documentation, see [API_REFERENCE.md](API_REFERENCE.md):

- Selectors & Locators best practices
- Network interception & API mocking
- Authentication & session management
- Visual regression testing
- Mobile device emulation
- Performance testing
- Debugging techniques
- CI/CD integration

## Tips

- **CRITICAL: Always use `helpers.connectToChrome()`** - Never use `chromium.launch()` directly; always connect to Chrome with preserved auth state
- **CRITICAL: Detect servers FIRST** - Always run `detectDevServers()` before writing test code for localhost testing
- **Use /tmp for test files** - Write to `/tmp/playwright-test-*.js`, never to skill directory or user's project
- **Parameterize URLs** - Put detected/provided URL in a `TARGET_URL` constant at the top of every script
- **Close the browser when done** - Always call `await browser.close()` at the end of your script to clean up resources
- **Error handling:** Always use try-catch for robust automation
- **Console output:** Use `console.log()` to track progress and show what's happening

## Wait Strategies

**NEVER use `networkidle`** - it's extremely slow and unnecessary.

**Primary approach**: Wait for a specific element you know should appear:
```javascript
await page.goto(url);
await page.locator('.dashboard').waitFor();  // or any element you expect to see
```

**Fallback**: If you don't know what element to wait for, use default `load`:
```javascript
await page.goto(url);  // uses 'load' by default, which is fine
```

**Decision guide:**
- Know what element should appear? → Wait for that selector
- Don't know the page structure? → Just use `page.goto(url)` with default `load`
- Need to interact with an element? → Playwright auto-waits on locator actions

**Avoid:**
```javascript
// DON'T do this - extremely slow
await page.goto(url, { waitUntil: 'networkidle' });
```

## Troubleshooting

**Playwright not installed:**
```bash
cd $SKILL_DIR && npm run setup
```

**Module not found:**
Ensure running from skill directory via `run.js` wrapper

**Browser doesn't open:**
Check `headless: false` and ensure display available

**Element not found:**
Add wait: `await page.waitForSelector('.element', { timeout: 10000 })`

## Example Usage

```
User: "Test if the marketing page looks good"

Claude: I'll test the marketing page across multiple viewports. Let me first detect running servers...
[Runs: detectDevServers()]
[Output: Found server on port 3001]
I found your dev server running on http://localhost:3001

[Writes custom automation script to /tmp/playwright-test-marketing.js with URL parameterized]
[Runs: cd $SKILL_DIR && node run.js /tmp/playwright-test-marketing.js]
[Shows results with screenshots from /tmp/]
```

```
User: "Check if login redirects correctly"

Claude: I'll test the login flow. First, let me check for running servers...
[Runs: detectDevServers()]
[Output: Found servers on ports 3000 and 3001]
I found 2 dev servers. Which one should I test?
- http://localhost:3000
- http://localhost:3001

User: "Use 3001"

[Writes login automation to /tmp/playwright-test-login.js]
[Runs: cd $SKILL_DIR && node run.js /tmp/playwright-test-login.js]
[Reports: ✅ Login successful, redirected to /dashboard]
```

## Notes

- Each automation is custom-written for your specific request
- Not limited to pre-built scripts - any browser task possible
- Auto-detects running dev servers to eliminate hardcoded URLs
- Test scripts written to `/tmp` for automatic cleanup (no clutter)
- Code executes reliably with proper module resolution via `run.js`
- Progressive disclosure - API_REFERENCE.md loaded only when advanced features needed
