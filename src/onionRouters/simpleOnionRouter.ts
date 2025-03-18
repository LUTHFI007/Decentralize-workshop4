import bodyParser from "body-parser";
import express from "express";
import { BASE_ONION_ROUTER_PORT } from "../config";
import crypto from "crypto";
import axios from "axios";

let privateKey: string | null = null;
let publicKey: string | null = null;

// Helper function to generate public/private key pair
function generateKeyPair() {
  const { publicKey: pubKey, privateKey: privKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });
  privateKey = privKey;
  publicKey = pubKey;
}

export async function simpleOnionRouter(nodeId: number) {
  generateKeyPair();

  if (!publicKey) {
    console.error("Failed to generate public key.");
    return;
  }

  // Register the node on the registry
  try {
    await axios.post(`http://localhost:8080/registerNode`, {
      nodeId,
      pubKey: publicKey,
    });
    console.log(`Node ${nodeId} registered successfully on the registry.`);
  } catch (error) {
    console.error(`Failed to register node ${nodeId} on the registry:`, error);
  }

  const onionRouter = express();
  onionRouter.use(express.json());
  onionRouter.use(bodyParser.json());

  let lastReceivedEncryptedMessage: string | null = null;
  let lastReceivedDecryptedMessage: string | null = null;
  let lastMessageDestination: number | null = null;

  //TODO implement the status route
  onionRouter.get("/status", (req, res) => {
    res.send("live");
  });

  // GET route to retrieve the last received encrypted message
  onionRouter.get("/getLastReceivedEncryptedMessage", (req, res) => {
    res.json({ result: lastReceivedEncryptedMessage });
  });

  // GET route to retrieve the last received decrypted message
  onionRouter.get("/getLastReceivedDecryptedMessage", (req, res) => {
    res.json({ result: lastReceivedDecryptedMessage });
  });

  // GET route to retrieve the last message destination
  onionRouter.get("/getLastMessageDestination", (req, res) => {
    res.json({ result: lastMessageDestination });
  });

  // GET route to retrieve the private key (for testing purposes only)
  onionRouter.get("/getPrivateKey", (req, res) => {
    if (privateKey) {
      const base64PrivateKey = Buffer.isBuffer(privateKey)
        ? privateKey.toString("base64")
        : privateKey; // If privateKey is already a string, no need for conversion
      res.json({ result: base64PrivateKey });
    } else {
      res.status(404).json({ error: "Private key not found" });
    }
  });

  const server = onionRouter.listen(BASE_ONION_ROUTER_PORT + nodeId, () => {
    console.log(
      `Onion router ${nodeId} is listening on port ${
        BASE_ONION_ROUTER_PORT + nodeId
      }`
    );
  });

  return server;
}
