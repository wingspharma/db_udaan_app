const generateOtp = async (req, res) => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.module =  {
    generateOtp
}