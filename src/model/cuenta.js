import mongoose, { Schema } from "mongoose";

const cuentas = mongoose.Schema(
  {
    cuenta: { type: String, required: true,unique: true },
    nombre: { type: String, required: true },
    moneda: { type: String, required: true },
    saldo: {
      type: Number,
      required: true,
    },
  },
  {
    collection: "Cuentas",
  }
);

export default mongoose.model("Cuentas", cuentas);


//No se puede en un mismo file
// const transacciones = mongoose.Schema(
//   {
//     fecha: { type: Date, required: true },
//     detalle: { type: String, required: true },
//     tipo: { type: String, required: true },

//   },
//   {
//     collection: "Transacciones",
//   }
// );

// export default mongoose.model("Cuentas", cuentas,"Transacciones", transacciones);
