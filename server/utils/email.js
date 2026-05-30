const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const BREVO_API_KEY = process.env.BREVO_API_KEY;

const sendOTPEmail = async (userEmail, otp, type) => {
    try {
        const title = type === 'account_verification' ? 'Verify your Eventora Account' : 'Eventora Booking Verification';
        const msg = type === 'account_verification' ? 'Please use the following OTP to verify your new Eventora account.' : 'Please use the following OTP to verify and confirm your event booking.';

        const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
            sender: { 
                name: "Eventora", 
                email: "noreply@eventora.in"     // ← Change this to your desired sender email
            },
            to: [{ email: userEmail }],
            subject: title,
            htmlContent: `
                <h3>${title}</h3>
                <p>${msg}</p>
                <h2>${otp}</h2>
                <p>This code expires in 5 minutes.</p>
            `
        }, {
            headers: {
                'api-key': BREVO_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        console.log(`✅ OTP sent successfully to ${userEmail}`);
        return response.data;
    } catch (error) {
        console.error('❌ Error sending OTP email:', error.response?.data || error.message);
        throw error;   // Important: Throw so you can see error in your route
    }
};

const sendBookingEmail = async (userEmail, userName, eventTitle) => {
    try {
        await axios.post('https://api.brevo.com/v3/smtp/email', {
            sender: { 
                name: "Eventora", 
                email: "noreply@eventora.in"     // ← Same here
            },
            to: [{ email: userEmail }],
            subject: `Booking Confirmed: ${eventTitle}`,
            htmlContent: `
                <h3>Booking Confirmed: ${eventTitle}</h3>
                <p>Hi ${userName}!</p>
                <p>Your booking has been confirmed.</p>
            `
        }, {
            headers: {
                'api-key': BREVO_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Booking email sent to', userEmail);
    } catch (error) {
        console.error('❌ Error sending booking email:', error.response?.data || error.message);
    }
};

module.exports = { sendBookingEmail, sendOTPEmail };