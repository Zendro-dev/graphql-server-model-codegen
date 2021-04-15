module.exports.reader = {
  model: "reader",
  storageType: "amazon-s3",
  attributes: {
    reader_id: "String",
    reader_name: "String",
    age: "Float",
    student: "Boolean",
    lastSeen: "DateTime",
    history: "[String]",
  },
  internalId: "reader_id",
  id: {
    name: "reader_id",
    type: "String",
  },
};

module.exports.dist_reader_instance1 = {
  model: "dist_reader",
  storageType: "amazon-s3-adapter",
  adapterName: "dist_reader_instance1",
  regex: "instance1",
  attributes: {
    reader_id: "String",
    reader_name: "String",
    age: "Float",
    student: "Boolean",
    lastSeen: "DateTime",
    history: "[String]",
  },

  internalId: "reader_id",
};
