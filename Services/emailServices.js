const { Resend } = require('resend')
const resend = new Resend(process.env.RESEND_KEY);
const { v4: uuidv4 } = require('uuid');


const sendEmailConfirmation = async (name, email) => {
    const verificationToken = uuidv4();

    const { data, error } = await resend.emails.send({
        from: 'e-learning-platform <onboarding@resend.dev>',
        to: ['bsanthoshbsr835@gmail.com'],
        subject: 'Email Verification',
        html: `
            <p>Dear ${name},</p>
            <p>Thank you for signing up with us!</p>
            <p>Please click the following link to verify your email:</p>
            <p><a href="http://yourwebsite.com/verify-email?token=${verificationToken}">Verify Email</a></p>
            <p>If you did not sign up for an account, please ignore this email.</p>
            <p>Sincerely,<br/>Ye-learning-platform</p>
        `,
    });
    return { data, error };
}
const sendPassResetEmail = async (name, email) => {
    const { data, error } = await resend.emails.send({
        from: 'e-learning-platform <onboarding@resend.dev>',
        to: ['bsanthoshbsr835@gmail.com'],
        subject: 'Password Reset Request Successfull',
        html: `
            <p>Dear ${name},</p>
            <p>We received a request to reset your password.</p>
            <p>Your password reset is successfull.</p>
            <p>Sincerely,<br/>e-learning-platform</p>
        `,
    });

    return { data, error };
};

const sendCourseEnrollEmail = async (user, course) => {
    const { data, error } = await resend.emails.send({
        from: 'e-learning-platform <onboarding@resend.dev>',
        to: ['bsanthoshbsr835@gmail.com'],
        subject: "Thank You for Purchasing Our Course",
        html: `
            <p>Dear ${user.name},</p>
            <p>Thank you for purchasing our course "<strong>${course.title}</strong>".</p>
            <p>Course Description: ${course.description}</p>
            <p>Category: ${course.category}</p>
            <p>Popularity: ${course.popularity}</p>
            <p>Level: ${course.level}</p>
            <p>Instructors: ${course.instructors.join(', ')}</p>
            <p>Price: ${course.new_price}</p>
            <p>Discount: ${course.discount}</p>
            <p>Start Date: ${course.start_date}</p>
            <p>End Date: ${course.end_date}</p>
            <p>Skills Learned: ${course.skills_learned.join(', ')}</p>
            <p>We hope you enjoy the course!</p>
            <p>Sincerely,<br/>E-Learning-Platform</p>
        `
    });

    return { data, error };
};

module.exports = {
    sendPassResetEmail,
    sendEmailConfirmation,
    sendCourseEnrollEmail
}