frappe.ui.form.on('Item', {
    refresh: function(frm) {
        // Run once on refresh
        frm.trigger("toggle_runner_quantity");
    },
    item_group: function(frm) {
        // Run when material_movement_type changes
        frm.trigger("toggle_runner_quantity");
    },
    toggle_runner_quantity: function(frm) {
        if (frm.doc.item_group === "Raw Material") {
            frm.set_df_property("runner_quantity", "reqd", 1);
            
        } else {
            frm.set_df_property("runner_quantity", "reqd", 0);
            
        }
    }
});