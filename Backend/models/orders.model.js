import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema({
    fromStatus: {
        type: String
    },
    toStatus: {
        type: String
    },
    changedAt: {
        type: Date,
        default: Date.now
    },
    changedBy: {
        type: String
    }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    customerName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'PAID', 'FAILED'],
        default: 'PENDING'
    },
    orderStatus: {
        type: String,
        enum: ['PLACED', 'PROCESSING', 'READY_TO_SHIP', 'DELIVERED', 'CANCELLED'],
        default: 'PLACED'
    },
    statusHistory: [statusHistorySchema],
    idempotencyKey: {
        type: String,
        unique: true,
        sparse: true
    }
}, { timestamps: true });

orderSchema.index({ orderStatus: 1, createdAt: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;