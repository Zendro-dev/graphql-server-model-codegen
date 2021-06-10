module.exports.animal = {
  model: "animal",
  storageType: "mongodb",
  attributes: {
    animal_id: "String",
    category: "String",
    animal_name: "String",
    age: "Int",
    weight: "Float",
    health: "Boolean",
    birthday: "DateTime",
    personality: "[String]",
    farm_id: "String",
    food_ids: "[String]",
  },
  associations: {
    farm: {
      type: "many_to_one",
      implementation: "foreignkey",
      target: "farm",
      targetKey: "farm_id",
      keysIn: "animal",
      targetStorageType: "mongodb",
      label: "farm_name",
    },
    food: {
      type: "many_to_many",
      implementation: "foreignkey",
      target: "food",
      targetKey: "animal_ids",
      sourceKey: "food_ids",
      keysIn: "animal",
      targetStorageType: "mongodb",
    },
  },
  internalId: "animal_id",
  id: {
    name: "animal_id",
    type: "String",
  },
};

module.exports.dist_animal_instance1 = {
  model: "dist_animal",
  storageType: "mongodb-adapter",
  adapterName: "dist_animal_instance1",
  regex: "instance1",
  attributes: {
    animal_id: "String",
    category: "String",
    animal_name: "String",
    age: "Int",
    weight: "Float",
    health: "Boolean",
    birthday: "DateTime",
    personality: "[String]",
    farm_id: "String",
  },

  associations: {
    dist_farm: {
      type: "many_to_one",
      implementation: "foreignkey",
      target: "dist_farm",
      targetKey: "farm_id",
      keysIn: "dist_animal",
      targetStorageType: "distributed-data-model",
    },
  },

  internalId: "animal_id",
};
