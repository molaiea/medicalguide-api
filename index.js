import express, { query } from 'express'
import pg from "pg";
import cors from 'cors';
import clinics from './data/clinics.json' assert { type: "json" };
import dentists from './data/dentists.json' assert { type: "json" };
import laboratories from './data/laboratories.json' assert { type: "json" };
import transfusion from './data/transfusion.json' assert { type: "json" };
import pharmacies from './data/pharmacies.json' assert { type: "json" };
import opticians from './data/opticiens.json' assert { type: "json" };

const connectionString =
  "postgresql://postgres:BLsWHcahT5ZglrAxHSvH@containers-us-west-84.railway.app:6529/railway";
const pool = new pg.Pool({
    connectionString,
});
const app = express()
app.use(cors())
const port = process.env.PORT || 5000
const myclinics = clinics.features
const mydentists = dentists.features
const myopticians = opticians.features
const mypharmacies = pharmacies.features
const mylaboratories = laboratories.features
const mytranfusion = transfusion.features

app.get('/api/get/searchpost',async (req, res) => {
    const {search_query} = req.query;
    const searchres = await pool.query(`SELECT * FROM clinics
                WHERE name ILIKE $1`,
      [ `%${search_query}%` ])
      res.json(searchres.rows)
  });


app.get('/', (req, res)=>{
    console.log(`${req} is asking for connection`)
    res.send("success")
})

app.get('/db', async (req, res)=>{
    var clinics_res = await (await pool.query("SELECT id, name, address, phone, rating, st_x(geom) as lng, st_y(geom) as lat FROM clinics;")).rows
    var dentists_res = await (await pool.query("SELECT id, name, address, phone, rating, st_x(geom) as lng, st_y(geom) as lat FROM dentists;")).rows
    var opticians_res = await (await pool.query("SELECT id, name, address, phone, rating, st_x(geom) as lng, st_y(geom) as lat FROM opticians;")).rows
    var transfusion_res = await (await pool.query("SELECT id, name, address, phone, rating, st_x(geom) as lng, st_y(geom) as lat FROM transfusion;")).rows
    var pharmacies_res = await (await pool.query("SELECT id, name, address, phone, rating, st_x(geom) as lng, st_y(geom) as lat FROM pharmacies;")).rows
    var laboratories_res = await (await pool.query("SELECT id, name, address, phone, rating, st_x(geom) as lng, st_y(geom) as lat FROM laboratories;")).rows
    res.json({clinics_res, dentists_res, opticians_res, transfusion_res, pharmacies_res, laboratories_res})
})

app.post('/delete_all', (req, res)=>{
    pool.query('DELETE FROM clinics WHERE id != -1;')
    pool.query('ALTER SEQUENCE clinics_id_seq RESTART WITH 1;')
})

app.post('/add_elements_clinics', (req, res)=>{
    myclinics.forEach((feature)=>{
        var address = ("adresse" in feature.properties && feature.properties['adresse'] != "" && feature.properties['adresse'] != "0") ? feature.properties['adresse'].replace("'", "''") : "adresse non disponible"
        var phone = ("phone" in feature.properties && feature.properties['phone'] != "") ? feature.properties['phone'] : "mobile non disponible"
        var geom = `POINT(${feature.geometry.coordinates[0]} ${feature.geometry.coordinates[1]})`
        var name = feature.properties.name.replace("'", "''")
        var query_string = `INSERT INTO clinics(name, address, phone, rating, geom) VALUES('${name}', '${address}', '${phone}', 3, ST_GeomFromText('${geom}', 4326));`
        console.log(name)
        pool.query(query_string)

    })
    res.send('done')
    })

