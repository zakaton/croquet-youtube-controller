(() => {
    function getCodePenIdAndUser() {
      const CODEPEN_ID = /(cdpn|codepen)\.io\/([^/]+)\/(pen|debug|fullpage|fullembedgrid)\/([^?#]+)/;
      let id = null, user = null;
  
      let parse = CODEPEN_ID.exec(window.location.href);
      if (parse) {
        // for a debug view, drop through to return null (and therefore use the whole location)
        if (parse[3] !== 'debug') {
          user = parse[2];
          id = parse[4];
          return {user, id};
        }
      } else {
        // Case when you're in CodePen editor
        // the iFrame doesn't contain the pen's id and you can't 
        // access the perant's address as it's on different subdomain
        var metas = document.getElementsByTagName('link');
        for (i=0; i<metas.length; i++) {
          if (metas[i].getAttribute('rel') === 'canonical') {
            parse = CODEPEN_ID.exec(metas[i].getAttribute('href'));
            if (parse) {
              user = parse[2];
              id = parse[4];
              return {user, id};
            }
          }
        }
      }
  
      return null;
    }
    
    const app = Croquet.App;
    const penInfo = getCodePenIdAndUser();
    app.sessionURL = penInfo ? `https://codepen.io/${penInfo.user}/full/${penInfo.id}` : window.location.href;
    if (!document.getElementById('widgets')) {
      const widgetDiv = document.createElement('div');
      widgetDiv.id = 'widgets';
      document.body.appendChild(widgetDiv);
      const badgeDiv = document.createElement('div');
      badgeDiv.id = 'badge';
      widgetDiv.appendChild(badgeDiv);
      const qrDiv = document.createElement('div');
      qrDiv.id = 'qrcode';
      widgetDiv.appendChild(qrDiv);
      const statsDiv = document.createElement('div');
      statsDiv.id = 'stats';
      widgetDiv.appendChild(statsDiv);
    }
    app.badge = 'badge';
    app.qrcode = 'qrcode';
    app.stats = 'stats';
    app.messages = true;
  })();