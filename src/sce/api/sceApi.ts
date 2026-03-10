const API_BASE = '/api/sce';

export const uploadCSV = async (nodesFile: any, edgesFile: any) => {
    const formData = new FormData();
    formData.append('nodes', nodesFile);
    formData.append('edges', edgesFile);
    const res = await fetch(`${API_BASE}/network/upload-csv`, { method: 'POST', body: formData });
    return await res.json();
};

export const loadDemoNetwork = async (scenario: string) => {
    const res = await fetch(`${API_BASE}/network/demo/${scenario}`);
    return await res.json();
};

export const solveNetwork = async (networkId: string, solver: string) => {
    const res = await fetch(`${API_BASE}/solve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ network_id: networkId, solver })
    });
    return await res.json();
};

export const generateInterventionPlan = async (networkId: string) => {
    const res = await fetch(`${API_BASE}/ai/intervention-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ network_id: networkId })
    });
    return await res.json();
};
