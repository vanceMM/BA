'use strict';

var neo4j = require('neo4j-driver').v1;

var driver = neo4j.driver("bolt://"+process.env.NEO4J_URL, neo4j.auth.basic(process.env.USER ,process.env.PASSWORD));
module.exports.getNode = function(event, context, callback) {
  var session = driver.session();
  session
  .run('MATCH (n:{queryParam}) return n;', {queryParam: event.queryStringParameters.label})
  .then(function (result) {
    result.records.forEach(function (record) {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: record,
          input: event,
        }),
      });
    });
    session.close();
    driver.close();
  })
  .catch(function (error) {
    console.log(error);
  });
};

module.exports.getSimilarOccupations = function(event, context, callback) {
  var session = driver.session();
  var results = [];
  session
  .run('MATCH (o:ns4_Occupation)-[:ns5_related]->(s:ns4_Skill)<-[:ns5_related]-(rec:ns4_Occupation) WHERE o.uri ={queryParam} WITH rec, COLLECT(o.ns5_prefLabel) AS prefLabel, COUNT(*) AS commonSkills RETURN rec AS recommendedOccupation,rec.ns5_prefLabel, commonSkills ORDER BY commonSkills DESC LIMIT 100;', {queryParam: event.queryStringParameters.uri})
  .then(function (result) {
    result.records.forEach(function (record) {
      results.push(record);
    });

    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        message: results,
      }),
    });

    session.close();
    driver.close();
  })
  .catch(function (error) {
    console.log(error);
  });
};
