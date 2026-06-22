const axios = require("axios");
const jwt = require("jsonwebtoken");
const User = require("../../models/user");
const Otp = require("../../models/otp");
const { generateOtp, sendOtpEmail } = require("../../utils/utility");
const DistTarget = require("../../models/distTarget");
const SaleOrder = require("../../models/saleOrder");
const uploadToS3 = require("../../helpers/uploadToS3");



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
            `${process.env.DISTRIBUTER_API_URL}/${mobile}`,
            {
                validateStatus: () => true
            }
        );

        if (response.status === 404) {
            return res.status(404).json({
                status: false,
                message: "Distributor Not Found"
            });
        }

        

       
        const distributorData = response?.data?.data;
        const email = distributorData?.email ?? null;
        
        const name = distributorData?.user_profile?.name ?? "";

        if (!response?.data?.status || !distributorData) {
            return res.status(404).json({
                status: false,
                message: "Distributor Not Found"
            });
        }

        const otp = "123456";
        //const otp = generateOtp();

        await Otp.deleteMany({ mobile });

        await Otp.create({
            mobile,
            otp,
            expires_at: new Date(
                Date.now() + 5 * 60 * 1000
            )
        });

        console.log(name);

        if (email) {
            await sendOtpEmail(email, otp, name);
        }

        return res.json({
            status: true,
            message: "OTP Sent",
            otp
        });

    } catch (error) {
      
        return res.status(500).json({
            status: false,
            message: error.message
        });
       
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
       const distributorTarget = response?.data?.target;
       const saleOrders = response?.data?.sale_orders;
       

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

        let target = null;
        if (distributorTarget) {

            target = await DistTarget.findOneAndUpdate(
                {
                    user_id: user._id,
                    year: distributorTarget.year,
                    month: distributorTarget.month
                },
                {
                    $set: {
                        user_id: user._id,
                        hq_code: distributorTarget.hq_code,
                        year: distributorTarget.year,
                        month: distributorTarget.month,
                        type: distributorTarget.db_type,
                        db_code: distributorTarget.db_code,
                        db_name: distributorTarget.db_name,
                        tgt_value: distributorTarget.tgt_value
                    }
                },
                {
                    upsert: true,
                    new: true
                }
            );
        }


        if (saleOrders?.length) {

            await SaleOrder.deleteMany({
                user_id: user._id
            });

            await SaleOrder.insertMany(
                saleOrders.map(item => ({
                    user_id: user._id,

                    so_code: item.so_code,
                    csa_code: item.csa_code,
                    csa_name: item.csa_name,
                    division: item.division,
                    div_name: item.div_name,
                    db_code: item.db_code,
                    db_name: item.db_name,
                    sold_city: item.sold_city,
                    so_no: item.so_no,
                    so_date: item.so_date,
                    so_type: item.so_type,
                    so_description: item.so_description,
                    product_code: item.product_code,
                    product_name: item.product_name,
                    order_qty: item.order_qty,
                    uom: item.uom,
                    chq_no: item.chq_no,
                    chq_date: item.chq_date,
                    net_value: item.net_value,
                    total_val: item.total_val,
                    pay_status: item.pay_status,
                    brand: item.brand,
                    hie_code: item.hie_code,
                    hie_name: item.hie_name
                }))
            );
        }

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
        .select("mobile distributor_data is_updated firm")
        .lean();

        if(!user){
            return res.status(404).json({
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
            is_updated: user?.is_updated,
            firm: user?.firm
            
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
        //const otp = generateOtp();

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

        const uploadedImage = await uploadToS3(req.file,"udaan/distributer/profile");
        const user = await User.findById(req.user.user_id);

        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        user.distributor_data.user_profile.profile_image = uploadedImage.fileName;
        user.distributor_data.user_profile.profile_image_url = uploadedImage.url;

        

        user.is_updated = 1;

        user.markModified("distributor_data");

        await user.save();

        return res.json({
            status: true,
            message: "Profile image updated successfully",
            image: uploadedImage.url
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};