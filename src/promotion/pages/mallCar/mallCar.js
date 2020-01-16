import api from '../../../utils/api';
import { showLoading, toastMsg, confirmMsg } from '../../../utils/util';
import { host } from '../../../config';
import { subtract, add, multiply } from '../../../utils/calculate';
Page({
    data: {
        host: host,
        value: 1,
        keyboardVisible: false,
        isAll: false,
        merchant_id: 0,
        myCar: [],
        myCarDie: [],
        reInfo: {},
        reIndex: 0,
        select: [],
        allMoney: 0.0,
        isCanCheckLength: 0
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let bmsWeappStoreInfo = wx.getStorageSync('bmsWeappStoreInfo');
        this.setData({
            merchant_id: bmsWeappStoreInfo.merchant_id
        });
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        this.getShopData();
    },
    /**
     * 手指触摸开始
     */
    _touchStart: function(e) {
        this.setData({
            touchStartPageX: e.changedTouches[0].pageX
        });
    },
    /**
     * 手指触摸结束
     */
    _touchEnd: function(e) {
        let touchEndPageX = e.changedTouches[0].pageX,
            offSetStartToEnd = touchEndPageX - this.data.touchStartPageX;
        if ((offSetStartToEnd < 10) & (offSetStartToEnd > -10)) {
            return;
        }
    },
    deleteDie: function(e) {
        let dieArr = this.data.myCarDie;
        let index = e.currentTarget.dataset.index;
        let ids = e.currentTarget.dataset.item.goods_id;
        let params = {
            merchant_id: this.data.merchant_id,
            goods_ids: [ids]
        };
        showLoading();
        api.post('/weapp/mall-cart/delete-goods', params).then(res => {
            wx.hideLoading();
            if (res.errcode == 0) {
                toastMsg('删除成功', 'success', 1000, () => {
                    dieArr.splice(index, 1);
                    this.setData({
                        myCarDie: dieArr
                    });
                });
                return;
            }
            confirmMsg('', res.errmsg, false);
        });
    },
    /**
     * 点击删除按钮
     */
    deleteTouchEnd: function(e) {
        let touchEndPageX = e.changedTouches[0].pageX,
            offSetStartToEnd = touchEndPageX - this.data.touchStartPageX;
        if ((offSetStartToEnd < 10) & (offSetStartToEnd > -10)) {
            this.dieThis(e);
        }
        return;
    },
    //左滑删除
    dieThis: function(e) {
        let dieArr = this.data.myCar;
        let index = e.currentTarget.dataset.index;
        let ids = e.currentTarget.dataset.item.goods_id;
        let params = {
            merchant_id: this.data.merchant_id,
            goods_ids: [ids]
        };
        showLoading();
        api.post('/weapp/mall-cart/delete-goods', params).then(res => {
            wx.hideLoading();
            if (res.errcode == 0) {
                toastMsg('删除成功', 'success', 1000, () => {
                    this.checkHas(e);
                    dieArr.splice(index, 1);
                    this.setData({
                        myCar: dieArr
                    });
                    this.watchCheck();
                });
                return;
            }
            confirmMsg('', res.errmsg, false);
        });
    },
    checkHas: function(e) {
        let id = e.currentTarget.dataset.item.goods_id;
        let isChecked = e.currentTarget.dataset.item.checked;
        let select = this.data.select;
        let money = 0;
        if (isChecked) {
            let spliceIndex = select.indexOf(id);
            select.splice(spliceIndex, 1);
            money = subtract(
                this.data.allMoney,
                multiply(e.currentTarget.dataset.item.sale_price, e.currentTarget.dataset.item.num)
            );
            this.setData({
                allMoney: money,
                select: select
            });
        }
    },
    //获取购物车列表
    getShopData: function() {
        showLoading();
        api.get('/weapp/mall-cart/get-cart-list', { merchant_id: this.data.merchant_id }).then(res => {
            wx.hideLoading();
            if (res.errcode == 0) {
                let myCar = res.data.goods_list;
                let myCarDie = res.data.invalid_goods_list;
                this.setData({
                    myCar: myCar,
                    myCarDie: myCarDie,
                    select: [],
                    isAll: false,
                    allMoney: 0
                });
                this.watchCheck();
            }
        });
    },
    //监听有效的勾选
    watchCheck: function() {
        let arr = this.data.myCar;
        if (arr.length == 0) {
            return;
        }
        let allLength = 0;
        let selectLength = this.data.select.length;
        arr.forEach(element => {
            if (element.can_buy) {
                allLength++;
            }
        });
        this.setData({
            isCanCheckLength: allLength
        });
        if (allLength == selectLength) {
            this.setData({
                isAll: true
            });
        } else {
            this.setData({
                isAll: false
            });
        }
    },
    //查看详情
    seeDetail: function(e) {
        wx.navigateTo({
            url: '../mallDetail/mallDetail?goods_id=' + e.currentTarget.dataset.item.goods_id
        });
    },
    delAll: function() {
        if (this.data.select.length == 0) {
            toastMsg('请选择商品', 'error');
            return;
        }
        if (this.data.select == 0) {
            return;
        }
        confirmMsg('', '确定删除商品？', true, () => {
            showLoading();
            let params = {
                merchant_id: this.data.merchant_id,
                goods_ids: this.data.select
            };
            api.post('/weapp/mall-cart/delete-goods', params).then(res => {
                wx.hideLoading();
                if (res.errcode == 0) {
                    toastMsg('删除成功', 'success', 1000, () => {
                        this.getShopData();
                        this.calData();
                    });
                    return;
                }
                confirmMsg('', res.errmsg, false);
            });
        });
    },
    //清除失效
    clearDie: function() {
        confirmMsg('', '确定清除失效商品？', true, () => {
            this.clearAllDie();
        });
    },
    clearAllDie: function() {
        let dieArr = this.data.myCarDie;
        let dieIds = [];
        dieArr.forEach(element => {
            dieIds.push(element.goods_id);
        });
        let params = {
            merchant_id: this.data.merchant_id,
            goods_ids: dieIds
        };
        showLoading();
        api.post('/weapp/mall-cart/delete-goods', params).then(res => {
            wx.hideLoading();
            if (res.errcode == 0) {
                toastMsg('删除成功', 'success', 1000, () => {
                    dieArr = [];
                    this.setData({
                        myCarDie: dieArr
                    });
                });
                return;
            }
            confirmMsg('', res.errmsg, false);
        });
    },
    //全选
    calData: function() {
        let arr = this.data.myCar;
        let money = 0;
        let select = [];
        arr.forEach(element => {
            if (element.can_buy) {
                element.checked = true;
                money = add(money, multiply(element.sale_price, element.num));
                select.push(element.goods_id);
            }
        });
        this.setData({
            myCar: arr,
            allMoney: money,
            select: select
        });
    },
    clickAll() {
        let stauts = this.data.isAll;
        stauts = !stauts;
        this.setData({
            isAll: stauts
        });
        if (stauts) {
            this.calData();
            return;
        }
        this.clearData();
    },
    clearData: function() {
        let arr = this.data.myCar;
        arr.forEach(element => {
            if (element.can_buy) {
                element.checked = false;
            }
        });
        this.setData({
            myCar: arr,
            allMoney: 0,
            select: []
        });
    },
    choosse(e) {
        if (!e.currentTarget.dataset.item.can_buy) {
            toastMsg('商品库存不足', 'error');
            return;
        }
        let select = this.data.select;
        let item = this.data.myCar;
        let index = e.currentTarget.dataset.index;
        let reulstIndex = select.indexOf(e.currentTarget.dataset.item.goods_id);
        let money = 0;
        if (reulstIndex !== -1) {
            select.splice(reulstIndex, 1);
            item[index].checked = false;
            money = subtract(this.data.allMoney, multiply(item[index].sale_price, item[index].num));
        } else {
            item[index].checked = true;
            select.push(e.currentTarget.dataset.item.goods_id);
            money = add(this.data.allMoney, multiply(item[index].sale_price, item[index].num));
        }
        this.setData({
            select: select,
            myCar: item,
            allMoney: money
        });
        this.watchCheck();
    },
    sumitOrder: function() {
        if (this.data.select.length == 0) {
            toastMsg('请选择商品', 'error');
            return;
        }
        confirmMsg('', '确定结算？', true, () => {
            let reslutData = this.data.myCar;
            let goods_list = [];
            reslutData.forEach(element => {
                if (element.checked) {
                    let obj = {
                        goods_id: element.goods_id,
                        num: element.num
                    };
                    goods_list.push(obj);
                }
            });
            wx.navigateTo({
                url: '../mallOrder/mallOrder?cart_buy=true' + '&goods_list=' + JSON.stringify(goods_list)
            });
        });
    },
    onAdd: function(e) {
        if (e.currentTarget.dataset.item.shortage) {
            toastMsg('商品缺货中', 'error');
            return;
        }
        let maxNumer = e.currentTarget.dataset.item.surplus_inventory;
        let currentIndex = e.currentTarget.dataset.index;
        let newCarData = this.data.myCar;
        if (newCarData[currentIndex].num == maxNumer) {
            toastMsg('已超过剩余数量', 'error');
            return;
        }
        newCarData[currentIndex].num++;
        let params = {
            num: newCarData[currentIndex].num,
            merchant_id: this.data.merchant_id,
            goods_id: newCarData[currentIndex].goods_id
        };
        showLoading();
        api.get('/weapp/mall-cart/update-goods-num', params).then(res => {
            wx.hideLoading();
            if (res.errcode !== 0) {
                confirmMsg('', res.errmsg, false);
                return;
            }
            let money = this.data.allMoney;
            if (e.currentTarget.dataset.item.checked) {
                money = add(money, e.currentTarget.dataset.item.sale_price);
            }
            this.setData({
                myCar: newCarData,
                allMoney: money
            });
        });
    },
    onDel: function(e) {
        if (e.currentTarget.dataset.item.shortage) {
            toastMsg('商品缺货中', 'error');
            return;
        }
        let currentIndex = e.currentTarget.dataset.index;
        let newCarData = this.data.myCar;
        if (newCarData[currentIndex].num == 1) {
            toastMsg('不能再减少了', 'error');
            return;
        }
        newCarData[currentIndex].num--;
        let params = {
            num: newCarData[currentIndex].num,
            merchant_id: this.data.merchant_id,
            goods_id: newCarData[currentIndex].goods_id
        };
        showLoading();
        api.get('/weapp/mall-cart/update-goods-num', params).then(res => {
            wx.hideLoading();
            if (res.errcode !== 0) {
                confirmMsg('', res.errmsg, false);
                return;
            }
            let money = this.data.allMoney;
            if (e.currentTarget.dataset.item.checked) {
                money = subtract(money, e.currentTarget.dataset.item.sale_price);
            }
            this.setData({
                myCar: newCarData,
                allMoney: money
            });
        });
    },
    onRe(e) {
        this.setData({
            keyboardVisible: true,
            reInfo: e.currentTarget.dataset.item,
            reIndex: e.currentTarget.dataset.index
        });
    },
    hideKeyboard: function() {
        this.setData({
            keyboardVisible: false
        });
    },
    buyNow: function(e) {
        let params = {
            num: e.detail.result.num,
            merchant_id: this.data.merchant_id,
            goods_id: this.data.reInfo.goods_id
        };
        showLoading();
        api.get('/weapp/mall-cart/update-goods-num', params).then(res => {
            wx.hideLoading();
            if (res.errcode !== 0) {
                confirmMsg('', res.errmsg, false);
                return;
            }
            let reslutData = this.data.myCar;
            reslutData[this.data.reIndex].num = e.detail.result.num;
            reslutData[this.data.reIndex].can_buy = true;
            this.setData({
                keyboardVisible: false,
                myCar: reslutData
            });
            this.watchCheck();
        });
    }
});
