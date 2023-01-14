var bodyParser = require("body-parser");
var urlencodeParser = bodyParser.urlencoded({ extended: false });
var parserJson = bodyParser.json();
var connection = require("./db");
const uuid = require("uuid");
var TimeNow = require("./atom");
const fastcsv = require("fast-csv");
const fs = require("fs");

const handleWriteFileUser = () => {
	const ws = fs.createWriteStream("data/users_new.csv");
	let sql = `select id,name,password,date_of_birth,gender from users `;

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
}

module.exports = function (app) {
	app.post("/login", urlencodeParser, function (req, res) {
		var email = req.body.username;
		var password = req.body.password;
		var sql =
			"select * from users where email = '" +
			email +
			"' and password = '" +
			password +
			"'";
		connection.query(sql, function (err, result) {
			if (err) {
				throw err;
			}
			console.log(result)
			if (result.length > 0) {
				var sqlCheckAdress = "select * from address where user_id = '" + result[0].id + "' ";
				connection.query(sqlCheckAdress, function (err, resultCheck) {
					if (err) throw err;
					res.send({
						...result[0],
						address: resultCheck.length > 0 ? true : false
					});
				});
			}
			else {
				res.send({
					code: "404",
					type: "login failed",
					message: "Email and password wrong",
				});
			}


		});
	});

	app.post("/register", urlencodeParser, function (req, res) {
		var username = req.body.username;
		var password = req.body.password;
		var name = req.body.name;
		var gender = req.body.gender;

		var checkEmail = `Select * from users where email = '${username}'`;
		connection.query(checkEmail, function (err, result) {
			console.log(result);
			if (result.length === 0) {
				var sql = `insert into users(name, password, date_of_birth, gender, avatar, description, email, delete_at, created_at, updated_at) 
                values('${name}', '${password}', null, '${gender}', null, null, '${username}', 0, '${TimeNow()}', '${TimeNow()}')`;
				connection.query(sql, function (err, result1) {
					if (err) {
						throw err;
					} else {
						handleWriteFileUser();
						res.json({ type: 'ok' });
					}
				});
			} else {
				res.send({
					code: "404",
					type: "register failed",
					message: "Email exits",
				});
			}
		});
	});

	app.get("/user/:user_id", function (req, res) {
		const userId = req.params["user_id"];
		var sql = "select * from users where id = '" + userId + "' ";
		var sqlCheckAdress = "select * from address where user_id = '" + userId + "' ";
		connection.query(sqlCheckAdress, function (err, resultCheck) {
			if (err) throw err;
			connection.query(sql, function (err, result) {
				if (err) throw err;
				res.send({
					...result[0],
					address: resultCheck.length > 0 ? true : false
				});
			});
		});
	});

	app.post(
		"/user/update_user/:user_id",
		urlencodeParser,
		function (req, res) {
			const user_id = req.params["user_id"];

			const name = req.body?.name ?? null;
			const avatar = req.body?.avatar ?? null;
			const description = req.body?.description ?? null;
			const gender = req.body?.gender ?? null;
			const date_of_birth = req.body?.date_of_birth ?? null;

			var sql = `UPDATE users
				SET name = '${name}',
				avatar = '${avatar}',
				description = ${description ? `'${description}'` : null},
				gender = '${gender}',
				date_of_birth = ${date_of_birth ? `'${date_of_birth}'` : null},
				updated_at = '${TimeNow()}'
				WHERE id = '${user_id}'`;

			connection.query(sql, function (err, result) {
				if (err) {
					res.json({ type: "Update error", message: err.message });
				} else {
					res.json({ type: "Update success" });
				}
			});
		}
	);

	app.post(
		"/user/update_password/:user_id",
		urlencodeParser,
		function (req, res) {
			const user_id = req.params["user_id"];

			const password = req.body?.password;

			var sql = `UPDATE users
				SET password = '${password}',
				updated_at = '${TimeNow()}'
				WHERE id = '${user_id}'`;

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
