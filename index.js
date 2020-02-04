const inquirer = require("inquirer");
const mysql = require("mysql");

//mysql connection to database
let connection = mysql.createConnection({
  host: "localhost",

  port: 3000,

  //database information for
  user: "root",

  password: "Smojoe12!",
  database: "ems_db"
});

connection.connect(function(err) {
  if (err) throw err;
  startApp();
});

function startApp() {
  inquirer.prompt([
    {
      name: "action",
      type: "list",
      message: "Select one of the following:",
      choices: ["Add", "View", "Update", "Delete"]
    },
    {}
  ]);
}
