# 6en6ar.github.io

A terminal-style blog. It's plain HTML, CSS and vanilla JavaScript, with no frameworks, no build step and no backend.

## Files

```
index.html          home page (the blog)
about.html          about page
css/style.css       all colors and layout (colors are at the top)
js/markdown.js      turns Markdown into safe HTML
js/blog.js          loads the posts, list on the left, post on the right
posts/posts.json    the list of post files
posts/*.md          one Markdown file per post
images/             pictures used in posts
blog/               old URLs, they only redirect to the new pages
```

## Publish a new post

1. Create a new file in `posts/`, for example `posts/my-new-post.md`.
   Use only letters, numbers, `-` and `_` in the file name.

   ```markdown
   ---
   title: My new post
   date: 2026-11-14
   description: One line that describes the post
   ---

   ## Introduction

   Some text with **bold**, *italic*, `code` and a [link](https://example.com).

   ![screenshot](images/my-picture.png)
   ```

2. Add the file name to `posts/posts.json`:

   ```json
   [
     "my-new-post.md",
     "asyncrat-dropper.md"
   ]
   ```

3. Commit and push. The post appears on the blog. Posts are always sorted
   by `date` (newest first), so the order in `posts.json` doesn't matter.

To hide an unfinished post, add `draft: true` to its front matter.

Supported Markdown includes headings, bold, italic, `~~strike~~`, inline code, code
blocks (```` ``` ````), links, images, lists, `> quotes` and `---` lines.
Raw HTML is not rendered. It shows up as text, which keeps the site safe.

## Change settings

At the top of `js/blog.js` you can change the posts per page, the prompt text,
the site title and the ASCII banner.

## Preview locally

The posts are loaded with `fetch`, so opening `index.html` straight from disk
won't work. Start a tiny local server instead:

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Security notes

- No backend, forms, cookies, analytics or third-party scripts/fonts.
- A Content-Security-Policy only allows files from this site to load. Images
  must be stored in `images/` (external image URLs are blocked).
- Post content is HTML-escaped, and links only allow `http(s):`, `mailto:` and
  relative URLs.
- `.nojekyll` makes GitHub Pages serve the `.md` files as they are.
