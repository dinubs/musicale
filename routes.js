var c = require('./controllers/index');

module.exports = function(server) {
  // Base routes
  server.route({method: 'GET', path: '/', handler: c.Base.index});
  server.route({method: 'GET', path: '/track/{trid}', handler: c.Track.show});
  server.route({method: 'GET', path: '/api', handler: c.Api.index});
  server.route({method: 'GET', path: '/api/search', handler: c.Api.search});
  server.route({method: 'GET', path: '/api/get/{trid}', handler: c.Api.get});
  server.route({method: 'GET', path: '/api/get/{trid}/info', handler: c.Api.get_info});
  server.route({method: 'GET', path: '/api/get/{trid}/image', handler: c.Api.get_image});
  server.route({method: 'GET', path: '/api/get/{trid}/image/full', handler: c.Api.get_full_image});

  // Static files
  server.route({
    method: 'GET',
    path: '/css/{file}.css',
    handler: function (request, reply) {
        reply.file('./public/css/'+request.params.file+'.css');
    }
  });
  server.route({
      method: 'GET',
      path: '/js/{file}.js',
      handler: function (request, reply) {
          reply.file('./public/js/'+request.params.file+'.js');
      }
  });
  server.route({
      method: 'GET',
      path: '/images/{file}',
      handler: function (request, reply) {
          reply.file('./public/images/'+request.params.file);
      }
  });
};