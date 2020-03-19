module.exports.person_schema = `
type Person{
  """
  @original-field
  """
  id: ID

  """
  @original-field
  Indicates the given name for the person
  """
  firstName: String

  """
  @original-field
  Indicates the family name for the person
  """
  lastName: String

  """
  @original-field
  """
  email: String


  """
  @search-request
  """
  dogsFilter(search: searchDogInput, order: [ orderDogInput ], pagination: paginationInput): [Dog]

  """
  @search-request
  """
  dogsConnection(search: searchDogInput, order: [ orderDogInput ], pagination: paginationCursorInput): DogConnection

  """
  @count-request
  """
  countFilteredDogs(search: searchDogInput) : Int

  """
  @search-request
  """
  booksFilter(search: searchBookInput, order: [ orderBookInput ], pagination: paginationInput): [Book]

  """
  @search-request
  """
  booksConnection(search: searchBookInput, order: [ orderBookInput ], pagination: paginationCursorInput): BookConnection

  """
  @count-request
  """
  countFilteredBooks(search: searchBookInput) : Int
}

`

module.exports.person_schema_description_optional = `
type Person{
  """
  @original-field
  """
  id: ID

  """
  @original-field
  """
  firstName: String

  """
  @original-field
  Indicates the family name for the person
  """
  lastName: String

  """
  @original-field
  """
  email: String


  """
  @search-request
  """
  dogsFilter(search: searchDogInput, order: [ orderDogInput ], pagination: paginationInput): [Dog]

  """
  @search-request
  """
  dogsConnection(search: searchDogInput, order: [ orderDogInput ], pagination: paginationCursorInput): DogConnection

  """
  @count-request
  """
  countFilteredDogs(search: searchDogInput) : Int

  """
  @search-request
  """
  booksFilter(search: searchBookInput, order: [ orderBookInput ], pagination: paginationInput): [Book]

  """
  @search-request
  """
  booksConnection(search: searchBookInput, order: [ orderBookInput ], pagination: paginationCursorInput): BookConnection

  """
  @count-request
  """
  countFilteredBooks(search: searchBookInput) : Int
}

`
