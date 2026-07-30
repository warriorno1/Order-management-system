import Order from '../models/orders.model.js';

 export const createOrder = async (req, res, next) => {
    try {
        const { customerName, phone, productName, amount, paymentStatus, idempotencyKey } = req.body;

        
        if (idempotencyKey) {
            const existing = await Order.findOne({ idempotencyKey });
            if (existing) {
                return res.status(409).json({
                    success: false,
                    message: 'Duplicate order detected for this idempotency key',
                    order: existing
                });
            }
        }

        
        const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

        const newOrder = new Order({
            orderId,
            customerName: customerName.trim(),
            phone: phone.trim(),
            productName: productName.trim(),
            amount: Number(amount),
            paymentStatus: paymentStatus || 'PENDING',
            orderStatus: 'PLACED',
            idempotencyKey: idempotencyKey || undefined,
            statusHistory: [
                {
                    fromStatus: null,
                    toStatus: 'PLACED',
                    changedAt: new Date(),
                    changedBy: 'system'
                }
            ]
        });

        const savedOrder = await newOrder.save();

        return res.status(201).json({
            success: true,
            order: savedOrder
        });

    } catch (error) {
    
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Duplicate order — this idempotency key or orderId already exists'
            });
        }
        next(error); 
    }
};

 export const getOrders = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const filter = {};
        if (status) {
            filter.orderStatus = status;
        }

        const pageNumber = Math.max(Number(page), 1);
        const limitNumber = Math.max(Number(limit), 1);
        const skip = (pageNumber - 1) * limitNumber;

        const [orders, totalCount] = await Promise.all([
            Order.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber),
            Order.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            data: orders,
            pagination: {
                totalCount,
                currentPage: pageNumber,
                totalPages: Math.ceil(totalCount / limitNumber),
                limit: limitNumber
            }
        });

    } catch (error) {
        next(error);
    }
};

export const getOrderById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const order = await Order.findOne({ orderId: id });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: `Order with orderId '${id}' not found`
            });
        }

        return res.status(200).json({
            success: true,
            data: order
        });

    } catch (error) {
        next(error);
    }
};

