import pytest
import os
import tempfile
import csv
from sce.data_ingestion import load_csv_upload, load_survey_data, generate_demo_network

def test_load_csv_upload():
    with tempfile.NamedTemporaryFile(mode='w', delete=False) as n_file:
        n_file.write("id,label,role,department,extra\n1,Alice,student,A,info1\n2,Bob,student,A,info2\n")
        n_file_name = n_file.name
        
    with tempfile.NamedTemporaryFile(mode='w', delete=False) as e_file:
        e_file.write("source,target,sign,weight,edge_type\n1,2,-1,0.5,conflict\n")
        e_file_name = e_file.name
        
    try:
        network = load_csv_upload(n_file_name, e_file_name)
        assert len(network.nodes) == 2
        assert len(network.edges) == 1
        assert network.nodes[0].metadata['extra'] == 'info1'
        assert network.edges[0].sign == -1
        assert network.edges[0].weight == 0.5
    finally:
        os.remove(n_file_name)
        os.remove(e_file_name)

def test_load_csv_invalid_sign():
    with tempfile.NamedTemporaryFile(mode='w', delete=False) as n_file:
        n_file.write("id,label,role,department\n1,A,role,dept\n2,B,role,dept\n")
        n_file_name = n_file.name
    with tempfile.NamedTemporaryFile(mode='w', delete=False) as e_file:
        e_file.write("source,target,sign,weight,edge_type\n1,2,0,0.5,conflict\n")
        e_file_name = e_file.name
    try:
        with pytest.raises(ValueError):
            load_csv_upload(n_file_name, e_file_name)
    finally:
        os.remove(n_file_name)
        os.remove(e_file_name)

def test_load_survey_data():
    survey = {
        "participants": [{"id": "P1", "name": "Alice", "role": "student"}],
        "relationships": [{"from": "P1", "to": "P2", "type": "conflict", "strength": 0.8}]
    }
    net = load_survey_data(survey)
    assert len(net.nodes) == 1
    assert len(net.edges) == 1
    assert net.edges[0].sign == -1
    
def test_generate_demo_network():
    net = generate_demo_network("classroom_conflict")
    assert len(net.nodes) == 30
    assert len(net.edges) > 0
