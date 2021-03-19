const { expect } = require("chai");
const delay = require("delay");
const path = require("path");
const itHelpers = require("./integration_test_misc/integration_test_helpers");

describe("Mongodb - Basic CRUD Operations", () => {
  after(async () => {
    // Delete all animals
    res = itHelpers.request_graph_ql_post(
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

  it("01. Animal: empty table", function () {
    let res = itHelpers.request_graph_ql_post("{ countAnimals }");
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody.data.countAnimals).equal(0);
  });

  it("02. Animal add", async function () {
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

  it("03. Animal: update", function () {
    let res = itHelpers.request_graph_ql_post(
      '{animals(search:{field:animal_name operator:eq value:"Lily"}, pagination:{limit:25}){animal_id}}'
    );
    let resBody = JSON.parse(res.body.toString("utf8"));
    let animal = resBody.data.animals[0].animal_id;

    res = itHelpers.request_graph_ql_post(
      `mutation { updateAnimal(animal_id: ${animal}, animal_name: "Lily2") {animal_id animal_name} }`
    );
    resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        updateAnimal: {
          animal_id: `${animal}`,
          animal_name: "Lily2",
        },
      },
    });
  });

  it("04. Animal: read", function () {
    let res = itHelpers.request_graph_ql_post(
      '{animals(search:{field:animal_name, operator:eq, value:"Lily2"}, pagination:{limit:25}){animal_id}}'
    );
    let resBody = JSON.parse(res.body.toString("utf8"));
    let animal = resBody.data.animals[0].animal_id;

    res = itHelpers.request_graph_ql_post(
      `{ readOneAnimal(animal_id : ${animal}) { animal_id animal_name } }`
    );
    resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        readOneAnimal: {
          animal_id: `${animal}`,
          animal_name: "Lily2",
        },
      },
    });
  });

  it("05. Animal: search with regex", function () {
    let res = itHelpers.request_graph_ql_post(
      '{animals(search:{field:animal_name, value:"Li.*", operator:regexp},pagination:{limit:25}) {animal_name}}'
    );
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody.data.animals.length).equal(1);
  });

  it("06. Animal: delete", async function () {
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

  it("07. Animal: CSV bulkUpload", async function () {
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
    // await delay(100);

    let cnt2 = await itHelpers.count_all_records("countAnimals");
    expect(cnt2 - cnt1).to.equal(6);
  });

  it("08. Animal: paginate", function () {
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

  it("09. Animal: sort", function () {
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
});
