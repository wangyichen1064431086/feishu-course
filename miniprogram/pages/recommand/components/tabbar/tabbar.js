Component({
  data: {

  },
  properties: {

  },
  methods: {
    toPlanPage() {
      tt.navigateTo({
        url: '/pages/plan/plan'
      });
    },
    toSearchPage() {
      tt.navigateTo({
        url: '/pages/search/search'
      });
    },
    toHistoryPage() {
      tt.navigateTo({
        url: '/pages/history/history'
      })
    }
  }
})