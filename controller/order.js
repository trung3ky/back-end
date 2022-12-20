var bodyParser = require('body-parser');
var connection = require('./db');

module.exports = function (app) {
    app.get('/order/:user_id', function (req, res, next) {
        const userId = req.params['user_id']
        const sql = `select c.*, p.product_name, p.product_image, p.product_image, p.product_price, p.product_quanlity, g.display_category, s.id as 'shop_id', s.shop_name, s.shop_avatar, o.status_order from cart c LEFT JOIN product_new p ON c.product_id = p.id LEFT JOIN categories g ON p.id_category = g.id LEFT JOIN shop s ON p.id_shop = s.id LEFT JOIN orders o ON o.id_cart = c.id Where user_id = ${userId}`
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
}