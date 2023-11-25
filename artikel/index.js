function getFilename() {
  const params = new URL(location.href).searchParams;
  return params.get("datei");
}

function setState(newState, payload) {
  const contentEl = document.getElementsByClassName("content__success")[0];
  const loadingEl = document.getElementsByClassName("content__loading")[0];
  const errorEl = document.getElementsByClassName("content__error")[0];

  switch (newState) {
    case "success":
      contentEl.innerHTML = payload;
      if (!loadingEl.classList.contains("hidden"))
        loadingEl.classList.add("hidden");
      if (!errorEl.classList.contains("hidden"))
        errorEl.classList.add("hidden");
      if (contentEl.classList.contains("hidden"))
        contentEl.classList.remove("hidden");
      break;
    case "error":
      errorEl.innerHTML = payload;
      if (!loadingEl.classList.contains("hidden"))
        loadingEl.classList.add("hidden");
      if (errorEl.classList.contains("hidden"))
        errorEl.classList.remove("hidden");
      if (!contentEl.classList.contains("hidden"))
        contentEl.classList.add("hidden");
      break;
    case "loading":
      if (loadingEl.classList.contains("hidden"))
        loadingEl.classList.remove("hidden");
      if (!errorEl.classList.contains("hidden"))
        errorEl.classList.add("hidden");
      if (!contentEl.classList.contains("hidden"))
        contentEl.classList.add("hidden");
      break;
  }
}

async function getContent(filename) {
  const isHTML = posix.extname(filename ?? "") === ".html";
  const isMarkdown = posix.extname(filename ?? "") === ".md";
  if (!isHTML && !isMarkdown) {
    setState(
      "error",
      `Expected a .md or a .html file, received "${filename}".`
    );
    return;
  }

  const url = `content/${filename}`;
  return await fetch(url)
    .then((res) => {
      if (res.ok) return res;
      setState("error", `Error while fetching resource: HTTP ${res.status}`);
    })
    .then((res) => res?.text())
    .then((response) => {
      if (!response) return;
      if (isHTML) return response;

      const converter = new showdown.Converter();
      return converter.makeHtml(response);
    })
    .catch((error) => setState("error", String(error)));
}

await (async () => {
  const filename = getFilename();
  const content = await getContent(filename);
  if (content) setState("success", content);
})();
