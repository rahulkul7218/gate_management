# import frappe

# def execute():
#     """Make Item.item_code field non-mandatory"""
#     if not frappe.db.exists("Property Setter", {
#         "doctype_or_field": "DocField",
#         "doc_type": "Item",
#         "field_name": "item_code",
#         "property": "reqd"
#     }):
#         frappe.get_doc({
#             "doctype": "Property Setter",
#             "doctype_or_field": "DocField",
#             "doc_type": "Item",
#             "field_name": "item_code",
#             "property": "reqd",
#             "value": "0",   # 0 = Not Mandatory
#             "property_type": "Check"
#         }).insert()


import frappe

def execute():
    """Make Item.item_code field non-mandatory"""
    # Delete old property setter if exists
    frappe.db.delete("Property Setter", {
        "doc_type": "Item",
        "field_name": "item_code",
        "property": "reqd"
    })

    # Insert new property setter (make non-mandatory)
    frappe.get_doc({
        "doctype": "Property Setter",
        "doctype_or_field": "DocField",
        "doc_type": "Item",
        "field_name": "item_code",
        "property": "reqd",
        "value": "0",   # 0 = Not Mandatory
        "property_type": "Check"
    }).insert()
