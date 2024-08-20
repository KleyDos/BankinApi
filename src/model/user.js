import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const usuarios = mongoose.Schema(
  {
    nombre: { type: String, required: true, unique: true },
    idUsuario: { type: String, required: true },
    usuario: { type: String, required: true, },
    contraseña: { type: String, required: true },
  },
  {
    collection: "Usuarios",
  }
);
///Encriptar///
usuarios.pre("save", async function(next){
  if (!this.isModified("contraseña")){
    return next();
  }
  try{
    const salt = await bcrypt.genSalt(10);
    this.contraseña = await bcrypt.hash(this.contraseña, salt);
    next();
  }catch (eror){
    next(error);
  }
})

////Comparar////
usuarios.methods.comparePassword = function(plainPassword, callback){
  bcrypt.compare(plainPassword, this.contraseña, function(err, isMatch) {
    if (err) {
      return callback (err);
    }
    callback(null, isMatch);
  });
}

export default mongoose.model("Usuarios", usuarios);

