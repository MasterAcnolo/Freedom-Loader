http=require("http")


http.createServer((req,res) =>{
    
    res.writeHead(200,{
        "content-type":"text/json"
    })
    res.write('{"nom":"Jean","prenom":"Darme"}')
    res.end()
}).listen(8080,()=>{
    console.log("J'écoute")
})