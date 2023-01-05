var bodyParser = require('body-parser');
var connection = require('./db');
const { QueryTypes } = require('sequelize');
const sequelize = require('../controller/db2');

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
    app.post('/order/order_method', async function (req, res, next) {
        let { user_id, totalShip, totalPrice, listId, address } = req.body;
        let dataId = []
        listId.map(item => dataId.push(item));
        const result = await sequelize.query(`select quanlity,product_new.id,product_new.product_image,product_new.product_name,product_new.product_price,users.name,users.email, cart.id as cartId from cart JOIN product_new ON cart.product_id = product_new.id INNER JOIN users ON users.id = cart.user_id WHERE user_id = "${userId}" AND product_id IN(:dataId)`,
            {
                replacements: { dataId: dataId },
                type: QueryTypes.SELECT
            })
        const newR = result.map(item => {
            let { product_name, product_price, quanlity, name, email, id } = item;
            return {
                "name": `${product_name}`,
                "sku": `${id}`,
                "price": Number(product_price),
                "currency": "USD",
                "quantity": Number(quanlity)
            }
            // })
        });
        console.log("123", newR)
        console.log("user_id, totalShip, totalPrice, listId, address", user_id, totalShip, totalPrice, listId, address)
        var sqlOrder = `INSERT INTO orders(user_id,payment_method,status_order,totalPrice,totalShip,shipping_address, create_at,update_at) VALUES (${userId},0,0,${payment.transactions[0].amount.details.subtotal},${payment.transactions[0].amount.details.shipping},'${fullAdress}','${TimeNow()}','${TimeNow()}')`;
        connection.query(sqlOrder, function (err, result) {
            if (err) throw err;
            payment.transactions[0].item_list.items.map(item => {
                var sqlProductOrder = `INSERT INTO product_order(order_id,product_id,quanlity,price,created_at, updated_at) VALUES (${result.insertId},${item.sku},${item.quantity},${item.price},'${TimeNow()}','${TimeNow()}')`;
                connection.query(sqlProductOrder, function (err, result) {
                    if (err) throw err;
                    console.log("insert successfully")
                })

            })
            const sql = mysql.format(`DELETE FROM cart WHERE id IN (?)`, [cartId]);
            connection.query(sql, function (err, result) {
                if (err) throw err;
            })

        })
    })
}