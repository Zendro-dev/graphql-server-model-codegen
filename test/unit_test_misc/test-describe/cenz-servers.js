module.exports.server_url = `
  const url = "http://something.other:7000/graphql";
`

module.exports.read_by_id = `
static readById(id) {
  let query = \`query readOneBook{ readOneBook(id: "\${id}"){id  title genre publisher_id} }\`

  return axios.post(url,{query:query}).then( res => {
    //check
    if(res&&res.data&&res.data.data) {
      let item = new Book(res.data.data.readOneBook);
      return validatorUtil.ifHasValidatorFunctionInvoke('validateAfterRead', this, item)
          .then((valSuccess) => {
              return item
          })
    } else {
      throw new Error(\`Invalid response from remote cenz-server: \${url}\`);
    }
  }).catch( error =>{
    error['url'] = url;
    handleError(error);
  });
}
`

module.exports.read_all = `
static readAll(search, order, pagination) {
  let query = \`query
  books($search: searchBookInput $pagination: paginationInput $order: [orderBookInput] )
 {books(search:$search pagination:$pagination order:$order){id title genre publisher_id } }\`

 return axios.post(url,{query:query, variables: {
   search: search,
   order: order,
   pagination: pagination
 }}).then( res => {
    //check
    if(res&&res.data&&res.data.data) {
      let data = res.data.data.books;
      return data.map(item => {return new Book(item)});
    } else {
      throw new Error(\`Invalid response from remote cenz-server: \${url}\`);
    }
  }).catch( error =>{
    error['url'] = url;
    handleError(error);
  });

}
`
module.exports.count_records = `
static countRecords(search) {
        let query = \`query countBooks($search: searchBookInput){
      countBooks(search: $search)
    }\`

        return axios.post(url, {
            query: query,
            variables: {
                search: search
            }
        }).then(res => {
            return {
                sum: res.data.data.countBooks,
                errors: []
            };
        }).catch(error => {
            error['url'] = url;
            handleError(error);
        });
    }
`

module.exports.add_one = `

static addOne(input) {
  return validatorUtil.ifHasValidatorFunctionInvoke('validateForCreate', this, input)
      .then(async (valSuccess) => {
  let query = \`mutation addBook($title:String $genre:String){
    addBook(title:$title genre:$genre){id  title genre publisher_id   }
  }\`;

  return axios.post(url, {query: query, variables: input}).then( res =>{
    //check
    if (res && res.data && res.data.data) {
        return new Book(res.data.data.addBook);
    } else {
      throw new Error(\`Invalid response from remote cenz-server: \${url}\`);
    }
  }).catch(error =>{
    error['url'] = url;
    handleError(error);
  });
});
}
`
module.exports.delete_by_id = `
static deleteOne(id) {
  let query = \`mutation deleteBook{ deleteBook(id: "\${id}" )}\`;

  return axios.post(url, {query: query}).then(res => {
      //check
      if (res && res.data && res.data.data) {
          return res.data.data.deleteBook;
      } else {
          throw new Error(\`Invalid response from remote cenz-server: \${url}\`);
      }
  }).catch(error => {
      error['url'] = url;
      handleError(error);
  });
}

`

module.exports.update_one = `

static updateOne(input) {
  return validatorUtil.ifHasValidatorFunctionInvoke('validateForUpdate', this, input)
      .then(async (valSuccess) => {
      let query = \`mutation updateBook($id:ID! $title:String $genre:String){
        updateBook(id:$id title:$title genre:$genre){id  title genre publisher_id  }
      }\`

      return axios.post(url, {query: query, variables: input}).then(res=>{
        //check
        if (res && res.data && res.data.data) {
            return new Book(res.data.data.updateBook);
        } else {
          throw new Error(\`Invalid response from remote cenz-server: \${url}\`);
        }
      }).catch(error =>{
        error['url'] = url;
        handleError(error);
      });
    });
}
`

