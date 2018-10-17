Component({
    behaviors: [],

    properties: {
        props: {
            type: Object,
            value: {
                type: 'success',
                msg: '',
                imagePath: '',
                duration: 1500
            },
            observer: function(newVal, oldVal) {}
        },
        visible: {
            type: Boolean,
            value: false,
            observer: function(newVal, oldVal) {}
        }
    },
    data: {
        iconColor: '#fff'
    },

    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function() {
        this._hideToast();
    },
    moved: function() {},
    detached: function() {},

    methods: {
        /**
         * 隐藏toaast
         */
        _hideToast: function() {
            setTimeout(() => {
                this.setData({
                    visible: false
                });
                this.triggerEvent('hidetoast', { visible: false });
            }, this.data.props.duration);
        }
    }
});
