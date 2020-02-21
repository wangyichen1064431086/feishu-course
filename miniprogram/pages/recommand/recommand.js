const larkCloud = require('../../larkCloud.js');

Page({
  data: {
    recommandList: [],
    currentItem: 'item-0',
    scrollTop: 0
  },
  onLoad: function (options) {
    tt.showLoading({
      title: '光速加载中...',
    });
    larkCloud.run('getRecommands').then(data => {
      tt.hideToast({});
      this.setData({
        recommandList: data.map((item) => ({
          ...item,
          starList: Array(Math.floor(+item.star)).fill()
        }))
      });
    });
  },
  handleDropClick: function(e) {
    const index = +e.target.id.split('item-')[1];
    this.setData({
      currentItem: `item-${(index + 1) % this.data.recommandList.length}`
    });
  },
  handleItemTap(e) {
    const data = e.currentTarget.dataset;
    tt.navigateTo({
      url: `/pages/create/create?shopname=${data.shopname}&address=${data.address}`
    });
  }
});
