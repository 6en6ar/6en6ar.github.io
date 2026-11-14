/*
 * markdown.js - a tiny, safe Markdown renderer.
 *
 * Supported syntax:
 *   # Heading 1 ... ###### Heading 6
 *   **bold**, *italic*, `inline code`, ~~strike~~
 *   [link text](https://example.com)
 *   ![image alt text](images/picture.png)
 *   ```           (fenced code blocks)
 *   - item / * item / 1. item   (lists)
 *   > quote
 *   ---           (horizontal line)
 *
 * Security: ALL text is HTML-escaped first, so raw HTML inside a post is
 * shown as text and never executed. Links/images only allow safe URLs.
 */
(function () {
  "use strict";

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Allow http(s), mailto, in-page anchors and relative paths. Block
  // everything else (javascript:, data:, vbscript:, ...).
  function safeUrl(url) {
    var clean = url.trim();
    if (/^(https?:|mailto:)/i.test(clean)) return clean;
    if (/^[a-z][a-z0-9+.-]*:/i.test(clean)) return "#";
    if (clean.indexOf("//") === 0) return "#";
    return clean;
  }

  function isExternal(url) {
    return /^https?:/i.test(url);
  }

  // Turns one line of text into HTML (bold, links, code, ...).
  function renderInline(text) {
    // Code, links and images are swapped for placeholders so that
    // bold/italic rules can't break the characters inside them.
    var saved = [];
    function keep(html) {
      saved.push(html);
      return "\u0000" + (saved.length - 1) + "\u0000";
    }

    text = text.replace(/`([^`]+)`/g, function (_, code) {
      return keep("<code>" + escapeHtml(code) + "</code>");
    });

    text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, function (_, alt, src) {
      return keep(
        '<img src="' + escapeHtml(safeUrl(src)) + '" alt="' + escapeHtml(alt) +
        '" loading="lazy">'
      );
    });

    text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (_, label, href) {
      var url = safeUrl(href);
      var extra = isExternal(url) ? ' target="_blank" rel="noopener noreferrer"' : "";
      return keep(
        '<a href="' + escapeHtml(url) + '"' + extra + ">" + renderEmphasis(escapeHtml(label)) + "</a>"
      );
    });

    text = renderEmphasis(escapeHtml(text));

    return text.replace(/\u0000(\d+)\u0000/g, function (_, i) {
      return saved[Number(i)];
    });
  }

  function renderEmphasis(html) {
    return html
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/~~(.+?)~~/g, "<del>$1</del>");
  }

  // Turns a whole Markdown document into HTML.
  function render(markdown) {
    var lines = markdown.replace(/\r\n?/g, "\n").split("\n");
    var html = [];
    var i = 0;

    while (i < lines.length) {
      var line = lines[i];

      // Fenced code block: ``` ... ```
      if (/^```/.test(line)) {
        var code = [];
        i++;
        while (i < lines.length && !/^```/.test(lines[i])) {
          code.push(lines[i]);
          i++;
        }
        i++; // skip closing ```
        html.push("<pre><code>" + escapeHtml(code.join("\n")) + "</code></pre>");
        continue;
      }

      if (line.trim() === "") {
        i++;
        continue;
      }

      var heading = line.match(/^(#{1,6})\s+(.*)$/);
      if (heading) {
        var level = heading[1].length;
        html.push("<h" + level + ">" + renderInline(heading[2]) + "</h" + level + ">");
        i++;
        continue;
      }

      if (/^(-{3,}|\*{3,})\s*$/.test(line)) {
        html.push("<hr>");
        i++;
        continue;
      }

      if (/^>\s?/.test(line)) {
        var quote = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) {
          quote.push(lines[i].replace(/^>\s?/, ""));
          i++;
        }
        html.push("<blockquote>" + render(quote.join("\n")) + "</blockquote>");
        continue;
      }

      if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
        var ordered = /^\s*\d+\./.test(line);
        var items = [];
        while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i])) {
          items.push("<li>" + renderInline(lines[i].replace(/^\s*([-*+]|\d+\.)\s+/, "")) + "</li>");
          i++;
        }
        var tag = ordered ? "ol" : "ul";
        html.push("<" + tag + ">" + items.join("") + "</" + tag + ">");
        continue;
      }

      // Paragraph: keep reading until an empty line or another block starts.
      var para = [];
      while (
        i < lines.length &&
        lines[i].trim() !== "" &&
        !/^(```|#{1,6}\s|>|\s*([-*+]|\d+\.)\s+)/.test(lines[i])
      ) {
        para.push(lines[i].trim());
        i++;
      }
      html.push("<p>" + renderInline(para.join(" ")) + "</p>");
    }

    return html.join("\n");
  }

  // Splits the "--- key: value ---" header from the post body.
  function parseFrontMatter(text) {
    var meta = {};
    var body = text.replace(/\r\n?/g, "\n");
    var match = body.match(/^---\n([\s\S]*?)\n---\n?/);
    if (match) {
      match[1].split("\n").forEach(function (row) {
        var pos = row.indexOf(":");
        if (pos > 0) {
          meta[row.slice(0, pos).trim().toLowerCase()] = row.slice(pos + 1).trim();
        }
      });
      body = body.slice(match[0].length);
    }
    return { meta: meta, body: body };
  }

  window.Markdown = {
    render: render,
    parseFrontMatter: parseFrontMatter,
    escapeHtml: escapeHtml
  };
})();
