import express, { query } from 'express'
import pg from "pg";
import cors from 'cors';
import clinics from './data2/clinics2.json' assert { type: "json" };
import dentists from './data2/dentists2.json' assert { type: "json" };
import laboratories from './data2/laboratories2.json' assert { type: "json" };
import transfusion from './data2/transfusion2.json' assert { type: "json" };
import pharmacies from './data2/pharmacies2.json' assert { type: "json" };
import opticians from './data2/opticiens2.json' assert { type: "json" };

const connectionString = 'postgresql://postgres:BLsWHcahT5ZglrAxHSvH@containers-us-west-84.railway.app:6529/railway'
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
var search_result = []

app.post('/addRating', async (req, res)=>{
    const {rating, table, id} = req.query
    const nb_rates = await pool.query(`SELECT nb_rates FROM ${table} WHERE id = ${id}`).then((res) => {return res.rows})
    const exRating = await pool.query(`SELECT rating FROM ${table} WHERE id = ${id}`).then((res) => {return res.rows})
    const newRating = (exRating[0].rating+rating)/(nb_rates[0].nb_rates+1)
    await pool.query(`UPDATE ${table} SET rating = ${newRating}, nb_rates = ${nb_rates[0].nb_rates+1} WHERE id = ${id}`).then(() => res.send('done'))
})
app.get("/get_table", async (req, res)=>{
    const {table} = req.query
    await pool.query(`SELECT * FROM ${table};`).then(result=>res.send(result.rows))
})
app.get('/api/get/searchbyfilter',async (req, res) => {
    const {search_query, table} = req.query;
    console.log(table)
    try{
        var tableres = await pool.query(`SELECT id, name, address, phone, rating, st_x(geom) as lng, st_y(geom) as lat FROM ${table}
                    WHERE name ILIKE $1`,[ `%${search_query}%` ]).then(res=>{return res.rows})
    }catch{

    }
    res.json(tableres)
    
  });

app.get('/api/get/searchbybuffer',async (req, res)=>{
    const {buffer, table, center} = req.query;
    var geomc = `POINT(${center.split(',')[1]} ${center.split(',')[0]})`
    console.log(geomc)
    await pool.query(`SELECT id, name, address, phone, rating, st_x(geom) as lng, st_y(geom) as lat FROM ${table} where 
    ST_DWithin(ST_GeomFromText('${geomc}', 4326)::geography, geom::geography,${buffer})`).then(resp=>res.send(resp.rows))
})
app.get('/api/get/search',async (req, res) => {
    const {search_query} = req.query;
    const tables = ['clinics', 'dentists', 'opticians', 'transfusion', 'pharmacies', 'laboratories']
    try {
        
        // get clinics
        var clinics = await pool.query(`SELECT id, name, address, phone, rating, st_x(geom) as lng, st_y(geom) as lat FROM clinics
                WHERE name ILIKE $1`,
      [ `%${search_query}%` ]).then(res=>{return res.rows})
        // get pharmacies
        var pharmacies = await pool.query(`SELECT id, name, address, phone, rating, st_x(geom) as lng, st_y(geom) as lat FROM pharmacies
                WHERE name ILIKE $1`,
      [ `%${search_query}%` ]).then(res=>{return res.rows})
         // get dentists
      var dentists = await pool.query(`SELECT id, name, address, phone, rating, st_x(geom) as lng, st_y(geom) as lat FROM dentists
                WHERE name ILIKE $1`,
      [ `%${search_query}%` ]).then(res=>{return res.rows})
      //get opticians
      var opticians = await pool.query(`SELECT id, name, address, phone, rating, st_x(geom) as lng, st_y(geom) as lat FROM opticians
                WHERE name ILIKE $1`,
      [ `%${search_query}%` ]).then(res=>{return res.rows})
      //get labos
      var laboratories = await pool.query(`SELECT id, name, address, phone, rating, st_x(geom) as lng, st_y(geom) as lat FROM laboratories
                WHERE name ILIKE $1`,
      [ `%${search_query}%` ]).then(res=>{return res.rows})
      //get transfusion
      var transfusion = await pool.query(`SELECT id, name, address, phone, rating, st_x(geom) as lng, st_y(geom) as lat FROM transfusion
                WHERE name ILIKE $1`,
      [ `%${search_query}%` ]).then(res=>{return res.rows})

    res.send({clinics, dentists, opticians, transfusion, pharmacies, laboratories})
    } catch (error) {
        console.log(error)
    }
    
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

