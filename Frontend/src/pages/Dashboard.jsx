import { useState } from 'react';
import { useOrders } from '../hooks/useOrders';
import StatusFilter from '../components/StatusFilter';
import OrdersTable from '../components/OrderTable';

const Dashboard = () => {
    const [statusFilter, setStatusFilter] = useState('ALL');

    const apiStatus = statusFilter === 'ALL' ? '' : statusFilter;
    const { orders, loading, error, refetch } = useOrders(apiStatus);

    return (
        <div>
            <h1>Order Management Dashboard</h1>

            <div>
                <StatusFilter selectedStatus={statusFilter} onChange={setStatusFilter} />
                <button onClick={refetch}>Refresh</button>
            </div>

            {loading && <p>Loading orders...</p>}

            {!loading && error && (
                <div>
                    <p>Something went wrong: {error}</p>
                    <button onClick={refetch}>Retry</button>
                </div>
            )}

            {!loading && !error && orders.length === 0 && (
                <p>No orders found for this status.</p>
            )}

            {!loading && !error && orders.length > 0 && (
                <OrdersTable orders={orders} />
            )}
        </div>
    );
};

export default Dashboard;