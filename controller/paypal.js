const bodyParser = require("body-parser");
const connection = require("./db");
const mysql = require('mysql');
const urlencodeParser = bodyParser.urlencoded({ extended: false });
require('dotenv').config()
const paypal = require('paypal-rest-sdk');
const nodemailer = require("nodemailer");
const TimeNow = require('./atom');
const pug = require('pug');
const fs = require('fs');

module.exports = function (app) {
  paypal.configure({
    // Email:
    'mode': 'sandbox', //sandbox or live
    'client_id': process.env.CLIENT_ID,
    'client_secret': process.env.CLIENT_SECRET,
  });
  app.post('/pay', urlencodeParser, (req, res) => {
    // let { userId, totalPrice, listIdSelect } = req.body;
    let { userId, total, listId, address } = req.body;
    // let fullAdress = `${address.address} - ${address.city_name} - ${address.district_name} - ${address.ward_name}`;
    let fullAdress = `${address.address} - ${address.ward_name} - ${address.district_name} - ${address.city_name}`;
    let emailUser;
    let dataId = []

    listId.map(item => dataId.push(item));
    const sql = mysql.format(`select quanlity,product_new.product_image,product_new.product_name,product_new.product_price,users.name,users.email from cart JOIN product_new ON cart.product_id = product_new.id INNER JOIN users ON users.id = cart.user_id where user_id = "${userId}" AND product_id IN (?)`, [dataId]);
    connection.query(sql, function (err, result) {
      if (err) throw err;
      let newR = result.map(item => {
        dataPrint = item;
        let { product_name, product_price, quanlity, name, email } = item;
        console.log("email: " + email)
        emailUser = email;
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
          "payment_method": "paypal",
          "payer_info": {
            "shipping_address": {
              "recipient_name": "Tien Nguyen",
              "line1": "1St",
              "city": "San Jose",
              "state": "CA",
              "postal_code": "95131",
              "country_code": "US"
            },
            "country_code": "US"
          }
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
            "total": total,
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
              "total": total
            }
          }]
        };

        paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
          if (error) {
            console.log(error.response);
            throw error;
          } else {
            payment.fullAdress = fullAdress;
            payment.email = emailUser;
            var sql = `select id from cart where user_id = ${userId}`;
            connection.query(sql, function (err, result) {
              if (err) throw err;
              if (result.length > 0) {
                var sqlOrder = `INSERT INTO orders(id_cart,status_order, create_at, update_at) VALUES (${result[0].id},1,'${TimeNow()}','${TimeNow()}')`;
                connection.query(sqlOrder, function (err, result) {
                  if (err) throw err;
                  res.render('index', { data: payment })
                  sendMail(payment);
                })
              }
            })

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
      res.redirect("http://localhost:3005/cart")
    });
    function sendMail(data) {
      console.log("data", data);
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: true,
        host: 'smtp.gmail.com',
        port: 465,
        auth: {
          user: "nvantien222@gmail.com", // generated ethereal user
          pass: "k j i c t g l j e u b p d i z k", // get from app password google
        },
      });

      // send mail with defined transport object   
      let mailOptions = {
        from: "nvantien222@gmail.com", // sender address
        to: data.email, // list of receivers
        subject: "Invoice", // Subject line 
        html: pug.renderFile('D:/React Practice/back-end/views/index.pug', { data }), // html body
      };
      transporter.sendMail(mailOptions, function (error, info) {
        // Preview only available when sending through an Ethereal account
        // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    }
  })
}
