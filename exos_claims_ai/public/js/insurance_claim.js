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
          const findings = msg.findings || msg.observations || [];
          const supported = findings.filter((f) => f.verdict === "Supported").length;
          const contradicted = findings.filter((f) => f.verdict === "Contradicted").length;
          const missing = findings.filter((f) => f.verdict === "Not mentioned").length;
          let detail = __("AI decision: {0} ({1}% confidence)", [
            msg.decision || "REVIEW",
            msg.confidence || 0,
          ]);
          if (findings.length) {
            detail += ` · ${supported} Supported / ${contradicted} Contradicted / ${missing} Not mentioned`;
          }
          frappe.show_alert(
            {
              message: detail,
              indicator:
                msg.decision === "APPROVED"
                  ? "green"
                  : msg.decision === "REJECTED"
                    ? "red"
                    : "orange",
            },
            10
          );
          frm.reload_doc();
        },
      });
    }, __("EXOS AI")).addClass("btn-primary");

    frm.add_custom_button(__("Open Claims Copilot"), () => {
      open_claims_copilot(frm);
    }, __("EXOS AI"));
  },
});

function open_claims_copilot(frm) {
  const d = new frappe.ui.Dialog({
    title: __("EXOS Claims Copilot — {0}", [frm.doc.claim_number || frm.doc.name]),
    size: "large",
    fields: [
      {
        fieldtype: "HTML",
        fieldname: "chat_log",
        options: `<div class="exos-copilot-log" style="min-height:220px;max-height:360px;overflow:auto;border:1px solid var(--border-color);padding:12px;border-radius:8px;margin-bottom:8px;">
          <p style="color:var(--text-muted);font-size:12px;margin:0 0 8px;">Evidence-grounded answers only. Unsupported questions return <b>Not mentioned</b>.</p>
        </div>`,
      },
      {
        fieldtype: "Data",
        fieldname: "question",
        label: __("Question"),
        reqd: 1,
      },
    ],
    primary_action_label: __("Ask"),
    primary_action(values) {
      const q = (values.question || "").trim();
      if (!q) return;
      const $log = d.fields_dict.chat_log.$wrapper.find(".exos-copilot-log");
      $log.append(
        `<div style="margin:8px 0;text-align:right;"><span style="background:#1a6dff;color:#fff;padding:6px 10px;border-radius:8px;display:inline-block;">${frappe.utils.escape_html(q)}</span></div>`
      );
      d.set_value("question", "");
      frappe.call({
        method: "exos_claims_ai.api.ask_claim_assistant",
        args: { claim_name: frm.doc.name, question: q },
        freeze: true,
        callback(r) {
          const msg = (r && r.message) || {};
          const verdict = msg.verdict || "Supported";
          const cite =
            (msg.evidence && msg.evidence[0] && msg.evidence[0].document) ||
            msg.document_reference ||
            "—";
          const page = (msg.evidence && msg.evidence[0] && (msg.evidence[0].page_or_sheet || msg.evidence[0].page)) || msg.page_number || "";
          $log.append(
            `<div style="margin:8px 0;">
              <div style="background:var(--control-bg);padding:8px 10px;border-radius:8px;">${frappe.utils.escape_html(msg.answer || "No answer")}</div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">
                <b>${frappe.utils.escape_html(verdict)}</b> · ${msg.confidence ?? "—"}% · ${frappe.utils.escape_html(String(cite))} ${page ? "· " + frappe.utils.escape_html(String(page)) : ""}
              </div>
            </div>`
          );
          $log.scrollTop($log[0].scrollHeight);
        },
      });
    },
  });
  d.show();
}
