import pytest
import tempfile
from flask import Flask
from sce.sce_routes import sce_bp

@pytest.fixture
def client():
    app = Flask(__name__)
    app.register_blueprint(sce_bp, url_prefix='/api/sce')
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_api_demo_network(client):
    rv = client.get('/api/sce/network/demo/classroom_conflict')
    assert rv.status_code == 200
    data = rv.get_json()
    assert data['id'] == 'classroom_conflict'

def test_api_solve_network(client):
    rv = client.post('/api/sce/solve', json={'network_id': 'classroom_conflict', 'solver': 'ilp'})
    assert rv.status_code == 200
    data = rv.get_json()
    assert 'total_weight' in data
    assert 'mediators' in data

def test_api_intervention_plan(client):
    rv = client.post('/api/sce/ai/intervention-plan', json={'network_id': 'classroom_conflict'})
    assert rv.status_code == 200
    data = rv.get_json()
    assert 'plan' in data
    assert len(data['priority_actions']) > 0
