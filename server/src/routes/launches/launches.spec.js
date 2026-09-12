import supertest from "supertest";
import { app } from "../../app.js";
import { mongoConnect, mongooseDisconnect } from "../../services/mongo.js";
const version = "/v1";
describe("launches API", () => {
  beforeAll(async () => {
    await mongoConnect();
  });

  afterAll(async () => {
    await mongooseDisconnect();
  });

  describe("Test GET /launches", () => {
    test("It should respond with 200 success", async () => {
      const response = await supertest(app)
        .get(`${version}/launches`)
        .expect("Content-Type", /json/)
        .expect(200);
    });
  });

  describe("Test POST /launches", () => {
    const completeLaunchData = {
      mission: "India Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-1410 b",
      launchDate: "24 January, 2034",
    };

    const launchDataWithoutDate = {
      mission: "India Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-1410 b",
    };
    test("It should respones with 201 success", async () => {
      const response = await supertest(app)
        .post(`${version}/launches`)
        .send(completeLaunchData)
        .expect("Content-Type", /json/)
        .expect(201);
      const responseDate = new Date(response.body.launchDate).valueOf();
      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      expect(responseDate).toBe(requestDate);
      expect(response.body).toMatchObject(launchDataWithoutDate);
    });
    test("It should catch the missing fields and respond with 400 failure", async () => {
      const response = await supertest(app)
        .post(`${version}/launches`)
        .send(launchDataWithoutDate)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Missing required launch property",
      });
    });
    test("It should catch the invalid date and respond with 400 failure", async () => {
      const response = await supertest(app)
        .post(`${version}/launches`)
        .send({ ...completeLaunchData, launchDate: "asdf" })
        .expect("Content-Type", /json/)
        .expect(400);
      expect(response.body).toStrictEqual({
        error: "Invalid launch date",
      });
    });
  });
});
