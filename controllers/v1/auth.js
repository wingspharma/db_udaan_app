const axios = require("axios");
const jwt = require("jsonwebtoken");
const User = require("../../models/user");
const Otp = require("../../models/otp");



exports.sendOtp = async (req, res) => {
    try {

        const { mobile } = req.body;

        if (!mobile) {
            return res.status(400).json({
                status: false,
                message: "Mobile is required"
            });
        }

        const response = await axios.get(
            `${process.env.DISTRIBUTER_API_URL}/${mobile}`
        );
        

       const distributorData = response?.data?.data;

        if (!response?.data?.status || !distributorData) {
            return res.status(404).json({
                status: false,
                message: "Distributor Not Found"
            });
        }

        const otp = "123456";
        // const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await Otp.deleteMany({ mobile });

        await Otp.create({
            mobile,
            otp,
            expires_at: new Date(
                Date.now() + 5 * 60 * 1000
            )
        });

        return res.json({
            status: true,
            message: "OTP Sent",
            otp
        });

    } catch (error) {

        if(process.env.ENVIRONMENT === "development"){
             return res.status(500).json({
                status: false,
                message: error.message
            });
        }else{
            return res.status(500).json({
                status: false,
                message: "Internal Server Error"
            });
        }
       

    }
};



exports.verifyOtp = async (req, res) => {

    try {

        const {
            mobile,
            otp,
            device_token,
            device_id,
            device_type
        } = req.body;

        const otpData = await Otp.findOne({
            mobile,
            otp
        });

        if (!otpData) {

            return res.status(400).json({
                status: false,
                message: "Invalid OTP"
            });
        }

        if (otpData.expires_at < new Date()) {
            return res.status(400).json({
                status: false,
                message: "OTP expired"
            });
        }

        const response = await axios.get(
            `${process.env.DISTRIBUTER_API_URL}/${mobile}`
        );

       const distributorData = response?.data?.data;

        if (!response?.data?.status || !distributorData) {
            return res.status(404).json({
                status: false,
                message: "Distributor Not Found"
            });
        }

        const distributor = response?.data?.data;

        
        const existingUser = await User.findOne({
            distributor_id: distributor.id
        });

        if (
            existingUser &&
            existingUser.is_updated === 1 &&
            existingUser.distributor_data?.user_profile
        ) {
            distributor.user_profile.profile_image =
                existingUser.distributor_data.user_profile.profile_image;

            distributor.user_profile.profile_image_url =
                existingUser.distributor_data.user_profile.profile_image_url;
        }

        const user = await User.findOneAndUpdate(

            {
                distributor_id: distributor.id
            },

            {
                $set: {

                    distributor_id:
                        distributor.id,

                    app_id:
                        distributor.app_id,

                    sap_code:
                        distributor.sap_code,

                    firm:
                        distributor.firm,

                    mobile:
                        distributor.mobile1,

                    email:
                        distributor.email,

                    distributor_data:
                        distributor,

                    device_token,

                    device_id,

                    device_type,

                    last_login:
                        new Date(),

                    last_sync_at:
                        new Date(),

                    is_active:
                        true
                },

                $inc: {
                    login_count: 1
                }
            },

            {
                new: true,
                upsert: true
            }
        );

        const token =
            jwt.sign(
                {
                    user_id: user._id,
                    distributor_id:distributor.id,
                    mobile:distributor.mobile1
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "30d"
                }
            );

        await Otp.deleteMany({
            mobile
        });

        return res.json({
            status: true,
            message: "Login Successful",
            token,
            user
        });

    } catch (error) {

        if(process.env.ENVIRONMENT === "development"){
             return res.status(500).json({
                status: false,
                message: error.message
            });
        }else{
            return res.status(500).json({
                status: false,
                message: "Internal Server Error"
            });
        }
        

    }

};

exports.profile = async (req, res) => {
    try{
        const user = await User.findById(req.user.user_id)
        .select("mobile distributor_data")
        .lean();

        if(user){
            return res.status(400).json({
                status:false,
                message:"User Not Found"
            });
        }

        const dp = user?.distributor_data;

        const formatted = {
            name: dp?.user_profile?.name,
            image: dp?.user_profile?.profile_image_url,
            mobile: user?.mobile,

            gstnumber: dp?.verification_details_gst?.gstin,

            pancard_number: dp?.bank_details?.pan_number,

            dl_21b: dp?.bank_details?.ab_no,   // license AB
            dl_21c: dp?.bank_details?.bb_no,   // license BB

            cc_no: dp?.bank_details?.cc_no,
            ch_no: dp?.bank_details?.ch_no,
            f_lic_no: dp?.bank_details?.f_lic_no,

            pancard_image: dp?.prop_uploads?.[0]?.pancard,
            license_image: dp?.prop_uploads?.[0]?.license,

            email: dp?.email,
            division: dp?.division,

            emp_id: dp?.user_profile?.emp_id,
            org_id: dp?.user_profile?.org_id,
            designation: dp?.user_profile?.designation,
        };

        return res.json({
            status: true,
            data: formatted,
            message: "User get Successfully",
        });
    }catch(error){
        return res.status(500).json({
            status:false,
            message:error.message
        })
    }
    
};


exports.resendOtp = async (req, res) => {
    try{

        const { mobile } = req.body;

        const response = await axios.get(
            `${process.env.DISTRIBUTER_API_URL}/${mobile}`
        );

        const distributorData = response?.data?.data;

        if (!response?.data?.status || !distributorData) {
            return res.status(404).json({
                status: false,
                message: "Distributor Not Found"
            });
        }

        const otp = "123456";
        // const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await Otp.deleteMany({ mobile });

        await Otp.create({
            mobile,
            otp,
            expires_at: new Date(
                Date.now() + 5 * 60 * 1000
            )
        });

        return res.json({
            status: true,
            message: "OTP Sent",
            otp
        });


    }catch(error){
        if(process.env.ENVIRONMENT === "development"){
            return res.status(500).json({
                status:false,
                message:error.message
            });
        }else{
            return res.status(500).json({
                status:false,
                message:"Internal Server Error"
            });
        }
    }
}

exports.logout = async (req, res) => {

    await User.findByIdAndUpdate(
        req.user.user_id,
        {
            device_token: null
        }
    );

    return res.json({
        status: true,
        message: "Logged Out"
    });
};


exports.updateProfileImage = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                status: false,
                message: "Image is required"
            });
        }

        const imagePath = `/uploads/profile/${req.file.filename}`;

        const user = await User.findById(req.user.user_id);

        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        user.distributor_data.user_profile.profile_image = req.file.filename;
        user.distributor_data.user_profile.profile_image_url = imagePath;

        user.is_updated = 1;

        user.markModified("distributor_data");

        await user.save();

        return res.json({
            status: true,
            message: "Profile image updated successfully",
            image: imagePath
        });

    } catch (error) {

        return res.status(500).json({
            status: false,
            message: error.message
        });

    }
};