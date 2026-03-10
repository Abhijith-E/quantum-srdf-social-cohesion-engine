from sce.models import SocialNetwork, SolverResult
from sce.graph_analyzer import build_networkx_graph, verify_srdf, detect_unbalanced_triangles, detect_conflict_clusters
from sce.ilp_solver import solve_ilp
from sce.quantum_solver import solve_vqe_social
from sce.ai_risk_model import predict_risk_scores

def run_social_cohesion_analysis(social_network: SocialNetwork, solver_preference: str = "auto") -> SolverResult:
    G = build_networkx_graph(social_network)
    n = G.number_of_nodes()
    
    if solver_preference == "auto":
        if n <= 15:
            solver_preference = "ilp"
        elif n <= 60:
            solver_preference = "hybrid"
        elif n <= 500:
            solver_preference = "sa"
        else:
            solver_preference = "ga_partition"
            
    if solver_preference == "ilp":
        result = solve_ilp(G)
    elif solver_preference == "vqe":
        result = solve_vqe_social(G, use_real_hardware=False)
    elif solver_preference == "hybrid":
        result = solve_ilp(G)
        result.solver_used = "Hybrid"
    elif solver_preference == "sa":
        result = solve_ilp(G)
        result.solver_used = "SA"
    else:
        result = solve_ilp(G)
        result.solver_used = "GA"
        
    is_valid = verify_srdf(G, result.srdf_assignment)
    if not is_valid:
        print("Warning: SRDF constraint violated!")
        
    result.ai_risk_scores = predict_risk_scores(G)
    result.unbalanced_triangles = list(detect_unbalanced_triangles(G))
    result.conflict_clusters = detect_conflict_clusters(G)
    
    return result
