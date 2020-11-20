const { expect } = require('chai');
const itHelpers = require('./integration_test_misc/integration_test_helpers');

describe('Cassandra', function() {
  after(async function() {
    let res = itHelpers.request_graph_ql_post(`{incidentsConnection(pagination:{first:20}) {edges {node {incident_id}}}}`);
    let resBody = JSON.parse(res.body.toString('utf8'));
    let edges = resBody.data.incidentsConnection.edges;
    for (let edge of edges) {
      let id = edge.node.incident_id;
      res = itHelpers.request_graph_ql_post(`mutation { deleteIncident(incident_id: "${id}")}`);
      resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
          deleteIncident: "Item successfully deleted"
        }
      });
    }
    res = itHelpers.request_graph_ql_post(`{countIncidents}`);
    resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
          countIncidents: 0
      }
    });
    res = itHelpers.request_graph_ql_post(`{instantsConnection(pagination:{first:20}) {edges {node {instant_id}}}}`);
    resBody = JSON.parse(res.body.toString('utf8'));
     edges = resBody.data.instantsConnection.edges;
    for (let edge of edges) {
      let id = edge.node.instant_id;
      res = itHelpers.request_graph_ql_post(`mutation { deleteInstant(instant_id: "${id}")}`);
      resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
          deleteInstant: "Item successfully deleted"
        }
      });
    }
    res = itHelpers.request_graph_ql_post(`{countInstants}`);
    resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
          countInstants: 0
      }
    });
  })
  it('01. Incident table is empty', function() {
    let res = itHelpers.request_graph_ql_post(`{countIncidents}`);
    let resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
          countIncidents: 0
      }
    });
  })

  it('02. Add an incident', function() {
    let res = itHelpers.request_graph_ql_post(`mutation { addIncident(incident_id: "590785b2-062a-4325-8607-9df8e107a7db", incident_description: "An event" ) {incident_id incident_description}}`);
    let resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
          addIncident: {
              incident_id: "590785b2-062a-4325-8607-9df8e107a7db",
              incident_description: "An event"
          }
      }
    });
  })

  it('03. Read an incident', function() {
    let res = itHelpers.request_graph_ql_post('{readOneIncident(incident_id: "590785b2-062a-4325-8607-9df8e107a7db") {incident_id incident_description}}');
    let resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
          readOneIncident: {
              incident_id: "590785b2-062a-4325-8607-9df8e107a7db",
              incident_description: "An event"
          }
      }
    });
  })

  it('04. Update an incident', function() {
    let res = itHelpers.request_graph_ql_post(`mutation { updateIncident(incident_id: "590785b2-062a-4325-8607-9df8e107a7db", incident_description: "Another event" ) {incident_id incident_description}}`);
    let resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
          updateIncident: {
              incident_id: "590785b2-062a-4325-8607-9df8e107a7db",
              incident_description: "Another event"
          }
      }
  });
  })

  // The following produces a warning that is omitted in the return of the model function: 'Aggregation query used without partition key'
  // The server response can return an array of warnings in info.warnings - in this case it has one element
  // The warning itself should be taken seriously in large databases, but here there is only one element.

  it('05. Count and search incidents', function() {
    let res = itHelpers.request_graph_ql_post(`{countIncidents}`);
    let resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
          countIncidents: 1
      }
    });
    res = itHelpers.request_graph_ql_post(`{incidentsConnection(pagination:{first:20}) {edges {cursor node{incident_id incident_description}} pageInfo{endCursor hasNextPage}}}`);
    resBody = JSON.parse(res.body.toString('utf8'));
    let cursor = resBody.data.incidentsConnection.edges[0].cursor;
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
          incidentsConnection: {
              edges: [
                  {
                    cursor: `${cursor}`,
                    node: {
                      incident_id: "590785b2-062a-4325-8607-9df8e107a7db",
                      incident_description: "Another event"
                    }
                  }
              ],
              pageInfo: {
                  endCursor: null,
                  hasNextPage: false
              }
          }
      }
  });

  });

  it('06. Delete an incident', function() {
    let res = itHelpers.request_graph_ql_post(`mutation { deleteIncident(incident_id: "590785b2-062a-4325-8607-9df8e107a7db")}`);
    let resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
          deleteIncident: "Item successfully deleted"
      }
    });
  })

  it('07. Create 5 incidents, test pagination and delete the incidents in a loop', function() {
    let res = itHelpers.request_graph_ql_post(`mutation { addIncident(incident_id: "aef7cbbc-3f9c-452c-a95a-0eccd51e02e1", incident_description: "First incident", incident_number: 1 ) {incident_id incident_description}}`);
    let resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
          addIncident: {
              incident_id: "aef7cbbc-3f9c-452c-a95a-0eccd51e02e1",
              incident_description: "First incident"
          }
      }
    });
    res = itHelpers.request_graph_ql_post(`mutation { addIncident(incident_id: "0a853fac-1bb2-4adf-bbf9-9371f7db97b6", incident_description: "Second incident", incident_number: 2 ) {incident_id incident_description}}`);
    resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
          addIncident: {
              incident_id: "0a853fac-1bb2-4adf-bbf9-9371f7db97b6",
              incident_description: "Second incident"
          }
      }
    });
    res = itHelpers.request_graph_ql_post(`mutation { addIncident(incident_id: "8f455707-f7aa-4925-9efc-df18f2f9cd55", incident_description: "Third incident", incident_number: 3 ) {incident_id incident_description}}`);
    resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
          addIncident: {
              incident_id: "8f455707-f7aa-4925-9efc-df18f2f9cd55",
              incident_description: "Third incident"
          }
      }
    });
    res = itHelpers.request_graph_ql_post(`mutation { addIncident(incident_id: "a1e30fde-2bc0-466b-84f4-1d4fee68af44", incident_description: "Fourth incident", incident_number: 4 ) {incident_id incident_description}}`);
    resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
          addIncident: {
              incident_id: "a1e30fde-2bc0-466b-84f4-1d4fee68af44",
              incident_description: "Fourth incident"
          }
      }
    });
    res = itHelpers.request_graph_ql_post(`mutation { addIncident(incident_id: "1f458011-49a3-4833-90f0-d084e227c376", incident_description: "Fifth incident", incident_number: 5 ) {incident_id incident_description}}`);
    resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
          addIncident: {
              incident_id: "1f458011-49a3-4833-90f0-d084e227c376",
              incident_description: "Fifth incident"
          }
      }
    });
    res = itHelpers.request_graph_ql_post(`{incidentsConnection(pagination:{first:20}) {edges {cursor node{incident_id incident_description incident_number}}}}`);
    resBody = JSON.parse(res.body.toString('utf8'));
    let edges = resBody.data.incidentsConnection.edges;
    let idArray = edges.map(edge => edge.node.incident_id);
    let cursorArray = edges.map(edge => edge.cursor);
    let numberArray = edges.map(edge => edge.node.incident_number);
    res = itHelpers.request_graph_ql_post(`{incidentsConnection(pagination:{first: 2}) {edges{cursor node{incident_id}} pageInfo{endCursor hasNextPage}}}`);
    resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        incidentsConnection: {
          edges: [
            {
              cursor: cursorArray[0],
              node: {
                incident_id: idArray[0]
              }
            },
            {
              cursor: cursorArray[1],
              node: {
                incident_id: idArray[1]
              }
            }
          ],
          pageInfo: {
            endCursor: cursorArray[1],
            hasNextPage: true
          }
        }
      }
    })
    res = itHelpers.request_graph_ql_post(`{incidentsConnection(pagination:{first: 2, after: "${cursorArray[1]}"}) {edges{cursor node{incident_id}} pageInfo{endCursor hasNextPage}}}`);
    resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        incidentsConnection: {
          edges: [
            {
              cursor: cursorArray[2],
              node: {
                incident_id: idArray[2]
              }
            },
            {
              cursor: cursorArray[3],
              node: {
                incident_id: idArray[3]
              }
            }
          ],
          pageInfo: {
            endCursor: cursorArray[3],
            hasNextPage: true
          }
        }
      }
    })
    res = itHelpers.request_graph_ql_post(`{incidentsConnection(pagination:{first: 2, after: "${cursorArray[3]}"}) {edges{cursor node{incident_id}} pageInfo{endCursor hasNextPage}}}`);
    resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        incidentsConnection: {
          edges: [
            {
              cursor: cursorArray[4],
              node: {
                incident_id: idArray[4]
              }
            }
          ],
          pageInfo: {
            endCursor: null,
            hasNextPage: false
          }
        }
      }
    })
    res = itHelpers.request_graph_ql_post(`{incidentsConnection(search:{field: incident_number, value:"3", operator: gt}, pagination:{first: 1}) {edges{node{incident_id incident_number}}}}`);
    resBody = JSON.parse(res.body.toString('utf8'));
    let idx = numberArray.indexOf(5);
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
        incidentsConnection: {
          edges: [
            {
              node: {
                incident_id: idArray[idx],
                incident_number: 5
              }
            }
          ]
        }
      }
    });
    for (let edge of edges) {
      let id = edge.node.incident_id;
      res = itHelpers.request_graph_ql_post(`mutation { deleteIncident(incident_id: "${id}")}`);
      resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
          deleteIncident: "Item successfully deleted"
        }
      });
    }
    res = itHelpers.request_graph_ql_post(`{countIncidents}`);
    resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
          countIncidents: 0
      }
    });
  });

  it('08. Instant table is empty', function() {
    let res = itHelpers.request_graph_ql_post(`{countInstants}`);
    let resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
          countInstants: 0
      }
    });
  })

  it('09. Add an instant', function() {
    let res = itHelpers.request_graph_ql_post(`mutation { addInstant(instant_id: "c28ffcb7-6f55-4577-8359-9d8a46382a45", year: 2020, month: 6, day: 18, hour: 10, minute: 52 ) {instant_id year month day hour minute}}`);
    let resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
          addInstant: {
              instant_id: "c28ffcb7-6f55-4577-8359-9d8a46382a45",
              year: 2020,
              month: 6,
              day: 18,
              hour: 10,
              minute: 52
          }
      }
    });
  })

  it('10. Read an instant', function() {
    let res = itHelpers.request_graph_ql_post('{readOneInstant(instant_id: "c28ffcb7-6f55-4577-8359-9d8a46382a45") {instant_id year month day hour minute}}');
    let resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
          readOneInstant: {
              instant_id: "c28ffcb7-6f55-4577-8359-9d8a46382a45",
              year: 2020,
              month: 6,
              day: 18,
              hour: 10,
              minute: 52
          }
      }
    });
  })

  it('11. Update an instant', function() {
    let res = itHelpers.request_graph_ql_post(`mutation { updateInstant(instant_id: "c28ffcb7-6f55-4577-8359-9d8a46382a45", minute: 57 ) {instant_id year month day hour minute}}`);
    let resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
          updateInstant: {
              instant_id: "c28ffcb7-6f55-4577-8359-9d8a46382a45",
              year: 2020,
              month: 6,
              day: 18,
              hour: 10,
              minute: 57
          }
      }
    });
  })

  it('12. Count and search instants', function() {
    let res = itHelpers.request_graph_ql_post(`{countInstants}`);
    let resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
          countInstants: 1
      }
    });
    res = itHelpers.request_graph_ql_post(`{instantsConnection(pagination:{first:20}) {edges{cursor node{instant_id year month day hour minute}} pageInfo{endCursor hasNextPage}}}`);
    resBody = JSON.parse(res.body.toString('utf8'));
    let cursor = resBody.data.instantsConnection.edges[0].cursor;
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
          instantsConnection: {
              edges: [
                  {
                    cursor: `${cursor}`,
                    node: {
                      instant_id: "c28ffcb7-6f55-4577-8359-9d8a46382a45",
                      year: 2020,
                      month: 6,
                      day: 18,
                      hour: 10,
                      minute: 57
                    }
                  }
              ],
              pageInfo: {
                  endCursor: null,
                  hasNextPage: false
              }
          }
      }
    });

  });

  it('13. Generate an incident and associate it to the instant', function() {
    let res = itHelpers.request_graph_ql_post(`mutation { addIncident(incident_id: "0d2569b6-c890-4e26-a081-9eff27f70b8a", incident_description: "Associations test incident", addInstants: "c28ffcb7-6f55-4577-8359-9d8a46382a45") {incident_id incident_description}}`);
    let resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
          addIncident: {
              incident_id: "0d2569b6-c890-4e26-a081-9eff27f70b8a",
              incident_description: "Associations test incident"
          }
      }
    });
  })

  it('14. Read the instant and its connection to the incident', function() {
    let res = itHelpers.request_graph_ql_post(`{instantsConnection(pagination:{first:20}, search:{field: instant_id, operator: eq,   : "c28ffcb7-6f55-4577-8359-9d8a46382a45"}}) {edges {node {instant_id incident_assoc_id incident {incident_id}}}}}`);
    let resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
          instantsConnection: {
              edges: [
                  {
                      node: {
                          instant_id: "c28ffcb7-6f55-4577-8359-9d8a46382a45",
                          incident_assoc_id: "0d2569b6-c890-4e26-a081-9eff27f70b8a",
                          incident: {
                              incident_id: "0d2569b6-c890-4e26-a081-9eff27f70b8a"
                          }
                      }
                  }
              ]
          }
      }
  });
  })

  it('15. Generate a new instant and associate it to the incident', function() {
    let res = itHelpers.request_graph_ql_post(`mutation { addInstant(instant_id: "36c29673-0cc3-4d50-9172-b0cf885a481c", year: 2020, month: 6, day: 22, hour: 18, minute: 47, addIncident: "0d2569b6-c890-4e26-a081-9eff27f70b8a") {instant_id year month day hour minute incident_assoc_id}}`);
    let resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
          addInstant: {
              instant_id: "36c29673-0cc3-4d50-9172-b0cf885a481c",
              year: 2020,
              month: 6,
              day: 22,
              hour: 18,
              minute: 47,
              incident_assoc_id: "0d2569b6-c890-4e26-a081-9eff27f70b8a"
          }
      }
    });
  })

  it('16. Read the incident and its connection to the instants', function() {
    let res = itHelpers.request_graph_ql_post(`{readOneIncident(incident_id: "0d2569b6-c890-4e26-a081-9eff27f70b8a") {incident_id instantsConnection {edges {node{ instant_id}}} }}`);
    let resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
          readOneIncident: {
              incident_id: "0d2569b6-c890-4e26-a081-9eff27f70b8a",
              instantsConnection: {
                  edges: [
                      {
                          node: {
                              instant_id: "36c29673-0cc3-4d50-9172-b0cf885a481c"
                          }
                      },
                      {
                          node: {
                              instant_id: "c28ffcb7-6f55-4577-8359-9d8a46382a45"
                          }
                      }
                  ]
              }
          }
      }
    });
  })

  it('17. Delete the associations', function() {
    let res = itHelpers.request_graph_ql_post(`{instantsConnection(pagination:{first:20}, search:{field: incident_assoc_id, operator: eq, value:0d2569b6-c890-4e26-a081-9eff27f70b8a"}) {edges {node{ instant_id}}}}`);
    let resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    let edges = resBody.data.instantsConnection.edges;
    expect(edges.length).to.equal(2);
    for (let edge of edges) {
      let id = edge.node.instant_id;
      res = itHelpers.request_graph_ql_post(`mutation{updateInstant(instant_id: "${id}", removeIncident: "0d2569b6-c890-4e26-a081-9eff27f70b8a") {instant_id incident_assoc_id}}`);
      resBody = JSON.parse(res.body.toString('utf8'));
      expect(res.statusCode).to.equal(200);
      expect(resBody).to.deep.equal({
        data: {
          updateInstant: {
            instant_id: `${id}`,
            incident_assoc_id: null
          }
        }
      });
    }
  })

  it('18. Get the table template', function() {
    let res = itHelpers.request_graph_ql_post(`{csvTableTemplateIncident}`);
    let resBody = JSON.parse(res.body.toString('utf8'));
    expect(res.statusCode).to.equal(200);
    expect(resBody).to.deep.equal({
      data: {
          csvTableTemplateIncident: [
              "incident_id,incident_description,incident_number",
              "uuid,String,Int"
          ]
      }
    });
  })

  /*xit('19. CSV incident batch upload', async function () {

    let csvPath = path.join(__dirname, 'integration_test_misc', 'incident.csv');

    // count records before upload
    let cnt1 = await itHelpers.count_all_records('countIncidents');

    // batch_upload_csv start new background, there is no way to test the actual result
    // without explicit delay. The test may fail if delay is too small, just check the
    // resulting DB table to be sure that all records from file incident.csv were added.
    let success = await itHelpers.batch_upload_csv(csvPath, 'mutation {bulkAddIncidentCsv}');
    expect(success).equal(true);
    await delay(1500);

    // count records before upload
    let cnt2 = await itHelpers.count_all_records('countIncidents');
    expect(cnt2 - cnt1).to.equal(2);
  });*/
  
});