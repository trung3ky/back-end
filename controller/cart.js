var bodyParser = require('body-parser');
var urlencodeParser = bodyParser.urlencoded({ extended: false });
var parserJson = bodyParser.json();
var connection = require('./db');
var TimeNow = require('./atom');
const { spawn } = require('child_process')
const { PythonShell } = require('python-shell')

module.exports = function (app) {
    app.get('/cart/:user_id', function (req, res, next) {
        const userId = req.params['user_id']
        const sql = `select c.*, p.product_name, p.product_image, p.product_image, p.product_price, p.product_quanlity, g.display_category, s.id as 'shop_id', s.shop_name, s.shop_avatar
            from cart c
            LEFT JOIN product_new p
            ON c.product_id = p.id 
            LEFT JOIN categories g
            ON p.id_category = g.id 
            LEFT JOIN shop s
            ON p.id_shop = s.id
            Where user_id = ${userId}`
        connection.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            if (result.length > 0) {
                res.send(result);
            } else {
                res.send([])
            }
        });
    })

    app.post("/cart/add_cart", urlencodeParser, function (req, res) {
        const userId = req.body.userId;
        const productId = req.body.productId;
        const quanlity = req.body.quanlity;

        var sql = `insert into cart(user_id, product_id, quanlity, created, updated_at) 
        values('${userId}', '${productId}', ${quanlity}, '${TimeNow()}', '${TimeNow()}')`;

        var checkItem = `select * from cart where user_id = ${userId} and product_id = ${productId}`;

        connection.query(checkItem, function (err, resultCheckItem) {
            if (err) throw err;
            if (resultCheckItem.length > 0) {
                var updateSql = `UPDATE cart
                SET quanlity = ${resultCheckItem[0].quanlity + quanlity},
                updated_at = '${TimeNow()}'
                where user_id = ${userId} and product_id = ${productId}`;
                connection.query(updateSql, function (err, result) {
                    if (err) {
                        res.json({ type: "update error", message: err.message });
                    } else {
                        res.json({ type: "OK", message: "Add Cart success" });
                    }
                });
            } else {
                var sql = `insert into cart(user_id, product_id, quanlity, created, updated_at) 
                values('${userId}', '${productId}', ${quanlity}, '${TimeNow()}', '${TimeNow()}')`;

                connection.query(sql, function (err, result) {
                    if (err) {
                        res.json({ type: "Create error", message: err.message });
                    } else {
                        res.json({ type: "OK", message: "Add Cart success" });
                    }
                });
            }
        })
    });

    app.post("/cart/update_cart/:cart_id", urlencodeParser, function (req, res) {
        const cartId = req.params["cart_id"];
        const quanlity = req.body.quanlity;

        var updateSql = `UPDATE cart
                SET quanlity = ${quanlity},
                updated_at = '${TimeNow()}'
                where id = '${cartId}'`;
        connection.query(updateSql, function (err, result) {
            if (err) {
                res.json({ type: "update error", message: err.message });
            } else {
                res.json({ type: "OK", message: "Update Cart success" });
            }
        });
    });

    app.get("/cart/delete_cart/:cart_id", urlencodeParser, function (req, res) {
        const cartId = req.params["cart_id"];
        var sql = `DELETE FROM cart WHERE id = '${cartId}'`;

        connection.query(sql, function (err, result) {
            if (err) {
                res.json({ type: "Delete error", message: err.message });
            } else {
                res.json({ type: "Delete success" });
            }
        });
    });

    app.get("/cart/cart-list/:list_id/user/:user_id", urlencodeParser, function (req, res) {
        const list_id = req.params["list_id"];
        const user_id = req.params["user_id"];

        const sql = `select c.*, p.product_name, p.product_image, p.product_image, p.product_price, p.product_quanlity, g.display_category, s.id as 'shop_id', s.shop_name, s.shop_avatar,a.district as user_address, a2.district as shop_address from cart c LEFT JOIN product_new p ON c.product_id = p.id LEFT JOIN categories g ON p.id_category = g.id LEFT JOIN shop s ON p.id_shop = s.id LEFT JOIN address a ON c.user_id = a.user_id LEFT JOIN address a2 ON s.userId = a2.user_id Where c.user_id = ${user_id} and product_id IN (${JSON.parse(list_id)})`


        connection.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            // let shop_id = req.body.shop_id;
            // let from_district = req.body.from_district;
            // let to_district = req.body.to_district;
            // axios.post('https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/available-services', {
            //     shop_id, from_district, to_district
            // },
            //     {
            //         headers: {
            //             Token: "bb0e3863-7d49-11ed-9dc6-f64f768dbc22",
            //             'Content-Type': 'application/json',
            //         }
            //     }
            // ).then(({ data }) => res.json(data));
            if (result.length > 0) {
                res.send(result);
            } else {
                res.send([])
            }
        });
    });
}