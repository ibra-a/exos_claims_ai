frappe.ready(function () {
  var workspace = "EXOS Claims";
  var workspaceSlug = "exos-claims";

  // Fix stale routes like /desk/exos-claims-control-center after title changes.
  if (window.location.pathname.indexOf("exos-claims-control-center") !== -1) {
    frappe.set_route("Workspaces", workspace);
    return;
  }

  var path = window.location.pathname || "";
  var onHome =
    path === "/desk" ||
    path === "/desk/" ||
    path === "/app" ||
    path === "/app/" ||
    path === "/app/home" ||
    path === "/desk/home" ||
    path.endsWith("/workspaces/home");

  if (onHome) {
    frappe.set_route("Workspaces", workspace);
  }
});

frappe.ui.keys.add_shortcut({
  shortcut: "ctrl+shift+e",
  action: function () {
    frappe.set_route("Workspaces", "EXOS Claims");
  },
  description: __("Open EXOS Claims"),
});
