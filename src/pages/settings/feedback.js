import { toastMsg } from '../../utils/util';
Page({
    data: {
        toastVisible:false,
        toastProps:{},
        cntentLength: 0,
        content: ''
    },
    /**
     * 获取输入的内容
     */
    getContent: function(e) {
        let content = e.detail.value;
        this.setData({
            content: content,
            cntentLength: content.length
        });
    },
    /**
     * 提交反馈
     */
    submit: function() {
        if (this.data.content === '') {
            toastMsg('反馈不能为空', 'error');
            return;
        }
        toastMsg('提交成功', 'success', 1000, () => {
            wx.navigateBack({
                delta: 1
            });
        });
    },
})