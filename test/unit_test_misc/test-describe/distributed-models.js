module.exports.book_adapter_readById = `
static readById(iri){
  let query = \`query readOneBook{ readOneBook(id: "\${iri}"){id        title
      genre
      publisher_id
} }\`;


  return axios.post(remoteCenzontleURL, {
      query: query
  }).then(res => {
      let data = res.data.data.readOneBook;
      return data;
  }).catch(error => {
      error['url'] = remoteCenzontleURL;
      handleError(error);
  });
}

`

module.exports.book_adapter_count = `
static countRecords(search){
  let query = \`query countBooks($search: searchBookInput){
countBooks(search: $search)
}\`

  return axios.post(remoteCenzontleURL, {
      query: query,
      variables: {
          search: search
      }
  }).then(res => {
      return res.data.data.countBooks;
  }).catch(error => {
      error['url'] = remoteCenzontleURL;
      handleError(error);
  });
}
`

module.exports.book_adapter_read_all = `
static readAllCursor(search, order, pagination){

  if(pagination === undefined || (pagination.first!==undefined || pagination.cursor !== undefined)){

    let query = \`query booksConnection($search: searchBookInput $pagination: paginationCursorInput $order: [orderBookInput]){
  booksConnection(search:$search pagination:$pagination order:$order){ edges{cursor node{  id  title
    genre
    publisher_id
  }} pageInfo{endCursor hasNextPage  } } }\`

    return axios.post(remoteCenzontleURL, {
        query: query,
        variables: {
            search: search,
            order: order,
            pagination: pagination
        }
    }).then(res => {
        return res.data.data.booksConnection;
    }).catch(error => {
        error['url'] = remoteCenzontleURL;
        handleError(error);
    });

  }else{
    throw new Error("Pagination is expected to be cursor based.You need to specify 'cursor' or 'first' parameters.Please check the documentation.");
  }

}
`

module.exports.book_ddm_registry = `
  let registry = ["BooksOne", "BooksTwo"];
`

module.exports.book_ddm_readById = `
static readById(id) {
  if(id!==null){
  let responsibleAdapter = registry.filter( adapter => adapters[adapter].recognizeId(id));

  if(responsibleAdapter.length > 1 ){
    throw new Error("IRI has no unique match");
  }else if(responsibleAdapter.length === 0){
    throw new Error("IRI has no match WS");
  }

  return adapters[responsibleAdapter[0] ].readById(id);
  }
}
`

module.exports.book_ddm_count = `
static countRecords(search) {
  let promises = registry.map( adapter =>  adapters[adapter].countRecords(search));

  return Promise.all(promises).then( results =>{
    return results.reduce( (total, current)=> total+current, 0);
  });

}
`

module.exports.book_ddm_read_all = `
static readAllCursor(search, order, pagination) {

    if (pagination === undefined || (pagination.first !== undefined || pagination.cursor !== undefined)) {

        let promises = registry.map(adapter => adapters[adapter].readAllCursor(search, order, pagination));
        let someHasNextPage = false;
        return Promise.all(promises).then(results => {
            return results.reduce((total, current) => {
                someHasNextPage |=  current.pageInfo.hasNextPage;
                return total.concat(current.edges.map(e => e.node))
            }, []);
        }).then(nodes => {
            if (order === undefined) {
                order = [{
                    field: "id",
                    order: 'ASC'
                }];
            }
            if (pagination === undefined) {
                pagination = {
                    first: Math.min(globals.LIMIT_RECORDS, nodes.length)
                }
            }

            let ordered_records = helper.orderRecords(nodes, order);
            let pagigated_records = helper.paginateRecords(ordered_records, pagination.first);
            let hasNextPage = ordered_records.length > pagination.first || someHasNextPage;
            return helper.toGraphQLConnectionObject(pagigated_records, this, hasNextPage);
        });

    } else {
        throw new Error("Pagination is expected to be cursor based.You need to specify 'cursor' or 'first' parameters.Please check the documentation.");
    }
}

`

module.exports.person_ddm_many_association = `
dogsConnectionImpl({search,order,pagination}){
  if(search === undefined)
  {
    return models.dog.readAllCursor({"field" : "personId", "value":{"value":this.id }, "operator": "eq"}, order, pagination);
  }else{
    return models.dog.readAllCursor({"operator":"and", "search":[ {"field" : "personId", "value":{"value":this.id }, "operator": "eq"} , search] }, order, pagination )
  }
}

`
