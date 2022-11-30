import express from 'express'
import pg from "pg";
import knexPostgis from 'knex-postgis'
import clinics from './DataClinics.json' assert { type: "json" };


const pool = new pg.Pool();
const app = express()
const port = process.env.PORT || 5000

const myclinics = clinics.features
const mydb = require('knex')({
    client: 'pg',
    connection: process.env.DATABASE_URL,
    searchPath: ['knex', 'public'],
  });
  const st = knexPostgis(mydb)
  
app.get('/', (req, res)=>{
    console.log(`${req} is asking for connection`)
    res.send("success")
})

app.get('/db', async (req, res)=>{
    const {rows} = await mydb('clinics').withSchema('public').select('*').where('id', 1)
    res.send(rows)
})

// app.post('/add_element', (req, res)=>{
//     myclinics.forEach((feature)=>{
//                 db('clinics').insert({
//                     name: unicodeToChar(feature.properties.name) ,
//                     address: "adresse" in feature.properties ? feature.properties['adresse'] : "addresse non disponible",
//                     rating: 4,
//                     geom: st.geomFromText(st.asText(st.geomFromGeoJSON(feature.geometry)), 4326),
//                     phone: "phone" in feature.properties ? feature.properties['phone'] : "mobile  non disponible"
//                 }).then(console.log)

//     })
    
//       res.json("success maybe")
// })
app.listen(port, ()=>{
    console.log(`listening on port ${port}`)
})