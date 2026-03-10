import pytest
import networkx as nx
from sce.ilp_solver import solve_ilp

def test_solve_ilp_p4():
    # P4 graph: 1 - 2 - 3 - 4
    # All positive edges
    G = nx.Graph()
    G.add_edges_from([(1,2), (2,3), (3,4)])
    nx.set_edge_attributes(G, 1, 'sign')
    
    result = solve_ilp(G)
    assert result.total_weight == 2

def test_solve_ilp_c5_mixed_signs():
    # C5: 0-1-2-3-4-0
    G = nx.cycle_graph(5)
    nx.set_edge_attributes(G, 1, 'sign')
    G[0][1]['sign'] = -1
    
    result = solve_ilp(G)
    assert result.total_weight >= 2
    
def test_constraints_satisfied():
    G = nx.Graph()
    G.add_edges_from([(1,2), (2,3), (3,1)])
    G[1][2]['sign'] = -1
    G[2][3]['sign'] = -1
    G[3][1]['sign'] = -1
    # unbalanced triangle with all negative edges
    
    result = solve_ilp(G)
    # mediator sufficiency says f(1)+f(2)+f(3) >= 2
    assert result.total_weight >= 2
