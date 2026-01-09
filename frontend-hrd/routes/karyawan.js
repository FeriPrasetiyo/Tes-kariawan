const express = require("express");
const router = express.Router();
const axios = require("axios");
const auth = require("../middleware/auth");


const API = "http://localhost:3000";

// LIST
router.get("/", auth, async (req, res) => {
  try {
    const { page, search, status, departemen } = req.query;

    const response = await axios.get("http://localhost:3000/karyawan", {
      headers: {
        Authorization: `Bearer ${req.cookies.token}`
      },
      params: {
        page,
        search,
        status,
        departemen
      }
    });

    res.render("karyawan/index", {
  title: "Data Karyawan",
  active: "karyawan",
  data: response.data,
  query: {
    page: Number(page) || 1,
    search: search || "",
    status: status || "",
    departemen: departemen || ""
  }
});

  } catch (error) {
    console.error(error);
    res.redirect("/login");
  }
});


// FORM CREATE
router.get("/create", auth, (req, res) => {
  res.render("karyawan/create");
});

// HANDLE CREATE
router.post("/create", auth, async (req, res) => {
  await axios.post(`${API}/karyawan`, req.body, {
    headers: { Authorization: `Bearer ${req.cookies.token}` }
  });
  res.redirect("/karyawan");
});

// FORM EDIT
router.get("/:id/edit", auth, async (req, res) => {
  try {
    const response = await axios.get(
      `http://localhost:3000/karyawan/${req.params.id}`,
      {
        headers: {
          Authorization: `Bearer ${req.cookies.token}`
        }
      }
    );

    res.render("karyawan/edit", {
      title: "Edit Karyawan",
      active: "karyawan",
      karyawan: response.data.data
    });
  } catch (error) {
    console.error(error);
    res.redirect("/karyawan");
  }
});


// HANDLE UPDATE
router.post("/:id/edit", auth, async (req, res) => {
  await axios.put(`${API}/karyawan/${req.params.id}`, req.body, {
    headers: { Authorization: `Bearer ${req.cookies.token}` }
  });
  res.redirect("/karyawan");
});

// RESIGN
router.post("/:id/resign", auth, async (req, res) => {
  await axios.patch(`${API}/karyawan/${req.params.id}/resign`, {}, {
    headers: { Authorization: `Bearer ${req.cookies.token}` }
  });
  res.redirect("/karyawan");
});

module.exports = router;
