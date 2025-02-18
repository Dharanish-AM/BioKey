const jwt = require('jsonwebtoken');

const secret = process.env.UNIQUE_KEY_SECRET || 'default_secret_key';


const generateUniqueKey = (userId, email) => {
    return jwt.sign({ userId, email }, secret, { noTimestamp: true }); 
};


const decodeUniqueKey = (token) => {
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        return null; 
    }
};

module.exports = { generateUniqueKey, decodeUniqueKey };
