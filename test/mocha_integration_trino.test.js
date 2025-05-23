const { expect } = require("chai");
const itHelpers = require("./integration_test_misc/integration_test_helpers");

describe("Trino - Read Access", () => {
  it("01. trino_doctor: read one record", () => {
    let res = itHelpers.request_graph_ql_post_instance2(`
      {
        readOneTrino_doctor(doctor_id:"d1"){
          doctor_id
          birthday
          experience
          rating
          on_holiday
          speciality
          telephone
        }
      }`);
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        readOneTrino_doctor: {
          doctor_id: "d1",
          birthday: "1989-12-03T10:15:30.000Z",
          experience: 3,

          rating: 4.9,
          on_holiday: false,
          speciality: ["Tinnitus", "Allergology"],
          telephone: [152234, 137584],
        },
      },
    });
  });

  it("02. trino_doctor: count trino_doctors with like operator", () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      `{countTrino_doctors(search:{operator: like, field: doctor_id, 
        value: "d%"})}`
    );
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody.data.countTrino_doctors).equal(5);
  });

  it("03. trino_doctor: search with and operator", () => {
    let res = itHelpers.request_graph_ql_post_instance2(`
    {
      trino_doctors(
        search: {
          operator: and,
          search: [
            {operator: eq, field: doctor_id, value: "d1"}, 
            {operator: eq, field: on_holiday, value: "false"}
          ]
        },
        pagination:{limit:5}) {
          doctor_id
          on_holiday
        }
    }`);
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        trino_doctors: [
          {
            doctor_id: "d1",
            on_holiday: false,
          },
        ],
      },
    });
  });

  it("04. trino_doctor: search with or operator", () => {
    let res = itHelpers.request_graph_ql_post_instance2(`
    {
      trino_doctors(
        search: {
          operator: or,
          search: [
            {operator: eq, field: doctor_id, value: "d1"}, 
            {operator: eq, field: doctor_id, value: "d2"}
          ]
        },
        pagination:{limit:5}) {
          doctor_id
        }
    }`);
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        trino_doctors: [
          {
            doctor_id: "d1",
          },
          {
            doctor_id: "d2",
          },
        ],
      },
    });
  });

  it("05. trino_doctor: search with in operator for primitive field", () => {
    let res = itHelpers.request_graph_ql_post_instance2(`
    {
      trino_doctors(
        search: {
          operator: in, 
          field: doctor_id, 
          value: "d1,d2,d3",
          valueType: Array
        },
        pagination:{limit:5}) {
          doctor_id
        }
    }`);
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody.data.trino_doctors.length).equal(3);
  });

  it("06. trino_doctor: search with not & in operators for primitive field", () => {
    let res = itHelpers.request_graph_ql_post_instance2(`
    {
      trino_doctors(
        search:{
          operator: not,
          search: {
            operator: in, 
            field: doctor_id, 
            value: "d1,d2,d3",
            valueType: Array
          }
        },
        pagination:{limit:5}) {
          doctor_id
        }
    }`);
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody.data.trino_doctors.length).equal(2);
  });

  it("07. trino_doctor: search with contains operator for array field", () => {
    let res = itHelpers.request_graph_ql_post_instance2(`
    {
      trino_doctors(
        search:{operator:contains, field:telephone, value:"152234"},
        pagination:{limit:5}) {
          doctor_id
        }
    }`);
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody.data.trino_doctors.length).equal(1);

    res = itHelpers.request_graph_ql_post_instance2(`
    {
      trino_doctors(
        search:{operator:contains, field:speciality, value:"Tinnitus"},
        pagination:{limit:5}) {
          doctor_id
        }
    }`);
    resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody.data.trino_doctors.length).equal(1);
  });

  it("08. trino_doctor: search with not & contains operators for array field", () => {
    let res = itHelpers.request_graph_ql_post_instance2(`
    {
      trino_doctors(
        search:{
          operator:not,
          search:{operator:contains, field:telephone, value:"152234"}
        },
        pagination:{limit:5}) {
          doctor_id
        }
    }`);
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody.data.trino_doctors.length).equal(4);
  });

  it("09. trino_doctor: search with eq operator for array field", () => {
    let res = itHelpers.request_graph_ql_post_instance2(`
    {
      trino_doctors(
        search:{operator:eq, field:telephone, value:"[152234,137584]"},
        pagination:{limit:5}) {
          doctor_id
        }
    }`);
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody.data.trino_doctors.length).equal(1);

    res = itHelpers.request_graph_ql_post_instance2(`
    {
      trino_doctors(
        search:{operator:eq, field:telephone, value:"152234,137584", valueType:Array},
        pagination:{limit:5}) {
          doctor_id
        }
    }`);
    resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody.data.trino_doctors.length).equal(1);

    res = itHelpers.request_graph_ql_post_instance2(`
    {
      trino_doctors(
        search:{operator:eq, field:speciality, value:"Tinnitus,Allergology", valueType:Array},
        pagination:{limit:5}) {
          doctor_id
        }
    }`);
    resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody.data.trino_doctors.length).equal(1);
  });

  it("10. trino_doctor: search with ne operator for array field", () => {
    let res = itHelpers.request_graph_ql_post_instance2(`
    {
      trino_doctors(
        search:{operator:ne, field:speciality, value:"Tinnitus,Allergology", valueType:Array},
        pagination:{limit:5}) {
          doctor_id
        }
    }`);
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody.data.trino_doctors.length).equal(4);
  });

  it("11. trino_doctor: search with between operator", () => {
    // string field
    let res = itHelpers.request_graph_ql_post_instance2(`
    {
      trino_doctors(
        search: {field: doctor_id, operator: between, valueType: Array, value: "d1,d2"},
        pagination: {limit: 25}) {
          doctor_id
        }
    }`);
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        trino_doctors: [
          {
            doctor_id: "d1",
          },
          {
            doctor_id: "d2",
          },
        ],
      },
    });
    // int field
    res = itHelpers.request_graph_ql_post_instance2(`
    {
      trino_doctors(
        search: {field: experience, operator: between, valueType: Array, value: "3,5"}, 
        pagination: {limit: 25}) {
          doctor_id
          experience
        }
    }
    `);
    resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        trino_doctors: [
          {
            doctor_id: "d1",
            experience: 3,
          },
          {
            doctor_id: "d3",
            experience: 5,
          },
          {
            doctor_id: "d4",
            experience: 4,
          },
        ],
      },
    });
  });

  it("12. trino_doctor: search with notBetween operator", () => {
    // string field
    let res = itHelpers.request_graph_ql_post_instance2(`
    {
      trino_doctors(
        search: {field: doctor_id, operator: notBetween, valueType: Array, value: "d1,d2"},
        pagination: {limit: 25}) {
          doctor_id
        }
    }`);
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        trino_doctors: [
          {
            doctor_id: "d3",
          },
          {
            doctor_id: "d4",
          },
          {
            doctor_id: "d5",
          },
        ],
      },
    });
    // int field
    res = itHelpers.request_graph_ql_post_instance2(`
    {
      trino_doctors(
        search: {field: experience, operator: notBetween, valueType: Array, value: "3,5"}, 
        pagination: {limit: 25}) {
          doctor_id
          experience
        }
    }`);
    resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        trino_doctors: [
          {
            doctor_id: "d2",
            experience: 15,
          },
          {
            doctor_id: "d5",
            experience: 6,
          },
        ],
      },
    });
  });

  it("13. trino_doctor: sort", () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      `{
        trino_doctors(pagination: {limit:5}, order: [{field: doctor_id, order: DESC}]) {
          doctor_id
          }
      }`
    );
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);

    expect(resBody).to.deep.equal({
      data: {
        trino_doctors: [
          { doctor_id: "d5" },
          { doctor_id: "d4" },
          { doctor_id: "d3" },
          { doctor_id: "d2" },
          { doctor_id: "d1" },
        ],
      },
    });
  });

  it("14. trino_doctor: paginate", () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      `{
        trino_doctorsConnection(pagination:{first:10}) {
          edges{
            cursor
            node{
              doctor_id
            }
          }
        }
      }`
    );
    let resBody = JSON.parse(res.body.toString("utf8"));
    let edges = resBody.data.trino_doctorsConnection.edges;
    let idArray = edges.map((edge) => edge.node.doctor_id);
    let cursorArray = edges.map((edge) => edge.cursor);
    res = itHelpers.request_graph_ql_post_instance2(
      `{
        trino_doctorsConnection(pagination:{first: 2, after: "${cursorArray[1]}"}) {
          edges{
            cursor
            node{
              doctor_id
            }
          }
          trino_doctors{
            doctor_id
          }
          pageInfo{
            startCursor
            endCursor
            hasNextPage
            hasPreviousPage
          }
        }
      }`
    );
    resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);

    expect(resBody).to.deep.equal({
      data: {
        trino_doctorsConnection: {
          edges: [
            {
              cursor: cursorArray[2],
              node: {
                doctor_id: idArray[2],
              },
            },
            {
              cursor: cursorArray[3],
              node: {
                doctor_id: idArray[3],
              },
            },
          ],
          trino_doctors: [
            {
              doctor_id: "d3",
            },
            {
              doctor_id: "d4",
            },
          ],
          pageInfo: {
            startCursor: cursorArray[2],
            endCursor: cursorArray[3],
            hasNextPage: true,
            hasPreviousPage: true,
          },
        },
      },
    });

    res = itHelpers.request_graph_ql_post_instance2(
      `{
        trino_doctorsConnection(pagination: {last: 4, before:"${cursorArray[4]}"}) {
          pageInfo {
            startCursor
            endCursor
            hasNextPage
            hasPreviousPage
          }
        }
      }`
    );
    resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);

    expect(resBody).to.deep.equal({
      data: {
        trino_doctorsConnection: {
          pageInfo: {
            startCursor: cursorArray[0],
            endCursor: cursorArray[3],
            hasNextPage: true,
            hasPreviousPage: false,
          },
        },
      },
    });
  });

  it("15. trino_doctor: get the table template", () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      `{csvTableTemplateTrino_doctor}`
    );
    let resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        csvTableTemplateTrino_doctor: [
          "doctor_id,doctor_name,birthday,experience,rating,on_holiday,speciality,telephone",
          "String,String,DateTime,Int,Float,Boolean,[String],[Int]",
        ],
      },
    });
  });
});

