module.exports.schema_book = `
type book{
  """
  @original-field
  """
  id: ID

  """
  @original-field
  """
  title: String

  """
  @original-field
  """
  subject: String

  """
  @original-field
  """
  Price: Float

  """
  @original-field
  """
  publisher_id: Int

  publisher(search: searchPubli_sherInput): publi_sher

  """
  @search-request
  """
  authorsFilter(search: searchPersonInput, order: [ orderPersonInput ], pagination: paginationInput): [Person]

  """
  @search-request
  """
  authorsConnection(search: searchPersonInput, order: [ orderPersonInput ], pagination: paginationCursorInput): PersonConnection

  """
  @count-request
  """
  countFilteredAuthors(search: searchPersonInput) : Int
}

`
module.exports.model_book = `
/**
 * constructor - Creates an instance of the model stored in webservice
 *
 * @param  {obejct} input    Data for the new instances. Input for each field of the model.
 */

constructor({
    id,
    title,
    subject,
    Price,
    publisher_id
}) {
    this.id = id;
    this.title = title;
    this.subject = subject;
    this.Price = Price;
    this.publisher_id = publisher_id;
}
`

module.exports.resolvers_book = `
/**
 * book.prototype.publisher - Return associated record
 *
 * @param  {object} search       Search argument to match the associated record
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
book.prototype.publisher = async function({
    search
}, context) {
    if (helper.isNotUndefinedAndNotNull(this.publisher_id)) {
        try {
            if (search === undefined) {
                return resolvers.readOnePubli_sher({
                    [models.publi_sher.idAttribute()]: this.publisher_id
                }, context)
            } else {
                //build new search filter
                let nsearch = helper.addSearchField({
                    "search": search,
                    "field": models.publi_sher.idAttribute(),
                    "value": {
                        "value": this.publisher_id
                    },
                    "operator": "eq"
                });
                let found = await resolvers.publi_shers({
                    search: nsearch
                }, context);
                if (found) {
                    return found[0]
                }
                return found;
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        };
    }
}
`

module.exports.schema_person = `
type Query {
  people(search: searchPersonInput, order: [ orderPersonInput ], pagination: paginationInput ): [Person]
  readOnePerson(id: ID!): Person
  countPeople(search: searchPersonInput ): Int
  vueTablePerson : VueTablePerson    csvTableTemplatePerson: [String]

  peopleConnection(search: searchPersonInput, order: [ orderPersonInput ], pagination: paginationCursorInput ): PersonConnection
}

  type Mutation {
    addPerson( firstName: String, lastName: String, Age: Int,  addCompany: ID, addWorks:[ID]): Person!
  updatePerson(id: ID!, firstName: String, lastName: String, Age: Int, addCompany: ID, removeCompany: ID, addWorks:[ID], removeWorks:[ID]): Person!


deletePerson(id: ID!): String!
bulkAddPersonCsv: [Person] }

`
module.exports.model_person = `
static readById( id ){
  /*
  YOUR CODE GOES HERE
  */
  throw new Error('readOnePerson is not implemented');
}
`

module.exports.resolvers_person = `
/**
 * person.prototype.worksFilter - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Offset and limit to get the records from and to respectively
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of associated records holding conditions specified by search, order and pagination argument
 */
person.prototype.worksFilter = function({
    search,
    order,
    pagination
}, context) {
    try {
        //build new search filter
        let nsearch = helper.addSearchField({
            "search": search,
            "field": "book_id",
            "value": {
                "value": this.getIdValue()
            },
            "operator": "eq"
        });

        return resolvers.books({
            search: nsearch,
            order: order,
            pagination: pagination
        }, context);
    } catch (error) {
        console.error(error);
        handleError(error);
    };
}

`

module.exports.class_name_model_person = `
static get name(){
  return "person";
}

`
