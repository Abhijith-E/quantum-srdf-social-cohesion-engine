
import { Card, CardContent } from '../components/DashboardCards';

const NetworkStatsCard = ({ nodesCount, edgesCount, negRatio }: { nodesCount: number, edgesCount: number, negRatio: number }) => (
    <Card>
        <CardContent>
            <h3 className="text-lg font-bold">Network Stats</h3>
            <div className="flex justify-between mt-2">
                <span>Nodes: {nodesCount}</span>
                <span>Edges: {edgesCount}</span>
                <span className="text-red-500">Conflict: {(negRatio * 100).toFixed(1)}%</span>
            </div>
        </CardContent>
    </Card>
);

export default NetworkStatsCard;
