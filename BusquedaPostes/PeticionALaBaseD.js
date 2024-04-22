const { MongoClient } = require('mongodb');

const uri = process.env['BaseDeDatosBusquedaPostes']
const client = new MongoClient(uri);

async function obtenerPostePorId(id) {
    try {
        await client.connect();
        const db = client.db("sample_mflix");
        const collection = db.collection('BuscadorDePostes');
        const poste = await collection.findOne({ _id: id });
        console.log("Poste encontrado:", poste);
      return poste;
    } catch (e) {
        console.error("Error al obtener el poste:", e);
    } finally {
        await client.close();
    }
}

module.exports = { obtenerPostePorId };
