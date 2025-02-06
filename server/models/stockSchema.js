const mongoose = require('mongoose');


const stockSchema = new mongoose.Schema({
    serialNumber: {
        type: Number,
        required: true,
        unique: true
    },
    manufacturedDate: {
        type: Date,
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    warrantyExpiration: {
        type: Date,
        required: true
    },
    deviceStatus: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Inactive'
    }
});


const Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock;
