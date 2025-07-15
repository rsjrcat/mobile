import { SignedIn, SignedOut, useUser, useClerk } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { 
  Text, 
  View, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  Alert
} from 'react-native'
import { LogOut, Plus } from 'lucide-react-native'
import { useTransactions } from '../../hooks/useTransactions'
import { useEffect, useState } from 'react'
import PageLoader from '../../components/PageLoader'

export default function Page() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const { transactions, summary, isLoading, loadData, deleteTransaction } = useTransactions(user?.id)
  const [refreshing, setRefreshing] = useState(false)

  const router = useRouter(); 

  useEffect(() => {
    if (user?.id) {
      loadData()
    }
  }, [loadData, user?.id])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut()
          }
        }
      ]
    )
  }

  const handleDeleteTransaction = async (transactionId) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTransaction(transactionId)
          }
        }
      ]
    )
  }

  const formatAmount = (amount) => {
    const numAmount = parseFloat(amount)
    return numAmount >= 0 ? `+₹${Math.abs(numAmount).toFixed(2)}` : `-₹${Math.abs(numAmount).toFixed(2)}`
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'rent': return '🏠'
      case 'salary': return '💰'
      case 'groceries': return '🛒'
      case 'phone bill': return '📱'
      case 'freelance work': return '💻'
      case 'food': return '🍕'
      case 'transport': return '🚗'
      case 'entertainment': return '🎬'
      case 'utilities': return '⚡'
      case 'shopping': return '🛍️'
      default: return '💳'
    }
  }

  console.log("User ID:", user?.id)
  console.log('Transactions:', transactions)
  console.log('Summary:', summary)

  if (isLoading && !refreshing) return <PageLoader />

  return (
    <SafeAreaView style={styles.container}>
      <SignedIn>
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.emailAddresses[0]?.emailAddress?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.greeting}>Good Morning</Text>
                <Text style={styles.username}>
                  {user?.firstName || user?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'User'}
                </Text>
              </View>
            </View>
            <View style={styles.headerButtons}>
 <TouchableOpacity style={styles.addButton} onPress={() => router.push('/(root)/create')}>                
  <Plus size={16} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                <LogOut size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>
              ₹{summary?.balance ? parseFloat(summary.balance).toFixed(2) : '0.00'}
            </Text>
            
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Income</Text>
                <Text style={[styles.summaryAmount, styles.incomeAmount]}>
                  +₹{summary?.income ? Math.abs(parseFloat(summary.income)).toFixed(2) : '0.00'}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Expenses</Text>
                <Text style={[styles.summaryAmount, styles.expenseAmount]}>
                  -₹{summary?.expenses ? Math.abs(parseFloat(summary.expenses)).toFixed(2) : '0.00'}
                </Text>
              </View>
            </View>
          </View>

          {/* Recent Transactions */}
          <View style={styles.transactionsSection}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            
            {transactions && transactions.length > 0 ? (
              transactions.map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionLeft}>
                    <View style={styles.transactionIcon}>
                      <Text style={styles.iconText}>
                        {getCategoryIcon(transaction.category)}
                      </Text>
                    </View>
                    <View style={styles.transactionDetails}>
                      <Text style={styles.transactionTitle}>{transaction.title}</Text>
                      <Text style={styles.transactionCategory}>
                        {transaction.category} • {formatDate(transaction.created_at)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text style={[
                      styles.transactionAmount,
                      parseFloat(transaction.amount) >= 0 ? styles.positiveAmount : styles.negativeAmount
                    ]}>
                      {formatAmount(transaction.amount)}
                    </Text>
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => handleDeleteTransaction(transaction.id)}
                    >
                      <Text style={styles.deleteButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No transactions yet</Text>
                <Text style={styles.emptyStateSubtext}>Add your first transaction to get started</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SignedIn>

      <SignedOut>
        <View style={styles.authContainer}>
          <Text style={styles.authTitle}>Welcome to Finance Tracker</Text>
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity style={styles.authButton}>
              <Text style={styles.authButtonText}>Sign in</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity style={[styles.authButton, styles.signUpButtonAuth]}>
              <Text style={[styles.authButtonText, styles.signUpButtonText]}>Sign up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </SignedOut>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F3',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#B8860B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 2,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButton: {
    backgroundColor: '#B8860B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
  },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#888888',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: '600',
  },
  incomeAmount: {
    color: '#10B981',
  },
  expenseAmount: {
    color: '#EF4444',
  },
  transactionsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  transactionItem: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 12,
    color: '#888888',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  positiveAmount: {
    color: '#10B981',
  },
  negativeAmount: {
    color: '#EF4444',
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#888888',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 40,
    textAlign: 'center',
  },
  authButton: {
    backgroundColor: '#B8860B',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signUpButtonAuth: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#B8860B',
  },
  signUpButtonText: {
    color: '#B8860B',
  },
})