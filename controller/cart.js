var bodyParser = require('body-parser');
var urlencodeParser = bodyParser.urlencoded({ extended: false });
var parserJson = bodyParser.json();
var connection = require('./db');
var TimeNow = require('./atom');
const { spawn } = require('child_process')
const { PythonShell } = require('python-shell')

module.exports = function(app) {
    app.get('/cart/:user_id', function(req, res, next) {
        const userId = req.params['user_id']
        const sql = `select * from cart LEFT JOIN product_new 
            ON cart.product_id = product_new.id 
            Where user_id = ${userId}`
        connection.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            if(result.length > 0) {
                res.send(result);
            }else {
                res.send([])
            }
        });  
    })

    app.post("/cart/add_cart", urlencodeParser, function (req, res) {
        const userId = req.body.userId;
        const productId = req.body.productId;
        const quanlity = req.body.quanlity;

		var sql = `insert into cart(user_id, product_id, quanlity, created_at, updated_at) 
        values('${userId}', '${productId}', ${quanlity}, '${TimeNow()}', '${TimeNow()}')`;

		connection.query(sql, function (err, result) {
			if (err) {
				res.json({ type: "Create error", message: err.message });
			} else {
				res.json({ type: "OK", message: "Add Cart success" });
			}
		});
	});
}