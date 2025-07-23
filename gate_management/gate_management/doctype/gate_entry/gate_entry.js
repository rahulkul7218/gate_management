frappe.ui.form.on('Gate Entry', {
    onload: function(frm) {
        hide_add_row_button(frm);
    },
    refresh: function(frm) {
        hide_add_row_button(frm);
    }
});

function hide_add_row_button(frm) {
    const table_field = frm.fields_dict.order_items;

    // Permanently hide the "Add Row" button
    table_field.grid.wrapper.find('.grid-add-row').hide();

    // Also hide the button that appears inside the grid (bottom of each row)
    table_field.grid.wrapper.find('.btn-open-row').hide();

    // Optional: Prevent programmatic row additions (disables "+" on top)
    frm.set_df_property('order_items', 'cannot_add_rows', true);
}

frappe.ui.form.on('Gate Entry', {
    receive_mode: function(frm) {
        if (frm.doc.receive_mode == 'By Hand') {
            frm.set_df_property('person_name', 'reqd', 1);
            frm.set_df_property('person_mobile_no', 'reqd', 1);
        } else {
            frm.set_df_property('person_name', 'reqd', 0);
            frm.set_df_property('person_mobile_no', 'reqd', 0);
        }
    }
});

frappe.ui.form.on('Gate Entry', {
    driver_name: function (frm) {
        const name = frm.doc.driver_name;
        if (name && !/^[A-Za-z\s]+$/.test(name)) {
            frappe.msgprint(__('Driver Name should only contain letters.'));
            frm.set_value('driver_name', '');
        }
    },
    transporter_name: function (frm) {
        const name = frm.doc.transporter_name;
        if (name && !/^[A-Za-z\s]+$/.test(name)) {
            frappe.msgprint(__('Transporter Name should only contain letters.'));
            frm.set_value('transporter_name', '');
        }
    },
    person_name: function (frm) {
        const name = frm.doc.person_name;
         if (name && !/^[A-Za-z\s]+$/.test(name)) {
            frappe.msgprint(__('Person Name should only contain letters.'));
            frm.set_value('person_name', '');
        }
        
    }
});


frappe.ui.form.on('Gate Entry', {
    supplier: function(frm) {
        check_duplicate_gate_entry(frm);
    },
    purchase_order: function(frm) {
        check_duplicate_gate_entry(frm);
    }
});

function check_duplicate_gate_entry(frm) {
    if (frm.doc.supplier && frm.doc.purchase_order) {
        frappe.db.get_list('Gate Entry', {
            filters: {
                supplier: frm.doc.supplier,
                purchase_order: frm.doc.purchase_order,
                name: ["!=", frm.doc.name]  // exclude current doc in edit mode
            },
            fields: ['name']
        }).then(records => {
            if (records.length > 0) {
                frappe.msgprint(__('A Gate Entry already exists for this Supplier and Purchase Order.'));
                frm.set_value('purchase_order', '');
            }
        });
    }
}


frappe.ui.form.on('Gate Entry', {
    purchase_order: function(frm) {
        if (frm.doc.purchase_order) {
            frappe.call({
                method: "frappe.client.get",
                args: {
                    doctype: "Purchase Order",
                    name: frm.doc.purchase_order
                },
                callback: function(r) {
                    if (r.message) {
                        const po = r.message;
                        frm.clear_table("order_items");

                        (po.items || []).forEach(item => {
                            let child = frm.add_child("order_items");
                            child.item_code = item.item_code;
                            child.item_name = item.item_name;
                            child.required_by = item.schedule_date;
                            child.quantity = item.qty;
                            child.uom = item.uom;
                            child.rate = item.rate;
                            child.amount = item.amount;
                            //child.transferred_quantity = item.received_qty;
                        });

                        frm.refresh_field("order_items");
                    }
                }
            });
        }
    }
});


frappe.ui.form.on('Gate Entry', {
    after_save: function(frm) {
        if (!frm.doc.entry_no && frm.doc.name) {
            frm.set_value('entry_no', frm.doc.name);
            frm.save(); // Save again with the entry_no updated
        }
    }
});

frappe.listview_settings["Gate Entry"] = {
    hide_name_column: true,
    hide_name_filter: true,
};

frappe.ui.form.on('Gate Entry', {
    refresh: function(frm) {
        // Set minimum date to today for entry_date field
        if (frm.fields_dict.entry_date && frm.fields_dict.entry_date.datepicker) {
            frm.fields_dict.entry_date.datepicker.update({
                minDate: new Date(frappe.datetime.get_today())
            });
        }
    },

    after_save: function(frm) {
        // Auto-set current time if not already set
        if (!frm.doc.time) {
            frm.set_value('time', frappe.datetime.now_time());
            frm.save();  // Save again to update time
        }
    }
});


frappe.ui.form.on('Gate Entry', {
    supplier: function(frm) {
        if (frm.doc.supplier) {
            frm.set_query('purchase_order', () => {
                return {
                    filters: [
                        ['supplier', '=', frm.doc.supplier],
                        ['status', '!=', 'Approved']
                    ]
                };
            });
        } else {
            frm.set_query('purchase_order', () => {
                return {
                    filters: {
                        name: '' // Empty result if no supplier
                    }
                };
            });
        }
    }
});

