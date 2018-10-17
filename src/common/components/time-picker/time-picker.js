import { formatNumber } from '../../../utils/util';
const hours = [];
const minutes = [];
const seconds = [];
for (let i = 0; i < 24; i++) {
    hours.push(formatNumber(i));
}
for (let i = 0; i < 60; i++) {
    minutes.push(formatNumber(i));
    seconds.push(formatNumber(i));
}
Component({
    behaviors: [],
    properties: {
        hourVisible: {
            type: Boolean,
            value: true,
            observer: function(newVal, oldVal) {}
        },
        minuteVisible: {
            type: Boolean,
            value: true,
            observer: function(newVal, oldVal) {}
        },
        secondVisible: {
            type: Boolean,
            value: true,
            observer: function(newVal, oldVal) {
                this.setData({
                    secondVisible: newVal
                });
            }
        },
        initialTime: {
            type: Array,
            value: [8, 0],
            observer: function(newVal, oldVal) {
                this.setData({
                    time: newVal
                });
            }
        }
    },
    data: {
        hours: hours,
        minutes: minutes,
        seconds: seconds,
        selectedTime: '08:00',
        time: [8, 0]
    },
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function() {},
    moved: function() {},
    detached: function() {},
    methods: {
        _timeChange: function(e) {
            let val = e.detail.value;
            this.setData({
                selectedTime: this.data.hours[val[0]] + ':' + this.data.minutes[val[1]]
            });
            this.triggerEvent('timechange', { time: this.data.selectedTime });
        }
    }
});
