import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';

const db = new JsonDB(new Config('data', true, false, '/'));

export function getConfiguration(): Configuration | undefined {
  try {
    const configuration = db.getData("/configuration");

    if (configuration.routes.some((route: Route) => route.sourcePath.includes('configuration') || route.sourcePath.includes('configure'))) {
      return undefined;
    }

    return configuration;
  } catch (error: any) {
    if (error.message.includes("Can't find dataPath")) { // this should never happen if data is set up correctly
      db.push("/configuration", {});
      return db.getData("/configuration");
    }

    return db.getData("/configuration");
  };
}

export function setConfiguration(configuration: Configuration): void {
  db.push('/configuration', configuration);
}

export function getAdmins(): Array<string> {
  try {
    return db.getData("/admins");
  } catch (error: any) {
    if (error.message.includes("Can't find dataPath")) { // this should never happen if data is set up correctly
      db.push("/admins", ["1"]);
      return db.getData("/admins");
    }

    return db.getData("/admins");
  };
}