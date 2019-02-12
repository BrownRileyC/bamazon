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
    console.log('connected as id ' + connection.threadId);
    readProducts();
});

function numberValidation(num) {
    if (!isNaN(num)){
        return true
    } else {
        return 'Please enter a number instead'
    }
};

function readProducts() {
    let table = new Table({
        head: ['Item ID', 'Item', 'Dept Name','Price','Quantity'],
        colWidths: [10, 20, 20, 20, 20]
    });
    connection.query("SELECT * FROM products", function (err, response) {
        for (var i = 0; i < response.length; i++) {
            table.push([response[i].item_id, response[i].product_name, response[i].department_name, "$"+response[i].price, response[i].stock_quantity])
        };
        console.log(table.toString())
        inquirer.prompt([
            {
                type: 'input',
                name: 'itemID',
                message: 'What is the id of the item you are interested in?',
                validate: numberValidation
            },
            {
                type: 'input',
                name: 'amount',
                message: 'How many of that item would you like to order?',
                validate: numberValidation
            }
        ]).then(function (response) {
            connection.query("SELECT * FROM products WHERE ?", { item_id: parseInt(response.itemID) }, function (err, res) {
                if (res[0].stock_quantity > parseInt(response.amount)) {
                    connection.query('UPDATE products SET ? WHERE ?', [{
                        stock_quantity: (res[0].stock_quantity - parseInt(response.amount))
                    },
                    {
                        item_id: response.itemID
                    }], function (err, data) {
                        let current_sale = parseInt(response.amount) * res[0].price;
                        let product_sales = res[0].product_sales + current_sale;
                        console.log('Your transaction cost: $' + current_sale.toFixed(2));
                        let updateSales = 'UPDATE products SET product_sales=' + product_sales + ' WHERE item_id=' + parseInt(response.itemID);
                        connection.query(updateSales, function (err, data) {
                            if (err) throw err;

                            connection.end();
                        })
                    })

                } else {
                    console.log("I'm sorry, we don't have enough of that item to make the sale.\r\nHave a nice day")
                    connection.end();
                }
            })
        })
    });
}