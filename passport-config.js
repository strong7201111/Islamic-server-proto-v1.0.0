const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

function initialize(passport, getUserByEmail, getUserByID) {
  //
  const authenticateUser = async (email, password, done) => {
    const data = await getUserByEmail(email);
    const user = data["rows"]["0"];

    if (user == null) {
      return done(null, false, { message: "لا يوجد مستخدم بهذا الإيميل" });
    }

    try {
      const userPassword = user["password"];
      if (await bcrypt.compare(password, userPassword)) {
        return done(null, user);
      } else {
        return done(null, false, { message: "كلمة السر غير صحيحة" });
      }
    } catch (error) {
      return done(error);
    }
  };

  passport.use(new localStrategy({ usernameField: "email" }, authenticateUser));
  passport.serializeUser((user, done) => done(null, user["user_id"]));
  passport.deserializeUser(async (id, done) => {
    const data = await getUserByID(id);
    const user = data["rows"]["0"];

    done(null, user);
  });
}

module.exports = initialize;
