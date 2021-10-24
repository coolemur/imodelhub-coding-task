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

describe("clients routes", function () {
  it("/users GET responds with 302", async function () {
    const configuration = await preserveConfig();
    await api.get("/users").set('client-id', '1234').expect(302);
    return restoreConfig(configuration)
  });

  it("/users GET responds with 400 when client-id is not provided", async function () {
    return api.get("/users").expect(400);
  });

  it("/users POST responds with 400 when client-id is not provided", async function () {
    return api.post("/users").expect(400);
  });

  /* "
  Given configuration:
  {
  "routes": [
      {
        "sourcePath": "/items",
        "destinationUrl": "https://example.com/items"
  } ],
    "clientIds": [
      {
        "clientId": "1111",
  "limit": 0 }
  ] }

  When the client-id header contains 1111 then status code 429 should always be returned as the limit is always reached and for all other clients will get the 403 status code.
  " */

  it("/items GET responds with 429 when client requests limit is set to 0, other clients gets 403", async function () {
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
            "clientId": "1111",
            "limit": 0
          }
        ]
      })
      .set('client-id', '1').expect(200);

    await api
      .get("/items")
      .set('client-id', '1111')
      .expect(429);

    await api
      .get("/items")
      .set('client-id', '9999')
      .expect(403);

    return restoreConfig(configuration);
  });

  /* "
  POST /configuration HTTP/1.1
  {
  "routes":[ {
        "sourcePath": "/items",
        "destinationUrl": "https://example.com/items"
      }
    ],
    "clients":[
      {
        "clientId": "1234",
        "limit": 1000,
        "seconds": 10
      }
  ] }
  This payload will configure the API Gateway so that it will:
  ▪ configure /items requests to be routed to https://example.com/items 
  ▪ limit the client with client-id = 1234 to 1000 requests per 10 seconds
  ▪ all other clients will get the 403 status code
  " 
  
  To test this, we will decrease the limit to 2 and then make the requests.  
  
  At the time we are writing this test, https://example.com/items is returning status code 404 (inspected in Network tab), but showing the content of website. Therefore, we will be using the following test to test the limit (checking 404 status instead of 200).
  */

  it("/items GET responds with 429 if the limit is reached", async function () {
    const configuration = await preserveConfig();

    await api.post("/configuration")
      .send({
        "routes": [{
          "sourcePath": "/items",
          "destinationUrl": "https://example.com/items"
        }
        ],
        "clients": [
          {
            "clientId": "1234",
            "limit": 2,
            "seconds": 10
          }
        ]
      })
      .set('client-id', '1').expect(200);

    await api
      .get("/items")
      .set('client-id', '1234')
      .expect(404);

    await api
      .get("/items")
      .set('client-id', '1234')
      .expect(404);

    await api
      .get("/items")
      .set('client-id', '1234')
      .expect(429);


    return restoreConfig(configuration);
  });

  // Same as "/items GET responds with 429 if the limit is reached" test, but with a different API that returns 200.
  it("/users GET responds with 429 if the limit is reached", async function () {
    const configuration = await preserveConfig();

    await api.post("/configuration")
      .send({
        "routes": [{
          "sourcePath": "/users",
          "destinationUrl": "https://reqres.in/api/users"
        }
        ],
        "clients": [
          {
            "clientId": "1234",
            "limit": 2,
            "seconds": 10
          }
        ]
      })
      .set('client-id', '1').expect(200);

    await api
      .get("/users")
      .set('client-id', '1234')
      .expect(302);

    await api
      .get("/users")
      .set('client-id', '1234')
      .expect(302);

    await api
      .get("/users")
      .set('client-id', '1234')
      .expect(429);


    return restoreConfig(configuration);
  });

  it("/items GET responds with 403 when client-id is provided in header, but doesn't mach any clients", async function () {
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
            "clientId": "1111",
          }
        ]
      })
      .set('client-id', '1').expect(200);

    await api
      .get("/items")
      .set('client-id', '9999')
      .expect(403);

    return restoreConfig(configuration);
  });

  it("/items POST responds with 403 when client-id is provided in header, but doesn't mach any clients", async function () {
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
            "clientId": "1111",
          }
        ]
      })
      .set('client-id', '1').expect(200);

    await api
      .post("/items")
      .set('client-id', '9999')
      .expect(403);

    return restoreConfig(configuration);
  });

  // if matched sourcePath then set location in the header to destinationUrl from matching entry in the configuration and return the 302 status code
  it("/items GET and POST responds with 302 and sets location header to the destinationUrl", async function () {
    const configuration = await preserveConfig();

    await api.post("/configuration")
      .send({
        "routes": [{
          "sourcePath": "/users",
          "destinationUrl": "https://reqres.in/api/users"
        }
        ],
        "clients": [
          {
            "clientId": "1234",
            "limit": 2,
            "seconds": 10
          }
        ]
      })
      .set('client-id', '1').expect(200);

    await api
      .get("/users")
      .set('client-id', '1234')
      .expect(302)
      .expect((res) => {
        expect(res.header.location).to.equal("https://reqres.in/api/users");
        expect(res.status).to.equal(302);
      });

    await api
      .post("/users")
      .set('client-id', '1234')
      .expect(302)
      .expect((res) => {
        expect(res.header.location).to.equal("https://reqres.in/api/users");
        expect(res.status).to.equal(302);
      });

    return restoreConfig(configuration);
  });


  it("GET or POST returns 404 if no matching sourcePath is found", async function () {
    const configuration = await preserveConfig();

    await api.post("/configuration")
      .send({
        "routes": [{
          "sourcePath": "/users",
          "destinationUrl": "https://reqres.in/api/users"
        }
        ],
        "clients": [
          {
            "clientId": "1234",
            "limit": 2,
            "seconds": 10
          }
        ]
      })
      .set('client-id', '1').expect(200);

    await api
      .get("/items")
      .set('client-id', '1234')
      .expect(404);

    await api
      .post("/items")
      .set('client-id', '1234')
      .expect(404);

    return restoreConfig(configuration);
  });

  it("GET calls increment request count", async function () {
    const configuration = await preserveConfig();

    await api.post("/configuration")
      .send({
        "routes": [{
          "sourcePath": "/users",
          "destinationUrl": "https://reqres.in/api/users"
        }
        ],
        "clients": [
          {
            "clientId": "1234",
            "limit": 2,
            "seconds": 10
          }
        ]
      })
      .set('client-id', '1').expect(200);

    await api
      .get("/users")
      .set('client-id', '1234')
      .expect(302);

    await api
      .get("/users")
      .set('client-id', '1234')
      .expect(302);

    await api
      .get("/configuration")
      .set('client-id', '1')
      .expect(200)
      .expect((res) => {
        const configuration = res.body;
        expect(configuration.clients[0].requests).to.equal(2);
      });

    return restoreConfig(configuration);
  });

  it("POST calls increment request count", async function () {
    const configuration = await preserveConfig();

    await api.post("/configuration")
      .send({
        "routes": [{
          "sourcePath": "/users",
          "destinationUrl": "https://reqres.in/api/users"
        }
        ],
        "clients": [
          {
            "clientId": "1234",
            "limit": 2,
            "seconds": 10
          }
        ]
      })
      .set('client-id', '1').expect(200);

    await api
      .post("/users")
      .set('client-id', '1234')
      .expect(302);

    await api
      .post("/users")
      .set('client-id', '1234')
      .expect(302);

    await api
      .get("/configuration")
      .set('client-id', '1')
      .expect(200)
      .expect((res) => {
        const configuration = res.body;
        expect(configuration.clients[0].requests).to.equal(2);
      });

    return restoreConfig(configuration);
  });

});