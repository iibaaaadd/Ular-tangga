import axios from 'axios';

// Base URL untuk Laravel API
const BASE_URL = 'http://127.0.0.1:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Request interceptor untuk menambahkan token authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired atau invalid
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// User API Services
export const userService = {
  // Get all users with pagination (admin only)
  async getUsers(page = 1, perPage = 10, search = '', role = '') {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...(search && { search }),
        ...(role && { role })
      });
      
      const response = await api.get(`/admin/users?${params}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get single user (admin only)
  async getUser(id) {
    try {
      const response = await api.get(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create user (admin only)
  async createUser(userData) {
    try {
      const response = await api.post('/admin/users', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update user (admin only)
  async updateUser(id, userData) {
    try {
      const response = await api.put(`/admin/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete user (admin only)
  async deleteUser(id) {
    try {
      const response = await api.delete(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// Auth API Services (existing but enhanced)
export const authService = {
  // Login
  async login(credentials) {
    try {
      const response = await api.post('/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Register
  async register(userData) {
    try {
      const response = await api.post('/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Logout
  async logout() {
    try {
      const response = await api.post('/logout');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const response = await api.get('/user');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// Question API Services
export const questionService = {
  // Get all questions with optional filters
  async getQuestions(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Add filters if they exist
      if (filters.subtype) params.append('subtype', filters.subtype);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.created_by) params.append('created_by', filters.created_by);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.per_page) params.append('per_page', filters.per_page);
      
      const queryString = params.toString();
      const url = queryString ? `/questions?${queryString}` : '/questions';
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get single question by ID
  async getQuestion(id) {
    try {
      const response = await api.get(`/questions/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create new question (MCQ, True/False, or Essay)
  async createQuestion(questionData) {
    try {
      const response = await api.post('/questions', questionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update existing question
  async updateQuestion(id, questionData) {
    try {
      const response = await api.put(`/questions/${id}`, questionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete question
  async deleteQuestion(id) {
    try {
      const response = await api.delete(`/questions/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Helper function to create MCQ question
  async createMCQQuestion(questionData) {
    const mcqData = {
      prompt: questionData.prompt,
      difficulty: questionData.difficulty,
      subtype: 'mcq',
      options: questionData.options,
      correct_option_index: questionData.correct_option_index
    };
    return this.createQuestion(mcqData);
  },

  // Helper function to create True/False question
  async createTrueFalseQuestion(questionData) {
    const tfData = {
      prompt: questionData.prompt,
      difficulty: questionData.difficulty,
      subtype: 'true_false',
      is_true: questionData.is_true
    };
    return this.createQuestion(tfData);
  },

  // Helper function to create Essay question
  async createEssayQuestion(questionData) {
    const essayData = {
      prompt: questionData.prompt,
      difficulty: questionData.difficulty,
      subtype: 'essay',
      key_points: questionData.key_points,
      max_score: questionData.max_score
    };
    return this.createQuestion(essayData);
  }
};