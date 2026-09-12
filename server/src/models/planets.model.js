import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline } from "node:stream/promises";
import { parse } from "csv-parse";
import planets from "./planets.mongo.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const habitablePlanets = [];

function isHabitablePlanet(planet) {
  const insol = Number(planet.koi_insol);
  const prad = Number(planet.koi_prad);

  return (
    planet.koi_disposition === "CONFIRMED" &&
    insol > 0.36 &&
    insol < 1.11 &&
    prad < 1.6
  );
}

async function loadPlanets() {
  const csvFilePath = path.join(
    __dirname,
    "..",
    "..",
    "data",
    "kepler_data.csv",
  );
  try {
    await pipeline(
      fs.createReadStream(csvFilePath),
      parse({
        comment: "#",
        columns: true,
      }),
      async function* (source) {
        for await (const record of source) {
          // TODO: Replace below create with insert + update operation
          if (isHabitablePlanet(record)) savePlanet(record);
        }
      },
    );
    // console.log(`${habitablePlanets.length} planets found suitable for living`);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// const csvFilePath = path.join(
//   import.meta.dirname,
//   "..",
//   "..",
//   "data",
//   "kepler_data.csv",
// );

// try {
//   await pipeline(
//     fs.createReadStream(csvFilePath),
//     parse({
//       comment: "#",
//       columns: true,
//     }),
//     async function* (source) {
//       for await (const record of source) {
//         if (isHabitablePlanet(record)) {
//           habitablePlanets.push(record);
//         }
//       }
//     },
//   );

//   console.log(`${habitablePlanets.length} habitable planets found!`);
// } catch (err) {
//   console.error("Error loading planets CSV data:", err);
//   throw err;
// }
// }

async function getAllPlanets() {
  return await planets.find();
}

async function savePlanet(data) {
  try {
    await planets.updateOne(
      {
        kepler_name: data.kepler_name,
      },
      {
        kepler_name: data.kepler_name,
      },
      {
        upsert: true,
      },
    );
  } catch (error) {
    console.error(`Could not save the planets, ${err}`);
  }
}
export { getAllPlanets, loadPlanets };
