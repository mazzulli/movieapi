const { Router } = require("express");

const tagsRoutes = Router()

tagsRoutes.get("/", (request, response)=>{
    response.send("Tags routes.")
})

module.exports = tagsRoutes;