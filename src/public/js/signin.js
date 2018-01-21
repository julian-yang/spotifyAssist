function onSignIn(googleUser) {
  let profile = googleUser.getBasicProfile();
  // Do not send to your backend! Use an ID token instead.
  console.log('ID: ' + profile.getId());
  console.log('Name: ' + profile.getName());
  console.log('Image URL: ' + profile.getImageUrl());
  // This is null if the 'email' scope is not present.
  console.log('Email: ' + profile.getEmail());
  let id_token = googleUser.getAuthResponse().id_token;

  // Grab query string params
  let searchParams = new URLSearchParams(window.location.search);
  let state = searchParams.get('state');
  let clientId = searchParams.get('client_id');
  let redirectUrl = searchParams.get('redirect_uri');
  let expectedRedirectUri =
        'https://oauth-redirect.googleusercontent.com/r/spotify-assist';
  if (clientId === 'google' /*&& redirectUrl === expectedRedirectUri*/) {
    let form = $('<form></form>');
    form.attr('method', 'POST');
    form.attr('action', 'tokensignin');
    params = {
        'idtoken': id_token,
        'state': state,
        'redirectUrl': redirectUrl,
        'clientId': clientId,
    };
    redirectPost('signin', params);
//    var xhr = new XMLHttpRequest();
//    xhr.open('POST', 'tokensignin');
//    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
//    xhr.onload = function() {
//      console.log('Signed in as: ' + xhr.responseText);
//    };
//    var formParams = ['idtoken=' + id_token, 'state=' + state, 'redirectUrl=' + redirectUrl];
//    xhr.send(formParams.join('&'));
  }
}

function redirectPost(url, data) {
    let form = document.createElement('form');
    form.method = 'POST';
    form.action = url;
    for (let name in data) {
        let input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = data[name];
        form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
    });
}