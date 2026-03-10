import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DemoSelector from './DemoSelector';
import useSCEStore from '../store/sceStore';
import { loadDemoNetwork } from '../api/sceApi';

const SCEDashboard = () => {
    const { setNetwork } = useSCEStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSelectDemo = async (scenario: string) => {
        setLoading(scenario);
        setError(null);
        try {
            const net = await loadDemoNetwork(scenario);
            setNetwork(net);
            navigate('/sce/analyze');
        } catch (e: any) {
            console.error('Failed to load demo', e);
            setError(`Failed to connect to backend: ${e.message || 'Unknown error'}. Make sure Flask is running on port 5001.`);
        } finally {
            setLoading(null);
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

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium text-sm">
                        ⚠️ {error}
                    </div>
                )}

                {loading && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 font-medium text-sm flex items-center gap-3">
                        <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Loading <strong>{loading}</strong>… please wait.
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-2">
                        <h2 className="text-2xl font-bold mb-4">Try a Demo Scenario</h2>
                        <DemoSelector onSelect={handleSelectDemo} loadingId={loading} />
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-6 rounded-xl shadow-lg text-white">
                        <h2 className="text-xl font-bold mb-4">Upload Custom Network</h2>
                        <p className="mb-4">Or provide your own network via CSV or structured survey responses.</p>
                        <button
                            onClick={() => navigate('/sce/upload')}
                            className="w-full py-3 bg-white text-blue-700 font-bold rounded hover:bg-gray-100"
                        >
                            Upload Network →
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SCEDashboard;
