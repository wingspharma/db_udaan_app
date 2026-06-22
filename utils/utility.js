const nodemailer = require("nodemailer");
const Otp = require("../models/otp");

// Generate 6-digit OTP
const generateOtp = () => {
    return "123456";
    // return Math.floor(100000 + Math.random() * 900000).toString();
};


const createOtp = async (mobile) => {
    const otp = generateOtp();

    await Otp.deleteMany({ mobile });

    await Otp.create({
        mobile,
        otp,
        expires_at: new Date(Date.now() + 5 * 60 * 1000)
    });

    return otp;
};

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // false for port 587, true for 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Verify SMTP Connection
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ SMTP Connection Failed");
        console.error(error);
    } else {
        console.log("✅ SMTP Server Connected Successfully");
    }
});

// Send OTP Email
const sendOtpEmail = async (email, otp, name) => {
    try {
        const info = await transporter.sendMail({
            from: `"Wings Pharma" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Distributor Udaan App - OTP Verification",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                    <h2 style="color:#2c3e50;">Distributor Udaan App</h2>

                    <p>Hello, ${name}</p>

                    <p>Your One-Time Password (OTP) for login is:</p>

                    <h1 style="letter-spacing:6px; color:#007bff;">
                        ${otp}
                    </h1>

                    <p>This OTP is valid for <strong>5 minutes</strong>.</p>

                    <p>Please do not share this OTP with anyone.</p>

                    <br>

                    <p>Regards,<br>
                    <strong>Wings Pharma Team</strong></p>
                </div>
            `
        });

        console.log("✅ Email Sent Successfully");
        console.log("Message ID:", info.messageId);

        return info;

    } catch (error) {
        console.error("❌ Email Sending Failed");
        console.error(error);
        throw error;
    }
};

module.exports = {
    generateOtp,
    sendOtpEmail,
    createOtp
};