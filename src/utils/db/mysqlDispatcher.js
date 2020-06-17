import mysql2 from "mysql2";
import queries from "./queries";

export default class MysqlDispatcher {
  constructor(config) {
    this.config = config;
    this.connection = null;
  }
  async init(stream) {
    await new Promise((resolve, reject) => {
      this.connection = mysql2.createConnection({
        host: this.config.databasehost,
        user: this.config.user,
        password: this.config.password,
        database: this.config.databasename,
        stream: stream
      });
      resolve();
    });
  }
  async disconnect() {
    try {
      this.connection.end();
    } catch (err) {
      throw err;
    }
  }
  async doQuery(queryName, ...params) {
    return await new Promise((resolve, reject) => {
      this.connection.query(queries[queryName], params, (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    });
  }
}