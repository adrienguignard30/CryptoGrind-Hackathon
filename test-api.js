const axios = require('axios');

const X_API_TOKEN = 'AAAAAAAAAAAAAAAAAAAAACaW0gEAAAAACB636aGf6g9Js3p%2FxVfzyE9TM8M%3DVIVtpFxA8QYi6n9TuoapC5P88JZjV6hyrTQRuZcgHgRlWDEAgT';

const testApi = async () => {
  try {
    const response = await axios.get('https://api.x.com/2/tweets/1911158667698749614', {
      params: { 'tweet.fields': 'text,created_at' },
      headers: { Authorization: `Bearer ${X_API_TOKEN}` },
    });
    console.log('Réponse API :', response.data);
  } catch (error) {
    console.error('Erreur API :', error.response?.data || error.message);
  }
};

testApi();