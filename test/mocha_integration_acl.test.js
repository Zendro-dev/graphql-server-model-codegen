const { expect } = require("chai");
const should = require("chai").should();
const itHelpers = require("./integration_test_misc/integration_test_helpers");
let token = null;

describe("Distributed Data Models", () => {
  // The entries created in this test are used in the following ones as well
  it("01. Create a person and 2 dogs", async () => {
    token = await itHelpers.get_token();
    let res = await itHelpers.axios_graph_ql_post(
      'mutation {addPerson(person_id: "instance1-01" name: "Anthony") {person_id name}}',
      token
    );
    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        addPerson: {
          person_id: "instance1-01",
          name: "Anthony",
        },
      },
    });

    res = await itHelpers.axios_graph_ql_post(
      'mutation {addDog(dog_id: "instance2-01" name: "Benji") {dog_id name}}',
      token
    );

    expect(res.status).to.equal(200);

    expect(res.data).to.deep.equal({
      data: {
        addDog: {
          dog_id: "instance2-01",
          name: "Benji",
        },
      },
    });

    res = await itHelpers.axios_graph_ql_post(
      'mutation {addDog(dog_id: "instance2-02" name: "Hector") {dog_id name}}',
      token
    );

    expect(res.status).to.equal(200);

    expect(res.data).to.deep.equal({
      data: {
        addDog: {
          dog_id: "instance2-02",
          name: "Hector",
        },
      },
    });

    res = await itHelpers.axios_graph_ql_post(
      "{dogsConnection(pagination:{first:-1}) {edges{node{dog_id}}}}",
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      errors: [
        {
          message: "LIMIT must not be negative",
          locations: [
            {
              line: 1,
              column: 2,
            },
          ],
          path: ["dogsConnection"],
        },
      ],
      data: {
        dogsConnection: null,
      },
    });
  });

  it("02. Update the person to associate with a dog", async () => {
    let res = await itHelpers.axios_graph_ql_post(
      'mutation {updatePerson(person_id:"instance1-01" addDogs:"instance2-01") {person_id name countFilteredDogs dogsConnection(pagination:{first:5}){edges {node {dog_id name}}}}}',
      token
    );

    expect(res.status).to.equal(200);

    expect(res.data).to.deep.equal({
      data: {
        updatePerson: {
          person_id: "instance1-01",
          name: "Anthony",
          countFilteredDogs: 1,
          dogsConnection: {
            edges: [
              {
                node: {
                  dog_id: "instance2-01",
                  name: "Benji",
                },
              },
            ],
          },
        },
      },
    });
  });

  it("03. Update the other dog to associate with the person", async () => {
    let res = await itHelpers.axios_graph_ql_post(
      'mutation {updateDog(dog_id:"instance2-02" addPerson:"instance1-01") {dog_id name person{person_id name countFilteredDogs}}}',
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        updateDog: {
          dog_id: "instance2-02",
          name: "Hector",
          person: {
            person_id: "instance1-01",
            name: "Anthony",
            countFilteredDogs: 2,
          },
        },
      },
    });
  });

  it("04. Update the person to remove the second dog", async () => {
    let res = await itHelpers.axios_graph_ql_post(
      'mutation{updatePerson(person_id:"instance1-01" removeDogs:"instance2-02") {person_id name countFilteredDogs dogsConnection(pagination:{first:5}){edges{node{dog_id name}}}}}',
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        updatePerson: {
          person_id: "instance1-01",
          name: "Anthony",
          countFilteredDogs: 1,
          dogsConnection: {
            edges: [
              {
                node: {
                  dog_id: "instance2-01",
                  name: "Benji",
                },
              },
            ],
          },
        },
      },
    });
  });

  it("05. Update the first dog to remove the person", async () => {
    let res = await itHelpers.axios_graph_ql_post(
      'mutation{updateDog(dog_id:"instance2-01" removePerson:"instance1-01") {dog_id name person{person_id name}}}',
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        updateDog: {
          dog_id: "instance2-01",
          name: "Benji",
          person: null,
        },
      },
    });
  });

  // At this point, no associations between people and dogs should exist

  it("06. Add another person and read all", async () => {
    let res = await itHelpers.axios_graph_ql_post(
      'mutation{addPerson(person_id:"instance2-01" name:"Bertha") {person_id name countFilteredDogs}}',
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        addPerson: {
          person_id: "instance2-01",
          name: "Bertha",
          countFilteredDogs: 0,
        },
      },
    });
    res = await itHelpers.axios_graph_ql_post(
      "{peopleConnection(pagination:{first:25}){edges{node{person_id name countFilteredDogs}}}}",
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        peopleConnection: {
          edges: [
            {
              node: {
                person_id: "instance1-01",
                name: "Anthony",
                countFilteredDogs: 0,
              },
            },
            {
              node: {
                person_id: "instance2-01",
                name: "Bertha",
                countFilteredDogs: 0,
              },
            },
          ],
        },
      },
    });
  });

  it("07. Search, pagination and sort", async () => {
    // Create a few additional entries so that pagination can be applied better
    let res = await itHelpers.axios_graph_ql_post(
      'mutation{addPerson(person_id:"instance1-02" name:"Charlie") {person_id name}}',
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        addPerson: {
          person_id: "instance1-02",
          name: "Charlie",
        },
      },
    });
    res = await itHelpers.axios_graph_ql_post(
      'mutation{addPerson(person_id:"instance2-02" name:"Dora") {person_id name}}',
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        addPerson: {
          person_id: "instance2-02",
          name: "Dora",
        },
      },
    });
    res = await itHelpers.axios_graph_ql_post(
      'mutation{addPerson(person_id:"instance1-03" name:"Emily" addDogs:"instance2-01") {person_id name countFilteredDogs dogsConnection(pagination:{first:5}){edges{node{dog_id name}}}}}',
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        addPerson: {
          person_id: "instance1-03",
          name: "Emily",
          countFilteredDogs: 1,
          dogsConnection: {
            edges: [
              {
                node: {
                  dog_id: "instance2-01",
                  name: "Benji",
                },
              },
            ],
          },
        },
      },
    });
    // Make sure that no person intended to be stored on server 1 was stored elsewhere
    res = await itHelpers.axios_graph_ql_post(
      '{peopleConnection(search:{field:person_id operator:like value:"instance1%" excludeAdapterNames:"person_instance1"}, pagination:{first:25}) {edges{node{person_id}}}}',
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        peopleConnection: {
          edges: [],
        },
      },
    });
    // Get infos about people on server 1
    res = await itHelpers.axios_graph_ql_post(
      '{peopleConnection(search:{field:person_id operator:like value:"instance1%"},pagination:{first:5}) {edges{node{person_id name countFilteredDogs dogsConnection(pagination:{first:5}){edges{node{dog_id name}}}}}}}',
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        peopleConnection: {
          edges: [
            {
              node: {
                person_id: "instance1-01",
                name: "Anthony",
                countFilteredDogs: 0,
                dogsConnection: {
                  edges: [],
                },
              },
            },
            {
              node: {
                person_id: "instance1-02",
                name: "Charlie",
                countFilteredDogs: 0,
                dogsConnection: {
                  edges: [],
                },
              },
            },
            {
              node: {
                person_id: "instance1-03",
                name: "Emily",
                countFilteredDogs: 1,
                dogsConnection: {
                  edges: [
                    {
                      node: {
                        dog_id: "instance2-01",
                        name: "Benji",
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    });
    // The same search, but order by name descending
    res = await itHelpers.axios_graph_ql_post(
      '{peopleConnection(search:{field:person_id operator:like value:"instance1%"} order:{field:name order:DESC}, pagination:{first:5}) {edges{node{person_id name countFilteredDogs dogsConnection(pagination:{first:5}){edges{node{dog_id name}}}}}}}',
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        peopleConnection: {
          edges: [
            {
              node: {
                person_id: "instance1-03",
                name: "Emily",
                countFilteredDogs: 1,
                dogsConnection: {
                  edges: [
                    {
                      node: {
                        dog_id: "instance2-01",
                        name: "Benji",
                      },
                    },
                  ],
                },
              },
            },
            {
              node: {
                person_id: "instance1-02",
                name: "Charlie",
                countFilteredDogs: 0,
                dogsConnection: {
                  edges: [],
                },
              },
            },
            {
              node: {
                person_id: "instance1-01",
                name: "Anthony",
                countFilteredDogs: 0,
                dogsConnection: {
                  edges: [],
                },
              },
            },
          ],
        },
      },
    });
    // Get the first 3 people by name
    res = await itHelpers.axios_graph_ql_post(
      "{peopleConnection(order:{field:name order:ASC} pagination:{first:3}) {edges{node{person_id name countFilteredDogs dogsConnection(pagination:{first:5}){edges{node{dog_id name}}}}}}}",
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        peopleConnection: {
          edges: [
            {
              node: {
                person_id: "instance1-01",
                name: "Anthony",
                countFilteredDogs: 0,
                dogsConnection: {
                  edges: [],
                },
              },
            },
            {
              node: {
                person_id: "instance2-01",
                name: "Bertha",
                countFilteredDogs: 0,
                dogsConnection: {
                  edges: [],
                },
              },
            },
            {
              node: {
                person_id: "instance1-02",
                name: "Charlie",
                countFilteredDogs: 0,
                dogsConnection: {
                  edges: [],
                },
              },
            },
          ],
        },
      },
    });

    // 'Free' dog Benji so that the entries can be erased next
    res = await itHelpers.axios_graph_ql_post(
      'mutation{updateDog(dog_id:"instance2-01" removePerson:"instance1-03") {dog_id name person_id}}',
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        updateDog: {
          dog_id: "instance2-01",
          name: "Benji",
          person_id: null,
        },
      },
    });

    //illegal cursor based pagination Arguments
    res = await itHelpers.axios_graph_ql_post(
      '{peopleConnection(order:{field:name order:ASC}\
             pagination:{last:2, after:"eyJuYW1lIjoiRG9yYSIsInBlcnNvbl9pZCI6Imluc3RhbmNlMi0wMiJ9"})\
               {edges{node{person_id name countFilteredDogs}cursor}}}',
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      errors: [
        {
          message:
            'Illegal cursor based pagination arguments. Use either "first" and optionally "after", or "last" and optionally "before"!',
          locations: [
            {
              line: 1,
              column: 2,
            },
          ],
          path: ["peopleConnection"],
        },
      ],
      data: {
        peopleConnection: null,
      },
    });

    //parseOrderCursor Tests (after)
    res = await itHelpers.axios_graph_ql_post(
      '{peopleConnection(order:{field:name order:ASC} pagination:{\
            first:2, after:"eyJuYW1lIjoiQmVydGhhIiwicGVyc29uX2lkIjoiaW5zdGFuY2UyLTAxIn0="}) \
            {edges{node{person_id name countFilteredDogs dogsConnection(pagination:{first:5}){edges{node{dog_id name}}}}cursor} pageInfo{startCursor endCursor hasNextPage hasPreviousPage}}}',
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        peopleConnection: {
          edges: [
            {
              node: {
                person_id: "instance1-02",
                name: "Charlie",
                countFilteredDogs: 0,
                dogsConnection: {
                  edges: [],
                },
              },
              cursor:
                "eyJuYW1lIjoiQ2hhcmxpZSIsInBlcnNvbl9pZCI6Imluc3RhbmNlMS0wMiJ9",
            },
            {
              node: {
                person_id: "instance2-02",
                name: "Dora",
                countFilteredDogs: 0,
                dogsConnection: {
                  edges: [],
                },
              },
              cursor:
                "eyJuYW1lIjoiRG9yYSIsInBlcnNvbl9pZCI6Imluc3RhbmNlMi0wMiJ9",
            },
          ],
          pageInfo: {
            startCursor:
              "eyJuYW1lIjoiQ2hhcmxpZSIsInBlcnNvbl9pZCI6Imluc3RhbmNlMS0wMiJ9",
            endCursor:
              "eyJuYW1lIjoiRG9yYSIsInBlcnNvbl9pZCI6Imluc3RhbmNlMi0wMiJ9",
            hasNextPage: true,
            hasPreviousPage: true,
          },
        },
      },
    });
    //parseOrderCursor Tests (before + includeCursor)
    res = await itHelpers.axios_graph_ql_post(
      '{peopleConnection(order:{field:name order:ASC} pagination:{\
            last:2, before:"eyJuYW1lIjoiRG9yYSIsInBlcnNvbl9pZCI6Imluc3RhbmNlMi0wMiJ9", includeCursor:true})\
            {edges{node{person_id name countFilteredDogs dogsConnection(pagination:{first:5}){edges{node{dog_id name}}}}cursor}\
            pageInfo{startCursor endCursor hasPreviousPage hasNextPage}}}',
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        peopleConnection: {
          edges: [
            {
              node: {
                person_id: "instance1-02",
                name: "Charlie",
                countFilteredDogs: 0,
                dogsConnection: {
                  edges: [],
                },
              },
              cursor:
                "eyJuYW1lIjoiQ2hhcmxpZSIsInBlcnNvbl9pZCI6Imluc3RhbmNlMS0wMiJ9",
            },
            {
              node: {
                person_id: "instance2-02",
                name: "Dora",
                countFilteredDogs: 0,
                dogsConnection: {
                  edges: [],
                },
              },
              cursor:
                "eyJuYW1lIjoiRG9yYSIsInBlcnNvbl9pZCI6Imluc3RhbmNlMi0wMiJ9",
            },
          ],
          pageInfo: {
            startCursor:
              "eyJuYW1lIjoiQ2hhcmxpZSIsInBlcnNvbl9pZCI6Imluc3RhbmNlMS0wMiJ9",
            endCursor:
              "eyJuYW1lIjoiRG9yYSIsInBlcnNvbl9pZCI6Imluc3RhbmNlMi0wMiJ9",
            hasPreviousPage: true,
            hasNextPage: true,
          },
        },
      },
    });
  });
  it("08. Delete people and dogs", async () => {
    // Delete dog Hector
    let res = await itHelpers.axios_graph_ql_post(
      'mutation{deleteDog(dog_id:"instance2-02")}',
      token
    );
    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        deleteDog: "Item successfully deleted",
      },
    });
    // Delete dog Benji
    res = await itHelpers.axios_graph_ql_post(
      'mutation{deleteDog(dog_id:"instance2-01")}',
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        deleteDog: "Item successfully deleted",
      },
    });
    // Make sure that no dog is left
    res = await itHelpers.axios_graph_ql_post(
      "{dogsConnection(pagination:{first:5}){edges{node{dog_id}}}}",
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        dogsConnection: {
          edges: [],
        },
      },
    });
    // Delete Emily
    res = await itHelpers.axios_graph_ql_post(
      'mutation{deletePerson(person_id:"instance1-03")}',
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        deletePerson: "Item successfully deleted",
      },
    });
    // Delete Dora
    res = await itHelpers.axios_graph_ql_post(
      'mutation{deletePerson(person_id:"instance2-02")}',
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        deletePerson: "Item successfully deleted",
      },
    });
    // Make sure that only Anthony, Bertha and Charlie are left
    res = await itHelpers.axios_graph_ql_post(
      "{peopleConnection(order:{field:name order:ASC},pagination:{first:5}){edges{node{person_id name}}}}",
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        peopleConnection: {
          edges: [
            {
              node: {
                person_id: "instance1-01",
                name: "Anthony",
              },
            },
            {
              node: {
                person_id: "instance2-01",
                name: "Bertha",
              },
            },
            {
              node: {
                person_id: "instance1-02",
                name: "Charlie",
              },
            },
          ],
        },
      },
    });
  });
  it("09. Delete all remaining people", async () => {
    let res = await itHelpers.axios_graph_ql_post(
      "{peopleConnection(pagination:{first:5}){edges{node{person_id}}}}",
      token
    );
    let people = res.data.data.peopleConnection.edges;

    for (let i = 0; i < people.length; i++) {
      res = await itHelpers.axios_graph_ql_post(
        `mutation { deletePerson (person_id: "${people[i].node.person_id}") }`,
        token
      );
      expect(res.status).to.equal(200);
    }
    res = await itHelpers.axios_graph_ql_post(`{ countPeople }`, token);
    let cnt = res.data.data.countPeople;
    expect(cnt).to.equal(0);
  });

  //one_to_one associations where foreignKey is in the target model
  it("10. one_to_one ddm associations setup", async () => {
    //setup
    await itHelpers.axios_graph_ql_post(
      'mutation { addPerson(person_id: "instance1-person01") {person_id} }',
      token
    );
    let res = await itHelpers.axios_graph_ql_post(
      "{peopleConnection(pagination:{first:5}){edges{node{person_id}}}}",
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data.data.peopleConnection.edges.length).equal(1);

    await itHelpers.axios_graph_ql_post_instance2(
      'mutation { addParrot(parrot_id:"instance2-parrot01", addUnique_person:"instance1-person01") {parrot_id} }',
      token
    );
    res = await itHelpers.axios_graph_ql_post(
      "{parrotsConnection(pagination:{first:5}){edges{node{parrot_id}}}}",
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data.data.parrotsConnection.edges.length).equal(1);
  });

  it("11. one_to_one ddm associations success", async () => {
    //test success
    let res = await itHelpers.axios_graph_ql_post(
      "{peopleConnection(pagination:{first:5}){edges{node{person_id unique_parrot{parrot_id}}}}}",
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        peopleConnection: {
          edges: [
            {
              node: {
                person_id: "instance1-person01",
                unique_parrot: {
                  parrot_id: "instance2-parrot01",
                },
              },
            },
          ],
        },
      },
    });
  });

  it("12. one_to_one ddm association update", async () => {
    //test error
    await itHelpers.axios_graph_ql_post_instance2(
      'mutation { addParrot(parrot_id:"instance2-parrot02", addUnique_person:"instance1-person01") {parrot_id} }',
      token
    );
    let res = await itHelpers.axios_graph_ql_post(
      "{peopleConnection(pagination:{first:5}) {edges {node {person_id unique_parrot {parrot_id}}}}}",
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        peopleConnection: {
          edges: [
            {
              node: {
                person_id: "instance1-person01",
                unique_parrot: {
                  parrot_id: "instance2-parrot02",
                },
              },
            },
          ],
        },
      },
    });
  });

  it("13. one_to_one ddm associations deletion cleanup", async () => {
    //cleanup
    let res = await itHelpers.axios_graph_ql_post(
      'mutation { updatePerson(person_id: "instance1-person01", removeUnique_parrot:"instance2-parrot01") {person_id} }',
      token
    );
    expect(res.status).to.equal(200);
    res = await itHelpers.axios_graph_ql_post(
      'mutation { updatePerson(person_id: "instance1-person01", removeUnique_parrot:"instance2-parrot02") {person_id} }',
      token
    );
    expect(res.status).to.equal(200);
    res = await itHelpers.axios_graph_ql_post(
      'mutation { deletePerson(person_id: "instance1-person01")}',
      token
    );
    expect(res.status).to.equal(200);
    res = await itHelpers.axios_graph_ql_post(
      'mutation { deleteParrot(parrot_id: "instance2-parrot01")}',
      token
    );
    expect(res.status).to.equal(200);
    res = await itHelpers.axios_graph_ql_post(
      'mutation { deleteParrot(parrot_id: "instance2-parrot02")}',
      token
    );
    expect(res.status).to.equal(200);
  });
});

