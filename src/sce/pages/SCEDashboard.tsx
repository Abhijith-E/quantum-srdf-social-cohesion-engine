import { useNavigate } from 'react-router-dom';
import DemoSelector from './DemoSelector';
import useSCEStore from '../store/sceStore';
import { loadDemoNetwork } from '../api/sceApi';

const SCEDashboard = () => {
    const { setNetwork } = useSCEStore();
    const navigate = useNavigate();

    const handleSelectDemo = async (scenario: string) => {
        try {
            const net = await loadDemoNetwork(scenario);
            setNetwork(net);
            console.log('Loaded:', net);
            navigate('/sce/analyze');
        } catch (e) {
            console.error('Failed to load demo', e);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-extrabold text-blue-900 mb-4">
                        Social Cohesion Engine
                    </h1>
                    <p className="text-xl text-gray-600">
                        Identify Strategic Mediators in Polarized Social Networks via Quantum VQE & SRDF
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-2">
                        <h2 className="text-2xl font-bold mb-4">Try a Demo Scenario</h2>
                        <DemoSelector onSelect={handleSelectDemo} />
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-6 rounded-xl shadow-lg text-white">
                        <h2 className="text-xl font-bold mb-4">Upload Context</h2>
                        <p className="mb-4">Or provide your own network via CSV or structured survey responses.</p>
                        <button className="w-full py-3 bg-white text-blue-700 font-bold rounded hover:bg-gray-100">
                            Upload Custom Network
                        </button>
                    </div>
                </div>

                <div className="text-center text-sm text-gray-500 mt-16">
                    <p>Powered by GraphSAGE AI and Qiskit Serverless integration.</p>
                </div>
            </div>
        </div>
    );
};

export default SCEDashboard;
