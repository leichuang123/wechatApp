import api from '../../utils/api';
import F2 from '../../f2-canvas/lib/f2';
import { confirmMsg, showLoading } from '../../utils/util';
let chart;
Page({
    data: {
        typeArr: ['', 'distance_describe', 'oil_describe', 'speed_describe', 'behavior ', 'exception '],
        type: '',
        last: true,
        opts: {
            lazyLoad: true // 延迟加载组件
        },
        drawBar: {
            lazyLoad: true // 延迟加载组件
        },
        all: '',
        describe: {}
    },
    //获取信息
    getInfo(type) {
        const self = this;
        let pages = getCurrentPages();
        let prevPage = pages[pages.length - 2];
        const param = {
            obd_device_id: wx.getStorageSync('obd_device_id')[0],
            date: prevPage.data.date,
            require: self.data.typeArr[self.data.type]
        };
        showLoading();
        api.get('weapp-obd-user-car/travel-info', param).then(res => {
            if (res.errcode !== 0) {
                confirmMsg('', res.errmsg, false);
                wx.hideLoading();
                return;
            }
            //总里程
            if (self.data.type == 1) {
                self.setData({
                    all: '总里程' + res.data.total.distance,
                    describe: res.data.distance_describe
                });
            }
            //总油耗
            if (self.data.type == 2) {
                self.setData({
                    all: '总油耗' + res.data.total.fuel_lv,
                    describe: res.data.oil_describe
                });
            }
            //总速度
            if (self.data.type == 3) {
                self.setData({
                    all: '平均速度' + res.data.total.avg_speed,
                    describe: res.data.speed_describe
                });
            }
            //驾驶行为
            if (self.data.type == 4) {
                self.setData({
                    describe: res.data.behavior
                });
            }
            //报警
            if (self.data.type == 5) {
                self.setData({
                    describe: res.data.exception
                });
            }
            //饼状图
            if (self.selectComponent('#pieSelect')) {
                self.chartComponent = self.selectComponent('#pieSelect');
                self.chartComponent.init((canvas, width, height) => {
                    const data = [
                        { name: '超速', percent: self.data.describe.over_speed.percent },
                        { name: '高速', percent: self.data.describe.high_speed.percent },
                        { name: '中速', percent: self.data.describe.mid_speed.percent },
                        { name: '低速', percent: self.data.describe.low_speed.percent },
                        { name: '怠速', percent: self.data.describe.no_speed.percent }
                    ];
                    const chart = new F2.Chart({
                        el: canvas,
                        width,
                        height
                    });
                    chart.source(data, {
                        percent: {
                            formatter: function formatter(val) {
                                return val + '%';
                            }
                        }
                    });
                    chart.legend({
                        position: 'right'
                    });
                    chart.tooltip(false);
                    chart.coord('polar', {
                        transposed: true,
                        radius: 0.85,
                        innerRadius: 0.618
                    });
                    chart.axis(false);
                    chart
                        .interval()
                        .position('a*percent')
                        .color('name', ['#8a24a8', '#ff9800', '#726bda', '#76d2f6', '#259b24'])
                        .adjust('stack')
                        .style({
                            lineWidth: 1,
                            stroke: '#fff',
                            lineJoin: 'round',
                            lineCap: 'round'
                        });

                    chart.interaction('pie-select', {
                        cancelable: false, // 不允许取消选中
                        animate: {
                            duration: 300,
                            easing: 'backOut'
                        },
                        onEnd(ev) {
                            const { shape, data, shapeInfo, selected } = ev;
                            if (shape) {
                                if (selected) {
                                    self.setData({
                                        message: data.name + ': ' + data.percent + '%'
                                    });
                                }
                            }
                        }
                    });
                    chart.guide().text({
                        position: ['50%', '50%'],
                        content: self.data.all,
                        style: {
                            fontSize: 14,
                            fill: '#101010', // 文本颜色
                            fontWeight: 'bold' // 文本粗细
                        }
                    });
                    chart.render();
                    self.chart = chart;
                    return chart;
                });
            }
            //柱状图
            if (self.selectComponent('#pieSelects')) {
                self.chartComponent = self.selectComponent('#pieSelects');
                self.chartComponent.init((canvas, width, height) => {
                    var data = [
                        { name: '急加速', sales: self.data.describe.rapid },
                        { name: '急加油', sales: self.data.describe.come },
                        { name: '快速变道', sales: self.data.describe.rapidLane_change },
                        { name: '急转弯', sales: self.data.describe.sharp_turn },
                        { name: '急刹车', sales: self.data.describe.slam_the_brakes_on },
                        { name: '超速', sales: self.data.describe.speeding },
                        { name: '怠速', sales: self.data.describe.idling }
                    ];
                    if (this.data.type == 5) {
                        data = [
                            { name: '震动报警', sales: self.data.describe.shock },
                            { name: '插拔报警', sales: self.data.describe.pull_out },
                            { name: '拖车报警', sales: self.data.describe.trailer },
                            { name: '疲劳驾驶报警', sales: self.data.describe.fatigue_driving },
                            { name: '急电瓶欠电报警刹车', sales: self.data.describe.battery },
                            { name: 'GPS模块故障报警', sales: self.data.describe.GPS },
                            { name: '冷却液温度过高报警', sales: self.data.describe.coolant }
                        ];
                    }
                    chart = new F2.Chart({
                        el: canvas,
                        width,
                        height
                    });
                    chart.source(data, {
                        sales: {
                            tickCount: 7
                        }
                    });
                    chart.axis('name', false);
                    chart
                        .interval()
                        .position(['name', 'sales'])
                        .color('name', ['#8a24a8', '#ff9800', '#726bda', '#76d2f6', '#259b24', '#009688', '#e51c23']);
                    chart.render();
                    return chart;
                });
            }
            wx.hideLoading();
        });
    },

    onLoad: function(options) {
        const type = options.type;
        this.setData({
            type: type
        });
        this.getInfo();
        if (type == 4) {
            this.setData({
                last: false
            });
        }
        if (type == 5) {
            this.setData({
                last: false
            });
        }
    }
});
