(function () {
  if (window.__hotelBotLoaded) return;
  window.__hotelBotLoaded = true;

  const script = document.currentScript;
  const slug = script?.dataset?.chatbotSlug;

  if (!slug) {
    console.error("HotelBot: Missing data-chatbot-slug attribute.");
    return;
  }

  const iframe = document.createElement("iframe");

  iframe.src =
    "https://widget-frontend-three.vercel.app/chat/" + slug + "?embed=1";

  iframe.id = "hotelbot-widget";

  iframe.style.cssText = [
    "position:fixed",
    "bottom:24px",
    "right:24px",
    "width:64px",
    "height:64px",
    "border:none",
    "background:transparent",
    "overflow:hidden",
    "border-radius:9999px",
    "z-index:999999",
    "transition:width .25s ease,height .25s ease,bottom .25s ease,right .25s ease,border-radius .2s ease",
  ].join(";");

  document.body.appendChild(iframe);

  let currentState = "closed"; // "closed" | "open" | "expanded"

  function resizeWidget(state) {
    currentState = state;
    const mobile = window.innerWidth < 640;

    if (state === "closed") {
      iframe.style.width = "64px";
      iframe.style.height = "64px";
      iframe.style.bottom = "24px";
      iframe.style.right = "24px";
      iframe.style.borderRadius = "9999px";
      return;
    }

    if (mobile) {
      // Leaves a visible margin around the panel instead of covering the
      // whole screen, so the site underneath is still visible.
      iframe.style.width = "calc(100vw - 24px)";
      iframe.style.height = "calc(100dvh - 96px)";
      iframe.style.bottom = "12px";
      iframe.style.right = "12px";
      iframe.style.borderRadius = "16px";
      return;
    }

    if (state === "expanded") {
      iframe.style.width = "min(680px, 90vw)";
      iframe.style.height = "min(720px, 85vh)";
    } else {
      // Slightly smaller default than before (was 400x600).
      iframe.style.width = "380px";
      iframe.style.height = "560px";
    }
    iframe.style.bottom = "24px";
    iframe.style.right = "24px";
    iframe.style.borderRadius = "16px";
  }

  window.addEventListener("message", function (event) {
    if (!event.data) return;
    if (event.data.source !== "hotelbot") return;

    switch (event.data.type) {
      case "open":
        resizeWidget("open");
        break;
      case "expand":
        resizeWidget("expanded");
        break;
      case "close":
        resizeWidget("closed");
        break;
      default:
        break;
    }
  });

  window.addEventListener("resize", function () {
    resizeWidget(currentState);
  });
})();