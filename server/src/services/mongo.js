import "dotenv/config";
import mongoose from "mongoose";
import dns from "node:dns";
import crypto from "node:crypto";

// dotenv.config();

// 1. Expose Node's native crypto module globally for Jest sandbox environment
if (!globalThis.crypto) {
  globalThis.crypto = crypto;
}
// Configure DNS for both the server and test environments
// dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const URI = process.env.MONGO_DB_URL;

mongoose.connection.once("open", () => {
  console.log("MongoDB connection is ready");
});

mongoose.connection.on("error", (e) => console.error(e));

const mongoConnect = async () => {
  await mongoose.connect(URI);
};

const mongooseDisconnect = async () => {
  await mongoose.disconnect();
};

export { mongoConnect, mongooseDisconnect };
