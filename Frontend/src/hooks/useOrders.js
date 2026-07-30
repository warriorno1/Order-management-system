import { useState, useEffect, useCallback } from 'react';
import { fetchOrders } from '../services/orderService';

export const useOrders = (statusFilter) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchOrders(statusFilter);
            setOrders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    return { orders, loading, error, refetch: loadOrders };
};