import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';

const db = new JsonDB(new Config('data', true, false, '/'));

export function getConfiguration(): Configuration {
  try {
    return db.getData("/configuration");
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