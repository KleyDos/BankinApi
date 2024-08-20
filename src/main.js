import express from "express";
import helmet from "helmet";
import cors from "cors";
import mongoose from "mongoose";

import modelCuentas from "./model/cuenta.js";
import modelTransacciones from "./model/transacciones.js";
import modelTipoCambio from "./model/tipoCambio.js";
import modelUsuarios from "./model/user.js";
import { isMatch } from "date-fns";

// import { format } from "date-fns";
// import { utcToZonedTime } from "date-fns-tz";

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
    server.listen(3002, function () {
      console.log("El Servidor esta corriendo en puerto 3002");
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

router.post("/cuenta/agregarCuentaDB", async (req, res) => {
  try {
    const cuentas = req.body;
    console.log("cuentas", cuentas);
    let nuevaCuenta = null;
    const existeCuenta = await modelCuentas.findOne({
      cuenta: cuentas.cuenta,
    });
    if (existeCuenta) {
      console.log("Cuenta ya existe");
      return res.status(400).send({
        resultado: "La cuenta " + cuentas.cuenta + " ya existe",
      });
    } else {
      nuevaCuenta = new modelCuentas(cuentas);
      console.log("cuentas es:", cuentas);
      const cuentaGuardada = await nuevaCuenta.save();

      console.log("Cuenta guardada:", cuentaGuardada);
    }
    // registro de en la bitacora
    const nuevaTransaccion = new modelTransacciones({
      fecha: new Date(),
      tipo: "Creación de Cuenta",
      detalle: "Creación de cuenta:" + req.body.nombre,
      cuenta: nuevaCuenta._id,
    });
    const transaccionGuardada = await nuevaTransaccion.save();
    console.log("Transaccion guardada:", transaccionGuardada);

    return res.send({ resultado: true });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Error al guardar");
  }
});
//*****Router sin validar que la cta existe */
// router.post("/cuenta/agregarCuentaDB", async (req, res) => {
//   const cuentas = req.body.cuentas;
//   const existeCuenta = await modelCuentas.find({
//     cuenta: cuentas.cuenta,
//   });
//   console.log(existeCuenta);
//   const detalleCuenta = new modelCuentas(cuentas);
//   detalleCuenta
//     .save()
//     .then((doc) => {
//       console.log(doc);
//       return res.send({ resultado: true });
//     })
//     .catch((err) => {
//       console.error(err);
//       return res.status(500).send("Error al guardar");
//     });
// });
router.post("/resultCta", async (req, res) => {
  const cuenta = req.body.cuenta;
  const resp = await modelCuentas.findOne({ cuenta });

  console.log(resp);
  return res.send(resp);
});

router.get("/home/obtenerCuentas", async (req, res) => {
  try {
    const cuentas = await modelCuentas.find();
    res.json(cuentas);
  } catch (error) {
    console.error("Error para obtener cuentas", error);
    return res.status(500).send("Error para obtener cuentas");
  }
});
router.get("/bitacora/obtenerBitacora", async (req, res) => {
  try {
    const bitacora = await modelTransacciones.find();
    // const bitacoraFormateada = bitacora.map((transaccion) => {
    //   const zoneDate = utcToZonedTime(transaccion.fecha, "America/Costa_Rica");
    //   transaccion.fecha = format(zonedDate, "dd/MM/yy HH:mm:ss");
    //   return transaccion;
    // });

    res.json(bitacora);
  } catch (error) {
    console.error("Error para obtener bitacora", error);
    return res.status(500).send("Error para obtener bitacora");
  }
});
router.post("/tipoCambio", async (req, res) => {
  try {
    const { tipoCambioCompra, tipoCambioVenta } = req.body;

    console.log(`Tipos de cambio  ${tipoCambioCompra}: ${tipoCambioVenta}`);
    const existeTipoCambio = await modelTipoCambio.findOne();
    if (existeTipoCambio) {
      existeTipoCambio.tipoCambioCompra = tipoCambioCompra;
      existeTipoCambio.tipoCambioVenta = tipoCambioVenta;
      await existeTipoCambio.save();
      console.log(
        `Tipo de cambio actualizado  ${tipoCambioCompra}: ${tipoCambioVenta}`
      );
      const nuevaTransaccion = new modelTransacciones({
        fecha: new Date(),
        tipo: "Actualización Tipo de Cambio",
        detalle: `Actualización Tipo de Cambio: Compra: ${tipoCambioCompra}, Venta: ${tipoCambioVenta}`,
      });
      await nuevaTransaccion.save();

      res.status(200).send("Tipo de cambio actualizado correctamente");
    } else {
      const newTipoCambio = new modelTipoCambio({
        tipoCambioCompra,
        tipoCambioVenta,
      });

      await newTipoCambio.save();
      console.log(
        `Tipo de cambio guardado para ${tipoCambioCompra}: ${tipoCambioVenta}`
      );
      //////////////
      const nuevaTransaccion = new modelTransacciones({
        fecha: new Date(),
        tipo: "Nuevo Tipo de Cambio",
        detalle: `Se ha guardado un Tipo de Cambio: Tipo de Cambio Compra: ${tipoCambioCompra}, Tipo de Cambio Venta: ${tipoCambioVenta}`,
      });
      await nuevaTransaccion.save();
      res
        .status(200)
        .send({ message: "Tipo de cambio guardado correctamente" });
    }
  } catch (error) {
    console.error("Error al guardar tipo de cambio: ", error);
    res.status(500).send("Error al guardar tipo de cambio");
  }
});

router.get("/obtenerTiposCambio", async (req, res) => {
  try {
    const tipoCambio = await modelTipoCambio.findOne();
    if (!tipoCambio) {
      return res
        .status(500)
        .json({ error: "No se encontraron tipos de cambio" });
    }

    return res.status(200).json(tipoCambio);
  } catch (error) {
    console.error("Error para obtener tipos de cambio", error);
    return res
      .status(500)
      .json({ error: "Error para obtener tipos de cambio" });
  }
});

router.post("/home/trasladarFondos", async (req, res) => {
  const { cuentaOrigenId, cuentaDestinoId, monto } = req.body;

  try {
    const cuentaOrigen = await modelCuentas.findById(cuentaOrigenId);
    console.log("cuentaOrigen es:", cuentaOrigen);

    //El correspondiente a cuentaDestino se realiza de la otra forma ver el await donde hace save------------
    const cuentaDestino = await modelCuentas.findById(cuentaDestinoId);
    console.log("cuentaDestino es:", cuentaDestino);

    // const realizarTraslado = await modelCuentas.find();
    ////Validar saldo de cta, validar misma moneda, utilizar findbyid, devolver error 400
    // console.log(
    //   "Traslado de fondos desde",
    //   cuentaOrigen.nombre,
    //   "a",
    //   cuentaDestino.nombre
    // );

    ///validar fondos de la cuenta origen
    // if (!cuentaOrigen || !cuentaDestino){
    //   return res.status(400).json({message: "Una o ambas cuentas no existe"});
    // }
    if (cuentaOrigen.saldo < monto) {
      console.log("Fondos Insuficientes");
      return res.status(400).send({
        resultado:
          "La cuenta " + cuentas.cuenta + " no dispone de fondos suficientes",
      });

      // return res
      //   .status(500)
      //   .send({ error: "Fondos insuficientes en la cuenta" });
    }
    // console.log("cuentaOrigen.saldo es:", cuentaOrigen.saldo);

    // const montoConvertido = monto * tipoCambio;

    cuentaOrigen.saldo = parseFloat(cuentaOrigen.saldo) - parseFloat(monto);
    // console.log("CuentaOrigen.saldo es", cuetaOrigen.saldo);
    // console.log("monto es", monto);
    cuentaDestino.saldo = parseFloat(cuentaDestino.saldo) + parseFloat(monto);

    // console.log("CuentaDestino.saldo es", cuentaDestino.saldo);

    await cuentaOrigen.save();
    console.log("cuentaOrigen.saldo es:", cuentaOrigen.saldo);

    await cuentaDestino.save();
    console.log("cuentadestino.saldo es:", cuentaDestino.saldo);
    // const cuentaDestino = await modelCuentas.updateOne(
    //   { _id: cuentaDestinoId },
    //   { $inc: { saldo: parseFloat(monto) } }
    // );

    // console.log("cuentaDestino.saldo es:", cuentaDestino._id);

    // registro de en la bitacora
    const nuevaTransaccion = new modelTransacciones({
      fecha: new Date(),
      tipo: "Traslado de fondos",
      detalle:
        "Traslado de fondos de la cuenta: " +
        cuentaOrigen.nombre +
        " a la cuenta: " +
        cuentaDestino.nombre +
        ", Monto: " +
        monto,
      cuenta: cuentaOrigen._id,
    });

    await nuevaTransaccion.save();

    ///Respuesta de traslado exitoso
    return res.status(200).json({ message: "Traslado exitoso" });
  } catch (error) {
    console.error("Error al realizar traslado de fondos", error);
    return res
      .status(500)
      .json({ error: "Error al realizar traslado de fondos" });
  }
});

router.delete("/home/eliminarCuenta/:Id", async (req, res) => {
  try {
    const cuentaId = req.params.Id;

    //Busca la cta
    const cuenta = await modelCuentas.findById(cuentaId);
    console.log("cuenta es:", cuenta);

    //validar cta
    if (!cuenta) {
      return res.status(400).json({ message: "La cuenta no existe" });
    }
    //validar saldo en cero
    if (cuenta.saldo !== 0) {
      return res
        .status(400)
        .json({ message: "La cuenta debe estar en saldo cero para eliminar" });
    }

    await modelCuentas.findByIdAndDelete(cuentaId);
    console.log("cuentaId es:", cuentaId);

    const nuevaTransaccion = new modelTransacciones({
      fecha: new Date(),
      tipo: "Eliminación de Cuenta",
      detalle: "Se ha eliminado la cuenta: " + cuenta.cuenta,
    });

    await nuevaTransaccion.save();
    return res
      .status(200)
      .json({ message: "La cuenta se ha elimidado correctamente" });
  } catch (error) {
    console.error("Error al eliminar la cuenta", error);
    return res.status(500).json({ error: "Error al eliminar la cuenta" });
  }
});
//////
router.post("/home/EditarCuenta", async (req, res) => {
  try {
    const { cuentaId, nuevoNombre, nuevaCuenta, nuevaMoneda } = req.body;
    const cuenta = await modelCuentas.findById(cuentaId);
    if (!cuenta) {
      return res.status(404).json({ message: "La cuenta no existe" });
    }

    cuenta.nombre = nuevoNombre;
    cuenta.cuenta = nuevaCuenta;
    cuenta.moneda = nuevaMoneda;

    await cuenta.save();

    //registrar bitacora
    const nuevaTransaccion = new modelTransacciones({
      fecha: new Date(),
      tipo: "Edicion de cuenta",
      detalle: "Se han editado la cta " + nuevoNombre,
      cuenta: cuentaId,
    });

    await nuevaTransaccion.save();
    return res.status(200).json({ message: "Cuenta editada exitosamente" });
  } catch (error) {
    console.error("Error para obtener cuentas", error);
    return res.status(500).send("Error para obtener cuentas");
  }
});
router.post("/registroUser", async (req, res) => {
  try {
    const { nombre, idUsuario, usuario, contraseña } = req.body;
    const existeUsuario = await modelUsuarios.findOne({ usuario });

    if (existeUsuario) {
      console.log("Usuario ya registrado");
      return res.status(400).send({
        mensaje: `El usuario  ${usuario} +  ya se encuentra registrado`,
      });
    }
    const nuevoUsuario = new modelUsuarios({
      nombre,
      idUsuario,
      usuario,
      contraseña,
    });
    console.log("nuevoUsuario es:", nuevoUsuario);
    await nuevoUsuario.save();

    // registro de en la bitacora
    const nuevaTransaccion = new modelTransacciones({
      fecha: new Date(),
      tipo: "Agregar Usuario",
      detalle: `Se ha creado un nuevo usuario ${usuario}`,
    });
    await nuevaTransaccion.save();

    return res.send({ resultado: true });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Error al registrar usuario");
  }
});
router.post("/login", async (req, res) => {
  try {
    const { usuario, contraseña } = req.body;
    console.log("usuario", usuario);
    console.log("contraseña :>> ", contraseña);
    const usuarioEncontrado = await modelUsuarios.findOne({ usuario });
    console.log("usuarioEncontrado", usuarioEncontrado);

    if (!usuarioEncontrado) {
      console.log("Usuario incorrecto");
      return res.status(400).send({
        mensaje: "Usuario o contraseña incorrectos",
      });
    }

    ///Comparar contraseña///
    usuarioEncontrado.comparePassword(contraseña, (err, isMatch) => {
      if (err) {
        console.err(err);
        return res.status(500).send("Error al comparar contraseñas");
      }
      if (!isMatch) {
        console.log("Contraseña incorrecta");
        return res.status(400).send({
          mensaje: "Usuario o contraseña incorrectos",
        });
      }
      return res.send({ resultado: true });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Error al iniciar sesión");
  }
});

// router.post("/cuenta/agregarCuenta", function (req, res) {
//   const cuentas = req.body.cuentas;
//   const cuentaAgrerar = detalleCta.findIndex(
//     (detalleCta) => detalleCta.cuenta === cuentas.cuenta
//   );
//   if (cuentaAgrerar === -1) {
//     detalleCta.push(cuentas);
//   } else {
//     console.log("Cuenta ya existe");
//     return res.status(400).send({
//       resultado: "La cuenta " + cuentas.cuenta + " ya existe",
//     });
//   }
//   console.log(detalleCta);
//   res.send({ resultado: detalleCta });
// });

server.use(router);
//iniciar web server
