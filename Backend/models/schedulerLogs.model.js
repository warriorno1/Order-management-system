import mongoose from "mongoose";

const schedulerLogsSchema = new mongoose.Schema({
    startedAt: {
        type: Date,
        default: Date.now
    },
    finishedAt: {
        type: Date
    },
    ordersScanned: {
        type: Number,
        default: 0
    },
    ordersUpdated: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['SUCCESS', 'FAILED'],
        required: true
    },
    errorMessage: {
        type: String
    }
});

const SchedulerLog = mongoose.model('SchedulerLog', schedulerLogsSchema);

export default SchedulerLog;