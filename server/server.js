const PORT_LISTEN = 8080

http=require("http")


http.createServer((req,res) =>{
    
    res.writeHead(200,{
        "content-type":"text/json"
    })
    res.write('{"nom":"Jean","prenom":"Darme"}')
    res.end()
}).listen(PORT_LISTEN,()=>{
    console.log("Je suis allumé 😊 et j'écoute sur le port " + PORT_LISTEN)
                                             
})