/*
 * blog.js - loads the Markdown posts and draws the blog.
 *
 * How it works:
 *   1. Read the list of post files from posts/posts.json
 *   2. Download every post and read its front matter (title, date, ...)
 *   3. Show the post list on the left and the selected post on the right
 *
 * The address bar decides what is shown:
 *   index.html               -> welcome screen + newest posts
 *   index.html#page=2        -> second page of posts
 *   index.html#post=my-post  -> the post stored in posts/my-post.md
 */
(function () {
  "use strict";

  // ---- Settings you may want to change -----------------------------------
  var POSTS_PER_PAGE = 8;
  var PROMPT = "g3n6aR@darkside:~/root$";
  var SITE_TITLE = "6en6ar :: root";
  var TYPING_SPEED_MS = 45;

  // ASCII art shown on the home page.
  var BANNER = [
    "▄█░▓▀▀▀▀▀ ░█░▓▀▀███ ░█░▓▀▓░█░ ▄█░▓▀▀▀▀▀ ░█░▓▀▓░█░ ░█░▓▀▓░█░",
    "▒█▒▓▀▓░█▄ ▒█▒▓▀     ▒█▒▓ ▓▒█▒ ▒█▒▓▀▓░█▄ ▒█▒▓▀▓▒█▒ ▒█▒▓ ▓▒▓▒",
    "▒▓▒▓ ▓▒▓▒ ▒▓▒▓ ▓▒▓▒ ▒▓▒▓ ▓▒▓▒ ▒▓▒▓ ▓▒▓▒ ▒▓▒▓ ▓▒▓▒ ▒▓▒▓▄▓▒▒▀",
    "▓▒▒▓ ▓▒▒▓ ▓▒▒▓ ▓▒▒▓ ▓▒▒▓ ▓▒▒▓ ▓▒▒▓ ▓▒▒▓ ▓▒▒▓ ▓▒▒▓ ▓▒▒▓ ▓▓░█",
    "▀░▓▓▄▓▓░▀ ▀░▓▓▄▓▓░▀ ▀░▓▓ ▓▓░▀ ▀░▓▓▄▓▓░▀ ▀░▓▓ ▓▓░▀ ▀░▓▓ ▓▓░▀"
  ].join("\n");
  // -------------------------------------------------------------------------

  var esc = window.Markdown.escapeHtml;
  var posts = []; // every published post, newest first
  var hasTyped = false;

  var els = {
    list: document.getElementById("post-list"),
    sidePager: document.getElementById("side-pager"),
    content: document.getElementById("content"),
    editorTab: document.getElementById("editor-tab"),
    statusFile: document.getElementById("status-file"),
    statusCount: document.getElementById("status-count")
  };

  function loadPosts() {
    return fetch("posts/posts.json")
      .then(function (res) {
        if (!res.ok) throw new Error("posts/posts.json: " + res.status);
        return res.json();
      })
      .then(function (files) {
        return Promise.all(files.map(loadPost));
      })
      .then(function (loaded) {
        posts = loaded
          .filter(function (post) { return post && !post.draft; })
          .sort(function (a, b) { return b.date.localeCompare(a.date); });
      });
  }

  function loadPost(file) {
    // Only plain file names like "my-post.md" are accepted.
    if (!/^[a-zA-Z0-9_-]+\.md$/.test(file)) {
      console.warn("Skipping invalid post file name:", file);
      return Promise.resolve(null);
    }
    return fetch("posts/" + file)
      .then(function (res) {
        if (!res.ok) throw new Error("posts/" + file + ": " + res.status);
        return res.text();
      })
      .then(function (text) {
        var parsed = window.Markdown.parseFrontMatter(text);
        var slug = file.replace(/\.md$/, "");
        return {
          slug: slug,
          file: file,
          title: parsed.meta.title || slug,
          date: parsed.meta.date || "",
          description: parsed.meta.description || "",
          draft: parsed.meta.draft === "true",
          body: parsed.body
        };
      })
      .catch(function (err) {
        console.warn(err);
        return null;
      });
  }

  // ---- Reading the address bar -------------------------------------------

  function readHash() {
    var params = new URLSearchParams(window.location.hash.slice(1));
    var page = parseInt(params.get("page"), 10) || 1;
    return { post: params.get("post"), page: page };
  }

  function pageCount() {
    return Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  }

  function clampPage(page) {
    return Math.min(Math.max(1, page), pageCount());
  }

  function pageOfPost(post) {
    return Math.floor(posts.indexOf(post) / POSTS_PER_PAGE) + 1;
  }

  function postsOnPage(page) {
    var start = (page - 1) * POSTS_PER_PAGE;
    return posts.slice(start, start + POSTS_PER_PAGE);
  }

  function findPost(slug) {
    for (var i = 0; i < posts.length; i++) {
      if (posts[i].slug === slug) return posts[i];
    }
    return null;
  }

  // ---- Drawing ------------------------------------------------------------

  function pagerHtml(page) {
    var total = pageCount();
    if (total < 2) return "";
    var html = "";
    html += page > 1
      ? '<a href="#page=' + (page - 1) + '">&lt; prev</a>'
      : '<span class="disabled">&lt; prev</span>';
    html += '<span class="page-info">[' + page + "/" + total + "]</span>";
    html += page < total
      ? '<a href="#page=' + (page + 1) + '">next &gt;</a>'
      : '<span class="disabled">next &gt;</span>';
    return html;
  }

  function drawSidebar(page, currentSlug) {
    els.list.innerHTML = postsOnPage(page).map(function (post) {
      var active = post.slug === currentSlug ? ' class="active" aria-current="page"' : "";
      return (
        '<li><a href="#post=' + encodeURIComponent(post.slug) + '"' + active + ">" +
        '<span class="file-name">' + esc(post.title) + "</span>" +
        '<span class="file-date">' + esc(post.date) + "</span>" +
        "</a></li>"
      );
    }).join("");
    els.sidePager.innerHTML = pagerHtml(page);
  }

  function promptLine(command) {
    return (
      '<p class="cmd"><span class="prompt">' + esc(PROMPT) + "</span> " +
      '<span class="typed">' + esc(command) + "</span></p>"
    );
  }

  function drawHome(page) {
    var rows = postsOnPage(page).map(function (post) {
      return (
        '<li><a href="#post=' + encodeURIComponent(post.slug) + '">' +
        '<span class="ls-date">' + esc(post.date) + "</span> " +
        '<span class="ls-title">' + esc(post.title) + "</span></a>" +
        '<span class="ls-desc">' + esc(post.description) + "</span></li>"
      );
    }).join("");

    els.content.innerHTML =
      '<section class="term">' +
      promptLine("cat motd.txt") +
      '<div class="output">' +
      '<pre class="banner" aria-hidden="true">' + esc(BANNER) + "</pre>" +
      "<p>Malware analysis, OSINT, red teaming &amp; other dark arts.</p>" +
      "<p>Pick a post and start reading.</p>" +
      "</div>" +
      promptLine("ls -lt posts/") +
      '<ul class="ls">' + rows + "</ul>" +
      '<nav class="pager" aria-label="Pages">' + pagerHtml(page) + "</nav>" +
      '<p class="cmd"><span class="prompt">' + esc(PROMPT) + '</span> <span class="cursor"></span></p>' +
      "</section>";

    setFileName("motd.txt");
    document.title = SITE_TITLE;

    var firstTyped = els.content.querySelector(".typed");
    if (!hasTyped) {
      hasTyped = true;
      typeText(firstTyped);
    }
  }

  function drawPost(post) {
    var index = posts.indexOf(post);
    var newer = posts[index - 1];
    var older = posts[index + 1];

    var nav = "";
    if (older) {
      nav += '<a class="older" href="#post=' + encodeURIComponent(older.slug) + '">&lt; ' + esc(older.title) + "</a>";
    }
    if (newer) {
      nav += '<a class="newer" href="#post=' + encodeURIComponent(newer.slug) + '">' + esc(newer.title) + " &gt;</a>";
    }

    els.content.innerHTML =
      '<article class="post">' +
      '<a class="back" href="#page=' + pageOfPost(post) + '">cd ..</a>' +
      promptLine("cat posts/" + post.file) +
      '<header class="post-header">' +
      "<h1>" + esc(post.title) + "</h1>" +
      '<p class="meta"><time datetime="' + esc(post.date) + '">' + esc(post.date) + "</time>" +
      (post.description ? " :: " + esc(post.description) : "") + "</p>" +
      "</header>" +
      '<div class="post-body">' + window.Markdown.render(post.body) + "</div>" +
      '<nav class="post-nav" aria-label="More posts">' + nav + "</nav>" +
      "</article>";

    setFileName(post.file);
    document.title = post.title + " | " + SITE_TITLE;
  }

  function drawNotFound(slug) {
    els.content.innerHTML =
      '<section class="term">' +
      promptLine("cat posts/" + slug + ".md") +
      '<p class="error">cat: posts/' + esc(slug) + ".md: No such file or directory</p>" +
      '<p><a href="index.html">cd ~/blog</a></p>' +
      "</section>";
    setFileName("error.log");
    document.title = "404 | " + SITE_TITLE;
  }

  function drawError(err) {
    els.content.innerHTML =
      '<section class="term">' +
      '<p class="error">[!] Could not load posts: ' + esc(String(err.message || err)) + "</p>" +
      "<p>If you opened this file directly from disk, start a local web server instead:</p>" +
      "<pre><code>python3 -m http.server 8000</code></pre>" +
      "<p>Then visit http://localhost:8000</p>" +
      "</section>";
  }

  function setFileName(name) {
    els.editorTab.textContent = name;
    els.statusFile.textContent = name;
  }

  // Shows the text of `el` one letter at a time, like someone typing.
  function typeText(el) {
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!el || reduceMotion) return;
    var full = el.textContent;
    var shown = 0;
    el.textContent = "";
    var timer = setInterval(function () {
      shown++;
      el.textContent = full.slice(0, shown);
      if (shown >= full.length) clearInterval(timer);
    }, TYPING_SPEED_MS);
  }

  // Redraws everything based on the address bar.
  function route() {
    var state = readHash();
    var post = state.post ? findPost(state.post) : null;

    if (state.post && post) {
      drawSidebar(pageOfPost(post), post.slug);
      drawPost(post);
    } else if (state.post) {
      drawSidebar(1, null);
      drawNotFound(state.post);
    } else {
      var page = clampPage(state.page);
      drawSidebar(page, null);
      drawHome(page);
    }

    els.content.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  loadPosts()
    .then(function () {
      els.statusCount.textContent = posts.length + (posts.length === 1 ? " post" : " posts");
      window.addEventListener("hashchange", route);
      route();
    })
    .catch(drawError);
})();
