"""Application routers – flattened structure for simplicity."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Dict, List

from fastapi import APIRouter, HTTPException, status

from app.models import (
    GraphPayload,
    ProcessNodeConnectionsRequest,
    ProcessNodeConnectionsResponse,
)
from app.models import (
    Node2 as ResponseNode,
)

router = APIRouter()


@router.post("/topology", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def compute_topology(payload: GraphPayload) -> None:
    """Return a topological ordering of the graph or raise if cyclic.

    TODO
    """

    # NOTE: Implementation intentionally left blank for the candidate.
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented yet",
    )


@router.post("/process-connections", response_model=ProcessNodeConnectionsResponse)
async def process_node_connections(
    payload: ProcessNodeConnectionsRequest,
) -> ProcessNodeConnectionsResponse:
    node_connections: Dict[str, Dict[str, List[str]]] = {
        node.id: {"incoming": [], "outgoing": []} for node in payload.nodes
    }

    for edge in payload.edges:
        edge_id = edge.id or f"{edge.source}-{edge.target}"
        if edge.source in node_connections:
            node_connections[edge.source]["outgoing"].append(edge_id)
        if edge.target in node_connections:
            node_connections[edge.target]["incoming"].append(edge_id)

    response_nodes: List[ResponseNode] = []
    for node in payload.nodes:
        node_id = node.id
        connections = node_connections.get(node_id, {"incoming": [], "outgoing": []})
        connected_edges = connections["incoming"] + connections["outgoing"]
        has_connections = len(connected_edges) > 0

        is_highlighted = has_connections or (payload.selectedNodeId == node_id)

        response_nodes.append(
            ResponseNode(
                id=node_id,
                hasConnections=has_connections,
                connectedEdges=connected_edges,
                isHighlighted=is_highlighted,
            )
        )

    return ProcessNodeConnectionsResponse(
        nodes=response_nodes, processedAt=datetime.now(timezone.utc).isoformat()
    )
