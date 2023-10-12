const { expect } = require("chai");
const delay = require("delay");
const path = require("path");
const itHelpers = require("./integration_test_misc/integration_test_helpers");

describe("Mongodb - Basic CRUD Operations", () => {
  after(async () => {
    // Delete all animals
    let res = itHelpers.request_graph_ql_post(
      "{ animals(pagination:{limit:25}) {animal_id} }"
    );
    let animals = JSON.parse(res.body.toString("utf8")).data.animals;

    for (let i = 0; i < animals.length; i++) {
      res = itHelpers.request_graph_ql_post(
        `mutation { deleteAnimal (animal_id: ${animals[i].animal_id}) }`
      );
      expect(res.statusCode).to.equal(200);
    }

    let cnt = await itHelpers.count_all_records("countAnimals");
    expect(cnt).to.equal(0);
  });

  it("01. Animal: empty table", () => {
    let res = itHelpers.request_graph_ql_post("{ countAnimals }");
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody.data.countAnimals).equal(0);
  });

  it("02. Animal: add", async () => {
    let res = itHelpers.request_graph_ql_post(
      `mutation{
            addAnimal(animal_id:"1", animal_name:"Lily", category:"Dog", age:3, weight:6.5, 
            health:true, birthday:"2017-12-03T10:15:30Z", personality:["energetic","enthusiastic"])
            {
                animal_name
                personality
            }
        }`
    );

    expect(res.statusCode).to.equal(200);

    let cnt = await itHelpers.count_all_records("countAnimals");
    expect(cnt).to.equal(1);
  });

  it("03. Animal: update", () => {
    let res = itHelpers.request_graph_ql_post(
      '{animals(search:{field:animal_name operator:eq value:"Lily"}, pagination:{limit:25}){animal_id}}'
    );
    let resBody = JSON.parse(res.body.toString("utf8"));
    let animal = resBody.data.animals[0].animal_id;

    res = itHelpers.request_graph_ql_post(
      `mutation { updateAnimal(animal_id: ${animal}, animal_name: "Lily2", 
        personality: ["energetic", "enthusiastic", "active"]) {
          animal_id 
          animal_name 
          personality
        } 
      }`
    );
    resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        updateAnimal: {
          animal_id: `${animal}`,
          animal_name: "Lily2",
          personality: ["energetic", "enthusiastic", "active"],
        },
      },
    });
  });

  it("04. Animal: read", () => {
    let res = itHelpers.request_graph_ql_post(
      '{animals(search:{field:animal_name, operator:eq, value:"Lily2"}, pagination:{limit:25}){animal_id}}'
    );
    let resBody = JSON.parse(res.body.toString("utf8"));
    let animal = resBody.data.animals[0].animal_id;

    res = itHelpers.request_graph_ql_post(
      `{ readOneAnimal(animal_id : ${animal}) { animal_id animal_name personality} }`
    );
    resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        readOneAnimal: {
          animal_id: `${animal}`,
          animal_name: "Lily2",
          personality: ["energetic", "enthusiastic", "active"],
        },
      },
    });
  });

  it("05. Animal: search with regex", () => {
    let res = itHelpers.request_graph_ql_post(
      '{animals(search:{field:animal_name, value:"Li.*", operator:regexp},pagination:{limit:25}) {animal_name}}'
    );
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody.data.animals.length).equal(1);
  });

  it("06. Animal: delete", async () => {
    let res = itHelpers.request_graph_ql_post(
      "{ animals(pagination:{limit:25}) {animal_id} }"
    );
    let animals = JSON.parse(res.body.toString("utf8")).data.animals;

    for (let i = 0; i < animals.length; i++) {
      res = itHelpers.request_graph_ql_post(
        `mutation { deleteAnimal (animal_id: ${animals[i].animal_id}) }`
      );
      expect(res.statusCode).to.equal(200);
    }

    let cnt = await itHelpers.count_all_records("countAnimals");
    expect(cnt).to.equal(0);
  });

  it("07. Animal: add multiple records", async () => {
    let cnt1 = await itHelpers.count_all_records("countAnimals");
    let res = itHelpers.request_graph_ql_post(
      `mutation{
        n0: addAnimal(animal_id:"1", animal_name:"Sally1", category:"Dog", age:3, weight:5.5, 
          health:true, birthday:"2017-12-03T10:15:30Z", personality:["energetic","enthusiastic"])
          {animal_id}
        n1: addAnimal(animal_id:"2", animal_name:"Sally2", category:"Dog", age:3, weight:5.5, 
          health:true, birthday:"2017-12-03T10:15:30Z", personality:["energetic","enthusiastic"])
          {animal_id}
        n2: addAnimal(animal_id:"3", animal_name:"Milka1", category:"Cat", age:2, weight:3.5, 
          health:true, birthday:"2017-12-03T10:15:30Z", personality:["cute","optimistic"])
          {animal_id}
        n3: addAnimal(animal_id:"4", animal_name:"Milka2", category:"Cat", age:2, weight:3.5, 
          health:true, birthday:"2017-12-03T10:15:30Z", personality:["cute","optimistic"])
          {animal_id}
        n4: addAnimal(animal_id:"5", animal_name:"Lily1", category:"Pig", age:1, weight:10.5, 
          health:true, birthday:"2017-12-03T10:15:30Z", personality:["forgetful","funny"])
          {animal_id}
        n5: addAnimal(animal_id:"6", animal_name:"Lily2", category:"Pig", age:1, weight:10.5, 
          health:true, birthday:"2017-12-03T10:15:30Z", personality:["forgetful","funny"])
          {animal_id}
      }`
    );

    expect(res.statusCode).to.equal(200);

    let cnt2 = await itHelpers.count_all_records("countAnimals");
    expect(cnt2 - cnt1).to.equal(6);
  });

  it("08. Animal: paginate", () => {
    let res = itHelpers.request_graph_ql_post(
      "{animals(pagination:{limit:1}) {animal_id}}"
    );
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody.data.animals.length).equal(1);

    res = itHelpers.request_graph_ql_post(
      `{
          animalsConnection(pagination:{first:10}) {
              edges{
                  cursor
                  node{
                      animal_id
                    }
                }
            }
        }`
    );
    resBody = JSON.parse(res.body.toString("utf8"));
    let edges = resBody.data.animalsConnection.edges;
    let idArray = edges.map((edge) => edge.node.animal_id);
    let cursorArray = edges.map((edge) => edge.cursor);
    res = itHelpers.request_graph_ql_post(
      `{
          animalsConnection(pagination:{first: 2, after: "${cursorArray[1]}"}) {
              animals{
                animal_name
              }
              edges{
                  cursor
                  node{
                      animal_id
                    }
                }
              pageInfo{
                  endCursor
                  hasNextPage
                }
            }
        }`
    );
    resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        animalsConnection: {
          animals: [
            {
              animal_name: "Milka1",
            },
            {
              animal_name: "Milka2",
            },
          ],
          edges: [
            {
              cursor: cursorArray[2],
              node: {
                animal_id: idArray[2],
              },
            },
            {
              cursor: cursorArray[3],
              node: {
                animal_id: idArray[3],
              },
            },
          ],
          pageInfo: {
            endCursor: cursorArray[3],
            hasNextPage: true,
          },
        },
      },
    });
  });

  it("09. Animal: sort", () => {
    let res = itHelpers.request_graph_ql_post(
      `{
          animals(pagination: {limit:2}, order: [{field: animal_name, order: DESC}]) {
              animal_name
            }
        }`
    );
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        animals: [{ animal_name: "Sally2" }, { animal_name: "Sally1" }],
      },
    });
  });

  it("10. Animal: not operator", () => {
    let res = itHelpers.request_graph_ql_post(
      `{
          animals(pagination: {limit:2}, 
            search:{operator:not search:{field:animal_id value:"2" operator:eq}}) {
              animal_id
              animal_name
          }
        }`
    );
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        animals: [
          { animal_id: "1", animal_name: "Sally1" },
          { animal_id: "3", animal_name: "Milka1" },
        ],
      },
    });
  });

  it("11. Animal: get the table template", () => {
    let res = itHelpers.request_graph_ql_post(`{csvTableTemplateAnimal}`);
    let resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        csvTableTemplateAnimal: [
          "animal_id,category,animal_name,age,weight,health,birthday,personality,addFarm,addFood",
          "String,String,String,Int,Float,Boolean,DateTime,[String],String,[String]",
        ],
      },
    });
  });

  it("12. Animal: get data model definition", () => {
    let res = itHelpers.request_graph_ql_post(`{animalsZendroDefinition}`);
    let resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        animalsZendroDefinition: {
          model: "animal",
          model_name_in_storage: "animalia",
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
              implementation: "foreignkeys",
              target: "farm",
              targetKey: "farm_id",
              keysIn: "animal",
              targetStorageType: "mongodb",
              label: "farm_name",
              deletion: "update",
            },
            food: {
              type: "many_to_many",
              implementation: "foreignkeys",
              target: "food",
              targetKey: "animal_ids",
              sourceKey: "food_ids",
              keysIn: "animal",
              targetStorageType: "mongodb",
              deletion: "update",
            },
            unique_tracker: {
              type: "one_to_one",
              implementation: "foreignkeys",
              target: "tracker",
              targetKey: "animal_id",
              keysIn: "tracker",
              targetStorageType: "mongodb",
              deletion: "update",
            },
          },
          internalId: "animal_id",
          id: {
            name: "animal_id",
            type: "String",
          },
          useDataLoader: true,
        },
      },
    });
  });
});

