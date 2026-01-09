const express = require("express");
const axios = require("axios");
const router = express.Router();
const auth = require("../middleware/auth");

const API_URL = "http://localhost:3000"; // backend

// =======================
// LOGIN PAGE
// =======================
router.get("/login", (req, res) => {
  res.render("login");
});

// =======================
// HANDLE LOGIN
// =======================
router.post("/login", async (req, res) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/users/login",
      req.body
    );

    console.log("LOGIN RESPONSE:", response.data); // DEBUG

    res.cookie("token", response.data.token, {
      httpOnly: true
    });

    return res.redirect("/dashboard");
  } catch (error) {
    return res.render("login", { error: "Login gagal" });
  }
});


// DASHBOARD
router.get("/dashboard", auth, async (req, res) => {
  try {
    const { year, departemen } = req.query;

    const response = await axios.get(
      "http://localhost:3000/dashboard/hrd",
      {
        headers: {
          Authorization: `Bearer ${req.cookies.token}`
        },
        params: { year, departemen }
      },
    );
    res.render("dashboard", {
  title: "Dashboard HRD",
  active: "dashboard",
  data: response.data,
  year,
  departemen
});
  } catch (error) {
    res.redirect("/login");
  }
});



router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});




module.exports = router;
