import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_field

def execute():
    # Create custom field if not exists
    if not frappe.db.exists("Custom Field", {"dt": "Item Group", "fieldname": "prefix"}):
        create_custom_field("Item Group", {
            "fieldname": "prefix",
            "label": "Prefix",
            "fieldtype": "Data",
            "insert_after": "image",
            "reqd": 1
        })