var mysql = require('mysql');
var inquirer = require('inquirer');
require('dotenv').config();

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
        choices: ['View products for sale', 'View low inventory', 'Add to current inventory', 'Add new product']
    }).then(function (response) {
        switch (response.command) {
            case 'View products for sale':
                readProducts();
                break;
            case 'View low inventory':
                readLowProducts();
                break;
            case 'Add to current inventory':
                addToInventory();
                break;
            case 'Add new product':
                addNewProduct();
                break;
            default:
                console.log('What did you do?');
        }
    })
});

function addNewProduct() {
    inquirer.prompt(
        [
            {
                name: 'product_name',
                type: 'input',
                message: 'What item is being added to the inventory?'
            },
            {
                name: 'product_dept',
                type: 'input',
                message: 'What department does it belong to?'
            },
            {
                message: 'What is the price for the item?',
                type: 'input',
                name: 'product_price',
                validate: function (name) {
                    return !isNaN(name);
                }
            },
            {
                message: 'How many of the item are being added to the inventory?',
                type: 'input',
                name: 'product_quantity',
                validate: function (name) {
                    return !isNaN(name);
                }
            }
        ]).then(function (response) {
            let insert = "INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ('"+response.product_name + "', '" + response.product_dept + "', " + parseFloat(response.product_price) + ", " + parseInt(response.product_quantity) + ")";
            console.log(insert);
            connection.query(insert, function (err, response) {
                if (err) throw err;
                readProducts();
            });
        });
}

function addToInventory() {
    connection.query("SELECT * FROM products", function (err, data) {
        for (var i = 0; i < data.length; i++) {
            console.log(data[i].item_id + " | " + data[i].product_name + " | " + data[i].department_name + " | " + data[i].price + " | " + data[i].stock_quantity);
        };
        console.log('==========================================')
        inquirer.prompt([
            {
                type: 'input',
                name: 'itemID',
                message: 'Which item did we recieve in shipment?'
            },
            {
                type: 'input',
                name: 'amount',
                message: 'How many did we recieve?'
            }
        ]).then(function (response) {
            connection.query('UPDATE products SET ? WHERE ?', [{
                stock_quantity: (data[response.itemID-1].stock_quantity + parseInt(response.amount))
            },
            {
                item_id: response.itemID
            }], function (err, data) {
                if (err) throw err;
                console.log('Here is the updated inventory\r\n================================')
                readProducts();
            });
        })
    })
};

function readLowProducts() {
    connection.query("SELECT * FROM products WHERE stock_quantity < 5", function (err, response) {
        for (var i = 0; i < response.length; i++) {
            console.log(response[i].item_id + " | " + response[i].product_name + " | " + response[i].department_name + " | " + response[i].price + " | " + response[i].stock_quantity);
        };
        console.log('==========================================')
        connection.end();
    })
};

function readProducts() {
    connection.query("SELECT * FROM products", function (err, response) {
        for (var i = 0; i < response.length; i++) {
            console.log(response[i].item_id + " | " + response[i].product_name + " | " + response[i].department_name + " | " + response[i].price + " | " + response[i].stock_quantity);
        };
        console.log('==========================================')
        connection.end();
    });
};