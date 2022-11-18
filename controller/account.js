var bodyParser = require('body-parser');
var urlencodeParser = bodyParser.urlencoded({ extended: false });
var parserJson = bodyParser.json();
var connection = require('./db');
const uuid = require('uuid');
var TimeNow = require('./atom');

module.exports = function(app) {
    app.post('/login', urlencodeParser, function(req, res) {
        var email = req.body.username;
        var password = req.body.password;
        var sql = "select * from users where email = '" + email + "' and password = '" + password + "'";
        connection.query(sql, function(err, result) {
            if (err) {
                throw err;
            }
            if(result.length > 0){
                res.send(...result);
            }else {
                res.send({code: '404', type: 'login failed', message: 'Email and password wrong'})
            }
        });
    })

    app.post('/register', urlencodeParser, function(req, res) {
        var username = req.body.username;
        var password = req.body.password;
        var name = req.body.name;
        var gender = req.body.gender;

        var checkEmail = `Select * from users where email = '${username}'`;
        connection.query(checkEmail, function(err, result) {
            console.log(result)
            if(result.length === 0) {
                var sql = `insert into users(id, type_name, first_name, last_name, password, date_of_birth, gender, age, avatar, description, email, delete_at, status, country, created_at, updated_at) 
                values('${uuid.v4()}', null, '${name}', null, '${password}', null, '${gender}', null, null, null, '${username}', 0, null, null, '${TimeNow()}', '${TimeNow()}')`;
                connection.query(sql, function(err, result) {
                    if (err) {
                        throw err;
                    }
                    if(result.length > 0){
                        res.send(...result);
                    }else {
                        res.send({message: 'not found'})
                    }
                });
            }else {
                res.send({code: '404', type: 'register failed', message: 'Email exits'})
            }
        })
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