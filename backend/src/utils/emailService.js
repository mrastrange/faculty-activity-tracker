const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    // Using a test SMTP service or standard credentials
    // For production, use Sendgrid/AWS SES or actual SMTP server details
    service: 'gmail', // or your preferred service
    auth: {
        user: "abijithtest1234@gmail.com",
        pass: "lusjfwgyqmvmpong",
    }
});

const sendVerificationEmail = async (toEmail, otpCode) => {
    try {
        const mailOptions = {
            from: 'abijithtest1234@gmail.com',
            to: toEmail,
            subject: 'Verify Your Faculty Tracker Account',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #4F46E5; text-align: center;">Account Verification</h2>
                    <p style="font-size: 16px; color: #333;">Hello,</p>
                    <p style="font-size: 16px; color: #333;">Your account has been created by the Admin. Please verify your email address using the One-Time Password (OTP) below:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: bold; padding: 10px 20px; background-color: #f4f4f4; color: #4F46E5; border-radius: 5px; letter-spacing: 5px;">
                            ${otpCode}
                        </span>
                    </div>
                    <p style="font-size: 14px; color: #666;">This OTP is valid for the next 15 minutes.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #999; text-align: center;">If you did not request this account, please ignore this email.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

const sendApprovalEmail = async (toEmail, activityTitle, category, significance, score) => {
    try {
        const mailOptions = {
            from: 'abijithtest1234@gmail.com',
            to: toEmail,
            subject: 'Activity Approved - Merit Score Updated',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <br>
                    <h2 style="color: #10B981; text-align: center;">Activity Approved</h2>
                    <p style="font-size: 16px; color: #333;">Hello,</p>
                    <p style="font-size: 16px; color: #333;">Good news! Your recent activity submission has been reviewed and officially <strong>Approved</strong> by the administration.</p>
                    
                    <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10B981;">
                        <h3 style="margin-top: 0; color: #0f172a;">Submission Details</h3>
                        <p><strong>Activity Title:</strong> ${activityTitle}</p>
                        <p><strong>Category:</strong> ${category}</p>
                        <p><strong>Significance:</strong> ${significance}</p>
                        <h3 style="margin-bottom: 0; color: #4F46E5;">Points Awarded: <span style="font-size: 24px;">+${score}</span></h3>
                    </div>

                    <p style="font-size: 14px; color: #666;">These points have been automatically added to your total Academic Performance Index (API) score for this academic year.</p>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="http://localhost:5173/faculty-login" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Your Dashboard</a>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Approval email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending approval email:', error);
        return false;
    }
};

module.exports = {
    sendVerificationEmail,
    sendApprovalEmail
};
