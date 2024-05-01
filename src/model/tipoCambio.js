import mongoose, { Schema } from "mongoose";

const tipoCambioSchema = mongoose.Schema(
  {
    tipoCambioCompra: { type: Number, required: true },
    tipoCambioVenta: { type: Number, required: true },
  },
  {
    collection: "tipoCambio",
  }
);

export default mongoose.model("tipoCambio", tipoCambioSchema);