describe("Mongodb - Operators", () => {
  before(async () => {
    let res = itHelpers.request_graph_ql_post(
      `mutation{
        n0: addAnimal(animal_id:"1", animal_name:"Sally1", category:"Dog", age:3, weight:5.5, 
          health:true, birthday:"2017-12-03T10:15:30Z", personality:["energetic","enthusiastic"])
          {animal_id}
        n1: addAnimal(animal_id:"2", animal_name:"Sally2", category:"Dog", age:3, weight:5.5, 
          health:true, birthday:"2017-12-03T10:15:30Z", personality:["energetic","enthusiastic"])
          {animal_id}
        n2: addAnimal(animal_id:"3", animal_name:"Milka1", category:"Cat", age:2, weight:3.5, 
          health:true, birthday:"2017-12-03T10:15:30Z", personality:["cute","optimistic"])
          {animal_id}
        n3: addAnimal(animal_id:"4", animal_name:"Milka2", category:"Cat", age:2, weight:3.5, 
          health:true, birthday:"2017-12-03T10:15:30Z", personality:["cute","optimistic"])
          {animal_id}
        n4: addAnimal(animal_id:"5", animal_name:"Lily1", category:"Pig", age:1, weight:10.5, 
          health:true, birthday:"2017-12-03T10:15:30Z", personality:["forgetful","funny"])
          {animal_id}
        n5: addAnimal(animal_id:"6", animal_name:"Lily2", category:"Pig", age:1, weight:10.5, 
          health:true, birthday:"2017-12-03T10:15:30Z", personality:["forgetful","funny"])
          {animal_id}
      }`
    );

    expect(res.statusCode).to.equal(200);
  });

  after(async () => {
    let res = itHelpers.request_graph_ql_post(
      "{ animals(pagination:{limit:25}) {animal_id} }"
    );
    let animals = JSON.parse(res.body.toString("utf8")).data.animals;

    for (let i = 0; i < animals.length; i++) {
      res = itHelpers.request_graph_ql_post(
        `mutation { deleteAnimal (animal_id: ${animals[i].animal_id}) }`
      );
      expect(res.statusCode).to.equal(200);
    }
  });

  it("01. Animal: like , notLike", () => {
    let res = itHelpers.request_graph_ql_post(
      `{
          animals(pagination: {limit:10} search:{field:animal_name operator:like value:"%il%"}) {
              animal_id
              animal_name
              personality
            }
        }`
    );
    expect(res.statusCode).to.equal(200);
    let resBody = JSON.parse(res.body.toString("utf8"));
    expect(resBody.data.animals.length).to.equal(4);

    res = itHelpers.request_graph_ql_post(
      `{
          animals(pagination: {limit:10} search:{field:animal_name operator:notLike value:"%il%"}) {
              animal_id
              animal_name
              personality
            }
        }`
    );
    expect(res.statusCode).to.equal(200);
    resBody = JSON.parse(res.body.toString("utf8"));
    expect(resBody.data.animals.length).to.equal(2);
  });

  it("02. Animal: iLike, notILike", () => {
    let res = itHelpers.request_graph_ql_post(
      `{
          animals(pagination: {limit:10} search:{field:animal_name operator:iLike value:"%AL%"}) {
              animal_id
              animal_name
              personality
            }
        }`
    );
    expect(res.statusCode).to.equal(200);
    let resBody = JSON.parse(res.body.toString("utf8"));
    expect(resBody.data.animals.length).to.equal(2);

    res = itHelpers.request_graph_ql_post(
      `{
          animals(pagination: {limit:10} search:{field:animal_name operator:notILike value:"%AL%"}) {
              animal_id
              animal_name
              personality
            }
        }`
    );
    expect(res.statusCode).to.equal(200);
    resBody = JSON.parse(res.body.toString("utf8"));
    expect(resBody.data.animals.length).to.equal(4);
  });

  it("03. Animal: regexp, notRegexp", () => {
    let res = itHelpers.request_graph_ql_post(
      `{
          animals(pagination: {limit:10} search:{field:animal_name operator:regexp value:"lly[0-9]$"}) {
              animal_id
              animal_name
              personality
            }
        }`
    );
    expect(res.statusCode).to.equal(200);
    let resBody = JSON.parse(res.body.toString("utf8"));
    expect(resBody.data.animals.length).to.equal(2);

    res = itHelpers.request_graph_ql_post(
      `{
          animals(pagination: {limit:10} search:{field:animal_name operator:notRegexp value:"lly[0-9]$"}) {
              animal_id
              animal_name
              personality
            }
        }`
    );
    expect(res.statusCode).to.equal(200);
    resBody = JSON.parse(res.body.toString("utf8"));
    expect(resBody.data.animals.length).to.equal(4);
  });

  it("04. Animal: iRegexp, notIRegexp", () => {
    let res = itHelpers.request_graph_ql_post(
      `{
          animals(pagination: {limit:10} search:{field:animal_name operator:iRegexp value:"lLY[0-9]$"}) {
              animal_id
              animal_name
              personality
            }
        }`
    );
    expect(res.statusCode).to.equal(200);
    let resBody = JSON.parse(res.body.toString("utf8"));
    expect(resBody.data.animals.length).to.equal(2);

    res = itHelpers.request_graph_ql_post(
      `{
          animals(pagination: {limit:10} search:{field:animal_name operator:notIRegexp value:"lLY[0-9]$"}) {
              animal_id
              animal_name
              personality
            }
        }`
    );
    expect(res.statusCode).to.equal(200);
    resBody = JSON.parse(res.body.toString("utf8"));
    expect(resBody.data.animals.length).to.equal(4);
  });

  it("05. Animal: in, notIn", () => {
    let res = itHelpers.request_graph_ql_post(
      `{
          animals(pagination: {limit:10} search:{field:category operator:in value:"Dog,Cat" valueType:Array}) {
              animal_id
              animal_name
              personality
            }
        }`
    );
    expect(res.statusCode).to.equal(200);
    let resBody = JSON.parse(res.body.toString("utf8"));
    expect(resBody.data.animals.length).to.equal(4);

    res = itHelpers.request_graph_ql_post(
      `{
          animals(pagination: {limit:10} search:{field:category operator:notIn value:"Dog,Cat" valueType:Array}) {
              animal_id
              animal_name
              personality
            }
        }`
    );
    expect(res.statusCode).to.equal(200);
    resBody = JSON.parse(res.body.toString("utf8"));
    expect(resBody.data.animals.length).to.equal(2);
  });

  it("06. Animal: contains, notContains", () => {
    let res = itHelpers.request_graph_ql_post(
      `{
          animals(pagination: {limit:10} search:{field:personality operator:contains value:"cute"}) {
              animal_id
              animal_name
              personality
            }
        }`
    );
    expect(res.statusCode).to.equal(200);
    let resBody = JSON.parse(res.body.toString("utf8"));
    expect(resBody.data.animals.length).to.equal(2);

    res = itHelpers.request_graph_ql_post(
      `{
          animals(pagination: {limit:10} search:{field:personality operator:notContains value:"cute"}) {
              animal_id
              animal_name
              personality
            }
        }`
    );
    expect(res.statusCode).to.equal(200);
    resBody = JSON.parse(res.body.toString("utf8"));
    expect(resBody.data.animals.length).to.equal(4);
  });
});

