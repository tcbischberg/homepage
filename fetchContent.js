/**
 * @param {string} html
 */
function parseHtml(html) {
  const dummyEl = document.createElement("html");
  dummyEl.innerHTML = html;

  const metaEls = [...dummyEl.querySelectorAll("meta")];
  const metadata = metaEls.reduce(
    (acc, metaEl) => ({ ...acc, [metaEl.name]: metaEl.content }),
    {}
  );

  const headEls = dummyEl.querySelectorAll("head");
  headEls.forEach((headEl) => headEl.parentElement.removeChild(headEl));
  const html = dummyEl.innerHTML;

  return { html, metadata };
}

/**
 * @param {string} markdown
 */
function parseMarkdown(markdown) {
  const converter = new showdown.Converter({ metadata: true });
  /** @type {string} */
  const html = converter.makeHtml(markdown);
  /** @type {{}} */
  const metadata = converter.getMetadata();

  return { html, metadata };
}

/**
 * @param {string} filename
 */
async function fetchContent(filename, onError = () => {}) {
  if (!window.showdown) {
    onError("Missing import for showdown");
  }

  const isHTML = posix.extname(filename ?? "") === ".html";
  const isMarkdown = posix.extname(filename ?? "") === ".md";
  if (!isHTML && !isMarkdown) {
    onError(`Expected a .md or a .html file, received "${filename}".`);
    return;
  }

  const url = `content/${filename}`;
  return await fetch(url)
    .then((res) => {
      if (res.ok) return res;
      onError(`Error while fetching resource: HTTP ${res.status}`);
    })
    .then((res) => res?.text())
    .then((response) => {
      if (!response) return;
      if (isHTML) return parseHtml(response);

      return parseMarkdown(response);
    })
    .catch((error) => onError(String(error)));
}
