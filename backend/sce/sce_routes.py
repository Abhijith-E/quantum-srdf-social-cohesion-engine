from flask import Blueprint, request, jsonify
from sce.data_ingestion import load_csv_upload, load_survey_data, load_snap_dataset, generate_demo_network
from sce.orchestrator import run_social_cohesion_analysis
from dataclasses import asdict
import json

sce_bp = Blueprint('sce', __name__)

@sce_bp.route('/network/upload-csv', methods=['POST'])
def upload_csv():
    # In a real implementation this processes multipart form data
    return jsonify({"network_id": "temp_csv", "preview": {}})

@sce_bp.route('/network/upload-survey', methods=['POST'])
def upload_survey():
    data = request.json
    try:
        net = load_survey_data(data)
        return jsonify({"network_id": net.id, "preview": {"node_count": len(net.nodes), "edge_count": len(net.edges)}})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@sce_bp.route('/network/demo/<scenario>', methods=['GET'])
def get_demo(scenario):
    net = generate_demo_network(scenario)
    return jsonify(asdict(net))

@sce_bp.route('/network/snap/<dataset_name>', methods=['POST'])
def get_snap(dataset_name):
    return jsonify({"network_id": dataset_name, "status": "loading"})

@sce_bp.route('/solve', methods=['POST'])
def solve_network():
    data = request.json
    solver = data.get('solver', 'auto')
    scenario = data.get('network_id', 'classroom_conflict')
    net = generate_demo_network(scenario)
    result = run_social_cohesion_analysis(net, solver)
    return jsonify(asdict(result))

@sce_bp.route('/result/<network_id>', methods=['GET'])
def get_result(network_id):
    return jsonify({"status": "cached", "result": None})

@sce_bp.route('/analyze/balance', methods=['POST'])
def analyze_balance():
    return jsonify({"unbalanced_triangles": [], "balance_index": 100, "conflict_clusters": []})

@sce_bp.route('/ai/intervention-plan', methods=['POST'])
def intervention_plan():
    return jsonify({
        "plan": "Systemic restructuring and active listening mediation recommended.",
        "priority_actions": ["Hold townhall", "Identify key influencers"]
    })
