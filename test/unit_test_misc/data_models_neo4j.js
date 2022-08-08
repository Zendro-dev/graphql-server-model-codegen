module.exports.movie = {
  model: "movie",
  storageType: "neo4j",
  attributes: {
    movie_id: "String",
    release: "DateTime",
    runtime: "Int",
    box_office: "Float",
    is_adult: "Boolean",
    genres: "[String]",
    votes: "[Int]",
    director_id: "String",
    actor_ids: "[String]",
  },
  associations: {
    director: {
      type: "many_to_one",
      implementation: "foreignkeys",
      target: "director",
      targetKey: "director_id",
      keysIn: "movie",
      targetStorageType: "neo4j",
      label: "director_name",
    },
    actor: {
      type: "many_to_many",
      implementation: "foreignkeys",
      target: "actor",
      targetKey: "movie_ids",
      sourceKey: "actor_ids",
      keysIn: "movie",
      targetStorageType: "neo4j",
    },
    unique_review: {
      type: "one_to_one",
      implementation: "foreignkeys",
      target: "review",
      targetKey: "movie_id",
      keysIn: "tracker",
      targetStorageType: "neo4j",
    },
  },
  internalId: "movie_id",
};

module.exports.dist_movie_instance1 = {
  model: "dist_movie",
  storageType: "neo4j-adapter",
  adapterName: "dist_movie_instance1",
  regex: "instance1",
  attributes: {
    movie_id: "String",
    release: "DateTime",
    runtime: "Int",
    box_office: "Float",
    is_adult: "Boolean",
    genres: "[String]",
    votes: "[Int]",
    director_id: "String",
  },
  associations: {
    dist_director: {
      type: "many_to_one",
      implementation: "foreignkeys",
      target: "dist_director",
      targetKey: "director_id",
      keysIn: "dist_movie",
      targetStorageType: "distributed-data-model",
    },
  },

  internalId: "movie_id",
};

module.exports.house = {
  model: "house",
  storageType: "neo4j",
  attributes: {
    house_id: "String",
    construction_year: "Int",
    street_id: "String",
    owner_id: "String",
  },
  associations: {
    street: {
      type: "many_to_one",
      implementation: "foreignkeys",
      target: "street",
      targetKey: "house_ids",
      sourceKey: "street_id",
      keysIn: "house",
      targetStorageType: "neo4j",
      deletion: "update",
    },
    unique_owner: {
      type: "one_to_one",
      implementation: "foreignkeys",
      target: "owner",
      targetKey: "house_id",
      sourceKey: "owner_id",
      keysIn: "house",
      targetStorageType: "neo4j",
      deletion: "update",
    },
  },
  internalId: "house_id",
  id: {
    name: "house_id",
    type: "String",
  },
  useDataLoader: true,
};

module.exports.dist_house = {
  model: "dist_house",
  storageType: "distributed-data-model",
  registry: ["dist_house_instance1"],
  attributes: {
    house_id: "String",
    construction_year: "Int",
    street_id: "String",
    owner_id: "String",
  },
  associations: {
    dist_street: {
      type: "many_to_one",
      implementation: "foreignkeys",
      target: "dist_street",
      targetKey: "house_ids",
      sourceKey: "street_id",
      keysIn: "dist_house",
      targetStorageType: "distributed-data-model",
      deletion: "update",
    },
    dist_unique_owner: {
      type: "one_to_one",
      implementation: "foreignkeys",
      target: "dist_owner",
      targetKey: "house_id",
      sourceKey: "owner_id",
      keysIn: "dist_house",
      targetStorageType: "distributed-data-model",
      deletion: "update",
    },
  },
  internalId: "house_id",
  id: {
    name: "house_id",
    type: "String",
  },
  useDataLoader: true,
};
