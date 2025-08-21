// Copyright (c) 2025, Assimilate Technologies Pvt Ltd and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Gate Entry", {
// 	refresh(frm) {

// 	},
// });
frappe.ui.form.on('Gate Entry', {
    gate_entry_type: function(frm) {
        if (frm.doc.gate_entry_type === "Other") {
            // Hide 'vendorcustomer'
            frm.set_df_property('vendorcustomer', 'hidden', 1);

            // Make 'descriptionremark' mandatory
            frm.set_df_property('descriptionremark', 'reqd', 1);
              frm.set_df_property('other_details', 'reqd', 1);
        } else {
            // Show 'vendorcustomer' again
            frm.set_df_property('vendorcustomer', 'hidden', 0);

            // Remove mandatory from 'descriptionremark'
            frm.set_df_property('descriptionremark', 'reqd', 0);
        }
    },

    refresh: function(frm) {
        // Apply rules on page load/refresh also
        frm.trigger('gate_entry_type');
    }
});

frappe.ui.form.on('Gate Entry', {
    refresh: function(frm) {
        // Run once on refresh
        frm.trigger("toggle_vehicle_no_req");
    },
    material_movement_type: function(frm) {
        // Run when material_movement_type changes
        frm.trigger("toggle_vehicle_no_req");
    },
    toggle_vehicle_no_req: function(frm) {
        if (frm.doc.material_movement_type === "By Hand") {
            frm.set_df_property("vehicle_no", "reqd", 0);
            frm.set_df_property("vehicle_number_plate_photo", "reqd", 0);
              frm.set_df_property("vehicle_photo_with_goods", "reqd", 0); // not mandatory
        } else {
            frm.set_df_property("vehicle_no", "reqd", 1);
            frm.set_df_property("vehicle_number_plate_photo", "reqd", 1);
            frm.set_df_property("vehicle_photo_with_goods", "reqd", 1); // mandatory
        }
    }
});

frappe.ui.form.on('Gate Entry', {
    vehicle_no: function(frm) {
        if (frm.doc.vehicle_no) {
            frm.set_value('vehicle_no', frm.doc.vehicle_no.toUpperCase());
        }
    },
    delivered_by_name: function(frm) {
        if (frm.doc.delivered_by_name) {
            frm.set_value('delivered_by_name', frm.doc.delivered_by_name.toUpperCase());
        }
    }
});


frappe.ui.form.on('Gate Entry', {
    validate: function(frm) {
        let vehicleNo = frm.doc.vehicle_no;

        // Remove leading/trailing spaces
        vehicleNo = vehicleNo ? vehicleNo.trim() : '';

        // Pattern to match:
        // 2 letters, optional space, 2 digits, optional space, 2 letters, optional space, 4 digits
        const pattern = /^[A-Z]{2}\s?\d{2}\s?[A-Z]{2}\s?\d{4}$/;

        if (vehicleNo && !pattern.test(vehicleNo)) {
            frappe.throw(__('Invalid Vehicle Number Format! Valid formats: MH12AB1234 or MH 12 AB 1234'));
        }
    }
});

// frappe.ui.form.on('Gate Entry', {
//     refresh: function(frm) {
//         // Restrict only letters in other_details & descriptionremark
//         ["other_details", "descriptionremark"].forEach(field => {
//             frm.fields_dict[field].$input.on("input", function(e) {
//                 let value = $(this).val();
//                 if (/[^a-zA-Z\s]/.test(value)) {
//                     let label = frm.fields_dict[field].df.label;
//                     frappe.msgprint(__('Only letters are allowed in the field: ' + label));
//                     // Remove invalid characters instantly
//                     $(this).val(value.replace(/[^a-zA-Z\s]/g, ''));
//                 }
//             });
//         });

//         // Restrict only numbers in package_qty
//         frm.fields_dict["package_qty"].$input.on("input", function(e) {
//             let value = $(this).val();
//             if (/[^0-9]/.test(value)) {
//                 frappe.msgprint(__('Only numbers are allowed in the field: Package Qty'));
//                 // Remove invalid characters instantly
//                 $(this).val(value.replace(/[^0-9]/g, ''));
//             }
//         });
//     }
// });

