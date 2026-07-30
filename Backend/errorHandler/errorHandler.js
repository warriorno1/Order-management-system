const errorHandler = (err, req, res, next) => {
    console.error(err);

    
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: messages
        });
    }

    
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0];
        return res.status(409).json({
            success: false,
            message: `Duplicate value for field: ${field}`
        });
    }

    
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: `Invalid value for field: ${err.path}`
        });
    }

    
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
        success: false,
        message: err.message || 'Something went wrong'
    });
};

export default errorHandler;