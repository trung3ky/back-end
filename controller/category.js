var bodyParser = require("body-parser");
var connection = require("./db");

module.exports = function (app) {
	app.get("/category", function (req, res, next) {
		var sql = 'select * from categories';

		connection.query(sql, function (err, result) {
			if (err) {
				throw err;
			}
			res.send(result);
		});
	});
	app.get("/category/:category_id", function (req, res) {
		const categoryId = req.params["category_id"];
		var sql = "select * from categories where id = '" + categoryId + "'";
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
};
