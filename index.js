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
      message: "Select one of the following: ",
      choices: ["Add", "View", "Update", "Delete"]
    },
    {
        name: "options",
        type: "list", 
        message: "select from the options below: ",
        choices: ["Employee", "Role", "Department"]
    }
  ])
  // switch statement after choice 

  .then(function (res) {
      console.log('You chose ${res.action} a ${res.option}');

      switch (res.action) {
          case "Add":
              createData(res.option);
              break; 
          case "View":
              readData(res.option);
              break;
          case "Update": 
              updateData(res.option); 
              break;  
          case "Delete":
              deleteData(res.option); 
              break; 
      }
  })
  .catch(function (err) {
      console.log(err); 
  });
};
