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
		var sql = `select * from product_new limit ${max_results}`;

		connection.query(sql, function (err, result) {
			if (err) {
				throw err;
				console.log("🚀 ~ file: product.js:37 ~ console");
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
		const name = req.body.name ?? null;
		const category_id = req.body.category_id ?? null;
		const shop_id = req.body.shop_id ?? null;
		const image = req.body.image ?? null;
		const description = req.body.description ?? null;
		const quanlity = req.body.quanlity ?? null;
		const price = req.body.price ?? null;
		const sale = req.body.sale ?? null;

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

			const name = req.body?.name ?? null;
			const category_id = req.body?.category_id ?? null;
			const image = req.body?.image ?? null;
			const description = req.body?.description ?? null;
			const quanlity = req.body?.quanlity ?? null;
			const price = req.body?.price ?? null;

			var sql = `UPDATE product_new
        SET name =' ${name}',
        category_id = ${category_id},
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
};
