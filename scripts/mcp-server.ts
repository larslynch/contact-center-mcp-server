// scripts/mcp-server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Initialize the MCP Server
const server = new McpServer({
  name: "Bank Support API",
  version: "1.0.0"
});

const BASE_URL = "https://3ba4717d-1d4d-4f78-8374-9985c6db801b.mock.pstmn.io";

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

// Start the server via stdio
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Send logs to stderr so it doesn't interfere with the stdio JSON-RPC transport
  console.error("Bank Support MCP Server is running...");
}

main().catch(console.error);