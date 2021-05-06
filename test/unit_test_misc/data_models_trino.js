module.exports.doctor = {
  model: "doctor",
  storageType: "trino",
  attributes: {
    doctor_id: "String",
    birthday: "DateTime",
    experience: "Int",
    rating: "Float",
    on_holiday: "Boolean",
    speciality: "[String]",
    telephone: "[Int]",
  },
  internalId: "doctor_id",
  id: {
    name: "doctor_id",
    type: "String",
  },
};

module.exports.dist_doctor_instance1 = {
  model: "dist_doctor",
  storageType: "trino-adapter",
  adapterName: "dist_doctor_instance1",
  regex: "instance1",
  attributes: {
    doctor_id: "String",
    birthday: "DateTime",
    experience: "Int",
    rating: "Float",
    on_holiday: "Boolean",
    speciality: "[String]",
    telephone: "[Int]",
  },
  internalId: "doctor_id",
};
