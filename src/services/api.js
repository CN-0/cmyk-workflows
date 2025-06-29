const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('accessToken');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    
    if (response.success && response.data.tokens) {
      this.setToken(response.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
    }
    
    return response;
  }

  async register(email, password, name) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: { email, password, name },
    });
    
    if (response.success && response.data.tokens) {
      this.setToken(response.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
    }
    
    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.setToken(null);
      localStorage.removeItem('refreshToken');
    }
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.request('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    });

    if (response.success && response.data.tokens) {
      this.setToken(response.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
    }

    return response;
  }

  // Workflow endpoints
  async getWorkflows(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/workflows${queryString ? `?${queryString}` : ''}`);
  }

  async getWorkflow(id) {
    return this.request(`/workflows/${id}`);
  }

  async createWorkflow(workflow) {
    return this.request('/workflows', {
      method: 'POST',
      body: workflow,
    });
  }

  async updateWorkflow(id, updates) {
    return this.request(`/workflows/${id}`, {
      method: 'PUT',
      body: updates,
    });
  }

  async deleteWorkflow(id) {
    return this.request(`/workflows/${id}`, {
      method: 'DELETE',
    });
  }

  async duplicateWorkflow(id) {
    return this.request(`/workflows/${id}/duplicate`, {
      method: 'POST',
    });
  }

  // Execution endpoints
  async getExecutions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/executions${queryString ? `?${queryString}` : ''}`);
  }

  async getExecution(id) {
    return this.request(`/executions/${id}`);
  }

  async triggerWorkflow(workflowId, triggerData = {}) {
    return this.request('/executions', {
      method: 'POST',
      body: { workflowId, triggerData },
    });
  }

  async cancelExecution(id) {
    return this.request(`/executions/${id}/cancel`, {
      method: 'POST',
    });
  }

  // Template endpoints
  async getTemplates() {
    return this.request('/templates');
  }

  async getTemplate(id) {
    return this.request(`/templates/${id}`);
  }

  // User endpoints
  async getUsers() {
    return this.request('/users');
  }

  async getUser(id) {
    return this.request(`/users/${id}`);
  }

  async updateUser(id, updates) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: updates,
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }
}

export default new ApiService();