describe("Mongodb - Association", () => {
  // set up the environment
  before(async () => {
    let res = itHelpers.request_graph_ql_post(
      `mutation{
        n0: addAnimal(animal_id:"1", animal_name:"Sally1", category:"Dog", age:3, weight:5.5, 
          health:true, birthday:"2017-12-03T10:15:30Z", personality:["energetic","enthusiastic"])
          {animal_id}
        n1: addAnimal(animal_id:"2", animal_name:"Sally2", category:"Dog", age:3, weight:5.5, 
          health:true, birthday:"2017-12-03T10:15:30Z", personality:["energetic","enthusiastic"])
          {animal_id}
        n2: addAnimal(animal_id:"3", animal_name:"Milka1", category:"Cat", age:2, weight:3.5, 
          health:true, birthday:"2017-12-03T10:15:30Z", personality:["cute","optimistic"])
          {animal_id}
        n3: addAnimal(animal_id:"4", animal_name:"Milka2", category:"Cat", age:2, weight:3.5, 
          health:true, birthday:"2017-12-03T10:15:30Z", personality:["cute","optimistic"])
          {animal_id}
        n4: addAnimal(animal_id:"5", animal_name:"Lily1", category:"Pig", age:1, weight:10.5, 
          health:true, birthday:"2017-12-03T10:15:30Z", personality:["forgetful","funny"])
          {animal_id}
        n5: addAnimal(animal_id:"6", animal_name:"Lily2", category:"Pig", age:1, weight:10.5, 
          health:true, birthday:"2017-12-03T10:15:30Z", personality:["forgetful","funny"])
          {animal_id}
      }`
    );

    expect(res.statusCode).to.equal(200);
  });

  // clean up records
  after(async () => {
    // Delete all animals
    let res = itHelpers.request_graph_ql_post(
      "{ animals(pagination:{limit:25}) {animal_id} }"
    );
    let animals = JSON.parse(res.body.toString("utf8")).data.animals;

    for (let i = 0; i < animals.length; i++) {
      res = itHelpers.request_graph_ql_post(
        `mutation { deleteAnimal (animal_id: ${animals[i].animal_id}) }`
      );
      expect(res.statusCode).to.equal(200);
    }

    let cnt = await itHelpers.count_all_records("countAnimals");
    expect(cnt).to.equal(0);

    // Delete all farms
    res = itHelpers.request_graph_ql_post(
      "{ farms(pagination:{limit:25}) {farm_id} }"
    );
    let farms = JSON.parse(res.body.toString("utf8")).data.farms;

    for (let i = 0; i < farms.length; i++) {
      res = itHelpers.request_graph_ql_post(
        `mutation { deleteFarm (farm_id: ${farms[i].farm_id}) }`
      );
      expect(res.statusCode).to.equal(200);
    }

    cnt = await itHelpers.count_all_records("countFarms");
    expect(cnt).to.equal(0);

    // Delete all kinds of food
    res = itHelpers.request_graph_ql_post(
      "{ food(pagination:{limit:25}) {food_id} }"
    );
    let food = JSON.parse(res.body.toString("utf8")).data.food;

    for (let i = 0; i < food.length; i++) {
      res = itHelpers.request_graph_ql_post(
        `mutation { deleteFood (food_id: ${food[i].food_id}) }`
      );
      expect(res.statusCode).to.equal(200);
    }

    cnt = await itHelpers.count_all_records("countFood");
    expect(cnt).to.equal(0);

    // Delete all trackers
    res = itHelpers.request_graph_ql_post(
      "{ trackers(pagination:{limit:25}) {tracker_id} }"
    );
    let tracker = JSON.parse(res.body.toString("utf8")).data.trackers;

    for (let i = 0; i < tracker.length; i++) {
      res = itHelpers.request_graph_ql_post(
        `mutation { deleteTracker (tracker_id: ${tracker[i].tracker_id}) }`
      );
      expect(res.statusCode).to.equal(200);
    }

    cnt = await itHelpers.count_all_records("countTrackers");
    expect(cnt).to.equal(0);
  });

  it("01. Animal : Farm (n:1) - add animals to farm", () => {
    let res = itHelpers.request_graph_ql_post(
      `mutation{
        addFarm( farm_id: 1, farm_name: "Dogs' Home", addAnimals: [1, 2] ){
          farm_name
          animalsFilter(pagination:{limit:10}){
            animal_name
          }
        }
      }`
    );
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        addFarm: {
          animalsFilter: [
            {
              animal_name: "Sally1",
            },
            {
              animal_name: "Sally2",
            },
          ],
          farm_name: "Dogs' Home",
        },
      },
    });
  });
  it("02. Animal : Farm (n:1) - read one associated animal / read one farm", () => {
    let res = itHelpers.request_graph_ql_post(`{
        readOneAnimal(animal_id: "1"){
          animal_name
          farm{
            farm_name
            }
          }
      }`);
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        readOneAnimal: {
          farm: {
            farm_name: "Dogs' Home",
          },
          animal_name: "Sally1",
        },
      },
    });

    res = itHelpers.request_graph_ql_post(`{
      readOneFarm(farm_id: "1"){
        farm_id
        farm_name
        }
    }`);
    resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        readOneFarm: {
          farm_id: "1",
          farm_name: "Dogs' Home",
        },
      },
    });
  });

  it("03. Animal : Farm (n:1) - delete the associations in the farm record", () => {
    let res = itHelpers.request_graph_ql_post(
      `mutation{updateFarm(farm_id: 1, removeAnimals: [1, 2]) {
          farm_name
          animalsFilter(pagination:{limit:10}){
            animal_name
          }
          animalsConnection(pagination:{first:5}){
            animals{
              animal_id
            }
          }
        }
      }`
    );

    resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        updateFarm: {
          animalsFilter: [],
          farm_name: "Dogs' Home",
          animalsConnection: {
            animals: [],
          },
        },
      },
    });
  });

  it("04. Animal : Food (n:n) - add animals to food", () => {
    for (let i = 1; i < 3; i++) {
      let res = itHelpers.request_graph_ql_post(
        `mutation{
            addFood(food_id:${i}, food_name:"dried fish", addAnimals:[3,4]){
                food_id
                animal_ids
            }
        }`
      );
      let resBody = JSON.parse(res.body.toString("utf8"));

      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
          addFood: {
            food_id: `${i}`,
            animal_ids: ["3", "4"],
          },
        },
      });
    }
  });

  it("05. Animal : Food (n:n) - read one associated animal", () => {
    let res = itHelpers.request_graph_ql_post(`
      {
        readOneAnimal(animal_id: "3"){
          animal_name
          food_ids
        }
      }`);
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        readOneAnimal: {
          animal_name: "Milka1",
          food_ids: ["1", "2"],
        },
      },
    });
  });

  it("06. Animal : Food (n:n) - delete the associations in the food records", () => {
    for (let i = 1; i < 3; i++) {
      let res = itHelpers.request_graph_ql_post(
        `mutation{
            updateFood(food_id:${i}, removeAnimals:[3,4]){
                food_id
                animal_ids
            }
      }`
      );
      resBody = JSON.parse(res.body.toString("utf8"));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
          updateFood: {
            food_id: `${i}`,
            animal_ids: [],
          },
        },
      });
    }
  });

  it("07. Animal : Tracker (1:1) - add animal to tracker", () => {
    let res = itHelpers.request_graph_ql_post(
      `mutation{
          addTracker(tracker_id:1, location:"garden", addUnique_animal:5){
              tracker_id
              animal_id
          }
        }`
    );
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        addTracker: {
          tracker_id: "1",
          animal_id: "5",
        },
      },
    });
  });

  it("08. Animal : Tracker (1:1) - read one associated animal", () => {
    let res = itHelpers.request_graph_ql_post(`
      {
        readOneAnimal(animal_id: "5"){
          animal_name
          unique_tracker {
            tracker_id
          }
        }
      }`);
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        readOneAnimal: {
          animal_name: "Lily1",
          unique_tracker: {
            tracker_id: "1",
          },
        },
      },
    });
  });

  it("09. Animal : Tracker (1:1) - update the existing association", () => {
    res = itHelpers.request_graph_ql_post(
      `mutation{
            addTracker(tracker_id:2, location:"living room", addUnique_animal:5){
                tracker_id
                animal_id
            }
        }`
    );
    resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      errors: [
        {
          message: "Hint: update 1 existing association!",
          locations: "",
        },
      ],
      data: { addTracker: { tracker_id: "2", animal_id: "5" } },
    });
  });

  it("10. Animal : Tracker (1:1) - delete the associations in the tracker record", () => {
    for (let i = 1; i < 3; i++) {
      let res = itHelpers.request_graph_ql_post(
        `mutation{
            updateTracker(tracker_id:${i}, removeUnique_animal:5){
                tracker_id
                animal_id
            }
      }`
      );
      resBody = JSON.parse(res.body.toString("utf8"));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
          updateTracker: {
            tracker_id: `${i}`,
            animal_id: null,
          },
        },
      });
    }
  });
});

