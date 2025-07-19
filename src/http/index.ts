import axios from "axios";

const http = axios.create({
    baseURL: 'http://localhost:8000', // Mudado para HTTP
    timeout: 10000,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
})

// Interceptor para requisições - adicionar token e logs
http.interceptors.request.use(function (config) {
    console.log('🚀 Fazendo requisição para:', config.method?.toUpperCase(), config.url);
    
    // Adicionar token de autorização se existir
    const token = sessionStorage.getItem('token')
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
        console.log('🔐 Token adicionado à requisição');
    }
    
    return config;
}, function (error) {
    console.error('❌ Erro no interceptor de requisição:', error);
    return Promise.reject(error);
});

// Interceptor para respostas - logs e tratamento de erros
http.interceptors.response.use(function (response) {
    console.log('✅ Resposta recebida:', response.status, response.config.url);
    return response;
}, function (error) {
    console.error('❌ Erro na resposta:', error);
    
    if (error.response) {
        // O servidor respondeu com um status de erro
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        console.error('Headers:', error.response.headers);
    } else if (error.request) {
        // A requisição foi feita mas não houve resposta
        console.error('Nenhuma resposta recebida:', error.request);
        
        // Verificar se é problema de conexão
        if (error.message.includes('Network Error')) {
            console.error('🔌 Problema de conexão com o servidor');
            console.error('💡 Dica: Verifique se o backend está rodando em http://localhost:8000');
        }
    } else {
        // Alguma coisa aconteceu na configuração da requisição
        console.error('Erro na configuração:', error.message);
    }
    
    // Se o token expirou, redirecionar para login
    if (error.response?.status === 401) {
        console.log('🔓 Token expirado, fazendo logout...');
        sessionStorage.removeItem('token');
        // Opcional: redirecionar para home ou mostrar modal de login
        window.location.reload();
    }
    
    return Promise.reject(error);
});

export default http