frappe.ui.form.on('Gate Entry', {
    refresh: function(frm) {
        let field = frm.fields_dict['delivered_by_mobile_no'].$input;

        // Live validation on input
        field.on("input", function() {
            let value = $(this).val();

            // Allow only numbers
            if (/[^0-9]/.test(value)) {
                frappe.msgprint(__('Only numbers are allowed in Mobile No.'));
                $(this).val(value.replace(/[^0-9]/g, ''));  // remove non-numeric
                return;
            }

            // Limit to 10 digits
            if (value.length > 10) {
                frappe.msgprint(__('Mobile No. cannot be more than 10 digits.'));
                $(this).val(value.slice(0, 10));
            }
        });
    },

    validate: function(frm) {
        let mobile = frm.doc.delivered_by_mobile_no;

        if (mobile && mobile.length !== 10) {
            frappe.throw(__('Mobile No. must be exactly 10 digits.'));
        }
    }
});

frappe.ui.form.on('Gate Entry', {
    refresh: function(frm) {
        // Apply validation on delivered_by_name
        frm.fields_dict['delivered_by_name'].$input.on("input", function(e) {
            let value = $(this).val();
            if (/[^a-zA-Z\s]/.test(value)) {
                frappe.msgprint(__('Only letters are allowed in Delivered By Name'));
                $(this).val(value.replace(/[^a-zA-Z\s]/g, '')); // remove invalid chars live
            }
        });
    }
});


frappe.ui.form.on('Gate Entry', {
    after_save: function(frm) {
        if (frm.doc.name && frm.doc.entry_no !== frm.doc.name) {
            frm.set_value('entry_no', frm.doc.name);
            frm.save(); // save again to update entry_no
        }
    }
});

frappe.listview_settings["Gate Entry"] = {
    hide_name_column: true,
    hide_name_filter: true,
};


frappe.ui.form.on('Gate Entry', {
    material_movement_type: function(frm) {
        if (frm.doc.material_movement_type === "By Hand") {
            // Make fields mandatory
            frm.set_df_property('delivered_by_name', 'reqd', 1);
            frm.set_df_property('delivered_by_mobile_no', 'reqd', 1);
            frm.set_df_property('delivered_by_face_photo', 'reqd', 1);
        } else {
            // Remove mandatory if not "By Hand"
            frm.set_df_property('delivered_by_name', 'reqd', 0);
            frm.set_df_property('delivered_by_mobile_no', 'reqd', 0);
            frm.set_df_property('delivered_by_face_photo', 'reqd', 0);
        }
    }
});


frappe.ui.form.on('Gate Entry', {
    from: function(frm) {
        if (frm.doc.from === "Customer") {
            // Make fields mandatory
            frm.set_df_property('vendorcustomer', 'reqd', 1);
            frm.set_df_property('document', 'reqd', 1);
            
        } else {
            // Remove mandatory if not "By Hand"
            frm.set_df_property('vendorcustomer', 'reqd', 0);
            frm.set_df_property('document', 'reqd', 0);
            
        }
    }
});

frappe.ui.form.on('Gate Entry', {
    from: function(frm) {
        if (frm.doc.from === "Supplier") {
            // Make fields mandatory
            frm.set_df_property('supplier', 'reqd', 1);
            frm.set_df_property('document_no', 'reqd', 1);
            
        } else {
            // Remove mandatory if not "By Hand"
            frm.set_df_property('supplier', 'reqd', 0);
            frm.set_df_property('document_no', 'reqd', 0);
            
        }
    }
});

// frappe.ui.form.on('Gate Entry', {
//     gate_entry_type: function(frm) {
//         if (frm.doc.gate_entry_type === "RM Inward") {
//             frm.set_value("from", "Supplier");
//         }
//     }
// });

// frappe.ui.form.on('Gate Entry', {
//     onload: function(frm) {
//         // store the initial gate_entry_type
//         frm._last_gate_entry_type = frm.doc.gate_entry_type;
//     },

//     gate_entry_type: function(frm) {
//         // clear only if the new value is different from old
//         if (frm._last_gate_entry_type !== frm.doc.gate_entry_type) {
//             frm.set_value('from', '');
//         }
//         // update last stored value
//         frm._last_gate_entry_type = frm.doc.gate_entry_type;
//     }
// });


frappe.ui.form.on('Gate Entry', {
    onload: function(frm) {
        frm._last_gate_entry_type = frm.doc.gate_entry_type;
    },

    gate_entry_type: function(frm) {
        if (frm._last_gate_entry_type !== frm.doc.gate_entry_type) {
            // Reset 'from' on change
            frm.set_value('from', '');

            // Special case: auto-set for RM Inward
            if (frm.doc.gate_entry_type === "RM Inward") {
                frm.set_value('from', 'Supplier');
            }
            if (frm.doc.gate_entry_type === "Return From Customer") {
                frm.set_value('from', 'Customer');
            }
        }

        // update stored last value
        frm._last_gate_entry_type = frm.doc.gate_entry_type;
    }
});