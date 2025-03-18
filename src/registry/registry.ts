import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { REGISTRY_PORT } from "../config";

export type Node = { nodeId: number; pubKey: string };

let registeredNodes: Node[] = [];

export type RegisterNodeBody = {
  nodeId: number;
  pubKey: string;
};

export type GetNodeRegistryBody = {
  nodes: Node[];
};

export async function launchRegistry() {
  const _registry = express();
  _registry.use(express.json());
  _registry.use(bodyParser.json());

  // TODO implement the status route
  _registry.get("/status", (req, res) => {
    res.send("live");
  });

  // POST route for nodes to register themselves
  _registry.post("/registerNode", (req: Request, res: Response) => {
    const { nodeId, pubKey }: RegisterNodeBody = req.body;

    // Register the node by adding it to the list
    registeredNodes.push({ nodeId, pubKey });

    console.log(`Node ${nodeId} registered with public key: ${pubKey}`);

    res.status(200).json({ message: "Node registered successfully" });
  });

  // GET route to retrieve all registered nodes
  _registry.get("/getNodeRegistry", (req: Request, res: Response) => {
    res.json({ nodes: registeredNodes });
  });

  const server = _registry.listen(REGISTRY_PORT, () => {
    console.log(`registry is listening on port ${REGISTRY_PORT}`);
  });

  return server;
}
