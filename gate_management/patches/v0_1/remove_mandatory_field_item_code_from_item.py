import frappe

def execute():
    """Make item_code field readonly in Item doctype"""
    if not frappe.db.exists("Property Setter", {
        "doc_type": "Item",
        "field_name": "item_code",
        "property": "read_only"
    }):
        frappe.get_doc({
            "doctype": "Property Setter",
            "doctype_or_field": "DocField",   # FIXED: Mandatory field
            "doc_type": "Item",
            "field_name": "item_code",
            "property": "read_only",
            "property_type": "Check",
            "value": "1"
        }).insert(ignore_permissions=True)