describe("Trino - Operators", () => {
  it("01. trino_doctor: like , notLike", () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      `{
          trino_doctors(pagination: {limit:10} search:{field:doctor_name operator:like value:"%asch%"}) {
              doctor_id
            }
        }`
    );
    expect(res.statusCode).to.equal(200);
    let resBody = JSON.parse(res.body.toString("utf8"));
    expect(resBody.data.trino_doctors.length === 2);

    res = itHelpers.request_graph_ql_post_instance2(
      `{
          trino_doctors(pagination: {limit:10} search:{field:doctor_name operator:notLike value:"%asch%"}) {
              doctor_id
            }
        }`
    );
    expect(res.statusCode).to.equal(200);
    resBody = JSON.parse(res.body.toString("utf8"));
    expect(resBody.data.trino_doctors.length === 3);
  });
  it("02. trino_doctor: iLike, notILike", () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      `{
          trino_doctors(pagination: {limit:10} search:{field:doctor_name operator:iLike value:"%ASCH%"}) {
              doctor_id
            }
        }`
    );
    expect(res.statusCode).to.equal(200);
    let resBody = JSON.parse(res.body.toString("utf8"));
    expect(resBody.data.trino_doctors.length === 2);

    res = itHelpers.request_graph_ql_post_instance2(
      `{
          trino_doctors(pagination: {limit:10} search:{field:doctor_name operator:notILike value:"%ASCH%"}) {
              doctor_id
            }
        }`
    );
    expect(res.statusCode).to.equal(200);
    resBody = JSON.parse(res.body.toString("utf8"));
    expect(resBody.data.trino_doctors.length === 3);
  });

  it("03. trino_doctor: regexp, notRegexp", () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      `{
          trino_doctors(pagination: {limit:10} search:{field:doctor_name operator:regexp value:"aschet$"}) {
              doctor_id
            }
        }`
    );
    expect(res.statusCode).to.equal(200);
    let resBody = JSON.parse(res.body.toString("utf8"));
    expect(resBody.data.trino_doctors.length === 2);

    res = itHelpers.request_graph_ql_post_instance2(
      `{
          trino_doctors(pagination: {limit:10} search:{field:doctor_name operator:notRegexp value:"aschet$"}) {
              doctor_id
            }
        }`
    );
    expect(res.statusCode).to.equal(200);
    resBody = JSON.parse(res.body.toString("utf8"));
    expect(resBody.data.trino_doctors.length === 3);
  });

  it("04. trino_doctor: iRegexp, notIRegexp", () => {
    let res = itHelpers.request_graph_ql_post_instance2(
      `{
          trino_doctors(pagination: {limit:10} search:{field:doctor_name operator:iRegexp value:"ASCHET$"}) {
              doctor_id
            }
        }`
    );
    expect(res.statusCode).to.equal(200);
    let resBody = JSON.parse(res.body.toString("utf8"));
    expect(resBody.data.trino_doctors.length === 2);

    res = itHelpers.request_graph_ql_post_instance2(
      `{
          trino_doctors(pagination: {limit:10} search:{field:doctor_name operator:notIRegexp value:"ASCHET$"}) {
              doctor_id
            }
        }`
    );
    expect(res.statusCode).to.equal(200);
    resBody = JSON.parse(res.body.toString("utf8"));
    expect(resBody.data.trino_doctors.length === 3);
  });
});

