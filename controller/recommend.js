var bodyParser = require("body-parser");
var urlencodeParser = bodyParser.urlencoded({ extended: false });
var parserJson = bodyParser.json();
var connection = require("./db");
var TimeNow = require("./atom");
const { spawn } = require("child_process");
const { PythonShell } = require("python-shell");

module.exports = function (app) {
	app.get("/recommend/:user_id", function (req, resAPI, next) {
		const userId = req.params["user_id"];

		PythonShell.run("python\\recommend.py", { args: [userId] }, (err, res) => {
			if (err) console.log(err);
			if (res) {
				console.log("python");
				const data = res[0];
				let transformData = data.slice(1, data.length - 5).replace(new RegExp("'", 'g'), "");
				if(transformData.split("[").length > 0) {
					transformData = transformData.split("[")[transformData.split("[").length - 1]
				}
				const newData = transformData.split(", ").map(item => Number(item));
				console.log("🚀 ~ file: recommend.js:21 ~ PythonShell.run ~ newData", newData)
				const sql = `select p.* , AVG(r.rating) as avg_rating
				FROM product_new p 
				INNER JOIN ratings r
				ON p.id = r.productId where p.id IN (${newData}) GROUP BY r.productId `;
				connection.query(sql, function (err, result) {
					if (err) {
						throw err;
					}
					if (result.length > 0) {
						resAPI.send(result);
					}
				});
			}
		});
	});
};
