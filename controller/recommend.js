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
				const transformData = data.slice(1, data.length - 5).replace(new RegExp("'", 'g'), "");
				console.log("🚀 ~ file: recommend.js:18 ~ PythonShell.run ~ data", transformData)
				const newData = transformData.split(", ").map(item => Number(item));
				const sql = `select * from product_new where id IN (${newData[0]} ,${newData[1]},${newData[2]},${newData[3]},${newData[4]})`;
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
