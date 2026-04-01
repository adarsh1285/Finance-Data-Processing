const Transaction = require('../models/transaction.model');
const mongoose = require('mongoose');

class DashboardService {
  async getDashboardData(userId) {
    try {
      // Convert string userId to ObjectId if needed
      const userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

      // Main aggregation pipeline for dashboard data
      const dashboardData = await Transaction.aggregate([
        // Match transactions for the specific user
        {
          $match: {
            user_id: userObjectId
          }
        },
        // Add computed fields for easier aggregation
        {
          $addFields: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            isIncome: { $eq: ['$type', 'income'] },
            isExpense: { $eq: ['$type', 'expense'] }
          }
        },
        // Create separate facets for different aggregations
        {
          $facet: {
            // Total income, expenses, and net balance
            totals: [
              {
                $group: {
                  _id: null,
                  totalIncome: {
                    $sum: {
                      $cond: {
                        if: '$isIncome',
                        then: '$amount',
                        else: 0
                      }
                    }
                  },
                  totalExpenses: {
                    $sum: {
                      $cond: {
                        if: '$isExpense',
                        then: '$amount',
                        else: 0
                      }
                    }
                  }
                }
              },
              {
                $addFields: {
                  netBalance: { $subtract: ['$totalIncome', '$totalExpenses'] }
                }
              }
            ],

            // Category totals
            categoryTotals: [
              {
                $group: {
                  _id: {
                    category: '$category',
                    type: '$type'
                  },
                  total: { $sum: '$amount' },
                  count: { $sum: 1 }
                }
              },
              {
                $group: {
                  _id: '$_id.category',
                  income: {
                    $sum: {
                      $cond: {
                        if: { $eq: ['$_id.type', 'income'] },
                        then: '$total',
                        else: 0
                      }
                    }
                  },
                  expenses: {
                    $sum: {
                      $cond: {
                        if: { $eq: ['$_id.type', 'expense'] },
                        then: '$total',
                        else: 0
                      }
                    }
                  },
                  transactionCount: { $sum: '$count' }
                }
              },
              {
                $addFields: {
                  net: { $subtract: ['$income', '$expenses'] }
                }
              },
              {
                $sort: { net: -1 }
              }
            ],

            // Recent activity (last 10 transactions)
            recentActivity: [
              {
                $sort: { date: -1, created_at: -1 }
              },
              {
                $limit: 10
              },
              {
                $project: {
                  _id: 1,
                  amount: 1,
                  type: 1,
                  category: 1,
                  date: 1,
                  notes: 1,
                  created_at: 1
                }
              }
            ],

            // Monthly trends (last 12 months)
            monthlyTrends: [
              {
                $group: {
                  _id: {
                    year: '$year',
                    month: '$month'
                  },
                  income: {
                    $sum: {
                      $cond: {
                        if: '$isIncome',
                        then: '$amount',
                        else: 0
                      }
                    }
                  },
                  expenses: {
                    $sum: {
                      $cond: {
                        if: '$isExpense',
                        then: '$amount',
                        else: 0
                      }
                    }
                  },
                  transactionCount: { $sum: 1 }
                }
              },
              {
                $addFields: {
                  net: { $subtract: ['$income', '$expenses'] },
                  period: {
                    $dateFromParts: {
                      year: '$_id.year',
                      month: '$_id.month',
                      day: 1
                    }
                  }
                }
              },
              {
                $sort: { '_id.year': -1, '_id.month': -1 }
              },
              {
                $limit: 12
              },
              {
                $project: {
                  _id: 0,
                  period: 1,
                  year: '$_id.year',
                  month: '$_id.month',
                  income: 1,
                  expenses: 1,
                  net: 1,
                  transactionCount: 1
                }
              },
              {
                $sort: { period: 1 }
              }
            ]
          }
        }
      ]);

      // Extract data from facets
      const result = dashboardData[0] || {};

      // Handle case where user has no transactions
      const totals = (result.totals && result.totals[0]) || {
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0
      };

      return {
        totalIncome: totals.totalIncome,
        totalExpenses: totals.totalExpenses,
        netBalance: totals.netBalance,
        categoryTotals: result.categoryTotals || [],
        recentActivity: result.recentActivity || [],
        monthlyTrends: result.monthlyTrends || []
      };

    } catch (error) {
      throw new Error(`Dashboard data aggregation failed: ${error.message}`);
    }
  }
}

module.exports = new DashboardService();
