var bodyParser = require("body-parser");
var urlencodeParser = bodyParser.urlencoded({ extended: false });
var parserJson = bodyParser.json();
var connection = require("./db");
var TimeNow = require("./atom");
const fastcsv = require("fast-csv");
const fs = require("fs");
const ws = fs.createWriteStream("data.csv");
const path = require("path");

function getMultipleRandom(arr, num) {
	const shuffled = [...arr].sort(() => 0.5 - Math.random());

	return shuffled.slice(0, num);
}

module.exports = function (app) {
	// app.get("/rate", function (req, res, next) {
	// 	const max_results = req.query.max_results ?? 25;
	// 	// var sql = `select * from rating where deleted = 0 limit ${max_results}`;
	// 	var sql = `select * from rating`;

	// 	connection.query(sql, function (err, result) {
	// 		if (err) {
	// 			throw err;
	// 		}

	// 		// print CSV string
	// 		fastcsv
	// 			.write(result, { headers: true })
	// 			.on("finish", function () {
	// 				console.log("Write to CSV successfully!");
	// 			})
	// 			.pipe(ws);
	// 	});
	// 	// res.send(result);
	// });

	// Random ratingg

	app.get("/rate", function (req, res, next) {
		// const max_results = req.query.max_results ?? 25;
		// var sql = `select * from rating where deleted = 0 limit ${max_results}`;

		// connection.query(sql, function(err, result) {
		//     if (err) {
		//         throw err;
		//     }
		//     res.send(result);
		// })
		var sql = `select id from product_new`;
		connection.query(sql, function (err, result) {
			var sqlUsers = `select id from users limit 100`;
			connection.query(sqlUsers, function (err, resultUser) {
				resultUser.forEach(userId => {
					getMultipleRandom(result, Math.floor(Math.random() * 15)).forEach(
						productId => {
							var ratingList = Math.floor(Math.random() * 10) + 1;
							var contentList = [
								"Rất tệ",
								"Rất tệ",
								"Tệ",
								"Tệ",
								"Tạm được",
								"Tạm được",
								"Tốt",
								"Tốt",
								"Rất tốt",
								"Rất tốt",
							];
							var sqlRating = `insert into ratings(userid, productid, rating, content, deleted, created_at, updated_at)
	values('${userId.id}', '${productId.id}', ${ratingList}, '${
								contentList[ratingList - 1]
							}', 0, '${TimeNow()}', '${TimeNow()}')`;
							connection.query(sqlRating, function (err, result) {
								if (err) throw err;
							});
						}
					);
				});
			});
		});
	});

	app.get("/rate/:rate_id", function (req, res) {
		const rateId = req.params["rate_id"];
		var sql =
			"select * from rating where id = '" + rateId + "' and deleted = 0 ";
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

	app.get("/rate/product/:product_id", function (req, res) {
		const productId = req.params["product_id"];
		var sql =
			"select * from rating where productid = '" +
			productId +
			"' and deleted = 0 ";
		connection.query(sql, function (err, result) {
			if (err) {
				throw err;
			}
			if (result.length > 0) {
				res.send(result);
			} else {
				res.send({ message: "not found" });
			}
		});
	});

	// command api
	app.post("/rate/create_rate", urlencodeParser, function (req, res) {
		const userId = req.body.userId ?? null;
		const productId = req.body.productId ?? null;
		const content = req.body.content ?? null;
		const rating = req.body.rating ?? null;

		var sql = `insert into rating(userid, productid, rating, content, deleted, created_at, updated_at) 
        values('${userId}', '${productId}', ${rating}, '${content}', 0, '${TimeNow()}', '${TimeNow()}')`;

		connection.query(sql, function (err, result) {
			if (err) {
				res.json({ type: "Create error", message: err.message });
			} else {
				res.json({ type: "Create success" });
			}
		});
	});

	app.post("/rate/update_rate/:rate_id", urlencodeParser, function (req, res) {
		const rateId = req.params["rate_id"];

		const content = req.body.content ?? null;
		const rating = req.body.rating ?? null;

		var sql = `UPDATE rating
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
		var sql = `UPDATE rating
        SET deleted = 1
        WHERE id = '${rateId}'`;

		connection.query(sql, function (err, result) {
			if (err) {
				res.json({ type: "Delete error", message: err.message });
			} else {
				res.json({ type: "Delete success" });
			}
		});
	});
};
