var bodyParser = require('body-parser');
var connection = require('./db');

module.exports = function (app) {
    app.get('/order/:user_id', function (req, res, next) {
        const userId = req.params['user_id']
        const sql = `SELECT *  FROM orders WHERE user_id = ${userId}`
        connection.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            if (result.length > 0) {
                console.log(result)
                res.send(result);
            } else {
                res.send([])
            }
        });
    })
    app.get('/order/product_order/:order_id', function (req, res, next) {
        const order_id = req.params['order_id']
        const sql = `SELECT product_order.*, product_new.product_name,product_new.product_image,product_new.product_description  FROM product_order LEFT JOIN product_new ON product_new.id = product_order.product_id  WHERE order_id = ${order_id}`
        connection.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            if (result.length > 0) {
                console.log(result)
                res.send(result);
            } else {
                res.send([])
            }
        });
    })
}