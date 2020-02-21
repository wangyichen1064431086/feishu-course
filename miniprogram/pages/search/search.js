const larkCloud = require('../../larkCloud.js');

const baseData = {
  currStep: 0,
    percent: 0,
    budget: 0,
    selectedAc: '',
    isInputting: true,
    isSearching: false,
    currOption: 'outdoor',
    isStart: false,
    searchKey: '',
    selectedGroup: '',
    searchList: [],
    customSession: '',
    isEmpty: false,
}

Page({
  data: {...baseData},
  onLoad: function () {
    this.setData({...baseData})
    tt.getStorage({
      key: 'customSession',
      success: (res) => {
        this.setData({
          customSession: res.data
        })
      }
    });
  },
  formatType(type) {
    switch(type) {
      case 'outdoor':
        return '户外';
      case 'indoor':
        return '室内';
      case 'food':
        return '吃饭';
    }
  },
  nextStep() {
    const currStep = this.data.currStep
    if (currStep !== 1) {
      this.setData({
        currStep: currStep + 1,
        percent: (currStep + 1) * 50
      })
    } else {
      larkCloud.run('getSearchShops', {
        price: this.data.budget,
        type: this.data.currOption,
        pageSize: 100
      }).then(data => {
        this.setData({
          isStart: true,
          percent: 100
        })
        setTimeout(() => {
          this.setData({
            isInputting: false,
            isSearching: true,
            searchList: data.map((e) => ({
              ...e,
              starList: Array(Math.floor(e.star)).fill(),
              type: this.formatType(e.type)
            })),
            isEmpty: !data.length
          })
        }, 1000)
    });
    }
  },
  handlePrev() {
    const currStep = this.data.currStep
    if (this.data.isStart) {
      return
    }
    this.setData({
      currStep: currStep - 1,
      percent: (currStep - 1) * 33
    })
  },
  handleTypeTap(e) {
    this.setData({
      currOption: e.target.id
    })
  },
  handleItemTap(e) {
    const data = e.currentTarget.dataset
    tt.navigateTo({
      url: `/pages/create/create?shopname=${data.shopname}&address=${data.address}`
    });
  },
  handleBudgetFocus() {
    this.setData({
      budget: '',
    })
  },
  handlePeopleFocus() {
    this.setData({
      people: '',
    })
  },
  handleBudgetBlur(e) {
    this.setData({
      budget: +e.detail.value
    })
  },
  handlePeopleBlur(e) {
    this.setData({
      people: +e.detail.value
    })
  }
})