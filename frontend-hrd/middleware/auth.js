module.exports = function auth(req, res, next) {
  if (!req.cookies.token) {
    return res.redirect("/login");
  }
  next();
};
