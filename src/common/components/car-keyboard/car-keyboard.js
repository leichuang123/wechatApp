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
        provinces: ['京', '津', '冀', '晋', '蒙', '辽', '吉', '黑', '沪', '苏', '浙', '皖', '闽', '赣', '鲁', '豫', '鄂', '湘', '粤', '桂', '琼', '川', '贵', '云', '渝', '藏', '陕', '甘', '青', '宁', 'ABC', '新', '港', '澳', '使', '领', '警', '学', 'x'],
        alpha: ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Z', '返回', 'X', 'C', 'V', 'B', 'N', 'M', 'x'],
        numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
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
