import pytest
import networkx as nx
from sce.graph_analyzer import detect_unbalanced_triangles, verify_srdf, detect_conflict_clusters, compute_srdf_weight

def test_detect_unbalanced_triangles():
    G = nx.Graph()
    G.add_edge('A', 'B', sign=1)
    G.add_edge('B', 'C', sign=1)
    G.add_edge('A', 'C', sign=-1)
    unbalanced = detect_unbalanced_triangles(G)
    assert len(unbalanced) == 1
    assert set(unbalanced[0]) == {'A', 'B', 'C'}

def test_verify_srdf_valid():
    G = nx.Graph()
    G.add_edge('V1', 'M1', sign=1)
    G.add_edge('V2', 'M1', sign=1)
    assignment = {'V1': 0, 'V2': 0, 'M1': 2}
    assert verify_srdf(G, assignment) is True

def test_verify_srdf_invalid():
    G = nx.Graph()
    G.add_edge('V1', 'A1', sign=-1)
    G.add_edge('V1', 'M1', sign=1)
    assignment = {'V1': 0, 'A1': 1, 'M1': 1}
    assert verify_srdf(G, assignment) is False

def test_detect_conflict_clusters():
    G = nx.Graph()
    G.add_edge('A', 'B', sign=-1)
    G.add_edge('B', 'C', sign=-1)
    G.add_edge('C', 'A', sign=-1)
    clusters = detect_conflict_clusters(G, threshold=0.5)
    assert len(clusters) > 0
    assert 'A' in clusters[0]

def test_compute_srdf_weight():
    assignment = {'V1': 0, 'V2': 1, 'M1': 2}
    assert compute_srdf_weight(assignment) == 3
