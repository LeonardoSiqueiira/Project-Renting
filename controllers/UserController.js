const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// IMPORTANDO HELPERS
const createUserToken = require('../helpers/create-user-token')
const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')

module.exports = class UserController {
    static async register (req,res) {

        const {name, email, phone, password, confirmpassword} = req.body

        // VALIDAÇÕES
        if(!name){
            res.status(422).json({ message: 'O nome é obrigatorio!'})
            return
        }
        if(!email){
            res.status(422).json({ message: 'O e-mail é obrigatorio!'})
            return
        }
        if(!phone){
            res.status(422).json({ message: 'O telefone é obrigatorio!'})
            return
        }
        if(!password){
            res.status(422).json({ message: 'A senha é obrigatoria!'})
            return
        }
        if(!confirmpassword){
            res.status(422).json({ message: 'A confirmação de senha é obrigatoria!'})
            return
        }
        if(password !== confirmpassword){
            res.status(422).json({ message: 'Senhas divergentes!'})
            return
        }

        // CHECANCO USUARIOS EXISTENTES
        const userExist = await User.findOne({email: email})
        if(userExist) {
            res.status(422).json({message: 'Usuario já cadastrado no sistema!' })
            return
        }

        // CRIAR SENHA CRIPTO
        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(password, salt)

        // CRIAR USUARIO
        const user = new User({
            name,
            email,
            phone,
            password: passwordHash
        })
        try {
            
            const newUser = await user.save()
            await createUserToken(newUser, req, res)

        } catch (error) {
            res.status(500).json({message: error})
        }

    }

    static async login(req,res) {

        const {email, password} = req.body   

        if(!email){
            res.status(422).json({ message: 'O e-mail é obrigatorio!'})
            return
        }
        if(!password){
            res.status(422).json({ message: 'A senha é obrigatoria!'})
            return
        }

        const userLogin = await User.findOne({email: email})

        if(!userLogin) {
            res.status(422).json({message: 'Não há usuario cadastrado com este e-mail!' })
            return
        }

        // CHECANDO SENHA COM BCRYPT
        const checkPassword = await bcrypt.compare(password, userLogin.password)

        if(!checkPassword){
            res.status(422).json({message: 'Senha invalida!' })
            return
        }
        await createUserToken(userLogin, req, res)

 }

        static async checkUser(req,res) {
            let currentUser 

            if(req.headers.authorization){
                const token = getToken(req)
                const decoded = jwt.verify(token, 'nossosecret')
                currentUser = await User.findById(decoded.id)

                currentUser.password = undefined

            }else {
                currentUser = null
            }
            res.status(200).send(currentUser)
        }

        static async getUserById(req,res) {
            const id = req.params.id
            const user = await User.findById(id).select('-password')

            if(!user) {
                res.status(422).json({ message: 'Usuario não encontrado!'})
                return
            }

            res.status(200).json({user})
        }

        static async editUser(req,res) {
            const id = req.params.id

            const token = getToken(req)
            const user = await getUserByToken(token)

            const {name, email, phone, password, confirmpassword} = req.body

            if(req.file) {
                user.image = req.file.filename
            }

            // VALIDACAO DE USUARIOS
            if(!name){
                res.status(422).json({ message: 'O nome é obrigatorio!'})
                return
            }
            user.name = name

            if(!email){
                res.status(422).json({ message: 'O e-mail é obrigatorio!'})
                return
            }
            const userExist = await User.findOne({email: email})

            if(user.email !== email && userExist){
                res.status(422).json({ message: 'Usuario não encontrado, email invalido!'})
                return
            }
            user.email = email

            if(!phone){
                res.status(422).json({ message: 'O telefone é obrigatorio!'})
                return
            }
            user.phone = phone

            if(password != confirmpassword){
                res.status(422).json({ message: 'As senhas não conferem!'})
                return
            } else  if(password === confirmpassword && password != null){

                const salt = await bcrypt.genSalt(12)
                const passwordHash = await bcrypt.hash(password, salt)

                user.password = passwordHash

            }

            try {
                // RETORNO DE USUARIOS ATUALIZADOS
                await User.findOneAndUpdate(
                    {_id: user._id},
                    {$set: user},
                    {new: true}
                )
                res.status(200).json({message: 'Dados atualizados!' })
                
            } catch (error) {
                res.status(500).json({message: error})
                return
            }

        }
}