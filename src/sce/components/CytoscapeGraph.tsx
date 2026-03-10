import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';

const CytoscapeGraph = ({ network, solverResult }: { network: any, solverResult: any }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const cyRef = useRef<cytoscape.Core | null>(null);

    useEffect(() => {
        if (!containerRef.current || !network) return;

        const elements: any[] = [];

        // Add Nodes
        const assignment = solverResult?.srdf_assignment || {};
        const riskScores = solverResult?.ai_risk_scores || {};

        network.nodes.forEach((n: any) => {
            const weight = assignment[n.id] ?? null;
            const risk = riskScores[n.id] ?? 0;
            let nodeClass = 'default';
            let size = 30 + (risk * 20); // Scale size slightly by risk if no betweenness available

            if (weight === 0) nodeClass = 'vulnerable';
            if (weight === 1) nodeClass = 'stable';
            if (weight === 2) { nodeClass = 'mediator'; size = 50; }

            elements.push({
                data: { id: n.id, label: n.label, risk, weight },
                classes: nodeClass,
                style: { width: size, height: size }
            });
        });

        // Add Edges
        network.edges.forEach((e: any, i: number) => {
            const isNegative = e.sign === -1;
            elements.push({
                data: { id: `e${i}`, source: e.source, target: e.target, weight: e.weight },
                classes: isNegative ? 'conflict' : 'trust'
            });
        });

        cyRef.current = cytoscape({
            container: containerRef.current,
            elements: elements,
            style: [
                {
                    selector: 'node',
                    style: {
                        'label': 'data(label)',
                        'text-valign': 'top',
                        'font-size': '10px',
                        'border-width': 2,
                        'border-color': '#fff'
                    }
                },
                {
                    selector: 'node.default',
                    style: { 'background-color': '#9ca3af' }
                },
                {
                    selector: 'node.vulnerable',
                    style: { 'background-color': '#ef4444', 'border-color': '#fca5a5', 'border-width': 4 }
                },
                {
                    selector: 'node.stable',
                    style: { 'background-color': '#3b82f6' }
                },
                {
                    selector: 'node.mediator',
                    style: { 'background-color': '#eab308', 'shape': 'star', 'border-color': '#fef08a', 'border-width': 4 }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 'mapData(weight, 0, 1, 1, 5)',
                        'curve-style': 'bezier',
                        'opacity': 0.6
                    }
                },
                {
                    selector: 'edge.trust',
                    style: { 'line-color': '#22c55e' }
                },
                {
                    selector: 'edge.conflict',
                    style: { 'line-color': '#ef4444', 'line-style': 'dashed' }
                }
            ],
            layout: {
                name: 'cose',
                idealEdgeLength: 100,
                nodeOverlap: 20,
                refresh: 20,
                fit: true,
                padding: 30,
                randomize: false,
                componentSpacing: 100,
                nodeRepulsion: 400000,
                edgeElasticity: 100,
                nestingFactor: 5,
                gravity: 80,
                numIter: 1000,
                initialTemp: 200,
                coolingFactor: 0.95,
                minTemp: 1.0
            }
        });

        return () => {
            if (cyRef.current) cyRef.current.destroy();
        };
    }, [network, solverResult]);

    return <div ref={containerRef} style={{ width: '100%', height: '500px', backgroundColor: '#f8fafc' }} />;
};

export default CytoscapeGraph;
