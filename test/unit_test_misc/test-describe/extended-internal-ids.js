module.exports.book_idAttribute = `
static idAttribute() {
  return Book.definition.id.name;
}
`

module.exports.book_idAttributeType = `
static idAttributeType() {
    return Book.definition.id.type;
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
