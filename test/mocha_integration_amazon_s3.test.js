const { expect } = require("chai");
const delay = require("delay");
const path = require("path");
const itHelpers = require("./integration_test_misc/integration_test_helpers");
const AWS = require("aws-sdk");
const fs = require("fs");

describe("Amazon S3/ Minio - Upload/Read Operations", () => {
  it("01. Reader: CSV bulkUpload", async () => {
    let csvPath = __dirname + "/integration_test_misc/minio/reader.csv";
    try {
      const s3 = new AWS.S3({
        accessKeyId: "sciencedb",
        secretAccessKey: "sciencedb",
        endpoint: `http://127.0.0.1:9000`,
        s3ForcePathStyle: true,
        signatureVersion: "v4",
      });
      let file_param = {
        Bucket: "sciencedb-development",
        Key: "reader.csv",
        Body: fs.createReadStream(csvPath),
      };
      await s3.upload(file_param).promise();
    } catch (e) {
      throw new Error(e);
    }
    await delay(500);

    let cnt = await itHelpers.count_all_records("countReaders");
    expect(cnt).to.equal(5);
  });

  it("02. Reader: read one reader with array", () => {
    let res = itHelpers.request_graph_ql_post(`
    {
      readOneReader(reader_id:1){
        reader_id
        reader_name
        age
        student
        lastSeen
        history
      }
    }`);
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        readOneReader: {
          reader_id: "1",
          reader_name: "Sally",
          age: 15.4,
          student: true,
          lastSeen: "2020-10-03T10:15:30Z",
          history: [
            "Critique of Pure Reason",
            "The World as Will and Representation",
          ],
        },
      },
    });
  });

  it("03. Reader: read one reader with null or empty string", () => {
    // history for reader 2 is 'null'
    let res = itHelpers.request_graph_ql_post(`
    {
      readOneReader(reader_id:2){
        reader_id
        history
      }
    }`);
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        readOneReader: {
          reader_id: "2",
          history: null,
        },
      },
    });

    // history for reader 3 is 'NULL'
    res = itHelpers.request_graph_ql_post(`
    {
      readOneReader(reader_id:3){
        reader_id
        history
      }
    }`);
    resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        readOneReader: {
          reader_id: "3",
          history: null,
        },
      },
    });
    // history for reader 5 is ''
    res = itHelpers.request_graph_ql_post(`
    {
      readOneReader(reader_id:5){
        reader_id
        history
      }
    }`);
    resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        readOneReader: {
          reader_id: "5",
          history: null,
        },
      },
    });
  });

  it("04. Reader: count readers", () => {
    let res = itHelpers.request_graph_ql_post(
      `{countReaders(search:{operator:eq, field:student, value:"true"})}`
    );
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody.data.countReaders).equal(3);
  });

  it("05. Reader: search with like operator", () => {
    let res = itHelpers.request_graph_ql_post(`
    {
      readersConnection(search:{field:reader_name, value:"%li%", operator:like},pagination:{first:5}) {
        edges{
          node{
            reader_name
          }
        }
      }
    }`);
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody.data.readersConnection.edges.length).equal(2);
  });

  it("06. Reader: search with and operator", () => {
    let res = itHelpers.request_graph_ql_post(`
    {
      readersConnection(
        search: {
          operator: and,
          search: [
            {operator: eq, field: reader_id, value: "1"},
            {operator: eq, field: reader_name, value: "Sally"}
          ]
        },
        pagination:{first:5}) {
          edges{
            node{
              reader_name
            }
          }
        }
    }`);
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody.data.readersConnection.edges.length).equal(1);
  });

  it("07. Reader: search with or operator", () => {
    let res = itHelpers.request_graph_ql_post(`
    {
      readersConnection(
        search: {
          operator: or,
          search: [
            {operator: eq, field: reader_id, value: "1"},
            {operator: eq, field: reader_name, value: "Lily"}
          ]
        },
        pagination:{first:5}) {
          edges{
            node{
              reader_name
            }
          }
        }
    }`);
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody.data.readersConnection.edges.length).equal(2);
  });

  it("08. Reader: search with in operator for primitive field", () => {
    let res = itHelpers.request_graph_ql_post(`
    {
      readersConnection(
        search:{
          operator:in,
          field:reader_id,
          value:"1,2,7",
          valueType: Array
        }
        pagination:{first:5}) {
          edges{
            node{
              reader_name
            }
          }
        }
    }`);
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody.data.readersConnection.edges.length).equal(2);
  });

  it("09. Reader: search with not & in operators for primitive field", () => {
    let res = itHelpers.request_graph_ql_post(`
    {
      readersConnection(
        search:{
          operator:not,
          search:{
            operator:in,
            field:reader_id,
            value:"1,2,7",
            valueType: Array
          }
        },
        pagination:{first:5}) {
          edges{
            node{
              reader_name
            }
          }
        }
    }`);
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody.data.readersConnection.edges.length).equal(3);
  });

  it("10. Reader: search with contains operator for array field", () => {
    let res = itHelpers.request_graph_ql_post(`
    {
      readersConnection(
        search:{operator:contains, field:history, value:"Critique of Pure Reason"},
        pagination:{first:5}) {
          edges{
            node{
              reader_name
            }
          }
        }
    }`);
    let resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody.data.readersConnection.edges.length).equal(1);
  });

  it("11. Reader: search with not & contains operators for array field", () => {
    let res = itHelpers.request_graph_ql_post(`
    {
      readersConnection(
        search:{
          operator:not,
          search:{
            operator:contains,
            field:history,
            value:"Critique of Pure Reason"
          }
        },
        pagination:{first:5}) {
          edges{
            node{
              reader_name
            }
          }
        }
    }`);
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody.data.readersConnection.edges.length).equal(4);
  });

  it("12. Reader: search with eq operator for array field", () => {
    let res = itHelpers.request_graph_ql_post(`
    {
      readersConnection(
        search:{
          operator:eq,
          field:history,
          value:"Critique of Pure Reason;The World as Will and Representation"
        },
        pagination:{first:5}) {
          edges{
            node{
              reader_name
            }
          }
        }
    }`);
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody.data.readersConnection.edges.length).equal(1);

    res = itHelpers.request_graph_ql_post(`
    {
      readersConnection(
        search:{
          operator:eq,
          field:history,
          value:"Critique of Pure Reason,The World as Will and Representation",
          valueType:Array
        },
        pagination:{first:5}) {
          edges{
            node{
              reader_name
            }
          }
        }
    }`);
    resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody.data.readersConnection.edges.length).equal(1);
  });

  it("13. Reader: search with ne operator for array field", () => {
    let res = itHelpers.request_graph_ql_post(`
    {
      readersConnection(
        search:{
          operator:ne,
          field:history,
          value:"Critique of Pure Reason;The World as Will and Representation"
        },
        pagination:{first:5}) {
          edges{
            node{
              reader_name
            }
          }
        }
    }`);
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody.data.readersConnection.edges.length).equal(4);
  });

  it("14. Reader: search with between operator", () => {
    // string field
    let res = itHelpers.request_graph_ql_post(`
    {
      readersConnection(
        search: {field: reader_id, operator: between, valueType: Array, value: "3,5"},
        pagination:{first:5}) {
          readers {
            reader_id
          }
        }
    }`);
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        readersConnection: {
          readers: [
            {
              reader_id: "3",
            },
            {
              reader_id: "4",
            },
            {
              reader_id: "5",
            },
          ],
        },
      },
    });
    // float field
    res = itHelpers.request_graph_ql_post(`
      {
        readersConnection(
          search: {field: age, operator: between, valueType: Array, value: "7,20"},
          pagination:{first:5}) {
            readers {
              reader_id
              age
            }
          }
      }`);
    resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        readersConnection: {
          readers: [
            {
              reader_id: "1",
              age: 15.4,
            },
            {
              reader_id: "3",
              age: 7.5,
            },
          ],
        },
      },
    });
  });

  it("15. Reader: search with notBetween operator", () => {
    // string field
    let res = itHelpers.request_graph_ql_post(`
    {
      readersConnection(
        search: {field: reader_id, operator: notBetween, valueType: Array, value: "3,5"},
        pagination:{first:5}) {
          readers {
            reader_id
          }
        }
    }`);
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        readersConnection: {
          readers: [
            {
              reader_id: "1",
            },
            {
              reader_id: "2",
            },
          ],
        },
      },
    });
    // float field
    res = itHelpers.request_graph_ql_post(`
      {
        readersConnection(
          search: {field: age, operator: notBetween, valueType: Array, value: "7,20"},
          pagination:{first:5}) {
            readers {
              reader_id
              age
            }
          }
      }`);
    resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        readersConnection: {
          readers: [
            {
              reader_id: "2",
              age: 20.6,
            },
            {
              reader_id: "4",
              age: 30.1,
            },
            {
              reader_id: "5",
              age: 35.4,
            },
          ],
        },
      },
    });
  });

  it("16. Reader: paginate", () => {
    let res = itHelpers.request_graph_ql_post(
      `{
        readersConnection(pagination:{first:10}) {
          edges{
            cursor
            node{
              reader_id
            }
          }
        }
      }`
    );
    let resBody = JSON.parse(res.body.toString("utf8"));
    let edges = resBody.data.readersConnection.edges;
    let idArray = edges.map((edge) => edge.node.reader_id);
    let cursorArray = edges.map((edge) => edge.cursor);
    res = itHelpers.request_graph_ql_post(
      `{
        readersConnection(pagination:{first: 2, after: "${cursorArray[1]}"}) {
          edges{
            cursor
            node{
              reader_id
            }
          }
          readers{
            reader_name
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
        readersConnection: {
          edges: [
            {
              cursor: cursorArray[2],
              node: {
                reader_id: idArray[2],
              },
            },
            {
              cursor: cursorArray[3],
              node: {
                reader_id: idArray[3],
              },
            },
          ],
          readers: [
            {
              reader_name: "Dom",
            },
            {
              reader_name: "Fecility",
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

  it("17. Reader: get the table template", () => {
    let res = itHelpers.request_graph_ql_post(`{csvTableTemplateReader}`);
    let resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        csvTableTemplateReader: [
          "reader_id,reader_name,age,student,lastSeen,history",
          "String,String,Float,Boolean,DateTime,[String]",
        ],
      },
    });
  });
});

describe("Amazon S3 / Minio - Operators", () => {
  it("01. Reader: like, notLike ", () => {
    let res = itHelpers.request_graph_ql_post(
      `{readersConnection(pagination: {first:10} search:{field:reader_name operator:like value:"%ly%"}){readers{reader_id reader_name}}}`
    );
    expect(res.statusCode).to.equal(200);
    let resBody = JSON.parse(res.body.toString("utf8"));
    expect(resBody.data.readersConnection.readers.length).to.equal(2);

    res = itHelpers.request_graph_ql_post(
      `{readersConnection(pagination: {first:10} search:{field:reader_name operator:notLike value:"%ly%"}){readers{reader_id reader_name}}}`
    );
    expect(res.statusCode).to.equal(200);
    resBody = JSON.parse(res.body.toString("utf8"));
    expect(resBody.data.readersConnection.readers.length).to.equal(3);
  });

  it("02. Reader: iLike, notILike ", () => {
    let res = itHelpers.request_graph_ql_post(
      `{readersConnection(pagination: {first:10} search:{field:reader_name operator:iLike value:"%Ly%"}){readers{reader_id reader_name}}}`
    );
    expect(res.statusCode).to.equal(200);
    let resBody = JSON.parse(res.body.toString("utf8"));
    expect(resBody.data.readersConnection.readers.length).to.equal(2);

    res = itHelpers.request_graph_ql_post(
      `{readersConnection(pagination: {first:10} search:{field:reader_name operator:notILike value:"%Ly%"}){readers{reader_id reader_name}}}`
    );
    expect(res.statusCode).to.equal(200);
    resBody = JSON.parse(res.body.toString("utf8"));
    expect(resBody.data.readersConnection.readers.length).to.equal(3);
  });

  it("03. Reader: contains, notContains ", () => {
    let res = itHelpers.request_graph_ql_post(
      `{readersConnection(pagination: {first:10} search:{field:history operator:contains value:"Critique of Pure Reason"}){readers{reader_id reader_name}}}`
    );
    expect(res.statusCode).to.equal(200);
    let resBody = JSON.parse(res.body.toString("utf8"));
    expect(resBody.data.readersConnection.readers.length).to.equal(1);

    res = itHelpers.request_graph_ql_post(
      `{readersConnection(pagination: {first:10} search:{field:history operator:notContains value:"Critique of Pure Reason"}){readers{reader_id reader_name}}}`
    );
    expect(res.statusCode).to.equal(200);
    resBody = JSON.parse(res.body.toString("utf8"));
    expect(resBody.data.readersConnection.readers.length).to.equal(4);
  });

  it("04. Reader: in, notIn ", () => {
    let res = itHelpers.request_graph_ql_post(
      `{readersConnection(pagination: {first:10} search:{field:reader_name operator:in value:"Sally,Dom" valueType:Array}){readers{reader_id reader_name}}}`
    );
    expect(res.statusCode).to.equal(200);
    let resBody = JSON.parse(res.body.toString("utf8"));
    expect(resBody.data.readersConnection.readers.length).to.equal(2);

    res = itHelpers.request_graph_ql_post(
      `{readersConnection(pagination: {first:10} search:{field:reader_name operator:notIn value:"Sally,Dom" valueType:Array}){readers{reader_id reader_name}}}`
    );
    expect(res.statusCode).to.equal(200);
    resBody = JSON.parse(res.body.toString("utf8"));
    expect(resBody.data.readersConnection.readers.length).to.equal(3);
  });
});

describe("Amazon S3/ Minio - Distributed Data Models", () => {
  it("01. Reader: CSV bulkUpload", async () => {
    let csvPath = __dirname + "/integration_test_misc/minio/dist_reader.csv";
    try {
      const s3 = new AWS.S3({
        accessKeyId: "sciencedb",
        secretAccessKey: "sciencedb",
        endpoint: `http://127.0.0.1:9000`,
        s3ForcePathStyle: true,
        signatureVersion: "v4",
      });
      let file_param = {
        Bucket: "sciencedb-development",
        Key: "dist_reader.csv",
        Body: fs.createReadStream(csvPath),
      };
      await s3.upload(file_param).promise();
    } catch (e) {
      throw new Error(e);
    }
    await delay(500);

    let cnt = await itHelpers.count_all_records("countDist_readers");
    expect(cnt).to.equal(3);
  });

  it("02. Reader: read one reader", () => {
    let res = itHelpers.request_graph_ql_post(`
    {
      readOneDist_reader(reader_id:"instance1-1"){
        reader_id
        reader_name
        age
        student
        lastSeen
        history
      }
    }`);
    let resBody = JSON.parse(res.body.toString("utf8"));

    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        readOneDist_reader: {
          reader_id: "instance1-1",
          reader_name: "dist_Sally",
          age: 15.4,
          student: true,
          lastSeen: "2020-10-03T10:15:30Z",
          history: [
            "Critique of Pure Reason",
            "The World as Will and Representation",
          ],
        },
      },
    });
  });

  it("03. Reader DDM: search", () => {
    res = itHelpers.request_graph_ql_post(
      `{
        dist_readersConnection(
          search: {field: reader_id, value: "instance%", operator: like},
          pagination: {first: 5}) {
          edges {
            node {
              reader_id
              reader_name
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
        dist_readersConnection: {
          edges: [
            {
              node: {
                reader_id: "instance1-1",
                reader_name: "dist_Sally",
              },
            },
            {
              node: {
                reader_id: "instance1-2",
                reader_name: "dist_Lily",
              },
            },
            {
              node: {
                reader_id: "instance1-3",
                reader_name: "dist_Dom",
              },
            },
          ],
        },
      },
    });
  });

  it("04. Reader DDM: paginate", () => {
    res = itHelpers.request_graph_ql_post(
      `{
        dist_readersConnection(pagination: {
          first: 5,
          after:"eyJyZWFkZXJfaWQiOiJpbnN0YW5jZTEtMSIsInJlYWRlcl9uYW1lIjoiZGlzdF9TYWxseSIsImFnZSI6MTUuNCwic3R1ZGVudCI6dHJ1ZSwibGFzdFNlZW4iOiIyMDIwLTEwLTAzVDEwOjE1OjMwWiIsImhpc3RvcnkiOlsiQ3JpdGlxdWUgb2YgUHVyZSBSZWFzb24iLCJUaGUgV29ybGQgYXMgV2lsbCBhbmQgUmVwcmVzZW50YXRpb24iXX0="
        }){
          edges {
            node {
              reader_id
            }
            cursor
          }
          dist_readers{
            reader_name
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
        dist_readersConnection: {
          edges: [
            {
              cursor:
                "eyJyZWFkZXJfaWQiOiJpbnN0YW5jZTEtMiIsInJlYWRlcl9uYW1lIjoiZGlzdF9MaWx5IiwiYWdlIjoyMC42LCJzdHVkZW50Ijp0cnVlLCJsYXN0U2VlbiI6IjIwMTctMTAtMDNUMTA6MTU6MzBaIiwiaGlzdG9yeSI6bnVsbH0=",
              node: {
                reader_id: "instance1-2",
              },
            },
            {
              cursor:
                "eyJyZWFkZXJfaWQiOiJpbnN0YW5jZTEtMyIsInJlYWRlcl9uYW1lIjoiZGlzdF9Eb20iLCJhZ2UiOjcuNSwic3R1ZGVudCI6dHJ1ZSwibGFzdFNlZW4iOiIyMDIxLTAzLTAzVDEwOjE1OjMwWiIsImhpc3RvcnkiOm51bGx9",
              node: {
                reader_id: "instance1-3",
              },
            },
          ],
          dist_readers: [
            { reader_name: "dist_Lily" },
            { reader_name: "dist_Dom" },
          ],
          pageInfo: {
            startCursor:
              "eyJyZWFkZXJfaWQiOiJpbnN0YW5jZTEtMiIsInJlYWRlcl9uYW1lIjoiZGlzdF9MaWx5IiwiYWdlIjoyMC42LCJzdHVkZW50Ijp0cnVlLCJsYXN0U2VlbiI6IjIwMTctMTAtMDNUMTA6MTU6MzBaIiwiaGlzdG9yeSI6bnVsbH0=",
            endCursor:
              "eyJyZWFkZXJfaWQiOiJpbnN0YW5jZTEtMyIsInJlYWRlcl9uYW1lIjoiZGlzdF9Eb20iLCJhZ2UiOjcuNSwic3R1ZGVudCI6dHJ1ZSwibGFzdFNlZW4iOiIyMDIxLTAzLTAzVDEwOjE1OjMwWiIsImhpc3RvcnkiOm51bGx9",
            hasNextPage: false,
            hasPreviousPage: false,
          },
        },
      },
    });
  });

  it("05. Reader DDM: count readers", () => {
    res = itHelpers.request_graph_ql_post(`{countDist_readers}`);
    resBody = JSON.parse(res.body.toString("utf8"));
    expect(res.statusCode).to.equal(200);
    expect(resBody.data.countDist_readers).equal(3);
  });
});
