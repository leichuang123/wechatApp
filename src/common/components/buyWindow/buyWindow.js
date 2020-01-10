import { host } from '../../../config';
import { confirmMsg, toastMsg } from '../../../utils/util';
import { subtract } from '../../../utils/calculate';
import { api } from '../../../utils/api';
Component({
    behaviors: [],

    properties: {
        keyboardVisible: {
            type: Boolean,
            value: false,
            observer: function(newVal, oldVal) {}
        },
        storeInfo: {
            type: Object,
            value: '',
            observer: function(newVal, oldVal) {
                this.setData({
                    goodInfo: newVal,
                    max: subtract(parseInt(newVal.inventory), parseInt(newVal.already_num))
                });
            }
        }
    },
    data: {
        host: host,
        goodInfo: {},
        value: 1,
        has: false,
        loading: false,
        max: 0
    },

    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function() {
        this.setData({});
    },
    moved: function() {},
    detached: function() {},

    methods: {
        onClose: function(e) {
            this.setData({
                keyboardVisible: false
            });
            this.triggerEvent('hidekeyboard', { keyboardVisible: false });
        },
        onAdd: function() {
            if (this.data.goodInfo.shortage) {
                toastMsg('商品缺货中', 'error');
                return;
            }
            let number = this.data.value;
            number++;
            if (this.data.value == this.data.max) {
                toastMsg('已超过剩余数量', 'error');
                return;
            }
            this.setData({
                value: number
            });
        },
        onDel: function() {
            let number = this.data.value;
            if (number == 1) {
                return;
            }
            number--;
            this.setData({
                value: number
            });
        },
        onTap: function() {
            if (!this.data.goodInfo.goods_id) {
                toastMsg('商品下架了', 'error');
                return;
            }
        }
    }
});
