import {
  abortLaunch,
  addNewLaunch,
  doesLaunchExists,
  getAllLaunches,
} from "../../models/launches.model.js";
import { getPagination } from "../../services/query.js";

async function httpGetAllLaunches(req, res) {
  const { page, limit } = req.query;
  const pagination = getPagination({ page, limit });
  const launches = await getAllLaunches(pagination);
  return res.status(200).json(launches);
}

async function httpAddNewLaunch(req, res) {
  console.log(req.body);
  const launch = req.body;
  const { mission, rocket, launchDate, target } = launch || {};

  if (!mission || !rocket || !launchDate || !target) {
    return res.status(400).json({
      error: "Missing required launch property",
    });
  }
  launch.launchDate = new Date(launch.launchDate);
  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: "Invalid launch date",
    });
  }
  const newLaunch = await addNewLaunch(launch);
  console.log(newLaunch, "new Launch");
  return res.status(201).json(newLaunch);
}

async function httpAbortLaunch(req, res) {
  const id = Number(req.params.id);
  if (!id)
    return res.status(400).json({
      error: "Id is missing",
    });
  try {
    const foundLaunch = await doesLaunchExists(id);
    if (!foundLaunch)
      return res.status(404).json({
        error: "No flight exists with this id",
      });
  } catch (error) {
    throw new Error("Flight Id not matching the format");
  }

  const result = await abortLaunch(id);

  if (!result) {
    return res.status(400).json({
      error: "Launch abortion failed",
    });
  }

  return res.status(200).json(result);
}

export { httpGetAllLaunches, httpAddNewLaunch, httpAbortLaunch };
