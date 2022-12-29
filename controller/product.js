var bodyParser = require("body-parser");
var urlencodeParser = bodyParser.urlencoded({ extended: false });
var parserJson = bodyParser.json();
var connection = require("./db");
var TimeNow = require("./atom");
const uuid = require("uuid");
const fastcsv = require("fast-csv");
const fs = require("fs");

const handleWriteFileProduct = () => {
	const ws = fs.createWriteStream("data/product_new.csv");
	var sql = `select id,id_category,product_name from product_new`;
	connection.query(sql, function (err, result) {
		if (err) {
			throw err;
		}
		fastcsv
			.write(result, { headers: true })
			.on("finish", function () {
				console.log("Write to Rating CSV successfully!");
			})
			.pipe(ws);
	});
};

module.exports = function (app) {
	app.get("/product", function (req, res, next) {
		const max_results = req.query.max_results ?? 25;
		var sql = `SELECT p.* , AVG(r.rating) as avg_rating
		FROM product_new p 
        INNER JOIN ratings r
        ON p.id = r.productId GROUP BY r.productId limit ${max_results}`;

		connection.query(sql, function (err, result) {
			if (err) {
				throw err;
			}
			res.send(result);
		});
	});

	app.get("/product/top-rate", function (req, res, next) {
		const max_results = req.query.max_results ?? 25;
		var sql = `SELECT p.* 
		FROM product_new p 
		ORDER BY (SELECT AVG(rating) AS avg_rating FROM ratings WHERE productId = p.id) DESC LIMIT ${max_results}`;

		connection.query(sql, function (err, result) {
			if (err) {
				throw err;
			}
			res.send(result);
		});
	});

	app.get("/product/:product_id", function (req, res) {
		const productId = req.params["product_id"];
		var sql = "select * from product_new where id = '" + productId + "'";
		connection.query(sql, function (err, result) {
			if (err) {
				throw err;
			}
			if (result.length > 0) {
				res.send(...result);
			} else {
				res.send({ message: "not found" });
			}
		});
	});

	app.post("/product/create_product", urlencodeParser, function (req, res) {
		const shop_id = req.body.shop_id ?? null;
		const name = req.body?.product_name ?? null;
		const category_id = req.body?.id_category ?? null;
		const image = req.body?.product_image ?? null;
		const description = req.body?.product_description ?? null;
		const quanlity = req.body?.product_quanlity ?? null;
		const price = req.body?.product_price ?? null;

		var sql = `insert into product_new(id_shop, id_category, product_name, product_image, product_description, product_quanlity, product_price, created_at, updated_at) 
        values(${shop_id}, ${category_id}, '${name}', '${image}', '${description}', ${quanlity}, ${price}, '${TimeNow()}', '${TimeNow()}')`;

		connection.query(sql, function (err, result) {
			if (err) {
				res.json({ type: "Create error", message: err.message });
			} else {
				handleWriteFileProduct();
				res.json({ type: "Create success" });
			}
		});
	});

	app.post(
		"/product/delete_product/:product_id",
		urlencodeParser,
		function (req, res) {
			const productId = req.params["product_id"];
			var sql = `DELETE FROM product_new WHERE id = '${productId}'`;

			connection.query(sql, function (err, result) {
				if (err) {
					res.json({ type: "Delete error", message: err.message });
				} else {
					res.json({ type: "Delete success" });
				}
			});
		}
	);

	app.post(
		"/product/update_product/:product_id",
		urlencodeParser,
		function (req, res) {
			const productId = req.params["product_id"];

			const name = req.body?.product_name ?? null;
			const category_id = req.body?.id_category ?? null;
			const image = req.body?.product_image ?? null;
			const description = req.body?.product_description ?? null;
			const quanlity = req.body?.product_quanlity ?? null;
			const price = req.body?.product_price ?? null;

			var sql = `UPDATE product_new
        SET product_name = '${name}',
        id_category = ${category_id},
        product_image =' ${image}',
        product_description = '${description}',
        product_quanlity = ${quanlity},
        product_price = ${price},
        updated_at = '${TimeNow()}'
        WHERE id = '${productId}'`;

			connection.query(sql, function (err, result) {
				if (err) {
					res.json({ type: "Update error", message: err.message });
				} else {
					res.json({ type: "Update success" });
				}
			});
		}
	);

	app.get('/product/shop/:shop_id', urlencodeParser, (req, res) => {
		const shop_id = req.params["shop_id"];
		const sql = `select p.*, categories.display_category from product_new p
		LEFT JOIN categories ON p.id_category = categories.id 
		where id_shop = ${shop_id}`;
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

	app.get('/product/category/:category_id', urlencodeParser, (req, res) => {
		const category_id = req.params["category_id"];
		const sql = `select * from product_new where id_category = ${category_id}`;
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

	app.get('/product/search/:search', urlencodeParser, (req, res) => {
		const search = req.params["search"];
		const sql = `select * from product_new where product_name LIKE '%${search}%'`;
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
};
