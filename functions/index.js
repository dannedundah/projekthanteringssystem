/**
 * Import function triggers from their respective submodules:
 */
const { onRequest } = require('firebase-functions/v2/https');
const { onCreate } = require('firebase-functions/v2/auth');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const logger = require('firebase-functions/logger');
const nodemailer = require('nodemailer');

// Initialize Firebase
initializeApp();
const auth = getAuth();
const db = getFirestore();

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'din.email@gmail.com', // Byt ut till din Gmail-adress
    pass: 'ditt-lösenord', // Byt ut till ditt Gmail-lösenord
  },
});

// Function to send approval email to admin
exports.sendApprovalEmail = onCreate(async (user) => {
  const mailOptions = {
    from: 'din.email@gmail.com', // Din Gmail-adress
    to: 'daniel@delidel.se', // Administratörens e-postadress
    subject: 'Ny användare behöver godkännande',
    text: `En ny användare har registrerat sig med e-post: ${user.email}. Gå till din Firebase Console för att godkänna eller avvisa användaren.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info('Approval email sent to admin.');
  } catch (error) {
    logger.error('Error sending email:', error);
  }
});

// Function to verify user after admin approval
exports.verifyUser = onRequest(async (req, res) => {
  const { uid } = req.body;

  try {
    await auth.updateUser(uid, { emailVerified: true });
    res.status(200).send('User verified successfully.');
  } catch (error) {
    logger.error('Error verifying user:', error);
    res.status(500).send('Error verifying user.');
  }
});
