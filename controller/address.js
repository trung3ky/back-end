var bodyParser = require("body-parser");
var urlencodeParser = bodyParser.urlencoded({ extended: false });
var parserJson = bodyParser.json();
var connection = require("./db");
const uuid = require("uuid");
const FullAddress = require("../const/address");
var TimeNow = require("./atom");
const fastcsv = require("fast-csv");
const fs = require("fs");
const request = require('request');
const { response } = require("express");
const axios = require('axios');

module.exports = function (app) {
    // API get province
    app.get("/province", function (req, res, next) {
        axios.get('https://online-gateway.ghn.vn/shiip/public-api/master-data/province',
            {
                headers: {
                    Token: "bb0e3863-7d49-11ed-9dc6-f64f768dbc22",
                }
            }
        ).then(({ data }) => res.json(data));
    });

    // API get district
    app.get("/district/:provinceId", function (req, res, next) {
        const provinceId = req.params["provinceId"];
        const body = { province_id: Number(provinceId) };
        axios.post('https://online-gateway.ghn.vn/shiip/public-api/master-data/district', body,
            {
                headers: {
                    Token: "bb0e3863-7d49-11ed-9dc6-f64f768dbc22",
                    'Content-Type': 'application/json',
                }
            }
        ).then(({ data }) => res.json(data));
    });



    app.get("/ward/:districId", function (req, res, next) {
        const district_id = req.params["districId"];
        const body = { district_id: Number(district_id) };
        axios.post('https://online-gateway.ghn.vn/shiip/public-api/master-data/ward', body,
            {
                headers: {
                    Token: "bb0e3863-7d49-11ed-9dc6-f64f768dbc22",
                    'Content-Type': 'application/json',
                }
            }
        ).then(({ data }) => res.json(data));

    });
    app.get("/available-services/user/:userId/shop/:shopId", function (req, res, next) {
        const userId = req.params["userId"];
        const shop_id = req.params["shopId"];
        const sql1 = `select * from address where user_id = ${userId}`;
        const sql2 = `select * from shop LEFT JOIN address ON address.user_id = shop.userId where shop.id = ${shop_id}`;
        let dataResult
        connection.query(sql1, function (err, result1) {
            if (err) {
                throw err;
            }
            connection.query(sql2, async function (err, result2) {
                if (err) throw err;
                if (result2.length > 0) {
                    await axios.post('https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/available-services', {
                        shop_id: Number(shop_id), from_district: Number(result2[0].district), to_district: Number(result1[0].district)
                    },
                        {
                            headers: {
                                Token: "bb0e3863-7d49-11ed-9dc6-f64f768dbc22",
                                'Content-Type': 'application/json',
                            }
                        }
                    ).then(({ data }) => res.json(data));


                } else {
                    res.send([])
                }
            });

        });



    });

    app.get("/fee/:serviceId/user/:userId/shop/:shopId", function (req, res, next) {
        const serviceId = req.params["serviceId"];
        const userId = req.params["userId"];
        const shop_id = req.params["shopId"];
        const sql1 = `select * from address where user_id = ${userId}`;
        const sql2 = `select * from shop LEFT JOIN address ON address.user_id = shop.userId where shop.id = ${shop_id}`;

        connection.query(sql1, function (err, result1) {
            if (err) {
                throw err;
            }
            connection.query(sql2, async function (err, result2) {
                if (err) throw err;
                if (result2.length > 0) {
                    const body = {
                        service_id: Number(serviceId),
                        insurance_value: 500000,
                        coupon: null,
                        from_district_id: Number(result2[0].district),
                        to_district_id: Number(result1[0].district),
                        to_ward_code: "20314",
                        height: 15,
                        length: 15,
                        weight: 1000,
                        width: 15
                    };
                    await axios.post('https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee', body,
                        {
                            headers: {
                                Token: "bb0e3863-7d49-11ed-9dc6-f64f768dbc22",
                                'Content-Type': 'application/json',
                            }
                        }
                    ).then(({ data }) => res.json(data));

                } else {
                    res.send([])
                }
            });

        });





    });


    app.get("/full-address", urlencodeParser, function (req, res) {
        res.send(FullAddress);
    });

    app.get("/address/all/:user_id", function (req, res) {
        const userId = req.params["user_id"];
        let provinceTemp, districtTemp, wardTemp
        var sql = "select * from address where user_id = '" + userId + "' ";
        connection.query(sql, async function (err, result) {
            if (err) throw err;
            let { city, district, ward } = result[0]
            await axios.get('https://online-gateway.ghn.vn/shiip/public-api/master-data/province',
                {
                    headers: {
                        Token: "bb0e3863-7d49-11ed-9dc6-f64f768dbc22",
                    }
                }
            ).then(({ data }) =>
                provinceTemp = data.data);

            // API get district 
            await axios.post('https://online-gateway.ghn.vn/shiip/public-api/master-data/district', { province_id: Number(city) },
                {
                    headers: {
                        Token: "bb0e3863-7d49-11ed-9dc6-f64f768dbc22",
                        'Content-Type': 'application/json',
                    }
                }
            ).then(({ data }) => districtTemp = data.data);
            await axios.post('https://online-gateway.ghn.vn/shiip/public-api/master-data/ward', { district_id: Number(district) },
                {
                    headers: {
                        Token: "bb0e3863-7d49-11ed-9dc6-f64f768dbc22",
                        'Content-Type': 'application/json',
                    }
                }
            ).then(({ data }) => wardTemp = data.data);

            res.send({
                ...result[0],
                city_name: provinceTemp.find(item => item.ProvinceID == city).ProvinceName,
                district_name: districtTemp.find(item => item.DistrictID == district).DistrictName,
                ward_name: wardTemp.find(item => item.WardCode == ward).WardName
            });
        });
    });

    app.post("/address/create-address/:user_id", urlencodeParser, function (req, res) {
        const userId = req.params["user_id"];
        var name = req.body.name;
        var phone = req.body.phone;
        var city = req.body.city;
        var district = req.body.district;
        var ward = req.body.ward;
        var address = req.body.address;

        var sql = `insert into address(user_id, full_name, phone, city, district, ward, address, update_at, create_at) 
        values(${userId}, '${name}', ${phone}, '${city}', '${district}', '${ward}', '${address}', '${TimeNow()}', '${TimeNow()}')`;

        connection.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            res.send({ type: 'OK', message: 'Create address success' });

        });
    });

    app.post("/address/update-address/:user_id", urlencodeParser, function (req, res) {
        const userId = req.params["user_id"];
        var name = req.body.name;
        var phone = req.body.phone;
        var city = req.body.city;
        var district = req.body.district;
        var ward = req.body.ward;
        var address = req.body.address;

        var sql = `UPDATE address SET full_name= '${name}',phone=${phone},city='${city}',district='${district}', ward='${ward}',address='${address}',update_at = '${TimeNow()}' WHERE user_id = ${userId}`;

        console.log("🚀 ~ file: address.js:63 ~ sql", sql)
        connection.query(sql, function (err, result) {
            console.log("🚀 ~ file: address.js:72 ~ result", result)
            if (err) {
                res.json({ type: "Update error", message: err.message });
            } else {
                res.json({ type: "Update success" });
            }
        });
    }
    );
};
