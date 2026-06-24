(function () {
  const iframe = document.createElement("iframe");
  iframe.src = "http://localhost:3000/chat/" + window.HotelBotSlug;
  iframe.style.cssText = [
    "position:fixed",
    "bottom:0",
    "right:0",
    "width:400px",
    "height:600px",
    "border:none",
    "z-index:9999",
    "background:transparent"
  ].join(";");
  document.body.appendChild(iframe);
})();