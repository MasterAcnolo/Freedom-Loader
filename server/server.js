http=require("http")


http.createServer((req,res) =>{
    
    res.writeHead(200,{
        "content-type":"text/json"
    })
    res.write('{"nom":"JeanKul","prenom":"TaMere"}')
    res.end()
}).listen(8080,()=>{
    console.log("J'écoute ta grand mère")
})