frappe.ui.form.on('Gate Entry', {
    refresh: function(frm) {
        frm.toggle_display('purchase_order', !!frm.doc.supplier);
        frm.toggle_display('sales_order', !!frm.doc.customer);
    },
    supplier: function(frm) {
        frm.toggle_display('purchase_order', !!frm.doc.supplier);
        frm.toggle_display('sales_order', !!frm.doc.customer);
    }
});

frappe.ui.form.on('Gate Entry', {
    refresh: function(frm) {
        //frm.toggle_display('purchase_order', !!frm.doc.supplier);
        frm.toggle_display('sales_order', !!frm.doc.customer);
    },
    customer: function(frm) {
        //frm.toggle_display('purchase_order', !!frm.doc.supplier);
        frm.toggle_display('sales_order', !!frm.doc.customer);
    }
});

frappe.ui.form.on('Gate Entry', {
    customer: function(frm) {
        // Refresh the query on customer change
        frm.set_query("sales_order", function() {
            return {
                filters: [
                    ["Sales Order", "customer", "=", frm.doc.customer],
                    ["Sales Order", "status", "!=", "Completed"]
                ]
            };
        });

        // Clear previous value when customer changes
        frm.set_value('sales_order', '');
    },

    onload: function(frm) {
        // Also apply filter on load
        frm.set_query("sales_order", function() {
            return {
                filters: [
                    ["Sales Order", "customer", "=", frm.doc.customer],
                    ["Sales Order", "status", "!=", "Completed"]
                ]
            };
        });
    }
});

frappe.ui.form.on('Gate Entry', {
    refresh: function(frm) {
        frm.toggle_display('items', !!frm.doc.purchase_order);
    },
    purchase_order: function(frm) {
        frm.toggle_display('items', !!frm.doc.purchase_order);
    }
});

frappe.ui.form.on('Gate Entry', {
    refresh(frm) {
        toggle_party_fields(frm);
    },
    customer(frm) {
        toggle_party_fields(frm);
    },
    supplier(frm) {
        toggle_party_fields(frm);
    }
});

function toggle_party_fields(frm) {
    if (frm.doc.customer) {
        frm.set_df_property('supplier', 'hidden', 1);
        frm.set_df_property('customer', 'hidden', 0);
    } else if (frm.doc.supplier) {
        frm.set_df_property('customer', 'hidden', 1);
        frm.set_df_property('supplier', 'hidden', 0);
    } else {
        // Show both fields if neither is filled
        frm.set_df_property('customer', 'hidden', 0);
        frm.set_df_property('supplier', 'hidden', 0);
    }
}

frappe.ui.form.on('Gate Entry', {
    customer: function(frm) {
        set_entity_name_from_party(frm);
    },
    supplier: function(frm) {
        set_entity_name_from_party(frm);
    }
});

function set_entity_name_from_party(frm) {
    if (frm.doc.customer) {
        frappe.db.get_doc('Customer', frm.doc.customer).then(doc => {
            frm.set_value('entity_name', doc.customer_name);
        });
    } else if (frm.doc.supplier) {
        frappe.db.get_doc('Supplier', frm.doc.supplier).then(doc => {
            frm.set_value('entity_name', doc.supplier_name);
        });
    } else {
        frm.set_value('entity_name', '');
    }
}

frappe.ui.form.on('Gate Entry', {
    driver_mobile_no: function(frm) {
        validate_mobile_no(frm, 'driver_mobile_no');
    },
    person_mobile_no: function(frm) {
        validate_mobile_no(frm, 'person_mobile_no');
    }
});

function validate_mobile_no(frm, fieldname) {
    let mobile_no = frm.doc[fieldname] || '';

    // Check if any non-digit characters exist
    if (/\D/.test(mobile_no)) {
        frappe.msgprint(__('Only digits are allowed in {0}.', [frm.fields_dict[fieldname].df.label]));
    }

    // Remove non-digit characters
    mobile_no = mobile_no.replace(/\D/g, '');

    // Check for more than 10 digits
    if (mobile_no.length > 10) {
        frappe.msgprint(__('Mobile No not allowed more than 10 digits.'));
        mobile_no = mobile_no.substring(0, 10);
    }

    // Check for less than 10 digits - show message but do not remove entered digits
    if (mobile_no.length < 10) {
        frappe.msgprint(__('Mobile No must be exactly 10 digits.'));
    }

    // Update the field with cleaned value
    frm.set_value(fieldname, mobile_no);
}


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

frappe.ui.form.on('Gate Entry', {
    validate: function(frm) {
        update_gate_entry_status(frm);
    }
});

frappe.ui.form.on('Order Item', {
    status: function(frm, cdt, cdn) {
        update_gate_entry_status(frm);
    }
});

function update_gate_entry_status(frm) {
    let allClosed = true;

    if (frm.doc.order_items && frm.doc.order_items.length > 0) {
        frm.doc.order_items.forEach(function(row) {
            if (row.status !== 'Closed') {
                allClosed = false;
            }
        });
    } else {
        allClosed = false; // No items, don't mark as Closed
    }

    if (allClosed) {
        frm.set_value('status', 'Closed');
    }
    // else do nothing, keeps previous status
}