module.exports.csv_template = `
static csvTableTemplate() {
    let query = \`query {csvTableTemplateBook}\`;
    return axios.post(url, {query: query}).then(res =>{
      return res.data.data.csvTableTemplateBook;
    }).catch(error =>{
      error['url'] = url;
      handleError(error);
    });
}
`
module.exports.bulk_add_csv = `
static bulkAddCsv(context) {
  let tmpFile = path.join(os.tmpdir(), uuidv4()+'.csv');

  return context.request.files.csv_file.mv(tmpFile).then(() =>{
    let query = \`mutation {bulkAddBookCsv{id}}\`;
    let formData = new FormData();
    formData.append('csv_file', fs.createReadStream(tmpFile));
    formData.append('query', query);

    return axios.post(url, formData,  {
      headers: formData.getHeaders()
    }).then(res =>{
        return res.data.data.bulkAddBookCsv;
      });

  }).catch(error =>{
    error['url'] = url;
    handleError(error);
  });
}
`

module.exports.many_to_many_association=`
const definition = {
    model: 'Person',
    storageType: 'cenz-server',
    url: 'http://something.other:7000/graphql',
    attributes: {
        firstName: 'String',
        lastName: 'String',
        email: 'String',
        companyId: 'Int'
    },
    associations: {
        works: {
            type: 'to_many',
            target: 'Book',
            targetKey: 'bookId',
            sourceKey: 'personId',
            keysIn: 'books_to_people',
            targetStorageType: 'cenz-server',
            label: 'title',
            name: 'works',
            name_lc: 'works',
            name_cp: 'Works',
            target_lc: 'book',
            target_lc_pl: 'books',
            target_pl: 'Books',
            target_cp: 'Book',
            target_cp_pl: 'Books',
            holdsForeignKey: false
        },
        company: {
            type: 'to_one',
            target: 'publi_sher',
            targetKey: 'companyId',
            keyIn: 'Person',
            targetStorageType: 'webservice',
            name: 'company',
            name_lc: 'company',
            name_cp: 'Company',
            target_lc: 'publi_sher',
            target_lc_pl: 'publi_shers',
            target_pl: 'publi_shers',
            target_cp: 'Publi_sher',
            target_cp_pl: 'Publi_shers',
            keyIn_lc: 'person',
            holdsForeignKey: true
        }
    },
    id: {
        name: 'id',
        type: 'Int'
    }
};
`

module.exports.many_to_many_association_count = `
static countRecords(search) {
        let query = \`query countPeople($search: searchPersonInput){
      countPeople(search: $search)
    }\`

        return axios.post(url, {
            query: query,
            variables: {
                search: search
            }
        }).then(res => {
            return {
                sum: res.data.data.countPeople,
                errors: []
            };
        }).catch(error => {
            error['url'] = url;
            handleError(error);
        });
    }
`

module.exports.add_personId = `
/**
 * add_personId - field Mutation (adapter-layer) for to_one associationsArguments to add
 *
 * @param {Id}   id   IdAttribute of the root model to be updated
 * @param {Id}   personId Foreign Key (stored in "Me") of the Association to be updated.
 */
static add_personId(id, personId) {
  let query = \`
      mutation
        updateDog{
          updateDog(
            id:"\${id}"
            addOwner:"\${personId}"
          ){
            id                  personId                }
        }\`
  return axios.post(url, {
      query: query
  }).then(res => {
      //check
      if (res && res.data && res.data.data) {
          return new Dog(res.data.data.updateDog);
      } else {
          throw new Error(\`Invalid response from remote cenz-server: \${url}\`);
      }
  }).catch(error => {
      error['url'] = url;
      handleError(error);
  });
}
`
module.exports.remove_personId = `
/**
 * remove_personId - field Mutation (adapter-layer) for to_one associationsArguments to remove
 *
 * @param {Id}   id   IdAttribute of the root model to be updated
 * @param {Id}   personId Foreign Key (stored in "Me") of the Association to be updated.
 */
static remove_personId(id, personId) {
  let query = \`
      mutation
        updateDog{
          updateDog(
            id:"\${id}"
            removeOwner:"\${personId}"
          ){
            id                  personId                }
        }\`
  return axios.post(url, {
      query: query
  }).then(res => {
      //check
      if (res && res.data && res.data.data) {
          return new Dog(res.data.data.updateDog);
      } else {
          throw new Error(\`Invalid response from remote cenz-server: \${url}\`);
      }
  }).catch(error => {
      error['url'] = url;
      handleError(error);
  });
}
`
