import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { ArrowLeft } from 'lucide-react-native';

const API_BASE_URL = 'http://192.168.1.8:3000/api';

export default function CreateTransaction() {
  const router = useRouter();
  const { user } = useUser();

  const [transactionType, setTransactionType] = useState('Expense');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    'Food & Drinks',
    'Shopping',
    'Transportation',
    'Entertainment',
    'Bills',
    'Income',
    'Other',
  ];

  const handleAmountChange = (text) => {
    const cleanText = text.replace(/[^0-9.]/g, '');
    const parts = cleanText.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setAmount(cleanText);
  };

  const isFormValid = title.trim() && selectedCategory && parseFloat(amount) > 0;

  const createTransaction = async () => {
    if (!isFormValid) {
      Alert.alert('Incomplete', 'Please fill all required fields correctly');
      return;
    }

    setIsLoading(true);
    try {
      const transactionAmount = transactionType === 'Expense'
        ? -Math.abs(parseFloat(amount))
        : Math.abs(parseFloat(amount));

      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          title: title.trim(),
          amount: transactionAmount,
          category: selectedCategory,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create transaction');

      Alert.alert('Success', 'Transaction created!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err) {
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Transaction</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Toggle */}
        <View style={styles.toggleContainer}>
          {['Expense', 'Income'].map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.toggleButton,
                transactionType === type && styles.activeToggle
              ]}
              onPress={() => setTransactionType(type)}
            >
              <Text style={[
                styles.toggleText,
                transactionType === type && styles.activeToggleText
              ]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Amount */}
        <Text style={styles.label}>Amount</Text>
        <View style={styles.amountInputContainer}>
          <Text style={styles.currency}>₹</Text>
          <TextInput
            value={amount}
            onChangeText={handleAmountChange}
            keyboardType="decimal-pad"
            placeholder="0.00"
            style={styles.amountInput}
            placeholderTextColor="#ccc"
          />
        </View>

        {/* Title */}
        <Text style={styles.label}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Enter title"
          style={styles.input}
          placeholderTextColor="#aaa"
        />

        {/* Category */}
        <Text style={styles.label}>Category</Text>
        <View style={styles.categories}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.categoryItem,
                selectedCategory === cat && styles.selectedCategory
              ]}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === cat && styles.selectedCategoryText
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, !isFormValid && { opacity: 0.5 }]}
          disabled={!isFormValid || isLoading}
          onPress={createTransaction}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>Save Transaction</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F3' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },

  scrollContent: { padding: 20 },

  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#f1f1f1',
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#B8860B',
  },
  toggleText: {
    fontWeight: '600',
    color: '#555',
  },
  activeToggleText: {
    color: '#fff',
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  currency: {
    fontSize: 26,
    color: '#666',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 26,
    fontWeight: '300',
    color: '#222',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 14,
    marginBottom: 20,
    fontSize: 16,
    color: '#333',
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
    marginBottom: 30,
  },
  categoryItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#eee',
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedCategory: {
    backgroundColor: '#000',
  },
  categoryText: {
    fontSize: 14,
    color: '#555',
  },
  selectedCategoryText: {
    color: '#fff',
  },

  saveButton: {
    backgroundColor: '#c8860b',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
