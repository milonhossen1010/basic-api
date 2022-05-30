import { createServer } from "http";
import { config } from "dotenv";
import { readFileSync, writeFileSync } from "fs";
import { findLastId } from "./utility/functions.js";

//environment init
config();
const PORT = process.env.SERVER_PORT;  

//Data management
const students_json = readFileSync("./data/students.json");
const students_obj = JSON.parse(students_json);


//create server
createServer( (req, res) => {


   

    if(req.url == "/api/students" && req.method == "GET"){

        res.writeHead(200, { "content-type" : "application/json" });
        res.write(students_json);
        res.end();

    }else if(req.url.match(/\/api\/students\/[0-9]{1,}/) && req.method == "GET"){

        const id = req.url.split("/")[3];
 
        if(students_obj.some( stu => stu.id == id)){
            res.writeHead(200, { "content-type" : "application/json" });
            res.write(JSON.stringify(students_obj.find( stu => stu.id == id )));
            res.end();
        }else {
            res.writeHead(200, { "content-type" : "application/json" });
            res.write(JSON.stringify({ "message" : "Student not found" }));
            res.end();
        }

        

    }else if(req.url.match(/\/api\/students\/[0-9]{1,}/) && req.method == "DELETE"){
        
        const id = req.url.split("/")[3];

        writeFileSync("./data/students.json", JSON.stringify(students_obj.filter( stu => stu.id != id )))
        res.writeHead(200, { "content-type" : "application/json" });
        res.write(JSON.stringify({ "message" : "Student delete successful" }));
        res.end();

    }else if(req.url.match(/\/api\/students\/[0-9]{1,}/) && req.method == "PUT" || req.url.match(/\/api\/students\/[0-9]{1,}/) && req.method == "PATCH"){
        
        const id = req.url.split("/")[3];

        const index = students_obj.findIndex( stu => stu.id == id);
        
        if( students_obj.some( stu => stu.id == id ) ){

            let data = "";
            req.on("data", (chunk) => {
                data += chunk.toString();
            });
            req.on("end", () => {
                let update_obj = JSON.parse(data);

                students_obj[index]={...update_obj}

                writeFileSync("./data/students.json", JSON.stringify(students_obj) );

            });

          

            res.writeHead(200, { "content-type" : "application/json" });
            res.write(JSON.stringify({ "message" : "Student updated successful" }));
            res.end();
        }else{
            res.writeHead(200, { "content-type" : "application/json" });
            res.write(JSON.stringify({ "message" : "No data found." }));
            res.end();
        }
      
        

    }else if(req.url == "/api/students" && req.method == "POST"){

        // Req data handle
        let data = "";
        req.on("data", (chunk) => {
            data += chunk.toString();

        } );

       
        req.on("end", () => {
            let { name, skill, age, location } = JSON.parse(data);

            students_obj.push({
                id : findLastId(students_obj),
                name : name,
                skill: skill,
                age: age,
                location : location
            });
            
            writeFileSync("./data/students.json", JSON.stringify(students_obj));

        });


        res.writeHead(200, { "content-type" : "application/json" });
        res.write(JSON.stringify({ "message" : "New student added successful." }));
        res.end();


    }else {
        res.writeHead(200, { "content-type" : "application/json" });
        res.write(JSON.stringify({"error" : "Invalid"}));
        res.end();
    }

    


} ).listen(PORT, () => {
    console.log("Server running ...");
});