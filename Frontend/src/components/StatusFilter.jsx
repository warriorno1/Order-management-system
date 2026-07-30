const STATUS_OPTIONS = ['ALL', 'PLACED', 'PROCESSING', 'READY_TO_SHIP', 'DELIVERED', 'CANCELLED'];

const StatusFilter = ({ selectedStatus, onChange }) => {
    return (
        <select
            value={selectedStatus}
            onChange={(e) => onChange(e.target.value)}
        >
            {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                    {status}
                </option>
            ))}
        </select>
    );
};

export default StatusFilter;