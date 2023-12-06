import express from "express";
import helmet from "helmet";
import cors from "cors";
import mongoose from "mongoose";

import modelCuentas from "./model/cuenta.js";

//crear el web server
const server = express();

//config web server
server.use(express.json());
server.use(cors());
server.use(helmet());

const router = express.Router();

let detalleCta = [];

console.time("test");
const uri =
  "mongodb+srv://KleyDos:MONGOdb@cluster0.epuveci.mongodb.net/BankinApi";
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.timeEnd("test");
    server.listen(3001, function () {
      console.log("El Servidor esta corriendo en puerto 3001");
    });
    //server.listen(puerto, funcion)
  })
  .catch((err) => console.log(err));

// Rutas
router.get("/", function (req, res) {
  console.log("Estoy en la demo (/) ");
  res.send({ mensaje: "Esto es un demo" });
});

router.get("/demo", function (req, res) {
  console.log("Estoy en la ruta demo");
  res.send({ mensaje: "Esto es ruta demo" });
});

router.get("/registro", function (req, res) {
  console.log(detalleCta);
  res.send({ resultado: detalleCta });
});

router.post("/registro", function (req, res) {
  const nombre = req.body.nombre;
  const cuenta = req.body.cuenta;
  const moneda = req.body.moneda;
  const saldo = req.body.saldo;
  // const detalleCta =
  //   "Datos de la Cta" +
  //   " " +
  //   nombre +
  //   " " +
  //   cuenta +
  //   " " +
  //   moneda +
  //   " " +
  //   saldo;
  console.log(detalleCta);
  res.send({ mensaje: detalleCta });
});

router.post("/cuenta/agregarCuenta", function (req, res) {
  const cuentas = req.body.cuentas;
  const cuentaAgrerar = detalleCta.findIndex(
    (detalleCta) => detalleCta.cuenta === cuentas.cuenta
  );
  if (cuentaAgrerar === -1) {
    detalleCta.push(cuentas);
  } else {
    console.log("Cuenta ya existe");
    return res.status(400).send({
      resultado: "La cuenta " + cuentas.cuenta + " ya existe",
    });
  }
  console.log(detalleCta);
  res.send({ resultado: detalleCta });
});

router.post("/cuenta/agregarCuentaDB", async (req, res) => {
  const cuentas = req.body.cuentas;
  const existeCuenta = await modelCuentas.find({
    cuenta: cuentas.cuenta,
  });
  console.log(existeCuenta);
  const detalleCuenta = new modelCuentas(cuentas);
  detalleCuenta
    .save()
    .then((doc) => {
      console.log(doc);
      return res.send({ resultado: true });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).send("Error al guardar");
    });
});
router.post("/resultCta", async (req, res) => {
  const cuenta = req.body.cuenta;
  const resp = await modelCuentas.findOne({ cuenta })

  console.log(resp);
  return res.send(resp);
});

server.use(router);
//iniciar web server
