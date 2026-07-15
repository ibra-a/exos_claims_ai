// Companion JS for /login (docs.frappe.io Portal Pages)
(function () {
  function paint() {
    if (document.getElementById("exos-login-theme-css")) return;
    var path = (document.body && document.body.getAttribute("data-path")) || "";
    if (path !== "login" && path !== "forgot") return;
    var s = document.createElement("style");
    s.id = "exos-login-theme-css";
    s.textContent = [
      'html body[data-path="login"], body[data-path="login"] {',
      '  background-color: #001333 !important;',
      '  background-image: radial-gradient(900px 520px at 50% 12%, rgba(95,211,154,.14), transparent 55%), linear-gradient(180deg, #06122c, #001333) !important;',
      '  min-height: 100vh !important;',
      '}',
      'body[data-path="login"] .web-footer { display: none !important; }',
      'body[data-path="login"] .for-login .page-card .page-card-actions .btn-login {',
      '  background: #5fd39a !important; color: #001333 !important; border: none !important; font-weight: 700 !important;',
      '}',
      'body[data-path="login"] .for-login .forgot-password-message a,',
      'body[data-path="login"] .for-login .page-card .page-card-actions .btn-login-option { color: #3db87a !important; font-weight: 600 !important; }'
    ].join("\n");
    (document.head || document.documentElement).appendChild(s);
  }
  paint();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", paint);
})();
