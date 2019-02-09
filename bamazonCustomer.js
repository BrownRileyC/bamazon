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
    console.log('connected as id ' + connection.threadId);
    readProducts();
});

function readProducts() {
    connection.query("SELECT * FROM products", function (err, response) {
        for (var i = 0; i < response.length; i++) {
            console.log(response[i].item_id + " | " + response[i].product_name + " | " + response[i].department_name + " | " + response[i].price + " | " + response[i].stock_quantity);
        };
        console.log('==========================================')
        inquirer.prompt([
            {
                type: 'input',
                name: 'itemID',
                // choices: function () {
                //     var idArray = [];
                //     for (var i = 0; i < response.length; i++) {
                //         idArray.push(response[i].item_id)
                //     }
                //     return idArray;
                // },
                message: 'What is the id of the item you are interested in?'
            },
            {
                type: 'input',
                name: 'amount',
                message: 'How many of that item would you like to order?'
            }
        ]).then(function (response) {
            connection.query("SELECT * FROM products WHERE ?", { item_id: parseInt(response.itemID) }, function (err, res) {
                console.log(res[0].stock_quantity);
                console.log(parseInt(response.amount));
                if (res[0].stock_quantity > parseInt(response.amount)) {
                    console.log('I made it inside the if');
                    connection.query('UPDATE products SET ? WHERE ?', [{
                        stock_quantity: (res[0].stock_quantity - parseInt(response.amount))
                    },
                    {
                        item_id: response.itemID
                    }], function (err, data) {
                        console.log('Your transaction cost: $' + parseInt(response.amount) * res[0].price);
                        connection.end();
                    })

                } else {
                    console.log("I'm sorry, we don't have enough of that item to make the purchase.\r\nHave a nice day")
                }
            })
        })
    });
}