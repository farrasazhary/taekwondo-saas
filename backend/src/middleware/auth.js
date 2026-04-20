const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

/**
 * Authentication middleware.
 * Extracts JWT from HTTP-only cookie, verifies it, and fetches the latest 
 * user data from the database to ensure roles and permissions are up-to-date.
 */
const authenticate = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user from DB to handle real-time role/status changes without logout
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        role: true,
        status: true,
        email: true,
        name: true
      }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "User no longer exists." });
    }

    if (user.status !== "active") {
      return res.status(403).json({ success: false, message: "Your account is inactive." });
    }

    req.user = user; // Attach database user (id, role, etc) to request
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

/**
 * Authorization middleware factory.
 * Restricts access to users with any of the specified roles.
 *
 * @param  {...string} allowedRoles - Roles permitted to access the route.
 * @example router.get("/admin", authenticate, authorize("club_admin", "superadmin"), handler);
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Insufficient permissions." });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
