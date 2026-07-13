import frappe

LOGO_URL = "/assets/exos_claims_ai/images/exos-logo.png"


def after_install() -> None:
    try:
        apply_branding()
    except Exception:
        frappe.log_error("EXOS branding skipped during install")


def after_migrate() -> None:
    try:
        apply_branding()
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
