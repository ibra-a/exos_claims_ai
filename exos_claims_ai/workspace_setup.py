import json

import frappe

WORKSPACE_NAME = "EXOS Claims"

WORKSPACE_LINKS = [
    {"type": "Card Break", "label": "Claims Operations", "link_count": 0},
    {"type": "Link", "label": "Insurance Claim", "link_type": "DocType", "link_to": "Insurance Claim", "onboard": 0},
    {"type": "Link", "label": "Insurance Policy", "link_type": "DocType", "link_to": "Insurance Policy", "onboard": 0},
    {"type": "Link", "label": "AI Validation Result", "link_type": "DocType", "link_to": "AI Validation Result", "onboard": 0},
    {"type": "Card Break", "label": "Configuration", "link_count": 0},
    {
        "type": "Link",
        "label": "Approval Rule Configuration",
        "link_type": "DocType",
        "link_to": "Approval Rule Configuration",
        "onboard": 0,
    },
]

WORKSPACE_SHORTCUTS = [
    {"type": "DocType", "link_to": "Insurance Claim", "label": "Insurance Claim"},
    {"type": "DocType", "link_to": "Insurance Policy", "label": "Insurance Policy"},
    {"type": "DocType", "link_to": "AI Validation Result", "label": "AI Validation Result"},
]

WORKSPACE_NUMBER_CARDS = [
    {"number_card_name": "Claims Pending Validation", "label": "Claims Pending Validation"},
    {"number_card_name": "Claims Approved", "label": "Claims Approved"},
    {"number_card_name": "Claims Rejected", "label": "Claims Rejected"},
    {"number_card_name": "Claims Waiting Approval", "label": "Claims Waiting Approval"},
]

WORKSPACE_CONTENT = [
    {"id": "hdr1", "type": "header", "data": {"text": "Control. Consistency. Confidence.", "col": 12}},
    {"id": "hdr2", "type": "header", "data": {"text": "Dubai Reinsurance Claims Validation", "col": 12}},
    {"id": "nc1", "type": "number_card", "data": {"number_card_name": "Claims Pending Validation", "col": 3}},
    {"id": "nc2", "type": "number_card", "data": {"number_card_name": "Claims Approved", "col": 3}},
    {"id": "nc3", "type": "number_card", "data": {"number_card_name": "Claims Rejected", "col": 3}},
    {"id": "nc4", "type": "number_card", "data": {"number_card_name": "Claims Waiting Approval", "col": 3}},
    {"id": "sp1", "type": "spacer", "data": {"col": 12}},
    {"id": "hdr3", "type": "header", "data": {"text": "Quick Access", "col": 12}},
    {"id": "sc1", "type": "shortcut", "data": {"shortcut_name": "Insurance Claim", "col": 4}},
    {"id": "sc2", "type": "shortcut", "data": {"shortcut_name": "Insurance Policy", "col": 4}},
    {"id": "sc3", "type": "shortcut", "data": {"shortcut_name": "AI Validation Result", "col": 4}},
    {"id": "sp2", "type": "spacer", "data": {"col": 12}},
    {"id": "hdr4", "type": "header", "data": {"text": "Claims Records", "col": 12}},
    {"id": "card1", "type": "card", "data": {"card_name": "Claims Operations", "col": 6}},
    {"id": "card2", "type": "card", "data": {"card_name": "Configuration", "col": 6}},
]


VISIBLE_DESKTOP_ICONS = {
    "EXOS Claims AI",
    "EXOS Claims",
    "Framework",
    "Accounting",
}


def ensure_workspace() -> None:
    """Recreate EXOS Claims workspace after site updates (slug must match /desk/exos-claims)."""
    if not frappe.db.exists("DocType", "Workspace"):
        return

    doc = {
        "doctype": "Workspace",
        "name": WORKSPACE_NAME,
        "title": WORKSPACE_NAME,
        "label": WORKSPACE_NAME,
        "type": "Workspace",
        "module": "EXOS Claims AI",
        "icon": "octicon octicon-shield",
        "public": 1,
        "is_hidden": 0,
        "sequence_id": 0,
        "content": json.dumps(WORKSPACE_CONTENT),
        "links": WORKSPACE_LINKS,
        "shortcuts": WORKSPACE_SHORTCUTS,
        "number_cards": WORKSPACE_NUMBER_CARDS,
    }

    if frappe.db.exists("Workspace", WORKSPACE_NAME):
        ws = frappe.get_doc("Workspace", WORKSPACE_NAME)
        ws.update(doc)
        ws.save(ignore_permissions=True)
    else:
        frappe.get_doc(doc).insert(ignore_permissions=True)

    ensure_desktop_icon()
    whitelabel_desktop_icons()
    frappe.db.commit()


def ensure_desktop_icon() -> None:
    """v16 Desktop Icon stores its own link and does not auto-update from hooks."""
    if not frappe.db.exists("DocType", "Desktop Icon"):
        return

    correct = "/desk/exos-claims"
    stale = {
        "/app/exos-claims-control-center",
        "/desk/exos-claims-control-center",
        "/app/exos-claims",
        "/desk/exos-claims-control-center/",
    }

    icons = frappe.get_all(
        "Desktop Icon",
        filters={"app": "exos_claims_ai"},
        fields=["name", "link"],
    )
    icons += frappe.get_all(
        "Desktop Icon",
        filters={"name": ["like", "%EXOS%"]},
        fields=["name", "link"],
    )

    seen = set()
    for row in icons:
        if row.name in seen:
            continue
        seen.add(row.name)
        link = row.link or ""
        if link != correct or link in stale or "control-center" in link:
            frappe.db.set_value("Desktop Icon", row.name, "link", correct)
            frappe.db.set_value("Desktop Icon", row.name, "link_type", "External")
            frappe.db.set_value(
                "Desktop Icon",
                row.name,
                "logo_url",
                "/assets/exos_claims_ai/images/exos-logo.png",
            )
            frappe.db.set_value("Desktop Icon", row.name, "hidden", 0)


def whitelabel_desktop_icons() -> None:
    """Desk grid: EXOS Claims + Framework + Accounting only."""
    if not frappe.db.exists("DocType", "Desktop Icon"):
        return

    icons = frappe.get_all(
        "Desktop Icon",
        fields=["name", "label", "app", "hidden", "parent_icon"],
    )
    for row in icons:
        if row.parent_icon:
            continue
        keep = row.name in VISIBLE_DESKTOP_ICONS or (row.label or "") in VISIBLE_DESKTOP_ICONS
        if row.app == "exos_claims_ai" or "exos" in (row.name or "").lower():
            keep = True
        if row.name in ("ERPNext", "ERPNext Settings", "Home"):
            keep = False
        frappe.db.set_value("Desktop Icon", row.name, "hidden", 0 if keep else 1)
