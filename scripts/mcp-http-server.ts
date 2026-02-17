import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";

const app = express();
const server = new McpServer({
  name: "Banking-HTTP-Server",
  version: "1.0.0",
});

const BASE_URL = "https://3ba4717d-1d4d-4f78-8374-9985c6db801b.mock.pstmn.io";


/* // --- Reuse your existing tools here ---
server.tool("get_human_wait_time", "Checks agent wait time", {}, async () => {
  const res = await fetch("https://3ba4717d-1d4d-4f78-8374-9985c6db801b.mock.pstmn.io/contactcenter/current-human-wait");
  return { content: [{ type: "text", text: await res.text() }] };
});
*/

// Tool 1: Customer Name
server.tool(
    "get_customer_name",
    "Get the customer's name by their document ID",
    {
      customer_document_id: z.string().describe("The customer's document ID (e.g., x1234567y)")
    },
    async ({ customer_document_id }) => {
      try {
        const url = `${BASE_URL}/account/customername?customer-document-id=${customer_document_id}`;
        const response = await fetch(url);
        const text = await response.text();
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error fetching customer name: ${error}` }] };
      }
    }
  );
  
  // Tool 2: Human Wait Time
  server.tool(
    "get_human_wait_time",
    "Get the current human agent wait time in the contact center",
    {}, // No arguments needed
    async () => {
      try {
        const url = `${BASE_URL}/contactcenter/current-human-wait`;
        const response = await fetch(url);
        const text = await response.text();
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error fetching wait time: ${error}` }] };
      }
    }
  );
  
  // Tool 3: Transaction Search
  server.tool(
    "search_transactions",
    "Search for transactions using a natural language query",
    {
      query: z.string().describe("Natural language search query (e.g., '3 or four euros near the end of may')")
    },
    async ({ query }) => {
      try {
        // encodeURIComponent ensures spaces and special characters map properly to the URL
        const url = `${BASE_URL}/card/transactionsearch?query=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        const text = await response.text();
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error searching transactions: ${error}` }] };
      }
    }
  );
  
  // Tool 4: Transaction Detail
  server.tool(
    "get_transaction_detail",
    "Get detailed information for a specific transaction ID",
    {
      transactionid: z.string().describe("The exact transaction ID (e.g., 74512345678901234567890)")
    },
    async ({ transactionid }) => {
      try {
        const url = `${BASE_URL}/card/transactiondetail?transactionid=${transactionid}`;
        const response = await fetch(url);
        const text = await response.text();
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error fetching transaction details: ${error}` }] };
      }
    }
  );

// Store active transports to route messages correctly
const transports: Record<string, SSEServerTransport> = {};

// 1. The SSE Endpoint (Establish Connection)
app.get("/sse", async (req, res) => {
  console.log("New SSE connection established");
  
  // Create a transport that knows how to send messages back via this response
  const transport = new SSEServerTransport("/messages", res);
  
  // Store it by its unique session ID
  transports[transport.sessionId] = transport;

  // Cleanup when client disconnects
  res.on("close", () => {
    delete transports[transport.sessionId];
  });

  await server.connect(transport);
});

// 2. The Messages Endpoint (Receive Commands)
app.post("/messages", express.json(), async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports[sessionId];

  if (!transport) {
    res.status(400).send("Unknown session ID");
    return;
  }

  // Pass the incoming message to the transport handler
  await transport.handlePostMessage(req, res);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`MCP HTTP Server running at http://localhost:${PORT}/sse`);
});