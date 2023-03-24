const Product = require('../models/Product')
const ObjectId = require('mongoose').Types.ObjectId

//IMPORTANDO HELPERS
const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')

module.exports = class ProductController {
    // CRIAÇÃO PRODUTOS
    static async create (req,res) {
        const {name, price, description} = req.body

        const images = req.files

        const available = true

        // UPLOAD DE IMAGENS


        // VALIDAÇÃO 
        if(!name){
            res.status(422).json({message: 'Nome obrigatorio'})
            return
        }
        if(!price){
            res.status(422).json({message: 'Preço obrigatorio'})
            return
        }
        if(!description){
            res.status(422).json({message: 'Descrição obrigatorio'})
            return
        }
        
        if(images.length === 0){
            res.status(422).json({message: 'Imagem obrigatorio'})
            return
        }


        // PEGANDO USER
        const token = getToken(req)
        const user = await getUserByToken(token)

        //CRIAÇÃO PRODUCT
        const product = new Product({
            name,
            price,
            description,
            available,
            images: [],
            user: {
                _id: user._id,
                name: user.name,
                image: user.image,
                phone: user.phone
            }
        })

        images.map((image) => {
            product.images.push(image.filename)
        })

        try {
            const newProduct = await product.save()
            res.status(201).json({message: 'Produto cadastrado com sucesso!', newProduct})
           
            
        } catch (error) {
            res.status(500).json({message: error})
        }
    }

    static async getAll(req,res) {
        const product = await Product.find().sort('-createdAt')
        res.status(200).json({ product: product })
    }

    static async getAllUserProdu(req,res) {
        // PEGANDO TOKEN USER
        const token = getToken(req)
        const user = await getUserByToken(token)

        const product = await Product.find({'user._id': user._id}).sort('createdAt')

        res.status(200).json({product})
    }

    static async getAllRenting (req,res) {
        const token = getToken(req)
        const user = await getUserByToken(token)

        const product = await Product.find({'renting._id': user._id}).sort('createdAt')

        res.status(200).json({product})
    }
    static async getProductById(req,res) {
        const id = req.params.id

        if(!ObjectId.isValid(id)){
            res.status(422).json({message: 'ID invalido!'})
            return
        }

        const product = await Product.findOne({ _id: id })


        if(!product){
            res.status(404).json({message: 'Produto não encontrado!'})
        }

        res.status(200).json({ product: product})

    }
    static async removeProductId(req,res) {
        const id = req.params.id

        // CHECANDO SE O ID É VALIDO
        if(!ObjectId.isValid(id)){
            res.status(422).json({message: 'ID invalido!'})
            return
        }

        // CHECANDO SE O PRODUTO EXISTE
        const product = await Product.findOne({ _id: id })


        if(!product){
            res.status(404).json({message: 'Produto não encontrado!'})
            return
        }

        //CHECANDO SE O USUARIO LOGADO FEZ O REGISTRO

        const token = getToken(req)
        const user = await getUserByToken(token)

        if(product.user._id.toString() !== user._id.toString()) {
            res.status(422).json({message: 'Ocorreu um erro ao processar, tente novamente mais tarde!'})
            return
        }

        await Product.findByIdAndRemove(id)

        res.status(200).json({message: 'Removido com sucesso!'})


    }

    static async updateProduct (req,res) {
        const id = req.params.id

        const {name, price, description, available} = req.body
        const images = req.files

        const updateData = {}

        // VALIDAÇÃO 
        const product = await Product.findOne({ _id: id })

        if(!product){
            res.status(404).json({message: 'Produto não encontrado!'})
            return
        }
        const token = getToken(req)
        const user = await getUserByToken(token)

        if(product.user._id.toString() !== user._id.toString()) {
            res.status(422).json({message: 'Ocorreu um erro ao processar, tente novamente mais tarde!'})
            return
        }
        //VALIDAÇÃO

        if(!name){
            res.status(422).json({message: 'Nome obrigatorio'})
            return
        } else {
            updateData.name = name
        }

        if(!price){
            res.status(422).json({message: 'Preço obrigatorio'})
            return
        } else {
            updateData.price = price
        }

        if(!description){
            res.status(422).json({message: 'Descrição obrigatorio'})
            return
        } else {
            updateData.description = description
        }

        if(images.length === 0){
            res.status(422).json({message: 'Imagem obrigatorio'})
            return
        } else {
            updateData.images = []
            images.map((image) => {updateData.images.push(image.filename)})
        }

        await Product.findByIdAndUpdate(id, updateData)

        res.status(200).json({message: 'Produto atualizado com sucesso!'})


    }
    static async conclude(req,res) {
        
        const id = req.params.id

        const product = await Product.findOne({ _id: id })


        if(!product){
            res.status(404).json({message: 'Produto não encontrado!'})
            return
        }
        const token = getToken(req)
        const user = await getUserByToken(token)

        if(product.user._id.toString() !== user._id.toString()) {
            res.status(422).json({message: 'Ocorreu um erro ao processar, tente novamente mais tarde!'})
            return
        }


        product.available = false

        await Product.findByIdAndUpdate(id, product)

        res.status(200).json({message: 'Alugado com sucesso!'})

    }
}