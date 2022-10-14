var bodyParser = require('body-parser');
var urlencodeParser = bodyParser.urlencoded({ extended: false });
var parserJson = bodyParser.json();
var connection = require('./db');

module.exports = function(app) {
    app.get('/rate', function(req, res, next) {
        const max_results = req.query.max_results ?? 25;
        var sql = `select * from rating limit ${max_results}`;
        
        connection.query(sql, function(err, result) {
            if (err) {
                throw err;
            }
            res.send(result);
        })
    })
    
    app.get('/rate/:rate_id', function(req, res) {
        const rateId = req.params['rate_id']
        var sql = "select * from rating where id = '" + rateId + "' ";
        connection.query(sql, function(err, result) {
            if (err) {
                throw err;
            }
            res.send(...result);
        });
    })
}