app.post('/add_elements_dentists', (req, res)=>{
    mydentists.forEach((feature)=>{
        var address = ("adresse" in feature.properties && feature.properties['adresse'] != "" && feature.properties['adresse'] != "0") ? feature.properties['adresse'].replace("'", "''") : "adresse non disponible"
        var phone = ("phone" in feature.properties && feature.properties['phone'] != "") ? feature.properties['phone'] : "mobile  non disponible"
        var geom = `POINT(${feature.geometry.coordinates[0]} ${feature.geometry.coordinates[1]})`
        var name = feature.properties.name.replace("'", "''")
        var query_string = `INSERT INTO dentists(name, address, phone, rating, geom) VALUES('${name}', '${address}', '${phone}', 3, ST_GeomFromText('${geom}', 4326));`
        console.log(name)
        pool.query(query_string)

    })
    res.send('done')
    })

app.post('/add_elements_pharmacies', (req, res)=>{
    mypharmacies.forEach((feature)=>{
        var address = ("adresse" in feature.properties && feature.properties['adresse'] != "" && feature.properties['adresse'] != "0") ? feature.properties['adresse'].replace("'", "''") : "adresse non disponible"
        var phone = ("phone" in feature.properties && feature.properties['phone'] != "") ? feature.properties['phone'] : "mobile  non disponible"
        var geom = `POINT(${feature.geometry.coordinates[0]} ${feature.geometry.coordinates[1]})`
        var name = feature.properties.name.replace("'", "''")
        var query_string = `INSERT INTO pharmacies(name, address, phone, rating, geom) VALUES('${name}', '${address}', '${phone}', 3, ST_GeomFromText('${geom}', 4326));`
        console.log(name)
        pool.query(query_string)

    })
    res.send('done')
    })
app.post('/add_elements_transfusion', (req, res)=>{
    mytranfusion.forEach((feature)=>{
        var address = ("adresse" in feature.properties && feature.properties['adresse'] != "" && feature.properties['adresse'] != "0") ? feature.properties['adresse'].replace("'", "''") : "adresse non disponible"
        var phone = ("phone" in feature.properties && feature.properties['phone'] != "") ? feature.properties['phone'] : "mobile  non disponible"
        var geom = `POINT(${feature.geometry.coordinates[0]} ${feature.geometry.coordinates[1]})`
        var name = feature.properties.name.replace("'", "''")
        var query_string = `INSERT INTO transfusion(name, address, phone, rating, geom) VALUES('${name}', '${address}', '${phone}', 3, ST_GeomFromText('${geom}', 4326));`
        console.log(name)
        pool.query(query_string)

    })
    res.send('done')
    })
app.post('/add_elements_opticians', (req, res)=>{
    myopticians.forEach((feature)=>{
        var address = ("adresse" in feature.properties && feature.properties['adresse'] != "" && feature.properties['adresse'] != "0") ? feature.properties['adresse'].replace("'", "''") : "adresse non disponible"
        var phone = ("phone" in feature.properties && feature.properties['phone'] != "") ? feature.properties['phone'] : "mobile  non disponible"
        var geom = `POINT(${feature.geometry.coordinates[0]} ${feature.geometry.coordinates[1]})`
        var name = feature.properties.name.replace("'", "''")
        var query_string = `INSERT INTO opticians(name, address, phone, rating, geom) VALUES('${name}', '${address}', '${phone}', 3, ST_GeomFromText('${geom}', 4326));`
        console.log(name)
        pool.query(query_string)

    })
    res.send('done')
    })
app.post('/add_elements_laboratories', (req, res)=>{
    mylaboratories.forEach((feature)=>{
        var address = ("adresse" in feature.properties && feature.properties['adresse'] != "" && feature.properties['adresse'] != "0") ? feature.properties['adresse'].replace("'", "''") : "adresse non disponible"
        var phone = ("phone" in feature.properties && feature.properties['phone'] != "") ? feature.properties['phone'] : "mobile  non disponible"
        var geom = `POINT(${feature.geometry.coordinates[0]} ${feature.geometry.coordinates[1]})`
        var name = feature.properties.name.replace("'", "''")
        var query_string = `INSERT INTO laboratories(name, address, phone, rating, geom) VALUES('${name}', '${address}', '${phone}', 3, ST_GeomFromText('${geom}', 4326));`
        console.log(name)
        pool.query(query_string)

    })
    res.send('done')
    })
app.listen(port, ()=>{
    console.log(`listening on port ${port}`)
})

