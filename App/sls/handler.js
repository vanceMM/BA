'use strict';

var neo4j = require('neo4j-driver').v1;


module.exports.getNode = function(event, context, callback) {
  var driver = neo4j.driver("bolt://"+process.env.NEO4J_URL, neo4j.auth.basic(process.env.USER ,process.env.PASSWORD));
  var session = driver.session();
  session
    .run('MATCH (c:Competence) return c;')
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