frappe.ui.form.on('Gate Entry', {
    refresh: function(frm) {
        let is_dirty = false;
        (frm.doc.order_items || []).forEach(item => {
            if (
                typeof item.received_quantity === 'number' &&
                typeof item.transferred_quantity === 'number' && item.transferred_quantity > 0 && item.received_quantity > 0
            ) {
               let open_qty = item.received_quantity - item.transferred_quantity;
                 frappe.model.set_value(item.doctype, item.name, 'open_quantity', open_qty);

                if (item.open_quantity <= 0) {
                    if(item.status != 'Draft')
                    // frappe.model.set_value(item.doctype, item.name, 'status', 'Closed');
                    item.status = 'Closed';
                } else if (item.open_quantity > 0) {
                    // frappe.model.set_value(item.doctype, item.name, 'status', 'Partially Transferred');
                     item.status = 'Partially Transferred';
                }
                is_dirty = true;
            }
            
        });
        if(is_dirty) {
            frm.save();
        }
        
        frm.refresh_field('order_items');
    }
});

frappe.listview_settings['Gate Entry'] = {
    onload: function(listview) {
        listview.page.add_inner_button(__('Delete'), function () {
            const selected = listview.get_checked_items();

            if (selected.length === 0) {
                frappe.msgprint(__('Please select at least one record to delete.'));
                return;
            }

            frappe.confirm(
                `Are you sure you want to delete ${selected.length} selected record(s)?`,
                function () {
                    let deletedCount = 0;
                    selected.forEach(doc => {
                        frappe.call({
                            method: "frappe.client.delete",
                            args: {
                                doctype: "Gate Entry",
                                name: doc.name
                            },
                            callback: function (r) {
                                deletedCount++;
                                if (deletedCount === selected.length) {
                                    frappe.show_alert({
                                        message: `Deleted ${deletedCount} record(s).`,
                                        indicator: 'red'
                                    });
                                    listview.refresh();
                                }
                            }
                        });
                    });
                }
            );
        }, __('Actions'));
    }
};

frappe.ui.form.on('Gate Entry', {
    refresh: function(frm) {
        update_status_based_on_workflow(frm);
    },
    workflow_state: function(frm) {
        update_status_based_on_workflow(frm);
    }
});

function update_status_based_on_workflow(frm) {
    if (frm.doc.workflow_state === "Gate Entry Create") {
        frm.set_value("status", "Draft");

        (frm.doc.order_items || []).forEach(item => {
            item.status = "Draft";
        });
        frm.refresh_field("order_items");
    }
    
    if (frm.doc.workflow_state === "Cancelled") {
        frm.set_value("status", "Cancelled");

        (frm.doc.order_items || []).forEach(item => {
            item.status = "Cancelled";
        });
        frm.save();  // Save the form
        frm.refresh_field("order_items");
    }

    if (frm.doc.workflow_state === "Submit") {
        if (frm.doc.status != 'Transfer in Process' && frm.doc.status != 'Closed')
            frm.set_value("status", "Received at Gate");

        (frm.doc.order_items || []).forEach(item => {
            item.status = "Received at Gate";
        });
        frm.save();
        frm.refresh_field("order_items");
    }
}

frappe.ui.form.on('Gate Entry', {
    vehicle_no: function(frm) {
        if (frm.doc.vehicle_no) {
            frm.set_value('vehicle_no', frm.doc.vehicle_no.toUpperCase());
        }
    }
});

frappe.ui.form.on('Gate Entry', {
    receive_mode: function(frm) {
        if (frm.doc.receive_mode == 'By Vehicle') {
            frm.set_df_property('vehicle_no', 'reqd', 1);
            frm.set_df_property('transporter_name', 'reqd', 1);
            frm.set_df_property('driver_name', 'reqd', 1);
            frm.set_df_property('driver_mobile_no', 'reqd', 1);
            frm.set_df_property('vehicle_front_photo', 'reqd', 1);
            frm.set_df_property('vehicle_back_photo', 'reqd', 1);
            frm.set_df_property('table_mzvy', 'reqd', 1);
        } else {
            frm.set_df_property('vehicle_no', 'reqd', 0);
            frm.set_df_property('transporter_name', 'reqd', 0);
            frm.set_df_property('driver_name', 'reqd', 0);
            frm.set_df_property('driver_mobile_no', 'reqd', 0);
            frm.set_df_property('vehicle_front_photo', 'reqd', 0);
            frm.set_df_property('vehicle_back_photo', 'reqd', 0);
            frm.set_df_property('table_mzvy', 'reqd', 0);
        }
    }
});

frappe.ui.form.on('Gate Entry', {
    refresh: function(frm) {
        if (frm.doc.workflow_state === 'Submit') {
            frm.fields_dict && Object.keys(frm.fields_dict).forEach(fieldname => {
                frm.set_df_property(fieldname, 'read_only', 1);
            });
        }
    }
});
