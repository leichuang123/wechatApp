/**
 * 小程序配置文件
 */
// const host = 'bms-local.com'; //local
// const host = 't8.hb400.net'; //staging
const host = 'sh.huobanyc.com'; //hbyc
// const host = 'new.p-oneclub.com'; //zdmc

const config = {
    // host: 'http://bms-local.com/', //local
    // host: 'http://t8.hb400.net/', //staging
  host: 'https://sh.huobanyc.com/', //hbyc
  // host: 'https://new.p-oneclub.com/', //zdmc

    // 上传文件接口
    // uploadFileUrl: `http://${host}/weapp/upload`,
    uploadFileUrl: `https://${host}/weapp/upload`, //product
    // 腾讯地图的key
    key: 'SLSBZ-BYRKG-NLYQ3-ILT6E-7OZFS-UAF4I'
};

module.exports = config;
