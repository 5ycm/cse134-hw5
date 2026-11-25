# cse134-hw5

| Field | Value |
|---|---|
| Repository URL | https://github.com/5ycm/cse134-hw5 |
| Deployed URL | https://YOUR-HW5-SITE.netlify.app/ |
| Component page | https://YOUR-HW5-SITE.netlify.app/projects.html |

## What's where

| Part | Files |
|---|---|
| 1–2: Web Component + Dog CEO API | `dog-panel.js` (loaded with `defer`), used in `projects.html` under **Web Component: Random Dog Widget** |
| 3: Theming | The `dog-panel` rules near the end of `style.css`, before View Transitions. The `dog-panel { --dog-panel-* }` rule passes the site's theme variables into the component |
| 3: Saved preference | Bottom of `dog-panel.js`. localStorage key `hw5-dog-panel-mode` (`"compact"` / `"expanded"`) |
| 4: SSG exercise | [`ssg-exercise/`](ssg-exercise/) (Eleventy). Preview **Home** (`/`) and **Projects** (`/projects/`). Commands are in [`ssg-exercise/README.md`](ssg-exercise/README.md) |
| From HW4 | `theme.js`, `form-no-js.html`, `form-with-js.html`, `form.js` |

The Home page links to the widget ("random dog Web Component").

## Design note

**What the visitor wants:** to take a quick, fun break by seeing a random dog
photo, and to choose whether the widget shows breed details or stays compact.

**The component:** `<dog-panel>` is a custom element (`customElements.define`).
In `connectedCallback()` it builds its interface with `createElement`,
`textContent`, and `append`: a heading, a photo area, a "Surprise me with a dog"
button, and a status paragraph with `role="status"` so screen readers announce
changes.

**Tracing one action: "Surprise me with a dog"**

1. The button's `click` listener is the named method `handleButtonClick()`,
   which calls `loadDog()`. A keyboard Enter or Space on a native button also
   fires `click`. All listeners are named, bound functions, so
   `disconnectedCallback()` can remove them with `removeEventListener`.
2. `setLoading(true)` disables the button and sets `aria-busy`. The status
   changes to **"Fetching a dog…"**. The previous photo, if any, stays visible.
3. `fetch("https://dog.ceo/api/breeds/image/random")` sends a GET request.
   - If `response.ok` is false (for example 404 or 500), an error is thrown.
   - `response.json()` throws if the body isn't valid JSON.
   - The data is accepted only if `status === "success"` and `message` is a
     string.
   - `message` is parsed with `new URL()` and must be `https:` on
     `images.dog.ceo`. Any other URL is rejected.
4. The breed is read from the URL path (`/breeds/hound-afghan/…` →
   "Afghan Hound"). The image's `src` is set to the URL.
5. When the image's `load` event fires, the component sets the `alt` text,
   writes the caption with `textContent` (never `innerHTML`), changes the status
   to **"Loaded dog N: Breed."**, and re-enables the button.
6. **On failure** (offline, bad status, bad JSON, rejected URL, or the image
   fails to load), the `catch` block or the image's `error` handler shows
   **"⚠ Couldn't load a dog. Check your connection and try again."** in the
   error color. The button is re-enabled and relabeled **"Try again"**. The
   next success clears the error and restores the label, with no page reload.

**Page control and observed attribute:** the "Hide/Show dog details" button sits
outside the component. Its named click handler,
`handleModeToggleClick()`, calls `panel.toggleAttribute("compact", …)`. Because `compact` is listed in
`observedAttributes`, `attributeChangedCallback()` runs and hides or shows the
breed caption, and CSS (`dog-panel[compact]`) makes the photo square and
smaller. The current dog stays on screen in both modes. The button's label and
`aria-pressed` always match the current state.

**Saved preference:** clicking the button applies the change first, then calls
`localStorage.setItem("hw5-dog-panel-mode", …)` inside `try/catch`. On load,
`getItem` (also inside `try/catch`) is checked against `["compact",
"expanded"]`. If the value is missing, unrecognized, or can't be read, the
default (`expanded`) is used. The restored value goes through the same
`applyMode()` function as a click. If saving fails, the change still applies
for the current page.

**Without JavaScript:** the main portfolio content and navigation work as
normal. A `<noscript>` message inside `<dog-panel>` says "Enable JavaScript to
load live dog photos in this widget." The page toggle stays `hidden` because it
would do nothing.

## Testing checklist

- [x] Both buttons work with Tab plus Enter or Space, and show a visible focus outline in both themes
- [x] Network panel shows the `dog.ceo` request. Offline shows the error; going back online and retrying succeeds without a reload
- [x] Compact mode survives a reload. An unknown stored value falls back to expanded
- [x] Storage read and write errors don't break the toggle
- [x] JavaScript disabled: site usable, fallback message shown
