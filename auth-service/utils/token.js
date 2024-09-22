const jwt = require('jsonwebtoken')
require('dotenv').config()

const secretKey = process.env.secret_key
const algorithm = process.env.algorithm
const expiresIn = '1h'

function createToken(email, business, role) {
    const payload = { email, business, role }
    return jwt.sign(payload, secretKey, {algorithm, expiresIn})
}

function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, secretKey, { algorithms: [algorithm] });
        return { valid: true, decoded };
    } catch (err) {
        return { valid: false, error: err.message };
    }
}

module.exports = {
    createToken,
    verifyToken
}