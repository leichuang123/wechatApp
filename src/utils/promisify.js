import Promise from '../assets/plugins/es6-promise.min'
// module.exports = ((fn) => {
//     return (obj = {}) => {
//         return new Promise((resolve, reject) => {
//             obj.success = (res) => {
//                 resolve(res)
//             }
//             obj.fail = (res) => {
//                 reject(res)
//             }
//             fn(obj)
//         })
//     }
// })
module.exports = (api) => {
    return (options, ...params) => {
        return new Promise((resolve, reject) => {
            api(Object.assign({}, options, { success: resolve, fail: reject }), ...params);
        });
    }
}