const mongoose = require("mongoose");

const saleOrderSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        so_code: {
            type: String,
            index: true,
            default: null
        },
        csa_code: {
            type: String,
            index: true,
            default: null
        },
        csa_name: {
            type: String,
            index: true,
            default: null
        },
        division: {
            type: String,
            index: true,
            default: null
        },
        div_name: {
            type: String,
            default: null
        },
        db_code: {
            type: String,
            index: true,
            default: null
        },
        db_name: {
            type: String,
            index: true,
            default: null
        },
        sold_city: {
            type: String,
            default: null
        },
        so_no: {
            type: String,
            index: true,
            default: null
        },
        so_date: {
            type: Date,
            index: true,
            default: null
        },
        so_type: {
            type: String,
            default: null
        },
        so_description: {
            type: String,
            default: null
        },
        product_code: {
            type: String,
            index: true,
            default: null
        },
        product_name: {
            type: String,
            index: true,
            default: null
        },
        order_qty: {
            type: Number,
            default: null
        },
        uom: {
            type: String,
            default: null
        },
        chq_no: {
            type: String,
            default: null
        },
        chq_date: {
            type: Date,
            default: null
        },
        net_value: {
            type: Number,
            default: null
        },
        total_val: {
            type: Number,
            default: null
        },
        pay_status: {
            type: String,
            default: null
        },
        brand: {
            type: String,
            index: true,
            default: null
        },
        hie_code: {
            type: String,
            index: true,
            default: null
        },
        hie_name: {
            type: String,
            default: null
        }
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at"
        }
    }
);

module.exports = mongoose.model("SaleOrder", saleOrderSchema);