
import { Routes, Route, Outlet } from 'react-router-dom';

// Pages
import SCEDashboard from './pages/SCEDashboard';
import UploadWizard from './pages/UploadWizard';
import AnalysisWorkspace from './pages/AnalysisWorkspace';
import ResultsDashboard from './pages/ResultsDashboard';
import TheoryPage from './pages/TheoryPage';

// Import custom styles
import './styles/sce.css';

const SCELayout = () => {
    return (
        <div className="sce-module font-sans">
            <nav className="bg-blue-900 text-white p-4 shadow-md flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="font-bold text-xl tracking-tight">Q-SRDF | <span className="text-blue-300">Social Cohesion</span></div>
                </div>
                <div className="flex gap-6 text-sm font-semibold">
                    <a href="/sce" className="hover:text-blue-200 transition-colors">Dashboard</a>
                    <a href="/sce/upload" className="hover:text-blue-200 transition-colors">Import Network</a>
                    <a href="/sce/results" className="hover:text-blue-200 transition-colors">Results</a>
                    <a href="/sce/theory" className="hover:text-blue-200 transition-colors">Methodology</a>
                    <a href="/" className="ml-4 px-3 py-1 bg-white/20 rounded hover:bg-white/30 transition-colors">Back to Core</a>
                </div>
            </nav>
            {/* We use an Outlet so we can nest routes inside this layout seamlessly */}
            <Outlet />
        </div>
    );
};

export const SCERoutes = () => (
    <Routes>
        <Route path="/" element={<SCELayout />}>
            <Route index element={<SCEDashboard />} />
            <Route path="upload" element={<UploadWizard />} />
            <Route path="analyze" element={<AnalysisWorkspace />} />
            <Route path="results" element={<ResultsDashboard />} />
            <Route path="theory" element={<TheoryPage />} />
        </Route>
    </Routes>
);

export default SCERoutes;
