import express from 'express'

const app = express()
const port = process.env.PORT || 5000

app.get('/', (req, res)=>{
    console.log(`${req} is asking for connection`)
    res.send("success")
})

app.listen(port, ()=>{
    console.log("listening on port")
})