import mongoose from "mongoose";

const cuentas = mongoose.Schema(
  {
    cuenta: { type: String, required: true, unique: true },
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
