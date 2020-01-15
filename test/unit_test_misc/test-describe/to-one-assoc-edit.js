module.exports.dog_schema = `
addDog( name: String, breed: String, personId: Int, addOwner: ID!   ): Dog!
updateDog(id: ID!, name: String, breed: String, personId: Int, addOwner: ID!,removeOwner: ID): Dog!
`
