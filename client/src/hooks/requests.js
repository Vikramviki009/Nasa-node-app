const url = "http://localhost:5000/v1";

async function httpGetPlanets() {
  const response = await fetch(`${url}/planets`);
  const jsonData = await response.json();
  console.log(jsonData);
  return jsonData;
  // TODO: Once API is ready.
  // Load planets and return as JSON.
}

async function httpGetLaunches() {
  const response = await fetch(`${url}/launches`);
  const data = await response.json();
  return data;
  // TODO: Once API is ready.
  // Load launches, sort by flight number, and return as JSON.
}

async function httpSubmitLaunch(launch) {
  try {
    return await fetch(`${url}/launches`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...launch, destination: launch.target }),
    });
  } catch (error) {
    return {
      ok: false,
    };
  }

  // TODO: Once API is ready.
  // Submit given launch data to launch system.
}

async function httpAbortLaunch(id) {
  if (!id) return;
  try {
    return await fetch(`${url}/launches/${id}`, {
      method: "delete",
    });
  } catch (error) {
    return {
      ok: false,
    };
  }
  // TODO: Once API is ready.
  // Delete launch with given ID.
}

export { httpGetPlanets, httpGetLaunches, httpSubmitLaunch, httpAbortLaunch };
