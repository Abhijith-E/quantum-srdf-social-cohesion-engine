import csv
import json
import networkx as nx
import os
import uuid
import datetime
from typing import Dict, Any
from sce.models import SocialNetwork, SocialNode, SocialEdge

def load_snap_dataset(dataset_name: str) -> SocialNetwork:
    # Dummy implementation, would download from SNAP in prod
    return SocialNetwork(
        id=dataset_name, name=dataset_name.capitalize(),
        description=f"SNAP dataset: {dataset_name}", context="online",
        nodes=[], edges=[], created_at=datetime.datetime.now().isoformat()
    )

def load_csv_upload(nodes_csv: str, edges_csv: str) -> SocialNetwork:
    nodes = []
    edges = []
    
    with open(nodes_csv, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            node_id = row['id']
            metadata = {k: v for k, v in row.items() if k not in ['id', 'label', 'role', 'department']}
            nodes.append(SocialNode(
                id=node_id,
                label=row.get('label', node_id),
                role=row.get('role', 'unknown'),
                department=row.get('department', 'unknown'),
                metadata=metadata
            ))
            
    with open(edges_csv, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            sign = int(row['sign'])
            weight = float(row['weight'])
            if sign not in [-1, 1]:
                raise ValueError(f"Invalid sign {sign} for edge {row['source']}->{row['target']}")
            if not 0.0 <= weight <= 1.0:
                raise ValueError(f"Invalid weight {weight} for edge {row['source']}->{row['target']}")
                
            edges.append(SocialEdge(
                source=row['source'],
                target=row['target'],
                sign=sign,
                weight=weight,
                edge_type=row.get('edge_type', 'unknown')
            ))
            
    return SocialNetwork(
        id=str(uuid.uuid4()),
        name="CSV Upload",
        description="Network imported from CSV files",
        context="unknown",
        nodes=nodes,
        edges=edges,
        created_at=datetime.datetime.now().isoformat()
    )

def load_survey_data(survey_json: Dict[str, Any]) -> SocialNetwork:
    nodes = []
    edges = []
    
    for p in survey_json.get('participants', []):
        metadata = {k: v for k, v in p.items() if k not in ['id', 'name', 'role', 'department']}
        nodes.append(SocialNode(
            id=p['id'],
            label=p.get('name', p['id']),
            role=p.get('role', 'participant'),
            department=p.get('department', 'general'),
            metadata=metadata
        ))
        
    for r in survey_json.get('relationships', []):
        rel_type = r.get('type', 'neutral')
        sign = 1 if rel_type == 'trust' else (-1 if rel_type == 'conflict' else 1)
        edges.append(SocialEdge(
            source=r['from'],
            target=r['to'],
            sign=sign,
            weight=float(r.get('strength', 1.0)),
            edge_type=rel_type
        ))
        
    return SocialNetwork(
        id=str(uuid.uuid4()),
        name="Survey Data",
        description="Network imported from survey responses",
        context="school",
        nodes=nodes,
        edges=edges,
        created_at=datetime.datetime.now().isoformat()
    )

def generate_demo_network(scenario: str) -> SocialNetwork:
    if scenario == "classroom_conflict":
        sizes = [15, 10, 5]
        probs = [[0.8, 0.05, 0.01], [0.05, 0.7, 0.01], [0.01, 0.01, 0.9]]
        G = nx.stochastic_block_model(sizes, probs, seed=42)
        
        import random
        random.seed(42)
        for u, v in list(G.edges()):
            if random.random() < 0.4:
                G[u][v]['sign'] = -1
            else:
                G[u][v]['sign'] = 1
                
        nodes = []
        for i in G.nodes():
            dept = "Group_A" if i < 15 else ("Group_B" if i < 25 else "Group_C")
            nodes.append(SocialNode(id=f"S{i}", label=f"Student {i}", role="student", department=dept))
            
        edges = []
        for u, v in G.edges():
            sign = G[u][v]['sign']
            rel_type = "conflict" if sign == -1 else "friendship"
            edges.append(SocialEdge(source=f"S{u}", target=f"S{v}", sign=sign, weight=1.0, edge_type=rel_type))
            
        return SocialNetwork(id=scenario, name="Classroom Conflict", description="30 students, 3 cliques, 40% conflict", context="school", nodes=nodes, edges=edges, created_at=datetime.datetime.now().isoformat())
    elif scenario == "workplace_tension":
        G = nx.erdos_renyi_graph(50, 0.15, seed=42)
        import random
        random.seed(42)
        nodes = [SocialNode(id=f"W{i}", label=f"Employee {i}", role="employee", department="dept") for i in range(50)]
        edges = []
        for u, v in G.edges():
            sign = -1 if random.random() < 0.3 else 1
            edges.append(SocialEdge(source=f"W{u}", target=f"W{v}", sign=sign, weight=1.0, edge_type="colleague"))
        return SocialNetwork(id=scenario, name="Workplace Tension", description="50 employees, ~300 connections", context="workplace", nodes=nodes, edges=edges, created_at=datetime.datetime.now().isoformat())
        
    elif scenario == "campus_polarization":
        G = nx.stochastic_block_model([50, 50], [[0.15, 0.02], [0.02, 0.15]], seed=42)
        import random
        random.seed(42)
        nodes = [SocialNode(id=f"C{i}", label=f"Student {i}", role="student", department="campus") for i in range(100)]
        edges = []
        for u, v in G.edges():
            # Inter-group edges are largely negative, intra-group largely positive
            is_cross = (u < 50 and v >= 50) or (u >= 50 and v < 50)
            sign = -1 if is_cross else (1 if random.random() < 0.9 else -1)
            edges.append(SocialEdge(source=f"C{u}", target=f"C{v}", sign=sign, weight=1.0, edge_type="peer"))
        return SocialNetwork(id=scenario, name="Campus Polarization", description="100 students, Highly polarized twin communities", context="school", nodes=nodes, edges=edges, created_at=datetime.datetime.now().isoformat())
        
    elif scenario == "online_community":
        G = nx.barabasi_albert_graph(200, 2, seed=42)
        import random
        random.seed(42)
        nodes = [SocialNode(id=f"O{i}", label=f"User {i}", role="user", department="forum") for i in range(200)]
        edges = []
        for u, v in G.edges():
            sign = -1 if random.random() < 0.25 else 1
            edges.append(SocialEdge(source=f"O{u}", target=f"O{v}", sign=sign, weight=1.0, edge_type="interaction"))
        return SocialNetwork(id=scenario, name="Online Community", description="200 users, Scale-Free network architecture", context="online", nodes=nodes, edges=edges, created_at=datetime.datetime.now().isoformat())
        
    return SocialNetwork(id=scenario, name=scenario, description="", context="general", nodes=[], edges=[], created_at="")
