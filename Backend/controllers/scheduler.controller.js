import Order from '../models/orders.model.js';
import SchedulerLog from '../models/schedulerLogs.model.js';

const TEN_MINUTES = 10 * 60 * 1000;
const TWENTY_MINUTES = 20 * 60 * 1000;

export const runStatusUpdate = async (req, res, next) => {
    const startedAt = new Date();
    let ordersScanned = 0;
    let ordersUpdated = 0;

    try {
        const now = new Date();

        
        const placedCutoff = new Date(now.getTime() - TEN_MINUTES);
        const placedOrders = await Order.find({
            orderStatus: 'PLACED',
            createdAt: { $lte: placedCutoff }
        });
        ordersScanned += placedOrders.length;

        for (const order of placedOrders) {
            const result = await Order.findOneAndUpdate(
                { _id: order._id, orderStatus: 'PLACED' },
                {
                    $set: { orderStatus: 'PROCESSING' },
                    $push: {
                        statusHistory: {
                            fromStatus: 'PLACED',
                            toStatus: 'PROCESSING',
                            changedAt: new Date(),
                            changedBy: 'scheduler'
                        }
                    }
                },
                { new: true }
            );
            if (result) ordersUpdated++;
        }

        
        const processingCutoff = new Date(now.getTime() - TWENTY_MINUTES);
        const processingOrders = await Order.find({
            orderStatus: 'PROCESSING',
            updatedAt: { $lte: processingCutoff }
        });
        ordersScanned += processingOrders.length;

        for (const order of processingOrders) {
            const result = await Order.findOneAndUpdate(
                { _id: order._id, orderStatus: 'PROCESSING' },
                {
                    $set: { orderStatus: 'READY_TO_SHIP' },
                    $push: {
                        statusHistory: {
                            fromStatus: 'PROCESSING',
                            toStatus: 'READY_TO_SHIP',
                            changedAt: new Date(),
                            changedBy: 'scheduler'
                        }
                    }
                },
                { new: true }
            );
            if (result) ordersUpdated++;
        }

        const finishedAt = new Date();

        const log = await SchedulerLog.create({
            startedAt,
            finishedAt,
            ordersScanned,
            ordersUpdated,
            status: 'SUCCESS'
        });

        return res.status(200).json({
            success: true,
            summary: {
                ordersScanned,
                ordersUpdated,
                startedAt,
                finishedAt
            },
            logId: log._id
        });

    } catch (error) {
        const finishedAt = new Date();
        await SchedulerLog.create({
            startedAt,
            finishedAt,
            ordersScanned,
            ordersUpdated,
            status: 'FAILED',
            errorMessage: error.message
        });
        next(error);
    }
};