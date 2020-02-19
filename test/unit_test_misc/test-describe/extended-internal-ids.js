module.exports.book_idAttribute = `
static idAttribute() {
    let internalId = Book.definition.internalId === undefined ? "id" : Book.definition.internalId;
    let idType = Book.definition.attributes[internalId];

    if(internalId !== "id") {
      if(idType === undefined) {
        return new Error(\`Attribute \${internalId} does not exist\`)
      }
      if(!(idType === "String" || idType === "Int" || idType === "Float")) {
        return new Error(\`Attribute \${internalId} must be of Type String, Int or Float\`)
      }
    }
    
    return internalId; 
  }
`

module.exports.book_idAttributeType = `
static idAttributeType() {
    return Book.definition.attributes[this.idAttribute()];
}
`

module.exports.book_getIdValue = `
getIdValue() {
    return this[Book.idAttribute()]
}
`

module.exports.book_sequelize_primaryKey= `
internalBookId: {                                                                                                                                                                                      
    type: Sequelize[dict['String']],                                                                                                                                                                   
    primaryKey: true                                                                                                                                                                                   
}
`