describe("Mongodb - Distributed Data Models", () => {
  after(async () => {
    // Delete all animals
    let res = itHelpers.request_graph_ql_post(
      "{ dist_animalsConnection(pagination:{first:10}) {edges {node {animal_id}}}}"
    );
    let edges = JSON.parse(res.body.toString("utf8")).data
      .dist_animalsConnection.edges;

    for (let edge of edges) {
      res = itHelpers.request_graph_ql_post(
        `mutation { deleteDist_animal (animal_id: "${edge.node.animal_id}") }`
      );
      expect(res.statusCode).to.equal(200);
    }

    let cnt = await itHelpers.count_all_records("countDist_animals");
    expect(cnt).to.equal(0);

    // Delete all farms
    res = itHelpers.request_graph_ql_post(
      "{ dist_farmsConnection(pagination:{first:10}) {edges {node {farm_id}}}}"
    );
    edges = JSON.parse(res.body.toString("utf8")).data.dist_farmsConnection
      .edges;

    for (let edge of edges) {
      res = itHelpers.request_graph_ql_post(
        `mutation { deleteDist_farm (farm_id: "${edge.node.farm_id}") }`
      );
      expect(res.statusCode).to.equal(200);
    }

    cnt = await itHelpers.count_all_records("countDist_farms");
    expect(cnt).to.equal(0);
  });

  it("01. Animal DDM: create a farm and 2 animals", () => {
    let res = itHelpers.request_graph_ql_post(
      `mutation {
        addDist_farm(farm_id: "instance1-01", farm_name: "Dogs' Home") {
          farm_id
          farm_name
        }
      }`
    );
    let resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        addDist_farm: {
          farm_id: "instance1-01",
          farm_name: "Dogs' Home",
        },
      },
    });

    const name = ["Milka", "Sally", "Lily"];
    for (let i = 0; i < name.length; i++) {
      res = itHelpers.request_graph_ql_post(
        `mutation {
          addDist_animal(animal_id: "instance1-0${i + 2}",
          animal_name: "${name[i]}")
          {
            animal_id
            animal_name
          }
        }
        `
      );
      resBody = JSON.parse(res.body.toString("utf8"));
      expect(res.statusCode).to.equal(200);

      expect(resBody).to.deep.equal({
        data: {
          addDist_animal: {
            animal_id: `instance1-0${i + 2}`,
            animal_name: `${name[i]}`,
          },
        },
      });
    }
  });

  it("02. Animal DDM: read one animal / read one farm", () => {
    let res = itHelpers.request_graph_ql_post(`{
        readOneDist_animal(animal_id: "instance1-02"){
          animal_id
          animal_name
        }
      }`);
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        readOneDist_animal: {
          animal_id: `instance1-02`,
          animal_name: "Milka",
        },
      },
    });
    res = itHelpers.request_graph_ql_post(
      `{
        readOneDist_farm(farm_id: "instance1-01") {
          farm_id
          farm_name
        }
      }`
    );
    resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        readOneDist_farm: {
          farm_id: "instance1-01",
          farm_name: "Dogs' Home",
        },
      },
    });
  });

  it("03. Animal DDM: update the farm to associate with animals", () => {
    let res = itHelpers.request_graph_ql_post(
      `mutation {
        updateDist_farm(farm_id: "instance1-01", addDist_animals: ["instance1-02", "instance1-03"]) {
          farm_name
          countFilteredDist_animals
          dist_animalsConnection(pagination: {first: 5}) {
            edges {
              node {
                animal_name
              }
            }
            dist_animals{
              animal_id
            }
          }
        }
      }
      `
    );
    let resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        updateDist_farm: {
          farm_name: "Dogs' Home",
          countFilteredDist_animals: 2,
          dist_animalsConnection: {
            edges: [
              {
                node: {
                  animal_name: "Milka",
                },
              },
              {
                node: {
                  animal_name: "Sally",
                },
              },
            ],
            dist_animals: [
              { animal_id: "instance1-02" },
              { animal_id: "instance1-03" },
            ],
          },
        },
      },
    });
  });

  it("04. Animal DDM: read all", () => {
    let res = itHelpers.request_graph_ql_post(
      `{
        dist_farmsConnection(pagination: {first: 25}) {
          edges {
            node {
              farm_id
              countFilteredDist_animals
            }
          }
        }
      }
      `
    );
    let resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        dist_farmsConnection: {
          edges: [
            {
              node: {
                farm_id: "instance1-01",
                countFilteredDist_animals: 2,
              },
            },
          ],
        },
      },
    });
  });
  it("05. Animal DDM: search, sort and pagination", () => {
    res = itHelpers.request_graph_ql_post(
      `{
        dist_animalsConnection(search: {field: animal_id, value: "instance.*", operator: regexp}, pagination: {first: 5}) {
          edges {
            node {
              animal_id
              animal_name
            }
          }
        }
      }
      `
    );
    resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        dist_animalsConnection: {
          edges: [
            {
              node: {
                animal_id: "instance1-02",
                animal_name: "Milka",
              },
            },
            {
              node: {
                animal_id: "instance1-03",
                animal_name: "Sally",
              },
            },
            {
              node: {
                animal_id: "instance1-04",
                animal_name: "Lily",
              },
            },
          ],
        },
      },
    });
    // The same search, but order by name descending
    res = itHelpers.request_graph_ql_post(
      `{
        dist_animalsConnection(search: {field: animal_id, value: "instance.*", operator: regexp},
        order:{field:animal_name order:DESC}, pagination: {first: 5}) {
          edges {
            node {
              animal_id
              animal_name
            }
          }
        }
      }`
    );
    resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        dist_animalsConnection: {
          edges: [
            {
              node: {
                animal_id: "instance1-03",
                animal_name: "Sally",
              },
            },
            {
              node: {
                animal_id: "instance1-02",
                animal_name: "Milka",
              },
            },
            {
              node: {
                animal_id: "instance1-04",
                animal_name: "Lily",
              },
            },
          ],
        },
      },
    });

    res = itHelpers.request_graph_ql_post(
      `{
        dist_animalsConnection(pagination: {first: 5,
          after:"eyJhbmltYWxfaWQiOiJpbnN0YW5jZTEtMDIiLCJhbmltYWxfbmFtZSI6Ik1pbGthIiwiZmFybV9pZCI6Imluc3RhbmNlMS0wMSJ9"}) {
          edges {
            node {
              animal_id
              animal_name
            }
            cursor
          }
          pageInfo {
            startCursor
            endCursor
            hasNextPage
            hasPreviousPage
          }
        }
      }
      `
    );
    resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        dist_animalsConnection: {
          edges: [
            {
              cursor:
                "eyJhbmltYWxfaWQiOiJpbnN0YW5jZTEtMDMiLCJhbmltYWxfbmFtZSI6IlNhbGx5IiwiZmFybV9pZCI6Imluc3RhbmNlMS0wMSJ9",
              node: {
                animal_id: "instance1-03",
                animal_name: "Sally",
              },
            },
            {
              cursor:
                "eyJhbmltYWxfaWQiOiJpbnN0YW5jZTEtMDQiLCJhbmltYWxfbmFtZSI6IkxpbHkifQ==",
              node: {
                animal_id: "instance1-04",
                animal_name: "Lily",
              },
            },
          ],
          pageInfo: {
            startCursor:
              "eyJhbmltYWxfaWQiOiJpbnN0YW5jZTEtMDMiLCJhbmltYWxfbmFtZSI6IlNhbGx5IiwiZmFybV9pZCI6Imluc3RhbmNlMS0wMSJ9",
            endCursor:
              "eyJhbmltYWxfaWQiOiJpbnN0YW5jZTEtMDQiLCJhbmltYWxfbmFtZSI6IkxpbHkifQ==",
            hasNextPage: false,
            hasPreviousPage: false,
          },
        },
      },
    });
  });

  it("06. Animal DDM: update the farm to remove associations", () => {
    let res = itHelpers.request_graph_ql_post(
      `mutation {
        updateDist_farm(farm_id:"instance1-01" removeDist_animals:["instance1-02", "instance1-03"]) {
          farm_name
          countFilteredDist_animals
          dist_animalsConnection(pagination:{first:5}){
            edges {
              node {
                animal_name
              }
            }
            dist_animals{
              animal_id
            }
          }
        }
      }`
    );
    let resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        updateDist_farm: {
          farm_name: "Dogs' Home",
          countFilteredDist_animals: 0,
          dist_animalsConnection: {
            edges: [],
            dist_animals: [],
          },
        },
      },
    });
  });
});

