import http from "http";
import dns from "node:dns";
import { app } from "./app.js";
import { loadPlanets } from "./models/planets.model.js";
import { mongoConnect } from "./services/mongo.js";
import { loadLaunchData } from "./models/launches.model.js";

// Force Node.js to use Google public DNS servers for resolving MongoDB Atlas SRV records
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// const URI =
// ("mongodb+srv://Manvik:Manvik_09@nasacluster.9ed4vaw.mongodb.net/nasa?appName=NASACluster");
// "mongodb+srv://Manvik:Manvik_09@nasacluster.9ed4vaw.mongodb.net/nasa?retryWrites=true&w=majority";

// const client = new MongoClient(URI);

// await client.connect();

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

await mongoConnect();

await loadPlanets();

await loadLaunchData();

server.listen(PORT, () => {
  console.log("server is running on port: " + PORT);
});
