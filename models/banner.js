const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
    name: String,
    file: String
},
{
    timestamps: true
});


module.exports = mongoose.model("Banner",bannerSchema);