describe("data loader for readById method", () => {
  //set up the environment
  before(async () => {
    let res = itHelpers.request_graph_ql_post(
      `mutation {
        n1: addAnimal(animal_id:"1", animal_name:"Lily"){ animal_name }
        n2: addAnimal(animal_id:"2", animal_name:"Sally"){ animal_name }
        n3: addAnimal(animal_id:"3", animal_name:"Luna"){ animal_name }
      }`
    );
    expect(res.statusCode).to.equal(200);
    res = itHelpers.request_graph_ql_post(`
      mutation {
        n1: addFarm( farm_id: 1, farm_name: "Dogs' Home", addAnimals: [1, 2] ){ farm_name }
        n2: addFarm( farm_id: 2, farm_name: "Cats' Home", addAnimals: [3] ){ farm_name }
      }`);
    expect(res.statusCode).to.equal(200);

    res = itHelpers.request_graph_ql_post(
      `mutation{
        n1: addFood(food_id:"1", food_name:"dried fish", addAnimals:[1, 3]){ food_id }
        n2: addFood(food_id:"2", food_name:"bone", addAnimals:[1, 2]){ food_id }
      }`
    );
    expect(res.statusCode).to.equal(200);

    res = itHelpers.request_graph_ql_post(
      `mutation{
        addTracker(tracker_id:1, location:"garden", addUnique_animal:2){
          tracker_id
        }
      }`
    );
    expect(res.statusCode).to.equal(200);
  });
  //clean up records
  after(async () => {
    let res = itHelpers.request_graph_ql_post(
      `mutation {
        n0: updateFarm(farm_id: 1, removeAnimals: [1, 2]) { farm_name }
        n1: updateFarm(farm_id: 2, removeAnimals: [3]) { farm_name }
        n2: updateFood(food_id: 1, removeAnimals:[1, 3]){ food_id }
        n3: updateFood(food_id: 2, removeAnimals:[1, 2]){ food_id }
        n4: updateTracker(tracker_id: 1, removeUnique_animal: 2){ tracker_id }
      }`
    );
    expect(res.statusCode).to.equal(200);

    res = itHelpers.request_graph_ql_post(
      `mutation{
        n1: deleteAnimal (animal_id: "1")
        n2: deleteAnimal (animal_id: "2")
        n3: deleteAnimal (animal_id: "3")
        n4: deleteFarm (farm_id: "1")
        n5: deleteFarm (farm_id: "2")
        n6: deleteFood (food_id: "1")
        n7: deleteFood (food_id: "2")
        n8: deleteTracker (tracker_id: "1")
      }`
    );
    expect(res.statusCode).to.equal(200);
  });
  it("01. farm -> animal: one to many", () => {
    let res = itHelpers.request_graph_ql_post(
      `{
        n0: readOneFarm(farm_id: "1") {
          countFilteredAnimals(search: null)
          animalsFilter(pagination:{offset: 0, limit: 2}){
            animal_name
          }
          animalsConnection(pagination:{first:2}){
            animals{
              animal_id
            }
          }
        }
        n1: readOneFarm(farm_id: "2") {
          countFilteredAnimals(search: null)
          animalsFilter(pagination:{offset: 0, limit: 2}){
            animal_name
          }
          animalsConnection(pagination:{first:2}){
            animals{
              animal_id
            }
          }
        }
      }`
    );
    expect(res.statusCode).to.equal(200);
    let resBody = JSON.parse(res.body.toString("utf8"));
    //check associated records
    expect(resBody.data).to.deep.equal({
      n0: {
        animalsConnection: {
          animals: [
            {
              animal_id: "1",
            },
            {
              animal_id: "2",
            },
          ],
        },
        animalsFilter: [
          {
            animal_name: "Lily",
          },
          {
            animal_name: "Sally",
          },
        ],
        countFilteredAnimals: 2,
      },
      n1: {
        animalsConnection: {
          animals: [
            {
              animal_id: "3",
            },
          ],
        },
        animalsFilter: [
          {
            animal_name: "Luna",
          },
        ],
        countFilteredAnimals: 1,
      },
    });
  });
  it("02. animal -> farm: many to one", () => {
    let res = itHelpers.request_graph_ql_post(`{
      n0: readOneAnimal(animal_id: "1"){
        animal_name
        farm{
          farm_name
        }
      }
      n1: readOneAnimal(animal_id: "2"){
        animal_name
        farm{
          farm_name
        }
      }
      n2: readOneAnimal(animal_id: "3"){
        animal_name
        farm{
          farm_name
        }
      }
      n4: readOneAnimal(animal_id: "4"){
        animal_name
        farm{
          farm_name
        }
      }
    }`);
    expect(res.statusCode).to.equal(200);
    let resBody = JSON.parse(res.body.toString("utf8"));
    //check associated records
    expect(resBody.errors).to.deep.equal([
      {
        message: 'Record with ID = "4" does not exist',
        locations: [
          {
            column: 7,
            line: 20,
          },
        ],
        path: ["n4"],
      },
    ]);
    expect(resBody.data).to.deep.equal({
      n0: {
        animal_name: "Lily",
        farm: {
          farm_name: "Dogs' Home",
        },
      },
      n1: {
        animal_name: "Sally",
        farm: {
          farm_name: "Dogs' Home",
        },
      },
      n2: {
        animal_name: "Luna",
        farm: {
          farm_name: "Cats' Home",
        },
      },
      n4: null,
    });
  });
  it("03. animal <-> food: many to many", () => {
    let res = itHelpers.request_graph_ql_post(
      `{
        n0: readOneAnimal(animal_id: "1") {
          countFilteredFood(search: null)
          foodFilter(pagination:{offset: 0, limit: 2}){
            food_id
          }
          foodConnection(search: null, pagination: {first:2})
          {
            edges{
              node{
                food_id
              }
            }
          }
        }
        n1: readOneAnimal(animal_id: "2") {
          countFilteredFood(search: null)
          foodFilter(pagination:{offset: 0, limit: 2}){
            food_id
          }
          foodConnection(search: null, pagination: {first:2})
          {
            edges{
              node{
                food_id
              }
            }
          }
        }
        n2: readOneAnimal(animal_id: "3") {
          countFilteredFood(search: null)
          foodFilter(pagination:{offset: 0, limit: 2}){
            food_id
          }
          foodConnection(search: null, pagination: {first:2})
          {
            edges{
              node{
                food_id
              }
            }
          }
        }
      }`
    );
    expect(res.statusCode).to.equal(200);
    let resBody = JSON.parse(res.body.toString("utf8"));
    //check associated records
    expect(resBody.data).to.deep.equal({
      n0: {
        countFilteredFood: 2,
        foodConnection: {
          edges: [
            {
              node: {
                food_id: "1",
              },
            },
            {
              node: {
                food_id: "2",
              },
            },
          ],
        },
        foodFilter: [
          {
            food_id: "1",
          },
          {
            food_id: "2",
          },
        ],
      },
      n1: {
        countFilteredFood: 1,
        foodConnection: {
          edges: [
            {
              node: {
                food_id: "2",
              },
            },
          ],
        },
        foodFilter: [
          {
            food_id: "2",
          },
        ],
      },
      n2: {
        countFilteredFood: 1,
        foodConnection: {
          edges: [
            {
              node: {
                food_id: "1",
              },
            },
          ],
        },
        foodFilter: [
          {
            food_id: "1",
          },
        ],
      },
    });
  });
  it("04. animal <-> tracker: one to one", () => {
    let res = itHelpers.request_graph_ql_post(
      `{
        readOneAnimal(animal_id: "2") {
          animal_name
          unique_tracker(search: null){
            tracker_id
          }
        }
      }`
    );
    expect(res.statusCode).to.equal(200);
    let resBody = JSON.parse(res.body.toString("utf8"));
    //check associated records
    expect(resBody.data).to.deep.equal({
      readOneAnimal: {
        animal_name: "Sally",
        unique_tracker: {
          tracker_id: "1",
        },
      },
    });
  });
});

