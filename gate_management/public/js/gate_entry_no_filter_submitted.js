// frappe.ui.form.on("Purchase Receipt", {
//     onload: function(frm) {
//         frm.set_query("gate_entry_no", function() {
//             return {
//                 filters: {
//                     docstatus: 1
//                 }
//             };
//         });
//     },
//     refresh: function(frm) {
//         frm.set_query("gate_entry_no", function() {
//             return {
//                 filters: {
//                     docstatus: 1
//                 }
//             };
//         });
//     }
// });

frappe.ui.form.on("Purchase Receipt", {
    onload: function(frm) {
        frm.set_query("gate_entry_no", function() {
            return {
                filters: {
                    docstatus: 1,
                    // from: "Supplier",
                    supplier: frm.doc.supplier
                }
            };
        });
    },
    refresh: function(frm) {
        frm.set_query("gate_entry_no", function() {
            return {
                filters: {
                    docstatus: 1,
                    // from: "Supplier",
                    supplier: frm.doc.supplier
                }
            };
        });
    }
});

