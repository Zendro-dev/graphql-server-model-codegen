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

  it("07. Animal: CSV bulkUpload", async () => {
    let csvPath = path.join(__dirname, "integration_test_misc", "animal.csv");

    let cnt1 = await itHelpers.count_all_records("countAnimals");

    // batch_upload_csv start new background, there is no way to test the actual result
    // without explicit delay. The test may fail if delay is too small, just check the
    // resulting DB table to be sure that all records from file individual_valid.csv were added.
    let success = await itHelpers.batch_upload_csv(
      csvPath,
      "mutation {bulkAddAnimalCsv}"
    );
    expect(success).equal(true);
    await delay(500);

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
          "animal_id,category,animal_name,age,weight,health,birthday,personality,farm_id,food_ids",
          "String,String,String,Int,Float,Boolean,DateTime,[String],String,[String]",
        ],
      },
    });
  });
});

describe("Mongodb - Operators", () => {
  before(async () => {
    let csvPath = path.join(__dirname, "integration_test_misc", "animal.csv");
    let success = await itHelpers.batch_upload_csv(
      csvPath,
      "mutation {bulkAddAnimalCsv}"
    );
    expect(success).equal(true);
    await delay(500);
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
    let csvPath = path.join(__dirname, "integration_test_misc", "animal.csv");
    let success = await itHelpers.batch_upload_csv(
      csvPath,
      "mutation {bulkAddAnimalCsv}"
    );
    expect(success).equal(true);
    await delay(500);
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

  it("09. Animal : Tracker (1:1) - violate the unique rule", () => {
    itHelpers.request_graph_ql_post(
      `mutation{
            addTracker(tracker_id:2, location:"living room", addUnique_animal:5){
                tracker_id
                animal_id
            }
        }`
    );
    res = itHelpers.request_graph_ql_post(`
        {
            readOneAnimal(animal_id: "5"){
              animal_name
              unique_tracker {
                tracker_id
              }
            }
          }`);
    resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      errors: [
        {
          message:
            'Not unique "to_one" association Error: Found > 1 trackers matching animal with animal_id 5. Consider making this a "to_many" association, or using unique constraints, or moving the foreign key into the animal model. Returning first tracker.',
          locations: "",
        },
      ],
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

    res = await itHelpers.request_graph_ql_post(
      `mutation {
        addUser(email:"x@zen.dro", password:"zendro"){
            email
          }
        }`
    );
    expect(res.statusCode).to.equal(200);

    res = itHelpers.request_graph_ql_post(
      "{ users(pagination:{limit:25}) {id} }"
    );
    let users = JSON.parse(res.body.toString("utf8")).data.users;
    res = await itHelpers.request_graph_ql_post(
      `mutation {
        addRole(name:"test_role", addUsers:[${users[users.length - 1].id}]){
            name
          }
        }`
    );
    expect(res.statusCode).to.equal(200);

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

  it("04. User : Role (n:n)", async () => {
    let res = itHelpers.request_graph_ql_post(
      "{ users(pagination:{limit:25}) {id} }"
    );
    let users = JSON.parse(res.body.toString("utf8")).data.users;
    res = itHelpers.request_graph_ql_post(
      `mutation { deleteUser (id: ${users[users.length - 1].id}) }`
    );
    expect(res.statusCode).to.equal(200);

    let cnt = await itHelpers.count_all_records("countUsers");
    expect(cnt).to.equal(0);

    res = itHelpers.request_graph_ql_post(
      "{ roles(pagination:{limit:25}) {id} }"
    );
    let roles = JSON.parse(res.body.toString("utf8")).data.roles;
    res = itHelpers.request_graph_ql_post(
      `mutation { deleteRole (id: ${roles[roles.length - 1].id}) }`
    );
    expect(res.statusCode).to.equal(200);

    cnt = await itHelpers.count_all_records("countRoles");
    expect(cnt).to.equal(0);
  });

  it("05. Dist_animal : Dist_farm (n:1)", async () => {
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