describe("validation API for distributed models", () => {
  it("01. validateDist_animalForCreation", () => {
    let res = itHelpers.request_graph_ql_post(
      `{
        validateDist_animalForCreation(animal_id:"instance1-12")
       }`
    );
    expect(res.statusCode).to.equal(200);
    let resBody = JSON.parse(res.body.toString("utf8"));
    expect(resBody.data).to.deep.equal({
      validateDist_animalForCreation: true,
    });
  });
  it("02. validateDist_animalForUpdating", () => {
    let res = itHelpers.request_graph_ql_post(
      `{
        validateDist_animalForUpdating(animal_id: "instance1-12", addDist_farm: "instance1-01")
      }`
    );
    expect(res.statusCode).to.equal(200);
    let resBody = JSON.parse(res.body.toString("utf8"));
    //check associated records
    expect(resBody).to.deep.equal({
      errors: [
        {
          message: "A given ID has no existing record in data model dist_farm",
          locations: "",
          "extensions": {
            "input": {
              "animal_id": "instance1-12",
              "addDist_farm": 'instance1-01' 
            }
          }
        },
      ],
      data: {
        validateDist_animalForUpdating: false,
      },
    });
  });
  it("03. validateDist_animalForDeletion", () => {
    let res = itHelpers.request_graph_ql_post(
      `{
        validateDist_animalForDeletion(animal_id:"instance1-12")
      }`
    );
    expect(res.statusCode).to.equal(200);
    let resBody = JSON.parse(res.body.toString("utf8"));
    //check associated records
    expect(resBody).to.deep.equal({
      errors: [
        {
          message: 'Record with ID = "instance1-12" does not exist',
          locations: "",
          "extensions": {
            "input": {
              "animal_id": "instance1-12"
            }
          }
        },
      ],
      data: {
        validateDist_animalForDeletion: false,
      },
    });
  });
  it("04. validateDist_animalAfterReading", () => {
    let res = itHelpers.request_graph_ql_post(
      `{
        validateDist_animalAfterReading(animal_id:"instance1-12")
      }`
    );
    expect(res.statusCode).to.equal(200);
    let resBody = JSON.parse(res.body.toString("utf8"));
    //check associated records
    expect(resBody.data).to.deep.equal({
      validateDist_animalAfterReading: true,
    });
  });
});