describe("Trino - Distributed Data Models", () => {
  it("01. trino_doctor: read one trino_doctor", () => {
    let res = itHelpers.request_graph_ql_post_instance2(`
    {
      readOneDist_trino_doctor(doctor_id:"instance1-d1"){
        doctor_id
        birthday
        experience
        rating
        on_holiday
        speciality
        telephone
      }
    }`);
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        readOneDist_trino_doctor: {
          doctor_id: "instance1-d1",
          birthday: "1989-12-03T10:15:30.000Z",
          experience: 3,
          rating: 4.9,
          on_holiday: false,
          speciality: ["Tinnitus", "Allergology"],
          telephone: [152234, 137584],
        },
      },
    });
  });

  it("02. trino_doctor DDM: search & sort", () => {
    res = itHelpers.request_graph_ql_post_instance2(
      `{
        dist_trino_doctorsConnection(
          search: {field: doctor_id, value: "instance1%", operator: like},
          order: [{field: doctor_id, order: DESC}]
          pagination: {first: 5}) {
          dist_trino_doctors{
            doctor_id
          }
        }
      }
      `
    );
    resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        dist_trino_doctorsConnection: {
          dist_trino_doctors: [
            { doctor_id: "instance1-d5" },
            { doctor_id: "instance1-d4" },
            { doctor_id: "instance1-d3" },
            { doctor_id: "instance1-d2" },
            { doctor_id: "instance1-d1" },
          ],
        },
      },
    });
  });

  it("03. trino_doctor DDM: paginate", () => {
    res = itHelpers.request_graph_ql_post_instance2(
      `{
        dist_trino_doctorsConnection(pagination: {
          first: 2,
          after: "eyJkb2N0b3JfaWQiOiJpbnN0YW5jZTEtZDEiLCJiaXJ0aGRheSI6IjE5ODktMTItMDNUMTA6MTU6MzAuMDAwWiIsImV4cGVyaWVuY2UiOjMsInJhdGluZyI6NC45LCJvbl9ob2xpZGF5IjpmYWxzZSwic3BlY2lhbGl0eSI6WyJUaW5uaXR1cyIsIkFsbGVyZ29sb2d5Il0sInRlbGVwaG9uZSI6WzE1MjIzNCwxMzc1ODRdfQ=="
        }){
          edges {
            node {
              doctor_id
            }
            cursor
          }
          dist_trino_doctors{
            doctor_id
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
        dist_trino_doctorsConnection: {
          edges: [
            {
              cursor:
                "eyJkb2N0b3JfaWQiOiJpbnN0YW5jZTEtZDIiLCJiaXJ0aGRheSI6IjE5NzctMTItMDNUMTA6MTU6MzAuMDAwWiIsImV4cGVyaWVuY2UiOjE1LCJyYXRpbmciOjUsIm9uX2hvbGlkYXkiOmZhbHNlLCJzcGVjaWFsaXR5IjpbIkNhcmRpb2xvZ3kiLCJDYXJkaW90aG9yYWNpYyBTdXJnZXJ5Il0sInRlbGVwaG9uZSI6WzE0MjIzNCwxMjc1ODRdfQ==",
              node: {
                doctor_id: "instance1-d2",
              },
            },
            {
              cursor:
                "eyJkb2N0b3JfaWQiOiJpbnN0YW5jZTEtZDMiLCJiaXJ0aGRheSI6IjE5ODctMTItMDNUMTA6MTU6MzAuMDAwWiIsImV4cGVyaWVuY2UiOjUsInJhdGluZyI6NC44LCJvbl9ob2xpZGF5Ijp0cnVlLCJzcGVjaWFsaXR5IjpbIkRlcm1hdG9sb2d5IiwiQWxsZXJnb2xvZ3kiXSwidGVsZXBob25lIjpbMTYyMjM0LDE3NzU4NF19",
              node: {
                doctor_id: "instance1-d3",
              },
            },
          ],
          dist_trino_doctors: [
            { doctor_id: "instance1-d2" },
            { doctor_id: "instance1-d3" },
          ],
          pageInfo: {
            startCursor:
              "eyJkb2N0b3JfaWQiOiJpbnN0YW5jZTEtZDIiLCJiaXJ0aGRheSI6IjE5NzctMTItMDNUMTA6MTU6MzAuMDAwWiIsImV4cGVyaWVuY2UiOjE1LCJyYXRpbmciOjUsIm9uX2hvbGlkYXkiOmZhbHNlLCJzcGVjaWFsaXR5IjpbIkNhcmRpb2xvZ3kiLCJDYXJkaW90aG9yYWNpYyBTdXJnZXJ5Il0sInRlbGVwaG9uZSI6WzE0MjIzNCwxMjc1ODRdfQ==",
            endCursor:
              "eyJkb2N0b3JfaWQiOiJpbnN0YW5jZTEtZDMiLCJiaXJ0aGRheSI6IjE5ODctMTItMDNUMTA6MTU6MzAuMDAwWiIsImV4cGVyaWVuY2UiOjUsInJhdGluZyI6NC44LCJvbl9ob2xpZGF5Ijp0cnVlLCJzcGVjaWFsaXR5IjpbIkRlcm1hdG9sb2d5IiwiQWxsZXJnb2xvZ3kiXSwidGVsZXBob25lIjpbMTYyMjM0LDE3NzU4NF19",
            hasNextPage: true,
            hasPreviousPage: false,
          },
        },
      },
    });
  });

  it("04. trino_doctor DDM: count trino_doctors", () => {
    res = itHelpers.request_graph_ql_post_instance2(
      `{countDist_trino_doctors}`
    );
    resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody.data.countDist_trino_doctors).equal(5);
  });
});
