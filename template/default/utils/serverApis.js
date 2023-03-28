const http = uni.$u.http

// post请求，获取菜单
export const postExample = (data, config = {}) => http.post('/example/post', data, config)

// get请求，获取菜单，注意：get请求的配置等，都在第二个参数中
export const getExample = (data) => http.get('/example/get', data)