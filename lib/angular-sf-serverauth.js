/*global _:true*/

/***
 If the user logs in this module sends the authResponse (accessToken, fbuid, signedRequest, ...)
 to the server.

 Not that clean...
***/
(function(_) {
  'use strict';

  var settings = {
    authUrl: '/rest/auth',
    serverAuthEnabled: true
  };

  // TODO :/
  angular.module('SFServerAuth', ['facebook'])
    .provider('ServerAuth', [
      function() {
        this.settings = settings;

        this.$get = ['$q', '$rootScope', 'Facebook', '$http',
          function($q, $rootScope, Facebook, $http) {
            var ServerAuther = function() {
              this.authUrl = settings.authUrl;
              this.serverAuthEnabled = settings.serverAuthEnabled;
            };

            ServerAuther.prototype.authWithServer = function() {
              var deferred = $q.defer(),
                self = this;

              if (!this.authResponse || !this.loggedIn || !this.serverAuthEnabled) {
                deferred.resolve();
              } else {
                $http
                  .post(this.authUrl, {
                    auth: this.authResponse
                  })
                  .success(function(result) {
                    deferred.resolve(null, result);
                  })
                  .error(function(err) {
                    self.loggedIn = false;
                    deferred.resolve(err);
                  });
              }

              return deferred.promise;
            };

            ServerAuther.prototype.handleAuthResponse = function(response) {
              this.loggedIn = response.status === 'connected';
              this.authResponse = response.authResponse;

              if (this.authResponse) {
                $http.defaults.headers.common['x-fb-access-token'] = this.authResponse.accessToken;
                $http.defaults.headers.common['x-fb-uid'] = this.authResponse.userID;
                $http.defaults.headers.common['x-fb-signed-request'] = this.authResponse.signedRequest;
              }

              return response;
            };

            ServerAuther.prototype.login = function() {
              var self = this,
                deferred = $q.defer();

              if (this.loggedIn) {
                deferred.resolve(self.loggedIn);
              } else {
                Facebook
                  .login()
                  .then(_.bind(this.handleAuthResponse, this))
                  .then(_.bind(this.authWithServer, this))
                  .then(function(err, result) {
                    deferred.resolve(self.loggedIn, result);
                  });
              }

              return deferred.promise;
            };

            ServerAuther.prototype.startSession = function() {
              Facebook
                .getLoginStatus()
                .then(_.bind(this.handleAuthResponse, this))
                .then(_.bind(this.authWithServer, this));
            };

            ServerAuther.prototype.ui = Facebook.ui;
            ServerAuther.prototype.api = Facebook.api;

            return new ServerAuther();
          }
        ];
      }
    ])
    .run(function($rootScope, ServerAuth) {
      ServerAuth.startSession();
    });
})(_);