;(async () => {
  const config = {
    cookieName: "{{ .Site.Params.editAccess.cookieName | default "edit_access" }}",
    cookieDurationDays: {{ .Site.Params.editAccess.cookieDurationDays | default 7 }},
    queryParam: "{{ .Site.Params.editAccess.queryParam | default "edit" }}",
    password: "{{ .Site.Params.editAccess.password | default "" }}",
    allowedSections: {{ if .Site.Params.editAccess.allowedSections }}{{ jsonify .Site.Params.editAccess.allowedSections }}{{ else }}null{{ end }},
    currentSection: "{{ .Section }}",
  };

  {{- $editURL := "" -}}
  {{- if .IsPage -}}
    {{- $url := .Params.editURL | default (.Site.Params.article.editURL | default "") -}}
    {{- $slash := "" -}}
    {{- if .Params.editAppendPath | default ( .Site.Params.article.editAppendPath | default false ) -}}
      {{- if ne (substr $url -1 1) "/" -}}
        {{- $slash = "/" -}}
      {{- end -}}
      {{- if .File -}}
        {{- $url = printf "%s%s%s" $url $slash (path.Join .File.Path) -}}
      {{- end -}}
    {{- end -}}
    {{- $editURL = $url -}}
  {{- end -}}
  const editUrl = {{ printf "%q" $editURL }};

  const hasCookie = () =>
    document.cookie.split("; ").some((c) => c.startsWith(`${config.cookieName}=`));

  const setCookie = () => {
    const expires = new Date(Date.now() + config.cookieDurationDays * 864e5).toUTCString();
    document.cookie = `${config.cookieName}=1; path=/; expires=${expires}`;
  };

  const clearCookie = () => {
    document.cookie = `${config.cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  };

  const markAccess = () => document.documentElement.classList.add("has-edit-access");

  const appendEditLink = () => {
    if (config.allowedSections && !config.allowedSections.includes(config.currentSection)) return;
    if (!editUrl) return;
    const meta =
      document.querySelector("#single_header .mt-1.mb-6") ||
      document.querySelector("header#single_header .mt-1.mb-6");
    if (!meta) return;
    if (meta.querySelector("[data-edit-link]")) return;

    if (meta.children.length) {
      const dot = document.createElement("span");
      dot.className = "px-2 text-primary-500";
      dot.innerHTML = "&middot;";
      meta.appendChild(dot);
    }

    const span = document.createElement("span");
    span.className = "mb-[2px]";
    span.setAttribute("data-edit-link", "");
    span.innerHTML = `<a href="${editUrl}" class="text-lg hover:text-primary-500" rel="noopener noreferrer" target="_blank" title="Editer cet article">✎</a>`;
    meta.appendChild(span);
  };

  const updateToggleButton = () => {
    const btn = document.querySelector(".edit-toggle-floating a");
    if (!btn) return;
    const param = `${config.queryParam}=`;
    if (hasCookie()) {
      btn.href = `${location.pathname}?${param}logout`;
      btn.textContent = "✕";
      btn.title = "Quitter l'édition";
    } else {
      btn.href = `${location.pathname}?${param}1`;
      btn.textContent = "✎";
      btn.title = "Activer l'édition";
    }
  };

  const askPassword = () =>
    new Promise((resolve) => {
      const overlay = document.createElement("div");
      Object.assign(overlay.style, {
        position: "fixed",
        inset: "0",
        background: "rgba(0,0,0,0.35)",
        zIndex: "9999",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      });

      const dialog = document.createElement("div");
      Object.assign(dialog.style, {
        background: "#fff",
        borderRadius: "12px",
        padding: "18px 18px 14px",
        width: "min(320px, 90vw)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      });

      const title = document.createElement("div");
      title.textContent = "Mot de passe édition";
      Object.assign(title.style, {
        fontWeight: "700",
        marginBottom: "10px",
        color: "#1f2937",
        fontSize: "15px",
      });

      const form = document.createElement("form");
      form.autocomplete = "off";

      const input = document.createElement("input");
      Object.assign(input, { type: "password", required: true });
      Object.assign(input.style, {
        width: "100%",
        padding: "10px 12px",
        borderRadius: "10px",
        border: "1px solid #d1d5db",
        fontSize: "14px",
        marginBottom: "12px",
        outline: "none",
        boxSizing: "border-box",
      });

      const btnRow = document.createElement("div");
      Object.assign(btnRow.style, {
        display: "flex",
        justifyContent: "flex-end",
        gap: "8px",
      });

      const cancel = document.createElement("button");
      cancel.type = "button";
      cancel.textContent = "Annuler";
      Object.assign(cancel.style, {
        padding: "8px 12px",
        borderRadius: "10px",
        border: "1px solid #d1d5db",
        background: "#f3f4f6",
        cursor: "pointer",
      });

      const submit = document.createElement("button");
      submit.type = "submit";
      submit.textContent = "Valider";
      Object.assign(submit.style, {
        padding: "8px 12px",
        borderRadius: "10px",
        border: "1px solid #2f5338",
        background: "#396743",
        color: "#fff",
        cursor: "pointer",
      });

      const cleanup = (value = null) => {
        overlay.remove();
        resolve(value);
      };

      cancel.addEventListener("click", () => cleanup(null));
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) cleanup(null);
      });
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        cleanup(input.value);
      });

      btnRow.append(cancel, submit);
      form.append(input, btnRow);
      dialog.append(title, form);
      overlay.append(dialog);
      document.body.append(overlay);
      input.focus();
    });

  const params = new URL(window.location.href).searchParams;
  const editParam = params.get(config.queryParam);

  if (editParam === "logout") {
    clearCookie();
    document.documentElement.classList.remove("has-edit-access");
    document.querySelectorAll("[data-edit-link]").forEach((el) => {
      el.style.display = "none";
    });
    updateToggleButton();
    return;
  }

  if (hasCookie()) {
    markAccess();
    appendEditLink();
    updateToggleButton();
    return;
  }

  if (editParam !== null) {
    if (!config.password) {
      console.warn("editAccess.password est vide : configure-le dans params.toml");
      return;
    }

    const answer = await askPassword();
    if (answer === config.password) {
      setCookie();
      markAccess();
      appendEditLink();
      updateToggleButton();
    } else {
      console.warn("Mot de passe d'édition incorrect.");
    }
  }

  // Initial toggle state on first load (no cookie, no prompt)
  updateToggleButton();
})();
