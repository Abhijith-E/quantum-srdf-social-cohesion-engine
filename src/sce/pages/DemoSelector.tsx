
import { Card, CardContent } from '../components/DashboardCards';

const DemoSelector = ({ onSelect, loadingId }: { onSelect: (scenario: string) => void, loadingId: string | null }) => {
    const scenarios = [
        { id: 'classroom_conflict', name: 'Classroom Conflict', desc: '30 Students, 3 Cliques' },
        { id: 'workplace_tension', name: 'Workplace Tension', desc: '50 Employees, Cross-Department' },
        { id: 'campus_polarization', name: 'Campus Polarization', desc: '100 Students, Ideological split' },
        { id: 'online_community', name: 'Online Community', desc: '200 Users, Scale-free' }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            {scenarios.map(s => {
                const isLoading = loadingId === s.id;
                return (
                    <Card key={s.id} className="hover:shadow-lg transition-shadow">
                        <CardContent>
                            <h3 className="text-xl font-bold">{s.name}</h3>
                            <p className="text-gray-600">{s.desc}</p>
                            <button
                                onClick={() => onSelect(s.id)}
                                disabled={!!loadingId}
                                className={`mt-4 px-4 py-2 rounded text-white font-semibold transition-colors w-full
                                    ${isLoading ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'}
                                    ${loadingId && !isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? '⏳ Loading…' : 'Load & Analyze'}
                            </button>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};

export default DemoSelector;
