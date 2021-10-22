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
