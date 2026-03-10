

const SolverBadge = ({ type }: { type: string }) => {
    const colors: Record<string, string> = {
        ILP: 'bg-blue-100 text-blue-800',
        VQE: 'bg-purple-100 text-purple-800',
        GA: 'bg-green-100 text-green-800',
        Hybrid: 'bg-orange-100 text-orange-800'
    };

    return (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
            {type}
        </span>
    );
};

export default SolverBadge;
