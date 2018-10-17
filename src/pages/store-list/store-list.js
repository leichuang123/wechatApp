import api from '../../utils/api';
let serviceIndex = 999;
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
        selectedArea: '附近',
        selectedService: '洗车美容',
        selectedSort: '默认排序',
        cityId: 0,
        totalPage: 0,

        areas: [],
        serviceTypes: [],
        subTypes: [],
        stores: [],
        sortItems: [{
                name: '默认排序',
                id: 0,
                value: 'distance',
                checked: true
            },
            {
                name: '距离最近',
                id: 1,
                value: 'distance',
                checked: false
            },
            {
                name: '人气最高',
                id: 2,
                value: 'popularity',
                checked: false
            },
            {
                name: '口碑最高',
                id: 3,
                value: 'rate',
                checked: false
            }
        ],
        form: {
            latitude: 0,
            longitude: 0,
            fromPage: '',
            addressId: '',
            addressType: 'city',
            classId: 1,
            classType: 'first',
            sortType: '',
            page: 1
        }
    },
    /**
     * 切换地区
     */
    changeArea: function(e) {
        let areas = this.data.areas,
            index = e.detail.value,
            items = areas.map((n, i) => {
                return Object.assign({}, n, {
                    checked: i == index
                });
            });
        this.setData({
            areas: items,
            areaAllChecked: index != 999 ? false : true,
            'form.addressId': index != 999 ? items[index].areaId : this.data.cityId,
            'form.addressType': index != 999 ? 'area' : 'city',
            'form.page': 1,
            selectedArea: index != 999 ? items[index].area : '附近',
            areaVisible: false,
            stores: [],
            loadingVisible: true,
            hasData: true,
            hasMore: true
        });
        this.getStores();
    },
    /**
     * 切换清洗服务类型
     */
    changeWashType: function(e) {
        let index = e.detail.value,
            serviceTypes = this.data.serviceTypes;
        let items = serviceTypes.map((n, i) => {
            return Object.assign({}, n, {
                checked: i == index
            });
        });
        this.setData({
            serviceTypes: items,
            serviceAllChecked: index != 999 ? false : true,
            'form.classId': index != 999 ? items[index].class_id : items[0].pid,
            'form.classType': index != 999 ? 'second' : 'first',
            'form.page': 1,
            selectedService: index != 999 ? items[index].class_name : '洗车美容',
            serviceVisible: false,
            stores: [],
            loadingVisible: true,
            hasData: true
        });
        this.getStores();
    },
    /**
     * 切换服务类型
     */
    changeServiceType: function(e) {
        let index = e.detail.value,
            subTypes = this.data.subTypes;
        let items = subTypes.map((n, i) => {
            return Object.assign({}, n, {
                checked: i == index
            });
        });
        this.setData({
            subTypes: items,
            subServiceAllChecked: index != 999 ? false : true,
            'form.classId': index != 999 ? items[index].class_id : items[0].pid,
            'form.classType': index != 999 ? 'second' : 'first',
            'form.page': 1,
            selectedService: index != 999 ? items[index].class_name : this.data.serviceTypes[serviceIndex].class_name,
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
            selectedSort: items[index].name,
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
        api.getRequest('weapp/getstorelist', this.data.form, false).then(res => {
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
    /**
     * 获取门店列表和分类
     *
     */
    getStoresWithClass: function() {
        api.getRequest('weapp/get-stores-with-class', this.data.form, false).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    stores: res.data.store.data,
                    totalPage: res.data.store.last_page,
                    areas: res.data.class.cityData.areaData,
                    serviceTypes: res.data.class.classData,
                    'form.addressId': res.data.class.cityData.cityId,
                    cityId: res.data.class.cityData.cityId
                });
            }
            let hasMore = res.errcode !== 0 || res.data.store.last_page <= 1 ? false : true;
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
        let index = e.currentTarget.dataset.index,
            items = this.data.serviceTypes[index];
        if (index == 999 || items.children === undefined || items.children.length === 0) {
            this.setData({
                subTypes: [],
                'form.classId': index != 999 ? items.class_id : 0,
                'form.classType': 'first',
                'form.page': 1,
                selectedService: index != 999 ? items.class_name : '全部类型',
                serviceVisible: false,
                stores: [],
                loadingVisible: true,
                hasData: true,
                hasMore: true
            });
            this.getStores();
            return;
        }
        serviceIndex = index;
        this.setData({
            subTypes: items.children,
            'form.page': 1,
            stores: []
        });
    },
    /**
     * 跳转到门店详情页
     */
    gotoDetail: function(e) {
        let item = e.currentTarget.dataset.item,
            storeData = JSON.stringify({
                storeId: item.sid,
                merchantId: item.merchans_id,
                fromPage: this.data.form.fromPage,
                latitude: this.data.form.latitude,
                longitude: this.data.form.longitude
            });
        item.status = item.wait >= 0 ? true : false;
        wx.setStorageSync('currentStore', item);
        wx.navigateTo({
            url: '/pages/store-list/detail?storeData=' + storeData
        });
    },
    /**
     * 获取位置信息
     */
    getLocation: function() {
        app.getLocation(res => {
            this.setData({
                'form.latitude': res.latitude,
                'form.longitude': res.longitude
            });
            this.getStoresWithClass();
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            'form.fromPage': options.type
        });
        wx.setNavigationBarTitle({
            title: options.type === 'wash' ? '排队取号' : '预约保养'
        });
        this.getLocation();
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
            stores: [],
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