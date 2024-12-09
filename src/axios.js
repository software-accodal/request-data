import instance from 'axios';

const axios = instance.create({
    baseURL: 'https://accodal-api-rc8y.onrender.com/api',
    headers: { token: 's3cretKey' }
});

export default axios;