describe("Zendro Webservice Data Models", function () {
  it("01. Create one accession", async () => {
    token = await itHelpers.get_token();
    let res = await itHelpers.axios_graph_ql_post_instance2(
      'mutation {addAccession(accession_id: "zendro_1-to-instance1" collectors_name:"me"){ accession_id collectors_name}}',
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        addAccession: {
          accession_id: "zendro_1-to-instance1",
          collectors_name: "me",
        },
      },
    });
  });

  it("02. Read one accession", async () => {
    let res = await itHelpers.axios_graph_ql_post_instance2(
      'query {readOneAccession(accession_id: "zendro_1-to-instance1"){ accession_id collectors_name}}',
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        readOneAccession: {
          accession_id: "zendro_1-to-instance1",
          collectors_name: "me",
        },
      },
    });
  });

  it("03. Update one accession", async () => {
    let res = await itHelpers.axios_graph_ql_post_instance2(
      'mutation {updateAccession(accession_id: "zendro_1-to-instance1" collectors_name:"someone_else"){ accession_id collectors_name}}',
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        updateAccession: {
          accession_id: "zendro_1-to-instance1",
          collectors_name: "someone_else",
        },
      },
    });
  });

  it("04. Delete one accession", async () => {
    let res = await itHelpers.axios_graph_ql_post_instance2(
      'mutation {deleteAccession(accession_id: "zendro_1-to-instance1")}',
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        deleteAccession: "Item successfully deleted",
      },
    });
  });

  it("05. Connection accessions", async () => {
    await itHelpers.axios_graph_ql_post_instance2(
      'mutation {addAccession(accession_id: "a-instance1" collectors_name:"aa"){ accession_id}}',
      token
    );
    await itHelpers.axios_graph_ql_post_instance2(
      'mutation {addAccession(accession_id: "b-instance1" collectors_name:"bb"){ accession_id}}',
      token
    );
    await itHelpers.axios_graph_ql_post_instance2(
      'mutation {addAccession(accession_id: "c-instance1" collectors_name:"cc"){ accession_id}}',
      token
    );
    await itHelpers.axios_graph_ql_post_instance2(
      'mutation {addAccession(accession_id: "d-instance1" collectors_name:"dd"){ accession_id}}',
      token
    );
    let res = await itHelpers.axios_graph_ql_post_instance2(
      "query {accessionsConnection(pagination:{first:5}){ edges{node{accession_id}}}}",
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        accessionsConnection: {
          edges: [
            {
              node: {
                accession_id: "a-instance1",
              },
            },
            {
              node: {
                accession_id: "b-instance1",
              },
            },
            {
              node: {
                accession_id: "c-instance1",
              },
            },
            {
              node: {
                accession_id: "d-instance1",
              },
            },
          ],
        },
      },
    });
  });

  it("06. Sort accessions", async () => {
    /**
     * This integration test assumes that data from previous test (Connection accession) is still stored on the DB.
     */
    let res = await itHelpers.axios_graph_ql_post_instance2(
      "query {accessions(order: {field: collectors_name order: DESC},pagination:{limit:5}){collectors_name}}",
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        accessions: [
          {
            collectors_name: "dd",
          },
          {
            collectors_name: "cc",
          },
          {
            collectors_name: "bb",
          },
          {
            collectors_name: "aa",
          },
        ],
      },
    });
  });

  it("07. Search accessions", async () => {
    /**
     * This integration test assumes that data from previous test (Connection accession) is still stored on the DB.
     * This test will do a OR search.
     */
    let res = await itHelpers.axios_graph_ql_post_instance2(
      'query {accessions(pagination:{limit:10},search:{operator: or search:[{field:collectors_name value:"%c%" operator:like },{field:collectors_name value:"%d%" operator:like} ]}){collectors_name}}',
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        accessions: [
          {
            collectors_name: "cc",
          },
          {
            collectors_name: "dd",
          },
        ],
      },
    });
  });

  it("08. Pagination (offset based) accessions", async () => {
    /**
     * This integration test assumes that data from previous test (Connection accession) is still stored on the DB.
     * This test will do a OR search.
     */
    let res = await itHelpers.axios_graph_ql_post_instance2(
      "query {accessions(pagination:{ offset:1 limit: 2}){ accession_id}}",
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        accessions: [
          {
            accession_id: "b-instance1",
          },
          {
            accession_id: "c-instance1",
          },
        ],
      },
    });
  });

  it("09. Pagination (cursor based) accessions", async () => {
    /**
     * This integration test assumes that data from previous tests is still stored on the DB.
     * This test will do a OR search.
     */
    let res = await itHelpers.axios_graph_ql_post_instance2(
      "query {accessionsConnection(pagination:{ first: 2} order:{field: collectors_name order:DESC}){ edges{node{accession_id}}}}",
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        accessionsConnection: {
          edges: [
            {
              node: {
                accession_id: "d-instance1",
              },
            },
            {
              node: {
                accession_id: "c-instance1",
              },
            },
          ],
        },
      },
    });
  });

  it("10. Create record with association(to-one) accession-location", async () => {
    //add location first
    await itHelpers.axios_graph_ql_post_instance2(
      'mutation{addLocation(locationId: "location-zendro-1"){locationId}}',
      token
    );

    //create accession with the location created in the line above
    let res = await itHelpers.axios_graph_ql_post_instance2(
      'mutation{addAccession(accession_id:"zendro-2-accession" addLocation:"location-zendro-1" ){location{locationId}}}',
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        addAccession: {
          location: {
            locationId: "location-zendro-1",
          },
        },
      },
    });
  });

  it("11. Create record on remote server with failed Validation", async () => {
    res = await itHelpers.axios_graph_ql_post_instance2(
      'mutation{addAccession(accession_id:"faulty-accesion-instance1" collectors_name:"@#$%^&") {accession_id sampling_date}}',
      token
    );
    expect(res.response.status).to.equal(500);
    expect(res.response.data).to.deep.equal({
      errors: [
        {
          message:
            "Web-service http://server1:3000/graphql returned attached (see below) error(s).",
          locations: [{ line: 1, column: 10 }],
          path: ["addAccession"],
        },
        {
          message: "validation failed",
          locations: [{ line: 7, column: 15 }],
          extensions: {
            validationErrors: [
              {
                keyword: "pattern",
                dataPath: ".collectors_name",
                schemaPath: "#/properties/collectors_name/pattern",
                params: { pattern: "^[a-zA-Z0-9_]+$" },
                message: 'should match pattern "^[a-zA-Z0-9_]+$"',
              },
            ],
            receivedFrom: ["http://server1:3000/graphql"],
          },
          path: ["addAccession"],
        },
      ],
      data: null,
    });
  });

  it("12. Remove association(to-one) accession-location", async () => {
    /**
     * This test assumes that the accession and location created in the previous test(10. Create record with association accession-location) are still in the DB
     * */
    let res = await itHelpers.axios_graph_ql_post_instance2(
      'mutation{updateAccession(accession_id:"zendro-2-accession" removeLocation:"location-zendro-1"){locationId location{locationId}}}',
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        updateAccession: {
          locationId: null,
          location: null,
        },
      },
    });
  });

  it("13. Update association(to-one) accession-location", async () => {
    /**
     * This test assumes that the accession and location created in the previous test(10. Create record with association accession-location) are still in the DB
     * */
    let res = await itHelpers.axios_graph_ql_post_instance2(
      'mutation{updateAccession(accession_id:"zendro-2-accession" addLocation:"location-zendro-1"){location{locationId}}}',
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        updateAccession: {
          location: {
            locationId: "location-zendro-1",
          },
        },
      },
    });

    //remove association for cleaning
    await itHelpers.axios_graph_ql_post_instance2(
      'mutation{updateAccession(accession_id:"zendro-2-accession" removeLocation:"location-zendro-1"){location{locationId}}}',
      token
    );
  });

  it("14.Create with association(to-many) accession-measurement", async () => {
    /**
     * Create measurements that will be associated to accession
     * */
    await itHelpers.axios_graph_ql_post_instance2(
      'mutation{addMeasurement(measurement_id:"measuremente_test_1" ){measurement_id}}',
      token
    );
    await itHelpers.axios_graph_ql_post_instance2(
      'mutation{addMeasurement(measurement_id:"measuremente_test_2" ){measurement_id}}',
      token
    );
    await itHelpers.axios_graph_ql_post_instance2(
      'mutation{addMeasurement(measurement_id:"measuremente_test_3" ){measurement_id}}',
      token
    );

    let res = await itHelpers.axios_graph_ql_post_instance2(
      'mutation{addAccession(accession_id:"zendro-3-accession" addMeasurements:["measuremente_test_1","measuremente_test_2","measuremente_test_3"]){ measurementsFilter(order:{field: measurement_id order: ASC},pagination:{limit:5}){measurement_id}}}',
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        addAccession: {
          measurementsFilter: [
            {
              measurement_id: "measuremente_test_1",
            },
            {
              measurement_id: "measuremente_test_2",
            },
            {
              measurement_id: "measuremente_test_3",
            },
          ],
        },
      },
    });
  });

  it("15.Remove association(to-many) accession-measurement", async () => {
    /**
     * This test assumes that association from previous test (13.Create with association(to-many) accession-measurement) still is stored in the DB.
     * */

    let res = await itHelpers.axios_graph_ql_post_instance2(
      'mutation{updateAccession(accession_id:"zendro-3-accession" removeMeasurements:["measuremente_test_1","measuremente_test_3"]){ measurementsFilter(pagination:{limit:5}){measurement_id}}}',
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        updateAccession: {
          measurementsFilter: [
            {
              measurement_id: "measuremente_test_2",
            },
          ],
        },
      },
    });
  });

  it("16.Update add association(to-many) accession-measurement", async () => {
    /**
     * This test assumes that association from previous tests (13.Create with association(to-many and 14.Remove association(to-many) accession-measurement) accession-measurement) still is stored in the DB.
     * */

    let res = await itHelpers.axios_graph_ql_post_instance2(
      'mutation{updateAccession(accession_id:"zendro-3-accession" addMeasurements:["measuremente_test_1","measuremente_test_3"]){ measurementsFilter(order:{field: measurement_id order: ASC},pagination:{limit:5}){measurement_id}}}',
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        updateAccession: {
          measurementsFilter: [
            {
              measurement_id: "measuremente_test_1",
            },
            {
              measurement_id: "measuremente_test_2",
            },
            {
              measurement_id: "measuremente_test_3",
            },
          ],
        },
      },
    });
  });

  it("17. Read connection association(to-many) accession-measurement", async () => {
    /**
     * This test assumes that association from previous tests (13.Create with association(to-many and 14.Remove association(to-many) accession-measurement) accession-measurement) still is stored in the DB.
     * */

    let res = await itHelpers.axios_graph_ql_post_instance2(
      'query {readOneAccession(accession_id:"zendro-3-accession"){ measurementsConnection(order:{field: measurement_id order: ASC}, pagination:{first:5}){ edges{node{measurement_id}}}}}',
      token
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.deep.equal({
      data: {
        readOneAccession: {
          measurementsConnection: {
            edges: [
              {
                node: {
                  measurement_id: "measuremente_test_1",
                },
              },
              {
                node: {
                  measurement_id: "measuremente_test_2",
                },
              },
              {
                node: {
                  measurement_id: "measuremente_test_3",
                },
              },
            ],
          },
        },
      },
    });

    //remove associations for cleaning
    await itHelpers.axios_graph_ql_post_instance2(
      'mutation{updateAccession(accession_id:"zendro-3-accession" removeMeasurements:["measuremente_test_1","measuremente_test_2","measuremente_test_3"]){ measurementsFilter(pagination:{limit:5}){measurement_id}}}',
      token
    );
  });

  it("18. Delete all remaining accessions", async () => {
    let res = await itHelpers.axios_graph_ql_post_instance2(
      "{accessions(pagination:{limit:25}){accession_id}}",
      token
    );
    let accessions = res.data.data.accessions;

    for (let i = 0; i < accessions.length; i++) {
      res = await itHelpers.axios_graph_ql_post_instance2(
        `mutation { deleteAccession (accession_id: "${accessions[i].accession_id}") }`,
        token
      );
      expect(res.status).to.equal(200);
    }
    res = await itHelpers.axios_graph_ql_post(`{ countAccessions }`, token);
    let cnt = res.data.data.countAccessions;
    expect(cnt).to.equal(0);
  });

  it("19. Delete all remaining measurements", async function () {
    let res = await itHelpers.axios_graph_ql_post_instance2(
      "{measurements(pagination:{limit:25}){measurement_id}}",
      token
    );
    let measurements = res.data.data.measurements;

    for (let i = 0; i < measurements.length; i++) {
      res = await itHelpers.axios_graph_ql_post_instance2(
        `mutation { deleteMeasurement (measurement_id: "${measurements[i].measurement_id}") }`,
        token
      );
      expect(res.status).to.equal(200);
    }

    res = await itHelpers.axios_graph_ql_post(`{ countMeasurements }`, token);
    let cnt = res.data.data.countMeasurements;
    expect(cnt).to.equal(0);
  });

  it("20. Delete all remaining locations", async function () {
    let res = await itHelpers.axios_graph_ql_post_instance2(
      "{locations(pagination:{limit:25}){locationId}}",
      token
    );
    let locations = res.data.data.locations;

    for (let i = 0; i < locations.length; i++) {
      res = await itHelpers.axios_graph_ql_post_instance2(
        `mutation { deleteLocation (locationId: "${locations[i].locationId}") }`,
        token
      );
      expect(res.status).to.equal(200);
    }

    res = await itHelpers.axios_graph_ql_post(`{ countLocations }`, token);
    let cnt = res.data.data.countLocations;
    expect(cnt).to.equal(0);
  });
});

