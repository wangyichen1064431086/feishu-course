const larkCloud = require('../../larkCloud.js');

Page({
  data: {
    historyList: [],
    customSession: '',
    isEmpty: false,
  },
  onLoad: function (options) {
    tt.showLoading({
      title: '光速加载中...',
    });
    tt.getStorage({
      key: 'customSession',
      success: (res) => {
        this.setData({
          customSession: res.data
        });
        larkCloud.run('getHistories', {
          sessionKey: this.data.customSession
        }).then(data => {
          tt.hideLoading({});
          this.setData({
            historyList: data.map((item) => {
              return {
                time: item.start.time_stamp,
                groupName: item.chatName,
                shopName: item.shopName,
                address: item.address,
              }
            }),
            isEmpty: !data.length
          });
        });
      }
    });
  }
});
