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
    "https://widget-frontend-three.vercel.app/chat/" +
    slug +
    "?embed=1";

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
    "z-index:999999",
    "transition:width .25s ease,height .25s ease,bottom .25s ease,right .25s ease",
  ].join(";");

  document.body.appendChild(iframe);

  function resizeWidget(isOpen) {
    const mobile = window.innerWidth < 640;

    if (isOpen) {
      if (mobile) {
        iframe.style.width = "100vw";
        iframe.style.height = "100dvh";
        iframe.style.bottom = "0";
        iframe.style.right = "0";
      } else {
        iframe.style.width = "400px";
        iframe.style.height = "600px";
        iframe.style.bottom = "24px";
        iframe.style.right = "24px";
      }
    } else {
      iframe.style.width = "64px";
      iframe.style.height = "64px";
      iframe.style.bottom = "24px";
      iframe.style.right = "24px";
    }
  }

  window.addEventListener("message", function (event) {
    if (!event.data) return;

    if (event.data.source !== "hotelbot") return;

    switch (event.data.type) {
      case "open":
        resizeWidget(true);
        break;

      case "close":
        resizeWidget(false);
        break;

      default:
        break;
    }
  });

  window.addEventListener("resize", function () {
    const open =
      iframe.style.width !== "64px" ||
      iframe.style.height !== "64px";

    resizeWidget(open);
  });
})();