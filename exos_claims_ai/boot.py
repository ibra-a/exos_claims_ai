from __future__ import annotations


def boot_session(bootinfo) -> None:
    bootinfo["app_name"] = "EXOS Claims"
    # Landing page comes from User.default_workspace — do not set home_page to a Page slug.
