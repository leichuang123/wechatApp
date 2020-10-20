import cities from '../../utils/city';
import api from '../../utils/api';
import { confirmMsg } from '../../utils/util';
import { getSetting } from '../../utils/wx-api';
const app = getApp();
Page({
    data: {
        isLocated: false,
        letters: [
            '定',
            '热',
            'A',
            'B',
            'C',
            'D',
            'E',
            'F',
            'G',
            'H',
            'J',
            'K',
            'L',
            'M',
            'N',
            'P',
            'Q',
            'R',
            'S',
            'T',
            'W',
            'X',
            'Y',
            'Z'
        ],
        winHeight: '',
        toView: 'cur',
        showLetter: '定',
        inputShowed: false,
        inputVal: '',
        hidden: true,
        city: '定位中...',
        locatedCity: {
            name: '定位中...',
            code: ''
        },
        hotCities: [
            { name: '北京市', code: '110000' },
            { name: '上海市', code: '310000' },
            { name: '广州市', code: '440100' },
            { name: '深圳市', code: '440300' },
            { name: '南京市', code: '320100' },
            { name: '杭州市', code: '330100' },
            { name: '武汉市', code: '420100' },
            { name: '成都市', code: '510100' }
        ],
        cities: [],
        searchResult: []
    },
    showInput: function() {
        this.setData({
            inputShowed: true
        });
    },
    hideInput: function() {
        this.setData({
            inputVal: '',
            searchResult: [],
            inputShowed: false
        });
    },
    /**
     * 清除搜索框
     */
    clearInput: function() {
        this.setData({
            inputVal: '',
            searchResult: []
        });
    },
    /**
     * 点击字母定位
     */
    clickLetter: function(e) {
        let id = e.currentTarget.dataset.id;
        if (id === '定') {
            this.setData({
                toView: 'cur',
                hidden: false,
                showLetter: '定'
            });
        } else if (id === '热') {
            this.setData({
                toView: 'hot',
                hidden: false,
                showLetter: '热'
            });
        } else {
            this.setData({
                toView: id,
                hidden: false,
                showLetter: id
            });
        }
        setTimeout(() => {
            this.setData({
                hidden: true
            });
        }, 500);
    },
    /**
     * 获取定位城市信息
     */
    getCityInfo: function(params) {
        api.get('weapp/getcityinfo', params, true).then(res => {
            this.setData({ loading: false });
            if (res.errcode === 0) {
                this.setData({
                    'locatedCity.name': res.data.ad_info.city,
                    'locatedCity.code': res.data.ad_info.city_code.substring(res.data.ad_info.nation_code.length),
                    isLocated: true
                });
                return;
            }
            confirmMsg('', res.errmsg, false);
        });
    },
    /**
     * 定位
     */
    getLocation: function() {
        getSetting()
            .then(res => {
                if (!res.authSetting['scope.userLocation']) {
                    this.setData({
                        'locatedCity.name': '定位失败，开启定位',
                        isLocated: false
                    });
                    return;
                }
                app.getLocation(res => {
                    this.getCityInfo(res);
                });
            })
            .catch(res => {
                this.setData({
                    'locatedCity.name': '定位失败，开启定位',
                    isLocated: false
                });
            });
    },
    /**
     * 搜索城市
     */
    queryCity: function(e) {
        let value = e.detail.value;
        this.setData({ inputVal: value });
        if (value !== '') {
            let result = [];
            for (let i = 0, len = cities.length; i < len; i++) {
                for (let j = 0, _len = cities[i].city.length; j < _len; j++) {
                    let m = cities[i].city[j];
                    if (
                        m.name.indexOf(value) === 0 ||
                        m.py.indexOf(value.toLowerCase()) === 0 ||
                        m.sx.indexOf(value.toLowerCase()) === 0
                    ) {
                        result.push(m);
                    }
                }
            }
            this.setData({
                searchResult: result
            });
        }
    },
    /**
     * 跳转到首页
     *
     */
    gotoIndex: function(e) {
        const item = e.currentTarget.dataset.item;
        console.log(item);
        wx.setStorageSync('selectedCity', {
            name: item.name,
            code: item.code
        });

        wx.switchTab({
            url: '/pages/index/index'
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function() {
        const systemInfo = wx.getStorageSync('systemInfo');
        const winHeight = systemInfo.windowHeight;
        const lineHeight = winHeight / 26;
        this.setData({
            cities: cities,
            winHeight: winHeight + 'px',
            lineHeight: lineHeight + 'px'
        });
    },
    onShow: function() {
        this.getLocation();
    }
});
