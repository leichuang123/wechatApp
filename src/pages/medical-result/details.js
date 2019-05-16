import api from '../../utils/api';
import { getDate } from '../../utils/util';
import { confirmMsg, showLoading } from '../../utils/util';
import F2 from '../../f2-canvas/lib/f2';
Page({
    data: {
        value: '',
        type: 1,
        date: '',
        opts1: {
            lazyLoad: true // 延迟加载组件
        },
        total: {},
        items: []
    },
    //获取信息
    getInfo(type, date) {
        const param = {
            obd_device_id: wx.getStorageSync('obd_device_id')[0],
            type: type,
            date: date
        };
        showLoading();
        const self = this;
        api.get('weapp-obd-user-car/travel-info', param).then(res => {
            if (res.errcode !== 0) {
                confirmMsg('', res.errmsg, false);
                wx.hideLoading();
                return;
            }
            self.setData({
                total: res.data.total,
                //折线数据
                items: res.data.items
            });
            this.chartComponent = this.selectComponent('#gauge-dom');
            this.chartComponent.init((canvas, width, height) => {
                const data = this.data.items;
                const chart = new F2.Chart({
                    el: canvas,
                    width,
                    height
                });
                chart.source(data, {
                    date: {
                        alias: '日期', // 列定义，定义该属性显示的别名
                        type: 'timeCat',
                        range: [0, 1],
                        tickCount: 4
                    },
                    fuel_lv: {
                        alias: '油耗'
                    },
                    distance: {
                        alias: '里程'
                    }
                });

                chart.legend({
                    position: 'bottom'
                });
                chart.axis('distance', {
                    grid: null
                });
                chart.guide().text({
                    position: ['min', 'max'],
                    content: '油耗/L',
                    style: {
                        textBaseline: 'middle',
                        textAlign: 'start'
                    },
                    offsetX: -10,
                    offsetY: -20
                });
                chart.guide().text({
                    position: ['min', 'max'],
                    content: '里程/KM',
                    style: {
                        textBaseline: 'middle',
                        textAlign: 'start'
                    },
                    offsetY: -20,
                    offsetX: 290
                });
                chart
                    .line()
                    .position('date*fuel_lv')
                    .shape('left')
                    .size(3);
                chart
                    .line()
                    .position('date*distance')
                    .color('#36B3C3')
                    .shape('right')
                    .size(3);
                chart.render();
            });
            wx.hideLoading();
        });
    },
    //切换类型
    check: function(e) {
        const index = e.currentTarget.id;
        this.setData({
            type: index
        });
        //切换类型日周月
        this.getInfo(this.data.type, this.data.date);
    },
    //更新日期
    bindDateChange: function(e) {
        this.setData({
            date: e.detail.value
        });
        this.getInfo(this.data.type, this.data.date);
    },
    onLoad: function(options) {
        this.setData({
            date: getDate(0)
        });
        //默认为当天的数据
        this.getInfo(1, getDate(0));
    }
});
