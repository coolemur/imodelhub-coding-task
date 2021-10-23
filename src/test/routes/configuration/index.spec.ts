import request from "supertest";
import { expect } from "chai";

import createServer from "server";
const app = createServer();
const api = request(app);

async function preserveConfig(): Promise<Configuration> {
  const response = await api
    .get("/configuration")
    .set('client-id', '1')
    .expect(200);

  const configuration = response.body;

  if (!configuration) {
    throw new Error("Configuration not found");
  }

  return configuration;
}

async function restoreConfig(configuration: Configuration) {
  return api.post("/configuration")
    .send(configuration)
    .set('client-id', '1').expect(200);
}

describe("configuration routes", function () {

  it("/configuration GET responds with 200 and has properties: routes, clients", async function () {
    return api.get("/configuration").set('client-id', '1').expect(200).then((res) => {
      expect(res.body).to.have.property("routes");
      expect(res.body).to.have.property("clients");
    });
  });

  it("/configuration GET returns configuration and POST responds with 200", async function () {
    const response = await api
      .get("/configuration")
      .set('client-id', '1')
      .expect(200);

    const configuration = response.body;

    if (configuration) {
      return api.post("/configuration")
        .send(configuration)
        .set('client-id', '1').expect(200);
    }

    throw new Error("Configuration is not defined.");
  });

  it("/configuration GET responds with 400 when client-id is not provided", async function () {
    return api.get("/configuration").expect(400);
  });

  it("/configuration POST responds with 400 when client-id is not provided", async function () {
    return api.post("/configuration").expect(400);
  });

  // sourcePath cannot start with /configuration nor /configure
  it("/configuration POST responds with 400 when sourcePath is set to /configuration or /configure", async function () {
    const configuration = await preserveConfig();
    await api.post("/configuration")
      .send({
        "routes": [
          {
            "sourcePath": "/configuration",
            "destinationUrl": "https://example.com/items"
          }],
        "clients": [
          {
            "clientId": "1111",
            "limit": 0
          }
        ]
      })
      .set('client-id', '1')
      .expect(400);

    await api.post("/configuration")
      .send({
        "routes": [
          {
            "sourcePath": "/configure",
            "destinationUrl": "https://example.com/items"
          }],
        "clients": [
          {
            "clientId": "1111",
            "limit": 0
          }
        ]
      })
      .set('client-id', '1')
      .expect(400);
    return restoreConfig(configuration)
  });

  it("/configuration POST responds with 400 when clientId is not provided", async function () {
    const configuration = await preserveConfig();
    await api.post("/configuration")
      .send({
        "routes": [
          {
            "sourcePath": "/items",
            "destinationUrl": "https://example.com/items"
          }],
        "clients": [
          {
            "limit": 3,
            "seconds": 10
          }
        ]
      })
      .set('client-id', '1')
      .expect(400);
    return restoreConfig(configuration)
  });

  it("/configuration POST responds with 200 when limit or seconds is not provided (limit or seconds defaults to 1 in this case)", async function () {
    const configuration = await preserveConfig();
    await api.post("/configuration")
      .send({
        "routes": [
          {
            "sourcePath": "/items",
            "destinationUrl": "https://example.com/items"
          }],
        "clients": [
          {
            "clientId": "1111"
          }
        ]
      })
      .set('client-id', '1')
      .expect(200)
      .expect((res) => {
        const configuration = res.body;

        if (!configuration) {
          throw new Error("Configuration is not defined."); // this should never happen
        }

        expect(configuration.clients[0].limit).to.equal(1);
        expect(configuration.clients[0].seconds).to.equal(1);
      });

    return restoreConfig(configuration)
  });

  it("/configuration GET responds with 403 when client-id is provided, but doesn't match any admin id", async function () {
    return api.get("/configuration").set('client-id', '1234').expect(403);
  });

  it("/configuration POST responds with 403 when client-id is provided, but doesn't match any admin id", async function () {
    return api.post("/configuration").set('client-id', '1234').expect(403);
  });
});
