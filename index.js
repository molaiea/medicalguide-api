import express from 'express'
import pg from "pg";
// import knexPostgis from 'knex-postgis'
// import knex from 'knex'
import clinics from './DataClinics.json' assert { type: "json" };

const connectionString =
  "postgresql://postgres:BLsWHcahT5ZglrAxHSvH@containers-us-west-84.railway.app:6529/railway";
const pool = new pg.Pool({
    connectionString,
});
const app = express()
const port = process.env.PORT || 5000
const myclinics = clinics.features
// const mypg = knex({
//     client: 'pg',
//     connection: connectionString,
//   });
  
// const mydb = knex({
//     client:'pg',
//     connection: {
//         host: 'containers-us-west-84.railway.app:6529',
//         user: 'postgres',
//         password: 'BLsWHcahT5ZglrAxHSvH',
//         database: 'railway'
//     }
// });

//   const st = knexPostgis(mydb)
app.get('/', (req, res)=>{
    console.log(`${req} is asking for connection`)
    res.send("success")
})

app.get('/db', async (req, res)=>{
    var result = await pool.query("SELECT Find_SRID('public', 'clinics', 'geom');")
    res.json({result})
})

app.post('/delete_all', (req, res)=>{
    pool.query('DELETE FROM clinics WHERE id != -1;')
    pool.query('ALTER SEQUENCE clinics_id_seq RESTART WITH 1')
})
app.post('/add_elements', (req, res)=>{
    myclinics.forEach((feature)=>{
                var address = "adresse" in feature.properties ? feature.properties['adresse'] : "addresse non disponible"
                var phone = "phone" in feature.properties ? feature.properties['phone'] : "mobile  non disponible"
                var geom = feature.geometry
                console.log(geom)
                pool.query(`INSERT INTO clinics(name, address, phone, rating, geom) 
                values('${feature.properties.name}', '${address}', '${phone}', 3, ST_GeomFromGeoJSON('${geom}'));`)
                // db('clinics').insert({
                //     name: unicodeToChar(feature.properties.name) ,
                //     address: "adresse" in feature.properties ? feature.properties['adresse'] : "addresse non disponible",
                //     rating: 4,
                //     geom: st.geomFromText(st.asText(st.geomFromGeoJSON(feature.geometry)), 4326),
                //     phone: "phone" in feature.properties ? feature.properties['phone'] : "mobile  non disponible"
                // }).then(console.log)

    })
    res.send('done')
    })
app.listen(port, ()=>{
    console.log(`listening on port ${port}`)
})