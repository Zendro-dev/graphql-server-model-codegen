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
