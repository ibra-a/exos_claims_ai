frappe.ready(function () {
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
    frappe.set_route("Workspaces", "EXOS Claims");
  }
});

frappe.ui.keys.add_shortcut({
  shortcut: "ctrl+shift+e",
  action: function () {
    frappe.set_route("Workspaces", "EXOS Claims");
  },
  description: __("Open EXOS Claims Control Center"),
});
