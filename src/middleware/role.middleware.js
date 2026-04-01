exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || (!req.user.role_id && !req.user.role_name)) {
      return res.status(403).json({
        success: false,
        message: 'Missing user role information'
      });
    }

    let roleName;
    if (req.user.role_name) {
      roleName = req.user.role_name;
    } else if (typeof req.user.role_id === 'object' && req.user.role_id.role_name) {
      roleName = req.user.role_id.role_name;
    } else {
      roleName = req.user.role_id;
    }

    if (!roleName || !allowedRoles.includes(roleName)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource'
      });
    }

    next();
  };
};