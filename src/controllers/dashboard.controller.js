const dashboardService = require('../services/dashboard.service');

const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user.id; // Assuming auth middleware sets req.user

    const dashboardData = await dashboardService.getDashboardData(userId);

    res.status(200).json({
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: dashboardData
    });
  } catch (error) {
    console.error('Dashboard controller error:', error);
    const err = new Error('Failed to retrieve dashboard data');
    err.statusCode = 500;
    next(err);
  }
};

module.exports = {
  getDashboardData
};
