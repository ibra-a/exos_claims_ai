import frappe

LOGO_URL = "/assets/exos_claims_ai/images/exos-logo.png"


def after_install() -> None:
    try:
        apply_branding()
        apply_theme_defaults()
    except Exception:
        frappe.log_error("EXOS branding skipped during install")


def after_migrate() -> None:
    try:
        apply_branding()
        apply_theme_defaults()
    except Exception:
        frappe.log_error("EXOS branding skipped during migrate")


def apply_branding() -> None:
    frappe.db.set_single_value("Navbar Settings", "app_logo", LOGO_URL)
    frappe.db.set_single_value("Website Settings", "app_logo", LOGO_URL)
    frappe.db.set_single_value("Website Settings", "splash_image", LOGO_URL)
    frappe.db.set_single_value("Website Settings", "banner_image", LOGO_URL)
    frappe.db.set_single_value("Website Settings", "app_name", "EXOS Claims")
    frappe.db.set_single_value("System Settings", "app_name", "EXOS Claims")
    frappe.db.commit()


def apply_theme_defaults() -> None:
    """Prefer Light desk theme so EXOS branding stays high-contrast."""
    # System Settings: disable Dark Mode toggle when field exists (Frappe v16+)
    for field, value in (
        ("disable_dark_mode", 1),
        ("disable_darkmode", 1),
    ):
        try:
            if frappe.db.has_column("System Settings", field):
                frappe.db.set_single_value("System Settings", field, value)
                break
        except Exception:
            pass

    # Current user + all System Managers fallback to Light
    users = {frappe.session.user} if frappe.session.user not in ("", "Guest") else set()
    try:
        for row in frappe.get_all("Has Role", filters={"role": "System Manager"}, fields=["parent"]):
            users.add(row.parent)
    except Exception:
        pass

    for user in users:
        if user in ("Guest", "Administrator") or "@" not in str(user):
            # Still allow Administrator
            if user != "Administrator":
                continue
        try:
            if frappe.db.has_column("User", "desk_theme"):
                frappe.db.set_value("User", user, "desk_theme", "Light")
        except Exception:
            pass

    frappe.db.commit()
