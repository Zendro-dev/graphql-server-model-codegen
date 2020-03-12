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
  //check valid pagination arguments
  let argsValid = (pagination === undefined) || (pagination.first && !pagination.before && !pagination.last) || (pagination.last && !pagination.after && !pagination.first);
  if (!argsValid) {
    throw new Error('Illegal cursor based pagination arguments. Use either "first" and optionally "after", or "last" and optionally "before"!');
  }
    
  let query = \`query booksConnection($search: searchBookInput $pagination: paginationCursorInput $order: [orderBookInput]){
  booksConnection(search:$search pagination:$pagination order:$order){ edges{cursor node{  id  title
    genre
    publisher_id
  }} pageInfo{ startCursor endCursor hasPreviousPage hasNextPage } } }\`

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

  return adapters[responsibleAdapter[0] ].readById(id).then(result => new Book(result));
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
  //check valid pagination arguments
    let argsValid = (pagination === undefined) || (pagination.first && !pagination.before && !pagination.last) || (pagination.last && !pagination.after && !pagination.first);
    if (!argsValid) {
      throw new Error('Illegal cursor based pagination arguments. Use either "first" and optionally "after", or "last" and optionally "before"!');
    }
    
  let isForwardPagination = !pagination || !(pagination.last != undefined);
    let promises = registry.map(adapter => adapters[adapter].readAllCursor(search, order, pagination));
    let someHasNextPage = false;
    let someHasPreviousPage = false;
    return Promise.all(promises).then(results => {
        return results.reduce((total, current) => {
            someHasNextPage |= current.pageInfo.hasNextPage;
            someHasPreviousPage |= current.pageInfo.hasPreviousPage;
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
        let paginated_records = [];
        if (isForwardPagination) {
            paginated_records = helper.paginateRecordsCursor(ordered_records, pagination.first);
        } else {
            paginated_records = helper.paginateRecordsBefore(ordered_records, pagination.last);
        }
        let hasNextPage = ordered_records.length > pagination.first || someHasNextPage;
        let hasPreviousPage = ordered_records.length > pagination.last || someHasPreviousPage;
        return helper.toGraphQLConnectionObject(paginated_records, this, hasNextPage, hasPreviousPage);
    });
}

`

module.exports.person_ddm_many_association = `
dogsConnectionImpl({search,order,pagination}){
  if(search === undefined)
  {
    return models.dog.readAllCursor({"field" : "personId", "value":{"value":this.getIdValue() }, "operator": "eq"}, order, pagination);
  }else{
    return models.dog.readAllCursor({"operator":"and", "search":[ {"field" : "personId", "value":{"value":this.getIdValue() }, "operator": "eq"} , search] }, order, pagination )
  }
}

`
module.exports.dog_ddm_one_association = `
ownerImpl (search){
    if(search === undefined){
      return models.person.readById(this.personId);
    }else if(this.personId !== null){
      let id_search = {
          "field": models.person.idAttribute(),
          "value": {
            "value": this.personId
          },
          "operator": "eq"
      }

      let ext_search = {
        "operator": "and",
        "search": [id_search, search]
      }

      return models.person.readAllCursor(ext_search)
      .then( found =>{

          if(found.edges.length > 0){
            return  found.edges[0].node;
          }
          return null;
      });

    }
  }
`

module.exports.person_ddm_count_association = `
countFilteredDogsImpl ({search}){

  if(search === undefined)
  {
    return models.dog.countRecords({"field" : "personId", "value":{"value":this.getIdValue() }, "operator": "eq"} );
  }else{
    return models.dog.countRecords({"operator":"and", "search":[ {"field" : "personId", "value":{"value":this.getIdValue() }, "operator": "eq"} , search] })
  }
}
`
