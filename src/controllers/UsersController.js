const AppError = require("../utils/AppError")
const sqliteConnection = require('../database/sqlite')
const { hash, compare } = require('bcrypt');
const { application } = require("express");


class UsersController {
    
    /**
     * index - GET para listar vários registros
     * show - GET para exibir um registro especifico
     * create - POST para criar um registro
     * update - PUT para atualizar um registro
     * delete- DELETE para excluir um registro
     */
    
    async index(request, response){
        try {
            const database = await sqliteConnection();
            const listUsers = await database.all('SELECT * FROM users')
            response.status(200).json(listUsers)
        } catch (error) {
            throw new AppError("Ops! Encontramos um erro... " + error, 500)
        }
        
    }

    async create(request, response){
        const { name, email, password } = request.body
        
        if(!name){
            throw new AppError("Nome é obrigatório!", 400)
        }    
        if(!email){
            throw new AppError("Email é obrigatório!", 400)
        }    
        if(!password){
            throw new AppError("A senha é obrigatória!", 400)
        }    
        
        const hashedPassword = await hash(password, 8) //Gera a senha com hash de 8 bits
        
        const database = await sqliteConnection();

        const  userAlreadyExists = await database.get(`
            SELECT id FROM users WHERE email = ?`, [email])

        if(userAlreadyExists){
            throw new AppError("Usuário já cadastrado!", 400)
        }
        
        await database.run(`
        INSERT INTO users (name, email, password) VALUES(?,?,?)`, [name, email, hashedPassword]);
        
        return response.status(201).json({name, email, password})
        
    }

    async update(request, response){
        const { name, email, password, old_password } = request.body
        const { id } = request.params

        if(!name){
            throw new AppError("Nome é obrigatório!", 400)
        }    
        if(!email){
            throw new AppError("Email é obrigatório!", 400)
        }    
      
        const database = await sqliteConnection();
        const user = await database.get(`SELECT * FROM users WHERE id=(?)`, [id])

        if(!user){
            throw new AppError("Usuário não encontrado!")
        }

        const userEmailAlreadyExists = await database.get(`SELECT * FROM users WHERE email = (?)`, [email])
        
        if(userEmailAlreadyExists && userEmailAlreadyExists.id !== user.id){            
            throw new AppError("Este e-mail já está em uso!", 400)
        }
        
        if(password && !old_password){ 
            throw new AppError("A senha antiga precisa ser informada para poder definir a nova senha.")
        }

        user.name = name ?? user.name;
        user.email = email ?? user.email;

        const compareHash = await compare(old_password, user.password);

        if(!compareHash){
            throw new AppError("A senha atual informada é incorreta!", 401)
        }

        const hashedPassword = await hash(password,8)

        await database.run(`
        UPDATE users SET 
        name=?, 
        email=?,
        password=?,
        updated_at=DATETIME('now')
        WHERE id =?`, 
        [name, email, hashedPassword, id ]);
        
        return response.status(200).json()        
    }

    async delete(request, response){
        const { id } = request.params;

        try {
            const database = await sqliteConnection();
            
            await database.run(`
            DELETE FROM users WHERE id =?`, 
            [id]);
            
            return response.status(200).json()                 
        } catch (error) {
            return response.json(error)                 
        }
    }
}

module.exports = UsersController;