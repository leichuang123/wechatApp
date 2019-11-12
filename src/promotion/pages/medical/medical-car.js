import api from "../../../utils/api";
Page({
  data: {
    loadingVisible: true,
    hasData: true,
    car: [],
    type: "",
    simNum: "", //sim卡
    obdNum: "" //ime玛
  },
  getCards: function() {
    api.get("/weapp/merchant-car").then(res => {
      if (res.errcode === 0) {
        this.setData({
          car: res.data
        });
      }
      this.setData({
        loadingVisible: false,
        hasData: this.data.car.length === 0 ? false : true
      });
    });
  },
  //查看详情
  gotoDetail: function(e) {
    console.log(e);
    wx.redirectTo({
      url:
        "../medical/medical?carName=" +
        e.currentTarget.dataset.item.car_number +
        "&car_id=" +
        e.currentTarget.dataset.item.car_id +
        "&customer_id=" +
        e.currentTarget.dataset.item.customer_id +
        "&type=" +
        this.data.type +
        "&simNum=" +
        this.data.simNum +
        "&obdNum=" +
        this.data.obdNum
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      type: options.type,
      simNum: options.simNum,
      obdNum: options.obdNum
    });
    this.getCards();
  }
});
