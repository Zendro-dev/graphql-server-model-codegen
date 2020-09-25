module.exports.add_and_update = `
addAuthor(id: ID!, name: String, lastname: String, email: String, addBooks: [ID]    , skipAssociationsExistenceChecks:Boolean = false): author!
updateAuthor(id: ID!, name: String, lastname: String, email: String, addBooks: [ID], removeBooks: [ID]    , skipAssociationsExistenceChecks:Boolean = false): author!

`

module.exports.resolver_filter_association = `
author.prototype.booksFilter = function({
    search,
    order,
    pagination
}, context){

  let nsearch = helper.addSearchField({
        "search": search,
        "field": models.book.idAttribute(),
        "value": this.book_ids.join(','),
        "valueType": "Array",
        "operator": "in"
    });

  return resolvers.books({
      search: nsearch,
      order: order,
      pagination: pagination
  }, context);
}

`

module.exports.resolver_connection_association = `
author.prototype.booksConnection = function({
    search,
    order,
    pagination
}, context){

  let nsearch = helper.addSearchField({
        "search": search,
        "field": models.book.idAttribute(),
        "value": this.book_ids.join(','),
        "valueType": "Array",
        "operator": "in"
    });

    return resolvers.booksConnection({
        search: nsearch,
        order: order,
        pagination: pagination
    }, context);
}
`

module.exports.resolver_count_association = `
author.prototype.countFilteredBooks = function({search}, context){
  let nsearch = helper.addSearchField({
        "search": search,
        "field":models.book.idAttribute(),
        "value": this.book_ids.join(','),
        "valueType": "Array",
        "operator": "in"
    });
    return resolvers.countBooks({search: nsearch}, context);
}

`

module.exports.resolver_add_association = `
author.prototype.add_books = async function(input, benignErrorReporter){

  //handle inverse association
  let promises = [];
  input.addBooks.forEach( id => {
    promises.push( models.book.add_author_ids( id ,[ this.getIdValue()], benignErrorReporter ) );
  });
  await Promise.all(promises);

  await author.add_book_ids(this.getIdValue(), input.addBooks, benignErrorReporter);
  this.book_ids =  helper.unionIds(this.book_ids, input.addBooks);
}
`

module.exports.resolver_remove_association = `
author.prototype.remove_books = async function(input, benignErrorReporter){

  //handle inverse association
  let promises = [];
  input.removeBooks.forEach( id => {
    promises.push( models.book.remove_author_ids( id ,[ this.getIdValue()], benignErrorReporter ) );
  });
  await Promise.all(promises);

  await author.remove_book_ids(this.getIdValue(), input.removeBooks, benignErrorReporter);
  this.book_ids = helper.differenceIds(this.book_ids, input.removeBooks);
}
`
