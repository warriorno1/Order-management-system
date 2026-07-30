import cron from 'node-cron';

const SCHEDULER_URL = `http://localhost:${process.env.PORT || 3000}/api/scheduler/run-status-update`;

export const startLocalScheduler = () => {
    
    cron.schedule('*/1 * * * *', async () => {
        console.log('Running scheduled status update...');
        try {
            const response = await fetch(SCHEDULER_URL, {
                method: 'POST',
                headers: {
                    'x-scheduler-secret': process.env.SCHEDULER_SECRET
                }
            });
            const data = await response.json();
            console.log('Scheduler run result:', data.summary || data.message);
        } catch (error) {
            console.error('Scheduler run failed:', error.message);
        }
    });

    console.log('Local cron scheduler started — running every 5 minutes');
};