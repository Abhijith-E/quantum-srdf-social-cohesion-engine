import networkx as nx
from typing import List, Tuple, Dict
from sce.models import SocialNetwork

def build_networkx_graph(social_network: SocialNetwork) -> nx.Graph:
    G = nx.Graph()
    for node in social_network.nodes:
        G.add_node(node.id, label=node.label, role=node.role, department=node.department, metadata=node.metadata)
    for edge in social_network.edges:
        G.add_edge(edge.source, edge.target, sign=edge.sign, weight=edge.weight, edge_type=edge.edge_type)
    return G

def detect_unbalanced_triangles(G: nx.Graph) -> List[Tuple]:
    unbalanced = []
    nodes = list(G.nodes)
    for i in range(len(nodes)):
        u = nodes[i]
        for v in G.neighbors(u):
            if v <= u:
                continue
            for w in G.neighbors(v):
                if w <= v or w <= u:
                    continue
                if G.has_edge(u, w):
                    sign_uv = G[u][v].get('sign', 1)
                    sign_vw = G[v][w].get('sign', 1)
                    sign_uw = G[u][w].get('sign', 1)
                    if sign_uv * sign_vw * sign_uw == -1:
                        unbalanced.append((u, v, w))
    return unbalanced

def detect_conflict_clusters(G: nx.Graph, threshold: float = 0.6) -> List[List[str]]:
    import community as community_louvain
    clusters = []
    if G.number_of_edges() == 0:
        return clusters
    # Fallback to single partition if louvain partition fails for small/empty graphs
    try:
        partition = community_louvain.best_partition(G)
    except Exception:
        partition = {n: 0 for n in G.nodes}
        
    communities = {}
    for node, comm_id in partition.items():
        communities.setdefault(comm_id, []).append(node)
    
    for comm_id, nodes in communities.items():
        if len(nodes) < 2:
            continue
        sub_G = G.subgraph(nodes)
        total_edges = sub_G.number_of_edges()
        if total_edges == 0:
            continue
        neg_edges = sum(1 for u, v, data in sub_G.edges(data=True) if data.get('sign', 1) == -1)
        if (neg_edges / total_edges) > threshold:
            clusters.append((nodes, neg_edges / total_edges))
    
    clusters.sort(key=lambda x: x[1], reverse=True)
    return [c[0] for c in clusters]

def compute_node_risk_scores(G: nx.Graph) -> Dict[str, float]:
    risk_scores = {}
    unbalanced_triangles = set()
    for t in detect_unbalanced_triangles(G):
        unbalanced_triangles.update(t)
    
    neg_edges = [(u, v) for u, v, d in G.edges(data=True) if d.get('sign', 1) == -1]
    neg_G = G.edge_subgraph(neg_edges).copy()
    for n in G.nodes:
        if n not in neg_G:
            neg_G.add_node(n)
    
    try:
        betweenness = nx.betweenness_centrality(neg_G)
    except Exception:
        betweenness = {}
    
    for v in G.nodes:
        degree_total = G.degree(v)
        if degree_total == 0:
            risk_scores[v] = 0.0
            continue
            
        neg_neighbors = [u for u in G.neighbors(v) if G[v][u].get('sign', 1) == -1]
        neg_degree = len(neg_neighbors)
        
        if neg_degree > 1:
            neg_sub_G = G.subgraph(neg_neighbors)
            possible_edges = (neg_degree * (neg_degree - 1)) / 2
            actual_edges = neg_sub_G.number_of_edges()
            cc_neg = actual_edges / possible_edges if possible_edges > 0 else 0.0
        else:
            cc_neg = 0.0
            
        in_unbalanced = 1 if v in unbalanced_triangles else 0
        
        alpha, beta, gamma, delta = 0.4, 0.2, 0.2, 0.2
        risk = (alpha * (neg_degree / degree_total) + 
                beta * cc_neg + 
                gamma * in_unbalanced + 
                delta * betweenness.get(v, 0.0))
        risk_scores[v] = min(1.0, max(0.0, risk))
        
    return risk_scores

def extract_volatile_subgraph(G: nx.Graph, max_nodes: int = 60) -> nx.Graph:
    clusters = detect_conflict_clusters(G, threshold=0.0)
    for cluster in clusters:
        if len(cluster) <= max_nodes and len(cluster) > 0:
            return G.subgraph(cluster).copy()
    
    risk_scores = compute_node_risk_scores(G)
    sorted_nodes = sorted(risk_scores.keys(), key=lambda x: risk_scores[x], reverse=True)
    return G.subgraph(sorted_nodes[:max_nodes]).copy()

def verify_srdf(G: nx.Graph, assignment: Dict[str, int]) -> bool:
    for v in G.nodes:
        val_v = assignment.get(v, 0)
        if val_v == 0:
            total = 0
            for u in G.neighbors(v):
                sign_vu = G[v][u].get('sign', 1)
                total += assignment.get(u, 0) * sign_vu
            if total < 1:
                return False
    return True

def compute_srdf_weight(assignment: Dict[str, int]) -> int:
    return sum(assignment.values())
