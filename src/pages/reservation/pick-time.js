import api from '../../utils/api';
import { getDate, formatNumber, getDayOfWeek, confirmMsg } from '../../utils/util';
let days = [];
let weeks = ['日', '一', '二', '三', '四', '五', '六'];
let dayAndWeek = {};
let day = '';
for (let i = 0; i < 15; i++) {
    day = getDate(i);
    dayAndWeek = {
        week: getDayOfWeek(day),
        date: day,
        day: day.slice(5)
    };
    days.push(dayAndWeek);
}
const currentHour = new Date().getHours();
Page({
    data: {
        loading: false,
        secondVisible: false,
        dayIndex: 0,
        datetime: getDate() + ' ' + '08:00',
        days: days,
        timetable: [],
        initialTime: [currentHour, 0],
        timetableForm: {
            date: getDate(),
            store_id: 0
        }
    },
    /**
     * 返回到门店详情页
     */
    goBack: function() {
        wx.navigateBack({
            delta: 1
        });
    },
    /**
     * 获取每天可预约情况
     */
    getTimetable: function() {
        this.setData({
            loading: true
        });
        api.getRequest('weapp/reservedata', this.data.timetableForm).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    timetable: res.data,
                    loading: false
                });
            } else {
                this.setData({
                    timetable: [],
                    loading: false
                });
            }
        });
    },
    /**
     * 监听预约时间的改变
     */
    timeChange: function(e) {
        this.setData({
            datetime: this.data.timetableForm.date + ' ' + e.detail.time
        });
    },
    /**
     * 监听日期改变
     */
    dayChange: function(e) {
        let index = e.currentTarget.dataset.index,
            date = e.currentTarget.dataset.date;
        if (index === this.data.dayIndex) {
            return;
        }
        let initialHour = index !== 0 ? 8 : currentHour;
        this.setData({
            dayIndex: index,
            'timetableForm.date': date,
            datetime: date + ' ' + formatNumber(initialHour) + ':00',
            initialTime: [initialHour, 0]
        });
        this.getTimetable();
    },
    /**
     * 判断所选时间是否在预约时间范围内
     */
    isTimeInRange: function(element, index, array) {
        let isInRange = this.data.datetime.substr(11, 2) == element.hour.substr(0, 2);
        this.setData({
            timeIndex: isInRange ? index : 999
        });
        return isInRange;
    },
    /**
     * 保存选择的预约时间
     */
    saveTime: function() {
        let pages = getCurrentPages(),
            prevPage = pages[pages.length - 2],
            item = this.data.timetable,
            len = item.length,
            hour = [];
        if (getDate() == this.data.timetableForm.date && this.data.datetime.substr(11, 2) < formatNumber(currentHour)) {
            confirmMsg('提示', '所选时间小于当前时间', false);
        } else if (
            this.data.datetime.substr(11, 2) < item[0].hour.substr(0, 2) ||
            this.data.datetime.substr(11, 2) >= item[len - 1].hour.substr(6, 2)
        ) {
            confirmMsg('提示', '所选时间不在预约时间范围内', false);
        } else {
            if (item.some(this.isTimeInRange)) {
                if (!item[this.data.timeIndex].status) {
                    confirmMsg('提示', '该时间段预约已满', false);
                } else {
                    prevPage.setData({
                        'form.reserve_time': this.data.datetime
                    });
                    wx.navigateBack({
                        delta: 1
                    });
                }
            } else {
                confirmMsg('提示', '所选时间不在预约时间范围内', false);
            }
        }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            'timetableForm.store_id': options.storeId
        });
        this.getTimetable();
    }
});
