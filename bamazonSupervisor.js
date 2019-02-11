var mysql = require('mysql');
var inquirer = require('inquirer');
require('dotenv').config();
const Table = require('cli-table');

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: process.env.DB_Password,
    database: 'bamazon_db'
});

connection.connect(function (err) {
    if (err) throw err;
    console.log('Connected');
    inquirer.prompt({
        type: 'list',
        name: 'command',
        message: 'What would you like to do today, sir',
        choices: ['Create a new Department', 'View spending by department']
    }).then(function (response) {
        switch (response.command) {
            case 'Create a new Department':
                addDepartment();
                break;
            case 'View spending by department':
                viewSpending();
                break;
            default:
                console.log('What did you do?');
                connection.end();
        }
    })
});

function addDepartment() {
    inquirer.prompt(
        [
            {
                name: 'dept_name',
                type: 'input',
                message: 'What is the name of the new department?'
            },
            {
                message: 'What is the overhead on the new department?',
                type: 'input',
                name: 'overhead',
                validate: function (name) {
                    return !isNaN(name);
                }
            }
        ]).then(function (response) {
            let insert = "INSERT INTO departments (department_name, overhead) VALUES ('" + response.dept_name + "', " + parseFloat(response.overhead) + ")";
            connection.query(insert, function (err, response) {
                if (err) throw err;
                readDepartments();
            });
        });
}

function readDepartments() {
    let table = new Table({
        head: ['Dept ID', 'Dept Name','Overhead'],
        colWidths: [10, 20, 20]
    });
    connection.query("SELECT * FROM departments", function (err, response) {
        for (var i = 0; i < response.length; i++) {
            table.push([response[i].id, response[i].department_name, response[i].overhead]);
        };
        console.log(table.toString())
        connection.end();
    });
};

function viewSpending() {
    let table = new Table({
        head: ['Dept ID', 'Dept Name','Overhead','Department Sales','Profits'],
        colWidths: [10, 20, 20, 20, 20]
    });
    let spendingQuery = 'SELECT departments.id, departments.department_name, departments.overhead, SUM(products.product_sales) department_sales FROM products INNER JOIN departments ON departments.department_name=products.department_name GROUP BY department_name ORDER BY departments.id'
    connection.query(spendingQuery, function(err, res){
        for (var k = 0; k < res.length; k++){
            let profit = parseFloat(res[k].department_sales) - parseFloat(res[k].overhead);
            table.push([res[k].id, res[k].department_name, res[k].overhead, res[k].department_sales, profit]);
        };
        console.log(table.toString());
        connection.end();
    })
};