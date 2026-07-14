app_name = "exos_claims_ai"
app_title = "EXOS Claims AI"
app_publisher = "EXOS"
app_description = "ERPNext AI-powered Claims Validation Platform"
app_email = "info@exoscorp.com"
app_license = "MIT"

required_apps = ["erpnext"]

# No install-time fixtures. Roles, workspace, workflow, and demo data
# are created via bootstrap CLI after the site is Active.

doctype_js = {
    "Insurance Claim": "public/js/insurance_claim.js",
}

app_include_css = "/assets/exos_claims_ai/css/exos_theme.css"
app_include_js = "/assets/exos_claims_ai/js/exos_desk.js"

boot_session = "exos_claims_ai.boot.boot_session"

add_to_apps_screen = [
    {
        "name": "exos_claims_ai",
        "logo": "/assets/exos_claims_ai/images/exos-logo.png",
        "title": "EXOS Claims",
        "route": "/desk/exos-claims",
        "has_permission": "exos_claims_ai.api.has_app_permission",
    }
]

app_logo_url = "/assets/exos_claims_ai/images/exos-logo.png"
website_context = {
    "favicon": "/assets/exos_claims_ai/images/exos-favicon.png",
    "splash_image": "/assets/exos_claims_ai/images/exos-logo.png",
}

after_install = "exos_claims_ai.install.after_install"
after_migrate = "exos_claims_ai.install.after_migrate"

