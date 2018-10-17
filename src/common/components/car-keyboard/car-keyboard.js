import { provinceKeyboard, alphaKeyboard, numKeyboard } from '../../../utils/data';
Component({
    behaviors: [],

    properties: {
        keyboardVisible: {
            type: Boolean,
            value: false,
            observer: function(newVal, oldVal) {}
        },
        carNumber: {
            type: String,
            value: '',
            observer: function(newVal, oldVal) {
                this.setData({
                    _carNumber: newVal,
                    textArr: newVal.length > 0 ? newVal.split('') : []
                });
            }
        }
    },
    data: {
        alphaKeyboard: false,
        alphaVisible: false,
        numVisible: false,
        provinces: provinceKeyboard,
        alpha: alphaKeyboard,
        numbers: numKeyboard,
        _carNumber: '',
        textArr: []
    },

    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function() {
        this.setData({
            textArr: this.data._carNumber.length > 0 ? this.data._carNumber.split('') : []
        });
    },
    moved: function() {},
    detached: function() {},

    methods: {
        /**
         * 隐藏键盘
         */
        _hideKeyboard: function() {
            this.setData({
                keyboardVisible: false
            });
            this.triggerEvent('hidekeyboard', { keyboardVisible: false });
        },
        /**
         * 键盘事件
         */
        tapKeyboard: function(e) {
            //获取键盘点击的内容，并将内容赋值到input框中
            let alphaVisible,
                numVisible,
                tapIndex = e.target.dataset.index,
                tapVal = e.target.dataset.val;
            if (tapVal === 'x') {
                //说明是删除
                this.data.textArr.pop();
                if (this.data.textArr.length == 0) {
                    //说明没有数据了，返回到省份选择键盘
                    alphaVisible = false;
                    numVisible = false;
                } else if (this.data.textArr.length === 1) {
                    //只能输入字母
                    alphaVisible = true;
                    numVisible = false;
                } else {
                    alphaVisible = true;
                    numVisible = true;
                }
                this.setData({
                    _carNumber: this.data.textArr.join(''),
                    alphaVisible: alphaVisible,
                    numVisible: numVisible
                });
                this.triggerEvent('getcarnumber', { carNumber: this.data._carNumber });
                return false;
            }
            if (tapVal === 'ABC') {
                if (this.data.textArr.length === 0 && this.data.textArr.length === 1) {
                    alphaVisible = true;
                    numVisible = false;
                } else {
                    alphaVisible = true;
                    numVisible = true;
                }
                this.setData({
                    _carNumber: this.data.textArr.join(''),
                    alphaVisible: alphaVisible,
                    numVisible: numVisible
                });
                this.triggerEvent('getcarnumber', { carNumber: this.data._carNumber });
                return false;
            }
            if (tapVal === '返回') {
                this.setData({
                    alphaVisible: false
                });
                return false;
            }
            if (this.data.textArr.length >= 8) {
                return false;
            }
            this.data.textArr.push(tapVal);
            this.setData({
                _carNumber: this.data.textArr.join(''),
                alphaVisible: true
            });
            this.triggerEvent('getcarnumber', { carNumber: this.data._carNumber });
            if (this.data.textArr.length > 1) {
                this.setData({
                    numVisible: true
                });
            }
        }
    }
});
