import { expect } from "chai";
import { api, preserveConfig, restoreConfig } from '../helpers';

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

  // ---
  // Bonus: CRUD for clients and routes
  // ---

  // GET clients
  it("/configuration/clients GET responds with 200 and has property clientId", async function () {
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
      .expect(200);

    await api.get("/configuration/clients")
      .set('client-id', '1')
      .expect(200).then((res) => {
        const clients = res.body;
        expect(clients[0]).to.have.property("clientId");
      });

    return restoreConfig(configuration)
  });

  // GET routes
  it("/configuration/routes GET responds with 200 and has properties sourcePath and destinationUrl", async function () {
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
      .expect(200);

    await api.get("/configuration/routes")
      .set('client-id', '1')
      .expect(200).then((res) => {
        const routes = res.body;
        expect(routes[0]).to.have.property("sourcePath");
        expect(routes[0]).to.have.property("destinationUrl");
      }
      );

    return restoreConfig(configuration)
  });


  // POST client
  it("/configuration/clients POST responds with 200 and has property clientId", async function () {
    const configuration = await preserveConfig();

    await api.post("/configuration/clients")
      .send({
        "clientId": "2222",
        "limit": 3,
        "seconds": 10
      })
      .set('client-id', '1')
      .expect(200).then((res) => {
        const client = res.body;
        expect(client).to.have.property("clientId");
      });


    return restoreConfig(configuration)
  });

  // POST route
  it("/configuration/routes POST responds with 200 and has properties sourcePath and destinationUrl", async function () {
    const configuration = await preserveConfig();

    await api.post("/configuration/routes")
      .send({
        "sourcePath": "/items_new",
        "destinationUrl": "https://example.com/items_new"
      })
      .set('client-id', '1')
      .expect(200).then((res) => {
        const route = res.body;
        expect(route).to.have.property("sourcePath");
        expect(route).to.have.property("destinationUrl");
      });

    return restoreConfig(configuration)
  });

  // UPDATE client
  it("/configuration/clients/:clientId PUT responds with 200 and has property clientId", async function () {
    const configuration = await preserveConfig();

    await api.post("/configuration/clients")
      .send({
        "clientId": "2222",
        "limit": 3,
        "seconds": 10
      })
      .set('client-id', '1')
      .expect(200);

    await api.put("/configuration/clients/2222")
      .send({
        "limit": 5,
        "seconds": 20
      })
      .set('client-id', '1')
      .expect(200).then((res) => {
        const client = res.body;
        expect(client).to.have.property("clientId");
      });

    return restoreConfig(configuration)
  });

  // UPDATE route
  it("/configuration/routes/:sourcePath PUT responds with 200 and has properties sourcePath and destinationUrl", async function () {
    const configuration = await preserveConfig();

    await api.post("/configuration/routes")
      .send({
        "sourcePath": "/items_new",
        "destinationUrl": "https://example.com/items_new"
      })
      .set('client-id', '1')
      .expect(200).then((res) => {
        const route = res.body;
        expect(route).to.have.property("sourcePath");
        expect(route).to.have.property("destinationUrl");
      });

    await api.put("/configuration/routes/items_new")
      .send({
        "sourcePath": "/items_new",
        "destinationUrl": "https://example.com/items_new_updated"
      })
      .set('client-id', '1')
      .expect(200).then((res) => {
        const route = res.body;
        expect(route).to.have.property("sourcePath");
        expect(route).to.have.property("destinationUrl");
      });

    return restoreConfig(configuration)
  });

  // DELETE client
  it("/configuration/clients/:clientId DELETE responds with 200 and has property clientId", async function () {
    const configuration = await preserveConfig();

    await api.post("/configuration/clients")
      .send({
        "clientId": "2222",
        "limit": 3,
        "seconds": 10
      })
      .set('client-id', '1')
      .expect(200);

    await api.delete("/configuration/clients/2222")
      .set('client-id', '1')
      .expect(200).then((res) => {
        const client = res.body;
        expect(client).to.have.property("clientId");
      });

    return restoreConfig(configuration)
  });

  // DELETE route
  it("/configuration/routes/:sourcePath DELETE responds with 200 and has properties sourcePath and destinationUrl", async function () {
    const configuration = await preserveConfig();

    await api.post("/configuration/routes")
      .send({
        "sourcePath": "/items_new",
        "destinationUrl": "https://example.com/items_new"
      })
      .set('client-id', '1')
      .expect(200).then((res) => {
        const route = res.body;
        expect(route).to.have.property("sourcePath");
        expect(route).to.have.property("destinationUrl");
      }
      );

    await api.delete("/configuration/routes/items_new")
      .set('client-id', '1')
      .expect(200).then((res) => {
        const route = res.body;
        expect(route).to.have.property("sourcePath");
        expect(route).to.have.property("destinationUrl");
      }
      );

    return restoreConfig(configuration)
  });
});
