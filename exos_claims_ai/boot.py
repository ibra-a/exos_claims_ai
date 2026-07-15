from __future__ import annotations


def boot_session(bootinfo) -> None:
    bootinfo["app_name"] = "EXOS Claims"
    # Scrub ERPNext from desk app switcher / apps data when present.
    for key in ("apps", "allowed_workspaces"):
        pass

    apps = bootinfo.get("apps")
    if isinstance(apps, list):
        cleaned = []
        for app in apps:
            name = (app if isinstance(app, str) else (app or {}).get("name") or "").lower()
            if name == "erpnext":
                continue
            cleaned.append(app)
        # Prefer EXOS as first app
        bootinfo["apps"] = cleaned

    # Some builds put richer app tiles here
    for key in ("app_data", "apps_data", "installed_apps"):
        data = bootinfo.get(key)
        if not isinstance(data, list):
            continue
        filtered = []
        for item in data:
            if not isinstance(item, dict):
                filtered.append(item)
                continue
            name = (item.get("name") or item.get("app") or "").lower()
            title = (item.get("title") or "").lower()
            if name == "erpnext" or title == "erpnext":
                continue
            filtered.append(item)
        bootinfo[key] = filtered
