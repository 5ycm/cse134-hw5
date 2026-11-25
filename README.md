# cse134-hw5

## SSG exercise

Folder: `ssg-exercise/`

Pages to preview: **Home** (`/`) and **Projects** (`/projects/`)

## Design note

**What the visitor wants:** to see a random dog photo as a quick, fun break.

**Tracing one action: "Surprise me with a dog"**

1. The visitor activates the "Surprise me with a dog" button inside `<dog-panel>`. Its click listener, `handleButtonClick()`, calls `loadDog()`.
2. `loadDog()` disables the button and sends a GET request with `fetch("https://dog.ceo/api/breeds/image/random")`.
3. The response is checked: `response.ok` must be true, the body must parse as JSON, `status` must be `"success"`, and `message` must be an HTTPS URL on `images.dog.ceo`.
4. The image's `src` is set to that URL. When the image's `load` event fires, the component sets its alt text, writes the breed caption with `textContent`, updates the status, and re-enables the button.

**What the visitor sees:**

- **While waiting:** the button is disabled and the status reads "Fetching a dog…".
- **On success:** the new photo and its breed appear, and the status reads "Loaded dog N: Breed."
- **On failure:** the status reads "⚠ Couldn't load a dog. Check your connection and try again." and the button changes to "Try again". A successful retry clears the error without reloading the page.
