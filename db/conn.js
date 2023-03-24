const mongoose = require('mongoose')

async function main(){
    await mongoose.connect('mongodb+srv://leonardo:123@node-aula.62yuo64.mongodb.net/PROJNODE?retryWrites=true&w=majority')
    console.log("Conactado ao Banco!")
}


main().catch((err) => console.log(err))

module.exports = mongoose