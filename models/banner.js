const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
    name: string,
},
{
    timestamps: true
});


module.exports = mongoose.model("Banner",bannerSchema);