const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const { sendVerificationEmail } = require('../utils/emailService');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const registerUser = async (req, res, next) => {
    try {
        const { department_id, first_name, last_name, email, password } = req.body;
        const role = 'Faculty'; // Hardcoded as per business logic

        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ message: 'Please include all required fields' });
        }

        const userExists = await UserModel.findByEmail(email);
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Disabled hashing temporarily for testing
        // const salt = await bcrypt.genSalt(10);
        // const password_hash = await bcrypt.hash(password, salt);
        const password_hash = password;

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // OTP valid for 15 minutes
        const otp_expires_at = new Date(Date.now() + 15 * 60 * 1000);

        const userData = {
            department_id: department_id || null,
            first_name,
            last_name,
            email,
            password_hash,
            role,
            otp,
            otp_expires_at
        };
        const user = await UserModel.create(userData);

        if (user) {
            // Attempt to send email but don't fail registration if SMTP is misconfigured
            await sendVerificationEmail(user.email, otp);

            res.status(201).json({
                message: 'User created successfully. Verification email sent.',
                _id: user.id,
                email: user.email,
                role: user.role
                // Note: Not sending token here until they are verified.
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        next(error);
    }
};

const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Find user
        const user = await UserModel.findByEmail(email);
        console.log(`[LOGIN ATTEMPT] Email: '${email}'. User Found in DB? ${!!user}`);

        if (!user) {
            console.log(`[LOGIN ATTEMPT] Failed - user not found`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password (plain text comparison temporarily)
        // const isMatch = await bcrypt.compare(password, user.password_hash);
        const isMatch = (password === user.password_hash);
        console.log(`[LOGIN ATTEMPT] Password valid? ${isMatch} (Provided password: '${password}', DB password: '${user.password_hash}')`);

        if (isMatch) {
            if (!user.is_active) {
                return res.status(403).json({ message: 'Account is deactivated' });
            }

            if (!user.is_verified) {
                return res.status(401).json({
                    message: 'Account is not verified. Please check your email for the OTP.',
                    isVerified: false
                });
            }

            return res.json({
                _id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
                department_id: user.department_id,
                designation: user.designation,
                qualification: user.qualification,
                token: generateToken(user.id, user.role)
            });
        } else {
            console.log(`[LOGIN ATTEMPT] Failed - password mismatch`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        next(error);
    }
};

const verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const user = await UserModel.findByEmail(email);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.is_verified) {
            return res.status(400).json({ message: 'User is already verified' });
        }

        const pool = require('../config/db').pool;
        const validCheck = await pool.query(
            "SELECT id FROM users WHERE email = $1 AND otp = $2 AND otp_expires_at > NOW()",
            [email, otp]
        );

        if (validCheck.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // OTP is valid and not expired
        const verifiedUser = await UserModel.verifyUser(user.id);

        res.status(200).json({
            message: 'Email successfully verified',
            _id: verifiedUser.id,
            email: verifiedUser.email,
            role: verifiedUser.role,
            designation: verifiedUser.designation,
            qualification: verifiedUser.qualification,
            token: generateToken(verifiedUser.id, verifiedUser.role)
        });

    } catch (error) {
        next(error);
    }
};

const getMe = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.user.id);
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

const checkEmail = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const UserModel = require('../models/userModel');
        const user = await UserModel.findByEmail(email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if it's their first time (password is null)
        if (!user.password_hash) {
            // Generate OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            // Save OTP to DB for this user (PG Native interval)
            const pool = require('../config/db').pool;
            await pool.query("UPDATE users SET otp = $1, otp_expires_at = NOW() + INTERVAL '15 minutes' WHERE id = $2", [otp, user.id]);

            // Send email
            const { sendVerificationEmail } = require('../utils/emailService');
            await sendVerificationEmail(user.email, otp);

            return res.status(200).json({ exists: true, isFirstTime: true, message: 'OTP sent to email.' });
        }

        // They already have a password
        return res.status(200).json({ exists: true, isFirstTime: false });

    } catch (error) {
        next(error);
    }
};

const setupPassword = async (req, res, next) => {
    try {
        const { email, otp, password } = req.body;
        if (!email || !otp || !password) return res.status(400).json({ message: 'Missing required fields' });

        const UserModel = require('../models/userModel');
        const user = await UserModel.findByEmail(email);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const pool = require('../config/db').pool;
        const validCheck = await pool.query(
            "SELECT id FROM users WHERE email = $1 AND otp = $2 AND otp_expires_at > NOW()",
            [email, otp]
        );

        if (validCheck.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Hash and save new password
        // Temporarily storing plain text as per project current state
        const password_hash = password;

        await pool.query('UPDATE users SET password_hash = $1, is_verified = true, otp = NULL, otp_expires_at = NULL WHERE id = $2', [password_hash, user.id]);

        return res.json({
            message: 'Password established successfully',
            _id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role,
            department_id: user.department_id,
            designation: user.designation,
            qualification: user.qualification,
            token: generateToken(user.id, user.role)
        });
    } catch (err) {
        next(err);
    }
};

const adminCreateUser = async (req, res, next) => {
    try {
        const { first_name, last_name, email, role, designation, department_id } = req.body;
        
        if (!first_name || !last_name || !email || !role || !designation) {
            return res.status(400).json({ message: 'First name, last name, email, role, and track / designation are required' });
        }

        if (!['Admin', 'HOD', 'Faculty'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role selected' });
        }

        const userExists = await UserModel.findByEmail(email);
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const userData = {
            department_id: department_id || null,
            designation,
            first_name,
            last_name,
            email,
            password_hash: null, // First-time login will trigger setup
            role,
            otp: null,
            otp_expires_at: null
        };

        const user = await UserModel.create(userData);
        res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
        next(error);
    }
};

const getAllUsers = async (req, res, next) => {
    try {
        const UserModel = require('../models/userModel');
        const users = await UserModel.findAll();
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
    loginUser,
    verifyOTP,
    getMe,
    checkEmail,
    setupPassword,
    getAllUsers,
    adminCreateUser
};
