var mysql = require('mysql');
var inquirer = require('inquirer');


var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Horsesrunfast7',
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
                break;
            default:
                console.log('What did you do?');
        }
    })
});

function addToInventory() {
    connection.query("SELECT * FROM products", function (err, response) {
        for (var i = 0; i < response.length; i++) {
            console.log(response[i].item_id + " | " + response[i].product_name + " | " + response[i].department_name + " | " + response[i].price + " | " + response[i].stock_quantity);
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
                stock_quantity: (this.stock_quantity + parseInt(response.amount))
            },
            {
                item_id: response.itemID
            }], function (err, data) {
                if (err) throw err;
            });
            connection.end();
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