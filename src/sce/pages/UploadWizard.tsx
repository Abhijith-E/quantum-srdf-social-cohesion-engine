import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSCEStore from '../store/sceStore';
import { uploadCSV } from '../api/sceApi';

const UploadWizard = () => {
    const [method, setMethod] = useState('csv');
    const [nodesFile, setNodesFile] = useState<File | null>(null);
    const [edgesFile, setEdgesFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const { setNetwork } = useSCEStore();
    const navigate = useNavigate();

    const handleUpload = async () => {
        if (!nodesFile || !edgesFile) return;
        setUploading(true);
        try {
            const result = await uploadCSV(nodesFile, edgesFile);
            setNetwork(result);
            console.log('Upload success, network loaded:', result);
            navigate('/sce/analyze');
        } catch (e) {
            console.error('Upload failed', e);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 mt-12 bg-white rounded-xl shadow border border-gray-100">
            <h2 className="text-3xl font-extrabold mb-8 text-gray-800">Upload Network Data</h2>

            <div className="flex gap-4 mb-8">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={method === 'csv'} onChange={() => setMethod('csv')} />
                    <span className="font-semibold text-gray-700">CSV Files</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-gray-400">
                    <input type="radio" disabled />
                    <span>Survey JSON (Coming Soon)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-gray-400">
                    <input type="radio" disabled />
                    <span>SNAP Dataset (Coming Soon)</span>
                </label>
            </div>

            {method === 'csv' && (
                <div className="space-y-6">
                    <div className="border border-dashed border-blue-400 p-8 text-center rounded bg-blue-50/50">
                        <h3 className="font-bold text-blue-900 mb-2">Upload nodes.csv</h3>
                        <p className="text-sm text-gray-500 mb-4 text-center">Required columns: `id`. Optional: `label`, `role`, `department`</p>
                        <input type="file" onChange={(e: any) => setNodesFile(e.target.files ? e.target.files[0] : null)} />
                    </div>

                    <div className="border border-dashed border-red-400 p-8 text-center rounded bg-red-50/50">
                        <h3 className="font-bold text-red-900 mb-2">Upload edges.csv</h3>
                        <p className="text-sm text-gray-500 mb-4 text-center">Required columns: `source`, `target`, `sign` (-1 or 1), `weight` (0-1)</p>
                        <input type="file" onChange={(e: any) => setEdgesFile(e.target.files ? e.target.files[0] : null)} />
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={uploading || !nodesFile || !edgesFile}
                        className={`w-full py-4 rounded text-white font-bold text-lg transition-colors
              ${(uploading || !nodesFile || !edgesFile) ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-md'}`}
                    >
                        {uploading ? 'Processing Graph...' : 'Analyze Network Structure'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default UploadWizard;
