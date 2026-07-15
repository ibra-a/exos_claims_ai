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

    if (frm.doc.status === "AI Validated") {
      frm.add_custom_button(__("Send for Approval"), () => {
        frappe.confirm(__("Send this claim for approval routing?"), () => {
          frappe.call({
            method: "frappe.client.set_value",
            args: {
              doctype: "Insurance Claim",
              name: frm.doc.name,
              fieldname: "status",
              value: "Pending Approval",
            },
            callback: () => frm.reload_doc(),
          });
        });
      }, __("Workflow"));
    }

    if (frm.doc.status === "Pending Approval") {
      const amount = flt(frm.doc.claim_amount);
      if (amount < 20000) {
        frm.add_custom_button(__("Approve Claim"), () => {
          frappe.call({
            method: "frappe.client.set_value",
            args: {
              doctype: "Insurance Claim",
              name: frm.doc.name,
              fieldname: "status",
              value: "Approved",
            },
            callback: () => {
              frappe.show_alert(
                { message: __("Claim approved (Claims Manager)"), indicator: "green" },
                5
              );
              frm.reload_doc();
            },
          });
        }, __("Workflow")).addClass("btn-primary");
      } else {
        frm.add_custom_button(__("Send to Finance"), () => {
          frappe.call({
            method: "frappe.client.set_value",
            args: {
              doctype: "Insurance Claim",
              name: frm.doc.name,
              fieldname: "status",
              value: "Pending Finance Approval",
            },
            callback: () => {
              frappe.show_alert(
                { message: __("Awaiting Head of Finance"), indicator: "orange" },
                5
              );
              frm.reload_doc();
            },
          });
        }, __("Workflow")).addClass("btn-primary");
      }
    }

    if (frm.doc.status === "Pending Finance Approval") {
      frm.add_custom_button(__("Finance Approve"), () => {
        frappe.call({
          method: "frappe.client.set_value",
          args: {
            doctype: "Insurance Claim",
            name: frm.doc.name,
            fieldname: "status",
            value: "Approved",
          },
          callback: () => {
            frappe.show_alert(
              { message: __("Claim approved (Finance + Claims)"), indicator: "green" },
              5
            );
            frm.reload_doc();
          },
        });
      }, __("Workflow")).addClass("btn-primary");
    }
  },
});

function exos_esc(text) {
  if (frappe.utils && frappe.utils.escape_html) {
    return frappe.utils.escape_html(String(text || ""));
  }
  return $("<div>")
    .text(String(text || ""))
    .html();
}

