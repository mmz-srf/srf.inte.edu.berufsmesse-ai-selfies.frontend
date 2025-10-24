const backendUrl = process.env.NODE_ENV === 'production' ? 'https://192.168.2.1:8080' : 'http://localhost:8080';

const config = {
    backendUrl,
    urlBasePath: '/api/v1',
};

export default config;