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

  // The iframe's own box is deliberately narrower than a phone screen
  // even on desktop (380-520px), so the widget's own React code can't
  // reliably tell "mobile" from its own width — it has to be told the
  // real host-page viewport width instead. We seed it via query param
  // for first paint, then keep it live via postMessage below.
  const isRealMobile = () => window.innerWidth < 640;

  iframe.src =
    "https://widget-frontend-three.vercel.app/chat/" +
    slug +
    "?embed=1&mobile=" +
    (isRealMobile() ? "1" : "0");

  iframe.id = "hotelbot-widget";

  // Shadow states kept separate from size states so the shadow can ease
  // in/out at the same time as the width/height/border-radius change —
  // this is what makes the resize read as "premium" rather than a flat
  // instant snap.
  const SHADOWS = {
    closed: "0 8px 24px rgba(0,0,0,.18)",
    open: "0 20px 50px -12px rgba(15,23,42,.28), 0 8px 20px -8px rgba(15,23,42,.18)",
    expanded:
      "0 26px 64px -12px rgba(15,23,42,.38), 0 10px 28px -8px rgba(15,23,42,.24)",
  };

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
    "transition:width .24s cubic-bezier(.22,.61,.36,1),height .24s cubic-bezier(.22,.61,.36,1),bottom .24s cubic-bezier(.22,.61,.36,1),right .24s cubic-bezier(.22,.61,.36,1),border-radius .24s cubic-bezier(.22,.61,.36,1),box-shadow .24s cubic-bezier(.22,.61,.36,1)",
    "box-shadow:" + SHADOWS.closed,
  ].join(";");

  document.body.appendChild(iframe);

  function postViewport() {
    iframe.contentWindow?.postMessage(
      { source: "hotelbot-host", type: "viewport", mobile: isRealMobile() },
      "*"
    );
  }

  // The query param above only covers first paint. Once the widget's own
  // React app has mounted and attached its message listener, push a live
  // update too, in case the param was stale or the real window is resized
  // later (e.g. rotating a tablet, or resizing a desktop browser).
  iframe.addEventListener("load", postViewport);

  let currentState = "closed";

  function resizeWidget(state) {
    currentState = state;

    const mobile = isRealMobile();

    if (state === "closed") {
      iframe.style.width = "64px";
      iframe.style.height = "64px";
      iframe.style.bottom = "24px";
      iframe.style.right = "24px";
      iframe.style.borderRadius = "9999px";
      iframe.style.boxShadow = SHADOWS.closed;
      return;
    }

    if (mobile) {
      // Deliberately short of the full viewport (never 100vh/100dvh) so
      // a strip of the page stays visible behind the widget — the user
      // should always feel like they're still on the site, not inside
      // a takeover screen.
      iframe.style.width = "calc(100vw - 24px)";
      iframe.style.height = "min(87dvh, 720px)";
      iframe.style.bottom = "12px";
      iframe.style.right = "12px";
      iframe.style.borderRadius = "18px";
      iframe.style.boxShadow = SHADOWS.open;
      return;
    }

    if (state === "expanded") {
      iframe.style.width = "min(520px, calc(100vw - 32px))";
      iframe.style.height = "min(700px, calc(100vh - 32px))";
      iframe.style.boxShadow = SHADOWS.expanded;
    } else {
      iframe.style.width = "380px";
      iframe.style.height = "560px";
      iframe.style.boxShadow = SHADOWS.open;
    }

    iframe.style.bottom = "24px";
    iframe.style.right = "24px";
    iframe.style.borderRadius = "18px";
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

      case "collapse":
        resizeWidget("open");
        break;

      case "close":
        resizeWidget("closed");
        break;
    }
  });

  window.addEventListener("resize", function () {
    resizeWidget(currentState);
    postViewport();
  });
})();