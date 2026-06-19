const mongoose = require("mongoose");

const distTargetSchema = mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        hq_code:{
            type: String,
            required: true
        },
        year:{
            type: String,
            required:true
        },
        //OTC Genuen
        type:{
            type: String,
            required:true
        },
        month:{
            type: String,
            required:true
        },
        db_code:{

        },
        db_name:{
            type: String,
            required: true
        },
        tgt_value:{
            type: String,
            required: true
        }
        
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("DistTarget",distTargetSchema)

