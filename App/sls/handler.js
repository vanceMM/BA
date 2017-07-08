'use strict';

var neo4j = require('neo4j-driver').v1;


module.exports.getNode = function(event, context, callback) {
  var driver = neo4j.driver("bolt://ip-172-31-36-168.eu-central-1.compute.internal", neo4j.auth.basic("neo4j", "linuxisgreat"));
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
