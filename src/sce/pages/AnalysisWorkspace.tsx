import useSCEStore from '../store/sceStore';
import { solveNetwork } from '../api/sceApi';
import CytoscapeGraph from '../components/CytoscapeGraph';
import SolverBadge from '../components/SolverBadge';

const AnalysisWorkspace = () => {
    const { network, solverResult, isSolving, selectedSolver,
        setSolverResult, setIsSolving, setSolveProgress } = useSCEStore();

    const handleSolve = async () => {
        if (!network) return;
        setIsSolving(true);
        setSolveProgress(25, 'Analyzing Graph Structure...');

        try {
            // Simulate real-time progress updates for UX
            setTimeout(() => setSolveProgress(50, 'Detecting Conflict Clusters...'), 1000);
            setTimeout(() => setSolveProgress(75, 'Running Solver...'), 2000);

            const result = await solveNetwork(network.id, selectedSolver);
            setSolverResult(result);
            setSolveProgress(100, 'Complete');
        } catch (e) {
            console.error(e);
            setSolveProgress(0, 'Error');
        } finally {
            setIsSolving(false);
        }
    };

    if (!network) {
        return <div className="p-8 text-center mt-20 text-xl text-gray-500">Please load a network from the Dashboard first.</div>;
    }

    return (
        <div className="flex h-screen bg-white">
            {/* LEFT PANEL */}
            <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
                <h2 className="text-2xl font-bold mb-2">{network.name}</h2>
                <p className="text-gray-500 mb-6">{network.description}</p>

                <div className="mb-8">
                    <h3 className="font-semibold mb-3">Controls</h3>
                    <button
                        onClick={handleSolve}
                        disabled={isSolving}
                        className={`w-full py-3 rounded text-white font-bold transition-colors
              ${isSolving ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {isSolving ? 'Solving...' : 'Run SCE Optimization'}
                    </button>
                </div>

                {solverResult && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h3 className="font-bold text-blue-900 mb-4 flex items-center justify-between">
                            Results <SolverBadge type={solverResult.solver_used} />
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex justify-between border-b border-blue-100 pb-2">
                                <span className="font-medium">Minimum SRDF Weight (γsR):</span>
                                <span className="font-bold">{solverResult.total_weight}</span>
                            </li>
                            <li className="flex justify-between border-b border-blue-100 pb-2 text-yellow-600">
                                <span className="font-medium">Strategic Mediators Required:</span>
                                <span className="font-bold text-lg">{solverResult.mediators.length}</span>
                            </li>
                            <li className="flex justify-between border-b border-blue-100 pb-2 text-red-600">
                                <span className="font-medium">Vulnerable Nodes:</span>
                                <span className="font-bold text-lg">{solverResult.vulnerable_nodes.length}</span>
                            </li>
                            <li className="flex justify-between pb-2">
                                <span className="font-medium">Computation Time:</span>
                                <span>{solverResult.computation_time.toFixed(2)}s</span>
                            </li>
                        </ul>
                    </div>
                )}
            </div>

            {/* RIGHT PANEL */}
            <div className="w-2/3 flex flex-col relative bg-slate-50">
                <div className="absolute top-4 right-4 z-10 bg-white/80 p-2 rounded shadow backdrop-blur text-xs text-gray-600">
                    <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1"></span> Mediator
                    <span className="inline-block w-3 h-3 rounded-full bg-red-500 ml-3 mr-1"></span> Vulnerable
                    <span className="inline-block w-3 h-3 rounded-full bg-blue-500 ml-3 mr-1"></span> Stable
                </div>
                <CytoscapeGraph network={network} solverResult={solverResult} />
            </div>
        </div>
    );
};

export default AnalysisWorkspace;
