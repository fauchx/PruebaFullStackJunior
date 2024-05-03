import express from 'express'
import cors from "cors"
import multer from "multer"
import csvToJson from "convert-csv-to-json"

const storage = multer.memoryStorage()
const upload = multer({storage: storage})

const app = express()
const port = process.env.PORT ?? 3000
app.use(cors()) //Enable cors
let userData: Array<Record<string, string>> = []
app.post('/api/files', upload.single('file') ,async(req,res)=>{
    //Extract file from request
    const {file} = req
    //validate that we have file
    if (!file){
        return res.status(500).json({message: "File must be required"})
    }
    //validate the mimetype (csv)
    if (file.mimetype !== 'text/csv') {
        return res.status(500).json({ message: "File must be csv" });
    }
    
    //transform the file to string
    let json: Array<Record<string, string>> = []
    try {
        const rawcsv = Buffer.from(file.buffer).toString('utf-8')
        //string to JSON
        json = csvToJson.fieldDelimiter(",").csvStringToJson(rawcsv)
        
    } catch (error) {
        return res.status(500).json({
            message: "error parsing manito"
        })
    }
    
    //save the json to db
    userData = json
    //return 200
    return res.status(200).json({
        data:json,
        message: "el archivo se cargo completamente"
    })
})

app.get('/api/users', async(req,res)=>{
    //extract the query param q from request
    const {q} = req.query
    //validate we have the query
    if (!q){
        return res.status(500).json({
            message: "Query param q is required"
        }) 
    }
    //validate the q
    if (Array.isArray(q)){
        return res.status(500).json({
            message: "Es un array"
        }) 
    }
    //filter the data from the db
    const search = q.toString().toLowerCase()
    const filteredData = userData.filter(row =>{
        return Object
        .values(row)
        .some(value => value.toLowerCase().includes(search))
    })
    //return 200 with filtered data
    return res.status(200).json({
        data: filteredData
    })
})
app.listen(port, ()=>{
    console.log(`Server listening at http://localhost:${port}`)
})