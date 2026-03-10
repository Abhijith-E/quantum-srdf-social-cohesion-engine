import os
import torch
import torch.nn as nn
from torch_geometric.nn import SAGEConv
from torch_geometric.data import Data
import networkx as nx
from typing import Dict
from sce.graph_analyzer import detect_unbalanced_triangles, detect_conflict_clusters, compute_node_risk_scores

class SocialRiskGNN(nn.Module):
    def __init__(self):
        super(SocialRiskGNN, self).__init__()
        self.conv1 = SAGEConv(8, 32, aggr='mean')
        self.conv2 = SAGEConv(32, 16, aggr='mean')
        self.linear = nn.Linear(16, 1)
        
    def forward(self, x, edge_index):
        x = torch.relu(self.conv1(x, edge_index))
        x = torch.relu(self.conv2(x, edge_index))
        x = torch.sigmoid(self.linear(x))
        return x

def extract_node_features(G: nx.Graph) -> torch.Tensor:
    unbalanced_triangles = set()
    for t in detect_unbalanced_triangles(G):
        unbalanced_triangles.update(t)
        
    conflict_clusters = detect_conflict_clusters(G)
    conflict_nodes = set()
    for c in conflict_clusters:
        conflict_nodes.update(c)
        
    neg_edges = [(u, v) for u, v, d in G.edges(data=True) if d.get('sign', 1) == -1]
    neg_G = G.edge_subgraph(neg_edges).copy()
    for n in G.nodes:
        if n not in neg_G:
            neg_G.add_node(n)
            
    try:
        betweenness = nx.betweenness_centrality(neg_G)
    except Exception:
        betweenness = {}
        
    features = []
    # Assumes node order aligns with G.nodes list consistently, typically G.nodes() is stable in networkx >= 3
    nodes = list(G.nodes)
    for v in nodes:
        deg_tot = G.degree(v)
        deg_neg = sum(1 for u in G.neighbors(v) if G[v][u].get('sign', 1) == -1)
        deg_pos = deg_tot - deg_neg
        neg_ratio = deg_neg / deg_tot if deg_tot > 0 else 0.0
        
        # CC among negative neighbors
        neg_neighbors = [u for u in G.neighbors(v) if G[v][u].get('sign', 1) == -1]
        if len(neg_neighbors) > 1:
            neg_sub_G = G.subgraph(neg_neighbors)
            possible = (len(neg_neighbors) * (len(neg_neighbors) - 1)) / 2
            cc_neg = neg_sub_G.number_of_edges() / possible if possible > 0 else 0.0
        else:
            cc_neg = 0.0
            
        bc = betweenness.get(v, 0.0)
        in_unbalanced = 1.0 if v in unbalanced_triangles else 0.0
        in_conflict = 1.0 if v in conflict_nodes else 0.0
        
        features.append([
            float(deg_tot), float(deg_pos), float(deg_neg), float(neg_ratio),
            float(cc_neg), float(bc), float(in_unbalanced), float(in_conflict)
        ])
        
    return torch.tensor(features, dtype=torch.float)

def predict_risk_scores(G: nx.Graph) -> Dict[str, float]:
    model = SocialRiskGNN()
    weights_path = os.environ.get('SCE_GNN_WEIGHTS_PATH', 'backend/sce/pretrained/social_risk_gnn.pt')
    
    if os.path.exists(weights_path):
        try:
            model.load_state_dict(torch.load(weights_path, map_location=torch.device('cpu')))
            model.eval()
            
            x = extract_node_features(G)
            
            nodes = list(G.nodes)
            node_idx = {n: i for i, n in enumerate(nodes)}
            edge_index = []
            for u, v in G.edges:
                edge_index.append([node_idx[u], node_idx[v]])
                edge_index.append([node_idx[v], node_idx[u]])
            
            if len(edge_index) > 0:
                edge_index = torch.tensor(edge_index, dtype=torch.long).t().contiguous()
            else:
                edge_index = torch.empty((2, 0), dtype=torch.long)
                
            with torch.no_grad():
                out = model(x, edge_index).squeeze().tolist()
                
            if isinstance(out, float):
                out = [out]
                
            return {str(nodes[i]): score for i, score in enumerate(out)}
        except Exception as e:
            print(f"Error running GNN: {e}, falling back to heuristic")
    else:
        print(f"No pretrained GNN found at {weights_path}, falling back to heuristic")
        
    # Fallback to pure heuristic
    return compute_node_risk_scores(G)

def generate_synthetic_and_train():
    # Helper to generate synthetic and train placeholder model
    # (In a script ran during deploy)
    pass
