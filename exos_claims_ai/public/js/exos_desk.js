frappe.ready(function () {
  if (window.location.pathname === "/app" || window.location.pathname === "/app/home") {
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
