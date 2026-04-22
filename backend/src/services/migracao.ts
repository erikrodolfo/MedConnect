import Usuario from "../models/Usuario"
import mongoose from "mongoose"

export async function buscarPacientesAntigos() {
const pacientesAntigos = await Usuario.find({
  cidade: {
    $exists: false
  }
})
}