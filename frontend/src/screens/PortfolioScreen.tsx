// src/screens/PortfolioScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import axios from 'axios';

interface Portfolio {
  id: number;
  title: string;
  description: string;
  link: string;
}

const PortfolioScreen: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const response = await axios.get('http://10.0.2.2:8000/api/portfolios/portfolios/', {
          headers: { Authorization: `Token YOUR_TOKEN_HERE` },
        });
        setPortfolios(response.data);
      } catch (err) {
        setError('獲取作品集失敗');
      }
    };
    fetchPortfolios();
  }, []);

  const handleAddPortfolio = async () => {
    try {
      await axios.post('http://10.0.2.2:8000/api/portfolios/portfolios/', {
        title,
        description,
        link,
      }, {
        headers: { Authorization: `Token YOUR_TOKEN_HERE` },
      });
      setTitle('');
      setDescription('');
      setLink('');
      const response = await axios.get('http://10.0.2.2:8000/api/portfolios/portfolios/', {
        headers: { Authorization: `Token YOUR_TOKEN_HERE` },
      });
      setPortfolios(response.data);
    } catch (err) {
      setError('新增作品失敗');
    }
  };

  return (
    <View>
      <Text>作品集</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="標題"
      />
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="描述"
      />
      <TextInput
        value={link}
        onChangeText={setLink}
        placeholder="連結"
      />
      <Button title="新增作品" onPress={handleAddPortfolio} />
      {error && <Text>{error}</Text>}
      <FlatList
        data={portfolios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View>
            <Text>{item.title}</Text>
            <Text>{item.description}</Text>
            <Text>{item.link}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default PortfolioScreen;