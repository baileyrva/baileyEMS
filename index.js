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
  inquirer
    .prompt([
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

    .then(function(res) {
      console.log("You chose ${res.action} a ${res.option}");

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
    .catch(function(err) {
      console.log(err);
    });
}

//creating the data
function createData(option) {
  switch (option) {
    case "Employee":
      connection.query("SELECT * FROM roles", function(err, res) {
        if (err) throw err;
        const roles = res.map(object => {
          return {
            name: object.role_title,
            value: object.r_id
          };
        });
        roles.push("N/A");

        connection.query("SELECT * FROM employee", function(err, res) {
          if (err) throw err;
          const employees = res.map(object => {
            return {
              name: "${object.first_name} ${object.last_name}",
              value: object.e_id
            };
          });
          employees.unshift({
            name: "no manager",
            value: null
          });

          //asking for user input
          inquirer
            .prompt([
              {
                name: "first_name",
                type: "input",
                message: "What's the employee's first name?"
              },
              {
                name: "last_name",
                type: "input",
                message: "What's the employee's last name?"
              },
              {
                name: "role",
                type: "list",
                message: "What's the employee's position?",
                choices: roles
              },
              {
                name: "manager",
                type: "list",
                message: "Who is the employee's manager?",
                choices: employees
              }
            ])
            .then(function(res) {
              if (res.role === "N/A") {
                genRolePrompt();
              } else {
                console.log(
                  "Inserting ${res.first_name} ${res.last_name} as a new employee...\n"
                );
                console.log(res.manager);
                connection.query(
                  "INSERT INTO employee SET ?",
                  {
                    first_name: res.first_name,
                    last_name: res.last_name,
                    role_id: res.role,
                    manager_id: res.manager
                  },
                  function(err, res) {
                    if (err) throw err;
                    console.log(res.affectedRows + " employee added!\n");
                    continuePrompt();
                  }
                );
              }
            })
            .catch(function(err) {
              console.log(err);
            });
        });
      });
      break;

    case "Role":
      connection.query("SELECT * FROM department", function(err, res) {
        if (err) throw err;

        const departments = res.map(object => {
          return {
            name: object.departmentName,
            value: object.d_id
          };
        });
        departments.push("N/A");

        inquirer.prompt([{
            name: "title", 
            type: "input", 
            message: "What is the title of the new role?", 
        }, 
        {
            name: "salary",
            type: "number", 
            message: "What is the salary of the new role?",
        },
        {
            name: "department", 
            type: "list", 
            message: "What is the employee's department?",
            choices: departments
        }
        ])
      });
  }
}
