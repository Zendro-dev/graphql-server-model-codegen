module.exports.book_idAttribute = `
/**
 * idAttribute - Check whether an attribute "internalId" is given in the JSON model. If not the standard "id" is used instead.
 *
 * @return {type} Name of the attribute that functions as an internalId
 */
static idAttribute() {
  return book.definition.id.name;
}
`;

module.exports.book_idAttributeType = `
/**
 * idAttributeType - Return the Type of the internalId.
 *
 * @return {type} Type given in the JSON model
 */
static idAttributeType() {
    return book.definition.id.type;
}
`;

module.exports.book_getIdValue = `
/**
 * getIdValue - Get the value of the idAttribute ("id", or "internalId") for an instance of book.
 *
 * @return {type} id value
 */
getIdValue() {
    return this[book.idAttribute()];
}
`;

module.exports.book_sequelize_primaryKey = `
internalBookId: {
    type: Sequelize[dict['String']],
    primaryKey: true
}
`;
