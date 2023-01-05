var bodyParser = require("body-parser");
var urlencodeParser = bodyParser.urlencoded({ extended: false });
var parserJson = bodyParser.json();
var connection = require("./db");
var TimeNow = require("./atom");

module.exports = function (app) {
	app.get("/shop/:user_id", function (req, res) {
		const userId = req.params["user_id"];
		var sql = "select * from shop where userId = '" + userId + "'";
		connection.query(sql, function (err, result) {
			if (err) {
				throw err;
			}
			if (result.length > 0) {
				res.send({ type: 'OK', data: result[0] });
			} else {
				res.send({ type: 'NOTOK', message: "not found" });
			}
		});
	});

	app.get("/shop/product/:shopId", function (req, res) {
		const userId = req.params["shopId"];
		var sql = `SELECT s.*, COUNT(distinct p.id) as totalProduct, COUNT(r.id) as totalRating FROM shop s
		INNER JOIN product_new p
		ON s.id = p.id_shop
		LEFT JOIN ratings r
		ON p.id = r.productId
		 where s.id = '${userId}'`;
		connection.query(sql, function (err, result) {
			if (err) {
				throw err;
			}
			if (result.length > 0) {
				res.send({ type: 'OK', data: result[0] });
			} else {
				res.send({ type: 'NOTOK', message: "not found" });
			}
		});
	});

	app.post("/shop/create_shop/:user_id", urlencodeParser, function (req, res) {
		const userId = req.params["user_id"];
		const name = req.body?.shop_name;
		console.log("🚀 ~ file: shop.js:46 ~ name", name)
		const image = req.body?.shop_avatar;
		console.log("🚀 ~ file: shop.js:48 ~ image", image)
		const description = req.body?.shop_description;
		console.log("🚀 ~ file: shop.js:50 ~ description", description)

		var sql = `insert into shop(userId, shop_name, shop_slug, shop_description, shop_avatar, shop_deleted, created_at, updated_at) 
        values(${userId}, '${name}', '${name}', '${description}', '${image}', 0, '${TimeNow()}', '${TimeNow()}')`;

		connection.query(sql, function (err, result) {
			if (err) {
				res.json({ type: "Create error", message: err.message });
			} else {
				console.log(result)
				res.json({ type: "Create success" });
			}
		});
	});

	app.post(
		"/shop/update_shop/:shopId",
		urlencodeParser,
		function (req, res) {
			const shopId = req.params["shopId"];

			const name = req.body?.shop_name;
			console.log("🚀 ~ file: shop.js:46 ~ name", name)
			const image = req.body?.shop_avatar;
			console.log("🚀 ~ file: shop.js:48 ~ image", image)
			const description = req.body?.shop_description;
			console.log("🚀 ~ file: shop.js:50 ~ description", description)

			var sql = `UPDATE shop
        SET shop_name = '${name}',
        shop_description = '${description}',
        shop_avatar = '${image}',
        updated_at = '${TimeNow()}'
        WHERE id = '${shopId}'`;

			connection.query(sql, function (err, result) {
				if (err) {
					res.json({ type: "Update error", message: err.message });
				} else {
					res.json({ type: "Update success" });
				}
			});
		}
	);
};