function open_claims_copilot(frm) {
  const claimLabel = frm.doc.claim_number || frm.doc.name;
  const d = new frappe.ui.Dialog({
    title: __("EXOS Claims Copilot"),
    size: "large",
    fields: [
      {
        fieldtype: "HTML",
        fieldname: "copilot_shell",
        options: "<div class='exos-copilot-mount'></div>",
      },
      {
        fieldtype: "Data",
        fieldname: "question",
        label: __("Question"),
        reqd: 0,
      },
    ],
    primary_action_label: __("Ask"),
    primary_action(values) {
      const q = ((values && values.question) || d.get_value("question") || "").trim();
      if (!q) {
        frappe.show_alert({ message: __("Enter a question"), indicator: "orange" }, 4);
        return;
      }
      const $log = d.$wrapper.find(".exos-copilot-messages");
      if (!$log.length) {
        frappe.msgprint(__("Copilot UI failed to initialize. Refresh the page and try again."));
        return;
      }
      $log.append(
        `<div class="exos-msg user"><div class="bubble">${exos_esc(q)}</div></div>`
      );
      d.set_value("question", "");
      $log.scrollTop($log[0].scrollHeight);

      frappe.call({
        method: "exos_claims_ai.api.ask_claim_assistant",
        args: { claim_name: frm.doc.name, question: q },
        freeze: true,
        freeze_message: __("Searching claim pack..."),
        callback(r) {
          const msg = (r && r.message) || {};
          const answer = msg.answer || __("No answer returned.");
          const verdict = msg.verdict || "Supported";
          const conf = msg.confidence != null ? msg.confidence : "—";
          const cite =
            (msg.evidence && msg.evidence[0] && msg.evidence[0].document) ||
            msg.document_reference ||
            "—";
          const page =
            (msg.evidence &&
              msg.evidence[0] &&
              (msg.evidence[0].page_or_sheet || msg.evidence[0].page)) ||
            msg.page_number ||
            "";
          const vClass =
            verdict === "Supported"
              ? "ok"
              : verdict === "Contradicted"
                ? "bad"
                : "warn";
          $log.append(
            `<div class="exos-msg bot">
              <div class="bubble">${exos_esc(answer)}</div>
              <div class="meta">
                <span class="verdict ${vClass}">${exos_esc(verdict)}</span>
                · ${exos_esc(String(conf))}% confidence
                · ${exos_esc(String(cite))}${page ? " · " + exos_esc(String(page)) : ""}
              </div>
            </div>`
          );
          $log.scrollTop($log[0].scrollHeight);
        },
        error(err) {
          $log.append(
            `<div class="exos-msg bot"><div class="bubble">Unable to reach Claims Copilot API. Check console / network.</div></div>`
          );
          console.error("exos copilot", err);
        },
      });
    },
  });

  d.show();

  // Build branded shell after show — Frappe v16 HTML field wrappers can strip/nest options oddly
  const $mount = d.fields_dict.copilot_shell.$wrapper.find(".exos-copilot-mount");
  const host = $mount.length ? $mount : d.fields_dict.copilot_shell.$wrapper;
  host.html(`
    <div class="exos-copilot">
      <div class="exos-copilot-header">
        <img src="/assets/exos_claims_ai/images/exos-logo.png" alt="EXOS" class="exos-copilot-logo"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';" />
        <span class="exos-copilot-wordmark" style="display:none;">EXOS</span>
        <div class="exos-copilot-titles">
          <div class="exos-copilot-title">Claims Copilot</div>
          <div class="exos-copilot-sub">Control. Consistency. Confidence. · ${exos_esc(claimLabel)}</div>
        </div>
      </div>
      <div class="exos-copilot-messages">
        <div class="exos-msg bot">
          <div class="bubble">
            Ask evidence-grounded questions about this claim pack (coverage, deductible, period, approval route, clause).
            Unsupported asks return <b>Not mentioned</b> — I will not invent answers.
          </div>
        </div>
      </div>
      <div class="exos-copilot-hints">
        Try: “Is this covered?” · “What is the deductible?” · “Who must approve?” · “ZX-999?”
      </div>
    </div>
    <style>
      .exos-copilot { border: 1px solid var(--border-color); border-radius: 10px; overflow: hidden; background: var(--card-bg, var(--bg-color)); }
      .exos-copilot-header { display:flex; align-items:center; gap:12px; padding:12px 14px; background: #001333; color:#fff; }
      .exos-copilot-logo { height: 28px; width: auto; object-fit: contain; }
      .exos-copilot-wordmark { font-weight: 700; letter-spacing: 0.06em; font-size: 15px; }
      .exos-copilot-title { font-weight: 600; font-size: 14px; }
      .exos-copilot-sub { font-size: 11px; opacity: 0.8; margin-top: 2px; }
      .exos-copilot-messages { min-height: 240px; max-height: 380px; overflow: auto; padding: 12px 14px; }
      .exos-msg { margin: 10px 0; display:flex; }
      .exos-msg.user { justify-content:flex-end; }
      .exos-msg .bubble { max-width: 88%; padding: 9px 12px; border-radius: 10px; line-height: 1.45; font-size: 13px; }
      .exos-msg.user .bubble { background: #1a6dff; color: #fff; }
      .exos-msg.bot .bubble { background: var(--control-bg, #1e293b); border: 1px solid var(--border-color); }
      .exos-msg .meta { width: 100%; font-size: 11px; color: var(--text-muted); margin-top: 4px; }
      .exos-msg.bot { flex-direction: column; align-items: flex-start; }
      .verdict { font-weight: 700; padding: 1px 6px; border-radius: 4px; }
      .verdict.ok { color: #3dd68c; background: rgba(61,214,140,0.12); }
      .verdict.bad { color: #ff6b6b; background: rgba(255,107,107,0.12); }
      .verdict.warn { color: #f5a623; background: rgba(245,166,35,0.12); }
      .exos-copilot-hints { padding: 8px 14px 12px; font-size: 11px; color: var(--text-muted); border-top: 1px solid var(--border-color); }
    </style>
  `);
}
