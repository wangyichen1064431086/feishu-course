const larkCloud = require('../../larkCloud.js');

const baseData = {
  groupList: [],
  customSession: '',
  selectedGroupName: '',
  selectedGroup: '',
  isSecret: false,
  date: '',
  time: '',
  shopName: '',
  address: '',
}
Page({
  data: {...baseData},
  onLoad: function (options) {
    this.setData({
      ...baseData,
      shopName: options.shopname,
      address: options.address,
    })
    tt.getStorage({
      key: 'customSession',
      success: (res) => {
        this.setData({
          customSession: res.data
        })
      }
    });
  },
  handleGroupConfirm(e) {
    larkCloud.run('getGroup', {
      keywords: e.detail.value,
      sessionKey: this.data.customSession
    }).then(data => {
      this.setData({
        groupList: data.data.groups
      })
    });
  },
  bindDateChange(e) {
    this.setData({
      date: e.detail.value
    })
  },
  handleOptionChange(e) {
    this.setData({
      isSecret: e.detail.value
    })
  },
  handleCreateTap() {
    if (!this.data.date) {
      tt.showToast({
        title: '请先选择时间',
        duration: 1000,
        icon: 'none'
      });
      return
    }
    if (!this.data.selectedGroup) {
      tt.showToast({
        title: '请先选择 Lark 群',
        duration: 1000,
        icon: 'none'
      });
      return
    }
    larkCloud.run('createTB', {
      isPrivate: false,
      chatId: this.data.selectedGroup,
      chatName: this.data.selectedGroupName,
      shopName: this.data.shopName,
      address: this.data.address,
      start: {
        time_stamp: this.data.date,
      },
      sessionKey: this.data.customSession
    }).then(res => {
      tt.showToast({
        title: '日程创建成功',
        duration: 2000,
        success (res) {
          setTimeout(() => {
            tt.navigateTo({
              url: '/pages/recommand/recommand'
            });
          }, 1000)
        },
        fail (res) {
          console.log(`showToast 调用失败`);
        }
      });
    });
  },
  handleGrouptap(e) {
    this.setData({
      selectedGroup: e.currentTarget.dataset.chatid,
      selectedGroupName: e.currentTarget.dataset.chatname,
    })
  },
});
