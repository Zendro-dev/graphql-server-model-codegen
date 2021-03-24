module.exports.book_idAttribute = `
static idAttribute() {
  return book.definition.id.name;
}
`;

module.exports.book_idAttributeType = `
static idAttributeType() {
    return book.definition.id.type;
}
`;

module.exports.book_getIdValue = `
getIdValue() {
    return this[book.idAttribute()]
}
`;

module.exports.book_sequelize_primaryKey = `
internalBookId: {
    type: Sequelize[dict['String']],
    primaryKey: true
}
`;
