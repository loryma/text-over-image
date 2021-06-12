const APP_ID = '60c4bd263620d478964318a0';
const BASE_URL = 'https://dummyapi.io/data/api';

export const API = {
  getPosts: (limit) => {
    return fetch(`${BASE_URL}/post?limit=${limit}`, { method: 'GET', headers: { 'app-id': APP_ID } });
  }
}