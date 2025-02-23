const cron = require('node-cron');
const axios = require('axios');

// API配置
const CONFIG = {
    TOKEN_URL: 'https://v3-hw.blacklake.cn/api/openapi/domain/api/v1/access_token/_get_access_token',
    DATA_URL: 'https://v3-hw.blacklake.cn/api/openapi/domain/web/v1/route/custom-object/open/v1/custom_object/create',
    APP_KEY: 'cli_1740108763565535',
    APP_SECRET: '74116a585b3f4a5e9ac7dcbcae7ac6ab'
};

// 获取访问令牌
async function getAccessToken() {
    try {
        const response = await axios.post(CONFIG.TOKEN_URL, {
            appKey: CONFIG.APP_KEY,
            appSecret: CONFIG.APP_SECRET
        });

        if (response.data.code === 200) {
            return response.data.data.appAccessToken;
        } else {
            throw new Error(`获取令牌失败: ${response.data.message}`);
        }
    } catch (error) {
        console.error('获取访问令牌时出错:', error.message);
        throw error;
    }
}

// 写入数据
async function writeData(token) {
    try {
        const currentTime = new Date().toISOString();
        const response = await axios.post(
            CONFIG.DATA_URL,
            {
                fields: [
                    {
                        fieldCode: "main_field",
                        fieldValue: currentTime
                    }
                ],
                objectCode: "crontable__c",
                sync: false
            },
            {
                headers: {
                    'X-AUTH': token,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('数据写入成功:', response.data);
        return response.data;
    } catch (error) {
        console.error('写入数据时出错:', error.message);
        throw error;
    }
}

// 主要任务函数
async function executeTask() {
    try {
        const token = await getAccessToken();
        await writeData(token);
    } catch (error) {
        console.error('执行任务时出错:', error.message);
    }
}

// 设置定时任务 - 每分钟执行一次
cron.schedule('* * * * *', async () => {
    console.log('开始执行定时任务:', new Date().toLocaleString());
    await executeTask();
});

// 程序启动时立即执行一次
console.log('程序启动，执行首次任务');
executeTask(); 