describe("bulkAssociation", function () {
  // set up the environment
  before(async function () {
    //measurements for sql and zendro-server tests
    token = await itHelpers.get_token();
    let res = await itHelpers.axios_graph_ql_post(
      'mutation{addMeasurement(measurement_id:"m1" ){measurement_id}}',
      token
    );
    expect(res.status).to.equal(200);
    res = await itHelpers.axios_graph_ql_post(
      'mutation{addMeasurement(measurement_id:"m2" ){measurement_id}}',
      token
    );
    expect(res.status).to.equal(200);
    res = await itHelpers.axios_graph_ql_post(
      'mutation{addMeasurement(measurement_id:"m3" ){measurement_id}}',
      token
    );
    expect(res.status).to.equal(200);
    res = await itHelpers.axios_graph_ql_post(
      'mutation{addMeasurement(measurement_id:"m4" ){measurement_id}}',
      token
    );
    expect(res.status).to.equal(200);
    res = await itHelpers.axios_graph_ql_post(
      'mutation{addAccession(accession_id:"a1" ){accession_id}}',
      token
    );
    expect(res.status).to.equal(200);
    res = await itHelpers.axios_graph_ql_post(
      'mutation{addAccession(accession_id:"a2" ){accession_id}}',
      token
    );
    expect(res.status).to.equal(200);
    //dogs for distributed tests
    res = await itHelpers.axios_graph_ql_post(
      'mutation {addDog(dog_id: "instance1-d01") {dog_id}}',
      token
    );
    expect(res.status).to.equal(200);
    res = await itHelpers.axios_graph_ql_post(
      'mutation {addDog(dog_id: "instance1-d02") {dog_id}}',
      token
    );
    expect(res.status).to.equal(200);
    res = await itHelpers.axios_graph_ql_post(
      'mutation {addDog(dog_id: "instance2-d01") {dog_id}}',
      token
    );
    expect(res.status).to.equal(200);
    res = await itHelpers.axios_graph_ql_post(
      'mutation {addDog(dog_id: "instance2-d02") {dog_id}}',
      token
    );
    expect(res.status).to.equal(200);
    res = await itHelpers.axios_graph_ql_post(
      'mutation {addPerson(person_id: "instance1-p01") {person_id}}',
      token
    );
    expect(res.status).to.equal(200);
    res = await itHelpers.axios_graph_ql_post(
      'mutation {addPerson(person_id: "instance2-p01") {person_id}}',
      token
    );
    expect(res.status).to.equal(200);
  });

  // clean up records
  after(async function () {
    await itHelpers.axios_graph_ql_post(
      'mutation{deleteMeasurement(measurement_id:"m1")}',
      token
    );
    await itHelpers.axios_graph_ql_post(
      'mutation{deleteMeasurement(measurement_id:"m2")}',
      token
    );
    await itHelpers.axios_graph_ql_post(
      'mutation{deleteMeasurement(measurement_id:"m3")}',
      token
    );
    await itHelpers.axios_graph_ql_post(
      'mutation{deleteMeasurement(measurement_id:"m4")}',
      token
    );
    await itHelpers.axios_graph_ql_post(
      'mutation{deleteAccession(accession_id:"a1")}',
      token
    );
    await itHelpers.axios_graph_ql_post(
      'mutation{deleteAccession(accession_id:"a2")}',
      token
    );
    await itHelpers.axios_graph_ql_post(
      'mutation {deleteDog(dog_id: "instance1-d01")}',
      token
    );
    await itHelpers.axios_graph_ql_post(
      'mutation {deleteDog(dog_id: "instance1-d02")}',
      token
    );
    await itHelpers.axios_graph_ql_post(
      'mutation {deleteDog(dog_id: "instance2-d01")}',
      token
    );
    await itHelpers.axios_graph_ql_post(
      'mutation {deleteDog(dog_id: "instance2-d02")}',
      token
    );
    await itHelpers.axios_graph_ql_post(
      'mutation {deletePerson(person_id: "instance1-p01")}',
      token
    );
    await itHelpers.axios_graph_ql_post(
      'mutation {deletePerson(person_id: "instance2-p01")}',
      token
    );
  });

  it("01. bulkAssociation - sql", async () => {
    let res = await itHelpers.axios_graph_ql_post(
      'mutation{bulkAssociateMeasurementWithAccessionId(bulkAssociationInput: [{measurement_id:"m1", accessionId: "a1"},{measurement_id:"m2", accessionId: "a1"},{measurement_id:"m3", accessionId: "a2"},{measurement_id:"m4", accessionId: "a2"}] )}',
      token
    );
    expect(res.status).to.equal(200);

    expect(res.data.data.bulkAssociateMeasurementWithAccessionId).equal(
      "Records successfully updated!"
    );
    //check if records have been correctly updated
    res = await itHelpers.axios_graph_ql_post(
      "{accessions(pagination:{limit: 10}){accession_id measurementsFilter(pagination:{limit:5}){measurement_id}}}",
      token
    );

    expect(res.data).to.deep.equal({
      data: {
        accessions: [
          {
            accession_id: "a1",
            measurementsFilter: [
              { measurement_id: "m1" },
              { measurement_id: "m2" },
            ],
          },
          {
            accession_id: "a2",
            measurementsFilter: [
              { measurement_id: "m3" },
              { measurement_id: "m4" },
            ],
          },
        ],
      },
    });
  });

  it("02. bulkDisAssociation - sql", async () => {
    let res = await itHelpers.axios_graph_ql_post(
      'mutation{bulkDisAssociateMeasurementWithAccessionId(bulkAssociationInput: [{measurement_id:"m1", accessionId: "a1"},{measurement_id:"m2", accessionId: "a1"},{measurement_id:"m3", accessionId: "a2"},{measurement_id:"m4", accessionId: "a2"}] )}',
      token
    );
    expect(res.status).to.equal(200);

    expect(res.data.data.bulkDisAssociateMeasurementWithAccessionId).equal(
      "Records successfully updated!"
    );
    //check if records have been correctly updated
    res = await itHelpers.axios_graph_ql_post(
      "{accessions(pagination:{limit: 10}){accession_id measurementsFilter(pagination:{limit:5}){measurement_id}}}",
      token
    );

    expect(res.data).to.deep.equal({
      data: {
        accessions: [
          { accession_id: "a1", measurementsFilter: [] },
          { accession_id: "a2", measurementsFilter: [] },
        ],
      },
    });
  });

  it("03. bulkAssociation - zendro-server", async () => {
    let res = await itHelpers.axios_graph_ql_post_instance2(
      'mutation{bulkAssociateMeasurementWithAccessionId(bulkAssociationInput: [{measurement_id:"m1", accessionId: "a1"},{measurement_id:"m2", accessionId: "a1"},{measurement_id:"m3", accessionId: "a2"},{measurement_id:"m4", accessionId: "a2"}] )}',
      token
    );
    expect(res.status).to.equal(200);

    expect(res.data.data.bulkAssociateMeasurementWithAccessionId).equal(
      "Records successfully updated!"
    );
    //check if records have been correctly updated
    res = await itHelpers.axios_graph_ql_post(
      "{accessions(pagination:{limit: 10}){accession_id measurementsFilter(pagination:{limit:5}){measurement_id}}}",
      token
    );

    expect(res.data).to.deep.equal({
      data: {
        accessions: [
          {
            accession_id: "a1",
            measurementsFilter: [
              { measurement_id: "m1" },
              { measurement_id: "m2" },
            ],
          },
          {
            accession_id: "a2",
            measurementsFilter: [
              { measurement_id: "m3" },
              { measurement_id: "m4" },
            ],
          },
        ],
      },
    });
  });

  it("04. bulkDisAssociation - zendro-server", async () => {
    let res = await itHelpers.axios_graph_ql_post_instance2(
      'mutation{bulkDisAssociateMeasurementWithAccessionId(bulkAssociationInput: [{measurement_id:"m1", accessionId: "a1"},{measurement_id:"m2", accessionId: "a1"},{measurement_id:"m3", accessionId: "a2"},{measurement_id:"m4", accessionId: "a2"}] )}',
      token
    );
    expect(res.status).to.equal(200);

    expect(res.data.data.bulkDisAssociateMeasurementWithAccessionId).equal(
      "Records successfully updated!"
    );
    //check if records have been correctly updated
    res = await itHelpers.axios_graph_ql_post(
      "{accessions(pagination:{limit: 10}){accession_id measurementsFilter(pagination:{limit:5}){measurement_id}}}",
      token
    );

    expect(res.data).to.deep.equal({
      data: {
        accessions: [
          { accession_id: "a1", measurementsFilter: [] },
          { accession_id: "a2", measurementsFilter: [] },
        ],
      },
    });
  });

  it("05. bulkAssociation - ddm", async () => {
    let res = await itHelpers.axios_graph_ql_post(
      'mutation{bulkAssociateDogWithPerson_id(bulkAssociationInput: [{dog_id:"instance1-d01", person_id: "instance1-p01"},{dog_id:"instance2-d01", person_id: "instance1-p01"},{dog_id:"instance1-d02", person_id: "instance2-p01"},{dog_id:"instance2-d02", person_id: "instance2-p01"}] )}',
      token
    );
    expect(res.status).to.equal(200);

    expect(res.data.data.bulkAssociateDogWithPerson_id).equal(
      "Records successfully updated!"
    );
    //check if records have been correctly updated
    res = await itHelpers.axios_graph_ql_post(
      "{peopleConnection(pagination:{first: 10}){edges{node{person_id dogsConnection(pagination:{first:5}){edges{node{dog_id}}}}}}}",
      token
    );

    expect(res.data).to.deep.equal({
      data: {
        peopleConnection: {
          edges: [
            {
              node: {
                person_id: "instance1-p01",
                dogsConnection: {
                  edges: [
                    { node: { dog_id: "instance1-d01" } },
                    { node: { dog_id: "instance2-d01" } },
                  ],
                },
              },
            },
            {
              node: {
                person_id: "instance2-p01",
                dogsConnection: {
                  edges: [
                    { node: { dog_id: "instance1-d02" } },
                    { node: { dog_id: "instance2-d02" } },
                  ],
                },
              },
            },
          ],
        },
      },
    });
  });

  it("06. bulkDisAssociation - ddm", async () => {
    let res = await itHelpers.axios_graph_ql_post(
      'mutation{bulkDisAssociateDogWithPerson_id(bulkAssociationInput: [{dog_id:"instance1-d01", person_id: "instance1-p01"},{dog_id:"instance2-d01", person_id: "instance1-p01"},{dog_id:"instance1-d02", person_id: "instance2-p01"},{dog_id:"instance2-d02", person_id: "instance2-p01"}] )}',
      token
    );
    expect(res.status).to.equal(200);

    expect(res.data.data.bulkDisAssociateDogWithPerson_id).equal(
      "Records successfully updated!"
    );
    //check if records have been correctly updated
    res = await itHelpers.axios_graph_ql_post(
      "{peopleConnection(pagination:{first: 10}){edges{node{person_id dogsConnection(pagination:{first:5}){edges{node{dog_id}}}}}}}",
      token
    );
    expect(res.data).to.deep.equal({
      data: {
        peopleConnection: {
          edges: [
            {
              node: {
                person_id: "instance1-p01",
                dogsConnection: { edges: [] },
              },
            },
            {
              node: {
                person_id: "instance2-p01",
                dogsConnection: { edges: [] },
              },
            },
          ],
        },
      },
    });
  });
});
