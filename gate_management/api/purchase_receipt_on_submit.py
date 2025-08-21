import frappe

def purchase_receipt_on_submit(doc, method):
    if doc.gate_entry_no:
        gate_entry = frappe.get_doc("Gate Entry", doc.gate_entry_no)
        if gate_entry.docstatus == 1:
            gate_entry.db_set("grn_done", 1, update_modified=False)