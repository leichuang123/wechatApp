import { host } from '../config';
import Promise from '../assets/plugins/es6-promise.min';
import { confirmMsg } from 'util';
const checkStatus = res => {
    if (res.statusCode !== 200) {
        res.data.errcode = !res.data.errcode ? -404 : res.data.errcode;
        res.data.errmsg = !res.data.errmsg ? '请求失败，请稍后重试' : res.data.errmsg;
    }
    return res.data;
};
/**
 * 检测登录状态
 */
const checkLogin = res => {
    if (res.errcode === 999) {
        confirmMsg('亲', '您还没有注册呢，先注册一下吧', true, () => {
            wx.redirectTo({
                url: '/pages/register/register'
            });
        });
    }
    return res;
};
/**
 * get请求
 */
const get = (url, params = {}, check = true) => {
    let data = params;
    data.sessionKey = wx.getStorageSync('sessionKey') || null;

    const promise = new Promise((resolve, reject) => {
        wx.request({
            url: host + url,
            data: data,
            method: 'GET',
            header: {
                'content-type': 'application/json'
            },
            success: res => {
                resolve(checkStatus(res));
            },
            fail: res => {
                reject(res);
            }
        });
    });
    if (check) {
        return promise.then(checkLogin);
    } else {
        return promise;
    }
};
/**
 * post请求
 */
const post = (url, data = {}) => {
    let formData = data;
    formData.sessionKey = wx.getStorageSync('sessionKey') ? wx.getStorageSync('sessionKey') : '';
    return new Promise((resolve, reject) => {
        wx.request({
            url: host + url,
            data: formData,
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: res => {
                resolve(checkStatus(res));
            },
            fail: res => {
                reject(res);
            }
        });
    }).then(checkLogin);
};

module.exports = {
    get: get,
    post: post
};
