angular-sf-serverauth
=====================

An internal module I use for FB apps :)

```bash
bower install git@github.com:davidgengenbach/angular-sf-serverauth.git --save
```


```javascript
angular.module('MYAPP', ['SFServerAuth'])
  .config(function(ServerAuthProvider, FacebookProvider) {
    ServerAuthProvider.settings.authUrl = '/rest/auth';
    ServerAuthProvider.settings.serverAuthEnabled = true;
    FacebookProvider.init('APPPPPPPP ID');
  })
  .run(function(ServerAuth) {
    ServerAuth
      .login()
      .then(function() {
        debugger;
      });
  });
```
