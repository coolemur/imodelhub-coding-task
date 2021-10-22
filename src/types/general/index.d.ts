interface Route {
  sourcePath: string;
  destinationUrl: string;
}

interface Client {
  clientId: string;
  limit: number;
  seconds: number;
}

interface ConfigurationInput {
  routes: Array<Route>;
  clients: Array<Client>;
}