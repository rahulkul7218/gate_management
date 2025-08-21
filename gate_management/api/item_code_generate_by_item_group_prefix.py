import frappe

def item_code_generate_by_item_group_prefix(doc, method=None):
    """
    Auto-generate Item Code based on the custom prefix from Item Group.
    This function is intended to be used as a hook on before_insert / validate.
    """

    if doc.item_group:
        # Get custom prefix from the selected item group
        item_group_doc = frappe.get_doc("Item Group", doc.item_group)
        prefix = item_group_doc.prefix.strip().upper() if item_group_doc.prefix else ""

        if not prefix:
            frappe.throw("Prefix is not set for the selected Item Group.")

        # Get last item_code for this prefix
        last_item = frappe.db.sql("""
            SELECT item_code
            FROM `tabItem`
            WHERE item_code LIKE %s
            ORDER BY CAST(SUBSTRING_INDEX(item_code, '-', -1) AS UNSIGNED) DESC
            LIMIT 1
        """, (prefix + "-%",), as_dict=True)

        if last_item:
            try:
                last_number = int(last_item[0]['item_code'].split('-')[-1])
            except Exception:
                last_number = 1000
            new_number = last_number + 1
        else:
            new_number = 1001

        # Always regenerate item_code when item_group changes
        doc.item_code = f"{prefix}-{new_number}"
