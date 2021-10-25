# @coolemur/rate-limiter-api

## Getting Started

Run in development mode:

```shell
npm run dev
```

Run tests:

```shell
npm run test
```

Build:

```shell
npm run build
```

Start built application -> located in /dist:

```shell
npm run start
```

## API Reference

[Request examples](requests.http)

### Get existing configuration which is stored in json file

```http
  GET /configuration
```

### Set new configuration to the json file

```http
  POST /configuration
```

### Call the API with the given configuration. Requests are routed to configured destination URLs.

```http
  GET /:path
  POST /:path
```

--- 

Notes:

- We are squashing github commits to make the repo more manageable and easier to work with.

- We use json file to persist api data.

- Tests should not change the state of the data. That's why we are restoring the state of the data after each test that modifies it. **In real world application, we wouldn't do that. Or we would ensure this is non-production environment.** Also, testing should be done with unaltered data. So if you'll play around with the data, you'll get unexpected results. :]

- We're also resetting the state of the data after each client call in tests. This is because rate counter and last call time are stored in the data.

- Guess, there is a typo in requirements example requests. In one example **clients** array is present in the POST body. In the other example it is not and we have **clientIds** instead. Correcting it to clients, because it must be the same as in the other example.

- At the time of coding this project, given example https://example.com/items is not working. It displays content, but returns 404 in Network tab. Therefore we will be using https://reqres.in/ API for testing (or checking 404 status while using https://example.com/items in our tests).

- Guess, there is another typo in requirements. At one point it says "sourcePath cannot start with /configure". At other point given example says "POST /configuration HTTP/1.1". Preventing both.