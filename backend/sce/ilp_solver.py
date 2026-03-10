import time
import pulp
import networkx as nx
from typing import Dict, List, Tuple
from sce.models import SolverResult
from sce.graph_analyzer import detect_unbalanced_triangles, detect_conflict_clusters

def solve_ilp(G: nx.Graph) -> SolverResult:
    start_time = time.time()
    
    # Initialize the problem
    prob = pulp.LpProblem("Minimum_SRDF", pulp.LpMinimize)
    
    # Create variables
    a_vars = {}
    b_vars = {}
    for v in G.nodes:
        a_vars[v] = pulp.LpVariable(f"a_{v}", cat="Binary")
        b_vars[v] = pulp.LpVariable(f"b_{v}", cat="Binary")
        
    # Objective function
    prob += pulp.lpSum(a_vars[v] + b_vars[v] for v in G.nodes), "Total_Weight"
    
    # Constraint 1: Domination
    for v in G.nodes:
        neighbors_sum = []
        for u in G.neighbors(v):
            sign_vu = G[v][u].get('sign', 1)
            neighbors_sum.append((a_vars[u] + b_vars[u]) * sign_vu)
            
        prob += pulp.lpSum(neighbors_sum) >= 1 - 2 * (a_vars[v] + b_vars[v]), f"Domination_{v}"
        
    # Constraint 3: Mediator Sufficiency for unbalanced triangles
    unbalanced_triangles = detect_unbalanced_triangles(G)
    for i, (u, v, w) in enumerate(unbalanced_triangles):
        prob += (a_vars[u] + b_vars[u] + 
                 a_vars[v] + b_vars[v] + 
                 a_vars[w] + b_vars[w]) >= 2, f"MedSufficiency_{i}"
                 
    # Solve the problem
    solver = pulp.PULP_CBC_CMD(timeLimit=30, msg=False)
    prob.solve(solver)
    
    computation_time = time.time() - start_time
    
    # Extract results
    assignment = {}
    total_weight = 0
    mediators = []
    vulnerable_nodes = []
    stable_nodes = []
    
    # Need to handle when problem is infeasible, though SRDF f(v)=2 for all v is always valid
    for v in G.nodes:
        val = int(pulp.value(a_vars[v]) or 0) + int(pulp.value(b_vars[v]) or 0)
        assignment[str(v)] = val
        total_weight += val
        if val == 2:
            mediators.append(str(v))
        elif val == 1:
            stable_nodes.append(str(v))
        else:
            vulnerable_nodes.append(str(v))
            
    conflict_clusters = detect_conflict_clusters(G)
            
    return SolverResult(
        srdf_assignment=assignment,
        total_weight=total_weight,
        mediators=mediators,
        vulnerable_nodes=vulnerable_nodes,
        stable_nodes=stable_nodes,
        unbalanced_triangles=unbalanced_triangles,
        conflict_clusters=conflict_clusters,
        solver_used="ILP",
        computation_time=computation_time
    )
