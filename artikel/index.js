import { fetchContent } from "/fetchContent.js";

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

await (async () => {
  const filename = getFilename();
  if (!filename) {
    setState("error", "Es wurde keine Datei angegeben.");
  }
  const content = await fetchContent(filename, (error) =>
    setState("error", error)
  );
  if (content) setState("success", content.html);
})();
