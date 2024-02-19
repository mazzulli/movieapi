const { response } = require("express");
const knex = require("../database/knex")

class MovieNotesController{

    async index(request,response){
        try {
            const movies = await knex('movie_notes').orderBy('title');
            return response.json(movies);            
        } catch (error) {
            return response.json(error);            
        }
    }
    
    async create(request, response){
        
        try {
            const { title, description, rating, tags } = request.body;
            const { user_id } = request.params;
    
            console.log(user_id)
            console.log(title)
            console.log(description)
            console.log(tags)
                    
            console.log("insert movie notes")
            const [note_id] = await knex('movie_notes').insert({
                title,  
                description,  
                rating,  
                user_id 
            })            
    
            const tagsInsert = tags.map(name => {
                return {
                    note_id,
                    user_id,
                    name
                }
            });    
    
            await knex("movie_tags").insert(tagsInsert);            
            
            response.json();    
        } catch (error) {
            console.log(error)
        }        
    }

    async show(request, response){
        
        const  { id } = request.params;

        try {
            const movieNotes = await knex('movie_notes').where({id}).first();
            const tags = await knex('movie_tags').where({note_id: id}).orderBy('name');

            return response.json({
                ...movieNotes,
                tags
            });
        } catch (error) {
            console.log(error)
        }
        
    }

    async delete(request, response){
        const  { id } = request.params;
        try {
            await knex('movie_notes').where({id}).delete()
            return response.status(204).json();
        } catch (error) {
            
        }

    }
}

module.exports = MovieNotesController;