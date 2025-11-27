function mixColor(from, to, t) {
  const clampT = Math.min(Math.max(t, 0), 1);
  const ch = from.map((c, i) => Math.round(c + (to[i] - c) * clampT));
  return `rgb(${ch[0]}, ${ch[1]}, ${ch[2]})`;
}

function setBackgroundBlur(targetId, scrollDivisor = 300, disableBlur = false, isMenuBlur = false) {
  if (!targetId) {
    console.error("data-blur-id is null");
    return;
  }
  const blurElement = document.getElementById(targetId);
  if (!blurElement) return;
  if (disableBlur) {
    blurElement.setAttribute("aria-hidden", "true");
    if (!isMenuBlur) {
      blurElement.style.display = "none";
      blurElement.style.opacity = "0";
    } else {
      blurElement.style.display = "";
    }
  } else {
    blurElement.style.display = "";
    blurElement.removeAttribute("aria-hidden");
  }
  const updateBlur = () => {
    if (!disableBlur || isMenuBlur) {
      const scroll = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const baseOpacity = isMenuBlur ? 0.2 : 0;
      const t = Math.min(1, scroll / scrollDivisor);
      const nextOpacity = Math.min(1, baseOpacity + scroll / scrollDivisor);
      if (isMenuBlur) {
        const start = [57, 103, 67]; // #396743
        const end = [150, 150, 150]; // gris doux
        blurElement.style.backgroundColor = mixColor(start, end, t);
      }
      blurElement.style.opacity = nextOpacity;
    }
  };
  blurElement.setAttribute("role", "presentation");
  blurElement.setAttribute("tabindex", "-1");
  window.addEventListener("scroll", updateBlur);
  updateBlur();
}

document.querySelectorAll("script[data-blur-id]").forEach((script) => {
  const targetId = script.getAttribute("data-blur-id");
  const scrollDivisor = Number(script.getAttribute("data-scroll-divisor") || 300);
  const isMenuBlur = targetId === "menu-blur";
  const settings = JSON.parse(localStorage.getItem("a11ySettings") || "{}");
  const disableBlur = settings.disableBlur || false;
  setBackgroundBlur(targetId, scrollDivisor, disableBlur, isMenuBlur);
});
