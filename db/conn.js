const mongoose = require('mongoose')

async function main(){
    await mongoose.connect('')
    console.log("Conactado ao Banco!")
}


main().catch((err) => console.log(err))

module.exports = mongoose
