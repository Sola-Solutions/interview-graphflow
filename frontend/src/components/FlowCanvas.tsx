import React, { useCallback, useState } from 'react';
import ReactFlow, {
  Background,
  Connection,
  Controls,
  MiniMap,
  Node,
  Edge,
  ReactFlowProvider,
  addEdge,
  updateEdge,
  Position,
  useNodesState,
  useEdgesState,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { processNodeConnections } from '../api/client';
import { Schemas } from '../../../shared/schemas';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

function FlowCanvas(): JSX.Element {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  const onEdgeUpdate = useCallback(
    (oldEdge: Edge, newConnection: Connection) =>
      setEdges((eds) => updateEdge(oldEdge, newConnection, eds)),
    [setEdges],
  );

  const addNode = useCallback(() => {
    const id = `${nodes.length + 1}`;
    const position = { x: 50 + Math.random() * 200, y: 50 + Math.random() * 200 };

    const newNode: Node = {
      id,
      position,
      data: { label: `Node ${id}` },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };

    setNodes((nds) => nds.concat(newNode));
  }, [nodes, setNodes]);

  const processConnections = useCallback(async () => {
    setIsProcessing(true);
    try {
      const request: Schemas['ProcessNodeConnectionsRequest'] = {
        nodes: nodes.map((node) => ({
          id: node.id,
          position: node.position,
          data: node.data,
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
        })),
        selectedNodeId: selectedNodeId || undefined,
      };

      const response = await processNodeConnections(request);

      setNodes((nds) =>
        nds.map((node) => {
          const responseNode = response.nodes.find((n) => n.id === node.id);
          if (responseNode) {
            return {
              ...node,
              style: {
                ...node.style,
                backgroundColor: responseNode.isHighlighted ? '#ffcc00' : '#fff',
                border: responseNode.hasConnections ? '2px solid #333' : '1px solid #ddd',
              },
              data: {
                ...node.data,
                hasConnections: responseNode.hasConnections,
                connectedEdges: responseNode.connectedEdges,
              },
            };
          }
          return node;
        }),
      );

      console.log('Processed at:', response.processedAt);
    } catch (error) {
      console.error('Error processing connections:', error);
      alert('Failed to process connections. Make sure the backend is running.');
    } finally {
      setIsProcessing(false);
    }
  }, [nodes, edges, selectedNodeId, setNodes]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  return (
    <ReactFlowProvider>
      <ReactFlow
        style={{ width: '100%', height: '100vh' }}
        nodes={nodes}
        edges={edges}
        onConnect={onConnect}
        onEdgeUpdate={onEdgeUpdate}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        edgesUpdatable
        nodesDraggable
      >
        <Panel position="top-left">
          <button onClick={addNode}>Add Node</button>
          <button
            onClick={processConnections}
            disabled={isProcessing}
            style={{ marginLeft: '10px' }}
          >
            {isProcessing ? 'Processing...' : 'Process Connections'}
          </button>
          {selectedNodeId && (
            <span style={{ marginLeft: '10px', color: '#666' }}>
              Selected: Node {selectedNodeId}
            </span>
          )}
        </Panel>
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </ReactFlowProvider>
  );
}

export default FlowCanvas;
