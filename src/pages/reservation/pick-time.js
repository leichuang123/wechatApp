import api from '../../utils/api';
import { getDate, formatNumber, getDayOfWeek, confirmMsg, showLoading } from '../../utils/util';
const currentHour = new Date().getHours();
Page({
    data: {
        secondVisible: false,
        dayIndex: 0,
        timeIndex: null,
        datetime: '',
        days: [],
        timetable: [],
        initialTime: [],
        timetableForm: {
            date: '',
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
        showLoading();
        api.get('weapp/reservedata', this.data.timetableForm).then(res => {
            wx.hideLoading();
            if (res.errcode != 0) {
                confirmMsg('', res.errmsg, false);
                return;
            }
            this.setData({
                timetable: res.errcode === 0 ? res.data : []
            });
        });
    },
    /**
     * 监听预约时间的改变
     */
    timeChange: function(e) {
        const index = e.currentTarget.dataset.index;
        let row = e.currentTarget.dataset.item;
        if (!row.status) {
            confirmMsg('提示', '所选时间预约已满', false);
            return;
        }
        this.setData({
            datetime: this.data.timetableForm.date + ' ' + row.hour,
            timeIndex: index
        });
    },
    /**
     * 监听日期改变
     */
    dayChange: function(e) {
        const index = e.currentTarget.dataset.index;
        const date = e.currentTarget.dataset.date;
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
        const isInRange = this.data.datetime.substr(11, 2) == element.hour.substr(0, 2);
        this.setData({
            timeIndex: isInRange ? index : 999
        });
        return isInRange;
    },
    /**
     * 保存选择的预约时间
     */
    saveTime: function() {
        if (!this.data.datetime) {
            confirmMsg('提示', '请选择预约时间段', false);
            return;
        }
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        prevPage.setData({
            'form.reserve_time': this.data.datetime
        });
        wx.navigateBack({
            delta: 1
        });
        // const len = item.length;
        // if (getDate() == this.data.timetableForm.date && this.data.datetime.substr(11, 2) < formatNumber(currentHour)) {
        //     confirmMsg('提示', '所选时间小于当前时间', false);
        // } else if (
        //     this.data.datetime.substr(11, 2) < item[0].hour.substr(0, 2) ||
        //     this.data.datetime.substr(11, 2) >= item[len - 1].hour.substr(6, 2)
        // ) {
        //     confirmMsg('提示', '所选时间不在预约时间范围内', false);
        // } else {
        //     if (item.some(this.isTimeInRange)) {
        //         if (!item[this.data.timeIndex].status) {
        //             confirmMsg('提示', '该时间段预约已满', false);
        //         } else {
        //             prevPage.setData({
        //                 'form.reserve_time': this.data.datetime
        //             });
        //             wx.navigateBack({
        //                 delta: 1
        //             });
        //         }
        //     } else {
        //         confirmMsg('提示', '所选时间不在预约时间范围内', false);
        //     }
        // }
    },
    get15DaysAndWeeks: function() {
        let days = [];
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
        return days;
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            days: this.get15DaysAndWeeks(),
            datetime: '',
            initialTime: [currentHour, 0],
            timetableForm: {
                date: getDate(),
                store_id: options.storeId
            }
        });
        this.getTimetable();
    }
});
