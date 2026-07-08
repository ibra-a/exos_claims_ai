frappe.ui.form.on("Insurance Claim", {
  refresh(frm) {
    if (!frm.is_new()) {
      frm.add_custom_button(__("Validate Claim With AI"), () => {
        frappe.call({
          method: "exos_claims_ai.api.validate_claim_with_ai",
          args: { claim_name: frm.doc.name },
          freeze: true,
          freeze_message: __("Running AI validation..."),
          callback: () => frm.reload_doc()
        });
      }).addClass("btn-primary");
    }
  }
});

