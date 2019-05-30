import api from '../../../utils/api';
import { toastMsg, showLoading } from '../../../utils/util';
import F2 from '../../../f2-canvas/lib/f2';
Page({
    data: {
        opts: {
            lazyLoad: true // 延迟加载组件
        },
        result: {},
        arr: ['正常', '异常']
    },
    //获取车辆体检结果
    carResult() {
        showLoading();
        const param = {
            obd_device_id: wx.getStorageSync('obd_device_id')[0]
        };
        api.get('weapp-obd-user-car/run-car-test', param).then(res => {
            if (res.errcode == 3000) {
                toastMsg('暂无数据', 'error', 2000);
                return;
            }
            if (res.errcode == 0) {
                this.setData({
                    result: res.data
                });
                this.chartComponent = this.selectComponent('#pieSelect');
                this.chartComponent.init((canvas, width, height) => {
                    const data = [
                        {
                            x: '1',
                            y: this.data.result.score
                        }
                    ];
                    const chart = new F2.Chart({
                        el: canvas,
                        width,
                        height
                    });
                    chart.source(data, {
                        y: {
                            max: 100,
                            min: 0
                        }
                    });
                    chart.axis(false);
                    chart.tooltip(false);
                    chart.coord('polar', {
                        transposed: true,
                        innerRadius: 0.8,
                        radius: 0.85
                    });
                    chart.guide().arc({
                        start: [0, 0],
                        end: [1, 99.98],
                        top: false,
                        style: {
                            lineWidth: 20,
                            stroke: '#ccc'
                        }
                    });
                    chart.guide().text({
                        position: ['50%', '50%'],
                        content: this.data.result.score + '分',
                        style: {
                            fontSize: '26',
                            fill: '#1890FF'
                        }
                    });
                    chart
                        .interval()
                        .position('x*y')
                        .size(20);
                    chart.render();
                });
                wx.hideLoading();
                return;
            }
            toastMsg(res.errmsg, 'error', 2000);
        });
    },
    onLoad: function(options) {
        this.carResult();
    },
    onShow() {}
});
