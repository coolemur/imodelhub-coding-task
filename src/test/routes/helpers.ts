import request from "supertest";
import createServer from "server";
const app = createServer();
export const api = request(app);

export async function preserveConfig(): Promise<Configuration> {
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

export async function restoreConfig(configuration: Configuration) {
  return api.post("/configuration")
    .send(configuration)
    .set('client-id', '1').expect(200);
}