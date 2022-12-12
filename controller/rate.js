var bodyParser = require("body-parser");
var urlencodeParser = bodyParser.urlencoded({ extended: false });
var parserJson = bodyParser.json();
var connection = require("./db");
var TimeNow = require("./atom");
const { spawn } = require("child_process");
const { PythonShell } = require("python-shell");
const fastcsv = require("fast-csv");
const fs = require("fs");

const handleWriteFileRating = () => {
	const ws = fs.createWriteStream("data/ratings_new.csv");
	var sql = `select id,userId,productId,rating from ratings`;

	connection.query(sql, function (err, result) {
		if (err) {
			throw err;
		}
		console.log('vo')
		fastcsv
			.write(result, { headers: true })
			.on("finish", function () {
				console.log("Write to Rating CSV successfully!");
			})
			.pipe(ws);
	});
}

module.exports = function (app) {
	app.get("/rate/:rate_id", function (req, res) {
		const rateId = req.params["rate_id"];
		var sql = "select * from ratings where id = '" + rateId + "'";
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

	//check đã rating hay chưa
	app.get("/rate/check_rating/user/:user_id/product/:product_id", function (req, res) {
		const user_id = req.params["user_id"];
		const product_id = req.params["product_id"];
		var sql = `select * from ratings where userId = ${Number(user_id)} AND productId = ${Number(product_id)}`;
		connection.query(sql, function (err, result) {
			if (err) {
				throw err;
			}
			if (result.length > 0) {
				res.send({ check: true });
			} else {
				res.send({ check: false });
			}
		});
	});

	// app.get("/rate/product/:product_id", function (req, res) {
	// 	const productId = req.params["product_id"];
	// 	var sql = "select * from ratings where productid = '" + productId + "',select AVG(rating) AS averageRating,COUNT(id) AS customerRating from ratings where productid = '" + productId + "'";
	// 	// var objectR = {}
	// 	connection.query(sql, function (err, result) {
	// 		if (err) {
	// 			throw err;
	// 		}
	// 		if (result.length > 0) {
	// 			console.log("result",result)
	// 			// objectR.
	// 			res.send(result);
	// 		} else {
	// 			res.send({ message: "not found" });
	// 		}
	// 	});
	
	// });

	app.get("/rate/product/:product_id", (req, res) => {
		const productId = req.params["product_id"];
		const sql1 = `SELECT * FROM ratings WHERE productid = '${productId}'`;
		const sql2 = "select AVG(rating) AS averageRating,COUNT(id) AS customerRating from ratings where productid = '" + productId + "'";
		connection.query(sql1, function (error, ratings) {
		if (error) throw error;
		if (ratings.length > 0) {
			connection.query(sql2, function (error, results) {
				if (error) throw error;
				res.send({...results[0],ratings});
			})
		}
		});
	})
	// command api
	app.post("/rate/create_rate", urlencodeParser, function (req, res) {
		const userId = req.body.userId ?? null;
		const productId = req.body.productId ?? null;
		const content = req.body.content ?? null;
		const rating = req.body.rating ?? null;

		var sql = `insert into ratings(userid, productid, rating, content, deleted, created_at, updated_at) 
        values('${userId}', '${productId}', ${rating}, '${content}', 0, '${TimeNow()}', '${TimeNow()}')`;

		connection.query(sql, function (err, result) {
			if (err) {
				res.json({ type: "Create error", message: err.message });
			} else {
				handleWriteFileRating();
				res.json({ type: "Create success" });
			}
		});
	});

	app.post("/rate/update_rate/:rate_id", urlencodeParser, function (req, res) {
		const rateId = req.params["rate_id"];

		const content = req.body.content ?? null;
		const rating = req.body.rating ?? null;

		var sql = `UPDATE ratings
        SET content =' ${content}',
        rating = ${rating},
        updated_at = '${TimeNow()}'
        WHERE id = '${rateId}'`;

		connection.query(sql, function (err, result) {
			if (err) {
				res.json({ type: "Update error", message: err.message });
			} else {
				res.json({ type: "Update success" });
			}
		});
	});

	app.post("/rate/delete_rate/:rate_id", urlencodeParser, function (req, res) {
		const rateId = req.params["rate_id"];
		var sql = `DELETE FROM ratings WHERE id = '${rateId}'`;

		connection.query(sql, function (err, result) {
			if (err) {
				res.json({ type: "Delete error", message: err.message });
			} else {
				res.json({ type: "Delete success" });
			}
		});
	});
};
