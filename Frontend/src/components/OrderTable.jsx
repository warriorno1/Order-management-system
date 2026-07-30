const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString();
};

const OrdersTable = ({ orders }) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Customer Name</th>
                    <th>Phone</th>
                    <th>Product Name</th>
                    <th>Amount</th>
                    <th>Order Status</th>
                    <th>Payment Status</th>
                    <th>Created Time</th>
                </tr>
            </thead>
            <tbody>
                {orders.map((order) => (
                    <tr key={order.orderId}>
                        <td>{order.orderId}</td>
                        <td>{order.customerName}</td>
                        <td>{order.phone}</td>
                        <td>{order.productName}</td>
                        <td>{order.amount}</td>
                        <td>{order.orderStatus}</td>
                        <td>{order.paymentStatus}</td>
                        <td>{formatDate(order.createdAt)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default OrdersTable;