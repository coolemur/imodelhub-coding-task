interface Route {
  sourcePath: string;
  destinationUrl: string;
}

interface Client {
  requests?: number;
  lastRequest?: number;
  clientId: string;
  limit?: number;
  seconds?: number;
}

interface Configuration {
  routes: Array<Route>;
  clients: Array<Client>;
}