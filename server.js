import { jsonRpc } from "@modelcontextprotocol/sdk";
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3000 });

console.log("MCP Server running on ws://localhost:3000");

// Define your tools
const tools = {
  hello: async ({ name }) => {
    return { message: `Hello, ${name}!` };
  }
};

// Handle incoming connections
wss.on("connection", ws => {
  console.log("Client connected.");

  ws.on("message", async message => {
    const request = JSON.parse(message);

    // Handle tool invocation
    if (request.method === "callTool") {
      const toolName = request.params.name;
      const args = request.params.arguments;

      if (!tools[toolName]) {
        ws.send(JSON.stringify({
          id: request.id,
          error: `Tool '${toolName}' not found`
        }));
        return;
      }

      const result = await tools[toolName](args);

      ws.send(JSON.stringify({
        jsonrpc: "2.0",
        id: request.id,
        result
      }));
    }
  });
});
