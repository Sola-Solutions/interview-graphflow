import { Schemas } from '../../../shared/schemas';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export async function processNodeConnections(
  request: Schemas['ProcessNodeConnectionsRequest'],
): Promise<Schemas['ProcessNodeConnectionsResponse']> {
  const response = await fetch(`${API_BASE_URL}/graph/process-connections`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  console.log(response.json());
  return response.json();
}
