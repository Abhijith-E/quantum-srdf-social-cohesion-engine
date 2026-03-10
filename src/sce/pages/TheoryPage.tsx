
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const TheoryPage = () => {
    return (
        <div className="max-w-4xl mx-auto p-8 bg-white min-h-screen">
            <h1 className="text-4xl font-extrabold mb-8 text-blue-900 border-b pb-4">Methodology & Theory</h1>

            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">1. Signed Roman Domination Function (SRDF)</h2>
                <p className="mb-4 text-gray-700 leading-relaxed">
                    In social psychology, signed graphs <InlineMath math="G = (V, E, \sigma)" /> model trust (<InlineMath math="+1" />) and conflict (<InlineMath math="-1" />) relationships.
                    The SRDF extends classical domination to identify <strong>Strategic Mediators</strong>. A valid SRDF <InlineMath math="f: V \to \{0, 1, 2\}" /> must satisfy:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg my-6 border border-gray-200 overflow-x-auto text-center">
                    <BlockMath math="\forall v \in V, \quad \sum_{u \in N[v]} f(u) \cdot \sigma(u,v) \ge 1" />
                </div>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li><strong>Weight 0 (Vulnerable):</strong> Individuals susceptible to conflict pressure who need protection.</li>
                    <li><strong>Weight 1 (Stable):</strong> Self-sufficient individuals who maintain their own emotional balance.</li>
                    <li><strong>Weight 2 (Mediator):</strong> Leaders with sufficient positive social capital to neutralize antagonism targeting others.</li>
                </ul>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">2. Heider's Structural Balance Theory</h2>
                <p className="mb-4 text-gray-700 leading-relaxed">
                    A fundamental concept in social networks where relationships tend toward stability. A triangle <InlineMath math="(u, v, w)" /> is considered balanced if the product of its signs is positive:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg my-6 border border-gray-200 overflow-x-auto text-center">
                    <BlockMath math="\sigma(u,v) \cdot \sigma(v,w) \cdot \sigma(u,w) = +1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded border border-green-200">
                        <h4 className="font-bold text-green-800">Balanced States (+)</h4>
                        <p className="text-sm mt-2">+++ (All friends)<br />+-- (Enemy of my enemy is my friend)</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded border border-red-200">
                        <h4 className="font-bold text-red-800">Frustrated States (-)</h4>
                        <p className="text-sm mt-2">++- (Two friends share an enemy)<br />--- (All enemies - highly combustible)</p>
                    </div>
                </div>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">3. Variational Quantum Eigensolver (QUBO Map)</h2>
                <p className="mb-4 text-gray-700 leading-relaxed">
                    To solve this NP-Hard configuration natively on IBM Q processors, we map the minimum SRDF problem to a Quadratic Unconstrained Binary Optimization (QUBO) hamiltonian space:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg my-6 border border-gray-200 overflow-x-auto text-center">
                    <BlockMath math="H = \sum_v (q_{v,0} + q_{v,1}) + \lambda \sum_{v \in Violations} P_v" />
                </div>
                <p className="text-gray-700 leading-relaxed">
                    We use Qiskit's TwoLocal parameterized ansatz. <InlineMath math="q_{v,0}" /> and <InlineMath math="q_{v,1}" /> are binary states encoding the ternary values <InlineMath math="\{0, 1, 2\}" />.
                </p>
            </section>
        </div>
    );
};

export default TheoryPage;
