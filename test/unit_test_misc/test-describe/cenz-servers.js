module.exports.server_url = `
  const url = "http://something.other:7000/graphql";
`

module.exports.read_by_id = `
static readById(id) {
  let query = \`query readOneBook{ readOneBook(id: \${id}){id  title genre publisher_id} }\`

  return axios.post(url,{query:query}).then( res => {
    let data = res.data.data.readOneBook;
    return new Book(data);
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
    let data = res.data.data.books;
    return data.map(item => {return new Book(item)});
  }).catch( error =>{
    error['url'] = url;
    handleError(error);
  });

}
`
module.exports.count_records = `
static countRecords(search) {
  let query = \`query countBooks($search: searchBookInput ){
    countBooks(search: $search) }\`

    return axios.post(url, {query:query, variables:{
      search: search
    }}).then( res =>{
      return res.data.data.countBooks;
    }).catch(error =>{
      error['url'] = url;
      handleError(error);
    });
}
`

module.exports.add_one = `
static addOne(input) {
  let query = \`mutation addBook($title:String $genre:String $publisher_id:Int){
    addBook(title:$title genre:$genre publisher_id:$publisher_id){id  title genre publisher_id   }
  }\`;

  return axios.post(url, {query: query, variables: input}).then( res =>{
    let data = res.data.data.addBook;
    return new Book(data);
  }).catch(error =>{
    error['url'] = url;
    handleError(error);
  });
}
`
module.exports.delete_by_id = `
static deleteOne(id) {
  let query = \`mutation deleteBook{ deleteBook(id:\${id})}\`;

  return axios.post(url, {query: query}).then(res =>{
    return res.data.data.deleteBook;
  }).catch(error => {
    error['url'] = url;
    handleError(error);
  });
}
`

module.exports.update_one = `
static updateOne(input) {
  let query = \`mutation updateBook($id:ID! $title:String $genre:String $publisher_id:Int ){
    updateBook(id:$id title:$title genre:$genre publisher_id:$publisher_id  ){id  title genre publisher_id  }
  }\`

  return axios.post(url, {query: query, variables: input}).then(res=>{
    let data = res.data.data.updateBook;
    return new Book(data);
  }).catch(error =>{
    error['url'] = url;
    handleError(error);
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

    axios.post(url, formData,  {
      headers: formData.getHeaders()
    }).then(res =>{
        return res.data.data.bulkAddBookCsv;
      }).catch(error =>{
        error['url'] = url;
        handleError(error);
      });

  }).catch(error =>{
    handleError(error);
  });
}
`

module.exports.many_to_many_association=`
worksFilterImpl({
    search,
    order,
    pagination
}) {
    let association_attributes = models.book.definition.attributes;
    let string_attrib = 'id';
    for(let attrib in association_attributes){
      string_attrib+= ' '+attrib;
    }

    let query = \`query worksFilter($search: searchBookInput $order: [orderBookInput] $pagination: paginationInput){
        readOnePerson(id: \${this.getIdValue()}){ worksFilter(search: $search, order:$order pagination:$pagination){
          \${string_attrib}
        }}
    }\`

    return axios.post(url, {query: query, variables:{ search: search, order: order, pagination: pagination }})
    .then(res =>{

      let data = res.data.data.readOnePerson.worksFilter;

      return data.map(item => {return new models.book(item)});

    }).catch( error =>{
        error['url'] = url;
        handleError(error);
    });
}
`

module.exports.many_to_many_association_count = `
countFilteredWorksImpl({
    search
}) {
    let query = \`query countWorks($search:searchBookInput){readOnePerson(id:\${this.getIdValue()}){ countFilteredWorks(search: $search) } }\`;

    return axios.post(url, {
        query: query,
        variables: {
          search: search
        }
    }).then(res => {
        return res.data.data.readOnePerson.countFilteredWorks;
    }).catch(error => {
      error['url'] = url;
        handleError(error);
    });
}
`
