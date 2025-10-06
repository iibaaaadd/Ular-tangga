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
    console.log('API Request interceptor - Token found:', token ? 'Yes' : 'No');
    console.log('API Request to:', config.baseURL + config.url);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set');
    } else {
      console.warn('No auth token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
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
      if (filters.material_id) params.append('material_id', filters.material_id);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.per_page) params.append('per_page', filters.per_page);
      
      const queryString = params.toString();
      const url = queryString ? `/questions?${queryString}` : '/questions';
      
      const response = await api.get(url);
      return response.data;
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

// Material API Services
export const materialService = {
  // Get all materials with pagination and search
  async getMaterials(params = {}) {
    try {
      const response = await api.get('/materials', { params });
      return response.data;
    } catch (error) {
      console.error('MaterialService: Error getting materials:', error);
      throw error.response?.data || error;
    }
  },

  // Get single material by ID
  async getMaterial(id) {
    try {
      const response = await api.get(`/materials/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create new material
  async createMaterial(materialData) {
    try {
      // If materialData is FormData, remove Content-Type to let browser set it
      const config = {};
      if (materialData instanceof FormData) {
        config.transformRequest = [(data, headers) => {
          delete headers['Content-Type'];
          return data;
        }];
      }
      
      const response = await api.post('/materials', materialData, config);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update material
  async updateMaterial(id, materialData) {
    try {
      // If materialData is FormData, use POST with _method=PUT for Laravel
      const config = {};
      let endpoint = `/materials/${id}`;
      let method = 'put';
      
      if (materialData instanceof FormData) {
        // For FormData, use POST with _method field for Laravel compatibility
        method = 'post';
        config.transformRequest = [(data, headers) => {
          delete headers['Content-Type'];
          return data;
        }];
      }
      
      console.log('MaterialService: Updating with method:', method, 'endpoint:', endpoint);
      
      const response = method === 'post' 
        ? await api.post(endpoint, materialData, config)
        : await api.put(endpoint, materialData, config);
        
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete material
  async deleteMaterial(id) {
    try {
      const response = await api.delete(`/materials/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get materials with question counts
  async getMaterialsWithCounts() {
    try {
      const response = await api.get('/materials-with-counts');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// Game Room API
export const gameRoomService = {
  // Get teacher's rooms
  async getTeacherRooms() {
    try {
      const response = await api.get('/game-rooms');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create new room
  async createRoom(roomData) {
    try {
      const response = await api.post('/game-rooms', roomData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get room details
  async getRoomDetails(roomCode) {
    try {
      const response = await api.get(`/game-rooms/${roomCode}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Join room (for students)
  async joinRoom(roomCode) {
    try {
      const response = await api.post('/game-rooms/join', { room_code: roomCode });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Start studying phase
  async startStudying(roomCode) {
    try {
      const response = await api.post(`/game-rooms/${roomCode}/start-studying`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Start game
  async startGame(roomCode) {
    try {
      const response = await api.post(`/game-rooms/${roomCode}/start-game`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get leaderboard
  async getLeaderboard(roomCode) {
    try {
      const response = await api.get(`/game-rooms/${roomCode}/leaderboard`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// Game Session API
export const gameSessionService = {
  // Get current question
  async getCurrentQuestion(roomCode) {
    try {
      const response = await api.get(`/game-sessions/room/${roomCode}/current-question`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Start next question (teacher)
  async startNextQuestion(roomCode) {
    try {
      const response = await api.post(`/game-sessions/room/${roomCode}/next-question`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Submit answer (student)
  async submitAnswer(sessionId, answerData) {
    try {
      const response = await api.post(`/game-sessions/${sessionId}/submit-answer`, answerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};