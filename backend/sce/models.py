from dataclasses import dataclass, field
from typing import List, Optional, Tuple, Dict, Any

@dataclass
class SocialNode:
    id: str
    label: str
    role: str
    department: str
    metadata: Dict[str, Any] = field(default_factory=dict)
    srdf_weight: Optional[int] = None
    risk_score: Optional[float] = None
    is_mediator: bool = False

@dataclass
class SocialEdge:
    source: str
    target: str
    sign: int
    weight: float
    edge_type: str
    timestamp: Optional[str] = None

@dataclass
class SolverResult:
    srdf_assignment: Dict[str, int]
    total_weight: int
    mediators: List[str]
    vulnerable_nodes: List[str]
    stable_nodes: List[str]
    unbalanced_triangles: List[Tuple[str, str, str]]
    conflict_clusters: List[List[str]]
    solver_used: str
    computation_time: float
    quantum_circuit_depth: Optional[int] = None
    ai_risk_scores: Dict[str, float] = field(default_factory=dict)

@dataclass
class SocialNetwork:
    id: str
    name: str
    description: str
    context: str
    nodes: List[SocialNode]
    edges: List[SocialEdge]
    created_at: str
    solver_result: Optional[SolverResult] = None
