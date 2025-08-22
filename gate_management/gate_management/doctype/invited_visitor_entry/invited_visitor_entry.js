// Copyright (c) 2025, Assimilate Technologies Pvt Ltd and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Invited Visitor Entry", {
// 	refresh(frm) {

// 	},
// });

frappe.ui.form.on("Invited Visitor Entry", {
    refresh: function(frm) {
        // Attach live validation to both fields
        ["visitor_name", "host_name"].forEach(fieldname => {
            frm.fields_dict[fieldname].$input.on("input", function() {
                let value = $(this).val();
                if (value && !/^[A-Za-z\s]*$/.test(value)) {
                    frappe.msgprint(__(`${frappe.meta.get_label(frm.doctype, fieldname, frm.docname)} should only contain letters`));
                    // Remove invalid characters immediately
                    $(this).val(value.replace(/[^A-Za-z\s]/g, ""));
                }
            });
        });
    }
});

frappe.ui.form.on('Invited Visitor Entry', {
    refresh: function(frm) {
        let field = frm.fields_dict['visitor_mobile_number'].$input;

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
        let mobile = frm.doc.visitor_mobile_number;

        if (mobile && mobile.length !== 10) {
            frappe.throw(__('Mobile No. must be exactly 10 digits.'));
        }
    }
});

frappe.ui.form.on('Invited Visitor Entry', {
    refresh: function(frm) {
        let field = frm.fields_dict['visitor_email_id'].$input;

        // Validate when user leaves the field (on blur)
        field.on("blur", function() {
            let value = $(this).val();
            let emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

            if (value && !emailPattern.test(value)) {
                frappe.msgprint(__('Please enter a valid email address (e.g. example@domain.com)'));
                $(this).val(""); // Clear invalid email if required
            }
        });
    },

    validate: function(frm) {
        let email = frm.doc.visitor_email_id;
        let emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (email && !emailPattern.test(email)) {
            frappe.throw(__('Invalid Email! Please enter a valid email address.'));
        }
    }
});



