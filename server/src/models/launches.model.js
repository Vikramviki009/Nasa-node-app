import axios from "axios";
import launchesDatabase from "./launches.mongo.js";
import planetsMongo from "./planets.mongo.js";

const getLatestFlightNumber = async () => {
  const latestLaunch = await launchesDatabase.findOne().sort("-flightNumber");
  return latestLaunch?.flightNumber || 0;
};

async function addNewLaunch(launch) {
  const planet = await planetsMongo.findOne({
    kepler_name: launch.target,
  });

  if (!planet) throw new Error("No matching planet found");
  const latestFlightNumber = await getLatestFlightNumber();

  await saveLaunch({
    ...launch,
    flightNumber: latestFlightNumber + 1,
    customers: ["ZTM", "Vikram"],
    upcoming: true,
    success: true,
  });
  return launch;
}

async function saveLaunch(launch) {
  // try {

  await launchesDatabase.updateOne(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    },
  );
  // } catch (error) {

  //   console.error(`Error saving the launch ${error}`);
  // }
}

async function getAllLaunches({ skip, limit, searchQuery } = {}) {
  return await launchesDatabase
    .find({}, { _id: 0, __v: 0 })
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

const LAUNCH_API_LIBRARY_ENDPOINT = "https://ll.thespacedevs.com";

async function populateLaunches() {
  console.log("Loading launches data");
  const response = await axios.get(
    LAUNCH_API_LIBRARY_ENDPOINT + "/2.3.0/launches",
    {
      params: {
        limit: 100,
        offset: 100,
      },
    },
  );
  console.log(response?.status, "response");
  if (response?.status !== 200) throw new Error("Launch data download failed");

  const launchDocs = response.data.results;

  for (const launchDoc of launchDocs) {
    const latestFlightNumber = await getLatestFlightNumber();
    // const {
    //   mission,
    //   customers,
    //   rocket,
    //   launchDate,
    //   success,
    //   target,
    //   upcoming,
    // } = launchDoc;
    const launch = {
      mission: launchDoc?.mission?.name || launchDoc?.name,
      rocket: launchDoc.rocket.configuration.name,
      launchDate: launchDoc.last_updated,
      // target: launchDoc.mission.orbit.name,
      flightNumber: latestFlightNumber + 1,
      customers: launchDoc?.pad?.agencies?.flatMap((launch) => launch?.abbrev),
      upcoming: launchDoc.status.abbrev === "Success",
      success: launchDoc.status.abbrev === "Success",
    };
    // const launch = {
    //   mission,
    //   rocket,
    //   launchDate,
    //   target,
    //   flightNumber: latestFlightNumber + 1,
    //   customers,
    //   upcoming,
    //   success,
    // };
    console.log(launch, "launchObj");
    await saveLaunch(launch);
  }
}

async function loadLaunchData() {
  const foundLaunchDoc = await findLaunch({
    mission: "Sputnik 1",
    launchDate: "2024-03-17T19:17:35Z",
    rocket: "Sputnik 8K74PS",
  });
  // console.log(foundLaunchtDoc, "found launch doc");
  if (foundLaunchDoc) return;
  await populateLaunches();
}

async function findLaunch(filter) {
  return await launchesDatabase.findOne(filter);
}

async function doesLaunchExists(id) {
  return await findLaunch({
    flightNumber: id,
  });
}

async function abortLaunch(id) {
  const aborted = await launchesDatabase.updateOne(
    {
      flightNumber: id,
    },
    { upcoming: false, success: false },
  );

  // return aborted.ok === 1 && aborted.nModified === 1
  return aborted.matchedCount === 1 && aborted?.modifiedCount === 1;
}

export {
  getAllLaunches,
  addNewLaunch,
  doesLaunchExists,
  abortLaunch,
  loadLaunchData,
};
