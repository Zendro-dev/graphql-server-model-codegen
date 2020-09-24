module.exports.schema =
` module.exports = \` type author{
    """
    @original-field
    """
    id: ID
    """
    @original-field

    """
    name: String

    """
    @original-field

    """
    lastname: String

    """
    @original-field

    """
    email: String

    """
    @original-field

    """
    book_ids: [ String ]

    booksFilter(search: searchPost_bookInput, order: [ orderPost_bookInput ], pagination: paginationInput!): [post_book]

    }
type AuthorConnection{
  edges: [AuthorEdge]
  pageInfo: pageInfo!
}

type AuthorEdge{
  cursor: String!
  node: author!
}

  type VueTableAuthor{
    data : [author]
    total: Int
    per_page: Int
    current_page: Int
    last_page: Int
    prev_page_url: String
    next_page_url: String
    from: Int
    to: Int
  }
  enum authorField {
    id
    name
    lastname
    email
    book_ids
  }
  input searchAuthorInput {
    field: authorField
    value: String
    valueType: InputType
    operator: Operator
    search: [searchAuthorInput]
  }

  input orderAuthorInput{
    field: authorField
    order: Order
  }



  type Query {
    authors(search: searchAuthorInput, order: [ orderAuthorInput ], pagination: paginationInput ): [author]
    readOneAuthor(id: ID!): author
    countAuthors(search: searchAuthorInput ): Int
    vueTableAuthor : VueTableAuthor
    csvTableTemplateAuthor: [String]
    authorsConnection(search:searchAuthorInput, order: [ orderAuthorInput ], pagination: paginationCursorInput ): AuthorConnection
  }

  type Mutation {
    addAuthor(id: ID!, name: String, lastname: String, email: String, addBooks: [ID]    , skipAssociationsExistenceChecks:Boolean = false): author!
    updateAuthor(id: ID!, name: String, lastname: String, email: String, addBooks: [ID], removeBooks: [ID]    , skipAssociationsExistenceChecks:Boolean = false): author!
    deleteAuthor(id: ID!): String!
    bulkAddAuthorCsv: String!
  }\`;
`
