import promisify from 'promisify';
const login = promisify(wx.login);
const getUserInfo = promisify(wx.getUserInfo);
const getSetting = promisify(wx.getSetting);
const openSetting = promisify(wx.openSetting);
const getSystemInfo = promisify(wx.getSystemInfo);
const authorize = promisify(wx.authorize);
const scanCode = promisify(wx.scanCode);
const openLocation = promisify(wx.openLocation);
const getLocation = promisify(wx.getLocation);
const makePhoneCall = promisify(wx.makePhoneCall);
const saveImageToPhotosAlbum = promisify(wx.saveImageToPhotosAlbum);
const downloadFile = promisify(wx.downloadFile);
const checkSession = promisify(wx.checkSession);
const setClipboardData = promisify(wx.setClipboardData);
module.exports = {
    login: login,
    getUserInfo: getUserInfo,
    getSetting: getSetting,
    openSetting: openSetting,
    getSystemInfo: getSystemInfo,
    authorize: authorize,
    scanCode: scanCode,
    openLocation: openLocation,
    getLocation: getLocation,
    makePhoneCall: makePhoneCall,
    saveImageToPhotosAlbum: saveImageToPhotosAlbum,
    downloadFile: downloadFile,
    checkSession: checkSession,
    setClipboardData: setClipboardData
};
