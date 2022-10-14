var bodyParser = require('body-parser');
var urlencodeParser = bodyParser.urlencoded({ extended: false });
var parserJson = bodyParser.json();
var connection = require('./db');

module.exports = function(app) {
    app.post('/login', urlencodeParser, function(req, res) {
        var email = req.body.email;
        var password = req.body.password;
        var sql = "select * from users where email = '" + email + "' and password = '" + password + "'";
        connection.query(sql, function(err, result) {
            if (err) {
                throw err;
            }
            console.log(result)
            res.send(result);
        });
    })

    app.get('/user', function(req, res, next) {
        const max_results = req.query.max_results ?? 25;
        let sql = `select * from users limit ${max_results}`;

        connection.query(sql, function(err, result) {
            if (err) {
                throw err;
            }
            res.send(result);
        })
    })

    app.get('/user/:user_id', function(req, res) {
        const userId = req.params['user_id']
        var sql = "select * from users where id = '" + userId + "' ";
        connection.query(sql, function(err, result) {
            if (err) {
                throw err;
            }
            res.send(...result);
        });
    })
}