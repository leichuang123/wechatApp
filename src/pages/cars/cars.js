import { get } from '../../utils/api';
import { showLoading } from '../../utils/util';
const app = getApp();
Page({
    data: {
        hidden: true,
        open: false,
        inputShowed: false,
        hotBrands: [],
        brands: {},
        toView: 'hot',
        showLetter: '热',
        winHeight: '',
        lineHeight: '',
        inputVal: '',
        seriesHeight: '',
        letters: [
            '热',
            'A',
            'B',
            'C',
            'D',
            'E',
            'F',
            'G',
            'H',
            'I',
            'J',
            'K',
            'L',
            'M',
            'N',
            'O',
            'P',
            'Q',
            'R',
            'S',
            'T',
            'U',
            'V',
            'W',
            'X',
            'Y',
            'Z',
        ],
        brandForm: {
            fromPage: 'weapp',
            name: '',
        },
        series: [],
        car: {},
    },
    /**
     * 显示键盘
     */
    showInput: function () {
        this.setData({
            inputShowed: true,
        });
    },
    /**
     * 隐藏键盘
     */
    hideInput: function () {
        this.setData({
            inputVal: '',
            inputShowed: false,
        });
        this.getBrandsWithHot();
    },
    /**
     * 清除搜索框
     */
    clearInput: function () {
        this.setData({
            inputVal: '',
        });
    },
    /**
     * 选择品牌
     */
    chooseBrand: function (e) {
        const item = e.currentTarget.dataset.item;
        let car = wx.getStorageSync('car');
        car.brand_id = item.id;
        car.car_brand_name = item.car_brand_name;
        car.letter = item.letter;
        car.logo = item.logo;
        wx.setStorageSync('car', car);
        this.getCarSeries(item.id);
        this.setData({
            car: item,
            open: true,
        });
    },
    /**
     * 监听点击右侧字母事件
     */
    clickLetter: function (e) {
        let id = e.currentTarget.dataset.id;
        if (id === '热') {
            this.setData({
                toView: 'hot',
                hidden: false,
                showLetter: '热',
            });
        } else {
            this.setData({
                toView: id,
                hidden: false,
                showLetter: id,
            });
        }
        setTimeout(() => {
            this.setData({
                hidden: true,
            });
        }, 500);
    },
    /**
     * 获取车品牌
     */
    getBrands: function () {
        showLoading();
        get('weapp/getcarbrand', this.data.brandForm, false).then((res) => {
            wx.hideLoading();
            this.setData({ brands: res.errcode === 0 ? res.data : [] });
        });
    },
    //获取所有车品牌和热门品牌
    getBrandsWithHot: function () {
        showLoading();
        get('weapp/get-car-brands-with-hot', this.data.brandForm, false).then((res) => {
            wx.hideLoading();
            if (res.errcode === 0) {
                this.setData({
                    brands: res.data.brands,
                    hotBrands: res.data.hotBrands,
                });
            }
        });
    },
    /**
     * 获取车系
     */
    getCarSeries: function (id) {
        showLoading();
        get('weapp/getcarserie', { brand_id: id }, false).then((res) => {
            wx.hideLoading();
            this.setData({
                series: res.errcode === 0 ? res.data : [],
            });
        });
    },
    /**
     * 隐藏车系面板
     */
    hideSeries: function () {
        this.setData({
            open: false,
        });
    },
    /**
     * 跳转到排量选择页面
     */
    toVolume: function (e) {
        this.hideSeries();
        const item = e.currentTarget.dataset.item;
        let car = wx.getStorageSync('car');
        car.serie_id = item.id;
        car.car_department = item.car_department;
        car.manufacturer_id = item.manufacturer_id;
        car.manufacturer = e.currentTarget.dataset.manufacturer;
        wx.setStorageSync('car', car);
        wx.navigateTo({
            url: 'year?id=' + item.id,
        });
    },
    /**
     * 搜索品牌
     */
    queryBrands: function (e) {
        if (!e.detail.value) {
            return;
        }
        this.setData({
            'brandForm.name': e.detail.value,
        });
        this.getBrands();
    },
    initData: function () {
        const systemInfo = wx.getStorageSync('systemInfo');
        const winHeight = systemInfo.windowHeight;
        const seriesHeight = winHeight - 56;
        const lineHeight = seriesHeight / 27;
        this.setData({
            winHeight: winHeight + 'px',
            lineHeight: lineHeight + 'px',
            seriesHeight: seriesHeight + 'px',
        });
        this.getBrandsWithHot();
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.initData();
    },
});
