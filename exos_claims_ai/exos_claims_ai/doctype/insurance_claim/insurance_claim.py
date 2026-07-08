import frappe
from frappe.model.document import Document


class InsuranceClaim(Document):
    def validate(self):
        if self.claim_amount and self.claim_amount >= 20000:
            self.approval_status = "Claims Manager -> Finance Manager"
        elif self.claim_amount:
            self.approval_status = "Claims Manager"

        if self.incident_date and self.policy_number:
            policy = frappe.db.get_value(
                "Insurance Policy",
                self.policy_number,
                ["start_date", "end_date", "status"],
                as_dict=True,
            )
            if policy and policy.status != "Active":
                frappe.throw("Selected policy is not active.")
            if policy and not (policy.start_date <= self.incident_date <= policy.end_date):
                frappe.throw("Incident date is outside policy coverage period.")

