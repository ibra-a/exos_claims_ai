app_name = "exos_claims_ai"
app_title = "EXOS Claims AI"
app_publisher = "EXOS"
app_description = "ERPNext AI-powered Claims Validation Platform"
app_email = "info@exoscorp.com"
app_license = "MIT"

required_apps = ["erpnext"]

fixtures = [
    {"dt": "Role", "filters": [["name", "in", ["Claims Officer", "Claims Manager", "Finance Manager"]]]},
    {"dt": "Workflow", "filters": [["name", "=", "Insurance Claim Workflow"]]},
    {"dt": "Server Script", "filters": [["name", "in", ["Validate Claim With AI API", "Ask Claim Assistant API"]]]},
    {"dt": "Number Card", "filters": [["name", "in", ["Claims Pending Validation", "Claims Approved", "Claims Rejected", "Claims Waiting Approval"]]]},
    {"dt": "Workspace", "filters": [["name", "=", "EXOS Claims Control Center"]]},
    {"dt": "Approval Rule Configuration"},
]

doctype_js = {
    "Insurance Claim": "public/js/insurance_claim.js",
}

app_include_css = "/assets/exos_claims_ai/css/exos_theme.css"

