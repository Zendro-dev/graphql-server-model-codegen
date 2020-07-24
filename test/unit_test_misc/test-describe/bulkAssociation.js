module.exports.bulkAssociation_schema_mutation = `
type Mutation {                                                                                                                                                                                                  
  addBook(internalBookId: ID!, title: String, genre: String , addAuthor:ID   , skipAssociationsExistenceChecks:Boolean = false): Book!                                                                           
  updateBook(internalBookId: ID!, title: String, genre: String , addAuthor:ID, removeAuthor:ID    , skipAssociationsExistenceChecks:Boolean = false): Book!                                                      
  deleteBook(internalBookId: ID!): String!                                                                                                                                                                       
  bulkAddBookCsv: String!                                                                                                                                                                                        
  bulkAssociateBookWithPerson(bulkAssociationInput: [bulkAssociationBookWithPersonInput], skipAssociationsExistenceChecks:Boolean = false): String!                                                              
  bulkDisAssociateBookWithPerson(bulkAssociationInput: [bulkAssociationBookWithPersonInput], skipAssociationsExistenceChecks:Boolean = false): String!                                                           
} 
`

module.exports.bulkAssociation_schema_inputType = `
input bulkAssociationBookWithPersonInput{
  internalBookId: ID!
  internalPersonId: ID!
}
`