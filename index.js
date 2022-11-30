import express from 'express'
import pg from "pg";

const pool = new pg.Pool();
const app = express()
const port = process.env.PORT || 5000

app.get('/', (req, res)=>{
    console.log(`${req} is asking for connection`)
    res.send("success")
})

app.get('/db', async (req, res)=>{
    const {rows} = await pool.query('SELECT * FROM clinics')
    res.send(rows)
})
app.listen(port, ()=>{
    console.log(`listening on port ${port}`)
})