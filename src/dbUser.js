/*
* User Infractions Schema:
    case
    action
    points
    reason
    moderator
    dmSent
    date
* */
/*
* Reaction Roles Schema:
* roleID
* emojiID
* */
module.exports = (client) => {
  const reload = true;
  const { Client } = require('pg');
  const schema = require('./db-schema.json');

  client.initialize = function() {
    client.db = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });
    client.db.connect();

    client.tableList = [];
    for (let table in schema) {
      if (schema.hasOwnProperty(table)) {
        client.tableList.push(table);
        let columns = Object.keys(schema[table]);
        client[table] = new Table(table, columns[0], columns[1]);
        console.log(`Attempting to create table object for ${table}...`);
      }
    }

    if(reload) {
      client.dropDB();
      client.createDB();
    }
  };

  client.dropDB = function () {
    client.db.query(`DELETE FROM ${client.tableList.join(';DELETE FROM ')}`, (err, res) => {
      if(err) throw err;
      return res;
    })
  };

  // i know there are multiple loops, i need to loop through nested shit wtf do you expect me to do
  // noinspection FunctionWithMultipleLoopsJS
  client.createDB = function () {
    let creationQuery = "";
    for (let table in client.tableList){
      creationQuery += "CREATE TABLE" + table + "(";
      for(let column in schema[table]){
        if(schema[table].hasOwnProperty(column)){
          creationQuery += column + " " + schema[table][column] + ",";
        }
      }
      creationQuery  = creationQuery.slice(0, -1) + ");";
    }
    client.db.query(creationQuery, (err, res) => {
      if(err) throw err;
      console.log(res);
      let commands = [];
      for(let command in client.commands){
        if(client.commands.hasOwnProperty(command)) commands.push(`(${command[0]}, true)`);
      }
      commands = commands.join(", ");
      client.db.query(`INSERT INTO enabledCommands (name, enabled) VALUES ${commands}`, (err, re) => {
        if(err) throw err;
        console.log(re);
      });
    });
  };

  class Table {
    constructor(tableName, mainColumn, secondaryColumn) {
      this.name = tableName;
      this.mainColumn = mainColumn;
      this.secondaryColumn = secondaryColumn;
    }

    query(query, mainID) {
      const whereQuery = mainID ? query + ` WHERE ${this.mainColumn} IS ${mainID}` : query;
      console.log(`Running query: ${whereQuery}`);
      client.db.query(whereQuery, (err, res) => {
        if (err) throw err;
        console.log(`Query result: ${res}`);
        return res;
      })
    }

    get(mainID) {
      let res = this.query(`SELECT ${this.secondaryColumn} FROM ${this.name}`, mainID);
      if (!res || res.rows === null) return undefined;
      res = res.rows[0][this.secondaryColumn];
      console.log(res);
      const columnType = schema[this.name][this.secondaryColumn];
      if(columnType ===  "boolean") return res === "t";
      if(columnType.search("[") !== -1) return res.slice(1, -1).split(", ");
    };

    ensure(mainID, defaultValue) {
      const res = this.get(mainID);
      return res === undefined ? defaultValue : res;
    };

    set(mainID, setColumn, setValue) {
      return this.query(`UPDATE ${this.name} SET ${setColumn} = ${setValue}`, mainID);
    };

    math(mainID, operation, modifier, column) {
      return this.query(`UPDATE ${this.name} SET ${column} = ${column} ${operation} ${modifier}`, mainID);
    };

    push(mainID, newValue, column) {
      return this.query(`UPDATE ${this.name} SET ${column} = ${column}||${JSON.stringify(newValue)}`, mainID);
    };

    remove(mainID, toRemove, column) {
      return this.query(`UPDATE ${this.name} SET ${column} = array_remove(${column}, ${toRemove})`, mainID);
    };

    has(mainID) {
      return this.query(`SELECT * FROM ${this.name}`, mainID).rows === null;
    };

    delete(mainID, column) {
      if (!column) return this.query(`DELETE FROM ${this.name}`, mainID);
      return this.query(`UPDATE ${this.name} SET ${column} = null`, mainID);
    };

    setProp(mainID, column, value) {
      if (value === []) return this.query(`UPDATE ${this.name} SET ${column} = null`, mainID);
    };

    keyArray() {
      const valuePairs = this.query(`select ${this.mainColumn} from ${this.name}`);
      let keyArray = [];
      for (let row of valuePairs.rows) {
        keyArray.push(row[this.mainColumn]);
      }
      return keyArray;
    };

    count() {
      return this.query(`SELECT COUNT(${this.mainColumn} AS count FROM ${this.name}`).rows[0].count;
    }

    map(method) {
      const table = this.query(`SELECT * FROM ${this.name}`).rows;
      let result = [];
      table.forEach(row => {
        result.push(method(row[this.secondaryColumn], row[this.mainColumn]))
      });
      return result;
    };

    getProp(mainID, column) {
      return this.query(`SELECT ${column} FROM ${this.name}`, mainID).rows[0];
    };

    removeFrom(mainID, column, remove) {
      return this.remove(mainID, remove, column);
    };

    pushIn(mainID, column, newValue) {
      return this.push(mainID, newValue, column);
    };

    dec(mainID) {
      this.math(mainID, "-", "1", this.secondaryColumn);
    };

    inc(mainID) {
      this.math(mainID, "+", "1", this.secondaryColumn);
    };

    sweep(method) {
      this.keyArray().forEach((key, index) => {
        if (method(index, key)) this.delete(key);
      });
    };

    findKey(value) {
      return this.query(`SELECT ${this.mainColumn} WHERE ${this.secondaryColumn} IS ${value}`).rows[0][this.mainColumn];
    };

    add(value) {
      return this.query(`INSERT INTO ${this.name} (${this.mainColumn}, ${this.secondaryColumn}) VALUES ( DEFAULT, ${value}) RETURNING ${this.mainColumn}`);
    };

    randomKey() {
      const theWholeDamnDB = this.query(`SELECT ${this.mainColumn} FROM ${this.name}`);
      return theWholeDamnDB[Math.floor(Math.random() * theWholeDamnDB.rows.length)];
    };
  }
};