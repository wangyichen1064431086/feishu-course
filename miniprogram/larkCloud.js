const LarkCloud = require('./libs/larkcloud-mp.min.js');
const serviceId = 'SERVICE_ID'; // 这里替换成你的 Service ID，可以从轻服务后台「设置」> 「基本信息」处拷贝「Service ID」获取

const larkcloud = new LarkCloud({ serviceId });

module.exports = larkcloud;
