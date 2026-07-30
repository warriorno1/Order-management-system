export const verifySchedulerSecret = (req, res, next) => {
    const providedSecret = req.headers['x-scheduler-secret'];

    if (!providedSecret || providedSecret !== process.env.SCHEDULER_SECRET) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: invalid or missing scheduler secret'
        });
    }

    next();
};