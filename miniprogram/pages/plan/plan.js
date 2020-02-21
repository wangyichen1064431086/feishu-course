const larkCloud = require('../../larkCloud.js');

Page({
  data: {
    planList: [],
    isEmpty: false,
    customSession: '',
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
        })
        larkCloud.run('getPlans', {
          sessionKey: this.data.customSession
        }).then(data => {
          tt.hideLoading({});
          this.setData({
            planList: data.map((item) => {
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
