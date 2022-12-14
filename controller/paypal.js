const bodyParser = require("body-parser");
var connection = require("./db");
var mysql = require('mysql');
const urlencodeParser = bodyParser.urlencoded({ extended: false });
require('dotenv').config()
const paypal = require('paypal-rest-sdk');
const { response } = require("express");

module.exports = function (app) {
  paypal.configure({
    // Email:
    'mode': 'sandbox', //sandbox or live
    'client_id': process.env.CLIENT_ID,
    'client_secret': process.env.CLIENT_SECRET,
  });
  app.post('/pay', urlencodeParser, (req, res) => {
    let dataPrint = {}
    let { userId, totalPrice, listIdSelect } = req.body;
    let dataId = []

    listIdSelect.map(item => dataId.push(item));
    const sql = mysql.format(`select quanlity,product_new.product_image,product_new.product_name,product_new.product_price,users.name,users.email from cart JOIN product_new ON cart.product_id = product_new.id INNER JOIN users ON users.id = cart.user_id where user_id = "${userId}" AND product_id IN (?)`, [dataId]);
    connection.query(sql, function (err, result) {
      if (err) throw err;
      let newR = result.map(item => {
        dataPrint = item;
        let { product_name, product_price, quanlity, name, email } = item;
        return {
          "name": `${product_name}`,
          "sku": "001",
          "price": product_price,
          "currency": "USD",
          "quantity": Number(quanlity)
        }
      })
      const create_payment_json = {
        "intent": "sale",
        "payer": {
          "payment_method": "paypal"
        },
        "redirect_urls": {
          "return_url": "http://localhost:8000/success",
          "cancel_url": "http://localhost:8000/cancel"
        },
        "transactions": [{
          "item_list": {
            "items": newR
          },
          "amount": {
            "currency": "USD",
            "total": totalPrice,
          },
          "description": "Hat for the best team ever"
        }]
      };

      app.get('/success', (req, res) => {
        const payerId = req.query.PayerID;
        const paymentId = req.query.paymentId;

        const execute_payment_json = {
          "payer_id": payerId,
          "transactions": [{
            "amount": {
              "currency": "USD",
              "total": totalPrice
            }
          }]
        };

        paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
          if (error) {
            console.log(error.response);
            throw error;
          } else {
            console.log(payment);
            // console.log("payment123", payment)
            // res.send('Success'); 
            // console.log("dataPrint", dataPrint)
            // res.render('index', { ...dataPrint })
            res.render('index', { data: payment })
          }
        });
      });

      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          throw error;
        } else {
          for (let i = 0; i < payment.links.length; i++) {
            if (payment.links[i].rel === 'approval_url') {
              // res.redirect(payment.links[i].href);
              res.json({ forwardLink: payment.links[i].href });
            }
          }
        }
      });

    });

    app.get('/cancel', (req, res) => {
      console.log('cancelling');
      // res.send('Cancelled')
      res.redirect("http://localhost:3006/cart")
    });
  });


}
