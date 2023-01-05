// Connect with Sequelize
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('ecommerce', 'root', '', {
  host: 'localhost',
  dialect: 'mysql'
});


sequelize.authenticate()
  .then(() => {
    console.log("thành công")
  })
// const db = {};

// db.Sequelize = Sequelize;
// db.sequelize = sequelize;

// db.user = require("../model/user")(sequelize, Sequelize);
// db.cart = require("../model/cart")(sequelize, Sequelize);

// db.user.hasMany(db.cart, { as: "carts" });
// db.cart.belongsTo(db.user, {
//   foreignKey: "user_id",
//   as: "user",
// });
module.exports = sequelize;