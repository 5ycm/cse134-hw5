# Homework 5 Part 4: Eleventy exercise

Two pages from my portfolio (**Home** and **Projects**) built with
[Eleventy](https://www.11ty.dev/). Both use one shared footer.

## Files

| File | Purpose |
|---|---|
| `src/index.njk` | Home page content |
| `src/projects.njk` | Projects page content (output at `/projects/`) |
| `src/_includes/base.njk` | Layout both pages use (head, nav, `<main>`) |
| `src/_includes/footer.njk` | **Shared footer**, included by the layout |
| `src/assets/` | `style.css`, `theme.js`, `profilePhoto.png` (copied as-is) |
| `eleventy.config.js` | Eleventy configuration |

## Commands

Run these from this folder (`ssg-exercise/`). You need Node.js 18 or newer.

```bash
npm install      # install Eleventy
npm run build    # generate the site into _site/
npm start        # build, serve and watch at http://localhost:8080
```

Preview both pages:

- Home: <http://localhost:8080/>
- Projects: <http://localhost:8080/projects/>

## Checking the shared footer

1. Edit the text in `src/_includes/footer.njk`.
2. Run `npm run build` again, or let `npm start` rebuild it automatically.
3. Refresh both pages. Both footers show the new text.
