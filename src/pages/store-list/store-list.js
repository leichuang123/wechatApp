import api from '../../utils/api';
import { showLoading, toastMsg } from '../../utils/util';
const app = getApp();
Page({
    data: {
        loadingVisible: true,
        hasData: true,
        hasMore: true,
        loadMoreVisible: false,
        areaVisible: false,
        sortVisible: false,
        serviceVisible: false,
        serviceAllChecked: true,
        subServiceAllChecked: true,
        areaAllChecked: true,
        selectedArea: {
            areaId: '420100',
            area: '武汉市',
            father: '420000',
            checked: true
        },
        selectedServiceClass: {
            class_id: 1,
            class_name: '洗车美容',
            pid: 0,
            checked: true
        },
        currentServiceClassIndex: 0,
        selectedSort: {
            name: '默认排序',
            id: 0,
            value: 'distance',
            checked: true
        },
        cityId: 0,
        totalPage: 0,

        defaultMenus: {
            area: '',
            serviceClass: '',
            sort: '默认排序'
        },

        areas: [],
        serviceClasses: [],
        subTypes: [],
        stores: [],
        form: {
            auth_type: 0,
            auth_related_id: 0,
            latitude: 0,
            longitude: 0,
            fromPage: '',
            cityId: '',
            classId: 0,
            classType: 'first',
            sortType: '',
            page: 1
        }
    },
    /**
     * 切换地区
     */
    changeArea: function(e) {
        const index = e.detail.value;
        const items = this.data.areas.map((n, i) => {
            return Object.assign({}, n, {
                checked: i == index
            });
        });
        this.setData({
            areas: items,
            'form.cityId': items[index].areaId,
            'form.page': 1,
            selectedArea: items[index],
            areaVisible: false,
            stores: [],
            loadingVisible: true,
            hasData: true,
            hasMore: true
        });
        this.getStores();
    },
    /**
     * 切换服务类型
     */
    changeServiceType: function(e) {
        const index = e.detail.value;
        let items = this.data.subTypes.map((n, i) => {
            return Object.assign({}, n, {
                checked: i == index
            });
        });

        let serviceClasses = this.data.serviceClasses;
        serviceClasses.forEach(val => {
            val.checked = false;
            if (!!val.children) {
                val.children.forEach(v => {
                    v.checked = false;
                });
            }
        });
        serviceClasses[this.data.currentServiceClassIndex].checked = true;
        serviceClasses[this.data.currentServiceClassIndex].children = items;

        this.setData({
            'form.classId': items[index].class_id,
            'form.classType': 'second',
            'form.page': 1,
            subTypes: items,
            selectedServiceClass: items[index],
            serviceClasses: serviceClasses,
            serviceVisible: false,
            stores: [],
            loadingVisible: true,
            hasData: true,
            hasMore: true
        });
        this.getStores();
    },
    /**
     * 改变排序规则
     */
    changeSort: function(e) {
        let index = e.detail.value,
            sortItems = this.data.sortItems;
        let items = sortItems.map((n, i) => {
            return Object.assign({}, n, {
                checked: i == index
            });
        });
        this.setData({
            sortItems: items,
            'form.sortType': items[index].value,
            'form.page': 1,
            selectedSort: items[index],
            sortVisible: false,
            loadingVisible: true,
            hasData: true,
            hasMore: true,
            stores: []
        });
        this.getStores();
    },
    /**
     * 监听下拉框
     */
    dropdown: function(e) {
        let _id = e.currentTarget.id;
        switch (_id) {
            case 'area':
                this.setData({
                    areaVisible: !this.data.areaVisible,
                    sortVisible: false,
                    serviceVisible: false
                });
                break;
            case 'serviceType':
                this.setData({
                    areaVisible: false,
                    sortVisible: false,
                    serviceVisible: !this.data.serviceVisible
                });
                this.getDefaultServiceSubClasses();
                break;
            case 'sort':
                this.setData({
                    areaVisible: false,
                    sortVisible: !this.data.sortVisible,
                    serviceVisible: false
                });
                break;
        }
    },
    /**
     * 获取门店列表
     */
    getStores: function() {
        api.get('weapp/get-stores', this.data.form, false).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    stores: this.data.stores.concat(res.data.data),
                    totalPage: res.data.last_page
                });
            }
            let hasMore = res.errcode !== 0 || this.data.form.page >= res.data.last_page ? false : true;
            this.setData({
                loadMoreVisible: false,
                loadingVisible: false,
                hasMore: hasMore,
                hasData: this.data.stores.length === 0 ? false : true
            });
        });
    },

    getCurrentServiceClassIndex: function(serviceClass) {
        return serviceClass.findIndex(val => val.checked);
    },
    /**
     * 获取门店列表和分类
     *
     */
    getStoresWithClass: function() {
        api.get('weapp/get-stores-with-class', this.data.form, false).then(res => {
            if (res.errcode === 0) {
                const index = this.getCurrentServiceClassIndex(res.data.classes.serviceClass.classes);
                this.setData({
                    stores: res.data.stores.data,
                    totalPage: res.data.stores.last_page,
                    areas: res.data.classes.areas.areas,
                    serviceClasses: res.data.classes.serviceClass.classes,
                    sortItems: res.data.classes.sortItems.sortItems,
                    selectedArea: res.data.classes.areas.default,
                    selectedServiceClass: res.data.classes.serviceClass.default,
                    selectedSort: res.data.classes.sortItems.default,
                    currentServiceClassIndex: index > -1 ? index : 0
                });
            }
            let hasMore = res.errcode !== 0 || res.data.stores.last_page <= 1 ? false : true;
            this.setData({
                loadMoreVisible: false,
                loadingVisible: false,
                hasMore: hasMore,
                hasData: this.data.stores.length === 0 ? false : true
            });
        });
    },
    /**
     * 获取服务子分类
     */
    getSubTypes: function(e) {
        const index = e.currentTarget.dataset.index;
        const items = this.data.serviceClasses.map((n, i) => {
            return Object.assign({}, n, {
                checked: i == index
            });
        });
        if (items[index].children === undefined || items[index].children.length === 0) {
            this.setData({
                subTypes: [],
                serviceClasses: items,
                'form.classId': items[index].class_id,
                'form.classType': 'first',
                'form.page': 1,
                selectedServiceClass: items[index],
                serviceVisible: false,
                stores: [],
                loadingVisible: true,
                hasData: true,
                hasMore: true
            });
            this.getStores();
            return;
        }
        this.setData({
            subTypes: items[index].children,
            serviceClasses: items,
            currentServiceClassIndex: index,
            'form.page': 1,
            stores: []
        });
    },
    getDefaultServiceSubClasses() {
        const index = this.data.serviceClasses.findIndex(val => val.checked);
        this.setData({
            subTypes: index > -1 ? this.data.serviceClasses[index].children : []
        });
    },
    /**
     * 切换门店
     */
    gotoDetail: function(e) {
        let item = e.currentTarget.dataset.item;
        item.status = item.wait >= 0 ? true : false;
        wx.setStorageSync('currentStore', item);
        let bmsWeappStoreInfo = wx.getStorageSync('bmsWeappStoreInfo');
        bmsWeappStoreInfo.store_id = item.sid;
        bmsWeappStoreInfo.merchant_id = item.merchans_id;
        bmsWeappStoreInfo.store_name = item.store_name;
        bmsWeappStoreInfo.distance = item.distance;
        showLoading();
        api.get('/weapp/change-select-store', { store_id: item.sid }).then(res => {
            wx.hideLoading();
            if (res.errcode !== 0) {
                toastMsg(res.errmsg, 'error');
                return;
            }
            toastMsg('门店切换成功', 'success', 1000, () => {
                wx.setStorageSync('bmsWeappStoreInfo', bmsWeappStoreInfo);
                wx.reLaunch({
                    url: '/pages/index/index?from=list'
                });
            });
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        const selectedCity = wx.getStorageSync('selectedCity');
        let bmsWeappStoreInfo = wx.getStorageSync('bmsWeappStoreInfo');
        this.setData({
            'form.latitude': bmsWeappStoreInfo.latitude,
            'form.longitude': bmsWeappStoreInfo.longitude,
            'form.auth_type': app.globalData.extConfig.auth_type || 1,
            'form.auth_related_id': app.globalData.extConfig.auth_related_id || 1,
            'selectedArea.name': selectedCity.name
        });
        this.getStoresWithClass();
    },
    /**
     * 下拉刷新
     */
    onPullDownRefresh: function() {
        this.setData({
            loadingVisible: true,
            loadMoreVisible: false,
            hasData: true,
            hasMore: true,
            'form.page': 1,
            stores: []
        });
        this.getStores();
    },
    /**
     * 下拉加载更多
     */
    onReachBottom: function() {
        if (!this.data.hasMore || this.data.form.page >= this.data.totalPage) {
            return;
        }
        this.setData({
            loadMoreVisible: true,
            'form.page': this.data.form.page + 1
        });
        this.getStores();
    }
});