describe("Mongodb - Update Deletion Action", () => {
  // set up the environment
  before(async () => {
    let res;
    for (let i of [1, 2, 3]) {
      res = itHelpers.request_graph_ql_post(
        `mutation{
            addAnimal(animal_id:"${i}")
            {
                animal_id
            }
        }`
      );
      expect(res.statusCode).to.equal(200);
    }

    let cnt = await itHelpers.count_all_records("countAnimals");
    expect(cnt).to.equal(3);

    res = itHelpers.request_graph_ql_post(
      `mutation {
          addFarm(farm_id: 1, addAnimals: [1, 2, 3]) {
            farm_id
          }
        }`
    );
    expect(res.statusCode).to.equal(200);

    cnt = await itHelpers.count_all_records("countFarms");
    expect(cnt).to.equal(1);

    for (let i of [1, 2]) {
      res = itHelpers.request_graph_ql_post(
        `mutation {
          addFood(food_id: ${i}, addAnimals: [1, 2]) {
            food_id
            animal_ids
          }
        }`
      );
      expect(res.statusCode).to.equal(200);

      res = itHelpers.request_graph_ql_post(
        `mutation {
          addTracker(tracker_id: ${i}, addUnique_animal: ${i}) {
            tracker_id
            animal_id
          }
        }`
      );
      expect(res.statusCode).to.equal(200);
    }

    cnt = await itHelpers.count_all_records("countFood");
    expect(cnt).to.equal(2);
    cnt = await itHelpers.count_all_records("countTrackers");
    expect(cnt).to.equal(2);

    for (let i of [1, 2]) {
      res = itHelpers.request_graph_ql_post(
        `mutation {
          addDist_animal(animal_id: "instance1-${i}")
          {
            animal_id
          }
        }`
      );
      expect(res.statusCode).to.equal(200);
    }

    cnt = await itHelpers.count_all_records("countDist_animals");
    expect(cnt).to.equal(2);

    res = itHelpers.request_graph_ql_post(
      `mutation {
        addDist_farm(farm_id: "instance1-f1", farm_name: "Dogs' Home", addDist_animals: ["instance1-1", "instance1-2"]) {
          farm_id
          farm_name
        }
      }`
    );
    expect(res.statusCode).to.equal(200);
    cnt = await itHelpers.count_all_records("countDist_farms");
    expect(cnt).to.equal(1);
  });

  // clean up records
  after(async () => {
    // Delete all animals
    let res = itHelpers.request_graph_ql_post(
      "{ animals(pagination:{limit:25}) {animal_id} }"
    );
    let animals = JSON.parse(res.body.toString("utf8")).data.animals;

    for (let i = 0; i < animals.length; i++) {
      res = itHelpers.request_graph_ql_post(
        `mutation { deleteAnimal (animal_id: ${animals[i].animal_id}) }`
      );
      expect(res.statusCode).to.equal(200);
    }

    let cnt = await itHelpers.count_all_records("countAnimals");
    expect(cnt).to.equal(0);
  });

  it("01. Animal : Farm (n:1)", async () => {
    let res = itHelpers.request_graph_ql_post(
      `mutation { deleteAnimal (animal_id: 3) }`
    );
    expect(res.statusCode).to.equal(200);
    res = itHelpers.request_graph_ql_post(
      `mutation { deleteFarm (farm_id: 1) }`
    );
    expect(res.statusCode).to.equal(200);

    let cnt = await itHelpers.count_all_records("countFarms");
    expect(cnt).to.equal(0);
  });

  it("02. Animal : Food (n:n)", async () => {
    for (let i = 1; i < 3; i++) {
      let res = itHelpers.request_graph_ql_post(
        `mutation { deleteFood (food_id: ${i}) }`
      );
      expect(res.statusCode).to.equal(200);
    }

    let cnt = await itHelpers.count_all_records("countFood");
    expect(cnt).to.equal(0);
  });

  it("03. Animal : Tracker (1:1)", async () => {
    for (let i = 1; i < 3; i++) {
      let res = itHelpers.request_graph_ql_post(
        `mutation { deleteTracker (tracker_id: ${i}) }`
      );
      expect(res.statusCode).to.equal(200);
    }

    let cnt = await itHelpers.count_all_records("countTrackers");
    expect(cnt).to.equal(0);
  });

  it("04. Dist_animal : Dist_farm (n:1)", async () => {
    let res = itHelpers.request_graph_ql_post(
      `mutation { deleteDist_farm (farm_id: "instance1-f1") }`
    );
    expect(res.statusCode).to.equal(200);

    let cnt = await itHelpers.count_all_records("countFarms");
    expect(cnt).to.equal(0);
    for (let i of [1, 2]) {
      res = itHelpers.request_graph_ql_post(
        `mutation { deleteDist_animal (animal_id: "instance1-${i}") }`
      );
      expect(res.statusCode).to.equal(200);
    }
  });
});

describe("Mongodb - Associations for Paired-end Foreign Keys (local)", () => {
  // set up the environment
  before(async () => {
    let res = itHelpers.request_graph_ql_post(
      `mutation{
        n0: addPlant(plant_id:"p1", plant_name:"Sally", category:"Paeonia suffruticosa", age:1, weight:0.5) {plant_id}
        n1: addPlant(plant_id:"p2", plant_name:"Lily", category:"French hydrangea", age:2, weight:1.5) {plant_id}
        n2: addPlant(plant_id:"p3", plant_name:"Milka", category:"Houttuynia cordata", age:1, weight:1.0) {plant_id}
      }`
    );

    expect(res.statusCode).to.equal(200);
  });

  // clean up records
  after(async () => {
    // Delete all plants
    let res = itHelpers.request_graph_ql_post(
      "{ plants(pagination:{limit:25}) {plant_id} }"
    );
    let plants = JSON.parse(res.body.toString("utf8")).data.plants;

    for (let i = 0; i < plants.length; i++) {
      res = itHelpers.request_graph_ql_post(
        `mutation { deletePlant (plant_id: "${plants[i].plant_id}") }`
      );
      expect(res.statusCode).to.equal(200);
    }

    let cnt = await itHelpers.count_all_records("countPlants");
    expect(cnt).to.equal(0);

    // Delete all fields
    res = itHelpers.request_graph_ql_post(
      "{ fields(pagination:{limit:25}) {field_id} }"
    );
    let fields = JSON.parse(res.body.toString("utf8")).data.fields;

    for (let i = 0; i < fields.length; i++) {
      res = itHelpers.request_graph_ql_post(
        `mutation { deleteField (field_id: "${fields[i].field_id}") }`
      );
      expect(res.statusCode).to.equal(200);
    }

    cnt = await itHelpers.count_all_records("countFields");
    expect(cnt).to.equal(0);

    // Delete all spots
    res = itHelpers.request_graph_ql_post(
      "{ spots(pagination:{limit:25}) {spot_id} }"
    );
    let spot = JSON.parse(res.body.toString("utf8")).data.spots;

    for (let i = 0; i < spot.length; i++) {
      res = itHelpers.request_graph_ql_post(
        `mutation { deleteSpot (spot_id: "${spot[i].spot_id}") }`
      );
      expect(res.statusCode).to.equal(200);
    }

    cnt = await itHelpers.count_all_records("countSpots");
    expect(cnt).to.equal(0);
  });

  it("01. Plant : Field (n:1) - add plants to field", () => {
    let res = itHelpers.request_graph_ql_post(
      `mutation{
        addField( field_id: "f1", field_name: "Flowers' Home", addPlants: ["p1", "p2"] ){
          field_name
          plant_ids
          plantsFilter(pagination:{limit:10}){
            plant_name
          }
        }
      }`
    );
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        addField: {
          plantsFilter: [
            {
              plant_name: "Sally",
            },
            {
              plant_name: "Lily",
            },
          ],
          field_name: "Flowers' Home",
          plant_ids: ["p1", "p2"],
        },
      },
    });
  });
  it("02. Plant : Field (n:1) - read one associated plant", () => {
    let res = itHelpers.request_graph_ql_post(`{
      readOnePlant(plant_id: "p1"){
        plant_name
        field_id
      }
    }`);
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        readOnePlant: {
          plant_name: "Sally",
          field_id: "f1",
        },
      },
    });
  });

  it("03. Plant : Field (n:1) - delete the associations in the field record", () => {
    let res = itHelpers.request_graph_ql_post(
      `mutation{updateField(field_id: "f1", removePlants: ["p1", "p2"]) {
          field_name
          plantsFilter(pagination:{limit:10}){
            plant_name
          }
          plantsConnection(pagination:{first:5}){
            plants{
              plant_id
            }
          }
        }
      }`
    );

    resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        updateField: {
          plantsFilter: [],
          field_name: "Flowers' Home",
          plantsConnection: {
            plants: [],
          },
        },
      },
    });
  });

  it("04. Plant : Spot (1:1) - add plant to spot", () => {
    let res = itHelpers.request_graph_ql_post(
      `mutation{
          addSpot(spot_id:"s1", location:"spot1", addUnique_plant:"p3"){
            spot_id
            plant_id
          }
        }`
    );
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        addSpot: {
          spot_id: "s1",
          plant_id: "p3",
        },
      },
    });
  });

  it("05. Plant : Spot (1:1) - read one associated plant", () => {
    let res = itHelpers.request_graph_ql_post(`
      {
        readOnePlant(plant_id: "p3"){
          plant_name
          spot_id
        }
      }`);
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        readOnePlant: {
          plant_name: "Milka",
          spot_id: "s1",
        },
      },
    });
  });

  it("06. Plant : Spot (1:1) - update the existing association", () => {
    res = itHelpers.request_graph_ql_post(
      `mutation{
          addSpot(spot_id:"s2", location:"spot2", addUnique_plant:"p3"){
            spot_id
            plant_id
          }
        }`
    );
    resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      errors: [
        {
          message: "Hint: update 1 existing association!",
          locations: "",
        },
      ],
      data: { addSpot: { spot_id: "s2", plant_id: "p3" } },
    });
  });

  it("07. Plant : Spot (1:1) - delete the associations in the spot record", () => {
    let res = itHelpers.request_graph_ql_post(
      `mutation{
        updateSpot(spot_id:"s2", removeUnique_plant:"p3"){
          spot_id
          plant_id
        }
      }`
    );
    resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        updateSpot: {
          spot_id: "s2",
          plant_id: null,
        },
      },
    });
  });
});

