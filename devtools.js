// devtools.js
chrome.devtools.panels.create("SQL Pretty Printer", "", "panel.html", function (panel) {
  console.log("DevTools panel created");
});
