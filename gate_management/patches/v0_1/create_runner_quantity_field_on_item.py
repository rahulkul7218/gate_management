import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_field

def execute():
    """Create runner_quantity field in Item doctype and make it mandatory"""
    fieldname = "runner_quantity"

    # Check if field already exists
    if not frappe.db.exists("Custom Field", {"dt": "Item", "fieldname": fieldname}):
        create_custom_field(
            "Item",
            {
                "fieldname": fieldname,
                "label": "Runner Quantity",
                "fieldtype": "Float",
                "insert_after": "item_group",  # adjust position as per your requirement
                "reqd": 0,   # make it mandatory
            }
        )
        frappe.db.commit()
