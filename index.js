import express from 'express'
import pg from "pg";
import knexPostgis from 'knex-postgis'
import knex from 'knex'


const pool = new pg.Pool();
const app = express()
const port = process.env.PORT || 5000
const db = knex('pg')
const st = knexPostgis(db)
app.get('/', (req, res)=>{
    console.log(`${req} is asking for connection`)
    res.send("success")
})

app.get('/db', async (req, res)=>{
    const {rows} = await db('clinics').withSchema('public').select('*').where('id', 1)
    res.send(rows)
})
app.listen(port, ()=>{
    console.log(`listening on port ${port}`)
})