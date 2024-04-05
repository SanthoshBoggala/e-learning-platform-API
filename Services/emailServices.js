const { Resend } = require('resend')
const resend = new Resend(process.env.RESEND_KEY);
const { v4: uuidv4 } = require('uuid');


const sendEmailConfirmation = async (name, email) => {
    const verificationToken = uuidv4();

    const { data, error } = await resend.emails.send({
        from: `${process.env.DOMAIN}`,
        to: email,
        subject: 'Email Verification',
        html: `
            <p>Dear ${name},</p>
            <p>Thank you for signing up with us!</p>
            <p>Please click the following link to verify your email:</p>
            <p><a href="http://yourwebsite.com/verify-email?token=${verificationToken}">Verify Email</a></p>
            <p>If you did not sign up for an account, please ignore this email.</p>
            <p>Sincerely,<br/>Your Company</p>
        `,
    });
    return ({ data, error });
}

module.exports = {
    sendEmailConfirmation
}