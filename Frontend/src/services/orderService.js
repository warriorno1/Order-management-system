const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchOrders = async (status = '') => {
    const url = status
        ? `${BASE_URL}/order?status=${encodeURIComponent(status)}`
        : `${BASE_URL}/order`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch orders (status ${response.status})`);
    }

    const data = await response.json();
    return data.data; // matches your backend's { success, data, pagination } shape
};