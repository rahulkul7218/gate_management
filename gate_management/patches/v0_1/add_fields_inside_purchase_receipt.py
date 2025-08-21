import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_field

def execute():
    # Create custom field if not exists
    if not frappe.db.exists("Custom Field", {"dt": "Purchase Receipt", "fieldname": "gate_entry_no"}):
        create_custom_field("Purchase Receipt", {
            "fieldname": "gate_entry_no",
            "label": "Gate Entry No",
            "fieldtype": "Link",
            "options": "Gate Entry",
            "insert_after": "set_posting_time",
            "reqd": 1
        })