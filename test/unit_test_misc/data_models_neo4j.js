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
      type: "to_one",
      target: "director",
      targetKey: "director_id",
      keyIn: "movie",
      targetStorageType: "neo4j",
      label: "director_name",
    },
    actor: {
      type: "to_many",
      reverseAssociationType: "to_many",
      target: "actor",
      targetKey: "movie_ids",
      sourceKey: "actor_ids",
      keyIn: "movie",
      targetStorageType: "neo4j",
    },
    unique_review: {
      type: "to_one",
      target: "review",
      targetKey: "movie_id",
      keyIn: "tracker",
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
      type: "to_one",
      target: "dist_director",
      targetKey: "director_id",
      keyIn: "dist_movie",
      targetStorageType: "distributed-data-model",
    },
  },

  internalId: "movie_id",
};
