var bodyParser = require('body-parser');
var urlencodeParser = bodyParser.urlencoded({ extended: false });
var parserJson = bodyParser.json();
var connection = require('./db');
var TimeNow = require('./atom');
const { spawn } = require('child_process')
const { PythonShell } = require('python-shell')

// let option = {
//     // scriptPath: 'E:/pyshell',
//     args: ['trung', 22]
// }

module.exports = function(app) {
    app.get('/rate', function(req, res, next) {
        // PythonShell.run('python\\recommend.py', option, (err, res) => {
        //     if(err) console.log(err)
        //     if(res) console.log(res)
        // })
        const max_results = req.query.max_results ?? 25;
        var sql = `select * from ratings limit ${max_results}`;
        
        connection.query(sql, function(err, result) {
            if (err) {
                throw err;
            }
            res.send(result);
        })
    })
    
    app.get('/rate/:rate_id', function(req, res) {
        const rateId = req.params['rate_id']
        var sql = "select * from ratings where id = '" + rateId + "'";
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
    })

    app.get('/rate/product/:product_id', function(req, res) {
        const productId = req.params['product_id']
        var sql = "select * from ratings where productid = '" + productId + "'";
        connection.query(sql, function(err, result) {
            if (err) {
                throw err;
            }
            if(result.length > 0){
                res.send(result);
            }else {
                res.send({message: 'not found'})
            }
        });
    })

    // command api
    app.post('/rate/create_rate', urlencodeParser, function(req, res) {
        const userId = req.body.userId ?? null;
        const productId = req.body.productId ?? null;
        const content = req.body.content ?? null;
        const rating = req.body.rating ?? null;

        var sql = `insert into ratings(userid, productid, rating, content, deleted, created_at, updated_at) 
        values('${userId}', '${productId}', ${rating}, '${content}', 0, '${TimeNow()}', '${TimeNow()}')`;

        connection.query(sql, function(err, result) {
            if (err) {
                res.json({type: 'Create error', message: err.message})
            }else {
                res.json({type: 'Create success'})
            }
        });
    })

    app.post('/rate/update_rate/:rate_id', urlencodeParser, function(req, res) {
        const rateId = req.params['rate_id']

        const content = req.body.content ?? null;
        const rating = req.body.rating ?? null;

        var sql = `UPDATE ratings
        SET content =' ${content}',
        rating = ${rating},
        updated_at = '${TimeNow()}'
        WHERE id = '${rateId}'`;

        connection.query(sql, function(err, result) {
            if (err) {
                res.json({type: 'Update error', message: err.message})
            }else {
                res.json({type: 'Update success'})
            }
        });
    })

    app.post('/rate/delete_rate/:rate_id', urlencodeParser, function(req, res) {
        const rateId = req.params['rate_id']
        var sql = `DELETE FROM ratings WHERE id = '${rateId}'`;

        connection.query(sql, function(err, result) {
            if (err) {
                res.json({type: 'Delete error', message: err.message})
            }else {
                res.json({type: 'Delete success'})
            }
        });
    })
}