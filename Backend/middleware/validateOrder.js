 const validateOrder = (req, res, next) => {
    const { customerName, phone, productName, amount } = req.body;

    const errors = [];

    if (!customerName || typeof customerName !== 'string' || !customerName.trim()) {
        errors.push('customerName is required');
    }
    if (!phone || typeof phone !== 'string' || !phone.trim()) {
        errors.push('phone is required');
    }
    if (!productName || typeof productName !== 'string' || !productName.trim()) {
        errors.push('productName is required');
    }
    if (amount === undefined || amount === null || isNaN(amount) || Number(amount) <= 0) {
        errors.push('amount is required and must be a positive number');
    }

    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }

    next();
};

export default validateOrder;