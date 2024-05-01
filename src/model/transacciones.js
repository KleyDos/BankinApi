import mongoose, { Schema } from "mongoose";

const transacciones = mongoose.Schema(
  {
    fecha: { type: Date, required: true },
    detalle: { type: String, required: true },
    tipo: { type: String, required: true },
    cuenta: { type: String,  },
  },
  {
    collection: "Transacciones",
  }
);

export default mongoose.model("Transacciones", transacciones);
