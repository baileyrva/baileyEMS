const inquirer = require("inquirer");
const mysql = require("mysql");

let PORT = process.env.PORT || 8080;

//mysql connection to database
let connection = mysql.createConnection({
  host: "localhost",

  port: 3306,

  //database information for
  user: "root",

  password: "Smojoe12!",
  database: "ems_db"
});

connection.connect(function(err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }
  console.log("connected as id " + connection.threadId);
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
        name: "option",
        type: "list",
        message: "select from the options below: ",
        choices: ["Employee", "Role", "Department"]
      }
    ])
    // switch statement after choice

    .then(function(res) {
      console.log(`You chose ${res.action} a ${res.option}`);

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
            value: object.id
          };
        });
        roles.push("N/A");

        connection.query("SELECT * FROM employee", function(err, res) {
          if (err) throw err;
          const employees = res.map(object => {
            return {
              name: `${object.first_name} ${object.last_name}`,
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
                  `Inserting ${res.first_name} ${res.last_name} as a new employee...\n`
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

    //role statement
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

        inquirer
          .prompt([
            {
              name: "title",
              type: "input",
              message: "What is the title of the new role?"
            },
            {
              name: "salary",
              type: "number",
              message: "What is the salary of the new role?"
            },
            {
              name: "department",
              type: "list",
              message: "What is the employee's department?",
              choices: departments
            }
          ])
          .then(function(res) {
            if (res.department === "N/A") {
              genDepartmentPrompt();
            } else {
              console.log("Inserting a new role...m");
              connection.query(
                "INSERT INTO roles SET ?",
                {
                  role_title: res.title,
                  salary: res.salary,
                  department_id: res.department
                },
                function(err, res) {
                  if (err) throw err;
                  console.log(res.affectedRows + " Role inserted!\n");
                  continuePrompt();
                }
              );
            }
          })
          .catch(function(err) {
            console.log(err);
          });
      });
      break;

    //create department
    case "Department":
      inquirer
        .prompt([
          {
            name: "departmentname",
            type: "input",
            message: "What is the name of the new Department?"
          }
        ])
        .then(function(res) {
          console.log("Inserting a new Department...\n");
          connection.query(
            "INSERT INTO department SET ?",
            {
              departmentName: res.departmentname
            },
            function(err, res) {
              if (err) throw err;
              console.log(res.affectedRows + " Department inserted\n");
              continuePrompt();
            }
          );
        })
        .catch(function(err) {
          console.log(err);
        });
      break;
  }
}

//reading the data function

function readData(res) {
  switch (res) {
    case "Employee":
      console.log("Selecting all employees...\n");
      connection.query("SELECT * FROM employee INNER JOIN roles ON employee.e_id = roles.id", function(err, res) {
        if (err) throw err;
        console.table(res);
        continuePrompt();
      });
      break;
    case "Role":
      console.log("Selecting all roles...\n");
      connection.query("SELECT * FROM roles", function(err, res) {
        if (err) throw err;
        console.table(res);
        continuePrompt();
      });
      break;
    case "Department":
      console.log("Selecting all departments...\n");
      connection.query("SELECT * FROM department", function(err, res) {
        if (err) throw err;
        console.table(res);
        continuePrompt();
      });
      break;
  }
}

//updating the data function

function updateData(option) {
  switch (option) {
    case "Employee":
      connection.query("SELECT * FROM employee", function(err, res) {
        if (err) throw err;
        const employees = res.map(object => {
          return {
            name: `${object.first_name} ${object.last_name}`,
            value: object.e_id
          };
        });
        connection.query("SELECT * FROM roles", function(err, res) {
          if (err) throw err;
          const roles = res.map(object => {
            return {
              name: object.role_title,
              value: object.r_id
            };
          });

          console.log("Updating employee position...\n");
          inquirer
            .prompt([
              {
                name: "employee",
                type: "list",
                message: "Which employee would you like to modify?",
                choices: employees
              },
              {
                name: "role",
                type: "list",
                message: "Select the employee's new role: ",
                choices: roles
              }
            ])
            .then(function(res) {
              console.log("Updating existing employee...\n");
              connection.query(
                "UPDATE employee SET ? WHERE ?",
                [
                  {
                    role_id: res.role
                  },
                  {
                    e_id: res.employee
                  }
                ],
                function(err, res) {
                  if (err) throw err;
                  console.log(res.affectedRows + " employee updated!\n");
                  continuePrompt();
                }
              );
            })
            .catch(function(err) {
              console.log(err);
            });
        });
      });
      break;
    case "Role":
      console.log("Can't update role...\n");
      continuePrompt();
      break;
    case "Department":
      console.log("Can't update department...\n");
      continuePrompt();
      break;
  }
}

//delete function

function deleteData(option) {
  switch (option) {
    case "Employee":
      connection.query("SELECT * FROM employee", function(err, res) {
        if (err) throw err;
        const employees = res.map(object => {
          return {
            name: `${object.first_name} ${object.last_name}`,
            value: object.e_id
          };
        });
        inquirer
          .prompt([
            {
              name: "employee",
              type: "list",
              message: "Which employee would you like to remove?",
              choices: employees
            }
          ])
          .then(function(res) {
            console.log("deleting an existing employee...\n");
            connection.query(
              "DELETE FROM employee WHERE ?",
              [
                {
                  e_id: res.employee
                }
              ],
              function(err, res) {
                if (err) throw err;
                console.log(res.affectedRows + " employee removed!\n");
                continuePrompt();
              }
            );
          })
          .catch(function(err) {
            console.log(err);
          });
      });
      break;
    case "Role":
      console.log("Can't remove a role...\n");
      continuePrompt();
      break;
    case "Department":
      console.log("Can't remove a department...unless you're the boss.\n");
      continuePrompt();
      break;
  }
}

//continuing and exit functions defined

function continuePrompt() {
  inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "Would you like to continue or exit?",
      choices: ["CONTINUE", "EXIT"]
    })
    .then(function(res) {
      console.log(`${res.action}...\n`);
      switch (res.action) {
        case "EXIT":
          connection.end();
          break;
        case "CONTINUE":
          startApp();
          break;
      }
    })
    .catch(function(err) {
      console.log(err);
    });
}

function genDepartmentPrompt() {
  inquirer
    .prompt({
      name: "action",
      type: "list",
      message:
        "Please finish adding this role by creating the correct department.",
      choices: ["CONTINUE", "EXIT"]
    })
    .then(function(res) {
      console.log(`${res.action}...\n`);
      switch (res.action) {
        case "EXIT":
          connection.end();
          break;
        case "CONTINUE":
          startApp();
          break;
      }
    })
    .catch(function(err) {
      console.log(err);
    });
}

function genRolePrompt() {
  inquirer
    .prompt({
      name: "action",
      type: "list",
      message:
        "Please finish adding this employee by creating the correct role.",
      choices: ["CONTINUE", "EXIT"]
    })
    .then(function(res) {
      console.log(`${res.action}...\n`);
      switch (res.action) {
        case "EXIT":
          connection.end();
          break;
        case "CONTINUE":
          startApp();
          break;
      }
    })
    .catch(function(err) {
      console.log(err);
    });
}