describe("Mongodb - Associations for Paired-end Foreign Keys (distributed)", () => {
  after(async () => {
    // Delete all plants
    let res = itHelpers.request_graph_ql_post(
      "{ dist_plantsConnection(pagination:{first:10}) {edges {node {plant_id}}}}"
    );
    let edges = JSON.parse(res.body.toString("utf8")).data.dist_plantsConnection
      .edges;

    for (let edge of edges) {
      res = itHelpers.request_graph_ql_post(
        `mutation { deleteDist_plant (plant_id: "${edge.node.plant_id}") }`
      );
      expect(res.statusCode).to.equal(200);
    }

    let cnt = await itHelpers.count_all_records("countDist_plants");
    expect(cnt).to.equal(0);

    // Delete all fields
    res = itHelpers.request_graph_ql_post(
      "{ dist_fieldsConnection(pagination:{first:10}) {edges {node {field_id}}}}"
    );
    edges = JSON.parse(res.body.toString("utf8")).data.dist_fieldsConnection
      .edges;

    for (let edge of edges) {
      res = itHelpers.request_graph_ql_post(
        `mutation { deleteDist_field (field_id: "${edge.node.field_id}") }`
      );
      expect(res.statusCode).to.equal(200);
    }

    cnt = await itHelpers.count_all_records("countDist_fields");
    expect(cnt).to.equal(0);

    // Delete all spots
    res = itHelpers.request_graph_ql_post(
      "{ dist_spotsConnection(pagination:{first:10}) {edges {node {spot_id}}}}"
    );
    edges = JSON.parse(res.body.toString("utf8")).data.dist_spotsConnection
      .edges;

    for (let edge of edges) {
      res = itHelpers.request_graph_ql_post(
        `mutation { deleteDist_spot (spot_id: "${edge.node.spot_id}") }`
      );
      expect(res.statusCode).to.equal(200);
    }

    cnt = await itHelpers.count_all_records("countDist_spots");
    expect(cnt).to.equal(0);
  });

  it("01. Plant DDM: create a field and 2 plants", () => {
    let res = itHelpers.request_graph_ql_post(
      `mutation {
        addDist_field(field_id: "instance1-f1", field_name: "Flowers' Home") {
          field_id
          field_name
        }
      }`
    );
    let resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        addDist_field: {
          field_id: "instance1-f1",
          field_name: "Flowers' Home",
        },
      },
    });

    const name = ["Milka", "Sally", "Lily"];
    for (let i = 0; i < name.length; i++) {
      res = itHelpers.request_graph_ql_post(
        `mutation {
          addDist_plant(plant_id: "instance1-p${i + 1}",
          plant_name: "${name[i]}")
          {
            plant_id
            plant_name
          }
        }
        `
      );
      resBody = JSON.parse(res.body.toString("utf8"));
      expect(res.statusCode).to.equal(200);

      expect(resBody).to.deep.equal({
        data: {
          addDist_plant: {
            plant_id: `instance1-p${i + 1}`,
            plant_name: `${name[i]}`,
          },
        },
      });
    }
  });

  it("02. Plant DDM: update the field to associate with plants", () => {
    let res = itHelpers.request_graph_ql_post(
      `mutation {
        updateDist_field(field_id: "instance1-f1", addDist_plants: ["instance1-p1", "instance1-p2"]) {
          field_name
          countFilteredDist_plants
          dist_plantsConnection(pagination: {first: 5}) {
            edges {
              node {
                plant_name
              }
            }
            dist_plants{
              plant_id
            }
          }
        }
      }
      `
    );
    let resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        updateDist_field: {
          field_name: "Flowers' Home",
          countFilteredDist_plants: 2,
          dist_plantsConnection: {
            edges: [
              {
                node: {
                  plant_name: "Milka",
                },
              },
              {
                node: {
                  plant_name: "Sally",
                },
              },
            ],
            dist_plants: [
              { plant_id: "instance1-p1" },
              { plant_id: "instance1-p2" },
            ],
          },
        },
      },
    });
  });

  it("03. Plant DDM: update the field to remove associations", () => {
    let res = itHelpers.request_graph_ql_post(
      `mutation {
        updateDist_field(field_id:"instance1-f1" removeDist_plants:["instance1-p1", "instance1-p2"]) {
          field_name
          countFilteredDist_plants
          dist_plantsConnection(pagination:{first:5}){
            edges {
              node {
                plant_name
              }
            }
            dist_plants{
              plant_id
            }
          }
        }
      }`
    );
    let resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        updateDist_field: {
          field_name: "Flowers' Home",
          countFilteredDist_plants: 0,
          dist_plantsConnection: {
            edges: [],
            dist_plants: [],
          },
        },
      },
    });
  });

  it("04. Plant DDM: add plant to spot", () => {
    let res = itHelpers.request_graph_ql_post(
      `mutation{
          addDist_spot(spot_id:"instance1-s1", location:"spot1", addDist_unique_plant:"instance1-p3"){
            spot_id
            plant_id
          }
        }`
    );
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        addDist_spot: {
          spot_id: "instance1-s1",
          plant_id: "instance1-p3",
        },
      },
    });
  });

  it("05. Plant DDM: update the existing association", () => {
    res = itHelpers.request_graph_ql_post(
      `mutation{
          addDist_spot(spot_id:"instance1-s2", location:"spot2", addDist_unique_plant:"instance1-p3"){
            spot_id
            plant_id
          }
        }`
    );
    resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      errors: [
        {
          message: "Hint: update 1 existing association!",
          locations: "",
        },
      ],
      data: {
        addDist_spot: { spot_id: "instance1-s2", plant_id: "instance1-p3" },
      },
    });
  });

  it("06. Plant DDM: delete the associations in the plant record", () => {
    let res = itHelpers.request_graph_ql_post(
      `mutation{
        updateDist_plant(plant_id:"instance1-p3", removeDist_unique_spot:"instance1-s2"){
          spot_id
          plant_id
        }
      }`
    );
    resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        updateDist_plant: {
          plant_id: "instance1-p3",
          spot_id: null,
        },
      },
    });
  });
});
