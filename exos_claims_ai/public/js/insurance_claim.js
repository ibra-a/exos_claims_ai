frappe.ui.form.on("Insurance Claim", {
  refresh(frm) {
    if (frm.is_new()) return;

    frm.add_custom_button(__("Validate Claim With AI"), () => {
      frappe.call({
        method: "exos_claims_ai.api.validate_claim_with_ai",
        args: { claim_name: frm.doc.name },
        freeze: true,
        freeze_message: __("Running AI validation..."),
        callback(r) {
          const msg = (r && r.message) || {};
          frappe.show_alert({
            message: __("AI decision: {0} ({1}% confidence)", [
              msg.decision || "REVIEW",
              msg.confidence || 0,
            ]),
            indicator:
              msg.decision === "APPROVED"
                ? "green"
                : msg.decision === "REJECTED"
                  ? "red"
                  : "orange",
          }, 8);
          frm.reload_doc();
        },
      });
    }, __("EXOS AI")).addClass("btn-primary");
  },
});

