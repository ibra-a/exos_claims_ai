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
