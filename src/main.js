import express from "express";


router.get("/registro", function (req, res) {
  console.log(detalleCta);
  res.send({ resultado: detalleCta });
});
