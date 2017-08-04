'use strict';

var neo4j = require('neo4j-driver').v1;

var driver = neo4j.driver("bolt://"+process.env.NEO4J_URL, neo4j.auth.basic("neo4j" ,"linuxisgreat"));
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

module.exports.getJaccardOfCompetence = function(event, context, callback) {
  var session = driver.session();
  var results = [];
  session
  .run('MATCH (c:ns4_Skill {ns5_prefLabel: {queryParam}})-[:ns5_related]->(o:ns4_Occupation)<-[:ns5_related]-(other:ns4_Skill)  WITH c, other, COUNT(o) AS intersection, COLLECT(o.ns5_prefLabel) AS i  MATCH (c)-[:ns5_related]->(c_other:ns4_Occupation)  WITH c,other,intersection, i ,COLLECT(c_other.ns5_prefLabel) AS s1  MATCH (other)-[:ns5_related]->(oc:ns4_Occupation)  WITH c,other,intersection,i, s1, COLLECT(oc.ns5_prefLabel) AS s2    WITH c,other,intersection,s1,s2  WITH c,other,intersection,s1+filter(x IN s2 WHERE NOT x IN s1) AS union, s1, s2  RETURN c.ns5_prefLabel, other.ns5_prefLabel, s1,s2,intersection,((1.0*intersection)/SIZE(union)) AS jaccard ORDER BY jaccard DESC LIMIT 100',{queryParam: event.queryStringParameters.label})
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

module.exports.getSimilarCompetences = function(event, context, callback) {
  var session = driver.session();
  var results = [];


  if(event.httpMethod === "POST" && event.body) {

    let json = JSON.parse(event.body);
    console.log(json.competences);


  session
  .run('MATCH (n) WHERE n.ns1_identifier IN {queryParam} RETURN n;', {queryParam: json.competences})
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
}

};
