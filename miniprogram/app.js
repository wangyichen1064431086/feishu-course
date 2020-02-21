const larkCloud = require('./larkCloud.js');

App({
  onLaunch: function () {
    tt.login({
      success (res) {
        larkCloud.run('getCustomSession', {
          code: res.code
        }).then(customSession => {
          tt.setStorage({
            key: 'customSession',
            data: customSession
          });
        });
      },
      fail () {
        console.log(`login 调用失败`);
      }
    });

    tt.redirectTo({
      url: 'pages/recommand/recommand',
    });
  }
});
