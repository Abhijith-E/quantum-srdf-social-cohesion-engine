import { useState } from 'react';
import useSCEStore from '../store/sceStore';
import { generateInterventionPlan } from '../api/sceApi';
import SolverBadge from '../components/SolverBadge';

const ResultsDashboard = () => {
    const { network, solverResult } = useSCEStore();
    const [activeTab, setActiveTab] = useState('overview');
    const [aiPlan, setAiPlan] = useState<any>(null);
    const [loadingPlan, setLoadingPlan] = useState(false);

    if (!solverResult) return <div className="p-8 text-center">No results available. Please run an analysis first.</div>;

    const handleGeneratePlan = async () => {
        setLoadingPlan(true);
        try {
            const plan = await generateInterventionPlan(network.id);
            setAiPlan(plan);
        } catch (e) {
            console.error('Failed to generate plan:', e);
        } finally {
            setLoadingPlan(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-3xl font-extrabold mb-6">Social Cohesion Analysis Report</h2>

            {/* TABS */}
            <div className="flex border-b mb-6">
                {['overview', 'mediators', 'vulnerable', 'conflict', 'ai_plan'].map(tab => (
                    <button
                        key={tab}
                        className={`px-4 py-2 font-semibold capitalize ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded shadow border-l-4 border-blue-500">
                        <h4 className="text-gray-500 text-sm">Minimum SRDF Weight (γsR)</h4>
                        <p className="text-3xl font-bold">{solverResult.total_weight}</p>
                    </div>
                    <div className="bg-white p-4 rounded shadow border-l-4 border-yellow-500">
                        <h4 className="text-gray-500 text-sm">Mediators Needed</h4>
                        <p className="text-3xl font-bold">{solverResult.mediators.length} <span className="text-sm font-normal text-gray-400">({((solverResult.mediators.length / network.nodes.length) * 100).toFixed(1)}%)</span></p>
                    </div>
                    <div className="bg-white p-4 rounded shadow border-l-4 border-red-500">
                        <h4 className="text-gray-500 text-sm">Vulnerable Persons</h4>
                        <p className="text-3xl font-bold text-red-600">{solverResult.vulnerable_nodes.length}</p>
                    </div>
                    <div className="bg-white p-4 rounded shadow">
                        <h4 className="text-gray-500 text-sm">Optimization Engine</h4>
                        <div className="mt-2"><SolverBadge type={solverResult.solver_used} /></div>
                    </div>
                </div>
            )}

            {activeTab === 'mediators' && (
                <div className="bg-white p-6 rounded shadow overflow-x-auto">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-yellow-500 inline-block"></span> Identified Strategic Mediators (Weight 2)
                    </h3>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="p-3">Node ID</th>
                                <th className="p-3">Role</th>
                                <th className="p-3">Risk Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {solverResult.mediators.map((m_id: string) => {
                                const node = network.nodes.find((n: any) => n.id === m_id) || { role: 'unknown', department: 'unknown' };
                                const risk = solverResult.ai_risk_scores[m_id] || 0;
                                return (
                                    <tr key={m_id} className="border-b hover:bg-yellow-50/30">
                                        <td className="p-3 font-semibold text-blue-900">{m_id}</td>
                                        <td className="p-3">{node.role} ({node.department})</td>
                                        <td className="p-3">
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div className={`h-2.5 rounded-full ${risk > 0.6 ? 'bg-red-600' : 'bg-green-600'}`} style={{ width: `${risk * 100}%` }}></div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'ai_plan' && (
                <div className="bg-white p-6 rounded shadow border border-purple-100">
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                            AI Intervention Strategy
                        </h3>
                        <button
                            onClick={handleGeneratePlan}
                            disabled={loadingPlan}
                            className="bg-purple-600 text-white px-4 py-2 rounded font-bold hover:bg-purple-700 transition"
                        >
                            {loadingPlan ? 'Synthesizing Plan...' : (aiPlan ? 'Regenerate Plan' : 'Generate NLP Plan (Claude)')}
                        </button>
                    </div>

                    {aiPlan ? (
                        <div className="prose prose-blue max-w-none">
                            <p className="text-lg text-gray-800 leading-relaxed bg-gray-50 p-6 rounded border-l-4 border-purple-500">
                                {aiPlan.plan}
                            </p>
                            <h4 className="text-xl font-bold mt-8 mb-4">Priority Actions</h4>
                            <ul className="space-y-2">
                                {aiPlan.priority_actions.map((act: any, i: number) => (
                                    <li key={i} className="flex gap-2">
                                        <span className="font-bold text-blue-600">{i + 1}.</span>
                                        <span>{act}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <svg className="w-16 h-16 mx-auto mb-4 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                            Click generate to combine quantum sociological findings with actionable psychiatric intervention plans.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ResultsDashboard;
