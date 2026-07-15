/* EXOS Claims desk helpers — keep this file small and early-safe. */

(function () {
  var TARGET = "/desk/exos-claims";
  var STALE = [
    "exos-claims-control-center",
    "EXOS%20Claims%20Control%20Center",
    "exos%20claims%20control%20center",
  ];

  function isStalePath(path) {
    path = (path || "").toLowerCase();
    for (var i = 0; i < STALE.length; i++) {
      if (path.indexOf(STALE[i].toLowerCase()) !== -1) {
        return true;
      }
    }
    return false;
  }

  // Hard redirect before desk finishes routing (avoids "Page not found").
  if (isStalePath(window.location.pathname)) {
    window.location.replace(TARGET);
    return;
  }

  // Portal-aligned primary accents (mint CTA) — reinforces exos_theme.css.
  function paintPortalTheme() {
    if (document.getElementById("exos-desk-portal-theme")) return;
    var s = document.createElement("style");
    s.id = "exos-desk-portal-theme";
    s.textContent =
      ':root,body[data-theme="light"],body[data-theme="dark"]{' +
      "--primary:#5fd39a!important;--primary-color:#5fd39a!important;" +
      "--btn-primary-bg:#5fd39a!important;--btn-primary-color:#001333!important;" +
      "--link-color:#3db87a!important;--checkbox-color:#5fd39a!important;" +
      "--progress-bar-bg:#5fd39a!important}" +
      ".btn-primary,.btn-primary:not(:disabled),.page-actions .btn-primary{" +
      "background:#5fd39a!important;border-color:#5fd39a!important;color:#001333!important;font-weight:700!important}" +
      ".btn-primary:hover,.btn-primary:focus,.btn-primary:active{" +
      "background:#3db87a!important;border-color:#3db87a!important;color:#fff!important}" +
      ".btn-link{color:#3db87a!important}" +
      "input:focus,textarea:focus,select:focus,.frappe-control input:focus{" +
      "border-color:#5fd39a!important;box-shadow:0 0 0 3px rgba(95,211,154,.28)!important}" +
      ".standard-sidebar-item.selected,.desk-sidebar .sidebar-item-container.selected{" +
      "box-shadow:inset 3px 0 0 #5fd39a!important}" +
      ".form-tabs .nav-link.active{color:#3db87a!important;border-bottom-color:#5fd39a!important}" +
      ".progress-bar{background-color:#5fd39a!important}";
    (document.head || document.documentElement).appendChild(s);
  }

  paintPortalTheme();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", paintPortalTheme);
  }
})();

frappe.ready(function () {
  var path = window.location.pathname || "";

  if (
    path.toLowerCase().indexOf("exos-claims-control-center") !== -1 ||
    path.toLowerCase().indexOf("exos%20claims%20control%20center") !== -1
  ) {
    window.location.replace("/desk/exos-claims");
    return;
  }

  var onHome =
    path === "/desk" ||
    path === "/desk/" ||
    path === "/app" ||
    path === "/app/" ||
    path === "/app/home" ||
    path === "/desk/home" ||
    path.endsWith("/workspaces/home");

  if (onHome) {
    window.location.replace("/desk/exos-claims");
  }
});

frappe.ui.keys.add_shortcut({
  shortcut: "ctrl+shift+e",
  action: function () {
    window.location.assign("/desk/exos-claims");
  },
  description: __("Open EXOS Claims"),
});
